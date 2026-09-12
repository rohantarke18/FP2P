import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { complaintService } from '../services/complaintService';
import { Problem, ProblemCategory, PriorityLevel, ImpactScope, EvidenceItem } from '../types';
import { FileUploader } from '../components/common/FileUploader';
import { GoogleMapPicker } from '../components/common/GoogleMapPicker';
import { AiAssessmentCard } from '../components/common/AiAssessmentCard';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import Stepper, { Step } from '../components/common/Stepper';
import { getLocalizedCategory } from '../utils/localizedData';
import {
  FileText,
  MapPin,
  UploadCloud,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  ShieldCheck,
  Building2,
  Calendar,
  Loader2,
} from 'lucide-react';

const CATEGORIES: ProblemCategory[] = [
  'Roads & Infrastructure',
  'Water & Drainage',
  'Sanitation & Solid Waste',
  'Public Transport & Traffic',
  'Education & Facilities',
  'Healthcare & Sanitation',
  'Public Safety & Streetlighting',
  'Environment & Green Spaces',
  'Civic & Revenue Services',
  'Other Civic Issues',
];

export const ReportPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<Problem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProblemCategory>('Roads & Infrastructure');
  const [description, setDescription] = useState('');

  // Location State
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [ward, setWard] = useState('Ward 8 (CIDCO / Kranti Chowk)');
  const [city, setCity] = useState('Chhatrapati Sambhajinagar');
  const [district, setDistrict] = useState('Chhatrapati Sambhajinagar');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('431001');
  const [coords, setCoords] = useState({ lat: 19.8753, lng: 75.3433 });

  // Evidence State
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);

  // Impact & Urgency State
  const [impactScope, setImpactScope] = useState<ImpactScope>('My neighbourhood');
  const [urgency, setUrgency] = useState<PriorityLevel>('High');

  // Step Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!title.trim() || title.trim().length < 8) {
        errs.title = 'Please provide a descriptive problem title (minimum 8 characters).';
      }
      if (!description.trim() || description.trim().length < 20) {
        errs.description = 'Please explain the issue in detail (minimum 20 characters).';
      }
    }

    if (step === 2) {
      if (!address.trim()) {
        errs.address = 'Street address or landmark is required for municipal dispatch.';
      }
      if (!ward.trim()) {
        errs.ward = 'Ward locality is required.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const payload: Partial<Problem> = {
        title,
        category,
        description,
        location: {
          address: address || 'Chhatrapati Sambhajinagar',
          landmark: landmark || '',
          ward: ward || 'Ward 8 (CIDCO / Kranti Chowk)',
          city: city || 'Chhatrapati Sambhajinagar',
          district: district || 'Chhatrapati Sambhajinagar',
          state: state || 'Maharashtra',
          pincode: pincode || '431001',
          coordinates: coords,
        },
        evidence: evidence || [],
        impactScope,
        urgency,
        citizenName: user?.name || 'Citizen User',
        citizenPhone: user?.phone || '+91 98201 23454',
        reporterUid: user?.id || '',
        reporterEmail: user?.email || '',
      };

      const result = await complaintService.submitComplaint(payload);
      setSubmittedResult(result);
      showToast('success', 'Report Logged', `Case reference generated: ${result.id}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      showToast('error', 'Submission Failed', err.message || 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already submitted, show official reference receipt card
  if (submittedResult) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {t.report.successTitle}
          </span>

          <h1 className="text-2xl font-bold text-slate-900 mt-4">
            Official Case Docket Generated
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto">
            {t.report.successLead}
          </p>

          {/* Reference Card */}
          <div className="my-6 p-5 bg-slate-50 border border-slate-200 rounded-lg text-left max-w-md mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">{t.report.successRef}</span>
              <span className="text-base font-mono font-bold text-blue-700 bg-white px-2.5 py-1 rounded border border-blue-200">
                {submittedResult.id}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Suggested Dept:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[200px]" title={submittedResult.department}>
                {submittedResult.department}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Initial Priority:</span>
              <PriorityBadge priority={submittedResult.priority} size="sm" />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Current Status:</span>
              <StatusBadge status={submittedResult.status} size="sm" />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Target Action Deadline:</span>
              <span className="font-medium text-slate-700">
                {new Date(submittedResult.deadline).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Preliminary AI Assessment */}
          <div className="text-left my-6 max-w-lg mx-auto">
            <AiAssessmentCard assessment={submittedResult.aiAssessment} compact />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100">
            <Link
              to={`/track?id=${submittedResult.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs"
            >
              <span>{t.report.trackNow}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold"
            >
              <span>{t.report.goToDashboard}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs uppercase font-bold tracking-wider text-blue-600">
          Official Redressal Form
        </span>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.report.pageTitle}
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
          {t.report.pageSubtitle}
        </p>
      </div>

      {/* React Bits Animated Stepper */}
      <Stepper
        currentStep={currentStep}
        onStepChange={(step) => {
          setCurrentStep(step);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        beforeStepChange={(from, to) => {
          if (to > from) {
            return validateStep(from);
          }
          return true;
        }}
        onFinalStepCompleted={handleSubmit}
        stepTitles={[
          t.report.step1Title,
          t.report.step2Title,
          t.report.step3Title,
          t.report.step4Title,
          t.report.step5Title,
        ]}
        stepCircleContainerClassName="border border-slate-200 bg-white rounded-xl shadow-xs"
        contentClassName="bg-white"
        footerClassName="bg-white border-t border-slate-100"
        renderFooter={({ currentStep: stepIdx, isLastStep, handleBack: onBack, handleNext: onNext }) => (
          <div className="flex items-center justify-between w-full">
            {stepIdx > 1 ? (
              <button
                type="button"
                onClick={() => {
                  onBack();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.report.prevBtn}</span>
              </button>
            ) : (
              <div />
            )}

            {!isLastStep ? (
              <button
                type="button"
                onClick={() => {
                  if (validateStep(stepIdx)) {
                    onNext();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer transition-colors"
              >
                <span>{t.report.nextBtn}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.report.submittingButton}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.report.submitButton}</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      >
        {/* ================= STEP 1: Describe the problem ================= */}
        <Step>
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Step 1: {t.report.step1Title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Provide clear, factual details to assist municipal engineers in assessing the issue.
              </p>
            </div>

            <div>
              <label htmlFor="problem-title" className="block text-xs font-semibold text-slate-800 mb-1">
                {t.report.fieldTitle} <span className="text-rose-500">*</span>
              </label>
              <input
                id="problem-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.report.fieldTitlePlaceholder}
                className="w-full text-xs sm:text-sm p-2.5 rounded border border-slate-300 focus:outline-blue-600 bg-white"
              />
              {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="problem-category" className="block text-xs font-semibold text-slate-800 mb-1">
                {t.report.fieldCategory} <span className="text-rose-500">*</span>
              </label>
              <select
                id="problem-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProblemCategory)}
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
              <label htmlFor="problem-description" className="block text-xs font-semibold text-slate-800 mb-1">
                {t.report.fieldDesc} <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="problem-description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.report.fieldDescPlaceholder}
                className="w-full text-xs sm:text-sm p-2.5 rounded border border-slate-300 focus:outline-blue-600 bg-white leading-relaxed"
              />
              {errors.description && (
                <p className="text-xs text-rose-600 mt-1">{errors.description}</p>
              )}
            </div>
          </div>
        </Step>

        {/* ================= STEP 2: Location ================= */}
        <Step>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wide">
                  Location Detection
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Step 2: {t.report.step2Title}
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Click anywhere on the map or drag the blue pin to the exact problem spot. The address fields below will automatically fill in.
              </p>
            </div>

            {/* Interactive Map Component with Draggable Marker */}
            <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Interactive Map & Pin Locator</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  Drag pin or click map to move marker
                </span>
              </div>

              <GoogleMapPicker
                coordinates={coords}
                onCoordinatesChange={setCoords}
                addressLabel={`${address || 'Chhatrapati Sambhajinagar'}, ${ward}`}
                wardName={ward}
                height="380px"
                onAddressDetected={(detectedAddr, detectedWard, extra) => {
                  if (detectedAddr) setAddress(detectedAddr);
                  if (detectedWard) setWard(detectedWard);
                  if (extra?.landmark) setLandmark(extra.landmark);
                  if (extra?.city) setCity(extra.city);
                  if (extra?.district) setDistrict(extra.district);
                  if (extra?.state) setState(extra.state);
                  if (extra?.pincode) setPincode(extra.pincode);
                }}
              />
            </div>

            {/* Auto-filled Input Fields */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Verified Address Details (Auto-Filled from Map Pin)
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 italic">
                  Review & edit if necessary
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="field-address" className="block text-xs font-semibold text-slate-800 mb-1">
                    {t.report.fieldAddress} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="field-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t.report.fieldAddressPlaceholder}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-blue-600 bg-white shadow-2xs"
                  />
                  {errors.address && <p className="text-xs text-rose-600 mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label htmlFor="field-landmark" className="block text-xs font-semibold text-slate-800 mb-1">
                    Nearby Landmark / Reference
                  </label>
                  <input
                    id="field-landmark"
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Kranti Chowk flyover, Opp. City Hospital"
                    className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-blue-600 bg-white shadow-2xs"
                  />
                </div>

                <div>
                  <label htmlFor="field-ward" className="block text-xs font-semibold text-slate-800 mb-1">
                    {t.report.fieldWard} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="field-ward"
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder={t.report.fieldWardPlaceholder}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-blue-600 bg-white shadow-2xs"
                  />
                  {errors.ward && <p className="text-xs text-rose-600 mt-1">{errors.ward}</p>}
                </div>

                <div>
                  <label htmlFor="field-city" className="block text-xs font-semibold text-slate-800 mb-1">
                    {t.report.fieldCity}
                  </label>
                  <input
                    id="field-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-blue-600 bg-white shadow-2xs"
                  />
                </div>

                <div>
                  <label htmlFor="field-district" className="block text-xs font-semibold text-slate-800 mb-1">
                    {t.report.fieldDistrict}
                  </label>
                  <input
                    id="field-district"
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-blue-600 bg-white shadow-2xs"
                  />
                </div>

                <div>
                  <label htmlFor="field-pincode" className="block text-xs font-semibold text-slate-800 mb-1">
                    {t.report.fieldPincode}
                  </label>
                  <input
                    id="field-pincode"
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-blue-600 bg-white shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </Step>

        {/* ================= STEP 3: Evidence ================= */}
        <Step>
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Step 3: {t.report.step3Title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {t.report.evidenceDesc}
              </p>
            </div>

            <FileUploader
              files={evidence}
              onChange={setEvidence}
              maxFiles={5}
              helperText="Attach photos or video clips of the affected site. Clear evidence accelerates department inspection."
            />

            <div className="p-3.5 bg-blue-50/60 rounded border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Evidence Integrity Note:</span> Photographic evidence is timestamped and attached to the public case record. Later, municipal engineers must submit corresponding completion photos to verify remediation.
              </div>
            </div>
          </div>
        </Step>

        {/* ================= STEP 4: Impact & Urgency ================= */}
        <Step>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Step 4: {t.report.step4Title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Help triage officers prioritize resources based on safety risks and affected population.
              </p>
            </div>

            {/* Impact Scope */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                {t.report.impactQuestion}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['Me', 'My neighbourhood', 'Large community', 'Multiple areas'] as ImpactScope[]).map((scope) => (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => setImpactScope(scope)}
                    className={`p-3 rounded border text-xs font-medium text-left transition-all cursor-pointer ${
                      impactScope === scope
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {scope}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                {t.report.urgencyQuestion}
              </label>
              <p className="text-xs text-slate-500 mb-3">{t.report.urgencyHint}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['Low', 'Medium', 'High', 'Critical'] as PriorityLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setUrgency(lvl)}
                    className={`p-3 rounded border text-xs font-medium text-left transition-all cursor-pointer ${
                      urgency === lvl
                        ? lvl === 'Critical'
                          ? 'border-rose-600 bg-rose-50 text-rose-900 font-bold shadow-2xs'
                          : 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{lvl}</span>
                      <PriorityBadge priority={lvl} size="sm" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Step>

        {/* ================= STEP 5: Review & Submit ================= */}
        <Step>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Step 5: {t.report.step5Title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {t.report.reviewHeading}
              </p>
            </div>

            {/* Summary Details */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-semibold text-slate-800 text-sm">{title}</span>
                <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-mono text-[11px]">
                  {category}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-medium block">Description:</span>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-400">Location:</span>
                  <p className="text-slate-800 font-medium">{address}, {ward}, {city} - {pincode}</p>
                </div>
                <div>
                  <span className="text-slate-400">Impact & Urgency:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-medium text-slate-800">{impactScope}</span>
                    <span>•</span>
                    <PriorityBadge priority={urgency} size="sm" />
                  </div>
                </div>
              </div>

              {evidence.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400">Attached Evidence ({evidence.length} files):</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {evidence.map((f) => (
                      <span key={f.id} className="bg-white border border-slate-200 px-2 py-1 rounded text-[11px] text-slate-700">
                        📎 {f.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Assessment Preview Component */}
            <AiAssessmentCard
              assessment={{
                category,
                suggestedDepartment: 'Municipal Road Maintenance & Civil Infrastructure',
                suggestedPriority: urgency,
                priorityScore: urgency === 'Critical' ? 92 : urgency === 'High' ? 84 : 60,
                reasoning: [
                  `Algorithmic analysis mapped keywords in "${title}" to category "${category}"`,
                  `Reported impact scope: "${impactScope}" with urgency rating "${urgency}"`,
                  `${evidence.length} evidence attachment(s) verified for automated preliminary intake`,
                ],
                keyIdentifiedEntities: [category, ward, city],
                isPreliminary: true,
                generatedAt: new Date().toISOString(),
              }}
            />

            <p className="text-[11px] text-slate-500 leading-relaxed">
              {t.report.reviewDisclaimer}
            </p>
          </div>
        </Step>
      </Stepper>
    </div>
  );
};
