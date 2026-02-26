import nodemailer from 'nodemailer';
import crypto from 'crypto';

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function sendOTPEmail(to: string, otp: string): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    const info = await transporter.sendMail({
      from: `LeadSpotter <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: 'Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="margin: 0 0 8px; font-size: 20px; color: #111827;">Password Reset</h2>
          <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px;">
            Use the following OTP to reset your password. This code expires in 10 minutes.
          </p>
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111827;">${otp}</span>
          </div>
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });
    
    console.log('OTP email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return false;
  }
}
