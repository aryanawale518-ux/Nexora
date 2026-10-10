import React, { useState } from 'react';
import {
  Contact2,
  Search,
  Mail,
  Clock,
  ShieldCheck,
  MessageSquare,
  Building,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MOCK_DIRECTORY } from '../../data/mockData';
import { Avatar } from '../common/Avatar';

export const ContactsView: React.FC = () => {
  const { setActivePage, setActiveChannelId } = useApp();
  const [searchDirectory, setSearchDirectory] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Faculty' | 'Student' | 'Administration'>('all');

  const filteredMembers = MOCK_DIRECTORY.filter((m) => {
    if (roleFilter !== 'all' && m.roleCategory !== roleFilter) return false;
    if (searchDirectory) {
      const q = searchDirectory.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.classesTaught.some((c) => c.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Contacts & Member Directory
            </h1>
            <span className="text-xs text-slate-400 font-medium">·</span>
            <span className="text-xs text-slate-500 font-medium">Verified Roster</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Privacy-protected member registry with authorized office hours and academic consultation channels.
          </p>
        </div>

        {/* Privacy badge */}
        <div className="inline-flex items-center gap-1.5 text-slate-600 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Private phone numbers protected</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchDirectory}
            onChange={(e) => setSearchDirectory(e.target.value)}
            placeholder="Search by name, department, or class..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              roleFilter === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            All Members
          </button>
          <button
            onClick={() => setRoleFilter('Faculty')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              roleFilter === 'Faculty' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            Faculty & Teachers
          </button>
          <button
            onClick={() => setRoleFilter('Student')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              roleFilter === 'Student' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            Students
          </button>
          <button
            onClick={() => setRoleFilter('Administration')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              roleFilter === 'Administration' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            Administration
          </button>
        </div>
      </div>

      {/* Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-2xs transition flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start gap-3.5 mb-3">
                <Avatar src={member.avatar} name={member.name} size="md" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{member.name}</h3>
                  <div className="text-[11px] font-semibold text-indigo-700 mt-0.5 truncate">
                    {member.role}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {member.department}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate text-slate-700">{member.email}</span>
                </div>

                {member.officeHours && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-slate-600 leading-tight">
                      {member.officeHours}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px] text-slate-500">
                    Classes: {member.classesTaught.join(', ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                {member.roleCategory}
              </span>

              {member.authorizedDirectMessage && (
                <button
                  onClick={() => {
                    setActivePage('messages');
                    if (member.id === 'dir-1') {
                      setActiveChannelId('ch-dm-meera');
                    } else {
                      setActiveChannelId('ch-chat-7a');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center gap-1 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Message
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 p-8">
          <Contact2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No members found matching "{searchDirectory}".</p>
          <button
            onClick={() => {
              setSearchDirectory('');
              setRoleFilter('all');
            }}
            className="mt-3 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            Clear Search Filter
          </button>
        </div>
      )}
    </div>
  );
};
