# Server Tag Django Package

A Django package to fetch and render scripts from a remote URL with template tag integration and caching support.

## Installation

Install the package via pip:

```bash
pip install adunblock-server-tag-django
```

Add the `server_tag` app to your `INSTALLED_APPS` in your Django `settings.py`:

```python
INSTALLED_APPS = [
    # ... other apps
    'server_tag',
]
```

Configure caching in your `settings.py` (recommended for production):

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}

# Or for development, use local memory cache:
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
  {% server_tag "https://your-remote-url.com/scripts" %}
</head>
<body>
  <h1>My Page</h1>
</body>
</html>
```

### Custom Script Attributes

Pass a `script_attributes` dict from your view context to render extra attributes (including `data-*`) on the generated `<script>` tag:

```python
# views.py
def my_view(request):
    return render(request, 'my_template.html', {
        'script_attrs': {
            'data-code': 'abc123',
            'data-source': 'server-tag',
            'defer': True,
        },
    })
```

```html
{% load server_tag_tags %}
{% server_tag "https://your-remote-url.com/scripts" script_attributes=script_attrs %}
```

Rendering rules:

- `True` → bare attribute (e.g. `defer`)
- `False` / `None` → omitted
- any other value → `key="value"` (HTML-escaped)

By default, every rendered script includes `async`. Set `script_attributes={'async': False}` to disable it.

### The tag it prints

By default the package prints one tag, for the first URL in the response (the preferred one):

```html
<script data-cfasync="false" nowprocket src="SCRIPT_URL" async data-code="ACCOUNT_ID"></script>
```

- `data-cfasync="false"` and `nowprocket` come **before** `src`: Cloudflare Rocket Loader skips a script only when `data-cfasync="false"` precedes `src`, and `nowprocket` keeps WP Rocket's Delay JavaScript Execution off it. Pass either with `false` to drop it.
- Your attributes (`data-code` and anything else) come after `src`.
- Only the first URL is rendered: the client must load once per page, since each copy runs its own adblock detection and asks for its own proxy session. A custom renderer still receives every URL.

### The site's domain

The tag sends your site's domain to the sources endpoint as `?domain=`, taken from `request.get_host()` when the template context has the `request` (the `django.template.context_processors.request` context processor, on in new projects), or from a `domain` argument: `{% server_tag "https://public.adunblocker.com/api/vendor_scripts" domain="example.com" %}`. A host outside `ALLOWED_HOSTS` sends no domain. When an ad blocker rule targets one site, we publish a new script host for that site alone, and only a request naming the site receives it. A `domain` parameter already in your URL is kept as it is.

### Custom Rendering

You can provide a custom Python function to the `render_script` parameter to customize how script tags are rendered:

```python
# my_app/templatetags/custom_tags.py
from django import template
from django.utils.safestring import mark_safe

register = template.Library()

@register.simple_tag
def custom_script_renderer(js_files):
    from django.utils.html import escape
    scripts = [f'<script src="{escape(src)}" defer></script>' for src in js_files.get('js', [])]
    return mark_safe('\n'.join(scripts))
```

```html
{% load server_tag_tags %}
{% load custom_tags %}

<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
  {% server_tag "https://your-remote-url.com/scripts" render_script=custom_script_renderer %}
</head>
<body>
  <h1>My Page</h1>
</body>
</html>
```

## Features

- **Template Tag Integration**: Easy-to-use Django template tag
- **HTTP Client**: Uses requests library for reliable HTTP operations
- **Caching**: Built-in Django cache integration with configurable TTL
- **Error Handling**: Graceful error handling with fallback to empty arrays
- **Security**: XSS protection with proper HTML escaping
- **Django Integration**: Proper Django app structure with apps.py

## Requirements

- Python 3.8 or higher
- Django 3.2 or higher
- requests 2.25.0 or higher