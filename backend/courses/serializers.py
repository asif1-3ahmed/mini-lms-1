from rest_framework import serializers
from .models import Course, Video

# 🎥 Video Serializer
class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = "__all__"


# 📘 Course Serializer (with nested videos + instructor name)
class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.ReadOnlyField(source="instructor.username")
    videos = VideoSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "category",
            "instructor",
            "instructor_name",
            "videos",
            "created_at",
        ]
        read_only_fields = ["instructor", "instructor_name", "created_at"]
