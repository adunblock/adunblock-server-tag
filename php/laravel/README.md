# adunblock-server-tag for Laravel

This package provides a global helper function to fetch and render scripts from a remote URL in your Laravel Blade templates.

## Installation

1.  Copy the `src/helpers.php` file into your Laravel project, for example, in the `app` directory.
2.  Open your `composer.json` file and add the path to the `helpers.php` file in the `autoload` section:

    ```json
    "autoload": {
        "psr-4": {
            "App\": "app/",
            "Database\\Factories\\": "database/factories/",
            "Database\\Seeders\\": "database/seeders/"
        },
        "files": [
            "app/helpers.php"
        ]
    },
    ```

3.  Run `composer dump-autoload` to autoload the helper file.

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
