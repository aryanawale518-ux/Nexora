# Nexora Deployment & Integration Guide

This guide details how to configure, verify, and deploy Nexora with **Supabase** (Authentication, PostgreSQL Database, Storage, and Row-Level Security) and **Google Gemini 3.8 Flash** (via a secure server-side proxy).

---

## 1. Architecture Overview

- **Frontend**: React 19 + TypeScript SPA styled with Tailwind CSS.
- **Backend**: Express + Vite middleware (`server.ts`) running on Node.js / Cloud Run.
- **AI Processing**: Google Gemini 3.8 Flash processed exclusively on the server (`/api/ai/assistant` and `/api/ai/search`). **No API keys in client-side code.**
- **Database & Storage**: Supabase PostgreSQL with strict Row Level Security (RLS) enforcing multi-tenant organization isolation and Role-Based Access Control (RBAC).
- **Supported Roles**:
  - `student`: View course assignments, submit work, view personal grades & timetable, participate in class channels. Blocked from grading, changing schedules, or viewing staff-only notices.
  - `teacher`: Create & grade assignments, broadcast official circulars, upload course documents, update schedule slots.
  - `manager`: Oversee academic departments, view all submissions across cohorts, manage timetables and view institutional audit logs.
  - `admin`: Full institutional governance across all organization records.

---

## 2. Supabase Setup Steps

### Step 2.1: Create a Supabase Project
1. Log in to [Supabase Console](https://supabase.com).
2. Click **New Project** and name it (e.g. `nexora-institutional-db`).
3. Note your database password, project URL, and API keys.

### Step 2.2: Execute the PostgreSQL Schema & Security Rules
1. In the Supabase Dashboard, open the **SQL Editor**.
2. Copy the entire contents of `supabase/schema.sql` located in this repository.
3. Click **Run**.
4. This will create:
   - Tables: `organizations`, `profiles`, `assignments`, `submissions`, `documents`, `timetable_slots`, `channels`, `messages`, `audit_logs`.
   - Security helper functions: `current_org_id()` and `current_role()`.
   - Enabled Row Level Security (`ENABLE ROW LEVEL SECURITY`) across all tables.
   - Organization isolation policies ensuring cross-tenant access is strictly denied:
     ```sql
     org_id = public.current_org_id()
     ```
   - Role-based policies for students, teachers, managers, and administrators.
   - Storage buckets (`assignment-submissions`, `course-documents`, `organization-assets`) and storage RLS policies.
   - Automatic user profile provisioning trigger (`on_auth_user_created`).

### Step 2.3: Configure Storage Buckets
If not already created by the SQL script:
1. Navigate to **Storage** in the Supabase Dashboard.
2. Confirm the three buckets exist:
   - `assignment-submissions` (Private / Restricted)
   - `course-documents` (Public within organization)
   - `organization-assets` (Public)

### Step 2.4: Configure Authentication
1. Navigate to **Authentication -> Providers**.
2. Enable **Email** (with optional confirm email).
3. Optionally enable **Google OAuth** by providing Google Cloud Client ID and Secret.
4. Set the Site URL to your application deployment domain (e.g. `https://your-nexora-app.run.app`).

---

## 3. Environment Variables

Configure the following variables in your hosting environment (e.g., Cloud Run, Docker, or `.env`):

```bash
# ==========================================
# Server-Side Secrets (NEVER in frontend)
# ==========================================
GEMINI_API_KEY="AIzaSy..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

# ==========================================
# Client & Server Shared Config
# ==========================================
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_ANON_KEY="eyJhbGciOi..."

PORT=3000
NODE_ENV="production"
```

---

## 4. Verification & Testing

Nexora includes an automated verification test suite:

### Run RBAC & Organization Isolation Tests:
```bash
npm run test
```

This verifies:
1. **Organization Isolation**: Records from `greenfield_academy` cannot be read by `nexora_enterprise`.
2. **Student Permissions**: Students cannot grade assignments, cannot post to faculty boards, and cannot modify timetables.
3. **Teacher Permissions**: Teachers can grade assignments, publish notices, and manage class resources.
4. **Manager & Admin Permissions**: Managers and Admins can view audit logs and manage cross-departmental records.
5. **Global Search Verification**: Grounded evidence checks distinguishing verified notices from unverified chat rumors.

### Check Live Integration Status in UI:
- Open **Settings -> Backend Service Status**.
- The system will query `/api/status` and report:
  - `Supabase DB: Connected` if valid credentials are provided.
  - `Gemini API: Connected` if `GEMINI_API_KEY` is present on the server.
- The UI will never claim an integration works unless it has been verified.

---

## 5. Production Deployment

### Build the Application:
```bash
npm run build
```

### Start the Full-Stack Server:
```bash
npm run start
```
The server will serve static assets from `dist/` and handle API endpoints at `/api/*`.
