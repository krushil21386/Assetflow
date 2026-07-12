import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Password Recovery State
  const [isRecovering, setIsRecovering] = useState<boolean>(false);
  const [recoverEmail, setRecoverEmail] = useState<string>('');
  const [employeeCode, setEmployeeCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');

  const navigate = useNavigate();
  const { login, forgotPassword } = useAuth();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const moveX = (e.clientX - window.innerWidth / 2) / 50;
      const moveY = (e.clientY - window.innerHeight / 2) / 50;
      setMousePosition({ x: moveX, y: moveY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await forgotPassword(recoverEmail, employeeCode, newPassword);
      setSuccess('Access key updated successfully! 🔑 Please sign in with your new key.');
      setIsRecovering(false);
      setEmail(recoverEmail); // Autofill email on login form
      setRecoverEmail('');
      setEmployeeCode('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Employee Code or Email does not match.');
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
            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg shadow-md animate-bounce">
              <span className="material-symbols-outlined text-surface-container-lowest text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
            </div>
            <h1 className="font-headline-md text-headline-md text-primary tracking-tight font-extrabold">AssetFlow</h1>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-[10px] font-bold">Enterprise Resource Management</p>
        </div>
        
        {/* Glassmorphism Card */}
        <div className="glass-panel p-xl shadow-lg rounded-2xl border border-outline-variant/60 relative overflow-hidden backdrop-blur-lg">
          
          {!isRecovering ? (
            <>
              <div className="mb-lg">
                <h2 className="font-headline-sm text-headline-sm text-primary mb-xs font-bold">Secure Portal</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Sign in to manage and audit physical inventory.</p>
              </div>
              
              {error && (
                <div className="mb-md p-sm bg-error/10 border border-error/20 rounded-xl text-error font-body-sm text-body-sm flex items-start gap-2 animate-shake">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-md p-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-700 font-body-sm text-body-sm flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>{success}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-md">
                {/* System Identity Field */}
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary font-bold block" htmlFor="email">EMAIL ADDRESS</label>
                  <div className="relative flex items-center border border-outline-variant rounded-xl transition-all input-focus-effect bg-surface-container-lowest h-11 px-sm">
                    <span className="material-symbols-outlined text-outline text-[18px] mr-sm">alternate_email</span>
                    <input 
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/40 outline-none" 
                      id="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@assetpilot.local" 
                      required 
                      type="email" 
                    />
                  </div>
                </div>
                
                {/* Access Key Field */}
                <div className="space-y-xs">
                  <div className="flex justify-between items-center">
                    <label className="font-label-md text-label-md text-primary font-bold block" htmlFor="password">ACCESS KEY</label>
                    <button 
                      type="button"
                      onClick={() => {
                        setIsRecovering(true);
                        setError('');
                        setSuccess('');
                      }} 
                      className="font-label-sm text-label-sm text-secondary hover:underline transition-all font-bold bg-transparent border-none outline-none cursor-pointer"
                    >
                      FORGOT KEY?
                    </button>
                  </div>
                  <div className="relative flex items-center border border-outline-variant rounded-xl transition-all input-focus-effect bg-surface-container-lowest h-11 px-sm">
                    <span className="material-symbols-outlined text-outline text-[18px] mr-sm">key</span>
                    <input 
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/40 outline-none" 
                      id="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••" 
                      required 
                      type={showPassword ? "text" : "password"} 
                    />
                    <button 
                      className="text-outline hover:text-primary transition-colors bg-transparent border-none outline-none cursor-pointer" 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined text-[18px] block">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>
                
                {/* Submit Button */}
                <button 
                  className="w-full h-11 bg-primary hover:bg-[#1e293b] text-white font-label-md text-label-md rounded-xl flex items-center justify-center gap-sm transition-all active:scale-[0.98] shadow-md mt-lg disabled:opacity-80 disabled:cursor-not-allowed font-bold" 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      <span>VALIDATING CREDENTIALS...</span>
                    </>
                  ) : (
                    <>
                      <span>SIGN IN</span>
                      <span className="material-symbols-outlined text-[18px]">login</span>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center font-body-sm text-body-sm text-on-surface-variant mt-lg">
                Don't have an employee account?{" "}
                <Link to="/signup" className="text-secondary font-bold hover:underline">
                  Register Profile
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="mb-lg">
                <h2 className="font-headline-sm text-headline-sm text-primary mb-xs font-bold">Key Recovery</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Verify your details to reset your access key.</p>
              </div>

              {error && (
                <div className="mb-md p-sm bg-error/10 border border-error/20 rounded-xl text-error font-body-sm text-body-sm flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRecoverSubmit} className="space-y-md">
                {/* Email Address */}
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary font-bold block">REGISTERED EMAIL</label>
                  <div className="relative flex items-center border border-outline-variant rounded-xl transition-all input-focus-effect bg-surface-container-lowest h-11 px-sm">
                    <span className="material-symbols-outlined text-outline text-[18px] mr-sm">alternate_email</span>
                    <input 
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/40 outline-none" 
                      value={recoverEmail}
                      onChange={(e) => setRecoverEmail(e.target.value)}
                      placeholder="employee@assetpilot.local" 
                      required 
                      type="email" 
                    />
                  </div>
                </div>

                {/* Employee Code */}
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary font-bold block">EMPLOYEE CODE</label>
                  <div className="relative flex items-center border border-outline-variant rounded-xl transition-all input-focus-effect bg-surface-container-lowest h-11 px-sm">
                    <span className="material-symbols-outlined text-outline text-[18px] mr-sm">badge</span>
                    <input 
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/40 outline-none" 
                      value={employeeCode}
                      onChange={(e) => setEmployeeCode(e.target.value)}
                      placeholder="e.g. EMP004" 
                      required 
                      type="text" 
                    />
                  </div>
                </div>

                {/* New Access Key */}
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-primary font-bold block">NEW ACCESS KEY</label>
                  <div className="relative flex items-center border border-outline-variant rounded-xl transition-all input-focus-effect bg-surface-container-lowest h-11 px-sm">
                    <span className="material-symbols-outlined text-outline text-[18px] mr-sm">key</span>
                    <input 
                      className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 placeholder:text-outline/40 outline-none" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••" 
                      required 
                      type="password" 
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-sm pt-md">
                  <button 
                    className="w-full h-11 bg-primary hover:bg-[#1e293b] text-white font-label-md text-label-md rounded-xl flex items-center justify-center gap-sm transition-all active:scale-[0.98] shadow-md disabled:opacity-80 disabled:cursor-not-allowed font-bold" 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                        <span>UPDATING ACCESS KEY...</span>
                      </>
                    ) : (
                      <>
                        <span>RESET ACCESS KEY</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsRecovering(false);
                      setError('');
                      setSuccess('');
                    }}
                    className="w-full h-11 bg-surface-container border border-outline-variant hover:bg-surface-container-high text-on-surface font-label-md text-label-md rounded-xl flex items-center justify-center gap-sm transition-all active:scale-[0.98] font-bold"
                  >
                    <span>RETURN TO SIGN IN</span>
                  </button>
                </div>
              </form>
            </>
          )}

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
