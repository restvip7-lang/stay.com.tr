/**
 * Перетаскивание строк в списках-очередях админки (Anuar 26.11.2026: «перетаскивать, а не стрелочками»).
 * Строки — <li data-sort>. Мышью строку тянут за любое место (кроме кнопок), пальцем — за ручку [data-sort-handle],
 * чтобы обычная прокрутка страницы на телефоне не превращалась в перетаскивание. Esc отменяет.
 * Стрелки ↑/↓ остаются запасным способом (клавиатура, точная перестановка).
 * Список перерисовывается сам по onMove(from, to) — здесь только жест и временная перестановка в DOM.
 */
export function sortable(list: HTMLElement, onMove: (from: number, to: number) => void) {
  type Drag = {
    li: HTMLElement; id: number; from: number; startY: number; grab: number; y: number; ty: number;
    active: boolean; next: Node | null; scroller: HTMLElement | null; raf: number;
  };
  let drag: Drag | null = null;
  const rows = () => [...list.children].filter((n): n is HTMLElement => n instanceof HTMLElement && n.hasAttribute('data-sort'));
  const scrollParent = (el: HTMLElement): HTMLElement | null => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const o = getComputedStyle(p).overflowY;
      if ((o === 'auto' || o === 'scroll') && p.scrollHeight > p.clientHeight) return p;
    }
    return null;
  };

  list.addEventListener('dragstart', (e) => e.preventDefault()); // картинки не тащим «призраком» браузера
  list.addEventListener('pointerdown', (e) => {
    if (drag || e.button !== 0) return;
    const t = e.target as HTMLElement;
    const li = t.closest<HTMLElement>('li[data-sort]');
    if (!li || li.parentElement !== list) return;
    const onHandle = !!t.closest('[data-sort-handle]');
    if (!onHandle && (e.pointerType !== 'mouse' || t.closest('button:not([data-pick]),input,select,textarea,a'))) return;
    const top = li.getBoundingClientRect().top;
    drag = { li, id: e.pointerId, from: rows().indexOf(li), startY: e.clientY, grab: e.clientY - top, y: e.clientY, ty: 0, active: false, next: li.nextSibling, scroller: scrollParent(list), raf: 0 };
    if (onHandle) e.preventDefault();
  });

  const place = () => {
    if (!drag) return;
    const { li } = drag;
    // куда встать: перед первой строкой, чья середина ниже центра перетаскиваемой
    const center = drag.y - drag.grab + li.offsetHeight / 2;
    const others = rows().filter((r) => r !== li);
    const before = others.find((r) => { const b = r.getBoundingClientRect(); return center < b.top + b.height / 2; });
    if (before) { if (li.nextElementSibling !== before) list.insertBefore(li, before); }
    else if (list.lastElementChild !== li) list.appendChild(li);
    const natural = li.getBoundingClientRect().top - drag.ty;
    drag.ty = drag.y - drag.grab - natural;
    li.style.transform = `translateY(${drag.ty}px)`;
  };

  const autoscroll = () => {
    if (!drag?.active) return;
    const edge = 56;
    const box = drag.scroller ? drag.scroller.getBoundingClientRect() : { top: 0, bottom: innerHeight };
    const dy = drag.y < box.top + edge ? -Math.ceil((box.top + edge - drag.y) / 4) : drag.y > box.bottom - edge ? Math.ceil((drag.y - box.bottom + edge) / 4) : 0;
    if (dy) { if (drag.scroller) drag.scroller.scrollTop += dy; else scrollBy(0, dy); place(); }
    drag.raf = requestAnimationFrame(autoscroll);
  };

  const start = () => {
    if (!drag) return;
    drag.active = true;
    drag.li.classList.add('is-dragging');
    list.classList.add('is-sorting');
    document.documentElement.style.cursor = 'grabbing';
    drag.raf = requestAnimationFrame(autoscroll);
  };

  const finish = (commit: boolean) => {
    if (!drag) return;
    const d = drag;
    drag = null;
    cancelAnimationFrame(d.raf);
    d.li.style.transform = '';
    d.li.classList.remove('is-dragging');
    list.classList.remove('is-sorting');
    document.documentElement.style.cursor = '';
    if (!d.active) return;
    // клик после перетаскивания не должен выбирать/нажимать строку
    const eat = (ev: Event) => { ev.stopPropagation(); ev.preventDefault(); };
    window.addEventListener('click', eat, { capture: true, once: true });
    setTimeout(() => window.removeEventListener('click', eat, { capture: true }), 0);
    const to = rows().indexOf(d.li);
    if (!commit || to === d.from) { list.insertBefore(d.li, d.next && d.next.parentNode === list ? d.next : null); return; }
    onMove(d.from, to);
  };

  window.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag.y = e.clientY;
    if (!drag.active) { if (Math.abs(e.clientY - drag.startY) < 5) return; start(); }
    e.preventDefault();
    place();
  });
  window.addEventListener('pointerup', (e) => { if (drag && e.pointerId === drag.id) finish(true); });
  window.addEventListener('pointercancel', (e) => { if (drag && e.pointerId === drag.id) finish(false); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drag?.active) finish(false); });
}

/** Перестановка элемента массива на новое место (для onMove). */
export function moveItem<T>(arr: T[], from: number, to: number) {
  const [x] = arr.splice(from, 1);
  arr.splice(to, 0, x);
}

/** Ручка «⠿» для строки списка. */
export const sortHandle = '<span data-sort-handle title="Перетащите, чтобы поменять порядок" aria-hidden="true" class="sort-handle">⠿</span>';
