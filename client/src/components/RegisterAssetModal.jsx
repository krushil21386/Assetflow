import React, { useState } from 'react';

export default function RegisterAssetModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    id: '',
    serial: '',
    category: 'IT Hardware',
    status: 'Available',
    location: '',
    value: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...formData,
      value: parseFloat(formData.value) || 0
    });
    setFormData({ id: '', serial: '', category: 'IT Hardware', status: 'Available', location: '', value: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-lg rounded-xl overflow-hidden shadow-2xl bg-[#080b11]/90 border border-white/10 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-primary/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-brand-400">add_circle</span>
            <h3 className="font-headline-md text-headline-md text-white">Register New Asset</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-gray-300">ASSET ID</label>
              <input required type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-brand-500" placeholder="e.g. AF-1234" />
            </div>
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-gray-300">SERIAL NUMBER</label>
              <input required type="text" value={formData.serial} onChange={e => setFormData({...formData, serial: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-brand-500" placeholder="Serial" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-gray-300">CATEGORY</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-brand-500">
                <option>IT Hardware</option>
                <option>Heavy Machinery</option>
                <option>Vehicles</option>
                <option>Enterprise Server Rack</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-gray-300">INITIAL STATUS</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-brand-500">
                <option>Available</option>
                <option>Active</option>
                <option>Maintenance</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-gray-300">LOCATION</label>
              <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-brand-500" placeholder="Data Center A" />
            </div>
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-gray-300">VALUE (USD)</label>
              <input required type="number" step="0.01" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-brand-500" placeholder="0.00" />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 font-label-md text-label-md text-gray-300 hover:text-white transition-colors">CANCEL</button>
            <button type="submit" className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white font-label-md text-label-md rounded transition-colors shadow-sm">REGISTER ASSET</button>
          </div>
        </form>
      </div>
    </div>
  );
}
