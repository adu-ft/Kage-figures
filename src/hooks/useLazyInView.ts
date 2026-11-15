import { useEffect, useRef, useState } from 'react';

interface UseLazyInViewOptions {
  enabled?: boolean;
  rootMargin?: string;
  threshold?: number;
}

export function useLazyInView<T extends Element>({
  enabled = true,
  rootMargin = '250px 150px',
  threshold = 0.01,
}: UseLazyInViewOptions = {}) {
  const targetRef = useRef<T | null>(null);
  const [inView, setInView] = useState<boolean>(
    () => !enabled || typeof IntersectionObserver === 'undefined',
  );

  useEffect(() => {
    if (!enabled) {
      setInView(true);
      return;
    }
    if (inView) return;

    const el = targetRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, inView, rootMargin, threshold]);

  return { ref: targetRef, inView };
}
