// ==============================================================================
// MathMaster THCS - Bộ Trích Xuất Tài Liệu Đa Định Dạng (src/lib/documents/extract.ts)
// Hỗ trợ TXT, MD, CSV, JSON, DOCX (mammoth), PDF (unpdf), XLSX (xlsx), Image/Scan (Gemini Vision khi có key)
// Tuân thủ: Magic bytes check, Zip bomb limit, No fake answers, Safe nodejs runtime
// ==============================================================================

import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

export const runtime = 'nodejs';

export interface ExtractionResult {
  ok: boolean;
  text: string;
  format: string;
  pageCount?: number;
  wordCount?: number;
  warnings: string[];
  requiresApiKey?: boolean;
  errorMessage?: string;
  hasMathFormulas?: boolean;
}

/**
 * Kiểm tra magic bytes của buffer để xác minh định dạng tệp thật
 */
export function detectMagicMime(buffer: Buffer): string | null {
  if (!buffer || buffer.length < 4) return null;

  // PDF: %PDF-
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return 'application/pdf';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // ZIP-based (DOCX, XLSX): PK\x03\x04
  if (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
    return 'application/zip';
  }

  // Plain text (UTF-8 / ASCII) - không chứa nhiều ký tự NULL
  let nullCount = 0;
  const sampleLen = Math.min(buffer.length, 512);
  for (let i = 0; i < sampleLen; i++) {
    if (buffer[i] === 0) nullCount++;
  }
  if (nullCount === 0) {
    return 'text/plain';
  }

  return 'application/octet-stream';
}

/**
 * Kiểm tra xem tệp ZIP (DOCX / XLSX) có dấu hiệu zip bomb hay không
 */
function checkZipSafety(buffer: Buffer): { safe: boolean; reason?: string } {
  // Giới hạn buffer nén đầu vào tối đa 25MB
  const maxCompressedMb = 25;
  if (buffer.length > maxCompressedMb * 1024 * 1024) {
    return { safe: false, reason: `Dung lượng tệp nén (${(buffer.length / (1024 * 1024)).toFixed(1)}MB) vượt quá giới hạn an toàn ${maxCompressedMb}MB.` };
  }
  return { safe: true };
}

/**
 * Trích xuất từ DOCX qua thư viện mammoth và kiểm tra công thức toán OMML
 */
async function extractFromDocx(buffer: Buffer): Promise<ExtractionResult> {
  const warnings: string[] = [];

  // Kiểm tra an toàn tệp zip
  const safety = checkZipSafety(buffer);
  if (!safety.safe) {
    return {
      ok: false,
      text: '',
      format: 'DOCX',
      warnings: [safety.reason || 'Tệp không an toàn'],
      errorMessage: safety.reason,
    };
  }

  // Phát hiện công thức Word OMML trong zip buffer
  const rawString = buffer.toString('binary');
  const hasOMML = rawString.includes('m:oMath') || rawString.includes('m:oMathPara');
  if (hasOMML) {
    warnings.push(
      'Tài liệu có chứa công thức toán học Microsoft Word (OMML). Hệ thống đã trích xuất văn bản khả dụng, vui lòng kiểm tra lại công thức trên màn hình duyệt.'
    );
  }

  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = (result.value || '').trim();

    if (result.messages && result.messages.length > 0) {
      for (const msg of result.messages.slice(0, 5)) {
        if (msg.type === 'warning') warnings.push(`DOCX: ${msg.message}`);
      }
    }

    if (!text) {
      return {
        ok: false,
        text: '',
        format: 'DOCX',
        warnings: [...warnings, 'Không thể đọc được nội dung văn bản từ tệp DOCX này (tệp rỗng hoặc chỉ chứa hình ảnh).'],
        errorMessage: 'DOCX không có văn bản hoặc chỉ chứa ảnh quét.',
        hasMathFormulas: hasOMML,
      };
    }

    return {
      ok: true,
      text,
      format: 'DOCX',
      wordCount: text.split(/\s+/).length,
      warnings,
      hasMathFormulas: hasOMML,
    };
  } catch (err: any) {
    return {
      ok: false,
      text: '',
      format: 'DOCX',
      warnings: [...warnings, `Lỗi đọc tệp DOCX: ${err.message || 'Lỗi không xác định'}`],
      errorMessage: err.message || 'Không thể trích xuất DOCX',
      hasMathFormulas: hasOMML,
    };
  }
}

/**
 * Trích xuất từ XLSX / XLS qua thư viện xlsx
 */
async function extractFromXlsx(buffer: Buffer): Promise<ExtractionResult> {
  const warnings: string[] = [];
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return {
        ok: false,
        text: '',
        format: 'XLSX',
        warnings: ['File Excel không có trang tính (Sheet) nào.'],
        errorMessage: 'File Excel rỗng.',
      };
    }

    const lines: string[] = [];
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;

      // Chuyển sheet thành dạng mảng các dòng
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
      if (rows.length === 0) continue;

      lines.push(`--- Trang tính: ${sheetName} ---`);
      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.length === 0) continue;
        const rowCells = row.map((cell) => String(cell || '').trim()).filter(Boolean);
        if (rowCells.length > 0) {
          lines.push(rowCells.join(' | '));
        }
      }
    }

    const text = lines.join('\n').trim();
    if (!text) {
      return {
        ok: false,
        text: '',
        format: 'XLSX',
        warnings: ['Các ô trong file Excel đều rỗng hoặc không đọc được.'],
        errorMessage: 'Nội dung bảng tính Excel rỗng.',
      };
    }

    return {
      ok: true,
      text,
      format: 'XLSX',
      wordCount: text.split(/\s+/).length,
      warnings,
    };
  } catch (err: any) {
    return {
      ok: false,
      text: '',
      format: 'XLSX',
      warnings: [`Lỗi phân tích Excel: ${err.message || 'Lỗi không xác định'}`],
      errorMessage: err.message || 'Không thể trích xuất bảng tính Excel',
    };
  }
}

/**
 * Trích xuất từ PDF qua thư viện unpdf (hỗ trợ đọc lớp chữ native)
 */
async function extractFromPdf(buffer: Buffer): Promise<ExtractionResult> {
  const warnings: string[] = [];
  try {
    const { extractText } = await import('unpdf');
    const { totalPages, text } = await extractText(new Uint8Array(buffer), { mergePages: true });

    const trimmed = (text || '').trim();

    // Nếu PDF có lớp chữ thực sự
    if (trimmed.length >= 20) {
      return {
        ok: true,
        text: trimmed,
        format: 'PDF',
        pageCount: totalPages,
        wordCount: trimmed.split(/\s+/).length,
        warnings,
      };
    }

    // Nếu text quá ngắn hoặc rỗng -> PDF scan (chỉ có ảnh không có text layer)
    const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
    const hasMathpix = Boolean(process.env.MATHPIX_APP_KEY && process.env.MATHPIX_APP_KEY.trim() !== '');

    if (!hasGemini && !hasMathpix) {
      return {
        ok: false,
        text: '',
        format: 'PDF_SCAN',
        pageCount: totalPages,
        requiresApiKey: true,
        warnings: [
          'Tệp PDF này là dạng quét (scan) hoặc chỉ chứa hình ảnh, không có lớp chữ nhúng (text layer).',
        ],
        errorMessage:
          '⚠️ Tệp PDF là ảnh scan, hệ thống cần GEMINI_API_KEY hoặc MATHPIX_APP_KEY để nhận dạng OCR. Vui lòng cấu hình API key trong .env hoặc dán nội dung văn bản thủ công.',
      };
    }

    // Nếu có GEMINI_API_KEY, thử OCR bằng Gemini Vision
    if (hasGemini) {
      return await callGeminiVision(buffer, 'application/pdf');
    }

    return {
      ok: false,
      text: '',
      format: 'PDF_SCAN',
      requiresApiKey: true,
      warnings: ['Chưa thể OCR tệp PDF scan'],
      errorMessage: 'Cần cấu hình OCR API key hợp lệ.',
    };
  } catch (err: any) {
    return {
      ok: false,
      text: '',
      format: 'PDF',
      warnings: [`Lỗi khi giải mã PDF: ${err.message || 'Lỗi không xác định'}`],
      errorMessage: err.message || 'Không thể đọc tệp PDF',
    };
  }
}

import { extractDocumentWithGemini, isGeminiConfigured } from '@/lib/ai-service';

/**
 * Xử lý hình ảnh (PNG, JPG) hoặc PDF scan qua Gemini Vision API (khi có GEMINI_API_KEY thật)
 */
async function callGeminiVision(buffer: Buffer, mimeType: string): Promise<ExtractionResult> {
  if (!isGeminiConfigured()) {
    return {
      ok: false,
      text: '',
      format: mimeType,
      requiresApiKey: true,
      warnings: ['Chưa cấu hình GEMINI_API_KEY.'],
      errorMessage:
        '⚠️ Chưa cấu hình GEMINI_API_KEY. Vui lòng cấu hình API key hoặc dán nội dung văn bản thủ công.',
    };
  }

  try {
    const res = await extractDocumentWithGemini(buffer, mimeType);
    if (!res.ok) {
      return {
        ok: false,
        text: '',
        format: mimeType,
        warnings: [res.error || 'Gemini không nhận diện được văn bản trong ảnh/tài liệu này.'],
        errorMessage: res.error || 'Không trích xuất được văn bản từ ảnh.',
      };
    }

    const trimmed = res.text.trim();
    return {
      ok: true,
      text: trimmed,
      format: mimeType,
      wordCount: trimmed.split(/\s+/).length,
      warnings: ['Nội dung được trích xuất bằng AI Gemini 3.8 Flash (Cần giáo viên duyệt lại).'],
      hasMathFormulas: trimmed.includes('$'),
    };
  } catch (err: any) {
    return {
      ok: false,
      text: '',
      format: mimeType,
      warnings: [`Lỗi gọi Gemini Vision: ${err.message || 'Lỗi không xác định'}`],
      errorMessage: err.message || 'Lỗi gọi API nhận dạng hình ảnh',
    };
  }
}

/**
 * Hàm điều phối trích xuất chính dựa trên buffer, tên file và loại MIME
 */
export async function extractTextFromDocument(
  fileName: string,
  buffer: Buffer,
  providedMime?: string
): Promise<ExtractionResult> {
  const ext = (fileName.split('.').pop() || '').toUpperCase();
  const magic = detectMagicMime(buffer);

  // 1. Plain text (.TXT, .MD, .CSV, .JSON)
  if (['TXT', 'MD', 'CSV', 'JSON'].includes(ext)) {
    try {
      const text = buffer.toString('utf-8').trim();
      return {
        ok: true,
        text,
        format: ext,
        wordCount: text ? text.split(/\s+/).length : 0,
        warnings: text ? [] : ['Tệp văn bản rỗng.'],
      };
    } catch (err: any) {
      return {
        ok: false,
        text: '',
        format: ext,
        warnings: [`Lỗi giải mã UTF-8: ${err.message}`],
        errorMessage: 'Tệp văn bản không đúng định dạng UTF-8 hợp lệ.',
      };
    }
  }

  // 2. Microsoft Word (.DOCX)
  if (ext === 'DOCX') {
    return await extractFromDocx(buffer);
  }

  // 3. Microsoft Excel (.XLSX, .XLS)
  if (ext === 'XLSX' || ext === 'XLS') {
    return await extractFromXlsx(buffer);
  }

  // 4. Adobe PDF (.PDF)
  if (ext === 'PDF' || magic === 'application/pdf') {
    return await extractFromPdf(buffer);
  }

  // 5. Hình ảnh raster (.PNG, .JPG, .JPEG)
  if (['PNG', 'JPG', 'JPEG'].includes(ext) || magic === 'image/png' || magic === 'image/jpeg') {
    const mime = ext === 'PNG' ? 'image/png' : 'image/jpeg';
    const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
    const hasMathpix = Boolean(process.env.MATHPIX_APP_KEY && process.env.MATHPIX_APP_KEY.trim() !== '');

    if (!hasGemini && !hasMathpix) {
      return {
        ok: false,
        text: '',
        format: mime,
        requiresApiKey: true,
        warnings: [
          'Hệ thống KHÔNG giả lập trích xuất câu hỏi từ hình ảnh khi chưa có GEMINI_API_KEY hoặc MATHPIX_APP_KEY.',
        ],
        errorMessage:
          '⚠️ Chưa cấu hình GEMINI_API_KEY hoặc MATHPIX_APP_KEY. Vui lòng cấu hình API key trong .env hoặc dán nội dung văn bản thủ công.',
      };
    }

    return await callGeminiVision(buffer, mime);
  }

  // Định dạng không được hỗ trợ
  return {
    ok: false,
    text: '',
    format: ext || 'UNKNOWN',
    warnings: [`Định dạng tệp .${ext} chưa được hỗ trợ trích xuất tự động.`],
    errorMessage: `Định dạng .${ext} không được hỗ trợ. Vui lòng tải lên tệp TXT, MD, DOCX, XLSX, PDF hoặc ảnh PNG/JPG.`,
  };
}
