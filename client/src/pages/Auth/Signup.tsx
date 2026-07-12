import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import type { Department } from "../../types";

export const Signup: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const moveX = (e.clientX - window.innerWidth / 2) / 50;
      const moveY = (e.clientY - window.innerHeight / 2) / 50;
      setMousePosition({ x: moveX, y: moveY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get("/departments");
        setDepartments(res.data);
      } catch (err) {
        console.error("Failed to load departments", err);
      }
    };
    fetchDepts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all required fields");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await signup(
        name,
        email,
        password,
        departmentId ? parseInt(departmentId, 10) : undefined,
      );
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registration failed. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="font-body-md text-on-surface min-h-screen flex items-center justify-center p-md bg-[#f7f9fb] overflow-hidden relative">
      {/* Ambient Background Effects */}
      <div 
        className="ambient-glow glow-emerald animate-pulse"
        style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
      ></div>
      <div 
        className="ambient-glow glow-blue animate-pulse" 
        style={{ animationDelay: '2s', transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)` }}
      ></div>

      <main className="relative z-10 w-full max-w-md">
        {/* Branding Header */}
        <div className="flex flex-col items-center mb-xl">
          <div className="flex items-center gap-sm mb-xs">
            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg">
              <span className="material-symbols-outlined text-surface-container-lowest text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
            </div>
            <h1 className="font-headline-md text-headline-md text-primary tracking-tight">AssetFlow</h1>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-[10px]">Enterprise Resource Management</p>
        </div>

        {/* Signup Card */}
        <div className="glass-panel p-xl shadow-sm rounded-lg">
          <div className="mb-lg">
            <h2 className="font-headline-sm text-headline-sm text-primary mb-xs">Create Account</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Register your employee access profile.</p>
          </div>

          {error && (
            <div className="mb-md p-sm bg-error/10 border border-error/20 rounded text-error font-body-sm text-body-sm flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-md">
            {/* Full Name Field */}
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-primary block" htmlFor="name">FULL NAME *</label>
              <div className="relative flex items-center border border-outline-variant rounded transition-all input-focus-effect bg-surface-container-lowest h-10 px-sm">
                <span className="material-symbols-outlined text-outline text-[18px] mr-sm">person</span>
                <input 
                  className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/50 outline-none" 
                  id="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe" 
                  required 
                  type="text" 
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-primary block" htmlFor="email">EMAIL ADDRESS *</label>
              <div className="relative flex items-center border border-outline-variant rounded transition-all input-focus-effect bg-surface-container-lowest h-10 px-sm">
                <span className="material-symbols-outlined text-outline text-[18px] mr-sm">alternate_email</span>
                <input 
                  className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/50 outline-none" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com" 
                  required 
                  type="email" 
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-primary block" htmlFor="password">ACCESS KEY *</label>
              <div className="relative flex items-center border border-outline-variant rounded transition-all input-focus-effect bg-surface-container-lowest h-10 px-sm">
                <span className="material-symbols-outlined text-outline text-[18px] mr-sm">key</span>
                <input 
                  className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/50 outline-none" 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                  type="password" 
                />
              </div>
            </div>

            {/* Department Selection */}
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-primary block" htmlFor="department">DEPARTMENT</label>
              <div className="relative flex items-center border border-outline-variant rounded transition-all input-focus-effect bg-surface-container-lowest h-10 px-sm">
                <span className="material-symbols-outlined text-outline text-[18px] mr-sm">domain</span>
                <select 
                  className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/50 outline-none appearance-none" 
                  id="department" 
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                >
                  <option value="" className="text-gray-400">Select Department...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id} className="text-gray-800">
                      {dept.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none absolute right-2">arrow_drop_down</span>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              className="w-full h-11 bg-primary hover:bg-[#1e293b] text-white font-label-md text-label-md rounded flex items-center justify-center gap-sm transition-all active:scale-[0.98] shadow-sm mt-lg disabled:opacity-80 disabled:cursor-not-allowed" 
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  <span>CREATING PROFILE...</span>
                </>
              ) : (
                <>
                  <span>REGISTER</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center font-body-sm text-body-sm text-on-surface-variant mt-lg">
            Already have an account?{" "}
            <Link to="/login" className="text-secondary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};
