/* MI ballloons — головна сторінка */
(function (MB) {
  'use strict';

  const $ = MB.$;
  const C = MB.config;
  const esc = MB.esc;

  /* ---------- живе демо в першому екрані ---------- */
  const input = $('#hero-text');
  const art = $('#hero-art');
  let palette = MB.heroPalettes[0].id;
  let frame = 0;

  function drawHero(stagger) {
    const text = input.value.trim() || 'Ваш напис';
    art.innerHTML = MB.art.render(MB.heroSpec(text, palette), {
      fit: true,
      aspect: 0.82,
      pad: 8,
      stagger,
      label: `Букет з баблом і написом «${text}»`,
    });
    if (stagger) {
      art.classList.remove('is-pop');
      void art.offsetWidth;
      art.classList.add('is-pop');
    }
  }
  input.addEventListener('input', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => drawHero(false));
  });

  const pals = $('#hero-palettes');
  pals.innerHTML = MB.heroPalettes
    .map((p, i) => {
      const dots = p.colors
        .slice(0, 3)
        .map((id) => `<span class="dot" style="--c:${MB.art.color(id).hex}"></span>`)
        .join('');
      return `<label class="chip chip-pal"><input type="radio" name="palette" value="${p.id}"${i === 0 ? ' checked' : ''}><span class="dots">${dots}</span>${esc(p.name)}</label>`;
    })
    .join('');
  pals.addEventListener('change', (e) => {
    if (e.target.name !== 'palette') return;
    palette = e.target.value;
    drawHero(true);
  });

  $('#hero-try').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = new URLSearchParams({ text: input.value.trim(), palette });
    location.href = 'constructor.html?' + q.toString();
  });

  /* ---------- хіти ---------- */
  const bestIds = ['shampan', 'nizhnist', 'box-surprise', 'welcome-home', 'super-hero', 'tsyfra-shampan', 'love-day', 'marmelad'];
  function drawBest() {
    $('#best-grid').innerHTML = bestIds
      .map(MB.product)
      .filter(Boolean)
      .map((p) => MB.productCard(p))
      .join('');
  }

  /* ---------- свята ---------- */
  const occColors = {
    birthday: ['blush', 'chrome-gold', 'white'],
    kids: ['baby-blue', 'butter', 'mint'],
    vypyska: ['white', 'baby-blue', 'baby-pink'],
    gender: ['baby-pink', 'black', 'baby-blue'],
    love: ['red', 'blush', 'chrome-rose'],
    'for-her': ['peach', 'blush', 'pearl-white'],
    'for-him': ['black', 'chrome-gold', 'navy'],
    corporate: ['chrome-silver', 'black', 'white'],
  };
  $('#occ-list').innerHTML = MB.occasions
    .map((o) => {
      const n = MB.products.filter((p) => p.occasions.includes(o.id)).length;
      const dots = (occColors[o.id] || ['blush', 'white', 'nude']).map((id) => `<span style="--c:${MB.art.color(id).hex}"></span>`).join('');
      return `<li><a class="occ-item" href="catalog.html?occasion=${o.id}"><span class="occ-dots" aria-hidden="true">${dots}</span><span class="occ-name">${esc(o.name)}</span><span class="occ-n">${n}</span></a></li>`;
    })
    .join('');

  /* ---------- конструктор: прев'ю ---------- */
  const builderSpec = {
    format: 'bouquet',
    seed: 'builder',
    ribbon: 'pink',
    weight: 'heart',
    weightColor: 'foil-rose',
    items: [
      { id: 'b0', type: 'bubble', color: 'clear', text: { value: 'Марія', font: 'hand', color: 'rose' }, inner: 'blush' },
      { id: 'b1', type: 'latex18', color: 'nude' },
      { id: 'b2', type: 'latex12', color: 'blush', n: 3 },
      { id: 'b3', type: 'latex12', color: 'chrome-rose', n: 2 },
      { id: 'b4', type: 'latex12', color: 'pearl-white', n: 2 },
      { id: 'b5', type: 'star', color: 'foil-rose' },
    ],
  };
  function drawBuilder() {
    $('#bv-art').innerHTML = MB.art.render(builderSpec, { fit: true, aspect: 0.86, pad: 6 });
    $('#bv-price').textContent = MB.money(MB.calc(builderSpec).total);
  }
  const sw = ['blush', 'nude', 'pearl-champagne', 'chrome-gold', 'baby-blue', 'black', 'mint', 'confetti-gold'];
  $('#bv-swatches').innerHTML = sw.map((id) => `<span style="--c:${MB.art.color(id).hex}"></span>`).join('');

  /* ---------- фотозони ---------- */
  function drawPz() {
    const p = MB.product('fotozona-pid-klyuch');
    $('#pz-art').innerHTML = MB.art.render(Object.assign({ seed: p.id }, p.art), { fit: true, aspect: 1, pad: 6, label: 'Фотозона з гірляндою з кульок і неоновим написом' });
  }
  $('#pz-list').innerHTML = MB.products
    .filter((p) => p.cat === 'photozones')
    .map((p) => `<li><a href="product.html?id=${p.id}"><span>${esc(p.name)}</span><strong>${MB.priceLabel(p)}</strong></a></li>`)
    .concat([`<li><a href="constructor.html"><span>Букети на грузиках для декору</span><strong>від ${MB.money(MB.types.latex12.price * 5)}</strong></a></li>`])
    .join('');
  $('#pz-direct').href = C.directUrl;

  /* ---------- доставка ---------- */
  const facts = [
    { icon: 'clock', title: `Щодня ${C.hours}`, text: 'Привеземо рано-вранці чи пізно ввечері — встигнемо до сюрпризу.' },
    {
      icon: 'truck',
      title: C.deliveryArea,
      text: `Вартість — від ${MB.money(C.deliveryFrom)} залежно від району.${C.freeDeliveryFrom ? ` Від ${MB.money(C.freeDeliveryFrom)} — безкоштовно.` : ''}`,
    },
    { icon: 'store', title: `Самовивіз: ${C.storeArea}`, text: 'Заберіть замовлення в нашому магазині — це безкоштовно.' },
    { icon: 'card', title: C.payment, text: 'Реквізити надішлемо після того, як менеджер підтвердить замовлення.' },
  ];
  $('#facts').innerHTML = facts
    .map((f) => `<li class="fact"><span class="fact-ico">${MB.icon(f.icon)}</span><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></li>`)
    .join('');

  /* ---------- питання ---------- */
  $('#faq-list').innerHTML = MB.faq.map((q) => `<details name="faq"><summary>${esc(q.q)}</summary><p>${esc(q.a)}</p></details>`).join('');

  /* ---------- Instagram ---------- */
  const il = $('#insta-link');
  il.href = C.instagramUrl;
  il.innerHTML = `${MB.icon('instagram')}@${esc(C.instagram)}`;
  const instaIds = ['one', 'gender', 'trydtsyat', 'khmarynka', 'naikrashchii-mami'];
  function drawInsta() {
    $('#insta-row').innerHTML = instaIds
      .map(MB.product)
      .filter(Boolean)
      .map((p) => `<li><a class="insta-tile" href="product.html?id=${p.id}" style="--tint:${p.tint}" aria-label="${esc(p.name)}">${MB.productArt(p, null, { aspect: 1, pad: 16, label: '' })}</a></li>`)
      .join('');
  }

  function drawAll(stagger) {
    drawHero(stagger);
    drawBest();
    drawBuilder();
    drawPz();
    drawInsta();
  }
  drawAll(false);
  MB.fontsReady.then(() => drawAll(false));
})(window.MB);
