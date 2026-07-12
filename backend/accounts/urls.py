from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, PasswordResetView, PasswordResetConfirmView
urlpatterns = [path("register/", RegisterView.as_view()), path("login/", LoginView.as_view()), path("token/refresh/", TokenRefreshView.as_view()), path("password-reset/", PasswordResetView.as_view()), path("password-reset/confirm/", PasswordResetConfirmView.as_view())]
