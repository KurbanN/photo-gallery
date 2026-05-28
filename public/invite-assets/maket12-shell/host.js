(function () {
  const params = new URLSearchParams(window.location.search);
  const timerDate = params.get('timerDate');

  function patchTimerIframes() {
    if (!timerDate) return;
    document.querySelectorAll('iframe').forEach((iframe) => {
      const raw = iframe.getAttribute('src') || iframe.src || '';
      if (!raw.includes('6e950298a33c648472') || raw.includes('date=')) return;
      try {
        const url = new URL(raw, window.location.origin);
        url.searchParams.set('date', timerDate);
        iframe.src = url.pathname + url.search;
      } catch {
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
    } catch {
      /* ignore */
    }
  }

  const observer = new MutationObserver(() => {
    patchTimerIframes();
    postResize();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('load', () => {
    patchTimerIframes();
    postResize();
  });
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(postResize).observe(document.documentElement);
  }
})();
