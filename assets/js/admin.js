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

  /* ==================================================== 3. INVENTORY PANEL */
  function renderInventory() {
    var products = SP.products || [];
    var filtered = products.filter(function (p) {
      if (inventoryFilter === "low") return (p.stock_qty != null && p.stock_qty <= 5);
      if (inventoryFilter === "out") return (p.stock_status === "outofstock" || p.stock_qty === 0);
      return true;
    });

    var countEl = document.getElementById("inventory-count");
    if (countEl) countEl.textContent = String(filtered.length);

    var tbody = document.getElementById("inventory-table-body");
    if (!tbody) return;

    tbody.innerHTML = filtered.map(function (prod) {
      var qty = prod.stock_qty != null ? prod.stock_qty : 25; // default healthy stock
      var isLow = qty <= 5 && qty > 0;
      var isOut = qty <= 0 || prod.stock_status === "outofstock";
      var badgeClass = isOut ? "danger" : (isLow ? "warning" : "success");
      var badgeLabel = isOut ? "Out of Stock" : (isLow ? "Low Stock (" + qty + ")" : "In Stock (" + qty + ")");

      return (
        '<tr>' +
        '<td><strong class="font-mono">' + SP.esc(prod.sku) + '</strong></td>' +
        '<td><strong>' + SP.esc(prod.name) + '</strong></td>' +
        '<td><span class="admin-badge admin-badge--muted">' + SP.esc(prod.category) + '</span></td>' +
        '<td><strong>₹' + prod.price + '</strong></td>' +
        '<td>' +
        '<div style="display:inline-flex;align-items:center;gap:0.4rem;">' +
        '<button class="btn btn--outline btn--xs" data-stock-mod="' + prod.id + '" data-delta="-1" aria-label="Decrease stock">-</button>' +
        '<span style="min-width: 2rem; text-align: center; font-weight: 600;">' + qty + '</span>' +
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

    // Add Product Button
    var addBtn = document.getElementById("add-product-btn");
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        openProductModal(null);
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
            featured: false,
            tags: ["Handcrafted", "Water Hyacinth"]
          };
          SP.products.push(newProd);
          persistProductChange(newProd);
          toast("New product added to catalog.");
        }

        closeAllModals();
        renderInventory();
        renderOverview();
      });
    }
  }

  function openProductModal(prodId) {
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

    if (prodId) {
      var prod = SP.products.find(function (p) { return p.id === prodId; });
      if (!prod) return;
      titleEl.textContent = "Edit Product: " + prod.name;
      idInput.value = prod.id;
      skuInput.value = prod.sku;
      nameInput.value = prod.name;
      catInput.value = prod.category;
      priceInput.value = prod.price;
      stockInput.value = prod.stock_qty != null ? prod.stock_qty : 25;
      dimInput.value = prod.dimensions || "";
      descInput.value = prod.description || "";
    } else {
      titleEl.textContent = "Add New Handcrafted Product";
      idInput.value = "";
      skuInput.value = "SP-OE-" + Math.floor(100 + Math.random() * 900);
      nameInput.value = "";
      catInput.value = "Office Essentials";
      priceInput.value = 250;
      stockInput.value = 20;
      dimInput.value = '10" x 8"';
      descInput.value = "";
    }

    openModal(modal);
  }

  /* ========================================================== 4. CMS PANEL */
  function renderCms() {
    // 1. Blog posts table
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

    // 2. Load custom impact metrics if stored
    try {
      var savedImpact = JSON.parse(window.localStorage.getItem("sp_custom_impact") || "null");
      if (savedImpact) {
        if (savedImpact.drives) document.getElementById("impact-drives").value = savedImpact.drives;
        if (savedImpact.csr) document.getElementById("impact-csr").value = savedImpact.csr;
        if (savedImpact.tedx) document.getElementById("impact-tedx").value = savedImpact.tedx;
        if (savedImpact.solar) document.getElementById("impact-solar").value = savedImpact.solar;
      }
    } catch (e) { /* ignore */ }
  }

  function bindCmsActions() {
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
  }

  function closeAllModals() {
    document.querySelectorAll(".admin-modal-backdrop").forEach(function (m) {
      m.hidden = true;
      m.classList.remove("is-open");
      m.style.display = "none";
    });
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

