import assert from 'assert';
import {
  MOCK_USERS,
  WORKSPACES,
  MOCK_CHANNELS,
  MOCK_ASSIGNMENTS,
  MOCK_DOCUMENTS,
  MOCK_TIMETABLE,
  MOCK_MESSAGES,
} from '../src/data/mockData';
import { executeGlobalSearch, SearchDataset } from '../src/services/searchEngine';
import { isSupabaseConfigured, getSupabaseConfigStatus } from '../src/lib/supabase';

console.log('================================================================');
console.log('NEXORA RBAC & ORGANIZATION ISOLATION VERIFICATION SUITE');
console.log('Testing roles: student, teacher, manager, admin');
console.log('================================================================\n');

const testDataset: SearchDataset = {
  assignments: MOCK_ASSIGNMENTS,
  documents: MOCK_DOCUMENTS,
  timetable: MOCK_TIMETABLE,
  channels: MOCK_CHANNELS,
  messages: MOCK_MESSAGES,
};

let passedTests = 0;
let totalTests = 0;

function runTest(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`❌ [FAIL] ${name}:`, err.message);
    throw err;
  }
}

// ----------------------------------------------------------------------------
// TEST 1: Role Definitions & Test Personas
// ----------------------------------------------------------------------------
runTest('All 4 core roles (student, teacher, manager, admin) are defined with profiles', () => {
  const roles = MOCK_USERS.map((u) => u.role);
  assert(roles.includes('student'), 'Student profile must exist');
  assert(roles.includes('teacher'), 'Teacher profile must exist');
  assert(roles.includes('manager'), 'Manager profile must exist');
  assert(roles.includes('admin'), 'Administrator profile must exist');

  const managerUser = MOCK_USERS.find((u) => u.role === 'manager');
  assert(managerUser, 'Manager user must be instantiated');
  assert.strictEqual(managerUser?.department, 'Curriculum & Faculty Management');
});

// ----------------------------------------------------------------------------
// TEST 2: Student Cannot Access Restricted Faculty Board Channel
// ----------------------------------------------------------------------------
runTest('Student cannot view or search messages in faculty-only channels', () => {
  const studentResults = executeGlobalSearch('Gradebook', testDataset, {
    role: 'student',
    workspaceId: 'greenfield_academy',
  });

  const studentFacultyMessages = studentResults.results.filter(
    (r) => r.channelId === 'ch-faculty-board' || r.source.includes('Faculty')
  );
  assert.strictEqual(
    studentFacultyMessages.length,
    0,
    'Student must not receive any results from ch-faculty-board'
  );

  // Faculty and Managers CAN view
  const teacherResults = executeGlobalSearch('Gradebook', testDataset, {
    role: 'teacher',
    workspaceId: 'greenfield_academy',
  });
  const teacherFacultyMessages = teacherResults.results.filter(
    (r) => r.channelId === 'ch-faculty-board'
  );
  assert(
    teacherFacultyMessages.length > 0,
    'Teacher must be able to view Gradebook deadline notice'
  );

  const managerResults = executeGlobalSearch('Gradebook', testDataset, {
    role: 'manager',
    workspaceId: 'greenfield_academy',
  });
  const managerFacultyMessages = managerResults.results.filter(
    (r) => r.channelId === 'ch-faculty-board'
  );
  assert(
    managerFacultyMessages.length > 0,
    'Manager must be able to view Gradebook deadline notice'
  );
});

// ----------------------------------------------------------------------------
// TEST 3: Multi-Tenant Organization Isolation
// ----------------------------------------------------------------------------
runTest('Organization isolation prevents cross-tenant data leakage', () => {
  const greenfieldResults = executeGlobalSearch('Biology', testDataset, {
    workspaceId: 'greenfield_academy',
    role: 'student',
  });
  assert(greenfieldResults.results.length > 0, 'Must find biology results for greenfield');

  // Search under nexora_enterprise tenant
  const corporateResults = executeGlobalSearch('Biology', testDataset, {
    workspaceId: 'nexora_enterprise',
    role: 'student',
  });
  const leakedGreenfieldItems = corporateResults.results.filter(
    (r) => r.source.includes('7-A') || r.source.includes('Greenfield')
  );
  assert.strictEqual(
    leakedGreenfieldItems.length,
    0,
    'Corporate tenant must NOT see school-specific records'
  );
});

// ----------------------------------------------------------------------------
// TEST 4: Channel Posting Permissions (RBAC Enforcement)
// ----------------------------------------------------------------------------
runTest('Channel posting rights strictly enforce role boundaries', () => {
  const facultyBoard = MOCK_CHANNELS.find((c) => c.id === 'ch-faculty-board');
  assert(facultyBoard, 'ch-faculty-board must exist');

  assert(!facultyBoard?.canPost.includes('student'), 'Student MUST NOT have permission to post in faculty board');
  assert(facultyBoard?.canPost.includes('teacher'), 'Teacher MUST have permission to post');
  assert(facultyBoard?.canPost.includes('manager'), 'Manager MUST have permission to post');
  assert(facultyBoard?.canPost.includes('admin'), 'Admin MUST have permission to post');
});

// ----------------------------------------------------------------------------
// TEST 5: Supabase Config Status Realism
// ----------------------------------------------------------------------------
runTest('Supabase status accurately reflects environment without false claims', () => {
  const status = getSupabaseConfigStatus();
  // When no live environment variables are set in test runner, must safely report unconfigured
  if (!process.env.VITE_SUPABASE_URL) {
    assert.strictEqual(status.isConfigured, false, 'Must not claim configured without valid URL');
    assert(status.statusText.includes('Offline Demo Mode'), 'Must state Offline Demo Mode');
  }
});

// ----------------------------------------------------------------------------
// TEST 6: Timetable Grounded Search & Rumor Audit
// ----------------------------------------------------------------------------
runTest('Timetable search verifies official teacher notice and flags student rumor', () => {
  const search = executeGlobalSearch('Find the latest approved timetable change', testDataset, {
    role: 'student',
    workspaceId: 'greenfield_academy',
  });

  const verifiedRoomChange = search.results.find((r) => r.category === 'timetable' && r.title.includes('Mathematics'));
  assert(verifiedRoomChange, 'Must return Room 204 verified timetable change');
  assert.strictEqual(verifiedRoomChange?.status, 'confirmed_change');

  // Must flag unverified rumor if query asks about postponement
  const postponeSearch = executeGlobalSearch('Is the Friday physics quiz postponed?', testDataset, {
    role: 'student',
    workspaceId: 'greenfield_academy',
  });
  assert.strictEqual(
    postponeSearch.verificationAudit.status,
    'unverified_rumor',
    'Must detect unverified rumor regarding physics quiz postponement'
  );
});

console.log(`\n================================================================`);
console.log(`ALL ${passedTests}/${totalTests} RBAC & ISOLATION TESTS PASSED SUCCESSFULLY!`);
console.log(`================================================================\n`);
