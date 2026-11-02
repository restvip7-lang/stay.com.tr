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

/** Сколько ждать тишины, прежде чем закончить запись (браузеры сами обрывают раньше — перезапускаем). */
const SILENCE_MS = 5000;

/**
 * Запись вопроса. Пишет через паузы: останавливается после 5 с тишины или по повторному нажатию микрофона.
 * Chrome на Android обрывает распознавание через 1–2 с тишины — тогда запись тихо перезапускается, текст копится.
 * onText — промежуточный текст (для поля ввода), onDone — итог или '' при отмене.
 */
export function listen(lang: string, h: { onText: (t: string) => void; onDone: (t: string) => void; onError: (code: string) => void }) {
  const R = (window as Rec).SpeechRecognition || (window as Rec).webkitSpeechRecognition;
  let saved = ''; // текст прошлых сеансов распознавания
  let text = ''; // текст текущего сеанса
  let finished = false;
  let failed = false;
  let lastHeard = Date.now();
  let rec: Rec;
  const all = () => [saved, text].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  const silence = window.setInterval(() => { if (Date.now() - lastHeard > SILENCE_MS) stop(); }, 500);
  const done = () => {
    if (finished) return;
    finished = true;
    clearInterval(silence);
    h.onDone(failed && !all() ? '' : all());
  };
  const stop = () => { if (finished) return; finished = true; clearInterval(silence); try { rec.stop(); } catch { /* */ } h.onDone(all()); };
  const begin = () => {
    rec = new R();
    rec.lang = LOCALE[lang] ?? 'ru-RU';
    rec.interimResults = true;
    rec.continuous = true;
    rec.maxAlternatives = 1;
    text = '';
    rec.onresult = (e: Rec) => {
      // Chrome на Android повторяет в каждом куске весь текст с начала — склеиваем без повторов.
      const parts: string[] = [];
      for (const r of Array.from(e.results as ArrayLike<Rec>)) {
        const t = String(r[0].transcript).trim();
        const prev = parts[parts.length - 1];
        if (prev && t.toLowerCase().startsWith(prev.toLowerCase())) parts[parts.length - 1] = t;
        else if (t) parts.push(t);
      }
      text = parts.join(' ');
      lastHeard = Date.now();
      h.onText(all());
    };
    rec.onerror = (e: Rec) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      failed = true;
      h.onError(e.error);
      done();
    };
    rec.onend = () => {
      if (finished) return;
      saved = all();
      text = '';
      // Браузер закончил сам, а 5 секунд тишины ещё не прошло — слушаем дальше.
      if (!failed && Date.now() - lastHeard < SILENCE_MS) {
        try { begin(); return; } catch { /* */ }
      }
      done();
    };
    rec.start();
  };
  begin();
  return { stop, abort: () => { if (finished) return; finished = true; clearInterval(silence); saved = text = ''; try { rec.abort(); } catch { /* */ } h.onDone(''); } };
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
