import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Building2,
  FileText,
  AlertTriangle,
  ShieldAlert,
  Clock,
  UserCheck,
  CheckCircle,
  Wrench,
  Layers,
  MapPin,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { fetchReportById, updateReportStatus, assignReport } from '../services/api';
import { Report, ReportStatus, Department } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { StatusTimeline } from '../components/StatusTimeline';
import { DuplicateAlert } from '../components/DuplicateAlert';

interface ReportDetailProps {
  complaintId: string;
  onNavigate: (view: string, param?: string) => void;
}

const DEPARTMENTS: Department[] = [
  'Road Maintenance',
  'Waste Management',
  'Drainage',
  'Electrical',
  'Public Safety',
  'Water Services',
  'Unassigned'
];

const STATUS_TRANSITIONS: { status: ReportStatus; label: string; icon: any; color: string }[] = [
  { status: 'UNDER REVIEW', label: 'Mark Under Review', icon: Clock, color: 'bg-purple-600 hover:bg-purple-700' },
  { status: 'ASSIGNED', label: 'Mark Assigned', icon: UserCheck, color: 'bg-indigo-600 hover:bg-indigo-700' },
  { status: 'IN PROGRESS', label: 'Deploy & In Progress', icon: Wrench, color: 'bg-amber-600 hover:bg-amber-700' },
  { status: 'RESOLVED', label: 'Mark Resolved', icon: CheckCircle, color: 'bg-emerald-600 hover:bg-emerald-700' }
];

export const ReportDetail: React.FC<ReportDetailProps> = ({ complaintId, onNavigate }) => {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Assignment states
  const [selectedDept, setSelectedDept] = useState<Department>('Unassigned');
  const [officerName, setOfficerName] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Status transition note
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadReport = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetchReportById(complaintId);
      setReport(res.data);
      setSelectedDept(res.data.assignedDepartment || 'Unassigned');
      setOfficerName(res.data.assignedTo || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [complaintId]);

  const handleStatusChange = async (newStatus: ReportStatus) => {
    if (!report) return;
    try {
      setUpdatingStatus(true);
      setSuccessMessage('');
      const res = await updateReportStatus(
        report.complaintId,
        newStatus,
        statusNote.trim() || undefined,
        'Municipal Admin'
      );
      setReport(res.data);
      setStatusNote('');
      setSuccessMessage(`Status successfully updated to ${newStatus}.`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;
    try {
      setAssigning(true);
      setSuccessMessage('');
      const res = await assignReport(
        report.complaintId,
        selectedDept,
        officerName.trim() || undefined,
        `Assigned to ${selectedDept} via Admin Operations Desk.`
      );
      setReport(res.data);
      setSuccessMessage(`Work order successfully assigned to ${selectedDept}.`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      alert(`Error assigning report: ${err.message}`);
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-sm font-medium">Loading report #{complaintId}...</span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="py-12 max-w-lg mx-auto text-center space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm">
          {error || 'Report not found.'}
        </div>
        <button
          onClick={() => onNavigate('admin')}
          className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-lg inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8 space-y-6 max-w-5xl mx-auto">
      {/* Back button and breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate('admin')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Authority Desk</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('track', report.complaintId)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
        >
          <span>Open Citizen Tracking View</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold animate-fade-in flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Report Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Title Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                Complaint Intake Record
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500">
                {new Date(report.createdAt).toLocaleString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 font-mono mt-1">
              #{report.complaintId}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <PriorityBadge priority={report.priority} score={report.priorityScore} showScore={true} />
            <StatusBadge status={report.status} />
          </div>
        </div>

        {/* Safety Hazard Banner if applicable */}
        {report.safetyRisk && (
          <div className="p-4 bg-red-50 border border-red-300 rounded-xl text-red-950 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-sm block">CRITICAL PUBLIC SAFETY HAZARD CONFIRMED</span>
              <p className="mt-0.5 text-red-800 leading-relaxed font-sans">
                This filing has triggered high-risk physical hazard indicators (e.g., exposed electrocution danger, deep fall risk, or school/commuter bottleneck). Immediate field dispatch recommended.
              </p>
            </div>
          </div>
        )}

        {/* Workflow & Assignment Action Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-200">
          {/* Status Transitions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-blue-600" />
              <span>Update Workflow Status</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {STATUS_TRANSITIONS.map((t) => (
                <button
                  key={t.status}
                  type="button"
                  disabled={updatingStatus || report.status === t.status}
                  onClick={() => handleStatusChange(t.status)}
                  className={`px-3 py-1.5 text-white rounded-lg text-xs font-semibold shadow-2xs transition disabled:opacity-40 flex items-center gap-1.5 ${t.color}`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <input
                type="text"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Optional progress note (e.g., Pumping crew arrived on site)"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Department Assignment */}
          <form onSubmit={handleAssignSubmit} className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Assign Responsible Department</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value as Department)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                placeholder="Officer / Lead Name (Optional)"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={assigning}
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-2xs transition disabled:opacity-50"
            >
              {assigning ? 'Dispatching Assignment...' : 'Confirm Department Delegation'}
            </button>
          </form>
        </div>

        {/* Explainable AI Analysis Panel */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>AI Operational Intelligence & Reasoning</span>
            </h3>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Structured JSON Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category & Confidence */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                Classified Category
              </span>
              <span className="text-base font-extrabold text-slate-900 block">
                {report.category}
              </span>
              <span className="text-[11px] text-slate-500">
                AI Confidence: {Math.round((report.aiCategoryConfidence ?? 0.94) * 100)}%
              </span>
            </div>

            {/* Priority Score */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                Explainable Priority Score
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {report.priorityScore}
                </span>
                <span className="text-xs text-slate-500">/ 100</span>
                <PriorityBadge priority={report.priority} />
              </div>
            </div>

            {/* Impact Level */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                Public Impact Assessment
              </span>
              <span className="text-base font-extrabold text-slate-900 block">
                {report.impactLevel} IMPACT
              </span>
              <span className="text-[11px] text-slate-500">
                Safety Risk: {report.safetyRisk ? 'YES (Flagged)' : 'NO (Routine)'}
              </span>
            </div>
          </div>

          {/* AI Operational Summary */}
          {report.summary && (
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wide block mb-1">
                Concise Municipal Summary:
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-sans">
                {report.summary}
              </p>
            </div>
          )}

          {/* Contributing Priority Factors (Why this score?) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
              Contributing Prioritization Factors (Explainable Multi-Factor Engine):
            </span>
            <ul className="space-y-1 text-xs text-slate-700 font-sans">
              {report.priorityReasons?.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">&bull;</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Brief Directive */}
        {report.actionBrief && (
          <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-1">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide block">
              Recommended Work Order Directive:
            </span>
            <p className="text-xs text-emerald-950 font-medium font-sans">
              {report.actionBrief}
            </p>
          </div>
        )}

        {/* Duplicate Detection Alert if flagged */}
        {report.duplicatePossible && (
          <DuplicateAlert
            duplicateScore={report.duplicateScore}
            duplicateReportIds={report.duplicateReportIds}
            duplicateExplanation={report.duplicateExplanation}
            relatedDuplicates={report.relatedDuplicates}
            onViewReport={(id) => onNavigate('report-detail', id)}
          />
        )}

        {/* Citizen Raw Description & Photo */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Original Citizen Submission & Evidence
          </h3>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-serif">
            "{report.description}"
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{report.location?.address}</span>
            <span className="font-mono text-slate-400">
              ({report.location?.latitude.toFixed(4)}, {report.location?.longitude.toFixed(4)})
            </span>
          </div>

          {report.imageUrl && (
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-600 block mb-1.5">Submitted Photographic Evidence:</span>
              <img
                src={report.imageUrl}
                alt="Citizen upload attachment"
                className="max-h-80 w-auto rounded-xl border border-slate-300 shadow-xs"
              />
            </div>
          )}
        </div>

        {/* Resolution Timeline & Audit Log */}
        <div className="pt-4 border-t border-slate-200">
          <StatusTimeline
            currentStatus={report.status}
            statusHistory={report.statusHistory}
          />
        </div>
      </div>
    </div>
  );
};
