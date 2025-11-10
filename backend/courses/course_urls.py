from rest_framework.routers import DefaultRouter
from courses.views import CourseViewSet

router = DefaultRouter()
router.register(r"", CourseViewSet, basename="courses")

urlpatterns = router.urls
