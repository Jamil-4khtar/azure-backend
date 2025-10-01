#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import chalk from 'chalk';

console.log(chalk.blue('🚀 Azure Backend Development Setup'));
console.log(chalk.blue('=====================================\n'));

// Check if .env exists
if (!existsSync('.env')) {
  console.log(chalk.yellow('⚠️  .env file not found'));
  console.log(chalk.white('Please copy .env.example to .env and configure your values:\n'));
  console.log(chalk.green('cp .env.example .env'));
  console.log(chalk.white('\nThen run this setup again.'));
  process.exit(1);
}

const steps = [
  {
    name: 'Installing dependencies',
    command: 'npm install',
    emoji: '📦'
  },
  {
    name: 'Generating Prisma client',
    command: 'npm run db:generate',
    emoji: '🔧'
  },
  {
    name: 'Pushing database schema',
    command: 'npm run db:push',
    emoji: '🗄️'
  },
  {
    name: 'Seeding database',
    command: 'npm run db:seed',
    emoji: '🌱'
  },
  {
    name: 'Validating environment',
    command: 'npm run validate',
    emoji: '✅'
  }
];

for (const step of steps) {
  try {
    console.log(chalk.blue(`${step.emoji} ${step.name}...`));
    execSync(step.command, { stdio: 'inherit' });
    console.log(chalk.green(`✅ ${step.name} completed\n`));
  } catch (error) {
    console.log(chalk.red(`❌ ${step.name} failed`));
    console.log(chalk.red(error.message));
    process.exit(1);
  }
}

console.log(chalk.green('🎉 Setup completed successfully!'));
console.log(chalk.white('\nNext steps:'));
console.log(chalk.green('npm run dev') + chalk.white(' - Start development server'));
console.log(chalk.green('npm run db:studio') + chalk.white(' - Open database GUI'));
console.log(chalk.green('npm run docker:up') + chalk.white(' - Start Docker services'));
