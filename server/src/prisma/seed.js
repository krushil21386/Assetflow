import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with updated credentials...");

  // 1. Seed Roles
  const roles = ["Admin", "Asset Manager", "Department Head", "Employee"];
  const roleMap = {};

  for (const roleName of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    roleMap[roleName] = role;
  }

  // 2. Seed Departments
  const depts = [
    { name: "Executive", description: "Executive Management" },
    { name: "Engineering", description: "Product Development & Engineering" },
    { name: "Operations", description: "Operations and Logistics" },
    { name: "Finance", description: "Accounting and Finance" },
    { name: "Human Resources", description: "People Operations" },
  ];
  const deptMap = {};

  for (const d of depts) {
    const dept = await prisma.department.upsert({
      where: { name: d.name },
      update: {},
      create: {
        name: d.name,
        description: d.description,
        status: "ACTIVE",
      },
    });
    deptMap[d.name] = dept;
  }

  // 3. Seed Categories
  const categories = [
    {
      name: "Laptops",
      description: "Company laptops and notebooks",
      warrantyPeriod: 36,
      depreciationYears: 3,
      bookable: false,
    },
    {
      name: "Monitors",
      description: "External display screens",
      warrantyPeriod: 24,
      depreciationYears: 5,
      bookable: false,
    },
    {
      name: "Chairs",
      description: "Ergonomic office seating",
      warrantyPeriod: 12,
      depreciationYears: 7,
      bookable: false,
    },
    {
      name: "Vehicles",
      description: "Company vehicles",
      warrantyPeriod: 60,
      depreciationYears: 8,
      bookable: true,
    },
    {
      name: "Printers",
      description: "Network printing machines",
      warrantyPeriod: 12,
      depreciationYears: 5,
      bookable: false,
    },
    {
      name: "Projectors",
      description: "Meeting room projectors",
      warrantyPeriod: 24,
      depreciationYears: 4,
      bookable: true,
    },
    {
      name: "Meeting Rooms",
      description: "Shared physical meeting spaces",
      warrantyPeriod: 0,
      depreciationYears: 0,
      bookable: true,
    },
  ];
  const catMap = {};

  for (const cat of categories) {
    const category = await prisma.assetCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name,
        description: cat.description,
        warrantyPeriod: cat.warrantyPeriod,
        depreciationYears: cat.depreciationYears,
        bookable: cat.bookable,
        status: "ACTIVE",
      },
    });
    catMap[cat.name] = category;
  }

  // 4. Seed default Users & Employees
  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  const usersToSeed = [
    {
      email: "admin@assetpilot.local",
      name: "Administrator",
      role: "Admin",
      code: "EMP001",
      dept: "Executive",
      des: "IT Administrator",
    },
    {
      email: "manager@assetpilot.local",
      name: "Asset Manager",
      role: "Asset Manager",
      code: "EMP002",
      dept: "Operations",
      des: "Inventory Supervisor",
    },
    {
      email: "depthead@assetpilot.local",
      name: "Department Head",
      role: "Department Head",
      code: "EMP003",
      dept: "Engineering",
      des: "Engineering Director",
    },
    {
      email: "employee@assetpilot.local",
      name: "Test Employee",
      role: "Employee",
      code: "EMP004",
      dept: "Engineering",
      des: "Software Engineer",
    },
  ];

  for (const u of usersToSeed) {
    // Delete existing if email matches to overwrite cleanly
    const existing = await prisma.user.findUnique({
      where: { email: u.email },
    });
    if (existing) {
      await prisma.user.delete({ where: { email: u.email } });
    }

    const user = await prisma.user.create({
      data: {
        email: u.email,
        password: hashedPassword,
        roleId: roleMap[u.role].id,
      },
    });

    const emp = await prisma.employee.create({
      data: {
        employeeCode: u.code,
        name: u.name,
        email: u.email,
        phone: "1234567890",
        designation: u.des,
        joiningDate: new Date(),
        status: "ACTIVE",
        userId: user.id,
        departmentId: deptMap[u.dept].id,
      },
    });

    if (u.role === "Department Head") {
      await prisma.department.update({
        where: { id: deptMap[u.dept].id },
        data: { headId: emp.id },
      });
    } else if (u.role === "Admin") {
      await prisma.department.update({
        where: { id: deptMap[u.dept].id },
        data: { headId: emp.id },
      });
    }

    console.log(`Seeded account: ${u.email} (${u.role})`);
  }

  // 5. Seed Available Assets
  const assetsToSeed = [
    {
      assetTag: "AST-L01",
      name: "MacBook Pro 16",
      brand: "Apple",
      model: "M3 Pro",
      serialNumber: "SN-MBP16-M3",
      purchaseDate: new Date("2026-01-10"),
      purchaseCost: 2499.0,
      vendor: "Apple Authorized Reseller",
      location: "Main Office - Cabinet A",
      condition: "NEW",
      bookable: false,
      status: "AVAILABLE",
      categoryName: "Laptops",
    },
    {
      assetTag: "AST-M01",
      name: "UltraWide Curved Monitor 38",
      brand: "Dell",
      model: "U3821DW",
      serialNumber: "SN-DELL-38W",
      purchaseDate: new Date("2026-02-15"),
      purchaseCost: 899.0,
      vendor: "Dell Enterprise Store",
      location: "Engineering Desk Room 3",
      condition: "GOOD",
      bookable: false,
      status: "AVAILABLE",
      categoryName: "Monitors",
    },
    {
      assetTag: "AST-P01",
      name: "Epson Wireless Projector",
      brand: "Epson",
      model: "EX-9220",
      serialNumber: "SN-EPSON-PROJ",
      purchaseDate: new Date("2026-03-01"),
      purchaseCost: 650.0,
      vendor: "BestBuy Business",
      location: "Conference Room 1",
      condition: "GOOD",
      bookable: true,
      status: "AVAILABLE",
      categoryName: "Projectors",
    },
  ];

  for (const a of assetsToSeed) {
    const existingAsset = await prisma.asset.findUnique({
      where: { assetTag: a.assetTag },
    });
    if (existingAsset) {
      await prisma.asset.delete({ where: { assetTag: a.assetTag } });
    }

    await prisma.asset.create({
      data: {
        assetTag: a.assetTag,
        name: a.name,
        brand: a.brand,
        model: a.model,
        serialNumber: a.serialNumber,
        purchaseDate: a.purchaseDate,
        purchaseCost: a.purchaseCost,
        vendor: a.vendor,
        location: a.location,
        condition: a.condition,
        bookable: a.bookable,
        status: a.status,
        categoryId: catMap[a.categoryName].id,
      },
    });
    console.log(`Seeded Asset: ${a.name} [${a.assetTag}]`);
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
