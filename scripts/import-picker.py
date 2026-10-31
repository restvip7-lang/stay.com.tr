#!/usr/bin/env python3
"""
Перенос подборщика квартир из репозитория apartment-picker в сайт.

Исходник не меняем: скрипт читает его index.html и картинки и собирает из них
  - src/styles/picker.css          — стили подборщика под классом .ap в цветах и шрифтах сайта;
  - src/components/PickerMarkup.html — разметка подборщика (вставляется в PickerPage.astro);
  - public/picker/picker.js        — логика подборщика с небольшими правками под сайт;
  - public/picker/<ЖК>/*.jpg       — рендер, план этажа, планировки.

Запуск: python3 scripts/import-picker.py <папка apartment-picker> [slug ЖК]
Каждая правка JS проверяется: если в исходнике что-то поменялось и замена не нашлась, скрипт падает.
"""
import re, shutil, sys
from pathlib import Path

SRC = Path(sys.argv[1] if len(sys.argv) > 1 else '../apartment-picker')
SLUG = sys.argv[2] if len(sys.argv) > 2 else 'cebeci-vista-residence'
ROOT = Path(__file__).resolve().parent.parent
html = (SRC / 'index.html').read_text(encoding='utf-8')

# ---------- части исходника ----------
styles = re.findall(r'<style>(.*?)</style>', html, re.S)
css = '\n'.join(styles)
body = html.split('<body>', 1)[1]
body = re.sub(r'<style>.*?</style>', '', body, flags=re.S)
markup, js = body.split('<script>', 1)
js = js.split('</script>', 1)[0]

# ---------- цвета и шрифты сайта ----------
TOKENS = """
  --bg:#f0f1f6; --surface:#fff; --surface-2:#f5f5f9; --fg:#1c1e26; --muted:#6b6d77; --line:#e2e3e8;
  --accent:#754be9; --accent-ink:#fff; --sel:#754be9;
  --free:#22a565; --booked:#d6a520; --sold:#9a9ca6;
  --plan:#f6f4ef; --plan-ink:#1d2533;
  --display:var(--font-display); --body:var(--font-sans);
  --r:20px; --shadow:0 12px 32px rgba(28,30,38,.16);
  color-scheme:light;
"""
css = re.sub(r':root\{.*?\n\}', ':root{' + TOKENS + '}', css, count=1, flags=re.S)
css = re.sub(r'@media \(prefers-color-scheme: dark\)\{[^\n]*\n', '', css)
css = re.sub(r':root\[data-theme="dark"\]\{[^\n]*\n', '', css)

COLOR = [
    ('rgba(245,181,74,', 'rgba(117,75,233,'),       # янтарный → фирменный фиолетовый
    ('#ffd08a', '#ffffff'),
    ('#f5b54a', '#754be9'),
    ('#0f1a2e', '#e9eaf0'),                          # фон сцены
    ('#9be3bd', '#1a8a52'), ('#7fd3a7', '#1a8a52'),  # светло-зелёный на тёмном → зелёный на светлом
    ('#3a4a68', '#d0d1d7'),
    ('#f2c76b', '#a16207'), ('#ff8a7a', '#d92d20'), ('#ff8fa3', '#e5484d'),
    ('border:1px solid #6b5520;background:#2a2312;color:#f2d79b', 'border:1px solid #f0d48a;background:#fff7e0;color:#6b4e00'),
    ('color:#1d1606', 'color:#1c1e26'), ('color:#141a26', 'color:#fff'),
    ('rgba(4,8,16,', 'rgba(9,7,20,'),
]
for a, b in COLOR:
    css = css.replace(a, b)
# Кнопки управления и сердечко поверх картинки: белые, как кнопки сайта.
css = css.replace('border:1px solid rgba(255,255,255,.25);background:rgba(11,18,32,.82);color:#fff',
                  'border:1px solid var(--line);background:rgba(255,255,255,.94);color:var(--fg)')
css = css.replace('.ctrl:hover{background:rgba(11,18,32,.95)}', '.ctrl:hover{background:#fff;border-color:var(--accent);color:var(--accent)}')
css = css.replace('background:rgba(11,18,32,.85);border-color:transparent;color:#fff', 'background:rgba(255,255,255,.94);border-color:var(--line);color:var(--fg)')
# Скругления как у сайта: кнопки и поля 12, карточки 20.
css = css.replace('border-radius:10px', 'border-radius:12px')
# Заголовки широким шрифтом сайта — вес 500, как у заголовков сайта.
css = re.sub(r'font-family:var\(--display\);font-weight:700', 'font-family:var(--display);font-weight:500', css)
css = re.sub(r'font-family:var\(--display\);font-weight:500;font-weight:700', 'font-family:var(--display);font-weight:500', css)
# Слои над шапкой (z-50) и чатом (z-60) сайта.
for a, b in [('z-index:60', 'z-index:90'), ('z-index:65', 'z-index:85'), ('z-index:66', 'z-index:86'),
             ('z-index:70', 'z-index:95'), ('z-index:75', 'z-index:96'), ('z-index:80', 'z-index:97')]:
    css = css.replace(a, b)
css = css.replace('body.has-sticky{padding-bottom:96px}', 'body.has-sticky .ap{padding-bottom:96px}')
css = css.replace('body{padding-top:14px}', '')
# Своего переключателя языка нет: язык задаёт адрес сайта.
css = re.sub(r'\.lang[^{]*\{[^}]*\}\n?', '', css)
css = re.sub(r'@media \(max-width:720px\)\{ \.actions\s*\}\n?', '', css)


def scope_sel(sel: str) -> str:
    sel = sel.strip()
    if not sel:
        return sel
    if sel in (':root', 'body'):
        return '.ap'
    if sel.startswith('body.'):
        m = re.match(r'(body\.[\w-]+)\s*(.*)', sel)
        return f'{m.group(1)} .ap' + (f' {m.group(2)}' if m.group(2) else '')
    if sel.startswith('.ap'):
        return sel
    return '.ap ' + sel


def scope(text: str) -> str:
    out, i = [], 0
    while i < len(text):
        if text[i].isspace():
            out.append(text[i]); i += 1; continue
        if text.startswith('/*', i):
            j = text.index('*/', i) + 2
            out.append(text[i:j]); i = j; continue
        if text[i] == '@':
            j = text.index('{', i)
            head = text[i:j]
            depth, k = 1, j + 1
            while depth:
                depth += {'{': 1, '}': -1}.get(text[k], 0); k += 1
            inner = text[j + 1:k - 1]
            out.append(head + '{' + (scope(inner) if head.startswith('@media') else inner) + '}')
            i = k; continue
        j = text.find('{', i)
        if j < 0:
            out.append(text[i:]); break
        sel = text[i:j]
        k = text.index('}', j)
        lead = sel[:len(sel) - len(sel.lstrip())]
        out.append(lead + ','.join(scope_sel(s) for s in sel.split(',')) + text[j:k + 1])
        i = k + 1
    return ''.join(out)


css = scope(css)

# Классы сайта с теми же именами (.btn, .chip, .badge, .seg, .field) — гасим их свойства внутри подборщика.
RESET = """
/* Сброс одноимённых классов сайта (global.css) внутри подборщика */
.ap .btn{height:auto;line-height:1.2;letter-spacing:normal;font-family:inherit;transition:border-color .2s,background-color .2s,color .2s}
.ap .chip{height:auto;line-height:1.2;font-family:inherit;font-weight:inherit;color:inherit;transition:border-color .2s}
.ap .badge{gap:0;border:0;letter-spacing:normal;text-transform:none;line-height:1;font-weight:700}
.ap .seg{gap:0;padding:0;box-shadow:none}
.ap .seg>*{height:auto;border-radius:0;text-transform:none;letter-spacing:normal;line-height:1.2;font-weight:inherit;box-shadow:none;display:inline-flex;align-items:center;justify-content:center}
.ap .field{width:auto;height:auto;border-radius:0;background:none;border:0;padding:0;transition:none}
.ap .field:hover,.ap .field:focus{border-color:transparent}
"""
SITE = """
/* Встраивание в сайт */
.ap{padding:8px 0 48px;font-size:15px;line-height:1.5}
.ap .wrap{max-width:none}
.ap .btn.primary:hover{filter:none;background:var(--color-accent-2);border-color:var(--color-accent-2)}
body.fs-open .chat-root,body:has(.ap .modal:not([hidden])) .chat-root{display:none}
@media (max-width:720px){ body.has-sticky .chat-root{display:none} }
"""
css = '/* Сгенерировано scripts/import-picker.py из apartment-picker/index.html — правки вносить в скрипт */\n' + RESET + css + SITE

# ---------- разметка ----------
markup = re.sub(r'\s*<div class="lang" id="lang".*?</div>', '', markup, count=1, flags=re.S)
# Режим «Покупатель / Продажи» только для админа: показывает picker.js после проверки входа.
markup = markup.replace('<div class="seg" id="fMode"', '<div class="seg" id="fMode" hidden', 1)
markup = markup.strip() + '\n'

# ---------- логика ----------
def sub(old, new, count=1):
    global js
    n = js.count(old)
    if n < 1 or (count == 1 and n != 1):
        sys.exit(f'Не нашёл в JS (найдено {n}): {old[:80]}')
    js = js.replace(old, new)

sub("const IMG = {src:'complex.jpg'", "const AP = window.AP || {};\nconst IMG = {src:(AP.base||'')+'complex.jpg'")
sub("const L_IMG = {src:'floor-l.jpg'", "const L_IMG = {src:(AP.base||'')+'floor-l.jpg'")
sub("img: b.id==='L'? `apt-", "img: b.id==='L'? (AP.base||'')+`apt-")
# Язык — из адреса сайта (/ru/, /en/, /tr/); для /de/ и /sr/ — английский.
sub("let LANG=(()=>{ const u=new URLSearchParams(location.hash.split('?')[1]||'').get('lang'); if(LANGS.includes(u)) return u;\n"
    "  try{ const s=localStorage.getItem('ap.lang'); if(LANGS.includes(s)) return s }catch(e){}\n"
    "  const n=(navigator.language||'').slice(0,2).toLowerCase(); return LANGS.includes(n)?n:'en' })();",
    "let LANG=LANGS.includes(AP.lang)?AP.lang:'en';\n"
    "/* Старая ссылка с ?lang=en в адресе — открываем ту же квартиру на странице сайта этого языка. */\n"
    "function langRedirect(l){ if(!l||l===LANG||!AP.langUrl||!AP.langUrl[l]) return false; location.replace(AP.langUrl[l]+location.hash.replace(/([?&])lang=\\w+/,'$1lang='+l)); return true }\n"
    "{ const u=new URLSearchParams(location.hash.split('?')[1]||'').get('lang'); if(LANGS.includes(u)) langRedirect(u) }")
sub("document.documentElement.lang=LANG;", "document.querySelector('.ap')?.setAttribute('lang',LANG);")
sub("function setLang(l){ if(!LANGS.includes(l)) return; LANG=l; try{ localStorage.setItem('ap.lang',l) }catch(e){}\n"
    "  applyStatic(); mountedSig=''; go({...CUR},{replace:true,force:true}); syncSl() }",
    "function setLang(l){ if(LANGS.includes(l)) langRedirect(l) }")
sub("if(lang && lang!==LANG){ LANG=lang; applyStatic(); mountedSig='' } apply(st,{})",
    "if(lang && lang!==LANG && langRedirect(lang)) return; apply(st,{})")
sub("document.title=ttl;", "document.title=AP.name? `${ttl} — ${AP.name}` : ttl;")
# Цвета и шрифт на рендере.
sub("fill=\"${on?'#f5b54a':'#fff'}\" opacity=\".95\"/>\n      <text x=\"${cx}\" y=\"${y-8}\" text-anchor=\"middle\" font-family=\"Manrope,sans-serif\" font-size=\"20\" font-weight=\"800\" fill=\"#141a26\">",
    "fill=\"${on?'#754be9':'#fff'}\" opacity=\".95\"/>\n      <text x=\"${cx}\" y=\"${y-8}\" text-anchor=\"middle\" font-family=\"Manrope,sans-serif\" font-size=\"20\" font-weight=\"800\" fill=\"${on?'#fff':'#1c1e26'}\">")
sub('stroke="#f5b54a"', 'stroke="#754be9"')
js = js.replace('font-family="Manrope,sans-serif"', 'font-family="Inter,sans-serif"').replace('font-family="Manrope"', 'font-family="Inter"')
# Режим «Продажи», разметка этажей и последний шаг тура — только после входа в админку.
sub("$('#tourBtn').onclick=()=>tourGo(0);",
    "if(!AP.admin) TOUR.pop();\n"
    "fetch('/api/picker/me',{credentials:'same-origin',cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{ if(!j||!j.admin) return;\n"
    "  AP.admin=true; $('#fMode').hidden=false; if(TOUR.length<TOUR_ALL.length) TOUR.push(TOUR_ALL[TOUR_ALL.length-1]) }).catch(()=>{});\n"
    "$('#tourBtn').onclick=()=>tourGo(0);")
sub("const TOUR=[", "const TOUR_ALL=[")
sub("async function tourGo(i){", "const TOUR=[...TOUR_ALL];\nasync function tourGo(i){")
# Строки тура берём по номеру шага, без шага про «Продажи» для покупателей.
# Свои переменные — внутри функции, чтобы не пересекаться со скриптами сайта.
js = '/* Сгенерировано scripts/import-picker.py из apartment-picker/index.html — правки вносить в скрипт */\n(()=>{\n' + js + '\n})();\n'

# ---------- запись ----------
(ROOT / 'src/styles/picker.css').write_text(css, encoding='utf-8')
(ROOT / 'src/components/PickerMarkup.html').write_text(markup, encoding='utf-8')
pub = ROOT / 'public/picker'
(pub / SLUG).mkdir(parents=True, exist_ok=True)
(pub / 'picker.js').write_text(js, encoding='utf-8')
import hashlib
ver = hashlib.sha1(js.encode()).hexdigest()[:10]
(ROOT / 'src/lib/pickerVersion.ts').write_text(f"/** Версия public/picker/picker.js для сброса кэша (пишет scripts/import-picker.py). */\nexport const PICKER_JS_V = '{ver}';\n", encoding='utf-8')
for f in sorted(SRC.glob('*.jpg')):
    shutil.copyfile(f, pub / SLUG / f.name)
print('ok:', len(css), 'css,', len(js), 'js,', len(list((pub / SLUG).glob('*.jpg'))), 'картинок')
