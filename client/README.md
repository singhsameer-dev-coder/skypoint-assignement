# Frontend — React + Material UI

React 18 single-page application for the Job Portal, built with Vite and Material UI.

---

## Tech Stack

- **React 18** — UI library
- **Vite** — build tool and dev server
- **Material UI v5** — component library
- **React Router v6** — client-side routing
- **Axios** — HTTP client with JWT interceptor

---

## Project Structure

```
client/
├── public/
├── src/
│   ├── api/
│   │   ├── axios.js          # Axios instance, auth interceptor, 401 redirect
│   │   ├── auth.js           # login, register, getMe, updateMe
│   │   ├── jobs.js           # getJobs, createJob, applyToJob, saveJob, etc.
│   │   ├── companies.js      # getMyCompanies, createCompany, etc.
│   │   └── utils.js          # getErrorMessage — handles Pydantic 422 errors
│   ├── components/
│   │   ├── JobCard.jsx       # Reusable job card with save toggle
│   │   ├── Navbar.jsx        # Top navigation bar
│   │   ├── StatusChip.jsx    # Coloured chip for job type / status
│   │   ├── PageLoader.jsx    # Full-page spinner
│   │   ├── PrivateRoute.jsx  # Redirects to /login if not authenticated
│   │   └── RoleRoute.jsx     # Restricts route to a specific user role
│   ├── context/
│   │   └── AuthContext.jsx   # Global auth state (user, login, logout)
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── candidate/
│   │   │   ├── JobList.jsx       # Browse + filter jobs
│   │   │   ├── JobDetail.jsx     # Full job view + apply
│   │   │   ├── SavedJobs.jsx     # Bookmarked jobs + apply
│   │   │   ├── MyApplications.jsx
│   │   │   └── CandidateProfile.jsx
│   │   └── hr/
│   │       ├── HRDashboard.jsx
│   │       ├── PostJob.jsx
│   │       ├── EditJob.jsx
│   │       ├── ManageJobs.jsx
│   │       ├── JobApplications.jsx
│   │       ├── CompanySetup.jsx
│   │       └── HRProfile.jsx
│   ├── App.jsx               # Route definitions
│   ├── theme.js              # MUI theme customisation
│   └── main.jsx
├── Dockerfile
├── .env.example
└── vite.config.js
```

---

## Setup (Local Development)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

`.env` contents:

```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Start the dev server

```bash
npm run dev          # http://localhost:5173
```

The app proxies API calls to the Django backend. Make sure the backend is running on port 8000.

---

## Available Scripts

```bash
npm run dev          # Start development server (HMR)
npm run build        # Production build → dist/
npm run preview      # Preview the production build locally
npm run lint         # Run ESLint
```

---

## Routing & Role-Based Access

| Route                    | Access         | Page                        |
|--------------------------|----------------|-----------------------------|
| `/`                      | Public         | Redirects based on role     |
| `/login`                 | Public         | Login page                  |
| `/register`              | Public         | Registration page           |
| `/jobs`                  | Public         | Browse all jobs             |
| `/jobs/:id`              | Public         | Job detail + apply          |
| `/saved-jobs`            | Candidate only | Saved jobs                  |
| `/my-applications`       | Candidate only | Application tracker         |
| `/candidate/profile`     | Candidate only | Edit profile + skills       |
| `/hr/dashboard`          | HR only        | Stats overview              |
| `/hr/post-job`           | HR only        | Post a new job              |
| `/hr/manage-jobs`        | HR only        | Edit / delete jobs          |
| `/hr/jobs/:id/applicants`| HR only        | Review applicants           |
| `/hr/company`            | HR only        | Company profile setup       |
| `/hr/profile`            | HR only        | Edit HR profile             |

---

## Authentication Flow

1. `POST /api/auth/login` → receives `access` JWT token
2. Token stored in `localStorage` as `jp_access`
3. Axios interceptor attaches `Authorization: Bearer <token>` to every request
4. On 401 response, interceptor clears token and redirects to `/login`

---

## Running with Docker

The frontend is part of the root `docker-compose.yml`. From the project root:

```bash
docker compose up --build
```

The app will be available at **http://localhost:3000**.

The `VITE_API_URL` is passed as a build argument:

```yaml
args:
  VITE_API_URL: http://localhost:8000/api
```
