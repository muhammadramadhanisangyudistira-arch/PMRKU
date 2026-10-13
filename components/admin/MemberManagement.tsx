'use client';

import React, { useState } from 'react';
import { User, SchoolSettings } from '@/types/pmr';
import { DriveImage } from '@/components/common/DriveImage';
import { PhotoUpload } from '@/components/common/PhotoUpload';
import { BatchPhotoImportModal } from './BatchPhotoImportModal';
import { IDCardPreview } from '@/components/idcard/IDCardPreview';
import JSZip from 'jszip';
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Download,
  Trash2,
  Edit2,
  CreditCard,
  X,
  FileArchive,
  FileSpreadsheet,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';

interface MemberManagementProps {
  users: User[];
  settings: SchoolSettings;
  onUpdateUsers: (users: User[]) => void;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({
  users,
  settings,
  onUpdateUsers,
}) => {
  const members = users.filter((u) => u.role === 'member');

  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [previewKtaUser, setPreviewKtaUser] = useState<User | null>(null);
  const [isBatchZipOpen, setIsBatchZipOpen] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [showMemberPassword, setShowMemberPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<User>>({
    fullName: '',
    username: '',
    password: 'siswa123',
    className: '5A',
    gender: 'L',
    birthPlace: 'Palembang',
    birthDate: '2015-05-10',
    phone: '',
    address: '',
    photoUrl: '',
    nis: '',
    positionOrLevel: 'PMR Mula',
    emergencyContact: '',
  });

  const classes = Array.from(new Set(members.map((m) => m.className))).sort();

  // Filter & Search
  const filteredMembers = members
    .filter((m) => {
      if (classFilter !== 'all' && m.className !== classFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.fullName.toLowerCase().includes(q) ||
          m.username.toLowerCase().includes(q) ||
          m.nis.toLowerCase().includes(q) ||
          m.className.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const cmp = a.fullName.localeCompare(b.fullName);
      return sortOrder === 'asc' ? cmp : -cmp;
    });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      fullName: '',
      username: '',
      password: 'siswa123',
      className: classes[0] || '5A',
      gender: 'L',
      birthPlace: 'Palembang',
      birthDate: '2015-05-10',
      phone: '',
      address: settings.address,
      photoUrl: '',
      nis: `2024.${String(members.length + 1).padStart(2, '0')}`,
      positionOrLevel: settings.schoolLevel === 'mula' ? 'PMR Mula' : settings.schoolLevel === 'madya' ? 'PMR Madya' : 'PMR Wira',
      emergencyContact: '',
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData(user);
    setIsAddEditOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.username) return;

    if (editingUser) {
      // Update
      const updated = users.map((u) =>
        u.id === editingUser.id ? ({ ...u, ...formData } as User) : u
      );
      onUpdateUsers(updated);
    } else {
      // Create new
      const newUser: User = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        role: 'member',
        joinedDate: new Date().toISOString().split('T')[0],
        fullName: formData.fullName || '',
        username: formData.username || '',
        password: formData.password || 'siswa123',
        className: formData.className || '5A',
        gender: (formData.gender as 'L' | 'P') || 'L',
        birthPlace: formData.birthPlace || 'Palembang',
        birthDate: formData.birthDate || '2015-01-01',
        phone: formData.phone || '',
        address: formData.address || '',
        photoUrl: formData.photoUrl || '',
        positionOrLevel: formData.positionOrLevel || 'PMR Mula',
        nis: formData.nis || `2024.${members.length + 1}`,
        emergencyContact: formData.emergencyContact || '',
      };
      onUpdateUsers([...users, newUser]);
    }

    setIsAddEditOpen(false);
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus anggota PMR "${name}"?`)) {
      onUpdateUsers(users.filter((u) => u.id !== id));
    }
  };

  // Download all member photos as ZIP archive
  const handleDownloadAllPhotosZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('Foto_Anggota_PMR');

      for (const m of members) {
        if (m.photoUrl && m.photoUrl.startsWith('data:image/')) {
          const parts = m.photoUrl.split(';base64,');
          if (parts.length === 2 && folder) {
            const ext = parts[0].includes('png') ? 'png' : 'jpg';
            const safeName = (m.username || m.nis || m.fullName).replace(/[^a-zA-Z0-9_-]/g, '_');
            folder.file(`${safeName}.${ext}`, parts[1], { base64: true });
          }
        }
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Foto_Semua_Anggota_PMR_${new Date().toISOString().split('T')[0]}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Gagal mengunduh arsip foto.');
    } finally {
      setIsZipping(false);
    }
  };

  // Export members to Excel / CSV format (with UTF-8 BOM for Excel)
  const handleExportCsv = (filteredOnly: boolean = false) => {
    const listToExport = filteredOnly ? filteredMembers : members;
    if (listToExport.length === 0) {
      alert('Tidak ada data anggota untuk diekspor.');
      return;
    }

    const headers = [
      'No',
      'ID Anggota',
      'NIS/NIP',
      'Nama Lengkap',
      'Kelas',
      'Jenis Kelamin',
      'Tempat Lahir',
      'Tanggal Lahir',
      'No HP/WhatsApp',
      'Alamat',
      'Tingkat PMR',
      'Kontak Darurat',
      'Tanggal Bergabung',
      'Status Foto',
    ];

    const rows = listToExport.map((m, idx) => [
      idx + 1,
      `"${m.id}"`,
      `"${m.nis || ''}"`,
      `"${(m.fullName || '').replace(/"/g, '""')}"`,
      `"${m.className || ''}"`,
      `"${m.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}"`,
      `"${(m.birthPlace || '').replace(/"/g, '""')}"`,
      `"${m.birthDate || ''}"`,
      `"${m.phone || ''}"`,
      `"${(m.address || '').replace(/"/g, '""')}"`,
      `"${m.positionOrLevel || 'PMR Madya'}"`,
      `"${(m.emergencyContact || '').replace(/"/g, '""')}"`,
      `"${m.joinedDate || ''}"`,
      `"${m.photoUrl ? 'Ada Foto' : 'Belum Ada Foto'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const cleanSchool = settings.schoolName.replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `Buku_Induk_Anggota_PMR_${cleanSchool}_${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-600" />
            <span>Buku Induk Anggota PMR ({members.length} Siswa)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Daftar biodata resmi, pas foto 3x4, dan kartu anggota palang merah
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExportCsv(false)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            title="Ekspor seluruh data buku induk anggota ke format CSV / Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel / CSV</span>
          </button>

          <button
            onClick={() => setIsBatchZipOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200 transition-all cursor-pointer"
          >
            <FileArchive className="w-4 h-4" />
            <span>Impor Foto Massal (ZIP)</span>
          </button>

          <button
            onClick={handleDownloadAllPhotosZip}
            disabled={isZipping}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isZipping ? 'Menyiapkan ZIP...' : 'Unduh Semua Foto'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa Baru</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-1 items-center gap-2 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama siswa, NIS, atau kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Kelas:</span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
            >
              <option value="all">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c} value={c}>
                  Kelas {c}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Urut: {sortOrder === 'asc' ? 'A - Z' : 'Z - A'}</span>
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5 w-14 text-center">Foto</th>
                <th className="p-3.5">Nama & NIS</th>
                <th className="p-3.5">Kelas</th>
                <th className="p-3.5">L/P</th>
                <th className="p-3.5">Tempat, Tgl Lahir</th>
                <th className="p-3.5">Kontak / WA</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 text-center">
                    <DriveImage
                      src={member.photoUrl}
                      alt={member.fullName}
                      className="w-10 h-12 object-cover rounded-lg border border-slate-300 mx-auto shadow-2xs"
                      fallbackType="avatar"
                    />
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{member.fullName}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      NIS: {member.nis} • @{member.username}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700">
                      {member.className}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-600">
                    {member.gender === 'L' ? 'L' : 'P'}
                  </td>
                  <td className="p-3 text-slate-600">
                    {member.birthPlace}, {member.birthDate}
                  </td>
                  <td className="p-3 text-slate-600 font-mono">
                    {member.phone || member.emergencyContact || '-'}
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => setPreviewKtaUser(member)}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                        title="Lihat KTA Digital"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(member)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                        title="Edit Data Siswa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(member.id, member.fullName)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        title="Hapus Siswa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-xl">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingUser ? 'Edit Data Anggota PMR' : 'Pendaftaran Anggota PMR Baru'}
              </h3>
              <button
                onClick={() => setIsAddEditOpen(false)}
                className="p-2 hover:bg-slate-200 text-slate-500 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
                    placeholder="Contoh: Ahmad Rayhan"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor Induk Siswa (NIS) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
                    placeholder="Contoh: 2024.05.001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas</label>
                  <input
                    type="text"
                    value={formData.className}
                    onChange={(e) =>
                      setFormData({ ...formData, className: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tingkatan PMR
                  </label>
                  <select
                    value={formData.positionOrLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, positionOrLevel: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="PMR Mula">PMR Mula (SD/MI)</option>
                    <option value="PMR Madya">PMR Madya (SMP/MTs)</option>
                    <option value="PMR Wira">PMR Wira (SMA/MA)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) =>
                      setFormData({ ...formData, birthPlace: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Username Akun Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
                    placeholder="ahmad.rayhan"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Password Akun
                  </label>
                  <div className="relative">
                    <input
                      type={showMemberPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full p-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none text-xs"
                      placeholder="siswa123"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMemberPassword(!showMemberPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      title={showMemberPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                    >
                      {showMemberPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Alamat Lengkap
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

              <div>
                <PhotoUpload
                  label="Pas Foto Resmi Siswa (3x4)"
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
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md"
                >
                  Simpan Data Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Individual KTA Preview Modal */}
      {previewKtaUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-2xl p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">
                Pratinjau KTA: {previewKtaUser.fullName}
              </h3>
              <button
                onClick={() => setPreviewKtaUser(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <IDCardPreview user={previewKtaUser} settings={settings} />
          </div>
        </div>
      )}

      {/* Batch Photo Import Modal */}
      <BatchPhotoImportModal
        members={members}
        isOpen={isBatchZipOpen}
        onClose={() => setIsBatchZipOpen(false)}
        onApplyMatches={(updated) => {
          const nonMembers = users.filter((u) => u.role !== 'member');
          onUpdateUsers([...nonMembers, ...updated]);
        }}
      />
    </div>
  );
};
