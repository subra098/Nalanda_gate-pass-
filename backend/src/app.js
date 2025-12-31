import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import gatepassRoutes from "./routes/gatepassRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import extensionRoutes from "./routes/extensionRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/gatepass", gatepassRoutes); // Shared for student/attendant/superintendent
app.use("/api/security", securityRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/extension", extensionRoutes);

app.get("/", (req, res) => {
    res.send("Pass Flow Backend Running 🚀");
});

export default app;
