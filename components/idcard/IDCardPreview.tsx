'use client';

import React, { useState } from 'react';
import { User, SchoolSettings, PMRLevel } from '@/types/pmr';
import { DriveImage } from '@/components/common/DriveImage';
import {
  THEMES,
  FRAME_OPTIONS,
  MegamendungCorner,
  PalembangWatermark,
  CardOrientation,
} from './IDCardWorkspace';
import {
  Printer,
  RefreshCw,
  LayoutGrid,
  Palette,
  Flame,
  Sparkles,
  Users,
} from 'lucide-react';

interface IDCardPreviewProps {
  user: User;
  settings: SchoolSettings;
  showControls?: boolean;
}

export const IDCardPreview: React.FC<IDCardPreviewProps> = ({
  user,
  settings,
  showControls = true,
}) => {
  const [orientation, setOrientation] = useState<CardOrientation>('portrait');
  const [cardSide, setCardSide] = useState<'both' | 'front' | 'back'>('both');
  const [themeId, setThemeId] = useState<string>(THEMES[0].id);
  const [frameOption, setFrameOption] = useState<string>(FRAME_OPTIONS[0].id);
  const [enableFrame, setEnableFrame] = useState<boolean>(true);
  const [enableBackground, setEnableBackground] = useState<boolean>(true);

  const activeTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Interactive Controls */}
      {showControls && (
        <div className="no-print flex flex-col gap-3 w-full max-w-3xl mb-5 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs">
          {/* Baris 1: Bentuk & Sisi */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Bentuk:</span>
              <div className="inline-flex p-0.5 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    orientation === 'portrait'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Potret</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    orientation === 'landscape'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 rotate-90" />
                  <span>Lanskap</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-700">Tampilan Sisi:</span>
              <div className="inline-flex p-0.5 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  onClick={() => setCardSide('both')}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    cardSide === 'both'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dua Sisi
                </button>
                <button
                  onClick={() => setCardSide('front')}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    cardSide === 'front'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Depan Saja
                </button>
                <button
                  onClick={() => setCardSide('back')}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    cardSide === 'back'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Belakang Saja
                </button>
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak KTA</span>
            </button>
          </div>

          {/* Baris 2: Tema & Bingkai */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-slate-500" />
                <span>Tema:</span>
              </span>
              <select
                value={themeId}
                onChange={(e) => setThemeId(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                {THEMES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={enableFrame}
                  onChange={(e) => setEnableFrame(e.target.checked)}
                  className="w-3.5 h-3.5 accent-amber-500 rounded"
                />
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Ornamen Api</span>
              </label>

              <label className="inline-flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={enableBackground}
                  onChange={(e) => setEnableBackground(e.target.checked)}
                  className="w-3.5 h-3.5 accent-blue-600 rounded"
                />
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Watermark</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Cards Container */}
      <div className="flex flex-wrap items-center justify-center gap-6">
        {/* SISI DEPAN (FRONT) */}
        {(cardSide === 'both' || cardSide === 'front') && (
          <div
            id={`kta-front-${user.id}`}
            className={`id-card-print relative overflow-hidden bg-white text-slate-800 select-none shadow-xl border-2 border-sky-400 rounded-3xl flex flex-col justify-between print-avoid-break ${
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

            {/* Background Watermark */}
            {enableBackground && <PalembangWatermark />}

            {/* Header Sesuai Gambar */}
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

            {/* Body */}
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

                {/* Badge 1: Tingkat PMR */}
                <div className="mt-2">
                  <span className="px-4 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-xs bg-rose-600 text-white">
                    PMR {user.positionOrLevel || 'MADYA (SMP/SEDERAJAT)'}
                  </span>
                </div>

                {/* Badge 2: Peran */}
                <div className="mt-1">
                  <span className="px-4 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wide bg-sky-100/90 text-blue-900 border border-sky-300">
                    {user.role === 'coach' ? 'PEMBINA / PELATIH' : 'ANGGOTA PMR'}
                  </span>
                </div>

                {/* Name */}
                <div className="mt-2">
                  <div className="text-[7.5px] font-bold uppercase tracking-widest text-slate-400">
                    NAMA ANGGOTA
                  </div>
                  <div className="text-[13.5px] font-black text-slate-950 uppercase tracking-tight line-clamp-1 px-1 mt-0.5">
                    {user.fullName}
                  </div>
                </div>

                {/* Info Card Grid */}
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

                {/* Barcode Card Box */}
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
        )}

        {/* SISI BELAKANG (BACK) */}
        {(cardSide === 'both' || cardSide === 'back') && (
          <div
            id={`kta-back-${user.id}`}
            className={`id-card-print relative overflow-hidden bg-white text-slate-800 select-none shadow-xl border-2 border-sky-400 rounded-3xl flex flex-col justify-between print-avoid-break ${
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

            {/* 1. Card 7 Prinsip Palang Merah */}
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

            {/* 2. Card Biodata */}
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

            {/* 3. Card Tri Bakti PMR */}
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

            {/* 4. Official Signature / Pengesahan */}
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
    </div>
  );
};
