'use client';

import React from 'react';
import { DatabaseState, User } from '@/types/pmr';
import {
  Users,
  UserCheck,
  CalendarCheck,
  BookOpen,
  ClipboardList,
  Award,
  CreditCard,
  ArrowRight,
  TrendingUp,
  Database,
} from 'lucide-react';

interface AdminDashboardProps {
  db: DatabaseState;
  onNavigate: (tabId: string) => void;
  onOpenBatchPrint: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  db,
  onNavigate,
  onOpenBatchPrint,
}) => {
  const members = db.users.filter((u) => u.role === 'member');
  const coaches = db.users.filter((u) => u.role === 'coach');
  const pendingSkk = db.skillRequests.filter((r) => r.status === 'Pending');
  const pendingSubmissions = db.submissions.filter((s) => s.status === 'Pending');

  const attendanceCount = db.attendanceRecords.length;
  const presentCount = db.attendanceRecords.filter((r) => r.status === 'Hadir').length;
  const attendanceRate =
    attendanceCount > 0 ? Math.round((presentCount / attendanceCount) * 100) : 100;

  const statCards = [
    {
      label: 'Total Anggota PMR',
      value: members.length,
      subtitle: `${members.filter((m) => m.gender === 'L').length} Laki-laki • ${
        members.filter((m) => m.gender === 'P').length
      } Perempuan`,
      icon: Users,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
      action: () => onNavigate('members'),
    },
    {
      label: 'Pembina & Pelatih',
      value: coaches.length,
      subtitle: 'Tenaga pendidik resmi',
      icon: UserCheck,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      action: () => onNavigate('coaches'),
    },
    {
      label: 'Tingkat Kehadiran',
      value: `${attendanceRate}%`,
      subtitle: `${presentCount} dari ${attendanceCount} catatan hadir`,
      icon: CalendarCheck,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      action: () => onNavigate('attendance'),
    },
    {
      label: 'Materi & Modul PMR',
      value: db.modules.length,
      subtitle: '7 Kurikulum pokok PMI',
      icon: BookOpen,
      color: 'bg-sky-50 text-sky-600 border-sky-200',
      action: () => onNavigate('modules'),
    },
    {
      label: 'Tugas Terkumpul',
      value: db.submissions.length,
      subtitle: `${pendingSubmissions.length} menunggu penilaian`,
      icon: ClipboardList,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      action: () => onNavigate('assignments'),
    },
    {
      label: 'Pengajuan SKK Pending',
      value: pendingSkk.length,
      subtitle: `${db.skillRequests.filter((r) => r.status === 'Approved').length} telah lulus uji`,
      icon: Award,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      action: () => onNavigate('skills'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-rose-900/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider mb-3">
            <span>Buku Induk Digital</span> • <span>Tingkat {db.settings.schoolLevel.toUpperCase()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Selamat Datang di Ayo PMRku!
          </h1>
          <p className="text-rose-100 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Sistem Informasi Manajemen Ekstrakurikuler Palang Merah Remaja {db.settings.schoolName}. Kelola data anggota, cetak KTA standar PMI, monitor absensi, dan uji kecakapan secara terpadu.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={onOpenBatchPrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Cetak KTA Siswa Massal</span>
            </button>
            <button
              onClick={() => onNavigate('backup_restore')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xl backdrop-blur-md transition-all cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>Backup & Restore Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.action}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-start justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {card.label}
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {card.value}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 mt-1">
                  {card.subtitle}
                </p>
              </div>

              <div
                className={`p-3 rounded-xl border ${card.color} group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Sessions & SKK Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latihan & Presensi Terakhir */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-rose-600" />
              <span>Sesi Latihan Terkini</span>
            </h3>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-xs font-semibold text-rose-600 hover:underline inline-flex items-center gap-1"
            >
              <span>Kelola</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 mt-4">
            {db.attendanceSessions.map((session) => (
              <div
                key={session.id}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{session.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {session.date} • {session.startTime} - {session.endTime} WIB •{' '}
                    <span className="font-semibold text-rose-700">{session.type}</span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    session.isActive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {session.isActive ? 'Sedang Aktif' : 'Selesai'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Permintaan Uji SKK Terkini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              <span>Pengajuan Uji Kecakapan (SKK)</span>
            </h3>
            <button
              onClick={() => onNavigate('skills')}
              className="text-xs font-semibold text-purple-600 hover:underline inline-flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 mt-4">
            {db.skillRequests.slice(0, 3).map((req) => (
              <div
                key={req.id}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{req.studentName}</div>
                  <div className="text-[11px] text-purple-700 font-semibold mt-0.5">
                    {req.requirementName}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    req.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : req.status === 'Pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {req.status === 'Approved' ? 'Lulus' : req.status === 'Pending' ? 'Menunggu' : 'Revisi'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
