import { PrismaClient } from "@prisma/client";
import { sendEmailNotification } from "./email.js";
import { getIO } from "./socket.js";

const prisma = new PrismaClient();

export const createNotification = async (
  userId,
  title,
  message,
  type = "INFO",
) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        isRead: false,
      },
    });

    // Emit live notification update via Socket
    getIO().emit("notification:created", notification);

    // Fetch user's email to send email notification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (user && user.email) {
      const emailSubject = `[AssetFlow] ${title}`;
      const emailText = `Hello,\n\nYou have a new notification from AssetFlow ERP:\n\nSubject: ${title}\nMessage: ${message}\n\nBest regards,\nAssetFlow Team`;
      
      // Send email asynchronously so we don't delay the API response
      sendEmailNotification(user.email, emailSubject, emailText).catch((err) => {
        console.error("Async email notification failed:", err);
      });
    }
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
};

export const notifyDepartmentHead = async (
  departmentId,
  title,
  message,
  type = "INFO",
) => {
  try {
    const dept = await prisma.department.findUnique({
      where: { id: departmentId },
      include: { head: true },
    });
    if (dept?.head?.userId) {
      await createNotification(dept.head.userId, title, message, type);
    }
  } catch (error) {
    console.error("Failed to notify department head:", error);
  }
};

export const notifyRoles = async (roleNames, title, message, type = "INFO") => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          name: { in: roleNames },
        },
      },
    });

    for (const user of users) {
      await createNotification(user.id, title, message, type);
    }
  } catch (error) {
    console.error("Failed to notify roles:", error);
  }
};
