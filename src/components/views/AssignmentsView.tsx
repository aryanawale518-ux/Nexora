import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  Plus,
  FileText,
  CheckCircle2,
  X,
  Award,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Assignment } from '../../types';

export const AssignmentsView: React.FC = () => {
  const {
    assignments,
    currentUser,
    submitAssignmentWork,
    createAssignment,
    gradeAssignment,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'submitted' | 'graded' | 'upcoming'>('all');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);

  // Submission form state
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [simulatedFileName, setSimulatedFileName] = useState('Aarav_Field_Observation_Report.pdf');

  // Teacher Creation form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('General Science');
  const [newClassGroup, setNewClassGroup] = useState('Class 7-A');
  const [newDueDate, setNewDueDate] = useState('In 5 days');
  const [newDescription, setNewDescription] = useState('');
  const [newPoints, setNewPoints] = useState(50);
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // Teacher Grading form state
  const [gradePoints, setGradePoints] = useState(45);
  const [gradeComments, setGradeComments] = useState('');

  const isFacultyOrAdmin =
    currentUser.role === 'teacher' ||
    currentUser.role === 'class_teacher' ||
    currentUser.role === 'admin';

  const filteredAssignments = assignments.filter((a) => {
    if (activeFilter === 'all') return true;
    return a.status === activeFilter;
  });

  const handleSubmitWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    submitAssignmentWork(selectedAssignment.id, submissionNotes, simulatedFileName);
    setShowSubmitModal(false);
    setSubmissionNotes('');
    setSelectedAssignment({
      ...selectedAssignment,
      status: 'submitted',
      submission: {
        submittedAt: 'Just now',
        studentNotes: submissionNotes,
        fileName: simulatedFileName,
      },
    });
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createAssignment({
      title: newTitle,
      subject: newSubject,
      description: newDescription,
      dueDate: newDueDate,
      maxPoints: Number(newPoints),
      priority: newPriority,
      classGroup: newClassGroup,
      instructions: [
        'Read relevant lecture notes in Documents folder.',
        'Submit neat step-by-step calculations or observations.',
      ],
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  const handleGradeSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    gradeAssignment(selectedAssignment.id, gradePoints, gradeComments);
    setShowGradingModal(false);
    setSelectedAssignment({
      ...selectedAssignment,
      status: 'graded',
      feedback: {
        gradedBy: currentUser.name,
        gradedAt: 'Just now',
        points: gradePoints,
        comments: gradeComments,
      },
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Assignments & Tasks
            </h1>
            <span className="text-xs text-slate-400 font-medium">·</span>
            <span className="text-xs text-slate-500 font-medium">Class 7-A Roster</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track student deliverables, verified submissions, deadlines, and teacher evaluations.
          </p>
        </div>

        {isFacultyOrAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition whitespace-nowrap min-h-[38px]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {/* Next-Action Recommendation */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/60 shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="text-xs flex-1">
          <span className="font-bold text-slate-900 text-sm block">
            Next Action: EVS Biodiversity Field Study
          </span>
          <p className="text-slate-600 mt-1 leading-relaxed">
            Your high-priority task <strong>"Biodiversity & Urban Habitat Field Study"</strong> is due in 4 days.
            Dr. Meera Sen linked reference guide <em>EVS_Ch3_Local_Ecosystems_Guide.pdf</em>.
            Review the 4 required plant observations before submitting.
          </p>
          <div className="mt-3">
            <button
              onClick={() => {
                const target = assignments.find((a) => a.id === 'EVS-702');
                if (target) setSelectedAssignment(target);
              }}
              className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
            >
              Open Assignment Details <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Segmented Filter Control */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl max-w-fit overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeFilter === 'all'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({assignments.length})
        </button>
        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeFilter === 'pending'
              ? 'bg-white text-amber-700 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pending ({assignments.filter((a) => a.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveFilter('submitted')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeFilter === 'submitted'
              ? 'bg-white text-blue-700 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Submitted ({assignments.filter((a) => a.status === 'submitted').length})
        </button>
        <button
          onClick={() => setActiveFilter('graded')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeFilter === 'graded'
              ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Graded ({assignments.filter((a) => a.status === 'graded').length})
        </button>
        <button
          onClick={() => setActiveFilter('upcoming')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeFilter === 'upcoming'
              ? 'bg-white text-purple-700 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Upcoming ({assignments.filter((a) => a.status === 'upcoming').length})
        </button>
      </div>

      {/* Assignment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAssignments.map((a) => {
          const isPending = a.status === 'pending';
          const isSubmitted = a.status === 'submitted';
          const isGraded = a.status === 'graded';

          return (
            <div
              key={a.id}
              onClick={() => setSelectedAssignment(a)}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-2xs transition flex flex-col justify-between space-y-4 group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                    {a.subject}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                      isPending
                        ? 'bg-amber-50 text-amber-800'
                        : isSubmitted
                        ? 'bg-blue-50 text-blue-800'
                        : isGraded
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {a.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors leading-snug">
                  {a.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{a.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-mono tabular-nums">
                  <span>Due: {a.dueDate}</span>
                  <span>Max: {a.maxPoints} pts</span>
                </div>

                {isGraded && a.feedback && (
                  <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between text-[11px] text-emerald-900">
                    <span className="font-medium">Score:</span>
                    <span className="font-bold font-mono tabular-nums">{a.feedback.points} / {a.maxPoints} pts</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">By {a.assignedBy}</span>
                  <span className="text-xs font-semibold text-indigo-600 group-hover:underline inline-flex items-center gap-1">
                    Details →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAssignments.length === 0 && (
        <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 p-8">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No assignments found under "{activeFilter}".</p>
          <button
            onClick={() => setActiveFilter('all')}
            className="mt-3 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            Show All Assignments
          </button>
        </div>
      )}

      {/* Assignment Detail Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5 text-xs text-slate-700">
            {/* Top header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                  {selectedAssignment.subject} · {selectedAssignment.classGroup}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedAssignment.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metadata strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono tabular-nums">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Assigned</span>
                <span className="font-semibold text-slate-800">{selectedAssignment.assignedDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Due Date</span>
                <span className="font-semibold text-rose-600">{selectedAssignment.dueDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Points</span>
                <span className="font-semibold text-slate-800">{selectedAssignment.maxPoints} pts</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Status</span>
                <span className="font-bold uppercase font-sans text-indigo-700">{selectedAssignment.status}</span>
              </div>
            </div>

            {/* Description & Instructions */}
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-1">Brief & Objective:</h4>
                <p className="leading-relaxed text-slate-600">{selectedAssignment.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-1">Submission Instructions:</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  {selectedAssignment.instructions.map((inst, idx) => (
                    <li key={idx}>{inst}</li>
                  ))}
                </ul>
              </div>

              {selectedAssignment.materialsRequired && selectedAssignment.materialsRequired.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 text-xs mb-1">Required Practical Items:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAssignment.materialsRequired.map((mat, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submission Status Box */}
            {selectedAssignment.submission ? (
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Verified Work Submitted
                  </span>
                  <span className="text-[11px] text-blue-700 font-mono tabular-nums">
                    {selectedAssignment.submission.submittedAt}
                  </span>
                </div>
                <p className="text-slate-700 italic">"{selectedAssignment.submission.studentNotes}"</p>
                {selectedAssignment.submission.fileName && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-blue-200 text-slate-800 font-medium">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>{selectedAssignment.submission.fileName}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-800 block">Pending Student Submission</span>
                  <p className="text-[11px] text-slate-500">
                    Completion requires an explicit submission action.
                  </p>
                </div>
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-xs whitespace-nowrap min-h-[38px]"
                >
                  Submit Solution
                </button>
              </div>
            )}

            {/* Faculty Feedback Box */}
            {selectedAssignment.feedback && (
              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    Faculty Assessment: {selectedAssignment.feedback.points} / {selectedAssignment.maxPoints} pts
                  </span>
                  <span className="text-[11px] text-emerald-800 font-medium">
                    By {selectedAssignment.feedback.gradedBy}
                  </span>
                </div>
                <p className="text-emerald-900 leading-relaxed">
                  "{selectedAssignment.feedback.comments}"
                </p>
              </div>
            )}

            {/* Teacher Action: Grade submission */}
            {isFacultyOrAdmin && selectedAssignment.submission && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowGradingModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  {selectedAssignment.feedback ? 'Update Grade & Feedback' : 'Review & Assign Marks'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Student Work Submission Modal */}
      {showSubmitModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Submit Solution</h3>
              <button onClick={() => setShowSubmitModal(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Submission Notes / Observation Summary
                </label>
                <textarea
                  rows={4}
                  required
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Summarize your experiment observations, calculations, or results..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Attached File (Simulated)
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <input
                    type="text"
                    value={simulatedFileName}
                    onChange={(e) => setSimulatedFileName(e.target.value)}
                    className="flex-1 bg-transparent text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  Confirm & Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Grading Modal */}
      {showGradingModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Evaluate Student Submission</h3>
              <button onClick={() => setShowGradingModal(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleGradeSubmission} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Marks Awarded (out of {selectedAssignment.maxPoints})
                </label>
                <input
                  type="number"
                  min="0"
                  max={selectedAssignment.maxPoints}
                  value={gradePoints}
                  onChange={(e) => setGradePoints(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Teacher Remarks & Feedback
                </label>
                <textarea
                  rows={3}
                  required
                  value={gradeComments}
                  onChange={(e) => setGradeComments(e.target.value)}
                  placeholder="Write constructive evaluation remarks..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowGradingModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  Publish Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Publish New Assignment</h3>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Chapter 4: Plant Tissue Diagrams"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Section</label>
                  <select
                    value={newClassGroup}
                    onChange={(e) => setNewClassGroup(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option>Class 7-A</option>
                    <option>Class 7-B</option>
                    <option>Class 7-C</option>
                    <option>Class 8-A</option>
                    <option>FY B.Sc CS</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option>General Science</option>
                    <option>Environmental Studies</option>
                    <option>Mathematics</option>
                    <option>Natural Science</option>
                    <option>Biology & Physiology</option>
                    <option>English Literature</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Due Date</label>
                  <input
                    type="text"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    placeholder="e.g. Oct 20, 2026"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Max Score</label>
                  <input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="State the guidelines and expectations for students..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  Publish to Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
