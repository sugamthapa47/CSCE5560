const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendOTPEmail = async (toEmail, userName, otp) => {
  await resend.emails.send({
    from: 'SecureShop <noreply@secure-shop.store>',
    to: toEmail,
    subject: 'Your SecureShop Login OTP',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e0e0e0;border-radius:12px;">
        <h2 style="color:#1a1a2e;margin-bottom:8px;">Hello, ${userName} 👋</h2>
        <p style="color:#555;">Use the code below to complete your login. It expires in <strong>5 minutes</strong>.</p>
        <div style="text-align:center;margin:32px 0;">
          <span style="font-size:40px;font-weight:bold;letter-spacing:10px;color:#e94560;background:#f9f9f9;padding:16px 32px;border-radius:8px;border:2px dashed #e94560;">
            ${otp}
          </span>
        </div>
        <p style="color:#999;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="color:#bbb;font-size:12px;text-align:center;">SecureShop Electronics — Trusted & Secure</p>
      </div>
    `,
  });
};
