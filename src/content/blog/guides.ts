/**
 * Гайды по районам (рубрика area-guides). Здесь — характер района своими словами;
 * цифры (число объектов, цены, цена м²) страница гайда берёт из каталога в момент показа.
 * Описания общие и осторожные — перед публикацией их стоит вычитать местному менеджеру.
 */
import type { Lang } from '../../i18n/config';

export interface Guide {
  slug: string;
  city: string;
  district?: string;
  text: Record<Lang, string[]>;
}

export const GUIDES: Guide[] = [
  {
    slug: 'alanya',
    city: 'alanya',
    text: {
      ru: [
        'Алания — курортный город на востоке Анталийского побережья. Город вытянут вдоль моря: в центре — крепость на полуострове, гавань и пляж Клеопатры, на восток уходят жилые районы Оба, Тосмур, Кестель и Махмутлар, на запад — Конаклы, Тюрклер, Авсаллар и Инжекум.',
        'Здесь живёт большое международное сообщество, работают частные клиники, школы и супермаркеты, а сезон длится с весны до поздней осени. До аэропорта Газипаша-Аланья — около получаса на машине, до аэропорта Антальи — пара часов.',
        'Покупатели выбирают Аланию за сочетание моря, умеренных цен и готовой инфраструктуры: в одном городе есть и квартиры для отдыха, и жильё для переезда семьёй, и объекты для сдачи в аренду.',
      ],
      en: [
        'Alanya is a resort town in the east of the Antalya coast. It stretches along the sea: in the centre are the castle on the peninsula, the harbour and Cleopatra Beach; residential districts Oba, Tosmur, Kestel and Mahmutlar run east, while Konaklı, Türkler, Avsallar and İncekum lie to the west.',
        'The town has a large international community, private clinics, schools and supermarkets, and the season runs from spring to late autumn. Gazipaşa-Alanya Airport is about half an hour by car, Antalya Airport a couple of hours.',
        'Buyers choose Alanya for the mix of sea, moderate prices and ready infrastructure: holiday apartments, homes for relocating families and rental investments are all found in one town.',
      ],
      tr: [
        'Alanya, Antalya sahilinin doğusunda bir tatil şehridir. Şehir deniz boyunca uzanır: merkezde yarımadadaki kale, liman ve Kleopatra Plajı; doğuda Oba, Tosmur, Kestel ve Mahmutlar, batıda Konaklı, Türkler, Avsallar ve İncekum yer alır.',
        'Şehirde büyük bir uluslararası topluluk, özel klinikler, okullar ve marketler bulunur; sezon ilkbahardan sonbahar sonuna kadar sürer. Gazipaşa-Alanya Havalimanı arabayla yaklaşık yarım saat, Antalya Havalimanı birkaç saat uzaklıktadır.',
        'Alıcılar Alanya\'yı deniz, makul fiyatlar ve hazır altyapı bir arada olduğu için seçer: tatil daireleri, aileyle taşınmak için konutlar ve kiralık yatırımlar aynı şehirde.',
      ],
      de: [
        'Alanya ist ein Ferienort im Osten der Küste von Antalya. Die Stadt zieht sich am Meer entlang: im Zentrum die Burg auf der Halbinsel, der Hafen und der Kleopatra-Strand; nach Osten folgen die Wohnviertel Oba, Tosmur, Kestel und Mahmutlar, nach Westen Konaklı, Türkler, Avsallar und İncekum.',
        'In der Stadt lebt eine große internationale Gemeinschaft, es gibt Privatkliniken, Schulen und Supermärkte; die Saison reicht vom Frühjahr bis in den Spätherbst. Zum Flughafen Gazipaşa-Alanya sind es etwa eine halbe Stunde mit dem Auto, nach Antalya ein paar Stunden.',
        'Käufer wählen Alanya wegen der Kombination aus Meer, moderaten Preisen und fertiger Infrastruktur: Ferienwohnungen, Wohnraum für Familien und Mietobjekte gibt es in einer Stadt.',
      ],
      sr: [
        'Alanja je turistički grad na istoku obale Antalije. Grad se proteže duž mora: u centru su tvrđava na poluostrvu, luka i plaža Kleopatra; na istok se nižu stambena naselja Oba, Tosmur, Kestel i Mahmutlar, a na zapad Konakli, Tirkler, Avsalar i Indžekum.',
        'U gradu živi velika međunarodna zajednica, rade privatne klinike, škole i supermarketi, a sezona traje od proleća do kasne jeseni. Do aerodroma Gazipaša-Alanja ima oko pola sata vožnje, do aerodroma u Antaliji nekoliko sati.',
        'Kupci biraju Alanju zbog spoja mora, umerenih cena i gotove infrastrukture: stanovi za odmor, domovi za preseljenje porodice i nekretnine za izdavanje nalaze se u istom gradu.',
      ],
    },
  },
  {
    slug: 'mahmutlar',
    city: 'alanya',
    district: 'mahmutlar',
    text: {
      ru: [
        'Махмутлар — крупнейший жилой район на востоке Алании. Он тянется вдоль длинного пляжа, а главная улица с магазинами, кафе и рынками идёт параллельно морю.',
        'Здесь много комплексов с бассейнами и охраной, поэтому район популярен у тех, кто переезжает на постоянное жительство, и у инвесторов, которые сдают квартиры в аренду. Цены за метр обычно ниже, чем в центре Алании.',
      ],
      en: [
        'Mahmutlar is the largest residential district in the east of Alanya. It runs along a long beach, and the main street with shops, cafés and markets runs parallel to the sea.',
        'There are many complexes with pools and security, so the district is popular with people relocating permanently and with investors renting out apartments. Prices per square metre are usually lower than in central Alanya.',
      ],
      tr: [
        'Mahmutlar, Alanya\'nın doğusundaki en büyük yerleşim bölgesidir. Uzun bir plaj boyunca uzanır; mağazalar, kafeler ve pazarların bulunduğu ana cadde denize paralel ilerler.',
        'Havuzlu ve güvenlikli çok sayıda site olduğu için bölge, kalıcı taşınanlar ve kiraya veren yatırımcılar arasında popülerdir. Metrekare fiyatları genellikle Alanya merkezinden düşüktür.',
      ],
      de: [
        'Mahmutlar ist das größte Wohnviertel im Osten von Alanya. Es erstreckt sich entlang eines langen Strandes, die Hauptstraße mit Geschäften, Cafés und Märkten verläuft parallel zum Meer.',
        'Es gibt viele Anlagen mit Pool und Sicherheitsdienst, daher ist das Viertel bei Auswanderern und bei Anlegern mit Vermietungsabsicht beliebt. Die Quadratmeterpreise liegen meist unter denen im Zentrum.',
      ],
      sr: [
        'Mahmutlar je najveće stambeno naselje na istoku Alanje. Proteže se duž duge plaže, a glavna ulica sa prodavnicama, kafićima i pijacama ide paralelno sa morem.',
        'Ima mnogo kompleksa sa bazenima i obezbeđenjem, pa je naselje popularno kod onih koji se trajno sele i kod investitora koji izdaju stanove. Cene po kvadratu su obično niže nego u centru.',
      ],
    },
  },
  {
    slug: 'center',
    city: 'alanya',
    district: 'center',
    text: {
      ru: [
        'Центр Алании — это крепость, гавань, набережная и пляж Клеопатры. Всё нужное — в шаговой доступности: магазины, рестораны, больницы, государственные учреждения.',
        'Новых проектов в центре меньше, чем на окраинах, а цена метра выше. Квартиры в центре выбирают те, кто хочет жить в городе круглый год без машины, и те, кто сдаёт жильё туристам.',
      ],
      en: [
        'Central Alanya means the castle, the harbour, the promenade and Cleopatra Beach. Everything is within walking distance: shops, restaurants, hospitals and public offices.',
        'There are fewer new projects in the centre than on the outskirts and prices per square metre are higher. Central apartments suit people who want to live in town year-round without a car and owners renting to tourists.',
      ],
      tr: [
        'Alanya merkezi kale, liman, sahil yolu ve Kleopatra Plajı demektir. Mağazalar, restoranlar, hastaneler ve resmi daireler yürüme mesafesindedir.',
        'Merkezde yeni proje sayısı çevre bölgelere göre azdır, metrekare fiyatı daha yüksektir. Merkezdeki daireler yıl boyu arabasız yaşamak isteyenlere ve turistlere kiraya verenlere uygundur.',
      ],
      de: [
        'Das Zentrum von Alanya — das sind Burg, Hafen, Promenade und Kleopatra-Strand. Geschäfte, Restaurants, Krankenhäuser und Behörden sind zu Fuß erreichbar.',
        'Im Zentrum gibt es weniger Neubauprojekte als am Stadtrand, die Quadratmeterpreise sind höher. Wohnungen im Zentrum eignen sich für ganzjähriges Leben ohne Auto und für die Vermietung an Urlauber.',
      ],
      sr: [
        'Centar Alanje su tvrđava, luka, šetalište i plaža Kleopatra. Sve je na pešačkoj udaljenosti: prodavnice, restorani, bolnice i državne službe.',
        'U centru ima manje novih projekata nego na periferiji, a cena kvadrata je viša. Stanovi u centru odgovaraju onima koji žele da žive u gradu cele godine bez automobila i onima koji izdaju turistima.',
      ],
    },
  },
  {
    slug: 'oba',
    city: 'alanya',
    district: 'oba',
    text: {
      ru: ['Оба — жилой район к востоку от центра Алании. Здесь много новых комплексов, школы, супермаркеты и медицинские центры, а до центра можно доехать за несколько минут.', 'Район выбирают семьи, которые переезжают в Аланию на постоянное жительство: он спокойнее центра, но вся городская инфраструктура рядом.'],
      en: ['Oba is a residential district east of central Alanya. It has many new complexes, schools, supermarkets and medical centres, and the centre is a few minutes away.', 'Families relocating to Alanya permanently often choose Oba: it is quieter than the centre while city infrastructure is close by.'],
      tr: ['Oba, Alanya merkezinin doğusunda bir yerleşim bölgesidir. Çok sayıda yeni site, okul, market ve sağlık merkezi bulunur; merkeze birkaç dakikada ulaşılır.', 'Alanya\'ya kalıcı taşınan aileler sıkça Oba\'yı seçer: merkezden daha sakindir ama şehir altyapısı yakındır.'],
      de: ['Oba ist ein Wohnviertel östlich des Zentrums von Alanya. Es gibt viele neue Anlagen, Schulen, Supermärkte und medizinische Zentren, das Zentrum ist in wenigen Minuten erreichbar.', 'Familien, die dauerhaft nach Alanya ziehen, wählen oft Oba: ruhiger als das Zentrum, aber mit städtischer Infrastruktur in der Nähe.'],
      sr: ['Oba je stambeno naselje istočno od centra Alanje. Ima mnogo novih kompleksa, škola, supermarketa i medicinskih centara, a do centra se stiže za nekoliko minuta.', 'Porodice koje se trajno sele u Alanju često biraju Obu: mirnija je od centra, a gradska infrastruktura je blizu.'],
    },
  },
  {
    slug: 'kestel',
    city: 'alanya',
    district: 'kestel',
    text: {
      ru: ['Кестель лежит между Тосмуром и Махмутларом. Район тише соседних, застройка ниже, а пляжи менее многолюдны.', 'Сюда смотрят покупатели, которым нужен спокойный район у моря недалеко от центра: магазины и кафе есть на месте, а за крупными покупками ездят в Махмутлар или Оба.'],
      en: ['Kestel lies between Tosmur and Mahmutlar. It is quieter than its neighbours, buildings are lower and the beaches are less crowded.', 'Buyers who want a calm seaside district not far from the centre look here: shops and cafés are local, while bigger shopping trips go to Mahmutlar or Oba.'],
      tr: ['Kestel, Tosmur ile Mahmutlar arasında yer alır. Komşularından daha sakindir, binalar daha alçak, plajlar daha az kalabalıktır.', 'Merkeze yakın sakin bir sahil bölgesi isteyen alıcılar burayı tercih eder: mağaza ve kafeler bölgede, büyük alışveriş için Mahmutlar veya Oba\'ya gidilir.'],
      de: ['Kestel liegt zwischen Tosmur und Mahmutlar. Es ist ruhiger als die Nachbarviertel, die Bebauung ist niedriger und die Strände sind weniger voll.', 'Wer ein ruhiges Viertel am Meer nahe dem Zentrum sucht, schaut hier: Geschäfte und Cafés gibt es vor Ort, größere Einkäufe erledigt man in Mahmutlar oder Oba.'],
      sr: ['Kestel se nalazi između Tosmura i Mahmutlara. Mirniji je od susednih naselja, zgrade su niže, a plaže manje gužve.', 'Kupci koji traže mirno naselje uz more blizu centra gledaju ovde: prodavnice i kafići su na licu mesta, a za veću kupovinu ide se u Mahmutlar ili Obu.'],
    },
  },
  {
    slug: 'avsallar',
    city: 'alanya',
    district: 'avsallar',
    text: {
      ru: ['Авсаллар — посёлок к западу от Алании, рядом с пляжем Инжекум. Вокруг сосновые леса и отели, а жилые комплексы часто строят с собственной инфраструктурой.', 'Район подходит для отдыха и тихой жизни у моря; цены здесь обычно ниже, чем в черте города.'],
      en: ['Avsallar is a village west of Alanya, next to İncekum beach. It is surrounded by pine forests and hotels, and residential complexes often come with their own facilities.', 'The area suits holidays and a quiet life by the sea; prices are usually lower than within the town.'],
      tr: ['Avsallar, Alanya\'nın batısında, İncekum plajının yanında bir beldedir. Çevresi çam ormanları ve otellerle çevrilidir; siteler genellikle kendi sosyal alanlarıyla inşa edilir.', 'Bölge tatil ve denize yakın sakin bir yaşam için uygundur; fiyatlar genellikle şehir içinden düşüktür.'],
      de: ['Avsallar ist ein Ort westlich von Alanya beim Strand von İncekum. Ringsum liegen Pinienwälder und Hotels, Wohnanlagen haben oft eigene Einrichtungen.', 'Die Gegend eignet sich für Urlaub und ein ruhiges Leben am Meer; die Preise liegen meist unter denen in der Stadt.'],
      sr: ['Avsalar je mesto zapadno od Alanje, pored plaže Indžekum. Okružen je borovim šumama i hotelima, a kompleksi se često grade sa sopstvenom infrastrukturom.', 'Naselje odgovara za odmor i miran život uz more; cene su obično niže nego u gradu.'],
    },
  },
  {
    slug: 'kargicak',
    city: 'alanya',
    district: 'kargicak',
    text: {
      ru: ['Каргыджак — район к востоку от Махмутлара, на склонах гор над морем. Отсюда открываются панорамные виды, поэтому здесь много вилл и проектов премиум-класса.', 'Для жизни в Каргыджаке удобнее иметь машину; взамен — простор, тишина и вид на море из окон.'],
      en: ['Kargıcak is a district east of Mahmutlar on the hillsides above the sea. The panoramic views explain the many villas and premium projects here.', 'A car is handy for living in Kargıcak; in return you get space, quiet and sea views from the windows.'],
      tr: ['Kargıcak, Mahmutlar\'ın doğusunda, denize bakan yamaçlarda bir bölgedir. Panoramik manzara nedeniyle çok sayıda villa ve premium proje bulunur.', 'Kargıcak\'ta yaşamak için araba olması daha rahattır; karşılığında geniş alan, sessizlik ve deniz manzarası sunar.'],
      de: ['Kargıcak liegt östlich von Mahmutlar an den Hängen über dem Meer. Wegen des Panoramablicks gibt es hier viele Villen und Premiumprojekte.', 'Zum Leben in Kargıcak ist ein Auto praktisch; dafür gibt es Platz, Ruhe und Meerblick.'],
      sr: ['Kargidžak je naselje istočno od Mahmutlara, na padinama iznad mora. Zbog panoramskog pogleda ovde ima mnogo vila i projekata premium klase.', 'Za život u Kargidžaku zgodno je imati automobil; zauzvrat dobijate prostor, mir i pogled na more.'],
    },
  },
  {
    slug: 'tosmur',
    city: 'alanya',
    district: 'tosmur',
    text: {
      ru: ['Тосмур — небольшой жилой район между Оба и Кестелем. Он близко к центру, но застроен невысокими домами и считается одним из самых спокойных в восточной части Алании.', 'Здесь удобно жить семьям: рядом школы, магазины и пляж.'],
      en: ['Tosmur is a small residential district between Oba and Kestel. It is close to the centre but built up with low-rise houses and is considered one of the calmest in eastern Alanya.', 'It is convenient for families, with schools, shops and the beach nearby.'],
      tr: ['Tosmur, Oba ile Kestel arasında küçük bir yerleşim bölgesidir. Merkeze yakındır ama alçak katlı yapılardan oluşur ve Alanya\'nın doğusundaki en sakin bölgelerden biri sayılır.', 'Okullar, marketler ve plaj yakın olduğu için aileler için elverişlidir.'],
      de: ['Tosmur ist ein kleines Wohnviertel zwischen Oba und Kestel. Es liegt nahe am Zentrum, ist aber niedrig bebaut und gilt als eines der ruhigsten im Osten von Alanya.', 'Für Familien praktisch: Schulen, Geschäfte und Strand sind in der Nähe.'],
      sr: ['Tosmur je malo stambeno naselje između Obe i Kestela. Blizu je centra, ali sa niskom gradnjom i smatra se jednim od najmirnijih na istoku Alanje.', 'Pogodno je za porodice: škole, prodavnice i plaža su blizu.'],
    },
  },
  {
    slug: 'cikcilli',
    city: 'alanya',
    district: 'cikcilli',
    text: {
      ru: ['Джикджилли — район над Оба, на склонах ближе к горам. Здесь много новых комплексов с бассейнами и видом на город и море.', 'До пляжа отсюда дальше, чем из прибрежных районов, зато цены ниже, а квартиры просторнее.'],
      en: ['Cikcilli is a district above Oba on the slopes towards the mountains. It has many new complexes with pools and views over the town and sea.', 'The beach is further away than from coastal districts, but prices are lower and apartments are more spacious.'],
      tr: ['Cikcilli, Oba\'nın üst tarafında, dağlara doğru yamaçlarda bir bölgedir. Şehir ve deniz manzaralı, havuzlu çok sayıda yeni site bulunur.', 'Plaj sahil bölgelerine göre daha uzaktır, ancak fiyatlar daha düşük, daireler daha geniştir.'],
      de: ['Cikcilli liegt oberhalb von Oba an den Hängen zu den Bergen. Hier gibt es viele neue Anlagen mit Pool und Blick auf Stadt und Meer.', 'Der Strand ist weiter entfernt als in Küstenvierteln, dafür sind die Preise niedriger und die Wohnungen geräumiger.'],
      sr: ['Džikdžili je naselje iznad Obe, na padinama prema planinama. Ima mnogo novih kompleksa sa bazenima i pogledom na grad i more.', 'Plaža je dalje nego iz priobalnih naselja, ali su cene niže, a stanovi prostraniji.'],
    },
  },
  {
    slug: 'konakli',
    city: 'alanya',
    district: 'konakli',
    text: {
      ru: ['Конаклы — посёлок к западу от центра Алании вдоль побережья. Здесь пляжи, отели и жилые комплексы, а также собственный центр с магазинами.', 'Район подходит тем, кто хочет жить у моря вне городской суеты, но недалеко от центра.'],
      en: ['Konaklı is a village west of central Alanya along the coast, with beaches, hotels, residential complexes and its own centre with shops.', 'It suits those who want to live by the sea away from the town bustle but not far from the centre.'],
      tr: ['Konaklı, Alanya merkezinin batısında sahil boyunca bir beldedir; plajlar, oteller, siteler ve mağazaların bulunduğu kendi merkezi vardır.', 'Şehir kalabalığından uzak ama merkeze yakın, denize yakın yaşamak isteyenlere uygundur.'],
      de: ['Konaklı ist ein Ort westlich des Zentrums von Alanya an der Küste mit Stränden, Hotels, Wohnanlagen und eigenem Zentrum mit Geschäften.', 'Ideal für alle, die am Meer abseits des Trubels, aber nahe dem Zentrum leben möchten.'],
      sr: ['Konakli je mesto zapadno od centra Alanje uz obalu, sa plažama, hotelima, stambenim kompleksima i sopstvenim centrom sa prodavnicama.', 'Odgovara onima koji žele da žive uz more, dalje od gradske gužve, ali blizu centra.'],
    },
  },
];
