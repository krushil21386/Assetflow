import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  LayoutDashboard, Building2, Tags, Users, Laptop, ArrowLeftRight, 
  CalendarRange, Wrench, ShieldCheck, FileSpreadsheet, History, 
  Bell, LogOut, Menu, X, User as UserIcon
} from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every min
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.filter((n: Notification) => !n.isRead));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return null;

  // Define sidebar navigation items based on User Role
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Departments', path: '/departments', icon: Building2, roles: ['Admin'] },
    { name: 'Categories', path: '/categories', icon: Tags, roles: ['Admin'] },
    { name: 'Employees', path: '/employees', icon: Users, roles: ['Admin'] },
    { name: 'Assets', path: '/assets', icon: Laptop, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Allocations & Transfers', path: '/transfers', icon: ArrowLeftRight, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Bookings', path: '/bookings', icon: CalendarRange, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Auditing', path: '/audits', icon: ShieldCheck, roles: ['Admin', 'Asset Manager'] },
    { name: 'Reports', path: '/reports', icon: FileSpreadsheet, roles: ['Admin', 'Asset Manager'] },
    { name: 'Activity Logs', path: '/logs', icon: History, roles: ['Admin'] },
  ].filter(item => item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#080b11] text-gray-200">
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-dark-border m-4 rounded-2xl overflow-hidden z-20">
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-500 to-brand-600 flex items-center justify-center font-bold text-white shadow-lg">N</div>
            <h1 className="text-xl font-bold tracking-wider text-white glow-text">NexAsset</h1>
          </div>
          <span className="text-xs text-brand-400 font-medium px-2 py-0.5 mt-2 rounded bg-brand-500/10 border border-brand-500/20 inline-block">{user.role}</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-brand-500 text-white font-semibold shadow-md shadow-brand-500/20' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-dark-border">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MOBILE SIDEBAR MODAL */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-sm">
          <div className="w-64 glass-panel border-r border-dark-border flex flex-col h-full animate-slide-in">
            <div className="p-6 border-b border-dark-border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white">N</div>
                  <span className="text-lg font-bold text-white">NexAsset</span>
                </div>
                <span className="text-[10px] text-brand-400 px-2 py-0.5 rounded bg-brand-500/10 inline-block mt-1">{user.role}</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive ? 'bg-brand-500 text-white font-semibold' : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-dark-border">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden md:py-4 md:pr-4">
        {/* HEADER */}
        <header className="flex items-center justify-between p-4 md:px-6 md:py-4 glass-panel border border-dark-border rounded-2xl md:mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-semibold text-white capitalize hidden sm:block">
              {location.pathname === '/' ? 'Overview' : location.pathname.substring(1).replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* NOTIFICATIONS DROPDOWN */}
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white relative transition-colors"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-[10px] text-white rounded-full flex items-center justify-center font-bold">
                    {notifications.length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 glass-card rounded-2xl border border-dark-border shadow-2xl p-4 z-50 animate-fade-in max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-dark-border mb-3">
                    <span className="font-semibold text-white">Notifications</span>
                    <span className="text-xs text-brand-400">{notifications.length} Unread</span>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No new alerts.</p>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map(n => (
                        <div key={n.id} className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex flex-col gap-1">
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-medium text-xs text-white">{n.title}</span>
                            <button 
                              onClick={() => handleMarkRead(n.id)}
                              className="text-[10px] text-brand-400 hover:underline shrink-0"
                            >
                              Dismiss
                            </button>
                          </div>
                          <p className="text-xs text-gray-400">{n.message}</p>
                          <span className="text-[9px] text-gray-500 mt-1">{new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PROFILE ICON */}
            <div className="flex items-center gap-2 border-l border-dark-border pl-4">
              {user.employee?.profilePhoto ? (
                <img 
                  src={`http://localhost:5000/${user.employee.profilePhoto}`} 
                  alt={user.employee.name} 
                  className="h-9 w-9 rounded-full object-cover border border-brand-500/30"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center font-bold border border-brand-500/20">
                  <UserIcon size={16} />
                </div>
              )}
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-white">{user.employee?.name || 'User Profile'}</p>
                <p className="text-[10px] text-gray-400">{user.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-grow p-4 md:p-6 glass-panel border border-dark-border rounded-2xl overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
