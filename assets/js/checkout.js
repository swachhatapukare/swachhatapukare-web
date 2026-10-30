/* checkout.js — guest checkout, validation, COD rules, mock payment modal */

(function (SP) {
  "use strict";

  var cfg = SP.config;
  var form, emptyEl, wrapEl, itemsEl, totalsEl, placeBtn;
  var paymentMethod = "upi";
  var placing = false;

  /* ------------------------------------------------------------ rendering */
  function renderSummary() {
    var t = SP.store.totals();

    if (!t.lines.length) {
      if (emptyEl) emptyEl.hidden = false;
      if (wrapEl) wrapEl.hidden = true;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;
    if (wrapEl) wrapEl.hidden = false;

    itemsEl.innerHTML = t.lines.map(function (line) {
      return (
        '<div class="order-item">' +
        SP.imgTag({
          src: "assets/products/" + line.product.slug + "-1.jpg",
          alt: "",
          name: line.product.name,
          tint: SP.config.categoryTint(line.category),
          w: 96,
          h: 96
        }) +
        '<div class="order-item__info">' +
        '<span class="order-item__name">' + SP.esc(line.name) + "</span>" +
        '<span class="order-item__meta">Qty ' + line.qty + " · " + SP.fmtINR(line.unit) + "</span>" +
        "</div>" +
        '<strong class="order-item__price">' + SP.fmtINR(line.lineTotal) + "</strong>" +
        "</div>"
      );
    }).join("");
    SP.hydrateImages(itemsEl);

    totalsEl.innerHTML =
      '<div class="summary__row"><span>Subtotal</span><strong>' + SP.fmtINR(t.subtotal) + "</strong></div>" +
      (t.discount
        ? '<div class="summary__row summary__row--discount"><span>Discount (' + SP.esc(t.coupon) + ')</span><strong>− ' + SP.fmtINR(t.discount) + "</strong></div>"
        : "") +
      '<div class="summary__row"><span>Courier estimate</span><strong>' +
      (t.shipping === 0 ? "Free" : SP.fmtINR(t.shipping)) + "</strong></div>" +
      '<div class="summary__row"><span>GST @ ' + t.gstPercent + '%</span><strong>' + SP.fmtINR(t.gst) + "</strong></div>" +
      '<div class="summary__row summary__row--total"><span>Total</span><strong>' + SP.fmtINR(t.total) + "</strong></div>";

    updateCod(t);
  }

  /* --------------------------------------------------------------- COD */
  function codAllowed(t) {
    return t.total <= cfg.COD_MAX;
  }

  function updateCod(t) {
    var codInput = form.querySelector('input[value="cod"]');
    var codOption = form.querySelector("[data-cod-option]");
    var notice = form.querySelector("[data-cod-notice]");
    var desc = form.querySelector("[data-cod-desc]");
    if (!codInput) return;

    var allowed = codAllowed(t);
    codInput.disabled = !allowed;
    codOption.classList.toggle("payment-option--disabled", !allowed);

    if (!allowed) {
      desc.textContent = "Not available for this order value.";
      notice.hidden = false;
      notice.textContent = "Cash on Delivery is available for orders up to " + SP.fmtINR(cfg.COD_MAX) +
        ". This order total is " + SP.fmtINR(t.total) + " — please choose a prepaid option.";
      if (paymentMethod === "cod") selectPayment("upi");
    } else {
      desc.textContent = "Pay when the order arrives (up to " + SP.fmtINR(cfg.COD_MAX) + ").";
      notice.hidden = true;
      notice.textContent = "";
    }
  }

  function selectPayment(method) {
    paymentMethod = method;
    SP.qsa('input[name="payment"]', form).forEach(function (input) {
      var label = input.closest(".payment-option");
      var selected = input.value === method && !input.disabled;
      if (label) label.classList.toggle("is-selected", selected);
      if (input.value === method && !input.disabled) input.checked = true;
    });
    if (!form.querySelector('input[name="payment"]:checked')) {
      var upi = form.querySelector('input[value="upi"]');
      if (upi) { upi.checked = true; selectPayment("upi"); }
    }
  }

  /* ------------------------------------------------------------ validation */
  var rules = SP.rules([
    ["name", { fn: function (v) { return SP.validators.name(v) || "Please enter your full name."; } }],
    ["phone", { fn: function (v) { return SP.validators.mobile(v) || "Enter a valid 10-digit Indian mobile number."; } }],
    ["email", { fn: function (v) { return SP.validators.email(v) || "Enter a valid email address."; } }],
    ["address", { fn: function (v) { return SP.validators.required(v) || "Please enter your address."; } }],
    ["city", { fn: function (v) { return SP.validators.required(v) || "Please enter your city."; } }],
    ["state", { fn: function (v) { return SP.validators.required(v) || "Please select your state."; } }],
    ["pincode", { fn: function (v) { return SP.validators.pincode(v) || "Enter a valid 6-digit pincode."; } }],
    ["agree_terms", {
      fn: function () {
        var chk = form.querySelector('[name="agree_terms"]');
        return (chk && chk.checked) ? "" : "You must agree to the Terms & Conditions and Privacy Policy to proceed.";
      }
    }]
  ]);

  function collect() {
    var data = {};
    Object.keys(rules).forEach(function (name) {
      var input = form.querySelector('[name="' + name + '"]');
      data[name] = input ? String(input.value || "").trim() : "";
    });
    data.phone = SP.digits(data.phone);
    return data;
  }

  /* ---------------------------------------------------- mock payment modal */
  function methodLabel(m) {
    return { upi: "UPI", card: "Card", netbanking: "Net banking", cod: "Cash on Delivery" }[m] || m;
  }

  function runPayment() {
    if (placing) return;
    placing = true;

    if (paymentMethod === "cod") {
      SP.ui.modal({
        title: "Confirm your order",
        html:
          '<p>You are placing a <strong>Cash on Delivery</strong> order. Pay when it arrives.</p>' +
          '<div class="modal__actions">' +
          '<button class="btn btn--secondary" type="button" data-action="modal-close">Cancel</button>' +
          '<button class="btn btn--primary" type="button" id="confirm-cod">Place order</button>' +
          "</div>"
      });
      var confirmBtn = document.getElementById("confirm-cod");
      if (confirmBtn) {
        confirmBtn.addEventListener("click", function () {
          SP.ui.closeModal();
          finishOrder();
        });
      }
      placing = false;
      return;
    }

    SP.ui.modal({
      title: "Secure payment",
      html:
        '<div class="payment-state" data-payment-processing>' +
        '<div class="spinner" role="status"><span class="visually-hidden">Processing payment</span></div>' +
        '<p class="form-note">Processing your ' + SP.esc(methodLabel(paymentMethod)) + " payment…</p>" +
        "</div>"
    });

    // BACKEND-HOOK: POST /api/payments/create + webhook confirmation
    setTimeout(function () {
      var body = document.querySelector("#sp-modal-root .modal__body");
      if (!body) { placing = false; return; }
      body.innerHTML =
        '<div class="payment-state payment-state--ok">' +
        '<span class="payment-state__icon">' +
        '<svg class="i" width="34" height="34" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.8l4.4 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        "</span>" +
        "<h3>Payment successful</h3>" +
        '<p class="form-note">' + SP.esc(methodLabel(paymentMethod)) + " · " +
        SP.fmtINR(SP.store.totals().total) + ".</p>" +
        '<div class="modal__actions">' +
        '<button class="btn btn--primary" type="button" id="payment-continue">Continue to confirmation</button>' +
        "</div></div>";
      var btn = document.getElementById("payment-continue");
      if (btn) {
        btn.focus();
        btn.addEventListener("click", finishOrder);
      }
    }, 1500);
  }

  function finishOrder() {
    var customer = collect();
    var address = {
      line: customer.address,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode
    };
    var user = SP.store.getUser();
    var order = SP.store.placeOrder({
      method: paymentMethod,
      customer: { name: customer.name, phone: customer.phone, email: customer.email },
      address: address,
      userId: user ? user.phone : null
    });
    placing = false;
    if (!order) {
      SP.ui.toast("Your cart is empty.", "error");
      return;
    }
    // BACKEND-HOOK: server would return the order id and send the confirmation email
    SP.ui.closeModal();
    window.location.href = "order-confirmation.html?id=" + encodeURIComponent(order.id);
  }

  /* ------------------------------------------------------------- prefill */
  function prefill() {
    var user = SP.store.getUser();
    var addr = SP.store.defaultAddress();
    if (user) {
      setVal("name", user.name);
      setVal("phone", user.phone);
      setVal("email", user.email);
    }
    if (addr) {
      setVal("address", addr.line || addr.address || "");
      setVal("city", addr.city);
      setVal("state", addr.state);
      setVal("pincode", addr.pincode);
      var note = form.querySelector("[data-saved-address-note]");
      if (note && (addr.city || addr.line || addr.address)) note.hidden = false;
    }
  }

  function setVal(name, value) {
    var input = form.querySelector('[name="' + name + '"]');
    if (input && value && !input.value) input.value = value;
  }

  /* ----------------------------------------------------------------- init */
  function init() {
    form = document.getElementById("checkout-form");
    if (!form) return;
    emptyEl = SP.qs("[data-checkout-empty]");
    wrapEl = SP.qs("[data-checkout-wrap]");
    itemsEl = SP.qs("[data-order-items]");
    totalsEl = SP.qs("[data-order-totals]");
    placeBtn = document.getElementById("place-order");

    prefill();
    renderSummary();

    form.addEventListener("change", function (e) {
      if (e.target.name === "payment") selectPayment(e.target.value);
      else SP.clearFieldError(e.target);
    });

    form.addEventListener("input", function (e) {
      if (e.target.name === "phone") e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
      if (e.target.name === "pincode") e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
      SP.clearFieldError(e.target);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!SP.store.cartCount()) {
        SP.ui.toast("Your cart is empty.", "error");
        return;
      }
      if (!SP.validateForm(form, rules)) {
        SP.ui.toast("Please check the highlighted fields.", "error");
        return;
      }
      var t = SP.store.totals();
      if (paymentMethod === "cod" && !codAllowed(t)) {
        SP.ui.toast("Cash on Delivery is not available for this order value.", "error");
        return;
      }
      runPayment();
    });

    document.addEventListener("sp:cart", renderSummary);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SP);
