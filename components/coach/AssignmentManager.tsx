'use client';

import React, { useState } from 'react';
import {
  DatabaseState,
  Assignment,
  Submission,
  AssignmentType,
  QuizQuestion,
} from '@/types/pmr';
import { DriveImage } from '@/components/common/DriveImage';
import {
  ClipboardList,
  Plus,
  Clock,
  CheckCircle,
  Eye,
  X,
  Check,
  Star,
  FileText,
  HelpCircle,
  Camera,
  Trash2,
  AlertCircle,
  Award,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface AssignmentManagerProps {
  db: DatabaseState;
  onUpdateDb: (newDb: DatabaseState) => void;
}

export const AssignmentManager: React.FC<AssignmentManagerProps> = ({
  db,
  onUpdateDb,
}) => {
  const members = db.users.filter((u) => u.role === 'member');
  const [selectedTask, setSelectedTask] = useState<Assignment>(
    db.assignments[0] || null
  );
  const [typeFilter, setTypeFilter] = useState<'all' | 'pilgan' | 'praktik'>('all');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [viewingAnswersSubmission, setViewingAnswersSubmission] = useState<Submission | null>(null);

  // Form Task Builder State
  const [taskType, setTaskType] = useState<AssignmentType>('pilgan');
  const [newTaskForm, setNewTaskForm] = useState<{
    title: string;
    category: string;
    description: string;
    deadline: string;
    practicalInstructions: string;
  }>({
    title: '',
    category: 'Pertolongan Pertama',
    description: '',
    deadline: '2026-10-25 23:59',
    practicalInstructions: '',
  });

  // State builder soal pilgan
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    {
      id: 'Q1',
      questionText: 'Prinsip tindakan pertama saat menemukan korban tidak sadar di lokasi kejadian adalah...',
      options: [
        'Memberi air minum hangat segera',
        'Memastikan 3A (Aman Diri, Aman Lingkungan, Aman Korban)',
        'Mendudukkan korban di kursi',
        'Memberi nafas buatan tanpa cek nadi',
      ],
      correctOptionIndex: 1,
      explanation: 'Keamanan penolong dan lokasi adalah syarat mutlak sebelum melakukan pertolongan.',
    },
    {
      id: 'Q2',
      questionText: 'Simpul kain mitela yang paling tepat digunakan untuk mengikat balutan luka adalah...',
      options: [
        'Simpul Mati (Square Knot)',
        'Simpul Pangkal (Clove Hitch)',
        'Simpul Jangkar',
        'Simpul Hidup (Slip Knot)',
      ],
      correctOptionIndex: 0,
      explanation: 'Simpul mati rata dan tidak menekan tubuh korban secara berlebihan serta mudah dibuka tim medis.',
    },
  ]);

  // Grading states for manual review
  const [gradeScore, setGradeScore] = useState<number>(85);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');

  const filteredAssignments = db.assignments.filter((t) => {
    if (typeFilter === 'all') return true;
    return (t.type || 'praktik') === typeFilter;
  });

  const taskSubmissions = db.submissions.filter(
    (s) => s.taskId === selectedTask?.id
  );

  // Hitung bobot per soal dinamis
  const totalQuestionsCount = quizQuestions.length;
  const pointPerQuestion =
    totalQuestionsCount > 0 ? (100 / totalQuestionsCount).toFixed(1) : '0';

  const handleAddQuestion = () => {
    const nextNum = quizQuestions.length + 1;
    setQuizQuestions([
      ...quizQuestions,
      {
        id: `Q${Date.now().toString().slice(-4)}`,
        questionText: `Pertanyaan nomor ${nextNum}...`,
        options: [
          'Pilihan Jawaban A',
          'Pilihan Jawaban B',
          'Pilihan Jawaban C',
          'Pilihan Jawaban D',
        ],
        correctOptionIndex: 0,
        explanation: '',
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (quizQuestions.length <= 1) return;
    setQuizQuestions(quizQuestions.filter((_, i) => i !== idx));
  };

  const handleUpdateQuestion = (
    idx: number,
    field: keyof QuizQuestion,
    val: any
  ) => {
    const updated = [...quizQuestions];
    updated[idx] = { ...updated[idx], [field]: val };
    setQuizQuestions(updated);
  };

  const handleUpdateOption = (
    qIdx: number,
    optIdx: number,
    val: string
  ) => {
    const updated = [...quizQuestions];
    const newOpts = [...updated[qIdx].options];
    newOpts[optIdx] = val;
    updated[qIdx] = { ...updated[qIdx], options: newOpts };
    setQuizQuestions(updated);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskForm.title) return;

    const newId = `TSK-${Date.now().toString().slice(-4)}`;
    const created: Assignment = {
      id: newId,
      title: newTaskForm.title,
      category: newTaskForm.category,
      type: taskType,
      description:
        newTaskForm.description ||
        (taskType === 'pilgan'
          ? `Kuis pilihan ganda terdiri dari ${quizQuestions.length} soal dengan bobot @${pointPerQuestion} poin per soal.`
          : 'Lakukan instruksi praktik lapangan sesuai panduan dan unggah foto dokumentasi.'),
      deadline: newTaskForm.deadline || '2026-10-25 23:59',
      createdBy: db.settings.coachName,
      createdDate: new Date().toISOString().split('T')[0],
      questions: taskType === 'pilgan' ? quizQuestions : undefined,
      practicalInstructions:
        taskType === 'praktik' ? newTaskForm.practicalInstructions : undefined,
    };

    onUpdateDb({
      ...db,
      assignments: [created, ...db.assignments],
    });

    setSelectedTask(created);
    setIsNewTaskOpen(false);

    // Reset form
    setNewTaskForm({
      title: '',
      category: 'Pertolongan Pertama',
      description: '',
      deadline: '2026-10-25 23:59',
      practicalInstructions: '',
    });
  };

  const handleOpenGrading = (sub: Submission) => {
    setGradingSubmission(sub);
    setGradeScore(sub.score ?? 85);
    setGradeFeedback(
      sub.feedback ||
        (selectedTask?.type === 'pilgan'
          ? `Hasil kuis: ${sub.correctCount || 0} dari ${sub.totalQuestions || 0} soal benar.`
          : 'Praktik lapangan sangat baik, pertahankan kedisiplinan dan kerapian.')
    );
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    const updated = db.submissions.map((s) =>
      s.id === gradingSubmission.id
        ? {
            ...s,
            score: Number(gradeScore),
            feedback: gradeFeedback,
            status: 'Dinilai' as const,
          }
        : s
    );

    onUpdateDb({ ...db, submissions: updated });
    setGradingSubmission(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-500" />
            <span>Penugasan & Praktik Lapangan Siswa</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dua opsi penugasan terpadu: <strong>Soal Pilihan Ganda (Kuis Online)</strong> dengan skor otomatis per jumlah soal & <strong>Tugas Praktik Lapangan</strong> dengan review foto.
          </p>
        </div>

        <button
          onClick={() => setIsNewTaskOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Tugas Baru</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            typeFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          Semua Tugas ({db.assignments.length})
        </button>
        <button
          onClick={() => setTypeFilter('pilgan')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            typeFilter === 'pilgan'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white hover:bg-purple-50 text-purple-700 border border-purple-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Soal Pilihan Ganda ({db.assignments.filter((t) => t.type === 'pilgan').length})</span>
        </button>
        <button
          onClick={() => setTypeFilter('praktik')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            typeFilter === 'praktik'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Tugas Praktik Lapangan ({db.assignments.filter((t) => t.type !== 'pilgan').length})</span>
        </button>
      </div>

      {/* Task Selector & Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Task List */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">
              Daftar Tugas Aktif
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">
              {filteredAssignments.length} Tugas
            </span>
          </div>

          {filteredAssignments.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Belum ada tugas pada kategori ini.
            </div>
          ) : (
            filteredAssignments.map((task) => {
              const isSelected = selectedTask?.id === task.id;
              const subs = db.submissions.filter((s) => s.taskId === task.id);
              const isPilgan = task.type === 'pilgan';
              const qCount = task.questions?.length || 0;
              const bobotText = qCount > 0 ? (100 / qCount).toFixed(1) : '0';

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? isPilgan
                        ? 'bg-purple-50/90 border-purple-300 text-purple-950 font-bold shadow-xs'
                        : 'bg-amber-50/90 border-amber-300 text-amber-950 font-bold shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                          isPilgan
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {isPilgan ? (
                          <>
                            <HelpCircle className="w-2.5 h-2.5" />
                            <span>Pilgan ({qCount} Soal)</span>
                          </>
                        ) : (
                          <>
                            <Camera className="w-2.5 h-2.5" />
                            <span>Praktik</span>
                          </>
                        )}
                      </span>
                      <span className="text-[9.5px] uppercase font-bold text-slate-500">
                        {task.category}
                      </span>
                    </div>

                    <span className="text-[9.5px] text-slate-400 font-mono">
                      {task.deadline.split(' ')[0]}
                    </span>
                  </div>

                  <div className="font-bold text-slate-900 line-clamp-1 mt-1">
                    {task.title}
                  </div>

                  {isPilgan && (
                    <div className="text-[9.5px] text-purple-700 mt-1 font-semibold flex items-center gap-1">
                      <span>Bobot: @{bobotText} poin / soal</span> •{' '}
                      <span>Otomatis Dinilai</span>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 mt-1 font-normal flex items-center justify-between">
                    <span>
                      {subs.length} dari {members.length} siswa submit
                    </span>
                    {subs.length === members.length && (
                      <span className="text-emerald-600 font-bold text-[9px]">Lengkap</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Submission Monitor & Grading Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            {/* Task Info Bar */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9.5px] font-black uppercase ${
                      selectedTask?.type === 'pilgan'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {selectedTask?.type === 'pilgan' ? (
                      <>
                        <HelpCircle className="w-3 h-3" />
                        <span>Kuis Pilihan Ganda ({selectedTask.questions?.length || 0} Soal)</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-3 h-3" />
                        <span>Tugas Praktik Lapangan</span>
                      </>
                    )}
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 uppercase">
                    {selectedTask?.category}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {selectedTask?.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {selectedTask?.description}
                </p>

                {selectedTask?.type === 'pilgan' && selectedTask.questions && (
                  <div className="mt-2.5 p-2.5 bg-purple-50/70 border border-purple-200 rounded-xl text-[11px] text-purple-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-purple-600" />
                      <span>
                        Sistem Perskoran Otomatis: 100 ÷ {selectedTask.questions.length} soal = @
                        {(100 / selectedTask.questions.length).toFixed(1)} Poin per Soal Benar
                      </span>
                    </div>
                    <div className="text-[10px] text-purple-700">
                      Siswa langsung memperoleh nilai otomatis seketika saat mengumpulkan kuis.
                    </div>
                  </div>
                )}

                {selectedTask?.type === 'praktik' && selectedTask.practicalInstructions && (
                  <div className="mt-2 p-2 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[10.5px] text-emerald-900">
                    <span className="font-bold">Panduan Praktik: </span>
                    <span className="whitespace-pre-line">{selectedTask.practicalInstructions}</span>
                  </div>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-semibold block">
                  Batas Pengumpulan:
                </span>
                <span className="text-xs font-mono font-bold text-rose-700">
                  {selectedTask?.deadline}
                </span>
              </div>
            </div>

            {/* Submissions List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">Waktu Kirim</th>
                    <th className="p-3">
                      {selectedTask?.type === 'pilgan' ? 'Hasil Jawaban' : 'Lampiran Foto'}
                    </th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Nilai Akhir</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((member) => {
                    const sub = taskSubmissions.find((s) => s.userId === member.id);
                    const isPilgan = selectedTask?.type === 'pilgan';

                    return (
                      <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{member.fullName}</div>
                          <div className="text-[10px] text-slate-500">Kelas {member.className}</div>
                        </td>
                        <td className="p-3 text-slate-500 font-mono">
                          {sub ? (
                            sub.submittedDate
                          ) : (
                            <span className="text-slate-400 italic">Belum dikerjakan</span>
                          )}
                        </td>
                        <td className="p-3">
                          {isPilgan ? (
                            sub?.totalQuestions ? (
                              <button
                                onClick={() => setViewingAnswersSubmission(sub)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg font-bold text-[11px] transition-all cursor-pointer"
                              >
                                <Eye className="w-3 h-3 text-purple-600" />
                                <span>
                                  {sub.correctCount} / {sub.totalQuestions} Benar
                                </span>
                              </button>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )
                          ) : sub?.fileUrl ? (
                            <a
                              href={sub.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-rose-600 hover:underline font-semibold flex items-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[120px]">
                                {sub.fileName || 'Lihat Foto'}
                              </span>
                            </a>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-3">
                          {sub ? (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                sub.status === 'Dinilai'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {sub.status === 'Dinilai' ? 'Telah Dinilai' : 'Menunggu Nilai'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                              Belum Submit
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          {sub?.score !== null && sub?.score !== undefined ? (
                            <span className="text-emerald-700 font-mono text-sm">
                              {sub.score} / 100
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {sub ? (
                            <button
                              onClick={() => handleOpenGrading(sub)}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold text-xs cursor-pointer"
                            >
                              {sub.score !== null ? 'Evaluasi / Ubah' : 'Beri Nilai'}
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[10px]">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* New Task Modal with 2 Options (Pilgan vs Praktik) */}
      {isNewTaskOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-2xl max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Buat Penugasan & Praktik PMR Baru
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih tipe tugas: Kuis Pilihan Ganda berbobot otomatis atau Tugas Praktik Lapangan
                </p>
              </div>
              <button
                onClick={() => setIsNewTaskOpen(false)}
                className="p-2 hover:bg-slate-200 text-slate-500 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateTask} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Opsi Tipe Tugas Radio Cards */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Pilih Format Penugasan *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setTaskType('pilgan')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      taskType === 'pilgan'
                        ? 'border-purple-600 bg-purple-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        taskType === 'pilgan'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-xs">
                        1. Soal Pilihan Ganda (Pilgan)
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Input soal A/B/C/D & kunci jawaban. Skor otomatis dihitung sistem berdasarkan jumlah soal.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setTaskType('praktik')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      taskType === 'praktik'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        taskType === 'praktik'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-xs">
                        2. Tugas Praktik Lapangan
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Siswa melakukan praktik tindakan (balut luka, cuci tangan, evakuasi) dan mengunggah foto bukti.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Judul Tugas */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Judul Penugasan / Praktik *
                </label>
                <input
                  type="text"
                  required
                  value={newTaskForm.title}
                  onChange={(e) =>
                    setNewTaskForm({ ...newTaskForm, title: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder={
                    taskType === 'pilgan'
                      ? 'Contoh: Kuis Evaluasi Bab 2: Penanganan Fraktur Tulang'
                      : 'Contoh: Praktik Pembalutan Mitela Lipat 8 pada Lengan'
                  }
                />
              </div>

              {/* Kategori & Batas Waktu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kategori Materi PMR
                  </label>
                  <select
                    value={newTaskForm.category}
                    onChange={(e) =>
                      setNewTaskForm({ ...newTaskForm, category: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Pertolongan Pertama">Pertolongan Pertama</option>
                    <option value="Perawatan Keluarga">Perawatan Keluarga</option>
                    <option value="Remaja Sehat Peduli Sesama">Remaja Sehat Peduli Sesama</option>
                    <option value="Donor Darah">Donor Darah</option>
                    <option value="Kesiapsiagaan Bencana">Kesiapsiagaan Bencana</option>
                    <option value="Kepemimpinan">Kepemimpinan</option>
                    <option value="Gerakan Kepalangmerahan">Gerakan Kepalangmerahan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Batas Waktu Pengumpulan (Deadline)
                  </label>
                  <input
                    type="text"
                    value={newTaskForm.deadline}
                    onChange={(e) =>
                      setNewTaskForm({ ...newTaskForm, deadline: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                    placeholder="2026-10-25 23:59"
                  />
                </div>
              </div>

              {/* Bagian Khusus: SOAL PILIHAN GANDA (PILGAN) */}
              {taskType === 'pilgan' && (
                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-4">
                  {/* Dynamic Score Info Banner */}
                  <div className="p-3 bg-white rounded-xl border border-purple-200 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase text-purple-900 tracking-wider">
                        Kalkulasi Skor Otomatis:
                      </span>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        Total {quizQuestions.length} Soal • Bobot nilai @
                        <span className="text-purple-700 font-black text-sm">{pointPerQuestion}</span> poin per soal
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-purple-600 text-white font-black text-[11px]">
                      Maksimal: 100 Poin
                    </div>
                  </div>

                  {/* List of Questions */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs">
                        Daftar Soal ({quizQuestions.length})
                      </span>
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Soal</span>
                      </button>
                    </div>

                    {quizQuestions.map((q, qIdx) => (
                      <div
                        key={q.id}
                        className="p-3.5 bg-white rounded-xl border border-purple-200/80 shadow-2xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-purple-900 text-xs">
                            Soal #{qIdx + 1} (@{pointPerQuestion} Poin)
                          </span>
                          {quizQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIdx)}
                              className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                              title="Hapus soal ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Pertanyaan */}
                        <textarea
                          rows={2}
                          required
                          value={q.questionText}
                          onChange={(e) =>
                            handleUpdateQuestion(qIdx, 'questionText', e.target.value)
                          }
                          placeholder={`Tuliskan teks pertanyaan nomor ${qIdx + 1}...`}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none text-xs"
                        />

                        {/* Opsi Pilihan A, B, C, D */}
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-bold text-slate-500 uppercase">
                            Pilihan Jawaban & Tandai Kunci Jawaban Benar (●):
                          </div>
                          {q.options.map((opt, optIdx) => {
                            const optLetter = String.fromCharCode(65 + optIdx); // A, B, C, D
                            const isCorrect = q.correctOptionIndex === optIdx;

                            return (
                              <div
                                key={optIdx}
                                className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all ${
                                  isCorrect
                                    ? 'bg-purple-50 border-purple-400'
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                                  <input
                                    type="radio"
                                    name={`correct_${q.id}`}
                                    checked={isCorrect}
                                    onChange={() =>
                                      handleUpdateQuestion(qIdx, 'correctOptionIndex', optIdx)
                                    }
                                    className="accent-purple-600 w-3.5 h-3.5"
                                  />
                                  <span
                                    className={`px-1.5 py-0.5 rounded font-black text-[10px] ${
                                      isCorrect
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {optLetter}
                                  </span>
                                </label>

                                <input
                                  type="text"
                                  required
                                  value={opt}
                                  onChange={(e) =>
                                    handleUpdateOption(qIdx, optIdx, e.target.value)
                                  }
                                  placeholder={`Teks pilihan ${optLetter}...`}
                                  className="w-full bg-transparent border-0 focus:outline-none text-xs text-slate-800"
                                />

                                {isCorrect && (
                                  <span className="text-[9px] font-black text-purple-700 uppercase shrink-0 px-2 py-0.5 bg-purple-100 rounded">
                                    Kunci Benar
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bagian Khusus: TUGAS PRAKTIK LAPANGAN */}
              {taskType === 'praktik' && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Petunjuk Praktik Lapangan & Foto Bukti</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Instruksi Praktik Langkah demi Langkah *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={newTaskForm.practicalInstructions}
                      onChange={(e) =>
                        setNewTaskForm({
                          ...newTaskForm,
                          practicalInstructions: e.target.value,
                        })
                      }
                      placeholder="Contoh:&#10;1. Siapkan kain mitela lipat 8.&#10;2. Praktikkan balut luka lengan bersama rekan.&#10;3. Ambil foto hasil simpul mati dari jarak dekat.&#10;4. Jelaskan kenyamanan korban pada catatan laporan."
                      className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* Deskripsi Tambahan */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan / Ringkasan untuk Siswa
                </label>
                <textarea
                  rows={2}
                  value={newTaskForm.description}
                  onChange={(e) =>
                    setNewTaskForm({ ...newTaskForm, description: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  placeholder="Opsional: Tuliskan pesan semangat atau referensi buku panduan PMR..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsNewTaskOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Terbitkan Penugasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Hasil Jawaban Pilgan Modal */}
      {viewingAnswersSubmission && selectedTask?.questions && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-xl max-h-[85vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-purple-50 shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-600" />
                  <span>Rincian Hasil Kuis: {viewingAnswersSubmission.studentName}</span>
                </h3>
                <span className="text-[11px] text-slate-500">
                  Skor: <strong className="text-purple-700 font-black">{viewingAnswersSubmission.score} / 100</strong> • {viewingAnswersSubmission.correctCount} dari {viewingAnswersSubmission.totalQuestions} Soal Benar
                </span>
              </div>
              <button
                onClick={() => setViewingAnswersSubmission(null)}
                className="p-2 hover:bg-slate-200 text-slate-500 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              {selectedTask.questions.map((q, idx) => {
                const studentAnswerIdx = viewingAnswersSubmission.answers?.[q.id];
                const isCorrect = studentAnswerIdx === q.correctOptionIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-xl border ${
                      isCorrect
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : 'bg-rose-50/60 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-slate-900">
                        Soal #{idx + 1}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                          isCorrect
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {isCorrect ? 'Benar (+20 Poin)' : 'Salah (0 Poin)'}
                      </span>
                    </div>

                    <div className="font-medium text-slate-800 mb-2">
                      {q.questionText}
                    </div>

                    <div className="space-y-1">
                      {q.options.map((opt, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const isChosen = studentAnswerIdx === optIdx;
                        const isKey = q.correctOptionIndex === optIdx;

                        return (
                          <div
                            key={optIdx}
                            className={`p-1.5 rounded-lg flex items-center justify-between text-[11px] ${
                              isKey
                                ? 'bg-emerald-100/80 font-bold text-emerald-950 border border-emerald-300'
                                : isChosen
                                ? 'bg-rose-100/80 font-bold text-rose-950 border border-rose-300'
                                : 'text-slate-600'
                            }`}
                          >
                            <span>
                              {letter}. {opt}
                            </span>
                            {isChosen && (
                              <span className="text-[9px] font-black uppercase ml-2 text-rose-700">
                                [Pilihan Siswa]
                              </span>
                            )}
                            {isKey && (
                              <span className="text-[9px] font-black uppercase ml-2 text-emerald-700">
                                [Kunci Benar]
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Manual Grading / Review Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-md">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Evaluasi: {gradingSubmission.studentName}
                </h3>
                <span className="text-[10px] text-slate-500">
                  Dikumpulkan pada {gradingSubmission.submittedDate}
                </span>
              </div>
              <button
                onClick={() => setGradingSubmission(null)}
                className="p-2 hover:bg-slate-200 text-slate-500 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="p-5 space-y-4 text-xs">
              {gradingSubmission.notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Catatan dari Siswa:
                  </span>
                  <p className="text-slate-800 mt-1 italic">
                    &quot;{gradingSubmission.notes}&quot;
                  </p>
                </div>
              )}

              {gradingSubmission.fileUrl && (
                <div className="p-2 bg-slate-100 rounded-xl text-center">
                  <DriveImage
                    src={gradingSubmission.fileUrl}
                    alt="Bukti Praktik"
                    className="max-h-48 rounded-lg mx-auto object-cover border border-slate-200"
                    fallbackType="avatar"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nilai Angka (0 - 100) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={gradeScore}
                  onChange={(e) => setGradeScore(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Umpan Balik / Evaluasi Pembina
                </label>
                <textarea
                  rows={3}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  placeholder="Komentar perbaikan atau apresiasi terhadap hasil praktik siswa..."
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Simpan Nilai & Komentar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
