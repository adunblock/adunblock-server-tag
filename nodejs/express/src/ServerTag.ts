import fetch from 'node-fetch';
import type {
  ServerTagConfig,
  ScriptDataResponse,
  CacheEntry,
  FetchOptions,
  ScriptAttributes,
  GenerateScriptTagsFunction,
  GetScriptsFunction,
} from './types.js';
import { NetworkError, ValidationError, TimeoutError } from './types.js';

/**
 * In-memory cache for script URLs
 */
const cache = new Map<string, CacheEntry>();

/**
 * The cache is keyed by the full sources URL, and the URL carries the site's
 * domain, which by default comes from the request's Host header. Capping the
 * entry count keeps a stream of made-up Host headers from growing it forever.
 */
const MAX_CACHE_ENTRIES = 1000;

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<ServerTagConfig> = {
  cacheInterval: 300, // 5 minutes
  timeout: 5000, // 5 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
};

/**
 * Validates a URL to ensure it uses HTTP or HTTPS protocol
 */
function validateUrl(url: string): void {
  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new ValidationError(
        `Invalid protocol: ${parsedUrl.protocol}. Only http: and https: are allowed.`
      );
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError(`Invalid URL: ${url}. ${(error as Error).message}`);
  }
}

/**
 * Adds `?domain=<site>` to the sources URL, so the response is the list for
 * this site: when a filter rule blocks our script host on one site only, that
 * site alone gets a new host, and only a request naming it receives it.
 *
 * The URL is left as it is when no domain is given, when it already carries a
 * `domain` parameter (the caller chose one), or when it doesn't parse (the
 * fetch then fails validation as before).
 */
export function withDomain(remoteUrl: string, domain?: string | null): string {
  if (!domain) return remoteUrl;
  try {
    const url = new URL(remoteUrl);
    if (url.searchParams.has('domain')) return remoteUrl;
    url.searchParams.set('domain', domain);
    return url.toString();
  } catch {
    return remoteUrl;
  }
}

/**
 * Fetches script URLs from a remote endpoint with retry logic
 */
async function fetchScripts(
  remoteUrl: string,
  options: FetchOptions = {}
): Promise<ScriptDataResponse> {
  const { timeout, retries, retryDelay, headers = {} } = {
    ...DEFAULT_CONFIG,
    ...options,
  };

  validateUrl(remoteUrl);

  let lastError: Error;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(remoteUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ServerTag/1.0.0',
          ...headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new NetworkError(
          `HTTP error! status: ${response.status}`,
          remoteUrl
        );
      }

      const data = await response.json() as unknown;

      // Validate response structure - new format is array directly
      if (!Array.isArray(data)) {
        throw new ValidationError('Invalid response format. Expected JSON array.');
      }

      // Validate that all entries are strings
      const jsArray = data as unknown[];
      if (!jsArray.every(item => typeof item === 'string')) {
        throw new ValidationError('Invalid response format. All array entries must be strings.');
      }

      return { js: jsArray as string[] };

    } catch (error) {
      lastError = error as Error;

      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new TimeoutError(`Request timeout after ${timeout}ms`);
      }

      if (attempt < retries - 1) {
        console.warn(
          `ServerTag: Attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`,
          lastError.message
        );
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  throw new NetworkError(
    `Failed to fetch scripts after ${retries} attempts: ${lastError!.message}`,
    remoteUrl
  );
}

/**
 * Gets cached scripts or fetches them if not cached or expired
 */
export const getScripts: GetScriptsFunction = async (
  remoteUrl: string,
  config: ServerTagConfig = {}
): Promise<ScriptDataResponse> => {
  const { cacheInterval } = { ...DEFAULT_CONFIG, ...config };
  const now = Date.now();
  const cacheKey = remoteUrl;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && (now - cached.timestamp) < (cacheInterval * 1000)) {
    return cached.data;
  }

  try {
    // Fetch fresh data
    const data = await fetchScripts(remoteUrl, config);

    // Update cache, evicting the oldest entry once it is full
    if (!cache.has(cacheKey) && cache.size >= MAX_CACHE_ENTRIES) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
    cache.set(cacheKey, {
      data,
      timestamp: now,
    });

    return data;

  } catch (error) {
    console.error('ServerTag: Error fetching scripts:', (error as Error).message);

    // Return cached data if available, even if expired
    if (cached) {
      console.warn('ServerTag: Using expired cached data due to fetch error');
      return cached.data;
    }

    // Return empty array as fallback
    return { js: [] };
  }
};

/**
 * Attributes printed ahead of `src`, with their default values. Cloudflare
 * Rocket Loader honours `data-cfasync="false"` only when it comes before
 * `src`; `nowprocket` keeps WP Rocket's Delay JavaScript Execution off the tag.
 * A caller can still override either, or drop it with `false`.
 */
const LEADING_ATTRIBUTES: ScriptAttributes = {
  'data-cfasync': 'false',
  nowprocket: true,
};

function renderAttributes(attrs: ScriptAttributes): string {
  return Object.entries(attrs)
    .map(([key, value]) => {
      if (value === true) return key;
      if (value === false || value === undefined || value === null) return '';
      return `${key}="${String(value).replace(/"/g, '&quot;')}"`;
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * Generates the script tag for the first valid URL in the list, the preferred
 * one. The list is ordered most preferred first, and the client must load only
 * once per page: each copy runs its own adblock detection and asks for its own
 * proxy session.
 *
 * Output: `<script data-cfasync="false" nowprocket src="URL" async ...attributes></script>`
 */
export const generateScriptTags: GenerateScriptTagsFunction = (
  scriptUrls: string[],
  attributes: ScriptAttributes = {}
): string => {
  if (!Array.isArray(scriptUrls) || scriptUrls.length === 0) {
    return '';
  }

  const url = scriptUrls.find(candidate => {
    try {
      validateUrl(candidate);
      return true;
    } catch {
      console.warn(`ServerTag: Skipping invalid script URL: ${candidate}`);
      return false;
    }
  });
  if (!url) return '';

  const leading: ScriptAttributes = { ...LEADING_ATTRIBUTES };
  const trailing: ScriptAttributes = { async: true };
  for (const [key, value] of Object.entries(attributes)) {
    if (key in LEADING_ATTRIBUTES) leading[key] = value;
    else trailing[key] = value;
  }

  const before = renderAttributes(leading);
  const after = renderAttributes(trailing);
  return `<script${before ? ' ' + before : ''} src="${url.replace(/"/g, '&quot;')}"${after ? ' ' + after : ''}></script>`;
};

/**
 * Clears the cache (useful for testing)
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Gets current cache size
 */
export function getCacheSize(): number {
  return cache.size;
}

/**
 * Gets cache entries (useful for debugging)
 */
export function getCacheEntries(): Array<[string, CacheEntry]> {
  return Array.from(cache.entries());
}

/**
 * Manually sets cache entry (useful for testing)
 */
export function setCacheEntry(url: string, data: ScriptDataResponse): void {
  cache.set(url, {
    data,
    timestamp: Date.now(),
  });
} 