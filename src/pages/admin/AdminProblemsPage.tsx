import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { Problem, ProblemStatus, PriorityLevel, ProblemCategory } from '../../types';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { AssignOfficerModal } from '../../components/admin/AssignOfficerModal';
import { MunicipalOfficer } from '../../data/officers';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Trash2,
  UserCheck,
  LayoutGrid,
  List,
  Sparkles,
  Send,
  ExternalLink,
  MapPin,
  RefreshCw,
  Eye,
} from 'lucide-react';

export const AdminProblemsPage: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useNotifications();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedWard, setSelectedWard] = useState<string>('All');
  const [activeQuickFilter, setActiveQuickFilter] = useState<'all' | 'unassigned' | 'critical' | 'sla_risk' | 'verify' | 'resolved'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'priority' | 'sla'>('date_desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Assign Officer Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [modalProblem, setModalProblem] = useState<Problem | null>(null);

  const loadData = async () => {
    try {
      const list = await complaintService.getComplaints();
      setProblems(list);
    } catch (e) {
      console.error('Error loading complaints:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAssignModal = (prob: Problem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setModalProblem(prob);
    setIsAssignModalOpen(true);
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
        'Officer Dispatched',
        `Case ${problemId} assigned to ${officer.name}. SLA active.`
      );
      loadData();
    } catch (err: any) {
      showToast('error', 'Assignment Failed', err.message);
    }
  };

  const handleBulkStatusChange = async (status: ProblemStatus) => {
    if (selectedIds.size === 0) return;
    try {
      await Promise.all(
        Array.from(selectedIds).map((id: string) =>
          complaintService.updateComplaint(id, { status })
        )
      );
      showToast('info', 'Bulk Action Applied', `Updated ${selectedIds.size} cases to "${status}".`);
      setSelectedIds(new Set());
      loadData();
    } catch (err: any) {
      showToast('error', 'Update Failed', err?.message || 'Failed to update cases.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Permanently delete ${selectedIds.size} selected case dockets?`)) return;
    try {
      await Promise.all(
        Array.from(selectedIds).map((id: string) => complaintService.deleteComplaint(id))
      );
      showToast('success', 'Bulk Delete Completed', `Deleted ${selectedIds.size} cases.`);
      setSelectedIds(new Set());
      loadData();
    } catch (err: any) {
      showToast('error', 'Delete Failed', err?.message || 'Failed to delete selected cases.');
    }
  };

  const handleDeleteOne = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Permanently delete case docket ${id}?`)) return;
    try {
      await complaintService.deleteComplaint(id);
      showToast('success', 'Case Deleted', `Docket ${id} removed.`);
      loadData();
    } catch (err: any) {
      showToast('error', 'Delete Failed', err?.message || 'Failed to delete case.');
    }
  };

  const handleExportCSV = () => {
    if (problems.length === 0) return;
    const headers = ['Docket ID', 'Title', 'Department', 'Ward', 'Priority', 'Status', 'Assigned Officer', 'SLA Deadline', 'Reported Date'];
    const rows = sortedProblems.map((p) => [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.department}"`,
      `"${p.location.ward}"`,
      p.priority,
      p.status,
      `"${p.assignedOfficer?.name || 'Unassigned'}"`,
      p.deadline,
      p.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `municipal_grievances_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'CSV Exported', `Generated export of ${sortedProblems.length} records.`);
  };

  // Quick filter counts
  const countUnassigned = problems.filter((p) => !p.assignedOfficer && p.status !== 'Resolved').length;
  const countCritical = problems.filter((p) => p.priority === 'Critical').length;
  const countSlaRisk = problems.filter((p) => {
    if (p.status === 'Resolved') return false;
    const diff = (new Date(p.deadline).getTime() - Date.now()) / 3600000;
    return diff <= 24;
  }).length;
  const countVerify = problems.filter((p) => p.status === 'Citizen Verification' || p.status === 'Resolution Submitted').length;
  const countResolved = problems.filter((p) => p.status === 'Resolved').length;

  const filteredProblems = problems.filter((p) => {
    // Quick filter check
    if (activeQuickFilter === 'unassigned' && (p.assignedOfficer || p.status === 'Resolved')) return false;
    if (activeQuickFilter === 'critical' && p.priority !== 'Critical') return false;
    if (activeQuickFilter === 'sla_risk') {
      if (p.status === 'Resolved') return false;
      const diff = (new Date(p.deadline).getTime() - Date.now()) / 3600000;
      if (diff > 24) return false;
    }
    if (activeQuickFilter === 'verify' && p.status !== 'Citizen Verification' && p.status !== 'Resolution Submitted') return false;
    if (activeQuickFilter === 'resolved' && p.status !== 'Resolved') return false;

    // Dropdown filters
    if (selectedDept !== 'All' && p.department !== selectedDept) return false;
    if (selectedStatus !== 'All' && p.status !== selectedStatus) return false;
    if (selectedPriority !== 'All' && p.priority !== selectedPriority) return false;
    if (selectedWard !== 'All' && !p.location.ward.includes(selectedWard)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = p.id.toLowerCase().includes(q);
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchCitizen = p.citizenName.toLowerCase().includes(q);
      const matchOfficer = (p.assignedOfficer?.name || '').toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchCitizen && !matchOfficer && !matchDesc) return false;
    }

    return true;
  });

  // Sort logic
  const sortedProblems = [...filteredProblems].sort((a, b) => {
    if (sortBy === 'priority') {
      const pWeights = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return pWeights[b.priority] - pWeights[a.priority];
    }
    if (sortBy === 'sla') {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    // Default date_desc
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalPages = Math.ceil(sortedProblems.length / itemsPerPage) || 1;
  const paginatedProblems = sortedProblems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedProblems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedProblems.map((p) => p.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const getSlaBadge = (deadlineStr: string, status: ProblemStatus) => {
    if (status === 'Resolved') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
          <span>Met SLA</span>
        </span>
      );
    }
    const diffHours = (new Date(deadlineStr).getTime() - Date.now()) / (1000 * 3600);
    if (diffHours < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-full">
          <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
          <span>Overdue</span>
        </span>
      );
    }
    if (diffHours <= 24) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
          <Clock className="w-2.5 h-2.5 text-amber-600" />
          <span>{Math.round(diffHours)}h left</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
        <Clock className="w-2.5 h-2.5 text-slate-400" />
        <span>{Math.round(diffHours / 24)}d left</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300 uppercase tracking-wide">
              Case Registry
            </span>
            <span className="text-xs text-slate-500 font-mono">Central Grievance Audit</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Municipal Grievance Tracking & Audit Registry
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Audit, assign, dispatch field engineers, and verify photographic resolution proof for all public dockets.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <Link
            to="/admin/assignments"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-xs transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Dispatch Deck ({countUnassigned})</span>
          </Link>
        </div>
      </div>

      {/* Bulk Action Strip if items are selected */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-50/90 border border-blue-200/80 px-4 py-2.5 rounded-xl text-xs text-blue-950 font-medium shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>
              <strong>{selectedIds.size}</strong> dockets selected for batch processing
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkStatusChange('In Progress')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              Mark In Progress
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatusChange('Resolved')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              Mark Resolved
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Stage Filter Pills with Subtle Civic Colors */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveQuickFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeQuickFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <span>All Grievances</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeQuickFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {problems.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveQuickFilter('unassigned')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeQuickFilter === 'unassigned'
              ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
              : 'bg-amber-50/70 hover:bg-amber-100/70 border-amber-200 text-amber-900'
          }`}
        >
          <span>⚠️ Needs Officer</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-950 font-black">
            {countUnassigned}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveQuickFilter('critical')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeQuickFilter === 'critical'
              ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
              : 'bg-rose-50/70 hover:bg-rose-100/70 border-rose-200 text-rose-900'
          }`}
        >
          <span>🚨 Critical Priority</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-200 text-rose-950 font-black">
            {countCritical}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveQuickFilter('sla_risk')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeQuickFilter === 'sla_risk'
              ? 'bg-orange-600 text-white border-orange-700 shadow-xs'
              : 'bg-orange-50/70 hover:bg-orange-100/70 border-orange-200 text-orange-900'
          }`}
        >
          <span>⏱️ SLA Risk (&lt;24h)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-orange-200 text-orange-950 font-black">
            {countSlaRisk}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveQuickFilter('verify')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeQuickFilter === 'verify'
              ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
              : 'bg-purple-50/70 hover:bg-purple-100/70 border-purple-200 text-purple-900'
          }`}
        >
          <span>🔍 Citizen Verification</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-200 text-purple-950 font-black">
            {countVerify}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveQuickFilter('resolved')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeQuickFilter === 'resolved'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
              : 'bg-emerald-50/70 hover:bg-emerald-100/70 border-emerald-200 text-emerald-900'
          }`}
        >
          <span>✅ Closed & Resolved</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-200 text-emerald-950 font-black">
            {countResolved}
          </span>
        </button>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search docket ID, title, officer, ward..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-blue-600 bg-white"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white text-slate-700 cursor-pointer"
            >
              <option value="All">All Departments</option>
              <option value="Municipal Road Maintenance & Civil Infrastructure">Road Maintenance</option>
              <option value="Water Supply, Reservoirs & Drainage Networks">Water Supply & Drainage</option>
              <option value="Solid Waste Management & Public Sanitation">Solid Waste Management</option>
              <option value="Public Safety, Streetlighting & Power Grid">Streetlighting & Power</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white text-slate-700 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted (Intake)</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress (Field Work)</option>
              <option value="Resolution Submitted">Resolution Submitted</option>
              <option value="Citizen Verification">Citizen Verification</option>
              <option value="Resolved">Resolved</option>
              <option value="Reopened">Reopened</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white text-slate-700 cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical (Immediate)</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Sort & Counter bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-500">Sort by:</span>
            <button
              type="button"
              onClick={() => setSortBy('date_desc')}
              className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                sortBy === 'date_desc' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Newest First
            </button>
            <button
              type="button"
              onClick={() => setSortBy('priority')}
              className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                sortBy === 'priority' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Priority High &rarr; Low
            </button>
            <button
              type="button"
              onClick={() => setSortBy('sla')}
              className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                sortBy === 'sla' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              SLA Deadline (Urgent First)
            </button>
          </div>

          <div className="text-slate-500">
            Showing <strong>{sortedProblems.length}</strong> matching records
          </div>
        </div>
      </div>

      {/* View Mode 1: Table View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === paginatedProblems.length && paginatedProblems.length > 0}
                      onChange={toggleSelectAll}
                      aria-label="Select all"
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="p-3">Docket ID</th>
                  <th className="p-3">Title & Ward</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Assigned Field Officer</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">SLA Status</th>
                  <th className="p-3 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedProblems.map((prob) => {
                  const isSelected = selectedIds.has(prob.id);
                  const isUnassigned = !prob.assignedOfficer;

                  return (
                    <tr
                      key={prob.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/50' : isUnassigned ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(prob.id)}
                          aria-label={`Select ${prob.id}`}
                          className="cursor-pointer"
                        />
                      </td>
                      <td className="p-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                        <Link to={`/admin/problems/${prob.id}`} className="hover:underline">
                          {prob.id}
                        </Link>
                      </td>
                      <td className="p-3 max-w-[240px]">
                        <Link
                          to={`/admin/problems/${prob.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 block truncate"
                          title={prob.title}
                        >
                          {prob.title}
                        </Link>
                        <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{prob.location.ward}</span>
                        </p>
                      </td>
                      <td className="p-3 max-w-[150px] truncate text-slate-700" title={prob.department}>
                        {prob.department.split('&')[0]}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {prob.assignedOfficer?.name ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-slate-900 text-amber-400 text-[10px] font-bold flex items-center justify-center">
                              {prob.assignedOfficer.name.slice(0, 2).toUpperCase()}
                            </span>
                            <span className="font-semibold text-slate-900">{prob.assignedOfficer.name}</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleOpenAssignModal(prob, e)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 cursor-pointer"
                          >
                            <UserCheck className="w-2.5 h-2.5" />
                            <span>Dispatch Officer</span>
                          </button>
                        )}
                      </td>
                      <td className="p-3">
                        <PriorityBadge priority={prob.priority} size="sm" />
                      </td>
                      <td className="p-3">
                        <StatusBadge status={prob.status} size="sm" />
                      </td>
                      <td className="p-3">
                        {getSlaBadge(prob.deadline, prob.status)}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                        {/* Quick Assign / Reassign Button */}
                        <button
                          type="button"
                          onClick={(e) => handleOpenAssignModal(prob, e)}
                          className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-[11px] cursor-pointer"
                          title="Assign Field Officer"
                        >
                          {prob.assignedOfficer ? 'Reassign' : 'Assign'}
                        </button>

                        <Link
                          to={`/admin/problems/${prob.id}`}
                          className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] inline-flex items-center gap-1"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteOne(prob.id, e)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors inline-block align-middle cursor-pointer"
                          title="Delete Docket"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div>
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({sortedProblems.length} records)
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* View Mode 2: Visual Kanban / Pipeline Board */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Column 1: Intake & Unassigned */}
          <div className="bg-amber-50/50 rounded-xl border border-amber-200/80 p-3.5 space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Intake & Unassigned</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-950">
                {sortedProblems.filter((p) => !p.assignedOfficer && p.status !== 'Resolved').length}
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[600px] pr-0.5">
              {sortedProblems
                .filter((p) => !p.assignedOfficer && p.status !== 'Resolved')
                .map((prob) => (
                  <div
                    key={prob.id}
                    className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs hover:shadow-xs transition-shadow space-y-2"
                  >
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span className="font-mono font-bold text-blue-700 text-[11px]">{prob.id}</span>
                      <PriorityBadge priority={prob.priority} size="sm" />
                    </div>
                    <Link
                      to={`/admin/problems/${prob.id}`}
                      className="font-bold text-slate-900 hover:text-blue-600 text-xs block line-clamp-2"
                    >
                      {prob.title}
                    </Link>
                    <p className="text-[10px] text-slate-500">{prob.location.ward}</p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleOpenAssignModal(prob)}
                        className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Dispatch Officer</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Column 2: In Progress (Active Field Work) */}
          <div className="bg-sky-50/50 rounded-xl border border-sky-200/80 p-3.5 space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-sky-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                <span>Active Field Work</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-200 text-sky-950">
                {sortedProblems.filter((p) => p.status === 'In Progress' && Boolean(p.assignedOfficer)).length}
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[600px] pr-0.5">
              {sortedProblems
                .filter((p) => p.status === 'In Progress' && Boolean(p.assignedOfficer))
                .map((prob) => (
                  <div
                    key={prob.id}
                    className="bg-white p-3 rounded-xl border border-sky-200 shadow-2xs hover:shadow-xs transition-shadow space-y-2"
                  >
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span className="font-mono font-bold text-blue-700 text-[11px]">{prob.id}</span>
                      {getSlaBadge(prob.deadline, prob.status)}
                    </div>
                    <Link
                      to={`/admin/problems/${prob.id}`}
                      className="font-bold text-slate-900 hover:text-blue-600 text-xs block line-clamp-2"
                    >
                      {prob.title}
                    </Link>
                    <div className="flex items-center gap-1 text-[10px] text-slate-600">
                      <UserCheck className="w-3 h-3 text-blue-600" />
                      <span className="font-semibold truncate">{prob.assignedOfficer?.name}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenAssignModal(prob)}
                        className="text-[10px] text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                      >
                        Reassign
                      </button>
                      <Link
                        to={`/admin/problems/${prob.id}`}
                        className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        <span>Audit Docket</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Column 3: Citizen Verification */}
          <div className="bg-purple-50/50 rounded-xl border border-purple-200/80 p-3.5 space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>Citizen Verification</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-200 text-purple-950">
                {sortedProblems.filter((p) => p.status === 'Citizen Verification' || p.status === 'Resolution Submitted').length}
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[600px] pr-0.5">
              {sortedProblems
                .filter((p) => p.status === 'Citizen Verification' || p.status === 'Resolution Submitted')
                .map((prob) => (
                  <div
                    key={prob.id}
                    className="bg-white p-3 rounded-xl border border-purple-200 shadow-2xs hover:shadow-xs transition-shadow space-y-2"
                  >
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span className="font-mono font-bold text-blue-700 text-[11px]">{prob.id}</span>
                      <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                        Proof Uploaded
                      </span>
                    </div>
                    <Link
                      to={`/admin/problems/${prob.id}`}
                      className="font-bold text-slate-900 hover:text-blue-600 text-xs block line-clamp-2"
                    >
                      {prob.title}
                    </Link>
                    <p className="text-[10px] text-slate-500">{prob.location.ward}</p>
                    <div className="pt-2 border-t border-slate-100">
                      <Link
                        to={`/admin/problems/${prob.id}`}
                        className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center justify-center gap-1"
                      >
                        <span>Audit Resolution Proof</span>
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Column 4: Resolved & Closed */}
          <div className="bg-emerald-50/50 rounded-xl border border-emerald-200/80 p-3.5 space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Resolved & Closed</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-200 text-emerald-950">
                {sortedProblems.filter((p) => p.status === 'Resolved').length}
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[600px] pr-0.5">
              {sortedProblems
                .filter((p) => p.status === 'Resolved')
                .map((prob) => (
                  <div
                    key={prob.id}
                    className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs hover:shadow-xs transition-shadow space-y-2"
                  >
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span className="font-mono font-bold text-blue-700 text-[11px]">{prob.id}</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Verified 5★
                      </span>
                    </div>
                    <Link
                      to={`/admin/problems/${prob.id}`}
                      className="font-bold text-slate-900 hover:text-blue-600 text-xs block line-clamp-2"
                    >
                      {prob.title}
                    </Link>
                    <p className="text-[10px] text-slate-500">{prob.location.ward}</p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Closed</span>
                      <Link to={`/admin/problems/${prob.id}`} className="text-blue-600 font-bold hover:underline">
                        View Record
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Assign Officer Modal */}
      <AssignOfficerModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        problem={modalProblem}
        onAssigned={handleModalAssigned}
      />
    </div>
  );
};

export default AdminProblemsPage;
