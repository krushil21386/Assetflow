import { PrismaClient } from "@prisma/client";
import { logActivity } from "../utils/logger.js";

const prisma = new PrismaClient();

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.assetCategory.findMany({
      include: {
        _count: {
          select: { assets: true },
        },
      },
    });
    return res.status(200).json(categories);
  } catch (error) {
    console.error("Get Categories Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createCategory = async (req, res) => {
  const {
    name,
    description,
    warrantyPeriod,
    depreciationYears,
    bookable,
    status,
  } = req.body;
  const userId = req.user.id;

  if (
    !name ||
    warrantyPeriod === undefined ||
    depreciationYears === undefined
  ) {
    return res
      .status(400)
      .json({
        message:
          "Category Name, Warranty Period, and Depreciation Years are required",
      });
  }

  try {
    const existing = await prisma.assetCategory.findUnique({ where: { name } });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Category already exists with this name" });
    }

    const category = await prisma.assetCategory.create({
      data: {
        name,
        description,
        warrantyPeriod: parseInt(warrantyPeriod, 10),
        depreciationYears: parseInt(depreciationYears, 10),
        bookable: bookable === true || bookable === "true",
        status: status || "ACTIVE",
      },
    });

    await logActivity(
      userId,
      "CREATE_CATEGORY",
      `Created asset category ${name}`,
      req,
    );
    return res.status(201).json(category);
  } catch (error) {
    console.error("Create Category Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    warrantyPeriod,
    depreciationYears,
    bookable,
    status,
  } = req.body;
  const userId = req.user.id;

  try {
    const catId = parseInt(id, 10);
    const existing = await prisma.assetCategory.findUnique({
      where: { id: catId },
    });
    if (!existing) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name && name !== existing.name) {
      const duplicate = await prisma.assetCategory.findUnique({
        where: { name },
      });
      if (duplicate) {
        return res
          .status(400)
          .json({ message: "Category already exists with this name" });
      }
    }

    const updated = await prisma.assetCategory.update({
      where: { id: catId },
      data: {
        name,
        description,
        warrantyPeriod:
          warrantyPeriod !== undefined
            ? parseInt(warrantyPeriod, 10)
            : undefined,
        depreciationYears:
          depreciationYears !== undefined
            ? parseInt(depreciationYears, 10)
            : undefined,
        bookable:
          bookable !== undefined
            ? bookable === true || bookable === "true"
            : undefined,
        status,
      },
    });

    await logActivity(
      userId,
      "UPDATE_CATEGORY",
      `Updated category ${updated.name}`,
      req,
    );
    return res.status(200).json(updated);
  } catch (error) {
    console.error("Update Category Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const catId = parseInt(id, 10);
    const category = await prisma.assetCategory.findUnique({
      where: { id: catId },
      include: { assets: true },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (category.assets.length > 0) {
      return res
        .status(400)
        .json({
          message:
            "Cannot delete category with associated assets. Reassign or delete assets first.",
        });
    }

    await prisma.assetCategory.delete({ where: { id: catId } });

    await logActivity(
      userId,
      "DELETE_CATEGORY",
      `Deleted category ${category.name}`,
      req,
    );
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete Category Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
