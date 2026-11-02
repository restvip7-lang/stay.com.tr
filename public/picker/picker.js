/* Сгенерировано scripts/import-picker.py из apartment-picker/index.html — правки вносить в скрипт */
(()=>{

/* ===================== ДАННЫЕ (единый источник; на сайте придут из базы / Bitrix24) ===================== */
/* Контуры корпусов на рендере 1500×844: p — контур, t/b — верхняя и нижняя линии фасада, f — этажей */
const GEO = {"E":{"f":5,"p":[[355,92],[400,75],[560,72],[600,92],[600,210],[380,215],[362,195]],"t":[[360,102],[452,104],[478,97],[598,97]],"b":[[360,212],[452,212],[478,204],[598,204]]},"F":{"f":5,"p":[[618,100],[690,88],[790,98],[848,128],[815,280],[770,285],[700,240],[620,215]],"t":[[612,104],[700,119],[745,140],[770,141],[848,148]],"b":[[612,211],[700,224],[745,247],[770,248],[848,255]]},"G":{"f":5,"p":[[785,75],[840,50],[890,48],[1005,55],[1013,70],[1012,185],[860,195],[848,128],[790,98]],"t":[[850,88],[935,88],[958,74],[1012,74]],"b":[[850,182],[935,180],[958,174],[1012,174]]},"A":{"f":5,"p":[[35,190],[60,180],[260,175],[300,205],[240,235],[240,340],[200,345],[55,330],[45,240]],"t":[[45,207],[140,207],[208,216],[238,228]],"b":[[45,310],[140,310],[208,312],[238,334]]},"H":{"f":5,"p":[[1112,182],[1250,172],[1320,180],[1385,215],[1397,330],[1350,358],[1255,358],[1200,345],[1165,330],[1165,225]],"t":[[1112,222],[1245,220],[1270,232],[1300,226],[1395,221]],"b":[[1112,330],[1245,330],[1270,338],[1300,330],[1395,325]]},"B":{"f":5,"p":[[242,230],[238,242],[244,259],[242,280],[244,337],[228,341],[232,374],[279,387],[312,416],[345,424],[387,432],[395,420],[395,399],[415,389],[417,341],[415,304],[413,288],[419,275],[436,271],[467,271],[465,261],[452,259],[415,234],[378,228],[325,222],[271,222]],"t":[[244,245],[300,258],[370,274],[392,290],[416,290]],"b":[[244,350],[300,367],[370,383],[392,400],[416,400]]},"I":{"f":5,"p":[[950,262],[1000,215],[1140,218],[1165,225],[1165,335],[1150,350],[1060,350],[990,330],[950,300]],"t":[[950,262],[1060,266],[1100,262],[1165,245]],"b":[[950,372],[1060,376],[1100,372],[1165,345]]},"C":{"f":5,"p":[[410,290],[470,272],[560,276],[617,310],[600,335],[545,350],[536,475],[450,480]],"t":[[410,306],[470,316],[535,330]],"b":[[410,425],[470,437],[535,450]]},"J":{"f":5,"p":[[943,305],[1085,300],[1135,352],[1015,388],[1010,440],[950,445],[945,380]],"t":[[948,343],[1000,362],[1125,362]],"b":[[948,453],[1000,472],[1125,472]]},"D":{"f":5,"p":[[549,349],[541,366],[545,379],[571,380],[554,396],[549,443],[552,471],[534,475],[534,507],[599,529],[693,567],[742,559],[744,516],[744,473],[719,460],[727,452],[796,449],[798,445],[766,441],[762,422],[770,411],[794,406],[794,383],[753,342],[684,336],[607,340]],"t":[[536,362],[575,372],[625,385],[667,395],[745,410]],"b":[[536,490],[575,500],[625,515],[667,526],[745,540]]},"N":{"f":5,"p":[[770,415],[830,410],[990,440],[1012,462],[1010,520],[850,515],[810,530],[800,555],[760,560],[760,440]],"t":[[752,500],[800,489],[899,477],[1012,460]],"b":[[752,650],[800,639],[899,617],[1012,585]]},"K":{"f":5,"p":[[1010,392],[1050,385],[1270,392],[1305,415],[1300,505],[1130,505],[1127,580],[1080,600],[1035,585],[1020,420]],"t":[[1040,438],[1100,450],[1200,452],[1300,442]],"b":[[1040,568],[1100,573],[1200,572],[1300,562]]},"L":{"f":5,"p":[[810,530],[850,515],[1035,518],[1075,600],[1070,750],[1030,765],[905,765],[805,660]],"t":[[806,545],[865,550],[925,609],[975,610],[985,607],[1070,607]],"b":[[806,680],[865,685],[925,748],[975,748],[985,746],[1070,746]]},"M":{"f":5,"p":[[1127,503],[1300,500],[1370,507],[1410,585],[1410,725],[1300,760],[1195,755],[1130,620]],"t":[[1127,524],[1185,532],[1230,590],[1295,596],[1305,592],[1405,592]],"b":[[1127,669],[1185,677],[1230,724],[1295,730],[1305,724],[1405,724]]}};
const AP = window.AP || {};
const IMG = {src:(AP.base||'')+'complex.jpg', w:1500, h:844};
const FULL = [0,0,IMG.w,IMG.h];

/* Корпус L: исходный план этажа floor-l.jpg (1055×1490). Контуры квартир в пикселях этого файла, номер = номер на плане */
const L_IMG = {src:(AP.base||'')+'floor-l.jpg', w:1055, h:1490};
const KP = {"1":[[781,775],[553,775],[553,1000],[856,1000],[856,878],[781,878]],"2":[[781,545],[553,545],[553,775],[856,775],[856,655],[781,655]],"3":[[737,230],[865,320],[907,377],[977,405],[910,512],[850,460],[840,462],[785,550],[590,417],[685,297]],"4":[[686,22],[940,220],[1007,272],[930,380],[865,320],[737,230],[693,283],[640,262],[547,202]],"5":[[826,1005],[558,1005],[558,1110],[648,1110],[648,1405],[781,1405],[781,1118],[826,1118]],"6":[[405,1110],[648,1110],[648,1400],[405,1400]],"7":[[227,1005],[495,1005],[495,1110],[405,1110],[405,1405],[272,1405],[272,1118],[227,1118]],"8":[[272,775],[500,775],[500,1000],[197,1000],[197,878],[272,878]],"9":[[272,545],[500,545],[500,775],[197,775],[197,655],[272,655]],"10":[[77,405],[120,377],[317,227],[380,330],[462,420],[280,542],[200,457],[147,505]],"11":[[44,270],[100,220],[117,212],[370,22],[505,200],[415,268],[360,245],[317,227],[180,325],[122,376]]};
const BADGE = {"11":[268,233],"10":[283,397],"4":[785,233],"3":[780,393],"9":[390,686],"2":[668,686],"8":[380,912],"1":[673,912],"7":[343,1187],"6":[541,1225],"5":[713,1187]};
const L_TEMPLATE = [1,2,3,4,5,6,7,8,9,10,11].map(n=>({n, type:'1+1', area:{1:58,2:58,3:60,4:64,5:52,6:62,7:52,8:58,9:58,10:60,11:64}[n], outdoor:n===6?'terrace':'balcony'}));
/* Остальные корпуса: схематичный этаж для демо (реальных планов пока нет) */
const FLOOR_TEMPLATE = [
  {n:1,type:'3+1',area:122},{n:2,type:'1+1',area:56},{n:3,type:'2+1',area:86},
  {n:4,type:'2+1',area:81},{n:5,type:'1+1',area:52},{n:6,type:'2+1',area:78}];
const PLAN = {1:[160,140,300,200],2:[460,140,260,200],3:[720,140,320,200],4:[160,380,280,200],5:[560,380,220,200],6:[780,380,260,200]};

function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const R = rng(20261027);
let SAVED={}; try{ SAVED=JSON.parse(localStorage.getItem('floorMarkup')||'{}')||{} }catch(e){}
Object.entries(SAVED).forEach(([id,g])=>{ if(GEO[id]) GEO[id]={...GEO[id],...g} });
const FLAT = {};
function setGeo(b,g){
  b.g=g; b.floors=g.f;
  const xs=g.p.map(q=>q[0]), ys=g.p.map(q=>q[1]);
  b.box=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
  const r2=rng(b.id.charCodeAt(0)*7919);
  (b.flats||[]).forEach(q=>delete FLAT[q.num]); b.flats=[];
  b.tpl = b.id==='L'? L_TEMPLATE : FLOOR_TEMPLATE;
  for(let f=1; f<=b.floors; f++) b.tpl.forEach(t=>{
    const r=r2(), status = r<0.47?'sold':r<0.6?'booked':'free';
    const prem = 1+(f-1)*0.015;
    const num = b.tpl.length>9? `${b.id}-${f}${String(t.n).padStart(2,'0')}` : `${b.id}-${f}0${t.n}`;
    const q={num, b:b.id, floor:f, n:t.n, type:t.type, area:t.area, status,
      price: Math.round(t.area*b.ppm*prem/500)*500,
      baths: t.type==='3+1'?2:1, outdoor:t.outdoor||'balcony',
      img: b.id==='L'? (AP.base||'')+`apt-${String(t.n).padStart(2,'0')}.jpg` : null, photos:[]};
    b.flats.push(q); FLAT[num]=q;
  });
  applyReal(b);
}
function applyReal(b){ (AP.real||[]).filter(r=>r.b===b.id).forEach(r=>{ const q=b.flats.find(x=>x.floor===r.floor&&x.n===r.n); if(!q) return;
  Object.assign(q,{status:'free', price:r.price??q.price, area:r.area||q.area, type:['1+1','2+1','3+1'].includes(r.rooms)?r.rooms:q.type, real:r}) }) }
const BUILDINGS = Object.entries(GEO).sort((a,b)=>a[0].localeCompare(b[0])).map(([id,g])=>{
  const b={id, ppm:2100+Math.round(R()*12)*50}; setGeo(b,g); return b });
const BY = Object.fromEntries(BUILDINGS.map(b=>[b.id,b]));
const ALL = () => BUILDINGS.flatMap(b=>b.flats);

/* ===================== Языки ===================== */
const LANGS=['ru','en','tr'], LOC={ru:'ru-RU',en:'en-US',tr:'tr-TR'};
let LANG=LANGS.includes(AP.lang)?AP.lang:'en';
/* Старая ссылка с ?lang=en в адресе — открываем ту же квартиру на странице сайта этого языка. */
function langRedirect(l){ if(!l||l===LANG||!AP.langUrl||!AP.langUrl[l]) return false; location.replace(AP.langUrl[l]+location.hash.replace(/([?&])lang=\w+/,'$1lang='+l)); return true }
{ const u=new URLSearchParams(location.hash.split('?')[1]||'').get('lang'); if(LANGS.includes(u)) langRedirect(u) }
// склонение: формы по правилам языка (one/few/many/other), # — само число
const pl=(n,f)=>(f[new Intl.PluralRules(LOC[LANG]).select(n)]??f.other).replace('#',n.toLocaleString(LOC[LANG]));
const D={
ru:{
  eyebrow:'Демо · данные тестовые', langGroup:'Язык', modeGroup:'Режим просмотра', modeBuyer:'Покупатель', modeSales:'Продажи',
  shortlistBtn:'♡ Подборка', tourBtn:'▶ Показать возможности', filtersBtn:'⚙ Фильтры', filters:'Фильтры', closeFilters:'Закрыть фильтры',
  budget:'Бюджет, €', from:'От', to:'До', budgetFrom:'Бюджет от, евро', budgetTo:'Бюджет до, евро', layout:'Планировка', all:'Все',
  building:'Корпус', floor:'Этаж', reset:'↺ Сбросить', whereAmI:'Где вы сейчас', zoomOut:'Уменьшить', zoomIn:'Увеличить', fitAll:'Вписать целиком', fit:'Вписать',
  fullscreen:'Во весь экран', exitFs:'Выйти из полноэкранного режима',
  st_free:'Свободна', st_booked:'Бронь', st_sold:'Продана', heatTitle:'Продано и в брони:', less:'меньше', more_:'больше',
  listAria:'Список квартир', sort:'Сортировка', sortPrice:'Сначала дешевле', sortPriceDesc:'Сначала дороже', sortArea:'По площади', sortFloor:'Выше этаж', showMore:'Показать ещё',
  tourEnd:'Закончить', next:'Далее →', done:'Готово',
  bName:id=>'Корпус '+id, fl:f=>`${f} этаж`, flShort:f=>`${f} эт`, floorN:f=>`Этаж ${f}`, flatN:n=>`Квартира ${n}`, sqm:'м²',
  priceReq:'Цена по запросу', tbc:'Уточняется', mln:'млн',
  nFlats:n=>pl(n,{one:'# квартира',few:'# квартиры',many:'# квартир',other:'# квартиры'}),
  nFree:n=>pl(n,{one:'# свободная квартира',few:'# свободные квартиры',many:'# свободных квартир',other:'# свободной квартиры'}),
  nBuildings:n=>pl(n,{one:'<b>#</b> корпус',few:'<b>#</b> корпуса',many:'<b>#</b> корпусов',other:'<b>#</b> корпуса'}),
  nFloors:n=>pl(n,{one:'# этаж',few:'# этажа',many:'# этажей',other:'# этажа'}),
  nVariants:n=>pl(n,{one:'# вариант',few:'# варианта',many:'# вариантов',other:'# варианта'}),
  showN:n=>'Показать '+pl(n,{one:'# вариант',few:'# варианта',many:'# вариантов',other:'# варианта'}),
  freeSum:n=>pl(n,{one:'<b>#</b> свободная квартира',few:'<b>#</b> свободные квартиры',many:'<b>#</b> свободных квартир',other:'<b>#</b> свободной квартиры'}),
  from_:'от', to_:'до', byFilters:'по фильтрам',
  tPage:'Выбор квартир', tFloor:'Выберите квартиру на этаже', tFacade:'Выберите этаж', tComplex:'Выберите квартиру в комплексе',
  crComplex:'Комплекс', crFloorPick:'Выбор этажа', allBuildings:'Все корпуса', allFloors:'Все этажи',
  hintComplex:'Наведите на корпус, чтобы увидеть подсказку. Нажмите, чтобы выбрать.', hintFacade:'Нажмите на этаж, чтобы открыть его план.',
  hintFloor:'Кнопки + и − меняют масштаб, увеличенный план можно двигать. «Вписать» показывает этаж целиком.',
  sceneFloor:'План этажа', sceneFacade:'Фасад корпуса', sceneComplex:'Рендер комплекса',
  noFreeFilt:'Нет свободных под фильтры', tapAgain:'Нажмите ещё раз, чтобы выбрать этаж', tapSelect:'Нажмите, чтобы выбрать корпус',
  tapFloor:'Нажмите, чтобы открыть план этажа', tapFlat:'Нажмите, чтобы выбрать', free_:'своб.', none_:'нет', freeN:n=>`${n} свободно`,
  schemeNote:'Схема для демо: поэтажного плана этого корпуса пока нет', lift:'лифт · лестница', schemeDemo:'схема для демо',
  details:'Подробнее', moreAbout:'Подробнее о квартире →', onPlan:'На плане', showOnly:t=>`Показать только ${t}`,
  salesOf:'Продажи корпуса', soldL:'Продано', bookedL:'В брони', soldFor:'Продано на', remain:'Остаток', ofN:(a,b)=>`${a} из ${b}`,
  noMatch:'Под текущие фильтры свободных квартир здесь нет.', resetBP:'Сбросить бюджет и планировку',
  complex:'Комплекс', complexHint:'Нажмите на корпус на рендере или выберите здесь. Цифра — свободные квартиры под фильтры.',
  chooseFloor:'Выбрать этаж →', flatsOfB:'▦ Квартиры корпуса', pickFloorHint:'Выберите этаж на фасаде или в списке', noFree:'нет свободных',
  markup:'✎ Разметить этажи', tapFlatHint:'Нажмите на квартиру на плане, чтобы посмотреть её здесь.',
  bookedNote:'Квартира в брони. Менеджер подскажет, если она освободится.', similarFree:'Похожие свободные', soldWord:'Продана',
  slAdd:'♡ В подборку', slIn:'♥ В подборке', slAddA:n=>`Добавить ${n} в подборку`, slRmA:n=>`Убрать ${n} из подборки`,
  listTitle:'Свободные квартиры', rmFilter:x=>`Убрать фильтр: ${x}`, rmBudget:'Убрать фильтр бюджета',
  emptyTitle:'Свободных квартир под эти условия нет.', emptyPlan:'На плане выше видны все квартиры этажа, включая бронь и проданные. ', emptyTry:'Попробуйте снять одно из ограничений:',
  resetBudget:'Сбросить бюджет', anyLayout:'Любая планировка', allFloorsOf:b=>`Все этажи корпуса ${b}`, building_:b=>`корпус ${b}`,
  backFloor:(f,b)=>`К этажу ${f} корпуса ${b}`, backFacade:b=>`К выбору этажа корпуса ${b}`, backB:b=>`К корпусу ${b}`, backC:'К комплексу',
  descr:{'1+1':'Спальня, гостиная с кухней, санузел','2+1':'Две спальни, гостиная с кухней, санузел','3+1':'Три спальни, гостиная с кухней, два санузла'},
  and_:'и', balcony:'балкон', terrace:'терраса', descrTail:'Подробности отделки и комплектации уточняются.',
  soldBanner:'Эта квартира уже продана. Ниже подобраны похожие свободные варианты. Ваши фильтры каталога не изменены.',
  bookedBanner:'Квартира в брони. Можно добавить её в подборку: менеджер сообщит, если она освободится.',
  gallery:'Галерея', tabPlan:'Планировка', tabFloor:'На этаже', tabPhoto:'Фото', totalArea:'Общая площадь', floorOf:(a,b)=>`${a} из ${b}`,
  view:'Вид из окон', aidat:'Айдат', testNote:'Цена и наличие из тестовых данных. Актуальность подтвердит менеджер.',
  seeSimilar:'Смотреть похожие свободные ↓', ask:'Уточнить наличие и условия', share:'⇪ Поделиться', about:'О квартире', chars:'Характеристики',
  baths:'Санузлы', netArea:'Площадь нетто', finish:'Отделка', location:'Расположение на этаже', openPlanBig:f=>`Открыть план этажа ${f} крупно`,
  selectedNote:n=>`Выделена квартира ${n}. Нажмите, чтобы увеличить.`, terms:'Условия покупки', payTerms:'Условия оплаты', askManager:'Уточнить у менеджера',
  extraCosts:'Дополнительные расходы', byCalc:'По расчёту', docs:'Документы', onRequest:'По запросу',
  similarFreeH:'Похожие свободные квартиры', similarH:'Похожие квартиры', similarNote:'Та же планировка и близкая площадь. Это подсказка, а не результат ваших фильтров.',
  noSimilar:'Похожих свободных квартир сейчас нет.', backToPick:'← Вернуться к выбору квартиры',
  planIllus:'Иллюстрация планировки для демо', schemeCap:'Схема для демо', floorCap:(f,n)=>`Этаж ${f} · выделена ${n}`, planOf:(f,n)=>`План этажа ${f}, выделена квартира ${n}`,
  planAlt:n=>`Планировка квартиры ${n}`, schemeAlt:t=>`Схема планировки ${t}`,
  shareText:q=>`Квартира ${q.num}: ${q.type}, ${q.area} м², ${q.floor} этаж`, linkCopied:'Ссылка на квартиру скопирована', linkTitle:'Ссылка на квартиру', copyManual:'Скопируйте ссылку вручную:',
  slRemoved:n=>`${n} убрана из подборки`, slAdded:n=>`${n} в подборке. Это не бронь`,
  slGone:'Квартиры больше нет в продаже', slStatus:(a,b)=>`Статус изменился: было «${a}», сейчас «${b}»`, slPrice:(a,b)=>`Цена изменилась: было ${a}, сейчас ${b}`,
  shortlist:'Подборка', open:'Открыть', remove:n=>`Убрать ${n}`, slNote:'Хранится в этом браузере, регистрация не нужна. Добавление в подборку не бронирует квартиру.',
  soldNotSent:'Проданные квартиры в запрос не попадут.', slEmpty:'Пока пусто. Нажмите ♡ на карточке квартиры, чтобы сохранить её здесь.', close:'Закрыть',
  reqTitle:'Уточнить наличие и условия', name:'Как к вам обращаться', contact:'Телефон, WhatsApp или e-mail', comment:'Комментарий', commentPh:'Например: удобно связаться после 18:00',
  contactErr:'Укажите телефон или e-mail, чтобы менеджер мог ответить.', notBooking:'Это запрос информации, а не бронирование.', send:'Отправить запрос',
  notSent:'Запрос не отправлен', demoWarn:'<b>Демо не подключено к отправке.</b> Менеджер ничего не получил. На сайте после отправки покупатель увидит: «Обращение получено. Менеджер свяжется с вами и подтвердит наличие. Это не бронирование».',
  wouldGet:'Вот что пришло бы менеджеру в Bitrix24:', ok:'Понятно',
  reqHead:'Новое обращение с сайта', reqName:'Имя', reqNoName:'не указано', reqContact:'Контакт', reqAsks:'Просит уточнить наличие и условия', reqComment:'Комментарий', reqLang:'Язык клиента',
  kBuildings:'Корпусов', kFlats:'Квартир', kSold:'Продано', kBooked:'В брони', kFree:'Свободно', kSoldFor:'Продано на', kRemain:'Остаток в продаже',
  mkTitle:b=>`Своя разметка: ${b}`, mkSaved:'Сохранена только в этом браузере. Скопируйте текст и пришлите в чат, я встрою её в демо.', copy:'Скопировать', copied:'Скопировано', mkReset:'Сбросить свою разметку',
  tourStep:(i,n)=>`Шаг ${i} из ${n}`,
  tour:['Весь комплекс на одном экране. Сверху короткая сводка и фильтры, на метках корпусов число свободных квартир.',
    'Наведение на корпус показывает короткую подсказку. Список и карточка при этом не перестраиваются.',
    'Нажатие фиксирует выбор: справа карточка корпуса с планировками и ценой, снизу только его квартиры.',
    '«Выбрать этаж»: камера приближается к фасаду, на каждом этаже видно число свободных квартир.',
    'Нажатие на этаж открывает его план целиком, со статусами всех квартир. План можно увеличить и подвинуть.',
    'Выбор квартиры подсвечивает её на плане и показывает краткую карточку. Масштаб плана не меняется.',
    '«Подробнее» открывает отдельную страницу квартиры со своей ссылкой: планировка, расположение на этаже, условия, похожие варианты.',
    'Покупатель сохраняет квартиры в подборку без регистрации и отправляет один запрос. В демо честно показано, что запрос никуда не ушёл.',
    'Режим «Продажи» для руководителя: сводка продаж и корпуса, окрашенные по доле проданного.'],
  mk:{p:['Шаг 1 из 3 · Контур корпуса','Кликайте по углам корпуса по кругу, включая крышу. Можно оставить старый контур.'],
    t:['Шаг 2 из 3 · Верх верхнего этажа','Слева направо по линии потолка верхнего этажа, точка на каждом изломе фасада.'],
    bt:['Шаг 3 из 3 · Низ первого этажа','Столько же точек в том же порядке по линии пола первого этажа.'],done:['Проверьте этажи','Пунктир показывает границы этажей.']},
  mkNeed:(a,b)=>` Нужно точек: ${a}, поставлено: ${b}.`, mkFloors:'Жилых этажей', mkUndo:'↶ Точка', mkKeep:'Оставить контур', mkNext:'Далее', mkRedo:'Заново', mkSave:'Сохранить', cancel:'Отмена'
},
en:{
  eyebrow:'Demo · test data', langGroup:'Language', modeGroup:'View mode', modeBuyer:'Buyer', modeSales:'Sales',
  shortlistBtn:'♡ Shortlist', tourBtn:'▶ Show features', filtersBtn:'⚙ Filters', filters:'Filters', closeFilters:'Close filters',
  budget:'Budget, €', from:'Min', to:'Max', budgetFrom:'Minimum budget, euro', budgetTo:'Maximum budget, euro', layout:'Layout', all:'All',
  building:'Building', floor:'Floor', reset:'↺ Reset', whereAmI:'You are here', zoomOut:'Zoom out', zoomIn:'Zoom in', fitAll:'Fit to screen', fit:'Fit',
  fullscreen:'Full screen', exitFs:'Exit full screen',
  st_free:'Available', st_booked:'Reserved', st_sold:'Sold', heatTitle:'Sold and reserved:', less:'less', more_:'more',
  listAria:'Apartment list', sort:'Sort', sortPrice:'Price: low to high', sortPriceDesc:'Price: high to low', sortArea:'By area', sortFloor:'Higher floors first', showMore:'Show more',
  tourEnd:'End tour', next:'Next →', done:'Done',
  bName:id=>'Building '+id, fl:f=>`Floor ${f}`, flShort:f=>`Fl ${f}`, floorN:f=>`Floor ${f}`, flatN:n=>`Apartment ${n}`, sqm:'m²',
  priceReq:'Price on request', tbc:'To be confirmed', mln:'M',
  nFlats:n=>pl(n,{one:'# apartment',other:'# apartments'}),
  nFree:n=>pl(n,{one:'# available apartment',other:'# available apartments'}),
  nBuildings:n=>pl(n,{one:'<b>#</b> building',other:'<b>#</b> buildings'}),
  nFloors:n=>pl(n,{one:'# floor',other:'# floors'}),
  nVariants:n=>pl(n,{one:'# result',other:'# results'}),
  showN:n=>'Show '+pl(n,{one:'# result',other:'# results'}),
  freeSum:n=>pl(n,{one:'<b>#</b> available apartment',other:'<b>#</b> available apartments'}),
  from_:'from', to_:'up to', byFilters:'matching filters',
  tPage:'Apartment finder', tFloor:'Choose an apartment on this floor', tFacade:'Choose a floor', tComplex:'Find your apartment',
  crComplex:'Complex', crFloorPick:'Choose floor', allBuildings:'All buildings', allFloors:'All floors',
  hintComplex:'Hover over a building for a quick summary. Click to select it.', hintFacade:'Click a floor to open its plan.',
  hintFloor:'Use + and − to zoom, drag to move a zoomed plan. “Fit” shows the whole floor.',
  sceneFloor:'Floor plan', sceneFacade:'Building facade', sceneComplex:'Complex render',
  noFreeFilt:'Nothing available for these filters', tapAgain:'Click again to choose a floor', tapSelect:'Click to select this building',
  tapFloor:'Click to open the floor plan', tapFlat:'Click to select', free_:'avail.', none_:'none', freeN:n=>`${n} available`,
  schemeNote:'Demo diagram: no floor plan for this building yet', lift:'lift · stairs', schemeDemo:'demo diagram',
  details:'Details', moreAbout:'Apartment details →', onPlan:'On plan', showOnly:t=>`Show only ${t}`,
  salesOf:'Building sales', soldL:'Sold', bookedL:'Reserved', soldFor:'Sold for', remain:'Remaining', ofN:(a,b)=>`${a} of ${b}`,
  noMatch:'No available apartments here match the current filters.', resetBP:'Reset budget and layout',
  complex:'Complex', complexHint:'Click a building on the render or pick one here. The number shows available apartments for your filters.',
  chooseFloor:'Choose a floor →', flatsOfB:'▦ Apartments in this building', pickFloorHint:'Pick a floor on the facade or in the list', noFree:'none available',
  markup:'✎ Mark up floors', tapFlatHint:'Click an apartment on the plan to see it here.',
  bookedNote:'This apartment is reserved. The manager will let you know if it becomes available.', similarFree:'Similar available', soldWord:'Sold',
  slAdd:'♡ Add to shortlist', slIn:'♥ In shortlist', slAddA:n=>`Add ${n} to shortlist`, slRmA:n=>`Remove ${n} from shortlist`,
  listTitle:'Available apartments', rmFilter:x=>`Remove filter: ${x}`, rmBudget:'Remove budget filter',
  emptyTitle:'No available apartments match these conditions.', emptyPlan:'The plan above shows every apartment on this floor, including reserved and sold ones. ', emptyTry:'Try removing one of the limits:',
  resetBudget:'Reset budget', anyLayout:'Any layout', allFloorsOf:b=>`All floors of building ${b}`, building_:b=>`building ${b}`,
  backFloor:(f,b)=>`To floor ${f}, building ${b}`, backFacade:b=>`To floors of building ${b}`, backB:b=>`To building ${b}`, backC:'To the complex',
  descr:{'1+1':'Bedroom, living room with kitchen, bathroom','2+1':'Two bedrooms, living room with kitchen, bathroom','3+1':'Three bedrooms, living room with kitchen, two bathrooms'},
  and_:'and', balcony:'balcony', terrace:'terrace', descrTail:'Finishing and furnishing details to be confirmed.',
  soldBanner:'This apartment is already sold. Similar available options are listed below. Your catalogue filters have not changed.',
  bookedBanner:'This apartment is reserved. You can add it to your shortlist, and the manager will tell you if it becomes available.',
  gallery:'Gallery', tabPlan:'Layout', tabFloor:'On the floor', tabPhoto:'Photos', totalArea:'Total area', floorOf:(a,b)=>`${a} of ${b}`,
  view:'View', aidat:'Maintenance fee (aidat)', testNote:'Price and availability are test data. The manager will confirm current details.',
  seeSimilar:'See similar available ↓', ask:'Check availability & terms', share:'⇪ Share', about:'About the apartment', chars:'Specifications',
  baths:'Bathrooms', netArea:'Net area', finish:'Finishing', location:'Location on the floor', openPlanBig:f=>`Open floor ${f} plan in full size`,
  selectedNote:n=>`Apartment ${n} is highlighted. Click to enlarge.`, terms:'Purchase terms', payTerms:'Payment terms', askManager:'Ask the manager',
  extraCosts:'Additional costs', byCalc:'Calculated on request', docs:'Documents', onRequest:'On request',
  similarFreeH:'Similar available apartments', similarH:'Similar apartments', similarNote:'Same layout and similar area. This is a suggestion, not a result of your filters.',
  noSimilar:'No similar apartments are available right now.', backToPick:'← Back to apartment search',
  planIllus:'Layout illustration for the demo', schemeCap:'Demo diagram', floorCap:(f,n)=>`Floor ${f} · ${n} highlighted`, planOf:(f,n)=>`Floor ${f} plan, apartment ${n} highlighted`,
  planAlt:n=>`Layout of apartment ${n}`, schemeAlt:t=>`${t} layout diagram`,
  shareText:q=>`Apartment ${q.num}: ${q.type}, ${q.area} m², floor ${q.floor}`, linkCopied:'Link to the apartment copied', linkTitle:'Link to the apartment', copyManual:'Copy the link manually:',
  slRemoved:n=>`${n} removed from shortlist`, slAdded:n=>`${n} added to shortlist. This is not a reservation`,
  slGone:'This apartment is no longer for sale', slStatus:(a,b)=>`Status changed: was “${a}”, now “${b}”`, slPrice:(a,b)=>`Price changed: was ${a}, now ${b}`,
  shortlist:'Shortlist', open:'Open', remove:n=>`Remove ${n}`, slNote:'Saved in this browser, no sign-up needed. Adding to the shortlist does not reserve an apartment.',
  soldNotSent:'Sold apartments will not be included in the request.', slEmpty:'Nothing here yet. Tap ♡ on an apartment card to save it.', close:'Close',
  reqTitle:'Check availability & terms', name:'Your name', contact:'Phone, WhatsApp or e-mail', comment:'Comment', commentPh:'For example: best to call after 6 pm',
  contactErr:'Please enter a phone number or e-mail so the manager can reply.', notBooking:'This is a request for information, not a reservation.', send:'Send request',
  notSent:'Request not sent', demoWarn:'<b>This demo is not connected to sending.</b> The manager received nothing. On the live site the buyer would see: “Request received. A manager will contact you and confirm availability. This is not a reservation.”',
  wouldGet:'This is what the manager would receive in Bitrix24:', ok:'Got it',
  reqHead:'New request from the website', reqName:'Name', reqNoName:'not given', reqContact:'Contact', reqAsks:'Asks to confirm availability and terms', reqComment:'Comment', reqLang:'Client language',
  kBuildings:'Buildings', kFlats:'Apartments', kSold:'Sold', kBooked:'Reserved', kFree:'Available', kSoldFor:'Sold for', kRemain:'Remaining stock',
  mkTitle:b=>`Custom markup: ${b}`, mkSaved:'Saved only in this browser. Copy the text and send it in the chat to add it to the demo.', copy:'Copy', copied:'Copied', mkReset:'Reset custom markup',
  tourStep:(i,n)=>`Step ${i} of ${n}`,
  tour:['The whole complex on one screen. A short summary and filters on top, and building labels show how many apartments are available.',
    'Hovering over a building shows a quick summary. The list and the card stay as they are.',
    'A click selects the building: its card with layouts and prices appears on the right, and the list below shows only its apartments.',
    '“Choose a floor”: the camera zooms in on the facade, and each floor shows how many apartments are available.',
    'Clicking a floor opens the full floor plan with the status of every apartment. The plan can be zoomed and moved.',
    'Selecting an apartment highlights it on the plan and shows a short card. The zoom level stays the same.',
    '“Details” opens a separate apartment page with its own link: layout, location on the floor, terms and similar options.',
    'The buyer saves apartments to a shortlist without signing up and sends one request. The demo clearly shows that nothing was actually sent.',
    'Sales mode for management: a sales summary and buildings coloured by the share sold.'],
  mk:{p:['Step 1 of 3 · Building outline','Click the building corners in order, including the roof. You can keep the current outline.'],
    t:['Step 2 of 3 · Top of the top floor','Left to right along the ceiling line of the top floor, one point at every corner of the facade.'],
    bt:['Step 3 of 3 · Bottom of the first floor','The same number of points in the same order along the floor line of the first floor.'],done:['Check the floors','The dashed lines show the floor boundaries.']},
  mkNeed:(a,b)=>` Points needed: ${a}, placed: ${b}.`, mkFloors:'Residential floors', mkUndo:'↶ Point', mkKeep:'Keep outline', mkNext:'Next', mkRedo:'Start over', mkSave:'Save', cancel:'Cancel'
},
tr:{
  eyebrow:'Demo · test verileri', langGroup:'Dil', modeGroup:'Görünüm modu', modeBuyer:'Alıcı', modeSales:'Satış',
  shortlistBtn:'♡ Favoriler', tourBtn:'▶ Özellikleri göster', filtersBtn:'⚙ Filtreler', filters:'Filtreler', closeFilters:'Filtreleri kapat',
  budget:'Bütçe, €', from:'En az', to:'En çok', budgetFrom:'En az bütçe, euro', budgetTo:'En çok bütçe, euro', layout:'Oda tipi', all:'Tümü',
  building:'Blok', floor:'Kat', reset:'↺ Sıfırla', whereAmI:'Bulunduğunuz yer', zoomOut:'Uzaklaştır', zoomIn:'Yakınlaştır', fitAll:'Ekrana sığdır', fit:'Sığdır',
  fullscreen:'Tam ekran', exitFs:'Tam ekrandan çık',
  st_free:'Müsait', st_booked:'Rezerve', st_sold:'Satıldı', heatTitle:'Satılan ve rezerve:', less:'az', more_:'çok',
  listAria:'Daire listesi', sort:'Sıralama', sortPrice:'Önce en uygun fiyat', sortPriceDesc:'Önce en yüksek fiyat', sortArea:'Alana göre', sortFloor:'Önce üst katlar', showMore:'Daha fazla göster',
  tourEnd:'Turu bitir', next:'İleri →', done:'Tamam',
  bName:id=>id+' Blok', fl:f=>`${f}. kat`, flShort:f=>`${f}. kat`, floorN:f=>`${f}. kat`, flatN:n=>`Daire ${n}`, sqm:'m²',
  priceReq:'Fiyat için sorunuz', tbc:'Belirtilecek', mln:'Mn',
  nFlats:n=>pl(n,{other:'# daire'}),
  nFree:n=>pl(n,{other:'# müsait daire'}),
  nBuildings:n=>pl(n,{other:'<b>#</b> blok'}),
  nFloors:n=>pl(n,{other:'# kat'}),
  nVariants:n=>pl(n,{other:'# sonuç'}),
  showN:n=>pl(n,{other:'# sonucu göster'}),
  freeSum:n=>pl(n,{other:'<b>#</b> müsait daire'}),
  from_:'başlangıç', to_:'en çok', byFilters:'filtrelere göre',
  tPage:'Daire seçimi', tFloor:'Bu kattan daire seçin', tFacade:'Kat seçin', tComplex:'Size uygun daireyi seçin',
  crComplex:'Proje', crFloorPick:'Kat seçimi', allBuildings:'Tüm bloklar', allFloors:'Tüm katlar',
  hintComplex:'Kısa bilgi için bir bloğun üzerine gelin. Seçmek için tıklayın.', hintFacade:'Planını açmak için bir kata tıklayın.',
  hintFloor:'+ ve − ile yakınlaştırın, büyütülmüş planı sürükleyerek kaydırın. “Sığdır” katın tamamını gösterir.',
  sceneFloor:'Kat planı', sceneFacade:'Blok cephesi', sceneComplex:'Proje görseli',
  noFreeFilt:'Bu filtrelerle müsait daire yok', tapAgain:'Kat seçmek için tekrar tıklayın', tapSelect:'Bloğu seçmek için tıklayın',
  tapFloor:'Kat planını açmak için tıklayın', tapFlat:'Seçmek için tıklayın', free_:'müsait', none_:'yok', freeN:n=>`${n} müsait`,
  schemeNote:'Demo şeması: bu bloğun kat planı henüz yok', lift:'asansör · merdiven', schemeDemo:'demo şeması',
  details:'Detaylar', moreAbout:'Daire detayları →', onPlan:'Planda göster', showOnly:t=>`Yalnızca ${t} göster`,
  salesOf:'Blok satışları', soldL:'Satılan', bookedL:'Rezerve', soldFor:'Satış tutarı', remain:'Kalan', ofN:(a,b)=>`${b} daireden ${a}`,
  noMatch:'Mevcut filtrelere uyan müsait daire burada yok.', resetBP:'Bütçe ve oda tipini sıfırla',
  complex:'Proje', complexHint:'Görselde bir bloğa tıklayın veya buradan seçin. Sayı, filtrelerinize uyan müsait daireleri gösterir.',
  chooseFloor:'Kat seçin →', flatsOfB:'▦ Bloktaki daireler', pickFloorHint:'Cephede veya listede bir kat seçin', noFree:'müsait yok',
  markup:'✎ Katları işaretle', tapFlatHint:'Burada görmek için plandaki bir daireye tıklayın.',
  bookedNote:'Bu daire rezerve. Boşalırsa satış temsilcisi size haber verir.', similarFree:'Benzer müsait daireler', soldWord:'Satıldı',
  slAdd:'♡ Favorilere ekle', slIn:'♥ Favorilerde', slAddA:n=>`${n} dairesini favorilere ekle`, slRmA:n=>`${n} dairesini favorilerden çıkar`,
  listTitle:'Müsait daireler', rmFilter:x=>`Filtreyi kaldır: ${x}`, rmBudget:'Bütçe filtresini kaldır',
  emptyTitle:'Bu koşullara uyan müsait daire yok.', emptyPlan:'Yukarıdaki planda rezerve ve satılanlar dahil kattaki tüm daireler görünür. ', emptyTry:'Sınırlardan birini kaldırmayı deneyin:',
  resetBudget:'Bütçeyi sıfırla', anyLayout:'Tüm oda tipleri', allFloorsOf:b=>`${b} Blok, tüm katlar`, building_:b=>`${b} Blok`,
  backFloor:(f,b)=>`${b} Blok, ${f}. kata dön`, backFacade:b=>`${b} Blok kat seçimine dön`, backB:b=>`${b} Bloğa dön`, backC:'Projeye dön',
  descr:{'1+1':'Yatak odası, mutfaklı salon, banyo','2+1':'İki yatak odası, mutfaklı salon, banyo','3+1':'Üç yatak odası, mutfaklı salon, iki banyo'},
  and_:'ve', balcony:'balkon', terrace:'teras', descrTail:'Malzeme ve donanım detayları belirtilecek.',
  soldBanner:'Bu daire satıldı. Aşağıda benzer müsait seçenekler var. Katalog filtreleriniz değişmedi.',
  bookedBanner:'Bu daire rezerve. Favorilere ekleyebilirsiniz; boşalırsa satış temsilcisi size haber verir.',
  gallery:'Galeri', tabPlan:'Plan', tabFloor:'Kattaki yeri', tabPhoto:'Fotoğraflar', totalArea:'Brüt alan', floorOf:(a,b)=>`${a} / ${b}`,
  view:'Manzara', aidat:'Aidat', testNote:'Fiyat ve müsaitlik test verisidir. Güncel bilgiyi satış temsilcisi teyit eder.',
  seeSimilar:'Benzer müsait daireler ↓', ask:'Müsaitlik ve koşulları sorun', share:'⇪ Paylaş', about:'Daire hakkında', chars:'Özellikler',
  baths:'Banyo', netArea:'Net alan', finish:'Malzeme', location:'Kattaki konumu', openPlanBig:f=>`${f}. kat planını büyük aç`,
  selectedNote:n=>`${n} dairesi işaretli. Büyütmek için tıklayın.`, terms:'Satın alma koşulları', payTerms:'Ödeme koşulları', askManager:'Satış temsilcisine sorun',
  extraCosts:'Ek masraflar', byCalc:'Hesaplamaya göre', docs:'Belgeler', onRequest:'Talep üzerine',
  similarFreeH:'Benzer müsait daireler', similarH:'Benzer daireler', similarNote:'Aynı oda tipi ve yakın alan. Bu bir öneridir, filtrelerinizin sonucu değildir.',
  noSimilar:'Şu anda benzer müsait daire yok.', backToPick:'← Daire seçimine dön',
  planIllus:'Demo için plan görseli', schemeCap:'Demo şeması', floorCap:(f,n)=>`${f}. kat · ${n} işaretli`, planOf:(f,n)=>`${f}. kat planı, ${n} dairesi işaretli`,
  planAlt:n=>`${n} dairesinin planı`, schemeAlt:t=>`${t} plan şeması`,
  shareText:q=>`Daire ${q.num}: ${q.type}, ${q.area} m², ${q.floor}. kat`, linkCopied:'Daire bağlantısı kopyalandı', linkTitle:'Daire bağlantısı', copyManual:'Bağlantıyı elle kopyalayın:',
  slRemoved:n=>`${n} favorilerden çıkarıldı`, slAdded:n=>`${n} favorilere eklendi. Bu bir rezervasyon değildir`,
  slGone:'Bu daire artık satışta değil', slStatus:(a,b)=>`Durum değişti: önce “${a}”, şimdi “${b}”`, slPrice:(a,b)=>`Fiyat değişti: önce ${a}, şimdi ${b}`,
  shortlist:'Favoriler', open:'Aç', remove:n=>`${n} çıkar`, slNote:'Bu tarayıcıda saklanır, kayıt gerekmez. Favorilere eklemek daireyi rezerve etmez.',
  soldNotSent:'Satılmış daireler talebe eklenmez.', slEmpty:'Henüz boş. Kaydetmek için daire kartındaki ♡ işaretine dokunun.', close:'Kapat',
  reqTitle:'Müsaitlik ve koşulları sorun', name:'Adınız', contact:'Telefon, WhatsApp veya e-posta', comment:'Not', commentPh:'Örneğin: 18:00’den sonra aranabilirim',
  contactErr:'Satış temsilcisinin size ulaşabilmesi için telefon veya e-posta yazın.', notBooking:'Bu bir bilgi talebidir, rezervasyon değildir.', send:'Talebi gönder',
  notSent:'Talep gönderilmedi', demoWarn:'<b>Bu demo gönderime bağlı değil.</b> Satış temsilcisine hiçbir şey ulaşmadı. Gerçek sitede alıcı şunu görür: “Talebiniz alındı. Satış temsilcisi sizinle iletişime geçip müsaitliği teyit edecek. Bu bir rezervasyon değildir.”',
  wouldGet:'Satış temsilcisine Bitrix24’te şu mesaj ulaşırdı:', ok:'Anladım',
  reqHead:'Siteden yeni talep', reqName:'Ad', reqNoName:'belirtilmedi', reqContact:'İletişim', reqAsks:'Müsaitlik ve koşulların teyidini istiyor', reqComment:'Not', reqLang:'Müşteri dili',
  kBuildings:'Blok', kFlats:'Daire', kSold:'Satılan', kBooked:'Rezerve', kFree:'Müsait', kSoldFor:'Satış tutarı', kRemain:'Satıştaki stok',
  mkTitle:b=>`Özel işaretleme: ${b}`, mkSaved:'Yalnızca bu tarayıcıda kayıtlı. Demoya eklemek için metni kopyalayıp sohbete gönderin.', copy:'Kopyala', copied:'Kopyalandı', mkReset:'Özel işaretlemeyi sıfırla',
  tourStep:(i,n)=>`Adım ${i} / ${n}`,
  tour:['Projenin tamamı tek ekranda. Üstte kısa özet ve filtreler var, blok etiketleri müsait daire sayısını gösteriyor.',
    'Bir bloğun üzerine gelince kısa bilgi açılır. Liste ve kart bu sırada değişmez.',
    'Tıklama bloğu seçer: sağda oda tipleri ve fiyatlarla blok kartı, aşağıda yalnızca bu bloğun daireleri görünür.',
    '“Kat seçin”: kamera cepheye yaklaşır, her katta müsait daire sayısı görünür.',
    'Bir kata tıklamak tüm daireleri durumlarıyla birlikte kat planının tamamını açar. Plan yakınlaştırılabilir ve kaydırılabilir.',
    'Bir daire seçildiğinde planda işaretlenir ve kısa kart açılır. Yakınlaştırma değişmez.',
    '“Detaylar” kendi bağlantısı olan ayrı bir daire sayfası açar: plan, kattaki yeri, koşullar ve benzer seçenekler.',
    'Alıcı kayıt olmadan daireleri favorilere ekler ve tek bir talep gönderir. Demo, talebin aslında gönderilmediğini açıkça gösterir.',
    'Yönetim için Satış modu: satış özeti ve satış oranına göre renklendirilmiş bloklar.'],
  mk:{p:['Adım 1 / 3 · Blok sınırı','Çatı dahil bloğun köşelerine sırayla tıklayın. Mevcut sınırı da bırakabilirsiniz.'],
    t:['Adım 2 / 3 · En üst katın tavanı','Soldan sağa en üst katın tavan çizgisi boyunca, cephenin her köşesine bir nokta.'],
    bt:['Adım 3 / 3 · Zemin katın tabanı','Aynı sayıda noktayı aynı sırayla zemin katın taban çizgisi boyunca koyun.'],done:['Katları kontrol edin','Kesikli çizgiler kat sınırlarını gösterir.']},
  mkNeed:(a,b)=>` Gereken nokta: ${a}, konan: ${b}.`, mkFloors:'Konut katı', mkUndo:'↶ Nokta', mkKeep:'Sınırı bırak', mkNext:'İleri', mkRedo:'Baştan', mkSave:'Kaydet', cancel:'İptal'
}};
const t=(k,...a)=>{ const v=D[LANG][k]??D.ru[k]; return typeof v==='function'?v(...a):v };
const bName=id=>t('bName',id);
function applyStatic(){
  document.querySelector('.ap')?.setAttribute('lang',LANG);
  document.querySelectorAll('[data-i]').forEach(el=>el.textContent=t(el.dataset.i));
  document.querySelectorAll('[data-ia]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.ia).replace(/^[^\wА-яЁё]+/u,'')));
  document.querySelectorAll('[data-ip]').forEach(el=>el.placeholder=t(el.dataset.ip));
  document.querySelectorAll('#lang [data-l]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.l===LANG));
}
function setLang(l){ if(LANGS.includes(l)) langRedirect(l) }
document.querySelectorAll('#lang [data-l]').forEach(b=>b.onclick=()=>setLang(b.dataset.l));

/* ===================== Утилиты ===================== */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const eur = v => v==null? t('priceReq') : '€'+v.toLocaleString(LOC[LANG]);
const meur = v => '€'+(v/1e6).toLocaleString(LOC[LANG],{maximumFractionDigits:1})+(LANG==='en'?'':' ')+t('mln');
const nFlats = n => t('nFlats',n);
const nFree = n => t('nFree',n);
const ST = s => t('st_'+s);
const sqm = a => `${a} ${t('sqm')}`;
const pts = p => p.map(q=>q.join(',')).join(' ');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = ms => new Promise(r=>setTimeout(r, reduced?0:ms));
function toast(x){ const el=$('#toast'); el.textContent=x; el.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove('show'),2600) }

/* ===================== Фильтры и выборка ===================== */
const F = {min:null, max:null, type:'all', sort:'price'};
const okType = q => F.type==='all' || q.type===F.type;
const okBudget = q => (F.min==null || (q.price!=null && q.price>=F.min)) && (F.max==null || (q.price!=null && q.price<=F.max));
const fits = q => q.status==='free' && okType(q) && okBudget(q);
const minOf = list => { const p=list.filter(q=>q.price!=null).map(q=>q.price); return p.length?Math.min(...p):null };
const activeFilters = () => (F.min!=null?1:0)+(F.max!=null?1:0)+(F.type!=='all'?1:0);

/* ===================== Состояние и адрес ===================== */
// CUR: что выбрано. level: complex | facade | floor; page — номер квартиры для отдельной страницы
let CUR = {level:'complex', b:null, f:null, sel:null, page:null};
let LASTPICK = null;           // откуда открыли страницу квартиры (для возврата)
const SCROLL = {};             // позиция прокрутки по экранам
const VB = {};                 // масштаб и положение плана по экранам
let MODE = 'buyer', APPLIED = '', BOOTED = false;
function hashOf(st){
  let p = st.page? `/flat/${st.page}` : !st.b? '/' : st.level==='facade'? `/b/${st.b}/facade` : st.f? `/b/${st.b}/f/${st.f}${st.sel?'/q/'+st.sel:''}` : `/b/${st.b}`;
  const q=new URLSearchParams(); q.set('lang',LANG); if(F.type!=='all') q.set('t',F.type); if(F.min!=null) q.set('min',F.min); if(F.max!=null) q.set('max',F.max);
  return '#'+p+'?'+q.toString();
}
function parse(h){
  h=(h||'').replace(/^#/,''); const [path,qs]=h.split('?'), seg=path.split('/').filter(Boolean).map(decodeURIComponent);
  const st={level:'complex', b:null, f:null, sel:null, page:null};
  if(seg[0]==='flat' && FLAT[seg[1]]) st.page=seg[1];
  else if(seg[0]==='b' && BY[seg[1]]){
    st.b=seg[1];
    if(seg[2]==='facade') st.level='facade';
    if(seg[2]==='f' && +seg[3]>=1 && +seg[3]<=BY[st.b].floors){ st.f=+seg[3]; st.level='floor';
      const q=FLAT[seg[5]]; if(seg[4]==='q' && q && q.b===st.b && q.floor===st.f) st.sel=q.num }
  }
  const p=new URLSearchParams(qs||''), num=k=>{ const v=parseInt(p.get(k),10); return isFinite(v)&&v>0?v:null };
  return {st, lang:LANGS.includes(p.get('lang'))?p.get('lang'):null, flt:{type:['1+1','2+1','3+1'].includes(p.get('t'))?p.get('t'):'all', min:num('min'), max:num('max')}};
}
function setHash(h, replace){
  try{ if(replace) history.replaceState(null,'',h); else history.pushState(null,'',h) }
  catch(e){ try{ if(!replace) location.hash=h }catch(_){} }
}
function go(patch, opt={}){
  const st={level:'complex', b:null, f:null, sel:null, page:null, ...patch};
  if(st.level!=='floor'){ st.f=null; st.sel=null }
  const h=hashOf(st); if(h===APPLIED && !opt.force) return;
  setHash(h, !!opt.replace); apply(st, opt);
}
function setFilters(patch){ Object.assign(F,patch); go({...CUR}, {replace:true, force:true}) }
function fromUrl(){ if(location.hash===APPLIED) return; const {st,flt,lang}=parse(location.hash); Object.assign(F,flt);
  if(lang && lang!==LANG && langRedirect(lang)) return; apply(st,{}) }
addEventListener('popstate', fromUrl); addEventListener('hashchange', fromUrl);
let scrollT; addEventListener('scroll',()=>{ clearTimeout(scrollT); scrollT=setTimeout(()=>{ SCROLL[keyOf(CUR)]=scrollY },80) },{passive:true});
const keyOf = st => st.page? 'page:'+st.page : 'pick:'+st.level+'|'+(st.b||'')+'|'+(st.f||'');

function apply(st, opt){
  const prev=CUR; APPLIED=hashOf(st);
  if(st.page){
    if(!prev.page) LASTPICK=BOOTED?{...prev, y:scrollY}:null;
    CUR=st; showPage(prev); return;
  }
  const fromPage=!!prev.page; CUR=st;
  $('#fpage').hidden=true; $('#picker').hidden=false; stickyBuy(null);
  renderPicker(prev, fromPage);
  if(fromPage){ const y=(LASTPICK&&keyOf(LASTPICK)===keyOf(st))?LASTPICK.y:SCROLL[keyOf(st)]; if(y!=null) requestAnimationFrame(()=>scrollTo(0,y)) }
}

/* ===================== Шапка, фильтры, навигация ===================== */
function renderTop(){
  const ttl=CUR.page? t('flatN',CUR.page) : CUR.level==='floor'? t('tFloor') : CUR.level==='facade'? t('tFacade') : t('tComplex');
  $('#title').textContent=CUR.page?t('tPage'):ttl; document.title=AP.name? `${ttl} — ${AP.name}` : ttl;
  ['#fbar','#summary','#fOpen','#crumbs'].forEach(id=>$(id).classList.toggle('pg-hide',!!CUR.page));
  const list=ALL().filter(fits), mp=minOf(list);
  $('#summary').innerHTML=`${t('nBuildings',BUILDINGS.length)} · ${t('freeSum',list.length)}${mp?` · ${t('from_')} <b>${eur(mp)}</b>`:''}${activeFilters()?` <span style="color:var(--accent)">· ${t('byFilters')}</span>`:''}`;
  $('#kpis').hidden = MODE!=='sales'; if(MODE==='sales') kpis();
  $('#fCount').textContent = activeFilters()||'';
  if(!CUR.page) $('#fApply').textContent=t('showN',listScope().length);
  $('#fMin').value = F.min??''; $('#fMax').value = F.max??'';
  document.querySelectorAll('#fType button').forEach(b=>b.setAttribute('aria-pressed', b.dataset.v===F.type));
  const fb=$('#fB'), b=CUR.page? null : CUR.b;
  fb.innerHTML=`<option value="">${t('allBuildings')}</option>`+BUILDINGS.map(x=>`<option value="${x.id}" ${x.id===b?'selected':''}>${bName(x.id)}</option>`).join('');
  const ff=$('#fF'); ff.disabled=!b;
  ff.innerHTML=`<option value="">${t('allFloors')}</option>`+(b?Array.from({length:BY[b].floors},(_,i)=>i+1).map(i=>`<option value="${i}" ${i===CUR.f?'selected':''}>${t('fl',i)}</option>`).join(''):'');
  const c=[]; const bt=(x,fn,cur)=>cur?`<span class="cur" aria-current="page">${x}</span>`:`<button data-cr="${fn}">${x}</button>`, sep=`<span class="sep">→</span>`;
  if(CUR.page){ const q=FLAT[CUR.page];
    c.push(bt(t('crComplex'),'c'),sep,bt(bName(q.b),'b:'+q.b),sep,bt(t('floorN',q.floor),'f:'+q.b+':'+q.floor),sep,bt(t('flatN',q.num),'',true));
  } else {
    c.push(bt(t('crComplex'),'c',!CUR.b));
    if(CUR.b) c.push(sep, bt(bName(CUR.b),'b:'+CUR.b, CUR.level==='complex'));
    if(CUR.level==='facade') c.push(sep,bt(t('crFloorPick'),'',true));
    if(CUR.level==='floor') c.push(sep,bt(t('floorN',CUR.f),'',true));
  }
  $('#crumbs').innerHTML=c.join('');
  $('#crumbs').querySelectorAll('[data-cr]').forEach(x=>x.onclick=()=>{ const v=x.dataset.cr.split(':');
    if(v[0]==='c') go({}); else if(v[0]==='b') go({b:v[1]}); else if(v[0]==='f') go({b:v[1],f:+v[2],level:'floor'}) });
}
const digits = v => { const n=parseInt(String(v).replace(/\D/g,''),10); return isFinite(n)&&n>0?n:null };
let budgetT;
['#fMin','#fMax'].forEach(id=>$(id).addEventListener('input',()=>{ clearTimeout(budgetT); budgetT=setTimeout(()=>setFilters({min:digits($('#fMin').value), max:digits($('#fMax').value)}),450) }));
['#fMin','#fMax'].forEach(id=>$(id).addEventListener('keydown',e=>{ if(e.key==='Enter'){ clearTimeout(budgetT); setFilters({min:digits($('#fMin').value), max:digits($('#fMax').value)}) } }));
document.querySelectorAll('#fType button').forEach(b=>b.onclick=()=>setFilters({type:b.dataset.v}));
$('#fB').onchange=e=>{ const v=e.target.value; if(!v) go({}); else go({b:v}) };
$('#fF').onchange=e=>{ const v=+e.target.value, b=CUR.b; if(!b) return; if(v) go({b,f:v,level:'floor'}); else go({b,level:'facade'}) };
$('#fReset').onclick=()=>setFilters({min:null,max:null,type:'all'});
$('#fSort').onchange=e=>{ F.sort=e.target.value; renderList() };
function sheet(open){ $('#fbar').classList.toggle('open',open); $('#fScrim').hidden=!open; $('#fOpen').setAttribute('aria-expanded',open); if(open) $('#fMin').focus() }
$('#fOpen').onclick=()=>sheet(true); $('#fClose').onclick=()=>sheet(false); $('#fScrim').onclick=()=>sheet(false);
$('#fApply').onclick=()=>{ clearTimeout(budgetT); setFilters({min:digits($('#fMin').value), max:digits($('#fMax').value)}); sheet(false); $('#list').scrollIntoView({behavior:reduced?'auto':'smooth'}) };

/* ===================== Масштаб и перемещение (общий для рендера и планов) ===================== */
function makeViewer(stageEl, svg, base, key, opt={}){
  let vb=(VB[key]||base).slice();
  const v={base, dragging:false};
  const set=()=>{ svg.setAttribute('viewBox',vb.join(' ')); VB[key]=vb.slice(); stageEl.classList.toggle('zoomed', vb[2]<base[2]-0.5) };
  const scale=w=>{ const r=svg.getBoundingClientRect(); return Math.min(r.width/w[2], r.height/w[3]) };
  const clamp=()=>{ vb[0]=Math.max(base[0],Math.min(base[0]+base[2]-vb[2],vb[0])); vb[1]=Math.max(base[1],Math.min(base[1]+base[3]-vb[3],vb[1])) };
  const toSvg=(x,y)=>{ const r=svg.getBoundingClientRect(), s=scale(vb), ox=(r.width-vb[2]*s)/2, oy=(r.height-vb[3]*s)/2; return [vb[0]+(x-r.left-ox)/s, vb[1]+(y-r.top-oy)/s] };
  v.zoom=(f,cx,cy)=>{ if(cx==null){cx=vb[0]+vb[2]/2; cy=vb[1]+vb[3]/2}
    const z=Math.max(1,Math.min(opt.max||5, base[2]/vb[2]*f)), w=base[2]/z, h=base[3]/z;
    vb=[cx-(cx-vb[0])*w/vb[2], cy-(cy-vb[1])*h/vb[3], w, h]; clamp(); set() };
  v.fit=()=>{ vb=base.slice(); set() };
  const P=new Map(); let start=null, moved=false, pinch=null, suppress=false;
  svg.addEventListener('pointerdown',e=>{ P.set(e.pointerId,[e.clientX,e.clientY]);
    if(P.size===1){ start={x:e.clientX,y:e.clientY,vb:vb.slice()}; moved=false }
    if(P.size===2){ const [a,b]=[...P.values()]; pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]), vb:vb.slice(), c:toSvg((a[0]+b[0])/2,(a[1]+b[1])/2)} } });
  svg.addEventListener('pointermove',e=>{ if(!P.has(e.pointerId)) return; P.set(e.pointerId,[e.clientX,e.clientY]);
    if(P.size===2 && pinch){ const [a,b]=[...P.values()]; vb=pinch.vb.slice(); v.zoom(Math.hypot(a[0]-b[0],a[1]-b[1])/pinch.d, ...pinch.c); moved=true; v.dragging=true; return }
    if(!start) return; const dx=e.clientX-start.x, dy=e.clientY-start.y;
    if(!moved && Math.hypot(dx,dy)<6) return;
    if(start.vb[2]>=base[2]-0.5) return;
    if(!moved){ moved=true; v.dragging=true; try{svg.setPointerCapture(e.pointerId)}catch(_){} hideTip() }
    const s=scale(start.vb); vb=[start.vb[0]-dx/s, start.vb[1]-dy/s, vb[2], vb[3]]; clamp(); set() });
  const end=e=>{ P.delete(e.pointerId); if(P.size<2) pinch=null; if(!P.size){ if(moved){ suppress=true; setTimeout(()=>{suppress=false; v.dragging=false},0) } start=null; moved=false } };
  svg.addEventListener('pointerup',end); svg.addEventListener('pointercancel',end);
  svg.addEventListener('click',e=>{ if(suppress){ e.stopPropagation(); e.preventDefault() } },true);
  svg.addEventListener('wheel',e=>{ if(!(e.ctrlKey||e.metaKey||stageEl.classList.contains('fs'))) return; e.preventDefault(); v.zoom(e.deltaY<0?1.15:1/1.15, ...toSvg(e.clientX,e.clientY)) },{passive:false});
  set(); return v;
}
function animVB(svg, from, to, ms){
  return new Promise(res=>{
    if(reduced){ svg.setAttribute('viewBox',to.join(' ')); return res() }
    const t0=performance.now(), ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
    (function step(now){ const p=Math.min(1,(now-t0)/ms), k=ease(p);
      svg.setAttribute('viewBox', from.map((x,i)=>x+(to[i]-x)*k).join(' ')); p<1?requestAnimationFrame(step):res() })(t0);
  });
}
function fsToggle(el, on){
  on = on ?? !el.classList.contains('fs');
  el.classList.toggle('fs',on); document.body.classList.toggle('fs-open',on);
  const b=el.querySelector('[data-c="fs"]'); if(b){ b.textContent=on?'✕':'⛶'; b.setAttribute('aria-label',on?t('exitFs'):t('fullscreen')) }
  hideTip();
}

/* ===================== Сцены ===================== */
const stageEl=$('#stage'), host=$('#sceneHost'), tip=$('#tip');
let viewer=null, svgEl=null, mountedSig='', zones={};

function frameFor(b){
  const [x0,y0,x1,y1]=b.box, bw=x1-x0, bh=y1-y0;
  let H=Math.min(IMG.h, Math.max(bh*1.35,(bw+bh*0.9)/(IMG.w/IMG.h))), W=H*IMG.w/IMG.h;
  const right=x1+bh*0.8<IMG.w; let cx=(x0+x1)/2+(right?1:-1)*bh*0.3, cy=(y0+y1)/2;
  let x=Math.max(0,Math.min(IMG.w-W,cx-W/2)), y=Math.max(0,Math.min(IMG.h-H,cy-H/2));
  return {vb:[x,y,W,H], right};
}
const heatColor=v=>{ const x=Math.max(0,Math.min(1,(v-0.4)/0.35)); return `hsla(${(42-30*x).toFixed(0)},92%,${(70-22*x).toFixed(0)}%,${(.35+.4*x).toFixed(2)})` };
const soldShare=list=>list.filter(q=>q.status!=='free').length/list.length;
const sum=list=>list.reduce((a,q)=>a+(q.price||0),0);

function sceneComplex(){
  const heat=MODE==='sales';
  let s=`<image href="${IMG.src}" width="${IMG.w}" height="${IMG.h}"/><g class="${heat?'heat':''}">`;
  BUILDINGS.forEach(b=>{
    const fr=b.flats.filter(fits), mp=minOf(fr);
    s+=`<polygon class="zone bld" data-z="bld" data-key="${b.id}" tabindex="0" role="button" aria-label="${bName(b.id)}: ${nFree(fr.length)}" points="${pts(b.g.p)}" style="--hf:${heatColor(soldShare(b.flats))}"/>`;
    zones[b.id]={tip:()=>`<b>${bName(b.id)}</b> · ${t('nFloors',b.floors)}<div>${fr.length?nFree(fr.length)+(mp?` · ${t('from_')} `+eur(mp):''):t('noFreeFilt')}</div><div class="h">${CUR.b===b.id?t('tapAgain'):t('tapSelect')}</div>`};
  });
  s+=`</g>`;
  BUILDINGS.forEach(b=>{
    const top=b.g.p.reduce((a,q)=>q[1]<a[1]?q:a), cx=(b.box[0]+b.box[2])/2, y=top[1]-16, n=b.flats.filter(fits).length, on=CUR.b===b.id;
    const txt=heat? `${b.id} ${Math.round(soldShare(b.flats)*100)}%` : on? `${b.id} · ${t('freeN',n)}` : `${b.id} ${n}`, w=txt.length*12+24;
    s+=`<g class="pin" data-pin="${b.id}"><rect x="${cx-w/2}" y="${y-30}" width="${w}" height="32" rx="16" fill="${on?'#754be9':'#fff'}" opacity=".95"/>
      <text x="${cx}" y="${y-8}" text-anchor="middle" font-family="Inter,sans-serif" font-size="20" font-weight="800" fill="${on?'#fff':'#1c1e26'}">${txt}</text></g>`;
  });
  return s;
}
function sceneFacade(b){
  const g=b.g, n=b.floors, {vb,right}=frameFor(b), k=vb[3]/700;
  const line=i=>g.t.map((q,j)=>[q[0]+(g.b[j][0]-q[0])*i/n, q[1]+(g.b[j][1]-q[1])*i/n]);
  const ext=30, extend=l=>{ const a=l[0],a2=l[1],z=l[l.length-1],z2=l[l.length-2];
    const sa=(a2[1]-a[1])/((a2[0]-a[0])||1), sz=(z[1]-z2[1])/((z[0]-z2[0])||1);
    return [[a[0]-ext,a[1]-sa*ext],...l,[z[0]+ext,z[1]+sz*ext]] };
  const hole=`M0 0H${IMG.w}V${IMG.h}H0Z M${g.p.map(q=>q.join(' ')).join(' L')}Z`;
  let s=`<image href="${IMG.src}" width="${IMG.w}" height="${IMG.h}"/><path d="${hole}" fill="rgba(6,10,20,.55)" fill-rule="evenodd"/>
    <clipPath id="clipB"><polygon points="${pts(g.p)}"/></clipPath>
    <polygon points="${pts(g.p)}" fill="none" stroke="#754be9" stroke-width="2" vector-effect="non-scaling-stroke"/>
    <g id="bands" clip-path="url(#clipB)">`;
  for(let f=1; f<=n; f++){ const i=n-f, top=extend(line(i)), bot=extend(line(i+1)).reverse();
    const fr=b.flats.filter(q=>q.floor===f&&fits(q));
    s+=`<polygon class="zone band" data-z="band" data-key="${f}" tabindex="0" role="button" aria-label="${t('floorN',f)}: ${nFree(fr.length)}" points="${pts(top.concat(bot))}"/>`;
    zones['f'+f]={tip:()=>`<b>${t('floorN',f)}</b><div>${fr.length?nFree(fr.length)+` · ${t('from_')} `+eur(minOf(fr)):t('noFreeFilt')}</div><div class="h">${t('tapFloor')}</div>`};
  }
  s+=`</g><g id="lbls">`;
  const fs=19*k, lw=170*k, lh=32*k, gap=lh*1.15;
  const endY=f=>{ const i=n-f, a=line(i), c=line(i+1), j=right?a.length-1:0; return (a[j][1]+c[j][1])/2 };
  let ys=[]; for(let f=n; f>=1; f--){ let y=endY(f); if(ys.length) y=Math.max(y, ys[ys.length-1]+gap); ys.push(y) }
  for(let f=1; f<=n; f++){ const fr=b.flats.filter(q=>q.floor===f&&fits(q)).length, ey=ys[n-f];
    const lx=right? b.box[2]+16*k : b.box[0]-16*k-lw, ly=ey-lh/2;
    s+=`<g class="flab" data-z="band" data-key="${f}"><rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="${lh/2}" fill="#fff" opacity=".95"/>
      <text x="${lx+12*k}" y="${ly+lh*.7}" font-family="Inter" font-size="${fs}" font-weight="800" fill="#141a26" pointer-events="none">${t('flShort',f)} · ${fr?fr+' '+t('free_'):t('none_')}</text></g>`;
  }
  return {svg:s+`</g>`, vb};
}
function floorBody(b,f,opt={}){
  const flats=b.flats.filter(q=>q.floor===f), sel=opt.sel;
  if(b.id==='L'){
    let s=`<image href="${L_IMG.src}" width="${L_IMG.w}" height="${L_IMG.h}"/>`;
    flats.forEach(q=>{
      const label=`${t('flatN',q.num)}, ${ST(q.status).toLowerCase()}, ${q.type}, ${sqm(q.area)}${q.status!=='sold'?', '+eur(q.price):''}`;
      s+= opt.static? `<polygon class="flat ${q.status}" points="${pts(KP[q.n])}" style="pointer-events:none"/>`
        : `<polygon class="zone flat ${q.status}" data-z="flat" data-key="${q.num}" tabindex="0" role="button" aria-label="${label}" points="${pts(KP[q.n])}"/>`;
      const [x,y]=BADGE[q.n], tx=ST(q.status), w=tx.length*13+26;
      s+=`<g pointer-events="none"><rect x="${x-w/2}" y="${y+28}" width="${w}" height="34" rx="17" fill="${{free:'#1e8f57',booked:'#b8932c',sold:'#6f7786'}[q.status]}"/>
        <text x="${x}" y="${y+51}" text-anchor="middle" font-family="Inter,sans-serif" font-size="20" font-weight="800" fill="#fff">${tx}</text></g>`;
    });
    if(sel){ const q=FLAT[sel]; if(q&&q.b==='L') s+=`<g id="ring"><polygon class="ring-o" points="${pts(KP[q.n])}"/><polygon class="ring-i" points="${pts(KP[q.n])}"/></g>` }
    return {svg:s, vb:[-20,-20,L_IMG.w+40,L_IMG.h+40], wide:false};
  }
  let s=`<rect x="140" y="100" width="920" height="520" fill="#f6f4ef"/><text x="600" y="128" text-anchor="middle" font-family="Inter" font-size="15" fill="#6b7686">${t('schemeNote')}</text>
    <rect x="160" y="340" width="880" height="40" fill="#e3e0da"/><rect x="440" y="380" width="120" height="200" fill="#d5d1ca"/>
    <text x="500" y="485" text-anchor="middle" font-family="Inter" font-size="14" fill="#4b5566">${t('lift')}</text>`;
  flats.forEach(q=>{ const [x,y,w,h]=PLAN[q.n];
    s+= opt.static? `<rect class="flat ${q.status}" x="${x}" y="${y}" width="${w}" height="${h}" style="stroke:#2b3443;stroke-width:3"/>`
      : `<rect class="zone flat ${q.status}" data-z="flat" data-key="${q.num}" tabindex="0" role="button" aria-label="${t('flatN',q.num)}, ${ST(q.status).toLowerCase()}, ${q.type}, ${sqm(q.area)}" x="${x}" y="${y}" width="${w}" height="${h}" style="stroke:#2b3443;stroke-width:3"/>`;
    s+=`<g pointer-events="none" font-family="Inter" fill="#1d2533"><text x="${x+18}" y="${y+34}" font-size="22" font-weight="800">${q.num}</text>
      <text x="${x+18}" y="${y+60}" font-size="16">${q.type} · ${sqm(q.area)}</text><text x="${x+18}" y="${y+h-18}" font-size="16" font-weight="800">${ST(q.status)}</text></g>`;
  });
  if(sel){ const q=FLAT[sel]; if(q){ const [x,y,w,h]=PLAN[q.n]; s+=`<g id="ring"><rect class="ring-o" x="${x}" y="${y}" width="${w}" height="${h}"/><rect class="ring-i" x="${x}" y="${y}" width="${w}" height="${h}"/></g>` } }
  return {svg:s, vb:[140,100,920,520], wide:true};
}
function sceneFloor(b,f){
  const r=floorBody(b,f,{sel:CUR.sel});
  b.flats.filter(q=>q.floor===f).forEach(q=>{
    zones[q.num]={tip:()=>`<b>${q.num}</b> <span class="pill ${q.status}">${ST(q.status)}</span><div>${q.type} · ${sqm(q.area)}${q.status!=='sold'?' · '+eur(q.price):''}</div><div class="h">${t('tapFlat')}</div>`};
  });
  return r;
}

function sceneSig(){ return [LANG, CUR.level, CUR.b||'', CUR.f||'', MODE, F.type, F.min, F.max, CUR.level==='complex'?CUR.b:''].join('|') }
async function mountScene(prev, fromPage){
  const sig=sceneSig(), key='v:'+CUR.level+'|'+(CUR.level==='complex'?'':CUR.b)+'|'+(CUR.f||'');
  if(sig===mountedSig){ updateSel(); return }
  const focusedKey=document.activeElement?.dataset?.key;
  zones={}; hideTip(); mountedSig=sig;
  const b=CUR.b&&BY[CUR.b];
  let body, base, cls='render';
  if(CUR.level==='floor'){ const r=sceneFloor(b,CUR.f); body=r.svg; base=r.vb; cls='plan'+(r.wide?' wide':'') }
  else if(CUR.level==='facade'){ const r=sceneFacade(b); body=r.svg; base=r.vb }
  else { body=sceneComplex(); base=FULL }
  const keepFs=stageEl.classList.contains('fs');
  stageEl.className='stage '+cls+(keepFs?' fs':'');
  host.innerHTML=`<svg id="scene" viewBox="${base.join(' ')}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="${CUR.level==='floor'?t('sceneFloor'):CUR.level==='facade'?t('sceneFacade'):t('sceneComplex')}">${body}</svg>`;
  svgEl=host.firstChild; bindZones(svgEl);
  const prevLvl=prev&&!fromPage?prev.level:null;
  if(!reduced && prevLvl==='complex' && CUR.level==='facade'){
    const from=VB['v:complex||']||FULL; svgEl.setAttribute('viewBox',from.join(' '));
    const bands=svgEl.querySelector('#bands'), lbls=svgEl.querySelector('#lbls'); bands.style.opacity=0; lbls.style.opacity=0;
    await animVB(svgEl, from, base, 650); bands.style.transition=lbls.style.transition='opacity .3s'; bands.style.opacity=1; lbls.style.opacity=1;
  } else if(!reduced && prevLvl==='facade' && CUR.level==='complex' && prev.b){
    const from=frameFor(BY[prev.b]).vb; await animVB(svgEl, from, VB['v:complex||']||FULL, 550);
  } else if(!fromPage && prevLvl && prevLvl!==CUR.level){
    svgEl.style.opacity=0; requestAnimationFrame(()=>requestAnimationFrame(()=>svgEl.style.opacity=1));
  }
  if(sceneSig()!==sig) return;
  viewer=makeViewer(stageEl, svgEl, base, key);
  updateSel();
  if(focusedKey){ const el=svgEl.querySelector(`[data-z][data-key="${focusedKey}"]`); el&&el.focus({preventScroll:true}) }
  if(MK) mkStop();
}
function updateSel(){
  if(!svgEl) return;
  svgEl.querySelectorAll('.bld').forEach(p=>p.classList.toggle('sel', p.dataset.key===CUR.b));
  if(CUR.level==='floor'){
    const old=svgEl.querySelector('#ring'); old&&old.remove();
    const q=CUR.sel&&FLAT[CUR.sel];
    if(q){ const el=svgEl.querySelector(`[data-z="flat"][data-key="${q.num}"]`);
      if(el){ const g=document.createElementNS('http://www.w3.org/2000/svg','g'); g.id='ring';
        const mk=c=>{ const n=el.cloneNode(); ['tabindex','role','aria-label','data-z','data-key','style'].forEach(a=>n.removeAttribute(a)); n.setAttribute('class',c); return n };
        g.append(mk('ring-o'),mk('ring-i')); svgEl.appendChild(g) } }
    svgEl.querySelectorAll('[data-z="flat"]').forEach(p=>p.setAttribute('aria-pressed', p.dataset.key===CUR.sel));
  }
  const q=CUR.level==='floor'&&CUR.sel&&FLAT[CUR.sel], fi=$('#fsinfo');
  fi.classList.toggle('on',!!q);
  fi.innerHTML=q?`<span><b>${q.num}</b> · ${ST(q.status)} · ${q.status==='sold'?'':eur(q.price)}</span><button class="btn primary" style="min-height:40px" id="fsMore">${t('details')}</button>`:'';
  if(q) $('#fsMore').onclick=()=>{ fsToggle(stageEl,false); go({page:q.num}) };
}

function bindZones(svg){
  svg.querySelectorAll('[data-z]').forEach(el=>{
    const kind=el.dataset.z, key=el.dataset.key, zk=kind==='band'?'f'+key:key;
    el.addEventListener('pointerenter',e=>{ if(e.pointerType!=='mouse'||viewer?.dragging) return; hov(el,true); showTip(zk,el) });
    el.addEventListener('pointerleave',e=>{ if(e.pointerType!=='mouse') return; hov(el,false); hideTip() });
    el.addEventListener('focus',()=>{ hov(el,true); showTip(zk,el) });
    el.addEventListener('blur',()=>{ hov(el,false); hideTip() });
    el.addEventListener('click',()=>activate(kind,key));
    el.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); activate(kind,key) } });
  });
}
function hov(el,on){ const k=el.dataset.key, z=el.dataset.z; svgEl&&svgEl.querySelectorAll(`[data-z="${z}"][data-key="${k}"]`).forEach(x=>x.classList.toggle('hov',on));
  if(z==='bld'){ svgEl&&svgEl.querySelectorAll(`[data-pin="${k}"]`).forEach(x=>x.classList.toggle('hov',on)); side.querySelectorAll(`.bgrid [data-b="${k}"]`).forEach(x=>x.classList.toggle('hov',on)) } }
function activate(kind,key){
  if(MK) return;
  hideTip();
  if(kind==='bld'){ if(CUR.b===key && CUR.level==='complex') go({b:key,level:'facade'}); else go({b:key},{replace:CUR.level==='complex'&&!!CUR.b}) }
  else if(kind==='band') go({b:CUR.b,f:+key,level:'floor'});
  else if(kind==='flat') go({b:CUR.b,f:CUR.f,level:'floor',sel:key},{replace:true});
}
function showTip(zk,el){
  const z=zones[zk]; if(!z) return;
  tip.innerHTML=z.tip(); tip.classList.add('show');
  const W=stageEl.clientWidth,H=stageEl.clientHeight,cw=tip.offsetWidth,ch=tip.offsetHeight, w=stageEl.getBoundingClientRect(), r=el.getBoundingClientRect();
  const L=r.left-w.left,T=r.top-w.top,Rr=r.right-w.left,B=r.bottom-w.top;
  let l, tp=Math.max(8,Math.min(H-ch-8,(T+B)/2-ch/2));
  if(Rr+10+cw<=W-8) l=Rr+10; else if(L-10-cw>=8) l=L-10-cw;
  else { l=Math.max(8,Math.min(W-cw-8,(L+Rr)/2-cw/2)); tp=T-ch-10>=8?T-ch-10:Math.min(H-ch-8,B+10) }
  tip.style.left=l+'px'; tip.style.top=tp+'px';
}
function hideTip(){ tip.classList.remove('show') }
$('#ctrls').addEventListener('click',e=>{ const c=e.target.closest('[data-c]')?.dataset.c; if(!c||!viewer) return;
  if(c==='in') viewer.zoom(1.4); if(c==='out') viewer.zoom(1/1.4); if(c==='fit') viewer.fit(); if(c==='fs') fsToggle(stageEl) });

/* ===================== Карточка справа ===================== */
const side=$('#side');
function typeRows(b){
  const types=['1+1','2+1','3+1'].filter(x=>b.flats.some(q=>q.type===x));
  return `<div class="rows">${types.map(x=>{ const n=b.flats.filter(q=>q.status==='free'&&q.type===x&&okBudget(q)).length;
    return `<button class="row" data-type="${x}" aria-pressed="${F.type===x}" title="${t('showOnly',x)}"><b>${x}</b><span>${nFlats(n)}</span><span class="chev">›</span></button>` }).join('')}</div>`;
}
function salesBox(b){
  const c=st=>b.flats.filter(q=>q.status===st);
  return `<div class="salesbox"><b>${t('salesOf')}</b><dl class="kv"><dt>${t('soldL')}</dt><dd>${t('ofN',c('sold').length,b.flats.length)}</dd><dt>${t('bookedL')}</dt><dd>${c('booked').length}</dd>
    <dt>${t('soldFor')}</dt><dd>${meur(sum(c('sold')))}</dd><dt>${t('remain')}</dt><dd>${meur(sum(c('free')))}</dd></dl>
    <div class="minibar"><i style="flex:${c('sold').length};background:var(--sold)"></i><i style="flex:${c('booked').length};background:var(--booked)"></i><i style="flex:${c('free').length};background:var(--free)"></i></div></div>`;
}
function noMatch(){
  return `<div class="stack"><p class="muted">${t('noMatch')}</p>${activeFilters()?`<button class="btn" data-act="reset">${t('resetBP')}</button>`:''}</div>`;
}
function renderSide(){
  const b=CUR.b&&BY[CUR.b]; let h='';
  if(!b){
    h=`<h2>${t('complex')}</h2><p class="muted">${t('complexHint')}</p>
      <div class="bgrid">${BUILDINGS.map(x=>`<button data-b="${x.id}" aria-label="${bName(x.id)}: ${nFree(x.flats.filter(fits).length)}"><b>${x.id}</b><span>${x.flats.filter(fits).length}</span></button>`).join('')}</div>`;
  } else if(CUR.level==='complex'){
    const fr=b.flats.filter(fits), mp=minOf(fr);
    h=`<div><h2>${bName(b.id)}</h2><p class="muted">${t('nFloors',b.floors)}</p></div>
      ${fr.length?`<p class="hl">${nFree(fr.length)}</p><div class="big">${t('from_')} ${eur(mp)}</div>`:noMatch()}
      ${typeRows(b)}
      <div class="stack"><button class="btn primary block" data-act="floors">${t('chooseFloor')}</button><button class="btn block" data-act="list">${t('flatsOfB')}</button></div>
      ${MODE==='sales'?salesBox(b):''}`;
  } else if(CUR.level==='facade'){
    h=`<div><h2>${bName(b.id)}</h2><p class="muted">${t('pickFloorHint')}</p></div>
      <div class="rows">${Array.from({length:b.floors},(_,i)=>b.floors-i).map(f=>{ const fr=b.flats.filter(q=>q.floor===f&&fits(q));
        return `<button class="row" data-f="${f}"><b>${t('fl',f)}</b><span>${fr.length?nFree(fr.length)+` · ${t('from_')} `+eur(minOf(fr)):t('noFree')}</span><span class="chev">›</span></button>` }).join('')}</div>
      ${MODE==='sales'?`<button class="btn" id="mkBtn">${t('markup')}</button>`:''}`;
  } else {
    const q=CUR.sel&&FLAT[CUR.sel];
    if(!q){
      const fl=b.flats.filter(x=>x.floor===CUR.f), c=st=>fl.filter(x=>x.status===st).length;
      h=`<div><h2>${t('floorN',CUR.f)}</h2><p class="muted">${bName(b.id)} · ${nFlats(fl.length)}</p></div>
        <dl class="kv">${['free','booked','sold'].map(st=>`<dt><i class="dot" style="background:var(--${st})"></i> ${ST(st)}</dt><dd>${c(st)}</dd>`).join('')}</dl>
        <p class="muted">${t('tapFlatHint')}</p>`;
    } else h=quickCard(q);
  }
  side.innerHTML=h;
  side.querySelectorAll('[data-b]').forEach(x=>{ x.onclick=()=>go({b:x.dataset.b});
    const on=v=>{ const el=svgEl&&svgEl.querySelector(`.bld[data-key="${x.dataset.b}"]`); if(!el) return; hov(el,v); v?showTip(x.dataset.b,el):hideTip() };
    x.addEventListener('pointerenter',e=>{ if(e.pointerType==='mouse') on(true) }); x.addEventListener('pointerleave',e=>{ if(e.pointerType==='mouse') on(false) });
    x.addEventListener('focus',()=>on(true)); x.addEventListener('blur',()=>on(false)) });
  side.querySelectorAll('[data-type]').forEach(x=>x.onclick=()=>setFilters({type:F.type===x.dataset.type?'all':x.dataset.type}));
  side.querySelectorAll('[data-f]').forEach(x=>x.onclick=()=>go({b:CUR.b,f:+x.dataset.f,level:'floor'}));
  side.querySelector('[data-act="floors"]')?.addEventListener('click',()=>go({b:CUR.b,level:'facade'}));
  side.querySelector('[data-act="list"]')?.addEventListener('click',()=>$('#list').scrollIntoView({behavior:reduced?'auto':'smooth'}));
  side.querySelector('[data-act="reset"]')?.addEventListener('click',()=>setFilters({min:null,max:null,type:'all'}));
  side.querySelector('[data-act="more"]')?.addEventListener('click',e=>go({page:e.currentTarget.dataset.num}));
  side.querySelector('[data-act="similar"]')?.addEventListener('click',e=>{ go({page:e.currentTarget.dataset.num}); setTimeout(()=>$('#similar')?.scrollIntoView(),50) });
  side.querySelector('#mkBtn')?.addEventListener('click',mkStart);
  syncSl();
}
function thumbOf(q){ return q.img? `<img src="${q.img}" alt="${t('planAlt',q.num)}" loading="lazy">` : schemeSvg(q) }
function quickCard(q){
  const sold=q.status==='sold';
  return `<div><h2>${t('flatN',q.num)}</h2><div style="margin-top:8px"><span class="pill ${q.status}">${ST(q.status)}</span>${q.real?` <span class="pill real">${(AP.realText||{}).base}</span>`:''}</div></div>
    <div class="big">${sold?t('soldWord'):eur(q.price)}</div>
    <p style="margin:0;font-size:17px">${q.type} · ${sqm(q.area)} · ${t('fl',q.floor)}</p>
    <div class="thumb">${thumbOf(q)}</div>
    ${q.status==='booked'?`<p class="note">${t('bookedNote')}</p>`:''}
    <div class="stack"><button class="btn primary block" data-act="more" data-num="${q.num}">${t('moreAbout')}</button>
    ${sold?`<button class="btn block" data-act="similar" data-num="${q.num}">${t('similarFree')}</button>`:`<button class="btn block sl-btn" data-num="${q.num}"></button>`}</div>`;
}

const LAYOUTS={
 '1+1':[['bal',0,40,36,100],['bed',36,0,110,66],['bath',146,0,54,66],['liv',36,66,164,74]],
 '2+1':[['bal',0,40,36,100],['bed',36,0,74,66],['bath',110,0,44,66],['bed',154,0,46,140],['liv',36,66,118,74]],
 '3+1':[['bal',0,40,36,100],['bed',36,0,64,66],['bath',100,0,36,33],['bath',100,33,36,33],['bed',136,0,64,66],['liv',36,66,104,74],['bed',140,66,60,74]]};
function schemeSvg(q){
  let s=`<svg class="fp" viewBox="-8 -8 216 156" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${t('schemeAlt',q.type)}">`;
  LAYOUTS[q.type].forEach(([k,x,y,w,h])=>{ const fill=k==='bath'?'#e3e8ec':k==='bal'?'#ece8e1':'#d8b384';
    s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#3b3b3b" stroke-width="${k==='bal'?1:2.2}"/>`;
    if(k==='bed'){ const cx=x+w/2, cy=y+h/2, bw=Math.min(w*.6,40), bh=Math.min(h*.55,34); s+=`<rect x="${cx-bw/2}" y="${cy-bh/2}" width="${bw}" height="${bh}" rx="2" fill="#f4f1ea" stroke="#9aa3ad" stroke-width=".6"/><rect x="${cx-bw/2}" y="${cy-bh/2+bh*.45}" width="${bw}" height="${bh*.55}" fill="#5d6f8f" opacity=".75"/>` } });
  return s+`<text x="100" y="152" text-anchor="middle" font-family="Inter" font-size="8" fill="#6b7686">${t('schemeDemo')}</text></svg>`;
}

/* ===================== Список квартир ===================== */
let shown=12, listSig='';
function listScope(){ const b=CUR.b; return ALL().filter(q=>fits(q) && (!b||q.b===b) && (!CUR.f||q.floor===CUR.f)) }
function renderList(){
  const sig=[CUR.b,CUR.f,F.type,F.min,F.max].join('|'); if(sig!==listSig){ shown=12; listSig=sig }
  const list=listScope(), k=F.sort.replace('-',''), dir=F.sort[0]==='-'?-1:1;
  list.sort((a,b)=>((a[k]??Infinity)-(b[k]??Infinity))*dir || a.num.localeCompare(b.num));
  $('#listTitle').textContent=[t('listTitle'), CUR.b&&bName(CUR.b), CUR.f&&t('floorN',CUR.f)].filter(Boolean).join(' · ');
  $('#count').textContent=t('nVariants',list.length);
  const chips=[], chip=(rm,label,aria)=>`<button class="chip" data-rm="${rm}" aria-label="${aria}">${label}<i>×</i></button>`;
  if(CUR.b) chips.push(chip('b',bName(CUR.b),t('rmFilter',bName(CUR.b))));
  if(CUR.f) chips.push(chip('f',t('floorN',CUR.f),t('rmFilter',t('floorN',CUR.f))));
  if(F.type!=='all') chips.push(chip('t',F.type,t('rmFilter',F.type)));
  if(F.min!=null||F.max!=null) chips.push(chip('p',`${F.min!=null?t('from_')+' '+eur(F.min):''}${F.min!=null&&F.max!=null?' ':''}${F.max!=null?t('to_')+' '+eur(F.max):''}`,t('rmBudget')));
  $('#ctxChips').innerHTML=chips.join('');
  $('#ctxChips').querySelectorAll('[data-rm]').forEach(c=>c.onclick=()=>{ const r=c.dataset.rm;
    if(r==='b') go({}); else if(r==='f') go({b:CUR.b,level:'facade'}); else if(r==='t') setFilters({type:'all'}); else setFilters({min:null,max:null}) });
  const g=$('#grid');
  if(!list.length){
    const btns=[];
    if(F.min!=null||F.max!=null) btns.push(`<button class="btn" data-x="p">${t('resetBudget')}</button>`);
    if(F.type!=='all') btns.push(`<button class="btn" data-x="t">${t('anyLayout')}</button>`);
    if(CUR.f) btns.push(`<button class="btn" data-x="f">${t('allFloorsOf',CUR.b)}</button>`);
    if(CUR.b) btns.push(`<button class="btn" data-x="b">${t('allBuildings')}</button>`);
    g.innerHTML=`<div class="empty"><p><b>${t('emptyTitle')}</b></p><p style="color:var(--muted)">${CUR.f?t('emptyPlan'):''}${t('emptyTry')}</p><div class="ctx">${btns.join('')}</div></div>`;
    g.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{ const x=b.dataset.x; if(x==='p') setFilters({min:null,max:null}); if(x==='t') setFilters({type:'all'}); if(x==='f') go({b:CUR.b,level:'facade'}); if(x==='b') go({}) });
    $('#more').hidden=true; return;
  }
  g.innerHTML=list.slice(0,shown).map(cardHtml).join('');
  bindCards(g);
  $('#more').hidden=list.length<=shown;
}
function cardHtml(q){
  return `<article class="fcard" data-num="${q.num}">
    <div class="tw"><div class="thumb">${thumbOf(q)}</div><button class="btn heart sl-btn" data-num="${q.num}" data-icon="1"></button></div>
    <div class="stack" style="gap:6px;min-width:0">
      <div class="t"><span class="num">${q.num}</span><span>${q.real?`<span class="pill real">${(AP.realText||{}).base}</span> `:''}<span class="pill ${q.status}">${ST(q.status)}</span></span></div>
      <div class="meta">${q.type} · ${sqm(q.area)} · ${t('fl',q.floor)}${CUR.b===q.b?'':' · '+t('building_',q.b)}</div>
      <div class="pr">${q.status==='sold'?t('soldWord'):eur(q.price)}</div>
      <div class="acts"><button class="btn" data-go="page">${t('details')}</button><button class="btn" data-go="plan">${t('onPlan')}</button></div>
    </div></article>`;
}
function bindCards(root){
  root.querySelectorAll('.fcard').forEach(c=>{ const q=FLAT[c.dataset.num];
    c.querySelector('[data-go="page"]').onclick=()=>go({page:q.num});
    c.querySelector('[data-go="plan"]').onclick=()=>{ go({b:q.b,f:q.floor,level:'floor',sel:q.num}); stageEl.scrollIntoView({behavior:reduced?'auto':'smooth',block:'center'}) };
  });
  syncSl();
}
$('#more').onclick=()=>{ shown+=12; renderList() };

/* ===================== Экраны 1–2 целиком ===================== */
function renderPicker(prev, fromPage){
  renderTop();
  mountScene(prev, fromPage);
  renderSide(); renderList();
  const sales=MODE==='sales'&&CUR.level==='complex';
  $('#legend').hidden=sales; $('#heatLegend').hidden=!sales;
  $('#hint').textContent = CUR.level==='complex'? t('hintComplex') : CUR.level==='facade'? t('hintFacade') : t('hintFloor');
  const fsw=$('#floorsw'), b=CUR.b&&BY[CUR.b];
  fsw.innerHTML = CUR.level==='floor'? `<span>${t('floor')}:</span>`+Array.from({length:b.floors},(_,i)=>i+1).map(f=>`<button data-f="${f}" aria-current="${f===CUR.f}" aria-label="${t('floorN',f)}">${f}</button>`).join('') : '';
  fsw.querySelectorAll('[data-f]').forEach(x=>x.onclick=()=>go({b:CUR.b,f:+x.dataset.f,level:'floor'}));
  mkExport();
}

/* ===================== Экран 3: страница квартиры ===================== */
let pageTab='plan', galViewer=null;
function describe(q){ return `${t('descr')[q.type]} ${t('and_')} ${t(q.outdoor)}. ${t('descrTail')}` }
function similar(q){
  return ALL().filter(x=>x.status==='free' && x.num!==q.num && x.type===q.type)
    .sort((a,b)=>(a.b===q.b?0:1)-(b.b===q.b?0:1) || Math.abs(a.area-q.area)-Math.abs(b.area-q.area) || Math.abs(a.price-q.price)-Math.abs(b.price-q.price)).slice(0,3);
}
function backTarget(q){
  if(LASTPICK && !LASTPICK.page){ const L=LASTPICK;
    const label=L.level==='floor'?t('backFloor',L.f,L.b):L.level==='facade'?t('backFacade',L.b):L.b?t('backB',L.b):t('backC');
    return {st:{level:L.level,b:L.b,f:L.f,sel:L.sel}, label} }
  return {st:{level:'floor',b:q.b,f:q.floor,sel:q.num}, label:t('backFloor',q.floor,q.b)};
}
function showPage(prev){
  const q=FLAT[CUR.page], b=BY[q.b], sold=q.status==='sold', bk=backTarget(q), sim=similar(q);
  renderTop();
  $('#picker').hidden=true; const P=$('#fpage'); P.hidden=false; hideTip(); fsToggle(stageEl,false);
  const tabs=[['plan',t('tabPlan')],['floor',t('tabFloor')]].concat(q.photos.length?[['photo',t('tabPhoto')]]:[]);
  if(!tabs.some(x=>x[0]===pageTab)) pageTab='plan';
  P.innerHTML=`
    <button class="btn link back" data-back>← ${bk.label}</button>
    <div class="fhead"><h1>${t('flatN',q.num)}</h1><span class="pill ${q.status}">${ST(q.status)}</span>${q.real?`<span class="pill real">${(AP.realText||{}).base}</span>`:''}</div>
    <p class="params">${q.type}<span>·</span>${bName(q.b)}<span>·</span>${t('floorN',q.floor)}<span>·</span>${sqm(q.area)}</p>
    ${sold?`<div class="banner sold">${t('soldBanner')}</div>`:''}
    ${q.status==='booked'?`<div class="banner">${t('bookedBanner')}</div>`:''}
    <div class="tabs" role="tablist" aria-label="${t('gallery')}">${tabs.map(([k,x])=>`<button role="tab" data-tab="${k}" aria-selected="${k===pageTab}">${x}</button>`).join('')}</div>
    <div class="fgrid">
      <div class="gal" id="gal" role="tabpanel"></div>
      <aside class="buy">
        <div class="big">${sold?t('soldWord'):eur(q.price)}</div>
        <dl class="kv"><dt>${t('totalArea')}</dt><dd>${sqm(q.area)}</dd><dt>${t('floor')}</dt><dd>${t('floorOf',q.floor,b.floors)}</dd><dt>${t('view')}</dt><dd>${t('tbc')}</dd><dt>${t('aidat')}</dt><dd>${t('tbc')}</dd></dl>
        ${q.real?`<div class="realbox"><b>${(AP.realText||{}).fromBase.replace('#',esc(q.real.ref))}</b><p class="note">${(AP.realText||{}).note}</p><a class="btn block" href="${esc(q.real.url)}">${(AP.realText||{}).card}</a></div>`:`<p class="note">${t('testNote')}</p>`}
        ${sold?`<button class="btn primary block" data-act="sim">${t('seeSimilar')}</button>`
              :`<button class="btn primary block" data-act="ask">${t('ask')}</button><button class="btn block sl-btn" data-num="${q.num}"></button>`}
        <button class="btn block" data-act="share">${t('share')}</button>
      </aside>
    </div>
    <section class="card2"><h2>${t('about')}</h2><p>${describe(q)}</p></section>
    <div class="two">
      <section class="card2"><h2>${t('chars')}</h2><div class="chars">
        <div><i>▦</i><span>${t('layout')}</span><b>${q.type}</b></div>
        <div><i>⌂</i><span>${t('baths')}</span><b>${q.baths}</b></div>
        <div><i>◫</i><span>${t('netArea')}</span><b>${t('tbc')}</b></div>
        <div><i>✦</i><span>${t('finish')}</span><b>${t('tbc')}</b></div></div></section>
      <section class="card2"><h2>${t('location')}</h2>
        <button class="miniplan" data-act="mini" aria-label="${t('openPlanBig',q.floor)}">${miniFloor(q)}</button>
        <p class="note">${t('selectedNote',q.num)}</p></section>
    </div>
    <section class="card2"><h2>${t('terms')}</h2><div class="terms">
      <div class="term"><i>◎</i><b>${t('payTerms')}</b><span>${t('askManager')}</span></div>
      <div class="term"><i>▤</i><b>${t('extraCosts')}</b><span>${t('byCalc')}</span></div>
      <div class="term"><i>✓</i><b>${t('docs')}</b><span>${t('onRequest')}</span></div></div></section>
    <section class="card2" id="similar"><h2>${sold?t('similarFreeH'):t('similarH')}</h2>
      ${sold?`<p class="note">${t('similarNote')}</p>`:''}
      ${sim.length?`<div class="grid">${sim.map(cardHtml).join('')}</div>`:`<p class="muted">${t('noSimilar')}</p>`}</section>
    <button class="btn back" data-back>${t('backToPick')}</button>`;
  renderGal(q);
  P.querySelectorAll('[data-back]').forEach(x=>x.onclick=()=>go(bk.st));
  P.querySelectorAll('[data-tab]').forEach(x=>x.onclick=()=>{ pageTab=x.dataset.tab; P.querySelectorAll('[data-tab]').forEach(y=>y.setAttribute('aria-selected',y===x)); renderGal(q) });
  P.querySelector('[data-act="ask"]')?.addEventListener('click',()=>openForm([q.num]));
  P.querySelector('[data-act="sim"]')?.addEventListener('click',()=>$('#similar').scrollIntoView({behavior:reduced?'auto':'smooth'}));
  P.querySelector('[data-act="share"]').onclick=()=>share(q);
  P.querySelector('[data-act="mini"]').onclick=()=>{ pageTab='floor'; P.querySelectorAll('[data-tab]').forEach(y=>y.setAttribute('aria-selected',y.dataset.tab==='floor')); renderGal(q); fsToggle($('#gal'),true) };
  bindCards(P.querySelector('#similar'));
  stickyBuy(sold?null:q);
  if(!prev || prev.page!==CUR.page) scrollTo(0,0);
  syncSl();
}
function miniFloor(q){
  const r=floorBody(BY[q.b], q.floor, {static:true, sel:q.num});
  return `<svg viewBox="${r.vb.join(' ')}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${r.svg}</svg>`;
}
function renderGal(q){
  const g=$('#gal'), wasFs=g.classList.contains('fs');
  const ctl=`<div class="ctrls">${pageTab==='floor'?`<button class="ctrl" data-c="out" aria-label="${t('zoomOut')}">−</button><button class="ctrl" data-c="in" aria-label="${t('zoomIn')}">+</button><button class="ctrl txt" data-c="fit" aria-label="${t('fitAll')}">${t('fit')}</button>`:''}<button class="ctrl" data-c="fs" aria-label="${wasFs?t('exitFs'):t('fullscreen')}">${wasFs?'✕':'⛶'}</button></div>`;
  if(pageTab==='plan'){
    g.innerHTML=(q.img?`<img src="${q.img}" alt="${t('planAlt',q.num)}">`:schemeSvg(q))+`<span class="cap">${q.img?t('planIllus'):t('schemeCap')}</span>`+ctl;
    galViewer=null;
  } else {
    const r=floorBody(BY[q.b], q.floor, {static:true, sel:q.num});
    g.innerHTML=`<div class="stage plan" style="background:#fff"><svg viewBox="${r.vb.join(' ')}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${t('planOf',q.floor,q.num)}">${r.svg}</svg></div><span class="cap">${t('floorCap',q.floor,q.num)}</span>`+ctl;
    const st=g.querySelector('.stage'); galViewer=makeViewer(st, st.querySelector('svg'), r.vb, 'gal:'+q.num);
  }
  g.querySelector('.ctrls').onclick=e=>{ const c=e.target.closest('[data-c]')?.dataset.c; if(!c) return;
    if(c==='fs'){ fsToggle(g); renderGal(q); return }
    if(!galViewer) return; if(c==='in') galViewer.zoom(1.4); if(c==='out') galViewer.zoom(1/1.4); if(c==='fit') galViewer.fit() };
}
function stickyBuy(q){
  const s=$('#stickybuy'); s.hidden=!q; document.body.classList.toggle('has-sticky',!!q);
  if(q){ s.innerHTML=`<div style="min-width:0"><b>${q.num}</b><div class="note">${eur(q.price)}</div></div><button class="btn primary">${t('ask')}</button>`; s.querySelector('button').onclick=()=>openForm([q.num]) }
}
const linkOf = num => location.href.split('#')[0]+'#/flat/'+num+'?lang='+LANG;
async function share(q){
  const url=linkOf(q.num), text=t('shareText',q);
  try{ if(navigator.share){ await navigator.share({title:text,text,url}); return } }catch(e){ if(e.name==='AbortError') return }
  try{ await navigator.clipboard.writeText(url); toast(t('linkCopied')) }
  catch(e){ openInfo(t('linkTitle'), `<p>${t('copyManual')}</p><div class="msg">${esc(url)}</div>`) }
}

/* ===================== Подборка (без регистрации, хранится в этом браузере) ===================== */
const SL_KEY='ap.shortlist.v1';
let SL=[]; try{ SL=JSON.parse(localStorage.getItem(SL_KEY)||'[]')||[] }catch(e){ SL=[] }
const SL_NOTES={};   // при повторном открытии сверяем с текущими данными
SL.forEach(it=>{ const q=FLAT[it.num];
  if(!q) SL_NOTES[it.num]=()=>t('slGone');
  else if(q.status!==it.status) SL_NOTES[it.num]=()=>t('slStatus',ST(it.status),ST(q.status));
  else if(q.price!==it.price) SL_NOTES[it.num]=()=>t('slPrice',eur(it.price),eur(q.price)); });
const slSave=()=>{ try{ localStorage.setItem(SL_KEY, JSON.stringify(SL)) }catch(e){} };
const slHas=num=>SL.some(x=>x.num===num);
function slToggle(num){
  if(slHas(num)){ SL=SL.filter(x=>x.num!==num); toast(t('slRemoved',num)) }
  else { const q=FLAT[num]; SL.push({num, status:q.status, price:q.price, t:Date.now()}); toast(t('slAdded',num)) }
  delete SL_NOTES[num]; slSave(); syncSl();
}
function syncSl(){
  $('#slCount').textContent=SL.length||'';
  document.querySelectorAll('.sl-btn').forEach(b=>{ const on=slHas(b.dataset.num); b.setAttribute('aria-pressed',on);
    if(b.dataset.icon){ b.textContent=on?'♥':'♡'; b.setAttribute('aria-label',on?t('slRmA',b.dataset.num):t('slAddA',b.dataset.num)) }
    else b.textContent=on?t('slIn'):t('slAdd');
    b.onclick=e=>{ e.stopPropagation(); slToggle(b.dataset.num) } });
}
const modal=$('#modal'); let lastFocus=null;
function openModal(html){ lastFocus=document.activeElement; modal.innerHTML=html; modal.hidden=false;
  modal.querySelector('.x')?.addEventListener('click',closeModal); modal.onclick=e=>{ if(e.target===modal) closeModal() };
  setTimeout(()=>(modal.querySelector('input,button.primary,button')||modal).focus(),30) }
function closeModal(){ modal.hidden=true; modal.innerHTML=''; lastFocus&&lastFocus.focus&&lastFocus.focus() }
function openInfo(x,body){ openModal(`<div class="dialog" role="dialog" aria-modal="true" aria-label="${esc(x)}"><button class="x" aria-label="${t('close')}">×</button><h2>${x}</h2>${body}</div>`) }
function openShortlist(){
  const items=SL.map(it=>{ const q=FLAT[it.num];
    return `<div class="sitem"><span>${q?`<b>${q.num}</b> · ${q.type}, ${sqm(q.area)} · <span class="pill ${q.status}">${ST(q.status)}</span><br><span class="note">${q.status==='sold'?t('soldWord'):eur(q.price)}</span>`:`<b>${it.num}</b>`}</span>
      <span class="acts">${q?`<button class="btn" data-open="${q.num}">${t('open')}</button>`:''}<button class="btn" data-rm="${it.num}" aria-label="${t('remove',it.num)}">×</button></span>
      ${SL_NOTES[it.num]?`<span class="warn">⚠ ${SL_NOTES[it.num]()}</span>`:''}</div>` }).join('');
  const sendable=SL.filter(it=>FLAT[it.num]&&FLAT[it.num].status!=='sold').map(it=>it.num);
  openModal(`<div class="dialog" role="dialog" aria-modal="true" aria-label="${t('shortlist')}"><button class="x" aria-label="${t('close')}">×</button>
    <h2>${t('shortlist')}${SL.length?' · '+SL.length:''}</h2>
    ${SL.length?`<p class="note">${t('slNote')}</p><div class="stack">${items}</div>
      <button class="btn primary block" id="slSend" ${sendable.length?'':'disabled'}>${t('ask')}</button>
      ${sendable.length<SL.length?`<p class="note">${t('soldNotSent')}</p>`:''}`
      :`<p style="color:var(--muted)">${t('slEmpty')}</p>`}</div>`);
  modal.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{ SL=SL.filter(x=>x.num!==b.dataset.rm); delete SL_NOTES[b.dataset.rm]; slSave(); syncSl(); openShortlist() });
  modal.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{ closeModal(); go({page:b.dataset.open}) });
  modal.querySelector('#slSend')?.addEventListener('click',()=>openForm(sendable));
}
$('#slBtn').onclick=openShortlist;

/* ===================== Заявка ===================== */
function requestText(nums,name,contact,note){
  const lines=nums.map(n=>FLAT[n]).map(q=>`• ${q.num}: ${q.type}, ${sqm(q.area)}, ${bName(q.b)}, ${t('fl',q.floor)}, ${q.status==='sold'?t('soldWord'):eur(q.price)} (${ST(q.status).toLowerCase()})\n  ${linkOf(q.num)}`);
  return `${t('reqHead')}\n${t('reqName')}: ${name||t('reqNoName')}\n${t('reqContact')}: ${contact}\n${t('reqLang')}: ${LANG.toUpperCase()}\n${t('reqAsks')}:\n${lines.join('\n')}${note?`\n${t('reqComment')}: `+note:''}`;
}
function openForm(nums){
  nums=nums.filter(n=>FLAT[n]);
  openModal(`<form class="dialog" id="reqForm" novalidate role="dialog" aria-modal="true" aria-label="${t('reqTitle')}"><button type="button" class="x" aria-label="${t('close')}">×</button>
    <h2>${t('reqTitle')}</h2>
    <div class="stack">${nums.map(n=>{ const q=FLAT[n]; return `<div class="sitem"><span><b>${q.num}</b> · ${q.type}, ${sqm(q.area)} · ${eur(q.price)}</span><span class="pill ${q.status}">${ST(q.status)}</span></div>` }).join('')}</div>
    <label class="field">${t('name')}<input id="rqName" autocomplete="name"></label>
    <label class="field">${t('contact')}<input id="rqPhone" autocomplete="tel" placeholder="+90 5xx xxx xx xx" required></label>
    <label class="field">${t('comment')}<textarea id="rqNote" placeholder="${t('commentPh')}"></textarea></label>
    <p class="err" id="rqErr" hidden>${t('contactErr')}</p>
    <p class="note">${t('notBooking')}</p>
    <button class="btn primary block" type="submit">${t('send')}</button></form>`);
  modal.querySelector('#reqForm').onsubmit=e=>{ e.preventDefault();
    const c=$('#rqPhone').value.trim(), ok=c.replace(/\D/g,'').length>=7 || /\S+@\S+\.\S+/.test(c);
    if(!ok){ $('#rqErr').hidden=false; $('#rqPhone').focus(); return }
    const text=requestText(nums,$('#rqName').value.trim(),c,$('#rqNote').value.trim());
    openInfo(t('notSent'), `<div class="demo-warn">${t('demoWarn')}</div>
      <p class="note">${t('wouldGet')}</p><div class="msg">${esc(text)}</div><button class="btn primary" id="okDone">${t('ok')}</button>`);
    $('#okDone').onclick=closeModal;
  };
}

/* ===================== Режим «Продажи» ===================== */
function kpis(){
  const all=ALL(), c=st=>all.filter(q=>q.status===st), pct=v=>Math.round(v/all.length*100)+'%';
  const items=[[t('kBuildings'),BUILDINGS.length,''],[t('kFlats'),all.length,''],[t('kSold'),c('sold').length,pct(c('sold').length)],
    [t('kBooked'),c('booked').length,pct(c('booked').length)],[t('kFree'),c('free').length,t('from_')+' '+eur(minOf(c('free')))],
    [t('kSoldFor'),meur(sum(c('sold'))),''],[t('kRemain'),meur(sum(c('free'))),'']];
  $('#kpis').innerHTML=items.map(([l,v,s])=>`<div class="kpi"><span>${l}</span><b>${v}</b>${s?`<small>${s}</small>`:''}</div>`).join('');
}
function setMode(m){ MODE=m; document.querySelectorAll('#fMode button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.v===m)); if(!CUR.page) renderPicker(CUR,false); else renderTop() }
document.querySelectorAll('#fMode button').forEach(b=>b.onclick=()=>setMode(b.dataset.v));

/* ===================== Разметка этажей (для сотрудника, режим «Продажи») ===================== */
const mkBar=$('#mkBar'); let MK=null;
function svgPt(e){ const pt=svgEl.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY; const r=pt.matrixTransform(svgEl.getScreenCTM().inverse()); return [Math.round(r.x),Math.round(r.y)] }
function mkDraw(){ let g=svgEl.querySelector('#mk'); if(!g){ g=document.createElementNS('http://www.w3.org/2000/svg','g'); g.id='mk'; g.setAttribute('pointer-events','none'); svgEl.appendChild(g) }
  const k=svgEl.viewBox.baseVal.height/700, col={p:'#fff',t:'#3fd0ff',bt:'#ff5ad1'}; let h='';
  ['p','t','bt'].forEach(key=>{ const a=MK[key]; if(!a.length) return; const closed=key==='p'&&MK.step!=='p';
    h+=`<polyline points="${pts(closed?a.concat([a[0]]):a)}" fill="none" stroke="${col[key]}" stroke-width="2.5" vector-effect="non-scaling-stroke"/>`;
    a.forEach(q=>h+=`<circle cx="${q[0]}" cy="${q[1]}" r="${4*k}" fill="${col[key]}" stroke="#000" vector-effect="non-scaling-stroke"/>`) });
  if(MK.t.length>=2&&MK.bt.length===MK.t.length) for(let i=1;i<MK.f;i++) h+=`<polyline points="${pts(MK.t.map((q,j)=>[q[0]+(MK.bt[j][0]-q[0])*i/MK.f,q[1]+(MK.bt[j][1]-q[1])*i/MK.f]))}" fill="none" stroke="#ffc070" stroke-dasharray="4 3" vector-effect="non-scaling-stroke"/>`;
  g.innerHTML=h }
function mkUI(){ const st=MK.step, [ti,x]=t('mk')[st], need=st==='bt'?t('mkNeed',MK.t.length,MK.bt.length):'';
  mkBar.innerHTML=`<b>${ti}</b><p>${x}${need}</p><label>${t('mkFloors')} <select id="mkF">${[...Array(14)].map((_,i)=>i+2).map(n=>`<option ${n===MK.f?'selected':''}>${n}</option>`).join('')}</select></label>
    <div class="acts">${st!=='done'?`<button class="btn" id="mkUndo">${t('mkUndo')}</button>`:''}${st==='p'?`<button class="btn" id="mkSkip">${t('mkKeep')}</button>`:''}${st==='p'||st==='t'?`<button class="btn primary" id="mkNext">${t('mkNext')}</button>`:''}${st==='done'?`<button class="btn" id="mkRedo">${t('mkRedo')}</button><button class="btn primary" id="mkSave">${t('mkSave')}</button>`:''}<button class="btn" id="mkCancel">${t('cancel')}</button></div>`;
  mkBar.hidden=false; const on=(id,fn)=>{ const el=document.getElementById(id); el&&(el.onclick=fn) };
  $('#mkF').onchange=e=>{ MK.f=+e.target.value; mkDraw() };
  on('mkUndo',()=>{ const a=MK[st]; if(a.length) a.pop(); else if(st==='bt') MK.step='t'; else if(st==='t') MK.step='p'; mkDraw(); mkUI() });
  on('mkSkip',()=>{ MK.p=MK.b.g.p.map(q=>q.slice()); MK.step='t'; mkDraw(); mkUI() });
  on('mkNext',()=>{ if(st==='p'){ if(MK.p.length<3) return; MK.step='t' } else { if(MK.t.length<2) return; MK.step='bt' } mkDraw(); mkUI() });
  on('mkRedo',()=>{ MK.t=[]; MK.bt=[]; MK.step='t'; mkDraw(); mkUI() });
  on('mkCancel',mkStop); on('mkSave',mkSave) }
function mkStart(){ if(CUR.level!=='facade') return; hideTip(); MK={b:BY[CUR.b],step:'p',p:[],t:[],bt:[],f:BY[CUR.b].floors};
  svgEl.classList.add('marking'); svgEl.querySelector('#bands').style.opacity=.15; svgEl.querySelector('#lbls').style.opacity=.3;
  svgEl.addEventListener('click',mkClick); mkDraw(); mkUI() }
function mkClick(e){ if(!MK) return; e.stopPropagation(); const q=svgPt(e);
  if(MK.step==='p') MK.p.push(q); else if(MK.step==='t') MK.t.push(q); else if(MK.step==='bt'){ MK.bt.push(q); if(MK.bt.length===MK.t.length) MK.step='done' }
  mkDraw(); mkUI() }
function mkStop(){ MK=null; mkBar.hidden=true; mountedSig=''; if(!CUR.page) mountScene(null,false) }
function mkSave(){ const b=MK.b, g={f:MK.f,p:MK.p.length>=3?MK.p:b.g.p,t:MK.t,b:MK.bt};
  SAVED[b.id]=g; try{ localStorage.setItem('floorMarkup',JSON.stringify(SAVED)) }catch(e){}
  setGeo(b,g); MK=null; mkBar.hidden=true; mountedSig=''; renderPicker(CUR,false) }
function mkExport(){ const box=$('#mkExport'), n=Object.keys(SAVED).length;
  if(!n||MODE!=='sales'){ box.hidden=true; return } box.hidden=false;
  box.innerHTML=`<b>${t('mkTitle',Object.keys(SAVED).join(', '))}</b><span>${t('mkSaved')}</span>
    <textarea readonly id="mkText">${esc(JSON.stringify(SAVED))}</textarea><div class="ctx"><button class="btn primary" id="mkCopy">${t('copy')}</button><button class="btn" id="mkReset">${t('mkReset')}</button></div>`;
  $('#mkCopy').onclick=async()=>{ try{ await navigator.clipboard.writeText($('#mkText').value); toast(t('copied')) }catch(e){ $('#mkText').select() } };
  $('#mkReset').onclick=()=>{ SAVED={}; try{ localStorage.removeItem('floorMarkup') }catch(e){} location.reload() } }

/* ===================== Показ возможностей ===================== */
function hoverZone(sel){ const el=svgEl&&svgEl.querySelector(sel); if(!el) return; hov(el,true); showTip(el.dataset.z==='band'?'f'+el.dataset.key:el.dataset.key, el) }
const TB='L', TF=(BY.L.flats.find(x=>x.n===9&&x.status==='free')||{floor:1}).floor;
const TQ=()=>BY.L.flats.find(x=>x.floor===TF&&x.n===9&&x.status==='free')||BY.L.flats.find(x=>x.floor===TF&&x.status==='free');
const TOUR_ALL=[
  async()=>{ closeModal(); setMode('buyer'); F.type='all';F.min=null;F.max=null; go({},{force:true}); scrollTo(0,0) },
  async()=>{ await wait(200); hoverZone(`.bld[data-key="${TB}"]`) },
  async()=>{ hideTip(); go({b:TB}) },
  async()=>{ go({b:TB,level:'facade'}); await wait(750) },
  async()=>{ go({b:TB,f:TF,level:'floor'}); await wait(350) },
  async()=>{ go({b:TB,f:TF,level:'floor',sel:TQ().num},{replace:true}) },
  async()=>{ go({page:TQ().num}) },
  async()=>{ const q=TQ(); if(!slHas(q.num)) slToggle(q.num); await wait(300); openForm([q.num]) },
  async()=>{ closeModal(); MODE='sales'; go({},{force:true}); setMode('sales'); scrollTo(0,0) },
];
let tourI=-1;
const TOUR=[...TOUR_ALL];
async function tourGo(i){ tourI=i; if(i>=TOUR.length) return tourEnd();
  $('#tour').hidden=false; $('#tourStep').textContent=t('tourStep',i+1,TOUR.length); $('#tourText').textContent=t('tour')[i];
  $('#tourNext').textContent=i===TOUR.length-1?t('done'):t('next'); $('#tourNext').disabled=true;
  try{ await TOUR[i]() } finally { $('#tourNext').disabled=false; $('#tourNext').focus({preventScroll:true}) } }
function tourEnd(){ tourI=-1; $('#tour').hidden=true; hideTip() }
if(!AP.admin) TOUR.pop();
fetch('/api/picker/me',{credentials:'same-origin',cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{ if(!j||!j.admin) return;
  AP.admin=true; $('#fMode').hidden=false; if(TOUR.length<TOUR_ALL.length) TOUR.push(TOUR_ALL[TOUR_ALL.length-1]) }).catch(()=>{});
$('#tourBtn').onclick=()=>tourGo(0); $('#tourNext').onclick=()=>tourGo(tourI+1); $('#tourStop').onclick=tourEnd;

/* ===================== Клавиатура и запуск ===================== */
document.addEventListener('keydown',e=>{ if(e.key!=='Escape') return;
  if(!modal.hidden) return closeModal();
  if($('#fbar').classList.contains('open')) return sheet(false);
  const fs=document.querySelector('.fs'); if(fs){ fsToggle(fs,false); if(fs.id==='gal'&&CUR.page) renderGal(FLAT[CUR.page]); return }
  if(MK) return mkStop();
  if(!$('#tour').hidden) return tourEnd(); });
{ const {st,flt}=parse(location.hash); Object.assign(F,flt); applyStatic(); APPLIED=''; CUR={level:'complex',b:null,f:null,sel:null,page:null}; apply(st,{}); BOOTED=true; try{ history.replaceState(null,'',hashOf(st)) }catch(e){} }

})();
