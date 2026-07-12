import React, { useState, useEffect } from "react";
import api from "../services/api";
import { Building2, Plus, Edit2, Trash2, X } from "lucide-react";

export const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState(null);
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [headId, setHeadId] = useState("");
  const [status, setStatus] = useState("ACTIVE");

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

  const handleOpenEdit = (dept) => {
    setEditingId(dept.id);
    setName(dept.name);
    setDescription(dept.description || "");
    setParentId(dept.parentId ? String(dept.parentId) : "");
    setHeadId(dept.headId ? String(dept.headId) : "");
    setStatus(dept.status);
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
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
    } catch (err) {
      setError(err.response?.data?.message || "Action failed.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?"))
      return;
    try {
      await api.delete(`/departments/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete department.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-navy tracking-wider ">
            Departments
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage organizational hierarchy and department heads
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-navy font-semibold text-xs bg-navy text-white hover:bg-navy-hover"
        >
          <Plus size={16} />
          <span>Add Department</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500 mr-2"></div>
          <span>Loading departments list...</span>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-semibold bg-gray-50">
                  <th className="py-4 px-6">Department Name</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Parent Department</th>
                  <th className="py-4 px-6">Department Head</th>
                  <th className="py-4 px-6">Employees</th>
                  <th className="py-4 px-6">Assets</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      No departments found. Click "Add Department" to start.
                    </td>
                  </tr>
                ) : (
                  departments.map((dept) => (
                    <tr
                      key={dept.id}
                      className="text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6 font-bold text-navy flex items-center gap-2">
                        <Building2 size={16} className="text-brand-400" />
                        <span>{dept.name}</span>
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate">
                        {dept.description || "-"}
                      </td>
                      <td className="py-4 px-6">
                        {dept.parentDepartment?.name || "-"}
                      </td>
                      <td className="py-4 px-6 font-semibold">
                        {dept.head?.name || "-"}
                      </td>
                      <td className="py-4 px-6">
                        {dept._count?.employees || 0}
                      </td>
                      <td className="py-4 px-6">{dept._count?.assets || 0}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            dept.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {dept.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(dept)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-navy hover:bg-gray-50 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(dept.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={14} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-gray-200 p-6 rounded-3xl border border-gray-200 shadow-2xl relative animate-fade-in">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
              <h3 className="text-base font-bold text-navy">
                {editingId ? "Edit Department" : "Create Department"}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Engineering, Sales, etc."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of department operations..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none text-sm h-20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  Parent Department
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none text-sm"
                >
                  <option value="">None (Top-Level)</option>
                  {departments
                    .filter((d) => d.id !== editingId) // Prevent cycles
                    .map((d) => (
                      <option key={d.id} value={d.id} className="bg-surface-bg">
                        {d.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  Department Head
                </label>
                <select
                  value={headId}
                  onChange={(e) => setHeadId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none text-sm"
                >
                  <option value="">Select Employee...</option>
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

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none text-sm"
                >
                  <option value="ACTIVE" className="bg-surface-bg">
                    Active
                  </option>
                  <option value="INACTIVE" className="bg-surface-bg">
                    Inactive
                  </option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-navy bg-navy text-white hover:bg-navy-hover text-sm transition-all mt-6"
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
