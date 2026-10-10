import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  Beaker,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DailyBriefingView: React.FC = () => {
  const {
    currentUser,
    assignments,
    timetable,
    messages,
    setActivePage,
    openAssistantWithQuery,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow'>('today');
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  const todaySlots = timetable.filter((s) => s.dayOfWeek === 1);
  const tomorrowSlots = timetable.filter((s) => s.dayOfWeek === 2);

  const pendingAssignments = assignments.filter((a) => a.status === 'pending');

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Personalized Daily Briefing
            </h1>
            <span className="text-xs text-slate-400 font-medium">·</span>
            <span className="text-xs text-slate-500 font-medium">Verified Records</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Synthesized schedule, critical lab gear checklist, confirmed room shifts, and official circulars for {currentUser.name}.
          </p>
        </div>

        {/* Day Selector Segmented Control */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'today' ? 'bg-white text-indigo-600 shadow-2xs font-semibold' : 'hover:text-slate-900'
            }`}
          >
            My Day (Today)
          </button>
          <button
            onClick={() => setActiveTab('tomorrow')}
            className={`px-4 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'tomorrow' ? 'bg-white text-indigo-600 shadow-2xs font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Tomorrow's Briefing
          </button>
        </div>
      </div>

      {/* Hero Summary Card */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-2xs border border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-indigo-300 font-medium">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Nexora Briefing Engine</span>
          </div>
          <span className="text-slate-400 font-mono">
            {activeTab === 'today' ? 'Monday Roster' : 'Tuesday Roster · Practical Day'}
          </span>
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">
          {activeTab === 'today'
            ? 'Today: 4 Classes Scheduled · EVS Assignment Pending'
            : 'Tomorrow: Bio-Lab 2 Practical Session · Mandatory Apron & Journal Required'}
        </h2>

        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          {activeTab === 'today'
            ? 'You begin with Homeroom & Assembly at 08:30 AM in Room 204 with Prof. Rajesh Verma. Ensure your EVS Biodiversity observations are recorded before the Oct 14 deadline.'
            : 'Official Notice #104 by Dr. Meera Sen takes effect tomorrow at 08:30 AM. Students must report to Biology Lab 2 equipped with laboratory apron, dissection needles, and signed journal.'}
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
          <button
            onClick={() => openAssistantWithQuery(`Give me a detailed verbal breakdown of ${activeTab === 'today' ? 'today' : 'tomorrow'}`)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition flex items-center gap-1.5 shadow-xs whitespace-nowrap min-h-[38px]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Nexora AI for Details</span>
          </button>

          <label className="flex items-center gap-2 text-slate-300 text-xs font-medium cursor-pointer ml-auto">
            <input
              type="checkbox"
              checked={remindersEnabled}
              onChange={(e) => setRemindersEnabled(e.target.checked)}
              className="rounded text-indigo-500 focus:ring-indigo-400"
            />
            <span>In-App Daily Briefing Alerts Active</span>
          </label>
        </div>
      </div>

      {/* Tomorrow's Special Lab Materials Checklist (If viewing Tomorrow) */}
      {activeTab === 'tomorrow' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Beaker className="w-5 h-5 text-amber-700" />
              <h3 className="font-bold text-slate-900 text-sm">
                Mandatory Bio-Lab 2 Equipment Checklist
              </h3>
            </div>
            <span className="text-[11px] text-amber-800 font-semibold">
              Source: Official Notice #104 (Dr. Meera Sen)
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Faculty policy strictly requires the following items before entering the science laboratory. Unprepared students will be redirected to study hall:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>White Laboratory Apron / Coat</strong> (Clean & ironed)</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>Dissection Needles & Forceps</strong> (Sanitized kit)</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>Hardbound Science Journal</strong> (With observation tables)</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>Cell Diagramming Stationery</strong> (2B Pencils & Eraser)</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Schedule & Deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Class Timetable for the day */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                {activeTab === 'today' ? "Today's Schedule" : "Tomorrow's Schedule"}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Timetable v2.1</span>
          </div>

          <div className="space-y-2.5">
            {(activeTab === 'today' ? todaySlots : tomorrowSlots).map((slot) => (
              <div
                key={slot.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>{slot.subject}</span>
                    {slot.type === 'lab' && (
                      <span className="text-[9px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded">
                        LAB
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
                    {slot.startTime} - {slot.endTime} · {slot.teacher}
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-indigo-600 block">{slot.room}</span>
                  <span className="text-[10px] text-emerald-600 font-medium">Confirmed</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Deliverables & Notice Digest */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Deliverables & Notice Summary</h3>
            </div>
            <span className="text-xs font-semibold text-slate-600 font-mono tabular-nums">
              {pendingAssignments.length} pending
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {pendingAssignments.map((a) => (
              <div
                key={a.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-indigo-300 transition cursor-pointer"
                onClick={() => setActivePage('assignments')}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">{a.title}</span>
                  <span className="text-rose-600 font-semibold text-[10px] font-mono tabular-nums">Due: {a.dueDate}</span>
                </div>
                <p className="text-slate-500 text-[11px] line-clamp-1">{a.description}</p>
                <span className="text-[10px] text-indigo-600 font-semibold mt-1 block">
                  Assigned by {a.assignedBy} · {a.subject}
                </span>
              </div>
            ))}

            {/* Timetable change reminder */}
            <div className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/40 text-slate-800">
              <span className="font-bold text-indigo-950 block mb-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                Audited Room Notice (Thursday)
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Mathematics relocates to Room 204. Verified on Oct 8 by Prof. Rajesh Verma.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
