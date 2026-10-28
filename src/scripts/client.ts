// Небольшой клиентский код: формы заявок, избранное, модальное окно.

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

  document.querySelectorAll<HTMLFormElement>('[data-lead-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const err = form.querySelector<HTMLElement>('[data-error]')!;
      const phone = String(fd.get('phone') || '').replace(/[^\d+]/g, '');
      let msg = '';
      if (!String(fd.get('name') || '').trim()) msg = 'Укажите имя.';
      else if (phone.replace(/\D/g, '').length < 7) msg = 'Укажите телефон.';
      else if (!fd.get('agree')) msg = 'Нужно согласие на обработку данных.';
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

export function initFavorites() {
  const sync = () => {
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
  };
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
