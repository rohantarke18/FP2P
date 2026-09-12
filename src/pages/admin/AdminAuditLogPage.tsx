import React from 'react';
import { History, Shield, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export const AdminAuditLogPage: React.FC = () => {
  const auditLogs = [
    {
      id: 'LOG-9921',
      timestamp: '2026-03-29 11:32:14 UTC',
      actor: 'Er. Rajesh Salvi (Executive Engineer)',
      action: 'SUBMIT_RESOLUTION_PROOF',
      target: 'CIV-2026-001024',
      details: 'Uploaded 2 completion site photos and set work order WO-2026-0814. Triggered Citizen Verification Notification.',
      ip: '10.14.22.8 (GovLAN-Pune)',
    },
    {
      id: 'LOG-9920',
      timestamp: '2026-03-29 09:15:00 UTC',
      actor: 'Shreya Kulkarni (Citizen)',
      action: 'REGISTER_CIVIC_PROBLEM',
      target: 'CIV-2026-001024',
      details: 'Logged pothole report with 2 photo attachments. Rule-based AI generated triage score: 84/100.',
      ip: '49.36.11.84 (Mobile App)',
    },
    {
      id: 'LOG-9919',
      timestamp: '2026-03-28 16:45:22 UTC',
      actor: 'Dr. Anita Sharma (Additional Municipal Commissioner)',
      action: 'OFFICER_REASSIGNMENT',
      target: 'CIV-2026-001026',
      details: 'Assigned emergency pipeline containment to Junior Engineer V. Kulkarni. Bound to 24h statutory SLA.',
      ip: '10.14.20.1 (GovLAN-Central)',
    },
    {
      id: 'LOG-9918',
      timestamp: '2026-03-28 14:10:05 UTC',
      actor: 'Prof. S. Mehta (Advisory Expert)',
      action: 'SUBMIT_EXPERT_REVIEW',
      target: 'INV-2026-001',
      details: 'Scored Organic Waste Composting Hub proposal with Feasibility: 88, Cost: 82, Impact: 92. Recommended pilot approval.',
      ip: '14.139.112.4 (Academic-COEP)',
    },
    {
      id: 'LOG-9917',
      timestamp: '2026-03-27 10:20:41 UTC',
      actor: 'Manoj Deshmukh (Citizen)',
      action: 'CITIZEN_VERIFICATION_CONFIRMED',
      target: 'CIV-2026-001025',
      details: 'Confirmed storm drain silt removal is 100% complete. Rating: 5/5 stars. Case officially archived.',
      ip: '49.36.14.19 (Web Portal)',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Immutable Administrative Audit Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically timestamped record of all official state alterations, dispatches, and citizen verifications.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Ledger Integrity Verified</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Log ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor & Identity</th>
                <th className="p-3">Operation Code</th>
                <th className="p-3">Target Docket</th>
                <th className="p-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-600">{log.id}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="p-3 text-slate-800">
                    <p className="font-semibold">{log.actor}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{log.ip}</p>
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-blue-700">{log.target}</td>
                  <td className="p-3 text-slate-600 max-w-sm leading-relaxed">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
