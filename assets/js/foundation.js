/* foundation.js — About + What-we-do pages: copy from config, work nav, CTA, product grid */

(function (SP) {
  "use strict";

  var cfg = SP.config;

  function setText(selector, text) {
    var node = SP.qs(selector);
    if (node) node.textContent = text || "";
  }

  function renderWorkNav(currentSlug) {
    var holder = SP.qs("[data-work-nav]");
    if (!holder) return;
    if (currentSlug === "about") {
      holder.classList.add("work-nav--categories");
      holder.innerHTML = (cfg.WHAT_WE_DO_CATEGORIES || []).map(function (group) {
        return (
          '<li class="work-nav__category">' +
          '<span class="work-nav__category-label">' + SP.esc(group.category) + "</span>" +
          '<ul class="work-nav__subnav">' +
          group.items.map(function (item) {
            return '<li><a href="' + SP.esc(item.href) + '">' + SP.esc(item.title) + "</a></li>";
          }).join("") +
          "</ul>" +
          "</li>"
        );
      }).join("");
      return;
    }
    holder.innerHTML = cfg.WHAT_WE_DO.map(function (item) {
      var active = item.slug === currentSlug;
      return (
        "<li>" +
        (active
          ? '<a href="' + item.href + '" aria-current="page"><strong>' + SP.esc(item.title) + "</strong></a>"
          : '<a href="' + item.href + '">' + SP.esc(item.title) + "</a>") +
        "</li>"
      );
    }).join("") +
      '<li><a href="gallery.html">Gallery</a></li>';
  }

  function renderSections(sections) {
    var holder = SP.qs("[data-copy-sections]");
    if (!holder || !sections) return;
    holder.innerHTML = sections.map(function (section) {
      return (
        '<article class="story-block">' +
        "<h2>" + SP.esc(section.h) + "</h2>" +
        section.p.map(function (para) {
          var isPlaceholder = para.indexOf("Placeholder") === 0;
          return "<p" + (isPlaceholder ? ' class="is-placeholder"' : "") + ">" + SP.esc(para) + "</p>";
        }).join("") +
        "</article>"
      );
    }).join("");
  }

  function renderCta(cta) {
    var holder = SP.qs("[data-cta-band]");
    if (!holder) return;
    if (!cta) { holder.remove(); return; }
    holder.innerHTML =
      '<div class="cta-band__text">' +
      "<h2>" + SP.esc(cta.title) + "</h2>" +
      "<p>" + SP.esc(cta.text) + "</p>" +
      "</div>" +
      '<div class="cta-band__actions">' +
      '<a class="btn btn--amber btn--lg" href="' + SP.esc(cta.href) + '">' + SP.esc(cta.label) + "</a>" +
      "</div>";
  }

  function renderProducts() {
    var holder = SP.qs("[data-wwd-products]");
    if (!holder) return;
    var tagged = SP.products.filter(function (p) {
      return (p.tags || []).indexOf("Water Hyacinth") !== -1;
    });
    if (!tagged.length) { holder.closest("section").remove(); return; }
    holder.innerHTML = tagged.map(function (p) { return SP.productCard(p); }).join("");
    SP.hydrateImages(holder);
  }

  function init() {
    var key = document.body.getAttribute("data-copy");
    renderWorkNav(key);

    var copy = cfg.COPY[key];
    if (!copy) return;

    setText('[data-copy="eyebrow"]', copy.eyebrow);
    setText('[data-copy="title"]', copy.title);
    setText('[data-copy="lead"]', copy.lead);
    setText('[data-copy="note"]', copy.placeholderNote);

    renderSections(copy.sections);
    renderCta(copy.cta);
    renderProducts();

    document.title = copy.title + " | " + cfg.SITE_NAME;
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", copy.lead);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SP);
