import { useEffect, useRef, useState } from 'react';
import { Package } from 'lucide-react';
import { useLazyInView } from '../hooks/useLazyInView';

interface CollectibleImageProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  rootMargin?: string;
}

export function CollectibleImage({
  src,
  fallbackSrc,
  alt,
  className = '',
  loading = 'lazy',
  fetchPriority = 'auto',
  rootMargin = '250px 150px',
}: CollectibleImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [failedCompletely, setFailedCompletely] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const { ref: lazyRef, inView } = useLazyInView<HTMLDivElement>({
    enabled: loading === 'lazy',
    rootMargin,
  });

  useEffect(() => {
    setCurrentSrc(src);
    setFailedCompletely(false);
    setLoaded(false);
  }, [src]);

  useEffect(() => {
    const img = imgRef.current;
    if (inView && img && img.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [currentSrc, inView]);

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setLoaded(false);
    } else {
      setFailedCompletely(true);
    }
  };

  if (failedCompletely) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#e6e6e6] via-[#f0f0f0] to-[#dcdcdc] text-[#1a1a1a] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Package className="w-8 h-8 text-[#1a1a1ab3] mb-2" strokeWidth={1.5} />
        <span className="text-[12px] font-semibold tracking-wide text-[#1a1a1ab3] max-w-[18ch] line-clamp-2">
          {alt}
        </span>
      </div>
    );
  }

  if (!inView) {
    return (
      <div
        ref={lazyRef}
        role="img"
        aria-label={alt}
        className={`bg-[#e6e6e6] animate-pulse ${className}`}
      />
    );
  }

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      referrerPolicy="no-referrer"
      onLoad={() => setLoaded(true)}
      onError={handleError}
      className={`${className} transition-opacity duration-200 ${
        loaded ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
}
