const nf = new Intl.NumberFormat('ru-RU');

export function money(n: number | null | undefined, cur = '€'): string {
  if (n == null || !Number.isFinite(n)) return 'Цена по запросу';
  return `${nf.format(Math.round(n))} ${cur}`;
}

export function num(n: number | null | undefined): string {
  return n == null ? '' : nf.format(n);
}

export function plural(n: number, forms: [string, string, string]): string {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

export function date(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function sea(m: number | null | undefined): string {
  if (!m) return '';
  return m >= 1000 ? `${(m / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} км до моря` : `${m} м до моря`;
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Простой Markdown новостей (абзацы, **жирный**, списки) → HTML. */
export function mdToHtml(md: string): string {
  if (!md) return '';
  if (/<p[\s>]/i.test(md)) return md;
  const blocks = md.replace(/\r/g, '').split(/\n{2,}/);
  return blocks
    .map((b) => {
      const lines = b.split('\n').filter(Boolean);
      const inline = (t: string) => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      if (lines.every((l) => /^\s*[-*•]\s+/.test(l))) {
        return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*•]\s+/, ''))}</li>`).join('')}</ul>`;
      }
      if (/^#{1,3}\s/.test(lines[0] ?? '')) return `<h3>${inline(lines[0].replace(/^#+\s/, ''))}</h3>${lines.slice(1).map((l) => `<p>${inline(l)}</p>`).join('')}`;
      return lines.map((l) => `<p>${inline(l)}</p>`).join('');
    })
    .join('');
}

/** Убирает HTML-теги — для описаний и превью. */
export function strip(html: string, max = 160): string {
  const t = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t;
}
