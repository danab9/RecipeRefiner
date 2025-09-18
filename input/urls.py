from django.urls import path

from . import views

urlpatterns = [
    path("", views.get_url, name="get_url"),
    path("register/", views.register_user, name="register"),
    path("login/", views.login_user, name="login"),
]