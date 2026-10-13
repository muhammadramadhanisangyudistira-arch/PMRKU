'use client';

import React, { useState } from 'react';
import { User, SchoolSettings } from '@/types/pmr';
import {
  THEMES,
  FRAME_OPTIONS,
  MegamendungCorner,
  PalembangWatermark,
  CardOrientation,
} from './IDCardWorkspace';
import { DriveImage } from '@/components/common/DriveImage';
import {
  Printer,
  X,
  CheckSquare,
  Square,
  Filter,
  LayoutGrid,
  Palette,
  Flame,
  Sparkles,
  Users,
} from 'lucide-react';

interface IDCardPrintBatchProps {
  users: User[];
  settings: SchoolSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const IDCardPrintBatch: React.FC<IDCardPrintBatchProps> = ({
  users,
  settings,
  isOpen,
  onClose,
}) => {
  const members = users.filter((u) => u.role === 'member');
  const [selectedIds, setSelectedIds] = useState<string[]>(members.map((m) => m.id));
  const [classFilter, setClassFilter] = useState<string>('all');
  const [orientation, setOrientation] = useState<CardOrientation>('portrait');
  const [themeId, setThemeId] = useState<string>(THEMES[0].id);
  const [frameOption, setFrameOption] = useState<string>(FRAME_OPTIONS[0].id);
  const [enableFrame, setEnableFrame] = useState<boolean>(true);
  const [enableBackground, setEnableBackground] = useState<boolean>(true);
  const [frontSideOnly, setFrontSideOnly] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];
  const classes = Array.from(new Set(members.map((m) => m.className))).sort();

  const filteredMembers = members.filter((m) => {
    if (classFilter !== 'all' && m.className !== classFilter) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredMembers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMembers.map((m) => m.id));
    }
  };

  const selectedMembers = members.filter((m) => selectedIds.includes(m.id));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-7xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header Modal */}
        <div className="no-print p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Printer className="w-5 h-5 text-rose-600" />
              <span>Studio Percetakan KTA Massal (Batch ID Card)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Siap cetak kertas A4 / PVC Card standar resmi Palang Merah Remaja
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              disabled={selectedMembers.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang ({selectedMembers.length} Kartu)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 text-slate-500 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar Kontrol Model (Screenshot replica) */}
        <div className="no-print p-4 border-b border-slate-200 bg-white space-y-3 text-xs">
          {/* Baris 1: Bentuk & Tema */}
          <div className="flex flex-wrap items-center justify-between gap-3">
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

            {/* Tema Dropdown */}
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

            {/* Bingkai Api Awan Dropdown */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Bingkai Ornamen:</span>
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

          {/* Baris 2: Filter Anggota & Opsi Checkbox */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            {/* Filter Siswa */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                {selectedIds.length === filteredMembers.length && filteredMembers.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-rose-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>Pilih Semua ({filteredMembers.length})</span>
              </button>

              <div className="h-4 w-px bg-slate-200" />

              <div className="flex items-center gap-1.5 text-slate-600">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold">Filter Kelas:</span>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none cursor-pointer"
                >
                  <option value="all">Semua Kelas ({members.length})</option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      Kelas {cls}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="flex flex-wrap items-center gap-2.5">
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-amber-200 bg-amber-50/50 text-amber-900 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableFrame}
                  onChange={(e) => setEnableFrame(e.target.checked)}
                  className="w-3.5 h-3.5 accent-amber-500 rounded"
                />
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                <span>Bingkai Api Awan</span>
              </label>

              <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-blue-200 bg-blue-50/50 text-blue-900 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableBackground}
                  onChange={(e) => setEnableBackground(e.target.checked)}
                  className="w-3.5 h-3.5 accent-blue-600 rounded"
                />
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Grafis Background</span>
              </label>

              <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={frontSideOnly}
                  onChange={(e) => setFrontSideOnly(e.target.checked)}
                  className="w-3.5 h-3.5 accent-slate-700 rounded"
                />
                <span>Sisi Depan Saja</span>
              </label>
            </div>
          </div>
        </div>

        {/* Print Canvas Area */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-[#f0f4f9] flex-1">
          {selectedMembers.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Printer className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="font-bold text-sm">Tidak ada siswa yang dipilih untuk dicetak.</p>
              <p className="text-xs text-slate-500 mt-1">
                Centang siswa di atas untuk memulai cetak massal KTA.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8">
              {selectedMembers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-wrap items-center justify-center gap-6 print-avoid-break relative"
                >
                  <div className="no-print absolute -top-3 -right-3 z-30">
                    <button
                      onClick={() => toggleSelect(user.id)}
                      className="p-1 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-full border border-slate-200 shadow-sm cursor-pointer"
                      title="Batal pilih"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

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

                    {/* Header */}
                    <div
                      className={`relative z-10 ${
                        activeTheme.headerBg
                      } rounded-2xl p-2.5 flex items-center justify-between text-white shadow-sm border-b-[3.5px] border-amber-400`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs">
                          <DriveImage
                            src={settings.logoUrl}
                            alt="Logo Sekolah"
                            className="w-full h-full object-contain"
                            fallbackType="logo"
                          />
                        </div>
                        <div>
                          <div className="text-[12px] font-black uppercase tracking-tight leading-tight text-white drop-shadow-xs">
                            {settings.schoolName}
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

                    {/* Body Card */}
                    {orientation === 'portrait' ? (
                      <div className="relative z-10 flex flex-col items-center text-center my-auto py-1">
                        {/* Golden frame photo */}
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

                        {/* Level badge */}
                        <div className="mt-2">
                          <span className="px-4 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-xs bg-rose-600 text-white">
                            PMR {user.positionOrLevel || 'MADYA (SMP/SEDERAJAT)'}
                          </span>
                        </div>

                        {/* Ribbon Role */}
                        <div className="mt-1">
                          <span className="px-4 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wide bg-sky-100/90 text-blue-900 border border-sky-300">
                            {user.role === 'coach' ? 'PEMBINA / PELATIH' : 'ANGGOTA PMR'}
                          </span>
                        </div>

                        {/* Nama */}
                        <div className="mt-2">
                          <div className="text-[7.5px] font-bold uppercase tracking-widest text-slate-400">
                            NAMA ANGGOTA
                          </div>
                          <div className="text-[13.5px] font-black text-slate-950 uppercase tracking-tight line-clamp-1 px-1 mt-0.5">
                            {user.fullName}
                          </div>
                        </div>

                        {/* 3 Col info */}
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

                        {/* Barcode Footer */}
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
                      // LANDSCAPE
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

                      {/* 1. 7 Prinsip Header */}
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

                      {/* 2. Biodata */}
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

                      {/* 3. Tri Bakti */}
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

                      {/* 4. Official Signature */}
                      <div className="relative z-10 text-center space-y-0.5">
                        <div className="text-[7.5px] text-slate-600 font-semibold">
                          {settings.schoolName}, {new Date().getFullYear()}
                        </div>
                        <div className="text-[8px] font-bold text-slate-900">
                          Kepala Sekolah / Pembina Utama
                        </div>

                        <div className="h-7 flex items-center justify-center my-0.5 relative">
                          <DriveImage
                            src={settings.signatureStampUrl}
                            alt="Stempel & TTD"
                            className="max-h-7 object-contain drop-shadow-xs"
                            fallbackType="logo"
                          />
                        </div>

                        <div className="text-[9px] font-black text-slate-950 uppercase tracking-wide">
                          {settings.principalName || 'RIRIA RABENA, S.H'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
