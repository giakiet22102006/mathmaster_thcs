// ==============================================================================
// MathMaster THCS - Bộ Tách Đoạn & Phân Loại Câu Hỏi Từ Tài Liệu (src/lib/documents/segment.ts)
// Bóc tách câu hỏi, phương án A-D, đáp án, lời giải, chuẩn hóa LaTeX,
// Suy luận lớp, chương, mức nhận thức, dạng bài theo chuẩn GDPT 2018 (PHẦN A)
// Tuyệt đối không tạo câu giả hoặc gán đáp án giả '1' khi không tìm thấy.
// ==============================================================================

import type { CognitiveLevel, Difficulty, QuestionType } from '@/lib/question-engine/types';

export interface ParsedDocumentItem {
  id: string;
  order: number;
  rawText: string;
  content: string;
  type: QuestionType;
  options?: Array<{ label: string; content: string; isCorrect: boolean }>;
  correctAnswer: string;
  solution?: string;
  grade: number;
  chapterId: string;
  topic?: string;
  problemType?: string;
  cognitiveLevel: CognitiveLevel;
  difficulty: Difficulty;
  defaultPoints: number;
  confidence: 'high' | 'medium' | 'low';
  needsReview: boolean;
  reviewReason?: string;
  verificationStatus: 'verified' | 'draft';
}

export interface SegmentationResult {
  items: ParsedDocumentItem[];
  warnings: string[];
  totalExtracted: number;
  needsReviewCount: number;
}

// Từ điển ánh xạ từ khóa chương học theo GDPT 2018 THCS
const CHAPTER_KEYWORD_MAP: Array<{
  grade: number;
  chapterId: string;
  title: string;
  keywords: string[];
  primaryProblemTypes: string[];
}> = [
  // LỚP 6
  {
    grade: 6,
    chapterId: 'G6_C1',
    title: 'Tập hợp các số tự nhiên',
    keywords: ['tập hợp', 'số tự nhiên', 'phép chia hết', 'bội chung', 'ước chung', 'ucln', 'bcnn', 'số nguyên tố', 'hợp số', 'lũy thừa với số mũ tự nhiên'],
    primaryProblemTypes: ['Thực hiện phép tính với số tự nhiên', 'Tìm ƯCLN và BCNN', 'Tìm x trong tập hợp số tự nhiên'],
  },
  {
    grade: 6,
    chapterId: 'G6_C2',
    title: 'Số nguyên',
    keywords: ['số nguyên', 'số nguyên âm', 'giá trị tuyệt đối', 'cộng trừ số nguyên', 'nhân chia số nguyên', 'bội và ước của số nguyên'],
    primaryProblemTypes: ['Thực hiện phép tính số nguyên', 'Tìm số nguyên x', 'Bài toán thực tế số nguyên âm'],
  },
  {
    grade: 6,
    chapterId: 'G6_C3',
    title: 'Các hình phẳng trong thực tiễn',
    keywords: ['tam giác đều', 'hình vuông', 'lục giác đều', 'hình chữ nhật', 'hình thoi', 'hình bình hành', 'hình thang cân', 'chu vi và diện tích'],
    primaryProblemTypes: ['Tính chu vi diện tích hình phẳng', 'Nhận biết hình thực tiễn'],
  },
  {
    grade: 6,
    chapterId: 'G6_C4',
    title: 'Phân số và Số thập phân',
    keywords: ['phân số', 'rút gọn phân số', 'hỗn số', 'số thập phân', 'phần trăm', 'tính giá trị phân số của một số'],
    primaryProblemTypes: ['Tính toán phân số và số thập phân', 'Tìm x với phân số', 'Bài toán tỉ số phần trăm'],
  },
  {
    grade: 6,
    chapterId: 'G6_C5',
    title: 'Hình học phẳng cơ bản',
    keywords: ['điểm', 'đường thẳng', 'tia', 'đoạn thẳng', 'độ dài đoạn thẳng', 'trung điểm', 'góc', 'số đo góc'],
    primaryProblemTypes: ['Tính độ dài đoạn thẳng', 'Xác định trung điểm', 'Tính số đo góc'],
  },
  {
    grade: 6,
    chapterId: 'G6_C6',
    title: 'Thống kê và Xác suất thực nghiệm',
    keywords: ['thống kê', 'thu thập dữ liệu', 'bảng số liệu', 'biểu đồ tranh', 'biểu đồ cột', 'xác suất thực nghiệm', 'tung đồng xu', 'xúc xắc'],
    primaryProblemTypes: ['Đọc biểu đồ thống kê', 'Tính xác suất thực nghiệm'],
  },

  // LỚP 7
  {
    grade: 7,
    chapterId: 'G7_C1',
    title: 'Số hữu tỉ',
    keywords: ['số hữu tỉ', 'tập hợp q', 'cộng trừ nhân chia số hữu tỉ', 'lũy thừa của số hữu tỉ', 'thứ tự thực hiện phép tính hữu tỉ'],
    primaryProblemTypes: ['Tính giá trị biểu thức số hữu tỉ', 'Tìm x số hữu tỉ', 'Lũy thừa số hữu tỉ'],
  },
  {
    grade: 7,
    chapterId: 'G7_C2',
    title: 'Số thực',
    keywords: ['căn bậc hai số học', 'số vô tỉ', 'số thực', 'tập hợp r', 'trục số', 'làm tròn số', 'ước lượng'],
    primaryProblemTypes: ['Tính căn bậc hai số học', 'Làm tròn số thực', 'So sánh số thực'],
  },
  {
    grade: 7,
    chapterId: 'G7_C3',
    title: 'Góc và đường thẳng song song',
    keywords: ['hai góc kề bù', 'hai góc đối đỉnh', 'tia phân giác', 'hai đường thẳng song song', 'so le trong', 'đồng vị', 'định lý'],
    primaryProblemTypes: ['Tính số đo góc kề bù đối đỉnh', 'Chứng minh hai đường thẳng song song'],
  },
  {
    grade: 7,
    chapterId: 'G7_C4',
    title: 'Tam giác bằng nhau',
    keywords: ['tam giác bằng nhau', 'c-c-c', 'c-g-c', 'g-c-g', 'tam giác cân', 'tam giác đều', 'đường trung trực'],
    primaryProblemTypes: ['Chứng minh tam giác bằng nhau', 'Chứng minh tam giác cân', 'Tính góc và cạnh tam giác'],
  },
  {
    grade: 7,
    chapterId: 'G7_C5',
    title: 'Thu thập và biểu diễn dữ liệu',
    keywords: ['biểu đồ hình quạt tròn', 'biểu đồ đoạn thẳng', 'phân tích dữ liệu', 'tần số tương đối'],
    primaryProblemTypes: ['Đọc biểu đồ hình quạt tròn', 'Biểu diễn dữ liệu bằng biểu đồ'],
  },
  {
    grade: 7,
    chapterId: 'G7_C6',
    title: 'Biểu thức đại số và đa thức một biến',
    keywords: ['biểu thức đại số', 'đa thức một biến', 'nghiệm của đa thức', 'cộng trừ đa thức một biến', 'nhân chia đa thức một biến'],
    primaryProblemTypes: ['Thu gọn và sắp xếp đa thức', 'Cộng trừ đa thức một biến', 'Tìm nghiệm đa thức'],
  },

  // LỚP 8
  {
    grade: 8,
    chapterId: 'G8_C1',
    title: 'Đa thức và hằng đẳng thức',
    keywords: ['đơn thức', 'đa thức nhiều biến', 'hằng đẳng thức', 'phân tích đa thức thành nhân tử', 'bình phương của một tổng', 'hiệu hai bình phương', 'lập phương'],
    primaryProblemTypes: ['Rút gọn biểu thức hằng đẳng thức', 'Phân tích đa thức thành nhân tử', 'Tìm giá trị lớn nhất nhỏ nhất của đa thức'],
  },
  {
    grade: 8,
    chapterId: 'G8_C2',
    title: 'Phân thức đại số',
    keywords: ['phân thức đại số', 'rút gọn phân thức', 'quy đồng mẫu thức', 'cộng trừ nhân chia phân thức', 'điều kiện xác định phân thức'],
    primaryProblemTypes: ['Rút gọn phân thức', 'Thực hiện phép tính phân thức', 'Tìm giá trị x nguyên để phân thức nguyên'],
  },
  {
    grade: 8,
    chapterId: 'G8_C3',
    title: 'Hàm số và đồ thị',
    keywords: ['hàm số', 'đồ thị hàm số', 'hàm số bậc nhất', 'y = ax + b', 'hệ số góc', 'hai đường thẳng song song cắt nhau'],
    primaryProblemTypes: ['Xác định hàm số bậc nhất', 'Vẽ đồ thị hàm số', 'Tìm tọa độ giao điểm'],
  },
  {
    grade: 8,
    chapterId: 'G8_C4',
    title: 'Tứ giác và định lý Ta-lét',
    keywords: ['tứ giác', 'hình thang', 'hình thang cân', 'hình bình hành', 'hình thoi', 'hình chữ nhật', 'hình vuông', 'định lý talet', 'định lý ta-lét', 'đoạn thẳng tỉ lệ'],
    primaryProblemTypes: ['Chứng minh tứ giác đặc biệt', 'Áp dụng định lý Ta-lét tính độ dài', 'Chứng minh đường thẳng song song'],
  },
  {
    grade: 8,
    chapterId: 'G8_C5',
    title: 'Tam giác đồng dạng',
    keywords: ['tam giác đồng dạng', 'trường hợp đồng dạng', 'cạnh-cạnh-cạnh', 'cạnh-góc-cạnh', 'góc-góc', 'định lý pytago', 'hình học không gian'],
    primaryProblemTypes: ['Chứng minh hai tam giác đồng dạng', 'Tính tỉ số đồng dạng và diện tích', 'Ứng dụng thực tế đồng dạng'],
  },

  // LỚP 9
  {
    grade: 9,
    chapterId: 'G9_C1',
    title: 'Phương trình và hệ phương trình',
    keywords: ['phương trình bậc nhất hai ẩn', 'hệ hai phương trình', 'phương trình quy về bậc nhất', 'giải bài toán bằng cách lập hệ phương trình'],
    primaryProblemTypes: ['Giải hệ phương trình', 'Giải toán bằng cách lập hệ phương trình', 'Hệ phương trình chứa tham số'],
  },
  {
    grade: 9,
    chapterId: 'G9_C2',
    title: 'Phương trình bậc hai một ẩn',
    keywords: ['phương trình bậc hai', 'công thức nghiệm', 'biệt thức delta', 'định lý vi-et', 'định lý viet', 'nghiệm kép', 'hệ thức vi-et'],
    primaryProblemTypes: ['Giải phương trình bậc hai', 'Ứng dụng định lý Vi-ét', 'Phương trình bậc hai chứa tham số m'],
  },
  {
    grade: 9,
    chapterId: 'G9_C3',
    title: 'Căn thức bậc hai và căn bậc ba',
    keywords: ['căn thức bậc hai', 'hằng đẳng thức căn', 'khử mẫu biểu thức lấy căn', 'trục căn thức ở mẫu', 'rút gọn biểu thức chứa căn'],
    primaryProblemTypes: ['Rút gọn biểu thức chứa căn', 'Tính giá trị biểu thức căn', 'Giải phương trình vô tỉ'],
  },
  {
    grade: 9,
    chapterId: 'G9_C4',
    title: 'Hệ thức lượng trong tam giác vuông',
    keywords: ['hệ thức lượng', 'tam giác vuông', 'tỉ số lượng giác', 'sin', 'cos', 'tan', 'cot', 'góc nhọn'],
    primaryProblemTypes: ['Tính độ dài cạnh và đường cao trong tam giác vuông', 'Giải tam giác vuông', 'Bài toán thực tế tỉ số lượng giác'],
  },
  {
    grade: 9,
    chapterId: 'G9_C5',
    title: 'Đường tròn và góc với đường tròn',
    keywords: ['đường tròn', 'dây cung', 'tiếp tuyến của đường tròn', 'góc ở tâm', 'góc nội tiếp', 'tứ giác nội tiếp', 'cung và dây'],
    primaryProblemTypes: ['Chứng minh tiếp tuyến đường tròn', 'Tính số đo góc với đường tròn', 'Chứng minh tứ giác nội tiếp'],
  },
  {
    grade: 9,
    chapterId: 'G9_C6',
    title: 'Hình học không gian (Hình trụ, Hình nón, Hình cầu)',
    keywords: ['hình trụ', 'hình nón', 'hình cầu', 'diện tích xung quanh', 'diện tích toàn phần', 'thể tích hình khối', 'bán kính đáy', 'đường sinh'],
    primaryProblemTypes: ['Tính diện tích và thể tích hình trụ', 'Tính diện tích và thể tích hình nón', 'Tính diện tích và thể tích hình cầu'],
  },
];

/**
 * Chuẩn hóa các ký tự Unicode phổ biến sang mã LaTeX chuẩn
 */
export function normalizeMathUnicode(text: string): string {
  if (!text) return '';
  return text
    .replace(/[²\u00B2]/g, '^2')
    .replace(/[³\u00B3]/g, '^3')
    .replace(/[⁴\u2074]/g, '^4')
    .replace(/[√\u221A]/g, '\\sqrt')
    .replace(/[≤\u2264]/g, '\\le ')
    .replace(/[≥\u2265]/g, '\\ge ')
    .replace(/[≠\u2260]/g, '\\ne ')
    .replace(/[×\u00D7]/g, ' \\times ')
    .replace(/[÷\u00F7]/g, ' \\div ')
    .replace(/[±\u00B1]/g, ' \\pm ')
    .replace(/[°\u00B0]/g, '^\\circ ')
    .replace(/[π\u03C0]/g, '\\pi ')
    .replace(/[α\u03B1]/g, '\\alpha ')
    .replace(/[β\u03B2]/g, '\\beta ')
    .replace(/[Δ\u0394]/g, '\\Delta ');
}

/**
 * Trích xuất bảng đáp án ở cuối văn bản và cắt bỏ phần bảng đó khỏi nội dung câu hỏi
 */
function extractAnswerTable(text: string): { map: Map<number, string>; cleanText: string } {
  const map = new Map<number, string>();
  const lower = text.toLowerCase();

  let idx = lower.lastIndexOf('bảng đáp án');
  if (idx === -1) idx = lower.lastIndexOf('bang dap an');
  if (idx === -1) idx = lower.lastIndexOf('đáp án trắc nghiệm');

  if (idx === -1) {
    return { map, cleanText: text };
  }

  const tableStr = text.slice(idx);
  const cleanText = text.slice(0, idx).trim();

  const itemRegex = /(?:câu\s*|cau\s*)?(\d+)\s*[-.:=]\s*([A-D])\b/gi;
  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(tableStr)) !== null) {
    const qNum = parseInt(m[1], 10);
    const ans = m[2].toUpperCase();
    map.set(qNum, ans);
  }

  return { map, cleanText };
}

/**
 * Tách một khối văn bản thành nội dung câu hỏi và các lựa chọn A, B, C, D
 */
function parseOptionsAndContent(block: string): {
  content: string;
  options?: Array<{ label: string; content: string; isCorrect: boolean }>;
  detectedAnswer?: string;
  solution?: string;
  type: QuestionType;
} {
  let workingText = block;

  // 1. Tách lời giải / hướng dẫn giải
  let solution: string | undefined = undefined;
  const solLower = workingText.toLowerCase();
  let solIdx = -1;
  for (const kw of ['lời giải:', 'loi giai:', 'hướng dẫn giải:', 'giải chi tiết:', 'hướng dẫn:']) {
    const kIdx = solLower.lastIndexOf(kw);
    if (kIdx !== -1 && kIdx > solIdx) {
      solIdx = kIdx;
    }
  }
  if (solIdx !== -1) {
    const colonPos = workingText.indexOf(':', solIdx);
    solution = workingText.slice(colonPos + 1).trim();
    workingText = workingText.slice(0, solIdx).trim();
  }

  // 2. Tách đáp án chỉ định cụ thể trong khối câu hỏi
  let detectedAnswer: string | undefined = undefined;
  const ansMatch = workingText.match(/(?:^|\n)\s*(?:đáp án|dap an|chọn|key)[:\s]+([^\n\r]+)/i);
  if (ansMatch) {
    const rawAns = ansMatch[1].trim();
    const mcqLetterMatch = rawAns.match(/^([A-D])\b/i);
    if (mcqLetterMatch) {
      detectedAnswer = mcqLetterMatch[1].toUpperCase();
    } else {
      detectedAnswer = rawAns.replace(/[.;]+$/, '').trim();
    }
    workingText = workingText.replace(ansMatch[0], '').trim();
  }

  // 3. Tách phương án A, B, C, D
  const foundOptions: Array<{ label: string; content: string; isCorrect: boolean }> = [];
  let firstOptIndex = -1;

  // Thử tìm phương án trên nhiều dòng
  const lines = workingText.split('\n');
  const optLines: Array<{ lineIdx: number; label: string; content: string }> = [];

  for (let li = 0; li < lines.length; li++) {
    const l = lines[li].trim();
    const m = l.match(/^([A-D])[\).:]\s*(.+)$/i);
    if (m) {
      optLines.push({ lineIdx: li, label: m[1].toUpperCase(), content: m[2].trim() });
    }
  }

  if (optLines.length >= 2) {
    // Tìm thấy phương án trên các dòng riêng biệt
    firstOptIndex = workingText.indexOf(lines[optLines[0].lineIdx]);
    for (const ol of optLines) {
      foundOptions.push({
        label: ol.label,
        content: ol.content,
        isCorrect: detectedAnswer === ol.label,
      });
    }
  } else {
    // Thử tìm phương án inline (A. ... B. ... C. ... D. ...)
    const inlineMatch = workingText.match(/\bA[\).:]\s*(.+?)\s*B[\).:]\s*(.+?)\s*C[\).:]\s*(.+?)\s*D[\).:]\s*([^\n\r]+)/i);
    if (inlineMatch && inlineMatch.index !== undefined) {
      firstOptIndex = inlineMatch.index;
      foundOptions.push({ label: 'A', content: inlineMatch[1].trim(), isCorrect: detectedAnswer === 'A' });
      foundOptions.push({ label: 'B', content: inlineMatch[2].trim(), isCorrect: detectedAnswer === 'B' });
      foundOptions.push({ label: 'C', content: inlineMatch[3].trim(), isCorrect: detectedAnswer === 'C' });
      foundOptions.push({ label: 'D', content: inlineMatch[4].trim(), isCorrect: detectedAnswer === 'D' });
    }
  }

  const hasOptions = foundOptions.length >= 2;
  const content = (firstOptIndex !== -1 ? workingText.slice(0, firstOptIndex) : workingText).trim();

  return {
    content: normalizeMathUnicode(content),
    options: hasOptions ? foundOptions : undefined,
    detectedAnswer,
    solution: solution ? normalizeMathUnicode(solution) : undefined,
    type: hasOptions ? 'mcq' : 'essay',
  };
}

/**
 * Phân tích độ phức tạp để suy luận mức độ nhận thức (chuẩn PHẦN A)
 */
function inferCognitiveLevel(
  content: string,
  solution?: string,
  type: QuestionType = 'mcq'
): { level: CognitiveLevel; difficulty: Difficulty; points: number } {
  const combined = `${content} ${solution || ''}`.toLowerCase();

  // Dấu hiệu VDC (Vận dụng cao)
  const isVDC =
    combined.includes('giá trị lớn nhất') ||
    combined.includes('giá trị nhỏ nhất') ||
    combined.includes('bất đẳng thức') ||
    combined.includes('tìm m để') ||
    combined.includes('điểm cố định') ||
    combined.includes('cực trị') ||
    combined.includes('chứng minh rằng với mọi') ||
    combined.includes('nghiệm nguyên');

  if (isVDC) {
    return {
      level: 'van_dung_cao',
      difficulty: 'VERY_HARD',
      points: type === 'essay' ? 1.5 : 0.5,
    };
  }

  // Dấu hiệu VD (Vận dụng)
  const isVD =
    combined.includes('thực tế') ||
    combined.includes('bài toán thực tế') ||
    combined.includes('rút gọn và tính giá trị') ||
    combined.includes('giải bài toán bằng cách lập') ||
    combined.includes('chứng minh ba điểm thẳng hàng') ||
    combined.includes('chứng minh tiếp tuyến') ||
    combined.includes('chứng minh tứ giác nội tiếp') ||
    combined.includes('tìm x để biểu thức đạt giá trị nguyên');

  if (isVD) {
    return {
      level: 'van_dung',
      difficulty: 'HARD',
      points: type === 'essay' ? 1.0 : 0.25,
    };
  }

  // Dấu hiệu NB (Nhận biết)
  const isNB =
    combined.includes('khẳng định nào sau đây là đúng') ||
    combined.includes('chọn khẳng định sai') ||
    combined.includes('trong các khẳng định sau') ||
    combined.includes('là gì') ||
    combined.includes('đơn thức nào sau đây') ||
    combined.includes('bậc của đa thức') ||
    combined.includes('tập hợp nào sau đây');

  if (isNB) {
    return {
      level: 'nhan_biet',
      difficulty: 'EASY',
      points: type === 'essay' ? 0.5 : 0.25,
    };
  }

  // Mặc định: Thông hiểu (TH)
  return {
    level: 'thong_hieu',
    difficulty: 'MEDIUM',
    points: type === 'essay' ? 0.75 : 0.25,
  };
}

/**
 * Suy luận chương học từ nội dung bài toán dựa vào từ điển từ khóa
 */
function inferChapterAndTopic(
  content: string,
  targetGrade?: number,
  targetChapterId?: string
): { grade: number; chapterId: string; topic: string; problemType: string; score: number } {
  const lower = content.toLowerCase();

  let bestMatch: (typeof CHAPTER_KEYWORD_MAP)[0] | null = null;
  let highestScore = 0;

  for (const entry of CHAPTER_KEYWORD_MAP) {
    if (targetGrade && entry.grade !== targetGrade) continue;

    let score = 0;
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) {
        score += 2;
      }
    }
    if (entry.chapterId === targetChapterId) {
      score += 1;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && highestScore > 0) {
    return {
      grade: bestMatch.grade,
      chapterId: bestMatch.chapterId,
      topic: bestMatch.title,
      problemType: bestMatch.primaryProblemTypes[0] || 'Bài tập tổng hợp',
      score: highestScore,
    };
  }

  // Fallback nếu không khớp từ khóa
  const fallbackGrade = targetGrade || 8;
  const fallbackChapterId = targetChapterId || `G${fallbackGrade}_C1`;
  const fallbackEntry = CHAPTER_KEYWORD_MAP.find((c) => c.chapterId === fallbackChapterId);

  return {
    grade: fallbackGrade,
    chapterId: fallbackChapterId,
    topic: fallbackEntry?.title || 'Tài liệu cá nhân',
    problemType: fallbackEntry?.primaryProblemTypes[0] || 'Bài tập cơ bản',
    score: 0,
  };
}

/**
 * Hàm phân tách chính: Bóc tách tài liệu thành danh sách câu hỏi có cấu trúc
 */
export function segmentQuestionsFromText(
  rawText: string,
  context?: { grade?: number; chapterId?: string; defaultBook?: string }
): SegmentationResult {
  const warnings: string[] = [];
  const items: ParsedDocumentItem[] = [];

  const cleaned = (rawText || '').trim();
  if (!cleaned) {
    return {
      items: [],
      warnings: ['Tài liệu không có nội dung văn bản để phân tách.'],
      totalExtracted: 0,
      needsReviewCount: 0,
    };
  }

  // 1. Trích xuất bảng đáp án cuối tài liệu và tách phần văn bản câu hỏi
  const { map: answerTable, cleanText: questionsOnlyText } = extractAnswerTable(cleaned);

  // 2. Chia tài liệu thành các khối câu hỏi dựa trên tiêu đề nhận dạng:
  // "Câu 1:", "Câu 1.", "Bài 1:", "Question 1:", "Ví dụ 1:", hoặc số thứ tự ở đầu dòng "^1. " / "^1) "
  const questionBoundaryRegex = /(?:^|\n)\s*(?:(?:Câu|Cau|Bài|Bai|Question|Ví dụ|Vi du)\s*(\d+)[:.]?|(\d+)[\).]\s+)/gi;

  const indices: Array<{ index: number; questionNumber: number }> = [];
  let boundaryMatch: RegExpExecArray | null;

  while ((boundaryMatch = questionBoundaryRegex.exec(questionsOnlyText)) !== null) {
    const num = parseInt(boundaryMatch[1] || boundaryMatch[2], 10);
    indices.push({ index: boundaryMatch.index, questionNumber: num });
  }

  // Nếu không tìm thấy cấu trúc câu hỏi nào rõ ràng
  if (indices.length === 0) {
    warnings.push(
      'Không nhận diện được cấu trúc câu hỏi (Câu 1, Bài 1...). Vui lòng định dạng tài liệu với tiền tố "Câu 1:", "Bài 1:" hoặc nhập thủ công.'
    );
    return {
      items: [],
      warnings,
      totalExtracted: 0,
      needsReviewCount: 0,
    };
  }

  let needsReviewCounter = 0;

  for (let i = 0; i < indices.length; i++) {
    const start = indices[i].index;
    const end = i < indices.length - 1 ? indices[i + 1].index : questionsOnlyText.length;
    const rawBlock = questionsOnlyText.slice(start, end).trim();
    if (!rawBlock) continue;

    const qNum = indices[i].questionNumber || i + 1;
    const parsed = parseOptionsAndContent(rawBlock);

    // Xác định đáp án đúng
    let finalAnswer = parsed.detectedAnswer || '';
    if (!finalAnswer && answerTable.has(qNum)) {
      finalAnswer = answerTable.get(qNum) || '';
    }

    // Nếu có options, cập nhật isCorrect cho options
    if (parsed.options && finalAnswer) {
      for (const opt of parsed.options) {
        opt.isCorrect = opt.label.toUpperCase() === finalAnswer.toUpperCase();
      }
    }

    // Kiểm tra cờ duyệt
    const isAnswerMissing = !finalAnswer;
    const needsReview = isAnswerMissing || parsed.content.length < 10;
    let reviewReason: string | undefined = undefined;
    if (isAnswerMissing) {
      reviewReason = 'Chưa xác định được đáp án - Cần giáo viên duyệt';
      needsReviewCounter++;
    } else if (parsed.content.length < 10) {
      reviewReason = 'Nội dung câu hỏi quá ngắn hoặc thiếu';
      needsReviewCounter++;
    }

    // Phân loại mức độ nhận thức và độ khó
    const cog = inferCognitiveLevel(parsed.content, parsed.solution, parsed.type);

    // Suy luận chương học
    const chap = inferChapterAndTopic(parsed.content, context?.grade, context?.chapterId);

    // Đánh giá độ tin cậy
    let confidence: 'high' | 'medium' | 'low' = 'high';
    if (isAnswerMissing || chap.score === 0) {
      confidence = 'medium';
    }
    if (isAnswerMissing && chap.score === 0) {
      confidence = 'low';
    }

    items.push({
      id: `DOC_ITEM_${Date.now()}_${i + 1}`,
      order: qNum,
      rawText: rawBlock,
      content: parsed.content,
      type: parsed.type,
      options: parsed.options,
      correctAnswer: finalAnswer, // Tuyệt đối không gán '1'
      solution: parsed.solution,
      grade: chap.grade,
      chapterId: chap.chapterId,
      topic: chap.topic,
      problemType: chap.problemType,
      cognitiveLevel: cog.level,
      difficulty: cog.difficulty,
      defaultPoints: cog.points,
      confidence,
      needsReview,
      reviewReason,
      verificationStatus: needsReview ? 'draft' : 'verified',
    });
  }

  return {
    items,
    warnings,
    totalExtracted: items.length,
    needsReviewCount: needsReviewCounter,
  };
}
