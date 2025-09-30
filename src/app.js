import cors from "cors";
import express from "express";
import "dotenv/config.js";
import authRoutes from "./features/auth/index.js";
import inviteRoutes from "./features/invite/index.js";
import passwordResetRoutes from "./features/password-reset/index.js";
import contentRoutes from "./features/content/index.js";
import pagesRoutes from "./features/pages/index.js";
import userRoutes from "./features/users/index.js";
import helmet from "helmet";
import { globalLimiter } from "./middleware/rateLimiter.js";

const PORT = process.env.PORT || 3000;

const app = express();

// app.set('trust proxy', 1);

// app.use(helmet({
// 	crossOriginEmbedderPolicy: false
// }))

app.use(globalLimiter);

app.use(
  cors({
    origin: ["http://localhost:3001", "https://yourdomain.com"], // Add your frontend URLs
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/invite", inviteRoutes);
app.use("/api", passwordResetRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/pages", pagesRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Backend Server is running!");
});

// Global error handler for rate limiting
app.use((err, req, res, next) => {
  if (err.status === 429) {
    console.log(`Rate limit exceeded: ${req.ip} - ${req.method} ${req.path}`);
    return res.status(429).json({
      error: "Too many requests, please try again later.",
      retryAfter: err.retryAfter,
    });
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`Node.js server listening on port ${PORT}`);
});
