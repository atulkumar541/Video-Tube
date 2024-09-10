import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { app } from "./app.js";
dotenv.config();

connectDB()
  .then(() =>
    app.listen(process.env.PORT || 8000, () =>
      console.log(`Server running on port : ${process.env.PORT}`)
    )
  )
  .catch((err) => console.log("DB connection failed : ", err));
