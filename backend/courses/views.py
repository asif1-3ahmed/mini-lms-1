from rest_framework import viewsets, permissions, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Course, Video
from .serializers import CourseSerializer, VideoSerializer
import traceback


# 🔒 Custom permission: only admins can modify, others read-only
class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = request.user
        return (
            user
            and user.is_authenticated
            and getattr(user, "role", None) == "admin"
        )


# 🎓 Courses CRUD + Enroll
class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if getattr(user, "role", None) == "admin":
                return Course.objects.filter(instructor=user).order_by("-created_at")
            elif getattr(user, "role", None) == "student":
                return Course.objects.all().order_by("-created_at")
        return Course.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        try:
            if not user.is_authenticated:
                raise PermissionDenied("Authentication required to create courses.")
            if getattr(user, "role", None) != "admin":
                raise PermissionDenied("Only admins can add courses!")
            serializer.save(instructor=user)
        except Exception as e:
            print("🔥 Course creation failed:", e)
            traceback.print_exc()
            raise e

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        course = self.get_object()
        user = request.user
        if getattr(user, "role", None) != "student":
            return Response(
                {"error": "Only students can enroll."},
                status=status.HTTP_403_FORBIDDEN,
            )
        course.students.add(user)
        return Response({"message": "Enrolled successfully!"}, status=status.HTTP_200_OK)
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def mycourses(self, request):
        user = request.user
        if getattr(user, "role", None) != "student":
            return Response(
                {"error": "Only students can view enrolled courses."},
                status=status.HTTP_403_FORBIDDEN,
            )
        enrolled = Course.objects.filter(students=user).prefetch_related("videos", "instructor")
        serializer = self.get_serializer(enrolled, many=True)
        return Response(serializer.data)


# 🎥 Video Upload + List
class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all().order_by("-created_at")
    serializer_class = VideoSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        course = serializer.validated_data.get("course")

        if not user.is_authenticated:
            raise PermissionDenied("Authentication required.")

        if getattr(user, "role", None) not in ["admin", "instructor"]:
            raise PermissionDenied("Only admins or instructors can upload videos.")

        if course.instructor != user:
            raise PermissionDenied("You can only upload videos for your own courses.")

        serializer.save()
