import React, { useState } from 'react';
import {
  GraduationCap,
  Download,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MOCK_ATTENDANCE, MOCK_ASSESSMENTS } from '../../data/mockData';

export const AcademicsView: React.FC = () => {
  const { currentWorkspace, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'attendance' | 'marks' | 'progress' | 'corporate'>(
    currentWorkspace.type === 'corporate' ? 'corporate' : 'attendance'
  );

  const isCorporate = currentWorkspace.type === 'corporate';

  // Overall attendance calculation
  const totalHeld = MOCK_ATTENDANCE.reduce((acc, curr) => acc + curr.classesHeld, 0);
  const totalAttended = MOCK_ATTENDANCE.reduce((acc, curr) => acc + curr.attended, 0);
  const overallPercentage = ((totalAttended / totalHeld) * 100).toFixed(1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              {isCorporate ? 'Organization ERP & Team Workspace' : 'Academic Records & ERP Portal'}
            </h1>
            <span className="text-xs text-slate-400 font-medium">·</span>
            <span className="text-xs text-slate-500 font-medium">{currentWorkspace.academicYearOrQuarter}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isCorporate
              ? 'Department objectives, corporate rosters, team deliverables, and compliance tracking.'
              : 'Permission-authenticated attendance registry, term assessments, and official report cards.'}
          </p>
        </div>

        {/* Fictional demo data notice */}
        <div className="inline-flex items-center gap-1.5 text-slate-500 text-xs">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Fictional sample dataset for demonstration</span>
        </div>
      </div>

      {/* Segmented Tab Control */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl max-w-fit overflow-x-auto text-xs font-medium">
        {!isCorporate ? (
          <>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'attendance'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Attendance Ledger
            </button>
            <button
              onClick={() => setActiveTab('marks')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'marks'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Assessments & Marks
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'progress'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Term Progress Report
            </button>
          </>
        ) : (
          <button
            onClick={() => setActiveTab('corporate')}
            className="px-3.5 py-1.5 rounded-lg bg-white text-slate-900 shadow-2xs font-semibold whitespace-nowrap"
          >
            Enterprise Team Workspace
          </button>
        )}
      </div>

      {/* 1. Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Top Stat Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 block">
                  Overall Attendance
                </span>
                <span className="text-2xl font-bold text-slate-900 mt-1 block font-mono tabular-nums">
                  {overallPercentage}%
                </span>
                <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
                  Above 75% minimum policy requirement
                </span>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-indigo-700 text-xs font-mono tabular-nums">
                {overallPercentage}%
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-medium text-slate-500 block">
                Total Classes Held
              </span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block font-mono tabular-nums">{totalHeld}</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Across 5 subjects</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-medium text-slate-500 block">
                Sessions Attended
              </span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block font-mono tabular-nums">
                {totalAttended}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block font-mono tabular-nums">
                {totalHeld - totalAttended} excused medical absences
              </span>
            </div>
          </div>

          {/* Subject-Wise Attendance Table */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Subject-Wise Attendance Ledger</h3>
              <span className="text-xs text-slate-400 font-medium">Audited by Homeroom</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 font-semibold">Subject</th>
                    <th className="pb-3 font-semibold text-right">Classes Held</th>
                    <th className="pb-3 font-semibold text-right">Attended</th>
                    <th className="pb-3 font-semibold">Percentage</th>
                    <th className="pb-3 font-semibold text-right">Recent Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {MOCK_ATTENDANCE.map((rec, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 font-semibold text-slate-900">{rec.subject}</td>
                      <td className="py-3 text-right font-mono tabular-nums">{rec.classesHeld}</td>
                      <td className="py-3 text-right font-medium text-slate-800 font-mono tabular-nums">{rec.attended}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full"
                              style={{ width: `${rec.percentage}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-900 font-mono tabular-nums">{rec.percentage}%</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-[11px] font-medium text-emerald-700">
                          {rec.recentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Marks & Assessments Tab */}
      {activeTab === 'marks' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Term 2 Published Assessments</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified marks endorsed by Dr. Meera Sen and Examination Committee.
                </p>
              </div>
              <button
                onClick={() => alert('Statement download simulated: Official certificate generated.')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center gap-1.5 transition whitespace-nowrap min-h-[36px]"
              >
                <Download className="w-3.5 h-3.5" />
                Download Statement
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {MOCK_ASSESSMENTS.map((as) => (
                <div key={as.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{as.title}</span>
                      <span className="text-[11px] font-bold text-indigo-700 font-mono">
                        Grade {as.grade}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
                      Subject: {as.subject} · Conducted: {as.date}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 italic">
                      Remarks: "{as.remarks}"
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    {as.status === 'published' ? (
                      <div>
                        <span className="text-base font-bold text-slate-900 block font-mono tabular-nums">
                          {as.obtainedMarks} / {as.maxMarks}
                        </span>
                        <span className="text-[10px] text-slate-400">Score</span>
                      </div>
                    ) : (
                      <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                        Scheduled
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Progress Report */}
      {activeTab === 'progress' && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-6 text-xs text-slate-700">
          <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                Greenfield Academy · Mid-Term Cumulative Progress Report
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Student: {currentUser.name} (Class 7-A, Roll #14)
              </h2>
            </div>
            <span className="text-xs font-semibold text-emerald-800">
              Promoted (Honor Roll)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Faculty Observations:</h4>
              <p className="leading-relaxed text-slate-600">
                Aarav demonstrates strong analytical inquiry in Natural Sciences and Biology laboratory work.
                Microscopy diagrams and cytological specimen slides are prepared with meticulous precision.
              </p>
              <p className="leading-relaxed text-slate-600">
                Homeroom advisor Prof. Rajesh Verma notes high leadership engagement in the Green Earth Eco-Warriors club and punctual homeroom attendance.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 font-mono tabular-nums">
              <h4 className="font-bold text-slate-900 text-xs font-sans">Cumulative Indicators:</h4>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="font-sans text-slate-600">Weighted GPA:</span>
                <span className="font-bold text-slate-900">3.92 / 4.00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="font-sans text-slate-600">Overall Term Attendance:</span>
                <span className="font-bold text-slate-900">{overallPercentage}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-sans text-slate-600">Co-Curricular Ranking:</span>
                <span className="font-bold text-emerald-700">Top 5% (Eco-Warriors Lead)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Corporate Enterprise Mode */}
      {activeTab === 'corporate' && (
        <div className="space-y-6 text-xs">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Nexora Labs Enterprise OKRs & Teams</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="font-bold text-slate-900 block">Engineering Team</span>
                <p className="text-slate-500 mt-1">Core API migration, WebSocket latency reduction, and multi-tenant security rules.</p>
                <span className="mt-3 inline-block font-semibold text-indigo-600">12 Active Tasks →</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="font-bold text-slate-900 block">Product Design</span>
                <p className="text-slate-500 mt-1">Design system tokens, responsive mobile views, and accessibility AAA compliance.</p>
                <span className="mt-3 inline-block font-semibold text-indigo-600">8 Active Tasks →</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="font-bold text-slate-900 block">Operations & HR</span>
                <p className="text-slate-500 mt-1">Employee onboarding workflows, department audits, and quarterly townhall schedules.</p>
                <span className="mt-3 inline-block font-semibold text-indigo-600">5 Active Tasks →</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
