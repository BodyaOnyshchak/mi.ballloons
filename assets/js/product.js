/* MI ballloons — сторінка товару */
(function (MB) {
  'use strict';

  const $ = MB.$;
  const $$ = MB.$$;
  const esc = MB.esc;
  const C = MB.config;
  const root = $('#pp');

  const p = MB.product(MB.qs('id')) || null;
  if (!p) {
    root.innerHTML = `<div class="empty empty-wide">
      <div class="empty-art">${MB.art.render({ format: 'single', items: [{ id: 'nf', type: 'latex12', color: 'fog' }] }, { fit: true, aspect: 1, pad: 10 })}</div>
      <h1 class="empty-title">Такої композиції немає</h1>
      <p class="empty-text">Можливо, її вже прибрали з каталогу. Подивіться інші або зберіть свою.</p>
      <div class="empty-cta"><a class="btn btn-ghost" href="catalog.html">До каталогу</a><a class="btn btn-ink" href="constructor.html">Відкрити конструктор</a></div>
    </div>`;
    $('#related-section').hidden = true;
    return;
  }

  const opts = MB.productDefaults(p);
  let qty = 1;
  const cat = MB.cat(p.cat);
  document.title = `${p.name} — ${C.brand}`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', `${p.name}: ${p.short}. ${p.desc}`);

  /* ---------- опції ---------- */
  function optionField(o) {
    const id = 'opt-' + o.key;
    if (o.kind === 'text') {
      const max = o.max || 40;
      return `<div class="field">
        <label for="${id}">${esc(o.label)}</label>
        <textarea class="textarea input-hand" id="${id}" data-opt="${o.key}" rows="2" maxlength="${max}" spellcheck="false">${esc(opts[o.key] || '')}</textarea>
        <p class="hint">До ${max} символів. Новий рядок — клавіша Enter. Превʼю оновлюється одразу.</p>
      </div>`;
    }
    if (o.kind === 'digits') {
      if (o.items.length === 1) {
        const chips = '0123456789'
          .split('')
          .map((d) => `<label class="chip chip-digit"><input type="radio" name="${o.key}" data-opt="${o.key}" value="${d}"${opts[o.key] === d ? ' checked' : ''}>${d}</label>`)
          .join('');
        return `<fieldset class="field"><legend class="label">${esc(o.label)}</legend><div class="chips">${chips}</div></fieldset>`;
      }
      return `<div class="field field-short">
        <label for="${id}">${esc(o.label)}</label>
        <input class="input input-digits" id="${id}" data-opt="${o.key}" inputmode="numeric" pattern="[0-9]{${o.items.length}}" maxlength="${o.items.length}" value="${esc(opts[o.key] || '')}" required>
        <p class="field-error">Введіть ${o.items.length} цифри</p>
      </div>`;
    }
    if (o.kind === 'choice') {
      const chips = o.choices
        .map((c) => `<label class="chip"><input type="radio" name="${o.key}" data-opt="${o.key}" value="${esc(c.value)}"${opts[o.key] === c.value ? ' checked' : ''}>${esc(c.label)}</label>`)
        .join('');
      return `<fieldset class="field"><legend class="label">${esc(o.label)}</legend><div class="chips">${chips}</div>${o.note ? `<p class="hint">${esc(o.note)}</p>` : ''}</fieldset>`;
    }
    return '';
  }

  /* ---------- склад ---------- */
  function composition() {
    if (p.art.format === 'garland') {
      return `<ul class="pp-comp">
        <li><span>Кругла стійка з тканинним чохлом</span></li>
        <li><span>Органічна гірлянда з кульок різних розмірів</span></li>
        <li><span>Неонова вивіска «${esc(p.art.neon || '')}»</span></li>
        <li><span>Доставка, монтаж і демонтаж</span></li>
      </ul>`;
    }
    const calc = MB.calc(MB.productSpec(p, opts));
    const rows = calc.lines.filter((l) => !/Hi-Float/.test(l.label));
    return `<ul class="pp-comp">${rows.map((l) => `<li><span>${esc(l.label)}</span><span>${l.qty} шт</span></li>`).join('')}</ul>`;
  }

  const crumbs = `<nav class="crumbs" aria-label="Навігаційний ланцюжок"><ol>
    <li><a href="index.html">Головна</a></li>
    <li><a href="catalog.html">Каталог</a></li>
    ${cat ? `<li><a href="catalog.html?cat=${cat.id}">${esc(cat.name)}</a></li>` : ''}
    <li aria-current="page">${esc(p.name)}</li>
  </ol></nav>`;

  const buy = p.request
    ? `<div class="pp-buy pp-buy-req">
        <button class="btn btn-ink" type="button" id="open-request">Залишити заявку</button>
        <a class="btn btn-ghost" href="${C.directUrl}" target="_blank" rel="noopener">${MB.icon('instagram')}Обговорити в Direct</a>
      </div>`
    : `<div class="pp-buy">
        <div class="qty qty-lg" role="group" aria-label="Кількість">
          <button type="button" data-q="-1" aria-label="Менше" disabled>${MB.icon('minus')}</button>
          <output id="pp-qty" aria-live="polite">1</output>
          <button type="button" data-q="1" aria-label="Більше">${MB.icon('plus')}</button>
        </div>
        <button class="btn btn-ink pp-add" type="submit">${MB.icon('bag')}<span>Додати в кошик</span><span class="pp-add-sum" id="pp-sum">${MB.money(p.price)}</span></button>
      </div>
      <a class="pp-edit" id="pp-edit" href="#">${MB.icon('edit')}Змінити кольори чи кількість у конструкторі</a>`;

  root.innerHTML = `
    ${crumbs}
    <article class="pp">
      <div class="pp-media">
        <div class="pp-arch" style="--tint:${esc(p.tint || '#FBE4EB')}"><div class="pp-art" id="pp-art"></div></div>
        <p class="note pp-note">Ілюстрація композиції. Справжні кульки можуть трохи відрізнятися відтінком.</p>
      </div>
      <div class="pp-info">
        ${p.badge ? `<span class="tag">${esc(p.badge)}</span>` : ''}
        <h1>${esc(p.name)}</h1>
        <p class="pp-price">${MB.priceLabel(p)}</p>
        <p class="pp-desc">${esc(p.desc)}</p>
        <form class="pp-form" id="pp-form" novalidate>
          ${(p.options || []).map(optionField).join('')}
          ${buy}
        </form>
        <ul class="pp-perks">
          <li>${MB.icon('clock')}<span>Доставка щодня з ${C.hours}</span></li>
          <li>${MB.icon('truck')}<span>${esc(C.deliveryArea)} — від ${MB.money(C.deliveryFrom)}, самовивіз з Позняків безкоштовно</span></li>
          <li>${MB.icon('card')}<span>${esc(C.payment)} після підтвердження</span></li>
        </ul>
        <details class="pp-details" open>
          <summary>Склад композиції</summary>
          <div id="pp-comp">${composition()}</div>
        </details>
        ${
          p.request
            ? `<details class="pp-details"><summary>Як ми працюємо</summary><p>Обговорюємо привід і кольори, надсилаємо ескіз і точну ціну. Після передоплати бронюємо дату, привозимо й монтуємо фотозону за 1–2 години до початку свята.</p></details>`
            : `<details class="pp-details"><summary>Скільки літатимуть кульки</summary><p>${esc(MB.faq[0].a)}</p></details>`
        }
      </div>
    </article>`;

  /* ---------- превʼю ---------- */
  const artEl = $('#pp-art');
  let raf = 0;
  function drawArt() {
    artEl.innerHTML = MB.productArt(p, opts, { pad: 26, sway: false, label: `${p.name}: ілюстрація композиції` });
    if (!p.request) {
      $('#pp-comp').innerHTML = composition();
      $('#pp-edit').href = `constructor.html?from=${encodeURIComponent(p.id)}&opts=${encodeURIComponent(JSON.stringify(opts))}`;
    }
  }
  drawArt();
  MB.fontsReady.then(drawArt);

  const form = $('#pp-form');
  form.addEventListener('input', (e) => {
    const key = e.target.getAttribute('data-opt');
    if (!key) return;
    let v = e.target.value;
    if (e.target.classList.contains('input-digits')) {
      v = v.replace(/\D/g, '');
      e.target.value = v;
    }
    opts[key] = v;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(drawArt);
  });

  if (!p.request) {
    const sumEl = $('#pp-sum');
    const qtyEl = $('#pp-qty');
    form.addEventListener('click', (e) => {
      const b = e.target.closest('[data-q]');
      if (!b) return;
      qty = Math.max(1, Math.min(20, qty + Number(b.getAttribute('data-q'))));
      qtyEl.textContent = qty;
      sumEl.textContent = MB.money(p.price * qty);
      form.querySelector('[data-q="-1"]').disabled = qty <= 1;
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const bad = $$('.input-digits', form).find((i) => !i.checkValidity());
      if (bad) {
        bad.reportValidity();
        bad.focus();
        return;
      }
      const clean = {};
      Object.keys(opts).forEach((k) => (clean[k] = typeof opts[k] === 'string' ? opts[k].trim() : opts[k]));
      MB.addProduct(p, clean, qty);
    });
  }

  /* ---------- заявка на фотозону ---------- */
  const dlg = $('#request');
  if (p.request) {
    $('#req-direct').href = C.directUrl;
    $('#open-request').addEventListener('click', () => dlg.showModal());
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg || e.target.closest('[data-modal-close]')) dlg.close();
    });
    $('#req-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      if (!f.checkValidity()) {
        f.reportValidity();
        return;
      }
      $('.req-fields', f).hidden = true;
      $('.req-done', f).hidden = false;
    });
  }

  /* ---------- схожі ---------- */
  const related = MB.products
    .filter((x) => x.id !== p.id)
    .map((x) => ({ x, score: (x.cat === p.cat ? 2 : 0) + x.occasions.filter((o) => p.occasions.includes(o)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((r) => r.x);
  function drawRelated() {
    $('#related').innerHTML = related.map((x) => MB.productCard(x)).join('');
  }
  drawRelated();
  MB.fontsReady.then(drawRelated);
})(window.MB);
