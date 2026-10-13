'use client';

import React from 'react';
import { User, SchoolSettings, SkillRequest, SkillRequirement } from '@/types/pmr';
import { DriveImage } from '@/components/common/DriveImage';
import { Printer, X, Award, CheckCircle } from 'lucide-react';

interface CertificateModalProps {
  user: User;
  skillRequest: SkillRequest;
  requirement?: SkillRequirement;
  settings: SchoolSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  user,
  skillRequest,
  requirement,
  settings,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-4xl flex flex-col max-h-[95vh]">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Piagam Tanda Kecakapan Khusus (TKK) Digital
              </h3>
              <p className="text-xs text-slate-500">
                Penerbitan resmi sertifikat kompetensi Palang Merah Remaja
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Piagam (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 text-slate-500 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Display (Optimized for Screen & Print) */}
        <div className="overflow-y-auto p-4 sm:p-8 flex items-center justify-center bg-slate-200/60">
          <div
            id="piagam-print-area"
            className="cert-print relative w-[780px] min-h-[550px] bg-white p-8 sm:p-10 border-8 border-double border-amber-500 shadow-xl rounded-md flex flex-col justify-between text-center select-none"
            style={{
              backgroundImage:
                'radial-gradient(#fef3c7 1px, transparent 1px), radial-gradient(#fef3c7 1px, #ffffff 1px)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 10px 10px',
            }}
          >
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-600"></div>
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-600"></div>
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-600"></div>
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-600"></div>

            {/* Header Logos & Title */}
            <div className="relative z-10 flex items-center justify-between pb-3 border-b-2 border-amber-400">
              <DriveImage
                src={settings.logoUrl}
                alt="Logo Sekolah"
                className="w-14 h-14 object-contain"
                fallbackType="logo"
              />
              <div>
                <div className="text-[12px] font-black uppercase tracking-widest text-rose-700">
                  PALANG MERAH INDONESIA - PALANG MERAH REMAJA
                </div>
                <div className="text-base sm:text-lg font-extrabold uppercase text-slate-900 tracking-tight">
                  {settings.schoolName}
                </div>
                <div className="text-[10px] text-slate-600 font-medium">
                  {settings.unitName} • {settings.address}
                </div>
              </div>
              <DriveImage
                src={settings.pmrLogoUrl}
                alt="Logo PMR"
                className="w-14 h-14 object-contain"
                fallbackType="logo"
              />
            </div>

            {/* Certificate Body */}
            <div className="my-6 space-y-3">
              <div className="inline-block px-4 py-1 bg-amber-50 border border-amber-300 rounded-full">
                <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-900">
                  PIAGAM TANDA KECAKAPAN KHUSUS (TKK)
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                Nomor: SKK/{user.nis || 'PMR'}/{new Date().getFullYear()}
              </div>

              <div className="text-xs text-slate-600 font-medium pt-2">
                Diberikan kepada anggota Palang Merah Remaja:
              </div>

              <div className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight py-1">
                {user.fullName}
              </div>

              <div className="text-xs text-slate-700">
                NIS / ID: <span className="font-mono font-bold">{user.nis || user.id}</span> • Kelas:{' '}
                <span className="font-bold">{user.className}</span> • Tingkatan:{' '}
                <span className="font-bold uppercase text-rose-700">
                  {user.positionOrLevel || 'PMR MULA'}
                </span>
              </div>

              <div className="max-w-xl mx-auto text-xs text-slate-700 leading-relaxed pt-2">
                Dinyatakan telah menempuh dan <span className="font-bold text-emerald-700">LULUS</span> dengan predikat memuaskan pada uji kompetensi:
              </div>

              <div className="inline-block p-2 px-6 bg-rose-50 border border-rose-300 rounded-xl my-2 shadow-xs">
                <div className="text-sm sm:text-base font-black text-rose-800 uppercase">
                  {skillRequest.requirementName}
                </div>
                {skillRequest.score && (
                  <div className="text-xs font-bold text-slate-700 mt-0.5">
                    Nilai Kelulusan: <span className="text-rose-600 font-black">{skillRequest.score} / 100</span>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-500 italic max-w-lg mx-auto">
                &quot;{skillRequest.examinerNotes || 'Telah menguasai kompetensi dasar kepalangmerahan dan siap mengabdi berlandaskan Tri Bakti PMR.'}&quot;
              </div>
            </div>

            {/* Signatures & Stamps */}
            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-amber-300 text-xs">
              {/* Pembina Utama */}
              <div className="text-center">
                <div className="text-slate-600 text-[10px]">Mengetahui & Menguji,</div>
                <div className="font-bold text-slate-800 text-[11px]">Pembina Utama PMR</div>
                <div className="h-14 flex items-center justify-center">
                  <div className="font-serif italic text-slate-400 text-xs">[ Tanda Tangan ]</div>
                </div>
                <div className="font-bold text-slate-900 underline">{settings.coachName}</div>
                <div className="text-[9px] text-slate-500">NIP. {settings.coachNip}</div>
              </div>

              {/* Kepala Madrasah */}
              <div className="text-center">
                <div className="text-slate-600 text-[10px]">
                  Palembang, {skillRequest.requestedDate || new Date().toISOString().split('T')[0]}
                </div>
                <div className="font-bold text-slate-800 text-[11px]">Kepala Madrasah / Sekolah</div>
                <div className="h-14 flex items-center justify-center relative">
                  <DriveImage
                    src={settings.signatureStampUrl}
                    alt="Stempel & TTD"
                    className="max-h-12 object-contain"
                    fallbackType="logo"
                  />
                </div>
                <div className="font-bold text-slate-900 underline">{settings.principalName}</div>
                <div className="text-[9px] text-slate-500">NIP. {settings.principalNip}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
