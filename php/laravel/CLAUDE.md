# Laravel Server Tag Package

## Overview
This is a Laravel package for server-side script fetching and rendering from remote URLs.

## Tech Stack
- **Framework**: Laravel 8/9/10
- **Language**: PHP 7.4+
- **Type**: Laravel Package

## Development Commands
```bash
# Install dependencies
composer install

# Run tests (if configured)
./vendor/bin/phpunit

# Check PHP syntax
php -l src/helpers.php
```

## Key Files
- `src/helpers.php` - Helper functions for script fetching
- `composer.json` - Package configuration

## Dependencies
- PHP 7.4 or higher
- Laravel Illuminate packages:
  - `illuminate/support` - Laravel service container and helpers
  - `illuminate/http` - HTTP client for remote requests

## Package Type
This is a Laravel package that can be installed via Composer and provides helper functions for fetching and rendering scripts from remote URLs.