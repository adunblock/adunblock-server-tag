# adunblock-server-tag for Symfony

This package provides a Twig extension to fetch and render scripts from a remote URL in your Symfony Twig templates.

## Installation

1.  Copy the `src/Twig/ServerTagExtension.php` file into your Symfony project, for example, in the `src/Twig` directory.
2.  Symfony's autowiring will automatically recognize the new Twig extension. Make sure you have the necessary dependencies installed:

    ```bash
    composer require symfony/http-client symfony/cache
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

You can provide a custom Twig function to the `render_script` argument to render the script tags in a different way. This function should be defined in a Twig extension.

**Example:**

In a file `src/Twig/AppExtension.php`:

```php
<?php

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class AppExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('my_script_renderer', [$this, 'myScriptRenderer'], ['is_safe' => ['html']]),
        ];
    }

    public function myScriptRenderer(array $jsFiles): string
    {
        $scripts = array_map(function ($src) {
            return sprintf('<script src="%s" defer></script>', htmlspecialchars($src, ENT_QUOTES, 'UTF-8'));
        }, $jsFiles['js'] ?? []);

        return implode("\n", $scripts);
    }
}
```

In your Twig template:

```twig
<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
  {{ server_tag('https://your-remote-url.com/scripts.json', 300, my_script_renderer) }}
</head>
<body>
  <h1>My Page</h1>
</body>
</html>
```