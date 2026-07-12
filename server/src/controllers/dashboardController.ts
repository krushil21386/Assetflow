import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardSummary = async (req: Request, res: Response) => {
  const authReq = req as any;
  const { role, id: userId, employeeId, departmentId } = authReq.user;

  try {
    // 1. Fetch user notifications
    const notifications = await prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // 2. Global stats (useful across roles)
    const totalAssetsCount = await prisma.asset.count();
    const availableAssetsCount = await prisma.asset.count({ where: { status: 'AVAILABLE' } });
    const allocatedAssetsCount = await prisma.asset.count({ where: { status: 'ALLOCATED' } });
    const maintenanceCount = await prisma.asset.count({ where: { status: 'MAINTENANCE' } });

    // 3. Category distribution (useful for charts)
    const categoryDistribution = await prisma.asset.groupBy({
      by: ['categoryId'],
      _count: { id: true },
    });
    const categories = await prisma.assetCategory.findMany();
    const chartCategoryData = categoryDistribution.map(item => {
      const cat = categories.find(c => c.id === item.categoryId);
      return {
        name: cat ? cat.name : 'Unknown',
        value: item._count.id,
      };
    });

    // 4. Role-specific summaries
    if (role === 'Admin') {
      const activeEmployees = await prisma.employee.count({ where: { status: 'ACTIVE' } });
      const departmentsCount = await prisma.department.count({ where: { status: 'ACTIVE' } });
      const pendingTransfers = await prisma.assetTransfer.count({ where: { status: 'APPROVED_BY_HOD' } });
      
      const recentActivities = await prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { user: { include: { employee: true } } },
      });

      return res.status(200).json({
        role,
        notifications,
        summaryCards: {
          totalAssets: totalAssetsCount,
          activeEmployees,
          totalCategories: categories.length,
          totalDepartments: departmentsCount,
          pendingManagerApprovals: pendingTransfers,
          maintenanceAssets: maintenanceCount,
        },
        chartData: {
          categoryDistribution: chartCategoryData,
        },
        recentActivities,
      });
    }

    if (role === 'Asset Manager') {
      const pendingTransfers = await prisma.assetTransfer.count({ where: { status: 'APPROVED_BY_HOD' } });
      const activeMaintenance = await prisma.maintenanceRequest.count({
        where: { status: { in: ['PENDING', 'APPROVED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS'] } }
      });

      const upcomingReturns = await prisma.assetAllocation.findMany({
        where: {
          status: 'ACTIVE',
          expectedReturnDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
          }
        },
        include: { asset: true, employee: true }
      });

      const overdueReturns = await prisma.assetAllocation.findMany({
        where: {
          status: 'ACTIVE',
          expectedReturnDate: { lt: new Date() }
        },
        include: { asset: true, employee: true }
      });

      return res.status(200).json({
        role,
        notifications,
        summaryCards: {
          availableAssets: availableAssetsCount,
          allocatedAssets: allocatedAssetsCount,
          maintenanceCount,
          pendingManagerTransfers: pendingTransfers,
          activeMaintenanceCount: activeMaintenance,
          overdueReturnsCount: overdueReturns.length,
        },
        chartData: {
          categoryDistribution: chartCategoryData,
        },
        alerts: {
          upcomingReturns,
          overdueReturns,
        }
      });
    }

    if (role === 'Department Head') {
      if (!departmentId) {
        return res.status(200).json({ role, notifications, message: 'No department assigned to your profile.' });
      }

      // Department specific details
      const deptAssetsCount = await prisma.asset.count({ where: { departmentId } });
      
      // HOD needs to approve transfers from their department
      const pendingHODTransfers = await prisma.assetTransfer.count({
        where: {
          fromDepartmentId: departmentId,
          status: 'REQUESTED',
        }
      });

      const departmentBookingsToday = await prisma.resourceBooking.count({
        where: {
          asset: { departmentId },
          date: {
            gte: new Date(new Date().setHours(0,0,0,0)),
            lte: new Date(new Date().setHours(23,59,59,999)),
          }
        }
      });

      return res.status(200).json({
        role,
        notifications,
        summaryCards: {
          departmentAssets: deptAssetsCount,
          pendingHodApprovals: pendingHODTransfers,
          bookingsToday: departmentBookingsToday,
        },
        chartData: {
          categoryDistribution: chartCategoryData,
        }
      });
    }

    // Default: Employee Role
    if (!employeeId) {
      return res.status(200).json({ role, notifications, message: 'No employee record linked to your user account.' });
    }

    const myAllocatedAssets = await prisma.assetAllocation.findMany({
      where: { employeeId, status: 'ACTIVE' },
      include: { asset: { include: { category: true } } },
    });

    const myBookings = await prisma.resourceBooking.findMany({
      where: { employeeId },
      include: { asset: true },
      orderBy: { date: 'asc' },
      take: 5,
    });

    const myMaintenance = await prisma.maintenanceRequest.findMany({
      where: { requestedById: employeeId },
      include: { asset: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return res.status(200).json({
      role,
      notifications,
      summaryCards: {
        myAssetsCount: myAllocatedAssets.length,
        myBookingsCount: myBookings.length,
        myMaintenanceCount: myMaintenance.length,
      },
      myAssets: myAllocatedAssets,
      myBookings,
      myMaintenance,
    });

  } catch (error) {
    console.error('Get Dashboard Summary Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getReportsAssets = async (req: Request, res: Response) => {
  try {
    const assets = await prisma.asset.findMany({
      include: { category: true, department: true }
    });

    // 1. Status Breakdown
    const statusCounts: Record<string, number> = {};
    assets.forEach(a => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    });

    // 2. Category Breakdown
    const categoryCounts: Record<string, number> = {};
    const categoryValue: Record<string, number> = {};
    assets.forEach(a => {
      categoryCounts[a.category.name] = (categoryCounts[a.category.name] || 0) + 1;
      categoryValue[a.category.name] = (categoryValue[a.category.name] || 0) + a.purchaseCost;
    });

    // 3. Condition Breakdown
    const conditionCounts: Record<string, number> = {};
    assets.forEach(a => {
      conditionCounts[a.condition] = (conditionCounts[a.condition] || 0) + 1;
    });

    // 4. Calculate current values with straight-line depreciation
    const depreciatedAssets = assets.map(a => {
      const purchaseDate = new Date(a.purchaseDate);
      const diffMs = Date.now() - purchaseDate.getTime();
      const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
      
      const depYears = a.category.depreciationYears || 5;
      const annualDep = a.purchaseCost / depYears;
      let currentVal = a.purchaseCost - (annualDep * diffYears);
      if (currentVal < 0) currentVal = 0; // Asset has fully depreciated

      return {
        id: a.id,
        name: a.name,
        tag: a.assetTag,
        cost: a.purchaseCost,
        currentValue: Math.round(currentVal * 100) / 100,
        depreciatedAmount: Math.round((a.purchaseCost - currentVal) * 100) / 100,
      };
    });

    const totalPurchaseCost = assets.reduce((sum, a) => sum + a.purchaseCost, 0);
    const totalCurrentValue = depreciatedAssets.reduce((sum, a) => sum + a.currentValue, 0);

    return res.status(200).json({
      summary: {
        totalAssets: assets.length,
        totalCost: totalPurchaseCost,
        totalCurrentValue,
      },
      statusBreakdown: Object.keys(statusCounts).map(k => ({ name: k, count: statusCounts[k] })),
      categoryBreakdown: Object.keys(categoryCounts).map(k => ({ name: k, count: categoryCounts[k], value: categoryValue[k] })),
      conditionBreakdown: Object.keys(conditionCounts).map(k => ({ name: k, count: conditionCounts[k] })),
      depreciatedAssets,
    });
  } catch (error) {
    console.error('Asset Report Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getReportsMaintenance = async (req: Request, res: Response) => {
  try {
    const requests = await prisma.maintenanceRequest.findMany({
      include: { asset: true, requestedBy: true, assignedTo: true }
    });

    const totalCost = requests.reduce((sum, r) => sum + r.cost, 0);
    const statusCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = {};

    requests.forEach(r => {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
      priorityCounts[r.priority] = (priorityCounts[r.priority] || 0) + 1;
    });

    return res.status(200).json({
      summary: {
        totalTickets: requests.length,
        totalCost,
      },
      statusBreakdown: Object.keys(statusCounts).map(k => ({ name: k, count: statusCounts[k] })),
      priorityBreakdown: Object.keys(priorityCounts).map(k => ({ name: k, count: priorityCounts[k] })),
      tickets: requests,
    });
  } catch (error) {
    console.error('Maintenance Report Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getReportsBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.resourceBooking.findMany({
      include: { asset: { include: { category: true } }, employee: true }
    });

    const statusCounts: Record<string, number> = {};
    const assetUtilization: Record<string, number> = {};

    bookings.forEach(b => {
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
      assetUtilization[b.asset.name] = (assetUtilization[b.asset.name] || 0) + 1;
    });

    return res.status(200).json({
      summary: {
        totalBookings: bookings.length,
      },
      statusBreakdown: Object.keys(statusCounts).map(k => ({ name: k, count: statusCounts[k] })),
      utilizationBreakdown: Object.keys(assetUtilization).map(k => ({ name: k, count: assetUtilization[k] })),
      bookings,
    });
  } catch (error) {
    console.error('Booking Report Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Get Notifications Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  try {
    const notifId = parseInt(id, 10);
    const updated = await prisma.notification.update({
      where: { id: notifId, userId },
      data: { isRead: true },
    });
    return res.status(200).json(updated);
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getActivityLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.activityLog.findMany({
      include: {
        user: {
          include: { employee: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return res.status(200).json(logs);
  } catch (error) {
    console.error('Get Logs Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
