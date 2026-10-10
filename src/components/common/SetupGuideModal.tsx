import React from 'react';
import { X, CheckCircle2, AlertCircle, Database, Sparkles, Key, Shield, Server, FileText, Lock, HardDrive } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  const { systemStatus, supabaseStatus } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-900 text-white rounded-t-2xl border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center shadow-md">
              <span className="font-bold text-white text-lg">N</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">Nexora Supabase & Security Architecture</h2>
              <p className="text-xs text-slate-300">Authentication, Database RLS, Storage & Gemini Server-Side Integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm text-slate-700">
          {/* Current Verified Status Banner */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/70 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-indigo-900">Live Integration Verification Status</h4>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-indigo-200 text-indigo-700">
                  Tenant: greenfield_academy
                </span>
              </div>
              <p className="mt-1 text-xs text-indigo-800 leading-relaxed">
                Nexora strictly verifies all external connections before claiming they are live. All database, storage, and AI functions gracefully fallback to high-fidelity grounded demo records without crashing when credentials are not yet configured.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {/* Gemini Status */}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${
                  systemStatus?.geminiConfigured
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  Gemini API: {systemStatus?.geminiConfigured ? 'Verified & Connected (Server-Side)' : 'Unconfigured (Deterministic RAG Mode)'}
                </span>

                {/* Supabase Status */}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${
                  supabaseStatus.isConfigured
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                }`}>
                  <Database className="w-3.5 h-3.5" />
                  Supabase DB & Auth: {supabaseStatus.isConfigured ? `Connected (${supabaseStatus.url})` : 'Unconfigured (Safe Isolated Demo Mode)'}
                </span>

                {/* Storage Status */}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${
                  supabaseStatus.isConfigured
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                }`}>
                  <HardDrive className="w-3.5 h-3.5" />
                  Supabase Storage: {supabaseStatus.isConfigured ? 'Live Buckets Active' : 'Client Emulated Storage'}
                </span>
              </div>
            </div>
          </div>

          {/* Checklist for Production Connection */}
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Server className="w-4 h-4 text-indigo-600" />
              Supabase & Gemini Integration Checklist
            </h3>
            <div className="space-y-3">
              {/* 1. Supabase URL and Anon Key */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">1. Supabase URL & Public Anon Key</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">VITE_SUPABASE_URL</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Used by the client to initialize Supabase Auth, realtime subscriptions, and client storage uploads. Safe to expose to browser.
                  </p>
                </div>
              </div>

              {/* 2. Supabase Service Role Key */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">2. Supabase Service Role Key (Backend Only)</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">SUPABASE_SERVICE_ROLE_KEY</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Used strictly inside <code className="bg-slate-200 px-1 rounded">server.ts</code> for privileged token validation, user profile hydration, and server-enforced RBAC. Never put into frontend bundles.
                  </p>
                </div>
              </div>

              {/* 3. Gemini API Key */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 shrink-0">
                  <Key className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">3. Gemini 3.8 Flash (Server-Side Proxy)</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">GEMINI_API_KEY</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Called via <code className="bg-slate-200 px-1 rounded">/api/ai/assistant</code> and <code className="bg-slate-200 px-1 rounded">/api/ai/search</code> in Express server. API key is never sent to the browser.
                  </p>
                </div>
              </div>

              {/* 4. RBAC Roles */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">4. 4-Role Access Control & Tenant Isolation</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">student | teacher | manager | admin</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Every database query and storage file is scoped by <code className="bg-slate-200 px-1 rounded">org_id</code>. Students are blocked from grading, altering schedules, or viewing confidential faculty board notices.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Database Schema & Storage Architecture */}
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-indigo-600" />
              Supabase SQL Schema & Row-Level Security (RLS)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="font-semibold font-mono text-emerald-700">public.organizations</span>
                <p className="text-slate-600 mt-1">Multi-tenant root. RLS ensures users can only read records matching their assigned organization.</p>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="font-semibold font-mono text-emerald-700">public.profiles</span>
                <p className="text-slate-600 mt-1">Tied to <code className="bg-slate-200 px-1 rounded">auth.users(id)</code> with explicit role: student, teacher, manager, admin.</p>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="font-semibold font-mono text-emerald-700">public.assignments & submissions</span>
                <p className="text-slate-600 mt-1">Students can only read/edit their own submission. Faculty and managers have grading privileges.</p>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="font-semibold font-mono text-emerald-700">storage.buckets</span>
                <p className="text-slate-600 mt-1">Buckets for <code className="bg-slate-200 px-1 rounded">assignment-submissions</code>, <code className="bg-slate-200 px-1 rounded">course-documents</code> with folder-scoped RLS policies.</p>
              </div>
            </div>
            <div className="mt-2 text-right">
              <span className="text-[11px] text-slate-500">
                Full SQL migration file available in: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">supabase/schema.sql</code>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between rounded-b-2xl">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Multi-tenant Isolation & RBAC Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
