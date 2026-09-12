import React from 'react';
import { FileSpreadsheet, Download, Calendar, BarChart2, Shield } from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const reports = [
    { title: 'Monthly Ward Grievance Resolution Audit', period: 'March 2026', size: '2.4 MB', type: 'PDF' },
    { title: 'SLA Failure & Escalation Incident Dossier', period: 'Q1 2026', size: '1.1 MB', type: 'CSV' },
    { title: 'Citizen Verification Discrepancy & Dispute Log', period: 'March 2026', size: '890 KB', type: 'PDF' },
    { title: 'Civic Innovation Shortlist & Pilot Feasibility Report', period: 'March 2026', size: '3.6 MB', type: 'PDF' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Executive Compliance & Performance Reports
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Download certified analytical summaries for ward committees and municipal commissioner meetings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((rep) => (
          <div key={rep.title} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-mono">
                  {rep.type}
                </span>
                <span className="text-xs text-slate-400">{rep.period}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{rep.title}</h3>
              <p className="text-[11px] text-slate-400">File size: {rep.size} • Certified for public audit</p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
