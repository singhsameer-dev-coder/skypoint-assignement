from ninja import Router, Query
from django.shortcuts import get_object_or_404
from django.db.models import Q
from ninja.errors import HttpError
from typing import List

from jobs.models import Job, JobApplication, SavedJob, Skill, Category
from jobs.schemas import (
    JobIn, JobOut, JobUpdateIn,
    ApplicationIn, ApplicationOut, ApplicationStatusUpdateIn,
    SavedJobOut, SkillIn, SkillOut, CategoryIn, CategoryOut, JobFilters
)
from config.auth import jwt_auth
from accounts.models import User

router = Router(tags=['Jobs'])
skill_router = Router(tags=['Skills'])
category_router = Router(tags=['Categories'])


# --- Skills ---

@skill_router.post('', response=SkillOut, auth=jwt_auth)
def create_skill(request, data: SkillIn):
    if Skill.objects.filter(slug=data.slug).exists():
        raise HttpError(400, "Skill slug already exists")
    return Skill.objects.create(**data.dict())


@skill_router.get('', response=List[SkillOut], auth=None)
def list_skills(request, search: str = None):
    qs = Skill.objects.all()
    if search:
        qs = qs.filter(name__icontains=search)
    return list(qs)


# --- Categories ---

@category_router.post('', response=CategoryOut, auth=jwt_auth)
def create_category(request, data: CategoryIn):
    if Category.objects.filter(slug=data.slug).exists():
        raise HttpError(400, "Category slug already exists")
    return Category.objects.create(**data.dict())


@category_router.get('', response=List[CategoryOut], auth=None)
def list_categories(request):
    return list(Category.objects.all())


# --- Jobs ---

@router.post('', response=JobOut, auth=jwt_auth)
def create_job(request, data: JobIn):
    if request.auth.role != User.Role.EMPLOYER:
        raise HttpError(403, "Only employers can post jobs")
    if Job.objects.filter(slug=data.slug).exists():
        raise HttpError(400, "Job slug already exists")

    skill_ids = data.skill_ids
    job_data = data.dict(exclude={'skill_ids'})
    job = Job.objects.create(posted_by=request.auth, **job_data)
    if skill_ids:
        job.skills.set(skill_ids)
    return Job.objects.select_related('company').get(id=job.id)


@router.get('', response=List[JobOut], auth=None)
def list_jobs(request, filters: JobFilters = Query(...)):
    qs = Job.objects.filter(status=Job.Status.ACTIVE)

    if filters.search:
        qs = qs.filter(
            Q(title__icontains=filters.search) |
            Q(description__icontains=filters.search) |
            Q(company__name__icontains=filters.search)
        )
    if filters.job_type:
        qs = qs.filter(job_type=filters.job_type)
    if filters.work_mode:
        qs = qs.filter(work_mode=filters.work_mode)
    if filters.experience_level:
        qs = qs.filter(experience_level=filters.experience_level)
    if filters.category_id:
        qs = qs.filter(category_id=filters.category_id)
    if filters.company_id:
        qs = qs.filter(company_id=filters.company_id)
    if filters.location:
        qs = qs.filter(location__icontains=filters.location)
    if filters.salary_min is not None:
        qs = qs.filter(salary_min__gte=filters.salary_min)
    if filters.salary_max is not None:
        qs = qs.filter(salary_max__lte=filters.salary_max)

    return list(qs.select_related('company'))


# Static routes MUST come before /{job_id} to avoid being swallowed as path params

@router.get('/my-jobs', response=List[JobOut], auth=jwt_auth)
def my_posted_jobs(request):
    return list(Job.objects.filter(posted_by=request.auth).select_related('company'))


@router.get('/my-applications', response=List[ApplicationOut], auth=jwt_auth)
def my_applications(request):
    return list(JobApplication.objects.filter(applicant=request.auth))


@router.get('/saved', response=List[SavedJobOut], auth=jwt_auth)
def list_saved_jobs(request):
    return list(SavedJob.objects.filter(user=request.auth))


@router.patch('/applications/{application_id}', response=ApplicationOut, auth=jwt_auth)
def update_application_status(request, application_id: int, data: ApplicationStatusUpdateIn):
    app = get_object_or_404(JobApplication, id=application_id)
    if app.job.posted_by != request.auth:
        raise HttpError(403, "Not authorized")
    app.status = data.status
    if data.notes:
        app.notes = data.notes
    app.save()
    return app


@router.delete('/applications/{application_id}', auth=jwt_auth)
def withdraw_application(request, application_id: int):
    app = get_object_or_404(JobApplication, id=application_id, applicant=request.auth)
    app.status = JobApplication.Status.WITHDRAWN
    app.save()
    return {'detail': 'Application withdrawn'}


# Dynamic /{job_id} routes come AFTER all static paths

@router.get('/{job_id}', response=JobOut, auth=None)
def get_job(request, job_id: int):
    job = get_object_or_404(Job.objects.select_related('company'), id=job_id)
    Job.objects.filter(id=job_id).update(views_count=job.views_count + 1)
    job.refresh_from_db()
    return job


@router.patch('/{job_id}', response=JobOut, auth=jwt_auth)
def update_job(request, job_id: int, data: JobUpdateIn):
    job = get_object_or_404(Job, id=job_id)
    if job.posted_by != request.auth:
        raise HttpError(403, "You do not own this job")

    skill_ids = data.skill_ids
    update_data = data.dict(exclude_none=True, exclude={'skill_ids'})
    for field, value in update_data.items():
        setattr(job, field, value)
    job.save()

    if skill_ids is not None:
        job.skills.set(skill_ids)
    job.refresh_from_db()
    return Job.objects.select_related('company').get(id=job.id)


@router.delete('/{job_id}', auth=jwt_auth)
def delete_job(request, job_id: int):
    job = get_object_or_404(Job, id=job_id)
    if job.posted_by != request.auth:
        raise HttpError(403, "You do not own this job")
    job.delete()
    return {'detail': 'Job deleted'}


@router.post('/{job_id}/apply', response=ApplicationOut, auth=jwt_auth)
def apply_to_job(request, job_id: int, data: ApplicationIn):
    if request.auth.role != User.Role.JOB_SEEKER:
        raise HttpError(403, "Only job seekers can apply")
    job = get_object_or_404(Job, id=job_id, status=Job.Status.ACTIVE)
    if JobApplication.objects.filter(job=job, applicant=request.auth).exists():
        raise HttpError(400, "Already applied to this job")

    application = JobApplication.objects.create(
        job=job,
        applicant=request.auth,
        cover_letter=data.cover_letter,
        expected_salary=data.expected_salary,
    )
    return application


@router.get('/{job_id}/applications', response=List[ApplicationOut], auth=jwt_auth)
def list_applications(request, job_id: int):
    job = get_object_or_404(Job, id=job_id)
    if job.posted_by != request.auth:
        raise HttpError(403, "Not authorized")
    return list(job.applications.all())


@router.post('/{job_id}/save', response=SavedJobOut, auth=jwt_auth)
def save_job(request, job_id: int):
    job = get_object_or_404(Job, id=job_id)
    saved, created = SavedJob.objects.get_or_create(user=request.auth, job=job)
    if not created:
        raise HttpError(400, "Job already saved")
    return saved


@router.delete('/{job_id}/save', auth=jwt_auth)
def unsave_job(request, job_id: int):
    saved = get_object_or_404(SavedJob, job_id=job_id, user=request.auth)
    saved.delete()
    return {'detail': 'Job removed from saved list'}
