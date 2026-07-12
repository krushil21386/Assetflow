import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import type { Asset } from "../../types";

interface Booking {
  id: number;
  assetId: number;
  employeeId: number;
  date: string;
  startTime: string;
  endTime: string;
  purpose?: string;
  status: "APPROVED" | "CANCELLED" | "PENDING";
  asset: Asset & { category: { name: string } };
  employee: { id: number; name: string };
}

export const Bookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [assetId, setAssetId] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, assetsRes] = await Promise.all([
        api.get("/booking"),
        api.get("/assets"),
      ]);
      setBookings(bookingsRes.data || []);
      setResources(
        (assetsRes.data || []).filter((a: any) => a.bookable || a.category?.bookable)
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setAssetId(resources[0]?.id ? String(resources[0].id) : "");
    setDate(new Date().toISOString().split("T")[0]);
    setStartTime("09:00");
    setEndTime("10:00");
    setPurpose("");
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !date || !startTime || !endTime) {
      setError("Please fill in all required fields");
      return;
    }

    if (startTime >= endTime) {
      setError("Start time must be before end time");
      return;
    }

    setError(null);
    try {
      await api.post("/booking", {
        assetId: parseInt(assetId, 10),
        date,
        startTime,
        endTime,
        purpose,
      });
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Booking conflict: select another slot."
      );
    }
  };

  const handleCancelBooking = async (id: number) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.put(`/booking/${id}`, { status: "CANCELLED" });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Cancellation failed");
    }
  };

  return (
    <div className="space-y-lg animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
            Resource Booking
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Book shared facilities, meeting rooms, vehicles, and portable projectors
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-sm px-lg py-md rounded bg-primary text-white hover:bg-[#1e293b] font-label-md text-label-md transition-all shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Book Resource</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
            <span className="font-label-md text-label-md text-on-surface-variant">Loading bookings ledger...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Active Bookings (2 Columns) */}
          <div className="lg:col-span-2 space-y-md">
            <h3 className="font-title-sm text-title-sm font-bold text-primary">Schedules Ledger</h3>
            <div className="bg-white border border-outline-variant rounded-md shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-primary text-white font-label-md text-[10px] uppercase tracking-wider">
                      <th className="py-3 px-md border-r border-white/10">Resource</th>
                      <th className="py-3 px-md border-r border-white/10">Booked By</th>
                      <th className="py-3 px-md border-r border-white/10">Date</th>
                      <th className="py-3 px-md border-r border-white/10">Time Window</th>
                      <th className="py-3 px-md border-r border-white/10">Status</th>
                      <th className="py-3 px-md text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-xl text-on-surface-variant">
                          No scheduled bookings.
                        </td>
                      </tr>
                    ) : (
                      bookings.map((b) => (
                        <tr
                          key={b.id}
                          className="text-on-surface hover:bg-secondary/10 transition-colors"
                        >
                          <td className="py-3 px-md font-bold text-primary">
                            <div>{b.asset.name}</div>
                            <span className="font-mono text-[9px] text-on-surface-variant font-bold">
                              {b.asset.assetTag} ({b.asset.category?.name})
                            </span>
                          </td>
                          <td className="py-3 px-md font-semibold">{b.employee.name}</td>
                          <td className="py-3 px-md font-mono">
                            {new Date(b.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-md font-mono text-secondary font-bold">
                            {b.startTime} - {b.endTime}
                          </td>
                          <td className="py-3 px-md">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                                b.status === "APPROVED"
                                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                                  : b.status === "CANCELLED"
                                    ? "bg-outline-variant/30 text-on-surface-variant border-transparent"
                                    : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3 px-md text-right font-bold">
                            {b.status === "APPROVED" &&
                              (b.employee.name === user?.employee?.name || user?.role === "Admin") && (
                                <button
                                  onClick={() => handleCancelBooking(b.id)}
                                  className="px-sm py-xs bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-700 rounded text-[9px] font-bold transition-all shadow-sm"
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
          <div className="space-y-md">
            <h3 className="font-title-sm text-title-sm font-bold text-primary">Available Resources</h3>
            <div className="bg-white border border-outline-variant p-md rounded-md shadow-sm space-y-sm">
              {resources.length === 0 ? (
                <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-md">
                  No bookable resources configured.
                </p>
              ) : (
                resources.map((res) => (
                  <div
                    key={res.id}
                    className="p-sm rounded border border-outline-variant/50 bg-surface-container-lowest flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-primary text-xs">{res.name}</p>
                      <p className="text-on-surface-variant text-[10px] mt-xs font-bold">
                        {res.category?.name} • {res.assetTag}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                        res.status === "AVAILABLE"
                          ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                          : "bg-red-500/10 text-red-700 border-red-500/20"
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE BOOKING MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-outline-variant p-lg rounded-lg shadow-lg relative animate-fade-in">
            <div className="flex justify-between items-center pb-sm border-b border-outline-variant mb-md">
              <h3 className="font-headline-sm text-headline-sm text-primary">Reserve Shared Resource</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-outline hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] block">close</span>
              </button>
            </div>

            {error && (
              <div className="mb-md p-sm bg-error/10 border border-error/20 rounded text-error font-body-sm text-body-sm flex items-center gap-xs">
                <span className="material-symbols-outlined text-[16px] text-error shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-md">
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">Select Resource *</label>
                <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                  <select
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none appearance-none"
                    required
                  >
                    <option value="">Choose Resource...</option>
                    {resources.map((res) => (
                      <option key={res.id} value={res.id}>
                        {res.name} [{res.assetTag}]
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
                </div>
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">Booking Date *</label>
                <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">Start Time *</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary">End Time *</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-primary">Purpose of Booking</label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Meeting discussion, transportation requirements..."
                  className="w-full px-sm py-xs rounded border border-outline-variant focus:ring-1 focus:ring-secondary focus:border-secondary outline-none font-body-md text-body-md bg-surface-container-lowest h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-[#1e293b] text-white font-label-md text-label-md rounded flex items-center justify-center transition-all shadow-sm mt-lg"
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
