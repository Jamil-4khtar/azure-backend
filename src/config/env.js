import Joi from 'joi';

// Define the schema for environment variables
const envSchema = Joi.object({
  // Database Configuration
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().min(8).required(),
  DB_NAME: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT_HOST: Joi.number().port().required(),
  DATABASE_URL_LOCAL: Joi.string().uri().required(),
  DB_HOST_DOCKER: Joi.string().required(),
  DB_PORT_DOCKER: Joi.number().port().required(),
  DATABASE_URL_DOCKER: Joi.string().uri().required(),
  DATABASE_URL: Joi.string().uri().required(),
  DB_PORT: Joi.number().port().required(),

  // Server Configuration
  PORT: Joi.number().port().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  // Admin Seed Configuration
  SEED_ADMIN_EMAIL: Joi.string().email().required(),
  SEED_ADMIN_PASSWORD: Joi.string().min(8).required(),

  // JWT Configuration
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().required(),

  // Frontend URLs (CORS)
  DASHBOARD_URL: Joi.string().uri().required(),
  WEBSITE_URL: Joi.string().uri().required(),

  // Email SMTP Settings
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().port().required(),
  SMTP_SECURE: Joi.boolean().required(),
  // MAIL_FROM: Joi.string().email().required(),
  MAIL_FROM: Joi.string().required(),
}).unknown(true);

export function validateEnv() {
  const { error, value } = envSchema.validate(process.env, {
    abortEarly: false,
    stripUnknown: false,
  });

  if (error) {
    const errorMessages = error.details.map(detail => {
      const key = detail.context.key;
      const message = detail.message;
      return `${key}: ${message}`;
    }).join('\n');

    throw new Error(`Environment validation failed:\n${errorMessages}`);
  }

  return value;
}

export function getConfig() {
  const env = validateEnv();
  
  return {
    database: {
      url: env.DATABASE_URL,
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      name: env.DB_NAME,
    },
    server: {
      port: env.PORT,
      nodeEnv: env.NODE_ENV,
    },
    jwt: {
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
    },
    cors: {
      dashboardUrl: env.DASHBOARD_URL,
      websiteUrl: env.WEBSITE_URL,
    },
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      from: env.MAIL_FROM,
    },
    admin: {
      email: env.SEED_ADMIN_EMAIL,
      password: env.SEED_ADMIN_PASSWORD,
    },
  };
}
