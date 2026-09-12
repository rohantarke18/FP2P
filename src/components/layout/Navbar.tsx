import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Language } from '../../types';
import {
  Menu,
  X,
  PlusCircle,
  Search,
  Globe,
  Bell,
  User,
  Shield,
  LogOut,
  ChevronDown,
  LogIn,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout, isAdminOrOfficer, role } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { label: t.nav.home, path: '/' },
    { label: t.nav.reportProblem, path: '/report' },
    { label: t.nav.trackProblem, path: '/track' },
    { label: t.nav.innovations, path: '/innovations' },
    { label: t.nav.consultations, path: '/consultations' },
    { label: t.nav.publicDashboard, path: '/public-dashboard' },
  ];

  const languages: { code: Language; label: string; nativeName: string }[] = [
    { code: 'en', label: 'English', nativeName: 'English' },
    { code: 'mr', label: 'Marathi', nativeName: 'मराठी (Marathi)' },
    { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी (Hindi)' },
  ];

  const currentLangLabel = languages.find((l) => l.code === language)?.label || 'English';

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs font-sans">
      {/* Subtle top civic color band */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-blue-600 to-emerald-500" />
      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo / Brand */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-3 text-slate-900 hover:opacity-95 focus:outline-blue-600 rounded py-1 group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-xs border border-slate-800 transition-transform group-hover:scale-105">
                <span className="text-white font-serif tracking-tight">C</span>
                <span className="text-amber-500 font-serif tracking-tight">B</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base sm:text-lg tracking-tight leading-none text-slate-900">
                  {t.brand.name}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium tracking-wide leading-tight mt-0.5">
                  {t.brand.tagline}
                </span>
              </div>
            </Link>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    active
                      ? 'text-blue-700 bg-blue-50 font-semibold'
                      : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Selector Dropdown */}
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{currentLangLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-40 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in duration-100">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        setLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                        language === l.code ? 'font-bold text-blue-700 bg-blue-50/70' : 'text-slate-700'
                      }`}
                    >
                      <span>{l.nativeName}</span>
                      {language === l.code && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification bell for logged-in user */}
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="relative p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label={`Notifications (${unreadCount} unread)`}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
                )}
              </Link>
            )}

            {/* User Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                    {user?.name
                      ? user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="truncate max-w-[110px] block font-semibold text-slate-800 leading-tight">
                      {user?.name?.split(' ')[0] || 'User'}
                    </span>
                    <span className="text-[9px] text-slate-500 capitalize leading-tight block">
                      {role.replace('_', ' ')}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-150 font-sans">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {user?.name}
                        </span>
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 capitalize">
                          {role.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {user?.email || user?.phone}
                      </p>
                      {user?.wardOrDistrict && (
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          📍 {user.wardOrDistrict}
                        </p>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        to={isAdminOrOfficer ? '/admin' : '/dashboard'}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 font-medium"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isAdminOrOfficer ? (language === 'mr' ? 'प्रशासकीय नियंत्रण कक्ष' : language === 'hi' ? 'प्रशासनिक कंसोल' : 'Administrative Console') : (language === 'mr' ? 'नागरिक डॅशबोर्ड' : language === 'hi' ? 'नागरिक डैशबोर्ड' : 'Citizen Dashboard')}</span>
                      </Link>
                      <Link
                        to="/track"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 font-medium"
                      >
                        <Search className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.nav.trackProblem}</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t.nav.logout}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/admin/login"
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-amber-300/80 bg-amber-50/70 hover:bg-amber-100 text-amber-950 transition-colors inline-flex items-center gap-1"
                  title="Supervisor & On-Site Worker Portal"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>Staff Portal</span>
                </Link>

                <Link
                  to="/login"
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors inline-flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.nav.login}</span>
                </Link>
              </div>
            )}

            {/* Primary Action Button */}
            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t.nav.reportProblem}</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-blue-600"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle main menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              {t.nav.menu}
            </span>
            <div className="flex items-center gap-1 text-xs">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`px-2 py-0.5 rounded text-xs ${
                    language === l.code ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'
                  }`}
                >
                  {l.nativeName}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeMobileMenu}
                className={`block px-3 py-2.5 rounded-md text-sm font-medium ${
                  isActive(link.path)
                    ? 'text-blue-700 bg-blue-50 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-2">
            <Link
              to="/report"
              onClick={closeMobileMenu}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-blue-600 text-white text-sm font-semibold shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.nav.reportProblem}</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center justify-between pt-1">
                <Link
                  to={isAdminOrOfficer ? '/admin' : '/dashboard'}
                  onClick={closeMobileMenu}
                  className="text-xs font-medium text-slate-800 flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{user?.name} ({t.nav.dashboard})</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>{t.nav.logout}</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="w-full flex items-center justify-center py-2 px-4 rounded border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
              >
                {t.nav.login}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
