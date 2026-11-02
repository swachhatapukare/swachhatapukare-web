/* blog.js — Logic for blog listing, category filtering, search, and dynamic reader view */

(function (SP) {
  "use strict";

  var activeCategory = "all";
  var searchQuery = "";

  function init() {
    var listView = document.getElementById("blog-list-view");
    var readerView = document.getElementById("blog-reader-view");
    var toolbarSection = document.getElementById("blog-toolbar-section");
    var searchInput = document.getElementById("blog-search-input");
    var backBtn = document.getElementById("blog-back-btn");

    if (!listView || !SP.blog) return;

    // Check URL parameters for direct article link
    var params = new URLSearchParams(window.location.search);
    var postSlug = params.get("post");
    if (postSlug) {
      showPost(postSlug, false);
    } else {
      renderPosts();
    }

    // Category tabs
    var tabs = document.querySelectorAll(".blog-tab");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.classList.remove("is-active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");
        activeCategory = tab.getAttribute("data-category") || "all";
        renderPosts();
      });
    });

    // Search input
    if (searchInput) {
      searchInput.addEventListener("input", function (e) {
        searchQuery = (e.target.value || "").trim().toLowerCase();
        renderPosts();
      });
    }

    // Back button in reader
    if (backBtn) {
      backBtn.addEventListener("click", function () {
        history.pushState(null, "", "blog.html");
        showList();
      });
    }

    // Handle browser back/forward buttons
    window.addEventListener("popstate", function () {
      var p = new URLSearchParams(window.location.search);
      var slug = p.get("post");
      if (slug) showPost(slug, false);
      else showList();
    });
  }

  function renderPosts() {
    var all = SP.blog.getAllPosts();
    var filtered = all.filter(function (post) {
      var matchCat = activeCategory === "all" || post.category === activeCategory;
      var matchSearch = true;
      if (searchQuery) {
        var hay = (post.title + " " + post.excerpt + " " + (post.author || "") + " " + (post.tags || []).join(" ")).toLowerCase();
        matchSearch = hay.indexOf(searchQuery) !== -1;
      }
      return matchCat && matchSearch;
    });

    var featuredArea = document.getElementById("blog-featured-area");
    var gridArea = document.getElementById("blog-posts-grid");
    var emptyMsg = document.getElementById("blog-empty-msg");

    if (!filtered.length) {
      if (featuredArea) featuredArea.innerHTML = "";
      if (gridArea) gridArea.innerHTML = "";
      if (emptyMsg) emptyMsg.hidden = false;
      return;
    }

    if (emptyMsg) emptyMsg.hidden = true;

    // Pick featured post if showing all and no search query active
    var featured = null;
    var regular = filtered;
    if (activeCategory === "all" && !searchQuery) {
      var featIdx = filtered.findIndex(function (p) { return p.featured; });
      if (featIdx !== -1) {
        featured = filtered[featIdx];
        regular = filtered.filter(function (_, i) { return i !== featIdx; });
      }
    }

    if (featuredArea) {
      if (featured) {
        featuredArea.innerHTML =
          '<article class="blog-featured-card">' +
          '<div class="blog-featured-card__content">' +
          '<div class="blog-reader__meta">' +
          '<span class="blog-badge">' + SP.esc(featured.category) + '</span>' +
          '<span class="blog-dot">&bull;</span>' +
          '<span>' + SP.esc(featured.date) + '</span>' +
          '<span class="blog-dot">&bull;</span>' +
          '<span>' + SP.esc(featured.readTime) + '</span>' +
          '</div>' +
          '<h2 class="blog-featured-card__title"><a href="blog.html?post=' + encodeURIComponent(featured.slug) + '" class="blog-post-link" data-slug="' + SP.esc(featured.slug) + '">' + SP.esc(featured.title) + '</a></h2>' +
          '<p class="blog-featured-card__excerpt">' + SP.esc(featured.excerpt) + '</p>' +
          '<div class="blog-card__footer">' +
          '<div class="blog-card__author-info">' +
          '<div class="blog-card__avatar">' + (featured.author ? featured.author.charAt(0) : "S") + '</div>' +
          '<div class="blog-card__author-meta">' +
          '<strong class="blog-card__author-name">' + SP.esc(featured.author) + '</strong>' +
          (featured.authorRole ? '<span class="blog-card__date">' + SP.esc(featured.authorRole) + '</span>' : '') +
          '</div>' +
          '</div>' +
          '<a href="blog.html?post=' + encodeURIComponent(featured.slug) + '" class="btn btn--primary btn--sm blog-post-link" data-slug="' + SP.esc(featured.slug) + '" style="white-space:nowrap;flex-shrink:0;">Read story &rarr;</a>' +
          '</div>' +
          '</div>' +
          '</article>';
      } else {
        featuredArea.innerHTML = "";
      }
    }

    if (gridArea) {
      gridArea.innerHTML = regular.map(function (post) {
        return (
          '<article class="blog-card">' +
          '<div class="blog-card__body">' +
          '<div class="blog-reader__meta">' +
          '<span class="blog-badge">' + SP.esc(post.category) + '</span>' +
          '<span class="blog-dot">&bull;</span>' +
          '<span>' + SP.esc(post.readTime) + '</span>' +
          '</div>' +
          '<h3 class="blog-card__title"><a href="blog.html?post=' + encodeURIComponent(post.slug) + '" class="blog-post-link" data-slug="' + SP.esc(post.slug) + '">' + SP.esc(post.title) + '</a></h3>' +
          '<p class="blog-card__excerpt">' + SP.esc(post.excerpt) + '</p>' +
          '</div>' +
          '<div class="blog-card__footer">' +
          '<div class="blog-card__author-info">' +
          '<div class="blog-card__avatar">' + (post.author ? post.author.charAt(0) : "S") + '</div>' +
          '<div class="blog-card__author-meta">' +
          '<strong class="blog-card__author-name">' + SP.esc(post.author) + '</strong>' +
          '<span class="blog-card__date">' + SP.esc(post.date) + '</span>' +
          '</div>' +
          '</div>' +
          '<a href="blog.html?post=' + encodeURIComponent(post.slug) + '" class="blog-card__cta blog-post-link" data-slug="' + SP.esc(post.slug) + '" aria-label="Read ' + SP.esc(post.title) + '">' +
          '<span>Read</span>&nbsp;&rarr;' +
          '</a>' +
          '</div>' +
          '</article>'
        );
      }).join("");
    }

    // Bind article click events
    document.querySelectorAll(".blog-post-link").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var slug = link.getAttribute("data-slug");
        if (slug) showPost(slug, true);
      });
    });
  }

  function showPost(slug, pushHistory) {
    var post = SP.blog.getPostBySlug(slug);
    if (!post) {
      showList();
      return;
    }

    var listView = document.getElementById("blog-list-view");
    var readerView = document.getElementById("blog-reader-view");
    var toolbar = document.getElementById("blog-toolbar-section");

    if (listView) listView.hidden = true;
    if (toolbar) toolbar.hidden = true;
    if (readerView) readerView.hidden = false;

    // Populate reader
    document.getElementById("reader-category").textContent = post.category || "Field Story";
    document.getElementById("reader-date").textContent = post.date || "";
    document.getElementById("reader-readtime").textContent = post.readTime || "";
    document.getElementById("reader-title").textContent = post.title;
    document.getElementById("reader-author").textContent = post.author || "SwachhataPukare Team";
    document.getElementById("reader-role").textContent = post.authorRole || "SwachhataPukare Foundation";
    document.getElementById("reader-avatar").textContent = post.author ? post.author.charAt(0) : "S";

    // Format body content
    var bodyContainer = document.getElementById("reader-body");
    var contentArray = Array.isArray(post.content) ? post.content : [post.content || post.excerpt];
    bodyContainer.innerHTML = contentArray.map(function (p) {
      if (p.indexOf("### ") === 0) {
        return '<h3 class="blog-reader__subhead">' + SP.esc(p.replace("### ", "")) + '</h3>';
      }
      if (p.indexOf("> ") === 0) {
        return '<blockquote class="blog-reader__quote">' + SP.esc(p.replace("> ", "")) + '</blockquote>';
      }
      return '<p>' + SP.esc(p) + '</p>';
    }).join("");

    // Tags
    var tagsContainer = document.getElementById("reader-tags");
    if (tagsContainer && post.tags && post.tags.length) {
      tagsContainer.innerHTML = post.tags.map(function (tag) {
        return '<span class="h-chip">' + SP.esc(tag) + '</span>';
      }).join("");
    } else if (tagsContainer) {
      tagsContainer.innerHTML = "";
    }

    // Share buttons
    var shareX = document.getElementById("share-x-btn");
    if (shareX) {
      var tweet = encodeURIComponent(post.title + " via @SwachhataPukare " + window.location.href);
      shareX.href = "https://twitter.com/intent/tweet?text=" + tweet;
    }

    var copyBtn = document.getElementById("share-copy-btn");
    if (copyBtn) {
      copyBtn.onclick = function () {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href).then(function () {
            copyBtn.textContent = "Copied!";
            setTimeout(function () { copyBtn.textContent = "Copy Link"; }, 2000);
          });
        }
      };
    }

    if (pushHistory) {
      history.pushState({ post: slug }, post.title, "blog.html?post=" + encodeURIComponent(slug));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showList() {
    var listView = document.getElementById("blog-list-view");
    var readerView = document.getElementById("blog-reader-view");
    var toolbar = document.getElementById("blog-toolbar-section");

    if (listView) listView.hidden = false;
    if (toolbar) toolbar.hidden = false;
    if (readerView) readerView.hidden = true;

    renderPosts();
  }

  document.addEventListener("DOMContentLoaded", init);

})(window.SP);

