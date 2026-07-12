export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  email: string;
  role: string;
  employee?: Employee;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  parentDepartment?: Department;
  subDepartments?: Department[];
  headId?: number;
  head?: Employee;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: number;
  employeeCode: string;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  joiningDate: string;
  profilePhoto?: string;
  status: "ACTIVE" | "INACTIVE";
  userId?: number;
  departmentId?: number;
  department?: Department;
}

export interface AssetCategory {
  id: number;
  name: string;
  description?: string;
  warrantyPeriod: number; // in months
  depreciationYears: number; // in years
  bookable: boolean;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface AssetImage {
  id: number;
  imagePath: string;
  assetId: number;
}

export interface Asset {
  id: number;
  assetTag: string;
  name: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate: string;
  purchaseCost: number;
  vendor?: string;
  warrantyEndDate?: string;
  location?: string;
  condition: "NEW" | "GOOD" | "FAIR" | "POOR" | "DAMAGED";
  bookable: boolean;
  remarks?: string;
  status: "AVAILABLE" | "ALLOCATED" | "RESERVED" | "MAINTENANCE" | "LOST" | "RETIRED" | "DISPOSED";
  createdAt: string;
  updatedAt: string;
  categoryId: number;
  category?: AssetCategory;
  departmentId?: number;
  department?: Department;
  images?: AssetImage[];
}

export interface AssetAllocation {
  id: number;
  allocationDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  status: "ACTIVE" | "RETURNED" | "OVERDUE";
  conditionBefore: string;
  conditionAfter?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  assetId: number;
  asset?: Asset;
  employeeId: number;
  employee?: Employee;
  departmentId?: number;
  department?: Department;
  allocatedById: number;
  allocatedBy?: Employee;
}

export interface AssetTransfer {
  id: number;
  status: "REQUESTED" | "APPROVED_HOD" | "TRANSFERRED" | "REJECTED";
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  assetId: number;
  asset?: Asset;
  employeeId: number;
  employee?: Employee;
  fromDepartmentId: number;
  toDepartmentId: number;
  fromDepartment?: Department;
  toDepartment?: Department;
}

export interface ResourceBooking {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  purpose?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  assetId: number;
  asset?: Asset;
  employeeId: number;
  employee?: Employee;
}

export interface MaintenanceRequest {
  id: number;
  issue: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  cost: number;
  attachments?: string;
  remarks?: string;
  status: "PENDING" | "APPROVED" | "TECHNICIAN_ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  assetId: number;
  asset?: Asset;
  requestedById: number;
  requestedBy?: Employee;
  assignedToId?: number;
  assignedTo?: Employee;
  history?: MaintenanceHistory[];
}

export interface MaintenanceHistory {
  id: number;
  status: string;
  notes?: string;
  updatedById: number;
  updatedAt: string;
  requestId: number;
}

export interface AuditCycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
  auditorId: number;
  auditor?: Employee;
  details?: AuditDetail[];
}

export interface AuditDetail {
  id: number;
  verificationStatus: "PENDING" | "VERIFIED" | "MISSING" | "DAMAGED" | "DISPOSED";
  notes?: string;
  verifiedAt?: string;
  auditCycleId: number;
  assetId: number;
  asset?: Asset;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "SUCCESS";
  isRead: boolean;
  createdAt: string;
  userId: number;
}

export interface ActivityLog {
  id: number;
  action: string;
  details: string;
  ipAddress?: string;
  browser?: string;
  createdAt: string;
  userId: number;
  user: {
    email: string;
    employee?: {
      name: string;
    };
  };
}
