/* gallery.js — responsive category-filtered masonry grid + keyboard accessible lightbox */

(function (SP) {
  "use strict";

  var allItems = [];
  var currentItems = [];
  var currentFilter = "all";
  var lightbox, lightboxImg, lightboxCaption, current = 0, untrap = null, lastFocused = null;

  function cleanCaption(text) {
    if (!text) return "";
    return String(text).replace(/\s*—\s*photo\s+pending/gi, "").trim();
  }

  function getCategoryLabel(catId) {
    var cats = (SP.config && SP.config.GALLERY_CATEGORIES) || [];
    for (var i = 0; i < cats.length; i++) {
      if (cats[i].id === catId) return cats[i].label;
    }
    return catId;
  }

  function renderFilters() {
    var bar = SP.qs("[data-gallery-filters]");
    if (!bar) return;
    var cats = (SP.config && SP.config.GALLERY_CATEGORIES) || [
      { id: "all", label: "All Photos" }
    ];

    bar.innerHTML = cats.map(function (c) {
      var active = c.id === currentFilter;
      return (
        '<button class="gallery-filter-btn' + (active ? " is-active" : "") + '" ' +
        'type="button" role="tab" aria-selected="' + (active ? "true" : "false") + '" ' +
        'data-gallery-filter="' + c.id + '">' +
        SP.esc(c.label) +
        '</button>'
      );
    }).join("");

    bar.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-gallery-filter]");
      if (!btn) return;
      var cat = btn.getAttribute("data-gallery-filter");
      if (cat && cat !== currentFilter) {
        setFilter(cat);
      }
    });
  }

  function setFilter(cat) {
    currentFilter = cat;
    var btns = SP.qsa(".gallery-filter-btn");
    btns.forEach(function (btn) {
      var active = btn.getAttribute("data-gallery-filter") === cat;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    renderGrid();
  }

  function renderGrid() {
    var holder = SP.qs("[data-gallery]");
    if (!holder) return;

    if (!allItems.length) {
      allItems = (SP.config && SP.config.GALLERY) || [];
    }

    currentItems = (currentFilter === "all")
      ? allItems
      : allItems.filter(function (item) { return item.category === currentFilter; });

    if (!currentItems.length) {
      holder.innerHTML = '<p class="gallery-empty">No photographs found in this category.</p>';
      return;
    }

    holder.innerHTML = currentItems.map(function (item, i) {
      var caption = cleanCaption(item.caption);
      var catName = getCategoryLabel(item.category);
      return (
        '<button class="gallery-tile" type="button" data-gallery-index="' + i + '" ' +
        'aria-label="Open image: ' + SP.esc(caption) + '">' +
        SP.imgTag({
          src: item.src,
          alt: caption,
          name: caption.replace(/ — .*$/, ""),
          tint: item.tint,
          noDims: true
        }) +
        '<span class="gallery-tile__caption">' +
        (item.category && item.category !== "all" ? '<span class="gallery-tile__tag">' + SP.esc(catName) + '</span>' : '') +
        '<span class="gallery-tile__text">' + SP.esc(caption) + '</span>' +
        '</span>' +
        '</button>'
      );
    }).join("");
    SP.hydrateImages(holder);
  }

  function ensureLightbox() {
    if (lightbox) return;
    lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Image viewer");
    lightbox.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="Close image viewer">' +
      '<svg class="i" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
      "</button>" +
      '<button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous image">' +
      '<svg class="i" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      "</button>" +
      '<button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next image">' +
      '<svg class="i" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      "</button>" +
      '<figure class="lightbox__figure">' +
      '<img class="lightbox__img" alt="" width="1200" height="900" data-sp-fallback>' +
      '<figcaption class="lightbox__caption"></figcaption>' +
      "</figure>";
    document.body.appendChild(lightbox);

    lightboxImg = lightbox.querySelector(".lightbox__img");
    lightboxCaption = lightbox.querySelector(".lightbox__caption");

    lightbox.querySelector(".lightbox__close").addEventListener("click", close);
    lightbox.querySelector(".lightbox__nav--prev").addEventListener("click", function () { step(-1); });
    lightbox.querySelector(".lightbox__nav--next").addEventListener("click", function () { step(1); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  function update() {
    var item = currentItems[current];
    if (!item) return;
    var caption = cleanCaption(item.caption);
    lightboxImg.dataset.name = caption.replace(/ — .*$/, "");
    lightboxImg.dataset.tint = item.tint;
    delete lightboxImg.dataset.spFallbackDone;
    lightboxImg.alt = caption;
    lightboxImg.src = item.src;
    if (lightboxImg.complete && lightboxImg.naturalWidth === 0) {
      lightboxImg.dispatchEvent(new Event("error"));
    }
    lightboxCaption.textContent = caption + " (" + (current + 1) + " of " + currentItems.length + ")";
  }

  function open(index) {
    ensureLightbox();
    current = SP.clamp(index, 0, currentItems.length - 1);
    lastFocused = document.activeElement;
    lightbox.classList.add("is-open");
    document.documentElement.classList.add("no-scroll");
    update();
    untrap = SP.trapFocus(lightbox);
    lightbox.querySelector(".lightbox__close").focus();
  }

  function close() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    document.documentElement.classList.remove("no-scroll");
    if (untrap) { untrap(); untrap = null; }
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function step(dir) {
    if (!currentItems.length) return;
    current = (current + dir + currentItems.length) % currentItems.length;
    update();
  }

  function init() {
    var holder = SP.qs("[data-gallery]");
    if (!holder) return;

    renderFilters();
    renderGrid();

    holder.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-gallery-index]");
      if (btn) open(Number(btn.getAttribute("data-gallery-index")));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SP);
