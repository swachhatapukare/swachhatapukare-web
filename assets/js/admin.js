/* admin.js — Operations suite: Billing, Orders, Inventory, CMS, and Enquiries */

(function (SP) {
  "use strict";

  var DEFAULT_USERS = {
    "admin": "pukare2026",
    "staff": "pukare2026",
    "swachhata": "pukare2026"
  };
  var currentTab = "overview";
  var ordersFilter = "all";
  var inventoryFilter = "all";
  var invCategoryFilter = "all";
  var enquiriesFilter = "all";

  // Elements
  var lockOverlay, usernameInput, passwordInput, lockForm;
  var navItems, panels, currentTitle;

  function init() {
    lockOverlay = document.getElementById("admin-lock-overlay");
    usernameInput = document.getElementById("admin-username-input");
    passwordInput = document.getElementById("admin-password-input");
    lockForm = document.getElementById("admin-lock-form");
    navItems = document.querySelectorAll("[data-admin-tab]");
    panels = document.querySelectorAll(".admin-panel");
    currentTitle = document.getElementById("admin-current-title");

    // Check session auth
    if (sessionStorage.getItem("sp_admin_auth") === "true") {
      unlock();
    } else if (lockForm) {
      lockForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var u = (usernameInput && usernameInput.value ? usernameInput.value : "").trim().toLowerCase();
        var p = (passwordInput && passwordInput.value ? passwordInput.value : "").trim();

        if (DEFAULT_USERS[u] && DEFAULT_USERS[u] === p) {
          sessionStorage.setItem("sp_admin_auth", "true");
          sessionStorage.setItem("sp_admin_user", u);
          unlock();
          toast("Logged in as " + u, "success");
        } else {
          if (passwordInput) {
            passwordInput.classList.add("is-invalid");
            passwordInput.value = "";
            passwordInput.focus();
          }
          toast("Invalid username or password. Please try again.", "error");
        }
      });
    }

    // Bind tab switching
    navItems.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var tab = btn.getAttribute("data-admin-tab");
        switchTab(tab);
      });
    });

    // Logout
    var logoutBtn = document.getElementById("admin-logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        sessionStorage.removeItem("sp_admin_auth");
        sessionStorage.removeItem("sp_admin_user");
        if (passwordInput) passwordInput.value = "";
        if (lockOverlay) {
          lockOverlay.style.display = "flex";
        } else {
          window.location.reload();
        }
        toast("Logged out successfully.", "info");
      });
    }

    // Modal Close buttons
    document.querySelectorAll("[data-close-modal]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        closeAllModals();
      });
    });

    // Close modal on backdrop click
    document.querySelectorAll(".admin-modal-backdrop").forEach(function (backdrop) {
      backdrop.addEventListener("click", function (e) {
        if (e.target === backdrop) {
          closeAllModals();
        }
      });
    });

    // Close modal on Escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" || e.keyCode === 27) {
        closeAllModals();
      }
    });

    // Quick Login click helper
    var quickPass = document.getElementById("quick-passcode-btn");
    if (quickPass) {
      quickPass.addEventListener("click", function () {
        if (usernameInput) usernameInput.value = "admin";
        if (passwordInput) passwordInput.value = "pukare2026";
        sessionStorage.setItem("sp_admin_auth", "true");
        sessionStorage.setItem("sp_admin_user", "admin");
        unlock();
        toast("Logged in as admin", "success");
      });
    }

    // Always start with all modals closed
    closeAllModals();

    loadCustomCategories();
    refreshCategoryDropdowns();
    bindBillingActions();
    bindInventoryActions();
    bindCmsActions();
    bindEnquiryActions();
    bindBackupActions();
  }

  function unlock() {
    if (lockOverlay) lockOverlay.style.display = "none";
    var user = sessionStorage.getItem("sp_admin_user") || "admin";
    var badge = document.querySelector(".admin-sidebar__badge");
    if (badge) badge.textContent = "Admin (" + user + ")";
    loadCustomCategories();
    refreshCategoryDropdowns();
    switchTab("overview");
  }

  function switchTab(tab) {
    currentTab = tab;
    navItems.forEach(function (b) {
      var match = b.getAttribute("data-admin-tab") === tab;
      b.classList.toggle("is-active", match);
    });

    panels.forEach(function (p) {
      var match = p.id === "panel-" + tab;
      p.classList.toggle("is-active", match);
    });

    var titles = {
      overview: "Dashboard Overview",
      billing: "Billing & Order Operations",
      inventory: "Inventory & Catalogue Control",
      cms: "Content Management (CMS)",
      enquiries: "Customer Enquiries & Bulk Leads",
      backup: "System Data & Backups"
    };
    if (currentTitle) currentTitle.textContent = titles[tab] || "Admin Console";

    // Refresh view
    if (tab === "overview") renderOverview();
    else if (tab === "billing") renderOrders();
    else if (tab === "inventory") renderInventory();
    else if (tab === "cms") renderCms();
    else if (tab === "enquiries") renderEnquiries();
  }

  /* ============================================================= 1. OVERVIEW */
  function renderOverview() {
    var orders = (SP.store && SP.store.getOrders()) || [];
    var products = (SP.products) || [];
    var posts = (SP.blog && SP.blog.getAllPosts()) || [];
    var enqs = (SP.store && SP.store.getEnquiries()) || [];
    var bulks = (SP.store && SP.store.getBulkEnquiries()) || [];

    // Calculate revenue
    var rev = orders.reduce(function (sum, o) {
      return sum + (Number(o.total) || 0);
    }, 0);

    var elRev = document.getElementById("kpi-revenue");
    var elOrders = document.getElementById("kpi-orders");
    var elStock = document.getElementById("kpi-inventory");
    var elPosts = document.getElementById("kpi-posts");
    var elLeads = document.getElementById("kpi-leads");

    if (elRev) elRev.textContent = SP.fmtINR ? SP.fmtINR(rev) : "₹" + rev;
    if (elOrders) elOrders.textContent = String(orders.length);
    if (elStock) elStock.textContent = String(products.length);
    if (elPosts) elPosts.textContent = String(posts.length);
    if (elLeads) elLeads.textContent = String(enqs.length + bulks.length);

    // Recent orders preview table (top 5)
    var recentOrdersTable = document.getElementById("overview-recent-orders");
    if (recentOrdersTable) {
      var recent = orders.slice(0, 5);
      if (!recent.length) {
        recentOrdersTable.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding: 2rem;">No orders recorded yet.</td></tr>';
      } else {
        recentOrdersTable.innerHTML = recent.map(function (o) {
          return (
            '<tr>' +
            '<td><strong class="font-mono">' + SP.esc(o.id) + '</strong></td>' +
            '<td>' + SP.esc(o.customer ? o.customer.name : "Guest") + '</td>' +
            '<td>' + SP.esc(o.placedAt ? new Date(o.placedAt).toLocaleDateString() : "") + '</td>' +
            '<td><span class="admin-badge admin-badge--' + getStatusBadgeClass(o.status || "processing") + '">' + SP.esc(o.status || "Processing") + '</span></td>' +
            '<td><strong>' + (SP.fmtINR ? SP.fmtINR(o.total) : "₹" + o.total) + '</strong></td>' +
            '</tr>'
          );
        }).join("");
      }
    }
  }

  /* ==================================================== 2. BILLING & ORDERS */
  function renderOrders() {
    var all = (SP.store && SP.store.getOrders()) || [];
    var filtered = all.filter(function (o) {
      if (ordersFilter === "all") return true;
      return (o.status || "processing").toLowerCase() === ordersFilter;
    });

    var countEl = document.getElementById("orders-count");
    if (countEl) countEl.textContent = String(filtered.length);

    var tbody = document.getElementById("orders-table-body");
    if (!tbody) return;

    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted" style="padding: 3rem;">No orders found matching this filter.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(function (order) {
      var dateStr = order.placedAt ? new Date(order.placedAt).toLocaleDateString() : "—";
      var itemsCount = (order.items || []).reduce(function (acc, it) { return acc + (it.qty || 1); }, 0);
      var status = order.status || "processing";
      var payStatus = (order.payment && order.payment.status) || "due_on_delivery";

      return (
        '<tr>' +
        '<td><strong class="font-mono">' + SP.esc(order.id) + '</strong></td>' +
        '<td>' + SP.esc(dateStr) + '</td>' +
        '<td><strong>' + SP.esc(order.customer ? order.customer.name : "Guest") + '</strong><br><span class="text-xs text-muted">' + SP.esc(order.customer ? order.customer.phone : "") + '</span></td>' +
        '<td>' + itemsCount + ' items</td>' +
        '<td><span class="admin-badge admin-badge--' + (payStatus === "paid" ? "success" : "warning") + '">' + SP.esc(payStatus.replace(/_/g, " ")) + '</span></td>' +
        '<td><span class="admin-badge admin-badge--' + getStatusBadgeClass(status) + '">' + SP.esc(status) + '</span></td>' +
        '<td><strong>' + (SP.fmtINR ? SP.fmtINR(order.total) : "₹" + order.total) + '</strong></td>' +
        '<td class="td-actions">' +
        '<div class="adm-table-actions">' +
        '<button class="adm-icon-btn" data-view-order="' + SP.esc(order.id) + '" title="Manage Order & Fulfillment" aria-label="Manage Order">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' +
        '</button>' +
        '<a class="adm-icon-btn" href="invoice.html?id=' + encodeURIComponent(order.id) + '" target="_blank" title="Print Official Invoice" aria-label="Print Invoice">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>' +
        '</a>' +
        '</div>' +
        '</td>' +
        '</tr>'
      );
    }).join("");

    // Bind view buttons
    tbody.querySelectorAll("[data-view-order]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-view-order");
        openOrderModal(id);
      });
    });
  }

  function bindBillingActions() {
    // Filter pills
    document.querySelectorAll("[data-orders-filter]").forEach(function (pill) {
      pill.addEventListener("click", function () {
        document.querySelectorAll("[data-orders-filter]").forEach(function (p) { p.classList.remove("is-active"); });
        pill.classList.add("is-active");
        ordersFilter = pill.getAttribute("data-orders-filter");
        renderOrders();
      });
    });

    // Export CSV
    var exportBtn = document.getElementById("orders-export-csv");
    if (exportBtn) {
      exportBtn.addEventListener("click", function () {
        var orders = (SP.store && SP.store.getOrders()) || [];
        if (!orders.length) {
          toast("No orders to export.", "error");
          return;
        }
        var csv = "Order ID,Date,Customer Name,Phone,Email,Items Count,Total,Payment Method,Payment Status,Order Status\n";
        orders.forEach(function (o) {
          var c = o.customer || {};
          var itemsCount = (o.items || []).reduce(function (acc, it) { return acc + (it.qty || 1); }, 0);
          csv += [
            o.id,
            o.placedAt || "",
            '"' + (c.name || "").replace(/"/g, '""') + '"',
            c.phone || "",
            c.email || "",
            itemsCount,
            o.total || 0,
            (o.payment && o.payment.method) || "",
            (o.payment && o.payment.status) || "",
            o.status || "processing"
          ].join(",") + "\n";
        });
        downloadBlob(csv, "swachhatapukare_orders.csv", "text/csv;charset=utf-8;");
        toast("Orders CSV exported successfully.");
      });
    }

    // Order Modal Form submission
    var statusSelect = document.getElementById("order-status-select");
    var saveStatusBtn = document.getElementById("save-order-status-btn");
    if (saveStatusBtn && statusSelect) {
      saveStatusBtn.addEventListener("click", function () {
        var orderId = saveStatusBtn.getAttribute("data-order-id");
        var newStatus = statusSelect.value;
        if (orderId && SP.store && SP.store.updateOrder) {
          SP.store.updateOrder(orderId, { status: newStatus });
          toast("Order " + orderId + " updated to " + newStatus);
          closeAllModals();
          renderOrders();
          renderOverview();
        }
      });
    }
  }

  function openOrderModal(id) {
    var order = SP.store.getOrder(id);
    if (!order) return;

    var modal = document.getElementById("order-detail-modal");
    if (!modal) return;

    document.getElementById("modal-order-id").textContent = order.id;
    document.getElementById("modal-order-date").textContent = order.placedAt ? new Date(order.placedAt).toLocaleString() : "";
    document.getElementById("modal-order-customer").textContent = (order.customer && order.customer.name) || "Guest";
    document.getElementById("modal-order-phone").textContent = (order.customer && order.customer.phone) || "—";
    document.getElementById("modal-order-email").textContent = (order.customer && order.customer.email) || "—";
    
    var addr = order.address || {};
    document.getElementById("modal-order-address").textContent = [addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ") || "—";

    var itemsBody = document.getElementById("modal-order-items");
    if (itemsBody) {
      itemsBody.innerHTML = (order.items || []).map(function (it) {
        return (
          '<tr>' +
          '<td><strong>' + SP.esc(it.name) + '</strong><br><span class="text-xs text-muted">' + SP.esc(it.sku) + '</span></td>' +
          '<td>' + (SP.fmtINR ? SP.fmtINR(it.unit) : "₹" + it.unit) + '</td>' +
          '<td>' + it.qty + '</td>' +
          '<td><strong>' + (SP.fmtINR ? SP.fmtINR(it.lineTotal) : "₹" + it.lineTotal) + '</strong></td>' +
          '</tr>'
        );
      }).join("");
    }

    document.getElementById("modal-order-subtotal").textContent = SP.fmtINR ? SP.fmtINR(order.subtotal) : "₹" + order.subtotal;
    document.getElementById("modal-order-shipping").textContent = SP.fmtINR ? SP.fmtINR(order.shipping) : "₹" + order.shipping;
    document.getElementById("modal-order-total").textContent = SP.fmtINR ? SP.fmtINR(order.total) : "₹" + order.total;

    var statusSelect = document.getElementById("order-status-select");
    if (statusSelect) statusSelect.value = order.status || "processing";

    var saveBtn = document.getElementById("save-order-status-btn");
    if (saveBtn) saveBtn.setAttribute("data-order-id", order.id);

    var invLink = document.getElementById("modal-invoice-link");
    if (invLink) invLink.href = "invoice.html?id=" + encodeURIComponent(order.id);

    openModal(modal);
  }

  /* ==================================================== 3. INVENTORY & CATEGORIES */
  var lastSelectedCategory = "";

  function normalizeCategory(raw) {
    if (!raw) return null;
    if (typeof raw === "string") {
      var trimmed = raw.trim();
      if (!trimmed) return null;
      return {
        name: trimmed,
        slug: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
        tint: "--c-cat-office"
      };
    }
    if (typeof raw === "object" && raw.name) {
      var n = String(raw.name).trim();
      if (!n) return null;
      return {
        name: n,
        slug: raw.slug || n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
        tint: raw.tint || "--c-cat-office"
      };
    }
    return null;
  }

  function loadCustomCategories() {
    try {
      var custom = JSON.parse(window.localStorage.getItem("sp_custom_categories") || "[]");
      if (Array.isArray(custom)) {
        custom.forEach(function (raw) {
          var cat = normalizeCategory(raw);
          if (cat && !SP.config.CATEGORIES.some(function (c) { return (c.name || "").toLowerCase() === cat.name.toLowerCase(); })) {
            SP.config.CATEGORIES.push(cat);
          }
        });
      }
    } catch (e) { /* ignore */ }
  }

  function refreshCategoryDropdowns() {
    loadCustomCategories();
    var categories = (SP.categories && SP.categories()) || SP.config.CATEGORIES || [];

    var seen = {};
    var uniqueCategories = [];
    categories.forEach(function (c) {
      var cat = normalizeCategory(c);
      if (cat && !seen[cat.name.toLowerCase()]) {
        seen[cat.name.toLowerCase()] = true;
        uniqueCategories.push(cat);
      }
    });

    // 1. Product Modal category selector (#prod-category)
    var prodCat = document.getElementById("prod-category");
    if (prodCat) {
      var currentVal = prodCat.value;
      prodCat.innerHTML = uniqueCategories.map(function (c) {
        return '<option value="' + SP.esc(c.name) + '">' + SP.esc(c.name) + '</option>';
      }).join("");

      var matchedIndex = -1;
      if (lastSelectedCategory) {
        for (var i = 0; i < prodCat.options.length; i++) {
          if (prodCat.options[i].value.toLowerCase() === lastSelectedCategory.toLowerCase()) {
            matchedIndex = i;
            break;
          }
        }
      }
      if (matchedIndex === -1 && currentVal) {
        for (var j = 0; j < prodCat.options.length; j++) {
          if (prodCat.options[j].value.toLowerCase() === currentVal.toLowerCase()) {
            matchedIndex = j;
            break;
          }
        }
      }
      if (matchedIndex >= 0) {
        prodCat.selectedIndex = matchedIndex;
      }
    }

    // 2. Inventory panel category filter
    var filterCat = document.getElementById("inv-category-filter");
    if (filterCat) {
      var currentFilter = filterCat.value || invCategoryFilter || "all";
      var counts = {};
      (SP.products || []).forEach(function (p) {
        if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
      });

      var options = '<option value="all">All Categories (' + (SP.products || []).length + ')</option>';
      options += uniqueCategories.map(function (c) {
        var cnt = counts[c.name] || 0;
        return '<option value="' + SP.esc(c.name) + '">' + SP.esc(c.name) + ' (' + cnt + ')</option>';
      }).join("");

      filterCat.innerHTML = options;
      filterCat.value = currentFilter;
    }
  }

  function renderInventory() {
    var products = SP.products || [];

    // Calculate full stock statistics
    var totalStockUnits = 0;
    var lowStockCount = 0;
    var outOfStockCount = 0;
    var categoriesMap = {};

    products.forEach(function (p) {
      var q = p.stock_qty != null ? p.stock_qty : 25;
      totalStockUnits += q;
      if (q <= 0 || p.stock_status === "outofstock") {
        outOfStockCount++;
      } else if (q <= 5) {
        lowStockCount++;
      }
      if (p.category) categoriesMap[p.category] = true;
    });

    var elStockUnits = document.getElementById("inv-kpi-stock-units");
    var elLowCount = document.getElementById("inv-kpi-low-count");
    var elOutCount = document.getElementById("inv-kpi-out-count");
    var elTotalSkus = document.getElementById("inv-kpi-total-skus");
    var elCatsMeta = document.getElementById("inv-kpi-categories-meta");

    if (elStockUnits) elStockUnits.textContent = totalStockUnits.toLocaleString();
    if (elLowCount) elLowCount.textContent = String(lowStockCount);
    if (elOutCount) elOutCount.textContent = String(outOfStockCount);
    if (elTotalSkus) elTotalSkus.textContent = String(products.length);
    if (elCatsMeta) elCatsMeta.textContent = "Across " + Object.keys(categoriesMap).length + " categories";

    // Filter products
    var filtered = products.filter(function (p) {
      var qty = p.stock_qty != null ? p.stock_qty : 25;
      var matchesStatus = true;
      if (inventoryFilter === "low") matchesStatus = (qty <= 5 && qty > 0);
      else if (inventoryFilter === "out") matchesStatus = (qty <= 0 || p.stock_status === "outofstock");
      else if (inventoryFilter === "in") matchesStatus = (qty > 5);

      var matchesCat = true;
      if (invCategoryFilter && invCategoryFilter !== "all") {
        matchesCat = (p.category === invCategoryFilter);
      }

      return matchesStatus && matchesCat;
    });

    var countEl = document.getElementById("inventory-count");
    if (countEl) countEl.textContent = String(filtered.length);

    var tbody = document.getElementById("inventory-table-body");
    if (!tbody) return;

    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted" style="padding: 3rem;">No products found matching these filters.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(function (prod) {
      var qty = prod.stock_qty != null ? prod.stock_qty : 25; // default healthy stock
      var isLow = qty <= 5 && qty > 0;
      var isOut = qty <= 0 || prod.stock_status === "outofstock";
      var badgeClass = isOut ? "danger" : (isLow ? "warning" : "success");
      var badgeLabel = isOut ? "Out of Stock" : (isLow ? "Low Stock (" + qty + ")" : "In Stock (" + qty + ")");

      var imgUrl = prod.image || ("assets/products/" + prod.slug + "-1.jpg");
      return (
        '<tr>' +
        '<td><strong class="font-mono">' + SP.esc(prod.sku) + '</strong></td>' +
        '<td>' +
        '  <div style="display:flex;align-items:center;gap:0.75rem;">' +
        '    <img src="' + SP.esc(imgUrl) + '" alt="' + SP.esc(prod.name) + '" style="width:44px;height:44px;border-radius:6px;object-fit:cover;border:1px solid var(--adm-border);background:#F1F5F9;flex-shrink:0;" onerror="this.onerror=null;this.src=\'assets/logo-full.png\';">' +
        '    <div>' +
        '      <div style="font-weight:600;color:var(--adm-text);">' + SP.esc(prod.name) + '</div>' +
        '      <div class="text-xs text-muted font-mono">' + SP.esc(prod.dimensions || "") + '</div>' +
        '    </div>' +
        '  </div>' +
        '</td>' +
        '<td><span class="admin-badge admin-badge--muted">' + SP.esc(prod.category) + '</span></td>' +
        '<td><strong>₹' + prod.price + '</strong></td>' +
        '<td>' +
        '<div style="display:inline-flex;align-items:center;gap:0.4rem;">' +
        '<button class="btn btn--outline btn--xs" data-stock-mod="' + prod.id + '" data-delta="-1" aria-label="Decrease stock">-</button>' +
        '<span style="min-width: 2.2rem; text-align: center; font-weight: 600;">' + qty + '</span>' +
        '<button class="btn btn--outline btn--xs" data-stock-mod="' + prod.id + '" data-delta="1" aria-label="Increase stock">+</button>' +
        '</div>' +
        '</td>' +
        '<td><span class="admin-badge admin-badge--' + badgeClass + '">' + badgeLabel + '</span></td>' +
        '<td class="td-actions">' +
        '<div class="adm-table-actions">' +
        '<button class="adm-icon-btn" data-edit-prod="' + prod.id + '" title="Edit Product Details" aria-label="Edit Product">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>' +
        '</button>' +
        '</div>' +
        '</td>' +
        '</tr>'
      );
    }).join("");

    // Bind stock modifier buttons
    tbody.querySelectorAll("[data-stock-mod]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = Number(btn.getAttribute("data-stock-mod"));
        var delta = Number(btn.getAttribute("data-delta"));
        modifyStock(id, delta);
      });
    });

    // Bind edit buttons
    tbody.querySelectorAll("[data-edit-prod]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = Number(btn.getAttribute("data-edit-prod"));
        openProductModal(id);
      });
    });
  }

  function modifyStock(prodId, delta) {
    var prod = SP.products.find(function (p) { return p.id === prodId; });
    if (!prod) return;
    var current = prod.stock_qty != null ? prod.stock_qty : 25;
    var next = Math.max(0, current + delta);
    prod.stock_qty = next;
    prod.stock_status = next > 0 ? "instock" : "outofstock";

    persistProductChange(prod);
    renderInventory();
    renderOverview();
    toast(prod.name + " stock adjusted to " + next);
  }

  function persistProductChange(product) {
    try {
      var custom = JSON.parse(window.localStorage.getItem("sp_custom_products") || "[]");
      var idx = custom.findIndex(function (p) { return p.id === product.id; });
      if (idx !== -1) custom[idx] = product;
      else custom.push(product);
      window.localStorage.setItem("sp_custom_products", JSON.stringify(custom));
    } catch (e) { /* ignore */ }
  }

  function closeAllDropdowns() {
    document.querySelectorAll(".admin-dropdown-menu").forEach(function (m) {
      m.style.display = "none";
    });
    document.querySelectorAll("[aria-haspopup=true]").forEach(function (b) {
      b.setAttribute("aria-expanded", "false");
    });
  }

  function bindInventoryActions() {
    // Inventory filter pills
    document.querySelectorAll("[data-inv-filter]").forEach(function (pill) {
      pill.addEventListener("click", function () {
        document.querySelectorAll("[data-inv-filter]").forEach(function (p) { p.classList.remove("is-active"); });
        pill.classList.add("is-active");
        inventoryFilter = pill.getAttribute("data-inv-filter");
        renderInventory();
      });
    });

    // Category filter dropdown
    var filterCat = document.getElementById("inv-category-filter");
    if (filterCat) {
      filterCat.addEventListener("change", function () {
        invCategoryFilter = filterCat.value;
        renderInventory();
      });
    }

    // Dropdown toggles for "+ Add New"
    function setupDropdown(triggerId, menuId) {
      var btn = document.getElementById(triggerId);
      var menu = document.getElementById(menuId);
      if (!btn || !menu) return;

      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var isOpen = menu.style.display === "block";
        closeAllDropdowns();
        if (!isOpen) {
          menu.style.display = "block";
          btn.setAttribute("aria-expanded", "true");
        }
      });
    }

    setupDropdown("add-new-btn", "add-new-menu");
    setupDropdown("inv-add-new-btn", "inv-add-new-menu");

    // Close dropdowns on outside click
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".admin-dropdown-wrap")) {
        closeAllDropdowns();
      }
    });

    // "Product" option handlers
    ["add-new-opt-product", "inv-opt-product"].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", function () {
          closeAllDropdowns();
          openProductModal(null);
        });
      }
    });

    // "Category" option handlers
    ["add-new-opt-category", "inv-opt-category"].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", function () {
          closeAllDropdowns();
          openCategoryModal();
        });
      }
    });

    // Quick Add Category button inside Product Modal
    var quickCatBtn = document.getElementById("prod-quick-cat-btn");
    if (quickCatBtn) {
      quickCatBtn.addEventListener("click", function () {
        var catName = prompt("Enter new category name (e.g. Eco Gift Hampers, Storage Baskets):");
        if (!catName || !catName.trim()) return;
        catName = catName.trim();

        var existing = (SP.categories && SP.categories()) || SP.config.CATEGORIES || [];
        var found = existing.find(function (c) { return (c.name || "").toLowerCase() === catName.toLowerCase(); });
        if (!found) {
          var slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "cat-" + Date.now();
          var newCat = { name: catName, slug: slug, tint: "--c-cat-office" };
          SP.config.CATEGORIES.push(newCat);
          try {
            var custom = JSON.parse(window.localStorage.getItem("sp_custom_categories") || "[]");
            custom.push(newCat);
            window.localStorage.setItem("sp_custom_categories", JSON.stringify(custom));
          } catch (e) { /* ignore */ }
        }

        lastSelectedCategory = catName;
        refreshCategoryDropdowns();
        var catSelect = document.getElementById("prod-category");
        if (catSelect) {
          for (var k = 0; k < catSelect.options.length; k++) {
            if (catSelect.options[k].value.toLowerCase() === catName.toLowerCase()) {
              catSelect.selectedIndex = k;
              break;
            }
          }
        }
        toast("Category '" + catName + "' created and selected!");
      });
    }

    // Save Product Form
    var form = document.getElementById("product-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var id = document.getElementById("prod-id").value;
        var sku = document.getElementById("prod-sku").value.trim();
        var name = document.getElementById("prod-name").value.trim();
        var category = document.getElementById("prod-category").value;
        var price = Number(document.getElementById("prod-price").value) || 0;
        var stock = Number(document.getElementById("prod-stock").value) || 0;
        var dimensions = document.getElementById("prod-dimensions").value.trim();
        var desc = document.getElementById("prod-desc").value.trim();
        var image = (document.getElementById("prod-image") && document.getElementById("prod-image").value.trim()) || "";

        if (id) {
          // Editing existing
          var prod = SP.products.find(function (p) { return p.id === Number(id); });
          if (prod) {
            prod.sku = sku;
            prod.name = name;
            prod.category = category;
            prod.price = price;
            prod.stock_qty = stock;
            prod.stock_status = stock > 0 ? "instock" : "outofstock";
            prod.dimensions = dimensions;
            prod.description = desc;
            if (image) prod.image = image;
            persistProductChange(prod);
            toast("Product updated successfully.");
          }
        } else {
          // New product
          var newId = Date.now();
          var slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          var newProd = {
            id: newId,
            sku: sku || "SP-" + Date.now().toString().slice(-4),
            name: name,
            slug: slug,
            category: category,
            price: price,
            stock_qty: stock,
            stock_status: stock > 0 ? "instock" : "outofstock",
            dimensions: dimensions,
            description: desc,
            short_description: desc.slice(0, 100),
            image: image,
            featured: false,
            tags: ["Handcrafted", "Water Hyacinth"]
          };
          SP.products.push(newProd);
          persistProductChange(newProd);
          toast("New product added to catalog.");
        }

        closeAllModals();
        refreshCategoryDropdowns();
        renderInventory();
        renderOverview();
      });
    }

    // Category Modal Form setup
    var catForm = document.getElementById("category-form");
    if (catForm) {
      catForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var catNameInput = document.getElementById("cat-name");
        var name = (catNameInput && catNameInput.value ? catNameInput.value : "").trim();
        if (!name) return;

        var existing = (SP.categories && SP.categories()) || SP.config.CATEGORIES || [];
        if (existing.some(function (c) { return (c.name || "").toLowerCase() === name.toLowerCase(); })) {
          toast("Category '" + name + "' already exists.", "error");
          return;
        }

        var slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "cat-" + Date.now();
        var newCat = { name: name, slug: slug, tint: "--c-cat-office" };

        // 1. Add to in-memory SP.config.CATEGORIES
        SP.config.CATEGORIES.push(newCat);

        // 2. Persist to localStorage
        try {
          var custom = JSON.parse(window.localStorage.getItem("sp_custom_categories") || "[]");
          if (!custom.some(function (c) {
            var cName = typeof c === "string" ? c : (c.name || "");
            return cName.toLowerCase() === name.toLowerCase();
          })) {
            custom.push(newCat);
            window.localStorage.setItem("sp_custom_categories", JSON.stringify(custom));
          }
        } catch (err) { /* ignore */ }

        // 3. Close modal & show toast
        closeAllModals();
        toast("Category '" + name + "' saved successfully!", "success");

        // 4. Remember as active category so it auto-selects in Product modal
        lastSelectedCategory = name;
        invCategoryFilter = "all";

        // 5. Refresh dropdowns and inventory view (keep all items visible)
        refreshCategoryDropdowns();
        var filterEl = document.getElementById("inv-category-filter");
        if (filterEl) filterEl.value = "all";
        renderInventory();

        // 6. Convenience: Ask if they want to add a product in this category now
        setTimeout(function () {
          if (confirm("Category '" + name + "' created successfully! Would you like to add a product under this category now?")) {
            openProductModal(null);
          }
        }, 150);
      });
    }
  }

  function openCategoryModal() {
    var modal = document.getElementById("category-modal");
    if (!modal) return;
    var nameInput = document.getElementById("cat-name");
    if (nameInput) {
      nameInput.value = "";
      setTimeout(function () { nameInput.focus(); }, 60);
    }
    openModal(modal);
  }

  function openProductModal(prodId) {
    refreshCategoryDropdowns();

    var modal = document.getElementById("product-modal");
    if (!modal) return;

    var titleEl = document.getElementById("product-modal-title");
    var idInput = document.getElementById("prod-id");
    var skuInput = document.getElementById("prod-sku");
    var nameInput = document.getElementById("prod-name");
    var catInput = document.getElementById("prod-category");
    var priceInput = document.getElementById("prod-price");
    var stockInput = document.getElementById("prod-stock");
    var dimInput = document.getElementById("prod-dimensions");
    var descInput = document.getElementById("prod-desc");
    var imgInput = document.getElementById("prod-image");
    var imgPreview = document.getElementById("prod-photo-preview");
    var imgPh = document.getElementById("prod-photo-ph");

    function updatePreview(src) {
      if (imgPreview && imgPh) {
        if (src) {
          imgPreview.src = src;
          imgPreview.style.display = "block";
          imgPh.style.display = "none";
        } else {
          imgPreview.src = "";
          imgPreview.style.display = "none";
          imgPh.style.display = "block";
        }
      }
    }

    if (prodId) {
      var prod = SP.products.find(function (p) { return p.id === prodId; });
      if (!prod) return;
      titleEl.textContent = "Edit Product: " + prod.name;
      idInput.value = prod.id;
      skuInput.value = prod.sku;
      nameInput.value = prod.name;
      if (catInput) catInput.value = prod.category;
      priceInput.value = prod.price;
      stockInput.value = prod.stock_qty != null ? prod.stock_qty : 25;
      dimInput.value = prod.dimensions || "";
      descInput.value = prod.description || "";
      var existingImg = prod.image || ("assets/products/" + prod.slug + "-1.jpg");
      if (imgInput) imgInput.value = prod.image || "";
      updatePreview(existingImg);
    } else {
      titleEl.textContent = "Add New Handcrafted Product";
      idInput.value = "";
      skuInput.value = "SP-OE-" + Math.floor(100 + Math.random() * 900);
      nameInput.value = "";
      if (catInput) {
        if (lastSelectedCategory && Array.from(catInput.options).some(function (o) { return o.value.toLowerCase() === lastSelectedCategory.toLowerCase(); })) {
          catInput.value = lastSelectedCategory;
        } else if (invCategoryFilter && invCategoryFilter !== "all" && Array.from(catInput.options).some(function (o) { return o.value === invCategoryFilter; })) {
          catInput.value = invCategoryFilter;
        } else if (catInput.options && catInput.options.length) {
          catInput.selectedIndex = 0;
        }
      }
      priceInput.value = 250;
      stockInput.value = 20;
      dimInput.value = '10" x 8"';
      descInput.value = "";
      if (imgInput) imgInput.value = "";
      updatePreview("");
    }

    // Bind image file picker once
    var photoFile = document.getElementById("prod-photo-file");
    if (photoFile && !photoFile._bound) {
      photoFile._bound = true;
      photoFile.addEventListener("change", function () {
        var file = photoFile.files && photoFile.files[0];
        if (file) {
          var reader = new FileReader();
          reader.onload = function (e) {
            var dataUrl = e.target.result;
            if (imgInput) imgInput.value = dataUrl;
            updatePreview(dataUrl);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (imgInput && !imgInput._bound) {
      imgInput._bound = true;
      imgInput.addEventListener("input", function () {
        updatePreview(imgInput.value.trim());
      });
    }

    openModal(modal);
  }

  /* ========================================================== 4. CMS PANEL */
  var CMS_PAGES = [
    { key: "home", name: "Home", file: "index.html", category: "Core", desc: "Main landing page, hero mission statement, and pillar overview." },
    { key: "about", name: "About Us", file: "about.html", category: "Core", desc: "Foundation background, vision, team, and story." },
    { key: "water-hyacinth", name: "Water Hyacinth Craft", file: "water-hyacinth.html", category: "Initiative", desc: "Ecological upcycling, women artisan empowerment, and product craft." },
    { key: "river-cleaning", name: "River Cleaning Drives", file: "river-cleaning.html", category: "Initiative", desc: "Weekly Subarnarekha & Kharkai cleanup campaigns and community drives." },
    { key: "solar-power", name: "Solar Power Systems", file: "solar-power.html", category: "Initiative", desc: "Rooftop and micro-grid renewable solar energy installations." },
    { key: "sewage-treatment", name: "Sewage Treatment (STP)", file: "sewage-treatment.html", category: "Initiative", desc: "Decentralized Johkasou STP wastewater recovery technology." },
    { key: "rural-smart-village-centres", name: "Rural Smart Village Centres", file: "rural-smart-village-centres.html", category: "Initiative", desc: "Decentralized rural innovation, artisan workshops, and sustainable village hubs." },
    { key: "tedxbistupur", name: "TEDxBistupur Platform", file: "tedxbistupur.html", category: "Community", desc: "Ideas worth spreading, conference speaker platform, and changemaker summit." },
    { key: "donate", name: "Donate & Support", file: "donate.html", category: "Community", desc: "80G tax-exempt charitable donations, funding allocations, and CSR support." },
    { key: "contact", name: "Contact & Headquarters", file: "contact.html", category: "Legal", desc: "Corporate inquiries, office address, map location, and contact routing." },
    { key: "policies", name: "Policies & Terms", file: "policies.html", category: "Legal", desc: "Statutory compliance, terms of service, payment, and refund policies." },
    { key: "gallery", name: "Living Gallery & Field Archive", file: "gallery.html", category: "Community", desc: "Living archive of cleanup drives, artisan workshops, and field photography." }
  ];

  var cmsFilter = "all";
  var BASELINE_COPY = null;

  function getBaselineCopy() {
    if (!BASELINE_COPY && window.SP && window.SP.config && window.SP.config.COPY) {
      BASELINE_COPY = JSON.parse(JSON.stringify(window.SP.config.COPY));
    }
    return BASELINE_COPY || {};
  }

  function renderCms() {
    getBaselineCopy();

    // 1. Render Website Pages CMS table
    renderCmsPages();

    // 2. Render Living Gallery photos
    renderCmsGallery();

    // 3. Blog posts table
    var posts = (SP.blog && SP.blog.getAllPosts()) || [];
    var tbody = document.getElementById("cms-posts-table-body");
    if (tbody) {
      tbody.innerHTML = posts.map(function (post) {
        return (
          '<tr>' +
          '<td><strong>' + SP.esc(post.title) + '</strong></td>' +
          '<td><span class="admin-badge admin-badge--info">' + SP.esc(post.category) + '</span></td>' +
          '<td>' + SP.esc(post.author || "Team") + '</td>' +
          '<td>' + SP.esc(post.date || "") + '</td>' +
          '<td class="td-actions">' +
          '<div class="adm-table-actions">' +
          '<button class="adm-icon-btn" data-edit-post="' + SP.esc(post.id) + '" title="Edit Article" aria-label="Edit Article">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>' +
          '</button>' +
          '<a class="adm-icon-btn" href="blog.html?post=' + encodeURIComponent(post.slug) + '" target="_blank" title="View Published Article" aria-label="View Published Article">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' +
          '</a>' +
          '<button class="adm-icon-btn adm-icon-btn--danger" data-delete-post="' + SP.esc(post.id) + '" title="Delete Article" aria-label="Delete Article">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
          '</button>' +
          '</div>' +
          '</td>' +
          '</tr>'
        );
      }).join("");

      tbody.querySelectorAll("[data-edit-post]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-edit-post");
          openArticleModal(id);
        });
      });

      tbody.querySelectorAll("[data-delete-post]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-delete-post");
          if (confirm("Are you sure you want to delete this article?")) {
            if (SP.blog && SP.blog.deletePost) SP.blog.deletePost(id);
            toast("Article removed.");
            renderCms();
            renderOverview();
          }
        });
      });
    }

    // 3. Load custom impact metrics if stored
    try {
      var savedImpact = JSON.parse(window.localStorage.getItem("sp_custom_impact") || "null");
      if (savedImpact) {
        if (savedImpact.drives) document.getElementById("impact-drives").value = savedImpact.drives;
        if (savedImpact.csr) document.getElementById("impact-csr").value = savedImpact.csr;
        if (savedImpact.tedx) document.getElementById("impact-tedx").value = savedImpact.tedx;
        if (savedImpact.solar) document.getElementById("impact-solar").value = savedImpact.solar;
      }
    } catch (e) { /* ignore */ }

    // 4. Load Headquarters & Foundation info
    var f = (SP.config && SP.config.FOUNDATION) || {};
    var elName = document.getElementById("fdn-name");
    if (elName && f.name) elName.value = f.name;
    var elAddr1 = document.getElementById("fdn-addr1");
    if (elAddr1 && f.addressLines && f.addressLines[0]) elAddr1.value = f.addressLines[0];
    var elAddr2 = document.getElementById("fdn-addr2");
    if (elAddr2 && f.addressLines && f.addressLines[1]) elAddr2.value = f.addressLines[1];
    var elGst = document.getElementById("fdn-gst");
    if (elGst && f.gst) elGst.value = f.gst;
    var elPhone = document.getElementById("fdn-phone");
    if (elPhone && f.phone) elPhone.value = f.phone;
    var elWa = document.getElementById("fdn-whatsapp");
    if (elWa && f.whatsapp) elWa.value = f.whatsapp;
    var elEmail = document.getElementById("fdn-email");
    if (elEmail && f.email) elEmail.value = f.email;
    var elHours = document.getElementById("fdn-hours");
    if (elHours && f.hours) elHours.value = f.hours;
  }

  function renderCmsPages() {
    var tbody = document.getElementById("cms-pages-table-body");
    if (!tbody) return;

    var customCopy = {};
    try {
      customCopy = JSON.parse(window.localStorage.getItem("sp_custom_copy") || "{}");
    } catch (e) { /* ignore */ }

    var list = CMS_PAGES.filter(function (p) {
      if (cmsFilter === "all") return true;
      return p.category === cmsFilter;
    });

    tbody.innerHTML = list.map(function (p) {
      var copy = (SP.config && SP.config.COPY && SP.config.COPY[p.key]) || {};
      var isCustom = !!customCopy[p.key];
      var secCount = (copy.sections && copy.sections.length) || 0;
      var headline = (copy.title || "—").replace(/\n/g, " ");

      var statusBadge = isCustom
        ? '<span class="admin-badge admin-badge--success" style="background:rgba(16,185,129,0.12);color:#059669;border:1px solid rgba(16,185,129,0.25);">Customized</span>'
        : '<span class="admin-badge admin-badge--neutral">Default</span>';

      return (
        '<tr>' +
        '<td>' +
        '  <div style="font-weight:600;color:var(--adm-text);">' + SP.esc(p.name) + '</div>' +
        '  <div class="text-xs text-muted font-mono" style="margin-top:2px;">' + SP.esc(p.file) + '</div>' +
        '</td>' +
        '<td><span class="admin-badge admin-badge--info">' + SP.esc(p.category) + '</span></td>' +
        '<td>' +
        '  <div class="text-sm font-medium" style="max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="' + SP.esc(headline) + '">' +
        SP.esc(headline) +
        '  </div>' +
        '</td>' +
        '<td><span class="admin-badge admin-badge--neutral">' + secCount + ' section' + (secCount === 1 ? '' : 's') + '</span></td>' +
        '<td>' + statusBadge + '</td>' +
        '<td class="td-actions">' +
        '  <div class="adm-table-actions">' +
        '    <button class="btn btn--outline btn--xs" data-edit-page-cms="' + SP.esc(p.key) + '" style="display:inline-flex;align-items:center;gap:4px;">' +
        '      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>' +
        '      <span>Edit</span>' +
        '    </button>' +
        '    <a class="btn btn--outline btn--xs" href="' + SP.esc(p.file) + '" target="_blank" title="View live page in new tab" style="display:inline-flex;align-items:center;gap:4px;">' +
        '      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' +
        '      <span>Live</span>' +
        '    </a>' +
        '  </div>' +
        '</td>' +
        '</tr>'
      );
    }).join("");

    tbody.querySelectorAll("[data-edit-page-cms]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-edit-page-cms");
        openPageCmsModal(key);
      });
    });
  }

  function addCmsSectionCard(heading, paragraphs) {
    var container = document.getElementById("cms-sections-container");
    if (!container) return;

    var card = document.createElement("div");
    card.className = "cms-section-card";
    card.innerHTML =
      '<div class="cms-section-card__head">' +
      '  <strong class="text-xs cms-sec-number" style="text-transform:uppercase;letter-spacing:0.04em;">Section</strong>' +
      '  <button type="button" class="btn btn--outline btn--xs cms-remove-sec-btn" style="color:var(--adm-danger);border-color:rgba(239,68,68,0.25);padding:2px 8px;font-size:11px;">Remove</button>' +
      '</div>' +
      '<div class="adm-form-grid">' +
      '  <div class="adm-form-group adm-form-group--full">' +
      '    <label class="adm-label">Section Heading</label>' +
      '    <input type="text" class="adm-input cms-sec-h" placeholder="e.g. 01 · Background & Purpose">' +
      '  </div>' +
      '  <div class="adm-form-group adm-form-group--full">' +
      '    <label class="adm-label">Section Paragraphs <span class="text-xs text-muted" style="font-weight:normal;">(Separate multiple paragraphs with blank lines)</span></label>' +
      '    <textarea class="adm-textarea cms-sec-p" rows="3" placeholder="Enter paragraph copy here..."></textarea>' +
      '  </div>' +
      '</div>';

    card.querySelector(".cms-sec-h").value = heading || "";
    card.querySelector(".cms-sec-p").value = paragraphs || "";

    card.querySelector(".cms-remove-sec-btn").addEventListener("click", function () {
      card.remove();
      refreshCmsSectionNumbers();
    });

    container.appendChild(card);
    refreshCmsSectionNumbers();
  }

  function refreshCmsSectionNumbers() {
    var cards = document.querySelectorAll("#cms-sections-container .cms-section-card");
    cards.forEach(function (c, idx) {
      var numEl = c.querySelector(".cms-sec-number");
      if (numEl) numEl.textContent = "Section " + (idx + 1);
    });
  }

  function openPageCmsModal(pageKey) {
    var modal = document.getElementById("page-cms-modal");
    if (!modal) return;

    var page = CMS_PAGES.find(function (p) { return p.key === pageKey; });
    if (!page) return;

    var titleEl = document.getElementById("page-cms-title");
    var subtitleEl = document.getElementById("page-cms-subtitle");
    var keyInput = document.getElementById("cms-page-key");
    var eyebrowInput = document.getElementById("cms-eyebrow");
    var headlineInput = document.getElementById("cms-title");
    var leadInput = document.getElementById("cms-lead");
    var noteInput = document.getElementById("cms-note");

    if (titleEl) titleEl.textContent = "Edit " + page.name + " Content";
    if (subtitleEl) subtitleEl.textContent = "Target file: " + page.file + " · Category: " + page.category + " · " + page.desc;
    if (keyInput) keyInput.value = pageKey;

    var copy = (SP.config && SP.config.COPY && SP.config.COPY[pageKey]) || {};

    if (eyebrowInput) eyebrowInput.value = copy.eyebrow || "";
    if (headlineInput) headlineInput.value = copy.title || "";
    if (leadInput) leadInput.value = copy.lead || "";
    if (noteInput) noteInput.value = copy.placeholderNote || "";

    // Clear and build section cards
    var secContainer = document.getElementById("cms-sections-container");
    if (secContainer) {
      secContainer.innerHTML = "";
      if (copy.sections && copy.sections.length) {
        copy.sections.forEach(function (sec) {
          var pText = Array.isArray(sec.p) ? sec.p.join("\n\n") : (sec.p || "");
          addCmsSectionCard(sec.h, pText);
        });
      } else {
        addCmsSectionCard("", "");
      }
    }

    // CTA fields
    var cta = copy.cta || {};
    var ctaTitle = document.getElementById("cms-cta-title");
    var ctaLabel = document.getElementById("cms-cta-label");
    var ctaText = document.getElementById("cms-cta-text");
    var ctaHref = document.getElementById("cms-cta-href");

    if (ctaTitle) ctaTitle.value = cta.title || "";
    if (ctaLabel) ctaLabel.value = cta.label || "";
    if (ctaText) ctaText.value = cta.text || "";
    if (ctaHref) ctaHref.value = cta.href || "";

    openModal(modal);
  }

  function renderCmsGallery() {
    var grid = document.getElementById("cms-gallery-grid");
    var tabCount = document.getElementById("cms-gallery-tab-count");
    var gallery = (SP.config && SP.config.GALLERY) || [];
    if (tabCount) tabCount.textContent = String(gallery.length);
    if (!grid) return;

    if (!gallery.length) {
      grid.innerHTML = '<div class="text-center text-muted" style="grid-column: 1 / -1; padding: 3rem;">No photos in living archive yet. Click "+ Add Field Photo" above.</div>';
      return;
    }

    grid.innerHTML = gallery.map(function (item, idx) {
      var src = item.src || "";
      var caption = item.caption || "Field Photo";
      var category = item.category || "General Archive";

      return (
        '<div class="admin-card" style="margin:0; overflow:hidden; display:flex; flex-direction:column; border: 1px solid var(--adm-border);">' +
        '  <div style="position:relative; width:100%; height:160px; background:#F1F5F9; overflow:hidden;">' +
        '    <img src="' + SP.esc(src) + '" alt="' + SP.esc(caption) + '" style="width:100%; height:100%; object-fit:cover;" onerror="this.onerror=null;this.src=\'assets/logo-full.png\';">' +
        '    <span class="admin-badge admin-badge--info" style="position:absolute; top:8px; left:8px; background:rgba(6,27,46,0.85); color:#fff; backdrop-filter:blur(4px);">' + SP.esc(category) + '</span>' +
        '  </div>' +
        '  <div style="padding: 1rem; flex: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 0.75rem;">' +
        '    <div style="font-size: 0.88rem; font-weight: 600; color: #0F172A; line-height: 1.4;">' + SP.esc(caption) + '</div>' +
        '    <div style="display: flex; gap: 0.5rem; justify-content: flex-end; border-top: 1px solid #F1F5F9; padding-top: 0.65rem;">' +
        '      <button type="button" class="btn btn--outline btn--xs" data-edit-gal="' + idx + '">Edit</button>' +
        '      <button type="button" class="btn btn--outline btn--xs text-danger" data-del-gal="' + idx + '" style="color:var(--adm-danger); border-color:rgba(239,68,68,0.25);">Delete</button>' +
        '    </div>' +
        '  </div>' +
        '</div>'
      );
    }).join("");

    grid.querySelectorAll("[data-edit-gal]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = Number(btn.getAttribute("data-edit-gal"));
        openGalleryPhotoModal(idx);
      });
    });

    grid.querySelectorAll("[data-del-gal]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = Number(btn.getAttribute("data-del-gal"));
        if (!confirm("Are you sure you want to remove this photo from the living gallery?")) return;
        SP.config.GALLERY.splice(idx, 1);
        try {
          window.localStorage.setItem("sp_custom_gallery", JSON.stringify(SP.config.GALLERY));
        } catch (e) { /* ignore */ }
        toast("Photo removed from gallery.");
        renderCmsGallery();
      });
    });
  }

  function openGalleryPhotoModal(idx) {
    var modal = document.getElementById("gallery-photo-modal");
    if (!modal) return;

    var titleEl = document.getElementById("gallery-photo-modal-title");
    var idxInput = document.getElementById("gal-photo-index");
    var srcInput = document.getElementById("gal-photo-src");
    var preview = document.getElementById("gal-photo-preview");
    var placeholder = document.getElementById("gal-photo-preview-ph");
    var captionInput = document.getElementById("gal-photo-caption");
    var catSelect = document.getElementById("gal-photo-category");

    function updatePreview(src) {
      if (preview && placeholder) {
        if (src) {
          preview.src = src;
          preview.style.display = "block";
          placeholder.style.display = "none";
        } else {
          preview.src = "";
          preview.style.display = "none";
          placeholder.style.display = "block";
        }
      }
    }

    if (idx != null && SP.config.GALLERY && SP.config.GALLERY[idx]) {
      var item = SP.config.GALLERY[idx];
      if (titleEl) titleEl.textContent = "Edit Field Photo";
      if (idxInput) idxInput.value = String(idx);
      if (srcInput) srcInput.value = item.src || "";
      if (captionInput) captionInput.value = item.caption || "";
      if (catSelect && item.category) catSelect.value = item.category;
      updatePreview(item.src || "");
    } else {
      if (titleEl) titleEl.textContent = "Add Field Photo to Gallery";
      if (idxInput) idxInput.value = "";
      if (srcInput) srcInput.value = "";
      if (captionInput) captionInput.value = "";
      updatePreview("");
    }

    // Bind file picker once
    var galFile = document.getElementById("gal-photo-file");
    if (galFile && !galFile._bound) {
      galFile._bound = true;
      galFile.addEventListener("change", function () {
        var file = galFile.files && galFile.files[0];
        if (file) {
          var reader = new FileReader();
          reader.onload = function (e) {
            var dataUrl = e.target.result;
            if (srcInput) srcInput.value = dataUrl;
            updatePreview(dataUrl);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (srcInput && !srcInput._bound) {
      srcInput._bound = true;
      srcInput.addEventListener("input", function () {
        updatePreview(srcInput.value.trim());
      });
    }

    openModal(modal);
  }

  function bindCmsActions() {
    // CMS Sub-navigation Tabs switching
    document.querySelectorAll("[data-cms-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var targetTab = btn.getAttribute("data-cms-tab");
        document.querySelectorAll("[data-cms-tab]").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        document.querySelectorAll(".cms-tab-pane").forEach(function (pane) {
          var match = pane.id === "cms-pane-" + targetTab;
          pane.classList.toggle("is-active", match);
          pane.style.display = match ? "block" : "none";
        });
      });
    });

    // CMS Category Filter Pills
    document.querySelectorAll("[data-cms-filter]").forEach(function (pill) {
      pill.addEventListener("click", function () {
        document.querySelectorAll("[data-cms-filter]").forEach(function (p) {
          p.classList.remove("is-active");
        });
        pill.classList.add("is-active");
        cmsFilter = pill.getAttribute("data-cms-filter");
        renderCmsPages();
      });
    });

    // Add Section button in modal
    var addSecBtn = document.getElementById("cms-add-section-btn");
    if (addSecBtn) {
      addSecBtn.addEventListener("click", function () {
        addCmsSectionCard("", "");
      });
    }

    // Page CMS Form Submit (Save & Publish)
    var pageCmsForm = document.getElementById("page-cms-form");
    if (pageCmsForm) {
      pageCmsForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var pageKey = document.getElementById("cms-page-key").value;
        var page = CMS_PAGES.find(function (p) { return p.key === pageKey; });
        if (!page) return;

        var eyebrow = document.getElementById("cms-eyebrow").value.trim();
        var title = document.getElementById("cms-title").value.trim();
        var lead = document.getElementById("cms-lead").value.trim();
        var note = document.getElementById("cms-note").value.trim();

        var sections = [];
        var secCards = document.querySelectorAll("#cms-sections-container .cms-section-card");
        secCards.forEach(function (card) {
          var h = (card.querySelector(".cms-sec-h").value || "").trim();
          var pRaw = (card.querySelector(".cms-sec-p").value || "").trim();
          var pArr = pRaw.split("\n\n").map(function (s) { return s.trim(); }).filter(Boolean);
          if (h || pArr.length) {
            sections.push({ h: h, p: pArr });
          }
        });

        var ctaTitle = document.getElementById("cms-cta-title").value.trim();
        var ctaLabel = document.getElementById("cms-cta-label").value.trim();
        var ctaText = document.getElementById("cms-cta-text").value.trim();
        var ctaHref = document.getElementById("cms-cta-href").value.trim();

        var updatedCopy = {
          eyebrow: eyebrow,
          title: title,
          lead: lead,
          placeholderNote: note,
          sections: sections,
          cta: {
            title: ctaTitle,
            label: ctaLabel,
            text: ctaText,
            href: ctaHref
          }
        };

        if (!SP.config.COPY) SP.config.COPY = {};
        SP.config.COPY[pageKey] = Object.assign({}, SP.config.COPY[pageKey] || {}, updatedCopy);

        try {
          var customCopy = JSON.parse(window.localStorage.getItem("sp_custom_copy") || "{}");
          customCopy[pageKey] = updatedCopy;
          window.localStorage.setItem("sp_custom_copy", JSON.stringify(customCopy));
        } catch (err) {
          console.error("Failed to save custom copy to localStorage", err);
        }

        closeAllModals();
        toast("Content saved & published for " + page.name + "!");
        renderCmsPages();
      });
    }

    // Page CMS Reset to Default button
    var cmsResetBtn = document.getElementById("cms-reset-btn");
    if (cmsResetBtn) {
      cmsResetBtn.addEventListener("click", function () {
        var pageKey = document.getElementById("cms-page-key").value;
        var page = CMS_PAGES.find(function (p) { return p.key === pageKey; });
        if (!page) return;

        if (!confirm("Reset '" + page.name + "' to factory default content? This will discard your custom changes.")) return;

        try {
          var customCopy = JSON.parse(window.localStorage.getItem("sp_custom_copy") || "{}");
          delete customCopy[pageKey];
          window.localStorage.setItem("sp_custom_copy", JSON.stringify(customCopy));
        } catch (err) { /* ignore */ }

        var baseline = getBaselineCopy();
        if (baseline && baseline[pageKey]) {
          SP.config.COPY[pageKey] = JSON.parse(JSON.stringify(baseline[pageKey]));
        }

        closeAllModals();
        toast("'" + page.name + "' content restored to defaults.");
        renderCmsPages();
      });
    }

    // Foundation Info Form Submit
    var fdnForm = document.getElementById("foundation-info-form");
    if (fdnForm) {
      fdnForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = document.getElementById("fdn-name").value.trim();
        var addr1 = document.getElementById("fdn-addr1").value.trim();
        var addr2 = document.getElementById("fdn-addr2").value.trim();
        var gst = document.getElementById("fdn-gst").value.trim();
        var phone = document.getElementById("fdn-phone").value.trim();
        var whatsapp = document.getElementById("fdn-whatsapp").value.trim().replace(/\D/g, "");
        var email = document.getElementById("fdn-email").value.trim();
        var hours = document.getElementById("fdn-hours").value.trim();

        var fdnObj = {
          name: name,
          addressLines: [addr1, addr2],
          addressOneLine: addr1 + ", " + addr2,
          gst: gst,
          phone: phone,
          phoneTel: phone.replace(/\s+/g, ""),
          whatsapp: whatsapp,
          email: email,
          hours: hours
        };

        if (!SP.config.FOUNDATION) SP.config.FOUNDATION = {};
        Object.assign(SP.config.FOUNDATION, fdnObj);
        window.localStorage.setItem("sp_custom_foundation", JSON.stringify(fdnObj));
        toast("Headquarters & statutory details updated successfully.");
      });
    }

    // New Gallery Photo button
    var newGalBtn = document.getElementById("new-gallery-photo-btn");
    if (newGalBtn) {
      newGalBtn.addEventListener("click", function () {
        openGalleryPhotoModal(null);
      });
    }

    // Gallery Photo Form Submit
    var galForm = document.getElementById("gallery-photo-form");
    if (galForm) {
      galForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var idxVal = document.getElementById("gal-photo-index").value;
        var src = document.getElementById("gal-photo-src").value.trim();
        var caption = document.getElementById("gal-photo-caption").value.trim();
        var category = document.getElementById("gal-photo-category").value;

        if (!src || !caption) return;

        var photoObj = {
          src: src,
          caption: caption,
          category: category,
          tint: "--c-cat-office"
        };

        if (!SP.config.GALLERY) SP.config.GALLERY = [];

        if (idxVal !== "" && !isNaN(Number(idxVal))) {
          SP.config.GALLERY[Number(idxVal)] = photoObj;
          toast("Gallery photo updated successfully.");
        } else {
          SP.config.GALLERY.unshift(photoObj);
          toast("New photo added to Living Gallery!");
        }

        try {
          window.localStorage.setItem("sp_custom_gallery", JSON.stringify(SP.config.GALLERY));
        } catch (err) { /* ignore */ }

        closeAllModals();
        renderCmsGallery();
      });
    }

    // New Article button
    var newPostBtn = document.getElementById("new-post-btn");
    if (newPostBtn) {
      newPostBtn.addEventListener("click", function () {
        openArticleModal(null);
      });
    }

    // Article Form Submit
    var postForm = document.getElementById("article-form");
    if (postForm) {
      postForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var id = document.getElementById("post-id").value;
        var title = document.getElementById("post-title").value.trim();
        var cat = document.getElementById("post-category").value;
        var author = document.getElementById("post-author").value.trim();
        var role = document.getElementById("post-role").value.trim();
        var time = document.getElementById("post-readtime").value.trim();
        var excerpt = document.getElementById("post-excerpt").value.trim();
        var bodyRaw = document.getElementById("post-body").value.trim();

        var paragraphs = bodyRaw.split("\n\n").map(function (s) { return s.trim(); }).filter(Boolean);

        var article = {
          id: id || "post-" + Date.now(),
          title: title,
          category: cat,
          author: author,
          authorRole: role,
          readTime: time,
          excerpt: excerpt,
          content: paragraphs.length ? paragraphs : [excerpt],
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          featured: document.getElementById("post-featured").checked
        };

        if (SP.blog && SP.blog.savePost) {
          SP.blog.savePost(article);
          toast("Article published successfully.");
        }

        closeAllModals();
        renderCms();
        renderOverview();
      });
    }

    // Save Impact Metrics Form
    var impactForm = document.getElementById("impact-metrics-form");
    if (impactForm) {
      impactForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var data = {
          drives: document.getElementById("impact-drives").value,
          csr: document.getElementById("impact-csr").value,
          tedx: document.getElementById("impact-tedx").value,
          solar: document.getElementById("impact-solar").value
        };
        window.localStorage.setItem("sp_custom_impact", JSON.stringify(data));
        toast("Homepage impact counters updated successfully.");
      });
    }
  }

  function openArticleModal(id) {
    var modal = document.getElementById("article-modal");
    if (!modal) return;

    var titleEl = document.getElementById("article-modal-title");
    var idInput = document.getElementById("post-id");
    var titleInput = document.getElementById("post-title");
    var catInput = document.getElementById("post-category");
    var authorInput = document.getElementById("post-author");
    var roleInput = document.getElementById("post-role");
    var timeInput = document.getElementById("post-readtime");
    var excerptInput = document.getElementById("post-excerpt");
    var bodyInput = document.getElementById("post-body");
    var featInput = document.getElementById("post-featured");

    if (id) {
      var post = SP.blog.getPostBySlug(id);
      if (!post) return;
      titleEl.textContent = "Edit Article";
      idInput.value = post.id;
      titleInput.value = post.title;
      catInput.value = post.category;
      authorInput.value = post.author || "";
      roleInput.value = post.authorRole || "";
      timeInput.value = post.readTime || "5 min read";
      excerptInput.value = post.excerpt || "";
      bodyInput.value = Array.isArray(post.content) ? post.content.join("\n\n") : (post.content || "");
      featInput.checked = !!post.featured;
    } else {
      titleEl.textContent = "Compose New Field Story";
      idInput.value = "";
      titleInput.value = "";
      catInput.value = "River Conservation";
      authorInput.value = "SwachhataPukare Team";
      roleInput.value = "Field Operations";
      timeInput.value = "5 min read";
      excerptInput.value = "";
      bodyInput.value = "";
      featInput.checked = false;
    }

    openModal(modal);
  }

  /* ==================================================== 5. ENQUIRIES PANEL */
  function renderEnquiries() {
    var general = (SP.store && SP.store.getEnquiries && SP.store.getEnquiries()) || [];
    var bulk = (SP.store && SP.store.getBulkEnquiries && SP.store.getBulkEnquiries()) || [];

    // Combine both streams
    var combined = [];
    general.forEach(function (g) {
      combined.push({
        type: "General Enquiry",
        id: g.id,
        date: g.at,
        name: (g.data && g.data.name) || "Customer",
        email: (g.data && g.data.email) || "",
        phone: (g.data && g.data.phone) || "",
        details: (g.data && g.data.message) || (g.data && g.data.topic) || "General Query",
        status: g.status || "New"
      });
    });
    bulk.forEach(function (b) {
      combined.push({
        type: "Corporate Bulk",
        id: b.ref,
        date: b.at,
        name: (b.data && b.data.name) || (b.data && b.data.org) || "Corporate",
        email: (b.data && b.data.email) || "",
        phone: (b.data && b.data.phone) || "",
        details: (b.data && b.data.org ? b.data.org + " • " : "") + ((b.data && b.data.notes) || "Bulk requirement"),
        status: b.status || "New"
      });
    });

    var countEl = document.getElementById("enquiries-count");
    if (countEl) countEl.textContent = String(combined.length);

    var tbody = document.getElementById("enquiries-table-body");
    if (!tbody) return;

    if (!combined.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted" style="padding: 3rem;">No customer enquiries or corporate requests yet.</td></tr>';
      return;
    }

    tbody.innerHTML = combined.map(function (item) {
      return (
        '<tr>' +
        '<td><span class="admin-badge admin-badge--' + (item.type.indexOf("Bulk") !== -1 ? "warning" : "info") + '">' + SP.esc(item.type) + '</span></td>' +
        '<td><strong class="font-mono">' + SP.esc(item.id) + '</strong></td>' +
        '<td><strong>' + SP.esc(item.name) + '</strong><br><span class="text-xs text-muted">' + SP.esc(item.email) + '</span></td>' +
        '<td>' + SP.esc(item.phone || "—") + '</td>' +
        '<td><span class="text-sm">' + SP.esc(item.details.slice(0, 75)) + (item.details.length > 75 ? "..." : "") + '</span></td>' +
        '<td><span class="admin-badge admin-badge--' + (item.status === "Closed" ? "muted" : "success") + '">' + SP.esc(item.status) + '</span></td>' +
        '<td class="td-actions">' +
        '<div class="adm-table-actions">' +
        '<button class="btn btn--outline btn--xs" data-toggle-enquiry="' + SP.esc(item.id) + '" data-type="' + SP.esc(item.type) + '" style="white-space:nowrap;">' +
        (item.status === "Closed" ? "Re-open" : "Mark Closed") +
        '</button>' +
        '</div>' +
        '</td>' +
        '</tr>'
      );
    }).join("");

    tbody.querySelectorAll("[data-toggle-enquiry]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-toggle-enquiry");
        var type = btn.getAttribute("data-type");
        var isBulk = type.indexOf("Bulk") !== -1;
        var newStatus = btn.textContent.indexOf("Closed") !== -1 ? "Closed" : "In Progress";
        if (isBulk && SP.store.updateBulkEnquiry) {
          SP.store.updateBulkEnquiry(id, { status: newStatus });
        } else if (SP.store.updateEnquiry) {
          SP.store.updateEnquiry(id, { status: newStatus });
        }
        toast("Enquiry " + id + " marked as " + newStatus);
        renderEnquiries();
        renderOverview();
      });
    });
  }

  function bindEnquiryActions() {
    // Quick lead actions if needed
  }

  /* ======================================================= 6. BACKUP PANEL */
  function bindBackupActions() {
    // Export complete backup
    var downloadBtn = document.getElementById("backup-download-btn");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", function () {
        var dump = {
          timestamp: new Date().toISOString(),
          orders: SP.store ? SP.store.getOrders() : [],
          custom_products: JSON.parse(window.localStorage.getItem("sp_custom_products") || "[]"),
          custom_impact: JSON.parse(window.localStorage.getItem("sp_custom_impact") || "{}"),
          blog_posts: JSON.parse(window.localStorage.getItem("sp_blog_posts") || "[]"),
          custom_copy: JSON.parse(window.localStorage.getItem("sp_custom_copy") || "{}"),
          custom_foundation: JSON.parse(window.localStorage.getItem("sp_custom_foundation") || "{}"),
          custom_categories: JSON.parse(window.localStorage.getItem("sp_custom_categories") || "[]"),
          gallery_photos: (SP.config && SP.config.GALLERY) || [],
          enquiries: SP.store ? SP.store.getEnquiries() : [],
          bulk_enquiries: SP.store ? SP.store.getBulkEnquiries() : []
        };
        var jsonStr = JSON.stringify(dump, null, 2);
        downloadBlob(jsonStr, "swachhatapukare_backup_" + new Date().toISOString().slice(0, 10) + ".json", "application/json");
        toast("Full backup archive downloaded.");
      });
    }

    // Seed Demo Data button
    var seedBtn = document.getElementById("backup-seed-btn");
    if (seedBtn) {
      seedBtn.addEventListener("click", function () {
        if (!confirm("This will load demo orders and customer leads for testing. Proceed?")) return;
        seedDemoData();
        toast("Demo store and billing data loaded successfully.");
        renderOverview();
        renderOrders();
        renderEnquiries();
      });
    }
  }

  function seedDemoData() {
    var demoOrders = [
      {
        id: "SPF-20261024-0012",
        placedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        items: [
          { id: 1, sku: "SP-OE-001", name: "File-Folder", category: "Office Essentials", qty: 4, unit: 180, lineTotal: 720 },
          { id: 2, sku: "SP-OE-002", name: "Note Book", category: "Office Essentials", qty: 2, unit: 220, lineTotal: 440 }
        ],
        subtotal: 1160,
        shipping: 0,
        total: 1160,
        status: "processing",
        payment: { method: "upi", status: "paid" },
        customer: { name: "Ananya Sharma", email: "ananya.s@tatasteel.com", phone: "+91 98351 22440" },
        address: { line1: "Flat 4B, Circuit House Area", city: "Jamshedpur", state: "Jharkhand", pincode: "831001" }
      },
      {
        id: "SPF-20261022-0009",
        placedAt: new Date(Date.now() - 3600000 * 96).toISOString(),
        items: [
          { id: 3, sku: "SP-OE-003", name: "Writing Pad", category: "Office Essentials", qty: 10, unit: 150, lineTotal: 1500 }
        ],
        subtotal: 1500,
        shipping: 0,
        total: 1500,
        status: "delivered",
        payment: { method: "cod", status: "paid" },
        customer: { name: "Rajesh Murmu", email: "rajesh.murmu@gmail.com", phone: "+91 94311 88720" },
        address: { line1: "Plot 12, Bistupur Main Road", city: "Jamshedpur", state: "Jharkhand", pincode: "831001" }
      }
    ];

    var demoBulk = [
      {
        ref: "SPB-20261025-0004",
        at: new Date(Date.now() - 3600000 * 24).toISOString(),
        data: {
          name: "Siddharth Sen",
          org: "Tata Motors CSR Wing",
          email: "ssen@tatamotors.com",
          phone: "+91 99343 11200",
          notes: "Need 250 units of conference file folders and desk organizers for upcoming sustainability summit."
        },
        status: "New"
      }
    ];

    try {
      window.localStorage.setItem("sp_orders", JSON.stringify(demoOrders));
      window.localStorage.setItem("sp_bulk_enquiries", JSON.stringify(demoBulk));
    } catch (e) { /* ignore */ }
  }

  /* ============================================================== UTILITIES */
  function openModal(modal) {
    if (!modal) return;
    modal.hidden = false;
    modal.classList.add("is-open");
    modal.style.display = "flex";
    document.body.classList.add("modal-open");
  }

  function closeAllModals() {
    document.querySelectorAll(".admin-modal-backdrop").forEach(function (m) {
      m.hidden = true;
      m.classList.remove("is-open");
      m.style.display = "none";
    });
    document.body.classList.remove("modal-open");
  }

  function getStatusBadgeClass(status) {
    status = (status || "").toLowerCase();
    if (status === "delivered" || status === "completed") return "success";
    if (status === "shipped") return "info";
    if (status === "processing" || status === "pending") return "warning";
    if (status === "cancelled") return "danger";
    return "muted";
  }

  function toast(message, type) {
    var el = document.getElementById("admin-toast");
    if (!el) return;
    el.textContent = message;
    el.style.borderLeft = type === "error" ? "4px solid var(--adm-danger)" : "4px solid var(--adm-success)";
    el.classList.add("is-visible");
    setTimeout(function () {
      el.classList.remove("is-visible");
    }, 3200);
  }

  function downloadBlob(content, filename, contentType) {
    var blob = new Blob([content], { type: contentType });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  document.addEventListener("DOMContentLoaded", init);

})(window.SP);

