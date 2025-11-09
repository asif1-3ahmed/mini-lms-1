from rest_framework.routers import DefaultRouter
from .views import TopicVideoViewSet

router = DefaultRouter()
router.register(r"", TopicVideoViewSet, basename="topicvideos")

urlpatterns = router.urls