from ninja import Schema
from typing import Optional
from datetime import datetime


class CompanyIn(Schema):
    name: str
    slug: str
    description: str = ''
    website: str = ''
    industry: str = ''
    size: str = ''
    founded_year: Optional[int] = None
    headquarters: str = ''
    linkedin_url: str = ''


class CompanyOut(Schema):
    id: int
    name: str
    slug: str
    description: str
    website: str
    industry: str
    size: str
    founded_year: Optional[int]
    headquarters: str
    linkedin_url: str
    is_verified: bool
    created_at: datetime
    owner_id: int

    class Config:
        from_attributes = True


class CompanyUpdateIn(Schema):
    name: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    founded_year: Optional[int] = None
    headquarters: Optional[str] = None
    linkedin_url: Optional[str] = None
