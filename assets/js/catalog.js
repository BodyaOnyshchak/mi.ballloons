/* MI ballloons — каталог */
(function (MB) {
  'use strict';

  const $ = MB.$;
  const esc = MB.esc;
  const form = $('#filters');
  const grid = $('#cat-grid');

  const state = {
    cat: MB.qs('cat') || '',
    occasion: MB.qs('occasion') || '',
    sort: MB.qs('sort') || 'popular',
  };
  if (state.cat && !MB.cat(state.cat)) state.cat = '';
  if (state.occasion && !MB.occasion(state.occasion)) state.occasion = '';

  /* Фільтри */
  function catChips() {
    const all = [{ id: '', name: 'Усе', n: MB.products.length }].concat(
      MB.categories.map((c) => ({ id: c.id, name: c.name, n: MB.products.filter((p) => p.cat === c.id).length }))
    );
    $('#f-cats').innerHTML = all
      .filter((c) => c.n > 0)
      .map((c) => `<label class="chip"><input type="radio" name="cat" value="${c.id}"${c.id === state.cat ? ' checked' : ''}>${esc(c.name)}<span class="chip-n">${c.n}</span></label>`)
      .join('');
  }
  $('#f-occasion').innerHTML = '<option value="">Усі свята</option>' + MB.occasions.map((o) => `<option value="${o.id}"${o.id === state.occasion ? ' selected' : ''}>${esc(o.name)}</option>`).join('');
  $('#f-sort').value = state.sort;
  catChips();

  form.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'cat') state.cat = t.value;
    if (t.name === 'occasion') state.occasion = t.value;
    if (t.name === 'sort') state.sort = t.value;
    syncUrl();
    draw();
  });
  form.addEventListener('submit', (e) => e.preventDefault());

  function syncUrl() {
    const q = new URLSearchParams();
    if (state.cat) q.set('cat', state.cat);
    if (state.occasion) q.set('occasion', state.occasion);
    if (state.sort !== 'popular') q.set('sort', state.sort);
    const s = q.toString();
    history.replaceState(null, '', s ? '?' + s : location.pathname);
  }

  /* Заголовок під вибрану категорію */
  function heading() {
    const c = MB.cat(state.cat);
    const o = MB.occasion(state.occasion);
    const title = c ? c.name : 'Каталог';
    $('#cat-title').textContent = title;
    $('#crumb-current').textContent = title;
    document.title = `${title} — ${MB.config.brand}`;
    $('#cat-sub').textContent = c
      ? c.id === 'photozones'
        ? 'Оформлення свята під ключ. Ціна залежить від розміру — розрахуємо після короткої розмови.'
        : `${c.note}. Збираємо в день замовлення.`
      : 'Готові композиції з гелієвих кульок. Збираємо в день замовлення, напис і цифри змінюєте на сторінці товару.';
    if (o) $('#cat-sub').textContent += ` Свято: ${o.name.toLowerCase()}.`;
  }

  function list() {
    let items = MB.products.filter((p) => (!state.cat || p.cat === state.cat) && (!state.occasion || p.occasions.includes(state.occasion)));
    if (state.sort === 'price-asc') items = items.slice().sort((a, b) => a.price - b.price);
    if (state.sort === 'price-desc') items = items.slice().sort((a, b) => b.price - a.price);
    if (state.sort === 'popular') items = items.slice().sort((a, b) => (b.badge === 'Хіт') - (a.badge === 'Хіт'));
    return items;
  }

  const promoSpec = {
    format: 'bouquet',
    seed: 'promo',
    ribbon: 'white',
    weight: 'heart',
    weightColor: 'foil-pink',
    items: [
      { id: 'p0', type: 'bubble', color: 'clear', text: { value: 'Ваш\nнапис', font: 'hand', color: 'ink' } },
      { id: 'p1', type: 'latex12', color: 'mint' },
      { id: 'p2', type: 'latex12', color: 'butter' },
      { id: 'p3', type: 'latex12', color: 'lavender' },
      { id: 'p4', type: 'latex12', color: 'blush' },
      { id: 'p5', type: 'latex12', color: 'baby-blue' },
      { id: 'p6', type: 'star', color: 'foil-gold' },
    ],
  };
  function promoCard() {
    return `<article class="pcard pcard-promo" style="--tint:#FBE3EA">
      <div class="pcard-media"><div class="arch">${MB.art.render(promoSpec, { fit: true, aspect: 4 / 5, pad: 22 })}</div></div>
      <div class="pcard-body">
        <h2 class="pcard-title"><a href="constructor.html">Зберіть свою композицію</a></h2>
        <p class="pcard-note">Будь-які кульки, кольори й написи. Ціна рахується одразу.</p>
        <div class="pcard-foot"><p class="price">від ${MB.money(MB.types.latex12.price)} за кульку</p><span class="btn-add" aria-hidden="true">${MB.icon('sparkle')}</span></div>
      </div>
    </article>`;
  }

  function draw() {
    heading();
    const items = list();
    const n = items.length;
    $('#f-count').textContent = `${n} ${MB.plural(n, 'композиція', 'композиції', 'композицій')}`;
    if (!n) {
      grid.innerHTML = `<div class="empty empty-wide">
        <div class="empty-art">${MB.art.render({ format: 'single', items: [{ id: 'e', type: 'latex12', color: 'baby-blue' }] }, { fit: true, aspect: 1, pad: 10 })}</div>
        <p class="empty-title">Тут поки порожньо</p>
        <p class="empty-text">Спробуйте інше свято або зберіть композицію в конструкторі — так навіть цікавіше.</p>
        <div class="empty-cta"><button class="btn btn-ghost" type="button" id="reset">Скинути фільтри</button><a class="btn btn-ink" href="constructor.html">Відкрити конструктор</a></div>
      </div>`;
      $('#reset').addEventListener('click', () => {
        state.cat = '';
        state.occasion = '';
        state.sort = 'popular';
        $('#f-occasion').value = '';
        $('#f-sort').value = 'popular';
        catChips();
        syncUrl();
        draw();
      });
      return;
    }
    const cards = items.map((p) => MB.productCard(p, { h: 'h2' }));
    if (state.cat !== 'photozones') cards.splice(Math.min(3, cards.length), 0, promoCard());
    grid.innerHTML = cards.join('');
  }

  draw();
  MB.fontsReady.then(draw);
})(window.MB);
