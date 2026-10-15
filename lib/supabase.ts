import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseState, User, SchoolSettings, AttendanceSession, AttendanceRecord, LearningModule, Assignment, Submission, SkillRequirement, SkillRequest } from '@/types/pmr';
import { INITIAL_DATABASE } from './initial-data';

const SUPABASE_URL_KEY = 'ayo_pmrku_supabase_url';
const SUPABASE_KEY_KEY = 'ayo_pmrku_supabase_anon_key';

/**
 * Get configured Supabase credentials (from environment or localStorage)
 */
export function getSupabaseConfig(): { url: string; anonKey: string } {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem(SUPABASE_URL_KEY);
    const savedKey = localStorage.getItem(SUPABASE_KEY_KEY);
    if (savedUrl) url = savedUrl;
    if (savedKey) anonKey = savedKey;
  }

  return { url: url.trim(), anonKey: anonKey.trim() };
}

/**
 * Save Supabase credentials to localStorage
 */
export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window === 'undefined') return;
  if (url) {
    localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  } else {
    localStorage.removeItem(SUPABASE_URL_KEY);
  }

  if (anonKey) {
    localStorage.setItem(SUPABASE_KEY_KEY, anonKey.trim());
  } else {
    localStorage.removeItem(SUPABASE_KEY_KEY);
  }
}

/**
 * Clear Supabase config
 */
export function clearSupabaseConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SUPABASE_URL_KEY);
  localStorage.removeItem(SUPABASE_KEY_KEY);
}

/**
 * Create a Supabase Client instance
 */
let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;

  if (cachedClient && lastUrl === url && lastKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
      },
    });
    lastUrl = url;
    lastKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}

/**
 * Test connectivity to Supabase
 */
export async function testSupabaseConnection(url?: string, anonKey?: string): Promise<{ success: boolean; message: string; latency?: number }> {
  const targetUrl = url || getSupabaseConfig().url;
  const targetKey = anonKey || getSupabaseConfig().anonKey;

  if (!targetUrl || !targetKey) {
    return { success: false, message: 'URL Supabase atau Anon Key belum diisi.' };
  }

  const startTime = Date.now();
  try {
    const client = createClient(targetUrl, targetKey, {
      auth: { persistSession: false },
    });

    // Try a simple select query from users or school_settings
    const { data, error } = await client.from('school_settings').select('school_name').limit(1);

    const latency = Date.now() - startTime;
    if (error) {
      // Check if table not found or auth error
      if (error.code === '42P01') {
        return {
          success: false,
          message: `Koneksi berhasil terhubung, namun tabel database belum dibuat (Error: ${error.message}). Silakan jalankan script SQL di SQL Editor Supabase terlebih dahulu.`,
        };
      }
      return {
        success: false,
        message: `Gagal terhubung: ${error.message} (${error.code || 'API Error'})`,
      };
    }

    return {
      success: true,
      message: `Berhasil terhubung ke Supabase! Latensi: ${latency} ms`,
      latency,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Koneksi gagal: ${err?.message || 'Periksa kembali URL dan Anon Key'}`,
    };
  }
}

/**
 * Fetch all PMR data from Supabase
 */
export async function fetchDatabaseFromSupabase(): Promise<{ success: boolean; data?: DatabaseState; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Klien Supabase belum dikonfigurasi.' };
  }

  try {
    // 1. Fetch school_settings
    const { data: settingsData, error: settingsError } = await client
      .from('school_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (settingsError && settingsError.code !== 'PGRST116') {
      throw new Error(`Gagal memuat pengaturan: ${settingsError.message}`);
    }

    // 2. Fetch users
    const { data: usersData, error: usersError } = await client.from('users').select('*');
    if (usersError) throw new Error(`Gagal memuat anggota: ${usersError.message}`);

    // 3. Fetch attendance_sessions
    const { data: sessionsData, error: sessionsError } = await client.from('attendance_sessions').select('*');
    if (sessionsError) throw new Error(`Gagal memuat sesi absensi: ${sessionsError.message}`);

    // 4. Fetch attendance_records
    const { data: recordsData, error: recordsError } = await client.from('attendance_records').select('*');
    if (recordsError) throw new Error(`Gagal memuat rekap absensi: ${recordsError.message}`);

    // 5. Fetch modules
    const { data: modulesData, error: modulesError } = await client.from('modules').select('*');
    if (modulesError) throw new Error(`Gagal memuat modul: ${modulesError.message}`);

    // 6. Fetch assignments
    const { data: assignmentsData, error: assignmentsError } = await client.from('assignments').select('*');
    if (assignmentsError) throw new Error(`Gagal memuat tugas: ${assignmentsError.message}`);

    // 7. Fetch submissions
    const { data: submissionsData, error: submissionsError } = await client.from('submissions').select('*');
    if (submissionsError) throw new Error(`Gagal memuat pengumpulan: ${submissionsError.message}`);

    // 8. Fetch skill_requirements
    const { data: skillReqsData, error: skillReqsError } = await client.from('skill_requirements').select('*');
    if (skillReqsError) throw new Error(`Gagal memuat syarat SKK: ${skillReqsError.message}`);

    // 9. Fetch skill_requests
    const { data: skillRequestsData, error: skillRequestsError } = await client.from('skill_requests').select('*');
    if (skillRequestsError) throw new Error(`Gagal memuat permohonan SKK: ${skillRequestsError.message}`);

    // Format into DatabaseState
    const settings: SchoolSettings = settingsData ? {
      schoolName: settingsData.school_name || INITIAL_DATABASE.settings.schoolName,
      unitName: settingsData.unit_name || INITIAL_DATABASE.settings.unitName,
      schoolLevel: settingsData.school_level || INITIAL_DATABASE.settings.schoolLevel,
      address: settingsData.address || INITIAL_DATABASE.settings.address,
      phone: settingsData.phone || INITIAL_DATABASE.settings.phone,
      email: settingsData.email || INITIAL_DATABASE.settings.email,
      principalName: settingsData.principal_name || INITIAL_DATABASE.settings.principalName,
      principalNip: settingsData.principal_nip || INITIAL_DATABASE.settings.principalNip,
      coachName: settingsData.coach_name || INITIAL_DATABASE.settings.coachName,
      coachNip: settingsData.coach_nip || INITIAL_DATABASE.settings.coachNip,
      logoUrl: settingsData.logo_url || INITIAL_DATABASE.settings.logoUrl,
      pmrLogoUrl: settingsData.pmr_logo_url || INITIAL_DATABASE.settings.pmrLogoUrl,
      signatureStampUrl: settingsData.signature_stamp_url || INITIAL_DATABASE.settings.signatureStampUrl,
    } : INITIAL_DATABASE.settings;

    const users: User[] = (usersData || []).map((row: any) => ({
      id: row.id,
      fullName: row.full_name,
      role: row.role,
      username: row.username,
      password: row.password,
      className: row.class_name,
      gender: row.gender,
      birthPlace: row.birth_place,
      birthDate: row.birth_date,
      phone: row.phone,
      address: row.address,
      photoUrl: row.photo_url,
      positionOrLevel: row.position_or_level,
      nis: row.nis,
      emergencyContact: row.emergency_contact,
      joinedDate: row.joined_date,
    }));

    const attendanceSessions: AttendanceSession[] = (sessionsData || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      type: row.type,
      qrSecret: row.qr_secret,
      isActive: row.is_active,
      notes: row.notes || '',
    }));

    const attendanceRecords: AttendanceRecord[] = (recordsData || []).map((row: any) => ({
      id: row.id,
      sessionId: row.session_id,
      userId: row.user_id,
      userName: row.user_name,
      role: row.role,
      date: row.date,
      time: row.time,
      status: row.status,
      type: row.type,
      selfieUrl: row.selfie_url,
    }));

    const modules: LearningModule[] = (modulesData || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      content: row.content,
      fileUrl: row.file_url,
      fileName: row.file_name,
      author: row.author,
      uploadDate: row.upload_date,
      summary: row.summary,
      images: row.images || [],
    }));

    const assignments: Assignment[] = (assignmentsData || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      type: row.type,
      description: row.description,
      deadline: row.deadline,
      createdBy: row.created_by,
      createdDate: row.created_date,
      questions: row.questions || [],
      passingScore: row.passing_score,
      practicalInstructions: row.practical_instructions,
    }));

    const submissions: Submission[] = (submissionsData || []).map((row: any) => ({
      id: row.id,
      taskId: row.task_id,
      userId: row.user_id,
      studentName: row.student_name,
      score: row.score,
      feedback: row.feedback || '',
      submittedDate: row.submitted_date,
      fileUrl: row.file_url || '',
      fileName: row.file_name,
      notes: row.notes || '',
      status: row.status,
      answers: row.answers || {},
      totalQuestions: row.total_questions,
      correctCount: row.correct_count,
    }));

    const skillRequirements: SkillRequirement[] = (skillReqsData || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      level: row.level,
      category: row.category,
      description: row.description,
      standards: row.standards || [],
      badgeIcon: row.badge_icon,
      badgeColor: row.badge_color,
    }));

    const skillRequests: SkillRequest[] = (skillRequestsData || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      studentName: row.student_name,
      requirementId: row.requirement_id,
      requirementName: row.requirement_name,
      status: row.status,
      score: row.score,
      examinerNotes: row.examiner_notes || '',
      requestedDate: row.requested_date,
      validatedBy: row.validated_by,
      proofFileUrl: row.proof_file_url || '',
      reportText: row.report_text || '',
    }));

    const databaseState: DatabaseState = {
      settings,
      users: users.length > 0 ? users : INITIAL_DATABASE.users,
      attendanceSessions,
      attendanceRecords,
      modules: modules.length > 0 ? modules : INITIAL_DATABASE.modules,
      assignments: assignments.length > 0 ? assignments : INITIAL_DATABASE.assignments,
      submissions,
      skillRequirements: skillRequirements.length > 0 ? skillRequirements : INITIAL_DATABASE.skillRequirements,
      skillRequests,
    };

    return {
      success: true,
      data: databaseState,
      message: `Berhasil mengunduh data dari Supabase (${users.length} anggota, ${modules.length} modul, ${attendanceRecords.length} presensi).`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Terjadi kesalahan saat mengunduh data dari Supabase',
    };
  }
}

/**
 * Upload and synchronize local DatabaseState to Supabase
 */
export async function syncDatabaseToSupabase(db: DatabaseState): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Klien Supabase belum dikonfigurasi.' };
  }

  try {
    // 1. Upsert School Settings
    const { error: settingsError } = await client.from('school_settings').upsert({
      id: 1,
      school_name: db.settings.schoolName,
      unit_name: db.settings.unitName,
      school_level: db.settings.schoolLevel,
      address: db.settings.address,
      phone: db.settings.phone,
      email: db.settings.email,
      principal_name: db.settings.principalName,
      principal_nip: db.settings.principalNip,
      coach_name: db.settings.coachName,
      coach_nip: db.settings.coachNip,
      logo_url: db.settings.logoUrl,
      pmr_logo_url: db.settings.pmrLogoUrl,
      signature_stamp_url: db.settings.signatureStampUrl,
      updated_at: new Date().toISOString(),
    });
    if (settingsError) throw new Error(`Pengaturan: ${settingsError.message}`);

    // 2. Upsert Users
    if (db.users.length > 0) {
      const userRows = db.users.map((u) => ({
        id: u.id,
        full_name: u.fullName,
        role: u.role,
        username: u.username,
        password: u.password || 'pmr123',
        class_name: u.className,
        gender: u.gender,
        birth_place: u.birthPlace,
        birth_date: u.birthDate,
        phone: u.phone,
        address: u.address,
        photo_url: u.photoUrl,
        position_or_level: u.positionOrLevel,
        nis: u.nis,
        emergency_contact: u.emergencyContact || '',
        joined_date: u.joinedDate,
        updated_at: new Date().toISOString(),
      }));
      const { error: usersError } = await client.from('users').upsert(userRows);
      if (usersError) throw new Error(`Anggota: ${usersError.message}`);
    }

    // 3. Upsert Attendance Sessions
    if (db.attendanceSessions.length > 0) {
      const sessionRows = db.attendanceSessions.map((s) => ({
        id: s.id,
        title: s.title,
        date: s.date,
        start_time: s.startTime,
        end_time: s.endTime,
        type: s.type,
        qr_secret: s.qrSecret,
        is_active: s.isActive,
        notes: s.notes,
        updated_at: new Date().toISOString(),
      }));
      const { error: sessionError } = await client.from('attendance_sessions').upsert(sessionRows);
      if (sessionError) throw new Error(`Sesi Presensi: ${sessionError.message}`);
    }

    // 4. Upsert Attendance Records
    if (db.attendanceRecords.length > 0) {
      const recordRows = db.attendanceRecords.map((r) => ({
        id: r.id,
        session_id: r.sessionId,
        user_id: r.userId,
        user_name: r.userName,
        role: r.role,
        date: r.date,
        time: r.time,
        status: r.status,
        type: r.type,
        selfie_url: r.selfieUrl || '',
        updated_at: new Date().toISOString(),
      }));
      const { error: recordsError } = await client.from('attendance_records').upsert(recordRows);
      if (recordsError) throw new Error(`Rekap Presensi: ${recordsError.message}`);
    }

    // 5. Upsert Modules
    if (db.modules.length > 0) {
      const moduleRows = db.modules.map((m) => ({
        id: m.id,
        title: m.title,
        category: m.category,
        content: m.content,
        file_url: m.fileUrl || '',
        file_name: m.fileName || '',
        author: m.author,
        upload_date: m.uploadDate,
        summary: m.summary,
        images: m.images || [],
        updated_at: new Date().toISOString(),
      }));
      const { error: modulesError } = await client.from('modules').upsert(moduleRows);
      if (modulesError) throw new Error(`Modul: ${modulesError.message}`);
    }

    // 6. Upsert Assignments
    if (db.assignments.length > 0) {
      const assignmentRows = db.assignments.map((a) => ({
        id: a.id,
        title: a.title,
        category: a.category,
        type: a.type,
        description: a.description,
        deadline: a.deadline,
        created_by: a.createdBy,
        created_date: a.createdDate,
        questions: a.questions || [],
        passing_score: a.passingScore ?? 70,
        practical_instructions: a.practicalInstructions || '',
        updated_at: new Date().toISOString(),
      }));
      const { error: assignmentsError } = await client.from('assignments').upsert(assignmentRows);
      if (assignmentsError) throw new Error(`Tugas: ${assignmentsError.message}`);
    }

    // 7. Upsert Submissions
    if (db.submissions.length > 0) {
      const submissionRows = db.submissions.map((s) => ({
        id: s.id,
        task_id: s.taskId,
        user_id: s.userId,
        student_name: s.studentName,
        score: s.score,
        feedback: s.feedback,
        submitted_date: s.submittedDate,
        file_url: s.fileUrl,
        file_name: s.fileName || '',
        notes: s.notes,
        status: s.status,
        answers: s.answers || {},
        total_questions: s.totalQuestions ?? 0,
        correct_count: s.correctCount ?? 0,
        updated_at: new Date().toISOString(),
      }));
      const { error: submissionsError } = await client.from('submissions').upsert(submissionRows);
      if (submissionsError) throw new Error(`Pengumpulan: ${submissionsError.message}`);
    }

    // 8. Upsert Skill Requirements
    if (db.skillRequirements.length > 0) {
      const skillRows = db.skillRequirements.map((sk) => ({
        id: sk.id,
        name: sk.name,
        level: sk.level,
        category: sk.category,
        description: sk.description,
        standards: sk.standards || [],
        badge_icon: sk.badgeIcon,
        badge_color: sk.badgeColor,
        updated_at: new Date().toISOString(),
      }));
      const { error: skillError } = await client.from('skill_requirements').upsert(skillRows);
      if (skillError) throw new Error(`SKK: ${skillError.message}`);
    }

    // 9. Upsert Skill Requests
    if (db.skillRequests.length > 0) {
      const requestRows = db.skillRequests.map((req) => ({
        id: req.id,
        user_id: req.userId,
        student_name: req.studentName,
        requirement_id: req.requirementId,
        requirement_name: req.requirementName,
        status: req.status,
        score: req.score,
        examiner_notes: req.examinerNotes,
        requested_date: req.requestedDate,
        validated_by: req.validatedBy || '',
        proof_file_url: req.proofFileUrl || '',
        report_text: req.reportText || '',
        updated_at: new Date().toISOString(),
      }));
      const { error: requestError } = await client.from('skill_requests').upsert(requestRows);
      if (requestError) throw new Error(`Permohonan SKK: ${requestError.message}`);
    }

    return {
      success: true,
      message: `Sinkronisasi berhasil! Seluruh data (${db.users.length} pengguna, presensi, materi, & tugas) berhasil diunggah ke Supabase.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Sinkronisasi gagal: ${err.message}`,
    };
  }
}
