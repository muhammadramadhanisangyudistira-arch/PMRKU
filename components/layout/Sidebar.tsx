'use client';

import React from 'react';
import { UserRole } from '@/types/pmr';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  Award,
  Settings,
  CalendarCheck,
  BookOpen,
  ClipboardList,
  MessageSquare,
  Sparkles,
  Camera,
  FileText,
  LogOut,
  Database,
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  pendingSkkCount: number;
  pendingTasksCount: number;
  schoolName?: string;
  memberCount?: number;
  onLogout?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: string | number;
  tag?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  activeTab,
  onSelectTab,
  pendingSkkCount,
  pendingTasksCount,
  schoolName = "MTs Marfu'ah Palembang",
  memberCount = 29,
  onLogout,
}) => {
  const adminMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
    { id: 'coaches', label: 'Input Pelatih/Pembina', icon: GraduationCap },
    {
      id: 'members',
      label: `Input Anggota PMR (${memberCount})`,
      icon: Users,
    },
    { id: 'idcards', label: 'Cetak ID Card', icon: CreditCard },
    {
      id: 'skills',
      label: 'Uji Syarat Kecakapan',
      icon: Award,
      badge: pendingSkkCount > 0 ? pendingSkkCount : undefined,
    },
    { id: 'settings', label: 'Pengaturan Sekolah', icon: Settings },
    {
      id: 'backup_restore',
      label: 'Backup & Restore Data',
      icon: Database,
      tag: 'LENGKAP',
    },
  ];

  const coachMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard Ringkasan', icon: LayoutDashboard },
    { id: 'attendance', label: 'Presensi Latihan', icon: CalendarCheck },
    { id: 'modules', label: 'Materi & Modul PMR', icon: BookOpen },
    {
      id: 'assignments',
      label: 'Tugas & Praktik',
      icon: ClipboardList,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      id: 'skill_verification',
      label: 'Verifikasi SKK',
      icon: Award,
      badge: pendingSkkCount > 0 ? pendingSkkCount : undefined,
    },
    { id: 'idcards', label: 'Cetak ID Card & KTA', icon: CreditCard },
    { id: 'whatsapp', label: 'Notifikasi WhatsApp', icon: MessageSquare },
  ];

  const memberMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Beranda & Aktivitas', icon: Sparkles },
    { id: 'selfie_attendance', label: 'Presensi Selfie', icon: Camera },
    { id: 'learning_modules', label: 'Modul Belajar', icon: BookOpen },
    { id: 'my_assignments', label: 'Tugas Saya', icon: FileText },
    { id: 'my_skills', label: '7 Lencana SKK', icon: Award },
    { id: 'my_certificates', label: 'Piagam Digital', icon: CreditCard },
  ];

  const items =
    role === 'admin'
      ? adminMenuItems
      : role === 'coach'
      ? coachMenuItems
      : memberMenuItems;

  return (
    <aside className="no-print w-full md:w-64 bg-white border-r border-slate-200 md:min-h-[calc(100vh-4rem)] p-3.5 flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        {/* Header box like screenshot */}
        <div className="px-3 py-2 mb-2">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            {role === 'admin'
              ? 'KONSOL ADMINISTRATOR'
              : role === 'coach'
              ? 'KONSOL PEMBINA'
              : 'PORTAL SISWA PMR'}
          </div>
          <div className="text-sm font-black text-slate-900 truncate tracking-tight mt-0.5">
            {schoolName}
          </div>
        </div>

        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-white' : 'text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.tag && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {item.tag}
                  </span>
                )}
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white text-rose-600'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-100 hidden md:block space-y-2">
        <div className="p-3 bg-gradient-to-br from-rose-50 to-amber-50 rounded-xl border border-rose-100 text-center">
          <div className="text-[11px] font-black text-rose-800">
            Siamo Tutti Fratelli!
          </div>
          <p className="text-[9.5px] text-slate-600 mt-0.5">
            &quot;Kita semua bersaudara&quot; — Semboyan Palang Merah Sedunia
          </p>
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-700 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Ke Halaman Login</span>
          </button>
        )}
      </div>
    </aside>
  );
};
