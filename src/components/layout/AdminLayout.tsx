import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Language } from '../../types';
import {
  Menu,
  Bell,
  Search,
  Shield,
  UserCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, role, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const languages: { code: Language; label: string; nativeName: string }[] = [
    { code: 'en', label: 'English', nativeName: 'EN' },
    { code: 'mr', label: 'Marathi', nativeName: 'मराठी' },
    { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 flex flex-col font-sans">
      <div className="flex-1 flex">
        {/* Sidebar for Desktop */}
        <AdminSidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Mobile backdrop */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            aria-hidden="true"
          />
        )}

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          {/* Admin Header */}
          <header className="sticky top-0 z-10 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="p-2 -ml-2 rounded-md text-slate-700 hover:bg-slate-100 lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-800">{t.admin.portalTitle}</span>
                <span>/</span>
                <span className="text-slate-600 capitalize">{role.replace('_', ' ')} Workspace</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Multilingual Selector */}
              <div className="inline-flex rounded border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    type="button"
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      language === l.code
                        ? 'bg-white text-slate-900 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {l.nativeName}
                  </button>
                ))}
              </div>

              {/* Public Portal Link */}
              <Link
                to="/"
                className="hidden md:inline-flex items-center gap-1 text-xs text-slate-600 hover:text-blue-600 px-2.5 py-1 rounded border border-slate-200 bg-white"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Public Site</span>
              </Link>

              {/* Notification icon */}
              <Link
                to="/notifications"
                className="relative p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Administrative alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </Link>

              {/* Officer Profile Badge */}
              <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user?.name
                    ? user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    : 'MC'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-900 leading-tight">
                    {user?.name || 'Municipal Officer'}
                  </span>
                  <span className="text-[10px] text-slate-500 capitalize leading-tight">
                    {role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Page body with RBAC check */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {role === 'citizen' ? (
              <div className="max-w-xl mx-auto my-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-6">
                <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Shield className="w-7 h-7" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    Restricted Administrative Workspace
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                    This section requires authenticated municipal authority privileges (Field Officer, Department Administrator, Super Admin, or Advisory Expert). Your current profile is registered as a <strong>Citizen</strong> ({user?.name || user?.email || 'Authenticated Citizen'}).
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-2">
                  <p className="text-xs text-slate-600">
                    Official roles are assigned strictly by the Municipal Administration upon credential verification. If you are an authorized government official or field worker, please sign in with your official municipal credentials.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <Link
                    to="/"
                    className="text-xs font-semibold px-4 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Return to Citizen Home
                  </Link>
                  <Link
                    to="/admin-login"
                    className="text-xs font-semibold px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                  >
                    Official Credentials Login
                  </Link>
                </div>
              </div>
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
