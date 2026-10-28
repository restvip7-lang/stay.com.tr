/**
 * О компании, команда и отзывы (ТЗ 3.5–3.7). Русские тексты — со старого сайта (about.json),
 * переводы сделаны по ним и требуют вычитки носителями языков.
 */
import type { Lang } from '../i18n/config';
import about from './data/about.json';

type L = Record<Lang, string>;

/* ---------- О компании ---------- */

export const ABOUT: Record<Lang, { title: string; subtitle: string; description: string; paragraphs: string[]; video: string; why: string }> = {
  ru: {
    title: 'О компании Stay Property',
    subtitle: 'Смотрят везде, а покупают у нас: недвижимость в Турции — это Stay Property',
    description: 'Stay Property — агентство недвижимости полного цикла и застройщик в Алании: подбор, юридическая проверка, сопровождение сделки и сервис после покупки.',
    paragraphs: [],
    video: 'Видео о компании',
    why: 'Почему клиенты выбирают Stay Property',
  },
  en: {
    title: 'About Stay Property',
    subtitle: 'People look everywhere, but they buy with us: property in Turkey means Stay Property',
    description: 'Stay Property is a full-service real estate agency and developer in Alanya: property search, legal checks, deal support and after-sales service.',
    paragraphs: [
      'Stay Property is a full-cycle real estate agency and a developer in one company. We offer the full range of professional services for buying property in different regions of Turkey, competitive prices and a wide choice of new-build and resale homes.',
      'Over the years we have built up experience that lets us quickly find properties for any budget and wish, with the best return for the client. We know what buyers need and which offers on the Turkish market make the most sense as an investment.',
      'We only offer properties that provide a decent level of comfort and protect the value of your money. Our main principle is to always act in the client’s interest.',
    ],
    video: 'Video about the company',
    why: 'Why clients choose Stay Property',
  },
  tr: {
    title: 'Stay Property hakkında',
    subtitle: 'Her yere bakıyorlar, ama bizden alıyorlar: Türkiye’de gayrimenkul, Stay Property demektir',
    description: 'Stay Property, Alanya’da tam hizmet veren bir emlak ajansı ve müteahhittir: gayrimenkul seçimi, hukuki kontrol, satış süreci ve satış sonrası hizmet.',
    paragraphs: [
      'Stay Property, tam hizmet veren bir emlak ajansı ve müteahhidi tek çatı altında birleştirir. Türkiye’nin farklı bölgelerinde gayrimenkul alımı için profesyonel hizmetlerin tamamını, uygun fiyatları ve yeni ile ikinci el konutlarda geniş seçeneği sunuyoruz.',
      'Yıllar içinde edindiğimiz deneyim sayesinde her bütçeye ve isteğe uygun gayrimenkulü hızla buluyoruz. Alıcıların neye ihtiyaç duyduğunu ve Türkiye piyasasında yatırım açısından hangi tekliflerin mantıklı olduğunu biliyoruz.',
      'Yalnızca konforlu bir yaşam sunan ve yatırımınızın değerini koruyan gayrimenkuller öneriyoruz. Temel ilkemiz her zaman müşterinin çıkarına hareket etmektir.',
    ],
    video: 'Şirket tanıtım videosu',
    why: 'Müşteriler neden Stay Property’yi seçiyor',
  },
  de: {
    title: 'Über Stay Property',
    subtitle: 'Gesucht wird überall, gekauft bei uns: Immobilien in der Türkei heißt Stay Property',
    description: 'Stay Property ist Immobilienagentur mit Komplettservice und Bauträger in Alanya: Objektsuche, rechtliche Prüfung, Kaufbegleitung und Service nach dem Kauf.',
    paragraphs: [
      'Stay Property vereint eine Immobilienagentur mit Komplettservice und einen Bauträger in einem Unternehmen. Wir bieten das gesamte Spektrum an Leistungen für den Immobilienkauf in verschiedenen Regionen der Türkei, faire Preise und eine große Auswahl an Neubau- und Bestandsimmobilien.',
      'Dank langjähriger Erfahrung finden wir schnell Objekte für jedes Budget und jeden Wunsch. Wir wissen, was Käufer brauchen und welche Angebote auf dem türkischen Markt als Investition sinnvoll sind.',
      'Wir bieten nur Immobilien an, die komfortables Wohnen ermöglichen und den Wert Ihres Geldes erhalten. Unser Grundsatz: immer im Interesse des Kunden handeln.',
    ],
    video: 'Video über das Unternehmen',
    why: 'Warum Kunden Stay Property wählen',
  },
  sr: {
    title: 'O kompaniji Stay Property',
    subtitle: 'Gledaju svuda, a kupuju kod nas: nekretnine u Turskoj su Stay Property',
    description: 'Stay Property je agencija za nekretnine sa punom uslugom i investitor u Alanji: izbor nekretnine, pravna provera, vođenje kupovine i usluge posle kupovine.',
    paragraphs: [
      'Stay Property objedinjuje agenciju za nekretnine sa punom uslugom i investitora u jednoj kompaniji. Nudimo kompletan spektar usluga za kupovinu nekretnina u različitim regionima Turske, povoljne cene i veliki izbor novogradnje i polovnih stanova.',
      'Zahvaljujući dugogodišnjem iskustvu brzo pronalazimo nekretnine za svaki budžet i želju. Znamo šta je kupcima potrebno i koje ponude na turskom tržištu imaju smisla kao investicija.',
      'Nudimo samo nekretnine koje pružaju udoban život i čuvaju vrednost vašeg novca. Naš osnovni princip je da uvek delujemo u interesu klijenta.',
    ],
    video: 'Video o kompaniji',
    why: 'Zašto klijenti biraju Stay Property',
  },
};

/** «Почему мы»: картинки и русский текст — со старого сайта. */
const WHY_TR: Record<Exclude<Lang, 'ru'>, { title: string; text: string }[]> = {
  en: [
    { title: 'The best terms on the market', text: 'We are both a developer and an agency, so properties are sold without intermediaries. Modern construction technology lets us offer good prices and quality.' },
    { title: 'Legal checks', text: 'Before a property is added to our database, its legal status and actual condition are checked, so your choice and your investment are protected.' },
    { title: 'Wide choice of properties', text: 'From compact apartments to luxury penthouses, villas and seaside mansions — options for every taste and budget.' },
    { title: 'Turnkey support', text: 'Our specialists handle all legal paperwork and pre-sale preparation, so you can complete the purchase quickly without worrying about legal details.' },
    { title: 'Spotless reputation', text: 'We value our reputation and offer honest, transparent terms. Care for the client is our motto.' },
    { title: 'Client care', text: 'Full after-sales service — from interior design, furniture and appliances to help with moving to Turkey. We always stay in touch.' },
  ],
  tr: [
    { title: 'Piyasadaki en iyi koşullar', text: 'Hem müteahhit hem emlak ajansıyız; satış aracısız yapılır. Modern inşaat teknolojileri uygun fiyat ve kalite sunmamızı sağlar.' },
    { title: 'Hukuki kontrol', text: 'Her gayrimenkul, veri tabanımıza eklenmeden önce hukuki durumu ve fiili hali açısından kontrol edilir; yatırımınız güvende olur.' },
    { title: 'Geniş gayrimenkul seçeneği', text: 'Küçük dairelerden lüks çatı katlarına, villalara ve sahil konaklarına kadar her zevke ve bütçeye uygun seçenekler.' },
    { title: 'Anahtar teslim destek', text: 'Uzmanlarımız tüm hukuki işlemleri ve satış öncesi hazırlığı üstlenir; satın alma işlemini hızlı ve endişesiz tamamlarsınız.' },
    { title: 'Kusursuz itibar', text: 'İtibarımıza değer veriyor, dürüst ve şeffaf koşullar sunuyoruz. Müşteriye özen bizim ilkemizdir.' },
    { title: 'Müşteri ilgisi', text: 'İç tasarım, mobilya ve beyaz eşyadan Türkiye’ye taşınmaya kadar satış sonrası tüm hizmetler. Her zaman iletişimde kalıyoruz.' },
  ],
  de: [
    { title: 'Die besten Konditionen am Markt', text: 'Wir sind Bauträger und Agentur zugleich, daher verkaufen wir ohne Zwischenhändler. Moderne Bautechnik ermöglicht gute Preise und Qualität.' },
    { title: 'Rechtliche Prüfung', text: 'Bevor ein Objekt in unsere Datenbank aufgenommen wird, werden Rechtslage und tatsächlicher Zustand geprüft — Ihre Investition ist geschützt.' },
    { title: 'Große Auswahl', text: 'Von kompakten Apartments bis zu Luxus-Penthäusern, Villen und Anwesen am Meer — für jeden Geschmack und jedes Budget.' },
    { title: 'Begleitung aus einer Hand', text: 'Unsere Spezialisten übernehmen alle rechtlichen Formalitäten und die Vorbereitung des Kaufs, damit Sie schnell und sorgenfrei kaufen.' },
    { title: 'Tadelloser Ruf', text: 'Wir schätzen unseren Ruf und bieten ehrliche, transparente Bedingungen. Fürsorge für den Kunden ist unser Grundsatz.' },
    { title: 'Kundenbetreuung', text: 'Service nach dem Kauf — von Innendesign, Möbeln und Geräten bis zur Hilfe beim Umzug in die Türkei. Wir bleiben immer erreichbar.' },
  ],
  sr: [
    { title: 'Najbolji uslovi na tržištu', text: 'Mi smo i investitor i agencija, pa nekretnine prodajemo bez posrednika. Savremene tehnologije gradnje omogućavaju povoljne cene i kvalitet.' },
    { title: 'Pravna provera', text: 'Pre nego što nekretnina uđe u našu bazu, proveravaju se njen pravni status i stvarno stanje — vaša investicija je zaštićena.' },
    { title: 'Veliki izbor nekretnina', text: 'Od malih stanova do luksuznih penthausa, vila i kuća na obali — za svaki ukus i budžet.' },
    { title: 'Podrška „ključ u ruke”', text: 'Naši stručnjaci preuzimaju svu pravnu papirologiju i pripremu kupovine, pa kupovinu završavate brzo i bez brige.' },
    { title: 'Besprekorna reputacija', text: 'Cenimo svoju reputaciju i nudimo poštene i transparentne uslove. Briga o klijentu je naš moto.' },
    { title: 'Briga o klijentima', text: 'Kompletne usluge posle kupovine — od dizajna enterijera, nameštaja i aparata do pomoći pri preseljenju u Tursku. Uvek smo na vezi.' },
  ],
};

const strip = (h: string) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export function whyBlocks(lang: Lang): { title: string; text: string; image: string }[] {
  return about.why.map((w, i) => ({
    image: w.image,
    ...(lang === 'ru' ? { title: w.title, text: strip(w.html) } : WHY_TR[lang][i]),
  }));
}

export const ABOUT_RU_HTML = about.html;
export const ABOUT_IMAGE = about.image;
export const ABOUT_VIDEO = about.video;

/* ---------- Команда ---------- */

const LANG_CODES: Record<string, string> = {
  'русский': 'ru', 'английский': 'en', 'турецкий': 'tr', 'немецкий': 'de', 'украинский': 'uk', 'арабский': 'ar',
};

export interface Member {
  slug: string;
  name: L;
  photo: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  langs: string[];
}

const LATIN: Record<string, [string, string]> = {
  'Ульяна Коркмаз': ['ulyana-korkmaz', 'Ulyana Korkmaz'],
  'Наталья Лихошапка': ['natalia-likhoshapka', 'Natalia Likhoshapka'],
  'Самет Гёльгелен': ['samet-golgelen', 'Samet Gölgelen'],
  'Юлия Лега': ['yulia-lega', 'Yulia Lega'],
  'Елена Тебенко': ['elena-tebenko', 'Elena Tebenko'],
  'Ильмира Алиева': ['ilmira-alieva', 'Ilmira Alieva'],
  'Салих Хамут': ['salih-hamut', 'Salih Hamut'],
  'Вероника Панфиленко': ['veronika-panfilenko', 'Veronika Panfilenko'],
  'Ольга Кувшинова': ['olga-kuvshinova', 'Olga Kuvshinova'],
};

export const TEAM: Member[] = (about.team as Record<string, string>[]).map((m) => {
  const [slug, latin] = LATIN[m.name] ?? [m.name.toLowerCase().replace(/\s+/g, '-'), m.name];
  const phone = m['Телефон'] && !m['Телефон'].startsWith('http') ? m['Телефон'] : null;
  return {
    slug,
    name: { ru: m.name, en: latin, tr: latin, de: latin, sr: latin },
    photo: m.photo,
    phone,
    whatsapp: m.whatsapp || null,
    email: m['E-mail'] || null,
    langs: (m['Языки'] || '').split(',').map((s) => LANG_CODES[s.trim()]).filter(Boolean),
  };
});

export const memberBySlug = (slug: string) => TEAM.find((m) => m.slug === slug) ?? null;

/** Язык общения на языке страницы: «турецкий, русский…». */
export function langNames(lang: Lang, codes: string[]): string {
  try {
    const dn = new Intl.DisplayNames([lang === 'sr' ? 'sr-Latn' : lang], { type: 'language' });
    return codes.map((c) => dn.of(c) ?? c).join(', ');
  } catch {
    return codes.join(', ');
  }
}

export const MEMBER_ROLE: L = { ru: 'Менеджер по продажам', en: 'Sales manager', tr: 'Satış müdürü', de: 'Vertriebsmanager', sr: 'Menadžer prodaje' };
export const SPEAKS: L = { ru: 'Языки', en: 'Languages', tr: 'Diller', de: 'Sprachen', sr: 'Jezici' };

/** Автор статей блога — редакция (ТЗ Б.3: страница автора). Реальным менеджерам статьи не приписываем. */
export const EDITORIAL = {
  slug: 'editorial',
  name: { ru: 'Редакция Stay Property', en: 'Stay Property editorial team', tr: 'Stay Property editör ekibi', de: 'Redaktion von Stay Property', sr: 'Redakcija Stay Property' } as L,
  bio: {
    ru: 'Статьи блога готовят специалисты Stay Property: менеджеры по продажам, юристы и сотрудники отдела сопровождения сделок в Алании. Тексты о законах — общая справка, а не юридическая консультация; перед сделкой условия уточняют у юриста.',
    en: 'Blog articles are prepared by Stay Property specialists: sales managers, lawyers and the deal support team in Alanya. Articles about laws are general information, not legal advice; check the terms with a lawyer before a purchase.',
    tr: 'Blog yazıları Stay Property uzmanları tarafından hazırlanır: Alanya’daki satış müdürleri, avukatlar ve satış destek ekibi. Mevzuat yazıları genel bilgidir, hukuki danışmanlık değildir; satın almadan önce koşulları bir avukata danışın.',
    de: 'Die Blogartikel erstellen Spezialisten von Stay Property: Vertriebsmanager, Juristen und das Team der Kaufbegleitung in Alanya. Rechtsartikel sind allgemeine Informationen und keine Rechtsberatung; klären Sie die Bedingungen vor dem Kauf mit einem Anwalt.',
    sr: 'Članke na blogu pripremaju stručnjaci Stay Property: menadžeri prodaje, pravnici i tim za vođenje kupovine u Alanji. Članci o zakonima su opšte informacije, a ne pravni savet; pre kupovine uslove proverite sa pravnikom.',
  } as L,
};

/* ---------- Отзывы ---------- */

export interface Review { name: string; country: string; year: string; text: string; image: string | null }

export const REVIEWS: Review[] = (about.reviews as Record<string, string>[]).map((r) => ({
  name: r.name,
  country: r.country,
  year: (r.year || '').replace(/\D+/g, ''),
  text: r.text,
  image: r.image || null,
}));
