import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { consultationService } from '../services/consultationService';
import { Consultation, ConsultationStatus, ConsultationQuestion } from '../types';
import { getLocalizedConsultation } from '../utils/localizedData';
import {
  Vote,
  Building2,
  Users,
  ChevronRight,
  Clock,
  Plus,
  Trash2,
  X,
  Loader2,
  FileText,
} from 'lucide-react';

export const ConsultationsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [rawConsultations, setRawConsultations] = useState<Consultation[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDepartment, setFormDepartment] = useState('Urban Development Department');
  const [formTopic, setFormTopic] = useState('Civic Policy & Infrastructure');
  const [formSummary, setFormSummary] = useState('');
  const [formDays, setFormDays] = useState(21);
  const [formQuestions, setFormQuestions] = useState<
    Array<{ text: string; options: string[] }>
  >([
    {
      text: 'Do you support this proposed policy intervention in your ward?',
      options: ['Strongly Support', 'Support with Modifications', 'Neutral / Undecided', 'Oppose'],
    },
  ]);

  const statusTabs = [
    { label: language === 'mr' ? 'सर्व चर्चा' : language === 'hi' ? 'सभी परामर्श' : 'All Consultations', value: 'All' },
    { label: language === 'mr' ? 'सक्रिय व खुले' : language === 'hi' ? 'सक्रिय एवं खुले' : 'Active & Open', value: 'Active' },
    { label: language === 'mr' ? 'विचारविनिमय सुरू' : language === 'hi' ? 'विचाराधीन' : 'Under Deliberation', value: 'Under Deliberation' },
    { label: language === 'mr' ? 'निष्कर्ष पूर्ण' : language === 'hi' ? 'संपन्न एवं स्वीकृत' : 'Concluded & Adopted', value: 'Concluded' },
  ];

  const loadData = () => {
    consultationService.getConsultations().then(setRawConsultations);
  };

  useEffect(() => {
    loadData();
  }, []);

  const localizedConsultations = useMemo(() => {
    return rawConsultations.map((item) => getLocalizedConsultation(item, language));
  }, [rawConsultations, language]);

  const filteredConsultations = localizedConsultations.filter((item) => {
    if (selectedStatus === 'All') return true;
    return item.status === selectedStatus;
  });

  const getStatusBadge = (status: ConsultationStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Under Deliberation':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Concluded':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Draft':
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusLabel = (status: ConsultationStatus) => {
    switch (status) {
      case 'Active':
        return language === 'mr' ? 'सक्रिय' : language === 'hi' ? 'सक्रिय' : 'Active';
      case 'Under Deliberation':
        return language === 'mr' ? 'विचारविनिमय सुरू' : language === 'hi' ? 'विचाराधीन' : 'Under Deliberation';
      case 'Concluded':
        return language === 'mr' ? 'निष्कर्ष पूर्ण' : language === 'hi' ? 'संपन्न' : 'Concluded';
      case 'Draft':
        return language === 'mr' ? 'मसुदा' : language === 'hi' ? 'प्रारूप' : 'Draft';
      default:
        return status;
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Permanently delete this policy consultation docket?')) return;
    try {
      await consultationService.deleteConsultation(id);
      showToast('success', 'Docket Deleted', 'Policy consultation removed.');
      loadData();
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message);
    }
  };

  const handleCreateConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSummary.trim()) {
      showToast('warning', 'Missing Fields', 'Please fill in the title and summary.');
      return;
    }

    try {
      setIsCreating(true);
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + formDays);

      const questions: ConsultationQuestion[] = formQuestions.map((q, idx) => ({
        id: `q-${idx + 1}`,
        type: 'Single Choice',
        question: q.text,
        options: q.options,
        liveDistribution: Object.fromEntries(q.options.map((opt) => [opt, 0])),
      }));

      await consultationService.createConsultation({
        title: formTitle.trim(),
        department: formDepartment,
        topic: formTopic.trim(),
        summary: formSummary.trim(),
        deadline: deadlineDate.toISOString().slice(0, 10),
        questions,
        createdByUid: user?.uid,
      });

      showToast('success', 'Docket Published', 'New digital policy consultation docket is now live.');
      setShowCreateModal(false);
      setFormTitle('');
      setFormSummary('');
      loadData();
    } catch (err: any) {
      showToast('error', 'Creation Failed', err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white rounded-xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-xs">
            <Vote className="w-3.5 h-3.5 text-purple-300" />
            <span>{language === 'mr' ? 'सहभागी लोकशाही कक्ष' : language === 'hi' ? 'सहभागी लोकतंत्र कक्ष' : 'Participatory Democracy Room'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            {t.consultations.title}
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 leading-relaxed font-normal max-w-2xl">
            {t.consultations.subtitle}
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-purple-700" />
            <span>
              {language === 'mr' ? 'नवीन धोरण मसुदा प्रकाशित करा' : language === 'hi' ? 'नया नीति परामर्श प्रकाशित करें' : 'Publish Policy Docket'}
            </span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              type="button"
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                selectedStatus === tab.value
                  ? 'bg-purple-700 text-white font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500">
          {language === 'mr'
            ? <>एकूण <strong>{filteredConsultations.length}</strong> सार्वजनिक धोरण मसुदे उपलब्ध</>
            : language === 'hi'
            ? <>कुल <strong>{filteredConsultations.length}</strong> सार्वजनिक नीति प्रारूप प्रदर्शित</>
            : <>Showing <strong>{filteredConsultations.length}</strong> public policy dockets</>}
        </div>
      </div>

      {/* Consultation Cards */}
      {filteredConsultations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {language === 'mr' ? 'कोणतेही धोरण मसुदे सापडले नाहीत' : language === 'hi' ? 'कोई नीति परामर्श उपलब्ध नहीं है' : 'No Policy Consultations Available'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {language === 'mr'
                ? 'प्रशासनाकडून नवीन सार्वजनिक धोरण मसुदा प्रकाशित करण्यासाठी वरील बटण वापरा.'
                : language === 'hi'
                ? 'नया सार्वजनिक नीति परामर्श प्रकाशित करने के लिए ऊपर दिए बटन का उपयोग करें।'
                : 'Publish a new civic consultation docket using the button above.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'मसुदा सुरू करा' : language === 'hi' ? 'परामर्श शुरू करें' : 'Start Policy Docket'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConsultations.map((item) => {
            const daysLeft = Math.ceil(
              (new Date(item.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
            );

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadge(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {item.department}
                    </span>
                    <span className="text-xs text-slate-400">
                      {language === 'mr' ? 'विषय: ' : language === 'hi' ? 'विषय: ' : 'Topic: '}{item.topic}
                    </span>
                  </div>

                  <Link to={`/consultations/${item.id}`} className="group block">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                      {item.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {daysLeft > 0 ? (
                          language === 'mr' ? (
                            <>अंतिम मुदत: <strong>{daysLeft} दिवस शिल्लक</strong> ({new Date(item.deadline).toLocaleDateString()})</>
                          ) : language === 'hi' ? (
                            <>अंतिम तिथि: <strong>{daysLeft} दिन शेष</strong> ({new Date(item.deadline).toLocaleDateString()})</>
                          ) : (
                            <>Closing in <strong>{daysLeft} days</strong> ({new Date(item.deadline).toLocaleDateString()})</>
                          )
                        ) : (
                          language === 'mr' ? (
                            <>विचारविनिमय पूर्ण: {new Date(item.deadline).toLocaleDateString()}</>
                          ) : language === 'hi' ? (
                            <>विचार-विमर्श संपन्न: {new Date(item.deadline).toLocaleDateString()}</>
                          ) : (
                            <>Deliberation closed on {new Date(item.deadline).toLocaleDateString()}</>
                          )
                        )}
                      </span>
                    </span>

                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        <strong>{(item.totalResponses ?? 0).toLocaleString()}</strong>{' '}
                        {language === 'mr' ? 'नागरिक प्रतिसाद' : language === 'hi' ? 'नागरिक प्रविष्टियाँ' : 'citizen submissions'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Right CTA */}
                <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-end justify-center gap-2">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link
                      to={`/consultations/${item.id}`}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-2xs transition-colors"
                    >
                      <span>{item.status === 'Active' ? t.consultations.participate : t.consultations.viewResults}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete consultation docket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Launch New Policy Consultation */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Vote className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'mr' ? 'नवीन धोरण मसुदा प्रकाशित करा' : language === 'hi' ? 'नया नीति परामर्श प्रकाशित करें' : 'Publish New Policy Consultation Docket'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateConsultation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Policy Docket Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Master Plan for 24/7 Smart Water Metering and Leak Detection"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Urban Development Department">Urban Development Department</option>
                    <option value="Water Supply & Sanitation">Water Supply & Sanitation</option>
                    <option value="Roads & Traffic Infrastructure">Roads & Traffic Infrastructure</option>
                    <option value="Solid Waste Management">Solid Waste Management</option>
                    <option value="Public Health & Safety">Public Health & Safety</option>
                    <option value="Environment & Green Spaces">Environment & Green Spaces</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Topic / Domain
                  </label>
                  <input
                    type="text"
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    placeholder="e.g. Water Tariffs & Resource Conservation"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Summary & Legislative Context *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Provide an overview of the draft regulation, ward scope, rationale, and anticipated civic impact..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Public Deliberation Period: <strong>{formDays} Days</strong>
                </label>
                <input
                  type="range"
                  min="7"
                  max="60"
                  step="7"
                  value={formDays}
                  onChange={(e) => setFormDays(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>7 Days (Expedited)</span>
                  <span>30 Days (Standard)</span>
                  <span>60 Days (Comprehensive)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Publish Consultation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
