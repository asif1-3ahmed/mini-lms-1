from rest_framework import viewsets, permissions, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Course
from .serializers import CourseSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        # Allow safe methods for everyone
        if request.method in permissions.SAFE_METHODS:
            return True

        # Only authenticated admins can modify
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and getattr(user, "role", None) == "admin"
        )


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
            # ✅ Print error in Render logs for debugging
            print("🔥 Course creation failed:", e)
            traceback.print_exc()
            raise e

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        course = self.get_object()
        user = request.user
        if getattr(user, "role", None) != "student":
            return Response({"error": "Only students can enroll."}, status=status.HTTP_403_FORBIDDEN)
        course.students.add(user)
        return Response({"message": "Enrolled successfully!"}, status=status.HTTP_200_OK)