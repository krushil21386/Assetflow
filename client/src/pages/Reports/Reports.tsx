import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#5275ff",
  "#3b5bdb",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

interface AssetReportData {
  summary: {
    totalAssets: number;
    totalCost: number;
    totalCurrentValue: number;
  };
  categoryBreakdown: Array<{ name: string; value: number }>;
  conditionBreakdown: Array<{ name: string; count: number }>;
  depreciatedAssets: Array<{
    id: number;
    tag: string;
    name: string;
    cost: number;
    depreciatedAmount: number;
    currentValue: number;
  }>;
}

interface MaintenanceReportData {
  summary: {
    totalTickets: number;
    totalCost: number;
  };
  statusBreakdown: Array<{ name: string; count: number }>;
  priorityBreakdown: Array<{ name: string; count: number }>;
}

interface BookingReportData {
  summary: {
    totalBookings: number;
  };
  statusBreakdown: Array<{ name: string; count: number }>;
  utilizationBreakdown: Array<{ name: string; count: number }>;
}

export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"assets" | "maintenance" | "bookings">("assets");
  const [assetData, setAssetData] = useState<AssetReportData | null>(null);
  const [maintData, setMaintData] = useState<MaintenanceReportData | null>(null);
  const [bookingData, setBookingData] = useState<BookingReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchReportData();
  }, [activeTab]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (activeTab === "assets") {
        const res = await api.get("/reports/assets");
        setAssetData(res.data);
      } else if (activeTab === "maintenance") {
        const res = await api.get("/reports/maintenance");
        setMaintData(res.data);
      } else if (activeTab === "bookings") {
        const res = await api.get("/reports/bookings");
        setBookingData(res.data);
      }
    } catch (e) {
      console.error("Failed to load reports data", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-lg animate-fade-in">
      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-md">
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
            Analytical Reports
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Audit valuations, straight-line depreciation schedules, and maintenance trends
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-outline-variant gap-sm">
        <button
          onClick={() => setActiveTab("assets")}
          className={`px-lg py-md font-label-md text-label-md border-b-2 transition-all active:scale-95 ${
            activeTab === "assets"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-on-surface-variant hover:text-primary"
          }`}
        >
          Valuation & Depreciation
        </button>
        <button
          onClick={() => setActiveTab("maintenance")}
          className={`px-lg py-md font-label-md text-label-md border-b-2 transition-all active:scale-95 ${
            activeTab === "maintenance"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-on-surface-variant hover:text-primary"
          }`}
        >
          Maintenance Expenditures
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-lg py-md font-label-md text-label-md border-b-2 transition-all active:scale-95 ${
            activeTab === "bookings"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-on-surface-variant hover:text-primary"
          }`}
        >
          Resource Utilization
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
            <span className="font-label-md text-label-md text-on-surface-variant">Calculating telemetry aggregates...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-lg">
          {/* TAB 1: ASSETS REPORT */}
          {activeTab === "assets" && assetData && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                <div className="bg-white border border-outline-variant p-md rounded-md flex items-center gap-md shadow-sm">
                  <div className="h-10 w-10 rounded bg-[#e0e7ff] text-[#312e81] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">devices</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                      Total Equipment Count
                    </p>
                    <p className="font-headline-sm text-headline-sm font-bold text-primary mt-xs">
                      {assetData.summary.totalAssets}
                    </p>
                  </div>
                </div>
                <div className="bg-white border border-outline-variant p-md rounded-md flex items-center gap-md shadow-sm">
                  <div className="h-10 w-10 rounded bg-[#dbeafe] text-[#1e3a8a] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">payments</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                      Original Purchase Cost
                    </p>
                    <p className="font-headline-sm text-headline-sm font-bold text-primary mt-xs">
                      ${assetData.summary.totalCost.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
                <div className="bg-white border border-outline-variant p-md rounded-md flex items-center gap-md shadow-sm">
                  <div className="h-10 w-10 rounded bg-[#d1fae5] text-[#065f46] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">trending_up</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                      Current Book Value
                    </p>
                    <p className="font-headline-sm text-headline-sm font-bold text-primary mt-xs">
                      ${assetData.summary.totalCurrentValue.toLocaleString(
                        undefined,
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chart section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                <div className="bg-white border border-outline-variant p-md rounded-md shadow-sm">
                  <h3 className="font-label-md text-label-md text-primary mb-md uppercase tracking-wider font-bold">
                    Category Financial Allocations
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={assetData.categoryBreakdown}>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            borderColor: "transparent",
                            borderRadius: "4px",
                            color: "#fff"
                          }}
                        />
                        <Bar
                          dataKey="value"
                          fill="#4f46e5"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white border border-outline-variant p-md rounded-md shadow-sm">
                  <h3 className="font-label-md text-label-md text-primary mb-md uppercase tracking-wider font-bold">
                    Asset Condition Share
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={assetData.conditionBreakdown}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
                        >
                          {assetData.conditionBreakdown.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            borderColor: "transparent",
                            borderRadius: "4px",
                            color: "#fff"
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Depreciation Table */}
              <div className="bg-white border border-outline-variant p-md rounded-md shadow-sm space-y-md">
                <div className="flex justify-between items-center">
                  <h3 className="font-label-md text-label-md text-primary uppercase tracking-wider font-bold">
                    Straight-Line Depreciation Ledger
                  </h3>
                </div>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-primary text-white font-label-md text-[10px] uppercase tracking-wider">
                        <th className="py-3 px-md border-r border-white/10">Asset Tag</th>
                        <th className="py-3 px-md border-r border-white/10">Asset Name</th>
                        <th className="py-3 px-md border-r border-white/10">Original Cost</th>
                        <th className="py-3 px-md border-r border-white/10">Depreciated Value</th>
                        <th className="py-3 px-md">Current Book Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                      {assetData.depreciatedAssets.map((asset) => (
                        <tr
                          key={asset.id}
                          className="text-on-surface hover:bg-secondary/10 transition-colors"
                        >
                          <td className="py-3 px-md font-mono text-on-surface-variant font-bold">
                            {asset.tag}
                          </td>
                          <td className="py-3 px-md font-bold text-primary">
                            {asset.name}
                          </td>
                          <td className="py-3 px-md font-mono font-bold">
                            ${asset.cost.toFixed(2)}
                          </td>
                          <td className="py-3 px-md font-mono text-red-700 font-bold">
                            -${asset.depreciatedAmount.toFixed(2)}
                          </td>
                          <td className="py-3 px-md font-mono text-emerald-700 font-bold">
                            ${asset.currentValue.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: MAINTENANCE REPORT */}
          {activeTab === "maintenance" && maintData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="bg-white border border-outline-variant p-md rounded-md flex items-center gap-md shadow-sm">
                  <div className="h-10 w-10 rounded bg-[#fef3c7] text-[#78350f] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">construction</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                      Total Tickets Raised
                    </p>
                    <p className="font-headline-sm text-headline-sm font-bold text-primary mt-xs">
                      {maintData.summary.totalTickets}
                    </p>
                  </div>
                </div>
                <div className="bg-white border border-outline-variant p-md rounded-md flex items-center gap-md shadow-sm">
                  <div className="h-10 w-10 rounded bg-[#fee2e2] text-[#991b1b] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">payments</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                      Accumulated Repair Cost
                    </p>
                    <p className="font-headline-sm text-headline-sm font-bold text-primary mt-xs">
                      ${maintData.summary.totalCost.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                <div className="bg-white border border-outline-variant p-md rounded-md shadow-sm">
                  <h3 className="font-label-md text-label-md text-primary mb-md uppercase tracking-wider font-bold">
                    Ticket Status Breakdown
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={maintData.statusBreakdown}>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            borderColor: "transparent",
                            borderRadius: "4px",
                            color: "#fff"
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#312e81"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white border border-outline-variant p-md rounded-md shadow-sm">
                  <h3 className="font-label-md text-label-md text-primary mb-md uppercase tracking-wider font-bold">
                    Priority Urgency Share
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={maintData.priorityBreakdown}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
                        >
                          {maintData.priorityBreakdown.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            borderColor: "transparent",
                            borderRadius: "4px",
                            color: "#fff"
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 3: BOOKINGS REPORT */}
          {activeTab === "bookings" && bookingData && (
            <>
              <div className="bg-white border border-outline-variant p-md rounded-md flex items-center gap-md shadow-sm max-w-sm">
                <div className="h-10 w-10 rounded bg-[#f3e8ff] text-[#581c87] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">schedule</span>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                    Total Scheduled Bookings
                  </p>
                  <p className="font-headline-sm text-headline-sm font-bold text-primary mt-xs">
                    {bookingData.summary.totalBookings}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                <div className="bg-white border border-outline-variant p-md rounded-md shadow-sm">
                  <h3 className="font-label-md text-label-md text-primary mb-md uppercase tracking-wider font-bold">
                    Schedule Status
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bookingData.statusBreakdown}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
                        >
                          {bookingData.statusBreakdown.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            borderColor: "transparent",
                            borderRadius: "4px",
                            color: "#fff"
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white border border-outline-variant p-md rounded-md shadow-sm">
                  <h3 className="font-label-md text-label-md text-primary mb-md uppercase tracking-wider font-bold">
                    Most Booked Resources
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bookingData.utilizationBreakdown}>
                        <XAxis
                          dataKey="name"
                          stroke="#64748b"
                          fontSize={9}
                          interval={0}
                        />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            borderColor: "transparent",
                            borderRadius: "4px",
                            color: "#fff"
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#8b5cf6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
