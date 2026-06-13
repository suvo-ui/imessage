import express from "express";
import "dotenv/config";

import { clerkMiddleware } from "@clerk/express";
import cors from "cors";

import User from "./models/user.model.js";
import { connectDB } from "./lib/db.js";

const app = express();

const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(express.json()); //parse the request from the client
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(clerkMiddleware());

//just to ensure whether the server is up and running
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.listen(PORT, () => {
  connectDB();
  console.log("Server Running on port 3000");
});
