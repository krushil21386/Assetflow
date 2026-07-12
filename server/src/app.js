import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import apiRouter from "./routes/api.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load Environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(
  cors({
    origin: "*", // For local testing. In production, specify frontend URL.
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Uploads
// This allows frontend to retrieve files via http://localhost:5000/uploads/assets/...
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date() });
});

// API Routes
app.use("/api", apiRouter);

// Fallback route
app.use((req, res) => {
  res.status(404).json({ message: "API Route Not Found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Express Error Handler:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

export default app;
