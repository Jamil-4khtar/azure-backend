import { Router } from "express";
import authRoutes from '../features/auth/auth.route.js'
import contentRoutes from '../features/content/content.routes.js'
import inviteRoutes from '../features/invite/invite.routes.js'
import pagesRoutes from '../features/pages/pages.routes.js'
import passwordResetRoutes from '../features/password-reset/password-reset.routes.js'
import userRoutes from '../features/users/users.route.js'

const router = Router();

router.use("/auth", authRoutes);
router.use("/invite", inviteRoutes);
router.use("", passwordResetRoutes);
router.use("/content", contentRoutes);
router.use("/pages", pagesRoutes);
router.use("/users", userRoutes);

export default router