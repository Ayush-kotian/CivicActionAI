import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  PlusCircle,
  Clock,
  MapPin,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { fetchMyReports, getStoredUser } from '../services/api';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import type { Report, User } from '../types';

interface MyComplaintsProps {
  onNavigate: (view: string, param?: string) => void;
  onOpenAuth: () => void;
  currentUser?: User | null;
}

export const MyComplaints: React.FC<MyComplaintsProps> = ({ onNavigate, onOpenAuth, currentUser }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user: User | null = currentUser !== undefined ? currentUser : getStoredUser();

  const loadMyComplaints = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await fetchMyReports();
      setReports(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load your complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyComplaints();
  }, [user?.email, user?.username]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
          <FileText className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Sign in to view your Citizen Dashboard</h2>
        <p className="text-xs text-slate-600">
          Please sign in to access your dashboard, submit civic issues, and track your complaints.
        </p>
        <button
          type="button"
          onClick={onOpenAuth}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
        >
          Citizen Sign In / Register
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Citizen Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Welcome, {user.username || user.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track and monitor the status of civic complaints you have submitted.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={loadMyComplaints}
            className="p-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('report')}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit New Complaint</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs">
          {error}
        </div>
      )}

      {/* Complaints Feed */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-xs text-slate-500 mt-2 font-medium">Fetching your complaints...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No complaints submitted yet.</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the button to submit one.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('report')}
            className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            Submit New Complaint
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
            <span>Showing {reports.length} {reports.length === 1 ? 'complaint' : 'complaints'} registered by you</span>
            <span className="text-emerald-700 font-semibold">Private & Verified Records</span>
          </div>

          {reports.map((report) => (
            <div
              key={report.complaintId}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs hover:shadow-xs transition space-y-3.5"
            >
              {/* Top row: ID, Category, Priority, Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-blue-700 text-sm">
                    #{report.complaintId}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-full border border-slate-200">
                    Category: {report.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={report.priority} />
                  <StatusBadge status={report.status} />
                </div>
              </div>

              {/* Problem / Description */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Problem Description:
                </span>
                <p className="text-sm text-slate-800 font-sans leading-relaxed">
                  {report.description}
                </p>
              </div>

              {/* Details grid: Location, Date, Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div className="flex items-start gap-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Location: </strong>
                    {report.location?.address || `${report.location?.latitude.toFixed(4)}, ${report.location?.longitude.toFixed(4)}`}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-600 sm:justify-end">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    <strong>Submitted: </strong>
                    {new Date(report.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Track button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => onNavigate('track', report.complaintId)}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold transition text-xs flex items-center gap-1.5 border border-blue-200"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Track Status</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
