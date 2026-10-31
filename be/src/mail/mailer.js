import nodemailer from 'nodemailer';

// Outgoing mail over SMTP. With SMTP_USER/SMTP_PASS unset (local dev)
// nothing is sent and the message is only logged.
//   SMTP_HOST   default smtp.gmail.com
//   SMTP_PORT   default 465 (TLS)
//   SMTP_USER   the sending account, e.g. rischwealth@gmail.com
//   SMTP_PASS   for Gmail, an App Password (not the account password)
//   MAIL_TO     where staff notifications go; defaults to SMTP_USER

const { SMTP_HOST = 'smtp.gmail.com', SMTP_PORT = '465', SMTP_USER, SMTP_PASS } = process.env;
export const MAIL_TO = process.env.MAIL_TO || SMTP_USER;

const transport = SMTP_USER && SMTP_PASS
  ? nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
  : null;

// Never throws: a mail failure is logged, not passed on to the request.
export async function sendMail({ subject, text, html, attachments, replyTo }) {
  if (!transport || !MAIL_TO) {
    console.log(`[mail not configured] ${subject}`);
    return;
  }
  try {
    await transport.sendMail({ from: `"RISCH Website" <${SMTP_USER}>`, to: MAIL_TO, subject, text, html, attachments, replyTo });
  } catch (err) {
    console.error('Mail failed:', err.message);
  }
}
