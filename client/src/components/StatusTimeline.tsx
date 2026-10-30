import React from 'react';
import { ReportStatus, StatusHistoryItem } from '../types';
import { Check, Clock, CircleDot, Circle } from 'lucide-react';

interface StatusTimelineProps {
  currentStatus: ReportStatus;
  statusHistory?: StatusHistoryItem[];
}

const ORDERED_STEPS: { key: ReportStatus; label: string; desc: string }[] = [
  { key: 'SUBMITTED', label: 'Submitted', desc: 'Complaint registered' },
  { key: 'UNDER REVIEW', label: 'Under Review', desc: 'Assessed by civic intake' },
  { key: 'ASSIGNED', label: 'Assigned', desc: 'Delegated to department' },
  { key: 'IN PROGRESS', label: 'In Progress', desc: 'Remediation work active' },
  { key: 'RESOLVED', label: 'Resolved', desc: 'Action completed & verified' }
];

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ currentStatus, statusHistory = [] }) => {
  const currentIndex = ORDERED_STEPS.findIndex(s => s.key === currentStatus);

  return (
    <div className="w-full py-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-4 tracking-wide uppercase">
        Resolution Progress Timeline
      </h3>

      {/* Progress Bar & Stepper */}
      <div className="grid grid-cols-5 gap-2 relative">
        {ORDERED_STEPS.map((step, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isPending = idx > currentIndex;

          let stepColor = 'bg-slate-100 text-slate-400 border-slate-300';
          if (isPassed) {
            stepColor = 'bg-emerald-500 text-white border-emerald-600';
          } else if (isCurrent) {
            stepColor = 'bg-blue-600 text-white border-blue-700 ring-4 ring-blue-100';
          }

          return (
            <div key={step.key} className="flex flex-col items-center text-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${stepColor}`}
                title={`${step.label}: ${isPassed ? 'Completed' : isCurrent ? 'Current Status' : 'Pending'}`}
              >
                {isPassed && <Check className="w-4 h-4 stroke-[3]" />}
                {isCurrent && <CircleDot className="w-4 h-4 animate-spin-slow" />}
                {isPending && <Circle className="w-4 h-4 stroke-[2]" />}
              </div>
              <span className={`text-xs mt-2 font-medium ${isCurrent ? 'text-blue-700 font-bold' : isPassed ? 'text-emerald-700' : 'text-slate-400'}`}>
                {step.label}
              </span>
              <span className="text-[10px] text-slate-500 hidden sm:block mt-0.5">
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>

      {/* Audit History Log */}
      {statusHistory.length > 0 && (
        <div className="mt-8 border-t border-slate-200 pt-5">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Immutable Audit Trail & Dispatch Notes
          </h4>
          <div className="space-y-3">
            {statusHistory.slice().reverse().map((entry, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800">
                      {entry.status} &bull; <span className="font-normal text-slate-600">{entry.changedBy}</span>
                    </span>
                    <time className="text-slate-400 shrink-0">
                      {new Date(entry.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </time>
                  </div>
                  {entry.note && (
                    <p className="text-slate-600 mt-1 italic font-serif">
                      "{entry.note}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
