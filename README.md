# Ledgerly — Personal Finance Tracker

A full-stack personal finance application built for the TCS case-study brief. It provides JWT-secured accounts, transaction and budget management, a responsive analytics dashboard, and PDF/CSV/Excel exports.

## Stack

- React + Vite, Material UI, Axios, Chart.js
- Python Django, Django REST Framework, SimpleJWT, pandas, reportlab
- PostgreSQL through Docker; SQLite fallback for local backend development

For MySQL, set `DATABASE_ENGINE=mysql` plus `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_HOST`, and optional `MYSQL_PORT`.

## Run with Docker

1. Copy `.env.example` to `.env` and replace all example secrets.
2. Run `docker compose up --build`.
3. Open `http://localhost:5173`; API documentation is at `http://localhost:8000/api/docs/`.

## Local development

Backend: `cd backend`, create a virtual environment, `pip install -r requirements.txt`, then run `python manage.py migrate` and `python manage.py runserver`.

Frontend: `cd frontend`, run `npm install`, then `npm run dev`.

Run backend tests with `cd backend; pytest`. Generate and apply migrations after model changes with `python manage.py makemigrations && python manage.py migrate`.

## API overview

| Area | Endpoint |
| --- | --- |
| Authentication | `POST /api/register/`, `/api/login/`, `/api/token/refresh/` |
| Transactions | `/api/transactions/` CRUD; supports `category`, `transaction_type`, and date filtering |
| Budgets | `/api/budgets/` CRUD; returns spent, remaining, and budget status |
| Reports | `/api/reports/monthly/`, `/api/reports/export/{pdf,csv,excel}/` |

All routes other than authentication require `Authorization: Bearer <access-token>`. The OpenAPI schema is available at `/api/schema/`.
An importable Postman collection is included at `docs/Personal-Finance-Tracker.postman_collection.json`.

## Deployment (Render)

Create a managed PostgreSQL database, set the environment values from `.env.example`, set `POSTGRES_HOST` to Render's internal database host, `DJANGO_DEBUG=False`, and `DJANGO_SECURE_SSL=True`. Deploy `backend/` as a Docker web service and `frontend/` as a static site; set `VITE_API_BASE_URL` to the backend's `/api` URL at build time. Configure `CORS_ALLOWED_ORIGINS` with the frontend URL.

## Quality and security

Secrets are environment-based, password hashes use Django's PBKDF2 implementation, APIs are scoped to the authenticated user, validation is serializer-based, CORS is allowlisted, and authentication routes are throttled. Before production, configure a real transactional email provider and a production secret key.
