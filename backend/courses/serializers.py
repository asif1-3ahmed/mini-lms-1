from rest_framework import serializers
from .models import Course

class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.ReadOnlyField(source='instructor.username')

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'category', 'instructor', 'instructor_name', 'created_at']
        read_only_fields = ['instructor', 'instructor_name', 'created_at']
