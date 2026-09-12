import React from 'react';
import { ProblemStatus, PriorityLevel } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  UserCheck,
  RotateCcw,
  XCircle,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Flame,
} from 'lucide-react';

interface StatusBadgeProps {
  status: ProblemStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const { t } = useLanguage();

  const label = t.status[status] || status;

  let colorClasses = 'bg-slate-100 text-slate-800 border-slate-200';
  let Icon = Clock;

  switch (status) {
    case 'Submitted':
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';
      Icon = Clock;
      break;
    case 'Under Review':
      colorClasses = 'bg-sky-50 text-sky-800 border-sky-200';
      Icon = Sparkles;
      break;
    case 'Assigned':
      colorClasses = 'bg-indigo-50 text-indigo-800 border-indigo-200';
      Icon = UserCheck;
      break;
    case 'In Progress':
      colorClasses = 'bg-blue-50 text-blue-800 border-blue-200';
      Icon = ArrowUpRight;
      break;
    case 'Awaiting Information':
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
      Icon = AlertCircle;
      break;
    case 'Resolution Submitted':
      colorClasses = 'bg-teal-50 text-teal-800 border-teal-200';
      Icon = FileCheck;
      break;
    case 'Citizen Verification':
      colorClasses = 'bg-purple-50 text-purple-900 border-purple-200 font-semibold animate-pulse';
      Icon = ShieldAlert;
      break;
    case 'Resolved':
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300';
      Icon = CheckCircle2;
      break;
    case 'Reopened':
      colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
      Icon = RotateCcw;
      break;
    case 'Rejected':
      colorClasses = 'bg-stone-100 text-stone-700 border-stone-200';
      Icon = XCircle;
      break;
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm font-medium'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border tracking-tight ${colorClasses} ${sizeClasses} ${className}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} aria-hidden="true" />
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
};

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: 'sm' | 'md';
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md', className = '' }) => {
  const { t } = useLanguage();

  const label = t.priority[priority] || priority;

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = AlertCircle;

  switch (priority) {
    case 'Critical':
      colorClasses = 'bg-rose-100 text-rose-900 border-rose-300 font-semibold';
      Icon = Flame;
      break;
    case 'High':
      colorClasses = 'bg-amber-100 text-amber-900 border-amber-300';
      Icon = AlertCircle;
      break;
    case 'Medium':
      colorClasses = 'bg-sky-50 text-sky-800 border-sky-200';
      Icon = AlertCircle;
      break;
    case 'Low':
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
      Icon = AlertCircle;
      break;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border ${colorClasses} ${sizeClasses} ${className}`}
    >
      <Icon className="w-3 h-3 shrink-0" aria-hidden="true" />
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
};
