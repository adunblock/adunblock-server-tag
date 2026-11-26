"use server";
import React from "react";
import Script from "next/script";
import { headers } from "next/headers";

export type ScriptAttributeValue = string | boolean | number | undefined;

export interface ScriptAttributes {
  [key: string]: ScriptAttributeValue;
}

export interface ServerTagProps {
  remoteUrl: string;
  /**
   * The site's domain, sent to the sources endpoint as `?domain=` so the site
   * gets its own script list. Defaults to the request's host, read with
   * `headers()`, which renders the route dynamically; pass `domain` to keep a
   * route static. Ignored when `remoteUrl` already has a `domain` parameter.
   */
  domain?: string;
  cacheInterval?: number;
  scriptAttributes?: ScriptAttributes;
  renderScript?: (jsFiles: { js: string[] }) => React.ReactNode;
}

const cache: { [url: string]: { data: { js: string[] }; timestamp: number } } =
  {};

/**
 * The cache is keyed by the full sources URL, which carries the site's domain,
 * by default taken from the request's Host header. The cap keeps a stream of
 * made-up Host headers from growing it forever.
 */
const MAX_CACHE_ENTRIES = 1000;

/**
 * Adds `?domain=<site>` to the sources URL: when a filter rule blocks our
 * script host on one site only, that site alone gets a new host, and only a
 * request naming it receives it. The URL is left as it is without a domain,
 * when it already has a `domain` parameter, or when it doesn't parse.
 *
 * Not exported: every export of a "use server" file becomes a server action.
 */
function withDomain(remoteUrl: string, domain?: string | null): string {
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

async function requestHost(): Promise<string | undefined> {
  // `await` covers both Next 15 (a promise) and Next 13/14 (the headers).
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  return host?.split(",")[0].trim() || undefined;
}

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

/**
 * The default tag:
 * `<script data-cfasync="false" nowprocket="" src="URL" async="" ...scriptAttributes>`.
 *
 * A plain `<script>`, not `next/script`: in the App Router, `next/script`
 * with `beforeInteractive` prints no script tag, only an inline
 * `self.__next_s.push(...)` call from which the client builds one, so neither
 * Rocket Loader nor our site verification (which looks for
 * `data-code="ACCOUNT_ID"` in the HTML) can see its attributes. React hoists
 * an async script into `<head>`, so it still loads early.
 */
function DefaultScript({
  src,
  scriptAttributes = {},
}: {
  src: string;
  scriptAttributes?: ScriptAttributes;
}) {
  // A caller that chose a next/script strategy keeps next/script.
  if (scriptAttributes.strategy !== undefined) {
    return <Script src={src} {...(scriptAttributes as any)} />;
  }
  const leading: ScriptAttributes = { ...LEADING_ATTRIBUTES };
  const trailing: ScriptAttributes = { async: true };
  for (const [key, value] of Object.entries(scriptAttributes)) {
    if (key in LEADING_ATTRIBUTES) leading[key] = value;
    else trailing[key] = value;
  }
  // Object key order is the attribute order React prints.
  const props = {
    ...toReactProps(leading),
    src,
    ...toReactProps(trailing),
  };
  return <script {...props} />;
}

const ServerTag = async ({
  remoteUrl,
  domain,
  cacheInterval = 300,
  scriptAttributes,
  renderScript,
}: ServerTagProps) => {
  // Ensure this only runs on the server
  if (typeof window !== "undefined") {
    throw new Error("ServerTag can only be used on the server side");
  }
  const sourcesUrl = withDomain(
    remoteUrl,
    domain !== undefined ? domain : await requestHost()
  );
  const now = Date.now();
  const cachedData = cache[sourcesUrl];

  let jsFiles: { js: string[] };

  if (cachedData && now - cachedData.timestamp < cacheInterval * 1000) {
    jsFiles = cachedData.data;
  } else {
    try {
      // Validate that remoteUrl is a full URL
      const url = new URL(sourcesUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error(`Invalid protocol: ${url.protocol}. Only http: and https: are allowed.`);
      }

      const response = await fetch(sourcesUrl);
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
      if (!(sourcesUrl in cache)) {
        const keys = Object.keys(cache);
        if (keys.length >= MAX_CACHE_ENTRIES) delete cache[keys[0]];
      }
      cache[sourcesUrl] = { data: jsFiles, timestamp: now };
    } catch (error) {
      console.error("Error fetching remote script:", error);
      jsFiles = { js: [] };
    }
  }

  // The default renders only the first URL, the preferred one: the client
  // must load once per page, since each copy runs its own adblock detection
  // and asks for its own proxy session. renderScript still gets every URL.
  const first = jsFiles.js?.[0];
  return (
    <>
      {renderScript
        ? renderScript(jsFiles)
        : first && <DefaultScript src={first} scriptAttributes={scriptAttributes} />}
    </>
  );
};

export default ServerTag;
