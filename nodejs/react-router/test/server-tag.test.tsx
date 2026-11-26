import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ServerTag,
  serverTagLoader,
  type ServerTagLoaderArgs,
  type ServerTagProps,
} from "../src";

const SCRIPT_1 = "https://one.example/a.js";
const SCRIPT_2 = "https://two.example/b.js";

let requested: URL[] = [];
let sourcesSeq = 0;

// Each test gets its own sources URL: the package cache is module-level.
function sourcesUrl(query = "") {
  sourcesSeq += 1;
  return `https://sources.example/api/vendor_scripts/t${sourcesSeq}${query}`;
}

// Server-renders one route whose loader calls serverTagLoader the way the
// README shows, and whose component is <ServerTag>.
async function render(
  pageUrl: string,
  loaderArgs: (request: Request) => ServerTagLoaderArgs,
  props: ServerTagProps = {}
) {
  const routes = [
    {
      path: "/",
      loader: ({ request }: { request: Request }) => serverTagLoader(loaderArgs(request)),
      Component: () => <ServerTag {...props} />,
    },
  ];
  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request(pageUrl));
  if (context instanceof Response) throw new Error("unexpected redirect");
  const router = createStaticRouter(handler.dataRoutes, context);
  return renderToStaticMarkup(
    <StaticRouterProvider router={router} context={context} hydrate={false} />
  );
}

beforeEach(() => {
  requested = [];
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
    const remoteUrl = sourcesUrl();
    expect(await render("http://site.com/", () => ({ remoteUrl }))).toBe(
      `<script data-cfasync="false" nowprocket="" src="${SCRIPT_1}" async=""></script>`
    );
  });

  it("prints scriptAttributes after src", async () => {
    const remoteUrl = sourcesUrl();
    expect(
      await render("http://site.com/", () => ({ remoteUrl }), {
        scriptAttributes: { "data-code": "12345678", "data-flag": true, defer: true },
      })
    ).toBe(
      `<script data-cfasync="false" nowprocket="" src="${SCRIPT_1}" async="" data-code="12345678" data-flag="" defer=""></script>`
    );
  });

  it("keeps a caller-passed data-cfasync ahead of src, once; async={false} and false drop attributes", async () => {
    const remoteUrl = sourcesUrl();
    expect(
      await render("http://site.com/", () => ({ remoteUrl }), {
        async: false,
        scriptAttributes: { "data-cfasync": "false", nowprocket: false },
      })
    ).toBe(`<script data-cfasync="false" src="${SCRIPT_1}"></script>`);
  });

  it("renders nothing for an empty list", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("[]")));
    const remoteUrl = sourcesUrl();
    expect(await render("http://site.com/", () => ({ remoteUrl }))).toBe("");
  });
});

describe("domain", () => {
  it("defaults to the host of the loader's request", async () => {
    const remoteUrl = sourcesUrl();
    await render("http://www.publisher.com:8080/", (request) => ({ remoteUrl, request }));
    expect(requested.map((u) => u.searchParams.get("domain"))).toEqual(["www.publisher.com"]);
  });

  it("sends no domain without a request or a domain (existing callers)", async () => {
    const remoteUrl = sourcesUrl();
    await render("http://site.com/", () => ({ remoteUrl }));
    expect(requested[0].searchParams.has("domain")).toBe(false);
  });

  it("uses the domain option, URL-encoded, keeping the caller's query", async () => {
    const remoteUrl = sourcesUrl("?x=1");
    await render("http://other.com/", (request) => ({ remoteUrl, request, domain: "my site.com" }));
    expect(requested[0].search).toBe("?x=1&domain=my+site.com");
  });

  it("keeps a domain already in remoteUrl", async () => {
    const remoteUrl = sourcesUrl("?domain=fixed.com");
    await render("http://other.com/", (request) => ({ remoteUrl, request }));
    expect(requested[0].searchParams.getAll("domain")).toEqual(["fixed.com"]);
  });

  it("caches per domain", async () => {
    const remoteUrl = sourcesUrl();
    await serverTagLoader({ remoteUrl, domain: "a.com" });
    await serverTagLoader({ remoteUrl, domain: "a.com" });
    await serverTagLoader({ remoteUrl, domain: "b.com" });
    expect(requested.map((u) => u.searchParams.get("domain"))).toEqual(["a.com", "b.com"]);
  });
});

describe("renderScript (backward compatible)", () => {
  it("still receives every URL as { js }", async () => {
    const remoteUrl = sourcesUrl();
    const seen: string[][] = [];
    const html = await render("http://site.com/", () => ({ remoteUrl }), {
      renderScript: ({ js }) => {
        seen.push(js);
        return js.map((src) => <script key={src} src={src} />);
      },
    });
    expect(seen).toEqual([[SCRIPT_1, SCRIPT_2]]);
    expect(html).toBe(`<script src="${SCRIPT_1}"></script><script src="${SCRIPT_2}"></script>`);
  });
});
