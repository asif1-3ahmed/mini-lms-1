from rest_framework.routers import DefaultRouter
from .views import AssignmentTestCaseViewSet

router = DefaultRouter()
router.register(r"", AssignmentTestCaseViewSet, basename="assignment_test_cases")

urlpatterns = router.urls