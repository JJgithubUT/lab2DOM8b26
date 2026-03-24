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

const prevBtn = $('#prevBtn'); // Boton de "anterior"
const nextBtn = $('#nextBtn'); // Boton de "siguiente"
const playBtn = $('#playBtn'); // Boton de "reproducir"

// Trabajar con el estado de la aplicación
let currentIndex = 0; // Indice de la imagen actual
const likes = {}; // Objeto, almacena "me gusta" x c/img
let autoplayId = null; // Variable para almacenar el ID del intervalo de autoplay
let isPlaying = false; // Estado de reprodicción automática
const AUTO_TIME = 5000; // 5 segundos para la siguiente carga de las imagenes 

// Elementos a agregar en el DOM actual
// Se buscan y si no hay se crearán con JS
let dots = $("#dots");
let track = $(".track");

// Variables p. detectar swipe (deslizamiento)
let startX = 0; // Valor inicial de X
let currentX = 0; // Valor actual de X
let isDragging = false;
let moved = false;

// distancia mínima para considerar swipe
const SWIPE_THRESHOLD = 50;

// Para usar el modal
let modal = null;
let modalImg = null;
let modalTitle = null;
let modalDesc = null;
let modalCounter = null;
let modalPrevBtn = null;
let modalNextBtn = null;
let modalCloseBtn = null;
let zoomInBtn = null;
let zoomOutBtn = null;
let zoomResetBtn = null;
let modalScale = null;

// Crear un track del carrusel
// CRea un contenedor .track que tendrá
// todas las imgs  alineadas horizontalmente
// Es la base del efecto slide con translateX
function createTrack() {
  // Si existe no hacer nada
  if (track) return;
  // Si no existe, crear
  track = document.createElement("div");
  track.className = "track";
  data.forEach((item) => {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.title;
    track.appendChild(img);
  });
}

// Crear dots
// Crear los botones indicadores del carrusel
// Cada dot representará una img
// El dot activo debe coincidir con currentIndex
function createDots() {
  if (!dots) {
    dots = document.createElement("div");
    dots.id = "dots";
    dots.className = "dots";
    frame.appendChild(dots);
  }

  dots.innerHTML = data.map((_, index) => {
    return `
      <button 
        class="dot ${index === currentIndex ? "active" : ""}" 
        type="button" 
        data-index="${index}" 
        aria-label="Ir a la imagen ${index + 1}">
      </button>
    `;
  }).join("");

}

// Crear la función que actualiza el track
function updateTrack() {
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
    dot.setAttribute.toggle("aria-pressed", index === currentIndex);
  });
}

function updateLikeBtn() {
  const currentItem = data[currentIndex]; // Item actual
  const isLiked = likes[currentItem.id]; // Verificar nuevo edo.
  likeBtn.textContent = isLiked ? "💗" : "🤍";
  likeBtn.classList.toggle("on", isLiked); // Aplicar o quitar la clase visual
  likeBtn.setAttribute("aria-pressed", isLiked); // Actualizar el atributo ARIA-PRESSED
}

// Renderizar las miniaturas
function renderThumbs() {
  thumbs.innerHTML = data.map((item, index) => {
    return `
      <article class="thumb" ${index === currentIndex ? "active" : ""} data-index="${index}">
        <span class="badge">${index + 1}</span>
        <img src="${item.src}" alt="${item.title}" />
      </article>
    `;
  }).join("");

  // Añadir eventos a cada miniatura
  $$('.thumb', thumbs).forEach(el => {
    el.addEventListener('click', () => {
      currentIndex = parseInt(el.dataset.index, 10);
      renderHero();
      renderThumbs();
    });
  });

};

function renderHero(index) {
  const item = data[index];
  
  // Actualizar la imagen principal
  heroImg.src = item.src;
  heroImg.alt = item.title;

  // Actualizar el título y la descripción
  heroTitle.textContent = item.title;
  heroDesc.textContent = item.desc;

  // Actualizar el contador
  counter.textContent = `${index + 1} / ${data.length}`;

  // Marcar imagen seleccionada de las miniaturas
  $$(".thumb").forEach((thumb, i) => {
    thumb.classList.toggle("active", i === index);
  });

  // ver si la img actual posee un pedazo de like
  const isLiked = likes[item.id] === true;

  // Cambiar el simbolo del botón
  likeBtn.textContent = isLiked ? "💗" : "🤍";

  // Aplicar o quitar la clase visual
  likeBtn.classList.toggle("on", isLiked);

  // Actualizar .......................


}

// Manejar para clicks en las miniaturas
thumbs.addEventListener("click", (e) => {
  const thumb = e.target.closest(".thumb");
  if (!thumb) return; // Si no se hizo click en una miniiatura, salir
  const index = parseInt(thumb.dataset.index); // Actualizar el index actual
  currentIndex = Number(thumb.dataset.index); // Renderizar la img principal con nuevo index
  renderHero(currentIndex);
});

// Listener para el botón de "me gusta"
likeBtn.addEventListener("click", () => {
  const currentItem = data[currentIndex];
  // Alternar el edo. de 👍
  likes[currentItem.id] = !likes[currentItem.id];
  updateLikeBtn();
});

// ACtualizar el play button a pause
function updatePlayButton () {
  playBtn.textContent = isPlaying ? "⏸️" : "▶️";
  playBtn.dataset.state = isPlaying ? "pause" : "play";
};

// Cambiar las imagenes automáticamente
function changeSlide(newIndex) {
  heroImg.classList.add("fade-out"); // Agregar clase p. animar de la img
  setTimeout(() => {
    currentIndex = newIndex; // Actualizar el indice actual
    renderHero(currentIndex); // Renderizar la nueva imagen principal
    heroImg.classList.remove("fade-out"); // Quitar clase para animación de img
  },350);
}

function nextSlide() {
  const newIndex = (currentIndex + 1) % data.length; // Calcular el indice de la next img
  changeSlide(newIndex);
}

function prevSlide() {
  const newIndex = (currentIndex - 1 + data.length) % data.length; // Calcular el indice de la prev img
  changeSlide(newIndex);
}

function startAutoPlay() {
  autoplayId = setInterval(() => {
    nextSlide();
  }, AUTO_TIME);
  isPlaying = true;
  updatePlayButton();
}

function stopAutoPlay() {
  clearInterval(autoplayId);
  autoplayId = null;
  isPlaying = false;
  updatePlayButton();
}

function toggleAutoPlay () {
  if (isPlaying) {
    stopAutoPlay();
  } else {
    startAutoPlay();
  }
}

function renderAll(animate = true) {
  updateTrack(animate);
  updateMeta();
  updateThumbs();
  updateDots();
  updateLikeBtn();
}

// Animación pop del like
// Agrega o elimina la clase pop para reiniciar la animación CSS al dar click
function animateLikePop() {
  likeBtn.classList.remove("pop");
  void likeBtn.offsetWidth;
  likeBtn.classList.add("pop");
}

// Manejo de SWIPE - inicio
// Registra la posición inicial dle puntero y
// desactiva temporalmente la transición
function handlePointDown() {
  startX = e.clientX;
  currentX = e.clientX;
  isDragging = true;
  moved = false;

  if (track) {
    track.style.transition = "none";
  }
}

// Manejo de SWIPE - movimiento
// Actualiza la posición del puntero
// si el movimiento supera 5px, se considera arrastre
function handlerPointerMove(e) {
  if (!isDragging) return;

  currentX = e.clientX;
  const diff = currentX - startX;

  if (Math.abs(diff) > 5) {
    moved = true;
  }
}

// Manejo de SWIPE - FIN
// Al soltar el mouse, se calcula la distancia recorrida
// Si supera el umbral, cambia la img
// Si no, solo regresa el track a su sitio
function handlePointerUp() {
  const diff = currentX - startX;
  isDragging = false;
  if (Math.abs(diff) >= SWIPE_THRESHOLD) {
    if (diff < 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  } else {
    updateTrack(true);
  }
}

// Eventos de SWIPE con el mouse
frame.addEventListener("pointerdown", handlePointDown);
frame.addEventListener("pointermove", handlerPointerMove);
frame.addEventListener("pointerdown", handlePointerUp);
frame.addEventListener("pointerleave", handlePointerUp);

nextBtn.addEventListener("click", nextSlide);
prevBtn.addEventListener("click", prevSlide);
playBtn.addEventListener("click", toggleAutoPlay);

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    nextSlide();
  } else if (e.key === "ArrowLeft") {
    prevSlide();
  }
});

renderThumbs(); // Llamar a la función para mostrar las miniaturas
renderHero(currentIndex); // Mostrar imagen inicial