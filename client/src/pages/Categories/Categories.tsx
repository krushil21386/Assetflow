import React, { useState, useEffect } from "react";
import api from "../../services/api";import { Plus, Spinner } from "phosphor-react";import type { AssetCategory } from "../../types";

interface AssetCategoryWithCounts extends AssetCategory {
  _count?: {
    assets: number;
  };
}

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<AssetCategoryWithCounts[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [warrantyPeriod, setWarrantyPeriod] = useState<string>("");
  const [depreciationYears, setDepreciationYears] = useState<string>("");
  const [bookable, setBookable] = useState<boolean>(false);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setWarrantyPeriod("12");
    setDepreciationYears("5");
    setBookable(false);
    setStatus("ACTIVE");
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: AssetCategoryWithCounts) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || "");
    setWarrantyPeriod(String(cat.warrantyPeriod));
    setDepreciationYears(String(cat.depreciationYears));
    setBookable(cat.bookable);
    setStatus(cat.status);
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !warrantyPeriod || !depreciationYears) {
      setError("Please fill in all required fields");
      return;
    }

    const payload = {
      name,
      description,
      warrantyPeriod: parseInt(warrantyPeriod, 10),
      depreciationYears: parseInt(depreciationYears, 10),
      bookable,
      status,
    };

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, payload);
      } else {
        await api.post("/categories", payload);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || "Action failed.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete category.");
    }
  };

  return (
    <div className="space-y-lg animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
            Asset Categories
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Configure asset templates, depreciation timelines, and bookable states
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="group flex items-center gap-sm px-lg py-md rounded bg-primary text-white hover:bg-[#1e293b] font-label-md text-label-md transition-all shadow-sm active:scale-95"
        >
          <Plus size={18} weight="bold" className="group-hover:animate-icon-hover-rotate" />
          <span>Add Category</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <Spinner size={48} className="text-primary animate-icon-spin" weight="bold" />
            <span className="font-label-md text-label-md text-on-surface-variant">Loading categories list...</span>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-outline-variant rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary text-white font-label-md text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-md border-r border-white/10">Category Name</th>
                  <th className="py-3 px-md border-r border-white/10">Description</th>
                  <th className="py-3 px-md border-r border-white/10">Warranty (Months)</th>
                  <th className="py-3 px-md border-r border-white/10">Depreciation (Years)</th>
                  <th className="py-3 px-md border-r border-white/10">Bookable</th>
                  <th className="py-3 px-md border-r border-white/10">Assets</th>
                  <th className="py-3 px-md border-r border-white/10">Status</th>
                  <th className="py-3 px-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-xl text-on-surface-variant">
                      No categories found. Click "Add Category" to start.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="text-on-surface hover:bg-secondary/10 transition-colors"
                    >
                      <td className="py-3 px-md font-bold text-primary flex items-center gap-sm">
                        <span className="material-symbols-outlined text-[20px]">category</span>
                        <span>{cat.name}</span>
                      </td>
                      <td className="py-3 px-md max-w-xs truncate">
                        {cat.description || "-"}
                      </td>
                      <td className="py-3 px-md font-mono">
                        {cat.warrantyPeriod} mo
                      </td>
                      <td className="py-3 px-md font-mono">
                        {cat.depreciationYears} yrs
                      </td>
                      <td className="py-3 px-md">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                            cat.bookable
                              ? "bg-purple-500/10 text-purple-700 border-purple-500/20"
                              : "bg-outline-variant/30 text-on-surface-variant border-transparent"
                          }`}
                        >
                          {cat.bookable ? "Bookable" : "Static"}
                        </span>
                      </td>
                      <td className="py-3 px-md font-bold">{cat._count?.assets || 0}</td>
                      <td className="py-3 px-md">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                            cat.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                              : "bg-red-500/10 text-red-700 border-red-500/20"
                          }`}
                        >
                          {cat.status}
                        </span>
                      </td>
                      <td className="py-3 px-md text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1 rounded hover:bg-surface-container-high transition-colors text-outline hover:text-primary"
                        >
                          <span className="material-symbols-outlined text-[18px] block">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1 rounded hover:bg-error/10 transition-colors text-outline hover:text-error"
                        >
                          <span className="material-symbols-outlined text-[18px] block">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FORM MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-outline-variant p-lg rounded-lg shadow-lg relative animate-fade-in">
            <div className="flex justify-between items-center pb-sm border-b border-outline-variant mb-md">
              <h3 className="font-headline-sm text-headline-sm text-primary">
                {editingId ? "Edit Category" : "Create Category"}
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
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">
                  Category Name *
                </label>
                <div className="relative flex items-center border border-outline-variant rounded transition-all input-focus-effect bg-surface-container-lowest h-10 px-sm">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Laptops, Projectors, Vehicles..."
                    className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/50 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of category uses..."
                  className="w-full px-sm py-xs rounded border border-outline-variant focus:ring-1 focus:ring-secondary focus:border-secondary outline-none font-body-md text-body-md bg-surface-container-lowest h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">
                    Warranty Period *
                  </label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="number"
                      value={warrantyPeriod}
                      onChange={(e) => setWarrantyPeriod(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none pr-12"
                      placeholder="36"
                      min="0"
                      required
                    />
                    <span className="absolute right-3 text-xs text-on-surface-variant font-bold">mo</span>
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">
                    Depreciation Years *
                  </label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="number"
                      value={depreciationYears}
                      onChange={(e) => setDepreciationYears(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none pr-12"
                      placeholder="5"
                      min="0"
                      required
                    />
                    <span className="absolute right-3 text-xs text-on-surface-variant font-bold">yrs</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-sm py-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="bookable"
                  checked={bookable}
                  onChange={(e) => setBookable(e.target.checked)}
                  className="rounded border-outline-variant text-secondary focus:ring-secondary/20 h-4 w-4 cursor-pointer"
                />
                <label
                  htmlFor="bookable"
                  className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer"
                >
                  Enable Resource Booking (for meetings, vehicles, pool items)
                </label>
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">
                  Status
                </label>
                <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                    className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none appearance-none"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                  <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-[#1e293b] text-white font-label-md text-label-md rounded flex items-center justify-center transition-all shadow-sm mt-lg"
              >
                {editingId ? "Save Changes" : "Create Category"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
