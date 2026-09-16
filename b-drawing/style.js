/*
 * 營造業官網骨架 · 風格 B「施工圖」專屬互動（在 site.js 之後以 defer 載入）
 * ------------------------------------------------------------------
 * 1. 首頁 [data-elevation]：用 YS.site.projects 繪製「實績立面圖」SVG
 *    - 所有案件共用一條 GL 地面線，依完工年份由左到右排列
 *    - 建物高度依 floors 等比；寬度依 √area 並限制範圍
 *    - floors／area 缺值的案件用虛線畫，標註「規模待補」
 *    - 左側標 1F–4F 樓層記號，每棟下方用等寬字標 district 與 year
 *    - 每棟建物是連到案件內頁的連結（hover／focus 變工程綠，樣式在 style.css）
 *    - 依容器寬度重新排版，1 單位 = 1px；放不下時在 .elev-scroll 裡橫向捲動
 * 2. 案件內頁 [data-elevation-single]：只畫目前案件的單棟立面（不是連結）
 */
(function () {
  'use strict';

  var YS = window.YS;
  if (!YS || !YS.site) return;

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var uid = 0;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function positive(v) { return typeof v === 'number' && isFinite(v) && v > 0 ? v : null; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function r1(v) { return Math.round(v * 10) / 10; }
  function thousands(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function text(v) { return YS.textOf(v); }

  /* 尺寸設定：floor = 每層高度，k = 寬度係數（√面積 × k） */
  function metrics(single, width) {
    if (single) {
      return { floor: 44, k: 6.4, minW: 96, maxW: 240, unknownW: 150, gapMin: 0, gapMax: 0, top: 52, below: 64 };
    }
    var roomy = width >= 900;
    return {
      floor: roomy ? 40 : 32,
      k: roomy ? 4.6 : 3.5,
      minW: roomy ? 80 : 58,
      maxW: roomy ? 160 : 118,
      unknownW: roomy ? 108 : 80,
      gapMin: roomy ? 48 : 28,
      gapMax: 190,
      top: 52,
      below: 64
    };
  }

  function build(list, width, opts) {
    var single = !!opts.single;
    var m = metrics(single, width);
    var lead = Math.max(12, opts.lead || 0);
    var axis = lead + 32;
    var start = axis + (single ? 36 : 44);
    var padR = Math.max(16, opts.lead || 0);

    var levels = 4;
    var items = list.map(function (p) {
      var floors = positive(p.floors);
      var area = positive(p.area);
      if (floors && Math.ceil(floors) > levels) levels = Math.ceil(floors);
      return {
        p: p,
        floors: floors,
        area: area,
        unknown: !(floors && area),
        w: Math.round(area ? clamp(Math.sqrt(area) * m.k, m.minW, m.maxW) : m.unknownW)
      };
    });

    var n = items.length;
    var sumW = items.reduce(function (s, it) { return s + it.w; }, 0);
    var natural = start + sumW + m.gapMin * Math.max(0, n - 1) + padR;
    var W = Math.max(Math.floor(width), Math.ceil(natural));
    var room = W - start - padR;
    var gap = n > 1 ? clamp((room - sumW) / (n - 1), m.gapMin, m.gapMax) : 0;
    var x = start + Math.max(0, (room - sumW - gap * Math.max(0, n - 1)) / 2);
    var G = m.top + levels * m.floor;
    var H = G + m.below;
    var hatch = 'elev-hatch-' + (++uid);
    var out = [];

    out.push('<svg class="elev-svg' + (opts.animate ? ' is-drawing' : '') + '" xmlns="http://www.w3.org/2000/svg"' +
      ' width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '"' +
      ' role="' + (single ? 'img' : 'group') + '" aria-label="' + esc(opts.label) + '">');
    out.push('<defs><pattern id="' + hatch + '" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
      '<path class="elev-hatch-line" d="M0 0V8"/></pattern></defs>');

    /* 樓層線、樓層記號、GL 與地坪斜線 */
    out.push('<g class="elev-grid" aria-hidden="true">');
    out.push('<rect class="elev-earth" x="0" y="' + G + '" width="' + W + '" height="10" fill="url(#' + hatch + ')"/>');
    for (var L = 1; L <= levels; L++) {
      var ly = G - L * m.floor;
      out.push('<path class="elev-level" d="M0 ' + ly + 'H' + W + '"/>');
      out.push('<path class="elev-mark" d="M' + (axis - 5) + ' ' + (ly - 8) + 'h10l-5 8z"/>');
      out.push('<text class="elev-floor" x="' + (axis - 10) + '" y="' + r1(ly + m.floor / 2 + 4) + '" text-anchor="end">' + L + 'F</text>');
    }
    out.push('<path class="elev-axis" d="M' + axis + ' ' + (G - levels * m.floor - 10) + 'V' + G + '"/>');
    out.push('<path class="elev-gl" d="M0 ' + G + 'H' + W + '"/>');
    out.push('<path class="elev-mark" d="M' + (axis - 5) + ' ' + (G - 8) + 'h10l-5 8z"/>');
    out.push('<text class="elev-floor" x="' + (axis - 10) + '" y="' + (G + 30) + '" text-anchor="end">GL</text>');
    out.push('</g>');

    /* 建物 */
    items.forEach(function (it, i) {
      var p = it.p;
      var w = it.w;
      var h = it.floors ? it.floors * m.floor : Math.round(2.5 * m.floor);
      var y = G - h;
      var cx = x + w / 2;
      var name = text(p.name);
      var year = text(p.year);
      var scale = it.unknown ? '規模待補' : text(p.scale);
      var cls = 'elev-bldg' + (it.unknown ? ' is-unknown' : '') + (single ? ' is-static' : '');
      var s = [];

      if (single) {
        s.push('<g class="' + cls + '" style="--i:' + i + '">');
      } else {
        s.push('<a class="' + cls + '" href="' + esc(p.$href) + '" style="--i:' + i + '"' +
          ' aria-label="' + esc(name + '，' + year + ' 年完工，' + scale) + '"><title>' + esc(name) + '</title>');
        var top = y - 34;
        var box = ' x="' + r1(x - 12) + '" y="' + top + '" width="' + (w + 24) + '" height="' + (G + 54 - top) + '"';
        s.push('<rect class="elev-hit"' + box + '/>');
        s.push('<rect class="elev-focus"' + box + '/>');
      }

      s.push('<rect class="elev-body" x="' + r1(x) + '" y="' + y + '" width="' + w + '" height="' + h + '" style="--len:' + (2 * (w + h)) + '"/>');

      if (!it.unknown) {
        var slabs = '';
        for (var f = 1; f < it.floors; f++) slabs += 'M' + r1(x) + ' ' + (G - f * m.floor) + 'h' + w;
        if (slabs) s.push('<path class="elev-slab" d="' + slabs + '"/>');

        var inner = w - 16;
        var count = Math.max(1, Math.floor(inner / 24));
        var cell = inner / count;
        var ww = Math.max(6, Math.min(12, cell - 8));
        var wh = Math.round(m.floor * 0.36);
        var dw = Math.min(18, Math.round(w * 0.2));
        var dh = Math.round(m.floor * 0.62);
        var dx = cx - dw / 2;
        var win = '';
        for (f = 0; f < Math.ceil(it.floors); f++) {
          var wy = G - (f + 1) * m.floor + Math.round(m.floor * 0.3);
          for (var j = 0; j < count; j++) {
            var wx = x + 8 + cell * (j + 0.5) - ww / 2;
            if (f === 0 && wx + ww > dx - 5 && wx < dx + dw + 5) continue;
            win += 'M' + r1(wx) + ' ' + wy + 'h' + r1(ww) + 'v' + wh + 'h' + r1(-ww) + 'z';
          }
        }
        if (win) s.push('<path class="elev-win" d="' + win + '"/>');
        s.push('<path class="elev-door" d="M' + r1(dx) + ' ' + G + 'v' + (-dh) + 'h' + dw + 'v' + dh + '"/>');

        /* 寬度尺寸線與面積標註 */
        var ay = y - 12;
        s.push('<path class="elev-dim" d="M' + r1(x) + ' ' + (y - 18) + 'V' + (y - 4) +
          'M' + r1(x + w) + ' ' + (y - 18) + 'V' + (y - 4) +
          'M' + r1(x - 4) + ' ' + ay + 'H' + r1(x + w + 4) + '"/>');
        s.push('<path class="elev-tick" d="M' + r1(x - 3) + ' ' + (ay + 3) + 'l6 -6M' + r1(x + w - 3) + ' ' + (ay + 3) + 'l6 -6"/>');
        s.push('<text class="elev-area" x="' + r1(cx) + '" y="' + (ay - 6) + '" text-anchor="middle">' + thousands(it.area) + '㎡</text>');
      } else {
        s.push('<text class="elev-area elev-missing" x="' + r1(cx) + '" y="' + (y - 12) + '" text-anchor="middle">規模待補</text>');
      }

      s.push('<text class="elev-district" x="' + r1(cx) + '" y="' + (G + 30) + '" text-anchor="middle">' + esc(text(p.district)) + '</text>');
      s.push('<text class="elev-year" x="' + r1(cx) + '" y="' + (G + 48) + '" text-anchor="middle">' + esc(year) + '</text>');
      s.push(single ? '</g>' : '</a>');
      out.push(s.join(''));
      x += w + gap;
    });

    out.push('</svg>');
    return { html: out.join(''), width: W };
  }

  function mount(host, list, opts) {
    var last = -1;
    var first = true;

    function draw() {
      var width = host.clientWidth;
      if (!width || Math.abs(width - last) < 2) return;
      last = width;
      var lead = 0;
      if (opts.alignTo) {
        var ref = opts.alignTo;
        lead = ref.getBoundingClientRect().left + (parseFloat(window.getComputedStyle(ref).paddingLeft) || 0) -
          host.getBoundingClientRect().left;
      }
      var result = build(list, width, {
        single: opts.single,
        lead: lead,
        label: opts.label,
        animate: first && !reduceMotion
      });
      host.innerHTML = result.html;
      first = false;
      var scrollable = result.width > width + 1;
      host.classList.toggle('is-scrollable', scrollable);
      if (opts.hint) opts.hint.hidden = !scrollable;
    }

    draw();
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { window.requestAnimationFrame(draw); }).observe(host);
    } else {
      window.addEventListener('resize', function () { window.requestAnimationFrame(draw); });
    }
  }

  /* 1. 首頁實績立面圖：依完工年份排序（同年保持原順序） */
  var projects = (YS.site.projects || []).slice().sort(function (a, b) {
    return (parseInt(text(a.year), 10) || 0) - (parseInt(text(b.year), 10) || 0);
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-elevation]'), function (host) {
    if (!projects.length) return;
    var fig = host.closest('figure') || host.parentNode;
    mount(host, projects, {
      label: '實績立面圖：' + projects.length + ' 件工程依完工年份由左至右排列，點選建物可看案件內容',
      alignTo: fig.querySelector('.elev-caption'),
      hint: fig.querySelector('[data-elevation-hint]')
    });
  });

  /* 2. 案件內頁單棟立面 */
  var project = YS.ctx && YS.ctx.project;
  Array.prototype.forEach.call(document.querySelectorAll('[data-elevation-single]'), function (host) {
    if (!project) return;
    var known = positive(project.floors) && positive(project.area);
    mount(host, [project], {
      single: true,
      label: text(project.name) + '立面示意：' + (known ? text(project.scale) : '規模待補')
    });
  });
})();
