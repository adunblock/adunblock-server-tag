import React from "react";
import { useMatches } from "react-router";

export type ScriptAttributeValue = string | boolean | number | undefined;

export interface ScriptAttributes {
  [key: string]: ScriptAttributeValue;
}

export interface ServerTagProps {
  async?: boolean;
  scriptAttributes?: ScriptAttributes;
  renderScript?: (jsFiles: { js: string[] }) => React.ReactNode;
}

export interface ServerTagLoaderData {
  js: string[];
}

export interface ServerTagLoaderArgs {
  remoteUrl: string;
  cacheInterval?: number;
  /**
   * The site's domain, sent to the sources endpoint as `?domain=` so the site
   * gets its own script list. Defaults to the host of `request`. Ignored when
   * `remoteUrl` already has a `domain` parameter.
   */
  domain?: string;
  /** The loader's `request`; its host is the default `domain`. */
  request?: Request;
}

const cache: { [url: string]: { data: { js: string[] }; timestamp: number } } =
  {};

/**
 * The cache is keyed by the full sources URL, which carries the site's domain,
 * by default taken from the request. The cap keeps a stream of made-up Host
 * headers from growing it forever.
 */
const MAX_CACHE_ENTRIES = 1000;

/**
 * Adds `?domain=<site>` to the sources URL: when a filter rule blocks our
 * script host on one site only, that site alone gets a new host, and only a
 * request naming it receives it. The URL is left as it is without a domain,
 * when it already has a `domain` parameter, or when it doesn't parse.
 */
function withDomain(remoteUrl: string, domain?: string): string {
  if (!domain) return remoteUrl;
  try {
    const url = new URL(remoteUrl);
    if (url.searchParams.has("domain")) return remoteUrl;
    url.searchParams.set("domain", domain);
    return url.toString();
  } catch {
    return remoteUrl;
  }
}

function requestHost(request?: Request): string | undefined {
  if (!request) return undefined;
  try {
    return new URL(request.url).hostname || undefined;
  } catch {
    return undefined;
  }
}

// Core loader implementation - shared between both functions
async function loadServerTagData(
  config: ServerTagLoaderArgs
): Promise<ServerTagLoaderData> {
  // Ensure this only runs on the server
  if (typeof window !== "undefined") {
    throw new Error("ServerTag loader can only be used on the server side");
  }

  const { cacheInterval = 300 } = config;
  const remoteUrl = withDomain(
    config.remoteUrl,
    config.domain !== undefined ? config.domain : requestHost(config.request)
  );
  const now = Date.now();
  const cachedData = cache[remoteUrl];

  let jsFiles: { js: string[] };

  if (cachedData && now - cachedData.timestamp < cacheInterval * 1000) {
    jsFiles = cachedData.data;
  } else {
    try {
      // Validate that remoteUrl is a full URL
      const url = new URL(remoteUrl);
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error(
          `Invalid protocol: ${url.protocol}. Only http: and https: are allowed.`
        );
      }

      const response = await fetch(remoteUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // New format: API returns array directly instead of object with js property
      if (Array.isArray(data)) {
        jsFiles = { js: data };
      } else if (data && typeof data === 'object' && Array.isArray(data.js)) {
        // Backward compatibility: handle old format
        jsFiles = { js: data.js };
      } else {
        throw new Error('Invalid response format. Expected array or object with js array.');
      }
      if (!(remoteUrl in cache)) {
        const keys = Object.keys(cache);
        if (keys.length >= MAX_CACHE_ENTRIES) delete cache[keys[0]];
      }
      cache[remoteUrl] = { data: jsFiles, timestamp: now };
    } catch (error) {
      console.error("Error fetching remote script:", error);
      jsFiles = { js: [] };
    }
  }

  return jsFiles;
}

// Server-side loader function for React Router data/framework mode
export const serverTagLoader = (
  config: ServerTagLoaderArgs
): Promise<ServerTagLoaderData> => {
  return loadServerTagData(config);
};

/**
 * Attributes printed ahead of `src`, with their default values. Cloudflare
 * Rocket Loader honours `data-cfasync="false"` only when it comes before
 * `src`; `nowprocket` keeps WP Rocket's Delay JavaScript Execution off the tag.
 * A caller can override either, or drop it with `false`.
 */
const LEADING_ATTRIBUTES: ScriptAttributes = {
  "data-cfasync": "false",
  nowprocket: true,
};

// React renders these from a boolean; any other attribute needs a string.
const BOOLEAN_ATTRIBUTES = new Set(["async", "defer", "noModule"]);

function toReactProps(attrs: ScriptAttributes) {
  const props: { [key: string]: string | number | boolean } = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value === undefined || value === null) continue;
    props[key] = value === true && !BOOLEAN_ATTRIBUTES.has(key) ? "" : value;
  }
  return props;
}

// Server-side component for React Router data/framework mode.
//
// The default renders one tag, for the first URL (the preferred one):
// `<script data-cfasync="false" nowprocket="" src="URL" async="" ...scriptAttributes>`.
// The client must load once per page, since each copy runs its own adblock
// detection and asks for its own proxy session. renderScript still gets every URL.
export const ServerTag: React.FC<ServerTagProps> = ({
  renderScript,
  async = true,
  scriptAttributes,
}) => {
  const matches = useMatches();

  const allScripts = matches.flatMap((match) => {
    // The data type from `useMatches` can be anything, so we cast and check
    const data = match.data as ServerTagLoaderData;

    // The loader data for this route might not have scripts, so we check.
    if (data && Array.isArray(data.js)) {
      return data.js;
    }

    return [];
  });

  const uniqueScripts = [...new Set(allScripts)];
  const jsFiles = { js: uniqueScripts };

  if (jsFiles.js.length === 0) {
    return null;
  }

  if (renderScript) {
    return <>{renderScript(jsFiles)}</>;
  }

  const leading: ScriptAttributes = { ...LEADING_ATTRIBUTES };
  const trailing: ScriptAttributes = { async };
  for (const [key, value] of Object.entries(scriptAttributes ?? {})) {
    if (key in LEADING_ATTRIBUTES) leading[key] = value;
    else trailing[key] = value;
  }
  // Object key order is the attribute order React prints.
  const props = {
    ...toReactProps(leading),
    src: jsFiles.js[0],
    ...toReactProps(trailing),
  };
  return <script {...props} />;
};
