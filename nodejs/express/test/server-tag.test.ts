import { createServer, request, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import express from 'express';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  serverTagMiddleware,
  generateScriptTags,
  withDomain,
  clearCache,
  getCacheSize,
} from '../src/index.js';

const SCRIPT_1 = 'https://one.example/a.js';
const SCRIPT_2 = 'https://two.example/b.js';

// A stand-in for the sources endpoint: records each query it receives.
let sources: Server;
let sourcesUrl: string;
const queries: URLSearchParams[] = [];

function listen(server: Server): Promise<string> {
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => {
      resolve(`http://127.0.0.1:${(server.address() as AddressInfo).port}`);
    });
  });
}

async function get(app: express.Express, path: string, host?: string) {
  const server = createServer(app);
  const base = await listen(server);
  try {
    // node:http, not fetch: fetch won't send a Host header of our choosing.
    return await new Promise<string>((resolve, reject) => {
      const req = request(base + path, host ? { headers: { host } } : {}, res => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', chunk => (body += chunk));
        res.on('end', () => resolve(body));
      });
      req.on('error', reject);
      req.end();
    });
  } finally {
    server.close();
  }
}

function appWith(options: Parameters<typeof serverTagMiddleware>[0]) {
  const app = express();
  app.use(serverTagMiddleware({ retries: 1, ...options }));
  app.get('/tag', (_req, res) => {
    res.type('text/plain').send(res.locals.serverTagHtml);
  });
  app.get('/page', (_req, res) => {
    res.type('html').send('<html><head></head><body></body></html>');
  });
  return app;
}

beforeAll(async () => {
  sources = createServer((req, res) => {
    queries.push(new URL(req.url!, 'http://x').searchParams);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify([SCRIPT_1, SCRIPT_2]));
  });
  sourcesUrl = (await listen(sources)) + '/api/vendor_scripts';
});

afterAll(() => {
  sources.close();
});

beforeEach(() => {
  clearCache();
  queries.length = 0;
});

describe('generateScriptTags', () => {
  it('prints data-cfasync and nowprocket before src, async after', () => {
    expect(generateScriptTags([SCRIPT_1])).toBe(
      `<script data-cfasync="false" nowprocket src="${SCRIPT_1}" async></script>`
    );
  });

  it('prints caller attributes after src', () => {
    expect(generateScriptTags([SCRIPT_1], { 'data-code': '12345678' })).toBe(
      `<script data-cfasync="false" nowprocket src="${SCRIPT_1}" async data-code="12345678"></script>`
    );
  });

  it('keeps a caller-passed data-cfasync ahead of src, once', () => {
    expect(
      generateScriptTags([SCRIPT_1], { 'data-cfasync': 'false', 'data-code': '1' })
    ).toBe(
      `<script data-cfasync="false" nowprocket src="${SCRIPT_1}" async data-code="1"></script>`
    );
  });

  it('lets a caller drop the leading defaults or async', () => {
    expect(
      generateScriptTags([SCRIPT_1], { 'data-cfasync': false, nowprocket: false, async: false })
    ).toBe(`<script src="${SCRIPT_1}"></script>`);
  });

  it('renders only the first valid URL', () => {
    expect(generateScriptTags(['javascript:alert(1)', SCRIPT_1, SCRIPT_2])).toBe(
      `<script data-cfasync="false" nowprocket src="${SCRIPT_1}" async></script>`
    );
    expect(generateScriptTags([])).toBe('');
  });
});

describe('withDomain', () => {
  it('appends the domain, URL-encoded, keeping the existing query', () => {
    expect(withDomain('https://s.example/api/vendor_scripts/v1?x=1', 'ex ample.com')).toBe(
      'https://s.example/api/vendor_scripts/v1?x=1&domain=ex+ample.com'
    );
  });

  it('leaves the URL alone without a domain or when it already has one', () => {
    expect(withDomain('https://s.example/a', undefined)).toBe('https://s.example/a');
    expect(withDomain('https://s.example/a', '')).toBe('https://s.example/a');
    expect(withDomain('https://s.example/a?domain=mine.com', 'other.com')).toBe(
      'https://s.example/a?domain=mine.com'
    );
  });
});

describe('serverTagMiddleware', () => {
  it('sends the request hostname as the domain by default', async () => {
    const html = await get(appWith({ remoteUrl: sourcesUrl, injectIntoHtml: false }), '/tag', 'www.publisher.com:8080');
    expect(queries.map(q => q.get('domain'))).toEqual(['www.publisher.com']);
    expect(html).toBe(`<script data-cfasync="false" nowprocket src="${SCRIPT_1}" async></script>`);
  });

  it('uses the domain option over the request host', async () => {
    await get(appWith({ remoteUrl: sourcesUrl, domain: 'chosen.com', injectIntoHtml: false }), '/tag', 'other.com');
    expect(queries.map(q => q.get('domain'))).toEqual(['chosen.com']);
  });

  it('keeps a domain already in remoteUrl (existing callers)', async () => {
    await get(appWith({ remoteUrl: `${sourcesUrl}?domain=fixed.com`, injectIntoHtml: false }), '/tag', 'other.com');
    expect(queries.map(q => q.getAll('domain'))).toEqual([['fixed.com']]);
  });

  it('caches per domain', async () => {
    const app = appWith({ remoteUrl: sourcesUrl, injectIntoHtml: false });
    await get(app, '/tag', 'a.com');
    await get(app, '/tag', 'a.com');
    await get(app, '/tag', 'b.com');
    expect(queries.map(q => q.get('domain'))).toEqual(['a.com', 'b.com']);
    expect(getCacheSize()).toBe(2);
  });

  it('injects the tag with scriptAttributes into HTML responses', async () => {
    const html = await get(
      appWith({ remoteUrl: sourcesUrl, scriptAttributes: { 'data-code': '12345678' } }),
      '/page',
      'publisher.com'
    );
    expect(html).toBe(
      `<html><head><script data-cfasync="false" nowprocket src="${SCRIPT_1}" async data-code="12345678"></script>\n</head><body></body></html>`
    );
  });
});
