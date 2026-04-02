// Google tag (gtag.js) centralizzato
(function() {
  var gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-LM9V0BM4DS';
  document.head.appendChild(gtagScript);

  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', 'G-LM9V0BM4DS');
  gtag('config', 'AW-17941172028');

  /* Google Ads Conversion Tracking */
  window.gtag_report_conversion = function(url) {
    var callback = function () {
      if (typeof(url) != 'undefined') {
        window.location = url;
      }
    };
    gtag('event', 'conversion', {
      'send_to': 'AW-17941172028/OvpCCP_1jJQcELyegutC',
      'event_callback': callback
    });
    // Evento personalizzato GA4
    gtag('event', 'contatto', {
      'event_category': 'lead',
      'event_label': url || 'form_submit'
    });
    return false;
  };
})();
