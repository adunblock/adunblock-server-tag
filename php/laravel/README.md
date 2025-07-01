# Server Tag Laravel Package

A Laravel package to fetch and render scripts from a remote URL with caching support.

## Installation

Install the package via Composer:

```bash
composer require adunblock/server-tag-laravel
```

The package will be automatically registered via Laravel's package auto-discovery feature.

## Usage

In your Blade template, you can now use the `server_tag` function:

```php
<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
  {!! server_tag('https://your-remote-url.com/scripts.json') !!}
</head>
<body>
  <h1>My Page</h1>
</body>
</html>
```

### Custom Rendering

You can provide a custom closure to the `render_script` argument to render the script tags in a different way:

```php
<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
  {!!
    server_tag('https://your-remote-url.com/scripts.json', 300, function($jsFiles) {
      $scripts = array_map(function ($src) {
        return "<script src=\"{{$src}}\" defer></script>";
      }, $jsFiles['js'] ?? []);
      return implode("\n", $scripts);
    })
  !!}
</head>
<body>
  <h1>My Page</h1>
</body>
</html>
```
