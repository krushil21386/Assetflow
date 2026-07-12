import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import api from "../../services/api";
import { Spinner, Warning } from "phosphor-react";
import {
  ResponsiveContainer,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

interface DashboardData {
  role: string;
  notifications: any[];
  summaryCards: Record<string, number>;
  chartData?: {
    categoryDistribution?: { name: string; value: number }[];
  };
  recentActivities?: any[];
  alerts?: {
    upcomingReturns: any[];
    overdueReturns: any[];
  };
  myAssets?: any[];
  myBookings?: any[];
  myMaintenance?: any[];
  message?: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/dashboard/summary");
        setData(res.data);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    if (socket) {
      const handleSync = () => {
        console.log("[Socket] Dashboard sync event received, refetching telemetry...");
        fetchDashboardData();
      };

      socket.on("asset:created", handleSync);
      socket.on("asset:updated", handleSync);
      socket.on("asset:deleted", handleSync);
      socket.on("allocation:created", handleSync);
      socket.on("allocation:returned", handleSync);
      socket.on("maintenance:created", handleSync);
      socket.on("maintenance:updated", handleSync);
      socket.on("booking:created", handleSync);
      socket.on("booking:updated", handleSync);
      socket.on("transfer:requested", handleSync);
      socket.on("transfer:updated", handleSync);

      return () => {
        socket.off("asset:created", handleSync);
        socket.off("asset:updated", handleSync);
        socket.off("asset:deleted", handleSync);
        socket.off("allocation:created", handleSync);
        socket.off("allocation:returned", handleSync);
        socket.off("maintenance:created", handleSync);
        socket.off("maintenance:updated", handleSync);
        socket.off("booking:created", handleSync);
        socket.off("booking:updated", handleSync);
        socket.off("transfer:requested", handleSync);
        socket.off("transfer:updated", handleSync);
      };
    }
  }, [socket]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <Spinner size={48} className="text-primary animate-icon-spin" weight="bold" />
          <span className="font-label-md text-label-md text-on-surface-variant">Loading workspace telemetry...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-panel p-xl text-center">
        <Warning size={48} className="text-error inline-block mb-sm" weight="bold" />
        <h3 className="font-headline-sm text-headline-sm text-primary">System Telemetry Error</h3>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Failed to establish connection with security and metrics controller.</p>
      </div>
    );
  }

  const { role, summaryCards } = data;

  const renderKPIs = () => {
    const cards = [];
    if (role === "Admin") {
      cards.push(
        { title: "Total Assets", val: summaryCards.totalAssets, icon: "inventory_2", color: "bg-blue-50 text-blue-600 border-blue-600" },
        { title: "Active Employees", val: summaryCards.activeEmployees, icon: "group", color: "bg-emerald-50 text-emerald-600 border-emerald-600" },
        { title: "Asset Categories", val: summaryCards.totalCategories, icon: "category", color: "bg-amber-50 text-amber-600 border-amber-600" },
        { title: "Active Departments", val: summaryCards.totalDepartments, icon: "domain", color: "bg-indigo-50 text-indigo-600 border-indigo-600" },
        { title: "Pending Manager Approvals", val: summaryCards.pendingManagerApprovals, icon: "rule", color: "bg-rose-50 text-rose-600 border-rose-600" },
        { title: "Maintenance Pending", val: summaryCards.maintenanceAssets, icon: "engineering", color: "bg-red-50 text-red-600 border-red-600" }
      );
    } else if (role === "Asset Manager") {
      cards.push(
        { title: "Available Assets", val: summaryCards.availableAssets, icon: "check_circle", color: "bg-emerald-50 text-emerald-600 border-emerald-600" },
        { title: "Allocated Assets", val: summaryCards.allocatedAssets, icon: "hub", color: "bg-blue-50 text-blue-600 border-blue-600" },
        { title: "Maintenance Requested", val: summaryCards.maintenanceCount, icon: "build", color: "bg-red-50 text-red-600 border-red-600" },
        { title: "Pending Approvals", val: summaryCards.pendingManagerTransfers, icon: "rule", color: "bg-rose-50 text-rose-600 border-rose-600" },
        { title: "Active Maintenance Tickets", val: summaryCards.activeMaintenanceCount, icon: "engineering", color: "bg-amber-50 text-amber-600 border-amber-600" },
        { title: "Overdue Returns", val: summaryCards.overdueReturnsCount, icon: "warning", color: "bg-red-50 text-red-600 border-red-600 animate-pulse" }
      );
    } else if (role === "Department Head") {
      cards.push(
        { title: "Department Assets", val: summaryCards.departmentAssets, icon: "domain", color: "bg-blue-50 text-blue-600 border-blue-600" },
        { title: "Pending HOD Approvals", val: summaryCards.pendingHodApprovals, icon: "rule", color: "bg-rose-50 text-rose-600 border-rose-600" },
        { title: "Bookings Today", val: summaryCards.bookingsToday, icon: "today", color: "bg-emerald-50 text-emerald-600 border-emerald-600" }
      );
    } else {
      // Employee
      cards.push(
        { title: "My Allocated Assets", val: summaryCards.myAssetsCount, icon: "inventory_2", color: "bg-blue-50 text-blue-600 border-blue-600" },
        { title: "My Resource Bookings", val: summaryCards.myBookingsCount, icon: "event_available", color: "bg-emerald-50 text-emerald-600 border-emerald-600" },
        { title: "My Maintenance Requests", val: summaryCards.myMaintenanceCount, icon: "build", color: "bg-amber-50 text-amber-600 border-amber-600" }
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {cards.map((card, idx) => (
          <div key={idx} className={`bg-white rounded-md border p-md shadow-sm relative overflow-hidden transition-all hover:shadow-md border-l-4`}>
            <div className="flex justify-between items-start mb-sm">
              <div className={`h-10 w-10 rounded flex items-center justify-center ${card.color.split(" ")[0]} ${card.color.split(" ")[1]}`}>
                <span className="material-symbols-outlined">{card.icon}</span>
              </div>
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">{card.title}</p>
            <h3 className="font-headline-md text-headline-md text-primary mt-1 font-bold">{card.val ?? 0}</h3>
          </div>
        ))}
      </div>
    );
  };

  const chartData = data.chartData?.categoryDistribution || [];

  return (
    <div className="max-w-[1400px] mx-auto space-y-lg animate-fade-in">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
            Welcome, {user?.employee?.name || "Administrator"}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Role: <span className="font-bold text-secondary uppercase text-xs">{role}</span> | System summary and telemetry overview.
          </p>
        </div>
      </div>

      {/* 2. Message / Call to Action */}
      {data.message && (
        <div className="p-md bg-secondary/10 border border-secondary/20 rounded-md text-primary font-body-md text-body-md flex items-center gap-sm">
          <span className="material-symbols-outlined text-[20px]">info</span>
          <span>{data.message}</span>
        </div>
      )}

      {/* 3. KPI Bento Cards */}
      {renderKPIs()}

      {/* 4. Main Distribution Area: Chart + Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Category distribution */}
        {chartData.length > 0 && (
          <div className="bg-white border border-outline-variant rounded-md shadow-sm overflow-hidden flex flex-col">
            <div className="bg-primary text-white px-md py-sm flex items-center gap-sm">
              <span className="material-symbols-outlined">pie_chart</span>
              <h4 className="font-label-md text-label-md uppercase font-bold tracking-wider">Asset Category Distribution</h4>
            </div>
            <div className="p-md flex-1 flex flex-col justify-center items-center h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                  <Bar dataKey="value" fill="#1e293b" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Role-Specific Secondary List */}
        <div className="bg-white border border-outline-variant rounded-md shadow-sm overflow-hidden flex flex-col">
          {role === "Admin" && data.recentActivities && (
            <>
              <div className="bg-primary text-white px-md py-sm flex items-center gap-sm">
                <span className="material-symbols-outlined">history</span>
                <h4 className="font-label-md text-label-md uppercase font-bold tracking-wider">Recent Activity Logs</h4>
              </div>
              <div className="divide-y divide-outline-variant overflow-y-auto max-h-80 flex-1">
                {data.recentActivities.length === 0 ? (
                  <p className="p-md text-center text-on-surface-variant font-body-md text-body-md">No recent system logs.</p>
                ) : (
                  data.recentActivities.map((log) => (
                    <div key={log.id} className="p-sm hover:bg-surface-container-low transition-colors">
                      <div className="flex justify-between items-start">
                        <span className="font-label-md text-label-md text-primary font-bold">{log.action}</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface mt-1">{log.details}</p>
                      <p className="font-label-sm text-label-sm text-outline mt-0.5">
                        By: {log.user.employee?.name || log.user.email} | IP: {log.ipAddress}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {role === "Asset Manager" && data.alerts && (
            <>
              <div className="bg-primary text-white px-md py-sm flex items-center gap-sm">
                <span className="material-symbols-outlined">warning</span>
                <h4 className="font-label-md text-label-md uppercase font-bold tracking-wider">Asset Alert Center</h4>
              </div>
              <div className="p-md space-y-md overflow-y-auto max-h-80 flex-1">
                <div>
                  <h5 className="font-label-md text-label-md text-error font-bold mb-xs">Overdue Returns ({data.alerts.overdueReturns.length})</h5>
                  {data.alerts.overdueReturns.length === 0 ? (
                    <p className="text-xs text-on-surface-variant italic">No overdue items currently.</p>
                  ) : (
                    <div className="space-y-xs">
                      {data.alerts.overdueReturns.map((ret) => (
                        <div key={ret.id} className="p-xs bg-error/10 border border-error/20 rounded flex justify-between text-xs">
                          <span>{ret.asset.name} ({ret.asset.assetTag}) - {ret.employee.name}</span>
                          <span className="font-bold text-error">Overdue</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h5 className="font-label-md text-label-md text-amber-600 font-bold mb-xs">Upcoming Returns ({data.alerts.upcomingReturns.length})</h5>
                  {data.alerts.upcomingReturns.length === 0 ? (
                    <p className="text-xs text-on-surface-variant italic">No upcoming returns in next 7 days.</p>
                  ) : (
                    <div className="space-y-xs">
                      {data.alerts.upcomingReturns.map((ret) => (
                        <div key={ret.id} className="p-xs bg-amber-500/10 border border-amber-500/20 rounded flex justify-between text-xs">
                          <span>{ret.asset.name} - {ret.employee.name}</span>
                          <span className="font-bold text-amber-700">
                            {new Date(ret.expectedReturnDate).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {role === "Employee" && (
            <>
              <div className="bg-primary text-white px-md py-sm flex items-center gap-sm">
                <span className="material-symbols-outlined">business_center</span>
                <h4 className="font-label-md text-label-md uppercase font-bold tracking-wider">My Allocated Assets</h4>
              </div>
              <div className="divide-y divide-outline-variant overflow-y-auto max-h-80 flex-1">
                {!data.myAssets || data.myAssets.length === 0 ? (
                  <p className="p-md text-center text-on-surface-variant font-body-md text-body-md">No assets allocated to your profile.</p>
                ) : (
                  data.myAssets.map((alloc) => (
                    <div key={alloc.id} className="p-sm flex justify-between items-center hover:bg-surface-container-low transition-colors">
                      <div>
                        <p className="font-label-md text-label-md text-primary font-bold">{alloc.asset.name}</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">Tag: {alloc.asset.assetTag} | Cat: {alloc.asset.category?.name}</p>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface bg-outline-variant/30 px-xs py-0.5 rounded">
                        Allocated: {new Date(alloc.allocationDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {role === "Department Head" && (
            <>
              <div className="bg-primary text-white px-md py-sm flex items-center gap-sm">
                <span className="material-symbols-outlined">info</span>
                <h4 className="font-label-md text-label-md uppercase font-bold tracking-wider">Department Details</h4>
              </div>
              <div className="p-md flex-1 flex flex-col justify-center items-center">
                <span className="material-symbols-outlined text-secondary text-5xl mb-xs">domain</span>
                <p className="font-body-md text-body-md text-on-surface-variant text-center">
                  Review booking telemetry, approvals, and assets belonging to your department via the sidebar links.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
