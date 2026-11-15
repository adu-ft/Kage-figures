import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  BadgePercent,
  Check,
  ChevronRight,
  Heart,
  Loader2,
  MapPin,
  Minus,
  PackageCheck,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { PRODUCTS, type CategoryName, type Product, formatINR } from '../data/catalog';
import { CollectibleImage } from './CollectibleImage';
import { ProductCard } from './ProductCard';
import {
  getLastVerifiedPincode,
  lookupIndianPincode,
  saveVerifiedPincode,
  type PincodeDetails,
} from '../utils/indianPincode';

interface ProductDetailPageProps {
  product: Product;
  onBack: (categoryFilter?: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, variantId?: string, quantity?: number) => void;
  onBuyNow: (product: Product, variantId?: string, quantity?: number) => void;
  onVerifiedPincode?: (details: PincodeDetails) => void;
}

const HIGHLIGHTS_BY_CATEGORY: Record<CategoryName, string[]> = {
  'Anime Keychains': [
    'Heavy-duty zinc alloy & vibrant hard-enamel finish that resists scratches',
    'Precision anime-accurate silhouette with reinforced 360° swivel split ring',
    'Lightweight daily-carry charm suited for backpacks, bike keys, and setups',
    'Ships inside protective bubble sleeve with Kage Figures collector tag',
  ],
  'Anime Action Figures': [
    'High-detail PVC sculpture with sharp facial expression and layered paint shading',
    'Sturdy custom display stand included for wobble-free desk or shelf posing',
    'Clean seam tolerances and dynamic outfit folds modeled for display impact',
    'Packed in double-walled outer carton with foam cushioning for safe transit',
  ],
  'Cars Figures': [
    'Precision die-cast metal body with rubber-tread tires and glossy automotive paint',
    'Crisp interior dashboard detailing, clear headlamps, and scale alloy wheels',
    'Includes dust-resistant display plinth / acrylic showcase base depending on drop',
    'Individually cushioned before dispatch to prevent mirror or spoiler damage',
  ],
  Katana: [
    'Display-grade anime blade replica with tightly braided hilt wrap and ornate tsuba',
    'Matching scabbard and sleek tabletop display stand included in the box',
    'Unsharpened ornamental edge crafted safely for cosplay, wall racks, and setups',
    'Custom reinforced corrugated long-box crating with corner edge guards',
  ],
  'Manga Frame': [
    'High-contrast archival manga print layered inside a matte-finish 3D shadowbox frame',
    'Warm ambient LED edge lighting (USB powered) adds depth to desk and wall setups',
    'Shatter-resistant clear front acrylic panel with ready-to-hang rear mount',
    'Corner-protected flat-pack foam box engineered for pan-India courier safety',
  ],
};

const MATERIAL_BY_CATEGORY: Record<CategoryName, string> = {
  'Anime Keychains': 'Zinc Alloy & Hard Enamel',
  'Anime Action Figures': 'High-Density PVC & ABS',
  'Cars Figures': 'Die-Cast Metal Alloy & ABS',
  Katana: 'Carbon Steel Blade · ABS Scabbard · Hardwood Stand',
  'Manga Frame': 'Engineered Wood Frame · Acrylic Front · Warm LED Strip',
};

export function ProductDetailPage({
  product,
  onBack,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
  onVerifiedPincode,
}: ProductDetailPageProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants[0]?.id || 'std',
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [wishlisted, setWishlisted] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [verifiedPin, setVerifiedPin] = useState<PincodeDetails | null>(() =>
    getLastVerifiedPincode(),
  );
  const [pincode, setPincode] = useState<string>(
    () => getLastVerifiedPincode()?.pincode ?? '',
  );
  const [checkingPincode, setCheckingPincode] = useState<boolean>(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const pinAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setSelectedVariantId(product.variants[0]?.id || 'std');
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  useEffect(() => {
    return () => {
      pinAbortRef.current?.abort();
    };
  }, []);

  const activeVariant =
    product.variants.find((v) => v.id === selectedVariantId) ||
    product.variants[0];
  const unitPrice = Math.max(
    49,
    product.price + (activeVariant?.priceDelta || 0),
  );
  const compareAt = product.compareAtPrice
    ? product.compareAtPrice + (activeVariant?.priceDelta || 0)
    : undefined;
  const discountPct =
    compareAt && compareAt > unitPrice
      ? Math.round(((compareAt - unitPrice) / compareAt) * 100)
      : null;

  const similarProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id,
  ).slice(0, 10);

  const highlights = HIGHLIGHTS_BY_CATEGORY[product.category];

  const handlePincodeInputChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
    setPincode(digitsOnly);
    setPincodeError(null);
    if (verifiedPin && digitsOnly !== verifiedPin.pincode) {
      setVerifiedPin(null);
    }
  };

  const handleCheckPincode = async (e: FormEvent) => {
    e.preventDefault();
    pinAbortRef.current?.abort();
    const controller = new AbortController();
    pinAbortRef.current = controller;

    setCheckingPincode(true);
    setPincodeError(null);

    const result = await lookupIndianPincode(pincode, controller.signal);
    if (controller.signal.aborted) return;

    setCheckingPincode(false);
    if (result.ok) {
      setVerifiedPin(result.data);
      setPincode(result.data.pincode);
      saveVerifiedPincode(result.data);
      onVerifiedPincode?.(result.data);
    } else {
      setVerifiedPin(null);
      setPincodeError(result.message);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
      }
      setCopiedShare(true);
      window.setTimeout(() => setCopiedShare(false), 2000);
    } catch {
      setCopiedShare(true);
      window.setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="bg-[#f0f0f0] pt-[68px] sm:pt-[76px] pb-14">
      {/* Sticky dark strip behind transparent header at top of PDP */}
      <div className="fixed top-0 left-0 right-0 h-[58px] sm:h-[66px] bg-[#141414]/95 backdrop-blur-md z-30 pointer-events-none" />

      <div className="container-site pt-4 sm:pt-6">
        {/* Top Breadcrumb & Back Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[12px] sm:text-[13px] font-medium text-[#1a1a1ab3] min-w-0"
          >
            <button
              type="button"
              onClick={() => onBack()}
              className="inline-flex items-center gap-1.5 font-bold text-[#1a1a1a] hover:text-[#f83a3a] transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Home</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <button
              type="button"
              onClick={() => onBack(product.category)}
              className="hover:text-[#f83a3a] transition-colors cursor-pointer truncate"
            >
              {product.category}
            </button>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 hidden sm:inline" />
            <span className="text-[#1a1a1a] font-semibold truncate hidden sm:inline max-w-[32ch]">
              {product.title}
            </span>
          </nav>
        </div>

        {/* Main Buy-Box Grid (Gallery Left + Details/Buy Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left: Product Image Gallery */}
          <div className="lg:col-span-5 lg:sticky lg:top-[84px]">
            <div className="bg-white rounded-[12px] p-3 sm:p-4 shadow-[0_5px_15px_0_#1A1A1A1A] border border-[#1a1a1a]/[0.06]">
              <div className="relative aspect-square w-full rounded-[8px] overflow-hidden bg-[#f0f0f0]">
                <CollectibleImage
                  src={product.imageUrl}
                  fallbackSrc={product.fallbackUrl}
                  alt={product.title}
                  loading="eager"
                  fetchPriority="high"
                  className="w-full h-full object-cover"
                />

                {discountPct ? (
                  <span className="badge-pill absolute top-3 left-3">
                    Save {discountPct}%
                  </span>
                ) : product.status !== 'In Stock' ? (
                  <span className="badge-pill absolute top-3 left-3">
                    {product.status}
                  </span>
                ) : null}

                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setWishlisted((prev) => !prev)}
                    aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                    className={`w-9 h-9 rounded-full glass-surface inline-flex items-center justify-center transition-colors cursor-pointer ${
                      wishlisted ? 'text-[#f83a3a]' : 'text-[#1a1a1a]'
                    }`}
                  >
                    <Heart
                      className="w-4 h-4"
                      fill={wishlisted ? 'currentColor' : 'none'}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Copy product link"
                    className="w-9 h-9 rounded-full glass-surface text-[#1a1a1a] inline-flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                  >
                    {copiedShare ? (
                      <Check className="w-4 h-4 text-[#16a34a]" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Amazon / Flipkart Style Buy Box & Information */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white rounded-[12px] p-5 sm:p-7 shadow-[0_5px_15px_0_#1A1A1A1A] border border-[#1a1a1a]/[0.06]">
              {/* Studio & Stock Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => onBack(product.category)}
                  className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#f83a3a] hover:underline cursor-pointer"
                >
                  {product.studio} · {product.category}
                </button>
              </div>

              {/* Product Title */}
              <h1 className="text-[22px] sm:text-[30px] font-bold leading-[1.18] tracking-[-0.02em] text-[#1a1a1a] pb-4 mb-4 border-b border-[#1a1a1a]/10">
                {product.title}
              </h1>

              {/* Pricing Block */}
              <div className="mb-5">
                <div className="flex flex-wrap items-baseline gap-3 tabular-nums">
                  <span className="text-[28px] sm:text-[34px] font-extrabold text-[#1a1a1a]">
                    {formatINR(unitPrice)}
                  </span>
                  {compareAt && (
                    <span className="text-[17px] font-medium text-[#1a1a1ab3] line-through">
                      {formatINR(compareAt)}
                    </span>
                  )}
                  {discountPct && (
                    <span className="text-[15px] font-extrabold text-[#f83a3a]">
                      {discountPct}% OFF
                    </span>
                  )}
                </div>
                <p className="text-[12px] font-medium text-[#1a1a1ab3] mt-1">
                  Inclusive of all taxes · Free insured delivery on orders above ₹2,999
                </p>
              </div>

              {/* Collector Offers */}
              <div className="bg-[#f7f7f7] rounded-[10px] p-3.5 sm:p-4 border border-[#1a1a1a]/[0.07] mb-5">
                <div className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.06em] text-[#1a1a1a] mb-2">
                  <BadgePercent className="w-4 h-4 text-[#f83a3a]" />
                  <span>Available Offers</span>
                </div>
                <ul className="space-y-1.5 text-[13px] text-[#1a1a1a]/90">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#f83a3a] shrink-0">Combo:</span>
                    <span>Buy any 2 collectibles and save flat ₹150 automatically at checkout.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#f83a3a] shrink-0">Prepaid:</span>
                    <span>Complimentary double-layer foam corner protection on all UPI orders.</span>
                  </li>
                </ul>
              </div>

              {/* Edition / Variant Picker */}
              <div className="mb-5">
                <span className="block text-[12px] font-bold uppercase tracking-[0.06em] text-[#1a1a1ab3] mb-2">
                  Select Edition
                </span>
                <div
                  className={`grid grid-cols-1 gap-2.5 ${
                    product.variants.length > 1 ? 'sm:grid-cols-2' : ''
                  }`}
                >
                  {product.variants.map((variant) => {
                    const isSelected = variant.id === activeVariant?.id;
                    const vPrice = Math.max(49, product.price + variant.priceDelta);
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`p-3 rounded-[8px] border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-[#1a1a1a] bg-[#f0f0f0] shadow-sm'
                            : 'border-[#1a1a1a]/15 bg-white hover:border-[#1a1a1a]/45'
                        }`}
                      >
                        <div>
                          <div className="text-[14px] font-bold text-[#1a1a1a]">
                            {variant.label}
                          </div>
                          <div className="text-[12px] text-[#1a1a1ab3] tabular-nums">
                            {formatINR(vPrice)}
                          </div>
                        </div>
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                              : 'border-[#1a1a1a]/30'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity & Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                <div className="inline-flex items-center justify-between sm:justify-center border border-[#1a1a1a]/20 rounded-full h-[48px] px-2 bg-[#f7f7f7] shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="w-9 h-9 inline-flex items-center justify-center cursor-pointer hover:text-[#f83a3a]"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-[15px] font-bold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    aria-label="Increase quantity"
                    className="w-9 h-9 inline-flex items-center justify-center cursor-pointer hover:text-[#f83a3a]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onAddToCart(product, activeVariant?.id, quantity)}
                  className="button-primary flex-1 !py-3.5"
                >
                  Add to Bag · {formatINR(unitPrice * quantity)}
                </button>

                <button
                  type="button"
                  onClick={() => onBuyNow(product, activeVariant?.id, quantity)}
                  className="h-[48px] px-7 rounded-full bg-[#feb913] hover:bg-[#f0c417] text-[#060606] text-[15px] font-extrabold inline-flex items-center justify-center gap-2 shadow-[0_0_12px_1px_#FEB91360] transition-transform active:scale-[0.98] cursor-pointer whitespace-nowrap"
                >
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Delivery PIN Code Checker */}
              <div className="pt-5 border-t border-[#1a1a1a]/10 mb-5">
                <form
                  onSubmit={handleCheckPincode}
                  noValidate
                  className="flex flex-col sm:flex-row sm:items-center gap-2.5"
                >
                  <div className="flex items-center gap-2 text-[13px] font-bold text-[#1a1a1a] shrink-0">
                    <MapPin className="w-4 h-4 text-[#f83a3a]" />
                    <span>Delivery Check:</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 max-w-[300px]">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => handlePincodeInputChange(e.target.value)}
                      placeholder="Enter 6-digit Indian PIN"
                      aria-label="Delivery PIN code"
                      aria-invalid={Boolean(pincodeError)}
                      className={`h-9 px-3 rounded-[6px] border text-[13px] font-semibold text-[#1a1a1a] w-full outline-none transition-colors ${
                        pincodeError
                          ? 'border-[#f83a3a] bg-[#fff5f5]'
                          : verifiedPin
                            ? 'border-[#1a1a1a]/35 bg-[#f7f7f7] focus:border-[#1a1a1a]'
                            : 'border-[#1a1a1a]/20 focus:border-[#1a1a1a]'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={checkingPincode}
                      className="h-9 px-4 rounded-[6px] bg-[#1a1a1a] text-white text-[12px] font-bold cursor-pointer hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1.5 shrink-0"
                    >
                      {checkingPincode ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Checking</span>
                        </>
                      ) : (
                        <span>Check</span>
                      )}
                    </button>
                  </div>
                </form>

                {pincodeError ? (
                  <p
                    role="alert"
                    className="text-[12.5px] font-semibold text-[#f83a3a] mt-2 m-0 flex items-start gap-1.5"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{pincodeError}</span>
                  </p>
                ) : verifiedPin ? (
                  <div className="mt-3 rounded-[10px] bg-[#f7f7f7] border border-[#1a1a1a]/[0.08] px-3.5 py-2.5 text-[#1a1a1a]">
                    <p className="text-[12.5px] font-bold flex items-center gap-2 m-0 text-[#1a1a1a]">
                      <span className="w-4 h-4 rounded-full bg-[#1a1a1a] text-[#feb913] inline-flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" strokeWidth={3} />
                      </span>
                      <span>
                        Delivers to {verifiedPin.locality}, {verifiedPin.city},{' '}
                        {verifiedPin.state} ({verifiedPin.pincode})
                      </span>
                    </p>
                    <p className="text-[12px] text-[#1a1a1ab3] font-medium mt-1 mb-0 pl-6">
                      {verifiedPin.expressEligible ? 'Express' : 'Insured'} delivery
                      in{' '}
                      <span className="font-bold text-[#1a1a1a]">
                        {verifiedPin.deliveryDays}
                      </span>{' '}
                      · Auto-filled for checkout
                    </p>
                  </div>
                ) : (
                  <p className="text-[12.5px] font-medium text-[#1a1a1ab3] mt-2 m-0">
                    Enter your 6-digit Indian PIN code to verify serviceability, city
                    &amp; state.
                  </p>
                )}
              </div>

              {/* 4-Badge Trust Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-[#1a1a1a]/10">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#1a1a1a]">
                  <ShieldCheck className="w-4 h-4 text-[#f83a3a] shrink-0" />
                  <span>Quality Checked</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#1a1a1a]">
                  <PackageCheck className="w-4 h-4 text-[#f83a3a] shrink-0" />
                  <span>Foam Box Packing</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#1a1a1a]">
                  <Truck className="w-4 h-4 text-[#f83a3a] shrink-0" />
                  <span>Pan-India Insured</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#1a1a1a]">
                  <RotateCcw className="w-4 h-4 text-[#f83a3a] shrink-0" />
                  <span>7-Day Damage Cover</span>
                </div>
              </div>
            </div>

            {/* Highlights & Description Card */}
            <div className="bg-white rounded-[12px] p-5 sm:p-7 shadow-[0_5px_15px_0_#1A1A1A1A] border border-[#1a1a1a]/[0.06]">
              <h2 className="text-[20px] sm:text-[22px] font-bold text-[#1a1a1a] mb-3">
                Highlights &amp; Description
              </h2>
              <p className="text-[14px] sm:text-[15px] leading-[1.6] text-[#1a1a1ab3] mb-4">
                {product.description}
              </p>
              <ul className="space-y-2">
                {highlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-[14px] text-[#1a1a1a]"
                  >
                    <Sparkles className="w-4 h-4 text-[#feb913] shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specifications Table (Amazon/Flipkart Spec Sheet) */}
            <div className="bg-white rounded-[12px] p-5 sm:p-7 shadow-[0_5px_15px_0_#1A1A1A1A] border border-[#1a1a1a]/[0.06]">
              <h2 className="text-[20px] sm:text-[22px] font-bold text-[#1a1a1a] mb-4">
                Product Specifications
              </h2>
              <div className="rounded-[8px] border border-[#1a1a1a]/10 overflow-hidden text-[13.5px] sm:text-[14px]">
                {[
                  ['Brand / Studio', product.studio],
                  ['Category', product.category],
                  ['Catalog Code', product.code],
                  ['Scale / Edition Type', product.scale],
                  ['Dimensions', product.dimensions],
                  ['Material Build', MATERIAL_BY_CATEGORY[product.category]],
                  ['Edition / Drop', product.editionSize],
                  ['Transit Protection', 'Multi-layer bubble wrap & rigid carton'],
                  ['Dispatched From', 'Kage Figures Hub · Indore, India'],
                ].map(([label, value], i) => (
                  <div
                    key={label}
                    className={`grid grid-cols-12 px-4 py-2.5 ${
                      i % 2 === 0 ? 'bg-[#f7f7f7]' : 'bg-white'
                    }`}
                  >
                    <div className="col-span-5 sm:col-span-4 font-semibold text-[#1a1a1ab3]">
                      {label}
                    </div>
                    <div className="col-span-7 sm:col-span-8 font-bold text-[#1a1a1a]">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Questions & Answers */}
        <section className="mt-6 bg-white rounded-[12px] p-5 sm:p-7 shadow-[0_5px_15px_0_#1A1A1A1A] border border-[#1a1a1a]/[0.06]">
          <h2 className="text-[20px] sm:text-[22px] font-bold text-[#1a1a1a] mb-4">
            Collector Questions &amp; Answers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                q: 'Is the packaging safe for fragile shipments?',
                a: 'Yes. Every item is wrapped in dual-density bubble sheets inside a rigid outer shipper to prevent transit dents or breaks.',
              },
              {
                q: 'What if an item arrives damaged?',
                a: 'Record a quick unboxing clip and share with us within 48 hours for an immediate replacement or full refund under 7-day transit cover.',
              },
              {
                q: 'How long does pan-India delivery take?',
                a: 'Orders ship within 24–48 hours from Indore and reach metro cities in 2–4 days and rest of India in 4–6 business days.',
              },
            ].map((item) => (
              <div
                key={item.q}
                className="p-4 rounded-[10px] bg-[#f7f7f7] border border-[#1a1a1a]/[0.06]"
              >
                <p className="text-[14px] font-bold text-[#1a1a1a] mb-1.5">
                  Q: {item.q}
                </p>
                <p className="text-[13px] leading-[1.5] text-[#1a1a1ab3] m-0">
                  A: {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Similar Collectibles Row */}
        {similarProducts.length > 0 && (
          <section className="mt-10">
            <div className="flex items-end justify-between gap-4 mb-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#f83a3a] mb-1">
                  More in {product.category}
                </p>
                <h2 className="text-[24px] sm:text-[32px] font-bold text-[#1a1a1a] m-0">
                  Similar Collectibles
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onBack(product.category)}
                className="text-[14px] font-bold text-[#1a1a1a] hover:text-[#f83a3a] cursor-pointer whitespace-nowrap"
              >
                View all →
              </button>
            </div>
            <div className="mobile-h-scroll no-scrollbar md:grid-cols-3 lg:grid-cols-5">
              {similarProducts.slice(0, 5).map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  onQuickView={onSelectProduct}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
