/* =========================================================
   YAMI RAMEN & BBQ — script.js
   Two small, self-contained behaviors:
   1) Mobile nav toggle (hamburger menu)
   2) Menu category tabs (show/hide panels)
   No frameworks, no build step — just the DOM APIs every
   browser gives you for free.
   ========================================================= */

// ---------- 1) Mobile nav toggle ----------
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  // Keep the button's accessible state in sync with what's visible,
  // so screen readers announce "expanded"/"collapsed" correctly.
  navToggle.setAttribute('aria-expanded', isOpen);
});

// Close the mobile menu automatically once a link is tapped,
// so the menu doesn't stay open after navigating to a section.
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ---------- 2) Menu category tabs ----------
const tabButtons = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.panel');

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const targetId = button.dataset.tab; // reads data-tab="ramen" etc.

    // Reset every button and panel, then activate only the one clicked.
    // This "reset-then-activate" pattern is the simplest way to keep
    // a tab UI in sync without tracking extra state.
    tabButtons.forEach((btn) => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    panels.forEach((panel) => panel.classList.remove('active'));

    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');
    document.querySelector(`[data-panel="${targetId}"]`).classList.add('active');
  });
});

// ---------- Small nicety: auto-update the footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- 3) Google Maps — click-to-load consent gate ----------
// Embedding a Google Maps <iframe> directly would set Google's cookies
// the instant the page loads, before the visitor agreed to anything.
// So instead we start with a placeholder + button, and only build the
// iframe once someone actually clicks "Karte laden". The choice is
// remembered in localStorage so returning visitors see the map right away.
const mapPlaceholder = document.getElementById('mapPlaceholder');
const MAPS_CONSENT_KEY = 'yami_maps_consent';

function loadMap() {
  const address = mapPlaceholder.dataset.address;
  const src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  mapPlaceholder.innerHTML = `
    <div class="map-frame">
      <iframe
        src="${src}"
        title="Standort von YAMI Ramen & BBQ"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        allowfullscreen>
      </iframe>
    </div>
  `;
}

if (localStorage.getItem(MAPS_CONSENT_KEY) === 'accepted') {
  loadMap();
} else {
  document.getElementById('loadMapBtn').addEventListener('click', () => {
    localStorage.setItem(MAPS_CONSENT_KEY, 'accepted');
    loadMap();
  });
}

// ---------- 4) Cookie consent banner ----------
// Nothing external loads before a choice is made. "Alle akzeptieren" fetches
// Google Fonts (the only thing on this page that transfers data to a third
// party on every visit); "Nur notwendige" keeps the local system font stack.
// The choice itself is stored in localStorage, which counts as technically
// necessary and needs no consent. Google Maps has its own separate gate
// above and isn't affected by this banner either way.
const COOKIE_CONSENT_KEY = 'yami_cookie_consent'; // 'all' | 'necessary'
const cookieBanner = document.getElementById('cookieBanner');

function loadGoogleFonts() {
  if (document.getElementById('google-fonts-link')) return; // already loaded

  const preconnect1 = document.createElement('link');
  preconnect1.rel = 'preconnect';
  preconnect1.href = 'https://fonts.googleapis.com';

  const preconnect2 = document.createElement('link');
  preconnect2.rel = 'preconnect';
  preconnect2.href = 'https://fonts.gstatic.com';
  preconnect2.crossOrigin = 'anonymous';

  const fontStylesheet = document.createElement('link');
  fontStylesheet.id = 'google-fonts-link';
  fontStylesheet.rel = 'stylesheet';
  fontStylesheet.href =
    'https://fonts.googleapis.com/css2?family=Anton&family=Space+Mono:wght@400;700&family=Work+Sans:wght@400;500;600;700&display=swap';

  document.head.append(preconnect1, preconnect2, fontStylesheet);
}

function applyCookieConsent(choice) {
  localStorage.setItem(COOKIE_CONSENT_KEY, choice);
  if (choice === 'all') loadGoogleFonts();
  cookieBanner.hidden = true;
}

const savedCookieConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
if (savedCookieConsent === 'all') {
  loadGoogleFonts();
} else if (!savedCookieConsent) {
  cookieBanner.hidden = false;
}

document.getElementById('cookieAccept').addEventListener('click', () => applyCookieConsent('all'));
document.getElementById('cookieDecline').addEventListener('click', () => applyCookieConsent('necessary'));

// Footer link lets visitors reopen the banner any time to change their mind —
// withdrawing consent has to be as easy as giving it.
document.getElementById('cookieSettingsLink').addEventListener('click', (event) => {
  event.preventDefault();
  cookieBanner.hidden = false;
});