'use client';

import React, { useState } from 'react';
import { DatabaseState } from '@/types/pmr';
import {
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  CalendarCheck,
  ClipboardList,
  Award,
  Sparkles,
} from 'lucide-react';

interface WhatsAppNotifierProps {
  db: DatabaseState;
}

export const WhatsAppNotifier: React.FC<WhatsAppNotifierProps> = ({ db }) => {
  const [templateType, setTemplateType] = useState<'schedule' | 'task' | 'reminder' | 'skk'>('schedule');
  const [copied, setCopied] = useState(false);

  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    db.attendanceSessions[0]?.id || ''
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    db.assignments[0]?.id || ''
  );

  const selectedSession =
    db.attendanceSessions.find((s) => s.id === selectedSessionId) ||
    db.attendanceSessions[0];

  const selectedTask =
    db.assignments.find((t) => t.id === selectedTaskId) || db.assignments[0];

  const generateMessage = (): string => {
    const school = db.settings.schoolName;
    const unit = db.settings.unitName;
    const coach = db.settings.coachName;

    if (templateType === 'schedule' && selectedSession) {
      return `📢 *PENGUMUMAN JADWAL LATIHAN RUTIN PMR*
Salam Kemanusiaan! 🌟
Siamo Tutti Fratelli!

Diberitahukan kepada seluruh anggota *Palang Merah Remaja (PMR)* ${school}:

🗓 *Hari / Tanggal*: ${selectedSession.date}
⏰ *Waktu*: ${selectedSession.startTime} - ${selectedSession.endTime} WIB
📌 *Materi*: ${selectedSession.title}
🎒 *Perlengkapan*: ${selectedSession.notes || 'Pakaian seragam/kaos PMR dan alat tulis'}
📍 *Lokasi*: Pangkalan PMR ${school}

Diharapkan seluruh adik-adik hadir tepat waktu dan mengisi presensi digital di aplikasi *Ayo PMRku*.

Terima kasih.
Salam Palang Merah! 🇲🇨
*${coach}* (Pembina PMR)`;
    }

    if (templateType === 'task' && selectedTask) {
      return `📝 *INFORMASI TUGAS PRAKTIK LAPANGAN PMR*
Salam Kemanusiaan! 🚑

Kepada seluruh anggota PMR ${school}, berikut penugasan materi:

📌 *Judul Tugas*: ${selectedTask.title}
🏷 *Kategori*: ${selectedTask.category}
⏳ *Batas Pengumpulan*: ${selectedTask.deadline} WIB
📖 *Instruksi*: ${selectedTask.description}

Silakan kirimkan foto dokumentasi hasil praktik adik-adik melalui aplikasi *Ayo PMRku*.

Semangat berlatih dan berbakti!
*${coach}* (Pembina PMR)`;
    }

    if (templateType === 'reminder' && selectedTask) {
      return `⚠️ *PENGINGAT BATAS WAKTU TUGAS PMR (H-1)*
Assalamu'alaikum & Salam Kemanusiaan!

Mengingatkan kembali bagi anggota PMR yang belum mengumpulkan tugas:
📌 *${selectedTask.title}*
⏳ *Batas Waktu*: Besok, ${selectedTask.deadline} WIB

Jangan lupa unggah foto dokumentasi Anda di aplikasi *Ayo PMRku* sebelum batas waktu berakhir.

Terima kasih!
*${coach}*`;
    }

    return `🏆 *PENGUMUMAN KELULUSAN UJI SKK PMR*
Alhamdulillah, selamat kepada anggota PMR ${school} yang telah berhasil menyelesaikan dan lulus uji *Syarat Kecakapan Khusus (SKK)*!

Piagam penghargaan dan lencana digital telah diterbitkan di aplikasi *Ayo PMRku*. Adik-adik dapat mengunduh atau mencetak Piagam TKK resmi sekarang.

Terus tingkatkan keterampilan dan amalkan Tri Bakti PMR!
*${coach}*`;
  };

  const messageText = generateMessage();

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(messageText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <span>Generator Notifikasi & Broadcast WhatsApp</span>
          </h2>
          <p className="text-xs text-slate-500">
            Kirimkan informasi jadwal latihan, tugas, dan pengumuman ke grup WhatsApp siswa dan orang tua
          </p>
        </div>
      </div>

      {/* Template Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setTemplateType('schedule')}
          className={`p-3.5 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
            templateType === 'schedule'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-xs'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <CalendarCheck className="w-4 h-4 text-emerald-600 mb-1.5" />
          <div className="font-bold">Jadwal Latihan</div>
          <div className="text-[10px] text-slate-500 font-normal mt-0.5">
            Pengumuman pertemuan
          </div>
        </button>

        <button
          onClick={() => setTemplateType('task')}
          className={`p-3.5 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
            templateType === 'task'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-xs'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <ClipboardList className="w-4 h-4 text-amber-600 mb-1.5" />
          <div className="font-bold">Tugas Baru</div>
          <div className="text-[10px] text-slate-500 font-normal mt-0.5">
            Instruksi & deadline
          </div>
        </button>

        <button
          onClick={() => setTemplateType('reminder')}
          className={`p-3.5 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
            templateType === 'reminder'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-xs'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-rose-600 mb-1.5" />
          <div className="font-bold">Pengingat H-1</div>
          <div className="text-[10px] text-slate-500 font-normal mt-0.5">
            Deadline pengumpulan
          </div>
        </button>

        <button
          onClick={() => setTemplateType('skk')}
          className={`p-3.5 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
            templateType === 'skk'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-xs'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <Award className="w-4 h-4 text-purple-600 mb-1.5" />
          <div className="font-bold">Kelulusan SKK</div>
          <div className="text-[10px] text-slate-500 font-normal mt-0.5">
            Apresiasi piagam
          </div>
        </button>
      </div>

      {/* Dynamic Pickers based on template */}
      {templateType === 'schedule' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 text-xs">
          <span className="font-bold text-slate-700">Pilih Jadwal Sesi:</span>
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
          >
            {db.attendanceSessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.date} - {s.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {(templateType === 'task' || templateType === 'reminder') && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 text-xs">
          <span className="font-bold text-slate-700">Pilih Tugas Terkait:</span>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
          >
            {db.assignments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} (Deadline: {t.deadline})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Message Output Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">Pratinjau Pesan Siap Kirim</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Teks</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka di WhatsApp</span>
            </button>
          </div>
        </div>

        <div className="p-5 bg-emerald-950/5">
          <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs">
            {messageText}
          </pre>
        </div>
      </div>
    </div>
  );
};
