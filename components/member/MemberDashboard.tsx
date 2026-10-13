'use client';

import React from 'react';
import { DatabaseState, User } from '@/types/pmr';
import {
  Sparkles,
  Camera,
  BookOpen,
  Award,
  CheckCircle2,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  FileText,
  Heart,
  ShieldCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface MemberDashboardProps {
  db: DatabaseState;
  currentUser: User;
  onNavigate: (tabId: string) => void;
  onOpenSelfieModal: () => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  db,
  currentUser,
  onNavigate,
  onOpenSelfieModal,
}) => {
  const activeSession = db.attendanceSessions.find((s) => s.isActive);
  const myTodayAttendance = db.attendanceRecords.find(
    (r) => r.sessionId === activeSession?.id && r.userId === currentUser.id
  );

  const myApprovedSkills = db.skillRequests.filter(
    (r) => r.userId === currentUser.id && r.status === 'Approved'
  );

  const myPendingSkills = db.skillRequests.filter(
    (r) => r.userId === currentUser.id && r.status === 'Pending'
  );

  const mySubmissions = db.submissions.filter((s) => s.userId === currentUser.id);

  const pendingAssignments = db.assignments.filter((t) => {
    const hasSubmitted = db.submissions.some(
      (s) => s.taskId === t.id && s.userId === currentUser.id
    );
    return !hasSubmitted;
  });

  const myAttendanceRecords = db.attendanceRecords.filter(
    (r) => r.userId === currentUser.id
  );
  const totalHadir = myAttendanceRecords.filter((r) => r.status === 'Hadir').length;
  const attendanceRate =
    db.attendanceSessions.length > 0
      ? Math.round((totalHadir / db.attendanceSessions.length) * 100)
      : 100;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-rose-900/10 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider mb-3">
            <span>Anggota PMR Aktif</span> • <span>Kelas {currentUser.className}</span> •{' '}
            <span>{currentUser.positionOrLevel || 'PMR Madya'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Halo, {currentUser.fullName}!
          </h1>
          <p className="text-rose-100 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Selamat datang di portal belajar dan aktivitas Ayo PMRku. Ikuti presensi latihan, pelajari 7 materi pokok PMI, kerjakan tugas praktik dan kuis, serta raih lencana kecakapan khusus (SKK)!
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            {activeSession && !myTodayAttendance ? (
              <button
                onClick={onOpenSelfieModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer animate-pulse"
              >
                <Camera className="w-4 h-4 text-rose-600" />
                <span>Isi Presensi Selfie Sekarang</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('my_skills')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Ajukan Lencana SKK</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('learning_modules')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xl backdrop-blur-md transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Baca Modul PMR</span>
            </button>

            <button
              onClick={() => onNavigate('my_assignments')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xl backdrop-blur-md transition-all cursor-pointer"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Lihat Tugas ({pendingAssignments.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stat Metric Cards (4 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Card 1: Presensi */}
        <div
          onClick={() => {
            if (activeSession && !myTodayAttendance) onOpenSelfieModal();
          }}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Kehadiran Latihan
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {attendanceRate}%
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
              {totalHadir} dari {db.attendanceSessions.length} sesi pertemuan
            </p>
          </div>
        </div>

        {/* Card 2: SKK Badges */}
        <div
          onClick={() => onNavigate('my_skills')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Lencana SKK
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {myApprovedSkills.length}{' '}
              <span className="text-xs text-slate-400 font-semibold">/ 7</span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
              {myPendingSkills.length > 0
                ? `${myPendingSkills.length} menunggu penilaian`
                : 'Syarat Kecakapan Khusus'}
            </p>
          </div>
        </div>

        {/* Card 3: Assignments */}
        <div
          onClick={() => onNavigate('my_assignments')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tugas & Kuis
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {pendingAssignments.length}{' '}
              <span className="text-xs text-slate-400 font-semibold">Aktif</span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
              {mySubmissions.length} tugas telah dikerjakan
            </p>
          </div>
        </div>

        {/* Card 4: Learning Modules */}
        <div
          onClick={() => onNavigate('learning_modules')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Materi PMI
            </span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {db.modules.length}{' '}
              <span className="text-xs text-slate-400 font-semibold">Modul</span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
              7 Bidang Materi Dasar PMR
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sesi Latihan, Tugas, & Modul (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Session Status Widget */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Presensi Pertemuan Latihan
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Status sesi latihan rutin ekstrakurikuler PMR
                  </p>
                </div>
              </div>

              {activeSession && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>Sesi Latihan Aktif</span>
                </span>
              )}
            </div>

            {activeSession ? (
              <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-rose-700">
                      {activeSession.type} • {activeSession.date}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                      {activeSession.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Waktu: {activeSession.startTime} - {activeSession.endTime} WIB
                    </p>
                  </div>

                  {myTodayAttendance ? (
                    <div className="px-3.5 py-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-2 shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Hadir ({myTodayAttendance.time} WIB)</span>
                    </div>
                  ) : (
                    <button
                      onClick={onOpenSelfieModal}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Ambil Selfie Presensi</span>
                    </button>
                  )}
                </div>

                {activeSession.notes && (
                  <p className="text-[11px] text-slate-500 pt-2 border-t border-rose-200/60 leading-relaxed">
                    <strong>Catatan Pembina:</strong> {activeSession.notes}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500 border border-slate-100">
                <Clock className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                Belum ada sesi latihan yang dibuka hari ini. Presensi selfie akan aktif saat pembina memulai pertemuan.
              </div>
            )}
          </div>

          {/* Pending Assignments Widget */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Tugas & Kuis Pembelajaran PMR
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Evaluasi materi dan dokumentasi praktik lapangan
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('my_assignments')}
                className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingAssignments.length === 0 ? (
              <div className="p-6 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-center text-xs text-emerald-800 font-semibold flex flex-col items-center gap-2">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                <span>Hebat! Semua tugas & kuis telah kamu selesaikan.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingAssignments.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onNavigate('my_assignments')}
                    className="p-4 bg-slate-50 hover:bg-rose-50/40 rounded-2xl border border-slate-200 hover:border-rose-300 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            task.type === 'pilgan'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {task.type === 'pilgan' ? 'Kuis Pilihan Ganda' : 'Praktik Lapangan'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Kategori: {task.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-rose-700">
                        {task.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Batas Pengumpulan: {task.deadline}
                      </p>
                    </div>

                    <div className="px-3.5 py-1.5 bg-white border border-slate-200 group-hover:border-rose-300 rounded-xl text-xs font-bold text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all shrink-0">
                      Kerjakan
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Learning Modules Strip */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Modul Materi Pokok Palang Merah
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Kurikulum standar pembinaan PMR Indonesia
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('learning_modules')}
                className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Modul</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {db.modules.slice(0, 4).map((mod) => (
                <div
                  key={mod.id}
                  onClick={() => onNavigate('learning_modules')}
                  className="p-3.5 bg-slate-50 hover:bg-sky-50/50 rounded-2xl border border-slate-200 hover:border-sky-300 transition-all cursor-pointer group"
                >
                  <span className="text-[10px] font-bold text-sky-700 uppercase block">
                    {mod.category}
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 group-hover:text-sky-800 mt-0.5 line-clamp-1">
                    {mod.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {mod.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Lencana SKK & Prinsip PMR (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* 7 SKK Badges Collection Widget */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">
                    Lencana SKK Saya
                  </h3>
                  <p className="text-xs font-black text-purple-700 mt-0.5">
                    {myApprovedSkills.length} dari 7 Terbuka
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('my_skills')}
                className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Semua</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Badges Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(myApprovedSkills.length / 7) * 100}%`,
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {db.skillRequirements.slice(0, 6).map((req) => {
                const isPassed = myApprovedSkills.some(
                  (s) => s.requirementId === req.id
                );

                return (
                  <div
                    key={req.id}
                    onClick={() => onNavigate('my_skills')}
                    className={`p-3 rounded-2xl text-center border transition-all cursor-pointer ${
                      isPassed
                        ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <Award
                      className={`w-6 h-6 mx-auto mb-1 ${
                        isPassed ? 'text-purple-600' : 'text-slate-300'
                      }`}
                    />
                    <div className="text-[10.5px] font-bold truncate leading-tight">
                      {req.name.replace('SKK ', '')}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">
                      {isPassed ? '✓ Terverifikasi' : 'Belum Uji'}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => onNavigate('my_skills')}
              className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Ajukan Pengujian SKK Baru</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 7 Prinsip Dasar PMI Card */}
          <div className="p-5 bg-gradient-to-br from-rose-50 to-amber-50 rounded-3xl border border-rose-100 space-y-2.5">
            <div className="flex items-center gap-2 text-rose-800 font-black text-xs uppercase tracking-wider">
              <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
              <span>7 Prinsip Dasar Kepalangmerahan</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              1. Kemanusiaan • 2. Kesamaan • 3. Kenetralan • 4. Kemandirian • 5. Kesukarelaan • 6. Kesatuan • 7. Kesemestaan
            </p>
          </div>

          {/* Tribakti PMR Card */}
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Tri Bakti PMR</span>
            </div>
            <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
              <li>Meningkatkan keterampilan hidup sehat</li>
              <li>Berkarya dan berbakti di masyarakat</li>
              <li>Mempererat persahabatan nasional & internasional</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
