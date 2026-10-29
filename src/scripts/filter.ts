// Фильтр каталога: собирает адрес (ЧПУ для гео/сделки/типа и белого списка фич, остальное — ?параметры),
// на посадочной обновляет выдачу на месте, на главной ведёт в каталог.
import { syncFavorites } from './client';

const ROOM_FEATURE: Record<string, string> = { '1+1': '1-bedroom', '2+1': '2-bedrooms', '3+1': '3-bedrooms', '4+': '4-bedrooms' };
const PRICE_TO = ['100000', '150000', '200000'];
const PARAMS = ['ref', 'price_from', 'price_to', 'rooms', 'sea_from', 'sea_to', 'prive', 'citizenship', 'f', 'sort'];

type Allowed = Record<string, Record<string, string[]>>;

/** Адрес по состоянию формы. */
export function buildUrl(form: HTMLFormElement): string {
  const fd = new FormData(form);
  const val = (k: string) => String(fd.get(k) ?? '').trim();
  const lang = form.dataset.lang || 'ru';
  const country = val('country') || 'turkey';
  const city = val('city');
  const district = city ? val('district') : '';
  const deal = val('deal') || 'sale';
  const type = val('type');
  const allowed: Allowed = JSON.parse(form.dataset.allowed || '{}');
  const ok = (f: string) => !!type && !!allowed[deal]?.[type]?.includes(f);

  const sp = new URLSearchParams();
  for (const k of PARAMS) for (const v of fd.getAll(k)) {
    const s = String(v).replace(/\s/g, '');
    if (s) sp.append(k, s);
  }
  if (deal !== 'sale') { sp.delete('prive'); sp.delete('citizenship'); }

  // Фича в адресе: сохранённая из текущего адреса, иначе — из сочетания полей (белый список).
  let feature = val('feature');
  if (feature && !ok(feature)) {
    if (!sp.has('f')) sp.set('f', feature);
    feature = '';
  }
  if (!feature && sp.has('f') && ok(sp.get('f')!)) { feature = sp.get('f')!; sp.delete('f'); }
  if (!feature && type) {
    const rooms = sp.getAll('rooms');
    const pt = sp.get('price_to') ?? '';
    if (rooms.length === 1 && ROOM_FEATURE[rooms[0]] && ok(ROOM_FEATURE[rooms[0]])) { feature = ROOM_FEATURE[rooms[0]]; sp.delete('rooms'); }
    else if (!sp.has('price_from') && PRICE_TO.includes(pt) && ok(`price-to-${pt}`)) { feature = `price-to-${pt}`; sp.delete('price_to'); }
    else if (sp.get('citizenship') === '1' && !sp.has('prive') && ok('citizenship')) { feature = 'citizenship'; sp.delete('citizenship'); }
  }
  const path = '/' + [lang, country, city, district, deal, type, type && feature].filter(Boolean).join('/') + '/';
  const q = sp.toString();
  return path + (q ? `?${q}` : '');
}

function initRanges(form: HTMLFormElement, fmt: (n: number) => string) {
  form.querySelectorAll<HTMLElement>('[data-range]').forEach((r) => {
    const lo = r.querySelector<HTMLInputElement>('[data-lo]')!;
    const hi = r.querySelector<HTMLInputElement>('[data-hi]')!;
    const slo = r.querySelector<HTMLInputElement>('[data-slo]')!;
    const shi = r.querySelector<HTMLInputElement>('[data-shi]')!;
    const min = Number(r.dataset.min), max = Number(r.dataset.max);
    const toNum = (s: string) => Number(s.replace(/\D/g, ''));
    slo.addEventListener('input', () => {
      if (+slo.value > +shi.value) slo.value = shi.value;
      lo.value = +slo.value <= min ? '' : fmt(+slo.value);
    });
    shi.addEventListener('input', () => {
      if (+shi.value < +slo.value) shi.value = slo.value;
      hi.value = +shi.value >= max ? '' : fmt(+shi.value);
    });
    [slo, shi].forEach((s) => s.addEventListener('change', () => form.dispatchEvent(new Event('change'))));
    lo.addEventListener('input', () => { slo.value = String(toNum(lo.value) || min); });
    hi.addEventListener('input', () => { shi.value = String(toNum(hi.value) || max); });
  });
  form.querySelectorAll<HTMLInputElement>('[data-lo],[data-hi]').forEach((i) => {
    let fresh = false;
    i.addEventListener('focus', () => { i.select(); fresh = true; });
    i.addEventListener('mouseup', (e) => { if (fresh) { e.preventDefault(); fresh = false; } });
    i.addEventListener('input', () => {
      const n = i.value.replace(/\D/g, '').slice(0, 9);
      i.value = n ? fmt(Number(n)) : '';
    });
  });
}

/** Подменяет на странице области [data-swap] содержимым из новой страницы. */
function swap(doc: Document) {
  document.querySelectorAll<HTMLElement>('[data-swap]').forEach((el) => {
    const next = doc.querySelector<HTMLElement>(`[data-swap="${el.dataset.swap}"]`);
    if (next) el.innerHTML = next.innerHTML;
  });
  document.title = doc.title;
  for (const sel of ['meta[name="robots"]', 'link[rel="canonical"]', 'meta[name="description"]']) {
    const a = document.head.querySelector(sel);
    const b = doc.head.querySelector(sel);
    if (a && b) a.replaceWith(b.cloneNode(true));
  }
}

export function initFilters() {
  document.querySelectorAll<HTMLFormElement>('[data-filter]:not([data-ready])').forEach((form) => {
    form.dataset.ready = '1';
    const loc = form.dataset.loc || 'ru-RU';
    const fmt = (n: number) => n.toLocaleString(loc);
    const L = JSON.parse(form.dataset.t || '{}');
    const catalog = form.dataset.mode === 'catalog';

    // Связанные списки: страна → город → район.
    const country = form.querySelector<HTMLSelectElement>('[data-country]')!;
    const city = form.querySelector<HTMLSelectElement>('[data-city]')!;
    const district = form.querySelector<HTMLSelectElement>('[data-district]')!;
    const cascade = () => {
      city.querySelectorAll<HTMLOptionElement>('option[data-country]').forEach((o) => {
        o.hidden = o.dataset.country !== country.value;
        if (o.hidden && o.selected) city.value = '';
      });
      district.querySelectorAll<HTMLOptionElement>('option[data-city]').forEach((o) => {
        o.hidden = !city.value || o.dataset.city !== city.value;
        if (o.hidden && o.selected) district.value = '';
      });
      district.disabled = !city.value;
    };
    country.addEventListener('change', cascade);
    city.addEventListener('change', cascade);
    cascade();
    initRanges(form, fmt);

    // Тоггл «Лоты PRIVE» и «Гражданство ТР» видны только для продажи; PRIVE красит страницу.
    const saleOnly = form.querySelector<HTMLElement>('[data-sale-only]');
    const syncDeal = () => {
      const deal = String(new FormData(form).get('deal') || 'sale');
      if (saleOnly) saleOnly.hidden = deal !== 'sale';
      const prive = deal === 'sale' && !!form.querySelector<HTMLInputElement>('[name=prive]')?.checked;
      document.body.classList.toggle('mode-prive', prive);
    };
    syncDeal();

    form.querySelector('[data-chips]')?.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>('[data-chip-field]');
      if (!b) return;
      form.querySelector(`input[type=hidden][name="${b.dataset.chipField}"]`)?.remove();
      b.remove();
      form.dispatchEvent(new Event('change'));
    });

    // Живой счётчик для формы на главной.
    let timer: number | undefined;
    const count = () => {
      clearTimeout(timer);
      timer = window.setTimeout(async () => {
        try {
          const u = new URL(buildUrl(form), location.origin);
          const r = await fetch(`/api/count?path=${encodeURIComponent(u.pathname)}&${u.searchParams}`);
          const { total } = await r.json();
          form.querySelectorAll('[data-total]').forEach((el) => (el.textContent = fmt(total)));
        } catch { /* счётчик не критичен */ }
      }, 250);
    };

    // Посадочная: если сменились гео/сделка/тип — переходим на новую посадочную,
    // если только параметры — подменяем выдачу и адрес (кнопка «Назад» работает).
    let seq = 0;
    let go: number | undefined;
    const apply = () => {
      clearTimeout(go);
      go = window.setTimeout(async () => {
        const url = buildUrl(form);
        const next = new URL(url, location.origin);
        if (next.pathname !== location.pathname) { location.href = url; return; }
        const my = ++seq;
        const box = document.querySelector<HTMLElement>('[data-swap="results"]');
        box?.classList.add('opacity-50');
        try {
          const html = await (await fetch(url)).text();
          if (my !== seq) return;
          swap(new DOMParser().parseFromString(html, 'text/html'));
          history.pushState(null, '', url);
          document.dispatchEvent(new CustomEvent('results:updated'));
          syncFavorites();
        } catch { location.href = url; }
        finally { box?.classList.remove('opacity-50'); }
      }, 450);
    };

    form.addEventListener('change', () => { syncDeal(); if (catalog) apply(); else count(); });
    form.addEventListener('input', (e) => {
      if (!(e.target as HTMLElement).matches('[data-lo],[data-hi],[name=ref]')) return;
      if (catalog) apply(); else count();
    });
    form.addEventListener('submit', (e) => { e.preventDefault(); location.href = buildUrl(form); });
    if (catalog) addEventListener('popstate', () => location.reload());
    addEventListener('pageshow', (e) => { if ((e as PageTransitionEvent).persisted) { cascade(); syncDeal(); } });

    // «Фильтры»: панель на весь экран; выдача под ней обновляется сразу, кнопка внизу закрывает панель.
    const panel = form.querySelector<HTMLElement>('[data-adv-panel]');
    const setPanel = (open: boolean) => { panel?.classList.toggle('hidden', !open); document.body.style.overflow = open ? 'hidden' : ''; };
    form.querySelectorAll('[data-adv-open]').forEach((b) => b.addEventListener('click', () => setPanel(true)));
    form.querySelectorAll('[data-adv-close]').forEach((b) => b.addEventListener('click', () => setPanel(false)));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') setPanel(false); });
    void L;
  });
}
