import express from "express";
import { getUsersForSidebar } from "../controllers/message.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);

export default router;
