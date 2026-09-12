import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { complaintService } from '../../services/complaintService';
import { Problem, ProblemStatus, PriorityLevel, EvidenceItem, ResolutionEvidence } from '../../types';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { AiAssessmentCard } from '../../components/common/AiAssessmentCard';
import { MapPlaceholder } from '../../components/common/MapPlaceholder';
import { FileUploader } from '../../components/common/FileUploader';
import { TimelineView } from '../../components/complaints/TimelineView';
import { AssignOfficerModal } from '../../components/admin/AssignOfficerModal';
import { MunicipalOfficer } from '../../data/officers';
import {
  ChevronLeft,
  Building2,
  User,
  Clock,
  Calendar,
  AlertCircle,
  FileCheck2,
  ShieldCheck,
  Send,
  UploadCloud,
  CheckCircle2,
  Paperclip,
  Loader2,
  MapPin,
  Trash2,
  UserCheck,
  HardHat,
  Sparkles,
} from 'lucide-react';

export const AdminCaseViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useNotifications();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [newStatus, setNewStatus] = useState<ProblemStatus>('In Progress');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Internal Note form
  const [internalNoteText, setInternalNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Resolution Form state
  const [workOrderRef, setWorkOrderRef] = useState('WO-2026-0814');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionFiles, setResolutionFiles] = useState<EvidenceItem[]>([]);
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);

  // Assign Officer Modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const handleModalAssigned = async (
    problemId: string,
    officer: MunicipalOfficer,
    deadline: string
  ) => {
    try {
      const updated = await complaintService.assignOfficer(
        problemId,
        {
          id: officer.id,
          name: officer.name,
          designation: officer.designation,
          department: officer.department,
        },
        deadline
      );
      setProblem(updated);
      setNewStatus(updated.status);
      showToast('success', 'Officer Dispatched', `Case ${problemId} assigned to ${officer.name}.`);
    } catch (err: any) {
      showToast('error', 'Assignment Failed', err.message);
    }
  };

  useEffect(() => {
    if (id) {
      complaintService.getComplaintById(id).then((res) => {
        if (res) {
          setProblem(res);
          setNewStatus(res.status);
        }
      });
    }
  }, [id]);

  if (!problem) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading administrative docket...
      </div>
    );
  }

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingStatus(true);
      const updated = await complaintService.updateStatus(
        problem.id,
        newStatus,
        statusNote || `Administrative status updated to ${newStatus} by ${user?.name || 'Officer'}.`,
        user?.name || 'Executive Officer'
      );
      setProblem(updated);
      setStatusNote('');
      showToast('success', 'Status Updated', `Case status changed to "${newStatus}".`);
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNoteText.trim()) return;

    try {
      setIsAddingNote(true);
      const updated = await complaintService.addInternalNote(
        problem.id,
        user?.name || 'Authorized Officer',
        user?.designation || role,
        internalNoteText.trim()
      );
      setProblem(updated);
      setInternalNoteText('');
      showToast('success', 'Note Logged', 'Internal supervisory note appended.');
    } catch (err: any) {
      showToast('error', 'Failed to add note', err.message);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleSubmitResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      showToast('warning', 'Notes Required', 'Please detail the remediation work carried out.');
      return;
    }

    try {
      setIsSubmittingResolution(true);

      const resolutionData: ResolutionEvidence = {
        id: `res-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        workOrderRef,
        notes: resolutionNotes,
        media: resolutionFiles.length > 0 ? resolutionFiles : [
          {
            id: 'res-default',
            name: 'completion_proof_site.jpg',
            type: 'image',
            size: '1.8 MB',
            url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=600&q=80',
            uploadedAt: new Date().toISOString(),
          },
        ],
        submittedBy: user?.name || 'Er. Salvi',
        officerDesignation: user?.designation || 'Executive Engineer',
        completionDate: new Date().toISOString().slice(0, 10),
      };

      const updated = await complaintService.submitResolution(problem.id, resolutionData);
      setProblem(updated);
      setNewStatus(updated.status);
      showToast(
        'success',
        'Resolution Submitted',
        'Case transitioned to Citizen Verification. Citizen has been notified.'
      );
    } catch (err: any) {
      showToast('error', 'Failed to submit resolution', err.message);
    } finally {
      setIsSubmittingResolution(false);
    }
  };

  const handleDeleteDocket = async () => {
    if (!problem) return;
    if (!window.confirm(`Permanently delete administrative docket ${problem.id}?`)) return;

    try {
      setIsDeleting(true);
      await complaintService.deleteComplaint(problem.id);
      showToast('success', 'Docket Deleted', `Docket ${problem.id} has been permanently deleted.`);
      navigate('/admin/problems');
    } catch (err: any) {
      showToast('error', 'Delete Failed', err?.message || 'Failed to delete docket.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button and Docket Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Link
            to="/admin/problems"
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
            title="Return to list"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {problem.id}
              </span>
              <PriorityBadge priority={problem.priority} size="sm" />
              <StatusBadge status={problem.status} size="sm" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              {problem.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 text-right">
          <div>
            <span>Target SLA Deadline: <strong>{new Date(problem.deadline).toLocaleDateString()}</strong></span>
          </div>
          <button
            type="button"
            onClick={handleDeleteDocket}
            disabled={isDeleting}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold border border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
            title="Delete this complaint"
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            <span>Delete Docket</span>
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Case Details, Citizen Evidence, Map, AI Triage (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Citizen Details Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Citizen Grievance Submission
            </h2>

            <div className="space-y-2 text-xs text-slate-700">
              <p className="leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
                {problem.description}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-500">
                <div>
                  <span>Reported By:</span>{' '}
                  <strong className="text-slate-800">{problem.citizenName}</strong>
                </div>
                <div>
                  <span>Verified Contact:</span>{' '}
                  <span className="font-mono text-slate-700">{problem.citizenPhoneMasked}</span>
                </div>
                <div>
                  <span>Impact Scope:</span>{' '}
                  <strong className="text-slate-800">{problem.impactScope}</strong>
                </div>
                <div>
                  <span>Date Logged:</span>{' '}
                  <span>{new Date(problem.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Citizen Evidence Attachments */}
            {(problem.evidence?.length ?? 0) > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-800 block mb-2">
                  Citizen Uploaded Photographic Evidence ({problem.evidence?.length ?? 0}):
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {(problem.evidence || []).map((item) => (
                    <div key={item.id} className="rounded border border-slate-200 overflow-hidden bg-slate-100">
                      {item.type === 'image' && (
                        <img
                          src={item.url}
                          alt="Citizen evidence"
                          className="w-full h-36 object-cover"
                        />
                      )}
                      <div className="p-1.5 text-[11px] text-slate-600 bg-white truncate">
                        {item.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Location Map Pin */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Geo-Location Verification
            </h3>
            <p className="text-xs text-slate-700">
              <strong>Address:</strong> {problem.location.address}, {problem.location.ward}, {problem.location.city} - {problem.location.pincode}
            </p>
            <MapPlaceholder
              coordinates={problem.location.coordinates}
              addressLabel={problem.location.address}
              wardName={problem.location.ward}
            />
          </div>

          {/* AI Assessment Card */}
          <AiAssessmentCard assessment={problem.aiAssessment} />

          {/* Citizen Verification State Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Citizen Verification Status
            </h3>
            {problem.citizenVerification?.status === 'verified' ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-950 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified by citizen on site. Case closed.</span>
              </div>
            ) : problem.citizenVerification?.status === 'disputed' ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Citizen Disputed Resolution:</span>
                </div>
                <p className="text-slate-700 bg-white p-2 rounded border border-rose-200">
                  "{problem.citizenVerification.disputeReason}"
                </p>
              </div>
            ) : problem.status === 'Resolution Submitted' || problem.status === 'Citizen Verification' ? (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded text-xs text-purple-950 flex items-center gap-2 font-medium">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>Completion proof uploaded. Awaiting citizen confirmation.</span>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">
                Citizen verification lock will activate once completion evidence is uploaded below.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Admin Controls, Status Change, Internal Notes, Resolution Upload (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Field Officer Assignment & SLA Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <HardHat className="w-3.5 h-3.5 text-amber-600" />
                <span>Field Engineer Assignment</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-2xs cursor-pointer transition-colors"
              >
                {problem.assignedOfficer ? 'Reassign Officer' : 'Dispatch Officer Now'}
              </button>
            </div>

            {problem.assignedOfficer ? (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {problem.assignedOfficer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">
                        {problem.assignedOfficer.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {problem.assignedOfficer.designation}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                    Active Assignee
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Division:</span>
                    <span className="font-medium text-slate-800 truncate block">
                      {problem.assignedOfficer.department.split('&')[0]}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Target Completion:</span>
                    <span className="font-bold text-amber-800 block">
                      {new Date(problem.deadline).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-300/80 space-y-2 text-amber-950">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>No Field Engineer Currently Dispatched</span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  This docket is in triage intake. Assign a municipal engineer to establish statutory SLA commitment and dispatch a field crew.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(true)}
                  className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Choose Officer & Set SLA Deadline</span>
                </button>
              </div>
            )}
          </div>

          {/* Status Change Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Administrative Status Action</span>
            </h3>

            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transition Status To:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ProblemStatus)}
                  className="w-full text-xs p-2 rounded border border-slate-300 font-semibold bg-white"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolution Submitted">Resolution Submitted</option>
                  <option value="Citizen Verification">Citizen Verification</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Reopened">Reopened</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason / Administrative Log Note:
                </label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Record justification for status transition..."
                  className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingStatus}
                className="w-full py-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isUpdatingStatus ? 'Updating Audit Log...' : 'Commit Status Change'}
              </button>
            </form>
          </div>

          {/* Upload Resolution Evidence Form (Crucial for Section 21) */}
          <div className="bg-teal-50/40 rounded-xl border-2 border-teal-300 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-teal-950 font-bold text-xs uppercase tracking-wider">
              <FileCheck2 className="w-4 h-4 text-teal-700" />
              <span>Upload Remediation & Resolution Proof</span>
            </div>
            <p className="text-[11px] text-teal-900 leading-snug">
              Uploading resolution proof transitions the case to Citizen Verification. The citizen will be notified to inspect the work.
            </p>

            <form onSubmit={handleSubmitResolution} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Work Order / Contractor Ref:
                </label>
                <input
                  type="text"
                  value={workOrderRef}
                  onChange={(e) => setWorkOrderRef(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-teal-300 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Remediation Summary & Materials Used:
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe repair method (e.g. cold-mix asphalt compacted, new 200mm PVC joint installed)..."
                  className="w-full text-xs p-2 rounded border border-teal-300 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Attach Completion Photographs:
                </label>
                <FileUploader
                  files={resolutionFiles}
                  onChange={setResolutionFiles}
                  maxFiles={3}
                  helperText="Attach photograph showing completed repair on site."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingResolution}
                className="w-full py-2.5 rounded bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmittingResolution ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting Proof...</span>
                  </span>
                ) : (
                  <span>Submit Completion Proof & Notify Citizen</span>
                )}
              </button>
            </form>
          </div>

          {/* Internal Notes Thread */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Internal Supervisory Notes ({problem.internalNotes?.length ?? 0})</span>
            </h3>

            <form onSubmit={handleAddInternalNote} className="space-y-2">
              <textarea
                rows={2}
                value={internalNoteText}
                onChange={(e) => setInternalNoteText(e.target.value)}
                placeholder="Log internal note for field teams (not visible to public)..."
                className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isAddingNote || !internalNoteText.trim()}
                  className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer disabled:opacity-40"
                >
                  Append Note
                </button>
              </div>
            </form>

            <div className="space-y-2.5 pt-2 border-t border-slate-100 max-h-60 overflow-y-auto">
              {(problem.internalNotes || []).map((note) => (
                <div key={note.id} className="p-2.5 rounded bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <strong className="text-slate-800">{note.authorName} ({note.authorRole})</strong>
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-700">{note.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Audit History */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Audit Milestone History
            </h3>
            <TimelineView events={problem.timeline} currentStatus={problem.status} />
          </div>
        </div>
      </div>

      {/* Assign Officer Modal */}
      <AssignOfficerModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        problem={problem}
        onAssigned={handleModalAssigned}
      />
    </div>
  );
};
