# Development Guide 🚀

This guide provides instructions for setting up and running this project.

---

## Quick Start

Get your development environment up and running in two simple steps.

### First-Time Setup

1.  **Create your environment file:** Copy the example file to create your local configuration.
    ```bash
    cp .env.example .env
    ```
    Afterward, be sure to edit the `.env` file with your actual values.

2.  **Run the initial setup script:** This command will install dependencies and prepare the database.
3. 
    ```bash
    npm run setup
    ```

### Daily Development

To start the local development server for daily work, run the following command:

```bash
npm run dev
```

---

## Common Commands

Here is a breakdown of the most frequently used scripts available in the project.

### Development
* `npm run dev` – Starts the local development server.
* `npm run dev:debug` – Starts the development server with the debugger attached.
* `npm run validate` – Checks the environment variables and configuration for any issues.

### Database 🗄️
* `npm run db:studio` – Opens the Prisma Studio GUI to view and manage your database.
* `npm run db:migrate` – Creates a new database migration from your schema changes.
* `npm run db:seed` – Populates the database with initial seed data.
* `npm run reset` – Resets the database and then re-seeds it. **Warning:** This will delete all existing data.

### Docker 🐳
* `npm run docker:up` – Starts all services defined in the `docker-compose.yml` file.
* `npm run docker:down` – Stops all running Docker services.
* `npm run docker:logs` – Displays logs from the running Docker containers.

### Workflow
- `npm run setup` - Initial project setup
- `npm run reset` - Reset database and reseed
- `npm run fresh` - Complete fresh start

