import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";import { Plus, Spinner } from "phosphor-react";import type { Asset, Employee } from "../../types";

interface MaintenanceTicket {
  id: number;
  assetId: number;
  requestedById: number;
  assignedToId?: number;
  issue: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "PENDING" | "APPROVED" | "TECHNICIAN_ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CLOSED" | "REJECTED";
  cost: number;
  remarks?: string;
  createdAt: string;
  asset: Asset;
  requestedBy: { name: string };
  assignedTo?: { name: string };
}

export const Maintenance: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [updateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Create Form
  const [assetId, setAssetId] = useState<string>("");
  const [issue, setIssue] = useState<string>("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");

  // Update Form
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [status, setStatus] = useState<string>("PENDING");
  const [assignedToId, setAssignedToId] = useState<string>("");
  const [cost, setCost] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const isManagerOrAdmin = user?.role === "Admin" || user?.role === "Asset Manager";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [maintRes, assetsRes, empRes] = await Promise.all([
        api.get("/maintenance"),
        api.get("/assets"),
        api.get("/employees"),
      ]);
      setTickets(maintRes.data || []);
      setAssets(assetsRes.data || []);
      setEmployees((empRes.data || []).filter((e: Employee) => e.status === "ACTIVE"));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setAssetId(assets[0]?.id ? String(assets[0].id) : "");
    setIssue("");
    setPriority("MEDIUM");
    setError(null);
    setModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !issue) {
      setError("Please fill in required fields");
      return;
    }

    try {
      await api.post("/maintenance", {
        assetId: parseInt(assetId, 10),
        issue,
        priority,
      });
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit ticket");
    }
  };

  const handleOpenUpdate = (ticket: MaintenanceTicket) => {
    setSelectedTicket(ticket);
    setStatus(ticket.status);
    setAssignedToId(ticket.assignedToId ? String(ticket.assignedToId) : "");
    setCost(String(ticket.cost));
    setRemarks(ticket.remarks || "");
    setNotes("");
    setError(null);
    setUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      await api.put(`/maintenance/${selectedTicket.id}`, {
        status,
        assignedToId: assignedToId ? parseInt(assignedToId, 10) : null,
        cost: cost ? parseFloat(cost) : 0,
        remarks,
        notes,
      });
      setUpdateModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update ticket");
    }
  };

  return (
    <div className="space-y-lg animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
            Maintenance Tickets
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Report asset faults, monitor repairs, assign technical personnel, and audit costs
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="group flex items-center gap-sm px-lg py-md rounded bg-primary text-white hover:bg-[#1e293b] font-label-md text-label-md transition-all shadow-sm active:scale-95"
        >
          <Plus size={18} weight="bold" className="group-hover:animate-icon-hover-rotate" />
          <span>Report Fault</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <Spinner size={48} className="text-primary animate-icon-spin" weight="bold" />
            <span className="font-label-md text-label-md text-on-surface-variant">Loading maintenance logs...</span>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-outline-variant rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary text-white font-label-md text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-md border-r border-white/10">Ticket / Asset</th>
                  <th className="py-3 px-md border-r border-white/10">Issue Fault</th>
                  <th className="py-3 px-md border-r border-white/10">Priority</th>
                  <th className="py-3 px-md border-r border-white/10">Reported By</th>
                  <th className="py-3 px-md border-r border-white/10">Technician Assigned</th>
                  <th className="py-3 px-md border-r border-white/10">Cost (USD)</th>
                  <th className="py-3 px-md border-r border-white/10">Status</th>
                  <th className="py-3 px-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-xl text-on-surface-variant">
                      No reported maintenance logs.
                    </td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr
                      key={t.id}
                      className="text-on-surface hover:bg-secondary/10 transition-colors"
                    >
                      <td className="py-3 px-md font-bold text-primary">
                        <div>{t.asset.name}</div>
                        <span className="font-mono text-[9px] text-on-surface-variant font-bold">
                          {t.asset.assetTag}
                        </span>
                      </td>
                      <td className="py-3 px-md max-w-xs truncate">{t.issue}</td>
                      <td className="py-3 px-md">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                            t.priority === "CRITICAL"
                              ? "bg-red-500/10 text-red-700 border-red-500/20"
                              : t.priority === "HIGH"
                                ? "bg-orange-500/10 text-orange-700 border-orange-500/20"
                                : t.priority === "MEDIUM"
                                  ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
                                  : "bg-blue-500/10 text-blue-700 border-blue-500/20"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-md">{t.requestedBy.name}</td>
                      <td className="py-3 px-md">{t.assignedTo?.name || "Unassigned"}</td>
                      <td className="py-3 px-md font-mono font-bold">₹{t.cost.toFixed(2)}</td>
                      <td className="py-3 px-md">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                            t.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
                              : t.status === "CLOSED"
                                ? "bg-outline-variant/30 text-on-surface-variant border-transparent"
                                : t.status === "REJECTED"
                                  ? "bg-red-500/10 text-red-700 border-red-500/20"
                                  : "bg-blue-500/10 text-blue-700 border-blue-500/20"
                          }`}
                        >
                          {t.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-md text-right">
                        {isManagerOrAdmin && (
                          <button
                            onClick={() => handleOpenUpdate(t)}
                            className="px-sm py-xs bg-primary text-white hover:bg-[#1e293b] rounded text-[10px] font-bold transition-all shadow-sm active:scale-95"
                          >
                            Update Progress
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: REPORT FAULT */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-outline-variant p-lg rounded-lg shadow-lg relative animate-fade-in">
            <div className="flex justify-between items-center pb-sm border-b border-outline-variant mb-md">
              <h3 className="font-headline-sm text-headline-sm text-primary">Log Fault Report</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-outline hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] block">close</span>
              </button>
            </div>

            {error && (
              <div className="mb-md p-sm bg-error/10 border border-error/20 rounded text-error font-body-sm text-body-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-md">
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">Select Faulty Asset *</label>
                <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                  <select
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none appearance-none"
                    required
                  >
                    <option value="">Choose Asset...</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} [{a.assetTag}]
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
                </div>
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">Fault Issue Details *</label>
                <textarea
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="Describe screen flickers, ignition faults, body cracks..."
                  className="w-full px-sm py-xs rounded border border-outline-variant focus:ring-1 focus:ring-secondary focus:border-secondary outline-none font-body-md text-body-md bg-surface-container-lowest h-24"
                  required
                />
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">Priority</label>
                <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none appearance-none"
                  >
                    <option value="LOW">Low (Minor issue)</option>
                    <option value="MEDIUM">Medium (Slowing productivity)</option>
                    <option value="HIGH">High (Stopped operations)</option>
                    <option value="CRITICAL">Critical (Safety risk/Severe failure)</option>
                  </select>
                  <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-[#1e293b] text-white font-label-md text-label-md rounded flex items-center justify-center transition-all shadow-sm mt-lg"
              >
                Log Report
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE PROGRESS */}
      {updateModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-outline-variant p-lg rounded-lg shadow-lg relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-sm border-b border-outline-variant mb-md">
              <h3 className="font-headline-sm text-headline-sm text-primary">Update Ticket Progress</h3>
              <button
                onClick={() => setUpdateModalOpen(false)}
                className="text-outline hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] block">close</span>
              </button>
            </div>

            {error && (
              <div className="mb-md p-sm bg-error/10 border border-error/20 rounded text-error font-body-sm text-body-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateSubmit} className="space-y-md">
              <div className="p-sm bg-surface-container-low border border-outline-variant rounded space-y-xs">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Asset: <span className="font-bold text-primary">{selectedTicket.asset.name}</span>
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Issue: <span className="text-primary italic font-bold">"{selectedTicket.issue}"</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">Workflow Status *</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none appearance-none"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approve Request</option>
                      <option value="TECHNICIAN_ASSIGNED">Assign Tech</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Mark Completed</option>
                      <option value="CLOSED">Close Ticket</option>
                      <option value="REJECTED">Reject / Cancel</option>
                    </select>
                    <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">Assign Technician</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <select
                      value={assignedToId}
                      onChange={(e) => setAssignedToId(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none appearance-none"
                    >
                      <option value="">Unassigned</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">Maintenance Cost (INR)</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="number"
                      step="0.01"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/50 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">Remarks</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Material replacements..."
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/50 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">Transition Status Notes *</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Diagnostic complete. Part ordered."
                  className="w-full px-sm py-xs rounded border border-outline-variant focus:ring-1 focus:ring-secondary focus:border-secondary outline-none font-body-md text-body-md bg-surface-container-lowest h-16"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-[#1e293b] text-white font-label-md text-label-md rounded flex items-center justify-center transition-all shadow-sm mt-lg"
              >
                Update Ticket
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
