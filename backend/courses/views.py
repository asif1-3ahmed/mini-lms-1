from rest_framework import viewsets, permissions, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from django.db import transaction
from .models import (
    Course,
    Week,
    Topic,
    TopicVideo,
    Quiz,
    QuizQuestion,
    QuizSubmission,
    Assignment,
    AssignmentTestCase,
    AssignmentSubmission,
)
from .serializers import (
    CourseSerializer,
    WeekSerializer,
    TopicSerializer,
    TopicVideoSerializer,
    QuizSerializer,
    QuizQuestionSerializer,
    QuizSubmissionSerializer,
    AssignmentSerializer,
    AssignmentTestCaseSerializer,
    AssignmentSubmissionSerializer,
)
import traceback


# 🔒 Custom permission helper
class IsAdminOrInstructorOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = request.user
        return user and user.is_authenticated and getattr(user, "role", None) in ["admin", "instructor"]


# ===============================
# 🏫 COURSE VIEWSET
# ===============================
class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrInstructorOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Course.objects.none()

        if getattr(user, "role", None) in ["admin", "instructor"]:
            return Course.objects.filter(instructor=user).prefetch_related("weeks", "videos").order_by("-created_at")

        elif getattr(user, "role", None) == "student":
            return Course.objects.prefetch_related("weeks", "videos").order_by("-created_at")

        return Course.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_authenticated:
            raise PermissionDenied("Authentication required.")
        if getattr(user, "role", None) not in ["admin", "instructor"]:
            raise PermissionDenied("Only admins/instructors can add courses.")
        serializer.save(instructor=user)

    # 👨‍🎓 Enroll endpoint
    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        course = self.get_object()
        user = request.user
        if getattr(user, "role", None) != "student":
            return Response({"error": "Only students can enroll."}, status=403)
        course.students.add(user)
        return Response({"message": "✅ Enrolled successfully!"})

    # 🎓 Student’s enrolled courses
    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def mycourses(self, request):
        user = request.user
        if getattr(user, "role", None) != "student":
            return Response({"error": "Only students can view enrolled courses."}, status=403)
        enrolled = Course.objects.filter(students=user).prefetch_related("weeks", "videos", "instructor")
        serializer = self.get_serializer(enrolled, many=True)
        return Response(serializer.data)


# ===============================
# 🧱 WEEK VIEWSET
# ===============================
class WeekViewSet(viewsets.ModelViewSet):
    queryset = Week.objects.all().order_by("order")
    serializer_class = WeekSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrInstructorOrReadOnly]

    def perform_create(self, serializer):
        course = serializer.validated_data.get("course")
        user = self.request.user
        if course.instructor != user:
            raise PermissionDenied("You can only add weeks to your own course.")
        serializer.save()

    @action(detail=False, methods=["post"], permission_classes=[IsAdminOrInstructorOrReadOnly])
    def reorder(self, request):
        """Reorder weeks for a course"""
        try:
            order_data = request.data.get("order", [])
            with transaction.atomic():
                for index, week_id in enumerate(order_data):
                    Week.objects.filter(id=week_id).update(order=index)
            return Response({"message": "✅ Weeks reordered."})
        except Exception as e:
            print("Reorder failed:", e)
            return Response({"error": str(e)}, status=400)


# ===============================
# 📘 TOPIC VIEWSET
# ===============================
class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all().order_by("order")
    serializer_class = TopicSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrInstructorOrReadOnly]

    def perform_create(self, serializer):
        week = serializer.validated_data.get("week")
        user = self.request.user
        if week.course.instructor != user:
            raise PermissionDenied("You can only add topics to your own course.")
        serializer.save()

    @action(detail=False, methods=["post"], permission_classes=[IsAdminOrInstructorOrReadOnly])
    def reorder(self, request):
        """Reorder topics within a week"""
        try:
            order_data = request.data.get("order", [])
            with transaction.atomic():
                for index, topic_id in enumerate(order_data):
                    Topic.objects.filter(id=topic_id).update(order=index)
            return Response({"message": "✅ Topics reordered."})
        except Exception as e:
            print("Topic reorder failed:", e)
            return Response({"error": str(e)}, status=400)

# ===============================
# 🧩 QUIZ VIEWSET
# ===============================
class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrInstructorOrReadOnly]

    def perform_create(self, serializer):
        topic = serializer.validated_data.get("topic")
        user = self.request.user
        if topic.week.course.instructor != user:
            raise PermissionDenied("You can only create quizzes for your own course.")
        serializer.save()


# 🧠 QUIZ QUESTION REORDER + CRUD
class QuizQuestionViewSet(viewsets.ModelViewSet):
    queryset = QuizQuestion.objects.all()
    serializer_class = QuizQuestionSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrInstructorOrReadOnly]

    def perform_create(self, serializer):
        quiz = serializer.validated_data.get("quiz")
        user = self.request.user
        if quiz.topic.week.course.instructor != user:
            raise PermissionDenied("You can only add questions to your own quiz.")
        serializer.save()

    @action(detail=False, methods=["post"], permission_classes=[IsAdminOrInstructorOrReadOnly])
    def reorder(self, request):
        """Reorder quiz questions"""
        order_data = request.data.get("order", [])
        for index, qid in enumerate(order_data):
            QuizQuestion.objects.filter(id=qid).update(order=index)
        return Response({"message": "✅ Questions reordered."})


# ===============================
# 🧑‍🎓 QUIZ SUBMISSIONS
# ===============================
class QuizSubmissionViewSet(viewsets.ModelViewSet):
    queryset = QuizSubmission.objects.all()
    serializer_class = QuizSubmissionSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        quiz = serializer.validated_data.get("quiz")
        if getattr(user, "role", None) != "student":
            raise PermissionDenied("Only students can submit quizzes.")
        submission = serializer.save(student=user)
        submission.reveal_at = quiz.reveal_at_for(submission.created_at)
        submission.save(update_fields=["reveal_at"])

    @action(detail=True, methods=["get"])
    def result(self, request, pk=None):
        """Return quiz results only if reveal date passed"""
        submission = self.get_object()
        if timezone.now() < (submission.reveal_at or timezone.now()):
            return Response({"message": "⏳ Results will be revealed soon."})
        submission.revealed = True
        submission.save(update_fields=["revealed"])
        return Response(self.get_serializer(submission).data)


# ===============================
# 💻 ASSIGNMENT VIEWSET
# ===============================
class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrInstructorOrReadOnly]

    def perform_create(self, serializer):
        topic = serializer.validated_data.get("topic")
        user = self.request.user
        if topic.week.course.instructor != user:
            raise PermissionDenied("You can only create assignments for your own course.")
        serializer.save()


# 🧪 TEST CASE VIEWSET
class AssignmentTestCaseViewSet(viewsets.ModelViewSet):
    queryset = AssignmentTestCase.objects.all().order_by("order")
    serializer_class = AssignmentTestCaseSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrInstructorOrReadOnly]

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        """Reorder test cases"""
        order_data = request.data.get("order", [])
        for index, tid in enumerate(order_data):
            AssignmentTestCase.objects.filter(id=tid).update(order=index)
        return Response({"message": "✅ Test cases reordered."})


# ===============================
# ✍️ ASSIGNMENT SUBMISSION VIEWSET
# ===============================
class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    queryset = AssignmentSubmission.objects.all()
    serializer_class = AssignmentSubmissionSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        assignment = serializer.validated_data.get("assignment")
        if getattr(user, "role", None) != "student":
            raise PermissionDenied("Only students can submit assignments.")
        submission = serializer.save(student=user)
        submission.schedule_evaluation()

    @action(detail=True, methods=["get"])
    def result(self, request, pk=None):
        """Return result if reveal time passed"""
        submission = self.get_object()
        if timezone.now() < (submission.reveal_at or timezone.now()):
            return Response({"message": "⏳ Results will be revealed soon."})
        submission.revealed = True
        submission.save(update_fields=["revealed"])
        return Response(self.get_serializer(submission).data)
