/* home.js — hero art, animated counters, categories, featured carousel, testimonials */

(function (SP) {
  "use strict";

  var cfg = SP.config;

  /* ---------------------------------------------------------------- hero */
  function renderHeroArt() {
    var frame = SP.qs("[data-hero-art]");
    if (frame) {
      frame.innerHTML = SP.imgTag({
        src: "assets/products/coaster-set-1.jpg",
        alt: "Handwoven coaster set from the Foundation's catalogue",
        name: "Coaster Set",
        tint: "--c-cat-tabletop",
        w: 900,
        h: 900,
        eager: true
      });
      SP.hydrateImages(frame);
    }
    var story = SP.qs("[data-story-art]");
    if (story) {
      story.innerHTML =
        '<div class="story-art">' +
        SP.imgTag({
          src: "assets/gallery/weaving-1.jpg",
          alt: "Weaving water hyacinth — photograph pending",
          name: "Water hyacinth weaving",
          tint: "--c-cat-home",
          w: 900,
          h: 720
        }) +
        '<span class="story-art__tag badge badge--hyacinth">Water Hyacinth</span>' +
        "</div>";
      SP.hydrateImages(story);
    }
  }

  /* ------------------------------------------------------------ counters */
  function renderCounters() {
    var holder = SP.qs("[data-counters]");
    if (!holder) return;

    holder.innerHTML = cfg.IMPACT.map(function (item) {
      return (
        '<div class="counter">' +
        '<span class="counter__num" data-count-to="' + item.value + '" data-suffix="' + SP.esc(item.suffix || "") + '">' +
        (SP.prefersReducedMotion() ? item.value + SP.esc(item.suffix || "") : "0" + SP.esc(item.suffix || "")) +
        "</span>" +
        '<span class="counter__label">' + SP.esc(item.label) + "</span>" +
        "</div>"
      );
    }).join("");

    if (SP.prefersReducedMotion() || !("IntersectionObserver" in window)) return;

    var seen = false;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || seen) return;
        seen = true;
        SP.qsa("[data-count-to]", holder).forEach(function (node) { animate(node); });
        observer.disconnect();
      });
    }, { threshold: 0.4 });
    observer.observe(holder);
  }

  function animate(node) {
    var target = Number(node.getAttribute("data-count-to")) || 0;
    var suffix = node.getAttribute("data-suffix") || "";
    var duration = 1200;
    var start = performance.now();
    function frame(now) {
      var t = SP.clamp((now - start) / duration, 0, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      node.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(frame);
      else node.textContent = target + suffix;
    }
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------- categories */
  function renderCategories() {
    var holder = SP.qs("[data-categories]");
    if (!holder) return;
    holder.innerHTML = SP.categories().map(function (cat) {
      var count = SP.categoryCount(cat.name);
      return (
        '<a class="category-tile" href="shop.html?cat=' + cat.slug + '">' +
        '<span class="category-tile__count">' + count + (count === 1 ? " product" : " products") + "</span>" +
        '<span class="category-tile__name">' + SP.esc(cat.name) + "</span>" +
        '<span class="category-tile__arrow">' +
        '<svg class="i" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        "</span></a>"
      );
    }).join("");
  }

  /* ------------------------------------------------------------- featured */
  function renderFeatured() {
    var track = SP.qs("[data-carousel-track]");
    if (!track) return;
    var list = SP.featuredProducts();
    track.innerHTML = list.map(function (p) {
      return '<div class="carousel__slide">' + SP.productCard(p) + "</div>";
    }).join("");
    SP.hydrateImages(track);

    var prev = SP.qs('[data-carousel="prev"]');
    var next = SP.qs('[data-carousel="next"]');
    function step(dir) {
      var amount = Math.max(240, track.clientWidth * 0.7);
      track.scrollBy({ left: dir * amount, behavior: SP.prefersReducedMotion() ? "auto" : "smooth" });
    }
    if (prev) prev.addEventListener("click", function () { step(-1); });
    if (next) next.addEventListener("click", function () { step(1); });
  }

  /* --------------------------------------------------------- testimonials */
  function renderTestimonials() {
    var holder = SP.qs("[data-testimonials]");
    if (!holder) return;
    holder.innerHTML = cfg.TESTIMONIALS.map(function (t) {
      return (
        '<figure class="testimonial">' +
        '<blockquote><p>“' + SP.esc(t.quote) + "”</p></blockquote>" +
        "<figcaption>" +
        '<span class="testimonial__author">' + SP.esc(t.author) + "</span>" +
        '<span class="testimonial__role">' + SP.esc(t.role) + "</span>" +
        "</figcaption></figure>"
      );
    }).join("");
  }

  /* ------------------------------------------------------------ partners */
  function renderPartners() {
    var holder = SP.qs("[data-partners]");
    if (!holder) return;
    holder.innerHTML = cfg.PARTNERS.map(function (name) {
      return '<li class="chip chip--lg">' + SP.esc(name) + "</li>";
    }).join("");
  }

  function init() {
    renderHeroArt();
    renderCounters();
    renderCategories();
    renderFeatured();
    renderTestimonials();
    renderPartners();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SP);
