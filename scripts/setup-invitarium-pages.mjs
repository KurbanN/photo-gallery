import fs from 'fs';
import path from 'path';

const SRC = 'C:/My Web Sites/asdasd/invitarium.io';
const OUT = 'd:/Project/photo-gallery/public/invite-assets/invitarium-pages';
const BUILD = '/invite-assets/invitarium/build';

function patchHtml(html, { dateIso }) {
  let h = html;
  h = h.replace(/\.\.\/build\//g, `${BUILD}/`);
  h = h.replace(/https:\/\/invitarium\.io\/build\//g, `${BUILD}/`);
  h = h.replace(
    /src="\.\.\/\.\.\/cdn\.jsdelivr\.net\/npm\/luxon[^"]+"/,
    `src="/invite-assets/invitarium/luxon.min.js"`
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
(function () {
  const wrapper = document.getElementById('responseFormWrapper');
  const form = document.getElementById('responseForm');
  if (!wrapper || !form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    const nameInput = form.querySelector('input[data-field-id="5380"]');
    const yes = form.querySelector('#yes');
    const no = form.querySelector('#no');
    const transfer = form.querySelector('input[name="field_5381"]:checked, input[data-field-id="5381"]:checked');
    const name = (nameInput && nameInput.value || '').trim();
    let status = 'maybe';
    if (yes && yes.checked) status = 'attending';
    else if (no && no.checked) status = 'declined';
    const comment = transfer ? String(transfer.value || '').trim() : '';
    window.top.postMessage({ type: 'invitarium-rsvp', payload: { name, status, comment } }, '*');
  }, true);
})();
</script>`;
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
