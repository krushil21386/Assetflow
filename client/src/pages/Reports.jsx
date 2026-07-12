import React, { useState, useEffect } from "react";
import api from "../services/api";
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
import { TrendingUp, IndianRupee, Laptop, Wrench, Clock } from "lucide-react";

const COLORS = [
  "#5275ff",
  "#3b5bdb",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export const Reports = () => {
  const [activeTab, setActiveTab] = useState("assets");
  const [assetData, setAssetData] = useState(null);
  const [maintData, setMaintData] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy tracking-wider ">
            Analytical Reports
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Audit valuations, straight-line depreciation schedules, and
            maintenance trends
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-gray-200 gap-2">
        <button
          onClick={() => setActiveTab("assets")}
          className={`px-6 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "assets"
              ? "border-brand-500 text-navy font-bold"
              : "border-transparent text-gray-500 hover:text-navy"
          }`}
        >
          Valuation & Depreciation
        </button>
        <button
          onClick={() => setActiveTab("maintenance")}
          className={`px-6 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "maintenance"
              ? "border-brand-500 text-navy font-bold"
              : "border-transparent text-gray-500 hover:text-navy"
          }`}
        >
          Maintenance Expenditures
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-6 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "bookings"
              ? "border-brand-500 text-navy font-bold"
              : "border-transparent text-gray-500 hover:text-navy"
          }`}
        >
          Resource Utilization
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500 mr-2"></div>
          <span>Calculating telemetry aggregates...</span>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* TAB 1: ASSETS REPORT */}
          {activeTab === "assets" && assetData && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-2xl flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
                    <Laptop size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                      Total Equipment Count
                    </p>
                    <p className="text-xl font-bold text-navy mt-1">
                      {assetData.summary.totalAssets}
                    </p>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-2xl flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <IndianRupee size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                      Original Purchase Cost
                    </p>
                    <p className="text-xl font-bold text-navy mt-1">
                      ₹
                      {assetData.summary.totalCost.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-2xl flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                      Current Book Value
                    </p>
                    <p className="text-xl font-bold text-navy mt-1">
                      ₹
                      {assetData.summary.totalCurrentValue.toLocaleString(
                        undefined,
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chart section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-3xl">
                  <h3 className="text-xs font-bold text-navy mb-6 uppercase tracking-wider">
                    Category Financial Allocations
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={assetData.categoryBreakdown}>
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                        <YAxis stroke="#9ca3af" fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "rgba(255,255,255,0.08)",
                            borderRadius: "10px",
                          }}
                        />
                        <Bar
                          dataKey="value"
                          fill="#5275ff"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-3xl">
                  <h3 className="text-xs font-bold text-navy mb-6 uppercase tracking-wider">
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
                          {assetData.conditionBreakdown.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "rgba(255,255,255,0.08)",
                            borderRadius: "10px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Depreciation Table */}
              <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
                    Straight-Line Depreciation Ledger
                  </h3>
                </div>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500 font-semibold bg-gray-50">
                        <th className="py-3 px-6">Asset Tag</th>
                        <th className="py-3 px-6">Asset Name</th>
                        <th className="py-3 px-6">Original Cost</th>
                        <th className="py-3 px-6">Depreciated Value</th>
                        <th className="py-3 px-6">Current Book Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border text-gray-700">
                      {assetData.depreciatedAssets.map((asset) => (
                        <tr
                          key={asset.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-6 font-mono text-gray-500">
                            {asset.tag}
                          </td>
                          <td className="py-3 px-6 font-bold text-navy">
                            {asset.name}
                          </td>
                          <td className="py-3 px-6 font-mono">
                            ₹{asset.cost.toFixed(2)}
                          </td>
                          <td className="py-3 px-6 font-mono text-red-400">
                            -₹{asset.depreciatedAmount.toFixed(2)}
                          </td>
                          <td className="py-3 px-6 font-mono text-emerald-400 font-bold">
                            ₹{asset.currentValue.toFixed(2)}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-2xl flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Wrench size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                      Total Tickets Raised
                    </p>
                    <p className="text-xl font-bold text-navy mt-1">
                      {maintData.summary.totalTickets}
                    </p>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-2xl flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                    <IndianRupee size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                      Accumulated Repair Cost
                    </p>
                    <p className="text-xl font-bold text-navy mt-1">
                      ₹
                      {maintData.summary.totalCost.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-3xl">
                  <h3 className="text-xs font-bold text-navy mb-6 uppercase tracking-wider">
                    Ticket Status Breakdown
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={maintData.statusBreakdown}>
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                        <YAxis stroke="#9ca3af" fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "rgba(255,255,255,0.08)",
                            borderRadius: "10px",
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#3b5bdb"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-3xl">
                  <h3 className="text-xs font-bold text-navy mb-6 uppercase tracking-wider">
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
                          {maintData.priorityBreakdown.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "rgba(255,255,255,0.08)",
                            borderRadius: "10px",
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
              <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-2xl flex items-center gap-4 max-w-sm">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                    Total Scheduled Bookings
                  </p>
                  <p className="text-xl font-bold text-navy mt-1">
                    {bookingData.summary.totalBookings}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-3xl">
                  <h3 className="text-xs font-bold text-navy mb-6 uppercase tracking-wider">
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
                          {bookingData.statusBreakdown.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "rgba(255,255,255,0.08)",
                            borderRadius: "10px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-3xl">
                  <h3 className="text-xs font-bold text-navy mb-6 uppercase tracking-wider">
                    Most Booked Resources
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bookingData.utilizationBreakdown}>
                        <XAxis
                          dataKey="name"
                          stroke="#9ca3af"
                          fontSize={9}
                          interval={0}
                        />
                        <YAxis stroke="#9ca3af" fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "rgba(255,255,255,0.08)",
                            borderRadius: "10px",
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
