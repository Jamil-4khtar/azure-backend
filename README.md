# Azure Backend

This is the backend service for the **Azure CMS** project, built with **Node.js**, **Express**, and **Prisma**. It provides a RESTful API for managing sites, pages, content, and user invitations.

## Features

- User authentication with JWT
- Role-based access control (Admin, Editor, Viewer)
- Site and page management
- Draft/published versioning system for page content
- User invitation system via email

## Tech Stack

- **Backend:** Node.js, Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Development Email:** smtp4dev
- **Containerization:** Docker

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or later
- PostgreSQL
- Docker & Docker Compose (optional)

---

## Environment Setup

### 1. Copy the environment template

```bash
cp .env.example .env
```

### 2. Update the `.env` file

Set your actual values for:

- **Database:** PostgreSQL credentials
- **JWT Secret:** Generate a secure secret (min 32 characters)
- **Admin Credentials:** Initial admin user details
- **URLs:** Frontend application URLs

### 3. Generate a secure JWT secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Required Environment Variables

| Variable              | Description                           |
|-----------------------|---------------------------------------|
| `DATABASE_URL`        | PostgreSQL connection string          |
| `JWT_SECRET`          | Secure random string (min 32 chars)  |
| `SEED_ADMIN_EMAIL`    | Admin user email                       |
| `SEED_ADMIN_PASSWORD` | Admin user password                    |
| `DASHBOARD_URL`       | Frontend dashboard URL                 |
| `WEBSITE_URL`         | Frontend website URL                   |

> See `.env.example` for the complete list and descriptions.
