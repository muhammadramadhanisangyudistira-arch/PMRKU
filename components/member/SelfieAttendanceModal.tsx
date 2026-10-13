'use client';

import React, { useState } from 'react';
import { DatabaseState, User, AttendanceRecord } from '@/types/pmr';
import { PhotoUpload } from '@/components/common/PhotoUpload';
import {
  Camera,
  X,
  Check,
  CalendarCheck,
  AlertCircle,
} from 'lucide-react';

interface SelfieAttendanceModalProps {
  db: DatabaseState;
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDb: DatabaseState) => void;
}

export const SelfieAttendanceModal: React.FC<SelfieAttendanceModalProps> = ({
  db,
  currentUser,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const activeSessions = db.attendanceSessions.filter((s) => s.isActive);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    activeSessions[0]?.id || db.attendanceSessions[0]?.id || ''
  );
  const [selfiePhotoUrl, setSelfiePhotoUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selfiePhotoUrl) {
      setErrorMsg('Harap ambil foto selfie bukti kehadiran terlebih dahulu.');
      return;
    }

    const session = db.attendanceSessions.find((s) => s.id === selectedSessionId);
    if (!session) {
      setErrorMsg('Sesi latihan tidak ditemukan.');
      return;
    }

    const existingIdx = db.attendanceRecords.findIndex(
      (r) => r.sessionId === session.id && r.userId === currentUser.id
    );

    let updatedRecords = [...db.attendanceRecords];
    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (existingIdx !== -1) {
      updatedRecords[existingIdx] = {
        ...updatedRecords[existingIdx],
        status: 'Hadir',
        type: 'Selfie Mandiri',
        time: nowTime,
        selfieUrl: selfiePhotoUrl,
      };
    } else {
      const newRec: AttendanceRecord = {
        id: `ATT-${Date.now().toString().slice(-5)}`,
        sessionId: session.id,
        userId: currentUser.id,
        userName: currentUser.fullName,
        role: 'member',
        date: session.date,
        time: nowTime,
        status: 'Hadir',
        type: 'Selfie Mandiri',
        selfieUrl: selfiePhotoUrl,
      };
      updatedRecords.push(newRec);
    }

    onSuccess({
      ...db,
      attendanceRecords: updatedRecords,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-md">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Presensi Mandiri Selfie Siswa
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Pilih Sesi Latihan Yang Berlangsung *
            </label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
            >
              {db.attendanceSessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.date} - {s.title} ({s.isActive ? 'Buka' : 'Tutup'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <PhotoUpload
              label="Ambil Foto Selfie di Lokasi Latihan *"
              currentPhotoUrl={selfiePhotoUrl}
              onPhotoSelected={(url) => {
                setSelfiePhotoUrl(url);
                setErrorMsg(null);
              }}
              aspectRatio="square"
              allowCamera={true}
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Kirim Bukti Presensi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
