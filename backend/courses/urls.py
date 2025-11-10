from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet,
    WeekViewSet,
    TopicViewSet,
    TopicVideoViewSet,
    QuizViewSet,
    QuizQuestionViewSet,
    QuizSubmissionViewSet,
    AssignmentViewSet,
    AssignmentTestCaseViewSet,
    AssignmentSubmissionViewSet,
)

router = DefaultRouter()

# 🧱 Structure routes
router.register(r"weeks", WeekViewSet, basename="weeks")
router.register(r"topics", TopicViewSet, basename="topics")
router.register(r"topicvideos", TopicVideoViewSet, basename="topicvideos")

# 🧩 Quizzes
router.register(r"quizzes", QuizViewSet, basename="quizzes")
router.register(r"quizquestions", QuizQuestionViewSet, basename="quizquestions")
router.register(r"quizsubmissions", QuizSubmissionViewSet, basename="quizsubmissions")

# 💻 Assignments
router.register(r"assignments", AssignmentViewSet, basename="assignments")
router.register(r"assignmenttests", AssignmentTestCaseViewSet, basename="assignmenttests")
router.register(r"assignmentsubmissions", AssignmentSubmissionViewSet, basename="assignmentsubmissions")

# 🏫 Course route (moved LAST)
router.register(r"", CourseViewSet, basename="courses")

urlpatterns = router.urls
