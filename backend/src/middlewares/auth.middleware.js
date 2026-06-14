import { getAuth } from "@clerk/express";
import User from "../models/user.model.js";

export async function protectRoute(req, res, next) {
  try {
    const { userId } = getAuth(req);

    console.log("Clerk userId:", userId);

    const allUsers = await User.find({});
    console.log(
      "Mongo clerkIds:",
      allUsers.map((u) => u.clerkId),
    );

    const user = await User.findOne({
      clerkId: userId,
    });

    console.log("Found user:", user);

    if (!user) {
      return res.status(404).json({
        message: "User profile not synced yet",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
