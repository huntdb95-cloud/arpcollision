// sidebar.js
// Desktop sidebar navigation injection

(function() {
  'use strict';

  function initSidebar() {
    const sidebarEl = document.getElementById('sidebar');
    if (!sidebarEl) return;

    // Determine base path based on current location
    const currentPath = window.location.pathname;
    let pathPrefix = '';
    
    if (currentPath.includes('/expenses/') ||
        currentPath.includes('/invoice/') ||
        currentPath.includes('/job-estimator/') ||
        currentPath.includes('/contract-scanner/') ||
        currentPath.includes('/audit/') ||
        currentPath.includes('/bookkeeping/') ||
        currentPath.includes('/tools/') ||
        currentPath.includes('/settings/')) {
      pathPrefix = '../';
    } else if (currentPath.includes('/contracts/')) {
      pathPrefix = '../';
    }

    // Get translation helper
    function getTranslation(key) {
      const lang = localStorage.getItem('arp_lang') || 'en';
      const dict = window.I18N?.[lang] || window.I18N?.en || window.I18N_STRINGS?.[lang] || window.I18N_STRINGS?.en || {};
      return dict[key] || key;
    }

    const sidebarHTML = `
      <aside class="sidebar">
        <div class="sidebar-header">
          <a href="${pathPrefix}index.html" class="sidebar-brand">
            <img src="${pathPrefix}assets/logonew.png" alt="ARP Collision Repair" class="sidebar-logo" />
          </a>
        </div>
        <nav class="sidebar-nav">
          <ul class="sidebar-menu">
            <li class="sidebar-menu-item">
              <a href="${pathPrefix}index.html" class="sidebar-link" data-nav="home">
                <span class="sidebar-icon"><i class="bx bx-home"></i></span>
                <span class="sidebar-label" data-i18n="navHome">Home</span>
              </a>
            </li>
            <li class="sidebar-menu-item">
              <a href="${pathPrefix}services.html" class="sidebar-link" data-nav="services">
                <span class="sidebar-icon"><i class="bx bx-wrench"></i></span>
                <span class="sidebar-label" data-i18n="navServices">Services</span>
              </a>
            </li>
            <li class="sidebar-menu-item">
              <a href="${pathPrefix}contact.html" class="sidebar-link" data-nav="contact">
                <span class="sidebar-icon"><i class="bx bx-envelope"></i></span>
                <span class="sidebar-label" data-i18n="navContact">Contact</span>
              </a>
            </li>
            <li class="sidebar-menu-item has-submenu">
              <a href="${pathPrefix}tools/tools.html" class="sidebar-link" data-nav="tools">
                <span class="sidebar-icon"><i class="bx bx-grid-alt"></i></span>
                <span class="sidebar-label" data-i18n="navTools">Tools</span>
                <span class="sidebar-arrow"><i class="bx bx-chevron-down"></i></span>
              </a>
              <ul class="sidebar-submenu">
                <li class="sidebar-submenu-item">
                  <a href="${pathPrefix}expenses/expenses.html" class="sidebar-link sidebar-submenu-link" data-nav="expenses">
                    <span class="sidebar-icon"><i class="bx bx-wallet"></i></span>
                    <span class="sidebar-label" data-i18n="nav.expenses">Business Expenses</span>
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </aside>
    `;

    sidebarEl.innerHTML = sidebarHTML;

    // Mark active link
    markActiveLink();

    // Toggle submenu
    const submenuToggle = sidebarEl.querySelector('.has-submenu > .sidebar-link');
    if (submenuToggle) {
      submenuToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const menuItem = submenuToggle.closest('.sidebar-menu-item');
        menuItem.classList.toggle('active');
      });
    }

    // Apply translations
    applySidebarTranslations();
  }

  function markActiveLink() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.sidebar-link[data-nav]');
    
    links.forEach(link => {
      const nav = link.getAttribute('data-nav');
      link.classList.remove('active');
      
      if (currentPath.includes(`/${nav}/`) || 
          (nav === 'tools' && currentPath.includes('/tools/tools.html')) ||
          (nav === 'expenses' && currentPath.includes('/expenses/'))) {
        link.classList.add('active');
        // Also mark parent if it's a submenu item
        const submenuItem = link.closest('.sidebar-submenu-item');
        if (submenuItem) {
          const parentLink = submenuItem.closest('.sidebar-menu-item')?.querySelector('.sidebar-link');
          if (parentLink) parentLink.classList.add('active');
          submenuItem.closest('.sidebar-menu-item')?.classList.add('active');
        }
      }
    });
  }

  function applySidebarTranslations() {
    const lang = localStorage.getItem('arp_lang') || 'en';
    const dict = window.I18N?.[lang] || window.I18N?.en || window.I18N_STRINGS?.[lang] || window.I18N_STRINGS?.en || {};
    
    document.querySelectorAll('.sidebar-label[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = dict[key];
      if (typeof value === 'string') el.textContent = value;
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
  } else {
    initSidebar();
  }

  // Re-apply translations on language change
  document.addEventListener('i18n:updated', applySidebarTranslations);
})();

