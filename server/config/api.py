from ninja import NinjaAPI
from ninja.errors import HttpError, ValidationError
from django.http import HttpRequest

from accounts.api import router as accounts_router
from companies.api import router as companies_router
from jobs.api import router as jobs_router
from jobs.api import skill_router, category_router

api = NinjaAPI(
    title='Job Portal API',
    version='1.0.0',
    description='REST API for the Job Portal application',
    docs_url='/docs',
)

api.add_router('/auth', accounts_router)
api.add_router('/companies', companies_router)
api.add_router('/jobs', jobs_router)
api.add_router('/skills', skill_router)
api.add_router('/categories', category_router)


@api.exception_handler(HttpError)
def http_error_handler(request: HttpRequest, exc: HttpError):
    return api.create_response(request, {'detail': exc.message}, status=exc.status_code)
