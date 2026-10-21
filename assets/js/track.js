/* track.js — order tracking with a live-looking timeline */

(function (SP) {
  "use strict";

  var cfg = SP.config;
  var form, resultEl;

  function timelineMarkup(order) {
    var steps = SP.store.tracking(order);
    return (
      '<ol class="timeline">' +
      steps.map(function (step) {
        return (
          '<li class="timeline__item' + (step.done ? " is-done" : "") + '">' +
          '<span class="timeline__dot" aria-hidden="true">' +
          (step.done
            ? '<svg class="i" width="13" height="13" viewBox="0 0 24 24"><path d="M5 12.8l4.4 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
            : "") +
          "</span>" +
          "<div>" +
          '<p class="timeline__label">' + SP.esc(step.label) +
          '<span class="visually-hidden">' + (step.done ? " — completed" : " — pending") + "</span></p>" +
          '<p class="timeline__time">' + (step.done ? SP.fmtDateTime(step.at) : "Expected " + SP.fmtDateTime(step.at)) + "</p>" +
          "</div></li>"
        );
      }).join("") +
      "</ol>"
    );
  }

  function successMarkup(order) {
    var eta = SP.fmtDate(order.etaFrom) + " – " + SP.fmtDate(order.etaTo);
    var lastDone = SP.store.tracking(order).filter(function (s) { return s.done; }).pop();
    var current = lastDone ? lastDone.label : "Order received";

    return (
      '<div class="track-head">' +
      "<div>" +
      '<p class="eyebrow">Order status</p>' +
      "<h2>" + SP.esc(order.id) + "</h2>" +
      '<p class="muted">Placed ' + SP.fmtDateTime(order.placedAt) +
      " · <strong>" + SP.esc(current) + "</strong></p>" +
      "</div>" +
      '<div class="track-head__eta">' +
      '<span class="track-head__eta-label">Estimated delivery</span>' +
      '<span class="track-head__eta-value">' + SP.esc(eta) + "</span>" +
      '<span class="track-head__eta-sub">' + SP.esc(cfg.COURIER_PARTNER) + '</span>' +
      "</div></div>" +

      '<div class="track-layout">' +
      '<section class="summary" aria-labelledby="track-steps">' +
      '<h3 class="summary__title" id="track-steps">Progress</h3>' +
      timelineMarkup(order) +
      "</section>" +

      '<aside class="summary" aria-labelledby="track-items">' +
      '<h3 class="summary__title" id="track-items">In this order</h3>' +
      '<div class="order-items">' +
      order.items.map(function (item) {
        return (
          '<div class="order-item order-item--simple">' +
          '<div class="order-item__info">' +
          '<span class="order-item__name">' + SP.esc(item.name) + "</span>" +
          '<span class="order-item__meta">Qty ' + item.qty + "</span>" +
          "</div>" +
          '<strong class="order-item__price">' + SP.fmtINR(item.lineTotal) + "</strong>" +
          "</div>"
        );
      }).join("") +
      "</div>" +
      '<hr>' +
      '<div class="summary__row summary__row--total"><span>Total</span><strong>' + SP.fmtINR(order.total) + "</strong></div>" +
      '<div class="btn-row">' +
      '<a class="btn btn--secondary btn--sm" href="invoice.html?id=' + encodeURIComponent(order.id) + '">View invoice</a>' +
      '<a class="btn btn--ghost btn--sm" href="contact.html">Need help?</a>' +
      "</div>" +
      "</aside></div>"
    );
  }

  function errorMarkup(message) {
    return (
      '<div class="empty-state" role="alert">' +
      '<span class="empty-state__icon">' +
      '<svg class="i" width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 7.5V13M12 16.2v.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
      "</span>" +
      "<h3>We could not find that order</h3>" +
      '<p class="muted">' + SP.esc(message) + "</p>" +
      '<p class="form-note">Orders are stored in this browser only. ' +
      "Place an order first, then track it from the confirmation page.</p>" +
      '<div class="btn-row">' +
      '<a class="btn btn--primary" href="shop.html">Go to the shop</a>' +
      '<a class="btn btn--secondary" href="cart.html">View cart</a>' +
      "</div></div>"
    );
  }

  function track(id, phone) {
    id = String(id || "").trim().toUpperCase();
    phone = SP.digits(phone);

    if (!id) {
      resultEl.hidden = false;
      resultEl.innerHTML = errorMarkup("Enter an order id to continue.");
      return;
    }

    var order = SP.store.getOrder(id);
    if (!order) {
      document.title = "Order not found | " + SP.config.SITE_NAME;
      resultEl.hidden = false;
      resultEl.innerHTML = errorMarkup("No order matches id “" + id + "”.");
      return;
    }
    if (phone && phone !== SP.digits(order.customer.phone)) {
      document.title = "Order not found | " + SP.config.SITE_NAME;
      resultEl.hidden = false;
      resultEl.innerHTML = errorMarkup("That mobile number does not match the order. Use the number used at checkout.");
      return;
    }

    resultEl.hidden = false;
    resultEl.innerHTML = successMarkup(order);
    document.title = "Track " + order.id + " | " + SP.config.SITE_NAME;
    resultEl.scrollIntoView({ behavior: SP.prefersReducedMotion() ? "auto" : "smooth", block: "nearest" });
  }

  function init() {
    form = document.getElementById("track-form");
    resultEl = SP.qs("[data-track-result]");
    if (!form || !resultEl) return;

    var idInput = document.getElementById("track-id");
    var phoneInput = document.getElementById("track-phone");

    phoneInput.addEventListener("input", function () {
      phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);
      SP.clearFieldError(phoneInput);
    });
    idInput.addEventListener("input", function () { SP.clearFieldError(idInput); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      if (!idInput.value.trim()) {
        SP.fieldError(idInput, "Enter your order id.");
        ok = false;
      } else SP.clearFieldError(idInput);
      if (!SP.validators.mobile(phoneInput.value)) {
        SP.fieldError(phoneInput, "Enter the 10-digit mobile used at checkout.");
        ok = false;
      } else SP.clearFieldError(phoneInput);
      if (!ok) return;
      track(idInput.value, phoneInput.value);
    });

    /* deep link: track.html?id=...&phone=... */
    var pid = SP.param("id");
    var pphone = SP.param("phone");
    if (pid) {
      idInput.value = pid;
      if (pphone) phoneInput.value = SP.digits(pphone);
      if (pphone) track(pid, pphone);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SP);
