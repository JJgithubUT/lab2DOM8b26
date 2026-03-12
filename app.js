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

// Trabajar con el estado de la aplicación
let currentIndex = 0; // Indice de la imagen actual
const likes = {}; // Objeto, almacena "me gusta" x c/img
let autoplayId = null;

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

renderThumbs();