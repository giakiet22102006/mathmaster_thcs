// ==============================================================================
// MathMaster THCS - Tầng Lưu Trữ Tài Liệu Trừu Tượng (src/lib/documents/storage.ts)
// Hỗ trợ Driver Local (Node fs), Supabase Storage, Vercel Blob và In-memory Fallback
// Tránh 100% lỗi hệ thống file chỉ đọc (Vercel Serverless / Read-Only)
// ==============================================================================

import fs from 'node:fs';
import path from 'node:path';

export interface StorageResult {
  storagePath: string;
  publicUrl?: string;
  driver: 'local' | 'memory' | 'blob';
}

// In-memory buffer cache cho môi trường serverless read-only
const memoryFileStore = new Map<string, { buffer: Buffer; mimeType: string; fileName: string }>();

/**
 * Kiểm tra xem hệ thống tệp cục bộ có thể ghi được không
 */
function isFilesystemWritable(): boolean {
  if (
    process.env.UPLOAD_STORAGE_DRIVER === 'memory' ||
    process.env.UPLOAD_STORAGE_DRIVER === 'supabase' ||
    process.env.UPLOAD_STORAGE_DRIVER === 'blob'
  ) {
    return false;
  }
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return false;
  }
  return true;
}

/**
 * Lưu file tài liệu tải lên
 */
export async function saveDocumentFile(
  fileName: string,
  buffer: Buffer,
  mimeType: string
): Promise<StorageResult> {
  const safeBaseName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  // 1. Supabase Storage (nếu có cấu hình SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY)
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'documents';

  if ((process.env.UPLOAD_STORAGE_DRIVER === 'supabase' || supabaseUrl) && supabaseUrl && supabaseKey) {
    try {
      const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${safeBaseName}`;
      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': mimeType,
          'x-upsert': 'true',
        },
        body: buffer,
      });
      if (uploadRes.ok) {
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${safeBaseName}`;
        return {
          storagePath: publicUrl,
          publicUrl,
          driver: 'blob',
        };
      }
    } catch {
      // Fallback nếu kết nối Supabase thất bại
    }
  }

  // 2. Vercel Blob Storage (nếu có cấu hình BLOB_READ_WRITE_TOKEN)
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.UPLOAD_STORAGE_DRIVER === 'blob') {
    try {
      const { put } = await import('@vercel/blob');
      const blob = await put(`documents/${safeBaseName}`, buffer, {
        access: 'public',
        contentType: mimeType,
      });
      return {
        storagePath: blob.url,
        publicUrl: blob.url,
        driver: 'blob',
      };
    } catch {
      // Fallback nếu gọi blob thất bại
    }
  }

  // 3. Local filesystem storage (cho môi trường localhost/VPS)
  if (isFilesystemWritable()) {
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const absolutePath = path.join(uploadDir, safeBaseName);
      fs.writeFileSync(absolutePath, buffer);
      return {
        storagePath: `/uploads/documents/${safeBaseName}`,
        publicUrl: `/uploads/documents/${safeBaseName}`,
        driver: 'local',
      };
    } catch {
      // Nếu ghi đĩa bị lỗi permission, fallback sang memory
    }
  }

  // 4. Fallback: In-memory store (đặc biệt khi chạy test hoặc Vercel read-only không có Blob/Supabase)
  const memKey = `mem://${safeBaseName}`;
  memoryFileStore.set(memKey, { buffer, mimeType, fileName });
  return {
    storagePath: memKey,
    publicUrl: undefined,
    driver: 'memory',
  };
}

/**
 * Đọc buffer của file tài liệu từ storagePath
 */
export async function readDocumentFile(storagePath: string): Promise<Buffer | null> {
  if (!storagePath) return null;

  // 1. In-memory
  if (storagePath.startsWith('mem://')) {
    const item = memoryFileStore.get(storagePath);
    return item ? item.buffer : null;
  }

  // 2. Vercel Blob, Supabase Storage hoặc URL ngoài
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    try {
      const res = await fetch(storagePath);
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch {
      return null;
    }
  }

  // 3. Local filesystem
  try {
    const relativeClean = storagePath.startsWith('/') ? storagePath.slice(1) : storagePath;
    const absolutePath = path.join(process.cwd(), 'public', relativeClean.replace(/^uploads\/?/, 'uploads/'));
    if (fs.existsSync(absolutePath)) {
      return fs.readFileSync(absolutePath);
    }
    // Thử đường dẫn trực tiếp
    if (fs.existsSync(storagePath)) {
      return fs.readFileSync(storagePath);
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Xóa file tài liệu khi người dùng xóa tài liệu
 */
export async function deleteDocumentFile(storagePath: string): Promise<boolean> {
  if (!storagePath) return false;

  if (storagePath.startsWith('mem://')) {
    return memoryFileStore.delete(storagePath);
  }

  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    // Nếu là Supabase Storage URL
    if (storagePath.includes('/storage/v1/object/')) {
      const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
      const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'documents';
      const fileName = storagePath.split('/').pop();
      if (supabaseUrl && supabaseKey && fileName) {
        try {
          await fetch(`${supabaseUrl}/storage/v1/object/${bucketName}/${fileName}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${supabaseKey}`,
            },
          });
          return true;
        } catch {
          return false;
        }
      }
    }

    // Nếu là Vercel Blob URL
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { del } = await import('@vercel/blob');
        await del(storagePath);
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }

  try {
    const relativeClean = storagePath.startsWith('/') ? storagePath.slice(1) : storagePath;
    const absolutePath = path.join(process.cwd(), 'public', relativeClean.replace(/^uploads\/?/, 'uploads/'));
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      return true;
    }
    if (fs.existsSync(storagePath)) {
      fs.unlinkSync(storagePath);
      return true;
    }
  } catch {
    return false;
  }

  return false;
}
