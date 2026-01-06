// main.js

(function () {
  const STORAGE_KEY = "arp_lang";
  const DEFAULT_LANG = "en";

  function getLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "es") return saved;
    return DEFAULT_LANG;
  }

  function applyTranslations(lang) {
    const dict = window.I18N_STRINGS?.[lang];
    if (!dict) return;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = dict[key];
      if (typeof value === "string") el.textContent = value;
    });

    // title support
    const titleEl = document.querySelector("title[data-i18n]");
    if (titleEl) {
      const key = titleEl.getAttribute("data-i18n");
      const value = dict[key];
      if (typeof value === "string") document.title = value;
    }

    document.documentElement.lang = lang;
  }

  function updateLangToggleLabel(lang) {
    const labelEl = document.getElementById("langToggleLabel");
    if (!labelEl) return;

    // show the OTHER language as the action
    const actionKey = lang === "en" ? "toggleToSpanish" : "toggleToEnglish";
    const dict = window.I18N_STRINGS?.[lang] || window.I18N_STRINGS?.en;
    labelEl.textContent = dict?.[actionKey] || (lang === "en" ? "Español" : "English");
  }

  function setLanguage(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyTranslations(lang);
    updateLangToggleLabel(lang);
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

      if (status) status.textContent = dict.formThanks || "Thanks!";
      form.reset();
    });
  }

  // init
  const initial = getLanguage();
  applyTranslations(initial);
  updateLangToggleLabel(initial);
  wireLanguageToggle();
  wireContactForm();
})();
