import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { complaintService } from '../services/complaintService';
import { innovationService } from '../services/innovationService';
import { Problem, Innovation } from '../types';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import {
  getLocalizedProblem,
  getLocalizedInnovation,
  getLocalizedWard,
} from '../utils/localizedData';
import {
  PlusCircle,
  ShieldCheck,
  MapPin,
  ChevronRight,
  Trash2,
  Edit3,
  Lightbulb,
} from 'lucide-react';

export const CitizenDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { showToast } = useNotifications();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [innovations, setInnovations] = useState<Innovation[]>([]);
  const [activeTab, setActiveTab] = useState<'problems' | 'innovations'>('problems');

  const loadData = () => {
    complaintService.getComplaints().then((all) => {
      const problemList = Array.isArray(all) ? all : [];
      if (user?.id) {
        const userProblems = problemList.filter(
          (p) => p.reporterUid === user.id || p.citizenName === user.name
        );
        setProblems(userProblems.length > 0 ? userProblems : problemList);
      } else {
        setProblems(problemList);
      }
    });

    innovationService.getInnovations().then((all) => {
      const innovationList = Array.isArray(all) ? all : [];
      if (user?.id) {
        const userInnovations = innovationList.filter(
          (inv) => inv.submitterUid === user.id || inv.submitterName === user.name
        );
        setInnovations(userInnovations.length > 0 ? userInnovations : innovationList);
      } else {
        setInnovations(innovationList);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleDeleteProblem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete problem docket ${id}?`)) return;
    try {
      await complaintService.deleteComplaint(id);
      showToast('success', 'Complaint Deleted', `Case ${id} removed.`);
      loadData();
    } catch (err: any) {
      showToast('error', 'Error', err?.message || 'Failed to delete complaint.');
    }
  };

  const handleDeleteInnovation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete innovation submission ${id}?`)) return;
    try {
      await innovationService.deleteInnovation(id);
      showToast('success', 'Innovation Deleted', `Proposal ${id} removed.`);
      loadData();
    } catch (err: any) {
      showToast('error', 'Error', err?.message || 'Failed to delete innovation.');
    }
  };

  const localizedProblems = useMemo(() => {
    return problems.map((p) => getLocalizedProblem(p, language));
  }, [problems, language]);

  const localizedInnovations = useMemo(() => {
    return innovations.map((inv) => getLocalizedInnovation(inv, language));
  }, [innovations, language]);

  const pendingVerificationProblem = problems.find(
    (p) => p.status === 'Resolution Submitted' || p.status === 'Citizen Verification'
  );

  const pendingVerificationCount = problems.filter(
    (p) => p.status === 'Resolution Submitted' || p.status === 'Citizen Verification'
  ).length;

  const residentWard = getLocalizedWard(user?.wardOrDistrict || 'Ward 14 (Shivajinagar)', language);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Citizen Welcome Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base shrink-0">
            {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'CU'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {t.citizenDashboard.welcome}, {user?.name || t.citizenDashboard.citizenRole}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.citizenDashboard.residentOf} {residentWard}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/report"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.citizenDashboard.reportNewProblem}</span>
          </Link>
          <Link
            to="/submit-innovation"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            <span>Submit Innovation</span>
          </Link>
        </div>
      </div>

      {/* Verification Attention Banner (if any) */}
      {pendingVerificationCount > 0 && (
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                {t.citizenDashboard.actionRequired}: {pendingVerificationCount} {t.citizenDashboard.resolutionsAwaiting}
              </h4>
              <p className="text-xs text-purple-800 mt-0.5">
                {t.citizenDashboard.verificationNotice}
              </p>
            </div>
          </div>

          <Link
            to={`/track?id=${pendingVerificationProblem?.id || ''}`}
            className="px-3.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs shrink-0 self-start sm:self-auto transition-colors"
          >
            {t.citizenDashboard.inspectVerify}
          </Link>
        </div>
      )}

      {/* KPI stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500">{t.citizenDashboard.reportedByYou}</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{problems.length}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500">{t.citizenDashboard.awaitingVerification}</span>
          <p className="text-2xl font-bold text-purple-600 mt-1">{pendingVerificationCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500">{t.citizenDashboard.verifiedClosed}</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {problems.filter((p) => p.status === 'Resolved').length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500">Proposals / Innovations</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{innovations.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('problems')}
            className={`text-xs font-bold pb-1 cursor-pointer transition-colors ${
              activeTab === 'problems'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.citizenDashboard.yourReportedProblems} ({problems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('innovations')}
            className={`text-xs font-bold pb-1 cursor-pointer transition-colors ${
              activeTab === 'innovations'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.citizenDashboard.yourInnovationSubmissions} ({innovations.length})
          </button>
        </div>

        {/* Tab 1: Problems */}
        {activeTab === 'problems' && (
          <div className="space-y-3">
            {localizedProblems.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs space-y-3">
                <p>{t.citizenDashboard.emptyProblems || 'No civic grievances recorded yet.'}</p>
                <Link
                  to="/report"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Report Your First Problem</span>
                </Link>
              </div>
            ) : (
              localizedProblems.map((prob) => (
                <div
                  key={prob.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {prob.id}
                      </span>
                      <PriorityBadge priority={prob.priority} size="sm" />
                      <StatusBadge status={prob.status} size="sm" />
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{prob.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{prob.description}</p>

                    <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {prob.location.ward}
                      </span>
                      <span>•</span>
                      <span>{prob.department}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/track?id=${prob.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                    >
                      <span>{t.citizenDashboard.trackAudit}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteProblem(prob.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Problem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Innovations */}
        {activeTab === 'innovations' && (
          <div className="space-y-3">
            {localizedInnovations.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs space-y-3">
                <p>{t.citizenDashboard.emptyInnovations || 'No citizen innovation submissions found.'}</p>
                <Link
                  to="/submit-innovation"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Submit an Innovation Proposal</span>
                </Link>
              </div>
            ) : (
              localizedInnovations.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                        {item.stage}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-600 font-medium">
                      {item.votes} {t.citizenDashboard.votes}
                    </span>
                    <Link
                      to={`/innovations/${item.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors"
                    >
                      <span>{t.citizenDashboard.viewDossier}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteInnovation(item.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Innovation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
