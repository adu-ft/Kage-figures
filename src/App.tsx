import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  IndianRupee,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Truck,
  X,
} from 'lucide-react';
import {
  CATALOG_MAX_PRICE,
  CATALOG_MIN_PRICE,
  IMAGE_LINK_BLOCKS,
  MARQUEE_ITEMS,
  PRODUCTS,
  type Product,
  getActivePriceLabel,
} from './data/catalog';
import { CollectibleImage } from './components/CollectibleImage';
import { Header } from './components/Header';
import { HeroSlideshow } from './components/HeroSlideshow';
import { LegalPage, type LegalPageId } from './components/LegalPage';
import { PriceRangeFilter } from './components/PriceRangeFilter';
import { ProductCard } from './components/ProductCard';
import { ProductCardSkeleton } from './components/ProductCardSkeleton';
import { ProductDetailPage } from './components/ProductDetailPage';
import {
  CartDrawer,
  SearchModal,
  type CartItem,
} from './components/DrawersAndModals';
import {
  getCatalogSignature,
  hydrateInstagramPostsAsync,
  loadCatalogViewState,
  loadStoredCart,
  saveCatalogViewState,
  saveStoredCart,
} from './utils/instagramCache';
import {
  getLastVerifiedPincode,
  type PincodeDetails,
} from './utils/indianPincode';

const LEGAL_HASH_MAP: Record<string, LegalPageId> = {
  '#privacy-policy': 'privacy',
  '#terms-and-conditions': 'terms',
  '#shipping-policy': 'shipping',
  '#refund-policy': 'refund',
};

const LEGAL_ID_TO_HASH: Record<LegalPageId, string> = {
  privacy: '#privacy-policy',
  terms: '#terms-and-conditions',
  shipping: '#shipping-policy',
  refund: '#refund-policy',
};

function shuffleArray<T>(list: T[]): T[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleMixedByCategory(items: Product[]): Product[] {
  const buckets = new Map<string, Product[]>();
  for (const item of items) {
    const list = buckets.get(item.category);
    if (list) {
      list.push(item);
    } else {
      buckets.set(item.category, [item]);
    }
  }
  const orderedBuckets = shuffleArray(
    Array.from(buckets.values()).map((b) => shuffleArray(b)),
  );
  const mixed: Product[] = [];
  let idx = 0;
  let remaining = true;
  while (remaining) {
    remaining = false;
    for (const bucket of orderedBuckets) {
      if (idx < bucket.length) {
        mixed.push(bucket[idx]);
        remaining = true;
      }
    }
    idx++;
  }
  return mixed;
}

const FILTER_CATEGORIES = [
  'All',
  'Anime Keychains',
  'Anime Action Figures',
  'Cars Figures',
  'Katana',
  'Manga Frame',
] as const;

function orderProductsByIds(
  source: Product[],
  ids: string[] | undefined,
): Product[] | null {
  if (!ids || ids.length !== source.length) return null;
  const map = new Map(source.map((p) => [p.id, p]));
  const ordered: Product[] = [];
  for (const id of ids) {
    const found = map.get(id);
    if (!found) return null;
    ordered.push(found);
  }
  return ordered;
}

export default function App() {
  const catalogSignature = useMemo(() => getCatalogSignature(PRODUCTS), []);
  const initialViewState = useMemo(
    () => loadCatalogViewState(catalogSignature),
    [catalogSignature],
  );
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [isHydratingCatalog, setIsHydratingCatalog] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    hydrateInstagramPostsAsync(PRODUCTS).then((posts) => {
      if (cancelled) return;
      setCatalogProducts(posts);
      setIsHydratingCatalog(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string>(() =>
    initialViewState?.selectedCategory &&
    FILTER_CATEGORIES.includes(
      initialViewState.selectedCategory as (typeof FILTER_CATEGORIES)[number],
    )
      ? initialViewState.selectedCategory
      : 'All',
  );
  const [allShuffleSeed, setAllShuffleSeed] = useState<number>(0);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState<boolean>(false);
  const [priceRange, setPriceRange] = useState<[number, number]>(() => {
    const stored = initialViewState?.priceRange;
    if (
      Array.isArray(stored) &&
      stored.length === 2 &&
      typeof stored[0] === 'number' &&
      typeof stored[1] === 'number' &&
      stored[0] >= CATALOG_MIN_PRICE &&
      stored[1] <= CATALOG_MAX_PRICE &&
      stored[0] <= stored[1]
    ) {
      return [stored[0], stored[1]];
    }
    return [CATALOG_MIN_PRICE, CATALOG_MAX_PRICE];
  });
  const [priceMenuOpen, setPriceMenuOpen] = useState<boolean>(false);
  const [visibleDesktopCount, setVisibleDesktopCount] = useState<number>(() =>
    typeof initialViewState?.visibleDesktopCount === 'number' &&
    initialViewState.visibleDesktopCount >= 10
      ? initialViewState.visibleDesktopCount
      : 10,
  );
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    loadStoredCart<CartItem>(),
  );
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeLegalPage, setActiveLegalPage] = useState<LegalPageId | null>(
    null,
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [verifiedPincode, setVerifiedPincode] =
    useState<PincodeDetails | null>(() => getLastVerifiedPincode());
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const priceMenuRef = useRef<HTMLDivElement>(null);
  const collectionScrollRef = useRef<HTMLDivElement>(null);
  const savedScrollYRef = useRef<number>(0);
  const prevSubpageOpenRef = useRef<boolean>(false);
  const collectionDragState = useRef<{
    isDown: boolean;
    startX: number;
    scrollLeft: number;
    didDrag: boolean;
  }>({ isDown: false, startX: 0, scrollLeft: 0, didDrag: false });
  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const saleScrollRef = useRef<HTMLDivElement>(null);
  const vaultScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!categoryMenuOpen && !priceMenuOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (
        categoryMenuOpen &&
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(e.target as Node)
      ) {
        setCategoryMenuOpen(false);
      }
      if (
        priceMenuOpen &&
        priceMenuRef.current &&
        !priceMenuRef.current.contains(e.target as Node)
      ) {
        setPriceMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCategoryMenuOpen(false);
        setPriceMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [categoryMenuOpen, priceMenuOpen]);

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#product-')) {
        if (!prevSubpageOpenRef.current) {
          savedScrollYRef.current = window.scrollY;
        }
        const id = decodeURIComponent(hash.slice('#product-'.length));
        const source = catalogProducts.length > 0 ? catalogProducts : PRODUCTS;
        const found = source.find((p) => p.id === id) || null;
        prevSubpageOpenRef.current = Boolean(found);
        setActiveLegalPage(null);
        setSelectedProduct(found);
      } else if (LEGAL_HASH_MAP[hash]) {
        if (!prevSubpageOpenRef.current) {
          savedScrollYRef.current = window.scrollY;
        }
        prevSubpageOpenRef.current = true;
        setSelectedProduct(null);
        setActiveLegalPage(LEGAL_HASH_MAP[hash]);
        window.scrollTo({ top: 0, behavior: 'auto' });
      } else {
        const wasOpen = prevSubpageOpenRef.current;
        prevSubpageOpenRef.current = false;
        setSelectedProduct(null);
        setActiveLegalPage(null);
        if (wasOpen) {
          requestAnimationFrame(() => {
            window.scrollTo({ top: savedScrollYRef.current, behavior: 'auto' });
          });
        }
      }
    };
    syncFromHash();
    window.addEventListener('popstate', syncFromHash);
    return () => window.removeEventListener('popstate', syncFromHash);
  }, [catalogProducts]);

  useEffect(() => {
    saveStoredCart(cartItems);
  }, [cartItems]);

  const scrollTrack = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: 'prev' | 'next',
  ) => {
    if (!ref.current) return;
    const distance = Math.max(240, ref.current.clientWidth * 0.8);
    ref.current.scrollBy({
      left: direction === 'next' ? distance : -distance,
      behavior: 'smooth',
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3100);
  };

  const handleOpenProduct = (product: Product) => {
    if (!selectedProduct && !activeLegalPage) {
      savedScrollYRef.current = window.scrollY;
    }
    prevSubpageOpenRef.current = true;
    setActiveLegalPage(null);
    setSelectedProduct(product);
    const targetHash = `#product-${encodeURIComponent(product.id)}`;
    if (window.location.hash !== targetHash) {
      window.history.pushState({ productId: product.id }, '', targetHash);
    }
  };

  const handleOpenLegalPage = (pageId: LegalPageId) => {
    if (!selectedProduct && !activeLegalPage) {
      savedScrollYRef.current = window.scrollY;
    }
    prevSubpageOpenRef.current = true;
    setSelectedProduct(null);
    setActiveLegalPage(pageId);
    const targetHash = LEGAL_ID_TO_HASH[pageId];
    if (window.location.hash !== targetHash) {
      window.history.pushState({ legalPage: pageId }, '', targetHash);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (sectionId: string, filterCategory?: string) => {
    const wasOnSubpage = selectedProduct !== null || activeLegalPage !== null;
    if (wasOnSubpage) {
      prevSubpageOpenRef.current = false;
      setSelectedProduct(null);
      setActiveLegalPage(null);
      if (
        window.location.hash.startsWith('#product-') ||
        LEGAL_HASH_MAP[window.location.hash]
      ) {
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search,
        );
      }
    }
    if (filterCategory) {
      setSelectedCategory(filterCategory);
      if (filterCategory === 'All') {
        setAllShuffleSeed((s) => s + 1);
      }
      setPriceRange([CATALOG_MIN_PRICE, CATALOG_MAX_PRICE]);
      setVisibleDesktopCount(10);
    }

    const performScroll = () => {
      if (sectionId === '#top') {
        window.scrollTo({ top: 0, behavior: wasOnSubpage ? 'auto' : 'smooth' });
        return;
      }
      const el = document.querySelector(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    if (wasOnSubpage) {
      requestAnimationFrame(performScroll);
    } else {
      performScroll();
    }
  };

  const handleBackToCatalogue = (categoryFilter?: string) => {
    if (categoryFilter) {
      handleNavigate('#featured-collection', categoryFilter);
      return;
    }
    prevSubpageOpenRef.current = false;
    setSelectedProduct(null);
    setActiveLegalPage(null);
    if (
      window.location.hash.startsWith('#product-') ||
      LEGAL_HASH_MAP[window.location.hash]
    ) {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search,
      );
    }
    requestAnimationFrame(() => {
      window.scrollTo({ top: savedScrollYRef.current, behavior: 'auto' });
    });
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    if (category === 'All') {
      setAllShuffleSeed((s) => s + 1);
    }
    setCategoryMenuOpen(false);
    setVisibleDesktopCount(10);
    if (featuredScrollRef.current) {
      featuredScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange([min, max]);
    setVisibleDesktopCount(10);
    if (featuredScrollRef.current) {
      featuredScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setAllShuffleSeed((s) => s + 1);
    setPriceRange([CATALOG_MIN_PRICE, CATALOG_MAX_PRICE]);
    setVisibleDesktopCount(10);
  };

  const handleAddToCart = (
    product: Product,
    variantId?: string,
    quantity = 1,
  ) => {
    const resolvedVariant =
      product.variants.find((v) => v.id === variantId) || product.variants[0];
    const vId = resolvedVariant?.id || 'std';
    const vLabel = resolvedVariant?.label || 'Standard Edition';
    const unitPrice = Math.max(
      49,
      product.price + (resolvedVariant?.priceDelta || 0),
    );

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.variantId === vId,
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [
        ...prev,
        {
          product,
          variantId: vId,
          variantLabel: vLabel,
          unitPrice,
          quantity,
        },
      ];
    });

    showToast(`Added ${product.title} to your bag`);
  };

  const handleBuyNow = (
    product: Product,
    variantId?: string,
    quantity = 1,
  ) => {
    handleAddToCart(product, variantId, quantity);
    setCartOpen(true);
  };

  const handleUpdateCartQty = (key: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          const itemKey = `${item.product.id}__${item.variantId}`;
          if (itemKey !== key) return item;
          return { ...item, quantity: item.quantity + delta };
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemoveCartItem = (key: string) => {
    setCartItems((prev) =>
      prev.filter((item) => `${item.product.id}__${item.variantId}` !== key),
    );
  };

  const handleNewsletterSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const shuffledAllProducts = useMemo(() => {
    if (allShuffleSeed === 0) {
      const restored = orderProductsByIds(
        catalogProducts,
        initialViewState?.shuffledAllIds,
      );
      if (restored) return restored;
    }
    return shuffleMixedByCategory(catalogProducts);
  }, [allShuffleSeed, catalogProducts, initialViewState]);

  useEffect(() => {
    if (isHydratingCatalog || catalogProducts.length === 0) return;
    saveCatalogViewState({
      signature: catalogSignature,
      selectedCategory,
      priceRange,
      visibleDesktopCount,
      shuffledFeaturedIds: [],
      shuffledAllIds: shuffledAllProducts.map((p) => p.id),
      savedAt: Date.now(),
    });
  }, [
    isHydratingCatalog,
    catalogProducts.length,
    catalogSignature,
    selectedCategory,
    priceRange,
    visibleDesktopCount,
    shuffledAllProducts,
  ]);

  const isPriceFiltered =
    priceRange[0] > CATALOG_MIN_PRICE || priceRange[1] < CATALOG_MAX_PRICE;
  const activePriceLabel = getActivePriceLabel(priceRange[0], priceRange[1]);

  const categoryBaseCatalogue =
    selectedCategory === 'All'
      ? shuffledAllProducts
      : catalogProducts.filter((p) => p.category === selectedCategory);

  const filteredCatalogue = categoryBaseCatalogue.filter(
    (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
  );

  const displayedFeatured = filteredCatalogue.slice(0, visibleDesktopCount);
  const remainingFeatured = Math.max(
    0,
    filteredCatalogue.length - displayedFeatured.length,
  );

  const saleProducts = catalogProducts.filter((p) => p.sectionGroup === 'sale');
  const vaultProducts = catalogProducts.filter((p) => p.sectionGroup === 'vault');

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-[#1a1a1a] flex flex-col overflow-x-clip">
      {/* 1. Header Section */}
      <Header
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onNavigate={(sectionId) => handleNavigate(sectionId)}
      />

      <main className="flex-1">
        {selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            onBack={handleBackToCatalogue}
            onSelectProduct={handleOpenProduct}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onVerifiedPincode={setVerifiedPincode}
          />
        )}

        {!selectedProduct && activeLegalPage && (
          <LegalPage
            pageId={activeLegalPage}
            onSelectPage={handleOpenLegalPage}
            onBack={() => handleBackToCatalogue()}
          />
        )}

        <div
          className={selectedProduct || activeLegalPage ? 'hidden' : ''}
          aria-hidden={Boolean(selectedProduct || activeLegalPage)}
        >
          {/* 2. Slideshow Section */}
          <HeroSlideshow onSelectSlideAction={handleNavigate} />

        {/* 3. Collection List / Image Link Blocks Section (Horizontal scroll on mobile, 4-col grid on desktop) */}
        <section
          id="collection-list"
          className="shopify-section shopify-section--image-link-blocks bg-[#f0f0f0] py-10 md:py-16"
        >
          <div className="container-site">
            <div className="mb-5 md:mb-7 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-[30px] sm:text-[36px] md:text-[42px] font-bold leading-[1.1] tracking-[-0.02em] text-[#1a1a1a] m-0">
                  Collection list
                </h2>
                <button
                  type="button"
                  onClick={() => handleNavigate('#featured-collection', 'All')}
                  className="mt-2.5 inline-flex items-center gap-2 text-[14px] font-medium text-[#1a1a1a] hover:text-[#f83a3a] transition-colors cursor-pointer group"
                >
                  <span>View all</span>
                  <span className="w-6 h-6 rounded-full bg-[#1a1a1a]/[0.07] group-hover:bg-[#1a1a1a] group-hover:text-white inline-flex items-center justify-center transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>

              <div className="flex xl:hidden items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => scrollTrack(collectionScrollRef, 'prev')}
                  aria-label="Scroll collections left"
                  className="button-style-1 w-9 h-9 bg-white inline-flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollTrack(collectionScrollRef, 'next')}
                  aria-label="Scroll collections right"
                  className="button-style-1 w-9 h-9 bg-white inline-flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={collectionScrollRef}
              onMouseDown={(e) => {
                const el = collectionScrollRef.current;
                if (!el) return;
                collectionDragState.current = {
                  isDown: true,
                  startX: e.pageX - el.offsetLeft,
                  scrollLeft: el.scrollLeft,
                  didDrag: false,
                };
              }}
              onMouseMove={(e) => {
                const el = collectionScrollRef.current;
                const drag = collectionDragState.current;
                if (!el || !drag.isDown) return;
                const x = e.pageX - el.offsetLeft;
                const walk = x - drag.startX;
                if (Math.abs(walk) > 6) {
                  drag.didDrag = true;
                  e.preventDefault();
                  el.scrollLeft = drag.scrollLeft - walk;
                }
              }}
              onMouseUp={() => {
                collectionDragState.current.isDown = false;
              }}
              onMouseLeave={() => {
                collectionDragState.current.isDown = false;
              }}
              className="flex flex-nowrap overflow-x-auto snap-x snap-proximity gap-3.5 sm:gap-4 pb-3 -mx-5 px-5 sm:mx-0 sm:px-0 xl:grid xl:grid-cols-5 xl:overflow-visible xl:pb-0 no-scrollbar cursor-grab active:cursor-grabbing xl:cursor-default select-none touch-pan-x"
            >
              {IMAGE_LINK_BLOCKS.map((block) => (
                <button
                  key={block.id}
                  type="button"
                  onClick={() => {
                    if (collectionDragState.current.didDrag) {
                      collectionDragState.current.didDrag = false;
                      return;
                    }
                    handleNavigate('#featured-collection', block.categoryFilter);
                  }}
                  className="group relative aspect-[4/5] w-[68vw] max-w-[260px] sm:w-[260px] md:w-[275px] xl:w-auto xl:max-w-none shrink-0 snap-start rounded-[8px] overflow-hidden bg-[#1a1a1a] shadow-[0_5px_15px_0_#1A1A1A1A] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a1a1a]"
                >
                  <CollectibleImage
                    src={block.imageUrl}
                    fallbackSrc={block.fallbackUrl}
                    alt={block.title}
                    loading="eager"
                    className="w-full h-full object-cover pointer-events-none transition-transform duration-300 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-200" />
                  <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                    <span className="text-[22px] sm:text-[24px] font-extrabold tracking-[-0.02em] leading-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
                      {block.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Scrolling Text Section */}
        <section
          className="shopify-section shopify-section--scrolling-text bg-[#f0f0f0] py-6 border-y border-[#1a1a1a]/10 overflow-hidden"
          aria-label="Store highlights"
        >
          <div className="animate-marquee items-center">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex items-center shrink-0"
              >
                <span className="text-[32px] md:text-[48px] font-extrabold tracking-[-0.02em] text-[#1a1a1a] whitespace-nowrap px-6">
                  {item}
                </span>
                <span
                  aria-hidden="true"
                  className="inline-block w-3 h-3 rounded-full bg-[#feb913] shadow-[0_0_8px_2px_#FEB91380]"
                />
              </div>
            ))}
          </div>
        </section>

        {/* 6. Featured Collection Section (Full Instagram Catalogue · Horizontal Scroll on Mobile) */}
        <section
          id="featured-collection"
          className="shopify-section shopify-section--featured-collection bg-[#f0f0f0] py-12 md:py-18"
        >
          <div className="container-site">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-6 md:mb-8">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#1a1a1ab3] mb-2 inline-flex items-center gap-2">
                  {isHydratingCatalog ? (
                    <>
                      <Loader2
                        className="w-3.5 h-3.5 text-[#f83a3a] animate-spin"
                        aria-hidden="true"
                      />
                      <span>Instagram Catalogue · Loading collectibles...</span>
                    </>
                  ) : (
                    <span>
                      Instagram Catalogue · {filteredCatalogue.length} Collectibles
                    </span>
                  )}
                </p>
                <h2 className="text-[36px] md:text-[48px] font-bold leading-[1.08] tracking-[-0.02em] text-[#1a1a1a] m-0">
                  Featured collection
                </h2>
              </div>

              {/* Category & Price Filter Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div ref={categoryMenuRef} className="relative">
                    <button
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={categoryMenuOpen}
                      aria-label="Filter featured collectibles by category"
                      onClick={() => {
                        setPriceMenuOpen(false);
                        setCategoryMenuOpen((prev) => !prev);
                      }}
                      className="h-10 px-4 rounded-full bg-white text-[#1a1a1a] border border-[#1a1a1a]/15 hover:border-[#1a1a1a] text-[13px] sm:text-[14px] font-bold inline-flex items-center gap-2 shadow-[0_2px_10px_0_#1A1A1A0D] transition-all duration-150 cursor-pointer whitespace-nowrap"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-[#f83a3a]" />
                      <span>Category: {selectedCategory}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#1a1a1ab3] transition-transform duration-200 ${
                          categoryMenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {categoryMenuOpen && (
                      <div
                        role="listbox"
                        aria-label="Select category"
                        className="absolute left-0 lg:left-auto lg:right-0 mt-2 w-64 rounded-[12px] bg-white border border-[#1a1a1a]/10 shadow-[0_12px_32px_0_#1A1A1A22] p-1.5 z-30"
                      >
                        {FILTER_CATEGORIES.map((category) => {
                          const isActive = selectedCategory === category;
                          const baseList =
                            category === 'All'
                              ? catalogProducts
                              : catalogProducts.filter(
                                  (p) => p.category === category,
                                );
                          const count = baseList.filter(
                            (p) =>
                              p.price >= priceRange[0] &&
                              p.price <= priceRange[1],
                          ).length;
                          return (
                            <button
                              key={category}
                              type="button"
                              role="option"
                              aria-selected={isActive}
                              onClick={() => handleSelectCategory(category)}
                              className={`w-full px-3 py-2 rounded-[8px] text-[14px] flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                                isActive
                                  ? 'bg-[#1a1a1a] text-white font-bold'
                                  : 'text-[#1a1a1a] font-medium hover:bg-[#f0f0f0]'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <Check
                                  className={`w-3.5 h-3.5 ${
                                    isActive
                                      ? 'opacity-100 text-[#feb913]'
                                      : 'opacity-0'
                                  }`}
                                />
                                <span>{category}</span>
                              </span>
                              <span
                                className={`text-[12px] tabular-nums ${
                                  isActive ? 'text-white/75' : 'text-[#1a1a1ab3]'
                                }`}
                              >
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Price Range & Presets Dropdown */}
                  <div ref={priceMenuRef} className="relative">
                    <button
                      type="button"
                      aria-expanded={priceMenuOpen}
                      aria-label="Filter collectibles by price range"
                      onClick={() => {
                        setCategoryMenuOpen(false);
                        setPriceMenuOpen((prev) => !prev);
                      }}
                      className={`h-10 px-4 rounded-full border text-[13px] sm:text-[14px] font-bold inline-flex items-center gap-2 shadow-[0_2px_10px_0_#1A1A1A0D] transition-all duration-150 cursor-pointer whitespace-nowrap ${
                        isPriceFiltered
                          ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                          : 'bg-white text-[#1a1a1a] border-[#1a1a1a]/15 hover:border-[#1a1a1a]'
                      }`}
                    >
                      <IndianRupee
                        className={`w-3.5 h-3.5 ${
                          isPriceFiltered ? 'text-[#feb913]' : 'text-[#f83a3a]'
                        }`}
                      />
                      <span>Price: {activePriceLabel}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isPriceFiltered ? 'text-white/80' : 'text-[#1a1a1ab3]'
                        } ${priceMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {priceMenuOpen && (
                      <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-[300px] sm:w-[340px] rounded-[12px] bg-white border border-[#1a1a1a]/10 shadow-[0_12px_32px_0_#1A1A1A22] p-4 z-30">
                        <PriceRangeFilter
                          minPrice={priceRange[0]}
                          maxPrice={priceRange[1]}
                          onChange={handlePriceRangeChange}
                          productsForCounts={categoryBaseCatalogue}
                        />
                      </div>
                    )}
                  </div>

                  {(selectedCategory !== 'All' || isPriceFiltered) && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="h-10 px-3.5 rounded-full bg-white/80 hover:bg-white text-[#f83a3a] border border-[#f83a3a]/25 text-[12.5px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                {/* Mobile Carousel Controls */}
                <div className="flex md:hidden items-center gap-1.5 shrink-0 ml-auto">
                  <button
                    type="button"
                    onClick={() => scrollTrack(featuredScrollRef, 'prev')}
                    aria-label="Scroll featured left"
                    className="button-style-1 w-9 h-9 bg-white inline-flex items-center justify-center"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollTrack(featuredScrollRef, 'next')}
                    aria-label="Scroll featured right"
                    className="button-style-1 w-9 h-9 bg-white inline-flex items-center justify-center"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {isHydratingCatalog ? (
              <div
                ref={featuredScrollRef}
                role="status"
                aria-live="polite"
                aria-label="Loading featured collectibles"
                className="mobile-h-scroll no-scrollbar md:grid-cols-3 lg:grid-cols-5"
              >
                {Array.from({ length: 10 }, (_, idx) => (
                  <ProductCardSkeleton key={`featured-skeleton-${idx}`} />
                ))}
              </div>
            ) : displayedFeatured.length === 0 ? (
              <div className="bg-white rounded-[12px] p-8 sm:p-12 text-center border border-[#1a1a1a]/[0.07] shadow-[0_5px_15px_0_#1A1A1A0D]">
                <p className="text-[18px] font-bold text-[#1a1a1a] mb-2">
                  No collectibles matched this price &amp; category filter
                </p>
                <p className="text-[14px] text-[#1a1a1ab3] mb-5">
                  Try widening your INR price range or switching back to all categories.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="button-primary"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div
                ref={featuredScrollRef}
                className="mobile-h-scroll no-scrollbar md:grid-cols-3 lg:grid-cols-5"
              >
                {displayedFeatured.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={handleOpenProduct}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}

            {!isHydratingCatalog && remainingFeatured > 0 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleDesktopCount((prev) => prev + 15)
                  }
                  className="button-primary"
                >
                  Load More Catalogue ({remainingFeatured} more)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setVisibleDesktopCount(filteredCatalogue.length)
                  }
                  className="h-[50px] px-7 rounded-full border border-[#1a1a1a]/20 bg-white text-[#1a1a1a] text-[15px] font-bold hover:border-[#1a1a1a] transition-colors cursor-pointer"
                >
                  Show All {filteredCatalogue.length}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 7. On Sale Section (Horizontal Scroll on Mobile) */}
        <section
          id="on-sale"
          className="shopify-section shopify-section--featured-collection bg-[#f0f0f0] py-12 md:py-18"
        >
          <div className="container-site">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 md:mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="badge-pill">Limited Markdowns</span>
                </div>
                <h2 className="text-[36px] md:text-[48px] font-bold leading-[1.08] tracking-[-0.02em] text-[#1a1a1a] m-0">
                  On Sale
                </h2>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="flex md:hidden items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => scrollTrack(saleScrollRef, 'prev')}
                    aria-label="Scroll sale items left"
                    className="button-style-1 w-9 h-9 bg-white inline-flex items-center justify-center"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollTrack(saleScrollRef, 'next')}
                    aria-label="Scroll sale items right"
                    className="button-style-1 w-9 h-9 bg-white inline-flex items-center justify-center"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="button-style-2 inline-flex items-center gap-2 !text-[18px] md:!text-[20px]"
                >
                  <span>Search all deals</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              ref={saleScrollRef}
              className="mobile-h-scroll no-scrollbar md:grid-cols-3 lg:grid-cols-5"
            >
              {isHydratingCatalog
                ? Array.from({ length: 5 }, (_, idx) => (
                    <ProductCardSkeleton key={`sale-skeleton-${idx}`} />
                  ))
                : saleProducts.slice(0, 5).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={handleOpenProduct}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
            </div>
          </div>
        </section>

        {/* 8. Impact Text Section ("KAGE FIGURES") */}
        <section
          id="impact-text"
          className="shopify-section shopify-section--impact-text w-full bg-gradient-to-br from-white via-[#f7f7f7] to-[#eaeaea] border-y border-[#1a1a1a]/10 py-8 md:py-11"
        >
          <div className="container-site">
            <div className="text-center max-w-[720px] mx-auto mb-5 md:mb-6">
              <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.1em] text-[#f83a3a] block mb-1">
                Kage Figures · Indore, India
              </span>
              <h2 className="text-[28px] sm:text-[40px] md:text-[52px] font-black tracking-[-0.03em] leading-[1] text-[#1a1a1a] select-none mb-1.5 md:mb-2">
                KAGE FIGURES
              </h2>
              <p className="text-[12.5px] sm:text-[14px] md:text-[15px] leading-[1.45] font-medium text-[#1a1a1ab3] max-w-[600px] mx-auto m-0">
                Small details, bigger happiness — anime keychains, action figures,
                die-cast cars, katanas, and backlit manga frames delivered across India.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 md:gap-4">
              <div className="bg-white/80 rounded-[8px] px-3.5 py-2.5 md:px-4 md:py-3 border border-[#1a1a1a]/[0.07] flex items-center gap-2.5">
                <Shield className="w-4 h-4 md:w-5 md:h-5 text-[#1a1a1a] shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-[13px] md:text-[15px] font-bold text-[#1a1a1a] leading-tight m-0 truncate">
                    Quality-Checked Drops
                  </h3>
                  <p className="text-[11px] md:text-[12px] leading-snug text-[#1a1a1ab3] m-0 truncate">
                    Figures, keychains, cars, katana &amp; frames
                  </p>
                </div>
              </div>

              <div className="bg-white/80 rounded-[8px] px-3.5 py-2.5 md:px-4 md:py-3 border border-[#1a1a1a]/[0.07] flex items-center gap-2.5">
                <Truck className="w-4 h-4 md:w-5 md:h-5 text-[#1a1a1a] shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-[13px] md:text-[15px] font-bold text-[#1a1a1a] leading-tight m-0 truncate">
                    Safe Pan-India Transit
                  </h3>
                  <p className="text-[11px] md:text-[12px] leading-snug text-[#1a1a1ab3] m-0 truncate">
                    Double-walled foam &amp; bubble protection
                  </p>
                </div>
              </div>

              <div className="bg-white/80 rounded-[8px] px-3.5 py-2.5 md:px-4 md:py-3 border border-[#1a1a1a]/[0.07] flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[#1a1a1a] shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-[13px] md:text-[15px] font-bold text-[#1a1a1a] leading-tight m-0 truncate">
                    Collector-Friendly Pricing
                  </h3>
                  <p className="text-[11px] md:text-[12px] leading-snug text-[#1a1a1ab3] m-0 truncate">
                    Verified pieces starting at just ₹109
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Final Featured Collection Section (Collector's Vault & Pre-Orders · Horizontal Scroll on Mobile) */}
        <section
          id="vault-collection"
          className="shopify-section shopify-section--featured-collection bg-[#f0f0f0] py-12 md:py-20"
        >
          <div className="container-site">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 md:mb-8">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#1a1a1ab3] mb-2">
                  Upcoming Allocations
                </p>
                <h2 className="text-[36px] md:text-[48px] font-bold leading-[1.08] tracking-[-0.02em] text-[#1a1a1a] m-0">
                  Collector&apos;s Vault
                </h2>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="flex md:hidden items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => scrollTrack(vaultScrollRef, 'prev')}
                    aria-label="Scroll vault items left"
                    className="button-style-1 w-9 h-9 bg-white inline-flex items-center justify-center"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollTrack(vaultScrollRef, 'next')}
                    aria-label="Scroll vault items right"
                    className="button-style-1 w-9 h-9 bg-white inline-flex items-center justify-center"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className="button-primary"
                >
                  Open Collector Bag ({cartCount})
                </button>
              </div>
            </div>

            <div
              ref={vaultScrollRef}
              className="mobile-h-scroll no-scrollbar md:grid-cols-3 lg:grid-cols-5"
            >
              {isHydratingCatalog
                ? Array.from({ length: 5 }, (_, idx) => (
                    <ProductCardSkeleton key={`vault-skeleton-${idx}`} />
                  ))
                : vaultProducts.slice(0, 5).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={handleOpenProduct}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
            </div>
          </div>
        </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#1a1a1a]/10 py-14">
        <div className="container-site">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-[#1a1a1a]/10">
            {/* Newsletter & Brand Support Details */}
            <div className="md:col-span-5 space-y-6">
              <div>
                <h3 className="text-[28px] md:text-[32px] font-bold text-[#1a1a1a] leading-tight mb-3">
                  Join the Collector Dispatch
                </h3>
                <p className="text-[15px] text-[#1a1a1ab3] mb-5 max-w-[420px]">
                  Early access to numbered pre-order slots, Instagram restocks,
                  and vault markdowns.
                </p>

                {newsletterSubscribed ? (
                  <div className="inline-flex items-center gap-2 px-5 py-3 rounded-[8px] bg-[#f0f0f0] text-[#1a1a1a] font-bold text-[14px]">
                    <Check className="w-4 h-4 text-[#f83a3a]" />
                    <span>Subscribed to Kage Figures Vault alerts.</span>
                  </div>
                ) : (
                  <form
                    onSubmit={handleNewsletterSubmit}
                    className="flex flex-col sm:flex-row gap-3 max-w-[460px]"
                  >
                    <div className="relative flex-1">
                      <label
                        htmlFor="newsletter-email"
                        className="absolute left-5 top-2 text-[9px] font-bold uppercase tracking-[0.06em] text-[#1a1a1ab3]"
                      >
                        Email Address
                      </label>
                      <input
                        id="newsletter-email"
                        type="email"
                        required
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="collector@domain.com"
                        className="input"
                      />
                    </div>
                    <button type="submit" className="button-primary shrink-0">
                      Subscribe
                    </button>
                  </form>
                )}
              </div>

              {/* Store Contact & Hub Info */}
              <div className="pt-2 space-y-2 text-[13.5px] text-[#1a1a1ab3]">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#f83a3a] shrink-0" />
                  <a
                    href="mailto:support@kagefigures.in"
                    className="font-semibold text-[#1a1a1a] hover:text-[#f83a3a] transition-colors"
                  >
                    support@kagefigures.in
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#f83a3a] shrink-0" />
                  <span>Kage Figures Fulfilment Hub · Indore, Madhya Pradesh, India</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#f83a3a] shrink-0" />
                  <span>Customer Care: Mon – Sat · 10:00 AM – 7:00 PM IST · @kagefigures</span>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h4 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#1a1a1ab3] mb-4">
                  Collections
                </h4>
                <ul className="space-y-2.5 text-[15px] font-medium">
                  <li>
                    <button
                      type="button"
                      onClick={() =>
                        handleNavigate('#featured-collection', 'Anime Keychains')
                      }
                      className="hover:text-[#f83a3a] cursor-pointer text-left"
                    >
                      Anime Keychains
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() =>
                        handleNavigate('#featured-collection', 'Anime Action Figures')
                      }
                      className="hover:text-[#f83a3a] cursor-pointer text-left"
                    >
                      Anime Action Figures
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() =>
                        handleNavigate('#featured-collection', 'Cars Figures')
                      }
                      className="hover:text-[#f83a3a] cursor-pointer text-left"
                    >
                      Cars Figures
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() =>
                        handleNavigate('#featured-collection', 'Katana')
                      }
                      className="hover:text-[#f83a3a] cursor-pointer text-left"
                    >
                      Katana
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() =>
                        handleNavigate('#featured-collection', 'Manga Frame')
                      }
                      className="hover:text-[#f83a3a] cursor-pointer text-left"
                    >
                      Manga Frame
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#1a1a1ab3] mb-4">
                  Storefront
                </h4>
                <ul className="space-y-2.5 text-[15px] font-medium">
                  <li>
                    <a
                      href="#featured-collection"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigate('#featured-collection');
                      }}
                      className="hover:text-[#f83a3a]"
                    >
                      Instagram Catalogue
                    </a>
                  </li>
                  <li>
                    <a
                      href="#on-sale"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigate('#on-sale');
                      }}
                      className="hover:text-[#f83a3a]"
                    >
                      On Sale
                    </a>
                  </li>
                  <li>
                    <a
                      href="#vault-collection"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigate('#vault-collection');
                      }}
                      className="hover:text-[#f83a3a]"
                    >
                      Pre-Order Vault
                    </a>
                  </li>
                  <li>
                    <a
                      href="#impact-text"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigate('#impact-text');
                      }}
                      className="hover:text-[#f83a3a]"
                    >
                      Authenticity Promise
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#1a1a1ab3] mb-4">
                  Policies &amp; Support
                </h4>
                <ul className="space-y-2.5 text-[15px] font-medium">
                  <li>
                    <a
                      href="#privacy-policy"
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenLegalPage('privacy');
                      }}
                      className="hover:text-[#f83a3a]"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#terms-and-conditions"
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenLegalPage('terms');
                      }}
                      className="hover:text-[#f83a3a]"
                    >
                      Terms &amp; Conditions
                    </a>
                  </li>
                  <li>
                    <a
                      href="#shipping-policy"
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenLegalPage('shipping');
                      }}
                      className="hover:text-[#f83a3a]"
                    >
                      Shipping Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#refund-policy"
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenLegalPage('refund');
                      }}
                      className="hover:text-[#f83a3a]"
                    >
                      Returns &amp; Refunds
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Accepted Payments & Security Strip */}
          <div className="py-5 border-b border-[#1a1a1a]/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[12.5px] font-semibold text-[#1a1a1ab3]">
              <Lock className="w-3.5 h-3.5 text-[#15803d]" />
              <span>100% Secure Checkout · All prices inclusive of GST</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.04em] text-[#1a1a1a]">
              {['UPI', 'Visa', 'Mastercard', 'RuPay', 'NetBanking', 'COD'].map(
                (method) => (
                  <span
                    key={method}
                    className="px-2.5 py-1 rounded-[5px] bg-[#f0f0f0] border border-[#1a1a1a]/10"
                  >
                    {method}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* Bottom Legal & Copyright Row */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#1a1a1ab3]">
            <span>
              © {new Date().getFullYear()} Kage Figures. Anime Keychains,
              Action Figures, Cars, Katana &amp; Manga Frames.
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-medium">
              <a
                href="#privacy-policy"
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenLegalPage('privacy');
                }}
                className="hover:text-[#f83a3a]"
              >
                Privacy Policy
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="#terms-and-conditions"
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenLegalPage('terms');
                }}
                className="hover:text-[#f83a3a]"
              >
                Terms &amp; Conditions
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="#shipping-policy"
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenLegalPage('shipping');
                }}
                className="hover:text-[#f83a3a]"
              >
                Shipping
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="#refund-policy"
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenLegalPage('refund');
                }}
                className="hover:text-[#f83a3a]"
              >
                Returns
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Toast Feedback */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-40 animate-smile-fade bg-[#1a1a1a] text-white px-5 py-3.5 rounded-full shadow-xl flex items-center gap-3"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#feb913]" />
          <span className="text-[14px] font-bold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="text-[13px] font-bold text-[#feb913] underline ml-1 cursor-pointer"
          >
            View Bag
          </button>
        </div>
      )}

      {/* Drawers & Modals */}
      <CartDrawer
        isOpen={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
        verifiedPincode={verifiedPincode}
        onVerifiedPincode={setVerifiedPincode}
      />

      <SearchModal
        isOpen={searchOpen}
        products={catalogProducts.length > 0 ? catalogProducts : PRODUCTS}
        onClose={() => setSearchOpen(false)}
        onSelectProduct={handleOpenProduct}
      />
    </div>
  );
}
