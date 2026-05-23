from ninja import Schema
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal


class SkillOut(Schema):
    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True


class SkillIn(Schema):
    name: str
    slug: str


class CategoryOut(Schema):
    id: int
    name: str
    slug: str
    description: str

    class Config:
        from_attributes = True


class CategoryIn(Schema):
    name: str
    slug: str
    description: str = ''


class CompanyBriefOut(Schema):
    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True


class JobIn(Schema):
    company_id: int
    category_id: Optional[int] = None
    skill_ids: List[int] = []
    title: str
    slug: str
    description: str
    requirements: str = ''
    responsibilities: str = ''
    benefits: str = ''
    job_type: str = 'full_time'
    work_mode: str = 'onsite'
    experience_level: str = 'mid'
    status: str = 'draft'
    location: str = ''
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None
    salary_currency: str = 'USD'
    is_salary_visible: bool = True
    application_deadline: Optional[date] = None


class JobOut(Schema):
    id: int
    title: str
    slug: str
    description: str
    requirements: str
    responsibilities: str
    benefits: str
    job_type: str
    work_mode: str
    experience_level: str
    status: str
    location: str
    salary_min: Optional[Decimal]
    salary_max: Optional[Decimal]
    salary_currency: str
    is_salary_visible: bool
    application_deadline: Optional[date]
    views_count: int
    company_id: int
    company: CompanyBriefOut
    category_id: Optional[int]
    posted_by_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class JobUpdateIn(Schema):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    benefits: Optional[str] = None
    job_type: Optional[str] = None
    work_mode: Optional[str] = None
    experience_level: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None
    salary_currency: Optional[str] = None
    is_salary_visible: Optional[bool] = None
    application_deadline: Optional[date] = None
    skill_ids: Optional[List[int]] = None


class ApplicationIn(Schema):
    job_id: int
    cover_letter: str = ''
    expected_salary: Optional[Decimal] = None


class JobBriefOut(Schema):
    id: int
    title: str
    location: str
    job_type: str
    work_mode: str
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None
    salary_currency: str = 'USD'
    created_at: datetime
    company: CompanyBriefOut

    class Config:
        from_attributes = True


class ApplicationOut(Schema):
    id: int
    job_id: int
    job: JobBriefOut
    applicant_id: int
    cover_letter: str
    status: str
    expected_salary: Optional[Decimal]
    applied_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ApplicationStatusUpdateIn(Schema):
    status: str
    notes: str = ''


class SavedJobOut(Schema):
    id: int
    job_id: int
    job: JobBriefOut
    saved_at: datetime

    class Config:
        from_attributes = True


class JobFilters(Schema):
    search: Optional[str] = None
    job_type: Optional[str] = None
    work_mode: Optional[str] = None
    experience_level: Optional[str] = None
    category_id: Optional[int] = None
    company_id: Optional[int] = None
    location: Optional[str] = None
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None
