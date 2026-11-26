# @adunblock/server-tag-nextjs

A Next.js React Server Component for fetching and rendering external JavaScript files on the server-side before page rendering. This package provides secure, cached script loading with TypeScript support.

## Features

- 🚀 **Server-Side Rendering**: Scripts are fetched and rendered on the server before page load
- 🔒 **Security**: Built-in URL validation (HTTP/HTTPS only)
- ⚡ **Caching**: Configurable cache interval to reduce remote requests
- 🎯 **Custom Rendering**: Override default script rendering with custom callbacks
- 📘 **TypeScript**: Full TypeScript support with proper type definitions
- ✅ **Next.js 15**: Built for Next.js 15+ with React 19 support

## Installation

```bash
npm install @adunblock/server-tag-nextjs
```

## Usage

### Basic Usage

Import and use the `ServerTag` component in your Next.js pages or layouts:

```tsx
import ServerTag from '@adunblock/server-tag-nextjs';

export default function MyPage() {
  return (
    <div>
      <ServerTag remoteUrl="https://public.adunblocker.com/api/vendor_scripts" />
      <h1>My Page Content</h1>
    </div>
  );
}
```

### Expected Remote Response Format

The remote URL should return a JSON response in this format (array directly):

```json
[
  "https://example.com/script1.js",
  "https://example.com/script2.js"
]
```

The default endpoint is `https://public.adunblocker.com/api/vendor_scripts`.

> **Note**: For backward compatibility, the package also supports the legacy format `{"js": [...]}` but the new format (array directly) is preferred.

### Advanced Usage with Custom Caching

```tsx
import ServerTag from '@adunblock/server-tag-nextjs';

export default function MyPage() {
  return (
    <div>
      <ServerTag
        remoteUrl="https://public.adunblocker.com/api/vendor_scripts"
        cacheInterval={600} // Cache for 10 minutes (default: 300 seconds)
      />
      <h1>My Page Content</h1>
    </div>
  );
}
```

### Custom Script Attributes

Pass extra attributes (including `data-*`) that should be rendered on every generated `<script>` tag:

```tsx
import ServerTag from '@adunblock/server-tag-nextjs';

export default function MyPage() {
  return (
    <ServerTag
      remoteUrl="https://public.adunblocker.com/api/vendor_scripts"
      scriptAttributes={{
        'data-code': 'abc123',
        'data-source': 'server-tag',
        defer: true,
      }}
    />
  );
}
```

Rendering rules:

- `true` → bare attribute (e.g. `defer`)
- `false` / `undefined` / `null` → omitted
- any other value → `key="value"`

Passing a `strategy` key renders the tag with `next/script`, as 1.1 did. In the App Router, `next/script` builds its tag in the browser, so the HTML has no `<script>` tag for Rocket Loader or our site verification to see.

### Custom Script Rendering

Override the default script rendering with a custom callback:

```tsx
import ServerTag from '@adunblock/server-tag-nextjs';
import Script from 'next/script';

export default function MyPage() {
  return (
    <div>
      <ServerTag
        remoteUrl="https://public.adunblocker.com/api/vendor_scripts"
        renderScript={({ js }) =>
          js.map((src) => (
            <Script 
              key={src} 
              src={src} 
              strategy="lazyOnload"
              onLoad={() => console.log(`Loaded: ${src}`)}
            />
          ))
        }
      />
      <h1>My Page Content</h1>
    </div>
  );
}
```

## The tag it prints

By default the package prints one tag, for the first URL in the response (the preferred one):

```html
<script data-cfasync="false" nowprocket src="SCRIPT_URL" async data-code="ACCOUNT_ID"></script>
```

- `data-cfasync="false"` and `nowprocket` come **before** `src`: Cloudflare Rocket Loader skips a script only when `data-cfasync="false"` precedes `src`, and `nowprocket` keeps WP Rocket's Delay JavaScript Execution off it. Pass either with `false` to drop it.
- Your attributes (`data-code` and anything else) come after `src`.
- Only the first URL is rendered: the client must load once per page, since each copy runs its own adblock detection and asks for its own proxy session. A custom renderer still receives every URL.

The default is a plain `<script>`, not `next/script`: React hoists it into `<head>`, so it still loads early.

## The site's domain

`ServerTag` sends your site's domain to the sources endpoint as `?domain=`. Without a `domain` prop it reads the request's host with `headers()` from `next/headers` (`x-forwarded-host`, else `host`), which renders the route dynamically, so each request gets the current script URL. Pass `domain` (e.g. `domain="example.com"`) to keep a route static: a static page keeps the script URL it was built with until it is rebuilt or revalidated. When an ad blocker rule targets one site, we publish a new script host for that site alone, and only a request naming the site receives it. A `domain` parameter already in your URL is kept as it is.

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `remoteUrl` | `string` | Required | The URL to fetch script URLs from |
| `domain` | `string` | the request's host | Your site's domain, sent as `?domain=` |
| `cacheInterval` | `number` | `300` | Cache duration in seconds |
| `scriptAttributes` | `ScriptAttributes` | `undefined` | Extra attributes for the generated `<script>` tag (e.g. `data-code`) |
| `renderScript` | `function` | `undefined` | Custom script rendering function |

### Types

```typescript
type ScriptAttributeValue = string | boolean | number | undefined;

interface ScriptAttributes {
  [key: string]: ScriptAttributeValue;
}

interface ServerTagProps {
  remoteUrl: string;
  domain?: string;
  cacheInterval?: number;
  scriptAttributes?: ScriptAttributes;
  renderScript?: (jsFiles: { js: string[] }) => React.ReactNode;
}
```

## Development

### Local Testing

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build the package
npm run build

# Run E2E tests
npm run test:e2e
```

### Project Structure

```
nodejs/nextjs/
├── src/
│   ├── ServerTag.tsx    # Main component
│   └── index.ts         # Package entry point
├── test-app/            # Next.js test application
├── e2e/                 # Playwright E2E tests
└── dist/                # Built package files
```

## Security

- Only HTTP and HTTPS URLs are allowed
- Server-side execution prevents client-side script injection
- URL validation prevents malicious protocol usage

## Browser Compatibility

This package works with all browsers supported by Next.js 15+ and React 19.

## License

ISC

## Repository

https://github.com/adunblock/adunblock-server-tag