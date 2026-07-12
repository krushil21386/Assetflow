import { PrismaClient } from "@prisma/client";
import { logActivity } from "../utils/logger.js";
import { createNotification } from "../utils/notifications.js";
import { getIO } from "../utils/socket.js";

const prisma = new PrismaClient();

export const getMaintenance = async (req, res) => {
  const { status, priority, assetId } = req.query;

  try {
    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (assetId) filters.assetId = parseInt(assetId, 10);

    const requests = await prisma.maintenanceRequest.findMany({
      where: filters,
      include: {
        asset: true,
        requestedBy: true,
        assignedTo: true,
        history: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(requests);
  } catch (error) {
    console.error("Get Maintenance Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createMaintenanceRequest = async (req, res) => {
  const { assetId, issue, priority } = req.body;
  const userId = req.user.id;
  const employeeId = req.user.employeeId;

  if (!assetId || !issue) {
    return res
      .status(400)
      .json({ message: "Asset ID and Issue description are required" });
  }

  if (!employeeId) {
    return res
      .status(400)
      .json({
        message:
          "User must be linked to an employee profile to request maintenance",
      });
  }

  try {
    const targetAssetId = parseInt(assetId, 10);
    const asset = await prisma.asset.findUnique({
      where: { id: targetAssetId },
    });
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    // Process files if uploaded
    const files = req.files || [];
    const filePaths = files.map(
      (file) => `uploads/maintenance/${file.filename}`,
    );

    const request = await prisma.$transaction(async (tx) => {
      // 1. Create request
      const reqRecord = await tx.maintenanceRequest.create({
        data: {
          assetId: targetAssetId,
          issue,
          priority: priority || "MEDIUM",
          requestedById: employeeId,
          status: "PENDING",
          attachments: filePaths.join(","),
        },
      });

      // 2. Create History
      await tx.maintenanceHistory.create({
        data: {
          requestId: reqRecord.id,
          status: "PENDING",
          notes: "Maintenance ticket raised.",
          updatedById: employeeId,
        },
      });

      return reqRecord;
    });

    await logActivity(
      userId,
      "CREATE_MAINTENANCE",
      `Raised maintenance request for ${asset.name}`,
      req,
    );
    getIO().emit("maintenance:created", request);
    return res.status(201).json(request);
  } catch (error) {
    console.error("Create Maintenance Request Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateMaintenanceRequest = async (req, res) => {
  const { id } = req.params;
  const { status, assignedToId, cost, remarks, notes } = req.body;
  const userId = req.user.id;
  const employeeId = req.user.employeeId;

  if (!employeeId) {
    return res.status(400).json({ message: "Operator must be an employee" });
  }

  try {
    const reqId = parseInt(id, 10);
    const existing = await prisma.maintenanceRequest.findUnique({
      where: { id: reqId },
      include: { asset: true, requestedBy: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "Maintenance request not found" });
    }

    const nextStatus = status || existing.status;
    const nextAssignedId = assignedToId
      ? parseInt(assignedToId, 10)
      : existing.assignedToId;
    const nextCost = cost !== undefined ? parseFloat(cost) : existing.cost;
    const nextRemarks = remarks !== undefined ? remarks : existing.remarks;

    // Run updates in a transaction to handle Asset status updates
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Request
      const updated = await tx.maintenanceRequest.update({
        where: { id: reqId },
        data: {
          status: nextStatus,
          assignedToId: nextAssignedId,
          cost: nextCost,
          remarks: nextRemarks,
        },
      });

      // 2. Add to History
      await tx.maintenanceHistory.create({
        data: {
          requestId: reqId,
          status: nextStatus,
          notes:
            notes ||
            `Status updated to ${nextStatus.replace("_", " ").toLowerCase()}`,
          updatedById: employeeId,
        },
      });

      // 3. Asset Status Toggles
      if (
        nextStatus === "APPROVED" ||
        nextStatus === "IN_PROGRESS" ||
        nextStatus === "TECHNICIAN_ASSIGNED"
      ) {
        // Change asset status to MAINTENANCE
        await tx.asset.update({
          where: { id: existing.assetId },
          data: { status: "MAINTENANCE" },
        });
      } else if (
        nextStatus === "COMPLETED" ||
        nextStatus === "CLOSED" ||
        nextStatus === "REJECTED"
      ) {
        // Restore asset status to AVAILABLE (if it is not allocated to someone, or check if active allocation exists)
        const activeAlloc = await tx.assetAllocation.findFirst({
          where: { assetId: existing.assetId, status: "ACTIVE" },
        });
        await tx.asset.update({
          where: { id: existing.assetId },
          data: { status: activeAlloc ? "ALLOCATED" : "AVAILABLE" },
        });
      }

      return updated;
    });

    // Notify requester
    if (existing.requestedBy.userId) {
      await createNotification(
        existing.requestedBy.userId,
        "Maintenance Ticket Update",
        `Your maintenance ticket for "${existing.asset.name}" has been updated to "${nextStatus}".`,
        "INFO",
      );
    }

    await logActivity(
      userId,
      "UPDATE_MAINTENANCE",
      `Updated maintenance ticket ID ${reqId} to ${nextStatus}`,
      req,
    );
    getIO().emit("maintenance:updated", result);
    getIO().emit("asset:updated", { id: existing.assetId });
    return res.status(200).json(result);
  } catch (error) {
    console.error("Update Maintenance Request Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
