from rest_framework.routers import DefaultRouter
from .views import QuizQuestionViewSet

router = DefaultRouter()
router.register(r"", QuizQuestionViewSet, basename="quizquestions")

urlpatterns = router.urls