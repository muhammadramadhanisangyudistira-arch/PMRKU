'use client';

import React, { useState } from 'react';
import { User, SchoolSettings } from '@/types/pmr';
import { DriveImage } from '@/components/common/DriveImage';
import { PhotoUpload } from '@/components/common/PhotoUpload';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Phone,
  MessageCircle,
  X,
  Search,
  Eye,
  EyeOff,
} from 'lucide-react';

interface CoachManagementProps {
  users: User[];
  settings: SchoolSettings;
  onUpdateUsers: (users: User[]) => void;
}

export const CoachManagement: React.FC<CoachManagementProps> = ({
  users,
  settings,
  onUpdateUsers,
}) => {
  const coaches = users.filter((u) => u.role === 'coach');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<User | null>(null);
  const [showCoachPassword, setShowCoachPassword] = useState(false);

  const [formData, setFormData] = useState<Partial<User>>({
    fullName: '',
    username: '',
    password: 'pelatih123',
    phone: '',
    photoUrl: '',
    positionOrLevel: 'Pembina Utama',
    nis: '',
    address: settings.address,
  });

  const handleOpenAdd = () => {
    setEditingCoach(null);
    setFormData({
      fullName: '',
      username: '',
      password: 'pelatih123',
      phone: '',
      photoUrl: '',
      positionOrLevel: 'Pembina Utama',
      nis: '',
      address: settings.address,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coach: User) => {
    setEditingCoach(coach);
    setFormData(coach);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.username) return;

    if (editingCoach) {
      const updated = users.map((u) =>
        u.id === editingCoach.id ? ({ ...u, ...formData } as User) : u
      );
      onUpdateUsers(updated);
    } else {
      const newCoach: User = {
        id: `COACH-${Date.now().toString().slice(-4)}`,
        role: 'coach',
        fullName: formData.fullName || '',
        username: formData.username || '',
        password: formData.password || 'pelatih123',
        className: 'Pembina PMR',
        gender: (formData.gender as 'L' | 'P') || 'L',
        birthPlace: formData.birthPlace || 'Palembang',
        birthDate: formData.birthDate || '1988-01-01',
        phone: formData.phone || '',
        address: formData.address || '',
        photoUrl: formData.photoUrl || '',
        positionOrLevel: formData.positionOrLevel || 'Pembina Utama',
        nis: formData.nis || 'NIP-',
        joinedDate: new Date().toISOString().split('T')[0],
      };
      onUpdateUsers([...users, newCoach]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Hapus pembina / pelatih "${name}"?`)) {
      onUpdateUsers(users.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <span>Manajemen Pembina & Pelatih PMR</span>
          </h2>
          <p className="text-xs text-slate-500">
            Daftar tenaga pembina, pelatih teknis, dan verifikator materi kepalangmerahan
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pembina Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coaches.map((coach) => {
          const cleanPhone = coach.phone.replace(/[^0-9]/g, '');
          const waPhone = cleanPhone.startsWith('0')
            ? '62' + cleanPhone.slice(1)
            : cleanPhone;

          return (
            <div
              key={coach.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-start gap-3.5">
                  <div className="w-14 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-300 shrink-0">
                    <DriveImage
                      src={coach.photoUrl}
                      alt={coach.fullName}
                      className="w-full h-full object-cover"
                      fallbackType="avatar"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1">
                      {coach.positionOrLevel || 'Pembina'}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 truncate">
                      {coach.fullName}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      NIP/ID: {coach.nis || '-'}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      Username: @{coach.username}
                    </p>
                  </div>
                </div>

                {coach.phone && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {coach.phone}
                    </span>
                    <a
                      href={`https://wa.me/${waPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px]"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(coach)}
                  className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(coach.id, coach.fullName)}
                  className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-lg">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingCoach ? 'Edit Pembina PMR' : 'Tambah Pembina PMR Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 text-slate-500 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Contoh: Ustadz Ahmad Fauzi, S.Pd.I"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NIP / NIK Pembina
                  </label>
                  <input
                    type="text"
                    value={formData.nis}
                    onChange={(e) =>
                      setFormData({ ...formData, nis: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    placeholder="198809212015031002"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jabatan / Posisi
                  </label>
                  <select
                    value={formData.positionOrLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, positionOrLevel: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Pembina Utama">Pembina Utama</option>
                    <option value="Pelatih Teknis">Pelatih Teknis P3K</option>
                    <option value="Pembina Pendamping">Pembina Pendamping</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Username Login *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    placeholder="pelatih"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCoachPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full p-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none text-xs"
                      placeholder="pelatih123"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCoachPassword(!showCoachPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      title={showCoachPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                    >
                      {showCoachPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nomor WhatsApp Aktif
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder="081234567890"
                />
              </div>

              <div>
                <PhotoUpload
                  label="Foto Resmi Pembina (3x4)"
                  currentPhotoUrl={formData.photoUrl}
                  onPhotoSelected={(url) =>
                    setFormData({ ...formData, photoUrl: url })
                  }
                  aspectRatio="portrait"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
                >
                  Simpan Pembina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
