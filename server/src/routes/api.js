import { Router } from "express";
import { signup, login, logout, getMe } from "../controllers/authController.js";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/deptController.js";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
} from "../controllers/employeeController.js";
import {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
} from "../controllers/assetController.js";
import {
  allocateAsset,
  returnAsset,
  requestTransfer,
  approveTransferHOD,
  approveTransferManager,
  rejectTransfer,
  getAllocationHistory,
} from "../controllers/allocationController.js";
import {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
} from "../controllers/bookingController.js";
import {
  getMaintenance,
  createMaintenanceRequest,
  updateMaintenanceRequest,
} from "../controllers/maintenanceController.js";
import {
  getAudits,
  getAuditById,
  createAuditCycle,
  updateAuditCycleStatus,
  verifyAssetInAudit,
} from "../controllers/auditController.js";
import {
  getDashboardSummary,
  getReportsAssets,
  getReportsMaintenance,
  getReportsBookings,
  getNotifications,
  markNotificationRead,
  getActivityLogs,
} from "../controllers/dashboardController.js";

import { authenticateJWT, authorize } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", logout);

// ==========================================
// AUTHENTICATED ROUTES (Shared)
// ==========================================
router.use(authenticateJWT);

router.get("/me", getMe);
router.get("/dashboard/summary", getDashboardSummary);
router.get("/notifications", getNotifications);
router.put("/notifications/:id/read", markNotificationRead);

// Departments (Read)
router.get("/departments", getDepartments);

// Categories (Read)
router.get("/categories", getCategories);

// Employees (Read)
router.get("/employees", getEmployees);

// Assets (Read)
router.get("/assets", getAssets);
router.get("/assets/:id", getAssetById);

// Resource Booking
router.get("/booking", getBookings);
router.post("/booking", createBooking);
router.put("/booking/:id", updateBooking);
router.delete("/booking/:id", deleteBooking);

// Maintenance Requests
router.get("/maintenance", getMaintenance);
router.post(
  "/maintenance",
  upload.array("attachments", 3),
  createMaintenanceRequest,
);
router.put("/maintenance/:id", updateMaintenanceRequest);

// Transfer Management (Request & HOD Approvals)
router.post("/transfer", requestTransfer);
router.put("/transfer/:id/approve-hod", approveTransferHOD);
router.put("/transfer/:id/reject", rejectTransfer);

// ==========================================
// INVENTORY & ASSET MANAGER / ADMIN ROUTES
// ==========================================
const managerOrAdmin = authorize(["Admin", "Asset Manager"]);

// Asset Management
router.post("/assets", managerOrAdmin, upload.array("images", 5), createAsset);
router.put(
  "/assets/:id",
  managerOrAdmin,
  upload.array("images", 5),
  updateAsset,
);
router.delete("/assets/:id", managerOrAdmin, deleteAsset);

// Allocations
router.post("/allocate", managerOrAdmin, allocateAsset);
router.post("/return", managerOrAdmin, returnAsset);
router.get("/allocation-history", managerOrAdmin, getAllocationHistory);

// Transfer Approval (Asset Manager Stage)
router.put(
  "/transfer/:id/approve-manager",
  managerOrAdmin,
  approveTransferManager,
);

// Audit Cycle Management
router.get("/audit", managerOrAdmin, getAudits);
router.get("/audit/:id", getAuditById); // Auditor can also access
router.post("/audit", managerOrAdmin, createAuditCycle);
router.put("/audit/:id", managerOrAdmin, updateAuditCycleStatus);
router.put("/audit/:id/verify", verifyAssetInAudit); // Auditor/Manager can verify

// Reports
router.get("/reports/assets", managerOrAdmin, getReportsAssets);
router.get("/reports/maintenance", managerOrAdmin, getReportsMaintenance);
router.get("/reports/bookings", managerOrAdmin, getReportsBookings);

// ==========================================
// ADMIN ONLY ROUTES
// ==========================================
const adminOnly = authorize(["Admin"]);

// Departments CRUD (Write)
router.post("/departments", adminOnly, createDepartment);
router.put("/departments/:id", adminOnly, updateDepartment);
router.delete("/departments/:id", adminOnly, deleteDepartment);

// Categories CRUD (Write)
router.post("/categories", adminOnly, createCategory);
router.put("/categories/:id", adminOnly, updateCategory);
router.delete("/categories/:id", adminOnly, deleteCategory);

// Employees Directory (Write / Promote)
router.post("/employees", adminOnly, createEmployee);
router.put("/employees/:id", adminOnly, updateEmployee);

// Activity Logs
router.get("/activity-logs", adminOnly, getActivityLogs);

export default router;
