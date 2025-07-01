# @adunblock/server-tag-react-router

## Overview
A React Router TypeScript package that provides client-side script loading and rendering components for React Router applications. This package supports both React Router data mode and framework mode implementations.

## Tech Stack
- **Framework**: React Router 7 (Data & Framework Mode)
- **Language**: TypeScript 5
- **Runtime**: React 18/19
- **Build**: TypeScript compiler with dual CJS/ESM output

## Core Features
- Client-side script loading and rendering
- React Router loader integration
- TypeScript support with full type definitions
- Dual build output (CommonJS and ESM)
- Compatible with both data mode and framework mode

## Development Commands
```bash
# Install dependencies
npm install

# Build the package (clean + dual TS compilation)
npm run build

# Clean build directory
npm run clean

# Development server (framework mode test app)
npm run dev

# Build framework mode test app
npm run test:build

# Start framework mode test app
npm run test:start

# Run E2E tests
npm run test:e2e

# Type check
npx tsc --noEmit
```

## Key Files
- `src/ServerTag.tsx` - Main React component and loader functions
- `src/index.ts` - Package entry point with exports
- `test-app-data-mode/` - React Router data mode test application (Vite + SSR)
- `test-app-framework-mode/` - React Router framework mode test application
- `e2e/` - Playwright E2E tests
- `dist/` - Built package files (CJS + ESM)

## API Components

### Component
- `ServerTag` - Server-side React component that renders script tags

### Loader Functions
- `createServerTagLoader()` - Factory function for React Router loaders
- `serverTagLoader()` - Standalone loader function

### Types
- `ServerTagProps` - Component props interface
- `ServerTagLoaderArgs` - Loader configuration interface
- `ServerTagLoaderData` - Loader return data interface

## Usage Patterns

### Data Mode (Vite SSR)
```tsx
// Use with React Router data mode and server-side rendering
const router = createBrowserRouter([{
  path: "/",
  element: <HomePage />,
  loader: createServerTagLoader({ remoteUrl: "..." })
}]);
```

### Framework Mode (React Router 7)
```tsx
// routes/home.tsx
export const loader = createServerTagLoader({ remoteUrl: "..." });
export default function HomePage() {
  return <div><ServerTag /></div>;
}
```

## Package Information
- **Name**: @adunblock/server-tag-react-router
- **Version**: 1.0.0
- **Repository**: https://github.com/adunblock/adunblock-server-tag
- **License**: ISC

## Dependencies
- **Peer Dependencies**: React >=16.8.0, React DOM >=16.8.0, React Router DOM >=6.0.0
- **Dev Dependencies**: TypeScript 5, @types/react 19, @types/node 20

## Test Applications

### Data Mode Test App
- **Location**: `test-app-data-mode/`
- **Stack**: React 18 + React Router 7 + Vite SSR
- **Commands**: `dev`, `build`, `start`

### Framework Mode Test App  
- **Location**: `test-app-framework-mode/`
- **Stack**: React 19 + React Router 7 + Tailwind CSS
- **Commands**: `dev`, `build`, `start`, `typecheck`