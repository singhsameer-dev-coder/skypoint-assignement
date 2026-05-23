from ninja import Router
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from ninja.errors import HttpError

from accounts.models import User, JobSeekerProfile
from accounts.schemas import (
    RegisterIn, LoginIn, TokenOut, UserOut,
    UpdateProfileIn, SeekerProfileOut, SeekerProfileIn, ChangePasswordIn
)
from config.auth import jwt_auth

router = Router(tags=['Accounts'])


@router.post('/register', response=UserOut, auth=None)
def register(request, data: RegisterIn):
    if User.objects.filter(email=data.email).exists():
        raise HttpError(400, "Email already registered")
    if User.objects.filter(username=data.username).exists():
        raise HttpError(400, "Username already taken")

    user = User.objects.create_user(
        email=data.email,
        username=data.username,
        password=data.password,
        first_name=data.first_name,
        last_name=data.last_name,
        role=data.role,
        phone=data.phone,
    )
    if user.role == User.Role.JOB_SEEKER:
        JobSeekerProfile.objects.create(user=user)
    return user


@router.post('/login', response=TokenOut, auth=None)
def login(request, data: LoginIn):
    user = authenticate(request, username=data.email, password=data.password)
    if not user:
        raise HttpError(401, "Invalid credentials")
    refresh = RefreshToken.for_user(user)
    return {'access': str(refresh.access_token), 'refresh': str(refresh)}


@router.post('/refresh', response=TokenOut, auth=None)
def refresh_token(request, refresh: str):
    try:
        token = RefreshToken(refresh)
        return {'access': str(token.access_token), 'refresh': str(token)}
    except Exception:
        raise HttpError(401, "Invalid or expired refresh token")


@router.get('/me', response=UserOut, auth=jwt_auth)
def get_me(request):
    return request.auth


@router.patch('/me', response=UserOut, auth=jwt_auth)
def update_me(request, data: UpdateProfileIn):
    user = request.auth
    for field, value in data.dict(exclude_none=True).items():
        setattr(user, field, value)
    user.save()
    return user


@router.post('/me/change-password', auth=jwt_auth)
def change_password(request, data: ChangePasswordIn):
    user = request.auth
    if not user.check_password(data.old_password):
        raise HttpError(400, "Old password is incorrect")
    user.set_password(data.new_password)
    user.save()
    return {'detail': 'Password changed successfully'}


@router.get('/me/seeker-profile', response=SeekerProfileOut, auth=jwt_auth)
def get_seeker_profile(request):
    user = request.auth
    if user.role != User.Role.JOB_SEEKER:
        raise HttpError(403, "Only job seekers have a seeker profile")
    profile, _ = JobSeekerProfile.objects.get_or_create(user=user)
    return profile


@router.patch('/me/seeker-profile', response=SeekerProfileOut, auth=jwt_auth)
def update_seeker_profile(request, data: SeekerProfileIn):
    user = request.auth
    if user.role != User.Role.JOB_SEEKER:
        raise HttpError(403, "Only job seekers have a seeker profile")
    profile, _ = JobSeekerProfile.objects.get_or_create(user=user)
    for field, value in data.dict(exclude_none=True).items():
        setattr(profile, field, value)
    profile.save()
    return profile


@router.get('/users/{user_id}', response=UserOut, auth=jwt_auth)
def get_user(request, user_id: int):
    return get_object_or_404(User, id=user_id, is_active=True)
