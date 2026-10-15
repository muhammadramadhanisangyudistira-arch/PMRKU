'use client';

import React, { useState, useRef, useMemo } from 'react';
import { DatabaseState } from '@/types/pmr';
import {
  exportDatabaseZip,
  exportDatabaseJson,
  importDatabaseZip,
  validateDatabaseStructure,
  mergeDatabases,
  getStorageMetrics,
  generateCsvMembers,
  generateCsvAttendance,
  generateCsvSubmissions,
  generateCsvSkills,
  getLocalSnapshots,
  createLocalSnapshot,
  deleteLocalSnapshot,
  LocalSnapshot,
  resetDatabase,
} from '@/lib/storage';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  fetchDatabaseFromSupabase,
  syncDatabaseToSupabase,
  clearSupabaseConfig,
} from '@/lib/supabase';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Archive,
  FileSpreadsheet,
  FileCode,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Plus,
  ShieldAlert,
  ArrowRight,
  Layers,
  Users,
  CalendarCheck,
  Award,
  Sparkles,
  Info,
  Check,
  Copy,
  FolderArchive,
  FileText,
  Globe,
  Key,
  ExternalLink,
  ShieldCheck,
  CloudUpload,
  CloudDownload,
  Terminal,
} from 'lucide-react';

interface BackupRestoreTabProps {
  db: DatabaseState;
  onUpdateDb: (newDb: DatabaseState) => void;
}

export const BackupRestoreTab: React.FC<BackupRestoreTabProps> = ({
  db,
  onUpdateDb,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'backup' | 'restore' | 'snapshots' | 'supabase' | 'danger'
  >('backup');

  // Supabase State
  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseConfig().url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => getSupabaseConfig().anonKey);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [isSyncingToSupabase, setIsSyncingToSupabase] = useState(false);
  const [isFetchingFromSupabase, setIsFetchingFromSupabase] = useState(false);
  const [isCopiedSql, setIsCopiedSql] = useState(false);
  const [isCopiedVercelEnv, setIsCopiedVercelEnv] = useState(false);

  // Metrics
  const metrics = useMemo(() => getStorageMetrics(db), [db]);

  // Loading states
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);
  const [isCopiedJson, setIsCopiedJson] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Restore State
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreParsedDb, setRestoreParsedDb] = useState<DatabaseState | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const [restoreMode, setRestoreMode] = useState<'overwrite' | 'merge'>('overwrite');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Snapshot State
  const [snapshots, setSnapshots] = useState<LocalSnapshot[]>(() => getLocalSnapshots());
  const [newSnapshotName, setNewSnapshotName] = useState('');
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);

  // Danger / Reset State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [autoBackupBeforeReset, setAutoBackupBeforeReset] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    setSupabaseStatusMsg(null);
    saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
    const res = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    setIsTestingSupabase(false);
    setSupabaseStatusMsg({ success: res.success, text: res.message });
    if (res.success) {
      showSuccess('Koneksi ke Supabase berhasil diverifikasi!');
    }
  };

  const handleSyncToSupabase = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setSupabaseStatusMsg({ success: false, text: 'Mohon isi URL dan Anon Key terlebih dahulu.' });
      return;
    }
    saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
    setIsSyncingToSupabase(true);
    const res = await syncDatabaseToSupabase(db);
    setIsSyncingToSupabase(false);
    setSupabaseStatusMsg({ success: res.success, text: res.message });
    if (res.success) {
      showSuccess('Semua data lokal berhasil diunggah ke Supabase!');
    }
  };

  const handleFetchFromSupabase = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setSupabaseStatusMsg({ success: false, text: 'Mohon isi URL dan Anon Key terlebih dahulu.' });
      return;
    }
    saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
    setIsFetchingFromSupabase(true);
    const res = await fetchDatabaseFromSupabase();
    setIsFetchingFromSupabase(false);
    setSupabaseStatusMsg({ success: res.success, text: res.message });
    if (res.success && res.data) {
      onUpdateDb(res.data);
      showSuccess('Data terbaru berhasil ditarik dari Supabase!');
    }
  };

  const handleClearSupabase = () => {
    clearSupabaseConfig();
    setSupabaseUrl('');
    setSupabaseAnonKey('');
    setSupabaseStatusMsg({ success: true, text: 'Kredensial Supabase lokal telah dibersihkan.' });
    showSuccess('Konfigurasi Supabase telah dihapus dari perangkat ini.');
  };

  const handleCopySql = () => {
    const fullSql = `-- File: supabase-schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.school_settings (
    id INT PRIMARY KEY DEFAULT 1,
    school_name TEXT NOT NULL DEFAULT 'MTs Marf''uah Palembang',
    unit_name TEXT NOT NULL DEFAULT 'PMR Unit 012 - Pangkalan MTs Marf''uah Palembang',
    school_level TEXT NOT NULL DEFAULT 'madya',
    address TEXT DEFAULT 'Jl. Talang keramat, lrg.kerta, Kota Palembang',
    phone TEXT DEFAULT '08974453505',
    email TEXT DEFAULT 'pmr.mtsmarfuah@gmail.com',
    principal_name TEXT DEFAULT 'RIRIA RABENA, S.H',
    principal_nip TEXT DEFAULT '19740512 200501 1 004',
    coach_name TEXT DEFAULT 'Muhammad Ramadhani, S.Pd',
    coach_nip TEXT DEFAULT '19880921 201503 1 002',
    logo_url TEXT,
    pmr_logo_url TEXT,
    signature_stamp_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'coach', 'member')),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL DEFAULT 'pmr123',
    class_name TEXT DEFAULT '',
    gender TEXT CHECK (gender IN ('L', 'P')),
    birth_place TEXT DEFAULT '',
    birth_date TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    address TEXT DEFAULT '',
    photo_url TEXT DEFAULT '',
    position_or_level TEXT DEFAULT 'PMR Madya',
    nis TEXT DEFAULT '',
    emergency_contact TEXT DEFAULT '',
    joined_date TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Rutin',
    qr_secret TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.attendance_records (
    id TEXT PRIMARY KEY,
    session_id TEXT REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    role TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Hadir', 'Izin', 'Sakit', 'Alpa')),
    type TEXT NOT NULL CHECK (type IN ('Checklist', 'QR Code', 'Selfie Mandiri')),
    selfie_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.modules (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    file_url TEXT,
    file_name TEXT,
    author TEXT NOT NULL,
    upload_date TEXT NOT NULL,
    summary TEXT DEFAULT '',
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assignments (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('pilgan', 'praktik')),
    description TEXT NOT NULL,
    deadline TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_date TEXT NOT NULL,
    questions JSONB DEFAULT '[]'::jsonb,
    passing_score INT DEFAULT 70,
    practical_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.submissions (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES public.assignments(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    score NUMERIC(5,2),
    feedback TEXT DEFAULT '',
    submitted_date TEXT NOT NULL,
    file_url TEXT DEFAULT '',
    file_name TEXT,
    notes TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Dinilai', 'Revisi')),
    answers JSONB DEFAULT '{}'::jsonb,
    total_questions INT DEFAULT 0,
    correct_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.skill_requirements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    level TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    standards JSONB DEFAULT '[]'::jsonb,
    badge_icon TEXT NOT NULL,
    badge_color TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.skill_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    requirement_id TEXT REFERENCES public.skill_requirements(id) ON DELETE CASCADE,
    requirement_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    score NUMERIC(5,2),
    examiner_notes TEXT DEFAULT '',
    requested_date TEXT NOT NULL,
    validated_by TEXT,
    proof_file_url TEXT DEFAULT '',
    report_text TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access for school_settings" ON public.school_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for attendance_sessions" ON public.attendance_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for attendance_records" ON public.attendance_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for modules" ON public.modules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for assignments" ON public.assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for submissions" ON public.submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for skill_requirements" ON public.skill_requirements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for skill_requests" ON public.skill_requests FOR ALL USING (true) WITH CHECK (true);
`;
    navigator.clipboard.writeText(fullSql);
    setIsCopiedSql(true);
    setTimeout(() => setIsCopiedSql(false), 3000);
    showSuccess('Skrip SQL lengkap untuk Supabase berhasil disalin!');
  };

  const handleCopyVercelEnv = () => {
    const envText = `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl || 'https://your-project.supabase.co'}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey || 'your-anon-key'}`;
    navigator.clipboard.writeText(envText);
    setIsCopiedVercelEnv(true);
    setTimeout(() => setIsCopiedVercelEnv(false), 3000);
    showSuccess('Environment variables untuk Vercel berhasil disalin!');
  };

  const showSuccess = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => {
      setActionSuccessMsg(null);
    }, 4000);
  };

  // -------------------------------------------------------------
  // 1. BACKUP HANDLERS
  // -------------------------------------------------------------
  const handleDownloadZip = async () => {
    try {
      setIsExportingZip(true);
      const zipBlob = await exportDatabaseZip(db);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      const cleanSchool = db.settings.schoolName.replace(/[^a-zA-Z0-9]/g, '_');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `Backup_AyoPMRku_${cleanSchool}_${dateStr}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess('Paket arsip cadangan lengkap (.ZIP) berhasil diunduh!');
    } catch (err: any) {
      console.error('Failed to export ZIP:', err);
      alert('Gagal membuat file cadangan ZIP: ' + (err.message || err));
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleDownloadJson = () => {
    try {
      setIsExportingJson(true);
      const jsonStr = exportDatabaseJson(db);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const cleanSchool = db.settings.schoolName.replace(/[^a-zA-Z0-9]/g, '_');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `Database_AyoPMRku_${cleanSchool}_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess('Berkas JSON database berhasil diunduh!');
    } catch (err: any) {
      alert('Gagal mengunduh file JSON: ' + err.message);
    } finally {
      setIsExportingJson(false);
    }
  };

  const handleCopyJson = () => {
    const jsonStr = exportDatabaseJson(db);
    navigator.clipboard.writeText(jsonStr);
    setIsCopiedJson(true);
    setTimeout(() => setIsCopiedJson(false), 2500);
    showSuccess('Salinan teks JSON database berhasil disalin ke clipboard!');
  };

  const handleDownloadCsv = (type: 'members' | 'attendance' | 'submissions' | 'skills') => {
    let csvContent = '';
    let fileName = '';
    const cleanSchool = db.settings.schoolName.replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);

    if (type === 'members') {
      csvContent = generateCsvMembers(db.users);
      fileName = `Buku_Induk_Anggota_${cleanSchool}_${dateStr}.csv`;
    } else if (type === 'attendance') {
      csvContent = generateCsvAttendance(db.attendanceRecords, db.attendanceSessions);
      fileName = `Rekap_Presensi_${cleanSchool}_${dateStr}.csv`;
    } else if (type === 'submissions') {
      csvContent = generateCsvSubmissions(db.submissions, db.assignments);
      fileName = `Rekap_Tugas_Kuis_${cleanSchool}_${dateStr}.csv`;
    } else {
      csvContent = generateCsvSkills(db.skillRequests);
      fileName = `Rekap_Uji_SKK_${cleanSchool}_${dateStr}.csv`;
    }

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess(`Tabel ${fileName} berhasil diunduh!`);
  };

  // -------------------------------------------------------------
  // 2. RESTORE FILE PARSER & HANDLERS
  // -------------------------------------------------------------
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreFile(file);
    setRestoreError(null);
    setRestoreParsedDb(null);
    setIsAnalyzingFile(true);

    try {
      let parsed: DatabaseState;

      if (file.name.endsWith('.zip')) {
        parsed = await importDatabaseZip(file);
      } else if (file.name.endsWith('.json')) {
        const text = await file.text();
        const rawJson = JSON.parse(text);
        const val = validateDatabaseStructure(rawJson);
        if (!val.isValid) {
          throw new Error(val.error);
        }
        parsed = rawJson as DatabaseState;
      } else {
        throw new Error('Format file tidak didukung. Harap pilih berkas .ZIP atau .JSON.');
      }

      setRestoreParsedDb(parsed);
    } catch (err: any) {
      console.error('Error analyzing restore file:', err);
      setRestoreError(err.message || 'Gagal membaca isi berkas cadangan.');
    } finally {
      setIsAnalyzingFile(false);
    }
  };

  const handleExecuteRestore = () => {
    if (!restoreParsedDb) return;

    setIsRestoring(true);
    setTimeout(() => {
      try {
        let finalDb: DatabaseState;

        if (restoreMode === 'overwrite') {
          finalDb = restoreParsedDb;
        } else {
          finalDb = mergeDatabases(db, restoreParsedDb);
        }

        onUpdateDb(finalDb);
        setIsConfirmModalOpen(false);
        setRestoreFile(null);
        setRestoreParsedDb(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        showSuccess(
          restoreMode === 'overwrite'
            ? 'Database berhasil ditimpa dan dipulihkan sepenuhnya dari cadangan!'
            : 'Data berhasil digabungkan ke dalam database saat ini tanpa duplikasi!'
        );
      } catch (err: any) {
        alert('Gagal memproses pemulihan data: ' + err.message);
      } finally {
        setIsRestoring(false);
      }
    }, 400);
  };

  // -------------------------------------------------------------
  // 3. SNAPSHOT HANDLERS
  // -------------------------------------------------------------
  const handleCreateSnapshot = () => {
    setIsCreatingSnapshot(true);
    setTimeout(() => {
      const snap = createLocalSnapshot(newSnapshotName, db);
      setSnapshots(getLocalSnapshots());
      setNewSnapshotName('');
      setIsCreatingSnapshot(false);
      showSuccess(`Snapshot "${snap.name}" berhasil disimpan di memori browser!`);
    }, 200);
  };

  const handleDeleteSnapshot = (id: string) => {
    const updated = deleteLocalSnapshot(id);
    setSnapshots(updated);
    showSuccess('Snapshot berhasil dihapus.');
  };

  const handleRestoreSnapshot = (snap: LocalSnapshot) => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin memulihkan database ke snapshot "${snap.name}" (${snap.timestamp})? Data saat ini yang belum dicadangkan akan tertimpa.`
      )
    ) {
      onUpdateDb(snap.data);
      showSuccess(`Database berhasil dipulihkan ke snapshot "${snap.name}"!`);
    }
  };

  // -------------------------------------------------------------
  // 4. RESET / FACTORY HANDLERS
  // -------------------------------------------------------------
  const handleExecuteReset = async () => {
    if (resetConfirmInput.trim() !== 'RESET') {
      alert('Ketik "RESET" dengan huruf besar untuk mengonfirmasi.');
      return;
    }

    if (autoBackupBeforeReset) {
      try {
        const zipBlob = await exportDatabaseZip(db);
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AutoBackup_Sebelum_Reset_${new Date().toISOString().slice(0, 10)}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (e) {
        console.warn('Auto backup before reset failed', e);
      }
    }

    const freshDb = resetDatabase();
    onUpdateDb(freshDb);
    setIsResetModalOpen(false);
    setResetConfirmInput('');
    showSuccess('Database berhasil direset kembali ke pengaturan awal pabrik.');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-700 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/50 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span className="text-xs font-bold">{actionSuccessMsg}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-md shadow-rose-600/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Backup & Restore Data PMR
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider border border-rose-200">
                  Lengkap & Terintegrasi
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Pencadangan arsip lengkap ZIP/JSON, pemulihan database, ekspor tabel excel/csv, dan snapshot lokal.
              </p>
            </div>
          </div>

          {/* Quick Snapshot Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveSubTab('snapshots');
              }}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{snapshots.length} Snapshot Tersimpan</span>
            </button>
            <button
              onClick={handleDownloadZip}
              disabled={isExportingZip}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingZip ? 'Mengompres ZIP...' : 'Cadangkan Cepat (.ZIP)'}</span>
            </button>
          </div>
        </div>

        {/* Database Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-black uppercase">Total Pengguna</span>
              <Users className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-lg font-black text-slate-900">
              {db.users.length}{' '}
              <span className="text-xs font-normal text-slate-500">Akun</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {db.users.filter((u) => u.role === 'member').length} Siswa •{' '}
              {db.users.filter((u) => u.role === 'coach').length} Pembina
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-black uppercase">Presensi & Modul</span>
              <CalendarCheck className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-lg font-black text-slate-900">
              {db.attendanceSessions.length}{' '}
              <span className="text-xs font-normal text-slate-500">Sesi</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {db.attendanceRecords.length} Log Presensi • {db.modules.length} Modul
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-black uppercase">Tugas & SKK</span>
              <Award className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-lg font-black text-slate-900">
              {db.assignments.length}{' '}
              <span className="text-xs font-normal text-slate-500">Tugas</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {db.submissions.length} Pengumpulan • {db.skillRequests.length} Uji SKK
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-black uppercase">Ukuran Database</span>
              <HardDrive className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-lg font-black text-slate-900">
              {metrics.totalKb}{' '}
              <span className="text-xs font-normal text-slate-500">KB</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {metrics.base64PhotosCount} Foto Profil Tersimpan
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('backup')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeSubTab === 'backup'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Cadangkan Data (Backup)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('restore')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeSubTab === 'restore'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Pulihkan Data (Restore)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('snapshots')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeSubTab === 'snapshots'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Snapshot Lokal ({snapshots.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('supabase')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeSubTab === 'supabase'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-500" />
          <span>Supabase & Deploy Vercel</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
            Online
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('danger')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ml-auto ${
            activeSubTab === 'danger'
              ? 'bg-red-700 text-white shadow-md'
              : 'bg-white text-red-600 hover:bg-red-50 border border-red-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Reset & Pemeliharaan</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. CADANGKAN DATA (BACKUP) TAB                                             */}
      {/* ========================================================================= */}
      {activeSubTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Full System Backup ZIP */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-bl-full pointer-events-none" />
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <FolderArchive className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-black uppercase">
                  Pilihan Utama (Disarankan)
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Paket Cadangan Lengkap (.ZIP)
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Menyimpan seluruh database JSON, folder arsip foto anggota, tabel rekapitulasi CSV, serta catatan panduan pemulihan dalam 1 berkas ZIP terkompresi.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-[11px] text-slate-600 space-y-1.5">
                <div className="font-bold text-slate-900 text-xs">Isi Berkas ZIP:</div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>database.json (Seluruh Struktur Data)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Folder Foto_Anggota/ (Foto Profil Anggota)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Folder Tabel_Excel_CSV/ (4 Rekap Data)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>README_BACKUP.txt (Petunjuk Restore)</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadZip}
              disabled={isExportingZip}
              className="mt-6 w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-xs rounded-2xl shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isExportingZip ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mengompresi Arsip...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Unduh Arsip Lengkap (.ZIP)</span>
                </>
              )}
            </button>
          </div>

          {/* Card 2: JSON Backup */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <FileCode className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-black uppercase">
                  Format Standar
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Berkas Database (.JSON)
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Format teks JSON terstruktur yang memuat seluruh data buku induk, presensi, modul, tugas, dan sertifikat SKK untuk migrasi cepat antar browser atau server.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Estimasi Ukuran:</span>
                  <span className="font-mono text-slate-900 font-bold">{metrics.totalKb} KB</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Jumlah Koleksi:</span>
                  <span className="text-slate-600 font-bold">9 Koleksi Data</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadJson}
                disabled={isExportingJson}
                className="py-3 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh .JSON</span>
              </button>
              <button
                onClick={handleCopyJson}
                className="py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isCopiedJson ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Teks</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 3: Spreadsheet / CSV Exports */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase">
                  Kompatibel Excel / Sheets
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Ekspor Tabel Excel / CSV
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Unduh data tabular dalam format CSV yang dapat langsung dibuka dan diolah menggunakan Microsoft Excel, Google Sheets, atau aplikasi spreadsheet lainnya.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => handleDownloadCsv('members')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-emerald-50 text-left rounded-xl border border-slate-200 hover:border-emerald-300 text-xs font-bold text-slate-800 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <span className="truncate">1. Buku Induk Anggota ({db.users.length})</span>
                  <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                </button>

                <button
                  onClick={() => handleDownloadCsv('attendance')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-emerald-50 text-left rounded-xl border border-slate-200 hover:border-emerald-300 text-xs font-bold text-slate-800 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <span className="truncate">2. Rekap Presensi Latihan ({db.attendanceRecords.length})</span>
                  <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                </button>

                <button
                  onClick={() => handleDownloadCsv('submissions')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-emerald-50 text-left rounded-xl border border-slate-200 hover:border-emerald-300 text-xs font-bold text-slate-800 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <span className="truncate">3. Rekap Tugas & Kuis ({db.submissions.length})</span>
                  <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                </button>

                <button
                  onClick={() => handleDownloadCsv('skills')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-emerald-50 text-left rounded-xl border border-slate-200 hover:border-emerald-300 text-xs font-bold text-slate-800 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <span className="truncate">4. Rekap Piagam SKK ({db.skillRequests.length})</span>
                  <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
              Format UTF-8 BOM kompatibel dengan Microsoft Excel
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PULIHKAN DATA (RESTORE) TAB                                             */}
      {/* ========================================================================= */}
      {activeSubTab === 'restore' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Pulihkan Database dari File Cadangan
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Pilih atau unggah berkas cadangan berupa <strong>.ZIP</strong> (paket lengkap) atau <strong>.JSON</strong> (database murni) yang sebelumnya telah Anda cadangkan.
              </p>
            </div>

            {/* Dropzone Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-rose-500 bg-slate-50/80 hover:bg-rose-50/30 rounded-3xl p-8 text-center transition-all cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip,.json"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-3xl bg-white shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-500 group-hover:text-rose-600 group-hover:scale-110 transition-all">
                <Upload className="w-8 h-8" />
              </div>
              <div className="text-sm font-black text-slate-900">
                {restoreFile ? restoreFile.name : 'Klik atau Tarik File Cadangan ke Sini'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Mendukung berkas <strong>.ZIP</strong> (dengan foto) dan <strong>.JSON</strong> (maks 50MB)
              </p>
              {restoreFile && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                  <span>Ukuran: {(restoreFile.size / 1024).toFixed(1)} KB</span>
                </div>
              )}
            </div>

            {/* Loading Analysis */}
            {isAnalyzingFile && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-blue-800 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin shrink-0 text-blue-600" />
                <span>Sedang memverifikasi integritas dan struktur data cadangan...</span>
              </div>
            )}

            {/* Error Message */}
            {restoreError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Gagal Memvalidasi Berkas Cadangan</div>
                  <div className="mt-0.5 text-rose-700">{restoreError}</div>
                </div>
              </div>
            )}

            {/* Parsed Inspection & Options */}
            {restoreParsedDb && (
              <div className="space-y-6 pt-4 border-t border-slate-200 animate-fade-in">
                {/* Inspection Summary */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900">
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Berkas Cadangan Valid & Siap Dipulihkan:</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-emerald-700 text-[11px] block">Sekolah:</span>
                      <strong className="text-slate-900 truncate block">
                        {restoreParsedDb.settings?.schoolName || 'Tidak Diketahui'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-emerald-700 text-[11px] block">Total Anggota:</span>
                      <strong className="text-slate-900">
                        {restoreParsedDb.users?.length || 0} Akun Pengguna
                      </strong>
                    </div>
                    <div>
                      <span className="text-emerald-700 text-[11px] block">Presensi & Modul:</span>
                      <strong className="text-slate-900">
                        {restoreParsedDb.attendanceSessions?.length || 0} Sesi •{' '}
                        {restoreParsedDb.modules?.length || 0} Modul
                      </strong>
                    </div>
                    <div>
                      <span className="text-emerald-700 text-[11px] block">Tugas & SKK:</span>
                      <strong className="text-slate-900">
                        {restoreParsedDb.assignments?.length || 0} Tugas •{' '}
                        {restoreParsedDb.skillRequests?.length || 0} SKK
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Restore Method Selection */}
                <div className="space-y-3">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                    Pilih Metode Pemulihan:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Method 1: Overwrite */}
                    <div
                      onClick={() => setRestoreMode('overwrite')}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        restoreMode === 'overwrite'
                          ? 'border-rose-600 bg-rose-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                          <Layers className="w-4 h-4 text-rose-600" />
                          <span>Timpa Total (Full Overwrite)</span>
                        </div>
                        <input
                          type="radio"
                          name="restore_mode"
                          checked={restoreMode === 'overwrite'}
                          onChange={() => setRestoreMode('overwrite')}
                          className="w-4 h-4 accent-rose-600 cursor-pointer"
                        />
                      </div>
                      <p className="text-[11.5px] text-slate-500 leading-relaxed">
                        Mengganti seluruh database saat ini dengan isi file cadangan. Sangat cocok saat berpindah perangkat atau memulihkan titik waktu sebelumnya.
                      </p>
                    </div>

                    {/* Method 2: Smart Merge */}
                    <div
                      onClick={() => setRestoreMode('merge')}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        restoreMode === 'merge'
                          ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                          <Plus className="w-4 h-4 text-blue-600" />
                          <span>Penggabungan Pintar (Smart Merge)</span>
                        </div>
                        <input
                          type="radio"
                          name="restore_mode"
                          checked={restoreMode === 'merge'}
                          onChange={() => setRestoreMode('merge')}
                          className="w-4 h-4 accent-blue-600 cursor-pointer"
                        />
                      </div>
                      <p className="text-[11.5px] text-slate-500 leading-relaxed">
                        Menyatukan data baru tanpa menghapus data yang sudah ada. Anggota dengan NIS yang sama akan diperbarui dan anggota baru akan ditambahkan.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Execute Button */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRestoreFile(null);
                      setRestoreParsedDb(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmModalOpen(true)}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-600/25 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Lanjutkan Pemulihan Data...</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SNAPSHOT LOKAL (BROWSER) TAB                                            */}
      {/* ========================================================================= */}
      {activeSubTab === 'snapshots' && (
        <div className="space-y-6">
          {/* Create Snapshot Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Buat Snapshot Cepat Database
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Simpan titik pemulihan instan ke dalam memori browser lokal sebelum melakukan perubahan massal data anggota atau presensi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={newSnapshotName}
                onChange={(e) => setNewSnapshotName(e.target.value)}
                placeholder="Nama Catatan Snapshot (Contoh: Sebelum Ujian SKK Semester 1)..."
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              <button
                onClick={handleCreateSnapshot}
                disabled={isCreatingSnapshot}
                className="px-5 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{isCreatingSnapshot ? 'Menyimpan...' : 'Simpan Snapshot'}</span>
              </button>
            </div>
          </div>

          {/* Snapshot Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">
                Daftar Titik Pemulihan Tersimpan ({snapshots.length})
              </h3>
              <span className="text-[11px] text-slate-400">Maksimum 10 riwayat snapshot</span>
            </div>

            {snapshots.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs">
                <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                Belum ada snapshot lokal yang dibuat. Gunakan form di atas untuk membuat snapshot pertama Anda.
              </div>
            ) : (
              <div className="space-y-2.5">
                {snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="p-4 bg-slate-50/80 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{snap.name}</span>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-600">
                          {snap.sizeKb} KB
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-3">
                        <span>Waktu: {snap.timestamp}</span>
                        <span>•</span>
                        <span>{snap.userCount} Pengguna</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRestoreSnapshot(snap)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Pulihkan</span>
                      </button>

                      <button
                        onClick={() => {
                          const jsonStr = JSON.stringify(snap.data, null, 2);
                          const blob = new Blob([jsonStr], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `Snapshot_${snap.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="p-2 bg-white hover:bg-slate-200 text-slate-600 rounded-xl border border-slate-200 text-xs transition-all cursor-pointer"
                        title="Unduh Snapshot sebagai JSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteSnapshot(snap.id)}
                        className="p-2 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl border border-slate-200 text-xs transition-all cursor-pointer"
                        title="Hapus Snapshot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. RESET & PEMELIHARAAN (DANGER ZONE) TAB                                  */}
      {/* ========================================================================= */}
      {activeSubTab === 'danger' && (
        <div className="space-y-6">
          {/* Storage Diagnostics */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-slate-700" />
              <span>Diagnostik & Alokasi Memori Database</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-slate-500 mb-1">Penggunaan Pengguna & Foto:</div>
                <div className="text-base font-black text-slate-900">
                  {metrics.breakdown.usersKb} KB
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Termasuk {metrics.base64PhotosCount} foto profil ter-encode
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-slate-500 mb-1">Penggunaan Presensi & Log:</div>
                <div className="text-base font-black text-slate-900">
                  {metrics.breakdown.attendanceKb} KB
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {db.attendanceRecords.length} baris riwayat kehadiran
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-slate-500 mb-1">Penggunaan Modul & Tugas:</div>
                <div className="text-base font-black text-slate-900">
                  {(metrics.breakdown.modulesKb + metrics.breakdown.assignmentsKb).toFixed(1)} KB
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Materi pembelajaran dan hasil penugasan
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone: Factory Reset */}
          <div className="bg-red-50/50 rounded-3xl p-6 border border-red-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-red-900">
              <div className="p-2.5 bg-red-100 rounded-2xl text-red-700">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black">Zona Tindakan Kritis (Danger Zone)</h3>
                <p className="text-xs text-red-700 mt-0.5">
                  Tindakan berikut akan mengatur ulang seluruh database ke setelan data bawaan.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-red-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Reset Database ke Data Awal Pabrik (Factory Reset)
                  </h4>
                  <p className="text-[11.5px] text-slate-500 mt-0.5">
                    Menghapus seluruh modifikasi data dan mengembalikan sistem ke data awal standar MTs Marfu&apos;ah.
                  </p>
                </div>
                <button
                  onClick={() => setIsResetModalOpen(true)}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
                >
                  Reset Database...
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUPABASE & DEPLOY VERCEL TAB                                           */}
      {/* ========================================================================= */}
      {activeSubTab === 'supabase' && (
        <div className="space-y-6 animate-fade-in">
          {/* Banner Pengantar Supabase & Vercel */}
          <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    100% Bebas Tagihan (Free Tier)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-[10px] font-bold">
                    PostgreSQL Cloud + Edge CDN
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Database Online Supabase & Deploy Vercel
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                  Solusi ideal tanpa kendala billing Google Cloud. Database PostgreSQL Supabase menyimpan seluruh data anggota, presensi selfie, modul, dan kuis secara online, lalu web dideploy instan ke Vercel dengan domain gratis dan aman (SSL).
                </p>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                <button
                  onClick={handleCopySql}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>{isCopiedSql ? 'Tersalin!' : 'Salin Skrip SQL Schema'}</span>
                </button>
                <button
                  onClick={handleCopyVercelEnv}
                  className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Key className="w-4 h-4 text-emerald-300" />
                  <span>{isCopiedVercelEnv ? 'Env Tersalin!' : 'Salin Kunci Env Vercel'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grid: Form Koneksi & Status */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Konfigurasi Kredensial */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Konfigurasi Kunci API Supabase
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Dapatkan dari Dashboard Supabase &gt; Project Settings &gt; Data API
                    </p>
                  </div>
                </div>

                {supabaseUrl && supabaseAnonKey ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Kunci Terpasang
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                    Belum Dikonfigurasi
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Supabase Project URL (NEXT_PUBLIC_SUPABASE_URL)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Supabase Anon / Public Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={supabaseAnonKey}
                      onChange={(e) => setSupabaseAnonKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Feedback Message */}
                {supabaseStatusMsg && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs font-medium flex items-start gap-2.5 ${
                      supabaseStatusMsg.success
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'bg-red-50 text-red-900 border border-red-200'
                    }`}
                  >
                    {supabaseStatusMsg.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{supabaseStatusMsg.text}</span>
                  </div>
                )}

                {/* Tombol Aksi */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <button
                    onClick={handleTestSupabase}
                    disabled={isTestingSupabase || !supabaseUrl || !supabaseAnonKey}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isTestingSupabase ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        <span>Menguji...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Simpan &amp; Uji Koneksi</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSyncToSupabase}
                    disabled={isSyncingToSupabase || !supabaseUrl || !supabaseAnonKey}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isSyncingToSupabase ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengunggah...</span>
                      </>
                    ) : (
                      <>
                        <CloudUpload className="w-3.5 h-3.5" />
                        <span>Kirim Data Lokal ke Supabase</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleFetchFromSupabase}
                    disabled={isFetchingFromSupabase || !supabaseUrl || !supabaseAnonKey}
                    className="px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 disabled:opacity-50 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isFetchingFromSupabase ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-700" />
                        <span>Mengunduh...</span>
                      </>
                    ) : (
                      <>
                        <CloudDownload className="w-3.5 h-3.5 text-teal-700" />
                        <span>Tarik Data Supabase</span>
                      </>
                    )}
                  </button>

                  {supabaseUrl && (
                    <button
                      onClick={handleClearSupabase}
                      className="px-3 py-2.5 text-slate-500 hover:text-red-600 text-xs font-bold transition-all ml-auto cursor-pointer"
                    >
                      Putuskan
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Guide Card */}
            <div className="lg:col-span-5 bg-linear-to-b from-slate-50 to-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-slate-900 font-black text-sm">
                  <Terminal className="w-4 h-4 text-emerald-600" />
                  <span>Cara Cepat Inisialisasi Supabase</span>
                </div>
                <ol className="space-y-2.5 text-xs text-slate-600 list-decimal list-inside leading-relaxed">
                  <li>
                    Buka <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a> dan buat project baru (Region Singapore, Free Plan).
                  </li>
                  <li>
                    Klik menu <strong>SQL Editor</strong> di bilah kiri Supabase, buat <em>New Query</em>.
                  </li>
                  <li>
                    Klik tombol <strong>Salin Skrip SQL Schema</strong> di bawah ini, lalu tempel di SQL Editor dan tekan <strong>Run</strong>.
                  </li>
                  <li>
                    Buka menu <strong>Project Settings &gt; Data API</strong>, salin URL dan Anon Key ke kolom di samping.
                  </li>
                </ol>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 text-xs space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Berkas sql telah disediakan di root:</span>
                </div>
                <p className="text-[11px] font-mono bg-white px-2.5 py-1.5 rounded-lg border border-emerald-200 text-slate-800">
                  supabase-schema.sql
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleCopySql}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{isCopiedSql ? 'Tersalin!' : 'Salin SQL Lengkap'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Panduan 4 Langkah Deploy ke Vercel */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Langkah-Langkah Deploy Web ke Vercel (100% Gratis)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menjadikan aplikasi PMR Anda dapat diakses oleh seluruh anggota dan pembina di internet
                </p>
              </div>
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Buka Vercel</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="w-7 h-7 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xs font-black">
                  1
                </div>
                <h4 className="font-black text-xs text-slate-900">Push ke GitHub</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Unggah folder proyek ini ke repositori akun GitHub pribadi Anda menggunakan Git.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="w-7 h-7 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xs font-black">
                  2
                </div>
                <h4 className="font-black text-xs text-slate-900">Import di Vercel</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Login ke vercel.com dengan akun GitHub, klik <em>Add New &gt; Project</em>, lalu pilih repo tadi.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <div className="w-7 h-7 bg-emerald-600 text-white rounded-xl flex items-center justify-center text-xs font-black">
                  3
                </div>
                <h4 className="font-black text-xs text-emerald-950">Set Environment Variables</h4>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Tambahkan <code className="font-mono bg-white px-1 py-0.5 rounded text-[10px]">NEXT_PUBLIC_SUPABASE_URL</code> dan <code className="font-mono bg-white px-1 py-0.5 rounded text-[10px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="w-7 h-7 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xs font-black">
                  4
                </div>
                <h4 className="font-black text-xs text-slate-900">Deploy &amp; Selesai</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Klik <em>Deploy</em>. Dalam 1-2 menit, web Anda online di domain <code className="font-mono text-[10px]">.vercel.app</code> dengan sertifikat SSL otomatis!
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h5 className="font-bold text-xs text-white">Panduan Tertulis Lengkap: DEPLOY_SUPABASE_VERCEL.md</h5>
                  <p className="text-[11px] text-slate-400">Tersedia di folder proyek dengan instruksi baris perintah lengkap.</p>
                </div>
              </div>
              <button
                onClick={handleCopyVercelEnv}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Pasangan Variabel Vercel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION RESTORE MODAL                                                */}
      {/* ========================================================================= */}
      {isConfirmModalOpen && restoreParsedDb && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Konfirmasi Pemulihan Data</h3>
                <p className="text-xs text-slate-500">Ayo PMRku - Sistem Database</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <div>
                <strong>Metode:</strong>{' '}
                <span className="text-rose-700 font-bold">
                  {restoreMode === 'overwrite'
                    ? 'Timpa Total (Full Overwrite)'
                    : 'Penggabungan Pintar (Smart Merge)'}
                </span>
              </div>
              <p className="text-[11.5px] text-slate-500 leading-relaxed">
                {restoreMode === 'overwrite'
                  ? 'Perhatian: Seluruh data saat ini akan digantikan secara penuh oleh data dari berkas cadangan.'
                  : 'Data cadangan akan disatukan dengan data yang ada sekarang tanpa menghilangkan rekaman sebelumnya.'}
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Batalkan
              </button>
              <button
                type="button"
                disabled={isRestoring}
                onClick={handleExecuteRestore}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isRestoring ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Ya, Jalankan Pemulihan</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FACTORY RESET CONFIRMATION MODAL                                          */}
      {/* ========================================================================= */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 text-red-800 rounded-2xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Konfirmasi Reset Pabrik</h3>
                <p className="text-xs text-red-600">Tindakan ini tidak dapat dibatalkan!</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Seluruh rekaman presensi latihan, input anggota baru, tugas, materi, dan foto akan dihapus dan dikembalikan ke kondisi awal bawaan.
            </p>

            <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={autoBackupBeforeReset}
                onChange={(e) => setAutoBackupBeforeReset(e.target.checked)}
                className="w-4 h-4 accent-rose-600 rounded"
              />
              <span>Unduh cadangan otomatis (.ZIP) sebelum mereset</span>
            </label>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Ketik <strong className="text-red-600">RESET</strong> untuk melanjutkan:
              </label>
              <input
                type="text"
                value={resetConfirmInput}
                onChange={(e) => setResetConfirmInput(e.target.value)}
                placeholder="RESET"
                className="w-full p-2.5 border border-red-300 rounded-xl text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsResetModalOpen(false);
                  setResetConfirmInput('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={resetConfirmInput.trim() !== 'RESET'}
                onClick={handleExecuteReset}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
              >
                Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
