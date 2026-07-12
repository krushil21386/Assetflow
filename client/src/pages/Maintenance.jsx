import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Plus, X } from "lucide-react";

export const Maintenance = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [error, setError] = useState(null);

  // Create Form
  const [assetId, setAssetId] = useState("");
  const [issue, setIssue] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

  // Update Form
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [status, setStatus] = useState("PENDING");
  const [assignedToId, setAssignedToId] = useState("");
  const [cost, setCost] = useState("");
  const [remarks, setRemarks] = useState("");
  const [notes, setNotes] = useState("");

  const isManagerOrAdmin =
    user?.role === "Admin" || user?.role === "Asset Manager";

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
      setTickets(maintRes.data);
      setAssets(assetsRes.data);
      setEmployees(empRes.data.filter((e) => e.status === "ACTIVE"));
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

  const handleCreateSubmit = async (e) => {
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
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit ticket");
    }
  };

  const handleOpenUpdate = (ticket) => {
    setSelectedTicket(ticket);
    setStatus(ticket.status);
    setAssignedToId(ticket.assignedToId ? String(ticket.assignedToId) : "");
    setCost(String(ticket.cost));
    setRemarks(ticket.remarks || "");
    setNotes("");
    setError(null);
    setUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
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
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update ticket");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-navy tracking-wider ">
            Maintenance Tickets
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Report asset faults, monitor repairs, assign technical personnel,
            and audit costs
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-navy font-semibold text-xs bg-navy text-white hover:bg-navy-hover"
        >
          <Plus size={16} />
          <span>Report Fault</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500 mr-2"></div>
          <span>Loading maintenance logs...</span>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-semibold bg-gray-50">
                  <th className="py-4 px-6">Ticket / Asset</th>
                  <th className="py-4 px-6">Issue Fault</th>
                  <th className="py-4 px-6">Priority</th>
                  <th className="py-4 px-6">Reported By</th>
                  <th className="py-4 px-6">Technician Assigned</th>
                  <th className="py-4 px-6">Cost (₹)</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      No reported maintenance logs.
                    </td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr
                      key={t.id}
                      className="text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6 font-bold text-navy">
                        <div>{t.asset.name}</div>
                        <span className="font-mono text-[9px] text-gray-500 font-normal">
                          {t.asset.assetTag}
                        </span>
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate">{t.issue}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            t.priority === "CRITICAL"
                              ? "bg-red-500/10 text-red-500 border-red-500/20"
                              : t.priority === "HIGH"
                                ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                : t.priority === "MEDIUM"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6">{t.requestedBy.name}</td>
                      <td className="py-4 px-6">
                        {t.assignedTo?.name || "Unassigned"}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold">
                        ₹{t.cost.toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            t.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : t.status === "CLOSED"
                                ? "bg-gray-500/10 text-gray-500 border-gray-500/20"
                                : t.status === "REJECTED"
                                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                                  : "bg-brand-500/10 text-brand-400 border-brand-500/20"
                          }`}
                        >
                          {t.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isManagerOrAdmin && (
                          <button
                            onClick={() => handleOpenUpdate(t)}
                            className="px-2.5 py-1.5 bg-brand-500/10 hover:bg-brand-500 text-brand-400 hover:text-navy border border-brand-500/20 rounded-lg text-[10px] font-semibold transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-gray-200 p-6 rounded-3xl border border-gray-200 shadow-2xl relative animate-fade-in">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
              <h3 className="text-base font-bold text-navy">
                Log Fault Report
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-navy"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-700 font-semibold">
                  Select Faulty Asset *
                </label>
                <select
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none"
                  required
                >
                  <option value="">Choose Asset...</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id} className="bg-surface-bg">
                      {a.name} [{a.assetTag}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-700 font-semibold">
                  Fault Issue Details *
                </label>
                <textarea
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="Describe screen flickers, ignition faults, body cracks..."
                  className="w-full px-4 py-2 rounded-xl bg-white border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none h-24"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-700 font-semibold">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none"
                >
                  <option value="LOW" className="bg-surface-bg">
                    Low (Minor issue)
                  </option>
                  <option value="MEDIUM" className="bg-surface-bg">
                    Medium (Slowing productivity)
                  </option>
                  <option value="HIGH" className="bg-surface-bg">
                    High (Stopped operations)
                  </option>
                  <option value="CRITICAL" className="bg-surface-bg">
                    Critical (Safety risk/Severe failure)
                  </option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-navy bg-navy text-white hover:bg-navy-hover text-sm transition-all mt-6"
              >
                Log Report
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE PROGRESS */}
      {updateModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-gray-200 p-6 rounded-3xl border border-gray-200 shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
              <h3 className="text-base font-bold text-navy">
                Update Ticket Progress
              </h3>
              <button
                onClick={() => setUpdateModalOpen(false)}
                className="text-gray-500 hover:text-navy"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-gray-50 border border-white/5 rounded-xl space-y-1">
                <p className="text-gray-500">
                  Asset:{" "}
                  <span className="font-bold text-navy">
                    {selectedTicket.asset.name}
                  </span>
                </p>
                <p className="text-gray-500">
                  Issue:{" "}
                  <span className="text-navy italic">
                    {selectedTicket.issue}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-700 font-semibold">
                    Workflow Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none"
                  >
                    <option value="PENDING" className="bg-surface-bg">
                      Pending
                    </option>
                    <option value="APPROVED" className="bg-surface-bg">
                      Approve Request
                    </option>
                    <option
                      value="TECHNICIAN_ASSIGNED"
                      className="bg-surface-bg"
                    >
                      Assign Tech
                    </option>
                    <option value="IN_PROGRESS" className="bg-surface-bg">
                      In Progress
                    </option>
                    <option value="COMPLETED" className="bg-surface-bg">
                      Mark Completed
                    </option>
                    <option value="CLOSED" className="bg-surface-bg">
                      Close Ticket
                    </option>
                    <option value="REJECTED" className="bg-surface-bg">
                      Reject / Cancel
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-700 font-semibold">
                    Assign Technician
                  </label>
                  <select
                    value={assignedToId}
                    onChange={(e) => setAssignedToId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none"
                  >
                    <option value="">Unassigned</option>
                    {employees.map((emp) => (
                      <option
                        key={emp.id}
                        value={emp.id}
                        className="bg-surface-bg"
                      >
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-700 font-semibold">
                    Maintenance Cost (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-700 font-semibold">Remarks</label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Material replacements..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-700 font-semibold">
                  Transition Status Notes (History log) *
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Diagnostic complete. Part ordered."
                  className="w-full px-4 py-2 rounded-xl bg-white border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none h-16"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-navy bg-navy text-white hover:bg-navy-hover text-sm transition-all mt-6"
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
