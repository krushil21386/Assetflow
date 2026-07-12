import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Laptop, Plus, Edit2, Trash2, X, Eye, 
  Search, SlidersHorizontal, Check, RefreshCw, Upload
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface Asset {
  id: number;
  assetTag: string;
  name: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate: string;
  purchaseCost: number;
  vendor?: string;
  warrantyEndDate?: string;
  location?: string;
  condition: string;
  bookable: boolean;
  remarks?: string;
  status: string;
  categoryId: number;
  category: Category;
  departmentId?: number | null;
  department?: Department | null;
  images: Array<{ id: number; imagePath: string }>;
  allocations?: any[];
}

export const Assets: React.FC = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [assetTag, setAssetTag] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [vendor, setVendor] = useState('');
  const [warrantyEndDate, setWarrantyEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [condition, setCondition] = useState('NEW');
  const [bookable, setBookable] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState('AVAILABLE');
  const [files, setFiles] = useState<FileList | null>(null);

  const isManagerOrAdmin = user?.role === 'Admin' || user?.role === 'Asset Manager';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetRes, catRes, deptRes] = await Promise.all([
        api.get('/assets'),
        api.get('/categories'),
        api.get('/departments')
      ]);
      setAssets(assetRes.data);
      setCategories(catRes.data);
      setDepartments(deptRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setAssetTag(`AST-${Date.now().toString().slice(-6)}`);
    setName('');
    setCategoryId(categories[0]?.id ? String(categories[0].id) : '');
    setBrand('');
    setModel('');
    setSerialNumber('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setPurchaseCost('');
    setVendor('');
    setWarrantyEndDate('');
    setLocation('');
    setDepartmentId('');
    setCondition('NEW');
    setBookable(false);
    setRemarks('');
    setStatus('AVAILABLE');
    setFiles(null);
    setError(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, asset: Asset) => {
    e.stopPropagation();
    setEditingId(asset.id);
    setAssetTag(asset.assetTag);
    setName(asset.name);
    setCategoryId(String(asset.categoryId));
    setBrand(asset.brand || '');
    setModel(asset.model || '');
    setSerialNumber(asset.serialNumber || '');
    setPurchaseDate(new Date(asset.purchaseDate).toISOString().split('T')[0]);
    setPurchaseCost(String(asset.purchaseCost));
    setVendor(asset.vendor || '');
    setWarrantyEndDate(asset.warrantyEndDate ? new Date(asset.warrantyEndDate).toISOString().split('T')[0] : '');
    setLocation(asset.location || '');
    setDepartmentId(asset.departmentId ? String(asset.departmentId) : '');
    setCondition(asset.condition);
    setBookable(asset.bookable);
    setRemarks(asset.remarks || '');
    setStatus(asset.status);
    setFiles(null);
    setError(null);
    setFormOpen(true);
  };

  const handleOpenDetail = async (asset: Asset) => {
    try {
      const res = await api.get(`/assets/${asset.id}`);
      setSelectedAsset(res.data);
      setDetailOpen(true);
    } catch (e) {
      console.error('Failed to load asset details', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetTag || !name || !categoryId || !purchaseDate || !purchaseCost) {
      setError('Please fill in all required fields');
      return;
    }

    setError(null);
    const formData = new FormData();
    formData.append('assetTag', assetTag);
    formData.append('name', name);
    formData.append('categoryId', categoryId);
    formData.append('brand', brand);
    formData.append('model', model);
    formData.append('serialNumber', serialNumber);
    formData.append('purchaseDate', purchaseDate);
    formData.append('purchaseCost', purchaseCost);
    formData.append('vendor', vendor);
    formData.append('warrantyEndDate', warrantyEndDate);
    formData.append('location', location);
    formData.append('departmentId', departmentId);
    formData.append('condition', condition);
    formData.append('bookable', String(bookable));
    formData.append('remarks', remarks);
    formData.append('status', status);

    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }
    }

    try {
      const headers = { 'Content-Type': 'multipart/form-data' };
      if (editingId) {
        await api.put(`/assets/${editingId}`, formData, { headers });
      } else {
        await api.post('/assets', formData, { headers });
      }
      setFormOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await api.delete(`/assets/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete asset.');
    }
  };

  // Run Local filtering
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = search ? (
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.assetTag.toLowerCase().includes(search.toLowerCase()) ||
      asset.brand?.toLowerCase().includes(search.toLowerCase()) ||
      asset.serialNumber?.toLowerCase().includes(search.toLowerCase())
    ) : true;

    const matchesCat = selectedCat ? asset.categoryId === parseInt(selectedCat, 10) : true;
    const matchesDept = selectedDept ? asset.departmentId === parseInt(selectedDept, 10) : true;
    const matchesStatus = selectedStatus ? asset.status === selectedStatus : true;

    return matchesSearch && matchesCat && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* 1. HEADER & ACTIONS */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wider glow-text">Asset Inventory</h1>
          <p className="text-xs text-gray-400 mt-1">Track physical assets, locations, warranties, and status history</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-dark-border hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={16} />
          </button>
          {isManagerOrAdmin && (
            <button 
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-xs glass-button-primary"
            >
              <Plus size={16} />
              <span>Register Asset</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. FILTERS PANEL */}
      <div className="glass-card p-4 rounded-2xl border border-dark-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search by tag, name, serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        <div>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full px-4 py-2 rounded-xl glass-input text-xs"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id} className="bg-[#080b11]">{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-4 py-2 rounded-xl glass-input text-xs"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id} className="bg-[#080b11]">{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2 rounded-xl glass-input text-xs"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE" className="bg-[#080b11]">Available</option>
            <option value="ALLOCATED" className="bg-[#080b11]">Allocated</option>
            <option value="RESERVED" className="bg-[#080b11]">Reserved</option>
            <option value="MAINTENANCE" className="bg-[#080b11]">Maintenance</option>
            <option value="LOST" className="bg-[#080b11]">Lost</option>
            <option value="RETIRED" className="bg-[#080b11]">Retired</option>
            <option value="DISPOSED" className="bg-[#080b11]">Disposed</option>
          </select>
        </div>
      </div>

      {/* 3. INVENTORY TABLE */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500 mr-2"></div>
          <span>Loading assets data...</span>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-dark-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-dark-border text-gray-400 font-semibold bg-white/5">
                  <th className="py-4 px-6">Asset Tag</th>
                  <th className="py-4 px-6">Asset Name</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Current Location</th>
                  <th className="py-4 px-6">Condition</th>
                  <th className="py-4 px-6">Bookable</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">No assets matching criteria.</td>
                  </tr>
                ) : (
                  filteredAssets.map((asset) => (
                    <tr 
                      key={asset.id} 
                      onClick={() => handleOpenDetail(asset)}
                      className="text-gray-300 hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6 font-mono text-gray-400 font-bold">{asset.assetTag}</td>
                      <td className="py-4 px-6 font-bold text-white">
                        <div className="flex items-center gap-3">
                          {asset.images[0] ? (
                            <img 
                              src={`http://localhost:5000/${asset.images[0].imagePath}`} 
                              alt={asset.name} 
                              className="h-10 w-10 object-cover rounded-lg border border-dark-border"
                              onError={(e) => { (e.target as any).src = 'https://placehold.co/100x100?text=Asset'; }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-white/5 border border-dark-border flex items-center justify-center text-gray-500">
                              <Laptop size={16} />
                            </div>
                          )}
                          <div>
                            <div>{asset.name}</div>
                            <div className="text-[10px] text-gray-500 font-normal mt-0.5">{asset.brand} {asset.model}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">{asset.category.name}</td>
                      <td className="py-4 px-6">
                        <div>{asset.department?.name || 'Central Store'}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{asset.location || '-'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          asset.condition === 'NEW' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          asset.condition === 'GOOD' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          asset.condition === 'DAMAGED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {asset.condition}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          asset.bookable ? 'bg-purple-500/10 text-purple-400' : 'text-gray-500'
                        }`}>{asset.bookable ? 'Yes' : 'No'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          asset.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          asset.status === 'ALLOCATED' ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' :
                          asset.status === 'MAINTENANCE' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenDetail(asset); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                        {isManagerOrAdmin && (
                          <>
                            <button 
                              onClick={(e) => handleOpenEdit(e, asset)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={(e) => handleDelete(e, asset.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
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

      {/* DETAIL MODAL */}
      {detailOpen && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl glass-panel p-6 rounded-3xl border border-dark-border shadow-2xl relative animate-fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-dark-border mb-6">
              <div>
                <h3 className="text-base font-bold text-white">Asset Details</h3>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{selectedAsset.assetTag} • Category: {selectedAsset.category.name}</p>
              </div>
              <button onClick={() => setDetailOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Content Layout */}
            <div className="space-y-6">
              {/* Top details cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Images column */}
                <div className="md:col-span-1 space-y-2">
                  <div className="h-40 w-full rounded-2xl bg-white/5 border border-dark-border overflow-hidden flex items-center justify-center">
                    {selectedAsset.images[0] ? (
                      <img 
                        src={`http://localhost:5000/${selectedAsset.images[0].imagePath}`} 
                        alt={selectedAsset.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Laptop size={48} className="text-gray-600" />
                    )}
                  </div>
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {selectedAsset.images.slice(1).map(img => (
                      <img 
                        key={img.id} 
                        src={`http://localhost:5000/${img.imagePath}`} 
                        alt="attachment" 
                        className="h-10 w-10 object-cover rounded-lg border border-dark-border shrink-0"
                      />
                    ))}
                  </div>
                </div>

                {/* Primary Data column */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 block">Asset Name</span>
                    <span className="text-white font-bold">{selectedAsset.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Brand / Model</span>
                    <span className="text-white font-semibold">{selectedAsset.brand || '-'} / {selectedAsset.model || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Serial Number</span>
                    <span className="text-white font-mono">{selectedAsset.serialNumber || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Purchase Cost</span>
                    <span className="text-white font-semibold">₹{selectedAsset.purchaseCost.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Purchase Date</span>
                    <span className="text-white">{new Date(selectedAsset.purchaseDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Vendor</span>
                    <span className="text-white">{selectedAsset.vendor || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Location / Department</span>
                    <span className="text-white">{selectedAsset.location || 'Central Store'} / {selectedAsset.department?.name || 'IT Warehouse'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Status / Condition</span>
                    <span className="text-white flex items-center gap-1.5 mt-0.5">
                      <span className="h-2 w-2 rounded-full bg-brand-500 inline-block"></span>
                      <span>{selectedAsset.status} • {selectedAsset.condition}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Remarks Box */}
              {selectedAsset.remarks && (
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs">
                  <span className="text-gray-500 block mb-1">Remarks / Description</span>
                  <p className="text-gray-300">{selectedAsset.remarks}</p>
                </div>
              )}

              {/* Asset Allocation Sessions */}
              <div className="border-t border-dark-border pt-4">
                <h4 className="text-xs font-bold text-white mb-3">Allocation History</h4>
                {selectedAsset.allocations && selectedAsset.allocations.length === 0 ? (
                  <p className="text-[10px] text-gray-500 py-1">No allocation history recorded.</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {selectedAsset.allocations?.map((alloc: any) => (
                      <div key={alloc.id} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-white">Assigned to: {alloc.employee.name} ({alloc.employee.employeeCode})</p>
                          <p className="text-gray-500 mt-0.5">Allocated By: {alloc.allocatedBy.name} • On {new Date(alloc.allocationDate).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-semibold border ${
                            alloc.status === 'ACTIVE' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                          }`}>
                            {alloc.status}
                          </span>
                          {alloc.actualReturnDate && (
                            <p className="text-[9px] text-gray-500 mt-1">Returned: {new Date(alloc.actualReturnDate).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE/EDIT FORM MODAL */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl glass-panel p-6 rounded-3xl border border-dark-border shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-dark-border mb-6">
              <h3 className="text-base font-bold text-white">{editingId ? 'Edit Asset' : 'Register New Asset'}</h3>
              <button onClick={() => setFormOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Asset Tag *</label>
                  <input
                    type="text"
                    value={assetTag}
                    onChange={(e) => setAssetTag(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl glass-input"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Asset Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. MacBook Pro M3"
                    className="w-full px-4 py-2 rounded-xl glass-input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl glass-input"
                    required
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id} className="bg-[#080b11]">{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl glass-input"
                  >
                    <option value="">None (IT Storage)</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id} className="bg-[#080b11]">{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Brand</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl glass-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Model</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl glass-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Serial Number</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl glass-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Purchase Date *</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl glass-input"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Purchase Cost (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(e.target.value)}
                    placeholder="1200.00"
                    className="w-full px-4 py-2 rounded-xl glass-input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Vendor</label>
                  <input
                    type="text"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl glass-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Warranty End Date</label>
                  <input
                    type="date"
                    value={warrantyEndDate}
                    onChange={(e) => setWarrantyEndDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl glass-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Physical Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Building B, Rm 401"
                    className="w-full px-4 py-2 rounded-xl glass-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl glass-input"
                  >
                    <option value="NEW" className="bg-[#080b11]">New</option>
                    <option value="GOOD" className="bg-[#080b11]">Good</option>
                    <option value="FAIR" className="bg-[#080b11]">Fair</option>
                    <option value="POOR" className="bg-[#080b11]">Poor</option>
                    <option value="DAMAGED" className="bg-[#080b11]">Damaged</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl glass-input"
                  >
                    <option value="AVAILABLE" className="bg-[#080b11]">Available</option>
                    <option value="ALLOCATED" className="bg-[#080b11]">Allocated</option>
                    <option value="RESERVED" className="bg-[#080b11]">Reserved</option>
                    <option value="MAINTENANCE" className="bg-[#080b11]">Maintenance</option>
                    <option value="LOST" className="bg-[#080b11]">Lost</option>
                    <option value="RETIRED" className="bg-[#080b11]">Retired</option>
                    <option value="DISPOSED" className="bg-[#080b11]">Disposed</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="bookableCheck"
                    checked={bookable}
                    onChange={(e) => setBookable(e.target.checked)}
                    className="rounded border-gray-700 bg-gray-900 text-brand-500 focus:ring-0 h-4 w-4 cursor-pointer"
                  />
                  <label htmlFor="bookableCheck" className="text-gray-300 cursor-pointer select-none">Bookable</label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Asset Photo Attachments</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-gray-700 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-2 pb-3 text-gray-500">
                      <Upload size={18} className="mb-1" />
                      <p className="text-[10px]"><span className="font-semibold">Click to upload</span> images (Max 5)</p>
                      <p className="text-[8px] mt-0.5">{files ? `${files.length} file(s) selected` : 'PNG, JPG or JPEG'}</p>
                    </div>
                    <input 
                      type="file" 
                      multiple 
                      onChange={(e) => setFiles(e.target.files)} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Remarks / Notes</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl glass-input h-16"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-white glass-button-primary text-sm transition-all mt-6"
              >
                {editingId ? 'Save Asset' : 'Register Asset'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
