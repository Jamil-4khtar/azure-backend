
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import chalk from 'chalk';

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
    execSync(cmd, { stdio: 'inherit' });
    success(`${description} completed.`);
  } catch (err) {
    error(`Step failed: ${description}`);
    log(err);
    // Provide context-specific advice for common failures
    if (cmd.includes('prisma')) {
      error('A database command failed. Is the Docker container running?');
      info('Try running "npm run docker:up" and then run this setup again.');
    }
    process.exit(1);
  }
}

// --- Main Setup Logic ---

async function main() {
  title('🚀 Azure Backend :: Enhanced Development Setup 🚀');
  log('================================================\n');

  // 1. Check for .env file and ensure it's not just a copy
  if (!existsSync('.env')) {
    error('.env file not found!');
    info('Please copy .env.example to .env, fill in the required values, and run this script again.');
    command('cp .env.example .env');
    process.exit(1);
  } else {
    const envContent = readFileSync('.env', 'utf-8');
    if (envContent.includes('=')) {
        warn('Please ensure you have replaced the placeholder values in your .env file.');
    }
    success('.env file found.');
  }

  // 2. Install dependencies
  runStep('npm install', 'Installing dependencies');

  // 3. Set up the database using migrations for better version control
  // This is more robust than `db:push` for team environments.
  runStep('npm run db:migrate', 'Applying database migrations');

  // 4. Seed the database with initial data
  runStep('npm run db:seed', 'Seeding the database');

  // 5. Final validation and next steps
  log('\n------------------------------------------------');
  success('🎉 Setup completed successfully!');
  log('Your development environment is ready.\n');
  title('Next Steps:');
  info('Start all Docker services (Postgres, Adminer, etc.):');
  command('npm run docker:up');
  info('Start the development server with hot-reload:');
  command('npm run dev');
  info('Open Prisma Studio to view/manage your database:');
  command('npm run db:studio');
  log('================================================');
}

main().catch((err) => {
  error('An unexpected error occurred during setup.');
  log(err);
  process.exit(1);
});