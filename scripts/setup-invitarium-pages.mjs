import fs from 'fs';
import path from 'path';

const SRC = 'C:/My Web Sites/asdasd/invitarium.io';
const OUT = 'd:/Project/photo-gallery/public/invite-assets/invitarium-pages';
/** Относительно invitarium-pages/f|t/ → invite-assets/invitarium/build */
const BUILD = '../../invitarium/build';

function patchHtml(html, { dateIso }) {
  let h = html;
  h = h.replace(/\.\.\/build\//g, `${BUILD}/`);
  h = h.replace(/https:\/\/invitarium\.io\/build\//g, `${BUILD}/`);
  h = h.replace(
    /src="\.\.\/\.\.\/cdn\.jsdelivr\.net\/npm\/luxon[^"]+"/,
    `src="../../invitarium/luxon.min.js"`
  );
  h = h.replace(/<footer class="footer">[\s\S]*?<\/footer>/g, '');
  const fallback = dateIso ? dateIso.slice(0, 10) : '2026-08-02';
  h = h.replace(
    /const dateString = "[^"]+";/,
    `const params = new URLSearchParams(window.location.search);
            const dateString = params.get('date') || '${fallback}';`
  );
  return h;
}

function patchFormHtml(html) {
  let h = patchHtml(html, { dateIso: null });
  h = h.replace(
    /data-submit-url="[^"]+"/,
    'data-submit-url="/api/invite-rsvp-bridge"'
  );
  const bridge = `
<script>
window.__INVITARIUM_RSVP_BRIDGE__ = true;
(function () {
  function bindRsvp() {
    var form = document.getElementById('responseForm');
    if (!form || form.dataset.rsvpBridge === '1') return;
    form.dataset.rsvpBridge = '1';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      var nameInput = form.querySelector('input[data-field-id="5380"]');
      var yes = form.querySelector('#yes');
      var no = form.querySelector('#no');
      var transfer = form.querySelector('input[name="field_5381"]:checked, input[data-field-id="5381"]:checked');
      var name = (nameInput && nameInput.value || '').trim();
      var status = 'maybe';
      if (yes && yes.checked) status = 'attending';
      else if (no && no.checked) status = 'declined';
      var comment = transfer ? String(transfer.value || '').trim() : '';
      window.top.postMessage({ type: 'invitarium-rsvp', payload: { name: name, status: status, comment: comment } }, '*');
    }, true);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindRsvp);
  } else {
    bindRsvp();
  }
})();
</script>`;
  h = h.replace(/form\.addEventListener\('submit', async function\(e\) \{[\s\S]*?\}\);\s*\n\s*\/\/ --- Вспомогательные функции ---/, '// RSVP: bridge script handles submit\n            // --- Вспомогательные функции ---');
  return h.replace('</body>', `${bridge}</body>`);
}

fs.mkdirSync(path.join(OUT, 'f'), { recursive: true });
fs.mkdirSync(path.join(OUT, 't'), { recursive: true });

const formSrc = fs.readFileSync(path.join(SRC, 'f/eb5daa0293f020daa2.html'), 'utf8');
const timerSrc = fs.readFileSync(path.join(SRC, 't/6e950298a33c648472.html'), 'utf8');

fs.writeFileSync(
  path.join(OUT, 'f/eb5daa0293f020daa2.html'),
  patchFormHtml(formSrc)
);
fs.writeFileSync(
  path.join(OUT, 't/6e950298a33c648472.html'),
  patchHtml(timerSrc, { dateIso: '2026-08-02' })
);

console.log('Wrote invitarium-pages');
