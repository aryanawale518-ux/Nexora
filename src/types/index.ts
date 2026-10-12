export type UserRole = 'student' | 'teacher' | 'manager' | 'admin' | 'class_teacher';

export type WorkspaceType = 'school' | 'corporate';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  avatar: string;
  classGroup?: string;
  department?: string;
  workspaceId: string;
  workspaceType: WorkspaceType;
  officeHours?: string;
  status: 'active' | 'away' | 'offline';
}

export interface Workspace {
  id: string;
  name: string;
  type: WorkspaceType;
  tagline: string;
  academicYearOrQuarter: string;
  logo: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  category: 'notice' | 'assignment' | 'deadline' | 'timetable' | 'mention' | 'feedback';
  read: boolean;
  isOfficial: boolean;
  linkPage: string;
  publisher?: string;
}

export interface MessageAttachment {
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'image' | 'link';
  url: string;
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar: string;
  content: string;
  timestamp: string;
  attachments?: MessageAttachment[];
  isOfficialNotice?: boolean;
  pinned?: boolean;
  reactions?: { emoji: string; count: number; users: string[] }[];
  replyToId?: string;
  replyToSnippet?: string;
}

export interface Channel {
  id: string;
  name: string;
  type: 'official_channel' | 'class' | 'subject' | 'practical' | 'department' | 'club' | 'dm';
  description: string;
  category: 'Official Notices' | 'Academics & Classes' | 'Labs & Practicals' | 'Activities & Clubs' | 'Direct Messages';
  isOfficial: boolean;
  membersCount: number;
  members: string[]; // user IDs or descriptions
  icon: string;
  unreadCount: number;
  lastMessageSnippet?: string;
  lastMessageTime?: string;
  dmRecipientId?: string;
  canPost: UserRole[]; // Which roles can send messages in this channel
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  classGroup: string;
  description: string;
  assignedBy: string;
  assignedRole: string;
  assignedDate: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  maxPoints: number;
  status: 'pending' | 'submitted' | 'graded' | 'upcoming';
  instructions: string[];
  materialsRequired?: string[];
  attachments?: MessageAttachment[];
  relatedNoteIds?: string[];
  submission?: {
    submittedAt: string;
    studentNotes: string;
    fileName?: string;
  };
  feedback?: {
    gradedBy: string;
    gradedAt: string;
    points: number;
    comments: string;
  };
}

export interface DocumentItem {
  id: string;
  title: string;
  subject: string;
  folder: string;
  fileType: 'pdf' | 'doc' | 'sheet' | 'image';
  size: string;
  pages?: number;
  uploader: string;
  uploaderRole: string;
  uploadedAt: string;
  downloadUrl: string;
  summary: string;
  tags: string[];
  relatedAssignmentId?: string;
  isFavorite: boolean;
  academicYear: string;
}

export interface TimetableSlot {
  id: string;
  dayOfWeek: number; // 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  dayName: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room: string;
  type: 'class' | 'lab' | 'exam' | 'assembly' | 'activity';
  isChanged?: boolean;
  changeDetails?: {
    previousRoom: string;
    changedBy: string;
    changedAt: string;
    note: string;
    verifiedOfficial: boolean;
  };
  requiredMaterials?: string[];
}

export interface ClassSection {
  id: string;
  className: string;
  section: string;
  department: string;
  teacherId: string;
  totalStudents: number;
  room: string;
  scheduleDescription: string;
}

export interface AttendanceRecord {
  id?: string;
  classGroup: string;
  subject: string;
  classesHeld: number;
  attended: number;
  percentage: number;
  recentStatus: 'Present' | 'Late' | 'Absent';
  lastUpdated?: string;
}

export interface AssessmentRecord {
  id: string;
  classGroup: string;
  studentId?: string;
  studentName?: string;
  title: string;
  subject: string;
  date: string;
  maxMarks: number;
  obtainedMarks: number;
  grade: string;
  remarks: string;
  status: 'published' | 'upcoming';
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  actorRole: string;
  target: string;
  severity: 'info' | 'warning' | 'security';
  ipAddress: string;
}
