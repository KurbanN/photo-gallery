import fs from 'fs';

const h = fs.readFileSync(
  'd:/Project/photo-gallery/public/invite-assets/maket12-shell/index.html',
  'utf8'
);
console.log('__maket12ApplyPatches in html:', h.includes('__maket12ApplyPatches'));
console.log('JSON.parse(__bs):', h.includes('JSON.parse(__bs)'));
console.log("old window['bootstrap']:", h.includes("window['bootstrap'] = JSON.parse('"));
