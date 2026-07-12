import { PrismaClient } from "@prisma/client";
import { logActivity } from "../utils/logger.js";

const prisma = new PrismaClient();

export const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        parentDepartment: true,
        head: true,
        subDepartments: true,
        _count: {
          select: { employees: true, assets: true },
        },
      },
    });
    return res.status(200).json(departments);
  } catch (error) {
    console.error("Get Departments Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createDepartment = async (req, res) => {
  const { name, description, parentId, headId, status } = req.body;
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({ message: "Department Name is required" });
  }

  try {
    const existing = await prisma.department.findUnique({ where: { name } });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Department already exists with this name" });
    }

    const department = await prisma.department.create({
      data: {
        name,
        description,
        parentId: parentId ? parseInt(parentId, 10) : null,
        headId: headId ? parseInt(headId, 10) : null,
        status: status || "ACTIVE",
      },
    });

    await logActivity(
      userId,
      "CREATE_DEPARTMENT",
      `Created department ${name}`,
      req,
    );
    return res.status(201).json(department);
  } catch (error) {
    console.error("Create Department Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name, description, parentId, headId, status } = req.body;
  const userId = req.user.id;

  try {
    const deptId = parseInt(id, 10);
    const existingDept = await prisma.department.findUnique({
      where: { id: deptId },
    });
    if (!existingDept) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Check duplicate name
    if (name && name !== existingDept.name) {
      const duplicate = await prisma.department.findUnique({ where: { name } });
      if (duplicate) {
        return res
          .status(400)
          .json({ message: "Department already exists with this name" });
      }
    }

    // Prevent cycle in parenting
    if (parentId && parseInt(parentId, 10) === deptId) {
      return res
        .status(400)
        .json({ message: "A department cannot be its own parent" });
    }

    const updated = await prisma.department.update({
      where: { id: deptId },
      data: {
        name,
        description,
        parentId:
          parentId !== undefined
            ? parentId
              ? parseInt(parentId, 10)
              : null
            : undefined,
        headId:
          headId !== undefined
            ? headId
              ? parseInt(headId, 10)
              : null
            : undefined,
        status,
      },
    });

    // If headId is updated, we also update the Employee's department to this department
    if (headId) {
      await prisma.employee.update({
        where: { id: parseInt(headId, 10) },
        data: { departmentId: deptId },
      });
    }

    await logActivity(
      userId,
      "UPDATE_DEPARTMENT",
      `Updated department ${updated.name}`,
      req,
    );
    return res.status(200).json(updated);
  } catch (error) {
    console.error("Update Department Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteDepartment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const deptId = parseInt(id, 10);
    const dept = await prisma.department.findUnique({
      where: { id: deptId },
      include: {
        employees: true,
        assets: true,
        subDepartments: true,
      },
    });

    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    if (dept.employees.length > 0) {
      return res
        .status(400)
        .json({
          message:
            "Cannot delete department with assigned employees. Reassign them first.",
        });
    }

    if (dept.assets.length > 0) {
      return res
        .status(400)
        .json({
          message:
            "Cannot delete department with registered assets. Reassign them first.",
        });
    }

    if (dept.subDepartments.length > 0) {
      return res
        .status(400)
        .json({
          message:
            "Cannot delete department with sub-departments. Delete or re-parent sub-departments first.",
        });
    }

    await prisma.department.delete({ where: { id: deptId } });

    await logActivity(
      userId,
      "DELETE_DEPARTMENT",
      `Deleted department ${dept.name}`,
      req,
    );
    return res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("Delete Department Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
