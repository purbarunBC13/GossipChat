import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/AuthRoutes.js";
import morgan from "morgan";
import contactsRoutes from "./routes/ContactRoutes.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const databaseURL = process.env.DATABASE_URL;

app.use(
  cors({
    origin: [process.env.ORIGIN],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use("/uploads/profiles", express.static("uploads/profiles"));

app.use(cookieParser());
app.use(express.json());
app.use(morgan("tiny"));
// ! Routes

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);

const server = app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});

mongoose
  .connect(databaseURL)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((error) => {
    console.log("Error:", error.message);
  });
