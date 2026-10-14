/**
 * ============================================================================
 * ADITYA PRATAMA — VISUAL COMMUNICATION DESIGN PORTFOLIO 2026
 * THEME SYSTEM (theme.js)
 * Manages Dark / Light mode switching, persistence & system preferences
 * ============================================================================
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'aditya_portfolio_theme';
  const root = document.documentElement;
  const themeMetaTag = document.querySelector('meta[name="theme-color"]');

  /**
   * Determine initial theme
   * Priority: 1. LocalStorage -> 2. System preference -> 3. Default 'dark'
   */
  function getPreferredTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  /**
   * Apply theme to DOM and meta tags
   */
  function applyTheme(theme, animate = false) {
    if (animate) {
      document.body.style.transition = 'background-color 0.4s ease, color 0.4s ease';
    }

    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    if (themeMetaTag) {
      themeMetaTag.setAttribute('content', theme === 'dark' ? '#0A0A0A' : '#FAFAFA');
    }

    // Update aria-label for accessibility
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      toggleBtn.setAttribute('title', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }

    // Dispatch custom event for canvas or other modules that need theme awareness
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));

    if (animate) {
      setTimeout(() => {
        document.body.style.transition = '';
      }, 450);
    }
  }

  // Set initial theme immediately before DOM content loads fully to prevent flash
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme, false);

  // When DOM is ready, attach event listeners to toggle button
  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme, true);
      });
    }

    // Listen to system color scheme changes if user hasn't explicitly set one
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        const savedTheme = localStorage.getItem(STORAGE_KEY);
        if (!savedTheme) {
          applyTheme(e.matches ? 'dark' : 'light', true);
        }
      });
    }
  });

  // Expose helper on window if needed
  window.PortfolioTheme = {
    get: () => root.getAttribute('data-theme') || 'dark',
    set: (t) => applyTheme(t, true),
  };
})();
