import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { loginApi } from '../services/api';
import type { User } from '../types';

interface AdminLoginViewProps {
  onLoginSuccess: (user: User) => void;
  onCancel?: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onLoginSuccess, onCancel }) => {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginIdentifier.trim() || !password) {
      setError('Please provide municipal authority username/email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await loginApi(loginIdentifier.trim(), password);

      // Verify that this user has the admin role
      if (res.user?.role !== 'admin') {
        setError('Access denied: Only authorized municipal administrators can access the Authority Desk.');
        return;
      }

      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or municipal authorization failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 text-white text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-blue-300" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Authority Desk Portal</h2>
          <p className="text-xs text-slate-300 mt-1">
            Restricted municipal operations and dispatch console
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="m-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4" autoComplete="off">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">
              Username or Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="Enter authority username or email"
                autoComplete="off"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter authority password"
                autoComplete="new-password"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In to Authority Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Red Demo Admin Account Box (No auto-fill button) */}
        <div className="m-6 p-4 bg-red-50 border-2 border-red-500 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-red-700 uppercase tracking-wide">
            <span className="text-sm">🔴</span>
            <span>DEMO ADMIN ACCOUNT — USE FOR DEMO</span>
          </div>

          <div className="text-xs text-red-950 font-mono space-y-1 pt-1 border-t border-red-200">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-red-800 font-sans font-semibold">Username/Email:</span>
              <span className="font-bold bg-white/90 px-2 py-0.5 rounded border border-red-200 text-red-900 select-all">
                rajesh@gmail.com
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-red-800 font-sans font-semibold">Password:</span>
              <span className="font-bold bg-white/90 px-2 py-0.5 rounded border border-red-200 text-red-900 select-all">
                123456
              </span>
            </div>
          </div>
          <p className="text-[10px] text-red-600 font-medium italic pt-0.5">
            Type or copy/paste the above demo credentials to sign in as municipal admin.
          </p>
        </div>

        {onCancel && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              Return to Citizen Portal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
