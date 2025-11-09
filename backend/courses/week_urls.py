from rest_framework.routers import DefaultRouter
from .views import WeekViewSet

router = DefaultRouter()
router.register(r"", WeekViewSet, basename="weeks")

urlpatterns = router.urls