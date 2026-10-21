// ==============================================================================
// MathMaster THCS - Hằng Số Chuẩn Hóa Action Xác Thực Toàn Hệ Thống
// Dùng chung cho cả Client (React) và Server (Next.js API route)
// Chống lỗi bất đồng bộ tên action (gạch dưới vs gạch ngang)
// ==============================================================================

export const AUTH_ACTIONS = {
  LOGIN: 'login',
  REGISTER: 'register',
  GUEST: 'guest',
  LOGOUT: 'logout',
  CHANGE_PASSWORD: 'change-password',
  FORGOT_PASSWORD: 'forgot-password',
  RESET_PASSWORD: 'reset-password',
  DELETE: 'delete',
} as const;

export type AuthAction = typeof AUTH_ACTIONS[keyof typeof AUTH_ACTIONS];

/**
 * Chuẩn hoá chuỗi action nhận từ request client:
 * Bỏ khoảng trắng, chuyển chữ thường và đổi toàn bộ gạch dưới `_` thành gạch ngang `-`
 * Ví dụ: "forgot_password" -> "forgot-password", "CHANGE_PASSWORD" -> "change-password"
 */
export function normalizeAuthAction(rawAction?: string | null): string {
  if (!rawAction || typeof rawAction !== 'string') return '';
  return rawAction.trim().toLowerCase().replace(/_/g, '-');
}
