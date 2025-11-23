// Collect all gallery thumbnails
const thumbs = document.querySelectorAll(".gallery-thumb");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

let currentIndex = 0;

// Convert NodeList → Array
const thumbArray = Array.from(thumbs);

// -------------------------------
// OPEN LIGHTBOX
// -------------------------------
thumbArray.forEach((img, index) => {
  img.addEventListener("click", () => {
    currentIndex = index;
    openLightbox();
  });
});

function openLightbox() {
  showImage(currentIndex);
  lightbox.classList.remove("hidden");
}

// -------------------------------
// SHOW IMAGE
// -------------------------------
function showImage(i) {
  const imgSrc = thumbArray[i].getAttribute("src");
  lightboxImg.setAttribute("src", imgSrc);
}

// -------------------------------
// CLOSE LIGHTBOX
// -------------------------------
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) {
    lightbox.classList.add("hidden");
  }
});

// -------------------------------
// NEXT + PREVIOUS BUTTONS
// -------------------------------
document.getElementById("nextBtn").addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % thumbArray.length;
  showImage(currentIndex);
});

document.getElementById("prevBtn").addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + thumbArray.length) % thumbArray.length;
  showImage(currentIndex);
});

// -------------------------------
// SWIPE GESTURES (Mobile)
// -------------------------------
let startX = 0;

lightbox.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});

lightbox.addEventListener("touchend", (e) => {
  let endX = e.changedTouches[0].clientX;
  let diff = endX - startX;

  // Swipe Right → Previous
  if (diff > 50) {
    currentIndex = (currentIndex - 1 + thumbArray.length) % thumbArray.length;
    showImage(currentIndex);
  }

  // Swipe Left → Next
  if (diff < -50) {
    currentIndex = (currentIndex + 1) % thumbArray.length;
    showImage(currentIndex);
  }
});
