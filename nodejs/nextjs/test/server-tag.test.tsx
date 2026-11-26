import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const requestHeaders = new Headers();
vi.mock("next/headers", () => ({
  headers: async () => requestHeaders,
}));

const { default: ServerTag } = await import("../src/ServerTag");

const SCRIPT_1 = "https://one.example/a.js";
const SCRIPT_2 = "https://two.example/b.js";

let requested: URL[] = [];
let sourcesSeq = 0;

// Each test gets its own sources URL: the package cache is module-level.
function sourcesUrl(query = "") {
  sourcesSeq += 1;
  return `https://sources.example/api/vendor_scripts/t${sourcesSeq}${query}`;
}

async function render(props: React.ComponentProps<typeof ServerTag>) {
  return renderToStaticMarkup(await ServerTag(props));
}

beforeEach(() => {
  requested = [];
  for (const key of [...requestHeaders.keys()]) requestHeaders.delete(key);
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      requested.push(new URL(url));
      return new Response(JSON.stringify([SCRIPT_1, SCRIPT_2]));
    })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("default tag", () => {
  it("prints data-cfasync and nowprocket before src, async after, first URL only", async () => {
    expect(await render({ remoteUrl: sourcesUrl(), domain: "" })).toBe(
      `<script data-cfasync="false" nowprocket="" src="${SCRIPT_1}" async=""></script>`
    );
  });

  it("prints scriptAttributes after src", async () => {
    expect(
      await render({
        remoteUrl: sourcesUrl(),
        domain: "",
        scriptAttributes: { "data-code": "12345678", "data-flag": true, defer: true },
      })
    ).toBe(
      `<script data-cfasync="false" nowprocket="" src="${SCRIPT_1}" async="" data-code="12345678" data-flag="" defer=""></script>`
    );
  });

  it("keeps a caller-passed data-cfasync ahead of src, once, and lets defaults be dropped", async () => {
    expect(
      await render({
        remoteUrl: sourcesUrl(),
        domain: "",
        scriptAttributes: { "data-cfasync": "false", nowprocket: false, async: false },
      })
    ).toBe(`<script data-cfasync="false" src="${SCRIPT_1}"></script>`);
  });

  it("renders nothing for an empty list", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("[]")));
    expect(await render({ remoteUrl: sourcesUrl(), domain: "" })).toBe("");
  });
});

describe("domain", () => {
  it("defaults to the request host", async () => {
    requestHeaders.set("host", "www.publisher.com");
    await render({ remoteUrl: sourcesUrl() });
    expect(requested.map((u) => u.searchParams.get("domain"))).toEqual(["www.publisher.com"]);
  });

  it("prefers x-forwarded-host", async () => {
    requestHeaders.set("host", "internal:3000");
    requestHeaders.set("x-forwarded-host", "publisher.com, proxy.internal");
    await render({ remoteUrl: sourcesUrl() });
    expect(requested.map((u) => u.searchParams.get("domain"))).toEqual(["publisher.com"]);
  });

  it("uses the domain prop, URL-encoded, keeping the caller's query", async () => {
    requestHeaders.set("host", "other.com");
    await render({ remoteUrl: sourcesUrl("?x=1"), domain: "my site.com" });
    expect(requested[0].search).toBe("?x=1&domain=my+site.com");
  });

  it("keeps a domain already in remoteUrl (existing callers)", async () => {
    requestHeaders.set("host", "other.com");
    await render({ remoteUrl: sourcesUrl("?domain=fixed.com") });
    expect(requested[0].searchParams.getAll("domain")).toEqual(["fixed.com"]);
  });

  it("caches per domain", async () => {
    const remoteUrl = sourcesUrl();
    await render({ remoteUrl, domain: "a.com" });
    await render({ remoteUrl, domain: "a.com" });
    await render({ remoteUrl, domain: "b.com" });
    expect(requested.map((u) => u.searchParams.get("domain"))).toEqual(["a.com", "b.com"]);
  });
});

describe("renderScript (backward compatible)", () => {
  it("still receives every URL as { js }", async () => {
    const seen: string[][] = [];
    const html = await render({
      remoteUrl: sourcesUrl(),
      domain: "",
      renderScript: ({ js }) => {
        seen.push(js);
        return js.map((src) => <script key={src} src={src} />);
      },
    });
    expect(seen).toEqual([[SCRIPT_1, SCRIPT_2]]);
    expect(html).toBe(`<script src="${SCRIPT_1}"></script><script src="${SCRIPT_2}"></script>`);
  });
});
