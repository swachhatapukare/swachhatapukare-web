/* store.js — localStorage-backed state: cart, orders, account, addresses, enquiries.
   Pure functions only; every read/write is wrapped in try/catch so the site
   still works when storage is unavailable (private mode, file:// restrictions). */

window.SP = window.SP || {};

(function (SP) {
  "use strict";

  var KEYS = {
    cart: "sp_cart",
    orders: "sp_orders",
    user: "sp_user",
    accounts: "sp_accounts",
    addresses: "sp_addresses",
    enquiries: "sp_enquiries",
    bulk: "sp_bulk_enquiries",
    donations: "sp_donations",
    coupon: "sp_coupon",
    banner: "sp_banner_discount",
    seq: "sp_order_seq",
    lastOrder: "sp_last_order"
  };

  /* ----------------------------------------------------------- safe access */
  function read(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  function remove(key) {
    try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  function emit(name, detail) {
    try {
      document.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
    } catch (e) { /* ignore */ }
  }

  /* ------------------------------------------------------------------ cart */
  function lineKey(id, variantId) {
    return String(id) + "::" + (variantId || "");
  }

  function getCart() {
    var cart = read(KEYS.cart, []);
    if (!Array.isArray(cart)) return [];
    return cart.filter(function (line) {
      return line && typeof line.id !== "undefined" && SP.getProductById(line.id);
    });
  }

  function saveCart(cart) {
    write(KEYS.cart, cart);
    emit("sp:cart", { cart: cart });
  }

  function addToCart(id, variantId, qty) {
    var product = SP.getProductById(id);
    if (!product) return null;
    qty = Math.max(1, parseInt(qty, 10) || 1);
    var cart = getCart();
    var key = lineKey(id, variantId);
    var existing = cart.filter(function (l) { return lineKey(l.id, l.variantId) === key; })[0];
    if (existing) existing.qty = Math.min(99, existing.qty + qty);
    else cart.push({ id: id, variantId: variantId || "", qty: qty });
    saveCart(cart);
    return { key: key, product: product };
  }

  function setQty(id, variantId, qty) {
    qty = parseInt(qty, 10) || 0;
    var cart = getCart();
    var key = lineKey(id, variantId);
    cart = cart
      .map(function (l) {
        if (lineKey(l.id, l.variantId) === key) l.qty = SP.clamp(qty, 0, 99);
        return l;
      })
      .filter(function (l) { return l.qty > 0; });
    saveCart(cart);
  }

  function removeLine(id, variantId) {
    var cart = getCart().filter(function (l) {
      return lineKey(l.id, l.variantId) !== lineKey(id, variantId);
    });
    saveCart(cart);
  }

  function clearCart() {
    saveCart([]);
    remove(KEYS.coupon);
  }

  function cartCount() {
    return getCart().reduce(function (sum, l) { return sum + l.qty; }, 0);
  }

  /* Resolved cart lines: product info + variant pricing */
  function cartLines() {
    return getCart().map(function (line) {
      var product = SP.getProductById(line.id);
      var variant = null;
      if (line.variantId && product.variants && product.variants.length) {
        variant = product.variants.filter(function (v) { return v.id === line.variantId; })[0] || null;
      }
      var unit = variant ? variant.price : product.price;
      return {
        key: lineKey(line.id, line.variantId),
        id: line.id,
        variantId: line.variantId || "",
        variantName: variant ? variant.name : "",
        qty: line.qty,
        product: product,
        name: product.name + (variant ? " — " + variant.name : ""),
        sku: product.sku,
        category: product.category,
        unit: unit,
        lineTotal: unit * line.qty,
        href: "product.html?slug=" + encodeURIComponent(product.slug)
      };
    });
  }

  /* ---------------------------------------------------------------- coupon */
  function getCoupon() {
    return read(KEYS.coupon, "") || "";
  }

  function applyCoupon(code) {
    code = String(code || "").trim().toUpperCase();
    if (!code) { remove(KEYS.coupon); emit("sp:cart", {}); return { ok: true, code: "" }; }
    var conf = SP.config.COUPONS[code];
    if (!conf) return { ok: false, message: "That coupon code is not valid." };
    write(KEYS.coupon, code);
    emit("sp:cart", {});
    return { ok: true, code: code, label: conf.label };
  }

  function removeCoupon() {
    remove(KEYS.coupon);
    emit("sp:cart", {});
  }

  /* --------------------------------------------------------------- totals */
  function totals(couponCode) {
    var lines = cartLines();
    var subtotal = lines.reduce(function (sum, l) { return sum + l.lineTotal; }, 0);

    var code = typeof couponCode === "string" ? couponCode.toUpperCase() : getCoupon();
    var conf = code ? SP.config.COUPONS[code] : null;
    var discount = 0;
    if (conf && conf.type === "percent") discount = Math.round(subtotal * conf.value) / 100;
    if (conf && conf.type === "flat") discount = Math.min(conf.value, subtotal);

    var net = Math.max(0, subtotal - discount);
    var shipping = 0;
    if (lines.length && net < SP.config.FREE_SHIPPING_ABOVE) shipping = SP.config.SHIPPING_FLAT;

    var gst = Math.round((net * SP.config.GST_PERCENT) / 100);
    var total = net + shipping + gst;

    return {
      lines: lines,
      count: lines.reduce(function (sum, l) { return sum + l.qty; }, 0),
      subtotal: subtotal,
      discount: discount,
      coupon: conf ? code : "",
      couponLabel: conf ? conf.label : "",
      shipping: shipping,
      gst: gst,
      gstPercent: SP.config.GST_PERCENT,
      total: total,
      freeShippingThreshold: SP.config.FREE_SHIPPING_ABOVE,
      freeShippingGap: Math.max(0, SP.config.FREE_SHIPPING_ABOVE - net),
      freeShippingProgress: SP.clamp(net / SP.config.FREE_SHIPPING_ABOVE, 0, 1),
      isFreeShipping: lines.length > 0 && net >= SP.config.FREE_SHIPPING_ABOVE
    };
  }

  /* --------------------------------------------------------------- orders */
  function nextOrderId() {
    var now = new Date();
    var stamp = String(now.getFullYear()) + SP.pad(now.getMonth() + 1) + SP.pad(now.getDate());
    var seq = (read(KEYS.seq, 0) || 0) + 1;
    write(KEYS.seq, seq);
    var suffix = SP.pad(seq % 10000, 4);
    return "SP-" + stamp + "-" + suffix;
  }

  function getOrders() {
    var orders = read(KEYS.orders, []);
    return Array.isArray(orders) ? orders : [];
  }

  function getOrder(id) {
    return getOrders().filter(function (o) { return o.id === id; })[0] || null;
  }

  /* BACKEND-HOOK: POST /api/orders — this becomes a server call that also
     reserves stock, emails the customer and triggers fulfilment. */
  function placeOrder(payload) {
    var t = totals(payload.coupon || undefined);
    if (!t.lines.length) return null;

    var now = new Date();
    var etaMin = new Date(now.getTime());
    etaMin.setDate(etaMin.getDate() + SP.config.DELIVERY_DAYS_MIN);
    var etaMax = new Date(now.getTime());
    etaMax.setDate(etaMax.getDate() + SP.config.DELIVERY_DAYS_MAX);

    var order = {
      id: nextOrderId(),
      placedAt: now.toISOString(),
      etaFrom: etaMin.toISOString(),
      etaTo: etaMax.toISOString(),
      items: t.lines.map(function (l) {
        return {
          id: l.id,
          sku: l.sku,
          name: l.name,
          category: l.category,
          slug: l.product.slug,
          qty: l.qty,
          unit: l.unit,
          lineTotal: l.lineTotal,
          variantId: l.variantId
        };
      }),
      subtotal: t.subtotal,
      discount: t.discount,
      coupon: t.coupon,
      shipping: t.shipping,
      gst: t.gst,
      gstPercent: t.gstPercent,
      total: t.total,
      payment: {
        method: payload.method,
        status: payload.method === "cod" ? "due_on_delivery" : "paid"
      },
      customer: payload.customer,
      address: payload.address,
      userId: payload.userId || null
    };

    var orders = getOrders();
    orders.unshift(order);
    write(KEYS.orders, orders);
    write(KEYS.lastOrder, order.id);
    clearCart();
    return order;
  }

  function lastOrderId() {
    return read(KEYS.lastOrder, "") || "";
  }

  /* Tracking timeline derived from the order date so it always looks live */
  function tracking(order) {
    if (!order) return [];
    var base = new Date(order.placedAt).getTime();
    return SP.config.TRACK_TIMELINE.map(function (step) {
      var at = new Date(base + step.afterHours * 3600 * 1000);
      return {
        key: step.key,
        label: step.label,
        at: at.toISOString(),
        done: at.getTime() <= Date.now()
      };
    });
  }

  /* ----------------------------------------------------------------- user */
  function getUser() {
    return read(KEYS.user, null);
  }

  function getAccounts() {
    var list = read(KEYS.accounts, []);
    return Array.isArray(list) ? list : [];
  }

  function registerWithEmail(name, email, password) {
    email = String(email || "").trim().toLowerCase();
    name = String(name || "").trim();
    password = String(password || "");
    if (!email) return { ok: false, message: "Email is required." };
    if (password.length < 6) return { ok: false, message: "Password must be at least 6 characters." };

    var accounts = getAccounts();
    var existing = accounts.filter(function (a) { return (a.email || "").toLowerCase() === email; })[0];
    if (existing) {
      return { ok: false, message: "An account with this email already exists. Please log in." };
    }

    var newAccount = {
      id: SP.uid("acc"),
      name: name || "Friend",
      email: email,
      password: password,
      since: new Date().toISOString()
    };
    accounts.push(newAccount);
    write(KEYS.accounts, accounts);

    var user = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      since: newAccount.since
    };
    saveUser(user);
    return { ok: true, user: user };
  }

  function loginWithEmail(email, password) {
    email = String(email || "").trim().toLowerCase();
    password = String(password || "");
    if (!email) return { ok: false, message: "Please enter your email." };
    if (!password) return { ok: false, message: "Please enter your password." };

    var accounts = getAccounts();
    var found = accounts.filter(function (a) { return (a.email || "").toLowerCase() === email; })[0];
    if (found) {
      if (found.password && found.password !== password) {
        return { ok: false, message: "Incorrect password. Please try again." };
      }
      var user = {
        id: found.id,
        name: found.name,
        email: found.email,
        phone: found.phone || "",
        since: found.since
      };
      saveUser(user);
      return { ok: true, user: user };
    }

    var newAcc = {
      id: SP.uid("acc"),
      name: email.split("@")[0] || "Friend",
      email: email,
      password: password,
      since: new Date().toISOString()
    };
    accounts.push(newAcc);
    write(KEYS.accounts, accounts);
    var newUser = {
      id: newAcc.id,
      name: newAcc.name,
      email: newAcc.email,
      since: newAcc.since
    };
    saveUser(newUser);
    return { ok: true, user: newUser };
  }

  /* BACKEND-HOOK: POST /api/auth/otp — server sends and verifies the OTP. */
  function verifyOtp(phone, otp) {
    return String(otp).trim() === SP.config.OTP_CODE && /^[6-9]\d{9}$/.test(SP.digits(phone));
  }

  function saveUser(user) {
    write(KEYS.user, user);
    emit("sp:user", { user: user });
    return user;
  }

  function login(phone, otp, name, email) {
    if (!verifyOtp(phone, otp)) return { ok: false, message: "That OTP is not correct." };
    var user = getUser() || {};
    user.phone = SP.digits(phone);
    user.name = String(name || user.name || "").trim();
    user.email = String(email || user.email || "").trim();
    user.since = user.since || new Date().toISOString();
    saveUser(user);
    return { ok: true, user: user };
  }

  function logout() {
    remove(KEYS.user);
    emit("sp:user", { user: null });
  }

  /* ------------------------------------------------------------ addresses */
  function getAddresses() {
    var list = read(KEYS.addresses, []);
    return Array.isArray(list) ? list : [];
  }

  function saveAddress(addr) {
    var list = getAddresses();
    if (addr.id) {
      list = list.map(function (a) { return a.id === addr.id ? Object.assign(a, addr) : a; });
    } else {
      addr.id = SP.uid("addr");
      list.push(addr);
    }
    if (addr.isDefault) {
      list = list.map(function (a) {
        a.isDefault = a.id === addr.id;
        return a;
      });
    }
    if (!list.filter(function (a) { return a.isDefault; }).length) list[0].isDefault = true;
    write(KEYS.addresses, list);
    return list;
  }

  function deleteAddress(id) {
    var list = getAddresses().filter(function (a) { return a.id !== id; });
    if (list.length && !list.filter(function (a) { return a.isDefault; }).length) {
      list[0].isDefault = true;
    }
    write(KEYS.addresses, list);
    return list;
  }

  function defaultAddress() {
    var list = getAddresses();
    if (!list.length) return null;
    return list.filter(function (a) { return a.isDefault; })[0] || list[0];
  }

  /* ---------------------------------------------------- enquiries (BACKEND-HOOK: POST /api/enquiries) */
  function saveEnquiry(kind, data) {
    var list = read(KEYS.enquiries, []);
    if (!Array.isArray(list)) list = [];
    list.unshift({
      id: SP.uid("enq"),
      kind: kind,
      at: new Date().toISOString(),
      data: data
    });
    write(KEYS.enquiries, list);
    return list[0];
  }

  function saveBulkEnquiry(data) {
    var list = read(KEYS.bulk, []);
    if (!Array.isArray(list)) list = [];
    var ref = "SPB-" +
      String(new Date().getFullYear()) +
      SP.pad(new Date().getMonth() + 1) +
      SP.pad(new Date().getDate()) + "-" +
      SP.pad((list.length + 1) % 10000, 4);
    var record = { ref: ref, at: new Date().toISOString(), data: data };
    list.unshift(record);
    write(KEYS.bulk, list);
    return record;
  }

  function saveDonation(data) {
    var list = read(KEYS.donations, []);
    if (!Array.isArray(list)) list = [];
    var record = Object.assign({ id: SP.uid("don"), at: new Date().toISOString() }, data);
    list.unshift(record);
    write(KEYS.donations, list);
    return record;
  }

  function ordersForUser(user) {
    if (!user) return [];
    return getOrders().filter(function (o) {
      return (o.customer && SP.digits(o.customer.phone) === SP.digits(user.phone)) ||
        (user.email && o.customer && o.customer.email === user.email);
    });
  }

  /* ---------------------------------------------------------------- export */
  SP.store = {
    KEYS: KEYS,
    getCart: getCart,
    addToCart: addToCart,
    setQty: setQty,
    removeLine: removeLine,
    clearCart: clearCart,
    cartCount: cartCount,
    cartLines: cartLines,
    getCoupon: getCoupon,
    applyCoupon: applyCoupon,
    removeCoupon: removeCoupon,
    totals: totals,
    getOrders: getOrders,
    getOrder: getOrder,
    placeOrder: placeOrder,
    lastOrderId: lastOrderId,
    tracking: tracking,
    getUser: getUser,
    saveUser: saveUser,
    getAccounts: getAccounts,
    registerWithEmail: registerWithEmail,
    loginWithEmail: loginWithEmail,
    login: login,
    verifyOtp: verifyOtp,
    logout: logout,
    getAddresses: getAddresses,
    saveAddress: saveAddress,
    deleteAddress: deleteAddress,
    defaultAddress: defaultAddress,
    saveEnquiry: saveEnquiry,
    saveBulkEnquiry: saveBulkEnquiry,
    saveDonation: saveDonation,
    ordersForUser: ordersForUser
  };
})(window.SP);
