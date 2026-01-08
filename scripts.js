// scripts.js
// Main application scripts with Firebase initialization and translations

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase config - replace with your actual config
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Make auth available globally
window.auth = auth;

// Translation dictionary
const I18N = {
  en: {
    // Navigation
    "navHome": "Home",
    "navServices": "Services",
    "navContact": "Contact",
    "navTools": "Tools",
    "nav.expenses": "Business Expenses",
    
    // Expenses
    "expenses.pageTitle": "Business Expenses",
    "expenses.pageSubtitle": "Track expenses, attach receipts, and export reports.",
    "expenses.cardDesc": "Track expenses, attach receipts, and export reports by date range.",
    "expenses.addTitle": "Add Expense",
    "expenses.date": "Date",
    "expenses.vendor": "Vendor",
    "expenses.amount": "Amount",
    "expenses.category": "Category",
    "expenses.paymentMethod": "Payment Method",
    "expenses.memo": "Memo / Notes",
    "expenses.receipt": "Receipt",
    "expenses.uploadReceipt": "Upload Receipt (PDF, JPG, or PNG, max 10MB)",
    "expenses.save": "Save Expense",
    "expenses.clear": "Clear",
    "expenses.filtersTitle": "Filters & Export",
    "expenses.fromDate": "From",
    "expenses.toDate": "To",
    "expenses.allCategories": "All categories",
    "expenses.sortBy": "Sort by",
    "expenses.sortNewest": "Newest",
    "expenses.sortOldest": "Oldest",
    "expenses.sortAmtHigh": "Amount (high → low)",
    "expenses.sortAmtLow": "Amount (low → high)",
    "expenses.downloadCsv": "Download CSV",
    "expenses.downloadZip": "Download ZIP (CSV + receipts)",
    "expenses.listTitle": "Expenses",
    "expenses.noResults": "No expenses found for the selected filters.",
    "expenses.receiptAttached": "Receipt attached",
    "expenses.noReceipt": "No receipt",
    "expenses.viewReceipt": "View Receipt",
    "expenses.downloadReceipt": "Download Receipt",
    "expenses.delete": "Delete",
    "expenses.confirmDelete": "Delete this expense? This will also delete the receipt file if attached.",
    "expenses.errRequired": "Please fill out all required fields.",
    "expenses.errInvalidFile": "Invalid file type. Upload PDF or image (JPG/PNG).",
    "expenses.errFileTooLarge": "File too large. Maximum size is 10MB.",
    "expenses.saved": "Expense saved.",
    "expenses.deleted": "Expense deleted.",
    "expenses.uploadFailed": "Receipt upload failed.",
    "expenses.exportNoRows": "No expenses to export for the selected filters.",
    "expenses.loadError": "Error loading expenses.",
    "expenses.saveError": "Error saving expense.",
    "expenses.deleteError": "Error deleting expense.",
    
    // Tools
    "tools.pageTitle": "Tools",
    "tools.pageSubtitle": "Business tools and utilities.",
    "tools.openTool": "Open Tool →",
    
    // Global
    "skipToContent": "Skip to content",
    "footerTagline": "Built to help drivers get back on the road with confidence.",
    "footerCopyright": "© 2026 ARP Collision Repair",
  },
  
  es: {
    // Navigation
    "navHome": "Inicio",
    "navServices": "Servicios",
    "navContact": "Contacto",
    "navTools": "Herramientas",
    "nav.expenses": "Gastos del Negocio",
    
    // Expenses
    "expenses.pageTitle": "Gastos del Negocio",
    "expenses.pageSubtitle": "Registra gastos, adjunta recibos y exporta reportes.",
    "expenses.cardDesc": "Registra gastos, adjunta recibos y exporta reportes por rango de fechas.",
    "expenses.addTitle": "Agregar Gasto",
    "expenses.date": "Fecha",
    "expenses.vendor": "Proveedor",
    "expenses.amount": "Monto",
    "expenses.category": "Categoría",
    "expenses.paymentMethod": "Método de Pago",
    "expenses.memo": "Notas",
    "expenses.receipt": "Recibo",
    "expenses.uploadReceipt": "Subir Recibo (PDF, JPG o PNG, máx. 10MB)",
    "expenses.save": "Guardar Gasto",
    "expenses.clear": "Limpiar",
    "expenses.filtersTitle": "Filtros y Exportación",
    "expenses.fromDate": "Desde",
    "expenses.toDate": "Hasta",
    "expenses.allCategories": "Todas las categorías",
    "expenses.sortBy": "Ordenar por",
    "expenses.sortNewest": "Más recientes",
    "expenses.sortOldest": "Más antiguos",
    "expenses.sortAmtHigh": "Monto (alto → bajo)",
    "expenses.sortAmtLow": "Monto (bajo → alto)",
    "expenses.downloadCsv": "Descargar CSV",
    "expenses.downloadZip": "Descargar ZIP (CSV + recibos)",
    "expenses.listTitle": "Gastos",
    "expenses.noResults": "No se encontraron gastos para los filtros seleccionados.",
    "expenses.receiptAttached": "Recibo adjunto",
    "expenses.noReceipt": "Sin recibo",
    "expenses.viewReceipt": "Ver Recibo",
    "expenses.downloadReceipt": "Descargar Recibo",
    "expenses.delete": "Eliminar",
    "expenses.confirmDelete": "¿Eliminar este gasto? Esto también eliminará el recibo si está adjunto.",
    "expenses.errRequired": "Completa todos los campos obligatorios.",
    "expenses.errInvalidFile": "Tipo de archivo inválido. Sube PDF o imagen (JPG/PNG).",
    "expenses.errFileTooLarge": "Archivo demasiado grande. Tamaño máximo 10MB.",
    "expenses.saved": "Gasto guardado.",
    "expenses.deleted": "Gasto eliminado.",
    "expenses.uploadFailed": "Falló la subida del recibo.",
    "expenses.exportNoRows": "No hay gastos para exportar con los filtros seleccionados.",
    "expenses.loadError": "Error al cargar gastos.",
    "expenses.saveError": "Error al guardar gasto.",
    "expenses.deleteError": "Error al eliminar gasto.",
    
    // Tools
    "tools.pageTitle": "Herramientas",
    "tools.pageSubtitle": "Herramientas y utilidades del negocio.",
    "tools.openTool": "Abrir Herramienta →",
    
    // Global
    "skipToContent": "Saltar al contenido",
    "footerTagline": "Hecho para ayudar a los conductores a volver a la carretera con confianza.",
    "footerCopyright": "© 2026 ARP Collision Repair",
  }
};

// Merge with i18n.js if it exists
if (window.I18N_STRINGS) {
  Object.keys(I18N.en).forEach(key => {
    if (!window.I18N_STRINGS.en) window.I18N_STRINGS.en = {};
    if (!window.I18N_STRINGS.es) window.I18N_STRINGS.es = {};
    window.I18N_STRINGS.en[key] = I18N.en[key];
    window.I18N_STRINGS.es[key] = I18N.es[key];
  });
}

// Make I18N available globally
window.I18N = I18N;

// Auth guard for pages that require authentication
function checkAuth() {
  const body = document.body;
  if (body && body.getAttribute('data-requires-auth') === 'true') {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Redirect to login or show message
        const mainEl = document.getElementById('main');
        if (mainEl && !mainEl.querySelector('.auth-required-message')) {
          const message = document.createElement('div');
          message.className = 'auth-required-message';
          message.style.cssText = 'padding: 40px; text-align: center;';
          message.innerHTML = '<p class="muted">Please log in to access this page.</p>';
          mainEl.innerHTML = '';
          mainEl.appendChild(message);
        }
      }
    });
  }
}

// Initialize auth check
checkAuth();

// Apply translations on load
document.addEventListener('DOMContentLoaded', () => {
  const lang = localStorage.getItem('arp_lang') || 'en';
  applyTranslations(lang);
});

// Apply translations function
function applyTranslations(lang) {
  const dict = I18N[lang] || I18N.en;
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const value = dict[key];
    if (typeof value === 'string') {
      if (el.tagName === 'TITLE' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.tagName === 'TITLE') {
          document.title = value;
        } else {
          el.placeholder = value;
        }
      } else {
        el.textContent = value;
      }
    }
  });
  
  // Dispatch event for other scripts
  document.dispatchEvent(new CustomEvent('i18n:updated', { detail: { lang } }));
}

// Listen for language changes
document.addEventListener('i18n:updated', (e) => {
  applyTranslations(e.detail.lang);
});

