import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronDown,
  IndianRupee,
  Loader2,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type { Product } from '../data/catalog';
import { PriceRangeFilter } from './PriceRangeFilter';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';

interface CatalogBrowsePageProps {
  products: Product[];
  categoryBaseProducts: Product[];
  filteredProducts: Product[];
  isHydrating: boolean;
  categories: readonly string[];
  selectedCategory: string;
  priceRange: [number, number];
  activePriceLabel: string;
  isPriceFiltered: boolean;
  onSelectCategory: (category: string) => void;
  onPriceRangeChange: (min: number, max: number) => void;
  onResetFilters: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, variantId?: string) => void;
  onBack: () => void;
}

export function CatalogBrowsePage({
  products,
  categoryBaseProducts,
  filteredProducts,
  isHydrating,
  categories,
  selectedCategory,
  priceRange,
  activePriceLabel,
  isPriceFiltered,
  onSelectCategory,
  onPriceRangeChange,
  onResetFilters,
  onSelectProduct,
  onAddToCart,
  onBack,
}: CatalogBrowsePageProps) {
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [priceMenuOpen, setPriceMenuOpen] = useState(false);

  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const priceMenuRef = useRef<HTMLDivElement>(null);

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

  const handleChooseCategory = (category: string) => {
    onSelectCategory(category);
    setCategoryMenuOpen(false);
  };

  return (
    <div className="bg-[#f0f0f0] pt-[68px] sm:pt-[76px] pb-16 min-h-[75vh]">
      {/* Dark top backdrop behind fixed transparent header */}
      <div className="fixed top-0 left-0 right-0 h-[58px] sm:h-[66px] bg-[#141414]/95 backdrop-blur-md z-30 pointer-events-none" />

      <div className="container-site pt-4 sm:pt-6">
        {/* Top Back Navigation */}
        <div className="mb-4 sm:mb-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-[14px] font-bold text-[#1a1a1a] hover:text-[#f83a3a] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Kage Figures Store</span>
          </button>
        </div>

        {/* Heading & Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-5 mb-5 sm:mb-6">
          <div>
            {isHydrating && (
              <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#1a1a1ab3] mb-1.5 inline-flex items-center gap-2">
                <Loader2
                  className="w-3.5 h-3.5 text-[#f83a3a] animate-spin"
                  aria-hidden="true"
                />
                <span>Loading collectibles...</span>
              </p>
            )}
            <h1 className="text-[30px] sm:text-[38px] md:text-[46px] font-bold leading-[1.08] tracking-[-0.02em] text-[#1a1a1a] m-0">
              {selectedCategory === 'All'
                ? 'Browse All Collectibles'
                : selectedCategory}
            </h1>
          </div>

          {/* Category Dropdown, Price Dropdown & Clear */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
            <div ref={categoryMenuRef} className="relative min-w-0">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={categoryMenuOpen}
                aria-label="Filter catalogue by category"
                onClick={() => {
                  setPriceMenuOpen(false);
                  setCategoryMenuOpen((prev) => !prev);
                }}
                className="w-full sm:w-auto h-10 sm:h-[42px] px-3.5 sm:px-4 rounded-full bg-white text-[#1a1a1a] border border-[#1a1a1a]/15 hover:border-[#1a1a1a] text-[13px] sm:text-[14px] font-bold flex items-center justify-between gap-2 shadow-[0_2px_10px_0_#1A1A1A0D] transition-all duration-150 cursor-pointer min-w-0"
              >
                <span className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f83a3a] shrink-0" />
                  <span className="truncate">
                    {selectedCategory === 'All'
                      ? 'All Categories'
                      : selectedCategory}
                  </span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#1a1a1ab3] shrink-0 transition-transform duration-200 ${
                    categoryMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {categoryMenuOpen && (
                <div
                  role="listbox"
                  aria-label="Select category"
                  className="absolute left-0 lg:left-auto lg:right-0 mt-2 w-[min(272px,calc(100vw-2.5rem))] rounded-[12px] bg-white border border-[#1a1a1a]/10 shadow-[0_12px_32px_0_#1A1A1A22] p-1.5 z-30"
                >
                  {categories.map((category) => {
                    const isActive = selectedCategory === category;
                    const baseList =
                      category === 'All'
                        ? products
                        : products.filter((p) => p.category === category);
                    const count = baseList.filter(
                      (p) =>
                        p.price >= priceRange[0] && p.price <= priceRange[1],
                    ).length;
                    return (
                      <button
                        key={category}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => handleChooseCategory(category)}
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

            <div ref={priceMenuRef} className="relative min-w-0">
              <button
                type="button"
                aria-expanded={priceMenuOpen}
                aria-label="Filter catalogue by price range"
                onClick={() => {
                  setCategoryMenuOpen(false);
                  setPriceMenuOpen((prev) => !prev);
                }}
                className={`w-full sm:w-auto h-10 sm:h-[42px] px-3.5 sm:px-4 rounded-full border text-[13px] sm:text-[14px] font-bold flex items-center justify-between gap-2 shadow-[0_2px_10px_0_#1A1A1A0D] transition-all duration-150 cursor-pointer min-w-0 ${
                  isPriceFiltered
                    ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                    : 'bg-white text-[#1a1a1a] border-[#1a1a1a]/15 hover:border-[#1a1a1a]'
                }`}
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  <IndianRupee
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isPriceFiltered ? 'text-[#feb913]' : 'text-[#f83a3a]'
                    }`}
                  />
                  <span className="truncate">
                    {isPriceFiltered ? activePriceLabel : 'All Prices'}
                  </span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                    isPriceFiltered ? 'text-white/80' : 'text-[#1a1a1ab3]'
                  } ${priceMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {priceMenuOpen && (
                <div className="absolute right-0 mt-2 w-[min(340px,calc(100vw-2.5rem))] rounded-[12px] bg-white border border-[#1a1a1a]/10 shadow-[0_12px_32px_0_#1A1A1A22] p-4 z-30">
                  <PriceRangeFilter
                    minPrice={priceRange[0]}
                    maxPrice={priceRange[1]}
                    onChange={onPriceRangeChange}
                    productsForCounts={categoryBaseProducts}
                  />
                </div>
              )}
            </div>

            {(selectedCategory !== 'All' || isPriceFiltered) && (
              <button
                type="button"
                onClick={onResetFilters}
                className="col-span-2 sm:col-span-1 w-full sm:w-auto h-9 sm:h-[42px] px-3.5 rounded-full bg-white/85 hover:bg-white text-[#f83a3a] border border-[#f83a3a]/25 text-[12.5px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Horizontal Category Strip for Fast Tapping on Mobile */}
        <div
          role="tablist"
          aria-label="Quick category filter"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-5 sm:mb-7 -mx-5 px-5 sm:mx-0 sm:px-0"
        >
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            const baseList =
              category === 'All'
                ? products
                : products.filter((p) => p.category === category);
            const count = baseList.filter(
              (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
            ).length;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleChooseCategory(category)}
                className={`h-9 px-3.5 rounded-full text-[13px] font-bold inline-flex items-center gap-1.5 shrink-0 border transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                    : 'bg-white text-[#1a1a1a] border-[#1a1a1a]/12 hover:border-[#1a1a1a]/40'
                }`}
              >
                <span>{category}</span>
                <span
                  className={`text-[11px] tabular-nums ${
                    isActive ? 'text-[#feb913]' : 'text-[#1a1a1ab3]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Vertical Responsive Grid (2-col Mobile, 3-col Tablet, 5-col Desktop) */}
        {isHydrating ? (
          <div
            role="status"
            aria-live="polite"
            aria-label="Loading collectibles catalogue"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5"
          >
            {Array.from({ length: 15 }, (_, idx) => (
              <ProductCardSkeleton key={`browse-skeleton-${idx}`} layout="grid" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-[12px] p-8 sm:p-12 text-center border border-[#1a1a1a]/[0.07] shadow-[0_5px_15px_0_#1A1A1A0D]">
            <p className="text-[18px] font-bold text-[#1a1a1a] mb-2">
              No collectibles matched this price &amp; category filter
            </p>
            <p className="text-[14px] text-[#1a1a1ab3] mb-5">
              Try widening your INR price range or switching back to all
              categories.
            </p>
            <button
              type="button"
              onClick={onResetFilters}
              className="button-primary"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={onSelectProduct}
                onAddToCart={onAddToCart}
                layout="grid"
              />
            ))}
          </div>
        )}

        {/* Bottom Navigation Controls */}
        {!isHydrating && filteredProducts.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="h-[46px] px-6 rounded-full border border-[#1a1a1a]/20 bg-white text-[#1a1a1a] text-[14px] font-bold hover:border-[#1a1a1a] transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <ArrowUp className="w-4 h-4" />
              <span>Back to Top</span>
            </button>
            <button
              type="button"
              onClick={onBack}
              className="button-primary !py-3.5 !px-7 !text-[14px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Storefront</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
