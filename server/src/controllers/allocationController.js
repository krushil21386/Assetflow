import { PrismaClient } from "@prisma/client";
import { logActivity } from "../utils/logger.js";
import { createNotification, notifyRoles } from "../utils/notifications.js";

const prisma = new PrismaClient();

export const allocateAsset = async (req, res) => {
  const { assetId, employeeId, expectedReturnDate, conditionBefore, notes } =
    req.body;
  const operatorUserId = req.user.id;
  const operatorEmployeeId = req.user.employeeId;

  if (!assetId || !employeeId || !conditionBefore) {
    return res
      .status(400)
      .json({ message: "Asset, Employee and Condition Before are required" });
  }

  if (!operatorEmployeeId) {
    return res
      .status(400)
      .json({ message: "Operator does not have an employee profile" });
  }

  try {
    const targetAssetId = parseInt(assetId, 10);
    const targetEmployeeId = parseInt(employeeId, 10);

    // Fetch asset & employee
    const asset = await prisma.asset.findUnique({
      where: { id: targetAssetId },
    });
    const employee = await prisma.employee.findUnique({
      where: { id: targetEmployeeId },
      include: { user: true },
    });

    if (!asset) return res.status(404).json({ message: "Asset not found" });
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    // Business Rules
    if (asset.status === "ALLOCATED") {
      return res
        .status(400)
        .json({ message: "Cannot allocate: Asset is already allocated" });
    }
    if (asset.status === "MAINTENANCE") {
      return res
        .status(400)
        .json({
          message: "Cannot allocate: Asset is currently under maintenance",
        });
    }
    if (["RETIRED", "DISPOSED", "LOST"].includes(asset.status)) {
      return res
        .status(400)
        .json({
          message: `Cannot allocate: Asset is ${asset.status.toLowerCase()}`,
        });
    }

    // Run transaction
    const allocation = await prisma.$transaction(async (tx) => {
      // 1. Create Allocation record
      const alloc = await tx.assetAllocation.create({
        data: {
          assetId: targetAssetId,
          employeeId: targetEmployeeId,
          departmentId: employee.departmentId,
          allocatedById: operatorEmployeeId,
          expectedReturnDate: expectedReturnDate
            ? new Date(expectedReturnDate)
            : null,
          conditionBefore,
          notes,
          status: "ACTIVE",
        },
      });

      // 2. Update Asset status and department
      await tx.asset.update({
        where: { id: targetAssetId },
        data: {
          status: "ALLOCATED",
          departmentId: employee.departmentId,
        },
      });

      return alloc;
    });

    // Notify employee if they have a user account
    if (employee.userId) {
      await createNotification(
        employee.userId,
        "Asset Allocated",
        `Asset "${asset.name}" (${asset.assetTag}) has been allocated to you.`,
        "SUCCESS",
      );
    }

    await logActivity(
      operatorUserId,
      "ALLOCATE_ASSET",
      `Allocated asset ${asset.name} to ${employee.name}`,
      req,
    );
    return res.status(201).json(allocation);
  } catch (error) {
    console.error("Allocate Asset Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const returnAsset = async (req, res) => {
  const { allocationId, conditionAfter, notes } = req.body;
  const operatorUserId = req.user.id;

  if (!allocationId || !conditionAfter) {
    return res
      .status(400)
      .json({ message: "Allocation ID and Condition After are required" });
  }

  try {
    const allocId = parseInt(allocationId, 10);
    const allocation = await prisma.assetAllocation.findUnique({
      where: { id: allocId },
      include: {
        asset: true,
        employee: { include: { user: true } },
      },
    });

    if (!allocation) {
      return res.status(404).json({ message: "Allocation record not found" });
    }

    if (allocation.status !== "ACTIVE") {
      return res
        .status(400)
        .json({ message: "Asset has already been returned" });
    }

    // Run transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update Allocation
      await tx.assetAllocation.update({
        where: { id: allocId },
        data: {
          actualReturnDate: new Date(),
          conditionAfter,
          notes: notes || allocation.notes,
          status: "RETURNED",
        },
      });

      // Determine next status: if conditionAfter is DAMAGED or POOR, maybe mark MAINTENANCE, else AVAILABLE
      const nextStatus =
        conditionAfter === "DAMAGED" || conditionAfter === "POOR"
          ? "MAINTENANCE"
          : "AVAILABLE";

      // 2. Update Asset
      await tx.asset.update({
        where: { id: allocation.assetId },
        data: {
          status: nextStatus,
          condition: conditionAfter,
        },
      });
    });

    if (allocation.employee.userId) {
      await createNotification(
        allocation.employee.userId,
        "Asset Returned",
        `Asset "${allocation.asset.name}" has been marked as returned.`,
        "INFO",
      );
    }

    await logActivity(
      operatorUserId,
      "RETURN_ASSET",
      `Returned asset ${allocation.asset.name} from ${allocation.employee.name}`,
      req,
    );
    return res.status(200).json({ message: "Asset returned successfully" });
  } catch (error) {
    console.error("Return Asset Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const requestTransfer = async (req, res) => {
  const { assetId, toDepartmentId, remarks } = req.body;
  const operatorUserId = req.user.id;
  const employeeId = req.user.employeeId;

  if (!assetId || !toDepartmentId) {
    return res
      .status(400)
      .json({ message: "Asset and Target Department are required" });
  }

  if (!employeeId) {
    return res
      .status(400)
      .json({ message: "Operator does not have an employee profile" });
  }

  try {
    const targetAssetId = parseInt(assetId, 10);
    const targetDeptId = parseInt(toDepartmentId, 10);

    const asset = await prisma.asset.findUnique({
      where: { id: targetAssetId },
    });
    if (!asset) return res.status(404).json({ message: "Asset not found" });
    if (!asset.departmentId) {
      return res
        .status(400)
        .json({
          message:
            "Asset is not assigned to any department. Allocate or update it first.",
        });
    }

    if (asset.departmentId === targetDeptId) {
      return res
        .status(400)
        .json({ message: "Asset is already in the target department" });
    }

    const transfer = await prisma.assetTransfer.create({
      data: {
        assetId: targetAssetId,
        employeeId: employeeId,
        fromDepartmentId: asset.departmentId,
        toDepartmentId: targetDeptId,
        remarks,
        status: "REQUESTED",
      },
      include: { asset: true },
    });

    // Notify HOD of From Department for first approval
    const fromDept = await prisma.department.findUnique({
      where: { id: asset.departmentId },
      include: { head: true },
    });

    if (fromDept?.head?.userId) {
      await createNotification(
        fromDept.head.userId,
        "Transfer Request Approval Pending",
        `A request to transfer "${asset.name}" to Department ID ${targetDeptId} requires your HOD approval.`,
        "WARNING",
      );
    }

    await logActivity(
      operatorUserId,
      "REQUEST_TRANSFER",
      `Requested transfer of ${asset.name} to department ID ${targetDeptId}`,
      req,
    );
    return res.status(201).json(transfer);
  } catch (error) {
    console.error("Request Transfer Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const approveTransferHOD = async (req, res) => {
  const { id } = req.params;
  const operatorUserId = req.user.id;
  const operatorEmployeeId = req.user.employeeId;

  try {
    const transferId = parseInt(id, 10);
    const transfer = await prisma.assetTransfer.findUnique({
      where: { id: transferId },
      include: { asset: true },
    });

    if (!transfer)
      return res.status(404).json({ message: "Transfer request not found" });
    if (transfer.status !== "REQUESTED") {
      return res
        .status(400)
        .json({
          message: `Cannot approve: Transfer is in status ${transfer.status}`,
        });
    }

    // Verify HOD permissions: user must be the Head of the 'fromDepartment'
    const fromDept = await prisma.department.findUnique({
      where: { id: transfer.fromDepartmentId },
    });

    if (fromDept?.headId !== operatorEmployeeId && req.user.role !== "Admin") {
      return res
        .status(403)
        .json({
          message:
            "Only the Department Head of the source department (or Admin) can give HOD approval.",
        });
    }

    const updated = await prisma.assetTransfer.update({
      where: { id: transferId },
      data: { status: "APPROVED_BY_HOD" },
    });

    // Notify Asset Managers
    await notifyRoles(
      ["Admin", "Asset Manager"],
      "Transfer Request Pending manager approval",
      `Transfer of "${transfer.asset.name}" approved by HOD, pending final inventory approval.`,
    );

    await logActivity(
      operatorUserId,
      "APPROVE_TRANSFER_HOD",
      `Approved HOD stage of transfer for asset ${transfer.asset.name}`,
      req,
    );
    return res.status(200).json(updated);
  } catch (error) {
    console.error("Approve Transfer HOD Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const approveTransferManager = async (req, res) => {
  const { id } = req.params;
  const operatorUserId = req.user.id;

  try {
    const transferId = parseInt(id, 10);
    const transfer = await prisma.assetTransfer.findUnique({
      where: { id: transferId },
      include: { asset: true, employee: true },
    });

    if (!transfer)
      return res.status(404).json({ message: "Transfer request not found" });
    if (transfer.status !== "APPROVED_BY_HOD") {
      return res
        .status(400)
        .json({
          message: "HOD approval is required before Asset Manager approval",
        });
    }

    // Run transaction: update status, and update the Asset's department
    const result = await prisma.$transaction(async (tx) => {
      const updatedTransfer = await tx.assetTransfer.update({
        where: { id: transferId },
        data: { status: "TRANSFERRED" },
      });

      await tx.asset.update({
        where: { id: transfer.assetId },
        data: { departmentId: transfer.toDepartmentId },
      });

      // If asset is currently allocated, we should update the allocation department as well
      await tx.assetAllocation.updateMany({
        where: { assetId: transfer.assetId, status: "ACTIVE" },
        data: { departmentId: transfer.toDepartmentId },
      });

      return updatedTransfer;
    });

    // Notify requesting employee
    if (transfer.employee.userId) {
      await createNotification(
        transfer.employee.userId,
        "Transfer Approved",
        `Your transfer request for "${transfer.asset.name}" has been completed.`,
        "SUCCESS",
      );
    }

    await logActivity(
      operatorUserId,
      "APPROVE_TRANSFER_MANAGER",
      `Completed transfer of asset ${transfer.asset.name} to department ID ${transfer.toDepartmentId}`,
      req,
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error("Approve Transfer Manager Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const rejectTransfer = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const operatorUserId = req.user.id;

  try {
    const transferId = parseInt(id, 10);
    const transfer = await prisma.assetTransfer.findUnique({
      where: { id: transferId },
      include: { asset: true, employee: true },
    });

    if (!transfer)
      return res.status(404).json({ message: "Transfer request not found" });
    if (["TRANSFERRED", "REJECTED"].includes(transfer.status)) {
      return res.status(400).json({ message: "Transfer is already closed" });
    }

    const updated = await prisma.assetTransfer.update({
      where: { id: transferId },
      data: {
        status: "REJECTED",
        remarks: reason
          ? `${transfer.remarks || ""} [Rejected: ${reason}]`
          : transfer.remarks,
      },
    });

    if (transfer.employee.userId) {
      await createNotification(
        transfer.employee.userId,
        "Transfer Rejected",
        `Your transfer request for "${transfer.asset.name}" has been rejected.`,
        "WARNING",
      );
    }

    await logActivity(
      operatorUserId,
      "REJECT_TRANSFER",
      `Rejected transfer of asset ${transfer.asset.name}`,
      req,
    );
    return res.status(200).json(updated);
  } catch (error) {
    console.error("Reject Transfer Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllocationHistory = async (req, res) => {
  try {
    const allocations = await prisma.assetAllocation.findMany({
      include: {
        asset: true,
        employee: true,
        allocatedBy: true,
      },
      orderBy: { allocationDate: "desc" },
    });

    const transfers = await prisma.assetTransfer.findMany({
      include: {
        asset: true,
        employee: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ allocations, transfers });
  } catch (error) {
    console.error("Get History Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
