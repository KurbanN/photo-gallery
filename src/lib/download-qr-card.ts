import { toPng } from 'html-to-image';
import { normalizeQrPrintFormat, QR_PRINT_FORMAT_SPECS, type QrPrintFormat } from '@/lib/qr-print-formats';

function resolveFormat(element: HTMLElement, format?: QrPrintFormat): QrPrintFormat {
  if (format) return normalizeQrPrintFormat(format);
  const fromDom = element.dataset.printFormat;
  return normalizeQrPrintFormat(fromDom);
}

export async function downloadQrPrintCard(
  element: HTMLElement,
  filename: string,
  options?: { format?: QrPrintFormat },
): Promise<void> {
  const format = resolveFormat(element, options?.format);
  const spec = QR_PRINT_FORMAT_SPECS[format];
  const dataUrl = await toPng(element, {
    pixelRatio: spec.pixelRatio,
    backgroundColor: element.dataset.exportBg || '#faf9f7',
    cacheBust: true,
    useCORS: true,
  });
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  a.click();
}

export function printQrPrintCard(element: HTMLElement, options?: { format?: QrPrintFormat }): void {
  const format = resolveFormat(element, options?.format);
  const spec = QR_PRINT_FORMAT_SPECS[format];
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
      @page { size: ${spec.printPageSize}; margin: ${spec.printMargin}; }
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
