import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CalendarRange, Plus, X, Laptop, User, Calendar, Clock, AlertTriangle } from 'lucide-react';

interface BookableAsset {
  id: number;
  name: string;
  assetTag: string;
  category: { name: string };
  status: string;
}

interface Booking {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  purpose?: string;
  status: string;
  asset: { name: string; assetTag: string; category: { name: string } };
  employee: { name: string; employeeCode: string };
}

export const Bookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [resources, setResources] = useState<BookableAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [assetId, setAssetId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, assetsRes] = await Promise.all([
        api.get('/booking'),
        api.get('/assets')
      ]);
      setBookings(bookingsRes.data);
      // Filter assets that are bookable
      setResources(assetsRes.data.filter((a: any) => a.bookable || a.category.bookable));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setAssetId(resources[0]?.id ? String(resources[0].id) : '');
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime('09:00');
    setEndTime('10:00');
    setPurpose('');
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !date || !startTime || !endTime) {
      setError('Please fill in all required fields');
      return;
    }

    if (startTime >= endTime) {
      setError('Start time must be before end time');
      return;
    }

    setError(null);
    try {
      await api.post('/booking', {
        assetId: parseInt(assetId, 10),
        date,
        startTime,
        endTime,
        purpose,
      });
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Booking conflict: select another slot.');
    }
  };

  const handleCancelBooking = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.put(`/booking/${id}`, { status: 'CANCELLED' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cancellation failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wider glow-text">Resource Booking</h1>
          <p className="text-xs text-gray-400 mt-1">Book shared facilities, meeting rooms, vehicles, and portable projectors</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-xs glass-button-primary"
        >
          <Plus size={16} />
          <span>Book Resource</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500 mr-2"></div>
          <span>Loading bookings ledger...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Bookings (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Schedules Ledger</h3>
            <div className="glass-card rounded-2xl overflow-hidden border border-dark-border">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-dark-border text-gray-400 font-semibold bg-white/5">
                      <th className="py-4 px-6">Resource</th>
                      <th className="py-4 px-6">Booked By</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Time Window</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">No scheduled bookings.</td>
                      </tr>
                    ) : (
                      bookings.map((b) => (
                        <tr key={b.id} className="text-gray-300 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-6 font-bold text-white">
                            <div>{b.asset.name}</div>
                            <span className="font-mono text-[9px] text-gray-500 font-normal">{b.asset.assetTag} ({b.asset.category.name})</span>
                          </td>
                          <td className="py-4 px-6 font-semibold">{b.employee.name}</td>
                          <td className="py-4 px-6 font-mono">{new Date(b.date).toLocaleDateString()}</td>
                          <td className="py-4 px-6 font-mono text-brand-400 font-bold">{b.startTime} - {b.endTime}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              b.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              b.status === 'CANCELLED' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                              'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            {b.status === 'APPROVED' && (b.employee.name === user?.employee?.name || user?.role === 'Admin') && (
                              <button
                                onClick={() => handleCancelBooking(b.id)}
                                className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-400 hover:text-white rounded-lg text-[9px] font-semibold transition-colors"
                              >
                                Cancel
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
          </div>

          {/* Bookable resource directory listing (1 Column) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Available Resources</h3>
            <div className="glass-card p-4 rounded-2xl border border-dark-border space-y-4">
              {resources.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No bookable resources configured.</p>
              ) : (
                resources.map(res => (
                  <div key={res.id} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">{res.name}</p>
                      <p className="text-gray-500 text-[10px] mt-0.5">{res.category.name} • {res.assetTag}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-semibold border ${
                      res.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>{res.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE BOOKING MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-dark-border shadow-2xl relative animate-fade-in">
            <div className="flex justify-between items-center pb-4 border-b border-dark-border mb-6">
              <h3 className="text-base font-bold text-white">Reserve Shared Resource</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-1.5">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Select Resource *</label>
                <select
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input"
                  required
                >
                  <option value="">Choose Resource...</option>
                  {resources.map(res => (
                    <option key={res.id} value={res.id} className="bg-[#080b11]">{res.name} [{res.assetTag}]</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Booking Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Start Time *</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">End Time *</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Purpose of Booking</label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Meeting discussion, transportation requirements..."
                  className="w-full px-4 py-2 rounded-xl glass-input h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-white glass-button-primary text-sm transition-all mt-6"
              >
                Request Booking Slot
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
