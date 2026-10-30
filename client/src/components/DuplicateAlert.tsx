import React from 'react';
import { CopyCheck, ExternalLink, ShieldCheck } from 'lucide-react';
import { Report } from '../types';

interface DuplicateAlertProps {
  duplicateScore: number;
  duplicateReportIds: string[];
  duplicateExplanation: string;
  relatedDuplicates?: Partial<Report>[];
  onViewReport?: (complaintId: string) => void;
}

export const DuplicateAlert: React.FC<DuplicateAlertProps> = ({
  duplicateScore,
  duplicateReportIds,
  duplicateExplanation,
  relatedDuplicates = [],
  onViewReport
}) => {
  if (!duplicateReportIds || duplicateReportIds.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 shadow-sm text-slate-800">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0 mt-0.5">
          <CopyCheck className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
              <span>Potential Duplicate Detected</span>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full text-xs font-mono font-bold">
                {duplicateScore}% Similarity
              </span>
            </h4>
            <div className="flex items-center gap-1 text-[11px] text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Evidence Preserved (Not Deleted)</span>
            </div>
          </div>

          <p className="text-xs text-amber-900 mt-1.5 leading-relaxed font-sans">
            {duplicateExplanation}
          </p>

          {/* Linked Reports List */}
          <div className="mt-3 pt-3 border-t border-amber-200/80">
            <span className="text-xs font-semibold text-amber-900">Correlated Citizen Filings:</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {duplicateReportIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onViewReport && onViewReport(id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded text-xs font-mono font-bold text-blue-700 transition shadow-xs"
                >
                  <span>#{id}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          {relatedDuplicates.length > 0 && (
            <div className="mt-3 space-y-2">
              {relatedDuplicates.map((dup) => (
                <div key={dup.complaintId} className="bg-white/80 p-2 rounded border border-amber-200 text-xs text-slate-700">
                  <div className="font-semibold text-slate-900 flex justify-between">
                    <span>#{dup.complaintId} &bull; {dup.category}</span>
                    <span className="text-[10px] text-slate-500">{dup.status}</span>
                  </div>
                  <p className="text-slate-600 line-clamp-1 mt-0.5">{dup.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
