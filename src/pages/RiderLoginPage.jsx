import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bike,
  UtensilsCrossed,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Mail,
  Lock,
  Clock,
  Ban,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function RiderLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusNotice, setStatusNotice] = useState(null); // { type: 'pending' | 'suspended', message: string }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setStatusNotice(null);

    if (!email || !password) {
      setError('Please provide your email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.token) {
        if (res.user.role !== 'rider') {
          // If non-rider logged in via rider page, redirect to their proper portal
          localStorage.setItem('menufy_token', res.token);
          localStorage.setItem('foodflow_token', res.token);
          localStorage.setItem('menufy_user', JSON.stringify(res.user));
          localStorage.setItem('foodflow_user', JSON.stringify(res.user));
          if (res.user.role === 'superadmin' || res.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
          return;
        }

        localStorage.setItem('menufy_token', res.token);
        localStorage.setItem('foodflow_token', res.token);
        localStorage.setItem('menufy_user', JSON.stringify(res.user));
        localStorage.setItem('foodflow_user', JSON.stringify(res.user));
        navigate('/rider/dashboard');
        window.location.reload(); // Refresh auth state
      } else {
        setError(res.message || 'Login failed.');
      }
    } catch (err) {
      if (err.isPending) {
        setStatusNotice({
          type: 'pending',
          message: 'Your rider application is currently under review by platform administration. You will be able to access the dashboard once approved.',
        });
      } else if (err.isSuspended) {
        setStatusNotice({
          type: 'suspended',
          message: 'Your rider account is currently suspended. Please contact platform support.',
        });
      } else {
        setError(err.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Platform Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-orange-600/30">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block leading-none">
                Menu<span className="text-orange-500">Fy</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mt-1">
                Courier Fleet Network
              </span>
            </div>
          </Link>

          <Link
            to="/rider/register"
            className="px-4 py-2 rounded-xl bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 font-bold text-xs border border-orange-500/30 transition-all flex items-center gap-1.5"
          >
            <span>Apply as a Rider</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/25">
                <Bike className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Rider Portal Login</h1>
              <p className="text-xs text-slate-400">
                Sign in to manage deliveries, live dispatch, and earnings.
              </p>
            </div>

            {statusNotice && (
              <div
                className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                  statusNotice.type === 'pending'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {statusNotice.type === 'pending' ? (
                  <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <Ban className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-extrabold uppercase text-[10px] tracking-wider">
                    {statusNotice.type === 'pending' ? 'Application Under Review' : 'Account Suspended'}
                  </div>
                  <div className="mt-0.5 leading-relaxed">{statusNotice.message}</div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Rider Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="rider@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Enter Rider Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800/80 text-center space-y-2">
              <p className="text-xs text-slate-400">
                Want to become a delivery partner?{' '}
                <Link to="/rider/register" className="text-orange-400 hover:underline font-bold">
                  Apply to Ride
                </Link>
              </p>
              <div>
                <Link to="/login" className="text-[11px] text-slate-500 hover:text-slate-400">
                  Are you a Restaurant Owner? Click here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
