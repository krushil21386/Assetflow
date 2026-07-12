import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Plus, Spinner } from "phosphor-react";

import type { Asset, Employee, Department } from "../../types";

interface AuditDetail {
  id: number;
  assetId: number;
  verificationStatus: "PENDING" | "VERIFIED" | "MISSING" | "DAMAGED" | "DISPOSED";
  notes?: string;
  verifiedAt?: string;
  asset: Asset & { category: { name: string } };
}

interface AuditCycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  auditorId: number;
  departmentId?: number;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED";
  auditor: Employee;
  department?: Department;
  details?: AuditDetail[];
}

export const Auditing: React.FC = () => {

  const [cycles, setCycles] = useState<AuditCycle[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState<boolean>(false);
  const [activeCycle, setActiveCycle] = useState<AuditCycle | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Create Form State
  const [name, setName] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [auditorId, setAuditorId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");

  // Verify Form State
  const [selectedDetail, setSelectedDetail] = useState<AuditDetail | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>("VERIFIED");
  const [verifyNotes, setVerifyNotes] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cycleRes, empRes, deptRes] = await Promise.all([
        api.get("/audit"),
        api.get("/employees"),
        api.get("/departments"),
      ]);
      setCycles(cycleRes.data || []);
      setEmployees((empRes.data || []).filter((e: Employee) => e.status === "ACTIVE"));
      setDepartments((deptRes.data || []).filter((d: Department) => d.status === "ACTIVE"));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setName(
      `Quarterly Audit - ${new Date().toLocaleString("en-US", { month: "short" })} ${new Date().getFullYear()}`
    );
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate(
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    ); // 2 weeks out
    setAuditorId(employees[0]?.id ? String(employees[0].id) : "");
    setDepartmentId("");
    setError(null);
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate || !auditorId) {
      setError("Please fill in required fields");
      return;
    }

    try {
      await api.post("/audit", {
        name,
        startDate,
        endDate,
        auditorId: parseInt(auditorId, 10),
        departmentId: departmentId ? parseInt(departmentId, 10) : null,
      });
      setCreateModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create audit cycle");
    }
  };

  const handleOpenVerify = (detail: AuditDetail, cycle: AuditCycle) => {
    setActiveCycle(cycle);
    setSelectedDetail(detail);
    setVerificationStatus(
      detail.verificationStatus === "PENDING" ? "VERIFIED" : detail.verificationStatus
    );
    setVerifyNotes(detail.notes || "");
    setError(null);
    setVerifyModalOpen(true);
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDetail || !activeCycle) return;

    try {
      await api.put(`/audit/${activeCycle.id}/verify`, {
        assetId: selectedDetail.asset.id,
        verificationStatus,
        notes: verifyNotes,
      });
      setVerifyModalOpen(false);
      handleOpenCycleDetail(activeCycle.id);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
    }
  };

  const handleOpenCycleDetail = async (id: number) => {
    try {
      const res = await api.get(`/audit/${id}`);
      setCycles((prev) => prev.map((c) => (c.id === id ? res.data : c)));
      setActiveCycle(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartCycle = async (id: number) => {
    try {
      await api.put(`/audit/${id}`, { status: "IN_PROGRESS" });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteCycle = async (id: number) => {
    try {
      await api.put(`/audit/${id}`, { status: "COMPLETED" });
      fetchData();
      if (activeCycle?.id === id) {
        setActiveCycle(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-lg animate-fade-in">
      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-md">
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
            Periodic Audits
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Schedule equipment inspections, assign auditors, and run verification audits
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="group flex items-center gap-sm px-lg py-md rounded bg-primary text-white hover:bg-[#1e293b] font-label-md text-label-md transition-all shadow-sm active:scale-95"
        >
          <Plus size={18} weight="bold" className="group-hover:animate-icon-hover-rotate" />
          <span>New Audit Cycle</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <Spinner size={48} className="text-primary animate-icon-spin" weight="bold" />
            <span className="font-label-md text-label-md text-on-surface-variant">Loading audit schedules...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* List of Audit Cycles (1 Column) */}
          <div className="space-y-md">
            <h3 className="font-title-sm text-title-sm font-bold text-primary">Audit History</h3>
            <div className="space-y-sm">
              {cycles.length === 0 ? (
                <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-md bg-white border border-outline-variant rounded-md shadow-sm">
                  No audit cycles drafted.
                </p>
              ) : (
                cycles.map((cycle) => {
                  const isCurrentActive = activeCycle?.id === cycle.id;
                  return (
                    <div
                      key={cycle.id}
                      onClick={() => handleOpenCycleDetail(cycle.id)}
                      className={`p-md rounded-md border transition-all cursor-pointer ${
                        isCurrentActive
                          ? "bg-secondary/10 border-primary ring-2 ring-primary/10"
                          : "bg-white border border-outline-variant shadow-sm hover:border-primary/20"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-primary text-xs">{cycle.name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wider ${
                            cycle.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                              : cycle.status === "IN_PROGRESS"
                                ? "bg-blue-500/10 text-blue-700 border-blue-500/20"
                                : "bg-outline-variant/30 text-on-surface-variant border-transparent"
                          }`}
                        >
                          {cycle.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-sm font-bold">
                        Auditor: {cycle.auditor.name}
                      </p>
                      <p className="text-[9px] text-on-surface-variant mt-xs font-mono font-bold">
                        {new Date(cycle.startDate).toLocaleDateString()} -{" "}
                        {new Date(cycle.endDate).toLocaleDateString()}
                      </p>

                      {/* Action buttons inside card */}
                      <div className="flex gap-sm mt-md pt-sm border-t border-outline-variant/50">
                        {cycle.status === "DRAFT" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartCycle(cycle.id);
                            }}
                            className="flex items-center gap-xs px-2.5 py-1 bg-blue-500/10 hover:bg-blue-550 hover:bg-blue-500 hover:text-white text-blue-700 rounded text-[9px] font-bold border border-blue-500/20 transition-all shadow-sm"
                          >
                            <span className="material-symbols-outlined text-[10px]">play_arrow</span>
                            <span>Start Audit</span>
                          </button>
                        )}
                        {cycle.status === "IN_PROGRESS" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompleteCycle(cycle.id);
                            }}
                            className="flex items-center gap-xs px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-700 rounded text-[9px] font-bold border border-emerald-500/20 transition-all shadow-sm"
                          >
                            <span className="material-symbols-outlined text-[10px]">check</span>
                            <span>Complete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Cycle details pane (2 Columns) */}
          <div className="lg:col-span-2 space-y-md">
            <h3 className="font-title-sm text-title-sm font-bold text-primary">Inspection Details</h3>
            {!activeCycle ? (
              <div className="bg-white border border-outline-variant p-xl rounded-lg text-center text-on-surface-variant flex flex-col items-center justify-center min-h-[300px]">
                <span className="material-symbols-outlined text-outline text-[48px] mb-sm">fact_check</span>
                <p className="font-body-sm text-body-sm max-w-sm">
                  Select an audit cycle from the list to view and record asset inspection statuses.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-outline-variant rounded-md shadow-sm overflow-hidden animate-fade-in">
                <div className="p-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center flex-wrap gap-sm">
                  <div>
                    <h3 className="font-title-sm text-title-sm font-bold text-primary">{activeCycle.name}</h3>
                    <p className="text-[10px] text-on-surface-variant mt-xs font-bold">
                      Auditor: {activeCycle.auditor.name} • Status:{" "}
                      <span className="font-bold text-secondary">{activeCycle.status}</span>
                    </p>
                  </div>
                  {activeCycle.status === "IN_PROGRESS" && (
                    <button
                      onClick={() => handleCompleteCycle(activeCycle.id)}
                      className="px-sm py-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 hover:bg-emerald-500 hover:text-white rounded text-[10px] font-bold transition-all shadow-sm"
                    >
                      Close Audit Cycle
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-primary text-white font-label-md text-[10px] uppercase tracking-wider">
                        <th className="py-3 px-md border-r border-white/10">Asset Tag</th>
                        <th className="py-3 px-md border-r border-white/10">Name / Category</th>
                        <th className="py-3 px-md border-r border-white/10">Inspection Status</th>
                        <th className="py-3 px-md border-r border-white/10">Notes</th>
                        <th className="py-3 px-md text-right">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                      {activeCycle.details?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-xl text-on-surface-variant">
                            No assets registered to verify in this audit scope.
                          </td>
                        </tr>
                      ) : (
                        activeCycle.details?.map((det) => (
                          <tr
                            key={det.id}
                            className="text-on-surface hover:bg-secondary/10 transition-colors"
                          >
                            <td className="py-3 px-md font-mono text-on-surface-variant font-bold">
                              {det.asset.assetTag}
                            </td>
                            <td className="py-3 px-md">
                              <div className="font-bold text-primary">{det.asset.name}</div>
                              <span className="text-[9px] text-on-surface-variant font-bold">
                                {det.asset.category?.name}
                              </span>
                            </td>
                            <td className="py-3 px-md">
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                                  det.verificationStatus === "VERIFIED"
                                    ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                                    : det.verificationStatus === "MISSING"
                                      ? "bg-red-500/10 text-red-700 border-red-500/20"
                                      : det.verificationStatus === "DAMAGED"
                                        ? "bg-orange-500/10 text-orange-700 border-orange-500/20"
                                        : det.verificationStatus === "DISPOSED"
                                          ? "bg-outline-variant/30 text-on-surface-variant border-transparent"
                                          : "bg-blue-500/10 text-blue-700 border-blue-500/20"
                                }`}
                              >
                                {det.verificationStatus}
                              </span>
                            </td>
                            <td className="py-3 px-md max-w-xs truncate">{det.notes || "-"}</td>
                            <td className="py-3 px-md text-right font-bold">
                              {activeCycle.status === "IN_PROGRESS" && (
                                <button
                                  onClick={() => handleOpenVerify(det, activeCycle)}
                                  className="px-sm py-xs bg-primary text-white hover:bg-[#1e293b] rounded text-[10px] font-bold transition-all shadow-sm active:scale-95"
                                >
                                  Inspect
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
          </div>
        </div>
      )}

      {/* CREATE CYCLE MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-outline-variant p-lg rounded-lg shadow-lg relative animate-fade-in">
            <div className="flex justify-between items-center pb-sm border-b border-outline-variant mb-md">
              <h3 className="font-headline-sm text-headline-sm text-primary">Create Audit Cycle</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
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
                <label className="font-label-md text-label-md text-primary">Audit Name *</label>
                <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">Start Date *</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">End Date *</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">Auditor *</label>
                <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                  <select
                    value={auditorId}
                    onChange={(e) => setAuditorId(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none appearance-none"
                    required
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
                </div>
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">Target Scope (Filter Department)</label>
                <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none appearance-none"
                  >
                    <option value="">Whole Company (All Assets)</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-[#1e293b] text-white font-label-md text-label-md rounded flex items-center justify-center transition-all shadow-sm mt-lg"
              >
                Draft Audit Cycle
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VERIFY ASSET MODAL */}
      {verifyModalOpen && selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-outline-variant p-lg rounded-lg shadow-lg relative animate-fade-in">
            <div className="flex justify-between items-center pb-sm border-b border-outline-variant mb-md">
              <h3 className="font-headline-sm text-headline-sm text-primary">Record Asset Inspection</h3>
              <button
                onClick={() => setVerifyModalOpen(false)}
                className="text-outline hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] block">close</span>
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-md">
              <div className="p-sm bg-surface-container-low border border-outline-variant rounded text-on-surface-variant">
                <p className="font-body-sm text-body-sm">
                  Asset: <span className="font-bold text-primary">{selectedDetail.asset.name}</span>
                </p>
                <p className="font-body-sm text-body-sm mt-xs">
                  Tag: <span className="font-mono text-primary font-bold">{selectedDetail.asset.assetTag}</span>
                </p>
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">Verification Outcome *</label>
                <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                  <select
                    value={verificationStatus}
                    onChange={(e) => setVerificationStatus(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none appearance-none"
                  >
                    <option value="VERIFIED">Verified (Operational/Available)</option>
                    <option value="DAMAGED">Damaged (Needs repair maintenance)</option>
                    <option value="MISSING">Missing (Mark as lost)</option>
                    <option value="DISPOSED">Disposed (Retire asset)</option>
                  </select>
                  <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
                </div>
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">Inspection Remarks / Observation Notes</label>
                <textarea
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="Note physical damage, room location mismatch..."
                  className="w-full px-sm py-xs rounded border border-outline-variant focus:ring-1 focus:ring-secondary focus:border-secondary outline-none font-body-md text-body-md bg-surface-container-lowest h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-[#1e293b] text-white font-label-md text-label-md rounded flex items-center justify-center transition-all shadow-sm mt-lg"
              >
                Save Inspection
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
