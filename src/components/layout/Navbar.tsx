import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  ChevronDown,
  Building2,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Info,
  Check,
  Menu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WORKSPACES, MOCK_USERS } from '../../data/mockData';
import { UserRole } from '../../types';
import { Avatar } from '../common/Avatar';

interface NavbarProps {
  onToggleSidebarMobile?: () => void;
  onOpenSetupGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebarMobile, onOpenSetupGuide }) => {
  const {
    currentUser,
    switchUserRole,
    currentWorkspace,
    switchWorkspace,
    setSearchModalOpen,
    setAssistantOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsRead,
    setActivePage,
    logout,
    authDeliveryMethod,
  } = useApp();

  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/90 px-4 md:px-6 flex items-center justify-between shadow-2xs">
      {/* Zone 1: Brand & Workspace */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSidebarMobile}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg md:hidden min-h-[40px] min-w-[40px] flex items-center justify-center"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Wordmark (Single clean line) */}
        <div
          onClick={() => setActivePage('home')}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <span className="font-extrabold text-white text-base tracking-wider">N</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-slate-900 tracking-tight text-base">Nexora</span>
            <span className="hidden sm:inline text-xs text-slate-400 font-medium">·</span>
            <span className="hidden sm:inline text-xs text-slate-500 font-medium truncate max-w-[140px]">
              {currentWorkspace.name.split(' ')[0]}
            </span>
          </div>
        </div>

        {/* Workspace Dropdown */}
        <div className="relative hidden xl:block ml-1">
          <button
            onClick={() => {
              setWorkspaceDropdownOpen(!workspaceDropdownOpen);
              setRoleDropdownOpen(false);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium transition"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="max-w-[130px] truncate">{currentWorkspace.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {workspaceDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-40 text-xs animate-in fade-in-50 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Workspace
              </div>
              {WORKSPACES.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    switchWorkspace(ws.id);
                    setWorkspaceDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                    currentWorkspace.id === ws.id
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-900">{ws.name}</div>
                    <div className="text-[10px] text-slate-500">{ws.academicYearOrQuarter}</div>
                  </div>
                  {currentWorkspace.id === ws.id && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zone 2: Global Search Omnibar */}
      <div className="flex-1 max-w-xl mx-3 md:mx-6">
        <div
          onClick={() => setSearchModalOpen(true)}
          className="relative flex items-center w-full px-3.5 py-2 rounded-xl bg-slate-100/90 hover:bg-slate-100/80 border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 cursor-pointer transition shadow-2xs group"
        >
          <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0 group-hover:text-indigo-600 transition-colors" />
          <span className="text-xs truncate flex-1 font-normal">
            Search verified notices, assignments, timetable...
          </span>
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
            <span>⌘K</span>
          </div>
        </div>
      </div>

      {/* Zone 3: Actions, Role Switcher, Notifications & Profile */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Nexora AI Action */}
        <button
          onClick={() => setAssistantOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold shadow-xs hover:bg-indigo-700 transition"
          title="Open Nexora AI Copilot"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Nexora AI</span>
        </button>

        {/* Role Switcher (Preview RBAC) */}
        <div className="relative">
          <button
            onClick={() => {
              setRoleDropdownOpen(!roleDropdownOpen);
              setWorkspaceDropdownOpen(false);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition"
            title="Switch User Role to test RBAC"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="hidden md:inline font-semibold">{currentUser.roleLabel.split(' ')[0]}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-40 text-xs animate-in fade-in-50 duration-150">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Role Switcher (RBAC)</span>
                <span className="text-[9px] text-indigo-600 font-semibold">Test Personas</span>
              </div>
              <div className="space-y-1 mt-1">
                {MOCK_USERS.map((usr) => (
                  <button
                    key={usr.id}
                    onClick={() => {
                      switchUserRole(usr.role);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition ${
                      currentUser.role === usr.role
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Avatar src={usr.avatar} name={usr.name} size="xs" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{usr.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{usr.roleLabel}</div>
                    </div>
                    {currentUser.role === usr.role && (
                      <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setRoleDropdownOpen(false);
              setWorkspaceDropdownOpen(false);
            }}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center border-2 border-white tabular-nums font-mono">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-40 overflow-hidden animate-in fade-in-50 duration-150">
              <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs">Notifications</h4>
                  <p className="text-[10px] text-slate-400">Official notices & deadlines</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[10px] text-indigo-300 hover:text-white font-semibold underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationAsRead(n.id);
                      setActivePage(n.linkPage);
                      setNotificationsOpen(false);
                    }}
                    className={`p-3.5 hover:bg-slate-50 cursor-pointer transition flex items-start gap-3 ${
                      !n.read ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        !n.read ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono tabular-nums">{n.time}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">
                        {n.description}
                      </p>
                      {n.publisher && (
                        <span className="text-[10px] text-indigo-600 font-medium mt-1 block">
                          By {n.publisher}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-center">
                <button
                  onClick={() => {
                    setActivePage('notifications');
                    setNotificationsOpen(false);
                  }}
                  className="text-xs text-indigo-600 font-semibold hover:underline"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* System Checklist button */}
        <button
          onClick={onOpenSetupGuide}
          className="hidden sm:flex p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          title="Architecture & Setup Checklist"
        >
          <Info className="w-4 h-4" />
        </button>

        {/* User Profile Avatar & Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setRoleDropdownOpen(false);
              setNotificationsOpen(false);
            }}
            className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-indigo-300 transition shrink-0"
            title="User Profile Menu"
          >
            <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 max-w-[calc(100vw-2rem)] origin-top-right bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in-50 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="font-bold text-slate-900 truncate">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                <div className="text-[10px] text-indigo-700 font-medium mt-0.5">
                  {currentUser.roleLabel}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setActivePage('settings');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 text-left"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Account & Settings</span>
                </button>
                <button
                  onClick={() => {
                    onOpenSetupGuide();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 text-left"
                >
                  <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>System Architecture</span>
                </button>

                <div className="my-1 border-t border-slate-100 px-3 py-1.5 text-[10px] text-slate-500 bg-slate-50 rounded-lg">
                  <div className="font-semibold text-slate-700">Notification Channel:</div>
                  <div className="text-emerald-700 flex items-center gap-1 mt-0.5 font-medium">
                    {authDeliveryMethod === 'google' ? '✉️ Google Mail SSO' : '📱 SMS Direct Alerts'}
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 text-left font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
