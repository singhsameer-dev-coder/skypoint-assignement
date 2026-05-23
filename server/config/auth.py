from ninja.security import HttpBearer
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from accounts.models import User


class JWTAuth(HttpBearer):
    def authenticate(self, request, token: str):
        try:
            validated = AccessToken(token)
            user_id = validated['user_id']
            user = User.objects.get(id=user_id, is_active=True)
            return user
        except (TokenError, InvalidToken, User.DoesNotExist):
            return None


jwt_auth = JWTAuth()
