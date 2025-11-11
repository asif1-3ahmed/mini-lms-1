from rest_framework import serializers
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

# =====================================================
# 🎞️ Topic Video Serializer
# =====================================================
class TopicVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopicVideo
        fields = ["id", "topic", "title", "description", "video", "created_at"]
        read_only_fields = ["id", "created_at"]


# =====================================================
# ❓ Quiz Question Serializer
# =====================================================
class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = [
            "id",
            "quiz",
            "question_text",
            "option_a",
            "option_b",
            "option_c",
            "option_d",
            "correct_option",
            "order",
        ]
        read_only_fields = ["id"]


# =====================================================
# 🧩 Quiz Serializer
# =====================================================
class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = [
            "id",
            "topic",
            "title",
            "instructions",
            "open_at",
            "close_at",
            "reveal_after_days",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


# =====================================================
# 🧪 Assignment Test Case Serializer
# =====================================================
class AssignmentTestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentTestCase
        fields = [
            "id",
            "assignment",
            "input_data",
            "expected_output",
            "weight",
            "order",
        ]
        read_only_fields = ["id"]


# =====================================================
# 💻 Assignment Serializer
# =====================================================
class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = [
            "id",
            "topic",
            "title",
            "description",
            "allowed_languages",
            "code_blocks",
            "open_at",
            "due_at",
            "autograde_after_days",
            "reveal_after_days",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


# =====================================================
# 📘 Topic Serializer (short)
# =====================================================
class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ["id", "week", "title", "subheading", "content", "order"]
        read_only_fields = ["id"]


# =====================================================
# 🧱 Week Serializer
# =====================================================
class WeekSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)

    class Meta:
        model = Week
        fields = ["id", "course", "title", "order", "topics"]
        read_only_fields = ["id", "topics"]


# =====================================================
# 🧠 Quiz Submission Serializer
# =====================================================
class QuizSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizSubmission
        fields = [
            "id",
            "quiz",
            "student",
            "answers",
            "created_at",
            "score",
            "revealed",
            "reveal_at",
        ]
        read_only_fields = ["id", "created_at"]


# =====================================================
# ✍️ Assignment Submission Serializer
# =====================================================
class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentSubmission
        fields = [
            "id",
            "assignment",
            "student",
            "code",
            "language",
            "created_at",
            "status",
            "grade",
            "details",
            "autograde_at",
            "reveal_at",
            "revealed",
        ]
        read_only_fields = ["id", "created_at"]


# =====================================================
# 🏫 Course List & Detail Serializers
# =====================================================
class CourseListSerializer(serializers.ModelSerializer):
    instructor_name = serializers.ReadOnlyField(source="instructor.username")

    class Meta:
        model = Course
        fields = ["id", "title", "category", "instructor_name", "created_at"]


class CourseDetailSerializer(serializers.ModelSerializer):
    instructor_name = serializers.ReadOnlyField(source="instructor.username")
    weeks = WeekSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "category",
            "instructor_name",
            "weeks",
            "created_at",
        ]
