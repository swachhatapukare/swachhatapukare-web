/* shop.js — catalogue grid: live search, filters, sort, URL sync */

(function (SP) {
  "use strict";

  var state = {
    q: "",
    cats: [],
    tag: "",
    min: "",
    max: "",
    sort: "featured"
  };

  var grid, emptyEl, countEl, activeEl, searchInput, sortSelect, filtersEl;
  var priceMinInput, priceMaxInput, priceFill, priceMinLabel, priceMaxLabel;
  var priceMinBoundEl, priceMaxBoundEl;
  var priceBounds = { min: 0, max: 1000, step: 10 };

  function slugToName(slug) {
    var found = SP.config.CATEGORIES.filter(function (c) { return c.slug === slug; })[0];
    return found ? found.name : "";
  }

  function nameToSlug(name) {
    return SP.config.categorySlug(name);
  }

  /* ------------------------------------------------------------ URL state */
  function readUrl() {
    var p = SP.getParams();
    state.q = String(p.q || "");
    state.tag = String(p.tag || "");
    state.min = String(p.min || "");
    state.max = String(p.max || "");
    state.sort = String(p.sort || "featured");

    var cat = p.cat || "";
    var cats = Array.isArray(cat) ? cat : String(cat).split(",");
    state.cats = [];
    cats.forEach(function (value) {
      String(value).split(",").forEach(function (slug) {
        slug = slug.trim();
        if (!slug) return;
        if (slugToName(slug)) state.cats.push(slug);
        else if (slug === "water-hyacinth") state.tag = "water-hyacinth";
      });
    });
  }

  function writeUrl() {
    SP.setParams({
      q: state.q,
      cat: state.cats.join(","),
      tag: state.tag,
      min: state.min,
      max: state.max,
      sort: state.sort === "featured" ? "" : state.sort
    });
  }

  /* ---------------------------------------------------------- price range */
  function computePriceBounds() {
    var prices = SP.products.map(SP.minPrice).filter(function (n) { return isFinite(n); });
    if (!prices.length) return { min: 0, max: 1000, step: 10 };
    var lo = Math.min.apply(null, prices);
    var hi = Math.max.apply(null, prices);
    var min = Math.floor(lo / 100) * 100;
    var max = Math.ceil(hi / 100) * 100;
    if (max <= min) max = min + 100;
    return { min: min, max: max, step: 10 };
  }

  function priceFromState() {
    var step = priceBounds.step;
    var min = state.min === "" ? priceBounds.min : Number(state.min);
    var max = state.max === "" ? priceBounds.max : Number(state.max);
    if (!isFinite(min)) min = priceBounds.min;
    if (!isFinite(max)) max = priceBounds.max;
    min = SP.clamp(Math.round(min / step) * step, priceBounds.min, priceBounds.max);
    max = SP.clamp(Math.round(max / step) * step, priceBounds.min, priceBounds.max);
    if (min > max) min = max;
    return { min: min, max: max };
  }

  function normalizePriceState() {
    var price = priceFromState();
    state.min = price.min <= priceBounds.min ? "" : String(price.min);
    state.max = price.max >= priceBounds.max ? "" : String(price.max);
  }

  function updatePriceUI(min, max) {
    var spread = priceBounds.max - priceBounds.min || 1;
    priceFill.style.left = ((min - priceBounds.min) / spread) * 100 + "%";
    priceFill.style.right = ((priceBounds.max - max) / spread) * 100 + "%";
    priceMinLabel.textContent = SP.fmtINR(min);
    priceMaxLabel.textContent = SP.fmtINR(max);
    priceMinInput.setAttribute("aria-valuetext", SP.fmtINR(min));
    priceMaxInput.setAttribute("aria-valuetext", SP.fmtINR(max));
  }

  function raisePriceThumb(input) {
    priceMinInput.style.zIndex = input === priceMinInput ? "5" : "4";
    priceMaxInput.style.zIndex = input === priceMaxInput ? "5" : "4";
  }

  function applyPriceBounds() {
    priceBounds = computePriceBounds();
    [priceMinInput, priceMaxInput].forEach(function (input) {
      input.min = String(priceBounds.min);
      input.max = String(priceBounds.max);
      input.step = String(priceBounds.step);
    });
    priceMinBoundEl.textContent = SP.fmtINR(priceBounds.min);
    priceMaxBoundEl.textContent = SP.fmtINR(priceBounds.max);
  }

  function onPriceInput(changed) {
    var min = Number(priceMinInput.value);
    var max = Number(priceMaxInput.value);

    if (changed === "min" && min > max) {
      min = max;
      priceMinInput.value = String(min);
    }
    if (changed === "max" && max < min) {
      max = min;
      priceMaxInput.value = String(max);
    }

    state.min = min <= priceBounds.min ? "" : String(min);
    state.max = max >= priceBounds.max ? "" : String(max);

    updatePriceUI(min, max);
    raisePriceThumb(changed === "min" ? priceMinInput : priceMaxInput);
    sync();
  }

  /* ------------------------------------------------------------- filtering */
  function matches(product) {
    if (state.q) {
      var needle = state.q.toLowerCase();
      var hay = [product.name, product.category, product.short_description, product.description,
        product.sku, (product.tags || []).join(" ")].join(" ").toLowerCase();
      if (hay.indexOf(needle) === -1) return false;
    }
    if (state.cats.length && state.cats.indexOf(nameToSlug(product.category)) === -1) return false;
    if (state.tag === "water-hyacinth" && (product.tags || []).indexOf("Water Hyacinth") === -1) return false;
    if (state.min !== "" && SP.minPrice(product) < Number(state.min)) return false;
    if (state.max !== "" && SP.minPrice(product) > Number(state.max)) return false;
    return true;
  }

  function sortList(list) {
    var out = list.slice();
    switch (state.sort) {
      case "price-asc":
        out.sort(function (a, b) { return SP.minPrice(a) - SP.minPrice(b); });
        break;
      case "price-desc":
        out.sort(function (a, b) { return SP.minPrice(b) - SP.minPrice(a); });
        break;
      case "name":
        out.sort(function (a, b) { return a.name.localeCompare(b.name); });
        break;
      default:
        out.sort(function (a, b) {
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
          return a.id - b.id;
        });
    }
    return out;
  }

  /* ---------------------------------------------------------------- render */
  function renderActiveFilters() {
    var chips = [];
    state.cats.forEach(function (slug) {
      chips.push('<span class="filter-chip">' + SP.esc(slugToName(slug)) +
        '<button type="button" data-remove-cat="' + SP.esc(slug) + '" aria-label="Remove filter ' + SP.esc(slugToName(slug)) + '">' +
        '<svg class="i" width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>' +
        "</button></span>");
    });
    if (state.tag === "water-hyacinth") {
      chips.push('<span class="filter-chip">Water Hyacinth' +
        '<button type="button" data-remove-tag="water-hyacinth" aria-label="Remove filter Water Hyacinth">' +
        '<svg class="i" width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>' +
        "</button></span>");
    }
    if (state.min !== "" || state.max !== "") {
      chips.push('<span class="filter-chip">Price ' +
        (state.min !== "" ? "from " + SP.fmtINR(state.min) : "") +
        (state.min !== "" && state.max !== "" ? " " : "") +
        (state.max !== "" ? "up to " + SP.fmtINR(state.max) : "") +
        '<button type="button" data-remove-price="1" aria-label="Remove price filter">' +
        '<svg class="i" width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>' +
        "</button></span>");
    }
    if (state.q) {
      chips.push('<span class="filter-chip">“' + SP.esc(state.q) + '”' +
        '<button type="button" data-remove-q="1" aria-label="Clear search">' +
        '<svg class="i" width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>' +
        "</button></span>");
    }
    activeEl.innerHTML = chips.length
      ? chips.join("") + '<button class="link-btn" type="button" id="chip-clear">Clear all</button>'
      : "";
  }

  function render() {
    var list = sortList(SP.products.filter(matches));
    countEl.textContent = list.length === 1
      ? "1 product"
      : list.length + " products";

    if (!list.length) {
      grid.innerHTML = "";
      emptyEl.hidden = false;
    } else {
      emptyEl.hidden = true;
      grid.innerHTML = list.map(function (p) { return SP.productCard(p); }).join("");
      SP.hydrateImages(grid);
    }
    renderActiveFilters();
  }

  function sync() {
    writeUrl();
    render();
  }

  /* ------------------------------------------------------------ UI binding */
  function applyStateToControls() {
    searchInput.value = state.q;
    sortSelect.value = state.sort;
    SP.qsa('input[name="cat"]', filtersEl).forEach(function (input) {
      input.checked = state.cats.indexOf(input.value) !== -1;
    });
    SP.qsa('input[name="tag"]', filtersEl).forEach(function (input) {
      input.checked = state.tag === input.value;
    });
    var price = priceFromState();
    priceMinInput.value = String(price.min);
    priceMaxInput.value = String(price.max);
    updatePriceUI(price.min, price.max);
  }

  function clearAll() {
    state.q = "";
    state.cats = [];
    state.tag = "";
    state.min = "";
    state.max = "";
    state.sort = "featured";
    applyStateToControls();
    sync();
  }

  function openFilters() {
    filtersEl.classList.add("is-open");
    var toggle = document.getElementById("filter-open");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    var scrim = document.getElementById("filter-scrim");
    if (scrim) scrim.classList.add("is-open");
    document.documentElement.classList.add("no-scroll");
    var first = filtersEl.querySelector("button, input");
    if (first) first.focus();
  }

  function closeFilters() {
    filtersEl.classList.remove("is-open");
    var toggle = document.getElementById("filter-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    var scrim = document.getElementById("filter-scrim");
    if (scrim) scrim.classList.remove("is-open");
    document.documentElement.classList.remove("no-scroll");
  }

  function init() {
    grid = SP.qs("[data-shop-grid]");
    emptyEl = SP.qs("[data-shop-empty]");
    countEl = SP.qs("[data-result-count]");
    activeEl = SP.qs("[data-active-filters]");
    searchInput = document.getElementById("shop-search");
    sortSelect = document.getElementById("shop-sort");
    filtersEl = document.getElementById("shop-filters");
    priceMinInput = document.querySelector("[data-price-min]");
    priceMaxInput = document.querySelector("[data-price-max]");
    priceFill = document.querySelector("[data-price-fill]");
    priceMinLabel = document.querySelector("[data-price-min-label]");
    priceMaxLabel = document.querySelector("[data-price-max-label]");
    priceMinBoundEl = document.querySelector("[data-price-min-bound]");
    priceMaxBoundEl = document.querySelector("[data-price-max-bound]");
    if (!grid) return;

    applyPriceBounds();

    /* filter scrim lives on the page so the drawer can be dismissed by tap */
    if (!document.getElementById("filter-scrim")) {
      var scrim = document.createElement("div");
      scrim.className = "scrim";
      scrim.id = "filter-scrim";
      document.body.appendChild(scrim);
    }

    readUrl();
    normalizePriceState();
    applyStateToControls();
    render();

    searchInput.addEventListener("input", SP.debounce(function () {
      state.q = searchInput.value.trim();
      sync();
    }, 260));

    sortSelect.addEventListener("change", function () {
      state.sort = sortSelect.value;
      sync();
    });

    [priceMinInput, priceMaxInput].forEach(function (input) {
      input.addEventListener("input", function () {
        onPriceInput(input === priceMinInput ? "min" : "max");
      });
      input.addEventListener("pointerdown", function () { raisePriceThumb(input); });
      input.addEventListener("keydown", function () { raisePriceThumb(input); });
    });

    /* price presets */
    SP.qsa("[data-price-preset]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var preset = btn.getAttribute("data-price-preset");
        if (preset === "all") {
          state.min = "";
          state.max = "";
        } else {
          var parts = preset.split("-");
          state.min = parts[0] === "0" ? "" : parts[0];
          state.max = parts[1];
        }
        applyStateToControls();
        sync();
      });
    });

    /* pincode delivery check */
    var pinForm = document.getElementById("shop-pincode-form");
    var pinInput = document.getElementById("shop-pincode-input");
    var pinResult = document.getElementById("shop-pincode-result");
    if (pinForm && pinInput && pinResult) {
      pinInput.addEventListener("input", function () {
        pinInput.value = pinInput.value.replace(/\D/g, "").slice(0, 6);
        pinResult.hidden = true;
      });
      pinForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var val = pinInput.value.trim();
        if (!/^[1-9]\d{5}$/.test(val)) {
          pinResult.hidden = false;
          pinResult.className = "pincode-result pincode-result--error";
          pinResult.textContent = "Please enter a valid 6-digit Indian PIN code.";
          return;
        }
        pinResult.hidden = false;
        pinResult.className = "pincode-result pincode-result--success";
        pinResult.innerHTML = "<strong>&#10003; Delivery available to " + SP.esc(val) + "!</strong><br>" +
          "Serviced by <strong>" + SP.esc(SP.config.COURIER_PARTNER) + "</strong>. Estimated transit: 3–5 business days. Free shipping on orders above ₹999.";
      });
    }

    filtersEl.addEventListener("change", function (e) {
      var input = e.target;
      if (input.name === "cat") {
        state.cats = SP.qsa('input[name="cat"]:checked', filtersEl).map(function (i) { return i.value; });
      } else if (input.name === "tag") {
        var checked = SP.qsa('input[name="tag"]:checked', filtersEl);
        state.tag = checked.length ? checked[0].value : "";
      } else {
        return;
      }
      sync();
    });

    document.getElementById("clear-filters").addEventListener("click", clearAll);
    var emptyClear = document.getElementById("empty-clear");
    if (emptyClear) emptyClear.addEventListener("click", clearAll);

    document.getElementById("filter-open").addEventListener("click", openFilters);
    document.getElementById("filter-close").addEventListener("click", closeFilters);
    var filterScrim = document.getElementById("filter-scrim");
    if (filterScrim) filterScrim.addEventListener("click", closeFilters);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && filtersEl.classList.contains("is-open")) closeFilters();
    });

    /* active filter chips */
    activeEl.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      if (btn.id === "chip-clear") return clearAll();
      if (btn.hasAttribute("data-remove-cat")) {
        var slug = btn.getAttribute("data-remove-cat");
        state.cats = state.cats.filter(function (s) { return s !== slug; });
      } else if (btn.hasAttribute("data-remove-tag")) {
        state.tag = "";
      } else if (btn.hasAttribute("data-remove-price")) {
        state.min = "";
        state.max = "";
      } else if (btn.hasAttribute("data-remove-q")) {
        state.q = "";
      } else {
        return;
      }
      applyStateToControls();
      sync();
    });

    /* keep the URL honest when the user hits back/forward */
    window.addEventListener("popstate", function () {
      readUrl();
      normalizePriceState();
      applyStateToControls();
      render();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SP);
