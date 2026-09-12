import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { complaintService } from '../services/complaintService';
import { Problem } from '../types';
import { getLocalizedProblem } from '../utils/localizedData';
import { TimelineView } from '../components/complaints/TimelineView';
import { CitizenVerificationCard } from '../components/complaints/CitizenVerificationCard';
import { ResolutionProgress } from '../components/complaints/ResolutionProgress';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import { AiAssessmentCard } from '../components/common/AiAssessmentCard';
import {
  Search,
  MapPin,
  Building2,
  AlertCircle,
  Loader2,
  Paperclip,
  Trash2,
  Edit3,
  PlusCircle,
  Clock,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

export const TrackPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, isAdminOrOfficer } = useAuth();
  const { showToast } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlId = searchParams.get('id') || '';
  const [searchId, setSearchId] = useState(urlId);
  const [rawProblem, setProblem] = useState<Problem | null>(null);
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const problem = useMemo(() => {
    return rawProblem ? getLocalizedProblem(rawProblem, language) : null;
  }, [rawProblem, language]);

  const loadCase = async (idToLoad: string) => {
    if (!idToLoad.trim()) return;
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await complaintService.getComplaintById(idToLoad.trim());
      if (res) {
        setProblem(res);
        setEditTitle(res.title);
        setEditDesc(res.description);
        setSearchParams({ id: idToLoad.trim() });
      } else {
        setProblem(null);
        setErrorMessage(t.track.caseNotFound);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    complaintService.getComplaints().then((list) => {
      const safeList = Array.isArray(list) ? list : [];
      setAllProblems(safeList);
      if (urlId) {
        loadCase(urlId);
      } else if (safeList.length > 0) {
        setSearchId(safeList[0].id);
        loadCase(safeList[0].id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDetails(false);
    loadCase(searchId);
  };

  const handleDelete = async () => {
    if (!problem) return;
    const confirmed = window.confirm(`Delete case ${problem.id}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await complaintService.deleteComplaint(problem.id);
      showToast('success', 'Case Deleted', `${problem.id} has been deleted.`);
      const remaining = allProblems.filter((p) => p.id !== problem.id);
      setAllProblems(remaining);
      if (remaining.length > 0) {
        setSearchId(remaining[0].id);
        loadCase(remaining[0].id);
      } else {
        setProblem(null);
        setSearchParams({});
      }
    } catch (err: any) {
      showToast('error', 'Delete Failed', err?.message || 'Could not delete case.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem || !editTitle.trim() || !editDesc.trim()) return;
    try {
      setIsSavingEdit(true);
      const updated = await complaintService.updateComplaint(problem.id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
      });
      setProblem(updated);
      setIsEditing(false);
      showToast('success', 'Updated', 'Your changes were saved.');
    } catch (err: any) {
      showToast('error', 'Update Failed', err?.message || 'Could not save changes.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const canModify =
    isAdminOrOfficer ||
    (user && rawProblem && (rawProblem.reporterUid === user.id || rawProblem.citizenName === user.name));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Header & Search */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{t.track.title}</h1>
        <p className="mt-1.5 text-sm text-slate-500">{t.track.subtitle}</p>

        <form onSubmit={handleSearch} className="mt-5 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder={t.track.searchPlaceholder}
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-blue-600 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.track.searchBtn}
          </button>
        </form>

        {allProblems.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-medium">{t.track.recentCases}:</span>
            {allProblems.slice(0, 5).map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => {
                  setSearchId(sp.id);
                  setShowDetails(false);
                  loadCase(sp.id);
                }}
                className={`px-2 py-0.5 rounded font-mono text-[11px] border transition-colors ${
                  problem?.id === sp.id
                    ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {sp.id}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Link to="/report" className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold shrink-0">
            Report a Problem
          </Link>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && !problem && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs animate-pulse space-y-4">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-5 w-2/3 bg-slate-200 rounded" />
          <div className="h-3 w-40 bg-slate-200 rounded" />
          <div className="flex gap-3 pt-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-8 rounded-full bg-slate-200" />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!problem && allProblems.length === 0 && !isLoading && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No problems reported yet</h3>
            <p className="text-sm text-slate-500 mt-1">File your first report to start tracking it here.</p>
          </div>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report a Problem</span>
          </Link>
        </div>
      )}

      {/* Main simple view */}
      {problem && (
        <div className="space-y-5">
          {/* Status card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                {problem.id}
              </span>
              {canModify && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                    title="Delete"
                  >
                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="mt-3 space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-sm p-2 rounded border border-slate-300 bg-white"
                  required
                />
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full text-sm p-2 rounded border border-slate-300 bg-white"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded">
                    {t.common.cancel}
                  </button>
                  <button type="submit" disabled={isSavingEdit} className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold">
                    {isSavingEdit ? 'Saving…' : t.common.save}
                  </button>
                </div>
              </form>
            ) : (
              <h2 className="mt-2 text-lg font-bold text-slate-900 leading-snug">{problem.title}</h2>
            )}

            <div className="mt-3 flex items-center gap-2">
              <PriorityBadge priority={problem.priority} size="sm" />
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">{t.track.currentStatus}:</span>
              <StatusBadge status={problem.status} size="sm" />
            </div>

            {/* Simple progress tracker */}
            <div className="mt-6">
              <ResolutionProgress status={problem.status} />
            </div>
          </div>

          {/* Verify resolution — only shows when relevant */}
          <CitizenVerificationCard problem={problem} onVerificationSubmitted={(updated) => setProblem(updated)} />

          {/* Resolution evidence, if the department submitted it */}
          {problem.resolutionEvidence && (
            <div className="bg-white rounded-xl border border-teal-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Resolution Evidence</h3>
              </div>
              {problem.resolutionEvidence.notes && (
                <p className="text-sm text-slate-600 leading-relaxed">{problem.resolutionEvidence.notes}</p>
              )}
              {problem.resolutionEvidence.media && problem.resolutionEvidence.media.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {problem.resolutionEvidence.media.map((med) => (
                    <div key={med.id} className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                      {med.type === 'image' ? (
                        <img src={med.url} alt={med.name} className="w-full h-24 object-cover" />
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-600">
                          <Paperclip className="w-4 h-4 mx-auto mb-1 text-slate-400" />
                          <span className="truncate block">{med.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Everything else lives behind one toggle */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <span>{showDetails ? t.track.hideDetails : t.track.viewMoreDetails}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>

            {showDetails && (
              <div className="border-t border-slate-200 p-5 space-y-6">
                <p className="text-sm text-slate-600 leading-relaxed">{problem.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-slate-600">
                      {problem.location.address}, {problem.location.ward}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-slate-600">{problem.department}</span>
                  </div>
                </div>

                {problem.assignedOfficer && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{t.track.officerDetails}</h4>
                    <p className="text-sm text-slate-800 font-medium">{problem.assignedOfficer.name}</p>
                    <p className="text-xs text-slate-500">{problem.assignedOfficer.designation} · {problem.assignedOfficer.department}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{t.track.slaCountdown}</h4>
                  <p className="text-sm text-slate-800">{new Date(problem.deadline).toLocaleDateString()}</p>
                </div>

                <div>
                  <AiAssessmentCard assessment={problem.aiAssessment} />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{t.track.timelineHeading}</h4>
                  <TimelineView events={problem.timeline} currentStatus={problem.status} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
