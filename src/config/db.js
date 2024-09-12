import mongoose from "mongoose";
import { DB_Name } from "../constants.js";

/* DB is another continent */

// Connect to DB

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`${process.env.MONGODB_URI}`);
    console.log(`MongoDB Connected to Host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
