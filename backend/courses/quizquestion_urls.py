from rest_framework.routers import DefaultRouter
from courses.views import QuizQuestionViewSet

router = DefaultRouter()
router.register(r"", QuizQuestionViewSet, basename="quizquestions")

urlpatterns = router.urls
