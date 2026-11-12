/* gallery.js — responsive grid + keyboard accessible lightbox */

(function (SP) {
  "use strict";

  var items = [];
  var grid, lightbox, lightboxImg, lightboxCaption, current = 0, untrap = null, lastFocused = null;

  function render() {
    var holder = SP.qs("[data-gallery]");
    if (!holder) return;
    items = SP.config.GALLERY;
    holder.innerHTML = items.map(function (item, i) {
      return (
        '<button class="gallery-tile" type="button" data-gallery-index="' + i + '" ' +
        'aria-label="Open image: ' + SP.esc(item.caption) + '">' +
        SP.imgTag({
          src: item.src,
          alt: item.caption,
          name: item.caption.replace(/ — .*$/, ""),
          tint: item.tint,
          noDims: true
        }) +
        '<span class="gallery-tile__caption">' + SP.esc(item.caption) + "</span>" +
        "</button>"
      );
    }).join("");
    SP.hydrateImages(holder);

    holder.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-gallery-index]");
      if (btn) open(Number(btn.getAttribute("data-gallery-index")));
    });
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
    var item = items[current];
    if (!item) return;
    lightboxImg.dataset.name = item.caption.replace(/ — .*$/, "");
    lightboxImg.dataset.tint = item.tint;
    delete lightboxImg.dataset.spFallbackDone;
    lightboxImg.alt = item.caption;
    lightboxImg.src = item.src;
    if (lightboxImg.complete && lightboxImg.naturalWidth === 0) {
      lightboxImg.dispatchEvent(new Event("error"));
    }
    lightboxCaption.textContent = item.caption + " (" + (current + 1) + " of " + items.length + ")";
  }

  function open(index) {
    ensureLightbox();
    current = SP.clamp(index, 0, items.length - 1);
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
    current = (current + dir + items.length) % items.length;
    update();
  }

  function init() { render(); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SP);
