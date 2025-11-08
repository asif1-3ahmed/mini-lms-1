from rest_framework import viewsets, permissions, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Course
from .serializers import CourseSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        # ✅ make sure request.user exists and has role attr
        return bool(request.user and request.user.is_authenticated and getattr(request.user, "role", None) == "admin")


class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [IsAdminOrReadOnly]
    authentication_classes = [TokenAuthentication]  # ✅ ensure TokenAuth applies

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and getattr(user, "role", None) == "admin":
            return Course.objects.filter(instructor=user).order_by('-created_at')
        elif user.is_authenticated and getattr(user, "role", None) == "student":
            return Course.objects.all().order_by('-created_at')
        return Course.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if getattr(user, "role", None) != "admin":
            return Response({"error": "Only admins can add courses!"}, status=status.HTTP_403_FORBIDDEN)
        serializer.save(instructor=user)

    # ✅ Student enroll endpoint
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        course = self.get_object()
        user = request.user
        if getattr(user, "role", None) != 'student':
            return Response({"error": "Only students can enroll."}, status=status.HTTP_403_FORBIDDEN)
        course.students.add(user)
        return Response({"message": "Enrolled successfully!"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def unenroll(self, request, pk=None):
        course = self.get_object()
        user = request.user
        if getattr(user, "role", None) != 'student':
            return Response({"error": "Only students can unenroll."}, status=status.HTTP_403_FORBIDDEN)
        course.students.remove(user)
        return Response({"message": "Unenrolled successfully!"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def mycourses(self, request):
        user = request.user
        if getattr(user, "role", None) != 'student':
            return Response({"error": "Only students can view enrolled courses."}, status=status.HTTP_403_FORBIDDEN)
        enrolled = user.enrolled_courses.all()
        serializer = self.get_serializer(enrolled, many=True)
        return Response(serializer.data)
