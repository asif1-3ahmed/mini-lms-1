from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet,
    WeekViewSet,
    TopicVideoViewSet,
    TopicViewSet,
    QuizViewSet,
    QuizQuestionViewSet,
    QuizSubmissionViewSet,
    AssignmentViewSet,
    AssignmentTestCaseViewSet,
    AssignmentSubmissionViewSet,
)

# 🚀 Initialize router
router = DefaultRouter()

# ===============================
# 🏫 Course & Legacy Videos
# ===============================
router.register(r"", CourseViewSet, basename="courses")                 # main course route

# ===============================
# 🧱 Course Structure (Weeks & Topics)
# ===============================
router.register(r"weeks", WeekViewSet, basename="weeks")

# ===============================
# 🧩 Quizzes & Questions
# ===============================
router.register(r"quizzes", QuizViewSet, basename="quizzes")
router.register(r"quizquestions", QuizQuestionViewSet, basename="quizquestions")
router.register(r"quizsubmissions", QuizSubmissionViewSet, basename="quizsubmissions")

router.register(r"topics", TopicViewSet, basename="topics")  # ✅ missing
router.register(r"topicvideos", TopicVideoViewSet, basename="topicvideos") 

# ===============================
# 💻 Assignments & Test Cases
# ===============================
router.register(r"assignments", AssignmentViewSet, basename="assignments")
router.register(r"assignmenttests", AssignmentTestCaseViewSet, basename="assignmenttests")
router.register(r"assignmentsubmissions", AssignmentSubmissionViewSet, basename="assignmentsubmissions")

# ✅ Include all viewset routes
urlpatterns = router.urls
