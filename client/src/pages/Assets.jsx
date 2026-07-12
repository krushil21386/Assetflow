import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Laptop,
  Plus,
  Search,
  Download,
  Printer,
  MoreVertical,
  Wallet,
  Box,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  X
} from "lucide-react";

export const Assets = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const isManagerOrAdmin = user?.role === "Admin" || user?.role === "Asset Manager";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetRes, catRes, deptRes] = await Promise.all([
        api.get("/assets"),
        api.get("/categories"),
        api.get("/departments"),
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

  // Run Local filtering
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = search
      ? asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.assetTag.toLowerCase().includes(search.toLowerCase()) ||
        asset.brand?.toLowerCase().includes(search.toLowerCase()) ||
        asset.serialNumber?.toLowerCase().includes(search.toLowerCase())
      : true;

    const matchesCat = selectedCat ? String(asset.categoryId) === selectedCat : true;
    const matchesDept = selectedDept ? String(asset.departmentId) === selectedDept : true;
    const matchesStatus = selectedStatus ? asset.status === selectedStatus : true;

    return matchesSearch && matchesCat && matchesDept && matchesStatus;
  });

  // Calculate stats
  const totalValue = assets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0);
  const activeCount = assets.filter(a => a.status === 'AVAILABLE' || a.status === 'ALLOCATED').length;
  const maintenanceCount = assets.filter(a => a.status === 'MAINTENANCE').length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
      
      {/* 1. HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-[28px] font-bold text-navy tracking-tight leading-tight">Asset Directory</h1>
          <p className="text-[13px] text-gray-500 mt-1">Manage and monitor global enterprise resource inventory.</p>
        </div>
        {isManagerOrAdmin && (
          <button className="flex items-center gap-2 px-5 py-2.5 bg-navy hover:bg-navy-hover text-white rounded-md font-medium text-[13px] shadow-sm transition-colors">
            <Plus size={16} strokeWidth={2.5} />
            <span>Register New Asset</span>
          </button>
        )}
      </div>

      {/* 2. STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Value */}
        <div className="bg-white rounded-md border border-blue-600 p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="h-10 w-10 rounded bg-blue-50 flex items-center justify-center text-blue-600">
              <Wallet size={20} strokeWidth={2} />
            </div>
            <span className="text-[11px] font-bold text-blue-600">+2.4% vs LY</span>
          </div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Asset Value</p>
          <h3 className="text-2xl font-bold text-navy">${totalValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
        </div>

        {/* Card 2: Deployments */}
        <div className="bg-white rounded-md border border-emerald-500 p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="h-10 w-10 rounded bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Box size={20} strokeWidth={2} />
            </div>
            <span className="text-[11px] font-bold text-emerald-600">89% Utilization</span>
          </div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Active Deployments</p>
          <h3 className="text-2xl font-bold text-navy">{activeCount.toLocaleString()} Units</h3>
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
        </div>

        {/* Card 3: Maintenance */}
        <div className="bg-white rounded-md border border-red-500 p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="h-10 w-10 rounded bg-red-50 flex items-center justify-center text-red-600">
              <Users size={20} strokeWidth={2} />
            </div>
            <span className="text-[11px] font-bold text-red-600">High Priority</span>
          </div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Maintenance Pending</p>
          <h3 className="text-2xl font-bold text-navy">{maintenanceCount} Urgent</h3>
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
        </div>
      </div>

      {/* 3. FILTERS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            FILTERS:
          </span>
          <select 
            value={selectedCat} onChange={e => setSelectedCat(e.target.value)}
            className="h-8 pl-2 pr-8 text-xs bg-white border border-gray-300 rounded focus:border-navy focus:ring-1 focus:ring-navy cursor-pointer text-gray-700"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select 
            value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
            className="h-8 pl-2 pr-8 text-xs bg-white border border-gray-300 rounded focus:border-navy focus:ring-1 focus:ring-navy cursor-pointer text-gray-700"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ALLOCATED">Allocated</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
          <select 
            value={selectedDept} onChange={e => setSelectedDept(e.target.value)}
            className="h-8 pl-2 pr-8 text-xs bg-white border border-gray-300 rounded focus:border-navy focus:ring-1 focus:ring-navy cursor-pointer text-gray-700 hidden sm:block"
          >
            <option value="">Global Region</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <button className="p-1 hover:text-navy hover:bg-gray-100 rounded transition-colors"><Download size={18} /></button>
          <button className="p-1 hover:text-navy hover:bg-gray-100 rounded transition-colors"><Printer size={18} /></button>
          <button className="p-1 hover:text-navy hover:bg-gray-100 rounded transition-colors"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* 4. DATA TABLE */}
      <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-navy text-white text-[10px] font-bold tracking-wider uppercase">
                <th className="py-3 px-4 border-r border-navy-hover">Asset ID / Serial</th>
                <th className="py-3 px-4 border-r border-navy-hover">Category</th>
                <th className="py-3 px-4 border-r border-navy-hover">Status</th>
                <th className="py-3 px-4 border-r border-navy-hover">Location</th>
                <th className="py-3 px-4 text-right">Value (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-[13px]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">Loading directory...</td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">No assets found matching filters.</td>
                </tr>
              ) : (
                filteredAssets.map(asset => {
                  
                  // Status Pill Styling Logic
                  let statusClasses = "bg-gray-100 text-gray-700";
                  let dotColor = "bg-gray-500";
                  if (asset.status === 'AVAILABLE' || asset.status === 'ACTIVE') {
                    statusClasses = "bg-emerald-100 text-emerald-700 border-emerald-200";
                    dotColor = "bg-emerald-500";
                  } else if (asset.status === 'MAINTENANCE' || asset.status === 'DAMAGED') {
                    statusClasses = "bg-red-100 text-red-700 border-red-200";
                    dotColor = "bg-red-500";
                  } else if (asset.status === 'ALLOCATED') {
                    statusClasses = "bg-blue-100 text-blue-700 border-blue-200";
                    dotColor = "bg-blue-500";
                  }

                  return (
                    <tr key={asset.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900">{asset.assetTag}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">SN: {asset.serialNumber || 'N/A'}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {asset.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusClasses}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                          {asset.status === 'AVAILABLE' ? 'AVAILABLE' : asset.status === 'MAINTENANCE' ? 'MAINTENANCE' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-1.5 text-gray-600">
                          <MapPin size={14} className="mt-0.5 shrink-0" />
                          <span className="text-xs">{asset.location || 'Central Store'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900 font-mono">
                        ${(asset.purchaseCost || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table Footer / Pagination */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-between text-[11px] text-gray-600">
          <span>Showing 1-{Math.min(4, filteredAssets.length)} of {filteredAssets.length} assets</span>
          <div className="flex items-center gap-1">
            <button className="h-7 w-7 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50"><ChevronLeft size={14} /></button>
            <button className="h-7 w-7 flex items-center justify-center border border-gray-300 rounded bg-white font-medium hover:bg-gray-50">1</button>
            <button className="h-7 w-7 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* 5. MAP SECTION (Mockup UI) */}
      <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden flex flex-col mt-4">
        <div className="bg-navy text-white px-4 py-2 flex items-center justify-between text-[11px] font-bold tracking-wider uppercase">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            GLOBAL ASSET DISTRIBUTION
          </div>
          <span className="text-gray-400 normal-case font-mono tracking-tighter">Real-time Telemetry Active</span>
        </div>
        <div className="relative h-64 bg-[#f8f9fa] w-full">
          {/* Mock Map Dots */}
          <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-blue-600 rounded-full border border-white shadow-sm ring-2 ring-blue-600/20"></div>
          <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-emerald-500 rounded-full border border-white shadow-sm ring-2 ring-emerald-500/20"></div>
          <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-blue-600 rounded-full border border-white shadow-sm ring-2 ring-blue-600/20"></div>
          
          {/* Map Legend */}
          <div className="absolute bottom-4 right-4 bg-navy/90 backdrop-blur text-white text-[10px] p-2 rounded shadow flex flex-col gap-1.5 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Available / Active
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span> Maintenance Required
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
