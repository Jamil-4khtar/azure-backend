import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import chalk from "chalk";

const log = console.log;
const title = (msg) => log(chalk.bold.cyan(msg));
const success = (msg) => log(chalk.green(`✅ ${msg}`));
const error = (msg) => log(chalk.red(`❌ ${msg}`));
const info = (msg) => log(chalk.blue(`ℹ️  ${msg}`));
const warn = (msg) => log(chalk.yellow(`⚠️  ${msg}`));
const command = (cmd) => log(chalk.gray(`> ${cmd}`));

// --- Helper Functions ---

/**
 * Executes a shell command and logs its execution.
 * @param {string} cmd - The command to execute.
 * @param {string} description - A description of the step.
 */
function runStep(cmd, description) {
  try {
    info(description);
    command(cmd);
    execSync(cmd, { stdio: "inherit" });
    success(`${description} completed.`);
  } catch (err) {
    error(`Step failed: ${description}`);
    log(err);
    // Provide context-specific advice for common failures
    if (cmd.includes("prisma")) {
      error("A database command failed. Is the Docker container running?");
      info('Try running "npm run docker:up" and then run this setup again.');
    }
    process.exit(1);
  }
}

// --- Main Setup Logic ---

async function main() {
  title("🚀 Azure Backend :: Enhanced Development Setup 🚀");
  log("================================================\n");

  // 1. Check for .env.development file, as it's used by all dev scripts.
  if (!existsSync(".env.development")) {
    error(".env.development file not found!");
    info(
      "Please copy .env.example to .env.development, fill in the required values, and run this script again."
    );
    command("cp .env.example .env.development");
    process.exit(1);
  } else {
    const envContent = readFileSync(".env.development", "utf-8");
    // A simple check to see if the default placeholder password is still there.
    // You can make this more robust by checking for other placeholders.
    if (envContent.includes("your_password") || envContent.includes("<")) {
      warn(
        "Your .env.development file might still contain placeholder values."
      );
      info(
        "Please ensure you have replaced all placeholders (like your_user, your_password, etc.)"
      );
    } else {
      success(".env.development file looks configured.");
    }
  }

  // 2. Install dependencies
  runStep("npm install", "Installing dependencies");

  // 3. Set up the database using migrations for better version control
  // This is more robust than `db:push` for team environments.
  runStep("npm run db:migrate", "Applying database migrations");

  // 4. Seed the database with initial data
  runStep("npm run db:seed", "Seeding the database");

  // 5. Final validation and next steps
  log("\n------------------------------------------------");
  success("🎉 Setup completed successfully!");
  log("Your development environment is ready.\n");
  title("Next Steps:");
  info("Start all Docker services (Postgres, Adminer, etc.):");
  command("npm run docker:up");
  info("Start the development server with hot-reload:");
  command("npm run dev");
  info("Open Prisma Studio to view/manage your database:");
  command("npm run db:studio");
  log("================================================");
}

main().catch((err) => {
  error("An unexpected error occurred during setup.");
  log(err);
  process.exit(1);
});
