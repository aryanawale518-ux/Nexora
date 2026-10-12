import React, { useState } from 'react';
import {
  LogIn,
  Phone,
  Lock,
  Mail,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Building,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  onSuccess?: () => void;
}

export const SignInPageView: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const { loginWithGoogle, loginWithPhone, isNewUserCheck } = useApp();

  const [authMethod, setAuthMethod] = useState<'google' | 'phone'>('google');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [roleSelect, setRoleSelect] = useState<UserRole>('student');
  const [targetClass, setTargetClass] = useState('Class 7-A');
  const [isNewUserStep, setIsNewUserStep] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleGoogleSignIn = () => {
    setErrorMessage(null);
    const res = loginWithGoogle();
    if (res.success) {
      setSuccessNotice('Signed in successfully with Google account! Email notification dispatch active.');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 700);
    } else {
      setErrorMessage(res.error || 'Google Sign-In failed');
    }
  };

  const handleCheckPhone = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMessage('Please enter a valid phone number (at least 8-10 digits).');
      return;
    }

    const isNew = isNewUserCheck(cleanPhone);
    if (isNew) {
      setIsNewUserStep(true);
      setSuccessNotice('New account detected: Please choose your role and set a secure password.');
    } else {
      setIsNewUserStep(false);
    }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!phoneNumber.trim()) {
      setErrorMessage('Phone number is required.');
      return;
    }

    if (!password.trim() || password.length < 4) {
      setErrorMessage('Password must be at least 4 characters.');
      return;
    }

    if (isNewUserStep) {
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        return;
      }
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }

      const res = loginWithPhone(phoneNumber.trim(), password, true, fullName.trim(), roleSelect, targetClass);
      if (res.success) {
        setSuccessNotice('New account created & signed in! SMS alert notifications active.');
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 700);
      } else {
        setErrorMessage(res.error || 'Account setup failed');
      }
    } else {
      const res = loginWithPhone(phoneNumber.trim(), password, false);
      if (res.success) {
        setSuccessNotice('Signed in successfully! SMS notifications active.');
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 700);
      } else {
        setErrorMessage(res.error || 'Invalid credentials');
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background aesthetic blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 shadow-lg mb-1">
            <span className="font-extrabold text-white text-2xl tracking-wider">N</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome to Nexora
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            School & College Academic ERP Portal · Sign in to access your dashboard, verified notices, and personalized daily briefing.
          </p>
        </div>

        {/* Feedback alerts */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
            <span className="shrink-0 text-rose-400 font-bold">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successNotice && (
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Auth Method Toggle */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('google');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-2 ${
              authMethod === 'google'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Sign In with Google</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod('phone');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-2 ${
              authMethod === 'phone'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Sign In with Phone</span>
          </button>
        </div>

        {/* 1. Google Sign-In Mode */}
        {authMethod === 'google' && (
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/70 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Google Workspace SSO</h3>
                  <p className="text-[11px] text-slate-400">
                    One-click verified institutional login.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-[11px] text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Email Notification Dispatch: Active</span>
                </div>
                <p className="text-slate-400 text-[10px] leading-relaxed">
                  When you sign in with Google, all official announcements, assignment releases, attendance updates, notes, and results will be dispatched directly to your <strong>Google Email</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 transition shadow-md"
              >
                <span>Continue with Google</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              </button>
            </div>
          </div>
        )}

        {/* 2. Phone Number Sign-In Mode */}
        {authMethod === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4 pt-1">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Mobile Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setIsNewUserStep(false);
                    }}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* If new account step */}
              {isNewUserStep ? (
                <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                    <UserCheck className="w-4 h-4" />
                    <span>New Account Registration</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aryan Awale"
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Role
                      </label>
                      <select
                        value={roleSelect}
                        onChange={(e) => setRoleSelect(e.target.value as UserRole)}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Class / Section
                      </label>
                      <select
                        value={targetClass}
                        onChange={(e) => setTargetClass(e.target.value)}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option>Class 7-A</option>
                        <option>Class 7-B</option>
                        <option>Class 7-C</option>
                        <option>Class 8-A</option>
                        <option>FY B.Sc CS</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Set Password
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Choose a password"
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition shadow-md"
                  >
                    Set Password & Complete Sign In
                  </button>
                </div>
              ) : (
                /* Existing User Password Step */
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* SMS Dispatch info box */}
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[10px] text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <Phone className="w-3 h-3" />
                      <span>SMS Mobile Alert Dispatch: Active</span>
                    </div>
                    <p>
                      When signed in with Phone Number, all urgent circulars, assignment notices, attendance ledger updates, and marks will be dispatched via <strong>Direct SMS alert</strong> to this mobile number.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCheckPhone}
                      className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl font-semibold text-xs transition"
                      title="Check if new account"
                    >
                      New user?
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        )}

        {/* Demo Fast Account Quick Switch for Testing */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span>Instant Demo Personas:</span>
            <span className="text-[10px] text-indigo-400">1-click test</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                loginWithPhone('+91 98765 43210', 'demo123', false);
                if (onSuccess) onSuccess();
              }}
              className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700 text-left transition"
            >
              <div className="font-semibold text-white">Aarav Sharma</div>
              <div className="text-[10px] text-slate-400">Student (Class 7-A)</div>
            </button>

            <button
              type="button"
              onClick={() => {
                loginWithGoogle();
                if (onSuccess) onSuccess();
              }}
              className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700 text-left transition"
            >
              <div className="font-semibold text-white">Dr. Meera Sen</div>
              <div className="text-[10px] text-slate-400">Teacher (Science Lead)</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
