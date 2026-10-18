import { NextResponse } from 'next/server';
import os from 'node:os';
import { checkDatabaseConnection } from '@/lib/prisma';

function getServerLanUrls(): string[] {
  try {
    const nets = os.networkInterfaces();
    const urls: string[] = [];
    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        if (net.family === 'IPv4' && !net.internal) {
          urls.push(`http://${net.address}:3000`);
        }
      }
    }
    return urls;
  } catch {
    return [];
  }
}

export async function GET() {
  const dbConnected = await checkDatabaseConnection();
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
  const mathpixConfigured = Boolean(process.env.MATHPIX_APP_KEY && process.env.MATHPIX_APP_KEY.trim() !== '');
  const lanUrls = getServerLanUrls();

  return NextResponse.json({
    ok: true,
    service: 'MathMaster THCS Backend API',
    nodeVersion: process.version,
    databaseConnected: dbConnected,
    storageDriver: process.env.UPLOAD_STORAGE_DRIVER || 'local',
    geminiConfigured,
    mathpixConfigured,
    lanUrls,
    nonAiFeaturesReady: true,
    message: dbConnected
      ? 'Đã kết nối PostgreSQL thành công.'
      : 'Đang sử dụng bộ nhớ đệm cục bộ (.data/local_db_state.json). Hãy cấu hình DATABASE_URL trong .env để đồng bộ PostgreSQL.'
  });
}
