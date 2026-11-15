import { useEffect, useRef, useState } from 'react';
import { Package } from 'lucide-react';
import { useLazyInView } from '../hooks/useLazyInView';
import {
  getMemoryCachedUrl,
  getPersistedMediaUrl,
  isInstagramMediaCached,
  loadAndPersistMedia,
  markInstagramMediaCached,
} from '../utils/instagramCache';

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
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(() => {
    const mem = getMemoryCachedUrl(src);
    if (mem) return mem;
    return !isInstagramMediaCached(src) && loading === 'eager' ? src : null;
  });
  const [failedCompletely, setFailedCompletely] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(() =>
    Boolean(getMemoryCachedUrl(src)),
  );
  const imgRef = useRef<HTMLImageElement>(null);

  const knownCached = isInstagramMediaCached(currentSrc);

  const { ref: lazyRef, inView } = useLazyInView<HTMLDivElement>({
    enabled: loading === 'lazy' && !knownCached,
    rootMargin,
  });

  const shouldResolve = inView || knownCached || loading === 'eager';

  useEffect(() => {
    const mem = getMemoryCachedUrl(src);
    const cached = Boolean(mem) || isInstagramMediaCached(src);
    setCurrentSrc(src);
    setResolvedSrc(mem ?? (!cached && loading === 'eager' ? src : null));
    setFailedCompletely(false);
    setLoaded(Boolean(mem));
  }, [src, loading]);

  useEffect(() => {
    if (!shouldResolve || !currentSrc) return;

    const mem = getMemoryCachedUrl(currentSrc);
    if (mem) {
      setResolvedSrc(mem);
      setLoaded(true);
      return;
    }

    let cancelled = false;

    (async () => {
      const persisted = await getPersistedMediaUrl(currentSrc);
      if (cancelled) return;
      if (persisted) {
        setResolvedSrc(persisted);
        return;
      }

      const fetched = await loadAndPersistMedia(currentSrc);
      if (cancelled) return;
      setResolvedSrc(fetched ?? currentSrc);
    })();

    return () => {
      cancelled = true;
    };
  }, [currentSrc, shouldResolve]);

  useEffect(() => {
    const img = imgRef.current;
    if (shouldResolve && resolvedSrc && img && img.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [resolvedSrc, shouldResolve]);

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      const fallbackMem = getMemoryCachedUrl(fallbackSrc);
      setCurrentSrc(fallbackSrc);
      setResolvedSrc(fallbackMem ?? fallbackSrc);
      setLoaded(Boolean(fallbackMem));
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

  if (!shouldResolve || !resolvedSrc) {
    return (
      <div
        ref={!knownCached && loading === 'lazy' ? lazyRef : undefined}
        role="img"
        aria-label={alt}
        className={`bg-[#e6e6e6] animate-pulse ${className}`}
      />
    );
  }

  return (
    <img
      ref={imgRef}
      src={resolvedSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      referrerPolicy="no-referrer"
      onLoad={() => {
        setLoaded(true);
        markInstagramMediaCached(currentSrc);
      }}
      onError={handleError}
      className={`${className} transition-opacity duration-200 ${
        loaded ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
}
