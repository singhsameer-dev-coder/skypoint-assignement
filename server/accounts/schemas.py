from ninja import Schema, ModelSchema
from pydantic import EmailStr, field_validator
from typing import Optional
from datetime import datetime
from accounts.models import User


class RegisterIn(Schema):
    email: EmailStr
    username: str
    password: str
    first_name: str = ''
    last_name: str = ''
    role: str = 'job_seeker'
    phone: str = ''

    @field_validator('role')
    @classmethod
    def validate_role(cls, v):
        allowed = [r.value for r in User.Role]
        if v not in allowed:
            raise ValueError(f"Role must be one of {allowed}")
        return v


class LoginIn(Schema):
    email: EmailStr
    password: str


class TokenOut(Schema):
    access: str
    refresh: str


class UserOut(Schema):
    id: int
    email: str
    username: str
    first_name: str
    last_name: str
    role: str
    phone: str
    bio: str
    created_at: datetime

    class Config:
        from_attributes = True


class UpdateProfileIn(Schema):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None


class SeekerProfileOut(Schema):
    id: int
    linkedin_url: str
    github_url: str
    portfolio_url: str
    years_of_experience: int
    education: str
    location: str
    is_open_to_work: bool

    class Config:
        from_attributes = True


class SeekerProfileIn(Schema):
    linkedin_url: Optional[str] = ''
    github_url: Optional[str] = ''
    portfolio_url: Optional[str] = ''
    years_of_experience: Optional[int] = 0
    education: Optional[str] = ''
    location: Optional[str] = ''
    is_open_to_work: Optional[bool] = True


class ChangePasswordIn(Schema):
    old_password: str
    new_password: str
