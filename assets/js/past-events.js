/* ==========================================================================
   TEDxBistupur Past Events Engine (with Pagination & Load More)
   ========================================================================== */

(function () {
  "use strict";

  var PAGE_SIZE_SPEAKERS = 6;
  var PAGE_SIZE_GALLERY = 8;
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
      // Edition switch
      var targetEdition = e.target.closest("[data-edition-id]");
      if (targetEdition) {
        var id = targetEdition.getAttribute("data-edition-id");
        if (id) {
          e.preventDefault();
          switchEdition(id, true);
          return;
        }
      }

      // Handle Read More / Read Less in speaker bio
      var toggleBioBtn = e.target.closest(".speaker-card__bio-toggle");
      if (toggleBioBtn) {
        var card = toggleBioBtn.closest(".speaker-card");
        if (card) {
          card.classList.toggle("is-expanded");
          toggleBioBtn.textContent = card.classList.contains("is-expanded") ? "Read less ↑" : "Read more ↓";
        }
        return;
      }

      // Handle Lightbox click
      var galleryItem = e.target.closest(".gallery-item");
      if (galleryItem) {
        var img = galleryItem.querySelector("img");
        if (img) openLightbox(img.src, img.alt);
        return;
      }

      // Handle Load More Speakers
      var loadMoreSpeakersBtn = e.target.closest('[data-action="load-more-speakers"]');
      if (loadMoreSpeakersBtn) {
        handleLoadMoreSpeakers(loadMoreSpeakersBtn);
        return;
      }

      // Handle Show Less Speakers
      var showLessSpeakersBtn = e.target.closest('[data-action="show-less-speakers"]');
      if (showLessSpeakersBtn) {
        handleShowLessSpeakers(showLessSpeakersBtn);
        return;
      }

      // Handle Speaker Page Number Click
      var speakerPageBtn = e.target.closest('[data-action="speaker-page"]');
      if (speakerPageBtn) {
        handleSpeakerPage(speakerPageBtn);
        return;
      }

      // Handle View All Speakers
      var viewAllSpeakersBtn = e.target.closest('[data-action="view-all-speakers"]');
      if (viewAllSpeakersBtn) {
        handleViewAllSpeakers(viewAllSpeakersBtn);
        return;
      }

      // Handle Load More Gallery
      var loadMoreGalleryBtn = e.target.closest('[data-action="load-more-gallery"]');
      if (loadMoreGalleryBtn) {
        handleLoadMoreGallery(loadMoreGalleryBtn);
        return;
      }

      // Handle Show Less Gallery
      var showLessGalleryBtn = e.target.closest('[data-action="show-less-gallery"]');
      if (showLessGalleryBtn) {
        handleShowLessGallery(showLessGalleryBtn);
        return;
      }

      // Handle View All Gallery
      var viewAllGalleryBtn = e.target.closest('[data-action="view-all-gallery"]');
      if (viewAllGalleryBtn) {
        handleViewAllGallery(viewAllGalleryBtn);
        return;
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
        '<div class="event-edition__logo-card">' +
        '<img class="event-edition__logo-img" src="' + escapeAttr(ev.logoImage) + '" alt="' + escapeAttr(ev.title) + ' Official Logo" loading="lazy">' +
        '</div>' +
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

    var totalSpeakers = (ev.speakers || []).length;
    var initialVisible = Math.min(PAGE_SIZE_SPEAKERS, totalSpeakers);

    var speakersHtml = (ev.speakers || []).map(function (sp, idx) {
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
      var isHiddenClass = idx >= PAGE_SIZE_SPEAKERS ? " is-paged-hidden" : "";

      return (
        '<article class="speaker-card' + isHiddenClass + '" data-speaker-index="' + idx + '">' +
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

    // Build speaker pagination / load more wrap
    var speakerPaginationHtml = "";
    if (totalSpeakers > PAGE_SIZE_SPEAKERS) {
      var totalPages = Math.ceil(totalSpeakers / PAGE_SIZE_SPEAKERS);
      var pagesButtons = [];
      for (var p = 1; p <= totalPages; p++) {
        pagesButtons.push(
          '<button class="tedx-page-btn' + (p === 1 ? ' is-active' : '') + '" type="button" data-action="speaker-page" data-page="' + p + '" aria-label="Page ' + p + '">' + p + '</button>'
        );
      }

      speakerPaginationHtml =
        '<div class="tedx-load-more-wrap" data-wrap="speakers">' +
        '<div class="tedx-pagination-info">' +
        'Showing <strong class="js-speaker-shown">' + initialVisible + '</strong> of <strong class="js-speaker-total">' + totalSpeakers + '</strong> Keynote Speakers' +
        '</div>' +
        '<div class="tedx-pagination-actions">' +
        '<button class="btn btn--tedx-load-more" type="button" data-action="load-more-speakers">' +
        '<span>Load More Speakers</span>' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>' +
        '</button>' +
        '<div class="tedx-pagination-pages">' + pagesButtons.join("") + '</div>' +
        '<button class="btn btn--tedx-show-all" type="button" data-action="view-all-speakers">View All (' + totalSpeakers + ')</button>' +
        '</div></div>';
    }

    // Build gallery
    var galleryHtml = "";
    var totalPhotos = (ev.gallery || []).length;
    var initialGalleryVisible = Math.min(PAGE_SIZE_GALLERY, totalPhotos);

    if (totalPhotos > 0) {
      var items = ev.gallery.map(function (g, gIdx) {
        var isHiddenClass = gIdx >= PAGE_SIZE_GALLERY ? " is-paged-hidden" : "";
        return (
          '<div class="gallery-item' + isHiddenClass + '" data-gallery-index="' + gIdx + '" tabindex="0" role="button" aria-label="View photo in full size">' +
          '<img src="' + escapeAttr(g.src) + '" alt="' + escapeAttr(g.alt) + '" loading="lazy">' +
          '</div>'
        );
      }).join("");

      var galleryPaginationHtml = "";
      if (totalPhotos > PAGE_SIZE_GALLERY) {
        galleryPaginationHtml =
          '<div class="tedx-load-more-wrap" data-wrap="gallery">' +
          '<div class="tedx-pagination-info">' +
          'Showing <strong class="js-gallery-shown">' + initialGalleryVisible + '</strong> of <strong class="js-gallery-total">' + totalPhotos + '</strong> Event Photos' +
          '</div>' +
          '<div class="tedx-pagination-actions">' +
          '<button class="btn btn--tedx-load-more" type="button" data-action="load-more-gallery">' +
          '<span>Load More Photos</span>' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>' +
          '</button>' +
          '<button class="btn btn--tedx-show-all" type="button" data-action="view-all-gallery">View All (' + totalPhotos + ')</button>' +
          '</div></div>';
      }

      galleryHtml =
        '<div class="gallery-section">' +
        '<h3 class="gallery-section__title">Through the Lens</h3>' +
        '<div class="gallery-grid">' + items + '</div>' +
        galleryPaginationHtml +
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
      '<span class="speakers-section__count">' + totalSpeakers + ' Keynote Speakers</span>' +
      '</div>' +
      '<div class="speakers-grid">' + speakersHtml + '</div>' +
      speakerPaginationHtml +
      '</div>' +
      galleryHtml +
      '</section>'
    );
  }

  /* ================================================= Pagination / Load More Handlers */
  function handleLoadMoreSpeakers(btn) {
    var section = btn.closest(".event-edition");
    if (!section) return;
    var cards = section.querySelectorAll(".speaker-card");
    var hiddenCards = section.querySelectorAll(".speaker-card.is-paged-hidden");
    var total = cards.length;

    // Unhide next 6 cards
    var toUnhide = Array.prototype.slice.call(hiddenCards, 0, PAGE_SIZE_SPEAKERS);
    toUnhide.forEach(function (card) {
      card.classList.remove("is-paged-hidden");
    });

    var nowVisible = section.querySelectorAll(".speaker-card:not(.is-paged-hidden)").length;
    var countEl = section.querySelector(".js-speaker-shown");
    if (countEl) countEl.textContent = nowVisible;

    // Update active page button if all from that page are visible
    var currentPage = Math.ceil(nowVisible / PAGE_SIZE_SPEAKERS);
    section.querySelectorAll(".tedx-page-btn").forEach(function (pb) {
      if (parseInt(pb.getAttribute("data-page"), 10) === currentPage) pb.classList.add("is-active");
      else pb.classList.remove("is-active");
    });

    if (nowVisible >= total) {
      btn.setAttribute("data-action", "show-less-speakers");
      btn.querySelector("span").textContent = "Show Less";
      btn.classList.add("is-expanded");
    }
  }

  function handleShowLessSpeakers(btn) {
    var section = btn.closest(".event-edition");
    if (!section) return;
    var cards = section.querySelectorAll(".speaker-card");
    cards.forEach(function (card, idx) {
      if (idx >= PAGE_SIZE_SPEAKERS) card.classList.add("is-paged-hidden");
      else card.classList.remove("is-paged-hidden");
    });

    var countEl = section.querySelector(".js-speaker-shown");
    if (countEl) countEl.textContent = Math.min(PAGE_SIZE_SPEAKERS, cards.length);

    btn.setAttribute("data-action", "load-more-speakers");
    btn.querySelector("span").textContent = "Load More Speakers";
    btn.classList.remove("is-expanded");

    section.querySelectorAll(".tedx-page-btn").forEach(function (pb) {
      if (pb.getAttribute("data-page") === "1") pb.classList.add("is-active");
      else pb.classList.remove("is-active");
    });

    var headEl = section.querySelector(".speakers-section__head");
    if (headEl) headEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleSpeakerPage(btn) {
    var section = btn.closest(".event-edition");
    if (!section) return;
    var targetPage = parseInt(btn.getAttribute("data-page"), 10);
    var startIdx = (targetPage - 1) * PAGE_SIZE_SPEAKERS;
    var endIdx = targetPage * PAGE_SIZE_SPEAKERS;

    var cards = section.querySelectorAll(".speaker-card");
    cards.forEach(function (card, idx) {
      if (idx >= startIdx && idx < endIdx) {
        card.classList.remove("is-paged-hidden");
      } else {
        card.classList.add("is-paged-hidden");
      }
    });

    section.querySelectorAll(".tedx-page-btn").forEach(function (pb) {
      if (parseInt(pb.getAttribute("data-page"), 10) === targetPage) pb.classList.add("is-active");
      else pb.classList.remove("is-active");
    });

    var countEl = section.querySelector(".js-speaker-shown");
    if (countEl) countEl.textContent = (startIdx + 1) + " - " + Math.min(endIdx, cards.length);

    var loadMoreBtn = section.querySelector('[data-action="show-less-speakers"], [data-action="load-more-speakers"]');
    if (loadMoreBtn) {
      loadMoreBtn.setAttribute("data-action", "load-more-speakers");
      loadMoreBtn.querySelector("span").textContent = "Load More Speakers";
      loadMoreBtn.classList.remove("is-expanded");
    }

    var headEl = section.querySelector(".speakers-section__head");
    if (headEl) headEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleViewAllSpeakers(btn) {
    var section = btn.closest(".event-edition");
    if (!section) return;
    var cards = section.querySelectorAll(".speaker-card");
    cards.forEach(function (card) {
      card.classList.remove("is-paged-hidden");
    });

    var countEl = section.querySelector(".js-speaker-shown");
    if (countEl) countEl.textContent = cards.length;

    var loadMoreBtn = section.querySelector('[data-action="load-more-speakers"]');
    if (loadMoreBtn) {
      loadMoreBtn.setAttribute("data-action", "show-less-speakers");
      loadMoreBtn.querySelector("span").textContent = "Show Less";
      loadMoreBtn.classList.add("is-expanded");
    }

    section.querySelectorAll(".tedx-page-btn").forEach(function (pb) {
      pb.classList.remove("is-active");
    });
  }

  function handleLoadMoreGallery(btn) {
    var section = btn.closest(".event-edition");
    if (!section) return;
    var items = section.querySelectorAll(".gallery-item");
    var hiddenItems = section.querySelectorAll(".gallery-item.is-paged-hidden");
    var total = items.length;

    var toUnhide = Array.prototype.slice.call(hiddenItems, 0, PAGE_SIZE_GALLERY);
    toUnhide.forEach(function (item) {
      item.classList.remove("is-paged-hidden");
    });

    var nowVisible = section.querySelectorAll(".gallery-item:not(.is-paged-hidden)").length;
    var countEl = section.querySelector(".js-gallery-shown");
    if (countEl) countEl.textContent = nowVisible;

    if (nowVisible >= total) {
      btn.setAttribute("data-action", "show-less-gallery");
      btn.querySelector("span").textContent = "Show Less";
      btn.classList.add("is-expanded");
    }
  }

  function handleShowLessGallery(btn) {
    var section = btn.closest(".event-edition");
    if (!section) return;
    var items = section.querySelectorAll(".gallery-item");
    items.forEach(function (item, idx) {
      if (idx >= PAGE_SIZE_GALLERY) item.classList.add("is-paged-hidden");
      else item.classList.remove("is-paged-hidden");
    });

    var countEl = section.querySelector(".js-gallery-shown");
    if (countEl) countEl.textContent = Math.min(PAGE_SIZE_GALLERY, items.length);

    btn.setAttribute("data-action", "load-more-gallery");
    btn.querySelector("span").textContent = "Load More Photos";
    btn.classList.remove("is-expanded");

    var galHead = section.querySelector(".gallery-section__title");
    if (galHead) galHead.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleViewAllGallery(btn) {
    var section = btn.closest(".event-edition");
    if (!section) return;
    var items = section.querySelectorAll(".gallery-item");
    items.forEach(function (item) {
      item.classList.remove("is-paged-hidden");
    });

    var countEl = section.querySelector(".js-gallery-shown");
    if (countEl) countEl.textContent = items.length;

    var loadMoreBtn = section.querySelector('[data-action="load-more-gallery"]');
    if (loadMoreBtn) {
      loadMoreBtn.setAttribute("data-action", "show-less-gallery");
      loadMoreBtn.querySelector("span").textContent = "Show Less";
      loadMoreBtn.classList.add("is-expanded");
    }
  }

  function switchEdition(editionId, updateHistory) {
    activeEditionId = editionId;
    var sections = document.querySelectorAll("[data-event-edition]");
    var pills = document.querySelectorAll(".edition-pill");
    var dropdownLinks = document.querySelectorAll(".tedx-menu-dropdown__link, .tedx-hero-dropdown-item");

    sections.forEach(function (sec) {
      if (sec.getAttribute("data-event-edition") === editionId) {
        sec.classList.remove("is-hidden");
        // Reset pagination state when switching to this edition
        var speakerCards = sec.querySelectorAll(".speaker-card");
        speakerCards.forEach(function (card, idx) {
          if (idx >= PAGE_SIZE_SPEAKERS) card.classList.add("is-paged-hidden");
          else card.classList.remove("is-paged-hidden");
        });
        var countEl = sec.querySelector(".js-speaker-shown");
        if (countEl) countEl.textContent = Math.min(PAGE_SIZE_SPEAKERS, speakerCards.length);
        var loadMoreBtn = sec.querySelector('[data-action="show-less-speakers"], [data-action="load-more-speakers"]');
        if (loadMoreBtn) {
          loadMoreBtn.setAttribute("data-action", "load-more-speakers");
          loadMoreBtn.querySelector("span").textContent = "Load More Speakers";
          loadMoreBtn.classList.remove("is-expanded");
        }
        sec.querySelectorAll(".tedx-page-btn").forEach(function (pb) {
          if (pb.getAttribute("data-page") === "1") pb.classList.add("is-active");
          else pb.classList.remove("is-active");
        });
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
