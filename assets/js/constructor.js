/* MI ballloons — конструктор композицій */
(function (MB) {
  'use strict';

  const W = 640;
  const H = 800;
  const MAX = 40;
  const DRAFT_KEY = 'mb-builder-v1';
  const BG_KEY = 'mb-builder-bg';
  const HINT_KEY = 'mb-builder-hint';
  const $ = MB.$;
  const $$ = MB.$$;
  const esc = MB.esc;
  const T = MB.types;
  const X = MB.extras;
  const C = MB.config;

  const svgBox = $('#cz-svg');
  const stage = $('#cz-stage');
  const panel = $('#cz-panel');

  let state = null;
  let selected = null;
  let tab = 'add';
  let addType = 'latex12';
  const addColor = {};
  Object.keys(T).forEach((k) => (addColor[k] = T[k].defaultColor));
  const addChar = { number: '1', letter: 'A' };
  let addQty = 1;
  let past = [];
  let future = [];
  let popIds = [];
  let focusId = null;
  let typing = false;
  let seq = 0;

  const newId = () => 'b' + Date.now().toString(36) + (seq++).toString(36);
  const clamp = MB.art.util.clamp;
  const colorsFor = (type) => MB.palette.filter((c) => (T[type].finishes || []).includes(c.finish));
  const isCompatible = (type, id) => colorsFor(type).some((c) => c.id === id);
  const current = () => state.items.find((i) => i.id === selected) || null;
  function unitPrice(it) {
    const t = T[it.type];
    const c = MB.art.color(it.color, it.type);
    return (t.priceBy && t.priceBy[c.finish]) || t.price;
  }
  const priceFrom = (type) => Math.min.apply(null, [T[type].price].concat(Object.values(T[type].priceBy || {})));

  /* ---------- стан ---------- */
  function blank() {
    return { format: 'bouquet', seed: 'cz', ribbon: 'white', weight: 'heart', weightColor: 'foil-rose', box: { color: 'white', text: '' }, hifloat: true, items: [] };
  }
  function sanitizeItem(it) {
    const type = T[it.type] ? it.type : 'latex12';
    const out = { id: String(it.id || newId()), type, color: isCompatible(type, it.color) ? it.color : T[type].defaultColor };
    if (T[type].glyph) out.char = String(it.char ?? (type === 'number' ? '1' : 'A')).slice(0, 1);
    if (T[type].text && it.text && typeof it.text === 'object') {
      out.text = {
        value: String(it.text.value || '').slice(0, 60),
        font: MB.art.fonts[it.text.font] ? it.text.font : 'script',
        color: MB.art.textHex[it.text.color] ? it.text.color : MB.art.defaultTextColor(out.color, type),
      };
    }
    if (type === 'bubble' && it.inner && MB.palette.some((c) => c.id === it.inner)) out.inner = it.inner;
    if (Number.isFinite(it.x) && Number.isFinite(it.y)) {
      out.x = clamp(it.x, 0, W);
      out.y = clamp(it.y, 0, H);
    }
    if (it.pinned) out.pinned = true;
    if (Number.isFinite(it.z)) out.z = it.z;
    return out;
  }
  function sanitize(s) {
    const b = blank();
    if (!s || typeof s !== 'object') return b;
    b.format = s.format === 'box' ? 'box' : 'bouquet';
    if (MB.ribbons.some((r) => r.id === s.ribbon)) b.ribbon = s.ribbon;
    b.weight = s.weight === 'cube' ? 'cube' : 'heart';
    if (MB.palette.some((c) => c.id === s.weightColor && c.finish === 'foil')) b.weightColor = s.weightColor;
    if (s.box && typeof s.box === 'object') {
      b.box.color = MB.boxColors.some((c) => c.id === s.box.color) ? s.box.color : 'white';
      b.box.text = String(s.box.text || '').slice(0, 24);
    }
    b.hifloat = s.hifloat !== false;
    b.seed = String(s.seed || 'cz').slice(0, 24);
    b.items = (Array.isArray(s.items) ? s.items : []).slice(0, MAX).map(sanitizeItem);
    return b;
  }
  function fromSpec(spec) {
    const s = sanitize(Object.assign({}, spec, { items: [] }));
    s.seed = 'cz-' + Math.random().toString(36).slice(2, 7);
    s.items = MB.art.normalize(spec, 'x').slice(0, MAX).map((it) => {
      const clean = Object.assign({}, it, { id: newId() });
      delete clean.x;
      delete clean.y;
      return sanitizeItem(clean);
    });
    return s;
  }

  /* Компактний запис для посилання */
  function compact(s) {
    return {
      f: s.format,
      r: s.ribbon,
      w: s.weight,
      wc: s.weightColor,
      b: s.format === 'box' ? s.box : undefined,
      h: s.hifloat ? 1 : 0,
      sd: s.seed,
      i: s.items.map((it) => [it.type, it.color, it.char ?? 0, it.text && it.text.value ? [it.text.value, it.text.font, it.text.color] : 0, it.inner || 0, Math.round(it.x), Math.round(it.y), it.pinned ? 1 : 0]),
    };
  }
  function expand(c) {
    return {
      format: c.f,
      ribbon: c.r,
      weight: c.w,
      weightColor: c.wc,
      box: c.b,
      hifloat: c.h !== 0,
      seed: c.sd,
      items: (c.i || []).map((a) => ({
        type: a[0],
        color: a[1],
        char: a[2] || a[2] === '0' ? a[2] : undefined,
        text: a[3] ? { value: a[3][0], font: a[3][1], color: a[3][2] } : undefined,
        inner: a[4] || undefined,
        x: a[5],
        y: a[6],
        pinned: !!a[7],
      })),
    };
  }
  function encode(s) {
    const bytes = new TextEncoder().encode(JSON.stringify(compact(s)));
    let bin = '';
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decode(str) {
    const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
    return expand(JSON.parse(new TextDecoder().decode(bytes)));
  }
  const shareUrl = () => location.origin + location.pathname + '#s=' + encode(state);

  /* ---------- розкладка й малювання ---------- */
  function relayout(full) {
    if (full) {
      state.items.forEach((it) => {
        if (!it.pinned) {
          delete it.x;
          delete it.y;
        }
      });
    }
    const L = MB.art.layout(state, W, H, { normalized: true, warm: !full });
    const map = new Map(L.items.map((i) => [i.id, i]));
    state.items.forEach((it) => {
      const p = map.get(it.id);
      if (p) {
        it.x = Math.round(p.x * 10) / 10;
        it.y = Math.round(p.y * 10) / 10;
      }
    });
  }
  let frozenBox = null;
  function currentBox() {
    const svg = svgBox.querySelector('svg');
    if (!svg || !svg.viewBox || !svg.viewBox.baseVal) return null;
    const v = svg.viewBox.baseVal;
    return [v.x, v.y, v.width, v.height];
  }
  function drawStage() {
    const active = document.activeElement;
    const keep = focusId || (active && svgBox.contains(active) && active.closest('.mb-bl') ? active.closest('.mb-bl').getAttribute('data-id') : null);
    const aspect = svgBox.clientWidth && svgBox.clientHeight ? svgBox.clientWidth / svgBox.clientHeight : 0.8;
    svgBox.innerHTML = MB.art.render(state, {
      w: W,
      h: H,
      positioned: true,
      interactive: true,
      selected,
      popIds,
      fit: true,
      aspect,
      pad: 40,
      minW: 600,
      viewBox: frozenBox,
      par: 'xMidYMid meet',
      label: 'Ваша композиція. Оберіть кульку, щоб змінити її; стрілки переміщують вибрану кульку.',
    });
    popIds = [];
    $('#cz-empty').hidden = state.items.length > 0;
    if (keep) {
      const el = svgBox.querySelector(`[data-id="${CSS.escape(keep)}"]`);
      if (el) {
        el.focus({ preventScroll: true });
        focusId = keep;
      }
    }
  }
  function update(o) {
    o = o || {};
    if (o.layout !== false) relayout(!!o.full);
    drawStage();
    renderSummary();
    if (o.panels !== false) renderPanels();
    save();
  }
  function snapshot() {
    past.push(JSON.stringify(state));
    if (past.length > 60) past.shift();
    future = [];
  }
  function commit(fn, o) {
    snapshot();
    fn();
    update(o);
    renderTools();
  }
  function undo() {
    if (!past.length) return;
    future.push(JSON.stringify(state));
    state = JSON.parse(past.pop());
    if (selected && !current()) selected = null;
    update({ layout: false });
    renderTools();
  }
  function redo() {
    if (!future.length) return;
    past.push(JSON.stringify(state));
    state = JSON.parse(future.pop());
    if (selected && !current()) selected = null;
    update({ layout: false });
    renderTools();
  }
  function save() {
    MB.store.set(DRAFT_KEY, state);
  }

  /* ---------- панелі ---------- */
  function swatch(c, on, scope) {
    return `<button type="button" class="sw" role="radio" aria-checked="${on}" tabindex="${on ? 0 : -1}" aria-label="${esc(c.name)}" data-finish="${c.finish}" data-color="${c.id}" data-scope="${scope}" style="--c:${c.hex}"></button>`;
  }
  function swatchGroups(type, active, scope) {
    const groups = MB.colorGroups.filter((g) => T[type].finishes.includes(g.id));
    return groups
      .map((g) => {
        const list = MB.palette.filter((c) => c.finish === g.id);
        const hasActive = list.some((c) => c.id === active);
        const sws = list.map((c, i) => swatch(c, c.id === active, scope).replace(`tabindex="-1"`, !hasActive && i === 0 ? 'tabindex="0"' : 'tabindex="-1"')).join('');
        return `<div class="sw-group"><p class="sw-title" id="sg-${scope}-${g.id}">${esc(g.name)}</p><div class="sws" role="radiogroup" aria-labelledby="sg-${scope}-${g.id}">${sws}</div></div>`;
      })
      .join('');
  }
  function digitChips(cur, scope) {
    const chips = '0123456789'
      .split('')
      .map((d) => `<button type="button" class="chip chip-digit" data-char="${d}" data-scope="${scope}" aria-pressed="${d === cur}">${d}</button>`)
      .join('');
    return `<fieldset class="field"><legend class="label">Цифра</legend><div class="chips">${chips}</div></fieldset>`;
  }
  function letterField(cur, id, scope) {
    return `<div class="field field-short"><label for="${id}">Літера</label><input class="input input-digits" id="${id}" data-letter="${scope}" maxlength="1" value="${esc(cur)}" autocomplete="off" spellcheck="false"><p class="hint">Латиниця або кирилиця</p></div>`;
  }
  function icon(it) {
    return MB.art.render({ format: 'single', items: [Object.assign({ id: 'ic-' + it.type }, it, { text: undefined })] }, { fit: true, aspect: 1, pad: 6 });
  }

  function renderAdd() {
    const pane = $('#pane-add');
    const t = T[addType];
    const tiles = MB.typeOrder
      .map((type) => {
        const it = { type, color: addColor[type] };
        if (T[type].glyph) it.char = type === 'number' ? addChar.number : addChar.letter;
        return `<button type="button" class="tile" data-type="${type}" aria-pressed="${type === addType}">
          <span class="tile-art">${icon(it)}</span>
          <span class="tile-name">${esc(T[type].name)}</span>
          <span class="tile-meta">${esc(T[type].size)} · від ${MB.money(priceFrom(type))}</span>
        </button>`;
      })
      .join('');
    const c = MB.art.color(addColor[addType], addType);
    const glyph = t.glyph === 'digit' ? digitChips(addChar.number, 'add') : t.glyph === 'letter' ? letterField(addChar.letter, 'add-letter', 'add') : '';
    const unit = unitPrice({ type: addType, color: addColor[addType] });
    const room = MAX - state.items.length;
    pane.innerHTML = `
      <h2 class="pane-title">Що додаємо</h2>
      <div class="tiles">${tiles}</div>
      ${glyph ? `<div class="pane-block">${glyph}</div>` : ''}
      <div class="pane-block">
        <p class="sw-current">Колір: <strong>${esc(c.name)}</strong></p>
        ${swatchGroups(addType, addColor[addType], 'add')}
      </div>
      <div class="add-row">
        <div class="qty qty-lg" role="group" aria-label="Кількість">
          <button type="button" data-addq="-1" aria-label="Менше"${addQty <= 1 ? ' disabled' : ''}>${MB.icon('minus')}</button>
          <output aria-live="polite">${addQty}</output>
          <button type="button" data-addq="1" aria-label="Більше"${addQty >= Math.min(12, room) ? ' disabled' : ''}>${MB.icon('plus')}</button>
        </div>
        <button type="button" class="btn btn-ink add-btn" data-act="add"${room <= 0 ? ' disabled' : ''}>${MB.icon('plus')}<span>Додати</span><span class="add-sum">${MB.money(unit * addQty)}</span></button>
      </div>
      ${room <= 0 ? `<p class="hint">У композиції вже ${MAX} кульок — це максимум.</p>` : ''}`;
  }

  function renderItem() {
    const pane = $('#pane-item');
    const it = current();
    if (!it) {
      pane.innerHTML = `<div class="pane-empty">
        <span class="pane-empty-ico">${MB.icon('balloon')}</span>
        <p>Натисніть на кульку на сцені, щоб змінити колір, додати напис чи прибрати її.</p>
      </div>`;
      return;
    }
    const t = T[it.type];
    const c = MB.art.color(it.color, it.type);
    const glyph = t.glyph === 'digit' ? digitChips(it.char, 'item') : t.glyph === 'letter' ? letterField(it.char, 'it-letter', 'item') : '';
    const tx = it.text || { value: '', font: 'script', color: MB.art.defaultTextColor(it.color, it.type) };
    const text = t.text
      ? `<div class="pane-block">
          <div class="field">
            <label for="it-text">Напис <span class="hint">+${MB.money(X.inscription)}</span></label>
            <textarea class="textarea input-hand" id="it-text" rows="2" maxlength="40" placeholder="Імʼя, дата чи побажання" spellcheck="false">${esc(tx.value)}</textarea>
            <p class="hint">Новий рядок — Enter. Щоб прибрати напис, очистіть поле.</p>
          </div>
          <fieldset class="field"><legend class="label">Шрифт</legend><div class="chips">${MB.fonts
            .map((fo) => `<button type="button" class="chip chip-font chip-font-${fo.id}" data-font="${fo.id}" aria-pressed="${tx.font === fo.id}">${esc(fo.name)}</button>`)
            .join('')}</div></fieldset>
          <fieldset class="field"><legend class="label">Колір напису</legend><div class="chips">${MB.textColors
            .map((tc) => `<button type="button" class="chip" data-tcolor="${tc.id}" aria-pressed="${tx.color === tc.id}"><span class="dot" style="--c:${MB.art.textHex[tc.id]}"></span>${esc(tc.name)}</button>`)
            .join('')}</div></fieldset>
        </div>`
      : `<p class="hint pane-note">На ${esc(t.name.toLowerCase())} напис не робимо — оберіть бабл, латексну чи фольговане серце.</p>`;
    const inner =
      it.type === 'bubble'
        ? `<div class="pane-block">
            <label class="switch"><input type="checkbox" id="it-inner"${it.inner ? ' checked' : ''}><span class="switch-ui" aria-hidden="true"></span><span>Міні-кульки всередині <span class="hint">+${MB.money(X.bubbleInner)}</span></span></label>
            ${it.inner ? `<div class="sws sws-inner" role="radiogroup" aria-label="Колір міні-кульок">${MB.palette.filter((x) => x.finish === 'pastel').map((x) => swatch(x, x.id === it.inner, 'inner')).join('')}</div>` : ''}
          </div>`
        : '';
    pane.innerHTML = `
      <div class="item-head">
        <span class="item-art">${icon(it)}</span>
        <div>
          <h2 class="pane-title">${esc(t.name)}${t.glyph ? ` «${esc(it.char)}»` : ''}</h2>
          <p class="hint">${esc(t.size)}, ${esc(c.name.toLowerCase())} — ${MB.money(unitPrice(it))}</p>
        </div>
        <button type="button" class="icon-btn" data-act="deselect" aria-label="Зняти вибір">${MB.icon('close')}</button>
      </div>
      ${glyph ? `<div class="pane-block">${glyph}</div>` : ''}
      <div class="pane-block">
        <p class="sw-current">Колір: <strong>${esc(c.name)}</strong></p>
        ${swatchGroups(it.type, it.color, 'item')}
      </div>
      ${text}
      ${inner}
      <div class="item-actions">
        <button type="button" class="btn btn-ghost btn-sm" data-act="dup">${MB.icon('copy')}Дублювати</button>
        <button type="button" class="btn btn-ghost btn-sm" data-act="front">${MB.icon('front')}Наперед</button>
        <button type="button" class="btn btn-ghost btn-sm btn-danger" data-act="remove">${MB.icon('trash')}Прибрати</button>
      </div>`;
  }

  function renderDecor() {
    const pane = $('#pane-decor');
    const s = state;
    const chip = (attr, val, on, label, dot) => `<button type="button" class="chip" ${attr}="${val}" aria-pressed="${on}">${dot ? `<span class="dot" style="--c:${dot}"></span>` : ''}${label}</button>`;
    const fmt = `<fieldset class="field"><legend class="label">Формат</legend><div class="chips">
      ${chip('data-fmt', 'bouquet', s.format === 'bouquet', 'Букет на грузику')}
      ${chip('data-fmt', 'box', s.format === 'box', `Коробка-сюрприз <span class="chip-n">+${MB.money(X.box)}</span>`)}
    </div></fieldset>`;
    const box =
      s.format === 'box'
        ? `<fieldset class="field"><legend class="label">Колір коробки</legend><div class="chips">${MB.boxColors.map((b) => chip('data-boxc', b.id, s.box.color === b.id, esc(b.name), b.hex)).join('')}</div></fieldset>
          <div class="field"><label for="box-text">Напис на коробці <span class="hint">+${MB.money(X.boxText)}</span></label><input class="input input-hand" id="box-text" maxlength="24" value="${esc(s.box.text)}" placeholder="Наприклад, Для Марії" autocomplete="off" spellcheck="false"></div>`
        : '';
    const weight =
      s.format === 'bouquet'
        ? `<fieldset class="field"><legend class="label">Грузик</legend><div class="chips">
            ${chip('data-weight', 'heart', s.weight !== 'cube', 'Фольговане серце')}
            ${chip('data-weight', 'cube', s.weight === 'cube', `Кубик з бантом <span class="chip-n">+${MB.money(X.weightCube)}</span>`)}
          </div>
          ${s.weight !== 'cube' ? `<div class="sws" role="radiogroup" aria-label="Колір серця-грузика">${MB.palette.filter((c) => c.finish === 'foil').map((c) => swatch(c, c.id === s.weightColor, 'weight')).join('')}</div>` : ''}
          </fieldset>`
        : '';
    const ribbons = `<fieldset class="field"><legend class="label">Стрічки</legend><div class="chips">${MB.ribbons.map((r) => chip('data-ribbon', r.id, s.ribbon === r.id, esc(r.name), r.hex)).join('')}</div></fieldset>`;
    const hf = `<label class="switch"><input type="checkbox" id="hifloat"${s.hifloat ? ' checked' : ''}><span class="switch-ui" aria-hidden="true"></span><span>Обробка Hi-Float <span class="hint">+${MB.money(X.hifloat)} за латексну кульку, щоб літали довше</span></span></label>`;
    pane.innerHTML = `<h2 class="pane-title">Оформлення</h2>${fmt}${box}${weight}${ribbons}<div class="pane-block">${hf}</div>`;
  }

  function renderPrice() {
    const pane = $('#pane-price');
    const calc = MB.calc(state);
    if (!calc.count) {
      pane.innerHTML = '<h2 class="pane-title">Склад і ціна</h2><p class="hint">Додайте хоча б одну кульку — і тут зʼявиться розрахунок.</p>';
      return;
    }
    const rows = calc.lines
      .map((l) => `<tr><th scope="row">${esc(l.label)}</th><td>${l.qty > 1 ? `${l.qty} × ${MB.money(l.unit)}` : ''}</td><td>${MB.money(l.sum)}</td></tr>`)
      .join('');
    pane.innerHTML = `<h2 class="pane-title">Склад і ціна</h2>
      <table class="price-table"><caption class="visually-hidden">Розрахунок вартості композиції</caption>
        <tbody>${rows}</tbody>
        <tfoot><tr><th scope="row">Разом</th><td></td><td>${MB.money(calc.total)}</td></tr></tfoot>
      </table>
      <p class="note">Ціна орієнтовна. Менеджер підтвердить наявність кольорів і вартість доставки.</p>
      <div class="price-actions">
        <button type="button" class="btn btn-ink btn-block" data-act="cart">${MB.icon('bag')}Додати в кошик</button>
        <button type="button" class="btn btn-ghost btn-block" data-act="direct">${MB.icon('instagram')}Надіслати опис у Direct</button>
        <button type="button" class="btn btn-ghost btn-block" data-act="share">${MB.icon('link')}Скопіювати посилання</button>
      </div>`;
  }

  function renderSummary() {
    const calc = MB.calc(state);
    $('#cz-count').textContent = calc.count
      ? `${calc.count} ${MB.plural(calc.count, 'кулька', 'кульки', 'кульок')}${calc.texts ? `, ${calc.texts} ${MB.plural(calc.texts, 'напис', 'написи', 'написів')}` : ''}`
      : 'Поки порожньо';
    $('#cz-total').textContent = MB.money(calc.total);
    $$('[data-act="cart"]').forEach((b) => (b.disabled = !calc.count));
  }

  function renderTools() {
    const tb = $('.cz-toolbar');
    tb.querySelector('[data-act="undo"]').disabled = !past.length;
    tb.querySelector('[data-act="redo"]').disabled = !future.length;
    tb.querySelector('[data-act="clear"]').disabled = !state.items.length;
    $$('#cz-format [data-fmt]').forEach((b) => b.setAttribute('aria-checked', b.getAttribute('data-fmt') === state.format));
  }

  function renderPanels() {
    renderAdd();
    renderItem();
    renderDecor();
    renderPrice();
  }

  /* ---------- вкладки ---------- */
  const TABS = ['add', 'item', 'decor', 'price'];
  function setTab(t, focus) {
    tab = t;
    TABS.forEach((name) => {
      const b = $('#tab-' + name);
      const on = name === t;
      b.setAttribute('aria-selected', on);
      b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
      $('#pane-' + name).hidden = !on;
    });
  }
  $('.cz-tabs').addEventListener('click', (e) => {
    const b = e.target.closest('[role="tab"]');
    if (b) setTab(b.id.replace('tab-', ''));
  });
  $('.cz-tabs').addEventListener('keydown', (e) => {
    const i = TABS.indexOf(tab);
    if (e.key === 'ArrowRight') setTab(TABS[(i + 1) % TABS.length], true);
    else if (e.key === 'ArrowLeft') setTab(TABS[(i + TABS.length - 1) % TABS.length], true);
    else if (e.key === 'Home') setTab(TABS[0], true);
    else if (e.key === 'End') setTab(TABS[TABS.length - 1], true);
    else return;
    e.preventDefault();
  });

  /* ---------- вибір ---------- */
  function select(id) {
    selected = id;
    drawStage();
    renderItem();
    if (id) setTab('item');
  }
  function refocus(sel) {
    const el = panel.querySelector(sel);
    if (el) el.focus({ preventScroll: true });
  }

  /* ---------- дії ---------- */
  function addBalloons() {
    const room = MAX - state.items.length;
    if (room <= 0) {
      MB.toast(`У композиції може бути до ${MAX} кульок`);
      return;
    }
    const count = Math.min(addQty, room);
    const ids = [];
    commit(() => {
      for (let i = 0; i < count; i++) {
        const it = { id: newId(), type: addType, color: addColor[addType] };
        if (addType === 'number') it.char = addChar.number;
        if (addType === 'letter') it.char = addChar.letter;
        state.items.push(it);
        ids.push(it.id);
      }
      popIds = ids.slice();
      if (addType === 'bubble' && count === 1) selected = ids[0];
    });
    if (addType === 'bubble' && count === 1) {
      setTab('item');
      MB.toast('Бабл додано — напишіть на ньому щось');
    }
    if (count < addQty) MB.toast(`Додали ${count}: більше ${MAX} кульок не вміщується`);
  }
  function removeSelected() {
    const it = current();
    if (!it) return;
    commit(() => {
      state.items = state.items.filter((i) => i.id !== it.id);
      selected = null;
    });
    setTab('add');
    MB.toast('Кульку прибрано', { action: 'Повернути', onAction: undo });
  }
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (err) {
        ok = false;
      }
      ta.remove();
      return ok;
    }
  }
  function describe() {
    const lines = [];
    const groups = new Map();
    state.items.forEach((it) => {
      const t = T[it.type];
      const c = MB.art.color(it.color, it.type);
      let base = `${t.name} ${t.size}${t.glyph ? ` «${it.char}»` : ''}, ${c.name.toLowerCase()}`;
      if (it.inner) base += `, з міні-кульками (${MB.art.color(it.inner).name.toLowerCase()})`;
      if (it.text && it.text.value.trim()) {
        const fo = MB.fonts.find((x) => x.id === it.text.font) || MB.fonts[0];
        const tc = MB.textColors.find((x) => x.id === it.text.color) || MB.textColors[0];
        lines.push(`• ${base}, напис «${it.text.value.trim().replace(/\n+/g, ' / ')}» (${fo.name.toLowerCase()}, ${tc.name.toLowerCase()})`);
      } else groups.set(base, (groups.get(base) || 0) + 1);
    });
    groups.forEach((n, base) => lines.push(`• ${base} — ${n} шт`));
    if (state.format === 'box') {
      const bc = MB.boxColors.find((b) => b.id === state.box.color) || MB.boxColors[0];
      lines.push(`• Коробка-сюрприз, ${bc.name.toLowerCase()}${state.box.text.trim() ? `, напис «${state.box.text.trim()}»` : ''}`);
    } else lines.push(`• Грузик: ${state.weight === 'cube' ? 'кубик з бантом' : 'фольговане серце'}`);
    const rb = MB.ribbons.find((r) => r.id === state.ribbon) || MB.ribbons[0];
    lines.push(`• Стрічки: ${rb.name.toLowerCase()}`);
    if (state.hifloat) lines.push('• Обробка Hi-Float');
    return lines;
  }
  function cartNote(calc) {
    const bits = [`${calc.count} ${MB.plural(calc.count, 'кулька', 'кульки', 'кульок')}`];
    if (calc.texts) bits.push(`${calc.texts} ${MB.plural(calc.texts, 'напис', 'написи', 'написів')}`);
    if (state.format === 'box') bits.push('коробка-сюрприз');
    const texts = state.items.filter((i) => i.text && i.text.value.trim()).map((i) => `«${i.text.value.trim().replace(/\n+/g, ' ')}»`);
    return bits.join(', ') + (texts.length ? `: ${texts.join(', ')}` : '');
  }

  async function act(name, el) {
    const it = current();
    switch (name) {
      case 'undo':
        return undo();
      case 'redo':
        return redo();
      case 'add':
        return addBalloons();
      case 'shuffle':
        return commit(
          () => {
            state.seed = 'cz-' + Math.random().toString(36).slice(2, 7);
            state.items.forEach((i) => {
              delete i.pinned;
              delete i.z;
            });
          },
          { full: true }
        );
      case 'clear':
        if (!state.items.length) return;
        commit(() => {
          state.items = [];
          selected = null;
        });
        setTab('add');
        return MB.toast('Сцену очищено', { action: 'Повернути', onAction: undo });
      case 'deselect':
        return select(null);
      case 'dup': {
        if (!it) return;
        if (state.items.length >= MAX) return MB.toast(`У композиції може бути до ${MAX} кульок`);
        const copy = JSON.parse(JSON.stringify(it));
        copy.id = newId();
        delete copy.x;
        delete copy.y;
        delete copy.pinned;
        delete copy.z;
        commit(() => {
          state.items.push(copy);
          popIds = [copy.id];
          selected = copy.id;
        });
        return;
      }
      case 'front': {
        if (!it) return;
        const top = state.items.reduce((m, i) => Math.max(m, i.z || 0), 100000);
        return commit(() => (it.z = top + 1), { layout: false });
      }
      case 'remove':
        return removeSelected();
      case 'cart': {
        const calc = MB.calc(state);
        if (!calc.count) return;
        MB.cart.add({ kind: 'custom', id: 'custom', name: 'Композиція з конструктора', price: calc.total, qty: 1, spec: JSON.parse(JSON.stringify(state)), note: cartNote(calc) });
        return MB.toast('Композицію додано в кошик', { action: 'Оформити', href: 'checkout.html' });
      }
      case 'share': {
        const ok = await copyText(shareUrl());
        return MB.toast(ok ? 'Посилання скопійовано — надішліть його будь-кому' : 'Не вдалося скопіювати посилання');
      }
      case 'direct': {
        const calc = MB.calc(state);
        if (!calc.count) return;
        const text = ['Вітаю! Хочу замовити композицію з конструктора на сайті:', ...describe(), `Орієнтовна ціна: ${MB.money(calc.total)}`, shareUrl()].join('\n');
        const ok = await copyText(text);
        MB.toast(ok ? 'Опис скопійовано — вставте його в повідомлення' : 'Не вдалося скопіювати опис');
        window.open(C.directUrl, '_blank', 'noopener');
        return;
      }
      default:
        return el;
    }
  }

  /* ---------- події панелі ---------- */
  panel.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || !panel.contains(b) || b.getAttribute('role') === 'tab') return;
    const it = current();
    const d = b.dataset;
    if (d.type) {
      addType = d.type;
      addQty = 1;
      renderAdd();
      refocus(`[data-type="${addType}"]`);
      return;
    }
    if (b.classList.contains('sw')) {
      const color = d.color;
      if (d.scope === 'add') {
        addColor[addType] = color;
        renderAdd();
        refocus(`.sw[data-scope="add"][data-color="${color}"]`);
      } else if (d.scope === 'item' && it) {
        commit(() => {
          const before = MB.art.defaultTextColor(it.color, it.type);
          it.color = color;
          if (it.text && it.text.color === before) it.text.color = MB.art.defaultTextColor(color, it.type);
        }, { layout: false });
        refocus(`.sw[data-scope="item"][data-color="${color}"]`);
      } else if (d.scope === 'inner' && it) {
        commit(() => (it.inner = color), { layout: false });
        refocus(`.sw[data-scope="inner"][data-color="${color}"]`);
      } else if (d.scope === 'weight') {
        commit(() => (state.weightColor = color), { layout: false });
        refocus(`.sw[data-scope="weight"][data-color="${color}"]`);
      }
      return;
    }
    if (d.addq) {
      addQty = clamp(addQty + Number(d.addq), 1, 12);
      renderAdd();
      refocus(`[data-addq="${d.addq}"]:not(:disabled)`);
      return;
    }
    if (d.char) {
      if (d.scope === 'add') {
        addChar.number = d.char;
        renderAdd();
        refocus(`.chip-digit[data-char="${d.char}"]`);
      } else if (it) {
        commit(() => (it.char = d.char));
        refocus(`.chip-digit[data-char="${d.char}"]`);
      }
      return;
    }
    if (d.font && it) {
      commit(() => (it.text = Object.assign({ value: '', color: MB.art.defaultTextColor(it.color, it.type) }, it.text, { font: d.font })), { layout: false });
      refocus(`[data-font="${d.font}"]`);
      return;
    }
    if (d.tcolor && it) {
      commit(() => (it.text = Object.assign({ value: '', font: 'script' }, it.text, { color: d.tcolor })), { layout: false });
      refocus(`[data-tcolor="${d.tcolor}"]`);
      return;
    }
    if (d.fmt) {
      if (d.fmt !== state.format) commit(() => (state.format = d.fmt), { full: true });
      refocus(`#pane-decor [data-fmt="${d.fmt}"]`);
      return;
    }
    if (d.boxc) {
      commit(() => (state.box.color = d.boxc), { layout: false });
      refocus(`[data-boxc="${d.boxc}"]`);
      return;
    }
    if (d.weight) {
      commit(() => (state.weight = d.weight), { layout: false });
      refocus(`[data-weight="${d.weight}"]`);
      return;
    }
    if (d.ribbon) {
      commit(() => (state.ribbon = d.ribbon), { layout: false });
      refocus(`[data-ribbon="${d.ribbon}"]`);
      return;
    }
    if (d.act) act(d.act, b);
  });

  panel.addEventListener('input', (e) => {
    const t = e.target;
    const it = current();
    if (t.id === 'it-text' && it) {
      if (!typing) {
        snapshot();
        typing = true;
        renderTools();
      }
      it.text = Object.assign({ font: 'script', color: MB.art.defaultTextColor(it.color, it.type) }, it.text, { value: t.value });
      drawStage();
      renderSummary();
      renderPrice();
      save();
    }
    if (t.id === 'box-text') {
      if (!typing) {
        snapshot();
        typing = true;
        renderTools();
      }
      state.box.text = t.value;
      drawStage();
      renderSummary();
      renderPrice();
      save();
    }
    if (t.dataset.letter) {
      const v = t.value.replace(/[^A-Za-zА-ЯҐЄІЇа-яґєії0-9&]/g, '').slice(0, 1).toLocaleUpperCase('uk');
      t.value = v;
      if (!v) return;
      if (t.dataset.letter === 'add') {
        addChar.letter = v;
        const tile = panel.querySelector('[data-type="letter"] .tile-art');
        if (tile) tile.innerHTML = icon({ type: 'letter', color: addColor.letter, char: v });
      } else if (it) {
        snapshot();
        it.char = v;
        update({ panels: false });
        renderTools();
        renderPrice();
      }
    }
  });
  panel.addEventListener('focusout', (e) => {
    if (e.target.id === 'it-text' || e.target.id === 'box-text') {
      typing = false;
      if (e.target.id === 'it-text') renderItem();
    }
  });
  panel.addEventListener('change', (e) => {
    const t = e.target;
    const it = current();
    if (t.id === 'hifloat') commit(() => (state.hifloat = t.checked), { layout: false });
    if (t.id === 'it-inner' && it) {
      commit(() => {
        if (t.checked) it.inner = 'blush';
        else delete it.inner;
      }, { layout: false });
      refocus('#it-inner');
    }
  });

  /* Стрілки всередині групи кольорів */
  panel.addEventListener('keydown', (e) => {
    const sw = e.target.closest('.sw');
    if (!sw) return;
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const group = Array.from(sw.parentElement.querySelectorAll('.sw'));
    const next = group[(group.indexOf(sw) + keys[e.key] + group.length) % group.length];
    next.click();
  });

  /* ---------- сцена: перетягування й клавіатура ---------- */
  let drag = null;
  function toSvg(x, y) {
    const svg = svgBox.querySelector('svg');
    const m = svg && svg.getScreenCTM();
    if (!m) return { x, y };
    const pt = svg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    return pt.matrixTransform(m.inverse());
  }
  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const g = e.target.closest('.mb-bl');
    if (!g) {
      if (e.target.closest('.cz-svg') && selected) select(null);
      return;
    }
    const id = g.getAttribute('data-id');
    const it = state.items.find((i) => i.id === id);
    if (!it) return;
    const p = toSvg(e.clientX, e.clientY);
    drag = { id, sx: p.x, sy: p.y, ox: it.x, oy: it.y, moved: false, snap: JSON.stringify(state), pid: e.pointerId };
    frozenBox = currentBox();
    stage.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.pid) return;
    const p = toSvg(e.clientX, e.clientY);
    const dx = p.x - drag.sx;
    const dy = p.y - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    const it = state.items.find((i) => i.id === drag.id);
    if (!it) return;
    drag.moved = true;
    stage.classList.add('is-dragging');
    const vb = frozenBox || [0, 0, W, H];
    it.x = clamp(drag.ox + dx, Math.max(24, vb[0] + 24), Math.min(W - 24, vb[0] + vb[2] - 24));
    it.y = clamp(drag.oy + dy, Math.max(24, vb[1] + 24), H - 120);
    it.pinned = true;
    selected = drag.id;
    drawStage();
  });
  function endDrag(e) {
    if (!drag || e.pointerId !== drag.pid) return;
    const d = drag;
    drag = null;
    frozenBox = null;
    stage.classList.remove('is-dragging');
    if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
    if (d.moved) {
      past.push(d.snap);
      future = [];
      hideHint();
      update();
      renderTools();
      setTab('item');
    } else select(d.id);
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  svgBox.addEventListener('focusin', (e) => {
    const g = e.target.closest('.mb-bl');
    if (g) focusId = g.getAttribute('data-id');
  });
  svgBox.addEventListener('focusout', (e) => {
    if (!svgBox.contains(e.relatedTarget)) focusId = null;
  });
  svgBox.addEventListener('keydown', (e) => {
    const g = e.target.closest('.mb-bl');
    if (!g) return;
    const id = g.getAttribute('data-id');
    const it = state.items.find((i) => i.id === id);
    if (!it) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      select(id);
      return;
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      selected = id;
      removeSelected();
      return;
    }
    if (e.key === 'Escape') {
      select(null);
      return;
    }
    const step = e.shiftKey ? 24 : 8;
    const mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (!mv) return;
    e.preventDefault();
    selected = id;
    commit(() => {
      it.x = clamp(it.x + mv[0], 24, W - 24);
      it.y = clamp(it.y + mv[1], 24, H - 120);
      it.pinned = true;
    });
  });

  /* ---------- панель інструментів ---------- */
  const tools = $('.cz-toolbar');
  tools.querySelector('[data-act="undo"]').innerHTML = MB.icon('undo');
  tools.querySelector('[data-act="redo"]').innerHTML = MB.icon('redo');
  tools.querySelector('[data-act="shuffle"]').innerHTML = MB.icon('shuffle');
  tools.querySelector('[data-act="clear"]').innerHTML = MB.icon('trash');
  $('#cz-format').innerHTML = `<button type="button" role="radio" data-fmt="bouquet">Букет</button><button type="button" role="radio" data-fmt="box">Коробка</button>`;
  tools.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.fmt) {
      if (b.dataset.fmt !== state.format) commit(() => (state.format = b.dataset.fmt), { full: true });
      return;
    }
    if (b.dataset.act) act(b.dataset.act, b);
  });
  $('#cz-summary').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (b) act(b.dataset.act, b);
  });
  $('#cz-summary [data-act="share"]').innerHTML = `${MB.icon('link')}<span>Поділитися</span>`;
  $('#cz-summary [data-act="cart"]').innerHTML = `${MB.icon('bag')}<span>В кошик</span>`;

  document.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod || e.altKey) return;
    if (e.target.closest('input, textarea')) return;
    const k = e.key.toLowerCase();
    if (k === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    } else if (k === 'y' || (k === 'z' && e.shiftKey)) {
      e.preventDefault();
      redo();
    }
  });

  /* ---------- фон сцени й підказка ---------- */
  const BGS = [
    { id: 'studio', name: 'Студія' },
    { id: 'blush', name: 'Пудра' },
    { id: 'night', name: 'Вечір' },
  ];
  function setBg(id) {
    stage.dataset.bg = id;
    $$('#cz-bg button').forEach((b) => b.setAttribute('aria-checked', b.dataset.bg === id));
    MB.store.set(BG_KEY, id);
  }
  $('#cz-bg').innerHTML = BGS.map((b) => `<button type="button" role="radio" data-bg="${b.id}" aria-label="Фон: ${b.name}"></button>`).join('');
  $('#cz-bg').addEventListener('click', (e) => {
    const b = e.target.closest('[data-bg]');
    if (b) setBg(b.dataset.bg);
  });
  setBg(BGS.some((b) => b.id === MB.store.get(BG_KEY)) ? MB.store.get(BG_KEY) : 'studio');
  function hideHint() {
    $('#cz-hint').hidden = true;
    MB.store.set(HINT_KEY, 1);
  }
  if (MB.store.get(HINT_KEY)) $('#cz-hint').hidden = true;

  /* ---------- шаблони ---------- */
  $('#cz-templates').innerHTML = MB.templates.map((t) => `<button type="button" class="chip" data-tpl="${t.id}">${esc(t.name)}</button>`).join('');
  $('#cz-templates').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tpl]');
    if (!b) return;
    const t = MB.templates.find((x) => x.id === b.dataset.tpl);
    if (!t) return;
    const spec = t.from ? MB.productSpec(MB.product(t.from)) : t.art;
    commit(() => {
      state = fromSpec(spec);
      selected = null;
    }, { full: true });
    setTab('add');
    MB.toast(t.id === 'empty' ? 'Почнемо з чистої сцени' : `Шаблон «${t.name}» на сцені`, { action: 'Скасувати', onAction: undo });
  });

  /* ---------- старт ---------- */
  function initial() {
    const hash = location.hash.match(/s=([\w-]+)/);
    if (hash) {
      try {
        return sanitize(decode(hash[1]));
      } catch (e) {
        MB.toast('Посилання пошкоджене — відкрили чернетку');
      }
    }
    const from = MB.qs('from');
    if (from && MB.product(from)) {
      let opts = null;
      try {
        opts = JSON.parse(MB.qs('opts') || 'null');
      } catch (e) {
        opts = null;
      }
      const p = MB.product(from);
      return fromSpec(MB.productSpec(p, opts || MB.productDefaults(p)));
    }
    if (MB.qs('text') != null) return fromSpec(MB.heroSpec(MB.qs('text') || 'З днем народження!', MB.qs('palette')));
    const draft = MB.store.get(DRAFT_KEY, null);
    if (draft && Array.isArray(draft.items)) return sanitize(draft);
    return fromSpec(MB.heroSpec('З днем народження!', 'pudra'));
  }

  /* Посилання на композицію відкрили в тій самій вкладці */
  window.addEventListener('hashchange', () => {
    const m = location.hash.match(/s=([\w-]+)/);
    if (!m) return;
    let next = null;
    try {
      next = sanitize(decode(m[1]));
    } catch (e) {
      MB.toast('Посилання пошкоджене');
    }
    history.replaceState(null, '', location.pathname);
    if (!next) return;
    const positioned = next.items.every((i) => Number.isFinite(i.x));
    commit(() => {
      state = next;
      selected = null;
    }, positioned ? { layout: false } : { full: true });
    MB.toast('Композицію з посилання відкрито', { action: 'Скасувати', onAction: undo });
  });

  state = initial();
  if (location.search || location.hash) history.replaceState(null, '', location.pathname);
  if (!state.items.every((i) => Number.isFinite(i.x))) relayout(true);
  update({ layout: false });
  renderTools();
  setTab('add');
  MB.fontsReady.then(() => {
    drawStage();
    renderPanels();
  });
  let resizeRaf = 0;
  new ResizeObserver(() => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      if (!drag) drawStage();
    });
  }).observe(svgBox);
})(window.MB);
