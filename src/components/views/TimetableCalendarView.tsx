import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  User,
  ShieldCheck,
  AlertTriangle,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TimetableSlot } from '../../types';

export const TimetableCalendarView: React.FC = () => {
  const { timetable, publishTimetableChange, currentUser } = useApp();

  const [viewMode, setViewMode] = useState<'weekly' | 'daily' | 'monthly'>('weekly');
  const [selectedDay, setSelectedDay] = useState<number>(4); // Thursday by default (shows confirmed change)
  const [selectedSlotForEdit, setSelectedSlotForEdit] = useState<TimetableSlot | null>(null);
  const [editRoom, setEditRoom] = useState('');
  const [editNote, setEditNote] = useState('');
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isFacultyOrAdmin =
    currentUser.role === 'teacher' ||
    currentUser.role === 'class_teacher' ||
    currentUser.role === 'admin';

  const days = [
    { num: 1, name: 'Monday' },
    { num: 2, name: 'Tuesday' },
    { num: 3, name: 'Wednesday' },
    { num: 4, name: 'Thursday' },
    { num: 5, name: 'Friday' },
  ];

  const handlePublishChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotForEdit || !editRoom.trim()) return;

    setConflictError(null);
    setSuccessMsg(null);

    const result = publishTimetableChange(selectedSlotForEdit.id, editRoom.trim(), editNote.trim());
    if (!result.success) {
      setConflictError(result.error || 'Failed to update schedule');
    } else {
      setSuccessMsg(`Successfully published room change for ${selectedSlotForEdit.subject}!`);
      setTimeout(() => {
        setSelectedSlotForEdit(null);
        setSuccessMsg(null);
      }, 1200);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Timetable & Academic Calendar
            </h1>
            <span className="text-xs text-slate-400 font-medium">·</span>
            <span className="text-xs text-slate-500 font-medium">Timetable v2.1</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Verified schedules for Class 7-A. Relocations and room changes require faculty verification.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              viewMode === 'weekly' ? 'bg-white text-indigo-600 shadow-2xs font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Weekly Grid
          </button>
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              viewMode === 'daily' ? 'bg-white text-indigo-600 shadow-2xs font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Daily View
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              viewMode === 'monthly' ? 'bg-white text-indigo-600 shadow-2xs font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Monthly Assessment
          </button>
        </div>
      </div>

      {/* Confirmed Change Highlight Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-700 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-slate-900 text-sm">Schedule Relocation: Thursday Mathematics</span>
            <span className="text-[11px] text-amber-800 font-semibold shrink-0">
              Approved by Prof. Rajesh Verma
            </span>
          </div>
          <p className="mt-1 leading-relaxed text-slate-600">
            <strong>Mathematics (Class 7-A)</strong> on Thursdays was officially relocated from{' '}
            <span className="line-through text-slate-400">Room 102</span> to{' '}
            <strong className="text-indigo-900">Room 204 (Smart Lab Wing)</strong>.
            Verified and published on Oct 8, 2026.
          </p>
        </div>
      </div>

      {/* Weekly Grid View (Responsive: horizontal scroll on narrow mobile screens) */}
      {viewMode === 'weekly' && (
        <div className="overflow-x-auto pb-2">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 min-w-[700px] md:min-w-0">
            {days.map((day) => {
              const daySlots = timetable.filter((s) => s.dayOfWeek === day.num);
              return (
                <div
                  key={day.num}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col"
                >
                  <div className="p-3 bg-slate-900 text-white font-bold text-xs flex items-center justify-between">
                    <span>{day.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                      {daySlots.length} sessions
                    </span>
                  </div>

                  <div className="p-2 space-y-2.5 flex-1 bg-slate-50/30">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`p-3 rounded-xl border transition flex flex-col justify-between text-xs space-y-2 ${
                          slot.isChanged
                            ? 'border-amber-300 bg-amber-50/70'
                            : slot.type === 'lab'
                            ? 'border-purple-200 bg-purple-50/40'
                            : slot.type === 'exam'
                            ? 'border-rose-200 bg-rose-50/40'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono tabular-nums mb-1">
                            <span>{slot.startTime}</span>
                            {slot.isChanged && (
                              <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded font-sans">
                                MODIFIED
                              </span>
                            )}
                            {slot.type === 'lab' && (
                              <span className="text-[9px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded font-sans">
                                LAB
                              </span>
                            )}
                            {slot.type === 'exam' && (
                              <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded font-sans">
                                QUIZ
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-slate-900 leading-snug">{slot.subject}</h4>
                          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{slot.teacher}</span>
                          </div>
                          <div className="text-[11px] font-semibold text-slate-700 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span>{slot.room}</span>
                          </div>

                          {slot.changeDetails && (
                            <div className="mt-2 p-1.5 rounded-lg bg-amber-100/70 text-[10px] text-amber-900">
                              <strong>Diff:</strong> {slot.changeDetails.previousRoom} → {slot.room}
                            </div>
                          )}

                          {slot.requiredMaterials && (
                            <div className="mt-1.5 text-[10px] text-purple-900 font-medium">
                              Required: {slot.requiredMaterials.join(', ')}
                            </div>
                          )}
                        </div>

                        {/* Faculty Edit Room Button */}
                        {isFacultyOrAdmin && (
                          <div className="pt-2 border-t border-slate-100 flex justify-end">
                            <button
                              onClick={() => {
                                setSelectedSlotForEdit(slot);
                                setEditRoom(slot.room);
                                setEditNote(slot.changeDetails?.note || '');
                                setConflictError(null);
                              }}
                              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold"
                            >
                              Edit Room / Slot
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily View */}
      {viewMode === 'daily' && (
        <div className="space-y-4">
          <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
            {days.map((d) => (
              <button
                key={d.num}
                onClick={() => setSelectedDay(d.num)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedDay === d.num
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {timetable
              .filter((s) => s.dayOfWeek === selectedDay)
              .map((slot) => (
                <div key={slot.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/70 transition">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-20 text-center font-bold text-slate-800 font-mono tabular-nums shrink-0">
                      <div>{slot.startTime}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{slot.endTime}</div>
                    </div>
                    <div className="w-px h-10 bg-slate-200 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span className="truncate">{slot.subject}</span>
                        {slot.isChanged && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.2 rounded shrink-0">
                            MODIFIED
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 mt-0.5 truncate">
                        Teacher: {slot.teacher} · Location: <strong className="text-slate-800">{slot.room}</strong>
                      </div>
                      {slot.changeDetails && (
                        <p className="text-[11px] text-amber-800 mt-1">
                          Moved from {slot.changeDetails.previousRoom} by {slot.changeDetails.changedBy} on {slot.changeDetails.changedAt}.
                        </p>
                      )}
                    </div>
                  </div>

                  {isFacultyOrAdmin && (
                    <button
                      onClick={() => {
                        setSelectedSlotForEdit(slot);
                        setEditRoom(slot.room);
                        setEditNote(slot.changeDetails?.note || '');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 font-semibold text-slate-700 transition shrink-0"
                    >
                      Update
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Monthly View */}
      {viewMode === 'monthly' && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">October 2026 Academic Calendar</h3>
            <span className="text-xs text-slate-500 font-medium">Term 2 Examination Cycle</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <span className="font-bold text-slate-900 block font-mono tabular-nums">Oct 12, 2026 · 09:30 AM</span>
              <p className="text-slate-600 mt-1">Science Practical Unit Assessment (Biology Lab 2)</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <span className="font-bold text-slate-900 block font-mono tabular-nums">Oct 16, 2026 · 10:15 AM</span>
              <p className="text-slate-600 mt-1">Physics Unit Assessment (Room 204)</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <span className="font-bold text-slate-900 block font-mono tabular-nums">Oct 20, 2026 · 11:15 AM</span>
              <p className="text-slate-600 mt-1">EVS Biodiversity Field Project Submission & Evaluation</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Publish Timetable Room Change */}
      {selectedSlotForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Publish Schedule Change</h3>
                <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                  {selectedSlotForEdit.subject} · {selectedSlotForEdit.dayName} {selectedSlotForEdit.startTime}
                </span>
              </div>
              <button onClick={() => setSelectedSlotForEdit(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {conflictError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{conflictError}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handlePublishChange} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Current Room: <strong className="text-slate-900">{selectedSlotForEdit.room}</strong>
                </label>
                <label className="font-semibold text-slate-700 block mb-1">New Room / Location</label>
                <input
                  type="text"
                  required
                  value={editRoom}
                  onChange={(e) => setEditRoom(e.target.value)}
                  placeholder="e.g. Room 204 (Smart Lab Wing)"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Reason / Authorized Change Note
                </label>
                <textarea
                  rows={3}
                  required
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="State why the room was changed (e.g. Lab equipment upgrade)..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-[11px]">
                🛡️ <strong>Conflict Prevention:</strong> System automatically validates whether another class occupies this room during this slot.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedSlotForEdit(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  Publish Timetable Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
