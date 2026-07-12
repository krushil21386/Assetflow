import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { logActivity } from '../utils/logger';

const prisma = new PrismaClient();

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        department: true,
        user: {
          include: { role: true }
        },
        _count: {
          select: { allocations: true, bookings: true, maintenanceReqs: true }
        }
      },
    });
    return res.status(200).json(employees);
  } catch (error) {
    console.error('Get Employees Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  const { name, email, phone, departmentId, designation, joiningDate, createAccount, role } = req.body;
  const adminUserId = (req as any).user.id;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and Email are required' });
  }

  try {
    const existing = await prisma.employee.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }

    // Auto-generate employee code
    const lastEmployee = await prisma.employee.findFirst({
      orderBy: { employeeCode: 'desc' },
    });
    
    let newCode = 'EMP001';
    if (lastEmployee && lastEmployee.employeeCode.startsWith('EMP')) {
      const lastNum = parseInt(lastEmployee.employeeCode.replace('EMP', ''), 10);
      newCode = `EMP${String(lastNum + 1).padStart(3, '0')}`;
    }

    let userId: number | null = null;

    if (createAccount === true || createAccount === 'true') {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const defaultPassword = await bcrypt.hash('Employee@123', 10);
        const roleName = role || 'Employee';
        const userRole = await prisma.role.findUnique({ where: { name: roleName } });
        if (!userRole) {
          return res.status(400).json({ message: `Role ${roleName} does not exist` });
        }

        const newUser = await prisma.user.create({
          data: {
            email,
            password: defaultPassword,
            roleId: userRole.id,
          },
        });
        userId = newUser.id;
      }
    }

    const employee = await prisma.employee.create({
      data: {
        employeeCode: newCode,
        name,
        email,
        phone,
        departmentId: departmentId ? parseInt(departmentId, 10) : null,
        designation,
        joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
        status: 'ACTIVE',
        userId,
      },
      include: {
        department: true,
        user: { include: { role: true } }
      }
    });

    await logActivity(adminUserId, 'CREATE_EMPLOYEE', `Created employee ${name} with code ${newCode}`, req);
    return res.status(201).json(employee);
  } catch (error) {
    console.error('Create Employee Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, departmentId, designation, joiningDate, status, role } = req.body;
  const adminUserId = (req as any).user.id;

  try {
    const empId = parseInt(id, 10);
    const existing = await prisma.employee.findUnique({
      where: { id: empId },
      include: { user: true },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (email && email !== existing.email) {
      const duplicate = await prisma.employee.findUnique({ where: { email } });
      if (duplicate) {
        return res.status(400).json({ message: 'Email already in use by another employee' });
      }
    }

    // Update User Role if employee has a user account
    if (role && existing.userId) {
      const userRole = await prisma.role.findUnique({ where: { name: role } });
      if (userRole) {
        await prisma.user.update({
          where: { id: existing.userId },
          data: { roleId: userRole.id },
        });
        await logActivity(adminUserId, 'PROMOTE_USER', `Promoted employee ${existing.name} to role ${role}`, req);
      }
    }

    const updated = await prisma.employee.update({
      where: { id: empId },
      data: {
        name,
        email,
        phone,
        departmentId: departmentId !== undefined ? (departmentId ? parseInt(departmentId, 10) : null) : undefined,
        designation,
        joiningDate: joiningDate ? new Date(joiningDate) : undefined,
        status,
      },
      include: {
        department: true,
        user: { include: { role: true } }
      }
    });

    // Also update email in user table if linked
    if (email && existing.userId && email !== existing.email) {
      await prisma.user.update({
        where: { id: existing.userId },
        data: { email },
      });
    }

    await logActivity(adminUserId, 'UPDATE_EMPLOYEE', `Updated employee profile of ${updated.name}`, req);
    return res.status(200).json(updated);
  } catch (error) {
    console.error('Update Employee Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
