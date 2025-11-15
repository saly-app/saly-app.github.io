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

/* ===== Guest Name ===== */
function getGuestNameFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const raw = urlParams.get('to');
  if (!raw) return 'ស្វាមី និង ភរិយា';
  return decodeURIComponent(raw.replace(/\+/g, ' ')).trim() || 'ស្វាមី និង ភរិយា';
}
const invitationData = { guestName: getGuestNameFromURL() };
function loadNames() {
  const n1 = document.getElementById('tag_name_list');
  const n2 = document.getElementById('tag_name_list_2');
  if (n1) n1.textContent = invitationData.guestName;
  if (n2) n2.textContent = invitationData.guestName;
}

/* ===== Scroll Reveal ===== */
const observerOptions = { root: null, rootMargin: '0px 0px -100px 0px', threshold: 0.1 };
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
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
  loadNames();

  // Section 1 (page 1 hero)
  const hero1 = document.getElementById('hero-header');
  const overlayBtn = document.getElementById('content-overlay');

  // Intro layer
  const introLayer = document.getElementById('intro-video-layer');
  const introVideo = document.getElementById('intro-video');
  const introSkip  = document.getElementById('intro-skip');

  // Page 2
  const page2Backdrop = document.getElementById('video-bg-page2');
  const hero2   = document.getElementById('hero-header-2');
  const invite2 = document.getElementById('invite-2');
  const page2Main = document.getElementById('page2-main');
  const khmerInvite = document.getElementById('khmer-invite');

  // Bottom nav
  const bottomNav = document.getElementById('bottom-nav');

  function hideSection1Now() {
    hero1.style.opacity = '0';
    hero1.style.height  = '0';
    hero1.style.display = 'none';
  }

  // Helper: scroll inside PAGE 2 to a specific section
  function scrollToSection(id) {
    const target = document.getElementById(id);
    if (!target || !page2Main) return;

    // wait a frame to ensure layout is ready
    requestAnimationFrame(() => {
      const offset = target.offsetTop - page2Main.offsetTop;
      page2Main.scrollTo({ top: offset, behavior: 'smooth' });
    });

    // update active state in bottom nav
    if (bottomNav) {
      const items = bottomNav.querySelectorAll('.nav-item');
      items.forEach(btn => {
        const t = btn.getAttribute('data-target');
        btn.classList.toggle('active', t === id);
      });
    }
  }

  // Go straight to PAGE 2 main and focus #khmer-invite
  function goToKhmerInvite() {
    // Hide intro layer
    introLayer.classList.remove('show');
    setTimeout(() => introLayer.classList.add('hidden'), 200);

    // Show fixed video backdrop
    page2Backdrop.classList.remove('hidden');

    // Hide hero-header-2 in this flow
    hero2.style.display = 'none';
    if (invite2) {
      invite2.classList.add('fade-out');
      invite2.setAttribute('aria-hidden', 'true');
      invite2.inert = true;
      invite2.style.pointerEvents = 'none';
    }

    // Show PAGE 2 main
    page2Main.classList.remove('hidden');
    page2Main.style.position = 'absolute';
    page2Main.style.left = '0';
    page2Main.style.right = '0';
    page2Main.style.bottom = '0';
    page2Main.style.top = '0';

    // Show bottom nav
    if (bottomNav) {
      bottomNav.classList.remove('hidden');
    }

    // Make #khmer-invite visible immediately
    if (khmerInvite) khmerInvite.classList.add('is-visible');

    // Ensure images are loaded before scrolling
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
        page2Main.scrollTop = 0;
        scrollToSection('khmer-invite');
      });
    });

    // Start reveal observer for all sections
    observeContentSections();
  }

  function showIntroVideo() {
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

    // Safety timeout
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

  // Skip intro
  introSkip.addEventListener('click', (e) => {
    e.stopPropagation();
    try { introVideo.pause(); } catch {}
    goToKhmerInvite();
  });

  // Bottom nav click handlers
  if (bottomNav) {
    bottomNav.addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-item');
      if (!btn) return;
      const targetId = btn.getAttribute('data-target');
      if (!targetId) return;
      scrollToSection(targetId);
    });
  }
});
