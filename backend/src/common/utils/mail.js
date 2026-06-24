const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const axios = require('axios');

const sendResetCodeEmail = async (email, code) => {
  // Print code to console for local testing so they don't depend on SMTP
  console.log('==================================================');
  console.log(`[EMAIL VERIFICATION CODE] To: ${email}`);
  console.log(`Code: ${code}`);
  console.log('==================================================');

  const {
    RESEND_API_KEY,
    MAIL_FROM,
    MAIL_HOST,
    MAIL_PORT,
    MAIL_USER,
    MAIL_PASS,
  } = process.env;

  // 1. Try Brevo HTTP API if MAIL_PASS is a Brevo API Key (starts with xkeysib-)
  if (MAIL_PASS && MAIL_PASS.startsWith('xkeysib-')) {
    try {
      console.log('Sending email via Brevo HTTP API...');
      const senderEmail = MAIL_USER || 'draosan09@gmail.com';
      const senderName = "D'raosan";

      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: {
            name: senderName,
            email: senderEmail,
          },
          to: [
            {
              email: email,
            },
          ],
          subject: 'Reset Kata Sandi - Kode Verifikasi',
          textContent: `Kode verifikasi Anda untuk reset kata sandi adalah: ${code}. Kode ini berlaku selama 5 menit.`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h2 style="color: #4f46e5; text-align: center;">Reset Kata Sandi</h2>
              <p>Halo,</p>
              <p>Kami menerima permintaan untuk mereset kata sandi akun Anda. Gunakan kode verifikasi di bawah ini untuk melanjutkan:</p>
              <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 4px; margin: 20px 0; color: #111827;">
                ${code}
              </div>
              <p style="color: #6b7280; font-size: 14px;">Kode ini hanya berlaku selama 5 menit. Jika Anda tidak merasa meminta reset kata sandi, silakan abaikan email ini.</p>
              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Draosan. All rights reserved.</p>
            </div>
          `,
        },
        {
          headers: {
            'accept': 'application/json',
            'api-key': MAIL_PASS,
            'content-type': 'application/json',
          },
        }
      );
      console.log('Email sent successfully via Brevo HTTP API:', response.data.messageId);
      return response.data;
    } catch (err) {
      console.error('Failed to send email via Brevo HTTP API:', err.response ? err.response.data : err.message);
    }
  }

  // 2. Try Resend.com if RESEND_API_KEY is configured
  if (RESEND_API_KEY) {
    try {
      const resend = new Resend(RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: MAIL_FROM || 'onboarding@resend.dev',
        to: email,
        subject: 'Reset Kata Sandi - Kode Verifikasi',
        text: `Kode verifikasi Anda untuk reset kata sandi adalah: ${code}. Kode ini berlaku selama 5 menit.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #4f46e5; text-align: center;">Reset Kata Sandi</h2>
            <p>Halo,</p>
            <p>Kami menerima permintaan untuk mereset kata sandi akun Anda. Gunakan kode verifikasi di bawah ini untuk melanjutkan:</p>
            <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 4px; margin: 20px 0; color: #111827;">
              ${code}
            </div>
            <p style="color: #6b7280; font-size: 14px;">Kode ini hanya berlaku selama 5 menit. Jika Anda tidak merasa meminta reset kata sandi, silakan abaikan email ini.</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Draosan. All rights reserved.</p>
          </div>
        `,
      });

      if (error) {
        console.error('Failed to send email via Resend API:', error);
      } else {
        console.log('Email sent successfully via Resend API:', data.id);
        return data;
      }
    } catch (err) {
      console.error('Error sending email via Resend API:', err);
    }
  }

  // 3. Fallback to standard SMTP if configured
  if (MAIL_HOST && MAIL_USER && MAIL_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: MAIL_HOST,
        port: parseInt(MAIL_PORT) || 587,
        secure: parseInt(MAIL_PORT) === 465,
        auth: {
          user: MAIL_USER,
          pass: MAIL_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: MAIL_FROM || `"Draosan" <${MAIL_USER}>`,
        to: email,
        subject: 'Reset Kata Sandi - Kode Verifikasi',
        text: `Kode verifikasi Anda untuk reset kata sandi adalah: ${code}. Kode ini berlaku selama 5 menit.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #4f46e5; text-align: center;">Reset Kata Sandi</h2>
            <p>Halo,</p>
            <p>Kami menerima permintaan untuk mereset kata sandi akun Anda. Gunakan kode verifikasi di bawah ini untuk melanjutkan:</p>
            <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 4px; margin: 20px 0; color: #111827;">
              ${code}
            </div>
            <p style="color: #6b7280; font-size: 14px;">Kode ini hanya berlaku selama 5 menit. Jika Anda tidak merasa meminta reset kata sandi, silakan abaikan email ini.</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Draosan. All rights reserved.</p>
          </div>
        `,
      });

      console.log(`Mail sent via SMTP: ${info.messageId}`);
      return info;
    } catch (err) {
      console.error('Failed to send email via SMTP, fallback to console log only.', err);
    }
  } else {
    console.log('No email service configured (Resend or SMTP). Code is printed to console log.');
  }
};

module.exports = {
  sendResetCodeEmail,
};
