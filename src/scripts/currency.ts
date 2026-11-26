/** Переключатель валют на карточке объекта: цена в HTML — в евро ([data-price-eur], [data-m2-eur], кнопки [data-cur] в [data-currency]). */
import { pageLocale } from './client';

export function initCurrency() {
  // Валюта: цена в HTML — в евро. Курсы ЕЦБ подгружаем сразу, поэтому по клику цена
  // и цена за м² пересчитываются мгновенно; выбор запоминается для других объектов.
  const box = document.querySelector<HTMLElement>('[data-currency]');
  const priceEl = document.querySelector<HTMLElement>('[data-price-eur]');
  const m2El = document.querySelector<HTMLElement>('[data-m2-eur]');
  const eur = Number(priceEl?.dataset.priceEur || 0);
  if (box && priceEl && eur) {
    const orig = { price: priceEl.textContent ?? '', m2: m2El?.textContent ?? '' };
    const suffix = priceEl.dataset.priceSuffix ?? '';
    const m2eur = Number(m2El?.dataset.m2Eur || 0);
    let saved = 'EUR';
    try { saved = localStorage.getItem('stay-cur') || 'EUR'; } catch { /* без хранилища */ }
    const ratesP: Promise<Record<string, number>> = fetch('/api/rates').then((r) => r.json()).then((j) => j.rates ?? {}).catch(() => ({}));
    let rates: Record<string, number> | null = null;
    let want = saved;
    ratesP.then((r) => { rates = r; });
    const fmt = (n: number, cur: string) => Math.round(n).toLocaleString(pageLocale(), { style: 'currency', currency: cur, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 });
    const apply = (cur: string, r: Record<string, number> | null) => {
      const k = cur === 'EUR' ? 1 : r?.[cur];
      if (!k) return false;
      box.querySelectorAll<HTMLElement>('[data-cur]').forEach((x) => { const on = x.dataset.cur === cur; x.setAttribute('aria-pressed', String(on)); x.classList.toggle('is-on', on); });
      if (cur === 'EUR') { priceEl.textContent = orig.price; if (m2El) m2El.textContent = orig.m2; return true; }
      priceEl.textContent = fmt(eur * k, cur) + suffix;
      if (m2El && m2eur) m2El.textContent = fmt(m2eur * k, cur);
      return true;
    };
    box.addEventListener('click', async (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-cur]');
      if (!b) return;
      const cur = (want = b.dataset.cur!);
      const r = rates ?? (cur === 'EUR' ? null : await ratesP);
      if (cur !== want) return; // пока грузились курсы, выбрали другую валюту
      if (apply(cur, r)) {
        try { localStorage.setItem('stay-cur', cur); } catch { /* без хранилища */ }
      }
    });
    if (saved !== 'EUR') ratesP.then((r) => { if (want === saved) apply(saved, r); });
  }
}
