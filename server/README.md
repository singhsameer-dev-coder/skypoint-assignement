# Backend — Django + Django Ninja

REST API for the Job Portal, built with Django and Django Ninja (FastAPI-style routing with Pydantic v2 validation).

---

## Tech Stack

- **Python 3.12**
- **Django 4.2** — ORM, migrations, admin
- **Django Ninja 1.x** — API routing, request/response validation
- **PostgreSQL 16** — primary database
- **djangorestframework-simplejwt** — JWT authentication
- **django-cors-headers** — CORS for the React frontend
- **python-decouple** — environment variable management

---

## Project Structure

```
server/
├── config/
│   ├── settings.py       # Django settings (reads from .env)
│   ├── api.py            # Root NinjaAPI, mounts all routers
│   ├── auth.py           # JWTAuth bearer class
│   └── urls.py
├── accounts/
│   ├── models.py         # Custom User (email login), JobSeekerProfile
│   ├── schemas.py        # Pydantic schemas for auth endpoints
│   └── api.py            # /api/auth/* endpoints
├── companies/
│   ├── models.py         # Company model
│   ├── schemas.py
│   └── api.py            # /api/companies/* endpoints
├── jobs/
│   ├── models.py         # Job, Skill, Category, JobApplication, SavedJob
│   ├── schemas.py        # JobIn, JobOut, ApplicationOut, SavedJobOut, etc.
│   ├── api.py            # /api/jobs/* endpoints
│   └── management/
│       └── commands/
│           └── seed_db.py  # Seeds test users + sample data
├── requirements.txt
├── entrypoint.sh         # Docker entrypoint: migrate → seed → runserver
└── Dockerfile
```

---

## Setup (Local Development)

### 1. Create and activate a virtual environment

```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DB_NAME=job_portal_db
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
```

### 4. Create the PostgreSQL database

```bash
psql -U postgres -c "CREATE DATABASE job_portal_db;"
```

### 5. Run migrations

```bash
python manage.py migrate
```

### 6. Seed the database

```bash
python manage.py seed_db
```

Creates:
- HR user: `admin@test.com` / `Admin@1234`
- Candidate user: `user@test.com` / `User@1234`
- 1 company (SkyPoint Cloud)
- 15 skills, 5 categories
- 10 sample job listings

### 7. Start the development server

```bash
python manage.py runserver       # http://localhost:8000
```

---

## API Endpoints

Interactive docs available at **http://localhost:8000/api/docs**

### Auth — `/api/auth`

| Method | Endpoint              | Auth     | Description              |
|--------|-----------------------|----------|--------------------------|
| POST   | `/api/auth/register`  | None     | Register a new user      |
| POST   | `/api/auth/login`     | None     | Login, returns JWT token |
| GET    | `/api/auth/me`        | Bearer   | Get current user profile |
| PATCH  | `/api/auth/me`        | Bearer   | Update profile           |

### Jobs — `/api/jobs`

| Method | Endpoint                          | Auth         | Description                    |
|--------|-----------------------------------|--------------|--------------------------------|
| GET    | `/api/jobs`                       | None         | List jobs (with filters)       |
| POST   | `/api/jobs`                       | HR only      | Create a new job               |
| GET    | `/api/jobs/{id}`                  | None         | Get job details                |
| PATCH  | `/api/jobs/{id}`                  | HR (owner)   | Update a job                   |
| DELETE | `/api/jobs/{id}`                  | HR (owner)   | Delete a job                   |
| GET    | `/api/jobs/my-jobs`               | HR           | List own posted jobs           |
| POST   | `/api/jobs/{id}/apply`            | Candidate    | Apply to a job                 |
| GET    | `/api/jobs/my-applications`       | Candidate    | List own applications          |
| POST   | `/api/jobs/{id}/save`             | Candidate    | Save a job                     |
| DELETE | `/api/jobs/{id}/save`             | Candidate    | Unsave a job                   |
| GET    | `/api/jobs/saved`                 | Candidate    | List saved jobs                |
| GET    | `/api/jobs/{id}/applications`     | HR (owner)   | List applicants for a job      |
| PATCH  | `/api/jobs/applications/{id}`     | HR           | Update application status      |

### Companies — `/api/companies`

| Method | Endpoint                    | Auth     | Description              |
|--------|-----------------------------|----------|--------------------------|
| POST   | `/api/companies`            | HR       | Create a company         |
| GET    | `/api/companies/my/companies` | HR     | List own companies       |
| GET    | `/api/companies/{id}`       | None     | Get company details      |
| PATCH  | `/api/companies/{id}`       | HR (owner) | Update company         |

### Skills & Categories — `/api/jobs`

| Method | Endpoint             | Auth  | Description        |
|--------|----------------------|-------|--------------------|
| GET    | `/api/jobs/skills`   | None  | List all skills    |
| GET    | `/api/jobs/categories` | None | List all categories |

---

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Get the token from `POST /api/auth/login`. Token lifetime is 24 hours.

---

## Environment Variables

| Variable               | Default                | Description                  |
|------------------------|------------------------|------------------------------|
| `DEBUG`                | `True`                 | Django debug mode            |
| `SECRET_KEY`           | insecure dev key       | Django secret key            |
| `DB_NAME`              | `job_portal_db`        | PostgreSQL database name     |
| `DB_USER`              | `postgres`             | PostgreSQL user              |
| `DB_PASSWORD`          | —                      | PostgreSQL password          |
| `DB_HOST`              | `localhost`            | PostgreSQL host              |
| `DB_PORT`              | `5432`                 | PostgreSQL port              |
| `ALLOWED_HOSTS`        | `localhost,127.0.0.1`  | Comma-separated hosts        |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173`| Comma-separated origins      |

---

## Management Commands

```bash
# Seed test data (idempotent — safe to run multiple times)
python manage.py seed_db

# Standard Django commands
python manage.py migrate
python manage.py createsuperuser
python manage.py shell
```

---

## Running with Docker

The backend is part of the root `docker-compose.yml`. From the project root:

```bash
docker compose up --build
```

The `entrypoint.sh` automatically runs `migrate` and `seed_db` on every container start (seed is skipped if data already exists).
