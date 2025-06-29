# Django Server Tag Package

## Overview
This is a Django package for server-side script fetching and rendering from remote URLs with template tag integration.

## Tech Stack
- **Framework**: Django
- **Language**: Python 3.6+
- **Package Type**: Django App

## Development Commands
```bash
# Install dependencies
pip install -r requirements.txt
# or if using poetry/pipenv
pip install -e .

# Run tests (if configured)
python manage.py test

# Check Python syntax
python -m py_compile server_tag/**/*.py
```

## Key Files
- `server_tag/templatetags/server_tag_tags.py` - Django template tags
- `setup.py` - Package configuration and dependencies

## Dependencies
- Django framework
- `requests` library for HTTP operations

## Package Structure
- `server_tag/` - Main package directory
- `server_tag/templatetags/` - Django template tags module
- Template tag integration for easy use in Django templates

## Installation
```bash
pip install adunblock-server-tag-django
```

## Usage
Add to Django `INSTALLED_APPS` and use the provided template tags in your templates.