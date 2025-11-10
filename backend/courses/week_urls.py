from rest_framework.routers import DefaultRouter
from courses.views import WeekViewSet

router = DefaultRouter()
router.register(r"", WeekViewSet, basename="weeks")

urlpatterns = router.urls
