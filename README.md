# AdBlock Server Tag

A collection of packages for fetching and rendering scripts from remote URLs across different web frameworks and technologies. This monorepo contains implementations for various tech stacks, each providing similar functionality tailored to their respective ecosystems.

## Overview

AdBlock Server Tag packages allow you to dynamically fetch and render JavaScript files from remote URLs with built-in caching, error handling, and security features. Each package is designed to integrate seamlessly with its target framework's conventions and best practices.

## Available Packages

### Node.js Packages

#### Next.js
**Location**: [`nodejs/nextjs/`](./nodejs/nextjs/)
- **Framework**: Next.js 14+ with App Router
- **Features**: React Server Components, TypeScript support, built-in caching
- **Installation**: `npm install @adunblock/server-tag-nextjs`

#### React Router
**Location**: [`nodejs/react-router/`](./nodejs/react-router/)
- **Framework**: React Router 7 (Data & Framework Mode)
- **Features**: Server-side rendering, dual CJS/ESM build, TypeScript support
- **Installation**: `npm install @adunblock/server-tag-react-router`

#### Express (and other Express-based Node.js apps)
**Location**: [`nodejs/express/`](./nodejs/express/)
- **Framework**: Express.js 4+ and other Express-based frameworks
- **Features**: Middleware support, template engine integration, async/await
- **Installation**: `npm install @adunblock/server-tag-express`

### PHP Packages

#### Laravel
**Location**: [`php/laravel/`](./php/laravel/)
- **Framework**: Laravel 8/9/10/11
- **Features**: Blade helper function, built-in caching, auto-discovery
- **Installation**: `composer require adunblock/server-tag-laravel`

#### Symfony
**Location**: [`php/symfony/`](./php/symfony/)
- **Framework**: Symfony 5/6/7
- **Features**: Twig extension, dependency injection, bundle structure
- **Installation**: `composer require adunblock/server-tag-symfony`

### Python Packages

#### Django
**Location**: [`python/django/`](./python/django/)
- **Framework**: Django 3.2+
- **Features**: Template tags, Django cache integration, proper app structure
- **Installation**: `pip install adunblock-server-tag-django`

## Common Features

All packages provide:

- ✅ **Remote Script Fetching**: Fetch JavaScript files from external URLs
- ✅ **Caching Support**: Built-in caching with configurable TTL
- ✅ **Error Handling**: Graceful fallback when remote URLs are unavailable
- ✅ **Security**: XSS protection with proper HTML escaping
- ✅ **Custom Rendering**: Support for custom script tag rendering
- ✅ **TypeScript/Type Safety**: Where applicable (Node.js packages)


## Expected Remote URL Format

All packages expect the remote URL to return JSON in the following format:

```json
{
  "js": [
    "https://cdn.example.com/script1.js",
    "https://cdn.example.com/script2.js"
  ]
}
```

## Development

Each package directory contains its own development setup:

- **Node.js packages**: `npm install && npm run dev`
- **PHP packages**: `composer install`
- **Python packages**: `pip install -e .`

See individual package README files for detailed development instructions.


## License

ISC License - see individual package directories for specific license information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes in the appropriate package directory
4. Test your changes
5. Submit a pull request

## Support

- **Issues**: [GitHub Issues](https://github.com/adunblock/adunblock-server-tag/issues)
- **Repository**: [GitHub](https://github.com/adunblock/adunblock-server-tag)