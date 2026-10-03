/* MI ballloons — оформлення замовлення */
(function (MB) {
  'use strict';

  const $ = MB.$;
  const $$ = MB.$$;
  const esc = MB.esc;
  const C = MB.config;
  const root = $('#co');

  const SLOTS = ['07:00–09:00', '09:00–11:00', '11:00–13:00', '13:00–15:00', '15:00–17:00', '17:00–19:00', '19:00–21:00', '21:00–23:30'];
  const MESSENGERS = [
    { id: 'telegram', name: 'Telegram' },
    { id: 'viber', name: 'Viber' },
    { id: 'instagram', name: 'Instagram' },
    { id: 'call', name: 'Дзвінок' },
  ];
  const DRAFT = 'mb-checkout-v1';
  const draft = MB.store.get(DRAFT, {});

  function today() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }
  function deliveryCost(subtotal, method) {
    if (method === 'pickup') return 0;
    if (C.freeDeliveryFrom && subtotal >= C.freeDeliveryFrom) return 0;
    return C.deliveryFrom;
  }

  /* ---------- форма ---------- */
  function form() {
    const d = draft;
    const method = d.method || 'delivery';
    const msg = d.messenger || 'telegram';
    return `
    <form class="co-form" id="co-form" novalidate>
      <fieldset class="co-sec">
        <legend class="co-legend"><span class="co-n" aria-hidden="true">1</span>Контакти</legend>
        <div class="co-fields">
          <div class="field">
            <label for="co-name">Імʼя та прізвище</label>
            <input class="input" id="co-name" name="name" autocomplete="name" required value="${esc(d.name || '')}">
            <p class="field-error">Вкажіть, як до вас звертатися</p>
          </div>
          <div class="field">
            <label for="co-phone">Телефон</label>
            <input class="input" id="co-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+380 XX XXX XX XX" required value="${esc(d.phone || '')}">
            <p class="field-error" id="co-phone-err">Вкажіть номер у форматі +380 XX XXX XX XX</p>
          </div>
        </div>
        <div class="field">
          <p class="label" id="co-msg-label">Як з вами звʼязатися для підтвердження</p>
          <div class="chips" role="radiogroup" aria-labelledby="co-msg-label">${MESSENGERS.map(
            (m) => `<label class="chip"><input type="radio" name="messenger" value="${m.id}"${m.id === msg ? ' checked' : ''}>${esc(m.name)}</label>`
          ).join('')}</div>
        </div>
      </fieldset>

      <fieldset class="co-sec">
        <legend class="co-legend"><span class="co-n" aria-hidden="true">2</span>Отримання</legend>
        <div class="co-options">
          <label class="co-opt"><input type="radio" name="method" value="delivery"${method === 'delivery' ? ' checked' : ''}>
            <span class="co-opt-ico">${MB.icon('truck')}</span>
            <span><strong>Доставка</strong><span class="hint">${esc(C.deliveryArea)}, від ${MB.money(C.deliveryFrom)}${C.freeDeliveryFrom ? `, від ${MB.money(C.freeDeliveryFrom)} — безкоштовно` : ''}</span></span>
          </label>
          <label class="co-opt"><input type="radio" name="method" value="pickup"${method === 'pickup' ? ' checked' : ''}>
            <span class="co-opt-ico">${MB.icon('store')}</span>
            <span><strong>Самовивіз</strong><span class="hint">Магазин на Позняках, безкоштовно</span></span>
          </label>
        </div>
        <div class="co-delivery" id="co-delivery">
          <div class="field">
            <label for="co-address">Адреса доставки</label>
            <input class="input" id="co-address" name="address" autocomplete="street-address" placeholder="Вулиця, будинок" value="${esc(d.address || '')}">
            <p class="field-error">Вкажіть вулицю й номер будинку</p>
          </div>
          <div class="co-fields">
            <div class="field">
              <label for="co-flat">Квартира, підʼїзд, поверх</label>
              <input class="input" id="co-flat" name="flat" autocomplete="address-line2" value="${esc(d.flat || '')}">
            </div>
            <div class="field">
              <label for="co-recipient">Телефон отримувача <span class="hint">якщо це не ви</span></label>
              <input class="input" id="co-recipient" name="recipient" type="tel" inputmode="tel" placeholder="+380 XX XXX XX XX" value="${esc(d.recipient || '')}">
            </div>
          </div>
          <label class="check"><input type="checkbox" name="surprise"${d.surprise ? ' checked' : ''}><span>Це сюрприз — не телефонуйте отримувачу заздалегідь</span></label>
        </div>
        <p class="hint co-pickup" id="co-pickup" hidden>${MB.icon('pin')}Адресу магазину надішлемо разом із підтвердженням. Повідомимо, коли замовлення буде готове.</p>
      </fieldset>

      <fieldset class="co-sec">
        <legend class="co-legend"><span class="co-n" aria-hidden="true">3</span>Дата й час</legend>
        <div class="co-fields">
          <div class="field">
            <label for="co-date">Дата</label>
            <input class="input" id="co-date" name="date" type="date" min="${today()}" required value="${esc(d.date && d.date >= today() ? d.date : today())}">
            <p class="field-error">Оберіть дату, не раніше сьогодні</p>
          </div>
          <div class="field">
            <label for="co-slot">Час</label>
            <select class="select" id="co-slot" name="slot" required>
              ${SLOTS.map((s) => `<option${s === d.slot ? ' selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
        </div>
        <p class="hint">Працюємо щодня з ${C.hours}. Якщо потрібен точний час — напишіть у коментарі.</p>
      </fieldset>

      <fieldset class="co-sec">
        <legend class="co-legend"><span class="co-n" aria-hidden="true">4</span>Оплата й побажання</legend>
        <label class="co-opt co-opt-single"><input type="radio" name="payment" value="fop" checked>
          <span class="co-opt-ico">${MB.icon('card')}</span>
          <span><strong>${esc(C.payment)}</strong><span class="hint">Після підтвердження менеджер надішле реквізити. Оплатити можна з будь-якого банку.</span></span>
        </label>
        <div class="field">
          <label for="co-comment">Коментар до замовлення</label>
          <textarea class="textarea" id="co-comment" name="comment" rows="3" placeholder="Наприклад, підписати листівку чи зателефонувати за 30 хвилин">${esc(d.comment || '')}</textarea>
        </div>
      </fieldset>

      <div class="co-submit">
        <button class="btn btn-ink btn-block co-btn" type="submit">Підтвердити замовлення</button>
        <p class="note">Оплата — лише після того, як менеджер підтвердить деталі та наявність кольорів.</p>
      </div>
    </form>`;
  }

  function summary() {
    const items = MB.cart.items();
    const sub = MB.cart.total();
    const method = (document.querySelector('input[name="method"]:checked') || {}).value || draft.method || 'delivery';
    const del = deliveryCost(sub, method);
    return `
      <h2 class="co-sum-title">Ваше замовлення</h2>
      <ul class="clines">${items.map((l) => MB.lineRow(l)).join('')}</ul>
      <dl class="co-totals">
        <div><dt>Товари</dt><dd>${MB.money(sub)}</dd></div>
        <div><dt>${method === 'pickup' ? 'Самовивіз' : 'Доставка'}</dt><dd>${method === 'pickup' || del === 0 ? 'безкоштовно' : `від ${MB.money(del)}`}</dd></div>
        <div class="co-total"><dt>Разом</dt><dd>${MB.money(sub + del)}</dd></div>
      </dl>
      ${method !== 'pickup' && del > 0 ? '<p class="note">Точну вартість доставки менеджер назве при підтвердженні — вона залежить від району.</p>' : ''}`;
  }

  function emptyState() {
    root.innerHTML = `<div class="empty empty-wide">
      <div class="empty-art">${MB.art.render({ format: 'single', items: [{ id: 'e', type: 'latex12', color: 'blush' }] }, { fit: true, aspect: 1, pad: 10 })}</div>
      <p class="empty-title">У кошику поки порожньо</p>
      <p class="empty-text">Оберіть готову композицію або зберіть свою в конструкторі.</p>
      <div class="empty-cta"><a class="btn btn-ghost" href="catalog.html">До каталогу</a><a class="btn btn-ink" href="constructor.html">Відкрити конструктор</a></div>
    </div>`;
  }

  function draw() {
    if (!MB.cart.count()) {
      emptyState();
      return;
    }
    root.innerHTML = `<div class="co-grid">${form()}<aside class="co-sum" id="co-sum" aria-label="Підсумок замовлення">${summary()}</aside></div>`;
    bind();
    toggleMethod();
  }

  function refreshSummary() {
    const box = $('#co-sum');
    if (!box) return;
    if (!MB.cart.count()) {
      draw();
      return;
    }
    box.innerHTML = summary();
  }

  /* ---------- перевірка телефону ---------- */
  function normPhone(v) {
    let d = String(v || '').replace(/\D/g, '');
    if (d.length === 10 && d[0] === '0') d = '38' + d;
    if (d.length === 9) d = '380' + d;
    return d.length === 12 && d.startsWith('380') ? d : null;
  }
  function prettyPhone(d) {
    return `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10)}`;
  }
  function checkPhone(input, required) {
    const v = input.value.trim();
    if (!v) {
      input.setCustomValidity(required ? 'Вкажіть номер телефону' : '');
      return;
    }
    const n = normPhone(v);
    input.setCustomValidity(n ? '' : 'Номер має бути у форматі +380 XX XXX XX XX');
  }

  function toggleMethod() {
    const m = (document.querySelector('input[name="method"]:checked') || {}).value;
    const del = $('#co-delivery');
    const pick = $('#co-pickup');
    if (!del) return;
    del.hidden = m === 'pickup';
    pick.hidden = m !== 'pickup';
    $('#co-address').required = m !== 'pickup';
  }

  function collect(f) {
    const data = Object.fromEntries(new FormData(f).entries());
    data.surprise = !!f.elements.surprise && f.elements.surprise.checked;
    return data;
  }

  function bind() {
    const f = $('#co-form');
    f.addEventListener('change', (e) => {
      if (e.target.name === 'method') {
        toggleMethod();
        refreshSummary();
      }
      MB.store.set(DRAFT, collect(f));
    });
    f.addEventListener('input', (e) => {
      if (e.target.id === 'co-phone') checkPhone(e.target, true);
      if (e.target.id === 'co-recipient') checkPhone(e.target, false);
    });
    f.addEventListener('focusout', (e) => {
      if (e.target.id === 'co-phone' || e.target.id === 'co-recipient') {
        const n = normPhone(e.target.value);
        if (n) e.target.value = prettyPhone(n);
      }
      MB.store.set(DRAFT, collect(f));
      syncAria(f);
    });
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      checkPhone($('#co-phone'), true);
      checkPhone($('#co-recipient'), false);
      if (!f.checkValidity()) {
        syncAria(f);
        const bad = f.querySelector(':invalid');
        if (bad) bad.focus();
        f.reportValidity();
        return;
      }
      submit(collect(f));
    });
  }
  function syncAria(f) {
    $$('input, select, textarea', f).forEach((el) => {
      if (el.matches(':user-invalid')) el.setAttribute('aria-invalid', 'true');
      else el.removeAttribute('aria-invalid');
    });
  }

  /* ---------- підтвердження ---------- */
  function orderText(no, data, items, sub, del) {
    const msg = MESSENGERS.find((m) => m.id === data.messenger);
    const lines = [`Замовлення ${no}`, ''];
    items.forEach((l) => {
      lines.push(`• ${l.name} × ${l.qty} — ${MB.money(l.price * l.qty)}`);
      const note = MB.lineNote(l);
      if (note) lines.push(`  ${note}`);
    });
    lines.push('', `Разом: ${MB.money(sub + del)}${data.method !== 'pickup' && del ? ' (доставка орієнтовно)' : ''}`);
    lines.push(`Імʼя: ${data.name}`, `Телефон: ${data.phone}`, `Звʼязок: ${msg ? msg.name : ''}`);
    if (data.method === 'pickup') lines.push('Отримання: самовивіз, Позняки');
    else {
      lines.push(`Доставка: ${data.address}${data.flat ? ', ' + data.flat : ''}`);
      if (data.recipient) lines.push(`Телефон отримувача: ${data.recipient}`);
      if (data.surprise) lines.push('Сюрприз — не телефонувати отримувачу заздалегідь');
    }
    lines.push(`Дата: ${data.date}, ${data.slot}`);
    if (data.comment) lines.push(`Коментар: ${data.comment}`);
    return lines.join('\n');
  }

  function submit(data) {
    const items = MB.cart.items();
    const sub = MB.cart.total();
    const del = deliveryCost(sub, data.method);
    const now = new Date();
    const no = `MB-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`;
    const text = orderText(no, data, items, sub, del);
    /* ЗАМІНИТИ: тут замовлення треба надсилати на сервер, у Telegram-бот чи CRM. Поки що зберігаємо локально. */
    const orders = MB.store.get('mb-orders', []);
    orders.push({ no, at: now.toISOString(), data, items, total: sub + del });
    MB.store.set('mb-orders', orders.slice(-20));
    MB.store.set(DRAFT, { name: data.name, phone: data.phone, messenger: data.messenger, method: data.method, address: data.address, flat: data.flat });
    MB.cart.clear();
    const msg = MESSENGERS.find((m) => m.id === data.messenger);
    $('#co-title').textContent = 'Замовлення прийнято';
    document.title = `Замовлення ${no} — ${C.brand}`;
    root.innerHTML = `<section class="co-done" aria-live="polite">
      <div class="co-done-art">${MB.art.render(
        {
          format: 'bouquet',
          seed: 'done',
          ribbon: 'pink',
          weight: 'heart',
          weightColor: 'foil-pink',
          items: [
            { id: 'd0', type: 'bubble', color: 'clear', text: { value: 'Дякуємо!', font: 'script', color: 'rose' } },
            { id: 'd1', type: 'latex12', color: 'blush', n: 3 },
            { id: 'd2', type: 'latex12', color: 'pearl-white', n: 2 },
            { id: 'd3', type: 'latex12', color: 'chrome-rose', n: 2 },
          ],
        },
        { fit: true, aspect: 0.9, pad: 10, label: 'Букет з написом «Дякуємо!»' }
      )}</div>
      <div class="co-done-copy">
        <p class="tag">Номер замовлення ${esc(no)}</p>
        <h2>Дякуємо за замовлення!</h2>
        <p>Менеджер звʼяжеться з вами ${msg && msg.id !== 'call' ? `у ${esc(msg.name)}` : 'телефоном'}, щоб підтвердити кольори, час і надіслати реквізити для оплати.</p>
        <p class="hint">Хочете швидше? Надішліть замовлення нам у Direct — текст уже готовий.</p>
        <div class="co-done-cta">
          <button class="btn btn-ink" type="button" id="co-direct">${MB.icon('instagram')}Надіслати в Direct</button>
          <button class="btn btn-ghost" type="button" id="co-copy">${MB.icon('copy')}Скопіювати замовлення</button>
        </div>
        <details class="pp-details"><summary>Текст замовлення</summary><pre class="co-text" tabindex="0">${esc(text)}</pre></details>
        <a class="pp-edit" href="index.html">${MB.icon('back')}Повернутися на головну</a>
      </div>
    </section>`;
    const copy = async () => {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        return false;
      }
    };
    $('#co-copy').addEventListener('click', async () => MB.toast((await copy()) ? 'Замовлення скопійовано' : 'Не вдалося скопіювати — виділіть текст нижче'));
    $('#co-direct').addEventListener('click', async () => {
      const ok = await copy();
      MB.toast(ok ? 'Текст скопійовано — вставте його в повідомлення' : 'Скопіюйте текст замовлення нижче');
      window.open(C.directUrl, '_blank', 'noopener');
    });
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  draw();
  window.addEventListener('mb:cart', refreshSummary);
  MB.fontsReady.then(() => {
    if ($('#co-sum')) refreshSummary();
  });
})(window.MB);
