/* ============================================================
   DicoFlow — Scroll Reveal & Animation Engine
   IntersectionObserver-based scroll animations
   ============================================================ */

(function () {
  'use strict';

  // ===== SCROLL REVEAL =====
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Don't unobserve — allows re-reveal if user scrolls back
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  function initReveal() {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el) => {
      revealObserver.observe(el);
    });
  }

  // ===== STAGGER CHILDREN =====
  function initStagger() {
    document.querySelectorAll('.stagger').forEach((parent) => {
      const children = parent.children;
      for (let i = 0; i < children.length; i++) {
        children[i].style.setProperty('--i', i);
      }
    });
  }

  // ===== COUNTER ANIMATION =====
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = parseInt(el.dataset.duration, 10) || 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(target * eased);
      el.textContent = prefix + value.toLocaleString('en-IN') + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  function initCounters() {
    document.querySelectorAll('[data-counter]').forEach((el) => {
      counterObserver.observe(el);
    });
  }

  // ===== PROGRESS BAR ANIMATION =====
  const progressObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fill = entry.target.querySelector('.progress-fill');
          if (fill) {
            const target = fill.dataset.width || '100%';
            fill.style.width = target;
          }
          progressObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  function initProgressBars() {
    document.querySelectorAll('.progress-track').forEach((el) => {
      progressObserver.observe(el);
    });
  }

  // ===== COMPARE BAR ANIMATION =====
  const compareObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fill = entry.target.querySelector('.compare-bar-fill');
          if (fill) {
            const target = fill.dataset.width || '50%';
            setTimeout(() => { fill.style.width = target; }, 100);
          }
          compareObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  function initCompareBars() {
    document.querySelectorAll('.compare-bar').forEach((el) => {
      compareObserver.observe(el);
    });
  }

  // ===== TYPEWRITER EFFECT =====
  function initTypewriter() {
    document.querySelectorAll('[data-typewriter]').forEach((el) => {
      const text = el.dataset.typewriter;
      el.textContent = '';
      let i = 0;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            function type() {
              if (i < text.length) {
                el.textContent += text.charAt(i);
                i++;
                setTimeout(type, 50);
              }
            }
            type();
            observer.unobserve(el);
          }
        },
        { threshold: 0.5 }
      );
      observer.observe(el);
    });
  }

  // ===== PARALLAX (lightweight) =====
  let ticking = false;
  function initParallax() {
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    if (!parallaxEls.length) return;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          parallaxEls.forEach((el) => {
            const speed = parseFloat(el.dataset.parallax) || 0.3;
            const offset = scrollY * speed;
            el.style.transform = `translateY(${offset}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ===== ACCORDION =====
  function initAccordions() {
    document.querySelectorAll('.accordion-header').forEach((header) => {
      header.addEventListener('click', () => {
        const item = header.closest('.accordion-item');
        const isOpen = item.classList.contains('open');
        // Close siblings
        item.parentElement.querySelectorAll('.accordion-item.open').forEach((sibling) => {
          if (sibling !== item) sibling.classList.remove('open');
        });
        item.classList.toggle('open', !isOpen);
      });
    });
  }

  // ===== TABS =====
  function initTabs() {
    document.querySelectorAll('[data-tab-group]').forEach((group) => {
      const buttons = group.querySelectorAll('.tab-btn');
      const contents = group.querySelectorAll('.tab-content');
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const target = btn.dataset.tab;
          buttons.forEach((b) => b.classList.remove('active'));
          contents.forEach((c) => c.classList.remove('active'));
          btn.classList.add('active');
          const content = group.querySelector(`[data-tab-id="${target}"]`);
          if (content) content.classList.add('active');
        });
      });
    });
  }

  // ===== TOOLTIP =====
  function initTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach((el) => {
      el.style.position = 'relative';
      el.addEventListener('mouseenter', () => {
        const tip = document.createElement('div');
        tip.className = 'tooltip-popup';
        tip.textContent = el.dataset.tooltip;
        tip.style.cssText = `
          position:absolute;bottom:calc(100%+8px);left:50%;transform:translateX(-50%);
          background:var(--bg-elevated);color:var(--text-primary);padding:0.5rem 0.75rem;
          border-radius:6px;font-size:0.8rem;white-space:nowrap;z-index:999;
          border:1px solid var(--border-teal);pointer-events:none;
          animation:fadeIn 0.2s ease;
        `;
        el.appendChild(tip);
      });
      el.addEventListener('mouseleave', () => {
        const tip = el.querySelector('.tooltip-popup');
        if (tip) tip.remove();
      });
    });
  }

  // ===== SMOOTH SCROLL =====
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ===== INIT ALL =====
  function init() {
    initReveal();
    initStagger();
    initCounters();
    initProgressBars();
    initCompareBars();
    initTypewriter();
    initParallax();
    initAccordions();
    initTabs();
    initTooltips();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for dynamic content
  window.DicoFlowAnimations = { init, initReveal, initCounters, initTabs, animateCounter };
})();
