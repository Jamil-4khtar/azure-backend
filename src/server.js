import app from "./app.js";
import config from "./config/env.js";
import { logger } from "./utils/index.js";



const startServer = () => {
  app.listen(config.server.port, () => {
    if (config.server.nodeEnv !== "production") {
      logger.info("Server is listening on", {
        url: `http://localhost:${config.server.port}`,
      });
    } else {
      logger.info("🚀 Azure Backend Server Started Successfully", {
        port: config.server.port,
        environment: config.server.nodeEnv,
        healthCheck: `http://localhost:${config.server.port}/health`,
        apiBase: `http://localhost:${config.server.port}/api`,
        logLevel: config.server.logLevel || "info",
      });
    }
  });
};

startServer();