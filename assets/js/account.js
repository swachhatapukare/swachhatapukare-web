/* account.js — login / signup with mock OTP, profile, address book, order history */

(function (SP) {
  "use strict";

  var cfg = SP.config;
  var root;
  var authMode = "login";

  /* ------------------------------------------------------------ auth view */
  function authMarkup() {
    var isLogin = authMode === "login";
    return (
      '<div class="auth-box">' +
      '<div class="tabs" role="tablist" aria-label="Account access">' +
      '<button class="tab' + (isLogin ? " is-active" : "") + '" type="button" role="tab" id="tab-login" ' +
      'aria-selected="' + isLogin + '" aria-controls="panel-auth" data-auth-tab="login">Log in</button>' +
      '<button class="tab' + (!isLogin ? " is-active" : "") + '" type="button" role="tab" id="tab-signup" ' +
      'aria-selected="' + !isLogin + '" aria-controls="panel-auth" data-auth-tab="signup">Sign up</button>' +
      "</div>" +

      '<form id="auth-form" novalidate>' +
      '<div class="notice notice--info">Mobile-OTP login is mocked for this demo — the code <strong>' +
      cfg.OTP_DEMO + "</strong> is always accepted.</div>" +

      (isLogin ? "" :
        '<div class="field">' +
        '<label class="field__label" for="auth-name">Full name</label>' +
        '<input class="input" id="auth-name" name="name" type="text" autocomplete="name">' +
        '<span class="field__error" aria-live="polite"></span>' +
        "</div>") +

      '<div class="field">' +
      '<label class="field__label" for="auth-phone">Mobile number</label>' +
      '<input class="input" id="auth-phone" name="phone" type="tel" inputmode="numeric" maxlength="10" autocomplete="tel" placeholder="10-digit mobile">' +
      '<span class="field__error" aria-live="polite"></span>' +
      "</div>" +

      (isLogin ? "" :
        '<div class="field">' +
        '<label class="field__label" for="auth-email">Email</label>' +
        '<input class="input" id="auth-email" name="email" type="email" autocomplete="email">' +
        '<span class="field__error" aria-live="polite"></span>' +
        "</div>") +

      '<div class="field">' +
      '<label class="field__label" for="auth-otp">OTP</label>' +
      '<input class="input" id="auth-otp" name="otp" type="text" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="6-digit code">' +
      '<span class="field__hint">Demo OTP: <strong>' + cfg.OTP_DEMO + "</strong> — there is no real SMS.</span>" +
      '<span class="field__error" aria-live="polite"></span>' +
      "</div>" +

      '<button class="btn btn--primary btn--block btn--lg" type="submit">' +
      (isLogin ? "Log in" : "Create account") + "</button>" +
      '<p class="form-note">BACKEND-HOOK: an API would send the OTP by SMS and verify it server-side.</p>' +
      "</form></div>"
    );
  }

  /* ---------------------------------------------------------- member view */
  function profileMarkup(user) {
    return (
      '<form class="stack" id="profile-form" novalidate>' +
      '<div class="form-grid form-grid--2">' +
      '<div class="field">' +
      '<label class="field__label" for="prof-name">Full name</label>' +
      '<input class="input" id="prof-name" name="name" type="text" value="' + SP.esc(user.name || "") + '">' +
      '<span class="field__error" aria-live="polite"></span></div>' +
      '<div class="field">' +
      '<label class="field__label" for="prof-phone">Mobile</label>' +
      '<input class="input" id="prof-phone" type="text" value="' + SP.esc(user.phone || "") + '" readonly>' +
      '<span class="field__hint">The mobile used to log in cannot be changed here.</span></div>' +
      '<div class="field field--full">' +
      '<label class="field__label" for="prof-email">Email</label>' +
      '<input class="input" id="prof-email" name="email" type="email" value="' + SP.esc(user.email || "") + '">' +
      '<span class="field__error" aria-live="polite"></span></div>' +
      "</div>" +
      '<div class="btn-row"><button class="btn btn--primary" type="submit">Save profile</button></div>' +
      "</form>"
    );
  }

  function addressMarkup(addr) {
    return (
      '<article class="address-card' + (addr.isDefault ? " is-default" : "") + '">' +
      '<div class="address-card__head">' +
      '<span class="address-card__name">' + SP.esc(addr.label || "Address") +
      (addr.isDefault ? ' <span class="badge badge--hyacinth">Default</span>' : "") + "</span>" +
      '<span class="address-card__actions">' +
      '<button class="link-btn" type="button" data-addr-edit="' + SP.esc(addr.id) + '">Edit</button>' +
      '<button class="link-btn link-btn--danger" type="button" data-addr-delete="' + SP.esc(addr.id) + '">Delete</button>' +
      "</span></div>" +
      "<address>" +
      SP.esc(addr.name) + "<br>" + SP.esc(addr.line) + "<br>" +
      SP.esc(addr.city) + ", " + SP.esc(addr.state) + " — " + SP.esc(addr.pincode) + "<br>" +
      SP.esc(addr.phone) +
      "</address></article>"
    );
  }

  function addressFormMarkup(addr) {
    addr = addr || {};
    return (
      '<form class="address-form" id="address-form" novalidate data-addr-id="' + SP.esc(addr.id || "") + '">' +
      '<div class="form-grid form-grid--2">' +
      '<div class="field"><label class="field__label" for="ad-label">Label</label>' +
      '<input class="input" id="ad-label" name="label" type="text" placeholder="Home, Office…" value="' + SP.esc(addr.label || "") + '">' +
      '<span class="field__error" aria-live="polite"></span></div>' +
      '<div class="field"><label class="field__label" for="ad-name">Full name</label>' +
      '<input class="input" id="ad-name" name="name" type="text" value="' + SP.esc(addr.name || "") + '">' +
      '<span class="field__error" aria-live="polite"></span></div>' +
      '<div class="field"><label class="field__label" for="ad-phone">Mobile</label>' +
      '<input class="input" id="ad-phone" name="phone" type="tel" inputmode="numeric" maxlength="10" value="' + SP.esc(addr.phone || "") + '">' +
      '<span class="field__error" aria-live="polite"></span></div>' +
      '<div class="field"><label class="field__label" for="ad-pincode">Pincode</label>' +
      '<input class="input" id="ad-pincode" name="pincode" type="text" inputmode="numeric" maxlength="6" value="' + SP.esc(addr.pincode || "") + '">' +
      '<span class="field__error" aria-live="polite"></span></div>' +
      '<div class="field field--full"><label class="field__label" for="ad-line">Address</label>' +
      '<textarea class="textarea" id="ad-line" name="line" rows="2">' + SP.esc(addr.line || "") + "</textarea>" +
      '<span class="field__error" aria-live="polite"></span></div>' +
      '<div class="field"><label class="field__label" for="ad-city">City</label>' +
      '<input class="input" id="ad-city" name="city" type="text" value="' + SP.esc(addr.city || "") + '">' +
      '<span class="field__error" aria-live="polite"></span></div>' +
      '<div class="field"><label class="field__label" for="ad-state">State</label>' +
      '<input class="input" id="ad-state" name="state" type="text" value="' + SP.esc(addr.state || "") + '">' +
      '<span class="field__error" aria-live="polite"></span></div>' +
      '<div class="field field--full"><label class="check">' +
      '<input type="checkbox" name="isDefault"' + (addr.isDefault ? " checked" : "") + "> Set as default address</label></div>" +
      "</div>" +
      '<div class="btn-row">' +
      '<button class="btn btn--primary" type="submit">Save address</button>' +
      '<button class="btn btn--ghost" type="button" id="addr-cancel">Cancel</button>' +
      "</div></form>"
    );
  }

  function ordersMarkup(list) {
    if (!list.length) {
      return (
        '<div class="empty-state empty-state--sm">' +
        "<h3>No orders yet</h3>" +
        '<p class="muted">Orders you place in this browser will show up here.</p>' +
        '<a class="btn btn--primary" href="shop.html">Start shopping</a>' +
        "</div>"
      );
    }
    return '<div class="order-list">' + list.map(function (order) {
      return (
        '<article class="order-card">' +
        '<div class="order-card__head">' +
        '<span class="order-card__id">' + SP.esc(order.id) + "</span>" +
        '<span class="order-card__meta">' + SP.fmtDate(order.placedAt) + " · " + SP.fmtINR(order.total) + "</span>" +
        "</div>" +
        '<p class="order-card__items">' +
        order.items.map(function (i) { return SP.esc(i.name) + " ×" + i.qty; }).join(", ") + "</p>" +
        '<div class="order-card__actions">' +
        '<a class="btn btn--secondary btn--sm" href="track.html?id=' + encodeURIComponent(order.id) +
        "&phone=" + encodeURIComponent(order.customer.phone) + '">Track</a>' +
        '<a class="btn btn--ghost btn--sm" href="invoice.html?id=' + encodeURIComponent(order.id) + '">Invoice</a>' +
        '<a class="btn btn--ghost btn--sm" href="order-confirmation.html?id=' + encodeURIComponent(order.id) + '">Details</a>' +
        "</div></article>"
      );
    }).join("") + "</div>";
  }

  function memberMarkup(user, tab) {
    tab = tab || "profile";
    var addresses = SP.store.getAddresses();
    var orders = SP.store.ordersForUser(user);

    var panels = {
      profile:
        '<section class="tab-panel" id="panel-profile" role="tabpanel" aria-labelledby="tab-profile"' + (tab === "profile" ? "" : " hidden") + ">" +
        "<h2>Profile</h2>" + profileMarkup(user) + "</section>",

      addresses:
        '<section class="tab-panel" id="panel-addresses" role="tabpanel" aria-labelledby="tab-addresses"' + (tab === "addresses" ? "" : " hidden") + ">" +
        '<div class="section-head"><div class="section-head__text"><h2>Saved addresses</h2>' +
        '<p class="section-head__sub">Stored in this browser only (demo).</p></div>' +
        '<button class="btn btn--secondary btn--sm" type="button" id="addr-add">Add address</button></div>' +
        '<div data-addr-form hidden></div>' +
        (addresses.length
          ? '<div class="address-grid">' + addresses.map(addressMarkup).join("") + "</div>"
          : '<div class="empty-state empty-state--sm"><h3>No saved addresses</h3><p class="muted">Add one to speed through checkout.</p></div>') +
        "</section>",

      orders:
        '<section class="tab-panel" id="panel-orders" role="tabpanel" aria-labelledby="tab-orders"' + (tab === "orders" ? "" : " hidden") + ">" +
        "<h2>Order history</h2>" +
        '<p class="form-note">Orders are matched to the mobile number you logged in with.</p>' +
        ordersMarkup(orders) +
        "</section>"
    };

    return (
      '<div class="account-head">' +
      '<div>' +
      '<p class="eyebrow">Logged in</p>' +
      "<h2>" + SP.esc(user.name || "Friend") + "</h2>" +
      '<p class="muted">' + SP.esc(user.phone) + (user.email ? " · " + SP.esc(user.email) : "") + "</p>" +
      "</div>" +
      '<button class="btn btn--ghost btn--sm" type="button" id="logout-btn">Log out</button>' +
      "</div>" +

      '<div class="tabs" role="tablist" aria-label="Account sections">' +
      ['<button class="tab' + (tab === "profile" ? " is-active" : "") + '" role="tab" type="button" id="tab-profile" aria-selected="' + (tab === "profile") + '" aria-controls="panel-profile" data-member-tab="profile">Profile</button>',
        '<button class="tab' + (tab === "addresses" ? " is-active" : "") + '" role="tab" type="button" id="tab-addresses" aria-selected="' + (tab === "addresses") + '" aria-controls="panel-addresses" data-member-tab="addresses">Addresses (' + addresses.length + ")</button>",
        '<button class="tab' + (tab === "orders" ? " is-active" : "") + '" role="tab" type="button" id="tab-orders" aria-selected="' + (tab === "orders") + '" aria-controls="panel-orders" data-member-tab="orders">Orders (' + orders.length + ")</button>"
      ].join("") +
      "</div>" +
      panels.profile + panels.addresses + panels.orders
    );
  }

  /* -------------------------------------------------------------- actions */
  function render(tab) {
    var user = SP.store.getUser();
    root.innerHTML = user ? memberMarkup(user, tab) : authMarkup();
    bind(tab);
  }

  function addressRules() {
    return SP.rules([
      ["label", { fn: function (v) { return SP.validators.required(v) || "Give this address a label."; } }],
      ["name", { fn: function (v) { return SP.validators.name(v) || "Enter the recipient's name."; } }],
      ["phone", { fn: function (v) { return SP.validators.mobile(v) || "Enter a 10-digit mobile number."; } }],
      ["line", { fn: function (v) { return SP.validators.required(v) || "Enter the address."; } }],
      ["city", { fn: function (v) { return SP.validators.required(v) || "Enter the city."; } }],
      ["state", { fn: function (v) { return SP.validators.required(v) || "Enter the state."; } }],
      ["pincode", { fn: function (v) { return SP.validators.pincode(v) || "Enter a 6-digit pincode."; } }]
    ]);
  }

  function openAddressForm(addr) {
    var holder = SP.qs("[data-addr-form]");
    if (!holder) return;
    holder.hidden = false;
    holder.innerHTML = addressFormMarkup(addr);
    var form = document.getElementById("address-form");
    var cancel = document.getElementById("addr-cancel");
    if (cancel) cancel.addEventListener("click", function () { holder.hidden = true; holder.innerHTML = ""; });
    form.addEventListener("input", function (e) { SP.clearFieldError(e.target); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!SP.validateForm(form, addressRules())) return;
      var data = {};
      ["label", "name", "phone", "line", "city", "state", "pincode"].forEach(function (k) {
        data[k] = form.querySelector('[name="' + k + '"]').value.trim();
      });
      data.phone = SP.digits(data.phone);
      data.isDefault = form.querySelector('[name="isDefault"]').checked;
      var id = form.getAttribute("data-addr-id");
      if (id) data.id = id;
      SP.store.saveAddress(data);
      SP.ui.toast("Address saved.");
      render("addresses");
    });
    var first = form.querySelector("input");
    if (first) first.focus();
  }

  function bind(tab) {
    /* auth */
    SP.qsa("[data-auth-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        authMode = btn.getAttribute("data-auth-tab");
        render();
      });
    });

    var authForm = document.getElementById("auth-form");
    if (authForm) {
      authForm.addEventListener("input", function (e) {
        if (e.target.name === "phone") e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
        if (e.target.name === "otp") e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
        SP.clearFieldError(e.target);
      });
      authForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var isLogin = authMode === "login";
        var rules = SP.rules([
          ["phone", { fn: function (v) { return SP.validators.mobile(v) || "Enter a 10-digit Indian mobile number."; } }],
          ["otp", { fn: function (v) { return SP.validators.otp(v) || "Enter the 6-digit OTP."; } }]
        ]);
        if (!isLogin) {
          rules.name = { fn: function (v) { return SP.validators.name(v) || "Enter your name."; } };
          rules.email = { fn: function (v) { return SP.validators.email(v) || "Enter a valid email."; } };
        }
        if (!SP.validateForm(authForm, rules)) return;

        var phone = authForm.querySelector('[name="phone"]').value;
        var otp = authForm.querySelector('[name="otp"]').value;
        var nameInput = authForm.querySelector('[name="name"]');
        var emailInput = authForm.querySelector('[name="email"]');
        // BACKEND-HOOK: POST /api/auth/verify-otp
        var result = SP.store.login(phone, otp,
          nameInput ? nameInput.value : "",
          emailInput ? emailInput.value : "");
        if (!result.ok) {
          SP.ui.toast(result.message, "error");
          SP.fieldError(authForm.querySelector('[name="otp"]'), result.message);
          return;
        }
        SP.ui.toast("Logged in.");
        render("profile");
      });
    }

    /* logout */
    var logout = document.getElementById("logout-btn");
    if (logout) {
      logout.addEventListener("click", function () {
        SP.store.logout();
        SP.ui.toast("Logged out.");
        render();
      });
    }

    /* member tabs */
    SP.qsa("[data-member-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        render(btn.getAttribute("data-member-tab"));
      });
    });

    /* profile */
    var profileForm = document.getElementById("profile-form");
    if (profileForm) {
      profileForm.addEventListener("input", function (e) { SP.clearFieldError(e.target); });
      profileForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var ok = SP.validateForm(profileForm, SP.rules([
          ["name", { fn: function (v) { return SP.validators.name(v) || "Enter your name."; } }],
          ["email", { fn: function (v) { return SP.validators.email(v) || "Enter a valid email."; } }]
        ]));
        if (!ok) return;
        var user = SP.store.getUser() || {};
        user.name = profileForm.querySelector('[name="name"]').value.trim();
        user.email = profileForm.querySelector('[name="email"]').value.trim();
        SP.store.saveUser(user);
        SP.ui.toast("Profile saved.");
        render("profile");
      });
    }

    /* addresses */
    var addBtn = document.getElementById("addr-add");
    if (addBtn) addBtn.addEventListener("click", function () { openAddressForm(null); });

    SP.qsa("[data-addr-edit]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-addr-edit");
        var addr = SP.store.getAddresses().filter(function (a) { return a.id === id; })[0];
        if (addr) openAddressForm(addr);
      });
    });

    SP.qsa("[data-addr-delete]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        SP.store.deleteAddress(btn.getAttribute("data-addr-delete"));
        SP.ui.toast("Address removed.");
        render("addresses");
      });
    });
  }

  function init() {
    root = SP.qs("[data-account-root]");
    if (!root) return;
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SP);
