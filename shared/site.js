/*
 * 營造業官網骨架：共用行為（四種風格共用）
 * ------------------------------------------------------------------
 * 1. 依 shared/content.js 的 window.SITE 填入內容：
 *    data-bind="company.phone"                          填入文字
 *    data-attr="href:company.phoneHref; title:company.name"  設定屬性
 *    <template data-each="projects" data-where="featured=true" data-limit="3">
 *      在迴圈裡用 item.name、item.$href；陣列元素是純文字時直接寫 item；迴圈可以巢狀（例如 item.$projects）
 *    data-if="project.owner" / data-unless="..."        值是空的就移除元素
 *    值是 {status:"missing"} → 顯示 note 並加 data-status="missing"（CSS 顯示「待補」）
 *    值是 {status:"draft"}   → 顯示文字並加 data-status="draft"（CSS 顯示「暫擬」）
 * 2. 案件內頁：<body data-page="project">，網址 project.html?id=p01，用 project.name 等欄位
 * 3. [data-illus="factory|station|house|crane|building|document"] 照片佔位線稿，
 *    data-ph-label="說明文字"（空字串則不顯示說明）
 * 4. 選單 [data-nav] / [data-nav-toggle]、捲動狀態 html.is-scrolled、進場動畫 [data-reveal]
 * 5. 實績篩選 [data-filter-group="#清單id"] 內的 [data-filter="廠房"|"*"]，
 *    清單項目帶 data-type；[data-filter-count] 顯示目前筆數
 * 6. <form data-demo-form> 表單示意（[data-form-status]）、<iframe data-map>、<a data-map-link>
 * 7. SEO：og／twitter 標籤、canonical、JSON-LD 結構化資料、GA4、Search Console（依 content.js 的 meta 與 seo 設定）
 * 8. 風格切換列（提案展示用）
 * 風格自己的 style.js 在本檔之後執行，可使用 window.YS（見檔尾）。
 * 以一般 <script defer> 載入，不使用 ES module，雙擊 HTML（file://）也能運作。
 */
(function () {
  'use strict';

  var SITE = window.SITE;
  var root = document.documentElement;
  if (!SITE) {
    console.error('[site.js] 找不到 window.SITE：請確認 ../shared/content.js 在 site.js 之前載入。');
    return;
  }
  root.classList.add('js');

  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var pad = function (n) { return String(n).padStart(2, '0'); };

  /* ---------- 1. 衍生資料 ---------- */
  var projects = SITE.projects || [];
  projects.forEach(function (p, i) {
    var n = projects.length;
    p.$no = pad(i + 1);
    p.$href = 'project.html?id=' + encodeURIComponent(p.id);
    p.$gallery = [1, 2, 3, 4].map(function (k) {
      return { $no: pad(k), illus: p.illus, label: '案場照片 ' + k + '｜待補，橫式 1920px 以上' };
    });
    p.$prev = projects[(i - 1 + n) % n];
    p.$next = projects[(i + 1) % n];
    p.$others = projects.filter(function (q) { return q !== p; });
  });
  (SITE.services || []).forEach(function (s, i) {
    s.$no = pad(i + 1);
    s.$href = 'services.html#' + s.id;
    s.$projects = projects.filter(function (p) { return (s.types || []).indexOf(p.type) > -1; });
    s.$count = String(s.$projects.length);
  });
  ['values', 'facts', 'certificates', 'nav'].forEach(function (key) {
    (SITE[key] || []).forEach(function (x, i) { if (x && typeof x === 'object') x.$no = pad(i + 1); });
  });
  SITE.$year = String(new Date().getFullYear());

  /* ---------- 2. 路徑解析 ---------- */
  function dig(obj, parts) {
    for (var i = 0; i < parts.length; i++) {
      if (obj == null) return undefined;
      obj = obj[parts[i]];
    }
    return obj;
  }
  function resolve(path, ctx) {
    var parts = String(path || '').trim().split('.');
    if (parts[0] === 'item') return dig(ctx.item, parts.slice(1));
    if (parts[0] === 'project') return dig(ctx.project, parts.slice(1));
    return dig(SITE, parts);
  }
  function isStatus(v) { return !!v && typeof v === 'object' && !Array.isArray(v) && 'status' in v; }
  function isEmpty(v) { return v == null || v === '' || (isStatus(v) && (v.text == null || v.text === '')); }
  function textOf(v, joiner) {
    if (v == null) return '';
    if (isStatus(v)) return isEmpty(v) ? '' : String(v.text);
    if (Array.isArray(v)) return v.map(function (x) { return textOf(x); }).join(joiner == null ? '　' : joiner);
    if (typeof v === 'object') return '';
    return String(v);
  }
  function truthy(v) {
    if (Array.isArray(v)) return v.length > 0;
    if (isEmpty(v)) return false;
    return !(v === false || v === 'false' || v === 0 || v === '0');
  }

  /* ---------- 3. 填入內容 ---------- */
  function bindText(el, v) {
    if (isEmpty(v)) {
      el.textContent = (isStatus(v) && v.note) || el.getAttribute('data-tbd') || '內容';
      el.setAttribute('data-status', 'missing');
    } else {
      el.textContent = textOf(v, el.getAttribute('data-join'));
      if (isStatus(v) && v.status === 'draft') el.setAttribute('data-status', 'draft');
    }
    if (isStatus(v) && v.note) el.setAttribute('title', v.note);
  }

  function expand(tpl, ctx) {
    var path = tpl.getAttribute('data-each');
    var list = resolve(path, ctx);
    if (!Array.isArray(list)) {
      console.warn('[site.js] data-each 找不到陣列：' + path);
      list = [];
    }
    var where = tpl.getAttribute('data-where');
    if (where && where.indexOf('=') > 0) {
      var key = where.slice(0, where.indexOf('=')).trim();
      var val = where.slice(where.indexOf('=') + 1).trim();
      list = list.filter(function (x) { return textOf(key === 'item' ? x : dig(x, key.split('.'))) === val; });
    }
    var limit = parseInt(tpl.getAttribute('data-limit'), 10);
    if (limit > 0) list = list.slice(0, limit);
    var frag = document.createDocumentFragment();
    list.forEach(function (item, i) {
      var clone = tpl.content.cloneNode(true);
      hydrate(clone, { item: item, index: i, project: ctx.project });
      frag.appendChild(clone);
    });
    tpl.parentNode.insertBefore(frag, tpl);
    tpl.setAttribute('data-expanded', '');
  }

  function hydrate(scope, ctx) {
    $$('template[data-each]:not([data-expanded])', scope).forEach(function (tpl) { expand(tpl, ctx); });
    $$('[data-if], [data-unless]', scope).forEach(function (el) {
      var ok = el.hasAttribute('data-if')
        ? truthy(resolve(el.getAttribute('data-if'), ctx))
        : !truthy(resolve(el.getAttribute('data-unless'), ctx));
      if (!ok) { if (el.parentNode) el.parentNode.removeChild(el); return; }
      el.removeAttribute('data-if');
      el.removeAttribute('data-unless');
    });
    $$('[data-bind]', scope).forEach(function (el) {
      bindText(el, resolve(el.getAttribute('data-bind'), ctx));
      el.removeAttribute('data-bind');
    });
    $$('[data-attr]', scope).forEach(function (el) {
      el.getAttribute('data-attr').split(';').forEach(function (pair) {
        var at = pair.indexOf(':');
        if (at < 1) return;
        el.setAttribute(pair.slice(0, at).trim(), textOf(resolve(pair.slice(at + 1).trim(), ctx)));
      });
      el.removeAttribute('data-attr');
    });
  }

  var ctx = { item: null, project: null };
  if (document.body.getAttribute('data-page') === 'project' && projects.length) {
    var id = new URLSearchParams(window.location.search).get('id');
    ctx.project = projects.filter(function (p) { return p.id === id; })[0] || projects[0];
    document.title = textOf(ctx.project.name) + '｜' + SITE.company.name;
  }
  hydrate(document, ctx);

  /* ---------- 4. 照片佔位線稿 ---------- */
  var ART = {
    factory: '<path d="M8 88h144"/><path d="M16 88V52l24-16v16l24-16v16l24-16v52"/><path d="M28 88V72h14v16"/>' +
      '<path d="M52 60h12v8H52zM70 60h12v8H70z"/><path d="M92 88V48h52v40"/><path d="M132 48V26h8v22"/>' +
      '<path d="M100 55h10v8h-10zM114 55h10v8h-10zM128 55h10v8h-10zM128 68h10v8h-10z"/><path d="M102 88V70h14v18"/>',
    station: '<path d="M8 88h144"/><path d="M14 30h92v8H14z"/><path d="M30 38v50M90 38v50"/>' +
      '<path d="M46 66h10v22H46zM64 66h10v22H64z"/><path d="M56 72h4v8M74 72h4v8"/>' +
      '<path d="M112 88V42h36v46"/><path d="M112 64h36"/><path d="M118 48h10v10h-10zM132 48h10v10h-10z"/><path d="M124 88V72h12v16"/>',
    house: '<path d="M8 88h144"/><path d="M24 88V24h108v64"/><path d="M60 24v64M96 24v64"/><path d="M24 40h108M24 56h108M24 72h108"/>' +
      '<path d="M34 28h16v8H34zM70 28h16v8H70zM106 28h16v8h-16zM34 44h16v8H34zM70 44h16v8H70zM106 44h16v8h-16z"/>' +
      '<path d="M34 60h16v8H34zM70 60h16v8H70zM106 60h16v8h-16z"/><path d="M30 88V77h24v11M66 88V77h24v11M102 88V77h24v11"/><path d="M40 24v-8h14v8"/>',
    crane: '<path d="M8 88h144"/><path d="M38 88V20M46 88V20"/><path d="M38 80l8-8-8-8 8-8-8-8 8-8-8-8 8-8"/>' +
      '<path d="M18 20h124"/><path d="M42 20V8M42 8L18 20M42 8l70 12"/><path d="M20 20v6h10v-6"/>' +
      '<path d="M122 20v26"/><path d="M114 46h16v8h-16z"/><path d="M84 88V60h56v28M84 74h56M98 60v28M112 60v28M126 60v28"/>',
    building: '<path d="M8 88h144"/><path d="M44 88V18h56v70"/><path d="M100 88V46h28v42"/>' +
      '<path d="M52 26h10v8H52zM66 26h10v8H66zM80 26h10v8H80zM52 40h10v8H52zM66 40h10v8H66zM80 40h10v8H80zM52 54h10v8H52zM80 54h10v8H80z"/>' +
      '<path d="M64 88V70h16v18"/><path d="M108 54h12v8h-12zM108 68h12v8h-12z"/>',
    document: '<path d="M46 12h68v78H46z"/><path d="M54 20h52v62H54z"/><path d="M66 32h28M62 44h36M62 52h36M62 60h24"/>' +
      '<circle cx="94" cy="70" r="7"/><path d="M90 76l-2 10 6-4 6 4-2-10"/>'
  };

  function placeholders(scope) {
    $$('[data-illus]', scope).forEach(function (el) {
      if (el.classList.contains('ph')) return;
      el.classList.add('ph');
      el.insertAdjacentHTML('afterbegin',
        '<svg viewBox="0 0 160 100" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
        (ART[el.getAttribute('data-illus')] || ART.building) + '</svg>');
      var label = el.hasAttribute('data-ph-label') ? el.getAttribute('data-ph-label') : '照片待補';
      if (label) {
        var span = document.createElement('span');
        span.className = 'ph-label';
        span.textContent = label;
        el.appendChild(span);
      }
      if (!el.hasAttribute('role')) {
        el.setAttribute('role', 'img');
        el.setAttribute('aria-label', label || '照片待補');
      }
    });
  }

  /* ---------- 5. 進場動畫 ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = ('IntersectionObserver' in window && !reduceMotion) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-revealed'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }) : null;

  function reveal(scope) {
    $$('[data-reveal]:not(.is-revealed)', scope).forEach(function (el) {
      if (io) io.observe(el); else el.classList.add('is-revealed');
    });
  }

  function decorate(scope) { placeholders(scope); reveal(scope); }
  decorate(document);

  /* ---------- 6. 導覽 ---------- */
  var file = decodeURIComponent(window.location.pathname.split('/').pop() || '') || 'index.html';
  var navFile = file === 'project.html' ? 'projects.html' : file;
  $$('[data-nav] a[href]').forEach(function (a) {
    if (a.getAttribute('href').split(/[?#]/)[0] === navFile) a.setAttribute('aria-current', 'page');
  });

  var toggles = $$('[data-nav-toggle]');
  function setNav(open) {
    root.classList.toggle('nav-open', open);
    toggles.forEach(function (t) { t.setAttribute('aria-expanded', String(open)); });
  }
  toggles.forEach(function (t) {
    t.setAttribute('aria-expanded', 'false');
    t.addEventListener('click', function () { setNav(!root.classList.contains('nav-open')); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && root.classList.contains('nav-open')) {
      setNav(false);
      if (toggles[0]) toggles[0].focus();
    }
  });
  $$('[data-nav] a').forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });

  var ticking = false;
  function onScroll() { root.classList.toggle('is-scrolled', window.scrollY > 8); ticking = false; }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- 7. 工程實績篩選 ---------- */
  $$('[data-filter-group]').forEach(function (group) {
    var target = document.querySelector(group.getAttribute('data-filter-group'));
    if (!target) return;
    function apply(val) {
      $$('[data-filter]', group).forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === val));
      });
      var shown = 0;
      $$('[data-type]', target).forEach(function (card) {
        var ok = val === '*' || card.getAttribute('data-type') === val;
        card.hidden = !ok;
        if (ok) shown += 1;
      });
      $$('[data-filter-count]').forEach(function (c) { c.textContent = String(shown); });
    }
    group.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filter]');
      if (b && group.contains(b)) apply(b.getAttribute('data-filter'));
    });
    apply('*');
  });

  /* ---------- 8. 表單示意、地圖、年份 ---------- */
  $$('form[data-demo-form]').forEach(function (form) {
    var status = form.querySelector('[data-form-status]');
    if (status) status.setAttribute('aria-live', 'polite');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!status) return;
      status.hidden = false;
      status.textContent = '這是版型示意，表單還沒有串接寄信。正式上線後，留言會寄到 ' + SITE.company.email + '。';
    });
  });

  // 地圖定位：content.js 可加 company.mapQuery（例如更精確的地址或「緯度,經度」），沒有就用公司地址
  var mapQuery = encodeURIComponent(SITE.company.mapQuery || SITE.company.address);
  $$('iframe[data-map]').forEach(function (f) {
    f.setAttribute('loading', 'lazy');
    f.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    if (!f.getAttribute('title')) f.setAttribute('title', SITE.company.name + '位置地圖');
    f.src = 'https://www.google.com/maps?q=' + mapQuery + '&hl=zh-TW&z=16&output=embed';
  });
  $$('a[data-map-link]').forEach(function (a) {
    a.href = 'https://www.google.com/maps/search/?api=1&query=' + mapQuery;
    a.target = '_blank';
    a.rel = 'noopener';
  });
  $$('[data-year]').forEach(function (el) { el.textContent = SITE.$year; });

  /* ---------- 9. SEO 中繼資料、結構化資料與分析 ----------
     canonical、og:url、og:image 絕對網址、GA4、Search Console 驗證碼都要先在 content.js 設定
     meta.siteUrl / meta.gaId / meta.searchConsole 才會輸出，沒設定就不會產生錯誤的網址。
     正式站以「單一風格資料夾當網站根目錄」為前提（見 tools/publish.py）。 */
  var seo = SITE.seo || {};
  var siteUrl = SITE.meta && SITE.meta.siteUrl ? String(SITE.meta.siteUrl).replace(/\/+$/, '') : '';
  var pageId = new URLSearchParams(window.location.search).get('id');
  var pagePath = file + (document.body.getAttribute('data-page') === 'project' && pageId ? '?id=' + encodeURIComponent(pageId) : '');
  var pageUrl = siteUrl ? siteUrl + '/' + (pagePath === 'index.html' ? '' : pagePath) : '';
  var descEl = document.head.querySelector('meta[name="description"]');
  var pageDesc = descEl ? descEl.getAttribute('content') : '';

  function setMeta(attr, key, content) {
    if (!content) return;
    var el = document.head.querySelector('meta[' + attr + '="' + key + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function addJsonLd(data) {
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  if (pageUrl) {
    var link = document.head.querySelector('link[rel="canonical"]') || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', pageUrl);
    if (!link.parentNode) document.head.appendChild(link);
  }
  setMeta('name', 'google-site-verification', SITE.meta && SITE.meta.searchConsole);
  setMeta('property', 'og:type', 'website');
  setMeta('property', 'og:site_name', SITE.company.name);
  setMeta('property', 'og:title', document.title);
  setMeta('property', 'og:description', pageDesc);
  setMeta('property', 'og:locale', seo.locale || 'zh_TW');
  setMeta('property', 'og:url', pageUrl);
  setMeta('property', 'og:image', siteUrl && seo.ogImage ? siteUrl + '/' + String(seo.ogImage).replace(/^\//, '') : '');
  setMeta('name', 'twitter:card', seo.twitterCard || 'summary_large_image');

  var addr = /^(.+?[市縣])(.+?[區鄉鎮市])(.+)$/.exec(SITE.company.address) || [];
  var ld = {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    name: SITE.company.name,
    alternateName: SITE.company.nameEn,
    slogan: textOf(SITE.company.slogan, ' '),
    foundingDate: SITE.company.founded,
    taxID: SITE.company.taxId,
    telephone: String(SITE.company.phoneHref || '').replace('tel:', ''),
    faxNumber: SITE.company.fax,
    email: SITE.company.email,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TW',
      addressRegion: addr[1] || '',
      addressLocality: addr[2] || '',
      streetAddress: addr[3] || SITE.company.address,
      postalCode: SITE.company.postalCode || ''
    },
    areaServed: { '@type': 'AdministrativeArea', name: addr[1] || '臺中市' },
    makesOffer: (SITE.services || []).map(function (s) {
      return { '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, description: textOf(s.desc) } };
    })
  };
  if (SITE.company.hoursSchema) {
    ld.openingHoursSpecification = [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: SITE.company.hoursSchema.dayOfWeek,
      opens: SITE.company.hoursSchema.opens,
      closes: SITE.company.hoursSchema.closes
    }];
  }
  if (!isEmpty(SITE.copy.intro)) ld.description = textOf(SITE.copy.intro);
  var sameAs = [textOf(SITE.company.facebook), textOf(SITE.company.line)].filter(Boolean);
  if (sameAs.length) ld.sameAs = sameAs;
  if (siteUrl) {
    ld.url = siteUrl + '/';
    ld.logo = siteUrl + '/shared/img/logo-mark@2x.png';
    if (seo.ogImage) ld.image = siteUrl + '/' + String(seo.ogImage).replace(/^\//, '');
  }
  addJsonLd(ld);

  if (siteUrl && file !== 'index.html') {
    var crumbs = [{ name: '首頁', url: siteUrl + '/' }];
    if (ctx.project) {
      crumbs.push({ name: '工程實績', url: siteUrl + '/projects.html' });
      crumbs.push({ name: textOf(ctx.project.name), url: pageUrl });
    } else {
      crumbs.push({ name: document.title.split('｜')[0], url: pageUrl });
    }
    addJsonLd({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map(function (c, i) {
        return { '@type': 'ListItem', position: i + 1, name: c.name, item: c.url };
      })
    });
  }

  var gaId = SITE.meta && SITE.meta.gaId;
  if (gaId) {
    var gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
    document.head.appendChild(gaScript);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', gaId, { anonymize_ip: true });
    $$('form[data-demo-form]').forEach(function (form) {
      form.addEventListener('submit', function () { window.gtag('event', 'contact_submit', { page: pagePath }); });
    });
    $$('a[href^="tel:"]').forEach(function (a) {
      a.addEventListener('click', function () { window.gtag('event', 'phone_click', { page: pagePath }); });
    });
  }

  // 示範站：meta.noindex 讓搜尋引擎不收錄；meta.demoNotice 在頁面最下方加一行說明
  if (SITE.meta && SITE.meta.noindex) setMeta('name', 'robots', 'noindex, nofollow');
  if (SITE.meta && SITE.meta.demoNotice) {
    var demo = document.createElement('p');
    demo.className = 'demo-notice';
    demo.setAttribute('role', 'note');
    demo.textContent = SITE.meta.demoNotice;
    document.body.appendChild(demo);
  }

  /* ---------- 10. 風格切換列（提案展示用） ---------- */
  var inFrame = false;
  try { inFrame = window.self !== window.top; } catch (err) { inFrame = true; }
  if (inFrame) root.classList.add('in-frame');
  var styleId = root.getAttribute('data-style');
  if (styleId && !inFrame && SITE.meta && SITE.meta.showStyleSwitcher !== false) {
    var bar = document.createElement('nav');
    bar.className = 'style-switcher';
    bar.setAttribute('aria-label', '切換風格（提案展示用）');
    var html = '<a href="../index.html">總覽</a><i class="ss-divider" aria-hidden="true"></i>';
    (SITE.meta.styles || []).forEach(function (s) {
      html += '<a href="../' + s.dir + '/' + file + window.location.search + '"' +
        (s.id === styleId ? ' aria-current="true"' : '') +
        ' aria-label="風格 ' + s.id.toUpperCase() + '：' + s.name + '">' +
        '<b>' + s.id.toUpperCase() + '</b><span>' + s.name + '</span></a>';
    });
    bar.innerHTML = html;
    document.body.appendChild(bar);
    root.classList.add('has-style-switcher');
  }

  /* ---------- 給風格自己的 style.js 使用 ---------- */
  window.YS = {
    site: SITE,
    ctx: ctx,
    resolve: function (path, c) { return resolve(path, c || ctx); },
    textOf: textOf,
    isEmpty: isEmpty,
    hydrate: function (scope, c) { hydrate(scope, c || ctx); },
    decorate: decorate,
    art: ART
  };
})();
