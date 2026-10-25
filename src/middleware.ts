// ==============================================================================
// MathMaster THCS - Next.js Middleware Phân Luồng Bảo Vệ API & Cổng Quản Trị Admin
// Tương đương adminSecurityHeaders & requireAdmin trong Tuyển Dụng IT
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_API_PREFIXES = [
  '/api/admin',
  '/api/dashboard',
  '/api/analytics',
  '/api/state',
  '/api/exams',
  '/api/attempts',
  '/api/documents',
  '/api/ai/assistant',
  '/api/sessions',
  '/api/questions',
  '/api/classrooms',
  '/api/review',
  '/api/practice',
];

function extractToken(req: NextRequest): string | null {
  const cookieToken = req.cookies.get('mm_session')?.value;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Phân luồng bảo vệ Cổng Quản trị Admin (/admin/:path*)
  if (pathname.startsWith('/admin')) {
    // Ngoại lệ: Cho phép truy cập Cổng đăng nhập riêng của Admin (/admin/login)
    if (pathname === '/admin/login') {
      const res = NextResponse.next();
      res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
      return res;
    }

    const token = extractToken(req);
    if (!token) {
      // Chuyển hướng về cổng đăng nhập riêng của Admin
      const adminLoginUrl = new URL('/admin/login', req.url);
      adminLoginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(adminLoginUrl);
    }
  }

  // 2. Phân luồng bảo vệ API (/api/:path*)
  // Ngoại lệ: Cho phép gọi API đăng nhập riêng của Admin (/api/admin/auth)
  if (pathname.startsWith('/api/admin/auth')) {
    const res = NextResponse.next();
    res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return res;
  }

  const isProtectedApi = PROTECTED_API_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtectedApi) {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để truy cập tài nguyên này.',
        },
        { status: 401 }
      );
    }
  }

  const res = NextResponse.next();

  // Header bảo mật hệ thống & chống thu thập dữ liệu tự động khu vực Admin
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }

  return res;
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
};
