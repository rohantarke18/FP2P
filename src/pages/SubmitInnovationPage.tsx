import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { innovationService } from '../services/innovationService';
import { InnovationCategory, EvidenceItem } from '../types';
import { FileUploader } from '../components/common/FileUploader';
import { getLocalizedCategory } from '../utils/localizedData';
import {
  Lightbulb,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Coins,
  Clock,
  Sparkles,
  Loader2,
} from 'lucide-react';

const CATEGORIES: InnovationCategory[] = [
  'Waste Management',
  'Traffic & Mobility',
  'Water Conservation',
  'Digital Governance',
  'Green Urban Spaces',
  'Renewable Energy & Lighting',
];

export const SubmitInnovationPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<InnovationCategory>('Waste Management');
  const [submitterName, setSubmitterName] = useState(user?.name || '');
  const [submitterType, setSubmitterType] = useState<'Citizen' | 'Student team' | 'NGO' | 'Researcher' | 'Civic Tech'>('Student team');
  const [problemAddressed, setProblemAddressed] = useState('');
  const [description, setDescription] = useState('');
  const [expectedImpact, setExpectedImpact] = useState('');
  const [costEstimate, setCostEstimate] = useState('₹50,000 - ₹1.5 Lakhs');
  const [timelineEstimate, setTimelineEstimate] = useState('60 days');
  const [files, setFiles] = useState<EvidenceItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim() || title.length < 10) errs.title = 'Please enter a clear descriptive title (min 10 characters).';
    if (!problemAddressed.trim() || problemAddressed.length < 20) errs.problem = 'Describe the civic problem clearly (min 20 characters).';
    if (!description.trim() || description.length < 30) errs.description = 'Provide the core solution approach (min 30 characters).';
    if (!submitterName.trim()) errs.name = 'Submitter name or team name is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const created = await innovationService.submitInnovation({
        title,
        category,
        submitterName,
        submitterType,
        problemAddressed,
        description,
        expectedImpact,
        costEstimate,
        timelineEstimate,
        submitterUid: user?.id,
        submitterEmail: user?.email,
        attachments: files,
      });

      showToast('success', 'Proposal Submitted', 'Your innovation has been queued for expert committee appraisal.');
      navigate(`/innovations/${created.id}`);
    } catch (err: any) {
      showToast('error', 'Submission Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <Link
          to="/innovations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'mr' ? 'नवकल्पना यादीकडे परत' : language === 'hi' ? 'नवाचार सूची पर वापस' : 'Back to Innovations'}</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {language === 'mr' ? 'नागरी नवकल्पना प्रस्ताव सादर करा' : language === 'hi' ? 'नागरिक नवाचार प्रस्ताव प्रस्तुत करें' : 'Submit a Civic Innovation Proposal'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'mr' ? 'स्थानिक प्रशासन आणि शैक्षणिक भागीदारांसह शाश्वत नागरी उपाय सह-निर्मित करा.' : language === 'hi' ? 'स्थानीय प्रशासन और शैक्षणिक भागीदारों के साथ मिलकर व्यावहारिक नागरिक समाधान विकसित करें।' : 'Co-create sustainable municipal solutions with local government and academic partners.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="proposal-title" className="block text-xs font-semibold text-slate-800 mb-1">
              {language === 'mr' ? 'प्रस्तावाचे शीर्षक' : language === 'hi' ? 'प्रस्ताव का शीर्षक' : 'Proposal Title'} <span className="text-rose-500">*</span>
            </label>
            <input
              id="proposal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === 'mr' ? 'उदा. प्रभाग १४ साठी विकेंद्रित सेंद्रिय खत निर्मिती केंद्र' : language === 'hi' ? 'उदा. वार्ड १४ के लिए विकेंद्रीकृत जैविक खाद केंद्र' : 'e.g. Decentralized Organic Waste Composting Hubs for Ward 14'}
              className="w-full text-xs sm:text-sm p-2.5 rounded border border-slate-300 focus:outline-blue-600 bg-white"
            />
            {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
          </div>

          {/* Category & Submitter Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="proposal-category" className="block text-xs font-semibold text-slate-800 mb-1">
                {language === 'mr' ? 'वर्ग / क्षेत्र' : language === 'hi' ? 'वर्ग / क्षेत्र' : 'Category'}
              </label>
              <select
                id="proposal-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as InnovationCategory)}
                className="w-full text-xs sm:text-sm p-2.5 rounded border border-slate-300 focus:outline-blue-600 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {getLocalizedCategory(cat, language)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="submitter-type" className="block text-xs font-semibold text-slate-800 mb-1">
                {language === 'mr' ? 'प्रस्तावक वर्गवारी' : language === 'hi' ? 'प्रस्तावक वर्गीकरण' : 'Submitter Classification'}
              </label>
              <select
                id="submitter-type"
                value={submitterType}
                onChange={(e) => setSubmitterType(e.target.value as any)}
                className="w-full text-xs sm:text-sm p-2.5 rounded border border-slate-300 focus:outline-blue-600 bg-white"
              >
                <option value="Citizen">{language === 'mr' ? 'नागरिक' : language === 'hi' ? 'नागरिक' : 'Citizen'}</option>
                <option value="Student team">{language === 'mr' ? 'विद्यार्थी / युवा गट' : language === 'hi' ? 'छात्र / युवा समूह' : 'Student / Youth Team'}</option>
                <option value="NGO">{language === 'mr' ? 'नोंदणीकृत सामाजिक संस्था (NGO)' : language === 'hi' ? 'पंजीकृत सामाजिक संस्था (NGO)' : 'Registered NGO / Community Org'}</option>
                <option value="Researcher">{language === 'mr' ? 'संशोधक / शैक्षणिक तज्ज्ञ' : language === 'hi' ? 'शोधकर्ता / अकादमिक विशेषज्ञ' : 'Academic / Researcher'}</option>
                <option value="Civic Tech">{language === 'mr' ? 'सिव्हिक टेक स्टार्टअप' : language === 'hi' ? 'सिविक टेक स्टार्टअप' : 'Civic Tech Startup'}</option>
              </select>
            </div>
          </div>

          {/* Submitter Name */}
          <div>
            <label htmlFor="submitter-name" className="block text-xs font-semibold text-slate-800 mb-1">
              {language === 'mr' ? 'प्रमुख प्रस्तावक किंवा चमूचे नाव' : language === 'hi' ? 'मुख्य प्रस्तावक या टीम का नाम' : 'Lead Proposer or Team Name'} <span className="text-rose-500">*</span>
            </label>
            <input
              id="submitter-name"
              type="text"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              placeholder="e.g. Pune Institute Civic Tech Club / Shreya Kulkarni"
              className="w-full text-xs sm:text-sm p-2.5 rounded border border-slate-300 focus:outline-blue-600 bg-white"
            />
            {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
          </div>

          {/* Problem Statement */}
          <div>
            <label htmlFor="problem-addressed" className="block text-xs font-semibold text-slate-800 mb-1">
              {language === 'mr' ? 'हाताळलेली नागरी समस्या' : language === 'hi' ? 'समाधित नागरिक समस्या' : 'Problem Addressed'} <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="problem-addressed"
              rows={3}
              value={problemAddressed}
              onChange={(e) => setProblemAddressed(e.target.value)}
              placeholder={language === 'mr' ? 'हा प्रस्ताव कोणत्या जुनाट नागरी किंवा पायाभूत समस्येवर मात करतो?' : language === 'hi' ? 'यह प्रस्ताव किस पुरानी नागरिक या ढांचागत समस्या का समाधान करता है?' : 'What chronic civic issue or infrastructure deficit does this proposal resolve?'}
              className="w-full text-xs sm:text-sm p-2.5 rounded border border-slate-300 focus:outline-blue-600 bg-white"
            />
            {errors.problem && <p className="text-xs text-rose-600 mt-1">{errors.problem}</p>}
          </div>

          {/* Proposed Solution */}
          <div>
            <label htmlFor="proposed-solution" className="block text-xs font-semibold text-slate-800 mb-1">
              {language === 'mr' ? 'प्रस्तावित उपाय व कार्यपद्धती' : language === 'hi' ? 'प्रस्तावित समाधान एवं कार्यप्रणाली' : 'Proposed Solution & Methodology'} <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="proposed-solution"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === 'mr' ? 'हा उपाय कसा काम करतो, आवश्यक साहित्य, तंत्रज्ञान आणि व्यवस्थापन स्पष्ट करा...' : language === 'hi' ? 'यह समाधान कैसे काम करता है, आवश्यक सामग्री, तकनीक और संचालन स्पष्ट करें...' : 'Describe how the solution functions, required materials, technology, and operations...'}
              className="w-full text-xs sm:text-sm p-2.5 rounded border border-slate-300 focus:outline-blue-600 bg-white"
            />
            {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description}</p>}
          </div>

          {/* Expected Impact */}
          <div>
            <label htmlFor="expected-impact" className="block text-xs font-semibold text-slate-800 mb-1">
              {language === 'mr' ? 'अपेक्षित सामाजिक व पर्यावरणीय प्रभाव' : language === 'hi' ? 'अपेक्षित सामाजिक एवं पर्यावरणीय प्रभाव' : 'Expected Community Impact'}
            </label>
            <textarea
              id="expected-impact"
              rows={2}
              value={expectedImpact}
              onChange={(e) => setExpectedImpact(e.target.value)}
              placeholder={language === 'mr' ? 'उदा. दररोज ४ टन सेंद्रिय कचरा प्रक्रिया होऊन ३ उपप्रभागांमधील उघड्यावर कचरा फेकणे बंद होईल.' : language === 'hi' ? 'उदा. प्रतिदिन ४ टन जैविक कचरा प्रसंस्कृत होगा जिससे ३ उप-वार्डों में कचरा फेंकना बंद होगा।' : 'e.g. Diverts 4 tons of organic garbage daily, eliminating open dumping in 3 sub-wards.'}
              className="w-full text-xs sm:text-sm p-2.5 rounded border border-slate-300 focus:outline-blue-600 bg-white"
            />
          </div>

          {/* Cost & Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cost-estimate" className="block text-xs font-semibold text-slate-800 mb-1">
                {language === 'mr' ? 'अंदाजे प्रायोगिक खर्च' : language === 'hi' ? 'अनुमानित पायलट लागत' : 'Estimated Pilot Cost'}
              </label>
              <input
                id="cost-estimate"
                type="text"
                value={costEstimate}
                onChange={(e) => setCostEstimate(e.target.value)}
                placeholder="e.g. ₹50,000"
                className="w-full text-xs sm:text-sm p-2.5 rounded border border-slate-300 focus:outline-blue-600 bg-white"
              />
            </div>

            <div>
              <label htmlFor="timeline-estimate" className="block text-xs font-semibold text-slate-800 mb-1">
                {language === 'mr' ? 'प्रायोगिक कालावधी' : language === 'hi' ? 'पायलट समयावधि' : 'Pilot Timeline'}
              </label>
              <input
                id="timeline-estimate"
                type="text"
                value={timelineEstimate}
                onChange={(e) => setTimelineEstimate(e.target.value)}
                placeholder="e.g. 45 days"
                className="w-full text-xs sm:text-sm p-2.5 rounded border border-slate-300 focus:outline-blue-600 bg-white"
              />
            </div>
          </div>

          {/* File Upload for Pitch Deck or Diagram */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              {language === 'mr' ? 'संबंधित आराखडे किंवा सादरीकरण (ऐच्छिक)' : language === 'hi' ? 'संबंधित आरेख या प्रेजेंटेशन (वैकल्पिक)' : 'Supporting Blueprints or Slide Deck (Optional)'}
            </label>
            <FileUploader
              files={files}
              onChange={setFiles}
              maxFiles={3}
              helperText={language === 'mr' ? 'आरेखन, नकाशे किंवा पीडीएफ सादरीकरण अपलोड करा.' : language === 'hi' ? 'आरेख, नक्शे या पीडीएफ प्रेजेंटेशन अपलोड करें।' : 'Upload schematics, diagrams, or PDF overview decks.'}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Link
              to="/innovations"
              className="px-4 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              {t.common.cancel}
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2 text-xs font-bold rounded bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'mr' ? 'प्रस्ताव सादर करत आहे...' : language === 'hi' ? 'प्रस्ताव जमा कर रहे हैं...' : 'Submitting Proposal...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'mr' ? 'मूल्यांकनासाठी प्रस्ताव सादर करा' : language === 'hi' ? 'मूल्यांकन हेतु प्रस्तुत करें' : 'Submit for Committee Review'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
