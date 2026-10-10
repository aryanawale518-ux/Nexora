-- ============================================================================
-- NEXORA INSTITUTIONAL PLATFORM: SUPABASE SCHEMA & SECURITY POLICIES
-- Multi-Tenant Organization Isolation & Role-Based Access Control (RBAC)
-- Supported Roles: student, teacher, manager, admin
-- ============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create custom types
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('student', 'teacher', 'manager', 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'assignment_priority') THEN
    CREATE TYPE assignment_priority AS ENUM ('high', 'medium', 'low');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_severity') THEN
    CREATE TYPE audit_severity AS ENUM ('info', 'warning', 'security');
  END IF;
END $$;

-- 3. Organizations Table (Multi-tenant Root)
CREATE TABLE IF NOT EXISTS public.organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'school', -- 'school' or 'corporate'
  tagline TEXT,
  academic_year TEXT NOT NULL DEFAULT '2026-27',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. User Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  class_group TEXT,
  department TEXT,
  avatar_url TEXT,
  office_hours TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast tenant and role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_org ON public.profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Helper security functions to avoid recursive RLS queries
CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 5. Assignments Table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  class_group TEXT NOT NULL,
  description TEXT NOT NULL,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ NOT NULL,
  priority assignment_priority NOT NULL DEFAULT 'medium',
  max_points INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'submitted', 'graded', 'upcoming'
  instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
  materials_required JSONB NOT NULL DEFAULT '[]'::jsonb,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_assignments_org_class ON public.assignments(org_id, class_group);

-- 6. Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notes TEXT,
  file_url TEXT,
  file_name TEXT,
  points INTEGER,
  feedback TEXT,
  graded_by UUID REFERENCES public.profiles(id),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  graded_at TIMESTAMPTZ,
  CONSTRAINT unique_assignment_student UNIQUE(assignment_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_submissions_org_student ON public.submissions(org_id, student_id);

-- 7. Documents & Notes Library
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  folder TEXT NOT NULL DEFAULT 'General',
  file_type TEXT NOT NULL DEFAULT 'pdf',
  size TEXT NOT NULL,
  pages INTEGER,
  uploader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  download_url TEXT NOT NULL,
  storage_path TEXT,
  summary TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  academic_year TEXT NOT NULL DEFAULT '2026-27',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_documents_org_subject ON public.documents(org_id, subject);

-- 8. Timetable Slots
CREATE TABLE IF NOT EXISTS public.timetable_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  class_group TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 6),
  day_name TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  subject TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  room TEXT NOT NULL,
  slot_type TEXT NOT NULL DEFAULT 'class',
  is_changed BOOLEAN NOT NULL DEFAULT FALSE,
  previous_room TEXT,
  changed_by TEXT,
  changed_at TIMESTAMPTZ,
  change_note TEXT,
  required_materials JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_timetable_org_day ON public.timetable_slots(org_id, day_of_week);

-- 9. Channels & Spaces
CREATE TABLE IF NOT EXISTS public.channels (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel_type TEXT NOT NULL DEFAULT 'official_channel',
  category TEXT NOT NULL DEFAULT 'Official Notices',
  description TEXT,
  is_official BOOLEAN NOT NULL DEFAULT FALSE,
  allowed_roles TEXT[] NOT NULL DEFAULT ARRAY['student', 'teacher', 'manager', 'admin'],
  can_post TEXT[] NOT NULL DEFAULT ARRAY['teacher', 'manager', 'admin'],
  icon TEXT NOT NULL DEFAULT 'MessageSquare',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Messages & Notices
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_official_notice BOOLEAN NOT NULL DEFAULT FALSE,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_org_channel ON public.messages(org_id, channel_id, created_at DESC);

-- 11. Audit Logs (Compliance & Governance)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  severity audit_severity NOT NULL DEFAULT 'info',
  ip_address TEXT DEFAULT '127.0.0.1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_org_created ON public.audit_logs(org_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enforce Organization Isolation and Role Permissions
-- ============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Profiles: Users can read members of their own organization"
  ON public.profiles FOR SELECT
  USING (org_id = public.current_org_id());

CREATE POLICY "Profiles: Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Profiles: Admins & managers can manage all profiles in their org"
  ON public.profiles FOR ALL
  USING (
    org_id = public.current_org_id() AND
    public.current_role() IN ('admin', 'manager')
  );

-- ----------------------------------------------------------------------------
-- ORGANIZATIONS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Organizations: Members can view their organization"
  ON public.organizations FOR SELECT
  USING (id = public.current_org_id());

CREATE POLICY "Organizations: Admins can update their organization"
  ON public.organizations FOR UPDATE
  USING (
    id = public.current_org_id() AND
    public.current_role() = 'admin'
  );

-- ----------------------------------------------------------------------------
-- ASSIGNMENTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Assignments: Org members can view assignments"
  ON public.assignments FOR SELECT
  USING (org_id = public.current_org_id());

CREATE POLICY "Assignments: Teachers, managers & admins can create assignments"
  ON public.assignments FOR INSERT
  WITH CHECK (
    org_id = public.current_org_id() AND
    public.current_role() IN ('teacher', 'manager', 'admin')
  );

CREATE POLICY "Assignments: Creators, managers & admins can update assignments"
  ON public.assignments FOR UPDATE
  USING (
    org_id = public.current_org_id() AND
    (assigned_by = auth.uid() OR public.current_role() IN ('manager', 'admin'))
  );

CREATE POLICY "Assignments: Managers & admins can delete assignments"
  ON public.assignments FOR DELETE
  USING (
    org_id = public.current_org_id() AND
    public.current_role() IN ('manager', 'admin')
  );

-- ----------------------------------------------------------------------------
-- SUBMISSIONS POLICIES
-- ----------------------------------------------------------------------------
-- Students can only view their own submissions; faculty/managers can view all in org
CREATE POLICY "Submissions: Students view own; Faculty view org submissions"
  ON public.submissions FOR SELECT
  USING (
    org_id = public.current_org_id() AND (
      student_id = auth.uid() OR
      public.current_role() IN ('teacher', 'manager', 'admin')
    )
  );

-- Students can insert/update only their own submissions
CREATE POLICY "Submissions: Students can submit work"
  ON public.submissions FOR INSERT
  WITH CHECK (
    org_id = public.current_org_id() AND
    student_id = auth.uid()
  );

CREATE POLICY "Submissions: Students can edit their own pending submission"
  ON public.submissions FOR UPDATE
  USING (
    org_id = public.current_org_id() AND (
      (student_id = auth.uid() AND points IS NULL) OR
      public.current_role() IN ('teacher', 'manager', 'admin')
    )
  );

-- ----------------------------------------------------------------------------
-- DOCUMENTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Documents: Org members can view documents"
  ON public.documents FOR SELECT
  USING (org_id = public.current_org_id());

CREATE POLICY "Documents: Faculty & Admins can upload documents"
  ON public.documents FOR INSERT
  WITH CHECK (
    org_id = public.current_org_id() AND
    public.current_role() IN ('teacher', 'manager', 'admin')
  );

CREATE POLICY "Documents: Uploaders & Admins can delete documents"
  ON public.documents FOR DELETE
  USING (
    org_id = public.current_org_id() AND
    (uploader_id = auth.uid() OR public.current_role() IN ('manager', 'admin'))
  );

-- ----------------------------------------------------------------------------
-- TIMETABLE POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Timetable: Org members can view timetable"
  ON public.timetable_slots FOR SELECT
  USING (org_id = public.current_org_id());

CREATE POLICY "Timetable: Faculty & Admins can modify timetable"
  ON public.timetable_slots FOR UPDATE
  USING (
    org_id = public.current_org_id() AND
    public.current_role() IN ('teacher', 'manager', 'admin')
  );

-- ----------------------------------------------------------------------------
-- CHANNELS & MESSAGES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Channels: Members can view channels permitted to their role"
  ON public.channels FOR SELECT
  USING (
    org_id = public.current_org_id() AND
    public.current_role()::text = ANY(allowed_roles)
  );

CREATE POLICY "Messages: View messages in accessible channels"
  ON public.messages FOR SELECT
  USING (
    org_id = public.current_org_id() AND
    EXISTS (
      SELECT 1 FROM public.channels c
      WHERE c.id = messages.channel_id
        AND c.org_id = public.current_org_id()
        AND public.current_role()::text = ANY(c.allowed_roles)
    )
  );

CREATE POLICY "Messages: Post messages only if role has posting rights"
  ON public.messages FOR INSERT
  WITH CHECK (
    org_id = public.current_org_id() AND
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.channels c
      WHERE c.id = messages.channel_id
        AND c.org_id = public.current_org_id()
        AND public.current_role()::text = ANY(c.can_post)
    )
  );

-- ----------------------------------------------------------------------------
-- AUDIT LOGS POLICIES
-- ----------------------------------------------------------------------------
-- Only managers and administrators can view institutional audit trails
CREATE POLICY "Audit: Only managers and admins can read audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    org_id = public.current_org_id() AND
    public.current_role() IN ('manager', 'admin')
  );

CREATE POLICY "Audit: System and authenticated actors can insert audit entries"
  ON public.audit_logs FOR INSERT
  WITH CHECK (org_id = public.current_org_id());

-- ============================================================================
-- SUPABASE STORAGE BUCKETS & POLICIES
-- ============================================================================

-- Create storage buckets if they do not exist
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('assignment-submissions', 'assignment-submissions', false),
  ('course-documents', 'course-documents', true),
  ('organization-assets', 'organization-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: assignment-submissions
-- Students can upload into their own org/student folder
CREATE POLICY "Storage: Students upload own submissions"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'assignment-submissions' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = public.current_org_id() AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Students can read their own submission files; Teachers/Managers/Admins can read all within org
CREATE POLICY "Storage: Read submissions in own org"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'assignment-submissions' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = public.current_org_id() AND (
      (storage.foldername(name))[2] = auth.uid()::text OR
      public.current_role() IN ('teacher', 'manager', 'admin')
    )
  );

-- Storage RLS: course-documents
-- Anyone in the org can read course documents
CREATE POLICY "Storage: Read course documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'course-documents' AND
    (storage.foldername(name))[1] = public.current_org_id()
  );

-- Only faculty, managers, and admins can upload course documents
CREATE POLICY "Storage: Upload course documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'course-documents' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = public.current_org_id() AND
    public.current_role() IN ('teacher', 'manager', 'admin')
  );

-- ============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    org_id,
    created_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role),
    COALESCE(new.raw_user_meta_data->>'org_id', 'greenfield_academy'),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- SEED DATA (Greenfield Public School & College)
-- ============================================================================
INSERT INTO public.organizations (id, name, type, tagline, academic_year)
VALUES
  ('greenfield_academy', 'Greenfield Public School & College', 'school', 'Excellence in Academic Discovery & Character', '2026-27'),
  ('nexora_enterprise', 'Nexora Innovations Group', 'corporate', 'Enterprise Research & Product Engineering', 'FY 2026-27')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.channels (id, org_id, name, channel_type, category, description, is_official, allowed_roles, can_post, icon)
VALUES
  ('ch-official-7a', 'greenfield_academy', 'Official School Circulars & Board', 'official_channel', 'Official Notices', 'Verified broadcast notices from administration and faculty leads.', true, ARRAY['student', 'teacher', 'manager', 'admin'], ARRAY['teacher', 'manager', 'admin'], 'Megaphone'),
  ('ch-faculty-board', 'greenfield_academy', 'Academic Faculty Council & Moderation', 'official_channel', 'Official Notices', 'Internal faculty coordination and curriculum moderation. Restricted.', true, ARRAY['teacher', 'manager', 'admin'], ARRAY['teacher', 'manager', 'admin'], 'Shield'),
  ('ch-general-7a', 'greenfield_academy', 'Class 7-A General Cohort', 'class', 'Academics & Classes', 'Daily announcements and class activities for Cohort 7-A.', false, ARRAY['student', 'teacher', 'manager', 'admin'], ARRAY['student', 'teacher', 'manager', 'admin'], 'MessageSquare'),
  ('ch-science-7a', 'greenfield_academy', 'Natural Sciences & Biology Lab', 'subject', 'Academics & Classes', 'Dr. Meera Sen lab assignments and scientific inquiry channel.', false, ARRAY['student', 'teacher', 'manager', 'admin'], ARRAY['student', 'teacher', 'manager', 'admin'], 'BookOpen')
ON CONFLICT (id) DO NOTHING;
