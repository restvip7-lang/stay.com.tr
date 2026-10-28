// Небольшой клиентский код: формы заявок, избранное, модальное окно.
// Тексты берём из <script id="i18n"> (их кладёт layout на языке страницы).

type ClientDict = { form: Record<string, string>; loading: string; showMore: string; linkCopied: string; filter: Record<string, string> };
let dict: ClientDict | null = null;
export function T(): ClientDict {
  if (!dict) {
    try { dict = JSON.parse(document.getElementById('i18n')?.textContent || '{}'); } catch { dict = null; }
  }
  return dict ?? ({ form: {}, filter: {} } as unknown as ClientDict);
}
export const pageLocale = () => document.documentElement.lang || 'ru';

export function initLeadForms() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-lead-dialog]');
  document.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest('[data-lead-open]');
    if (t && dialog) {
      // Если на странице есть форма в блоке #lead — скроллим к ней, иначе открываем окно.
      const inline = document.getElementById('lead');
      if (inline && t.getAttribute('href') === '#lead') return;
      e.preventDefault();
      dialog.showModal();
    }
    if ((e.target as HTMLElement).closest('[data-lead-close]')) dialog?.close();
  });
  dialog?.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

  document.querySelectorAll<HTMLElement>('[data-range-picker]').forEach(initRangePicker);
  document.querySelectorAll<HTMLFormElement>('[data-lead-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const err = form.querySelector<HTMLElement>('[data-error]')!;
      const phone = String(fd.get('phone') || '').replace(/[^\d+]/g, '');
      let msg = '';
      if (!String(fd.get('name') || '').trim()) msg = T().form.errName;
      else if (phone.replace(/\D/g, '').length < 7) msg = T().form.errPhone;
      if (msg) { err.textContent = msg; err.classList.remove('hidden'); return; }
      err.classList.add('hidden');
      // Отправки нет — по решению заказчика заявки пока никуда не уходят.
      form.querySelectorAll<HTMLElement>(':scope > :not([data-done])').forEach((el) => el.classList.add('hidden'));
      form.querySelector('[data-done]')?.classList.remove('hidden');
    });
  });
}

const FAV_KEY = 'stay:favorites';
export type Fav = { id: string; url: string; title: string; image: string | null; price: string; meta: string };

export function readFavs(): Fav[] {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch { return []; }
}
function writeFavs(list: Fav[]) {
  try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch { /* приватный режим */ }
}

/** Подсветка сердечек и счётчик избранного (вызывать после подгрузки новых карточек). */
export function syncFavorites() {
  {
    const favs = readFavs();
    const ids = new Set(favs.map((f) => f.id));
    document.querySelectorAll<HTMLElement>('[data-fav]').forEach((b) => {
      const on = ids.has(b.dataset.fav!);
      b.setAttribute('aria-pressed', String(on));
      b.classList.toggle('text-accent', on);
      b.querySelector('svg')?.setAttribute('fill', on ? 'currentColor' : 'none');
    });
    document.querySelectorAll<HTMLElement>('[data-fav-count]').forEach((c) => {
      c.textContent = String(favs.length);
      c.classList.toggle('hidden', favs.length === 0);
    });
  }
}

export function initFavorites() {
  const sync = syncFavorites;
  document.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-fav]');
    if (!b) return;
    e.preventDefault();
    const favs = readFavs();
    const i = favs.findIndex((f) => f.id === b.dataset.fav);
    if (i >= 0) favs.splice(i, 1);
    else favs.unshift(JSON.parse(b.dataset.favItem || '{}'));
    writeFavs(favs);
    sync();
    document.dispatchEvent(new CustomEvent('favorites:change'));
  });
  sync();
}

/** Календарь «Заезд — Выезд»: две даты, период подсвечивается. */
function initRangePicker(root: HTMLElement) {
  const pop = root.querySelector<HTMLElement>('[data-rp-pop]')!;
  const val = (k: string) => root.querySelector<HTMLInputElement>(`[data-rp-value="${k}"]`)!;
  const label = (k: string) => root.querySelector<HTMLElement>(`[data-rp-label="${k}"]`)!;
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const loc = pageLocale();
  const f = T().form;
  const nice = (s: string) => new Date(s + 'T00:00').toLocaleDateString(loc, { day: 'numeric', month: 'short' });
  const wd = [...Array(7)].map((_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(loc, { weekday: 'short' }));
  const today = iso(new Date());
  let a = '', b = '';
  let month = new Date(); month.setDate(1);
  const draw = () => {
    const y = month.getFullYear(), m = month.getMonth();
    const first = (new Date(y, m, 1).getDay() + 6) % 7;
    const days = new Date(y, m + 1, 0).getDate();
    let cells = '';
    for (let i = 0; i < first; i++) cells += '<span></span>';
    for (let d = 1; d <= days; d++) {
      const k = iso(new Date(y, m, d));
      const past = k < today;
      const edge = k === a || k === b;
      const mid = a && b && k > a && k < b;
      cells += `<button type="button" data-day="${k}" ${past ? 'disabled' : ''} class="h-9 rounded-full text-sm ${edge ? 'bg-ink text-white' : mid ? 'bg-lavender' : 'hover:bg-page'} disabled:opacity-30">${d}</button>`;
    }
    const title = month.toLocaleDateString(loc, { month: 'long', year: 'numeric' });
    pop.innerHTML = `<div class="mb-3 flex items-center justify-between"><button type="button" data-mon="-1" class="grid size-8 place-items-center rounded-full hover:bg-page" aria-label="${f.prevMonth}">‹</button><b class="font-medium capitalize">${title}</b><button type="button" data-mon="1" class="grid size-8 place-items-center rounded-full hover:bg-page" aria-label="${f.nextMonth}">›</button></div>
      <div class="grid grid-cols-7 gap-1 text-center text-xs text-muted">${wd.map((d) => `<span>${d}</span>`).join('')}</div>
      <div class="mt-1 grid grid-cols-7 gap-1 text-center">${cells}</div>
      <p class="mt-3 text-xs text-muted">${!a ? f.pickIn : !b ? f.pickOut : f.ready}</p>`;
  };
  const sync = () => {
    val('in').value = a; val('out').value = b;
    label('in').textContent = a ? `${f.checkIn}: ${nice(a)}` : f.checkIn;
    label('out').textContent = b ? `${f.checkOut}: ${nice(b)}` : f.checkOut;
    label('in').parentElement!.classList.toggle('text-muted', !a);
    label('out').parentElement!.classList.toggle('text-muted', !b);
  };
  root.querySelectorAll<HTMLElement>('[data-rp-open]').forEach((o) => o.addEventListener('click', () => {
    if (o.dataset.rpOpen === 'in') { a = ''; b = ''; sync(); }
    pop.hidden = false;
    draw();
  }));
  pop.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const mon = t.closest<HTMLElement>('[data-mon]');
    if (mon) { month.setMonth(month.getMonth() + Number(mon.dataset.mon)); draw(); return; }
    const day = t.closest<HTMLElement>('[data-day]')?.dataset.day;
    if (!day) return;
    if (!a || (a && b) || day <= a) { a = day; b = ''; } else { b = day; }
    sync();
    draw();
    if (a && b) setTimeout(() => (pop.hidden = true), 250);
  });
  document.addEventListener('click', (e) => { if (!e.composedPath().includes(root)) pop.hidden = true; });
}
