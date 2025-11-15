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
  mediaQuery.addEventListener ? mediaQuery.addEventListener('change', apply)
                              : mediaQuery.addListener(apply);
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

/* ===== Scroll Reveal (root = #page2-main) ===== */
function observeContentSections() {
  const page2Main = document.getElementById('page2-main');
  if (!page2Main) return;

  const observerOptions = {
    root: page2Main,
    rootMargin: '0px 0px -100px 0px',
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

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

  // Page 1
  const hero1 = document.getElementById('hero-header');
  const overlayBtn = document.getElementById('content-overlay');

  // Intro
  const introLayer = document.getElementById('intro-video-layer');
  const introVideo = document.getElementById('intro-video');
  const introSkip  = document.getElementById('intro-skip');

  // Page 2
  const page2Backdrop = document.getElementById('video-bg-page2');
  const hero2   = document.getElementById('hero-header-2');
  const invite2 = document.getElementById('invite-2');
  const page2Main = document.getElementById('page2-main');
  const khmerInvite = document.getElementById('khmer-invite');

  function hideSection1Now() {
    hero1.style.opacity = '0';
    hero1.style.height  = '0';
    hero1.style.display = 'none';
  }

  function waitForImages(el) {
    const imgs = Array.from(el.querySelectorAll('img'));
    if (!imgs.length) return Promise.resolve();
    return Promise.all(
      imgs.map(img =>
        img.complete
          ? Promise.resolve()
          : new Promise(res => {
              img.addEventListener('load', res, { once: true });
              img.addEventListener('error', res, { once: true });
            })
      )
    );
  }

  function goToKhmerInvite() {
    // hide intro overlay
    introLayer.classList.remove('show');
    setTimeout(() => introLayer.classList.add('hidden'), 200);

    // show looping bg video
    page2Backdrop.classList.remove('hidden');

    // hide hero 2 in this flow
    hero2.style.display = 'none';
    if (invite2) {
      invite2.classList.add('fade-out');
      invite2.setAttribute('aria-hidden', 'true');
      invite2.inert = true;
      invite2.style.pointerEvents = 'none';
    }

    // show page2 main; it already fills the phone (CSS)
    page2Main.classList.remove('hidden');

    // show first section immediately
    if (khmerInvite) khmerInvite.classList.add('is-visible');

    // scroll inner container to khmer-invite
    requestAnimationFrame(() => {
      waitForImages(khmerInvite || document).then(() => {
        page2Main.scrollTop = 0;

        if (khmerInvite) {
          const sectionRect = khmerInvite.getBoundingClientRect();
          const parentRect  = page2Main.getBoundingClientRect();
          const targetTop   = sectionRect.top - parentRect.top + page2Main.scrollTop;

          page2Main.scrollTo({ top: targetTop, behavior: 'smooth' });
        }
      });
    });

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

    // safety timeout
    setTimeout(() => {
      if (!introVideo.paused && !introVideo.ended) return;
      goToKhmerInvite();
    }, 30000);
  }

  function onFirstClick() { showIntroVideo(); }

  overlayBtn.addEventListener('click', onFirstClick);
  overlayBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onFirstClick(); }
  });

  introSkip.addEventListener('click', (e) => {
    e.stopPropagation();
    try { introVideo.pause(); } catch {}
    goToKhmerInvite();
  });
});
