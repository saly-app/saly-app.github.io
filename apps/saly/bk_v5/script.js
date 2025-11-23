/* ===== Viewport Height Fix ===== */
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', vh + 'px');
}
setViewportHeight();
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);
document.addEventListener('visibilitychange', function () {
  if (!document.hidden) setViewportHeight();
});

/* ===== Desktop Scale ===== */
function applyPhoneScale() {
  var BASE_W = 390, BASE_H = 844;
  var sw = window.innerWidth, sh = window.innerHeight;
  if (sw <= 520) {
    document.documentElement.style.setProperty('--scale', '1');
    return;
  }
  var scale = Math.min(sw / BASE_W, sh / BASE_H);
  document.documentElement.style.setProperty('--scale', String(scale));
}
applyPhoneScale();
window.addEventListener('resize', applyPhoneScale);
window.addEventListener('orientationchange', applyPhoneScale);
document.addEventListener('visibilitychange', function () {
  if (!document.hidden) applyPhoneScale();
});

/* ===== Reduced Motion for Videos ===== */
(function controlVideosForReducedMotion() {
  var mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var vids = ['bg-video', 'background-video', 'hero-background-video', 'intro-video']
    .map(function (id) { return document.getElementById(id); })
    .filter(function (el) { return !!el; });

  function apply() {
    vids.forEach(function (v) {
      if (mediaQuery.matches) {
        v.pause();
        v.removeAttribute('autoplay');
      } else if (v.paused) {
        v.play().catch(function () {});
      }
    });
  }
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', apply);
  } else if (mediaQuery.addListener) {
    mediaQuery.addListener(apply);
  }
  apply();
})();

/* ===== Guest Name from guests.csv ===== */
function setGuestNameText(name) {
  var displayName = name || 'ស្វាមី និង ភរិយា';

  var n1 = document.getElementById('tag_name_list');
  var n2 = document.getElementById('tag_name_list_2');

  if (n1) n1.textContent = displayName;
  if (n2) n2.textContent = displayName;
}

function loadGuestFromCSV() {
  var urlParams = new URLSearchParams(window.location.search);
  var guestId = urlParams.get('to');  // e.g. ?to=10001kimny

  // No code in URL → use default text
  if (!guestId) {
    setGuestNameText(null);
    return;
  }

  fetch('./guests.csv')
    .then(function (res) {
      if (!res.ok) {
        throw new Error('Failed to load guests.csv');
      }
      return res.text();
    })
    .then(function (csvText) {
      var lines = csvText.split(/\r?\n/);
      var foundName = null;

      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var trimmed = line.trim();
        if (!trimmed) continue;

        // split only on the first comma
        var parts = trimmed.split(',');
        var id = parts[0];
        var rest = parts.slice(1).join(',').trim();
        var name = rest;

        if (id === guestId) {
          foundName = name;
          break;
        }
      }

      setGuestNameText(foundName);
    })
    .catch(function (err) {
      console.error('Error reading guests.csv:', err);
      setGuestNameText(null); // fallback
    });
}

/* ===== Scroll Reveal (animate once) ===== */
var observerOptions = {
  root: null,
  rootMargin: '0px 0px -80px 0px',
  threshold: 0.15
};

var observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

function observeContentSections() {
  var els = document.querySelectorAll('[data-reveal]');
  for (var i = 0; i < els.length; i++) {
    observer.observe(els[i]);
  }
}

/* ===== Gallery Modal (click + arrows + swipe) ===== */
/* ============================================================
   GALLERY VIEWER (Fullscreen, Swipe, Zoom, Fade)
   Only modifies gallery behaviour — safe for your whole project.
   ============================================================ */

let galleryImages = [];
let galleryIndex = 0;

let viewer = null;
let viewerImg = null;
let viewerPrev = null;
let viewerNext = null;
let viewerClose = null;

/* Inject fullscreen viewer HTML (replaces old modal) */
function initViewer() {
  if (viewer) return;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div id="image-viewer" class="viewer hidden">
      <div class="viewer-content">
        <img id="viewer-img" src="" alt="" />
        <div id="viewer-close" class="viewer-close">×</div>
        <div id="viewer-prev" class="viewer-btn prev">‹</div>
        <div id="viewer-next" class="viewer-btn next">›</div>
      </div>
    </div>
  `;

  document.body.appendChild(wrapper);

  viewer = document.getElementById("image-viewer");
  viewerImg = document.getElementById("viewer-img");
  viewerPrev = document.getElementById("viewer-prev");
  viewerNext = document.getElementById("viewer-next");
  viewerClose = document.getElementById("viewer-close");

  viewerClose.addEventListener("click", closeViewer);
  viewerPrev.addEventListener("click", prevImage);
  viewerNext.addEventListener("click", nextImage);

  viewer.addEventListener("click", (e) => {
    if (e.target === viewer) closeViewer();
  });

  initSwipe();
  initZoom();
}

/* Open viewer */
function openViewer(index) {
  initViewer();

  galleryIndex = index;
  viewer.classList.remove("hidden");

  viewerImg.classList.remove("active");
  viewerImg.src = galleryImages[index].src;

  setTimeout(() => viewerImg.classList.add("active"), 20);

  resetZoom();
}

/* Close viewer */
function closeViewer() {
  viewerImg.classList.remove("active");
  viewer.classList.add("hidden");
}

/* Navigation */
function nextImage() {
  galleryIndex = (galleryIndex + 1) % galleryImages.length;
  switchImage();
}

function prevImage() {
  galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
  switchImage();
}

function switchImage() {
  viewerImg.classList.remove("active");
  resetZoom();

  setTimeout(() => {
    viewerImg.src = galleryImages[galleryIndex].src;
    setTimeout(() => viewerImg.classList.add("active"), 20);
  }, 150);
}

/* ====== Swipe left/right ====== */
function initSwipe() {
  let startX = 0;

  viewer.addEventListener(
    "touchstart",
    (e) => {
      startX = e.changedTouches[0].clientX;
    },
    { passive: true }
  );

  viewer.addEventListener(
    "touchend",
    (e) => {
      let endX = e.changedTouches[0].clientX;
      let diff = endX - startX;

      if (Math.abs(diff) > 50) {
        if (diff < 0) nextImage();
        else prevImage();
      }
    },
    { passive: true }
  );
}

/* ====== Pinch Zoom + Drag + Double Tap ====== */
let scale = 1;
let moveX = 0;
let moveY = 0;

function resetZoom() {
  scale = 1;
  moveX = 0;
  moveY = 0;
  viewerImg.style.transform = `translate(-50%, -50%) scale(1)`;
}

function initZoom() {
  let startDistance = 0;
  let startX = 0,
    startY = 0;

  viewerImg.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length === 2) {
        let [p1, p2] = e.touches;
        startDistance = Math.hypot(
          p2.clientX - p1.clientX,
          p2.clientY - p1.clientY
        );
      } else if (e.touches.length === 1 && scale > 1) {
        startX = e.touches[0].clientX - moveX;
        startY = e.touches[0].clientY - moveY;
      }
    },
    { passive: true }
  );

  viewerImg.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length === 2) {
        let [p1, p2] = e.touches;
        let distance = Math.hypot(
          p2.clientX - p1.clientX,
          p2.clientY - p1.clientY
        );

        scale = Math.min(4, Math.max(1, distance / startDistance));
        viewerImg.style.transform = `translate(-50%, -50%) scale(${scale})`;
      } else if (e.touches.length === 1 && scale > 1) {
        moveX = e.touches[0].clientX - startX;
        moveY = e.touches[0].clientY - startY;

        viewerImg.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px)) scale(${scale})`;
      }
    },
    { passive: false }
  );

  /* Double tap to zoom */
  let lastTap = 0;

  viewerImg.addEventListener("touchend", (e) => {
    let current = Date.now();
    if (current - lastTap < 250) {
      if (scale > 1) resetZoom();
      else {
        scale = 2;
        viewerImg.style.transform = `translate(-50%, -50%) scale(2)`;
      }
    }
    lastTap = current;

    if (scale < 1.1) resetZoom();
  });
}

/* ===== Register gallery images ===== */
document.addEventListener("DOMContentLoaded", () => {
  /* all <img class="gallery-img"> */
  galleryImages = Array.from(document.querySelectorAll(".gallery-img"));

  galleryImages.forEach((img, index) => {
    img.addEventListener("click", () => openViewer(index));
  });
});

/* ===== Page Flow ===== */
document.addEventListener('DOMContentLoaded', function () {
  // Lock scroll on first page
  document.body.classList.add('lock-scroll');

  loadGuestFromCSV();

  var hero1 = document.getElementById('hero-header');
  var overlayBtn = document.getElementById('content-overlay');

  var introLayer = document.getElementById('intro-video-layer');
  var introVideo = document.getElementById('intro-video');
  var introSkip  = document.getElementById('intro-skip');

  var page2Backdrop = document.getElementById('video-bg-page2');
  var hero2   = document.getElementById('hero-header-2');
  var invite2 = document.getElementById('invite-2');
  var page2Main = document.getElementById('page2-main');

  var mobileWrapper = document.getElementById('mobile-wrapper');

  // Music element
  var bgMusic = document.getElementById('bg-music');

  // Popup menu elements
  var menuToggle = document.getElementById('menu-toggle');
  var popupMenu  = document.getElementById('popup-menu');

  // Music item inside popup menu
  var menuMusicItem = document.getElementById('menu-item-music');
  var menuMusicIcon = document.getElementById('menu-music-icon');
  var menuMusicText = document.getElementById('menu-music-text');

  function updateMusicToggleUI() {
    if (!menuMusicItem || !menuMusicIcon || !menuMusicText) return;

    var isPlaying = bgMusic && !bgMusic.paused && !bgMusic.muted;

    if (isPlaying) {
      menuMusicIcon.textContent = '🔊';
      menuMusicText.textContent = 'បិទតន្ត្រី';
      menuMusicItem.setAttribute('aria-label', 'Mute music');
    } else {
      menuMusicIcon.textContent = '🔇';
      menuMusicText.textContent = 'បើកតន្ត្រី';
      menuMusicItem.setAttribute('aria-label', 'Play music');
    }
  }

  if (menuMusicItem) {
    menuMusicItem.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!bgMusic) return;

      if (bgMusic.paused || bgMusic.muted) {
        bgMusic.muted = false;
        bgMusic.play().catch(function (err) {
          console.warn('Music play blocked:', err);
        });
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

  // ==== Calendar scroll hint state + handler ====
  var hasHiddenCalendarHint = false;

  function handleCalendarScrollHint() {
    if (hasHiddenCalendarHint) return;

    var hint = document.getElementById('calendar-scroll-hint');
    if (!hint) return;

    var container = getScrollContainer();
    var scrollTop;

    if (container === window) {
      scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
    } else if (container) {
      scrollTop = container.scrollTop;
    } else {
      scrollTop = 0;
    }

    // Once user scrolls more than ~40px, hide hint forever
    if (scrollTop > 40) {
      hint.classList.add('calendar-scroll-hint--hidden');
      hasHiddenCalendarHint = true;

      if (container === window) {
        window.removeEventListener('scroll', handleCalendarScrollHint);
      } else if (container) {
        container.removeEventListener('scroll', handleCalendarScrollHint);
      }
    }
  }
  // ==============================================

  function hideSection1Now() {
    hero1.style.opacity = '0';
    hero1.style.height  = '0';
    hero1.style.display = 'none';
  }

  // Scroll helper for popup menu ONLY
  function scrollToSection(id) {
    var target = document.getElementById(id);
    if (!target) return;

    var container = getScrollContainer();

    if (container === window) {
      var rect = target.getBoundingClientRect();
      var offset = rect.top + window.pageYOffset - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    } else {
      var cRect = container.getBoundingClientRect();
      var tRect = target.getBoundingClientRect();
      var offset2 = tRect.top - cRect.top + container.scrollTop - 80;
      container.scrollTo({ top: offset2, behavior: 'smooth' });
    }

    if (popupMenu && !popupMenu.classList.contains('hidden')) {
      popupMenu.classList.add('hidden');
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    }
  }

  // Go to page 2 single-page view (no auto-scroll to section)
  function goToPage2() {
    document.body.classList.remove('lock-scroll');

    introLayer.classList.remove('show');
    setTimeout(function () { introLayer.classList.add('hidden'); }, 200);

    page2Backdrop.classList.remove('hidden');

    hero2.style.display = 'none';
    if (invite2) {
      invite2.classList.add('fade-out');
      invite2.setAttribute('aria-hidden', 'true');
      invite2.inert = true;
      invite2.style.pointerEvents = 'none';
    }

    page2Main.classList.remove('hidden');

    if (menuToggle) {
      menuToggle.classList.remove('hidden');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
    if (popupMenu) {
      popupMenu.classList.add('hidden');
    }

    updateMusicToggleUI();

    // We don't force scrollTo(0,0) anymore
    observeContentSections();

    // Start listening for scroll to hide the calendar hint
    var container = getScrollContainer();
    if (container === window) {
      window.addEventListener('scroll', handleCalendarScrollHint, { passive: true });
    } else if (container) {
      container.addEventListener('scroll', handleCalendarScrollHint);
    }
    // In case there's already some scroll offset
    handleCalendarScrollHint();
  }

  function showIntroVideo() {
    if (bgMusic) {
      bgMusic.currentTime = 0;
      var playPromise = bgMusic.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(function () {
            updateMusicToggleUI();
          })
          .catch(function (err) {
            console.warn('Music play blocked:', err);
            updateMusicToggleUI();
          });
      } else {
        updateMusicToggleUI();
      }
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hideSection1Now();
      goToPage2();
      return;
    }

    hideSection1Now();

    introLayer.classList.add('show');
    introLayer.classList.remove('hidden');

    introVideo.currentTime = 0;
    var p = introVideo.play();
    if (p && typeof p.then === 'function') {
      p.catch(function () {
        introVideo.setAttribute('controls', 'controls');
      });
    }
    introVideo.onended = function () { goToPage2(); };

    setTimeout(function () {
      if (!introVideo.paused && !introVideo.ended) return;
      goToPage2();
    }, 30000);
  }

  function onFirstClick() {
    showIntroVideo();
  }

  overlayBtn.addEventListener('click', onFirstClick);
  overlayBtn.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onFirstClick();
    }
  });

  introSkip.addEventListener('click', function (e) {
    e.stopPropagation();
    try { introVideo.pause(); } catch (err) {}
    hideSection1Now();
    goToPage2();
  });

  // Popup menu toggle
  if (menuToggle && popupMenu) {
    menuToggle.addEventListener('click', function () {
      var isHidden = popupMenu.classList.contains('hidden');
      popupMenu.classList.toggle('hidden');
      menuToggle.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    });

    popupMenu.addEventListener('click', function (e) {
      var btn = e.target.closest('.menu-item');
      if (!btn) return;

      if (btn.id === 'menu-item-music') {
        return;
      }

      var targetId = btn.getAttribute('data-target');
      if (!targetId) return;
      scrollToSection(targetId);
    });

    document.addEventListener('click', function (e) {
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

  /* ===== Our Calendar: Background Slideshow ===== */
  var calendarSlides = document.querySelectorAll('.calendar-slide');
  if (calendarSlides.length > 1) {
    var calendarIndex = 0;

    calendarSlides[0].classList.add('is-active');

    setInterval(function () {
      calendarSlides[calendarIndex].classList.remove('is-active');
      calendarIndex = (calendarIndex + 1) % calendarSlides.length;
      calendarSlides[calendarIndex].classList.add('is-active');
    }, 5000);
  }

  /* ===== Our Calendar: Countdown ===== */
  var weddingDate = new Date('2026-01-11T10:00:00+07:00');

  var elDays = document.getElementById('count-days');
  var elHours = document.getElementById('count-hours');
  var elMinutes = document.getElementById('count-minutes');
  var elSeconds = document.getElementById('count-seconds');

  function pad(num, size) {
    var s = String(num);
    while (s.length < size) s = '0' + s;
    return s;
  }

  function updateCountdown() {
    if (!elDays || !elHours || !elMinutes || !elSeconds) return;

    var now = new Date();
    var diff = weddingDate - now;

    if (diff < 0) {
      diff = 0;
    }

    var seconds = Math.floor(diff / 1000) % 60;
    var minutes = Math.floor(diff / (1000 * 60)) % 60;
    var hours   = Math.floor(diff / (1000 * 60 * 60)) % 24;
    var days    = Math.floor(diff / (1000 * 60 * 60 * 24));

    elDays.textContent    = pad(days, 2);
    elHours.textContent   = pad(hours, 2);
    elMinutes.textContent = pad(minutes, 2);
    elSeconds.textContent = pad(seconds, 2);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

    /* ===== Guest Wishes (Firestore) ===== */
  try {
    var wishesForm = document.getElementById('wishes-form');
    var wishesNameInput = document.getElementById('wishes-name');
    var wishesMessageInput = document.getElementById('wishes-message');
    var wishesList = document.getElementById('wishes-list');
    var wishesStatus = document.getElementById('wishes-status');

    // Only continue if section exists and Firestore is available
    if (
      wishesForm &&
      wishesMessageInput &&
      wishesList &&
      typeof firebase !== 'undefined' &&
      firebase.apps &&
      firebase.apps.length > 0 &&
      firebase.firestore
    ) {
      var wishesRef = firebase.firestore().collection('wishes');

      // Handle submit
      wishesForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var name = (wishesNameInput.value || '').trim() || 'Guest';
            var message = (wishesMessageInput.value || '').trim();

            if (!message) {
              wishesStatus.textContent = 'សូមសរសេរសារមុននឹងផ្ញើ 🙏';
              return;
            }

            wishesStatus.textContent = 'កំពុងផ្ញើ...';

            wishesRef
              .add({
                name: name,
                message: message,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
              })
              .then(function () {
                // ✅ clear fields
                wishesNameInput.value = '';
                wishesMessageInput.value = '';
                wishesMessageInput.blur();
                wishesNameInput.blur();

                wishesStatus.textContent = 'បានផ្ញើរួចរាល់ 💌 សូមអរគុណ!';
                setTimeout(function () {
                  wishesStatus.textContent = '';
                }, 3000);
              })
              .catch(function (err) {
                console.error('Error adding wish:', err);
                wishesStatus.textContent = 'មានបញ្ហា ខណៈពេលផ្ញើ សូមព្យាយាមម្ដងទៀត 🙏';
              });
          });

      // Render list from snapshot (top 10 newest)
      function renderWishes(snapshot) {
        wishesList.innerHTML = '';

        // Firestore returns in the order we requested: newest first (desc)
        snapshot.forEach(function (doc) {
          var data = doc.data();
          var name = data.name || 'Guest';
          var message = data.message || '';
          var ts = data.createdAt ? data.createdAt.toDate() : null;

          var li = document.createElement('div');
          li.className = 'wish-item';

          var nameEl = document.createElement('div');
          nameEl.className = 'wish-name';
          nameEl.textContent = name;

          var msgEl = document.createElement('div');
          msgEl.className = 'wish-message';
          msgEl.textContent = message;

          li.appendChild(nameEl);
          li.appendChild(msgEl);

          if (ts) {
            var timeEl = document.createElement('div');
            timeEl.className = 'wish-time';
            var hh = String(ts.getHours());
            if (hh.length < 2) hh = '0' + hh;
            var mm = String(ts.getMinutes());
            if (mm.length < 2) mm = '0' + mm;
            timeEl.textContent = hh + ':' + mm;
            li.appendChild(timeEl);
          }

          wishesList.appendChild(li);
        });
      }

      // Realtime listener (🔟 newest wishes only)
      wishesRef
        .orderBy('createdAt', 'desc')
        .limit(10)
        .onSnapshot(
          function (snapshot) {
            renderWishes(snapshot);
          },
          function (err) {
            console.error('Error listening for wishes:', err);
          }
        );
    }
  } catch (e) {
    console.error('Wishes section init error:', e);
  }
  /* ===== End Guest Wishes ===== */

});
