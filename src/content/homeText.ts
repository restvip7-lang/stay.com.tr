/**
 * Тексты главной на 5 языках (ТЗ Б.1). Русские блоки «О компании» и «Способы покупки» правятся в API и админке;
 * для остальных языков — переводы здесь (вычитка носителями — см. отчёт).
 */
import type { Lang } from '../i18n/config';

export const COMPANY: Record<Exclude<Lang, 'ru'>, { title: string; html: string; metrics: [string, string, string] }> = {
  en: {
    title: 'Stay Property — your reliable partner',
    html: '<p>Stay Property is a full-cycle real estate agency and developer in one company. We offer the full range of services for buying property in different regions of Turkey, fair prices and a wide choice of new-build and resale homes.</p><p>Our main principle is to always act in the client’s interest: you get good service and property that is attractive both as an investment and as a place to live.</p>',
    metrics: ['Apartments delivered', 'Own projects', 'Founded'],
  },
  tr: {
    title: 'Stay Property — güvenilir ortağınız',
    html: '<p>Stay Property, tam hizmet veren bir emlak ajansı ve müteahhidi tek çatı altında birleştirir. Türkiye’nin farklı bölgelerinde gayrimenkul alımı için hizmetlerin tamamını, uygun fiyatları ve yeni ile ikinci el konutlarda geniş seçeneği sunuyoruz.</p><p>Temel ilkemiz her zaman müşterinin çıkarına hareket etmektir: iyi hizmet ve hem yatırım hem yaşam için cazip gayrimenkul.</p>',
    metrics: ['Teslim edilen daire', 'Kendi projemiz', 'Kuruluş yılı'],
  },
  de: {
    title: 'Stay Property — Ihr verlässlicher Partner',
    html: '<p>Stay Property vereint Immobilienagentur mit Komplettservice und Bauträger in einem Unternehmen. Wir bieten alle Leistungen für den Immobilienkauf in verschiedenen Regionen der Türkei, faire Preise und eine große Auswahl an Neubau- und Bestandsobjekten.</p><p>Unser Grundsatz: immer im Interesse des Kunden handeln — mit gutem Service und Immobilien, die als Investition und zum Wohnen attraktiv sind.</p>',
    metrics: ['Übergebene Wohnungen', 'Eigene Projekte', 'Gründungsjahr'],
  },
  sr: {
    title: 'Stay Property — vaš pouzdan partner',
    html: '<p>Stay Property objedinjuje agenciju za nekretnine sa punom uslugom i investitora u jednoj kompaniji. Nudimo sve usluge za kupovinu nekretnina u različitim regionima Turske, povoljne cene i veliki izbor novogradnje i polovnih stanova.</p><p>Naš osnovni princip je da uvek delujemo u interesu klijenta: dobra usluga i nekretnine privlačne i kao investicija i za život.</p>',
    metrics: ['Predatih stanova', 'Sopstvenih projekata', 'Godina osnivanja'],
  },
};

export const BUY: Record<Exclude<Lang, 'ru'>, { variants: { title: string; text: string }[]; online: { title: string; text: string; link: string; tags: string[] } }> = {
  en: {
    variants: [
      { title: 'Mortgage', text: 'Special terms from partner banks' },
      { title: 'Installments', text: 'Convenient terms for buying property' },
      { title: 'Trade-in', text: 'Buy an apartment by exchanging your current property' },
    ],
    online: { title: 'Buy online', text: 'Choose an apartment and pay without visiting the office', link: 'Choose an apartment', tags: ['Personal manager', 'Fast approval', 'One form'] },
  },
  tr: {
    variants: [
      { title: 'Konut kredisi', text: 'Partner bankalardan özel koşullar' },
      { title: 'Taksit', text: 'Gayrimenkul alımında uygun koşullar' },
      { title: 'Trade-in', text: 'Mevcut mülkünüzü takas ederek daire alın' },
    ],
    online: { title: 'Online satın alma', text: 'Ofise gelmeden daire seçin ve ödeme yapın', link: 'Daire seçin', tags: ['Kişisel yönetici', 'Hızlı onay', 'Tek form'] },
  },
  de: {
    variants: [
      { title: 'Hypothek', text: 'Sonderkonditionen von Partnerbanken' },
      { title: 'Ratenzahlung', text: 'Günstige Bedingungen für den Immobilienkauf' },
      { title: 'Trade-in', text: 'Wohnung im Tausch gegen Ihre bisherige Immobilie kaufen' },
    ],
    online: { title: 'Online kaufen', text: 'Wohnung wählen und bezahlen, ohne ins Büro zu kommen', link: 'Wohnung wählen', tags: ['Persönlicher Berater', 'Schnelle Zusage', 'Ein Formular'] },
  },
  sr: {
    variants: [
      { title: 'Hipoteka', text: 'Posebni uslovi partnerskih banaka' },
      { title: 'Plaćanje na rate', text: 'Povoljni uslovi za kupovinu nekretnine' },
      { title: 'Trade-in', text: 'Kupite stan uz zamenu postojeće nekretnine' },
    ],
    online: { title: 'Kupovina onlajn', text: 'Izaberite stan i platite bez dolaska u kancelariju', link: 'Izaberite stan', tags: ['Lični menadžer', 'Brzo odobrenje', 'Jedan formular'] },
  },
};

/** SEO-текст и FAQ главной (ТЗ Б.1 п. 11–12). Цифры подставляются из каталога. */
export function homeSeo(lang: Lang, n: { sale: number; complexes: number; minPrice: string }): { html: string; faq: { q: string; a: string }[] } {
  const T: Record<Lang, { html: string; faq: { q: string; a: string }[] }> = {
    ru: {
      html: `<p>Stay Property — агентство недвижимости и застройщик в Алании. В каталоге ${n.sale} объектов на продажу${n.minPrice ? ` по ценам от ${n.minPrice}` : ''} и ${n.complexes} жилых комплексов: квартиры, виллы и дуплексы у моря, новостройки от застройщика и вторичное жильё.</p><p>Мы подбираем недвижимость под задачу — для жизни, отдыха, аренды или получения ВНЖ и гражданства, — проверяем документы до оплаты и сопровождаем сделку до регистрации права собственности. Покупку можно провести дистанционно.</p>`,
      faq: [
        { q: 'Может ли иностранец купить недвижимость в Турции?', a: 'Да. Граждане большинства стран покупают жильё в Турции на тех же условиях, что и турки; право собственности подтверждает ТАПУ. Ограничения есть только для отдельных зон и стран.' },
        { q: 'Какие расходы есть кроме цены квартиры?', a: 'Основной — пошлина за регистрацию права собственности, 4% от стоимости в договоре. Добавьте оценку, перевод, нотариуса и страховку DASK. Точную смету менеджер даст по конкретному объекту.' },
        { q: 'Даёт ли покупка недвижимости гражданство?', a: 'Да, при покупке на сумму от 400 000 $ и обязательстве не продавать объект три года. Покупка дешевле даёт основание для ВНЖ.' },
        { q: 'Можно ли купить квартиру, не приезжая в Турцию?', a: 'Да. Объект можно посмотреть онлайн, а сделку провести по нотариальной доверенности.' },
      ],
    },
    en: {
      html: `<p>Stay Property is a real estate agency and developer in Alanya. The catalogue has ${n.sale} properties for sale${n.minPrice ? ` from ${n.minPrice}` : ''} and ${n.complexes} residential complexes: apartments, villas and duplexes by the sea, new builds from the developer and resale homes.</p><p>We find property for your goal — living, holidays, rental income or a residence permit and citizenship — check the documents before payment and support the deal until ownership is registered. The purchase can be done remotely.</p>`,
      faq: [
        { q: 'Can a foreigner buy property in Turkey?', a: 'Yes. Citizens of most countries buy homes in Turkey on the same terms as Turkish citizens; ownership is confirmed by the title deed (TAPU). Restrictions apply only to certain zones and countries.' },
        { q: 'What costs are there besides the price?', a: 'The main one is the title deed transfer fee of 4% of the contract value. Add valuation, translation, notary and DASK earthquake insurance. Your manager will give an exact estimate for the property.' },
        { q: 'Does buying property give citizenship?', a: 'Yes, for purchases of USD 400,000 or more with an obligation not to sell for three years. Cheaper purchases can be a basis for a residence permit.' },
        { q: 'Can I buy without travelling to Turkey?', a: 'Yes. You can view the property online and complete the deal under a notarised power of attorney.' },
      ],
    },
    tr: {
      html: `<p>Stay Property, Alanya’da bir emlak ajansı ve müteahhittir. Katalogda ${n.sale} satılık gayrimenkul${n.minPrice ? ` (${n.minPrice}’dan başlayan fiyatlarla)` : ''} ve ${n.complexes} konut projesi var: denize yakın daireler, villalar ve dubleksler, müteahhitten yeni projeler ve ikinci el konutlar.</p><p>Amacınıza göre — yaşam, tatil, kira geliri ya da oturma izni ve vatandaşlık — gayrimenkul seçiyor, ödemeden önce belgeleri kontrol ediyor ve tapu tesciline kadar süreci yönetiyoruz. Satın alma uzaktan yapılabilir.</p>`,
      faq: [
        { q: 'Yabancılar Türkiye’de gayrimenkul alabilir mi?', a: 'Evet. Çoğu ülkenin vatandaşları Türkiye’de Türk vatandaşlarıyla aynı koşullarda konut alabilir; mülkiyet tapu ile belgelenir. Kısıtlamalar yalnızca bazı bölgeler ve ülkeler için geçerlidir.' },
        { q: 'Fiyat dışında hangi masraflar var?', a: 'Ana masraf, sözleşme bedelinin %4’ü olan tapu harcıdır. Ekspertiz, tercüme, noter ve DASK sigortası da eklenir. Kesin hesabı yöneticiniz verir.' },
        { q: 'Gayrimenkul alımı vatandaşlık sağlar mı?', a: 'Evet, 400.000 $ ve üzeri alımlarda ve üç yıl satmama taahhüdüyle. Daha düşük tutarlı alımlar oturma izni için dayanak olabilir.' },
        { q: 'Türkiye’ye gelmeden satın alabilir miyim?', a: 'Evet. Gayrimenkulü online görebilir, işlemi noter onaylı vekaletnameyle tamamlayabilirsiniz.' },
      ],
    },
    de: {
      html: `<p>Stay Property ist Immobilienagentur und Bauträger in Alanya. Im Katalog finden Sie ${n.sale} Objekte zum Kauf${n.minPrice ? ` ab ${n.minPrice}` : ''} und ${n.complexes} Wohnanlagen: Wohnungen, Villen und Maisonetten am Meer, Neubauten vom Bauträger und Bestandsimmobilien.</p><p>Wir finden Immobilien für Ihr Ziel — Wohnen, Urlaub, Mieteinnahmen oder Aufenthaltserlaubnis und Staatsbürgerschaft —, prüfen die Dokumente vor der Zahlung und begleiten den Kauf bis zur Eintragung des Eigentums. Der Kauf ist auch aus der Ferne möglich.</p>`,
      faq: [
        { q: 'Können Ausländer in der Türkei Immobilien kaufen?', a: 'Ja. Bürger der meisten Länder kaufen zu denselben Bedingungen wie Türken; das Eigentum wird durch die Tapu bestätigt. Einschränkungen gelten nur für bestimmte Zonen und Länder.' },
        { q: 'Welche Kosten kommen zum Preis hinzu?', a: 'Hauptposten ist die Grundbuchgebühr von 4 % des Vertragswerts. Hinzu kommen Gutachten, Übersetzung, Notar und DASK-Erdbebenversicherung. Ihr Berater nennt die genauen Kosten für das Objekt.' },
        { q: 'Bringt ein Immobilienkauf die Staatsbürgerschaft?', a: 'Ja, bei Käufen ab 400.000 US-Dollar und der Verpflichtung, drei Jahre nicht zu verkaufen. Günstigere Käufe können Grundlage für eine Aufenthaltserlaubnis sein.' },
        { q: 'Kann ich kaufen, ohne in die Türkei zu reisen?', a: 'Ja. Sie können das Objekt online besichtigen und den Kauf per notarieller Vollmacht abschließen.' },
      ],
    },
    sr: {
      html: `<p>Stay Property je agencija za nekretnine i investitor u Alanji. U katalogu je ${n.sale} nekretnina na prodaju${n.minPrice ? ` po cenama od ${n.minPrice}` : ''} i ${n.complexes} stambenih kompleksa: stanovi, vile i dupleksi kod mora, novogradnja od investitora i polovni stanovi.</p><p>Biramo nekretninu prema vašem cilju — za život, odmor, izdavanje ili boravišnu dozvolu i državljanstvo —, proveravamo dokumente pre plaćanja i vodimo kupovinu do upisa vlasništva. Kupovina je moguća na daljinu.</p>`,
      faq: [
        { q: 'Može li stranac da kupi nekretninu u Turskoj?', a: 'Da. Građani većine zemalja kupuju pod istim uslovima kao turski državljani; vlasništvo potvrđuje TAPU. Ograničenja važe samo za pojedine zone i zemlje.' },
        { q: 'Koji troškovi postoje osim cene?', a: 'Glavni je taksa za upis vlasništva od 4% vrednosti iz ugovora. Dodaju se procena, prevod, notar i DASK osiguranje. Tačan obračun daje menadžer.' },
        { q: 'Da li kupovina nekretnine daje državljanstvo?', a: 'Da, za kupovinu od 400.000 $ uz obavezu da se nekretnina ne prodaje tri godine. Jeftinija kupovina može biti osnov za boravišnu dozvolu.' },
        { q: 'Mogu li da kupim bez dolaska u Tursku?', a: 'Da. Nekretninu možete pogledati onlajn, a kupovinu završiti preko overenog punomoćja.' },
      ],
    },
  };
  return T[lang];
}
