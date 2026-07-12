import React, { useState, useEffect } from 'react';
import './Login.css';

function Login({ onLogin }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const moveX = (e.clientX - window.innerWidth / 2) / 50;
      const moveY = (e.clientY - window.innerHeight / 2) / 50;
      setMousePos({ x: moveX, y: moveY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate validation delay
    setTimeout(() => {
      setIsSubmitting(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-md overflow-hidden relative">
      {/* Ambient Background Effects */}
      <div 
        className="ambient-glow glow-emerald animate-pulse"
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
      ></div>
      <div 
        className="ambient-glow glow-blue animate-pulse" 
        style={{ 
          animationDelay: '2s', 
          transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)` 
        }}
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
          
          <form onSubmit={handleSubmit} className="space-y-md">
            {/* System Identity Field */}
            <div className="space-y-xs">
              <label htmlFor="email" className="font-label-md text-label-md text-primary block">SYSTEM IDENTITY</label>
              <div className="relative flex items-center border border-outline-variant rounded transition-all input-focus-effect bg-surface-container-lowest h-10 px-sm">
                <span className="material-symbols-outlined text-outline text-[18px] mr-sm">alternate_email</span>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required 
                  placeholder="name@organization.com"
                  className="w-full bg-transparent border-none focus:outline-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/50 text-on-surface"
                />
              </div>
            </div>
            
            {/* Access Key Field */}
            <div className="space-y-xs">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="font-label-md text-label-md text-primary block">ACCESS KEY</label>
                <a href="#" className="font-label-sm text-label-sm text-secondary hover:underline transition-all">RECOVER KEY</a>
              </div>
              <div className="relative flex items-center border border-outline-variant rounded transition-all input-focus-effect bg-surface-container-lowest h-10 px-sm">
                <span className="material-symbols-outlined text-outline text-[18px] mr-sm">key</span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  name="password" 
                  required 
                  placeholder="••••••••••••"
                  className="w-full bg-transparent border-none focus:outline-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/50 text-on-surface"
                />
                <button 
                  type="button" 
                  className="text-outline hover:text-primary transition-colors flex items-center justify-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            
            {/* Remember Toggle */}
            <div className="flex items-center gap-sm py-xs">
              <input 
                type="checkbox" 
                id="remember" 
                className="w-4 h-4 border-outline-variant rounded text-secondary focus:ring-secondary/20 bg-surface-container-lowest accent-secondary cursor-pointer"
              />
              <label htmlFor="remember" className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer select-none">Persist session on this workstation</label>
            </div>
            
            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full h-11 bg-[#10b981] hover:bg-[#059669] text-white font-label-md text-label-md rounded flex items-center justify-center gap-sm transition-all active:scale-[0.98] shadow-sm mt-lg ${isSubmitting ? 'opacity-80' : ''}`}
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
              <a href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs">
                <span className="material-symbols-outlined text-[14px]">terminal</span> API ACCESS
              </a>
              <a href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs">
                <span className="material-symbols-outlined text-[14px]">shield</span> SECURITY POLICY
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
}

export default Login;
