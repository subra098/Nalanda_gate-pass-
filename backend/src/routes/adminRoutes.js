import express from "express";
import { createStaff, getAllStaff } from "../controllers/adminController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admin only." });
    }
};

router.post("/staff", authenticate, isAdmin, createStaff);
router.get("/staff", authenticate, isAdmin, getAllStaff);

export default router;
