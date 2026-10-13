'use client';

import React from 'react';
import { DatabaseState, User } from '@/types/pmr';
import {
  CalendarCheck,
  ClipboardList,
  Award,
  BookOpen,
  MessageSquare,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface CoachDashboardProps {
  db: DatabaseState;
  currentUser: User;
  onNavigate: (tabId: string) => void;
}

export const CoachDashboard: React.FC<CoachDashboardProps> = ({
  db,
  currentUser,
  onNavigate,
}) => {
  const members = db.users.filter((u) => u.role === 'member');
  const pendingTasks = db.submissions.filter((s) => s.status === 'Pending');
  const pendingSkk = db.skillRequests.filter((r) => r.status === 'Pending');
  const activeSession = db.attendanceSessions.find((s) => s.isActive);

  return (
    <div className="space-y-6">
      {/* Welcome Coach Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-[11px] font-bold uppercase tracking-wider mb-3">
            <span>Ruang Kerja Pembina PMR</span> • <span>{currentUser.positionOrLevel || 'Pelatih Teknis'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Assalamu&apos;alaikum, {currentUser.fullName}!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Pantau kehadiran latihan rutin siswa, evaluasi pengumpulan tugas praktik lapangan, dan lakukan pengujian Syarat Kecakapan Khusus (SKK).
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={() => onNavigate('attendance')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Buka Presensi Latihan</span>
            </button>
            <button
              onClick={() => onNavigate('whatsapp')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Broadcast WhatsApp Siswa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Sesi Latihan</span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {db.attendanceSessions.length} Sesi
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {activeSession ? '1 Sesi sedang aktif berlangsung' : 'Semua sesi selesai'}
          </p>
        </div>

        <div
          onClick={() => onNavigate('assignments')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Tugas Masuk</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {pendingTasks.length} Menunggu
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Dari total {db.submissions.length} tugas terkumpul
          </p>
        </div>

        <div
          onClick={() => onNavigate('skill_verification')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Uji SKK / TKK</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {pendingSkk.length} Pengajuan
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Memerlukan evaluasi & pemberian nilai
          </p>
        </div>

        <div
          onClick={() => onNavigate('modules')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Materi PMR</span>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {db.modules.length} Modul
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Kurikulum 7 bidang utama PMR
          </p>
        </div>
      </div>

      {/* Action Shortcut Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Antrean Penilaian Tugas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-amber-500" />
              <span>Tugas Masuk Perlu Dinilai ({pendingTasks.length})</span>
            </h3>
            <button
              onClick={() => onNavigate('assignments')}
              className="text-xs font-semibold text-amber-600 hover:underline flex items-center gap-1"
            >
              <span>Periksa</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 mt-4">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Semua tugas siswa telah dinilai!
              </div>
            ) : (
              pendingTasks.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{sub.studentName}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {sub.fileName || (sub.totalQuestions ? 'Kuis Pilihan Ganda' : 'Lampiran Tugas Praktik')} • Dikirim {sub.submittedDate}
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('assignments')}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs"
                  >
                    Beri Nilai
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Antrean Uji SKK */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              <span>Uji SKK Menunggu Pengesahan ({pendingSkk.length})</span>
            </h3>
            <button
              onClick={() => onNavigate('skill_verification')}
              className="text-xs font-semibold text-purple-600 hover:underline flex items-center gap-1"
            >
              <span>Verifikasi</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 mt-4">
            {pendingSkk.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Tidak ada pengajuan uji kecakapan yang pending.
              </div>
            ) : (
              pendingSkk.map((req) => (
                <div
                  key={req.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{req.studentName}</div>
                    <div className="text-[11px] text-purple-700 font-semibold mt-0.5">
                      {req.requirementName}
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('skill_verification')}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs"
                  >
                    Uji & Nilai
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
