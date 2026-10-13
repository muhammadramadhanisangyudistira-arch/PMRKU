'use client';

import React from 'react';
import { User, SchoolSettings, UserRole } from '@/types/pmr';
import { DriveImage } from '@/components/common/DriveImage';
import {
  ChevronDown,
  LogOut,
  Users,
  Cloud,
} from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  settings: SchoolSettings;
  users: User[];
  onSwitchUser: (user: User) => void;
  onOpenBatchPrint: () => void;
  onOpenProfile: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  settings,
  users,
  onSwitchUser,
  onOpenBatchPrint,
  onOpenProfile,
  onLogout,
}) => {
  const getLevelBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'wira':
        return { label: 'PMR WIRA', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'madya':
        return { label: 'PMR MADYA', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'mula':
      default:
        return { label: 'PMR MULA', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
    }
  };

  const levelInfo = getLevelBadge(settings.schoolLevel);

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & School Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <DriveImage
              src={settings.pmrLogoUrl}
              alt="Logo PMR"
              className="w-9 h-9 object-contain drop-shadow-xs"
              fallbackType="logo"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  Ayo <span className="text-rose-600">PMRku</span>
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${levelInfo.bg}`}
                >
                  {levelInfo.label}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                {settings.schoolName}
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Cloud Database Online Status */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Database Online</span>
            <span className="sm:hidden">Online</span>
          </div>

          {/* User Profile Block */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900">
                {currentUser?.role === 'admin'
                  ? 'Administrator Utama'
                  : currentUser?.fullName}
              </div>
              <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                {currentUser?.role === 'admin'
                  ? 'ADMIN'
                  : currentUser?.role === 'coach'
                  ? 'PEMBINA'
                  : 'SISWA'}
              </div>
            </div>

            {/* Quick Demo Switcher Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1 p-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 cursor-pointer"
                title="Ganti Akun / Peran"
              >
                <Users className="w-4 h-4" />
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <div className="absolute right-0 mt-1 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 hidden group-hover:block z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase">
                  Pilih Akun Demo:
                </div>
                {users.slice(0, 4).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => onSwitchUser(u)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      currentUser?.id === u.id
                        ? 'bg-rose-50 text-rose-700 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="truncate">{u.fullName}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{u.role}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Keluar Button */}
            <button
              onClick={() => {
                if (onLogout) {
                  onLogout();
                } else {
                  const other = users.find((u) => u.id !== currentUser?.id) || users[0];
                  onSwitchUser(other);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Keluar ke Halaman Login"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
