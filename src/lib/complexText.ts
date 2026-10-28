/** FAQ и подписи карточки ЖК на 5 языках (ТЗ Б.5 п. 9). */
import type { Lang } from '../i18n/config';
import { moneyL } from './format';
import { THRESHOLDS } from './segments';

export function complexFaq(lang: Lang, name: string, low: number | null, high: number | null, installment: { down: number | null; months: number | null } | null): { q: string; a: string }[] {
  const lo = moneyL(lang, low);
  const cit = (high ?? low ?? 0) >= THRESHOLDS.citizenship;
  const inst = installment?.months ? installment : null;
  const F: Record<Lang, { q: string; a: string }[]> = {
    ru: [
      { q: `Сколько стоят квартиры в ${name}?`, a: lo ? `Цены начинаются от ${lo}${high && high > (low ?? 0) ? ` и доходят до ${moneyL(lang, high)}` : ''}. Актуальный прайс по планировкам пришлёт менеджер.` : 'Цены зависят от планировки и этажа — актуальный прайс пришлёт менеджер.' },
      { q: 'Можно ли купить в рассрочку?', a: inst ? `Да, застройщик предлагает рассрочку${inst.down ? ` с первым взносом от ${inst.down}%` : ''}${inst.months ? ` на срок до ${inst.months} мес.` : ''}. Точные условия зависят от квартиры.` : 'Условия оплаты зависят от квартиры и стадии строительства: уточните у менеджера возможность рассрочки.' },
      { q: 'Подходит ли покупка для гражданства Турции?', a: cit ? 'Покупка квартир на сумму от 400 000 $ даёт право подать на гражданство. Юристы проверят, подходит ли выбранный объект под программу.' : 'Для гражданства нужна недвижимость от 400 000 $; можно купить несколько квартир в сумме. Юристы подскажут подходящий вариант.' },
      { q: 'Как проходит сделка?', a: 'Бронирование, проверка документов застройщика, договор, оплата по графику и регистрация права собственности. Сделку можно провести дистанционно по доверенности.' },
    ],
    en: [
      { q: `How much do apartments in ${name} cost?`, a: lo ? `Prices start from ${lo}${high && high > (low ?? 0) ? ` and go up to ${moneyL(lang, high)}` : ''}. Your manager will send the current price list by layout.` : 'Prices depend on the layout and floor — your manager will send the current price list.' },
      { q: 'Can I buy on an installment plan?', a: inst ? `Yes, the developer offers installments${inst.down ? ` with a down payment from ${inst.down}%` : ''}${inst.months ? ` for up to ${inst.months} months` : ''}. Exact terms depend on the apartment.` : 'Payment terms depend on the apartment and construction stage — ask your manager about installments.' },
      { q: 'Does the purchase qualify for Turkish citizenship?', a: cit ? 'Buying property worth USD 400,000 or more gives the right to apply for citizenship. Lawyers will confirm whether the chosen unit qualifies.' : 'Citizenship requires property worth USD 400,000; several apartments can be combined. Lawyers will suggest a suitable option.' },
      { q: 'How does the purchase work?', a: 'Reservation, checks of the developer documents, contract, payments by schedule and registration of ownership. The deal can be done remotely under a power of attorney.' },
    ],
    tr: [
      { q: `${name} projesinde daire fiyatları ne kadar?`, a: lo ? `Fiyatlar ${lo}'dan başlıyor${high && high > (low ?? 0) ? `, ${moneyL(lang, high)}'ya kadar çıkıyor` : ''}. Güncel fiyat listesini yöneticiniz gönderir.` : 'Fiyatlar daire tipine ve kata göre değişir — güncel listeyi yöneticiniz gönderir.' },
      { q: 'Taksitle satın alabilir miyim?', a: inst ? `Evet, müteahhit${inst.down ? ` %${inst.down} peşinatla` : ''}${inst.months ? ` ${inst.months} aya kadar` : ''} taksit sunuyor. Kesin şartlar daireye göre değişir.` : 'Ödeme koşulları daireye ve inşaat aşamasına bağlıdır — taksit imkânını yöneticinize sorun.' },
      { q: 'Satın alma Türk vatandaşlığına uygun mu?', a: cit ? '400.000 $ ve üzeri gayrimenkul alımı vatandaşlık başvurusu hakkı verir. Avukatlar seçilen dairenin programa uygunluğunu teyit eder.' : 'Vatandaşlık için 400.000 $ değerinde gayrimenkul gerekir; birden fazla daire birleştirilebilir.' },
      { q: 'Satın alma süreci nasıl işler?', a: 'Rezervasyon, müteahhit belgelerinin kontrolü, sözleşme, plana göre ödemeler ve tapu tescili. İşlem vekaletnameyle uzaktan yapılabilir.' },
    ],
    de: [
      { q: `Was kosten Wohnungen in ${name}?`, a: lo ? `Die Preise beginnen bei ${lo}${high && high > (low ?? 0) ? ` und reichen bis ${moneyL(lang, high)}` : ''}. Die aktuelle Preisliste sendet Ihnen Ihr Berater.` : 'Die Preise hängen von Grundriss und Etage ab — die aktuelle Preisliste sendet Ihnen Ihr Berater.' },
      { q: 'Ist ein Ratenkauf möglich?', a: inst ? `Ja, der Bauträger bietet Raten${inst.down ? ` mit einer Anzahlung ab ${inst.down}%` : ''}${inst.months ? ` über bis zu ${inst.months} Monate` : ''}. Die genauen Bedingungen hängen von der Wohnung ab.` : 'Die Zahlungsbedingungen hängen von Wohnung und Baufortschritt ab — fragen Sie nach Ratenzahlung.' },
      { q: 'Eignet sich der Kauf für die türkische Staatsbürgerschaft?', a: cit ? 'Ein Immobilienkauf ab 400.000 US-Dollar berechtigt zum Antrag. Juristen prüfen, ob die gewählte Einheit geeignet ist.' : 'Für die Staatsbürgerschaft sind Immobilien ab 400.000 US-Dollar nötig; mehrere Wohnungen können kombiniert werden.' },
      { q: 'Wie läuft der Kauf ab?', a: 'Reservierung, Prüfung der Bauträgerdokumente, Vertrag, Zahlungen nach Plan und Eintragung des Eigentums. Der Kauf ist per Vollmacht auch aus der Ferne möglich.' },
    ],
    sr: [
      { q: `Koliko koštaju stanovi u kompleksu ${name}?`, a: lo ? `Cene počinju od ${lo}${high && high > (low ?? 0) ? ` i idu do ${moneyL(lang, high)}` : ''}. Aktuelni cenovnik šalje menadžer.` : 'Cene zavise od rasporeda i sprata — aktuelni cenovnik šalje menadžer.' },
      { q: 'Da li je moguća kupovina na rate?', a: inst ? `Da, investitor nudi rate${inst.down ? ` uz učešće od ${inst.down}%` : ''}${inst.months ? ` na period do ${inst.months} meseci` : ''}. Tačni uslovi zavise od stana.` : 'Uslovi plaćanja zavise od stana i faze izgradnje — pitajte menadžera za rate.' },
      { q: 'Da li kupovina daje pravo na tursko državljanstvo?', a: cit ? 'Kupovina nekretnine od 400.000 $ daje pravo na zahtev za državljanstvo. Pravnici proveravaju da li izabrana jedinica odgovara programu.' : 'Za državljanstvo je potrebna nekretnina od 400.000 $; može se kombinovati više stanova.' },
      { q: 'Kako teče kupovina?', a: 'Rezervacija, provera dokumenata investitora, ugovor, plaćanja po planu i upis vlasništva. Kupovina se može obaviti na daljinu preko punomoćja.' },
    ],
  };
  return F[lang];
}
