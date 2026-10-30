import React from 'react';
import { ReportStatus } from '../types';
import { Clock, Eye, UserCheck, Wrench, CheckCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const upper = (status || 'SUBMITTED').toUpperCase() as ReportStatus;

  let badgeStyle = 'bg-blue-100 text-blue-900 border-blue-300';
  let Icon = Clock;
  let label = 'Submitted';

  switch (upper) {
    case 'SUBMITTED':
      badgeStyle = 'bg-blue-50 text-blue-800 border-blue-200';
      Icon = Clock;
      label = 'Submitted';
      break;
    case 'UNDER REVIEW':
      badgeStyle = 'bg-purple-50 text-purple-800 border-purple-200';
      Icon = Eye;
      label = 'Under Review';
      break;
    case 'ASSIGNED':
      badgeStyle = 'bg-indigo-50 text-indigo-800 border-indigo-200';
      Icon = UserCheck;
      label = 'Assigned';
      break;
    case 'IN PROGRESS':
      badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
      Icon = Wrench;
      label = 'In Progress';
      break;
    case 'RESOLVED':
      badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      Icon = CheckCircle;
      label = 'Resolved';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${badgeStyle} ${className}`}
      aria-label={`Complaint status: ${label}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};
