import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { executeGlobalSearch } from '../../services/searchEngine';

interface NexoraAIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: string[];
  engine?: string;
  isLiveAI?: boolean;
  timestamp: string;
}

export const NexoraAIAssistantDrawer: React.FC<NexoraAIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  initialQuery,
}) => {
  const {
    currentUser,
    assignments,
    documents,
    timetable,
    messages,
    channels,
    systemStatus,
    setActivePage,
  } = useApp();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${currentUser.name}! I am **Nexora AI**, your institutional knowledge and productivity copilot.

I am grounded in your authorized Class 7-A academic records, verified faculty notices, and the updated Timetable v2.1.

Here are helpful things you can ask me:
- *"Prepare my personalized daily briefing for today"*
- *"What do I need to bring tomorrow for science practical?"*
- *"Show my pending EVS assignments and recommended notes"*
- *"Is the Friday physics quiz postponed or is that a rumor?"*
- *"Find the latest approved timetable change"*`,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  useEffect(() => {
    if (initialQuery && isOpen) {
      handleSend(initialQuery);
    }
  }, [initialQuery, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Package grounded records restricted to current user's authorized scope
      const groundedData = {
        studentProfile: {
          name: currentUser.name,
          role: currentUser.role,
          classGroup: currentUser.classGroup,
        },
        assignments: assignments.map((a) => ({
          id: a.id,
          title: a.title,
          subject: a.subject,
          status: a.status,
          dueDate: a.dueDate,
          priority: a.priority,
          description: a.description,
          instructions: a.instructions,
        })),
        documents: documents.map((d) => ({
          id: d.id,
          title: d.title,
          subject: d.subject,
          summary: d.summary,
          folder: d.folder,
        })),
        timetable: timetable.map((t) => ({
          id: t.id,
          day: t.dayName,
          time: `${t.startTime} - ${t.endTime}`,
          subject: t.subject,
          room: t.room,
          teacher: t.teacher,
          type: t.type,
          isChanged: t.isChanged,
          changeDetails: t.changeDetails,
          requiredMaterials: t.requiredMaterials,
        })),
        officialAnnouncements: Object.values(messages)
          .flat()
          .filter((m) => m.isOfficialNotice)
          .map((m) => ({
            id: m.id,
            sender: m.senderName,
            content: m.content,
            timestamp: m.timestamp,
          })),
        chatDiscussions: Object.values(messages)
          .flat()
          .filter((m) => !m.isOfficialNotice)
          .slice(-6)
          .map((m) => ({
            id: m.id,
            sender: m.senderName,
            content: m.content,
            note: 'UNVERIFIED STUDENT CHAT',
          })),
      };

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          history: chatHistory.slice(-4),
          user: currentUser,
          groundedData,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          citations: data.citations,
          engine: data.engine,
          isLiveAI: data.isLiveAI,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatHistory((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error('Server returned error status');
      }
    } catch {
      // Robust grounded fallback using executeGlobalSearch
      const localResult = executeGlobalSearch(
        textToSend,
        {
          assignments,
          documents,
          timetable,
          messages,
          channels,
        },
        { role: currentUser.role }
      );

      let replyText = localResult.aiExplanation;
      if (localResult.verificationAudit.status === 'unverified_rumor') {
        replyText = `⚠️ **Unverified Rumor Alert**\n\n${localResult.verificationAudit.detail}`;
      } else if (localResult.verificationAudit.status === 'no_evidence_found') {
        replyText = `I searched your authorized records for "${textToSend}", but found no matching records in Class 7-A. Nexora strictly refuses to fabricate or hallucinate missing information.`;
      }

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        citations: localResult.sourceRecords,
        engine: 'Nexora Grounded Engine',
        isLiveAI: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-tight text-white">Nexora AI Copilot</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-900/80 text-indigo-300 border border-indigo-700/50">
                RAG Grounded
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {systemStatus?.geminiConfigured
                ? 'Gemini 3.8 Flash • Live Server API'
                : 'Local RAG Mode • Deterministic Grounding'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
        <button
          onClick={() => handleSend('Prepare my personalized daily briefing for today')}
          className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 shrink-0 font-medium whitespace-nowrap shadow-xs"
        >
          📅 Today's Briefing
        </button>
        <button
          onClick={() => handleSend('What do I need to bring tomorrow for science practical?')}
          className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 shrink-0 font-medium whitespace-nowrap shadow-xs"
        >
          🔬 Bio-Lab 2 Items
        </button>
        <button
          onClick={() => handleSend('Show my pending EVS assignments and recommended notes')}
          className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 shrink-0 font-medium whitespace-nowrap shadow-xs"
        >
          📝 Pending EVS Tasks
        </button>
        <button
          onClick={() => handleSend('Find the latest approved timetable change')}
          className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 shrink-0 font-medium whitespace-nowrap shadow-xs"
        >
          🕒 Room 204 Change
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs'
              }`}
            >
              {/* Message text with formatting */}
              <div className="leading-relaxed whitespace-pre-line font-normal">
                {msg.text}
              </div>

              {/* Citations and sources */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Verified Citations & Sources:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.citations.map((cite, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-indigo-700"
                      >
                        <ShieldCheck className="w-2.5 h-2.5 text-indigo-600" />
                        {cite}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Engine metadata pill */}
              <div
                className={`mt-2 flex items-center justify-between text-[10px] ${
                  msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.engine && (
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600">
                    {msg.engine}
                  </span>
                )}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-600 rounded-tl-xs flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              <span>Analyzing authorized records and timetable...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about schedules, notes, or tasks..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-11 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-1.5 p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <p className="mt-2 text-center text-[10px] text-slate-400">
          Answers strictly cite authorized records. Ordinary chat rumors are flagged as unverified.
        </p>
      </div>
    </div>
  );
};
