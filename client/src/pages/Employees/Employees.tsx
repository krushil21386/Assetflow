import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Plus, Spinner } from "phosphor-react";
import type { Employee, Department } from "../../types";

interface EmployeeWithUser extends Employee {
  user?: {
    role: {
      name: string;
    };
  };
}

export const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeWithUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [designation, setDesignation] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [joiningDate, setJoiningDate] = useState<string>("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [createAccount, setCreateAccount] = useState<boolean>(false);
  const [role, setRole] = useState<string>("Employee");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get("/employees"),
        api.get("/departments"),
      ]);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPhone("");
    setDesignation("");
    setDepartmentId("");
    setJoiningDate(new Date().toISOString().split("T")[0]);
    setStatus("ACTIVE");
    setCreateAccount(false);
    setRole("Employee");
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (emp: EmployeeWithUser) => {
    setEditingId(emp.id);
    setName(emp.name);
    setEmail(emp.email);
    setPhone(emp.phone || "");
    setDesignation(emp.designation || "");
    setDepartmentId(emp.departmentId ? String(emp.departmentId) : "");
    setJoiningDate(new Date(emp.joiningDate).toISOString().split("T")[0]);
    setStatus(emp.status);
    setCreateAccount(false);
    setRole(emp.user?.role?.name || "Employee");
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError("Name and Email are required");
      return;
    }

    const payload: any = {
      name,
      email,
      phone,
      designation,
      departmentId: departmentId ? parseInt(departmentId, 10) : null,
      joiningDate,
      status,
      role,
    };

    if (!editingId) {
      payload.createAccount = createAccount;
    }

    try {
      if (editingId) {
        await api.put(`/employees/${editingId}`, payload);
      } else {
        await api.post("/employees", payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Action failed.");
    }
  };

  return (
    <div className="space-y-lg animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
            Employee Directory
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Manage personnel records, departments, and user roles (RBAC)
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="group flex items-center gap-sm px-lg py-md rounded bg-primary text-white hover:bg-[#1e293b] font-label-md text-label-md transition-all shadow-sm active:scale-95"
        >
          <Plus size={18} weight="bold" className="group-hover:animate-icon-hover-rotate" />
          <span>Add Employee</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <Spinner size={48} className="text-primary animate-icon-spin" weight="bold" />
            <span className="font-label-md text-label-md text-on-surface-variant">Loading employee listings...</span>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-outline-variant rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary text-white font-label-md text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-md border-r border-white/10">Code</th>
                  <th className="py-3 px-md border-r border-white/10">Name</th>
                  <th className="py-3 px-md border-r border-white/10">Email / Phone</th>
                  <th className="py-3 px-md border-r border-white/10">Department</th>
                  <th className="py-3 px-md border-r border-white/10">Designation</th>
                  <th className="py-3 px-md border-r border-white/10">Role</th>
                  <th className="py-3 px-md border-r border-white/10">Joining Date</th>
                  <th className="py-3 px-md border-r border-white/10">Status</th>
                  <th className="py-3 px-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-xl text-on-surface-variant">
                      No employees registered.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="text-on-surface hover:bg-secondary/10 transition-colors"
                    >
                      <td className="py-3 px-md font-mono text-on-surface-variant">
                        {emp.employeeCode}
                      </td>
                      <td className="py-3 px-md font-bold text-primary flex items-center gap-sm">
                        <div className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                          {emp.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{emp.name}</span>
                      </td>
                      <td className="py-3 px-md">
                        <div>{emp.email}</div>
                        <div className="text-[10px] text-on-surface-variant mt-0.5 font-bold">
                          {emp.phone || "-"}
                        </div>
                      </td>
                      <td className="py-3 px-md">
                        {emp.department?.name || "-"}
                      </td>
                      <td className="py-3 px-md">{emp.designation || "-"}</td>
                      <td className="py-3 px-md">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                            emp.user?.role?.name === "Admin"
                              ? "bg-red-500/10 text-red-700 border-red-500/20"
                              : emp.user?.role?.name === "Asset Manager"
                                ? "bg-indigo-500/10 text-indigo-700 border-indigo-500/20"
                                : emp.user?.role?.name === "Department Head"
                                  ? "bg-purple-500/10 text-purple-700 border-purple-500/20"
                                  : "bg-outline-variant/30 text-on-surface-variant border-transparent"
                          }`}
                        >
                          {emp.user?.role?.name || "No Login Account"}
                        </span>
                      </td>
                      <td className="py-3 px-md font-mono">
                        {new Date(emp.joiningDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-md">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                            emp.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                              : "bg-red-500/10 text-red-700 border-red-500/20"
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-3 px-md text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1 rounded hover:bg-surface-container-high transition-colors text-outline hover:text-primary"
                        >
                          <span className="material-symbols-outlined text-[18px] block">edit</span>
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
          <div className="w-full max-w-md bg-white border border-outline-variant p-lg rounded-lg shadow-lg relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-sm border-b border-outline-variant mb-md">
              <h3 className="font-headline-sm text-headline-sm text-primary">
                {editingId ? "Edit Employee Details" : "Register New Employee"}
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
                  Full Name *
                </label>
                <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Employee name"
                    className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/50 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">
                  Email Address *
                </label>
                <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@company.com"
                    className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/50 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">
                    Phone
                  </label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="999-999-9999"
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/50 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">
                    Designation
                  </label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="Software Engineer..."
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/50 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">
                    Department
                  </label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none appearance-none"
                    >
                      <option value="">Select Department...</option>
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
                  <label className="font-label-md text-label-md text-primary">
                    Joining Date
                  </label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="date"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none"
                    />
                  </div>
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

              {editingId && (
                <div className="space-y-xs p-sm bg-surface-container-low rounded border border-outline-variant">
                  <label className="font-label-sm text-label-sm text-primary flex items-center gap-xs font-bold">
                    <span className="material-symbols-outlined text-[16px]">security</span>
                    <span>Promote User Role (RBAC)</span>
                  </label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 font-body-sm text-body-sm p-0 outline-none appearance-none"
                    >
                      <option value="Employee">Employee (Default)</option>
                      <option value="Department Head">Department Head</option>
                      <option value="Asset Manager">Asset Manager</option>
                      <option value="Admin">Admin</option>
                    </select>
                    <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
                  </div>
                </div>
              )}

              {!editingId && (
                <div className="space-y-sm p-sm bg-surface-container-low rounded border border-outline-variant">
                  <div className="flex items-center gap-sm">
                    <input
                      type="checkbox"
                      id="createAccount"
                      checked={createAccount}
                      onChange={(e) => setCreateAccount(e.target.checked)}
                      className="rounded border-outline-variant text-secondary focus:ring-secondary/20 h-4 w-4 cursor-pointer"
                    />
                    <label
                      htmlFor="createAccount"
                      className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer select-none"
                    >
                      Create Login Account for this Employee
                    </label>
                  </div>

                  {createAccount && (
                    <div className="space-y-xs mt-xs">
                      <label className="font-label-sm text-label-sm text-outline">
                        Account Access Role
                      </label>
                      <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-0 font-body-sm text-body-sm p-0 outline-none appearance-none"
                        >
                          <option value="Employee">Employee</option>
                          <option value="Department Head">Department Head</option>
                          <option value="Asset Manager">Asset Manager</option>
                          <option value="Admin">Admin</option>
                        </select>
                        <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
                      </div>
                      <p className="font-label-sm text-label-sm text-secondary italic mt-xs">
                        Note: Default password for new accounts will be set to: "Employee@123"
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-[#1e293b] text-white font-label-md text-label-md rounded flex items-center justify-center transition-all shadow-sm mt-lg"
              >
                {editingId ? "Save Profile" : "Register Employee"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
