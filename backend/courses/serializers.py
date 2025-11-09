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
    topic_title = serializers.ReadOnlyField(source="topic.title")

    class Meta:
        model = TopicVideo
        fields = [
            "id",
            "topic",
            "topic_title",
            "title",
            "description",
            "video_file",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "topic_title"]


# =====================================================
# ❓ Quiz Question Serializer
# =====================================================
class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = [
            "id",
            "quiz",
            "prompt",
            "type",
            "choices",
            "correct_answer",
            "order",
        ]
        read_only_fields = ["id"]
        extra_kwargs = {
            "correct_answer": {"write_only": True},
        }


# =====================================================
# 🧩 Quiz Serializer
# =====================================================
class QuizSerializer(serializers.ModelSerializer):
    topic_title = serializers.ReadOnlyField(source="topic.title")
    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = [
            "id",
            "topic",
            "topic_title",
            "title",
            "instructions",
            "open_at",
            "close_at",
            "reveal_after_days",
            "questions",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "topic_title", "questions"]


# =====================================================
# 🧠 Quiz Submission Serializer
# =====================================================
class QuizSubmissionSerializer(serializers.ModelSerializer):
    quiz_title = serializers.ReadOnlyField(source="quiz.title")
    student_name = serializers.ReadOnlyField(source="student.username")

    class Meta:
        model = QuizSubmission
        fields = [
            "id",
            "quiz",
            "quiz_title",
            "student",
            "student_name",
            "answers",
            "created_at",
            "score",
            "revealed",
            "reveal_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "score",
            "revealed",
            "reveal_at",
            "quiz_title",
            "student_name",
        ]


# =====================================================
# 🧪 Assignment Test Case Serializer
# =====================================================
class AssignmentTestCaseSerializer(serializers.ModelSerializer):
    assignment_title = serializers.ReadOnlyField(source="assignment.title")

    class Meta:
        model = AssignmentTestCase
        fields = [
            "id",
            "assignment",
            "assignment_title",
            "input_data",
            "expected_output",
            "weight",
            "order",
        ]
        read_only_fields = ["id", "assignment_title"]


# =====================================================
# 💻 Assignment Serializer
# =====================================================
class AssignmentSerializer(serializers.ModelSerializer):
    topic_title = serializers.ReadOnlyField(source="topic.title")
    tests = AssignmentTestCaseSerializer(many=True, read_only=True)

    class Meta:
        model = Assignment
        fields = [
            "id",
            "topic",
            "topic_title",
            "title",
            "description",
            "allowed_languages",
            "open_at",
            "due_at",
            "autograde_after_days",
            "reveal_after_days",
            "tests",
            "created_at",
        ]
        read_only_fields = ["id", "topic_title", "tests", "created_at"]


# =====================================================
# ✍️ Assignment Submission Serializer
# =====================================================
class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    assignment_title = serializers.ReadOnlyField(source="assignment.title")
    student_name = serializers.ReadOnlyField(source="student.username")

    class Meta:
        model = AssignmentSubmission
        fields = [
            "id",
            "assignment",
            "assignment_title",
            "student",
            "student_name",
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
        read_only_fields = [
            "id",
            "created_at",
            "status",
            "grade",
            "details",
            "autograde_at",
            "reveal_at",
            "revealed",
            "assignment_title",
            "student_name",
        ]


# =====================================================
# 📘 Topic Serializer
# =====================================================
class TopicSerializer(serializers.ModelSerializer):
    week_title = serializers.ReadOnlyField(source="week.title")
    videos = TopicVideoSerializer(many=True, read_only=True)
    quizzes = QuizSerializer(many=True, read_only=True)
    assignments = AssignmentSerializer(many=True, read_only=True)

    class Meta:
        model = Topic
        fields = [
            "id",
            "week",
            "week_title",
            "title",
            "content",
            "order",
            "videos",
            "quizzes",
            "assignments",
        ]
        read_only_fields = ["id", "week_title", "videos", "quizzes", "assignments"]


# =====================================================
# 🧱 Week Serializer
# =====================================================
class WeekSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source="course.title")
    topics = TopicSerializer(many=True, read_only=True)

    class Meta:
        model = Week
        fields = ["id", "course", "course_title", "title", "order", "topics"]
        read_only_fields = ["id", "course_title", "topics"]


# =====================================================
# 🏫 Course Serializer
# =====================================================
class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.ReadOnlyField(source="instructor.username")
    weeks = WeekSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "category",
            "instructor",
            "instructor_name",
            "weeks",
            "created_at",
        ]
        read_only_fields = ["id", "instructor", "instructor_name", "weeks", "created_at"]