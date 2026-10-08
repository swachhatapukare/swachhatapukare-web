/* config.js — every site-wide constant lives here.
   Anything marked TODO is a placeholder that must be replaced before launch. */

window.SP = window.SP || {};

SP.config = {
  /* ------------------------------------------------------------------ brand */
  SITE_NAME: "SwachhataPukare Foundation",
  SITE_SHORT: "SwachhataPukare",
  TAGLINE: "Crafted for everyday use.",
  CATALOGUE_INTRO: "Handcrafted pieces from the Foundation's own catalogue.",
  LOGO_PATH: "assets/logo.png", // optional photo logo; falls back to the SVG wordmark

  FOUNDATION: {
    name: "SwachhataPukare Foundation",
    addressLines: [
      "HIG-276, Ward No-15, Near Bank Of Baroda",
      "Adityapur, Jamshedpur, Jharkhand 831013"
    ],
    addressOneLine:
      "HIG-276, Ward No-15, Near Bank Of Baroda, Adityapur, Jamshedpur, Jharkhand 831013",
    gst: "20ABHCS8922N1ZZ",
    // TODO: replace with the Foundation's real WhatsApp Business number (country code + number, digits only)
    whatsapp: "919999999999",
    // TODO: replace with the real enquiry email address
    email: "hello@example.org",
    // TODO: replace with the Foundation's confirmed working hours
    hours: "Monday – Saturday, 10:00 – 18:00 (placeholder — to be confirmed)"
  },

  /* --------------------------------------------------------- demo behaviour */
  // Set to false to hide the top "demo preview" strip on every page.
  SHOW_DEMO_BANNER: true,
  OPEN_MINI_CART_ON_ADD: true,

  /* ------------------------------------------------------------------ money */
  CURRENCY: "INR",
  // Courier/fulfilment is quoted separately — product prices never include it.
  SHIPPING_FLAT: 79, // TODO: confirm real courier rate
  FREE_SHIPPING_ABOVE: 999, // TODO: confirm real free-shipping threshold
  COD_MAX: 5000, // orders above this cannot be paid Cash on Delivery // TODO: confirm
  // TODO: confirm the GST percentage the Foundation charges
  DEMO_GST_PERCENT: 5,
  COUPONS: {
    SWACHH10: { type: "percent", value: 10, label: "10% off" }
  },

  /* ----------------------------------------------------------------- impact */
  // TODO: placeholder numbers — replace with the Foundation's verified figures.
  IMPACT: [
    { value: 25, suffix: "", label: "River cleaning drives", placeholder: true },
    { value: 400, suffix: "+", label: "Volunteers engaged", placeholder: true },
    { value: 5, suffix: "", label: "Areas of work", placeholder: false },
    { value: 3, suffix: "", label: "Partners", placeholder: false }
  ],

  PARTNERS: ["Tata Steel", "Tata Communications", "NTPC"],

  /* ------------------------------------------------------------ testimonials */
  // TODO: placeholder quotes — replace with testimonials approved by the Foundation.
  TESTIMONIALS: [
    {
      quote:
        "The file folders and notebook arrived neatly packed. The weave feels lovely to hold and looks smart on a work desk.",
      author: "Placeholder name",
      role: "Placeholder role — to be confirmed"
    },
    {
      quote:
        "We gifted the coaster set to a visiting team. People kept asking where it came from.",
      author: "Placeholder name",
      role: "Placeholder role — to be confirmed"
    },
    {
      quote:
        "Good communication and a thoughtful range of everyday pieces. Looking forward to the next collection.",
      author: "Placeholder name",
      role: "Placeholder role — to be confirmed"
    }
  ],

  /* --------------------------------------------------------------- categories */
  CATEGORIES: [
    { name: "Office Essentials", slug: "office-essentials", tint: "--c-cat-office" },
    { name: "Desk Collection", slug: "desk-collection", tint: "--c-cat-desk" },
    { name: "Home & Utility", slug: "home-utility", tint: "--c-cat-home" },
    { name: "Tabletop", slug: "tabletop", tint: "--c-cat-tabletop" },
    { name: "Heritage Collection", slug: "heritage-collection", tint: "--c-cat-heritage" },
    { name: "Lighting", slug: "lighting", tint: "--c-cat-lighting" }
  ],

  /* ------------------------------------------------------------------ nav */
  WHAT_WE_DO: [
    {
      slug: "water-hyacinth",
      href: "water-hyacinth.html",
      title: "Water Hyacinth",
      desc: "An aquatic weed turned into handcraft raw material."
    },
    {
      slug: "river-cleaning",
      href: "river-cleaning.html",
      title: "River Cleaning",
      desc: "Cleaning drives along rivers and drains."
    },
    {
      slug: "tedxbistupur",
      href: "tedxbistupur.html",
      title: "TEDxBistupur",
      desc: "Ideas worth spreading, from Bistupur."
    },
    {
      slug: "solar-power",
      href: "solar-power.html",
      title: "Solar Power",
      desc: "Work on solar energy initiatives."
    },
    {
      slug: "sewage-treatment",
      href: "sewage-treatment.html",
      title: "Sewage Treatment",
      desc: "Sewage treatment plant work."
    }
  ],

  /* ------------------------------------------------- page copy (About + WWD) */
  // TODO: every block below is placeholder copy. Replace with the Foundation's
  // own approved words before this site goes live.
  COPY: {
    about: {
      eyebrow: "About the Foundation",
      title: "About SwachhataPukare Foundation",
      lead:
        "SwachhataPukare Foundation is based in Adityapur, Jamshedpur, and works on environmental and civic initiatives: river cleaning drives, water hyacinth, TEDxBistupur, solar power and sewage treatment.",
      placeholderNote:
        "Placeholder copy — pending the Foundation's approved text (see config.js).",
      sections: [
        {
          h: "Who we are",
          p: [
            "The Foundation brings together volunteers, partners and craftspeople around clean-up, conservation and craft. Its work spans river cleaning drives, projects around water hyacinth, the TEDxBistupur event, solar power and sewage treatment.",
            "Placeholder paragraph — replace with the Foundation's own story, formation details and team."
          ]
        },
        {
          h: "Where we work",
          p: [
            "Head office: HIG-276, Ward No-15, Near Bank Of Baroda, Adityapur, Jamshedpur, Jharkhand 831013.",
            "Placeholder paragraph — replace with the areas, rivers and communities the Foundation serves."
          ]
        },
        {
          h: "What we sell",
          p: [
            "The online shop lists only the Foundation's own handcrafted products — pieces made for everyday use, including work from water hyacinth where the material is genuinely used.",
            "Placeholder paragraph — replace with the making process, the artisans involved and how sale proceeds support the Foundation's work."
          ]
        }
      ]
    },

    "water-hyacinth": {
      eyebrow: "What we do",
      title: "Water Hyacinth",
      lead:
        "The Foundation works with water hyacinth — an invasive aquatic plant — as a raw material for handcrafted products.",
      placeholderNote:
        "Placeholder copy — pending the Foundation's approved text (see config.js).",
      sections: [
        {
          h: "The plant",
          p: [
            "Water hyacinth grows quickly in water bodies and, left unchecked, chokes them. The Foundation works with it as a resource rather than only as waste.",
            "Placeholder paragraph — replace with the actual sites, quantities and method."
          ]
        },
        {
          h: "From weed to weave",
          p: [
            "Harvested stems are prepared and woven into everyday pieces that appear in the catalogue tagged Water Hyacinth.",
            "Placeholder paragraph — replace with the real processing and craft steps, and credit the makers."
          ]
        },
        {
          h: "Why it matters",
          p: [
            "Using the plant gives a waste material a second life and supports the craft around it.",
            "Placeholder paragraph — replace with verified environmental and community impact."
          ]
        }
      ],
      cta: {
        title: "See what it becomes",
        text: "Browse the products genuinely made from water hyacinth.",
        label: "Shop the catalogue",
        href: "shop.html?tag=water-hyacinth"
      }
    },

    "river-cleaning": {
      eyebrow: "What we do",
      title: "River Cleaning Drives",
      lead: "The Foundation runs river cleaning drives.",
      placeholderNote:
        "Placeholder copy — pending the Foundation's approved text (see config.js).",
      sections: [
        {
          h: "The work",
          p: [
            "Volunteers and partners take part in cleaning drives along rivers and drains.",
            "Placeholder paragraph — replace with the rivers, schedule, frequency and how to join."
          ]
        },
        {
          h: "How to take part",
          p: [
            "Get in touch to volunteer or to sponsor a drive.",
            "Placeholder paragraph — replace with the real sign-up process and contact person."
          ]
        }
      ],
      cta: {
        title: "Support a drive",
        text: "Donations help fund equipment, transport and disposal for cleaning drives.",
        label: "Donate",
        href: "donate.html"
      }
    },

    tedxbistupur: {
      eyebrow: "What we do",
      title: "TEDxBistupur",
      lead: "The Foundation is involved with TEDxBistupur.",
      placeholderNote:
        "Placeholder copy — pending the Foundation's approved text (see config.js).",
      sections: [
        {
          h: "About the event",
          p: [
            "TEDxBistupur is a locally organised TEDx event sharing ideas worth spreading.",
            "Placeholder paragraph — replace with the event's history, dates, speakers and how the Foundation is involved."
          ]
        },
        {
          h: "Get involved",
          p: [
            "Contact the Foundation for speaker nominations, volunteering and partnership details.",
            "Placeholder paragraph — replace with the real participation process."
          ]
        }
      ],
      cta: {
        title: "Talk to us",
        text: "Ask about speaking, volunteering or partnering with TEDxBistupur.",
        label: "Contact",
        href: "contact.html"
      }
    },

    "solar-power": {
      eyebrow: "What we do",
      title: "Solar Power",
      lead: "The Foundation works on solar power initiatives.",
      placeholderNote:
        "Placeholder copy — pending the Foundation's approved text (see config.js).",
      sections: [
        {
          h: "The work",
          p: [
            "Work on solar power forms one of the Foundation's focus areas.",
            "Placeholder paragraph — replace with real project sites, capacity and outcomes."
          ]
        },
        {
          h: "Why solar",
          p: [
            "Clean energy reduces running costs and emissions over the life of an installation.",
            "Placeholder paragraph — replace with the Foundation's own reasoning and results."
          ]
        }
      ],
      cta: {
        title: "Partner with us",
        text: "Talk to the Foundation about solar and sustainability projects.",
        label: "Get in touch",
        href: "contact.html"
      }
    },

    "sewage-treatment": {
      eyebrow: "What we do",
      title: "Sewage Treatment Plant",
      lead: "The Foundation works on a sewage treatment plant.",
      placeholderNote:
        "Placeholder copy — pending the Foundation's approved text (see config.js).",
      sections: [
        {
          h: "The work",
          p: [
            "Sewage treatment is one of the Foundation's stated areas of work.",
            "Placeholder paragraph — replace with the plant's location, capacity, technology and status."
          ]
        },
        {
          h: "Why it matters",
          p: [
            "Treating sewage before it reaches water bodies keeps rivers cleaner downstream.",
            "Placeholder paragraph — replace with verified outcomes and data."
          ]
        }
      ],
      cta: {
        title: "Support this work",
        text: "Every contribution helps the Foundation continue its environmental work.",
        label: "Donate",
        href: "donate.html"
      }
    }
  },

  /* ---------------------------------------------------------------- gallery */
  // TODO: placeholder captions and image paths — swap in real photographs.
  GALLERY: [
    { src: "assets/gallery/river-drive-1.jpg", caption: "River cleaning drive — photo pending", tint: "--c-cat-office" },
    { src: "assets/gallery/river-drive-2.jpg", caption: "River cleaning drive — photo pending", tint: "--c-cat-desk" },
    { src: "assets/gallery/harvest-1.jpg", caption: "Water hyacinth — photo pending", tint: "--c-cat-home" },
    { src: "assets/gallery/weaving-1.jpg", caption: "Weaving — photo pending", tint: "--c-cat-tabletop" },
    { src: "assets/gallery/office-1.jpg", caption: "Office essentials — photo pending", tint: "--c-cat-office" },
    { src: "assets/gallery/desk-1.jpg", caption: "Desk collection — photo pending", tint: "--c-cat-desk" },
    { src: "assets/gallery/home-1.jpg", caption: "Home & utility — photo pending", tint: "--c-cat-home" },
    { src: "assets/gallery/tabletop-1.jpg", caption: "Tabletop — photo pending", tint: "--c-cat-tabletop" },
    { src: "assets/gallery/heritage-1.jpg", caption: "Heritage collection — photo pending", tint: "--c-cat-heritage" },
    { src: "assets/gallery/lighting-1.jpg", caption: "Lighting — photo pending", tint: "--c-cat-lighting" },
    { src: "assets/gallery/solar-1.jpg", caption: "Solar power — photo pending", tint: "--c-cat-lighting" },
    { src: "assets/gallery/tedx-1.jpg", caption: "TEDxBistupur — photo pending", tint: "--c-cat-heritage" }
  ],

  /* ---------------------------------------------------------------- delivery */
  // TODO: confirm real dispatch time and courier partner name.
  DISPATCH_HOURS: 6,
  DELIVERY_DAYS_MIN: 3,
  DELIVERY_DAYS_MAX: 6,
  COURIER_PARTNER: "Courier partner (demo)",

  /* ------------------------------------------------------------------ misc */
  OTP_DEMO: "123456",
  TRACK_TIMELINE: [
    { key: "placed", label: "Order placed", afterHours: 0 },
    { key: "packed", label: "Packed", afterHours: 6 },
    { key: "shipped", label: "Shipped", afterHours: 24 },
    { key: "out", label: "Out for delivery", afterHours: 48 },
    { key: "delivered", label: "Delivered", afterHours: 96 }
  ]
};

/* Categories helper — slug of a category name */
SP.config.categorySlug = function (name) {
  var found = SP.config.CATEGORIES.filter(function (c) { return c.name === name; })[0];
  return found ? found.slug : String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-");
};

/* Category tint variable for a category name */
SP.config.categoryTint = function (name) {
  var found = SP.config.CATEGORIES.filter(function (c) { return c.name === name; })[0];
  return found ? found.tint : "--c-cat-home";
};
