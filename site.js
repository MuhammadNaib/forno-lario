/* ============================================================================
   Forno Lario · page behaviour
   ----------------------------------------------------------------------------
   REBRAND HERE: the shop name, the WhatsApp number orders go to, currency and
   pickup hours. Menu items are read from the "Add to order" buttons in
   index.html (data-id, data-name, data-price), so the menu lives in one place.
   ========================================================================== */
var SHOP = {
  name: 'Forno Lario',
  whatsapp: '390341000000',        // international format, digits only
  currency: '€',
  pickup: { open: '18:30', close: '22:30', stepMinutes: 15 },
  storageKey: 'forno-lario:comanda'
};

(function () {
  'use strict';

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Under reduced motion the rail is a sideways scroll region, so it needs no
  // vertical travel of its own: shorten its pin before the engine measures it.
  if (reduce) { var cartaAct = document.getElementById('menu'); if (cartaAct) cartaAct.setAttribute('data-sc-span', '1.2'); }
  var sc = ScrollCraft.mount(document.body);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* -------------------------------------------------------------- menu -- */
  var MENU = {};
  $$('.add').forEach(function (b) {
    MENU[b.dataset.id] = { id: b.dataset.id, name: b.dataset.name, price: parseFloat(b.dataset.price) };
  });

  /* ------------------------------------------------------------- state -- */
  var order = {};   // id -> qty, in the order lines were first added
  try {
    var saved = JSON.parse(localStorage.getItem(SHOP.storageKey) || '{}');
    Object.keys(saved).forEach(function (k) { if (MENU[k] && saved[k] > 0) order[k] = Math.min(20, saved[k] | 0); });
  } catch (e) { /* private mode: the slip just starts empty */ }
  function save() { try { localStorage.setItem(SHOP.storageKey, JSON.stringify(order)); } catch (e) {} }

  var money = function (n) { return SHOP.currency + (Math.round(n * 100) / 100).toString(); };
  function totals() {
    var count = 0, total = 0;
    Object.keys(order).forEach(function (k) { count += order[k]; total += order[k] * MENU[k].price; });
    return { count: count, total: total };
  }

  /* ------------------------------------------------------------ render -- */
  var lines = $('.js-lines'), empty = $('.js-empty');
  var send = $('.send'), clear = $('.clear'), pill = $('.pill'), ticker = $('.js-ticker');

  function render(stampId) {
    var t = totals();
    lines.innerHTML = '';
    Object.keys(order).forEach(function (k) {
      var it = MENU[k], li = document.createElement('li');
      li.innerHTML =
        '<span class="slip__qty">' + order[k] + '×</span>' +
        '<span class="slip__name"></span>' +
        '<span class="slip__sum">' + money(order[k] * it.price) + '</span>' +
        '<button type="button" class="slip__x" aria-label="Remove one ' + it.name + '">−</button>';
      li.querySelector('.slip__name').textContent = it.name;
      li.querySelector('.slip__x').addEventListener('click', function () { change(k, -1); });
      if (k === stampId) li.classList.add('is-stamped');
      lines.appendChild(li);
    });
    empty.hidden = t.count > 0;
    $$('.js-count').forEach(function (n) { n.textContent = t.count; });
    $$('.js-total').forEach(function (n) { n.textContent = money(t.total); });
    send.disabled = clear.disabled = t.count === 0;
    pill.hidden = t.count === 0;
    $$('.add').forEach(function (b) {
      var q = order[b.dataset.id];
      if (q) b.setAttribute('data-qty', q); else b.removeAttribute('data-qty');
      b.setAttribute('aria-label', 'Add ' + b.dataset.name + ' to order' + (q ? ', ' + q + ' on the slip' : ''));
    });
  }

  function change(id, delta) {
    var q = (order[id] || 0) + delta;
    if (q <= 0) delete order[id]; else order[id] = Math.min(20, q);
    save();
    render(delta > 0 ? id : null);
    if (delta > 0) {
      ticker.textContent = '+ ' + MENU[id].name;
      ticker.classList.remove('is-stamped'); void ticker.offsetWidth; ticker.classList.add('is-stamped');
    }
  }

  $$('.add').forEach(function (b) { b.addEventListener('click', function () { change(b.dataset.id, 1); }); });
  clear.addEventListener('click', function () { order = {}; save(); ticker.textContent = ''; render(); });

  /* ---------------------------------------------------- slip furniture -- */
  $('.js-date').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  (function times() {
    var sel = $('.js-times'), p = SHOP.pickup;
    var toMin = function (s) { var a = s.split(':'); return +a[0] * 60 + +a[1]; };
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var now = new Date(), nowMin = now.getHours() * 60 + now.getMinutes() + 20;
    var start = toMin(p.open), end = toMin(p.close);
    var asap = document.createElement('option'); asap.value = 'as soon as possible'; asap.textContent = 'ASAP';
    sel.appendChild(asap);
    for (var m = start; m <= end; m += p.stepMinutes) {
      if (nowMin > start && m < nowMin && nowMin <= end) continue;
      var o = document.createElement('option'), v = pad(Math.floor(m / 60)) + ':' + pad(m % 60);
      o.value = o.textContent = v; sel.appendChild(o);
    }
  })();

  /* ----------------------------------------------------------- send it -- */
  $('#slip').addEventListener('submit', function (e) {
    e.preventDefault();
    var t = totals(); if (!t.count) return;
    var f = e.target, name = f.name.value.trim(), time = f.time.value, notes = f.notes.value.trim();
    var msg = ['Hello ' + SHOP.name + ', I would like to order for pickup (' + time + '):', ''];
    Object.keys(order).forEach(function (k) { msg.push(order[k] + ' × ' + MENU[k].name + '  ' + money(order[k] * MENU[k].price)); });
    msg.push('', 'Total ' + money(t.total));
    if (name) msg.push('Name: ' + name);
    if (notes) msg.push('Notes: ' + notes);
    window.open('https://wa.me/' + SHOP.whatsapp + '?text=' + encodeURIComponent(msg.join('\n')), '_blank', 'noopener');
  });

  /* ------------------------------------------------------- dock the pill
     When the order slip comes into view the floating slip flies into it and
     fades, so the two read as the same piece of paper. */
  var slip = $('#slip');
  function dock(on) {
    if (on) {
      var a = pill.getBoundingClientRect(), b = slip.getBoundingClientRect();
      if (!reduce && a.width) {
        var dx = (b.left + b.width / 2) - (a.left + a.width / 2);
        var dy = (b.top + b.height * 0.35) - (a.top + a.height / 2);
        pill.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0) scale(1.25) rotate(-1.2deg)';
      }
      pill.classList.add('is-docked');
    } else {
      pill.style.transform = '';
      pill.classList.remove('is-docked');
    }
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (en) { dock(en.isIntersecting); }); },
      { threshold: 0.35 }).observe(slip);
  }

  /* ------------------------------------------------------------- jumps
     The nav is an index of the pizzas. A pizza on the rail lives inside a
     pinned pan act, so its scroll position is computed from the rail travel. */
  function actOf(el) { return el.closest('[data-sc-act]'); }
  function docTop(el) { return el.getBoundingClientRect().top + scrollY; }
  function jump(id) {
    var el = document.getElementById(id); if (!el) return;
    var vh = innerHeight, vw = innerWidth, y;
    var act = actOf(el);
    var behavior = reduce ? 'auto' : 'smooth';
    if (id === 'p1') {
      y = docTop(act) + (act.offsetHeight - vh) * 0.88;
    } else if (el.classList.contains('dish')) {
      var rail = el.parentElement;
      var over = rail.scrollWidth - vw, extra = over * (parseFloat(rail.dataset.scPan) || 0);
      var want = el.offsetLeft + el.offsetWidth / 2 - vw / 2;
      if (reduce) {
        scrollTo({ top: docTop(act), behavior: 'auto' });
        rail.parentElement.scrollTo({ left: Math.max(0, want), behavior: 'auto' });
        return;
      }
      var p = Math.max(0, Math.min(1, want / Math.max(over + extra, 1)));
      y = docTop(act) + (act.offsetHeight - vh) * p;
    } else if (act && act.dataset.scAct === 'pin' && id === 'oven') {
      y = docTop(act) + (act.offsetHeight - vh) * 0.3;
    } else if (id === 'order') {
      y = docTop(act);
    } else if (id === 'top') {
      y = 0;
    } else {
      y = docTop(el) - parseFloat(getComputedStyle(document.documentElement).fontSize) * 3.5;
    }
    scrollTo({ top: Math.round(y), behavior: behavior });
  }
  $$('[data-jump]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var d = a.closest('details'); if (d) d.open = false;
      jump(a.dataset.jump);
      if (a.dataset.jump === 'order') setTimeout(function () { var i = slip.querySelector('input'); if (i) i.focus({ preventScroll: true }); }, reduce ? 50 : 900);
    });
  });
  document.addEventListener('click', function (e) {
    var d = $('.index'); if (d.open && !d.contains(e.target)) d.open = false;
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var d = $('.index'); if (d.open) { d.open = false; d.querySelector('summary').focus(); } } });

  render();
  if (location.hash) setTimeout(function () { jump(location.hash.slice(1)); }, 60);
})();
