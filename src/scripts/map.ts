// Карта на Leaflet + OpenStreetMap. Скрипт и стили грузятся только когда карту открыли.
type Pt = { t: string; u: string; lat: number; lng: number; a?: string; pr?: number | null };

const LEAFLET = 'https://unpkg.com/leaflet@1.9.4/dist/';

function load(): Promise<any> {
  const w = window as any;
  if (w.L) return Promise.resolve(w.L);
  return new Promise((res, rej) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = LEAFLET + 'leaflet.css';
    document.head.append(css);
    const s = document.createElement('script');
    s.src = LEAFLET + 'leaflet.js';
    s.onload = () => res(w.L);
    s.onerror = rej;
    document.head.append(s);
  });
}

export async function mountMap(el: HTMLElement) {
  const pts: Pt[] = JSON.parse(el.dataset.points || '[]');
  const L = await load();
  const map = L.map(el, { scrollWheelZoom: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap',
  }).addTo(map);
  const icon = L.divIcon({ className: '', html: '<span style="display:block;width:18px;height:18px;border-radius:50%;background:#754be9;border:3px solid #fff;box-shadow:0 2px 8px #0005"></span>', iconSize: [18, 18] });
  const markers = pts.map((p) =>
    L.marker([p.lat, p.lng], { icon }).bindPopup(
      `<a href="${p.u}" style="font-weight:600;color:#090714">${p.t}</a>${p.a ? `<br><span style="color:#8e909a">${p.a}</span>` : ''}${p.pr ? `<br>от ${p.pr.toLocaleString('ru-RU')} €` : ''}`,
    ),
  );
  const group = L.featureGroup(markers).addTo(map);
  if (markers.length) map.fitBounds(group.getBounds().pad(0.15));
  else map.setView([36.54, 32.0], 11);
}
