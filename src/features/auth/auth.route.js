import { Router } from "express";
import { register, login, getProfile } from "./auth.controller.js";
import {
  isAuthenticated,
  loginHourlyLimiter,
  loginLimiter,
  registerLimiter,
  loginSchema,
  registerSchema,
  validate,
} from "../../middleware/index.js";

const router = Router();

router.post("/register", registerLimiter, validate(registerSchema), register);
router.post(
  "/login",
  loginLimiter,
  loginHourlyLimiter,
  validate(loginSchema),
  login
);
router.get("/me", isAuthenticated, getProfile);

export default router;
