import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { Problem } from '../../types';
import { MUNICIPAL_OFFICERS, MunicipalOfficer } from '../../data/officers';
import { PriorityBadge, StatusBadge } from '../../components/common/StatusBadge';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { AssignOfficerModal } from '../../components/admin/AssignOfficerModal';
import {
  UserCheck,
  Building2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  ChevronRight,
  HardHat,
  ShieldAlert,
  ArrowRight,
  Phone,
  Mail,
  RefreshCw,
  Camera,
  PlayCircle,
  Briefcase,
  MapPin,
} from 'lucide-react';

export const AdminAssignmentsPage: React.FC = () => {
  const { user, role } = useAuth();
  const isWorker = role === 'officer';

  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedTab, setSelectedTab] = useState<'my-tasks' | 'unassigned' | 'assigned'>(
    isWorker ? 'my-tasks' : 'unassigned'
  );
  const [selectedOfficerFilter, setSelectedOfficerFilter] = useState<string>('All');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalProblem, setModalProblem] = useState<Problem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { showToast } = useNotifications();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await complaintService.getComplaints();
      setProblems(data);
    } catch (e) {
      console.error('Failed to load complaints:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const unassignedProblems = problems.filter((p) => !p.assignedOfficer && p.status !== 'Resolved');
  const assignedProblems = problems.filter((p) => Boolean(p.assignedOfficer) && p.status !== 'Resolved');

  // Compute live active caseload per officer
  const officersWithLoad = MUNICIPAL_OFFICERS.map((officer) => {
    const activeCount = problems.filter(
      (p) => p.assignedOfficer?.name === officer.name && p.status !== 'Resolved'
    ).length;
    return {
      ...officer,
      activeCasesCount: activeCount,
    };
  });

  const handleOpenAssignModal = (problem: Problem) => {
    setModalProblem(problem);
    setIsModalOpen(true);
  };

  const handleModalAssigned = async (
    problemId: string,
    officer: MunicipalOfficer,
    deadline: string
  ) => {
    try {
      await complaintService.assignOfficer(
        problemId,
        {
          id: officer.id,
          name: officer.name,
          designation: officer.designation,
          department: officer.department,
        },
        deadline
      );
      showToast(
        'success',
        'Field Officer Dispatched',
        `Docket ${problemId} assigned to ${officer.name}. SLA countdown started.`
      );
      loadData();
    } catch (err: any) {
      showToast('error', 'Assignment Failed', err.message || 'Could not assign officer');
    }
  };

  const handleQuickInlineAssign = async (problemId: string, officerName: string) => {
    const officer = MUNICIPAL_OFFICERS.find((o) => o.name === officerName);
    if (!officer) return;

    // Default SLA: 48 hours
    const deadline = new Date(Date.now() + 48 * 3600000).toISOString();
    try {
      await complaintService.assignOfficer(
        problemId,
        {
          id: officer.id,
          name: officer.name,
          designation: officer.designation,
          department: officer.department,
        },
        deadline
      );
      showToast(
        'success',
        'Quick Dispatch Confirmed',
        `Case ${problemId} dispatched to ${officer.name}.`
      );
      loadData();
    } catch (err: any) {
      showToast('error', 'Assignment Failed', err.message);
    }
  };

  // Worker specific task lists
  const myTasks = problems.filter(
    (p) =>
      (p.assignedOfficer?.name === user?.name ||
        p.assignedOfficer?.name?.includes('Milind') ||
        p.assignedOfficer?.id === user?.id) &&
      p.status !== 'Resolved'
  );
  const workerTasks = myTasks.length > 0 ? myTasks : assignedProblems.slice(0, 3);

  const handleWorkerStartWork = async (problemId: string) => {
    try {
      await complaintService.updateStatus(problemId, 'In Progress', 'Field engineer has arrived on site and commenced repairs.');
      showToast('success', 'On-Site Work Started', `Case ${problemId} marked In Progress.`);
      loadData();
    } catch (e: any) {
      showToast('error', 'Update Failed', e.message);
    }
  };

  const handleWorkerSubmitProof = async (problemId: string) => {
    try {
      await complaintService.updateStatus(
        problemId,
        'Citizen Verification',
        'Field engineer has completed on-site repair. Photographic proof submitted for citizen and supervisor audit.'
      );
      showToast('success', 'Completion Proof Submitted', `Case ${problemId} marked for Citizen & Supervisor Verification.`);
      loadData();
    } catch (e: any) {
      showToast('error', 'Update Failed', e.message);
    }
  };

  // Filter problems for display
  const currentList =
    selectedTab === 'my-tasks'
      ? workerTasks
      : selectedTab === 'unassigned'
      ? unassignedProblems
      : assignedProblems;

  const filteredProblems = currentList.filter((p) => {
    if (selectedDeptFilter !== 'All' && p.department !== selectedDeptFilter) return false;
    if (
      selectedOfficerFilter !== 'All' &&
      selectedTab === 'assigned' &&
      p.assignedOfficer?.name !== selectedOfficerFilter
    ) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.id.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.location.ward.toLowerCase().includes(q) ||
        (p.assignedOfficer?.name || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner with Civic Accent */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide ${
                isWorker
                  ? 'bg-sky-100 text-sky-900 border-sky-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}
            >
              {isWorker ? 'On-Site Field Operations' : 'Command & Triage'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {isWorker ? 'Field Crew Console' : 'Supervisor Dispatch Deck'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            {isWorker ? (
              <>
                <HardHat className="w-6 h-6 text-sky-600" />
                <span>My Field Work Orders & Site Tasks</span>
              </>
            ) : (
              <>
                <Briefcase className="w-6 h-6 text-amber-600" />
                <span>Municipal Supervisor Task Dispatch & Tracking</span>
              </>
            )}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
            {isWorker
              ? `Logged in as ${user?.name || 'Milind Salvi'} (On-Site Worker). View assigned problems, navigate to locations, update progress, and submit photo completion proofs.`
              : 'As Municipal Supervisor (The Boss), assign field dockets to on-site workers, track work progress, and ensure SLA deadlines are met.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Sync Live Roster</span>
          </button>
        </div>
      </div>

      {/* Top Professional KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-amber-50/70 rounded-xl border border-amber-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-amber-900 font-semibold">
            <span>Pending Dispatch</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-950 mt-2">
            {unassignedProblems.length}
          </p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-amber-800 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Requires engineer dispatch</span>
          </div>
        </div>

        <div className="bg-sky-50/70 rounded-xl border border-sky-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-sky-900 font-semibold">
            <span>Active Field Dockets</span>
            <HardHat className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-sky-950 mt-2">
            {assignedProblems.length}
          </p>
          <span className="text-[11px] text-sky-700 mt-1 block">
            Under active field remediation
          </span>
        </div>

        <div className="bg-indigo-50/70 rounded-xl border border-indigo-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-indigo-900 font-semibold">
            <span>Active Personnel</span>
            <UserCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-indigo-950 mt-2">
            {officersWithLoad.length}
          </p>
          <span className="text-[11px] text-indigo-700 mt-1 block">
            Available across 6 divisions
          </span>
        </div>

        <div className="bg-emerald-50/70 rounded-xl border border-emerald-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-emerald-900 font-semibold">
            <span>Resolved This Week</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-950 mt-2">
            {problems.filter((p) => p.status === 'Resolved').length}
          </p>
          <span className="text-[11px] text-emerald-700 mt-1 block">
            Citizen verified & closed
          </span>
        </div>
      </div>

      {/* Field Personnel Live Roster & Capacity Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Municipal Field Engineer Roster & Caseload Balance</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Click any engineer to filter their assigned dockets. Monitor workload saturation to avoid SLA bottlenecks.
            </p>
          </div>

          {selectedOfficerFilter !== 'All' && (
            <button
              type="button"
              onClick={() => setSelectedOfficerFilter('All')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              Clear Filter ({selectedOfficerFilter})
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {officersWithLoad.map((officer) => {
            const isSelected = selectedOfficerFilter === officer.name;
            const loadPercent = Math.round((officer.activeCasesCount / officer.maxCapacity) * 100);
            const loadBadge =
              officer.activeCasesCount <= 1
                ? { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'Optimal Load' }
                : officer.activeCasesCount <= 3
                ? { bg: 'bg-amber-100 text-amber-800 border-amber-300', label: 'Moderate Load' }
                : { bg: 'bg-rose-100 text-rose-800 border-rose-300', label: 'High Saturation' };

            return (
              <div
                key={officer.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedOfficerFilter('All');
                  } else {
                    setSelectedOfficerFilter(officer.name);
                    setSelectedTab('assigned');
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-slate-50/70 hover:bg-white hover:border-slate-300 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {officer.avatar}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-xs truncate">
                        {officer.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 truncate">
                        {officer.designation}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${loadBadge.bg}`}>
                    {officer.activeCasesCount} / {officer.maxCapacity} Active
                  </span>
                </div>

                {/* Progress load meter */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 font-medium">
                    <span className="truncate max-w-[150px]">{officer.department.split('&')[0]}</span>
                    <span>{loadPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        loadPercent < 40 ? 'bg-emerald-500' : loadPercent < 70 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(loadPercent, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{officer.phone}</span>
                  </span>
                  <span className="text-blue-600 font-semibold hover:underline">
                    {isSelected ? 'Showing Cases' : 'View Cases'} &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Dispatch Queue & Assignment Deck */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 bg-slate-50/80 px-4 sm:px-6 pt-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            {/* Tab 1: Worker's Tasks */}
            <button
              type="button"
              onClick={() => {
                setSelectedTab('my-tasks');
                setSelectedOfficerFilter('All');
              }}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                selectedTab === 'my-tasks'
                  ? 'border-sky-600 text-sky-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>👷 My On-Site Tasks</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedTab === 'my-tasks'
                    ? 'bg-sky-200 text-sky-950'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {workerTasks.length}
              </span>
            </button>

            {/* Tab 2: Needs Immediate Dispatch (for Supervisor) */}
            <button
              type="button"
              onClick={() => {
                setSelectedTab('unassigned');
                setSelectedOfficerFilter('All');
              }}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                selectedTab === 'unassigned'
                  ? 'border-amber-600 text-amber-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>🚨 Unassigned Complaints</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                selectedTab === 'unassigned' ? 'bg-amber-200 text-amber-950' : 'bg-slate-200 text-slate-700'
              }`}>
                {unassignedProblems.length}
              </span>
            </button>

            {/* Tab 3: All Active Dockets */}
            <button
              type="button"
              onClick={() => setSelectedTab('assigned')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                selectedTab === 'assigned'
                  ? 'border-blue-600 text-blue-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>📋 All Assigned Dockets</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                selectedTab === 'assigned' ? 'bg-blue-100 text-blue-900' : 'bg-slate-200 text-slate-700'
              }`}>
                {assignedProblems.length}
              </span>
            </button>
          </div>

          <div className="pb-3 text-xs text-slate-500">
            {selectedTab === 'my-tasks'
              ? 'Showing tasks assigned to your on-site crew'
              : selectedTab === 'unassigned'
              ? 'Showing complaints waiting for supervisor dispatch'
              : 'Showing all active field dockets with SLA commitments'}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-3.5 sm:p-4 bg-slate-50/40 border-b border-slate-200 flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search docket, title, ward, officer..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="text-xs p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium cursor-pointer"
            >
              <option value="All">All Municipal Departments</option>
              <option value="Municipal Road Maintenance & Civil Infrastructure">Roads & Infrastructure</option>
              <option value="Water Supply, Reservoirs & Drainage Networks">Water & Drainage</option>
              <option value="Solid Waste Management & Public Sanitation">Sanitation & Solid Waste</option>
              <option value="Public Safety, Streetlighting & Power Grid">Streetlighting & Power</option>
            </select>
          </div>
        </div>

        {/* Content List */}
        {filteredProblems.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="font-bold text-sm text-slate-800">
              {selectedTab === 'unassigned'
                ? 'All Caught Up! No Unassigned Grievances'
                : 'No active dockets found matching the filter'}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {selectedTab === 'unassigned'
                ? 'All reported grievances have been successfully dispatched to field engineers with active SLA timers.'
                : 'Try adjusting your search terms or department filters.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredProblems.map((prob) => {
              const matchingOfficer =
                MUNICIPAL_OFFICERS.find((o) => o.department === prob.department) || MUNICIPAL_OFFICERS[0];

              const deadlineDate = new Date(prob.deadline);
              const isOverdue = deadlineDate.getTime() < Date.now();
              const hoursLeft = Math.round((deadlineDate.getTime() - Date.now()) / 3600000);

              return (
                <div
                  key={prob.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left Column: Docket summary */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/admin/problems/${prob.id}`}
                        className="font-mono font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 text-xs inline-flex items-center gap-1"
                      >
                        <span>{prob.id}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      <PriorityBadge priority={prob.priority} size="sm" />
                      <StatusBadge status={prob.status} size="sm" />

                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {prob.location.ward}
                      </span>
                    </div>

                    <Link
                      to={`/admin/problems/${prob.id}`}
                      className="font-bold text-slate-900 hover:text-blue-600 text-xs sm:text-sm block line-clamp-1"
                    >
                      {prob.title}
                    </Link>

                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {prob.location.address} {prob.location.landmark ? `• ${prob.location.landmark}` : ''}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-0.5">
                      <span>Reported: {new Date(prob.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span className="font-medium text-slate-700">{prob.department}</span>
                    </div>
                  </div>

                  {/* Right Column: Dispatch Action Area */}
                  <div className="shrink-0 flex flex-col sm:flex-row sm:items-center gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    {/* If unassigned, show smart recommendation and 1-click dispatch */}
                    {!prob.assignedOfficer ? (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        {/* Smart Match Pill */}
                        <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                          <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="truncate max-w-[170px]">
                            Match: <strong>{matchingOfficer.name.split(' ')[1] || matchingOfficer.name}</strong>
                          </span>
                        </div>

                        {/* Quick inline select dropdown */}
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleQuickInlineAssign(prob.id, e.target.value);
                            }
                          }}
                          defaultValue=""
                          className="text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 cursor-pointer shadow-2xs"
                        >
                          <option value="" disabled>
                            Quick Assign Officer...
                          </option>
                          {MUNICIPAL_OFFICERS.map((o) => (
                            <option key={o.id} value={o.name}>
                              {o.name} ({o.designation})
                            </option>
                          ))}
                        </select>

                        {/* Dedicated Dispatch Modal Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenAssignModal(prob)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-xs cursor-pointer transition-colors shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Dispatch Officer</span>
                        </button>
                      </div>
                    ) : (
                      /* If already assigned, show current officer & SLA status */
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2.5">
                        <div className="text-right">
                          <p className="font-bold text-xs text-slate-900 flex items-center gap-1 justify-end">
                            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span>{prob.assignedOfficer.name}</span>
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {prob.assignedOfficer.designation}
                          </p>

                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span
                              className={`text-[10px] font-bold ${
                                isOverdue
                                  ? 'text-rose-600'
                                  : hoursLeft <= 24
                                  ? 'text-amber-600'
                                  : 'text-emerald-700'
                              }`}
                            >
                              {isOverdue ? 'SLA Breached' : `${hoursLeft}h remaining`}
                            </span>
                          </div>
                        </div>

                        {/* Worker Action Buttons */}
                        {isWorker || selectedTab === 'my-tasks' ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {prob.status !== 'In Progress' && prob.status !== 'Citizen Verification' && (
                              <button
                                type="button"
                                onClick={() => handleWorkerStartWork(prob.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                              >
                                <PlayCircle className="w-3.5 h-3.5" />
                                <span>Start Work</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleWorkerSubmitProof(prob.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>Submit Photo Proof</span>
                            </button>
                          </div>
                        ) : (
                          /* Boss / Supervisor Reassign Button */
                          <button
                            type="button"
                            onClick={() => handleOpenAssignModal(prob)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                          >
                            Reassign
                          </button>
                        )}

                        <Link
                          to={`/admin/problems/${prob.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title="View Case Docket"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assign Officer Modal */}
      <AssignOfficerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        problem={modalProblem}
        onAssigned={handleModalAssigned}
      />
    </div>
  );
};

export default AdminAssignmentsPage;
