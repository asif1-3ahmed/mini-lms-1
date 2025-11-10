# backend/backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),

    # ✅ Accounts routes
    path("api/accounts/", include("accounts.urls")),

    # ✅ All course-related endpoints (courses, weeks, topics, quizzes, etc.)
    path("api/courses/", include("courses.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
