import { Eye, Instagram, Layers, Minus, Plus, Ruler, Tag } from 'lucide-react';
import { Product, PRODUCTS, formatINR } from '../data/catalog';
import { CollectibleImage } from './CollectibleImage';
import { SwipeableImageGallery } from './SwipeableImageGallery';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, variantId?: string) => void;
  cartQuantity?: number;
  onUpdateQuantity?: (
    product: Product,
    variantId: string | undefined,
    delta: number,
  ) => void;
  layout?: 'carousel' | 'grid';
}

export function ProductCard({
  product,
  onQuickView,
  onAddToCart,
  cartQuantity = 0,
  onUpdateQuantity,
  layout = 'carousel',
}: ProductCardProps) {
  const isSoldOut = product.status === 'Sold Out';
  const discountPct =
    !isSoldOut &&
    product.compareAtPrice &&
    product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100,
        )
      : null;

  const sizeClasses =
    layout === 'grid'
      ? 'w-full min-w-0 max-w-none'
      : 'w-[60vw] min-w-[185px] max-w-[225px] sm:w-[230px] md:w-auto md:min-w-0 md:max-w-none shrink-0 snap-start';

  const canonicalProduct = PRODUCTS.find((p) => p.id === product.id);
  const displayImages =
    product.images && product.images.length > 1
      ? product.images
      : canonicalProduct?.images && canonicalProduct.images.length > 0
        ? canonicalProduct.images
        : [product.imageUrl];

  return (
    <article
      className={`card !p-0 overflow-hidden flex flex-col justify-between bg-white border border-[#1a1a1a]/[0.06] group ${sizeClasses}`}
    >
      {/* Product Image Area with Swipeable Gallery */}
      <div className="relative aspect-square w-full bg-[#f0f0f0] overflow-hidden">
        <SwipeableImageGallery
          images={displayImages}
          fallbackSrc={product.fallbackUrl}
          alt={`${product.title} (${product.code})`}
          onClick={() => onQuickView(canonicalProduct || product)}
        />
        {isSoldOut && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-black/15 z-10"
          />
        )}

        {/* Single Top Tag when applicable */}
        {isSoldOut ? (
          <span className="px-2.5 py-1 rounded-full bg-[#1a1a1a]/92 text-white border border-white/15 text-[11px] font-extrabold uppercase tracking-[0.06em] shadow-md absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f83a3a]" />
            <span>Sold Out</span>
          </span>
        ) : product.status === 'On Sale' && discountPct ? (
          <span className="badge-pill !px-2.5 !py-1 !text-[11px] absolute top-2.5 left-2.5 z-10">
            Save {discountPct}%
          </span>
        ) : product.status === 'Pre-Order' || product.status === 'Limited' ? (
          <span className="badge-pill !px-2.5 !py-1 !text-[11px] absolute top-2.5 left-2.5 z-10">
            {product.status}
          </span>
        ) : null}

        {/* Top-Right View Details Indicator on Hover (Desktop) */}
        <button
          type="button"
          onClick={() => onQuickView(product)}
          aria-label={`View ${product.title} details`}
          className="absolute top-2.5 right-2.5 z-10 h-7 px-2.5 rounded-full glass-surface text-[#1a1a1a] text-[11px] font-bold hidden md:inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 cursor-pointer hover:bg-white"
        >
          <Eye className="w-3 h-3" />
          <span>Details</span>
        </button>

        {/* Mobile Quick View Pill */}
        <button
          type="button"
          onClick={() => onQuickView(product)}
          aria-label={`View ${product.title} details`}
          className="absolute bottom-2.5 right-2.5 z-10 h-7 px-2.5 rounded-full glass-surface text-[#1a1a1a] text-[11px] font-bold inline-flex md:hidden items-center gap-1 opacity-95 cursor-pointer"
        >
          <Eye className="w-3 h-3" />
          <span>View</span>
        </button>

        {/* Instagram Post Link Badge */}
        {product.instagramUrl && (
          <a
            href={product.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={`View Drop #${String(product.instagramPostIndex).padStart(3, '0')} on Instagram`}
            aria-label={`View Drop #${String(product.instagramPostIndex).padStart(3, '0')} on Instagram`}
            className="absolute bottom-2.5 left-2.5 z-10 h-6 px-2 rounded-full bg-black/75 hover:bg-black/95 text-white backdrop-blur-md text-[10.5px] font-extrabold inline-flex items-center gap-1 transition-all hover:scale-105 border border-white/20 shadow-sm"
          >
            <Instagram className="w-3 h-3 text-[#feb913]" />
            <span className="tracking-[0.04em]">#{String(product.instagramPostIndex).padStart(3, '0')}</span>
          </a>
        )}

        {/* Desktop Key-Specs Hover Preview Overlay */}
        <div
          aria-hidden="true"
          className="hidden md:flex flex-col justify-end pointer-events-none absolute inset-x-0 bottom-0 pt-10 pb-3 px-3 bg-gradient-to-t from-black/92 via-black/78 to-transparent text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-200 ease-out"
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#feb913] truncate">
              {product.studio}
            </span>
            <span className="text-[10px] font-semibold text-white/75 shrink-0">
              {product.code}
            </span>
          </div>

          <div className="space-y-1 text-[11.5px] leading-tight">
            <div className="flex items-center gap-1.5 text-white/95">
              <Layers className="w-3 h-3 text-[#feb913] shrink-0" />
              <span className="font-semibold truncate">{product.scale}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/85">
              <Ruler className="w-3 h-3 text-white/70 shrink-0" />
              <span className="truncate">{product.dimensions}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/80">
              <Tag className="w-3 h-3 text-white/65 shrink-0" />
              <span className="truncate">{product.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div
        className={`${
          layout === 'grid' ? 'p-2.5 sm:p-4' : 'p-3.5 sm:p-4'
        } flex flex-col flex-1 justify-between gap-2.5 bg-white`}
      >
        <div>
          <button
            type="button"
            onClick={() => onQuickView(product)}
            className="text-left cursor-pointer hover:text-[#f83a3a] transition-colors"
          >
            <h3
              className={`text-[13.5px] sm:text-[15px] leading-[1.3] font-bold m-0 line-clamp-2 ${
                isSoldOut ? 'text-[#1a1a1a]/75' : 'text-[#1a1a1a]'
              }`}
            >
              {product.title}
            </h3>
          </button>
        </div>

        <div className="flex items-center justify-between gap-1.5 sm:gap-2 pt-2.5 border-t border-[#1a1a1a]/[0.08]">
          <div className="flex items-baseline gap-1 sm:gap-1.5 tabular-nums min-w-0">
            <span
              className={`text-[14px] sm:text-[16px] font-bold truncate ${
                isSoldOut
                  ? 'text-[#1a1a1a]/50'
                  : product.compareAtPrice
                    ? 'text-[#f83a3a]'
                    : 'text-[#1a1a1a]'
              }`}
            >
              {formatINR(product.price)}
            </span>
            {!isSoldOut && product.compareAtPrice && (
              <span className="text-[10.5px] sm:text-[12px] font-medium text-[#1a1a1ab3] line-through shrink-0">
                {formatINR(product.compareAtPrice)}
              </span>
            )}
          </div>

          {isSoldOut ? (
            <button
              type="button"
              disabled
              aria-label={`${product.title} is sold out`}
              className={`${
                layout === 'grid'
                  ? 'h-7 sm:h-8 px-2.5 sm:px-3 text-[11px] sm:text-[11.5px]'
                  : 'h-8 px-3 text-[11.5px]'
              } rounded-full bg-[#1a1a1a]/[0.08] text-[#1a1a1a]/55 font-bold inline-flex items-center justify-center cursor-not-allowed whitespace-nowrap shrink-0`}
            >
              Sold Out
            </button>
          ) : cartQuantity > 0 ? (
            <div
              role="group"
              aria-label={`Quantity in bag for ${product.title}`}
              className={`${
                layout === 'grid'
                  ? 'h-7 sm:h-8 px-1 text-[11.5px] sm:text-[12px]'
                  : 'h-8 px-1 text-[12px]'
              } rounded-full bg-[#1a1a1a] text-white font-bold inline-flex items-center gap-0.5 sm:gap-1 shadow-[0_2px_8px_0_#1A1A1A26] shrink-0`}
            >
              <button
                type="button"
                aria-label={`Decrease quantity of ${product.title}`}
                onClick={() => {
                  if (onUpdateQuantity) {
                    onUpdateQuantity(product, product.variants[0]?.id, -1);
                  }
                }}
                className={`${
                  layout === 'grid' ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-6 h-6'
                } rounded-full hover:bg-white/15 active:scale-95 inline-flex items-center justify-center transition-colors cursor-pointer`}
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="min-w-[16px] text-center tabular-nums text-[#feb913] font-extrabold select-none">
                {cartQuantity}
              </span>
              <button
                type="button"
                aria-label={`Increase quantity of ${product.title}`}
                onClick={() => {
                  if (onUpdateQuantity) {
                    onUpdateQuantity(product, product.variants[0]?.id, 1);
                  } else {
                    onAddToCart(product, product.variants[0]?.id);
                  }
                }}
                className={`${
                  layout === 'grid' ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-6 h-6'
                } rounded-full hover:bg-white/15 active:scale-95 inline-flex items-center justify-center transition-colors cursor-pointer`}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onAddToCart(product, product.variants[0]?.id)}
              className={`${
                layout === 'grid'
                  ? 'h-7 sm:h-8 px-2.5 sm:px-3 text-[11.5px] sm:text-[12px]'
                  : 'h-8 px-3 text-[12px]'
              } rounded-full bg-[#1a1a1a] text-white font-bold inline-flex items-center gap-1 hover:bg-[#000000] active:scale-[0.98] transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
