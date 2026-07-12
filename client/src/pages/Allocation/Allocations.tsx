import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import type { Asset, Employee, Department } from "../../types";

interface Allocation {
  id: number;
  assetId: number;
  employeeId: number;
  allocationDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  conditionBefore: string;
  conditionAfter?: string;
  status: "ACTIVE" | "RETURNED";
  notes?: string;
  asset: Asset;
  employee: Employee;
  allocatedBy: { name: string };
}

interface Transfer {
  id: number;
  assetId: number;
  employeeId: number;
  fromDepartmentId: number;
  toDepartmentId: number;
  status: "REQUESTED" | "APPROVED_BY_HOD" | "TRANSFERRED" | "REJECTED";
  remarks?: string;
  createdAt: string;
  asset: Asset;
  employee: Employee;
}

export const Allocations: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"allocations" | "transfers">("allocations");
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [allocModalOpen, setAllocModalOpen] = useState<boolean>(false);
  const [returnModalOpen, setReturnModalOpen] = useState<boolean>(false);
  const [transferModalOpen, setTransferModalOpen] = useState<boolean>(false);

  // Allocate Form
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [expectedReturnDate, setExpectedReturnDate] = useState<string>("");
  const [conditionBefore, setConditionBefore] = useState<string>("NEW");
  const [allocNotes, setAllocNotes] = useState<string>("");

  // Return Form
  const [selectedAlloc, setSelectedAlloc] = useState<Allocation | null>(null);
  const [conditionAfter, setConditionAfter] = useState<string>("GOOD");
  const [returnNotes, setReturnNotes] = useState<string>("");

  // Transfer Form
  const [transferAssetId, setTransferAssetId] = useState<string>("");
  const [toDepartmentId, setToDepartmentId] = useState<string>("");
  const [transferRemarks, setTransferRemarks] = useState<string>("");

  const isManagerOrAdmin = user?.role === "Admin" || user?.role === "Asset Manager";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [histRes, assetsRes, empRes, deptRes] = await Promise.all([
        api.get("/allocation-history"),
        api.get("/assets"),
        api.get("/employees"),
        api.get("/departments"),
      ]);
      setAllocations(histRes.data.allocations || []);
      setTransfers(histRes.data.transfers || []);
      setAssets((assetsRes.data || []).filter((a: Asset) => a.status === "AVAILABLE"));
      setAllAssets(assetsRes.data || []);
      setEmployees((empRes.data || []).filter((e: Employee) => e.status === "ACTIVE"));
      setDepartments((deptRes.data || []).filter((d: Department) => d.status === "ACTIVE"));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAllocate = () => {
    setSelectedAssetId("");
    setSelectedEmployeeId("");
    setExpectedReturnDate("");
    setConditionBefore("NEW");
    setAllocNotes("");
    setError(null);
    setAllocModalOpen(true);
  };

  const handleAllocateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !selectedEmployeeId || !conditionBefore) {
      setError("Please select asset, employee and condition");
      return;
    }

    try {
      await api.post("/allocate", {
        assetId: parseInt(selectedAssetId, 10),
        employeeId: parseInt(selectedEmployeeId, 10),
        expectedReturnDate: expectedReturnDate || null,
        conditionBefore,
        notes: allocNotes,
      });
      setAllocModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Allocation failed");
    }
  };

  const handleOpenReturn = (alloc: Allocation) => {
    setSelectedAlloc(alloc);
    setConditionAfter(alloc.conditionBefore);
    setReturnNotes("");
    setError(null);
    setReturnModalOpen(true);
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlloc) return;

    try {
      await api.post("/return", {
        allocationId: selectedAlloc.id,
        conditionAfter,
        notes: returnNotes,
      });
      setReturnModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Return failed");
    }
  };

  const handleOpenTransfer = () => {
    setTransferAssetId("");
    setToDepartmentId("");
    setTransferRemarks("");
    setError(null);
    setTransferModalOpen(true);
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAssetId || !toDepartmentId) {
      setError("Asset and target department are required");
      return;
    }

    try {
      await api.post("/transfer", {
        assetId: parseInt(transferAssetId, 10),
        toDepartmentId: parseInt(toDepartmentId, 10),
        remarks: transferRemarks,
      });
      setTransferModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Transfer request failed");
    }
  };

  const handleHODApprove = async (id: number) => {
    try {
      await api.put(`/transfer/${id}/approve-hod`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "HOD approval failed");
    }
  };

  const handleManagerApprove = async (id: number) => {
    try {
      await api.put(`/transfer/${id}/approve-manager`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Manager approval failed");
    }
  };

  const handleReject = async (id: number) => {
    const reason = window.prompt("Enter rejection remarks:");
    if (reason === null) return;
    try {
      await api.put(`/transfer/${id}/reject`, { reason });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Rejection failed");
    }
  };

  return (
    <div className="space-y-lg animate-fade-in">
      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-md">
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
            Asset Allocation & Transfers
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Manage asset handovers, employee allocations, returns, and inter-department transfers
          </p>
        </div>
        <div className="flex items-center gap-sm">
          {activeTab === "allocations" && isManagerOrAdmin && (
            <button
              onClick={handleOpenAllocate}
              className="flex items-center gap-sm px-lg py-md rounded bg-primary text-white hover:bg-[#1e293b] font-label-md text-label-md transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Checkout Asset</span>
            </button>
          )}
          {activeTab === "transfers" && (
            <button
              onClick={handleOpenTransfer}
              className="flex items-center gap-sm px-lg py-md rounded bg-primary text-white hover:bg-[#1e293b] font-label-md text-label-md transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">sync_alt</span>
              <span>Request Transfer</span>
            </button>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-outline-variant gap-sm">
        <button
          onClick={() => setActiveTab("allocations")}
          className={`px-lg py-sm font-label-md text-label-md border-b-2 transition-all cursor-pointer ${
            activeTab === "allocations"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-on-surface-variant hover:text-primary"
          }`}
        >
          Active Allocations
        </button>
        <button
          onClick={() => setActiveTab("transfers")}
          className={`px-lg py-sm font-label-md text-label-md border-b-2 transition-all cursor-pointer ${
            activeTab === "transfers"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-on-surface-variant hover:text-primary"
          }`}
        >
          Department Transfers
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
            <span className="font-label-md text-label-md text-on-surface-variant">Loading data...</span>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-outline-variant rounded-md shadow-sm overflow-hidden">
          {/* TAB 1: ALLOCATIONS LIST */}
          {activeTab === "allocations" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-primary text-white font-label-md text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-md border-r border-white/10">Asset Details</th>
                    <th className="py-3 px-md border-r border-white/10">Allocated To</th>
                    <th className="py-3 px-md border-r border-white/10">Checkout Date</th>
                    <th className="py-3 px-md border-r border-white/10">Return Date (Expected)</th>
                    <th className="py-3 px-md border-r border-white/10">Assigned By</th>
                    <th className="py-3 px-md border-r border-white/10">Status</th>
                    <th className="py-3 px-md text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                  {allocations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-xl text-on-surface-variant">
                        No allocations registered.
                      </td>
                    </tr>
                  ) : (
                    allocations.map((alloc) => (
                      <tr
                        key={alloc.id}
                        className="text-on-surface hover:bg-secondary/10 transition-colors"
                      >
                        <td className="py-3 px-md font-bold text-primary">
                          <div className="flex items-center gap-sm">
                            <span className="material-symbols-outlined text-[20px]">laptop_mac</span>
                            <div>
                              <div>{alloc.asset.name}</div>
                              <span className="font-mono text-[9px] text-on-surface-variant font-bold">
                                {alloc.asset.assetTag}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-md">
                          <div className="flex items-center gap-sm">
                            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>
                            <div>
                              <div>{alloc.employee.name}</div>
                              <span className="text-[10px] text-on-surface-variant font-mono">
                                {alloc.employee.employeeCode}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-md font-mono">
                          {new Date(alloc.allocationDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-md font-mono text-on-surface-variant">
                          {alloc.expectedReturnDate
                            ? new Date(alloc.expectedReturnDate).toLocaleDateString()
                            : "No Deadline"}
                        </td>
                        <td className="py-3 px-md">{alloc.allocatedBy.name}</td>
                        <td className="py-3 px-md">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                              alloc.status === "ACTIVE"
                                ? "bg-blue-500/10 text-blue-700 border-blue-500/20"
                                : "bg-outline-variant/30 text-on-surface-variant border-transparent"
                            }`}
                          >
                            {alloc.status}
                          </span>
                        </td>
                        <td className="py-3 px-md text-right">
                          {alloc.status === "ACTIVE" && isManagerOrAdmin && (
                            <button
                              onClick={() => handleOpenReturn(alloc)}
                              className="flex items-center justify-center gap-xs px-sm py-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 hover:bg-emerald-500 hover:text-white rounded text-[10px] font-bold ml-auto transition-all shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[12px]">assignment_return</span>
                              <span>Return Asset</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: TRANSFERS WORKFLOW */}
          {activeTab === "transfers" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-primary text-white font-label-md text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-md border-r border-white/10">Asset</th>
                    <th className="py-3 px-md border-r border-white/10">Initiated By</th>
                    <th className="py-3 px-md border-r border-white/10">Transfer Path</th>
                    <th className="py-3 px-md border-r border-white/10">Remarks</th>
                    <th className="py-3 px-md border-r border-white/10">Requested On</th>
                    <th className="py-3 px-md border-r border-white/10">Status</th>
                    <th className="py-3 px-md text-right">Approvals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                  {transfers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-xl text-on-surface-variant">
                        No department transfer requests registered.
                      </td>
                    </tr>
                  ) : (
                    transfers.map((trans) => {
                      const fromDept = departments.find((d) => d.id === trans.fromDepartmentId);
                      const toDept = departments.find((d) => d.id === trans.toDepartmentId);
                      return (
                        <tr
                          key={trans.id}
                          className="text-on-surface hover:bg-secondary/10 transition-colors"
                        >
                          <td className="py-3 px-md font-bold text-primary">
                            <div>
                              <div>{trans.asset.name}</div>
                              <span className="font-mono text-[9px] text-on-surface-variant font-bold">
                                {trans.asset.assetTag}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-md font-semibold">{trans.employee.name}</td>
                          <td className="py-3 px-md font-semibold">
                            <div className="flex items-center gap-xs">
                              <span>{fromDept?.name || "Loading"}</span>
                              <span className="material-symbols-outlined text-[14px] text-on-surface-variant">arrow_right_alt</span>
                              <span className="text-secondary">{toDept?.name || "Loading"}</span>
                            </div>
                          </td>
                          <td className="py-3 px-md max-w-xs truncate">{trans.remarks || "-"}</td>
                          <td className="py-3 px-md font-mono">
                            {new Date(trans.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-md">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                                trans.status === "TRANSFERRED"
                                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                                  : trans.status === "REJECTED"
                                    ? "bg-red-500/10 text-red-700 border-red-500/20"
                                    : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                              }`}
                            >
                              {trans.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="py-3 px-md text-right space-x-2 whitespace-nowrap">
                            {trans.status === "REQUESTED" && (
                              <div className="flex gap-xs justify-end">
                                <button
                                  onClick={() => handleHODApprove(trans.id)}
                                  className="flex items-center justify-center p-1 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500 hover:text-white rounded border border-emerald-500/20 transition-colors"
                                  title="Approve HOD Stage"
                                >
                                  <span className="material-symbols-outlined text-[16px] block">check</span>
                                </button>
                                <button
                                  onClick={() => handleReject(trans.id)}
                                  className="flex items-center justify-center p-1 bg-red-500/10 text-red-700 hover:bg-red-500 hover:text-white rounded border border-red-500/20 transition-colors"
                                  title="Reject Request"
                                >
                                  <span className="material-symbols-outlined text-[16px] block">close</span>
                                </button>
                              </div>
                            )}

                            {trans.status === "APPROVED_BY_HOD" && isManagerOrAdmin && (
                              <div className="flex gap-xs justify-end items-center">
                                <button
                                  onClick={() => handleManagerApprove(trans.id)}
                                  className="flex items-center gap-xs px-sm py-xs bg-blue-500/10 text-blue-700 hover:bg-blue-500 hover:text-white border border-blue-500/20 rounded text-[10px] font-bold transition-all shadow-sm"
                                  title="Approve Inventory Update"
                                >
                                  <span className="material-symbols-outlined text-[12px] block">verified</span>
                                  <span>Verify Transfer</span>
                                </button>
                                <button
                                  onClick={() => handleReject(trans.id)}
                                  className="flex items-center justify-center p-1 bg-red-500/10 text-red-700 hover:bg-red-500 hover:text-white rounded border border-red-500/20 transition-colors"
                                  title="Reject Request"
                                >
                                  <span className="material-symbols-outlined text-[16px] block">close</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CHECKOUT ASSET */}
      {allocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-outline-variant p-lg rounded-lg shadow-lg relative animate-fade-in">
            <div className="flex justify-between items-center pb-sm border-b border-outline-variant mb-md">
              <h3 className="font-headline-sm text-headline-sm text-primary">Checkout Equipment</h3>
              <button
                onClick={() => setAllocModalOpen(false)}
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

            <form onSubmit={handleAllocateSubmit} className="space-y-md">
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">Select Available Asset *</label>
                <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                  <select
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
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
                <label className="font-label-md text-label-md text-primary">Allocate To Employee *</label>
                <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none appearance-none"
                    required
                  >
                    <option value="">Choose Employee...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} [{emp.employeeCode}]
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">Expected Return Date</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="date"
                      value={expectedReturnDate}
                      onChange={(e) => setExpectedReturnDate(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">Condition Before Checkout *</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <select
                      value={conditionBefore}
                      onChange={(e) => setConditionBefore(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none appearance-none"
                    >
                      <option value="NEW">New</option>
                      <option value="GOOD">Good</option>
                      <option value="FAIR">Fair</option>
                    </select>
                    <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
                  </div>
                </div>
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">Checkout Notes</label>
                <textarea
                  value={allocNotes}
                  onChange={(e) => setAllocNotes(e.target.value)}
                  placeholder="Reason for allocation, serial verification..."
                  className="w-full px-sm py-xs rounded border border-outline-variant focus:ring-1 focus:ring-secondary focus:border-secondary outline-none font-body-md text-body-md bg-surface-container-lowest h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-[#1e293b] text-white font-label-md text-label-md rounded flex items-center justify-center transition-all shadow-sm mt-lg"
              >
                Checkout Asset
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RETURN ASSET */}
      {returnModalOpen && selectedAlloc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-outline-variant p-lg rounded-lg shadow-lg relative animate-fade-in">
            <div className="flex justify-between items-center pb-sm border-b border-outline-variant mb-md">
              <h3 className="font-headline-sm text-headline-sm text-primary">Receive Asset Return</h3>
              <button
                onClick={() => setReturnModalOpen(false)}
                className="text-outline hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] block">close</span>
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-md">
              <div className="p-sm bg-surface-container-low border border-outline-variant rounded">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Returning: <span className="font-bold text-primary">{selectedAlloc.asset.name}</span>
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                  Returned By: <span className="font-bold text-primary">{selectedAlloc.employee.name}</span>
                </p>
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">Condition After Return *</label>
                <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                  <select
                    value={conditionAfter}
                    onChange={(e) => setConditionAfter(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none appearance-none"
                  >
                    <option value="GOOD">Good (Restored/Available)</option>
                    <option value="FAIR">Fair (Needs slight cleanup)</option>
                    <option value="POOR">Poor (Needs maintenance check)</option>
                    <option value="DAMAGED">Damaged (Sends to Maintenance)</option>
                  </select>
                  <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
                </div>
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">Return Notes</label>
                <textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Status observations upon receipt..."
                  className="w-full px-sm py-xs rounded border border-outline-variant focus:ring-1 focus:ring-secondary focus:border-secondary outline-none font-body-md text-body-md bg-surface-container-lowest h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-[#1e293b] text-white font-label-md text-label-md rounded flex items-center justify-center transition-all shadow-sm mt-lg"
              >
                Log Return
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REQUEST TRANSFER */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-outline-variant p-lg rounded-lg shadow-lg relative animate-fade-in">
            <div className="flex justify-between items-center pb-sm border-b border-outline-variant mb-md">
              <h3 className="font-headline-sm text-headline-sm text-primary">Request Department Transfer</h3>
              <button
                onClick={() => setTransferModalOpen(false)}
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

            <form onSubmit={handleTransferSubmit} className="space-y-md">
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">Select Allocated Asset *</label>
                <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                  <select
                    value={transferAssetId}
                    onChange={(e) => setTransferAssetId(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none appearance-none"
                    required
                  >
                    <option value="">Choose Asset...</option>
                    {allAssets.filter((a) => a.departmentId !== null).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} [{a.assetTag}]
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
                </div>
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">Target Department *</label>
                <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                  <select
                    value={toDepartmentId}
                    onChange={(e) => setToDepartmentId(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none appearance-none"
                    required
                  >
                    <option value="">Select Destination...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
                </div>
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">Transfer Reasons / Remarks</label>
                <textarea
                  value={transferRemarks}
                  onChange={(e) => setTransferRemarks(e.target.value)}
                  placeholder="Explain why the asset is moving..."
                  className="w-full px-sm py-xs rounded border border-outline-variant focus:ring-1 focus:ring-secondary focus:border-secondary outline-none font-body-md text-body-md bg-surface-container-lowest h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-[#1e293b] text-white font-label-md text-label-md rounded flex items-center justify-center transition-all shadow-sm mt-lg"
              >
                Submit Transfer Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
