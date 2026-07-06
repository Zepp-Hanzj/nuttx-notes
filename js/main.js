/**
 * NuttX Learning Notes - Main JavaScript
 * Vanilla JS implementation for site interactivity
 */

(function () {
  'use strict';

  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initProgressBar();
    initTOC();
    initSmoothScroll();
    initCodeCopyButtons();
    initMobileNav();
    initBackToTop();
    initMermaid();
  }

  // ─── Reading Progress Bar ───────────────────────────────────────────
  function initProgressBar() {
    const bar = document.createElement('div');
    bar.id = 'reading-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.prepend(bar);

    window.addEventListener('scroll', function () {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    }, { passive: true });
  }

  // ─── Table of Contents Generator ────────────────────────────────────
  function initTOC() {
    const tocContainer = document.getElementById('toc');
    if (!tocContainer) return;

    const headings = document.querySelectorAll('.content h2, .content h3');
    if (headings.length === 0) {
      tocContainer.style.display = 'none';
      return;
    }

    const list = document.createElement('ul');
    list.className = 'toc-list';

    headings.forEach(function (heading, index) {
      // Ensure each heading has an id
      if (!heading.id) {
        heading.id = 'section-' + index;
      }

      const li = document.createElement('li');
      li.className = 'toc-item toc-' + heading.tagName.toLowerCase();

      const a = document.createElement('a');
      a.href = '#' + heading.id;
      a.className = 'toc-link';
      a.textContent = heading.textContent;
      a.dataset.target = heading.id;

      li.appendChild(a);
      list.appendChild(li);
    });

    tocContainer.appendChild(list);

    // Observe headings for active highlighting
    initActiveHighlight(headings);
  }

  // ─── Active TOC Highlighting on Scroll ──────────────────────────────
  function initActiveHighlight(headings) {
    const tocLinks = document.querySelectorAll('.toc-link');
    if (tocLinks.length === 0) return;

    // Debounce helper
    function debounce(fn, ms) {
      let timer;
      return function () {
        clearTimeout(timer);
        timer = setTimeout(fn, ms);
      };
    }

    const updateActive = debounce(function () {
      let currentId = '';
      const offset = 100; // pixels from top to trigger highlight

      headings.forEach(function (heading) {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= offset) {
          currentId = heading.id;
        }
      });

      tocLinks.forEach(function (link) {
        link.classList.remove('active');
        if (link.dataset.target === currentId) {
          link.classList.add('active');
          // Scroll the active TOC item into view within the sidebar
          link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      });
    }, 50);

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive(); // Initial call
  }

  // ─── Smooth Scroll for Anchor Links ─────────────────────────────────
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Update URL hash without jumping
      history.pushState(null, '', '#' + targetId);
    });
  }

  // ─── Code Block Copy Button ─────────────────────────────────────────
  function initCodeCopyButtons() {
    const codeBlocks = document.querySelectorAll('pre code');

    codeBlocks.forEach(function (codeEl) {
      const pre = codeEl.parentElement;
      if (!pre || pre.tagName !== 'PRE') return;

      // Make pre position relative for button placement
      pre.style.position = 'relative';

      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      btn.setAttribute('aria-label', 'Copy code to clipboard');

      btn.addEventListener('click', function () {
        const text = codeEl.textContent;
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 2000);
        }).catch(function () {
          // Fallback for older browsers
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 2000);
        });
      });

      pre.appendChild(btn);
    });
  }

  // ─── Responsive Mobile Navigation ───────────────────────────────────
  function initMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (!navToggle || !navMenu) return;

    navToggle.addEventListener('click', function () {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ─── Back to Top Button ─────────────────────────────────────────────
  function initBackToTop() {
    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.innerHTML = '&#8679;'; // upward arrow
    btn.setAttribute('aria-label', 'Back to top');
    btn.title = 'Back to top';
    document.body.appendChild(btn);

    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ─── Mermaid Diagram Initialization ─────────────────────────────────
  function initMermaid() {
    if (typeof mermaid === 'undefined') return;

    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'monospace'
    });
  }

})();
