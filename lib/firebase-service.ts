import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db, ensureAuth } from './firebase';
import { DatabaseState, User, SchoolSettings, AttendanceSession, AttendanceRecord, LearningModule, Assignment, Submission, SkillRequirement, SkillRequest } from '@/types/pmr';
import { INITIAL_DATABASE } from './initial-data';

// Collection references
const USERS_COL = 'users';
const SETTINGS_COL = 'settings';
const SESSIONS_COL = 'attendance_sessions';
const RECORDS_COL = 'attendance_records';
const MODULES_COL = 'modules';
const ASSIGNMENTS_COL = 'assignments';
const SUBMISSIONS_COL = 'submissions';
const SKILLS_COL = 'skill_requirements';
const REQUESTS_COL = 'skill_requests';

/**
 * Fetch full database state from Cloud Firestore
 */
export async function fetchCloudDatabase(): Promise<DatabaseState | null> {
  try {
    await ensureAuth();
    const [
      usersSnap,
      settingsSnap,
      sessionsSnap,
      recordsSnap,
      modulesSnap,
      assignmentsSnap,
      submissionsSnap,
      skillsSnap,
      requestsSnap,
    ] = await Promise.all([
      getDocs(collection(db, USERS_COL)),
      getDoc(doc(db, SETTINGS_COL, 'school')),
      getDocs(collection(db, SESSIONS_COL)),
      getDocs(collection(db, RECORDS_COL)),
      getDocs(collection(db, MODULES_COL)),
      getDocs(collection(db, ASSIGNMENTS_COL)),
      getDocs(collection(db, SUBMISSIONS_COL)),
      getDocs(collection(db, SKILLS_COL)),
      getDocs(collection(db, REQUESTS_COL)),
    ]);

    // If users collection is completely empty, seed initial data to cloud
    if (usersSnap.empty) {
      await seedInitialDataToCloud(INITIAL_DATABASE);
      return INITIAL_DATABASE;
    }

    const users: User[] = usersSnap.docs.map((d) => d.data() as User);
    const settings: SchoolSettings = settingsSnap.exists()
      ? (settingsSnap.data() as SchoolSettings)
      : INITIAL_DATABASE.settings;

    const attendanceSessions: AttendanceSession[] = sessionsSnap.docs.map((d) => d.data() as AttendanceSession);
    const attendanceRecords: AttendanceRecord[] = recordsSnap.docs.map((d) => d.data() as AttendanceRecord);
    const modules: LearningModule[] = modulesSnap.docs.map((d) => d.data() as LearningModule);
    const assignments: Assignment[] = assignmentsSnap.docs.map((d) => d.data() as Assignment);
    const submissions: Submission[] = submissionsSnap.docs.map((d) => d.data() as Submission);
    const skillRequirements: SkillRequirement[] = skillsSnap.docs.map((d) => d.data() as SkillRequirement);
    const skillRequests: SkillRequest[] = requestsSnap.docs.map((d) => d.data() as SkillRequest);

    return {
      settings,
      users: users.length > 0 ? users : INITIAL_DATABASE.users,
      attendanceSessions: attendanceSessions.length > 0 ? attendanceSessions : INITIAL_DATABASE.attendanceSessions,
      attendanceRecords: attendanceRecords.length > 0 ? attendanceRecords : INITIAL_DATABASE.attendanceRecords,
      modules: modules.length > 0 ? modules : INITIAL_DATABASE.modules,
      assignments: assignments.length > 0 ? assignments : INITIAL_DATABASE.assignments,
      submissions: submissions.length > 0 ? submissions : INITIAL_DATABASE.submissions,
      skillRequirements: skillRequirements.length > 0 ? skillRequirements : INITIAL_DATABASE.skillRequirements,
      skillRequests: skillRequests.length > 0 ? skillRequests : INITIAL_DATABASE.skillRequests,
    };
  } catch (error) {
    console.error('Error fetching data from Firestore:', error);
    return null;
  }
}

/**
 * Seed initial database records into Cloud Firestore
 */
export async function seedInitialDataToCloud(seedData: DatabaseState): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Settings
    batch.set(doc(db, SETTINGS_COL, 'school'), seedData.settings);

    // Users
    seedData.users.forEach((user) => {
      batch.set(doc(db, USERS_COL, user.id), user);
    });

    // Modules
    seedData.modules.forEach((mod) => {
      batch.set(doc(db, MODULES_COL, mod.id), mod);
    });

    // Sessions
    seedData.attendanceSessions.forEach((ses) => {
      batch.set(doc(db, SESSIONS_COL, ses.id), ses);
    });

    // Skill Requirements
    seedData.skillRequirements.forEach((skk) => {
      batch.set(doc(db, SKILLS_COL, skk.id), skk);
    });

    // Assignments
    seedData.assignments.forEach((asg) => {
      batch.set(doc(db, ASSIGNMENTS_COL, asg.id), asg);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error seeding initial data to Firestore:', error);
  }
}

/**
 * Sync single user to cloud
 */
export async function saveUserToCloud(user: User): Promise<void> {
  try {
    await setDoc(doc(db, USERS_COL, user.id), user);
  } catch (err) {
    console.error('Failed to save user to cloud:', err);
  }
}

/**
 * Delete user from cloud
 */
export async function deleteUserFromCloud(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, USERS_COL, userId));
  } catch (err) {
    console.error('Failed to delete user from cloud:', err);
  }
}

/**
 * Save school settings to cloud
 */
export async function saveSettingsToCloud(settings: SchoolSettings): Promise<void> {
  try {
    await setDoc(doc(db, SETTINGS_COL, 'school'), settings);
  } catch (err) {
    console.error('Failed to save settings to cloud:', err);
  }
}

/**
 * Save attendance session to cloud
 */
export async function saveSessionToCloud(session: AttendanceSession): Promise<void> {
  try {
    await setDoc(doc(db, SESSIONS_COL, session.id), session);
  } catch (err) {
    console.error('Failed to save session to cloud:', err);
  }
}

/**
 * Save attendance record to cloud
 */
export async function saveAttendanceRecordToCloud(record: AttendanceRecord): Promise<void> {
  try {
    await setDoc(doc(db, RECORDS_COL, record.id), record);
  } catch (err) {
    console.error('Failed to save attendance record to cloud:', err);
  }
}

/**
 * Save assignment / quiz to cloud
 */
export async function saveAssignmentToCloud(assignment: Assignment): Promise<void> {
  try {
    await setDoc(doc(db, ASSIGNMENTS_COL, assignment.id), assignment);
  } catch (err) {
    console.error('Failed to save assignment to cloud:', err);
  }
}

/**
 * Save student submission to cloud
 */
export async function saveSubmissionToCloud(submission: Submission): Promise<void> {
  try {
    await setDoc(doc(db, SUBMISSIONS_COL, submission.id), submission);
  } catch (err) {
    console.error('Failed to save submission to cloud:', err);
  }
}

/**
 * Save skill request to cloud
 */
export async function saveSkillRequestToCloud(req: SkillRequest): Promise<void> {
  try {
    await setDoc(doc(db, REQUESTS_COL, req.id), req);
  } catch (err) {
    console.error('Failed to save skill request to cloud:', err);
  }
}

/**
 * Save complete DatabaseState to cloud (useful for bulk edits or restore)
 */
export async function syncFullDatabaseToCloud(dbState: DatabaseState): Promise<boolean> {
  try {
    await seedInitialDataToCloud(dbState);
    return true;
  } catch (err) {
    console.error('Failed to sync full database to cloud:', err);
    return false;
  }
}
