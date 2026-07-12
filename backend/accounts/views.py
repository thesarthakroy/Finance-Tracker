from django.contrib.auth.models import User
from django.db.models import Q
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer, PasswordResetSerializer

class AuthThrottle(AnonRateThrottle):
    rate = "10/min"

class EmailOrUsernameTokenSerializer(TokenObtainPairSerializer):
    """Accept the account's username or its unique email address at sign-in."""
    def validate(self, attrs):
        identifier = attrs.get("username", "").strip()
        user = User.objects.filter(Q(username__iexact=identifier) | Q(email__iexact=identifier)).only("username").first()
        attrs["username"] = user.username if user else identifier
        return super().validate(attrs)

class LoginView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenSerializer
    throttle_classes = [AuthThrottle]

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    throttle_classes = [AuthThrottle]

class PasswordResetView(generics.GenericAPIView):
    serializer_class = PasswordResetSerializer
    permission_classes = [AllowAny]
    throttle_classes = [AuthThrottle]
    def post(self, request):
        serializer = self.get_serializer(data=request.data); serializer.is_valid(raise_exception=True)
        user = User.objects.filter(email__iexact=serializer.validated_data["email"]).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk)); token = default_token_generator.make_token(user)
            send_mail("Password reset", f"Use this reset token: {uid}/{token}", None, [user.email])
        return Response({"detail": "If the address exists, reset instructions have been sent."})

class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthThrottle]
    def post(self, request):
        uid = request.data.get("uid"); token = request.data.get("token"); password = request.data.get("password", "")
        if not uid or not token or len(password) < 8: return Response({"detail": "Invalid reset data."}, status=status.HTTP_400_BAD_REQUEST)
        try: user = User.objects.get(pk=force_str(urlsafe_base64_decode(uid)))
        except (User.DoesNotExist, ValueError, TypeError): return Response({"detail": "Invalid reset data."}, status=status.HTTP_400_BAD_REQUEST)
        if not default_token_generator.check_token(user, token): return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(password); user.save()
        return Response({"detail": "Password updated."})

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "username": user.username,
            "email": user.email,
            "date_joined": user.date_joined,
            "last_login": user.last_login,
        })

    def put(self, request):
        user = request.user
        email = request.data.get("email")
        if email:
            if User.objects.filter(email__iexact=email).exclude(pk=user.pk).exists():
                return Response({"detail": "An account with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)
            user.email = email

        password = request.data.get("password")
        new_password = request.data.get("new_password")
        if password and new_password:
            if not user.check_password(password):
                return Response({"detail": "Incorrect old password."}, status=status.HTTP_400_BAD_REQUEST)
            if len(new_password) < 8:
                return Response({"detail": "New password must be at least 8 characters long."}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(new_password)

        user.save()
        return Response({
            "username": user.username,
            "email": user.email,
            "date_joined": user.date_joined,
            "last_login": user.last_login,
            "detail": "Profile updated successfully."
        })
