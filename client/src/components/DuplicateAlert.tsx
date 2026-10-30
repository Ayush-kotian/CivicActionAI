import React, { useState } from 'react';
import {
  CopyCheck,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  MapPin
} from 'lucide-react';
import { Report, DuplicateStatus, DuplicateTier } from '../types';

interface DuplicateAlertProps {
  duplicateScore: number;
  duplicateReportIds: string[];
  duplicateExplanation: string;
  duplicateStatus?: DuplicateStatus;
  duplicateTier?: DuplicateTier;
  duplicateOf?: string | null;
  duplicateReason?: string;
  duplicateReasons?: string[];
  relatedDuplicates?: Partial<Report>[];
  onViewReport?: (complaintId: string) => void;
  onStatusUpdate?: (newStatus: 'confirmed' | 'rejected') => void;
  isCitizenView?: boolean;
}

export const DuplicateAlert: React.FC<DuplicateAlertProps> = ({
  duplicateScore,
  duplicateReportIds,
  duplicateExplanation,
  duplicateStatus = 'possible',
  duplicateTier,
  duplicateOf,
  duplicateReason,
  duplicateReasons = [],
  relatedDuplicates = [],
  onViewReport,
  onStatusUpdate,
  isCitizenView = false
}) => {
  const [updating, setUpdating] = useState(false);

  if (!duplicateReportIds || duplicateReportIds.length === 0) return null;

  const primaryLinkedId = duplicateOf || duplicateReportIds[0];
  const isStrong = duplicateScore >= 80;
  const tierLabel = duplicateTier || (isStrong ? 'Likely Duplicate' : 'Possible Duplicate');

  const isConfirmed = duplicateStatus === 'confirmed';
  const isRejected = duplicateStatus === 'rejected';

  const handleAction = async (status: 'confirmed' | 'rejected') => {
    if (!onStatusUpdate) return;
    try {
      setUpdating(true);
      await onStatusUpdate(status);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={`rounded-xl p-4.5 border transition-all ${
      isConfirmed
        ? 'bg-purple-50/80 border-purple-300'
        : isRejected
        ? 'bg-slate-50 border-slate-200 opacity-80'
        : isStrong
        ? 'bg-amber-50/90 border-amber-300 shadow-xs'
        : 'bg-yellow-50/80 border-yellow-200'
    }`}>
      <div className="flex items-start gap-3.5">
        <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
          isConfirmed ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
        }`}>
          <CopyCheck className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {isConfirmed
                    ? 'Confirmed Duplicate Issue'
                    : isRejected
                    ? 'Cleared Duplicate (Marked Unique)'
                    : isCitizenView
                    ? 'Similar Complaint Found'
                    : `${tierLabel} Detected`}
                </span>
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                isStrong ? 'bg-amber-200 text-amber-950' : 'bg-yellow-100 text-yellow-900 border border-yellow-300'
              }`}>
                {duplicateScore}% Similarity
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Evidence Preserved (Never Deleted)</span>
            </div>
          </div>

          {/* Primary linked complaint pill */}
          <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-800">
            <span className="font-semibold text-slate-600">Primary Linked Complaint:</span>
            <button
              type="button"
              onClick={() => onViewReport && onViewReport(primaryLinkedId)}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white hover:bg-amber-100 border border-amber-300 rounded text-xs font-mono font-bold text-blue-700 transition"
            >
              <span>#{primaryLinkedId}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          {/* Reason Summary */}
          {duplicateReason && (
            <p className="text-xs text-slate-800 mt-1.5 font-medium leading-relaxed font-sans">
              {duplicateReason}
            </p>
          )}

          {/* Explainable Reasons Bullet List (Section 8 requirement) */}
          {duplicateReasons && duplicateReasons.length > 0 && (
            <div className="mt-2.5 bg-white/70 rounded-lg p-2.5 border border-amber-200/60">
              <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wide block mb-1">
                Why this was classified as a duplicate:
              </span>
              <ul className="space-y-1 text-xs text-slate-700 font-sans">
                {duplicateReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">&bull;</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* All related filings */}
          {duplicateReportIds.length > 1 && (
            <div className="mt-3 pt-2.5 border-t border-amber-200/60">
              <span className="text-xs font-semibold text-slate-700">All Correlated Filings ({duplicateReportIds.length}):</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {duplicateReportIds.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onViewReport && onViewReport(id)}
                    className="font-mono text-[11px] font-bold text-blue-700 bg-white hover:bg-amber-50 px-2 py-0.5 rounded border border-amber-300 transition"
                  >
                    #{id}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Side-by-side or mini cards for related duplicates */}
          {relatedDuplicates.length > 0 && (
            <div className="mt-3 space-y-2">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide block">
                Existing Complaint Comparison:
              </span>
              {relatedDuplicates.map((dup) => (
                <div key={dup.complaintId} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-900 flex justify-between items-center">
                    <span className="font-mono font-bold text-blue-700">#{dup.complaintId} &bull; {dup.category}</span>
                    <span className="px-2 py-0.2 rounded text-[10px] bg-slate-100 font-medium">{dup.status}</span>
                  </div>
                  <p className="text-slate-600 italic">"{dup.description}"</p>
                  {dup.location?.address && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{dup.location.address}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Admin Authority Review Actions (Section 6) */}
          {!isCitizenView && onStatusUpdate && (
            <div className="mt-4 pt-3 border-t border-amber-200/80 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-600 font-medium">Authority Duplicate Review:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={updating || isConfirmed}
                  onClick={() => handleAction('confirmed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    isConfirmed
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-white hover:bg-purple-50 text-purple-700 border border-purple-300'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isConfirmed ? 'Confirmed' : 'Confirm Duplicate'}</span>
                </button>

                <button
                  type="button"
                  disabled={updating || isRejected}
                  onClick={() => handleAction('rejected')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                    isRejected
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{isRejected ? 'Marked Not Duplicate' : 'Mark as Not Duplicate'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
