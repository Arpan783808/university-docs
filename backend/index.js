import express from "express";
import mongoose from "mongoose";
import documentRoutes from "./router/router.js";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import connectDB from "./db.js";
import dotenv from "dotenv";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
connectDB();
const port = 3001;
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use("/", documentRoutes);

app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);
