import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { analyticsService } from '../services/analyticsService';
import { PublicMetrics } from '../types';
import {
  FileText,
  Search,
  Lightbulb,
  Vote,
  ArrowRight,
  Building2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState<PublicMetrics | null>(null);

  useEffect(() => {
    analyticsService.getPublicMetrics().then(setMetrics);
  }, []);

  const helpCards = [
    { icon: FileText, title: t.landing.cardReportTitle, desc: t.landing.cardReportDesc, to: '/report', accent: 'text-blue-600 bg-blue-50 border-blue-200' },
    { icon: Search, title: t.landing.cardTrackTitle, desc: t.landing.cardTrackDesc, to: '/track', accent: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { icon: Lightbulb, title: t.landing.cardInnovateTitle, desc: t.landing.cardInnovateDesc, to: '/innovations/submit', accent: 'text-amber-600 bg-amber-50 border-amber-200' },
    { icon: Vote, title: t.landing.cardConsultTitle, desc: t.landing.cardConsultDesc, to: '/consultations', accent: 'text-purple-600 bg-purple-50 border-purple-200' },
  ];

  const steps = [
    { icon: FileText, label: t.landing.step1 },
    { icon: Building2, label: t.landing.step2 },
    { icon: CheckCircle2, label: t.landing.step3 },
    { icon: ShieldCheck, label: t.landing.step4 },
  ];

  const stats = [
    { label: t.landing.statsReported, value: metrics?.totalReported },
    { label: t.landing.statsResolved, value: metrics?.totalResolved },
    { label: t.landing.statsVerified, value: metrics ? `${metrics.verificationRate}%` : undefined },
  ];

  return (
    <div className="bg-gradient-to-b from-slate-50 via-blue-50/30 to-amber-50/20 min-h-screen text-slate-900">
      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-12 pb-12 sm:pt-20 sm:pb-16 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-950 text-xs font-semibold mb-6 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>Official Municipal Public Grievance & Redressal Portal</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
          {t.brand.name}
        </h1>
        <p className="mt-2 text-base sm:text-lg font-medium text-blue-700">{t.brand.tagline}</p>
        <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
          {t.landing.description}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/report"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs transition-colors"
          >
            {t.landing.reportCta}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/track"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-2xs transition-colors"
          >
            {t.landing.trackCta}
          </Link>
          <Link
            to="/admin/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-amber-50 border border-amber-300/90 hover:bg-amber-100 text-amber-950 font-bold text-sm shadow-2xs transition-colors"
          >
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>Staff Portal (Supervisor & Worker)</span>
          </Link>
        </div>
      </section>

      {/* How can we help */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16 max-w-5xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-8">
          {t.landing.helpTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {helpCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                to={card.to}
                className="group p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all flex flex-col gap-3"
              >
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${card.accent}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{card.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{card.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Public impact numbers */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-200/80 p-6 text-center shadow-2xs">
            <div className="text-3xl sm:text-4xl font-black text-blue-950 tabular-nums">
              {stats[0]?.value ?? '—'}
            </div>
            <div className="text-xs text-blue-800 mt-1 font-bold">{stats[0]?.label}</div>
            <div className="text-[10px] text-blue-600/80 mt-0.5">Logged across municipal wards</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-200/80 p-6 text-center shadow-2xs">
            <div className="text-3xl sm:text-4xl font-black text-emerald-950 tabular-nums">
              {stats[1]?.value ?? '—'}
            </div>
            <div className="text-xs text-emerald-800 mt-1 font-bold">{stats[1]?.label}</div>
            <div className="text-[10px] text-emerald-600/80 mt-0.5">Fixed with photo audit</div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-200/80 p-6 text-center shadow-2xs">
            <div className="text-3xl sm:text-4xl font-black text-amber-950 tabular-nums">
              {stats[2]?.value ?? '—'}
            </div>
            <div className="text-xs text-amber-800 mt-1 font-bold">{stats[2]?.label}</div>
            <div className="text-[10px] text-amber-600/80 mt-0.5">Publicly verified by citizens</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20 max-w-4xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-8">
          {t.landing.worksTitle}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="text-center">
                <div className="mx-auto w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {i + 1}
                </div>
                <Icon className="w-4 h-4 text-blue-600 mx-auto mt-2" />
                <p className="text-xs font-semibold text-slate-800 mt-1.5">{step.label}</p>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-8">
          <Link to="/how-it-works" className="text-sm font-semibold text-blue-600 hover:underline">
            {t.landing.worksSeeMore} →
          </Link>
        </div>
      </section>
    </div>
  );
};
