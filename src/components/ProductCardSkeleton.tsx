interface ProductCardSkeletonProps {
  layout?: 'carousel' | 'grid';
}

export function ProductCardSkeleton({
  layout = 'carousel',
}: ProductCardSkeletonProps) {
  const sizeClasses =
    layout === 'grid'
      ? 'w-full min-w-0 max-w-none'
      : 'w-[60vw] min-w-[185px] max-w-[225px] sm:w-[230px] md:w-auto md:min-w-0 md:max-w-none shrink-0 snap-start';

  return (
    <div
      aria-hidden="true"
      className={`card !p-0 overflow-hidden flex flex-col justify-between bg-white border border-[#1a1a1a]/[0.06] ${sizeClasses}`}
    >
      {/* Image placeholder */}
      <div className="relative aspect-square w-full bg-[#e6e6e6] animate-pulse overflow-hidden">
        <div className="absolute top-2.5 left-2.5 h-5 w-14 rounded-full bg-white/60" />
      </div>

      {/* Details placeholder */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5 bg-white">
        <div className="space-y-2 py-0.5">
          <div className="h-3.5 w-[88%] rounded bg-[#e6e6e6] animate-pulse" />
          <div className="h-3.5 w-[58%] rounded bg-[#ebebeb] animate-pulse" />
        </div>

        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-[#1a1a1a]/[0.08]">
          <div className="h-4 w-16 rounded bg-[#e6e6e6] animate-pulse" />
          <div className="h-8 w-16 rounded-full bg-[#e6e6e6] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
