# backend/courses/urls.py
from django.urls import include, path

urlpatterns = [
    # 🏫 Courses
    path("", include("courses.course_urls")),

    # 🧱 Course Structure
    path("weeks/", include("courses.week_urls")),
    path("topics/", include("courses.topic_urls")),
    path("topicvideos/", include("courses.topicvideo_urls")),

    # 🧩 Quizzes
    path("quizzes/", include("courses.quiz_urls")),
    path("quizquestions/", include("courses.quizquestion_urls")),
    path("quizsubmissions/", include("courses.quizsubmission_urls")),

    # 💻 Assignments
    path("assignments/", include("courses.assignment_urls")),
    path("assignmenttests/", include("courses.assignmenttestcase_urls")),
    path("assignmentsubmissions/", include("courses.assignmentsubmission_urls")),
]
