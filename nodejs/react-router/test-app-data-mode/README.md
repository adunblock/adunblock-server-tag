# React Router Data Mode SSR Test App

This is a test application demonstrating React Router's **Data Mode** with server-side rendering (SSR). It integrates the ServerTag component for loading external scripts.

## Features

- 🚀 **Server-Side Rendering**: Complete SSR implementation with hydration
- 🔧 **Data Mode**: Uses `createStaticHandler` and `createBrowserRouter` 
- 📦 **ServerTag Integration**: Loads scripts from `https://public.adunblocker.com/api/vendor_scripts`
- 🎯 **Route-based Data Loading**: Each route can have its own loader
- ⚡ **Script Caching**: ServerTag caches scripts for 5 minutes
- 🎨 **Custom Server**: Full control over server and bundler setup

## Architecture

### Server Side (server.js)
- Uses `createStaticHandler` to handle routing
- Uses `createStaticRouter` for SSR
- Renders components with `StaticRouterProvider`
- Embeds hydration data in HTML

### Client Side (client.js)
- Uses `createBrowserRouter` for hydration
- Picks up server-rendered HTML
- Continues routing on client side

### Routes (routes.js)
- Shared configuration between server and client
- Root route loads global scripts via ServerTag
- Child routes can have their own loaders

## Getting Started

### Install Dependencies
```bash
npm install
```

### Development Mode
```bash
npm run dev
```
The app will be available at http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

## ServerTag Integration

The ServerTag component is integrated in the Root component (`components/Root.jsx`) and loads scripts from the remote URL specified in the root route loader.

The scripts are:
1. Fetched server-side during route loading
2. Cached for 5 minutes to reduce requests
3. Rendered in the HTML `<head>` section
4. Available immediately when the page loads

## Route Structure

```
/               # Home page with ServerTag demo
/about          # About page with loader data example
```

## Technical Details

- **React Router**: v7.6.3+ (Data Mode)
- **Server**: Node.js HTTP server
- **Bundler**: Vite
- **SSR**: Full server-side rendering with hydration
- **Scripts**: Loaded via ServerTag from remote JSON endpoint

## Comparison with Framework Mode

Unlike Framework Mode (which uses `@react-router/dev`), Data Mode gives you:
- Full control over your server setup
- Custom bundler configuration
- Flexible deployment options
- Integration with existing server infrastructure 