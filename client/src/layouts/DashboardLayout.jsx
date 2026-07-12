import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.filter((n) => !n.isRead));
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return null;

  // Material Symbols Mapped to Routes
  const navItems = [
    { name: "Dashboard", path: "/", icon: "dashboard", roles: ["Admin", "Asset Manager", "Department Head", "Employee"] },
    { name: "Asset Directory", path: "/assets", icon: "inventory_2", roles: ["Admin", "Asset Manager", "Department Head", "Employee"] },
    { name: "Resource Allocation", path: "/transfers", icon: "hub", roles: ["Admin", "Asset Manager", "Department Head", "Employee"] },
    { name: "Bookings", path: "/bookings", icon: "event_available", roles: ["Admin", "Asset Manager", "Department Head", "Employee"] },
    { name: "Maintenance", path: "/maintenance", icon: "build", roles: ["Admin", "Asset Manager", "Department Head", "Employee"] },
    { name: "Audit", path: "/audits", icon: "fact_check", roles: ["Admin", "Asset Manager"] },
    { name: "Reports", path: "/reports", icon: "analytics", roles: ["Admin", "Asset Manager"] },
    { name: "Departments", path: "/departments", icon: "domain", roles: ["Admin"] },
    { name: "Categories", path: "/categories", icon: "category", roles: ["Admin"] },
    { name: "Employees", path: "/employees", icon: "group", roles: ["Admin"] },
    { name: "Activity Logs", path: "/logs", icon: "history", roles: ["Admin"] },
  ].filter((item) => item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex bg-[#f7f9fb] min-h-screen font-body-md text-on-surface">
      {/* SideNavBar - Stitch Material Design 3 */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest flex flex-col py-md border-r border-outline-variant z-30 shadow-sm">
        <div className="px-md mb-xl flex items-center gap-2 mt-2">
          <div className="w-8 h-8 bg-primary flex items-center justify-center rounded text-surface-container-lowest shadow-md">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
          </div>
          <div>
            <h1 className="font-headline-sm text-headline-sm font-extrabold text-primary tracking-tight leading-none">AssetFlow</h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant opacity-80 uppercase tracking-widest mt-1 text-[8px]">Enterprise Resource</p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-md py-sm font-label-md text-label-md transition-all duration-200 ${
                  isActive 
                    ? "bg-primary text-white border-l-4 border-secondary shadow-sm" 
                    : "text-on-surface-variant hover:bg-surface-container-high border-l-4 border-transparent"
                }`}
              >
                <span className={`material-symbols-outlined mr-md ${isActive ? 'text-secondary-fixed' : ''}`} style={isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto px-md space-y-1 pt-md border-t border-outline-variant">
          <Link to="#" className="flex items-center px-md py-sm text-on-surface-variant hover:bg-surface-container-high font-label-md text-label-md transition-colors rounded">
            <span className="material-symbols-outlined mr-md">settings</span> Settings
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center px-md py-sm text-error hover:bg-error/10 font-label-md text-label-md transition-colors rounded">
            <span className="material-symbols-outlined mr-md">logout</span> Logout
          </button>
          <div className="px-md py-3 mt-sm bg-surface-container-low rounded-lg border border-outline-variant">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">System Status</p>
            <p className="font-label-md text-label-md text-on-tertiary-container mt-1 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse"></span> Healthy
            </p>
          </div>
        </div>
      </aside>

      {/* TopNavBar - Stitch Material Design 3 */}
      <header className="fixed top-0 left-64 right-0 bg-surface-container-lowest/80 backdrop-blur-md z-20 border-b border-outline-variant shadow-sm flex justify-between items-center px-lg py-sm h-[64px]">
        <div className="flex items-center flex-1 max-w-xl">
          <div className="relative w-full input-focus-effect rounded-lg">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              type="text" 
              placeholder="Search assets, serials, or locations..." 
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-md">
          <button className="p-2 hover:bg-surface-container-high rounded-full transition-all active:scale-95 text-on-surface relative">
            <span className="material-symbols-outlined">notifications</span>
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface-container-lowest"></span>
            )}
          </button>
          <button className="p-2 hover:bg-surface-container-high rounded-full transition-all active:scale-95 text-on-surface">
            <span className="material-symbols-outlined">apps</span>
          </button>
          <button className="p-2 hover:bg-surface-container-high rounded-full transition-all active:scale-95 text-on-surface">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
          
          <div className="h-8 w-px bg-outline-variant mx-2"></div>
          
          <div className="flex items-center gap-sm cursor-pointer hover:opacity-80 transition-opacity pl-2">
            <div className="text-right">
              <p className="font-label-md text-label-md text-on-surface leading-tight font-bold">{user.employee?.name || "Admin User"}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">{user.role}</p>
            </div>
            {user.employee?.profilePhoto ? (
              <img 
                className="w-9 h-9 rounded-full border border-outline-variant object-cover shadow-sm" 
                alt="Profile" 
                src={`http://localhost:5000/${user.employee.profilePhoto}`} 
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {user.employee?.name ? user.employee.name.substring(0, 1).toUpperCase() : "A"}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="ml-64 mt-[64px] p-lg flex-1 overflow-x-hidden min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  );
};
