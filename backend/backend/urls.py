from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # 🛠️ Admin Panel
    path("admin/", admin.site.urls),

    # 👤 Accounts & Auth APIs
    path("api/accounts/", include("accounts.urls")),

    # 🏫 Courses, Weeks, Topics, Quizzes, Assignments
    path("api/courses/", include("courses.urls")),
]

# ✅ Serve uploaded files (e.g. topic videos) in DEBUG mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
