from rest_framework import serializers
from .models import (
    Course, Week, Topic, TopicVideo,
    Quiz, QuizQuestion, QuizSubmission,
    Assignment, AssignmentTestCase, AssignmentSubmission
)

# ===============================
# 🎞️ Topic Video Serializer
# ===============================
class TopicVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopicVideo
        fields = "__all__"


# ===============================
# ❓ Quiz Question Serializer
# ===============================
class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = "__all__"
        extra_kwargs = {
            "correct_answer": {"write_only": True},
        }


# ===============================
# 🧩 Quiz Serializer
# ===============================
class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = "__all__"


# ===============================
# 🧠 Quiz Submission Serializer
# ===============================
class QuizSubmissionSerializer(serializers.ModelSerializer):
    quiz_title = serializers.ReadOnlyField(source="quiz.title")

    class Meta:
        model = QuizSubmission
        fields = "__all__"
        read_only_fields = ["created_at", "score", "revealed", "reveal_at"]


# ===============================
# 🧪 Assignment Test Case Serializer
# ===============================
class AssignmentTestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentTestCase
        fields = "__all__"


# ===============================
# 💻 Assignment Serializer
# ===============================
class AssignmentSerializer(serializers.ModelSerializer):
    tests = AssignmentTestCaseSerializer(many=True, read_only=True)

    class Meta:
        model = Assignment
        fields = "__all__"


# ===============================
# ✍️ Assignment Submission Serializer
# ===============================
class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    assignment_title = serializers.ReadOnlyField(source="assignment.title")

    class Meta:
        model = AssignmentSubmission
        fields = "__all__"
        read_only_fields = [
            "created_at", "status", "grade",
            "details", "autograde_at", "reveal_at", "revealed"
        ]


# ===============================
# 📘 Topic Serializer
# ===============================
class TopicSerializer(serializers.ModelSerializer):
    videos = TopicVideoSerializer(many=True, read_only=True)
    quizzes = QuizSerializer(many=True, read_only=True)
    assignments = AssignmentSerializer(many=True, read_only=True)

    class Meta:
        model = Topic
        fields = "__all__"


# ===============================
# 🧱 Week Serializer
# ===============================
class WeekSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)

    class Meta:
        model = Week
        fields = "__all__"


# ===============================
# 🏫 Course Serializer
# ===============================
class CourseSerializer(serializers.ModelSerializer):
    weeks = WeekSerializer(many=True, read_only=True)
    instructor_name = serializers.ReadOnlyField(source="instructor.username")

    class Meta:
        model = Course
        fields = "__all__"