from django.contrib import admin
from .models import (
    Course, Week, Topic, TopicVideo,
    Quiz, QuizQuestion, QuizSubmission,
    Assignment, AssignmentTestCase, AssignmentSubmission
)

# 🏫 Course inline display
class WeekInline(admin.TabularInline):
    model = Week
    extra = 0


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title", "instructor", "category", "created_at")
    search_fields = ("title", "instructor__username")
    list_filter = ("category", "created_at")
    inlines = [WeekInline]


# 🧱 Week admin
@admin.register(Week)
class WeekAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "order")
    list_filter = ("course",)
    ordering = ("course", "order")


# 📘 Topic admin
@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ("title", "week", "order")
    search_fields = ("title",)
    ordering = ("week", "order")


# 🎥 Video admin
@admin.register(TopicVideo)
class TopicVideoAdmin(admin.ModelAdmin):
    list_display = ("title", "topic", "created_at")
    search_fields = ("title", "topic__title")


# 🧠 Quiz admin
@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ("title", "topic", "open_at", "close_at")
    search_fields = ("title", "topic__title")


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ("short_prompt", "quiz", "question_type")

    def short_prompt(self, obj):
        """Show a short preview of the question text."""
        return (obj.prompt[:50] + "...") if len(obj.prompt) > 50 else obj.prompt
    short_prompt.short_description = "Prompt"

    def question_type(self, obj):
        """Return the question type safely (since 'type' is reserved)."""
        return obj.type
    question_type.short_description = "Type"


@admin.register(QuizSubmission)
class QuizSubmissionAdmin(admin.ModelAdmin):
    list_display = ("quiz", "student", "score", "revealed", "reveal_at")
    list_filter = ("revealed",)
    search_fields = ("quiz__title", "student__username")


# 💻 Assignment admin
@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ("title", "topic", "open_at", "due_at")
    search_fields = ("title", "topic__title")


@admin.register(AssignmentTestCase)
class AssignmentTestCaseAdmin(admin.ModelAdmin):
    list_display = ("assignment", "order", "weight")
    ordering = ("assignment", "order")


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ("assignment", "student", "status", "grade", "revealed")
    list_filter = ("status", "revealed")
    search_fields = ("assignment__title", "student__username")
