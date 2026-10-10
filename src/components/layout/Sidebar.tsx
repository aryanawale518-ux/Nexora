import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  GraduationCap,
  CheckSquare,
  FileText,
  Calendar,
  Sparkles,
  BarChart2,
  Contact2,
  Compass,
  Briefcase,
  Shield,
  Bell,
  Settings,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../common/Avatar';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const {
    activePage,
    setActivePage,
    currentUser,
    notifications,
    assignments,
  } = useApp();

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const pendingAssignments = assignments.filter((a) => a.status === 'pending').length;

  const isFacultyOrAdmin = currentUser.role === 'teacher' || currentUser.role === 'class_teacher' || currentUser.role === 'admin';
  const isAdmin = currentUser.role === 'admin';

  interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
    requiresFaculty?: boolean;
    requiresAdmin?: boolean;
    section?: string;
  }

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'messages', label: 'Messages & Groups', icon: MessageSquare, badge: 4, badgeColor: 'bg-indigo-600' },
    { id: 'briefing', label: 'Daily Briefing', icon: Sparkles },
    { id: 'academics', label: 'Academics & ERP', icon: GraduationCap },
    { id: 'assignments', label: 'Assignments & Tasks', icon: CheckSquare, badge: pendingAssignments > 0 ? pendingAssignments : undefined, badgeColor: 'bg-amber-600' },
    { id: 'documents', label: 'Notes & Documents', icon: FileText },
    { id: 'timetable', label: 'Timetable & Calendar', icon: Calendar },
    { id: 'results', label: 'Results & Reports', icon: BarChart2 },
    { id: 'contacts', label: 'Contacts & Directory', icon: Contact2 },
    { id: 'clubs', label: 'Clubs & Activities', icon: Compass },

    // Role-specific workspaces
    {
      id: 'teacher_desk',
      label: 'Teacher Desk',
      icon: Briefcase,
      requiresFaculty: true,
      section: 'Faculty Management',
    },
    {
      id: 'admin_console',
      label: 'Admin Console',
      icon: Shield,
      requiresAdmin: true,
      section: 'Governance',
    },

    // Bottom general
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifs > 0 ? unreadNotifs : undefined, badgeColor: 'bg-rose-500', section: 'System' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (pageId: string) => {
    setActivePage(pageId);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Top Mobile Header */}
      <div className="flex md:hidden items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-base">
            N
          </div>
          <span className="font-bold text-white text-base tracking-tight">Nexora</span>
        </div>
        <button
          onClick={onCloseMobile}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 min-h-[40px] min-w-[40px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User Persona Card in Sidebar */}
      <div className="p-3.5 mx-3 my-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
        <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
          <div className="text-[10px] text-slate-400 truncate">{currentUser.roleLabel}</div>
        </div>
      </div>

      {/* Nav Items List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 text-xs">
        {navItems.map((item) => {
          if (item.requiresFaculty && !isFacultyOrAdmin) return null;
          if (item.requiresAdmin && !isAdmin) return null;

          const isActive = activePage === item.id;
          const Icon = item.icon;

          return (
            <React.Fragment key={item.id}>
              {item.section && (
                <div className="pt-3 pb-1 px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  {item.section}
                </div>
              )}
              <button
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition group whitespace-nowrap min-h-[38px] ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white shrink-0 font-mono tabular-nums ${
                      item.badgeColor || 'bg-indigo-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Bottom Footer Info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Greenfield Acad.</span>
        <span className="font-mono text-slate-400">Class 7-A</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-800 z-20">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
