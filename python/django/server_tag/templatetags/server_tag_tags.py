from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import requests
from django import template
from django.core.cache import cache
from django.utils.safestring import mark_safe
from django.utils.html import escape

register = template.Library()

# Printed ahead of `src`, with their default values. Cloudflare Rocket Loader
# honours `data-cfasync="false"` only when it comes before `src`; `nowprocket`
# keeps WP Rocket's Delay JavaScript Execution off the tag. A caller can
# override either, or drop it with False.
LEADING_ATTRIBUTES = {'data-cfasync': 'false', 'nowprocket': True}


def _render_attr(key, value):
    if value is True:
        return escape(key)
    if value is False or value is None:
        return ''
    return f'{escape(key)}="{escape(str(value))}"'


def _render_attrs(attrs):
    return ' '.join(filter(None, (_render_attr(k, v) for k, v in attrs.items())))


def with_domain(remote_url, domain):
    """Add ``?domain=<site>`` to the sources URL.

    When a filter rule blocks our script host on one site only, that site alone
    gets a new host, and only a request naming it receives it. The URL is left
    as it is without a domain, or when it already has a ``domain`` parameter.
    """
    if not domain:
        return remote_url
    parts = urlsplit(remote_url)
    query = parse_qsl(parts.query, keep_blank_values=True)
    if any(key == 'domain' for key, _ in query):
        return remote_url
    query.append(('domain', domain))
    return urlunsplit(parts._replace(query=urlencode(query)))


def server_tag(remote_url, cache_interval=300, render_script=None, script_attributes=None, domain=None):
    """Render the AdUnblock script tag.

    The default output is one tag, for the first URL (the preferred one):
    ``<script data-cfasync="false" nowprocket src="URL" async ...script_attributes></script>``.
    The client must load once per page, since each copy runs its own adblock
    detection and asks for its own proxy session. ``render_script`` still
    receives every URL, as ``{'js': [...]}``.
    """
    remote_url = with_domain(remote_url, domain)
    cached_data = cache.get(remote_url)

    if cached_data:
        js_files = cached_data
    else:
        try:
            response = requests.get(remote_url)
            response.raise_for_status()
            data = response.json()
            # New format: API returns array directly instead of object with js property
            if isinstance(data, list):
                # New format: array directly
                js_files = {'js': data}
            elif isinstance(data, dict) and 'js' in data:
                # Old format: object with js property (backward compatibility)
                js_files = data
            else:
                js_files = {'js': []}
            cache.set(remote_url, js_files, cache_interval)
        except requests.exceptions.RequestException as e:
            print(f'Error fetching remote script: {e}')
            js_files = {'js': []}

    if render_script:
        return mark_safe(render_script(js_files))

    js = js_files.get('js') or []
    if not js:
        return mark_safe('')

    leading = dict(LEADING_ATTRIBUTES)
    trailing = {'async': True}
    for key, value in (script_attributes or {}).items():
        if key in LEADING_ATTRIBUTES:
            leading[key] = value
        else:
            trailing[key] = value

    before = _render_attrs(leading)
    after = _render_attrs(trailing)
    return mark_safe(
        f'<script{" " + before if before else ""} src="{escape(js[0])}"{" " + after if after else ""}></script>'
    )


def _request_host(context):
    request = context.get('request')
    if request is None:
        return None
    try:
        return request.get_host()
    except Exception:
        # DisallowedHost: not one of ALLOWED_HOSTS. Send no domain.
        return None


@register.simple_tag(takes_context=True, name='server_tag')
def server_tag_tag(context, remote_url, cache_interval=300, render_script=None, script_attributes=None, domain=None):
    """``{% server_tag remote_url ... %}``.

    ``domain`` defaults to the request's host when the template has the
    ``request`` in its context (the ``django.template.context_processors.request``
    context processor, on by default in new projects).
    """
    if domain is None:
        domain = _request_host(context)
    return server_tag(remote_url, cache_interval, render_script, script_attributes, domain)
