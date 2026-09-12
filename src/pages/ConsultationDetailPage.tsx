import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { consultationService } from '../services/consultationService';
import { Consultation, ConsultationStatus } from '../types';
import { getLocalizedConsultation } from '../utils/localizedData';
import {
  Vote,
  ChevronLeft,
  Building2,
  CheckCircle2,
  FileText,
  Download,
  Send,
  Loader2,
  BarChart2,
  X,
} from 'lucide-react';

export const ConsultationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [rawConsultation, setRawConsultation] = useState<Consultation | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [showBriefModal, setShowBriefModal] = useState(false);

  useEffect(() => {
    if (id) {
      consultationService.getConsultationById(id).then((item) => {
        if (item) setRawConsultation(item);
      });
    }
  }, [id]);

  const consultation = useMemo(() => {
    return rawConsultation ? getLocalizedConsultation(rawConsultation, language) : null;
  }, [rawConsultation, language]);

  if (!consultation) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500">
          {language === 'mr'
            ? 'धोरण चर्चा मसुदा लोड होत आहे...'
            : language === 'hi'
            ? 'नीति परामर्श प्रारूप लोड हो रहा है...'
            : 'Loading civic consultation docket...'}
        </p>
      </div>
    );
  }

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

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleRating = (questionId: string, val: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const handleTextChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const res = await consultationService.submitResponse(consultation.id, {
        userName: user?.name || (language === 'mr' ? 'नागरिक सहभागी' : language === 'hi' ? 'नागरिक सहभागी' : 'Citizen Contributor'),
        userRole: user?.role || 'citizen',
        ward: 'Ward 14 (Shivajinagar)',
        answers,
      });

      setSubmittedRef(res.id);
      showToast(
        'success',
        language === 'mr' ? 'प्रतिसाद नोंदवला गेला' : language === 'hi' ? 'उत्तर दर्ज किया गया' : 'Response Recorded',
        language === 'mr'
          ? 'आपले मत सार्वजनिक धोरण मसुद्यामध्ये यशस्वीरीत्या जोडले गेले आहे.'
          : language === 'hi'
          ? 'आपका सुझाव सार्वजनिक नीति प्रारूप में जोड़ दिया गया है।'
          : 'Your input has been added to the public policy docket.'
      );

      // Refresh consultation data to reflect new tally
      const updated = await consultationService.getConsultationById(consultation.id);
      if (updated) setRawConsultation(updated);
    } catch (err: any) {
      showToast(
        'error',
        language === 'mr' ? 'नोंदणी अयशस्वी' : language === 'hi' ? 'प्रविष्टि विफल' : 'Submission Failed',
        err.message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Back link */}
      <div className="flex items-center justify-between">
        <Link
          to="/consultations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>
            {language === 'mr'
              ? 'सर्व धोरण चर्चांकडे परत'
              : language === 'hi'
              ? 'सभी नीति परामर्शों पर वापस'
              : 'Back to Consultations'}
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setShowBriefModal(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>
            {language === 'mr'
              ? 'धोरण मसुदा दस्तऐवज पहा'
              : language === 'hi'
              ? 'नीति प्रारूप दस्तावेज देखें'
              : 'View Policy Brief Document'}
          </span>
        </button>
      </div>

      {/* Header Docket Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded">
              {getStatusLabel(consultation.status)}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {consultation.department}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              {language === 'mr' ? 'अंतिम मुदत: ' : language === 'hi' ? 'अंतिम तिथि: ' : 'Deadline: '}
              <strong>{new Date(consultation.deadline).toLocaleDateString()}</strong>
            </span>
            <span>•</span>
            <span>
              <strong>{consultation.totalResponses.toLocaleString()}</strong>{' '}
              {language === 'mr' ? 'नोंदवलेले अभिप्राय' : language === 'hi' ? 'दर्ज प्रविष्टियाँ' : 'Recorded Inputs'}
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {consultation.title}
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
            {consultation.summary}
          </p>
        </div>
      </div>

      {/* Grid: Questionnaire & Live Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form or Receipt */}
        <div className="lg:col-span-2 space-y-6">
          {submittedRef ? (
            <div className="bg-white rounded-xl border border-emerald-200 p-6 shadow-xs text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {language === 'mr'
                  ? 'नागरी अभिप्राय यशस्वीरीत्या नोंदवला गेला'
                  : language === 'hi'
                  ? 'नागरिक प्रतिपुष्टि सफलतापूर्वक दर्ज की गई'
                  : 'Civic Feedback Successfully Registered'}
              </h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                {language === 'mr'
                  ? 'सहभागी लोकशाही प्रक्रियेत सहभाग घेतल्याबद्दल धन्यवाद. आपला प्रतिसाद कायमस्वरूपी पालिका अभिलेखात समाविष्ट केला गेला आहे.'
                  : language === 'hi'
                  ? 'सहभागी लोकतंत्र में भाग लेने हेतु धन्यवाद। आपका उत्तर स्थायी नगरपालिका रिकॉर्ड में शामिल कर लिया गया है।'
                  : 'Thank you for exercising participatory democracy. Your response has been compiled into the permanent municipal public record.'}
              </p>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 font-mono text-xs font-bold text-purple-900 inline-block">
                {language === 'mr' ? 'पावती संदर्भ: ' : language === 'hi' ? 'रसीद संदर्भ: ' : 'Receipt Reference: '}
                {submittedRef}
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittedRef(null)}
                  className="text-xs text-blue-600 hover:underline cursor-pointer"
                >
                  {language === 'mr'
                    ? 'आणखी एक मत नोंदवा'
                    : language === 'hi'
                    ? 'एक और दृष्टिकोण प्रस्तुत करें'
                    : 'Submit Another Perspective'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Vote className="w-4 h-4 text-purple-600" />
                  <span>
                    {language === 'mr'
                      ? 'सहभागी धोरण प्रश्नावली'
                      : language === 'hi'
                      ? 'सहभागी नीति प्रश्नावली'
                      : 'Participatory Policy Questionnaire'}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'mr'
                    ? 'अंतिम मंजुरीपूर्वी आपले प्रतिसाद थेट पालिका सुकाणू समितीला मार्गदर्शन करतात.'
                    : language === 'hi'
                    ? 'आपके उत्तर अंतिम अधिनियमन से पूर्व नगर निगम संचालन समिति का सीधा मार्गदर्शन करते हैं।'
                    : 'Your responses directly guide the municipal steering committee ahead of final enactment.'}
                </p>
              </div>

              <form onSubmit={handleSubmitResponse} className="space-y-6">
                {consultation.questions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-lg bg-slate-50/70 border border-slate-200/80 space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold text-purple-700 font-mono mt-0.5">
                        Q{idx + 1}.
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {q.prompt}
                      </h3>
                    </div>

                    {/* Single Choice Options */}
                    {q.type === 'single_choice' && q.options && (
                      <div className="space-y-2 pt-1">
                        {q.options.map((opt) => {
                          const isSelected = answers[q.id] === opt;
                          return (
                            <label
                              key={opt}
                              className={`flex items-center gap-2.5 p-2.5 rounded border text-xs cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-purple-50 border-purple-500 font-semibold text-purple-950'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                value={opt}
                                checked={isSelected}
                                onChange={() => handleSelectOption(q.id, opt)}
                                className="text-purple-600 focus:ring-purple-500"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* Rating Scale */}
                    {q.type === 'rating_scale' && (
                      <div className="pt-1">
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleRating(q.id, val)}
                              className={`w-9 h-9 rounded text-xs font-bold cursor-pointer transition-colors border ${
                                answers[q.id] === val
                                  ? 'bg-purple-700 text-white border-purple-700'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400 mt-1 max-w-[200px]">
                          <span>{language === 'mr' ? '१ = पूर्ण असहमत' : language === 'hi' ? '1 = दृढ़ असहमत' : '1 = Strongly Disagree'}</span>
                          <span>{language === 'mr' ? '५ = पूर्ण सहमत' : language === 'hi' ? '5 = दृढ़ सहमत' : '5 = Strongly Agree'}</span>
                        </div>
                      </div>
                    )}

                    {/* Open Text */}
                    {q.type === 'open_text' && (
                      <div className="pt-1">
                        <textarea
                          rows={3}
                          value={answers[q.id] || ''}
                          onChange={(e) => handleTextChange(q.id, e.target.value)}
                          placeholder={
                            language === 'mr'
                              ? 'स्थानिक परिस्थिती, अपवाद किंवा विशिष्ट शिफारसी येथे नोंदवा...'
                              : language === 'hi'
                              ? 'स्थानीय स्थिति, अपवाद या विशिष्ट सिफारिशें यहाँ दर्ज करें...'
                              : 'Provide specific localized feedback, exceptions, or recommendations...'
                          }
                          className="w-full text-xs p-2.5 rounded border border-slate-300 focus:outline-purple-600 bg-white"
                        />
                      </div>
                    )}
                  </div>
                ))}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {language === 'mr' ? 'नोंदणीकृत वापरकर्ता: ' : language === 'hi' ? 'सत्यापित प्रयोक्ता: ' : 'Logged as: '}
                    <strong>{user?.name || (language === 'mr' ? 'सत्यापित नागरिक' : language === 'hi' ? 'सत्यापित नागरिक' : 'Verified Citizen')}</strong>
                  </span>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>
                          {language === 'mr' ? 'सादर करत आहे...' : language === 'hi' ? 'जमा किया जा रहा है...' : 'Submitting Input...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {language === 'mr' ? 'धोरण प्रतिसाद सादर करा' : language === 'hi' ? 'परामर्श उत्तर जमा करें' : 'Submit Consultation Response'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Col: Real-time Community Aggregate Tally */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-purple-600" />
                <span>
                  {language === 'mr' ? 'थेट जनमत वितरण' : language === 'hi' ? 'लाइव जनमत वितरण' : 'Live Community Distribution'}
                </span>
              </h3>
              <span className="text-[10px] bg-purple-50 text-purple-800 font-semibold px-2 py-0.5 rounded">
                {language === 'mr' ? 'सत्यापित' : language === 'hi' ? 'सत्यापित' : 'Verified'}
              </span>
            </div>

            {/* Distribution charts */}
            <div className="space-y-5">
              {consultation.questions
                .filter((q) => q.liveDistribution)
                .map((q) => {
                  const dist = q.liveDistribution!;
                  const totalVotes = Object.values(dist).reduce<number>((a, b) => Number(a) + Number(b), 0);

                  return (
                    <div key={q.id} className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-800 leading-snug">
                        {q.prompt}
                      </h4>

                      <div className="space-y-1.5 pt-1">
                        {Object.entries(dist).map(([opt, count]) => {
                          const voteCount = Number(count);
                          const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                          return (
                            <div key={opt} className="text-xs">
                              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                                <span className="truncate max-w-[180px]" title={opt}>{opt}</span>
                                <span className="font-semibold">{pct}% ({voteCount})</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-purple-600 h-2 rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="bg-purple-50/60 rounded-xl border border-purple-200 p-5 text-xs text-purple-950 space-y-2">
            <span className="font-bold text-purple-900 block">
              {language === 'mr' ? 'धोरण विचारविनिमय नियमावली' : language === 'hi' ? 'नीति विचार-विमर्श प्रोटोकॉल' : 'Policy Deliberation Protocol'}
            </span>
            <p className="text-purple-800 leading-relaxed">
              {language === 'mr' ? (
                <>सार्वजनिक चर्चा कालावधी संपल्यानंतर ({new Date(consultation.deadline).toLocaleDateString()}), पालिका परिषद एक अधिकृत श्वेतपत्रिका प्रसिद्ध करेल ज्यामध्ये नागरिकांच्या सूचना अंतिम राजपत्रात कशा समाविष्ट केल्या गेल्या याचा सविस्तर तपशील असेल.</>
              ) : language === 'hi' ? (
                <>सार्वजनिक परामर्श अवधि समाप्त होने पर ({new Date(consultation.deadline).toLocaleDateString()}), नगर परिषद एक आधिकारिक श्वेतपत्र प्रकाशित करेगी जिसमें बताया जाएगा कि नागरिकों के सुझावों को अंतिम राजपत्र में कैसे शामिल किया गया।</>
              ) : (
                <>Upon conclusion of the public comment period on {new Date(consultation.deadline).toLocaleDateString()}, the municipal council will publish an official White Paper detailing how citizen submissions were incorporated into the final gazette.</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Policy Brief Modal / Preview */}
      {showBriefModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-slate-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'mr'
                    ? 'अधिकृत धोरण मसुदा दस्तऐवज'
                    : language === 'hi'
                    ? 'आधिकारिक नीति प्रारूप दस्तावेज'
                    : 'Official Policy Brief Draft Dossier'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBriefModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3 text-slate-700 font-mono leading-relaxed bg-slate-50 p-4 rounded border border-slate-200">
              <p><strong>{language === 'mr' ? 'मसुदा क्रमांक:' : language === 'hi' ? 'दस्तावेज क्रमांक:' : 'DOCKET REF:'}</strong> {consultation.id}</p>
              <p><strong>{language === 'mr' ? 'शीर्षक:' : language === 'hi' ? 'शीर्षक:' : 'TITLE:'}</strong> {consultation.title}</p>
              <p><strong>{language === 'mr' ? 'विभाग:' : language === 'hi' ? 'विभाग:' : 'DEPT:'}</strong> {consultation.department}</p>
              <p><strong>{language === 'mr' ? 'राजपत्र मुदत:' : language === 'hi' ? 'अंतिम राजपत्र तिथि:' : 'GAZETTE DEADLINE:'}</strong> {consultation.deadline}</p>
              <hr className="my-2 border-slate-200" />
              <p className="font-bold text-slate-900">{language === 'mr' ? 'कार्यकारी सारांश:' : language === 'hi' ? 'कार्यकारी सारांश:' : 'EXECUTIVE SUMMARY:'}</p>
              <p>{consultation.summary}</p>
              <p className="font-bold text-slate-900 mt-2">{language === 'mr' ? 'नियामक उद्दिष्टे:' : language === 'hi' ? 'नियामक उद्देश्य:' : 'REGULATORY OBJECTIVES:'}</p>
              <ul className="list-disc pl-4 space-y-1">
                {language === 'mr' ? (
                  <>
                    <li>स्थानिक पातळीवर विकेंद्रित सांडपाणी आणि कचरा वर्गीकरण लागू करणे.</li>
                    <li>मालमत्ता कर सवलतीद्वारे शाश्वत उपक्रमांना प्रोत्साहन देणे.</li>
                    <li>प्रभाग दक्षता समित्यांना अंमलबजावणीचे अधिकार प्रदान करणे.</li>
                  </>
                ) : language === 'hi' ? (
                  <>
                    <li>स्थानीय स्तर पर विकेंद्रीकृत अपशिष्ट एवं जल पुनर्चक्रण लागू करना।</li>
                    <li>संपत्ति कर छूट के माध्यम से सतत पहलों को प्रोत्साहित करना।</li>
                    <li>वार्ड सतर्कता समितियों को निरीक्षण अधिकार प्रदान करना।</li>
                  </>
                ) : (
                  <>
                    <li>Enforce localized zero-waste decentralized segregation.</li>
                    <li>Incentivize bulk waste generators through property-tax rebates.</li>
                    <li>Empower Ward Vigilance Committees with audit powers.</li>
                  </>
                )}
              </ul>
              <p className="text-[11px] text-slate-400 pt-2">
                {language === 'mr'
                  ? '* सार्वजनिक नागरी पारदर्शकता सनदेच्या कलम ४(१)(ब) अंतर्गत तयार केलेला दस्तऐवज.'
                  : language === 'hi'
                  ? '* सार्वजनिक नागरिक पारदर्शिता चार्टर की धारा 4(1)(b) के तहत तैयार किया गया दस्तावेज।'
                  : '* Document produced under Section 4(1)(b) of the Right to Public Civic Transparency Charter.'}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-semibold cursor-pointer"
              >
                {language === 'mr' ? 'प्रिंट / पीडीएफ सेव्ह करा' : language === 'hi' ? 'प्रिंट / पीडीएफ सहेजें' : 'Print / Save PDF'}
              </button>
              <button
                type="button"
                onClick={() => setShowBriefModal(false)}
                className="px-4 py-2 border rounded text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {language === 'mr' ? 'बंद करा' : language === 'hi' ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
