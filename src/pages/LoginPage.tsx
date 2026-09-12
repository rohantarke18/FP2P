import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { Shield, Mail, Lock, Phone, User as UserIcon, ArrowRight, UserCheck, AlertCircle, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithEmail, registerWithEmail } = useAuth();
  const { t, language } = useLanguage();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const redirectPath = (location.state as any)?.from || '/dashboard';

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (authMode === 'register' && !fullName.trim()) {
      setErrorMessage('Please enter your full name for citizen registration.');
      return;
    }

    setIsLoadingSubmit(true);
    try {
      if (authMode === 'register') {
        const newUser = await registerWithEmail(email, password, fullName, phoneNumber);
        showToast('success', 'Account Registered', `Welcome to CivicBridge, ${newUser.name}!`);
      } else {
        const logged = await loginWithEmail(email, password);
        showToast('success', 'Signed In', `Welcome back, ${logged.name}!`);
      }
      navigate(redirectPath);
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        setErrorMessage('Invalid email or password. Please verify credentials or create a new account.');
      } else if (err?.code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this email already exists. Please switch to Sign In.');
      } else if (err?.code === 'auth/weak-password') {
        setErrorMessage('Password must be at least 6 characters long.');
      } else {
        setErrorMessage(err?.message || 'Authentication failed.');
      }
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-md font-serif">
          CB
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          {language === 'mr' ? 'नागरिक पोर्टल प्रवेश' : language === 'hi' ? 'नागरिक पोर्टल लॉगिन' : 'Citizen Portal Access'}
        </h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          {language === 'mr'
            ? 'आपल्या समस्यांची नोंदणी करा, वास्तविक-वेळ स्थिती ट्रॅक करा आणि नवकल्पना सादर करा.'
            : language === 'hi'
            ? 'अपनी समस्याओं की शिकायत दर्ज करें, लाइव स्थिति ट्रैक करें और नवाचार साझा करें।'
            : 'Report civic issues, track live docket resolutions, and co-create urban solutions.'}
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Mode Tabs: Sign In vs Create Account */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            id="tab-signin"
            onClick={() => setAuthMode('signin')}
            className={`flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-colors cursor-pointer ${
              authMode === 'signin'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Email Sign In
          </button>
          <button
            type="button"
            id="tab-register"
            onClick={() => setAuthMode('register')}
            className={`flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-colors cursor-pointer ${
              authMode === 'register'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuthSubmit} className="space-y-3.5">
          {authMode === 'register' && (
            <div>
              <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-800 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Anand Deshmukh"
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-blue-600 bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email-input" className="block text-xs font-semibold text-slate-800 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-blue-600 bg-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password-input" className="block text-xs font-semibold text-slate-800 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="password-input"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-blue-600 bg-white"
              />
            </div>
          </div>

          {authMode === 'register' && (
            <div>
              <label htmlFor="reg-phone" className="block text-xs font-semibold text-slate-800 mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98200 12345"
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-blue-600 bg-white"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            id="auth-submit-btn"
            disabled={isLoadingSubmit}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {isLoadingSubmit ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
            <span>
              {isLoadingSubmit
                ? 'Processing...'
                : authMode === 'register'
                ? 'Create Citizen Account'
                : 'Sign In to Citizen Portal'}
            </span>
          </button>
        </form>

        {/* Demo Citizen Credentials Helper */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
          <div className="flex items-center justify-between font-semibold text-slate-800">
            <span>Demo Citizen Credentials:</span>
            <span className="text-[10px] text-blue-600 font-mono">civicbridge123</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setEmail('citizen@civicbridge.gov.in');
              setPassword('civicbridge123');
            }}
            className="w-full py-1 px-2 text-center rounded bg-white hover:bg-slate-100 border border-slate-200 text-blue-600 text-[11px] font-medium transition-colors cursor-pointer"
          >
            Fill Demo Citizen: citizen@civicbridge.gov.in
          </button>
        </div>

        {/* Administrative Portal Link */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <Link
            to="/admin/login"
            id="switch-admin-login-link"
            className="text-xs text-amber-700 hover:text-amber-800 font-medium inline-flex items-center justify-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Switch to Government / Officer Portal</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
