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

const MainAppContent: React.FC = () => {
  const {
    activePage,
    searchModalOpen,
    setSearchModalOpen,
    assistantOpen,
    setAssistantOpen,
    initialAssistantQuery,
  } = useApp();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [setupGuideOpen, setSetupGuideOpen] = useState(false);

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
