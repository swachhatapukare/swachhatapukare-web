/* invoice.js — printable invoice (?id=) */

(function (SP) {
  "use strict";

  var cfg = SP.config;
  var root, actionsEl, backLink;

  function linesMarkup(order) {
    return order.items.map(function (item, i) {
      return (
        "<tr>" +
        '<td class="invoice__num">' + (i + 1) + "</td>" +
        "<td>" + SP.esc(item.name) +
        '<span class="invoice__sub">' + SP.esc(item.sku) + " · " + SP.esc(item.category) + "</span></td>" +
        '<td class="invoice__num">' + item.qty + "</td>" +
        '<td class="invoice__num">' + SP.fmtINR(item.unit) + "</td>" +
        '<td class="invoice__num">' + SP.fmtINR(item.lineTotal) + "</td>" +
        "</tr>"
      );
    }).join("");
  }

  function notFoundMarkup() {
    return (
      '<div class="empty-state">' +
      '<span class="empty-state__icon">' +
      '<svg class="i" width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h8l4 4V20.5H6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M14 3.5V8h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>' +
      "</span>" +
      "<h1>No invoice found</h1>" +
      '<p class="muted">We could not find an order with that id in this browser.</p>' +
      '<div class="btn-row">' +
      '<a class="btn btn--primary" href="shop.html">Back to the shop</a>' +
      '<a class="btn btn--secondary" href="track.html">Track an order</a>' +
      "</div></div>"
    );
  }

  function render() {
    var id = SP.param("id");
    var order = id ? SP.store.getOrder(id) : null;
    if (!order) {
      document.title = "Invoice not found | " + cfg.SITE_NAME;
      root.innerHTML = notFoundMarkup();
      return;
    }

    var addr = order.address || {};
    var methodMap = { upi: "UPI", card: "Card", netbanking: "Net banking", cod: "Cash on Delivery" };

    actionsEl.hidden = false;
    backLink.href = "order-confirmation.html?id=" + encodeURIComponent(order.id);

    document.title = "Invoice " + order.id + " | " + cfg.SITE_NAME;

    root.innerHTML =
      '<article class="invoice">' +
      '<header class="invoice__head">' +
      '<div class="invoice__from">' +
      '<img class="invoice__logo" src="assets/logo.png" alt="" width="64" height="64">' +
      '<p class="invoice__org">' + SP.esc(cfg.FOUNDATION.name) + "</p>" +
      "<address>" + cfg.FOUNDATION.addressLines.map(SP.esc).join("<br>") + "</address>" +
      '<p class="invoice__gst">GST No: ' + SP.esc(cfg.FOUNDATION.gst) + "</p>" +
      "</div>" +
      '<div class="invoice__meta">' +
      "<h1>Invoice</h1>" +
      '<dl class="detail-list detail-list--tight">' +
      "<div><dt>Invoice no.</dt><dd class=\"mono\">" + SP.esc(order.id) + "</dd></div>" +
      "<div><dt>Date</dt><dd>" + SP.fmtDate(order.placedAt) + "</dd></div>" +
      "<div><dt>Payment</dt><dd>" + SP.esc(methodMap[order.payment.method] || order.payment.method) + "</dd></div>" +
      "<div><dt>Status</dt><dd>Confirmed</dd></div>" +
      "</dl></div></header>" +

      '<section class="invoice__billing">' +
      "<div><h2>Bill to</h2><address>" +
      SP.esc(order.customer.name) + "<br>" +
      SP.esc(addr.line || "") + "<br>" +
      SP.esc(addr.city || "") + ", " + SP.esc(addr.state || "") + " " + SP.esc(addr.pincode || "") + "<br>" +
      SP.esc(order.customer.phone) + " · " + SP.esc(order.customer.email) +
      "</address></div>" +
      "<div><h2>Ship to</h2><address>" +
      SP.esc(addr.line || "") + "<br>" +
      SP.esc(addr.city || "") + ", " + SP.esc(addr.state || "") + " " + SP.esc(addr.pincode || "") +
      "</address></div>" +
      "</section>" +

      '<table class="invoice__table">' +
      '<caption class="visually-hidden">Invoice line items for order ' + SP.esc(order.id) + "</caption>" +
      "<thead><tr>" +
      '<th scope="col">#</th><th scope="col">Item</th>' +
      '<th scope="col" class="invoice__num">Qty</th>' +
      '<th scope="col" class="invoice__num">Rate</th>' +
      '<th scope="col" class="invoice__num">Amount</th>' +
      "</tr></thead>" +
      "<tbody>" + linesMarkup(order) + "</tbody>" +
      "</table>" +

      '<div class="invoice__totals">' +
      '<div class="summary__row"><span>Subtotal</span><strong>' + SP.fmtINR(order.subtotal) + "</strong></div>" +
      (order.discount
        ? '<div class="summary__row summary__row--discount"><span>Discount (' + SP.esc(order.coupon) + ')</span><strong>− ' + SP.fmtINR(order.discount) + "</strong></div>"
        : "") +
      '<div class="summary__row"><span>Courier estimate</span><strong>' +
      (order.shipping === 0 ? "Free" : SP.fmtINR(order.shipping)) + "</strong></div>" +
      '<div class="summary__row"><span>GST @ ' + order.gstPercent + '%</span><strong>' + SP.fmtINR(order.gst) + "</strong></div>" +
      '<div class="summary__row summary__row--total"><span>Grand total</span><strong>' + SP.fmtINR(order.total) + "</strong></div>" +
      "</div>" +

      '<footer class="invoice__foot">' +
      '<p class="invoice__disclaimer"><strong>Not a tax document.</strong></p>' +
      "<p>Product prices exclude print and courier charges. GST is charged at " +
      order.gstPercent + "%.</p>" +
      "<p>Generated " + SP.fmtDateTime(new Date().toISOString()) + " · " + SP.esc(cfg.SITE_NAME) + "</p>" +
      "</footer>" +
      "</article>";
  }

  function init() {
    root = SP.qs("[data-invoice-root]");
    actionsEl = SP.qs("[data-invoice-actions]");
    backLink = SP.qs("[data-invoice-back]");
    if (!root) return;

    render();

    /* the logo is decorative letterhead — drop it silently if the file is absent */
    var logo = SP.qs(".invoice__logo");
    if (logo) {
      logo.addEventListener("error", function () {
        if (logo.parentNode) logo.parentNode.removeChild(logo);
      });
    }

    var printBtn = document.getElementById("print-invoice");
    if (printBtn) {
      printBtn.addEventListener("click", function () {
        window.print();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SP);
