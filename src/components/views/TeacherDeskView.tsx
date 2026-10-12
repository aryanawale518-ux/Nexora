import React, { useState } from 'react';
import {
  Briefcase,
  Megaphone,
  CheckSquare,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle2,
  Users,
  BookOpen,
  Calendar,
  X,
  Building,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TeacherDeskView: React.FC = () => {
  const {
    currentUser,
    assignments,
    sendMessage,
    setActivePage,
    managedClasses,
    addClassSection,
    setSelectedClassFilter,
  } = useApp();

  const [broadcastNotice, setBroadcastNotice] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Add new class division modal state
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [classNameInput, setClassNameInput] = useState('');
  const [sectionInput, setSectionInput] = useState('');
  const [departmentInput, setDepartmentInput] = useState('Science & STEM');
  const [roomInput, setRoomInput] = useState('Room 204');
  const [strengthInput, setStrengthInput] = useState(40);
  const [scheduleInput, setScheduleInput] = useState('Mon-Fri 09:30 AM - 02:00 PM');
  const [addClassSuccess, setAddClassSuccess] = useState<string | null>(null);

  // Filter assignments submitted by students waiting for teacher grading
  const submittedAssignments = assignments.filter((a) => a.status === 'submitted');

  const handleBroadcastNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastNotice.trim()) return;

    sendMessage('ch-official-7a', broadcastNotice.trim(), true);
    setBroadcastNotice('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  const handleAddClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classNameInput.trim() || !sectionInput.trim()) return;

    const res = addClassSection({
      className: classNameInput.trim(),
      section: sectionInput.trim().toUpperCase(),
      department: departmentInput,
      teacherId: currentUser.id,
      totalStudents: strengthInput,
      room: roomInput,
      scheduleDescription: scheduleInput,
    });

    if (res.success) {
      setShowAddClassModal(false);
      setAddClassSuccess(`Created new division: ${classNameInput} - ${sectionInput}!`);
      setClassNameInput('');
      setSectionInput('');
      setTimeout(() => setAddClassSuccess(null), 3000);
    }
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
            Logged in as {currentUser.name} ({currentUser.roleLabel}). Manage assigned divisions, add classes, publish announcements, and review evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowAddClassModal(true)}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Class / Division</span>
          </button>
          <button
            onClick={() => setActivePage('assignments')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold shadow-xs transition"
          >
            Publish Assignment
          </button>
        </div>
      </div>

      {addClassSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{addClassSuccess}</span>
        </div>
      )}

      {/* Quick Broadcast Announcement Widget */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Quick Broadcast: Official Class Notice
            </h3>
          </div>
          <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
            Only Verified Faculty
          </span>
        </div>

        {broadcastSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Official notice published to #Class 7-A Official Notices channel and pushed to student notification feeds.</span>
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

      {/* Managed Classes Section (Add-On Tool for Multiple Classes) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Authorized Classes & Managed Sections ({managedClasses.length} Divisions)
              </h3>
              <p className="text-[11px] text-slate-500">
                Teachers can create new divisions (e.g., Class 7-A, Class 7-B, Class 7-C, College Batches) and manage student cohorts.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddClassModal(true)}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold rounded-lg text-xs flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Division</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          {managedClasses.map((cls) => (
            <div
              key={cls.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-indigo-300 transition flex flex-col justify-between space-y-2"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    {cls.className} - {cls.section}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-indigo-100/70 text-indigo-800 text-[10px] font-bold">
                    {cls.room}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Department: <strong className="text-slate-700">{cls.department}</strong>
                </div>
                <div className="text-[11px] text-slate-500">
                  Total Strength: <span className="font-mono font-semibold text-slate-800">{cls.totalStudents}</span> students
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  {cls.scheduleDescription}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedClassFilter(`${cls.className}-${cls.section}`);
                    setActivePage('academics');
                  }}
                  className="text-[11px] font-bold text-indigo-600 hover:underline"
                >
                  View ERP Ledger →
                </button>
                <button
                  onClick={() => setActivePage('timetable')}
                  className="text-[11px] text-slate-500 hover:text-slate-800"
                >
                  Timetable
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submissions Pending Evaluation & Office Hours */}
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
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 font-mono">
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
              <h3 className="font-bold text-slate-900 text-sm">Office Hours & Faculty Cabin</h3>
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
                Assigned Teaching Portfolio
              </span>
              <p className="font-semibold text-slate-800">
                {managedClasses.map((c) => `${c.className}-${c.section}`).join(', ')}
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

      {/* Add New Class Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Add New Authorized Class Division</h3>
              <button onClick={() => setShowAddClassModal(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddClassSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Class / Standard</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 7 or FY B.Sc"
                    value={classNameInput}
                    onChange={(e) => setClassNameInput(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Section / Division</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B or C or Div 1"
                    value={sectionInput}
                    onChange={(e) => setSectionInput(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Department</label>
                <select
                  value={departmentInput}
                  onChange={(e) => setDepartmentInput(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option>Science & STEM</option>
                  <option>Natural Sciences & Biology</option>
                  <option>Mathematics & Computing</option>
                  <option>Computer Science & IT</option>
                  <option>General Studies</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assigned Room / Lab</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Room 206 or Lab 3"
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Class Strength</label>
                  <input
                    type="number"
                    min="1"
                    value={strengthInput}
                    onChange={(e) => setStrengthInput(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Schedule Pacing</label>
                <input
                  type="text"
                  placeholder="e.g. Mon-Fri 09:30 AM - 02:00 PM"
                  value={scheduleInput}
                  onChange={(e) => setScheduleInput(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
