from unittest import mock
from urllib.parse import parse_qs, urlsplit

import pytest
from django.core.cache import cache
from django.template import engines
from django.test import RequestFactory

from server_tag.templatetags.server_tag_tags import server_tag, with_domain

SCRIPT_1 = 'https://one.example/a.js'
SCRIPT_2 = 'https://two.example/b.js'
SOURCES = 'https://sources.example/api/vendor_scripts'


@pytest.fixture(autouse=True)
def sources():
    """Stand-in for the sources endpoint; records each URL it is asked for."""
    cache.clear()
    calls = []

    def get(url):
        calls.append(url)
        response = mock.Mock()
        response.json.return_value = [SCRIPT_1, SCRIPT_2]
        return response

    with mock.patch('server_tag.templatetags.server_tag_tags.requests.get', side_effect=get):
        yield calls


def domains(calls):
    return [parse_qs(urlsplit(url).query).get('domain') for url in calls]


def render(template, host=None, **context):
    request = RequestFactory().get('/', HTTP_HOST=host) if host else None
    return engines['django'].from_string('{% load server_tag_tags %}' + template).render(context, request)


def test_default_tag_order_and_first_url_only():
    assert server_tag(SOURCES) == (
        f'<script data-cfasync="false" nowprocket src="{SCRIPT_1}" async></script>'
    )


def test_script_attributes_after_src():
    assert server_tag(SOURCES, script_attributes={'data-code': '12345678'}) == (
        f'<script data-cfasync="false" nowprocket src="{SCRIPT_1}" async data-code="12345678"></script>'
    )


def test_caller_data_cfasync_stays_ahead_once_and_defaults_can_be_dropped():
    assert server_tag(SOURCES, script_attributes={'data-cfasync': 'false', 'data-code': '1'}) == (
        f'<script data-cfasync="false" nowprocket src="{SCRIPT_1}" async data-code="1"></script>'
    )
    cache.clear()
    assert server_tag(
        SOURCES, script_attributes={'data-cfasync': False, 'nowprocket': False, 'async': False}
    ) == f'<script src="{SCRIPT_1}"></script>'


def test_render_script_still_gets_every_url(sources):
    seen = []
    html = server_tag(SOURCES, render_script=lambda js_files: seen.append(js_files) or 'custom')
    assert seen == [{'js': [SCRIPT_1, SCRIPT_2]}]
    assert html == 'custom'


def test_template_tag_sends_request_host(sources):
    html = render('{% server_tag url script_attributes=attrs %}', host='www.publisher.com',
                  url=SOURCES, attrs={'data-code': '12345678'})
    assert domains(sources) == [['www.publisher.com']]
    assert html == (
        f'<script data-cfasync="false" nowprocket src="{SCRIPT_1}" async data-code="12345678"></script>'
    )


def test_template_tag_without_request_sends_no_domain(sources):
    render('{% server_tag url %}', url=SOURCES)
    assert domains(sources) == [None]


def test_template_tag_disallowed_host_sends_no_domain(sources):
    render('{% server_tag url %}', host='evil.example', url=SOURCES)
    assert domains(sources) == [None]


def test_template_tag_domain_argument_wins(sources):
    render('{% server_tag url domain="chosen.com" %}', host='other.com', url=SOURCES)
    assert domains(sources) == [['chosen.com']]


def test_template_tag_positional_arguments_still_work(sources):
    html = render('{% server_tag url 60 %}', host='other.com', url=SOURCES)
    assert html.startswith('<script data-cfasync="false"')


def test_domain_in_url_is_kept(sources):
    render('{% server_tag url %}', host='other.com', url=SOURCES + '?domain=fixed.com')
    assert domains(sources) == [['fixed.com']]


def test_cache_is_per_domain(sources):
    server_tag(SOURCES, domain='a.com')
    server_tag(SOURCES, domain='a.com')
    server_tag(SOURCES, domain='b.com')
    assert domains(sources) == [['a.com'], ['b.com']]


def test_with_domain_encodes_and_keeps_query():
    assert with_domain(SOURCES + '/v1?x=1', 'my site.com') == SOURCES + '/v1?x=1&domain=my+site.com'
    assert with_domain(SOURCES, None) == SOURCES
    assert with_domain(SOURCES, '') == SOURCES
