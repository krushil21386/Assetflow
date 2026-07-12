# 🏢 AssetFlow – Enterprise Asset Management System

**AssetFlow** is a modern, full-stack **Enterprise Resource Planning (ERP)** solution designed to streamline asset lifecycle management, departmental coordination, and organizational auditing. Built with cutting-edge technologies, it provides real-time asset tracking, role-based access control, and comprehensive reporting capabilities for enterprises of all sizes.

---

## ✨ Key Features

- **🔄 Real-Time Asset Tracking**  
  Live updates powered by Socket.io for instant visibility across departments and teams.

- **👥 Multi-Role User Management**  
  Admin, Asset Manager, Department Head, and Employee roles with granular permission controls.

- **📤 Asset Lifecycle Management**  
  Track asset allocation, returns, transfers, maintenance, and depreciation seamlessly.

- **🔐 Role-Based Access Control (RBAC)**  
  Protected dashboard views and API endpoints with fine-grained authorization.

- **🏢 Department & Employee Management**  
  Hierarchical department structures, employee profiles, and role assignments.

- **🛠️ Maintenance & Audit Logging**  
  Comprehensive maintenance request tracking, audit cycles, and activity logs for compliance.

- **📈 Intelligent Reporting**  
  Dashboard summaries, asset reports, maintenance analytics, and booking insights.

- **🔔 Real-Time Notifications**  
  Instant alerts for asset transfers, maintenance requests, audit cycles, and system events.

- **📸 Asset Documentation**  
  Multi-image asset uploads, condition tracking, and historical documentation.

- **📅 Resource Booking System**  
  Reserve and manage bookable assets with time-slot scheduling.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS, React Router, Zod, React Hook Form, Socket.io Client, Axios, Recharts, Phosphor React Icons |
| **Backend** | Node.js, Express.js, Socket.io, Prisma ORM, SQLite, JWT Auth, Bcrypt, Multer, Nodemailer, Zod Validation |
| **Database** | SQLite with Prisma Schema Management |
| **Build Tools** | Vite, TypeScript, ESM Modules |
| **Development** | Concurrently, Node Watch, CORS, PostCSS, Autoprefixer |

---

## 📁 Project Structure

```
assetflow-react-workspace/
├── root package.json                    # Workspace configuration & scripts
├── client/                              # Frontend React + TypeScript + Vite
│   ├── src/
│   │   ├── components/                  # Reusable UI components
│   │   ├── pages/                       # Route pages (Dashboard, Assets, etc.)
│   │   │   ├── Auth/                    # Login, Signup
│   │   │   ├── Dashboard/               # Main dashboard
│   │   │   ├── Departments/             # Department management
│   │   │   ├── Categories/              # Asset category management
│   │   │   ├── Employees/               # Employee management
│   │   │   ├── Assets/                  # Asset management
│   │   │   ├── Allocation/              # Asset allocation & transfers
│   │   │   ├── Booking/                 # Resource bookings
│   │   │   ├── Maintenance/             # Maintenance requests
│   │   │   ├── Audit/                   # Audit cycles
│   │   │   ├── Reports/                 # Reporting dashboard
│   │   │   ├── Logs/                    # Activity logs
│   │   │   └── Settings/                # User settings
│   │   ├── layouts/                     # Dashboard layout wrapper
│   │   ├── context/                     # React Context (Auth, Socket)
│   │   ├── services/                    # API calls & HTTP client
│   │   ├── types/                       # TypeScript interfaces
│   │   ├── styles/                      # Global styles & TailwindCSS
│   │   ├── App.jsx                      # Main app with routing
│   │   └── main.jsx                     # React entry point
│   ├── index.html
│   ├── vite.config.js                   # Vite configuration
│   ├── tailwind.config.js               # TailwindCSS theme
│   ├── tsconfig.json                    # TypeScript config
│   └── package.json
│
├── server/                              # Backend Express + Node.js + Prisma
│   ├── src/
│   │   ├── controllers/                 # Route handlers
│   │   │   ├── authController.js        # Login, Signup, JWT
│   │   │   ├── assetController.js       # Asset CRUD
│   │   │   ├── deptController.js        # Department management
│   │   │   ├── employeeController.js    # Employee management
│   │   │   ├── categoryController.js    # Category management
│   │   │   ├── allocationController.js  # Asset allocation & transfers
│   │   │   ├── bookingController.js     # Resource bookings
│   │   │   ├── maintenanceController.js # Maintenance requests
│   │   │   ├── auditController.js       # Audit cycles
│   │   │   └── dashboardController.js   # Dashboard & reports
│   │   ├── middleware/                  # Express middleware
│   │   │   ├── authMiddleware.js        # JWT & role authorization
│   │   │   └── uploadMiddleware.js      # Multer file uploads
│   │   ├── routes/
│   │   │   └── api.js                   # Main API router with endpoints
│   │   ├── utils/
│   │   │   ├── socket.js                # Socket.io initialization
│   │   │   └── email.js                 # Email notifications
│   │   ├── prisma/
│   │   │   ├── schema.prisma            # Database schema
│   │   │   └── seed.js                  # Database seeding
│   │   ├── app.js                       # Express app setup
│   │   └── server.js                    # Server entry point with Socket.io
│   ├── uploads/                         # Static file uploads (assets, profiles)
│   ├── .env                             # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
└── package.json                         # Root workspace package
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18.x or higher) – [Download](https://nodejs.org/)
- **npm** (v9.x or higher) – Comes with Node.js
- **Git** – [Download](https://git-scm.com/)
- **SQLite** (bundled with Prisma) – No separate installation needed

Verify installation:
```bash
node --version
npm --version
git --version
```

---

## 🚀 Installation & Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/krushil21386/Assetflow.git
cd Assetflow
```

### 2️⃣ Install Root Dependencies

```bash
npm install --legacy-peer-deps
```

> ⚠️ **Note:** The `--legacy-peer-deps` flag is used to resolve peer dependency conflicts in the React ecosystem. This is expected and safe for development.

### 3️⃣ Install Workspace-Specific Dependencies

Navigate to and install client dependencies:
```bash
cd client
npm install --legacy-peer-deps
cd ..
```

Navigate to and install server dependencies:
```bash
cd server
npm install
cd ..
```

Alternatively, use the convenience script from root:
```bash
npm run install:all
```

### 4️⃣ Configure Environment Variables

#### Backend Configuration (`server/.env`)

Create a `.env` file in the `server/` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database (SQLite)
DATABASE_URL="file:./dev.db"

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Email Service (Optional – for password reset & notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# CORS Configuration (for local testing)
CORS_ORIGIN=http://localhost:5173
```

#### Frontend Configuration (`client/.env`)

Create a `.env` file in the `client/` directory (if needed):

```env
# API Base URL (ensure this matches your backend PORT)
VITE_API_URL=http://localhost:5000/api
```

> 💡 The frontend uses hardcoded `http://localhost:5000/api` in `src/services/api.ts` by default. Update this if your backend runs on a different port.

### 5️⃣ Initialize the Database

From the `server/` directory, generate Prisma client and push the schema:

```bash
cd server
npm run prisma:generate
npm run prisma:push
npm run prisma:seed  # (Optional) Seed initial data
cd ..
```

---

## ▶️ Running the Application

### Development Mode (Recommended)

Run both frontend and backend concurrently from the root directory:

```bash
npm run dev
```

This will start:
- **Frontend:** http://localhost:5173 (Vite dev server)
- **Backend:** http://localhost:5000 (Express server)
- **Socket.io:** Ready for real-time updates

### Individual Startup

If you prefer to run services separately:

**Terminal 1 – Backend:**
```bash
npm run dev:server
```

**Terminal 2 – Frontend:**
```bash
npm run dev:client
```

### Port Conflicts?

If port 5000 or 5173 is already in use, override them:

```bash
# Backend on custom port
PORT=5002 npm run dev:server

# Frontend uses Vite's default behavior
# Vite will automatically increment the port if 5173 is unavailable
npm run dev:client
```

### Health Check

Once running, verify the backend is healthy:

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:45.123Z"
}
```

---

## 🔌 API Endpoints (Brief Overview)

All endpoints are prefixed with `/api` and require JWT authentication (except login/signup).

### 🔐 **Authentication Routes** (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/login` | User login with email & password |
| `POST` | `/signup` | Create new employee account |
| `POST` | `/forgot-password` | Initiate password reset |
| `POST` | `/logout` | Logout user |

### 👤 **User Routes** (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/me` | Get current user profile |
| `PUT` | `/me` | Update user profile & photo |
| `GET` | `/notifications` | Fetch user notifications |
| `PUT` | `/notifications/:id/read` | Mark notification as read |

### 📊 **Dashboard & Reports** (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboard/summary` | Dashboard KPIs & statistics |
| `GET` | `/assets` | List all assets |
| `GET` | `/assets/:id` | Get asset details |
| `GET` | `/maintenance` | List maintenance requests |
| `GET` | `/booking` | List resource bookings |

### 🏢 **Department Management** (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/departments` | List all departments |
| `POST` | `/departments` | Create department |
| `PUT` | `/departments/:id` | Update department |
| `DELETE` | `/departments/:id` | Delete department |

### 👥 **Employee Management** (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/employees` | List all employees |
| `POST` | `/employees` | Create employee |
| `PUT` | `/employees/:id` | Update employee |

### 🏷️ **Asset Categories** (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/categories` | List all categories |
| `POST` | `/categories` | Create category |
| `PUT` | `/categories/:id` | Update category |
| `DELETE` | `/categories/:id` | Delete category |

### 📦 **Asset Management** (Asset Manager / Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/assets` | Create asset with images |
| `PUT` | `/assets/:id` | Update asset |
| `DELETE` | `/assets/:id` | Delete asset |

### 🔄 **Asset Allocation & Transfers** (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/transfer` | Request asset transfer |
| `PUT` | `/transfer/:id/approve-hod` | HOD approves transfer |
| `PUT` | `/transfer/:id/reject` | Reject transfer request |
| `GET` | `/transfer/history` | View allocation history |

### 📅 **Resource Booking** (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/booking` | Create booking for asset |
| `PUT` | `/booking/:id` | Update booking |
| `DELETE` | `/booking/:id` | Cancel booking |

### 🛠️ **Maintenance Requests** (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/maintenance` | Create maintenance request |
| `PUT` | `/maintenance/:id` | Update request status |

### 🔍 **Audit Management** (Admin / Auditor)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/audits` | Create audit cycle |
| `GET` | `/audits` | List audit cycles |
| `PUT` | `/audits/:id/verify` | Verify asset in audit |

---

## 🔐 Role-Based Access Control (RBAC)

AssetFlow implements a four-tier role hierarchy with granular access controls:

### 1️⃣ **Admin**
- **Dashboard Access:** Full access to all dashboards and reports
- **Protected Routes:**
  - `/departments` – Create, view, update, delete departments
  - `/categories` – Manage asset categories
  - `/employees` – Manage employees and assign roles
  - `/assets` – Full asset management
  - `/audits` – Create and manage audit cycles
- **API Access:** All authenticated endpoints, especially admin-only operations

### 2️⃣ **Asset Manager**
- **Dashboard Access:** Asset management & inventory dashboards
- **Protected Routes:**
  - `/assets` – Create, view, update assets (shared with Admin)
  - Asset transfer approvals
- **API Access:** Asset CRUD operations, transfer management

### 3️⃣ **Department Head (HOD)**
- **Dashboard Access:** Department-specific dashboard & reports
- **Protected Routes:**
  - `/transfers` – Approve/reject asset transfers for their department
  - `/maintenance` – View maintenance requests
- **API Access:** Transfer approvals, department asset views

### 4️⃣ **Employee**
- **Dashboard Access:** Personal dashboard (My Assets, My Bookings)
- **Protected Routes:**
  - `/assets` – View all assets (read-only)
  - `/transfers` – Request asset transfers
  - `/bookings` – Create and view personal bookings
  - `/maintenance` – Create maintenance requests
- **API Access:** View assets, request transfers, create bookings/maintenance

### Access Control Implementation

The frontend enforces role-based access using the `ProtectedRoute` component in `App.jsx`:

```jsx
<Route
  path="/departments"
  element={
    <ProtectedRoute allowedRoles={["Admin"]}>
      <DashboardLayout>
        <Departments />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>
```

The backend enforces roles via JWT middleware in `authMiddleware.js`:

```javascript
router.post("/assets", managerOrAdmin, upload.array("images", 5), createAsset);
```

---

## 📦 Building for Production

### Build Client

```bash
npm run build:client
```

Output files will be in `client/dist/`.

### Build & Deploy Backend

The backend is a Node.js application. Deploy to any Node.js hosting (Heroku, DigitalOcean, AWS, etc.):

```bash
# From server directory
npm run start
```

---

## 🧪 Database Schema Highlights

- **Users & Roles:** Multi-role user management with JWT authentication
- **Departments & Employees:** Hierarchical organization structure
- **Assets:** Comprehensive asset tracking with images, conditions, and lifecycle states
- **Allocations & Transfers:** Asset movement tracking with approval workflows
- **Maintenance:** Full maintenance request lifecycle with history
- **Audits:** Audit cycles with asset verification tracking
- **Notifications & Logs:** Real-time alerts and activity audit trail

For detailed schema, see `server/src/prisma/schema.prisma`.

---

## 🔄 Real-Time Features (Socket.io)

AssetFlow uses **Socket.io** for live updates:

- Asset allocation/return events
- Transfer request approvals
- Maintenance status changes
- Audit verification updates
- Notification broadcasts

The Socket.io connection initializes automatically when the frontend loads.

---

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (macOS/Linux)
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5002 npm run dev:server
```

### Peer Dependency Warnings
Use `--legacy-peer-deps` when installing client dependencies:
```bash
cd client && npm install --legacy-peer-deps
```

### Database Issues
Reset and reinitialize the database:
```bash
cd server
rm dev.db  # Delete existing database
npm run prisma:push  # Recreate schema
npm run prisma:seed  # Seed data (optional)
```

### CORS Errors
Ensure `CORS_ORIGIN` in `server/.env` matches your frontend URL. For local development:
```env
CORS_ORIGIN=http://localhost:5173
```

---

## 📝 License

This project is provided as-is for enterprise asset management. Check the repository for licensing details.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your improvements.

---

## 📧 Support

For issues, questions, or feature requests, please open a GitHub issue or contact the development team.

---

**Built with ❤️ for modern enterprise asset management.**
