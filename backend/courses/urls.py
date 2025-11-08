from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, VideoViewSet

router = DefaultRouter()
# Always register nested or specialized routes (like videos) FIRST
router.register(r'videos', VideoViewSet, basename='videos')
router.register(r'', CourseViewSet, basename='courses')

urlpatterns = router.urls
