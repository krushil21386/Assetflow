import { Request, Response } from 'express';
import { PrismaClient, AuditStatus, AuditVerificationStatus, AssetStatus } from '@prisma/client';
import { logActivity } from '../utils/logger';

const prisma = new PrismaClient();

export const getAudits = async (req: Request, res: Response) => {
  try {
    const cycles = await prisma.auditCycle.findMany({
      include: {
        auditor: true,
        _count: {
          select: { details: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(cycles);
  } catch (error) {
    console.error('Get Audits Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getAuditById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const cycleId = parseInt(id, 10);
    const cycle = await prisma.auditCycle.findUnique({
      where: { id: cycleId },
      include: {
        auditor: true,
        details: {
          include: {
            asset: {
              include: { category: true, department: true }
            }
          }
        }
      },
    });

    if (!cycle) {
      return res.status(404).json({ message: 'Audit Cycle not found' });
    }

    return res.status(200).json(cycle);
  } catch (error) {
    console.error('Get Audit Detail Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const createAuditCycle = async (req: Request, res: Response) => {
  const { name, startDate, endDate, auditorId, departmentId } = req.body;
  const userId = (req as any).user.id;

  if (!name || !startDate || !endDate || !auditorId) {
    return res.status(400).json({ message: 'Name, Start Date, End Date, and Auditor ID are required' });
  }

  try {
    const auditAuditorId = parseInt(auditorId, 10);
    
    // Check auditor exists
    const auditor = await prisma.employee.findUnique({ where: { id: auditAuditorId } });
    if (!auditor) {
      return res.status(400).json({ message: 'Selected auditor employee profile does not exist' });
    }

    // Run transaction: create cycle and populate detail records
    const cycle = await prisma.$transaction(async (tx) => {
      // 1. Create Cycle
      const cy = await tx.auditCycle.create({
        data: {
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: 'DRAFT',
          auditorId: auditAuditorId,
        },
      });

      // 2. Fetch assets to audit (optionally filtered by department)
      const assetFilters: any = {};
      if (departmentId) {
        assetFilters.departmentId = parseInt(departmentId as string, 10);
      }
      
      const assetsToAudit = await tx.asset.findMany({
        where: {
          ...assetFilters,
          status: { notIn: ['RETIRED', 'DISPOSED'] } // Don't audit retired/disposed assets
        }
      });

      // 3. Create Audit Details
      if (assetsToAudit.length > 0) {
        await tx.auditDetail.createMany({
          data: assetsToAudit.map(asset => ({
            auditCycleId: cy.id,
            assetId: asset.id,
            verificationStatus: 'PENDING',
          }))
        });
      }

      return cy;
    });

    await logActivity(userId, 'CREATE_AUDIT_CYCLE', `Created audit cycle ${name}`, req);
    return res.status(201).json(cycle);
  } catch (error) {
    console.error('Create Audit Cycle Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateAuditCycleStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = (req as any).user.id;

  try {
    const cycleId = parseInt(id, 10);
    const existing = await prisma.auditCycle.findUnique({ where: { id: cycleId } });
    if (!existing) {
      return res.status(404).json({ message: 'Audit Cycle not found' });
    }

    const updated = await prisma.auditCycle.update({
      where: { id: cycleId },
      data: { status: status as AuditStatus },
    });

    await logActivity(userId, 'UPDATE_AUDIT_CYCLE_STATUS', `Updated audit cycle ${existing.name} status to ${status}`, req);
    return res.status(200).json(updated);
  } catch (error) {
    console.error('Update Audit Status Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const verifyAssetInAudit = async (req: Request, res: Response) => {
  const { id } = req.params; // AuditCycle ID
  const { assetId, verificationStatus, notes } = req.body;
  const userId = (req as any).user.id;

  if (!assetId || !verificationStatus) {
    return res.status(400).json({ message: 'Asset ID and Verification Status are required' });
  }

  try {
    const cycleId = parseInt(id, 10);
    const targetAssetId = parseInt(assetId, 10);

    const auditDetail = await prisma.auditDetail.findFirst({
      where: {
        auditCycleId: cycleId,
        assetId: targetAssetId,
      },
    });

    if (!auditDetail) {
      return res.status(404).json({ message: 'Asset is not registered under this audit cycle' });
    }

    // Run transaction: update detail and sync asset status
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update audit detail
      const detail = await tx.auditDetail.update({
        where: { id: auditDetail.id },
        data: {
          verificationStatus: verificationStatus as AuditVerificationStatus,
          notes,
          verifiedAt: new Date(),
        },
        include: { asset: true },
      });

      // 2. Adjust Asset status/condition based on audit outcome
      let assetStatusUpdate: AssetStatus | undefined;
      let conditionUpdate: string | undefined;

      if (verificationStatus === 'MISSING') {
        assetStatusUpdate = 'LOST';
      } else if (verificationStatus === 'DAMAGED') {
        assetStatusUpdate = 'MAINTENANCE';
        conditionUpdate = 'DAMAGED';
      } else if (verificationStatus === 'DISPOSED') {
        assetStatusUpdate = 'DISPOSED';
      } else if (verificationStatus === 'VERIFIED') {
        // If it was lost/maintenance, maybe restore it to AVAILABLE or keep its status
        if (detail.asset.status === 'LOST') {
          assetStatusUpdate = 'AVAILABLE';
        }
        conditionUpdate = 'GOOD';
      }

      if (assetStatusUpdate || conditionUpdate) {
        await tx.asset.update({
          where: { id: targetAssetId },
          data: {
            status: assetStatusUpdate,
            condition: conditionUpdate,
          },
        });
      }

      return detail;
    });

    await logActivity(userId, 'VERIFY_AUDIT_ASSET', `Verified asset ${result.asset.name} in audit as ${verificationStatus}`, req);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Verify Audit Asset Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
