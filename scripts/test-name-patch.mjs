import { readFileSync } from 'fs';
import { patchMaket12Html } from '../src/components/invite/templates/invitarium/patchMaket12Html.ts';

const html = readFileSync('public/invite-assets/maket12-shell/index.html', 'utf8');
const out = patchMaket12Html(html, {
  title: 'Kurban & Fatima',
  label: '',
  message: '',
  quote: '',
  date: '2026-05-30T18:00:00',
  venueName: '',
  location: '',
  city: '',
  template: 'invitarium',
});

const count = (s) => (out.split(s).length - 1);
console.log('Kurban', count('Kurban'));
console.log('Fatima', count('Fatima'));
console.log('Nazar', count('Nazar'));
console.log('Anita', count('Anita'));
console.log('small font 26.0026', out.includes('26.0026'));
