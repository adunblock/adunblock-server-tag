# Express ServerTag - TypeScript Development Guide

## Overview

The Express ServerTag middleware has been converted to TypeScript with a modern Vite build system. This provides full type safety, IntelliSense support, and a robust development experience.

## Architecture

### TypeScript Structure

```
src/
├── index.ts         # Main exports and module entry point
├── middleware.ts    # Express middleware functions
├── ServerTag.ts     # Core functionality (fetching, caching, validation)
├── types.ts         # TypeScript type definitions
```

### Build System

- **Vite**: Modern build tool with fast HMR and optimized bundling
- **TypeScript 5.3**: Latest TypeScript with strict type checking
- **Dual Output**: Both ES modules (.mjs) and CommonJS (.js) builds
- **Type Declarations**: Auto-generated .d.ts files with source maps

## Key Features

### Type Safety

- Full TypeScript coverage with strict mode enabled
- Comprehensive type definitions for all APIs
- Generic types for enhanced type inference
- Runtime type validation for external data

### Modern Development

- Vite-powered build system for fast compilation
- Watch mode for development
- Source maps for debugging
- ESLint and TypeScript compiler integration

### Error Handling

Custom error classes with full type support:

```typescript
class ServerTagError extends Error
class NetworkError extends ServerTagError
class ValidationError extends ServerTagError  
class TimeoutError extends ServerTagError
```

## Development Workflow

### Setup

```bash
# Install dependencies
npm install

# Start development with watch mode
npm run watch

# Type checking only
npm run type-check
```

### Building

```bash
# Full build (types + bundle)
npm run build

# Clean build artifacts
npm run clean
```

### Testing

```bash
# Start test app with TypeScript
npm run dev

# Test app runs on http://localhost:3001
```

## API Design

### Core Functions

**getScripts(remoteUrl, config)**
- Fetches and caches scripts from remote endpoint
- Returns `Promise<ScriptDataResponse>`
- Full type safety on configuration options

**generateScriptTags(scriptUrls, attributes)**
- Generates HTML script tags from URLs
- Validates URLs and sanitizes attributes
- Returns typed HTML string

**serverTagMiddleware(options)**
- Main Express middleware factory
- Comprehensive options typing
- Type-safe error handling

### Type Definitions

**ServerTagConfig**
```typescript
interface ServerTagConfig {
  cacheInterval?: number;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}
```

**ServerTagMiddlewareOptions**
```typescript
interface ServerTagMiddlewareOptions extends ServerTagConfig {
  remoteUrl: string;
  injectIntoHtml?: boolean;
  injectPosition?: string;
  scriptAttributes?: ScriptAttributes;
  onError?: (error: Error, req: Request, res: Response) => void;
  shouldInject?: (req: Request, res: Response) => boolean;
}
```

**ScriptAttributes**
```typescript
interface ScriptAttributes {
  async?: boolean;
  defer?: boolean;
  type?: string;
  [key: string]: string | boolean | number | undefined;
}
```

## Test Application

The test app (`test-app/`) demonstrates TypeScript integration:

### Features Demonstrated

- TypeScript Express server with full typing
- Multiple integration patterns
- Error handling with custom error types
- Template integration with type safety
- API endpoints with typed responses

### Routes

- `/` - EJS template integration
- `/about` - Documentation page  
- `/manual` - Manual script injection
- `/auto` - Automatic injection
- `/api/scripts` - JSON API endpoint
- `/typescript` - TypeScript feature demo
- `/health` - Health check with types

### TypeScript Configuration

**Main Package (`tsconfig.json`)**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext", 
    "strict": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

**Test App (`test-app/tsconfig.json`)**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["../src/*"]
    }
  }
}
```

## Vite Configuration

**Core Build Settings**
```typescript
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: ['express', 'node-fetch'],
    },
    target: 'node16',
    sourcemap: true,
  },
});
```

## Package Structure

### Exports

The package provides both CommonJS and ES module exports:

```json
{
  "main": "dist/index.js",
  "module": "dist/index.mjs", 
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

### Dependencies

**Runtime**
- `node-fetch@^3.3.2` - HTTP client for script fetching

**Development** 
- `@types/express@^4.17.21` - Express type definitions
- `@types/node@^20.10.0` - Node.js type definitions
- `typescript@^5.3.0` - TypeScript compiler
- `vite@^5.0.0` - Build tool
- `vite-plugin-dts@^3.6.0` - TypeScript declaration generation

## Implementation Notes

### ES Modules

The package uses ES modules throughout:
- Import/export syntax
- `.js` extensions in imports (required for ES modules)
- `type: "module"` in package.json

### Type Safety

- Strict TypeScript configuration
- Runtime validation for external data
- Comprehensive error handling
- Type guards for safety

### Performance

- Vite's fast build system
- Tree-shaking support
- Optimized bundle size
- Source map generation

### Compatibility

- Node.js 16+ support
- Modern Express versions (4.x, 5.x)
- Both CommonJS and ES module consumers

## Future Enhancements

### Planned Features

1. **Enhanced Caching**
   - Redis adapter for distributed caching
   - Cache warming strategies
   - Advanced invalidation

2. **Monitoring Integration**
   - OpenTelemetry support
   - Metrics collection
   - Performance tracking

3. **Security Enhancements**
   - CSP integration
   - Script integrity checking
   - Advanced URL validation

### TypeScript Improvements

- More granular type exports
- Generic middleware factory
- Enhanced error type hierarchy
- Template literal types for URLs 