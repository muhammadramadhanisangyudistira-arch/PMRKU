'use client';

import React, { useState } from 'react';
import { DatabaseState, User, SkillRequest } from '@/types/pmr';
import { CertificateModal } from '@/components/idcard/CertificateModal';
import { Award, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';

interface MemberCertificateViewProps {
  db: DatabaseState;
  currentUser: User;
}

export const MemberCertificateView: React.FC<MemberCertificateViewProps> = ({
  db,
  currentUser,
}) => {
  const [selectedCert, setSelectedCert] = useState<SkillRequest | null>(null);

  const approvedSkills = db.skillRequests.filter(
    (r) => r.userId === currentUser.id && r.status === 'Approved'
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Piagam & Rapor Capaian Digital</span>
          </h2>
          <p className="text-xs text-slate-500">
            Kumpulan sertifikat kelulusan uji kecakapan Palang Merah Remaja yang dapat dicetak resmi
          </p>
        </div>
      </div>

      {approvedSkills.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">
            Belum Ada Piagam Kelulusan
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Kamu belum memiliki lencana kecakapan yang lulus uji. Buka menu <strong>7 Lencana SKK</strong> untuk mengajukan uji kecakapan mandiri.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvedSkills.map((cert) => {
            const req = db.skillRequirements.find(
              (r) => r.id === cert.requirementId
            );

            return (
              <div
                key={cert.id}
                className="bg-white rounded-2xl border border-amber-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-all space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                      Piagam Sah
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {cert.requestedDate}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900">
                    {cert.requirementName}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 italic">
                    &quot;{cert.examinerNotes || 'Telah menempuh uji kecakapan dan memenuhi standar kelulusan PMI.'}&quot;
                  </p>

                  <div className="mt-3 p-2 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Nilai Kelulusan:</span>
                    <span className="font-black text-rose-600 text-sm">
                      {cert.score} / 100
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Penguji: {cert.validatedBy || db.settings.coachName}
                  </span>

                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Lihat & Cetak Piagam (A4)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedCert && (
        <CertificateModal
          user={currentUser}
          skillRequest={selectedCert}
          settings={db.settings}
          isOpen={true}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </div>
  );
};
