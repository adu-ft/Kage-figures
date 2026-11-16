import { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { HERO_SLIDES } from '../data/catalog';

interface HeroSlideshowProps {
  onSelectSlideAction: (targetSection: string, filterCategory?: string) => void;
}

export function HeroSlideshow({ onSelectSlideAction }: HeroSlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  const currentSlide = HERO_SLIDES[activeIndex];
  const nextIndex = (activeIndex + 1) % HERO_SLIDES.length;

  useEffect(() => {
    const nextUrl = HERO_SLIDES[nextIndex]?.imageUrl;
    if (!nextUrl) return;
    const timer = window.setTimeout(() => {
      const preloader = new Image();
      preloader.decoding = 'async';
      preloader.src = nextUrl;
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [nextIndex]);

  const handlePrev = () => {
    setActiveIndex(
      (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length,
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <section
      id="top"
      className="shopify-section shopify-section--slideshow bg-[#f0f0f0] relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full h-[460px] sm:h-[580px] md:h-[640px] lg:h-[700px] bg-[#1a1a1a]">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            aria-hidden={idx !== activeIndex}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              idx === activeIndex
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.imageUrl}
              alt={slide.headline}
              width={3840}
              height={2160}
              referrerPolicy="no-referrer"
              loading={idx === 0 || idx === activeIndex ? 'eager' : 'lazy'}
              decoding={idx === 0 ? 'sync' : 'async'}
              fetchPriority={idx === 0 ? 'high' : 'low'}
              onError={(e) => {
                const img = e.currentTarget;
                if (slide.fallbackUrl && img.src !== slide.fallbackUrl) {
                  img.src = slide.fallbackUrl;
                }
              }}
              className={`w-full h-full object-cover ${slide.imagePositionClass || 'object-center'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/30" />
          </div>
        ))}

        {/* Hero Foreground Overlay */}
        <div className="relative z-10 h-full container-site flex flex-col justify-end pb-7 sm:pb-14 md:pb-16 pt-20">
          <div className="max-w-[780px]">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-3">
              {/* Hero eyebrow */}
              <h1
                className="text-[10px] sm:text-[13px] font-semibold tracking-[0.08em] uppercase text-white/90 m-0 truncate"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {currentSlide.eyebrow}
              </h1>
            </div>

            <h2
              className="font-gang-of-three text-[25px] sm:text-[38px] lg:text-[48px] font-normal leading-[1.12] tracking-[0.02em] text-white mb-3 sm:mb-4 max-w-[18ch] sm:max-w-[22ch]"
              style={{
                textWrap: 'balance',
              }}
            >
              {currentSlide.headline}
            </h2>

            <p className="hidden sm:block text-[15px] leading-[24px] font-medium text-white/85 max-w-[560px] mb-6">
              {currentSlide.subcopy}
            </p>

            <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    onSelectSlideAction(
                      currentSlide.targetSection,
                      currentSlide.filterCategory,
                    )
                  }
                  className="button-primary-inverse !px-4 !py-2.5 !text-[12px] sm:!px-6 sm:!py-3.5 sm:!text-[14px]"
                >
                  <span
                    className="text-[12px] sm:text-[14px] font-bold tracking-[0.01em]"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {currentSlide.ctaLabel}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <a
                  href="#collection-list"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectSlideAction('#collection-list');
                  }}
                  className="hidden sm:inline-flex glass-dark text-white px-7 py-[16px] rounded-[60px] text-[16px] font-semibold hover:bg-white/20 transition-all duration-200 whitespace-nowrap"
                >
                  View Collections
                </a>
              </div>

              {/* Compact Mobile Slideshow Arrows */}
              <div className="flex md:hidden items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous slide"
                  className="w-9 h-9 rounded-full glass-dark text-white inline-flex items-center justify-center hover:bg-white hover:text-[#1a1a1a] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next slide"
                  className="w-9 h-9 rounded-full glass-dark text-white inline-flex items-center justify-center hover:bg-white hover:text-[#1a1a1a] transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Slideshow Dots (and Desktop Arrows) */}
          <div className="mt-4 md:mt-0 md:absolute md:right-5 md:bottom-16 flex items-center gap-4">
            <div
              className="flex items-center gap-2 mr-2"
              role="tablist"
              aria-label="Slide selector"
            >
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === activeIndex}
                  aria-label={`Show slide ${idx + 1}: ${slide.headline}`}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activeIndex
                      ? 'w-7 sm:w-8 bg-[#feb913] shadow-[0_0_8px_1px_#FEB91380]'
                      : 'w-2 sm:w-2.5 bg-white/45 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous slide"
              className="hidden md:inline-flex w-11 h-11 rounded-full glass-dark text-white items-center justify-center hover:bg-white hover:text-[#1a1a1a] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next slide"
              className="hidden md:inline-flex w-11 h-11 rounded-full glass-dark text-white items-center justify-center hover:bg-white hover:text-[#1a1a1a] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
