// ==============================================================================
// MathMaster THCS - Next.js Middleware Bảo Vệ API & Gắn Header An Toàn
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_API_PREFIXES = [
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
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return res;
}

export const config = {
  matcher: ['/api/:path*'],
};
