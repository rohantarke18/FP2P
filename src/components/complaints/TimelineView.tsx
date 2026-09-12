import React from 'react';
import { TimelineEvent, ProblemStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  CheckCircle2,
  Clock,
  User,
  Building2,
  FileCheck2,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowDown,
} from 'lucide-react';

interface TimelineViewProps {
  events: TimelineEvent[];
  currentStatus: ProblemStatus;
  className?: string;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  events,
  currentStatus,
  className = '',
}) => {
  const getStepIcon = (event: TimelineEvent) => {
    switch (event.status) {
      case 'Resolved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'Citizen Verification':
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      case 'Resolution Submitted':
        return <FileCheck2 className="w-4 h-4 text-teal-600" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'Assigned':
        return <Building2 className="w-4 h-4 text-indigo-600" />;
      case 'Under Review':
        return <Sparkles className="w-4 h-4 text-sky-600" />;
      case 'Reopened':
        return <RotateCcw className="w-4 h-4 text-rose-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flow-root">
        <ul className="-mb-8">
          {events.map((event, eventIdx) => {
            const isLast = eventIdx === events.length - 1;

            return (
              <li key={event.id || eventIdx} className="relative pb-8">
                {/* Vertical connecting line */}
                {!isLast && (
                  <span
                    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}

                <div className="relative flex items-start space-x-3.5">
                  {/* Step icon pill */}
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 border-slate-200 shadow-2xs shrink-0">
                    {getStepIcon(event)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-slate-400">
                          [{event.step}]
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900">{event.title}</h4>
                      </div>
                      <time className="text-xs text-slate-400 font-medium">
                        {event.timestamp}
                      </time>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <StatusBadge status={event.status} size="sm" />
                      {event.department && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {event.department}
                        </span>
                      )}
                      {event.actorName && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          <User className="w-3 h-3 text-slate-400" />
                          {event.actorName} {event.actorRole ? `(${event.actorRole})` : ''}
                        </span>
                      )}
                    </div>

                    {event.notes && (
                      <p className="mt-2 text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded border border-slate-200/80 leading-relaxed">
                        {event.notes}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
