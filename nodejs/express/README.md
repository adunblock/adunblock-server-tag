# @adunblock/server-tag-express

A powerful Express middleware for server-side script loading and injection. Load external scripts from remote JSON endpoints with caching, security, and flexible integration options. Built with TypeScript for full type safety.

## Features

- 🚀 **Server-Side Script Loading**: Fetch and inject scripts on the server, not the client
- ⚡ **Smart Caching**: Configurable cache intervals with automatic expiration
- 🛡️ **Security**: URL validation prevents malicious script injection
- 🎨 **Flexible Integration**: Multiple injection methods (auto, manual, templates)
- 🔧 **Error Handling**: Graceful fallbacks and custom error handlers
- 📊 **Template Support**: Works with EJS, Handlebars, Pug, and more
- 🎪 **Easy Setup**: Simple middleware integration with any Express app
- 💎 **TypeScript**: Full type safety with comprehensive type definitions
- ⚡ **Modern Build**: Vite-powered build system with ES modules and CommonJS support

## Installation

```bash
npm install @adunblock/server-tag-express
```

## Quick Start

```typescript
import express from 'express';
import { serverTagMiddleware } from '@adunblock/server-tag-express';

const app = express();

// Add ServerTag middleware with TypeScript support
app.use(serverTagMiddleware({
  remoteUrl: 'https://public.adunblocker.com/api/vendor_scripts'
}));

// Your routes will now have access to script data
app.get('/', (req, res) => {
  // Scripts available in res.locals.serverTagScripts (fully typed!)
  res.send(`
    <html>
      <head>
        ${res.locals.serverTagHtml}
      </head>
      <body>
        <h1>Hello World!</h1>
      </body>
    </html>
  `);
});

app.listen(3000);
```

## TypeScript Support

This package is written in TypeScript and provides comprehensive type definitions:

```typescript
import type { 
  ServerTagMiddlewareOptions,
  ScriptAttributes,
  ServerTagConfig 
} from '@adunblock/server-tag-express';

const config: ServerTagMiddlewareOptions = {
  remoteUrl: 'https://public.adunblocker.com/api/vendor_scripts',
  cacheInterval: 300,
  scriptAttributes: {
    async: true,
    defer: false
  }
};

app.use(serverTagMiddleware(config));
```

## Expected Remote Response Format

Your remote URL should return JSON in this format (array directly):

```json
[
  "https://example.com/script1.js",
  "https://example.com/script2.js"
]
```

The default endpoint is `https://public.adunblocker.com/api/vendor_scripts`.

> **Note**: For backward compatibility, the package also supports the legacy format `{"js": [...]}` but the new format (array directly) is preferred.

## Integration Methods

### 1. Template Integration (Recommended)

Use with any template engine (EJS, Handlebars, Pug, etc.):

```html
<!-- EJS Example -->
<head>
  <title>My App</title>
  <%- serverTagHtml %>
</head>

<!-- Handlebars Example -->
<head>
  <title>My App</title>
  {{{serverTagHtml}}}
</head>

<!-- Pug Example -->
head
  title My App
  != serverTagHtml
```

### 2. Auto Injection

Automatically inject scripts into HTML responses:

```typescript
app.use(serverTagMiddleware({
  remoteUrl: 'https://public.adunblocker.com/api/vendor_scripts',
  injectIntoHtml: true,
  injectPosition: '</head>', // Where to inject
  scriptAttributes: { async: true } // Script tag attributes
}));
```

### 3. Manual Injection

Programmatically inject scripts into HTML strings:

```typescript
import { injectScripts } from '@adunblock/server-tag-express';

app.get('/page', (req, res) => {
  let html = '<html><head></head><body>Content</body></html>';
  
  // Inject scripts manually (fully typed)
  html = injectScripts(html, res.locals.serverTagScripts || []);
  
  res.send(html);
});
```

### 4. Direct Access

Access script data directly for custom implementations:

```typescript
app.get('/custom', (req, res) => {
  const scripts: string[] = res.locals.serverTagScripts || [];
  
  // Custom script rendering with type safety
  const scriptTags = scripts.map(url => 
    `<script src="${url}" async></script>`
  ).join('\n');
  
  res.send(`<html><head>${scriptTags}</head>...</html>`);
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `remoteUrl` | `string` | **Required** | URL to fetch script configuration from |
| `cacheInterval` | `number` | `300` | Cache duration in seconds |
| `injectIntoHtml` | `boolean` | `true` | Auto-inject scripts into HTML responses |
| `injectPosition` | `string` | `'</head>'` | Where to inject scripts in HTML |
| `scriptAttributes` | `ScriptAttributes` | `{async: true}` | Additional attributes for script tags |
| `onError` | `function` | `undefined` | Custom error handler function |
| `shouldInject` | `function` | `() => true` | Conditional injection logic |

### Advanced Configuration

```typescript
import type { ServerTagMiddlewareOptions } from '@adunblock/server-tag-express';

const config: ServerTagMiddlewareOptions = {
  remoteUrl: 'https://public.adunblocker.com/api/vendor_scripts',
  cacheInterval: 600, // 10 minutes
  injectIntoHtml: true,
  injectPosition: '</head>',
  scriptAttributes: { 
    defer: true,
    'data-source': 'server-tag' 
  },
  shouldInject: (req, res) => {
    // Don't inject scripts on API routes
    return !req.path.startsWith('/api/');
  },
  onError: (error, req, res) => {
    console.error('ServerTag error:', error.message);
    // Optional: send error to monitoring service
  }
};

app.use(serverTagMiddleware(config));
```

## Type Definitions

### Core Types

```typescript
interface ServerTagConfig {
  cacheInterval?: number;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface ScriptAttributes {
  async?: boolean;
  defer?: boolean;
  type?: string;
  [key: string]: string | boolean | number | undefined;
}

interface ServerTagMiddlewareOptions extends ServerTagConfig {
  remoteUrl: string;
  injectIntoHtml?: boolean;
  injectPosition?: string;
  scriptAttributes?: ScriptAttributes;
  onError?: (error: Error, req: Request, res: Response) => void;
  shouldInject?: (req: Request, res: Response) => boolean;
}
```

### Error Types

```typescript
class ServerTagError extends Error {
  constructor(message: string, code?: string, statusCode?: number);
}

class NetworkError extends ServerTagError {
  constructor(message: string, url: string);
}

class ValidationError extends ServerTagError {
  constructor(message: string);
}

class TimeoutError extends ServerTagError {
  constructor(message: string);
}
```

## Route-Specific Configuration

Apply ServerTag to specific routes with different configurations:

```typescript
// Global middleware
app.use(serverTagMiddleware({
  remoteUrl: 'https://public.adunblocker.com/api/vendor_scripts'
}));

// Route-specific middleware
app.get('/special', 
  serverTagMiddleware({
    remoteUrl: 'https://public.adunblocker.com/api/vendor_scripts',
    cacheInterval: 60, // 1 minute cache
    scriptAttributes: { defer: true }
  }),
  (req, res) => {
    res.render('special-page');
  }
);
```

## Template Engine Examples

### EJS

```html
<!DOCTYPE html>
<html>
<head>
  <title><%= title %></title>
  <%- serverTagHtml %>
</head>
<body>
  <h1><%= title %></h1>
</body>
</html>
```

### Handlebars

```html
<!DOCTYPE html>
<html>
<head>
  <title>{{title}}</title>
  {{{serverTagHtml}}}
</head>
<body>
  <h1>{{title}}</h1>
</body>
</html>
```

### Pug

```pug
doctype html
html
  head
    title= title
    != serverTagHtml
```

## API Reference

### `serverTagMiddleware(options)`

Main middleware function that adds ServerTag functionality to Express apps.

**Parameters:**
- `options` (ServerTagMiddlewareOptions): Configuration options

**Returns:** Express middleware function

### `injectScripts(html, scripts, attributes, position)`

Helper function to manually inject scripts into HTML strings.

**Parameters:**
- `html` (string): HTML string to modify
- `scripts` (string[]): Array of script URLs
- `attributes` (ScriptAttributes): Script tag attributes
- `position` (string): Where to inject (default: `'</head>'`)

**Returns:** Modified HTML string

### `renderServerTags(res, attributes)`

Template helper function for rendering script tags.

**Parameters:**
- `res` (Response): Express response object
- `attributes` (ScriptAttributes): Script tag attributes

**Returns:** HTML string with script tags

### `getScripts(remoteUrl, config)`

Low-level function to fetch scripts from remote URL.

**Parameters:**
- `remoteUrl` (string): URL to fetch from
- `config` (ServerTagConfig): Configuration options

**Returns:** Promise resolving to `{js: string[]}`

### `generateScriptTags(scriptUrls, attributes)`

Generate HTML script tags from URLs.

**Parameters:**
- `scriptUrls` (string[]): Array of script URLs
- `attributes` (ScriptAttributes): Script tag attributes

**Returns:** HTML string with script tags

## Error Handling

ServerTag includes robust error handling with custom error types:

```typescript
import { 
  ServerTagError, 
  NetworkError, 
  ValidationError, 
  TimeoutError 
} from '@adunblock/server-tag-express';

app.use(serverTagMiddleware({
  remoteUrl: 'https://public.adunblocker.com/api/vendor_scripts',
  onError: (error, req, res) => {
    if (error instanceof NetworkError) {
      console.error('Network error:', error.message, 'URL:', error.url);
    } else if (error instanceof ValidationError) {
      console.error('Validation error:', error.message);
    } else if (error instanceof TimeoutError) {
      console.error('Timeout error:', error.message);
    }
    
    // Scripts will be empty array on error
    console.log('Scripts loaded:', res.locals.serverTagScripts?.length || 0);
  }
}));
```

## Development

### Building from Source

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Watch for changes
npm run watch

# Type checking
npm run type-check
```

### Running the Test App

```bash
# Start the TypeScript test app
npm run dev

# Visit http://localhost:3001
```

### Project Structure

```
nodejs/express/
├── src/
│   ├── index.ts         # Main exports
│   ├── middleware.ts    # Express middleware
│   ├── ServerTag.ts     # Core functionality
│   └── types.ts         # TypeScript types
├── test-app/           # Demo application
│   ├── server.ts       # TypeScript Express server
│   ├── views/          # EJS templates
│   └── package.json    # Test app dependencies
├── dist/               # Built package files
├── tsconfig.json       # TypeScript config
├── vite.config.ts      # Vite build config
└── README.md           # This file
```

## Testing

The test application demonstrates all integration patterns with TypeScript:

- **Template Integration**: EJS templates with helper functions
- **Auto Injection**: Automatic script injection
- **Manual Injection**: Programmatic script injection
- **API Access**: JSON endpoints for script data
- **Type Safety**: Full TypeScript integration

## Browser Compatibility

ServerTag works with all browsers supported by the generated script tags. The middleware itself runs on Node.js 16+.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License - see LICENSE file for details.

## Related Packages

- [`@adunblock/server-tag-nextjs`](../nextjs/) - Next.js integration
- [`@adunblock/server-tag-react-router`](../react-router/) - React Router integration 