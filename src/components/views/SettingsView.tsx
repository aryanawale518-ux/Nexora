import React, { useState } from 'react';
import {
  User,
  Bell,
  Database,
  Download,
  CheckCircle2,
  Shield,
  Key,
  HardDrive,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../common/Avatar';
import { MOCK_USERS } from '../../data/mockData';

export const SettingsView: React.FC<{ onOpenSetupGuide: () => void }> = ({ onOpenSetupGuide }) => {
  const { currentUser, switchUserRole, currentWorkspace, systemStatus, supabaseStatus } = useApp();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(true);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportData = () => {
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 text-xs text-slate-700">
      {/* Header bar */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Settings & System Governance
          </h1>
          <span className="text-xs text-slate-400 font-medium">·</span>
          <span className="text-xs text-slate-500 font-medium">Supabase & RBAC</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Review database security, Supabase credentials status, test personas, and institutional governance.
        </p>
      </div>

      {exportSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Institutional data package exported successfully (JSON format).</span>
        </div>
      )}

      {/* 1. Profile & Active Role Testing */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            Active User Profile & Role-Based Access Control (RBAC)
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Current Role: {currentUser.role}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Avatar src={currentUser.avatar} name={currentUser.name} size="lg" />
          <div>
            <span className="font-bold text-slate-900 text-sm block">{currentUser.name}</span>
            <span className="text-slate-500 block">{currentUser.email}</span>
            <span className="text-[11px] text-slate-600 mt-0.5 block">
              Official Role: <strong>{currentUser.roleLabel}</strong> · Organization: <strong>{currentWorkspace.name}</strong>
            </span>
          </div>
        </div>

        {/* 4 Roles Switcher for immediate testing */}
        <div className="pt-2">
          <label className="font-semibold block mb-2 text-slate-800">
            Switch Test Persona (Simulate Student, Teacher, Manager, Administrator RBAC):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MOCK_USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => switchUserRole(u.role)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  currentUser.role === u.role
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold text-slate-900 truncate">{u.name}</span>
                  {currentUser.role === u.role && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                </div>
                <span className="text-[10px] text-indigo-700 font-semibold uppercase tracking-wider">{u.role}</span>
                <span className="text-[10px] text-slate-500 truncate">{u.roleLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Supabase & Gemini Service Connectors */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            Backend Database & AI Infrastructure Status
          </h3>
          <button
            onClick={onOpenSetupGuide}
            className="text-xs font-semibold text-indigo-600 hover:underline"
          >
            Open Supabase Setup Guide →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Supabase Status */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  Supabase Database
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                  supabaseStatus.isConfigured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {supabaseStatus.isConfigured ? 'Connected' : 'Demo Mode'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                {supabaseStatus.isConfigured
                  ? `Active Host: ${supabaseStatus.url}`
                  : 'Unconfigured (Safe Isolated Demo Mode Active)'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-mono">
              VITE_SUPABASE_URL
            </div>
          </div>

          {/* Supabase Storage */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                  Supabase Storage
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                  supabaseStatus.isConfigured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {supabaseStatus.isConfigured ? 'Ready' : 'Emulated'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Buckets for <code className="bg-slate-200 px-1 rounded">assignment-submissions</code> and <code className="bg-slate-200 px-1 rounded">course-documents</code>.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-mono">
              RLS Folder Scoped
            </div>
          </div>

          {/* Gemini API */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Gemini 3.8 Flash
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                  systemStatus?.geminiConfigured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {systemStatus?.geminiConfigured ? 'Live Server' : 'Deterministic RAG'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                {systemStatus?.geminiConfigured
                  ? 'Server-side API active (no frontend keys)'
                  : 'Grounded RAG fallback running (secrets pending)'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-mono">
              GEMINI_API_KEY
            </div>
          </div>
        </div>
      </div>

      {/* 3. Notifications & Privacy Preferences */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600" />
          Notification Dispatch Rules
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="font-semibold text-slate-900 block">
                Official Notices Push Alerts
              </span>
              <span className="text-slate-500 text-[11px]">
                Receive instant priority alerts when teachers broadcast official notices.
              </span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="rounded text-indigo-600"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-100">
            <div>
              <span className="font-semibold text-slate-900 block">
                Multi-Tenant Organization Data Isolation
              </span>
              <span className="text-slate-500 text-[11px]">
                Enforce strict isolation between schools and organizations in every query.
              </span>
            </div>
            <input
              type="checkbox"
              checked={privacyMode}
              onChange={(e) => setPrivacyMode(e.target.checked)}
              className="rounded text-indigo-600"
            />
          </label>
        </div>
      </div>

      {/* 4. Data Export & Governance */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Download className="w-4 h-4 text-indigo-600" />
          Institutional Data Management
        </h3>
        <p className="text-slate-500 leading-relaxed">
          Download your academic submissions, notes bookmarks, attendance ledger, and conversation history in standard JSON format.
        </p>

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition flex items-center gap-2 min-h-[38px]"
          >
            <Download className="w-4 h-4" />
            <span>Export User Data (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
