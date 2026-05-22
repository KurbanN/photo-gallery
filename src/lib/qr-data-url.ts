import QRCode from 'qrcode';

/** QR как data URL для вставки в карточку (браузер). */
export async function qrDataUrl(url: string, size = 480): Promise<string> {
  return QRCode.toDataURL(url, {
    width: size,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: { dark: '#0a0a0a', light: '#faf9f7' },
  });
}
