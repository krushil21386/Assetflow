import React, { useState } from 'react';

export default function RegisterAssetModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    id: '',
    serial: '',
    category: 'Enterprise Server Rack',
    status: 'Available',
    location: '',
    value: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...formData,
      value: parseFloat(formData.value) || 0
    });
    setFormData({
      id: '',
      serial: '',
      category: 'Enterprise Server Rack',
      status: 'Available',
      location: '',
      value: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-lg rounded-xl shadow-lg bg-surface-container-lowest overflow-hidden flex flex-col">
        <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h2 className="font-headline-sm text-headline-sm text-primary">Register New Asset</h2>
          <button onClick={onClose} className="p-1 text-on-surface-variant hover:bg-surface-container-high rounded transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-lg space-y-md overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface">Asset ID</label>
              <input required name="id" value={formData.id} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded h-9 px-sm font-body-md text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none" placeholder="e.g. AF-9999-X9" />
            </div>
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface">Serial Number</label>
              <input required name="serial" value={formData.serial} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded h-9 px-sm font-body-md text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none" placeholder="e.g. 1234-ABCD-5678" />
            </div>
          </div>
          
          <div className="space-y-xs">
            <label className="font-label-md text-label-md text-on-surface">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded h-9 px-sm font-body-md text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none">
              <option>Enterprise Server Rack</option>
              <option>Industrial Excavator</option>
              <option>Workstation Pro Gen 5</option>
              <option>Heavy Logistics Truck</option>
            </select>
          </div>

          <div className="space-y-xs">
            <label className="font-label-md text-label-md text-on-surface">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded h-9 px-sm font-body-md text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none">
              <option>Available</option>
              <option>Active</option>
              <option>Maintenance</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface">Location</label>
              <input required name="location" value={formData.location} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded h-9 px-sm font-body-md text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none" placeholder="e.g. NYC Data Center" />
            </div>
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface">Value (USD)</label>
              <input required type="number" step="0.01" name="value" value={formData.value} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded h-9 px-sm font-body-md text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none" placeholder="0.00" />
            </div>
          </div>
        </form>
        
        <div className="px-lg py-md border-t border-outline-variant bg-surface-container-low flex justify-end gap-sm">
          <button type="button" onClick={onClose} className="px-md py-sm font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high rounded transition-colors border border-transparent hover:border-outline-variant">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="px-md py-sm bg-[#10b981] hover:bg-[#059669] text-white font-label-md text-label-md rounded flex items-center justify-center gap-sm transition-all active:scale-[0.98]">
            <span className="material-symbols-outlined text-[18px]">add_circle</span> Register Asset
          </button>
        </div>
      </div>
    </div>
  );
}
