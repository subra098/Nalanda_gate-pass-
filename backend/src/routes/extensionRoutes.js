import express from "express";
import {
    createExtensionRequest,
    getMyExtensionRequests,
    updateExtensionStatus
} from "../controllers/extensionController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/request", authenticate, authorize("STUDENT"), createExtensionRequest);
router.get("/my", authenticate, authorize("STUDENT"), getMyExtensionRequests);
router.put("/:id/status", authenticate, authorize("HOSTEL_ATTENDANT", "SUPERINTENDENT"), updateExtensionStatus);

export default router;
