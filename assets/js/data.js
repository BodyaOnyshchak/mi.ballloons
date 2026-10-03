/*
 * MI ballloons — дані сайту.
 *
 * Це єдиний файл, який треба редагувати, щоб змінити контакти, ціни,
 * кольори кульок, товари каталогу та шаблони конструктора.
 * Усе, що позначено «ЗАМІНИТИ», — тимчасові дані для чернетки.
 */
window.MB = window.MB || {};

MB.config = {
  brand: 'MI ballloons',
  formerName: 'Cool’ka_kiev',
  tagline: 'Кульки • Фотозони • Декор',
  instagram: 'mi.ballloons',
  instagramUrl: 'https://www.instagram.com/mi.ballloons/',
  directUrl: 'https://ig.me/m/mi.ballloons',
  phone: '+38 (0XX) XXX XX XX', // ЗАМІНИТИ: реальний номер
  phoneHref: 'tel:+380000000000', // ЗАМІНИТИ
  telegramUrl: '#', // ЗАМІНИТИ: посилання на Telegram
  viberUrl: '#', // ЗАМІНИТИ: посилання на Viber
  city: 'Київ',
  storeArea: 'Позняки',
  storeAddress: 'Київ, Позняки', // ЗАМІНИТИ: точна адреса магазину
  hours: '7:00–23:30',
  deliveryArea: 'Київ та передмістя',
  payment: 'Оплата на рахунок ФОП',
  deliveryFrom: 200, // ЗАМІНИТИ: мінімальна вартість доставки, ₴
  freeDeliveryFrom: 3000, // ЗАМІНИТИ: безкоштовна доставка від суми, ₴ (0 — вимкнути)
  currency: '₴',
};

/*
 * Кольори кульок.
 * finish: pastel — пастель/макарун, bright — насичені, pearl — перламутр,
 * chrome — хром, clear — прозорі, confetti — колір конфеті, foil — фольга.
 */
MB.palette = [
  // Пастель
  { id: 'white', name: 'Білий', hex: '#FBF8F7', finish: 'pastel' },
  { id: 'ivory', name: 'Айворі', hex: '#F2E8D8', finish: 'pastel' },
  { id: 'blush', name: 'Пудра', hex: '#F1BFCC', finish: 'pastel' },
  { id: 'baby-pink', name: 'Ніжно-рожевий', hex: '#F7D2DD', finish: 'pastel' },
  { id: 'peach', name: 'Персик', hex: '#F5C7AE', finish: 'pastel' },
  { id: 'nude', name: 'Нюд', hex: '#E2C3AE', finish: 'pastel' },
  { id: 'caramel', name: 'Карамель', hex: '#C99A74', finish: 'pastel' },
  { id: 'butter', name: 'Ванільний', hex: '#F4E1A1', finish: 'pastel' },
  { id: 'mint', name: 'Мʼятний', hex: '#BDE2D1', finish: 'pastel' },
  { id: 'sage', name: 'Шавлія', hex: '#B7C4A6', finish: 'pastel' },
  { id: 'baby-blue', name: 'Блакитний', hex: '#BAD5EC', finish: 'pastel' },
  { id: 'lavender', name: 'Лаванда', hex: '#D5C9EA', finish: 'pastel' },
  { id: 'fog', name: 'Сірий туман', hex: '#C9C6CC', finish: 'pastel' },
  // Насичені
  { id: 'red', name: 'Червоний', hex: '#C9243B', finish: 'bright' },
  { id: 'burgundy', name: 'Бордо', hex: '#74203A', finish: 'bright' },
  { id: 'fuchsia', name: 'Фуксія', hex: '#D7447D', finish: 'bright' },
  { id: 'navy', name: 'Синій', hex: '#273862', finish: 'bright' },
  { id: 'emerald', name: 'Смарагд', hex: '#1F6A56', finish: 'bright' },
  { id: 'black', name: 'Чорний', hex: '#252227', finish: 'bright' },
  // Перламутр
  { id: 'pearl-white', name: 'Перлина', hex: '#F3EEEA', finish: 'pearl' },
  { id: 'pearl-pink', name: 'Перлинно-рожевий', hex: '#EEC3CC', finish: 'pearl' },
  { id: 'pearl-champagne', name: 'Перлинна шампань', hex: '#E8D4BA', finish: 'pearl' },
  // Хром
  { id: 'chrome-gold', name: 'Хром золото', hex: '#C9A159', finish: 'chrome' },
  { id: 'chrome-silver', name: 'Хром срібло', hex: '#B5BCC6', finish: 'chrome' },
  { id: 'chrome-rose', name: 'Хром рожеве золото', hex: '#D9A08D', finish: 'chrome' },
  { id: 'chrome-champagne', name: 'Хром шампань', hex: '#D6BD96', finish: 'chrome' },
  { id: 'chrome-pink', name: 'Хром рожевий', hex: '#E38FAE', finish: 'chrome' },
  // Прозорі
  { id: 'clear', name: 'Прозорий', hex: '#FFFFFF', finish: 'clear' },
  // Конфеті (колір конфеті всередині прозорої кульки)
  { id: 'confetti-gold', name: 'Золоте конфеті', hex: '#D2AE62', finish: 'confetti' },
  { id: 'confetti-silver', name: 'Срібне конфеті', hex: '#C3C9D2', finish: 'confetti' },
  { id: 'confetti-pink', name: 'Рожеве конфеті', hex: '#EE9AB7', finish: 'confetti' },
  { id: 'confetti-blue', name: 'Блакитне конфеті', hex: '#93BDE4', finish: 'confetti' },
  { id: 'confetti-rainbow', name: 'Райдужне конфеті', hex: '#E9A3C1', finish: 'confetti', multi: ['#EE9AB7', '#F4D77A', '#93BDE4', '#A9DCC4', '#C9B2E8'] },
  // Фольга
  { id: 'foil-gold', name: 'Золото', hex: '#D3AE62', finish: 'foil' },
  { id: 'foil-silver', name: 'Срібло', hex: '#C1C7CF', finish: 'foil' },
  { id: 'foil-rose', name: 'Рожеве золото', hex: '#E0A894', finish: 'foil' },
  { id: 'foil-champagne', name: 'Шампань', hex: '#E3CBA6', finish: 'foil' },
  { id: 'foil-ivory', name: 'Кремовий', hex: '#F1E7D9', finish: 'foil' },
  { id: 'foil-pink', name: 'Рожевий', hex: '#F1A8BF', finish: 'foil' },
  { id: 'foil-blue', name: 'Блакитний', hex: '#A9CAE9', finish: 'foil' },
  { id: 'foil-red', name: 'Червоний', hex: '#D2303F', finish: 'foil' },
  { id: 'foil-black', name: 'Чорний', hex: '#2B292D', finish: 'foil' },
];

/* Групи кольорів для вибору в конструкторі */
MB.colorGroups = [
  { id: 'pastel', name: 'Пастель' },
  { id: 'bright', name: 'Насичені' },
  { id: 'pearl', name: 'Перламутр' },
  { id: 'chrome', name: 'Хром' },
  { id: 'clear', name: 'Прозорі' },
  { id: 'confetti', name: 'Конфеті' },
  { id: 'foil', name: 'Фольга' },
];

/*
 * Види кульок. price — ціна за штуку (₴), priceBy — доплата за покриття.
 * finishes — які групи кольорів доступні для цього виду.
 */
MB.types = {
  latex12: { name: 'Латексна', size: '30 см', price: 75, priceBy: { pearl: 90, chrome: 95, clear: 70 }, finishes: ['pastel', 'bright', 'pearl', 'chrome', 'clear'], hifloat: true, text: true, defaultColor: 'blush' },
  latex18: { name: 'Латексна', size: '45 см', price: 190, priceBy: { pearl: 210, chrome: 240, clear: 180 }, finishes: ['pastel', 'bright', 'pearl', 'chrome', 'clear'], hifloat: true, text: true, defaultColor: 'baby-pink' },
  latex36: { name: 'Велика кулька', size: '90 см', price: 650, priceBy: { pearl: 690 }, finishes: ['pastel', 'bright', 'pearl', 'clear'], hifloat: true, text: true, defaultColor: 'black' },
  confetti: { name: 'Прозора з конфеті', size: '30 см', price: 110, finishes: ['confetti'], hifloat: true, text: false, defaultColor: 'confetti-gold' },
  bubble: { name: 'Бабл', size: '60 см', price: 350, finishes: ['clear'], text: true, inner: true, defaultColor: 'clear' },
  heart: { name: 'Серце фольговане', size: '45 см', price: 160, finishes: ['foil'], text: true, defaultColor: 'foil-rose' },
  star: { name: 'Зірка фольгована', size: '45 см', price: 160, finishes: ['foil'], text: false, defaultColor: 'foil-gold' },
  orb: { name: 'Кругла фольгована', size: '45 см', price: 170, finishes: ['foil'], text: true, defaultColor: 'foil-champagne' },
  number: { name: 'Цифра', size: '100 см', price: 450, finishes: ['foil'], glyph: 'digit', defaultColor: 'foil-champagne' },
  letter: { name: 'Літера', size: '100 см', price: 420, finishes: ['foil'], glyph: 'letter', defaultColor: 'foil-rose' },
};

/* Порядок плиток «Додати кульку» в конструкторі */
MB.typeOrder = ['latex12', 'latex18', 'latex36', 'confetti', 'bubble', 'heart', 'star', 'orb', 'number', 'letter'];

/* Доплати та декор */
MB.extras = {
  inscription: 100, // напис на кульці
  bubbleInner: 150, // міні-кульки всередині бабла
  hifloat: 15, // обробка Hi-Float за кожну латексну кульку
  box: 650, // коробка-сюрприз
  boxText: 150, // напис на коробці
  weightCube: 60, // грузик-кубик з бантом
};

MB.ribbons = [
  { id: 'white', name: 'Білі', hex: '#DCCFD3' },
  { id: 'pink', name: 'Рожеві', hex: '#EBA7BB' },
  { id: 'gold', name: 'Золоті', hex: '#CDAA68' },
  { id: 'silver', name: 'Срібні', hex: '#BFC4CC' },
  { id: 'black', name: 'Чорні', hex: '#2E2A2F' },
];

MB.boxColors = [
  { id: 'white', name: 'Біла', hex: '#FBF8F6' },
  { id: 'pink', name: 'Пудрова', hex: '#F3C9D4' },
  { id: 'kraft', name: 'Крафт', hex: '#CFAE88' },
  { id: 'black', name: 'Чорна', hex: '#2A2629' },
];

/* Шрифти написів на кульках */
MB.fonts = [
  { id: 'script', name: 'Каліграфія' },
  { id: 'hand', name: 'Рукописний' },
  { id: 'classic', name: 'Класика' },
  { id: 'modern', name: 'Модерн' },
];

MB.textColors = [
  { id: 'white', name: 'Білий' },
  { id: 'ink', name: 'Чорний' },
  { id: 'gold', name: 'Золото' },
  { id: 'silver', name: 'Срібло' },
  { id: 'rose', name: 'Рожеве золото' },
  { id: 'pink', name: 'Рожевий' },
];

MB.categories = [
  { id: 'bouquets', name: 'Букети', note: 'Гелієві кульки на грузику' },
  { id: 'bubbles', name: 'Бабли з написом', note: 'Прозорі кулі з вашим текстом' },
  { id: 'numbers', name: 'Цифри', note: 'Фольговані цифри 100 см' },
  { id: 'boxes', name: 'Коробки-сюрпризи', note: 'Кульки вилітають з коробки' },
  { id: 'ceiling', name: 'Під стелю', note: 'Кульки на довгих стрічках' },
  { id: 'photozones', name: 'Фотозони', note: 'Декор свята під ключ' },
];

MB.occasions = [
  { id: 'birthday', name: 'День народження' },
  { id: 'kids', name: 'Дитяче свято' },
  { id: 'vypyska', name: 'Виписка' },
  { id: 'gender', name: 'Gender party' },
  { id: 'love', name: 'Love day' },
  { id: 'for-her', name: 'Для неї' },
  { id: 'for-him', name: 'Для нього' },
  { id: 'corporate', name: 'Корпоратив' },
];

/*
 * Товари каталогу.
 * art — опис композиції для ілюстрації (ті самі кульки, що й у конструкторі).
 *   n — кількість однакових кульок; text — напис; char — цифра чи літера.
 * image — шлях до реального фото (якщо вказати, замінить ілюстрацію).
 * options — що покупець може змінити на сторінці товару.
 * ЗАМІНИТИ: ціни та склад — орієнтовні, для чернетки.
 */
MB.products = [
  {
    id: 'nizhnist',
    name: 'Ніжність',
    cat: 'bouquets',
    occasions: ['birthday', 'for-her'],
    price: 1190,
    badge: 'Хіт',
    tint: '#FBE4EB',
    short: '9 кульок і серце на грузику',
    desc: 'Пудрові та перлинні кульки з акцентом хром рожевого золота. Найчастіше беруть як подарунок без приводу — і на день народження.',
    art: {
      format: 'bouquet', ribbon: 'pink', weight: 'heart',
      items: [
        { type: 'latex18', color: 'baby-pink' },
        { type: 'latex12', color: 'blush', n: 3 },
        { type: 'latex12', color: 'pearl-white', n: 2 },
        { type: 'latex12', color: 'chrome-rose', n: 2 },
        { type: 'heart', color: 'foil-rose' },
      ],
    },
  },
  {
    id: 'shampan',
    name: 'Шампань',
    cat: 'bubbles',
    occasions: ['birthday', 'for-her', 'corporate'],
    price: 1690,
    badge: 'Хіт',
    tint: '#F6ECE0',
    short: 'Бабл з написом і 8 кульок у кольорі шампань',
    desc: 'Прозорий бабл 60 см з вашим написом у компанії нюдових, перлинних та хромованих кульок. Стримано, дорого, пасує до будь-якого інтерʼєру.',
    art: {
      format: 'bouquet', ribbon: 'gold', weight: 'heart', weightColor: 'foil-champagne',
      items: [
        { type: 'bubble', color: 'clear', text: { value: 'Happy\nBirthday', font: 'script', color: 'gold' } },
        { type: 'latex12', color: 'nude', n: 3 },
        { type: 'latex12', color: 'pearl-champagne', n: 2 },
        { type: 'latex12', color: 'chrome-champagne', n: 2 },
        { type: 'confetti', color: 'confetti-gold' },
      ],
    },
    options: [{ key: 'text', kind: 'text', label: 'Напис на баблі', item: 0, max: 40 }],
  },
  {
    id: 'one',
    name: 'One',
    cat: 'bubbles',
    occasions: ['kids', 'birthday'],
    price: 1450,
    tint: '#F5EEE6',
    short: 'Бабл «One» і кульки айворі для першого дня народження',
    desc: 'Світла композиція на перший рік: бабл з написом, айворі, нюд та прозорі кульки з конфеті. Напис можна замінити на імʼя малюка.',
    art: {
      format: 'bouquet', ribbon: 'white', weight: 'heart', weightColor: 'foil-ivory',
      items: [
        { type: 'bubble', color: 'clear', text: { value: 'One', font: 'script', color: 'ink' } },
        { type: 'latex18', color: 'ivory' },
        { type: 'latex12', color: 'ivory', n: 2 },
        { type: 'latex12', color: 'nude', n: 2 },
        { type: 'latex12', color: 'white', n: 2 },
        { type: 'confetti', color: 'confetti-silver' },
      ],
    },
    options: [{ key: 'text', kind: 'text', label: 'Напис на баблі', item: 0, max: 30 }],
  },
  {
    id: 'tsyfra-shampan',
    name: 'Цифра в шампані',
    cat: 'numbers',
    occasions: ['birthday', 'kids'],
    price: 990,
    tint: '#F7EEE3',
    short: 'Фольгована цифра 100 см і 5 кульок',
    desc: 'Велика цифра кольору шампань з невеликим букетом кульок. Оберіть потрібну цифру — превʼю оновиться.',
    art: {
      format: 'bouquet', ribbon: 'gold', weight: 'heart', weightColor: 'foil-champagne',
      items: [
        { type: 'number', color: 'foil-champagne', char: '2' },
        { type: 'latex12', color: 'nude', n: 2 },
        { type: 'latex12', color: 'chrome-champagne', n: 2 },
        { type: 'latex12', color: 'white' },
      ],
    },
    options: [{ key: 'digits', kind: 'digits', label: 'Цифра', items: [0] }],
  },
  {
    id: 'trydtsyat',
    name: 'Тридцять у сріблі',
    cat: 'numbers',
    occasions: ['birthday', 'for-him', 'for-her'],
    price: 1790,
    tint: '#EEF0F3',
    short: 'Дві цифри і кульки зі срібним конфеті',
    desc: 'Сріблясті цифри, прозорі кульки з конфеті та хром. Святково й без зайвих кольорів.',
    art: {
      format: 'bouquet', ribbon: 'silver', weight: 'heart', weightColor: 'foil-silver',
      items: [
        { type: 'number', color: 'foil-silver', char: '3' },
        { type: 'number', color: 'foil-silver', char: '0' },
        { type: 'confetti', color: 'confetti-silver', n: 4 },
        { type: 'latex12', color: 'chrome-silver', n: 2 },
        { type: 'latex12', color: 'white', n: 2 },
      ],
    },
    options: [{ key: 'digits', kind: 'digits', label: 'Цифри', items: [0, 1] }],
  },
  {
    id: 'super-hero',
    name: 'Super Hero',
    cat: 'bouquets',
    occasions: ['for-him', 'birthday'],
    price: 1590,
    badge: 'Новинка',
    tint: '#EFE9EC',
    short: 'Чорно-червоний букет з написами',
    desc: 'Для того, хто завжди рятує: чорні та червоні серця, кругла куля з написом SUPER HERO і серце «Ти мій герой».',
    art: {
      format: 'bouquet', ribbon: 'black', weight: 'cube',
      items: [
        { type: 'orb', color: 'foil-black', text: { value: 'SUPER\nHERO', font: 'modern', color: 'white' } },
        { type: 'heart', color: 'foil-black', text: { value: 'Ти мій\nгерой', font: 'script', color: 'white' } },
        { type: 'heart', color: 'foil-red', n: 2 },
        { type: 'latex12', color: 'black', n: 3 },
        { type: 'latex12', color: 'red' },
      ],
    },
    options: [{ key: 'text', kind: 'text', label: 'Напис на серці', item: 1, max: 30 }],
  },
  {
    id: 'welcome-home',
    name: 'Welcome Home',
    cat: 'bubbles',
    occasions: ['vypyska', 'kids'],
    price: 1890,
    tint: '#EAF1F8',
    short: 'Букет на виписку з баблом і зіркою',
    desc: 'Зустрічаємо малюка вдома: бабл з написом, білі та ніжні кульки, срібна зірка. Оберіть колір — для хлопчика чи дівчинки.',
    art: {
      format: 'bouquet', ribbon: 'white', weight: 'heart', weightColor: 'foil-silver',
      items: [
        { type: 'bubble', color: 'clear', text: { value: 'Welcome\nhome', font: 'script', color: 'ink' }, inner: 'baby-blue' },
        { type: 'latex18', color: 'white' },
        { type: 'latex12', color: 'baby-blue', n: 3 },
        { type: 'latex12', color: 'white', n: 2 },
        { type: 'latex12', color: 'chrome-silver' },
        { type: 'star', color: 'foil-silver' },
      ],
    },
    options: [
      { key: 'variant', kind: 'choice', label: 'Для кого', choices: [
        { value: 'boy', label: 'Для хлопчика', recolor: {} },
        { value: 'girl', label: 'Для дівчинки', recolor: { 'baby-blue': 'baby-pink', 'chrome-silver': 'chrome-rose', 'foil-silver': 'foil-rose' } },
      ] },
      { key: 'text', kind: 'text', label: 'Напис на баблі', item: 0, max: 30 },
    ],
  },
  {
    id: 'gender',
    name: 'Хлопчик чи дівчинка?',
    cat: 'bouquets',
    occasions: ['gender'],
    price: 1150,
    tint: '#F1ECF0',
    short: 'Чорна куля 90 см з конфеті-сюрпризом',
    desc: 'Велика чорна кулька з написом, всередині — рожеве або блакитне конфеті. Колір знаєте тільки ви: вкажіть його при замовленні, ми збережемо секрет.',
    art: {
      format: 'bouquet', ribbon: 'white', weight: 'cube',
      items: [
        { type: 'latex36', color: 'black', text: { value: 'Boy\nor girl?', font: 'script', color: 'gold' } },
        { type: 'latex12', color: 'baby-blue', n: 2 },
        { type: 'latex12', color: 'baby-pink', n: 2 },
      ],
    },
    options: [
      { key: 'secret', kind: 'choice', label: 'Конфеті всередині', note: 'Не відображається на превʼю', choices: [
        { value: 'pink', label: 'Рожеве' },
        { value: 'blue', label: 'Блакитне' },
      ] },
    ],
  },
  {
    id: 'love-day',
    name: 'Love day',
    cat: 'bouquets',
    occasions: ['love', 'for-her'],
    price: 1290,
    tint: '#FBE6E9',
    short: 'Серця, червоні кульки та напис «Кохаю»',
    desc: 'Червоні та рожеві фольговані серця з латексними кульками. На центральному серці — ваше слово.',
    art: {
      format: 'bouquet', ribbon: 'pink', weight: 'heart', weightColor: 'foil-red',
      items: [
        { type: 'heart', color: 'foil-red', text: { value: 'Кохаю', font: 'script', color: 'white' } },
        { type: 'heart', color: 'foil-red', n: 2 },
        { type: 'heart', color: 'foil-pink', n: 2 },
        { type: 'latex12', color: 'red', n: 2 },
        { type: 'latex12', color: 'chrome-rose' },
      ],
    },
    options: [{ key: 'text', kind: 'text', label: 'Напис на серці', item: 0, max: 24 }],
  },
  {
    id: 'box-surprise',
    name: 'Коробка-сюрприз',
    cat: 'boxes',
    occasions: ['birthday', 'for-her', 'kids'],
    price: 2290,
    badge: 'Хіт',
    tint: '#F9E7EC',
    short: 'Коробка з іменем, з якої вилітають кульки',
    desc: 'Отримувач відкриває коробку — і з неї злітає букет. Напис на коробці зробимо з іменем або побажанням.',
    art: {
      format: 'box', ribbon: 'white', box: { color: 'white', text: 'Для Марії' },
      items: [
        { type: 'bubble', color: 'clear', text: { value: 'Happy\nBirthday', font: 'script', color: 'rose' } },
        { type: 'latex12', color: 'blush', n: 3 },
        { type: 'latex12', color: 'pearl-white', n: 2 },
        { type: 'latex12', color: 'chrome-rose', n: 2 },
        { type: 'heart', color: 'foil-pink' },
      ],
    },
    options: [
      { key: 'boxText', kind: 'text', label: 'Напис на коробці', target: 'box', max: 22 },
      { key: 'text', kind: 'text', label: 'Напис на баблі', item: 0, max: 30 },
    ],
  },
  {
    id: 'zolota-klasyka',
    name: 'Золота класика',
    cat: 'bouquets',
    occasions: ['for-him', 'corporate', 'birthday'],
    price: 1290,
    tint: '#F1EBE4',
    short: '11 кульок: чорні, хром золото та конфеті',
    desc: 'Чорний мат, хромоване золото і прозорі кульки із золотим конфеті. Беруть для чоловіків і на корпоративи.',
    art: {
      format: 'bouquet', ribbon: 'gold', weight: 'cube',
      items: [
        { type: 'star', color: 'foil-gold' },
        { type: 'latex12', color: 'black', n: 5 },
        { type: 'latex12', color: 'chrome-gold', n: 4 },
        { type: 'confetti', color: 'confetti-gold', n: 2 },
      ],
    },
  },
  {
    id: 'marmelad',
    name: 'Мармелад',
    cat: 'bouquets',
    occasions: ['kids', 'birthday'],
    price: 1190,
    tint: '#F3EEF8',
    short: '12 пастельних кульок кольорів макарун',
    desc: 'Рожевий, блакитний, ванільний, мʼятний і лавандовий — як улюблені десерти. Для дитячого свята і просто для настрою.',
    art: {
      format: 'bouquet', ribbon: 'white', weight: 'heart', weightColor: 'foil-pink',
      items: [
        { type: 'latex12', color: 'baby-pink', n: 3 },
        { type: 'latex12', color: 'baby-blue', n: 3 },
        { type: 'latex12', color: 'butter', n: 2 },
        { type: 'latex12', color: 'mint', n: 2 },
        { type: 'latex12', color: 'lavender', n: 2 },
      ],
    },
  },
  {
    id: 'khmarynka',
    name: 'Хмаринка',
    cat: 'bouquets',
    occasions: ['for-her', 'vypyska', 'birthday'],
    price: 1490,
    tint: '#F1F3F7',
    short: '15 білих, перлинних і прозорих кульок',
    desc: 'Легка біла хмара з перлинних кульок і прозорих зі срібним конфеті. Виглядає дорого на фото.',
    art: {
      format: 'bouquet', ribbon: 'silver', weight: 'heart', weightColor: 'foil-silver',
      items: [
        { type: 'latex18', color: 'white', n: 2 },
        { type: 'latex12', color: 'white', n: 4 },
        { type: 'latex12', color: 'pearl-white', n: 4 },
        { type: 'confetti', color: 'confetti-silver', n: 3 },
        { type: 'latex12', color: 'clear', n: 2 },
      ],
    },
  },
  {
    id: 'pid-stelyu',
    name: 'Під стелю, 25 кульок',
    cat: 'ceiling',
    occasions: ['birthday', 'for-her', 'kids'],
    price: 1750,
    tint: '#FBEAF0',
    short: 'Гелієві кульки на довгих стрічках',
    desc: '25 кульок, що тримаються під стелею, а стрічки спадають майже до підлоги. Кольори підберемо під ваш інтерʼєр.',
    art: {
      format: 'ceiling', ribbon: 'pink',
      items: [
        { type: 'latex12', color: 'blush', n: 7 },
        { type: 'latex12', color: 'white', n: 6 },
        { type: 'latex12', color: 'pearl-pink', n: 6 },
        { type: 'latex12', color: 'chrome-rose', n: 3 },
        { type: 'confetti', color: 'confetti-pink', n: 3 },
      ],
    },
  },
  {
    id: 'naikrashchii-mami',
    name: 'Найкращій мамі',
    cat: 'bubbles',
    occasions: ['for-her', 'birthday'],
    price: 1590,
    tint: '#FCEAE6',
    short: 'Бабл з написом, серця та персикові кульки',
    desc: 'Теплі персикові та пудрові відтінки, серця рожевого золота і бабл з написом. Текст можна змінити.',
    art: {
      format: 'bouquet', ribbon: 'pink', weight: 'heart', weightColor: 'foil-rose',
      items: [
        { type: 'bubble', color: 'clear', text: { value: 'Найкращій\nмамі', font: 'script', color: 'rose' }, inner: 'peach' },
        { type: 'heart', color: 'foil-rose', n: 2 },
        { type: 'latex12', color: 'peach', n: 3 },
        { type: 'latex12', color: 'blush', n: 2 },
        { type: 'latex12', color: 'pearl-white' },
      ],
    },
    options: [{ key: 'text', kind: 'text', label: 'Напис на баблі', item: 0, max: 30 }],
  },
  {
    id: 'bubble-custom',
    name: 'Бабл з вашим написом',
    cat: 'bubbles',
    occasions: ['birthday', 'love', 'vypyska', 'for-her', 'for-him'],
    price: 490,
    tint: '#F7EEF2',
    short: 'Прозорий бабл 60 см і будь-який текст',
    desc: 'Один бабл — одне головне повідомлення. Оберіть текст, а всередину можемо додати міні-кульки.',
    art: {
      format: 'bouquet', ribbon: 'white', weight: 'heart', weightColor: 'foil-pink',
      items: [
        { type: 'bubble', color: 'clear', text: { value: 'Ти — диво', font: 'script', color: 'ink' }, inner: 'blush' },
      ],
    },
    options: [{ key: 'text', kind: 'text', label: 'Ваш напис', item: 0, max: 40 }],
  },
  {
    id: 'malenkomu-heroyu',
    name: 'Маленькому герою',
    cat: 'bouquets',
    occasions: ['kids', 'birthday'],
    price: 1390,
    tint: '#E9EFF7',
    short: 'Блакитний і синій букет із зірками',
    desc: 'Для хлопчиків: блакитні, сині та хромовані кульки, срібні зірки і бабл з привітанням.',
    art: {
      format: 'bouquet', ribbon: 'silver', weight: 'heart', weightColor: 'foil-blue',
      items: [
        { type: 'bubble', color: 'clear', text: { value: 'Happy\nBirthday', font: 'hand', color: 'ink' } },
        { type: 'star', color: 'foil-silver', n: 2 },
        { type: 'latex12', color: 'baby-blue', n: 3 },
        { type: 'latex12', color: 'navy', n: 2 },
        { type: 'latex12', color: 'chrome-silver' },
      ],
    },
    options: [{ key: 'text', kind: 'text', label: 'Напис на баблі', item: 0, max: 30 }],
  },
  {
    id: 'mini-fotozona',
    name: 'Міні-фотозона',
    cat: 'photozones',
    occasions: ['birthday', 'kids', 'vypyska', 'gender'],
    price: 3900,
    priceFrom: true,
    request: true,
    tint: '#F6EDE9',
    short: 'Кругла стійка, гірлянда і неоновий напис',
    desc: 'Компактна фотозона для дому чи кафе: кругла стійка, органічна гірлянда з кульок і неонова вивіска. Підберемо кольори та підготуємо ескіз.',
    art: {
      format: 'garland', neon: 'Happy Birthday', backdrop: '#FBF6F2',
      colors: [['blush', 4], ['white', 3], ['pearl-champagne', 2], ['chrome-rose', 1], ['clear', 1]],
    },
  },
  {
    id: 'fotozona-pid-klyuch',
    name: 'Фотозона під ключ',
    cat: 'photozones',
    occasions: ['birthday', 'corporate', 'gender', 'kids'],
    price: 9500,
    priceFrom: true,
    request: true,
    tint: '#EDE7E9',
    short: 'Ескіз, доставка, монтаж і демонтаж',
    desc: 'Повне оформлення свята: стійки, гірлянди, кульки на грузиках і тематичний декор. Ціна залежить від розміру — розрахуємо після короткої розмови.',
    art: {
      format: 'garland', neon: 'Celebrate', backdrop: '#2A2126', dark: true,
      colors: [['black', 4], ['chrome-gold', 3], ['chrome-champagne', 2], ['confetti-gold', 1], ['pearl-champagne', 1]],
    },
  },
];

/* Шаблони — швидкий старт у конструкторі */
MB.templates = [
  { id: 'empty', name: 'З нуля', art: { format: 'bouquet', ribbon: 'white', weight: 'heart', items: [] } },
  { id: 'nizhnist', name: 'Ніжність', from: 'nizhnist' },
  { id: 'shampan', name: 'Шампань', from: 'shampan' },
  { id: 'super-hero', name: 'Для нього', from: 'super-hero' },
  { id: 'welcome-home', name: 'Виписка', from: 'welcome-home' },
  { id: 'love-day', name: 'Love day', from: 'love-day' },
  { id: 'box-surprise', name: 'Коробка', from: 'box-surprise' },
  { id: 'tsyfra-shampan', name: 'З цифрою', from: 'tsyfra-shampan' },
];

/* Готові палітри для демо на головній */
MB.heroPalettes = [
  { id: 'pudra', name: 'Пудра', colors: ['blush', 'pearl-white', 'chrome-rose', 'baby-pink'], heart: 'foil-rose', ribbon: 'pink', text: 'rose' },
  { id: 'shampan', name: 'Шампань', colors: ['nude', 'pearl-champagne', 'chrome-champagne', 'ivory'], heart: 'foil-champagne', ribbon: 'gold', text: 'gold' },
  { id: 'blakyt', name: 'Блакить', colors: ['baby-blue', 'white', 'chrome-silver', 'lavender'], heart: 'foil-silver', ribbon: 'silver', text: 'ink' },
  { id: 'vechir', name: 'Вечір', colors: ['black', 'chrome-gold', 'black', 'confetti-gold'], heart: 'foil-gold', ribbon: 'gold', text: 'gold' },
];

MB.faq = [
  {
    q: 'Скільки літають кульки?',
    a: 'Латексні кульки з обробкою Hi-Float тримаються в повітрі в середньому 3–5 днів, фольговані — від тижня. Точний термін залежить від розміру кульки та температури в приміщенні.',
  },
  {
    q: 'Чи можна замовити кульки на сьогодні?',
    a: 'Так, якщо потрібні кольори є в наявності. Оформіть замовлення на сайті або напишіть у Direct — менеджер підтвердить час доставки.',
  },
  {
    q: 'Як змінити напис у готовій композиції?',
    a: 'На сторінці товару введіть свій текст — превʼю оновиться одразу. Щоб змінити кольори чи кількість кульок, відкрийте композицію в конструкторі.',
  },
  {
    q: 'Як оплатити замовлення?',
    a: 'Оплата на рахунок ФОП після підтвердження замовлення. Реквізити надішлемо в зручний для вас месенджер.',
  },
  {
    q: 'Чи можна забрати замовлення самостійно?',
    a: 'Так, з нашого магазину на Позняках. Повідомимо, коли все буде готово.',
  },
];
