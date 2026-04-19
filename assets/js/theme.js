/**
 * theme.js
 * Handles dark/light mode toggling and persistence via localStorage.
 * Attaches to any element with [data-theme-toggle] attribute.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'pi-theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  /**
   * Apply the given theme to the document root.
   * @param {string} theme - 'dark' or 'light'
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  /**
   * Get the user's saved theme preference, or fall back to
   * the OS-level preference, then default to light.
   * @returns {string} 'dark' or 'light'
   */
  function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === DARK || saved === LIGHT) return saved;
    // Respect OS preference if no saved value
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return DARK;
    }
    return LIGHT;
  }

  /**
   * Toggle between dark and light theme.
   */
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === DARK ? LIGHT : DARK);
  }

  /**
   * Bind click handler to all theme toggle buttons in the DOM.
   */
  function bindToggleButtons() {
    const buttons = document.querySelectorAll('[data-theme-toggle]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', toggleTheme);
    });
  }

  // --- Initialise on page load ---
  // Apply theme immediately to prevent flash of wrong theme
  applyTheme(getInitialTheme());

  // Bind buttons after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindToggleButtons);
  } else {
    bindToggleButtons();
  }

})();
