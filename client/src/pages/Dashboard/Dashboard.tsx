import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Laptop, Users, Building2, Wrench, ArrowLeftRight, AlertTriangle, 
  Clock, CheckCircle, ShieldAlert 
} from 'lucide-react';

interface DashboardSummary {
  role: string;
  summaryCards: Record<string, number>;
  chartData?: {
    categoryDistribution: Array<{ name: string; value: number }>;
  };
  recentActivities?: Array<{
    id: number;
    action: string;
    details: string;
    createdAt: string;
    user: { email: string; employee?: { name: string } | null };
  }>;
  alerts?: {
    upcomingReturns: any[];
    overdueReturns: any[];
  };
  myAssets?: any[];
  myBookings?: any[];
  myMaintenance?: any[];
  message?: string;
}

const COLORS = ['#5275ff', '#3b5bdb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/dashboard/summary');
      setData(res.data);
    } catch (e) {
      console.error('Failed to load dashboard summary', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mr-3"></div>
        <span>Loading dashboard telemetry...</span>
      </div>
    );
  }

  if (!data) return <p className="text-gray-500">Failed to render dashboard summary.</p>;

  // CARD RENDERER HELPERS
  const renderCard = (title: string, value: number | string, icon: React.ReactNode, gradient: string) => (
    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-brand-500/20 transition-all duration-300">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-[0.03] group-hover:opacity-10 blur-xl rounded-full transition-opacity duration-300`}></div>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-extrabold text-white mt-2 tracking-tight">{value}</p>
        </div>
        <div className={`h-12 w-12 rounded-xl bg-gradient-to-tr ${gradient} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-card p-6 rounded-3xl relative overflow-hidden border border-brand-500/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-tr from-brand-500/10 to-brand-600/5 blur-3xl -z-10"></div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">{user?.employee?.name || 'User'}</span>
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          {data.role === 'Admin' && 'System status is healthy. You have full access to administration modules.'}
          {data.role === 'Asset Manager' && 'Inventory management dashboard. Review maintenance cycles and allocations.'}
          {data.role === 'Department Head' && 'Department resource status. Review pending transfers and bookings.'}
          {data.role === 'Employee' && 'Overview of your assigned company equipment and resources.'}
        </p>
      </div>

      {/* 1. CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.role === 'Admin' && (
          <>
            {renderCard('Total Assets Registered', data.summaryCards.totalAssets, <Laptop size={22} />, 'from-brand-500 to-brand-600')}
            {renderCard('Active Employees', data.summaryCards.activeEmployees, <Users size={22} />, 'from-emerald-500 to-teal-600')}
            {renderCard('Registered Departments', data.summaryCards.totalDepartments, <Building2 size={22} />, 'from-purple-500 to-indigo-600')}
            {renderCard('Pending Manager Approvals', data.summaryCards.pendingManagerApprovals, <ArrowLeftRight size={22} />, 'from-amber-500 to-orange-600')}
            {renderCard('Assets in Maintenance', data.summaryCards.maintenanceAssets, <Wrench size={22} />, 'from-red-500 to-pink-600')}
          </>
        )}

        {data.role === 'Asset Manager' && (
          <>
            {renderCard('Available Assets', data.summaryCards.availableAssets, <CheckCircle size={22} />, 'from-emerald-500 to-teal-600')}
            {renderCard('Allocated Assets', data.summaryCards.allocatedAssets, <Laptop size={22} />, 'from-brand-500 to-brand-600')}
            {renderCard('Under Maintenance', data.summaryCards.maintenanceCount, <Wrench size={22} />, 'from-red-500 to-pink-600')}
            {renderCard('Pending Transfers', data.summaryCards.pendingManagerTransfers, <ArrowLeftRight size={22} />, 'from-amber-500 to-orange-600')}
            {renderCard('Overdue Returns', data.summaryCards.overdueReturnsCount, <AlertTriangle size={22} />, 'from-red-600 to-orange-600')}
          </>
        )}

        {data.role === 'Department Head' && (
          <>
            {renderCard('Department Assets', data.summaryCards.departmentAssets, <Laptop size={22} />, 'from-brand-500 to-brand-600')}
            {renderCard('Pending Approvals', data.summaryCards.pendingHodApprovals, <ArrowLeftRight size={22} />, 'from-amber-500 to-orange-600')}
            {renderCard('Bookings Today', data.summaryCards.bookingsToday, <Clock size={22} />, 'from-purple-500 to-indigo-600')}
          </>
        )}

        {data.role === 'Employee' && (
          <>
            {renderCard('My Allocated Assets', data.summaryCards.myAssetsCount, <Laptop size={22} />, 'from-brand-500 to-brand-600')}
            {renderCard('My Active Bookings', data.summaryCards.myBookingsCount, <Clock size={22} />, 'from-emerald-500 to-teal-600')}
            {renderCard('My Maintenance Tickets', data.summaryCards.myMaintenanceCount, <Wrench size={22} />, 'from-amber-500 to-orange-600')}
          </>
        )}
      </div>

      {/* 2. MAIN TELEMETRY LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT/CENTER WIDGETS (2 COLS) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Charts Row */}
          {data.chartData?.categoryDistribution && data.chartData.categoryDistribution.length > 0 && (
            <div className="glass-card p-6 rounded-3xl">
              <h3 className="text-base font-bold text-white mb-6">Asset Category Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.chartData.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {data.chartData.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Employee-Specific Tables */}
          {data.role === 'Employee' && (
            <div className="glass-card p-6 rounded-3xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white mb-4">My Assigned Assets</h3>
                {data.myAssets && data.myAssets.length === 0 ? (
                  <p className="text-xs text-gray-500 py-2">No company assets currently registered to your profile.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-dark-border text-gray-400 font-semibold">
                          <th className="py-2.5">Asset Name</th>
                          <th>Tag</th>
                          <th>Category</th>
                          <th>Allocation Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-border">
                        {data.myAssets?.map(alloc => (
                          <tr key={alloc.id} className="text-gray-300 hover:bg-white/5 transition-colors">
                            <td className="py-2.5 font-medium text-white">{alloc.asset.name}</td>
                            <td><span className="font-mono bg-white/5 px-2 py-0.5 rounded text-gray-400">{alloc.asset.assetTag}</span></td>
                            <td>{alloc.asset.category.name}</td>
                            <td>{new Date(alloc.allocationDate).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity Log (Admin only) */}
          {data.role === 'Admin' && data.recentActivities && (
            <div className="glass-card p-6 rounded-3xl">
              <h3 className="text-base font-bold text-white mb-4">Recent System Activities</h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  {data.recentActivities.map((act, actIdx) => (
                    <li key={act.id}>
                      <div className="relative pb-8">
                        {actIdx !== data.recentActivities!.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-dark-border" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
                              <ShieldAlert size={14} />
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-xs text-gray-300 font-medium">{act.details}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                Action: <span className="font-semibold text-brand-400">{act.action}</span> • By {act.user.employee?.name || act.user.email}
                              </p>
                            </div>
                            <div className="text-right text-[10px] whitespace-nowrap text-gray-500">
                              {new Date(act.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (ALERTS / ACTIONS) (1 COL) */}
        <div className="space-y-6">
          {/* Asset Manager Overdue Alert */}
          {data.role === 'Asset Manager' && data.alerts && (
            <div className="glass-card p-6 rounded-3xl space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="text-red-500" size={18} />
                  <h3 className="text-sm font-bold text-white">Overdue Asset Returns ({data.alerts.overdueReturns.length})</h3>
                </div>
                {data.alerts.overdueReturns.length === 0 ? (
                  <p className="text-xs text-gray-500">No overdue allocations.</p>
                ) : (
                  <div className="space-y-3">
                    {data.alerts.overdueReturns.map(alloc => (
                      <div key={alloc.id} className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-xs">
                        <p className="font-semibold text-white">{alloc.asset.name}</p>
                        <p className="text-gray-400 mt-0.5">Held by: {alloc.employee.name}</p>
                        <p className="text-red-400 mt-1 font-mono">Expected: {new Date(alloc.expectedReturnDate).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-dark-border pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="text-brand-400" size={18} />
                  <h3 className="text-sm font-bold text-white">Upcoming Returns ({data.alerts.upcomingReturns.length})</h3>
                </div>
                {data.alerts.upcomingReturns.length === 0 ? (
                  <p className="text-xs text-gray-500">No expected returns within 7 days.</p>
                ) : (
                  <div className="space-y-3">
                    {data.alerts.upcomingReturns.map(alloc => (
                      <div key={alloc.id} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                        <p className="font-semibold text-white">{alloc.asset.name}</p>
                        <p className="text-gray-400 mt-0.5">Held by: {alloc.employee.name}</p>
                        <p className="text-brand-400 mt-1 font-mono">Due: {new Date(alloc.expectedReturnDate).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Employee side quick updates */}
          {data.role === 'Employee' && (
            <div className="glass-card p-6 rounded-3xl space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white mb-4">Recent Bookings</h3>
                {data.myBookings && data.myBookings.length === 0 ? (
                  <p className="text-xs text-gray-500">No scheduled resource bookings.</p>
                ) : (
                  <div className="space-y-3">
                    {data.myBookings?.map(b => (
                      <div key={b.id} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                        <p className="font-semibold text-white">{b.asset.name}</p>
                        <p className="text-gray-400 mt-0.5">{new Date(b.date).toLocaleDateString()} @ {b.startTime} - {b.endTime}</p>
                        <span className="text-[10px] text-emerald-400 font-semibold mt-1 inline-block">{b.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-dark-border pt-6">
                <h3 className="text-sm font-bold text-white mb-4">Maintenance Status</h3>
                {data.myMaintenance && data.myMaintenance.length === 0 ? (
                  <p className="text-xs text-gray-500">No open tickets.</p>
                ) : (
                  <div className="space-y-3">
                    {data.myMaintenance?.map(m => (
                      <div key={m.id} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                        <p className="font-semibold text-white">{m.asset.name}</p>
                        <p className="text-gray-400 mt-0.5 truncate">{m.issue}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            m.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            m.status === 'CLOSED' ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20' :
                            'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                          }`}>{m.status}</span>
                          <span className="text-[10px] text-gray-500 font-mono">{new Date(m.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
