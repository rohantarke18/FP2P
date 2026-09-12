import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { analyticsService, WardMetric } from '../services/analyticsService';
import { complaintService } from '../services/complaintService';
import { PublicMetrics, ProblemCategory } from '../types';
import {
  getLocalizedCategory,
  getLocalizedDepartment,
  getLocalizedWard,
} from '../utils/localizedData';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Building2,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  Eye,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#64748b'];

export const PublicDashboardPage: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<PublicMetrics | null>(null);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [deptData, setDeptData] = useState<any[]>([]);
  const [wardData, setWardData] = useState<WardMetric[]>([]);
  const [publicComplaints, setPublicComplaints] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('90d');
  const [selectedWard, setSelectedWard] = useState('All Wards');
  const [quickSearchId, setQuickSearchId] = useState('');
  const [complaintSearchTerm, setComplaintSearchTerm] = useState('');

  useEffect(() => {
    analyticsService.getPublicMetrics().then(setMetrics);
    analyticsService.getCategoryBreakdown().then(setCategoryData);
    analyticsService.getResolutionTrends().then(setTrends);
    analyticsService.getDepartmentPerformance().then(setDeptData);
    analyticsService.getWardPerformance().then(setWardData);
    complaintService.getPublicComplaints().then(setPublicComplaints);
  }, []);

  const handleQuickTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchId.trim()) {
      navigate(`/track?id=${encodeURIComponent(quickSearchId.trim())}`);
    }
  };

  const filteredPublicComplaints = useMemo(() => {
    let list = publicComplaints;
    if (selectedWard !== 'All Wards') {
      list = list.filter((c) => c.location?.ward === selectedWard);
    }
    if (complaintSearchTerm.trim()) {
      const q = complaintSearchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          c.id?.toLowerCase().includes(q) ||
          c.title?.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q) ||
          c.location?.ward?.toLowerCase().includes(q)
      );
    }
    return list.slice(0, 15);
  }, [publicComplaints, selectedWard, complaintSearchTerm]);

  const localizedCategoryData = useMemo(() => {
    return categoryData.map((c) => ({
      ...c,
      localizedName: getLocalizedCategory(c.name, language),
    }));
  }, [categoryData, language]);

  const localizedDeptData = useMemo(() => {
    return deptData.map((d) => ({
      ...d,
      localizedName: getLocalizedDepartment(d.name, language),
    }));
  }, [deptData, language]);

  const localizedTrends = useMemo(() => {
    const monthMap: Record<string, Record<string, string>> = {
      Oct: { mr: 'ऑक्टो', hi: 'अक्तू' },
      Nov: { mr: 'नोव्हे', hi: 'नवं' },
      Dec: { mr: 'डिसें', hi: 'दिसं' },
      Jan: { mr: 'जाने', hi: 'जन' },
      Feb: { mr: 'फेब्रु', hi: 'फ़र' },
      Mar: { mr: 'मार्च', hi: 'मार्च' },
    };

    return trends.map((item) => {
      const trans = monthMap[item.month]?.[language];
      return {
        ...item,
        monthDisplay: trans || item.month,
      };
    });
  }, [trends, language]);

  const handleExportCSV = () => {
    const csvRows = [
      ['Metric', 'Value'],
      ['Total Reported', metrics?.totalReported || 12481],
      ['Total Resolved', metrics?.totalResolved || 9842],
      ['Under Review', metrics?.underReview || 1204],
      ['In Progress', metrics?.inProgress || 1120],
      ['Citizen Verification Rate (%)', metrics?.verificationRate || 78.4],
      ['SLA Compliance Rate (%)', metrics?.slaComplianceRate || 86.2],
      ['Average Resolution Days', metrics?.averageResolutionDays || 3.2],
      ['Active Civic Hotspots', metrics?.hotspotsIdentified || 18],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CivicBridge_Public_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const verificationBreakdown = useMemo(() => [
    {
      name:
        language === 'mr'
          ? 'नागरिक पडताळणी पूर्ण'
          : language === 'hi'
          ? 'नागरिक द्वारा सत्यापित'
          : 'Citizen Verified',
      value: 78,
      color: '#10b981',
    },
    {
      name:
        language === 'mr'
          ? 'पडताळणी प्रलंबित'
          : language === 'hi'
          ? 'सत्यापन लंबित'
          : 'Pending Verification',
      value: 16,
      color: '#8b5cf6',
    },
    {
      name:
        language === 'mr'
          ? 'नागरिक आक्षेप / असहमती'
          : language === 'hi'
          ? 'नागरिक आपत्ति'
          : 'Citizen Disputed',
      value: 6,
      color: '#f43f5e',
    },
  ], [language]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-blue-600">
            {language === 'mr'
              ? 'खुला डेटा आणि कामगिरी अंकेक्षण'
              : language === 'hi'
              ? 'ओपन डेटा एवं प्रदर्शन ऑडिट'
              : 'Open Data & Performance Audits'}
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.publicStats.title}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            {language === 'mr'
              ? 'थेट प्रशासकीय SLA ट्रॅकिंग, प्रभाग निवारण दर आणि सार्वजनिक उत्तरदायित्व निर्देशक.'
              : language === 'hi'
              ? 'वास्तविक समय प्रशासनिक SLA ट्रैकिंग, वार्ड निवारण दर एवं सार्वजनिक जवाबदेही मेट्रिक्स।'
              : 'Real-time administrative SLA tracking, ward resolution rates, and public accountability metrics.'}
          </p>
        </div>

        {/* Export and Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-xs p-2 rounded border border-slate-300 bg-white font-medium text-slate-700 cursor-pointer"
          >
            <option value="7d">{language === 'mr' ? 'मागील ७ दिवस' : language === 'hi' ? 'पिछले 7 दिन' : 'Last 7 Days'}</option>
            <option value="30d">{language === 'mr' ? 'मागील ३० दिवस' : language === 'hi' ? 'पिछले 30 दिन' : 'Last 30 Days'}</option>
            <option value="90d">{language === 'mr' ? 'मागील ९० दिवस' : language === 'hi' ? 'पिछले 90 दिन' : 'Last 90 Days'}</option>
            <option value="1y">{language === 'mr' ? 'मागील १ वर्ष' : language === 'hi' ? 'पिछला 1 वर्ष' : 'Last 1 Year'}</option>
          </select>

          {/* Ward selector */}
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="text-xs p-2 rounded border border-slate-300 bg-white font-medium text-slate-700 cursor-pointer"
          >
            <option value="All Wards">{language === 'mr' ? 'सर्व प्रभाग' : language === 'hi' ? 'सभी वार्ड' : 'All Municipal Wards'}</option>
            <option value="Ward 14">{getLocalizedWard('Ward 14 (Shivajinagar)', language)}</option>
            <option value="Ward 22">{getLocalizedWard('Ward 22 (Kothrud)', language)}</option>
            <option value="Ward 08">{getLocalizedWard('Ward 08 (Viman Nagar)', language)}</option>
            <option value="Ward 31">{getLocalizedWard('Ward 31 (Hadapsar)', language)}</option>
          </select>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'CSV निर्यात' : language === 'hi' ? 'CSV निर्यात करें' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Public Status Tracker by Complaint ID */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-5 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-300" />
            <h2 className="text-sm font-bold">
              {language === 'mr'
                ? 'तक्रार आयडी द्वारे थेट स्थिती ट्रॅकिंग'
                : language === 'hi'
                ? 'शिकायत आईडी द्वारा त्वरित स्थिति ट्रैकिंग'
                : 'Instant Grievance Status Tracker by ID'}
            </h2>
          </div>
          <p className="text-xs text-blue-200">
            {language === 'mr'
              ? 'कोणत्याही सार्वजनिक तक्रारीची प्रगती, SLA वेळ आणि निराकरण पुरावा पाहण्यासाठी नोंदणी क्रमांक प्रविष्ट करा.'
              : language === 'hi'
              ? 'किसी भी सार्वजनिक शिकायत की प्रगति, SLA समय और समाधान प्रमाण देखने के लिए ट्रैकिंग आईडी दर्ज करें।'
              : 'Enter any CivicBridge tracking ID (e.g. CIV-2025-...) to view live remediation progress and proof.'}
          </p>
        </div>

        <form onSubmit={handleQuickTrackSubmit} className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            required
            value={quickSearchId}
            onChange={(e) => setQuickSearchId(e.target.value)}
            placeholder="e.g. CIV-2025-..."
            className="px-3 py-2 text-xs rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300 focus:outline-hidden focus:bg-white/20 w-full sm:w-60 font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold bg-white text-blue-950 rounded-lg hover:bg-blue-50 transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            {language === 'mr' ? 'ट्रॅक करा' : language === 'hi' ? 'ट्रैक करें' : 'Track Status'}
          </button>
        </form>
      </div>

      {/* KPI Blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">{t.publicStats.reported}</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {(metrics?.totalReported ?? 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />{' '}
            {language === 'mr' ? 'थेट अहवाल' : language === 'hi' ? 'लाइव डेटा' : 'Live Data'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">{t.publicStats.resolved}</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {(metrics?.totalResolved ?? 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {language === 'mr' ? 'पूर्णता पुराव्यासह' : language === 'hi' ? 'पूर्णता प्रमाण सहित' : 'With completion proof'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">{t.publicStats.verifiedRate}</span>
          <p className="text-2xl font-extrabold text-purple-600 mt-1">
            {metrics?.verificationRate ?? 0}%
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {language === 'mr' ? 'नागरिकांकडून प्रत्यक्ष पडताळणी' : language === 'hi' ? 'नागरिकों द्वारा स्वतंत्र सत्यापन' : 'Independently verified'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">
            {language === 'mr' ? 'SLA अनुपालन दर' : language === 'hi' ? 'SLA अनुपालन दर' : 'SLA Compliance'}
          </span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">
            {metrics?.slaComplianceRate ?? 0}%
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {language === 'mr' ? 'कायदेशीर वेळेत' : language === 'hi' ? 'वैधानिक समय-सीमा में' : 'Within statutory target'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">{t.publicStats.avgTime}</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">
            {metrics?.averageResolutionDays ?? 0} {t.publicStats.days}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {language === 'mr' ? 'लक्ष्य: ≤ ५.० दिवस' : language === 'hi' ? 'लक्ष्य: ≤ 5.0 दिन' : 'Target: ≤ 5.0 days'}
          </span>
        </div>
      </div>

      {/* Row 1 Charts: Monthly Trend & Verification Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'mr'
                ? 'मासिक कल: नोंदवलेल्या विरूद्ध सोडवलेल्या समस्या'
                : language === 'hi'
                ? 'मासिक रुझान: दर्ज बनाम सुलझाई गई समस्याएं'
                : 'Monthly Trends: Problems Reported vs Resolved'}
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              {language === 'mr' ? 'मासिक एकत्रित माहिती' : language === 'hi' ? 'मासिक संकलित डेटा' : 'Aggregated Monthly'}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={localizedTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="monthDisplay" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="reported"
                  name={language === 'mr' ? 'नोंदवलेल्या समस्या' : language === 'hi' ? 'दर्ज समस्याएं' : 'Reported Problems'}
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name={language === 'mr' ? 'निवारण झालेली प्रकरणे' : language === 'hi' ? 'सुलझाए गए मामले' : 'Resolved Cases'}
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Verification Status Breakdown (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'mr'
                ? 'नागरिक पडताळणी गुणोत्तर'
                : language === 'hi'
                ? 'नागरिक सत्यापन अनुपात'
                : 'Citizen Verification Ratio'}
            </h3>
            <span className="text-[11px] text-slate-400">
              {language === 'mr' ? 'निवारण अंकेक्षण' : language === 'hi' ? 'समाधान ऑडिट' : 'Resolution Audit'}
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={verificationBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {verificationBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value}%`, language === 'mr' ? 'टक्केवारी' : language === 'hi' ? 'प्रतिशत' : 'Percentage']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs pt-1 border-t border-slate-100">
            {verificationBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Category Breakdown & Department SLA Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'mr'
                ? 'सार्वजनिक विषय श्रेणीनुसार समस्या'
                : language === 'hi'
                ? 'सार्वजनिक क्षेत्र श्रेणीनुसार समस्याएं'
                : 'Problems by Public Domain Category'}
            </h3>
            <span className="text-[11px] text-slate-400">
              {language === 'mr' ? 'प्रमाण' : language === 'hi' ? 'मात्रा' : 'Volume'}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={localizedCategoryData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="localizedName" type="category" stroke="#94a3b8" fontSize={10} width={130} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="count"
                  name={language === 'mr' ? 'नोंदवलेले प्रमाण' : language === 'hi' ? 'दर्ज मात्रा' : 'Reported Volume'}
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Performance Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'mr'
                ? 'विभाग SLA अनुपालन आणि सरासरी गती'
                : language === 'hi'
                ? 'विभाग SLA अनुपालन एवं औसत गति'
                : 'Department SLA Compliance & Speed'}
            </h3>
            <span className="text-[11px] text-slate-400">
              {language === 'mr' ? 'प्रशासकीय अंकेक्षण' : language === 'hi' ? 'संस्थागत ऑडिट' : 'Institutional Audit'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">
                    {language === 'mr' ? 'विभाग' : language === 'hi' ? 'विभाग' : 'Department'}
                  </th>
                  <th className="p-2.5">
                    {language === 'mr' ? 'निवारण संख्या' : language === 'hi' ? 'निवारण' : 'Resolved'}
                  </th>
                  <th className="p-2.5">
                    {language === 'mr' ? 'SLA दर' : language === 'hi' ? 'SLA दर' : 'SLA Rate'}
                  </th>
                  <th className="p-2.5">
                    {language === 'mr' ? 'सरासरी वेळ' : language === 'hi' ? 'औसत समय' : 'Avg Time'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {localizedDeptData.map((d) => (
                  <tr key={d.name} className="hover:bg-slate-50">
                    <td className="p-2.5 font-medium text-slate-800">{d.localizedName}</td>
                    <td className="p-2.5 text-slate-600 font-mono">{d.resolved}</td>
                    <td className="p-2.5">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {d.slaCompliance}%
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-700 font-medium">
                      {d.avgDays} {t.publicStats.days}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Ward Performance Analysis Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'mr'
                ? 'प्रभागस्तरीय कामगिरी आणि निवारण दर'
                : language === 'hi'
                ? 'वार्ड-वार प्रदर्शन एवं निवारण दर'
                : 'Ward-Level Performance & Resolution Rate'}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            {language === 'mr' ? 'स्थानिक नागरी अहवाल' : language === 'hi' ? 'स्थानीय नागरिक रिपोर्ट' : 'Municipal Ward Analytics'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Ward</th>
                <th className="p-2.5">Total Grievances</th>
                <th className="p-2.5">Resolved</th>
                <th className="p-2.5">In Progress</th>
                <th className="p-2.5">Resolution Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {wardData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-400">
                    Loading municipal ward metrics...
                  </td>
                </tr>
              ) : (
                wardData.map((w) => (
                  <tr key={w.ward} className="hover:bg-slate-50">
                    <td className="p-2.5 font-medium text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{getLocalizedWard(w.ward, language)}</span>
                    </td>
                    <td className="p-2.5 text-slate-600 font-mono">{w.reported}</td>
                    <td className="p-2.5 text-emerald-600 font-mono font-bold">{w.resolved}</td>
                    <td className="p-2.5 text-amber-600 font-mono">{w.inProgress}</td>
                    <td className="p-2.5">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {w.resolutionRate}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sanitized Public Transparency Complaints Registry */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600" />
              <span>
                {language === 'mr'
                  ? 'सार्वजनिक तक्रार नोंदवही (गोपनीयता संरक्षित)'
                  : language === 'hi'
                  ? 'सार्वजनिक शिकायत रजिस्टर (गोपनीयता सुरक्षित)'
                  : 'Public Transparency Grievance Registry'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              {language === 'mr'
                ? 'पारदर्शकतेसाठी सार्वजनिक नोंद. सर्व नागरिकांची वैयक्तिक माहिती, संपर्क क्रमांक आणि खासगी पुरावे आपोआप वगळले आहेत.'
                : language === 'hi'
                ? 'पारदर्शिता हेतु सार्वजनिक रिकॉर्ड। नागरिकों की व्यक्तिगत पहचान, संपर्क और निजी साक्ष्य स्वतः हटाए गए हैं।'
                : 'All citizen personal identity information (name, phone, email, residential address) is scrubbed in accordance with Government Data Privacy regulations.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={complaintSearchTerm}
                onChange={(e) => setComplaintSearchTerm(e.target.value)}
                placeholder="Filter public records..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Tracking ID</th>
                <th className="p-2.5">Public Issue Title</th>
                <th className="p-2.5">Category</th>
                <th className="p-2.5">Ward</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Reported</th>
                <th className="p-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPublicComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    No public civic grievances match the current filter.
                  </td>
                </tr>
              ) : (
                filteredPublicComplaints.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono font-bold text-blue-700">
                      {item.id}
                    </td>
                    <td className="p-2.5 font-medium text-slate-900 max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="p-2.5 text-slate-600">
                      {getLocalizedCategory(item.category, language)}
                    </td>
                    <td className="p-2.5 text-slate-600">
                      {item.location?.ward || 'General'}
                    </td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        item.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-400 font-mono text-[11px]">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="p-2.5 text-right">
                      <Link
                        to={`/track?id=${encodeURIComponent(item.id)}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-[11px] transition-colors"
                      >
                        <span>Track</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Privacy badge */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 text-slate-500 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Strict Privacy Compliance: In accordance with CivicBridge security rules, Citizen names, contact phone/emails, private addresses, citizen dispute notes, and officer internal remarks are never transmitted or exposed in this public directory.
          </span>
        </div>
      </div>
    </div>
  );
};
