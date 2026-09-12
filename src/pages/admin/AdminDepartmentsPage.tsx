import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { Building2, Users, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export const AdminDepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    analyticsService.getDepartmentPerformance().then(setDepartments);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Municipal Departments & Engineering Cells
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Workload balance, SLA resolution velocity, and active field officers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {departments.map((dept) => (
          <div
            key={dept.name}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{dept.name}</h3>
                  <span className="text-[11px] text-slate-400">Operating across 4 zones</span>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {dept.slaCompliance}% SLA Rate
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-2.5 rounded text-center">
                <span className="text-slate-400 block text-[10px]">Total Logged</span>
                <span className="font-bold text-slate-800 text-sm">{dept.total}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded text-center">
                <span className="text-slate-400 block text-[10px]">Resolved</span>
                <span className="font-bold text-emerald-600 text-sm">{dept.resolved}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded text-center">
                <span className="text-slate-400 block text-[10px]">Avg Days</span>
                <span className="font-bold text-amber-600 text-sm">{dept.avgDays}d</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>6 Designated Field Officers</span>
              </span>
              <span className="text-blue-600 font-semibold cursor-pointer">
                Manage Officer Roster →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
