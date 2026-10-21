// ==============================================================================
// MathMaster THCS - Dịch Vụ Gửi Email Thật Qua SMTP (Nodemailer)
// Đọc cấu hình từ biến môi trường: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM
// Tuyệt đối không giả lập thành công: nếu thiếu cấu hình trả về sent: false kèm lý do rõ ràng.
// ==============================================================================

import nodemailer from 'nodemailer';

export interface MailerResult {
  sent: boolean;
  reason?: 'SMTP_NOT_CONFIGURED' | 'SMTP_SEND_FAILED' | string;
  messageId?: string;
}

export function isSmtpConfigured(): boolean {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  return Boolean(host && user && pass);
}

export async function sendPasswordResetEmail(params: {
  toEmail: string;
  fullName: string;
  code: string;
  resetUrl?: string;
  expiresInMinutes?: number;
}): Promise<MailerResult> {
  const { toEmail, fullName, code, resetUrl, expiresInMinutes = 15 } = params;

  if (!isSmtpConfigured()) {
    return {
      sent: false,
      reason: 'SMTP_NOT_CONFIGURED',
    };
  }

  const host = process.env.SMTP_HOST!.trim();
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;
  const user = process.env.SMTP_USER!.trim();
  const pass = process.env.SMTP_PASS!.trim();
  const mailFrom = process.env.MAIL_FROM?.trim() || `MathMaster THCS <${user}>`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const directLink = resetUrl || `${appUrl}/login?mode=reset&email=${encodeURIComponent(toEmail)}`;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    const subject = `[MathMaster THCS] Mã khôi phục mật khẩu của bạn: ${code}`;

    const textContent = `Xin chào ${fullName || 'bạn'},

Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu cho tài khoản MathMaster THCS liên kết với email: ${toEmail}.

MÃ KHÔI PHỤC CỦA BẠN LÀ:
-------------------------
       ${code}
-------------------------

(Mã này có hiệu lực trong vòng ${expiresInMinutes} phút và chỉ sử dụng được 01 lần).

Bạn có thể nhập trực tiếp mã trên giao diện web hoặc bấm vào liên kết sau để mở form đặt lại mật khẩu:
${directLink}

LƯU Ý AN TOÀN:
- Nếu bạn KHÔNG thực hiện yêu cầu này, vui lòng bỏ qua email. Mật khẩu hiện tại của bạn vẫn an toàn tuyệt đối.
- Tuyệt đối không chia sẻ mã này cho bất kỳ ai, kể cả người tự xưng là quản trị viên.

Trân trọng,
Ban Quản Trị MathMaster THCS
Hệ thống Luyện thi & Học Toán Lớp 6, 7, 8, 9`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Khôi phục mật khẩu - MathMaster THCS</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #312e81 0%, #4f46e5 100%); padding: 28px 24px; text-align: center;">
              <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; background: rgba(255,255,255,0.2); color: #ffffff; font-size: 24px; font-weight: bold; margin-bottom: 8px;">∑</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: bold;">MathMaster THCS</h1>
              <p style="margin: 4px 0 0 0; color: #c7d2fe; font-size: 12px;">Hệ thống Luyện thi & Học Toán Lớp 6, 7, 8, 9</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 24px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.5;">Xin chào <strong>${fullName || 'bạn'}</strong>,</p>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với địa chỉ email <strong>${toEmail}</strong>. Vui lòng sử dụng mã xác nhận 6 số bên dưới để hoàn tất:
              </p>

              <!-- Verification Code Box -->
              <div style="background-color: #eef2ff; border: 2px dashed #6366f1; border-radius: 12px; padding: 18px 20px; text-align: center; margin: 24px 0;">
                <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #4338ca; margin-bottom: 6px;">Mã khôi phục mật khẩu của bạn</div>
                <div style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #312e81; font-family: 'Courier New', Courier, monospace;">${code}</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 6px;">Hiệu lực trong <strong>${expiresInMinutes} phút</strong> • Dùng 01 lần duy nhất</div>
              </div>

              <!-- Button Link -->
              <div style="text-align: center; margin: 24px 0 20px 0;">
                <a href="${directLink}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: bold; box-shadow: 0 2px 6px rgba(79, 70, 229, 0.35);">
                  Đặt lại mật khẩu trực tiếp &rarr;
                </a>
              </div>

              <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 20px 0 0 0; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                💡 <em>Nếu bạn không yêu cầu đặt lại mật khẩu, xin vui lòng bỏ qua thư này. Mật khẩu hiện tại của bạn vẫn được giữ an toàn tuyệt đối.</em>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Email tự động từ MathMaster THCS • Không trả lời trực tiếp email này.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const info = await transporter.sendMail({
      from: mailFrom,
      to: toEmail,
      subject,
      text: textContent,
      html: htmlContent,
    });

    return {
      sent: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    // Log lỗi nhưng không làm lộ mật khẩu SMTP
    console.error(`[Mailer Error] Gửi mail tới ${toEmail} thất bại:`, err?.message || err);
    return {
      sent: false,
      reason: 'SMTP_SEND_FAILED',
    };
  }
}
