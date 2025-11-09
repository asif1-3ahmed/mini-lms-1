from rest_framework.routers import DefaultRouter
from .views import Quizsubmission_urls

router = DefaultRouter()
router.register(r"", QuizSubmissionViewSet, basename="quizsubmissions")

urlpatterns = router.urls