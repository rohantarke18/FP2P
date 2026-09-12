import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  FileText,
  Sparkles,
  Building2,
  FileCheck2,
  ShieldCheck,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { IntegratedAuthoritiesLoop } from '../components/common/IntegratedAuthoritiesLoop';

export const HowItWorksPage: React.FC = () => {
  const { t, language } = useLanguage();

  const stages = useMemo(() => [
    {
      num: language === 'mr' ? '०१' : language === 'hi' ? '01' : '01',
      title:
        language === 'mr'
          ? 'समस्या ओळख आणि पुरावे संकलन'
          : language === 'hi'
          ? 'समस्या की पहचान एवं साक्ष्य संग्रह'
          : 'Problem Identification & Evidence Capture',
      badge:
        language === 'mr' ? 'नागरिक कृती' : language === 'hi' ? 'नागरिक कार्रवाई' : 'Citizen Action',
      icon: FileText,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      description:
        language === 'mr'
          ? 'नागरिक दैनंदिन जीवनातील रस्त्यांचे खड्डे, अस्वच्छता, पाणी गळती किंवा सार्वजनिक सुरक्षिततेचे धोके ओळखतात आणि सिव्हिकब्रिजवर पुराव्यासह संरचित अहवाल नोंदवतात.'
          : language === 'hi'
          ? 'नागरिक दैनिक जीवन में सड़क के गड्ढे, स्वच्छता विफलता, जलापूर्ति रुकावट या सार्वजनिक सुरक्षा खतरों की पहचान करते हैं और सिविकब्रिज पर साक्ष्यों के साथ संरचित रिपोर्ट दर्ज करते हैं।'
          : 'A citizen identifies a road hazard, sanitation failure, water disruption, or public safety danger in their daily life. Rather than venting on social media without accountability, they log a structured report on CivicBridge.',
      highlights:
        language === 'mr'
          ? [
              'अचूक जिओ-लोकेशन पिन आणि प्रभाग टॅगिंग',
              'अनिवार्य छायाचित्रे, व्हिडिओ किंवा कागदपत्र पुरावे',
              'सामुदायिक प्रभाव आणि तातडीचे प्रमाण नोंदणी',
              'त्वरित ऑडिट करण्यायोग्य संदर्भ क्रमांक (उदा. CIV-2026-XXXXXX)',
            ]
          : language === 'hi'
          ? [
              'सटीक भू-स्थान (Geo-location) पिन और वार्ड टैगिंग',
              'अनिवार्य दृश्य साक्ष्य (तस्वीरें, वीडियो या दस्तावेज)',
              'सामुदायिक प्रभाव और तत्कालिकता की स्पष्टता',
              'तत्काल ऑडिट योग्य संदर्भ आईडी का सृजन (जैसे CIV-2026-XXXXXX)',
            ]
          : [
              'Precise geo-location pin and municipal ward tagging',
              'Mandatory visual evidence (photographs, videos, or documents)',
              'Specification of community impact scope and urgency',
              'Instant generation of an auditable tracking reference ID (e.g. CIV-2026-XXXXXX)',
            ],
    },
    {
      num: language === 'mr' ? '०२' : language === 'hi' ? '02' : '02',
      title:
        language === 'mr'
          ? 'अल्गोरिदम आधारित प्राथमिक वर्गीकरण (एआय मूल्यांकन)'
          : language === 'hi'
          ? 'एल्गोरिदमिक प्रारंभिक वर्गीकरण (AI मूल्यांकन)'
          : 'Algorithmic Preliminary Triage (AI Assessment)',
      badge:
        language === 'mr' ? 'सल्लागार प्रक्रिया' : language === 'hi' ? 'परामर्श प्रसंस्करण' : 'Advisory Processing',
      icon: Sparkles,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      description:
        language === 'mr'
          ? 'सिव्हिकब्रिजचे एआय मॉडेल समस्येचे तपशील आणि पुरावे तपासून महापालिकेच्या संबंधित विभागाकडे जलद पाठवण्यासाठी साहाय्य करते.'
          : language === 'hi'
          ? 'सिविकब्रिज का AI मॉडल समस्या के विवरण और साक्ष्यों की जांच कर निगम विभाग को त्वरित प्रेषण में सहायता करता है।'
          : 'CivicBridge runs a rule-based AI preliminary assessment that parses the report description and evidence to accelerate municipal intake.',
      highlights:
        language === 'mr'
          ? [
              'धोका आणि परिणामावर आधारित प्राधान्य गुण (० ते १००) निश्चिती',
              'योग्य नगरपालिका विभाग आणि विभागीय अभियंत्याची शिफारस',
              'एकाच परिसरातील दुबार किंवा संबंधित तक्रारींची ओळख',
              'केवळ प्रशासकीय सल्लागार म्हणून काम—अधिकृत मानवी निर्णय बदलत नाही',
            ]
          : language === 'hi'
          ? [
              'गंभीरता और प्रभाव के आधार पर प्राथमिकता स्कोर (0 से 100) की गणना',
              'उपयुक्त नगर निगम विभाग और क्षेत्रीय अभियंता का सुझाव',
              'एक ही क्षेत्र में दोहराव या क्लस्टर्ड शिकायतों की पहचान',
              'प्रारंभिक सलाह के रूप में चिह्नित—मानव प्रशासनिक निर्णय का विकल्प नहीं',
            ]
          : [
              'Calculates a priority impact score (0 to 100) based on vulnerability and hazard depth',
              'Suggests appropriate municipal department and zonal engineer',
              'Flags duplicate or clustered reports within the same geographical perimeter',
              'Distinctly marked as preliminary advice—never replaces official human administrative decisions',
            ],
    },
    {
      num: language === 'mr' ? '०३' : language === 'hi' ? '03' : '03',
      title:
        language === 'mr'
          ? 'प्रशासकीय स्वीकृती आणि SLA वाटप'
          : language === 'hi'
          ? 'प्रशासनिक स्वीकृति एवं SLA आवंटन'
          : 'Government Intake & SLA Assignment',
      badge:
        language === 'mr' ? 'प्रशासकीय कारवाई' : language === 'hi' ? 'प्रशासनिक कार्रवाई' : 'Administrative Action',
      icon: Building2,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      description:
        language === 'mr'
          ? 'नियुक्त विभाग अधिकारी तक्रारीचे पुनरावलोकन करतात आणि बंधनकारक SLA मुदतीसह क्षेत्रीय अभियंत्याकडे काम सोपवतात.'
          : language === 'hi'
          ? 'नामित विभाग अधिकारी मामले की समीक्षा करते हैं और बाध्यकारी SLA समय-सीमा के साथ क्षेत्रीय अभियंता को कार्य सौंपते हैं।'
          : 'The designated department intake officer reviews the triage docket and assigns it to a field executive engineer with a binding SLA completion deadline.',
      highlights:
        language === 'mr'
          ? [
              'अधिकारी नाव आणि कार्य आदेश संदर्भ क्रमांक निश्चिती',
              'SLA अनुपालनाचा मागोवा घेणारा सार्वजनिक उलटा गणक (Countdown)',
              'डिजिटल ऑडिट लॉगमधील अपरिवर्तनीय नोंदी',
              'प्रत्येक टप्प्यावर नागरिकाला स्वयंचलित सूचना आणि संदेश',
            ]
          : language === 'hi'
          ? [
              'नामित अधिकारी और कार्य आदेश संदर्भ संख्या का निर्धारण',
              'SLA अनुपालन को ट्रैक करने वाला सार्वजनिक उलटी गिनती टाइमर',
              'अपरिवर्तनीय नगरपालिका ऑडिट लॉग पर आंतरिक टिप्पणियाँ दर्ज',
              'प्रत्येक मील के पत्थर पर नागरिक को स्वचालित सूचनाएं प्रेषित',
            ]
          : [
              'Assigned named officer and work order reference number',
              'Public countdown timer tracking SLA compliance',
              'Internal case notes recorded on an immutable municipal audit log',
              'Automated notifications dispatched to citizen upon each milestone transition',
            ],
    },
    {
      num: language === 'mr' ? '०४' : language === 'hi' ? '04' : '04',
      title:
        language === 'mr'
          ? 'प्रत्यक्ष निवारण आणि पूर्णता पुरावा अपलोड'
          : language === 'hi'
          ? 'जमीनी निवारण एवं पूर्णता साक्ष्य अपलोड'
          : 'Field Remediation & Resolution Proof Upload',
      badge:
        language === 'mr' ? 'प्रत्यक्ष अंमलबजावणी' : language === 'hi' ? 'जमीनी निष्पादन' : 'On-Ground Execution',
      icon: FileCheck2,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      description:
        language === 'mr'
          ? 'महानगरपालिकेचे कर्मचारी दुरुस्तीचे काम पूर्ण करतात. महत्त्वाचे म्हणजे, छायाचित्र पुरावे अपलोड केल्याशिवाय काम "पूर्ण" घोषित करता येत नाही.'
          : language === 'hi'
          ? 'नगर निगम के कर्मचारी मरम्मत या सुधारात्मक कार्य करते हैं। महत्वपूर्ण बात यह है कि फोटो साक्ष्य अपलोड किए बिना मामले को "सुलझाया" नहीं माना जा सकता।'
          : 'Municipal work crews carry out the physical repair or remedial work. Crucially, the case cannot simply be marked "resolved" by decree; photographic proof must be uploaded.',
      highlights:
        language === 'mr'
          ? [
              'दुरुस्त केलेला भाग किंवा सुविधेचे प्रत्यक्ष फोटो पुरावे अपलोड',
              'अभियंता किंवा ठेकेदाराच्या अधिकृत पूर्णता नोंदी',
              'सर्वसामान्य नागरिकांना पाहण्यासाठी खुला डिजिटल दस्तऐवज',
            ]
          : language === 'hi'
          ? [
              'मरम्मत की गई सड़क या पुनर्स्थापित सुविधा की पूर्णता तस्वीरें अपलोड',
              'आधिकारिक ठेकेदार या अभियंता की पूर्णता टिप्पणियाँ',
              'जनता के लिए सुलभ टाइमस्टैम्प्ड पूर्णता डॉकेट',
            ]
          : [
              'Upload of completion photographs showing the repaired surface or restored facility',
              'Official contractor or engineer completion notes',
              'Timestamped completion docket accessible to the public',
            ],
    },
    {
      num: language === 'mr' ? '०५' : language === 'hi' ? '05' : '05',
      title:
        language === 'mr'
          ? 'नागरिक पडताळणी लॉक'
          : language === 'hi'
          ? 'नागरिक सत्यापन लॉक'
          : 'Citizen Verification Lock',
      badge:
        language === 'mr' ? 'उत्तरदायित्व प्रवेशद्वार' : language === 'hi' ? 'जवाबदेही द्वार' : 'Accountability Gate',
      icon: ShieldCheck,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      description:
        language === 'mr'
          ? 'सिव्हिकब्रिजचा मुख्य गाभा: तक्रारदार नागरिकाने प्रत्यक्ष जागेवर जाऊन काम समाधानकारक झाले आहे की नाही हे तपासल्याशिवाय प्रकरण कायमस्वरूपी बंद होत नाही.'
          : language === 'hi'
          ? 'सिविकब्रिज का मूल विचार: शिकायतकर्ता नागरिक व्यक्तिगत रूप से सत्यापित करता है कि जमीनी स्तर पर समस्या का संतोषजनक समाधान हुआ है या नहीं।'
          : 'The core innovation of CivicBridge: The reporting citizen is notified to personally verify whether the issue was satisfactorily resolved on the ground.',
      highlights:
        language === 'mr'
          ? [
              'नागरिक अपलोड केलेल्या पुराव्याची तपासणी करतात आणि जागेची पाहणी करतात',
              'एका क्लिकवर पुष्टी: "होय, समस्या सुटली" प्रकरण बंद करते',
              'आक्षेप पर्याय: "नाही, समस्या अजूनही आहे" वरिष्ठ अधिकाऱ्यांकडे फेरतपासणीसाठी पाठवते',
              'कागदावर होणारे खोटे किंवा बनावट निकाल पूर्णपणे रोखले जातात',
            ]
          : language === 'hi'
          ? [
              'नागरिक अपलोड किए गए साक्ष्य का निरीक्षण करते हैं और स्थल का दौरा करते हैं',
              'एक-क्लिक पुष्टि: "हाँ, समस्या हल हो गई है" मामले को बंद करती है',
              'आपत्ति तंत्र: "नहीं, समस्या अभी भी बनी हुई है" मामले को पुनर्निरीक्षण हेतु भेजती है',
              'प्रणाली नौकरशाही "कागजी समाधान" को रोकती है',
            ]
          : [
              'Citizen inspects uploaded completion evidence and visits the site',
              'One-click confirmation: "Yes, the issue is resolved" closes the case',
              'Dispute mechanism: "No, the issue remains unresolved" reopens the case for supervisory audit',
              'System prevents bureaucratic "ghost closures"',
            ],
    },
    {
      num: language === 'mr' ? '०६' : language === 'hi' ? '06' : '06',
      title:
        language === 'mr'
          ? 'संरचनात्मक नवनिर्मिती आणि धोरण सहभाग'
          : language === 'hi'
          ? 'प्रणालीगत नवाचार एवं नीति सहभागिता'
          : 'Systemic Innovation & Participatory Policy',
      badge:
        language === 'mr' ? 'सह-निर्मिती' : language === 'hi' ? 'सह-सृजन' : 'Co-Creation',
      icon: Lightbulb,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      description:
        language === 'mr'
          ? 'वारंवार उद्भवणाऱ्या समस्यांकडे केवळ एकट्या तक्रारी म्हणून न पाहता, त्यांच्यावर नागरी नवनिर्मिती आव्हाने आणि धोरण सल्लामसलत सुरू केली जाते.'
          : language === 'hi'
          ? 'बार-बार आने वाली शिकायतों को अलग-थलग घटनाओं के रूप में नहीं देखा जाता, बल्कि उन पर खुले सामुदायिक नवाचार और डिजिटल नीति परामर्श आयोजित होते हैं।'
          : 'Chronic, recurring grievances are not treated as isolated incidents. They are synthesized into open community challenges and digital policy consultations.',
      highlights:
        language === 'mr'
          ? [
              'नागरिक आणि तरुण नवनिर्मिती दालनातून संरचनात्मक उपाय सादर करतात',
              'तज्ज्ञ समिती उपायांची व्यवहार्यता आणि खर्चाचे मूल्यांकन करते',
              'नागरिक पालिकेच्या उपविधी आणि विकास योजनांवर थेट मते नोंदवतात',
              'प्रवास पूर्ण: तक्रारदार नागरिक → सहभागी → उपाय निर्माता → धोरण भागीदार',
            ]
          : language === 'hi'
          ? [
              'नागरिक एवं युवा नवाचार केंद्र के माध्यम से व्यावहारिक संरचनात्मक समाधान प्रस्तुत करते हैं',
              'विशेषज्ञ सलाहकार पैनल व्यवहार्यता और लागत-प्रभावशीलता पर प्रस्तावों का मूल्यांकन करते हैं',
              'नागरिक नगर निगम के प्रस्तावित उप-नियमों और विकास योजनाओं पर परामर्श में भाग लेते हैं',
              'यात्रा पूर्ण: शिकायतकर्ता नागरिक → सहभागी → समाधान निर्माता → नीति भागीदार',
            ]
          : [
              'Citizens and youth submit practical structural solutions via the Innovation Hub',
              'Expert advisory panels evaluate proposals on feasibility and cost-effectiveness',
              'Citizens participate in digital consultations on proposed municipal bylaws and master plans',
              'Completes the journey: Problem Reporter → Participant → Solution Creator → Policy Partner',
            ],
    },
  ], [language]);

  const evolutionStages = useMemo(() => [
    {
      role: language === 'mr' ? 'तक्रारदार नागरिक' : language === 'hi' ? 'समस्या रिपोर्टर' : 'Problem Reporter',
      stage: language === 'mr' ? 'टप्पा १' : language === 'hi' ? 'चरण 1' : 'Stage 1',
      desc:
        language === 'mr'
          ? 'समस्या ओळखतात आणि पुराव्यासह नोंदवतात.'
          : language === 'hi'
          ? 'खतरों की पहचान करते हैं और सत्यापित साक्ष्य प्रस्तुत करते हैं।'
          : 'Identifies hazards and submits verified evidence.',
    },
    {
      role: language === 'mr' ? 'सक्रिय सहभागी' : language === 'hi' ? 'प्रतिभागी' : 'Participant',
      stage: language === 'mr' ? 'टप्पा २' : language === 'hi' ? 'चरण 2' : 'Stage 2',
      desc:
        language === 'mr'
          ? 'SLA प्रगतीचा मागोवा घेतात आणि जागेवर जाऊन खात्री करतात.'
          : language === 'hi'
          ? 'SLA प्रगति को ट्रैक करते हैं और जमीनी पूर्णता का निरीक्षण करते हैं।'
          : 'Tracks SLA progress and inspects on-ground completion.',
    },
    {
      role: language === 'mr' ? 'उपाय निर्माता' : language === 'hi' ? 'समाधान निर्माता' : 'Solution Creator',
      stage: language === 'mr' ? 'टप्पा ३' : language === 'hi' ? 'चरण 3' : 'Stage 3',
      desc:
        language === 'mr'
          ? 'खुली नागरी नवनिर्मिती आव्हानांवर नवीन कल्पना मांडतात.'
          : language === 'hi'
          ? 'खुली नगरपालिका नवाचार चुनौतियों में समाधान प्रस्ताव प्रस्तुत करते हैं।'
          : 'Submits proposals to open municipal innovation challenges.',
    },
    {
      role: language === 'mr' ? 'धोरण भागीदार' : language === 'hi' ? 'नीति भागीदार' : 'Policy Partner',
      stage: language === 'mr' ? 'टप्पा ४' : language === 'hi' ? 'चरण 4' : 'Stage 4',
      desc:
        language === 'mr'
          ? 'मसुदा नियमावली आणि प्रभाग योजनांवर विचारविनिमय करतात.'
          : language === 'hi'
          ? 'प्रारूप उप-नियमों और ज़ोनिंग योजनाओं पर विचार-विमर्श करते हैं।'
          : 'Deliberates on draft municipal bylaws and zoning plans.',
    },
  ], [language]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Header */}
      <div className="max-w-3xl">
        <span className="text-xs uppercase font-bold tracking-wider text-blue-600">
          {language === 'mr' ? 'वास्तुशिल्प आराखडा' : language === 'hi' ? 'वास्तुकला खाका' : 'Architectural Blueprint'}
        </span>
        <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {language === 'mr'
            ? 'सिव्हिकब्रिज नागरिक आणि प्रशासनाला कसे जोडते'
            : language === 'hi'
            ? 'सिविकब्रिज नागरिकों और प्रशासन को कैसे जोड़ता है'
            : 'How CivicBridge Bridges Citizens and Administration'}
        </h1>
        <p className="mt-3 text-base text-slate-600 leading-relaxed">
          {language === 'mr'
            ? 'सिव्हिकब्रिज सार्वजनिक तक्रार निवारणाला केवळ एका अर्जापुरते मर्यादित न ठेवता, प्रत्यक्ष पुरावे आणि नागरिक पडताळणीवर आधारित एक संपूर्ण उत्तरदायी सुशासन प्रणाली बनवते.'
            : language === 'hi'
            ? 'सिविकब्रिज सार्वजनिक शिकायत निवारण को केवल एक आवेदन तक सीमित न रखकर, जमीनी साक्ष्यों और नागरिक सत्यापन पर आधारित एक संपूर्ण जवाबदेह सुशासन प्रणाली बनाता है।'
            : 'CivicBridge transforms public grievance redressal from a dead-end submission portal into a closed-loop civic governance system anchored by on-ground evidence and citizen verification.'}
        </p>
      </div>

      {/* Conceptual Journey Hierarchy */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-xl border border-slate-800">
        <h2 className="text-xs uppercase font-bold tracking-wider text-amber-400">
          {language === 'mr' ? '४-टप्प्यांची नागरी उत्क्रांती' : language === 'hi' ? '4-चरणीय नागरिक विकास' : 'The 4-Stage Civic Evolution'}
        </h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {evolutionStages.map((item) => (
            <div key={item.role} className="p-4 bg-slate-800/80 rounded-lg border border-slate-700">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">{item.stage}</span>
              <h3 className="text-sm font-bold text-white mt-1">{item.role}</h3>
              <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 6 Stage Breakdown */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900">
          {language === 'mr'
            ? 'सविस्तर ६-टप्प्यांची उत्तरदायित्व प्रक्रिया'
            : language === 'hi'
            ? 'विस्तृत 6-चरणीय जवाबदेही प्रक्रिया'
            : 'Detailed 6-Stage Accountability Lifecycle'}
        </h2>

        <div className="space-y-4">
          {stages.map((stage) => {
            return (
              <div
                key={stage.num}
                className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-mono font-bold text-slate-700 shrink-0">
                      {stage.num}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900">{stage.title}</h3>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${stage.color}`}>
                          {stage.badge}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-3xl">
                        {stage.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {stage.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Integrated Municipal Authorities Marquee */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <IntegratedAuthoritiesLoop speed={35} showHeading={true} />
      </div>

      {/* CTA Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-blue-950">
            {language === 'mr'
              ? 'नागरी पुढाकार घेण्यास तयार आहात का?'
              : language === 'hi'
              ? 'नागरिक कार्रवाई के लिए तैयार हैं?'
              : 'Ready to take civic action?'}
          </h3>
          <p className="text-xs sm:text-sm text-blue-800 mt-1">
            {language === 'mr'
              ? 'आत्ताच समस्या नोंदवा आणि प्रत्यक्ष पडताळणीसह मागोवा घ्या.'
              : language === 'hi'
              ? 'अभी समस्या दर्ज करें और सत्यापित समाधान ट्रैक करें।'
              : 'Report a community issue now and track its verified resolution.'}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/report"
            className="px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
          >
            {t.nav.reportProblem}
          </Link>
          <Link
            to="/track"
            className="px-4 py-2.5 rounded-md bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-xs"
          >
            {t.nav.trackProblem}
          </Link>
        </div>
      </div>
    </div>
  );
};
