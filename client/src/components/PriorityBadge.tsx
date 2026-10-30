import React from 'react';
import { PriorityLevel } from '../types';
import { AlertOctagon, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  score?: number;
  showScore?: boolean;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  score,
  showScore = false,
  className = ''
}) => {
  const upper = (priority || 'MEDIUM').toUpperCase() as PriorityLevel;

  let badgeStyle = 'bg-yellow-100 text-yellow-900 border-yellow-300';
  let Icon = AlertCircle;
  let label = 'Medium';

  switch (upper) {
    case 'CRITICAL':
      badgeStyle = 'bg-red-100 text-red-900 border-red-400 font-bold animate-pulse';
      Icon = AlertOctagon;
      label = 'Critical';
      break;
    case 'HIGH':
      badgeStyle = 'bg-amber-100 text-amber-900 border-amber-400 font-semibold';
      Icon = AlertTriangle;
      label = 'High';
      break;
    case 'MEDIUM':
      badgeStyle = 'bg-yellow-100 text-yellow-900 border-yellow-300';
      Icon = AlertCircle;
      label = 'Medium';
      break;
    case 'LOW':
      badgeStyle = 'bg-emerald-100 text-emerald-900 border-emerald-300';
      Icon = CheckCircle2;
      label = 'Low';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border tracking-wide uppercase ${badgeStyle} ${className}`}
      aria-label={`Priority level: ${label}${score !== undefined ? ` with score ${score}` : ''}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
      {showScore && score !== undefined && (
        <span className="ml-1 px-1.5 py-0.2 bg-black/10 rounded font-mono text-[11px]">
          {score}/100
        </span>
      )}
    </span>
  );
};
