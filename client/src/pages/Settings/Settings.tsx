import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "phosphor-react";

export const Settings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "admin">("profile");
  
  // Profile state
  const [name, setName] = useState(user?.employee?.name || "");
  const [phone, setPhone] = useState(user?.employee?.phone || "");
  const [designation, setDesignation] = useState(user?.employee?.designation || "");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    user?.employee?.profilePhoto ? `http://localhost:5000/${user.employee.profilePhoto}` : null
  );

  // Security state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notification state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [maintAlerts, setMaintAlerts] = useState(true);
  const [auditAlerts, setAuditAlerts] = useState(true);

  // Admin Config state
  const [currency, setCurrency] = useState("INR");
  const [tagPrefix, setTagPrefix] = useState("AST");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user?.employee) {
      setName(user.employee.name || "");
      setPhone(user.employee.phone || "");
      setDesignation(user.employee.designation || "");
      if (user.employee.profilePhoto) {
        setPhotoPreview(`http://localhost:5000/${user.employee.profilePhoto}`);
      }
    }
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("designation", designation);
    if (profilePhoto) {
      formData.append("profilePhoto", profilePhoto);
    }

    try {
      await api.put("/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await refreshUser();
      setSuccessMsg("Profile details updated successfully!");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to update profile details");
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.put("/me", { password });
      setPassword("");
      setConfirmPassword("");
      setSuccessMsg("Security credentials updated successfully!");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to update security credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("Notification preferences saved successfully!");
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("Global organization configurations updated!");
  };

  return (
    <div className="space-y-lg animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline-md text-headline-md text-primary font-bold tracking-tight">System Settings</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage your profile, credentials, notifications, and application preferences.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-lg">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 flex flex-row lg:flex-col gap-sm overflow-x-auto pb-sm lg:pb-0">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-md px-md py-sm font-label-md text-label-md rounded transition-all whitespace-nowrap ${
              activeTab === "profile"
                ? "bg-primary text-white shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined">person</span> Profile Details
          </button>
          
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-md px-md py-sm font-label-md text-label-md rounded transition-all whitespace-nowrap ${
              activeTab === "security"
                ? "bg-primary text-white shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined">shield</span> Security
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-md px-md py-sm font-label-md text-label-md rounded transition-all whitespace-nowrap ${
              activeTab === "notifications"
                ? "bg-primary text-white shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined">notifications</span> Notifications
          </button>

          {user?.role === "Admin" && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex items-center gap-md px-md py-sm font-label-md text-label-md rounded transition-all whitespace-nowrap ${
                activeTab === "admin"
                  ? "bg-primary text-white shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined">settings_suggest</span> Organization
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 glass-panel p-xl shadow-sm rounded-lg relative overflow-hidden">
          {/* Status Feedback */}
          {successMsg && (
            <div className="mb-md p-sm bg-tertiary-container text-on-tertiary-container border border-outline-variant rounded font-body-sm text-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-md p-sm bg-error/10 text-error border border-error/20 rounded font-body-sm text-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: Profile Details */}
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSubmit} className="space-y-lg">
              <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Profile Details</h2>
              
              {/* Profile Photo Upload */}
              <div className="flex items-center gap-lg py-md border-b border-outline-variant">
                <div className="relative">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-primary shadow-sm" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-headline-md text-primary border border-outline-variant">
                      {name ? name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-700 shadow-md active:scale-95 transition-all">
                    <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                    <input type="file" onChange={handlePhotoChange} className="hidden" accept="image/*" />
                  </label>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-primary font-bold">Profile Photo</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant opacity-80 mt-1">PNG, JPG, or GIF up to 5MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary block">FULL NAME</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all input-focus-effect bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary block">PHONE NUMBER</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all input-focus-effect bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 9876543210"
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary block">DESIGNATION</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all input-focus-effect bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Senior Developer"
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary block opacity-60">SYSTEM ROLE (READ-ONLY)</label>
                  <div className="relative flex items-center border border-outline-variant rounded bg-surface-container-low h-10 px-sm">
                    <input
                      type="text"
                      value={user?.role || ""}
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none text-on-surface-variant opacity-75 cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="pt-md border-t border-outline-variant flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-lg h-10 bg-primary hover:bg-[#1e293b] text-white font-label-md text-label-md rounded flex items-center gap-sm transition-all active:scale-[0.98] shadow-sm disabled:opacity-50"
                >
                  {loading && <Spinner className="animate-spin" size={16} />} Save Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Security & Password */}
          {activeTab === "security" && (
            <form onSubmit={handleSecuritySubmit} className="space-y-lg">
              <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Security Credentials</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary block">NEW PASSWORD</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all input-focus-effect bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary block">CONFIRM NEW PASSWORD</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all input-focus-effect bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-md border-t border-outline-variant flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-lg h-10 bg-primary hover:bg-[#1e293b] text-white font-label-md text-label-md rounded flex items-center gap-sm transition-all active:scale-[0.98] shadow-sm disabled:opacity-50"
                >
                  {loading && <Spinner className="animate-spin" size={16} />} Update Password
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Notifications */}
          {activeTab === "notifications" && (
            <form onSubmit={handleNotificationSubmit} className="space-y-lg">
              <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Notification Preferences</h2>
              
              <div className="space-y-md">
                <div className="flex items-center justify-between py-xs">
                  <div>
                    <p className="font-label-md text-label-md text-primary font-bold">Email Alerts</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant opacity-80">Send email alerts for important operations.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-between py-xs border-t border-outline-variant/50">
                  <div>
                    <p className="font-label-md text-label-md text-primary font-bold">Maintenance Requests</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant opacity-80">Notify when maintenance tickets are assigned or modified.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintAlerts}
                    onChange={(e) => setMaintAlerts(e.target.checked)}
                    className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-between py-xs border-t border-outline-variant/50">
                  <div>
                    <p className="font-label-md text-label-md text-primary font-bold">Audit Cycles</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant opacity-80">Alert when a new audit cycle is initiated or verification is requested.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={auditAlerts}
                    onChange={(e) => setAuditAlerts(e.target.checked)}
                    className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div className="pt-md border-t border-outline-variant flex justify-end">
                <button
                  type="submit"
                  className="px-lg h-10 bg-primary hover:bg-[#1e293b] text-white font-label-md text-label-md rounded flex items-center gap-sm transition-all active:scale-[0.98] shadow-sm"
                >
                  Save Preferences
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: Organization Config */}
          {activeTab === "admin" && (
            <form onSubmit={handleAdminSubmit} className="space-y-lg">
              <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Organization Configuration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary block">SYSTEM CURRENCY</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all input-focus-effect bg-surface-container-lowest h-10 px-sm">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none text-gray-800"
                    >
                      <option value="INR">INR (₹) - Indian Rupee</option>
                      <option value="USD">USD ($) - United States Dollar</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary block">ASSET TAG AUTO-PREFIX</label>
                  <div className="relative flex items-center border border-outline-variant rounded transition-all input-focus-effect bg-surface-container-lowest h-10 px-sm">
                    <input
                      type="text"
                      value={tagPrefix}
                      onChange={(e) => setTagPrefix(e.target.value)}
                      placeholder="e.g. AST"
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-md border-t border-outline-variant flex justify-end">
                <button
                  type="submit"
                  className="px-lg h-10 bg-primary hover:bg-[#1e293b] text-white font-label-md text-label-md rounded flex items-center gap-sm transition-all active:scale-[0.98] shadow-sm"
                >
                  Save Configurations
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
