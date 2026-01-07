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

  function wireCompareEstimateForm() {
    const form = document.getElementById("compareEstimateForm");
    if (!form) return;

    const status = document.getElementById("compareFormStatus");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const lang = getLanguage();
      const dict = window.I18N_STRINGS?.[lang] || window.I18N_STRINGS?.en;

      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const file = data.get("file");

      if (!name || !email || !file || file.size === 0) {
        if (status) status.textContent = dict.compareFormMissing || "Please fill out required fields.";
        return;
      }

      if (status) status.textContent = "";

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: data,
          headers: {
            "Accept": "application/json"
          }
        });

        if (response.ok) {
          if (status) status.textContent = dict.compareFormThanks || "Thanks! Your estimate has been submitted.";
          form.reset();
        } else {
          if (status) status.textContent = dict.compareFormError || "There was an error submitting your estimate. Please try again.";
        }
      } catch (error) {
        if (status) status.textContent = dict.compareFormError || "There was an error submitting your estimate. Please try again.";
      }
    });
  }

  function isIOS() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return isIOSDevice;
  }

  function wireDirectionsLinks() {
    const links = document.querySelectorAll('[data-directions-apple][data-directions-google]');
    if (!links.length) return;

    const useApple = isIOS();

    links.forEach((link) => {
      const googleURL = link.getAttribute('data-directions-google');
      const appleURL = link.getAttribute('data-directions-apple');
      
      if (useApple && appleURL) {
        link.href = appleURL;
      } else if (googleURL) {
        link.href = googleURL;
      }
    });
  }

  // init
  const initial = getLanguage();
  applyTranslations(initial);
  updateLangToggleLabel(initial);
  wireLanguageToggle();
  wireContactForm();
  wireCompareEstimateForm();
  wireDirectionsLinks();
})();
