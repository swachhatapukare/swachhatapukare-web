/* forms.js — contact, donate and bulk-enquiry forms (each detected by presence) */

(function (SP) {
  "use strict";

  var cfg = SP.config;

  /* ================================================================ contact */
  function initContact() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var wa = document.getElementById("contact-whatsapp");
    if (wa) {
      wa.href = "https://wa.me/" + cfg.FOUNDATION.whatsapp + "?text=" +
        encodeURIComponent("Hello " + cfg.SITE_NAME + ", I have a question.");
    }
    var hours = document.getElementById("contact-hours");
    if (hours) hours.textContent = cfg.FOUNDATION.hours;

    form.addEventListener("input", function (e) {
      if (e.target.name === "phone") e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
      SP.clearFieldError(e.target);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = SP.validateForm(form, SP.rules([
        ["name", { fn: function (v) { return SP.validators.name(v) || "Please enter your name."; } }],
        ["phone", { fn: function (v) { return SP.validators.mobile(v) || "Enter a 10-digit Indian mobile number."; } }],
        ["email", { fn: function (v) { return SP.validators.email(v) || "Enter a valid email address."; } }],
        ["message", { fn: function (v) { return (v.trim().length >= 10) || "Please write at least a line or two."; } }]
      ]));
      if (!ok) {
        SP.ui.toast("Please check the highlighted fields.", "error");
        return;
      }

      var data = {};
      ["name", "phone", "email", "subject", "message"].forEach(function (key) {
        var input = form.querySelector('[name="' + key + '"]');
        data[key] = input ? input.value.trim() : "";
      });
      data.phone = SP.digits(data.phone);

      // BACKEND-HOOK: POST /api/enquiries — sends the enquiry to the Foundation
      SP.store.saveEnquiry("contact", data);

      var success = document.getElementById("contact-success");
      if (success) {
        success.hidden = false;
        success.textContent = "Thank you, " + data.name +
          ". Your message has been recorded in this browser (demo — nothing was emailed).";
        success.focus && success.focus();
      }
      SP.ui.toast("Message sent (demo).");
      form.reset();
    });
  }

  /* ================================================================= donate */
  function initDonate() {
    var form = document.getElementById("donate-form");
    if (!form) return;

    var amount = 500;
    var customWrap = SP.qs("[data-custom-wrap]");
    var customInput = document.getElementById("don-custom");
    var submitBtn = document.getElementById("donate-submit");

    function currentAmount() {
      if (amount === "custom") return Number(customInput.value) || 0;
      return Number(amount) || 0;
    }

    function refreshLabel() {
      var value = currentAmount();
      submitBtn.textContent = value ? "Donate " + SP.fmtINR(value) : "Donate";
      submitBtn.disabled = false;
    }

    SP.qsa("[data-amount]", form).forEach(function (chip) {
      chip.addEventListener("click", function () {
        var value = chip.getAttribute("data-amount");
        amount = value === "custom" ? "custom" : Number(value);
        SP.qsa("[data-amount]", form).forEach(function (c) {
          var on = c === chip;
          c.classList.toggle("is-selected", on);
          c.setAttribute("aria-pressed", on ? "true" : "false");
        });
        if (customWrap) customWrap.hidden = value !== "custom";
        if (value === "custom" && customInput) customInput.focus();
        refreshLabel();
      });
    });

    if (customInput) customInput.addEventListener("input", refreshLabel);

    form.addEventListener("input", function (e) {
      if (e.target.name === "phone") e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
      SP.clearFieldError(e.target);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var rules = SP.rules([
        ["name", { fn: function (v) { return SP.validators.name(v) || "Please enter your name."; } }],
        ["phone", { fn: function (v) { return SP.validators.mobile(v) || "Enter a 10-digit Indian mobile number."; } }],
        ["email", { fn: function (v) { return SP.validators.email(v) || "Enter a valid email address."; } }]
      ]);
      if (amount === "custom") {
        rules.custom = {
          fn: function (v) {
            return (Number(v) >= 100) || "Enter an amount of at least INR 100.";
          }
        };
      }
      if (!SP.validateForm(form, rules)) {
        SP.ui.toast("Please check the highlighted fields.", "error");
        return;
      }

      var value = currentAmount();
      if (value < 100) {
        SP.fieldError(customInput, "Enter an amount of at least INR 100.");
        return;
      }

      var donor = {
        name: form.querySelector('[name="name"]').value.trim(),
        phone: SP.digits(form.querySelector('[name="phone"]').value),
        email: form.querySelector('[name="email"]').value.trim()
      };

      SP.ui.modal({
        title: "Secure payment (demo)",
        html:
          '<p>Donation of <strong>' + SP.fmtINR(value) + "</strong> to " + SP.esc(cfg.SITE_NAME) + ".</p>" +
          '<div class="spinner" role="status"><span class="visually-hidden">Processing</span></div>' +
          '<p class="form-note">Processing… nothing is actually charged.</p>'
      });

      // BACKEND-HOOK: POST /api/payments/donate — real payment gateway goes here
      setTimeout(function () {
        SP.store.saveDonation({ amount: value, donor: donor });
        SP.ui.closeModal();
        showThanks(value, donor);
      }, 1500);
    });

    function showThanks(value, donor) {
      var wrap = form.parentNode;
      var thanks = document.createElement("div");
      thanks.className = "thanks-state";
      thanks.setAttribute("role", "status");
      thanks.innerHTML =
        '<span class="thanks-state__icon">' +
        '<svg class="i" width="34" height="34" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.8l4.4 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        "</span>" +
        "<h2>Thank you, " + SP.esc(donor.name) + "</h2>" +
        '<p class="lead">Your donation of <strong>' + SP.fmtINR(value) + "</strong> is recorded (demo).</p>" +
        '<div class="notice notice--success">A receipt will be emailed to ' + SP.esc(donor.email) +
        " — demo text, no email is actually sent.</div>" +
        '<div class="btn-row">' +
        '<a class="btn btn--primary" href="index.html">Back home</a>' +
        '<a class="btn btn--secondary" href="shop.html">Visit the shop</a>' +
        "</div>";
      wrap.replaceChild(thanks, form);
      thanks.focus && thanks.focus();
      SP.ui.toast("Thank you for your support.");
    }

    refreshLabel();
  }

  /* ========================================================== bulk enquiry */
  function initBulk() {
    var form = document.getElementById("bulk-form");
    if (!form) return;

    var holder = SP.qs("[data-bulk-products]");
    var success = SP.qs("[data-bulk-success]");
    var preselect = SP.param("product");

    if (holder) {
      holder.innerHTML =
        '<ul class="bulk-product-list">' +
        SP.products.map(function (p) {
          var checked = preselect === p.slug;
          return (
            "<li>" +
            '<label class="check">' +
            '<input type="checkbox" name="bulk-product" value="' + SP.esc(p.slug) + '"' + (checked ? " checked" : "") + ">" +
            "<span><strong>" + SP.esc(p.name) + "</strong>" +
            '<span class="bulk-product-list__meta">' + SP.esc(p.category) + " · " +
            SP.fmtINR(SP.minPrice(p)) + " each (excl. print &amp; courier)</span></span>" +
            "</label>" +
            '<label class="field bulk-qty">' +
            '<span class="visually-hidden">Quantity for ' + SP.esc(p.name) + "</span>" +
            '<input class="input" type="number" min="1" max="10000" step="1" inputmode="numeric" ' +
            'data-qty-for="' + SP.esc(p.slug) + '" placeholder="Qty" value="' + (checked ? "10" : "") + '">' +
            "</label>" +
            "</li>"
          );
        }).join("") +
        "</ul>";
    }

    /* logo preview — local only */
    var logoInput = document.getElementById("bk-logo");
    var preview = SP.qs("[data-logo-preview]");
    if (logoInput && preview) {
      logoInput.addEventListener("change", function () {
        var file = logoInput.files && logoInput.files[0];
        if (!file) { preview.hidden = true; return; }
        var reader = new FileReader();
        reader.onload = function (ev) {
          var img = preview.querySelector("img");
          img.src = String(ev.target.result);
          preview.querySelector("[data-logo-name]").textContent = file.name + " (local preview only)";
          preview.hidden = false;
        };
        reader.readAsDataURL(file);
      });
      var remove = SP.qs("[data-logo-remove]");
      if (remove) {
        remove.addEventListener("click", function () {
          logoInput.value = "";
          preview.hidden = true;
        });
      }
    }

    form.addEventListener("input", function (e) {
      if (e.target.name === "phone") e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
      SP.clearFieldError(e.target);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = SP.validateForm(form, SP.rules([
        ["company", { fn: function (v) { return SP.validators.required(v) || "Enter your company or organisation."; } }],
        ["contact", { fn: function (v) { return SP.validators.name(v) || "Enter a contact person."; } }],
        ["phone", { fn: function (v) { return SP.validators.mobile(v) || "Enter a 10-digit Indian mobile number."; } }],
        ["email", { fn: function (v) { return SP.validators.email(v) || "Enter a valid email address."; } }]
      ]));
      if (!ok) {
        SP.ui.toast("Please check the highlighted fields.", "error");
        return;
      }

      var products = [];
      SP.qsa('input[name="bulk-product"]:checked', form).forEach(function (box) {
        var slug = box.value;
        var qtyInput = form.querySelector('[data-qty-for="' + slug + '"]');
        var qty = Number(qtyInput && qtyInput.value) || 1;
        var product = SP.getProduct(slug);
        if (product) products.push({ slug: slug, name: product.name, qty: qty });
      });

      if (!products.length) {
        SP.ui.toast("Select at least one product.", "error");
        if (holder) holder.scrollIntoView({ behavior: SP.prefersReducedMotion() ? "auto" : "smooth", block: "center" });
        return;
      }

      var record = {
        company: form.querySelector('[name="company"]').value.trim(),
        contact: form.querySelector('[name="contact"]').value.trim(),
        phone: SP.digits(form.querySelector('[name="phone"]').value),
        email: form.querySelector('[name="email"]').value.trim(),
        requiredBy: form.querySelector('[name="requiredBy"]').value,
        products: products,
        notes: form.querySelector('[name="notes"]').value.trim(),
        logoName: (logoInput.files && logoInput.files[0]) ? logoInput.files[0].name : ""
      };

      // BACKEND-HOOK: POST /api/bulk-enquiries — sends the request to the Foundation
      var saved = SP.store.saveBulkEnquiry(record);

      form.hidden = true;
      if (success) {
        success.hidden = false;
        success.innerHTML =
          '<div class="story-block">' +
          '<span class="eyebrow">Enquiry received</span>' +
          "<h2>Reference " + SP.esc(saved.ref) + "</h2>" +
          '<p class="lead">Thank you, ' + SP.esc(record.contact) + ". We will prepare a quotation for " +
          SP.esc(record.company) + ".</p>" +
          '<div class="notice notice--success">Saved in this browser (demo — nothing was emailed).</div>' +
          "<h3>Summary</h3>" +
          '<ul class="check-list muted">' +
          products.map(function (p) {
            return "<li>" + SP.esc(p.name) + " × " + p.qty + "</li>";
          }).join("") +
          (record.requiredBy ? "<li>Required by " + SP.esc(record.requiredBy) + "</li>" : "") +
          (record.logoName ? "<li>Logo file: " + SP.esc(record.logoName) + " (local only)</li>" : "") +
          "</ul>" +
          '<div class="btn-row">' +
          '<a class="btn btn--primary" href="shop.html">Back to the shop</a>' +
          '<a class="btn btn--secondary" href="contact.html">Contact us</a>' +
          "</div></div>";
        success.scrollIntoView({ behavior: SP.prefersReducedMotion() ? "auto" : "smooth", block: "center" });
      }
      SP.ui.toast("Quotation request recorded.");
    });
  }

  function init() {
    initContact();
    initDonate();
    initBulk();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SP);
