import { Problem, Innovation, Consultation, Language } from '../types';

export interface LocalizedProblemText {
  title: string;
  description: string;
  address?: string;
  landmark?: string;
  ward?: string;
  department?: string;
  resolutionNotes?: string;
  timelineNotes?: Record<string, string>;
  reasoning?: string[];
  keyIdentifiedEntities?: string[];
}

export const CATEGORY_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'Roads & Infrastructure': {
    en: 'Roads & Infrastructure',
    mr: 'रस्ते आणि पायाभूत सुविधा',
    hi: 'सड़क एवं बुनियादी ढांचा',
  },
  'Sanitation & Solid Waste': {
    en: 'Sanitation & Solid Waste',
    mr: 'स्वच्छता आणि घनकचरा व्यवस्थापन',
    hi: 'स्वच्छता एवं ठोस अपशिष्ट प्रबंधन',
  },
  'Garbage & Sanitation': {
    en: 'Garbage & Sanitation',
    mr: 'कचरा आणि स्वच्छता व्यवस्थापन',
    hi: 'कचरा एवं स्वच्छता प्रबंधन',
  },
  'Water & Drainage': {
    en: 'Water & Drainage',
    mr: 'पाणीपुरवठा आणि जलनिस्सारण',
    hi: 'जल आपूर्ति एवं जल निकासी',
  },
  'Water Supply & Sewage': {
    en: 'Water Supply & Sewage',
    mr: 'पाणीपुरवठा आणि मलनिस्सारण',
    hi: 'जल आपूर्ति एवं सीवरेज',
  },
  'Electricity & Streetlights': {
    en: 'Electricity & Streetlights',
    mr: 'वीज आणि पथदिवे',
    hi: 'विद्युत एवं स्ट्रीटलाइट्स',
  },
  'Public Safety & Streetlighting': {
    en: 'Public Safety & Streetlighting',
    mr: 'सार्वजनिक सुरक्षा आणि पथदिवे',
    hi: 'सार्वजनिक सुरक्षा एवं स्ट्रीट लाइटिंग',
  },
  'Public Safety & Encroachment': {
    en: 'Public Safety & Encroachment',
    mr: 'सार्वजनिक सुरक्षा आणि अतिक्रमण',
    hi: 'सार्वजनिक सुरक्षा एवं अतिक्रमण',
  },
  'Environment & Green Spaces': {
    en: 'Environment & Green Spaces',
    mr: 'पर्यावरण आणि हरित उद्याने',
    hi: 'पर्यावरण एवं हरित स्थल',
  },
  'Parks & Environment': {
    en: 'Parks & Environment',
    mr: 'उद्याने आणि पर्यावरण',
    hi: 'पार्क एवं पर्यावरण',
  },
  'Public Transport': {
    en: 'Public Transport',
    mr: 'सार्वजनिक वाहतूक',
    hi: 'सार्वजनिक परिवहन',
  },
  'Drainage & Stormwater': {
    en: 'Drainage & Stormwater',
    mr: 'पावसाळी गटारे आणि नाले',
    hi: 'नाली एवं जल निकासी',
  },
  'Other Civic Issues': {
    en: 'Other Civic Issues',
    mr: 'इतर नागरी समस्या',
    hi: 'अन्य नागरिक समस्याएं',
  },
  'Waste Management': {
    en: 'Waste Management',
    mr: 'कचरा व्यवस्थापन',
    hi: 'अपशिष्ट प्रबंधन',
  },
  'Traffic & Mobility': {
    en: 'Traffic & Mobility',
    mr: 'वाहतूक आणि गतिशीलता',
    hi: 'यातायात एवं गतिशीलता',
  },
  'Water Conservation': {
    en: 'Water Conservation',
    mr: 'जलसंधारण',
    hi: 'जल संरक्षण',
  },
  'Digital Governance': {
    en: 'Digital Governance',
    mr: 'डिजिटल प्रशासन',
    hi: 'डिजिटल शासन',
  },
  'Green Urban Spaces': {
    en: 'Green Urban Spaces',
    mr: 'शहरी हरित क्षेत्र',
    hi: 'शहरी हरित स्थल',
  },
};

export const DEPARTMENT_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'Municipal Road Maintenance & Civil Infrastructure': {
    en: 'Municipal Road Maintenance & Civil Infrastructure',
    mr: 'महानगरपालिका रस्ते देखभाल व नागरी पायाभूत सुविधा विभाग',
    hi: 'नगर निगम सड़क रखरखाव एवं नागरिक अवसंरचना विभाग',
  },
  'Solid Waste Management & Public Health Department': {
    en: 'Solid Waste Management & Public Health Department',
    mr: 'घनकचरा व्यवस्थापन व सार्वजनिक आरोग्य विभाग',
    hi: 'ठोस अपशिष्ट प्रबंधन एवं सार्वजनिक स्वास्थ्य विभाग',
  },
  'Electrical & Street Lighting Department': {
    en: 'Electrical & Street Lighting Department',
    mr: 'विद्युत व पथदिवे विभाग',
    hi: 'विद्युत एवं स्ट्रीट लाइटिंग विभाग',
  },
  'Municipal Electrical Works & Street Lighting Division': {
    en: 'Municipal Electrical Works & Street Lighting Division',
    mr: 'महानगरपालिका विद्युत व पथदिवे विभाग',
    hi: 'नगर निगम विद्युत एवं स्ट्रीट लाइटिंग डिवीजन',
  },
  'Water Supply & Sewerage Undertaking': {
    en: 'Water Supply & Sewerage Undertaking',
    mr: 'पाणीपुरवठा व मलनिस्सारण मंडळ',
    hi: 'जल आपूर्ति एवं सीवरेज बोर्ड',
  },
  'Water Supply, Hydraulic & Sewerage Board': {
    en: 'Water Supply, Hydraulic & Sewerage Board',
    mr: 'पाणीपुरवठा, जलअभियांत्रिकी व मलनिस्सारण मंडळ',
    hi: 'जल आपूर्ति, हाइड्रोलिक एवं सीवरेज बोर्ड',
  },
  'Garden & Public Parks Department': {
    en: 'Garden & Public Parks Department',
    mr: 'उद्यान व सार्वजनिक बागबगीचे विभाग',
    hi: 'उद्यान एवं सार्वजनिक पार्क विभाग',
  },
  'Parks, Gardens & Urban Forestry Division': {
    en: 'Parks, Gardens & Urban Forestry Division',
    mr: 'उद्यान, बागबगीचे व शहरी वनीकरण विभाग',
    hi: 'पार्क, उद्यान एवं शहरी वानिकी प्रभाग',
  },
  'Town Planning & Anti-Encroachment Wing': {
    en: 'Town Planning & Anti-Encroachment Wing',
    mr: 'नगररचना व अतिक्रमण विरोधी पथक',
    hi: 'नगर नियोजन एवं अतिक्रमण विरोधी प्रभाग',
  },
  'Drainage, Canal & Storm Water Maintenance': {
    en: 'Drainage, Canal & Storm Water Maintenance',
    mr: 'पावसाळी गटार व जलनिस्सारण देखभाल विभाग',
    hi: 'जल निकासी, नहर एवं स्टॉर्म वाटर रखरखाव विभाग',
  },
};

export const WARD_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'Ward 14 (Shivajinagar)': {
    en: 'Ward 14 (Shivajinagar)',
    mr: 'प्रभाग १४ (शिवाजीनगर)',
    hi: 'वार्ड १४ (शिवाजीनगर)',
  },
  'Ward 12 (Central)': {
    en: 'Ward 12 (Central)',
    mr: 'प्रभाग १२ (मध्यवर्ती)',
    hi: 'वार्ड १२ (मध्यवर्ती)',
  },
  'Ward 21': {
    en: 'Ward 21 (Swargate)',
    mr: 'प्रभाग २१ (स्वारगेट)',
    hi: 'वार्ड २१ (स्वारगेट)',
  },
  'Ward 08': {
    en: 'Ward 08 (Kothrud / Viman Nagar)',
    mr: 'प्रभाग ०८ (कोथरूड / विमान नगर)',
    hi: 'वार्ड ०८ (कोथरूड / विमान नगर)',
  },
  'Ward 08 (Viman Nagar)': {
    en: 'Ward 08 (Viman Nagar)',
    mr: 'प्रभाग ०८ (विमान नगर)',
    hi: 'वार्ड ०८ (विमान नगर)',
  },
  'Ward 19': {
    en: 'Ward 19 (Sadashiv Peth)',
    mr: 'प्रभाग १९ (सदाशिव पेठ)',
    hi: 'वार्ड १९ (सदाशिव पेठ)',
  },
  'Ward 15': {
    en: 'Ward 15 (Tilak Road)',
    mr: 'प्रभाग १५ (टिळक रोड)',
    hi: 'वार्ड १५ (तिलक रोड)',
  },
  'Ward 22 (Kothrud)': {
    en: 'Ward 22 (Kothrud)',
    mr: 'प्रभाग २२ (कोथरूड)',
    hi: 'वार्ड २२ (कोथरूड)',
  },
  'Ward 31 (Hadapsar)': {
    en: 'Ward 31 (Hadapsar)',
    mr: 'प्रभाग ३१ (हडपसर)',
    hi: 'वार्ड ३१ (हडपसर)',
  },
  'All Wards': {
    en: 'All Municipal Wards',
    mr: 'सर्व प्रभाग',
    hi: 'सभी नगर निगम वार्ड',
  },
};

export const STAGE_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'Idea Proposal': {
    en: 'Idea Proposal',
    mr: 'संकल्पना प्रस्ताव',
    hi: 'विचार प्रस्ताव',
  },
  'Under Review': {
    en: 'Under Review',
    mr: 'पुनरावलोकन सुरू',
    hi: 'समीक्षाधीन',
  },
  'Community Voting': {
    en: 'Community Voting',
    mr: 'नागरिक मतदान',
    hi: 'सामुदायिक मतदान',
  },
  'Pilot Approved': {
    en: 'Pilot Approved',
    mr: 'प्रायोगिक मंजुरी',
    hi: 'पायलट स्वीकृत',
  },
  'Implemented': {
    en: 'Implemented',
    mr: 'अंमलबजावणी पूर्ण',
    hi: 'कार्यान्वित',
  },
  'Active': {
    en: 'Active',
    mr: 'सक्रिय',
    hi: 'सक्रिय',
  },
  'Under Deliberation': {
    en: 'Under Deliberation',
    mr: 'विचारविनिमय सुरू',
    hi: 'विचाराधीन',
  },
  'Concluded': {
    en: 'Concluded',
    mr: 'निष्कर्ष पूर्ण',
    hi: 'संपन्न',
  },
  'Draft': {
    en: 'Draft',
    mr: 'मसुदा',
    hi: 'प्रारूप',
  },
};

export const PROBLEM_LOCALIZATION_DATA: Record<string, Record<'mr' | 'hi', LocalizedProblemText>> = {
  'CIV-2026-001024': {
    mr: {
      title: 'विद्यापीठ मुख्य प्रवेशद्वाराजवळ सातत्याने होणारा खड्ड्यांचा धोका',
      description:
        'विद्यापीठाच्या उत्तर प्रवेशद्वारासमोरील थेट बस आणि दुचाकी लेनवर १.५ मीटर रुंद पसरलेले खोल खड्डे. पावसामुळे खड्ड्यांची खोली दिसत नसल्याने दुचाकी घसरण्याचे अपघात आणि गर्दीच्या वेळी पादचाऱ्यांची मोठी गैरसोय होत आहे.',
      address: 'विद्यापीठ रस्ता, गेट क्र. २, मध्यवर्ती ग्रंथालय चौकासमोर',
      landmark: 'विद्यापीठ उत्तर प्रवेशद्वार',
      ward: 'प्रभाग १४ (शिवाजीनगर)',
      department: 'महानगरपालिका रस्ते देखभाल व नागरी पायाभूत सुविधा विभाग',
      resolutionNotes:
        'रस्त्यावरील खड्डे खोदून खडी व डांबरीकरण (WMM आणि डांबरी काँक्रीट) लेप देऊन समतलीकरण पूर्ण करण्यात आले आहे. वाहतुकीसाठी रस्ता पूर्ववत सुरळीत करण्यात आला आहे.',
      reasoning: [
        'सखल रस्त्यावरील खड्डे दुचाकी आणि सार्वजनिक बस वाहतुकीसाठी थेट अपघाताचा धोका ठरत आहेत',
        'पावसाचे पाणी साचल्यामुळे खड्ड्यांची खोली वाहनचालकांना समजत नाही',
        'विद्यापीठ परिसरात विद्यार्थी आणि प्राध्यापकांची मोठी पादचारी वर्दळ',
      ],
      keyIdentifiedEntities: ['रस्त्यावरील खड्डे', 'अपघाताचा धोका', 'विद्यापीठ रस्ता', 'पावसाळी पाणी साचणे'],
    },
    hi: {
      title: 'विश्वविद्यालय मुख्य द्वार के पास लगातार बना हुआ गड्ढों का खतरा',
      description:
        'विश्वविद्यालय के उत्तर द्वार के सामने बस और दोपहिया लेन में 1.5 मीटर चौड़े गहरे गड्ढे। बारिश के दौरान पानी भरने से गड्ढों की गहराई छिप जाती है, जिससे वाहन फिसलने की घटनाएं और व्यस्त समय में जाम लग रहा है।',
      address: 'विश्वविद्यालय मार्ग, गेट नंबर 2, सेंट्रल लाइब्रेरी चौक के सामने',
      landmark: 'विश्वविद्यालय उत्तर गेट',
      ward: 'वार्ड १४ (शिवाजीनगर)',
      department: 'नगर निगम सड़क रखरखाव एवं नागरिक अवसंरचना विभाग',
      resolutionNotes:
        'सड़क के गड्ढों को खोदकर गिट्टी और डामरीकरण (WMM और डामरीकृत कंक्रीट) की परत से समतल कर दिया गया है। यातायात सामान्य रूप से बहाल कर दिया गया है।',
      reasoning: [
        'निचले हिस्से में गहरे गड्ढे दोपहिया वाहनों और बसों के लिए सीधा दुर्घटना जोखिम उत्पन्न कर रहे हैं',
        'जलभराव के कारण गड्ढों की गहराई दिखाई नहीं दे रही है',
        'विश्वविद्यालय क्षेत्र में छात्रों और नागरिकों की भारी आवाजाही',
      ],
      keyIdentifiedEntities: ['सड़क के गड्ढे', 'दुर्घटना जोखिम', 'विश्वविद्यालय मार्ग', 'जलभराव'],
    },
  },
  'CIV-2026-001089': {
    mr: {
      title: 'प्रभाग १२ बाजारातील गल्लीत कचरा कुंडी तुडुंब भरून सांडणे',
      description:
        'भाजी मार्केट चौकातील सार्वजनिक कचरा कुंडी मागील चार दिवसांपासून रिकामी केलेली नाही. कचरा पदपथावर पसरत असून तीव्र दुर्गंधी सुटली आहे आणि पावसाळी नाल्यांचे तोंड तुंबले आहे.',
      address: 'दुकान क्र. ४२, सुभाष चौक भाजी मंडई, प्रभाग १२',
      landmark: 'जुने पोस्ट ऑफिस मागे',
      ward: 'प्रभाग १२ (मध्यवर्ती)',
      department: 'घनकचरा व्यवस्थापन व सार्वजनिक आरोग्य विभाग',
      reasoning: [
        'भाजी विक्रेत्यांच्या परिसरात सेंद्रिय कचरा साचल्याने सार्वजनिक आरोग्यास गंभीर धोका',
        'पावसापूर्वी गटार तुंबण्याची शक्यता आणि साथीच्या आजारांचा संसर्ग धोका',
      ],
      keyIdentifiedEntities: ['कचरा कुंडी', 'भाजी मार्केट', 'दुर्गंधी', 'सार्वजनिक आरोग्य'],
    },
    hi: {
      title: 'वार्ड 12 बाजार की गली में कचरा पात्र का भर जाना और फैलना',
      description:
        'सब्जी मंडी चौक पर सार्वजनिक कचरा पात्र चार दिनों से साफ नहीं हुआ है। कचरा पैदल मार्ग पर फैल रहा है, तीव्र दुर्गंध आ रही है और नाली का मुहाना अवरुद्ध हो रहा है।',
      address: 'दुकान नं. 42, सुभाष चौक सब्जी मंडी, वार्ड 12',
      landmark: 'पुराने पोस्ट ऑफिस के पीछे',
      ward: 'वार्ड १२ (मध्यवर्ती)',
      department: 'ठोस अपशिष्ट प्रबंधन एवं सार्वजनिक स्वास्थ्य विभाग',
      reasoning: [
        'सब्जी बाजार में जैविक कचरा जमा होने से संक्रामक रोगों का खतरा',
        'बारिश से पहले नाली अवरुद्ध होने की गंभीर स्थिति',
      ],
      keyIdentifiedEntities: ['कचरा डिब्बा', 'सब्जी मंडी', 'दुर्गंध', 'जन स्वास्थ्य'],
    },
  },
  'CIV-2026-000955': {
    mr: {
      title: 'बस टर्मिनलला जोडणाऱ्या रस्त्यावरील बंद पडलेले पथदिवे',
      description:
        'सलग ८ एलईडी पथदिव्यांचे खांब (खांब #ST-40 ते #ST-48) गेल्या आठवड्यापासून बंद आहेत. रात्रीच्या वेळी येणाऱ्या महिला प्रवाशांसाठी हा मार्ग अंधारामुळे अत्यंत असुरक्षित बनला आहे.',
      address: 'स्वारगेट टर्मिनल जोड रस्ता, सब-वे बाहेर ते रिक्षा स्टँड',
      ward: 'प्रभाग २१ (स्वारगेट)',
      department: 'विद्युत व पथदिवे विभाग',
      resolutionNotes:
        'भूमिगत फीडर केबलमधील बिघाड शोधून दुरुस्त केला आणि ६ सदोष एलईडी दिवे बदलले. संपूर्ण रस्त्यावरील प्रकाशव्यवस्था पूर्ववत सुरू झाली आहे.',
      reasoning: [
        'रात्रीच्या वेळी बस टर्मिनलवरून जाणाऱ्या महिला प्रवाशांसाठी अंधारामुळे सुरक्षेचा मोठा धोका',
        'सलग ८ पथदिव्यांची मालिका बंद असल्याने संपूर्ण मार्ग पूर्ण अंधारात',
      ],
      keyIdentifiedEntities: ['बस टर्मिनल', 'पथदिवे बिघाड', 'महिला सुरक्षा', 'रात्रीची वर्दळ'],
    },
    hi: {
      title: 'बस टर्मिनल को जोड़ने वाली सड़क पर बंद पड़ी स्ट्रीट लाइट्स',
      description:
        'लगातार 8 एलईडी स्ट्रीट लाइट पोल (#ST-40 से #ST-48) एक सप्ताह से बंद हैं। इससे रात में अंतरराज्यीय बसों से आने वाली महिला यात्रियों के लिए सुरक्षा जोखिम बना हुआ है।',
      address: 'स्वारगेट टर्मिनल पहुंच मार्ग, सब-वे निकास से ऑटो स्टैंड',
      ward: 'वार्ड २१ (स्वारगेट)',
      department: 'विद्युत एवं स्ट्रीट लाइटिंग विभाग',
      resolutionNotes:
        'भूमिगत फीडर केबल की मरम्मत की गई और 6 खराब एलईडी लाइटें बदली गईं। पूरे मार्ग पर रोशनी बहाल कर दी गई है।',
      reasoning: [
        'रात में अकेले चलने वाली महिला यात्रियों के लिए सुरक्षा चिंता',
        'लगातार 8 खंभों पर लाइट न जलने से गहरा अंधेरा',
      ],
      keyIdentifiedEntities: ['बस टर्मिनल', 'स्ट्रीट लाइट विफलता', 'सार्वजनिक सुरक्षा', 'रात्रि आवागमन'],
    },
  },
  'CIV-2026-001150': {
    mr: {
      title: 'सेक्टर ४ हाऊसिंग कॉलनीमध्ये पिण्याच्या पाण्याच्या दाबात तीव्र अडथळा',
      description:
        '१२ निवासी इमारतींमधील रहिवाशांना सकाळी ६ ते ८ च्या पुरवठा वेळेत अत्यंत कमी किंवा शून्य दाबाने पाणी मिळत आहे. तीन दिवसांपासून कुटुंबांना खाजगी पाण्याच्या टँकरवर अवलंबून राहावे लागत आहे.',
      address: 'पाण्याच्या टाकीजवळ, सेक्टर ४, कोथरूड',
      ward: 'प्रभाग ०८ (कोथरूड)',
      department: 'पाणीपुरवठा व मलनिस्सारण मंडळ',
      reasoning: [
        'निवासी वस्तीमध्ये पिण्याच्या पाण्याच्या पुरवठ्यात अचानक मोठा खंड',
        'खाजगी टँकर लॉबीकडून नागरिकांची आर्थिक पिळवणूक होण्याची शक्यता',
        'मुख्य पाइपलाइनमधील एअर-लॉक किंवा बूस्टर व्हॉल्व्ह बिघाडाचा संशय',
      ],
      keyIdentifiedEntities: ['पिण्याचे पाणी', 'कमी दाब', 'सेक्टर ४', 'अत्यावश्यक सेवा'],
    },
    hi: {
      title: 'सेक्टर 4 हाउसिंग कॉलोनी में पीने के पानी के दबाव में भारी रुकावट',
      description:
        '12 आवासीय भवनों के निवासियों को सुबह 6-8 बजे के आपूर्ति समय में बहुत कम या बिल्कुल पानी नहीं मिल रहा है। लगातार तीन दिनों से परिवारों को निजी पानी के टैंकरों पर निर्भर होना पड़ रहा है।',
      address: 'पानी की टंकी के पास, सेक्टर 4, कोथरूड',
      ward: 'वार्ड ०८ (कोथरूड)',
      department: 'जल आपूर्ति एवं सीवरेज बोर्ड',
      reasoning: [
        'आवासीय क्लस्टर में आवश्यक पेयजल आपूर्ति का ठप होना',
        'निजी पानी माफिया द्वारा अनुचित लाभ उठाए जाने की संभावना',
        'हाइड्रोलिक टेलीमेट्री में मुख्य वाल्व खराबी के संकेत',
      ],
      keyIdentifiedEntities: ['पेयजल', 'पाइपलाइन दबाव', 'सेक्टर 4', 'आवश्यक सेवा'],
    },
  },
  'CIV-2026-000812': {
    mr: {
      title: 'प्रभाग १९ सार्वजनिक उद्यानाची तुटलेली जाळी आणि खेळणी',
      description:
        'लहान मुलांच्या खेळण्याच्या जागेतील झोपाळ्यांचे हुक तुटलेले आहेत आणि जाळीदार कुंपण फाटल्याने टोकदार तारा बाहेर आल्या आहेत. भटके कुत्रे मुलांच्या खेळण्याच्या जागेत शिरत आहेत.',
      address: 'छत्रपती शिवाजी महाराज उद्यान, उपविभागीय कार्यालय जवळ',
      ward: 'प्रभाग १९ (सदाशिव पेठ)',
      department: 'उद्यान व सार्वजनिक बागबगीचे विभाग',
      reasoning: [
        'खेळणी वापरणाऱ्या लहान मुलांसाठी सुरक्षेचा थेट धोका',
        'कुंपण तुटल्याने उद्यानात भटक्या प्राण्यांचा वावर',
      ],
      keyIdentifiedEntities: ['मुलांचे उद्यान', 'खेळणी', 'जाळीदार कुंपण', 'बाल सुरक्षा'],
    },
    hi: {
      title: 'वार्ड 19 के सार्वजनिक पार्क में टूटी जालीदार बाड़ और खेल उपकरण',
      description:
        'बच्चों के खेलने के क्षेत्र में झूलों के बोल्ट टूटे हुए हैं और तार की जाली फटने से नुकीले तार बाहर निकले हैं। आवारा जानवर बच्चों के खेल क्षेत्र में घुस रहे हैं।',
      address: 'छत्रपति शिवाजी उद्यान, उप-जोनल कार्यालय के पास',
      ward: 'वार्ड १९ (सदाशिव पेठ)',
      department: 'उद्यान एवं सार्वजनिक पार्क विभाग',
      reasoning: [
        'खेल के मैदान के उपकरणों का उपयोग करने वाले छोटे बच्चों के लिए सुरक्षा खतरा',
        'चारदीवारी टूटने से खेल क्षेत्र में आवारा पशुओं का प्रवेश',
      ],
      keyIdentifiedEntities: ['खेल का मैदान', 'बाल सुरक्षा', 'नगर निगम उद्यान'],
    },
  },
  'CIV-2026-000780': {
    mr: {
      title: 'टिळक रोड खरेदी पदपथावरील धोकादायक उघडे पावसाळी गटार',
      description:
        'ऑप्टिकल फायबर केबल टाकताना पावसाळी गटारावरील सिमेंटचा जड स्लॅब काढण्यात आला आणि कोणताही अडथळा किंवा रिफ्लेक्टिव्ह टेप न लावता पादचारी मार्गावर उघडा ठेवला गेला.',
      address: 'स्टेट बँक शाखेसमोर, टिळक रोड',
      ward: 'प्रभाग १५ (टिळक रोड)',
      department: 'महानगरपालिका रस्ते देखभाल व नागरी पायाभूत सुविधा विभाग',
      resolutionNotes:
        'गटारावर नवा आरसीसी काँक्रीट स्लॅब बसवून रस्ता पादचाऱ्यांसाठी सुरक्षित करण्यात आला आहे.',
      reasoning: ['व्यस्त व्यापारी पदपथावर पादचाऱ्यांसाठी थेट अपघाती खड्डा', 'संध्याकाळी गर्दीच्या वेळी गंभीर धोका'],
      keyIdentifiedEntities: ['पावसाळी गटार', 'पादचारी मार्ग', 'उघडा खड्डा', 'पादचारी सुरक्षा'],
    },
    hi: {
      title: 'तिलक रोड शॉपिंग फुटपाथ पर खतरनाक खुला स्टॉर्म ड्रेनेज नाला',
      description:
        'ऑप्टिक फाइबर बिछाने के दौरान नाले पर रखा भारी कंक्रीट स्लैब हटा दिया गया और बिना किसी बैरिकेड या चेतावनी पट्टी के पैदल मार्ग पर खुला छोड़ दिया गया।',
      address: 'स्टेट बैंक शाखा के सामने, तिलक रोड',
      ward: 'वार्ड १५ (तिलक रोड)',
      department: 'नगर निगम सड़क रखरखाव एवं नागरिक अवसंरचना विभाग',
      resolutionNotes:
        'नाले पर नया आरसीसी कंक्रीट स्लैब लगाकर फुटपाथ को सुरक्षित कर दिया गया है।',
      reasoning: ['वाणिज्यिक फुटपाथ पर सीधा गिरने का खतरा', 'शाम के समय पैदल यात्रियों के लिए अत्यधिक जोखिम'],
      keyIdentifiedEntities: ['स्टॉर्म ड्रेन', 'फुटपाथ', 'खुला गड्ढा', 'पैदल सुरक्षा'],
    },
  },
};

export const INNOVATION_LOCALIZATION_DATA: Record<string, Record<'mr' | 'hi', { title: string; description: string; authorRole?: string }>> = {
  'INV-2026-001': {
    mr: {
      title: 'स्मार्ट सौर-ऊर्जेवर चालणारे वेस्ट कॉम्पॅक्टर्स',
      description:
        'कचरा तुडुंब भरल्यावर आपोआप दाबून साठवण क्षमता ५ पटीने वाढवणारी आणि सेन्सरद्वारे थेट सूचना देणारी सौर-ऊर्जा यंत्रणा.',
      authorRole: 'अभियांत्रिकी विद्यार्थी गट',
    },
    hi: {
      title: 'स्मार्ट सौर-संचालित वेस्ट कॉम्पैक्टर्स',
      description:
        'कचरे को स्वतः संकुचित कर क्षमता 5 गुना बढ़ाने वाली और भराव स्तर पर स्वचालित अलर्ट भेजने वाली सौर-संचालित प्रणाली।',
      authorRole: 'इंजीनियरिंग छात्र दल',
    },
  },
  'INV-2026-002': {
    mr: {
      title: 'एआय-आधारित स्वयंचलित ट्रॅफिक सिग्नल सिंक्रोनायझेशन',
      description:
        'कॅमेऱ्यांद्वारे वाहनांची गर्दी ओळखून वाहनांच्या प्रमाणानुसार सिग्नलचा वेळ बदलणारी बुद्धिमत्ता प्रणाली.',
      authorRole: 'डेटा सायंटिस्ट',
    },
    hi: {
      title: 'एआई-संचालित ट्रैफिक सिग्नल सिंक्रोनाइज़ेशन',
      description:
        'भीड़भाड़ वाले चौराहों पर वास्तविक समय में वाहनों की संख्या के अनुसार सिग्नल समय बदलने वाली स्मार्ट प्रणाली।',
      authorRole: 'डेटा वैज्ञानिक',
    },
  },
  'INV-2026-003': {
    mr: {
      title: 'सार्वजनिक इमारतींसाठी विकेंद्रित पावसाळी पाणी संकलन ग्रीड',
      description:
        'महापालिका शाळा आणि कार्यालयांच्या छतावरील पाणी शुद्ध करून परिसरातील भूजल पुनर्भरण वाढवणारी कमी खर्चाची प्रणाली.',
      authorRole: 'पर्यावरण अभ्यासक',
    },
    hi: {
      title: 'सार्वजनिक भवनों के लिए विकेंद्रीकृत वर्षा जल संचयन ग्रिड',
      description:
        'नगर निगम स्कूलों और कार्यालयों की छतों के पानी को फिल्टर कर भूजल पुनर्भरण करने वाला किफायती ढांचा।',
      authorRole: 'पर्यावरण विशेषज्ञ',
    },
  },
};

export interface LocalizedConsultationText {
  title: string;
  summary: string;
  department?: string;
  topic?: string;
  questions?: Record<string, { prompt: string; options?: string[] }>;
}

export const CONSULTATION_LOCALIZATION_DATA: Record<string, Record<'mr' | 'hi', LocalizedConsultationText>> = {
  'pol-2026-01': {
    mr: {
      title: 'शहरी गैर-मोटार वाहतूक आणि पादचारी प्राधान्य क्षेत्रांसाठी महापालिका धोरण मसुदा',
      department: 'नगर विकास व वाहतूक प्रशासन संचालनालय',
      topic: 'शाश्वत गतिशीलता व पादचारी सुरक्षा',
      summary:
        'शहरातील ५२% पेक्षा अधिक लहान अंतर्गत प्रवास पादचारी आणि सायकलस्वारांकडून केले जातात, तरीही त्यांना केवळ १२% रस्ता जागा मिळते. हे धोरण २.० मीटरचे अखंड पदपथ, वाहतूक केंद्रांजवळ उंच पादचारी क्रॉसिंग आणि हेरिटेज बाजारपेठांमध्ये शनिवार-रविवार पादचारी क्षेत्र अनिवार्य करण्याचा प्रस्ताव ठेवते.',
      questions: {
        'q-1': {
          prompt: 'शनिवार-रविवार संध्याकाळी हेरिटेज व्यावसायिक रस्त्यांवर टप्प्याटप्प्याने पादचारी क्षेत्र घोषित करून बाहेरील ई-शटल सेवा सुरू करण्यास तुमचा पाठिंबा आहे का?',
          options: ['पूर्ण पाठिंबा', 'सशर्त मालवाहतूक वेळेसह पाठिंबा', 'विरोध', 'तटस्थ / अनिर्णित'],
        },
        'q-2': {
          prompt: 'महापालिका प्राथमिक शाळा आणि मेट्रो स्टेशनजवळ उंच टेबलटॉप क्रॉसिंग बसवणे किती महत्त्वाचे आहे?',
          options: ['१ - महत्त्वाचे नाही', '२ - कमी प्राधान्य', '३ - मध्यम', '४ - अतिशय महत्त्वाचे', '५ - सर्वोच्च प्राधान्य'],
        },
        'q-3': {
          prompt: 'पादचारी वेळेत डिलिव्हरी वाहने आणि व्यापाऱ्यांच्या मालवाहतुकीबाबत आपल्या शिफारसी नोंदवा.',
        },
      },
    },
    hi: {
      title: 'शहरी गैर-मोटरीकृत परिवहन एवं पैदल यात्री प्राथमिकता क्षेत्र हेतु नगर निगम नीति प्रारूप',
      department: 'नगर विकास एवं यातायात अभिशासन निदेशालय',
      topic: 'सतत गतिशीलता एवं पैदल यात्री सुरक्षा',
      summary:
        'शहर में 52% से अधिक छोटी यात्राएं पैदल यात्रियों और साइकिल चालकों द्वारा की जाती हैं, फिर भी उन्हें केवल 12% समर्पित सड़क स्थान मिलता है। यह नीति 2.0 मीटर के बाधा-मुक्त फुटपाथ, पारगमन केंद्रों के पास उठे हुए टेबलटॉप क्रॉसिंग और सप्ताहांत में हेरिटेज बाजारों को पैदल क्षेत्र बनाने का प्रस्ताव करती है।',
      questions: {
        'q-1': {
          prompt: 'क्या आप सप्ताहांत की शाम को हेरिटेज व्यावसायिक सड़कों को चरणबद्ध रूप से पैदल यात्री क्षेत्र बनाने और बाहरी ई-शटल चलाने का समर्थन करते हैं?',
          options: ['पूर्ण समर्थन', 'सशर्त आपूर्ति समय के साथ समर्थन', 'विरोध', 'तटस्थ / अनिर्णित'],
        },
        'q-2': {
          prompt: 'नगर निगम प्राथमिक विद्यालयों और मेट्रो स्टेशनों के पास टेबलटॉप क्रॉसिंग बनाना कितना महत्वपूर्ण है?',
          options: ['1 - महत्वपूर्ण नहीं', '2 - कम प्राथमिकता', '3 - मध्यम', '4 - बहुत महत्वपूर्ण', '5 - शीर्ष प्राथमिकता'],
        },
        'q-3': {
          prompt: 'केवल-पैदल समय के दौरान डिलीवरी वाहनों और व्यापारियों के सामान परिवहन के संबंध में अपने सुझाव साझा करें।',
        },
      },
    },
  },
  'pol-2026-02': {
    mr: {
      title: 'नवीन व्यावसायिक आणि बहुमजली निवासी संकुलांमध्ये विकेंद्रित सांडपाणी पुनर्वापर बंधनकारक करणे',
      department: 'पाणी पुरवठा व मलनिस्सारण व्यवस्थापन मंडळ',
      topic: 'जल सुरक्षा व संसाधन पुनर्वापर',
      summary:
        'भूजल पातळी घसरणे रोखण्यासाठी आणि सांडपाणी प्रक्रिया प्रकल्पांवरील ताण कमी करण्यासाठी ५० पेक्षा अधिक घरे असलेल्या सर्व सोसायट्या आणि २०,००० चौ.फूट पेक्षा मोठ्या व्यावसायिक संकुलांमध्ये दुहेरी पाइपिंग ग्रे-वॉटर पुनर्वापर प्रणाली अनिवार्य करण्याचे प्रस्तावित आहे.',
      questions: {
        'q-water-1': {
          prompt: 'फ्लशिंग आणि बागेसाठी १००% सांडपाणी पुनर्वापर करणाऱ्या सोसायट्यांना महानगरपालिकेने ५% मालमत्ता कर सवलत द्यावी का?',
          options: ['होय, आर्थिक सवलतीमुळे स्वीकार वाढेल', 'नाही, सवलतीशिवाय बंधनकारक करा', 'त्याऐवजी जलद इमारत परवाना मंजुरी द्या'],
        },
        'q-water-2': {
          prompt: 'विद्यमान अपार्टमेंट सोसायट्यांना ग्रे-वॉटर फिल्टरेशन बसवण्यासाठी किती संक्रमण कालावधी मिळावा?',
          options: ['१२ महिने', '२४ महिने', '३६ महिने', 'विद्यमान इमारतींना पूर्ण सूट द्या'],
        },
      },
    },
    hi: {
      title: 'नए वाणिज्यिक एवं बहुमंजिला आवासीय परिसरों में विकेंद्रीकृत ग्रे-वाटर शोधन अनिवार्य करना',
      department: 'जल आपूर्ति एवं सीवरेज प्रबंधन बोर्ड',
      topic: 'जल सुरक्षा एवं संसाधन पुनर्चक्रण',
      summary:
        'भूजल स्तर में गिरावट रोकने और केंद्रीय सीवेज ट्रीटमेंट प्लांट पर दबाव कम करने के लिए 50 से अधिक इकाइयों वाले सभी परिसरों और 20,000 वर्ग फुट से बड़े वाणिज्यिक भवनों में ग्रे-वाटर रीसाइक्लिंग प्रणाली अनिवार्य करने का प्रस्ताव है।',
      questions: {
        'q-water-1': {
          prompt: 'क्या नगर निगम को फ्लशिंग और बागवानी के लिए 100% ग्रे-वाटर का पुन: उपयोग करने वाली सोसायटियों को 5% संपत्ति कर छूट देनी चाहिए?',
          options: ['हाँ, वित्तीय प्रोत्साहन से इसे तेजी से अपनाया जाएगा', 'नहीं, बिना छूट के अनिवार्य करें', 'इसके बजाय त्वरित भवन योजना मंजूरी दें'],
        },
        'q-water-2': {
          prompt: 'मौजूदा अपार्टमेंट सोसायटियों को ग्रे-वाटर फिल्ट्रेशन लगाने के लिए कितना संक्रमण समय दिया जाना चाहिए?',
          options: ['12 महीने', '24 महीने', '36 महीने', 'मौजूदा भवनों को पूर्ण छूट दें'],
        },
      },
    },
  },
  'pol-2026-03': {
    mr: {
      title: 'पथविक्रेता कायद्यांतर्गत प्रभाग फेरीवाला क्षेत्र व नियमन',
      department: 'सामाजिक कल्याण व नागरी उपजीविका कक्ष',
      topic: 'सार्वजनिक जागेचे समन्यायी वाटप व असंघटित अर्थव्यवस्था',
      summary:
        'पादचाऱ्यांची सुरक्षित ये-जा कायम राखताना १८,००० हून अधिक नोंदणीकृत फेरीवाल्यांच्या उपजीविकेचे रक्षण करण्यासाठी फेरीवाला क्षेत्रांचे सीमांकन.',
      questions: {
        'q-vend-1': {
          prompt: 'निवासी वस्त्यांमध्ये भाजीपाला विक्रेत्यांसाठी ठराविक वेळ (सकाळी ६ ते ११, संध्याकाळी ४ ते ९) निश्चित करण्यास तुमची सहमती आहे का?',
          options: ['सहमत', 'प्रभागातील लवचिकतेसह अंशतः सहमत', 'असहमत'],
        },
      },
    },
    hi: {
      title: 'स्ट्रीट वेंडर्स अधिनियम के तहत वार्ड वेंडिंग जोन एवं फेरीवाला विनियमन',
      department: 'समाज कल्याण एवं शहरी आजीविका प्रकोष्ठ',
      topic: 'सार्वजनिक स्थान साझाकरण एवं अनौपचारिक अर्थव्यवस्था',
      summary:
        'पैदल यात्रियों के सुचारू आवागमन को बनाए रखते हुए 18,000 से अधिक पंजीकृत रेहड़ी-पटरी वालों की आजीविका की रक्षा के लिए वेंडिंग कॉरिडोर का निर्धारण।',
      questions: {
        'q-vend-1': {
          prompt: 'क्या आप आवासीय गलियों में सब्जी और फल विक्रेताओं के लिए निश्चित समय स्लॉट (सुबह 6 से 11, शाम 4 से 9) से सहमत हैं?',
          options: ['सहमत', 'स्थानीय वार्ड लचीलेपन के साथ आंशिक रूप से सहमत', 'असहमत'],
        },
      },
    },
  },
  'pol-01': {
    mr: {
      title: 'इलेक्ट्रिक वाहन (EV) चार्जिंग इन्फ्रास्ट्रक्चर धोरण २०२६-२०३०',
      summary:
        'नवीन निवासी सोसायट्या आणि व्यापारी संकुलांमध्ये ईव्ही चार्जिंग पॉईंट्स अनिवार्य करणे आणि सवलती देणे याविषयी नागरिकांची मते.',
      department: 'नगर विकास व वाहतूक नियोजन',
      topic: 'ई-मोबिलिटी आणि हरित ऊर्जा',
    },
    hi: {
      title: 'इलेक्ट्रिक वाहन (EV) चार्जिंग अवसंरचना नीति 2026-2030',
      summary:
        'नए आवासीय परिसरों और व्यावसायिक इमारतों में ईवी चार्जिंग पॉइंट अनिवार्य करने और रियायतें देने पर जन-परामर्श।',
      department: 'नगर विकास एवं परिवहन नियोजन',
      topic: 'ई-मोबिलिटी एवं हरित ऊर्जा',
    },
  },
  'pol-02': {
    mr: {
      title: 'व्यापारी भागांसाठी पदपथ मोकळे ठेवणे आणि फेरीवाला नियमन उपविधी',
      summary:
        'पादचाऱ्यांसाठी सुरक्षित पदपथ सुनिश्चित करताना स्थानिक फेरीवाल्यांचे पुनर्वसन आणि समर्पित फेरीवाला क्षेत्र निश्चिती.',
      department: 'अतिक्रमण निर्मूलन व नगर नियोजन',
      topic: 'पादचारी सुरक्षा व फेरीवाला धोरण',
    },
    hi: {
      title: 'व्यापारिक क्षेत्रों में फुटपाथ मुक्त रखने एवं स्ट्रीट वेंडर विनियमन उप-नियम',
      summary:
        'पैदल यात्रियों की सुरक्षा और स्थानीय रेहड़ी-पटरी वालों के व्यवस्थित पुनर्वास के लिए विशिष्ट वेंडिंग जोन निर्धारण।',
      department: 'अतिक्रमण नियंत्रण एवं नगर नियोजन',
      topic: 'पैदल यात्री सुरक्षा एवं वेंडर नीति',
    },
  },
};

export const TIMELINE_TITLE_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'Problem Reported with Evidence': {
    en: 'Problem Reported with Evidence',
    mr: 'पुराव्यासह तक्रार नोंदवली',
    hi: 'साक्ष्य सहित समस्या दर्ज',
  },
  'Preliminary AI Triage Complete': {
    en: 'Preliminary AI Triage Complete',
    mr: 'प्राथमिक एआय विश्लेषण पूर्ण',
    hi: 'प्रारंभिक एआई विश्लेषण पूर्ण',
  },
  'Assigned to Executive Engineer': {
    en: 'Assigned to Executive Engineer',
    mr: 'कार्यकारी अभियंत्यांकडे वर्ग',
    hi: 'अधिशासी अभियंता को सौंपा गया',
  },
  'On-Ground Remedial Work In Progress': {
    en: 'On-Ground Remedial Work In Progress',
    mr: 'प्रत्यक्ष जागेवर दुरुस्ती काम सुरू',
    hi: 'मौके पर सुधारात्मक कार्य प्रगति पर',
  },
  'Resolution Evidence Submitted by Department': {
    en: 'Resolution Evidence Submitted by Department',
    mr: 'विभागाने कामाचा पुरावा सादर केला',
    hi: 'विभाग द्वारा समाधान साक्ष्य प्रस्तुत',
  },
  'Problem Logged by Citizen': {
    en: 'Problem Logged by Citizen',
    mr: 'नागरिकाने समस्या नोंदवली',
    hi: 'नागरिक द्वारा समस्या दर्ज',
  },
  'Assigned to Ward Sanitary Inspector': {
    en: 'Assigned to Ward Sanitary Inspector',
    mr: 'प्रभाग स्वच्छता निरीक्षकांकडे वर्ग',
    hi: 'वार्ड स्वच्छता निरीक्षक को सौंपा गया',
  },
  'Field Team on Site': {
    en: 'Field Team on Site',
    mr: 'पथक घटनास्थळी हजर',
    hi: 'फील्ड टीम मौके पर उपस्थित',
  },
  'Reported': {
    en: 'Reported',
    mr: 'नोंदणीकृत',
    hi: 'दर्ज',
  },
  'Immediate Emergency Electrical Dispatch': {
    en: 'Immediate Emergency Electrical Dispatch',
    mr: 'तातडीचे विद्युत दुरुस्ती पथक रवाना',
    hi: 'आपातकालीन विद्युत टीम रवाना',
  },
  'Feeder Cable Repaired & Fixtures Replaced': {
    en: 'Feeder Cable Repaired & Fixtures Replaced',
    mr: 'फीडर केबल दुरुस्त व दिवे बदलले',
    hi: 'फीडर केबल मरम्मत एवं लाइटें बदली गईं',
  },
  'Citizen Verified On-Site': {
    en: 'Citizen Verified On-Site',
    mr: 'नागरिकाने जागेवर पडताळणी पूर्ण केली',
    hi: 'नागरिक द्वारा मौके पर सत्यापन संपन्न',
  },
  'Reported by Citizen Group': {
    en: 'Reported by Citizen Group',
    mr: 'नागरिक समूहाकडून नोंदणी',
    hi: 'नागरिक समूह द्वारा दर्ज',
  },
  'AI Priority Flagging & Intake Triage': {
    en: 'AI Priority Flagging & Intake Triage',
    mr: 'एआय प्राधान्यक्रम निर्धारण',
    hi: 'एआई प्राथमिकता निर्धारण',
  },
};

export const TIMELINE_NOTES_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'Citizen submitted detailed report with geo-tagged images and video evidence.': {
    en: 'Citizen submitted detailed report with geo-tagged images and video evidence.',
    mr: 'नागरिकाने जिओ-टॅग केलेली छायाचित्रे आणि पुराव्यांसह सविस्तर अहवाल सादर केला.',
    hi: 'नागरिक ने जियो-टैग्ड चित्रों और साक्ष्य के साथ विस्तृत रिपोर्ट दर्ज की।',
  },
  'AI scored urgency at 87/100 and routed case to Road Maintenance Dept.': {
    en: 'AI scored urgency at 87/100 and routed case to Road Maintenance Dept.',
    mr: 'एआयने ८७/१०० तातडी निश्चित करून प्रकरण रस्ते देखभाल विभागाकडे वर्ग केले.',
    hi: 'एआई ने 87/100 प्राथमिकता निर्धारित कर मामला सड़क रखरखाव विभाग को भेजा।',
  },
  'Case docket generated under Work Order Reference WO-RD-2026-881. Site inspection scheduled.': {
    en: 'Case docket generated under Work Order Reference WO-RD-2026-881. Site inspection scheduled.',
    mr: 'कार्य आदेश WO-RD-2026-881 अंतर्गत प्रकरण नोंदवून जागेची पाहणी नियोजित केली.',
    hi: 'कार्य आदेश WO-RD-2026-881 के तहत मामला दर्ज कर स्थल निरीक्षण निर्धारित किया।',
  },
  'Milling completed, sub-base compacted, wet-mix macadam and hot-mix bitumen overlay initiated.': {
    en: 'Milling completed, sub-base compacted, wet-mix macadam and hot-mix bitumen overlay initiated.',
    mr: 'रस्त्याचे खोदकाम पूर्ण, सब-बेस दबाई आणि डांबरीकरणाचे काम सुरू झाले आहे.',
    hi: 'सड़क खुदाई पूर्ण, सब-बेस समतलीकरण और डामरीकरण कार्य प्रारंभ।',
  },
  'Hot-mix asphalt patch laid and leveled to grade. Compaction testing verified. Citizen verification requested.': {
    en: 'Hot-mix asphalt patch laid and leveled to grade. Compaction testing verified. Citizen verification requested.',
    mr: 'डांबरी पॅचवर्क पूर्ण करून रस्ता समतल केला. दबाई चाचणी पूर्ण झाली. नागरिकांच्या पडताळणीची विनंती केली आहे.',
    hi: 'डामर पैचवर्क पूर्ण कर सड़क समतल की गई। संघनन परीक्षण सत्यापित। नागरिक सत्यापन अनुरोध भेजा गया।',
  },
  'Special compactor truck dispatched for clearing bin and sanitizing boundary.': {
    en: 'Special compactor truck dispatched for clearing bin and sanitizing boundary.',
    mr: 'कचरापेटी स्वच्छ करण्यासाठी व परिसर निर्जंतुकीकरणासाठी विशेष कॉम्पॅक्टर ट्रक पाठवण्यात आला.',
    hi: 'कचरा पात्र खाली करने एवं क्षेत्र की स्वच्छता हेतु विशेष कॉम्पैक्टर ट्रक भेजा गया।',
  },
  'Clearing commenced; lime powder disinfection scheduled immediately after.': {
    en: 'Clearing commenced; lime powder disinfection scheduled immediately after.',
    mr: 'स्वच्छता काम सुरू झाले आहे; त्यानंतर लगेचच चुना पावडर टाकून निर्जंतुकीकरण केले जाईल.',
    hi: 'सफाई कार्य शुरू हुआ; इसके तुरंत बाद चूना पाउडर से कीटाणुशोधन किया जाएगा।',
  },
  'Underground phase cable splice replaced; all 8 luminaires tested operational.': {
    en: 'Underground phase cable splice replaced; all 8 luminaires tested operational.',
    mr: 'भूमिगत फेज केबल जोड बदलला; सर्व ८ दिवे चालू असल्याची चाचणी घेतली.',
    hi: 'भूमिगत केबल बदली गई; सभी 8 लाइटों का सफल परीक्षण किया गया।',
  },
  'Citizen inspected corridor during night commute and confirmed all lights functioning brightly.': {
    en: 'Citizen inspected corridor during night commute and confirmed all lights functioning brightly.',
    mr: 'नागरिकाने रात्रीच्या प्रवासादरम्यान रस्त्याची पाहणी केली आणि सर्व दिवे व्यवस्थित सुरू असल्याची पुष्टी केली.',
    hi: 'नागरिक ने रात्रि यात्रा के दौरान निरीक्षण कर सभी लाइटों के सुचारू चलने की पुष्टि की।',
  },
  'Feeder line circuit breaker replaced. Continuous photometrics measured above 25 lux standard.': {
    en: 'Feeder line circuit breaker replaced. Continuous photometrics measured above 25 lux standard.',
    mr: 'फीडर लाईनचा सर्किट ब्रेकर बदलला. प्रकाशाची तीव्रता २५ लक्स मानकापेक्षा जास्त असल्याचे मोजले.',
    hi: 'फीडर लाइन सर्किट ब्रेकर बदला गया। प्रकाश तीव्रता 25 लक्स मानक से अधिक पाई गई।',
  },
  'Categorized as Critical drinking water disruption. Dispatched to Hydraulic Engineering team.': {
    en: 'Categorized as Critical drinking water disruption. Dispatched to Hydraulic Engineering team.',
    mr: 'गंभीर पिण्याच्या पाण्याची समस्या म्हणून वर्गवारी करून जल अभियांत्रिकी पथकाकडे वर्ग केले.',
    hi: 'गंभीर पेयजल समस्या के रूप में वर्गीकृत कर जल अभियांत्रिकी टीम को भेजा गया।',
  },
};

export const ACTOR_ROLE_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'Reporting Citizen': {
    en: 'Reporting Citizen',
    mr: 'तक्रारदार नागरिक',
    hi: 'शिकायतकर्ता नागरिक',
  },
  'Automated AI Ingestion Engine': {
    en: 'Automated AI Ingestion Engine',
    mr: 'स्वयंचलित एआय यंत्रणा',
    hi: 'स्वचालित एआई प्रणाली',
  },
  'Municipal Central Dispatcher': {
    en: 'Municipal Central Dispatcher',
    mr: 'महानगरपालिका मध्यवर्ती नियंत्रण',
    hi: 'नगर निगम केंद्रीय प्रेषण',
  },
  'Executive Engineer (Roads)': {
    en: 'Executive Engineer (Roads)',
    mr: 'कार्यकारी अभियंता (रस्ते)',
    hi: 'अधिशासी अभियंता (सड़क)',
  },
  'Field Contractor Crew': {
    en: 'Field Contractor Crew',
    mr: 'कार्यकारी कंत्राटदार पथक',
    hi: 'फील्ड संविदा टीम',
  },
  'Assistant Engineer': {
    en: 'Assistant Engineer',
    mr: 'सहाय्यक अभियंता',
    hi: 'सहायक अभियंता',
  },
  'Ward Sanitary Inspector': {
    en: 'Ward Sanitary Inspector',
    mr: 'प्रभाग स्वच्छता निरीक्षक',
    hi: 'वार्ड स्वच्छता निरीक्षक',
  },
  'Junior Engineer (Electrical)': {
    en: 'Junior Engineer (Electrical)',
    mr: 'कनिष्ठ अभियंता (विद्युत)',
    hi: 'कनिष्ठ अभियंता (विद्युत)',
  },
};

export function getLocalizedProblem(problem: Problem, language: Language): Problem {
  if (language === 'en') return problem;

  const loc = PROBLEM_LOCALIZATION_DATA[problem.id]?.[language];
  const cat = CATEGORY_TRANSLATIONS[problem.category]?.[language] || problem.category;
  const dept = DEPARTMENT_TRANSLATIONS[problem.department]?.[language] || problem.department;
  const ward = WARD_TRANSLATIONS[problem.location.ward]?.[language] || problem.location.ward;

  return {
    ...problem,
    title: loc?.title || problem.title,
    description: loc?.description || problem.description,
    category: cat as any,
    department: loc?.department || dept,
    location: {
      ...problem.location,
      address: loc?.address || problem.location.address,
      landmark: loc?.landmark || problem.location.landmark,
      ward: loc?.ward || ward,
      city: language === 'mr' ? 'पुणे' : language === 'hi' ? 'पुणे' : problem.location.city,
      state: language === 'mr' ? 'महाराष्ट्र' : language === 'hi' ? 'महाराष्ट्र' : problem.location.state,
    },
    assignedOfficer: problem.assignedOfficer
      ? {
          ...problem.assignedOfficer,
          designation:
            language === 'mr'
              ? 'कार्यकारी अभियंता (रस्ते)'
              : language === 'hi'
              ? 'अधिशासी अभियंता (सड़क)'
              : problem.assignedOfficer.designation,
        }
      : undefined,
    timeline: problem.timeline.map((event) => ({
      ...event,
      title: TIMELINE_TITLE_TRANSLATIONS[event.title]?.[language] || event.title,
      notes: event.notes ? TIMELINE_NOTES_TRANSLATIONS[event.notes]?.[language] || event.notes : undefined,
      department: event.department ? DEPARTMENT_TRANSLATIONS[event.department]?.[language] || event.department : undefined,
      actorRole: event.actorRole ? ACTOR_ROLE_TRANSLATIONS[event.actorRole]?.[language] || event.actorRole : undefined,
    })),
    aiAssessment: {
      ...problem.aiAssessment,
      category: cat as any,
      suggestedDepartment: DEPARTMENT_TRANSLATIONS[problem.aiAssessment.suggestedDepartment]?.[language] || problem.aiAssessment.suggestedDepartment,
      reasoning: loc?.reasoning || problem.aiAssessment.reasoning,
      keyIdentifiedEntities: loc?.keyIdentifiedEntities || problem.aiAssessment.keyIdentifiedEntities,
    },
    resolutionEvidence: problem.resolutionEvidence
      ? {
          ...problem.resolutionEvidence,
          notes: loc?.resolutionNotes || problem.resolutionEvidence.notes,
          officerDesignation:
            language === 'mr'
              ? 'कार्यकारी अभियंता (रस्ते व पायाभूत सुविधा)'
              : language === 'hi'
              ? 'अधिशासी अभियंता (सड़क एवं अवसंरचना)'
              : problem.resolutionEvidence.officerDesignation,
        }
      : undefined,
  };
}

export function getLocalizedInnovation(innovation: Innovation, language: Language): Innovation {
  if (language === 'en') return innovation;

  const loc = INNOVATION_LOCALIZATION_DATA[innovation.id]?.[language];
  const cat = CATEGORY_TRANSLATIONS[innovation.category]?.[language] || innovation.category;
  const stage = STAGE_TRANSLATIONS[innovation.stage]?.[language] || innovation.stage;

  return {
    ...innovation,
    title: loc?.title || innovation.title,
    description: loc?.description || innovation.description,
    category: cat as any,
    stage: stage as any,
  };
}

export function getLocalizedConsultation(consultation: Consultation, language: Language): Consultation {
  if (language === 'en') return consultation;

  const loc = CONSULTATION_LOCALIZATION_DATA[consultation.id]?.[language];
  const dept = DEPARTMENT_TRANSLATIONS[consultation.department]?.[language] || consultation.department;
  const status = STAGE_TRANSLATIONS[consultation.status]?.[language] || consultation.status;

  return {
    ...consultation,
    title: loc?.title || consultation.title,
    summary: loc?.summary || consultation.summary,
    department: loc?.department || dept,
    topic: loc?.topic || consultation.topic,
    status: status as any,
    questions: consultation.questions.map((q) => {
      const qLoc = loc?.questions?.[q.id];
      if (!qLoc) return q;
      return {
        ...q,
        prompt: qLoc.prompt || q.prompt,
        options: qLoc.options || q.options,
      };
    }),
  };
}

export function getLocalizedCategory(category: string, language: Language): string {
  return CATEGORY_TRANSLATIONS[category]?.[language] || category;
}

export function getLocalizedDepartment(dept: string, language: Language): string {
  return DEPARTMENT_TRANSLATIONS[dept]?.[language] || dept;
}

export function getLocalizedWard(ward: string, language: Language): string {
  return WARD_TRANSLATIONS[ward]?.[language] || ward;
}

export function getLocalizedStage(stage: string, language: Language): string {
  return STAGE_TRANSLATIONS[stage]?.[language] || stage;
}
