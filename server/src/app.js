import express from "express";
import cors from "cors";
import env from "./config/env.js";
import authRoutes from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import personnelRoute from "./routes/personnelRoute.js";
import roleRoute from "./routes/roleRoute.js";
import gymServiceRouter from "./routes/gymServiceRoute.js";
import attendanceRouter from "./routes/attendanceRoute.js";
import clientRequestRoutes from './routes/clientRequestRoutes.js'

// import trainerRoutes from "./routes/trainerRoutes.js"
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: env.NODE_ENV === "development" ? "*" : env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoute);
app.use("/api/personnel", personnelRoute);
app.use("/api/roles", roleRoute);
app.use("/api/services", gymServiceRouter);
app.use("/api/attendance", attendanceRouter);
// app.use("/trainer" , trainerRoutes)
app.use('/api/client-requests', clientRequestRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
