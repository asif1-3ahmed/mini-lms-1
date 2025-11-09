from rest_framework.routers import DefaultRouter
from .views import AssignmentSubmissionViewSet

router = DefaultRouter()
router.register(r"", AssignmentSubmissionViewSet, basename="assignment_submissions")

urlpatterns = router.urls