from django.db import models
from django.conf import settings
from django.db.models.signals import post_delete
from django.dispatch import receiver
from cloudinary.uploader import destroy
from django.utils import timezone
from datetime import timedelta

User = settings.AUTH_USER_MODEL


# 🧱 COURSE MODEL
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


# 🧩 WEEK MODEL
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
    content = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.week.title} → {self.title}"


# 🎥 VIDEO (attached to Topic)
class TopicVideo(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name="videos")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    video_file = models.FileField(upload_to="videos/topics/")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.topic.title})"


# 🧮 QUIZ MODEL
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
        """
        Compute when results become visible for a submission.
        """
        baseline = submitted_at or timezone.now()
        close_ref = self.close_at or baseline
        return close_ref + timedelta(days=self.reveal_after_days)

    def __str__(self):
        return f"Quiz: {self.title} ({self.topic.title})"


# ❓ QUIZ QUESTION MODEL
class QuizQuestion(models.Model):
    TEXT = "text"
    MCQ = "mcq"
    TYPES = [(TEXT, "Text"), (MCQ, "MCQ")]

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    prompt = models.TextField()
    type = models.CharField(max_length=10, choices=TYPES, default=TEXT)
    choices = models.JSONField(default=list, blank=True)  # ["A", "B", "C", "D"]
    correct_answer = models.TextField(blank=True, default="")  # Hidden from students
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"Q: {self.prompt[:40]}..."


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


# 🧑‍💻 ASSIGNMENT MODEL
class Assignment(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name="assignments")
    title = models.CharField(max_length=200, default="New Assignment")
    description = models.TextField(blank=True)
    allowed_languages = models.JSONField(default=list, blank=True)
    open_at = models.DateTimeField(default=timezone.now)
    due_at = models.DateTimeField(null=True, blank=True)
    autograde_after_days = models.PositiveIntegerField(default=3)
    reveal_after_days = models.PositiveIntegerField(default=4)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Assignment: {self.title}"


# 🧪 ASSIGNMENT TEST CASES
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
    status = models.CharField(
        max_length=20, default="pending"
    )  # pending | queued | graded
    grade = models.FloatField(null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)
    autograde_at = models.DateTimeField(null=True, blank=True)
    reveal_at = models.DateTimeField(null=True, blank=True)
    revealed = models.BooleanField(default=False)

    class Meta:
        unique_together = ("assignment", "student")

    def schedule_evaluation(self):
        """
        Automatically compute autograde and reveal deadlines.
        """
        now = timezone.now()
        if not self.autograde_at:
            self.autograde_at = now + timedelta(days=self.assignment.autograde_after_days)
        if not self.reveal_at:
            self.reveal_at = now + timedelta(days=self.assignment.reveal_after_days)
        self.save(update_fields=["autograde_at", "reveal_at"])

    def __str__(self):
        return f"{self.student} → {self.assignment.title}"


# 🧹 AUTO DELETE VIDEO FROM CLOUDINARY WHEN REMOVED
@receiver(post_delete, sender=TopicVideo)
def delete_topic_video_from_cloudinary(sender, instance, **kwargs):
    if instance.video_file:
        try:
            public_id = instance.video_file.name.split("/")[-1].split(".")[0]
            destroy(public_id, resource_type="video")
            print(f"🗑️ Deleted video from Cloudinary: {public_id}")
        except Exception as e:
            print(f"⚠️ Cloudinary delete failed: {e}")
