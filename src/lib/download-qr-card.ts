import { toPng } from 'html-to-image';

export async function downloadQrPrintCard(element: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await toPng(element, {
    pixelRatio: 3,
    backgroundColor: '#faf9f7',
    cacheBust: true,
  });
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  a.click();
}

export function printQrPrintCard(element: HTMLElement): void {
  const win = window.open('', '_blank', 'noopener,noreferrer');
  if (!win) {
    alert('Разрешите всплывающие окна для печати');
    return;
  }
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.transform = 'none';
  clone.style.margin = '0';
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Печать QR</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
      @page { size: A6 portrait; margin: 8mm; }
      body { margin: 0; display: flex; justify-content: center; align-items: flex-start; background: #fff; }
      * { box-sizing: border-box; }
    </style>
  </head><body></body></html>`);
  win.document.body.appendChild(clone);
  win.document.close();
  win.focus();
  const done = () => {
    win.print();
    win.onafterprint = () => win.close();
  };
  if (win.document.fonts?.ready) {
    void win.document.fonts.ready.then(done);
  } else {
    setTimeout(done, 400);
  }
}
