/**
 * Рубрика «Законы и оформление» (ТЗ 3.4, Б.4). Тексты — общая справка, не юридическая консультация;
 * перед публикацией их должен вычитать юрист и носители языков (см. отчёт).
 */
import type { Article } from './types';

const PUB = '2026-10-28';

export const LAWS: Article[] = [
  {
    slug: 'buying-property-in-turkey',
    cat: 'laws',
    published: PUB,
    updated: PUB,
    image: null,
    tr: {
      ru: {
        title: 'Как иностранцу купить недвижимость в Турции: этапы и расходы',
        description: 'Пошагово: выбор объекта, налоговый номер, договор, проверка документов, оценка и переоформление ТАПУ. Какие расходы ждут покупателя кроме цены квартиры.',
        body: `<p>Иностранцы могут покупать жильё в Турции почти так же, как граждане страны. Право собственности подтверждает ТАПУ — выписка из кадастрового реестра. Ниже — основные этапы сделки и расходы, о которых стоит знать заранее.</p>
<h2 id="steps">Этапы покупки</h2>
<ol><li><b>Выбор объекта.</b> Сравните районы, расстояние до моря, состояние комплекса и ежемесячные платежи за обслуживание (аидат).</li>
<li><b>Бронирование.</b> Обычно вносится депозит, который фиксирует цену и снимает объект с продажи. Условия возврата прописывают в расписке или предварительном договоре.</li>
<li><b>Налоговый номер.</b> Его получают в налоговой инспекции по паспорту; он нужен для договора, банковского счёта и коммунальных услуг.</li>
<li><b>Проверка документов.</b> До оплаты проверяют ТАПУ, отсутствие ипотеки и арестов, долги по налогам и коммунальным платежам, у новостроек — разрешения застройщика.</li>
<li><b>Оценка.</b> Для сделки с иностранцем нужен отчёт лицензированного оценщика (экспертиза) — он подтверждает рыночную стоимость.</li>
<li><b>Переоформление.</b> Сделка регистрируется в кадастровом управлении в назначенный день; при необходимости присутствует присяжный переводчик. После регистрации покупатель получает ТАПУ на своё имя.</li>
<li><b>После сделки.</b> Оформляют обязательную страховку от землетрясений (DASK), переписывают электричество и воду, подключают интернет.</li></ol>
<h2 id="costs">Расходы покупателя</h2>
<p>Основной сбор — пошлина за регистрацию права собственности, 4% от стоимости в договоре. По закону её делят продавец и покупатель, на практике чаще платит покупатель — это обсуждают до сделки. Кроме того, оплачиваются оценка, перевод и нотариальные услуги, страховка DASK и подключение коммунальных услуг. Точную смету по конкретному объекту даёт менеджер.</p>
<h2 id="remote">Можно ли купить дистанционно</h2>
<p>Да. Объект показывают по видеосвязи, а сделку проводят по нотариальной доверенности. Такой формат удобен тем, кто ещё не переехал или покупает для инвестиций.</p>
<h2 id="check">Почему важна проверка</h2>
<p>Самые частые проблемы — обременения, долги прежнего владельца и незавершённые разрешения у новостроек. Юристы Stay Property проверяют объект до внесения основной суммы; подробнее — на странице <a href="/ru/services/due-diligence/">проверки объекта перед покупкой</a>.</p>`,
        faq: [
          { q: 'Сколько стоит переоформление ТАПУ?', a: 'Регистрационная пошлина — 4% от стоимости в договоре. Отдельно оплачиваются оценка, перевод, страховка DASK и услуги нотариуса.' },
          { q: 'Нужен ли ВНЖ, чтобы купить квартиру?', a: 'Нет. Покупать недвижимость можно по загранпаспорту, а владение жильём само даёт основание подать документы на ВНЖ.' },
        ],
      },
      en: {
        title: 'How a foreigner buys property in Turkey: steps and costs',
        description: 'Step by step: choosing a property, tax number, contract, document checks, valuation and the TAPU transfer. Which costs a buyer pays on top of the price.',
        body: `<p>Foreigners can buy homes in Turkey on almost the same terms as Turkish citizens. Ownership is confirmed by the TAPU — the title deed from the land registry. Below are the main steps of a purchase and the costs worth knowing in advance.</p>
<h2 id="steps">Steps of the purchase</h2>
<ol><li><b>Choosing a property.</b> Compare districts, distance to the sea, the condition of the complex and the monthly maintenance fee (aidat).</li>
<li><b>Reservation.</b> A deposit usually fixes the price and takes the property off the market. Refund terms are set out in a receipt or a preliminary contract.</li>
<li><b>Tax number.</b> It is issued at the tax office against your passport and is needed for the contract, a bank account and utilities.</li>
<li><b>Document checks.</b> Before payment the TAPU, the absence of mortgages and seizures, tax and utility debts and, for new builds, developer permits are checked.</li>
<li><b>Valuation.</b> A sale to a foreigner requires a report from a licensed appraiser confirming the market value.</li>
<li><b>Transfer.</b> The deal is registered at the land registry on an appointed day, with a sworn translator if needed. After registration the buyer receives the TAPU in their name.</li>
<li><b>After the deal.</b> Compulsory earthquake insurance (DASK) is taken out, electricity and water are transferred and the internet is connected.</li></ol>
<h2 id="costs">Buyer costs</h2>
<p>The main charge is the title deed transfer fee of 4% of the contract value. By law it is split between seller and buyer; in practice the buyer often pays it, so agree on it before the deal. On top of that come the valuation, translation and notary services, DASK insurance and utility connections. Your manager will give an exact estimate for a specific property.</p>
<h2 id="remote">Can I buy remotely?</h2>
<p>Yes. The property is shown via video call and the deal is completed under a notarised power of attorney. This suits buyers who have not moved yet or buy for investment.</p>
<h2 id="check">Why due diligence matters</h2>
<p>The most common problems are encumbrances, debts of the previous owner and incomplete permits for new builds. Stay Property lawyers check the property before the main payment; see <a href="/en/services/due-diligence/">property due diligence</a>.</p>`,
        faq: [
          { q: 'How much does the TAPU transfer cost?', a: 'The registration fee is 4% of the contract value. Valuation, translation, DASK insurance and notary services are paid separately.' },
          { q: 'Do I need a residence permit to buy?', a: 'No. You can buy with a passport, and owning a home is itself a ground to apply for a residence permit.' },
        ],
      },
      tr: {
        title: 'Yabancılar Türkiye\'de nasıl gayrimenkul satın alır: adımlar ve masraflar',
        description: 'Adım adım: mülk seçimi, vergi numarası, sözleşme, belge kontrolü, ekspertiz ve tapu devri. Alıcının fiyat dışında ödediği masraflar.',
        body: `<p>Yabancılar Türkiye'de konutu neredeyse Türk vatandaşlarıyla aynı koşullarda satın alabilir. Mülkiyeti tapu müdürlüğünden alınan tapu belgesi kanıtlar. Aşağıda işlemin ana adımları ve önceden bilinmesi gereken masraflar yer alıyor.</p>
<h2 id="steps">Satın alma adımları</h2>
<ol><li><b>Mülk seçimi.</b> Bölgeleri, denize mesafeyi, sitenin durumunu ve aylık aidatı karşılaştırın.</li>
<li><b>Rezervasyon.</b> Genellikle kapora fiyatı sabitler ve mülkü satıştan çeker. İade koşulları makbuzda veya ön sözleşmede yazılır.</li>
<li><b>Vergi numarası.</b> Pasaportla vergi dairesinden alınır; sözleşme, banka hesabı ve abonelikler için gereklidir.</li>
<li><b>Belge kontrolü.</b> Ödemeden önce tapu, ipotek ve haciz olmadığı, vergi ve aidat borçları, yeni projelerde müteahhit izinleri kontrol edilir.</li>
<li><b>Ekspertiz.</b> Yabancıya satışta lisanslı bir değerleme uzmanının piyasa değerini teyit eden raporu gerekir.</li>
<li><b>Tapu devri.</b> İşlem belirlenen gün tapu müdürlüğünde, gerekirse yeminli tercüman eşliğinde yapılır. Tescilden sonra alıcı tapuyu kendi adına alır.</li>
<li><b>İşlemden sonra.</b> Zorunlu deprem sigortası (DASK) yapılır, elektrik ve su abonelikleri devredilir, internet bağlanır.</li></ol>
<h2 id="costs">Alıcının masrafları</h2>
<p>Ana masraf, sözleşme bedelinin %4'ü olan tapu harcıdır. Kanuna göre alıcı ve satıcı arasında paylaşılır; uygulamada çoğu zaman alıcı öder, bu yüzden işlemden önce konuşulmalıdır. Buna ekspertiz, tercüme ve noter hizmetleri, DASK ve abonelik bağlantıları eklenir. Belirli bir mülk için kesin hesabı yöneticiniz verir.</p>
<h2 id="remote">Uzaktan satın almak mümkün mü?</h2>
<p>Evet. Mülk görüntülü görüşmeyle gösterilir, işlem noter onaylı vekaletnameyle tamamlanır.</p>
<h2 id="check">Kontrol neden önemli</h2>
<p>En sık sorunlar şerhler, önceki sahibin borçları ve yeni projelerde eksik izinlerdir. Stay Property avukatları mülkü ana ödemeden önce kontrol eder; ayrıntılar: <a href="/tr/services/due-diligence/">satın alma öncesi gayrimenkul kontrolü</a>.</p>`,
        faq: [
          { q: 'Tapu devri ne kadar tutar?', a: 'Tapu harcı sözleşme bedelinin %4\'üdür. Ekspertiz, tercüme, DASK ve noter ayrıca ödenir.' },
          { q: 'Satın almak için oturma izni gerekir mi?', a: 'Hayır. Pasaportla satın alabilirsiniz; konut sahipliği oturma izni başvurusu için gerekçe oluşturur.' },
        ],
      },
      de: {
        title: 'Immobilienkauf in der Türkei als Ausländer: Ablauf und Kosten',
        description: 'Schritt für Schritt: Objektwahl, Steuernummer, Vertrag, Dokumentenprüfung, Gutachten und TAPU-Umschreibung. Welche Kosten neben dem Kaufpreis anfallen.',
        body: `<p>Ausländer können in der Türkei Wohneigentum zu fast denselben Bedingungen wie türkische Staatsbürger erwerben. Das Eigentum belegt die TAPU — der Grundbuchauszug. Hier die wichtigsten Schritte und die Kosten, die man vorab kennen sollte.</p>
<h2 id="steps">Ablauf des Kaufs</h2>
<ol><li><b>Objektwahl.</b> Vergleichen Sie Stadtteile, Entfernung zum Meer, Zustand der Anlage und die monatlichen Nebenkosten (Aidat).</li>
<li><b>Reservierung.</b> Eine Anzahlung sichert meist den Preis und nimmt das Objekt vom Markt. Rückzahlungsbedingungen stehen in der Quittung oder im Vorvertrag.</li>
<li><b>Steuernummer.</b> Sie wird beim Finanzamt gegen Vorlage des Reisepasses erteilt und für Vertrag, Bankkonto und Versorgungsverträge benötigt.</li>
<li><b>Dokumentenprüfung.</b> Vor der Zahlung werden TAPU, Hypotheken und Pfändungen, Steuer- und Nebenkostenschulden sowie bei Neubauten die Genehmigungen des Bauträgers geprüft.</li>
<li><b>Gutachten.</b> Beim Verkauf an Ausländer ist das Gutachten eines lizenzierten Sachverständigen über den Marktwert erforderlich.</li>
<li><b>Umschreibung.</b> Der Kauf wird am Termin im Grundbuchamt registriert, bei Bedarf mit vereidigtem Dolmetscher. Danach erhält der Käufer die TAPU auf seinen Namen.</li>
<li><b>Nach dem Kauf.</b> Die Pflicht-Erdbebenversicherung (DASK) wird abgeschlossen, Strom und Wasser werden umgemeldet, Internet wird angeschlossen.</li></ol>
<h2 id="costs">Kosten für den Käufer</h2>
<p>Die wichtigste Gebühr ist die Grundbuchgebühr von 4% des Vertragswerts. Gesetzlich teilen Käufer und Verkäufer sie; in der Praxis zahlt oft der Käufer — das sollte vorab geklärt werden. Hinzu kommen Gutachten, Übersetzung und Notar, die DASK-Versicherung und Anschlüsse. Eine genaue Aufstellung für ein bestimmtes Objekt erhalten Sie vom Berater.</p>
<h2 id="remote">Kann man aus der Ferne kaufen?</h2>
<p>Ja. Das Objekt wird per Videoanruf gezeigt, der Kauf erfolgt über eine notarielle Vollmacht.</p>
<h2 id="check">Warum die Prüfung wichtig ist</h2>
<p>Häufige Probleme sind Belastungen, Schulden des Vorbesitzers und unvollständige Genehmigungen bei Neubauten. Die Juristen von Stay Property prüfen das Objekt vor der Hauptzahlung; mehr dazu unter <a href="/de/services/due-diligence/">Objektprüfung vor dem Kauf</a>.</p>`,
        faq: [
          { q: 'Was kostet die TAPU-Umschreibung?', a: 'Die Grundbuchgebühr beträgt 4% des Vertragswerts. Gutachten, Übersetzung, DASK und Notar kommen hinzu.' },
          { q: 'Brauche ich eine Aufenthaltserlaubnis für den Kauf?', a: 'Nein. Der Kauf ist mit dem Reisepass möglich, und das Wohneigentum ist selbst ein Grund für den Antrag auf Aufenthaltserlaubnis.' },
        ],
      },
      sr: {
        title: 'Kako stranac kupuje nekretninu u Turskoj: koraci i troškovi',
        description: 'Korak po korak: izbor nekretnine, poreski broj, ugovor, provera dokumenata, procena i prenos tapije. Koje troškove kupac plaća pored cene.',
        body: `<p>Stranci mogu da kupe stan u Turskoj pod gotovo istim uslovima kao turski državljani. Vlasništvo potvrđuje tapija (TAPU) — izvod iz katastra. U nastavku su glavni koraci kupovine i troškovi koje treba znati unapred.</p>
<h2 id="steps">Koraci kupovine</h2>
<ol><li><b>Izbor nekretnine.</b> Uporedite naselja, udaljenost od mora, stanje kompleksa i mesečne troškove održavanja (aidat).</li>
<li><b>Rezervacija.</b> Depozit obično fiksira cenu i skida nekretninu sa prodaje. Uslovi povraćaja navode se u potvrdi ili predugovoru.</li>
<li><b>Poreski broj.</b> Izdaje ga poreska uprava na osnovu pasoša; potreban je za ugovor, bankovni račun i komunalije.</li>
<li><b>Provera dokumenata.</b> Pre plaćanja proveravaju se tapija, hipoteke i zabrane, poreski i komunalni dugovi, a kod novogradnje dozvole investitora.</li>
<li><b>Procena.</b> Za prodaju strancu potreban je izveštaj licenciranog procenitelja o tržišnoj vrednosti.</li>
<li><b>Prenos.</b> Kupovina se upisuje u katastru zakazanog dana, po potrebi uz sudskog tumača. Nakon upisa kupac dobija tapiju na svoje ime.</li>
<li><b>Posle kupovine.</b> Ugovara se obavezno osiguranje od zemljotresa (DASK), prebacuju se struja i voda i priključuje internet.</li></ol>
<h2 id="costs">Troškovi kupca</h2>
<p>Glavni trošak je taksa za prenos vlasništva od 4% od vrednosti iz ugovora. Po zakonu je dele prodavac i kupac; u praksi je često plaća kupac, pa se o tome dogovara unapred. Dodaju se procena, prevod i notar, DASK osiguranje i priključci. Tačan obračun za konkretnu nekretninu daje menadžer.</p>
<h2 id="remote">Da li je moguće kupiti na daljinu?</h2>
<p>Da. Nekretnina se pokazuje putem video poziva, a kupovina se obavlja preko overenog punomoćja.</p>
<h2 id="check">Zašto je provera važna</h2>
<p>Najčešći problemi su tereti, dugovi prethodnog vlasnika i nepotpune dozvole kod novogradnje. Pravnici Stay Property proveravaju nekretninu pre glavne uplate; više na stranici <a href="/sr/services/due-diligence/">provera nekretnine pre kupovine</a>.</p>`,
        faq: [
          { q: 'Koliko košta prenos tapije?', a: 'Taksa za upis je 4% od vrednosti iz ugovora. Procena, prevod, DASK i notar plaćaju se posebno.' },
          { q: 'Da li mi treba boravišna dozvola za kupovinu?', a: 'Ne. Kupovina je moguća sa pasošem, a vlasništvo nad stanom je osnov za zahtev za boravišnu dozvolu.' },
        ],
      },
    },
  },
  {
    slug: 'turkish-citizenship-by-investment',
    cat: 'laws',
    published: PUB,
    updated: PUB,
    image: null,
    tr: {
      ru: {
        title: 'Гражданство Турции за покупку недвижимости: условия',
        description: 'Гражданство Турции через инвестиции в недвижимость: минимальная сумма, запрет на продажу в течение трёх лет, кто из семьи получает паспорт и как идёт процесс.',
        body: `<p>Турция выдаёт гражданство иностранцам, которые инвестируют в недвижимость. Программа действует много лет, условия периодически меняются, поэтому перед сделкой их сверяют с юристом.</p>
<h2 id="terms">Основные условия</h2>
<ul><li>Покупка недвижимости на сумму от <b>400 000 долларов США</b> по оценке лицензированного оценщика.</li>
<li>Обязательство не продавать объект <b>три года</b> — отметка вносится в ТАПУ.</li>
<li>Оплата проходит через банк и подтверждается документами; сумма в договоре должна соответствовать оценке.</li>
<li>Можно купить один объект или несколько, если в сумме они дают нужную стоимость.</li></ul>
<h2 id="family">Кто получает гражданство</h2>
<p>Вместе с инвестором гражданство могут получить супруг или супруга и дети до 18 лет. Совершеннолетние дети подают документы отдельно.</p>
<h2 id="process">Как проходит процесс</h2>
<ol><li>Подбор объектов, подходящих по стоимости и документам.</li><li>Оценка и проверка, затем сделка и регистрация отметки о запрете продажи.</li><li>Получение справки о соответствии инвестиции требованиям.</li><li>Оформление ВНЖ и подача заявления на гражданство.</li></ol>
<p>Сроки зависят от загрузки ведомств и полноты документов — обычно это несколько месяцев.</p>
<h2 id="choose">Какие объекты подходят</h2>
<p>В каталоге есть подборка <a href="/ru/turkey/sale/apartments/citizenship/">квартир под гражданство</a> — дорогие объекты и проекты Stay Property, которые подходят по стоимости. Перед покупкой юристы проверяют, что объект можно оформить под программу.</p>`,
        faq: [
          { q: 'Можно ли продать квартиру раньше трёх лет?', a: 'Нет, если вы получаете гражданство по этой программе: запрет на продажу три года вносится в ТАПУ.' },
          { q: 'Нужно ли жить в Турции?', a: 'Нет. Программа не требует постоянного проживания в стране.' },
        ],
      },
      en: {
        title: 'Turkish citizenship by property investment: requirements',
        description: 'Turkish citizenship through real estate investment: minimum amount, the three-year no-sale rule, which family members get a passport and how the process works.',
        body: `<p>Turkey grants citizenship to foreigners who invest in real estate. The programme has run for years and its terms change from time to time, so check them with a lawyer before the deal.</p>
<h2 id="terms">Main requirements</h2>
<ul><li>Buying property worth at least <b>USD 400,000</b> according to a licensed appraiser.</li>
<li>An undertaking not to sell the property for <b>three years</b>, annotated on the TAPU.</li>
<li>Payment goes through a bank and is documented; the contract value must match the valuation.</li>
<li>You can buy one or several properties that together reach the required value.</li></ul>
<h2 id="family">Who receives citizenship</h2>
<p>The investor's spouse and children under 18 can receive citizenship together with the investor. Adult children apply separately.</p>
<h2 id="process">How the process works</h2>
<ol><li>Selecting properties that qualify by value and documents.</li><li>Valuation and checks, then the deal and the no-sale annotation.</li><li>A certificate confirming that the investment meets the requirements.</li><li>A residence permit and the citizenship application.</li></ol>
<p>Timing depends on the authorities' workload and complete documents — usually several months.</p>
<h2 id="choose">Which properties qualify</h2>
<p>The catalogue has a selection of <a href="/en/turkey/sale/apartments/citizenship/">apartments for citizenship</a> — higher-value listings and Stay Property projects that meet the threshold. Lawyers confirm that a property can be registered under the programme before purchase.</p>`,
        faq: [
          { q: 'Can I sell earlier than three years?', a: 'Not if you obtain citizenship under this programme: the three-year no-sale restriction is annotated on the TAPU.' },
          { q: 'Do I have to live in Turkey?', a: 'No. The programme does not require permanent residence.' },
        ],
      },
      tr: {
        title: 'Gayrimenkul yatırımıyla Türk vatandaşlığı: şartlar',
        description: 'Gayrimenkul yatırımıyla Türk vatandaşlığı: asgari tutar, üç yıl satmama şartı, aileden kimlerin vatandaş olabileceği ve sürecin işleyişi.',
        body: `<p>Türkiye, gayrimenkule yatırım yapan yabancılara vatandaşlık verir. Program uzun süredir uygulanıyor, şartları zaman zaman değişiyor; bu yüzden işlemden önce avukatla teyit edilmelidir.</p>
<h2 id="terms">Temel şartlar</h2>
<ul><li>Lisanslı değerleme raporuna göre en az <b>400.000 ABD doları</b> değerinde gayrimenkul alımı.</li>
<li>Mülkün <b>üç yıl</b> satılmayacağına dair tapuya şerh konulması.</li>
<li>Ödemenin banka üzerinden yapılması ve belgelenmesi; sözleşme bedelinin ekspertizle uyumlu olması.</li>
<li>Bir veya toplamda gerekli değere ulaşan birden fazla mülk alınabilir.</li></ul>
<h2 id="family">Kimler vatandaş olur</h2>
<p>Yatırımcıyla birlikte eşi ve 18 yaşından küçük çocukları vatandaşlık alabilir. Reşit çocuklar ayrı başvurur.</p>
<h2 id="process">Süreç nasıl işler</h2>
<ol><li>Değer ve belgeler açısından uygun mülklerin seçimi.</li><li>Ekspertiz ve kontrol, ardından satış ve şerh.</li><li>Yatırımın şartlara uygunluk belgesi.</li><li>İkamet izni ve vatandaşlık başvurusu.</li></ol>
<p>Süre, kurumların yoğunluğuna ve belgelerin eksiksizliğine bağlıdır — genellikle birkaç ay.</p>
<h2 id="choose">Hangi mülkler uygun</h2>
<p>Katalogda <a href="/tr/turkey/sale/apartments/citizenship/">vatandaşlığa uygun daireler</a> seçkisi bulunur. Satın almadan önce avukatlar mülkün programa uygun olduğunu teyit eder.</p>`,
        faq: [
          { q: 'Üç yıldan önce satabilir miyim?', a: 'Bu programla vatandaşlık alıyorsanız hayır: üç yıllık satış yasağı tapuya şerh edilir.' },
          { q: 'Türkiye\'de yaşamak zorunda mıyım?', a: 'Hayır. Program sürekli ikamet şartı aramaz.' },
        ],
      },
      de: {
        title: 'Türkische Staatsbürgerschaft durch Immobilienkauf: Voraussetzungen',
        description: 'Türkische Staatsbürgerschaft durch Immobilieninvestition: Mindestbetrag, drei Jahre Verkaufsverbot, welche Familienmitglieder einen Pass erhalten und der Ablauf.',
        body: `<p>Die Türkei verleiht Ausländern, die in Immobilien investieren, die Staatsbürgerschaft. Das Programm besteht seit Jahren, die Bedingungen ändern sich gelegentlich — vor dem Kauf sollten sie mit einem Juristen geprüft werden.</p>
<h2 id="terms">Wichtigste Voraussetzungen</h2>
<ul><li>Kauf von Immobilien im Wert von mindestens <b>400.000 US-Dollar</b> laut lizenziertem Gutachten.</li>
<li>Verpflichtung, das Objekt <b>drei Jahre</b> nicht zu verkaufen — Eintrag in der TAPU.</li>
<li>Zahlung über eine Bank mit Nachweis; der Vertragswert muss dem Gutachten entsprechen.</li>
<li>Es kann ein Objekt oder mehrere Objekte mit zusammen dem erforderlichen Wert gekauft werden.</li></ul>
<h2 id="family">Wer die Staatsbürgerschaft erhält</h2>
<p>Ehepartner und Kinder unter 18 Jahren können sie gemeinsam mit dem Investor erhalten. Volljährige Kinder stellen einen eigenen Antrag.</p>
<h2 id="process">Ablauf</h2>
<ol><li>Auswahl geeigneter Objekte nach Wert und Dokumenten.</li><li>Gutachten und Prüfung, dann Kauf und Eintrag des Verkaufsverbots.</li><li>Bescheinigung über die Erfüllung der Voraussetzungen.</li><li>Aufenthaltserlaubnis und Antrag auf Staatsbürgerschaft.</li></ol>
<p>Die Dauer hängt von der Auslastung der Behörden und vollständigen Unterlagen ab — meist einige Monate.</p>
<h2 id="choose">Welche Objekte geeignet sind</h2>
<p>Im Katalog finden Sie <a href="/de/turkey/sale/apartments/citizenship/">Wohnungen für die Staatsbürgerschaft</a>. Vor dem Kauf bestätigen Juristen die Eignung des Objekts.</p>`,
        faq: [
          { q: 'Kann ich vor Ablauf von drei Jahren verkaufen?', a: 'Nicht, wenn Sie die Staatsbürgerschaft über dieses Programm erhalten: Das Verkaufsverbot ist in der TAPU eingetragen.' },
          { q: 'Muss ich in der Türkei leben?', a: 'Nein. Ein ständiger Wohnsitz ist nicht erforderlich.' },
        ],
      },
      sr: {
        title: 'Tursko državljanstvo kupovinom nekretnine: uslovi',
        description: 'Tursko državljanstvo kroz investiciju u nekretnine: minimalni iznos, zabrana prodaje tri godine, koji članovi porodice dobijaju pasoš i kako teče postupak.',
        body: `<p>Turska dodeljuje državljanstvo strancima koji ulažu u nekretnine. Program postoji godinama, a uslovi se povremeno menjaju, pa ih pre kupovine treba proveriti sa pravnikom.</p>
<h2 id="terms">Osnovni uslovi</h2>
<ul><li>Kupovina nekretnine vredne najmanje <b>400.000 američkih dolara</b> prema licenciranoj proceni.</li>
<li>Obaveza da se nekretnina ne prodaje <b>tri godine</b> — upisuje se u tapiju.</li>
<li>Plaćanje ide preko banke uz dokaze; vrednost iz ugovora mora odgovarati proceni.</li>
<li>Može se kupiti jedna ili više nekretnina koje zajedno dostižu potrebnu vrednost.</li></ul>
<h2 id="family">Ko dobija državljanstvo</h2>
<p>Zajedno sa investitorom državljanstvo mogu dobiti supružnik i deca mlađa od 18 godina. Punoletna deca podnose zahtev posebno.</p>
<h2 id="process">Kako teče postupak</h2>
<ol><li>Izbor nekretnina koje odgovaraju po vrednosti i dokumentima.</li><li>Procena i provera, zatim kupovina i upis zabrane prodaje.</li><li>Potvrda da investicija ispunjava uslove.</li><li>Boravišna dozvola i zahtev za državljanstvo.</li></ol>
<p>Rok zavisi od opterećenosti institucija i potpunosti dokumenata — obično nekoliko meseci.</p>
<h2 id="choose">Koje nekretnine odgovaraju</h2>
<p>U katalogu postoji izbor <a href="/sr/turkey/sale/apartments/citizenship/">stanova za državljanstvo</a>. Pre kupovine pravnici potvrđuju da nekretnina odgovara programu.</p>`,
        faq: [
          { q: 'Mogu li da prodam pre tri godine?', a: 'Ne ako dobijate državljanstvo kroz ovaj program: zabrana prodaje od tri godine upisuje se u tapiju.' },
          { q: 'Da li moram da živim u Turskoj?', a: 'Ne. Program ne zahteva stalni boravak.' },
        ],
      },
    },
  },
  {
    slug: 'residence-permit-by-property',
    cat: 'laws',
    published: PUB,
    updated: PUB,
    image: null,
    tr: {
      ru: {
        title: 'ВНЖ в Турции на основании покупки недвижимости',
        description: 'Как получить вид на жительство в Турции как владелец жилья: минимальная стоимость объекта, ограничения по районам, документы и продление.',
        body: `<p>Владение жильём в Турции даёт основание подать документы на краткосрочный вид на жительство (ikamet). Ниже — основные правила; они меняются, поэтому актуальные условия по конкретному объекту уточняет юрист.</p>
<h2 id="value">Минимальная стоимость</h2>
<p>По действующим правилам стоимость жилья для ВНЖ должна быть не ниже установленного порога: в провинциях с городами-мегаполисами (к ним относится Анталья, а значит и Алания) он выше, чем в остальных. Стоимость подтверждает отчёт оценщика.</p>
<h2 id="districts">Ограничения по районам</h2>
<p>В части кварталов власти временно закрывают выдачу новых ВНЖ иностранцам, если их доля в населении превысила лимит. Списки обновляются: например, в 2026 году для получения ВНЖ снова открыли Махмутлар, Кестель, Авсаллар и Каргыджак. Перед покупкой проверьте статус квартала.</p>
<h2 id="docs">Документы</h2>
<ul><li>Загранпаспорт и его нотариальный перевод.</li><li>ТАПУ на ваше имя.</li><li>Медицинская страховка, действующая в Турции.</li><li>Фотографии и подтверждение адреса проживания.</li></ul>
<h2 id="renew">Продление</h2>
<p>ВНЖ выдают на срок до нескольких лет и продлевают, пока вы владеете жильём и соблюдаете правила пребывания. Подробнее о сопровождении — на странице <a href="/ru/services/residence-permit/">ВНЖ в Турции</a>.</p>`,
        faq: [
          { q: 'Можно ли получить ВНЖ, купив квартиру в рассрочку?', a: 'Основанием служит ТАПУ на ваше имя. Если по договору рассрочки ТАПУ оформляется после полной оплаты, подать на ВНЖ по собственности можно после этого.' },
        ],
      },
      en: {
        title: 'Turkish residence permit through property ownership',
        description: 'How to get a residence permit in Turkey as a homeowner: minimum property value, district restrictions, documents and renewal.',
        body: `<p>Owning a home in Turkey is a ground to apply for a short-term residence permit (ikamet). Below are the main rules; they change, so a lawyer confirms the current conditions for a specific property.</p>
<h2 id="value">Minimum value</h2>
<p>Under current rules the property must be worth at least a set threshold, which is higher in provinces with metropolitan municipalities (Antalya, and therefore Alanya, is one) than elsewhere. The value is confirmed by an appraisal report.</p>
<h2 id="districts">District restrictions</h2>
<p>In some neighbourhoods the authorities temporarily stop issuing new permits to foreigners when their share of residents exceeds a limit. The lists are updated: in 2026, for example, Mahmutlar, Kestel, Avsallar and Kargıcak reopened for residence permits. Check the status of the neighbourhood before buying.</p>
<h2 id="docs">Documents</h2>
<ul><li>Passport and its notarised translation.</li><li>TAPU in your name.</li><li>Health insurance valid in Turkey.</li><li>Photos and proof of address.</li></ul>
<h2 id="renew">Renewal</h2>
<p>The permit is issued for up to several years and renewed while you own the home and follow the residence rules. See <a href="/en/services/residence-permit/">residence permit in Turkey</a> for our support.</p>`,
        faq: [
          { q: 'Can I get a permit if I buy on an installment plan?', a: 'The ground is a TAPU in your name. If the installment contract transfers the TAPU after full payment, you can apply on the basis of ownership after that.' },
        ],
      },
      tr: {
        title: 'Gayrimenkul sahipliğiyle Türkiye\'de ikamet izni',
        description: 'Konut sahibi olarak Türkiye\'de ikamet izni nasıl alınır: asgari mülk değeri, bölge kısıtlamaları, belgeler ve uzatma.',
        body: `<p>Türkiye'de konut sahibi olmak kısa dönem ikamet izni başvurusu için gerekçedir. Aşağıda temel kurallar var; değişebildikleri için belirli bir mülk için güncel şartları avukat teyit eder.</p>
<h2 id="value">Asgari değer</h2>
<p>Mevcut kurallara göre mülkün belirli bir eşik değerin üzerinde olması gerekir; büyükşehir illerinde (Antalya ve dolayısıyla Alanya dahil) eşik diğer illere göre daha yüksektir. Değer ekspertiz raporuyla teyit edilir.</p>
<h2 id="districts">Bölge kısıtlamaları</h2>
<p>Yabancı oranı sınırı aşan bazı mahallelerde yeni ikamet izni verilmesi geçici olarak durdurulur. Listeler güncellenir: örneğin 2026'da Mahmutlar, Kestel, Avsallar ve Kargıcak yeniden ikamet iznine açıldı. Satın almadan önce mahallenin durumunu kontrol edin.</p>
<h2 id="docs">Belgeler</h2>
<ul><li>Pasaport ve noter onaylı tercümesi.</li><li>Adınıza tapu.</li><li>Türkiye'de geçerli sağlık sigortası.</li><li>Fotoğraflar ve adres belgesi.</li></ul>
<h2 id="renew">Uzatma</h2>
<p>İzin birkaç yıla kadar verilir ve mülk sahibi olduğunuz sürece uzatılır. Ayrıntılar: <a href="/tr/services/residence-permit/">Türkiye'de ikamet izni</a>.</p>`,
        faq: [
          { q: 'Taksitle alırsam ikamet izni alabilir miyim?', a: 'Gerekçe adınıza tapudur. Taksit sözleşmesinde tapu tam ödemeden sonra devrediliyorsa, başvuru bundan sonra yapılabilir.' },
        ],
      },
      de: {
        title: 'Aufenthaltserlaubnis in der Türkei durch Wohneigentum',
        description: 'So erhalten Sie als Eigentümer eine Aufenthaltserlaubnis in der Türkei: Mindestwert der Immobilie, Einschränkungen nach Vierteln, Unterlagen und Verlängerung.',
        body: `<p>Wohneigentum in der Türkei berechtigt zum Antrag auf eine kurzfristige Aufenthaltserlaubnis (Ikamet). Hier die Grundregeln; sie ändern sich, daher bestätigt ein Jurist die aktuellen Bedingungen für das konkrete Objekt.</p>
<h2 id="value">Mindestwert</h2>
<p>Nach geltenden Regeln muss die Immobilie einen Mindestwert haben, der in Provinzen mit Großstadtgemeinden (dazu gehört Antalya und damit Alanya) höher ist als anderswo. Der Wert wird durch ein Gutachten belegt.</p>
<h2 id="districts">Einschränkungen nach Vierteln</h2>
<p>In manchen Vierteln werden neue Erlaubnisse für Ausländer vorübergehend nicht erteilt, wenn deren Anteil eine Grenze überschreitet. Die Listen werden aktualisiert: 2026 wurden zum Beispiel Mahmutlar, Kestel, Avsallar und Kargıcak wieder geöffnet. Prüfen Sie den Status des Viertels vor dem Kauf.</p>
<h2 id="docs">Unterlagen</h2>
<ul><li>Reisepass und notarielle Übersetzung.</li><li>TAPU auf Ihren Namen.</li><li>In der Türkei gültige Krankenversicherung.</li><li>Fotos und Adressnachweis.</li></ul>
<h2 id="renew">Verlängerung</h2>
<p>Die Erlaubnis wird für bis zu mehrere Jahre erteilt und verlängert, solange Sie Eigentümer sind. Mehr unter <a href="/de/services/residence-permit/">Aufenthaltserlaubnis in der Türkei</a>.</p>`,
        faq: [
          { q: 'Bekomme ich eine Erlaubnis bei Ratenkauf?', a: 'Grundlage ist die TAPU auf Ihren Namen. Wird sie erst nach vollständiger Zahlung übertragen, ist der Antrag danach möglich.' },
        ],
      },
      sr: {
        title: 'Boravišna dozvola u Turskoj na osnovu vlasništva nad nekretninom',
        description: 'Kako dobiti boravišnu dozvolu u Turskoj kao vlasnik stana: minimalna vrednost nekretnine, ograničenja po naseljima, dokumenti i produženje.',
        body: `<p>Vlasništvo nad stanom u Turskoj je osnov za zahtev za kratkoročnu boravišnu dozvolu (ikamet). U nastavku su osnovna pravila; menjaju se, pa aktuelne uslove za konkretnu nekretninu potvrđuje pravnik.</p>
<h2 id="value">Minimalna vrednost</h2>
<p>Prema važećim pravilima nekretnina mora vredeti najmanje propisani prag, koji je viši u provincijama sa metropolitenskim opštinama (među njima je Antalija, pa i Alanja) nego u ostalim. Vrednost potvrđuje izveštaj procenitelja.</p>
<h2 id="districts">Ograničenja po naseljima</h2>
<p>U nekim naseljima vlasti privremeno ne izdaju nove dozvole strancima kada njihov udeo pređe granicu. Spiskovi se ažuriraju: na primer, 2026. su ponovo otvoreni Mahmutlar, Kestel, Avsalar i Kargidžak. Pre kupovine proverite status naselja.</p>
<h2 id="docs">Dokumenti</h2>
<ul><li>Pasoš i overeni prevod.</li><li>Tapija na vaše ime.</li><li>Zdravstveno osiguranje važeće u Turskoj.</li><li>Fotografije i dokaz o adresi.</li></ul>
<h2 id="renew">Produženje</h2>
<p>Dozvola se izdaje na period do nekoliko godina i produžava dok ste vlasnik. Više na stranici <a href="/sr/services/residence-permit/">boravišna dozvola u Turskoj</a>.</p>`,
        faq: [
          { q: 'Mogu li da dobijem dozvolu ako kupujem na rate?', a: 'Osnov je tapija na vaše ime. Ako se tapija prenosi nakon pune uplate, zahtev se podnosi posle toga.' },
        ],
      },
    },
  },
];
