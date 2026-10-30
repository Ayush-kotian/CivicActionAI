import React, { useState, useEffect } from 'react';
import {
  Search,
  Building2,
  Clock,
  MapPin,
  FileText,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { StatusTimeline } from '../components/StatusTimeline';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { DuplicateAlert } from '../components/DuplicateAlert';
import { fetchTracking } from '../services/api';
import { Report } from '../types';

interface CitizenTrackProps {
  initialComplaintId?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const CitizenTrack: React.FC<CitizenTrackProps> = ({
  initialComplaintId,
  onNavigate
}) => {
  const [searchId, setSearchId] = useState(initialComplaintId || '');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const performLookup = async (id: string) => {
    if (!id.trim()) return;
    try {
      setLoading(true);
      setError('');
      const res = await fetchTracking(id.trim());
      setReport(res.data);
    } catch (err: any) {
      setReport(null);
      setError(err.message || `No municipal record found for #${id}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialComplaintId) {
      setSearchId(initialComplaintId);
      performLookup(initialComplaintId);
    }
  }, [initialComplaintId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(searchId);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs tracking-wider uppercase">
          <Search className="w-4 h-4" />
          <span>Stage 4: Citizen Verification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Track Your Complaint Status
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Monitor your complaint resolution in real-time. Transparently inspect department assignments, operational timeline, and field resolution notes.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Complaint ID (e.g. CAI-1001, CAI-1010, CAI-1030)"
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs font-mono"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition disabled:opacity-50 shrink-0 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Search</span>}
        </button>
      </form>

      {/* Sample presets shortcut */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="font-medium">Quick examples:</span>
        <button
          type="button"
          onClick={() => { setSearchId('CAI-1001'); performLookup('CAI-1001'); }}
          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border rounded text-slate-700"
        >
          #CAI-1001 (In Progress)
        </button>
        <button
          type="button"
          onClick={() => { setSearchId('CAI-1006'); performLookup('CAI-1006'); }}
          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border rounded text-slate-700"
        >
          #CAI-1006 (Resolved)
        </button>
        <button
          type="button"
          onClick={() => { setSearchId('CAI-1030'); performLookup('CAI-1030'); }}
          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border rounded text-slate-700"
        >
          #CAI-1030 (Critical Hazard)
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-xl text-red-900 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Record Not Found</h4>
            <p className="mt-0.5 text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Complaint Tracking Card */}
      {report && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
          {/* Top Banner with ID & Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-200">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Official Municipal Record
              </span>
              <h2 className="text-2xl font-extrabold text-blue-900 font-mono">
                #{report.complaintId}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={report.priority} />
              <StatusBadge status={report.status} />
            </div>
          </div>

          {/* Duplicate Detection Notification if linked */}
          {report.duplicatePossible && (
            <DuplicateAlert
              duplicateScore={report.duplicateScore}
              duplicateReportIds={report.duplicateReportIds}
              duplicateExplanation={report.duplicateExplanation}
              duplicateStatus={report.duplicateStatus}
              duplicateTier={report.duplicateTier}
              duplicateOf={report.duplicateOf}
              duplicateReason={report.duplicateReason}
              duplicateReasons={report.duplicateReasons}
              isCitizenView={true}
              onViewReport={(id) => {
                setSearchId(id);
                performLookup(id);
              }}
            />
          )}

          {/* Stepper Timeline */}
          <StatusTimeline
            currentStatus={report.status}
            statusHistory={report.statusHistory}
          />

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-200">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 font-semibold block uppercase tracking-wide">
                Issue Category
              </span>
              <span className="text-sm font-bold text-slate-900 block">
                {report.category}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 font-semibold block uppercase tracking-wide flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Assigned Department</span>
              </span>
              <span className="text-sm font-bold text-blue-900 block">
                {report.assignedDepartment}
              </span>
            </div>
          </div>

          {/* Location & Summary */}
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">Reported Location: </span>
                <span>{report.location?.address || 'Incident coordinates provided'}</span>
                <span className="font-mono text-slate-500 ml-1">
                  ({report.location?.latitude.toFixed(4)}, {report.location?.longitude.toFixed(4)})
                </span>
              </div>
            </div>

            {report.summary && (
              <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
                <span className="font-bold text-blue-900 block mb-1">AI Operational Summary:</span>
                <p className="text-slate-700 leading-relaxed font-sans">{report.summary}</p>
              </div>
            )}

            {report.imageUrl && (
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Attached Incident Image:</span>
                <img
                  src={report.imageUrl}
                  alt="Citizen report attachment"
                  className="w-full max-h-72 object-cover rounded-xl border border-slate-200"
                />
              </div>
            )}
          </div>

          {/* Privacy & Trust Badge */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Public Record &bull; Personal citizen identity protected</span>
            </div>
            <span>Intake: {new Date(report.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};
