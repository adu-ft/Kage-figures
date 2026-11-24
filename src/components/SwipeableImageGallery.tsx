import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CollectibleImage } from './CollectibleImage';

export interface SwipeableImageGalleryProps {
  images: string[];
  fallbackSrc?: string;
  alt: string;
  className?: string;
  aspectRatioClass?: string;
  showDots?: boolean;
  showArrows?: boolean;
  showCounter?: boolean;
  onClick?: () => void;
  onImageChange?: (index: number) => void;
  activeIndex?: number;
  lazy?: boolean;
}

export function SwipeableImageGallery({
  images = [],
  fallbackSrc,
  alt,
  className = '',
  aspectRatioClass = 'aspect-square',
  showDots = true,
  showArrows = true,
  showCounter = true,
  onClick,
  onImageChange,
  activeIndex,
  lazy = true,
}: SwipeableImageGalleryProps) {
  // Ensure we have at least one image
  const validImages = images.length > 0 ? images : fallbackSrc ? [fallbackSrc] : [];
  const totalSlides = validImages.length;

  const [currentIndex, setCurrentIndex] = useState(activeIndex ?? 0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Sync with controlled activeIndex prop if supplied
  useEffect(() => {
    if (typeof activeIndex === 'number' && activeIndex >= 0 && activeIndex < totalSlides) {
      setCurrentIndex(activeIndex);
    }
  }, [activeIndex, totalSlides]);

  // Sync index if images array changes
  useEffect(() => {
    if (currentIndex >= totalSlides) {
      setCurrentIndex(0);
    }
  }, [totalSlides, currentIndex]);

  const goToSlide = useCallback(
    (index: number) => {
      let target = index;
      if (target < 0) target = totalSlides - 1;
      if (target >= totalSlides) target = 0;
      setCurrentIndex(target);
      onImageChange?.(target);
    },
    [totalSlides, onImageChange],
  );

  const prevSlide = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      goToSlide(currentIndex - 1);
    },
    [currentIndex, goToSlide],
  );

  const nextSlide = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      goToSlide(currentIndex + 1);
    },
    [currentIndex, goToSlide],
  );

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const deltaX = touchStartX.current - touchEndX.current;
    const deltaY =
      touchStartY.current !== null && e.changedTouches[0]
        ? Math.abs(touchStartY.current - e.changedTouches[0].clientY)
        : 0;

    // Minimum swipe threshold (40px) and prioritize horizontal over vertical
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > deltaY) {
      if (deltaX > 0) {
        // Swiped Left -> Next
        nextSlide();
      } else {
        // Swiped Right -> Prev
        prevSlide();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
    touchStartY.current = null;
  };

  const currentImage = validImages[currentIndex] || fallbackSrc || '';

  return (
    <div
      className={`relative w-full overflow-hidden select-none group/gallery ${aspectRatioClass} ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Active Image container */}
      <div
        className="w-full h-full cursor-pointer relative"
        onClick={() => onClick?.()}
      >
        <CollectibleImage
          src={currentImage}
          fallbackSrc={fallbackSrc}
          alt={`${alt} (Photo ${currentIndex + 1} of ${totalSlides})`}
          loading={lazy ? 'lazy' : 'eager'}
          className="w-full h-full object-cover transition-all duration-300 ease-out"
        />
      </div>

      {/* Navigation Arrows (Only if multiple images) */}
      {showArrows && totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm flex items-center justify-center transition-all opacity-0 group-hover/gallery:opacity-100 focus-visible:opacity-100 hover:scale-105 cursor-pointer shadow-md"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 -ml-0.5" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm flex items-center justify-center transition-all opacity-0 group-hover/gallery:opacity-100 focus-visible:opacity-100 hover:scale-105 cursor-pointer shadow-md"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 -mr-0.5" />
          </button>
        </>
      )}

      {/* Slide Counter Badge (e.g. 1/3) */}
      {showCounter && totalSlides > 1 && (
        <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-full bg-black/65 text-white/90 text-[10px] sm:text-[11px] font-bold backdrop-blur-md pointer-events-none shadow-sm border border-white/10">
          {currentIndex + 1}/{totalSlides}
        </div>
      )}

      {/* Pagination Dots Indicator */}
      {showDots && totalSlides > 1 && (
        <div className="absolute bottom-2.5 inset-x-0 z-20 flex items-center justify-center gap-1.5 pointer-events-none">
          <div className="flex items-center gap-1 bg-black/45 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 pointer-events-auto">
            {validImages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(i);
                }}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-200 rounded-full cursor-pointer ${
                  i === currentIndex
                    ? 'w-4 h-1.5 bg-[#feb913]'
                    : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
