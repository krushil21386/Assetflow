import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeftRight,
  Plus,
  Check,
  X,
  Laptop,
  User,
  ChevronsRight,
  Sparkles,
  CornerDownLeft,
} from "lucide-react";

export const Allocations = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("allocations");
  const [allocations, setAllocations] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [allocModalOpen, setAllocModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  // Allocate Form
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [conditionBefore, setConditionBefore] = useState("NEW");
  const [allocNotes, setAllocNotes] = useState("");

  // Return Form
  const [selectedAlloc, setSelectedAlloc] = useState(null);
  const [conditionAfter, setConditionAfter] = useState("GOOD");
  const [returnNotes, setReturnNotes] = useState("");

  // Transfer Form
  const [transferAssetId, setTransferAssetId] = useState("");
  const [toDepartmentId, setToDepartmentId] = useState("");
  const [transferRemarks, setTransferRemarks] = useState("");

  const isManagerOrAdmin =
    user?.role === "Admin" || user?.role === "Asset Manager";

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
      setAllocations(histRes.data.allocations);
      setTransfers(histRes.data.transfers);
      setAssets(assetsRes.data.filter((a) => a.status === "AVAILABLE"));
      setEmployees(empRes.data.filter((e) => e.status === "ACTIVE"));
      setDepartments(deptRes.data.filter((d) => d.status === "ACTIVE"));
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

  const handleAllocateSubmit = async (e) => {
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
    } catch (err) {
      setError(err.response?.data?.message || "Allocation failed");
    }
  };

  const handleOpenReturn = (alloc) => {
    setSelectedAlloc(alloc);
    setConditionAfter(alloc.conditionBefore);
    setReturnNotes("");
    setError(null);
    setReturnModalOpen(true);
  };

  const handleReturnSubmit = async (e) => {
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
    } catch (err) {
      setError(err.response?.data?.message || "Return failed");
    }
  };

  const handleOpenTransfer = () => {
    // For transfer, select an asset that is currently allocated/under department ownership
    setTransferAssetId("");
    setToDepartmentId("");
    setTransferRemarks("");
    setError(null);
    setTransferModalOpen(true);
  };

  const handleTransferSubmit = async (e) => {
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
    } catch (err) {
      setError(err.response?.data?.message || "Transfer request failed");
    }
  };

  const handleHODApprove = async (id) => {
    try {
      await api.put(`/transfer/${id}/approve-hod`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "HOD approval failed");
    }
  };

  const handleManagerApprove = async (id) => {
    try {
      await api.put(`/transfer/${id}/approve-manager`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Manager approval failed");
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Enter rejection remarks:");
    if (reason === null) return;
    try {
      await api.put(`/transfer/${id}/reject`, { reason });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Rejection failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy tracking-wider ">
            Asset Allocation & Transfers
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage asset handovers, employee allocations, returns, and
            inter-department transfers
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "allocations" && isManagerOrAdmin && (
            <button
              onClick={handleOpenAllocate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-navy font-semibold text-xs bg-navy text-white hover:bg-navy-hover"
            >
              <Plus size={16} />
              <span>Checkout Asset</span>
            </button>
          )}
          {activeTab === "transfers" && (
            <button
              onClick={handleOpenTransfer}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-navy font-semibold text-xs bg-navy text-white hover:bg-navy-hover"
            >
              <ArrowLeftRight size={16} />
              <span>Request Transfer</span>
            </button>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-gray-200 gap-2">
        <button
          onClick={() => setActiveTab("allocations")}
          className={`px-6 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "allocations"
              ? "border-brand-500 text-navy font-bold"
              : "border-transparent text-gray-500 hover:text-navy"
          }`}
        >
          Active Allocations
        </button>
        <button
          onClick={() => setActiveTab("transfers")}
          className={`px-6 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "transfers"
              ? "border-brand-500 text-navy font-bold"
              : "border-transparent text-gray-500 hover:text-navy"
          }`}
        >
          Department Transfers
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500 mr-2"></div>
          <span>Loading data...</span>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden border border-gray-200">
          {/* TAB 1: ALLOCATIONS LIST */}
          {activeTab === "allocations" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-semibold bg-gray-50">
                    <th className="py-4 px-6">Asset Details</th>
                    <th className="py-4 px-6">Allocated To</th>
                    <th className="py-4 px-6">Checkout Date</th>
                    <th className="py-4 px-6">Return Date (Expected)</th>
                    <th className="py-4 px-6">Assigned By</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {allocations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-8 text-gray-500"
                      >
                        No allocations registered.
                      </td>
                    </tr>
                  ) : (
                    allocations.map((alloc) => (
                      <tr
                        key={alloc.id}
                        className="text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6 font-bold text-navy">
                          <div className="flex items-center gap-2">
                            <Laptop size={16} className="text-brand-400" />
                            <div>
                              <div>{alloc.asset.name}</div>
                              <span className="font-mono text-[9px] text-gray-500 font-normal">
                                {alloc.asset.assetTag}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-gray-500" />
                            <div>
                              <div>{alloc.employee.name}</div>
                              <span className="text-[10px] text-gray-500 font-mono">
                                {alloc.employee.employeeCode}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono">
                          {new Date(alloc.allocationDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 font-mono text-gray-500">
                          {alloc.expectedReturnDate
                            ? new Date(
                                alloc.expectedReturnDate,
                              ).toLocaleDateString()
                            : "No Deadline"}
                        </td>
                        <td className="py-4 px-6">{alloc.allocatedBy.name}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              alloc.status === "ACTIVE"
                                ? "bg-brand-500/10 text-brand-400 border-brand-500/20"
                                : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                            }`}
                          >
                            {alloc.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {alloc.status === "ACTIVE" && isManagerOrAdmin && (
                            <button
                              onClick={() => handleOpenReturn(alloc)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 hover:bg-brand-500 text-navy rounded-lg text-[10px] font-semibold ml-auto transition-all"
                            >
                              <CornerDownLeft size={12} />
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
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-semibold bg-gray-50">
                    <th className="py-4 px-6">Asset</th>
                    <th className="py-4 px-6">Initiated By</th>
                    <th className="py-4 px-6">Transfer Path</th>
                    <th className="py-4 px-6">Remarks</th>
                    <th className="py-4 px-6">Requested On</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Approvals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {transfers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-8 text-gray-500"
                      >
                        No department transfer requests registered.
                      </td>
                    </tr>
                  ) : (
                    transfers.map((trans) => {
                      const fromDept = departments.find(
                        (d) => d.id === trans.fromDepartmentId,
                      );
                      const toDept = departments.find(
                        (d) => d.id === trans.toDepartmentId,
                      );
                      return (
                        <tr
                          key={trans.id}
                          className="text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-6 font-bold text-navy">
                            <div>
                              <div>{trans.asset.name}</div>
                              <span className="font-mono text-[9px] text-gray-500 font-normal">
                                {trans.asset.assetTag}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-semibold">
                            {trans.employee.name}
                          </td>
                          <td className="py-4 px-6 font-semibold">
                            <div className="flex items-center gap-2">
                              <span>{fromDept?.name || "Loading"}</span>
                              <ChevronsRight
                                size={14}
                                className="text-gray-500"
                              />
                              <span className="text-brand-400">
                                {toDept?.name || "Loading"}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 max-w-xs truncate">
                            {trans.remarks || "-"}
                          </td>
                          <td className="py-4 px-6 font-mono">
                            {new Date(trans.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                trans.status === "TRANSFERRED"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : trans.status === "REJECTED"
                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              }`}
                            >
                              {trans.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                            {/* HOD Approval Button: visible to Head of Source Department or Admin */}
                            {trans.status === "REQUESTED" && (
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleHODApprove(trans.id)}
                                  className="flex items-center justify-center p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-navy rounded-lg transition-colors border border-emerald-500/20"
                                  title="Approve HOD Stage"
                                >
                                  <Check size={12} />
                                </button>
                                <button
                                  onClick={() => handleReject(trans.id)}
                                  className="flex items-center justify-center p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-navy rounded-lg transition-colors border border-red-500/20"
                                  title="Reject Request"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            )}

                            {/* Manager Approval Stage: visible to Asset Manager or Admin */}
                            {trans.status === "APPROVED_BY_HOD" &&
                              isManagerOrAdmin && (
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() =>
                                      handleManagerApprove(trans.id)
                                    }
                                    className="flex items-center gap-1 px-2.5 py-1 bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-navy border border-brand-500/20 rounded-lg text-[10px] font-bold transition-all"
                                    title="Approve Inventory Update"
                                  >
                                    <Sparkles size={11} />
                                    <span>Verify Transfer</span>
                                  </button>
                                  <button
                                    onClick={() => handleReject(trans.id)}
                                    className="flex items-center justify-center p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-navy rounded-lg transition-colors border border-red-500/20"
                                    title="Reject Request"
                                  >
                                    <X size={12} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-gray-200 p-6 rounded-3xl border border-gray-200 shadow-2xl relative animate-fade-in">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
              <h3 className="text-base font-bold text-navy">
                Checkout Equipment
              </h3>
              <button
                onClick={() => setAllocModalOpen(false)}
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

            <form onSubmit={handleAllocateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-700 font-semibold">
                  Select Available Asset *
                </label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
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
                  Allocate To Employee *
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none"
                  required
                >
                  <option value="">Choose Employee...</option>
                  {employees.map((emp) => (
                    <option
                      key={emp.id}
                      value={emp.id}
                      className="bg-surface-bg"
                    >
                      {emp.name} [{emp.employeeCode}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-700 font-semibold">
                    Expected Return Date
                  </label>
                  <input
                    type="date"
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-700 font-semibold">
                    Condition Before Checkout *
                  </label>
                  <select
                    value={conditionBefore}
                    onChange={(e) => setConditionBefore(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none"
                  >
                    <option value="NEW" className="bg-surface-bg">
                      New
                    </option>
                    <option value="GOOD" className="bg-surface-bg">
                      Good
                    </option>
                    <option value="FAIR" className="bg-surface-bg">
                      Fair
                    </option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-700 font-semibold">
                  Checkout Notes
                </label>
                <textarea
                  value={allocNotes}
                  onChange={(e) => setAllocNotes(e.target.value)}
                  placeholder="Reason for allocation, serial verification..."
                  className="w-full px-4 py-2 rounded-xl bg-white border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-navy bg-navy text-white hover:bg-navy-hover text-sm transition-all mt-6"
              >
                Checkout Asset
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RETURN ASSET */}
      {returnModalOpen && selectedAlloc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-gray-200 p-6 rounded-3xl border border-gray-200 shadow-2xl relative animate-fade-in">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
              <h3 className="text-base font-bold text-navy">
                Receive Asset Return
              </h3>
              <button
                onClick={() => setReturnModalOpen(false)}
                className="text-gray-500 hover:text-navy"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-gray-50 border border-white/5 rounded-xl">
                <p className="text-gray-500">
                  Returning:{" "}
                  <span className="font-bold text-navy">
                    {selectedAlloc.asset.name}
                  </span>
                </p>
                <p className="text-gray-500 mt-1">
                  Returned By:{" "}
                  <span className="font-semibold text-navy">
                    {selectedAlloc.employee.name}
                  </span>
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-gray-700 font-semibold">
                  Condition After Return *
                </label>
                <select
                  value={conditionAfter}
                  onChange={(e) => setConditionAfter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none"
                >
                  <option value="GOOD" className="bg-surface-bg">
                    Good (Restored/Available)
                  </option>
                  <option value="FAIR" className="bg-surface-bg">
                    Fair (Needs slight cleanup)
                  </option>
                  <option value="POOR" className="bg-surface-bg">
                    Poor (Needs maintenance check)
                  </option>
                  <option value="DAMAGED" className="bg-surface-bg">
                    Damaged (Sends to Maintenance)
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-700 font-semibold">
                  Return Notes
                </label>
                <textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Status observations upon receipt..."
                  className="w-full px-4 py-2 rounded-xl bg-white border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-navy bg-navy text-white hover:bg-navy-hover text-sm transition-all mt-6"
              >
                Log Return
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REQUEST TRANSFER */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-gray-200 p-6 rounded-3xl border border-gray-200 shadow-2xl relative animate-fade-in">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
              <h3 className="text-base font-bold text-navy">
                Request Department Transfer
              </h3>
              <button
                onClick={() => setTransferModalOpen(false)}
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

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-700 font-semibold">
                  Select Allocated Asset *
                </label>
                <select
                  value={transferAssetId}
                  onChange={(e) => setTransferAssetId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none"
                  required
                >
                  <option value="">Choose Asset...</option>
                  {/* Select allocated assets or assets belonging to department */}
                  {assets.length === 0 ? (
                    // If no available assets, let's load everything or let them input
                    <option disabled>No items available to transfer</option>
                  ) : null}
                  {/* We can fetch assets with active department ownership */}
                  {/* For simple demonstration, let them choose any asset */}
                  {/* Let's show all registered assets so they can request transfers */}
                  {assets.map((a) => (
                    <option key={a.id} value={a.id} className="bg-surface-bg">
                      {a.name} [{a.assetTag}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-700 font-semibold">
                  Target Department *
                </label>
                <select
                  value={toDepartmentId}
                  onChange={(e) => setToDepartmentId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none"
                  required
                >
                  <option value="">Select Destination...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id} className="bg-surface-bg">
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-700 font-semibold">
                  Transfer Reasons / Remarks
                </label>
                <textarea
                  value={transferRemarks}
                  onChange={(e) => setTransferRemarks(e.target.value)}
                  placeholder="Explain why the asset is moving..."
                  className="w-full px-4 py-2 rounded-xl bg-white border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-navy bg-navy text-white hover:bg-navy-hover text-sm transition-all mt-6"
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
