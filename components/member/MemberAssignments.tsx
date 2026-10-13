'use client';

import React, { useState } from 'react';
import { DatabaseState, Assignment, Submission, User, QuizQuestion } from '@/types/pmr';
import { PhotoUpload } from '@/components/common/PhotoUpload';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  UploadCloud,
  X,
  Check,
  Star,
  FileText,
  HelpCircle,
  Camera,
  Award,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Eye,
} from 'lucide-react';

interface MemberAssignmentsProps {
  db: DatabaseState;
  currentUser: User;
  onUpdateDb: (newDb: DatabaseState) => void;
}

export const MemberAssignments: React.FC<MemberAssignmentsProps> = ({
  db,
  currentUser,
  onUpdateDb,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'pilgan' | 'praktik'>('all');

  // Praktik Modal State
  const [selectedTaskToSubmit, setSelectedTaskToSubmit] = useState<Assignment | null>(null);
  const [submissionPhoto, setSubmissionPhoto] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Pilgan Quiz Modal State
  const [activeQuizTask, setActiveQuizTask] = useState<Assignment | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResultModal, setQuizResultModal] = useState<{
    task: Assignment;
    score: number;
    correctCount: number;
    totalQuestions: number;
  } | null>(null);

  const [viewDiscussionTask, setViewDiscussionTask] = useState<Assignment | null>(null);

  const mySubmissions = db.submissions.filter(
    (s) => s.userId === currentUser.id
  );

  const filteredTasks = db.assignments.filter((t) => {
    if (filterType === 'all') return true;
    return (t.type || 'praktik') === filterType;
  });

  // Handler buka submit tugas praktik
  const handleOpenSubmit = (task: Assignment) => {
    setSelectedTaskToSubmit(task);
    const existing = mySubmissions.find((s) => s.taskId === task.id);
    if (existing) {
      setSubmissionPhoto(existing.fileUrl || '');
      setNotes(existing.notes || '');
    } else {
      setSubmissionPhoto('');
      setNotes('');
    }
  };

  // Handler kirim tugas praktik
  const handleSubmitPraktik = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskToSubmit) return;

    const existingIdx = db.submissions.findIndex(
      (s) => s.taskId === selectedTaskToSubmit.id && s.userId === currentUser.id
    );

    let updated = [...db.submissions];
    const nowStr = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString(
      'id-ID',
      { hour: '2-digit', minute: '2-digit' }
    )}`;

    if (existingIdx !== -1) {
      updated[existingIdx] = {
        ...updated[existingIdx],
        fileUrl: submissionPhoto,
        notes,
        submittedDate: nowStr,
        status: 'Pending',
      };
    } else {
      const newSub: Submission = {
        id: `SUB-${Date.now().toString().slice(-4)}`,
        taskId: selectedTaskToSubmit.id,
        userId: currentUser.id,
        studentName: currentUser.fullName,
        score: null,
        feedback: '',
        submittedDate: nowStr,
        fileUrl: submissionPhoto,
        fileName: `praktik_${currentUser.username}.jpg`,
        notes,
        status: 'Pending',
      };
      updated.push(newSub);
    }

    onUpdateDb({ ...db, submissions: updated });
    setSelectedTaskToSubmit(null);
  };

  // Handler buka kuis pilihan ganda
  const handleStartQuiz = (task: Assignment) => {
    setActiveQuizTask(task);
    const existing = mySubmissions.find((s) => s.taskId === task.id);
    if (existing && existing.answers) {
      setQuizAnswers(existing.answers);
    } else {
      setQuizAnswers({});
    }
  };

  // Handler submit kuis pilihan ganda & perskoran otomatis
  const handleSubmitQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuizTask || !activeQuizTask.questions) return;

    const questions = activeQuizTask.questions;
    const totalQuestions = questions.length;

    // Hitung berapa yang benar berdasarkan input coach
    let correctCount = 0;
    questions.forEach((q) => {
      const studentChosen = quizAnswers[q.id];
      if (studentChosen !== undefined && studentChosen === q.correctOptionIndex) {
        correctCount += 1;
      }
    });

    // Rumus skor: (Jumlah Benar / Total Soal) * 100
    const finalScore =
      totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;

    const nowStr = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString(
      'id-ID',
      { hour: '2-digit', minute: '2-digit' }
    )}`;

    const existingIdx = db.submissions.findIndex(
      (s) => s.taskId === activeQuizTask.id && s.userId === currentUser.id
    );

    let updated = [...db.submissions];
    const newSubmissionData: Submission = {
      id: existingIdx !== -1 ? updated[existingIdx].id : `SUB-${Date.now().toString().slice(-4)}`,
      taskId: activeQuizTask.id,
      userId: currentUser.id,
      studentName: currentUser.fullName,
      score: finalScore,
      feedback: `Menjawab ${correctCount} dari ${totalQuestions} soal dengan benar (Skor otomatis @${(100 / totalQuestions).toFixed(1)} poin/soal).`,
      submittedDate: nowStr,
      fileUrl: '',
      notes: `Mengerjakan kuis online mandiri.`,
      status: 'Dinilai',
      answers: quizAnswers,
      totalQuestions,
      correctCount,
    };

    if (existingIdx !== -1) {
      updated[existingIdx] = newSubmissionData;
    } else {
      updated.push(newSubmissionData);
    }

    onUpdateDb({ ...db, submissions: updated });

    // Tampilkan result popup
    setQuizResultModal({
      task: activeQuizTask,
      score: finalScore,
      correctCount,
      totalQuestions,
    });

    setActiveQuizTask(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-500" />
            <span>Tugas & Praktik Mandiri Siswa</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dua pilihan tugas: Kerjakan <strong>Soal Pilihan Ganda (Pilgan)</strong> dengan penilaian skor instan, atau kumpulkan <strong>Foto Bukti Praktik Lapangan</strong>.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Semua ({db.assignments.length})
          </button>
          <button
            onClick={() => setFilterType('pilgan')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'pilgan'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Soal Pilgan</span>
          </button>
          <button
            onClick={() => setFilterType('praktik')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'praktik'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Praktik Lapangan</span>
          </button>
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTasks.map((task) => {
          const mySub = mySubmissions.find((s) => s.taskId === task.id);
          const isPilgan = task.type === 'pilgan';
          const qCount = task.questions?.length || 0;
          const pointPerQ = qCount > 0 ? (100 / qCount).toFixed(1) : '0';

          return (
            <div
              key={task.id}
              className={`bg-white rounded-3xl border shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-all space-y-4 ${
                isPilgan ? 'border-purple-200/80' : 'border-emerald-200/80'
              }`}
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9.5px] font-black uppercase ${
                        isPilgan
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isPilgan ? (
                        <>
                          <HelpCircle className="w-3 h-3" />
                          <span>Kuis Pilgan ({qCount} Soal)</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-3 h-3" />
                          <span>Praktik Lapangan</span>
                        </>
                      )}
                    </span>

                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {task.category}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{task.deadline.split(' ')[0]}</span>
                  </span>
                </div>

                <h3 className="font-black text-base text-slate-900 leading-snug">
                  {task.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {task.description}
                </p>

                {/* Info Bobot untuk Pilgan */}
                {isPilgan && (
                  <div className="mt-2.5 p-2 bg-purple-50/70 border border-purple-200 rounded-xl text-[10.5px] text-purple-900 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>
                      Perskoran otomatis: <strong>{qCount} Soal</strong> • Bobot nilai <strong>@{pointPerQ} poin per soal</strong>.
                    </span>
                  </div>
                )}

                {/* Info Instruksi Praktik */}
                {!isPilgan && task.practicalInstructions && (
                  <div className="mt-2.5 p-2 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[10.5px] text-emerald-900">
                    <span className="font-bold">Panduan: </span>
                    <span className="line-clamp-2">{task.practicalInstructions}</span>
                  </div>
                )}

                {/* Score & Feedback Box if Graded */}
                {mySub?.score !== null && mySub?.score !== undefined && (
                  <div
                    className={`mt-3.5 p-3 rounded-2xl border space-y-1 ${
                      isPilgan
                        ? 'bg-purple-50/90 border-purple-200'
                        : 'bg-emerald-50/90 border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider">
                        {isPilgan ? 'Hasil Skor Kuis Anda:' : 'Hasil Evaluasi Pembina:'}
                      </span>
                      <span className="text-xs font-black text-emerald-700 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200 shadow-2xs">
                        Nilai: {mySub.score} / 100
                      </span>
                    </div>

                    {isPilgan && mySub.totalQuestions && (
                      <div className="text-[11px] font-bold text-purple-900 pt-0.5">
                        Menjawab Benar {mySub.correctCount} dari {mySub.totalQuestions} Soal
                      </div>
                    )}

                    {mySub.feedback && (
                      <p className="text-xs text-slate-700 italic pt-0.5">
                        &quot;{mySub.feedback}&quot;
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  {mySub ? (
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                        mySub.status === 'Dinilai'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{mySub.status === 'Dinilai' ? 'Telah Dinilai' : 'Menunggu Dinilai'}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Belum Dikerjakan</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isPilgan ? (
                    <>
                      {mySub && (
                        <button
                          onClick={() => setViewDiscussionTask(task)}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl font-bold text-xs transition-all cursor-pointer"
                        >
                          Lihat Pembahasan
                        </button>
                      )}
                      <button
                        onClick={() => handleStartQuiz(task)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{mySub ? 'Kerjakan Ulang' : 'Mulai Kuis Pilgan'}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleOpenSubmit(task)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{mySub ? 'Kirim Ulang / Edit Foto' : 'Kirim Foto Praktik'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Pengerjaan Kuis Pilihan Ganda (Pilgan) */}
      {activeQuizTask && activeQuizTask.questions && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-2xl max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-purple-50 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-purple-600 text-white rounded text-[9.5px] font-black uppercase">
                    KUIS PILIHAN GANDA
                  </span>
                  <span className="text-[10.5px] font-bold text-purple-800 uppercase">
                    {activeQuizTask.category}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg mt-1">
                  {activeQuizTask.title}
                </h3>
                <p className="text-xs text-purple-900/80 mt-0.5">
                  Total {activeQuizTask.questions.length} Soal • Bobot @
                  {(100 / activeQuizTask.questions.length).toFixed(1)} Poin per Soal • Skor maksimal 100
                </p>
              </div>
              <button
                onClick={() => setActiveQuizTask(null)}
                className="p-2 hover:bg-purple-200/50 text-slate-500 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions Form */}
            <form onSubmit={handleSubmitQuiz} className="p-5 overflow-y-auto space-y-5 text-xs">
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 flex items-center justify-between">
                <span className="font-bold text-purple-900">
                  Kemajuan Pengerjaan: {Object.keys(quizAnswers).length} dari{' '}
                  {activeQuizTask.questions.length} Soal Terjawab
                </span>
                <span className="text-[11px] font-mono font-bold text-purple-700">
                  {Math.round(
                    (Object.keys(quizAnswers).length / activeQuizTask.questions.length) * 100
                  )}
                  %
                </span>
              </div>

              {activeQuizTask.questions.map((q, idx) => {
                const currentAnswer = quizAnswers[q.id];

                return (
                  <div
                    key={q.id}
                    className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="font-bold text-slate-900 text-sm leading-snug">
                        {q.questionText}
                      </div>
                    </div>

                    {/* Options list */}
                    <div className="space-y-2 pt-1 pl-8">
                      {q.options.map((opt, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const isSelected = currentAnswer === optIdx;

                        return (
                          <div
                            key={optIdx}
                            onClick={() =>
                              setQuizAnswers({ ...quizAnswers, [q.id]: optIdx })
                            }
                            className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                              isSelected
                                ? 'border-purple-600 bg-purple-50/80 text-purple-950 font-bold shadow-xs'
                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {letter}
                            </span>
                            <span className="text-xs">{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between shrink-0">
                <span className="text-[11px] text-slate-500">
                  {Object.keys(quizAnswers).length === activeQuizTask.questions.length
                    ? '✓ Seluruh soal telah dijawab, siap dikirim.'
                    : `Ada ${
                        activeQuizTask.questions.length - Object.keys(quizAnswers).length
                      } soal yang belum dijawab.`}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveQuizTask(null)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Kumpulkan & Hitung Nilai</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP HASIL NILAI INSTAN KUIS PILGAN */}
      {quizResultModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-md p-6 text-center space-y-4 animate-scale-up">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 mx-auto flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-purple-700 tracking-widest">
                HASIL KUIS SELESAI
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">
                {quizResultModal.task.title}
              </h3>
            </div>

            {/* Score Big Display */}
            <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase">
                Skor Akhir Anda:
              </div>
              <div className="text-4xl font-black text-purple-700 my-1 font-mono">
                {quizResultModal.score} <span className="text-lg text-slate-400">/ 100</span>
              </div>
              <div className="text-xs font-bold text-slate-700">
                Menjawab benar <strong className="text-purple-700">{quizResultModal.correctCount}</strong> dari{' '}
                <strong>{quizResultModal.totalQuestions}</strong> Soal (@
                {(100 / quizResultModal.totalQuestions).toFixed(1)} poin/soal)
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Nilai Anda telah otomatis dicatat dan tersimpan ke buku nilai pembina PMR.
            </p>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => {
                  setViewDiscussionTask(quizResultModal.task);
                  setQuizResultModal(null);
                }}
                className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                Lihat Pembahasan
              </button>
              <button
                onClick={() => setQuizResultModal(null)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Tutup & Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PEMBAHASAN JAWABAN PILGAN */}
      {viewDiscussionTask && viewDiscussionTask.questions && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-xl max-h-[85vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-purple-50 shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-600" />
                  <span>Kunci & Pembahasan: {viewDiscussionTask.title}</span>
                </h3>
                <span className="text-xs text-purple-900">
                  Kaji kembali jawaban Anda dan pahami prinsip materi PMR
                </span>
              </div>
              <button
                onClick={() => setViewDiscussionTask(null)}
                className="p-2 hover:bg-slate-200 text-slate-500 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
              {viewDiscussionTask.questions.map((q, idx) => {
                const sub = mySubmissions.find((s) => s.taskId === viewDiscussionTask.id);
                const studentAnswer = sub?.answers?.[q.id];
                const isCorrect = studentAnswer === q.correctOptionIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-2xl border ${
                      isCorrect
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-rose-50/50 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-slate-900 text-xs">
                        Soal #{idx + 1}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                          isCorrect
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {isCorrect ? 'Jawaban Benar' : 'Jawaban Kurang Tepat'}
                      </span>
                    </div>

                    <div className="font-bold text-slate-800 mb-2">{q.questionText}</div>

                    <div className="space-y-1">
                      {q.options.map((opt, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const isChosen = studentAnswer === optIdx;
                        const isKey = q.correctOptionIndex === optIdx;

                        return (
                          <div
                            key={optIdx}
                            className={`p-2 rounded-lg text-xs flex items-center justify-between ${
                              isKey
                                ? 'bg-emerald-100 font-bold text-emerald-950 border border-emerald-300'
                                : isChosen
                                ? 'bg-rose-100 font-bold text-rose-950 border border-rose-300'
                                : 'text-slate-600 bg-white/60'
                            }`}
                          >
                            <span>
                              {letter}. {opt}
                            </span>
                            {isChosen && (
                              <span className="text-[9px] font-black uppercase text-rose-700 ml-2">
                                [Jawaban Kamu]
                              </span>
                            )}
                            {isKey && (
                              <span className="text-[9px] font-black uppercase text-emerald-700 ml-2">
                                [Kunci Benar]
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="mt-2 p-2 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-700">
                        <strong className="text-purple-700">Penjelasan: </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Pengumpulan Tugas Praktik Lapangan (Foto) */}
      {selectedTaskToSubmit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-lg">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-emerald-50">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase">
                  TUGAS PRAKTIK LAPANGAN
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  Kumpulkan: {selectedTaskToSubmit.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTaskToSubmit(null)}
                className="p-1.5 hover:bg-emerald-200/50 rounded-lg text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPraktik} className="p-5 space-y-4 text-xs">
              <div>
                <PhotoUpload
                  label="Unggah Foto Bukti Hasil Praktik Lapangan *"
                  currentPhotoUrl={submissionPhoto}
                  onPhotoSelected={(url) => setSubmissionPhoto(url)}
                  aspectRatio="portrait"
                  allowCamera={true}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Siswa / Laporan Pengalaman Praktik
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Ceritakan proses kamu melakukan praktik ini (misal: posisi korban, simpul yang digunakan, durasi cuci tangan, dll)..."
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTaskToSubmit(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!submissionPhoto}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Kirim Bukti Praktik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
