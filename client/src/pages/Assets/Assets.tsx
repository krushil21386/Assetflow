import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import type { Asset, AssetCategory, Department } from "../../types";

interface AssetWithRelations extends Omit<Asset, "images"> {
  category?: AssetCategory;
  department?: Department;
  images?: Array<{ id: number; imagePath: string }>;
  allocations?: Array<{
    id: number;
    status: string;
    employee: { id: number; name: string };
  }>;
}

export const Assets: React.FC = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<AssetWithRelations[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [search, setSearch] = useState<string>("");
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [assetTag, setAssetTag] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [serialNumber, setSerialNumber] = useState<string>("");
  const [purchaseDate, setPurchaseDate] = useState<string>("");
  const [purchaseCost, setPurchaseCost] = useState<string>("");
  const [vendor, setVendor] = useState<string>("");
  const [warrantyEndDate, setWarrantyEndDate] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [condition, setCondition] = useState<"NEW" | "USED" | "REFURBISHED" | "DAMAGED">("NEW");
  const [remarks, setRemarks] = useState<string>("");
  const [status, setStatus] = useState<"AVAILABLE" | "ALLOCATED" | "MAINTENANCE" | "DAMAGED">("AVAILABLE");
  const [images, setImages] = useState<FileList | null>(null);

  const isManagerOrAdmin = user?.role === "Admin" || user?.role === "Asset Manager";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetRes, catRes, deptRes] = await Promise.all([
        api.get("/assets"),
        api.get("/categories"),
        api.get("/departments"),
      ]);
      setAssets(assetRes.data);
      setCategories(catRes.data);
      setDepartments(deptRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setAssetTag("");
    setName("");
    setCategoryId("");
    setBrand("");
    setModel("");
    setSerialNumber("");
    setPurchaseDate(new Date().toISOString().split("T")[0]);
    setPurchaseCost("");
    setVendor("");
    setWarrantyEndDate("");
    setLocation("");
    setDepartmentId("");
    setCondition("NEW");
    setRemarks("");
    setStatus("AVAILABLE");
    setImages(null);
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (asset: AssetWithRelations) => {
    setEditingId(asset.id);
    setAssetTag(asset.assetTag);
    setName(asset.name);
    setCategoryId(asset.categoryId ? String(asset.categoryId) : "");
    setBrand(asset.brand || "");
    setModel(asset.model || "");
    setSerialNumber(asset.serialNumber || "");
    setPurchaseDate(new Date(asset.purchaseDate).toISOString().split("T")[0]);
    setPurchaseCost(String(asset.purchaseCost));
    setVendor(asset.vendor || "");
    setWarrantyEndDate(asset.warrantyEndDate ? new Date(asset.warrantyEndDate).toISOString().split("T")[0] : "");
    setLocation(asset.location || "");
    setDepartmentId(asset.departmentId ? String(asset.departmentId) : "");
    setCondition(asset.condition as any);
    setRemarks(asset.remarks || "");
    setStatus(asset.status as any);
    setImages(null);
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId || !purchaseDate || !purchaseCost) {
      setError("Please fill in all required fields");
      return;
    }

    const formData = new FormData();
    if (editingId) formData.append("assetTag", assetTag); // only send on edit
    formData.append("name", name);
    formData.append("categoryId", categoryId);
    formData.append("brand", brand);
    formData.append("model", model);
    formData.append("serialNumber", serialNumber);
    formData.append("purchaseDate", purchaseDate);
    formData.append("purchaseCost", purchaseCost);
    formData.append("vendor", vendor);
    formData.append("warrantyEndDate", warrantyEndDate);
    formData.append("location", location);
    formData.append("departmentId", departmentId);
    formData.append("condition", condition);
    formData.append("remarks", remarks);
    formData.append("status", status);

    if (images) {
      for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i]);
      }
    }

    try {
      if (editingId) {
        await api.put(`/assets/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/assets", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Action failed.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    try {
      await api.delete(`/assets/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete asset.");
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = search
      ? asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.assetTag.toLowerCase().includes(search.toLowerCase()) ||
        asset.brand?.toLowerCase().includes(search.toLowerCase()) ||
        asset.serialNumber?.toLowerCase().includes(search.toLowerCase())
      : true;

    const matchesCat = selectedCat ? String(asset.categoryId) === selectedCat : true;
    const matchesDept = selectedDept ? String(asset.departmentId) === selectedDept : true;
    const matchesStatus = selectedStatus ? asset.status === selectedStatus : true;

    return matchesSearch && matchesCat && matchesDept && matchesStatus;
  });

  const totalValue = assets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0);
  const activeCount = assets.filter((a) => a.status === "AVAILABLE" || a.status === "ALLOCATED").length;
  const maintenanceCount = assets.filter((a) => a.status === "MAINTENANCE").length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-lg animate-fade-in">
      {/* 1. HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
            Asset Directory
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Manage and monitor global enterprise resource inventory.
          </p>
        </div>
        {isManagerOrAdmin && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-sm px-lg py-md rounded bg-primary text-white hover:bg-[#1e293b] font-label-md text-label-md transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Register New Asset</span>
          </button>
        )}
      </div>

      {/* 2. STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {/* Card 1: Value */}
        <div className="bg-white rounded-md border border-blue-600 p-md shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-md">
            <div className="h-10 w-10 rounded bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">telemetry</span>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
            Total Asset Value
          </p>
          <h3 className="font-headline-md text-headline-md text-primary font-bold">
            ₹{totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
        </div>

        {/* Card 2: Deployments */}
        <div className="bg-white rounded-md border border-emerald-600 p-md shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-md">
            <div className="h-10 w-10 rounded bg-emerald-50 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">utilization</span>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
            Active Deployments
          </p>
          <h3 className="font-headline-md text-headline-md text-primary font-bold">
            {activeCount.toLocaleString()} Units
          </h3>
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600"></div>
        </div>

        {/* Card 3: Maintenance */}
        <div className="bg-white rounded-md border border-red-500 p-md shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-md">
            <div className="h-10 w-10 rounded bg-red-50 flex items-center justify-center text-red-600">
              <span className="material-symbols-outlined">engineering</span>
            </div>
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-widest">priority</span>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
            Maintenance Pending
          </p>
          <h3 className="font-headline-md text-headline-md text-primary font-bold">
            {maintenanceCount} Urgent
          </h3>
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-md p-md bg-white border border-outline-variant rounded-md shadow-sm">
        <div className="flex flex-wrap items-center gap-sm flex-1">
          <div className="relative flex items-center border border-outline-variant rounded bg-surface-container-lowest h-9 px-sm min-w-[240px]">
            <span className="material-symbols-outlined text-outline text-[18px] mr-xs">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tag, name, brand, SN..."
              className="w-full bg-transparent border-none focus:ring-0 font-body-sm text-body-sm p-0 placeholder:text-outline/50 outline-none"
            />
          </div>

          <div className="relative flex items-center border border-outline-variant rounded bg-surface-container-lowest h-9 px-sm">
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="bg-transparent border-none focus:ring-0 font-body-sm text-body-sm p-0 outline-none appearance-none pr-8 cursor-pointer text-on-surface-variant font-bold"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
          </div>

          <div className="relative flex items-center border border-outline-variant rounded bg-surface-container-lowest h-9 px-sm">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent border-none focus:ring-0 font-body-sm text-body-sm p-0 outline-none appearance-none pr-8 cursor-pointer text-on-surface-variant font-bold"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ALLOCATED">Allocated</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="DAMAGED">Damaged</option>
            </select>
            <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
          </div>

          <div className="relative flex items-center border border-outline-variant rounded bg-surface-container-lowest h-9 px-sm">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent border-none focus:ring-0 font-body-sm text-body-sm p-0 outline-none appearance-none pr-8 cursor-pointer text-on-surface-variant font-bold"
            >
              <option value="">Global Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
          </div>
        </div>
      </div>

      {/* 4. DATA TABLE */}
      <div className="bg-white border border-outline-variant rounded-md shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary text-white font-label-md text-[10px] uppercase tracking-wider">
                <th className="py-3 px-md border-r border-white/10">Asset ID / Serial</th>
                <th className="py-3 px-md border-r border-white/10">Name</th>
                <th className="py-3 px-md border-r border-white/10">Category</th>
                <th className="py-3 px-md border-r border-white/10">Status</th>
                <th className="py-3 px-md border-r border-white/10">Location</th>
                <th className="py-3 px-md border-r border-white/10">Condition</th>
                <th className="py-3 px-md border-r border-white/10 text-right">Value (INR)</th>
                {isManagerOrAdmin && <th className="py-3 px-md text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-xl text-on-surface-variant">
                    Loading directory...
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-xl text-on-surface-variant">
                    No assets found matching filters.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  let statusClasses = "bg-outline-variant/30 text-on-surface-variant border-transparent";
                  if (asset.status === "AVAILABLE") {
                    statusClasses = "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
                  } else if (asset.status === "MAINTENANCE") {
                    statusClasses = "bg-red-500/10 text-red-700 border-red-500/20";
                  } else if (asset.status === "ALLOCATED") {
                    statusClasses = "bg-blue-500/10 text-blue-700 border-blue-500/20";
                  }

                  return (
                    <tr
                      key={asset.id}
                      className="text-on-surface hover:bg-secondary/10 transition-colors"
                    >
                      <td className="py-3 px-md">
                        <p className="font-bold text-primary">{asset.assetTag}</p>
                        <p className="text-[10px] text-on-surface-variant font-mono mt-0.5 font-bold">
                          SN: {asset.serialNumber || "N/A"}
                        </p>
                      </td>
                      <td className="py-3 px-md text-on-surface font-semibold">{asset.name}</td>
                      <td className="py-3 px-md">{asset.category?.name || "-"}</td>
                      <td className="py-3 px-md">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${statusClasses}`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="py-3 px-md">
                        <div className="flex items-center gap-xs text-on-surface-variant font-bold">
                          <span className="material-symbols-outlined text-[16px]">location_on</span>
                          <span>{asset.location || "Central Store"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-md">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-outline-variant/50 text-on-surface">
                          {asset.condition}
                        </span>
                      </td>
                      <td className="py-3 px-md text-right font-mono font-bold text-primary">
                        ₹{(asset.purchaseCost || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      {isManagerOrAdmin && (
                        <td className="py-3 px-md text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEdit(asset)}
                            className="p-1 rounded hover:bg-surface-container-high transition-colors text-outline hover:text-primary"
                          >
                            <span className="material-symbols-outlined text-[18px] block">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(asset.id)}
                            className="p-1 rounded hover:bg-error/10 transition-colors text-outline hover:text-error"
                          >
                            <span className="material-symbols-outlined text-[18px] block">delete</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. FORM MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white border border-outline-variant p-lg rounded-lg shadow-lg relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-sm border-b border-outline-variant mb-md">
              <h3 className="font-headline-sm text-headline-sm text-primary">
                {editingId ? "Edit Asset Details" : "Register New Asset"}
              </h3>
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

            <form onSubmit={handleSubmit} className="space-y-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">Asset Tag (ID)</label>
                  {editingId ? (
                    <div className="relative flex items-center border border-outline-variant rounded bg-surface-container-low h-10 px-sm">
                      <span className="material-symbols-outlined text-outline text-[16px] mr-xs">tag</span>
                      <input
                        type="text"
                        value={assetTag}
                        onChange={(e) => setAssetTag(e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none font-mono font-bold text-primary"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-sm h-10 px-sm bg-emerald-50 border border-emerald-200 rounded">
                      <span className="material-symbols-outlined text-emerald-600 text-[18px]">auto_awesome</span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">Auto-generated on save</span>
                      <span className="text-[10px] text-emerald-600 italic">(e.g. AST-004)</span>
                    </div>
                  )}
                </div>


                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">Asset Name *</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. MacBook Pro M3"
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/50 outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">Category *</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none appearance-none"
                      required
                    >
                      <option value="">Select Category...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">Department</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none appearance-none"
                    >
                      <option value="">None (Global / Central)</option>
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
                  <label className="font-label-md text-label-md text-primary">Brand</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Apple"
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/50 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">Model</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. A2941"
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/50 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">Serial Number</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="text"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="e.g. SN123456789"
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/50 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">Location</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Office Room 302"
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/50 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">Purchase Date *</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">Purchase Cost (INR) *</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="number"
                      step="0.01"
                      value={purchaseCost}
                      onChange={(e) => setPurchaseCost(e.target.value)}
                      placeholder="e.g. 1299.99"
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/50 outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">Vendor</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="text"
                      value={vendor}
                      onChange={(e) => setVendor(e.target.value)}
                      placeholder="e.g. BestBuy Inc."
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/50 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">Warranty End Date</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="date"
                      value={warrantyEndDate}
                      onChange={(e) => setWarrantyEndDate(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">Condition</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as any)}
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none appearance-none"
                    >
                      <option value="NEW">New</option>
                      <option value="USED">Used</option>
                      <option value="REFURBISHED">Refurbished</option>
                      <option value="DAMAGED">Damaged</option>
                    </select>
                    <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">Status</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none appearance-none"
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="ALLOCATED">Allocated</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="DAMAGED">Damaged</option>
                    </select>
                    <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
                  </div>
                </div>
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">Asset Images</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setImages(e.target.files)}
                  className="w-full text-xs text-on-surface-variant border border-outline-variant rounded p-xs bg-surface-container-lowest"
                  accept="image/*"
                />
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">Remarks / Notes</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Additional context, accessories included, etc."
                  className="w-full px-sm py-xs rounded border border-outline-variant focus:ring-1 focus:ring-secondary focus:border-secondary outline-none font-body-md text-body-md bg-surface-container-lowest h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-[#1e293b] text-white font-label-md text-label-md rounded flex items-center justify-center transition-all shadow-sm mt-lg"
              >
                {editingId ? "Save Changes" : "Register Asset"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
