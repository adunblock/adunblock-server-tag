import django
from django.conf import settings


def pytest_configure():
    settings.configure(
        ALLOWED_HOSTS=['www.publisher.com', 'other.com'],
        INSTALLED_APPS=['server_tag'],
        CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
        TEMPLATES=[{
            'BACKEND': 'django.template.backends.django.DjangoTemplates',
            'OPTIONS': {'context_processors': ['django.template.context_processors.request']},
        }],
    )
    django.setup()
