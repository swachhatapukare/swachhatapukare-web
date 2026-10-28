/* home.js — home page only: link targets, image fallbacks, scroll reveals,
   impact counters, story cross-fade and keyboard support for scroll rows.
   No dependencies beyond the existing SP helpers. */

(function (SP) {
  "use strict";

  var HOME_CONFIG = {
    /* TODO: SP.config.SHOP_URL does not exist in this repo yet, and teaser.js
       is not present either. Set SHOP_URL to the external store base (for
       example "https://shop.example.org/") when it is ready. An empty string
       keeps every shop link on this site's own shop.html / product.html. */
    SHOP_URL: "",

    /* TODO confirm: figures still to be verified with the Foundation.
       The same numbers are written in index.html so they survive with JS off;
       keep the two in sync. A null value hides its tile. */
    IMPACT: [
      { value: 500, suffix: "+", label: "River cleaning drives", aria: "500 plus river cleaning drives" },
      { value: 68, suffix: "+", label: "TEDx speakers", aria: "68 plus TEDx speakers" },
      { value: 5000, suffix: "\u00A0kW+", label: "Solar capacity", aria: "5,000 kilowatts plus of solar capacity", format: "comma" },
      { value: null, label: "CSR projects" }
    ]
  };

  var reduced = SP.prefersReducedMotion ? SP.prefersReducedMotion() : false;
  var qsa = SP.qsa || function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ------------------------------------------------------------ shop links */
  function shopBase() {
    var base = (SP.config && SP.config.SHOP_URL) || HOME_CONFIG.SHOP_URL || "";
    return String(base).trim();
  }

  function shopHref() {
    return shopBase() || "shop.html";
  }

  function productHref(slug) {
    var path = "product.html?slug=" + encodeURIComponent(slug || "");
    var base = shopBase();
    if (!base) return path;
    return (base.slice(-1) === "/" ? base : base + "/") + path;
  }

  function wireShopLinks() {
    qsa("[data-shop-link]").forEach(function (link) {
      link.setAttribute("href", shopHref());
    });
    qsa("[data-product-link]").forEach(function (link) {
      var slug = link.getAttribute("data-product-link");
      if (slug) link.setAttribute("href", productHref(slug));
    });
  }

  /* --------------------------------------------------------- image fallback */
  function tintHex(name) {
    var value = "";
    try {
      value = getComputedStyle(document.documentElement).getPropertyValue(name || "").trim();
    } catch (e) { value = ""; }
    return value || "#E8F1FA";
  }

  function escapeXml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function wrapLabel(label, perLine) {
    var words = String(label || "Photo coming soon").split(/\s+/);
    var lines = [];
    var line = "";
    words.forEach(function (word) {
      if (line && (line + " " + word).length > perLine) {
        lines.push(line);
        line = word;
      } else {
        line = line ? line + " " + word : word;
      }
    });
    if (line) lines.push(line);
    return lines.slice(0, 4);
  }

  function placeholderUri(label, tint, w, h) {
    w = Math.max(320, w || 900);
    h = Math.max(320, h || 900);
    var lines = wrapLabel(label, Math.max(14, Math.round(w / 24)));
    var fontSize = Math.max(20, Math.round(w / 24));
    var gap = Math.round(fontSize * 1.3);
    var startY = Math.round(h / 2) - Math.round((lines.length - 1) * gap / 2);
    var labelMarkup = lines.map(function (line, index) {
      return "<text x='" + Math.round(w / 2) + "' y='" + (startY + index * gap) +
        "' text-anchor='middle' font-family='Georgia, serif' font-size='" + fontSize +
        "' fill='#0B2E4F'>" + escapeXml(line) + "</text>";
    }).join("");
    var dropY = startY - fontSize - Math.round(fontSize * 1.9);

    var svg =
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 " + w + " " + h + "' width='" + w + "' height='" + h + "'>" +
      "<rect width='" + w + "' height='" + h + "' fill='" + tint + "'/>" +
      "<g fill='none' stroke='#176BAE' stroke-opacity='.22' stroke-width='2'>" +
      "<path d='M-40 " + Math.round(h * 0.78) + "c140-50 250 45 390 0s250-50 390 0 250 45 390 0'/>" +
      "<path d='M-40 " + Math.round(h * 0.84) + "c140-50 250 45 390 0s250-50 390 0 250 45 390 0'/>" +
      "<path d='M-40 " + Math.round(h * 0.9) + "c140-50 250 45 390 0s250-50 390 0 250 45 390 0'/>" +
      "</g>" +
      "<path d='M" + Math.round(w / 2) + " " + (dropY - Math.round(fontSize * 1.6)) +
      "s-" + Math.round(fontSize * 1.1) + " " + Math.round(fontSize * 1.3) + " -" + Math.round(fontSize * 1.1) + " " + Math.round(fontSize * 2) +
      "a" + Math.round(fontSize * 1.1) + " " + Math.round(fontSize * 1.1) + " 0 0 0 " + Math.round(fontSize * 2.2) + " 0" +
      "c0-" + Math.round(fontSize * 0.7) + " -" + Math.round(fontSize * 1.1) + " -" + Math.round(fontSize * 2) + " -" + Math.round(fontSize * 1.1) + " -" + Math.round(fontSize * 2) + "z' " +
      "fill='none' stroke='#176BAE' stroke-opacity='.55' stroke-width='2'/>" +
      labelMarkup +
      "<text x='" + Math.round(w / 2) + "' y='" + (startY + lines.length * gap + Math.round(fontSize * 0.2)) +
      "' text-anchor='middle' font-family='Helvetica, Arial, sans-serif' font-size='" + Math.max(11, Math.round(fontSize * 0.34)) +
      "' letter-spacing='2' fill='#53687C'>PHOTO COMING SOON</text>" +
      "</svg>";

    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  SP.homeFallback = function (img) {
    if (!img || img.dataset.hFallback) return;
    img.dataset.hFallback = "1";
    img.onerror = null;
    var w = Number(img.getAttribute("data-w")) || img.naturalWidth || 900;
    var h = Number(img.getAttribute("data-h")) || img.naturalHeight || 900;
    img.src = placeholderUri(img.getAttribute("data-label") || img.getAttribute("alt"), tintHex(img.getAttribute("data-tint")), w, h);
    img.classList.add("is-fallback");
  };

  function hydrateFallbacks() {
    qsa("img[data-label]").forEach(function (img) {
      if (img.complete && img.naturalWidth === 0) {
        SP.homeFallback(img);
      } else {
        img.addEventListener("error", function () { SP.homeFallback(img); });
      }
    });
  }

  /* --------------------------------------------------------------- counters */
  function formatNumber(value, format) {
    if (format === "comma") {
      try {
        return new Intl.NumberFormat("en-IN").format(value);
      } catch (e) {
        return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }
    }
    return String(value);
  }

  function animateCount(node, target, format) {
    if (reduced) {
      node.textContent = formatNumber(target, format);
      return;
    }
    var duration = 1200;
    var start = null;
    function frame(now) {
      if (start === null) start = now;
      var t = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      node.textContent = formatNumber(Math.round(target * eased), format);
      if (t < 1) requestAnimationFrame(frame);
      else node.textContent = formatNumber(target, format);
    }
    requestAnimationFrame(frame);
  }

  function initImpact() {
    var items = qsa(".h-impact__item");
    if (!items.length) return;

    var visible = HOME_CONFIG.IMPACT.filter(function (entry) { return entry.value != null; });

    items.forEach(function (item, index) {
      var entry = visible[index];
      if (!entry) return;
      if (entry.aria) item.setAttribute("aria-label", entry.aria);
      var node = item.querySelector(".h-impact__count");
      var suffix = item.querySelector(".h-impact__suffix");
      var label = item.querySelector(".h-impact__label");
      if (node) {
        node.setAttribute("data-count-to", String(entry.value));
        node.setAttribute("data-format", entry.format || "");
        node.textContent = formatNumber(entry.value, entry.format);
      }
      if (suffix && entry.suffix != null) suffix.textContent = entry.suffix;
      if (label) label.textContent = entry.label;
    });

    if (reduced || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var node = entry.target.querySelector(".h-impact__count");
        observer.unobserve(entry.target);
        if (!node) return;
        animateCount(node, Number(node.getAttribute("data-count-to")) || 0, node.getAttribute("data-format"));
      });
    }, { threshold: 0.4 });

    items.forEach(function (item) { observer.observe(item); });
  }

  /* ------------------------------------------------------------ story steps */
  function initStory() {
    var steps = qsa("[data-story-steps] .h-step");
    var images = qsa(".h-story__img");
    var progress = document.querySelector("[data-story-progress]");
    if (!steps.length || !images.length) return;

    function setActive(index) {
      steps.forEach(function (step, i) {
        var active = i === index;
        step.classList.toggle("is-active", active);
        var button = step.querySelector(".h-step__btn");
        if (button) button.setAttribute("aria-pressed", active ? "true" : "false");
      });
      images.forEach(function (image, i) {
        var active = i === index;
        image.classList.toggle("is-active", active);
        if (active) image.removeAttribute("aria-hidden");
        else image.setAttribute("aria-hidden", "true");
      });
      if (progress) {
        progress.style.transform = "scaleY(" + ((index + 1) / steps.length).toFixed(4) + ")";
      }
    }

    steps.forEach(function (step, index) {
      var button = step.querySelector(".h-step__btn");
      if (!button) return;
      button.addEventListener("click", function () { setActive(index); });
    });

    if (!("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        setActive(Number(entry.target.getAttribute("data-step")) || 0);
      });
    }, { rootMargin: "-42% 0px -42% 0px", threshold: 0 });

    steps.forEach(function (step) { observer.observe(step); });
    setActive(0);
  }

  /* ------------------------------------------------------------- scroll rows */
  function initScrollRows() {
    qsa("[data-scroll-row]").forEach(function (row) {
      row.addEventListener("keydown", function (event) {
        if (row.scrollWidth <= row.clientWidth + 2) return;
        var item = row.querySelector("li, article");
        var step = item ? item.getBoundingClientRect().width + 16 : row.clientWidth * 0.8;
        var behavior = reduced ? "auto" : "smooth";

        if (event.key === "ArrowRight") {
          event.preventDefault();
          row.scrollBy({ left: step, behavior: behavior });
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          row.scrollBy({ left: -step, behavior: behavior });
        } else if (event.key === "Home") {
          event.preventDefault();
          row.scrollTo({ left: 0, behavior: behavior });
        } else if (event.key === "End") {
          event.preventDefault();
          row.scrollTo({ left: row.scrollWidth, behavior: behavior });
        }
      });
    });
  }

  /* --------------------------------------------------- partner logo marquee */
  function initPartners() {
    var root = qsa("[data-partner-marquee]")[0];
    if (!root) return;
    var track = root.querySelector("[data-partner-marquee-track]");
    var logos = (SP.config && SP.config.PARTNER_LOGOS) || [];
    if (!track || !logos.length) { root.hidden = true; return; }

    function listing(hidden) {
      var repeat = Math.max(2, Math.ceil(7 / logos.length));
      var html = "";
      for (var r = 0; r < repeat; r++) {
        logos.forEach(function (logo) {
          html += '<li class="h-partners__item' + (logo.tone === "dark" ? " is-dark" : "") + '"' +
            (logo.width ? ' style="--logo-w:' + Number(logo.width) + 'rem"' : "") +
            (hidden ? ' aria-hidden="true"' : "") + ">" +
            '<img class="h-partners__logo" src="' + SP.esc(logo.src) + '" alt="' +
            (hidden ? "" : SP.esc(logo.name)) + '" width="180" height="60" loading="lazy" decoding="async">' +
            '<span class="h-partners__name">' + SP.esc(logo.name) + "</span>" +
            "</li>";
        });
      }
      return html;
    }

    /* Two identical halves let the track slide by exactly -50% and loop. */
    track.innerHTML = listing(false) + listing(true);

    qsa(".h-partners__item", track).forEach(function (item) {
      var img = item.querySelector(".h-partners__logo");
      if (!img) return;
      function fallback() { item.classList.add("is-fallback"); }
      img.addEventListener("error", fallback);
      img.addEventListener("load", function () {
        if (img.naturalWidth === 0) fallback();
      });
    });

    /* Match speed to the content so short and long logo sets feel the same. */
    requestAnimationFrame(function () {
      var half = track.scrollWidth / 2;
      if (!half) return;
      root.style.setProperty("--marquee-duration", Math.min(60, Math.max(18, half / 70)).toFixed(1) + "s");
    });
  }

  /* ------------------------------------------------------------------- init */
  function init() {
    hydrateFallbacks();
    wireShopLinks();
    initImpact();
    initStory();
    initScrollRows();
    initPartners();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})(window.SP);
