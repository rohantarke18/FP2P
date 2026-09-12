import React, { useState } from 'react';
import { Problem } from '../../types';
import { MUNICIPAL_OFFICERS, MunicipalOfficer } from '../../data/officers';
import { PriorityBadge } from '../common/StatusBadge';
import {
  X,
  UserCheck,
  Calendar,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  HardHat,
} from 'lucide-react';

interface AssignOfficerModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: Problem | null;
  onAssigned: (problemId: string, officer: MunicipalOfficer, deadline: string, notes?: string) => Promise<void>;
}

export const AssignOfficerModal: React.FC<AssignOfficerModalProps> = ({
  isOpen,
  onClose,
  problem,
  onAssigned,
}) => {
  if (!isOpen || !problem) return null;

  // Find recommended officer matching department
  const recommendedOfficer =
    MUNICIPAL_OFFICERS.find((o) => o.department === problem.department) || MUNICIPAL_OFFICERS[0];

  const [selectedOfficerId, setSelectedOfficerId] = useState<string>(
    problem.assignedOfficer?.id || recommendedOfficer.id
  );

  // Default SLA days: Critical=1 day, High=2 days, Medium=4 days, Low=7 days
  const defaultDays =
    problem.priority === 'Critical' ? 1 : problem.priority === 'High' ? 2 : problem.priority === 'Medium' ? 4 : 7;

  const calculateDeadline = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
  };

  const [slaDays, setSlaDays] = useState<number>(defaultDays);
  const [instructions, setInstructions] = useState<string>(
    `Execute field inspection for ${problem.category}. Coordinate with local ward representative and upload before/after photos upon remediation.`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedOfficer =
    MUNICIPAL_OFFICERS.find((o) => o.id === selectedOfficerId) || recommendedOfficer;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const deadline = calculateDeadline(slaDays);
      await onAssigned(problem.id, selectedOfficer, deadline, instructions);
      onClose();
    } catch (err) {
      console.error('Failed to assign officer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Field Officer Dispatch Console
              </h2>
              <p className="text-xs text-slate-300">
                Docket {problem.id} • SLA Resolution Commitment
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Problem Quick Summary */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 space-y-1.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                {problem.id}
              </span>
              <PriorityBadge priority={problem.priority} size="sm" />
              <span className="text-[11px] font-semibold text-slate-600 ml-auto">
                {problem.location.ward}
              </span>
            </div>
            <p className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 mt-1">
              {problem.title}
            </p>
            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
              {problem.description}
            </p>
          </div>

          {/* Available Officers Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Select Field Engineer / Executive</span>
              </label>
              <span className="text-[11px] text-slate-500">
                {MUNICIPAL_OFFICERS.length} available personnel
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
              {MUNICIPAL_OFFICERS.map((officer) => {
                const isSelected = officer.id === selectedOfficerId;
                const isMatch = officer.department === problem.department;
                const loadColor =
                  officer.activeCasesCount <= 1
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : officer.activeCasesCount <= 3
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200';

                return (
                  <div
                    key={officer.id}
                    onClick={() => setSelectedOfficerId(officer.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {officer.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 text-xs">
                            {officer.name}
                          </span>
                          {isMatch && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                              <span>Dept Match</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {officer.designation} • {officer.department}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${loadColor}`}>
                        {officer.activeCasesCount} Active
                      </span>
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => setSelectedOfficerId(officer.id)}
                        className="text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Statutory SLA Commitment */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Statutory SLA Target Deadline</span>
            </label>

            <div className="grid grid-cols-4 gap-2">
              {[
                { days: 1, label: '24 Hours', sub: 'Urgent / Critical' },
                { days: 2, label: '48 Hours', sub: 'High Priority' },
                { days: 4, label: '4 Days', sub: 'Standard Civil' },
                { days: 7, label: '7 Days', sub: 'Complex Structural' },
              ].map((item) => (
                <button
                  key={item.days}
                  type="button"
                  onClick={() => setSlaDays(item.days)}
                  className={`p-2.5 rounded-xl border text-center transition-colors cursor-pointer ${
                    slaDays === item.days
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="block text-xs font-bold">{item.label}</span>
                  <span className="block text-[10px] opacity-80 truncate">{item.sub}</span>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Target Completion Date: <strong className="text-slate-800">{new Date(calculateDeadline(slaDays)).toLocaleDateString('en-IN', { dateStyle: 'full' })}</strong>
              </span>
            </p>
          </div>

          {/* Dispatch Work Order Notes */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">
              Work Order Instructions / Dispatch Note
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-blue-600 shadow-2xs leading-relaxed"
              placeholder="Add instructions for the field engineer..."
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? (
                <span>Dispatching…</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Commit Assignment & Activate SLA</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
