/**
 * Услуги (ТЗ 3.6): /{lang}/services/{slug}/. Русские тексты гражданства, ВНЖ, туров, онлайн-покупки,
 * эксклюзивной продажи и trade-in — с текущего сайта (services.json); остальное написано заново
 * и требует вычитки юристом и носителями языков (см. отчёт).
 */
import type { Lang } from '../i18n/config';

export interface ServiceText {
  title: string;
  description: string;
  lead: string;
  /** HTML; null — взять русский текст из services.json (legacy). */
  body: string | null;
  faq?: { q: string; a: string }[];
}

export interface Service {
  slug: string;
  /** slug в services.json (старый сайт). */
  legacy?: string;
  tr: Record<Lang, ServiceText>;
}

export const SERVICES: Service[] = [
  {
    slug: 'due-diligence',
    tr: {
      ru: {
        title: 'Проверка недвижимости в Турции перед покупкой',
        description: 'Юридическая проверка объекта в Турции: ТАПУ, обременения, искан, долги по айдату и коммуналке, статус земли, разрешения застройщика. Этапы, сроки, стоимость.',
        lead: 'Юристы Stay Property проверяют объект до того, как вы внесёте основную сумму, и сопровождают сделку до регистрации права собственности.',
        body: `<h2 id="what">Что мы проверяем</h2>
<ul>
<li><b>ТАПУ (право собственности).</b> Кто владелец, совпадают ли данные с договором, нет ли долевых собственников, которые не дали согласия на продажу.</li>
<li><b>Обременения.</b> Ипотека, арест, запрет на отчуждение, судебные споры, право пожизненного пользования.</li>
<li><b>Искан и техпаспорт.</b> Есть ли разрешение на ввод в эксплуатацию (искан), соответствует ли квартира проекту и техническому паспорту.</li>
<li><b>Долги.</b> Задолженность по айдату (обслуживанию комплекса), электричеству, воде, газу и налогу на недвижимость.</li>
<li><b>Статус земли.</b> Назначение участка, ограничения по застройке, зоны, где иностранцам покупка запрещена или ограничена.</li>
<li><b>Застройщик.</b> Разрешение на строительство, право на землю, история компании и выполнение обязательств по прошлым проектам.</li>
<li><b>Договор.</b> Цена, график платежей, сроки сдачи, штрафы и условия возврата денег.</li>
</ul>
<h2 id="steps">Как проходит проверка</h2>
<ol>
<li>Вы присылаете ссылку на объект или его адрес — в нашем каталоге или у другого продавца.</li>
<li>Юрист запрашивает выписки в кадастре и муниципалитете, проверяет документы застройщика и долги.</li>
<li>Вы получаете заключение: что в порядке, какие есть риски и что нужно исправить до сделки.</li>
<li>Если всё чисто — сопровождаем сделку: договор, оценка, регистрация в кадастре, страховка DASK и переоформление счетов.</li>
</ol>
<h2 id="time">Сроки и стоимость</h2>
<p>Проверка готового жилья обычно занимает несколько рабочих дней: срок зависит от скорости ответа ведомств. Для новостроек проверяем ещё и документы застройщика — это дольше. Стоимость зависит от объекта и объёма работ; менеджер назовёт её до начала проверки.</p>
<h2 id="why">Почему это важно</h2>
<p>Самые дорогие ошибки при покупке в Турции — квартира без искана, долги прежнего владельца и ипотека застройщика на участке. Проверка до оплаты дешевле, чем исправление проблем после. Подробнее о самой сделке — в статье <a href="/ru/blog/laws/buying-property-in-turkey/">как иностранцу купить недвижимость в Турции</a>.</p>`,
        faq: [
          { q: 'Можно ли проверить объект, который продаёт не Stay Property?', a: 'Да. Пришлите ссылку или адрес объекта — юрист проверит его так же, как объекты из нашего каталога.' },
          { q: 'Что такое искан и почему он важен?', a: 'Искан — разрешение на заселение здания. Без него нельзя оформить постоянные договоры на коммунальные услуги, а у банков и при получении ВНЖ могут возникнуть сложности.' },
          { q: 'Нужно ли приезжать в Турцию на время проверки?', a: 'Нет. Проверка проводится дистанционно, а сделку можно завершить по нотариальной доверенности.' },
          { q: 'Что будет, если найдутся проблемы?', a: 'В заключении юрист опишет риски и способы их устранить: например, погашение долгов продавцом до сделки или снятие обременения. Решение о покупке остаётся за вами.' },
        ],
      },
      en: {
        title: 'Property due diligence in Turkey before you buy',
        description: 'Legal check of a property in Turkey: TAPU, encumbrances, iskan, maintenance and utility debts, land status and developer permits. Steps, timing and cost.',
        lead: 'Stay Property lawyers check the property before you pay the main amount and support the deal until ownership is registered.',
        body: `<h2 id="what">What we check</h2>
<ul>
<li><b>TAPU (title deed).</b> Who the owner is, whether the data match the contract, and whether co-owners have agreed to the sale.</li>
<li><b>Encumbrances.</b> Mortgages, seizures, sale bans, court disputes and usufruct rights.</li>
<li><b>Iskan and technical passport.</b> Whether there is an occupancy permit (iskan) and whether the apartment matches the project and technical passport.</li>
<li><b>Debts.</b> Arrears on maintenance fees (aidat), electricity, water, gas and property tax.</li>
<li><b>Land status.</b> Zoning, building restrictions and areas where purchase by foreigners is banned or limited.</li>
<li><b>Developer.</b> Building permit, land rights, company history and delivery on past projects.</li>
<li><b>Contract.</b> Price, payment schedule, completion date, penalties and refund terms.</li>
</ul>
<h2 id="steps">How the check works</h2>
<ol>
<li>You send a link or address of the property — from our catalogue or another seller.</li>
<li>The lawyer requests land registry and municipality records, checks developer documents and debts.</li>
<li>You receive a report: what is fine, what the risks are and what must be fixed before the deal.</li>
<li>If everything is clear, we support the deal: contract, valuation, registration, DASK insurance and utility transfers.</li>
</ol>
<h2 id="time">Timing and cost</h2>
<p>Checking a resale home usually takes a few working days, depending on how quickly the authorities respond. For new builds we also check developer documents, which takes longer. The cost depends on the property and scope; your manager will quote it before the work starts.</p>
<h2 id="why">Why it matters</h2>
<p>The costliest mistakes in Turkey are buying without iskan, inheriting the previous owner's debts and a developer's mortgage on the land. Checking before payment is cheaper than fixing problems afterwards. See also <a href="/en/blog/laws/buying-property-in-turkey/">how a foreigner buys property in Turkey</a>.</p>`,
        faq: [
          { q: 'Can you check a property sold by someone else?', a: 'Yes. Send the link or address and the lawyer will check it the same way as properties from our catalogue.' },
          { q: 'What is iskan and why does it matter?', a: 'Iskan is the occupancy permit for a building. Without it permanent utility contracts are not possible, and banks and residence permit applications may run into problems.' },
          { q: 'Do I need to come to Turkey for the check?', a: 'No. The check is done remotely and the deal can be completed under a notarised power of attorney.' },
          { q: 'What if problems are found?', a: 'The report describes the risks and how to resolve them, for example the seller paying off debts or lifting an encumbrance before the deal. The decision to buy stays with you.' },
        ],
      },
      tr: {
        title: 'Türkiye\'de satın alma öncesi gayrimenkul kontrolü',
        description: 'Türkiye\'de gayrimenkulün hukuki kontrolü: tapu, şerhler, iskan, aidat ve fatura borçları, arsa durumu ve müteahhit izinleri. Aşamalar, süre ve ücret.',
        lead: 'Stay Property avukatları ana ödemeden önce mülkü kontrol eder ve tapu tesciline kadar işlemi takip eder.',
        body: `<h2 id="what">Neleri kontrol ediyoruz</h2>
<ul>
<li><b>Tapu.</b> Malik kim, bilgiler sözleşmeyle uyumlu mu, hissedarlar satışa onay verdi mi.</li>
<li><b>Şerhler.</b> İpotek, haciz, devir yasağı, davalar, intifa hakkı.</li>
<li><b>İskan ve proje.</b> İskan var mı, daire onaylı projeye uygun mu.</li>
<li><b>Borçlar.</b> Aidat, elektrik, su, doğalgaz ve emlak vergisi borçları.</li>
<li><b>Arsa durumu.</b> İmar durumu, yapılaşma kısıtları ve yabancıların alımının yasak ya da sınırlı olduğu bölgeler.</li>
<li><b>Müteahhit.</b> Yapı ruhsatı, arsa hakkı, şirket geçmişi ve önceki projelerdeki taahhütler.</li>
<li><b>Sözleşme.</b> Fiyat, ödeme planı, teslim tarihi, cezai şartlar ve iade koşulları.</li>
</ul>
<h2 id="steps">Kontrol nasıl yapılır</h2>
<ol>
<li>Mülkün linkini veya adresini gönderirsiniz.</li>
<li>Avukat tapu ve belediye kayıtlarını, müteahhit belgelerini ve borçları inceler.</li>
<li>Rapor alırsınız: neler yolunda, riskler neler, işlemden önce neyin düzeltilmesi gerekir.</li>
<li>Her şey temizse işlemi yürütürüz: sözleşme, ekspertiz, tapu tescili, DASK ve abonelik devirleri.</li>
</ol>
<h2 id="time">Süre ve ücret</h2>
<p>İkinci el konutun kontrolü genellikle birkaç iş günü sürer; süre kurumların yanıt hızına bağlıdır. Yeni projelerde müteahhit belgeleri de incelenir. Ücret mülke ve işin kapsamına göre değişir; yöneticiniz başlamadan önce bildirir.</p>
<h2 id="why">Neden önemli</h2>
<p>En pahalı hatalar iskansız daire, önceki sahibin borçları ve arsadaki müteahhit ipoteğidir. Ödemeden önce kontrol, sonradan sorun çözmekten ucuzdur. Ayrıca bkz. <a href="/tr/blog/laws/buying-property-in-turkey/">yabancılar Türkiye'de nasıl gayrimenkul alır</a>.</p>`,
        faq: [
          { q: 'Başka bir satıcının mülkünü kontrol edebilir misiniz?', a: 'Evet. Link veya adresi gönderin, avukat kataloğumuzdaki mülkler gibi kontrol eder.' },
          { q: 'İskan nedir, neden önemlidir?', a: 'İskan, binanın kullanım iznidir. İskansız binada kalıcı abonelik yapılamaz; banka ve oturma izni işlemlerinde sorun çıkabilir.' },
          { q: 'Kontrol için Türkiye\'ye gelmem gerekir mi?', a: 'Hayır. Kontrol uzaktan yapılır, işlem noter vekaletnamesiyle tamamlanabilir.' },
        ],
      },
      de: {
        title: 'Objektprüfung in der Türkei vor dem Immobilienkauf',
        description: 'Rechtliche Prüfung einer Immobilie in der Türkei: TAPU, Belastungen, Iskan, Nebenkosten- und Hausgeldschulden, Grundstücksstatus, Genehmigungen. Ablauf, Dauer, Kosten.',
        lead: 'Die Juristen von Stay Property prüfen das Objekt, bevor Sie den Hauptbetrag zahlen, und begleiten den Kauf bis zur Eintragung des Eigentums.',
        body: `<h2 id="what">Was wir prüfen</h2>
<ul>
<li><b>TAPU (Grundbuch).</b> Wer Eigentümer ist, ob die Daten zum Vertrag passen und ob Miteigentümer zugestimmt haben.</li>
<li><b>Belastungen.</b> Hypotheken, Pfändungen, Verkaufsverbote, Rechtsstreitigkeiten, Nießbrauch.</li>
<li><b>Iskan und technischer Pass.</b> Ob eine Nutzungsgenehmigung (Iskan) vorliegt und die Wohnung dem Projekt entspricht.</li>
<li><b>Schulden.</b> Rückstände bei Hausgeld (Aidat), Strom, Wasser, Gas und Grundsteuer.</li>
<li><b>Grundstücksstatus.</b> Bebauungsplan, Einschränkungen und Gebiete, in denen der Erwerb durch Ausländer verboten oder begrenzt ist.</li>
<li><b>Bauträger.</b> Baugenehmigung, Grundstücksrechte, Firmengeschichte und Erfüllung früherer Projekte.</li>
<li><b>Vertrag.</b> Preis, Zahlungsplan, Fertigstellung, Vertragsstrafen und Rückzahlungsbedingungen.</li>
</ul>
<h2 id="steps">Ablauf der Prüfung</h2>
<ol>
<li>Sie senden den Link oder die Adresse des Objekts.</li>
<li>Der Jurist fordert Auszüge bei Grundbuchamt und Gemeinde an und prüft Bauträgerdokumente und Schulden.</li>
<li>Sie erhalten einen Bericht: was in Ordnung ist, welche Risiken bestehen und was vor dem Kauf zu klären ist.</li>
<li>Ist alles sauber, begleiten wir den Kauf: Vertrag, Gutachten, Eintragung, DASK und Ummeldung der Versorger.</li>
</ol>
<h2 id="time">Dauer und Kosten</h2>
<p>Die Prüfung einer Bestandsimmobilie dauert meist einige Werktage, abhängig von den Behörden. Bei Neubauten prüfen wir zusätzlich den Bauträger. Die Kosten hängen von Objekt und Umfang ab; Ihr Berater nennt sie vor Beginn.</p>
<h2 id="why">Warum das wichtig ist</h2>
<p>Die teuersten Fehler sind Wohnungen ohne Iskan, Schulden des Vorbesitzers und Hypotheken des Bauträgers auf dem Grundstück. Siehe auch <a href="/de/blog/laws/buying-property-in-turkey/">Immobilienkauf in der Türkei als Ausländer</a>.</p>`,
        faq: [
          { q: 'Prüfen Sie auch Objekte anderer Verkäufer?', a: 'Ja. Senden Sie Link oder Adresse — der Jurist prüft das Objekt genauso wie Objekte aus unserem Katalog.' },
          { q: 'Was ist Iskan?', a: 'Iskan ist die Nutzungsgenehmigung des Gebäudes. Ohne sie sind dauerhafte Versorgungsverträge nicht möglich, bei Banken und Aufenthaltserlaubnis kann es Probleme geben.' },
          { q: 'Muss ich dafür in die Türkei reisen?', a: 'Nein. Die Prüfung erfolgt aus der Ferne, der Kauf kann per notarieller Vollmacht abgeschlossen werden.' },
        ],
      },
      sr: {
        title: 'Provera nekretnine u Turskoj pre kupovine',
        description: 'Pravna provera nekretnine u Turskoj: tapija, tereti, iskan, dugovi za održavanje i komunalije, status zemljišta i dozvole investitora. Koraci, rokovi i cena.',
        lead: 'Pravnici Stay Property proveravaju nekretninu pre nego što uplatite glavni iznos i prate kupovinu do upisa vlasništva.',
        body: `<h2 id="what">Šta proveravamo</h2>
<ul>
<li><b>Tapija.</b> Ko je vlasnik, da li se podaci slažu sa ugovorom i da li su suvlasnici saglasni sa prodajom.</li>
<li><b>Tereti.</b> Hipoteke, zabrane, sudski sporovi, pravo plodouživanja.</li>
<li><b>Iskan i tehnička dokumentacija.</b> Da li postoji upotrebna dozvola (iskan) i da li stan odgovara projektu.</li>
<li><b>Dugovi.</b> Dugovanja za održavanje (aidat), struju, vodu, gas i porez na imovinu.</li>
<li><b>Status zemljišta.</b> Namena, ograničenja gradnje i zone u kojima je kupovina strancima zabranjena ili ograničena.</li>
<li><b>Investitor.</b> Građevinska dozvola, pravo na zemljište, istorija kompanije i ispunjavanje obaveza.</li>
<li><b>Ugovor.</b> Cena, plan plaćanja, rok završetka, penali i uslovi povraćaja.</li>
</ul>
<h2 id="steps">Kako teče provera</h2>
<ol>
<li>Pošaljete link ili adresu nekretnine.</li>
<li>Pravnik pribavlja izvode iz katastra i opštine i proverava dokumenta investitora i dugove.</li>
<li>Dobijate izveštaj: šta je u redu, koji su rizici i šta treba rešiti pre kupovine.</li>
<li>Ako je sve čisto, vodimo kupovinu: ugovor, procena, upis, DASK i prenos komunalija.</li>
</ol>
<h2 id="time">Rokovi i cena</h2>
<p>Provera stana iz preprodaje obično traje nekoliko radnih dana, zavisno od institucija. Kod novogradnje proveravamo i investitora. Cena zavisi od nekretnine i obima posla; menadžer je saopštava pre početka.</p>
<h2 id="why">Zašto je važno</h2>
<p>Najskuplje greške su stan bez iskana, dugovi prethodnog vlasnika i hipoteka investitora na zemljištu. Pogledajte i <a href="/sr/blog/laws/buying-property-in-turkey/">kako stranac kupuje nekretninu u Turskoj</a>.</p>`,
        faq: [
          { q: 'Da li proveravate nekretnine drugih prodavaca?', a: 'Da. Pošaljite link ili adresu i pravnik će je proveriti kao i nekretnine iz našeg kataloga.' },
          { q: 'Šta je iskan?', a: 'Iskan je upotrebna dozvola zgrade. Bez nje nisu mogući trajni ugovori za komunalije, a mogu nastati problemi sa bankama i boravišnom dozvolom.' },
          { q: 'Da li moram da dođem u Tursku?', a: 'Ne. Provera se radi na daljinu, a kupovina se može završiti preko overenog punomoćja.' },
        ],
      },
    },
  },
  {
    slug: 'citizenship',
    legacy: 'grazhdanstvo',
    tr: {
      ru: { title: 'Гражданство Турции за покупку недвижимости', description: 'Сопровождение получения гражданства Турции за инвестиции в недвижимость от 400 000 $: подбор объекта, оценка, сделка, документы для всей семьи.', lead: 'Подбираем объекты, которые подходят под программу, и ведём процесс до получения паспортов всей семьёй.', body: null },
      en: { title: 'Turkish citizenship by real estate investment', description: 'Support with Turkish citizenship through property investment from USD 400,000: choosing a property, valuation, the deal and documents for the whole family.', lead: 'We select properties that qualify for the programme and guide the process until the whole family receives passports.', body: `<h2 id="how">How we help</h2><ol><li>Select properties worth USD 400,000 or more that can be registered under the programme.</li><li>Arrange the valuation, bank payment and title deed transfer with the three-year no-sale annotation.</li><li>Obtain the certificate of conformity and residence permits.</li><li>Prepare and submit the citizenship application for the investor, spouse and children under 18.</li></ol><h2 id="terms">Key terms</h2><p>Minimum investment is USD 400,000 by appraisal; the property cannot be sold for three years; residence in Turkey is not required. Details are in our article on <a href="/en/blog/laws/turkish-citizenship-by-investment/">citizenship by property investment</a>, and suitable listings are in the <a href="/en/turkey/sale/apartments/citizenship/">apartments for citizenship</a> selection.</p>` },
      tr: { title: 'Gayrimenkul yatırımıyla Türk vatandaşlığı', description: '400.000 $ ve üzeri gayrimenkul yatırımıyla Türk vatandaşlığı desteği: mülk seçimi, ekspertiz, satış ve tüm aile için belgeler.', lead: 'Programa uygun mülkleri seçer, tüm aile pasaport alana kadar süreci yürütürüz.', body: `<h2 id="how">Nasıl yardımcı oluyoruz</h2><ol><li>Programa uygun 400.000 $ ve üzeri mülklerin seçimi.</li><li>Ekspertiz, banka ödemesi ve üç yıl satmama şerhiyle tapu devri.</li><li>Uygunluk belgesi ve ikamet izinleri.</li><li>Yatırımcı, eşi ve 18 yaş altı çocukları için vatandaşlık başvurusu.</li></ol><h2 id="terms">Temel şartlar</h2><p>Ekspertize göre asgari 400.000 $; mülk üç yıl satılamaz; Türkiye'de ikamet şartı yoktur. Ayrıntılar: <a href="/tr/blog/laws/turkish-citizenship-by-investment/">gayrimenkulle vatandaşlık</a>; uygun ilanlar: <a href="/tr/turkey/sale/apartments/citizenship/">vatandaşlığa uygun daireler</a>.</p>` },
      de: { title: 'Türkische Staatsbürgerschaft durch Immobilienkauf', description: 'Begleitung zur türkischen Staatsbürgerschaft durch Immobilieninvestition ab 400.000 US-Dollar: Objektwahl, Gutachten, Kauf und Unterlagen für die ganze Familie.', lead: 'Wir wählen geeignete Objekte aus und begleiten den Prozess, bis die ganze Familie ihre Pässe erhält.', body: `<h2 id="how">So helfen wir</h2><ol><li>Auswahl geeigneter Objekte ab 400.000 US-Dollar.</li><li>Gutachten, Bankzahlung und Umschreibung mit dreijährigem Verkaufsverbot.</li><li>Konformitätsbescheinigung und Aufenthaltserlaubnisse.</li><li>Antrag auf Staatsbürgerschaft für Investor, Ehepartner und Kinder unter 18.</li></ol><h2 id="terms">Wichtigste Bedingungen</h2><p>Mindestens 400.000 US-Dollar laut Gutachten; drei Jahre kein Verkauf; kein Wohnsitz in der Türkei erforderlich. Mehr im Artikel <a href="/de/blog/laws/turkish-citizenship-by-investment/">Staatsbürgerschaft durch Immobilienkauf</a> und in der Auswahl <a href="/de/turkey/sale/apartments/citizenship/">Wohnungen für die Staatsbürgerschaft</a>.</p>` },
      sr: { title: 'Tursko državljanstvo kupovinom nekretnine', description: 'Podrška za tursko državljanstvo kroz investiciju u nekretnine od 400.000 $: izbor nekretnine, procena, kupovina i dokumenti za celu porodicu.', lead: 'Biramo nekretnine koje odgovaraju programu i vodimo postupak dok cela porodica ne dobije pasoše.', body: `<h2 id="how">Kako pomažemo</h2><ol><li>Izbor nekretnina od 400.000 $ koje odgovaraju programu.</li><li>Procena, uplata preko banke i prenos tapije sa zabranom prodaje od tri godine.</li><li>Potvrda o usklađenosti i boravišne dozvole.</li><li>Zahtev za državljanstvo za investitora, supružnika i decu mlađu od 18 godina.</li></ol><h2 id="terms">Osnovni uslovi</h2><p>Najmanje 400.000 $ prema proceni; nekretnina se ne prodaje tri godine; boravak u Turskoj nije obavezan. Više u članku <a href="/sr/blog/laws/turkish-citizenship-by-investment/">državljanstvo kupovinom nekretnine</a> i u izboru <a href="/sr/turkey/sale/apartments/citizenship/">stanova za državljanstvo</a>.</p>` },
    },
  },
  {
    slug: 'residence-permit',
    legacy: 'vid-na-zhitelstvo',
    tr: {
      ru: { title: 'ВНЖ в Турции при покупке недвижимости', description: 'Помогаем получить вид на жительство в Турции владельцам недвижимости: проверка района, документы, страховка, подача и продление ВНЖ.', lead: 'Проверяем, открыт ли район для ВНЖ, готовим документы и сопровождаем подачу и продление.', body: null },
      en: { title: 'Residence permit in Turkey for property owners', description: 'We help property owners obtain a Turkish residence permit: checking the district, documents, insurance, application and renewal.', lead: 'We check that the district is open for permits, prepare the documents and support the application and renewal.', body: `<h2 id="how">How we help</h2><ol><li>Check that the neighbourhood is open for new residence permits and the property meets the value threshold.</li><li>Prepare documents: passport translation, TAPU, health insurance, address registration.</li><li>Book the appointment and accompany you to the migration office.</li><li>Remind you about and help with renewal.</li></ol><p>Rules are explained in the article <a href="/en/blog/laws/residence-permit-by-property/">residence permit through property ownership</a>.</p>` },
      tr: { title: 'Gayrimenkul sahiplerine Türkiye\'de ikamet izni', description: 'Gayrimenkul sahiplerinin Türkiye\'de ikamet izni almasına yardımcı oluyoruz: bölge kontrolü, belgeler, sigorta, başvuru ve uzatma.', lead: 'Bölgenin ikamete açık olduğunu kontrol eder, belgeleri hazırlar, başvuru ve uzatmada destek oluruz.', body: `<h2 id="how">Nasıl yardımcı oluyoruz</h2><ol><li>Mahallenin yeni ikamet izinlerine açık olduğunu ve mülkün değer şartını karşıladığını kontrol ederiz.</li><li>Belgeleri hazırlarız: pasaport tercümesi, tapu, sağlık sigortası, adres kaydı.</li><li>Randevu alır, göç idaresine eşlik ederiz.</li><li>Uzatma zamanını hatırlatır ve yardımcı oluruz.</li></ol><p>Kurallar: <a href="/tr/blog/laws/residence-permit-by-property/">gayrimenkulle ikamet izni</a>.</p>` },
      de: { title: 'Aufenthaltserlaubnis in der Türkei für Eigentümer', description: 'Wir helfen Immobilienbesitzern bei der türkischen Aufenthaltserlaubnis: Prüfung des Viertels, Unterlagen, Versicherung, Antrag und Verlängerung.', lead: 'Wir prüfen, ob das Viertel offen ist, bereiten die Unterlagen vor und begleiten Antrag und Verlängerung.', body: `<h2 id="how">So helfen wir</h2><ol><li>Prüfung, ob das Viertel für neue Erlaubnisse offen ist und der Mindestwert erfüllt wird.</li><li>Unterlagen: Passübersetzung, TAPU, Krankenversicherung, Adressregistrierung.</li><li>Termin und Begleitung zur Migrationsbehörde.</li><li>Erinnerung an die Verlängerung und Hilfe dabei.</li></ol><p>Die Regeln erklärt der Artikel <a href="/de/blog/laws/residence-permit-by-property/">Aufenthaltserlaubnis durch Wohneigentum</a>.</p>` },
      sr: { title: 'Boravišna dozvola u Turskoj za vlasnike nekretnina', description: 'Pomažemo vlasnicima nekretnina da dobiju boravišnu dozvolu u Turskoj: provera naselja, dokumenti, osiguranje, zahtev i produženje.', lead: 'Proveravamo da li je naselje otvoreno za dozvole, pripremamo dokumente i pratimo zahtev i produženje.', body: `<h2 id="how">Kako pomažemo</h2><ol><li>Proveravamo da li je naselje otvoreno za nove dozvole i da li nekretnina ispunjava prag vrednosti.</li><li>Pripremamo dokumente: prevod pasoša, tapiju, zdravstveno osiguranje, prijavu adrese.</li><li>Zakazujemo termin i pratimo vas u migracionu službu.</li><li>Podsećamo na produženje i pomažemo.</li></ol><p>Pravila su objašnjena u članku <a href="/sr/blog/laws/residence-permit-by-property/">boravišna dozvola na osnovu nekretnine</a>.</p>` },
    },
  },
  {
    slug: 'trade-in',
    legacy: 'trade-in-more',
    tr: {
      ru: { title: 'Trade-in: обмен недвижимости в Турции', description: 'Trade-in в Stay Property: зачёт вашей квартиры в стоимость новой — оценка, выкуп или продажа и покупка нового объекта в одной сделке.', lead: 'Засчитываем вашу недвижимость в стоимость новой квартиры.', body: null },
      en: { title: 'Trade-in: exchange your property in Turkey', description: 'Trade-in at Stay Property: your current apartment counts towards a new one — valuation, buy-back or sale and purchase of a new property in one deal.', lead: 'Your current property counts towards the price of a new apartment.', body: `<h2 id="how">How it works</h2><ol><li>We value your current property.</li><li>We agree on how it will be credited: buy-back or sale through our agency.</li><li>You choose a new apartment in the catalogue or in Stay Property projects.</li><li>Both deals are completed in sequence with a single schedule.</li></ol><p>Trade-in suits owners who want to move to a larger apartment, a new complex or another district without selling separately first.</p>` },
      tr: { title: 'Trade-in: Türkiye\'de gayrimenkul takası', description: 'Stay Property trade-in: mevcut dairenizin bedeli yeni daireye sayılır — ekspertiz, geri alım veya satış ve yeni mülk alımı tek süreçte.', lead: 'Mevcut gayrimenkulünüz yeni dairenin bedeline sayılır.', body: `<h2 id="how">Nasıl işler</h2><ol><li>Mevcut mülkünüzü değerlendiririz.</li><li>Geri alım veya ajansımız üzerinden satış şeklinde mahsup yöntemini belirleriz.</li><li>Katalogdan veya Stay Property projelerinden yeni daire seçersiniz.</li><li>İki işlem tek planla art arda tamamlanır.</li></ol>` },
      de: { title: 'Trade-in: Immobilientausch in der Türkei', description: 'Trade-in bei Stay Property: Ihre Wohnung wird auf eine neue angerechnet — Bewertung, Rückkauf oder Verkauf und Kauf eines neuen Objekts in einem Ablauf.', lead: 'Ihre Immobilie wird auf den Preis einer neuen Wohnung angerechnet.', body: `<h2 id="how">So funktioniert es</h2><ol><li>Wir bewerten Ihre Immobilie.</li><li>Wir vereinbaren die Anrechnung: Rückkauf oder Verkauf über unsere Agentur.</li><li>Sie wählen eine neue Wohnung aus dem Katalog oder aus Projekten von Stay Property.</li><li>Beide Geschäfte werden nacheinander nach einem Plan abgewickelt.</li></ol>` },
      sr: { title: 'Trade-in: zamena nekretnine u Turskoj', description: 'Trade-in u Stay Property: vaš stan se uračunava u cenu novog — procena, otkup ili prodaja i kupovina nove nekretnine u jednom postupku.', lead: 'Vaša nekretnina se uračunava u cenu novog stana.', body: `<h2 id="how">Kako funkcioniše</h2><ol><li>Procenjujemo vašu nekretninu.</li><li>Dogovaramo način uračunavanja: otkup ili prodaja preko naše agencije.</li><li>Birate novi stan iz kataloga ili projekata Stay Property.</li><li>Obe transakcije se završavaju redom po jednom planu.</li></ol>` },
    },
  },
  {
    slug: 'tours',
    legacy: 'informatsionnyy-tur',
    tr: {
      ru: { title: 'Ознакомительный тур по недвижимости в Алании', description: 'Информационный тур Stay Property: встреча, просмотр объектов в разных районах Алании, консультация юриста и помощь с бронированием.', lead: 'Покажем объекты в разных районах за несколько дней и ответим на вопросы о покупке на месте.', body: null },
      en: { title: 'Property viewing tour in Alanya', description: 'Stay Property viewing tour: meeting, visits to properties in different districts of Alanya, a lawyer consultation and help with reservation.', lead: 'We show properties in different districts within a few days and answer purchase questions on the spot.', body: `<h2 id="what">What the tour includes</h2><ul><li>Planning viewings in advance based on your budget and wishes.</li><li>Transport to the properties and around the districts.</li><li>Viewing of selected apartments and complexes.</li><li>A consultation on the purchase process, costs and residence permits.</li><li>Help with reservation if you decide to buy.</li></ul>` },
      tr: { title: 'Alanya\'da gayrimenkul tanıtım turu', description: 'Stay Property tanıtım turu: karşılama, Alanya\'nın farklı bölgelerinde mülk gezisi, avukat danışmanlığı ve rezervasyon desteği.', lead: 'Birkaç gün içinde farklı bölgelerdeki mülkleri gösterir, sorularınızı yerinde yanıtlarız.', body: `<h2 id="what">Tura neler dahil</h2><ul><li>Bütçenize göre önceden planlanan gezi.</li><li>Mülklere ve bölgelere ulaşım.</li><li>Seçilen daire ve sitelerin gezilmesi.</li><li>Satın alma süreci, masraflar ve ikamet izni hakkında danışmanlık.</li><li>Karar verirseniz rezervasyon desteği.</li></ul>` },
      de: { title: 'Besichtigungsreise für Immobilien in Alanya', description: 'Besichtigungsreise mit Stay Property: Empfang, Besichtigungen in verschiedenen Vierteln von Alanya, Beratung durch Juristen und Hilfe bei der Reservierung.', lead: 'Wir zeigen Objekte in mehreren Vierteln in wenigen Tagen und beantworten Fragen zum Kauf vor Ort.', body: `<h2 id="what">Was die Reise umfasst</h2><ul><li>Vorab geplante Besichtigungen nach Budget und Wünschen.</li><li>Transfer zu den Objekten und durch die Viertel.</li><li>Besichtigung ausgewählter Wohnungen und Anlagen.</li><li>Beratung zu Kaufablauf, Kosten und Aufenthaltserlaubnis.</li><li>Hilfe bei der Reservierung.</li></ul>` },
      sr: { title: 'Informativna tura nekretnina u Alanji', description: 'Informativna tura Stay Property: doček, obilazak nekretnina u različitim naseljima Alanje, konsultacija sa pravnikom i pomoć pri rezervaciji.', lead: 'Za nekoliko dana pokazujemo nekretnine u različitim naseljima i odgovaramo na pitanja na licu mesta.', body: `<h2 id="what">Šta tura obuhvata</h2><ul><li>Unapred planirane posete prema budžetu i željama.</li><li>Prevoz do nekretnina i kroz naselja.</li><li>Razgledanje izabranih stanova i kompleksa.</li><li>Konsultacija o kupovini, troškovima i boravišnoj dozvoli.</li><li>Pomoć pri rezervaciji.</li></ul>` },
    },
  },
  {
    slug: 'after-sales',
    tr: {
      ru: { title: 'Послепродажный сервис: обслуживание недвижимости в Турции', description: 'Сервис после покупки: подключение коммунальных услуг, страховка DASK, оплата счетов и налогов, сдача в аренду и присмотр за квартирой в ваше отсутствие.', lead: 'После сделки помогаем обжиться или сдавать квартиру, пока вы не в Турции.', body: `<h2 id="what">Что входит</h2><ul><li>Переоформление электричества, воды и газа, подключение интернета.</li><li>Обязательная страховка от землетрясений DASK и страхование имущества.</li><li>Напоминания и помощь с оплатой айдата, коммунальных счетов и налога на недвижимость.</li><li>Помощь с ВНЖ на основании собственности и его продлением.</li><li>Поиск арендаторов, заселение и контроль состояния квартиры.</li><li>Помощь с мебелью, ремонтом и уборкой.</li></ul><h2 id="how">Как подключить</h2><p>Оставьте заявку — менеджер уточнит, какие услуги нужны, и согласует условия. Набор услуг и стоимость зависят от объекта.</p>` },
      en: { title: 'After-sales service: property management in Turkey', description: 'Service after purchase: utility connections, DASK insurance, paying bills and taxes, renting out and looking after the apartment while you are away.', lead: 'After the deal we help you settle in or rent the apartment out while you are not in Turkey.', body: `<h2 id="what">What is included</h2><ul><li>Transfer of electricity, water and gas, internet connection.</li><li>Compulsory DASK earthquake insurance and home insurance.</li><li>Reminders and help with paying maintenance fees, utility bills and property tax.</li><li>Help with a residence permit based on ownership and its renewal.</li><li>Finding tenants, check-in and checking the condition of the apartment.</li><li>Help with furniture, repairs and cleaning.</li></ul><h2 id="how">How to start</h2><p>Leave a request — your manager will clarify which services you need and agree the terms. The set of services and the cost depend on the property.</p>` },
      tr: { title: 'Satış sonrası hizmet: Türkiye\'de mülk yönetimi', description: 'Satın alma sonrası hizmet: abonelikler, DASK sigortası, fatura ve vergi ödemeleri, kiraya verme ve yokluğunuzda dairenin takibi.', lead: 'İşlemden sonra yerleşmenize veya Türkiye\'de değilken dairenizi kiraya vermenize yardımcı oluruz.', body: `<h2 id="what">Neler dahil</h2><ul><li>Elektrik, su ve doğalgaz devri, internet bağlantısı.</li><li>Zorunlu DASK ve konut sigortası.</li><li>Aidat, fatura ve emlak vergisi ödemelerinde hatırlatma ve destek.</li><li>Mülkiyete dayalı ikamet izni ve uzatma desteği.</li><li>Kiracı bulma, teslim ve dairenin kontrolü.</li><li>Mobilya, tadilat ve temizlik desteği.</li></ul>` },
      de: { title: 'After-Sales-Service: Immobilienverwaltung in der Türkei', description: 'Service nach dem Kauf: Versorgungsanschlüsse, DASK-Versicherung, Rechnungen und Steuern, Vermietung und Betreuung der Wohnung in Ihrer Abwesenheit.', lead: 'Nach dem Kauf helfen wir beim Einleben oder vermieten die Wohnung, während Sie nicht in der Türkei sind.', body: `<h2 id="what">Was enthalten ist</h2><ul><li>Ummeldung von Strom, Wasser und Gas, Internetanschluss.</li><li>Pflicht-Erdbebenversicherung DASK und Hausratversicherung.</li><li>Erinnerungen und Hilfe bei Hausgeld, Rechnungen und Grundsteuer.</li><li>Hilfe bei Aufenthaltserlaubnis und Verlängerung.</li><li>Mietersuche, Übergabe und Kontrolle der Wohnung.</li><li>Hilfe bei Möbeln, Reparaturen und Reinigung.</li></ul>` },
      sr: { title: 'Servis posle kupovine: upravljanje nekretninom u Turskoj', description: 'Servis posle kupovine: priključci komunalija, DASK osiguranje, plaćanje računa i poreza, izdavanje i briga o stanu dok ste odsutni.', lead: 'Posle kupovine pomažemo da se smestite ili izdajemo stan dok niste u Turskoj.', body: `<h2 id="what">Šta je uključeno</h2><ul><li>Prenos struje, vode i gasa, priključak interneta.</li><li>Obavezno DASK osiguranje i osiguranje stana.</li><li>Podsetnici i pomoć pri plaćanju održavanja, računa i poreza.</li><li>Pomoć oko boravišne dozvole i produženja.</li><li>Pronalaženje zakupaca, useljenje i kontrola stana.</li><li>Pomoć oko nameštaja, popravki i čišćenja.</li></ul>` },
    },
  },
  {
    slug: 'online-purchase',
    legacy: 'onlayn-pokupka-nedvizhimosti',
    tr: {
      ru: { title: 'Онлайн-покупка недвижимости в Турции', description: 'Купить квартиру в Турции дистанционно: онлайн-показ, проверка документов, сделка по доверенности и передача ключей без приезда.', lead: 'Проводим сделку без вашего приезда — от видеопоказа до регистрации права собственности.', body: null },
      en: { title: 'Buying property in Turkey online', description: 'Buy an apartment in Turkey remotely: online viewing, document checks, a deal under power of attorney and handover without travelling.', lead: 'We complete the deal without you travelling — from the video viewing to registration of ownership.', body: `<h2 id="how">How it works</h2><ol><li>Online viewing of the property via video call.</li><li>Document checks by our lawyers.</li><li>A notarised power of attorney issued in your country or at a consulate.</li><li>Payment by bank transfer and registration of the TAPU in your name.</li><li>Handover of the keys to a trusted person or management of the apartment by us.</li></ol>` },
      tr: { title: 'Türkiye\'de online gayrimenkul alımı', description: 'Türkiye\'de uzaktan daire satın alın: online gösterim, belge kontrolü, vekaletnameyle işlem ve gelmeden teslim.', lead: 'Görüntülü gösterimden tapu tesciline kadar işlemi siz gelmeden yürütürüz.', body: `<h2 id="how">Nasıl işler</h2><ol><li>Görüntülü görüşmeyle online gösterim.</li><li>Avukatlarımızın belge kontrolü.</li><li>Kendi ülkenizde veya konsoloslukta noter onaylı vekaletname.</li><li>Banka havalesiyle ödeme ve adınıza tapu tescili.</li><li>Anahtar teslimi veya dairenin tarafımızca yönetimi.</li></ol>` },
      de: { title: 'Immobilienkauf in der Türkei online', description: 'Wohnung in der Türkei aus der Ferne kaufen: Online-Besichtigung, Dokumentenprüfung, Kauf per Vollmacht und Übergabe ohne Anreise.', lead: 'Wir wickeln den Kauf ohne Ihre Anreise ab — von der Videobesichtigung bis zur Eintragung.', body: `<h2 id="how">So funktioniert es</h2><ol><li>Online-Besichtigung per Videoanruf.</li><li>Prüfung der Unterlagen durch unsere Juristen.</li><li>Notarielle Vollmacht in Ihrem Land oder beim Konsulat.</li><li>Zahlung per Überweisung und Eintragung der TAPU auf Ihren Namen.</li><li>Schlüsselübergabe an eine Vertrauensperson oder Verwaltung durch uns.</li></ol>` },
      sr: { title: 'Kupovina nekretnine u Turskoj onlajn', description: 'Kupite stan u Turskoj na daljinu: onlajn razgledanje, provera dokumenata, kupovina preko punomoćja i predaja bez dolaska.', lead: 'Kupovinu obavljamo bez vašeg dolaska — od video razgledanja do upisa vlasništva.', body: `<h2 id="how">Kako funkcioniše</h2><ol><li>Onlajn razgledanje putem video poziva.</li><li>Provera dokumenata od strane naših pravnika.</li><li>Overeno punomoćje u vašoj zemlji ili konzulatu.</li><li>Plaćanje prenosom i upis tapije na vaše ime.</li><li>Predaja ključeva ili upravljanje stanom od strane nas.</li></ol>` },
    },
  },
  {
    slug: 'online-viewing',
    legacy: 'onlayn-prosmotr',
    tr: {
      ru: { title: 'Онлайн-просмотр недвижимости в Турции', description: 'Видеопоказ квартиры в Турции в реальном времени: менеджер покажет объект, комплекс и район и ответит на вопросы.', lead: 'Покажем квартиру, комплекс и район по видеосвязи в удобное для вас время.', body: null },
      en: { title: 'Online property viewing in Turkey', description: 'A live video viewing of an apartment in Turkey: the manager shows the property, complex and area and answers your questions.', lead: 'We show the apartment, complex and area by video call at a time that suits you.', body: `<h2 id="what">What the video tour includes</h2><ul><li>A walk through the apartment, view from the windows and balcony.</li><li>The complex: pool, gym, parking and common areas.</li><li>The area: the way to the sea, shops and transport.</li></ul>` },
      tr: { title: 'Türkiye\'de online mülk gösterimi', description: 'Türkiye\'de dairenin canlı görüntülü gösterimi: yönetici mülkü, siteyi ve bölgeyi gösterir, sorularınızı yanıtlar.', lead: 'Daireyi, siteyi ve bölgeyi size uygun saatte görüntülü gösteririz.', body: `<h2 id="what">Video turda neler var</h2><ul><li>Dairenin gezisi, pencere ve balkon manzarası.</li><li>Site: havuz, spor salonu, otopark ve ortak alanlar.</li><li>Bölge: denize yol, marketler ve ulaşım.</li></ul>` },
      de: { title: 'Online-Besichtigung von Immobilien in der Türkei', description: 'Live-Videobesichtigung einer Wohnung in der Türkei: Der Berater zeigt Objekt, Anlage und Umgebung und beantwortet Fragen.', lead: 'Wir zeigen Wohnung, Anlage und Umgebung per Videoanruf zu Ihrer Wunschzeit.', body: `<h2 id="what">Was die Videotour umfasst</h2><ul><li>Rundgang durch die Wohnung, Blick aus Fenstern und vom Balkon.</li><li>Die Anlage: Pool, Fitness, Parken, Gemeinschaftsflächen.</li><li>Die Umgebung: Weg zum Meer, Geschäfte und Verkehr.</li></ul>` },
      sr: { title: 'Onlajn razgledanje nekretnina u Turskoj', description: 'Video razgledanje stana u Turskoj uživo: menadžer pokazuje nekretninu, kompleks i naselje i odgovara na pitanja.', lead: 'Pokazujemo stan, kompleks i naselje putem video poziva u vreme koje vam odgovara.', body: `<h2 id="what">Šta obuhvata video tura</h2><ul><li>Obilazak stana, pogled sa prozora i terase.</li><li>Kompleks: bazen, teretana, parking i zajednički prostori.</li><li>Naselje: put do mora, prodavnice i prevoz.</li></ul>` },
    },
  },
  {
    slug: 'exclusive-sale',
    legacy: 'eksklyuzivnaya-prodazha-nedvizhimosti',
    tr: {
      ru: { title: 'Эксклюзивная продажа вашей недвижимости в Турции', description: 'Продадим вашу квартиру в Турции по эксклюзивному договору: оценка, фото и видео, реклама на нескольких языках и сопровождение сделки.', lead: 'Берём продажу вашего объекта на себя — от оценки до регистрации сделки.', body: null },
      en: { title: 'Exclusive sale of your property in Turkey', description: 'We sell your apartment in Turkey under an exclusive agreement: valuation, photos and video, multilingual marketing and deal support.', lead: 'We take care of selling your property — from valuation to registration of the deal.', body: `<h2 id="how">What we do</h2><ul><li>Assess the market price and agree on the asking price.</li><li>Prepare photos, video and a description in several languages.</li><li>Promote the property to our buyer base and on property portals.</li><li>Arrange viewings, including online viewings.</li><li>Check the buyer's documents and support the deal through registration.</li></ul>` },
      tr: { title: 'Türkiye\'de mülkünüzün münhasır satışı', description: 'Türkiye\'deki dairenizi münhasır sözleşmeyle satarız: ekspertiz, fotoğraf ve video, çok dilli tanıtım ve işlem desteği.', lead: 'Mülkünüzün satışını değerlemeden tescile kadar üstleniriz.', body: `<h2 id="how">Neler yapıyoruz</h2><ul><li>Piyasa fiyatını değerlendirir, satış fiyatını belirleriz.</li><li>Birkaç dilde fotoğraf, video ve açıklama hazırlarız.</li><li>Alıcı tabanımıza ve portallara tanıtırız.</li><li>Online dahil gösterimleri organize ederiz.</li><li>İşlemi tescile kadar yürütürüz.</li></ul>` },
      de: { title: 'Exklusiver Verkauf Ihrer Immobilie in der Türkei', description: 'Wir verkaufen Ihre Wohnung in der Türkei per Exklusivvertrag: Bewertung, Fotos und Video, mehrsprachige Vermarktung und Kaufbegleitung.', lead: 'Wir übernehmen den Verkauf Ihrer Immobilie — von der Bewertung bis zur Eintragung.', body: `<h2 id="how">Was wir tun</h2><ul><li>Marktpreis bewerten und Angebotspreis vereinbaren.</li><li>Fotos, Video und Beschreibung in mehreren Sprachen.</li><li>Vermarktung an unsere Käuferbasis und auf Portalen.</li><li>Besichtigungen, auch online.</li><li>Begleitung des Kaufs bis zur Eintragung.</li></ul>` },
      sr: { title: 'Ekskluzivna prodaja vaše nekretnine u Turskoj', description: 'Prodajemo vaš stan u Turskoj po ekskluzivnom ugovoru: procena, fotografije i video, oglašavanje na više jezika i podrška pri kupoprodaji.', lead: 'Preuzimamo prodaju vaše nekretnine — od procene do upisa.', body: `<h2 id="how">Šta radimo</h2><ul><li>Procenjujemo tržišnu cenu i dogovaramo prodajnu cenu.</li><li>Pripremamo fotografije, video i opis na više jezika.</li><li>Oglašavamo kupcima iz naše baze i na portalima.</li><li>Organizujemo razgledanja, i onlajn.</li><li>Vodimo kupoprodaju do upisa.</li></ul>` },
    },
  },
];

export const serviceBySlug = (s: string) => SERVICES.find((x) => x.slug === s) ?? null;
