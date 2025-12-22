import express from "express";
import { scanQrCode, getScanLogs } from "../controllers/securityController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/scan", authenticate, authorize("SECURITY_GUARD"), scanQrCode);
router.get("/logs", authenticate, authorize("SECURITY_GUARD"), getScanLogs);

export default router;
