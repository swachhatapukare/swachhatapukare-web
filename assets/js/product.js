/* product.js — single product page: gallery, variants, specs, related, JSON-LD */

(function (SP) {
  "use strict";

  var cfg = SP.config;
  var root, crumb, product, selectedVariant, selectedQty = 1;

  function hasTag(p, tag) {
    return (p.tags || []).indexOf(tag) !== -1;
  }

  function currentPrice() {
    if (!product) return 0;
    if (selectedVariant) return selectedVariant.price;
    return SP.minPrice(product);
  }

  function priceMarkup() {
    if (SP.hasVariant(product)) {
      return '<span class="pdp__price-value" data-price>' + SP.fmtINR(currentPrice()) + "</span>" +
        '<span class="pdp__price-note">Selected variant · from ' + SP.fmtINR(SP.minPrice(product)) + "</span>";
    }
    return '<span class="pdp__price-value" data-price>' + SP.fmtINR(product.price) + "</span>" +
      '<span class="pdp__price-note">Fixed price</span>';
  }

  function galleryMarkup() {
    var tint = SP.config.categoryTint(product.category);
    var main = SP.imgTag({
      src: "assets/products/" + product.slug + "-1.jpg",
      alt: product.name + " — product photo 1 of 3",
      name: product.name,
      tint: tint,
      w: 900,
      h: 900,
      eager: true
    });

    var thumbs = [1, 2, 3].map(function (n) {
      return '<button class="thumb' + (n === 1 ? " is-active" : "") + '" type="button" data-thumb="' + n + '" ' +
        'aria-label="Show photo ' + n + ' of 3" aria-pressed="' + (n === 1 ? "true" : "false") + '">' +
        SP.imgTag({
          src: "assets/products/" + product.slug + "-" + n + ".jpg",
          alt: "",
          name: product.name,
          tint: tint,
          tag: "PHOTO " + n + " COMING SOON",
          w: 200,
          h: 200
        }) + "</button>";
    }).join("");

    return (
      '<div class="pdp__gallery">' +
      '<div class="pdp__main-img" data-main-img>' + main + "</div>" +
      '<div class="pdp__thumbs" role="group" aria-label="Product photos">' + thumbs + "</div>" +
      "</div>"
    );
  }

  function variantsMarkup() {
    if (!SP.hasVariant(product)) return "";
    var chips = product.variants.map(function (v, i) {
      var active = selectedVariant && selectedVariant.id === v.id;
      return '<button class="variant-chip" type="button" data-variant-chip="' + SP.esc(v.id) + '" ' +
        'aria-pressed="' + (active ? "true" : "false") + '">' + SP.esc(v.name) + " · " + SP.fmtINR(v.price) + "</button>";
    }).join("");
    return (
      '<div class="field">' +
      '<span class="field__label" id="variant-label">Choose a variant</span>' +
      '<div class="variants" role="group" aria-labelledby="variant-label">' + chips + "</div>" +
      "</div>"
    );
  }

  function specsMarkup() {
    var rows = [
      ["SKU", product.sku],
      ["Category", product.category],
      ["Dimensions", product.dimensions || "Size on request"],
      ["Variants", SP.hasVariant(product)
        ? product.variants.map(function (v) { return v.name + " (" + SP.fmtINR(v.price) + ")"; }).join(", ")
        : "Single version"],
      ["Tags", (product.tags || []).length ? product.tags.join(", ") : "Handcrafted"],
      ["Availability", product.stock_status === "instock" ? "In stock" : "Out of stock"]
    ];
    return (
      '<table class="specs"><caption class="visually-hidden">Specifications for ' + SP.esc(product.name) + "</caption><tbody>" +
      rows.map(function (r) {
        return "<tr><th scope=\"row\">" + SP.esc(r[0]) + "</th><td>" + SP.esc(r[1]) + "</td></tr>";
      }).join("") +
      "</tbody></table>"
    );
  }

  function relatedMarkup() {
    var list = SP.relatedProducts(product, 4);
    if (!list.length) return "";
    return (
      '<section class="section section--tight">' +
      '<div class="section-head"><div class="section-head__text">' +
      '<span class="eyebrow">Keep looking</span>' +
      '<h2 class="section-head__title">Related products</h2>' +
      "</div>" +
      '<a class="btn btn--ghost btn--sm" href="shop.html">View all</a></div>' +
      '<div class="product-grid">' + list.map(function (p) { return SP.productCard(p); }).join("") + "</div>" +
      "</section>"
    );
  }

  function notFoundMarkup() {
    return (
      '<div class="empty-state nf-box">' +
      '<span class="empty-state__icon">' +
      '<svg class="i" width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M15.6 15.6L20 20" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>' +
      "</span>" +
      "<h1>That product could not be found</h1>" +
      '<p class="muted">The link may be old, or the product has moved. Browse the full catalogue instead.</p>' +
      '<div class="btn-row">' +
      '<a class="btn btn--primary" href="shop.html">Go to the shop</a>' +
      '<a class="btn btn--secondary" href="index.html">Back home</a>' +
      "</div></div>"
    );
  }

  function addJsonLd() {
    var url = window.location.href;
    var images = [1, 2, 3].map(function (n) {
      return new URL("assets/products/" + product.slug + "-" + n + ".jpg", url).href;
    });
    var data = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      sku: product.sku,
      description: product.short_description,
      image: images,
      brand: { "@type": "Brand", name: cfg.SITE_NAME },
      category: product.category,
      offers: {
        "@type": "Offer",
        url: url,
        priceCurrency: "INR",
        price: String(currentPrice()),
        availability: product.stock_status === "instock"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock"
      }
    };
    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    document.title = product.name + " | " + cfg.SITE_NAME;
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", product.short_description +
      " Price excludes print and courier charges.");
  }

  function whatsappUrl() {
    var text = "Hello " + cfg.SITE_NAME + ", I would like to ask about " + product.name +
      " (" + product.sku + "). " + window.location.href;
    return "https://wa.me/" + cfg.FOUNDATION.whatsapp + "?text=" + encodeURIComponent(text);
  }

  function render() {
    var slug = SP.param("slug");
    product = slug ? SP.getProduct(slug) : null;

    if (!product) {
      document.title = "Product not found | " + cfg.SITE_NAME;
      root.innerHTML = notFoundMarkup();
      crumb.innerHTML += '<span class="breadcrumb__sep" aria-hidden="true">/</span><span>Product</span>';
      return;
    }

    selectedVariant = SP.hasVariant(product) ? product.variants[0] : null;
    selectedQty = 1;

    var tint = SP.config.categoryTint(product.category);
    var badges = "";
    if (product.featured) badges += '<span class="badge badge--featured">Featured</span>';
    if (hasTag(product, "Water Hyacinth")) badges += '<span class="badge badge--hyacinth">Water Hyacinth</span>';

    crumb.innerHTML =
      '<a href="index.html">Home</a><span class="breadcrumb__sep" aria-hidden="true">/</span>' +
      '<a href="shop.html">Shop</a><span class="breadcrumb__sep" aria-hidden="true">/</span>' +
      '<a href="shop.html?cat=' + SP.config.categorySlug(product.category) + '">' + SP.esc(product.category) + "</a>" +
      '<span class="breadcrumb__sep" aria-hidden="true">/</span>' +
      '<span aria-current="page">' + SP.esc(product.name) + "</span>";

    root.innerHTML =
      '<div class="pdp" data-product-panel' +
      (selectedVariant ? ' data-variant-selected="' + SP.esc(selectedVariant.id) + '"' : "") + ">" +
      galleryMarkup() +
      '<div class="pdp__info">' +
      '<div class="pdp__badges">' + badges + "</div>" +
      '<p class="card__cat">' + SP.esc(product.category) + "</p>" +
      "<h1>" + SP.esc(product.name) + "</h1>" +
      '<p class="pdp__short">' + SP.esc(product.short_description) + "</p>" +
      '<div class="pdp__price">' + priceMarkup() + "</div>" +
      variantsMarkup() +
      '<div class="pdp__buy">' +
      '<div class="qty qty--lg" data-qty-box>' +
      '<button class="qty__btn" type="button" data-action="qty-step" data-dir="-1" aria-label="Decrease quantity">' +
      '<svg class="i" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 12h13" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg></button>' +
      '<label class="visually-hidden" for="pdp-qty">Quantity</label>' +
      '<input class="qty__input" id="pdp-qty" data-qty-input type="number" min="1" max="99" value="1" inputmode="numeric">' +
      '<button class="qty__btn" type="button" data-action="qty-step" data-dir="1" aria-label="Increase quantity">' +
      '<svg class="i" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5.5v13M5.5 12h13" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg></button>' +
      "</div>" +
      '<button class="btn btn--primary btn--lg" type="button" data-action="add-to-cart" data-id="' + product.id + '">Add to cart</button>' +
      '<button class="btn btn--amber btn--lg" type="button" id="buy-now">Buy now</button>' +
      "</div>" +
      '<p class="notice notice--warn">All prices are in INR and <strong>exclude print and courier charges</strong>. ' +
      "A courier estimate is shown at checkout.</p>" +
      '<div class="pincode-checker" style="margin-top: 1rem;">' +
      '<span class="pincode-checker__title">' + SP.icon("location", 16) + ' Check delivery availability</span>' +
      '<form class="pincode-checker__form" id="pdp-pincode-form" novalidate>' +
      '<input class="pincode-checker__input" id="pdp-pincode-input" type="text" inputmode="numeric" maxlength="6" placeholder="Enter 6-digit PIN">' +
      '<button class="pincode-checker__btn" type="submit">Check</button>' +
      '</form>' +
      '<div class="pincode-result" id="pdp-pincode-result" hidden></div>' +
      '<p class="pincode-checker__coverage">Covered by <strong>' + SP.esc(cfg.COURIER_PARTNER) + '</strong> (28,000+ PIN codes PAN India).</p>' +
      '</div>' +
      '<p class="pdp__stock"><span class="badge badge--outline">' +
      (product.stock_status === "instock" ? "In stock" : "Out of stock") + "</span>" +
      '<a class="pdp__wa" href="' + whatsappUrl() + '" target="_blank" rel="noopener noreferrer">' +
      SP.icon("whatsapp", 16) +
      "Ask on WhatsApp</a></p>" +
      "</div></div>" +

      '<div class="pdp__details">' +
      '<div class="story-block">' +
      '<span class="eyebrow">Product story</span>' +
      "<h2>How it is described</h2>" +
      "<p>" + SP.esc(product.description) + "</p>" +
      (hasTag(product, "Water Hyacinth")
        ? '<p class="muted">This piece is tagged <strong>Water Hyacinth</strong> in the catalogue because that is the material used.</p>'
        : '<p class="muted">Catalogued simply as <strong>handcrafted</strong> — no material is claimed beyond that.</p>') +
      "</div>" +
      '<div class="story-block">' +
      '<span class="eyebrow">Specifications</span>' +
      "<h2>Details</h2>" + specsMarkup() +
      "</div>" +
      "</div>" +

      '<div class="cta-band" id="bulk-cta">' +
      '<div class="cta-band__text">' +
      "<h2>Need branding or bulk?</h2>" +
      "<p>Corporate gifting, printed branding and larger quantities are quoted separately — print and courier charges are not included in the prices shown here.</p>" +
      "</div>" +
      '<div class="cta-band__actions">' +
      '<a class="btn btn--on-dark" href="bulk-enquiry.html?product=' + encodeURIComponent(product.slug) + '">Request a quotation</a>' +
      "</div></div>" +

      relatedMarkup();

    SP.hydrateImages(root);
    addJsonLd();
    bindPdp();
  }

  function bindPdp() {
    /* variant chips */
    SP.qsa("[data-variant-chip]", root).forEach(function (chip) {
      chip.addEventListener("click", function () {
        var id = chip.getAttribute("data-variant-chip");
        selectedVariant = product.variants.filter(function (v) { return v.id === id; })[0] || null;
        SP.qsa("[data-variant-chip]", root).forEach(function (c) {
          c.setAttribute("aria-pressed", c === chip ? "true" : "false");
        });
        var panel = root.querySelector("[data-product-panel]");
        if (panel && selectedVariant) panel.setAttribute("data-variant-selected", selectedVariant.id);
        var priceEl = root.querySelector("[data-price]");
        if (priceEl) priceEl.textContent = SP.fmtINR(currentPrice());
      });
    });

    /* quantity */
    var qtyInput = root.querySelector("[data-qty-input]");
    if (qtyInput) {
      qtyInput.addEventListener("input", function () {
        selectedQty = SP.clamp(Number(qtyInput.value) || 1, 1, 99);
      });
      qtyInput.addEventListener("qty:change", function (e) {
        selectedQty = Number(e.detail.input.value) || 1;
      });
    }

    /* gallery thumbs */
    var mainHolder = root.querySelector("[data-main-img]");
    SP.qsa("[data-thumb]", root).forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var n = thumb.getAttribute("data-thumb");
        SP.qsa("[data-thumb]", root).forEach(function (t) {
          t.classList.toggle("is-active", t === thumb);
          t.setAttribute("aria-pressed", t === thumb ? "true" : "false");
        });
        if (!mainHolder) return;
        mainHolder.innerHTML = SP.imgTag({
          src: "assets/products/" + product.slug + "-" + n + ".jpg",
          alt: product.name + " — product photo " + n + " of 3",
          name: product.name,
          tint: SP.config.categoryTint(product.category),
          tag: "PHOTO " + n + " COMING SOON",
          w: 900,
          h: 900,
          eager: true
        });
        SP.hydrateImages(mainHolder);
      });
    });

    /* buy now */
    var buyNow = document.getElementById("buy-now");
    if (buyNow) {
      buyNow.addEventListener("click", function () {
        SP.store.addToCart(product.id, selectedVariant ? selectedVariant.id : "", selectedQty);
        // BACKEND-HOOK: POST /api/checkout/session — jump straight to payment
        window.location.href = "checkout.html";
      });
    }

    /* pincode checker on pdp */
    var pdpPinForm = document.getElementById("pdp-pincode-form");
    var pdpPinInput = document.getElementById("pdp-pincode-input");
    var pdpPinResult = document.getElementById("pdp-pincode-result");
    if (pdpPinForm && pdpPinInput && pdpPinResult) {
      pdpPinInput.addEventListener("input", function () {
        pdpPinInput.value = pdpPinInput.value.replace(/\D/g, "").slice(0, 6);
        pdpPinResult.hidden = true;
      });
      pdpPinForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var pin = pdpPinInput.value.trim();
        if (!/^[1-9]\d{5}$/.test(pin)) {
          pdpPinResult.hidden = false;
          pdpPinResult.className = "pincode-result pincode-result--error";
          pdpPinResult.textContent = "Please enter a valid 6-digit Indian PIN code.";
          return;
        }
        pdpPinResult.hidden = false;
        pdpPinResult.className = "pincode-result pincode-result--success";
        pdpPinResult.innerHTML = "<strong>✓ Delivery available to " + SP.esc(pin) + "!</strong><br>" +
          "Fulfilled via <strong>" + SP.esc(SP.config.COURIER_PARTNER) + "</strong>. Estimated 3–5 business days.";
      });
    }
  }

  function init() {
    root = SP.qs("[data-pdp-root]");
    crumb = SP.qs("[data-breadcrumb]");
    if (!root) return;
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SP);
