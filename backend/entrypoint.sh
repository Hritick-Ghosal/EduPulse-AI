#!/bin/sh
set -e

echo "=== EduPulse Backend Entrypoint ==="

# Run database migrations
echo "[1/3] Applying database migrations..."
python manage.py migrate --no-input

# Collect static files
echo "[2/3] Collecting static files..."
python manage.py collectstatic --no-input --clear 2>/dev/null || true

# Seed default teacher account
echo "[3/3] Seeding teacher1 account..."
python manage.py shell -c "
from django.contrib.auth.models import User
from academics.models import TeacherProfile

if not User.objects.filter(username='teacher1').exists():
    u = User.objects.create_user(
        username='teacher1',
        email='teacher1@edupulse.edu',
        password='Teacher@123'
    )
    u.is_staff = True
    u.save()
    TeacherProfile.objects.get_or_create(user=u, defaults={'department': 'Computer Science'})
    print('  -> teacher1 account created successfully.')
else:
    print('  -> teacher1 already exists, skipping.')
"

echo "=== Starting Gunicorn on 0.0.0.0:8000 ==="
exec gunicorn core_backend.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
