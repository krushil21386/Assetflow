import { PrismaClient } from "@prisma/client";
import { logActivity } from "../utils/logger.js";

const prisma = new PrismaClient();

// Helper to check overlap
const hasOverlappingBooking = async (
  assetId,
  date,
  startTime,
  endTime,
  ignoreBookingId,
) => {
  const dateStr = date.toISOString().split("T")[0];
  const existingBookings = await prisma.resourceBooking.findMany({
    where: {
      assetId,
      status: { in: ["PENDING", "APPROVED"] },
      id: ignoreBookingId ? { not: ignoreBookingId } : undefined,
    },
  });

  // Filter by matching date
  const sameDayBookings = existingBookings.filter(
    (b) => b.date.toISOString().split("T")[0] === dateStr,
  );

  for (const b of sameDayBookings) {
    // Overlap condition: start1 < end2 AND end1 > start2
    if (startTime < b.endTime && endTime > b.startTime) {
      return true;
    }
  }

  return false;
};

export const getBookings = async (req, res) => {
  const { assetId, employeeId, date } = req.query;

  try {
    const filters = {};
    if (assetId) filters.assetId = parseInt(assetId, 10);
    if (employeeId) filters.employeeId = parseInt(employeeId, 10);

    let bookings = await prisma.resourceBooking.findMany({
      where: filters,
      include: {
        asset: { include: { category: true } },
        employee: true,
      },
      orderBy: { date: "asc" },
    });

    if (date) {
      const targetDate = new Date(date).toISOString().split("T")[0];
      bookings = bookings.filter(
        (b) => b.date.toISOString().split("T")[0] === targetDate,
      );
    }

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Get Bookings Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createBooking = async (req, res) => {
  const { assetId, date, startTime, endTime, purpose } = req.body;
  const userId = req.user.id;
  const employeeId = req.user.employeeId;

  if (!assetId || !date || !startTime || !endTime) {
    return res
      .status(400)
      .json({ message: "Asset, Date, Start Time and End Time are required" });
  }

  if (!employeeId) {
    return res
      .status(400)
      .json({
        message: "User must be linked to an employee profile to book resources",
      });
  }

  if (startTime >= endTime) {
    return res
      .status(400)
      .json({ message: "Start Time must be before End Time" });
  }

  try {
    const targetAssetId = parseInt(assetId, 10);
    const bookingDate = new Date(date);

    const asset = await prisma.asset.findUnique({
      where: { id: targetAssetId },
      include: { category: true },
    });

    if (!asset) {
      return res.status(404).json({ message: "Resource asset not found" });
    }

    if (!asset.bookable && !asset.category.bookable) {
      return res
        .status(400)
        .json({ message: "This asset category is not configured as bookable" });
    }

    if (
      asset.status === "MAINTENANCE" ||
      asset.status === "RETIRED" ||
      asset.status === "DISPOSED"
    ) {
      return res
        .status(400)
        .json({
          message: `Resource is unavailable: status is ${asset.status.toLowerCase()}`,
        });
    }

    // Check overlap
    const isOverlapping = await hasOverlappingBooking(
      targetAssetId,
      bookingDate,
      startTime,
      endTime,
    );
    if (isOverlapping) {
      return res
        .status(409)
        .json({
          message:
            "Schedule Conflict: This resource is already booked during this time slot.",
        });
    }

    const booking = await prisma.resourceBooking.create({
      data: {
        assetId: targetAssetId,
        employeeId: employeeId,
        date: bookingDate,
        startTime,
        endTime,
        purpose,
        status: "APPROVED", // Automatically approve if no overlap
      },
      include: { asset: true },
    });

    await logActivity(
      userId,
      "CREATE_BOOKING",
      `Booked resource ${asset.name} on ${date} from ${startTime} to ${endTime}`,
      req,
    );
    return res.status(201).json(booking);
  } catch (error) {
    console.error("Create Booking Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateBooking = async (req, res) => {
  const { id } = req.params;
  const { startTime, endTime, purpose, status } = req.body;
  const userId = req.user.id;
  const employeeId = req.user.employeeId;

  try {
    const bookingId = parseInt(id, 10);
    const existing = await prisma.resourceBooking.findUnique({
      where: { id: bookingId },
      include: { asset: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Authorization check
    if (
      req.user.role !== "Admin" &&
      req.user.role !== "Asset Manager" &&
      existing.employeeId !== employeeId
    ) {
      return res
        .status(403)
        .json({ message: "You do not have permission to modify this booking" });
    }

    const nextStartTime = startTime || existing.startTime;
    const nextEndTime = endTime || existing.endTime;

    if (nextStartTime >= nextEndTime) {
      return res
        .status(400)
        .json({ message: "Start Time must be before End Time" });
    }

    // If time or status is changing back to approved/pending, check overlap
    if (
      (startTime || endTime || status === "APPROVED" || status === "PENDING") &&
      status !== "CANCELLED" &&
      status !== "REJECTED"
    ) {
      const isOverlapping = await hasOverlappingBooking(
        existing.assetId,
        existing.date,
        nextStartTime,
        nextEndTime,
        bookingId,
      );
      if (isOverlapping) {
        return res
          .status(409)
          .json({ message: "Schedule Conflict: Overlapping booking exists." });
      }
    }

    const updated = await prisma.resourceBooking.update({
      where: { id: bookingId },
      data: {
        startTime: nextStartTime,
        endTime: nextEndTime,
        purpose,
        status: status,
      },
    });

    await logActivity(
      userId,
      "UPDATE_BOOKING",
      `Updated booking status/time for resource ${existing.asset.name}`,
      req,
    );
    return res.status(200).json(updated);
  } catch (error) {
    console.error("Update Booking Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteBooking = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const employeeId = req.user.employeeId;

  try {
    const bookingId = parseInt(id, 10);
    const existing = await prisma.resourceBooking.findUnique({
      where: { id: bookingId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (req.user.role !== "Admin" && existing.employeeId !== employeeId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own bookings" });
    }

    await prisma.resourceBooking.delete({ where: { id: bookingId } });

    await logActivity(
      userId,
      "DELETE_BOOKING",
      `Deleted booking ID ${bookingId}`,
      req,
    );
    return res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Delete Booking Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
