import express from "express";
import {
  getUsersForSidebar,
  getConversationsForSidebar,
  getMessages,
  sendMessages,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/users", getUsersForSidebar);
router.get("/conversations", getConversationsForSidebar);
router.get("/:id", getMessages);
router.post("/send/:id", upload.single("media"), sendMessages);

export default router;
