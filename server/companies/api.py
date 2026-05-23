from ninja import Router
from django.shortcuts import get_object_or_404
from ninja.errors import HttpError
from typing import List

from companies.models import Company
from companies.schemas import CompanyIn, CompanyOut, CompanyUpdateIn
from config.auth import jwt_auth
from accounts.models import User

router = Router(tags=['Companies'])


@router.post('', response=CompanyOut, auth=jwt_auth)
def create_company(request, data: CompanyIn):
    if request.auth.role != User.Role.EMPLOYER:
        raise HttpError(403, "Only employers can create companies")
    if Company.objects.filter(slug=data.slug).exists():
        raise HttpError(400, "Company slug already exists")
    company = Company.objects.create(owner=request.auth, **data.dict())
    return company


@router.get('', response=List[CompanyOut], auth=None)
def list_companies(request, search: str = None):
    qs = Company.objects.all()
    if search:
        qs = qs.filter(name__icontains=search)
    return list(qs)


@router.get('/{company_id}', response=CompanyOut, auth=None)
def get_company(request, company_id: int):
    return get_object_or_404(Company, id=company_id)


@router.patch('/{company_id}', response=CompanyOut, auth=jwt_auth)
def update_company(request, company_id: int, data: CompanyUpdateIn):
    company = get_object_or_404(Company, id=company_id)
    if company.owner != request.auth:
        raise HttpError(403, "You do not own this company")
    for field, value in data.dict(exclude_none=True).items():
        setattr(company, field, value)
    company.save()
    return company


@router.delete('/{company_id}', auth=jwt_auth)
def delete_company(request, company_id: int):
    company = get_object_or_404(Company, id=company_id)
    if company.owner != request.auth:
        raise HttpError(403, "You do not own this company")
    company.delete()
    return {'detail': 'Company deleted'}


@router.get('/my/companies', response=List[CompanyOut], auth=jwt_auth)
def my_companies(request):
    return list(Company.objects.filter(owner=request.auth))
