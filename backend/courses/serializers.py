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

# ===============================
# 🎞 Topic Video Serializer
# ===============================
class TopicVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopicVideo
        fields = ["id", "topic", "title", "description", "video_file", "created_at"]
        read_only_fields = ["created_at"]


# ===============================
# ❓ Quiz Question Serializer
# ===============================
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
        extra_kwargs = {
            "correct_answer": {"write_only": True},
        }


# ===============================
# 🧩 Quiz Serializer (with nested questions)
# ===============================
class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True)

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
            "questions",
            "created_at",
        ]
        read_only_fields = ["created_at"]

    def create(self, validated_data):
        questions_data = validated_data.pop("questions", [])
        quiz = Quiz.objects.create(**validated_data)
        for q in questions_data:
            QuizQuestion.objects.create(quiz=quiz, **q)
        return quiz

    def update(self, instance, validated_data):
        questions_data = validated_data.pop("questions", None)
        instance = super().update(instance, validated_data)
        if questions_data is not None:
            instance.questions.all().delete()
            for q in questions_data:
                QuizQuestion.objects.create(quiz=instance, **q)
        return instance


# ===============================
# 🧑‍🎓 Quiz Submission Serializer
# ===============================
class QuizSubmissionSerializer(serializers.ModelSerializer):
    quiz_title = serializers.ReadOnlyField(source="quiz.title")

    class Meta:
        model = QuizSubmission
        fields = [
            "id",
            "quiz",
            "quiz_title",
            "answers",
            "created_at",
            "score",
            "revealed",
            "reveal_at",
        ]
        read_only_fields = ["created_at", "score", "revealed", "reveal_at"]


# ===============================
# 🧪 Assignment Test Case Serializer
# ===============================
class AssignmentTestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentTestCase
        fields = ["id", "assignment", "input_data", "expected_output", "weight", "order"]


# ===============================
# 💻 Assignment Serializer (with test cases)
# ===============================
class AssignmentSerializer(serializers.ModelSerializer):
    tests = AssignmentTestCaseSerializer(many=True, read_only=True)

    class Meta:
        model = Assignment
        fields = [
            "id",
            "topic",
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
        read_only_fields = ["created_at"]


# ===============================
# ✍️ Assignment Submission Serializer
# ===============================
class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    assignment_title = serializers.ReadOnlyField(source="assignment.title")

    class Meta:
        model = AssignmentSubmission
        fields = [
            "id",
            "assignment",
            "assignment_title",
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
            "created_at",
            "status",
            "grade",
            "details",
            "autograde_at",
            "reveal_at",
            "revealed",
        ]

    def create(self, validated_data):
        submission = super().create(validated_data)
        submission.schedule_evaluation()
        return submission


# ===============================
# 📘 Topic Serializer (with nested media & activities)
# ===============================
class TopicSerializer(serializers.ModelSerializer):
    videos = TopicVideoSerializer(many=True, read_only=True)
    quizzes = QuizSerializer(many=True, read_only=True)
    assignments = AssignmentSerializer(many=True, read_only=True)

    class Meta:
        model = Topic
        fields = [
            "id",
            "week",
            "title",
            "content",
            "order",
            "videos",
            "quizzes",
            "assignments",
        ]


# ===============================
# 🧱 Week Serializer (with topics)
# ===============================
class WeekSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)

    class Meta:
        model = Week
        fields = ["id", "course", "title", "order", "topics"]


# ===============================
# 🏫 Course Serializer (nested structure)
# ===============================
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
            "weeks",  # new nested content
            "created_at",
        ]
        read_only_fields = ["instructor", "instructor_name", "created_at"]