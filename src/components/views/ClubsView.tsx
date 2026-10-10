import React from 'react';
import {
  Compass,
  Users,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MOCK_CLUBS } from '../../data/mockData';

export const ClubsView: React.FC = () => {
  const { setActivePage, setActiveChannelId } = useApp();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Clubs, Projects & Activities
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Co-Curricular Guilds
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Student-led initiatives, environmental projects, STEM robotics, and academic olympiad cells.
          </p>
        </div>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MOCK_CLUBS.map((club) => (
          <div
            key={club.id}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {club.category}
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {club.membersCount}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base">{club.name}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{club.description}</p>

              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{club.meetingTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{club.room}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Lead: {club.lead}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="text-[11px] text-slate-600">
                <strong>Active Project:</strong> {club.activeProject}
              </div>

              <button
                onClick={() => {
                  setActivePage('messages');
                  setActiveChannelId('ch-evs-club');
                }}
                className="w-full py-2 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-800 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <span>Open Club Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
