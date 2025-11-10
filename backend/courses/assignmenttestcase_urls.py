from rest_framework.routers import DefaultRouter
from courses.views import AssignmentTestCaseViewSet

router = DefaultRouter()
router.register(r"", AssignmentTestCaseViewSet, basename="assignmenttests")

urlpatterns = router.urls
