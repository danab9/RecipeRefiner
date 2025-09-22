from django.urls import path

from . import views

urlpatterns = [
    path("", views.get_url, name="get_url"),
    path("register/", views.register_user, name="register"),
    path("login/", views.login_user, name="login"),
    path("logout/", views.logout_user, name="logout"),
    path("history/", views.get_user_history, name="user_history"),
    path("delete/", views.delete_recipe, name="delete_recipe"),
]