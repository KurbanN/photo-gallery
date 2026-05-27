/** Декоративная рамка (PNG). См. public/qr-ornaments/kazakh/ATTRIBUTION.md */

import { publicAssetUrl } from '@/lib/public-asset-url';

export const ORNAMENT_FRAME_SRC = publicAssetUrl('/qr-ornaments/kazakh/ornament-frame.png');

export const ORNAMENT_FRAME_THEME = {
  bg: '#ffffff',
  gold: '#9a7348',
  burgundy: '#8b2e3c',
  ink: '#1a1a1a',
  muted: '#5c5348',
} as const;

/** @deprecated используйте ORNAMENT_FRAME_THEME */
export const KAZAKH_THEME = ORNAMENT_FRAME_THEME;

export default function KazakhOrnamentFrame() {
  return (
    <img
      src={ORNAMENT_FRAME_SRC}
      alt=""
      className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
      style={{ objectFit: 'fill' }}
      draggable={false}
      aria-hidden
    />
  );
}
