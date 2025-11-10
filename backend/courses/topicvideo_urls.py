from rest_framework.routers import DefaultRouter
from courses.views import TopicVideoViewSet

router = DefaultRouter()
router.register(r"", TopicVideoViewSet, basename="topicvideos")

urlpatterns = router.urls
