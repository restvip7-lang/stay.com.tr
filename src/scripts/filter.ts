// Фильтр каталога: собирает адрес (ЧПУ для гео/сделки/типа и белого списка фич, остальное — ?параметры),
// на посадочной обновляет выдачу на месте, на главной ведёт в каталог.
import { syncFavorites } from './client';

const ROOM_FEATURE: Record<string, string> = { '1+1': '1-bedroom', '2+1': '2-bedrooms', '3+1': '3-bedrooms', '4+': '4-bedrooms' };
const PRICE_TO = ['100000', '150000', '200000'];
const PARAMS = ['ref', 'price_from', 'price_to', 'rooms', 'sea_from', 'sea_to', 'area_from', 'area_to', 'floor_from', 'floor_to', 'prive', 'citizenship', 'own', 'project', 'ready_from', 'ready_to', 'f', 'sort'];

/** Форма слова для числа, как pluralL на сервере. */
function pluralW(lang: string, n: number, f: [string, string, string]) {
  if (lang === 'tr') return f[0];
  if (lang !== 'ru' && lang !== 'sr') return n === 1 ? f[0] : f[1];
  const a = n % 100, b = a % 10;
  return a > 10 && a < 20 ? f[2] : b > 1 && b < 5 ? f[1] : b === 1 ? f[0] : f[2];
}

type Allowed = Record<string, Record<string, string[]>>;

/** Адрес по состоянию формы. */
export function buildUrl(form: HTMLFormElement): string {
  const fd = new FormData(form);
  const val = (k: string) => String(fd.get(k) ?? '').trim();
  const lang = form.dataset.lang || 'ru';
  const city = val('city');
  // Страна «Все»: берём страну выбранного города, иначе — все страны (/{lang}/sale/). PRIVE — Турция.
  const cityCountry = city ? form.querySelector<HTMLOptionElement>(`[data-city] option[value="${CSS.escape(city)}"]`)?.dataset.country : '';
  const country = val('country') || cityCountry || (form.dataset.mode === 'prive' ? 'turkey' : '');
  const district = city ? val('district') : '';
  const deal = val('deal') || 'sale';
  const type = val('type');
  const allowed: Allowed = JSON.parse(form.dataset.allowed || '{}');
  const ok = (f: string) => !!type && !!allowed[deal]?.[type]?.includes(f);

  // Одинаковые поля бывают в ряду чипов и в окне «Все фильтры» — значения без повторов.
  const sp = new URLSearchParams();
  for (const k of PARAMS) for (const v of new Set(fd.getAll(k).map((x) => String(x).replace(/\s/g, '')))) {
    if (v) sp.append(k, v);
  }
  if (deal !== 'sale') { sp.delete('prive'); sp.delete('citizenship'); sp.delete('own'); }
  // «Проект» и «Срок сдачи» — только для STAY PROJECTS (галочка «Объекты Stay»).
  if (!sp.has('own')) sp.delete('project');
  // «Срок сдачи» — только когда выбраны все проекты (как у образца).
  if (!sp.has('own') || sp.has('project')) { sp.delete('ready_from'); sp.delete('ready_to'); }

  // Фича в адресе: сохранённая из текущего адреса, иначе — из сочетания полей (белый список).
  let feature = val('feature');
  const fs = () => sp.getAll('f');
  if (feature && fs().includes(feature)) sp.delete('f', feature);
  if (feature && !ok(feature)) {
    sp.append('f', feature);
    feature = '';
  }
  // Одна фича из белого списка — в адрес (ЧПУ); несколько — остаются параметрами ?f=…
  if (!feature && fs().length === 1 && ok(fs()[0])) { feature = fs()[0]; sp.delete('f'); }
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
    const show = r.hasAttribute('data-year') ? (n: number) => String(n) : fmt;
    const lo = r.querySelector<HTMLInputElement>('[data-lo]')!;
    const hi = r.querySelector<HTMLInputElement>('[data-hi]')!;
    const slo = r.querySelector<HTMLInputElement>('[data-slo]')!;
    const shi = r.querySelector<HTMLInputElement>('[data-shi]')!;
    const min = Number(r.dataset.min), max = Number(r.dataset.max);
    const toNum = (s: string) => Number(s.replace(/\D/g, ''));
    slo.addEventListener('input', () => {
      if (+slo.value > +shi.value) slo.value = shi.value;
      lo.value = +slo.value <= min ? '' : show(+slo.value);
    });
    shi.addEventListener('input', () => {
      if (+shi.value < +slo.value) shi.value = slo.value;
      hi.value = +shi.value >= max ? '' : show(+shi.value);
    });
    [slo, shi].forEach((s) => s.addEventListener('change', () => form.dispatchEvent(new Event('change'))));
    lo.addEventListener('input', () => { slo.value = String(toNum(lo.value) || min); });
    hi.addEventListener('input', () => { shi.value = String(toNum(hi.value) || max); });
  });
  form.querySelectorAll<HTMLInputElement>('[data-lo],[data-hi]').forEach((i) => {
    let fresh = false;
    i.addEventListener('focus', () => { i.select(); fresh = true; });
    i.addEventListener('mouseup', (e) => { if (fresh) { e.preventDefault(); fresh = false; } });
    const year = !!i.closest('[data-year]');
    i.addEventListener('input', () => {
      const n = i.value.replace(/\D/g, '').slice(0, year ? 4 : 9);
      i.value = n ? (year ? n : fmt(Number(n))) : '';
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
    const country = form.querySelector<HTMLSelectElement>('[data-country]');
    const city = form.querySelector<HTMLSelectElement>('[data-city]');
    const district = form.querySelector<HTMLSelectElement>('[data-district]');
    const cascade = () => {
      // Фильтр страницы PRIVE — без гео.
      if (!country || !city || !district) return;
      city.querySelectorAll<HTMLOptionElement>('option[data-country]').forEach((o) => {
        o.hidden = !!country.value && o.dataset.country !== country.value;
        if (o.hidden && o.selected) city.value = '';
      });
      district.querySelectorAll<HTMLOptionElement>('option[data-city]').forEach((o) => {
        o.hidden = !city.value || o.dataset.city !== city.value;
        if (o.hidden && o.selected) district.value = '';
      });
      district.disabled = !city.value;
    };
    country?.addEventListener('change', cascade);
    city?.addEventListener('change', cascade);
    cascade();
    initRanges(form, fmt);

    // Тоггл «Лоты PRIVE» и «Гражданство ТР» видны только для продажи; PRIVE красит страницу.
    const saleOnly = form.querySelectorAll<HTMLElement>('[data-sale-only]');
    const syncDeal = () => {
      const deal = String(new FormData(form).get('deal') || 'sale');
      saleOnly.forEach((el) => (el.hidden = deal !== 'sale'));
      const prive = deal === 'sale' && !!form.querySelector<HTMLInputElement>('[name=prive]')?.checked;
      const own = deal === 'sale' && !!form.querySelector<HTMLInputElement>('[name=own]')?.checked;
      // Шапку подсвечивает только тумблер PRIVE на главной (там он переключает блоки страницы).
      // В каталоге (общий фильтр) и на страницах PRIVE / STAY PROJECTS шапку не трогаем (Anuar 25.11.2026).
      if (form.dataset.mode !== 'home') return;
      void own;
      document.body.classList.toggle('mode-prive', prive);
    };
    syncDeal();

    // Чипы-фичи в ряду: × снимает фичу (из адреса или галочку в «Все фильтры»).
    form.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>('[data-chip-field],[data-uncheck]');
      if (!b) return;
      if (b.dataset.chipField) {
        const h = form.querySelector<HTMLInputElement>(`input[type=hidden][name="${b.dataset.chipField}"]`);
        if (h) form.querySelectorAll<HTMLInputElement>(`input[name=f][value="${CSS.escape(h.value)}"]`).forEach((i) => (i.checked = false));
        h?.remove();
      }
      if (b.dataset.uncheck) form.querySelectorAll<HTMLInputElement>(`input[name=f][value="${CSS.escape(b.dataset.uncheck)}"]`).forEach((i) => (i.checked = false));
      b.remove();
      form.dispatchEvent(new Event('change'));
    });
    // Поля-двойники (чипы в ряду и в окне) держим в одном состоянии; снятая фича из адреса уходит из адреса.
    form.addEventListener('change', (e) => {
      const i = e.target as HTMLInputElement;
      if (i.matches?.('[data-sync]')) form.querySelectorAll<HTMLInputElement>(`input[name="${i.name}"][value="${CSS.escape(i.value)}"]`).forEach((x) => (x.checked = i.checked));
      if (i.matches?.('[data-feature]') && !i.checked) {
        const h = form.querySelector<HTMLInputElement>('input[type=hidden][name=feature]');
        if (h?.value === i.value) h.remove();
      }
    }, true);

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
          const btn = form.querySelector<HTMLElement>('[data-nouns]');
          const noun = form.querySelector('[data-noun]');
          const forms = btn && JSON.parse(btn.dataset.nouns || '{}')[String(new FormData(form).get('type') ?? '')];
          if (noun && forms) noun.textContent = pluralW(form.dataset.lang || 'ru', total, forms);
        } catch { /* счётчик не критичен */ }
      }, 250);
    };

    // Посадочная: если сменились гео/сделка/тип — переходим на новую посадочную,
    // если только параметры — подменяем выдачу и адрес (кнопка «Назад» работает).
    let seq = 0;
    let go: number | undefined;
    const atLoad = new URLSearchParams(location.search);
    const ownAtLoad = atLoad.has('own'), projAtLoad = atLoad.has('project');
    const apply = () => {
      clearTimeout(go);
      go = window.setTimeout(async () => {
        const url = buildUrl(form);
        const next = new URL(url, location.origin);
        // Галочка «Объекты Stay» меняет набор полей (фильтр STAY PROJECTS) — страницу перезагружаем целиком.
        if (next.pathname !== location.pathname || next.searchParams.has('own') !== ownAtLoad || next.searchParams.has('project') !== projAtLoad) { location.href = url; return; }
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

    // Счётчик на кнопке «Фильтры» и «Сбросить фильтры» (как у образца): сколько фильтров включено: город и район считаются, страна, сделка и тип — нет.
    const fcount = () => {
      const fd = new FormData(form);
      const has = (...k: string[]) => k.some((x) => fd.getAll(x).some((v) => String(v).trim()));
      const n = [has('city'), has('district'), has('rooms'), has('prive'), has('own'), has('citizenship'), has('price_from', 'price_to'), has('area_from', 'area_to'), has('sea_from', 'sea_to'), has('floor_from', 'floor_to'), has('ref'), has('feature'), has('own') && has('project'), has('own') && has('ready_from', 'ready_to')].filter(Boolean).length
        + new Set(fd.getAll('f').map(String).filter((x) => x !== String(fd.get('feature') ?? ''))).size;
      form.querySelectorAll<HTMLElement>('[data-fcount]').forEach((el) => { el.textContent = String(n); el.hidden = !n; });
      form.querySelectorAll<HTMLElement>('[data-freset]').forEach((el) => (el.hidden = !n));
    };
    form.addEventListener('change', () => { syncDeal(); if (catalog) { fcount(); apply(); } else count(); });
    form.addEventListener('input', (e) => {
      if (!(e.target as HTMLElement).matches('[data-lo],[data-hi],[name=ref]')) return;
      if (catalog) { fcount(); apply(); } else count();
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Как у образца: «Показать N» ведёт в каталог. С PRIVE и STAY PROJECTS — с уже стоящей галочкой
      // PRIVE / «Объекты Stay» в поле «Тип недвижимости», с «Новостроек» — в квартиры в новостройках.
      location.href = buildUrl(form);
    });
    if (catalog) addEventListener('popstate', () => location.reload());

    // Каталог: при прокрутке фильтр закрепляется вверху экрана, шапка уезжает (как у образца mr-group.ru/flats/).
    const holder = form.parentElement;
    if (catalog && holder) {
      let stuck = false;
      const onScroll = () => {
        const on = holder.getBoundingClientRect().top < 0;
        if (on === stuck) return;
        stuck = on;
        holder.style.minHeight = on ? `${form.offsetHeight}px` : '';
        form.classList.toggle('is-stuck', on);
        document.body.classList.toggle('filter-stuck', on);
      };
      onScroll();
      addEventListener('scroll', onScroll, { passive: true });
      addEventListener('resize', () => { if (stuck) { stuck = false; form.classList.remove('is-stuck'); holder.style.minHeight = ''; } onScroll(); });
    }
    addEventListener('pageshow', (e) => { if ((e as PageTransitionEvent).persisted) { cascade(); syncDeal(); } });

    // Маленький фильтр: «Выбрать квартиру ˅» — список типов; выбор меняет слово в заголовке и пересчитывает лоты.
    form.querySelectorAll<HTMLElement>('[data-tsel]').forEach((box) => {
      const btn = box.querySelector<HTMLButtonElement>('[data-tsel-btn]')!;
      const label = box.querySelector<HTMLElement>('[data-tsel-label]')!;
      const open = (on: boolean) => { box.toggleAttribute('data-open', on); btn.setAttribute('aria-expanded', String(on)); };
      btn.addEventListener('click', () => open(!box.hasAttribute('data-open')));
      box.querySelectorAll<HTMLInputElement>('[data-tsel-opt]').forEach((o) => o.addEventListener('change', () => { label.textContent = o.dataset.tselOpt || ''; open(false); }));
      document.addEventListener('click', (e) => { if (!box.contains(e.target as Node)) open(false); });
      addEventListener('keydown', (e) => { if (e.key === 'Escape') open(false); });
    });

    // STAY PROJECTS: выпадающие поля «Комнатность», «Стоимость», «Площадь», «Срок сдачи» (как у образца).
    form.querySelectorAll<HTMLElement>('[data-drop]').forEach((box) => {
      const btn = box.querySelector<HTMLButtonElement>('[data-drop-btn]')!;
      const open = (on: boolean) => {
        if (on) form.querySelectorAll<HTMLElement>('[data-drop][data-open]').forEach((x) => x !== box && x.removeAttribute('data-open'));
        box.toggleAttribute('data-open', on); btn.setAttribute('aria-expanded', String(on));
      };
      btn.addEventListener('click', () => open(!box.hasAttribute('data-open')));
      document.addEventListener('click', (e) => { if (!box.contains(e.target as Node)) open(false); });
      addEventListener('keydown', (e) => { if (e.key === 'Escape') open(false); });
    });
    // «Срок сдачи»: быстрые кнопки «Сдан» / «До конца года» и крестик очистки.
    form.querySelectorAll<HTMLElement>('[data-ready-box]').forEach((box) => {
      const lo = box.querySelector<HTMLInputElement>('[name=ready_from]')!;
      const hi = box.querySelector<HTMLInputElement>('[name=ready_to]')!;
      const T = JSON.parse(box.dataset.t || '{}');
      const btn = box.closest('[data-drop]')?.querySelector<HTMLElement>('[data-drop-btn]');
      // Подпись поля и отметка быстрой кнопки — сразу, без перезагрузки.
      const label = () => {
        const a = lo.value, b = hi.value;
        const quick = !a && b === String(T.Y - 1) ? 'done' : !a && b === String(T.Y) ? 'year' : '';
        const v = quick ? T[quick] : a && a === b ? `${a}${T.y}` : [a && `${T.from} ${a}${T.y}`, b && `${T.to} ${b}${T.y}`].filter(Boolean).join(' ');
        box.querySelectorAll<HTMLElement>('[data-ready-quick]').forEach((q, i) => q.classList.toggle('chip-on', quick === (i ? 'year' : 'done')));
        if (!btn) return;
        btn.replaceChildren();
        // Стили поля — со scope Astro: переносим атрибут data-astro-cid-* на новые элементы.
        const cid = [...btn.attributes].find((x) => x.name.startsWith('data-astro-cid'))?.name;
        const mk = (tag: string) => { const el = document.createElement(tag); if (cid) el.setAttribute(cid, ''); return el; };
        const strong = mk('strong');
        if (v) { const em = mk('em'); em.textContent = T.label; btn.append(em); strong.textContent = v; }
        else { strong.className = 'ptype-ph'; strong.textContent = T.label; }
        btn.append(strong);
      };
      form.addEventListener('change', label);
      const set = (a: string, b: string) => { lo.value = a; hi.value = b; form.dispatchEvent(new Event('change')); };
      box.querySelectorAll<HTMLElement>('[data-ready-quick]').forEach((b) => b.addEventListener('click', () => set(b.dataset.from ?? '', b.dataset.to ?? '')));
      box.querySelector('[data-ready-clear]')?.addEventListener('click', () => set('', ''));
    });
    // «Проект»: «Все проекты» снимает галочки; список сужается по «Срок сдачи».
    form.querySelectorAll<HTMLElement>('[data-proj-list]').forEach((list) => {
      const all = list.querySelector<HTMLElement>('[data-proj-all]');
      all?.addEventListener('click', () => {
        list.querySelectorAll<HTMLInputElement>('input[name=project]').forEach((i) => (i.checked = false));
        form.dispatchEvent(new Event('change'));
      });
      const sync = () => {
        const fd = new FormData(form);
        const a = Number(fd.get('ready_from')) || 0, b = Number(fd.get('ready_to')) || 0;
        list.querySelectorAll<HTMLElement>('[data-year]').forEach((row) => {
          const y = Number(row.dataset.year) || 0;
          row.hidden = !!(a || b) && (!y || (!!a && y < a) || (!!b && y > b));
        });
        all?.setAttribute('aria-pressed', String(!list.querySelector('input[name=project]:checked')));
      };
      form.addEventListener('change', sync);
      form.addEventListener('input', sync);
    });
    // Поля-двойники «от / до» (в ряду и в окне «Все фильтры») — одно значение.
    form.addEventListener('input', (e) => {
      const i = e.target as HTMLInputElement;
      if (!i.name || !i.matches('[data-lo],[data-hi]')) return;
      form.querySelectorAll<HTMLInputElement>(`input[name="${i.name}"]`).forEach((x) => { if (x !== i) x.value = i.value; });
    });

    // Каталог: «Тип недвижимости» — список с галочками PRIVE / «Объекты Stay» и типами (как у образца).
    form.querySelectorAll<HTMLElement>('[data-ptype]').forEach((box) => {
      const btn = box.querySelector<HTMLButtonElement>('[data-ptype-btn]')!;
      const val = box.querySelector<HTMLElement>('[data-ptype-v]')!;
      const all = box.querySelector<HTMLButtonElement>('[data-ptype-all]');
      const any = box.querySelector<HTMLElement>('[data-ptype-list]')?.dataset.any ?? '';
      const open = (on: boolean) => { box.toggleAttribute('data-open', on); btn.setAttribute('aria-expanded', String(on)); };
      const sync = () => {
        const type = box.querySelector<HTMLInputElement>('[data-ptype-type]:checked')?.dataset.ptypeType || any;
        const cls = [...box.querySelectorAll<HTMLInputElement>('[data-ptype-class]:checked')].map((i) => i.dataset.ptypeClass);
        val.textContent = cls.length && !box.hasAttribute('data-plain') ? `${type}: ${cls.join(', ')}` : type;
        all?.setAttribute('aria-pressed', String(!cls.length));
      };
      btn.addEventListener('click', () => open(!box.hasAttribute('data-open')));
      all?.addEventListener('click', () => {
        form.querySelectorAll<HTMLInputElement>('input[name=prive],input[name=own]').forEach((i) => (i.checked = false));
        form.dispatchEvent(new Event('change'));
      });
      box.querySelectorAll<HTMLInputElement>('[data-ptype-type]').forEach((i) => i.addEventListener('change', () => open(false)));
      form.addEventListener('change', sync);
      document.addEventListener('click', (e) => { if (!box.contains(e.target as Node)) open(false); });
      addEventListener('keydown', (e) => { if (e.key === 'Escape') open(false); });
    });

    // «Фильтры»: панель на весь экран; выдача под ней обновляется сразу, кнопка внизу закрывает панель.
    const panel = form.querySelector<HTMLElement>('[data-adv-panel]');
    const setPanel = (open: boolean) => { panel?.classList.toggle('hidden', !open); document.body.style.overflow = open ? 'hidden' : ''; document.body.classList.toggle('adv-open', open); };
    form.querySelectorAll('[data-adv-open]').forEach((b) => b.addEventListener('click', () => setPanel(true)));
    form.querySelectorAll('[data-adv-close]').forEach((b) => b.addEventListener('click', () => setPanel(false)));
    form.addEventListener('input', (e) => { if ((e.target as HTMLElement).matches('[name=floor_from],[name=floor_to]') && catalog) apply(); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') setPanel(false); });
    void L;
  });
}
