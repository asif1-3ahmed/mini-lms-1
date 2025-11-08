from django.urls import path
from .views import RegisterAPI, LoginAPI, MeAPI

urlpatterns = [
    path("register/", RegisterAPI.as_view()),
    path("login/", LoginAPI.as_view()),
    path("me/", MeAPI.as_view()),
]
