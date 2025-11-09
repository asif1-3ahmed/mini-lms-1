from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),

    # keep courses here
    path("api/courses/", include("courses.course_urls")),

    # new: split resources so they don't get shadowed by CourseViewSet
    path("api/weeks/", include("courses.week_urls")),
    path("api/topics/", include("courses.topic_urls")),
    path("api/topicvideos/", include("courses.topicvideo_urls")),
    path("api/quizzes/", include("courses.quiz_urls")),
    path("api/quizquestions/", include("courses.quizquestion_urls")),
    path("api/quizsubmissions/", include("courses.quizsubmission_urls")),
    path("api/assignments/", include("courses.assignment_urls")),
    path("api/assignmenttests/", include("courses.assignmenttest_urls")),
    path("api/assignmentsubmissions/", include("courses.assignmentsubmission_urls")),

    path("api/accounts/", include("accounts.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)