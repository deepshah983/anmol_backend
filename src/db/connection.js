import mongoose from "mongoose";

const connection = mongoose
  .connect("mongodb://127.0.0.1:27017/anmol")
  .then(() => console.log("DB connection successful!"))
  .catch(() => console.log("DB not connected"));

export { connection, mongoose };
