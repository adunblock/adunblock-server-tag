# Symfony Server Tag Bundle

## Overview
This is a Symfony bundle for server-side script fetching and rendering from remote URLs with Twig integration.

## Tech Stack
- **Framework**: Symfony 5/6
- **Language**: PHP 7.4+
- **Template Engine**: Twig 2/3
- **Type**: Symfony Bundle

## Development Commands
```bash
# Install dependencies
composer install

# Run tests (if configured)
./vendor/bin/phpunit

# Check PHP syntax
find src -name "*.php" -exec php -l {} \;
```

## Key Files
- `src/Twig/AdunblockExtension.php` - Twig extension for template integration
- `composer.json` - Bundle configuration

## Dependencies
- PHP 7.4 or higher
- Symfony components:
  - `symfony/http-client` - HTTP client for remote requests
  - `symfony/cache` - Caching layer for performance
  - `twig/twig` - Template engine integration

## Bundle Features
- Twig extension for easy template integration
- HTTP client for fetching remote scripts
- Caching support for improved performance
- PSR-4 autoloading with namespace `Adunblock\ServerTag\Symfony\`