import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";
import wardRoutes from "./routes/ward.routes.js";
import voteRoutes from "./routes/vote.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import authorityDashboardRoutes from "./routes/authorityDashboard.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";


/* =====================
   CREATE APP FIRST
   ===================== */
const app = express();

/* =====================
   MIDDLEWARE
   ===================== */
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use("/api", analyticsRoutes);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

/* =====================
   ROUTES
   ===================== */
app.use("/api/auth", authRoutes);
app.use("/api/complaint", complaintRoutes);
app.use("/api/ward", wardRoutes);
app.use("/api", voteRoutes);
app.use("/api/admin", adminRoutes);

// ✅ THIS MUST BE AFTER app is created
app.use("/api", authorityDashboardRoutes);

/* =====================
   TEST ROUTE
   ===================== */
app.get("/", (req, res) => {
  res.send({ message: "Backend is running!" });
});

export { app };
