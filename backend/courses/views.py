from rest_framework import viewsets, permissions
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
import traceback

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
    CourseListSerializer,
    CourseDetailSerializer,
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


# =====================================================
# ⚙️ Custom Permissions
# =====================================================
class IsAdminOrInstructorOrReadOnly(permissions.BasePermission):
    """Allow read-only for everyone, but write only for admins/instructors."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = request.user
        return (
            user.is_authenticated
            and getattr(user, "role", None) in ["admin", "instructor"]
        )


# =====================================================
# 🏫 Course ViewSet
# =====================================================
class CourseViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrInstructorOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        print("🧠 get_queryset called for:", user)

        if not user.is_authenticated:
            print("⚠️ User not authenticated")
            return Course.objects.none()

        qs = Course.objects.select_related("instructor").prefetch_related("weeks__topics")
        role = getattr(user, "role", None) or ("admin" if user.is_staff else "student")
        print("🔹 Role:", role)

        if role in ["admin", "instructor"]:
            return qs.filter(instructor=user)
        elif role == "student":
            return qs.filter(students=user)
        print("❌ No role match, returning none")
        return Course.objects.none()

    def get_serializer_class(self):
        if self.action == "list":
            print("📄 Using CourseListSerializer")
            return CourseListSerializer
        print("📘 Using CourseDetailSerializer")
        return CourseDetailSerializer  # ✅ fixed indentation!

    def list(self, request, *args, **kwargs):
        print("🚀 /api/courses/ called by:", request.user)
        try:
            queryset = self.get_queryset()
            print(f"📦 Courses to serialize: {queryset.count()}")
            serializer_class = self.get_serializer_class()
            serializer = serializer_class(queryset, many=True)
            print("✅ Serialization OK — returning data")
            return Response(serializer.data)
        except Exception as e:
            print("🔥 CRASH IN COURSE LIST:", str(e))
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)


# =====================================================
# 🧱 Week ViewSet
# =====================================================
class WeekViewSet(viewsets.ModelViewSet):
    queryset = Week.objects.all()
    serializer_class = WeekSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrInstructorOrReadOnly]

    def perform_create(self, serializer):
        course_id = self.request.data.get("course")
        if not course_id:
            raise PermissionDenied("Course ID is required.")
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            raise PermissionDenied("Invalid course ID.")
        user = self.request.user
        if course.instructor != user:
            raise PermissionDenied("You can only add weeks to your own courses.")
        serializer.save(course=course)


class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.select_related("week", "week__course").prefetch_related(
        "videos", "quizzes", "assignments"
    )
    serializer_class = TopicSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrInstructorOrReadOnly]


class TopicVideoViewSet(viewsets.ModelViewSet):
    queryset = TopicVideo.objects.select_related("topic", "topic__week")
    serializer_class = TopicVideoSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrInstructorOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.select_related("topic", "topic__week").prefetch_related("questions")
    serializer_class = QuizSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrInstructorOrReadOnly]


class QuizQuestionViewSet(viewsets.ModelViewSet):
    queryset = QuizQuestion.objects.select_related("quiz", "quiz__topic")
    serializer_class = QuizQuestionSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrInstructorOrReadOnly]


class QuizSubmissionViewSet(viewsets.ModelViewSet):
    queryset = QuizSubmission.objects.select_related("quiz", "student")
    serializer_class = QuizSubmissionSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.select_related("topic", "topic__week").prefetch_related("tests")
    serializer_class = AssignmentSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrInstructorOrReadOnly]


class AssignmentTestCaseViewSet(viewsets.ModelViewSet):
    queryset = AssignmentTestCase.objects.select_related("assignment", "assignment__topic")
    serializer_class = AssignmentTestCaseSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrInstructorOrReadOnly]


class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    queryset = AssignmentSubmission.objects.select_related("assignment", "student")
    serializer_class = AssignmentSubmissionSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
