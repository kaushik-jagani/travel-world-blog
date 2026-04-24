/**
 * router.js -- Page bootstrapper for blog-post.html
 * Reads ?slug= param, fetches data/posts/{slug}/post.json
 * Integrates Google Analytics (G-WQFMWPTPDS)
 * ALL_SLUGS determines Trending Reads pool
 */

(function () {
  'use strict';

  var GA_ID      = 'G-EQCRHDEN5M'; // G-WQFMWPTPDS
  var ALL_POSTS  = []; // loaded from /data/posts/index.json (flat array with listing meta)

  function loadIndex() {
    return fetch('/data/posts/index.json')
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) { ALL_POSTS = Array.isArray(data) ? data : []; })
      .catch(function () { ALL_POSTS = []; });
  }

  function toAbsolutePath(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path) || path.indexOf('//') === 0) return path;
    if (path.charAt(0) === '/') return path;
    return '/' + String(path).replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');
  }

  /* -- GA helper ------------------------------------------ */
  function gaEvent(name, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params || {});
    }
  }

  /* -- Get slug from URL ---------------------------------- */
  function getSlug() {
    var params = new URLSearchParams(window.location.search);
    var querySlug = params.get('slug');
    if (querySlug) return querySlug;

    var parts = window.location.pathname.split('/').filter(Boolean);
    var blogIndex = parts.indexOf('blog');
    if (blogIndex >= 0 && parts.length > blogIndex + 1) {
      return parts[blogIndex + 1];
    }
    return '';
  }

  /* -- Safe fetch ------------------------------------------ */
  function fetchJSON(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + url);
      return r.json();
    });
  }

  /* -- Format date ----------------------------------------- */
  function formatDate(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('en-AE', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) { return iso; }
  }

  /* -- Apply SEO meta -------------------------------------- */
  function applyMeta(post) {
    var meta = post.meta || {};
    var og   = post.openGraph || {};
    var tw   = post.twitter   || {};

    document.title = meta.title || post.title;

    function setMeta(name, content, attr) {
      if (!content) return;
      var selectorAttr = attr || 'name';
      var el = document.querySelector('meta[' + selectorAttr + '="' + name + '"]') ||
               (function () {
                 var e = document.createElement('meta');
                 e.setAttribute(selectorAttr, name);
                 document.head.appendChild(e);
                 return e;
               }());
      el.setAttribute('content', content);
    }

    setMeta('description',           meta.description);
    setMeta('keywords',              Array.isArray(meta.keywords) ? meta.keywords.join(', ') : meta.keywords);
    setMeta('og:title',              og.title || post.title,       'property');
    setMeta('og:description',        og.description || meta.description, 'property');
    setMeta('og:image',              toAbsolutePath(og.image || post.coverImage),  'property');
    setMeta('og:type',               'article',                    'property');
    setMeta('og:url',                og.url || (window.location.origin + '/blog/' + post.slug), 'property');
    setMeta('twitter:title',         tw.title || post.title);
    setMeta('twitter:description',   tw.description || meta.description);
    setMeta('twitter:image',         toAbsolutePath(tw.image || post.coverImage));
    setMeta('twitter:card',          'summary_large_image');

    // Canonical
    var canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + '/blog/' + post.slug;
  }

  /* -- Breadcrumb ------------------------------------------ */
  function renderBreadcrumb(post) {
    var el = document.getElementById('post-breadcrumb');
    if (!el) return;
    el.innerHTML =
      '<a href="/">Home</a>' +
      '<span class="sep">›</span>' +
      '<a href="/blog">Blog</a>' +
      '<span class="sep">›</span>' +
      '<span class="current">' + (post.title || '') + '</span>';
  }

  /* -- Author bar ------------------------------------------ */
  function renderAuthorBar(post) {
    var avatarEl   = document.getElementById('author-avatar');
    var nameEl     = document.getElementById('author-name');
    var metaEl     = document.getElementById('post-meta-info');

    if (avatarEl) avatarEl.textContent = PropInsightRender.renderAuthorAvatar(post.author);
    if (nameEl)   nameEl.textContent   = post.author || 'Travel World Team';
    if (metaEl)   metaEl.innerHTML     =
      formatDate(post.date) +
      '<span class="dot"></span>' +
      (post.readTime || post.readingTime || '5 min read') +
      '<span class="dot"></span>' +
      (post.category || 'Travel');
  }

  /* -- Share buttons --------------------------------------- */
  function bindShare(post) {
    var pageUrl   = encodeURIComponent(window.location.href);
    var pageTitle = encodeURIComponent(post.title || '');

    var twitterBtn  = document.getElementById('share-twitter');
    var fbBtn       = document.getElementById('share-facebook');
    var linkedinBtn = document.getElementById('share-linkedin');
    var copyBtn     = document.getElementById('share-copy');

    if (twitterBtn)  twitterBtn.href  = 'https://twitter.com/intent/tweet?url=' + pageUrl + '&text=' + pageTitle;
    if (fbBtn)       fbBtn.href       = 'https://www.facebook.com/sharer/sharer.php?u=' + pageUrl;
    if (linkedinBtn) linkedinBtn.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + pageUrl;

    if (copyBtn) {
      copyBtn.addEventListener('click', function (e) {
        e.preventDefault();
        navigator.clipboard.writeText(window.location.href).then(function () {
          copyBtn.title = 'Copied!';
          setTimeout(function () { copyBtn.title = 'Copy link'; }, 2000);
        });
        gaEvent('share', { method: 'copy', content_type: 'article', item_id: post.slug });
      });
    }
  }

  /* -- Hero image ------------------------------------------ */
  function renderHero(post) {
    var heroEl = document.getElementById('post-hero-img');
    var titleEl = document.getElementById('post-title');

    if (heroEl) {
      heroEl.src = toAbsolutePath(post.coverImage) || 'https://source.unsplash.com/1200x500/?dubai,travel';
      heroEl.alt = post.title || '';
    }
    if (titleEl) titleEl.textContent = post.title || '';
  }

  /* -- Load and render Trending Reads (from ALL_POSTS, no extra fetches) -- */
  function loadTrendingReads(currentSlug) {
    var sidebarEl = document.getElementById('trending-reads-container');
    if (!sidebarEl) return;

    var others = ALL_POSTS.filter(function (p) { return p.slug !== currentSlug; });
    others.forEach(function (p) { p.coverImage = toAbsolutePath(p.coverImage); });
    PropInsightRender.renderTrendingReads(others, sidebarEl, currentSlug);
  }

  /* -- Also-like section (from ALL_POSTS, no extra fetches) --- */
  function loadAlsoLike(currentSlug) {
    var el = document.getElementById('also-like-grid');
    if (!el) return;
    var picks = ALL_POSTS.filter(function (p) { return p.slug !== currentSlug; }).slice(0, 3);
    if (!picks.length) { el.innerHTML = ''; return; }
    var cards = picks.map(function (p) {
      var thumb = toAbsolutePath(p.coverImage) || '';
      return '<a href="/blog/' + p.slug + '" class="post-card">' +
        '<div class="post-card-img-wrapper"><img src="' + thumb + '" alt="' + p.title + '" class="post-card-img" loading="lazy"></div>' +
        '<div class="post-card-body">' +
          '<span class="badge">' + (p.category || 'Travel') + '</span>' +
          '<h3 class="post-card-title">' + p.title + '</h3>' +
          '<p class="post-card-excerpt">' + (p.excerpt || '') + '</p>' +
        '</div>' +
      '</a>';
    }).join('');
    el.innerHTML = cards;
  }

  /* -- Main init ------------------------------------------- */
  function init() {
    var slug = getSlug();
    if (!slug) {
      document.title = 'Post Not Found -- Travel World';
      var content = document.getElementById('post-content');
      if (content) content.innerHTML = '<p class="error-msg">No post specified.</p>';
      return;
    }

    // Load index first for trending reads / also-like
    loadIndex().then(function () {
      return fetchJSON('/data/posts/' + slug + '/post.json');
    }).then(function (post) {
      post.slug = post.slug || slug;
      post.coverImage = toAbsolutePath(post.coverImage);

      if (Array.isArray(post.sections)) {
        post.sections.forEach(function (sec) {
          if (sec && sec.image && sec.image.src) {
            sec.image.src = toAbsolutePath(sec.image.src);
          }
        });
      }

      applyMeta(post);
      renderBreadcrumb(post);
      renderHero(post);
      renderAuthorBar(post);
      bindShare(post);

      var contentEl = document.getElementById('post-content');
      if (contentEl) PropInsightRender.renderPost(post, contentEl);

      loadTrendingReads(slug);
      loadAlsoLike(slug);

      // GA page_view event
      gaEvent('page_view', {
        page_title:    post.title,
        page_location: window.location.href,
        content_group: post.category || 'Blog'
      });

    }).catch(function (err) {
      console.error('Failed to load post:', err);
      var content = document.getElementById('post-content');
      if (content) content.innerHTML = '<p class="error-msg">Post could not be loaded. Please try again.</p>';
    });
  }

  document.addEventListener('DOMContentLoaded', init);

}());
