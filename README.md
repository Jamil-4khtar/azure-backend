# Azure Backend API Server

This is the backend API server for the Azure project, built with Node.js, Express, and Prisma. It provides a robust, scalable, and secure foundation for your application's data and business logic.

## ✨ Features

- **Modern Tech Stack**: Built with Node.js, Express, and PostgreSQL for a reliable and high-performance backend.
- **Powerful ORM**: Uses [Prisma](https://www.prisma.io/) for intuitive, type-safe database access, migrations, and seeding.
- **Containerized Environment**: Leverages Docker and Docker Compose for consistent and isolated development environments (PostgreSQL, Adminer, etc.).
- **Configuration Management**: Environment-based configuration using `.env` files.
- **Robust Logging**: Advanced logging with Winston, featuring structured JSON logs in production and colorful, human-readable logs in development.
- **Security First**: Includes `helmet` for securing HTTP headers, `express-rate-limit` to prevent brute-force attacks, and `cors` for resource sharing.
- **Authentication**: Ready-to-use JWT-based authentication flow with password hashing (`bcryptjs`).
- **Validation**: Schema-based request validation using `joi`.
- **Developer Experience**:
  - **Enhanced Setup Script**: An interactive script (`npm run setup:dev`) to guide developers through a seamless setup process.
  - **Nodemon**: Automatic server restarts on file changes for rapid development.
  - **Prisma Studio**: A beautiful UI for viewing and managing your database (`npm run db:studio`).

##  Prerequisites

- Node.js (v18 or later recommended)
- npm
- Docker and Docker Compose

## 🚀 Quick Start

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd azure-backend
    ```

2.  **Create and configure your environment file:**
    Copy the example file and fill in your database credentials and other required variables.
    ```bash
    cp .env.example .env
    ```
    > ⚠️ **Important**: Make sure to replace the placeholder values in `.env` with your actual configuration.

3.  **Start the Docker services:**
    This will spin up the PostgreSQL database and other services defined in `docker-compose.yml`.
    ```bash
    npm run docker:up
    ```

4.  **Run the development setup script:**
    This script installs dependencies, applies database migrations, and seeds the database with initial data.
    ```bash
    npm run setup:dev
    ```

5.  **Start the development server:**
    The server will start with hot-reloading enabled.
    ```bash
    npm run dev
    ```

The API server should now be running at `http://localhost:3000` (or your configured port).

## 📚 Available Scripts

- `npm run dev`: Start the development server with hot-reload.
- `npm run setup:dev`: Run the interactive setup script for development.
- `npm run docker:up`: Start all Docker containers in the background.
- `npm run docker:down`: Stop and remove all Docker containers.
- `npm run db:migrate`: Apply pending database migrations.
- `npm run db:seed`: Seed the database with initial data.
- `npm run db:studio`: Open Prisma Studio to view and manage data.
- `npm run reset`: Reset the database and re-apply the seed.

For a full list of commands, see the `scripts` section in `package.json`. For more detailed development guidelines, please see DEVELOPMENT.md.

## 📝 License

This project is licensed under the ISC License. See the LICENSE file for details.
