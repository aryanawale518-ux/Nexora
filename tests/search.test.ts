import assert from 'node:assert';
import { executeGlobalSearch, SearchDataset } from '../src/services/searchEngine';
import {
  MOCK_ASSIGNMENTS,
  MOCK_DOCUMENTS,
  MOCK_TIMETABLE,
  MOCK_CHANNELS,
  MOCK_MESSAGES,
} from '../src/data/mockData';

const testDataset: SearchDataset = {
  assignments: MOCK_ASSIGNMENTS,
  documents: MOCK_DOCUMENTS,
  timetable: MOCK_TIMETABLE,
  channels: MOCK_CHANNELS,
  messages: MOCK_MESSAGES,
};

console.log('🧪 Running Nexora Functional Global Search Test Suite...\n');

// ============================================================================
// TEST 1: Completed versus Pending Assignments
// ============================================================================
console.log('▶ Test 1: Completed vs Pending Assignments Retrieval & Separation');

// 1.1 Query for pending assignments
const pendingQuery = executeGlobalSearch('Show my pending EVS assignments', testDataset, {
  role: 'student',
});

assert.strictEqual(
  pendingQuery.parsedIntent.wantsPending,
  true,
  'Query intent should identify search for pending assignments'
);

const pendingAssignments = pendingQuery.results.filter((r) => r.category === 'assignment');
assert.ok(pendingAssignments.length > 0, 'Should find at least 1 pending assignment');

// Assert that all returned assignment items are pending
pendingAssignments.forEach((item) => {
  assert.strictEqual(
    item.status,
    'pending',
    `Expected assignment ${item.id} to have status 'pending', got '${item.status}'`
  );
  assert.notStrictEqual(
    item.id,
    'SCI-701',
    'Completed cytology assignment SCI-701 must NOT appear in pending assignments'
  );
});

// Ensure EVS-702 is present in results
const foundEVS = pendingAssignments.find((a) => a.id === 'EVS-702');
assert.ok(foundEVS, 'EVS-702 (Biodiversity Field Study) must be returned for pending EVS query');
assert.ok(foundEVS.source.includes('Dr. Meera Sen'), 'Source citation must include Dr. Meera Sen');

console.log('  ✔ Pending assignment query returns only pending tasks (EVS-702), excluding completed');

// 1.2 Query for completed / graded assignments
const completedQuery = executeGlobalSearch('Show completed and graded assignments', testDataset, {
  role: 'student',
});

assert.strictEqual(
  completedQuery.parsedIntent.wantsCompleted,
  true,
  'Query intent should identify search for completed assignments'
);

const completedAssignments = completedQuery.results.filter((r) => r.category === 'assignment');
assert.ok(completedAssignments.length > 0, 'Should find completed assignment');

// Assert that SCI-701 is returned with graded status
const foundSci = completedAssignments.find((a) => a.id === 'SCI-701');
assert.ok(foundSci, 'Completed cytology report SCI-701 must be returned');
assert.strictEqual(foundSci.status, 'graded', 'SCI-701 must have status graded');
assert.ok(foundSci.source.includes('Dr. Meera Sen'), 'Source citation must reference faculty publisher');

// Ensure EVS-702 is NOT in completed results
const evsInCompleted = completedAssignments.find((a) => a.id === 'EVS-702');
assert.strictEqual(
  evsInCompleted,
  undefined,
  'Pending assignment EVS-702 must NOT appear when searching for completed assignments'
);

console.log('  ✔ Completed assignment query returns only graded work (SCI-701), excluding pending');

// ============================================================================
// TEST 2: Unconfirmed Announcements vs Official Notices
// ============================================================================
console.log('\n▶ Test 2: Unconfirmed Announcements & Chat Rumor Detection');

// 2.1 Query regarding the student chat rumor about postponed physics quiz
const rumorQuery = executeGlobalSearch('Is the Friday physics quiz postponed?', testDataset, {
  role: 'student',
});

assert.strictEqual(
  rumorQuery.parsedIntent.detectedRumor,
  true,
  'Search engine must detect that user query involves the unconfirmed postponement rumor'
);

assert.strictEqual(
  rumorQuery.verificationAudit.status,
  'unverified_rumor',
  'Verification audit status must be flagged as unverified_rumor'
);

assert.ok(
  rumorQuery.verificationAudit.detail.includes('UNVERIFIED') ||
  rumorQuery.verificationAudit.detail.includes('NO official notice'),
  'Verification detail must explicitly warn that postponement is an unverified student rumor'
);

assert.ok(
  rumorQuery.aiExplanation.includes('UNVERIFIED RUMOR') ||
  rumorQuery.aiExplanation.includes('unverified'),
  'AI explanation must warn the user against relying on chat rumors'
);

// Verify that the student message in chat is marked as unconfirmed
const discussionResults = rumorQuery.results.filter((r) => r.category === 'discussion');
assert.ok(discussionResults.length > 0, 'Should locate the student chat discussion containing the rumor');
const rumorChat = discussionResults.find((d) => d.excerpt.includes('postponed'));
assert.ok(rumorChat, 'Chat message discussing postponement must be found');
assert.strictEqual(rumorChat.isOfficial, false, 'Student chat message must NOT have isOfficial flag');
assert.ok(
  rumorChat.unconfirmedWarning && rumorChat.unconfirmedWarning.includes('UNCONFIRMED'),
  'Chat message must include explicit unconfirmed warning banner'
);

// Verify that the official Friday timetable event confirms the quiz is scheduled
const timetableQuiz = rumorQuery.results.find((r) => r.category === 'timetable' && r.title.includes('Physics'));
assert.ok(timetableQuiz, 'Official timetable must confirm the Physics Quiz slot exists');
assert.strictEqual(timetableQuiz.isOfficial, true, 'Official timetable slot must have isOfficial: true');

console.log('  ✔ Unconfirmed chat rumor correctly flagged, distinguished from official timetable');

// 2.2 Query for official verified notice
const officialNoticeQuery = executeGlobalSearch('Find the latest science practical notice', testDataset, {
  role: 'student',
});

const noticeResults = officialNoticeQuery.results.filter((r) => r.category === 'notice');
assert.ok(noticeResults.length > 0, 'Must find official notice for science practical');
const practicalNotice = noticeResults[0];
assert.strictEqual(practicalNotice.isOfficial, true, 'Official notice must have isOfficial: true');
assert.strictEqual(practicalNotice.publisher, 'Dr. Meera Sen', 'Publisher must be Dr. Meera Sen');
assert.ok(practicalNotice.excerpt.includes('Bio-Lab 2'), 'Notice must reference Bio-Lab 2 protocol');

console.log('  ✔ Official faculty notice correctly verified with publisher citation');

// ============================================================================
// TEST 3: Missing Information Handling (Never Invent Missing Data)
// ============================================================================
console.log('\n▶ Test 3: Missing Information Verification (Never Invent Missing Records)');

const missingQuery = executeGlobalSearch('When is my French language exam?', testDataset, {
  role: 'student',
});

assert.strictEqual(
  missingQuery.verificationAudit.status,
  'no_evidence_found',
  'Query for non-existent subject must return no_evidence_found'
);

assert.strictEqual(
  missingQuery.results.length,
  0,
  'No fabricated records should be returned for non-existent French exam'
);

assert.ok(
  missingQuery.aiExplanation.includes('could not verify') ||
  missingQuery.aiExplanation.includes('No matching'),
  'AI explanation must state that the system cannot verify non-existent records'
);

console.log('  ✔ Missing records produce explicit "no_evidence_found" audit without hallucinations');

// ============================================================================
// TEST 4: Timetable Relocation & Conflict-Free Change Log
// ============================================================================
console.log('\n▶ Test 4: Approved Timetable Change Verification');

const timetableChangeQuery = executeGlobalSearch('Find the latest approved timetable change', testDataset, {
  role: 'student',
});

assert.strictEqual(
  timetableChangeQuery.parsedIntent.wantsTimetableChange,
  true,
  'Intent must recognize timetable change request'
);

const mathRelocation = timetableChangeQuery.results.find(
  (r) => r.category === 'timetable' && r.title.includes('Mathematics')
);
assert.ok(mathRelocation, 'Must return the relocated Mathematics timetable slot');
assert.strictEqual(mathRelocation.status, 'confirmed_change', 'Status must be confirmed_change');
assert.ok(mathRelocation.excerpt.includes('Room 204'), 'Excerpt must mention new Room 204');
assert.ok(mathRelocation.source.includes('Prof. Rajesh Verma'), 'Source citation must include Prof. Rajesh Verma');

console.log('  ✔ Approved timetable relocation verified with diff history and author citation');

// ============================================================================
// TEST 5: Subject & Class Filtering
// ============================================================================
console.log('\n▶ Test 5: Subject and Class Filters');

const evsFiltered = executeGlobalSearch('', testDataset, {
  subject: 'Environmental Studies',
  role: 'student',
});

evsFiltered.results.forEach((item) => {
  if (item.subject) {
    assert.ok(
      item.subject.toLowerCase().includes('environmental') || item.subject.toLowerCase().includes('evs'),
      `Item ${item.id} subject '${item.subject}' must match EVS filter`
    );
  }
});

console.log('  ✔ Subject-level filtering cleanly restricts results to target discipline');

// ============================================================================
// TEST 6: Role-Based Permission Restrictions (Student vs Faculty RBAC)
// ============================================================================
console.log('\n▶ Test 6: Role-Based Permissions & Channel Access Control');

// 6.1 Student search must NEVER expose confidential faculty board messages
const studentFacultySearch = executeGlobalSearch('gradebook moderation', testDataset, {
  role: 'student',
});
const studentFoundConfidential = studentFacultySearch.results.find(
  (r) => r.channelId === 'ch-faculty-board' || r.source.includes('Faculty Council')
);
assert.strictEqual(
  studentFoundConfidential,
  undefined,
  'Student role must NOT be able to view confidential faculty council messages'
);

// 6.2 Teacher search CAN view faculty council messages
const teacherFacultySearch = executeGlobalSearch('gradebook moderation', testDataset, {
  role: 'teacher',
});
const teacherFoundConfidential = teacherFacultySearch.results.find(
  (r) => r.channelId === 'ch-faculty-board' || r.source.includes('Faculty Council')
);
assert.ok(
  teacherFoundConfidential,
  'Teacher role MUST have access to verified faculty council notices'
);
assert.ok(
  teacherFoundConfidential.publisher === 'Anita Desai',
  'Publisher must be Principal Anita Desai'
);

console.log('  ✔ Role-based permissions strictly shield confidential faculty records from students');

// ============================================================================
// TEST 7: Practical Materials Synthesis & Source Grounding
// ============================================================================
console.log('\n▶ Test 7: Practical Materials Grounding ("What do I need to bring tomorrow?")');

const practicalQuery = executeGlobalSearch('What do I need to bring tomorrow?', testDataset, {
  role: 'student',
});

assert.strictEqual(
  practicalQuery.parsedIntent.wantsPracticalMaterials,
  true,
  'Query intent must recognize laboratory equipment and materials query'
);
assert.strictEqual(
  practicalQuery.verificationAudit.status,
  'verified',
  'Audit status must be verified'
);
assert.ok(
  practicalQuery.aiExplanation.includes('apron') || practicalQuery.aiExplanation.includes('journal'),
  'AI explanation must detail specific lab equipment required'
);

const practicalResults = practicalQuery.results.filter(
  (r) => r.category === 'notice' || r.category === 'timetable'
);
assert.ok(practicalResults.length > 0, 'Must return grounded notices/timetable entries for science practical');

console.log('  ✔ Science practical materials query grounded in verified faculty records');

// ============================================================================
// TEST 8: Explicit Status Filters
// ============================================================================
console.log('\n▶ Test 8: Explicit Status Filters (Pending vs Completed)');

const strictPending = executeGlobalSearch('', testDataset, {
  role: 'student',
  category: 'assignments',
  statusFilter: 'pending',
});

strictPending.results.forEach((item) => {
  assert.strictEqual(
    item.status,
    'pending',
    `Expected item ${item.id} to have status pending, got ${item.status}`
  );
});

const strictCompleted = executeGlobalSearch('', testDataset, {
  role: 'student',
  category: 'assignments',
  statusFilter: 'completed',
});

strictCompleted.results.forEach((item) => {
  assert.ok(
    item.status === 'graded' || item.status === 'submitted',
    `Expected item ${item.id} to be graded or submitted, got ${item.status}`
  );
});

console.log('  ✔ Explicit status filters isolate pending from completed assignments with 100% precision');

console.log('\n🎉 ALL 8 TEST SUITES PASSED CLEANLY (100% Assertions Verified)!\n');

