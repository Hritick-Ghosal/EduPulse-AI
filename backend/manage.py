#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv


def main():
    """Run administrative tasks."""
    # Load .env from repository root (EduPulse-AI/.env) or local backend
    base_dir = Path(__file__).resolve().parent
    root_dir = base_dir.parent
    env_file = root_dir / '.env' if (root_dir / '.env').exists() else (base_dir / '.env')
    if env_file.exists():
        load_dotenv(dotenv_path=env_file)

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_backend.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
