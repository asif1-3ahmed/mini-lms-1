import os
from pathlib import Path
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# -----------------------------
# 🔐 Security & Environment
# -----------------------------
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-secret")
DEBUG = os.environ.get("DJANGO_DEBUG", "False").lower() == "true"
ALLOWED_HOSTS = [h.strip() for h in os.environ.get("ALLOWED_HOSTS", "*").split(",") if h.strip()]

# -----------------------------
# ⚙️ Installed Apps
# -----------------------------
INSTALLED_APPS = [
    # Default Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",
    "cloudinary",
    "cloudinary_storage",

    # Local
    "accounts",
    "courses",
]

# -----------------------------
# 🧱 Middleware
# -----------------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# -----------------------------
# 🎨 Templates (for admin)
# -----------------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

ROOT_URLCONF = "backend.urls"
WSGI_APPLICATION = "backend.wsgi.application"

# -----------------------------
# 🗃️ Database (auto-switchable)
# -----------------------------
DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
    )
}

# -----------------------------
# 👤 Authentication
# -----------------------------
AUTH_USER_MODEL = "accounts.User"

# -----------------------------
# ⚙️ REST Framework
# -----------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
}

# -----------------------------
# 🧊 Static Files
# -----------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# -----------------------------
# 🪣 Media (and Cloudinary)
# -----------------------------
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

CLOUDINARY_STORAGE = {
    "CLOUD_NAME": os.environ.get("CLOUDINARY_CLOUD_NAME"),
    "API_KEY": os.environ.get("CLOUDINARY_API_KEY"),
    "API_SECRET": os.environ.get("CLOUDINARY_API_SECRET"),
}
DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"

# -----------------------------
# 🌐 CORS & CSRF
# -----------------------------
cors_env = os.environ.get("CORS_ALLOWED_ORIGINS", "*").strip()
if cors_env == "*" or not cors_env:
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOWED_ORIGINS = [o.strip() for o in cors_env.split(",") if o.strip()]

# CSRF trusted origins (frontend URL)
frontend_url = os.environ.get("FRONTEND_URL", "").strip()
CSRF_TRUSTED_ORIGINS = [
    o.strip() for o in os.environ.get("CSRF_TRUSTED_ORIGINS", "").split(",") if o.strip()
]
if frontend_url:
    CSRF_TRUSTED_ORIGINS = list(set(CSRF_TRUSTED_ORIGINS + [frontend_url]))
