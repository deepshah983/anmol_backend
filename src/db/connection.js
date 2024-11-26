import mongoose from "mongoose";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env file
dotenv.config({ 
  path: path.resolve(__dirname, '../../.env') 
});

const mongoURI = process.env.MONGO_URI;

const connection = mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("DB connection successful!");
    return mongoose.connection;
  })
  .catch((error) => {
    console.error("DB not connected:", error);
    throw error;
  });

export { connection, mongoose };