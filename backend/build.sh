#!/usr/bin/env bash
set -e

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Running database migrations..."
python manage.py migrate

echo "Creating demo customer..."
python manage.py shell <<'PY'
from accounts.models import User, CustomerProfile

username = "customer"
password = "customer123"
email = "customer@example.com"

user, created = User.objects.get_or_create(
    username=username,
    defaults={
        "email": email,
        "user_type": "customer",
        "is_active": True,
        "is_verified": True,
    }
)

user.set_password(password)
user.email = email
user.user_type = "customer"
user.is_active = True
user.is_verified = True
user.save()

CustomerProfile.objects.get_or_create(
    user=user,
    defaults={
        "full_name": "Demo Customer",
        "email": email,
        "is_email_verified": True,
    }
)

print("Demo customer ready:", username)
PY

echo "Build completed successfully."
