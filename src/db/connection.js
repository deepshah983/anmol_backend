import mongoose from "mongoose";
import 'dotenv/config'; // Load environment variables

const mongoURI = process.env.MONGO_URI;

const connection = mongoose
  .connect(mongoURI)
  .then(() => console.log("DB connection successful!"))
  .catch((error) => console.error("DB not connected:", error));

export { connection, mongoose };