// main.js

(function () {
  const STORAGE_KEY = "arp_lang";
  const DEFAULT_LANG = "en";

  function getLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (saved === "en" || saved === "es")) return saved;
    return DEFAULT_LANG;
  }

  function setLanguage(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyTranslations(lang);
    updateLangToggleText(lang);
    // also set the <html lang="">
    document.documentElement.lang = lang;
  }

  function applyTranslations(lang) {
    const dict = window.I18N_STRINGS?.[lang];
    if (!dict) return;

    // Translate all [data-i18n]
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = dict[key];

      // If key is missing, leave original text alone (helpful during development).
      if (typeof value === "string") {
        el.textContent = value;
      }
    });

    // Translate the page <title> if it has data-i18n on a tag (we used it on the <title> in some pages)
    // Note: Some browsers won't reflect data-i18n on <title> via querySelectorAll in all cases,
    // so we also update document.title if a key exists.
    const titleEl = document.querySelector("title[data-i18n]");
    if (titleEl) {
      const key = titleEl.getAttribute("data-i18n");
      const value = dict[key];
      if (typeof value === "string") document.title = value;
    }
  }

  function updateLangToggleText(lang) {
    const btn = document.getElementById("langToggle");
    if (!btn) return;

    // Button shows the OTHER language as the action
    const actionKey = lang === "en" ? "toggleToSpanish" : "toggleToEnglish";
    const dict = window.I18N_STRINGS?.[lang];
    const label = dict?.[actionKey];

    const span = btn.querySelector("[data-i18n]");
    // keep the span's data-i18n so it can be translated too; just ensure it displays correctly after toggle
    if (span && typeof label === "string") span.textContent = label;
  }

  function wireLanguageToggle() {
    const btn = document.getElementById("langToggle");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const current = getLanguage();
      const next = current === "en" ? "es" : "en";
      setLanguage(next);
    });
  }

  function wireContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const status = document.getElementById("formStatus");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const lang = getLanguage();
      const dict = window.I18N_STRINGS?.[lang] || window.I18N_STRINGS?.en;

      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const message = (data.get("message") || "").toString().trim();

      if (!name || !email || !message) {
        if (status) status.textContent = dict.formMissing || "Please fill out required fields.";
        return;
      }

      // Demo-only: just show a success message
      if (status) status.textContent = dict.formThanks || "Thanks!";

      // If you later add a backend endpoint, you'd POST here instead.
      // fetch("/api/contact", { method:"POST", body: JSON.stringify({name,email,message}) ...})
      form.reset();
    });
  }

  // Init
  const initial = getLanguage();
  applyTranslations(initial);
  updateLangToggleText(initial);
  wireLanguageToggle();
  wireContactForm();
})();
