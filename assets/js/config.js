/* config.js — every site-wide constant lives here.
   Anything marked TODO is a placeholder that must be replaced before launch. */

window.SP = window.SP || {};

SP.config = {
  /* ------------------------------------------------------------------ brand */
  SITE_NAME: "SwachhataPukare Foundation",
  SITE_SHORT: "SwachhataPukare",
  TAGLINE: "Crafted for everyday use.",
  CATALOGUE_INTRO: "Handcrafted pieces from the Foundation's own catalogue.",
  LOGO_PATH: "assets/logo.png", // circular emblem, used in header + menu
  LOGO_PATH_FULL: "assets/logo-full.png", // full lock-up incl. caption line, used in the footer
  // both fall back to the SVG wordmark if the file is missing

  SOCIAL: {
    instagram: "https://www.instagram.com/swachhatapukare",
    x: "https://x.com/swachhatapukare",
    linkedin: "https://www.linkedin.com/company/swachhatapukare-foundation",
    facebook: "https://www.facebook.com/swachhatapukare"
  },

  FOUNDATION: {
    name: "SwachhataPukare Foundation",
    addressLines: [
      "HIG-276, Ward No-15, Near Bank Of Baroda",
      "Adityapur, Jamshedpur, Jharkhand 831013"
    ],
    addressOneLine:
      "HIG-276, Ward No-15, Near Bank Of Baroda, Adityapur, Jamshedpur, Jharkhand 831013",
    gst: "20ABHCS8922N1ZZ",
    phone: "+91 00000 00000",
    phoneTel: "+910000000000",
    // TODO: replace with the Foundation's real WhatsApp Business number (country code + number, digits only)
    whatsapp: "910000000000",
    email: "hello@swachhatapukare.com",
    website: "https://www.swachhatapukare.com",
    hours: "Monday – Saturday, 09:00 – 18:00 IST"
  },

  /* ------------------------------------------------------------- behaviour */
  OPEN_MINI_CART_ON_ADD: true,

  /* ------------------------------------------------------------------ money */
  CURRENCY: "INR",
  // Courier/fulfilment is quoted separately — product prices never include it.
  SHIPPING_FLAT: 79, // TODO: confirm real courier rate
  FREE_SHIPPING_ABOVE: 999, // TODO: confirm real free-shipping threshold
  COD_MAX: 5000, // orders above this cannot be paid Cash on Delivery // TODO: confirm
  // TODO: confirm the GST percentage the Foundation charges
  GST_PERCENT: 5,
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

  PARTNERS: [
    "Tata Steel",
    "Tata Communications",
    "NTPC",
    "Axis India",
    "M+ Solar by Petronas",
    "Neoperl",
    "MM Aqua",
    "Enactus",
    "Inner Wheel",
    "Utkarsh Bangla"
  ],

  /* Partner logos for the "Working alongside" marquee on the home page.
     Files live in assets/partners/ — all placed on clean white card backgrounds.
     width is the logo's max width in rem to maintain visual harmony. */
  PARTNER_LOGOS: [
    { name: "Tata Steel", src: "assets/partners/tatasteel.png", width: 9.5 },
    { name: "Tata Communications", src: "assets/partners/tatacommunications.png", width: 11 },
    { name: "NTPC", src: "assets/partners/NTPC.png", width: 7.5 },
    { name: "Axis India", src: "assets/partners/Axis india.png", width: 9.5 },
    { name: "M+ Solar by Petronas", src: "assets/partners/msolar by petronas.jpg", width: 9.5 },
    { name: "Neoperl", src: "assets/partners/neoperl.png", width: 9 },
    { name: "MM Aqua", src: "assets/partners/mmaqua.png", width: 9.5 },
    { name: "Enactus", src: "assets/partners/enactus.png", width: 8.5 },
    { name: "Inner Wheel", src: "assets/partners/innerwheel.png", width: 7.5 },
    { name: "Utkarsh Bangla", src: "assets/partners/utkarshbangla.png", width: 7.5 }
  ],

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
  WHAT_WE_DO_CATEGORIES: [
    {
      category: "Water",
      items: [
        {
          slug: "water-hyacinth",
          href: "water-hyacinth.html",
          title: "Water Hyacinth",
          desc: "An aquatic weed turned into handcrafted raw material."
        },
        {
          slug: "river-cleaning",
          href: "river-cleaning.html",
          title: "River Cleaning",
          desc: "Cleaning drives along rivers and drains."
        }
      ]
    },
    {
      category: "Energy",
      items: [
        {
          slug: "solar-power",
          href: "solar-power.html",
          title: "Solar Power",
          desc: "Work on solar energy initiatives."
        }
      ]
    },
    {
      category: "Waste Management",
      items: [
        {
          slug: "sewage-treatment",
          href: "sewage-treatment.html",
          title: "Sewage Treatment",
          desc: "Sewage treatment plant work."
        },
        {
          slug: "dry-waste-management",
          href: "sewage-treatment.html#dry-waste",
          title: "Dry Waste Management",
          desc: "Dry waste management and segregation (coming soon)."
        }
      ]
    },
    {
      category: "Rural & Community",
      items: [
        {
          slug: "rural-smart-build-centres",
          href: "rural-smart-build-centres.html",
          title: "Rural Smart Build Centres",
          desc: "Sustainable rural construction and craft centres."
        },
        {
          slug: "tedxbistupur",
          href: "tedxbistupur.html",
          title: "TEDxBistupur",
          desc: "Ideas worth spreading, from Bistupur."
        }
      ]
    }
  ],

  WHAT_WE_DO: [
    {
      slug: "water-hyacinth",
      category: "Water",
      href: "water-hyacinth.html",
      title: "Water Hyacinth",
      desc: "An aquatic weed turned into handcrafted raw material."
    },
    {
      slug: "river-cleaning",
      category: "Water",
      href: "river-cleaning.html",
      title: "River Cleaning",
      desc: "Cleaning drives along rivers and drains."
    },
    {
      slug: "solar-power",
      category: "Energy",
      href: "solar-power.html",
      title: "Solar Power",
      desc: "Work on solar energy initiatives."
    },
    {
      slug: "sewage-treatment",
      category: "Waste Management",
      href: "sewage-treatment.html",
      title: "Sewage Treatment",
      desc: "Sewage treatment plant work."
    },
    {
      slug: "rural-smart-build-centres",
      category: "Rural Infrastructure",
      href: "rural-smart-build-centres.html",
      title: "Rural Smart Build Centres",
      desc: "Sustainable rural construction and craft centres."
    },
    {
      slug: "tedxbistupur",
      category: "Community",
      href: "tedxbistupur.html",
      title: "TEDxBistupur",
      desc: "Ideas worth spreading, from Bistupur."
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
        "SwachhataPukare Foundation is a Section 8 non-profit organisation based in Adityapur, Jamshedpur, working on river conservation, handcrafted livelihoods, clean energy, and civic initiatives.",
      placeholderNote:
        "Official write-up and organizational background pending confirmation from the Foundation.",
      sections: [
        {
          h: "Who we are",
          p: [
            "[Placeholder: Foundation background, founding story, mission, and leadership details to be confirmed by SwachhataPukare Foundation.]"
          ]
        },
        {
          h: "Where we work",
          p: [
            "Registered Office: HIG-276, Ward No-15, Near Bank Of Baroda, Adityapur, Jamshedpur, Jharkhand 831013.",
            "[Placeholder: Detailed geographical coverage, river basins, and rural operational clusters to be confirmed.]"
          ]
        },
        {
          h: "What we do",
          p: [
            "[Placeholder: Comprehensive overview of river cleaning drives, water hyacinth craft, solar power, sewage treatment, rural smart build centres, and TEDxBistupur.]"
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
      eyebrow: "What we do · Water",
      title: "River Cleaning Drives",
      lead: "The Foundation mobilises volunteers and partners to keep our rivers, ghats and urban drains clean.",
      placeholderNote:
        "Verified schedule and upcoming cleaning drives in Jamshedpur.",
      sections: [
        {
          h: "The work",
          p: [
            "SwachhataPukare Foundation conducts frequent community cleaning drives across riverbanks, ghats, and surrounding tributaries in Jamshedpur and surrounding districts.",
            "Volunteers remove plastic waste, discarded synthetic materials, and choked vegetation to keep river water flowing freely and protect aquatic ecosystems."
          ]
        },
        {
          h: "How to take part",
          p: [
            "Anyone can participate — students, citizen volunteers, corporate groups and youth clubs. No prior experience is needed.",
            "Safety boots, protective gloves, grabbers and waste disposal bags are provided at every drive site by the Foundation team."
          ]
        },
        {
          h: "Volunteer Recognition",
          p: [
            "Every volunteer receives a certificate of participation acknowledging their direct contribution to environmental conservation.",
            "Click the Volunteer button below to sign up for our upcoming river cleaning drive."
          ]
        }
      ],
      cta: {
        title: "Join the next cleaning drive",
        text: "Make an immediate, visible difference along our rivers. Register as a volunteer today.",
        label: "Volunteer now",
        href: "contact.html?subject=Volunteering"
      }
    },

    tedxbistupur: {
      eyebrow: "What we do · Community",
      title: "TEDxBistupur",
      lead: "A locally organised TEDx platform bringing pioneering ideas and changemakers to Jamshedpur.",
      placeholderNote:
        "Upcoming event edition details & participation options.",
      sections: [
        {
          h: "About the event",
          p: [
            "TEDxBistupur is operated under license from TED, creating a platform for innovators, researchers, social changemakers and grassroots leaders.",
            "The Foundation collaborates to curate talks centered on environmental sustainability, youth empowerment and community development."
          ]
        },
        {
          h: "Upcoming event details",
          p: [
            "Theme: Regenerative Futures — Ideas from the Heartland.",
            "Venue: Bistupur Auditorium, Jamshedpur, Jharkhand. Featuring 10 inspiring speakers across ecological innovation, youth leadership, art and technology."
          ]
        },
        {
          h: "Get involved",
          p: [
            "There are three ways to get involved: nominate a speaker doing transformative work, volunteer with our event curation team, or partner as an institutional sponsor.",
            "Reach out to our team using the link below to get involved with TEDxBistupur."
          ]
        }
      ],
      cta: {
        title: "Get involved with TEDxBistupur",
        text: "Nominate a speaker, join the volunteer team, or partner on the upcoming edition.",
        label: "Get involved",
        href: "contact.html?subject=Press%20%26%20partnerships"
      }
    },

    "rural-smart-build-centres": {
      eyebrow: "What we do · Rural Infrastructure",
      title: "Rural Smart Build Centres",
      lead: "Establishing sustainable rural infrastructure hubs for craft training, local eco-friendly construction materials, and community resilience.",
      placeholderNote:
        "We need more details for this — full project specifications, pilot locations and architectural drawings will be published as project rollout begins.",
      sections: [
        {
          h: "Vision & Purpose",
          p: [
            "Rural Smart Build Centres are decentralized community facilities designed to foster sustainable construction techniques, local material processing, and vocational training for rural artisans.",
            "These centres serve as the regional workshops where harvested water hyacinth is dried, stored, and transformed by local self-help group artisans into marketable utility craft."
          ]
        },
        {
          h: "Sustainable Infrastructure",
          p: [
            "The centres incorporate rooftop solar power, natural rainwater harvesting, and eco-friendly masonry, acting as living demonstration models for sustainable rural living.",
            "More detailed operational frameworks, pilot centre blueprints, and community partnership details will be published here as the pilot rollout commences."
          ]
        }
      ],
      cta: {
        title: "Partner with Us on Smart Build",
        text: "Interested in supporting or learning more about Rural Smart Build Centres? Contact our project team.",
        label: "Contact project team",
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
  // PAN India delivery partner network covering 28,000+ PIN codes across all 28 states & 8 UTs
  DISPATCH_HOURS: 24,
  DELIVERY_DAYS_MIN: 3,
  DELIVERY_DAYS_MAX: 5,
  COURIER_PARTNER: "Delivery & India Post (PAN India Delivery)",
  PINCODE_COVERAGE: 28000,
  PINCODE_COVERAGE_LABEL: "28,000+ PIN codes across PAN India (All 28 States & 8 UTs)",

  /* ------------------------------------------------------------------ misc */
  OTP_CODE: "123456",
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
