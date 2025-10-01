import cors from "cors";
import express from "express";
import "dotenv/config.js";
import { getConfig } from "./config/env.js";
import {
  requestId,
  requestLogger,
  errorLogger,
} from "./middleware/requestLogger.js";
import logger from "./utils/logger.js";
import authRoutes from "./features/auth/index.js";
import inviteRoutes from "./features/invite/index.js";
import passwordResetRoutes from "./features/password-reset/index.js";
import contentRoutes from "./features/content/index.js";
import pagesRoutes from "./features/pages/index.js";
import userRoutes from "./features/users/index.js";
import helmet from "helmet";
import { globalLimiter } from "./middleware/rateLimiter.js";
import {
	globalErrorHandler,
  handleUncaughtException,
  handleUnhandledRejection,
	notFoundHandler,
} from "./middleware/errorHandler.js";
import { successResponse } from "./utils/response.js";

handleUncaughtException();
handleUnhandledRejection();

// Validate environment variables at startup
let config;
try {
  config = getConfig();
  logger.info("Environment validation passed", {
    environment: config.server.nodeEnv,
    database: `${config.database.host}:${config.database.port}`,
    port: config.server.port,
    logLevel: process.env.LOG_LEVEL || "info",
  });
} catch (error) {
  logger.error("Environment validation failed", {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
}

const app = express();

// Enable trust proxy for production deployments
if (config.server.nodeEnv === "production") {
  app.set("trust proxy", 1);
  logger.info("Trust proxy enabled for production");
}

// Add request ID and logging middleware (before other middleware)
app.use(requestId);
app.use(requestLogger);

// Enable helmet security headers
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

// Apply rate limiting
app.use(globalLimiter);

// Configure CORS
app.use(
  cors({
    origin: [config.cors.dashboardUrl, config.cors.websiteUrl],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON with size limit
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  const healthData = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
    version: process.env.npm_package_version || "1.0.0",
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + "MB",
    },
  };

  return successResponse(res, healthData, "Health check passed");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/invite", inviteRoutes);
app.use("/api", passwordResetRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/pages", pagesRoutes);
app.use("/api/users", userRoutes);

// Root endpoint
app.get("/", (req, res) => {
  const rootData = {
    message: "Azure Backend Server is running!",
    environment: config.server.nodeEnv,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    endpoints: {
      health: "/health",
      api: "/api",
    },
  };

  return successResponse(res, rootData, "Server is running");
});

// Add error logging middleware (before error handlers)
app.use(errorLogger);

// Handle 404 routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(globalErrorHandler);

// Graceful shutdown handling
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Start server
app.listen(config.server.port, () => {
  logger.info("🚀 Azure Backend Server Started Successfully", {
    port: config.server.port,
    environment: config.server.nodeEnv,
    healthCheck: `http://localhost:${config.server.port}/health`,
    apiBase: `http://localhost:${config.server.port}/api`,
    logLevel: process.env.LOG_LEVEL || "info",
  });
});
