# React Router Server Tag Package

## Overview
This is a React Router TypeScript package for client-side script loading and rendering.

## Tech Stack
- **Framework**: React Router DOM 6
- **Language**: TypeScript 5
- **Runtime**: React 18
- **Build Tool**: Create React App

## Development Commands
```bash
# Install dependencies
npm install

# Development server (test app)
cd test-app && npm start

# Build
cd test-app && npm run build

# Unit tests
cd test-app && npm test

# Type check
npx tsc --noEmit
```

## Testing
```bash
# Unit tests with Jest & React Testing Library
cd test-app && npm test

# E2E tests with Playwright
cd test-app && npx playwright test
```

## Key Files
- `ServerTag.js` - Main component
- `test-app/` - Create React App test application
- `test-app/e2e/` - Playwright E2E tests

## Dependencies
- React 18 with TypeScript support
- React Router DOM 6 for client-side routing
- React Testing Library for unit testing
- Playwright for E2E testing