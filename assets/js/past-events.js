/* ==========================================================================
   TEDxBistupur Past Events Engine (Integrated Showcase)
   ========================================================================== */

(function () {
  "use strict";

  var activeEditionId = null;

  function init() {
    var events = window.TEDX_PAST_EVENTS || [];
    if (!events.length) {
      console.warn("TEDX_PAST_EVENTS not loaded.");
      return;
    }

    var stage = document.getElementById("tedx-edition-stage") || document.getElementById("past-events-stage");
    var pillsContainer = document.getElementById("tedx-showcase-pills") || document.getElementById("edition-pills");
    var dropdownMenus = document.querySelectorAll("[data-tedx-dropdown-menu], #tedx-showcase-dropdown-menu, #tedx-hero-dropdown-menu");

    // Populate dropdown menus
    dropdownMenus.forEach(function (menu) {
      if (!menu) return;
      menu.innerHTML = events.map(function (ev) {
        return (
          '<li class="tedx-menu-dropdown__item">' +
          '<a class="tedx-menu-dropdown__link" href="#' + ev.id + '" data-edition-id="' + ev.id + '">' +
          escapeHtml(ev.title) +
          "</a></li>"
        );
      }).join("");
    });

    // Populate pill buttons
    if (pillsContainer) {
      pillsContainer.innerHTML = events.map(function (ev) {
        return (
          '<button class="edition-pill" type="button" data-edition-id="' + ev.id + '">' +
          escapeHtml(ev.title) +
          "</button>"
        );
      }).join("");
    }

    // Render all event sections into stage
    if (stage) {
      stage.innerHTML = events.map(function (ev) {
        return renderEventSection(ev);
      }).join("");
    }

    // Setup Dropdowns
    setupDropdowns();

    // Setup Click Delegations
    document.addEventListener("click", function (e) {
      var target = e.target.closest("[data-edition-id]");
      if (target) {
        var id = target.getAttribute("data-edition-id");
        if (id) {
          e.preventDefault();
          switchEdition(id, true);
        }
      }

      // Handle Read More / Read Less in speaker bio
      var toggleBtn = e.target.closest(".speaker-card__bio-toggle");
      if (toggleBtn) {
        var card = toggleBtn.closest(".speaker-card");
        if (card) {
          card.classList.toggle("is-expanded");
          toggleBtn.textContent = card.classList.contains("is-expanded") ? "Read less ↑" : "Read more ↓";
        }
      }

      // Handle Lightbox click
      var galleryItem = e.target.closest(".gallery-item");
      if (galleryItem) {
        var img = galleryItem.querySelector("img");
        if (img) openLightbox(img.src, img.alt);
      }
    });

    // Setup Lightbox Close
    var lightbox = document.getElementById("tedx-lightbox");
    if (lightbox) {
      lightbox.addEventListener("click", function (e) {
        if (e.target.id === "tedx-lightbox" || e.target.closest(".tedx-lightbox__close")) {
          closeLightbox();
        }
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeLightbox();
      });
    }

    // Expose global helper
    window.showTedxEdition = function (id) {
      switchEdition(id, true);
    };

    // Read initial hash from URL
    var hash = (window.location.hash || "").replace("#", "");
    if (hash && events.some(function (e) { return e.id === hash; })) {
      switchEdition(hash, false);
    } else {
      // Default to "connecting-the-dots" or "power-of-why"
      switchEdition("connecting-the-dots", false);
    }

    // Handle browser back/forward buttons
    window.addEventListener("hashchange", function () {
      var newHash = (window.location.hash || "").replace("#", "");
      if (newHash && events.some(function (e) { return e.id === newHash; })) {
        switchEdition(newHash, false);
      }
    });
  }

  function renderEventSection(ev) {
    var logoHtml = "";
    if (ev.logoImage) {
      logoHtml =
        '<div class="event-edition__logo-wrap">' +
        '<img class="event-edition__logo-img" src="' + escapeAttr(ev.logoImage) + '" alt="' + escapeAttr(ev.title) + ' Official Logo" loading="lazy">' +
        '</div>';
    }

    var emceeHtml = "";
    if (ev.emcee && ev.emcee.name) {
      emceeHtml =
        '<div class="event-emcee">' +
        '<div class="event-emcee__photo-wrap">' +
        '<img class="event-emcee__photo" src="' + escapeAttr(ev.emcee.image) + '" alt="' + escapeAttr(ev.emcee.name) + '" loading="lazy" onerror="this.src=\'assets/images/tedxbistupur/past-events/patrick_jpg.webp\'">' +
        '</div>' +
        '<div class="event-emcee__content">' +
        '<span class="event-emcee__eyebrow">Master of Ceremony</span>' +
        '<h3 class="event-emcee__name">' + escapeHtml(ev.emcee.name) + '</h3>' +
        '<div class="event-emcee__role">' + escapeHtml(ev.emcee.role) + '</div>' +
        '<p class="event-emcee__bio">' + escapeHtml(ev.emcee.bio) + '</p>' +
        '</div></div>';
    }

    var speakersHtml = (ev.speakers || []).map(function (sp) {
      var talkBtn = "";
      if (sp.talk_url) {
        talkBtn =
          '<div class="speaker-card__action">' +
          '<a class="btn--tedx-talk" href="' + escapeAttr(sp.talk_url) + '" target="_blank" rel="noopener noreferrer">' +
          '<span>Experience the Talk</span>' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>' +
          '</a></div>';
      }

      var bioLines = (sp.bio || "").trim();
      var hasLongBio = bioLines.length > 280;

      return (
        '<article class="speaker-card">' +
        '<div class="speaker-card__media">' +
        '<img class="speaker-card__img" src="' + escapeAttr(sp.image) + '" alt="' + escapeAttr(sp.image_alt || sp.name) + '" loading="lazy">' +
        '</div>' +
        '<div class="speaker-card__body">' +
        '<h4 class="speaker-card__name">' + escapeHtml(sp.name) + '</h4>' +
        (sp.role ? '<div class="speaker-card__role">' + escapeHtml(sp.role) + '</div>' : '') +
        '<div class="speaker-card__bio">' + escapeHtml(bioLines).replace(/\n\n/g, '<br><br>') + '</div>' +
        (hasLongBio ? '<button class="speaker-card__bio-toggle" type="button">Read more &darr;</button>' : '') +
        talkBtn +
        '</div></article>'
      );
    }).join("");

    var galleryHtml = "";
    if (ev.gallery && ev.gallery.length > 0) {
      var items = ev.gallery.map(function (g) {
        return (
          '<div class="gallery-item" tabindex="0" role="button" aria-label="View photo in full size">' +
          '<img src="' + escapeAttr(g.src) + '" alt="' + escapeAttr(g.alt) + '" loading="lazy">' +
          '</div>'
        );
      }).join("");

      galleryHtml =
        '<div class="gallery-section">' +
        '<h3 class="gallery-section__title">Through the Lens</h3>' +
        '<div class="gallery-grid">' + items + '</div>' +
        '</div>';
    }

    var sectionTitle = ev.id === "she-leads" ? "Women Who Are Shaping the world" : "Speakers Who Inspire";

    return (
      '<section class="event-edition" id="' + ev.id + '" data-event-edition="' + ev.id + '">' +
      '<div class="event-edition__header">' +
      logoHtml +
      '<span class="event-edition__date-badge" style="color: ' + (ev.accentColor || '#EB0028') + '">' + escapeHtml(ev.date) + '</span>' +
      '<h2 class="event-edition__title">' + escapeHtml(ev.title) + '</h2>' +
      '<p class="event-edition__tagline">' + escapeHtml(ev.tagline) + '</p>' +
      '</div>' +
      emceeHtml +
      '<div class="speakers-section">' +
      '<div class="speakers-section__head">' +
      '<h3 class="speakers-section__title">' + sectionTitle + '</h3>' +
      '<span class="speakers-section__count">' + (ev.speakers || []).length + ' Keynote Speakers</span>' +
      '</div>' +
      '<div class="speakers-grid">' + speakersHtml + '</div>' +
      '</div>' +
      galleryHtml +
      '</section>'
    );
  }

  function switchEdition(editionId, updateHistory) {
    activeEditionId = editionId;
    var sections = document.querySelectorAll("[data-event-edition]");
    var pills = document.querySelectorAll(".edition-pill");
    var dropdownLinks = document.querySelectorAll(".tedx-menu-dropdown__link, .tedx-hero-dropdown-item");

    sections.forEach(function (sec) {
      if (sec.getAttribute("data-event-edition") === editionId) {
        sec.classList.remove("is-hidden");
      } else {
        sec.classList.add("is-hidden");
      }
    });

    pills.forEach(function (p) {
      if (p.getAttribute("data-edition-id") === editionId) p.classList.add("is-active");
      else p.classList.remove("is-active");
    });

    dropdownLinks.forEach(function (lnk) {
      if (lnk.getAttribute("data-edition-id") === editionId) lnk.classList.add("is-active");
      else lnk.classList.remove("is-active");
    });

    // Close any open dropdown menus
    document.querySelectorAll(".tedx-menu-dropdown, .tedx-hero-dropdown-wrap").forEach(function (d) {
      d.classList.remove("is-open");
    });

    if (updateHistory) {
      window.history.pushState(null, "", "#" + editionId);
      var showcaseEl = document.getElementById("past-events-showcase");
      if (showcaseEl) {
        showcaseEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  function setupDropdowns() {
    var triggers = document.querySelectorAll("[data-tedx-dropdown-trigger], #tedx-hero-dropdown-btn");
    triggers.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var parent = btn.closest(".tedx-menu-dropdown, .tedx-hero-dropdown-wrap");
        if (parent) {
          var isOpen = parent.classList.contains("is-open");
          document.querySelectorAll(".tedx-menu-dropdown, .tedx-hero-dropdown-wrap").forEach(function (d) { d.classList.remove("is-open"); });
          if (!isOpen) parent.classList.add("is-open");
        }
      });
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest(".tedx-menu-dropdown, .tedx-hero-dropdown-wrap")) {
        document.querySelectorAll(".tedx-menu-dropdown, .tedx-hero-dropdown-wrap").forEach(function (d) { d.classList.remove("is-open"); });
      }
    });
  }

  function openLightbox(src, alt) {
    var lightbox = document.getElementById("tedx-lightbox");
    var img = document.getElementById("tedx-lightbox-img");
    if (lightbox && img) {
      img.src = src;
      img.alt = alt || "Photo";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
    }
  }

  function closeLightbox() {
    var lightbox = document.getElementById("tedx-lightbox");
    if (lightbox) {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(str) {
    if (!str) return "";
    return String(str).replace(/"/g, "&quot;");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
