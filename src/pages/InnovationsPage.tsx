import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { innovationService } from '../services/innovationService';
import { Innovation } from '../types';
import { getLocalizedInnovation, getLocalizedCategory } from '../utils/localizedData';
import {
  Lightbulb,
  PlusCircle,
  ThumbsUp,
  Award,
  ChevronRight,
} from 'lucide-react';

export const InnovationsPage: React.FC = () => {
  const { t, language } = useLanguage();

  const [rawInnovations, setInnovations] = useState<Innovation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const categories = [
    { key: 'All', label: language === 'mr' ? 'सर्व' : language === 'hi' ? 'सभी' : 'All' },
    { key: 'Waste Management', label: getLocalizedCategory('Waste Management', language) },
    { key: 'Traffic & Mobility', label: language === 'mr' ? 'वाहतूक आणि गतिशीलता' : language === 'hi' ? 'यातायात एवं गतिशीलता' : 'Traffic & Mobility' },
    { key: 'Water Conservation', label: language === 'mr' ? 'जलसंधारण व पुनर्वापर' : language === 'hi' ? 'जल संरक्षण एवं पुनर्चक्रण' : 'Water Conservation' },
    { key: 'Digital Governance', label: language === 'mr' ? 'डिजिटल नागरिक सेवा' : language === 'hi' ? 'डिजिटल नागरिक सेवाएं' : 'Digital Governance' },
    { key: 'Green Urban Spaces', label: language === 'mr' ? 'हरित नागरी उद्याने' : language === 'hi' ? 'हरित शहरी पार्क' : 'Green Urban Spaces' },
  ];

  useEffect(() => {
    innovationService.getInnovations().then(setInnovations);
  }, []);

  const localizedInnovations = useMemo(() => {
    return rawInnovations.map((item) => getLocalizedInnovation(item, language));
  }, [rawInnovations, language]);

  const handleVote = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (votedIds.has(id)) return;

    try {
      const updated = await innovationService.upvoteInnovation(id);
      setInnovations((prev) =>
        prev.map((item) => (item.id === id ? { ...item, votes: updated.votes } : item))
      );
      setVotedIds((prev) => new Set([...prev, id]));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredInnovations = localizedInnovations.filter((item, idx) => {
    if (selectedCategory === 'All') return true;
    const rawCategory = rawInnovations[idx]?.category;
    return rawCategory === selectedCategory;
  });

  const getStageBadge = (stage: Innovation['stage']) => {
    switch (stage) {
      case 'Pilot Approved':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Implemented':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStageLabel = (stage: Innovation['stage']) => {
    switch (stage) {
      case 'Pilot Approved':
        return language === 'mr' ? 'प्रायोगिक मंजुरी' : language === 'hi' ? 'पायलट स्वीकृत' : 'Pilot Approved';
      case 'Implemented':
        return language === 'mr' ? 'अंमलबजावणी पूर्ण' : language === 'hi' ? 'कार्यान्वित' : 'Implemented';
      case 'Under Review':
        return language === 'mr' ? 'पुनरावलोकन सुरू' : language === 'hi' ? 'समीक्षाधीन' : 'Under Review';
      default:
        return stage;
    }
  };

  const getSubmitterTypeLabel = (type: string) => {
    switch (type) {
      case 'Student Team':
        return language === 'mr' ? 'विद्यार्थी गट' : language === 'hi' ? 'छात्र दल' : 'Student Team';
      case 'Citizen Collective':
        return language === 'mr' ? 'नागरिक समूह' : language === 'hi' ? 'नागरिक समूह' : 'Citizen Collective';
      case 'Civic Tech NGO':
        return language === 'mr' ? 'नागरी तंत्रज्ञान स्वयंसेवी संस्था' : language === 'hi' ? 'नागरिक तकनीक एनजीओ' : 'Civic Tech NGO';
      case 'Resident Welfare Association':
        return language === 'mr' ? 'रहिवासी संघ' : language === 'hi' ? 'निवासी कल्याण संघ' : 'Resident Welfare Association';
      case 'Urban Planning Scholar':
        return language === 'mr' ? 'नगररचना अभ्यासक' : language === 'hi' ? 'नगर नियोजन शोधकर्ता' : 'Urban Planning Scholar';
      default:
        return type;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-slate-900 text-white rounded-xl p-8 shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-xs">
            <Lightbulb className="w-3.5 h-3.5 text-amber-200" />
            <span>{language === 'mr' ? 'नागरी नवकल्पना व्यासपीठ' : language === 'hi' ? 'नागरिक नवाचार मंच' : 'Civic Innovation Engine'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            {t.innovations.title}
          </h1>
          <p className="text-xs sm:text-sm text-amber-50/90 leading-relaxed font-normal max-w-2xl">
            {t.innovations.subtitle}
          </p>

          <div className="pt-2">
            <Link
              to="/innovations/submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-amber-600" />
              <span>{t.innovations.submitCta}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              type="button"
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500">
          {language === 'mr' ? (
            <>सक्रिय प्रस्ताव: <strong>{filteredInnovations.length}</strong></>
          ) : language === 'hi' ? (
            <>सक्रिय प्रस्ताव: <strong>{filteredInnovations.length}</strong></>
          ) : (
            <>Showing <strong>{filteredInnovations.length}</strong> active proposals</>
          )}
        </div>
      </div>

      {/* Innovation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInnovations.map((item) => {
          const hasVoted = votedIds.has(item.id);

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Stage badge & Category */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {item.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStageBadge(
                      item.stage
                    )}`}
                  >
                    {getStageLabel(item.stage)}
                  </span>
                </div>

                {/* Title */}
                <Link to={`/innovations/${item.id}`} className="group">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                </Link>

                {/* Submitter info */}
                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="font-medium text-slate-800">{item.submitterName}</span>
                  <span>•</span>
                  <span className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                    {getSubmitterTypeLabel(item.submitterType)}
                  </span>
                </div>

                {/* Description */}
                <p className="mt-3 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>

                {/* Metric pill row */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>{language === 'mr' ? 'व्यवहार्यता:' : language === 'hi' ? 'व्यावहारिकता:' : 'Feasibility:'} <strong>{item.feasibilityScore}/100</strong></span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500">
                    {language === 'mr' ? 'अंदाजे:' : language === 'hi' ? 'अनुमानित:' : 'Est:'} {item.costEstimate}
                  </span>
                </div>
              </div>

              {/* Bottom action row */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => handleVote(e, item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                    hasVoted
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200'
                  }`}
                  title={language === 'mr' ? 'या प्रस्तावास पाठिंबा द्या' : language === 'hi' ? 'इस प्रस्ताव का समर्थन करें' : 'Support this civic proposal'}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-blue-600 text-blue-600' : ''}`} />
                  <span>{item.votes}</span>
                </button>

                <Link
                  to={`/innovations/${item.id}`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                >
                  <span>{t.innovations.viewDetails}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
