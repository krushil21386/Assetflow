# NexAsset ERP

NexAsset is a centralized, web-based ERP application designed to manage physical assets, track asset lifecycles, assign resources, handle maintenance schedules, verify inter-departmental transfers, and conduct audits.

## Technology Stack

- **Frontend**: React (Vite) + TypeScript + Tailwind CSS + Recharts + Axios + React Hook Form
- **Backend**: Node.js + Express + TypeScript + Prisma ORM + Multer (image uploads) + JWT
- **Database**: MySQL 8.x
- **Storage**: Local filesystem upload folder mapping

---

## Getting Started

### Prerequisites
- Node.js (v18.x or higher)
- MySQL 8.x running locally

### 1. Database Setup
Ensure MySQL is running on `localhost:3306`. If you need to verify or configure credentials, look at the backend environment file.

### 2. Run the Express Backend API
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Configure `.env` if your local MySQL root password differs:
   ```env
   DATABASE_URL="mysql://root:Acpc%402025@localhost:3306/assetflow_db"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Push database tables and generate the Prisma client:
   ```bash
   npx prisma db push --schema=src/prisma/schema.prisma
   ```
5. Seed initial data (roles, departments, categories, and test user profiles):
   ```bash
   npx prisma db seed
   ```
6. Start the API server:
   ```bash
   npm run dev
   ```
   *The server runs by default on port `5000`.*

### 3. Run the Vite Client
1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The client opens by default on `http://localhost:5173`.*

---

## Test Accounts

All accounts share the password: **`Admin@123`**

| Role | Username | Focus |
|---|---|---|
| **Admin** | `admin@assetpilot.local` | Full department, category, and employee directory CRUD. Promote user permissions, view logs. |
| **Asset Manager** | `manager@assetpilot.local` | Register assets (upload photos), checkout allocations, return logistics, start audits. |
| **Department Head** | `depthead@assetpilot.local` | View department assets, approve department transfer requests, reserve resources. |
| **Employee** | `employee@assetpilot.local` | Check assigned assets, report equipment faults (maintenance), request resource bookings. |
