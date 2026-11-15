import { useEffect, useState, type FormEvent } from 'react';
import {
  CheckCircle2,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import {
  CATALOG_MAX_PRICE,
  CATALOG_MIN_PRICE,
  Product,
  formatINR,
} from '../data/catalog';
import { CollectibleImage } from './CollectibleImage';
import { PriceRangeFilter } from './PriceRangeFilter';

export interface CartItem {
  product: Product;
  variantId: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  onClearCart: () => void;
}

export function CartDrawer({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderConfirmedId, setOrderConfirmedId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPin, setCustomerPin] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setCheckoutOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const freeShippingThreshold = 2999;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingProgress = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100),
  );

  const handleCheckoutSubmit = (e: FormEvent) => {
    e.preventDefault();
    const orderNum = `KF-${Math.floor(10000 + Math.random() * 89999)}`;
    setOrderConfirmedId(orderNum);
    onClearCart();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Collector Bag"
    >
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="relative z-10 w-full max-w-[460px] bg-[#f0f0f0] h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-[#1a1a1a]/10">
          <h3 className="text-[22px] font-bold text-[#1a1a1a] m-0">
            Collector Bag
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bag"
            className="button-style-1 w-9 h-9 inline-flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shipping Meter */}
        <div className="px-6 py-3.5 bg-white/75 border-b border-[#1a1a1a]/10">
          <p className="text-[13px] font-semibold text-[#1a1a1a] mb-2">
            {remainingForFreeShipping === 0
              ? 'Free insured collector shipping unlocked'
              : `Add ${formatINR(remainingForFreeShipping)} more for free insured shipping`}
          </p>
          <div className="w-full h-1.5 rounded-full bg-[#1a1a1a]/10 overflow-hidden">
            <div
              className="h-full bg-[#feb913] transition-all duration-300"
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {orderConfirmedId ? (
            <div className="bg-white rounded-[12px] p-6 shadow-[0_5px_15px_0_#1A1A1A1A] text-center">
              <CheckCircle2 className="w-12 h-12 text-[#1a1a1a] mx-auto mb-3" />
              <span className="badge-pill mb-3">Reservation Confirmed</span>
              <h4 className="text-[22px] font-bold text-[#1a1a1a] mb-2">
                Order #{orderConfirmedId}
              </h4>
              <p className="text-[15px] text-[#1a1a1ab3] mb-6">
                Thank you, {customerName || 'Collector'}. Our vault team will
                share inspection photos and insured dispatch details via SMS at{' '}
                {customerPhone}.
              </p>
              <button
                type="button"
                onClick={() => {
                  setOrderConfirmedId(null);
                  onClose();
                }}
                className="button-primary w-full"
              >
                Continue Browsing
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[18px] font-bold text-[#1a1a1a] mb-2">
                Your collector bag is empty
              </p>
              <p className="text-[14px] text-[#1a1a1ab3] mb-6">
                Explore anime keychains, action figures, die-cast cars, katanas, and manga frames.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="button-primary"
              >
                Explore Catalog
              </button>
            </div>
          ) : checkoutOpen ? (
            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[18px] font-bold text-[#1a1a1a] m-0">
                  Insured Dispatch Details
                </h4>
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(false)}
                  className="text-[13px] font-semibold text-[#f83a3a] cursor-pointer"
                >
                  Back to Bag
                </button>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#1a1a1ab3] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Aarav Mehta"
                  className="input !pt-0"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#1a1a1ab3] mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98201 44120"
                  className="input !pt-0"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#1a1a1ab3] mb-1">
                  Shipping Address
                </label>
                <input
                  type="text"
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="402 Skyview Residency, Bandra West"
                  className="input !pt-0"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#1a1a1ab3] mb-1">
                  PIN Code
                </label>
                <input
                  type="text"
                  required
                  pattern="[0-9]{6}"
                  value={customerPin}
                  onChange={(e) => setCustomerPin(e.target.value)}
                  placeholder="400050"
                  className="input !pt-0"
                />
              </div>

              <div className="bg-white rounded-[8px] p-4 border border-[#1a1a1a]/10 flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#1a1a1ab3]">
                  Total Payable
                </span>
                <span className="text-[20px] font-bold text-[#1a1a1a] tabular-nums">
                  {formatINR(subtotal)}
                </span>
              </div>

              <button type="submit" className="button-primary w-full">
                Confirm Reservation
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const key = `${item.product.id}__${item.variantId}`;
                return (
                  <div
                    key={key}
                    className="bg-white rounded-[8px] p-4 flex gap-4 shadow-[0_5px_15px_0_#1A1A1A1A]"
                  >
                    <div className="w-20 h-20 rounded-[6px] overflow-hidden bg-[#f0f0f0] shrink-0">
                      <CollectibleImage
                        src={item.product.imageUrl}
                        fallbackSrc={item.product.fallbackUrl}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[15px] font-bold text-[#1a1a1a] leading-snug truncate">
                          {item.product.title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(key)}
                          aria-label={`Remove ${item.product.title}`}
                          className="text-[#1a1a1ab3] hover:text-[#f83a3a] cursor-pointer p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[12px] text-[#1a1a1ab3] mt-0.5 mb-3">
                        {item.variantLabel} · {item.product.scale}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center border border-[#1a1a1a]/15 rounded-full bg-[#f0f0f0]">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(key, -1)}
                            aria-label="Decrease quantity"
                            className="w-7 h-7 inline-flex items-center justify-center cursor-pointer hover:text-[#f83a3a]"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-[13px] font-bold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(key, 1)}
                            aria-label="Increase quantity"
                            className="w-7 h-7 inline-flex items-center justify-center cursor-pointer hover:text-[#f83a3a]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[15px] font-bold text-[#1a1a1a] tabular-nums">
                          {formatINR(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && !checkoutOpen && !orderConfirmedId && (
          <div className="px-6 py-5 bg-white border-t border-[#1a1a1a]/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[15px] font-medium text-[#1a1a1ab3]">
                Subtotal
              </span>
              <span className="text-[22px] font-bold text-[#1a1a1a] tabular-nums">
                {formatINR(subtotal)}
              </span>
            </div>
            <p className="text-[12px] text-[#1a1a1ab3] flex items-center gap-1.5 mb-4">
              <ShieldCheck className="w-4 h-4 text-[#1a1a1a]" />
              <span>Quality-checked protective packing · GST invoice included</span>
            </p>
            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              className="button-primary w-full"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, variantId: string, quantity: number) => void;
}

export function ProductModal({
  product,
  onClose,
  onAddToCart,
}: ProductModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setSelectedVariantId(product.variants[0]?.id || 'std');
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ||
    product.variants[0];
  const finalPrice = Math.max(
    1000,
    product.price + (selectedVariant?.priceDelta || 0),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={product.title}
    >
      <div
        className="fixed inset-0 bg-black/55 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-[920px] bg-white rounded-[12px] overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto">
        <div className="relative bg-[#f0f0f0] min-h-[300px] md:min-h-[460px]">
          <CollectibleImage
            src={product.imageUrl}
            fallbackSrc={product.fallbackUrl}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          <span className="badge-pill absolute top-4 left-4">
            {product.status}
          </span>
        </div>

        <div className="p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#1a1a1ab3]">
                {product.studio} · {product.category}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close product modal"
                className="button-style-1 w-9 h-9 inline-flex items-center justify-center shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-[28px] leading-[1.15] font-bold text-[#1a1a1a] mb-3">
              {product.title}
            </h3>

            <div className="flex items-baseline gap-3 mb-4 tabular-nums">
              <span className="text-[26px] font-bold text-[#1a1a1a]">
                {formatINR(finalPrice)}
              </span>
              {product.compareAtPrice && (
                <span className="text-[16px] text-[#1a1a1ab3] line-through">
                  {formatINR(product.compareAtPrice)}
                </span>
              )}
            </div>

            <p className="text-[15px] leading-[1.6] text-[#1a1a1ab3] mb-5">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#1a1a1a]/10 mb-5 text-[13px]">
              <div>
                <span className="text-[#1a1a1ab3] block">Scale & Size</span>
                <span className="font-bold text-[#1a1a1a]">
                  {product.scale} · {product.dimensions}
                </span>
              </div>
              <div>
                <span className="text-[#1a1a1ab3] block">Allocation</span>
                <span className="font-bold text-[#1a1a1a]">
                  {product.editionSize}
                </span>
              </div>
            </div>

            {/* Edition Variant Selector */}
            <div className="mb-4">
              <span className="text-[12px] font-bold uppercase tracking-[0.04em] text-[#1a1a1ab3] block mb-2">
                Select Edition
              </span>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => {
                  const active = variant.id === selectedVariant?.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`px-4 py-2 rounded-full text-[13px] font-bold border transition-all cursor-pointer ${
                        active
                          ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                          : 'bg-[#f0f0f0] text-[#1a1a1a] border-[#1a1a1a]/15 hover:border-[#1a1a1a]'
                      }`}
                    >
                      {variant.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center border border-[#1a1a1a]/15 rounded-full bg-[#f0f0f0] h-12 px-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-8 h-8 inline-flex items-center justify-center cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="w-8 h-8 inline-flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onAddToCart(
                  product,
                  selectedVariant?.id || 'std',
                  quantity,
                );
                onClose();
              }}
              className="button-primary flex-1"
            >
              Add to Bag · {formatINR(finalPrice * quantity)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SearchModalProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

const SEARCH_CATEGORIES = [
  'All',
  'Anime Keychains',
  'Anime Action Figures',
  'Cars Figures',
  'Katana',
  'Manga Frame',
] as const;

export function SearchModal({
  isOpen,
  products,
  onClose,
  onSelectProduct,
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    CATALOG_MIN_PRICE,
    CATALOG_MAX_PRICE,
  ]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();
  const isPriceFiltered =
    priceRange[0] > CATALOG_MIN_PRICE || priceRange[1] < CATALOG_MAX_PRICE;
  const hasActiveFilters =
    Boolean(trimmed) || selectedCategory !== 'All' || isPriceFiltered;

  const categoryScoped =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const filtered = categoryScoped.filter((p) => {
    const matchesText =
      !trimmed ||
      p.title.toLowerCase().includes(trimmed) ||
      p.studio.toLowerCase().includes(trimmed) ||
      p.category.toLowerCase().includes(trimmed) ||
      p.scale.toLowerCase().includes(trimmed);
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    return matchesText && matchesPrice;
  });

  const matches = hasActiveFilters ? filtered : products.slice(0, 6);

  const handleReset = () => {
    setQuery('');
    setSelectedCategory('All');
    setPriceRange([CATALOG_MIN_PRICE, CATALOG_MAX_PRICE]);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-16 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Search collectibles"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-[780px] bg-white rounded-[12px] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-[#1a1a1a]/10">
          <Search className="w-5 h-5 text-[#1a1a1ab3] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keychains, action figures, cars figures, katana, or manga frames..."
            className="w-full text-[15px] sm:text-[16px] font-medium text-[#1a1a1a] outline-none bg-transparent"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="button-style-1 w-9 h-9 inline-flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category & Price Filters */}
        <div className="px-5 sm:px-6 py-3.5 bg-[#f7f7f7] border-b border-[#1a1a1a]/10 space-y-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {SEARCH_CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-[12px] font-bold border whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                      : 'bg-white text-[#1a1a1a] border-[#1a1a1a]/12 hover:border-[#1a1a1a]/45'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <PriceRangeFilter
            compact
            minPrice={priceRange[0]}
            maxPrice={priceRange[1]}
            onChange={(min, max) => setPriceRange([min, max])}
            productsForCounts={categoryScoped}
          />
        </div>

        <div className="p-5 max-h-[52vh] overflow-y-auto">
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#1a1a1ab3] m-0">
              {hasActiveFilters
                ? `${matches.length} Matching Collectibles`
                : 'Popular Collectibles'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[12px] font-bold text-[#f83a3a] hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

          {matches.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[#1a1a1ab3] mb-3">
                No collectibles matched your search and price filters.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="text-[13px] font-bold text-[#1a1a1a] underline cursor-pointer"
              >
                Clear search &amp; price filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matches.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectProduct(item);
                    onClose();
                  }}
                  className="flex items-center gap-3.5 p-2.5 rounded-[8px] bg-[#f0f0f0] hover:bg-[#feb913]/25 transition-colors text-left cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-[6px] overflow-hidden bg-white shrink-0">
                    <CollectibleImage
                      src={item.imageUrl}
                      fallbackSrc={item.fallbackUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold uppercase text-[#1a1a1ab3]">
                      {item.studio} · {item.scale}
                    </div>
                    <div className="text-[14px] font-bold text-[#1a1a1a] truncate">
                      {item.title}
                    </div>
                    <div className="text-[14px] font-bold text-[#f83a3a] tabular-nums">
                      {formatINR(item.price)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
