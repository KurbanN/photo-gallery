(function () {
  function escapeCanvaFragment(text) {
    return String(text)
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\r\n/g, '\n')
      .replace(/\n/g, '\\n');
  }

  function replaceCanvaInBootstrap(bootstrapStr, oldText, newText) {
    if (!oldText || oldText === newText) return bootstrapStr;
    var from = '"A":"' + escapeCanvaFragment(oldText) + '\\\\n"';
    var to = '"A":"' + escapeCanvaFragment(newText) + '\\\\n"';
    return bootstrapStr.indexOf(from) !== -1 ? bootstrapStr.split(from).join(to) : bootstrapStr;
  }

  function loadPatches() {
    var params = new URLSearchParams(window.location.search);
    var patchId = params.get('patchId');
    if (patchId) {
      try {
        var raw = sessionStorage.getItem('maket12-patches:' + patchId);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        /* ignore */
      }
    }
    var p = params.get('p');
    if (!p) return null;
    try {
      return JSON.parse(decodeURIComponent(escape(atob(p))));
    } catch (e) {
      return null;
    }
  }

  window.__maket12ApplyPatches = function (bootstrapStr) {
    var patches = loadPatches();
    if (!Array.isArray(patches)) return bootstrapStr;
    var out = bootstrapStr;
    patches
      .slice()
      .sort(function (a, b) {
        return (b.from || '').length - (a.from || '').length;
      })
      .forEach(function (patch) {
        if (patch && patch.from != null && patch.to != null) {
          out = replaceCanvaInBootstrap(out, patch.from, patch.to);
        }
      });
    return out;
  };

  var timerDate = new URLSearchParams(window.location.search).get('timerDate');
  var timerUrl = window.__MAKET12_TIMER_URL__;

  function patchTimerIframes() {
    document.querySelectorAll('iframe').forEach(function (iframe) {
      var raw = iframe.getAttribute('src') || iframe.src || '';
      if (raw.indexOf('6e950298a33c648472') === -1) return;

      if (timerUrl) {
        try {
          if (raw.indexOf('canva-embed.com') !== -1) {
            iframe.src =
              'https://canva-embed.com/api/iframe?url=' + encodeURIComponent(timerUrl);
          } else {
            iframe.src = new URL(timerUrl, window.location.href).href;
          }
        } catch (e) {
          /* ignore */
        }
        return;
      }

      if (!timerDate || raw.indexOf('date=') !== -1) return;
      try {
        var url = new URL(raw, window.location.href);
        url.searchParams.set('date', timerDate);
        iframe.src = url.href;
      } catch (e) {
        /* ignore */
      }
    });
  }

  function postResize() {
    try {
      window.parent.postMessage(
        { type: 'maket12-resize', height: document.documentElement.scrollHeight },
        '*',
      );
    } catch (e) {
      /* ignore */
    }
  }

  var observer = new MutationObserver(function () {
    patchTimerIframes();
    postResize();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('load', function () {
    patchTimerIframes();
    postResize();
  });
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(postResize).observe(document.documentElement);
  }
})();
