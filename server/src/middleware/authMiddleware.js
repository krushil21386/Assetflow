import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "nexasset_secure_token_key_2026";

export const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Fetch user and details
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: true,
        employee: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found or deleted" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      employeeId: user.employee?.id,
      employeeCode: user.employee?.employeeCode,
      name: user.employee?.name,
      departmentId: user.employee?.departmentId,
    };

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    const authReq = req;
    if (!authReq.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(authReq.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient permissions" });
    }

    next();
  };
};
