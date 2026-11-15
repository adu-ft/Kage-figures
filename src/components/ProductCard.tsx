import { Eye, Layers, Plus, Ruler, Tag } from 'lucide-react';
import { Product, formatINR } from '../data/catalog';
import { CollectibleImage } from './CollectibleImage';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, variantId?: string) => void;
}

export function ProductCard({
  product,
  onQuickView,
  onAddToCart,
}: ProductCardProps) {
  const discountPct =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100,
        )
      : null;

  return (
    <article className="card !p-0 overflow-hidden flex flex-col justify-between bg-white border border-[#1a1a1a]/[0.06] group w-[60vw] min-w-[185px] max-w-[225px] sm:w-[230px] md:w-auto md:min-w-0 md:max-w-none shrink-0 snap-start">
      {/* Product Image Area */}
      <div className="relative aspect-square w-full bg-[#f0f0f0] overflow-hidden">
        <button
          type="button"
          onClick={() => onQuickView(product)}
          className="w-full h-full block cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1a1a1a]"
          aria-label={`View details for ${product.title}`}
        >
          <CollectibleImage
            src={product.imageUrl}
            fallbackSrc={product.fallbackUrl}
            alt={`${product.title} (${product.code})`}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.04]"
          />
        </button>

        {/* Single Top Tag when applicable */}
        {product.status === 'On Sale' && discountPct ? (
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
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5 bg-white">
        <div>
          <button
            type="button"
            onClick={() => onQuickView(product)}
            className="text-left cursor-pointer hover:text-[#f83a3a] transition-colors"
          >
            <h3 className="text-[14px] sm:text-[15px] leading-[1.3] font-bold text-[#1a1a1a] m-0 line-clamp-2">
              {product.title}
            </h3>
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-[#1a1a1a]/[0.08]">
          <div className="flex items-baseline gap-1.5 tabular-nums min-w-0">
            <span
              className={`text-[15px] sm:text-[16px] font-bold truncate ${
                product.compareAtPrice ? 'text-[#f83a3a]' : 'text-[#1a1a1a]'
              }`}
            >
              {formatINR(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-[11px] sm:text-[12px] font-medium text-[#1a1a1ab3] line-through shrink-0">
                {formatINR(product.compareAtPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onAddToCart(product, product.variants[0]?.id)}
            className="h-8 px-3 rounded-full bg-[#1a1a1a] text-white text-[12px] font-bold inline-flex items-center gap-1 hover:bg-[#000000] active:scale-[0.98] transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </article>
  );
}
