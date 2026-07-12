import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logActivity } from "../utils/logger.js";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "nexasset_secure_token_key_2026";

export const signup = async (req, res) => {
  const { name, email, password, departmentId } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get default Employee role
    const employeeRole = await prisma.role.findUnique({
      where: { name: "Employee" },
    });

    if (!employeeRole) {
      return res.status(500).json({ message: "Default role not configured" });
    }

    // Auto-generate employee code
    const lastEmployee = await prisma.employee.findFirst({
      orderBy: { employeeCode: "desc" },
    });
    let newCode = "EMP001";
    if (lastEmployee && lastEmployee.employeeCode.startsWith("EMP")) {
      const lastNum = parseInt(
        lastEmployee.employeeCode.replace("EMP", ""),
        10,
      );
      newCode = `EMP${String(lastNum + 1).padStart(3, "0")}`;
    }

    // Create User & Employee in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          roleId: employeeRole.id,
        },
      });

      const employee = await tx.employee.create({
        data: {
          employeeCode: newCode,
          name,
          email,
          joiningDate: new Date(),
          status: "ACTIVE",
          userId: user.id,
          departmentId: departmentId ? parseInt(departmentId, 10) : null,
        },
      });

      return { user, employee };
    });

    // Generate JWT
    const token = jwt.sign({ userId: result.user.id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    // Log Activity
    await logActivity(
      result.user.id,
      "SIGNUP",
      `User ${email} registered with code ${newCode}`,
      req,
    );

    return res.status(201).json({
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: employeeRole.name,
        employee: {
          id: result.employee.id,
          employeeCode: result.employee.employeeCode,
          name: result.employee.name,
          departmentId: result.employee.departmentId,
        },
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error during registration" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        employee: true,
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.employee?.status !== "ACTIVE") {
      return res
        .status(403)
        .json({ message: "Your account is inactive. Contact Administrator" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    // Log Activity
    await logActivity(user.id, "LOGIN", `User ${email} logged in`, req);

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
        employee: {
          id: user.employee.id,
          employeeCode: user.employee.employeeCode,
          name: user.employee.name,
          departmentId: user.employee.departmentId,
        },
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error during login" });
  }
};

export const logout = async (req, res) => {
  // Authentication is stateless with JWT, so we just log the activity if user is present
  const userId = req.user?.id;
  if (userId) {
    await logActivity(userId, "LOGOUT", "User logged out", req);
  }
  return res.status(200).json({ message: "Logged out successfully" });
};

export const getMe = async (req, res) => {
  const authUser = req.user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        role: true,
        employee: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
        employee: user.employee,
      },
    });
  } catch (error) {
    console.error("Get Me Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email, employeeCode, newPassword } = req.body;

  if (!email || !employeeCode || !newPassword) {
    return res.status(400).json({ message: "Email, Employee Code and New Password are required" });
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { email },
      include: { user: true }
    });

    if (!employee || employee.employeeCode !== employeeCode || !employee.userId) {
      return res.status(400).json({ message: "Verification failed: Employee Code or Email does not match our records." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: employee.userId },
      data: { password: hashedPassword }
    });

    await logActivity(employee.userId, "PASSWORD_RESET", `Password reset for user ${email}`, req);

    return res.status(200).json({ message: "Password updated successfully. You can now log in." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Internal Server Error during password reset" });
  }
};
