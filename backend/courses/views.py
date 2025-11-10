from rest_framework import viewsets, permissions
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db import transaction
from django.utils import timezone
from .models import (
    Course, Week, Topic, TopicVideo,
    Quiz, QuizQuestion, QuizSubmission,
    Assignment, AssignmentTestCase, AssignmentSubmission
)
from .serializers import (
    CourseSerializer, WeekSerializer, TopicSerializer, TopicVideoSerializer,
    QuizSerializer, QuizQuestionSerializer, QuizSubmissionSerializer,
    AssignmentSerializer, AssignmentTestCaseSerializer, AssignmentSubmissionSerializer
)


class IsAdminOrInstructorOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = request.user
        return (
            user.is_authenticated
            and getattr(user, "role", None) in ["admin", "instructor"]
        )


class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrInstructorOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        qs = Course.objects.select_related("instructor").prefetch_related(
            "weeks__topics__videos", "weeks__topics__quizzes", "weeks__topics__assignments"
        )
        if not user.is_authenticated:
            return Course.objects.none()
        role = getattr(user, "role", None)
        if role in ["admin", "instructor"]:
            return qs.filter(instructor=user)
        elif role == "student":
            return qs
        return Course.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if getattr(user, "role", None) not in ["admin", "instructor"]:
            raise PermissionDenied("Only instructors can add courses.")
        serializer.save(instructor=user)


class WeekViewSet(viewsets.ModelViewSet):
    queryset = Week.objects.all()
    serializer_class = WeekSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrInstructorOrReadOnly]

    def perform_create(self, serializer):
        course = serializer.validated_data.get("course")
        user = self.request.user
        if course.instructor != user:
            raise PermissionDenied("You can only add weeks to your own course.")
        serializer.save()

class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrInstructorOrReadOnly]

    def perform_create(self, serializer):
        week = serializer.validated_data.get("week")
        user = self.request.user
        if week.course.instructor != user:
            raise PermissionDenied("You can only add topics to your own course.")
        serializer.save()


class TopicVideoViewSet(viewsets.ModelViewSet):
    queryset = TopicVideo.objects.all()
    serializer_class = TopicVideoSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrInstructorOrReadOnly]

    def perform_create(self, serializer):
        topic = serializer.validated_data.get("topic")
        user = self.request.user
        if topic.week.course.instructor != user:
            raise PermissionDenied("You can only add videos to your own course.")
        serializer.save()


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrInstructorOrReadOnly]


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrInstructorOrReadOnly]


class QuizSubmissionViewSet(viewsets.ModelViewSet):
    queryset = QuizSubmission.objects.all()
    serializer_class = QuizSubmissionSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]


class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    queryset = AssignmentSubmission.objects.all()
    serializer_class = AssignmentSubmissionSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

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
        
class AssignmentTestCaseViewSet(viewsets.ModelViewSet):
    queryset = AssignmentTestCase.objects.all().order_by("order")
    serializer_class = AssignmentTestCaseSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrInstructorOrReadOnly]

    def perform_create(self, serializer):
        assignment = serializer.validated_data.get("assignment")
        user = self.request.user
        if assignment.topic.week.course.instructor != user:
            raise PermissionDenied("You can only add test cases to your own assignment.")
        serializer.save()