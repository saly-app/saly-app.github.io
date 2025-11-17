/* ===== Viewport Height Fix ===== */
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setViewportHeight();
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);
document.addEventListener('visibilitychange', () => { if (!document.hidden) setViewportHeight(); });

/* ===== Desktop Scale ===== */
function applyPhoneScale() {
  const BASE_W = 390, BASE_H = 844;
  const sw = window.innerWidth, sh = window.innerHeight;
  if (sw <= 520) {
    document.documentElement.style.setProperty('--scale', '1');
    return;
  }
  const scale = Math.min(sw / BASE_W, sh / BASE_H);
  document.documentElement.style.setProperty('--scale', scale.toString());
}
applyPhoneScale();
window.addEventListener('resize', applyPhoneScale);
window.addEventListener('orientationchange', applyPhoneScale);
document.addEventListener('visibilitychange', () => { if (!document.hidden) applyPhoneScale(); });

/* ===== Reduced Motion for Videos ===== */
(function controlVideosForReducedMotion() {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const vids = ['bg-video','background-video','hero-background-video','intro-video']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  function apply() {
    vids.forEach(v => {
      if (mediaQuery.matches) {
        v.pause();
        v.removeAttribute('autoplay');
      } else if (v.paused) {
        v.play().catch(() => {});
      }
    });
  }
  mediaQuery.addEventListener ? mediaQuery.addEventListener('change', apply) : mediaQuery.addListener(apply);
  apply();
})();

/* ===== Guest Name from guests.csv ===== */
function setGuestNameText(name) {
  const displayName = name || 'ស្វាមី និង ភរិយា';

  const n1 = document.getElementById('tag_name_list');
  const n2 = document.getElementById('tag_name_list_2');

  if (n1) n1.textContent = displayName;
  if (n2) n2.textContent = displayName;
}

function loadGuestFromCSV() {
  const urlParams = new URLSearchParams(window.location.search);
  const guestId = urlParams.get('to');  // e.g. ?to=10001kimny

  // No code in URL → use default text
  if (!guestId) {
    setGuestNameText(null);
    return;
  }

  fetch('./guests.csv')
    .then((res) => {
      if (!res.ok) {
        throw new Error('Failed to load guests.csv');
      }
      return res.text();
    })
    .then((csvText) => {
      const lines = csvText.split(/\r?\n/);
      let foundName = null;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // split only on the first comma
        const [id, ...rest] = trimmed.split(',');
        const name = rest.join(',').trim();

        if (id === guestId) {
          foundName = name;
          break;
        }
      }

      setGuestNameText(foundName);
    })
    .catch((err) => {
      console.error('Error reading guests.csv:', err);
      setGuestNameText(null); // fallback
    });
}

/* ===== Scroll Reveal (animate on scroll up & down) ===== */
const observerOptions = {
  root: null,
  rootMargin: '0px 0px -80px 0px', // start slightly before fully visible
  threshold: 0.15
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Element enters viewport → fade & slide in
      entry.target.classList.add('is-visible');
    } else {
      // Element leaves viewport → reset so it can animate again
      entry.target.classList.remove('is-visible');
    }
  });
}, observerOptions);

function observeContentSections() {
  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
}

/* ===== Gallery Modal ===== */
let galleryIndex = 0;
let galleryImages = [];

function openModal(src) {
  const modal = document.getElementById('gallery-modal');
  const img = document.getElementById('modal-image');
  img.src = src;
  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('gallery-modal').classList.add('hidden');
}

function showGalleryAt(i) {
  if (!galleryImages.length) return;
  galleryIndex = (i + galleryImages.length) % galleryImages.length;
  document.getElementById('modal-image').src = galleryImages[galleryIndex].src;
}

document.addEventListener('click', (e) => {
  if (e.target && e.target.matches('.gallery-thumbnail')) {
    galleryImages = Array.from(document.querySelectorAll('.gallery-thumbnail'));
    galleryIndex = galleryImages.indexOf(e.target);
    openModal(e.target.src);
  }
});

document.getElementById('prev-btn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  showGalleryAt(galleryIndex - 1);
});
document.getElementById('next-btn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  showGalleryAt(galleryIndex + 1);
});

/* ===== Page Flow ===== */
document.addEventListener('DOMContentLoaded', () => {
  // Lock scroll on first page
  document.body.classList.add('lock-scroll');

  loadGuestFromCSV();

  const hero1 = document.getElementById('hero-header');
  const overlayBtn = document.getElementById('content-overlay');

  const introLayer = document.getElementById('intro-video-layer');
  const introVideo = document.getElementById('intro-video');
  const introSkip  = document.getElementById('intro-skip');

  const page2Backdrop = document.getElementById('video-bg-page2');
  const hero2   = document.getElementById('hero-header-2');
  const invite2 = document.getElementById('invite-2');
  const page2Main = document.getElementById('page2-main');
  const khmerInvite = document.getElementById('khmer-invite');

  const mobileWrapper = document.getElementById('mobile-wrapper');

  // Music element
  const bgMusic = document.getElementById('bg-music');

  // Popup menu elements
  const menuToggle = document.getElementById('menu-toggle');
  const popupMenu  = document.getElementById('popup-menu');

  // Music item inside popup menu
  const menuMusicItem = document.getElementById('menu-item-music');
  const menuMusicIcon = document.getElementById('menu-music-icon');
  const menuMusicText = document.getElementById('menu-music-text');

  function updateMusicToggleUI() {
    if (!menuMusicItem || !menuMusicIcon || !menuMusicText) return;

    const isPlaying = bgMusic && !bgMusic.paused && !bgMusic.muted;

    if (isPlaying) {
      menuMusicIcon.textContent = '🔊';           // sound on
      menuMusicText.textContent = 'បិទតន្ត្រី'; // "mute music"
      menuMusicItem.setAttribute('aria-label', 'Mute music');
    } else {
      menuMusicIcon.textContent = '🔇';           // muted
      menuMusicText.textContent = 'បើកតន្ត្រី'; // "play music"
      menuMusicItem.setAttribute('aria-label', 'Play music');
    }
  }

  if (menuMusicItem) {
    menuMusicItem.addEventListener('click', (e) => {
      e.stopPropagation(); // don't trigger outer click handlers
      if (!bgMusic) return;

      if (bgMusic.paused || bgMusic.muted) {
        bgMusic.muted = false;
        bgMusic.play().catch((err) => console.warn('Music play blocked:', err));
      } else {
        bgMusic.pause();
      }

      updateMusicToggleUI();
    });
  }

  function getScrollContainer() {
    // On mobile: window scroll; on desktop: phone wrapper scrolls
    return window.innerWidth <= 520 ? window : mobileWrapper;
  }

  function hideSection1Now() {
    hero1.style.opacity = '0';
    hero1.style.height  = '0';
    hero1.style.display = 'none';
  }

  // Scroll to a section (single page)
  function scrollToSection(id) {
    const target = document.getElementById(id);
    if (!target) return;

    const container = getScrollContainer();

    if (container === window) {
      const rect = target.getBoundingClientRect();
      const offset = rect.top + window.pageYOffset - 80; // leave some space from top
      window.scrollTo({ top: offset, behavior: 'smooth' });
    } else {
      const cRect = container.getBoundingClientRect();
      const tRect = target.getBoundingClientRect();
      const offset = tRect.top - cRect.top + container.scrollTop - 80;
      container.scrollTo({ top: offset, behavior: 'smooth' });
    }

    // Close popup after selection
    if (popupMenu && !popupMenu.classList.contains('hidden')) {
      popupMenu.classList.add('hidden');
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    }
  }

  // Go to page 2 single-page view and focus Khmer invite
  function goToKhmerInvite() {
    // Unlock scroll from now on (Page 2)
    document.body.classList.remove('lock-scroll');

    // Hide intro
    introLayer.classList.remove('show');
    setTimeout(() => introLayer.classList.add('hidden'), 200);

    // Show fixed background video
    page2Backdrop.classList.remove('hidden');

    // Don't use hero-header-2 in this flow
    hero2.style.display = 'none';
    if (invite2) {
      invite2.classList.add('fade-out');
      invite2.setAttribute('aria-hidden', 'true');
      invite2.inert = true;
      invite2.style.pointerEvents = 'none';
    }

    // Show main content
    page2Main.classList.remove('hidden');

    // Show FAB only now, keep popup menu closed
    if (menuToggle) {
      menuToggle.classList.remove('hidden');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
    if (popupMenu) {
      popupMenu.classList.add('hidden');
    }

    // Update music UI in case music already playing/stopped
    updateMusicToggleUI();

    // Reveal first section immediately
    if (khmerInvite) khmerInvite.classList.add('is-visible');

    function waitForImages(el) {
      const imgs = Array.from(el.querySelectorAll('img'));
      if (!imgs.length) return Promise.resolve();
      return Promise.all(
        imgs.map(img => img.complete ? Promise.resolve() : new Promise(res => {
          img.addEventListener('load', res, { once: true });
          img.addEventListener('error', res, { once: true });
        }))
      );
    }

    requestAnimationFrame(() => {
      waitForImages(khmerInvite || document).then(() => {
        const container = getScrollContainer();
        if (container === window) {
          window.scrollTo(0, 0);
        } else if (container) {
          container.scrollTop = 0;
        }
        scrollToSection('khmer-invite');
      });
    });

    // Start observing sections for scroll animations
    observeContentSections();
  }

  function showIntroVideo() {
    // Start music when intro opens (user gesture)
    if (bgMusic) {
      bgMusic.currentTime = 0;
      const playPromise = bgMusic.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            updateMusicToggleUI();
          })
          .catch(err => {
            console.warn('Music play blocked:', err);
            updateMusicToggleUI();
          });
      } else {
        updateMusicToggleUI();
      }
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hideSection1Now();
      goToKhmerInvite();
      return;
    }

    hideSection1Now();

    introLayer.classList.add('show');
    introLayer.classList.remove('hidden');

    introVideo.currentTime = 0;
    const p = introVideo.play();
    if (p && typeof p.then === 'function') {
      p.catch(() => introVideo.setAttribute('controls', 'controls'));
    }
    introVideo.onended = () => goToKhmerInvite();

    setTimeout(() => {
      if (!introVideo.paused && !introVideo.ended) return;
      goToKhmerInvite();
    }, 30000);
  }

  function onFirstClick() {
    showIntroVideo();
  }

  overlayBtn.addEventListener('click', onFirstClick);
  overlayBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onFirstClick();
    }
  });

  introSkip.addEventListener('click', (e) => {
    e.stopPropagation();
    try { introVideo.pause(); } catch {}
    hideSection1Now();
    goToKhmerInvite();
  });

  // Popup menu toggle
  if (menuToggle && popupMenu) {
    menuToggle.addEventListener('click', () => {
      const isHidden = popupMenu.classList.contains('hidden');
      popupMenu.classList.toggle('hidden');
      menuToggle.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    });

    // Click on menu items
    popupMenu.addEventListener('click', (e) => {
      const btn = e.target.closest('.menu-item');
      if (!btn) return;

      // Music item is handled separately
      if (btn.id === 'menu-item-music') {
        return;
      }

      const targetId = btn.getAttribute('data-target');
      if (!targetId) return;
      scrollToSection(targetId);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (
        !popupMenu.classList.contains('hidden') &&
        !popupMenu.contains(e.target) &&
        e.target !== menuToggle &&
        !menuToggle.contains(e.target)
      ) {
        popupMenu.classList.add('hidden');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
});

/* ===== Disable pinch-zoom & double-tap zoom ===== */

// Block pinch-zoom gestures (iOS Safari)
['gesturestart', 'gesturechange', 'gestureend'].forEach((evt) => {
  document.addEventListener(
    evt,
    function (e) {
      e.preventDefault();
    },
    { passive: false }
  );
});

// Block double-tap zoom
let lastTouchEnd = 0;
document.addEventListener(
  'touchend',
  function (e) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  },
  { passive: false }
);
