/* cart.js — cart page: line items, coupon, free-shipping bar, summary */

(function (SP) {
  "use strict";

  var cfg = SP.config;
  var main, summary;

  function lineMarkup(line) {
    var tint = SP.config.categoryTint(line.category);
    return (
      '<article class="cart-line">' +
      '<a class="cart-line__media" href="' + line.href + '">' +
      SP.imgTag({
        src: "assets/products/" + line.product.slug + "-1.jpg",
        alt: line.product.name + " product photo",
        name: line.product.name,
        tint: tint,
        w: 240,
        h: 240
      }) + "</a>" +
      '<div class="cart-line__info">' +
      '<span class="card__cat">' + SP.esc(line.category) + "</span>" +
      '<h2 class="cart-line__name"><a href="' + line.href + '">' + SP.esc(line.name) + "</a></h2>" +
      '<p class="cart-line__meta">SKU ' + SP.esc(line.sku) +
      (line.variantName ? " · " + SP.esc(line.variantName) : "") + "</p>" +
      '<div class="cart-line__controls">' +
      '<div class="qty">' +
      '<button class="qty__btn" type="button" data-action="cart-qty" data-dir="-1" data-id="' + line.id + '" data-variant="' + SP.esc(line.variantId) + '" aria-label="Decrease quantity of ' + SP.esc(line.name) + '">' +
      '<svg class="i" width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 12h13" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg></button>' +
      '<span class="qty__value">' + line.qty + "</span>" +
      '<button class="qty__btn" type="button" data-action="cart-qty" data-dir="1" data-id="' + line.id + '" data-variant="' + SP.esc(line.variantId) + '" aria-label="Increase quantity of ' + SP.esc(line.name) + '">' +
      '<svg class="i" width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5.5v13M5.5 12h13" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg></button>' +
      "</div>" +
      '<button class="link-btn link-btn--danger" type="button" data-action="cart-remove" data-id="' + line.id + '" data-variant="' + SP.esc(line.variantId) + '">Remove</button>' +
      "</div>" +
      "</div>" +
      '<div class="cart-line__price">' +
      '<span class="cart-line__unit">' + SP.fmtINR(line.unit) + " each</span>" +
      '<strong>' + SP.fmtINR(line.lineTotal) + "</strong>" +
      "</div></article>"
    );
  }

  function emptyMarkup() {
    return (
      '<div class="empty-state">' +
      '<span class="empty-state__icon">' +
      '<svg class="i" width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2.2l1.6 9.4a1.6 1.6 0 0 0 1.6 1.3h7.3a1.6 1.6 0 0 0 1.6-1.2L19 7H6.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="9" cy="18.4" r="1.4"/><circle cx="16.4" cy="18.4" r="1.4"/></svg>' +
      "</span>" +
      "<h2>Your cart is empty</h2>" +
      '<p class="muted">Nothing here yet. The catalogue has thirteen handcrafted pieces waiting.</p>' +
      '<div class="btn-row">' +
      '<a class="btn btn--primary" href="shop.html">Browse the shop</a>' +
      '<a class="btn btn--secondary" href="index.html">Back home</a>' +
      "</div></div>"
    );
  }

  function summaryMarkup(t) {
    var pct = Math.round(t.freeShippingProgress * 100);
    return (
      '<div class="summary">' +
      '<h2 class="summary__title">Order summary</h2>' +

      '<div class="progress-note">' +
      (t.isFreeShipping
        ? "<strong>Free courier estimate unlocked.</strong>"
        : "Add <strong>" + SP.fmtINR(t.freeShippingGap) + "</strong> to reach a free courier estimate.") +
      "</div>" +
      '<div class="progress" role="img" aria-label="Free courier progress: ' + pct + ' percent">' +
      '<span class="progress__bar" data-progress="' + t.freeShippingProgress + '"></span></div>' +

      '<form class="coupon" data-coupon-form>' +
      '<label class="visually-hidden" for="coupon-code">Coupon code</label>' +
      '<input class="input" id="coupon-code" name="coupon" type="text" placeholder="Coupon code" value="' + SP.esc(t.coupon) + '" autocomplete="off">' +
      '<button class="btn btn--secondary" type="submit">Apply</button>' +
      "</form>" +
      (t.coupon
        ? '<p class="form-note">Coupon <strong>' + SP.esc(t.coupon) + "</strong> applied (" + SP.esc(t.couponLabel) + "). " +
          '<button class="link-btn" type="button" data-remove-coupon>Remove</button></p>'
        : '<p class="form-note">Use code <strong>SWACHH10</strong> for 10% off.</p>') +

      "<hr>" +

      '<div class="summary__row"><span>Subtotal (' + t.count + (t.count === 1 ? " item" : " items") + ')</span><strong>' + SP.fmtINR(t.subtotal) + "</strong></div>" +
      (t.discount
        ? '<div class="summary__row summary__row--discount"><span>Discount (' + SP.esc(t.coupon) + ')</span><strong>− ' + SP.fmtINR(t.discount) + "</strong></div>"
        : "") +
      '<div class="summary__row"><span>Courier estimate</span><strong>' +
      (t.shipping === 0 ? "Free" : SP.fmtINR(t.shipping)) + "</strong></div>" +
      '<div class="summary__row"><span>GST @ ' + t.gstPercent + '%</span><strong>' + SP.fmtINR(t.gst) + "</strong></div>" +
      '<div class="summary__row summary__row--total"><span>Total</span><strong>' + SP.fmtINR(t.total) + "</strong></div>" +

      '<p class="form-note">Prices <strong>exclude print and courier charges</strong>. Print work and courier are quoted separately.</p>' +

      '<div class="drawer__actions">' +
      '<a class="btn btn--secondary" href="shop.html">Continue shopping</a>' +
      '<a class="btn btn--primary" href="checkout.html"' + (t.lines.length ? "" : ' aria-disabled="true" tabindex="-1"') + ">Checkout</a>" +
      "</div>" +
      "</div>"
    );
  }

  function render() {
    var t = SP.store.totals();

    if (!t.lines.length) {
      main.innerHTML = emptyMarkup();
      summary.innerHTML = "";
      return;
    }

    main.innerHTML =
      '<div class="cart-lines">' + t.lines.map(lineMarkup).join("") + "</div>" +
      '<div class="cart-toolbar">' +
      '<a class="link-btn" href="shop.html">← Continue shopping</a>' +
      '<button class="link-btn link-btn--danger" type="button" id="clear-cart">Empty cart</button>' +
      "</div>";

    summary.innerHTML = summaryMarkup(t);

    var bar = summary.querySelector("[data-progress]");
    if (bar) bar.style.setProperty("--pct", bar.getAttribute("data-progress"));

    SP.hydrateImages(main);

    var form = summary.querySelector("[data-coupon-form]");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var code = form.querySelector("input").value;
        var result = SP.store.applyCoupon(code);
        if (result.ok) SP.ui.toast(result.code ? "Coupon applied." : "Coupon removed.");
        else SP.ui.toast(result.message, "error");
        render();
      });
    }

    var removeCoupon = summary.querySelector("[data-remove-coupon]");
    if (removeCoupon) {
      removeCoupon.addEventListener("click", function () {
        SP.store.removeCoupon();
        SP.ui.toast("Coupon removed.");
        render();
      });
    }

    var clear = document.getElementById("clear-cart");
    if (clear) {
      clear.addEventListener("click", function () {
        SP.store.clearCart();
        SP.ui.toast("Cart emptied.");
        render();
      });
    }
  }

  function init() {
    main = SP.qs("[data-cart-main]");
    summary = SP.qs("[data-cart-summary]");
    if (!main) return;
    render();
    document.addEventListener("sp:cart", render);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SP);
