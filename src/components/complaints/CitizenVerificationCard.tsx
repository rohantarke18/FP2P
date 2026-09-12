import React, { useState } from 'react';
import { Problem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { complaintService } from '../../services/complaintService';
import { useNotifications } from '../../context/NotificationContext';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface CitizenVerificationCardProps {
  problem: Problem;
  onVerificationSubmitted?: (updatedProblem: Problem) => void;
  className?: string;
}

export const CitizenVerificationCard: React.FC<CitizenVerificationCardProps> = ({
  problem,
  onVerificationSubmitted,
  className = '',
}) => {
  const { t } = useLanguage();
  const { showToast } = useNotifications();

  const [isDisputing, setIsDisputing] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Already resolved and confirmed by the citizen
  if (problem.citizenVerification?.status === 'verified') {
    return (
      <div className={`p-4 rounded-lg border border-emerald-200 bg-emerald-50 ${className}`}>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <p className="text-sm font-bold text-emerald-900">{t.track.verificationDone}</p>
            <p className="text-xs text-emerald-700 mt-0.5">{t.track.caseClosed}</p>
          </div>
        </div>
      </div>
    );
  }

  // Citizen said it wasn't actually fixed
  if (problem.citizenVerification?.status === 'disputed') {
    return (
      <div className={`p-4 rounded-lg border border-rose-200 bg-rose-50 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-rose-900">{t.track.verificationDisputed}</p>
            {problem.citizenVerification.disputeReason && (
              <p className="text-xs text-rose-700 mt-1">{problem.citizenVerification.disputeReason}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Not ready for verification yet — nothing to show here (progress tracker already covers this)
  const isAwaitingVerification =
    problem.status === 'Resolution Submitted' ||
    problem.status === 'Citizen Verification' ||
    problem.status === 'Resolved';

  if (!isAwaitingVerification) {
    return null;
  }

  const handleVerifyYes = async () => {
    try {
      setIsSubmitting(true);
      const updated = await complaintService.verifyResolution(problem.id, { status: 'verified' });
      showToast('success', t.track.verificationDone, '');
      onVerificationSubmitted?.(updated);
    } catch (err: any) {
      showToast('error', 'Something went wrong', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyNo = async () => {
    if (!disputeReason.trim()) return;
    try {
      setIsSubmitting(true);
      const updated = await complaintService.verifyResolution(problem.id, {
        status: 'disputed',
        disputeReason,
      });
      showToast('info', t.track.verificationDisputed, '');
      onVerificationSubmitted?.(updated);
    } catch (err: any) {
      showToast('error', 'Something went wrong', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`p-5 rounded-xl border-2 border-blue-200 bg-blue-50/50 ${className}`}>
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0" />
        <h3 className="text-base font-bold text-slate-900">{t.track.verificationPrompt}</h3>
      </div>

      {!isDisputing ? (
        <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleVerifyYes}
            disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-colors disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {t.track.btnVerified}
          </button>
          <button
            type="button"
            onClick={() => setIsDisputing(true)}
            disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 font-semibold text-sm transition-colors disabled:opacity-60"
          >
            <XCircle className="w-4 h-4" />
            {t.track.btnDispute}
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <label className="text-sm font-semibold text-slate-800 block">{t.track.disputeQuestion}</label>
          <textarea
            rows={3}
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            placeholder={t.track.disputePlaceholder}
            className="w-full text-sm p-3 rounded-lg border border-slate-300 bg-white focus:outline-blue-600"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleVerifyNo}
              disabled={isSubmitting || !disputeReason.trim()}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
            >
              {isSubmitting ? '…' : t.track.disputeSubmit}
            </button>
            <button
              type="button"
              onClick={() => setIsDisputing(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              {t.common.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
