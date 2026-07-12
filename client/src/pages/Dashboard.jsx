import React, { useState, useMemo } from 'react';
import RegisterAssetModal from '../components/RegisterAssetModal';
import './Dashboard.css';

const initialAssets = [
  { id: 'AF-2904-X1', serial: '8829-1120-QWER', category: 'Enterprise Server Rack', status: 'Active', location: 'NYC Data Center B-4', value: 142500.00 },
  { id: 'AF-5501-M8', serial: '4402-9981-ASDF', category: 'Industrial Excavator', status: 'Maintenance', location: 'Berlin Logistics Hub', value: 890000.00 },
  { id: 'AF-1102-L2', serial: '1002-3344-ZXC1', category: 'Workstation Pro Gen 5', status: 'Available', location: 'London Main Office', value: 4200.00 },
  { id: 'AF-9921-T1', serial: '7761-0021-VBBN', category: 'Heavy Logistics Truck', status: 'Active', location: 'Tokyo Transit Center', value: 125750.00 }
];

export default function Dashboard({ onLogout }) {
  const [assets, setAssets] = useState(initialAssets);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  
  // Format currency
  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  // Derived metrics
  const totalValue = useMemo(() => assets.reduce((acc, curr) => acc + curr.value, 0), [assets]);
  const activeCount = useMemo(() => assets.filter(a => a.status === 'Active').length, [assets]);
  const maintenanceCount = useMemo(() => assets.filter(a => a.status === 'Maintenance').length, [assets]);
  const utilization = Math.round((activeCount / Math.max(assets.length, 1)) * 100);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = asset.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            asset.serial.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            asset.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All Categories' || asset.category.includes(categoryFilter) || categoryFilter.includes(asset.category.split(' ')[0]);
      const matchesStatus = statusFilter === 'All Statuses' || asset.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [assets, searchQuery, categoryFilter, statusFilter]);

  const handleAddAsset = (newAsset) => {
    setAssets([newAsset, ...assets]);
  };

  const getStatusChip = (status) => {
    if (status === 'Active') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter bg-on-tertiary-container/10 text-on-tertiary-container border border-on-tertiary-container/20">
          <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container mr-1.5 animate-pulse"></span> Active
        </span>
      );
    } else if (status === 'Maintenance') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter bg-error/10 text-error border border-error/20">
          <span className="w-1.5 h-1.5 rounded-full bg-error mr-1.5"></span> Maintenance
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter bg-secondary/10 text-secondary border border-secondary/20">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5"></span> Available
        </span>
      );
    }
  };

  return (
    <div className="flex bg-background min-h-screen">
      {/* SideNavBar */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface flex flex-col py-md border-r border-outline-variant z-30">
        <div className="px-md mb-xl">
          <h1 className="font-headline-md text-headline-md font-extrabold text-primary tracking-tight">AssetFlow</h1>
          <p className="font-label-md text-label-md text-on-surface-variant opacity-60">Enterprise Resource</p>
        </div>
        <nav className="flex-1 space-y-1">
          <a href="#" className="flex items-center px-md py-sm text-on-surface-variant hover:bg-surface-container-high font-label-md text-label-md transition-colors duration-200">
            <span className="material-symbols-outlined mr-md">dashboard</span> Dashboard
          </a>
          <a href="#" className="flex items-center px-md py-sm bg-primary text-navy font-label-md text-label-md transition-colors duration-200">
            <span className="material-symbols-outlined mr-md">inventory_2</span> Asset Directory
          </a>
          <a href="#" className="flex items-center px-md py-sm text-on-surface-variant hover:bg-surface-container-high font-label-md text-label-md transition-colors duration-200">
            <span className="material-symbols-outlined mr-md">hub</span> Resource Allocation
          </a>
          <a href="#" className="flex items-center px-md py-sm text-on-surface-variant hover:bg-surface-container-high font-label-md text-label-md transition-colors duration-200">
            <span className="material-symbols-outlined mr-md">event_available</span> Bookings
          </a>
          <a href="#" className="flex items-center px-md py-sm text-on-surface-variant hover:bg-surface-container-high font-label-md text-label-md transition-colors duration-200">
            <span className="material-symbols-outlined mr-md">build</span> Maintenance
          </a>
          <a href="#" className="flex items-center px-md py-sm text-on-surface-variant hover:bg-surface-container-high font-label-md text-label-md transition-colors duration-200">
            <span className="material-symbols-outlined mr-md">fact_check</span> Audit
          </a>
          <a href="#" className="flex items-center px-md py-sm text-on-surface-variant hover:bg-surface-container-high font-label-md text-label-md transition-colors duration-200">
            <span className="material-symbols-outlined mr-md">analytics</span> Reports
          </a>
        </nav>
        <div className="mt-auto px-md space-y-1 pt-md border-t border-outline-variant">
          <a href="#" className="flex items-center px-md py-sm text-on-surface-variant hover:bg-surface-container-high font-label-md text-label-md">
            <span className="material-symbols-outlined mr-md">settings</span> Settings
          </a>
          <button onClick={onLogout} className="w-full flex items-center px-md py-sm text-error hover:bg-error/10 font-label-md text-label-md transition-colors">
            <span className="material-symbols-outlined mr-md">logout</span> Logout
          </button>
          <div className="px-md py-md mt-sm bg-surface-container-low rounded-lg border border-outline-variant">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">System Status</p>
            <p className="font-body-sm text-body-sm text-on-tertiary-container mt-1 font-bold">Healthy</p>
          </div>
        </div>
      </aside>

      {/* TopNavBar */}
      <header className="fixed top-0 left-64 right-0 bg-surface-container-lowest/70 backdrop-blur-md z-20 border-b border-outline-variant shadow-sm flex justify-between items-center px-lg py-sm">
        <div className="flex items-center flex-1 max-w-xl">
          <div className="relative w-full input-focus-effect rounded-lg">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              type="text" 
              placeholder="Search assets, serials, or locations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-body-md text-body-md focus:outline-none bg-transparent"
            />
          </div>
        </div>
        <div className="flex items-center gap-md">
          <button className="p-2 hover:bg-surface-container-high rounded-full transition-all active:scale-95 text-on-surface">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 hover:bg-surface-container-high rounded-full transition-all active:scale-95 text-on-surface">
            <span className="material-symbols-outlined">apps</span>
          </button>
          <button className="p-2 hover:bg-surface-container-high rounded-full transition-all active:scale-95 text-on-surface">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
          <div className="h-8 w-px bg-outline-variant mx-2"></div>
          <div className="flex items-center gap-sm cursor-pointer hover:opacity-80 transition-opacity">
            <div className="text-right">
              <p className="font-label-md text-label-md text-on-surface leading-tight">Admin User</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">System Administrator</p>
            </div>
            <img className="w-10 h-10 rounded-full border border-outline-variant object-cover" alt="Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxMKUMYWdZWMRZTFoHO1dCOoveTAaZeQpAxtdMddP3KkFkGYsvxOPdii1Oeq3Y0wILyeBFr2PGpa1V6ZWqU8GZEyV1VcvbtL9RBqSiuDuOx-MjJXWj89nO-56VrEiQCLuFOhTOZl79AfV-0GIwCc2Uznbbn6qT3Eo1OHM7kgSm0cZnawio0GyhhzfTX_zRD5F-4tGVD6-0JHXDuuhkieIMm6FfiMMqn3NO3Mu_3je3TYbMhMOJrP5IEgoM6tZxb7T6kxBRWMlGxBA" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 mt-[64px] p-lg flex-1">
        {/* Header & Summary Cards */}
        <div className="mb-lg">
          <div className="flex justify-between items-end mb-md">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Asset Directory</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Manage and monitor global enterprise resource inventory.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-navy px-lg py-md rounded-lg flex items-center gap-sm font-label-md text-label-md hover:bg-primary-container transition-colors border border-primary active:scale-95"
            >
              <span className="material-symbols-outlined">add</span> Register New Asset
            </button>
          </div>
          
          {/* Bento Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div className="bg-white border border-gray-200 p-md rounded-xl flex flex-col justify-between border-l-4 border-secondary hover:shadow-sm transition-all hover:border-secondary-fixed-dim">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-lg">account_balance_wallet</span>
                <span className="font-label-sm text-label-sm text-secondary">+2.4% vs LY</span>
              </div>
              <div className="mt-md">
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Asset Value</p>
                <h3 className="font-headline-md text-headline-md text-primary mt-1">{formatCurrency(totalValue)}</h3>
              </div>
            </div>
            <div className="bg-white border border-gray-200 p-md rounded-xl flex flex-col justify-between border-l-4 border-on-tertiary-container hover:shadow-sm transition-all hover:border-tertiary-fixed-dim">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-on-tertiary-container bg-on-tertiary-container/10 p-2 rounded-lg">deployed_code</span>
                <span className="font-label-sm text-label-sm text-on-tertiary-container">{utilization}% Utilization</span>
              </div>
              <div className="mt-md">
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Active Deployments</p>
                <h3 className="font-headline-md text-headline-md text-primary mt-1">{activeCount} Units</h3>
              </div>
            </div>
            <div className="bg-white border border-gray-200 p-md rounded-xl flex flex-col justify-between border-l-4 border-error hover:shadow-sm transition-all hover:border-error-container">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-error bg-error/10 p-2 rounded-lg">engineering</span>
                <span className="font-label-sm text-label-sm text-error">High Priority</span>
              </div>
              <div className="mt-md">
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Maintenance Pending</p>
                <h3 className="font-headline-md text-headline-md text-primary mt-1">{maintenanceCount} Urgent</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-gray-200 p-sm rounded-lg mb-md flex flex-wrap items-center gap-md">
          <div className="flex items-center gap-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            <span className="font-label-md text-label-md uppercase">Filters:</span>
          </div>
          <select 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-transparent border-outline-variant rounded font-body-sm text-body-sm py-1 pr-8 focus:ring-secondary focus:outline-none"
          >
            <option>All Categories</option>
            <option>IT Hardware</option>
            <option>Heavy Machinery</option>
            <option>Vehicles</option>
            <option>Enterprise</option>
            <option>Workstation</option>
            <option>Industrial</option>
          </select>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-transparent border-outline-variant rounded font-body-sm text-body-sm py-1 pr-8 focus:ring-secondary focus:outline-none"
          >
            <option>All Statuses</option>
            <option>Available</option>
            <option>Maintenance</option>
            <option>Active</option>
          </select>
          <select className="bg-transparent border-outline-variant rounded font-body-sm text-body-sm py-1 pr-8 focus:ring-secondary focus:outline-none">
            <option>Global Region</option>
            <option>North America</option>
            <option>EMEA</option>
            <option>APAC</option>
          </select>
          <div className="ml-auto flex items-center gap-sm">
            <button className="p-1 hover:text-secondary text-on-surface-variant transition-colors"><span className="material-symbols-outlined">download</span></button>
            <button className="p-1 hover:text-secondary text-on-surface-variant transition-colors"><span className="material-symbols-outlined">print</span></button>
            <div className="h-4 w-px bg-outline-variant"></div>
            <button className="p-1 hover:text-secondary text-on-surface-variant transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-lg">
          <table className="w-full text-left border-collapse">
            <thead className="obsidian-header">
              <tr>
                <th className="px-md py-sm font-label-md text-label-md uppercase tracking-wider border-r border-white/10">Asset ID / Serial</th>
                <th className="px-md py-sm font-label-md text-label-md uppercase tracking-wider border-r border-white/10">Category</th>
                <th className="px-md py-sm font-label-md text-label-md uppercase tracking-wider border-r border-white/10">Status</th>
                <th className="px-md py-sm font-label-md text-label-md uppercase tracking-wider border-r border-white/10">Location</th>
                <th className="px-md py-sm font-label-md text-label-md uppercase tracking-wider text-right">Value (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-md py-xl text-center font-body-md text-on-surface-variant">No assets found matching filters.</td>
                </tr>
              ) : (
                filteredAssets.map((asset, idx) => (
                  <tr key={idx} className="transition-all hover:bg-secondary/10 cursor-pointer group">
                    <td className="px-md py-sm">
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-primary font-bold">{asset.id}</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">SN: {asset.serial}</span>
                      </div>
                    </td>
                    <td className="px-md py-sm font-body-md text-body-md text-on-surface">{asset.category}</td>
                    <td className="px-md py-sm">
                      {getStatusChip(asset.status)}
                    </td>
                    <td className="px-md py-sm font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">location_on</span> {asset.location}
                    </td>
                    <td className="px-md py-sm font-label-md text-label-md text-primary text-right font-bold">{formatCurrency(asset.value)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="px-md py-sm bg-surface-container-low border-t border-outline-variant flex justify-between items-center">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Showing 1-{filteredAssets.length} of {assets.length} assets</span>
            <div className="flex items-center gap-xs">
              <button className="p-1 border border-outline-variant rounded hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
              <span className="px-sm font-label-sm text-label-sm text-primary bg-white border border-secondary/20 rounded">1</span>
              <button className="p-1 border border-outline-variant rounded hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
            </div>
          </div>
        </div>

        {/* Distribution Map */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-xl">
          <div className="px-md py-sm border-b border-outline-variant flex justify-between items-center obsidian-header">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined">public</span>
              <h4 className="font-label-md text-label-md uppercase tracking-wider">Global Asset Distribution</h4>
            </div>
            <span className="font-label-sm text-label-sm text-secondary-fixed opacity-70">Real-time Telemetry Active</span>
          </div>
          <div className="relative h-64 bg-surface-container-highest flex items-center justify-center">
            <div className="absolute inset-0 w-full h-full opacity-40 grayscale bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDkyCWF7r-oiMB9PVCMOEvNNvsWCmoL3b_siOxt9Bdy4JcQDgtR7AbYxHB0AZCYdCP-xqiKilBASdFEMYP-5IN3gHP1ZJ7oDHNd19rva8_5YOqedC5XH9HIHEyKZsu5dQUuR9rs5uduEdYn8olWNCgZRsivdTBWUqRexZsXFaw5N3hTeIH3k3TmZp8xBIAfQAvJFhnRWdVHFPVffTyuZ9w_h0LhURXY9r_k3NkicEXBmr22XbZug2Rp61LPMUqtljZyGOffjo4JEuI")' }}></div>
            
            {/* Map Indicators Overlay */}
            <div className="relative z-10 w-full h-full p-lg">
              <div className="absolute top-1/4 left-1/4 group cursor-pointer">
                <div className="w-3 h-3 bg-secondary rounded-full animate-ping"></div>
                <div className="w-3 h-3 bg-secondary rounded-full absolute top-0 border border-white"></div>
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-primary text-navy p-2 rounded text-[10px] whitespace-nowrap z-20 shadow-md">
                  North America: 452 Assets
                </div>
              </div>
              <div className="absolute top-1/3 left-1/2 group cursor-pointer">
                <div className="w-3 h-3 bg-on-tertiary-container rounded-full animate-ping"></div>
                <div className="w-3 h-3 bg-on-tertiary-container rounded-full absolute top-0 border border-white"></div>
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-primary text-navy p-2 rounded text-[10px] whitespace-nowrap z-20 shadow-md">
                  EMEA: 389 Assets
                </div>
              </div>
              <div className="absolute bottom-1/3 right-1/4 group cursor-pointer">
                <div className="w-3 h-3 bg-secondary rounded-full animate-ping"></div>
                <div className="w-3 h-3 bg-secondary rounded-full absolute top-0 border border-white"></div>
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-primary text-navy p-2 rounded text-[10px] whitespace-nowrap z-20 shadow-md">
                  APAC: 407 Assets
                </div>
              </div>
            </div>
            
            {/* Legend Overlay */}
            <div className="absolute bottom-md right-md bg-primary-container/90 backdrop-blur p-sm rounded border border-white/10 z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-sm">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span className="font-label-sm text-label-sm text-navy/80">Available / Active</span>
                </div>
                <div className="flex items-center gap-sm">
                  <span className="w-2 h-2 rounded-full bg-error"></span>
                  <span className="font-label-sm text-label-sm text-navy/80">Maintenance Required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <RegisterAssetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddAsset} />
    </div>
  );
}
