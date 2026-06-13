import express from "express";
import { protectRoute } from "../middlewares/auth.middleware";
import { checkAuth } from "../controllers/auth.controller";

const router = express.Router();

//api/auth/check
router.get("/check", protectRoute, checkAuth);

export default router;
