const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const navLinks = document.querySelector('[data-nav-links]');
const year = document.querySelector('[data-year]');
const copyButton = document.querySelector('[data-copy]');
const copyStatus = document.querySelector('[data-copy-status]');
const langToggle = document.querySelector('[data-lang-toggle]');
const langLabel = document.querySelector('[data-lang-label]');
const htmlDoc = document.documentElement;

/* ── Language switching ── */
const LANG_KEY = 'habib-site-lang';

function getLang() {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === 'fr' || stored === 'en') return stored;
  } catch (_) {}
  const browser = navigator.language || navigator.userLanguage || '';
  return browser.startsWith('fr') ? 'fr' : 'en';
}

function setLang(lang) {
  htmlDoc.setAttribute('lang', lang);
  htmlDoc.setAttribute('data-lang', lang);
  try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}

  // Update all elements with data-en/data-fr
  document.querySelectorAll('[data-en][data-fr]').forEach(el => {
    const val = el.getAttribute(lang === 'fr' ? 'data-fr' : 'data-en');
    if (el.tagName === 'META') {
      el.setAttribute('content', val);
    } else if (el.tagName === 'TITLE') {
      document.title = val;
    } else {
      el.textContent = val;
    }
  });

  // Update lang label
  if (langLabel) {
    langLabel.textContent = lang === 'fr' ? 'EN' : 'FR';
  }

  // Update lang toggle title
  if (langToggle) {
    langToggle.setAttribute('title', lang === 'fr' ? 'Switch to English' : 'Passer en français');
  }

  // Update copy button strings
  if (copyButton) {
    copyButton.setAttribute('data-copy-string', copyButton.getAttribute(lang === 'fr' ? 'data-copy-fr' : 'data-copy-en'));
  }

  // Update JSON-LD schema
  const schemaEl = document.querySelector('[data-i18n-schema]');
  if (schemaEl) {
    try {
      const schema = JSON.parse(schemaEl.textContent);
      if (schema.jobTitle && typeof schema.jobTitle === 'object') {
        schema.jobTitle = schema.jobTitle[lang] || schema.jobTitle.en;
        schemaEl.textContent = JSON.stringify(schema);
      }
    } catch (_) {}
  }

  // Update og:title and og:description
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogTitle) ogTitle.setAttribute('content', ogTitle.getAttribute(lang === 'fr' ? 'data-fr' : 'data-en'));
  if (ogDesc) ogDesc.setAttribute('content', ogDesc.getAttribute(lang === 'fr' ? 'data-fr' : 'data-en'));
}

// Initialize language
const currentLang = getLang();
setLang(currentLang);
if (langToggle) {
  langToggle.addEventListener('click', () => {
    const next = htmlDoc.getAttribute('data-lang') === 'fr' ? 'en' : 'fr';
    setLang(next);
  });
}

/* ── Year ── */
if (year) year.textContent = new Date().getFullYear();

/* ── Navigation ── */
navToggle?.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  navLinks?.classList.toggle('open');
});

navLinks?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

/* ── Reveal animations ── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

/* ── Copy positioning line ── */
if (copyButton) {
  const enLine = copyButton.getAttribute('data-copy-en');
  const frLine = copyButton.getAttribute('data-copy-fr');

  copyButton.addEventListener('click', async () => {
    const lang = htmlDoc.getAttribute('data-lang') || 'en';
    const line = lang === 'fr' ? frLine : enLine;
    const feedback = lang === 'fr' ? 'Phrase copiée.' : 'Positioning line copied.';
    try {
      await navigator.clipboard.writeText(line);
      if (copyStatus) copyStatus.textContent = feedback;
    } catch (error) {
      if (copyStatus) copyStatus.textContent = line;
    }
  });
}

/* ── Scroll header shadow ── */
window.addEventListener('scroll', () => {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 12);
}, { passive: true });
