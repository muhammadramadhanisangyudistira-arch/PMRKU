'use client';

import React, { useState } from 'react';
import { SchoolSettings, PMRLevel } from '@/types/pmr';
import { PhotoUpload } from '@/components/common/PhotoUpload';
import { DriveImage } from '@/components/common/DriveImage';
import {
  Settings,
  Building2,
  FileCheck,
  Save,
  Check,
  Image as ImageIcon,
} from 'lucide-react';

interface SchoolSettingsTabProps {
  settings: SchoolSettings;
  onUpdateSettings: (newSettings: SchoolSettings) => void;
}

export const SchoolSettingsTab: React.FC<SchoolSettingsTabProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [formData, setFormData] = useState<SchoolSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-rose-600" />
            <span>Identitas Sekolah & Pengaturan KTA</span>
          </h2>
          <p className="text-xs text-slate-500">
            Konfigurasi nama pangkalan, tingkatan PMR, serta logo dan tanda tangan resmi pada ID Card
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Pengaturan Berhasil Disimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identitas Instansi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-rose-600" />
            <span>Profil Sekolah / Madrasah</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Sekolah / Madrasah *
              </label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) =>
                  setFormData({ ...formData, schoolName: e.target.value })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Unit / Pangkalan PMR
              </label>
              <input
                type="text"
                value={formData.unitName}
                onChange={(e) =>
                  setFormData({ ...formData, unitName: e.target.value })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tingkatan Resmi PMR
              </label>
              <select
                value={formData.schoolLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    schoolLevel: e.target.value as PMRLevel,
                  })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
              >
                <option value="mula">PMR MULA (SD / MI - Hijau)</option>
                <option value="madya">PMR MADYA (SMP / MTs - Biru)</option>
                <option value="wira">PMR WIRA (SMA / SMK / MA - Kuning)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                No. Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Email Resmi Unit
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Alamat Lengkap Sekolah / Markas
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Pejabat Penandatangan KTA & Piagam */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
            <FileCheck className="w-4 h-4 text-rose-600" />
            <span>Pejabat Pengesah Kartu & Piagam</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Kepala Madrasah / Sekolah *
              </label>
              <input
                type="text"
                required
                value={formData.principalName}
                onChange={(e) =>
                  setFormData({ ...formData, principalName: e.target.value })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                NIP Kepala Sekolah
              </label>
              <input
                type="text"
                value={formData.principalNip}
                onChange={(e) =>
                  setFormData({ ...formData, principalNip: e.target.value })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Pembina Utama PMR *
              </label>
              <input
                type="text"
                required
                value={formData.coachName}
                onChange={(e) =>
                  setFormData({ ...formData, coachName: e.target.value })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                NIP / NIK Pembina
              </label>
              <input
                type="text"
                value={formData.coachNip}
                onChange={(e) =>
                  setFormData({ ...formData, coachNip: e.target.value })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Visual Assets (Logos & Stamps) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
            <ImageIcon className="w-4 h-4 text-rose-600" />
            <span>Aset Visual KTA & Piagam (Logo, Lambang & Stempel)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <PhotoUpload
                label="Logo Sekolah / Madrasah"
                currentPhotoUrl={formData.logoUrl}
                onPhotoSelected={(url) =>
                  setFormData({ ...formData, logoUrl: url })
                }
                aspectRatio="square"
                allowCamera={false}
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <PhotoUpload
                label="Lambang Resmi PMI / PMR"
                currentPhotoUrl={formData.pmrLogoUrl}
                onPhotoSelected={(url) =>
                  setFormData({ ...formData, pmrLogoUrl: url })
                }
                aspectRatio="square"
                allowCamera={false}
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <PhotoUpload
                label="Scan Stempel & TTD Resmi"
                currentPhotoUrl={formData.signatureStampUrl}
                onPhotoSelected={(url) =>
                  setFormData({ ...formData, signatureStampUrl: url })
                }
                aspectRatio="square"
                allowCamera={false}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Disarankan format transparan (PNG).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Pengaturan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
