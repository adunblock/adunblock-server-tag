# @adunblock/server-tag-nextjs

## Overview
A Next.js/React TypeScript package that provides a React Server Component for fetching and rendering external JavaScript files on the server-side before page rendering.

## Tech Stack
- **Framework**: Next.js 15.3.4
- **Language**: TypeScript 5
- **Runtime**: React 19

## Core Features
- Server-side script fetching with built-in caching
- Secure URL validation (HTTP/HTTPS only)
- Custom script rendering support
- TypeScript support
- React Server Component architecture

## Development Commands
```bash
# Install dependencies
npm install

# Build the package
npm run build

# Development server (test app)
npm run dev

# Build test app
npm run test:build

# Start test app
npm run test:start

# Lint test app
npm run test:lint

# Type check
npx tsc --noEmit

# E2E tests with Playwright
npm run test:e2e
```

## Key Files
- `src/ServerTag.tsx` - Main React Server Component
- `src/index.ts` - Package entry point
- `test-app/` - Next.js test application
- `e2e/` - Playwright E2E tests
- `dist/` - Built package files

## Package Information
- **Name**: @adunblock/server-tag-nextjs
- **Version**: 1.0.0
- **Repository**: https://github.com/adunblock/adunblock-server-tag
- **License**: ISC

## Dependencies
- React 19 with TypeScript support
- Next.js 15.3.4 for SSR/SSG capabilities
- Playwright for E2E testing