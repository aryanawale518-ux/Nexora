import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  ShieldCheck,
  Calendar,
  CheckSquare,
  FileText,
  MessageSquare,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsRead,
    setActivePage,
  } = useApp();

  const [filterType, setFilterType] = useState<string>('all');

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !n.read;
    return n.category === filterType;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Notification Center
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              Institutional Dispatch
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time feed of official faculty circulars, room relocations, deadline countdowns, and feedback.
          </p>
        </div>

        <button
          onClick={markAllNotificationsRead}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
        >
          <CheckCheck className="w-4 h-4 text-indigo-600" />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-medium text-slate-600 overflow-x-auto">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg transition ${
            filterType === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-100'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType('unread')}
          className={`px-3 py-1.5 rounded-lg transition ${
            filterType === 'unread' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-100'
          }`}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>
        <button
          onClick={() => setFilterType('notice')}
          className={`px-3 py-1.5 rounded-lg transition ${
            filterType === 'notice' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-100'
          }`}
        >
          Official Circulars
        </button>
        <button
          onClick={() => setFilterType('timetable')}
          className={`px-3 py-1.5 rounded-lg transition ${
            filterType === 'timetable' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-100'
          }`}
        >
          Timetable Updates
        </button>
        <button
          onClick={() => setFilterType('assignment')}
          className={`px-3 py-1.5 rounded-lg transition ${
            filterType === 'assignment' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-100'
          }`}
        >
          Assignments
        </button>
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
        {filteredNotifs.map((n) => (
          <div
            key={n.id}
            onClick={() => {
              markNotificationAsRead(n.id);
              setActivePage(n.linkPage);
            }}
            className={`p-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition cursor-pointer text-xs ${
              !n.read ? 'bg-indigo-50/30' : ''
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                  !n.read ? 'bg-indigo-600 ring-4 ring-indigo-100' : 'bg-slate-300'
                }`}
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                  {n.isOfficial && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.2 rounded">
                      <ShieldCheck className="w-3 h-3" /> Verified Official
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">• {n.time}</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-xs">{n.description}</p>
                {n.publisher && (
                  <span className="text-[11px] text-indigo-600 font-semibold block pt-0.5">
                    Published by {n.publisher}
                  </span>
                )}
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
          </div>
        ))}

        {filteredNotifs.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No notifications in this filter category.
          </div>
        )}
      </div>
    </div>
  );
};
