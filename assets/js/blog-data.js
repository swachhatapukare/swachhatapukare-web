/* blog-data.js — Foundation articles, stories, and editorial content.
   Provides persistent storage integration with the CMS. */

window.SP = window.SP || {};

(function (SP) {
  "use strict";

  var STORAGE_KEY = "sp_blog_posts";

  var DEFAULT_POSTS = [
    {
      id: "post-1",
      slug: "invasive-river-weed-to-handcrafted-utility",
      title: "From Invasive River Weed to High-Craft Utility: The Subarnarekha Story",
      category: "Water Hyacinth Craft",
      author: "Gaurav Anand",
      authorRole: "Founder, SwachhataPukare Foundation",
      date: "October 24, 2026",
      readTime: "5 min read",
      featured: true,
      tint: "--c-cat-office",
      excerpt: "How an aggressive aquatic weed choking Eastern India's river ecosystems became raw material for dignity, design, and rural women's livelihoods.",
      content: [
        "Across the Subarnarekha and Kharkai rivers in Eastern India, water hyacinth (*Eichhornia crassipes*) has long presented an acute ecological dilemma. Rapidly carpeting river surfaces, this invasive plant blocks sunlight, starves underwater flora and fauna of oxygen, and disrupts traditional fishing and river transport.",
        "Rather than treating this weed purely as an intractable waste burden, SwachhataPukare turned the crisis on its head: what if the very biomass suffocating our rivers could be converted into high-grade, sustainable artisan craft that directly feeds rural families?",
        "### The Harvesting and Curing Process",
        "Our journey begins on the riverbanks. Partnering with local volunteers and community harvesters, the hyacinth stems are manually cut and cleared from water bodies. Once hauled ashore, stems are cleaned, graded by fiber strength, and sun-dried over several days.",
        "Treated with non-toxic, moisture-resistant plant extracts, the dried hyacinth transforms into a pliable, durable golden fiber that rivals wicker and bamboo in tactile beauty and tensile strength.",
        "### Dignity and Financial Autonomy for Women",
        "> \"Turning river weed into everyday craft gave us a trade we own with pride. Our river breathes again, and our children go to school with full dignity.\"",
        "Through dedicated artisan clusters across Jharkhand and neighboring districts, women self-help groups (SHGs) are trained in precision weaving techniques. Today, they produce world-class office stationery, file folders, conference kits, and home decor items. Every piece represents a river cleaned and a livelihood empowered."
      ],
      tags: ["River Conservation", "Water Hyacinth", "Artisans", "Women Empowerment"]
    },
    {
      id: "post-2",
      slug: "500-river-cleaning-drives-lessons-eastern-india",
      title: "500+ River Cleaning Drives: What Eastern India's Waterways Taught Us",
      category: "River Conservation",
      author: "Field Action Team",
      authorRole: "SwachhataPukare Operations",
      date: "October 12, 2026",
      readTime: "6 min read",
      featured: false,
      tint: "--c-teal",
      excerpt: "Crossing the 500-drive milestone along Jamshedpur's riverbanks revealed essential truths about community ownership and waste interception.",
      content: [
        "Reaching over 500 organized river cleaning drives across Jamshedpur, West Bengal, and Chhattisgarh is not just a statistic — it is a testament to the unyielding power of community commitment.",
        "When our earliest drives began along the ghats of the Subarnarekha, waste accumulated faster than volunteer groups could physically collect it. We quickly recognized a fundamental operational reality: cleaning riverbanks without stopping upstream waste ingress is an endless battle.",
        "### Three Golden Principles Learned",
        "1. **Engage Communities as Custodians, Not Observers**: Cleanups work best when local riverside settlements take pride of place. When residents lead the drive, illegal dumping drops by over 70%.",
        "2. **Segregation at the Shoreline**: Every piece of collected waste is sorted into organic biomass, recyclable plastics, glass, and residual silt. Plastics are redirected to certified recyclers instead of landfills.",
        "3. **Long-Term Monitoring**: Cleaning an area once creates temporary relief; weekly monitoring and neighborhood champions prevent recurring degradation.",
        "> \"A river is the living reflection of the city it sustains. When we heal our rivers, we restore our own collective health.\""
      ],
      tags: ["River Cleaning", "Volunteers", "Civic Action", "Ecosystem"]
    },
    {
      id: "post-3",
      slug: "decentralized-johkasou-sewage-treatment-rivers",
      title: "Decentralized Johkasou Sewage Treatment: Protecting Watersheds at the Source",
      category: "Waste Management",
      author: "Technical Directorate",
      authorRole: "Environmental Systems Unit",
      date: "September 28, 2026",
      readTime: "4 min read",
      featured: false,
      tint: "--c-leaf",
      excerpt: "Why large centralized sewage grids often fall short in peri-urban India, and how modular on-site treatment halts effluents before they reach our rivers.",
      content: [
        "In many Indian cities, untreated municipal wastewater remains the single largest polluter of natural river basins. Traditional centralized sewage treatment plants (STPs) require massive underground piping networks, extensive land acquisition, and reliable high-voltage power grids that are often unfeasible for peri-urban and growing semi-rural clusters.",
        "SwachhataPukare has championed decentralized Johkasou biological treatment systems — a Japanese on-site wastewater engineering innovation.",
        "### How Johkasou Works",
        "Johkasou units combine anaerobic and aerobic filtration inside compact, underground modular tanks. Inactive anaerobic bacteria first digest organic suspended solids, followed by aerated biological treatment that purifies effluent water to secondary discharge standards within hours.",
        "Treated water can be safely recycled for landscaping, toilet flushing, or ground recharge, guaranteeing zero raw sewage ingress into natural streams."
      ],
      tags: ["Sewage Treatment", "Johkasou", "Clean Water", "Sustainability"]
    },
    {
      id: "post-4",
      slug: "solar-energy-grassroots-infrastructure",
      title: "Solar Energy for Grassroots Infrastructure: Powering Rural Transformation",
      category: "Clean Energy",
      author: "Energy Cell",
      authorRole: "Renewable Initiatives Lead",
      date: "September 15, 2026",
      readTime: "5 min read",
      featured: false,
      tint: "--c-amber",
      excerpt: "Deploying 5,000+ kW of solar capacity to power schools, artisan workshops, and rural water filtration centers without grid dependency.",
      content: [
        "Clean power is the backbone of durable community transformation. Across rural pockets of Eastern India, grid outages frequently cripple basic public facilities, water purification pumps, and artisan workspaces.",
        "By facilitating the installation and commissioning of over 5,000 kW of rooftop and decentralized solar capacity, SwachhataPukare helps bridge the energy equity gap.",
        "### Impact on Artisan Production",
        "Our Rural Smart Build production centers now operate on uninterrupted solar energy. Looms, finishing presses, and lighting run continuously regardless of external power cuts, increasing artisan productivity by more than 35% while keeping operational carbon footprints at absolute zero."
      ],
      tags: ["Solar Power", "Renewable Energy", "Rural Infrastructure"]
    },
    {
      id: "post-5",
      slug: "tedxbistupur-grassroots-ideas-environmental-action",
      title: "TEDxBistupur: Amplifying Grassroots Voices and Environmental Action",
      category: "Community & Ideas",
      author: "Curatorial Board",
      authorRole: "TEDxBistupur Team",
      date: "August 30, 2026",
      readTime: "4 min read",
      featured: false,
      tint: "--c-terracotta",
      excerpt: "How Jamshedpur's premier independently organized ideas conference brings changemakers, youth innovators, and conservation leaders together.",
      content: [
        "True ecological and societal change demands fresh ideas, honest debate, and platforms that give local innovators a global audience.",
        "Under the aegis of SwachhataPukare Foundation, TEDxBistupur has hosted more than 68 visionary speakers ranging from Padma Shri awardees and pioneering climate scientists to student inventors and grassroots tribal community leaders.",
        "> \"Ideas worth spreading must also be ideas worth practicing. TEDxBistupur is our community catalyst for turning inspiration into field action.\""
      ],
      tags: ["TEDxBistupur", "Innovation", "Youth", "Leadership"]
    }
  ];

  function getStoredPosts() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function getAllPosts() {
    var stored = getStoredPosts();
    var map = {};
    DEFAULT_POSTS.forEach(function (p) { map[p.id] = p; });
    stored.forEach(function (p) { map[p.id] = p; });
    var all = Object.keys(map).map(function (k) { return map[k]; });
    all.sort(function (a, b) {
      return new Date(b.date || 0) - new Date(a.date || 0);
    });
    return all;
  }

  function getPostBySlug(slug) {
    if (!slug) return null;
    var all = getAllPosts();
    for (var i = 0; i < all.length; i++) {
      if (all[i].slug === slug || all[i].id === slug) return all[i];
    }
    return null;
  }

  function savePost(post) {
    if (!post) return false;
    if (!post.id) post.id = "post-" + Date.now();
    if (!post.slug) post.slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!post.date) post.date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    
    var stored = getStoredPosts();
    var idx = -1;
    for (var i = 0; i < stored.length; i++) {
      if (stored[i].id === post.id) { idx = i; break; }
    }
    if (idx !== -1) stored[idx] = post;
    else stored.unshift(post);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      return post;
    } catch (e) {
      return false;
    }
  }

  function deletePost(id) {
    var stored = getStoredPosts();
    var filtered = stored.filter(function (p) { return p.id !== id; });
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (e) {
      return false;
    }
  }

  SP.blog = {
    DEFAULT_POSTS: DEFAULT_POSTS,
    getAllPosts: getAllPosts,
    getPostBySlug: getPostBySlug,
    savePost: savePost,
    deletePost: deletePost
  };

})(window.SP);

