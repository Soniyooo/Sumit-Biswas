
import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Hexagon, Mail, Lock, User as UserIcon, ArrowRight, ArrowLeft, CheckCircle, KeyRound, MessageSquare, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { generateSecurityEmail } from '../services/geminiService';

type AuthView = 'login' | 'signup' | 'forgot_password';
type ForgotStep = 'email' | 'code' | 'new_password';

export const Auth = () => {
  const [view, setView] = useState<AuthView>('login');
  
  // Login/Signup State
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  
  // Forgot Password State
  const [forgotStep, setForgotStep] = useState<ForgotStep>('email');
  const [resetCode, setResetCode] = useState(''); // Code user types
  const [generatedCode, setGeneratedCode] = useState(''); // Code system made
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mockEmailContent, setMockEmailContent] = useState<string | null>(null); // For AI Simulation
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const { login, signup, resetPassword, allUsers } = useContext(AppContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // === FORGOT PASSWORD FLOW ===
    if (view === 'forgot_password') {
      
      // Step 1: Send Code
      if (forgotStep === 'email') {
        if (!email) { setError('Please enter your email.'); return; }
        
        const cleanEmail = email.trim().toLowerCase();
        const userExists = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
        if (!userExists) { setError('No account found with this email.'); return; }

        setIsAiGenerating(true);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedCode(code);
        
        // Generate AI Email
        const emailBody = await generateSecurityEmail(userExists.name, code);
        setMockEmailContent(emailBody);
        setIsAiGenerating(false);
        
        setForgotStep('code');
        return;
      }

      // Step 2: Verify Code
      if (forgotStep === 'code') {
        if (resetCode !== generatedCode) {
          setError('Invalid verification code. Please check the simulated email and try again.');
          return;
        }
        setForgotStep('new_password');
        setMockEmailContent(null); // Close the mock email modal
        return;
      }

      // Step 3: Reset Password
      if (forgotStep === 'new_password') {
        if (!newPassword || newPassword.length < 4) {
          setError('Password must be at least 4 characters.');
          return;
        }
        if (newPassword !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }

        const result = await resetPassword(email, newPassword);
        if (result.success) {
          setSuccessMsg('Password reset successfully! You can now log in.');
          setTimeout(() => switchView('login'), 2000);
        } else {
          setError(result.message || 'Failed to reset password.');
        }
        return;
      }
      return;
    }

    // === LOGIN / SIGNUP FLOW ===
    if (!email || !password || (view === 'signup' && !name)) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      if (view === 'login') {
        const result = await login(email, password);
        if (!result.success) {
          setError(result.message || 'Login failed');
        }
      } else {
        const result = await signup(email, password, name);
        if (!result.success) {
          setError(result.message || 'Signup failed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  const switchView = (newView: AuthView) => {
    setView(newView);
    setError(null);
    setSuccessMsg(null);
    setForgotStep('email');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setMockEmailContent(null);
    if (newView === 'forgot_password') {
        setPassword('');
    }
  };

  const handleResetData = () => {
    if (window.confirm("This will delete all saved posts, users, and chats to fix the login issue. Are you sure?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // === RENDER MOCK EMAIL NOTIFICATION ===
  const renderMockEmail = () => {
    if (!mockEmailContent) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
          <div className="bg-indigo-600 px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-2 text-white">
              <Mail className="w-4 h-4" />
              <span className="font-semibold text-sm">New Message</span>
            </div>
            <div className="flex items-center text-indigo-200 text-xs gap-1">
               <Sparkles className="w-3 h-3" />
               AI Generated
            </div>
          </div>
          <div className="p-5">
            <h4 className="font-bold text-slate-900 mb-1">Sphere Security Team</h4>
            <p className="text-xs text-slate-500 mb-4">to: {email}</p>
            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 whitespace-pre-wrap font-medium border border-slate-100">
              {mockEmailContent}
            </div>
            <p className="text-xs text-slate-400 mt-4 italic text-center">
              (This is a simulated email for demonstration)
            </p>
            <button 
              onClick={() => setMockEmailContent(null)}
              className="mt-4 w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Close & Enter Code
            </button>
          </div>
        </div>
      </div>
    );
  };

  // === FORGOT PASSWORD VIEW ===
  if (view === 'forgot_password') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        {renderMockEmail()}
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 transition-all">
          <button 
            onClick={() => switchView('login')}
            className="flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Login
          </button>

          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 relative">
              <KeyRound className="w-6 h-6 text-indigo-600" />
              {isAiGenerating && (
                <div className="absolute -right-1 -top-1 bg-white rounded-full p-0.5 shadow-sm">
                   <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {forgotStep === 'email' && 'Reset Password'}
              {forgotStep === 'code' && 'Enter Verification Code'}
              {forgotStep === 'new_password' && 'Create New Password'}
            </h2>
            <p className="text-slate-500 mt-2 text-center text-sm">
              {forgotStep === 'email' && "Enter your email and our AI will send you a verification code."}
              {forgotStep === 'code' && `We sent a code to ${email}. Check the simulated email.`}
              {forgotStep === 'new_password' && "Secure your account with a new password."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center animate-in slide-in-from-top-2">
                {error}
              </div>
            )}
            
            {successMsg && (
               <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-200 text-center flex items-center justify-center gap-2">
                 <CheckCircle className="w-4 h-4" />
                 {successMsg}
               </div>
            )}

            {/* STEP 1: EMAIL */}
            {forgotStep === 'email' && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
            )}

            {/* STEP 2: CODE */}
            {forgotStep === 'code' && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 ml-1">6-Digit Code</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all tracking-widest font-mono text-lg"
                    placeholder="000000"
                    required
                  />
                </div>
                <div className="text-center mt-2">
                    <button type="button" onClick={() => setMockEmailContent(mockEmailContent)} className="text-xs text-indigo-600 hover:underline">
                        View Email Again
                    </button>
                </div>
              </div>
            )}

            {/* STEP 3: NEW PASSWORD */}
            {forgotStep === 'new_password' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 ml-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 ml-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isAiGenerating}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isAiGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    AI Generating Email...
                  </>
              ) : (
                  <>
                     {forgotStep === 'email' && 'Send Code'}
                     {forgotStep === 'code' && 'Verify Code'}
                     {forgotStep === 'new_password' && 'Reset Password'}
                  </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // === LOGIN / SIGNUP VIEW ===
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 transition-all">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
             <Hexagon className="w-8 h-8 text-indigo-600 fill-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">
            {view === 'login' ? 'Welcome back' : 'Join Sphere'}
          </h2>
          <p className="text-slate-500 mt-2 text-center">
            {view === 'login' ? 'Enter your details to access your account.' : 'Connect with friends and share your world.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {view === 'signup' && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-slate-700">Password</label>
              {view === 'login' && (
                <button 
                  type="button"
                  onClick={() => switchView('forgot_password')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center group transition-all mt-6"
          >
            {view === 'login' ? 'Sign In' : 'Create Account'}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-600">
            {view === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => switchView(view === 'login' ? 'signup' : 'login')}
              className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline transition-colors"
            >
              {view === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
      
      {/* Troubleshooting Button */}
      <button 
        onClick={handleResetData}
        className="mt-8 flex items-center text-xs text-slate-400 hover:text-red-500 transition-colors"
      >
        <RefreshCw className="w-3 h-3 mr-1.5" />
        Trouble logging in? Reset App Data
      </button>
    </div>
  );
};
