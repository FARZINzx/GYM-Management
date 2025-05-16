import express from "express";
import cors from "cors";
import env from "./config/env.js";
import authRoutes from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import trainerRoutes from "./routes/trainerRoutes.js"

const app = express();

app.use(
  cors({
    origin: env.NODE_ENV === "development" ? "*" : env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/user" , userRoute)
// app.use("/trainer" , trainerRoutes)

export default app;
