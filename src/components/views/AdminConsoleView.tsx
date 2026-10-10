import React, { useState } from 'react';
import {
  Shield,
  Users,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MOCK_USERS } from '../../data/mockData';
import { Avatar } from '../common/Avatar';

export const AdminConsoleView: React.FC = () => {
  const { auditLogs, currentUser, currentWorkspace, addAuditLog } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'audit' | 'users' | 'workspace' | 'integrations'>('audit');
  const [userList, setUserList] = useState(MOCK_USERS);
  const [deactivationWarning, setDeactivationWarning] = useState<string | null>(null);

  const handleToggleUserStatus = (userId: string, currentStatus: string) => {
    const targetUser = userList.find((u) => u.id === userId);
    if (!targetUser) return;

    if (userId === currentUser.id) {
      setDeactivationWarning('Safety Rule: You cannot deactivate your own active Administrator session.');
      setTimeout(() => setDeactivationWarning(null), 3000);
      return;
    }

    const nextStatus = currentStatus === 'active' ? 'offline' : 'active';
    setUserList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: nextStatus as any } : u))
    );

    addAuditLog(
      nextStatus === 'offline' ? 'USER_ACCESS_REVOKED' : 'USER_ACCESS_RESTORED',
      `${targetUser.name} (${targetUser.roleLabel}) status modified to ${nextStatus}`,
      'security'
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Governance & Admin Console
            </h1>
            <span className="text-xs text-slate-400 font-medium">·</span>
            <span className="text-xs text-slate-500 font-medium">Institutional Authority</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            System administration, RBAC policy enforcement, real-time security audit trails, and backend provisioning.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-600">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Tenant: {currentWorkspace.id}</span>
        </div>
      </div>

      {/* Safety warning banner */}
      {deactivationWarning && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{deactivationWarning}</span>
        </div>
      )}

      {/* Segmented Admin Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl max-w-fit overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveAdminTab('audit')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeAdminTab === 'audit'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Security Audit Trails
        </button>
        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeAdminTab === 'users'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          User Permissions & Roster
        </button>
        <button
          onClick={() => setActiveAdminTab('workspace')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeAdminTab === 'workspace'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Workspace Settings
        </button>
        <button
          onClick={() => setActiveAdminTab('integrations')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeAdminTab === 'integrations'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Backend & API Setup
        </button>
      </div>

      {/* 1. Audit Logs Tab */}
      {activeAdminTab === 'audit' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Security & Action Log</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Immutable records of timetable changes, notice broadcasts, grading actions, and role mutations.
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-400">Total: {auditLogs.length} events</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold">Action</th>
                  <th className="pb-3 font-semibold">Actor</th>
                  <th className="pb-3 font-semibold">Target & Scope</th>
                  <th className="pb-3 font-semibold">Severity</th>
                  <th className="pb-3 font-semibold text-right">Client IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 text-[11px] text-slate-500 tabular-nums">{log.timestamp}</td>
                    <td className="py-3 font-bold text-slate-900 font-sans text-xs">{log.action}</td>
                    <td className="py-3 font-sans text-xs">
                      <span className="font-semibold text-slate-800">{log.actor}</span>
                      <span className="text-[10px] text-slate-400 block font-sans">
                        ({log.actorRole})
                      </span>
                    </td>
                    <td className="py-3 font-sans text-xs max-w-xs truncate">{log.target}</td>
                    <td className="py-3 font-sans text-xs">
                      <span
                        className={`text-[11px] font-semibold ${
                          log.severity === 'security'
                            ? 'text-rose-700'
                            : log.severity === 'warning'
                            ? 'text-amber-700'
                            : 'text-indigo-700'
                        }`}
                      >
                        {log.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-[11px] text-slate-400 text-right tabular-nums">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. User Permissions & Roster Tab */}
      {activeAdminTab === 'users' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Institutional Directory & Access Roster</h3>
            <span className="text-xs text-slate-500 font-medium">4 Core Roles Configured</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {userList.map((user) => (
              <div key={user.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <Avatar src={user.avatar} name={user.name} size="md" />
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span className="truncate">{user.name}</span>
                      <span className="text-[10px] font-semibold text-slate-500 font-normal">
                        · {user.roleLabel}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {user.email} · {user.department || 'Academics'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[11px] font-semibold ${
                      user.status === 'active'
                        ? 'text-emerald-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {user.status === 'active' ? 'Active' : 'Revoked'}
                  </span>

                  <button
                    onClick={() => handleToggleUserStatus(user.id, user.status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      user.status === 'active'
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {user.status === 'active' ? 'Revoke Access' : 'Restore Access'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Workspace Settings Tab */}
      {activeAdminTab === 'workspace' && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-5 text-xs text-slate-700">
          <h3 className="font-bold text-slate-900 text-sm">Tenant Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Organization Name</label>
              <input
                type="text"
                defaultValue={currentWorkspace.name}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Current Academic Term / Quarter</label>
              <input
                type="text"
                defaultValue={currentWorkspace.academicYearOrQuarter}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Backend Integrations Tab */}
      {activeAdminTab === 'integrations' && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs text-slate-700">
          <h3 className="font-bold text-slate-900 text-sm">Live Service Connectors</h3>
          <p className="text-slate-600">
            Nexora features full server-side integrations with Google Gemini 3.8 Flash and Firebase.
          </p>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 space-y-2">
            <span className="font-bold text-slate-900 block">Gemini 3.8 Flash SDK Integration:</span>
            <p className="text-xs text-slate-700 leading-relaxed">
              Implemented in <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono">server.ts</code> using <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono">@google/genai</code>.
              When <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono">GEMINI_API_KEY</code> is set in environment secrets, live inference is active.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
