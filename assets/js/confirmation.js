/* confirmation.js — order confirmation page (?id=SP-YYYYMMDD-XXXX) */

(function (SP) {
  "use strict";

  var cfg = SP.config;
  var root;

  function itemsMarkup(order) {
    return order.items.map(function (item, i) {
      return (
        '<div class="order-item">' +
        SP.imgTag({
          src: "assets/images/products/" + item.slug + "-1.jpg",
          alt: "",
          name: item.name,
          tint: SP.config.categoryTint(item.category),
          w: 96,
          h: 96
        }) +
        '<div class="order-item__info">' +
        '<span class="order-item__name">' + SP.esc(item.name) + "</span>" +
        '<span class="order-item__meta">Qty ' + item.qty + " · " + SP.fmtINR(item.unit) + "</span>" +
        "</div>" +
        '<strong class="order-item__price">' + SP.fmtINR(item.lineTotal) + "</strong>" +
        "</div>"
      );
    }).join("");
  }

  function notFound() {
    document.title = "Order not found | " + cfg.SITE_NAME;
    root.innerHTML =
      '<div class="empty-state">' +
      '<span class="empty-state__icon">' +
      '<svg class="i" width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 7.5v5.5M12 16.2v.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
      "</span>" +
      "<h1>We could not find that order</h1>" +
      '<p class="muted">Check the order id, or start a new order from the shop. (Orders live in this browser only.)</p>' +
      '<div class="btn-row">' +
      '<a class="btn btn--primary" href="shop.html">Back to the shop</a>' +
      '<a class="btn btn--secondary" href="track.html">Track an order</a>' +
      "</div></div>";
  }

  function render() {
    var id = SP.param("id");
    var order = id ? SP.store.getOrder(id) : null;
    if (!order) { notFound(); return; }

    var addr = order.address || {};
    var eta = SP.fmtDate(order.etaFrom) + " – " + SP.fmtDate(order.etaTo);
    var trackHref = "track.html?id=" + encodeURIComponent(order.id) +
      "&phone=" + encodeURIComponent(order.customer.phone);

    document.title = "Order " + order.id + " confirmed | " + cfg.SITE_NAME;

    root.innerHTML =
      '<div class="confirm-hero">' +
      '<span class="confirm-hero__icon">' +
      '<svg class="i" width="34" height="34" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.8l4.4 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      "</span>" +
      '<div>' +
      '<p class="eyebrow">Step 3 of 3</p>' +
      "<h1>Order confirmed</h1>" +
      '<p class="confirm-hero__id mono">' + SP.esc(order.id) + "</p>" +
      '<p class="lead">Thank you, ' + SP.esc(order.customer.name) +
      ". A confirmation would be emailed to <strong>" + SP.esc(order.customer.email) + "</strong>.</p>" +
      "</div></div>" +

      '<div class="confirm-grid">' +
      '<section class="summary" aria-labelledby="conf-summary">' +
      '<h2 class="summary__title" id="conf-summary">Order summary</h2>' +
      '<div class="order-items">' + itemsMarkup(order) + "</div>" +
      "<hr>" +
      '<div class="summary__row"><span>Subtotal</span><strong>' + SP.fmtINR(order.subtotal) + "</strong></div>" +
      (order.discount
        ? '<div class="summary__row summary__row--discount"><span>Discount (' + SP.esc(order.coupon) + ')</span><strong>− ' + SP.fmtINR(order.discount) + "</strong></div>"
        : "") +
      '<div class="summary__row"><span>Courier estimate</span><strong>' +
      (order.shipping === 0 ? "Free" : SP.fmtINR(order.shipping)) + "</strong></div>" +
      '<div class="summary__row"><span>GST @ ' + order.gstPercent + '%</span><strong>' + SP.fmtINR(order.gst) + "</strong></div>" +
      '<div class="summary__row summary__row--total"><span>Total</span><strong>' + SP.fmtINR(order.total) + "</strong></div>" +
      '<p class="form-note">Product prices exclude print and courier charges.</p>' +
      "</section>" +

      '<aside class="summary" aria-labelledby="conf-details">' +
      '<h2 class="summary__title" id="conf-details">Delivery &amp; payment</h2>' +
      '<dl class="detail-list">' +
      "<div><dt>Estimated delivery</dt><dd>" + SP.esc(eta) + "</dd></div>" +
      "<div><dt>Payment</dt><dd>" + SP.esc(paymentLabel(order)) + "</dd></div>" +
      "<div><dt>Placed on</dt><dd>" + SP.fmtDateTime(order.placedAt) + "</dd></div>" +
      "<div><dt>Ship to</dt><dd>" + SP.esc(order.customer.name) + "<br>" +
      SP.esc(addr.line || "") + "<br>" + SP.esc(addr.city || "") + " " + SP.esc(addr.state || "") +
      " — " + SP.esc(addr.pincode || "") + "</dd></div>" +
      "<div><dt>Contact</dt><dd>" + SP.esc(order.customer.phone) + "<br>" + SP.esc(order.customer.email) + "</dd></div>" +
      "</dl>" +
      '<div class="btn-row">' +
      '<a class="btn btn--primary" href="' + trackHref + '">Track order</a>' +
      '<a class="btn btn--secondary" href="invoice.html?id=' + encodeURIComponent(order.id) + '">Download invoice</a>' +
      "</div>" +
      '<a class="link-btn" href="shop.html">Continue shopping</a>' +
      "</aside></div>";

    SP.hydrateImages(root);
  }

  function paymentLabel(order) {
    var map = { upi: "UPI", card: "Card", netbanking: "Net banking", cod: "Cash on Delivery" };
    return map[order.payment.method] || order.payment.method;
  }

  function init() {
    root = SP.qs("[data-confirm-root]");
    if (!root) return;
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SP);
