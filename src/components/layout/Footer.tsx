import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Independent Status */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-white flex items-center justify-center font-bold text-slate-950 font-serif">
                CB
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                {t.brand.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-snug">
              {t.brand.tagline}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.footer.about}
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-400/90 bg-amber-950/40 px-2.5 py-1 rounded border border-amber-800/50">
                <Shield className="w-3 h-3 text-amber-400" />
                <span>{language === 'mr' ? 'स्वतंत्र नागरी व्यासपीठ' : language === 'hi' ? 'स्वतंत्र नागरिक मंच' : 'Independent Civic Platform'}</span>
              </span>
            </div>
          </div>

          {/* Col 2: Citizen Services */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              {t.footer.quickLinks}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/report" className="hover:text-white transition-colors">
                  {t.nav.reportProblem}
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-white transition-colors">
                  {t.nav.trackProblem}
                </Link>
              </li>
              <li>
                <Link to="/innovations" className="hover:text-white transition-colors">
                  {t.nav.innovations}
                </Link>
              </li>
              <li>
                <Link to="/consultations" className="hover:text-white transition-colors">
                  {t.nav.consultations}
                </Link>
              </li>
              <li>
                <Link to="/public-dashboard" className="hover:text-white transition-colors">
                  {t.nav.publicDashboard}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Governance & Transparency */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              {t.footer.governance}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  {t.nav.howItWorks}
                </Link>
              </li>
              <li>
                <Link to="/public-dashboard" className="hover:text-white transition-colors">
                  {language === 'mr' ? 'एसएलए निवारण मापदंड' : language === 'hi' ? 'एसएलए निवारण मेट्रिक्स' : 'SLA Redressal Metrics'}
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className="hover:text-white transition-colors">
                  {t.footer.accessibility}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  {t.footer.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust, Privacy & Legal */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              {t.footer.legal}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className="hover:text-white transition-colors">
                  {language === 'mr' ? 'WCAG २.१ AA मानके' : language === 'hi' ? 'WCAG २.१ AA मानक' : 'WCAG 2.1 AA Standards'}
                </Link>
              </li>
              <li>
                <span className="text-slate-400 block pt-1 leading-relaxed">
                  {language === 'mr'
                    ? 'सादर केलेल्या छायाचित्रांची मालकी नागरिकांकडे राहते. पडताळणी नोंदी सार्वजनिक तपासणीसाठी जतन केल्या जातात.'
                    : language === 'hi'
                    ? 'प्रस्तुत फ़ोटो का स्वामित्व नागरिकों के पास रहता है। सत्यापित रिकॉर्ड सार्वजनिक ऑडिट के लिए सुरक्षित हैं।'
                    : 'Citizens retain ownership of submitted photographic evidence. Verified logs are archived for public audit.'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-center md:text-left">
            {t.footer.disclaimer}
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 shrink-0">
            <span>© {new Date().getFullYear()} {t.brand.name} {language === 'mr' ? 'प्लॅटफॉर्म' : language === 'hi' ? 'प्लेटफॉर्म' : 'Platform'}</span>
            <span>•</span>
            <span>{language === 'mr' ? 'नागरी सेवा सक्षम' : language === 'hi' ? 'नागरिक सेवा सक्षम' : 'Digital Civic Infrastructure'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
