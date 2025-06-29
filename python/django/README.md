# adunblock-server-tag for Django

This package provides a custom template tag to fetch and render scripts from a remote URL in your Django templates.

## Installation

1.  Add the `server_tag` app to your `INSTALLED_APPS` in your Django `settings.py`:

    ```python
    INSTALLED_APPS = [
        # ...
        'server_tag',
    ]
    ```

2.  Make sure you have a cache configured in your `settings.py`. For example, you can use the local memory cache for development:

    ```python
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'unique-snowflake',
        }
    }
    ```

## Usage

In your Django template, load the `server_tag_tags` and use the `server_tag` tag:

```html
{% load server_tag_tags %}

<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
  {% server_tag "https://your-remote-url.com/scripts.json" %}
</head>
<body>
  <h1>My Page</h1>
</body>
</html>
```

### Custom Rendering

You can provide a custom Python function to the `render_script` argument to render the script tags in a different way. This function should be defined in a place where it can be imported into your template context.

**Example:**

In a file `my_app/utils.py`:

```python
def my_script_renderer(js_files):
    scripts = [f'<script src="{src}" defer></script>' for src in js_files.get('js', [])]
    return '\n'.join(scripts)
```

In your view:

```python
from django.shortcuts import render
from .utils import my_script_renderer

def my_view(request):
    return render(request, 'my_template.html', {'my_renderer': my_script_renderer})
```

In your template:

```html
{% load server_tag_tags %}

<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
  {% server_tag "https://your-remote-url.com/scripts.json" render_script=my_renderer %}
</head>
<body>
  <h1>My Page</h1>
</body>
</html>
```