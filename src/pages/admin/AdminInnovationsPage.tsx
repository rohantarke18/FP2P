import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { innovationService } from '../../services/innovationService';
import { useNotifications } from '../../context/NotificationContext';
import { Innovation, InnovationStage } from '../../types';
import { Lightbulb, Award, ThumbsUp, ChevronRight, CheckCircle2, Trash2 } from 'lucide-react';

export const AdminInnovationsPage: React.FC = () => {
  const [innovations, setInnovations] = useState<Innovation[]>([]);
  const { showToast } = useNotifications();

  const loadData = () => {
    innovationService.getInnovations().then(setInnovations);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdvanceStage = async (id: string, nextStage: InnovationStage) => {
    try {
      const updated = await innovationService.updateStage(id, nextStage);
      setInnovations((prev) => prev.map((item) => (item.id === id ? updated : item)));
      showToast('success', 'Stage Advanced', `Proposal is now marked as "${nextStage}".`);
    } catch (err: any) {
      showToast('error', 'Error', err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Permanently delete proposal ${id}?`)) return;
    try {
      await innovationService.deleteInnovation(id);
      showToast('success', 'Deleted', `Proposal ${id} removed.`);
      loadData();
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Civic Innovation Committee Pipeline
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review community and youth proposals, audit feasibility indices, and approve ward pilots.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Ref ID</th>
                <th className="p-3">Proposal Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Submitter</th>
                <th className="p-3">Feasibility</th>
                <th className="p-3">Votes</th>
                <th className="p-3">Stage</th>
                <th className="p-3 text-right">Committee Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {innovations.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-600">{item.id}</td>
                  <td className="p-3 max-w-[220px]">
                    <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-400">{item.costEstimate}</p>
                  </td>
                  <td className="p-3 text-slate-700">{item.category}</td>
                  <td className="p-3 text-slate-600">
                    <p className="font-medium text-slate-900">{item.submitterName}</p>
                    <p className="text-[10px] text-slate-400">{item.submitterType}</p>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {item.feasibilityScore}/100
                    </span>
                  </td>
                  <td className="p-3 font-medium text-purple-700">{item.votes}</td>
                  <td className="p-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {item.stage}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1.5">
                    {item.stage === 'Under Review' && (
                      <button
                        type="button"
                        onClick={() => handleAdvanceStage(item.id, 'Pilot Approved')}
                        className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-[11px] font-semibold cursor-pointer"
                      >
                        Approve Pilot
                      </button>
                    )}
                    {item.stage === 'Pilot Approved' && (
                      <button
                        type="button"
                        onClick={() => handleAdvanceStage(item.id, 'Implemented')}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold cursor-pointer"
                      >
                        Mark Implemented
                      </button>
                    )}
                    <Link
                      to={`/innovations/${item.id}`}
                      className="px-2.5 py-1 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded text-[11px] font-medium inline-block"
                    >
                      Dossier
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors inline-block align-middle cursor-pointer"
                      title="Delete Proposal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
