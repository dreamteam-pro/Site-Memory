/* SITE MEMORY AI — ядро: состояние, DOM-хелперы, слой ИИ и база сообщества */

window.SM = (function () {
  const SM = {};

  /* ------------------------------------------------------------ DOM-хелперы */
  function el(tag, attrs, kids) {
    const parts = tag.split('.');
    const n = document.createElement(parts[0] || 'div');
    if (parts.length > 1) n.className = parts.slice(1).join(' ');
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') n.className = n.className ? n.className + ' ' + v : v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'html') n.innerHTML = v;              // только для своей вёрстки
      else if (k === 'style') n.setAttribute('style', v);
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v);
      else if (v === true) n.setAttribute(k, '');
      else n.setAttribute(k, v);
    }
    add(n, kids);
    return n;
  }
  function add(parent, kids) {
    if (kids === null || kids === undefined || kids === false) return parent;
    if (Array.isArray(kids)) { kids.forEach(k => add(parent, k)); return parent; }
    parent.appendChild(kids instanceof Node ? kids : document.createTextNode(String(kids)));
    return parent;
  }
  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); return n; }

  SM.el = el; SM.add = add; SM.$ = $; SM.$$ = $$; SM.clear = clear;

  /* SVG-иконки собственной отрисовки */
  SM.ico = function (name, size) {
    const s = size || 18;
    const P = {
      up:    'M12 16V4M6 10l6-6 6 6M4 20h16',
      cam:   'M3 8h4l2-3h6l2 3h4v12H3z M12 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
      search:'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3',
      arrow: 'M4 12h16M14 6l6 6-6 6',
      left:  'M20 12H4M10 6l-6 6 6 6',
      layers:'M12 3 2 8l10 5 10-5-10-5z M2 16l10 5 10-5 M2 12l10 5 10-5',
      clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
      leaf:  'M4 20c0-8 6-14 16-14 0 10-6 15-16 14z M4 20c3-4 6-6 10-8',
      globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M3 12h18 M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18',
      users: 'M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 20v-2a4 4 0 0 0-3-3.9',
      dna:   'M5 3c0 6 14 6 14 12M19 3c0 6-14 6-14 12M5 21h14M5 3h14 M7 8h10 M7 16h10',
      plus:  'M12 5v14M5 12h14',
      check: 'M4 12.5 9 17.5 20 6.5'
    };
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', s); svg.setAttribute('height', s);
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '1.4');
    svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    (P[name] || P.arrow).split(' M').forEach((d, i) => {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', (i ? 'M' : '') + d);
      svg.appendChild(p);
    });
    return svg;
  };

  /* --------------------------------------------------------------- уведомления */
  let toastT = null;
  SM.toast = function (msg) {
    const t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 4200);
  };

  /* ------------------------------------------------------------------ панель */
  SM.sheet = function (title, buildBody) {
    const s = $('#sheet'), b = $('#sheetBody');
    $('#sheetTitle').textContent = title;
    clear(b); add(b, buildBody());
    s.hidden = false;
    document.body.style.overflow = 'hidden';
    const first = b.querySelector('input,button,textarea,select');
    if (first) setTimeout(() => first.focus(), 60);
  };
  SM.closeSheet = function () {
    const s = $('#sheet'); if (!s || s.hidden) return;
    s.hidden = true; document.body.style.overflow = '';
  };

  /* ------------------------------------------------------------- возможности */
  const capCache = {};
  function cap(name) {
    if (!capCache[name]) {
      capCache[name] = (async () => {
        try {
          if (!window.claude || typeof window.claude.use !== 'function') return null;
          return await window.claude.use(name);
        } catch (e) { return null; }
      })();
    }
    return capCache[name];
  }
  SM.cap = cap;

  /* ------------------------------------------------------------- хранилище */
  const KEY = 'sitememory.project.v1';
  function load() {
    try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; }
    catch (e) { return null; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(SM.project)); SM.storageWarn = false; }
    catch (e) { SM.storageWarn = true; }
  }

  /* -------------------------------------------------------------- проект */
  SM.project = load() || null;
  SM.listeners = [];
  SM.onChange = fn => SM.listeners.push(fn);
  SM.emit = () => SM.listeners.forEach(f => { try { f(); } catch (e) {} });

  SM.newProject = function (photo, meta) {
    SM.project = {
      id: 'p' + Date.now().toString(36),
      photo: photo,              // dataURL (уменьшённая копия)
      w: meta.w, h: meta.h,
      name: meta.name || '',
      location: meta.location || '',
      local: null,               // локальные измерения изображения
      ai: null,                  // ответ модели по объекту
      history: null,             // исторический контекст
      archive: null,             // загруженный архивный снимок (dataURL)
      compare: null,             // сравнение двух снимков
      brief: null,               // параметры из студии
      concepts: null,            // концепции
      sketch: null,              // эскиз-наложение (dataURL)
      done: { present: false, past: false, future: false, share: false }
    };
    save(); SM.emit();
    return SM.project;
  };
  SM.patch = function (obj) {
    if (!SM.project) return;
    Object.assign(SM.project, obj); save(); SM.emit();
  };
  SM.mark = function (step) {
    if (!SM.project) return;
    SM.project.done[step] = true; save(); SM.emit();
  };
  SM.dropProject = function () {
    SM.project = null;
    try { localStorage.removeItem(KEY); } catch (e) {}
    SM.emit();
  };

  /* ------------------------------------------------- изображения и файлы */
  SM.readImage = function (file, maxSide) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\//.test(file.type)) { reject(new Error('Это не изображение')); return; }
      if (file.size > 25 * 1024 * 1024) { reject(new Error('Файл больше 25 МБ')); return; }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = function () {
        const m = maxSide || 1600;
        let w = img.naturalWidth, h = img.naturalHeight;
        const k = Math.min(1, m / Math.max(w, h));
        w = Math.round(w * k); h = Math.round(h * k);
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve({ dataURL: c.toDataURL('image/jpeg', 0.86), w: w, h: h, canvas: c });
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Не удалось прочитать файл')); };
      img.src = url;
    });
  };

  SM.toBlob = function (dataURL, maxSide) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = function () {
        const m = maxSide || 1100;
        let w = img.naturalWidth, h = img.naturalHeight;
        const k = Math.min(1, m / Math.max(w, h));
        const c = document.createElement('canvas');
        c.width = Math.round(w * k); c.height = Math.round(h * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(b => resolve(b), 'image/jpeg', 0.84);
      };
      img.onerror = () => resolve(null);
      img.src = dataURL;
    });
  };

  SM.dataURLtoBlob = function (dataURL) {
    try {
      const i = dataURL.indexOf(','), head = dataURL.slice(0, i);
      const mime = (head.match(/:(.*?);/) || [])[1] || 'application/octet-stream';
      const bin = atob(dataURL.slice(i + 1));
      const u = new Uint8Array(bin.length);
      for (let k = 0; k < bin.length; k++) u[k] = bin.charCodeAt(k);
      return new Blob([u], { type: mime });
    } catch (e) { return null; }
  };

  SM.download = async function (filename, data, mime) {
    const d = await cap('downloads');
    if (!d) { SM.toast('Сохранение файлов недоступно в этом просмотре'); return false; }
    try {
      await d.save({ filename: filename, data: data, mimeType: mime });
      SM.toast('Файл передан браузеру: ' + filename);
      return true;
    } catch (e) {
      SM.toast('Сохранение отменено или недоступно');
      return false;
    }
  };

  SM.copy = async function (text, okMsg) {
    try { await navigator.clipboard.writeText(text); SM.toast(okMsg || 'Скопировано'); }
    catch (e) { SM.toast('Браузер не дал доступ к буферу обмена'); }
  };

  /* --------------------------------------------------------------- слой ИИ */
  const AI = {};
  let limitsCache = null;

  AI.available = async function () { return !!(await cap('sample')); };

  AI.limits = async function () {
    if (limitsCache) return limitsCache;
    const s = await cap('sample'); if (!s) return { images: false };
    try { limitsCache = await s.limits(); } catch (e) { limitsCache = { images: false }; }
    return limitsCache;
  };

  function aiError(e) {
    const code = e && e.code;
    if (code === 'not_granted') return { code: code, msg: 'Доступ к модели не предоставлен в этом просмотре.' };
    if (code === 'rate_limited') return { code: code, msg: 'Слишком много запросов подряд. Подождите минуту и повторите.' };
    return { code: code || 'error', msg: (e && e.message) || 'Запрос к модели не прошёл. Повторите попытку.' };
  }
  AI.err = aiError;

  async function ask(prompt, opts) {
    const s = await cap('sample');
    if (!s) throw { code: 'not_granted', message: 'Модель недоступна' };
    return await s.json(prompt, opts || {});
  }

  const RULES = [
    'Отвечай только на русском языке.',
    'Верни ТОЛЬКО JSON по схеме, без пояснений вокруг.',
    'Не выдумывай факты. Если данных нет — используй null или пустой массив.',
    'Чётко разделяй: что видно на изображении, и что ты знаешь об объекте.',
    'Никогда не называй архитектора, год постройки или адрес, если не узнаёшь здание уверенно.'
  ].join(' ');

  AI.identify = async function (blob, hints) {
    const schema = '{"identified":boolean,"confidence":"high"|"medium"|"low","name":string|null,'
      + '"location":string|null,"period":string|null,"architect":string|null,"function":string|null,'
      + '"style":string,"materials":[string],"composition":string,"facade":string,"details":[string],'
      + '"context":string|null,"urban":string,"condition":string,"opportunities":[string],'
      + '"preserve":[string],"dna":{"form":string,"geometry":string,"rhythm":string,"identity":string},'
      + '"uncertain":[string]}';
    const p = 'Ты — архитектурный аналитик платформы SITE MEMORY AI (команда 4WARD, Алматы). '
      + 'На снимке — существующее здание. ' + RULES + '\n'
      + 'Подсказки пользователя (могут быть пустыми или ошибочными): название — "'
      + (hints.name || 'не указано') + '", место — "' + (hints.location || 'не указано') + '".\n'
      + 'Поля style, materials, composition, facade, details, urban, condition, opportunities, preserve и dna '
      + 'заполняй по видимому на снимке — это возможно и для неизвестного здания. '
      + 'Поля name, location, period, architect, context заполняй только при уверенном узнавании объекта, иначе null. '
      + 'В uncertain перечисли, что по фотографии определить нельзя (например, состояние конструкций). '
      + 'dna: form — тип объёмной композиции; geometry — геометрическая основа; rhythm — ритм фасада; '
      + 'identity — что делает этот объект узнаваемым. Каждое поле dna: одна короткая фраза.\n'
      + 'Схема: ' + schema;
    return await ask(p, { images: blob ? [blob] : undefined, modelTier: 'default' });
  };

  AI.history = async function (name, location, style) {
    const schema = '{"known":boolean,"summary":string|null,'
      + '"timeline":[{"year":string,"title":string,"text":string}],'
      + '"changes":[string],"queries":[string],"caution":string}';
    const p = 'Ты — историк архитектуры платформы SITE MEMORY AI. ' + RULES + '\n'
      + 'Объект: "' + (name || 'не определён') + '", место: "' + (location || 'не указано')
      + '", стиль по анализу: "' + (style || 'не определён') + '".\n'
      + 'Если ты не знаешь этот конкретный объект — known:false, summary:null, timeline:[], '
      + 'но всё равно заполни queries: 4–6 точных поисковых запросов для архивов '
      + '(Wikimedia Commons, Википедия, городские архивы) на русском и английском языке.\n'
      + 'Если знаешь — summary: 3–5 предложений об истории; timeline: 3–7 вех с годами; '
      + 'changes: как объект и его окружение менялись со временем.\n'
      + 'caution: одна фраза о том, что это знания модели, а не архивный документ, и их нужно проверить.\n'
      + 'Схема: ' + schema;
    return await ask(p, { modelTier: 'default' });
  };

  AI.compare = async function (blobOld, blobNow, name) {
    const schema = '{"comparable":boolean,"differences":[{"aspect":string,"then":string,"now":string}],'
      + '"preserved":[string],"lost":[string],"verdict":string,"caution":string}';
    const p = 'Ты — архитектурный аналитик SITE MEMORY AI. ' + RULES + '\n'
      + 'Первое изображение — архивный или более ранний снимок. Второе — современное состояние. '
      + 'Объект: "' + (name || 'не определён') + '".\n'
      + 'Сравни только то, что видно: фасад, материалы, детали, проёмы, вывески, благоустройство, '
      + 'окружающую застройку, озеленение. Не делай выводов о скрытых конструкциях. '
      + 'Если на снимках разные объекты или сравнение невозможно — comparable:false и объясни это в verdict.\n'
      + 'preserved — сохранившиеся элементы; lost — утраченные. '
      + 'caution — одна фраза об ограничениях сравнения по фотографиям.\n'
      + 'Схема: ' + schema;
    return await ask(p, { images: [blobOld, blobNow], modelTier: 'default' });
  };

  AI.concepts = async function (blob, brief) {
    const schema = '{"concepts":[{"name":string,"idea":string,"changes":[string],"materials":[string],'
      + '"sustainability":string,"preservation":string,"benefits":[string],"limits":[string],'
      + '"palette":[string]}],"note":string}';
    const p = 'Ты — ведущий архитектор студии SITE MEMORY AI. ' + RULES + '\n'
      + 'На снимке — существующее здание, которое нужно переосмыслить. Техническое задание:\n'
      + brief + '\n'
      + 'Предложи ровно 3 разные концепции модернизации. Они должны быть осуществимыми и опираться '
      + 'на то, что видно на снимке: сохраняй пропорции, этажность и градостроительную роль объекта. '
      + 'Не заменяй здание другим сооружением.\n'
      + 'name — короткое название концепции (2–4 слова). idea — 2–3 предложения. '
      + 'changes — 3–5 конкретных изменений. materials — 2–4 материала. '
      + 'sustainability — экологический аспект одной фразой. preservation — что именно сохраняется. '
      + 'benefits — 2–3 эффекта для города. limits — 2–3 честных ограничения или риска. '
      + 'palette — 3–4 цвета в формате HEX, подходящие проекту.\n'
      + 'note — одна фраза о том, что это концептуальные предложения, а не проектная документация.\n'
      + 'Схема: ' + schema;
    return await ask(p, { images: blob ? [blob] : undefined, modelTier: 'complex' });
  };

  AI.deepdive = async function (obj, question) {
    const schema = '{"answer":string,"points":[string],"caution":string|null}';
    const p = 'Ты — историк архитектуры платформы SITE MEMORY AI. ' + RULES + '\n'
      + 'Объект: ' + obj.name + ' (' + obj.en + '), ' + obj.city + ', ' + obj.country
      + ', ' + obj.years + (obj.arch ? ', архитектор: ' + obj.arch : '') + '.\n'
      + 'Вопрос пользователя: "' + question + '"\n'
      + 'answer — 3–5 предложений по существу. points — 2–4 коротких факта или уточнения. '
      + 'caution — если в ответе есть спорные или неточные сведения, одна фраза об этом, иначе null.\n'
      + 'Схема: ' + schema;
    return await ask(p, { modelTier: 'default', cache: true });
  };

  SM.ai = AI;

  /* -------------------------------------------------------- база сообщества */
  const DB = {};
  DB.ready = async function () { return await cap('db'); };

  DB.me = async function () {
    const u = await cap('user'); if (!u) return null;
    try { return { id: await u.id() }; } catch (e) { return null; }
  };

  function normalize(rows) {
    if (!rows) return [];
    if (Array.isArray(rows)) {
      return rows.map((r, i) => {
        const body = (r && typeof r === 'object' && r.data && typeof r.data === 'object') ? r.data : r;
        return Object.assign({ _id: String((r && (r.id || r._id || r.key)) || i) }, body);
      });
    }
    if (typeof rows === 'object') {
      return Object.keys(rows).map(k => Object.assign({ _id: k }, rows[k]));
    }
    return [];
  }

  DB.list = async function () {
    const db = await cap('db'); if (!db) return null;
    const col = db.collection('community');
    let rows;
    try { rows = await col.orderBy('created', 'desc').limit(60).get(); }
    catch (e) { rows = await col.get(); }
    return normalize(rows);
  };

  DB.add = async function (post) {
    const db = await cap('db'); if (!db) throw new Error('no-db');
    const id = 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await db.collection('community').doc(id).set(post);
    return id;
  };

  DB.remove = async function (id) {
    const db = await cap('db'); if (!db) throw new Error('no-db');
    await db.collection('community').doc(id).delete();
  };

  SM.db = DB;

  /* ------------------------------------------------------------ утилиты */
  SM.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  SM.fmtDate = function (ts) {
    try { return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch (e) { return ''; }
  };
  SM.clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  return SM;
})();
