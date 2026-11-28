/* SITE MEMORY AI — страницы платформы */

(function (SM) {
  const el = SM.el, D = window.SMDATA;
  const V = {};
  SM.views = V;

  /* ------------------------------------------------------------ компоненты */
  function sechead(n, eyebrow, title, right) {
    return el('div.sechead', null, [
      el('div.sechead__t', null, [
        el('p.eyebrow', { text: eyebrow }),
        el('h2.h2', { text: title })
      ]),
      right || (n ? el('div.sechead__n', { text: n }) : null)
    ]);
  }
  function note(text, kind, mark) {
    return el('div.note' + (kind ? ' note--' + kind : ''), null, [
      el('i', { text: mark || 'i' }), el('span', { text: text })
    ]);
  }
  function badge(text, kind) {
    return el('span.badge' + (kind ? ' badge--' + kind : ''), { text: text });
  }
  function plateCanvas(type, seed, cls, dark) {
    return el('canvas' + (cls ? '.' + cls : ''), {
      'data-plate': type, 'data-seed': seed, 'data-dark': dark ? '1' : '0',
      role: 'img', 'aria-label': 'Архитектурная иллюстрация типа объекта'
    });
  }

  /* Фотография объекта, если она добавлена в библиотеку (поле photo),
     иначе — нарисованная иллюстрация. Битая ссылка откатывается на иллюстрацию. */
  function objVisual(o) {
    if (!o.photo) return plateCanvas(o.plate, o.seed);
    const img = el('img', { src: o.photo, alt: o.name + ' — фотография', loading: 'lazy' });
    img.addEventListener('error', function () {
      const host = img.parentNode; if (!host) return;
      const cv = plateCanvas(o.plate, o.seed);
      host.replaceChild(cv, img); SM.drawPlates(host);
    });
    return img;
  }
  function btn(label, attrs, cls) {
    return el('a.btn' + (cls ? '.' + cls : ''), attrs, [
      el('span', { text: label }), el('span.btn__arrow', { text: '→' })
    ]);
  }
  function actionBtn(label, onclick, cls, disabled) {
    return el('button.btn' + (cls ? '.' + cls : ''), { type: 'button', onclick: onclick, disabled: disabled || null },
      [el('span', { text: label })]);
  }
  function hexOk(s) { return typeof s === 'string' && /^#[0-9a-fA-F]{6}$/.test(s); }
  function listOf(arr, cls) {
    if (!Array.isArray(arr) || !arr.length) return null;
    return el('ul' + (cls ? '.' + cls : ''), null, arr.filter(x => typeof x === 'string').map(x => el('li', { text: x })));
  }
  function kv(k, v) {
    return el('div.facts__r', null, [el('div.facts__k', { text: k }), el('div.facts__v', { text: v })]);
  }

  /* --------------------------------------------------------- слайдер ДО/ПОСЛЕ */
  function compare(srcA, srcB, labA, labB) {
    const imgB = el('img.cmp__b', { src: srcB, alt: labB });
    const bar = el('div.cmp__bar');
    const handle = el('div.cmp__h', { text: '↔' });
    const range = el('input', { type: 'range', min: '0', max: '100', value: '50',
      'aria-label': 'Положение границы сравнения' });
    const box = el('div.cmp', null, [
      el('img.cmp__a', { src: srcA, alt: labA }),
      imgB, bar, handle, range,
      el('div.cmp__l.cmp__l--a', { text: labA }),
      el('div.cmp__l.cmp__l--b', { text: labB })
    ]);
    function set(p) {
      p = SM.clamp(p, 0, 100);
      imgB.style.clipPath = 'inset(0 0 0 ' + p + '%)';
      bar.style.left = p + '%'; handle.style.left = p + '%';
    }
    range.addEventListener('input', () => set(+range.value));
    let drag = false;
    const pos = e => {
      const r = box.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      const p = (x / r.width) * 100; range.value = p; set(p);
    };
    box.addEventListener('pointerdown', e => { drag = true; pos(e); box.setPointerCapture(e.pointerId); });
    box.addEventListener('pointermove', e => { if (drag) pos(e); });
    box.addEventListener('pointerup', () => { drag = false; });
    set(50);
    return box;
  }

  /* ------------------------------------------------------- стадии обработки */
  function stages(list) {
    const rows = list.map(t => el('div.stepln', null, [el('i'), el('span', { text: t })]));
    const wrap = el('div.steps', null, rows);
    let i = -1;
    return {
      node: wrap,
      next() { if (i >= 0) { rows[i].classList.remove('is-now'); rows[i].classList.add('is-done'); }
               i++; if (rows[i]) rows[i].classList.add('is-now'); },
      done() { rows.forEach(r => { r.classList.remove('is-now'); r.classList.add('is-done'); }); }
    };
  }

  /* ====================================================== 00 · ГЛАВНАЯ ==== */
  V.home = function () {
    const f = document.createDocumentFragment();

    /* --- герой --- */
    f.appendChild(el('section.hero', null, [
      el('canvas.hero__canvas', { 'data-contours': '1', 'aria-hidden': 'true' }),
      el('div.hero__in', null, [
        el('div.hero__kicker.rv', null, [
          el('span', { text: 'Архитектура × ИИ' }),
          el('span', { text: 'Алматы, Казахстан' }),
          el('span', { text: 'Команда 4WARD' }),
          el('span', { text: 'EST. 2026' })
        ]),
        el('h1.d1.hero__title', null, [
          el('span.hero__line', null, el('span', { text: 'SITE' })),
          el('span.hero__line', null, el('span', null, ['MEMORY', el('em.hero__dot', { text: '.', style: 'font-style:normal' })]))
        ]),
        el('div.hero__meta', null, [
          el('p.hero__slogan.rv', { style: '--d:260ms' }, [
            'Прошлое — наша основа.', el('br'), el('em', { text: 'Будущее — наш проект.' })
          ]),
          el('div.hero__actions.rv', { style: '--d:340ms' }, [
            btn('Исследовать здание', { href: '#scan' }, 'btn--solid btn--lg'),
            btn('Узнать о проекте', { href: '#about' }, 'btn--lg')
          ])
        ]),
        el('div.hero__scroll.rv', { style: '--d:420ms' }, [el('i'), el('span', { text: 'Прокрутите вниз' })])
      ])
    ]));

    /* --- манифест --- */
    f.appendChild(el('section.sec', null, el('div.wrap', null,
      el('div.manifesto', null, [
        el('div.stack', null, [
          el('p.eyebrow.rv', { text: 'Манифест' }),
          el('p.quote.rv', { style: '--d:60ms' }, 'У каждого здания есть память.'),
          el('p.lede.rv', { style: '--d:120ms', text:
            'Мы соединяем историю, архитектурный анализ и искусственный интеллект, чтобы переосмыслить пространство вокруг нас. ' +
            'Платформа начинается с одной фотографии: по ней можно понять, из чего сложен объект, что он значил раньше и каким может стать дальше.' }),
          el('div.row.rv', { style: '--d:180ms' }, [
            btn('Начать с фотографии', { href: '#scan' }, 'btn--solid'),
            el('a.link', { href: '#world' }, [el('span', { text: 'Библиотека архитектуры' }), el('span', { text: '→' })])
          ]),
          el('div.stack.rv', { style: '--d:240ms;gap:11px' }, [
            el('p.micro', { text: 'Палитра платформы' }),
            el('div.swatches', null, ['#EAEAEA', '#F1D6CE', '#CEACA6', '#B57C88', '#542934']
              .map(c => el('i', { style: 'background:' + c, title: c })))
          ])
        ]),
        el('div.manifesto__plate.rv-l', { style: '--d:140ms' }, plateCanvas('arcade', 77))
      ])
    )));

    /* --- три измерения времени --- */
    const times = [
      ['past', '01', 'Прошлое', 'Remember', 'Архивные снимки, первоначальный облик, утраченные детали и культурный контекст места.', 'spires', 12],
      ['present', '02', 'Настоящее', 'Understand', 'Стиль, материалы, геометрия, ритм фасада и связь объекта с городской средой — по фотографии.', 'grid', 34],
      ['future', '03', 'Будущее', 'Reimagine', 'Сценарии модернизации, озеленение, доступность и новая роль здания в жизни квартала.', 'shell', 56]
    ];
    f.appendChild(el('section.sec', null, [
      el('div.wrap', null, sechead('↕', 'Три измерения времени', 'Архитектура существует не в один момент, а во всех сразу.')),
      el('div.time', { style: 'grid-template-columns:repeat(3,minmax(0,1fr))' },
        times.map(t => el('div.time__col.rv', { 'data-t': t[0] }, [
          el('div.time__n', { text: t[1] }),
          el('div.time__k', { text: t[3] }),
          el('h3.h3', { text: t[2] }),
          el('p.body', { text: t[4] }),
          el('div.time__plate', null, plateCanvas(t[5], t[6], null, t[0] === 'future'))
        ])))
    ]));

    /* --- модули --- */
    const mods = [
      ['01', 'Scan & Identify', 'Распознать здание', 'Загрузите фотографию — платформа измерит композицию снимка и запросит у модели архитектурный разбор объекта.', '#scan', 'mod--a', 'grid', 5],
      ['02', 'Memory View', 'Прошлое и настоящее', 'Исторический контекст, запросы к открытым архивам и сравнение архивного снимка с современным.', '#memory', 'mod--b', 'spires', 9],
      ['03', 'AI Design Studio', 'Концепция будущего', 'Выберите направление и параметры — получите архитектурные концепции и эскиз-наложение.', '#studio', 'mod--c', 'shell', 15],
      ['04', 'World Architecture', 'Библиотека', '19 ключевых объектов и 11 направлений с проверяемыми источниками.', '#world', 'mod--d', 'dome', 21],
      ['05', 'Community Hub', 'Идеи для города', 'Опубликуйте предложение по своему району и посмотрите, что предлагают другие.', '#community', 'mod--e', 'modular', 27]
    ];
    f.appendChild(el('section.sec', null, el('div.wrap', null, [
      sechead('05', 'Платформа', 'Пять модулей, один объект, один маршрут.'),
      el('div.mods', null, mods.map((m, i) => el('a.mod.rv.' + m[5], { href: m[4], style: '--d:' + (i * 60) + 'ms' }, [
        el('div.mod__n', { text: m[0] }),
        el('h3.mod__t', { text: m[1] }),
        el('p.mod__ru', { text: m[2] }),
        el('p.mod__d', { text: m[3] }),
        el('div.mod__go', null, [el('span', { text: 'Открыть' }), el('b', { text: '→' })]),
        el('div.mod__plate', null, plateCanvas(m[6], m[7], null, m[5] === 'mod--d'))
      ])))
    ])));

    /* --- как это работает --- */
    const flow = [
      ['01', 'Capture', 'Снимок', 'Фотография здания с телефона или из галереи.'],
      ['02', 'Identify', 'Разбор', 'Измерение композиции и архитектурный анализ.'],
      ['03', 'Discover', 'История', 'Контекст объекта и сравнение с архивным снимком.'],
      ['04', 'Reimagine', 'Концепция', 'Сценарии модернизации и эскиз будущего.'],
      ['05', 'Share', 'Публикация', 'Идея попадает в общую ленту сообщества.']
    ];
    f.appendChild(el('section.sec.sec--tight', null, el('div.wrap', null, [
      sechead(null, 'Как это работает', 'От фотографии к архитектурной идее за пять шагов.'),
      el('div.flow', null, flow.map((s, i) => el('div.flow__s.rv', { style: '--d:' + (i * 70) + 'ms' }, [
        el('div.flow__n', { text: s[0] + ' / ' + s[1] }),
        el('h4.flow__t', { text: s[2] }),
        el('p.flow__d', { text: s[3] }),
        el('i.flow__ln', { style: '--d:' + (i * 70 + 200) + 'ms' })
      ])))
    ])));

    /* --- избранная архитектура --- */
    const feat = D.objects.slice(0, 8);
    const rail = el('div.rail', { role: 'list' }, feat.map(o => objCard(o, true)));
    f.appendChild(el('section.sec', null, [
      el('div.wrap', null, sechead(null, 'Избранное', 'Объекты, на которых видно, как решение инженера становится образом.',
        el('div.railnav', null, [
          el('button', { type: 'button', 'aria-label': 'Назад', onclick: () => rail.scrollBy({ left: -340, behavior: 'smooth' }), text: '←' }),
          el('button', { type: 'button', 'aria-label': 'Вперёд', onclick: () => rail.scrollBy({ left: 340, behavior: 'smooth' }), text: '→' })
        ]))),
      el('div.wrap', null, rail),
      el('div.wrap', null, el('div.row', { style: 'margin-top:20px' }, btn('Вся библиотека', { href: '#world' }, 'btn--ghost')))
    ]));

    /* --- сообщество --- */
    f.appendChild(el('section.sec', null, el('div.wrap', null, [
      el('div.grid.cols-2', null, [
        el('div.stack', null, [
          el('p.eyebrow.rv', { text: 'Сообщество' }),
          el('h2.h2.rv', { text: 'Город меняют не только архитекторы.' }),
          el('p.body.rv', { text:
            'Житель замечает разбитый тротуар, закрытый двор и выцветшую вывеску раньше любого проектировщика. ' +
            'Community Hub собирает такие наблюдения в форме, с которой может работать специалист: фотография, суть проблемы, предложение и визуальный эскиз.' }),
          el('div.row.rv', null, [
            btn('Смотреть идеи', { href: '#community' }, 'btn--solid'),
            el('a.link', { href: '#scan' }, [el('span', { text: 'Предложить своё' }), el('span', { text: '→' })])
          ])
        ]),
        el('div.grid', { style: 'grid-template-columns:repeat(2,minmax(0,1fr));gap:14px' }, [
          el('div.panel.rv', null, el('div.stat', null, [el('span.stat__n', { text: '19' }), el('span.stat__l', { text: 'Объектов в библиотеке' })])),
          el('div.panel.panel--peach.rv', { style: '--d:60ms' }, el('div.stat', null, [el('span.stat__n', { text: '11' }), el('span.stat__l', { text: 'Направлений архитектуры' })])),
          el('div.panel.panel--peach.rv', { style: '--d:120ms' }, el('div.stat', null, [el('span.stat__n', { text: '7' }), el('span.stat__l', { text: 'Сценариев модернизации' })])),
          el('div.panel.panel--wine.rv', { style: '--d:180ms' }, el('div.stat', null, [el('span.stat__n', { text: '5' }), el('span.stat__l', { text: 'Модулей платформы' })]))
        ])
      ])
    ])));

    /* --- финальный призыв --- */
    f.appendChild(el('section.cta', null, [
      el('canvas.cta__c', { 'data-contours': 'dark', 'aria-hidden': 'true' }),
      el('div.wrap.cta__in', { style: 'padding-block:clamp(56px,10vw,140px)' }, [
        el('p.eyebrow.eyebrow--light.rv', { text: 'Следующий шаг' }),
        el('h2.cta__t.rv', { text: 'Будущее города начинается с твоей идеи.' }),
        el('div.row.rv', { style: 'margin-top:36px' }, [
          btn('Начать исследование', { href: '#scan' }, 'btn--light btn--lg'),
          btn('Библиотека архитектуры', { href: '#world' }, 'btn--light btn--lg')
        ])
      ])
    ]));

    return f;
  };

  /* --------------------------------------------------- карточка объекта */
  function objCard(o, inRail) {
    return el('a.obj' + (inRail ? '' : ''), { href: '#world-' + o.id, role: inRail ? 'listitem' : null }, [
      el('div.obj__plate', null, [
        objVisual(o),
        el('span.obj__tag', { text: o.region === 'kz' ? 'Казахстан' : (D.regions.find(r => r.id === o.region) || {}).name || '' })
      ]),
      el('h3.obj__t', { text: o.name }),
      el('div.obj__m', null, [
        el('span', { text: o.city }), el('span', { text: o.years }),
        el('span', { text: (D.styles.find(s => s.id === o.style) || {}).name || '' })
      ])
    ]);
  }

  /* ================================================ 01 · SCAN & IDENTIFY = */
  V.scan = function () {
    const f = document.createDocumentFragment();
    const host = el('div.stack', { style: 'gap:clamp(20px,3vw,40px)' });

    f.appendChild(el('section.sec', null, el('div.wrap', null, [
      el('div.sechead', null, [
        el('div.sechead__t', null, [
          el('p.eyebrow', { text: '01 · Scan & Identify' }),
          el('h1.d2', { text: 'Каждое здание рассказывает историю.' }),
          el('p.lede', { style: 'margin-top:18px', text:
            'Загрузите снимок. Платформа сразу измерит композицию изображения прямо в браузере, ' +
            'а затем запросит архитектурный разбор у модели. Результаты разделены: что измерено и что предположено.' })
        ])
      ]),
      host
    ])));

    render();
    function render() {
      SM.clear(host);
      const p = SM.project;
      if (!p) { host.appendChild(uploader()); return; }
      host.appendChild(workspace(p));
    }

    /* ---- загрузка ---- */
    function uploader() {
      const nameI = el('input', { id: 'bName', type: 'text', placeholder: 'например, Дворец Республики' });
      const locI  = el('input', { id: 'bLoc', type: 'text', placeholder: 'например, Алматы, площадь Республики' });
      const file  = el('input', { type: 'file', accept: 'image/*', 'aria-label': 'Выбрать фотографию здания' });
      const cam   = el('input', { type: 'file', accept: 'image/*', capture: 'environment', hidden: true,
                                  'aria-label': 'Снять фотографию' });

      async function take(fl) {
        if (!fl) return;
        try {
          SM.toast('Читаю изображение…');
          const im = await SM.readImage(fl, 1600);
          SM.newProject(im.dataURL, { w: im.w, h: im.h, name: nameI.value.trim(), location: locI.value.trim() });
          const local = await SM.analyze(im.dataURL);
          SM.patch({ local: local });
          SM.mark('present');
          render();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) { SM.toast(e.message || 'Не удалось прочитать файл'); }
      }
      file.addEventListener('change', () => take(file.files && file.files[0]));
      cam.addEventListener('change', () => take(cam.files && cam.files[0]));

      const drop = el('label.drop', null, [
        file,
        el('div.drop__ico', null, SM.ico('up', 24)),
        el('p.drop__t', { text: 'Перетащите фотографию или нажмите, чтобы выбрать' }),
        el('p.small', { text: 'JPEG, PNG или WebP до 25 МБ. Снимок остаётся в вашем браузере.' })
      ]);
      ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('is-over'); }));
      ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('is-over'); }));
      drop.addEventListener('drop', e => { const fl = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; take(fl); });

      return el('div.grid', { style: 'grid-template-columns:minmax(0,1.3fr) minmax(0,.7fr);align-items:start' }, [
        el('div.stack', null, [
          drop,
          el('div.row', null, [
            el('label.btn.btn--ghost', { style: 'cursor:pointer' }, [el('span', { text: 'Снять камерой' }), cam]),
            el('span.micro', { text: 'На телефоне откроется камера' })
          ])
        ]),
        el('div.panel.stack', null, [
          el('p.eyebrow', { text: 'Необязательные подсказки' }),
          el('div.field', null, [el('label', { for: 'bName', text: 'Название здания' }), nameI]),
          el('div.field', null, [el('label', { for: 'bLoc', text: 'Местоположение' }), locI]),
          el('p.field__hint', { text: 'Подсказки повышают точность, но модель всё равно опирается на изображение и помечает неуверенные выводы.' })
        ])
      ]);
    }

    /* ---- рабочая область ---- */
    function workspace(p) {
      const wrap = el('div.stack', { style: 'gap:clamp(18px,2.6vw,34px)' });
      const shot = el('div.shot', null, [
        el('img', { src: p.photo, alt: p.name || 'Загруженная фотография здания' }),
        el('div.shot__bar', null, [
          el('span.micro', { text: (p.name || 'Объект без названия') + (p.location ? ' · ' + p.location : '') }),
          el('div.row', { style: 'gap:8px' }, [
            actionBtn('Заменить снимок', () => { SM.dropProject(); render(); }, 'btn--sm btn--ghost')
          ])
        ])
      ]);

      const L = p.local;
      const localPanel = el('div.panel.stack', null, [
        el('div.row', { style: 'justify-content:space-between' }, [
          el('p.eyebrow', { style: 'margin:0', text: 'Измерено в браузере' }),
          badge('Без ИИ', 'local')
        ]),
        L ? el('div.dna', null, [
          dnaCell('Ритм границ', SM.rhythmWord(L.vertical), Math.round(L.vertical * 100) + '% вертикальных градиентов', L.vertical),
          dnaCell('Симметрия', SM.symWord(L.symmetry), 'Совпадение половин кадра ' + Math.round(L.symmetry * 100) + '%', L.symmetry),
          dnaCell('Детализация', SM.densWord(L.density), 'Плотность контуров ' + Math.round(L.density * 100) + '%', L.density),
          dnaCell('Контраст', Math.round(L.contrast * 100) + '%', 'Разброс яркости по кадру', L.contrast)
        ]) : note('Не удалось измерить изображение в этом браузере.', 'warn'),
        L ? el('div.stack', { style: 'gap:8px' }, [
          el('p.eyebrow', { style: 'margin:0', text: 'Палитра объекта' }),
          el('div.sw', null, L.palette.map(c => el('span', { style: 'background:' + c, title: c }))),
          el('p.micro', { text: L.palette.join('   ') + '   ·   ' + L.px + ' пикселей' })
        ]) : null,
        note('Это точные измерения загруженного файла, а не оценка здания. Состояние конструкций по фотографии определить нельзя.', null, 'i')
      ]);

      wrap.appendChild(el('div.grid', { style: 'grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);align-items:start' }, [shot, localPanel]));

      /* блок ИИ */
      const aiHost = el('div');
      wrap.appendChild(aiHost);
      renderAI();

      function renderAI() {
        SM.clear(aiHost);
        if (p.ai) { aiHost.appendChild(results(p)); return; }
        aiHost.appendChild(el('div.panel.panel--peach.stack', null, [
          el('div.row', { style: 'justify-content:space-between' }, [
            el('p.eyebrow', { style: 'margin:0', text: 'Архитектурный разбор' }),
            badge('Запрос к модели', 'ai')
          ]),
          el('h3.h3', { text: 'Определить объект и собрать Site DNA' }),
          el('p.body', { text:
            'Снимок будет отправлен модели вместе с вашими подсказками. Модель опишет стиль, материалы, ' +
            'композицию и контекст, а неуверенные выводы пометит отдельно.' }),
          el('div.row', null, actionBtn('Исследовать здание', start, 'btn--solid btn--lg'))
        ]));
      }

      async function start() {
        const ok = await SM.ai.available();
        if (!ok) {
          SM.clear(aiHost);
          aiHost.appendChild(el('div.panel.stack', null, [
            el('p.eyebrow', { text: 'Разбор недоступен' }),
            note('Модель недоступна в этом просмотре, поэтому архитектурный разбор не выполнен. Измерения изображения выше получены без неё и остаются доступны.', 'warn', '!'),
            el('p.small', { text: 'Site DNA можно собрать и вручную: перейдите в AI Design Studio и опишите объект своими словами.' }),
            el('div.row', null, btn('Открыть студию', { href: '#studio' }, 'btn--ghost'))
          ]));
          return;
        }
        const st = stages(['Подготовка изображения', 'Анализ композиции', 'Определение объекта',
                           'Сбор Site DNA', 'Формирование результата']);
        SM.clear(aiHost);
        const over = el('div.scanfx', null, [
          el('div.scanfx__grid'), el('div.scanfx__line'),
          el('div.scanfx__mark', { style: 'left:22%;top:30%' }),
          el('div.scanfx__mark', { style: 'left:66%;top:52%;animation-delay:.6s' }),
          el('div.scanfx__mark', { style: 'left:44%;top:72%;animation-delay:1.2s' })
        ]);
        shot.appendChild(over);
        aiHost.appendChild(el('div.panel.stack', null, [
          el('p.eyebrow', { text: 'Идёт разбор' }), st.node,
          el('p.micro', { text: 'Обычно занимает 10–30 секунд.' })
        ]));
        st.next();
        const tick = setInterval(() => st.next(), 2600);
        try {
          const lim = await SM.ai.limits();
          const blob = lim && lim.images ? await SM.toBlob(p.photo, 1100) : null;
          if (!blob) SM.toast('Модель в этом просмотре не принимает изображения — разбор будет по подсказкам');
          const r = await SM.ai.identify(blob, { name: p.name, location: p.location });
          clearInterval(tick); st.done(); over.remove();
          SM.patch({ ai: r, name: p.name || (typeof r.name === 'string' ? r.name : ''), location: p.location || (typeof r.location === 'string' ? r.location : '') });
          renderAI();
          SM.toast('Разбор готов');
        } catch (e) {
          clearInterval(tick); over.remove();
          const er = SM.ai.err(e);
          SM.clear(aiHost);
          aiHost.appendChild(el('div.panel.stack', null, [
            el('p.eyebrow', { text: 'Разбор не выполнен' }),
            note(er.msg, 'warn', '!'),
            el('div.row', null, actionBtn('Повторить', start, 'btn--ghost'))
          ]));
        }
      }
      return wrap;
    }

    function dnaCell(k, v, n, meter) {
      return el('div.dna__c', null, [
        el('div.dna__k', { text: k }),
        el('div.dna__v', { text: v }),
        typeof meter === 'number' ? el('div.meter', null, el('i', { style: 'width:' + Math.round(meter * 100) + '%' })) : null,
        el('div.dna__n', { text: n })
      ]);
    }

    /* ---- результаты разбора ---- */
    function results(p) {
      const a = p.ai, L = p.local;
      const conf = { high: 'высокая', medium: 'средняя', low: 'низкая' }[a.confidence] || 'не указана';
      const out = el('div.stack', { style: 'gap:clamp(18px,2.6vw,34px)' });

      out.appendChild(el('div.panel.stack', null, [
        el('div.row', { style: 'justify-content:space-between' }, [
          el('p.eyebrow', { style: 'margin:0', text: 'Результат разбора' }),
          el('div.row', { style: 'gap:6px' }, [
            badge('Ответ модели', 'ai'),
            badge('Уверенность: ' + conf, a.confidence === 'high' ? 'wine' : null)
          ])
        ]),
        el('h2.h2', { text: a.identified && a.name ? a.name : 'Объект не опознан однозначно' }),
        !a.identified ? note('Модель не узнала конкретное здание, поэтому название, год, архитектор и история не заполнены. Описание ниже построено только по видимому на снимке.', 'warn', '!') : null,
        el('div.facts', null, [
          a.location ? kv('Место', a.location) : null,
          a.period ? kv('Период', a.period) : null,
          a.architect ? kv('Автор', a.architect) : null,
          a.function ? kv('Функция', a.function) : null,
          a.style ? kv('Стиль', a.style) : null,
          Array.isArray(a.materials) && a.materials.length ? kv('Материалы', a.materials.join(', ')) : null
        ].filter(Boolean))
      ]));

      /* Site DNA */
      const dna = a.dna || {};
      out.appendChild(el('div.stack', null, [
        el('div.row', { style: 'justify-content:space-between;align-items:flex-end' }, [
          el('div', null, [el('p.eyebrow', { style: 'margin:0 0 6px', text: 'Site DNA' }),
                           el('h3.h3', { text: 'Архитектурная идентичность места' })]),
          el('div.row', { style: 'gap:6px' }, [badge('Измерено', 'local'), badge('Модель', 'ai')])
        ]),
        el('div.dna', null, [
          dna.form ? dnaCell('Форма', dna.form, 'Объёмная композиция · модель') : null,
          dna.geometry ? dnaCell('Геометрия', dna.geometry, 'Геометрическая основа · модель') : null,
          L ? dnaCell('Ритм', SM.rhythmWord(L.vertical), 'Измерено по снимку', L.vertical) : null,
          dna.rhythm ? dnaCell('Фасад', dna.rhythm, 'Описание ритма · модель') : null,
          L ? dnaCell('Симметрия', SM.symWord(L.symmetry), 'Измерено по снимку', L.symmetry) : null,
          dna.identity ? dnaCell('Идентичность', dna.identity, 'Что делает объект узнаваемым · модель') : null
        ].filter(Boolean)),
        Array.isArray(a.preserve) && a.preserve.length ? el('div.panel.panel--peach.stack', null, [
          el('p.eyebrow', { style: 'margin:0', text: 'Рекомендуется сохранить при модернизации' }),
          listOf(a.preserve)
        ]) : null
      ]));

      /* описание */
      out.appendChild(el('div.grid.cols-2', null, [
        el('div.panel.stack', null, [
          el('p.eyebrow', { text: 'Что видно на снимке' }),
          a.composition ? el('div', null, [el('h4.h4', { text: 'Композиция' }), el('p.body', { text: a.composition })]) : null,
          a.facade ? el('div', null, [el('h4.h4', { text: 'Фасад' }), el('p.body', { text: a.facade })]) : null,
          Array.isArray(a.details) && a.details.length ? el('div', null, [el('h4.h4', { text: 'Детали' }), listOf(a.details)]) : null,
          a.condition ? el('div', null, [el('h4.h4', { text: 'Видимое состояние' }), el('p.body', { text: a.condition })]) : null
        ]),
        el('div.panel.stack', null, [
          el('p.eyebrow', { text: 'Контекст и потенциал' }),
          a.context ? el('div', null, [el('h4.h4', { text: 'Исторический контекст' }), el('p.body', { text: a.context })]) : null,
          a.urban ? el('div', null, [el('h4.h4', { text: 'Связь с городом' }), el('p.body', { text: a.urban })]) : null,
          Array.isArray(a.opportunities) && a.opportunities.length
            ? el('div', null, [el('h4.h4', { text: 'Возможности модернизации' }), listOf(a.opportunities)]) : null
        ])
      ]));

      if (Array.isArray(a.uncertain) && a.uncertain.length) {
        out.appendChild(el('div.panel.stack', null, [
          el('p.eyebrow', { text: 'Что по фотографии определить нельзя' }),
          listOf(a.uncertain),
          note('Разбор по изображению не заменяет обследование здания. Состояние несущих конструкций, инженерных систем и фундамента оценивает только специалист на объекте.', 'warn', '!')
        ]));
      }

      out.appendChild(el('div.panel.panel--wine.stack', null, [
        el('p.eyebrow.eyebrow--light', { text: 'Дальше' }),
        el('h3.h3', { text: 'Куда двигаться с этим объектом' }),
        el('div.row', null, [
          btn('Узнать историю здания', { href: '#memory' }, 'btn--light'),
          btn('Создать концепцию будущего', { href: '#studio' }, 'btn--light')
        ])
      ]));
      return out;
    }

    return f;
  };

  /* =================================================== 02 · MEMORY VIEW == */
  V.memory = function () {
    const f = document.createDocumentFragment();
    const p = SM.project;

    f.appendChild(el('section.sec', null, el('div.wrap', null, [
      el('div.sechead', null, el('div.sechead__t', null, [
        el('p.eyebrow', { text: '02 · Memory View' }),
        el('h1.d2', { text: 'Прошлое становится основой будущего.' }),
        el('p.lede', { style: 'margin-top:18px', text:
          'Исторический контекст объекта, точные запросы к открытым архивам и прямое сравнение архивного снимка с современным.' })
      ])),
      p ? body(p) : empty()
    ])));

    function empty() {
      return el('div.empty', null, [
        el('div.empty__ico', null, SM.ico('clock', 26)),
        el('h3.h3', { text: 'Объект ещё не выбран' }),
        el('p.body', { style: 'text-align:center', text: 'Memory View работает с конкретным зданием. Загрузите фотографию в модуле Scan & Identify.' }),
        btn('Перейти к Scan & Identify', { href: '#scan' }, 'btn--solid')
      ]);
    }

    function body(p) {
      const wrap = el('div.stack', { style: 'gap:clamp(20px,3vw,42px)' });
      const title = p.name || (p.ai && p.ai.name) || 'Объект без названия';
      const loc = p.location || (p.ai && p.ai.location) || '';
      const style = p.ai && p.ai.style || '';

      /* шапка объекта */
      wrap.appendChild(el('div.grid', { style: 'grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);align-items:center' }, [
        el('div.shot', null, el('img', { src: p.photo, alt: 'Современное состояние: ' + title })),
        el('div.stack', null, [
          el('p.eyebrow', { style: 'margin:0', text: 'Текущий объект' }),
          el('h2.h2', { text: title }),
          el('p.small', { text: [loc, style].filter(Boolean).join(' · ') || 'Описание появится после разбора в модуле Scan' })
        ])
      ]));

      /* исторический контекст */
      const histHost = el('div');
      wrap.appendChild(histHost);
      renderHist();

      function renderHist() {
        SM.clear(histHost);
        const h = p.history;
        if (!h) {
          histHost.appendChild(el('div.panel.panel--peach.stack', null, [
            el('div.row', { style: 'justify-content:space-between' }, [
              el('p.eyebrow', { style: 'margin:0', text: 'Историческая справка' }), badge('Запрос к модели', 'ai')
            ]),
            el('h3.h3', { text: 'Собрать контекст и запросы к архивам' }),
            el('p.body', { text: 'Модель соберёт то, что известно об объекте, и подготовит точные поисковые запросы для Wikimedia Commons и других открытых архивов.' }),
            el('div.row', null, actionBtn('Собрать историю', loadHist, 'btn--solid'))
          ]));
          return;
        }
        const out = el('div.stack', { style: 'gap:22px' });
        out.appendChild(el('div.row', { style: 'justify-content:space-between;align-items:flex-end' }, [
          el('div', null, [el('p.eyebrow', { style: 'margin:0 0 6px', text: 'Историческая справка' }),
                           el('h3.h3', { text: h.known ? 'Что известно об объекте' : 'Объект не опознан по названию' })]),
          badge('Ответ модели', 'ai')
        ]));
        if (h.summary) out.appendChild(el('p.body', { style: 'max-width:72ch', text: h.summary }));
        if (!h.known) out.appendChild(note('Модель не располагает сведениями именно об этом объекте. Ниже — подготовленные запросы для самостоятельного поиска в архивах.', 'warn', '!'));
        if (h.caution) out.appendChild(note(h.caution, null, 'i'));

        if (Array.isArray(h.timeline) && h.timeline.length) {
          out.appendChild(el('div.stack', null, [
            el('p.eyebrow', { style: 'margin:0', text: 'Хронология' }),
            el('div.tl', null, h.timeline.filter(t => t && t.year).map(t => el('div.tl__i', null, [
              el('div.tl__y', { text: String(t.year) }),
              el('p.tl__t', { text: String(t.title || '') }),
              el('p.small', { text: String(t.text || '') })
            ])))
          ]));
        }
        if (Array.isArray(h.changes) && h.changes.length) {
          out.appendChild(el('div.panel.stack', null, [
            el('p.eyebrow', { style: 'margin:0', text: 'Как менялся объект и его окружение' }), listOf(h.changes)
          ]));
        }
        if (Array.isArray(h.queries) && h.queries.length) {
          out.appendChild(el('div.panel.stack', null, [
            el('p.eyebrow', { style: 'margin:0', text: 'Поиск в открытых архивах' }),
            el('p.small', { text: 'Ссылки открываются в новой вкладке. Прямая загрузка архивных снимков в страницу требует серверной части — см. раздел «Ограничения».' }),
            el('div.stack', { style: 'gap:8px' }, h.queries.filter(q => typeof q === 'string').slice(0, 6).map(q =>
              el('div.row', { style: 'justify-content:space-between;gap:10px;border-bottom:1px solid var(--line-soft);padding-bottom:8px' }, [
                el('span.small', { style: 'flex:1 1 200px', text: q }),
                el('div.row', { style: 'gap:6px' }, [
                  el('a.btn.btn--sm.btn--ghost', { href: 'https://commons.wikimedia.org/w/index.php?search=' + encodeURIComponent(q) + '&title=Special:MediaSearch&type=image', target: '_blank', rel: 'noopener' }, el('span', { text: 'Commons' })),
                  el('a.btn.btn--sm.btn--ghost', { href: 'https://ru.wikipedia.org/w/index.php?search=' + encodeURIComponent(q), target: '_blank', rel: 'noopener' }, el('span', { text: 'Вики' }))
                ])
              ])))
          ]));
        }
        histHost.appendChild(out);
      }

      async function loadHist() {
        const ok = await SM.ai.available();
        if (!ok) { SM.clear(histHost); histHost.appendChild(el('div.panel', null, note('Модель недоступна в этом просмотре, историческая справка не собрана. Архивный снимок можно загрузить вручную ниже.', 'warn', '!'))); return; }
        SM.clear(histHost);
        const st = stages(['Поиск сведений об объекте', 'Сборка хронологии', 'Подготовка архивных запросов']);
        histHost.appendChild(el('div.panel.stack', null, [el('p.eyebrow', { text: 'Идёт сбор' }), st.node]));
        st.next(); const tick = setInterval(() => st.next(), 2400);
        try {
          const r = await SM.ai.history(title, loc, style);
          clearInterval(tick); SM.patch({ history: r }); SM.mark('past'); renderHist();
        } catch (e) {
          clearInterval(tick); const er = SM.ai.err(e);
          SM.clear(histHost);
          histHost.appendChild(el('div.panel.stack', null, [note(er.msg, 'warn', '!'), el('div.row', null, actionBtn('Повторить', loadHist, 'btn--ghost'))]));
        }
      }

      /* сравнение снимков */
      const cmpHost = el('div');
      wrap.appendChild(cmpHost);
      renderCmp();

      function renderCmp() {
        SM.clear(cmpHost);
        const out = el('div.stack', { style: 'gap:18px' });
        out.appendChild(el('div.row', { style: 'justify-content:space-between;align-items:flex-end' }, [
          el('div', null, [el('p.eyebrow', { style: 'margin:0 0 6px', text: 'Прошлое | Настоящее' }),
                           el('h3.h3', { text: 'Сравнение архивного и современного снимка' })]),
          p.archive ? el('div.row', { style: 'gap:6px' }, [
            actionBtn('Другой архивный снимок', () => { SM.patch({ archive: null, compare: null }); renderCmp(); }, 'btn--sm btn--ghost')
          ]) : null
        ]));

        if (!p.archive) {
          const file = el('input', { type: 'file', accept: 'image/*', 'aria-label': 'Загрузить архивный снимок' });
          file.addEventListener('change', async () => {
            const fl = file.files && file.files[0]; if (!fl) return;
            try { const im = await SM.readImage(fl, 1600); SM.patch({ archive: im.dataURL, compare: null }); SM.mark('past'); renderCmp(); }
            catch (e) { SM.toast(e.message); }
          });
          out.appendChild(el('label.drop', null, [
            file, el('div.drop__ico', null, SM.ico('clock', 24)),
            el('p.drop__t', { text: 'Загрузите архивную фотографию этого места' }),
            el('p.small', { style: 'max-width:56ch', text: 'Снимок из семейного альбома, городского архива или Wikimedia Commons. После загрузки включится слайдер сравнения, а модель опишет изменения.' })
          ]));
          out.appendChild(note('Автоматический поиск архивных изображений требует серверной части: страница не может обращаться к внешним архивам напрямую. Запросы для ручного поиска подготовлены выше.', null, 'i'));
          cmpHost.appendChild(out);
          return;
        }

        const slider = compare(p.archive, p.photo, 'Прошлое', 'Настоящее');
        out.appendChild(slider);
        out.appendChild(el('div.grid.cols-2', null, [
          el('div.shot', null, [el('img', { src: p.archive, alt: 'Архивный снимок' }),
            el('div.shot__bar', null, el('span.micro', { text: 'Архивный снимок · загружен вами' }))]),
          el('div.shot', null, [el('img', { src: p.photo, alt: 'Современный снимок' }),
            el('div.shot__bar', null, el('span.micro', { text: 'Современное состояние' }))])
        ]));

        const c = p.compare;
        if (!c) {
          out.appendChild(el('div.panel.panel--peach.stack', null, [
            el('div.row', { style: 'justify-content:space-between' }, [
              el('p.eyebrow', { style: 'margin:0', text: 'Анализ изменений' }), badge('Запрос к модели', 'ai')
            ]),
            el('p.body', { text: 'Модель получит оба снимка и опишет, что изменилось в фасаде, материалах, деталях и окружении, а что сохранилось.' }),
            el('div.row', null, actionBtn('Сравнить снимки', runCmp, 'btn--solid'))
          ]));
        } else {
          const list = el('div.stack', { style: 'gap:16px' }, [
            el('div.row', { style: 'justify-content:space-between' }, [
              el('p.eyebrow', { style: 'margin:0', text: 'Что изменилось' }), badge('Ответ модели', 'ai')
            ]),
            c.verdict ? el('p.body', { style: 'max-width:72ch', text: c.verdict }) : null,
            Array.isArray(c.differences) && c.differences.length ? el('div.facts', null,
              c.differences.filter(d => d && d.aspect).map(d => el('div.facts__r', null, [
                el('div.facts__k', { text: String(d.aspect) }),
                el('div.facts__v', null, [
                  el('div.small', { text: 'Было: ' + String(d.then || '—') }),
                  el('div.small', { style: 'color:var(--rose)', text: 'Стало: ' + String(d.now || '—') })
                ])
              ]))) : null,
            el('div.grid.cols-2', null, [
              Array.isArray(c.preserved) && c.preserved.length ? el('div.panel.stack', null, [el('p.eyebrow', { style: 'margin:0', text: 'Сохранилось' }), listOf(c.preserved)]) : null,
              Array.isArray(c.lost) && c.lost.length ? el('div.panel.stack', null, [el('p.eyebrow', { style: 'margin:0', text: 'Утрачено' }), listOf(c.lost)]) : null
            ]),
            c.caution ? note(c.caution, null, 'i') : null
          ]);
          out.appendChild(el('div.panel', null, list));
        }

        out.appendChild(el('div.panel.panel--wine.stack', null, [
          el('p.eyebrow.eyebrow--light', { text: 'Дальше' }),
          el('h3.h3', { text: 'Переосмыслить будущее здания' }),
          el('p.body', { text: 'История объекта и его Site DNA перейдут в студию как исходные ограничения проекта.' }),
          el('div.row', null, btn('Открыть AI Design Studio', { href: '#studio' }, 'btn--light'))
        ]));
        cmpHost.appendChild(out);
      }

      async function runCmp() {
        const ok = await SM.ai.available();
        if (!ok) { SM.toast('Модель недоступна в этом просмотре'); return; }
        const lim = await SM.ai.limits();
        if (!lim || !lim.images) { SM.toast('Модель в этом просмотре не принимает изображения'); return; }
        SM.toast('Сравниваю снимки…');
        try {
          const [a, b] = await Promise.all([SM.toBlob(p.archive, 1000), SM.toBlob(p.photo, 1000)]);
          const r = await SM.ai.compare(a, b, title);
          SM.patch({ compare: r }); SM.mark('past'); renderCmp();
        } catch (e) { SM.toast(SM.ai.err(e).msg); }
      }

      return wrap;
    }
    return f;
  };

  /* ============================================== 03 · AI DESIGN STUDIO == */
  V.studio = function () {
    const f = document.createDocumentFragment();
    const p = SM.project;

    f.appendChild(el('section.sec', null, el('div.wrap', null, [
      el('div.sechead', null, el('div.sechead__t', null, [
        el('p.eyebrow', { text: '03 · AI Design Studio' }),
        el('h1.d2', { text: 'Не просто изменить здание. Понять его.' }),
        el('p.lede', { style: 'margin-top:18px', text:
          'Выберите сценарий и параметры — платформа соберёт техническое задание, запросит у модели три концепции и построит эскиз-наложение поверх вашего снимка.' })
      ])),
      p ? studio(p) : el('div.empty', null, [
        el('div.empty__ico', null, SM.ico('layers', 26)),
        el('h3.h3', { text: 'Нужен объект' }),
        el('p.body', { style: 'text-align:center', text: 'Студия работает с загруженной фотографией. Начните с модуля Scan & Identify.' }),
        btn('Загрузить фотографию', { href: '#scan' }, 'btn--solid')
      ])
    ])));

    function studio(p) {
      const state = (p.brief && p.brief.state) || { dir: 'eco', opts: [], keep: true, text: '' };
      const sideHost = el('div.studio__side');
      const mainHost = el('div.stack', { style: 'gap:clamp(16px,2.4vw,30px)' });

      /* ---- боковая панель ---- */
      function side() {
        SM.clear(sideHost);
        sideHost.appendChild(el('div.panel.stack', { style: 'gap:12px' }, [
          el('p.eyebrow', { style: 'margin:0', text: 'Направление' }),
          el('div.dirs', null, D.directions.map(d => {
            const b = el('button.dir' + (state.dir === d.id ? '.is-on' : ''), { type: 'button' }, [
              el('span.dir__g', null, plateCanvas(
                { preserve: 'arcade', modernize: 'grid', eco: 'shell', reuse: 'frame', public: 'slab', minimal: 'tower', custom: 'modular' }[d.id],
                100 + D.directions.indexOf(d))),
              el('span', null, [el('span.dir__t', { text: d.name }), el('span.dir__d', { text: d.d })])
            ]);
            b.addEventListener('click', () => { state.dir = d.id; side(); main(); });
            return b;
          }))
        ]));

        sideHost.appendChild(el('div.panel.stack', { style: 'gap:10px' }, [
          el('p.eyebrow', { style: 'margin:0', text: 'Параметры изменений' }),
          el('div.stack', { style: 'gap:14px' }, D.options.map(g => el('div', null, [
            el('p.micro', { style: 'text-transform:uppercase;letter-spacing:.16em;font-weight:700;margin-bottom:4px', text: g.g }),
            el('div', null, g.items.map(it => {
              const inp = el('input', { type: 'checkbox', id: 'o-' + it.id });
              inp.checked = state.opts.indexOf(it.id) > -1;
              inp.addEventListener('change', () => {
                const i = state.opts.indexOf(it.id);
                if (inp.checked && i < 0) state.opts.push(it.id);
                if (!inp.checked && i > -1) state.opts.splice(i, 1);
                main();
              });
              return el('label.switch', { for: 'o-' + it.id }, [
                inp, el('span.switch__box'),
                el('span.switch__txt', null, [el('b', { text: it.t }), el('span', { text: it.d })])
              ]);
            }))
          ])))
        ]));

        const keep = el('input', { type: 'checkbox', id: 'keepId' }); keep.checked = state.keep;
        keep.addEventListener('change', () => { state.keep = keep.checked; main(); });
        const ta = el('textarea', { id: 'brief', placeholder: 'Например: сохранить ритм окон, открыть первый этаж под мастерские, добавить тень во дворе.' });
        ta.value = state.text;
        ta.addEventListener('input', () => { state.text = ta.value; });

        sideHost.appendChild(el('div.panel.panel--peach.stack', { style: 'gap:12px' }, [
          el('p.eyebrow', { style: 'margin:0', text: 'Условия проекта' }),
          el('label.switch', { for: 'keepId' }, [keep, el('span.switch__box'),
            el('span.switch__txt', null, [el('b', { text: 'Сохранить историческую идентичность' }),
              el('span', { text: 'Объём, пропорции и узнаваемые детали остаются' })])]),
          el('div.field', null, [el('label', { for: 'brief', text: 'Опишите, каким вы видите будущее этого места' }), ta])
        ]));
      }

      /* ---- сборка ТЗ ---- */
      function briefText() {
        const d = D.directions.find(x => x.id === state.dir) || D.directions[0];
        const names = [];
        D.options.forEach(g => g.items.forEach(it => { if (state.opts.indexOf(it.id) > -1) names.push(it.t); }));
        const a = p.ai || {};
        const L = p.local;
        const lines = [
          'ОБЪЕКТ: ' + (p.name || a.name || 'без названия') + (p.location || a.location ? ', ' + (p.location || a.location) : ''),
          a.style ? 'СТИЛЬ ПО РАЗБОРУ: ' + a.style : null,
          Array.isArray(a.materials) && a.materials.length ? 'МАТЕРИАЛЫ: ' + a.materials.join(', ') : null,
          a.dna && a.dna.form ? 'ФОРМА: ' + a.dna.form : null,
          a.dna && a.dna.identity ? 'ИДЕНТИЧНОСТЬ: ' + a.dna.identity : null,
          L ? 'ИЗМЕРЕНО ПО СНИМКУ: ритм — ' + SM.rhythmWord(L.vertical).toLowerCase()
              + '; ' + SM.symWord(L.symmetry).toLowerCase()
              + '; ' + SM.densWord(L.density).toLowerCase() : null,
          Array.isArray(a.preserve) && a.preserve.length ? 'СОХРАНИТЬ: ' + a.preserve.join('; ') : null,
          'НАПРАВЛЕНИЕ: ' + d.name + ' — ' + d.d,
          names.length ? 'ПАРАМЕТРЫ: ' + names.join('; ') : 'ПАРАМЕТРЫ: не заданы',
          state.keep ? 'ОГРАНИЧЕНИЕ: сохранить историческую идентичность, объём и пропорции здания' : 'ОГРАНИЧЕНИЕ: допускается значительное преобразование объёма',
          state.text ? 'ПОЖЕЛАНИЕ АВТОРА: ' + state.text : null,
          p.history && p.history.summary ? 'ИСТОРИЧЕСКИЙ КОНТЕКСТ: ' + p.history.summary : null
        ].filter(Boolean);
        return lines.join('\n');
      }

      /* ---- основная область ---- */
      function main() {
        SM.clear(mainHost);
        const d = D.directions.find(x => x.id === state.dir) || D.directions[0];

        mainHost.appendChild(el('div.shot', null, [
          el('img', { src: p.photo, alt: 'Исходное состояние объекта' }),
          el('div.shot__bar', null, [
            el('span.micro', { text: (p.name || 'Объект') + ' · исходное состояние' }),
            el('span.micro', { text: d.name })
          ])
        ]));

        mainHost.appendChild(el('div.panel.stack', { style: 'gap:10px' }, [
          el('div.row', { style: 'justify-content:space-between' }, [
            el('p.eyebrow', { style: 'margin:0', text: 'Техническое задание' }),
            el('div.row', { style: 'gap:6px' }, [
              badge('Собрано платформой', 'local'),
              actionBtn('Копировать', () => SM.copy(briefText(), 'ТЗ скопировано'), 'btn--sm btn--ghost')
            ])
          ]),
          el('pre', { style: 'margin:0;white-space:pre-wrap;font:inherit;font-size:.82rem;color:var(--ink-2);max-height:220px;overflow:auto', text: briefText() }),
          el('p.micro', { text: 'Именно этот текст и ваш снимок уходят модели. Ничего скрытого в запросе нет.' })
        ]));

        /* генерация */
        const genHost = el('div');
        mainHost.appendChild(genHost);
        renderConcepts(genHost);

        /* эскиз */
        const skHost = el('div');
        mainHost.appendChild(skHost);
        renderSketch(skHost);
      }

      function renderConcepts(host) {
        SM.clear(host);
        const c = p.concepts;
        if (!c) {
          host.appendChild(el('div.panel.panel--peach.stack', null, [
            el('div.row', { style: 'justify-content:space-between' }, [
              el('p.eyebrow', { style: 'margin:0', text: 'Архитектурные концепции' }), badge('Запрос к модели', 'ai')
            ]),
            el('h3.h3', { text: 'Получить три концепции модернизации' }),
            el('p.body', { text: 'Модель предложит три разных сценария с материалами, экологическим аспектом, стратегией сохранения и честным списком ограничений.' }),
            el('div.row', null, actionBtn('Сгенерировать концепции', run, 'btn--solid btn--lg'))
          ]));
          return;
        }
        const out = el('div.stack', { style: 'gap:16px' }, [
          el('div.row', { style: 'justify-content:space-between;align-items:flex-end' }, [
            el('div', null, [el('p.eyebrow', { style: 'margin:0 0 6px', text: 'Концепции' }),
                             el('h3.h3', { text: 'Три сценария для этого объекта' })]),
            el('div.row', { style: 'gap:6px' }, [badge('Ответ модели', 'ai'), actionBtn('Ещё вариант', run, 'btn--sm btn--ghost')])
          ])
        ]);
        (c.concepts || []).forEach((k, i) => {
          out.appendChild(el('div.conc', null, [
            el('div.conc__h', null, [
              el('h4.conc__n', { text: (i + 1) + ' / ' + String(k.name || 'Концепция') }),
              Array.isArray(k.palette) ? el('div.sw', { style: 'width:120px;height:22px' },
                k.palette.filter(hexOk).map(h => el('span', { style: 'background:' + h, title: h }))) : null
            ]),
            k.idea ? el('p.body', { text: String(k.idea) }) : null,
            el('dl', null, [
              Array.isArray(k.changes) && k.changes.length ? el('div', null, [el('dt', { text: 'Изменения' }), el('dd', null, listOf(k.changes))]) : null,
              Array.isArray(k.materials) && k.materials.length ? el('div', null, [el('dt', { text: 'Материалы' }), el('dd', { text: k.materials.join(', ') })]) : null,
              k.preservation ? el('div', null, [el('dt', { text: 'Что сохраняется' }), el('dd', { text: String(k.preservation) })]) : null,
              k.sustainability ? el('div', null, [el('dt', { text: 'Устойчивость' }), el('dd', { text: String(k.sustainability) })]) : null,
              Array.isArray(k.benefits) && k.benefits.length ? el('div', null, [el('dt', { text: 'Эффект для города' }), el('dd', null, listOf(k.benefits))]) : null,
              Array.isArray(k.limits) && k.limits.length ? el('div', null, [el('dt', { text: 'Ограничения и риски' }), el('dd', null, listOf(k.limits))]) : null
            ]),
            el('div.row', { style: 'gap:8px' }, [
              actionBtn('Копировать концепцию', () => SM.copy(conceptText(k), 'Концепция скопирована'), 'btn--sm btn--ghost'),
              actionBtn('Сохранить файлом', () => SM.download(
                'site-memory-concept-' + (i + 1) + '.txt', conceptText(k), 'text/plain'), 'btn--sm btn--ghost')
            ])
          ]));
        });
        if (c.note) out.appendChild(note(String(c.note), 'warn', '!'));
        out.appendChild(note('Концепции носят предпроектный характер. Они не являются проектной документацией и не согласованы ни с одним органом.', 'warn', '!'));
        host.appendChild(out);
      }

      function conceptText(k) {
        const L = [];
        L.push('SITE MEMORY AI · 4WARD — концепция модернизации');
        L.push('Объект: ' + (p.name || 'без названия') + (p.location ? ', ' + p.location : ''));
        L.push('');
        L.push('ТЕХНИЧЕСКОЕ ЗАДАНИЕ');
        L.push(briefText());
        L.push('');
        L.push('КОНЦЕПЦИЯ: ' + (k.name || ''));
        if (k.idea) L.push(k.idea);
        const sec = (t, v) => { if (Array.isArray(v) && v.length) { L.push(''); L.push(t); v.forEach(x => L.push(' — ' + x)); } else if (typeof v === 'string' && v) { L.push(''); L.push(t); L.push(v); } };
        sec('ИЗМЕНЕНИЯ', k.changes); sec('МАТЕРИАЛЫ', k.materials);
        sec('СОХРАНЯЕТСЯ', k.preservation); sec('УСТОЙЧИВОСТЬ', k.sustainability);
        sec('ЭФФЕКТ', k.benefits); sec('ОГРАНИЧЕНИЯ', k.limits);
        L.push(''); L.push('Концептуальное предложение, созданное с участием ИИ. Не проектная документация.');
        return L.join('\n');
      }

      async function run() {
        const ok = await SM.ai.available();
        if (!ok) { SM.toast('Модель недоступна в этом просмотре. Эскиз-наложение ниже работает без неё.'); return; }
        SM.patch({ brief: { state: state, text: briefText() } });
        const host = mainHost.children[2];
        SM.clear(host);
        const st = stages(['Чтение Site DNA', 'Согласование с ограничениями', 'Проработка сценариев', 'Оформление концепций']);
        host.appendChild(el('div.panel.stack', null, [el('p.eyebrow', { text: 'Идёт проектирование' }), st.node]));
        st.next(); const tick = setInterval(() => st.next(), 3000);
        try {
          const lim = await SM.ai.limits();
          const blob = lim && lim.images ? await SM.toBlob(p.photo, 1100) : null;
          const r = await SM.ai.concepts(blob, briefText());
          clearInterval(tick); SM.patch({ concepts: r }); SM.mark('future'); renderConcepts(host);
        } catch (e) {
          clearInterval(tick); SM.clear(host);
          host.appendChild(el('div.panel.stack', null, [note(SM.ai.err(e).msg, 'warn', '!'), el('div.row', null, actionBtn('Повторить', run, 'btn--ghost'))]));
        }
      }

      /* ---- эскиз-наложение ---- */
      function renderSketch(host) {
        SM.clear(host);
        const out = el('div.stack', { style: 'gap:14px' }, [
          el('div.row', { style: 'justify-content:space-between;align-items:flex-end' }, [
            el('div', null, [el('p.eyebrow', { style: 'margin:0 0 6px', text: 'Визуализация' }),
                             el('h3.h3', { text: 'Эскиз-наложение по вашим параметрам' })]),
            badge('Рисуется в браузере', 'local')
          ]),
          el('p.body', { text: 'Платформа строит эскиз поверх вашего снимка: градуировка под выбранный сценарий, озеленение, освещение, благоустройство и ритм фасада. Это не фотореалистичная генерация.' })
        ]);
        const area = el('div');
        out.appendChild(el('div.row', null, [
          actionBtn('Построить эскиз', build, 'btn--rose'),
          p.sketch ? actionBtn('Сохранить изображение', () => saveSketch(), 'btn--ghost') : null
        ].filter(Boolean)));
        out.appendChild(area);
        if (p.sketch) drawArea();
        out.appendChild(note('Эскиз — схематическое наложение, а не проект и не фотография будущего состояния. Фотореалистичная визуализация требует подключения модели генерации изображений.', 'warn', '!'));
        out.appendChild(el('div.panel.panel--wine.stack', null, [
          el('p.eyebrow.eyebrow--light', { text: 'Дальше' }),
          el('h3.h3', { text: 'Показать идею городу' }),
          el('p.body', { text: 'Публикация перенесёт снимок, эскиз и выбранную концепцию в ленту Community Hub.' }),
          el('div.row', null, [
            actionBtn('Опубликовать идею', () => V.publish(), 'btn--light'),
            btn('Открыть ленту', { href: '#community' }, 'btn--light')
          ])
        ]));

        function drawArea() {
          SM.clear(area);
          area.appendChild(compare(p.photo, p.sketch, 'Сейчас', 'Эскиз'));
          area.appendChild(el('p.micro', { style: 'margin-top:8px', text: 'Потяните ползунок, чтобы сравнить состояния.' }));
        }
        async function build() {
          SM.toast('Строю эскиз…');
          const dataURL = await SM.sketch(p.photo, state.dir, state.opts);
          if (!dataURL) { SM.toast('Не удалось построить эскиз'); return; }
          SM.patch({ sketch: dataURL, brief: { state: state, text: briefText() } });
          SM.mark('future');
          main();
          window.scrollTo({ top: document.body.scrollHeight * .62, behavior: 'smooth' });
        }
        async function saveSketch() {
          const b = SM.dataURLtoBlob(p.sketch);
          if (!b) { SM.toast('Не удалось подготовить файл'); return; }
          SM.download('site-memory-sketch.jpg', b, 'image/jpeg');
        }
        host.appendChild(out);
      }

      side(); main();
      return el('div.studio', null, [sideHost, mainHost]);
    }
    return f;
  };

  /* ============================================ 04 · WORLD ARCHITECTURE = */
  const worldState = { q: '', region: '', style: '' };

  V.world = function () {
    const f = document.createDocumentFragment();
    const st = worldState;

    const grid = el('div.grid', { style: 'grid-template-columns:repeat(auto-fill,minmax(230px,1fr))' });
    const count = el('p.micro');

    const qI = el('input', { type: 'text', value: st.q, placeholder: 'Объект, город, архитектор…', 'aria-label': 'Поиск по библиотеке' });
    qI.addEventListener('input', () => { st.q = qI.value.toLowerCase().trim(); draw(); });

    function chipRow(items, key, allLabel) {
      const row = el('div.chips');
      const mk = (id, name) => {
        const c = el('button.chip' + (st[key] === id ? '.is-on' : ''), { type: 'button', text: name });
        c.addEventListener('click', () => { st[key] = id; draw(); SM.$$('.chip', row).forEach(x => x.classList.remove('is-on')); c.classList.add('is-on'); });
        return c;
      };
      row.appendChild(mk('', allLabel));
      items.forEach(i => row.appendChild(mk(i.id, i.name)));
      return row;
    }

    function draw() {
      const list = D.objects.filter(o => {
        if (st.region && o.region !== st.region) return false;
        if (st.style && o.style !== st.style) return false;
        if (st.q) {
          const hay = [o.name, o.en, o.city, o.country, o.arch || '', o.type, o.years].join(' ').toLowerCase();
          if (hay.indexOf(st.q) < 0) return false;
        }
        return true;
      });
      SM.clear(grid);
      count.textContent = list.length ? 'Показано объектов: ' + list.length + ' из ' + D.objects.length : '';
      if (!list.length) {
        grid.appendChild(el('div.empty', { style: 'grid-column:1/-1' }, [
          el('div.empty__ico', null, SM.ico('search', 24)),
          el('h3.h3', { text: 'Ничего не найдено' }),
          el('p.body', { style: 'text-align:center', text: 'Попробуйте другой запрос или снимите фильтры.' }),
          actionBtn('Сбросить фильтры', () => { st.q = ''; st.region = ''; st.style = ''; qI.value = ''; f2(); }, 'btn--ghost')
        ]));
      } else list.forEach(o => grid.appendChild(objCard(o)));
      SM.drawPlates(grid);
    }
    function f2() { SM.route('world'); }

    f.appendChild(el('section.sec', null, el('div.wrap', null, [
      el('div.sechead', null, el('div.sechead__t', null, [
        el('p.eyebrow', { text: '04 · World Architecture' }),
        el('h1.d2', { text: 'Архитектура — это история, которую можно увидеть.' }),
        el('p.lede', { style: 'margin-top:18px', text:
          'Девятнадцать объектов, на которых видно, как конструктивная задача превращается в образ. Для каждого указан источник, который можно проверить.' })
      ])),
      el('div.filters', null, [
        el('div.search', null, [SM.ico('search', 16), qI]),
        el('div.stack', { style: 'gap:8px;flex:1 1 420px' }, [
          chipRow(D.regions, 'region', 'Все регионы'),
          chipRow(D.styles.map(s => ({ id: s.id, name: s.name })), 'style', 'Все направления')
        ])
      ]),
      count, grid
    ])));

    /* коллекции стилей */
    f.appendChild(el('section.sec', null, el('div.wrap', null, [
      sechead('11', 'Направления', 'Язык, на котором говорят здания.'),
      el('div.grid', { style: 'grid-template-columns:repeat(auto-fill,minmax(260px,1fr))' },
        D.styles.map((s, i) => {
          const n = D.objects.filter(o => o.style === s.id).length;
          const b = el('button.panel.stack', { type: 'button', style: 'gap:8px;text-align:left;cursor:pointer' }, [
            el('p.eyebrow', { style: 'margin:0', text: s.years }),
            el('h3.h3', { text: s.name }),
            el('p.small', { text: s.text }),
            el('p.micro', { style: 'margin-top:auto;color:var(--rose)', text: n ? 'В библиотеке: ' + n : 'Пока без объектов в библиотеке' })
          ]);
          b.addEventListener('click', () => {
            st.style = s.id; st.region = ''; st.q = '';
            SM.route('world');
            setTimeout(() => { const g = SM.$('.filters'); if (g) g.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 90);
          });
          return b;
        }))
    ])));

    draw();
    return f;
  };

  /* ------------------------------------------------ карточка объекта (деталь) */
  V.worldDetail = function (id) {
    const o = D.objects.find(x => x.id === id);
    const f = document.createDocumentFragment();
    if (!o) {
      f.appendChild(el('section.sec', null, el('div.wrap', null, el('div.empty', null, [
        el('h3.h3', { text: 'Объект не найден' }), btn('Вернуться в библиотеку', { href: '#world' }, 'btn--solid')
      ]))));
      return f;
    }
    const style = D.styles.find(s => s.id === o.style);
    const related = D.objects.filter(x => x.id !== o.id && (x.style === o.style || x.region === o.region)).slice(0, 4);

    const askHost = el('div');
    const qI = el('input', { type: 'text', id: 'askQ', placeholder: 'Например: почему у здания такая форма кровли?' });

    f.appendChild(el('section.sec', null, el('div.wrap', null, [
      el('a.link', { href: '#world', style: 'margin-bottom:22px' }, [el('span', { text: '←' }), el('span', { text: 'Библиотека' })]),
      el('div.detail', null, [
        el('div.stack', null, [
          el('p.eyebrow', { style: 'margin:0', text: o.city + ', ' + o.country }),
          el('h1.d2', { text: o.name }),
          el('p.micro', { text: o.en }),
          el('p.lede', { style: 'margin-top:14px', text: o.text }),
          el('div.facts', { style: 'margin-top:12px' }, [
            kv('Годы', o.years),
            o.arch ? kv('Автор', o.arch) : kv('Автор', 'Не указан в использованном источнике'),
            kv('Тип', o.type),
            style ? kv('Направление', style.name + ' · ' + style.years) : null
          ].filter(Boolean)),
          el('div.facts', null, o.facts.map(fx => kv(fx[0], fx[1]))),
          el('div.row', { style: 'margin-top:8px' }, [
            el('a.btn.btn--ghost.btn--sm', { href: o.src, target: '_blank', rel: 'noopener' }, el('span', { text: 'Источник' })),
            el('a.btn.btn--ghost.btn--sm', { href: 'https://commons.wikimedia.org/w/index.php?search=' + encodeURIComponent(o.en) + '&title=Special:MediaSearch&type=image', target: '_blank', rel: 'noopener' }, el('span', { text: 'Фотографии на Commons' }))
          ]),
          o.photo ? (o.credit ? note('Фотография: ' + o.credit, null, 'i') : null)
                  : note('Изображение справа — архитектурная иллюстрация типа объекта, нарисованная платформой, а не фотография этого здания. Снимки доступны по ссылке на Commons.', null, 'i')
        ]),
        el('div.stack', null, [
          el('div.figure', null, objVisual(o)),
          el('div.panel.panel--peach.stack', { style: 'gap:10px' }, [
            el('div.row', { style: 'justify-content:space-between' }, [
              el('p.eyebrow', { style: 'margin:0', text: 'Спросить об объекте' }), badge('Модель', 'ai')
            ]),
            el('div.field', null, [el('label', { for: 'askQ', text: 'Ваш вопрос' }), qI]),
            el('div.row', null, actionBtn('Спросить', ask, 'btn--solid btn--sm')),
            askHost
          ])
        ])
      ])
    ])));

    async function ask() {
      const q = qI.value.trim();
      if (!q) { SM.toast('Введите вопрос'); return; }
      const ok = await SM.ai.available();
      if (!ok) { SM.clear(askHost); askHost.appendChild(note('Модель недоступна в этом просмотре.', 'warn', '!')); return; }
      SM.clear(askHost); askHost.appendChild(el('div.stack', { style: 'gap:6px' }, [
        el('div.skel', { style: 'height:12px;width:90%' }), el('div.skel', { style: 'height:12px;width:76%' }), el('div.skel', { style: 'height:12px;width:84%' })
      ]));
      try {
        const r = await SM.ai.deepdive(o, q);
        SM.clear(askHost);
        askHost.appendChild(el('div.stack', { style: 'gap:8px' }, [
          el('p.body', { text: String(r.answer || '') }),
          listOf(r.points),
          r.caution ? note(String(r.caution), null, 'i') : null
        ]));
      } catch (e) {
        SM.clear(askHost); askHost.appendChild(note(SM.ai.err(e).msg, 'warn', '!'));
      }
    }

    if (related.length) {
      f.appendChild(el('section.sec.sec--tight', null, el('div.wrap', null, [
        sechead(null, 'Рядом', 'Близкие по направлению или региону'),
        el('div.grid', { style: 'grid-template-columns:repeat(auto-fill,minmax(210px,1fr))' }, related.map(r => objCard(r)))
      ])));
    }
    return f;
  };

  /* ================================================ 05 · COMMUNITY HUB == */
  V.community = function () {
    const f = document.createDocumentFragment();
    const st = { cat: '' };
    const feed = el('div.feed');
    const status = el('div');

    f.appendChild(el('section.sec', null, el('div.wrap', null, [
      el('div.sechead', null, [
        el('div.sechead__t', null, [
          el('p.eyebrow', { text: '05 · Community Hub' }),
          el('h1.d2', { text: 'Твой город. Твоя идея. Наше будущее.' }),
          el('p.lede', { style: 'margin-top:18px', text:
            'Общая лента предложений по зданиям и общественным пространствам. Каждая идея — это фотография, суть проблемы и предложение, с которым может работать специалист.' })
        ]),
        el('div.row', null, actionBtn('Опубликовать идею', () => V.publish(), 'btn--solid'))
      ]),
      el('div.filters', null, [
        el('div.chips', null, [{ id: '', name: 'Все темы' }].concat(D.categories).map(c => {
          const b = el('button.chip' + (st.cat === c.id ? '.is-on' : ''), { type: 'button', text: c.name });
          b.addEventListener('click', () => {
            st.cat = c.id;
            SM.$$('.chips .chip').forEach(x => x.classList.remove('is-on')); b.classList.add('is-on');
            load();
          });
          return b;
        }))
      ]),
      status, feed
    ])));

    async function load() {
      SM.clear(status); SM.clear(feed);
      for (let i = 0; i < 3; i++) feed.appendChild(el('div.post', null, [
        el('div.post__img.skel'), el('div.post__b', null, [
          el('div.skel', { style: 'height:14px;width:80%' }), el('div.skel', { style: 'height:11px;width:60%' })
        ])
      ]));
      let rows = null;
      try { rows = await SM.db.list(); } catch (e) { rows = null; }
      SM.clear(feed);

      if (rows === null) {
        status.appendChild(el('div.panel.stack', { style: 'margin-bottom:20px' }, [
          el('p.eyebrow', { style: 'margin:0', text: 'Лента недоступна' }),
          note('Общая база сообщества недоступна в этом просмотре: возможно, требуется вход в аккаунт. Все остальные модули работают.', 'warn', '!')
        ]));
        feed.appendChild(emptyFeed());
        return;
      }
      const list = rows.filter(r => !st.cat || r.category === st.cat)
        .sort((a, b) => (b.created || 0) - (a.created || 0));
      if (!list.length) { feed.appendChild(emptyFeed()); return; }
      list.forEach(r => feed.appendChild(postCard(r)));
    }

    function emptyFeed() {
      return el('div.empty', { style: 'grid-column:1/-1' }, [
        el('div.empty__ico', null, SM.ico('users', 26)),
        el('h3.h3', { text: 'Здесь пока пусто' }),
        el('p.body', { style: 'text-align:center;max-width:52ch', text:
          'Лента наполняется участниками. Начните с фотографии здания рядом с вами — платформа поможет описать проблему и предложение.' }),
        el('div.row', null, [
          btn('Загрузить фотографию', { href: '#scan' }, 'btn--solid'),
          actionBtn('Опубликовать идею', () => V.publish(), 'btn--ghost')
        ])
      ]);
    }

    function postCard(r) {
      const cat = (D.categories.find(c => c.id === r.category) || {}).name || 'Без темы';
      const img = r.sketch || r.photo;
      return el('a.post', { href: '#community-' + r._id }, [
        el('div.post__img', null, img ? el('img', { src: img, alt: String(r.title || '') })
          : plateCanvas('grid', 33)),
        el('div.post__b', null, [
          el('p.micro', { style: 'color:var(--rose)', text: cat }),
          el('h3.post__t', { text: String(r.title || 'Без названия') }),
          el('p.small', { text: String(r.problem || '').slice(0, 130) }),
          el('div.post__m', null, [
            el('span', { text: String(r.author || 'Участник') }),
            el('span', { text: r.created ? SM.fmtDate(r.created) : '' }),
            r.editorial ? el('span', { style: 'color:var(--rose)', text: 'Пример 4WARD' }) : null
          ].filter(Boolean))
        ])
      ]);
    }

    load();
    return f;
  };

  V.communityDetail = function (id) {
    const f = document.createDocumentFragment();
    const host = el('div.wrap');
    f.appendChild(el('section.sec', null, host));
    (async () => {
      SM.clear(host);
      host.appendChild(el('div.stack', { style: 'gap:10px' }, [
        el('div.skel', { style: 'height:28px;width:50%' }), el('div.skel', { style: 'height:300px' })
      ]));
      let rows = null;
      try { rows = await SM.db.list(); } catch (e) { rows = null; }
      const r = rows && rows.find(x => x._id === id);
      SM.clear(host);
      host.appendChild(el('a.link', { href: '#community', style: 'margin-bottom:22px' }, [el('span', { text: '←' }), el('span', { text: 'Лента сообщества' })]));
      if (!r) {
        host.appendChild(el('div.empty', null, [
          el('h3.h3', { text: 'Проект не найден' }),
          el('p.body', { text: rows === null ? 'Общая база недоступна в этом просмотре.' : 'Запись удалена или ссылка устарела.' }),
          btn('К ленте', { href: '#community' }, 'btn--solid')
        ]));
        return;
      }
      const cat = (D.categories.find(c => c.id === r.category) || {}).name || '';
      host.appendChild(el('div.detail', null, [
        el('div.stack', null, [
          el('p.eyebrow', { style: 'margin:0', text: cat + (r.location ? ' · ' + r.location : '') }),
          el('h1.d2', { text: String(r.title || '') }),
          el('div.row', { style: 'gap:6px' }, [
            badge(String(r.author || 'Участник')),
            r.created ? badge(SM.fmtDate(r.created)) : null,
            r.editorial ? badge('Пример редакции 4WARD', 'wine') : null
          ].filter(Boolean)),
          r.problem ? el('div', null, [el('h3.h3', { style: 'margin-top:16px', text: 'Проблема' }), el('p.body', { text: String(r.problem) })]) : null,
          r.solution ? el('div', null, [el('h3.h3', { style: 'margin-top:16px', text: 'Предложение' }), el('p.body', { text: String(r.solution) })]) : null,
          r.concept ? el('div', null, [el('h3.h3', { style: 'margin-top:16px', text: 'Архитектурная концепция' }), el('p.body', { text: String(r.concept) })]) : null,
          note('Идея опубликована участником платформы. Это предложение для обсуждения, а не согласованный проект.', null, 'i')
        ]),
        el('div.stack', null, [
          r.photo && r.sketch ? compare(r.photo, r.sketch, 'Сейчас', 'Предложение')
            : (r.photo || r.sketch) ? el('div.shot', null, el('img', { src: r.photo || r.sketch, alt: String(r.title || '') }))
            : el('div', { style: 'aspect-ratio:4/3;border:1px solid var(--line)' }, plateCanvas('grid', 41)),
          el('div.row', null, [
            actionBtn('Скопировать ссылку', () => SM.copy(location.href, 'Ссылка скопирована'), 'btn--ghost btn--sm'),
            actionBtn('Предложить своё', () => V.publish(), 'btn--ghost btn--sm')
          ])
        ])
      ]));
      SM.drawPlates(host);
    })();
    return f;
  };

  /* ------------------------------------------------------ форма публикации */
  V.publish = function () {
    const p = SM.project;
    const concept = p && p.concepts && p.concepts.concepts && p.concepts.concepts[0];
    SM.sheet('Опубликовать идею', () => {
      const t = el('input', { id: 'pT', type: 'text', value: p ? (p.name || '') : '', placeholder: 'Короткое название идеи' });
      const loc = el('input', { id: 'pL', type: 'text', value: p ? (p.location || '') : '', placeholder: 'Улица, район, город' });
      const au = el('input', { id: 'pA', type: 'text', placeholder: 'Как вас подписать' });
      const pr = el('textarea', { id: 'pP', placeholder: 'Что сейчас не работает в этом месте?' });
      const so = el('textarea', { id: 'pS', placeholder: 'Что вы предлагаете изменить?' });
      if (concept && concept.idea) so.value = String(concept.idea);
      const sel = el('select', { id: 'pC' }, D.categories.map(c => el('option', { value: c.id, text: c.name })));
      const msg = el('div');

      async function send() {
        if (!t.value.trim()) { SM.toast('Нужно название идеи'); t.focus(); return; }
        if (!pr.value.trim() && !so.value.trim()) { SM.toast('Опишите проблему или предложение'); pr.focus(); return; }
        const db = await SM.db.ready();
        if (!db) { SM.clear(msg); msg.appendChild(note('Общая база недоступна в этом просмотре, поэтому идея не опубликована. Возможно, нужно войти в аккаунт.', 'warn', '!')); return; }
        const me = await SM.db.me();
        const post = {
          title: t.value.trim().slice(0, 120),
          location: loc.value.trim().slice(0, 120),
          author: au.value.trim().slice(0, 60) || 'Участник',
          authorId: me ? me.id : null,
          problem: pr.value.trim().slice(0, 1200),
          solution: so.value.trim().slice(0, 1200),
          concept: concept ? String(concept.name || '') + (concept.idea ? ' — ' + String(concept.idea) : '') : '',
          category: sel.value,
          photo: p ? p.photo : null,
          sketch: p ? p.sketch : null,
          created: Date.now(),
          editorial: false
        };
        try {
          SM.toast('Публикую…');
          const id = await SM.db.add(post);
          SM.mark('share'); SM.closeSheet(); SM.toast('Идея опубликована');
          location.hash = 'community-' + id;
        } catch (e) {
          SM.clear(msg); msg.appendChild(note('Публикация не прошла. Возможно, у вашей учётной записи нет прав на запись в эту ленту.', 'warn', '!'));
        }
      }

      return [
        p ? el('div.shot', null, el('img', { src: p.sketch || p.photo, alt: 'Изображение идеи' })) :
            note('Идея публикуется без изображения. Загрузите фотографию в модуле Scan, чтобы добавить снимок и эскиз.', null, 'i'),
        el('div.field', null, [el('label', { for: 'pT', text: 'Название идеи' }), t]),
        el('div.field', null, [el('label', { for: 'pL', text: 'Место' }), loc]),
        el('div.field', null, [el('label', { for: 'pC', text: 'Тема' }), sel]),
        el('div.field', null, [el('label', { for: 'pP', text: 'Проблема' }), pr]),
        el('div.field', null, [el('label', { for: 'pS', text: 'Предложение' }), so]),
        el('div.field', null, [el('label', { for: 'pA', text: 'Подпись' }), au]),
        msg,
        note('Публикация видна другим участникам этой страницы. Не загружайте снимки с узнаваемыми людьми и персональными данными.', null, 'i'),
        el('div.row', null, [
          actionBtn('Опубликовать', send, 'btn--solid'),
          actionBtn('Отмена', () => SM.closeSheet(), 'btn--ghost')
        ])
      ];
    });
  };

  /* ====================================================== 06 · О ПРОЕКТЕ = */
  V.about = function () {
    const f = document.createDocumentFragment();
    f.appendChild(el('section.sec', null, el('div.wrap', null, [
      el('div.sechead', null, el('div.sechead__t', null, [
        el('p.eyebrow', { text: '06 · О проекте' }),
        el('h1.d2', { text: 'Посмотри на привычное пространство по-новому.' }),
        el('p.lede', { style: 'margin-top:18px', text:
          'SITE MEMORY AI — проект команды 4WARD из Алматы. Мы делаем архитектурное знание доступным: ' +
          'чтобы понять здание рядом с домом, не нужно профильное образование — достаточно внимания и фотографии.' })
      ])),
      el('div.grid.cols-2', null, [
        el('div.panel.stack', null, [
          el('p.eyebrow', { text: 'Зачем' }),
          el('p.body', { text: 'Города меняются быстрее, чем успевает сложиться общественный разговор о них. Здание сносят раньше, чем жители узнают его историю. Фасад перекрашивают без понимания исходного замысла. Мы хотим вернуть этот разговор, дав людям инструмент для наблюдения и формулирования.' }),
          el('p.body', { text: 'Платформа не заменяет архитектора. Она переводит наблюдение жителя на язык, понятный специалисту, и показывает профессионалу, что именно волнует людей в конкретном месте.' })
        ]),
        el('div.panel.panel--peach.stack', null, [
          el('p.eyebrow', { text: 'Команда' }),
          el('h3.h3', { text: '4WARD' }),
          el('p.body', { text: 'Алматы, Казахстан. Направление — архитектура, искусственный интеллект, городское развитие и цифровое наследие.' }),
          el('div.grid', { style: 'grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:8px' }, [
            el('div.stat', null, [el('span.stat__n', { text: '2026' }), el('span.stat__l', { text: 'Год основания' })]),
            el('div.stat', null, [el('span.stat__n', { text: 'KZ' }), el('span.stat__l', { text: 'Алматы' })])
          ])
        ])
      ])
    ])));

    const blocks = [
      ['about-method', 'Методология', 'Как платформа приходит к выводам', [
        ['Измерение', 'Композиция снимка считается прямо в браузере: палитра, симметрия, соотношение вертикальных и горизонтальных границ, плотность контуров. Это арифметика по пикселям, а не оценка здания.'],
        ['Разбор', 'Снимок и ваши подсказки отправляются модели. Она описывает стиль, материалы, композицию и контекст, отдельно помечая то, в чём не уверена.'],
        ['Site DNA', 'Измеренные и описанные характеристики собираются в карточку идентичности места: форма, геометрия, ритм, узнаваемые элементы и то, что стоит сохранить.'],
        ['Концепция', 'Site DNA, исторический контекст и ваши параметры превращаются в техническое задание. Оно видно целиком перед отправкой — скрытых инструкций в запросе нет.']
      ]],
      ['about-tech', 'Технологии', 'Из чего собрана платформа', [
        ['Интерфейс', 'Один самодостаточный веб-клиент без фреймворков: собственная маршрутизация, система анимаций и графика на canvas. Типологические схемы и эскизы рисуются кодом, а не берутся из стоков.'],
        ['Анализ изображений', 'Квантование палитры, оценка симметрии и оператор Собеля выполняются локально. Снимок не покидает браузер, пока вы сами не отправите его модели.'],
        ['ИИ', 'Запросы к модели идут напрямую из страницы и возвращают структурированный JSON по заданной схеме. Для разбора объекта и сравнения снимков передаются изображения.'],
        ['Данные', 'Проект объекта хранится в вашем браузере. Лента сообщества — в общей базе артефакта.']
      ]],
      ['about-limits', 'Ограничения', 'Что платформа не делает', [
        ['Это не обследование', 'Анализ фотографии не оценивает несущие конструкции, фундамент и инженерные системы. Такое заключение даёт только специалист на объекте.'],
        ['Это не архив', 'Историческая справка — знания модели, а не архивный документ. Платформа готовит точные запросы, но прямая загрузка архивных изображений требует серверной части.'],
        ['Это не проект', 'Концепции и эскизы носят предпроектный характер, не являются проектной документацией и ни с кем не согласованы.'],
        ['Это не фотореализм', 'Эскиз-наложение рисуется кодом поверх вашего снимка. Фотореалистичная визуализация требует подключения модели генерации изображений.']
      ]]
    ];
    blocks.forEach(b => {
      f.appendChild(el('section.sec', { id: b[0] }, el('div.wrap', null, [
        sechead(null, b[1], b[2]),
        el('div.grid', { style: 'grid-template-columns:repeat(auto-fit,minmax(250px,1fr))' },
          b[3].map(x => el('div.panel.stack', { style: 'gap:8px' }, [
            el('h3.h3', { text: x[0] }), el('p.small', { text: x[1] })
          ])))
      ])));
    });

    f.appendChild(el('section.cta', null, [
      el('canvas.cta__c', { 'data-contours': 'dark', 'aria-hidden': 'true' }),
      el('div.wrap.cta__in', { style: 'padding-block:clamp(50px,8vw,110px)' }, [
        el('p.eyebrow.eyebrow--light', { text: 'Remember · Understand · Reimagine' }),
        el('h2.cta__t', { text: 'Начните с одного здания рядом с вами.' }),
        el('div.row', { style: 'margin-top:32px' }, btn('Открыть Scan & Identify', { href: '#scan' }, 'btn--light btn--lg'))
      ])
    ]));
    return f;
  };

})(window.SM);
