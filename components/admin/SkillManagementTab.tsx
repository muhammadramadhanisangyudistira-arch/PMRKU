'use client';

import React, { useState } from 'react';
import { DatabaseState, SkillRequest, SkillRequirement, User, PMRLevel } from '@/types/pmr';
import { CertificateModal } from '@/components/idcard/CertificateModal';
import {
  Award,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Printer,
  ShieldCheck,
  Eye,
  HeartPulse,
  Smile,
  Droplet,
  AlertTriangle,
  Users,
  Flame,
  Edit2,
  Plus,
  Trash2,
  X,
  Check,
  Sparkles,
  BookOpen,
  ListOrdered,
  Layers,
} from 'lucide-react';

interface SkillManagementTabProps {
  db: DatabaseState;
  onUpdateDb: (newDb: DatabaseState) => void;
}

export const SkillManagementTab: React.FC<SkillManagementTabProps> = ({
  db,
  onUpdateDb,
}) => {
  const [selectedRequest, setSelectedRequest] = useState<SkillRequest | null>(null);
  const [certRequest, setCertRequest] = useState<SkillRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Standar Kompetensi Edit & View Modals
  const [editingRequirement, setEditingRequirement] = useState<SkillRequirement | null>(null);
  const [viewingRequirement, setViewingRequirement] = useState<SkillRequirement | null>(null);
  const [isNewRequirement, setIsNewRequirement] = useState(false);

  // Form State for Editing/Creating SkillRequirement
  const [reqForm, setReqForm] = useState<Partial<SkillRequirement>>({
    name: '',
    level: 'Semua',
    category: 'Pertolongan Pertama',
    description: '',
    standards: [''],
    badgeIcon: 'HeartPulse',
    badgeColor: 'rose',
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const members = db.users.filter((u) => u.role === 'member');

  const filteredRequests = db.skillRequests.filter((req) => {
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        req.studentName.toLowerCase().includes(q) ||
        req.requirementName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse':
        return HeartPulse;
      case 'ShieldCheck':
        return ShieldCheck;
      case 'Smile':
        return Smile;
      case 'Droplet':
        return Droplet;
      case 'AlertTriangle':
        return AlertTriangle;
      case 'Users':
        return Users;
      case 'BookOpen':
        return BookOpen;
      case 'Award':
        return Award;
      case 'Sparkles':
        return Sparkles;
      case 'Flame':
      default:
        return Flame;
    }
  };

  const getBadgeColorClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return { bg: 'bg-emerald-100 text-emerald-700 border-emerald-300', dot: 'bg-emerald-600' };
      case 'sky':
      case 'blue':
        return { bg: 'bg-sky-100 text-sky-700 border-sky-300', dot: 'bg-sky-600' };
      case 'purple':
        return { bg: 'bg-purple-100 text-purple-700 border-purple-300', dot: 'bg-purple-600' };
      case 'amber':
      case 'yellow':
        return { bg: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-600' };
      case 'red':
      case 'rose':
      default:
        return { bg: 'bg-rose-100 text-rose-700 border-rose-300', dot: 'bg-rose-600' };
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (req: SkillRequirement) => {
    setIsNewRequirement(false);
    setEditingRequirement(req);
    setReqForm({
      id: req.id,
      name: req.name,
      level: req.level,
      category: req.category,
      description: req.description,
      standards: req.standards && req.standards.length > 0 ? [...req.standards] : [''],
      badgeIcon: req.badgeIcon || 'HeartPulse',
      badgeColor: req.badgeColor || 'rose',
    });
  };

  // Open New SKK Modal
  const handleOpenAddNew = () => {
    setIsNewRequirement(true);
    const newId = `SKK-${String(db.skillRequirements.length + 1).padStart(3, '0')}`;
    const initialReq: SkillRequirement = {
      id: newId,
      name: 'SKK Baru PMR',
      level: 'Semua',
      category: 'Pertolongan Pertama',
      description: 'Mampu mempraktikkan keterampilan dasar sesuai standar kepalangmerahan.',
      standards: [
        'Memahami konsep dan teori dasar materi',
        'Mampu mempraktikkan keterampilan lapangan secara mandiri',
      ],
      badgeIcon: 'Award',
      badgeColor: 'purple',
    };
    setEditingRequirement(initialReq);
    setReqForm(initialReq);
  };

  // Add standard bullet
  const handleAddStandardItem = () => {
    const currentStandards = reqForm.standards || [];
    setReqForm({
      ...reqForm,
      standards: [...currentStandards, ''],
    });
  };

  // Update standard bullet text
  const handleUpdateStandardItem = (index: number, val: string) => {
    const currentStandards = [...(reqForm.standards || [])];
    currentStandards[index] = val;
    setReqForm({
      ...reqForm,
      standards: currentStandards,
    });
  };

  // Remove standard bullet
  const handleRemoveStandardItem = (index: number) => {
    const currentStandards = [...(reqForm.standards || [])];
    if (currentStandards.length <= 1) {
      alert('Minimal harus ada 1 butir standar kompetensi.');
      return;
    }
    currentStandards.splice(index, 1);
    setReqForm({
      ...reqForm,
      standards: currentStandards,
    });
  };

  // Save changes to SkillRequirement
  const handleSaveRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqForm.name?.trim()) {
      alert('Nama kecakapan (SKK) wajib diisi.');
      return;
    }

    const cleanStandards = (reqForm.standards || [])
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (cleanStandards.length === 0) {
      alert('Harap masukkan setidaknya 1 butir standar kompetensi kelulusan.');
      return;
    }

    const updatedReq: SkillRequirement = {
      id: reqForm.id || `SKK-${Date.now()}`,
      name: reqForm.name.trim(),
      level: (reqForm.level as PMRLevel | 'Semua') || 'Semua',
      category: reqForm.category || 'Pertolongan Pertama',
      description: reqForm.description?.trim() || '',
      standards: cleanStandards,
      badgeIcon: reqForm.badgeIcon || 'Award',
      badgeColor: reqForm.badgeColor || 'purple',
    };

    let updatedList: SkillRequirement[];
    if (isNewRequirement) {
      updatedList = [...db.skillRequirements, updatedReq];
    } else {
      updatedList = db.skillRequirements.map((r) =>
        r.id === updatedReq.id ? updatedReq : r
      );
    }

    onUpdateDb({
      ...db,
      skillRequirements: updatedList,
    });

    setEditingRequirement(null);
    showToast(`Standar kompetensi "${updatedReq.name}" berhasil disimpan!`);
  };

  // Delete an SKK (with confirmation)
  const handleDeleteRequirement = (reqId: string, reqName: string) => {
    if (db.skillRequirements.length <= 1) {
      alert('Tidak dapat menghapus seluruh bidang SKK.');
      return;
    }
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus "${reqName}"? Data pengajuan SKK terkait tidak akan terhapus namun kategori standar akan dihilangkan.`
      )
    ) {
      const updatedList = db.skillRequirements.filter((r) => r.id !== reqId);
      onUpdateDb({
        ...db,
        skillRequirements: updatedList,
      });
      showToast(`Bidang SKK "${reqName}" berhasil dihapus.`);
    }
  };

  const certUser = certRequest
    ? db.users.find((u) => u.id === certRequest.userId) || members[0]
    : null;

  const certRequirement = certRequest
    ? db.skillRequirements.find((r) => r.id === certRequest.requirementId)
    : undefined;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-700 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/50 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span>Uji Syarat Kecakapan Khusus (SKK / TKK PMR)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Standar kompetensi 7 materi pokok Palang Merah Remaja, pemantauan kelulusan, dan penerbitan Piagam Digital
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenAddNew}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Bidang SKK Baru</span>
          </button>
          <div className="px-3 py-2 bg-purple-50 text-purple-700 font-bold text-xs rounded-xl border border-purple-200">
            {db.skillRequests.filter((r) => r.status === 'Approved').length} Lulus •{' '}
            {db.skillRequests.filter((r) => r.status === 'Pending').length} Menunggu Verifikasi
          </div>
        </div>
      </div>

      {/* SKK Master Standards Grid with Edit Capabilities */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Standar Kompetensi 7 Bidang Kecakapan Khusus (Kurikulum PMI)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik tombol <strong>Edit Standar</strong> pada kartu di bawah untuk mengubah butir penilaian dan kriteria kelulusan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {db.skillRequirements.map((req) => {
            const Icon = getBadgeIcon(req.badgeIcon);
            const colorInfo = getBadgeColorClasses(req.badgeColor);
            const passedCount = db.skillRequests.filter(
              (r) => r.requirementId === req.id && r.status === 'Approved'
            ).length;

            return (
              <div
                key={req.id}
                className="p-4 bg-slate-50 hover:bg-white hover:shadow-md rounded-2xl border border-slate-200 hover:border-purple-300 transition-all flex flex-col justify-between group relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl ${colorInfo.bg} flex items-center justify-center shrink-0 border`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-black text-slate-900 leading-tight block truncate max-w-[140px]">
                          {req.name}
                        </span>
                        <span className="text-[10px] text-purple-700 font-bold uppercase">
                          {req.category}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(req)}
                      className="p-1.5 bg-white hover:bg-purple-50 text-slate-400 hover:text-purple-700 border border-slate-200 rounded-lg transition-all cursor-pointer"
                      title="Edit Standar Kompetensi ini"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {req.description}
                  </p>

                  {/* Standards Checklist Preview */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-between">
                      <span>Standar Kelulusan ({req.standards?.length || 0} Butir):</span>
                    </div>
                    <div className="space-y-1 pt-0.5">
                      {req.standards && req.standards.slice(0, 2).map((st, sIdx) => (
                        <div key={sIdx} className="text-[10.5px] text-slate-600 flex items-start gap-1.5 leading-snug">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{st}</span>
                        </div>
                      ))}
                      {(req.standards?.length || 0) > 2 && (
                        <div className="text-[10px] text-purple-600 font-semibold italic">
                          +{req.standards.length - 2} butir standar lainnya...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{passedCount} Lulus</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingRequirement(req)}
                      className="px-2 py-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
                    >
                      Lihat Detail
                    </button>
                    <button
                      onClick={() => handleOpenEdit(req)}
                      className="px-2 py-1 text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg cursor-pointer"
                    >
                      Edit Standar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama siswa atau nama kecakapan (SKK)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({db.skillRequests.length})
            </button>
            <button
              onClick={() => setStatusFilter('Pending')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                statusFilter === 'Pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pending ({db.skillRequests.filter((r) => r.status === 'Pending').length})
            </button>
            <button
              onClick={() => setStatusFilter('Approved')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                statusFilter === 'Approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Lulus ({db.skillRequests.filter((r) => r.status === 'Approved').length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Nama Siswa</th>
                <th className="p-3.5">Uji Kecakapan (SKK)</th>
                <th className="p-3.5">Tanggal Ajuan</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Nilai & Penguji</th>
                <th className="p-3.5 text-right">Aksi & Piagam</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Tidak ada data pengajuan SKK yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">
                      {req.studentName}
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">
                      {req.requirementName}
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono">
                      {req.requestedDate}
                    </td>
                    <td className="p-3.5">
                      {req.status === 'Approved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Lulus Uji</span>
                        </span>
                      )}
                      {req.status === 'Pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" />
                          <span>Menunggu Uji</span>
                        </span>
                      )}
                      {req.status === 'Rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3" />
                          <span>Perlu Revisi</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {req.score ? (
                        <div>
                          <span className="font-bold text-slate-900 text-xs">
                            {req.score} / 100
                          </span>
                          <div className="text-[10px] text-slate-500">
                            Oleh: {req.validatedBy}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Belum dinilai</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        {req.status === 'Approved' && (
                          <button
                            onClick={() => setCertRequest(req)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold cursor-pointer shadow-2xs"
                            title="Cetak Piagam TKK Digital"
                          >
                            <Printer className="w-3.5 h-3.5 text-amber-600" />
                            <span>Cetak Piagam</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL EDIT / TAMBAH STANDAR KOMPETENSI SKK                                */}
      {/* ========================================================================= */}
      {editingRequirement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 text-purple-700 rounded-2xl">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {isNewRequirement ? 'Tambah Standar SKK Baru' : 'Edit Standar Kompetensi SKK'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kriteria kelulusan dan butir uji kecakapan khusus PMR
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingRequirement(null)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveRequirement} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama SKK */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Kecakapan Khusus (SKK) *
                  </label>
                  <input
                    type="text"
                    required
                    value={reqForm.name}
                    onChange={(e) => setReqForm({ ...reqForm, name: e.target.value })}
                    placeholder="Contoh: SKK Pertolongan Pertama"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                {/* Kategori Bidang */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kategori Bidang Materi PMI
                  </label>
                  <select
                    value={reqForm.category}
                    onChange={(e) => setReqForm({ ...reqForm, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="Pertolongan Pertama">Pertolongan Pertama (PP)</option>
                    <option value="Perawatan Keluarga">Perawatan Keluarga (PK)</option>
                    <option value="Gerakan Kepalangmerahan">Gerakan Kepalangmerahan</option>
                    <option value="Remaja Sehat Peduli Sesama">Remaja Sehat Peduli Sesama (RSPS)</option>
                    <option value="Donor Darah">Donor Darah (DORAS)</option>
                    <option value="Kesiapsiagaan Bencana">Kesiapsiagaan Bencana (Ayo Siaga Bencana)</option>
                    <option value="Kepemimpinan">Kepemimpinan & Organisasi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Tingkat PMR */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tingkat PMR
                  </label>
                  <select
                    value={reqForm.level}
                    onChange={(e) => setReqForm({ ...reqForm, level: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="Semua">Semua Tingkat (Mula/Madya/Wira)</option>
                    <option value="mula">PMR Mula (SD/MI)</option>
                    <option value="madya">PMR Madya (SMP/MTs)</option>
                    <option value="wira">PMR Wira (SMA/SMK/MA)</option>
                  </select>
                </div>

                {/* Ikon Lencana */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ikon Lencana
                  </label>
                  <select
                    value={reqForm.badgeIcon}
                    onChange={(e) => setReqForm({ ...reqForm, badgeIcon: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="HeartPulse">HeartPulse (Pertolongan Pertama)</option>
                    <option value="ShieldCheck">ShieldCheck (Perawatan Keluarga)</option>
                    <option value="Flame">Flame (Gerakan / Kemanusiaan)</option>
                    <option value="Smile">Smile (Remaja Sehat)</option>
                    <option value="Droplet">Droplet (Donor Darah)</option>
                    <option value="AlertTriangle">AlertTriangle (Siaga Bencana)</option>
                    <option value="Users">Users (Kepemimpinan)</option>
                    <option value="Award">Award (Lencana Umum)</option>
                  </select>
                </div>

                {/* Warna Lencana */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Warna Lencana
                  </label>
                  <select
                    value={reqForm.badgeColor}
                    onChange={(e) => setReqForm({ ...reqForm, badgeColor: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="rose">Merah / Rose</option>
                    <option value="emerald">Hijau / Emerald</option>
                    <option value="purple">Ungu / Purple</option>
                    <option value="sky">Biru / Sky</option>
                    <option value="amber">Kuning / Amber</option>
                  </select>
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deskripsi Ringkas Bidang Kecakapan
                </label>
                <textarea
                  rows={2}
                  value={reqForm.description}
                  onChange={(e) => setReqForm({ ...reqForm, description: e.target.value })}
                  placeholder="Penjelasan ringkas kompetensi yang dinilai..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* STANDAR KOMPETENSI / INDIKATOR BUTIR PENILAIAN */}
              <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-purple-700" />
                    <span className="font-bold text-xs text-purple-950">
                      Butir Standar Kompetensi & Indikator Kelulusan:
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddStandardItem}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px] shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Butir Standar</span>
                  </button>
                </div>

                <p className="text-[11px] text-purple-900/80 leading-relaxed">
                  Siswa wajib memenuhi butir-butir standar kompetensi ini saat diuji oleh Pembina PMR agar berhak mendapatkan Piagam dan Lencana SKK.
                </p>

                <div className="space-y-2 pt-1">
                  {reqForm.standards && reqForm.standards.map((st, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-white border border-purple-200 flex items-center justify-center font-bold text-purple-800 text-xs shrink-0 shadow-2xs">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        required
                        value={st}
                        onChange={(e) => handleUpdateStandardItem(idx, e.target.value)}
                        placeholder={`Contoh butir ${idx + 1}: Mampu mempraktikkan...`}
                        className="flex-1 p-2 bg-white border border-purple-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveStandardItem(idx)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        title="Hapus butir ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                {!isNewRequirement && reqForm.id && (
                  <button
                    type="button"
                    onClick={() => handleDeleteRequirement(reqForm.id!, reqForm.name || '')}
                    className="px-3.5 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Hapus SKK Ini
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setEditingRequirement(null)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan Standar Kompetensi</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL VIEW DETAIL STANDAR KOMPETENSI                                      */}
      {/* ========================================================================= */}
      {viewingRequirement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 text-purple-700 rounded-2xl">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {viewingRequirement.name}
                  </h3>
                  <p className="text-xs text-purple-700 font-bold">
                    Kategori: {viewingRequirement.category} • Tingkat {viewingRequirement.level}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingRequirement(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="font-bold text-slate-900 mb-1 text-[11px] uppercase tracking-wider text-slate-400">
                  Deskripsi Materi:
                </div>
                <p className="leading-relaxed text-slate-600">{viewingRequirement.description}</p>
              </div>

              <div>
                <div className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs">
                  <ListOrdered className="w-4 h-4 text-purple-600" />
                  <span>Daftar Lengkap Standar Kompetensi Kelulusan:</span>
                </div>
                <div className="space-y-2">
                  {viewingRequirement.standards && viewingRequirement.standards.map((st, idx) => (
                    <div key={idx} className="p-2.5 bg-purple-50/60 rounded-xl border border-purple-200/80 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-md bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800 leading-snug">{st}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  const reqToEdit = viewingRequirement;
                  setViewingRequirement(null);
                  handleOpenEdit(reqToEdit);
                }}
                className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 cursor-pointer flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Butir Standar Ini</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingRequirement(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {certRequest && certUser && (
        <CertificateModal
          user={certUser}
          skillRequest={certRequest}
          requirement={certRequirement}
          settings={db.settings}
          isOpen={true}
          onClose={() => setCertRequest(null)}
        />
      )}
    </div>
  );
};
