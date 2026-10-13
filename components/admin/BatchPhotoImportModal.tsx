'use client';

import React, { useState } from 'react';
import { User } from '@/types/pmr';
import { matchPhotosFromZip, BatchPhotoMatchResult } from '@/lib/storage';
import { DriveImage } from '@/components/common/DriveImage';
import { UploadCloud, CheckCircle2, AlertCircle, X, Search, FileArchive, Check } from 'lucide-react';

interface BatchPhotoImportModalProps {
  members: User[];
  isOpen: boolean;
  onClose: () => void;
  onApplyMatches: (updatedUsers: User[]) => void;
}

export const BatchPhotoImportModal: React.FC<BatchPhotoImportModalProps> = ({
  members,
  isOpen,
  onClose,
  onApplyMatches,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchResults, setMatchResults] = useState<BatchPhotoMatchResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manualOverrides, setManualOverrides] = useState<Record<string, string>>({}); // fileName -> userId

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.zip')) {
      setErrorMsg('Harap pilih berkas arsip berekstensi .ZIP yang berisi foto siswa.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const results = await matchPhotosFromZip(file, members);
      if (results.length === 0) {
        setErrorMsg('Tidak ditemukan file gambar (JPG/PNG) di dalam arsip ZIP tersebut.');
      } else {
        setMatchResults(results);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal mengekstrak berkas ZIP.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOverride = (fileName: string, targetUserId: string) => {
    setManualOverrides((prev) => ({
      ...prev,
      [fileName]: targetUserId,
    }));
  };

  const handleApply = () => {
    const updatedUsers = [...members];
    let appliedCount = 0;

    matchResults.forEach((res) => {
      const targetUserId = manualOverrides[res.fileName] || res.matchedUser?.id;
      if (targetUserId) {
        const userIdx = updatedUsers.findIndex((u) => u.id === targetUserId);
        if (userIdx !== -1) {
          updatedUsers[userIdx] = {
            ...updatedUsers[userIdx],
            photoUrl: res.dataUrl,
          };
          appliedCount++;
        }
      }
    });

    onApplyMatches(updatedUsers);
    onClose();
  };

  const matchedCount = matchResults.filter(
    (r) => manualOverrides[r.fileName] || r.matchedUser !== null
  ).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-4xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <FileArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Pencocokan Foto Massal (Batch Photo Import)
              </h3>
              <p className="text-xs text-slate-500">
                Unggah file ZIP foto siswa. Sistem otomatis mencocokkan nama file dengan Username, NIS, atau Nama Lengkap.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 text-slate-500 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {matchResults.length === 0 ? (
            <div className="border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/30 rounded-2xl p-8 text-center transition-all">
              <input
                type="file"
                id="zip-upload-input"
                accept=".zip"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="hidden"
              />
              <label
                htmlFor="zip-upload-input"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <UploadCloud className="w-12 h-12 text-rose-500 mb-3 animate-bounce" />
                <span className="text-sm font-bold text-slate-800">
                  {isProcessing ? 'Sedang Mengekstrak & Mencocokkan Foto...' : 'Pilih Berkas ZIP Foto Siswa'}
                </span>
                <span className="text-xs text-slate-500 mt-1 max-w-md">
                  Contoh nama file di dalam ZIP:{' '}
                  <code className="text-rose-700 bg-rose-100 px-1 py-0.5 rounded font-mono">
                    ahmad.rayhan.jpg
                  </code>
                  ,{' '}
                  <code className="text-rose-700 bg-rose-100 px-1 py-0.5 rounded font-mono">
                    2024.05.001.png
                  </code>
                  , atau nama siswa.
                </span>
              </label>

              {errorMsg && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 text-xs rounded-xl flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-700">
                    Total Foto Diekstrak:{' '}
                    <strong className="text-slate-900">{matchResults.length}</strong>
                  </span>
                  <span className="font-semibold text-emerald-700">
                    Cocok Otomatis: <strong>{matchedCount}</strong>
                  </span>
                  <span className="font-semibold text-amber-700">
                    Belum Terpasang:{' '}
                    <strong>{matchResults.length - matchedCount}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setMatchResults([])}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Unggah ZIP Lain
                </button>
              </div>

              {/* Match Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-16 text-center">Foto</th>
                      <th className="p-3">Nama Berkas</th>
                      <th className="p-3">Kecocokan Sistem</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Tetapkan Ke Siswa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {matchResults.map((item) => {
                      const activeUserId =
                        manualOverrides[item.fileName] || item.matchedUser?.id;
                      const activeUser = members.find((m) => m.id === activeUserId);
                      const isMatched = !!activeUser;

                      return (
                        <tr
                          key={item.fileName}
                          className={isMatched ? 'hover:bg-slate-50/60' : 'bg-amber-50/40'}
                        >
                          <td className="p-3 text-center">
                            <img
                              src={item.dataUrl}
                              alt={item.fileName}
                              className="w-10 h-12 object-cover rounded border border-slate-300 mx-auto shadow-2xs"
                            />
                          </td>
                          <td className="p-3 font-mono font-medium text-slate-700">
                            {item.fileName}
                          </td>
                          <td className="p-3">
                            {item.matchedUser ? (
                              <div>
                                <div className="font-bold text-slate-900">
                                  {item.matchedUser.fullName}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  NIS: {item.matchedUser.nis} • @{item.matchedUser.username}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Tidak terdeteksi</span>
                            )}
                          </td>
                          <td className="p-3">
                            {item.confidence === 'exact-username' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Cocok Username
                              </span>
                            )}
                            {item.confidence === 'exact-nis' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Cocok NIS
                              </span>
                            )}
                            {item.confidence === 'fuzzy-name' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                                Cocok Nama
                              </span>
                            )}
                            {item.confidence === 'unmatched' && !manualOverrides[item.fileName] && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                Perlu Dicocokkan
                              </span>
                            )}
                            {manualOverrides[item.fileName] && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                                Manual Pilihan
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <select
                              value={activeUserId || ''}
                              onChange={(e) =>
                                handleOverride(item.fileName, e.target.value)
                              }
                              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
                            >
                              <option value="">-- Lewati / Jangan Terapkan --</option>
                              {members.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.fullName} ({m.className} - {m.nis})
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {matchResults.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {matchedCount} dari {matchResults.length} foto siap diperbarui ke profil siswa.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleApply}
                disabled={matchedCount === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Terapkan {matchedCount} Foto Siswa</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
