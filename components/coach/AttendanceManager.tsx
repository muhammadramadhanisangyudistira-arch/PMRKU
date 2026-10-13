'use client';

import React, { useState } from 'react';
import { DatabaseState, AttendanceSession, AttendanceRecord, User } from '@/types/pmr';
import { DriveImage } from '@/components/common/DriveImage';
import {
  CalendarCheck,
  Plus,
  QrCode,
  CheckCircle,
  Clock,
  Printer,
  Download,
  X,
  Check,
  Camera,
  UserCheck,
  FileSpreadsheet,
} from 'lucide-react';

interface AttendanceManagerProps {
  db: DatabaseState;
  onUpdateDb: (newDb: DatabaseState) => void;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  db,
  onUpdateDb,
}) => {
  const members = db.users.filter((u) => u.role === 'member');
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    db.attendanceSessions[0]?.id || ''
  );
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [viewSelfieUrl, setViewSelfieUrl] = useState<string | null>(null);

  // New Session Form State
  const [newSessionForm, setNewSessionForm] = useState<Partial<AttendanceSession>>({
    title: 'Latihan Rutin: P3K & Balut Bidai',
    date: new Date().toISOString().split('T')[0],
    startTime: '14:30',
    endTime: '16:30',
    type: 'Rutin',
    notes: 'Pertemuan rutin mingguan di ruang UKS & Lapangan madrasah.',
  });

  const currentSession =
    db.attendanceSessions.find((s) => s.id === selectedSessionId) ||
    db.attendanceSessions[0];

  const sessionRecords = db.attendanceRecords.filter(
    (r) => r.sessionId === currentSession?.id
  );

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionForm.title) return;

    const newId = `SES-${Date.now().toString().slice(-4)}`;
    const newSession: AttendanceSession = {
      id: newId,
      title: newSessionForm.title || 'Latihan Rutin PMR',
      date: newSessionForm.date || new Date().toISOString().split('T')[0],
      startTime: newSessionForm.startTime || '14:00',
      endTime: newSessionForm.endTime || '16:00',
      type: (newSessionForm.type as 'Rutin' | 'Khusus' | 'Latsar') || 'Rutin',
      qrSecret: `PMR-${newId}-${Date.now().toString().slice(-4)}`,
      isActive: true,
      notes: newSessionForm.notes || '',
    };

    const updatedSessions = [newSession, ...db.attendanceSessions];
    onUpdateDb({
      ...db,
      attendanceSessions: updatedSessions,
    });

    setSelectedSessionId(newId);
    setIsNewSessionModalOpen(false);
  };

  const handleToggleSessionActive = (sessionId: string) => {
    const updated = db.attendanceSessions.map((s) =>
      s.id === sessionId ? { ...s, isActive: !s.isActive } : s
    );
    onUpdateDb({ ...db, attendanceSessions: updated });
  };

  const handleSetAttendanceStatus = (
    member: User,
    status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa'
  ) => {
    if (!currentSession) return;

    const existingIdx = db.attendanceRecords.findIndex(
      (r) => r.sessionId === currentSession.id && r.userId === member.id
    );

    let updatedRecords = [...db.attendanceRecords];

    if (existingIdx !== -1) {
      updatedRecords[existingIdx] = {
        ...updatedRecords[existingIdx],
        status,
        time: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    } else {
      const newRec: AttendanceRecord = {
        id: `ATT-${currentSession.id}-${member.id}`,
        sessionId: currentSession.id,
        userId: member.id,
        userName: member.fullName,
        role: 'member',
        date: currentSession.date,
        time: '14:00',
        status,
        type: 'Checklist',
      };
      updatedRecords.push(newRec);
    }

    onUpdateDb({ ...db, attendanceRecords: updatedRecords });
  };

  // Ekspor Rekap Sesi Saat Ini (.CSV dengan UTF-8 BOM untuk Excel)
  const handleExportCsv = () => {
    if (!currentSession) return;

    const headers = ['No', 'Nama Siswa', 'NIS', 'Kelas', 'Status Kehadiran', 'Metode Presensi', 'Waktu'];
    const rows = members.map((m, idx) => {
      const rec = sessionRecords.find((r) => r.userId === m.id);
      const status = rec ? rec.status : 'Alpa';
      const type = rec ? rec.type : '-';
      const time = rec ? rec.time : '-';
      return [
        idx + 1,
        `"${m.fullName.replace(/"/g, '""')}"`,
        `"${m.nis || ''}"`,
        `"${m.className || ''}"`,
        `"${status}"`,
        `"${type}"`,
        `"${time}"`,
      ];
    });

    const meta = [
      `"REKAP PRESENSI LATIHAN PMR: ${currentSession.title.replace(/"/g, '""')}"`,
      `"Tanggal: ${currentSession.date} (${currentSession.startTime} - ${currentSession.endTime} WIB) | Kategori: ${currentSession.type}"`,
      `"Sekolah: ${db.settings.schoolName.replace(/"/g, '""')}"`,
      '',
    ];

    const csvContent = [...meta, headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Presensi_PMR_${currentSession.date}_${currentSession.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Ekspor Rekapitulasi Seluruh Sesi (Matrix Excel / CSV)
  const handleExportAllSessionsMatrix = () => {
    if (db.attendanceSessions.length === 0) {
      alert('Belum ada sesi presensi untuk diekspor.');
      return;
    }

    const sessionsSorted = [...db.attendanceSessions].sort((a, b) => a.date.localeCompare(b.date));
    
    // Header columns: No, Nama Lengkap, NIS, Kelas, [Session 1, Session 2...], Total Hadir, Izin, Sakit, Alpa, Persentase
    const sessionHeaders = sessionsSorted.map((s) => `"${s.date} (${s.title.replace(/"/g, '""')})"`);
    const headers = [
      'No',
      'Nama Lengkap',
      'NIS',
      'Kelas',
      ...sessionHeaders,
      'Total Hadir',
      'Total Izin',
      'Total Sakit',
      'Total Alpa',
      'Persentase Kehadiran (%)',
    ];

    const rows = members.map((m, idx) => {
      let hadirCount = 0;
      let izinCount = 0;
      let sakitCount = 0;
      let alpaCount = 0;

      const sessionStatuses = sessionsSorted.map((s) => {
        const rec = db.attendanceRecords.find((r) => r.sessionId === s.id && r.userId === m.id);
        const status = rec ? rec.status : 'Alpa';
        if (status === 'Hadir') hadirCount++;
        else if (status === 'Izin') izinCount++;
        else if (status === 'Sakit') sakitCount++;
        else alpaCount++;
        return `"${status}"`;
      });

      const totalSessions = sessionsSorted.length;
      const percentage = totalSessions > 0 ? Math.round((hadirCount / totalSessions) * 100) : 0;

      return [
        idx + 1,
        `"${m.fullName.replace(/"/g, '""')}"`,
        `"${m.nis || ''}"`,
        `"${m.className || ''}"`,
        ...sessionStatuses,
        hadirCount,
        izinCount,
        sakitCount,
        alpaCount,
        `"${percentage}%"`,
      ];
    });

    const meta = [
      `"REKAPITULASI KEHADIRAN LATIHAN PMR (SELURUH SESI)"`,
      `"Sekolah: ${db.settings.schoolName.replace(/"/g, '""')} | Total Sesi: ${sessionsSorted.length} Pertemuan"`,
      `"Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID')}"`,
      '',
    ];

    const csvContent = [...meta, headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanSchool = db.settings.schoolName.replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `Matriks_Rekap_Presensi_PMR_${cleanSchool}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-rose-600" />
            <span>Presensi & Absensi Latihan Rutin</span>
          </h2>
          <p className="text-xs text-slate-500">
            Pencatatan kehadiran anggota binaan melalui checklist cepat, barcode QR, atau foto selfie mandiri
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportAllSessionsMatrix}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            title="Ekspor rekapitulasi kehadiran seluruh sesi latihan ke format tabel Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Rekapitulasi (Excel / CSV)</span>
          </button>

          <button
            onClick={() => setIsNewSessionModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Sesi Latihan Baru</span>
          </button>
        </div>
      </div>

      {/* Session Selector & Details Card */}
      {currentSession && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500">Pilih Sesi:</span>
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              >
                {db.attendanceSessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.date} - {s.title} ({s.isActive ? 'Aktif' : 'Selesai'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleSessionActive(currentSession.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentSession.isActive
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {currentSession.isActive ? '● Sedang Dibuka' : '○ Sesi Ditutup'}
              </button>

              <button
                onClick={() => setShowQrModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                <QrCode className="w-4 h-4 text-slate-600" />
                <span>Tampilkan QR Presensi</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                title="Ekspor kehadiran sesi ini ke CSV"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Ekspor Sesi Ini</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Tanggal</span>
              <p className="font-bold text-slate-800 mt-0.5">{currentSession.date}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Waktu Latihan</span>
              <p className="font-bold text-slate-800 mt-0.5">
                {currentSession.startTime} - {currentSession.endTime} WIB
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Kategori Sesi</span>
              <p className="font-bold text-rose-700 mt-0.5">{currentSession.type}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <span className="text-[10px] text-emerald-600 font-bold uppercase">Kehadiran</span>
              <p className="font-bold text-emerald-900 mt-0.5">
                {sessionRecords.filter((r) => r.status === 'Hadir').length} dari {members.length} Siswa
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Checklist Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
            Daftar Checklist Kehadiran Siswa
          </h3>
          <span className="text-xs text-slate-500">
            Klik tombol status untuk mengubah kehadiran secara instan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5 w-14 text-center">Foto</th>
                <th className="p-3.5">Nama Lengkap & NIS</th>
                <th className="p-3.5">Kelas</th>
                <th className="p-3.5">Metode / Jam</th>
                <th className="p-3.5">Foto Bukti</th>
                <th className="p-3.5 text-center">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => {
                const rec = sessionRecords.find((r) => r.userId === member.id);
                const currentStatus = rec ? rec.status : 'Alpa';

                return (
                  <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 text-center">
                      <DriveImage
                        src={member.photoUrl}
                        alt={member.fullName}
                        className="w-9 h-11 object-cover rounded-lg border border-slate-300 mx-auto"
                        fallbackType="avatar"
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{member.fullName}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        NIS: {member.nis}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                        {member.className}
                      </span>
                    </td>
                    <td className="p-3">
                      {rec ? (
                        <div>
                          <span className="font-semibold text-slate-800">{rec.type}</span>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {rec.time} WIB
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Belum mengisi</span>
                      )}
                    </td>
                    <td className="p-3">
                      {rec?.selfieUrl ? (
                        <button
                          onClick={() => setViewSelfieUrl(rec.selfieUrl || null)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold"
                        >
                          <Camera className="w-3 h-3" />
                          <span>Lihat Selfie</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleSetAttendanceStatus(member, 'Hadir')}
                          className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                            currentStatus === 'Hadir'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-emerald-50 text-slate-600'
                          }`}
                        >
                          Hadir
                        </button>
                        <button
                          onClick={() => handleSetAttendanceStatus(member, 'Izin')}
                          className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-all ${
                            currentStatus === 'Izin'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-blue-50 text-slate-600'
                          }`}
                        >
                          Izin
                        </button>
                        <button
                          onClick={() => handleSetAttendanceStatus(member, 'Sakit')}
                          className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-all ${
                            currentStatus === 'Sakit'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-amber-50 text-slate-600'
                          }`}
                        >
                          Sakit
                        </button>
                        <button
                          onClick={() => handleSetAttendanceStatus(member, 'Alpa')}
                          className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-all ${
                            currentStatus === 'Alpa'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-red-50 text-slate-600'
                          }`}
                        >
                          Alpa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Session Modal */}
      {isNewSessionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-md">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                Buat Sesi Latihan Baru
              </h3>
              <button
                onClick={() => setIsNewSessionModalOpen(false)}
                className="p-2 hover:bg-slate-200 text-slate-500 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Judul Pertemuan / Materi Latihan *
                </label>
                <input
                  type="text"
                  required
                  value={newSessionForm.title}
                  onChange={(e) =>
                    setNewSessionForm({ ...newSessionForm, title: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  placeholder="Contoh: Praktik Pembalutan & Tandu Darurat"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tanggal Kegiatan
                  </label>
                  <input
                    type="date"
                    value={newSessionForm.date}
                    onChange={(e) =>
                      setNewSessionForm({ ...newSessionForm, date: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tipe Latihan
                  </label>
                  <select
                    value={newSessionForm.type}
                    onChange={(e) =>
                      setNewSessionForm({
                        ...newSessionForm,
                        type: e.target.value as any,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="Rutin">Rutin Mingguan</option>
                    <option value="Khusus">Latihan Khusus / Ujian</option>
                    <option value="Latsar">Latsar / Pelantikan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    value={newSessionForm.startTime}
                    onChange={(e) =>
                      setNewSessionForm({
                        ...newSessionForm,
                        startTime: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={newSessionForm.endTime}
                    onChange={(e) =>
                      setNewSessionForm({
                        ...newSessionForm,
                        endTime: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan / Instruksi Peralatan
                </label>
                <textarea
                  rows={2}
                  value={newSessionForm.notes}
                  onChange={(e) =>
                    setNewSessionForm({ ...newSessionForm, notes: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  placeholder="Bawa mitela dan perlengkapan P3K regu..."
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewSessionModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md"
                >
                  Buka Sesi Latihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal Display */}
      {showQrModal && currentSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                QR Presensi Kehadiran Siswa
              </h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center">
              {/* Simulated QR Code SVG */}
              <div className="p-4 bg-white rounded-xl shadow-xs border border-slate-200">
                <svg
                  className="w-44 h-44"
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer markers */}
                  <rect x="5" y="5" width="25" height="25" fill="#dc2626" rx="3" />
                  <rect x="10" y="10" width="15" height="15" fill="#ffffff" />
                  <rect x="14" y="14" width="7" height="7" fill="#dc2626" />

                  <rect x="70" y="5" width="25" height="25" fill="#dc2626" rx="3" />
                  <rect x="75" y="10" width="15" height="15" fill="#ffffff" />
                  <rect x="79" y="14" width="7" height="7" fill="#dc2626" />

                  <rect x="5" y="70" width="25" height="25" fill="#dc2626" rx="3" />
                  <rect x="10" y="75" width="15" height="15" fill="#ffffff" />
                  <rect x="14" y="79" width="7" height="7" fill="#dc2626" />

                  {/* Random QR code pixels pattern */}
                  <rect x="35" y="10" width="5" height="5" fill="#1e293b" />
                  <rect x="45" y="15" width="5" height="5" fill="#1e293b" />
                  <rect x="55" y="10" width="5" height="5" fill="#1e293b" />
                  <rect x="40" y="30" width="20" height="20" fill="#dc2626" rx="2" />
                  <rect x="45" y="35" width="10" height="10" fill="#ffffff" />
                  <rect x="10" y="40" width="5" height="5" fill="#1e293b" />
                  <rect x="20" y="45" width="5" height="5" fill="#1e293b" />
                  <rect x="70" y="40" width="15" height="5" fill="#1e293b" />
                  <rect x="75" y="55" width="5" height="10" fill="#1e293b" />
                  <rect x="35" y="65" width="10" height="5" fill="#1e293b" />
                  <rect x="55" y="70" width="5" height="15" fill="#1e293b" />
                  <rect x="70" y="75" width="10" height="10" fill="#1e293b" />
                </svg>
              </div>

              <div className="mt-3 text-xs font-mono font-bold text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200">
                {currentSession.qrSecret}
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Tampilkan layar ini kepada siswa atau cetak kode di atas saat latihan dimulai.
            </p>
          </div>
        </div>
      )}

      {/* Selfie Preview Modal */}
      {viewSelfieUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-sm w-full text-center space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-xs">Foto Selfie Presensi</h3>
              <button
                onClick={() => setViewSelfieUrl(null)}
                className="p-1 hover:bg-slate-100 rounded text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={viewSelfieUrl}
              alt="Selfie Presensi"
              className="w-full h-72 object-cover rounded-xl border border-slate-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};
