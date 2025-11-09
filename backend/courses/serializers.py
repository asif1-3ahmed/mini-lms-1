from rest_framework import serializers
from .models import (
    Course, Week, Topic, TopicVideo,
    Quiz, QuizQuestion, QuizSubmission,
    Assignment, AssignmentTestCase, AssignmentSubmission
)


class TopicVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopicVideo
        fields = "__all__"


class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = "__all__"
        extra_kwargs = {"correct_answer": {"write_only": True}}


class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, required=False)

    class Meta:
        model = Quiz
        fields = "__all__"

    def create(self, validated_data):
        questions_data = validated_data.pop("questions", [])
        quiz = Quiz.objects.create(**validated_data)
        for q in questions_data:
            QuizQuestion.objects.create(quiz=quiz, **q)
        return quiz


class AssignmentTestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentTestCase
        fields = "__all__"


class AssignmentSerializer(serializers.ModelSerializer):
    tests = AssignmentTestCaseSerializer(many=True, read_only=True)

    class Meta:
        model = Assignment
        fields = "__all__"


class TopicSerializer(serializers.ModelSerializer):
    videos = TopicVideoSerializer(many=True, read_only=True)
    quizzes = QuizSerializer(many=True, read_only=True)
    assignments = AssignmentSerializer(many=True, read_only=True)

    class Meta:
        model = Topic
        fields = "__all__"


class WeekSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)

    class Meta:
        model = Week
        fields = "__all__"


class CourseSerializer(serializers.ModelSerializer):
    weeks = WeekSerializer(many=True, read_only=True)
    instructor_name = serializers.ReadOnlyField(source="instructor.username")

    class Meta:
        model = Course
        fields = "__all__"