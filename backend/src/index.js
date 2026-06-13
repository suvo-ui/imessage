import express from "express";
import "dotenv/config";

import { clerkMiddleware } from "@clerk/express";
import cors from "cors";

import User from "./models/user.model.js";
import { connectDB } from "./lib/db.js";

import fs from "fs";
import path from "path";
import job from "./lib/cron.js";

import clerkWebhook from "./webhooks/clerk.webhook.js";
import authRoutes from "./routes/auth.route.js";
import messageRotes from "./routes/message.route.js";
const app = express();

const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;

const publicDir = path.join(process.cwd(), "public");

//it is important that you dont parse the webhook data, it should be in raw format
app.use(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhook,
);

app.use(express.json()); //parse the request from the client
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(clerkMiddleware());

//just to ensure whether the server is up and running
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

//if the public directory eist serves the static files
//this is for the production build
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get("/{*any}", (req, res, next) => {
    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}

app.listen(PORT, () => {
  connectDB();
  console.log("Server Running on port 3000");

  if (process.env.NODE_ENV === "production") {
    job.start();
  }
});
