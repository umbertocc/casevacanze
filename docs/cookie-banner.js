
function setupCookieBanner() {
  var banner = document.getElementById('cookie-banner');
  if (!banner) return;
  // Mostra solo se non c'è già consenso
  if (!localStorage.getItem('cookieConsent')) {
    banner.style.display = 'block';
  } else {
    banner.style.display = 'none';
  }
  var accept = document.getElementById('cookie-accept');
  var refuse = document.getElementById('cookie-refuse');
  if (accept) {
    accept.onclick = function() {
      localStorage.setItem('cookieConsent', 'true');
      banner.style.display = 'none';
    };
  }
  if (refuse) {
    refuse.onclick = function() {
      localStorage.setItem('cookieConsent', 'refused');
      banner.style.display = 'none';
    };
  }
}

// Se il banner viene caricato dinamicamente, esegui subito la funzione
setupCookieBanner();
