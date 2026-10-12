import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { GlobalSearchModal } from './components/ai/GlobalSearchModal';
import { NexoraAIAssistantDrawer } from './components/ai/NexoraAIAssistantDrawer';
import { SetupGuideModal } from './components/common/SetupGuideModal';

// Views
import { DashboardView } from './components/views/DashboardView';
import { MessagesView } from './components/views/MessagesView';
import { DailyBriefingView } from './components/views/DailyBriefingView';
import { AcademicsView } from './components/views/AcademicsView';
import { AssignmentsView } from './components/views/AssignmentsView';
import { DocumentsView } from './components/views/DocumentsView';
import { TimetableCalendarView } from './components/views/TimetableCalendarView';
import { ContactsView } from './components/views/ContactsView';
import { ClubsView } from './components/views/ClubsView';
import { TeacherDeskView } from './components/views/TeacherDeskView';
import { AdminConsoleView } from './components/views/AdminConsoleView';
import { NotificationsView } from './components/views/NotificationsView';
import { SettingsView } from './components/views/SettingsView';
import { SignInPageView } from './components/views/SignInPageView';
import { Mail, Phone, X, CheckCircle2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    activePage,
    searchModalOpen,
    setSearchModalOpen,
    assistantOpen,
    setAssistantOpen,
    initialAssistantQuery,
    isAuthenticated,
    lastDispatchedAlert,
    clearLastDispatchedAlert,
  } = useApp();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [setupGuideOpen, setSetupGuideOpen] = useState(false);

  // Auto-dismiss alert toast after 6 seconds
  useEffect(() => {
    if (lastDispatchedAlert) {
      const timer = setTimeout(() => {
        clearLastDispatchedAlert();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [lastDispatchedAlert, clearLastDispatchedAlert]);

  // If user is signed out, always show the SignInPageView first as requested
  if (!isAuthenticated) {
    return <SignInPageView />;
  }

  // Global keyboard shortcut: Cmd+K / Ctrl+K opens search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchModalOpen]);

  const renderActiveView = () => {
    switch (activePage) {
      case 'home':
        return <DashboardView />;
      case 'messages':
        return <MessagesView />;
      case 'briefing':
        return <DailyBriefingView />;
      case 'academics':
        return <AcademicsView />;
      case 'assignments':
        return <AssignmentsView />;
      case 'documents':
        return <DocumentsView />;
      case 'timetable':
        return <TimetableCalendarView />;
      case 'results':
        return <AcademicsView />;
      case 'contacts':
        return <ContactsView />;
      case 'clubs':
        return <ClubsView />;
      case 'teacher_desk':
        return <TeacherDeskView />;
      case 'admin_console':
        return <AdminConsoleView />;
      case 'notifications':
        return <NotificationsView />;
      case 'settings':
        return <SettingsView onOpenSetupGuide={() => setSetupGuideOpen(true)} />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100/70 text-slate-900 font-sans antialiased">
      {/* Dark Navy Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onToggleSidebarMobile={() => setMobileSidebarOpen(true)}
          onOpenSetupGuide={() => setSetupGuideOpen(true)}
        />

        {/* Scrollable View Container (with padding bottom on mobile for bottom bar) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-20 md:pb-8 bg-slate-50/60">
          {renderActiveView()}
        </main>

        {/* Mobile Bottom Navigation Bar (Handy 1-tap navigation on small screens) */}
        <MobileBottomNav onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
      </div>

      {/* Modals & Slide-out Drawers */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      <NexoraAIAssistantDrawer
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        initialQuery={initialAssistantQuery}
      />

      <SetupGuideModal
        isOpen={setupGuideOpen}
        onClose={() => setSetupGuideOpen(false)}
      />

      {/* Real-time Notification Channel Dispatch Toast (Email/SMS) */}
      {lastDispatchedAlert && (
        <div className="fixed bottom-16 md:bottom-6 right-4 md:right-6 z-50 max-w-sm sm:max-w-md w-full bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl p-3.5 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              lastDispatchedAlert.channel === 'email'
                ? 'bg-blue-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {lastDispatchedAlert.channel === 'email' ? (
              <Mail className="w-5 h-5" />
            ) : (
              <Phone className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <span>
                {lastDispatchedAlert.channel === 'email'
                  ? '✉️ Dispatched to Google Mail'
                  : '📱 Dispatched via Direct SMS'}
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                ({lastDispatchedAlert.timestamp})
              </span>
            </div>
            <div className="text-[11px] font-medium text-indigo-300 truncate mt-0.5 font-mono">
              To: {lastDispatchedAlert.target}
            </div>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-tight">
              {lastDispatchedAlert.message}
            </p>
          </div>
          <button
            onClick={clearLastDispatchedAlert}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 shrink-0"
            title="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
