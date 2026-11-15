import type { Product } from '../data/catalog';

const CACHE_VERSION = 'v1';
const POSTS_STORAGE_KEY = 'kage_figures_ig_posts_v3';
const LOADED_URLS_KEY = `kage_figures_ig_loaded_urls_${CACHE_VERSION}`;
const VIEW_STATE_KEY = `kage_figures_view_state_${CACHE_VERSION}`;
const CART_STORAGE_KEY = `kage_figures_cart_${CACHE_VERSION}`;

const IDB_NAME = 'kage_figures_ig_storage';
const IDB_VERSION = 1;
const IDB_STORE = 'post_media';
const CACHE_API_NAME = `kage-figures-ig-media-${CACHE_VERSION}`;
const MAX_TRACKED_URLS = 400;

interface StoredPostsPayload {
  version: string;
  signature: string;
  savedAt: number;
  posts: Product[];
}

export interface StoredCatalogViewState {
  signature: string;
  selectedCategory: string;
  priceRange: [number, number];
  visibleDesktopCount: number;
  shuffledFeaturedIds: string[];
  shuffledAllIds: string[];
  savedAt: number;
}

const memoryObjectUrls = new Map<string, string>();
const inflightRequests = new Map<string, Promise<string | null>>();
let loadedUrlSetCache: Set<string> | null = null;
let dbPromise: Promise<IDBDatabase | null> | null = null;

function canUseStorage(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function getLoadedUrlSet(): Set<string> {
  if (loadedUrlSetCache) return loadedUrlSetCache;
  const set = new Set<string>();
  if (canUseStorage()) {
    try {
      const raw = window.localStorage.getItem(LOADED_URLS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (typeof item === 'string' && item.length > 0) {
              set.add(item);
            }
          }
        }
      }
    } catch {
      // Ignore malformed storage entries
    }
  }
  loadedUrlSetCache = set;
  return set;
}

function persistLoadedUrlSet(): void {
  if (!canUseStorage() || !loadedUrlSetCache) return;
  try {
    const arr = Array.from(loadedUrlSetCache).slice(-MAX_TRACKED_URLS);
    window.localStorage.setItem(LOADED_URLS_KEY, JSON.stringify(arr));
  } catch {
    // Ignore storage quota errors on index list
  }
}

export function isInstagramMediaCached(url: string): boolean {
  if (!url) return false;
  if (memoryObjectUrls.has(url)) return true;
  return getLoadedUrlSet().has(url);
}

export function getMemoryCachedUrl(url: string): string | null {
  if (!url) return null;
  return memoryObjectUrls.get(url) ?? null;
}

export function markInstagramMediaCached(url: string): void {
  if (!url) return;
  const set = getLoadedUrlSet();
  if (!set.has(url)) {
    set.add(url);
    persistLoadedUrlSet();
  }
}

function unmarkInstagramMediaCached(url: string): void {
  if (!url) return;
  const set = getLoadedUrlSet();
  if (set.delete(url)) {
    persistLoadedUrlSet();
  }
}

function openMediaDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || typeof window.indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          const store = db.createObjectStore(IDB_STORE, { keyPath: 'url' });
          store.createIndex('savedAt', 'savedAt', { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });

  return dbPromise;
}

async function readBlobFromIdb(url: string): Promise<Blob | null> {
  const db = await openMediaDb();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(url);
      req.onsuccess = () => {
        const record = req.result as { url: string; blob?: Blob } | undefined;
        resolve(record?.blob instanceof Blob ? record.blob : null);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function pruneOldestIdbEntries(db: IDBDatabase, count = 15): Promise<void> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const index = store.index('savedAt');
      let removed = 0;
      const cursorReq = index.openCursor();
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (cursor && removed < count) {
          cursor.delete();
          removed++;
          cursor.continue();
        } else {
          resolve();
        }
      };
      cursorReq.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function writeBlobToIdb(url: string, blob: Blob): Promise<boolean> {
  const db = await openMediaDb();
  if (!db) return false;

  const attemptWrite = () =>
    new Promise<boolean>((resolve) => {
      try {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        const store = tx.objectStore(IDB_STORE);
        const req = store.put({ url, blob, savedAt: Date.now() });
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });

  const saved = await attemptWrite();
  if (saved) return true;

  await pruneOldestIdbEntries(db, 20);
  return attemptWrite();
}

async function readBlobFromCacheApi(url: string): Promise<Blob | null> {
  if (typeof window === 'undefined' || !('caches' in window)) return null;
  try {
    const cache = await window.caches.open(CACHE_API_NAME);
    const match = await cache.match(url);
    if (!match || match.type === 'opaque' || !match.ok) return null;
    return await match.blob();
  } catch {
    return null;
  }
}

async function writeResponseToCacheApi(
  url: string,
  response: Response,
): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const cache = await window.caches.open(CACHE_API_NAME);
    await cache.put(url, response);
  } catch {
    // Ignore Cache Storage quota or private-mode restrictions
  }
}

function registerMemoryBlobUrl(url: string, blob: Blob): string {
  const existing = memoryObjectUrls.get(url);
  if (existing) return existing;
  const objectUrl = URL.createObjectURL(blob);
  memoryObjectUrls.set(url, objectUrl);
  markInstagramMediaCached(url);
  return objectUrl;
}

export async function getPersistedMediaUrl(
  url: string,
): Promise<string | null> {
  if (!url) return null;

  const mem = memoryObjectUrls.get(url);
  if (mem) return mem;

  // Data URLs or inline blob URLs don't need IndexedDB lookup
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  const idbBlob = await readBlobFromIdb(url);
  if (idbBlob) {
    return registerMemoryBlobUrl(url, idbBlob);
  }

  const cacheBlob = await readBlobFromCacheApi(url);
  if (cacheBlob) {
    await writeBlobToIdb(url, cacheBlob);
    return registerMemoryBlobUrl(url, cacheBlob);
  }

  // If index thought this URL was cached but storage was cleared, clean up index
  unmarkInstagramMediaCached(url);
  return null;
}

export async function loadAndPersistMedia(url: string): Promise<string | null> {
  if (!url) return null;

  const mem = memoryObjectUrls.get(url);
  if (mem) return mem;

  const existingPromise = inflightRequests.get(url);
  if (existingPromise) return existingPromise;

  const task = (async (): Promise<string | null> => {
    try {
      const cached = await getPersistedMediaUrl(url);
      if (cached) return cached;

      const response = await fetch(url, { cache: 'force-cache' });
      if (!response.ok) return null;

      await writeResponseToCacheApi(url, response.clone());
      const blob = await response.blob();
      if (!blob || blob.size === 0) return null;

      await writeBlobToIdb(url, blob);
      return registerMemoryBlobUrl(url, blob);
    } catch {
      // Cross-origin opaque fallback so browser Cache Storage still stores it
      try {
        const opaqueRes = await fetch(url, { mode: 'no-cors' });
        await writeResponseToCacheApi(url, opaqueRes);
      } catch {
        // Ignore network errors here; <img> onError handles fallbacks
      }
      return null;
    } finally {
      inflightRequests.delete(url);
    }
  })();

  inflightRequests.set(url, task);
  return task;
}

export async function resolvePersistedMediaUrl(
  url: string,
): Promise<string | null> {
  const cached = await getPersistedMediaUrl(url);
  if (cached) return cached;
  return loadAndPersistMedia(url);
}

export function getCatalogSignature(posts: Product[]): string {
  let hash = 2166136261;
  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    const variantSig = p.variants
      .map((v) => `${v.id}:${v.label}:${v.priceDelta}`)
      .join(',');
    const token = `${p.id}|${p.price}|${p.compareAtPrice ?? ''}|${variantSig};`;
    for (let j = 0; j < token.length; j++) {
      hash ^= token.charCodeAt(j);
      hash = Math.imul(hash, 16777619);
    }
  }
  const firstId = posts[0]?.id ?? '';
  const lastId = posts[posts.length - 1]?.id ?? '';
  return `${CACHE_VERSION}:${posts.length}:${firstId}:${lastId}:${(hash >>> 0).toString(36)}`;
}

export function hydrateInstagramPosts(canonicalPosts: Product[]): Product[] {
  const signature = getCatalogSignature(canonicalPosts);
  if (!canUseStorage()) return canonicalPosts;

  try {
    const raw = window.localStorage.getItem(POSTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredPostsPayload;
      if (
        parsed &&
        parsed.version === CACHE_VERSION &&
        parsed.signature === signature &&
        Array.isArray(parsed.posts) &&
        parsed.posts.length === canonicalPosts.length
      ) {
        return parsed.posts;
      }
    }
  } catch {
    // Fall back to canonical posts and refresh storage below
  }

  try {
    const payload: StoredPostsPayload = {
      version: CACHE_VERSION,
      signature,
      savedAt: Date.now(),
      posts: canonicalPosts,
    };
    window.localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore localStorage quota overflow
  }

  return canonicalPosts;
}

function yieldToMainThread(): Promise<void> {
  return new Promise((resolve) => {
    if (
      typeof window !== 'undefined' &&
      typeof window.requestAnimationFrame === 'function'
    ) {
      window.requestAnimationFrame(() => window.setTimeout(resolve, 0));
    } else {
      setTimeout(resolve, 0);
    }
  });
}

export async function hydrateInstagramPostsAsync(
  canonicalPosts: Product[],
): Promise<Product[]> {
  await yieldToMainThread();
  return hydrateInstagramPosts(canonicalPosts);
}

export function loadCatalogViewState(
  signature: string,
): StoredCatalogViewState | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(VIEW_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCatalogViewState;
    if (!parsed || parsed.signature !== signature) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveCatalogViewState(state: StoredCatalogViewState): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(VIEW_STATE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadStoredCart<T>(): T[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredCart<T>(items: T[]): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota errors
  }
}
