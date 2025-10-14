import cors from "cors";
import express from "express";
import "dotenv/config.js";
import config from "./config/env.js";
import authRoutes from "./features/auth/index.js";
import inviteRoutes from "./features/invite/index.js";
import passwordResetRoutes from "./features/password-reset/index.js";
import contentRoutes from "./features/content/index.js";
import pagesRoutes from "./features/pages/index.js";
import userRoutes from "./features/users/index.js";
import helmet from "helmet";
import { logger, successResponse } from './utils/index.js'
import {
  requestId,
  requestLogger,
  globalLimiter,
  globalErrorHandler,
  handleUncaughtException,
  handleUnhandledRejection,
  notFoundHandler,
} from "./middleware/index.js";

handleUncaughtException();
handleUnhandledRejection();

if (config.server.nodeEnv === "production") {
  logger.info("Environment validation passed", {
    environment: config.server.nodeEnv,
    database: `${config.database.host}:${config.database.port}`,
    port: config.server.port,
    logLevel: config.server.logLevel || "info",
  });
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
    version: process.env.npm_package_version || "1.0.0", // This one is fine to leave as is
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
    version: process.env.npm_package_version || "1.0.0", // Also fine to leave
    endpoints: {
      health: "/health",
      api: "/api",
    },
  };
  return successResponse(res, rootData, "Server is running");
});

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
  // For development, a simpler message is better
  if (config.server.nodeEnv !== "production") {
    logger.info("Server is listening on", {
      url: `http://localhost:${config.server.port}`,
    });
  } else {
    // The detailed log for production
    logger.info("🚀 Azure Backend Server Started Successfully", {
      port: config.server.port,
      environment: config.server.nodeEnv,
      healthCheck: `http://localhost:${config.server.port}/health`,
      apiBase: `http://localhost:${config.server.port}/api`,
      logLevel: config.server.logLevel || "info",
    });
  }
});
