# @adunblock/server-tag-react-router

A React Router component for server-side script loading and rendering designed for React Router's **data mode** and **framework mode**. This package provides secure, cached script loading with TypeScript support for server-side rendering.

## Features

- 🚀 **Strictly Server-Side**: Scripts are fetched and rendered on the server. The loader will throw an error if called on the client.
- 🔒 **Security**: Built-in URL validation (HTTP/HTTPS only)
- ⚡ **Caching**: Configurable cache interval to reduce remote requests
- 🎯 **Custom Rendering**: Override default script rendering with custom callbacks
- 📘 **TypeScript**: Full TypeScript support with proper type definitions
- ✅ **React Router Data/Framework Mode**: Built for React Router v7+ data and framework modes
- 🔄 **SSR Optimized**: Designed for server-side rendering workflows

## React Router Modes

This package is designed specifically for:
- **Data Mode**: Using `createBrowserRouter` with loaders
- **Framework Mode**: Using React Router with Vite plugin and SSR

> **Note**: This package is for **server-side rendering only**. The script loader will throw an error if it runs in the browser, and it is not suitable for pure client-side applications.

## Installation

```bash
npm install @adunblock/server-tag-react-router
```

## Usage

This component is designed to be used with a React Router setup that supports server-side rendering (SSR). This can be a framework like Next.js or Remix (via "Framework Mode") or a custom server setup (via "Data Mode").

### Data Mode with a Custom Server

Using `server-tag-react-router` in "Data Mode" requires a custom server-side rendering (SSR) setup. The `serverTagLoader` is designed to run exclusively on the server. Simply using `createBrowserRouter` in a client-only application will result in an error, as the loader would attempt to run in the browser.

As described in the [React Router Custom Server Rendering documentation](https://reactrouter.com/start/data/custom#server-rendering), a typical SSR setup involves:

1.  **On the Server:** Using `createStaticHandler` and `createStaticRouter` to handle the request and render the initial HTML.
2.  **On the Client:** Using `createBrowserRouter` to hydrate the server-rendered HTML.

Here is a conceptual example of how you would integrate `serverTagLoader`.

#### 1. Define Your Routes (Shared)

This route configuration is used by both the server and the client.

```tsx
// app/routes.tsx
import ServerTag, { serverTagLoader } from '@adunblock/server-tag-react-router';

// Your page component
function HomePage() {
  return (
    <div>
      <ServerTag />
      <h1>Home Page</h1>
    </div>
  );
}

export const routes = [
  {
    path: "/",
    element: <HomePage />,
    loader: () => serverTagLoader({
      remoteUrl: "https://your-domain.com/scripts.json",
      cacheInterval: 300 // Optional: cache for 5 minutes
    })
  }
];
```

#### 2. Create a Server Entrypoint

This file contains the server-side rendering logic, typically run in an Express or Node.js environment.

```tsx
// entry.server.tsx
import { renderToString } from 'react-dom/server';
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router-dom/server';
import { routes } from './app/routes';

export async function render(req: Request) {
  const { query, dataRoutes } = createStaticHandler(routes);
  const context = await query(req);

  if (context instanceof Response) {
    return context;
  }

  const router = createStaticRouter(dataRoutes, context);
  const html = renderToString(
    <StaticRouterProvider router={router} context={context} />
  );

  return new Response("<!DOCTYPE html>" + html, {
    status: context.statusCode,
    headers: { "Content-Type": "text/html" },
  });
}
```
*Note: A complete implementation would also need to serialize and send hydration data to the client.*

#### 3. Create a Client Entrypoint

This file hydrates the server-rendered HTML in the browser.

```tsx
// entry.client.tsx
import { hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './app/routes';

// In a full setup, you would pass hydrationData to createBrowserRouter
const router = createBrowserRouter(routes);

hydrateRoot(document.getElementById('root')!, <RouterProvider router={router} />);
```

### Framework Mode Usage (Optimal Solution)

For React Router applications using a framework with SSR (e.g., Vite's SSR plugin), `ServerTag` offers a powerful and seamless way to manage both global and per-route scripts.

Simply place the `<ServerTag />` component once in your root layout. It will automatically detect and render scripts loaded from **any active route's loader**, from the root down to the deepest child.

This allows for a flexible and optimal architecture:

- **Global Scripts**: Define a loader in your root route to load scripts needed on every page.
- **Per-Route Scripts**: Define loaders on specific routes to add scripts only for those pages.

`ServerTag` will intelligently combine scripts from all sources and render them without duplicates.

#### Example: Hybrid Approach

This example demonstrates loading a global analytics script from the root and a page-specific charting library for a dashboard page.

**1. Update Your Root Layout**

Place `<ServerTag />` in the `<head>` of your root layout. This single component will handle rendering all scripts.

```tsx
// app/root.tsx
import ServerTag, { serverTagLoader } from '@adunblock/server-tag-react-router';
import { Outlet } from 'react-router-dom';

export async function loader() {
  // Load global scripts for all pages
  return await serverTagLoader({
    remoteUrl: "https://your-domain.com/global-scripts.json",
  });
}

export default function Root() {
  return (
    <html>
      <head>
        <ServerTag />
        {/* ... other head elements */}
      </head>
      <body>
        <Outlet />
        {/* ... other body elements */}
      </body>
    </html>
  );
}
```

**2. Add a Page-Specific Loader**

In a specific route, add another loader. When combining with other page data, ensure that the object returned by `serverTagLoader` is spread into the final returned object from your loader. This makes the `js` array available at the top level of the loader data.

```tsx
// routes/dashboard.tsx
import { serverTagLoader } from '@adunblock/server-tag-react-router';

export async function loader() {
  const [scriptData, dashboardData] = await Promise.all([
    // Load scripts only for this page
    serverTagLoader({
      remoteUrl: `https://your-domain.com/dashboard-scripts.json`,
    }),
    // Load other page data
    fetch('https://api.example.com/dashboard').then(r => r.json())
  ]);

  // Spread the scriptData to make the `js` property available
  return { ...scriptData, dashboardData };
}

export default function DashboardPage() {
  // ... page component using dashboardData
  return <div>Dashboard Content</div>;
}
```

With this setup, when a user navigates to the dashboard, `<ServerTag>` (in `root.tsx`) will render both the global scripts and the dashboard-specific scripts. On any other page, it will only render the global scripts.

### Expected Remote Response Format

The remote URL should return a JSON response in this format:

```json
{
  "js": [
    "https://example.com/script1.js",
    "https://example.com/script2.js"
  ]
}
```

### Custom Script Rendering

Override the default script rendering with a custom callback:

```tsx
import ServerTag from '@adunblock/server-tag-react-router';

function MyPage() {
  return (
    <div>
      <ServerTag
        async={false}
        renderScript={({ js }) => (
          <>
            {js.map((src) => (
              <script 
                key={src}
                src={src}
                defer
                data-custom-attribute="server-loaded"
              />
            ))}
          </>
        )}
      />
      <h1>My Page Content</h1>
    </div>
  );
}
```

## API Reference

### ServerTag Component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `async` | `boolean` | `true` | Toggles the `async` attribute on the script tag. |
| `renderScript` | `function` | `undefined` | Custom script rendering function. |

### Loader Function

#### `serverTagLoader(config)`

Async function for loading scripts in React Router loaders. Works with both data mode and framework mode.

**Parameters:**
- `config.remoteUrl` (string, required): The URL to fetch script URLs from  
- `config.cacheInterval` (number, optional): Cache duration in seconds (default: 300)

**Returns:** `Promise<ServerTagLoaderData>`

**Usage Examples:**

```tsx
// Simple loader
export const loader = () => serverTagLoader({
  remoteUrl: "https://api.example.com/scripts.json"
});

// Combined with other data
export async function loader({ params }) {
  const [scripts, data] = await Promise.all([
    serverTagLoader({ 
      remoteUrl: `https://api.example.com/scripts/${params.page}.json`,
      cacheInterval: 600 
    }),
    fetch('/api/data').then(r => r.json())
  ]);
  return { scripts, data };
}
```

### Types

```typescript
interface ServerTagProps {
  async?: boolean;
  renderScript?: (jsFiles: { js: string[] }) => React.ReactNode;
}

interface ServerTagLoaderArgs {
  remoteUrl: string;
  cacheInterval?: number;
}

interface ServerTagLoaderData {
  js: string[];
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
nodejs/react-router/
├── src/
│   ├── ServerTag.tsx    # Main component and loaders
│   └── index.ts         # Package entry point
├── test-app/            # React Router test application
├── test-app/e2e/        # Playwright E2E tests
└── dist/                # Built package files
```

## Server-Side Only Design

This package is designed exclusively for server-side rendering:

- **Loaders run on the server** during route resolution
- **Components render on the server** before hydration
- **Scripts are included in the initial HTML** for optimal performance
- **No client-side fetching** or dynamic script injection

## Security

- Only HTTP and HTTPS URLs are allowed
- URL validation prevents malicious protocol usage
- Server-side execution prevents client-side script injection
- Built-in error handling for failed requests

## Browser Compatibility

This package works with all browsers supported by React 19 and React Router DOM 7+ when used in server-side rendering contexts.

## Migration from Client-Side Versions

If migrating from a client-side script loading solution:

1. Move script fetching to React Router loaders
2. Use `serverTagLoader` in your route configuration
3. Replace client-side components with this server-side `ServerTag`