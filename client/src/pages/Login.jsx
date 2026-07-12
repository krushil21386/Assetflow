import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleMouseMove = (e) => {
      const moveX = (e.clientX - window.innerWidth / 2) / 50;
      const moveY = (e.clientY - window.innerHeight / 2) / 50;
      setMousePosition({ x: moveX, y: moveY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
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
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Enterprise Resource Management</p>
        </div>
        
        {/* Login Card */}
        <div className="glass-panel p-xl shadow-sm rounded-lg">
          <div className="mb-lg">
            <h2 className="font-headline-sm text-headline-sm text-primary mb-xs">Secure Portal</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Authorize access to organizational infrastructure.</p>
          </div>
          
          {error && (
            <div className="mb-md p-sm bg-error/10 border border-error/20 rounded text-error font-body-sm text-body-sm flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-md">
            {/* System Identity Field */}
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-primary block" htmlFor="email">SYSTEM IDENTITY</label>
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
            
            {/* Access Key Field */}
            <div className="space-y-xs">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-primary block" htmlFor="password">ACCESS KEY</label>
                <a className="font-label-sm text-label-sm text-secondary hover:underline transition-all" href="#">RECOVER KEY</a>
              </div>
              <div className="relative flex items-center border border-outline-variant rounded transition-all input-focus-effect bg-surface-container-lowest h-10 px-sm">
                <span className="material-symbols-outlined text-outline text-[18px] mr-sm">key</span>
                <input 
                  className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/50 outline-none" 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••" 
                  required 
                  type={showPassword ? "text" : "password"} 
                />
                <button 
                  className="text-outline hover:text-primary transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>
            
            {/* Remember Toggle */}
            <div className="flex items-center gap-sm py-xs">
              <input className="w-4 h-4 border-outline-variant rounded text-secondary focus:ring-secondary/20" id="remember" type="checkbox" />
              <label className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer select-none" htmlFor="remember">Persist session on this workstation</label>
            </div>
            
            {/* Submit Button */}
            <button 
              className="w-full h-11 bg-[#10b981] hover:bg-[#059669] text-white font-label-md text-label-md rounded flex items-center justify-center gap-sm transition-all active:scale-[0.98] shadow-sm mt-lg disabled:opacity-80 disabled:cursor-not-allowed" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  <span>VALIDATING...</span>
                </>
              ) : (
                <>
                  <span>AUTHENTICATE</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>
          
          {/* Footer Links */}
          <div className="mt-xl pt-lg border-t border-outline-variant flex flex-col items-center gap-sm">
            <div className="flex gap-md">
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs" href="#">
                <span className="material-symbols-outlined text-[14px]">terminal</span>
                API ACCESS
              </a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs" href="#">
                <span className="material-symbols-outlined text-[14px]">shield</span>
                SECURITY POLICY
              </a>
            </div>
          </div>
        </div>
        
        {/* System Status Footer */}
        <div className="mt-md text-center">
          <div className="inline-flex items-center gap-xs px-sm py-1 rounded-full bg-on-tertiary-container/10 border border-on-tertiary-container/20">
            <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container animate-pulse"></span>
            <span className="font-label-sm text-label-sm text-on-tertiary-container">CORE SYSTEMS OPERATIONAL</span>
          </div>
        </div>
      </main>
    </div>
  );
};
