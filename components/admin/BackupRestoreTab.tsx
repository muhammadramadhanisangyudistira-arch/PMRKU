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
    'backup' | 'restore' | 'snapshots' | 'danger'
  >('backup');

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
