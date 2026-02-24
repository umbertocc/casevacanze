document.addEventListener('DOMContentLoaded', function() {
  if (!localStorage.getItem('cookieConsent')) {
    document.getElementById('cookie-banner').style.display = 'block';
  }
  document.getElementById('cookie-accept').onclick = function() {
    localStorage.setItem('cookieConsent', 'true');
    document.getElementById('cookie-banner').style.display = 'none';
  };
  document.getElementById('cookie-refuse').onclick = function() {
    localStorage.setItem('cookieConsent', 'refused');
    document.getElementById('cookie-banner').style.display = 'none';
  };
});
