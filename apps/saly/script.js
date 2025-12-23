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
  var displayName = name || ' ';

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

/* ============================================================
   FULL GALLERY SYSTEM (SHOW 1 BIG + 4 SMALL, PREVIEW ALL)
   ============================================================ */

/* ============================================================
   SUPER SMOOTH GALLERY SYSTEM
   ============================================================ */

const FULL_GALLERY_IMAGES = [
  "./images/my_photos/IMG_2629.jpg",   // 0 (big on page)
  "./images/my_photos/IMG_2759.jpg",  // 1
  "./images/my_photos/IMG_2610.jpg",
  "./images/my_photos/IMG_2618.jpg",
  "./images/my_photos/IMG_2596.jpg",
  "./images/my_photos/IMG_2576.jpg",
  "./images/my_photos/IMG_2582.jpg",
  "./images/my_photos/IMG_2595.jpg",
  "./images/my_photos/IMG_2606.jpg",
  "./images/my_photos/IMG_2607.jpg",
  "./images/my_photos/IMG_2609.jpg",
  "./images/my_photos/IMG_2621.jpg",
  "./images/my_photos/IMG_2622.jpg",
  "./images/my_photos/IMG_2624.jpg",
  "./images/my_photos/IMG_2628.jpg",
  "./images/my_photos/IMG_2756.jpg",
  "./images/my_photos/IMG_2757.jpg",
  "./images/my_photos/IMG_2690.jpg",  // 17 (big on page)
   "./images/my_photos/IMG_2723.jpg",
  "./images/my_photos/IMG_2710.jpg",
   "./images/my_photos/IMG_2698.jpg",
   "./images/my_photos/IMG_2741.jpg",
  "./images/my_photos/IMG_2715.jpg",
  "./images/my_photos/IMG_2718.jpg",
  "./images/my_photos/IMG_2731.jpg",
  "./images/my_photos/IMG_2729.jpg",
  "./images/my_photos/IMG_2685.jpg",
  "./images/my_photos/IMG_2693.jpg",
  "./images/my_photos/IMG_2781.jpg",
  "./images/my_photos/IMG_2701.jpg",
  "./images/my_photos/IMG_2772.jpg", // 30 (big on page)
  "./images/my_photos/IMG_2646.jpg",
  "./images/my_photos/IMG_2566.jpg",
  "./images/my_photos/IMG_2669.jpg",
  "./images/my_photos/IMG_2639.jpg",
  "./images/my_photos/IMG_2651.jpg",
  "./images/my_photos/IMG_2774.jpg",
  "./images/my_photos/IMG_2571.jpg",
  "./images/my_photos/IMG_2513.jpg",

  // add more here... IMG_2709
];

let galleryIndex = 0;

const modal = document.getElementById("gallery-modal");
const modalImg = document.getElementById("modal-image");

function animateEntry() {
  modalImg.classList.remove("active");
  setTimeout(() => modalImg.classList.add("active"), 20);
}
function lockScroll() {
  const wrapper = document.getElementById("mobile-wrapper");

  if (window.innerWidth <= 520) {
    // --- Mobile (window scroll) ---
    savedScrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.width = "100%";
  } else {
    // --- Desktop Preview (#mobile-wrapper scrolls) ---
    savedScrollY = wrapper.scrollTop;
    wrapper.style.overflow = "hidden";
  }
}

function unlockScroll() {
  const wrapper = document.getElementById("mobile-wrapper");

  if (window.innerWidth <= 520) {
    // --- Restore mobile scroll position ---
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, savedScrollY);
  } else {
    // --- Restore desktop preview scroll position ---
    wrapper.style.overflow = "";
    wrapper.scrollTop = savedScrollY;
  }
}


/* OPEN MODAL */
function openModal(index) {
  galleryIndex = index;
  modalImg.src = FULL_GALLERY_IMAGES[index];
  modal.classList.remove("hidden");

  // Lock scroll
  lockScroll();

  // Animate entry
  animateEntry();
}

/* CLOSE MODAL */
function closeModal() {
  modal.classList.add("hidden");

  // Unlock scroll
  unlockScroll();
}

/* =====================
   Smooth Transition Fix
   ===================== */

function changeImageSmooth(newIndex, direction) {
  const newSrc = FULL_GALLERY_IMAGES[newIndex];

  // Preload/decode next image before animation
  const temp = new Image();
  temp.src = newSrc;

  temp.onload = () => {
    // 1. Blur-out current image
    modalImg.classList.remove("blur-in");
    modalImg.classList.add("blur-out");

    setTimeout(() => {
      // 2. Replace photo
      modalImg.src = newSrc;

      // Reset classes
      modalImg.classList.remove("slide-left", "slide-right", "blur-out");

      // Force browser reflow
      void modalImg.offsetWidth;

      // 3. Slide + blur-in
      if (direction === "left") modalImg.classList.add("slide-left");
      else modalImg.classList.add("slide-right");

      modalImg.classList.add("blur-in");

      galleryIndex = newIndex;
    }, 180); // match blur-out duration
  };
}
/* NEXT */
function showNext() {
  const newIndex = (galleryIndex + 1) % FULL_GALLERY_IMAGES.length;
  changeImageSmooth(newIndex, "left");
}

/* PREV */
function showPrev() {
  const newIndex =
    (galleryIndex - 1 + FULL_GALLERY_IMAGES.length) %
    FULL_GALLERY_IMAGES.length;
  changeImageSmooth(newIndex, "right");
}


// /* SHOW NEXT IMAGE */
// function showNext() {
//   galleryIndex = (galleryIndex + 1) % FULL_GALLERY_IMAGES.length;
//   modalImg.classList.remove("slide-left", "slide-right", "active");
//   modalImg.src = FULL_GALLERY_IMAGES[galleryIndex];

//   void modalImg.offsetWidth; // restart animation
//   modalImg.classList.add("slide-left", "active");
// }

// /* SHOW PREV IMAGE */
// function showPrev() {
//   galleryIndex =
//     (galleryIndex - 1 + FULL_GALLERY_IMAGES.length) %
//     FULL_GALLERY_IMAGES.length;

//   modalImg.classList.remove("slide-left", "slide-right", "active");
//   modalImg.src = FULL_GALLERY_IMAGES[galleryIndex];

//   void modalImg.offsetWidth;
//   modalImg.classList.add("slide-right", "active");
// }

/* CLICK THUMBNAILS */
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("gallery-thumb")) {
    const index = Number(e.target.dataset.index);
    openModal(index);
  }
});

/* BUTTONS */
document.getElementById("next-btn").onclick = function (e) {
  e.stopPropagation();
  showNext();
};
document.getElementById("prev-btn").onclick = function (e) {
  e.stopPropagation();
  showPrev();
};

/* TOUCH SWIPE SUPPORT */
let touchStartX = 0;
let touchEndX = 0;
const SWIPE_THRESHOLD = 40;

modal.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });

modal.addEventListener("touchmove", (e) => {
  touchEndX = e.changedTouches[0].clientX;
}, { passive: true });

modal.addEventListener("touchend", () => {
  const dx = touchEndX - touchStartX;
  if (Math.abs(dx) > SWIPE_THRESHOLD) {
    if (dx < 0) showNext();
    else showPrev();
  }
});

/* PRELOAD IMAGES */
FULL_GALLERY_IMAGES.forEach(src => {
  const img = new Image();
  img.src = src;
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
          // Convert Firestore timestamp to JS Date object
          var ts = data.createdAt ? data.createdAt.toDate() : null;

          var li = document.createElement('div');
          li.className = 'wish-item';

          // 1. Name
          var nameEl = document.createElement('div');
          nameEl.className = 'wish-name';
          nameEl.textContent = name;

          // 2. Message
          var msgEl = document.createElement('div');
          msgEl.className = 'wish-message';
          msgEl.textContent = message;

          li.appendChild(nameEl);
          li.appendChild(msgEl);

          // 3. Date & Time
          if (ts) {
            var timeEl = document.createElement('div');
            timeEl.className = 'wish-time';

            // Format options: Month Day • Hour:Minute AM/PM
            // Example: "Dec 23 • 10:30 PM"
            var datePart = ts.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            var timePart = ts.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            
            timeEl.textContent = datePart + ' • ' + timePart;
            
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
