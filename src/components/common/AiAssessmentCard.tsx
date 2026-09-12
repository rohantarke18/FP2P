import React from 'react';
import { AiAssessment } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles, Cpu, Info } from 'lucide-react';
import { PriorityBadge } from './StatusBadge';

interface AiAssessmentCardProps {
  assessment: AiAssessment;
  compact?: boolean;
  className?: string;
}

export const AiAssessmentCard: React.FC<AiAssessmentCardProps> = ({
  assessment,
  compact = false,
  className = '',
}) => {
  const { t } = useLanguage();

  if (!assessment) {
    return null;
  }

  const reasoningList = Array.isArray(assessment.reasoning) ? assessment.reasoning : [];

  return (
    <div
      className={`rounded-lg border border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white p-5 text-slate-800 ${className}`}
    >
      {/* Banner disclaimer */}
      <div className="flex items-start gap-2.5 pb-3 border-b border-indigo-100">
        <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-md shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-indigo-950">
              {t.report.aiNoticeTitle}
            </h4>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
              {t.aiCard.advisoryBadge}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            {t.report.aiNoticeDesc}
          </p>
        </div>
      </div>

      {/* Grid of AI suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        <div className="bg-white p-3 rounded border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide block">
            {t.aiCard.suggestedCategory}
          </span>
          <span className="text-sm font-semibold text-slate-900 mt-0.5 block">
            {assessment.category}
          </span>
        </div>

        <div className="bg-white p-3 rounded border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide block">
            {t.aiCard.suggestedDepartment}
          </span>
          <span className="text-sm font-semibold text-slate-900 mt-0.5 block truncate" title={assessment.suggestedDepartment}>
            {assessment.suggestedDepartment}
          </span>
        </div>

        <div className="bg-white p-3 rounded border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide block">
              {t.aiCard.suggestedPriority}
            </span>
            <div className="mt-1">
              <PriorityBadge priority={assessment.suggestedPriority} size="sm" />
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase block">{t.aiCard.priorityScore}</span>
            <span className="text-lg font-bold text-indigo-900">
              {assessment.priorityScore}
              <span className="text-xs font-normal text-slate-400">/100</span>
            </span>
          </div>
        </div>
      </div>

      {/* Reasoning points */}
      {!compact && reasoningList.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <h5 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            {t.aiCard.entitiesTitle}:
          </h5>
          <ul className="space-y-1.5">
            {reasoningList.map((item, idx) => (
              <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Timestamp note */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3" />
          Pending final human verification by departmental intake officer.
        </span>
        <span>
          {assessment.generatedAt ? new Date(assessment.generatedAt).toLocaleDateString() : 'Active Docket'}
        </span>
      </div>
    </div>
  );
};
