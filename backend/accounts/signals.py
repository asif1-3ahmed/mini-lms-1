from django.db.models.signals import post_migrate
from django.contrib.auth import get_user_model
from django.dispatch import receiver
import os

@receiver(post_migrate)
def create_default_admin(sender, **kwargs):
    """Auto-create superuser after migrations, if env var is set."""
    if os.environ.get("CREATE_SUPERUSER", "False") == "True":
        User = get_user_model()
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "admin123")

        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(username=username, email=email, password=password)
            print(f"✅ Superuser '{username}' created automatically (via signal).")
        else:
            print(f"ℹ️ Superuser '{username}' already exists.")
