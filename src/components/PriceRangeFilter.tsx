import {
  CATALOG_MAX_PRICE,
  CATALOG_MIN_PRICE,
  PRICE_PRESETS,
  type Product,
  formatINR,
} from '../data/catalog';

interface PriceRangeFilterProps {
  minPrice: number;
  maxPrice: number;
  onChange: (min: number, max: number) => void;
  productsForCounts?: Product[];
  compact?: boolean;
}

export function PriceRangeFilter({
  minPrice,
  maxPrice,
  onChange,
  productsForCounts,
  compact = false,
}: PriceRangeFilterProps) {
  const span = Math.max(1, CATALOG_MAX_PRICE - CATALOG_MIN_PRICE);
  const leftPct = ((minPrice - CATALOG_MIN_PRICE) / span) * 100;
  const rightPct = ((maxPrice - CATALOG_MIN_PRICE) / span) * 100;
  const isFiltered =
    minPrice > CATALOG_MIN_PRICE || maxPrice < CATALOG_MAX_PRICE;

  const handleMinChange = (rawVal: number) => {
    const clamped = Math.min(rawVal, maxPrice);
    onChange(clamped, maxPrice);
  };

  const handleMaxChange = (rawVal: number) => {
    const clamped = Math.max(rawVal, minPrice);
    onChange(minPrice, clamped);
  };

  return (
    <div className={compact ? 'space-y-2.5' : 'space-y-3'}>
      {/* Preset Price Chips */}
      <div className="flex flex-wrap gap-1.5">
        {PRICE_PRESETS.map((preset) => {
          const isActive = minPrice === preset.min && maxPrice === preset.max;
          const count = productsForCounts
            ? productsForCounts.filter(
                (p) => p.price >= preset.min && p.price <= preset.max,
              ).length
            : null;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.min, preset.max)}
              className={`px-2.5 py-1 rounded-full text-[12px] font-bold border transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                  : 'bg-[#f7f7f7] text-[#1a1a1a] border-[#1a1a1a]/12 hover:border-[#1a1a1a]/45'
              }`}
            >
              <span>{preset.label}</span>
              {count !== null && (
                <span
                  className={`text-[10.5px] tabular-nums ${
                    isActive ? 'text-[#feb913]' : 'text-[#1a1a1ab3]'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Dual-Thumb Price Range Slider */}
      <div className="pt-1">
        <div className="flex items-center justify-between text-[12px] font-bold mb-2">
          <span className="text-[#1a1a1ab3] uppercase tracking-[0.05em] text-[10.5px]">
            Price Range
          </span>
          <div className="flex items-center gap-2 tabular-nums">
            <span className="text-[#1a1a1a]">
              {formatINR(minPrice)} – {formatINR(maxPrice)}
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={() => onChange(CATALOG_MIN_PRICE, CATALOG_MAX_PRICE)}
                className="text-[11px] font-bold text-[#f83a3a] hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="relative h-6 flex items-center">
          <div className="w-full h-1.5 rounded-full bg-[#1a1a1a]/12 relative overflow-hidden">
            <div
              className="absolute top-0 bottom-0 bg-[#1a1a1a] rounded-full"
              style={{
                left: `${leftPct}%`,
                width: `${Math.max(2, rightPct - leftPct)}%`,
              }}
            />
          </div>

          <input
            type="range"
            aria-label="Minimum price"
            min={CATALOG_MIN_PRICE}
            max={CATALOG_MAX_PRICE}
            step={10}
            value={minPrice}
            onChange={(e) => handleMinChange(Number(e.target.value))}
            className="price-range-input absolute inset-x-0 w-full h-6 z-10"
          />
          <input
            type="range"
            aria-label="Maximum price"
            min={CATALOG_MIN_PRICE}
            max={CATALOG_MAX_PRICE}
            step={10}
            value={maxPrice}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
            className="price-range-input absolute inset-x-0 w-full h-6 z-20"
          />
        </div>

        <div className="flex items-center justify-between text-[10.5px] font-semibold text-[#1a1a1ab3] tabular-nums">
          <span>{formatINR(CATALOG_MIN_PRICE)}</span>
          <span>{formatINR(CATALOG_MAX_PRICE)}</span>
        </div>
      </div>
    </div>
  );
}
