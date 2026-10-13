'use client';

import React, { useState } from 'react';
import {
  DatabaseState,
  SkillRequirement,
  SkillRequest,
  User,
} from '@/types/pmr';
import { PhotoUpload } from '@/components/common/PhotoUpload';
import { CertificateModal } from '@/components/idcard/CertificateModal';
import {
  Award,
  CheckCircle2,
  Clock,
  Printer,
  Plus,
  ShieldCheck,
  HeartPulse,
  Smile,
  Droplet,
  AlertTriangle,
  Users,
  Flame,
  X,
  Check,
} from 'lucide-react';

interface MemberSkillsProps {
  db: DatabaseState;
  currentUser: User;
  onUpdateDb: (newDb: DatabaseState) => void;
}

export const MemberSkills: React.FC<MemberSkillsProps> = ({
  db,
  currentUser,
  onUpdateDb,
}) => {
  const [selectedReqToApply, setSelectedReqToApply] = useState<SkillRequirement | null>(null);
  const [reportText, setReportText] = useState('');
  const [proofPhoto, setProofPhoto] = useState('');
  const [certRequest, setCertRequest] = useState<SkillRequest | null>(null);

  const myRequests = db.skillRequests.filter((r) => r.userId === currentUser.id);

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
      case 'Flame':
      default:
        return Flame;
    }
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqToApply) return;

    const newReq: SkillRequest = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      userId: currentUser.id,
      studentName: currentUser.fullName,
      requirementId: selectedReqToApply.id,
      requirementName: selectedReqToApply.name,
      status: 'Pending',
      score: null,
      examinerNotes: '',
      requestedDate: new Date().toISOString().split('T')[0],
      proofFileUrl: proofPhoto,
      reportText,
      validatedBy: '',
    };

    onUpdateDb({
      ...db,
      skillRequests: [newReq, ...db.skillRequests],
    });

    setSelectedReqToApply(null);
    setReportText('');
    setProofPhoto('');
  };

  const certRequirement = certRequest
    ? db.skillRequirements.find((r) => r.id === certRequest.requirementId)
    : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span>7 Lencana Syarat Kecakapan Khusus (SKK PMR)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Kumpulkan seluruh tanda kecakapan, cetak piagam digital resmi, dan buktikan keterampilan kepalangmerahanmu
          </p>
        </div>

        <div className="px-3.5 py-1.5 bg-purple-50 text-purple-800 font-bold text-xs rounded-xl border border-purple-200">
          {myRequests.filter((r) => r.status === 'Approved').length} dari 7 Lencana Berhasil Diraih
        </div>
      </div>

      {/* 7 Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {db.skillRequirements.map((req) => {
          const Icon = getBadgeIcon(req.badgeIcon);
          const reqStatus = myRequests.find((r) => r.requirementId === req.id);
          const isPassed = reqStatus?.status === 'Approved';
          const isPending = reqStatus?.status === 'Pending';

          return (
            <div
              key={req.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                isPassed
                  ? 'bg-gradient-to-br from-purple-50/80 to-white border-purple-300 shadow-xs'
                  : isPending
                  ? 'bg-amber-50/50 border-amber-200'
                  : 'bg-white border-slate-200 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ${
                      isPassed
                        ? 'bg-purple-600 text-white'
                        : isPending
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    {isPassed && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Lulus ({reqStatus?.score}/100)</span>
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        <Clock className="w-3 h-3" />
                        <span>Menunggu Uji</span>
                      </span>
                    )}
                    {!reqStatus && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                        Belum Diuji
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug">
                  {req.name}
                </h3>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {req.description}
                </p>

                {/* Standards preview */}
                <div className="mt-3 pt-2 border-t border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Standar Kompetensi:
                  </span>
                  <ul className="text-[11px] text-slate-600 space-y-0.5 list-disc list-inside">
                    {req.standards.slice(0, 2).map((std, idx) => (
                      <li key={idx} className="truncate">
                        {std}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                {isPassed ? (
                  <button
                    onClick={() => setCertRequest(reqStatus)}
                    className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Piagam TKK</span>
                  </button>
                ) : isPending ? (
                  <span className="text-xs text-amber-700 italic font-medium">
                    Sedang diperiksa oleh pembina...
                  </span>
                ) : (
                  <button
                    onClick={() => setSelectedReqToApply(req)}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajukan Uji Mandiri</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Apply SKK Modal */}
      {selectedReqToApply && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-lg">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Pengajuan Uji: {selectedReqToApply.name}
                </h3>
                <span className="text-xs text-slate-500">
                  Unggah bukti praktik mandiri dan laporan singkat kegiatan
                </span>
              </div>
              <button
                onClick={() => setSelectedReqToApply(null)}
                className="p-2 hover:bg-slate-200 text-slate-500 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="p-5 space-y-4 text-xs">
              <div>
                <PhotoUpload
                  label="Unggah Foto Bukti Praktik Mandiri *"
                  currentPhotoUrl={proofPhoto}
                  onPhotoSelected={(url) => setProofPhoto(url)}
                  aspectRatio="portrait"
                  allowCamera={true}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Laporan Singkat / Pengalaman Praktik *
                </label>
                <textarea
                  rows={4}
                  required
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  placeholder="Ceritakan praktik yang telah kamu lakukan sesuai standar kompetensi ini..."
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReqToApply(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!proofPhoto || !reportText.trim()}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Kirim Pengajuan Uji
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Modal View */}
      {certRequest && (
        <CertificateModal
          user={currentUser}
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
