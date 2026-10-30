/**
 * Голос для Доми, средствами браузера: распознавание речи (Web Speech API) и озвучка ответов (speechSynthesis).
 * Ключи и платные сервисы не нужны. Где браузер не умеет (Firefox не распознаёт речь), кнопки скрываются.
 */

const LOCALE: Record<string, string> = { ru: 'ru-RU', en: 'en-US', tr: 'tr-TR', de: 'de-DE', sr: 'sr-RS' };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rec = any;

export function recognitionSupported() {
  return typeof window !== 'undefined' && !!((window as Rec).SpeechRecognition || (window as Rec).webkitSpeechRecognition);
}

export function speechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/** Запись одного вопроса. onText — промежуточный текст (для поля ввода), onDone — итог или '' при отмене. */
export function listen(lang: string, h: { onText: (t: string) => void; onDone: (t: string) => void; onError: (code: string) => void }) {
  const R = (window as Rec).SpeechRecognition || (window as Rec).webkitSpeechRecognition;
  const rec: Rec = new R();
  rec.lang = LOCALE[lang] ?? 'ru-RU';
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 1;
  let text = '';
  let failed = false;
  rec.onresult = (e: Rec) => {
    text = Array.from(e.results as ArrayLike<Rec>).map((r: Rec) => r[0].transcript).join(' ').replace(/\s+/g, ' ').trim();
    h.onText(text);
  };
  rec.onerror = (e: Rec) => {
    failed = true;
    if (e.error !== 'aborted' && e.error !== 'no-speech') h.onError(e.error);
  };
  rec.onend = () => h.onDone(failed && !text ? '' : text);
  rec.start();
  return { stop: () => rec.stop(), abort: () => { failed = true; text = ''; rec.abort(); } };
}

/** Текст ответа без разметки, ссылок и меток карточек — то, что можно прочитать вслух. */
export function speakable(md: string) {
  return md
    .replace(/\[\[[^\]]+\]\]/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/(^|\s)\/[\w\-/]+/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[*_#>`]/g, '')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/€/g, ' €')
    .replace(/:\s*\n+/g, '. ')
    .replace(/([^.!?:…\s])\s*\n+/g, '$1. ')
    .replace(/\.{2,}/g, '.')
    .replace(/\s+/g, ' ')
    .trim();
}

let voices: SpeechSynthesisVoice[] = [];
function pickVoice(lang: string) {
  if (!voices.length) voices = speechSynthesis.getVoices();
  const code = (LOCALE[lang] ?? 'ru-RU').slice(0, 2);
  const own = voices.filter((v) => v.lang.toLowerCase().startsWith(code));
  // Сначала «живые» облачные голоса (Google, Microsoft Natural/Online), потом любые на нужном языке.
  return own.find((v) => /natural|online|google|premium|enhanced/i.test(v.name)) ?? own[0] ?? null;
}
if (speechSupported()) speechSynthesis.addEventListener?.('voiceschanged', () => { voices = speechSynthesis.getVoices(); });

/** iOS разрешает озвучку только после жеста пользователя: «будим» синтез пустой фразой по клику. */
export function unlockSpeech() {
  if (!speechSupported()) return;
  const u = new SpeechSynthesisUtterance(' ');
  u.volume = 0;
  speechSynthesis.speak(u);
}

export function speak(lang: string, md: string) {
  if (!speechSupported()) return;
  stopSpeaking();
  const text = speakable(md);
  if (!text) return;
  // Длинный текст делим на фразы: Chrome обрывает одну длинную реплику примерно через 15 секунд.
  const parts = text.match(/[^.!?…]+[.!?…]*\s*/g) ?? [text];
  const voice = pickVoice(lang);
  for (const p of parts) {
    const u = new SpeechSynthesisUtterance(p.trim());
    u.lang = LOCALE[lang] ?? 'ru-RU';
    if (voice) u.voice = voice;
    u.rate = 1.03;
    speechSynthesis.speak(u);
  }
}

export function stopSpeaking() {
  if (speechSupported() && (speechSynthesis.speaking || speechSynthesis.pending)) speechSynthesis.cancel();
}
