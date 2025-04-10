import express from "express";
import cors from "cors";
import env from "./config/env.js";
import authRoutes from "./routes/authRoute.js";

const app = express();

// Enable CORS first
app.use(
  cors({
    origin: env.NODE_ENV === "development" ? "*" : env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);

export default app;
