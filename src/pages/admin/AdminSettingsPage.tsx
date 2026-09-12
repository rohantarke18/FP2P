import React, { useState, useEffect } from 'react';
import { Settings, Shield, Bell, Lock, Globe, Clock, UserCheck, AlertCircle, CheckCircle2, Loader2, UserPlus, FileText, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { UserRole } from '../../types';
import { auditLogService, AuditLogEntry } from '../../services/auditLogService';

export const AdminSettingsPage: React.FC = () => {
  const { user, isSuperAdmin, isDeptAdmin, provisionOfficialUser } = useAuth();
  const { showToast } = useNotifications();

  // Officer Provisioning State
  const [targetUid, setTargetUid] = useState('');
  const [assignedRole, setAssignedRole] = useState<UserRole>('officer');
  const [department, setDepartment] = useState('Municipal Road Maintenance & Civil Infrastructure');
  const [designation, setDesignation] = useState('Field Executive Engineer');
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionSuccess, setProvisionSuccess] = useState<string | null>(null);
  const [provisionError, setProvisionError] = useState<string | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const loadAuditLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logs = await auditLogService.getRecentLogs(25);
      setAuditLogs(logs);
    } catch (err) {
      console.warn('Failed to load audit logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin || isDeptAdmin) {
      loadAuditLogs();
    }
  }, [isSuperAdmin, isDeptAdmin]);

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvisionError(null);
    setProvisionSuccess(null);

    if (!targetUid.trim()) {
      setProvisionError('Please enter the user UID or registered email to provision.');
      return;
    }

    setIsProvisioning(true);
    try {
      await provisionOfficialUser(targetUid.trim(), assignedRole, department, designation);
      setProvisionSuccess(
        `User ${targetUid} successfully provisioned as ${assignedRole.toUpperCase()} in ${department}.`
      );
      showToast('success', 'Role Provisioned', `Official privileges updated for ${targetUid}`);
      setTargetUid('');
      loadAuditLogs();
    } catch (err: any) {
      console.error('Provisioning error:', err);
      setProvisionError(err.message || 'Failed to provision user role. Ensure you have administrator rights.');
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Administrative & System Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure SLA thresholds, automated triage rules, and municipal official role provisioning.
        </p>
      </div>

      {/* Official Role Provisioning Module (Administrators Only) */}
      {(isSuperAdmin || isDeptAdmin) && (
        <div className="bg-white rounded-xl border border-amber-200 p-6 shadow-xs space-y-5">
          <div className="pb-3 border-b border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Municipal Official Role Provisioning
                </h2>
                <p className="text-[11px] text-slate-500">
                  Security Rule: Normal registrations always create Citizens. Privileged roles must be provisioned here by an Administrator.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Admin Exclusive
            </span>
          </div>

          {provisionSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{provisionSuccess}</span>
            </div>
          )}

          {provisionError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{provisionError}</span>
            </div>
          )}

          <form onSubmit={handleProvisionSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  User Firebase UID or Account Identifier
                </label>
                <input
                  type="text"
                  required
                  value={targetUid}
                  onChange={(e) => setTargetUid(e.target.value)}
                  placeholder="e.g. 8u2N... or user UID"
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-blue-600 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Privileged Role Assignment
                </label>
                <select
                  value={assignedRole}
                  onChange={(e) => {
                    const r = e.target.value as UserRole;
                    setAssignedRole(r);
                    if (r === 'officer') {
                      setDesignation('Field Executive Engineer');
                    } else if (r === 'department_admin') {
                      setDesignation('Additional Municipal Commissioner / Supervisor');
                    } else if (r === 'expert') {
                      setDesignation('Civic Innovation Advisory Committee Member');
                    }
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-blue-600 font-semibold"
                >
                  <option value="officer">Field Officer (Ground Resolution & Photo Verification)</option>
                  <option value="department_admin">Department Admin / Supervisor (Triage & Assignment)</option>
                  <option value="expert">Innovation Expert Evaluator (Feasibility & Pilot Scoring)</option>
                  {isSuperAdmin && (
                    <option value="super_admin">Super Administrator (Full System Authority)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Assigned Municipal Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-blue-600"
                >
                  <option value="Municipal Road Maintenance & Civil Infrastructure">Municipal Road Maintenance & Civil Infrastructure</option>
                  <option value="Water Supply, Sewerage & Stormwater Drainage Board">Water Supply, Sewerage & Stormwater Drainage Board</option>
                  <option value="Sanitation & Solid Waste Management Department">Sanitation & Solid Waste Management Department</option>
                  <option value="Electrical Engineering & Street Lighting Division">Electrical Engineering & Street Lighting Division</option>
                  <option value="Public Health & Vector Control Department">Public Health & Vector Control Department</option>
                  <option value="Parks, Gardens & Urban Forestry Department">Parks, Gardens & Urban Forestry Department</option>
                  <option value="City Transport & Traffic Governance Cell">City Transport & Traffic Governance Cell</option>
                  <option value="Central Municipal Administration">Central Municipal Administration</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Official Designation / Title
                </label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Ward Executive Engineer"
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-blue-600 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isProvisioning}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                {isProvisioning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5" />
                )}
                <span>Provision Official Role</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SLA & General Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>SLA Target Deadlines (Hours)</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Critical Priority</label>
              <input type="number" defaultValue={24} className="w-full p-2 border rounded bg-slate-50 font-mono" />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">High Priority</label>
              <input type="number" defaultValue={48} className="w-full p-2 border rounded bg-slate-50 font-mono" />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Medium Priority</label>
              <input type="number" defaultValue={96} className="w-full p-2 border rounded bg-slate-50 font-mono" />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Low Priority</label>
              <input type="number" defaultValue={168} className="w-full p-2 border rounded bg-slate-50 font-mono" />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Citizen Verification Safeguards</span>
          </h2>
          <div className="space-y-3 mt-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
              <span className="text-slate-800">Enforce mandatory completion photos before allowing officer resolution submission.</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
              <span className="text-slate-800">Auto-reopen case if citizen dispute is lodged within 7 calendar days.</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            className="px-4 py-2 rounded bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
          >
            Save Configuration
          </button>
        </div>
      </div>

      {/* Administrative Audit Trail (Super Admins & Dept Admins) */}
      {(isSuperAdmin || isDeptAdmin) && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Administrative Audit Trail
                </h2>
                <p className="text-[11px] text-slate-500">
                  Immutable traceability log of officer assignments, role updates, status changes, and resolutions.
                </p>
              </div>
            </div>
            <button
              onClick={loadAuditLogs}
              disabled={isLoadingLogs}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Refresh Audit Logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {auditLogs.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              No audit records logged yet. Administrative actions will appear here automatically.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-700">
                        {log.action}
                      </span>
                      <span className="text-slate-800 font-medium">
                        {log.details}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>By: {log.performedBy?.name || 'Authorized Official'} ({log.performedBy?.role || 'Admin'})</span>
                      <span>•</span>
                      <span>Target: {log.entityId}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
