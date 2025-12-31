import prisma from "../config/db.js";
import { hashPassword } from "../utils/password.js";

// Create Staff (Hostel Attendant, Superintendent, Security Guard)
export const createStaff = async (req, res) => {
    try {
        let { email, password, fullName, role, hostel } = req.body;

        if (!['HOSTEL_ATTENDANT', 'SUPERINTENDENT', 'SECURITY_GUARD'].includes(role)) {
            return res.status(400).json({ message: "Invalid role for staff creation" });
        }

        email = email?.trim().toLowerCase();
        password = password?.trim();
        fullName = fullName?.trim();

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                fullName,
                role,
                hostel: role === 'HOSTEL_ATTENDANT' ? hostel : null, // Only attendants need hostel assignment
            },
        });

        res.status(201).json({
            message: "Staff created successfully",
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                hostel: user.hostel
            }
        });

    } catch (error) {
        console.error("Create Staff Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get All Staff
export const getAllStaff = async (req, res) => {
    try {
        const staff = await prisma.user.findMany({
            where: {
                role: {
                    in: ['HOSTEL_ATTENDANT', 'SUPERINTENDENT', 'SECURITY_GUARD']
                }
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                hostel: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(staff);
    } catch (error) {
        console.error("Get Staff Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
