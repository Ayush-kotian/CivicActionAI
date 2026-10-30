import React from 'react';
import { X, FileText, AlertTriangle, CheckSquare, Layers } from 'lucide-react';
import { HotspotActionBrief } from '../types';
import { PriorityBadge } from './PriorityBadge';

interface ActionBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  brief: HotspotActionBrief;
}

export const ActionBriefModal: React.FC<ActionBriefModalProps> = ({
  isOpen,
  onClose,
  title,
  brief
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="brief-title"
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <FileText className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold font-mono">
                1-Minute Decision-Maker Action Brief
              </span>
              <h3 id="brief-title" className="text-base font-bold text-white leading-tight">
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
            aria-label="Close action brief modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Priority & Quick Metrics */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Operational Priority Classification
            </span>
            <PriorityBadge priority={brief.priority} />
          </div>

          {/* Issue Summary */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Core Issue</span>
            </h4>
            <p className="text-sm font-semibold text-slate-900 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
              {brief.issue}
            </p>
          </div>

          {/* Evidence */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Layers className="w-4 h-4 text-blue-500" />
              <span>Evidence & Report Density</span>
            </h4>
            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {brief.evidence}
            </p>
          </div>

          {/* Impact */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Anticipated Public & Transit Impact
            </h4>
            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {brief.impact}
            </p>
          </div>

          {/* Recommended Action */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Recommended Authority Directive</span>
            </h4>
            <div className="text-sm font-medium text-emerald-950 bg-emerald-50 p-3.5 rounded-lg border border-emerald-200">
              {brief.recommendedAction}
            </div>
          </div>

          {/* Strategic Rationale */}
          {brief.reason && (
            <div className="pt-2 text-xs text-slate-500 border-t border-slate-100">
              <span className="font-semibold text-slate-600">Decision Rationale: </span>
              {brief.reason}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
