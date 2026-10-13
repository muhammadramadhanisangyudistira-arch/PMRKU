'use client';

import React, { useState } from 'react';
import { User, SchoolSettings, DatabaseState } from '@/types/pmr';
import { DriveImage } from '@/components/common/DriveImage';
import {
  Printer,
  Download,
  LayoutGrid,
  Palette,
  Flame,
  Check,
  CheckSquare,
  Square,
  Users,
  UserCheck,
  Sparkles,
  ChevronDown,
  Layers,
  FileText,
} from 'lucide-react';

export type CardOrientation = 'portrait' | 'landscape';

export interface ThemeOption {
  id: string;
  name: string;
  headerBg: string;
  headerText: string;
  badgeBg: string;
  badgeText: string;
  accentBorder: string;
  cardBg: string;
  primaryColor: string;
  ribbonColor: string;
}

export const THEMES: ThemeOption[] = [
  {
    id: 'resmi-marfuah',
    name: '1. Desain Resmi MTs Marf\'uah (Biru Navy & Emas)',
    headerBg: 'bg-gradient-to-r from-slate-950 via-slate-900 to-sky-600',
    headerText: 'text-white',
    badgeBg: 'bg-rose-600 text-white',
    badgeText: 'text-white',
    accentBorder: 'border-sky-400',
    cardBg: 'from-sky-50/20 via-white to-blue-50/30',
    primaryColor: '#0284c7',
    ribbonColor: 'bg-sky-50 border-sky-200 text-sky-900',
  },
  {
    id: 'merah-klasik',
    name: '2. Merah Klasik PMR (Gradasi Berkilau)',
    headerBg: 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700',
    headerText: 'text-white',
    badgeBg: 'bg-red-600 text-white',
    badgeText: 'text-white',
    accentBorder: 'border-amber-400',
    cardBg: 'from-amber-50/40 via-white to-red-50/30',
    primaryColor: '#dc2626',
    ribbonColor: 'bg-rose-50 border-rose-200 text-rose-800',
  },
  {
    id: 'emas-elegan',
    name: '3. Emas Elegan PMI (Golden Royal)',
    headerBg: 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700',
    headerText: 'text-white',
    badgeBg: 'bg-amber-600 text-white',
    badgeText: 'text-white',
    accentBorder: 'border-yellow-400',
    cardBg: 'from-yellow-50/50 via-white to-amber-50/30',
    primaryColor: '#d97706',
    ribbonColor: 'bg-amber-50 border-amber-200 text-amber-900',
  },
  {
    id: 'biru-madya',
    name: '4. Biru Madya Resmi (Navy & Cobalt)',
    headerBg: 'bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800',
    headerText: 'text-white',
    badgeBg: 'bg-blue-600 text-white',
    badgeText: 'text-white',
    accentBorder: 'border-blue-400',
    cardBg: 'from-blue-50/40 via-white to-indigo-50/30',
    primaryColor: '#2563eb',
    ribbonColor: 'bg-blue-50 border-blue-200 text-blue-900',
  },
  {
    id: 'hijau-mula',
    name: '5. Hijau Mula Alami (Emerald & Jade)',
    headerBg: 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700',
    headerText: 'text-white',
    badgeBg: 'bg-emerald-600 text-white',
    badgeText: 'text-white',
    accentBorder: 'border-emerald-400',
    cardBg: 'from-emerald-50/40 via-white to-green-50/30',
    primaryColor: '#059669',
    ribbonColor: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  },
  {
    id: 'kuning-wira',
    name: '6. Kuning Wira Cemerlang (Amber & Gold)',
    headerBg: 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600',
    headerText: 'text-amber-950 font-black',
    badgeBg: 'bg-amber-500 text-amber-950',
    badgeText: 'text-amber-950 font-black',
    accentBorder: 'border-amber-300',
    cardBg: 'from-amber-50/60 via-white to-yellow-50/40',
    primaryColor: '#b45309',
    ribbonColor: 'bg-amber-100 border-amber-300 text-amber-950',
  },
  {
    id: 'marun-burgundy',
    name: '7. Marun Burgundy Mewah (Crimson Rose)',
    headerBg: 'bg-gradient-to-r from-rose-800 via-red-900 to-rose-950',
    headerText: 'text-white',
    badgeBg: 'bg-rose-800 text-white',
    badgeText: 'text-white',
    accentBorder: 'border-rose-400',
    cardBg: 'from-rose-50/40 via-white to-red-50/30',
    primaryColor: '#9f1239',
    ribbonColor: 'bg-rose-50 border-rose-200 text-rose-900',
  },
  {
    id: 'midnight-navy',
    name: '8. Midnight Navy (Deep Sapphire)',
    headerBg: 'bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900',
    headerText: 'text-white',
    badgeBg: 'bg-blue-900 text-white',
    badgeText: 'text-white',
    accentBorder: 'border-blue-400',
    cardBg: 'from-slate-50 via-white to-blue-50/30',
    primaryColor: '#1e3a8a',
    ribbonColor: 'bg-slate-100 border-slate-300 text-slate-800',
  },
  {
    id: 'hitam-obsidian',
    name: '9. Hitam Obsidian Elegan (Dark Titanium)',
    headerBg: 'bg-gradient-to-r from-neutral-900 via-neutral-800 to-black',
    headerText: 'text-amber-300 font-bold',
    badgeBg: 'bg-black text-amber-300 border border-amber-400/50',
    badgeText: 'text-amber-300',
    accentBorder: 'border-amber-400',
    cardBg: 'from-neutral-50 via-white to-neutral-100',
    primaryColor: '#171717',
    ribbonColor: 'bg-neutral-100 border-neutral-300 text-neutral-900',
  },
  {
    id: 'teal-prestise',
    name: '10. Teal Prestise PMI (Cyan & Seafoam)',
    headerBg: 'bg-gradient-to-r from-teal-700 via-cyan-700 to-teal-800',
    headerText: 'text-white',
    badgeBg: 'bg-teal-700 text-white',
    badgeText: 'text-white',
    accentBorder: 'border-teal-400',
    cardBg: 'from-teal-50/40 via-white to-cyan-50/30',
    primaryColor: '#0f766e',
    ribbonColor: 'bg-teal-50 border-teal-200 text-teal-900',
  },
];

export const FRAME_OPTIONS = [
  { id: 'resmi-marfuah-cyan', name: 'Ukiran Lengkung Cyan Resmi (Sesuai Contoh)' },
  { id: 'megamendung-emas', name: 'Ukiran Megamendung Emas & Merah PMR' },
  { id: 'batik-biru-emas', name: 'Batik Megamendung Biru & Emas' },
  { id: 'keraton-mewah', name: 'Ornamen Emas Keraton Mewah' },
  { id: 'tanpa-bingkai', name: 'Tanpa Bingkai Ornamen' },
];

/**
 * Palembang Wave / Cyan Fluid Corner SVG Ornaments (Exact Match to Physical Sample)
 */
export const MegamendungCorner: React.FC<{
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  variant?: string;
}> = ({ position, variant = 'resmi-marfuah-cyan' }) => {
  if (variant === 'tanpa-bingkai') return null;

  if (variant === 'resmi-marfuah-cyan') {
    const isTop = position.includes('top');
    const isLeft = position.includes('left');

    const transform = `${isLeft ? '' : 'scaleX(-1)'} ${isTop ? '' : 'scaleY(-1)'}`.trim() || 'none';

    return (
      <svg
        className={`absolute w-14 h-14 pointer-events-none z-20 ${
          isTop ? 'top-0' : 'bottom-0'
        } ${isLeft ? 'left-0' : 'right-0'}`}
        viewBox="0 0 70 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform }}
      >
        {/* Outer Cyan Swoosh */}
        <path
          d="M 0,0 L 50,0 C 45,4 40,8 35,14 C 28,22 22,28 14,35 C 8,40 4,45 0,50 Z"
          fill="#0284c7"
          opacity="0.9"
        />
        {/* Middle Sky Blue Flow */}
        <path
          d="M 0,0 L 38,0 C 33,6 28,12 22,18 C 16,24 10,30 0,36 Z"
          fill="#38bdf8"
          opacity="0.95"
        />
        {/* Inner Light Blue Accent */}
        <path
          d="M 0,0 L 25,0 C 20,4 16,8 12,14 C 8,18 4,22 0,26 Z"
          fill="#7dd3fc"
        />
        {/* Dynamic Curved Wave Trail */}
        <path
          d="M 0,40 C 6,36 12,32 18,24 C 24,16 28,10 32,0 C 35,0 38,2 35,6 C 30,16 22,26 14,34 C 8,40 4,44 0,46 Z"
          fill="#0369a1"
          opacity="0.8"
        />
        {/* White Diamond / Rhombus Corner Accent */}
        <polygon points="12,7 17,12 12,17 7,12" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
      </svg>
    );
  }

  const color1 = variant === 'batik-biru-emas' ? '#1d4ed8' : '#dc2626';
  const color2 = '#f59e0b'; // Gold

  const transform =
    position === 'top-right'
      ? 'scale(-1, 1)'
      : position === 'bottom-left'
      ? 'scale(1, -1)'
      : position === 'bottom-right'
      ? 'scale(-1, -1)'
      : 'none';

  return (
    <svg
      className={`absolute w-12 h-12 pointer-events-none z-20 ${
        position.includes('top') ? 'top-0' : 'bottom-0'
      } ${position.includes('left') ? 'left-0' : 'right-0'}`}
      viewBox="0 0 60 60"
      style={{ transform }}
    >
      <path
        d="M 0,0 L 45,0 C 40,8 32,10 32,18 C 32,24 24,26 20,32 C 16,36 10,40 0,45 Z"
        fill={color2}
        opacity="0.9"
      />
      <path
        d="M 0,0 L 35,0 C 30,6 24,8 24,14 C 24,20 18,22 14,26 C 10,30 6,34 0,36 Z"
        fill={color1}
        opacity="0.85"
      />
      <path
        d="M 0,0 L 22,0 C 18,4 14,6 14,10 C 14,14 10,16 8,18 C 6,20 4,22 0,24 Z"
        fill="#fbbf24"
      />
      <circle cx="8" cy="8" r="4" fill="#ffffff" stroke={color1} strokeWidth="1.5" />
    </svg>
  );
};

/**
 * Ampera Bridge & PMI Soft Watermark
 */
export const PalembangWatermark: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-10">
    <svg viewBox="0 0 300 300" className="w-64 h-64 text-sky-700" fill="currentColor">
      {/* Ampera Bridge Towers Silhouette */}
      <path d="M 80,180 L 95,80 L 105,80 L 120,180 Z" opacity="0.6" />
      <path d="M 180,180 L 195,80 L 205,80 L 220,180 Z" opacity="0.6" />
      <rect x="75" y="100" width="150" height="8" rx="2" opacity="0.8" />
      <rect x="70" y="140" width="160" height="10" rx="2" opacity="0.8" />
      {/* Bridge Cables */}
      <line x1="100" y1="80" x2="30" y2="180" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <line x1="100" y1="80" x2="60" y2="180" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <line x1="100" y1="80" x2="150" y2="180" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <line x1="200" y1="80" x2="150" y2="180" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <line x1="200" y1="80" x2="240" y2="180" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <line x1="200" y1="80" x2="270" y2="180" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      {/* River Waves */}
      <path d="M 0,220 Q 75,205 150,220 T 300,220 L 300,280 L 0,280 Z" opacity="0.3" />
      <path d="M 0,240 Q 75,225 150,240 T 300,240 L 300,280 L 0,280 Z" opacity="0.2" />
    </svg>
  </div>
);

interface IDCardWorkspaceProps {
  db: DatabaseState;
  onUpdateDb: (newDb: DatabaseState) => void;
}

export const IDCardWorkspace: React.FC<IDCardWorkspaceProps> = ({
  db,
  onUpdateDb,
}) => {
  const members = db.users.filter((u) => u.role === 'member');
  const coaches = db.users.filter((u) => u.role === 'coach');

  // Controls state matching the screenshot
  const [selectedTarget, setSelectedTarget] = useState<string>('all_members');
  const [orientation, setOrientation] = useState<CardOrientation>('portrait');
  const [themeId, setThemeId] = useState<string>(THEMES[0].id);
  const [frameOption, setFrameOption] = useState<string>(FRAME_OPTIONS[0].id);
  const [enableFrame, setEnableFrame] = useState<boolean>(true);
  const [enableBackground, setEnableBackground] = useState<boolean>(true);
  const [frontSideOnly, setFrontSideOnly] = useState<boolean>(false);

  // Active theme
  const activeTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  // Determine cards to display/print based on target
  let targetUsers: User[] = [];
  if (selectedTarget === 'all_members') {
    targetUsers = members;
  } else if (selectedTarget === 'all_coaches') {
    targetUsers = coaches;
  } else if (selectedTarget === 'all_users') {
    targetUsers = db.users;
  } else {
    // Specific user ID
    const single = db.users.find((u) => u.id === selectedTarget);
    targetUsers = single ? [single] : members;
  }

  const targetCount = targetUsers.length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = () => {
    // Trigger standard browser print which offers "Save as PDF" high DPI
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="no-print">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Printer className="w-5 h-5 text-slate-700" />
          <span>Cetak Kartu Tanda Anggota (KTA) & Pelatih</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Pilih pengguna di bawah untuk memuat kartu identitas mereka.
        </p>
      </div>

      {/* Target Selector */}
      <div className="no-print space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">
          Pilih Target Pencetakan (Individu / Massal)
        </label>
        <div className="relative max-w-xl">
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="w-full p-2.5 pl-9 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-rose-500 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="all_members">
              👥 Semua Anggota PMR ({members.length} Siswa)
            </option>
            <option value="all_coaches">
              🎓 Semua Pelatih / Pembina ({coaches.length} Orang)
            </option>
            <option value="all_users">
              🌐 Seluruh Pengguna Sistem ({db.users.length} Orang)
            </option>
            <optgroup label="Pilih Anggota Individual:">
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  👤 {m.fullName} ({m.className} - {m.nis})
                </option>
              ))}
            </optgroup>
          </select>
          <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Control Panel (Exact replica of the screenshot) */}
      <div className="no-print bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
        {/* Row 1: Bentuk & Tema */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Bentuk Toggle */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Bentuk:</span>
            <div className="inline-flex p-0.5 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  orientation === 'portrait'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Potret (Vertical)</span>
              </button>
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  orientation === 'landscape'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 rotate-90" />
                <span>Lanskap (Horizontal)</span>
              </button>
            </div>
          </div>

          {/* Theme Dropdown */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-slate-500" />
              <span>Pilih 10 Tema Warna:</span>
            </span>
            <select
              value={themeId}
              onChange={(e) => setThemeId(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-rose-500 focus:outline-none cursor-pointer"
            >
              {THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Frame Option */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Bingkai Api Awan:</span>
            </span>
            <select
              value={frameOption}
              onChange={(e) => setFrameOption(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-rose-500 focus:outline-none cursor-pointer"
            >
              {FRAME_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  🔥 {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Checkboxes & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Checkboxes */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50/50 text-amber-900 font-semibold cursor-pointer hover:bg-amber-100/50">
              <input
                type="checkbox"
                checked={enableFrame}
                onChange={(e) => setEnableFrame(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Bingkai Api Awan</span>
            </label>

            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/50 text-blue-900 font-semibold cursor-pointer hover:bg-blue-100/50">
              <input
                type="checkbox"
                checked={enableBackground}
                onChange={(e) => setEnableBackground(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Grafis Background</span>
            </label>

            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold cursor-pointer hover:bg-slate-100">
              <input
                type="checkbox"
                checked={frontSideOnly}
                onChange={(e) => setFrontSideOnly(e.target.checked)}
                className="w-4 h-4 accent-slate-700 rounded"
              />
              <span>Sisi Depan Saja</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Langsung ({targetCount})</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor KTA PDF ({targetCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notice Banner (Golden / Amber pill strip) */}
      <div className="no-print bg-amber-50 border border-amber-300 rounded-2xl p-3 px-4 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-amber-950 font-black text-[10px] tracking-wide uppercase">
            CETAK MASSAL
          </span>
          <span className="text-amber-950 font-medium">
            Siap mencetak <strong className="font-bold text-red-700">{targetCount} Kartu Tanda Anggota (KTA)</strong> secara bersamaan.
          </span>
        </div>
        <div className="text-amber-800 font-semibold text-[11px]">
          Format: {orientation === 'portrait' ? 'Potret' : 'Lanskap'} • Tema: {activeTheme.name}
        </div>
      </div>

      {/* Cards Canvas Container */}
      <div className="bg-[#f0f4f9] p-4 sm:p-8 rounded-3xl border border-slate-200/80 shadow-inner flex flex-col items-center gap-8">
        {targetUsers.map((user) => (
          <div
            key={user.id}
            className="flex flex-wrap items-center justify-center gap-6 print-avoid-break"
          >
            {/* SISI DEPAN (FRONT) */}
            <div
              className={`relative overflow-hidden bg-white text-slate-800 select-none shadow-xl border-2 border-sky-400 rounded-3xl flex flex-col justify-between print-avoid-break ${
                orientation === 'portrait'
                  ? 'w-[320px] h-[510px] sm:w-[335px] sm:h-[525px] p-3.5'
                  : 'w-[510px] h-[320px] sm:w-[525px] sm:h-[335px] p-3.5'
              }`}
              style={{
                boxShadow:
                  '0 12px 30px -5px rgba(2, 132, 199, 0.15), 0 0 0 1px rgba(56, 189, 248, 0.4)',
                background: '#ffffff',
              }}
            >
              {/* Corner Ornaments */}
              {enableFrame && (
                <>
                  <MegamendungCorner position="top-left" variant={frameOption} />
                  <MegamendungCorner position="top-right" variant={frameOption} />
                  <MegamendungCorner position="bottom-left" variant={frameOption} />
                  <MegamendungCorner position="bottom-right" variant={frameOption} />
                </>
              )}

              {/* Watermark */}
              {enableBackground && <PalembangWatermark />}

              {/* HEADER (Navy to Blue Gradient) */}
              <div
                className={`relative z-10 ${
                  activeTheme.headerBg
                } rounded-2xl p-2.5 flex items-center justify-between text-white shadow-sm border-b-[3.5px] border-amber-400`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs">
                    <DriveImage
                      src={db.settings.logoUrl}
                      alt="Logo Sekolah"
                      className="w-full h-full object-contain"
                      fallbackType="logo"
                    />
                  </div>
                  <div>
                    <div className="text-[12px] font-black uppercase tracking-tight leading-tight text-white drop-shadow-xs">
                      {db.settings.schoolName}
                    </div>
                    <div className="text-[8.5px] font-bold text-sky-200 tracking-wider uppercase">
                      PALANG MERAH INDONESIA
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pl-1">
                  <div className="w-7 h-7 relative flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full border-2 border-rose-500 bg-white flex items-center justify-center">
                      <div className="w-3.5 h-3.5 bg-rose-600 relative flex items-center justify-center">
                        <div className="w-3.5 h-1.5 bg-rose-600"></div>
                        <div className="w-1.5 h-3.5 bg-rose-600 absolute"></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-[7.5px] font-bold text-white leading-tight">
                    Palang<br />Merah<br />Indonesia
                  </div>
                </div>
              </div>

              {/* BODY AREA */}
              {orientation === 'portrait' ? (
                <div className="relative z-10 flex flex-col items-center text-center my-auto py-1">
                  {/* Photo with golden frame */}
                  <div className="relative p-0.5 bg-amber-400 rounded-2xl shadow-md border-[2.5px] border-amber-400">
                    <div className="w-24 h-32 overflow-hidden rounded-xl bg-sky-500 flex items-center justify-center">
                      <DriveImage
                        src={user.photoUrl}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                        fallbackType="avatar"
                      />
                    </div>
                  </div>

                  {/* Level Pill */}
                  <div className="mt-2">
                    <span className="px-4 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-xs bg-rose-600 text-white">
                      PMR {user.positionOrLevel || 'MADYA (SMP/SEDERAJAT)'}
                    </span>
                  </div>

                  {/* Role Pill */}
                  <div className="mt-1">
                    <span className="px-4 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wide bg-sky-100/90 text-blue-900 border border-sky-300">
                      {user.role === 'coach' ? 'PEMBINA / PELATIH' : 'ANGGOTA PMR'}
                    </span>
                  </div>

                  {/* Member Name */}
                  <div className="mt-2">
                    <div className="text-[7.5px] font-bold uppercase tracking-widest text-slate-400">
                      NAMA ANGGOTA
                    </div>
                    <div className="text-[13.5px] font-black text-slate-950 uppercase tracking-tight line-clamp-1 px-1 mt-0.5">
                      {user.fullName}
                    </div>
                  </div>

                  {/* 3-Column Info Table */}
                  <div className="w-full grid grid-cols-3 gap-1 mt-2.5 bg-white border border-slate-200/90 rounded-2xl p-2 shadow-xs text-left">
                    <div>
                      <div className="font-bold text-slate-400 uppercase text-[7px]">
                        ID KARTU
                      </div>
                      <div className="font-mono font-bold text-slate-900 text-[9px] truncate">
                        {user.nis || user.id}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-400 uppercase text-[7px]">
                        L / P
                      </div>
                      <div className="font-bold text-slate-900 text-[9px]">
                        {user.gender === 'L' ? 'L' : 'P'}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-400 uppercase text-[7px]">
                        USERNAME
                      </div>
                      <div className="font-mono font-bold text-slate-700 text-[9px] truncate">
                        {user.username || user.nis}
                      </div>
                    </div>
                  </div>

                  {/* Barcode Box */}
                  <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-2 shadow-xs mt-2 flex flex-col items-center">
                    <svg
                      className="w-48 h-6"
                      viewBox="0 0 160 16"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect x="0" y="0" width="3" height="16" fill="#0f172a" />
                      <rect x="5" y="0" width="1.5" height="16" fill="#0f172a" />
                      <rect x="9" y="0" width="4" height="16" fill="#0f172a" />
                      <rect x="16" y="0" width="2" height="16" fill="#0f172a" />
                      <rect x="22" y="0" width="1.5" height="16" fill="#0f172a" />
                      <rect x="27" y="0" width="3" height="16" fill="#0f172a" />
                      <rect x="33" y="0" width="2" height="16" fill="#0f172a" />
                      <rect x="38" y="0" width="4" height="16" fill="#0f172a" />
                      <rect x="45" y="0" width="1.5" height="16" fill="#0f172a" />
                      <rect x="50" y="0" width="3" height="16" fill="#0f172a" />
                      <rect x="56" y="0" width="2" height="16" fill="#0f172a" />
                      <rect x="62" y="0" width="1.5" height="16" fill="#0f172a" />
                      <rect x="67" y="0" width="4" height="16" fill="#0f172a" />
                      <rect x="74" y="0" width="2" height="16" fill="#0f172a" />
                      <rect x="80" y="0" width="3" height="16" fill="#0f172a" />
                      <rect x="86" y="0" width="1.5" height="16" fill="#0f172a" />
                      <rect x="91" y="0" width="2" height="16" fill="#0f172a" />
                      <rect x="96" y="0" width="4" height="16" fill="#0f172a" />
                      <rect x="103" y="0" width="1.5" height="16" fill="#0f172a" />
                      <rect x="108" y="0" width="3" height="16" fill="#0f172a" />
                      <rect x="114" y="0" width="2" height="16" fill="#0f172a" />
                      <rect x="120" y="0" width="3.5" height="16" fill="#0f172a" />
                      <rect x="127" y="0" width="1.5" height="16" fill="#0f172a" />
                      <rect x="132" y="0" width="4" height="16" fill="#0f172a" />
                      <rect x="139" y="0" width="2" height="16" fill="#0f172a" />
                      <rect x="145" y="0" width="3" height="16" fill="#0f172a" />
                      <rect x="152" y="0" width="2" height="16" fill="#0f172a" />
                    </svg>
                    <div className="w-full flex items-center justify-between text-[8px] font-mono font-bold px-2 mt-1">
                      <span className="text-slate-700">{user.nis || user.id}</span>
                      <span className="text-rose-600 font-black">2026/2027</span>
                    </div>
                  </div>
                </div>
              ) : (
                // LANDSCAPE LAYOUT
                <div className="relative z-10 grid grid-cols-12 gap-3 items-center my-auto py-2">
                  <div className="col-span-4 flex flex-col items-center">
                    <div className="p-0.5 bg-amber-400 rounded-xl shadow-md border-2 border-amber-400">
                      <div className="w-20 h-28 overflow-hidden rounded-lg bg-sky-500">
                        <DriveImage
                          src={user.photoUrl}
                          alt={user.fullName}
                          className="w-full h-full object-cover"
                          fallbackType="avatar"
                        />
                      </div>
                    </div>
                    <span className="mt-1.5 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-rose-600 text-white">
                      PMR {user.positionOrLevel || 'MADYA'}
                    </span>
                  </div>

                  <div className="col-span-8 space-y-1.5 text-left">
                    <span className="px-3 py-0.5 rounded-full text-[8.5px] font-black uppercase bg-sky-100 text-blue-900 border border-sky-300">
                      {user.role === 'coach' ? 'PEMBINA / PELATIH' : `ANGGOTA - KELAS ${user.className || 'IX'}`}
                    </span>
                    <div className="text-[13px] font-black text-slate-950 uppercase leading-snug">
                      {user.fullName}
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-200 text-[8px]">
                      <div>
                        <span className="text-slate-400 font-bold">ID KARTU:</span>
                        <div className="font-mono font-bold text-slate-800">{user.nis || user.id}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold">L/P:</span>
                        <div className="font-bold text-slate-800">{user.gender}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold">USER:</span>
                        <div className="font-mono font-bold text-slate-800 truncate">{user.username}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SISI BELAKANG (BACK) */}
            {!frontSideOnly && (
              <div
                className={`relative overflow-hidden bg-white text-slate-800 select-none shadow-xl border-2 border-sky-400 rounded-3xl flex flex-col justify-between print-avoid-break ${
                  orientation === 'portrait'
                    ? 'w-[320px] h-[510px] sm:w-[335px] sm:h-[525px] p-3.5'
                    : 'w-[510px] h-[320px] sm:w-[525px] sm:h-[335px] p-3.5'
                }`}
                style={{
                  boxShadow:
                    '0 12px 30px -5px rgba(2, 132, 199, 0.15), 0 0 0 1px rgba(56, 189, 248, 0.4)',
                  background: '#ffffff',
                }}
              >
                {enableFrame && (
                  <>
                    <MegamendungCorner position="top-left" variant={frameOption} />
                    <MegamendungCorner position="top-right" variant={frameOption} />
                    <MegamendungCorner position="bottom-left" variant={frameOption} />
                    <MegamendungCorner position="bottom-right" variant={frameOption} />
                  </>
                )}

                {enableBackground && <PalembangWatermark />}

                {/* 1. 7 Prinsip Card */}
                <div className="relative z-10 bg-white border border-rose-200/90 rounded-2xl p-2.5 shadow-xs text-left">
                  <div className="flex items-center justify-between pb-1 border-b border-rose-100">
                    <span className="text-rose-900 font-black text-[9.5px] tracking-wider uppercase">
                      7 PRINSIP PALANG MERAH
                    </span>
                    <div className="w-4 h-4 rounded-full border border-rose-500 flex items-center justify-center bg-rose-50">
                      <div className="w-2.5 h-2.5 bg-rose-600 relative flex items-center justify-center">
                        <div className="w-2.5 h-1 bg-rose-600"></div>
                        <div className="w-1 h-2.5 bg-rose-600 absolute"></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-[7.5px] font-semibold text-slate-700 mt-1 leading-snug">
                    Kemanusiaan • Kesamaan • Kenetralan • Kemandirian • Kesukarelaan • Kesatuan • Kesemestaan
                  </div>
                </div>

                {/* 2. Biodata Card */}
                <div className="relative z-10 bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-xs space-y-1.5 text-left">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <div className="flex items-center gap-1.5 text-slate-900 font-black text-[9.5px] uppercase tracking-wider">
                      <Users className="w-3.5 h-3.5 text-rose-600" />
                      <span>{user.role === 'coach' ? 'BIODATA PEMBINA/PELATIH' : 'BIODATA ANGGOTA'}</span>
                    </div>
                    <span className="text-[8px] font-bold text-slate-500 uppercase">
                      {user.positionOrLevel || 'MADYA (SMP/SEDERAJAT)'}
                    </span>
                  </div>

                  <div className="space-y-1 text-[8px] text-slate-700 font-medium">
                    <div className="flex items-start">
                      <span className="w-22 text-slate-500 font-semibold shrink-0">Nama Lengkap</span>
                      <span className="mr-1.5 font-bold">:</span>
                      <span className="font-extrabold text-slate-950 uppercase">
                        {user.fullName}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-22 text-slate-500 font-semibold shrink-0">Jenis Kelamin</span>
                      <span className="mr-1.5 font-bold">:</span>
                      <span className="font-bold text-slate-800">
                        {user.gender === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-22 text-slate-500 font-semibold shrink-0">Jabatan / Status</span>
                      <span className="mr-1.5 font-bold">:</span>
                      <span className="font-black text-rose-600 uppercase">
                        {user.role === 'coach'
                          ? 'PEMBINA / PELATIH UTAMA'
                          : `ANGGOTA PMR (KELAS ${user.className || 'VIII'})`}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-22 text-slate-500 font-semibold shrink-0">TTL</span>
                      <span className="mr-1.5 font-bold">:</span>
                      <span className="font-bold text-slate-800">
                        {user.birthPlace || 'Palembang'}, {user.birthDate || '1999-01-04'}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-22 text-slate-500 font-semibold shrink-0">Alamat</span>
                      <span className="mr-1.5 font-bold">:</span>
                      <span className="font-semibold text-slate-800 leading-tight">
                        {user.address || 'Perum. Pekon Duta Muda 4 Blok B. 13 Jl. Lumban Meranti Jaya, Kota Palembang'}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-22 text-slate-500 font-semibold shrink-0">No. HP / WA</span>
                      <span className="mr-1.5 font-bold">:</span>
                      <span className="font-mono font-bold text-slate-950">
                        {user.phone || '089681555578'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Tri Bakti PMR Card */}
                <div className="relative z-10 bg-sky-50/50 border border-sky-100 rounded-2xl p-2 text-left space-y-0.5">
                  <div className="text-[8px] font-black text-slate-900 uppercase tracking-wide">
                    TRI BAKTI PMR:
                  </div>
                  <ol className="text-[7px] text-slate-700 font-medium space-y-0.5 list-decimal list-inside leading-tight">
                    <li>Meningkatkan keterampilan hidup sehat</li>
                    <li>Berkarya dan berbakti di masyarakat</li>
                    <li>Mempererat persahabatan nasional & internasional</li>
                  </ol>
                </div>

                {/* 4. Signature & Official Stamp */}
                <div className="relative z-10 text-center space-y-0.5">
                  <div className="text-[7.5px] text-slate-600 font-semibold">
                    {db.settings.schoolName}, {new Date().getFullYear()}
                  </div>
                  <div className="text-[8px] font-bold text-slate-900">
                    Kepala Sekolah / Pembina Utama
                  </div>

                  <div className="h-7 flex items-center justify-center my-0.5 relative">
                    <DriveImage
                      src={db.settings.signatureStampUrl}
                      alt="Stempel & TTD"
                      className="max-h-7 object-contain drop-shadow-xs"
                      fallbackType="logo"
                    />
                  </div>

                  <div className="text-[9px] font-black text-slate-950 uppercase tracking-wide">
                    {db.settings.principalName || 'RIRIA RABENA, S.H'}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
