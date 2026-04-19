(function () {
  'use strict';

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    var header = document.getElementById('site-header') || document.querySelector('.site-header');
    var hamburgerBtn = document.getElementById('hamburger-btn');
    var drawer = document.getElementById('mobile-drawer');
    var overlay = document.getElementById('drawer-overlay');
    var closeBtn = document.getElementById('drawer-close-btn');

    var searchBtn = document.getElementById('search-toggle-btn');
    var searchWrapper = document.getElementById('search-input-wrapper');
    var searchInput = document.getElementById('search-input');

    function handleScroll() {
      if (!header) return;
      if (window.scrollY > 8) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    function openDrawer() {
      if (!drawer || !overlay) return;
      drawer.classList.add('open');
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
      if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      if (!drawer || !overlay) return;
      drawer.classList.remove('open');
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
      if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    function toggleSearch() {
      if (!searchWrapper) return;
      var isOpen = searchWrapper.classList.contains('open');
      if (isOpen) {
        searchWrapper.classList.remove('open');
      } else {
        searchWrapper.classList.add('open');
        if (searchInput) searchInput.focus();
      }
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });

    if (searchBtn) searchBtn.addEventListener('click', toggleSearch);
  });
})();
