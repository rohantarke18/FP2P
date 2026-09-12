import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  AlertCircle,
  Users,
  Building,
  Lightbulb,
  Vote,
  BarChart3,
  FileSpreadsheet,
  History,
  Settings,
  Shield,
  LogOut,
  ExternalLink,
  ChevronRight,
  ClipboardList,
  HardHat,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { t } = useLanguage();
  const { user, role, logout } = useAuth();
  const location = useLocation();

  const isWorker = role === 'officer';

  // Simplified navigation:
  // - For On-Site Worker: focuses on their assigned tasks and field problems
  // - For Boss/Supervisor: focuses on assigning, tracking, and oversight
  const navItems = isWorker
    ? [
        { label: 'My On-Site Tasks', path: '/admin/assignments', icon: HardHat, highlight: true },
        { label: 'All Ward Grievances', path: '/admin/problems', icon: AlertCircle },
        { label: 'System Overview', path: '/admin', icon: LayoutDashboard },
        { label: 'Field Settings', path: '/admin/settings', icon: Settings },
      ]
    : [
        { label: 'Overview & KPIs', path: '/admin', icon: LayoutDashboard },
        { label: 'Assign & Track Tasks', path: '/admin/assignments', icon: ClipboardList, highlight: true },
        { label: 'Grievances Registry', path: '/admin/problems', icon: AlertCircle },
        { label: 'Departments & Teams', path: '/admin/departments', icon: Building },
        { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
        { label: 'Audit Log', path: '/admin/audit-log', icon: History },
        { label: 'Console Settings', path: '/admin/settings', icon: Settings },
      ];

  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 bg-slate-950/60">
        <Link to="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-amber-500 text-slate-950 font-bold flex items-center justify-center font-serif text-sm">
            CB
          </div>
          <div>
            <span className="font-bold text-sm text-white tracking-tight block">
              CivicBridge
            </span>
            <span className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase block">
              Administrative Desk
            </span>
          </div>
        </Link>
      </div>

      {/* Officer / User Profile Card in Sidebar */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs ${
              isWorker
                ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
            }`}
          >
            {isWorker ? <HardHat className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{user?.name || (isWorker ? 'Milind Salvi' : 'Er. Rajesh Patil')}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  isWorker
                    ? 'bg-sky-400/20 text-sky-300'
                    : 'bg-amber-400/20 text-amber-300'
                }`}
              >
                {isWorker ? 'On-Site Worker' : 'Supervisor (Boss)'}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-slate-400 bg-slate-950/60 p-1.5 rounded border border-slate-800/80 truncate">
          {isWorker ? 'Ward 8 Ground Operations' : 'Task Dispatch & Oversight'}
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto text-xs" aria-label="Admin Navigation">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3 py-2.5 rounded-md font-medium transition-colors ${
                active
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer Section */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-1">
        <Link
          to="/"
          className="flex items-center justify-between px-3 py-2 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Portal</span>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
            Live
          </span>
        </Link>

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors cursor-pointer text-left"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Official Desk</span>
        </button>
      </div>
    </aside>
  );
};
