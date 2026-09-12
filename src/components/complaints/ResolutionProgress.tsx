import React from 'react';
import { ProblemStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Check } from 'lucide-react';

interface ResolutionProgressProps {
  status: ProblemStatus;
  className?: string;
}

// Maps every possible backend status onto one of the 7 simple citizen-facing steps.
const STATUS_TO_STEP: Record<ProblemStatus, number> = {
  Submitted: 0,
  'Under Review': 1,
  Assigned: 2,
  'In Progress': 3,
  'Awaiting Information': 3,
  Reopened: 3,
  'Resolution Submitted': 4,
  'Citizen Verification': 5,
  Resolved: 6,
  Closed: 6,
  Rejected: 1,
};

export const ResolutionProgress: React.FC<ResolutionProgressProps> = ({ status, className = '' }) => {
  const { t } = useLanguage();

  const steps = [
    t.track.steps.reported,
    t.track.steps.acknowledged,
    t.track.steps.assigned,
    t.track.steps.inProgress,
    t.track.steps.resolutionSubmitted,
    t.track.steps.citizenVerification,
    t.track.steps.resolved,
  ];

  const activeIndex = STATUS_TO_STEP[status] ?? 0;
  const isRejected = status === 'Rejected';
  const isReopened = status === 'Reopened';

  return (
    <div className={className}>
      {(isRejected || isReopened) && (
        <div
          className={`mb-4 px-3 py-2 rounded-lg text-xs font-medium ${
            isRejected ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          {isRejected ? '✕ This case was not accepted for action.' : '↻ Reopened — being reviewed again.'}
        </div>
      )}

      {/* Mobile: vertical list */}
      <ol className="sm:hidden space-y-0">
        {steps.map((label, i) => {
          const done = i < activeIndex || status === 'Resolved';
          const current = i === activeIndex && status !== 'Resolved';
          return (
            <li key={label} className="flex items-center gap-3 py-1.5">
              <span
                className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 text-[11px] font-bold ${
                  done
                    ? 'bg-emerald-600 text-white'
                    : current
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-400 border border-slate-300'
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span className={`text-sm ${current ? 'font-bold text-slate-900' : done ? 'text-slate-700' : 'text-slate-400'}`}>
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Desktop / tablet: horizontal rail */}
      <ol className="hidden sm:flex items-start w-full">
        {steps.map((label, i) => {
          const done = i < activeIndex || status === 'Resolved';
          const current = i === activeIndex && status !== 'Resolved';
          const isLastStep = i === steps.length - 1;
          return (
            <li key={label} className={`flex items-center ${isLastStep ? '' : 'flex-1'}`}>
              <div className="flex flex-col items-center text-center" style={{ width: '84px' }}>
                <span
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                    done
                      ? 'bg-emerald-600 text-white'
                      : current
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-slate-100 text-slate-400 border border-slate-300'
                  }`}
                >
                  {done ? <Check className="w-4 h-4" /> : i + 1}
                </span>
                <span
                  className={`mt-1.5 text-[11px] leading-tight ${
                    current ? 'font-bold text-slate-900' : done ? 'text-slate-600 font-medium' : 'text-slate-400'
                  }`}
                >
                  {label}
                </span>
              </div>
              {!isLastStep && (
                <div className={`flex-1 h-0.5 mt-3.5 ${i < activeIndex ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default ResolutionProgress;
