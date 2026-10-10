import React from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  FileText,
  MessageSquare,
  ArrowRight,
  BookOpen,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Beaker,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    assignments,
    documents,
    timetable,
    messages,
    setActivePage,
    setActiveChannelId,
    openAssistantWithQuery,
  } = useApp();

  const today = new Date();
  const dateFormatted = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Today's schedule slots (Day 2 has the science practical with lab materials)
  const todaySlots = timetable.filter((t) => t.dayOfWeek === 2);
  const pendingAssignments = assignments.filter((a) => a.status === 'pending');
  const officialNotices = messages['ch-official-7a'] || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Welcome Section (Single clear visual anchor) */}
      <div className="rounded-2xl bg-slate-900 text-white p-6 md:p-8 shadow-xs border border-slate-800">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs text-indigo-300 font-medium mb-2">
            <span>Academic Term 2026-27</span>
            <span aria-hidden="true">·</span>
            <span>Class 7-A Roster</span>
            <span aria-hidden="true">·</span>
            <span>Greenfield Academy</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Good morning, {currentUser.name.split(' ')[0]}
          </h1>

          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            {dateFormatted} — You have 3 classes scheduled today, 1 pending assignment due this week, and a Science Practical tomorrow morning.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => openAssistantWithQuery('Prepare my personalized daily briefing for today')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-xs whitespace-nowrap min-h-[38px]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Daily Briefing</span>
            </button>
            <button
              onClick={() => setActivePage('briefing')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700 whitespace-nowrap min-h-[38px]"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>View "My Day" & "Tomorrow"</span>
            </button>
          </div>
        </div>
      </div>

      {/* Critical Alerts (Lab Practical Preparation & Verified Room Relocation) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lab Practical Preparation Alert */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60 shrink-0">
            <Beaker className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-900 text-sm truncate">Science Practical (Bio-Lab 2)</span>
              <span className="text-[11px] text-amber-800 font-semibold shrink-0">Required Tomorrow</span>
            </div>
            <p className="text-slate-600 mt-1 leading-relaxed">
              Dr. Meera Sen issued Notice #104: Entry requires a <strong>clean lab apron</strong>, <strong>dissection needle set</strong>, and <strong>observation journal</strong>.
            </p>
            <div className="mt-3">
              <button
                onClick={() => setActivePage('briefing')}
                className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
              >
                Inspect Equipment Checklist <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Approved Timetable Room Change Alert */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/60 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-900 text-sm truncate">Confirmed Timetable Relocation</span>
              <span className="text-[11px] text-indigo-700 font-semibold shrink-0">Verified Change</span>
            </div>
            <p className="text-slate-600 mt-1 leading-relaxed">
              Mathematics on Thursdays is moved to <strong>Room 204 (Smart Lab Wing)</strong>. Published by Prof. Rajesh Verma.
            </p>
            <div className="mt-3">
              <button
                onClick={() => setActivePage('timetable')}
                className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
              >
                Inspect Timetable Diff <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Deliverables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Schedule & Announcements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule Widget */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Today's Class Schedule</h3>
              </div>
              <button
                onClick={() => setActivePage('timetable')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Full Timetable <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {todaySlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-16 text-center text-xs font-mono tabular-nums shrink-0">
                      <span className="font-bold text-slate-900 block">{slot.startTime.split(' ')[0]}</span>
                      <span className="text-[10px] text-slate-400">{slot.startTime.split(' ')[1]}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 text-xs flex items-center gap-2">
                        <span className="truncate">{slot.subject}</span>
                        {slot.type === 'lab' && (
                          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded shrink-0">
                            Lab Session
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 truncate">
                        <span>{slot.teacher}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-slate-700">{slot.room}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                    Confirmed
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Official Announcements Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Recent Official Announcements</h3>
              </div>
              <button
                onClick={() => {
                  setActivePage('messages');
                  setActiveChannelId('ch-official-7a');
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Channel Feed <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {officialNotices.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
                  onClick={() => {
                    setActivePage('messages');
                    setActiveChannelId('ch-official-7a');
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{msg.senderName}</span>
                      <span className="text-[10px] text-indigo-700 font-semibold">· Official Notice</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono tabular-nums">{msg.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Tasks, Recommended Notes & Copilot Card */}
        <div className="space-y-6">
          {/* Pending Tasks & Deliverables */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Pending Assignments</h3>
              </div>
              <span className="text-xs font-semibold text-slate-600 font-mono tabular-nums">
                {pendingAssignments.length} pending
              </span>
            </div>

            <div className="space-y-3">
              {pendingAssignments.map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-indigo-300 transition cursor-pointer"
                  onClick={() => setActivePage('assignments')}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase">{a.subject}</span>
                    <span className="text-[10px] font-semibold text-rose-600 font-mono tabular-nums">
                      Due: {a.dueDate}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{a.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{a.description}</p>
                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-200/80">
                    <span className="text-[10px] text-slate-400">By {a.assignedBy}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePage('assignments');
                      }}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      Submit Work →
                    </button>
                  </div>
                </div>
              ))}

              {pendingAssignments.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  All current assignments completed!
                </div>
              )}
            </div>
          </div>

          {/* Recommended Notes */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Study Materials</h3>
              </div>
              <button
                onClick={() => setActivePage('documents')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                All Documents
              </button>
            </div>

            <div className="space-y-2.5">
              {documents.slice(0, 3).map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setActivePage('documents')}
                  className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs uppercase font-mono">
                      {doc.fileType}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">{doc.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono tabular-nums">{doc.size} · {doc.uploader}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick AI Copilot Card */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-2xs border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h4 className="font-bold text-xs tracking-tight">Nexora AI Copilot</h4>
            </div>
            <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
              Ask questions strictly grounded in verified institutional records and official circulars.
            </p>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => openAssistantWithQuery('What do I need to bring tomorrow for science practical?')}
                className="w-full text-left p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-200 transition text-[11px]"
              >
                "What do I need to bring tomorrow?"
              </button>
              <button
                onClick={() => openAssistantWithQuery('Show my pending EVS assignments')}
                className="w-full text-left p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-200 transition text-[11px]"
              >
                "Show pending EVS assignments"
              </button>
              <button
                onClick={() => openAssistantWithQuery('Is the Friday physics quiz postponed or is that a rumor?')}
                className="w-full text-left p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-200 transition text-[11px]"
              >
                "Audit Friday physics quiz rumor"
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
