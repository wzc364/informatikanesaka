import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Clock,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Home,
  Maximize,
  AlertTriangle,
  Eye,
  X,
  Send,
  ShieldAlert,
  ClipboardList,
} from 'lucide-react';
import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  increment,
  arrayUnion,
} from 'firebase/firestore';
import { SoalQuestion, SoalSet } from '../types';

interface StudentSoalRunnerProps {
  soalSet: SoalSet;
  questions: SoalQuestion[];
  currentStudent: any;
  isAdminPreview?: boolean;
  onExit: () => void;
  onFirestoreError?: (error: unknown, op: 'write' | 'delete', path: string) => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

const formatClock = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
};

export default function StudentSoalRunner({
  soalSet,
  questions,
  currentStudent,
  isAdminPreview = false,
  onExit,
  onFirestoreError,
}: StudentSoalRunnerProps) {
  // Filter active questions & optionally shuffle once per session
  const [orderedQuestions] = useState<SoalQuestion[]>(() => {
    const activeOnly = questions
      .filter(q => q.isActive !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (soalSet.shuffleQuestions && !isAdminPreview) {
      const copy = [...activeOnly];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }
    return activeOnly;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalResult, setFinalResult] = useState<{
    score: number;
    correctCount: number;
    wrongCount: number;
    durationSeconds: number;
  } | null>(null);

  const [startTime] = useState<number>(() => Date.now());
  const [isFullscreenActive, setIsFullscreenActive] = useState<boolean>(() => !!document.fullscreenElement);
  const [localCheatingAttempts, setLocalCheatingAttempts] = useState(0);
  const [localCheatingDetails, setLocalCheatingDetails] = useState<string[]>([]);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const isPerSoal = soalSet.timerMode === 'per_soal';
  const [titleTimeLeft, setTitleTimeLeft] = useState<number>(() =>
    !isPerSoal && soalSet.titleTimerSeconds > 0 ? soalSet.titleTimerSeconds : 0
  );

  const getQuestionDuration = (q: SoalQuestion | undefined) => {
    if (!q) return soalSet.defaultQuestionTimerSeconds || 30;
    return q.timerSeconds > 0 ? q.timerSeconds : (soalSet.defaultQuestionTimerSeconds || 30);
  };

  const [questionTimeLeft, setQuestionTimeLeft] = useState<number>(() =>
    isPerSoal && orderedQuestions[0] ? getQuestionDuration(orderedQuestions[0]) : 0
  );

  const hasSubmittedRef = useRef(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const cheatingAttemptsRef = useRef(localCheatingAttempts);
  cheatingAttemptsRef.current = localCheatingAttempts;
  const cheatingDetailsRef = useRef(localCheatingDetails);
  cheatingDetailsRef.current = localCheatingDetails;

  const currentQuestion = orderedQuestions[currentIndex];
  const sessionCourseId = `soal_${soalSet.id}`;

  // Calculate live score
  const liveScore = useMemo(() => {
    if (orderedQuestions.length === 0) return 0;
    let correct = 0;
    orderedQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    return Math.round((correct / orderedQuestions.length) * 100);
  }, [answers, orderedQuestions]);

  // 1. Sync active_sessions (reuses existing monitoring infrastructure!)
  useEffect(() => {
    if (isAdminPreview || !currentStudent || isCompleted) return;

    const sessionRef = doc(db, 'active_sessions', `${currentStudent.id}_${sessionCourseId}`);
    const pingSession = async () => {
      try {
        await setDoc(
          sessionRef,
          {
            studentId: currentStudent.id,
            studentName: currentStudent.nama,
            courseId: sessionCourseId,
            courseTitle: soalSet.title,
            status: 'working',
            currentScore: liveScore,
            kelas: currentStudent.kelas,
            lastActive: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error('Error pinging soal session:', err);
      }
    };

    pingSession();
    const interval = setInterval(pingSession, 25000);
    return () => clearInterval(interval);
  }, [isAdminPreview, currentStudent, isCompleted, sessionCourseId, soalSet.title, liveScore]);

  // 2. Fullscreen & tab-blur anti-cheating listener (matches Kelola Materi monitoring!)
  useEffect(() => {
    if (isAdminPreview || !currentStudent || !soalSet.isFullScreen || isCompleted) return;
    let active = true;

    const logCheating = async (desc: string) => {
      if (!active) return;
      setLocalCheatingAttempts(prev => prev + 1);
      const entry = JSON.stringify({
        type: 'violation',
        time: new Date().toISOString(),
        desc,
      });
      setLocalCheatingDetails(prev => [...prev, entry]);
      try {
        const sessionRef = doc(db, 'active_sessions', `${currentStudent.id}_${sessionCourseId}`);
        await setDoc(
          sessionRef,
          {
            studentId: currentStudent.id,
            studentName: currentStudent.nama,
            courseId: sessionCourseId,
            courseTitle: soalSet.title,
            kelas: currentStudent.kelas,
            status: 'working',
            cheatingAttempts: increment(1),
            cheatingDetails: arrayUnion(entry),
            lastActive: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error('Error logging soal cheating:', err);
      }
    };

    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreenActive(isFull);
      if (!isFull && !hasSubmittedRef.current) {
        logCheating('Keluar dari layar penuh');
      }
    };

    const handleBlur = () => {
      if (!hasSubmittedRef.current) {
        logCheating('Membuka tab/jendela lain');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      active = false;
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isAdminPreview, currentStudent, soalSet.isFullScreen, soalSet.title, sessionCourseId, isCompleted]);

  // 3. Submit handler
  const submitExam = async () => {
    if (hasSubmittedRef.current || isSubmitting) return;
    hasSubmittedRef.current = true;
    setIsSubmitting(true);
    setShowSubmitConfirm(false);

    const latestAnswers = answersRef.current;
    let correctCount = 0;
    orderedQuestions.forEach(q => {
      if (latestAnswers[q.id] === q.correctAnswer) correctCount++;
    });
    const total = orderedQuestions.length || 1;
    const score = Math.round((correctCount / total) * 100);
    const wrongCount = orderedQuestions.length - correctCount;
    const durationSeconds = Math.max(1, Math.floor((Date.now() - startTime) / 1000));

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    if (!isAdminPreview && currentStudent) {
      try {
        const assessmentId = `${currentStudent.id}_${sessionCourseId}`;
        await setDoc(doc(db, 'assessments', assessmentId), {
          studentId: currentStudent.id,
          studentName: currentStudent.nama,
          studentKelas: currentStudent.kelas,
          courseId: sessionCourseId,
          courseTitle: soalSet.title,
          score,
          wrongAnswers: wrongCount,
          durationSeconds,
          cheatingAttempts: cheatingAttemptsRef.current,
          cheatingDetails: cheatingDetailsRef.current,
          completedAt: new Date().toISOString(),
        });

        await deleteDoc(doc(db, 'active_sessions', `${currentStudent.id}_${sessionCourseId}`)).catch(() => {});

        await addDoc(collection(db, 'notifications'), {
          type: 'course_completion',
          studentId: currentStudent.id,
          studentName: currentStudent.nama,
          courseId: sessionCourseId,
          courseTitle: soalSet.title,
          score,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        onFirestoreError?.(err, 'write', 'assessments');
      }
    }

    setFinalResult({
      score,
      correctCount,
      wrongCount,
      durationSeconds,
    });
    setIsCompleted(true);
    setIsSubmitting(false);
  };

  // 4A. Timer Per Judul
  useEffect(() => {
    if (isPerSoal || soalSet.titleTimerSeconds <= 0 || isCompleted) return;
    const timer = setInterval(() => {
      setTitleTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPerSoal, soalSet.titleTimerSeconds, isCompleted]);

  // 4B. Timer Per Soal
  useEffect(() => {
    if (!isPerSoal || isCompleted || !currentQuestion) return;
    const dur = getQuestionDuration(currentQuestion);
    setQuestionTimeLeft(dur);

    const timer = setInterval(() => {
      setQuestionTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (currentIndex < orderedQuestions.length - 1) {
            setCurrentIndex(i => i + 1);
          } else {
            submitExam();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPerSoal, currentIndex, isCompleted, currentQuestion?.id]);

  // Empty guard
  if (orderedQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-300 flex items-center justify-center p-6">
        <div className="bg-slate-100 border border-slate-300 rounded-[2rem] p-8 max-w-md w-full text-center shadow-xl space-y-4">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <ClipboardList size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900">Belum Ada Soal Aktif</h2>
          <p className="text-sm text-slate-600 font-medium">
            Kartu soal "{soalSet.title}" belum memiliki butir soal yang diaktifkan.
          </p>
          <button
            onClick={onExit}
            className="w-full py-3 bg-brand text-white rounded-xl font-black text-sm"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // Completion screen
  if (isCompleted && finalResult) {
    const canSeeScore = isAdminPreview || (soalSet.isScoreVisible ?? true);
    return (
      <div className="min-h-screen bg-slate-300 flex items-center justify-center p-4 md:p-8">
        <div className="bg-slate-100 border border-slate-300 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl text-center">
          <div className="bg-brand p-10 text-white">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-5 backdrop-blur-sm shadow-lg">
              <CheckCircle size={42} className="text-white" />
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-1">
              {isAdminPreview ? 'Pratinjau Selesai!' : 'Jawaban Terkirim!'}
            </h2>
            <p className="text-white/85 text-sm font-semibold">{soalSet.title}</p>
          </div>

          <div className="p-8 space-y-6">
            {canSeeScore ? (
              <div className="bg-slate-200/80 border border-slate-300 rounded-3xl p-6 space-y-3">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Skor Akhir</p>
                <p
                  className={`text-6xl font-black ${
                    finalResult.score >= 80
                      ? 'text-emerald-600'
                      : finalResult.score >= 60
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  {finalResult.score}
                </p>
                <div className="flex items-center justify-center gap-4 text-xs font-bold pt-2 border-t border-slate-300/70">
                  <span className="text-emerald-700">✓ Benar: {finalResult.correctCount}</span>
                  <span className="text-rose-700">✕ Salah: {finalResult.wrongCount}</span>
                  <span className="text-slate-600">⏱️ {formatClock(finalResult.durationSeconds)}</span>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 space-y-2">
                <Eye size={28} className="text-brand mx-auto" />
                <p className="font-black text-slate-900">Jawaban Anda Sudah Disimpan</p>
                <p className="text-xs text-slate-600 font-medium">
                  Guru menyembunyikan skor sementara pada paket soal ini. Nilai telah dikirim ke sistem guru.
                </p>
              </div>
            )}

            <button
              onClick={onExit}
              className="w-full py-4 bg-brand hover:bg-brand-hover text-white rounded-2xl font-black text-sm shadow-xl shadow-brand/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Home size={18} />
              <span>{isAdminPreview ? 'Kembali ke Kelola Soal' : 'Kembali ke Dashboard'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const maxQDuration = getQuestionDuration(currentQuestion);
  const qTimeRatio = isPerSoal && maxQDuration > 0 ? Math.max(0, Math.min(100, (questionTimeLeft / maxQDuration) * 100)) : 100;

  return (
    <div className="min-h-screen bg-slate-300 text-slate-900 flex flex-col">
      {/* Fullscreen Anti-Cheating Guard Overlay */}
      {!isAdminPreview && soalSet.isFullScreen && !isFullscreenActive && !isCompleted && (
        <div className="fixed inset-0 bg-slate-900 z-[999] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-8">
            <Maximize size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Wajib Layar Penuh</h2>
          <p className="text-slate-300 max-w-md mb-8 leading-relaxed text-sm">
            Guru mewajibkan soal ini dikerjakan dalam mode layar penuh (Fullscreen).
            <br />
            <br />
            <strong>Peringatan!</strong> Keluar dari layar penuh atau membuka tab lain saat ujian berlangsung akan langsung tercatat di sistem pemantauan guru.
          </p>
          <button
            onClick={() => document.documentElement.requestFullscreen().catch(console.error)}
            className="px-8 py-4 bg-brand text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-transform"
          >
            Masuk Layar Penuh Sekarang
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-100/95 backdrop-blur-md border-b border-slate-300 px-4 md:px-8 py-3.5 sticky top-0 z-20 flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-3">
          {(isAdminPreview || !soalSet.isFullScreen) && (
            <button
              onClick={() => {
                if (!isAdminPreview && currentStudent) {
                  deleteDoc(doc(db, 'active_sessions', `${currentStudent.id}_${sessionCourseId}`)).catch(() => {});
                }
                onExit();
              }}
              className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-colors shrink-0"
              title="Keluar"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {isAdminPreview && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded text-[10px] font-black uppercase">
                  Mode Pratinjau Admin
                </span>
              )}
              {!isAdminPreview && soalSet.isFullScreen && (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 border border-rose-200 rounded text-[10px] font-black uppercase flex items-center gap-1">
                  <ShieldAlert size={11} />
                  Terpantau
                </span>
              )}
            </div>
            <h1 className="font-black text-slate-900 text-sm md:text-lg truncate">{soalSet.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Timer Badge */}
          {isPerSoal ? (
            <div
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono font-black text-xs md:text-base ${
                questionTimeLeft <= 5
                  ? 'bg-red-100 border-red-300 text-red-700 animate-pulse'
                  : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}
            >
              <Clock size={15} />
              <span>{questionTimeLeft}s</span>
            </div>
          ) : soalSet.titleTimerSeconds > 0 ? (
            <div
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono font-black text-xs md:text-base ${
                titleTimeLeft <= 60
                  ? 'bg-red-100 border-red-300 text-red-700 animate-pulse'
                  : 'bg-blue-50 border-blue-200 text-brand'
              }`}
            >
              <Clock size={15} />
              <span>{formatClock(titleTimeLeft)}</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold hidden sm:flex items-center gap-1">
              <Clock size={14} />
              <span>Tanpa Batas</span>
            </div>
          )}

          {/* Question Counter */}
          <div className="px-3 py-1.5 bg-slate-200 border border-slate-300 rounded-xl text-xs font-black text-slate-800">
            {currentIndex + 1} / {orderedQuestions.length}
          </div>
        </div>
      </header>

      {/* Per-question timer progress bar */}
      {isPerSoal && (
        <div className="w-full h-1.5 bg-slate-200">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              questionTimeLeft <= 5 ? 'bg-red-500' : 'bg-amber-500'
            }`}
            style={{ width: `${qTimeRatio}%` }}
          />
        </div>
      )}

      {/* Main Question Body */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Palette Nomor Soal (Hanya di mode per_judul supaya tidak loncat waktu di mode per_soal) */}
          {!isPerSoal && orderedQuestions.length > 1 && (
            <div className="bg-slate-100 border border-slate-300 rounded-2xl p-3.5 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider mr-1">
                Navigasi ({answeredCount}/{orderedQuestions.length}):
              </span>
              {orderedQuestions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = answers[q.id] !== undefined;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-8 h-8 rounded-lg font-black text-xs transition-all ${
                      isCurrent
                        ? 'bg-brand text-white ring-2 ring-brand/30 scale-105'
                        : isAnswered
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          )}

          {/* Card Soal Aktif */}
          <div className="bg-slate-100 border border-slate-300 rounded-[2rem] p-6 md:p-10 shadow-sm space-y-6">
            <div className="flex items-center justify-between gap-2">
              <span className="px-3.5 py-1 bg-slate-900 text-white rounded-xl text-xs font-black">
                Pertanyaan #{currentIndex + 1}
              </span>
              {isPerSoal && (
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-xl border border-amber-200">
                  Mode Per Soal &bull; Lanjut otomatis saat waktu habis
                </span>
              )}
            </div>

            {/* Gambar Soal jika ada */}
            {currentQuestion.questionImage && (
              <div className="bg-white border border-slate-300 rounded-2xl p-3 flex flex-col items-center">
                <img
                  src={currentQuestion.questionImage}
                  alt={`Gambar Soal ${currentIndex + 1}`}
                  onClick={() => setLightboxImg(currentQuestion.questionImage || null)}
                  className="max-h-72 w-auto object-contain rounded-xl cursor-zoom-in"
                />
                <span className="text-[10px] font-bold text-slate-400 mt-1.5">Klik gambar untuk memperbesar</span>
              </div>
            )}

            {/* Teks Soal */}
            {currentQuestion.questionText && (
              <h2 className="text-lg md:text-2xl font-black text-slate-900 leading-relaxed whitespace-pre-wrap">
                {currentQuestion.questionText}
              </h2>
            )}

            {/* 4 Opsi Jawaban */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {currentQuestion.options.map((opt, optIdx) => {
                const isSelected = answers[currentQuestion.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() =>
                      setAnswers(prev => ({
                        ...prev,
                        [currentQuestion.id]: optIdx,
                      }))
                    }
                    className={`p-4 md:p-5 rounded-2xl border-2 text-left transition-all flex items-start gap-3.5 group active:scale-[0.99] ${
                      isSelected
                        ? 'bg-blue-50 border-brand ring-2 ring-brand/20 shadow-md'
                        : 'bg-white border-slate-300 hover:border-brand/50 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-brand text-white'
                          : 'bg-slate-200 text-slate-700 group-hover:bg-blue-100 group-hover:text-brand'
                      }`}
                    >
                      {OPTION_LABELS[optIdx]}
                    </span>

                    <div className="flex-1 min-w-0 space-y-2.5">
                      {opt.text && (
                        <p className={`text-sm md:text-base font-bold break-words ${isSelected ? 'text-blue-950' : 'text-slate-800'}`}>
                          {opt.text}
                        </p>
                      )}
                      {opt.image && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-1.5 w-fit">
                          <img
                            src={opt.image}
                            alt={`Opsi ${OPTION_LABELS[optIdx]}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setLightboxImg(opt.image || null);
                            }}
                            className="max-h-36 w-auto object-contain rounded-lg cursor-zoom-in"
                          />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer Navigation */}
            <div className="pt-5 border-t border-slate-300 flex items-center justify-between gap-3 flex-wrap">
              {!isPerSoal ? (
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                  className="px-5 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs md:text-sm disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Sebelumnya
                </button>
              ) : (
                <div className="text-xs font-bold text-slate-500">
                  Soal {currentIndex + 1} dari {orderedQuestions.length}
                </div>
              )}

              {currentIndex < orderedQuestions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex(i => i + 1)}
                  className="px-6 py-3 bg-brand hover:bg-brand-hover text-white rounded-xl font-black text-xs md:text-sm shadow-md shadow-brand/20 flex items-center gap-2 active:scale-95 transition-all"
                >
                  <span>Soal Berikutnya</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowSubmitConfirm(true)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs md:text-sm shadow-md shadow-emerald-600/20 flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Send size={16} />
                  <span>{isSubmitting ? 'Mengirim...' : 'Kumpulkan Jawaban'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal Konfirmasi Kumpulkan */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-[130] flex items-center justify-center p-4">
          <div className="bg-slate-100 border border-slate-300 rounded-[2rem] w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center shrink-0">
                <Send size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Kumpulkan Jawaban?</h3>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Anda telah menjawab{' '}
                  <span className="font-black text-slate-900">
                    {answeredCount} dari {orderedQuestions.length}
                  </span>{' '}
                  soal.
                  {answeredCount < orderedQuestions.length && (
                    <span className="text-amber-700 font-bold block mt-1">
                      <AlertTriangle size={12} className="inline mr-1" />
                      Masih ada {orderedQuestions.length - answeredCount} soal yang belum dipilih!
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Periksa Lagi
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={submitExam}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs shadow-md"
              >
                {isSubmitting ? 'Mengirim...' : 'Ya, Kumpulkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Image */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-[140] flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute -top-3 -right-3 w-9 h-9 bg-white text-slate-900 rounded-full shadow-lg flex items-center justify-center font-black"
            >
              <X size={18} />
            </button>
            <img
              src={lightboxImg}
              alt="Perbesar Gambar"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain bg-white p-2 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
