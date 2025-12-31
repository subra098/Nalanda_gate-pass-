import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        config.jwtSecret,
        { expiresIn: "1d" }
    );
};

export const verifyToken = (token) => {
    return jwt.verify(token, config.jwtSecret);
};
