import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Tags, Plus, Edit2, Trash2, X } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  description?: string;
  warrantyPeriod: number;
  depreciationYears: number;
  bookable: boolean;
  status: string;
  _count?: { assets: number };
}

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [warrantyPeriod, setWarrantyPeriod] = useState('');
  const [depreciationYears, setDepreciationYears] = useState('');
  const [bookable, setBookable] = useState(false);
  const [status, setStatus] = useState('ACTIVE');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setWarrantyPeriod('12');
    setDepreciationYears('5');
    setBookable(false);
    setStatus('ACTIVE');
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
    setWarrantyPeriod(String(cat.warrantyPeriod));
    setDepreciationYears(String(cat.depreciationYears));
    setBookable(cat.bookable);
    setStatus(cat.status);
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !warrantyPeriod || !depreciationYears) {
      setError('Please fill in all required fields');
      return;
    }

    const payload = {
      name,
      description,
      warrantyPeriod: parseInt(warrantyPeriod, 10),
      depreciationYears: parseInt(depreciationYears, 10),
      bookable,
      status,
    };

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wider glow-text">Asset Categories</h1>
          <p className="text-xs text-gray-400 mt-1">Configure asset templates, depreciation timelines, and bookable states</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-xs glass-button-primary"
        >
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500 mr-2"></div>
          <span>Loading categories list...</span>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-dark-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-dark-border text-gray-400 font-semibold bg-white/5">
                  <th className="py-4 px-6">Category Name</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Warranty (Months)</th>
                  <th className="py-4 px-6">Depreciation (Years)</th>
                  <th className="py-4 px-6">Bookable</th>
                  <th className="py-4 px-6">Assets</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">No categories found. Click "Add Category" to start.</td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="text-gray-300 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 font-bold text-white flex items-center gap-2">
                        <Tags size={16} className="text-brand-400" />
                        <span>{cat.name}</span>
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate">{cat.description || '-'}</td>
                      <td className="py-4 px-6 font-mono">{cat.warrantyPeriod} mo</td>
                      <td className="py-4 px-6 font-mono">{cat.depreciationYears} yrs</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          cat.bookable 
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                            : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                        }`}>
                          {cat.bookable ? 'Bookable' : 'Static'}
                        </span>
                      </td>
                      <td className="py-4 px-6">{cat._count?.assets || 0}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          cat.status === 'ACTIVE' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {cat.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <button 
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-dark-border shadow-2xl relative animate-fade-in">
            <div className="flex justify-between items-center pb-4 border-b border-dark-border mb-6">
              <h3 className="text-base font-bold text-white">{editingId ? 'Edit Category' : 'Create Category'}</h3>
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
                <label className="text-xs font-semibold text-gray-300">Category Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Laptops, Projectors, Vehicles..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of category uses..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Warranty Period *</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={warrantyPeriod}
                      onChange={(e) => setWarrantyPeriod(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm pr-12"
                      placeholder="36"
                      min="0"
                      required
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-500">months</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Depreciation Years *</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={depreciationYears}
                      onChange={(e) => setDepreciationYears(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm pr-12"
                      placeholder="5"
                      min="0"
                      required
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-500">years</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="bookable"
                  checked={bookable}
                  onChange={(e) => setBookable(e.target.checked)}
                  className="rounded border-gray-700 bg-gray-900 text-brand-500 focus:ring-0 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="bookable" className="text-xs font-semibold text-gray-300 cursor-pointer select-none">
                  Enable Resource Booking (for meetings, vehicles, pool items)
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                >
                  <option value="ACTIVE" className="bg-[#080b11]">Active</option>
                  <option value="INACTIVE" className="bg-[#080b11]">Inactive</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-white glass-button-primary text-sm transition-all mt-6"
              >
                {editingId ? 'Save Changes' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
