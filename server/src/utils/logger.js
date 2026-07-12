import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const logActivity = async (userId, action, details, req) => {
  try {
    const ipAddress = req
      ? req.headers["x-forwarded-for"] || req.socket.remoteAddress
      : null;
    const browser = req ? req.headers["user-agent"] : null;

    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details,
        ipAddress: ipAddress || "Unknown",
        browser: browser ? browser.substring(0, 255) : "Unknown",
      },
    });
  } catch (error) {
    console.error("Failed to write activity log:", error);
  }
};
