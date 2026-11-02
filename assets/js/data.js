/* data.js — the catalogue.
   Mirrors the shape of a WooCommerce product export so a real store can drop in later.
   Prices are in INR and EXCLUDE print and courier charges. */

window.SP = window.SP || {};

SP.products = [
  {
    id: 1,
    sku: "SP-OE-001",
    slug: "file-folder",
    name: "File-Folder",
    category: "Office Essentials",
    short_description: "Handwoven file folder for everyday papers and documents.",
    description:
      "A handwoven file folder sized for everyday papers at work, college or home. Made from water hyacinth, so the weave and tone vary gently from piece to piece. Sits flat in a drawer or bag.",
    price: 180,
    variants: [],
    dimensions: '12.5" x 9"',
    tags: ["Water Hyacinth"],
    stock_status: "instock",
    featured: true
  },
  {
    id: 2,
    sku: "SP-OE-002",
    slug: "note-book",
    name: "Note Book",
    category: "Office Essentials",
    short_description: "Handcrafted notebook with a woven water hyacinth cover.",
    description:
      "A handcrafted notebook with a woven water hyacinth cover. Compact size that slips into a bag, ready for meeting notes, lists and ideas.",
    price: 220,
    variants: [],
    dimensions: '8" x 5"',
    tags: ["Water Hyacinth"],
    stock_status: "instock",
    featured: false
  },
  {
    id: 3,
    sku: "SP-OE-003",
    slug: "writing-pad",
    name: "Writing Pad",
    category: "Office Essentials",
    short_description: "Handcrafted writing pad for notes and lists.",
    description:
      "A handcrafted writing pad for daily notes, lists and reminders. A practical size for a desk drawer or a bedside table.",
    price: 120,
    variants: [],
    dimensions: '7.5" x 4.5"',
    tags: [],
    stock_status: "instock",
    featured: false
  },
  {
    id: 4,
    sku: "SP-OE-004",
    slug: "slip-box",
    name: "Slip Box",
    category: "Office Essentials",
    short_description: "Handcrafted slip box for cards and small keepsakes.",
    description:
      "A slim handcrafted box that holds cards, slips, receipts and small keepsakes. The lid slips on cleanly, keeping contents dust-free.",
    price: 180,
    variants: [],
    dimensions: '5.5" x 5.5" x 1.15"',
    tags: [],
    stock_status: "instock",
    featured: false
  },
  {
    id: 5,
    sku: "SP-OE-005",
    slug: "slip-pad",
    name: "Slip Pad",
    category: "Office Essentials",
    short_description: "Handcrafted slip pad. Size available on request.",
    description:
      "A handcrafted slip pad for short notes and message slips. Dimensions are still to be confirmed — ask us and we will send the exact size.",
    price: 240,
    variants: [],
    dimensions: "",
    tags: [],
    stock_status: "instock",
    featured: false
  },
  {
    id: 6,
    sku: "SP-DC-001",
    slug: "pen-stand",
    name: "Pen-stand",
    category: "Desk Collection",
    short_description: "Handcrafted pen stand in two designs, both at the same price.",
    description:
      "A handcrafted pen stand that keeps pens, pencils and scissors upright on a desk. Choose between two designs — the overall size is still to be confirmed, ask us for details.",
    price: 100,
    variants: [
      { id: "pen-stand-angular", name: "Angular design", price: 100 },
      { id: "pen-stand-hexagonal", name: "Hexagonal design", price: 100 }
    ],
    dimensions: "",
    tags: [],
    stock_status: "instock",
    featured: false
  },
  {
    id: 7,
    sku: "SP-HU-001",
    slug: "utility-box",
    name: "Utility Box",
    category: "Home & Utility",
    short_description: "Handcrafted box for odds and ends around the house.",
    description:
      "A handy handcrafted box for keys, threads, chargers and other odds and ends. Squares away neatly on a shelf or inside a cupboard.",
    price: 200,
    variants: [],
    dimensions: '5" x 5" x 2.5"',
    tags: [],
    stock_status: "instock",
    featured: true
  },
  {
    id: 8,
    sku: "SP-HU-002",
    slug: "photo-frame",
    name: "Photo Frame",
    category: "Home & Utility",
    short_description: "Handcrafted photo frame for a 6 x 4 inch photograph.",
    description:
      "A handcrafted frame that holds a standard 6 x 4 inch photograph. Sits on a table or shelf, or leans against a wall.",
    price: 150,
    variants: [],
    dimensions: '6" x 4"',
    tags: [],
    stock_status: "instock",
    featured: false
  },
  {
    id: 9,
    sku: "SP-TB-001",
    slug: "coaster-set",
    name: "Coaster Set",
    category: "Tabletop",
    short_description: "Set of four handwoven coasters made from water hyacinth.",
    description:
      "A set of four handwoven coasters, each four inches across, made from water hyacinth. Protects tables from cups and glasses while looking good doing it.",
    price: 380,
    variants: [],
    dimensions: '4" x 4", 4 pcs',
    tags: ["Water Hyacinth"],
    stock_status: "instock",
    featured: true
  },
  {
    id: 10,
    sku: "SP-HU-003",
    slug: "tray",
    name: "Tray",
    category: "Home & Utility",
    short_description: "Handcrafted tray for serving and organising. Size on request.",
    description:
      "A handcrafted tray for serving tea or corralling things on a table. The exact size is still to be confirmed — ask us and we will share it.",
    price: 299,
    variants: [],
    dimensions: "",
    tags: [],
    stock_status: "instock",
    featured: false
  },
  {
    id: 11,
    sku: "SP-HU-004",
    slug: "tea-box",
    name: "Tea Box",
    category: "Home & Utility",
    short_description: "Handcrafted tea box woven from water hyacinth.",
    description:
      "A handcrafted box for tea bags and small packets, woven from water hyacinth. Keeps the kitchen shelf tidy and easy to reach.",
    price: 180,
    variants: [],
    dimensions: "",
    tags: ["Water Hyacinth"],
    stock_status: "instock",
    featured: true
  },
  {
    id: 12,
    sku: "SP-HC-001",
    slug: "dokra-photo-frame",
    name: "Dokra Photo Frame",
    category: "Heritage Collection",
    short_description: "Photo frame carrying the traditional Dokra craft.",
    description:
      "A photo frame from the Heritage Collection built around Dokra — a traditional lost-wax metal-casting craft. A piece of living craft for a 7 x 7 inch photograph.",
    price: 830,
    variants: [],
    dimensions: '7" x 7"',
    tags: ["Heritage"],
    stock_status: "instock",
    featured: true
  },
  {
    id: 13,
    sku: "SP-LT-001",
    slug: "ecoblossom-lampshade",
    name: "EcoBlossom Lampshade",
    category: "Lighting",
    short_description: "Hyacinth made lampshade with natural dry flower.",
    description:
      "A hyacinth made lampshade with a natural dry flower set into it. Two sizes are offered, so pick the one that suits your light and your room.",
    price: 750,
    variants: [
      { id: "ecoblossom-standard", name: "Standard size", price: 750 },
      { id: "ecoblossom-large", name: "Large size", price: 1050 }
    ],
    dimensions: "",
    tags: ["Water Hyacinth"],
    stock_status: "instock",
    featured: true
  }
];

/* ---------------------------------------------------------------- lookups */
SP.getProduct = function (slug) {
  return SP.products.filter(function (p) { return p.slug === slug; })[0] || null;
};

SP.getProductById = function (id) {
  return SP.products.filter(function (p) { return p.id === Number(id); })[0] || null;
};

SP.categories = function () {
  var base = (SP.config && SP.config.CATEGORIES) ? SP.config.CATEGORIES.slice() : [];
  try {
    var custom = JSON.parse(window.localStorage.getItem("sp_custom_categories") || "[]");
    if (Array.isArray(custom)) {
      custom.forEach(function (c) {
        if (!base.some(function (b) { return b.name === c.name || b.slug === c.slug; })) {
          base.push(c);
        }
      });
    }
  } catch (e) { /* ignore */ }
  return base;
};

SP.categoryCount = function (name) {
  return SP.products.filter(function (p) { return p.category === name; }).length;
};

SP.featuredProducts = function () {
  return SP.products.filter(function (p) { return p.featured; });
};

SP.hasVariant = function (product) {
  return Array.isArray(product.variants) && product.variants.length > 1;
};

SP.minPrice = function (product) {
  if (SP.hasVariant(product)) {
    return product.variants.reduce(function (min, v) {
      return Math.min(min, v.price);
    }, Infinity);
  }
  return product.price;
};

SP.relatedProducts = function (product, limit) {
  limit = limit || 4;
  var same = SP.products.filter(function (p) {
    return p.slug !== product.slug && p.category === product.category;
  });
  var others = SP.products.filter(function (p) {
    return p.slug !== product.slug && p.category !== product.category;
  });
  return same.concat(others).slice(0, limit);
};

/* Merge custom products/inventory overrides saved from Admin Panel */
try {
  var customProds = JSON.parse(window.localStorage.getItem("sp_custom_products") || "[]");
  if (Array.isArray(customProds) && customProds.length) {
    customProds.forEach(function (cp) {
      var idx = SP.products.findIndex(function (p) { return p.id === cp.id || p.sku === cp.sku; });
      if (idx !== -1) SP.products[idx] = Object.assign({}, SP.products[idx], cp);
      else SP.products.push(cp);
    });
  }
} catch (e) { /* ignore */ }
