# Next.js Server Tag Package

## Overview
This is a Next.js/React TypeScript package for server-side script loading and rendering.

## Tech Stack
- **Framework**: Next.js 14
- **Language**: TypeScript 5
- **Runtime**: React 18

## Development Commands
```bash
# Install dependencies
npm install

# Development server (test app)
cd test-app && npm run dev

# Build
cd test-app && npm run build

# Lint
cd test-app && npm run lint

# Type check
npx tsc --noEmit
```

## Testing
```bash
# E2E tests with Playwright
cd test-app && npx playwright test
```

## Key Files
- `ServerTag.tsx` - Main component
- `test-app/` - Next.js test application
- `test-app/e2e/` - Playwright E2E tests

## Dependencies
- React 18 with TypeScript support
- Next.js 14 for SSR/SSG capabilities
- Playwright for E2E testing