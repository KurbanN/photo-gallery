import { LANDING_PRICING, formatLandingPrice } from '@/content/landing';

type Props = {
  size?: 'md' | 'lg';
  className?: string;
};

export default function LandingPrice({ size = 'md', className = '' }: Props) {
  const { price, compareAt, currency } = LANDING_PRICING;
  const currentSize = size === 'lg' ? 'text-4xl md:text-5xl' : 'text-3xl';
  const compareSize = size === 'lg' ? 'text-xl' : 'text-lg';

  return (
    <div className={className} role="group" aria-label="Стоимость">
      <span className={`text-muted line-through mr-2 ${compareSize}`}>
        {formatLandingPrice(compareAt)}&nbsp;{currency}
      </span>
      <span className={`text-ink font-serif ${currentSize}`}>
        {formatLandingPrice(price)}&nbsp;{currency}
      </span>
    </div>
  );
}
