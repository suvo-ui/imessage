import mongoose from "mongoose";

export async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) throw new Error("Mongo Uri is required");

    const conn = await mongoose.connect(mongoUri);

    console.log("MongoDB connected", conn.connection.host);
  } catch (err) {
    console.error("MongoDB connection Error", err.message);
    process.exit(1);
    //1 means failed 0 means success
  }
}
