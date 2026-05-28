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
    const from = '"A":"' + escapeCanvaFragment(oldText) + '\\\\n"';
    const to = '"A":"' + escapeCanvaFragment(newText) + '\\\\n"';
    return bootstrapStr.includes(from) ? bootstrapStr.split(from).join(to) : bootstrapStr;
  }

  window.__maket12ApplyPatches = function (bootstrapStr) {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('p');
    if (!raw) return bootstrapStr;
    try {
      const patches = JSON.parse(decodeURIComponent(escape(atob(raw))));
      if (!Array.isArray(patches)) return bootstrapStr;
      let out = bootstrapStr;
      const sorted = patches.slice().sort(function (a, b) {
        return (b.from || '').length - (a.from || '').length;
      });
      for (var i = 0; i < sorted.length; i++) {
        var patch = sorted[i];
        if (patch && patch.from != null && patch.to != null) {
          out = replaceCanvaInBootstrap(out, patch.from, patch.to);
        }
      }
      return out;
    } catch (e) {
      return bootstrapStr;
    }
  };

  const timerDate = new URLSearchParams(window.location.search).get('timerDate');

  function patchTimerIframes() {
    if (!timerDate) return;
    document.querySelectorAll('iframe').forEach(function (iframe) {
      var raw = iframe.getAttribute('src') || iframe.src || '';
      if (raw.indexOf('6e950298a33c648472') === -1 || raw.indexOf('date=') !== -1) return;
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
