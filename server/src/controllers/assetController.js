import { PrismaClient } from "@prisma/client";
import { logActivity } from "../utils/logger.js";

const prisma = new PrismaClient();

export const getAssets = async (req, res) => {
  const { categoryId, departmentId, bookable, status, search } = req.query;

  try {
    const filters = {};

    if (categoryId) filters.categoryId = parseInt(categoryId, 10);
    if (departmentId) filters.departmentId = parseInt(departmentId, 10);
    if (bookable) filters.bookable = bookable === "true";
    if (status) filters.status = status;
    if (search) {
      filters.OR = [
        { name: { contains: search } },
        { assetTag: { contains: search } },
        { serialNumber: { contains: search } },
        { brand: { contains: search } },
        { model: { contains: search } },
      ];
    }

    const assets = await prisma.asset.findMany({
      where: filters,
      include: {
        category: true,
        department: true,
        images: true,
        allocations: {
          where: { status: "ACTIVE" },
          include: { employee: true },
        },
      },
    });

    return res.status(200).json(assets);
  } catch (error) {
    console.error("Get Assets Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAssetById = async (req, res) => {
  const { id } = req.params;

  try {
    const assetId = parseInt(id, 10);
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        category: true,
        department: true,
        images: true,
        allocations: {
          include: {
            employee: true,
            allocatedBy: true,
          },
          orderBy: { allocationDate: "desc" },
        },
        transfers: {
          include: {
            employee: true,
          },
          orderBy: { createdAt: "desc" },
        },
        maintenanceRequests: {
          include: {
            requestedBy: true,
            assignedTo: true,
          },
          orderBy: { createdAt: "desc" },
        },
        bookings: {
          include: { employee: true },
          orderBy: { date: "desc" },
        },
        auditDetails: {
          include: { auditCycle: true },
          orderBy: { verifiedAt: "desc" },
        },
      },
    });

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    return res.status(200).json(asset);
  } catch (error) {
    console.error("Get Asset By ID Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createAsset = async (req, res) => {
  const {
    assetTag,
    name,
    categoryId,
    brand,
    model,
    serialNumber,
    purchaseDate,
    purchaseCost,
    vendor,
    warrantyEndDate,
    location,
    departmentId,
    condition,
    bookable,
    remarks,
    status,
  } = req.body;

  const userId = req.user.id;

  if (!assetTag || !name || !categoryId || !purchaseDate || !purchaseCost) {
    return res
      .status(400)
      .json({
        message:
          "Asset Tag, Name, Category, Purchase Date and Purchase Cost are required",
      });
  }

  try {
    // Check assetTag duplicate
    const existingTag = await prisma.asset.findUnique({ where: { assetTag } });
    if (existingTag) {
      return res
        .status(400)
        .json({ message: "Asset Tag is already registered" });
    }

    // Check serialNumber duplicate if provided
    if (serialNumber) {
      const existingSerial = await prisma.asset.findUnique({
        where: { serialNumber },
      });
      if (existingSerial) {
        return res
          .status(400)
          .json({ message: "Serial Number is already registered" });
      }
    }

    const catId = parseInt(categoryId, 10);
    const category = await prisma.assetCategory.findUnique({
      where: { id: catId },
    });
    if (!category) {
      return res.status(400).json({ message: "Invalid Asset Category" });
    }

    // Process files if uploaded
    const files = req.files || [];
    const imagePaths = files.map((file) => {
      // Save relative path for client serving: e.g. uploads/assets/filename.jpg
      const baseName = file.filename;
      return `uploads/assets/${baseName}`;
    });

    const newAsset = await prisma.asset.create({
      data: {
        assetTag,
        name,
        categoryId: catId,
        brand,
        model,
        serialNumber: serialNumber || null,
        purchaseDate: new Date(purchaseDate),
        purchaseCost: parseFloat(purchaseCost),
        vendor,
        warrantyEndDate: warrantyEndDate ? new Date(warrantyEndDate) : null,
        location,
        departmentId: departmentId ? parseInt(departmentId, 10) : null,
        condition: condition || "NEW",
        bookable: bookable === "true" || bookable === true || category.bookable,
        remarks,
        status: status || "AVAILABLE",
        images: {
          create: imagePaths.map((path) => ({ imagePath: path })),
        },
      },
      include: {
        category: true,
        images: true,
      },
    });

    await logActivity(
      userId,
      "CREATE_ASSET",
      `Created asset ${name} [Tag: ${assetTag}]`,
      req,
    );
    return res.status(201).json(newAsset);
  } catch (error) {
    console.error("Create Asset Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateAsset = async (req, res) => {
  const { id } = req.params;
  const {
    assetTag,
    name,
    categoryId,
    brand,
    model,
    serialNumber,
    purchaseDate,
    purchaseCost,
    vendor,
    warrantyEndDate,
    location,
    departmentId,
    condition,
    bookable,
    remarks,
    status,
    keepExistingImages,
  } = req.body;

  const userId = req.user.id;

  try {
    const assetId = parseInt(id, 10);
    const existing = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!existing) {
      return res.status(404).json({ message: "Asset not found" });
    }

    if (assetTag && assetTag !== existing.assetTag) {
      const duplicate = await prisma.asset.findUnique({ where: { assetTag } });
      if (duplicate) {
        return res.status(400).json({ message: "Asset Tag already in use" });
      }
    }

    if (serialNumber && serialNumber !== existing.serialNumber) {
      const duplicate = await prisma.asset.findUnique({
        where: { serialNumber },
      });
      if (duplicate) {
        return res
          .status(400)
          .json({ message: "Serial Number already in use" });
      }
    }

    const files = req.files || [];
    const newImagePaths = files.map(
      (file) => `uploads/assets/${file.filename}`,
    );

    const updateData = {
      assetTag,
      name,
      brand,
      model,
      serialNumber,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
      purchaseCost: purchaseCost ? parseFloat(purchaseCost) : undefined,
      vendor,
      warrantyEndDate: warrantyEndDate ? new Date(warrantyEndDate) : undefined,
      location,
      departmentId:
        departmentId !== undefined
          ? departmentId
            ? parseInt(departmentId, 10)
            : null
          : undefined,
      condition,
      bookable:
        bookable !== undefined
          ? bookable === "true" || bookable === true
          : undefined,
      remarks,
      status: status,
    };

    if (categoryId) {
      updateData.categoryId = parseInt(categoryId, 10);
    }

    // Handle image updates
    if (newImagePaths.length > 0) {
      // If we don't keep existing, delete existing records
      if (keepExistingImages !== "true" && keepExistingImages !== true) {
        await prisma.assetImage.deleteMany({ where: { assetId } });
      }
      updateData.images = {
        create: newImagePaths.map((path) => ({ imagePath: path })),
      };
    }

    const updated = await prisma.asset.update({
      where: { id: assetId },
      data: updateData,
      include: { category: true, images: true },
    });

    await logActivity(
      userId,
      "UPDATE_ASSET",
      `Updated asset ${updated.name} [Tag: ${updated.assetTag}]`,
      req,
    );
    return res.status(200).json(updated);
  } catch (error) {
    console.error("Update Asset Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteAsset = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const assetId = parseInt(id, 10);
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        allocations: { where: { status: "ACTIVE" } },
        maintenanceRequests: {
          where: { status: { in: ["PENDING", "APPROVED", "IN_PROGRESS"] } },
        },
      },
    });

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    if (asset.allocations.length > 0) {
      return res
        .status(400)
        .json({
          message:
            "Cannot delete asset. It is currently allocated to an employee. Return it first.",
        });
    }

    if (asset.maintenanceRequests.length > 0) {
      return res
        .status(400)
        .json({
          message: "Cannot delete asset. It has open maintenance requests.",
        });
    }

    await prisma.asset.delete({ where: { id: assetId } });

    await logActivity(
      userId,
      "DELETE_ASSET",
      `Deleted asset ${asset.name} [Tag: ${asset.assetTag}]`,
      req,
    );
    return res.status(200).json({ message: "Asset deleted successfully" });
  } catch (error) {
    console.error("Delete Asset Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
