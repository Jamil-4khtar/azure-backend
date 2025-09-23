import { Router } from "express";
import {
  getPageContent,
  savePageContent,
  publishPageContent,
  clearPageContent,
} from "./content.controller.js";
import { isAuthenticated } from "../../middleware/isAuthenticated.js";

const router = Router();

router.get("/", getPageContent);
router.post("/save", isAuthenticated, savePageContent);
router.post("/publish", isAuthenticated, publishPageContent);
router.post("/clear", isAuthenticated, clearPageContent);

export default router;
