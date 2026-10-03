/*
 * MI ballloons — спільна логіка сторінок:
 * шапка, футер, кошик, ціни, картки товарів, сповіщення.
 */
(function (MB) {
  'use strict';

  const C = MB.config;
  const esc = (s) => MB.art.util.esc(s == null ? '' : s);

  /* ---------- дрібні утиліти ---------- */
  const nf = new Intl.NumberFormat('uk-UA');
  MB.money = (n) => nf.format(Math.round(n || 0)) + ' ' + C.currency;
  MB.qs = (name) => new URLSearchParams(location.search).get(name);
  MB.$ = (sel, root) => (root || document).querySelector(sel);
  MB.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  MB.esc = esc;
  MB.plural = (n, one, few, many) => {
    const a = Math.abs(n) % 100;
    const b = a % 10;
    if (a > 10 && a < 20) return many;
    if (b > 1 && b < 5) return few;
    if (b === 1) return one;
    return many;
  };
  MB.store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        /* приватний режим — працюємо без збереження */
      }
    },
  };

  /* Шрифти написів потрібні до вимірювання тексту на кульках */
  MB.fontsReady = (document.fonts && document.fonts.load
    ? Promise.all(
        ['400 40px "Great Vibes"', '400 40px "Bad Script"', 'italic 600 40px "Cormorant Garamond"', '600 40px Unbounded', '800 40px Unbounded'].map((f) =>
          document.fonts.load(f, 'AaZzАаЯяЇїҐґ').catch(() => null)
        )
      )
    : Promise.resolve()
  ).then(() => true);

  /* ---------- іконки ---------- */
  const I = {
    bag: '<path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
    shuffle: '<path d="M4 7h3c4 0 6 10 10 10h3M4 17h3c1.6 0 2.8-1.6 3.9-3.6M14 9.6C15 8 16 7 17 7h3"/><path d="m18 4 3 3-3 3M18 14l3 3-3 3"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    instagram: '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17" cy="7" r=".6" fill="currentColor"/>',
    telegram: '<path d="M20.5 4.5 3.8 11c-.9.4-.9 1.6.1 1.9l4.1 1.3 1.6 5c.3.8 1.3 1 1.9.4l2.3-2.2 4.3 3.1c.7.5 1.6.1 1.8-.7l2.6-13.6c.2-1-.8-1.8-1.9-1.7Z"/><path d="m8 14.2 9.5-6.7"/>',
    phone: '<path d="M6.6 3.5h2.6l1.4 4.2-2 1.3a12 12 0 0 0 6.4 6.4l1.3-2 4.2 1.4v2.6a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
    truck: '<path d="M3 6h11v10H3zM14 9h4l3 3.5V16h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    card: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h4"/>',
    store: '<path d="M4 9.5 5.5 4h13L20 9.5M4 9.5V20h16V9.5M4 9.5c0 1.4 1.3 2.5 2.7 2.5S9.3 11 9.3 9.5c0 1.4 1.3 2.5 2.7 2.5s2.7-1 2.7-2.5c0 1.4 1.3 2.5 2.6 2.5S20 11 20 9.5M9.5 20v-5h5v5"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    back: '<path d="M15 6 9 12l6 6"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8"/>',
    front: '<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M5 15.5V6.5A1.5 1.5 0 0 1 6.5 5h9"/>',
    text: '<path d="M5 7V5h14v2M12 5v14M9 19h6"/>',
    balloon: '<path d="M12 3.5c3.6 0 6 2.8 6 6.3 0 4-3.2 7-6 7.7-2.8-.7-6-3.7-6-7.7 0-3.5 2.4-6.3 6-6.3Z"/><path d="M12 17.5c-.8 1.3.9 1.8 0 3"/>',
    sparkle: '<path d="M12 4c.6 3.6 2.4 5.4 6 6-3.6.6-5.4 2.4-6 6-.6-3.6-2.4-5.4-6-6 3.6-.6 5.4-2.4 6-6Z"/>',
    gift: '<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18M12 9v11M12 9c-1-3-5-4.5-5.6-2.3C6 8.4 9 9 12 9Zm0 0c1-3 5-4.5 5.6-2.3.4 1.7-2.6 2.3-5.6 2.3Z"/>',
  };
  MB.icon = (name, cls) => `<svg class="icon${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${I[name] || ''}</svg>`;

  /* ---------- логотип: «надуті» літери MI + підпис ballloons ---------- */
  let logoN = 0;
  MB.logo = (opts) => {
    opts = opts || {};
    const id = 'lg' + ++logoN;
    const M = 'M13 47V14l19 23 19-23v33';
    const Iv = 'M69 14v33';
    const P = (d, a) => `<path d="${d}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${a}/>`;
    const both = (a) => P(M, a) + P(Iv, a);
    const script = opts.mark ? '' : `<text x="1" y="59" font-family="'Bad Script', cursive" font-size="21" fill="currentColor" transform="rotate(-4 1 59)">ballloons</text>`;
    return `<svg class="logo-svg" viewBox="0 0 ${opts.mark ? 84 : 96} ${opts.mark ? 60 : 66}" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="${id}g" x1="0" y1="8" x2="0" y2="54" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FDE6ED"/><stop offset=".5" stop-color="#F6C3D2"/><stop offset="1" stop-color="#EEA7BC"/></linearGradient>
        <mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="0" width="90" height="60">${both('stroke="#fff" stroke-width="13"')}</mask>
      </defs>
      ${both('stroke="#E9A0B6" stroke-width="14.6"')}
      ${both(`stroke="url(#${id}g)" stroke-width="13"`)}
      <g mask="url(#${id}m)">${both('stroke="#fff" stroke-opacity=".8" stroke-width="3" transform="translate(-2.4 -2.2)"')}${both('stroke="#B85A7B" stroke-opacity=".13" stroke-width="5" transform="translate(3 3)"')}</g>
      ${script}
    </svg>`;
  };

  /* ---------- ціни ---------- */
  const T = MB.types;
  const X = MB.extras;
  function unitPrice(it) {
    const t = T[it.type] || T.latex12;
    const c = MB.art.color(it.color, it.type);
    return (t.priceBy && t.priceBy[c.finish]) || t.price;
  }
  /* Розбивка ціни композиції: рядки й сума */
  MB.calc = function (spec) {
    const items = MB.art.normalize(spec, 'c');
    const groups = new Map();
    let texts = 0;
    let inner = 0;
    let latex = 0;
    items.forEach((it) => {
      const t = T[it.type] || T.latex12;
      const c = MB.art.color(it.color, it.type);
      const label = t.glyph ? `${t.name} ${t.size} «${it.char ?? ''}», ${c.name.toLowerCase()}` : `${t.name} ${t.size}, ${c.name.toLowerCase()}`;
      const key = label;
      const g = groups.get(key) || { label, qty: 0, unit: unitPrice(it) };
      g.qty += 1;
      groups.set(key, g);
      if (it.text && String(it.text.value || '').trim()) texts += 1;
      if (it.type === 'bubble' && it.inner) inner += 1;
      if (t.hifloat) latex += 1;
    });
    const lines = Array.from(groups.values()).map((g) => ({ label: g.label, qty: g.qty, unit: g.unit, sum: g.qty * g.unit }));
    if (texts) lines.push({ label: 'Напис на кульці', qty: texts, unit: X.inscription, sum: texts * X.inscription });
    if (inner) lines.push({ label: 'Міні-кульки всередині бабла', qty: inner, unit: X.bubbleInner, sum: inner * X.bubbleInner });
    if (spec.hifloat !== false && latex) lines.push({ label: 'Обробка Hi-Float', qty: latex, unit: X.hifloat, sum: latex * X.hifloat });
    if (spec.format === 'box') {
      lines.push({ label: 'Коробка-сюрприз', qty: 1, unit: X.box, sum: X.box });
      if (spec.box && String(spec.box.text || '').trim()) lines.push({ label: 'Напис на коробці', qty: 1, unit: X.boxText, sum: X.boxText });
    } else if (spec.weight === 'cube' && items.length) {
      lines.push({ label: 'Грузик-кубик з бантом', qty: 1, unit: X.weightCube, sum: X.weightCube });
    }
    return { lines, total: lines.reduce((s, l) => s + l.sum, 0), count: items.length, texts };
  };

  /* ---------- товари ---------- */
  MB.product = (id) => MB.products.find((p) => p.id === id);
  MB.cat = (id) => MB.categories.find((c) => c.id === id);
  MB.occasion = (id) => MB.occasions.find((o) => o.id === id);

  /* Застосовує вибрані опції товару до його композиції */
  MB.productSpec = function (p, opts) {
    opts = opts || {};
    const spec = JSON.parse(JSON.stringify(p.art));
    spec.seed = p.id;
    (p.options || []).forEach((o) => {
      const v = opts[o.key];
      if (v == null || v === '') return;
      if (o.kind === 'text') {
        if (o.target === 'box') spec.box = Object.assign({}, spec.box, { text: v });
        else if (spec.items[o.item]) spec.items[o.item].text = Object.assign({}, spec.items[o.item].text, { value: v });
      }
      if (o.kind === 'digits') {
        const chars = String(v).replace(/\D/g, '').split('');
        o.items.forEach((idx, k) => {
          if (spec.items[idx] && chars[k] != null) spec.items[idx].char = chars[k];
        });
      }
      if (o.kind === 'choice') {
        const ch = (o.choices || []).find((c) => c.value === v);
        if (ch && ch.recolor) {
          const map = ch.recolor;
          spec.items.forEach((it) => {
            if (map[it.color]) it.color = map[it.color];
            if (it.inner && map[it.inner]) it.inner = map[it.inner];
          });
          if (spec.weightColor && map[spec.weightColor]) spec.weightColor = map[spec.weightColor];
        }
      }
    });
    return spec;
  };
  MB.productDefaults = function (p) {
    const o = {};
    (p.options || []).forEach((opt) => {
      if (opt.kind === 'text') {
        o[opt.key] = opt.target === 'box' ? (p.art.box || {}).text || '' : ((p.art.items[opt.item] || {}).text || {}).value || '';
      }
      if (opt.kind === 'digits') o[opt.key] = opt.items.map((i) => (p.art.items[i] || {}).char || '').join('');
      if (opt.kind === 'choice') o[opt.key] = opt.choices[0].value;
    });
    return o;
  };
  MB.productArt = function (p, opts, renderOpts) {
    return MB.art.render(MB.productSpec(p, opts), Object.assign({ fit: true, aspect: 4 / 5, pad: 22, label: p.name }, renderOpts || {}));
  };
  MB.priceLabel = (p) => (p.priceFrom ? 'від ' : '') + MB.money(p.price);

  /* Композиція з демо на головній: бабл з написом у вибраній палітрі */
  MB.heroSpec = function (text, paletteId) {
    const pal = MB.heroPalettes.find((p) => p.id === paletteId) || MB.heroPalettes[0];
    const c = pal.colors;
    const L = (id, color, type) => ({ id, type: type || 'latex12', color });
    return {
      format: 'bouquet',
      seed: 'hero',
      ribbon: pal.ribbon,
      weight: 'heart',
      weightColor: pal.heart,
      items: [
        { id: 'h0', type: 'bubble', color: 'clear', text: { value: text, font: 'script', color: pal.text } },
        L('h1', c[0], 'latex18'),
        L('h2', c[1]),
        L('h3', c[0]),
        L('h4', c[2]),
        L('h5', c[3]),
        L('h6', c[1]),
        L('h7', c[2]),
        L('h8', c[3], 'latex18'),
        L('h9', c[0]),
        { id: 'h10', type: 'heart', color: pal.heart },
        L('h11', c[1]),
        L('h12', c[2]),
      ],
    };
  };

  /* ---------- кошик ---------- */
  const CART_KEY = 'mb-cart-v1';
  let cart = MB.store.get(CART_KEY, { items: [] });
  if (!cart || !Array.isArray(cart.items)) cart = { items: [] };
  function saveCart() {
    MB.store.set(CART_KEY, cart);
    window.dispatchEvent(new CustomEvent('mb:cart'));
  }
  MB.cart = {
    items: () => cart.items.slice(),
    count: () => cart.items.reduce((s, l) => s + l.qty, 0),
    total: () => cart.items.reduce((s, l) => s + l.qty * l.price, 0),
    add(line) {
      const key = line.kind + ':' + line.id + ':' + JSON.stringify(line.opts || {}) + (line.kind === 'custom' ? ':' + Date.now() : '');
      const hit = cart.items.find((l) => l.key === key);
      if (hit) hit.qty += line.qty || 1;
      else cart.items.push(Object.assign({ qty: 1 }, line, { key }));
      saveCart();
    },
    setQty(key, qty) {
      const l = cart.items.find((x) => x.key === key);
      if (!l) return;
      l.qty = Math.max(1, Math.min(99, qty));
      saveCart();
    },
    remove(key) {
      cart.items = cart.items.filter((l) => l.key !== key);
      saveCart();
    },
    clear() {
      cart.items = [];
      saveCart();
    },
  };
  window.addEventListener('storage', (e) => {
    if (e.key === CART_KEY) {
      cart = MB.store.get(CART_KEY, { items: [] });
      window.dispatchEvent(new CustomEvent('mb:cart'));
    }
  });

  /* Додати готовий товар */
  MB.addProduct = function (p, opts, qty) {
    MB.cart.add({ kind: 'product', id: p.id, name: p.name, price: p.price, qty: qty || 1, opts: opts || MB.productDefaults(p) });
    MB.toast(`«${p.name}» у кошику`, { action: 'Оформити', href: 'checkout.html' });
  };

  /* Мініатюра рядка кошика */
  MB.lineArt = function (line) {
    if (line.kind === 'custom' && line.spec) return MB.art.render(line.spec, { fit: true, aspect: 1, pad: 18, positioned: line.spec.items.every((i) => Number.isFinite(i.x)) });
    const p = MB.product(line.id);
    return p ? MB.productArt(p, line.opts, { aspect: 1, label: '' }) : '';
  };
  MB.lineNote = function (line) {
    if (line.kind === 'custom') return line.note || 'Зібрано в конструкторі';
    const p = MB.product(line.id);
    if (!p) return '';
    const bits = [];
    (p.options || []).forEach((o) => {
      const v = (line.opts || {})[o.key];
      if (v == null || v === '') return;
      if (o.kind === 'choice') {
        const ch = o.choices.find((c) => c.value === v);
        bits.push(`${o.label}: ${ch ? ch.label.toLowerCase() : v}`);
      } else bits.push(`${o.label}: «${String(v).replace(/\n/g, ' ')}»`);
    });
    return bits.join('; ');
  };

  /* ---------- сповіщення ---------- */
  let toastTimer = null;
  MB.toast = function (msg, opts) {
    opts = opts || {};
    let el = MB.$('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.innerHTML = `<span class="toast-dot">${MB.icon('check')}</span><span>${esc(msg)}</span>${
      opts.href ? `<a href="${opts.href}">${esc(opts.action || 'Відкрити')}</a>` : opts.onAction ? `<button type="button">${esc(opts.action || 'Скасувати')}</button>` : ''
    }`;
    if (opts.onAction) {
      el.querySelector('button').addEventListener('click', () => {
        el.classList.remove('is-on');
        opts.onAction();
      });
    }
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), opts.ms || 3600);
  };

  /* ---------- картка товару ---------- */
  MB.productCard = function (p, opts) {
    opts = opts || {};
    const url = `product.html?id=${encodeURIComponent(p.id)}`;
    const media = p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy" width="400" height="500">` : MB.productArt(p, null, { label: '' });
    const action = p.request
      ? `<a class="btn btn-ghost btn-sm" href="${url}">Деталі</a>`
      : `<button class="btn-add" type="button" data-add="${esc(p.id)}" aria-label="Додати «${esc(p.name)}» у кошик">${MB.icon('plus')}</button>`;
    return `<article class="pcard" style="--tint:${esc(p.tint || '#FBE4EB')}">
      <div class="pcard-media"><div class="arch">${media}</div>${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ''}</div>
      <div class="pcard-body">
        <${opts.h || 'h3'} class="pcard-title"><a href="${url}">${esc(p.name)}</a></${opts.h || 'h3'}>
        <p class="pcard-note">${esc(p.short)}</p>
        <div class="pcard-foot"><p class="price">${MB.priceLabel(p)}</p>${action}</div>
      </div>
    </article>`;
  };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-add]');
    if (!b) return;
    const p = MB.product(b.getAttribute('data-add'));
    if (!p) return;
    MB.addProduct(p);
    b.classList.remove('is-done');
    void b.offsetWidth;
    b.classList.add('is-done');
  });

  /* ---------- шапка, меню, футер ---------- */
  const NAV = [
    { href: 'catalog.html', label: 'Каталог', key: 'catalog' },
    { href: 'constructor.html', label: 'Конструктор', key: 'constructor' },
    { href: 'catalog.html?cat=photozones', label: 'Фотозони', key: 'photozones' },
    { href: 'index.html#delivery', label: 'Доставка й оплата', key: 'delivery' },
    { href: '#contacts', label: 'Контакти', key: 'contacts' },
  ];
  function currentKey() {
    const page = document.body.dataset.page;
    if (page === 'catalog' && MB.qs('cat') === 'photozones') return 'photozones';
    return page;
  }
  function header() {
    const cur = currentKey();
    const links = NAV.map((n) => `<li><a href="${n.href}"${n.key === cur ? ' aria-current="page"' : ''}>${n.label}</a></li>`).join('');
    return `
      <div class="announce"><div class="wrap announce-in">
        <p>${MB.icon('truck')}<span>Доставка по Києву та передмістю щодня ${C.hours}</span></p>
        <p class="announce-side">${MB.icon('store')}<span>Магазин на Позняках</span></p>
      </div></div>
      <div class="bar"><div class="wrap bar-in">
        <a class="logo" href="index.html" aria-label="${C.brand} — на головну">${MB.logo()}</a>
        <nav class="nav" aria-label="Головне меню"><ul>${links}</ul></nav>
        <div class="bar-actions">
          <a class="icon-btn hide-sm" href="${C.instagramUrl}" target="_blank" rel="noopener" aria-label="Instagram @${C.instagram}">${MB.icon('instagram')}</a>
          <button class="cart-btn" type="button" data-open="cart">${MB.icon('bag')}<span class="cart-label">Кошик</span><span class="cart-count" data-cart-count>0</span></button>
          <button class="icon-btn menu-btn" type="button" data-open="menu" aria-label="Відкрити меню">${MB.icon('menu')}</button>
        </div>
      </div></div>`;
  }
  function footer() {
    const year = new Date().getFullYear();
    return `<div class="wrap">
      <div class="foot-grid">
        <div class="foot-brand">
          <a class="logo logo-lg" href="index.html" aria-label="${C.brand} — на головну">${MB.logo()}</a>
          <p class="foot-tag">${C.tagline}</p>
          <p class="foot-muted">Раніше — ${esc(C.formerName)}</p>
        </div>
        <nav class="foot-col" aria-label="Магазин">
          <h2 class="foot-h">Магазин</h2>
          <ul>
            <li><a href="catalog.html">Готові композиції</a></li>
            <li><a href="constructor.html">Конструктор</a></li>
            <li><a href="catalog.html?cat=photozones">Фотозони</a></li>
            <li><a href="index.html#delivery">Доставка й оплата</a></li>
            <li><a href="index.html#faq">Питання та відповіді</a></li>
          </ul>
        </nav>
        <div class="foot-col" id="contacts">
          <h2 class="foot-h">Контакти</h2>
          <ul class="foot-contacts">
            <li><a href="${C.phoneHref}">${MB.icon('phone')}${esc(C.phone)}</a></li>
            <li><a href="${C.instagramUrl}" target="_blank" rel="noopener">${MB.icon('instagram')}@${esc(C.instagram)}</a></li>
            <li><a href="${C.telegramUrl}">${MB.icon('telegram')}Telegram</a></li>
          </ul>
        </div>
        <div class="foot-col">
          <h2 class="foot-h">Графік</h2>
          <ul class="foot-contacts">
            <li><span>${MB.icon('clock')}Щодня ${C.hours}</span></li>
            <li><span>${MB.icon('pin')}${esc(C.storeAddress)}</span></li>
            <li><span>${MB.icon('card')}${esc(C.payment)}</span></li>
          </ul>
        </div>
      </div>
      <div class="foot-bottom">
        <p>© ${year} ${C.brand}</p>
        <a class="btn btn-light btn-sm" href="${C.directUrl}" target="_blank" rel="noopener">${MB.icon('instagram')}Написати в Direct</a>
      </div>
    </div>`;
  }
  function menuDrawer() {
    const links = NAV.map((n) => `<li><a href="${n.href}">${n.label}${MB.icon('chevron')}</a></li>`).join('');
    return `<dialog class="drawer drawer-left" id="menu-drawer" aria-label="Меню">
      <div class="drawer-head"><a class="logo" href="index.html" aria-label="${C.brand} — на головну">${MB.logo()}</a><button class="icon-btn" type="button" data-close aria-label="Закрити меню">${MB.icon('close')}</button></div>
      <nav class="drawer-nav" aria-label="Меню"><ul>${links}</ul></nav>
      <div class="drawer-foot">
        <a class="btn btn-ink btn-block" href="constructor.html">${MB.icon('sparkle')}Зібрати свою композицію</a>
        <p class="drawer-meta">${MB.icon('clock')}Щодня ${C.hours}</p>
        <p class="drawer-meta">${MB.icon('instagram')}<a href="${C.instagramUrl}" target="_blank" rel="noopener">@${C.instagram}</a></p>
      </div>
    </dialog>`;
  }
  function cartDrawer() {
    return `<dialog class="drawer" id="cart-drawer" aria-labelledby="cart-title">
      <div class="drawer-head"><h2 id="cart-title" class="drawer-title">Кошик</h2><button class="icon-btn" type="button" data-close aria-label="Закрити кошик">${MB.icon('close')}</button></div>
      <div class="drawer-body" data-cart-body></div>
      <div class="drawer-foot" data-cart-foot></div>
    </dialog>`;
  }

  function lineRow(l) {
    return `<li class="cline" data-key="${esc(l.key)}">
      <div class="cline-art">${MB.lineArt(l)}</div>
      <div class="cline-main">
        <p class="cline-name">${esc(l.name)}</p>
        ${MB.lineNote(l) ? `<p class="cline-note">${esc(MB.lineNote(l))}</p>` : ''}
        <div class="cline-row">
          <div class="qty" role="group" aria-label="Кількість">
            <button type="button" data-qty="-1" aria-label="Менше"${l.qty <= 1 ? ' disabled' : ''}>${MB.icon('minus')}</button>
            <output aria-live="polite">${l.qty}</output>
            <button type="button" data-qty="1" aria-label="Більше">${MB.icon('plus')}</button>
          </div>
          <p class="cline-price">${MB.money(l.price * l.qty)}</p>
        </div>
      </div>
      <button class="cline-remove" type="button" data-remove aria-label="Видалити «${esc(l.name)}»">${MB.icon('trash')}</button>
    </li>`;
  }
  MB.lineRow = lineRow;

  function renderCart() {
    const body = MB.$('[data-cart-body]');
    const foot = MB.$('[data-cart-foot]');
    const n = MB.cart.count();
    MB.$$('[data-cart-count]').forEach((el) => {
      el.textContent = n;
      el.hidden = n === 0;
    });
    MB.$$('.cart-btn').forEach((b) => b.setAttribute('aria-label', `Кошик, ${n} ${MB.plural(n, 'товар', 'товари', 'товарів')}`));
    if (!body) return;
    const items = MB.cart.items();
    if (!items.length) {
      body.innerHTML = `<div class="empty">
        <div class="empty-art">${MB.art.render({ format: 'single', items: [{ id: 'empty', type: 'latex12', color: 'blush' }] }, { fit: true, aspect: 1, pad: 10 })}</div>
        <p class="empty-title">Кошик порожній</p>
        <p class="empty-text">Оберіть готову композицію або зберіть свою з будь-яких кульок.</p>
      </div>`;
      foot.innerHTML = `<a class="btn btn-ink btn-block" href="catalog.html">Перейти до каталогу</a><a class="btn btn-ghost btn-block" href="constructor.html">Відкрити конструктор</a>`;
      return;
    }
    body.innerHTML = `<ul class="clines">${items.map((l) => lineRow(l)).join('')}</ul>`;
    const total = MB.cart.total();
    const free = C.freeDeliveryFrom && total < C.freeDeliveryFrom ? `<p class="cart-hint">До безкоштовної доставки — ${MB.money(C.freeDeliveryFrom - total)}</p>` : C.freeDeliveryFrom ? '<p class="cart-hint is-ok">Доставка безкоштовна</p>' : '';
    foot.innerHTML = `<div class="cart-sum"><span>Разом</span><strong>${MB.money(total)}</strong></div>${free}<a class="btn btn-ink btn-block" href="checkout.html">Оформити замовлення</a>`;
  }
  MB.renderCart = renderCart;

  document.addEventListener('click', (e) => {
    const line = e.target.closest('.cline');
    if (!line) return;
    const key = line.getAttribute('data-key');
    const q = e.target.closest('[data-qty]');
    if (q) {
      const l = MB.cart.items().find((x) => x.key === key);
      if (l) MB.cart.setQty(key, l.qty + Number(q.getAttribute('data-qty')));
    }
    if (e.target.closest('[data-remove]')) MB.cart.remove(key);
  });

  function openDialog(d) {
    if (!d || d.open) return;
    const t = MB.$('.toast');
    if (t) t.classList.remove('is-on');
    d.showModal();
    document.documentElement.classList.add('has-modal');
  }
  function closeDialog(d) {
    if (!d || !d.open) return;
    d.classList.add('is-closing');
    const done = () => {
      d.classList.remove('is-closing');
      d.close();
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) done();
    else setTimeout(done, 220);
  }
  MB.openCart = () => openDialog(MB.$('#cart-drawer'));

  function initChrome() {
    const h = MB.$('#site-header');
    if (h) h.innerHTML = header();
    const f = MB.$('#site-footer');
    if (f) f.innerHTML = footer();
    document.body.insertAdjacentHTML('beforeend', menuDrawer() + cartDrawer());
    MB.$$('dialog.drawer').forEach((d) => {
      d.addEventListener('click', (e) => {
        if (e.target === d || e.target.closest('[data-close]')) closeDialog(d);
      });
      d.addEventListener('cancel', (e) => {
        e.preventDefault();
        closeDialog(d);
      });
      d.addEventListener('close', () => {
        if (!MB.$$('dialog[open]').length) document.documentElement.classList.remove('has-modal');
      });
    });
    MB.$('#menu-drawer').addEventListener('click', (e) => {
      if (e.target.closest('a')) closeDialog(MB.$('#menu-drawer'));
    });
    document.addEventListener('click', (e) => {
      const o = e.target.closest('[data-open]');
      if (!o) return;
      const which = o.getAttribute('data-open');
      if (which === 'cart') openDialog(MB.$('#cart-drawer'));
      if (which === 'menu') openDialog(MB.$('#menu-drawer'));
    });
    renderCart();
    window.addEventListener('mb:cart', renderCart);
    MB.fontsReady.then(renderCart);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initChrome);
  else initChrome();
})(window.MB);
