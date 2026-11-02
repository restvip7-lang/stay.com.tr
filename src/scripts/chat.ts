/** Клиентская часть чата с Доми. История хранится в браузере посетителя. */
import { listen, recognitionSupported, speak, speechSupported, stopSpeaking, unlockSpeech } from './voice';

interface Facts { place?: string; rooms?: string; area?: number; sea?: number; price?: number; ppm?: number; from?: boolean }
interface Card { kind: string; id: string; title: string; subtitle: string; price: string; image: string | null; url: string; prive: boolean; facts?: Facts }
interface Texts { lang: string; typing: string; unavailable: string; hint: string; mic: string; micStop: string; listening: string; micDenied: string; voiceOn: string; voiceOff: string; pdf: string; pdfTitle: string; pdfCols: string[]; pdfFoot: string; pdfPrint: string; contact: string }
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

/** Подпись кнопки PDF под ответами с карточками (задаётся при запуске чата). */
let pdfLabel = '';

/** Текст ответа → HTML; метки [[obj:ID]] заменяются карточками на своём месте. */
function render(m: Msg) {
  const cards = new Map((m.cards ?? []).map((c) => [(c.kind === 'listing' ? 'obj:' : 'project:') + c.id, c]));
  const used = new Set<string>();
  const out: string[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let row: string[] = [];
  let table: string[][] = [];
  const flushTable = () => {
    if (!table.length) return;
    const rows = table.filter((r) => !r.every((c) => /^:?-{2,}:?$/.test(c)));
    const [head, ...body] = rows;
    if (head) out.push(`<div class="chat-table"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
    table = [];
  };
  const flush = () => {
    flushTable();
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
    // Таблица Markdown: | a | b |
    if (/^\|.*\|$/.test(line)) {
      if (para.length || list.length) { const t = table; table = []; flush(); table = t; }
      table.push(line.slice(1, -1).split('|').map((c) => c.trim()));
      continue;
    }
    flushTable();
    if (/^[-*•]\s+/.test(line)) { if (para.length) flush(); list.push(line.replace(/^[-*•]\s+/, '')); }
    else { if (list.length) flush(); para.push(line.replace(/^#+\s*/, '')); }
  }
  flush();
  flushRow();
  // Карточки, на которые помощник сослался, но меток в тексте не оказалось.
  const extra = (m.cards ?? []).filter((c) => !used.has((c.kind === 'listing' ? 'obj:' : 'project:') + c.id));
  if (extra.length) out.push(`</div><div class="chat-cards">${extra.map(card).join('')}</div><div class="chat-msg chat-bot">`);
  if (pdfLabel && m.cards?.length) out.push(`</div><button type="button" class="chat-pdf" data-chat-pdf><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/></svg>${esc(pdfLabel)}</button><div class="chat-msg chat-bot">`);
  return `<div class="chat-msg chat-bot">${out.join('')}</div>`.replace(/<div class="chat-msg chat-bot"><\/div>/g, '');
}

export async function initChat() {
  const root = document.querySelector<HTMLElement>('[data-chat]');
  if (!root) return;
  const T: Texts = JSON.parse(root.dataset.chatT || '{}');
  pdfLabel = T.pdf || '';
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
  let byVoice = false;
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
          // Текст остаётся в поле: человек сам правит его и отправляет. Ответ на такой вопрос Доми озвучит.
          onDone: (t) => {
            rec = null;
            micState(false);
            if (!t) return;
            input.value = (before ? `${before} ${t}` : t).trim();
            input.dispatchEvent(new Event('input'));
            byVoice = true;
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
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

  log.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('[data-chat-pdf]')) printSelection(history, T);
  });
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
    if (voiceOn || byVoice) unlockSpeech();
    ask(t, byVoice);
    byVoice = false;
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); }
  });
  input.addEventListener('input', () => { input.style.height = ''; input.style.height = Math.min(120, input.scrollHeight) + 'px'; });

  let seenHint = false;
  try { seenHint = !!localStorage.getItem(HINT); } catch { /* */ }
  if (!seenHint) setTimeout(() => { if (panel.hidden) hint.hidden = false; }, 6000);
}

/**
 * «Скачать подборку (PDF)»: все варианты из разговора (последние сверху) на одной странице
 * с таблицей сравнения и фото. Открывается в новой вкладке, дальше — печать / «Сохранить как PDF».
 */
function printSelection(history: Msg[], T: Texts) {
  const seen = new Set<string>();
  const cards: Card[] = [];
  for (const m of [...history].reverse()) {
    for (const c of m.cards ?? []) {
      const k = c.kind + ':' + c.id;
      if (!seen.has(k)) { seen.add(k); cards.push(c); }
    }
  }
  if (!cards.length) return;
  const list = cards.slice(0, 12);
  const loc = T.lang === 'sr' ? 'sr-Latn' : T.lang;
  const num = (n: number) => n.toLocaleString(loc).replace(/\u00a0|\u202f/g, ' ');
  const eur = (n?: number) => (n ? `${num(n)} €` : '—');
  const abs = (u: string) => new URL(u, location.origin).href;
  const [mU, kmU, m2U] = T.lang === 'ru' ? ['м', 'км', 'м²'] : ['m', 'km', 'm²'];
  const sea = (n?: number) => (n ? (n >= 1000 ? `${num(Math.round(n / 100) / 10)} ${kmU}` : `${num(n)} ${mU}`) : '—');
  const [cObj, cPlace, cRooms, cArea, cSea, cPrice, cPpm] = T.pdfCols;
  const rows = list.map((c, i) => {
    const f = c.facts ?? {};
    return `<tr><td><b>${i + 1}. <a href="${esc(abs(c.url))}">${esc(c.title)}</a></b></td><td>${esc(f.place || c.subtitle || '—')}</td><td>${esc(f.rooms || '—')}</td><td>${f.area ? `${num(f.area)} ${m2U}` : '—'}</td><td>${sea(f.sea)}</td><td class="n">${f.price ? (f.from ? esc(c.price) : eur(f.price)) : esc(c.price)}</td><td class="n">${eur(f.ppm)}</td></tr>`;
  }).join('');
  const items = list.map((c, i) => {
    const img = c.image ? `<img src="${esc(abs(c.image))}" alt="">` : '<i></i>';
    return `<a class="it" href="${esc(abs(c.url))}">${img}<div><b>${i + 1}. ${esc(c.title)}</b><small>${esc(c.subtitle)}</small><span>${esc(c.price)}</span><u>${esc(abs(c.url).replace(/^https?:\/\//, ''))}</u></div></a>`;
  }).join('');
  const date = new Date().toLocaleDateString(loc, { day: 'numeric', month: 'long', year: 'numeric' });
  const logo = '<svg viewBox="0 0 32 32" width="34" height="34"><rect width="32" height="32" rx="8" fill="#090714"/><g transform="translate(4 5) scale(.8)" fill="#fff"><path d="M12.717 12.722l2.54-2.54c3.662 3.639 6.52 6.537 10.181 10.176v7.207h-7.957l5.037-5.037-9.805-9.806h.004zM5.086 27.561v-7.208l7.212 7.208H5.086z"/><path d="M14.887 25.063l-9.801-9.8H0L15.262 0 30.53 15.262h-5.09L15.257 5.082l-7.631 7.63 9.805 9.81-2.545 2.541z"/></g></svg>';
  const html = `<!doctype html><html lang="${esc(T.lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(T.pdfTitle)} — Stay Property</title><style>
*{box-sizing:border-box}body{margin:0;padding:24px 16px 40px;font:14px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#141414;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.w{max-width:900px;margin:0 auto}header{display:flex;align-items:center;gap:12px;padding-bottom:14px;border-bottom:2px solid #754be9}
header b{font-size:18px;letter-spacing:.02em}header span{margin-left:auto;color:#6b6b76;font-size:13px;text-align:right}
h1{font-size:24px;margin:20px 0 12px}.tw{overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:12.5px}
th,td{padding:7px 8px;border-bottom:1px solid #e3e3ea;text-align:left;vertical-align:top}th{background:#f3f0fd;font-weight:600;white-space:nowrap}
td.n{white-space:nowrap;text-align:right}th:nth-child(n+6){text-align:right}td a{color:#141414;text-decoration:none}
.g{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-top:22px}.it{display:flex;gap:12px;padding:10px;border:1px solid #e3e3ea;border-radius:14px;color:inherit;text-decoration:none;break-inside:avoid}
.it img,.it i{flex:0 0 130px;width:130px;height:98px;border-radius:10px;object-fit:cover;background:#ecebf5}.it b{display:block;font-size:14px}
.it small{display:block;color:#6b6b76;margin-top:2px}.it span{display:block;font-weight:700;margin-top:6px}.it u{display:block;margin-top:4px;font-size:10.5px;color:#754be9;text-decoration:none;overflow-wrap:anywhere}
footer{margin-top:22px;padding-top:12px;border-top:1px solid #e3e3ea;color:#6b6b76;font-size:12px}
.bar{position:sticky;top:0;display:flex;justify-content:flex-end;padding:0 0 12px;background:#fff}.bar button{font:inherit;font-weight:600;padding:10px 18px;border:0;border-radius:999px;background:#754be9;color:#fff;cursor:pointer}
@media (max-width:640px){.g{grid-template-columns:1fr}.it img,.it i{flex-basis:110px;width:110px;height:84px}}
@media print{.bar{display:none}body{padding:0}@page{margin:14mm}}
</style></head><body><div class="w"><div class="bar"><button onclick="print()">${esc(T.pdfPrint)}</button></div>
<header>${logo}<b>STAY PROPERTY</b><span>${esc(date)}<br>stay.com.tr</span></header>
<h1>${esc(T.pdfTitle)}</h1>
<div class="tw"><table><thead><tr><th>${esc(cObj)}</th><th>${esc(cPlace)}</th><th>${esc(cRooms)}</th><th>${esc(cArea)}</th><th>${esc(cSea)}</th><th>${esc(cPrice)}</th><th>${esc(cPpm)}</th></tr></thead><tbody>${rows}</tbody></table></div>
<div class="g">${items}</div>
<footer>${esc(T.pdfFoot)}<br>Stay Property · ${esc(T.contact)} · stay.com.tr</footer></div>
<script>addEventListener('load',function(){setTimeout(function(){print()},400)})<\/script></body></html>`;
  const w = window.open('', '_blank');
  if (!w) {
    // Всплывающие окна запрещены — открываем страницу в этой же вкладке через Blob.
    location.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
