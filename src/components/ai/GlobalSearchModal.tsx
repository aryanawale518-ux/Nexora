import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  X,
  Sparkles,
  FileText,
  Calendar,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Megaphone,
  Filter,
  Layers,
  Clock,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { executeGlobalSearch, SearchResponse, SearchResultItem } from '../../services/searchEngine';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    assignments,
    documents,
    timetable,
    messages,
    channels,
    setActivePage,
    setActiveChannelId,
  } = useApp();

  const [query, setQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'notices' | 'assignments' | 'notes' | 'timetable' | 'discussions'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'upcoming'>('all');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'official_only' | 'unconfirmed_only'>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Preset query buttons
  const PRESET_QUERIES = [
    { label: 'Pending EVS assignments', query: 'Show my pending EVS assignments' },
    { label: 'Science practical notice', query: 'Find the latest science practical notice' },
    { label: 'What to bring tomorrow?', query: 'What do I need to bring tomorrow?' },
    { label: 'Notes for chapter 3', query: 'Show notes for chapter three' },
    { label: 'When is my next exam?', query: 'When is my next exam?' },
    { label: 'Approved timetable change', query: 'Find the latest approved timetable change' },
    { label: 'Friday physics quiz rumor?', query: 'Is the Friday physics quiz postponed?' },
    { label: 'Completed assignments', query: 'Show completed and graded assignments' },
  ];

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Execute Search Engine with current query and active filters
  const searchResponse: SearchResponse = useMemo(() => {
    return executeGlobalSearch(
      query,
      {
        assignments,
        documents,
        timetable,
        messages,
        channels,
      },
      {
        role: currentUser.role,
        classGroup: selectedClass !== 'all' ? selectedClass : undefined,
        subject: selectedSubject !== 'all' ? selectedSubject : undefined,
        category: filterCategory,
        statusFilter: statusFilter !== 'all' ? statusFilter : undefined,
        verificationLevel: verificationFilter !== 'all' ? verificationFilter : undefined,
      }
    );
  }, [
    query,
    assignments,
    documents,
    timetable,
    messages,
    channels,
    currentUser.role,
    selectedClass,
    selectedSubject,
    filterCategory,
    statusFilter,
    verificationFilter,
  ]);

  const activeFiltersCount =
    (filterCategory !== 'all' ? 1 : 0) +
    (selectedSubject !== 'all' ? 1 : 0) +
    (selectedClass !== 'all' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (verificationFilter !== 'all' ? 1 : 0);

  const resetAllFilters = () => {
    setFilterCategory('all');
    setSelectedSubject('all');
    setSelectedClass('all');
    setStatusFilter('all');
    setVerificationFilter('all');
  };

  const handleNavigateToResult = (item: SearchResultItem) => {
    if (item.deepLinkPage === 'messages' && item.channelId) {
      setActivePage('messages');
      setActiveChannelId(item.channelId);
    } else {
      setActivePage(item.deepLinkPage);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="global-search-title"
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-14 px-3 sm:px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Omnibar Header */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/80">
          <Search className="w-5 h-5 text-indigo-600 mr-3 shrink-0" />
          <input
            id="global-search-title"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search verified notices, assignments, timetable, notes..."
            className="w-full bg-transparent text-slate-800 text-sm sm:text-base placeholder-slate-400 focus:outline-none font-medium"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 mr-2 min-h-[32px] min-w-[32px] flex items-center justify-center"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition mr-2 min-h-[32px] ${
              showAdvancedFilters || activeFiltersCount > 0
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="Toggle search filters"
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-mono font-semibold rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 min-h-[32px] flex items-center justify-center"
            title="Press Escape to close"
          >
            ESC
          </button>
        </div>

        {/* Quick Query Presets Bar */}
        <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" /> Presets:
          </span>
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => setQuery(preset.query)}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition shrink-0 whitespace-nowrap text-xs font-medium shadow-2xs"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Category Pills Bar */}
        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs font-medium text-slate-600 no-scrollbar">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
              filterCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            All Categories ({searchResponse.totalMatches})
          </button>
          <button
            onClick={() => setFilterCategory('notices')}
            className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
              filterCategory === 'notices'
                ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            Official Notices
          </button>
          <button
            onClick={() => setFilterCategory('assignments')}
            className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
              filterCategory === 'assignments'
                ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            Assignments & Tasks
          </button>
          <button
            onClick={() => setFilterCategory('notes')}
            className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
              filterCategory === 'notes'
                ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            Notes & Documents
          </button>
          <button
            onClick={() => setFilterCategory('timetable')}
            className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
              filterCategory === 'timetable'
                ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            Timetable & Schedule
          </button>
          <button
            onClick={() => setFilterCategory('discussions')}
            className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
              filterCategory === 'discussions'
                ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            Student Discussions
          </button>
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in slide-in-from-top duration-150">
            {/* Subject Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Subjects</option>
                <option value="Science">General Science / Biology</option>
                <option value="Environmental">Environmental Studies (EVS)</option>
                <option value="Mathematics">Mathematics</option>
                <option value="English">English Literature</option>
                <option value="Social Studies">Social Studies</option>
              </select>
            </div>

            {/* Class Group Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Class Group
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Classes</option>
                <option value="Class 7-A">Class 7-A</option>
                <option value="Class 7-B">Class 7-B</option>
                <option value="Class 8-A">Class 8-A</option>
              </select>
            </div>

            {/* Assignment Status Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Assignment Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Only</option>
                <option value="completed">Completed / Graded</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>

            {/* Verification Level Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Verification Level
              </label>
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Verification</option>
                <option value="official_only">Official Notices Only</option>
                <option value="unconfirmed_only">Unconfirmed Chat Only</option>
              </select>
            </div>

            {activeFiltersCount > 0 && (
              <div className="col-span-2 sm:col-span-4 flex justify-end pt-1">
                <button
                  onClick={resetAllFilters}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* AI Semantic Grounding & Verification Audit Banner */}
          {searchResponse.verificationAudit.status === 'unverified_rumor' && (
            <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/90 text-amber-950 flex items-start gap-3 shadow-2xs animate-in fade-in duration-200">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold flex items-center gap-2 text-amber-900 text-sm">
                  <span>CRITICAL VERIFICATION AUDIT: Unconfirmed Postponement Rumor</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold uppercase">
                    Unverified
                  </span>
                </div>
                <p className="leading-relaxed text-amber-900 font-medium">
                  {searchResponse.verificationAudit.detail}
                </p>
                <p className="text-[11px] text-amber-800 pt-1">
                  <strong>Nexora Verification Rule:</strong> Ordinary student chat messages suggesting class cancellations or quiz postponements must <em>never</em> be treated as confirmed changes without formal approval from an authorized teacher or administrator.
                </p>
              </div>
            </div>
          )}

          {searchResponse.verificationAudit.status === 'no_evidence_found' && query.trim() !== '' && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 flex items-start gap-3 shadow-2xs">
              <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-slate-900 text-sm">
                  Verification Audit: No Evidence Found in Authorized Records
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {searchResponse.verificationAudit.detail}
                </p>
                <p className="text-[11px] text-slate-500">
                  Nexora strictly adheres to institutional grounding: we never invent, hallucinate, or fabricate unverified deadlines, room numbers, or notices.
                </p>
              </div>
            </div>
          )}

          {searchResponse.verificationAudit.status === 'verified' && searchResponse.aiExplanation && (
            <div className="p-4 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-blue-50/60 to-purple-50/40 text-slate-800 flex items-start gap-3 shadow-2xs">
              <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-indigo-950 text-sm flex items-center gap-1.5">
                    Nexora Semantic AI Interpretation
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified Records
                    </span>
                  </span>
                  <span className="text-[10px] text-indigo-600 font-mono">
                    {searchResponse.totalMatches} item(s) matched
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {searchResponse.aiExplanation}
                </p>

                {/* Grounded Source Citations */}
                {searchResponse.sourceRecords.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-indigo-100 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider mr-1">
                      Grounded Sources:
                    </span>
                    {searchResponse.sourceRecords.slice(0, 4).map((src, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium bg-white text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md shadow-2xs"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Result Cards List */}
          {searchResponse.results.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                <span>Matching Institutional Records ({searchResponse.results.length})</span>
                <span className="text-[10px] text-slate-400 font-normal normal-case">
                  Click any record to navigate directly
                </span>
              </div>

              {searchResponse.results.map((item) => {
                const isOfficial = item.isOfficial;
                return (
                  <div
                    key={`${item.category}-${item.id}`}
                    onClick={() => handleNavigateToResult(item)}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-start justify-between gap-3 shadow-2xs group ${
                      !isOfficial
                        ? 'border-dashed border-slate-300 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-400'
                        : item.category === 'notice'
                        ? 'border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/70 hover:border-indigo-300'
                        : item.category === 'timetable' && item.status === 'confirmed_change'
                        ? 'border-amber-200 bg-amber-50/40 hover:bg-amber-50/80 hover:border-amber-300'
                        : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      {/* Meta badge line */}
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        {/* Category Tag */}
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            item.category === 'notice'
                              ? 'bg-indigo-100 text-indigo-800'
                              : item.category === 'assignment'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.category === 'note'
                              ? 'bg-blue-100 text-blue-800'
                              : item.category === 'timetable'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {item.category === 'notice' && <Megaphone className="w-3 h-3" />}
                          {item.category === 'assignment' && <CheckCircle2 className="w-3 h-3" />}
                          {item.category === 'note' && <FileText className="w-3 h-3" />}
                          {item.category === 'timetable' && <Calendar className="w-3 h-3" />}
                          {item.category === 'discussion' && <MessageSquare className="w-3 h-3" />}
                          {item.category}
                        </span>

                        {/* Status Badge */}
                        {item.status && (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              item.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : item.status === 'graded'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'confirmed_change'
                                ? 'bg-indigo-100 text-indigo-800 font-bold'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.status.toUpperCase().replace('_', ' ')}
                          </span>
                        )}

                        {/* Verification indicator */}
                        {isOfficial ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.2 rounded">
                            <ShieldCheck className="w-3 h-3" /> Official Record
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.2 rounded">
                            Unconfirmed Peer Chat
                          </span>
                        )}

                        {item.date && (
                          <span className="text-[11px] text-slate-400 font-mono tabular-nums ml-auto">
                            {item.date}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </h4>

                      {/* Excerpt */}
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {item.excerpt}
                      </p>

                      {/* Unconfirmed warning banner inside card */}
                      {item.unconfirmedWarning && (
                        <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium">
                          ⚠️ {item.unconfirmedWarning}
                        </div>
                      )}

                      {/* Source Citation & Publisher footer */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                        <span className="font-semibold text-indigo-600 bg-indigo-50/60 px-2 py-0.5 rounded border border-indigo-100 truncate max-w-full">
                          Source: {item.source}
                        </span>
                        {item.publisher && (
                          <span className="text-slate-400">
                            Publisher: <strong className="text-slate-600">{item.publisher}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Arrow */}
                    <div className="sm:self-center shrink-0 flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:text-indigo-800">
                      <span className="hidden sm:inline">Open</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="py-12 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">No institutional records matched</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  {activeFiltersCount > 0
                    ? 'No records match the current combination of filters. Try resetting the filters or modifying your query.'
                    : 'Try one of the preset quick queries above, or search by faculty name, subject, or assignment title.'}
                </p>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Greenfield Public School</span>
            <span>·</span>
            <span>Class 7-A Roster</span>
            <span>·</span>
            <span>Strict Role & Grounding Policy</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Press <kbd className="font-mono bg-white px-1 rounded border border-slate-200 text-slate-600">ESC</kbd> to exit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
