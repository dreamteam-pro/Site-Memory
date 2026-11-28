/* SITE MEMORY AI — графика на canvas:
   мягкие контуры-изолинии, объёмные архитектурные иллюстрации,
   локальный анализ снимка, эскиз-наложение концепции. */

(function (SM) {

  const PAL = { gray:'#EAEAEA', peach:'#F1D6CE', nude:'#CEACA6', rose:'#B57C88', wine:'#542934' };
  SM.PAL = PAL;

  function fit(cv) {
    const r = Math.min(window.devicePixelRatio || 1, 2);
    const w = cv.clientWidth || cv.parentNode.clientWidth || 600;
    const h = cv.clientHeight || Math.round(w * 0.66);
    if (cv.width !== Math.round(w * r) || cv.height !== Math.round(h * r)) {
      cv.width = Math.round(w * r); cv.height = Math.round(h * r);
    }
    const ctx = cv.getContext('2d');
    ctx.setTransform(r, 0, 0, r, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }

  function rnd(seed) { let s = (seed || 1) * 9301 + 49297; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

  function curve(ctx, pts) {
    const n = pts.length;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      ctx.bezierCurveTo(
        p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
        p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6,
        p2[0], p2[1]);
    }
    ctx.closePath();
  }

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
    else ctx.rect(x, y, w, h);
  }

  /* ============================================= анимированные изолинии === */
  SM.contours = function (cv, opts) {
    opts = opts || {};
    const dark = !!opts.dark;
    const rings = opts.rings || 9;
    const fields = opts.fields || [
      { x: .76, y: .30, r: .32, s: 3.1, c: dark ? PAL.peach : '#FFFFFF' },
      { x: .28, y: .66, r: .27, s: 7.7, c: dark ? PAL.rose  : '#FFFFFF' },
      { x: .90, y: .80, r: .19, s: 5.2, c: dark ? PAL.peach : PAL.peach },
      { x: .08, y: .16, r: .16, s: 2.4, c: dark ? PAL.rose  : '#FFFFFF' }
    ];
    let t = 0, raf = 0, live = true, last = 0;

    function draw(now) {
      raf = 0;
      const g = fit(cv), ctx = g.ctx, w = g.w, h = g.h;
      const m = Math.min(w, h);
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1.4; ctx.lineJoin = 'round';

      fields.forEach(f => {
        const cx = f.x * w, cy = f.y * h;
        for (let k = 0; k < rings; k++) {
          const kk = k / rings;
          const base = f.r * m * (1 - kk * 0.74);
          const pts = []; const N = 26;
          for (let i = 0; i < N; i++) {
            const a = (i / N) * Math.PI * 2;
            const n = Math.sin(a * 3 + t * .22 + f.s) * .5
                    + Math.sin(a * 5 - t * .15 + f.s * 2) * .26
                    + Math.sin(a * 2 + t * .09 + kk * 3) * .22;
            const rad = base * (1 + n * (.16 + kk * .2));
            pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * .9]);
          }
          curve(ctx, pts);
          ctx.strokeStyle = f.c;
          ctx.globalAlpha = (dark ? .3 : .42) * (1 - kk * .5);
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;

      if (live && !SM.reduced) {
        if (!last) last = now || 0;
        t += Math.min(((now || 0) - last) / 1000, .1);
        last = now || 0;
        raf = requestAnimationFrame(draw);
      }
    }
    draw(0);

    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        live = e.isIntersecting && !SM.reduced;
        if (live && !raf) { last = 0; raf = requestAnimationFrame(draw); }
      });
    }, { threshold: 0 });
    io.observe(cv);

    let rt = null;
    const onR = () => { clearTimeout(rt); rt = setTimeout(() => { if (!raf) draw(0); }, 140); };
    window.addEventListener('resize', onR);

    return function stop() {
      live = false; if (raf) cancelAnimationFrame(raf);
      io.disconnect(); window.removeEventListener('resize', onR);
    };
  };

  /* ============================ архитектурные иллюстрации (не фотографии) = */
  const LIGHT = {
    sky:  ['#A06E7C', '#CF9F9D', '#F5E2DA'],
    haze: 'rgba(255,255,255,.6)',
    far:  'rgba(109,66,78,.26)',
    gnd:  ['#C49A95', '#9C7076'],
    face: '#FFFCFA', side: '#C89D99', roof: '#EBCFC7', deep: '#8E646D',
    glass:'#7C5765', accent: PAL.rose, gold: '#F7DFD3', ink: 'rgba(84,41,52,.5)',
    tree: ['#6E4B55', '#875F67']
  };
  const DARK = {
    sky:  ['#3B1C25', '#5B2D3A', '#8A5260'],
    haze: 'rgba(241,214,206,.18)',
    far:  'rgba(241,214,206,.14)',
    gnd:  ['#4A2430', '#36161F'],
    face: '#7E4755', side: '#5C3040', roof: '#8F5666', deep: '#4A2430',
    glass:'#E2BDB6', accent: PAL.peach, gold: '#F1D6CE', ink: 'rgba(241,214,206,.4)',
    tree: ['#59303C', '#6B3C48']
  };

  /* объём в аксонометрии: передняя грань, правый бок, кровля */
  function box3(ctx, x, y, w, h, d, C) {
    const dy = d * 0.45;
    ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + d, y - dy);
    ctx.lineTo(x + w + d, y - dy + h); ctx.lineTo(x + w, y + h); ctx.closePath();
    ctx.fillStyle = C.side; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d, y - dy);
    ctx.lineTo(x + w + d, y - dy); ctx.lineTo(x + w, y); ctx.closePath();
    ctx.fillStyle = C.roof; ctx.fill();
    ctx.fillStyle = C.face; ctx.fillRect(x, y, w, h);
  }

  function windows(ctx, x, y, w, h, cols, rows, C, R, pad) {
    const p = pad === undefined ? 0.26 : pad;
    const cw = w / cols, ch = h / rows;
    const ww = cw * (1 - p), wh = ch * (1 - p);
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      if (ww < 1.2 || wh < 1.2) continue;
      const wx = x + cw * i + (cw - ww) / 2, wy = y + ch * j + (ch - wh) / 2;
      ctx.globalAlpha = 0.5 + R() * 0.42;
      rr(ctx, wx, wy, ww, wh, Math.min(2.5, ww / 3));
      ctx.fillStyle = C.glass; ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function shadow(ctx, cx, gy, w, C) {
    ctx.save();
    const g = ctx.createRadialGradient(cx, gy, 0, cx, gy, w);
    g.addColorStop(0, 'rgba(84,41,52,.26)'); g.addColorStop(1, 'rgba(84,41,52,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(cx, gy, w, w * 0.12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function bush(ctx, x, y, s, C, R) {
    for (let i = 0; i < 6; i++) {
      ctx.globalAlpha = .55 + R() * .3;
      ctx.fillStyle = i % 2 ? C.tree[0] : C.tree[1];
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(a) * s * .3, y - s * .5 + Math.sin(a) * s * .2, s * .42, s * .3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  SM.plate = function (cv, type, seed, opt) {
    opt = opt || {};
    const g = fit(cv), ctx = g.ctx, w = g.w, h = g.h, R = rnd(seed);
    const C = opt.dark ? DARK : LIGHT;
    const hz = h * 0.80;              // линия горизонта
    const gy = h * 0.86;              // плоскость земли под объектом
    const cx = w * 0.47;

    /* --- небо --- */
    const sky = ctx.createLinearGradient(0, 0, 0, hz);
    sky.addColorStop(0, C.sky[0]); sky.addColorStop(.58, C.sky[1]); sky.addColorStop(1, C.sky[2]);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, hz + 2);

    /* --- солнце --- */
    const sx = w * 0.80, sy = h * 0.21, sr = Math.min(w, h) * 0.24;
    const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
    sun.addColorStop(0, opt.dark ? 'rgba(241,214,206,.34)' : 'rgba(255,255,255,.78)');
    sun.addColorStop(.35, opt.dark ? 'rgba(241,214,206,.12)' : 'rgba(255,255,255,.3)');
    sun.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sun; ctx.fillRect(0, 0, w, hz);

    /* --- дальний план --- */
    ctx.fillStyle = C.far;
    ctx.beginPath(); ctx.moveTo(-10, hz);
    const peaks = 5;
    for (let i = 0; i <= peaks; i++) {
      const px = (w + 20) * (i / peaks) - 10;
      const py = hz - (h * 0.05 + R() * h * 0.11);
      ctx.lineTo(px, py); ctx.lineTo(px + (w / peaks) * .5, hz - h * 0.03);
    }
    ctx.lineTo(w + 10, hz); ctx.closePath(); ctx.fill();

    /* --- земля --- */
    const gnd = ctx.createLinearGradient(0, hz, 0, h);
    gnd.addColorStop(0, C.gnd[0]); gnd.addColorStop(1, C.gnd[1]);
    ctx.fillStyle = gnd; ctx.fillRect(0, hz, w, h - hz);

    const S = Math.min(w, h);
    const d = S * 0.10;               // глубина аксонометрии

    shadow(ctx, cx + S * .06, gy + 2, S * 0.52, C);

    /* --- объём по типологии --- */
    switch (type) {

      case 'crown': {                                   // башня с венчанием
        const bw = S * .30, bh = h * .56, x = cx - bw / 2, y = gy - bh;
        box3(ctx, cx - S * .42, gy - h * .13, S * .84, h * .13, d * .7, C);
        box3(ctx, x, y, bw, bh, d, C);
        windows(ctx, x, y, bw, bh, 5, 13, C, R);
        ctx.beginPath();
        ctx.moveTo(x - bw * .14, y); ctx.lineTo(x + bw * 1.14, y);
        ctx.lineTo(x + bw * .88, y - h * .1); ctx.lineTo(x + bw * .12, y - h * .1);
        ctx.closePath(); ctx.fillStyle = C.gold; ctx.fill();
        ctx.strokeStyle = C.accent; ctx.lineWidth = 1.5; ctx.stroke();
        break;
      }

      case 'slab': {                                    // плита на опорах
        const bw = S * .80, bh = h * .30, x = cx - bw / 2, y = gy - bh - h * .07;
        for (let i = 0; i <= 6; i++) {
          const px = x + (bw / 6) * i;
          ctx.fillStyle = C.deep; ctx.fillRect(px - 2.5, y + bh, 5, h * .07);
        }
        box3(ctx, x, y, bw, bh, d, C);
        windows(ctx, x, y, bw, bh, 14, 3, C, R, .22);
        ctx.beginPath();
        ctx.moveTo(x - bw * .06, y); ctx.lineTo(x + bw * 1.06, y);
        ctx.lineTo(x + bw * 1.06 + d, y - d * .45); ctx.lineTo(x - bw * .06 + d, y - d * .45);
        ctx.closePath(); ctx.fillStyle = C.roof; ctx.fill();
        ctx.fillStyle = C.face; ctx.fillRect(x - bw * .06, y - h * .022, bw * 1.12, h * .022);
        break;
      }

      case 'spires': {                                  // объём с башнями
        const bw = S * .64, x = cx - bw / 2, bh = h * .28, y = gy - bh;
        [[.16, .11, .40], [.5, .15, .54], [.84, .11, .34]].forEach(t => {
          const tx = x + bw * t[0], tw = S * t[1], th = h * t[2];
          box3(ctx, tx - tw / 2, y - th, tw, th, d * .55, C);
          windows(ctx, tx - tw / 2, y - th, tw, th, 2, 6, C, R, .4);
          ctx.beginPath();
          ctx.moveTo(tx - tw * .62, y - th); ctx.lineTo(tx, y - th - h * .13);
          ctx.lineTo(tx + tw * .62, y - th); ctx.closePath();
          ctx.fillStyle = C.roof; ctx.fill();
          ctx.fillStyle = C.accent; ctx.fillRect(tx - 1.2, y - th - h * .18, 2.4, h * .05);
        });
        box3(ctx, x, y, bw, bh, d, C);
        windows(ctx, x, y, bw, bh, 6, 2, C, R);
        break;
      }

      case 'arcade': {                                  // ярусы аркад
        const bw = S * .82, x = cx - bw / 2, th = h * .19;
        for (let t = 2; t >= 0; t--) {
          const y = gy - th * (t + 1);
          box3(ctx, x, y, bw, th, d * (1 - t * .1), C);
          const n = 8, aw = bw / n;
          for (let i = 0; i < n; i++) {
            const ax = x + aw * i + aw / 2, ar = aw * .3;
            ctx.fillStyle = C.glass; ctx.globalAlpha = .55;
            ctx.beginPath();
            ctx.moveTo(ax - ar, y + th * .9); ctx.lineTo(ax - ar, y + th * .5);
            ctx.arc(ax, y + th * .5, ar, Math.PI, 0);
            ctx.lineTo(ax + ar, y + th * .9); ctx.closePath(); ctx.fill();
            ctx.globalAlpha = 1;
          }
          ctx.fillStyle = C.roof; ctx.fillRect(x, y, bw, h * .012);
        }
        break;
      }

      case 'dome': {                                    // купол на основании
        const bw = S * .66, x = cx - bw / 2, bh = h * .22, y = gy - bh;
        [[-.52, .07, .30], [.52, .07, .30]].forEach(m => {
          const mx = cx + S * m[0], mw = S * m[1], mh = h * m[2];
          box3(ctx, mx - mw / 2, gy - mh, mw, mh, d * .35, C);
          ctx.fillStyle = C.roof;
          ctx.beginPath(); ctx.ellipse(mx, gy - mh, mw * .62, mh * .18, 0, Math.PI, 0); ctx.fill();
        });
        box3(ctx, x, y, bw, bh, d, C);
        windows(ctx, x, y, bw, bh, 7, 1, C, R, .45);
        const dr = bw * .42;
        const dg = ctx.createLinearGradient(cx - dr, y - dr, cx + dr, y);
        dg.addColorStop(0, C.face); dg.addColorStop(1, C.side);
        ctx.fillStyle = dg;
        ctx.beginPath(); ctx.ellipse(cx, y, dr, dr * .92, 0, Math.PI, 0); ctx.fill();
        ctx.fillStyle = C.glass; ctx.globalAlpha = .5;
        for (let i = 0; i < 5; i++) {
          const a = Math.PI + Math.PI * (i + .5) / 5;
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(a) * dr * .72, y + Math.sin(a) * dr * .62, dr * .07, dr * .11, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = C.accent; ctx.fillRect(cx - 1.6, y - dr * .95 - h * .06, 3.2, h * .07);
        break;
      }

      case 'bowl': {                                    // чаша сооружения
        ctx.beginPath();
        ctx.moveTo(cx - S * .56, gy);
        ctx.bezierCurveTo(cx - S * .5, gy - h * .34, cx + S * .5, gy - h * .34, cx + S * .56, gy);
        ctx.closePath();
        const bg = ctx.createLinearGradient(0, gy - h * .34, 0, gy);
        bg.addColorStop(0, C.face); bg.addColorStop(1, C.side);
        ctx.fillStyle = bg; ctx.fill();
        ctx.strokeStyle = C.deep; ctx.lineWidth = 1; ctx.globalAlpha = .45;
        for (let i = 1; i < 7; i++) {
          const k = i / 7;
          ctx.beginPath();
          ctx.moveTo(cx - S * .56 * (1 - k * .32), gy - h * .035 * i * .8);
          ctx.bezierCurveTo(cx - S * .44, gy - h * (.32 - k * .09), cx + S * .44, gy - h * (.32 - k * .09), cx + S * .56 * (1 - k * .32), gy - h * .035 * i * .8);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = opt.dark ? '#A9C6D1' : '#DCEAF0';
        ctx.beginPath(); ctx.ellipse(cx, gy - h * .055, S * .26, h * .045, 0, 0, Math.PI * 2); ctx.fill();
        break;
      }

      case 'tower': {                                   // башня с уступами
        let bw = S * .40, y = gy, dd = d;
        for (let i = 0; i < 5; i++) {
          const bh = h * (.19 - i * .017);
          box3(ctx, cx - bw / 2, y - bh, bw, bh, dd, C);
          windows(ctx, cx - bw / 2, y - bh, bw, bh, 4, 5, C, R, .38);
          y -= bh; bw *= .76; dd *= .76;
        }
        ctx.fillStyle = C.accent; ctx.fillRect(cx - 1.8, y - h * .13, 3.6, h * .13);
        break;
      }

      case 'shell': {                                   // оболочки
        const shells = [[-.30, .40, .34], [.02, .52, .46], [.34, .36, .30]];
        shells.forEach((s, i) => {
          const sxp = cx + S * s[0], sw = S * s[1], sh = h * s[2];
          const sg = ctx.createLinearGradient(sxp - sw / 2, gy - sh, sxp + sw / 2, gy);
          sg.addColorStop(0, C.face); sg.addColorStop(1, i % 2 ? C.side : C.roof);
          ctx.beginPath();
          ctx.moveTo(sxp - sw / 2, gy);
          ctx.bezierCurveTo(sxp - sw * .5, gy - sh, sxp + sw * .12, gy - sh * 1.04, sxp + sw / 2, gy);
          ctx.closePath(); ctx.fillStyle = sg; ctx.fill();
          ctx.strokeStyle = C.deep; ctx.globalAlpha = .3; ctx.lineWidth = 1;
          for (let k = 1; k < 5; k++) {
            const kk = k / 5;
            ctx.beginPath();
            ctx.moveTo(sxp - sw / 2 + sw * kk * .46, gy);
            ctx.bezierCurveTo(sxp - sw * .4 + sw * kk * .38, gy - sh * (1 - kk * .3), sxp, gy - sh * (1 - kk * .36), sxp + sw / 2 - sw * kk * .26, gy);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        });
        ctx.fillStyle = C.deep; ctx.globalAlpha = .4;
        ctx.fillRect(cx - S * .6, gy, S * 1.2, h * .02); ctx.globalAlpha = 1;
        break;
      }

      case 'cantilever': {                              // консоли у ядра
        const core = S * .16;
        box3(ctx, cx - core / 2, gy - h * .52, core, h * .52, d * .6, C);
        [[.46, .80, -.08], [.30, .62, .20], [.16, .44, -.04]].forEach((p, i) => {
          const py = gy - h * p[0], pw = S * p[1], px = cx - pw / 2 + S * p[2];
          ctx.fillStyle = 'rgba(84,41,52,.16)';
          ctx.fillRect(px + 4, py + h * .072, pw, h * .016);
          box3(ctx, px, py, pw, h * .072, d * .5, C);
          ctx.fillStyle = C.glass; ctx.globalAlpha = .45;
          ctx.fillRect(px + pw * .08, py + h * .018, pw * .84, h * .035);
          ctx.globalAlpha = 1;
        });
        ctx.fillStyle = opt.dark ? '#A9C6D1' : '#CFE2EA';
        ctx.globalAlpha = .55; ctx.fillRect(0, gy - h * .01, w, h * .05); ctx.globalAlpha = 1;
        break;
      }

      case 'modular': {                                 // сборные модули
        const m = S * .115;
        for (let row = 0; row < 4; row++) for (let col = 0; col < 5; col++) {
          if (R() > .86) continue;
          const ox = (R() - .5) * m * .55;
          const x = cx - m * 2.6 + col * m * 1.04 + ox;
          const y = gy - (row + 1) * m * .94 - (col % 2) * m * .3;
          box3(ctx, x, y, m * .9, m * .9, d * .45, C);
          ctx.fillStyle = C.glass; ctx.globalAlpha = .5;
          rr(ctx, x + m * .16, y + m * .18, m * .58, m * .42, 3); ctx.fill();
          ctx.globalAlpha = 1;
        }
        break;
      }

      case 'frame': {                                   // каркас и инженерия
        const bw = S * .70, bh = h * .46, x = cx - bw / 2, y = gy - bh - h * .06;
        for (let i = 0; i <= 5; i++) { ctx.fillStyle = C.deep; ctx.fillRect(x + (bw / 5) * i - 2.5, y + bh, 5, h * .06); }
        box3(ctx, x, y, bw, bh, d, C);
        ctx.fillStyle = C.glass; ctx.globalAlpha = .42;
        for (let j = 0; j < 4; j++) ctx.fillRect(x + bw * .05, y + bh * (.08 + j * .24), bw * .9, bh * .15);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = C.accent; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x - 8, y + bh * .12); ctx.lineTo(x - 8, y + bh); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + bw + 8, y + bh * .3); ctx.lineTo(x + bw + 8, y + bh); ctx.stroke();
        ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(x - 8, y + bh * .88); ctx.lineTo(x + bw * .5, y + bh * .52); ctx.lineTo(x + bw + 8, y + bh * .4); ctx.stroke();
        break;
      }

      default: {                                        // каркасный объём
        const bw = S * .72, bh = h * .44, x = cx - bw / 2, y = gy - bh;
        box3(ctx, x, y, bw, bh, d, C);
        for (let j = 0; j < 3; j++) {
          ctx.fillStyle = C.glass; ctx.globalAlpha = .5;
          ctx.fillRect(x + bw * .04, y + bh * (.1 + j * .3), bw * .92, bh * .18);
          ctx.globalAlpha = 1;
          ctx.fillStyle = C.roof; ctx.fillRect(x, y + bh * (.28 + j * .3), bw, bh * .035);
        }
        box3(ctx, x + bw * .06, gy - h * .1, bw * .3, h * .1, d * .4, C);
      }
    }

    /* --- передний план --- */
    bush(ctx, w * .08, h * .99, S * .15, C, R);
    bush(ctx, w * .94, h * 1.01, S * .18, C, R);
    ctx.fillStyle = C.haze;
    ctx.fillRect(0, hz - 1, w, 2);

    /* --- виньетка --- */
    const vg = ctx.createRadialGradient(w / 2, h * .45, Math.min(w, h) * .3, w / 2, h * .5, Math.max(w, h) * .78);
    vg.addColorStop(0, 'rgba(84,41,52,0)'); vg.addColorStop(1, 'rgba(84,41,52,.2)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
  };

  SM.drawPlates = function (root, force) {
    SM.$$('canvas[data-plate]', root || document).forEach(cv => {
      if (cv.dataset.done === '1' && !force) return;
      cv.dataset.done = '1';
      SM.plate(cv, cv.dataset.plate, parseInt(cv.dataset.seed || '1', 10), {
        dark: cv.dataset.dark === '1'
      });
    });
  };

  let plateT = null;
  window.addEventListener('resize', () => {
    clearTimeout(plateT);
    plateT = setTimeout(() => SM.drawPlates(document, true), 220);
  });

  /* ====================================== локальный анализ изображения ==== */
  SM.analyze = function (src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = function () {
        const N = 120;
        const k = Math.min(1, N / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(8, Math.round(img.naturalWidth * k));
        const h = Math.max(8, Math.round(img.naturalHeight * k));
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, w, h);
        let d;
        try { d = ctx.getImageData(0, 0, w, h).data; }
        catch (e) { resolve(null); return; }

        const bins = {};
        let sumL = 0, sumS = 0, n = 0;
        const gray = new Float32Array(w * h);
        for (let i = 0, p = 0; i < d.length; i += 4, p++) {
          const r = d[i], g2 = d[i + 1], b = d[i + 2];
          const key = ((r >> 4) << 8) | ((g2 >> 4) << 4) | (b >> 4);
          if (!bins[key]) bins[key] = { n: 0, r: 0, g: 0, b: 0 };
          const q = bins[key]; q.n++; q.r += r; q.g += g2; q.b += b;
          const mx = Math.max(r, g2, b), mn = Math.min(r, g2, b);
          sumL += (mx + mn) / 2;
          sumS += mx === mn ? 0 : (mx - mn) / ((255 - Math.abs(mx + mn - 255)) || 1);
          gray[p] = 0.299 * r + 0.587 * g2 + 0.114 * b;
          n++;
        }
        const palette = Object.keys(bins).map(k2 => bins[k2])
          .sort((a, b) => b.n - a.n).slice(0, 5)
          .map(q => '#' + [q.r / q.n, q.g / q.n, q.b / q.n]
            .map(v => Math.round(v).toString(16).padStart(2, '0')).join(''))
          .sort((a, b) => lum(a) - lum(b));

        const meanL = sumL / n;
        let varL = 0;
        for (let p = 0; p < gray.length; p++) { const dv = gray[p] - meanL; varL += dv * dv; }
        const contrast = Math.sqrt(varL / gray.length) / 128;

        let sym = 0, symN = 0;
        for (let y = 0; y < h; y++) for (let x = 0; x < w >> 1; x++) {
          sym += Math.abs(gray[y * w + x] - gray[y * w + (w - 1 - x)]); symN++;
        }
        const symmetry = Math.max(0, 1 - (sym / symN) / 90);

        let gxs = 0, gys = 0, edges = 0;
        for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
          const i0 = y * w + x;
          const gx = -gray[i0 - w - 1] - 2 * gray[i0 - 1] - gray[i0 + w - 1]
                     + gray[i0 - w + 1] + 2 * gray[i0 + 1] + gray[i0 + w + 1];
          const gyv = -gray[i0 - w - 1] - 2 * gray[i0 - w] - gray[i0 - w + 1]
                      + gray[i0 + w - 1] + 2 * gray[i0 + w] + gray[i0 + w + 1];
          gxs += Math.abs(gx); gys += Math.abs(gyv);
          if (Math.abs(gx) + Math.abs(gyv) > 150) edges++;
        }

        resolve({
          palette: palette,
          brightness: meanL / 255,
          contrast: Math.min(1, contrast),
          saturation: Math.min(1, sumS / n),
          symmetry: Math.min(1, symmetry),
          vertical: gxs / (gxs + gys || 1),
          density: Math.min(1, (edges / ((w - 2) * (h - 2))) * 2.6),
          ratio: img.naturalWidth / img.naturalHeight,
          px: img.naturalWidth + '×' + img.naturalHeight
        });
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  };

  function lum(hex) {
    const v = parseInt(hex.slice(1), 16);
    return 0.299 * ((v >> 16) & 255) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255);
  }
  SM.lum = lum;

  SM.rhythmWord = v => v > .56 ? 'Вертикальный' : v < .44 ? 'Горизонтальный' : 'Смешанный';
  SM.symWord    = v => v > .72 ? 'Выраженная симметрия' : v > .52 ? 'Частичная симметрия' : 'Асимметричная композиция';
  SM.densWord   = v => v > .55 ? 'Высокая детализация' : v > .28 ? 'Умеренная детализация' : 'Крупные плоскости';

  /* ============================================ эскиз-наложение концепции = */
  const GRADES = {
    preserve:  ['#F1D6CE', '#7A4A4A'],
    modernize: ['#EAEAEA', '#542934'],
    eco:       ['#E6EFDF', '#2F4A32'],
    reuse:     ['#F1D6CE', '#542934'],
    public:    ['#FAF0E8', '#6A3A44'],
    minimal:   ['#EAEAEA', '#4A3038'],
    custom:    ['#F1D6CE', '#542934']
  };

  SM.sketch = function (src, dirId, opts) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = function () {
        const maxW = 1400;
        const k = Math.min(1, maxW / img.naturalWidth);
        const w = Math.round(img.naturalWidth * k), h = Math.round(img.naturalHeight * k);
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const grade = GRADES[dirId] || GRADES.custom;
        const on = id => opts.indexOf(id) > -1;

        const gr = ctx.createLinearGradient(0, 0, 0, h);
        gr.addColorStop(0, grade[0]); gr.addColorStop(1, grade[1]);
        ctx.globalCompositeOperation = 'soft-light';
        ctx.globalAlpha = .55; ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = .1; ctx.fillStyle = grade[0]; ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;

        if (on('solar')) {
          ctx.save();
          ctx.globalAlpha = .62; ctx.fillStyle = '#1E2A38';
          ctx.beginPath();
          ctx.moveTo(w * .22, h * .12); ctx.lineTo(w * .78, h * .09);
          ctx.lineTo(w * .80, h * .15); ctx.lineTo(w * .20, h * .18); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = .5; ctx.strokeStyle = '#9BB3C9'; ctx.lineWidth = 1;
          for (let i = 1; i < 10; i++) {
            const t = i / 10;
            ctx.beginPath();
            ctx.moveTo(w * (.22 + .56 * t), h * (.12 - .03 * t));
            ctx.lineTo(w * (.20 + .60 * t), h * (.18 - .03 * t)); ctx.stroke();
          }
          ctx.restore();
        }

        if (on('green-roof')) canopyBand(ctx, w, h, h * .17, w * .18, w * .84, .55);

        if (on('green-wall')) {
          [[.07, .17], [.84, .94]].forEach(s => {
            ctx.save(); ctx.globalAlpha = .5;
            const x0 = w * s[0], x1 = w * s[1];
            for (let y = h * .22; y < h * .82; y += 13) {
              ctx.fillStyle = y % 26 < 13 ? '#3E6137' : '#527A45';
              ctx.beginPath();
              ctx.ellipse((x0 + x1) / 2, y, (x1 - x0) / 2, 9, 0, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
          });
        }

        if (on('facade-rhythm')) {
          ctx.save(); ctx.globalAlpha = .3; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1.4;
          for (let i = 1; i < 11; i++) { const x = w * (.14 + .72 * i / 11); ctx.beginPath(); ctx.moveTo(x, h * .2); ctx.lineTo(x, h * .78); ctx.stroke(); }
          ctx.restore();
        }

        if (on('lighting')) {
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          [[.2, .74], [.5, .78], [.8, .74]].forEach(p => {
            const rg = ctx.createRadialGradient(w * p[0], h * p[1], 0, w * p[0], h * p[1], w * .17);
            rg.addColorStop(0, 'rgba(255,214,170,.5)'); rg.addColorStop(1, 'rgba(255,214,170,0)');
            ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
          });
          ctx.globalAlpha = .5; ctx.fillStyle = 'rgba(255,226,180,.9)';
          for (let r = 0; r < 5; r++) for (let cI = 0; cI < 8; cI++) {
            if ((r + cI) % 3) continue;
            ctx.fillRect(w * (.18 + cI * .085), h * (.26 + r * .09), w * .022, h * .028);
          }
          ctx.restore();
        }

        if (on('pedestrian')) {
          ctx.save(); ctx.globalAlpha = .4; ctx.fillStyle = '#D8CFC6';
          ctx.fillRect(0, h * .88, w, h * .12);
          ctx.globalAlpha = .35; ctx.strokeStyle = '#A99A90'; ctx.lineWidth = 1;
          for (let x = 0; x < w; x += 34) { ctx.beginPath(); ctx.moveTo(x, h * .88); ctx.lineTo(x - 16, h); ctx.stroke(); }
          for (let y = h * .9; y < h; y += 14) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
          ctx.restore();
        }

        if (on('landscape')) {
          for (let i = 0; i < 5; i++) {
            const x = w * (.08 + .84 * (i / 4)) + (i % 2 ? 18 : -18);
            tree(ctx, x, h * .93, w * .085, h * .3);
          }
        }

        if (on('water')) {
          ctx.save(); ctx.globalAlpha = .45; ctx.fillStyle = '#7FA6B5';
          ctx.fillRect(0, h * .955, w, h * .022);
          ctx.globalAlpha = .3; ctx.strokeStyle = '#DCEAF0'; ctx.lineWidth = 1;
          for (let x = 0; x < w; x += 26) { ctx.beginPath(); ctx.moveTo(x, h * .962); ctx.lineTo(x + 13, h * .968); ctx.stroke(); }
          ctx.restore();
        }

        if (on('furniture')) {
          ctx.save(); ctx.globalAlpha = .62; ctx.fillStyle = '#4A3A33';
          [.26, .62].forEach(p => {
            ctx.fillRect(w * p, h * .915, w * .1, h * .012);
            ctx.fillRect(w * p + 3, h * .927, w * .008, h * .022);
            ctx.fillRect(w * p + w * .1 - 9, h * .927, w * .008, h * .022);
          });
          ctx.restore();
        }

        if (on('accessible')) {
          ctx.save(); ctx.globalAlpha = .55; ctx.fillStyle = '#C9BFB6';
          ctx.beginPath();
          ctx.moveTo(w * .36, h * .9); ctx.lineTo(w * .62, h * .9);
          ctx.lineTo(w * .66, h * .955); ctx.lineTo(w * .32, h * .955); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = .7; ctx.strokeStyle = '#8E8077'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(w * .36, h * .885); ctx.lineTo(w * .64, h * .885); ctx.stroke();
          ctx.restore();
        }

        if (on('ground-floor')) {
          ctx.save(); ctx.globalAlpha = .34; ctx.fillStyle = '#FFE9CE';
          ctx.fillRect(w * .12, h * .76, w * .76, h * .11);
          ctx.globalAlpha = .55; ctx.strokeStyle = '#FFF3E2'; ctx.lineWidth = 1.5;
          for (let i = 0; i <= 6; i++) { const x = w * (.12 + .76 * i / 6); ctx.beginPath(); ctx.moveTo(x, h * .76); ctx.lineTo(x, h * .87); ctx.stroke(); }
          ctx.restore();
        }

        ctx.strokeStyle = 'rgba(84,41,52,.5)'; ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, w - 2, h - 2);
        const lbl = 'ЭСКИЗ-НАЛОЖЕНИЕ · SITE MEMORY AI · 4WARD';
        ctx.font = '700 ' + Math.max(10, Math.round(w / 86)) + 'px Nunito, system-ui, sans-serif';
        const tw = ctx.measureText(lbl).width;
        ctx.fillStyle = 'rgba(84,41,52,.88)';
        rr(ctx, 12, h - 34, tw + 22, 24, 12); ctx.fill();
        ctx.fillStyle = '#F1D6CE';
        ctx.fillText(lbl, 23, h - 17);

        resolve(c.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  };

  function canopyBand(ctx, w, h, y, x0, x1, a) {
    ctx.save(); ctx.globalAlpha = a;
    for (let x = x0; x < x1; x += 16) {
      ctx.fillStyle = (x / 16) % 2 ? '#3F6338' : '#577F49';
      ctx.beginPath(); ctx.ellipse(x, y + Math.sin(x / 40) * 5, 18, 11, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function tree(ctx, x, baseY, rw, rh) {
    ctx.save();
    ctx.globalAlpha = .72; ctx.fillStyle = '#4A3B30';
    ctx.fillRect(x - rw * .05, baseY - rh * .42, rw * .1, rh * .42);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      ctx.globalAlpha = .58;
      ctx.fillStyle = i % 2 ? '#3E6137' : '#4F7A42';
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(a) * rw * .34, baseY - rh * .62 + Math.sin(a) * rh * .17,
        rw * .42, rh * .23, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

})(window.SM);
