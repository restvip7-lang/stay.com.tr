/** Клиентская часть чата с Доми. История хранится в браузере посетителя. */
import { listen, recognitionSupported, speak, speechSupported, stopSpeaking, unlockSpeech } from './voice';

interface Card { kind: string; id: string; title: string; subtitle: string; price: string; image: string | null; url: string; prive: boolean }
interface Msg { role: 'user' | 'assistant'; content: string; cards?: Card[] }

const STORE_BASE = 'stay-chat-v1';
const HINT = 'stay-chat-hint';
const VOICE = 'stay-chat-voice';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function inline(s: string) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|\s)_(.+?)_(?=\s|$|[.,!?])/g, '$1<em class="chat-note">$2</em>')
    .replace(/\[([^\]]+)\]\(((?:\/|https:\/\/)[^\s)]+)\)/g, (_, t, u) => `<a href="${u}"${u.startsWith('/') ? '' : ' target="_blank" rel="noopener"'}>${t}</a>`)
    .replace(/(^|\s)(\/(?:ru|en|tr|de|sr|sale|rental|complex|prive|about|uslugi)\/[\w\-/]*)/g, '$1<a href="$2">$2</a>');
}

function card(c: Card) {
  const img = c.image ? `<img src="${esc(c.image)}" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('i'),{className:'ph'}))">` : '<i class="ph"></i>';
  return `<a class="chat-card${c.prive ? ' prive' : ''}" href="${esc(c.url)}">${img}<b>${esc(c.title)}</b><small>${esc(c.subtitle)}</small><span>${esc(c.price)}</span></a>`;
}

/** Текст ответа → HTML; метки [[obj:ID]] заменяются карточками на своём месте. */
function render(m: Msg) {
  const cards = new Map((m.cards ?? []).map((c) => [(c.kind === 'listing' ? 'obj:' : 'project:') + c.id, c]));
  const used = new Set<string>();
  const out: string[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let row: string[] = [];
  const flush = () => {
    if (para.length) out.push(`<p>${para.map(inline).join('<br>')}</p>`);
    if (list.length) out.push(`<ul>${list.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>`);
    para = [];
    list = [];
  };
  const flushRow = () => {
    if (row.length) out.push(`</div><div class="chat-cards">${row.join('')}</div><div class="chat-msg chat-bot">`);
    row = [];
  };
  for (const raw of m.content.split('\n')) {
    const line = raw.trim();
    const marks = [...line.matchAll(/\[\[(obj|project):([^\]\s]+)\]\]/g)];
    if (marks.length) {
      flush();
      for (const k of marks) {
        const key = k[1] + ':' + k[2];
        const c = cards.get(key);
        if (c && !used.has(key)) { row.push(card(c)); used.add(key); }
      }
      const rest = line.replace(/\[\[[^\]]+\]\]/g, '').replace(/^[-*•\d.)\s]+$/, '').trim();
      if (rest) { flushRow(); para.push(rest.replace(/^[-*•]\s*/, '')); }
      continue;
    }
    if (!line) { flush(); continue; }
    flushRow();
    if (/^[-*•]\s+/.test(line)) { if (para.length) flush(); list.push(line.replace(/^[-*•]\s+/, '')); }
    else { if (list.length) flush(); para.push(line.replace(/^#+\s*/, '')); }
  }
  flush();
  flushRow();
  // Карточки, на которые помощник сослался, но меток в тексте не оказалось.
  const extra = (m.cards ?? []).filter((c) => !used.has((c.kind === 'listing' ? 'obj:' : 'project:') + c.id));
  if (extra.length) out.push(`</div><div class="chat-cards">${extra.map(card).join('')}</div><div class="chat-msg chat-bot">`);
  return `<div class="chat-msg chat-bot">${out.join('')}</div>`.replace(/<div class="chat-msg chat-bot"><\/div>/g, '');
}

export async function initChat() {
  const root = document.querySelector<HTMLElement>('[data-chat]');
  if (!root) return;
  const T: { lang: string; typing: string; unavailable: string; hint: string; mic: string; micStop: string; listening: string; micDenied: string; voiceOn: string; voiceOff: string } = JSON.parse(root.dataset.chatT || '{}');
  const lang = T.lang || 'ru';
  // История своя для каждого языка: на английской странице не всплывает русский разговор.
  const STORE = lang === 'ru' ? STORE_BASE : `${STORE_BASE}-${lang}`;
  let state: { visible: boolean; ready: boolean; name: string; greeting: string };
  try {
    const r = await fetch(`/api/chat?lang=${encodeURIComponent(lang)}`, { headers: { accept: 'application/json' } });
    state = await r.json();
  } catch {
    return;
  }
  if (!state?.visible) return;

  const $ = <T extends HTMLElement>(s: string) => root.querySelector(s) as T;
  const panel = $('[data-chat-panel]');
  const log = $('[data-chat-log]');
  const form = $<HTMLFormElement>('[data-chat-form]');
  const input = $<HTMLTextAreaElement>('[data-chat-input]');
  const send = $<HTMLButtonElement>('[data-chat-send]');
  const suggest = $('[data-chat-suggest]');
  const hint = $('[data-chat-hint]');
  $('[data-chat-name]').textContent = state.name;
  $('[data-chat-hint-text]').textContent = (T.hint || '').replace('{name}', state.name);
  root.hidden = false;

  let history: Msg[] = [];
  try { history = JSON.parse(localStorage.getItem(STORE) || '[]'); } catch { history = []; }
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(history.slice(-30))); } catch { /* приватный режим */ } };

  function draw() {
    log.innerHTML = render({ role: 'assistant', content: state.greeting }) +
      history.map((m) => (m.role === 'user' ? `<div class="chat-msg chat-user">${esc(m.content)}</div>` : render(m))).join('');
    suggest.hidden = history.length > 0;
    log.scrollTop = log.scrollHeight;
  }

  const showErr = (msg: string) => {
    const err = document.createElement('div');
    err.className = 'chat-err';
    err.textContent = msg;
    log.append(err);
    log.scrollTop = log.scrollHeight;
  };

  // Озвучка ответов: включается кнопкой в шапке; на вопрос голосом Доми отвечает голосом всегда.
  const voiceBtn = $<HTMLButtonElement>('[data-chat-voice]');
  let voiceOn = false;
  try { voiceOn = localStorage.getItem(VOICE) === '1'; } catch { /* */ }
  const syncVoice = () => {
    voiceBtn.setAttribute('aria-pressed', String(voiceOn));
    const l = voiceOn ? T.voiceOff : T.voiceOn;
    voiceBtn.title = l;
    voiceBtn.setAttribute('aria-label', l);
  };
  if (speechSupported()) {
    voiceBtn.hidden = false;
    syncVoice();
    voiceBtn.addEventListener('click', () => {
      voiceOn = !voiceOn;
      try { localStorage.setItem(VOICE, voiceOn ? '1' : '0'); } catch { /* */ }
      syncVoice();
      if (voiceOn) unlockSpeech(); else stopSpeaking();
    });
  }

  let busy = false;
  async function ask(text: string, byVoice = false) {
    text = text.trim();
    if (!text || busy) return;
    busy = true;
    send.disabled = true;
    history.push({ role: 'user', content: text });
    save();
    draw();
    const typing = document.createElement('div');
    typing.className = 'chat-msg chat-bot';
    typing.innerHTML = `<span class="chat-typing" aria-label="${esc(T.typing || '…')}"><i></i><i></i><i></i></span>`;
    log.append(typing);
    log.scrollTop = log.scrollHeight;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lang, messages: history.map(({ role, content }) => ({ role, content })) }),
      });
      const r = await res.json().catch(() => ({}));
      if (!res.ok || !r.text) throw new Error(r.error || T.unavailable);
      history.push({ role: 'assistant', content: r.text, cards: r.cards });
      save();
      draw();
      if (voiceOn || byVoice) speak(lang, r.text);
    } catch (e) {
      history.pop();
      save();
      draw();
      input.value = text;
      showErr((e as Error).message);
    } finally {
      busy = false;
      send.disabled = false;
    }
  }

  const open = () => {
    root.classList.add('is-open');
    panel.hidden = false;
    $('[data-chat-open]').setAttribute('aria-expanded', 'true');
    hint.hidden = true;
    try { localStorage.setItem(HINT, '1'); } catch { /* */ }
    draw();
    if (matchMedia('(min-width: 561px)').matches) input.focus();
  };
  // Микрофон: говорим вопрос, текст появляется в поле и отправляется сам, когда человек замолчит.
  const mic = $<HTMLButtonElement>('[data-chat-mic]');
  const placeholder = input.placeholder;
  let rec: { stop: () => void; abort: () => void } | null = null;
  const micState = (on: boolean) => {
    mic.classList.toggle('is-on', on);
    mic.setAttribute('aria-pressed', String(on));
    mic.title = on ? T.micStop : T.mic;
    mic.setAttribute('aria-label', mic.title);
    input.placeholder = on ? T.listening : placeholder;
  };
  const stopMic = () => { rec?.abort(); rec = null; micState(false); };
  if (recognitionSupported()) {
    mic.hidden = false;
    mic.addEventListener('click', () => {
      if (rec) { rec.stop(); return; }
      if (busy) return;
      stopSpeaking();
      unlockSpeech();
      const before = input.value.trim();
      try {
        rec = listen(lang, {
          onText: (t) => { input.value = before ? `${before} ${t}` : t; },
          onDone: (t) => {
            rec = null;
            micState(false);
            const q = (before ? `${before} ${t}` : t).trim();
            if (!t) return;
            input.value = '';
            input.style.height = '';
            ask(q, true);
          },
          onError: (code) => { if (code === 'not-allowed' || code === 'service-not-allowed' || code === 'audio-capture') showErr(T.micDenied); },
        });
        micState(true);
      } catch { rec = null; micState(false); }
    });
  }

  const close = () => {
    stopMic();
    stopSpeaking();
    root.classList.remove('is-open');
    panel.hidden = true;
    $('[data-chat-open]').setAttribute('aria-expanded', 'false');
    $('[data-chat-open]').focus();
  };

  $('[data-chat-open]').addEventListener('click', open);
  hint.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('[data-chat-hint-close]')) {
      hint.hidden = true;
      try { localStorage.setItem(HINT, '1'); } catch { /* */ }
    } else open();
  });
  $('[data-chat-close]').addEventListener('click', close);
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  $('[data-chat-reset]').addEventListener('click', () => { stopMic(); stopSpeaking(); history = []; save(); draw(); input.focus(); });
  suggest.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('button');
    if (b) { if (voiceOn) unlockSpeech(); ask(b.textContent || ''); }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const t = input.value;
    input.value = '';
    input.style.height = '';
    if (rec) stopMic();
    if (voiceOn) unlockSpeech();
    ask(t);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); }
  });
  input.addEventListener('input', () => { input.style.height = ''; input.style.height = Math.min(120, input.scrollHeight) + 'px'; });

  let seenHint = false;
  try { seenHint = !!localStorage.getItem(HINT); } catch { /* */ }
  if (!seenHint) setTimeout(() => { if (panel.hidden) hint.hidden = false; }, 6000);
}
