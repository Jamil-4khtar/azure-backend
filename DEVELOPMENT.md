# Development Guide

This document provides a deeper dive into the development practices, conventions, and architecture of the Azure Backend project.

## Table of Contents

- [Development Guide](#development-guide)
	- [Table of Contents](#table-of-contents)
	- [Project Structure](#project-structure)
	- [Environment Variables](#environment-variables)
	- [Database Management with Prisma](#database-management-with-prisma)
		- [Migrations](#migrations)
		- [Seeding](#seeding)
		- [Resetting the Database](#resetting-the-database)
	- [Logging](#logging)

## Project Structure

The project follows a standard structure for Node.js applications:

```
azure-backend/
├── prisma/
│   ├── migrations/         # Database migration history
│   ├── schema.prisma       # The heart of your Prisma setup
│   └── seed.js             # Script for seeding the database
├── scripts/
│   └── dev-setup.js        # The interactive development setup script
├── src/
│   ├── api/                # API routes, controllers, services
│   ├── config/             # Environment configuration, etc.
│   ├── middleware/         # Custom Express middleware
│   ├── models/             # (If needed for business logic beyond Prisma)
│   ├── services/           # Business logic services (e.g., email, payments)
│   ├── utils/              # Shared utilities (logger, etc.)
│   └── server.js           # The main entry point of the application
├── .env.example            # Example environment variables
├── docker-compose.yml      # Docker services definition
└── package.json
```

## Environment Variables

All environment-specific configurations are managed through `.env` files, loaded by `dotenv-cli`.

- `.env.development`: Used for `npm run dev`, `npm run db:*`, etc.
- `.env.production`: Used for `npm run start:prod`.

The `dev-setup.js` script will prompt you to create a `.env` file from `.env.example`. It's crucial that this file is kept up-to-date and not committed to version control.

## Database Management with Prisma

We use Prisma as our ORM for all database interactions.

### Migrations

Migrations are the preferred way to evolve the database schema in a team environment. Instead of `db:push`, always use `db:migrate`.

1.  **Modify your schema**: Make changes to `prisma/schema.prisma`.
2.  **Create a new migration**: Run the following command and give the migration a descriptive name.
    ```bash
    npm run db:migrate
    ```
    This command creates a new SQL migration file and applies it to your development database.

### Seeding

To populate your database with initial data, modify `prisma/seed.js` and run:
```bash
npm run db:seed
```
This is automatically run as part of the `npm run setup:dev` script.

### Resetting the Database

To completely wipe your local database, re-apply all migrations, and re-seed the data, use the `reset` command. This is useful when you need a clean slate.
```bash
npm run reset
```

## Logging

We use a powerful `winston`-based logger found in `src/utils/logger.js`.

- **Development**: Logs are color-coded, timestamped, and printed to the console for easy debugging.
- **Production**: Logs are written as structured JSON to rotating files in the `logs/` directory, which is ideal for log aggregation services.

Use the logger throughout the application instead of `console.log` for consistent and environment-aware logging.
