import { useState, useMemo, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  Grid,
  Hash,
  Instagram,
  List,
  Loader2,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { INSTAGRAM_POSTS, type InstagramPostItem } from '../data/instagramPosts';
import { PRODUCTS, type Product, formatINR } from '../data/catalog';
import { SwipeableImageGallery } from './SwipeableImageGallery';

interface InstagramPostsPageProps {
  onBack: () => void;
  onSelectProduct?: (product: Product) => void;
}

type ViewMode = 'grid' | 'embeds' | 'table';
type IndexRange = 'all' | '1-25' | '26-50' | '51-75' | '76-100' | '101-135';

const RANGE_OPTIONS: { id: IndexRange; label: string; min: number; max: number }[] = [
  { id: 'all', label: 'All 135 Drops', min: 1, max: 135 },
  { id: '1-25', label: '#001 – #025', min: 1, max: 25 },
  { id: '26-50', label: '#026 – #050', min: 26, max: 50 },
  { id: '51-75', label: '#051 – #075', min: 51, max: 75 },
  { id: '76-100', label: '#076 – #100', min: 76, max: 100 },
  { id: '101-135', label: '#101 – #135', min: 101, max: 135 },
];

export function InstagramPostsPage({ onBack, onSelectProduct }: InstagramPostsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRange, setSelectedRange] = useState<IndexRange>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [jumpInput, setJumpInput] = useState('');
  const [activeEmbedPost, setActiveEmbedPost] = useState<InstagramPostItem | null>(null);
  const [modalMode, setModalMode] = useState<'gallery' | 'embed'>('gallery');
  const [modalPhotoIndex, setModalPhotoIndex] = useState(0);
  const [expandedEmbeds, setExpandedEmbeds] = useState<Record<number, boolean>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [embedsPage, setEmbedsPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);

  const EMBEDS_PER_PAGE = 8;
  const postRefs = useRef<Map<number, HTMLElement>>(new Map());

  // Map post index to catalog product
  const productByPostIndex = useMemo(() => {
    const map = new Map<number, Product>();
    for (const p of PRODUCTS) {
      if (p.instagramPostIndex) {
        map.set(p.instagramPostIndex, p);
      }
    }
    return map;
  }, []);

  // Track scroll for Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filtered and sorted posts
  const filteredPosts = useMemo(() => {
    let result = [...INSTAGRAM_POSTS];

    // Range filtering
    if (selectedRange !== 'all') {
      const rangeConfig = RANGE_OPTIONS.find((r) => r.id === selectedRange);
      if (rangeConfig) {
        result = result.filter(
          (p) => p.index >= rangeConfig.min && p.index <= rangeConfig.max,
        );
      }
    }

    // Search filtering
    const cleanSearch = searchQuery.trim().toLowerCase();
    if (cleanSearch) {
      result = result.filter((p) => {
        const indexStr = String(p.index);
        const indexBadge = p.indexBadge.toLowerCase();
        const shortcode = p.shortcode.toLowerCase();
        const title = p.title.toLowerCase();

        return (
          indexStr === cleanSearch ||
          indexBadge.includes(cleanSearch) ||
          shortcode.includes(cleanSearch) ||
          title.includes(cleanSearch)
        );
      });
    }

    // Sort order
    result.sort((a, b) => {
      return sortOrder === 'asc' ? a.index - b.index : b.index - a.index;
    });

    return result;
  }, [selectedRange, searchQuery, sortOrder]);

  // Paginated for live embeds mode
  const paginatedEmbeds = useMemo(() => {
    if (viewMode !== 'embeds') return filteredPosts;
    const startIndex = (embedsPage - 1) * EMBEDS_PER_PAGE;
    return filteredPosts.slice(startIndex, startIndex + EMBEDS_PER_PAGE);
  }, [filteredPosts, viewMode, embedsPage]);

  const totalEmbedPages = Math.ceil(filteredPosts.length / EMBEDS_PER_PAGE);

  // Jump to specific index number
  const handleJumpToIndex = (targetIndex: number) => {
    if (targetIndex < 1 || targetIndex > 135) return;

    // Reset range filter if target is outside current range
    const currentRangeConfig = RANGE_OPTIONS.find((r) => r.id === selectedRange);
    if (
      currentRangeConfig &&
      selectedRange !== 'all' &&
      (targetIndex < currentRangeConfig.min || targetIndex > currentRangeConfig.max)
    ) {
      setSelectedRange('all');
    }

    // Clear search if it hides target
    if (searchQuery) {
      setSearchQuery('');
    }

    setHighlightedIndex(targetIndex);

    setTimeout(() => {
      const el = postRefs.current.get(targetIndex);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);

    setTimeout(() => {
      setHighlightedIndex(null);
    }, 3000);
  };

  const handleCopyLink = async (post: InstagramPostItem) => {
    try {
      await navigator.clipboard.writeText(post.url);
      setCopiedIndex(post.index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = post.url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedIndex(post.index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const toggleEmbed = (index: number) => {
    setExpandedEmbeds((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleOpenEmbedModal = (post: InstagramPostItem) => {
    setIframeLoading(true);
    setModalMode('gallery');
    setModalPhotoIndex(0);
    setActiveEmbedPost(post);
  };

  const handleModalNavigate = (direction: 'prev' | 'next') => {
    if (!activeEmbedPost) return;
    const currentIndex = activeEmbedPost.index;
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 1) nextIndex = 135;
    if (nextIndex > 135) nextIndex = 1;
    const targetPost = INSTAGRAM_POSTS.find((p) => p.index === nextIndex);
    if (targetPost) {
      setIframeLoading(true);
      setModalPhotoIndex(0);
      setActiveEmbedPost(targetPost);
    }
  };

  return (
    <div className="bg-[#f0f0f0] pt-[68px] sm:pt-[76px] pb-20 min-h-[85vh] text-[#1a1a1a]">
      {/* Top Header Backdrop */}
      <div className="fixed top-0 left-0 right-0 h-[58px] sm:h-[66px] bg-[#141414]/95 backdrop-blur-md z-30 pointer-events-none" />

      <div className="container-site pt-4 sm:pt-6">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-[14px] font-bold text-[#1a1a1a] hover:text-[#f83a3a] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Kage Figures Store</span>
          </button>

          <a
            href="https://www.instagram.com/kagefigures/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#1a1a1ab3] hover:text-[#f83a3a] transition-colors"
          >
            <Instagram className="w-4 h-4 text-[#e1306c]" />
            <span className="hidden sm:inline">Follow</span> @kagefigures
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Hero Banner with Index Title */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#141414] via-[#1a1a1a] to-[#242424] text-white p-6 sm:p-8 md:p-10 mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-white/10">
          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#f83a3a] to-[#feb913] text-black shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Official Index Archive
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/90 border border-white/15">
                <Hash className="w-3 h-3 text-[#feb913]" />
                135 Indexed Posts
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/90 border border-white/15">
                <Instagram className="w-3 h-3 text-[#e1306c]" />
                @kagefigures
              </span>
            </div>

            <h1 className="font-gang-of-three text-[28px] sm:text-[38px] md:text-[48px] font-normal leading-[1.08] tracking-[0.02em] text-white mb-3">
              Instagram Posts Index
            </h1>

            <p className="text-[14px] sm:text-[15px] text-white/80 leading-relaxed mb-5">
              Explore all 135 authentic drops directly from the @kagefigures Instagram archive. Each card
              displays the genuine post drop image with its permanent catalogue index (<span className="text-[#feb913] font-bold">#001 to #135</span>),
              real shortcode, and live preview modal matching the exact Instagram post.
            </p>

            {/* Quick Index Jump Input in Hero */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const num = parseInt(jumpInput, 10);
                if (!isNaN(num)) {
                  handleJumpToIndex(num);
                }
              }}
              className="flex flex-wrap items-center gap-2 max-w-md"
            >
              <div className="relative flex-1 min-w-[180px]">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/50">
                  <Hash className="w-4 h-4 text-[#feb913]" />
                </div>
                <input
                  type="number"
                  min={1}
                  max={135}
                  value={jumpInput}
                  onChange={(e) => setJumpInput(e.target.value)}
                  placeholder="Jump to Index # (1 - 135)"
                  className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 text-[13px] sm:text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-[#feb913] focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-[#feb913] hover:bg-[#e5a50f] text-[#1a1a1a] font-bold text-[13px] sm:text-[14px] transition-colors cursor-pointer shadow-md shrink-0"
              >
                Go to Index
              </button>
            </form>
          </div>

          {/* Decorative Background Elements */}
          <div className="absolute right-[-40px] bottom-[-40px] opacity-10 pointer-events-none select-none">
            <Instagram className="w-80 h-80 text-white" />
          </div>
        </div>

        {/* Index Quick-Jump Bar (Horizontal scrollable badges #1 to #135) */}
        <div className="bg-white rounded-xl p-3 sm:p-4 mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#1a1a1a]/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-[#f83a3a]" />
              <span className="text-[13px] font-bold text-[#1a1a1a]">Quick Index Jump:</span>
              <span className="text-[12px] text-[#1a1a1ab3]">Click any number to scroll directly</span>
            </div>
            <span className="text-[12px] font-bold text-[#1a1a1ab3]">135 Posts</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-gray-300">
            {Array.from({ length: 135 }, (_, i) => i + 1).map((idx) => {
              const isHighlighted = highlightedIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleJumpToIndex(idx)}
                  className={`shrink-0 w-8 h-8 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isHighlighted
                      ? 'bg-[#f83a3a] text-white scale-110 shadow-md ring-2 ring-[#feb913]'
                      : 'bg-[#f0f0f0] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white'
                  }`}
                  title={`Jump to Index #${idx}`}
                >
                  {idx}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter and Control Toolbar */}
        <div className="bg-white rounded-xl p-4 sm:p-5 mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#1a1a1a]/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px] max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Index (#042) or shortcode (DgCm)..."
              className="w-full pl-9 pr-9 py-2.5 rounded-full bg-[#f8f8f8] border border-[#1a1a1a]/15 text-[#1a1a1a] placeholder-gray-400 text-[13px] sm:text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-[#f83a3a] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right side controls: Range Pills, Sort & View Modes */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-full bg-[#f0f0f0] p-1 border border-[#1a1a1a]/10">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#1a1a1a] shadow-sm'
                    : 'text-[#1a1a1ab3] hover:text-[#1a1a1a]'
                }`}
                title="Card Grid with Index Badges"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('embeds')}
                className={`px-3 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'embeds'
                    ? 'bg-white text-[#1a1a1a] shadow-sm'
                    : 'text-[#1a1a1ab3] hover:text-[#1a1a1a]'
                }`}
                title="Live Instagram Embeds"
              >
                <Instagram className="w-3.5 h-3.5 text-[#e1306c]" />
                <span className="hidden sm:inline">Embeds</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-[#1a1a1a] shadow-sm'
                    : 'text-[#1a1a1ab3] hover:text-[#1a1a1a]'
                }`}
                title="Directory Table View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Directory</span>
              </button>
            </div>

            {/* Sort Order Toggle */}
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="h-9 px-3.5 rounded-full bg-[#f0f0f0] hover:bg-white text-[#1a1a1a] border border-[#1a1a1a]/15 text-[12px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#f83a3a]" />
              <span>{sortOrder === 'asc' ? 'Index #1 → #135' : 'Index #135 → #1'}</span>
            </button>
          </div>
        </div>

        {/* Index Range Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {RANGE_OPTIONS.map((range) => {
            const isActive = selectedRange === range.id;
            return (
              <button
                key={range.id}
                type="button"
                onClick={() => {
                  setSelectedRange(range.id);
                  setEmbedsPage(1);
                }}
                className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1a1a1a] text-[#feb913] shadow-md ring-2 ring-[#feb913]/30'
                    : 'bg-white text-[#1a1a1a] hover:bg-[#f0f0f0] border border-[#1a1a1a]/10'
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>

        {/* Active Filter Summary Bar */}
        <div className="flex items-center justify-between text-[13px] text-[#1a1a1ab3] mb-4 px-1">
          <p>
            Showing <strong className="text-[#1a1a1a]">{filteredPosts.length}</strong> of{' '}
            <strong className="text-[#1a1a1a]">135</strong> indexed Instagram posts
            {searchQuery && (
              <span>
                {' '}matching &quot;<span className="text-[#f83a3a] font-bold">{searchQuery}</span>&quot;
              </span>
            )}
          </p>

          {(searchQuery || selectedRange !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedRange('all');
              }}
              className="text-[#f83a3a] hover:underline font-bold cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* ZERO RESULTS FALLBACK */}
        {filteredPosts.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#1a1a1a]/10 my-8 shadow-sm">
            <Hash className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-2">No Instagram posts found</h3>
            <p className="text-[14px] text-[#1a1a1ab3] max-w-md mx-auto mb-5">
              No drops matched your search query &quot;{searchQuery}&quot;. Try searching for an index
              number (e.g. 42), shortcode, or clearing the filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedRange('all');
              }}
              className="button-primary !py-2.5 !px-6 cursor-pointer"
            >
              Show All 135 Posts
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: CARD GRID WITH PROMINENT INDEX BADGES & AUTHENTIC POST MEDIA */}
        {/* ========================================================================= */}
        {viewMode === 'grid' && filteredPosts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredPosts.map((post) => {
              const isCopied = copiedIndex === post.index;
              const isExpanded = expandedEmbeds[post.index];
              const isHighlighted = highlightedIndex === post.index;
              const matchedProduct = productByPostIndex.get(post.index);

              return (
                <article
                  key={post.index}
                  ref={(el) => {
                    if (el) postRefs.current.set(post.index, el);
                    else postRefs.current.delete(post.index);
                  }}
                  className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] ${
                    isHighlighted
                      ? 'border-[#f83a3a] ring-4 ring-[#feb913] scale-[1.02]'
                      : 'border-[#1a1a1a]/10 hover:border-[#1a1a1a]/30'
                  }`}
                >
                  {/* Top Image Preview with Index Badge Overlay & Swipeable Gallery */}
                  <div className="relative aspect-square w-full bg-[#141414] overflow-hidden group">
                    <SwipeableImageGallery
                      images={post.images && post.images.length > 0 ? post.images : [post.thumbnailUrl]}
                      alt={`Instagram Drop ${post.indexBadge} - ${post.shortcode}`}
                      onClick={() => handleOpenEmbedModal(post)}
                    />

                    {/* Gradient Overlay for Top Badges */}
                    <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/75 to-transparent pointer-events-none z-10" />

                    {/* LARGE PROMINENT INDEX BADGE */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 pointer-events-none">
                      <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-[#1a1a1a] text-[#feb913] border border-[#feb913]/40 shadow-lg flex items-center gap-1">
                        <Hash className="w-3 h-3 text-[#feb913]" />
                        INDEX {post.indexBadge}
                      </span>
                    </div>

                    {/* Top Right: Quick Copy Post Link Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyLink(post);
                      }}
                      className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                        isCopied
                          ? 'bg-[#1a9338] text-white scale-110'
                          : 'bg-black/60 hover:bg-black text-white hover:text-[#feb913]'
                      }`}
                      title="Copy Instagram Post Link"
                      aria-label={`Copy link for Index ${post.indexBadge}`}
                    >
                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Shortcode & Drop Info */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#1a1a1ab3]">
                          Instagram Drop
                        </span>
                        <span className="font-mono text-[11px] font-bold text-[#e1306c]">
                          p/{post.shortcode}
                        </span>
                      </div>

                      <h3 className="text-[14px] font-bold text-[#1a1a1a] line-clamp-1 leading-snug mb-3">
                        {post.title}
                      </h3>

                      {matchedProduct && (
                        <div className="mb-3 p-2 rounded-lg bg-[#f8f8f8] border border-[#1a1a1a]/10">
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#f83a3a] mb-0.5">
                            Listed Product ({matchedProduct.code})
                          </div>
                          <div className="text-[12px] font-bold text-[#1a1a1a] line-clamp-1">
                            {matchedProduct.title}
                          </div>
                          <div className="text-[11px] font-semibold text-[#1a1a1ab3] flex items-center justify-between mt-1">
                            <span className="text-[#1a1a1a] font-extrabold">{formatINR(matchedProduct.price)}</span>
                            {onSelectProduct && (
                              <button
                                type="button"
                                onClick={() => onSelectProduct(matchedProduct)}
                                className="text-[#f83a3a] hover:underline font-bold cursor-pointer text-[11px]"
                              >
                                View Product &rarr;
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Row */}
                    <div className="pt-2 border-t border-[#1a1a1a]/10 flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Open in Instagram */}
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full h-9 rounded-lg bg-[#f0f0f0] hover:bg-[#e1306c] hover:text-white text-[#1a1a1a] text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Instagram className="w-3.5 h-3.5" />
                          <span>Instagram</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>

                        {/* Open Photos Gallery */}
                        <button
                          type="button"
                          onClick={() => handleOpenEmbedModal(post)}
                          className="w-full h-9 rounded-lg bg-[#f0f0f0] hover:bg-[#1a1a1a] hover:text-white text-[#1a1a1a] text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Photos ({post.images?.length || 1})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: LIVE EMBEDS FEED WITH PAGINATION */}
        {/* ========================================================================= */}
        {viewMode === 'embeds' && filteredPosts.length > 0 && (
          <div className="space-y-8 max-w-2xl mx-auto">
            {paginatedEmbeds.map((post) => {
              const isCopied = copiedIndex === post.index;

              return (
                <div
                  key={post.index}
                  ref={(el) => {
                    if (el) postRefs.current.set(post.index, el);
                    else postRefs.current.delete(post.index);
                  }}
                  className="bg-white rounded-2xl p-5 border border-[#1a1a1a]/15 shadow-sm"
                >
                  {/* Top Bar for Embed Post */}
                  <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#1a1a1a]/10">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#1a1a1a] text-[#feb913] border border-[#feb913]/30 shadow-sm flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5 text-[#feb913]" />
                        INDEX {post.indexBadge}
                      </span>
                      <span className="font-mono text-[13px] font-bold text-[#1a1a1a]">
                        p/{post.shortcode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(post)}
                        className={`h-8 px-3 rounded-full text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                          isCopied
                            ? 'bg-[#1a9338] text-white'
                            : 'bg-[#f0f0f0] hover:bg-[#1a1a1a] hover:text-white text-[#1a1a1a]'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>

                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 px-3 rounded-full bg-[#f0f0f0] hover:bg-[#e1306c] hover:text-white text-[#1a1a1a] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Instagram className="w-3.5 h-3.5" />
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Embed Frame */}
                  <div className="w-full min-h-[480px] rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                    <iframe
                      key={`feed-${post.shortcode}`}
                      src={post.embedUrl}
                      className="w-full min-h-[480px] border-0 rounded-xl"
                      loading="lazy"
                      title={`Instagram Embed Drop ${post.indexBadge}`}
                    />
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls for Embed Feed */}
            {totalEmbedPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-6">
                <button
                  type="button"
                  disabled={embedsPage === 1}
                  onClick={() => {
                    setEmbedsPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="h-10 px-4 rounded-full bg-white border border-[#1a1a1a]/15 text-[13px] font-bold text-[#1a1a1a] hover:bg-[#f0f0f0] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="text-[13px] font-bold text-[#1a1a1ab3]">
                  Page {embedsPage} of {totalEmbedPages}
                </span>

                <button
                  type="button"
                  disabled={embedsPage === totalEmbedPages}
                  onClick={() => {
                    setEmbedsPage((p) => Math.min(totalEmbedPages, p + 1));
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="h-10 px-4 rounded-full bg-white border border-[#1a1a1a]/15 text-[13px] font-bold text-[#1a1a1a] hover:bg-[#f0f0f0] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: INDEX DIRECTORY / TABLE VIEW */}
        {/* ========================================================================= */}
        {viewMode === 'table' && filteredPosts.length > 0 && (
          <div className="bg-white rounded-2xl overflow-hidden border border-[#1a1a1a]/10 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-[#1a1a1a] text-white font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 w-24">Index #</th>
                    <th className="py-3.5 px-4 w-20">Preview</th>
                    <th className="py-3.5 px-4">Drop Name</th>
                    <th className="py-3.5 px-4">Shortcode</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]/10 font-medium">
                  {filteredPosts.map((post) => {
                    const isCopied = copiedIndex === post.index;
                    const isHighlighted = highlightedIndex === post.index;
                    const matchedProduct = productByPostIndex.get(post.index);

                    return (
                      <tr
                        key={post.index}
                        ref={(el) => {
                          if (el) postRefs.current.set(post.index, el);
                          else postRefs.current.delete(post.index);
                        }}
                        className={`hover:bg-[#f8f8f8] transition-colors ${
                          isHighlighted ? 'bg-[#feb913]/20 ring-2 ring-[#feb913]' : ''
                        }`}
                      >
                        {/* Index Number */}
                        <td className="py-3 px-4 font-mono font-black text-[#1a1a1a]">
                          <span className="px-2.5 py-1 rounded bg-[#1a1a1a] text-[#feb913] text-[12px] inline-block">
                            {post.indexBadge}
                          </span>
                        </td>

                        {/* Thumbnail */}
                        <td className="py-3 px-4">
                          <img
                            src={post.thumbnailUrl}
                            alt={`Drop ${post.indexBadge}`}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-black/10"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/catalogue/kage-logo.webp';
                            }}
                          />
                        </td>

                        {/* Title */}
                        <td className="py-3 px-4">
                          <p className="font-bold text-[#1a1a1a]">
                            {post.title}
                          </p>
                          {matchedProduct && (
                            <p className="text-[11.5px] text-[#f83a3a] font-semibold mt-0.5">
                              Catalogue: {matchedProduct.title} ({formatINR(matchedProduct.price)})
                            </p>
                          )}
                        </td>

                        {/* Shortcode */}
                        <td className="py-3 px-4 font-mono text-[#1a1a1ab3] text-[12px]">
                          p/{post.shortcode}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {matchedProduct && onSelectProduct && (
                              <button
                                type="button"
                                onClick={() => onSelectProduct(matchedProduct)}
                                className="h-8 px-2.5 rounded bg-[#f83a3a] text-white hover:bg-[#d62828] text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                title={`View ${matchedProduct.title} in shop`}
                              >
                                <span>Shop</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleCopyLink(post)}
                              className={`h-8 px-2.5 rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                                isCopied
                                  ? 'bg-[#1a9338] text-white'
                                  : 'bg-[#f0f0f0] hover:bg-[#1a1a1a] hover:text-white text-[#1a1a1a]'
                              }`}
                              title="Copy Link"
                            >
                              {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              <span className="hidden sm:inline">Copy</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEmbedModal(post)}
                              className="h-8 px-2.5 rounded bg-[#f0f0f0] hover:bg-[#1a1a1a] hover:text-white text-[#1a1a1a] text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                              title="Preview Embed"
                            >
                              <Eye className="w-3 h-3" />
                              <span className="hidden sm:inline">Preview</span>
                            </button>

                            <a
                              href={post.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-8 px-2.5 rounded bg-[#e1306c] hover:bg-[#c1255b] text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                              title="Open on Instagram"
                            >
                              <Instagram className="w-3 h-3" />
                              <span className="hidden sm:inline">IG</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Back to Top Floating Button */}
        {showScrollTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-30 w-12 h-12 rounded-full bg-[#1a1a1a] text-[#feb913] hover:bg-[#f83a3a] hover:text-white shadow-xl flex items-center justify-center transition-all cursor-pointer"
            aria-label="Back to top of Instagram Index"
            title="Scroll to Top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: FULL INSTAGRAM EMBED PREVIEW MODAL */}
      {/* ========================================================================= */}
      {activeEmbedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-white rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-white/20 animate-scale-up"
            role="dialog"
            aria-modal="true"
            aria-label={`Instagram Post ${activeEmbedPost.indexBadge}`}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#1a1a1a] text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#feb913] text-black">
                  INDEX {activeEmbedPost.indexBadge}
                </span>
                <span className="font-mono text-white/80 text-[13px]">
                  p/{activeEmbedPost.shortcode}
                </span>
              </div>

              {/* Photos Gallery vs Instagram Embed Toggle */}
              <div className="flex items-center bg-white/10 rounded-full p-0.5 border border-white/15">
                <button
                  type="button"
                  onClick={() => setModalMode('gallery')}
                  className={`px-3 py-1 rounded-full text-[12px] font-bold transition-all cursor-pointer ${
                    modalMode === 'gallery'
                      ? 'bg-[#feb913] text-black shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Photos ({activeEmbedPost.images?.length || 1})
                </button>
                <button
                  type="button"
                  onClick={() => setModalMode('embed')}
                  className={`px-3 py-1 rounded-full text-[12px] font-bold transition-all cursor-pointer ${
                    modalMode === 'embed'
                      ? 'bg-[#feb913] text-black shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  IG Embed
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyLink(activeEmbedPost)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white hover:text-black transition-colors cursor-pointer text-white"
                  title="Copy Post URL"
                >
                  {copiedIndex === activeEmbedPost.index ? (
                    <Check className="w-4 h-4 text-[#1a9338]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <a
                  href={activeEmbedPost.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/10 hover:bg-[#e1306c] transition-colors cursor-pointer text-white"
                  title="Open on Instagram"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => setActiveEmbedPost(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-[#f83a3a] transition-colors cursor-pointer text-white"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Swipeable Photos (Default) or Embed */}
            {modalMode === 'gallery' ? (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#141414] flex flex-col items-center justify-center">
                <div className="w-full max-w-md rounded-xl overflow-hidden shadow-2xl bg-black">
                  <SwipeableImageGallery
                    images={
                      activeEmbedPost.images && activeEmbedPost.images.length > 0
                        ? activeEmbedPost.images
                        : [activeEmbedPost.thumbnailUrl]
                    }
                    alt={activeEmbedPost.title}
                    aspectRatioClass="aspect-square"
                    onImageChange={(idx) => setModalPhotoIndex(idx)}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                  <p className="text-[12px] text-white/70">
                    Swipe or click arrows to view all {activeEmbedPost.images?.length || 1} photos
                  </p>
                  <a
                    href={
                      activeEmbedPost.slideUrls && activeEmbedPost.slideUrls[modalPhotoIndex]
                        ? activeEmbedPost.slideUrls[modalPhotoIndex]
                        : activeEmbedPost.url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#e1306c] hover:bg-[#c1255b] text-white text-[12px] font-bold transition-colors cursor-pointer shadow-md"
                    title={`View slide ${modalPhotoIndex + 1} on Instagram`}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>View Slide {modalPhotoIndex + 1} on Instagram</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 flex flex-col items-center justify-center relative">
                {iframeLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/90 z-10 gap-3">
                    <Loader2 className="w-8 h-8 text-[#f83a3a] animate-spin" />
                    <span className="text-[13px] font-bold text-[#1a1a1ab3]">
                      Loading Instagram Drop {activeEmbedPost.indexBadge}...
                    </span>
                  </div>
                )}
                <div className="w-full max-w-md min-h-[460px] bg-white rounded-xl shadow-inner overflow-hidden">
                  <iframe
                    key={activeEmbedPost.shortcode}
                    src={activeEmbedPost.embedUrl}
                    className="w-full h-[520px] border-0"
                    loading="eager"
                    onLoad={() => setIframeLoading(false)}
                    title={`Instagram Embed Drop ${activeEmbedPost.indexBadge}`}
                  />
                </div>
              </div>
            )}

            {/* Modal Footer: Prev / Next Navigation */}
            {(() => {
              const matchedModalProduct = productByPostIndex.get(activeEmbedPost.index);
              return (
                <div className="p-3 sm:p-4 bg-white border-t border-[#1a1a1a]/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleModalNavigate('prev')}
                    className="px-4 py-2 rounded-full bg-[#f0f0f0] hover:bg-[#1a1a1a] hover:text-white text-[#1a1a1a] text-[13px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-[#1a1a1ab3]">
                      Drop {activeEmbedPost.index} of 135
                    </span>
                    {matchedModalProduct && onSelectProduct && (
                      <button
                        type="button"
                        onClick={() => {
                          const p = matchedModalProduct;
                          setActiveEmbedPost(null);
                          onSelectProduct(p);
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-[#f83a3a] hover:bg-[#d62828] text-white text-[12px] font-bold transition-colors cursor-pointer shadow-sm"
                      >
                        Shop This Figure ({formatINR(matchedModalProduct.price)})
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleModalNavigate('next')}
                    className="px-4 py-2 rounded-full bg-[#f0f0f0] hover:bg-[#1a1a1a] hover:text-white text-[#1a1a1a] text-[13px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
