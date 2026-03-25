/* ============================================================
   DicoFlow — Shared Navigation Component
   Responsive nav, hamburger menu, scroll-spy, active page
   ============================================================ */

(function () {
  'use strict';

  // ===== NAV TEMPLATE =====
  const NAV_LINKS = [
    { href: 'index.html', label: 'Home' },
    { href: 'features.html', label: 'Features' },
    { href: 'pricing.html', label: 'Pricing' },
    { href: 'compare.html', label: 'Compare' },
    { href: 'infrastructure.html', label: 'Infrastructure' },
    { href: 'roi-calculator.html', label: 'ROI Calculator' },
    { href: 'business-plan.html', label: 'Business Plan' },
    { href: 'strategy-planner.html', label: 'Strategy Planner' },
    { href: 'total-cost.html', label: 'Total Cost' },
    { href: 'sales-playbook.html', label: 'Playbook' },
    { href: 'sales-toolkit.html', label: 'Sales Toolkit' },
    { href: 'growth-playbook.html', label: 'Growth' },
    { href: 'market-analysis.html', label: 'Market Analysis' },
  ];

  const TIER_LINKS = [
    { href: 'tier-billing.html', label: 'T1 Billing' },
    { href: 'tier-pacs.html', label: 'T2 PACS' },
    { href: 'tier-radiology.html', label: 'T3 Radiology' },
    { href: 'tier-enterprise.html', label: 'T4 Enterprise' },
    { href: 'tier-billing-pacs.html', label: 'T5 Bundle' },
  ];

  function getCurrentPage() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    return path;
  }

  function renderNav() {
    const placeholder = document.getElementById('nav-placeholder');
    if (!placeholder) return;

    const currentPage = getCurrentPage();

    const navHTML = `
    <nav class="nav" id="mainNav">
      <div class="nav-inner">
        <a href="index.html" class="nav-logo">DicoFlow<span>Digital Diagnostics</span></a>
        <button class="nav-toggle" id="navToggle" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
        <div class="nav-links" id="navLinks">
          ${NAV_LINKS.map(
            (l) =>
              `<a href="${l.href}" class="${currentPage === l.href ? 'active' : ''}">${l.label}</a>`
          ).join('')}
          <div class="nav-dropdown" style="position:relative;">
            <a href="pricing.html" class="nav-dropdown-trigger ${
              currentPage.startsWith('tier-') ? 'active' : ''
            }" id="tierDropdown">Tiers ▾</a>
            <div class="nav-dropdown-menu" id="tierMenu" style="
              display:none;position:absolute;top:100%;left:0;min-width:180px;
              background:var(--bg-elevated);border:1px solid var(--border-teal);
              border-radius:var(--radius-sm);padding:0.5rem 0;z-index:1001;
              box-shadow:0 8px 30px rgba(0,0,0,0.4);
            ">
              ${TIER_LINKS.map(
                (l) =>
                  `<a href="${l.href}" style="
                    display:block;padding:0.5rem 1rem;color:var(--text-secondary);
                    font-size:0.82rem;transition:all 0.2s;
                  " onmouseover="this.style.background='var(--teal-glow)';this.style.color='var(--teal)'"
                     onmouseout="this.style.background='transparent';this.style.color='var(--text-secondary)'"
                  >${l.label}</a>`
              ).join('')}
            </div>
          </div>
          <a href="roi-calculator.html" class="btn-nav">Get ROI →</a>
        </div>
      </div>
    </nav>`;

    placeholder.innerHTML = navHTML;
    initNavBehavior();
  }

  function initNavBehavior() {
    const nav = document.getElementById('mainNav');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    const tierDropdown = document.getElementById('tierDropdown');
    const tierMenu = document.getElementById('tierMenu');

    // Scroll effect
    if (nav) {
      window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
      });
    }

    // Hamburger toggle
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('open');
        links.classList.toggle('open');
      });

      // Close on link click (mobile)
      links.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => {
          if (window.innerWidth <= 768) {
            toggle.classList.remove('open');
            links.classList.remove('open');
          }
        });
      });
    }

    // Tier dropdown hover
    if (tierDropdown && tierMenu) {
      let dropdownTimeout;
      const parent = tierDropdown.closest('.nav-dropdown');
      
      parent.addEventListener('mouseenter', () => {
        clearTimeout(dropdownTimeout);
        tierMenu.style.display = 'block';
      });
      parent.addEventListener('mouseleave', () => {
        dropdownTimeout = setTimeout(() => {
          tierMenu.style.display = 'none';
        }, 200);
      });

      // Also handle click for mobile
      tierDropdown.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          tierMenu.style.display = tierMenu.style.display === 'none' ? 'block' : 'none';
          tierMenu.style.position = 'static';
        }
      });
    }
  }

  // ===== FOOTER TEMPLATE =====
  function renderFooter() {
    const placeholder = document.getElementById('footer-placeholder');
    if (!placeholder) return;

    placeholder.innerHTML = `
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-grid">
          <div class="footer-col">
            <h4>Product</h4>
            <a href="features.html">Features</a>
            <a href="pricing.html">Pricing</a>
            <a href="compare.html">Compare</a>
            <a href="infrastructure.html">Infrastructure</a>
          </div>
          <div class="footer-col">
            <h4>Tiers</h4>
            <a href="tier-billing.html">T1 — Billing</a>
            <a href="tier-pacs.html">T2 — PACS</a>
            <a href="tier-radiology.html">T3 — Radiology</a>
            <a href="tier-enterprise.html">T4 — Enterprise</a>
            <a href="tier-billing-pacs.html">T5 — Billing+PACS</a>
          </div>
          <div class="footer-col">
            <h4>Resources</h4>
            <a href="roi-calculator.html">ROI Calculator</a>
            <a href="business-plan.html">Business Plan</a>
            <a href="strategy-planner.html">Strategy Planner</a>
            <a href="total-cost.html">Total Cost</a>
            <a href="sales-playbook.html">Sales Playbook</a>
            <a href="sales-toolkit.html">Sales Toolkit</a>
            <a href="growth-playbook.html">Growth Playbook</a>
            <a href="market-analysis.html">Market Analysis</a>
            <a href="infrastructure.html">Cloud Calculators</a>
          </div>
          <div class="footer-col">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Contact</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>DicoFlow — Digital Diagnostics, Made in India &nbsp;|&nbsp; &copy; ${new Date().getFullYear()} DicoFlow. All rights reserved.</p>
          <p style="margin-top:0.3rem;">All prices exclusive of 18% GST &nbsp;|&nbsp; On-premise deployment — your data stays with you</p>
        </div>
      </div>
    </footer>`;
  }

  // ===== BREADCRUMB =====
  function renderBreadcrumb() {
    const el = document.getElementById('breadcrumb');
    if (!el) return;
    const crumbs = JSON.parse(el.dataset.crumbs || '[]');
    el.innerHTML = `<div style="padding:0.5rem 0;font-size:0.8rem;color:var(--text-muted);">
      ${crumbs.map((c, i) =>
        i < crumbs.length - 1
          ? `<a href="${c.href}" style="color:var(--text-dim);">${c.label}</a> <span style="margin:0 0.4rem;">›</span>`
          : `<span style="color:var(--teal);">${c.label}</span>`
      ).join('')}
    </div>`;
  }

  // ===== INIT =====
  function init() {
    renderNav();
    renderFooter();
    renderBreadcrumb();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.DicoFlowNav = { renderNav, renderFooter };
})();
