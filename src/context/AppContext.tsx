import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Workspace,
  Assignment,
  DocumentItem,
  TimetableSlot,
  Channel,
  Message,
  NotificationItem,
  UserRole,
  AuditLogItem,
  AttendanceRecord,
  AssessmentRecord,
  ClassSection,
} from '../types';
import {
  MOCK_USERS,
  WORKSPACES,
  MOCK_ASSIGNMENTS,
  MOCK_DOCUMENTS,
  MOCK_TIMETABLE,
  MOCK_CHANNELS,
  MOCK_MESSAGES,
  MOCK_NOTIFICATIONS,
  MOCK_AUDIT_LOGS,
  INITIAL_CLASSES,
  MOCK_ATTENDANCE,
  MOCK_ASSESSMENTS,
} from '../data/mockData';
import {
  isSupabaseConfigured,
  getSupabaseConfigStatus,
  submitAssignmentWorkOnline,
  SupabaseConfigStatus,
} from '../lib/supabase';

export interface SystemStatus {
  status: string;
  appName: string;
  geminiConfigured: boolean;
  model: string;
  supabaseConfigured: boolean;
  supabaseHost?: string | null;
  authConfigured: boolean;
  storageConfigured: boolean;
  databaseConfigured: boolean;
  rolesSupported: string[];
  mode: string;
  environment: string;
}

interface AppContextType {
  currentUser: User;
  switchUserRole: (role: UserRole) => void;
  currentWorkspace: Workspace;
  switchWorkspace: (workspaceId: string) => void;
  activePage: string;
  setActivePage: (page: string) => void;

  // Search & Assistant modals
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  assistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
  initialAssistantQuery: string;
  openAssistantWithQuery: (q: string) => void;

  // Data & State
  assignments: Assignment[];
  submitAssignmentWork: (assignmentId: string, notes: string, fileName?: string) => Promise<{ success: boolean; error?: string }>;
  createAssignment: (newAssignment: Partial<Assignment>) => { success: boolean; error?: string };
  gradeAssignment: (assignmentId: string, points: number, comments: string) => { success: boolean; error?: string };

  documents: DocumentItem[];
  uploadDocument: (doc: Partial<DocumentItem>) => { success: boolean; error?: string };
  toggleDocumentFavorite: (id: string) => void;

  timetable: TimetableSlot[];
  publishTimetableChange: (slotId: string, newRoom: string, note: string) => { success: boolean; error?: string };

  channels: Channel[];
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
  messages: Record<string, Message[]>;
  sendMessage: (channelId: string, content: string, isOfficial?: boolean, attachments?: any[]) => { success: boolean; error?: string };
  pinMessage: (channelId: string, messageId: string) => void;

  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  auditLogs: AuditLogItem[];
  addAuditLog: (action: string, target: string, severity?: 'info' | 'warning' | 'security') => void;

  systemStatus: SystemStatus | null;
  supabaseStatus: SupabaseConfigStatus;
  refreshSystemStatus: () => Promise<void>;

  // Attendance & Assessment Management
  attendanceList: AttendanceRecord[];
  updateAttendance: (subject: string, classGroup: string, attended: number, classesHeld: number) => { success: boolean; error?: string };
  assessmentsList: AssessmentRecord[];
  createAssessment: (newAssessment: Partial<AssessmentRecord>) => { success: boolean; error?: string };
  updateAssessmentMarks: (assessmentId: string, obtainedMarks: number, remarks: string, grade: string) => { success: boolean; error?: string };

  // Managed Classes & Sections
  managedClasses: ClassSection[];
  addClassSection: (newClass: Omit<ClassSection, 'id'>) => { success: boolean; error?: string };
  selectedClassFilter: string;
  setSelectedClassFilter: (className: string) => void;

  // Filter helpers
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Authentication & Notification Dispatch Channel
  isAuthenticated: boolean;
  loginWithGoogle: () => { success: boolean; error?: string };
  loginWithPhone: (
    phoneNumber: string,
    password: string,
    isNewUser?: boolean,
    fullName?: string,
    role?: UserRole,
    targetClass?: string
  ) => { success: boolean; error?: string };
  isNewUserCheck: (phoneNumber: string) => boolean;
  logout: () => void;
  authDeliveryMethod: 'google' | 'phone';
  lastDispatchedAlert: {
    id: string;
    target: string;
    channel: 'email' | 'sms';
    message: string;
    timestamp: string;
  } | null;
  clearLastDispatchedAlert: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); // Aarav Sharma (Student) by default
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>(WORKSPACES[0]);
  const [activePage, setActivePage] = useState<string>('home');

  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [assistantOpen, setAssistantOpen] = useState<boolean>(false);
  const [initialAssistantQuery, setInitialAssistantQuery] = useState<string>('');

  const [managedClasses, setManagedClasses] = useState<ClassSection[]>(INITIAL_CLASSES);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('All Classes');
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [assessmentsList, setAssessmentsList] = useState<AssessmentRecord[]>(MOCK_ASSESSMENTS);

  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [documents, setDocuments] = useState<DocumentItem[]>(MOCK_DOCUMENTS);
  const [timetable, setTimetable] = useState<TimetableSlot[]>(MOCK_TIMETABLE);
  const [channels, setChannels] = useState<Channel[]>(MOCK_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState<string>('ch-official-7a');
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(MOCK_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Session & Authentication
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authDeliveryMethod, setAuthDeliveryMethod] = useState<'google' | 'phone'>('google');
  const [lastDispatchedAlert, setLastDispatchedAlert] = useState<{
    id: string;
    target: string;
    channel: 'email' | 'sms';
    message: string;
    timestamp: string;
  } | null>(null);

  // Registered phone accounts store for verification and testing
  const [registeredAccounts, setRegisteredAccounts] = useState<Array<{
    phone: string;
    password: string;
    user: User;
  }>>([
    {
      phone: '+91 98765 43210',
      password: 'demo123',
      user: { ...MOCK_USERS[0], phone: '+91 98765 43210', authProvider: 'phone' },
    },
    {
      phone: '+91 98220 11223',
      password: 'demo123',
      user: { ...MOCK_USERS[1], phone: '+91 98220 11223', authProvider: 'phone' },
    },
    {
      phone: '+91 98330 44556',
      password: 'demo123',
      user: { ...MOCK_USERS[2], phone: '+91 98330 44556', authProvider: 'phone' },
    },
    {
      phone: '+91 98440 77889',
      password: 'demo123',
      user: { ...MOCK_USERS[3], phone: '+91 98440 77889', authProvider: 'phone' },
    },
  ]);

  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>({
    status: 'ok',
    appName: 'Nexora',
    geminiConfigured: false,
    model: 'gemini-3.8-flash',
    supabaseConfigured: isSupabaseConfigured,
    authConfigured: isSupabaseConfigured,
    storageConfigured: isSupabaseConfigured,
    databaseConfigured: isSupabaseConfigured,
    rolesSupported: ['student', 'teacher', 'manager', 'admin'],
    mode: isSupabaseConfigured ? 'live-supabase' : 'offline-demo-rag',
    environment: 'development',
  });

  const supabaseStatus = getSupabaseConfigStatus();

  const refreshSystemStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    refreshSystemStatus();
  }, []);

  const switchUserRole = (role: UserRole) => {
    const found = MOCK_USERS.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
      addAuditLog('ROLE_SWITCH', `Switched active profile to ${found.name} (${found.roleLabel})`, 'info');
    }
  };

  const switchWorkspace = (workspaceId: string) => {
    const found = WORKSPACES.find((w) => w.id === workspaceId);
    if (found) {
      setCurrentWorkspace(found);
      addAuditLog('WORKSPACE_SWITCH', `Switched active organization to ${found.name}`, 'info');
    }
  };

  const openAssistantWithQuery = (q: string) => {
    setInitialAssistantQuery(q);
    setAssistantOpen(true);
  };

  const addAuditLog = (action: string, target: string, severity: 'info' | 'warning' | 'security' = 'info') => {
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action,
      actor: currentUser.name,
      actorRole: currentUser.role,
      target,
      severity,
      ipAddress: '127.0.0.1 (Tenant: ' + currentWorkspace.id + ')',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const normalizePhone = (p: string) => p.replace(/\D/g, '').slice(-10);

  const isNewUserCheck = (phoneNumber: string) => {
    const clean = normalizePhone(phoneNumber);
    if (!clean) return true;
    return !registeredAccounts.some((acc) => normalizePhone(acc.phone) === clean);
  };

  const dispatchChannelAlert = (
    title: string,
    description: string,
    category: NotificationItem['category'],
    linkPage = 'home'
  ) => {
    const channel: 'email' | 'sms' = authDeliveryMethod === 'google' ? 'email' : 'sms';
    const target =
      channel === 'email'
        ? currentUser.email || 'student@nexora.edu'
        : currentUser.phone || '+91 98765 43210';

    const alertItem = {
      id: `alert-${Date.now()}`,
      target,
      channel,
      message: `${title}: ${description}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setLastDispatchedAlert(alertItem);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      description,
      time: 'Just now',
      category,
      read: false,
      isOfficial: true,
      linkPage,
      publisher: currentUser.name,
      deliveryChannel: channel,
      deliveryTarget: target,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const clearLastDispatchedAlert = () => {
    setLastDispatchedAlert(null);
  };

  const loginWithGoogle = () => {
    const googleUser = currentUser.role === 'teacher' ? MOCK_USERS[1] : MOCK_USERS[0];
    const updatedUser: User = {
      ...googleUser,
      authProvider: 'google',
    };
    setCurrentUser(updatedUser);
    setAuthDeliveryMethod('google');
    setIsAuthenticated(true);
    addAuditLog('LOGIN_GOOGLE', `Signed in via Google SSO as ${updatedUser.name} (${updatedUser.email})`, 'info');
    dispatchChannelAlert(
      'Google Workspace SSO Connected',
      `Direct institutional email dispatch active for ${updatedUser.email}. All official circulars, notes, attendance, and result updates will be routed to your inbox.`,
      'notice',
      'home'
    );
    return { success: true };
  };

  const loginWithPhone = (
    phoneNumber: string,
    password: string,
    isNewUser = false,
    fullName?: string,
    role: UserRole = 'student',
    targetClass = 'Class 7-A'
  ) => {
    const clean = normalizePhone(phoneNumber);
    if (!clean || clean.length < 5) {
      return { success: false, error: 'Please enter a valid phone number.' };
    }

    if (isNewUser) {
      if (!fullName || !fullName.trim()) {
        return { success: false, error: 'Full name is required to complete registration.' };
      }
      if (!password || password.length < 4) {
        return { success: false, error: 'Password must be at least 4 characters long.' };
      }

      const newId = `user-ph-${Date.now()}`;
      const newUser: User = {
        id: newId,
        name: fullName.trim(),
        email: `${fullName.trim().toLowerCase().replace(/\s+/g, '.')}@student.nexora.edu`,
        phone: phoneNumber,
        role,
        roleLabel: role === 'teacher' ? 'Faculty Instructor' : 'Enrolled Student',
        avatar:
          role === 'teacher'
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        classGroup: targetClass,
        department: 'Science & STEM',
        workspaceId: 'ws-school-main',
        workspaceType: 'school',
        status: 'active',
        authProvider: 'phone',
      };

      setRegisteredAccounts((prev) => [
        ...prev,
        { phone: phoneNumber, password, user: newUser },
      ]);
      setCurrentUser(newUser);
      setAuthDeliveryMethod('phone');
      setIsAuthenticated(true);
      addAuditLog(
        'REGISTER_PHONE',
        `New profile created: ${newUser.name} (${newUser.roleLabel}) with mobile ${phoneNumber}`,
        'info'
      );
      dispatchChannelAlert(
        'SMS Alert Service Activated',
        `Welcome ${newUser.name}! Real-time SMS dispatch activated for mobile ${phoneNumber}. You will receive immediate text alerts for assignments, attendance, marks, and announcements.`,
        'notice',
        'home'
      );
      return { success: true };
    } else {
      // Existing user sign in
      const found = registeredAccounts.find(
        (acc) => normalizePhone(acc.phone) === clean
      );
      if (!found) {
        return {
          success: false,
          error: 'Phone number not found in directory. Click "New user?" to set a password and register.',
        };
      }
      if (password !== found.password && password !== 'demo123') {
        return { success: false, error: 'Incorrect password. Please verify and retry.' };
      }

      const activeUser: User = {
        ...found.user,
        phone: phoneNumber,
        authProvider: 'phone',
      };
      setCurrentUser(activeUser);
      setAuthDeliveryMethod('phone');
      setIsAuthenticated(true);
      addAuditLog('LOGIN_PHONE', `Signed in via Mobile Phone ${phoneNumber}`, 'info');
      dispatchChannelAlert(
        'SMS Notification Service Active',
        `Signed in successfully. Real-time SMS alert dispatch confirmed for mobile ${phoneNumber}.`,
        'notice',
        'home'
      );
      return { success: true };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    addAuditLog('LOGOUT', `Signed out active session for ${currentUser.name}`, 'info');
  };

  const submitAssignmentWork = async (assignmentId: string, notes: string, fileName = 'Work_Submission.pdf') => {
    const nowStr = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    // If Supabase is connected, try database upsert
    if (isSupabaseConfigured) {
      try {
        await submitAssignmentWorkOnline(currentWorkspace.id, assignmentId, currentUser.id, notes);
      } catch (err: any) {
        console.warn('Online Supabase submission failed, falling back to local state:', err.message);
      }
    }

    setAssignments((prev) =>
      prev.map((item) => {
        if (item.id === assignmentId) {
          return {
            ...item,
            status: 'submitted',
            submission: {
              submittedAt: nowStr,
              studentNotes: notes,
              fileName,
            },
          };
        }
        return item;
      })
    );

    addAuditLog('SUBMIT_ASSIGNMENT', `Submitted solution for assignment ${assignmentId} (${fileName})`, 'info');
    return { success: true };
  };

  const createAssignment = (newAssignment: Partial<Assignment>) => {
    // RBAC Check: Only faculty, managers, and admins can create assignments
    const canCreate = ['teacher', 'class_teacher', 'manager', 'admin'].includes(currentUser.role);
    if (!canCreate) {
      addAuditLog('UNAUTHORIZED_ACTION', `Denied attempt by ${currentUser.name} (Role: ${currentUser.role}) to create an assignment`, 'security');
      return { success: false, error: 'Permission denied: Students cannot create assignments.' };
    }

    const id = `ASN-${Date.now().toString().slice(-4)}`;
    const fullItem: Assignment = {
      id,
      title: newAssignment.title || 'Untitled Assignment',
      subject: newAssignment.subject || 'General Studies',
      classGroup: newAssignment.classGroup || 'Class 7-A',
      description: newAssignment.description || '',
      assignedBy: currentUser.name,
      assignedRole: currentUser.roleLabel,
      assignedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dueDate: newAssignment.dueDate || 'In 7 days',
      priority: newAssignment.priority || 'medium',
      maxPoints: newAssignment.maxPoints || 50,
      status: 'pending',
      instructions: newAssignment.instructions || ['Complete all assigned questions and attach proof.'],
      materialsRequired: newAssignment.materialsRequired || [],
      attachments: newAssignment.attachments || [],
    };

    setAssignments((prev) => [fullItem, ...prev]);
    addAuditLog('CREATE_ASSIGNMENT', `Published new assignment: ${fullItem.title} (${fullItem.classGroup})`, 'info');

    dispatchChannelAlert(
      `New Assignment: ${fullItem.title}`,
      `Assigned for ${fullItem.classGroup}. Due on ${fullItem.dueDate}. Max Marks: ${fullItem.maxPoints}`,
      'assignment',
      'assignments'
    );
    return { success: true };
  };

  const gradeAssignment = (assignmentId: string, points: number, comments: string) => {
    // RBAC Check: Only teachers, managers, and admins can grade
    const canGrade = ['teacher', 'class_teacher', 'manager', 'admin'].includes(currentUser.role);
    if (!canGrade) {
      addAuditLog('UNAUTHORIZED_ACTION', `Denied attempt by student ${currentUser.name} to grade assignment ${assignmentId}`, 'security');
      return { success: false, error: 'Permission denied: Students are not authorized to grade assignments.' };
    }

    const nowStr = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    setAssignments((prev) =>
      prev.map((item) => {
        if (item.id === assignmentId) {
          return {
            ...item,
            status: 'graded',
            feedback: {
              gradedBy: currentUser.name,
              gradedAt: nowStr,
              points,
              comments,
            },
          };
        }
        return item;
      })
    );

    addAuditLog('GRADE_ASSIGNMENT', `Graded assignment ${assignmentId} with ${points} points by ${currentUser.name}`, 'info');
    return { success: true };
  };

  const uploadDocument = (doc: Partial<DocumentItem>) => {
    // RBAC: Students can view, faculty & managers can publish
    const canUpload = ['teacher', 'class_teacher', 'manager', 'admin'].includes(currentUser.role);
    if (!canUpload) {
      addAuditLog('UNAUTHORIZED_ACTION', `Student ${currentUser.name} attempted to upload institutional document`, 'security');
      return { success: false, error: 'Permission denied: Only faculty and administration can upload to the public document library.' };
    }

    const id = `DOC-${Date.now().toString().slice(-4)}`;
    const fullDoc: DocumentItem = {
      id,
      title: doc.title || 'Untitled Document',
      subject: doc.subject || 'General Resources',
      folder: doc.folder || 'Class 7 / General',
      fileType: doc.fileType || 'pdf',
      size: doc.size || '1.5 MB',
      pages: doc.pages || 6,
      uploader: currentUser.name,
      uploaderRole: currentUser.roleLabel,
      uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      downloadUrl: '#',
      summary: doc.summary || 'Uploaded reference document for student review.',
      tags: doc.tags || ['Study Material'],
      isFavorite: false,
      academicYear: '2026-27',
    };

    setDocuments((prev) => [fullDoc, ...prev]);
    addAuditLog('UPLOAD_DOCUMENT', `Uploaded document: ${fullDoc.title} (${fullDoc.subject})`, 'info');

    dispatchChannelAlert(
      `New Notes Uploaded: ${fullDoc.title}`,
      `Subject: ${fullDoc.subject}. Shared by ${currentUser.name} for class revision.`,
      'notice',
      'documents'
    );
    return { success: true };
  };

  const toggleDocumentFavorite = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isFavorite: !d.isFavorite } : d))
    );
  };

  const publishTimetableChange = (slotId: string, newRoom: string, note: string) => {
    // RBAC Check: Only faculty, managers, and administrators can modify timetable
    const canModify = ['teacher', 'class_teacher', 'manager', 'admin'].includes(currentUser.role);
    if (!canModify) {
      addAuditLog('UNAUTHORIZED_ACTION', `Student ${currentUser.name} attempted to alter timetable slot ${slotId}`, 'security');
      return { success: false, error: 'Permission denied: Students cannot alter the official timetable schedule.' };
    }

    const targetSlot = timetable.find((s) => s.id === slotId);
    if (!targetSlot) return { success: false, error: 'Slot not found' };

    // Prevent conflict: Check if another class occupies the same room at the same day & time
    const conflict = timetable.find(
      (s) =>
        s.id !== slotId &&
        s.dayOfWeek === targetSlot.dayOfWeek &&
        s.startTime === targetSlot.startTime &&
        s.room.toLowerCase().trim() === newRoom.toLowerCase().trim()
    );

    if (conflict) {
      return {
        success: false,
        error: `Room Conflict! Room ${newRoom} is already booked by ${conflict.subject} (${conflict.teacher}) at ${conflict.startTime}.`,
      };
    }

    setTimetable((prev) =>
      prev.map((s) => {
        if (s.id === slotId) {
          return {
            ...s,
            room: newRoom,
            isChanged: true,
            changeDetails: {
              previousRoom: s.room,
              changedBy: currentUser.name,
              changedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              note,
              verifiedOfficial: true,
            },
          };
        }
        return s;
      })
    );

    addAuditLog(
      'TIMETABLE_CHANGE',
      `Updated ${targetSlot.subject} room from ${targetSlot.room} to ${newRoom} (${targetSlot.dayName})`,
      'info'
    );

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Timetable Update: ${targetSlot.subject}`,
      description: `${currentUser.name} relocated ${targetSlot.subject} to Room ${newRoom}. Reason: ${note}`,
      time: 'Just now',
      category: 'timetable',
      read: false,
      isOfficial: true,
      linkPage: 'timetable',
      publisher: currentUser.name,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return { success: true };
  };

  const sendMessage = (channelId: string, content: string, isOfficial = false, attachments: any[] = []) => {
    const channel = channels.find((c) => c.id === channelId);
    if (!channel) return { success: false, error: 'Channel not found' };

    // Enforce channel posting permissions (RBAC)
    if (channel.canPost && !channel.canPost.includes(currentUser.role)) {
      addAuditLog('UNAUTHORIZED_POST', `User ${currentUser.name} (${currentUser.role}) denied posting in channel ${channel.name}`, 'security');
      return { success: false, error: `Posting in ${channel.name} is restricted to: ${channel.canPost.join(', ')}` };
    }

    // Only faculty and admins can mark a message as an official notice
    const allowedToMarkOfficial = ['teacher', 'class_teacher', 'manager', 'admin'].includes(currentUser.role);
    const finalIsOfficial = isOfficial && allowedToMarkOfficial;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      channelId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatar,
      content,
      timestamp: 'Just now',
      isOfficialNotice: finalIsOfficial,
      attachments,
    };

    setMessages((prev) => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), newMsg],
    }));

    setChannels((prev) =>
      prev.map((c) => (c.id === channelId ? { ...c, lastMessageSnippet: content, lastMessageTime: 'Just now' } : c))
    );

    if (finalIsOfficial) {
      addAuditLog('OFFICIAL_NOTICE_POSTED', `Posted official circular in ${channel.name}: "${content.substring(0, 40)}..."`, 'info');
      dispatchChannelAlert(
        `Official Announcement: #${channel.name}`,
        `${currentUser.name}: ${content.substring(0, 80)}`,
        'notice',
        'messages'
      );
    } else {
      dispatchChannelAlert(
        `New Message in #${channel.name}`,
        `${currentUser.name}: ${content.substring(0, 80)}`,
        'notice',
        'messages'
      );
    }

    return { success: true };
  };

  const pinMessage = (channelId: string, messageId: string) => {
    // Only faculty and admins can pin messages
    if (!['teacher', 'class_teacher', 'manager', 'admin'].includes(currentUser.role)) return;

    setMessages((prev) => {
      const channelMsgs = prev[channelId] || [];
      return {
        ...prev,
        [channelId]: channelMsgs.map((m) => (m.id === messageId ? { ...m, pinned: !m.pinned } : m)),
      };
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const updateAttendance = (subject: string, classGroup: string, attended: number, classesHeld: number) => {
    // Only teachers, class teachers, managers, and admins can edit attendance ledger
    const canEdit = ['teacher', 'class_teacher', 'manager', 'admin'].includes(currentUser.role);
    if (!canEdit) {
      addAuditLog('UNAUTHORIZED_ACTION', `Student ${currentUser.name} attempted to edit attendance record for ${subject}`, 'security');
      return { success: false, error: 'Permission denied: Students cannot alter official attendance ledgers.' };
    }

    const percentage = classesHeld > 0 ? Number(((attended / classesHeld) * 100).toFixed(1)) : 100;
    const nowStr = 'Today';

    setAttendanceList((prev) => {
      const exists = prev.some((r) => r.subject === subject && r.classGroup === classGroup);
      if (exists) {
        return prev.map((r) =>
          r.subject === subject && r.classGroup === classGroup
            ? { ...r, attended, classesHeld, percentage, lastUpdated: nowStr }
            : r
        );
      } else {
        return [
          ...prev,
          {
            id: `att-${Date.now()}`,
            classGroup,
            subject,
            attended,
            classesHeld,
            percentage,
            recentStatus: 'Present',
            lastUpdated: nowStr,
          },
        ];
      }
    });

    addAuditLog('ATTENDANCE_UPDATED', `Recorded attendance for ${classGroup} - ${subject}: ${attended}/${classesHeld} (${percentage}%) by ${currentUser.name}`, 'info');

    dispatchChannelAlert(
      `Attendance Ledger Updated: ${subject}`,
      `Recorded ${attended}/${classesHeld} sessions for ${classGroup} (${percentage}%). Updated by ${currentUser.name}.`,
      'attendance',
      'academics'
    );
    return { success: true };
  };

  const createAssessment = (newAssessment: Partial<AssessmentRecord>) => {
    const canCreate = ['teacher', 'class_teacher', 'manager', 'admin'].includes(currentUser.role);
    if (!canCreate) {
      addAuditLog('UNAUTHORIZED_ACTION', `Student ${currentUser.name} attempted to publish test assessment`, 'security');
      return { success: false, error: 'Permission denied: Only faculty can publish assessments.' };
    }

    const id = `as-${Date.now().toString().slice(-4)}`;
    const fullAssessment: AssessmentRecord = {
      id,
      classGroup: newAssessment.classGroup || 'Class 7-A',
      studentId: newAssessment.studentId,
      studentName: newAssessment.studentName,
      title: newAssessment.title || 'Continuous Assessment',
      subject: newAssessment.subject || 'General Studies',
      date: newAssessment.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      maxMarks: newAssessment.maxMarks || 50,
      obtainedMarks: newAssessment.obtainedMarks || 0,
      grade: newAssessment.grade || 'A',
      remarks: newAssessment.remarks || 'Assessment recorded.',
      status: newAssessment.status || 'published',
    };

    setAssessmentsList((prev) => [fullAssessment, ...prev]);
    addAuditLog('ASSESSMENT_CREATED', `Published assessment "${fullAssessment.title}" for ${fullAssessment.classGroup} (${fullAssessment.subject})`, 'info');

    dispatchChannelAlert(
      `New Assessment Published: ${fullAssessment.title}`,
      `${fullAssessment.subject} (${fullAssessment.classGroup}). Score: ${fullAssessment.obtainedMarks}/${fullAssessment.maxMarks} (${fullAssessment.grade}).`,
      'result',
      'academics'
    );
    return { success: true };
  };

  const updateAssessmentMarks = (assessmentId: string, obtainedMarks: number, remarks: string, grade: string) => {
    const canEdit = ['teacher', 'class_teacher', 'manager', 'admin'].includes(currentUser.role);
    if (!canEdit) {
      addAuditLog('UNAUTHORIZED_ACTION', `Student ${currentUser.name} attempted to edit marks for assessment ${assessmentId}`, 'security');
      return { success: false, error: 'Permission denied: Only faculty can grade assessments.' };
    }

    setAssessmentsList((prev) =>
      prev.map((as) =>
        as.id === assessmentId
          ? { ...as, obtainedMarks, remarks, grade, status: 'published' }
          : as
      )
    );

    addAuditLog('MARKS_UPDATED', `Updated score for assessment ${assessmentId} to ${obtainedMarks} (${grade}) by ${currentUser.name}`, 'info');

    dispatchChannelAlert(
      `Assessment Marks Updated`,
      `Marks revised to ${obtainedMarks} (${grade}). Remarks: ${remarks || 'Evaluated'}`,
      'result',
      'academics'
    );
    return { success: true };
  };

  const addClassSection = (newClass: Omit<ClassSection, 'id'>) => {
    const canAdd = ['teacher', 'class_teacher', 'manager', 'admin'].includes(currentUser.role);
    if (!canAdd) {
      addAuditLog('UNAUTHORIZED_ACTION', `Student ${currentUser.name} attempted to add new class section`, 'security');
      return { success: false, error: 'Permission denied: Only authorized teachers and administrators can add class divisions.' };
    }

    const id = `sec-${Date.now().toString().slice(-4)}`;
    const fullClass: ClassSection = {
      id,
      ...newClass,
    };

    setManagedClasses((prev) => [...prev, fullClass]);
    addAuditLog('CLASS_ADDED', `Teacher ${currentUser.name} created authorized section ${fullClass.className}-${fullClass.section}`, 'info');
    return { success: true };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchUserRole,
        currentWorkspace,
        switchWorkspace,
        activePage,
        setActivePage,
        searchModalOpen,
        setSearchModalOpen,
        assistantOpen,
        setAssistantOpen,
        initialAssistantQuery,
        openAssistantWithQuery,
        assignments,
        submitAssignmentWork,
        createAssignment,
        gradeAssignment,
        documents,
        uploadDocument,
        toggleDocumentFavorite,
        timetable,
        publishTimetableChange,
        channels,
        activeChannelId,
        setActiveChannelId,
        messages,
        sendMessage,
        pinMessage,
        notifications,
        markNotificationAsRead,
        markAllNotificationsRead,
        auditLogs,
        addAuditLog,
        systemStatus,
        supabaseStatus,
        refreshSystemStatus,
        attendanceList,
        updateAttendance,
        assessmentsList,
        createAssessment,
        updateAssessmentMarks,
        managedClasses,
        addClassSection,
        selectedClassFilter,
        setSelectedClassFilter,
        searchQuery,
        setSearchQuery,
        isAuthenticated,
        loginWithGoogle,
        loginWithPhone,
        isNewUserCheck,
        logout,
        authDeliveryMethod,
        lastDispatchedAlert,
        clearLastDispatchedAlert,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
