import cors from "cors";
import express from "express";
import "dotenv/config.js";
import config from "./config/env.js";
import helmet from "helmet";
import { logger, successResponse } from './utils/index.js'
import apiRoutes from "./routes/index.js"
import {
  requestId,
  requestLogger,
  globalLimiter,
  globalErrorHandler,
  handleUncaughtException,
  handleUnhandledRejection,
  notFoundHandler,
} from "./middleware/index.js";

// --- Exception & Rejection Handlers ---
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

// --- Express App Initialization ---
const app = express();

// --- Trust Proxy ---
if (config.server.nodeEnv === "production") {
  app.set("trust proxy", 1);
  logger.info("Trust proxy enabled for production");
}


// --- Core Middleware ---
app.use(requestId);
app.use(requestLogger);
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(globalLimiter);

// --- CORS Configuration ---
app.use(
  cors({
    origin: [config.cors.dashboardUrl, config.cors.websiteUrl],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// --- Body Parsers ---
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// --- API Routes ---
app.use("/api", apiRoutes);

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

// --- Error Handling Middleware ---
app.use(notFoundHandler);
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

export default app
