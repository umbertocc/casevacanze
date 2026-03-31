// Loader Cookie Banner
fetch('cookie-banner')
  .then(r => r.text())
  .then(html => {
    document.getElementById('cookie-banner-container').innerHTML = html;
    var script = document.createElement('script');
    script.src = 'cookie-banner.js';
    document.body.appendChild(script);
  });

// Gallery e Lightbox
let currentImg = 0;
let currentFilter = 'all';
const allImages = Array.from(document.querySelectorAll('#gallery img'));
const dotsContainer = document.getElementById('dots');
const gallery = document.getElementById('gallery');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const filterButtons = document.querySelectorAll('.filter-btn');

let filteredImages = allImages.slice();

// Gestione filtri
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    if (currentFilter === 'all') {
      filteredImages = allImages.slice();
    } else {
      filteredImages = allImages.filter(img => img.dataset.category === currentFilter);
    }
    allImages.forEach(img => img.style.display = 'none');
    filteredImages.forEach(img => img.style.display = 'block');
    dotsContainer.innerHTML = '';
    filteredImages.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'dot';
      dot.onclick = () => showImg(i);
      dotsContainer.appendChild(dot);
    });
    currentImg = 0;
    showImg(0);
  });
});

// Aggiorna counter
function updateCounter() {
  var currentPhoto = document.getElementById('current-photo');
  if (currentPhoto) currentPhoto.textContent = filteredImages.length > 0 ? (currentImg + 1) : 0;
  var lightboxCurrent = document.getElementById('lightbox-current');
  if (lightboxCurrent) lightboxCurrent.textContent = filteredImages.length > 0 ? (currentImg + 1) : 0;
  var totalPhotos = document.getElementById('total-photos');
  if (totalPhotos) totalPhotos.textContent = filteredImages.length;
  var lightboxTotal = document.getElementById('lightbox-total');
  if (lightboxTotal) lightboxTotal.textContent = filteredImages.length;
}

// Crea i dot indicator iniziali
function createDots() {
  dotsContainer.innerHTML = '';
  filteredImages.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.onclick = () => showImg(i);
    dotsContainer.appendChild(dot);
  });
}
createDots();

// Funzione per mostrare immagine
function showImg(i) {
  if (!filteredImages.length) return;
  if (!filteredImages[i]) return;
  filteredImages.forEach(img => img.classList.remove('active'));
  document.querySelectorAll('.dot').forEach(dot => dot.classList.remove('active'));
  currentImg = i;
  filteredImages[i].classList.add('active');
  if (document.querySelectorAll('.dot')[i]) document.querySelectorAll('.dot')[i].classList.add('active');
  updateCounter();
  // Aggiorna lightbox se aperto
  if (lightbox.classList.contains('active')) {
    lightboxImg.src = filteredImages[i].src;
  }
}

// Cambia immagine (frecce)
function changeImg(direction) {
  if (!filteredImages.length) return;
  let newIndex = (currentImg + direction + filteredImages.length) % filteredImages.length;
  showImg(newIndex);
}

// Apri lightbox
gallery.addEventListener('click', (e) => {
  if (!e.target.closest('.gallery-arrow') && !e.target.closest('.dot')) {
    if (!filteredImages.length) return;
    lightbox.classList.add('active');
    lightboxImg.src = filteredImages[currentImg].src;
    document.body.style.overflow = 'hidden';
  }
});

// Chiudi lightbox
function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = 'auto';
}

// Cambia immagine in lightbox
function changeLightboxImg(direction) {
  if (!filteredImages.length) return;
  let newIndex = (currentImg + direction + filteredImages.length) % filteredImages.length;
  showImg(newIndex);
  lightboxImg.src = filteredImages[newIndex].src;
}

// Chiudi lightbox con ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
  if (lightbox.classList.contains('active')) {
    if (e.key === 'ArrowLeft') changeLightboxImg(-1);
    if (e.key === 'ArrowRight') changeLightboxImg(1);
  }
});

// Mostra prima immagine
if (filteredImages.length) showImg(0);

// Auto-rotate ogni 5 secondi
let autoRotate = setInterval(() => {
  if (!lightbox.classList.contains('active') && filteredImages.length > 1) {
    showImg((currentImg + 1) % filteredImages.length);
  }
}, 5000);

// Menu Hamburger
function toggleMenu() {
  const menu = document.getElementById('navbarMenu');
  menu.classList.toggle('active');
}

function closeMenu() {
  const menu = document.getElementById('navbarMenu');
  menu.classList.remove('active');
  // Chiudi tutte le dropdown su mobile
  if (window.innerWidth <= 768) {
    const dropdowns = document.querySelectorAll('.dropdown.active');
    dropdowns.forEach(function(drop) {
      drop.classList.remove('active');
    });
  }
}

// Dropdown mobile
document.addEventListener('DOMContentLoaded', function() {
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  dropdownToggles.forEach(function(toggle) {
    toggle.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        e.stopPropagation();
        const parentDropdown = this.closest('.dropdown');
        if (parentDropdown) {
          parentDropdown.classList.toggle('active');
        }
      }
    });
    // Supporto touch
    toggle.addEventListener('touchstart', function(e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        e.stopPropagation();
        const parentDropdown = this.closest('.dropdown');
        if (parentDropdown) {
          parentDropdown.classList.toggle('active');
        }
      }
    }, { passive: false });
  });
});

// Chiudi menu quando si clicca fuori
document.addEventListener('click', function(event) {
  const navbar = document.querySelector('.navbar');
  const menu = document.getElementById('navbarMenu');
  if (!navbar.contains(event.target) && menu.classList.contains('active')) {
    menu.classList.remove('active');
  }
});
