from rest_framework.routers import DefaultRouter
from courses.views import AssignmentSubmissionViewSet

router = DefaultRouter()
router.register(r"", AssignmentSubmissionViewSet, basename="assignmentsubmissions")

urlpatterns = router.urls
