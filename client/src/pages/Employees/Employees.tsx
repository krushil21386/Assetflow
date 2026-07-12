import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Plus, Edit2, ShieldAlert, X } from 'lucide-react';

interface Department {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  employeeCode: string;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  joiningDate: string;
  status: string;
  departmentId?: number | null;
  department?: Department | null;
  user?: {
    id: number;
    email: string;
    role: { name: string };
  } | null;
}

export const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [createAccount, setCreateAccount] = useState(false);
  const [role, setRole] = useState('Employee');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get('/employees'),
        api.get('/departments')
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
    setName('');
    setEmail('');
    setPhone('');
    setDesignation('');
    setDepartmentId('');
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setStatus('ACTIVE');
    setCreateAccount(false);
    setRole('Employee');
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setName(emp.name);
    setEmail(emp.email);
    setPhone(emp.phone || '');
    setDesignation(emp.designation || '');
    setDepartmentId(emp.departmentId ? String(emp.departmentId) : '');
    setJoiningDate(new Date(emp.joiningDate).toISOString().split('T')[0]);
    setStatus(emp.status);
    setCreateAccount(false); // Can't recreate account if already exists
    setRole(emp.user?.role?.name || 'Employee');
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Name and Email are required');
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
      role
    };

    if (!editingId) {
      payload.createAccount = createAccount;
    }

    try {
      if (editingId) {
        await api.put(`/employees/${editingId}`, payload);
      } else {
        await api.post('/employees', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Action failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wider glow-text">Employee Directory</h1>
          <p className="text-xs text-gray-400 mt-1">Manage personnel records, departments, and user roles (RBAC)</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-xs glass-button-primary"
        >
          <Plus size={16} />
          <span>Add Employee</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500 mr-2"></div>
          <span>Loading employee listings...</span>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-dark-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-dark-border text-gray-400 font-semibold bg-white/5">
                  <th className="py-4 px-6">Code</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email / Phone</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Designation</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Joining Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">No employees registered.</td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id} className="text-gray-300 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 font-mono text-gray-400">{emp.employeeCode}</td>
                      <td className="py-4 px-6 font-bold text-white flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center text-[10px] font-bold">
                          {emp.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{emp.name}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div>{emp.email}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{emp.phone || '-'}</div>
                      </td>
                      <td className="py-4 px-6">{emp.department?.name || '-'}</td>
                      <td className="py-4 px-6">{emp.designation || '-'}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          emp.user?.role?.name === 'Admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          emp.user?.role?.name === 'Asset Manager' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                          emp.user?.role?.name === 'Department Head' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                          'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                          {emp.user?.role?.name || 'No Login Account'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono">{new Date(emp.joiningDate).toLocaleDateString()}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          emp.status === 'ACTIVE' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button 
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Edit2 size={14} />
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
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-dark-border shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-dark-border mb-6">
              <h3 className="text-base font-bold text-white">{editingId ? 'Edit Employee Details' : 'Register New Employee'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
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
                <label className="text-xs font-semibold text-gray-300">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Employee name"
                  className="w-full px-4 py-2 rounded-xl glass-input text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@company.com"
                  className="w-full px-4 py-2 rounded-xl glass-input text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="999-999-9999"
                    className="w-full px-4 py-2 rounded-xl glass-input text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="Software Engineer..."
                    className="w-full px-4 py-2 rounded-xl glass-input text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl glass-input text-sm"
                  >
                    <option value="">Select Department...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id} className="bg-[#080b11]">{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Joining Date</label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl glass-input text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl glass-input text-sm"
                >
                  <option value="ACTIVE" className="bg-[#080b11]">Active</option>
                  <option value="INACTIVE" className="bg-[#080b11]">Inactive</option>
                </select>
              </div>

              {editingId && (
                <div className="space-y-1 p-3 rounded-xl bg-white/5 border border-white/5 mt-4">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5 mb-1.5">
                    <ShieldAlert size={14} className="text-brand-400" />
                    <span>Promote User Role (RBAC)</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl glass-input text-xs"
                  >
                    <option value="Employee" className="bg-[#080b11]">Employee (Default)</option>
                    <option value="Department Head" className="bg-[#080b11]">Department Head</option>
                    <option value="Asset Manager" className="bg-[#080b11]">Asset Manager</option>
                    <option value="Admin" className="bg-[#080b11]">Admin</option>
                  </select>
                </div>
              )}

              {!editingId && (
                <div className="space-y-3 p-3 rounded-xl bg-white/5 border border-white/5 mt-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="createAccount"
                      checked={createAccount}
                      onChange={(e) => setCreateAccount(e.target.checked)}
                      className="rounded border-gray-700 bg-gray-900 text-brand-500 focus:ring-0 h-4 w-4 cursor-pointer"
                    />
                    <label htmlFor="createAccount" className="text-xs font-semibold text-gray-300 cursor-pointer select-none">
                      Create Login Account for this Employee
                    </label>
                  </div>
                  
                  {createAccount && (
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400">Account Access Role</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl glass-input text-xs"
                      >
                        <option value="Employee" className="bg-[#080b11]">Employee</option>
                        <option value="Department Head" className="bg-[#080b11]">Department Head</option>
                        <option value="Asset Manager" className="bg-[#080b11]">Asset Manager</option>
                        <option value="Admin" className="bg-[#080b11]">Admin</option>
                      </select>
                      <p className="text-[10px] text-brand-400 mt-1 italic">Note: Default password for new accounts will be set to: "Employee@123"</p>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-white glass-button-primary text-sm transition-all mt-6"
              >
                {editingId ? 'Save Profile' : 'Register Employee'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
