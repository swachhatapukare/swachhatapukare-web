/* utils.js — tiny shared helpers (no dependencies) */

window.SP = window.SP || {};

(function (SP) {
  "use strict";

  /* ------------------------------------------------------------- selectors */
  SP.qs = function (sel, root) {
    return (root || document).querySelector(sel);
  };

  SP.qsa = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  SP.onReady = function (fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  };

  /* ------------------------------------------------------------------ misc */
  SP.esc = function (value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  SP.debounce = function (fn, wait) {
    var t = null;
    return function () {
      var args = arguments;
      var self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, wait || 180);
    };
  };

  SP.clamp = function (n, min, max) {
    return Math.min(Math.max(n, min), max);
  };

  SP.pad = function (n, len) {
    var s = String(n);
    while (s.length < (len || 2)) s = "0" + s;
    return s;
  };

  SP.sleep = function (ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  };

  SP.uid = function (prefix) {
    return (prefix || "id") + "-" + Date.now().toString(36) + "-" +
      Math.random().toString(36).slice(2, 7);
  };

  SP.prefersReducedMotion = function () {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  SP.isDesktop = function () {
    return window.matchMedia && window.matchMedia("(min-width: 1024px)").matches;
  };

  /* ----------------------------------------------------------------- money */
  var inrFormatter = null;
  SP.fmtINR = function (amount) {
    var n = Number(amount) || 0;
    try {
      if (!inrFormatter) {
        inrFormatter = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
          minimumFractionDigits: 0
        });
      }
      return inrFormatter.format(n);
    } catch (e) {
      return "INR " + Math.round(n);
    }
  };

  /* Plain "INR 180" form used in running text */
  SP.fmtINRText = function (amount) {
    return "INR " + (Math.round(Number(amount) || 0));
  };

  /* ----------------------------------------------------------------- dates */
  SP.fmtDate = function (iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    try {
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch (e) {
      return d.toDateString();
    }
  };

  SP.fmtDateTime = function (iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    try {
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) +
        ", " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return d.toString();
    }
  };

  SP.fmtDayTime = function (iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    try {
      return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) +
        " · " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return d.toString();
    }
  };

  /* ------------------------------------------------------------ URL params */
  SP.getParams = function () {
    var out = {};
    try {
      var usp = new URLSearchParams(window.location.search);
      usp.forEach(function (value, key) {
        if (out[key] === undefined) out[key] = value;
        else if (Array.isArray(out[key])) out[key].push(value);
        else out[key] = [out[key], value];
      });
    } catch (e) { /* ignore */ }
    return out;
  };

  SP.param = function (key) {
    var p = SP.getParams();
    var v = p[key];
    return Array.isArray(v) ? v[0] : v;
  };

  /* history.replaceState wrapped safely (file:// can throw) */
  SP.setParams = function (updates, replace) {
    try {
      var usp = new URLSearchParams(window.location.search);
      Object.keys(updates).forEach(function (key) {
        var value = updates[key];
        if (value === "" || value === null || value === undefined) usp.delete(key);
        else if (Array.isArray(value)) {
          usp.delete(key);
          value.forEach(function (v) { if (v !== "" && v != null) usp.append(key, v); });
        } else usp.set(key, value);
      });
      var query = usp.toString();
      var url = window.location.pathname + (query ? "?" + query : "") + window.location.hash;
      if (replace === false) window.history.pushState({}, "", url);
      else window.history.replaceState({}, "", url);
    } catch (e) {
      /* file:// or restricted history — filters still work for this session */
    }
  };

  /* ------------------------------------------------------------ validators */
  SP.validators = {
    required: function (v) { return String(v || "").trim().length > 0; },
    name: function (v) { return String(v || "").trim().length >= 2; },
    mobile: function (v) { return /^[6-9]\d{9}$/.test(String(v || "").replace(/\D/g, "").slice(-10)) ||
      /^[6-9]\d{9}$/.test(String(v || "").replace(/\D/g, "")); },
    email: function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim());
    },
    pincode: function (v) { return /^\d{6}$/.test(String(v || "").replace(/\D/g, "")); },
    otp: function (v) { return /^\d{6}$/.test(String(v || "").trim()); }
  };

  /* Normalise an Indian mobile to 10 digits */
  SP.digits = function (v) {
    var d = String(v || "").replace(/\D/g, "");
    if (d.length > 10 && d.slice(0, 2) === "91") d = d.slice(-10);
    return d.slice(-10);
  };

  /* --------------------------------------------------------- form utilities */
  SP.fieldError = function (input, message) {
    var field = input.closest(".field");
    if (!field) return;
    field.classList.add("field--error");
    var err = field.querySelector(".field__error");
    if (err) err.textContent = message || "";
    input.setAttribute("aria-invalid", "true");
  };

  SP.clearFieldError = function (input) {
    var field = input.closest(".field");
    if (!field) return;
    field.classList.remove("field--error");
    var err = field.querySelector(".field__error");
    if (err) err.textContent = "";
    input.removeAttribute("aria-invalid");
  };

  SP.validateForm = function (form, rules) {
    var ok = true;
    var firstBad = null;
    Object.keys(rules).forEach(function (name) {
      var input = form.querySelector('[name="' + name + '"]');
      if (!input) return;
      var rule = rules[name];
      var result = rule.fn(input.value, input);
      SP.clearFieldError(input);
      if (result !== true) {
        ok = false;
        if (!firstBad) firstBad = input;
        SP.fieldError(input, result || "Please check this field.");
      }
    });
    if (firstBad) firstBad.focus();
    return ok;
  };

  SP.rules = function (list) {
    var map = {};
    list.forEach(function (item) { map[item[0]] = item[1]; });
    return map;
  };

  /* Focus trap used by modal + drawers.
     Returns an "untrap" function. */
  SP.trapFocus = function (container) {
    function selector(el) {
      return el && el.offsetWidth + el.offsetHeight + el.getBoundingClientRect().top > 0 &&
        ["hidden", "collapse"].indexOf(el.style.visibility) === -1;
    }
    function focusables() {
      return SP.qsa(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        container
      ).filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
    }
    function onKey(e) {
      if (e.key !== "Tab") return;
      var items = focusables();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey, true);
    return function () { document.removeEventListener("keydown", onKey, true); };
  };

  /* Simple delegated action router: data-action="name" data-* payload */
  SP.onAction = function (root, name, handler) {
    (root || document).addEventListener("click", function (e) {
      var el = e.target.closest ? e.target.closest('[data-action="' + name + '"]') : null;
      if (el) handler(e, el);
    });
  };
})(window.SP);
