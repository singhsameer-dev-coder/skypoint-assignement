# Job Portal — Full Stack Application

A full-stack job portal built with **Django + Django Ninja** (backend) and **React + Material UI** (frontend), containerized with Docker.

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Backend   | Python 3.12, Django 4.2, Django Ninja   |
| Database  | PostgreSQL 16                           |
| Auth      | JWT (djangorestframework-simplejwt)     |
| Frontend  | React 18, Vite, Material UI v5          |
| Container | Docker, Docker Compose                  |

---

## Project Structure

```
skypoint-assignement/
├── client/               # React frontend
├── server/               # Django backend
├── docker-compose.yml    # Orchestrates all 3 services
└── README.md
```

---

## Quick Start (Docker — Recommended)

> Requires Docker to be running (Docker Desktop or Colima).

```bash
git clone https://github.com/singhsameer-dev-coder/skypoint-assignement.git
cd skypoint-assignement
docker compose up --build
```

That single command will:
1. Start PostgreSQL
2. Run all Django migrations
3. Seed the database with test users and 10 sample jobs
4. Start the Django API server on port **8000**
5. Start the React dev server on port **3000**

Open **http://localhost:3000** in your browser.

---

## Test Credentials

| Role      | Email             | Password    |
|-----------|-------------------|-------------|
| HR        | admin@test.com    | Admin@1234  |
| Candidate | user@test.com     | User@1234   |

---

## Running Locally (Without Docker)

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL running locally

### Backend

```bash
cd server
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env from example
cp .env.example .env              # then edit DB credentials

python manage.py migrate
python manage.py seed_db          # creates test users + sample jobs
python manage.py runserver        # runs on http://localhost:8000
```

### Frontend

```bash
cd client
npm install
npm run dev                       # runs on http://localhost:5173
```

---

## Features

### Candidate
- Browse and search/filter jobs (type, mode, experience, salary, location)
- View full job details with company info
- Save jobs for later
- Apply to jobs with a cover letter
- Track application status

### HR / Employer
- Register and set up a company profile
- Post new job listings
- Edit and manage posted jobs
- Review applicants and update application status
- Dashboard with stats

---

## API Documentation

Django Ninja generates interactive API docs automatically.

After starting the server, visit:
```
http://localhost:8000/api/docs
```

---

## Services & Ports

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3000      |
| Backend  | http://localhost:8000      |
| API Docs | http://localhost:8000/api/docs |

---

## Stopping Docker

```bash
docker compose down          # stop containers (data preserved)
docker compose down -v       # stop + delete database volume
```
