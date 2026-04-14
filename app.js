// app.js
'use strict';
import data from './data-in-js.js';
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Recuperar elementos de DOM
const frame = $(".frame");
const thumbs = $('#thumbs');
const heroImg = $('#heroImg');
const heroTitle = $('#heroTitle');
const heroDesc = $('#heroDesc');
const counter = $('#counter');
const likeBtn = $('#likeBtn');

const prevBtn = $('#prevBtn');
const nextBtn = $('#nextBtn');
const playBtn = $('#playBtn');

// Estado de la aplicación
let currentIndex = 0;
const likes = {};
let autoplayId = null;
let isPlaying = false;
const AUTO_TIME = 5000;

let dots = $("#dots");
let track = $(".track");

// Variables para swipe
let startX = 0;
let currentX = 0;
let isDragging = false;
let moved = false;
const SWIPE_THRESHOLD = 50;

// ── TRACK ────────────────────────────────────────────────
function createTrack() {
  if (track) return;
  track = document.createElement("div");
  track.className = "track";
  data.forEach((item) => {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.title;
    track.appendChild(img);
  });
}

// ── DOTS ─────────────────────────────────────────────────
function createDots() {
  if (!dots) {
    dots = document.createElement("div");
    dots.id = "dots";
    dots.className = "dots";
    frame.appendChild(dots);
  }
  dots.innerHTML = data.map((_, index) => `
    <button 
      class="dot ${index === currentIndex ? "active" : ""}" 
      type="button" 
      data-index="${index}" 
      aria-label="Ir a la imagen ${index + 1}">
    </button>
  `).join("");
}

// ── UPDATE HELPERS ────────────────────────────────────────
// FIX: animate ahora es parámetro con valor por defecto
function updateTrack(animate = true) {
  if (!track) return;
  track.style.transition = animate ? "transform .45s ease" : "none";
  track.style.transform = `translateX(-${currentIndex * 100}%)`;
}

function updateMeta() {
  const item = data[currentIndex];
  heroTitle.textContent = item.title;
  heroDesc.textContent = item.desc;
  counter.textContent = `${currentIndex + 1} / ${data.length}`;
}

function updateThumbs() {
  $$(".thumb").forEach((thumb, index) => {
    thumb.classList.toggle("active", index === currentIndex);
  });
}

function updateDots() {
  $$(".dot").forEach((dot, index) => {
    dot.classList.toggle("active", index === currentIndex);
    // FIX: setAttribute.toggle no existe — usar setAttribute directamente
    dot.setAttribute("aria-pressed", index === currentIndex);
  });
}

function updateLikeBtn() {
  const currentItem = data[currentIndex];
  const isLiked = likes[currentItem.id];
  likeBtn.textContent = isLiked ? "💗" : "🤍";
  likeBtn.classList.toggle("on", isLiked);
  likeBtn.setAttribute("aria-pressed", String(Boolean(isLiked)));
}

// ── RENDER HERO ───────────────────────────────────────────
// FIX: ya no recibe index — usa currentIndex directamente
function renderHero() {
  const item = data[currentIndex];

  heroImg.src = item.src;
  heroImg.alt = item.title;
  heroTitle.textContent = item.title;
  heroDesc.textContent = item.desc;
  counter.textContent = `${currentIndex + 1} / ${data.length}`;

  $$(".thumb").forEach((thumb, i) => {
    thumb.classList.toggle("active", i === currentIndex);
  });

  const isLiked = likes[item.id] === true;
  likeBtn.textContent = isLiked ? "💗" : "🤍";
  likeBtn.classList.toggle("on", isLiked);
  likeBtn.setAttribute("aria-pressed", String(isLiked));
}

// ── THUMBS ────────────────────────────────────────────────
function renderThumbs() {
  thumbs.innerHTML = data.map((item, index) => `
    <article class="thumb ${index === currentIndex ? "active" : ""}" data-index="${index}">
      <span class="badge">${index + 1}</span>
      <img src="${item.src}" alt="${item.title}" />
    </article>
  `).join("");

  $$('.thumb', thumbs).forEach(el => {
    el.addEventListener('click', () => {
      currentIndex = parseInt(el.dataset.index, 10);
      updateAllVisuals();
    });
  });
}

// ── CARROUSEL (píldora) ───────────────────────────────────
const carrousel = $("#carrousel");

// FIX: definir la función ANTES de llamarla
function createCarrouselElements() {
  carrousel.innerHTML = data.map((item, index) => {
    const estado = index === currentIndex ? 'activated' : 'unactivated';
    return `<button class="horse ${estado}" totheid="${index}">${index + 1}</button>`;
  }).join("");

  $$('.horse').forEach(el => {
    el.addEventListener('click', () => {
      currentIndex = parseInt(el.getAttribute("totheid"));
      updateAllVisuals();
    });
  });
}

function updateCarrouselElements() {
  $$('.horse').forEach((el, i) => {
    el.className = `horse ${i === currentIndex ? 'activated' : 'unactivated'}`;
  });
}

// ── SIDE CAROUSEL ─────────────────────────────────────────
const sideTrack = $('#sideTrack');

function renderSideCarousel() {
  sideTrack.innerHTML = data.map((item, index) => `
    <div class="side-item ${index === currentIndex ? "active" : ""}" 
         data-index="${index}" 
         id="side-item-${index}">
      <img src="${item.src}" alt="${item.title}" />
    </div>
  `).join("");

  $$('.side-item', sideTrack).forEach(el => {
    el.addEventListener('click', () => {
      currentIndex = parseInt(el.dataset.index, 10);
      updateAllVisuals();
    });
  });
}

// ── ACTUALIZAR TODO ───────────────────────────────────────
function updateAllVisuals() {
  renderHero();
  renderThumbs();
  updateCarrouselElements();

  $$('.side-item').forEach((item, i) => {
    item.classList.toggle('active', i === currentIndex);
  });

  const activeSideItem = $(`#side-item-${currentIndex}`);
  if (activeSideItem) {
    activeSideItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ── NAVEGACIÓN ────────────────────────────────────────────
function changeSlide(newIndex) {
  heroImg.classList.add("fade-out");
  setTimeout(() => {
    currentIndex = newIndex;
    updateAllVisuals();
    heroImg.classList.remove("fade-out");
  }, 350);
}

// FIX: una sola definición de nextSlide / prevSlide
function nextSlide() {
  changeSlide((currentIndex + 1) % data.length);
}

function prevSlide() {
  changeSlide((currentIndex - 1 + data.length) % data.length);
}

// ── AUTOPLAY ──────────────────────────────────────────────
function updatePlayButton() {
  playBtn.textContent = isPlaying ? "⏸️" : "▶️";
  playBtn.dataset.state = isPlaying ? "pause" : "play";
}

function startAutoPlay() {
  autoplayId = setInterval(nextSlide, AUTO_TIME);
  isPlaying = true;
  updatePlayButton();
}

function stopAutoPlay() {
  clearInterval(autoplayId);
  autoplayId = null;
  isPlaying = false;
  updatePlayButton();
}

function toggleAutoPlay() {
  isPlaying ? stopAutoPlay() : startAutoPlay();
}

// ── LIKE ──────────────────────────────────────────────────
likeBtn.addEventListener("click", () => {
  const currentItem = data[currentIndex];
  likes[currentItem.id] = !likes[currentItem.id];
  updateLikeBtn();
  animateLikePop();
});

function animateLikePop() {
  likeBtn.classList.remove("pop");
  void likeBtn.offsetWidth;
  likeBtn.classList.add("pop");
}

// ── SWIPE ─────────────────────────────────────────────────
// FIX: faltaba el parámetro (e) en handlePointerDown
function handlePointerDown(e) {
  startX = e.clientX;
  currentX = e.clientX;
  isDragging = true;
  moved = false;
  if (track) track.style.transition = "none";
}

function handlePointerMove(e) {
  if (!isDragging) return;
  currentX = e.clientX;
  if (Math.abs(currentX - startX) > 5) moved = true;
}

function handlePointerUp() {
  const diff = currentX - startX;
  isDragging = false;
  if (Math.abs(diff) >= SWIPE_THRESHOLD) {
    diff < 0 ? nextSlide() : prevSlide();
  } else {
    updateTrack(true);
  }
}

// ── EVENTOS ───────────────────────────────────────────────
// FIX: el tercer listener debe ser pointerup, no pointerdown
frame.addEventListener("pointerdown", handlePointerDown);
frame.addEventListener("pointermove", handlePointerMove);
frame.addEventListener("pointerup", handlePointerUp);
frame.addEventListener("pointerleave", handlePointerUp);

nextBtn.addEventListener("click", nextSlide);
prevBtn.addEventListener("click", prevSlide);
playBtn.addEventListener("click", toggleAutoPlay);

thumbs.addEventListener("click", (e) => {
  const thumb = e.target.closest(".thumb");
  if (!thumb) return;
  currentIndex = parseInt(thumb.dataset.index, 10);
  updateAllVisuals();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") nextSlide();
  else if (e.key === "ArrowLeft") prevSlide();
});

// ── INICIO ────────────────────────────────────────────────
createCarrouselElements();  // FIX: nombre correcto, definida antes de llamarse
renderSideCarousel();
renderThumbs();
renderHero();