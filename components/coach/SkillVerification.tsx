'use client';

import React, { useState } from 'react';
import { DatabaseState, SkillRequest, User } from '@/types/pmr';
import { DriveImage } from '@/components/common/DriveImage';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileCheck,
  Check,
  X,
  Star,
} from 'lucide-react';

interface SkillVerificationProps {
  db: DatabaseState;
  currentUser: User;
  onUpdateDb: (newDb: DatabaseState) => void;
}

export const SkillVerification: React.FC<SkillVerificationProps> = ({
  db,
  currentUser,
  onUpdateDb,
}) => {
  const [selectedReq, setSelectedReq] = useState<SkillRequest | null>(null);
  const [score, setScore] = useState<number>(95);
  const [notes, setNotes] = useState<string>('');

  const pendingRequests = db.skillRequests.filter((r) => r.status === 'Pending');
  const pastRequests = db.skillRequests.filter((r) => r.status !== 'Pending');

  const handleOpenReview = (req: SkillRequest) => {
    setSelectedReq(req);
    setScore(req.score || 90);
    setNotes(
      req.examinerNotes ||
        'Lulus dengan predikat sangat baik. Memahami prinsip materi dan praktik cekatan.'
    );
  };

  const handleExecuteApproval = (status: 'Approved' | 'Rejected') => {
    if (!selectedReq) return;

    const updated = db.skillRequests.map((r) =>
      r.id === selectedReq.id
        ? {
            ...r,
            status,
            score: status === 'Approved' ? Number(score) : null,
            examinerNotes: notes,
            validatedBy: currentUser.fullName,
          }
        : r
    );

    onUpdateDb({ ...db, skillRequests: updated });
    setSelectedReq(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span>Verifikasi & Pengesahan Uji Kecakapan (SKK / TKK)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Pemeriksaan portofolio praktik mandiri siswa dan pengesahan penerbitan lencana digital
          </p>
        </div>

        <div className="px-3.5 py-1.5 bg-purple-50 text-purple-800 font-bold text-xs rounded-xl border border-purple-200">
          {pendingRequests.length} Pengajuan Perlu Diverifikasi
        </div>
      </div>

      {/* Pending Requests Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-amber-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Pengajuan Masuk (Menunggu Verifikasi Pembina)</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {pendingRequests.length} Siswa
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            Tidak ada pengajuan uji kecakapan yang pending saat ini.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {req.studentName}
                    </h4>
                    <p className="text-xs font-semibold text-purple-700 mt-0.5">
                      {req.requirementName}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Diajukan pada: {req.requestedDate}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenReview(req)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Uji & Periksa Berkas</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Verified Requests Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Riwayat Pengesahan SKK Siswa</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {pastRequests.length} Riwayat
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Nama Siswa</th>
                <th className="p-3">Syarat Kecakapan</th>
                <th className="p-3">Status</th>
                <th className="p-3">Nilai</th>
                <th className="p-3">Penguji</th>
                <th className="p-3">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pastRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/70">
                  <td className="p-3 font-bold text-slate-900">{req.studentName}</td>
                  <td className="p-3 font-semibold text-slate-700">{req.requirementName}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {req.status === 'Approved' ? 'Lulus Uji' : 'Perlu Revisi'}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-900">
                    {req.score ? `${req.score} / 100` : '-'}
                  </td>
                  <td className="p-3 text-slate-600">{req.validatedBy || '-'}</td>
                  <td className="p-3 text-slate-500 italic max-w-xs truncate">
                    {req.examinerNotes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-lg">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Uji Kompetensi: {selectedReq.studentName}
                </h3>
                <span className="text-xs font-semibold text-purple-700">
                  {selectedReq.requirementName}
                </span>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="p-2 hover:bg-slate-200 text-slate-500 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Student Report */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Laporan Praktik Mandiri Siswa:
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  &quot;{selectedReq.reportText || 'Tidak ada teks laporan terlampir.'}&quot;
                </p>
              </div>

              {/* Proof Photo */}
              {selectedReq.proofFileUrl && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Foto Bukti Kegiatan:
                  </span>
                  <div className="p-2 bg-slate-100 rounded-xl text-center">
                    <img
                      src={selectedReq.proofFileUrl}
                      alt="Bukti SKK"
                      className="max-h-52 rounded-lg mx-auto object-cover border border-slate-200"
                    />
                  </div>
                </div>
              )}

              {/* Examiner Score */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nilai Uji Kompetensi (0 - 100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg text-slate-900 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Examiner Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Penguji / Umpan Balik untuk Piagam
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleExecuteApproval('Rejected')}
                  className="px-4 py-2 border border-red-300 hover:bg-red-50 text-red-700 font-bold rounded-xl transition-all"
                >
                  Minta Revisi
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteApproval('Approved')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Luluskan & Terbitkan Lencana</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
