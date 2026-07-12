import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { History, Search, RefreshCw } from 'lucide-react';

interface ActivityLog {
  id: number;
  action: string;
  details: string;
  ipAddress?: string;
  browser?: string;
  createdAt: string;
  user: {
    email: string;
    employee?: { name: string } | null;
  };
}

export const Logs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/activity-logs');
      setLogs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    return (
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.user.email.toLowerCase().includes(search.toLowerCase()) ||
      (log.user.employee?.name && log.user.employee.name.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wider glow-text flex items-center gap-2">
            <History className="text-brand-400" size={22} />
            <span>System Activity Logs</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Audit administrative operations, configuration changes, logins, and approvals</p>
        </div>
        <button 
          onClick={fetchLogs}
          className="p-2.5 rounded-xl border border-dark-border hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          title="Refresh Logs"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* SEARCH */}
      <div className="glass-card p-4 rounded-2xl border border-dark-border max-w-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Search logs by action, description, or operator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-4 py-2 rounded-xl glass-input text-xs"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500 mr-2"></div>
          <span>Parsing audit logs...</span>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-dark-border">
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-dark-border text-gray-400 font-semibold bg-white/5">
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Operator</th>
                  <th className="py-4 px-6">Action Event</th>
                  <th className="py-4 px-6">Details Description</th>
                  <th className="py-4 px-6">Client IP</th>
                  <th className="py-4 px-6">Browser User-Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border text-gray-300">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">No activity logs recorded.</td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-[10px] text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-white">{log.user.employee?.name || 'System Account'}</div>
                        <span className="text-[9px] text-gray-500 font-mono">{log.user.email}</span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 max-w-sm truncate" title={log.details}>
                        {log.details}
                      </td>
                      <td className="py-3.5 px-6 font-mono text-[10px] text-gray-500">
                        {log.ipAddress || 'Unknown'}
                      </td>
                      <td className="py-3.5 px-6 font-mono text-[9px] text-gray-500 max-w-xs truncate" title={log.browser}>
                        {log.browser || 'Unknown'}
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
  );
};
