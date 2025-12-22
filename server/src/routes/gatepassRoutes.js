import express from "express";
import {
    createGatepass,
    getMyPasses,
    getPasses,
    updatePassStatus
} from "../controllers/gatepassController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/request", authenticate, authorize("STUDENT"), createGatepass);
router.get("/my", authenticate, authorize("STUDENT"), getMyPasses);

// Attendant/Superintendent routes
// Example usage: /api/gatepass/list?status=PENDING
router.get("/list", authenticate, authorize("HOSTEL_ATTENDANT", "SUPERINTENDENT", "SECURITY_GUARD"), getPasses);
router.put("/:id/status", authenticate, authorize("HOSTEL_ATTENDANT", "SUPERINTENDENT"), updatePassStatus);

export default router;
