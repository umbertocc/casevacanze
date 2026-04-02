// Google tag (gtag.js) centralizzato
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-LM9V0BM4DS');
gtag('config', 'AW-17941172028');

/* Google Ads Conversion Tracking */
function gtag_report_conversion(url) {
  var called = false;
  var callback = function () {
    if (!called) {
      called = true;
      if (typeof(url) != 'undefined') {
        window.location = url;
      }
    }
  };
  gtag('event', 'conversion', {
    'send_to': 'AW-17941172028/OvpCCP_1jJQcELyegutC',
    'event_callback': callback
  });
  gtag('event', 'contatto', {
    'event_category': 'lead',
    'event_label': url || 'form_submit'
  });
  // Fallback: se il callback non viene chiamato entro 1 secondo, naviga comunque
  setTimeout(callback, 1000);
  return false;
}
