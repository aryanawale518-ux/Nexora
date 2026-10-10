import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  CheckSquare,
  Menu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MobileBottomNavProps {
  onOpenMobileSidebar: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMobileSidebar }) => {
  const { activePage, setActivePage, notifications, assignments } = useApp();

  const pendingCount = assignments.filter((a) => a.status === 'pending').length;

  const navItems = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 4 },
    { id: 'timetable', label: 'Schedule', icon: Calendar },
    { id: 'assignments', label: 'Tasks', icon: CheckSquare, badge: pendingCount > 0 ? pendingCount : undefined },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-14 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around px-2 shadow-lg"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 transition-colors select-none ${
              isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2 px-1 py-0.2 bg-indigo-600 text-white rounded-full text-[9px] font-bold">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </button>
        );
      })}

      {/* More / Menu Button */}
      <button
        onClick={onOpenMobileSidebar}
        className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 text-slate-500 hover:text-slate-900 transition-colors select-none"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 tracking-tight">More</span>
      </button>
    </nav>
  );
};
