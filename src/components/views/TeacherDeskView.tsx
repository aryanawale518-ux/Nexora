import React, { useState } from 'react';
import {
  Briefcase,
  Megaphone,
  CheckSquare,
  Upload,
  Calendar,
  Award,
  Users,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TeacherDeskView: React.FC = () => {
  const {
    currentUser,
    assignments,
    messages,
    timetable,
    sendMessage,
    createAssignment,
    gradeAssignment,
    setActivePage,
  } = useApp();

  const [broadcastNotice, setBroadcastNotice] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Filter assignments submitted by students waiting for teacher grading
  const submittedAssignments = assignments.filter((a) => a.status === 'submitted');
  const gradedAssignments = assignments.filter((a) => a.status === 'graded');

  const handleBroadcastNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastNotice.trim()) return;

    sendMessage('ch-official-7a', broadcastNotice.trim(), true);
    setBroadcastNotice('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Teacher Desk & Department Control
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Authorized Faculty Console
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as {currentUser.name} ({currentUser.roleLabel}). Manage Class 7-A course deliverables, verified notices, and student evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActivePage('assignments')}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs transition"
          >
            Publish New Assignment
          </button>
        </div>
      </div>

      {/* Quick Broadcast Announcement Widget */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Quick Broadcast: Official Class 7-A Notice
            </h3>
          </div>
          <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
            Only Verified Faculty
          </span>
        </div>

        {broadcastSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Official notice published to #Class 7-A Official Notices channel and pushed to all student notification feeds.</span>
          </div>
        )}

        <form onSubmit={handleBroadcastNotice} className="space-y-2">
          <textarea
            rows={2}
            value={broadcastNotice}
            onChange={(e) => setBroadcastNotice(e.target.value)}
            placeholder="Type urgent circular, lab requirement, or homework announcement to broadcast..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500"
          />
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400">
              Notice will be stamped with verification seal: "Official Notice by {currentUser.name}".
            </span>
            <button
              type="submit"
              disabled={!broadcastNotice.trim()}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              Broadcast Official Notice
            </button>
          </div>
        </form>
      </div>

      {/* Submissions Pending Evaluation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Pending Submissions Review */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Student Submissions Awaiting Grading
              </h3>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {submittedAssignments.length} Submitted
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {submittedAssignments.map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-indigo-300 transition flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-900 block text-xs">{sub.title}</span>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Student: <strong>Aarav Sharma</strong> • Submitted: {sub.submission?.submittedAt}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 italic">
                    "{sub.submission?.studentNotes}"
                  </p>
                </div>

                <button
                  onClick={() => setActivePage('assignments')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 text-xs shadow-xs"
                >
                  Grade
                </button>
              </div>
            ))}

            {submittedAssignments.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                No submissions currently waiting for review.
              </div>
            )}
          </div>
        </div>

        {/* Right: Classes & Office Hours Summary */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Office Hours & Assigned Sections</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Faculty Room 3</span>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Office Consultation Hours
              </span>
              <p className="font-semibold text-slate-800">
                {currentUser.officeHours || 'Mondays & Thursdays: 2:00 PM - 4:00 PM'}
              </p>
              <p className="text-[11px] text-slate-500">
                Students can book 1-on-1 consultations through the Direct Messages consultation channel.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Assigned Classes
              </span>
              <p className="font-semibold text-slate-800">
                Class 7-A (Science & EVS), Class 7-B (Natural Sciences), Class 8-A (Biology)
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => setActivePage('timetable')}
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
              >
                Inspect Timetable v2.1 Relocations <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
