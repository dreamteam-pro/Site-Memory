/* SITE MEMORY AI — маршрутизация, навигация, моушн */

(function (SM) {
  const el = SM.el, $ = SM.$, $$ = SM.$$;
  document.documentElement.classList.add('js');

  const view   = $('#view');
  const nav    = $('#nav');
  const menu   = $('#menu');
  const burger = $('#burger');
  const wipe   = $('#wipe');

  const ROUTES = ['home', 'scan', 'memory', 'studio', 'world', 'community', 'about'];
  let current = null, stops = [];

  SM.route = function (name) {
    if (location.hash.slice(1) === name) { paint(); return; }
    location.hash = name;
  };

  function parse() {
    const h = decodeURIComponent(location.hash.slice(1) || 'home');
    if (h.indexOf('world-') === 0) return { r: 'world', id: h.slice(6) };
    if (h.indexOf('community-') === 0) return { r: 'community', id: h.slice(10) };
    if (h.indexOf('about-') === 0) return { r: 'about', anchor: h };
    return { r: ROUTES.indexOf(h) > -1 ? h : 'home' };
  }

  /* ----------------------------------------------------------- отрисовка */
  function build(p) {
    if (p.r === 'world' && p.id) return SM.views.worldDetail(p.id);
    if (p.r === 'community' && p.id) return SM.views.communityDetail(p.id);
    return SM.views[p.r] ? SM.views[p.r]() : SM.views.home();
  }

  function paint() {
    const p = parse();
    stops.forEach(s => { try { s(); } catch (e) {} });
    stops = [];
    SM.clear(view);
    view.appendChild(build(p));
    current = p.r;

    $$('.nav__links a').forEach(a => a.classList.toggle('is-on', a.dataset.route === p.r));
    document.title = ({
      home: 'Site Memory AI', scan: 'Scan & Identify — Site Memory AI',
      memory: 'Memory View — Site Memory AI', studio: 'AI Design Studio — Site Memory AI',
      world: 'World Architecture — Site Memory AI', community: 'Community Hub — Site Memory AI',
      about: 'О проекте — Site Memory AI'
    })[p.r] || 'Site Memory AI';

    SM.drawPlates(view);
    $$('canvas[data-contours]', view).forEach(cv => {
      stops.push(SM.contours(cv, { dark: cv.dataset.contours === 'dark' }));
    });
    reveal(view);
    journey();

    if (p.anchor) {
      const t = document.getElementById(p.anchor);
      if (t) { setTimeout(() => t.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); return; }
    }
    window.scrollTo(0, 0);
    view.focus({ preventScroll: true });
  }

  function go() {
    closeMenu();
    SM.closeSheet();
    if (SM.reduced) { paint(); return; }
    wipe.classList.remove('is-out'); wipe.classList.add('is-in');
    setTimeout(() => {
      paint();
      wipe.classList.remove('is-in'); wipe.classList.add('is-out');
      setTimeout(() => wipe.classList.remove('is-out'), 640);
    }, 330);
  }

  /* --------------------------------------------------------- проявление */
  let io = null;
  function reveal(root) {
    const items = $$('.rv, .rv-l, .flow__s', root);
    if (!items.length) return;
    if (!io) {
      io = new IntersectionObserver(es => {
        es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    }
    items.forEach(i => io.observe(i));
    // страховка: ничего не остаётся невидимым дольше полутора секунд
    setTimeout(() => items.forEach(i => i.classList.add('in')), 1600);
  }

  /* ------------------------------------------------------- маршрут объекта */
  function journey() {
    const bar = $('#journey');
    const p = SM.project;
    if (!p) { bar.hidden = true; return; }
    bar.hidden = false;
    const order = ['present', 'past', 'future', 'share'];
    let nowSet = false;
    order.forEach(k => {
      const li = bar.querySelector('[data-step="' + k + '"]');
      if (!li) return;
      li.classList.remove('is-done', 'is-now');
      if (p.done[k]) li.classList.add('is-done');
      else if (!nowSet) { li.classList.add('is-now'); nowSet = true; }
    });
  }
  SM.onChange(journey);

  $('#journeyClear').addEventListener('click', () => {
    SM.dropProject();
    SM.toast('Объект сброшен');
    paint();
  });

  /* ---------------------------------------------------------------- меню */
  function openMenu() { menu.hidden = false; burger.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; }
  function closeMenu() { menu.hidden = true; burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
  burger.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
  menu.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });

  /* -------------------------------------------------------------- панель */
  $('#sheet').addEventListener('click', e => { if (e.target.hasAttribute('data-close')) SM.closeSheet(); });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!$('#sheet').hidden) SM.closeSheet();
    else if (!menu.hidden) closeMenu();
  });

  /* ------------------------------------------------------ липкая шапка */
  let lastY = -1;
  function onScroll() {
    const y = window.scrollY;
    if ((y > 8) !== (lastY > 8)) nav.classList.toggle('is-stuck', y > 8);
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------- стрелки для галерей-лент */
  document.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const rail = e.target.closest ? e.target.closest('.rail') : null;
    if (!rail) return;
    rail.scrollBy({ left: e.key === 'ArrowRight' ? 340 : -340, behavior: 'smooth' });
  });

  /* ------------------------------------------------------------- запуск */
  window.addEventListener('hashchange', go);
  paint();

  /* предупреждение о переполнении хранилища — один раз */
  SM.onChange(() => {
    if (SM.storageWarn && !SM._warned) {
      SM._warned = true;
      SM.toast('Снимок слишком большой для памяти браузера: объект сохранён только до перезагрузки страницы');
    }
  });

})(window.SM);
