import React, { useState, useEffect } from "react";
import api from "../../services/api";
import type { Department, Employee } from "../../types";

interface DepartmentWithCounts extends Department {
  _count?: {
    employees: number;
    assets: number;
  };
}

export const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentWithCounts[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [parentId, setParentId] = useState<string>("");
  const [headId, setHeadId] = useState<string>("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, empRes] = await Promise.all([
        api.get("/departments"),
        api.get("/employees"),
      ]);
      setDepartments(deptRes.data);
      setEmployees(empRes.data);
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
    setParentId("");
    setHeadId("");
    setStatus("ACTIVE");
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (dept: DepartmentWithCounts) => {
    setEditingId(dept.id);
    setName(dept.name);
    setDescription(dept.description || "");
    setParentId(dept.parentId ? String(dept.parentId) : "");
    setHeadId(dept.headId ? String(dept.headId) : "");
    setStatus(dept.status);
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError("Name is required");
      return;
    }

    const payload = {
      name,
      description,
      parentId: parentId ? parseInt(parentId, 10) : null,
      headId: headId ? parseInt(headId, 10) : null,
      status,
    };

    try {
      if (editingId) {
        await api.put(`/departments/${editingId}`, payload);
      } else {
        await api.post("/departments", payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Action failed.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this department?"))
      return;
    try {
      await api.delete(`/departments/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete department.");
    }
  };

  return (
    <div className="space-y-lg animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
            Departments
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Manage organizational hierarchy and department heads
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-sm px-lg py-md rounded bg-primary text-white hover:bg-[#1e293b] font-label-md text-label-md transition-all shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Add Department</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
            <span className="font-label-md text-label-md text-on-surface-variant">Loading departments list...</span>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-outline-variant rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary text-white font-label-md text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-md border-r border-white/10">Department Name</th>
                  <th className="py-3 px-md border-r border-white/10">Description</th>
                  <th className="py-3 px-md border-r border-white/10">Parent Department</th>
                  <th className="py-3 px-md border-r border-white/10">Department Head</th>
                  <th className="py-3 px-md border-r border-white/10">Employees</th>
                  <th className="py-3 px-md border-r border-white/10">Assets</th>
                  <th className="py-3 px-md border-r border-white/10">Status</th>
                  <th className="py-3 px-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-xl text-on-surface-variant">
                      No departments found. Click "Add Department" to start.
                    </td>
                  </tr>
                ) : (
                  departments.map((dept) => (
                    <tr
                      key={dept.id}
                      className="text-on-surface hover:bg-secondary/10 transition-colors"
                    >
                      <td className="py-3 px-md font-bold text-primary flex items-center gap-sm">
                        <span className="material-symbols-outlined text-[20px]">domain</span>
                        <span>{dept.name}</span>
                      </td>
                      <td className="py-3 px-md max-w-xs truncate">
                        {dept.description || "-"}
                      </td>
                      <td className="py-3 px-md">
                        {dept.parentDepartment?.name || "-"}
                      </td>
                      <td className="py-3 px-md font-semibold">
                        {dept.head?.name || "-"}
                      </td>
                      <td className="py-3 px-md font-bold">
                        {dept._count?.employees || 0}
                      </td>
                      <td className="py-3 px-md font-bold">{dept._count?.assets || 0}</td>
                      <td className="py-3 px-md">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                            dept.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                              : "bg-red-500/10 text-red-700 border-red-500/20"
                          }`}
                        >
                          {dept.status}
                        </span>
                      </td>
                      <td className="py-3 px-md text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(dept)}
                          className="p-1 rounded hover:bg-surface-container-high transition-colors text-outline hover:text-primary"
                        >
                          <span className="material-symbols-outlined text-[18px] block">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(dept.id)}
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
                {editingId ? "Edit Department" : "Create Department"}
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
                  Department Name *
                </label>
                <div className="relative flex items-center border border-outline-variant rounded transition-all input-focus-effect bg-surface-container-lowest h-10 px-sm">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Engineering, Sales, etc."
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
                  placeholder="Brief summary of department operations..."
                  className="w-full px-sm py-xs rounded border border-outline-variant focus:ring-1 focus:ring-secondary focus:border-secondary outline-none font-body-md text-body-md bg-surface-container-lowest h-20"
                />
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">
                  Parent Department
                </label>
                <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none appearance-none"
                  >
                    <option value="">None (Top-Level)</option>
                    {departments
                      .filter((d) => d.id !== editingId)
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                  </select>
                  <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
                </div>
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">
                  Department Head
                </label>
                <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                  <select
                    value={headId}
                    onChange={(e) => setHeadId(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none appearance-none"
                  >
                    <option value="">Select Employee...</option>
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
                {editingId ? "Save Changes" : "Create Department"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
