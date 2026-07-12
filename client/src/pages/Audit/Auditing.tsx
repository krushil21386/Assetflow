import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Plus, X, Laptop, User, Calendar, Check, AlertTriangle, Play, CheckSquare } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface AuditDetail {
  id: number;
  verificationStatus: string;
  notes?: string;
  verifiedAt?: string;
  asset: { id: number; name: string; assetTag: string; category: { name: string } };
}

interface AuditCycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  auditor: Employee;
  details?: AuditDetail[];
  _count?: { details: number };
}

export const Auditing: React.FC = () => {
  const { user } = useAuth();
  const [cycles, setCycles] = useState<AuditCycle[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [activeCycle, setActiveCycle] = useState<AuditCycle | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Create Form State
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [auditorId, setAuditorId] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  // Verify Form State
  const [selectedDetail, setSelectedDetail] = useState<AuditDetail | null>(null);
  const [verificationStatus, setVerificationStatus] = useState('VERIFIED');
  const [verifyNotes, setVerifyNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cycleRes, empRes, deptRes] = await Promise.all([
        api.get('/audit'),
        api.get('/employees'),
        api.get('/departments')
      ]);
      setCycles(cycleRes.data);
      setEmployees(empRes.data.filter((e: any) => e.status === 'ACTIVE'));
      setDepartments(deptRes.data.filter((d: any) => d.status === 'ACTIVE'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setName(`Quarterly Audit - ${new Date().toLocaleString('en-US', { month: 'short' })} ${new Date().getFullYear()}`);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // 2 weeks out
    setAuditorId(employees[0]?.id ? String(employees[0].id) : '');
    setDepartmentId('');
    setError(null);
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate || !auditorId) {
      setError('Please fill in required fields');
      return;
    }

    try {
      await api.post('/audit', {
        name,
        startDate,
        endDate,
        auditorId: parseInt(auditorId, 10),
        departmentId: departmentId ? parseInt(departmentId, 10) : null,
      });
      setCreateModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create audit cycle');
    }
  };

  const handleOpenVerify = (detail: AuditDetail, cycle: AuditCycle) => {
    setActiveCycle(cycle);
    setSelectedDetail(detail);
    setVerificationStatus(detail.verificationStatus === 'PENDING' ? 'VERIFIED' : detail.verificationStatus);
    setVerifyNotes(detail.notes || '');
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
      // Reload active cycle list details
      handleOpenCycleDetail(activeCycle.id);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleOpenCycleDetail = async (id: number) => {
    try {
      const res = await api.get(`/audit/${id}`);
      // Find and update active cycle in state
      setCycles(prev => prev.map(c => c.id === id ? res.data : c));
      setActiveCycle(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartCycle = async (id: number) => {
    try {
      await api.put(`/audit/${id}`, { status: 'IN_PROGRESS' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteCycle = async (id: number) => {
    try {
      await api.put(`/audit/${id}`, { status: 'COMPLETED' });
      fetchData();
      if (activeCycle?.id === id) {
        setActiveCycle(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wider glow-text">Periodic Audits</h1>
          <p className="text-xs text-gray-400 mt-1">Schedule equipment inspections, assign auditors, and run verification audits</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-xs glass-button-primary"
        >
          <Plus size={16} />
          <span>New Audit Cycle</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500 mr-2"></div>
          <span>Loading audit schedules...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of Audit Cycles (1 Column) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Audit History</h3>
            <div className="space-y-4">
              {cycles.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6 glass-card rounded-2xl">No audit cycles drafted.</p>
              ) : (
                cycles.map(cycle => {
                  const isCurrentActive = activeCycle?.id === cycle.id;
                  return (
                    <div 
                      key={cycle.id}
                      onClick={() => handleOpenCycleDetail(cycle.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isCurrentActive 
                          ? 'bg-brand-500/10 border-brand-500/30 ring-2 ring-brand-500/15' 
                          : 'glass-card border-dark-border hover:border-brand-500/20'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white text-xs">{cycle.name}</h4>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                          cycle.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          cycle.status === 'IN_PROGRESS' ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' :
                          'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>{cycle.status}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-2">Auditor: {cycle.auditor.name}</p>
                      <p className="text-[9px] text-gray-500 mt-1 font-mono">{new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}</p>
                      
                      {/* Action buttons inside card */}
                      <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                        {cycle.status === 'DRAFT' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStartCycle(cycle.id); }}
                            className="flex items-center gap-1 px-3 py-1 bg-brand-500/10 hover:bg-brand-500 text-brand-400 hover:text-white rounded-lg text-[9px] font-bold border border-brand-500/20 transition-all"
                          >
                            <Play size={10} />
                            <span>Start Audit</span>
                          </button>
                        )}
                        {cycle.status === 'IN_PROGRESS' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCompleteCycle(cycle.id); }}
                            className="flex items-center gap-1 px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg text-[9px] font-bold border border-emerald-500/20 transition-all"
                          >
                            <Check size={10} />
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
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Inspection Details</h3>
            {!activeCycle ? (
              <div className="glass-card p-12 rounded-3xl border border-dark-border text-center text-gray-500 flex flex-col items-center justify-center">
                <CheckSquare size={36} className="text-gray-600 mb-2" />
                <p className="text-xs">Select an audit cycle from the list to view and record asset inspection statuses.</p>
              </div>
            ) : (
              <div className="glass-card rounded-3xl border border-dark-border overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-dark-border bg-white/5 flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{activeCycle.name}</h3>
                    <p className="text-[10px] text-gray-400 mt-1">Auditor: {activeCycle.auditor.name} • Status: <span className="font-semibold text-brand-400">{activeCycle.status}</span></p>
                  </div>
                  {activeCycle.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleCompleteCycle(activeCycle.id)}
                      className="px-3.5 py-1.5 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg text-[10px] font-bold transition-all"
                    >
                      Close Audit Cycle
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-dark-border text-gray-400 font-semibold bg-white/5">
                        <th className="py-3 px-6">Asset Tag</th>
                        <th className="py-3 px-6">Name / Category</th>
                        <th className="py-3 px-6">Inspection Status</th>
                        <th className="py-3 px-6">Notes</th>
                        <th className="py-3 px-6 text-right">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border text-gray-300">
                      {activeCycle.details?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-6 text-gray-500">No assets registered to verify in this audit scope.</td>
                        </tr>
                      ) : (
                        activeCycle.details?.map(det => (
                          <tr key={det.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-6 font-mono text-gray-500">{det.asset.assetTag}</td>
                            <td className="py-3.5 px-6">
                              <div className="font-bold text-white">{det.asset.name}</div>
                              <span className="text-[9px] text-gray-500">{det.asset.category.name}</span>
                            </td>
                            <td className="py-3.5 px-6">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-semibold border ${
                                det.verificationStatus === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                det.verificationStatus === 'MISSING' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                det.verificationStatus === 'DAMAGED' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                det.verificationStatus === 'DISPOSED' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              }`}>{det.verificationStatus}</span>
                            </td>
                            <td className="py-3.5 px-6 max-w-xs truncate">{det.notes || '-'}</td>
                            <td className="py-3.5 px-6 text-right">
                              {activeCycle.status === 'IN_PROGRESS' && (
                                <button
                                  onClick={() => handleOpenVerify(det, activeCycle)}
                                  className="px-2.5 py-1.5 bg-brand-500/10 border border-brand-500/20 hover:bg-brand-500 text-brand-400 hover:text-white rounded-lg text-[9px] font-semibold transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-dark-border shadow-2xl relative animate-fade-in">
            <div className="flex justify-between items-center pb-4 border-b border-dark-border mb-6">
              <h3 className="text-base font-bold text-white">Create Audit Cycle</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-gray-400 hover:text-white">
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
                <label className="text-gray-300 font-semibold">Audit Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">End Date *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Auditor *</label>
                <select
                  value={auditorId}
                  onChange={(e) => setAuditorId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input"
                  required
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id} className="bg-[#080b11]">{emp.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Target Scope (Filter Department)</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input"
                >
                  <option value="">Whole Company (All Assets)</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id} className="bg-[#080b11]">{d.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-white glass-button-primary text-sm transition-all mt-6"
              >
                Draft Audit Cycle
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VERIFY ASSET MODAL */}
      {verifyModalOpen && selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-dark-border shadow-2xl relative animate-fade-in">
            <div className="flex justify-between items-center pb-4 border-b border-dark-border mb-6">
              <h3 className="text-base font-bold text-white">Record Asset Inspection</h3>
              <button onClick={() => setVerifyModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-gray-400">
                <p>Asset: <span className="font-bold text-white">{selectedDetail.asset.name}</span></p>
                <p className="mt-1">Tag: <span className="font-mono text-white">{selectedDetail.asset.assetTag}</span></p>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Verification Outcome *</label>
                <select
                  value={verificationStatus}
                  onChange={(e) => setVerificationStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input"
                >
                  <option value="VERIFIED" className="bg-[#080b11]">Verified (Operational/Available)</option>
                  <option value="DAMAGED" className="bg-[#080b11]">Damaged (Needs repair maintenance)</option>
                  <option value="MISSING" className="bg-[#080b11]">Missing (Mark as lost)</option>
                  <option value="DISPOSED" className="bg-[#080b11]">Disposed (Retire asset)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Inspection Remarks / Observation Notes</label>
                <textarea
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="Note physical damage, room location mismatch..."
                  className="w-full px-4 py-2 rounded-xl glass-input h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-white glass-button-primary text-sm transition-all mt-6"
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
