import crypto from 'node:crypto';

const AUTH_SECRET = process.env.AUTH_SECRET || 'mathmaster-thcs-secret-key-2026-local-development-safe-token';

export function hashPassword(password: string): string {
  const salt = 'mathmaster_salt_v1';
  return crypto.scryptSync(password, salt, 32).toString('hex');
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (storedHash === password) return true; // Support plain seed passwords like 'pass123'
  return hashPassword(password) === storedHash;
}

export function signSessionToken(payload: { userId: string; role: string; isGuest: boolean }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifySessionToken(token: string): { userId: string; role: string; isGuest: boolean } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const expectedSig = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
    if (sig !== expectedSig) return null;
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
  } catch {
    return null;
  }
}
