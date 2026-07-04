import { useState } from 'react';
import { WalletCards } from 'lucide-react';
import { getCardImageUrl } from '../lib/imageUrl';

export function ImagePlaceholder({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 48 : 32;
  const textClass = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400 w-full h-full">
      <WalletCards size={iconSize} strokeWidth={1.5} />
      <span className={`${textClass} font-bold`}>Sin imagen</span>
    </div>
  );
}

export function CardImage({
  src,
  alt,
  className,
  placeholderSize = 'md',
  size = 'card',
}: {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  placeholderSize?: 'sm' | 'md' | 'lg';
  size?: 'thumb' | 'card' | 'full';
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src || failed) return <ImagePlaceholder size={placeholderSize} />;

  const transformedSrc = getCardImageUrl(src, size) ?? src;

  return (
    <img
      src={transformedSrc}
      alt={alt}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className ?? ''}`}
    />
  );
}
