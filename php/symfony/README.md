# Server Tag Symfony Bundle

A Symfony bundle to fetch and render scripts from a remote URL with Twig integration and caching support.

## Installation

Install the bundle via Composer:

```bash
composer require adunblock/server-tag-symfony
```

Enable the bundle in your `config/bundles.php`:

```php
<?php

return [
    // ... other bundles
    Adunblock\ServerTag\Symfony\AdunblockServerTagBundle::class => ['all' => true],
];
```

## Usage

In your Twig template, you can now use the `server_tag` function:

```twig
<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
  {{ server_tag('https://your-remote-url.com/scripts.json') }}
</head>
<body>
  <h1>My Page</h1>
</body>
</html>
```

### Custom Rendering

You can provide a custom callable to the `render_script` parameter to customize how script tags are rendered:

```twig
<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
  {{ server_tag('https://your-remote-url.com/scripts.json', 300, custom_renderer) }}
</head>
<body>
  <h1>My Page</h1>
</body>
</html>
```

## Features

- **Twig Integration**: Easy-to-use Twig function for templates
- **HTTP Client**: Uses Symfony's HTTP client for reliable requests
- **Caching**: Built-in caching support with configurable TTL
- **Error Handling**: Graceful error handling with fallback to empty arrays
- **Security**: XSS protection with proper HTML escaping
- **Bundle Structure**: Proper Symfony bundle with dependency injection

## Requirements

- PHP 7.4 or higher
- Symfony 5.0, 6.0, or 7.0
- Twig 2.0 or 3.0