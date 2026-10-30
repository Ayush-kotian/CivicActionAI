import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  ExternalLink,
  PlusCircle,
  Clock,
  Layers,
  MapPin,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { fetchMyReports, getStoredUser } from '../services/api';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import type { Report, User } from '../types';

interface MyComplaintsProps {
  onNavigate: (view: string, param?: string) => void;
  onOpenAuth: () => void;
}

export const MyComplaints: React.FC<MyComplaintsProps> = ({ onNavigate, onOpenAuth }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user: User | null = getStoredUser();

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
  }, [user?.email]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
          <FileText className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Sign in to view your complaints</h2>
        <p className="text-xs text-slate-600">
          Create or sign into your citizen account to track all issues you have submitted to municipal authorities.
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
    <div className="max-w-5xl mx-auto py-8 sm:py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs tracking-wider uppercase">
            <FileText className="w-4 h-4" />
            <span>Citizen Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            My Submitted Complaints
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered citizen account: <strong>{user.name}</strong> ({user.email})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadMyComplaints}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600 hover:text-slate-900 transition"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('report')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Complaint</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-xs text-slate-500 mt-2 font-medium">Fetching your complaints...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No complaints filed yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Whenever you submit a civic issue using your citizen account, it will appear here so you can monitor municipal action in real time.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('report')}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            Submit an Issue Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.complaintId}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-700 text-sm">
                    #{report.complaintId}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                    {report.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={report.priority} />
                  <StatusBadge status={report.status} />
                </div>
              </div>

              <div className="text-xs text-slate-800 font-sans leading-relaxed">
                {report.summary || report.description}
              </div>

              {report.duplicatePossible && (
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                  <Layers className="w-3 h-3 text-amber-600" />
                  <span>Linked to existing issue #{report.duplicateOf || report.duplicateReportIds?.[0]} &bull; Corroborating evidence preserved</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{report.location?.address}</span>
                  </div>
                  <div className="flex items-center gap-1 hidden sm:flex">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('track', report.complaintId)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold transition text-xs flex items-center gap-1 border border-blue-200"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Track Live Status</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
