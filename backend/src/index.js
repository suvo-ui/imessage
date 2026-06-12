import express from "express";
import "dotenv/config";

const PORT = process.env.PORT;

const app = express();

app.listen(PORT, () => console.log("Server Running on port 3000"));
