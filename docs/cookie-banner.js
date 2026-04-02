
function setupCookieBanner() {
  var banner = document.getElementById('cookie-banner');
  if (!banner) return;
  // Mostra solo se non già chiuso
  if (!localStorage.getItem('cookieBannerClosed')) {
    banner.style.display = 'block';
  } else {
    banner.style.display = 'none';
  }
  var okBtn = document.getElementById('cookie-ok');
  if (okBtn) {
    okBtn.onclick = function() {
      localStorage.setItem('cookieBannerClosed', 'true');
      banner.style.display = 'none';
    };
  }
}

// Se il banner viene caricato dinamicamente, esegui subito la funzione
setupCookieBanner();


