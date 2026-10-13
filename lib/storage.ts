import { DatabaseState, User, SchoolSettings, AttendanceRecord, AttendanceSession, Submission, Assignment, SkillRequest } from '@/types/pmr';
import { INITIAL_DATABASE } from './initial-data';
import JSZip from 'jszip';

const STORAGE_KEY = 'ayo_pmrku_db_v2';
const SESSION_KEY = 'ayo_pmrku_current_user_v2';
const SNAPSHOTS_KEY = 'ayo_pmrku_snapshots_v1';

export function getStoredDatabase(): DatabaseState {
  if (typeof window === 'undefined') return INITIAL_DATABASE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATABASE));
      return INITIAL_DATABASE;
    }
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_DATABASE,
      ...parsed,
      settings: { ...INITIAL_DATABASE.settings, ...(parsed.settings || {}) },
      users: parsed.users || INITIAL_DATABASE.users,
      attendanceSessions: parsed.attendanceSessions || INITIAL_DATABASE.attendanceSessions,
      attendanceRecords: parsed.attendanceRecords || INITIAL_DATABASE.attendanceRecords,
      modules: parsed.modules || INITIAL_DATABASE.modules,
      assignments: parsed.assignments || INITIAL_DATABASE.assignments,
      submissions: parsed.submissions || INITIAL_DATABASE.submissions,
      skillRequirements: parsed.skillRequirements || INITIAL_DATABASE.skillRequirements,
      skillRequests: parsed.skillRequests || INITIAL_DATABASE.skillRequests,
    };
  } catch (err) {
    console.error('Failed to parse database from localStorage:', err);
    return INITIAL_DATABASE;
  }
}

export function saveDatabase(data: DatabaseState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save database to localStorage:', err);
  }
}

export function resetDatabase(): DatabaseState {
  if (typeof window === 'undefined') return INITIAL_DATABASE;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATABASE));
  return INITIAL_DATABASE;
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

export function setCurrentUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(SESSION_KEY);
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
}

/**
 * Calculate storage metrics and breakdown in KB
 */
export function getStorageMetrics(db: DatabaseState) {
  const json = JSON.stringify(db);
  const totalBytes = new Blob([json]).size;
  const totalKb = (totalBytes / 1024).toFixed(1);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);

  const usersBytes = new Blob([JSON.stringify(db.users)]).size;
  const attendanceBytes = new Blob([
    JSON.stringify({ sessions: db.attendanceSessions, records: db.attendanceRecords }),
  ]).size;
  const modulesBytes = new Blob([JSON.stringify(db.modules)]).size;
  const assignmentsBytes = new Blob([
    JSON.stringify({ assignments: db.assignments, submissions: db.submissions }),
  ]).size;
  const skillsBytes = new Blob([
    JSON.stringify({ reqs: db.skillRequirements, requests: db.skillRequests }),
  ]).size;

  let base64PhotosCount = 0;
  db.users.forEach((u) => {
    if (u.photoUrl && u.photoUrl.startsWith('data:image/')) {
      base64PhotosCount++;
    }
  });

  return {
    totalBytes,
    totalKb: Number(totalKb),
    totalMb: Number(totalMb),
    breakdown: {
      usersKb: Number((usersBytes / 1024).toFixed(1)),
      attendanceKb: Number((attendanceBytes / 1024).toFixed(1)),
      modulesKb: Number((modulesBytes / 1024).toFixed(1)),
      assignmentsKb: Number((assignmentsBytes / 1024).toFixed(1)),
      skillsKb: Number((skillsBytes / 1024).toFixed(1)),
    },
    base64PhotosCount,
  };
}

/**
 * Generate full JSON string backup
 */
export function exportDatabaseJson(db: DatabaseState): string {
  return JSON.stringify(db, null, 2);
}

/**
 * Generate full ZIP backup containing database.json, photos folder, and summary
 */
export async function exportDatabaseZip(db: DatabaseState): Promise<Blob> {
  const zip = new JSZip();

  // 1. Add database.json
  zip.file('database.json', JSON.stringify(db, null, 2));

  // 2. Add Readme
  const nowStr = new Date().toLocaleString('id-ID');
  zip.file(
    'README_BACKUP.txt',
    `=============================================================
AYO PMRKU - CADANGAN LENGKAP SISTEM & BUKU INDUK DIGITAL PMR
=============================================================
Unit Sekolah     : ${db.settings.schoolName}
Tingkat          : PMR ${db.settings.schoolLevel.toUpperCase()}
Kepala Sekolah   : ${db.settings.principalName}
Pembina Utama    : ${db.settings.coachName}
Tanggal Backup   : ${nowStr}

RINGKASAN DATA:
- Total Pengguna Terdaftar : ${db.users.length}
  * Anggota Siswa/i        : ${db.users.filter((u) => u.role === 'member').length}
  * Pembina & Pelatih      : ${db.users.filter((u) => u.role === 'coach').length}
  * Administrator          : ${db.users.filter((u) => u.role === 'admin').length}
- Sesi Presensi Latihan    : ${db.attendanceSessions.length} sesi (${db.attendanceRecords.length} rekaman)
- Modul & Materi PMI       : ${db.modules.length} modul
- Penugasan & Kuis         : ${db.assignments.length} tugas (${db.submissions.length} respon)
- Uji Syarat Kecakapan (SKK): ${db.skillRequests.length} pengajuan

PETUNJUK PEMULIHAN (RESTORE):
1. Buka aplikasi Ayo PMRku -> Masuk sebagai Administrator.
2. Buka menu 'Backup & Restore Data' -> Pilih tab 'Pulihkan Data'.
3. Unggah file ZIP ini, pilih metode 'Timpa Total' atau 'Gabungkan Pintar'.
4. Sistem akan memuat ulang seluruh data dan foto secara instan.
=============================================================`
  );

  // 3. Add Photos folder
  const photosFolder = zip.folder('Foto_Anggota');
  if (photosFolder) {
    for (const user of db.users) {
      if (user.photoUrl && user.photoUrl.startsWith('data:image/')) {
        try {
          const parts = user.photoUrl.split(';base64,');
          if (parts.length === 2) {
            const ext = parts[0].includes('png') ? 'png' : 'jpg';
            const safeName = (user.nis || user.username || user.id).replace(/[^a-zA-Z0-9_-]/g, '_');
            photosFolder.file(`${safeName}.${ext}`, parts[1], { base64: true });
          }
        } catch (e) {
          console.warn('Could not bundle photo for user:', user.fullName, e);
        }
      }
    }
  }

  // 4. Add CSVs for spreadsheet viewing
  const reportsFolder = zip.folder('Tabel_Excel_CSV');
  if (reportsFolder) {
    reportsFolder.file('Buku_Induk_Anggota.csv', generateCsvMembers(db.users));
    reportsFolder.file(
      'Rekap_Presensi.csv',
      generateCsvAttendance(db.attendanceRecords, db.attendanceSessions)
    );
    reportsFolder.file(
      'Rekap_Tugas_Dan_Kuis.csv',
      generateCsvSubmissions(db.submissions, db.assignments)
    );
    reportsFolder.file('Rekap_Uji_SKK.csv', generateCsvSkills(db.skillRequests));
  }

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * CSV Generators
 */
export function generateCsvMembers(users: User[]): string {
  const headers = [
    'ID',
    'Nama Lengkap',
    'Peran',
    'Username',
    'NIS/NIP',
    'Kelas',
    'Jenis Kelamin',
    'Tempat Lahir',
    'Tanggal Lahir',
    'No HP/WA',
    'Tingkat/Jabatan',
    'Kontak Darurat',
    'Tanggal Bergabung',
    'Alamat',
  ];

  const rows = users.map((u) => [
    `"${u.id}"`,
    `"${u.fullName.replace(/"/g, '""')}"`,
    `"${u.role}"`,
    `"${u.username}"`,
    `"${u.nis || ''}"`,
    `"${u.className || ''}"`,
    `"${u.gender || ''}"`,
    `"${u.birthPlace || ''}"`,
    `"${u.birthDate || ''}"`,
    `"${u.phone || ''}"`,
    `"${u.positionOrLevel || ''}"`,
    `"${u.emergencyContact || ''}"`,
    `"${u.joinedDate || ''}"`,
    `"${(u.address || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function generateCsvAttendance(
  records: AttendanceRecord[],
  sessions: AttendanceSession[]
): string {
  const sessionMap = new Map<string, string>();
  sessions.forEach((s) => sessionMap.set(s.id, `${s.date} - ${s.title}`));

  const headers = ['ID Rekaman', 'Sesi Pertemuan', 'ID Pengguna', 'Nama Lengkap', 'Peran', 'Tanggal', 'Jam', 'Status', 'Metode'];
  const rows = records.map((r) => [
    `"${r.id}"`,
    `"${sessionMap.get(r.sessionId) || r.sessionId}"`,
    `"${r.userId}"`,
    `"${r.userName.replace(/"/g, '""')}"`,
    `"${r.role}"`,
    `"${r.date}"`,
    `"${r.time}"`,
    `"${r.status}"`,
    `"${r.type}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function generateCsvSubmissions(
  submissions: Submission[],
  assignments: Assignment[]
): string {
  const assignMap = new Map<string, { title: string; type: string }>();
  assignments.forEach((a) => assignMap.set(a.id, { title: a.title, type: a.type }));

  const headers = [
    'ID Respon',
    'Judul Tugas',
    'Tipe Tugas',
    'Nama Siswa',
    'Nilai Skor',
    'Status Penilaian',
    'Tanggal Pengumpulan',
    'Catatan Siswa',
    'Koreksi / Feedback Pembina',
  ];

  const rows = submissions.map((s) => {
    const task = assignMap.get(s.taskId);
    return [
      `"${s.id}"`,
      `"${(task?.title || s.taskId).replace(/"/g, '""')}"`,
      `"${task?.type === 'pilgan' ? 'Kuis Pilihan Ganda' : 'Praktik Lapangan'}"`,
      `"${s.studentName.replace(/"/g, '""')}"`,
      `"${s.score !== null ? s.score : 'Belum Dinilai'}"`,
      `"${s.status}"`,
      `"${s.submittedDate}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`,
      `"${(s.feedback || '').replace(/"/g, '""')}"`,
    ];
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function generateCsvSkills(requests: SkillRequest[]): string {
  const headers = [
    'ID Pengajuan',
    'Nama Siswa',
    'Syarat Kecakapan (SKK)',
    'Status',
    'Nilai',
    'Penguji / Pembina',
    'Tanggal Pengajuan',
    'Catatan Penguji',
  ];

  const rows = requests.map((r) => [
    `"${r.id}"`,
    `"${r.studentName.replace(/"/g, '""')}"`,
    `"${r.requirementName.replace(/"/g, '""')}"`,
    `"${r.status}"`,
    `"${r.score !== null ? r.score : '-'}"`,
    `"${r.validatedBy || '-'}"`,
    `"${r.requestedDate}"`,
    `"${(r.examinerNotes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Validate incoming database object
 */
export function validateDatabaseStructure(parsed: any): { isValid: boolean; error?: string } {
  if (!parsed || typeof parsed !== 'object') {
    return { isValid: false, error: 'Berkas cadangan kosong atau bukan format JSON yang valid.' };
  }
  if (!Array.isArray(parsed.users)) {
    return { isValid: false, error: 'Format data tidak valid: Data pengguna (users) tidak ditemukan.' };
  }
  if (!parsed.settings || typeof parsed.settings !== 'object') {
    return { isValid: false, error: 'Format data tidak valid: Pengaturan sekolah (settings) tidak ditemukan.' };
  }
  return { isValid: true };
}

/**
 * Restore database from ZIP Blob or File
 */
export async function importDatabaseZip(file: File): Promise<DatabaseState> {
  const zip = await JSZip.loadAsync(file);

  const dbFile = zip.file('database.json');
  if (!dbFile) {
    throw new Error('Berkas database.json tidak ditemukan di dalam file ZIP yang diunggah.');
  }

  const jsonContent = await dbFile.async('string');
  const parsed = JSON.parse(jsonContent);

  const val = validateDatabaseStructure(parsed);
  if (!val.isValid) {
    throw new Error(val.error || 'Format data cadangan tidak valid.');
  }

  return parsed as DatabaseState;
}

/**
 * Smart Merge: combines incoming database with current database without duplicates
 */
export function mergeDatabases(current: DatabaseState, incoming: DatabaseState): DatabaseState {
  // Merge users: keep existing, add new ones by ID/NIS/username
  const userMap = new Map<string, User>();
  current.users.forEach((u) => userMap.set(u.id, u));
  incoming.users.forEach((u) => {
    // If user already exists by ID, merge properties (incoming takes priority for non-empty)
    if (userMap.has(u.id)) {
      const existing = userMap.get(u.id)!;
      userMap.set(u.id, {
        ...existing,
        ...u,
        photoUrl: u.photoUrl || existing.photoUrl,
      });
    } else {
      userMap.set(u.id, u);
    }
  });

  // Merge attendance sessions
  const sessionMap = new Map<string, AttendanceSession>();
  current.attendanceSessions.forEach((s) => sessionMap.set(s.id, s));
  incoming.attendanceSessions.forEach((s) => sessionMap.set(s.id, s));

  // Merge attendance records
  const recordMap = new Map<string, AttendanceRecord>();
  current.attendanceRecords.forEach((r) => recordMap.set(r.id, r));
  incoming.attendanceRecords.forEach((r) => recordMap.set(r.id, r));

  // Merge modules
  const moduleMap = new Map<string, any>();
  current.modules.forEach((m) => moduleMap.set(m.id, m));
  incoming.modules.forEach((m) => moduleMap.set(m.id, m));

  // Merge assignments
  const assignMap = new Map<string, any>();
  current.assignments.forEach((a) => assignMap.set(a.id, a));
  incoming.assignments.forEach((a) => assignMap.set(a.id, a));

  // Merge submissions
  const subMap = new Map<string, any>();
  current.submissions.forEach((s) => subMap.set(s.id, s));
  incoming.submissions.forEach((s) => subMap.set(s.id, s));

  // Merge skill requirements & requests
  const skillReqMap = new Map<string, any>();
  current.skillRequirements.forEach((sk) => skillReqMap.set(sk.id, sk));
  incoming.skillRequirements.forEach((sk) => skillReqMap.set(sk.id, sk));

  const skillReqsMap = new Map<string, any>();
  current.skillRequests.forEach((sr) => skillReqsMap.set(sr.id, sr));
  incoming.skillRequests.forEach((sr) => skillReqsMap.set(sr.id, sr));

  return {
    settings: {
      ...current.settings,
      ...(incoming.settings || {}),
    },
    users: Array.from(userMap.values()),
    attendanceSessions: Array.from(sessionMap.values()),
    attendanceRecords: Array.from(recordMap.values()),
    modules: Array.from(moduleMap.values()),
    assignments: Array.from(assignMap.values()),
    submissions: Array.from(subMap.values()),
    skillRequirements: Array.from(skillReqMap.values()),
    skillRequests: Array.from(skillReqsMap.values()),
  };
}

/**
 * Local Snapshots Management
 */
export interface LocalSnapshot {
  id: string;
  name: string;
  timestamp: string;
  sizeKb: number;
  userCount: number;
  data: DatabaseState;
}

export function getLocalSnapshots(): LocalSnapshot[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function createLocalSnapshot(name: string, db: DatabaseState): LocalSnapshot {
  const snapshots = getLocalSnapshots();
  const json = JSON.stringify(db);
  const sizeKb = Number((new Blob([json]).size / 1024).toFixed(1));

  const newSnap: LocalSnapshot = {
    id: `SNP-${Date.now()}`,
    name: name.trim() || `Snapshot ${new Date().toLocaleDateString('id-ID')}`,
    timestamp: new Date().toLocaleString('id-ID'),
    sizeKb,
    userCount: db.users.length,
    data: db,
  };

  const updated = [newSnap, ...snapshots.slice(0, 9)]; // Keep max 10 snapshots
  localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
  return newSnap;
}

export function deleteLocalSnapshot(id: string): LocalSnapshot[] {
  const snapshots = getLocalSnapshots();
  const updated = snapshots.filter((s) => s.id !== id);
  localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
  return updated;
}

export interface BatchPhotoMatchResult {
  fileName: string;
  matchedUser: User | null;
  confidence: 'exact-username' | 'exact-nis' | 'fuzzy-name' | 'unmatched';
  dataUrl: string;
}

/**
 * Batch Photo Import: Unpacks a ZIP containing student photos and matches
 * them against registered members using username, NIS, or fuzzy full name.
 */
export async function matchPhotosFromZip(
  zipFile: File,
  members: User[]
): Promise<BatchPhotoMatchResult[]> {
  const zip = await JSZip.loadAsync(zipFile);
  const results: BatchPhotoMatchResult[] = [];

  const fileEntries = Object.keys(zip.files).filter((path) => {
    const lower = path.toLowerCase();
    return (
      !zip.files[path].dir &&
      (lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.png') ||
        lower.endsWith('.webp'))
    );
  });

  for (const filePath of fileEntries) {
    const file = zip.files[filePath];
    const base64Data = await file.async('base64');
    const ext = filePath.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
    const dataUrl = `data:image/${ext};base64,${base64Data}`;

    // Extract base file name without extension
    const parts = filePath.split('/');
    const simpleName = parts[parts.length - 1];
    const nameWithoutExt = simpleName.replace(/\.[^/.]+$/, '').trim().toLowerCase();

    // 1. Try exact username match
    let matchedUser: User | null = null;
    let confidence: BatchPhotoMatchResult['confidence'] = 'unmatched';

    const byUsername = members.find(
      (m) => m.username.toLowerCase() === nameWithoutExt
    );
    if (byUsername) {
      matchedUser = byUsername;
      confidence = 'exact-username';
    } else {
      // 2. Try exact NIS match (strip dots/dashes)
      const cleanTarget = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '');
      const byNis = members.find(
        (m) => m.nis.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === cleanTarget
      );
      if (byNis) {
        matchedUser = byNis;
        confidence = 'exact-nis';
      } else {
        // 3. Try fuzzy student full name match
        const byName = members.find((m) => {
          const mName = m.fullName.toLowerCase();
          return (
            mName.includes(nameWithoutExt) ||
            nameWithoutExt.includes(mName) ||
            mName.split(' ')[0] === nameWithoutExt.split(' ')[0]
          );
        });
        if (byName) {
          matchedUser = byName;
          confidence = 'fuzzy-name';
        }
      }
    }

    results.push({
      fileName: simpleName,
      matchedUser,
      confidence,
      dataUrl,
    });
  }

  return results;
}
