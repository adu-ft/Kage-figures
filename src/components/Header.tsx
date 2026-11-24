import { useEffect, useState } from 'react';
import { Menu, Search, ShoppingBasket, X } from 'lucide-react';
import { LOGO_URL } from '../data/catalog';
import {
  getMemoryCachedUrl,
  resolvePersistedMediaUrl,
} from '../utils/instagramCache';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onNavigate: (sectionId: string) => void;
}

const NAV_LINKS = [
  { label: 'Collections', href: '#collection-list' },
  { label: 'Featured', href: '#featured-collection' },
  { label: 'On Sale', href: '#on-sale' },
  { label: 'Vault', href: '#vault-collection' },
  { label: 'IG Posts', href: '#instagram-posts' },
  { label: 'About', href: '#impact-text' },
];

export function Header({
  cartCount,
  onOpenCart,
  onOpenSearch,
  onNavigate,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string>(
    () => getMemoryCachedUrl(LOGO_URL) ?? LOGO_URL,
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    resolvePersistedMediaUrl(LOGO_URL).then((cached) => {
      if (!cancelled && cached) {
        setLogoSrc(cached);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    onNavigate(href);
  };

  const iconColorClass = isScrolled
    ? 'text-[#1a1a1a] hover:text-[#f83a3a]'
    : 'text-white hover:text-[#feb913] drop-shadow-[0_1px_4px_rgba(0,0,0,0.65)]';

  return (
    <header
      className={`shopify-section shopify-section-group-header-group fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/85 backdrop-blur-xl shadow-[0_1px_12px_0_rgba(0,0,0,0.08)] border-b border-[#1a1a1a]/10'
          : 'bg-gradient-to-b from-black/60 via-black/30 to-transparent'
      }`}
    >
      <div className="container-site">
        <div className="flex items-center justify-between gap-2.5 sm:gap-4 md:gap-6 h-[58px] sm:h-[66px]">
          {/* Left Zone: Brand Logo & White Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              onNavigate('#top');
            }}
            className="flex items-center gap-1.5 sm:gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#feb913] rounded"
            aria-label="Kage Figures Home"
          >
            {!logoError && (
              <img
                src={logoSrc}
                alt="Kage Figures logo"
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
                className={`h-7 w-7 sm:h-9 sm:w-9 rounded-full object-cover border transition-all duration-200 shrink-0 ${
                  isScrolled
                    ? 'border-[#1a1a1a]/15 shadow-sm'
                    : 'border-white/40 drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]'
                }`}
              />
            )}
            <span
              className={`font-gang-of-three text-[15px] sm:text-[20px] font-normal tracking-[0.04em] leading-none transition-colors ${
                isScrolled
                  ? 'text-[#1a1a1a]'
                  : 'text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.75)]'
              }`}
            >
              KAGE FIGURES
            </span>
          </a>

          {/* Center Zone: Full Search Bar */}
          <div className="flex-1 min-w-0 max-w-[440px] mx-auto">
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Search collectibles"
              className={`w-full h-8 sm:h-9 px-3 sm:px-4 rounded-full flex items-center gap-2 text-left transition-all duration-200 cursor-pointer border ${
                isScrolled
                  ? 'bg-[#f0f0f0] border-[#1a1a1a]/12 text-[#1a1a1ab3] hover:border-[#1a1a1a]/35 hover:bg-white'
                  : 'bg-white/15 backdrop-blur-md border-white/25 text-white/85 hover:bg-white/25 hover:border-white/45'
              }`}
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" strokeWidth={2} />
              <span className="text-[12px] sm:text-[13px] font-medium truncate">
                <span className="sm:hidden">Search...</span>
                <span className="hidden sm:inline">Search keychains, figures, cars, katana...</span>
              </span>
            </button>
          </div>

          {/* Right Zone: Desktop Menu Links / Bag Icon + Menu Bar */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-3 shrink-0">
            <nav
              className="hidden lg:flex items-center gap-5 mr-1"
              aria-label="Primary Navigation"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(link.href);
                  }}
                  className={`text-[14px] font-semibold tracking-[0.01em] whitespace-nowrap shrink-0 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#feb913] rounded ${iconColorClass}`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Open shopping bag, ${cartCount} items`}
              className={`relative w-8 h-8 sm:w-9 sm:h-9 inline-flex items-center justify-center rounded-full transition-colors duration-200 cursor-pointer shrink-0 ${iconColorClass}`}
            >
              <ShoppingBasket className="w-[19px] h-[19px] sm:w-[21px] sm:h-[21px]" strokeWidth={1.9} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[17px] h-[17px] px-1 rounded-full bg-[#feb913] text-[#060606] text-[10px] font-extrabold tabular-nums shadow-[0_0_6px_1px_#FEB91380]">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              className={`lg:hidden w-8 h-8 sm:w-9 sm:h-9 inline-flex items-center justify-center rounded-full transition-colors duration-200 cursor-pointer shrink-0 ${iconColorClass}`}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" strokeWidth={2} />
              ) : (
                <Menu className="w-5 h-5" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Slide-Down Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-[#1a1a1a]/10 shadow-lg px-5 py-4">
          <nav className="flex flex-col gap-2.5" aria-label="Mobile Navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.href);
                }}
                className="text-[15px] font-semibold text-[#1a1a1a] py-2 border-b border-[#1a1a1a]/10 last:border-b-0"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
