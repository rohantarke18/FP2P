import React from 'react';
import LogoLoop, { LogoItem } from './LogoLoop';
import { useLanguage } from '../../context/LanguageContext';
import {
  Landmark,
  Building2,
  Cpu,
  Trees,
  Zap,
  Droplets,
  HardHat,
  Compass,
  Sparkles,
  Network,
  FileCheck2,
  ShieldCheck,
} from 'lucide-react';

interface IntegratedAuthoritiesLoopProps {
  className?: string;
  speed?: number;
  direction?: 'left' | 'right';
  showHeading?: boolean;
}

export const IntegratedAuthoritiesLoop: React.FC<IntegratedAuthoritiesLoopProps> = ({
  className = '',
  speed = 45,
  direction = 'left',
  showHeading = true,
}) => {
  const { language } = useLanguage();

  const authorities = [
    {
      code: 'BMC',
      name: language === 'mr' ? 'बृहन्मुंबई महानगरपालिका' : language === 'hi' ? 'बृहन्मुंबई नगर निगम' : 'Brihanmumbai Municipal Corp',
      region: 'Mumbai Region',
      icon: Landmark,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      code: 'PMC',
      name: language === 'mr' ? 'पुणे महानगरपालिका' : language === 'hi' ? 'पुणे नगर निगम' : 'Pune Municipal Corporation',
      region: 'Pune Central',
      icon: Building2,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      code: 'PCMC',
      name: language === 'mr' ? 'पिंपरी चिंचवड स्मार्ट सिटी' : language === 'hi' ? 'पिंपरी चिंचवड स्मार्ट सिटी' : 'Pimpri Chinchwad Smart City',
      region: 'PCMC Industrial',
      icon: Cpu,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      code: 'NMMC',
      name: language === 'mr' ? 'नवी मुंबई महानगरपालिका' : language === 'hi' ? 'नवी मुंबई नगर निगम' : 'Navi Mumbai Eco-City',
      region: 'Navi Mumbai Zone',
      icon: Trees,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      code: 'MSEDCL',
      name: language === 'mr' ? 'महावितरण (वीज वितरण)' : language === 'hi' ? 'महावितरण (विद्युत वितरण)' : 'MSEDCL Mahavitaran Power',
      region: 'State Grid',
      icon: Zap,
      color: 'bg-amber-100/70 text-amber-800 border-amber-300',
    },
    {
      code: 'MJP',
      name: language === 'mr' ? 'महाराष्ट्र जीवन प्राधिकरण' : language === 'hi' ? 'महाराष्ट्र जीवन प्राधिकरण' : 'MJP Water & Sanitation',
      region: 'State Water Works',
      icon: Droplets,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    },
    {
      code: 'PWD',
      name: language === 'mr' ? 'सार्वजनिक बांधकाम विभाग' : language === 'hi' ? 'लोक निर्माण विभाग' : 'Public Works Department',
      region: 'Road Infrastructure',
      icon: HardHat,
      color: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    {
      code: 'MSRDC',
      name: language === 'mr' ? 'रस्ते विकास महामंडळ' : language === 'hi' ? 'सड़क विकास निगम' : 'MSRDC Highways Authority',
      region: 'Expressways & Corridors',
      icon: Compass,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      code: 'SBM-U',
      name: language === 'mr' ? 'स्वच्छ भारत अभियान (नागरी)' : language === 'hi' ? 'स्वच्छ भारत मिशन (शहरी)' : 'Swachh Bharat Urban Mission',
      region: 'National Urban Mission',
      icon: Sparkles,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
      code: 'SCM',
      name: language === 'mr' ? 'स्मार्ट शहरे अभियान' : language === 'hi' ? 'स्मार्ट सिटी मिशन' : 'Smart Cities Maharashtra',
      region: 'Integrated Command',
      icon: Network,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    {
      code: 'DIGILOCKER',
      name: language === 'mr' ? 'डिजीलॉकर नागरिक ओळख' : language === 'hi' ? 'डिजीलॉकर नागरिक पहचान' : 'DigiLocker Verification',
      region: 'Identity Infrastructure',
      icon: FileCheck2,
      color: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      code: 'MAHA-GOV',
      name: language === 'mr' ? 'महाराष्ट्र शासन ई-सेवा' : language === 'hi' ? 'महाराष्ट्र शासन ई-सेवा' : 'Government of Maharashtra',
      region: 'Urban Dev Dept',
      icon: ShieldCheck,
      color: 'bg-slate-100 text-slate-800 border-slate-300',
    },
  ];

  const logoItems: LogoItem[] = authorities.map((auth) => {
    const IconComponent = auth.icon;
    return {
      title: `${auth.code} - ${auth.name}`,
      ariaLabel: `${auth.code} ${auth.name}`,
      node: (
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer select-none">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${auth.color}`}>
            <IconComponent className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 tracking-tight leading-none whitespace-nowrap">
                {auth.code}
              </span>
              <span className="text-[9px] font-semibold text-slate-400 px-1 py-0.2 rounded bg-slate-50 border border-slate-100 leading-tight">
                {auth.region}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium tracking-tight whitespace-nowrap mt-0.5 leading-tight">
              {auth.name}
            </span>
          </div>
        </div>
      ),
    };
  });

  return (
    <div className={`w-full ${className}`}>
      {showHeading && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-3 px-1 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              {language === 'mr'
                ? 'एकात्मिक महानगरपालिका व सार्वजनिक संस्था नेटवर्क'
                : language === 'hi'
                ? 'एकीकृत नगर निगम एवं सार्वजनिक अवसंरचना नेटवर्क'
                : 'Integrated Municipal & Public Infrastructure Network'}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            {language === 'mr'
              ? '२७+ स्थानिक स्वराज्य संस्था प्रत्यक्ष जोडणी'
              : language === 'hi'
              ? '२७+ नगर निगम एवं प्राधिकरण लाइव कनेक्टेड'
              : '27+ Urban Local Bodies & Utilities Synced'}
          </span>
        </div>
      )}

      <div className="relative overflow-hidden py-1">
        <LogoLoop
          logos={logoItems}
          speed={speed}
          direction={direction}
          logoHeight={38}
          gap={20}
          hoverSpeed={0}
          scaleOnHover={true}
          fadeOut={true}
          fadeOutColor="#ffffff"
          ariaLabel="Integrated Municipal and Civic Authority Partners"
        />
      </div>
    </div>
  );
};
