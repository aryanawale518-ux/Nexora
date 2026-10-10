import React, { useState } from 'react';
import {
  FileText,
  Search,
  Folder,
  Star,
  Download,
  Eye,
  Plus,
  X,
  Upload,
  Calendar,
  User as UserIcon,
  Link as LinkIcon,
  ShieldCheck,
  Tag,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DocumentItem } from '../../types';

export const DocumentsView: React.FC = () => {
  const {
    documents,
    uploadDocument,
    toggleDocumentFavorite,
    currentUser,
    setActivePage,
  } = useApp();

  const [searchDocQuery, setSearchDocQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Science (Biology)');
  const [newFolder, setNewFolder] = useState('Class 7 / Science / Notes');
  const [newSummary, setNewSummary] = useState('');
  const [newFileType, setNewFileType] = useState<'pdf' | 'doc'>('pdf');

  const folders = [
    'all',
    'Class 7 / Science / Notes',
    'Class 7 / EVS / Resources',
    'Class 7 / Science / Lab Protocols',
    'Class 7 / Mathematics / Problem Sets',
    'General / Examinations / 2026-Q4',
  ];

  const filteredDocs = documents.filter((doc) => {
    if (favoritesOnly && !doc.isFavorite) return false;
    if (selectedFolder !== 'all' && doc.folder !== selectedFolder) return false;
    if (searchDocQuery) {
      const q = searchDocQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.subject.toLowerCase().includes(q) ||
        doc.summary.toLowerCase().includes(q) ||
        doc.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    uploadDocument({
      title: newTitle,
      subject: newSubject,
      folder: newFolder,
      fileType: newFileType,
      size: '2.1 MB',
      pages: 8,
      summary: newSummary || 'Institutional study material uploaded by faculty.',
      tags: ['Uploaded Material', newSubject],
    });

    setShowUploadModal(false);
    setNewTitle('');
    setNewSummary('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Notes & Documents Library
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
              Verified Course Repository
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse verified syllabus notes, practical manuals, model solution banks, and examination circulars.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchDocQuery}
            onChange={(e) => setSearchDocQuery(e.target.value)}
            placeholder="Search notes, chapters, or tags (e.g. Ch 3, Osmosis)..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
              favoritesOnly
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>Favorites</span>
          </button>

          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium focus:outline-none"
          >
            <option value="all">All Repository Folders</option>
            {folders.slice(1).map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between space-y-4 group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {doc.fileType} • {doc.size}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDocumentFavorite(doc.id);
                  }}
                  className="text-slate-300 hover:text-amber-500 transition"
                  title="Favorite"
                >
                  <Star
                    className={`w-4 h-4 ${doc.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`}
                  />
                </button>
              </div>

              <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition leading-snug">
                {doc.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{doc.summary}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-3">
                {doc.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>By {doc.uploader}</span>
                <span>{doc.uploadedAt}</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-indigo-600 font-semibold truncate max-w-[140px]">
                  {doc.folder.split('/').pop()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs flex items-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="py-16 text-center text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No documents match the current criteria.</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting the folder filter or search term.</p>
        </div>
      )}

      {/* Preview Document Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs">
            {/* Top header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs uppercase">
                  {previewDoc.fileType}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white truncate max-w-md">
                    {previewDoc.title}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Uploaded by {previewDoc.uploader} • {previewDoc.size} • {previewDoc.pages} pages
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated High-Res Document Viewer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-100/60 text-slate-800">
              <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-md border border-slate-200 space-y-4">
                <div className="border-b border-slate-200 pb-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                    Greenfield Academy • Academic Department
                  </span>
                  <h2 className="text-base font-extrabold text-slate-900 mt-1">
                    {previewDoc.title}
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Authorized Faculty Publication • Term Session 2026-27
                  </p>
                </div>

                <div className="space-y-3 text-slate-700 leading-relaxed text-xs">
                  <h4 className="font-bold text-slate-900">1. Executive Overview & Chapter Objectives</h4>
                  <p>{previewDoc.summary}</p>

                  <h4 className="font-bold text-slate-900 pt-2">2. Syllabus Alignment & Key Questions</h4>
                  <p>
                    Students are expected to review diagrams, label cellular organelles (nucleus, mitochondria, chloroplasts), and prepare observation sheets prior to lab sessions.
                  </p>

                  <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px]">
                    <strong>Note:</strong> This reference document is officially grounded in the Class 7 Curriculum. All diagrams must follow standard scientific conventions.
                  </div>
                </div>

                <div className="pt-6 text-center text-[10px] text-slate-400 border-t border-slate-100">
                  Document ID: {previewDoc.id} • Page 1 of {previewDoc.pages || 6} • Verified Institutional Record
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Folder: <strong className="text-slate-700">{previewDoc.folder}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    alert('Download simulated: In production with Firebase Storage connected, this streams verified storage tokens.');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Upload Institutional Resource</h3>
              <button onClick={() => setShowUploadModal(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
              ⚠️ <strong>Storage Status:</strong> Running in demo mode. Upload will persist in current session state without uploading to external cloud buckets.
            </div>

            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 Practice Question Bank"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option>Science (Biology)</option>
                    <option>Environmental Studies</option>
                    <option>Mathematics</option>
                    <option>General Administration</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">File Format</label>
                  <select
                    value={newFileType}
                    onChange={(e) => setNewFileType(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="doc">Word / Doc</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Folder</label>
                <select
                  value={newFolder}
                  onChange={(e) => setNewFolder(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  {folders.slice(1).map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Summary & Syllabus Scope</label>
                <textarea
                  rows={3}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Describe the topics and purpose of this resource..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
