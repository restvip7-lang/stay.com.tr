/**
 * Отправка писем с сервера (код входа в админку). Почтовый ящик задаётся в переменных окружения:
 * SMTP_HOST, SMTP_PORT (465 — SSL, 587 — STARTTLS), SMTP_USER, SMTP_PASS, SMTP_FROM.
 */
const env = (k: string) => process.env[k] || '';

export const mailReady = () => !!(env('SMTP_HOST') && env('SMTP_USER') && env('SMTP_PASS'));

export async function sendMail(to: string, subject: string, text: string): Promise<void> {
  if (!mailReady()) throw new Error('Почта не настроена');
  const { createTransport } = await import('nodemailer');
  const port = Number(env('SMTP_PORT') || 465);
  const t = createTransport({ host: env('SMTP_HOST'), port, secure: port === 465, auth: { user: env('SMTP_USER'), pass: env('SMTP_PASS') } });
  await t.sendMail({ from: env('SMTP_FROM') || env('SMTP_USER'), to, subject, text });
}
