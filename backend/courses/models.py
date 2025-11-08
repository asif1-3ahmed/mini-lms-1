from django.db import models
from django.conf import settings
from django.db.models.signals import post_delete
from django.dispatch import receiver
from cloudinary.uploader import destroy

class Course(models.Model):
    CATEGORY_CHOICES = [
        ('programming', 'Programming'),
        ('design', 'Design'),
        ('business', 'Business'),
        ('other', 'Other'),
    ]
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='instructed_courses'
    )
    students = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='enrolled_courses',
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# 🎥 Video model (local Django storage)
class Video(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="videos")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    video_file = models.FileField(upload_to="videos/")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.course.title})"
        
@receiver(post_delete, sender=Video)
def delete_video_from_cloudinary(sender, instance, **kwargs):
    """
    Automatically delete video file from Cloudinary
    when the Video model is deleted.
    """
    if instance.video_file:
        try:
            # Extract public_id from the Cloudinary URL
            public_id = instance.video_file.name.split("/")[-1].split(".")[0]
            destroy(public_id, resource_type="video")
            print(f"🗑️ Deleted video from Cloudinary: {public_id}")
        except Exception as e:
            print(f"⚠️ Cloudinary delete failed: {e}")