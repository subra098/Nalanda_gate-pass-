import prisma from "../config/db.js";
import { generateToken } from "../utils/jwt.js";
import { hashPassword, comparePassword } from "../utils/password.js";

export const register = async (req, res) => {
    try {
        console.log("Register attempt body:", req.body);
        let { email, password, fullName, role, hostel, rollNo, parentContact } = req.body;

        // Trim all inputs to handle mobile quirks
        email = email?.trim().toLowerCase();
        password = password?.trim();
        fullName = fullName?.trim();
        hostel = hostel?.trim();
        rollNo = rollNo?.trim();
        parentContact = parentContact?.trim();

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await hashPassword(password);

        // Convert role to uppercase to match Prisma enum
        const roleUpperCase = role.toUpperCase();

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                fullName,
                role: roleUpperCase,
                hostel,
                rollNo,
                parentContact,
            },
        });

        const token = generateToken(user);

        res.status(201).json({
            message: "User created successfully",
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                hostel: user.hostel,
                rollNo: user.rollNo,
                parentContact: user.parentContact,
            },
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (req, res) => {
    try {
        console.log("Login attempt body:", req.body);
        let { email, password } = req.body;

        // Trim and lowercase email to handle mobile keyboard quirks
        email = email?.trim().toLowerCase();
        password = password?.trim();

        console.log(`Login attempt for: ${email}`);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log(`User not found: ${email}`);
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            console.log(`Password mismatch for: ${email}`);
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user);
        console.log(`Login successful for: ${email}`);

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                hostel: user.hostel,
                rollNo: user.rollNo,
                parentContact: user.parentContact,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                hostel: true,
                rollNo: true,
                parentContact: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("GetMe error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
