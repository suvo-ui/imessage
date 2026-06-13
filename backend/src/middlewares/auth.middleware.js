import { getAuth } from "@clerk/express";
import User from "../models/user.model.js";

export async function protectRoute(req, res, next) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ message: "Unauthorised" });
    }

    const user = User.findOne({ clerkID: userId });

    if (!user) {
      res.status(404).json({ message: "User profile not syncesd yet" });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Error in protectRoute MiddleWare:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
