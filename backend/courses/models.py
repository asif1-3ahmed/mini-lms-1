from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

User = settings.AUTH_USER_MODEL


# 🏫 COURSE MODEL
class Course(models.Model):
    CATEGORY_CHOICES = [
        ("programming", "Programming"),
        ("design", "Design"),
        ("business", "Business"),
        ("other", "Other"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="other")
    instructor = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="instructed_courses"
    )
    students = models.ManyToManyField(User, related_name="enrolled_courses", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


# 🧱 WEEK MODEL
class Week(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="weeks")
    title = models.CharField(max_length=200, default="Untitled Week")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.course.title} — Week {self.order + 1}: {self.title}"


# 📘 TOPIC MODEL
class Topic(models.Model):
    week = models.ForeignKey(Week, on_delete=models.CASCADE, related_name="topics")
    title = models.CharField(max_length=200, default="Untitled Topic")
    subheading = models.CharField(max_length=255, blank=True)  # ✅ NEW (for headings)
    content = models.TextField(blank=True)                     # rich text (HTML/Markdown)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.week.title} → {self.title}"


# 🎞 TOPIC VIDEO
class TopicVideo(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name="videos")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    # ⚠️ RENAMED: was `video_file`; keep the canonical name `video` to match frontend form-data key
    video = models.FileField(upload_to="videos/topics/")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.topic.title})"


# 🧩 QUIZ MODEL
class Quiz(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name="quizzes")
    title = models.CharField(max_length=200, default="New Quiz")
    instructions = models.TextField(blank=True)
    open_at = models.DateTimeField(default=timezone.now)
    close_at = models.DateTimeField(null=True, blank=True)
    reveal_after_days = models.PositiveIntegerField(default=3)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def reveal_at_for(self, submitted_at=None):
        baseline = submitted_at or timezone.now()
        close_ref = self.close_at or baseline
        return close_ref + timedelta(days=self.reveal_after_days)

    def __str__(self):
        return f"Quiz: {self.title}"


# ❓ QUIZ QUESTION (A/B/C/D with one correct option)
class QuizQuestion(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    # ⚠️ RENAMED: was `prompt`; use `question_text` to match frontend
    question_text = models.TextField()

    # ⚠️ Replaced generic `choices` JSON with explicit options to match UI
    option_a = models.CharField(max_length=255, blank=True, default="")
    option_b = models.CharField(max_length=255, blank=True, default="")
    option_c = models.CharField(max_length=255, blank=True, default="")
    option_d = models.CharField(max_length=255, blank=True, default="")

    # kept: 1-letter correct answer (A/B/C/D)
    correct_option = models.CharField(max_length=1)  # expect "A" | "B" | "C" | "D"

    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"Q: {self.question_text[:40]}..."


# 🧑‍🎓 QUIZ SUBMISSION
class QuizSubmission(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="submissions")
    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="quiz_submissions"
    )
    answers = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    score = models.FloatField(null=True, blank=True)
    revealed = models.BooleanField(default=False)
    reveal_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("quiz", "student")

    def __str__(self):
        return f"{self.student} — {self.quiz.title}"


# 💻 ASSIGNMENT MODEL (with code blocks)
class Assignment(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name="assignments")
    title = models.CharField(max_length=200, default="New Assignment")
    description = models.TextField(blank=True)
    allowed_languages = models.JSONField(default=list, blank=True)
    # ✅ NEW: structured code blocks for creator UI
    # each: {"language":"python","starter_code":"print()","editable":true}
    code_blocks = models.JSONField(default=list, blank=True)

    open_at = models.DateTimeField(default=timezone.now)
    due_at = models.DateTimeField(null=True, blank=True)
    autograde_after_days = models.PositiveIntegerField(default=3)
    reveal_after_days = models.PositiveIntegerField(default=4)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Assignment: {self.title}"


# 🧪 ASSIGNMENT TEST CASE
class AssignmentTestCase(models.Model):
    assignment = models.ForeignKey(
        Assignment, on_delete=models.CASCADE, related_name="tests"
    )
    input_data = models.TextField(blank=True, default="")
    expected_output = models.TextField(blank=True, default="")
    weight = models.FloatField(default=1.0)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"TestCase for {self.assignment.title}"


# ✍️ ASSIGNMENT SUBMISSION
class AssignmentSubmission(models.Model):
    assignment = models.ForeignKey(
        Assignment, on_delete=models.CASCADE, related_name="submissions"
    )
    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="assignment_submissions"
    )
    code = models.TextField()
    language = models.CharField(max_length=20, default="python")
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default="pending")
    grade = models.FloatField(null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)
    autograde_at = models.DateTimeField(null=True, blank=True)
    reveal_at = models.DateTimeField(null=True, blank=True)
    revealed = models.BooleanField(default=False)

    class Meta:
        unique_together = ("assignment", "student")

    def __str__(self):
        return f"{self.student} — {self.assignment.title}"
