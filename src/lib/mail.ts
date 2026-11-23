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
  const host = env('SMTP_HOST');
  // Соединяемся по IPv4: на сервере нет IPv6, а почтовик Google отдаёт и IPv6-адрес — тогда отправка висит до таймаута.
  // Имя сервера оставляем для проверки сертификата (tls.servername).
  const ip = await import('node:dns/promises').then((d) => d.lookup(host, { family: 4 })).then((r) => r.address).catch(() => host);
  const t = createTransport({ host: ip, port, secure: port === 465, tls: { servername: host }, auth: { user: env('SMTP_USER'), pass: env('SMTP_PASS') }, connectionTimeout: 20_000, greetingTimeout: 20_000, socketTimeout: 30_000 });
  await t.sendMail({ from: env('SMTP_FROM') || env('SMTP_USER'), to, subject, text });
}
