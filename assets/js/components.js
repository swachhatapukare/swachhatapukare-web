/* components.js — chrome written once and injected into every page:
   header + mega menu, mobile nav, footer, mini-cart drawer,
   modal, toast, WhatsApp button, and image fallbacks. */

window.SP = window.SP || {};

(function (SP) {
  "use strict";

  var cfg = SP.config;

  /* =============================================================== helpers */
  function h(html) {
    var tpl = document.createElement("template");
    tpl.innerHTML = html.trim();
    return tpl.content.firstElementChild;
  }

  function el(sel, root) { return (root || document).querySelector(sel); }

  function icon(name, size) {
    var s = size || 20;
    var paths = {
      cart: '<path d="M3 4h2.2l1.6 9.4a1.6 1.6 0 0 0 1.6 1.3h7.3a1.6 1.6 0 0 0 1.6-1.2L19 7H6.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="18.4" r="1.4"/><circle cx="16.4" cy="18.4" r="1.4"/>',
      user: '<circle cx="12" cy="8.4" r="3.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4.8 19.4c1.3-3.2 4-4.8 7.2-4.8s5.9 1.6 7.2 4.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
      caret: '<path d="M6 9.5l6 5.5 6-5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
      close: '<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
      arrow: '<path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
      drop: '<path d="M12 3.2s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
      leaf: '<path d="M5 19c0-7 5-12 14-12 0 9-5 13-11 13H5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M5 19c3-4 6-6 10-7.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
      water: '<path d="M4 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2M4 19c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12 3.6s-4.4 5.2-4.4 8a4.4 4.4 0 0 0 8.8 0c0-2.8-4.4-8-4.4-8z" fill="none" stroke="currentColor" stroke-width="1.6"/>',
      mic: '<rect x="9.2" y="3.4" width="5.6" height="10.4" rx="2.8" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M6 11.4a6 6 0 0 0 12 0M12 17.4V21" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
      sun: '<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 2.6v2.6M12 18.8v2.6M2.6 12h2.6M18.8 12h2.6M5.4 5.4l1.9 1.9M16.7 16.7l1.9 1.9M18.6 5.4l-1.9 1.9M7.3 16.7l-1.9 1.9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
      filter: '<path d="M4 6.5h16M7 12h10M10 17.5h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
      search: '<circle cx="11" cy="11" r="6.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M15.6 15.6L20 20" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
      whatsapp: '<path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>',
      mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M22 6l-10 7L2 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
      chat: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
      download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><polyline points="7 10 12 15 17 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
      plus: '<path d="M12 5.5v13M5.5 12h13" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
      minus: '<path d="M5.5 12h13" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
      check: '<path d="M5 12.8l4.4 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      trash: '<path d="M5 7h14M10 7V5.4A1.4 1.4 0 0 1 11.4 4h1.2A1.4 1.4 0 0 1 14 5.4V7m3 0l-.8 11.2A1.8 1.8 0 0 1 14.4 20H9.6a1.8 1.8 0 0 1-1.8-1.8L7 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
      location: '<path d="M12 21s6.5-6 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="10.4" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/>',
      phone: '<path d="M6.4 4.5h3l1.4 3.5-1.8 1.4a10.6 10.6 0 0 0 5.6 5.6l1.4-1.8 3.5 1.4v3a2 2 0 0 1-2.2 2A15.6 15.6 0 0 1 4.4 6.7a2 2 0 0 1 2-2.2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
      instagram: '<rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/>',
      x: '<path d="M18.9 3h3.1l-6.8 7.8L23 21h-6.2l-4.9-6.4L6.3 21H3.1l7.3-8.3L2.5 3h6.4l4.4 5.8L18.9 3zm-1.1 16.2h1.7L7.3 4.7H5.5l12.3 14.5z" fill="currentColor"/>',
      linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><rect x="2" y="9" width="4" height="12" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="4" cy="4" r="2" fill="currentColor"/>',
      facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
    };
    return '<svg class="i" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      (paths[name] || "") + "</svg>";
  }
  SP.icon = icon;

  function caretSvg() {
    return '<svg class="nav__caret" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M6 9.5l6 5.5 6-5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  /* ========================================================== image system */
  var TINT_FALLBACK = {
    "--c-cat-office": "#DCEBFA",
    "--c-cat-desk": "#E3F0FB",
    "--c-cat-home": "#EAF4FD",
    "--c-cat-tabletop": "#E1ECF8",
    "--c-cat-heritage": "#D7E8F7",
    "--c-cat-lighting": "#EDF5FD"
  };

  function tintHex(tintVar) {
    var value = "";
    try {
      value = getComputedStyle(document.documentElement).getPropertyValue(tintVar || "").trim();
    } catch (e) { value = ""; }
    if (value) return value;
    return TINT_FALLBACK[tintVar] || "#EAF2FA";
  }

  function placeholder(name, tintVar, w, h, tag) {
    w = w || 900;
    h = h || 900;
    var bg = tintHex(tintVar);
    var words = String(name || "Handcrafted product").split(/\s+/);
    var line1 = words.slice(0, Math.ceil(words.length / 2)).join(" ");
    var line2 = words.slice(Math.ceil(words.length / 2)).join(" ");
    var lines = line2 ? [line1, line2] : [line1];
    var startY = 470 - (lines.length - 1) * 26;
    var textSvg = lines.map(function (line, i) {
      return "<text x='450' y='" + (startY + i * 56) + "' text-anchor='middle' font-family='Georgia, serif' font-size='46' fill='#0B2E4F'>" +
        String(line).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</text>";
    }).join("");
    var svg =
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 900' width='" + w + "' height='" + h + "'>" +
      "<rect width='900' height='900' fill='" + bg + "'/>" +
      "<g fill='none' stroke='#176BAE' stroke-opacity='.28' stroke-width='4'>" +
      "<path d='M-40 700c140-70 250 60 390 0s250-70 390 0 250 60 390 0'/>" +
      "<path d='M-40 760c140-70 250 60 390 0s250-70 390 0 250 60 390 0'/>" +
      "<path d='M-40 820c140-70 250 60 390 0s250-70 390 0 250 60 390 0'/>" +
      "</g>" +
      "<g transform='translate(378 210) scale(5.5)'>" +
      "<path d='M12 2.6C12 2.6 5.4 10 5.4 14.4a6.6 6.6 0 0 0 13.2 0C18.6 10 12 2.6 12 2.6z' fill='none' stroke='#176BAE' stroke-opacity='.65' stroke-width='1.4'/>" +
      "<path d='M9 15.6a3.6 3.6 0 0 0 3.2 3.4' fill='none' stroke='#176BAE' stroke-opacity='.65' stroke-width='1.4' stroke-linecap='round'/>" +
      "</g>" +
      textSvg +
      "<text x='450' y='560' text-anchor='middle' font-family='Helvetica, Arial, sans-serif' font-size='24' letter-spacing='4' fill='#53687C'>" +
      (tag ? String(tag).replace(/</g, "&lt;") : "PHOTO COMING SOON") + "</text>" +
      "</svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }
  SP.imgPlaceholder = placeholder;

  /* <img> tag builder: reserves space, lazy-loads, carries fallback data */
  SP.imgTag = function (opts) {
    opts = opts || {};
    var src = opts.src || "";
    var alt = opts.alt || "";
    var w = opts.w || 800;
    var hgt = opts.h || 800;
    var cls = opts.cls ? ' class="' + opts.cls + '"' : "";
    var loading = opts.eager ? ' loading="eager" fetchpriority="high"' : ' loading="lazy"';
    return '<img' + cls + ' src="' + SP.esc(src) + '" alt="' + SP.esc(alt) + '"' +
      ' width="' + w + '" height="' + hgt + '"' + loading + ' decoding="async"' +
      ' data-sp-fallback data-name="' + SP.esc(opts.name || alt) + '"' +
      ' data-tint="' + SP.esc(opts.tint || "--c-cat-home") + '"' +
      (opts.tag ? ' data-tag="' + SP.esc(opts.tag) + '"' : "") + ">";
  };

  function applyFallback(img) {
    if (!img || img.dataset.spFallbackDone) return;
    img.dataset.spFallbackDone = "1";
    img.src = placeholder(img.dataset.name || "Handcrafted product", img.dataset.tint, 900, 900, img.dataset.tag);
    img.classList.add("is-placeholder");
  }

  /* One capture-phase listener covers every image on the page */
  document.addEventListener("error", function (e) {
    var t = e.target;
    if (t && t.tagName === "IMG" && t.hasAttribute("data-sp-fallback")) applyFallback(t);
  }, true);

  SP.hydrateImages = function (root) {
    SP.qsa("img[data-sp-fallback]", root).forEach(function (img) {
      if (img.complete && img.naturalWidth === 0) applyFallback(img);
      else if (!img.dataset.spListenerBound) {
        img.dataset.spListenerBound = "1";
        img.addEventListener("load", function () {
          if (img.naturalWidth === 0) applyFallback(img);
        });
      }
    });
  };

  /* ================================================================ brand */
  function brandMarkup(cls, full) {
    var mark =
      '<svg class="brand__mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">' +
      '<path d="M16 3.2s-8.4 9.6-8.4 14.6a8.4 8.4 0 0 0 16.8 0C24.4 12.8 16 3.2 16 3.2z" fill="#176BAE" fill-opacity=".14"/>' +
      '<path d="M16 4.6s-7.2 8.8-7.2 13.4a7.2 7.2 0 0 0 14.4 0C23.2 13.4 16 4.6 16 4.6z" fill="none" stroke="#176BAE" stroke-width="1.7"/>' +
      '<path d="M12.6 19.6a4 4 0 0 0 3.4 3.6" fill="none" stroke="#176BAE" stroke-width="1.7" stroke-linecap="round"/>' +
      "</svg>";
    return '<a class="brand ' + (cls || "") + '" href="index.html"' +
      (full ? " data-logo-full" : " data-logo") + ">" +
      mark +
      '<span class="brand__text">' +
      '<span class="brand__word">SwachhataPukare</span>' +
      '<span class="brand__sub">Foundation</span>' +
      "</span></a>";
  }
  SP.brandMarkup = brandMarkup;

  /* Optional photo logo: emblem everywhere, full lock-up (data-logo-full) in the
     footer. Either silently falls back to the SVG wordmark when the file is absent. */
  function attachPhotoLogo(scope) {
    SP.qsa("[data-logo],[data-logo-full]", scope).forEach(function (holder) {
      var full = holder.hasAttribute("data-logo-full");
      var img = document.createElement("img");
      img.className = full ? "brand__img brand__img--full" : "brand__img";
      img.alt = cfg.SITE_SHORT + " Foundation";
      img.width = full ? 78 : 40;
      img.height = full ? 96 : 40;
      var mark = holder.querySelector(".brand__mark");
      img.addEventListener("error", function () {
        if (img.parentNode && mark) img.parentNode.replaceChild(mark, img);
      });
      img.src = full ? cfg.LOGO_PATH_FULL : cfg.LOGO_PATH;
      if (mark) mark.parentNode.replaceChild(img, mark);
    });
  }

  /* =============================================================== header */
  function navItems(page) {
    function active(key) { return page === key ? " is-active" : ""; }
    function activeAttr(key) { return page === key ? ' aria-current="page"' : ""; }
    var wwdPages = cfg.WHAT_WE_DO.map(function (i) { return i.slug; });
    var wwdActive = wwdPages.indexOf(page) !== -1;

    var categories = cfg.WHAT_WE_DO_CATEGORIES || [
      {
        category: "Water",
        items: [
          { slug: "water-hyacinth", href: "water-hyacinth.html", title: "Water Hyacinth", desc: "An aquatic weed turned into handcrafted raw material." },
          { slug: "river-cleaning", href: "river-cleaning.html", title: "River Cleaning", desc: "Cleaning drives along rivers and drains." }
        ]
      },
      {
        category: "Energy",
        items: [
          { slug: "solar-power", href: "solar-power.html", title: "Solar Power", desc: "Work on solar energy initiatives." }
        ]
      },
      {
        category: "Waste Management",
        items: [
          { slug: "sewage-treatment", href: "sewage-treatment.html", title: "Sewage Treatment", desc: "Sewage treatment plant work." },
          { slug: "dry-waste-management", href: "sewage-treatment.html#dry-waste", title: "Dry Waste Management", desc: "Segregation and recycling (coming soon)." }
        ]
      },
      {
        category: "Rural & Community",
        items: [
          { slug: "rural-smart-build-centres", href: "rural-smart-build-centres.html", title: "Rural Smart Build Centres", desc: "Sustainable rural construction and craft centres." },
          { slug: "tedxbistupur", href: "tedxbistupur.html", title: "TEDxBistupur", desc: "Ideas worth spreading, from Bistupur." }
        ]
      }
    ];

    var wwdPanelContent = categories.map(function (cat) {
      var catCards = cat.items.map(function (item) {
        var iconName = "leaf";
        if (item.slug === "river-cleaning" || item.slug === "water-hyacinth") iconName = "water";
        else if (item.slug === "solar-power") iconName = "sun";
        else if (item.slug === "sewage-treatment" || item.slug === "dry-waste-management") iconName = "drop";
        else if (item.slug === "tedxbistupur") iconName = "mic";
        else if (item.slug === "rural-smart-build-centres") iconName = "location";

        return '<a class="nav-card" href="' + item.href + '">' +
          '<span class="nav-card__icon">' + icon(iconName, 18) + '</span>' +
          '<span class="nav-card__body">' +
          '<strong class="nav-card__title">' + SP.esc(item.title) + '</strong>' +
          '<span class="nav-card__desc">' + SP.esc(item.desc) + '</span>' +
          '</span></a>';
      }).join('');

      return '<div class="nav-cat-group">' +
        '<span class="nav-cat-heading">' + SP.esc(cat.category) + '</span>' +
        '<div class="nav-cat-cards">' + catCards + '</div>' +
        '</div>';
    }).join('');

    return (
      '<nav class="nav" aria-label="Main">' +
      '<ul class="nav__list">' +
      '<li class="nav__item"><a class="nav__link' + active("home") + '" href="index.html"' + activeAttr("home") + ">Home</a></li>" +
      '<li class="nav__item"><a class="nav__link' + active("shop") + '" href="shop.html"' + activeAttr("shop") + ">Shop</a></li>" +
      '<li class="nav__item nav__item--has-menu">' +
      '<button class="nav__link' + (wwdActive ? " is-active" : "") + '" type="button" data-action="wwd-toggle" aria-expanded="false" aria-controls="nav-wwd-panel">What we do' + caretSvg() + "</button>" +
      '<div class="nav__panel nav__panel--categorized" id="nav-wwd-panel">' + wwdPanelContent +
      "</div></li>" +
      '<li class="nav__item"><a class="nav__link' + active("about") + '" href="about.html"' + activeAttr("about") + ">About</a></li>" +
      '<li class="nav__item"><a class="nav__link' + active("donate") + '" href="donate.html"' + activeAttr("donate") + ">Donate</a></li>" +
      '<li class="nav__item"><a class="nav__link' + active("gallery") + '" href="gallery.html"' + activeAttr("gallery") + ">Gallery</a></li>" +
      '<li class="nav__item"><a class="nav__link' + active("contact") + '" href="contact.html"' + activeAttr("contact") + ">Contact</a></li>" +
      "</ul></nav>"
    );
  }

  function mobileNavMarkup(page) {
    var categories = cfg.WHAT_WE_DO_CATEGORIES || [];
    var wwd = "";
    if (categories.length) {
      wwd = categories.map(function (cat) {
        var links = cat.items.map(function (item) {
          var isActive = item.slug === page;
          return '<a class="mobile-nav__link' + (isActive ? " is-active" : "") + '" href="' + item.href + '">' +
            SP.esc(item.title) + icon("arrow", 16) + "</a>";
        }).join("");
        return '<div class="mobile-nav__cat"><span class="mobile-nav__cat-title">' + SP.esc(cat.category) + '</span>' + links + '</div>';
      }).join("");
    } else {
      wwd = cfg.WHAT_WE_DO.map(function (item) {
        var isActive = item.slug === page;
        return '<a class="mobile-nav__link' + (isActive ? " is-active" : "") + '" href="' + item.href + '">' +
          SP.esc(item.title) + icon("arrow", 16) + "</a>";
      }).join("");
    }

    function link(href, key, label) {
      return '<a class="mobile-nav__link' + (page === key ? " is-active" : "") + '" href="' + href + '"' +
        (page === key ? ' aria-current="page"' : "") + ">" + label + icon("arrow", 16) + "</a>";
    }

    return (
      '<aside class="mobile-nav" id="mobile-nav" aria-label="Menu" aria-hidden="true">' +
      '<div class="mobile-nav__head">' + brandMarkup("", true) +
      '<button class="icon-btn" type="button" data-action="menu-close" aria-label="Close menu">' + icon("close", 20) + "</button>" +
      "</div>" +
      '<div class="mobile-nav__body">' +
      link("index.html", "home", "Home") +
      link("shop.html", "shop", "Shop") +
      '<span class="mobile-nav__group">What we do</span>' +
      '<div class="mobile-nav__sub">' + wwd + "</div>" +
      link("about.html", "about", "About") +
      link("donate.html", "donate", "Donate") +
      link("gallery.html", "gallery", "Gallery") +
      link("contact.html", "contact", "Contact") +
      "</div>" +
      '<div class="mobile-nav__foot">' +
      '<a class="btn btn--secondary btn--block" href="account.html">' + icon("user", 18) + " My account</a>" +
      '<button class="btn btn--primary btn--block" type="button" data-action="cart-open">' + icon("cart", 18) + " View cart</button>" +
      "</div></aside>"
    );
  }

  function renderHeader(root, page) {
    var header = h(
      '<div class="site-header">' +
      '<div class="site-header__inner">' +
      brandMarkup("", true) +
      navItems(page) +
      '<div class="header-actions">' +
      '<a class="icon-btn icon-btn--account" href="account.html" aria-label="My account">' + icon("user", 22) + "</a>" +
      '<button class="icon-btn" type="button" data-action="cart-open" aria-label="Open cart">' +
      icon("cart", 22) +
      '<span class="icon-btn__badge" data-cart-badge hidden>0</span></button>' +
      '<button class="burger" type="button" data-action="menu-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">' +
      "<span></span><span></span><span></span></button>" +
      "</div></div></div>"
    );
    root.appendChild(header);
    return header;
  }

  /* =============================================================== footer */
  function renderFooter(root) {
    var shopLinks = SP.categories().map(function (c) {
      return '<li><a href="shop.html?cat=' + c.slug + '">' + SP.esc(c.name) + "</a></li>";
    }).join("");

    var wwdLinks = cfg.WHAT_WE_DO.map(function (item) {
      return '<li><a href="' + item.href + '">' + SP.esc(item.title) + "</a></li>";
    }).join("");

    var address = cfg.FOUNDATION.addressLines.join(", ");
    var social = cfg.SOCIAL || {};

    var footer = h(
      '<footer class="site-footer">' +
      '<div class="container">' +
      '<div class="footer-grid">' +

      // Col 1: Brand & Mission
      '<div class="footer-brand">' +
      brandMarkup("", true) +
      '<p class="footer-about">Transforming river waste into handcrafted utility, driving river conservation, women self-help group livelihoods, and clean community infrastructure.</p>' +
      '<div class="footer-social">' +
      '<span class="footer-social__title">Connect with us</span>' +
      '<div class="footer-social__icons">' +
      '<a class="social-icon" href="' + (social.instagram || "#") + '" target="_blank" rel="noopener noreferrer" aria-label="Follow SwachhataPukare on Instagram">' + icon("instagram", 18) + '</a>' +
      '<a class="social-icon" href="' + (social.x || "#") + '" target="_blank" rel="noopener noreferrer" aria-label="Follow SwachhataPukare on X">' + icon("x", 16) + '</a>' +
      '<a class="social-icon" href="' + (social.linkedin || "#") + '" target="_blank" rel="noopener noreferrer" aria-label="Follow SwachhataPukare on LinkedIn">' + icon("linkedin", 18) + '</a>' +
      '<a class="social-icon" href="' + (social.facebook || "#") + '" target="_blank" rel="noopener noreferrer" aria-label="Follow SwachhataPukare on Facebook">' + icon("facebook", 18) + '</a>' +
      '</div></div>' +
      '</div>' +

      // Col 2: Handcrafted Shop
      '<div class="footer-col"><span class="footer-title">Handcrafted Shop</span>' +
      '<ul class="footer-list">' +
      '<li><a href="shop.html">Browse all products</a></li>' +
      shopLinks +
      '<li><a href="bulk-enquiry.html">Bulk &amp; corporate gifting</a></li>' +
      '<li><a href="track.html">Track your parcel</a></li>' +
      '</ul></div>' +

      // Col 3: What We Do
      '<div class="footer-col"><span class="footer-title">What We Do</span>' +
      '<ul class="footer-list">' +
      wwdLinks +
      '<li><a href="about.html">About our leadership</a></li>' +
      '<li><a href="gallery.html">Field photo gallery</a></li>' +
      '</ul></div>' +

      // Col 4: Policies & Legal
      '<div class="footer-col"><span class="footer-title">Policies &amp; Legal</span>' +
      '<ul class="footer-list">' +
      '<li><a href="policies.html#terms">Terms &amp; conditions</a></li>' +
      '<li><a href="policies.html#payment">Payment policy</a></li>' +
      '<li><a href="policies.html#shipping">Shipping &amp; delivery</a></li>' +
      '<li><a href="policies.html#returns">Returns &amp; refunds</a></li>' +
      '<li><a href="policies.html#privacy">Data protection &amp; privacy</a></li>' +
      '</ul></div>' +

      // Col 5: Contact
      '<div class="footer-col footer-col--contact"><span class="footer-title">Contact Us</span>' +
      '<address class="footer-address"><strong>SwachhataPukare Foundation</strong><br>' + SP.esc(address) + '</address>' +
      '<div class="footer-contact-links">' +
      '<a class="footer-contact-item" href="tel:+919934304800">' + icon("phone", 14) + ' +91 99343 04800</a>' +
      '<a class="footer-contact-item" href="mailto:hello@swachhatapukare.com">' + icon("mail", 14) + ' hello@swachhatapukare.com</a>' +
      '<a class="footer-contact-item" href="contact.html">' + icon("chat", 14) + ' General enquiry form</a>' +
      '</div>' +
      '<p class="footer-hours">' + SP.esc(cfg.FOUNDATION.hours) + '</p>' +
      '<div class="footer-gst">GSTIN: ' + SP.esc(cfg.FOUNDATION.gst) + '</div>' +
      '</div>' +

      '</div>' + // .footer-grid

      // Bottom Bar
      '<div class="footer-bottom">' +
      '<div class="footer-bottom__copy">' +
      '<span>&copy; ' + new Date().getFullYear() + ' ' + SP.esc(cfg.SITE_NAME) + '. Jamshedpur, Jharkhand.</span>' +
      '</div>' +
      '<nav class="footer-bottom__links" aria-label="Footer Quicklinks">' +
      '<a href="policies.html">Policies</a>' +
      '<a href="policies.html#terms">Terms</a>' +
      '<a href="policies.html#privacy">Privacy</a>' +
      '<a href="track.html">Track Order</a>' +
      '<a href="account.html">My Account</a>' +
      '<button class="footer-back-to-top" type="button" onclick="window.scrollTo({top:0,behavior:\'smooth\'})">Back to top &uarr;</button>' +
      '</nav>' +
      '</div>' +

      '</div></footer>'
    );
    root.appendChild(footer);
  }

  /* ========================================================== mini-cart */
  function miniLine(line) {
    return (
      '<article class="mini-line">' +
      '<a class="mini-line__media" href="' + line.href + '" tabindex="-1" aria-hidden="true">' +
      SP.imgTag({
        src: "assets/products/" + line.product.slug + "-1.jpg",
        alt: "",
        name: line.product.name,
        tint: SP.config.categoryTint(line.category),
        w: 200, h: 200,
        cls: "mini-line__img"
      }) + "</a>" +
      '<div class="mini-line__info">' +
      '<a class="mini-line__name" href="' + line.href + '">' + SP.esc(line.name) + "</a>" +
      '<p class="mini-line__meta">' + SP.esc(line.sku) + " &middot; " + SP.fmtINR(line.unit) + "</p>" +
      '<div class="mini-line__row">' +
      '<div class="qty qty--sm">' +
      '<button class="qty__btn" type="button" data-action="cart-qty" data-dir="-1" data-id="' + line.id + '" data-variant="' + SP.esc(line.variantId) + '" aria-label="Decrease quantity of ' + SP.esc(line.name) + '">' + icon("minus", 14) + "</button>" +
      '<span class="qty__value" aria-live="off">' + line.qty + "</span>" +
      '<button class="qty__btn" type="button" data-action="cart-qty" data-dir="1" data-id="' + line.id + '" data-variant="' + SP.esc(line.variantId) + '" aria-label="Increase quantity of ' + SP.esc(line.name) + '">' + icon("plus", 14) + "</button>" +
      "</div>" +
      '<button class="link-btn" type="button" data-action="cart-remove" data-id="' + line.id + '" data-variant="' + SP.esc(line.variantId) + '">Remove</button>' +
      "</div></div></article>"
    );
  }

  function renderMiniCart() {
    var body = el("[data-cart-drawer-body]");
    var foot = el("[data-cart-drawer-foot]");
    if (!body || !foot) return;
    var t = SP.store.totals();

    if (!t.lines.length) {
      body.innerHTML =
        '<div class="empty-state empty-state--sm">' +
        '<span class="empty-state__icon">' + icon("cart", 28) + "</span>" +
        "<h3>Your cart is empty</h3>" +
        '<p class="muted">Browse the catalogue and add a piece you like.</p>' +
        '<a class="btn btn--primary" href="shop.html">Start shopping</a>' +
        "</div>";
      foot.innerHTML = "";
      SP.hydrateImages(body);
      return;
    }

    body.innerHTML = '<ul class="mini-lines">' + t.lines.map(function (line) {
      return "<li>" + miniLine(line) + "</li>";
    }).join("") + "</ul>";

    var pct = Math.round(t.freeShippingProgress * 100);
    foot.innerHTML =
      '<div class="progress-note">' +
      (t.isFreeShipping
        ? "<strong>Free courier estimate unlocked.</strong>"
        : "Add <strong>" + SP.fmtINR(t.freeShippingGap) + "</strong> for a free courier estimate.") +
      "</div>" +
      '<div class="progress" role="img" aria-label="Free courier progress: ' + pct + '%">' +
      '<span class="progress__bar" data-progress="' + t.freeShippingProgress + '"></span></div>' +
      '<div class="summary__row"><span>Subtotal</span><strong>' + SP.fmtINR(t.subtotal) + "</strong></div>" +
      '<p class="form-note">Prices exclude print and courier charges. Courier is estimated at checkout.</p>' +
      '<div class="drawer__actions">' +
      '<a class="btn btn--secondary" href="cart.html">View cart</a>' +
      '<a class="btn btn--primary" href="checkout.html">Checkout</a>' +
      "</div>";

    SP.hydrateImages(body);
    setProgress(foot);
  }

  function setProgress(scope) {
    SP.qsa("[data-progress]", scope).forEach(function (bar) {
      bar.style.setProperty("--pct", bar.getAttribute("data-progress"));
    });
  }

  function renderDrawer(root) {
    var drawer = h(
      '<aside class="cart-drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" aria-hidden="true">' +
      '<div class="drawer__head">' +
      '<h2 id="cart-drawer-title">Your cart <span class="drawer__count" data-cart-count></span></h2>' +
      '<button class="icon-btn" type="button" data-action="cart-close" aria-label="Close cart">' + icon("close", 20) + "</button>" +
      "</div>" +
      '<div class="drawer__body" data-cart-drawer-body></div>' +
      '<div class="drawer__foot" data-cart-drawer-foot></div>' +
      "</aside>"
    );
    root.appendChild(drawer);
  }

  /* =============================================================== chrome */
  var openLayer = null; // {close: fn}
  var lastFocused = null;

  function lockScroll(on) {
    document.documentElement.classList.toggle("no-scroll", !!on);
  }

  function showScrim(on) {
    var scrim = el("#sp-scrim");
    if (scrim) scrim.classList.toggle("is-open", !!on);
  }

  function closeTop() {
    if (openLayer) openLayer.close();
  }

  function makeLayer(node, key, initialFocus) {
    lastFocused = document.activeElement;
    var untrap = SP.trapFocus(node);
    node.classList.add("is-open");
    node.setAttribute("aria-hidden", "false");
    showScrim(true);
    lockScroll(true);
    var closed = false;

    function close() {
      if (closed) return;
      closed = true;
      untrap();
      node.classList.remove("is-open");
      node.setAttribute("aria-hidden", "true");
      showScrim(false);
      lockScroll(false);
      if (openLayer && openLayer.key === key) openLayer = null;
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    openLayer = { key: key, close: close };
    setTimeout(function () {
      var target = initialFocus || node.querySelector("button, a[href], input, [tabindex]");
      if (target) target.focus();
    }, 30);
    return close;
  }

  /* ---------------------------------------------------------------- modal */
  var modalCloseFn = null;

  SP.ui = SP.ui || {};

  SP.ui.modal = function (opts) {
    opts = opts || {};
    var root = el("#sp-modal-root");
    if (!root) return null;
    if (modalCloseFn) modalCloseFn();

    root.innerHTML =
      '<div class="modal is-open" role="dialog" aria-modal="true" aria-labelledby="sp-modal-title">' +
      '<div class="modal__card' + (opts.size === "lg" ? " modal__card--lg" : "") + '">' +
      '<div class="modal__head">' +
      '<h2 id="sp-modal-title" class="modal__title">' + SP.esc(opts.title || "Notice") + "</h2>" +
      '<button class="icon-btn" type="button" data-action="modal-close" aria-label="Close dialog">' + icon("close", 20) + "</button>" +
      "</div>" +
      '<div class="modal__body">' + (opts.html || "") + "</div>" +
      "</div></div>";

    var node = root.firstChild;
    var untrap = SP.trapFocus(node);
    lastFocused = document.activeElement;
    lockScroll(true);
    showScrim(true);
    setTimeout(function () {
      var target = node.querySelector("input, button:not([data-action='modal-close']), a[href]");
      (target || node.querySelector(".modal__card")).focus();
    }, 30);

    modalCloseFn = function close() {
      untrap();
      root.innerHTML = "";
      modalCloseFn = null;
      if (!openLayer) { showScrim(false); lockScroll(false); }
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    };
    return node;
  };

  SP.ui.closeModal = function () {
    if (modalCloseFn) modalCloseFn();
  };

  /* ---------------------------------------------------------------- toast */
  var toastTimer = null;
  SP.ui.toast = function (message, type) {
    var toast = el("#sp-toast");
    if (!toast) return;
    toast.textContent = message;
    toast.className = "toast is-visible" + (type ? " toast--" + type : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.className = "toast";
    }, 3200);
  };

  /* --------------------------------------------------------------- badge */
  function updateBadge() {
    var count = SP.store.cartCount();
    SP.qsa("[data-cart-badge]").forEach(function (badge) {
      badge.textContent = count > 99 ? "99+" : String(count);
      badge.hidden = count === 0;
    });
    var drawerCount = el("[data-cart-count]");
    if (drawerCount) drawerCount.textContent = count ? "(" + count + ")" : "";
  }

  /* ============================================================ actions */
  function closeMenu() {
    var nav = el("#mobile-nav");
    var burger = el(".burger");
    if (nav) {
      nav.classList.remove("is-open");
      nav.setAttribute("aria-hidden", "true");
    }
    if (burger) burger.setAttribute("aria-expanded", "false");
    if (openLayer && openLayer.key === "menu") openLayer.close();
  }

  function toggleMenu() {
    var nav = el("#mobile-nav");
    var burger = el(".burger");
    if (!nav) return;
    var isOpen = nav.classList.contains("is-open");
    if (isOpen) { closeMenu(); return; }
    lastFocused = document.activeElement;
    nav.classList.add("is-open");
    nav.setAttribute("aria-hidden", "false");
    if (burger) burger.setAttribute("aria-expanded", "true");
    showScrim(true);
    lockScroll(true);
    var untrap = SP.trapFocus(nav);
    openLayer = {
      key: "menu",
      close: function () {
        untrap();
        nav.classList.remove("is-open");
        nav.setAttribute("aria-hidden", "true");
        if (burger) burger.setAttribute("aria-expanded", "false");
        showScrim(false);
        lockScroll(false);
        openLayer = null;
        if (lastFocused && lastFocused.focus) lastFocused.focus();
      }
    };
    setTimeout(function () {
      var first = nav.querySelector("a, button");
      if (first) first.focus();
    }, 30);
  }

  function openCart() {
    closeMenu();
    SP.ui.closeModal();
    var drawer = el("#cart-drawer");
    if (!drawer) return;
    renderMiniCart();
    makeLayer(drawer, "cart");
  }

  function closeCart() {
    if (openLayer && openLayer.key === "cart" && openLayer.close) openLayer.close();
  }

  function toggleWwd(btn) {
    var panel = el("#nav-wwd-panel");
    if (!panel) return;
    var open = panel.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function closeWwd() {
    var panel = el("#nav-wwd-panel");
    var btn = el('[data-action="wwd-toggle"]');
    if (panel) panel.classList.remove("is-open");
    if (btn) btn.setAttribute("aria-expanded", "false");
  }

  function bindActions() {
    document.addEventListener("click", function (e) {
      var target = e.target.closest ? e.target.closest("[data-action]") : null;
      if (!target) {
        if (!e.target.closest || !e.target.closest(".nav__item--has-menu")) closeWwd();
        return;
      }
      var action = target.getAttribute("data-action");

      switch (action) {
        case "menu-toggle": toggleMenu(); break;
        case "menu-close": closeMenu(); break;

        case "wwd-toggle": toggleWwd(target); break;

        case "cart-open": openCart(); break;
        case "cart-close": closeCart(); break;

        case "modal-close": SP.ui.closeModal(); break;

        case "cart-qty": {
          var id = Number(target.getAttribute("data-id"));
          var variant = target.getAttribute("data-variant") || "";
          var dir = Number(target.getAttribute("data-dir")) || 0;
          var current = SP.store.getCart().filter(function (l) {
            return l.id === id && (l.variantId || "") === variant;
          })[0];
          SP.store.setQty(id, variant, (current ? current.qty : 1) + dir);
          break;
        }

        case "cart-remove":
          SP.store.removeLine(Number(target.getAttribute("data-id")), target.getAttribute("data-variant") || "");
          SP.ui.toast("Removed from cart.");
          break;

        case "add-to-cart": {
          var panel = target.closest("[data-product-panel]") || document;
          var pid = Number(target.getAttribute("data-id"));
          var selected = null;
          if (panel.getAttribute) {
            selected = panel.hasAttribute("data-variant-selected") ? panel : panel.querySelector("[data-variant-selected]");
          }
          var variantId = target.getAttribute("data-variant") ||
            (selected ? selected.getAttribute("data-variant-selected") : "");
          var qtyInput = panel.querySelector("[data-qty-input]");
          var qty = qtyInput ? Number(qtyInput.value) || 1 : 1;
          var result = SP.store.addToCart(pid, variantId, qty);
          if (result) {
            SP.ui.toast(result.product.name + " added to cart.");
            if (cfg.OPEN_MINI_CART_ON_ADD) openCart();
          }
          break;
        }

        case "qty-step": {
          var box = target.closest("[data-qty-box]");
          if (!box) break;
          var input = box.querySelector("[data-qty-input]");
          if (!input) break;
          var step = Number(target.getAttribute("data-dir")) || 0;
          var min = Number(input.min) || 1;
          var max = Number(input.max) || 99;
          input.value = SP.clamp((Number(input.value) || 1) + step, min, max);
          input.dispatchEvent(new CustomEvent("qty:change", { bubbles: true, detail: { input: input } }));
          break;
        }

        default: break;
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (modalCloseFn) { SP.ui.closeModal(); return; }
        if (openLayer && openLayer.close) { openLayer.close(); return; }
        closeWwd();
      }
    });

    document.addEventListener("click", function (e) {
      if (e.target && e.target.id === "sp-scrim") closeTop();
    });

    document.addEventListener("sp:cart", function () {
      updateBadge();
      var drawer = el("#cart-drawer");
      if (drawer && drawer.classList.contains("is-open")) renderMiniCart();
      updateBadge();
    });
  }

  /* ========================================================== whatsapp FAB */
  function renderFab(root) {
    var text = encodeURIComponent(
      "Hello " + cfg.SITE_NAME + ", I would like to know more about your handcrafted products."
    );
    var fab = h(
      '<a class="whatsapp-fab" href="https://wa.me/' + cfg.FOUNDATION.whatsapp + "?text=" + text + '" ' +
      'target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp (opens in a new tab)">' +
      icon("whatsapp", 26) + "<span>WhatsApp</span></a>"
    );
    root.appendChild(fab);
  }

  /* ======================================================= product card */
  SP.productCard = function (product, opts) {
    opts = opts || {};
    var min = SP.minPrice(product);
    var hasVariants = SP.hasVariant(product);
    var tint = SP.config.categoryTint(product.category);
    var isHyacinth = (product.tags || []).indexOf("Water Hyacinth") !== -1;

    var badges = "";
    if (product.featured) badges += '<span class="badge badge--featured">Featured</span>';
    if (isHyacinth) badges += '<span class="badge badge--hyacinth">Water Hyacinth</span>';

    var priceNote = hasVariants ? "Variant prices from" : "Price";
    var price = (hasVariants ? "From " : "") + SP.fmtINR(min);

    return (
      '<article class="card">' +
      '<div class="card__media">' +
      (badges ? '<div class="card__badges">' + badges + "</div>" : "") +
      SP.imgTag({
        src: "assets/products/" + product.slug + "-1.jpg",
        alt: product.name + " — handcrafted product photo",
        name: product.name,
        tint: tint,
        w: 640,
        h: 640
      }) +
      "</div>" +
      '<div class="card__body">' +
      '<span class="card__cat">' + SP.esc(product.category) + "</span>" +
      '<h3 class="card__title"><a href="product.html?slug=' + encodeURIComponent(product.slug) + '">' +
      SP.esc(product.name) + "</a></h3>" +
      '<p class="card__desc">' + SP.esc(product.short_description) + "</p>" +
      '<p class="card__price">' + price +
      "<small>" + priceNote + " · excludes print &amp; courier</small></p>" +
      '<div class="card__actions">' +
      '<button class="btn btn--secondary btn--sm" type="button" data-action="add-to-cart" data-id="' + product.id + '">' +
      (opts.addLabel || "Add to cart") + "</button>" +
      "</div></div></article>"
    );
  };

  /* ================================================================= init */
  SP.components = {
    init: function () {
      var page = document.body.getAttribute("data-page") || "";
      var top = el("#sp-top");
      var bottom = el("#sp-bottom");

      if (top) {
        renderHeader(top, page);
      }
      if (bottom) renderFooter(bottom);

      var extra = document.createElement("div");
      extra.id = "sp-extra-chrome";
      extra.innerHTML =
        '<div class="scrim" id="sp-scrim"></div>' +
        mobileNavMarkup(page) +
        "";
      document.body.appendChild(extra);

      renderDrawer(document.body);

      var modalRoot = document.createElement("div");
      modalRoot.id = "sp-modal-root";
      document.body.appendChild(modalRoot);

      var toast = document.createElement("div");
      toast.className = "toast";
      toast.id = "sp-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);

      renderFab(document.body);

      attachPhotoLogo(document);
      bindActions();
      updateBadge();
      setProgress(document);

      /* desktop hover affordance for the mega menu */
      var hasMenu = el(".nav__item--has-menu");
      if (hasMenu) {
        var hoverTimer = null;
        hasMenu.addEventListener("mouseenter", function () {
          if (!SP.isDesktop()) return;
          clearTimeout(hoverTimer);
          var panel = el("#nav-wwd-panel");
          var btn = el('[data-action="wwd-toggle"]');
          if (panel) panel.classList.add("is-open");
          if (btn) btn.setAttribute("aria-expanded", "true");
        });
        hasMenu.addEventListener("mouseleave", function () {
          if (!SP.isDesktop()) return;
          hoverTimer = setTimeout(closeWwd, 220);
        });
      }
    }
  };
})(window.SP);

SP.components.init();
