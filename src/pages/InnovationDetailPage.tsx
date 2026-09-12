import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { innovationService } from '../services/innovationService';
import { Innovation, InnovationReview, InnovationComment } from '../types';
import { getLocalizedInnovation } from '../utils/localizedData';
import {
  Lightbulb,
  ThumbsUp,
  Award,
  ChevronLeft,
  MessageSquare,
  ShieldCheck,
  Send,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Coins,
  TrendingUp,
  Tag,
} from 'lucide-react';

export const InnovationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { user, isExpert } = useAuth();
  const { showToast } = useNotifications();

  const [rawInnovation, setInnovation] = useState<Innovation | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Expert review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [feasibilityScore, setFeasibilityScore] = useState<number>(85);
  const [costScore, setCostScore] = useState<number>(80);
  const [impactScore, setImpactScore] = useState<number>(90);
  const [reviewRecommendation, setReviewRecommendation] = useState<
    'Approve for Pilot' | 'Needs Revision' | 'Reject'
  >('Approve for Pilot');
  const [reviewComments, setReviewComments] = useState('');

  useEffect(() => {
    if (id) {
      innovationService.getInnovationById(id).then((item) => {
        if (item) setInnovation(item);
      });
    }
  }, [id]);

  const innovation = useMemo(() => {
    return rawInnovation ? getLocalizedInnovation(rawInnovation, language) : null;
  }, [rawInnovation, language]);

  if (!innovation) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500">
          {language === 'mr' ? 'नवकल्पना प्रस्ताव लोड करत आहे...' : language === 'hi' ? 'नवाचार प्रस्ताव लोड हो रहा है...' : 'Loading civic innovation proposal...'}
        </p>
      </div>
    );
  }

  const handleVote = async () => {
    if (hasVoted) return;
    try {
      const updated = await innovationService.upvoteInnovation(innovation.id);
      setInnovation(updated);
      setHasVoted(true);
      showToast('success', language === 'mr' ? 'समर्थन नोंदवले' : language === 'hi' ? 'समर्थन दर्ज' : 'Vote Counted', language === 'mr' ? 'या नागरी नवकल्पनेस पाठिंबा दिल्याबद्दल धन्यवाद!' : language === 'hi' ? 'इस नागरिक नवाचार का समर्थन करने हेतु धन्यवाद!' : 'Thank you for supporting this civic innovation!');
    } catch (err: any) {
      showToast('error', 'Vote Error', err.message);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsPostingComment(true);
      const commentPayload: Partial<InnovationComment> = {
        userName: user?.name || 'Citizen Contributor',
        userRole: user?.role || 'citizen',
        comment: newComment.trim(),
      };
      const updated = await innovationService.addComment(innovation.id, commentPayload);
      setInnovation(updated);
      setNewComment('');
      showToast('success', 'Comment Added', 'Your perspective has been posted.');
    } catch (err: any) {
      showToast('error', 'Failed to comment', err.message);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComments.trim()) {
      showToast('warning', 'Review Comment Required', 'Please provide detailed review feedback.');
      return;
    }

    try {
      const reviewPayload: Partial<InnovationReview> = {
        reviewerName: user?.name || 'Expert Evaluator',
        reviewerTitle: user?.designation || 'Civic Review Committee Member',
        feasibilityScore,
        costEffectivenessScore: costScore,
        communityImpactScore: impactScore,
        overallScore: Math.round((feasibilityScore + costScore + impactScore) / 3),
        recommendation: reviewRecommendation,
        comments: reviewComments.trim(),
      };

      const updated = await innovationService.addReview(innovation.id, reviewPayload);
      setInnovation(updated);
      setShowReviewModal(false);
      setReviewComments('');
      showToast('success', 'Review Recorded', 'Your expert score has been incorporated into the project dossier.');
    } catch (err: any) {
      showToast('error', 'Failed to submit review', err.message);
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/innovations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{language === 'mr' ? 'नवकल्पना सूचीवर परत जा' : language === 'hi' ? 'नवाचार सूची पर वापस जाएं' : 'Back to Innovations Catalog'}</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded">
              {innovation.category}
            </span>
            <span className="text-xs text-slate-400">
              {language === 'mr' ? 'सादर तारीख: ' : language === 'hi' ? 'दर्ज तिथि: ' : 'Submitted on '}{new Date(innovation.createdAt).toLocaleDateString()}
            </span>
          </div>

          <span className="text-xs font-bold uppercase tracking-wider bg-slate-900 text-white px-3 py-1 rounded">
            {language === 'mr' ? 'टप्पा: ' : language === 'hi' ? 'चरण: ' : 'Stage: '}{getStageLabel(innovation.stage)}
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {innovation.title}
          </h1>

          <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
            <span>{language === 'mr' ? 'प्रस्तावक: ' : language === 'hi' ? 'प्रस्तावक: ' : 'By '}<strong className="text-slate-900">{innovation.submitterName}</strong></span>
            <span>•</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
              {getSubmitterTypeLabel(innovation.submitterType)}
            </span>
          </div>
        </div>

        {/* Upvote & Metric highlight row */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleVote}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              hasVoted
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-300'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-white' : ''}`} />
            <span>{hasVoted ? (language === 'mr' ? 'समर्थन दिले' : language === 'hi' ? 'समर्थित' : 'Supported') : (language === 'mr' ? 'प्रस्तावास पाठिंबा द्या' : language === 'hi' ? 'प्रस्ताव का समर्थन करें' : 'Support Proposal')} ({innovation.votes})</span>
          </button>

          <div className="flex items-center gap-6 text-xs text-slate-600">
            <div>
              <span className="text-slate-400 block text-[11px]">{language === 'mr' ? 'व्यवहार्यता निर्देशांक' : language === 'hi' ? 'व्यावहारिकता सूचकांक' : 'Feasibility Index'}</span>
              <strong className="text-slate-900 text-sm">{innovation.feasibilityScore}/100</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">{language === 'mr' ? 'अंदाजे अर्थसंकल्प' : language === 'hi' ? 'अनुमानित बजट' : 'Est. Budget'}</span>
              <strong className="text-slate-900 text-sm">{innovation.costEstimate}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">{language === 'mr' ? 'अपेक्षित कालावधी' : language === 'hi' ? 'अनुमानित समय' : 'Timeframe'}</span>
              <strong className="text-slate-900 text-sm">{innovation.timelineEstimate}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details, Solution, Reviews, Comments */}
        <div className="lg:col-span-2 space-y-8">
          {/* Problem Statement & Proposed Solution */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
                {language === 'mr' ? 'हाताळलेली नागरी समस्या' : language === 'hi' ? 'संबोधित नागरिक समस्या' : 'Problem Statement Addressed'}
              </h2>
              <div className="p-4 rounded-lg bg-rose-50/50 border border-rose-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed">
                {innovation.problemAddressed}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
                {language === 'mr' ? 'प्रस्तावित उपाय व कार्यपद्धती' : language === 'hi' ? 'प्रस्तावित समाधान एवं कार्यप्रणाली' : 'Proposed Solution & Methodology'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {innovation.description}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
                {language === 'mr' ? 'अपेक्षित सामाजिक प्रभाव' : language === 'hi' ? 'अपेक्षित सामाजिक प्रभाव' : 'Anticipated Community Impact'}
              </h2>
              <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs sm:text-sm text-emerald-950 leading-relaxed">
                {innovation.expectedImpact}
              </div>
            </div>
          </div>

          {/* Expert Reviews & Committee Scoring */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'mr' ? 'तज्ज्ञ समिती परीक्षण' : language === 'hi' ? 'विशेषज्ञ सलाहकार मूल्यांकन' : 'Expert Advisory Evaluations'} ({innovation.reviews?.length ?? 0})
                </h3>
              </div>

              {/* Button to add review */}
              <button
                type="button"
                onClick={() => setShowReviewModal(!showReviewModal)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                {language === 'mr' ? '+ समिती मूल्यांकन जोडा' : language === 'hi' ? '+ समिति मूल्यांकन जोड़ें' : '+ Add Committee Evaluation'}
              </button>
            </div>

            {/* Modal / Inline form to add review */}
            {showReviewModal && (
              <form onSubmit={handleAddReview} className="p-4 rounded bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <h4 className="font-bold text-slate-900">{language === 'mr' ? 'अधिकृत व्यवहार्यता व परिणामकारकता मूल्यांकन' : language === 'hi' ? 'आधिकारिक व्यावहारिकता एवं प्रभावशीलता ऑडिट' : 'Official Feasibility & Viability Audit'}</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">{language === 'mr' ? 'व्यवहार्यता (0-100)' : language === 'hi' ? 'व्यावहारिकता (0-100)' : 'Feasibility (0-100)'}</label>
                    <input
                      type="number"
                      value={feasibilityScore}
                      onChange={(e) => setFeasibilityScore(Number(e.target.value))}
                      className="w-full p-1.5 border rounded bg-white"
                      min={0}
                      max={100}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">{language === 'mr' ? 'किफायतशीरता (0-100)' : language === 'hi' ? 'लागत-प्रभावशीलता (0-100)' : 'Cost-Effectiveness (0-100)'}</label>
                    <input
                      type="number"
                      value={costScore}
                      onChange={(e) => setCostScore(Number(e.target.value))}
                      className="w-full p-1.5 border rounded bg-white"
                      min={0}
                      max={100}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">{language === 'mr' ? 'सामाजिक प्रभाव (0-100)' : language === 'hi' ? 'सामाजिक प्रभाव (0-100)' : 'Community Impact (0-100)'}</label>
                    <input
                      type="number"
                      value={impactScore}
                      onChange={(e) => setImpactScore(Number(e.target.value))}
                      className="w-full p-1.5 border rounded bg-white"
                      min={0}
                      max={100}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">{language === 'mr' ? 'समितीची शिफारस' : language === 'hi' ? 'समिति की सिफारिश' : 'Committee Recommendation'}</label>
                  <select
                    value={reviewRecommendation}
                    onChange={(e) => setReviewRecommendation(e.target.value as any)}
                    className="w-full p-1.5 border rounded bg-white"
                  >
                    <option value="Approve for Pilot">{language === 'mr' ? 'प्रायोगिक अंमलबजावणीस मंजुरी' : language === 'hi' ? 'पायलट परियोजना हेतु स्वीकृत' : 'Approve for Pilot'}</option>
                    <option value="Needs Revision">{language === 'mr' ? 'पुनरावलोकन आवश्यक' : language === 'hi' ? 'संशोधन आवश्यक' : 'Needs Revision'}</option>
                    <option value="Reject">{language === 'mr' ? 'नाकारले' : language === 'hi' ? 'अस्वीकृत' : 'Reject'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">{language === 'mr' ? 'मूल्यांकनकर्त्याची तांत्रिक निरीक्षणे' : language === 'hi' ? 'समीक्षक की तकनीकी टिप्पणियाँ' : 'Evaluator Notes & Technical Observations'}</label>
                  <textarea
                    rows={3}
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder={language === 'mr' ? 'व्याप्ती वाढवणे, सुरक्षा किंवा खरेदीसंबंधी तांत्रिक मुद्दे नोंदवा...' : language === 'hi' ? 'सुरक्षा, खरीद या क्रियान्वयन से संबंधित तकनीकी अवलोकन दर्ज करें...' : 'Document technical observations regarding scaling, procurement, or safety...'}
                    className="w-full p-2 border rounded bg-white"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 text-white rounded font-semibold cursor-pointer"
                  >
                    {language === 'mr' ? 'मूल्यांकन नोंदवा' : language === 'hi' ? 'मूल्यांकन सहेजें' : 'Save Official Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-3 py-1.5 border rounded cursor-pointer"
                  >
                    {t.common.cancel}
                  </button>
                </div>
              </form>
            )}

            {/* Review List */}
            <div className="space-y-4 pt-1">
              {(innovation.reviews || []).map((rev) => (
                <div key={rev.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rev.reviewerName}</h4>
                      <p className="text-[11px] text-slate-500">{rev.reviewerTitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                        {language === 'mr' ? 'गुण: ' : language === 'hi' ? 'अंक: ' : 'Score: '}{rev.overallScore}/100
                      </span>
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                        {rev.recommendation}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{rev.comments}</p>
                  <span className="text-[10px] text-slate-400 block pt-1 font-mono">
                    {language === 'mr' ? 'तपासणी तारीख: ' : language === 'hi' ? 'ऑडिट तिथि: ' : 'Audited on '}{new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Community Discussion Thread */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                {language === 'mr' ? 'नागरिक चर्चा' : language === 'hi' ? 'नागरिक चर्चा' : 'Community Discussion'} ({innovation.comments?.length ?? 0})
              </h3>
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="space-y-2">
              <textarea
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={language === 'mr' ? 'आपले मत, विधायक सूचना किंवा प्रश्न येथे लिहा...' : language === 'hi' ? 'अपने विचार, रचनात्मक सुझाव या प्रश्न यहाँ साझा करें...' : 'Share your perspective, suggestions, or constructive questions...'}
                className="w-full text-xs p-3 rounded border border-slate-300 focus:outline-blue-600 bg-white"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPostingComment || !newComment.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'mr' ? 'मत नोंदवा' : language === 'hi' ? 'विचार साझा करें' : 'Post Perspective'}</span>
                </button>
              </div>
            </form>

            {/* Comment Thread List */}
            <div className="space-y-3 pt-3">
              {(innovation.comments || []).map((comm) => (
                <div key={comm.id} className="p-3.5 rounded bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{comm.userName}</span>
                      <span className="text-[10px] text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded">
                        {comm.userRole}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(comm.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{comm.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Metadata & Impact Checklist */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {language === 'mr' ? 'प्रस्ताव तपशील' : language === 'hi' ? 'प्रस्ताव विवरण' : 'Proposal Metadata'}
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between pb-1.5 border-b border-slate-100">
                <span className="text-slate-400">{language === 'mr' ? 'संदर्भ क्रमांक:' : language === 'hi' ? 'संदर्भ संख्या:' : 'Reference ID:'}</span>
                <span className="font-mono font-bold text-slate-800">{innovation.id}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-100">
                <span className="text-slate-400">{language === 'mr' ? 'वर्गवारी:' : language === 'hi' ? 'श्रेणी:' : 'Category:'}</span>
                <span className="font-medium text-slate-800">{innovation.category}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-100">
                <span className="text-slate-400">{language === 'mr' ? 'सध्याचा टप्पा:' : language === 'hi' ? 'वर्तमान चरण:' : 'Current Stage:'}</span>
                <span className="font-bold text-blue-700">{getStageLabel(innovation.stage)}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-100">
                <span className="text-slate-400">{language === 'mr' ? 'व्यवहार्यता निर्देशांक:' : language === 'hi' ? 'व्यावहारिकता सूचकांक:' : 'Feasibility Score:'}</span>
                <span className="font-bold text-emerald-700">{innovation.feasibilityScore}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{language === 'mr' ? 'नागरिक पाठिंबा:' : language === 'hi' ? 'नागरिक समर्थन:' : 'Community Backing:'}</span>
                <span className="font-bold text-purple-700">{innovation.votes} {language === 'mr' ? 'मते' : language === 'hi' ? 'मत' : 'verified votes'}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/60 rounded-xl border border-blue-200 p-5 text-xs text-blue-950 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>{language === 'mr' ? 'प्रायोगिक मंजुरी निकष' : language === 'hi' ? 'पायलट स्वीकृति मानदंड' : 'Pilot Approval Pathway'}</span>
            </div>
            <p className="text-blue-800 leading-relaxed">
              {language === 'mr'
                ? 'ज्या प्रस्तावांना १५० पेक्षा अधिक नागरिकांचे समर्थन मिळते आणि तज्ज्ञ व्यवहार्यता मूल्यांकन ८० पेक्षा जास्त असते, ते प्रस्ताव थेट महानगरपालिकेच्या प्रायोगिक निधीसाठी व अंमलबजावणीसाठी निवडले जातात.'
                : language === 'hi'
                ? 'जिन प्रस्तावों को 150 से अधिक नागरिकों का समर्थन और 80 से अधिक विशेषज्ञ व्यावहारिकता स्कोर मिलता है, उन्हें नगर निगम पायलट फंडिंग एवं वार्ड क्रियान्वयन हेतु सीधे चुना जाता है।'
                : 'Proposals surpassing 150 community endorsements and achieving an Expert Feasibility rating > 80 are automatically shortlisted for municipal pilot funding and ward implementation.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
