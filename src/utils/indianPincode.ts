export interface PincodeDetails {
  pincode: string;
  city: string;
  state: string;
  locality: string;
  localities: string[];
  region: string;
  deliveryDays: string;
  expressEligible: boolean;
  codAvailable: boolean;
  verifiedAt: number;
}

export type PincodeLookupResult =
  | { ok: true; data: PincodeDetails }
  | {
      ok: false;
      reason: 'invalid_format' | 'not_found' | 'network_error';
      message: string;
    };

const PIN_CACHE_KEY = 'kage_figures_pincode_cache_v1';
const LAST_VERIFIED_PIN_KEY = 'kage_figures_last_verified_pin_v1';
const PIN_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const MAX_CACHED_PINS = 60;

const memoryPinCache = new Map<string, PincodeDetails>();

const METRO_DISTRICTS = new Set([
  'mumbai',
  'mumbai suburban',
  'thane',
  'pune',
  'new delhi',
  'central delhi',
  'east delhi',
  'north delhi',
  'south delhi',
  'west delhi',
  'north west delhi',
  'south west delhi',
  'south east delhi',
  'shahdara',
  'north east delhi',
  'gurugram',
  'gurgaon',
  'faridabad',
  'gautam buddha nagar',
  'noida',
  'ghaziabad',
  'bengaluru',
  'bangalore',
  'bengaluru urban',
  'hyderabad',
  'rangareddy',
  'chennai',
  'kolkata',
  'ahmedabad',
  'surat',
  'jaipur',
  'lucknow',
  'bhopal',
  'nagpur',
  'chandigarh',
  'indore',
]);

const REMOTE_STATES = new Set([
  'arunachal pradesh',
  'assam',
  'manipur',
  'meghalaya',
  'mizoram',
  'nagaland',
  'sikkim',
  'tripura',
  'jammu and kashmir',
  'ladakh',
  'andaman and nicobar islands',
  'lakshadweep',
]);

function readPinCacheMap(): Record<string, PincodeDetails> {
  try {
    const raw = window.localStorage.getItem(PIN_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writePinCacheEntry(details: PincodeDetails): void {
  memoryPinCache.set(details.pincode, details);
  try {
    const map = readPinCacheMap();
    map[details.pincode] = details;
    const entries = Object.entries(map)
      .sort((a, b) => (b[1]?.verifiedAt ?? 0) - (a[1]?.verifiedAt ?? 0))
      .slice(0, MAX_CACHED_PINS);
    window.localStorage.setItem(
      PIN_CACHE_KEY,
      JSON.stringify(Object.fromEntries(entries)),
    );
  } catch {
    // Ignore localStorage quota restrictions
  }
}

export function saveVerifiedPincode(details: PincodeDetails): void {
  writePinCacheEntry(details);
  try {
    window.localStorage.setItem(LAST_VERIFIED_PIN_KEY, JSON.stringify(details));
  } catch {
    // Ignore localStorage restrictions
  }
}

export function getLastVerifiedPincode(): PincodeDetails | null {
  try {
    const raw = window.localStorage.getItem(LAST_VERIFIED_PIN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PincodeDetails;
    if (
      parsed &&
      typeof parsed.pincode === 'string' &&
      /^[1-8][0-9]{5}$/.test(parsed.pincode) &&
      typeof parsed.city === 'string' &&
      parsed.city.length > 0 &&
      typeof parsed.state === 'string' &&
      parsed.state.length > 0
    ) {
      memoryPinCache.set(parsed.pincode, parsed);
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function isValidIndianPinSyntax(pin: string): boolean {
  const cleaned = pin.replace(/\D/g, '');
  if (!/^[1-8][0-9]{5}$/.test(cleaned)) return false;
  // Reject 6 identical digits like 111111, 444444
  if (/^(\d)\1{5}$/.test(cleaned)) return false;
  return true;
}

function computeDeliveryEstimate(city: string, state: string): {
  deliveryDays: string;
  expressEligible: boolean;
  codAvailable: boolean;
} {
  const normCity = city.trim().toLowerCase();
  const normState = state.trim().toLowerCase();

  if (normCity.includes('indore')) {
    return {
      deliveryDays: '1–2 business days',
      expressEligible: true,
      codAvailable: true,
    };
  }
  if (normState === 'madhya pradesh') {
    return {
      deliveryDays: '2–3 business days',
      expressEligible: true,
      codAvailable: true,
    };
  }
  if (REMOTE_STATES.has(normState)) {
    return {
      deliveryDays: '5–7 business days',
      expressEligible: false,
      codAvailable: true,
    };
  }
  if (METRO_DISTRICTS.has(normCity)) {
    return {
      deliveryDays: '2–4 business days',
      expressEligible: true,
      codAvailable: true,
    };
  }
  return {
    deliveryDays: '3–5 business days',
    expressEligible: false,
    codAvailable: true,
  };
}

export async function lookupIndianPincode(
  rawPin: string,
  signal?: AbortSignal,
): Promise<PincodeLookupResult> {
  const cleaned = rawPin.replace(/\D/g, '');

  if (cleaned.length !== 6) {
    return {
      ok: false,
      reason: 'invalid_format',
      message: 'Please enter a valid 6-digit Indian PIN code.',
    };
  }

  if (!isValidIndianPinSyntax(cleaned)) {
    return {
      ok: false,
      reason: 'invalid_format',
      message: `PIN ${cleaned} is not a valid Indian delivery PIN code (must start with 1–8).`,
    };
  }

  const memHit = memoryPinCache.get(cleaned);
  if (memHit && Date.now() - memHit.verifiedAt < PIN_CACHE_TTL_MS) {
    return { ok: true, data: memHit };
  }

  const storedMap = readPinCacheMap();
  const storedHit = storedMap[cleaned];
  if (storedHit && Date.now() - storedHit.verifiedAt < PIN_CACHE_TTL_MS) {
    memoryPinCache.set(cleaned, storedHit);
    return { ok: true, data: storedHit };
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 7500);
  const onExternalAbort = () => controller.abort();
  signal?.addEventListener('abort', onExternalAbort, { once: true });

  try {
    const response = await fetch(
      `https://api.postalpincode.in/pincode/${cleaned}`,
      {
        method: 'GET',
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      return {
        ok: false,
        reason: 'network_error',
        message: 'Could not reach India Post directory. Please try again.',
      };
    }

    const json = (await response.json()) as Array<{
      Status?: string;
      Message?: string;
      PostOffice?: Array<{
        Name?: string;
        District?: string;
        Block?: string;
        Division?: string;
        Region?: string;
        State?: string;
        Country?: string;
        DeliveryStatus?: string;
      }> | null;
    }>;

    const firstResult = Array.isArray(json) ? json[0] : undefined;
    const offices = Array.isArray(firstResult?.PostOffice)
      ? firstResult.PostOffice.filter(
          (po) => !po.Country || po.Country.toLowerCase() === 'india',
        )
      : [];

    if (firstResult?.Status !== 'Success' || offices.length === 0) {
      return {
        ok: false,
        reason: 'not_found',
        message: `PIN code ${cleaned} does not exist in India Post records. Please check and enter a valid Indian PIN.`,
      };
    }

    const primaryOffice =
      offices.find((po) => po.DeliveryStatus === 'Delivery') ?? offices[0];

    const city = (
      primaryOffice.District ||
      primaryOffice.Block ||
      primaryOffice.Division ||
      primaryOffice.Region ||
      ''
    ).trim();
    const state = (primaryOffice.State || '').trim();
    const locality = (primaryOffice.Name || '').trim();
    const region = (primaryOffice.Region || primaryOffice.Division || '').trim();

    if (!city || !state) {
      return {
        ok: false,
        reason: 'not_found',
        message: `Could not verify city and state for PIN ${cleaned}. Please check the code.`,
      };
    }

    const localities = Array.from(
      new Set(
        offices
          .map((po) => (po.Name || '').trim())
          .filter((n) => n.length > 0),
      ),
    ).slice(0, 8);

    const eta = computeDeliveryEstimate(city, state);
    const details: PincodeDetails = {
      pincode: cleaned,
      city,
      state,
      locality: locality || city,
      localities,
      region,
      deliveryDays: eta.deliveryDays,
      expressEligible: eta.expressEligible,
      codAvailable: eta.codAvailable,
      verifiedAt: Date.now(),
    };

    writePinCacheEntry(details);
    return { ok: true, data: details };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      if (signal?.aborted) {
        return {
          ok: false,
          reason: 'network_error',
          message: 'PIN check cancelled.',
        };
      }
      return {
        ok: false,
        reason: 'network_error',
        message: 'PIN lookup timed out. Please check your connection and try again.',
      };
    }
    return {
      ok: false,
      reason: 'network_error',
      message: 'Unable to verify PIN right now. Please check your internet and retry.',
    };
  } finally {
    window.clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onExternalAbort);
  }
}

const KEYBOARD_MASH_TOKENS = [
  'asdf',
  'qwer',
  'zxcv',
  'hjkl',
  'uiop',
  'fghj',
  'abcd',
  'wxyz',
  'qwerty',
  'asdfg',
  'zxcvb',
  'fake',
  'dummy',
  'sample',
  'testing',
  'testuser',
  'unknown',
  'anonymous',
  'noaddress',
  'random',
];

function hasGibberishToken(value: string): boolean {
  const lower = value.toLowerCase().replace(/[^a-z]/g, '');
  if (KEYBOARD_MASH_TOKENS.some((tok) => lower.includes(tok))) return true;
  return false;
}

export function validateIndianFullName(raw: string): string | null {
  const cleaned = raw.trim().replace(/\s+/g, ' ');
  if (cleaned.length < 4) {
    return 'Please enter your full name (first and last name).';
  }
  if (cleaned.length > 60) {
    return 'Name must be under 60 characters.';
  }
  if (!/^[A-Za-z][A-Za-z\s.'-]*[A-Za-z.]$/.test(cleaned)) {
    return 'Name should contain only letters and spaces (no numbers or symbols).';
  }
  const words = cleaned.split(' ').filter(Boolean);
  if (words.length < 2) {
    return 'Please enter both first and last name for courier delivery.';
  }
  const letterWords = words.map((w) => w.replace(/[^A-Za-z]/g, ''));
  if (letterWords.some((w) => w.length === 0) || letterWords.every((w) => w.length < 2)) {
    return 'Please enter a valid full name.';
  }
  if (/(.)\1{2,}/i.test(cleaned.replace(/\s+/g, ''))) {
    return 'Please enter a real name without repeated characters.';
  }
  if (hasGibberishToken(cleaned)) {
    return 'Please enter your real full name.';
  }
  for (const w of letterWords) {
    if (w.length >= 4 && !/[aeiouy]/i.test(w)) {
      return 'Please enter a valid full name.';
    }
  }
  return null;
}

export function validateIndianMobile(raw: string): {
  valid: boolean;
  normalized: string;
  error: string | null;
} {
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  if (!/^[6-9]\d{9}$/.test(digits)) {
    return {
      valid: false,
      normalized: digits,
      error: 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
    };
  }

  if (
    /^(\d)\1{9}$/.test(digits) ||
    /^(\d{2})\1{4}$/.test(digits) ||
    /(\d)\1{5,}/.test(digits) ||
    digits === '9876543210' ||
    digits === '6789012345'
  ) {
    return {
      valid: false,
      normalized: digits,
      error: 'Please enter an active mobile number (dummy sequences are not allowed).',
    };
  }

  return { valid: true, normalized: digits, error: null };
}

export function validateIndianAddress(raw: string): string | null {
  const cleaned = raw.trim().replace(/\s+/g, ' ');
  if (cleaned.length < 10) {
    return 'Enter your complete house/flat no., building, and street/locality.';
  }
  if (cleaned.length > 200) {
    return 'Shipping address must be under 200 characters.';
  }
  const lettersOnly = cleaned.replace(/[^A-Za-z]/g, '');
  if (lettersOnly.length < 6) {
    return 'Address must include street, building, or locality details.';
  }
  if (/(.)\1{3,}/i.test(cleaned.replace(/\s+/g, ''))) {
    return 'Please enter a valid address without repeated characters.';
  }
  const words = cleaned.split(' ').filter((w) => w.replace(/[^A-Za-z0-9]/g, '').length > 0);
  if (words.length < 3) {
    return 'Please include house/flat number, street, and area/landmark.';
  }
  if (hasGibberishToken(cleaned)) {
    return 'Please enter a genuine delivery address.';
  }
  const alphaWords = words.map((w) => w.replace(/[^A-Za-z]/g, ''));
  for (const w of alphaWords) {
    if (w.length >= 6 && !/[aeiouy]/i.test(w)) {
      return 'Address contains unreadable text. Please enter a valid street/area.';
    }
  }
  return null;
}
