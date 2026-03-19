'use strict';
import { data } from './data-in-js';
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

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

// Renderizar las miniaturas
function renderThumbs() {
  thumbs.innerHTML = data.map((item, index) => {
    return `
      <article class="thumb" ${index === currentIndex ? "active" : ""} data-index="${index}">
        <span class="badge">${index + 1}</span>
        <img src="${item.src} alt="${item.title}" />
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
  counter.textContent = `${index + 1} / ${data.lenght}`;

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
  
  const isLiked = likes[currentItem.id]; // Verificar nuevo edo.
  likeBtn.textContent = isLiked ? "💗" : "🤍";
  likeBtn.classList.toggle("on", isLiked); // Aplicar o quitar la clase visual
  likeBtn.setAttribute("aria-pressed", isLiked); // Actualizar el atributo ARIA-PRESSED
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
  const newIndex = (currentIndex + 1) % data.lenght; // Calcular el indice de la next img
  changeSlide(newIndex);
}

function prevSlide() {
  const newIndex = (currentIndex - 1) % data.lenght; // Calcular el indice de la prev img
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