import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  CheckCircle,
  X,
  Clock,
  Image as ImageIcon,
  Upload,
  FileSpreadsheet,
  FileText,
  Eye,
  Settings,
  ArrowLeft,
  ChevronRight,
  Lock,
  Maximize,
  Sparkles,
  AlertTriangle,
  Check,
  Layers,
  Shuffle,
  Download,
  ClipboardList,
  ToggleLeft,
  ToggleRight,
  GraduationCap,
  BookOpen,
  CheckSquare,
  Square,
  Wand2,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { COURSES } from '../constants';
import { QuestionAnalysisResult } from '../questionAnalysisTypes';
import { SoalOption, SoalQuestion, SoalSet } from '../types';

interface AdminSoalProps {
  soalSets: SoalSet[];
  soalQuestions: SoalQuestion[];
  materialConfigs?: Record<string, { isActive?: boolean }>;
  onPreviewSet: (set: SoalSet) => void;
  onFirestoreError?: (error: unknown, op: 'create' | 'update' | 'delete' | 'write', path: string) => void;
}

const CARD_THEMES = [
  { bg: 'bg-blue-100/90 border-blue-200', title: 'text-blue-950', accent: 'bg-blue-600 text-white', pill: 'bg-blue-200/80 text-blue-900' },
  { bg: 'bg-emerald-100/90 border-emerald-200', title: 'text-emerald-950', accent: 'bg-emerald-600 text-white', pill: 'bg-emerald-200/80 text-emerald-900' },
  { bg: 'bg-purple-100/90 border-purple-200', title: 'text-purple-950', accent: 'bg-purple-600 text-white', pill: 'bg-purple-200/80 text-purple-900' },
  { bg: 'bg-amber-100/90 border-amber-200', title: 'text-amber-950', accent: 'bg-amber-600 text-white', pill: 'bg-amber-200/80 text-amber-900' },
  { bg: 'bg-indigo-100/90 border-indigo-200', title: 'text-indigo-950', accent: 'bg-indigo-600 text-white', pill: 'bg-indigo-200/80 text-indigo-900' },
  { bg: 'bg-rose-100/90 border-rose-200', title: 'text-rose-950', accent: 'bg-rose-600 text-white', pill: 'bg-rose-200/80 text-rose-900' },
];

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

const compressImageFile = (file: File, maxDim: number, quality = 0.72): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar tidak didukung.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas tidak tersedia.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const webp = canvas.toDataURL('image/webp', quality);
        if (webp.startsWith('data:image/webp')) {
          resolve(webp);
        } else {
          resolve(canvas.toDataURL('image/jpeg', quality));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const formatDurationShort = (sec: number) => {
  if (!sec || sec <= 0) return 'Tanpa Batas';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m > 0 && s > 0) return `${m}m ${s}d`;
  if (m > 0) return `${m} menit`;
  return `${s} detik`;
};

const EMPTY_OPTIONS = (): [SoalOption, SoalOption, SoalOption, SoalOption] => [
  { text: '', image: '' },
  { text: '', image: '' },
  { text: '', image: '' },
  { text: '', image: '' },
];

interface ParsedBulkItem {
  questionText: string;
  questionImage?: string;
  options: [SoalOption, SoalOption, SoalOption, SoalOption];
  correctAnswer: 0 | 1 | 2 | 3;
  timerSeconds: number;
  explanation?: string;
  error?: string;
}

const SAMPLE_BULK_TEXT = `Pertanyaan: Perangkat keras komputer yang berfungsi sebagai otak pemroses data disebut?
A. RAM
B. CPU (Processor)
C. Harddisk
D. Monitor
Kunci: B
Timer: 30
Pembahasan: CPU (Central Processing Unit) bertugas memproses instruksi dan perhitungan utama komputer.

Pertanyaan: Manakah di bawah ini yang termasuk perangkat lunak sistem operasi?
Gambar: https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Tux.svg/240px-Tux.svg.png
A. Microsoft Word
B. Google Chrome
C. Linux Ubuntu
D. Adobe Photoshop
Kunci: C
Timer: 45`;

function parseBulkText(rawText: string, defaultTimer: number): ParsedBulkItem[] {
  const normalized = rawText.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  // Split by blank lines or before lines starting with "Pertanyaan:" / "Soal:" / "1." when previous block has options
  const rawBlocks = normalized.split(/\n\s*\n+/).map(b => b.trim()).filter(Boolean);
  const items: ParsedBulkItem[] = [];

  for (const block of rawBlocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    let questionText = '';
    let questionImage = '';
    const options: [SoalOption, SoalOption, SoalOption, SoalOption] = EMPTY_OPTIONS();
    let correctAnswer: 0 | 1 | 2 | 3 = 0;
    let hasKey = false;
    let timerSeconds = defaultTimer;
    let explanation = '';

    for (const line of lines) {
      const optMatch = line.match(/^([A-Da-d])\s*[.):\-]\s*(.+)$/);
      const optImgMatch = line.match(/^Gambar\s+([A-Da-d])\s*[:=]\s*(.+)$/i);
      const qImgMatch = line.match(/^(?:Gambar(?:\s+Soal)?|Img)\s*[:=]\s*(.+)$/i);
      const keyMatch = line.match(/^(?:Kunci|Jawaban|Answer)\s*[:=]\s*([A-Da-d])/i);
      const timerMatch = line.match(/^(?:Timer|Waktu|Durasi)\s*[:=]\s*(\d+)/i);
      const expMatch = line.match(/^(?:Pembahasan|Penjelasan|Explanation)\s*[:=]\s*(.+)$/i);
      const qPrefixMatch = line.match(/^(?:Pertanyaan|Soal|\d+[.)])\s*[:\-]?\s*(.+)$/i);

      if (optImgMatch) {
        const idx = optImgMatch[1].toUpperCase().charCodeAt(0) - 65;
        if (idx >= 0 && idx < 4) options[idx].image = optImgMatch[2].trim();
      } else if (qImgMatch) {
        questionImage = qImgMatch[1].trim();
      } else if (keyMatch) {
        const idx = keyMatch[1].toUpperCase().charCodeAt(0) - 65;
        if (idx >= 0 && idx < 4) {
          correctAnswer = idx as 0 | 1 | 2 | 3;
          hasKey = true;
        }
      } else if (timerMatch) {
        timerSeconds = Math.max(0, parseInt(timerMatch[1], 10) || 0);
      } else if (expMatch) {
        explanation = expMatch[1].trim();
      } else if (optMatch) {
        const idx = optMatch[1].toUpperCase().charCodeAt(0) - 65;
        if (idx >= 0 && idx < 4) {
          options[idx].text = optMatch[2].trim();
        }
      } else if (qPrefixMatch && !questionText) {
        questionText = qPrefixMatch[1].trim();
      } else if (!questionText) {
        questionText = line;
      } else if (!options[0].text && !options[1].text) {
        questionText += ' ' + line;
      }
    }

    const filledOpts = options.filter(o => o.text.trim() || o.image?.trim()).length;
    let error: string | undefined;
    if (!questionText.trim() && !questionImage.trim()) {
      error = 'Teks/gambar pertanyaan kosong';
    } else if (filledOpts < 4) {
      error = `Baru ${filledOpts}/4 opsi terisi (harus 4 opsi A-D)`;
    } else if (!hasKey) {
      error = 'Kunci jawaban (A/B/C/D) belum ditentukan';
    }

    items.push({
      questionText: questionText.trim(),
      questionImage: questionImage.trim(),
      options,
      correctAnswer,
      timerSeconds,
      explanation: explanation.trim(),
      error,
    });
  }

  return items;
}

const QUESTION_ANALYSIS_STORAGE_KEY = 'ruang_informatika_question_analyses_v1';

interface MaterialCandidateQuestion {
  uid: string;
  sourceLabel: string;
  courseTitle: string;
  topicTitle: string;
  questionText: string;
  options: [SoalOption, SoalOption, SoalOption, SoalOption];
  correctAnswer: 0 | 1 | 2 | 3;
  explanation?: string;
}

function stripChoicePrefix(text: string): string {
  return String(text || '').replace(/^[A-Ea-e][).:\]]\s+/, '').trim();
}

function toFourSoalOptions(rawOptions: string[]): [SoalOption, SoalOption, SoalOption, SoalOption] {
  const cleaned = (Array.isArray(rawOptions) ? rawOptions : []).slice(0, 4).map((opt) => ({
    text: stripChoicePrefix(opt),
  }));
  while (cleaned.length < 4) {
    cleaned.push({ text: '' });
  }
  return cleaned as [SoalOption, SoalOption, SoalOption, SoalOption];
}

function resolveAnalysisAnswerIndex(kunci: string, rawOptions: string[]): 0 | 1 | 2 | 3 {
  const trimmed = String(kunci || '').trim();
  const letterMatch = trimmed.match(/^([A-Da-d])(?:\b|[.):\]])/);
  if (letterMatch) {
    const idx = letterMatch[1].toUpperCase().charCodeAt(0) - 65;
    if (idx >= 0 && idx < 4) return idx as 0 | 1 | 2 | 3;
  }
  const cleanKey = stripChoicePrefix(trimmed).toLowerCase();
  const matchedIdx = rawOptions.findIndex(
    (o) => stripChoicePrefix(o).toLowerCase() === cleanKey
  );
  if (matchedIdx >= 0 && matchedIdx < 4) {
    return matchedIdx as 0 | 1 | 2 | 3;
  }
  return 0;
}

function normalizeQuestionFingerprint(text: string): string {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export default function AdminSoal({
  soalSets,
  soalQuestions,
  materialConfigs,
  onPreviewSet,
  onFirestoreError,
}: AdminSoalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [questionSearch, setQuestionSearch] = useState('');

  // Create / Edit SoalSet Modal
  const [isSetModalOpen, setIsSetModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<SoalSet | null>(null);
  const [setTitle, setSetTitle] = useState('');
  const [setDesc, setSetDesc] = useState('');
  const [setKelas, setSetKelas] = useState('Semua Kelas');
  const [setIsActive, setSetIsActive] = useState(true);
  const [isSavingSet, setIsSavingSet] = useState(false);

  // Settings / Timer Modal for SoalSet
  const [settingsModalSet, setSettingsModalSet] = useState<SoalSet | null>(null);
  const [cfgTimerMode, setCfgTimerMode] = useState<'per_judul' | 'per_soal'>('per_judul');
  const [cfgTitleMinutes, setCfgTitleMinutes] = useState(15);
  const [cfgTitleSeconds, setCfgTitleSeconds] = useState(0);
  const [cfgDefaultQuestionSec, setCfgDefaultQuestionSec] = useState(30);
  const [cfgFullScreen, setCfgFullScreen] = useState(false);
  const [cfgScoreVisible, setCfgScoreVisible] = useState(true);
  const [cfgShuffle, setCfgShuffle] = useState(false);
  const [cfgIsActive, setCfgIsActive] = useState(true);
  const [isSavingCfg, setIsSavingCfg] = useState(false);

  // Manual Add / Edit Question Modal
  const [isQModalOpen, setIsQModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<SoalQuestion | null>(null);
  const [qText, setQText] = useState('');
  const [qImage, setQImage] = useState('');
  const [qOptions, setQOptions] = useState<[SoalOption, SoalOption, SoalOption, SoalOption]>(EMPTY_OPTIONS());
  const [qCorrect, setQCorrect] = useState<0 | 1 | 2 | 3>(0);
  const [qTimer, setQTimer] = useState(30);
  const [qExplanation, setQExplanation] = useState('');
  const [qIsActive, setQIsActive] = useState(true);
  const [isSavingQ, setIsSavingQ] = useState(false);
  const [qFormError, setQFormError] = useState('');

  // Bulk Import Modal
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkTab, setBulkTab] = useState<'text' | 'excel'>('text');
  const [bulkText, setBulkText] = useState('');
  const [bulkExcelItems, setBulkExcelItems] = useState<ParsedBulkItem[]>([]);
  const [bulkExcelFilename, setBulkExcelFilename] = useState('');
  const [isSavingBulk, setIsSavingBulk] = useState(false);

  // Delete confirmation modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'set' | 'question';
    id: string;
    label: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lightbox Image Preview
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Ambil Soal dari Kelola Materi Modal
  const [isMaterialPickerOpen, setIsMaterialPickerOpen] = useState(false);
  const [materialSourceTab, setMaterialSourceTab] = useState<'courses' | 'analisis'>('courses');
  const [pickerCourseId, setPickerCourseId] = useState<string>(COURSES[0]?.id || '');
  const [pickerTopicId, setPickerTopicId] = useState<string>('all');
  const [savedAnalyses, setSavedAnalyses] = useState<QuestionAnalysisResult[]>([]);
  const [pickerAnalysisId, setPickerAnalysisId] = useState<string>('');
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerTargetMode, setPickerTargetMode] = useState<'existing' | 'new'>('new');
  const [pickerTargetSetId, setPickerTargetSetId] = useState<string>('');
  const [pickerNewSetTitle, setPickerNewSetTitle] = useState('');
  const [pickerNewSetKelas, setPickerNewSetKelas] = useState('Semua Kelas');
  const [pickerNewSetActive, setPickerNewSetActive] = useState(true);
  const [selectedMaterialQuestionIds, setSelectedMaterialQuestionIds] = useState<Set<string>>(new Set());
  const [isImportingMaterial, setIsImportingMaterial] = useState(false);

  // Tambah Soal AI Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTargetMode, setAiTargetMode] = useState<'existing' | 'new'>('new');
  const [aiTargetSetId, setAiTargetSetId] = useState<string>('');
  const [aiNewSetTitle, setAiNewSetTitle] = useState('');
  const [aiNewSetKelas, setAiNewSetKelas] = useState('Semua Kelas');
  const [aiNewSetActive, setAiNewSetActive] = useState(true);
  const [aiContextMode, setAiContextMode] = useState<'custom' | 'course'>('custom');
  const [aiCourseId, setAiCourseId] = useState<string>(COURSES[0]?.id || '');
  const [aiTopicId, setAiTopicId] = useState<string>('all');
  const [aiTopicPrompt, setAiTopicPrompt] = useState('');
  const [aiJenjang, setAiJenjang] = useState('SMP Kelas VIII');
  const [aiDifficulty, setAiDifficulty] = useState<'Campuran' | 'Mudah' | 'Sedang' | 'Sukar'>('Campuran');
  const [aiCount, setAiCount] = useState<number>(5);
  const [aiInstructions, setAiInstructions] = useState('');
  const [aiGeneratedList, setAiGeneratedList] = useState<
    Array<{
      uid: string;
      selected: boolean;
      questionText: string;
      options: [string, string, string, string];
      correctAnswer: 0 | 1 | 2 | 3;
      explanation: string;
      cognitiveLevel: string;
    }>
  >([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isSavingAi, setIsSavingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const excelInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const selectedSet = useMemo(
    () => soalSets.find(s => s.id === selectedSetId) || null,
    [soalSets, selectedSetId]
  );

  const questionsBySet = useMemo(() => {
    const map: Record<string, SoalQuestion[]> = {};
    soalQuestions.forEach(q => {
      if (!map[q.setId]) map[q.setId] = [];
      map[q.setId].push(q);
    });
    Object.values(map).forEach(arr => arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    return map;
  }, [soalQuestions]);

  const filteredSets = useMemo(() => {
    const sorted = [...soalSets].sort(
      (a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime()
    );
    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.toLowerCase();
    return sorted.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q) ||
        (s.kelas || '').toLowerCase().includes(q)
    );
  }, [soalSets, searchQuery]);

  const activeSetQuestions = useMemo(() => {
    if (!selectedSet) return [];
    const list = questionsBySet[selectedSet.id] || [];
    if (!questionSearch.trim()) return list;
    const q = questionSearch.toLowerCase();
    return list.filter(
      item =>
        item.questionText.toLowerCase().includes(q) ||
        item.options.some(opt => opt.text.toLowerCase().includes(q))
    );
  }, [selectedSet, questionsBySet, questionSearch]);

  const parsedTextItems = useMemo(() => {
    const def = selectedSet?.defaultQuestionTimerSeconds || 30;
    return parseBulkText(bulkText, def);
  }, [bulkText, selectedSet]);

  // ========== KARTU SOAL HANDLERS ==========
  const openCreateSetModal = () => {
    setEditingSet(null);
    setSetTitle('');
    setSetDesc('');
    setSetKelas('Semua Kelas');
    setSetIsActive(true);
    setIsSetModalOpen(true);
  };

  const openEditSetModal = (s: SoalSet) => {
    setEditingSet(s);
    setSetTitle(s.title);
    setSetDesc(s.description || '');
    setSetKelas(s.kelas || 'Semua Kelas');
    setSetIsActive(s.isActive);
    setIsSetModalOpen(true);
  };

  const handleSaveSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setTitle.trim()) return;
    setIsSavingSet(true);
    const now = new Date().toISOString();
    try {
      if (editingSet) {
        await updateDoc(doc(db, 'soal_sets', editingSet.id), {
          title: setTitle.trim(),
          description: setDesc.trim(),
          kelas: setKelas.trim() || 'Semua Kelas',
          isActive: setIsActive,
          updatedAt: now,
        });
        showToast('Kartu soal berhasil diperbarui.');
      } else {
        const newRef = doc(collection(db, 'soal_sets'));
        const newSet: SoalSet = {
          id: newRef.id,
          title: setTitle.trim(),
          description: setDesc.trim(),
          kelas: setKelas.trim() || 'Semua Kelas',
          isActive: setIsActive,
          isFullScreen: false,
          isScoreVisible: true,
          timerMode: 'per_judul',
          titleTimerSeconds: 900, // 15 menit default
          defaultQuestionTimerSeconds: 30,
          shuffleQuestions: false,
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(newRef, newSet);
        setSelectedSetId(newRef.id);
        showToast('Kartu soal baru dibuat! Silakan tambahkan soal.');
      }
      setIsSetModalOpen(false);
    } catch (err) {
      onFirestoreError?.(err, editingSet ? 'update' : 'create', 'soal_sets');
    } finally {
      setIsSavingSet(false);
    }
  };

  const toggleSetActive = async (s: SoalSet) => {
    try {
      await updateDoc(doc(db, 'soal_sets', s.id), {
        isActive: !s.isActive,
        updatedAt: new Date().toISOString(),
      });
      showToast(!s.isActive ? `Kartu "${s.title}" diaktifkan.` : `Kartu "${s.title}" dinonaktifkan.`);
    } catch (err) {
      onFirestoreError?.(err, 'update', `soal_sets/${s.id}`);
    }
  };

  const openSettingsModal = (s: SoalSet) => {
    setSettingsModalSet(s);
    setCfgTimerMode(s.timerMode || 'per_judul');
    const totalSec = s.titleTimerSeconds ?? 900;
    setCfgTitleMinutes(Math.floor(totalSec / 60));
    setCfgTitleSeconds(totalSec % 60);
    setCfgDefaultQuestionSec(s.defaultQuestionTimerSeconds ?? 30);
    setCfgFullScreen(s.isFullScreen ?? false);
    setCfgScoreVisible(s.isScoreVisible ?? true);
    setCfgShuffle(s.shuffleQuestions ?? false);
    setCfgIsActive(s.isActive ?? true);
  };

  const handleSaveSettings = async () => {
    if (!settingsModalSet) return;
    setIsSavingCfg(true);
    try {
      const totalSec = Math.max(0, (Number(cfgTitleMinutes) || 0) * 60 + (Number(cfgTitleSeconds) || 0));
      await updateDoc(doc(db, 'soal_sets', settingsModalSet.id), {
        timerMode: cfgTimerMode,
        titleTimerSeconds: totalSec,
        defaultQuestionTimerSeconds: Math.max(5, Number(cfgDefaultQuestionSec) || 30),
        isFullScreen: cfgFullScreen,
        isScoreVisible: cfgScoreVisible,
        shuffleQuestions: cfgShuffle,
        isActive: cfgIsActive,
        updatedAt: new Date().toISOString(),
      });
      setSettingsModalSet(null);
      showToast('Pengaturan timer & ujian berhasil disimpan.');
    } catch (err) {
      onFirestoreError?.(err, 'update', `soal_sets/${settingsModalSet.id}`);
    } finally {
      setIsSavingCfg(false);
    }
  };

  // ========== QUESTION MANUAL HANDLERS ==========
  const openAddQuestionModal = () => {
    setEditingQuestion(null);
    setQText('');
    setQImage('');
    setQOptions(EMPTY_OPTIONS());
    setQCorrect(0);
    setQTimer(selectedSet?.defaultQuestionTimerSeconds ?? 30);
    setQExplanation('');
    setQIsActive(true);
    setQFormError('');
    setIsQModalOpen(true);
  };

  const openEditQuestionModal = (q: SoalQuestion) => {
    setEditingQuestion(q);
    setQText(q.questionText || '');
    setQImage(q.questionImage || '');
    const opts = q.options || EMPTY_OPTIONS();
    setQOptions([
      { text: opts[0]?.text || '', image: opts[0]?.image || '' },
      { text: opts[1]?.text || '', image: opts[1]?.image || '' },
      { text: opts[2]?.text || '', image: opts[2]?.image || '' },
      { text: opts[3]?.text || '', image: opts[3]?.image || '' },
    ]);
    setQCorrect(q.correctAnswer ?? 0);
    setQTimer(q.timerSeconds ?? selectedSet?.defaultQuestionTimerSeconds ?? 30);
    setQExplanation(q.explanation || '');
    setQIsActive(q.isActive ?? true);
    setQFormError('');
    setIsQModalOpen(true);
  };

  const handleUploadImage = async (
    file: File | undefined,
    target: 'question' | number
  ) => {
    if (!file) return;
    try {
      const maxDim = target === 'question' ? 760 : 480;
      const dataUrl = await compressImageFile(file, maxDim, 0.72);
      if (dataUrl.length > 350000) {
        setQFormError('Ukuran gambar terlalu besar setelah kompresi. Gunakan gambar lebih kecil atau URL.');
        return;
      }
      setQFormError('');
      if (target === 'question') {
        setQImage(dataUrl);
      } else {
        setQOptions(prev => {
          const next = [...prev] as [SoalOption, SoalOption, SoalOption, SoalOption];
          next[target] = { ...next[target], image: dataUrl };
          return next;
        });
      }
    } catch (err: any) {
      setQFormError(err?.message || 'Gagal memproses gambar.');
    }
  };

  const saveManualQuestion = async (addAnother: boolean) => {
    if (!selectedSet) return;
    if (!qText.trim() && !qImage.trim()) {
      setQFormError('Pertanyaan harus memiliki teks atau gambar.');
      return;
    }
    for (let i = 0; i < 4; i++) {
      if (!qOptions[i].text.trim() && !qOptions[i].image?.trim()) {
        setQFormError(`Opsi ${OPTION_LABELS[i]} wajib diisi teks atau gambar.`);
        return;
      }
    }

    setIsSavingQ(true);
    setQFormError('');
    const now = new Date().toISOString();
    try {
      const cleanOptions = qOptions.map(o => ({
        text: o.text.trim(),
        ...(o.image?.trim() ? { image: o.image.trim() } : {}),
      })) as [SoalOption, SoalOption, SoalOption, SoalOption];

      if (editingQuestion) {
        await updateDoc(doc(db, 'soal_questions', editingQuestion.id), {
          questionText: qText.trim(),
          questionImage: qImage.trim(),
          options: cleanOptions,
          correctAnswer: qCorrect,
          timerSeconds: Math.max(0, Number(qTimer) || 0),
          explanation: qExplanation.trim(),
          isActive: qIsActive,
          updatedAt: now,
        });
        showToast('Soal berhasil diperbarui.');
        setIsQModalOpen(false);
      } else {
        const existingList = questionsBySet[selectedSet.id] || [];
        const maxOrder = existingList.reduce((max, item) => Math.max(max, item.order ?? 0), 0);
        const newRef = doc(collection(db, 'soal_questions'));
        const newQ: SoalQuestion = {
          id: newRef.id,
          setId: selectedSet.id,
          order: maxOrder + 1,
          isActive: qIsActive,
          questionText: qText.trim(),
          ...(qImage.trim() ? { questionImage: qImage.trim() } : {}),
          options: cleanOptions,
          correctAnswer: qCorrect,
          timerSeconds: Math.max(0, Number(qTimer) || 0),
          ...(qExplanation.trim() ? { explanation: qExplanation.trim() } : {}),
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(newRef, newQ);
        await updateDoc(doc(db, 'soal_sets', selectedSet.id), { updatedAt: now });

        if (addAnother) {
          setQText('');
          setQImage('');
          setQOptions(EMPTY_OPTIONS());
          setQCorrect(0);
          setQTimer(selectedSet.defaultQuestionTimerSeconds ?? 30);
          setQExplanation('');
          setQIsActive(true);
          showToast(`Soal #${existingList.length + 1} tersimpan! Silakan lanjut tambah soal berikutnya.`);
        } else {
          setIsQModalOpen(false);
          showToast('Soal baru berhasil ditambahkan.');
        }
      }
    } catch (err) {
      onFirestoreError?.(err, editingQuestion ? 'update' : 'create', 'soal_questions');
    } finally {
      setIsSavingQ(false);
    }
  };

  const toggleQuestionActive = async (q: SoalQuestion) => {
    try {
      await updateDoc(doc(db, 'soal_questions', q.id), {
        isActive: !q.isActive,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      onFirestoreError?.(err, 'update', `soal_questions/${q.id}`);
    }
  };

  const toggleAllQuestionsActive = async (activate: boolean) => {
    if (!selectedSet) return;
    const list = questionsBySet[selectedSet.id] || [];
    if (list.length === 0) return;
    try {
      const batch = writeBatch(db);
      const now = new Date().toISOString();
      list.forEach(q => {
        batch.update(doc(db, 'soal_questions', q.id), { isActive: activate, updatedAt: now });
      });
      await batch.commit();
      showToast(activate ? 'Semua soal diaktifkan.' : 'Semua soal dinonaktifkan.');
    } catch (err) {
      onFirestoreError?.(err, 'update', 'soal_questions');
    }
  };

  // ========== DELETE HANDLER ==========
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      if (deleteConfirm.type === 'question') {
        await deleteDoc(doc(db, 'soal_questions', deleteConfirm.id));
        showToast('Soal berhasil dihapus.');
      } else {
        const list = questionsBySet[deleteConfirm.id] || [];
        const batch = writeBatch(db);
        list.forEach(q => batch.delete(doc(db, 'soal_questions', q.id)));
        batch.delete(doc(db, 'soal_sets', deleteConfirm.id));
        await batch.commit();
        if (selectedSetId === deleteConfirm.id) setSelectedSetId(null);
        showToast('Kartu soal beserta seluruh soal di dalamnya berhasil dihapus.');
      }
      setDeleteConfirm(null);
    } catch (err) {
      onFirestoreError?.(err, 'delete', deleteConfirm.type === 'question' ? 'soal_questions' : 'soal_sets');
    } finally {
      setIsDeleting(false);
    }
  };

  // ========== BULK IMPORT HANDLERS ==========
  const handleDownloadTemplate = () => {
    const rows = [
      {
        Pertanyaan: 'Apa kepanjangan dari CPU?',
        'Gambar Soal': '',
        'Opsi A': 'Central Processing Unit',
        'Gambar A': '',
        'Opsi B': 'Computer Personal Unit',
        'Gambar B': '',
        'Opsi C': 'Central Program Utility',
        'Gambar C': '',
        'Opsi D': 'Control Power Unit',
        'Gambar D': '',
        Kunci: 'A',
        Timer: 30,
        Pembahasan: 'CPU adalah Central Processing Unit.',
      },
      {
        Pertanyaan: 'Perangkat yang digunakan untuk menampilkan output visual ke layar adalah?',
        'Gambar Soal': '',
        'Opsi A': 'Keyboard',
        'Gambar A': '',
        'Opsi B': 'Mouse',
        'Gambar B': '',
        'Opsi C': 'Monitor',
        'Gambar C': '',
        'Opsi D': 'Scanner',
        'Gambar D': '',
        Kunci: 'C',
        Timer: 25,
        Pembahasan: 'Monitor merupakan perangkat output visual.',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Soal');
    XLSX.writeFile(wb, 'Template_Bulk_Soal_PG4.xlsx');
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkExcelFilename(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws);
        const defTimer = selectedSet?.defaultQuestionTimerSeconds ?? 30;

        const parsed: ParsedBulkItem[] = rows.map((row) => {
          const getCol = (keys: string[]) => {
            for (const k of Object.keys(row)) {
              const lower = k.toLowerCase().trim();
              if (keys.some(target => lower === target || lower.includes(target))) {
                return String(row[k] ?? '').trim();
              }
            }
            return '';
          };

          const qT = getCol(['pertanyaan', 'soal', 'question']);
          const qImg = getCol(['gambar soal', 'image soal', 'gambar_soal']);
          const optA = getCol(['opsi a', 'pilihan a', 'a']);
          const imgA = getCol(['gambar a', 'image a']);
          const optB = getCol(['opsi b', 'pilihan b', 'b']);
          const imgB = getCol(['gambar b', 'image b']);
          const optC = getCol(['opsi c', 'pilihan c', 'c']);
          const imgC = getCol(['gambar c', 'image c']);
          const optD = getCol(['opsi d', 'pilihan d', 'd']);
          const imgD = getCol(['gambar d', 'image d']);
          const keyRaw = getCol(['kunci', 'jawaban', 'answer']).toUpperCase();
          const timerRaw = getCol(['timer', 'waktu', 'durasi']);
          const expRaw = getCol(['pembahasan', 'penjelasan', 'explanation']);

          const opts: [SoalOption, SoalOption, SoalOption, SoalOption] = [
            { text: optA, image: imgA },
            { text: optB, image: imgB },
            { text: optC, image: imgC },
            { text: optD, image: imgD },
          ];

          const keyChar = keyRaw.charAt(0);
          let keyIdx = ['A', 'B', 'C', 'D'].indexOf(keyChar);
          const hasKey = keyIdx >= 0;
          if (!hasKey) keyIdx = 0;

          const filledOpts = opts.filter(o => o.text || o.image).length;
          let error: string | undefined;
          if (!qT && !qImg) error = 'Pertanyaan kosong';
          else if (filledOpts < 4) error = `Opsi tidak lengkap (${filledOpts}/4)`;
          else if (!hasKey) error = 'Kunci harus A, B, C, atau D';

          return {
            questionText: qT,
            questionImage: qImg,
            options: opts,
            correctAnswer: keyIdx as 0 | 1 | 2 | 3,
            timerSeconds: timerRaw ? Math.max(0, parseInt(timerRaw, 10) || 0) : defTimer,
            explanation: expRaw,
            error,
          };
        });

        setBulkExcelItems(parsed);
      } catch (err) {
        alert('Gagal membaca file Excel/CSV. Pastikan format kolom sesuai template.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleSaveBulk = async () => {
    if (!selectedSet) return;
    const source = bulkTab === 'text' ? parsedTextItems : bulkExcelItems;
    const validItems = source.filter(i => !i.error);
    if (validItems.length === 0) return;

    setIsSavingBulk(true);
    try {
      const existingList = questionsBySet[selectedSet.id] || [];
      let nextOrder = existingList.reduce((max, item) => Math.max(max, item.order ?? 0), 0);
      const now = new Date().toISOString();

      // Firestore batch limit is 500 ops; chunk cleanly by 400
      for (let i = 0; i < validItems.length; i += 400) {
        const chunk = validItems.slice(i, i + 400);
        const batch = writeBatch(db);
        chunk.forEach(item => {
          nextOrder += 1;
          const newRef = doc(collection(db, 'soal_questions'));
          const cleanOpts = item.options.map(o => ({
            text: o.text.trim(),
            ...(o.image?.trim() ? { image: o.image.trim() } : {}),
          })) as [SoalOption, SoalOption, SoalOption, SoalOption];

          const newQ: SoalQuestion = {
            id: newRef.id,
            setId: selectedSet.id,
            order: nextOrder,
            isActive: true,
            questionText: item.questionText.trim(),
            ...(item.questionImage?.trim() ? { questionImage: item.questionImage.trim() } : {}),
            options: cleanOpts,
            correctAnswer: item.correctAnswer,
            timerSeconds: item.timerSeconds,
            ...(item.explanation?.trim() ? { explanation: item.explanation.trim() } : {}),
            createdAt: now,
            updatedAt: now,
          };
          batch.set(newRef, newQ);
        });
        await batch.commit();
      }

      await updateDoc(doc(db, 'soal_sets', selectedSet.id), { updatedAt: now });
      setIsBulkOpen(false);
      setBulkText('');
      setBulkExcelItems([]);
      setBulkExcelFilename('');
      showToast(`${validItems.length} soal berhasil ditambahkan ke "${selectedSet.title}".`);
    } catch (err) {
      onFirestoreError?.(err, 'write', 'soal_questions');
    } finally {
      setIsSavingBulk(false);
    }
  };

  // ========== AMBIL SOAL DARI KELOLA MATERI ==========
  const selectedPickerCourse = useMemo(
    () => COURSES.find((c) => c.id === pickerCourseId) || COURSES[0] || null,
    [pickerCourseId]
  );

  const analysisSetsWithPractice = useMemo(
    () =>
      savedAnalyses.filter(
        (a) => Array.isArray(a.latihanSoalMirip) && a.latihanSoalMirip.length > 0
      ),
    [savedAnalyses]
  );

  const rawMaterialCandidates = useMemo<MaterialCandidateQuestion[]>(() => {
    if (materialSourceTab === 'courses') {
      if (!selectedPickerCourse) return [];
      const topics =
        pickerTopicId === 'all'
          ? selectedPickerCourse.topics
          : selectedPickerCourse.topics.filter((t) => t.id === pickerTopicId);

      const list: MaterialCandidateQuestion[] = [];
      topics.forEach((topic) => {
        (topic.quiz || []).forEach((q, qIdx) => {
          const rawOpts = Array.isArray(q.options) ? q.options : [];
          if (!q.question || rawOpts.length < 2) return;
          const safeCorrect =
            typeof q.correctAnswer === 'number' &&
            q.correctAnswer >= 0 &&
            q.correctAnswer < Math.min(4, rawOpts.length)
              ? (q.correctAnswer as 0 | 1 | 2 | 3)
              : 0;
          list.push({
            uid: `course:${selectedPickerCourse.id}:${topic.id}:${qIdx}`,
            sourceLabel: 'Materi Pembelajaran',
            courseTitle: selectedPickerCourse.title,
            topicTitle: topic.title,
            questionText: q.question.trim(),
            options: toFourSoalOptions(rawOpts),
            correctAnswer: safeCorrect,
            explanation: q.explanation?.trim() || '',
          });
        });
      });
      return list;
    }

    const activeAnalysis =
      analysisSetsWithPractice.find((a) => a.id === pickerAnalysisId) ||
      analysisSetsWithPractice[0];
    if (!activeAnalysis || !Array.isArray(activeAnalysis.latihanSoalMirip)) return [];

    return activeAnalysis.latihanSoalMirip
      .filter((item) => item.pertanyaan && Array.isArray(item.pilihanGanda) && item.pilihanGanda.length >= 2)
      .map((item, idx) => ({
        uid: `analisis:${activeAnalysis.id}:${idx}`,
        sourceLabel: 'Analisis Soal',
        courseTitle: activeAnalysis.title,
        topicTitle: item.konteksAtauTopik || 'Latihan Soal Mirip',
        questionText: item.pertanyaan.trim(),
        options: toFourSoalOptions(item.pilihanGanda),
        correctAnswer: resolveAnalysisAnswerIndex(item.kunciJawaban, item.pilihanGanda),
        explanation: item.pembahasanSingkat?.trim() || '',
      }));
  }, [
    materialSourceTab,
    selectedPickerCourse,
    pickerTopicId,
    analysisSetsWithPractice,
    pickerAnalysisId,
  ]);

  const filteredMaterialCandidates = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    if (!q) return rawMaterialCandidates;
    return rawMaterialCandidates.filter(
      (item) =>
        item.questionText.toLowerCase().includes(q) ||
        item.topicTitle.toLowerCase().includes(q) ||
        item.options.some((o) => o.text.toLowerCase().includes(q))
    );
  }, [rawMaterialCandidates, pickerSearch]);

  const existingTargetFingerprints = useMemo(() => {
    const fp =
      pickerTargetMode === 'existing' && pickerTargetSetId
        ? new Set(
            (questionsBySet[pickerTargetSetId] || []).map((q) =>
              normalizeQuestionFingerprint(q.questionText)
            )
          )
        : new Set<string>();
    return fp;
  }, [pickerTargetMode, pickerTargetSetId, questionsBySet]);

  useEffect(() => {
    if (!isMaterialPickerOpen) return;
    const next = new Set<string>();
    rawMaterialCandidates.forEach((item) => {
      if (!existingTargetFingerprints.has(normalizeQuestionFingerprint(item.questionText))) {
        next.add(item.uid);
      }
    });
    setSelectedMaterialQuestionIds(next);
  }, [isMaterialPickerOpen, rawMaterialCandidates, existingTargetFingerprints]);

  const suggestNewTitleForSelection = (
    tab: 'courses' | 'analisis',
    courseId: string,
    topicId: string,
    analysisId: string,
    analysesList: QuestionAnalysisResult[]
  ) => {
    if (tab === 'courses') {
      const course = COURSES.find((c) => c.id === courseId) || COURSES[0];
      if (!course) return 'Paket Soal Materi';
      if (topicId !== 'all') {
        const topic = course.topics.find((t) => t.id === topicId);
        if (topic) return `Soal ${course.title} - ${topic.title}`;
      }
      return `Latihan Soal: ${course.title}`;
    }
    const found = analysesList.find((a) => a.id === analysisId) || analysesList[0];
    return found ? `Latihan: ${found.title}` : 'Latihan Soal Analisis';
  };

  const openMaterialPicker = (origin: 'top' | 'set') => {
    let loadedAnalyses: QuestionAnalysisResult[] = [];
    try {
      const raw = localStorage.getItem(QUESTION_ANALYSIS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) loadedAnalyses = parsed;
      }
    } catch {
      loadedAnalyses = [];
    }
    setSavedAnalyses(loadedAnalyses);
    const analysesWithPractice = loadedAnalyses.filter(
      (a) => Array.isArray(a.latihanSoalMirip) && a.latihanSoalMirip.length > 0
    );

    const defaultCourse = COURSES[0];
    const defaultCourseId = defaultCourse?.id || '';
    const defaultAnalysisId = analysesWithPractice[0]?.id || '';

    setMaterialSourceTab('courses');
    setPickerCourseId(defaultCourseId);
    setPickerTopicId('all');
    setPickerAnalysisId(defaultAnalysisId);
    setPickerSearch('');

    if (origin === 'set' && selectedSet) {
      setPickerTargetMode('existing');
      setPickerTargetSetId(selectedSet.id);
      setPickerNewSetTitle(
        suggestNewTitleForSelection('courses', defaultCourseId, 'all', defaultAnalysisId, loadedAnalyses)
      );
    } else {
      setPickerTargetMode('new');
      setPickerTargetSetId(soalSets[0]?.id || '');
      setPickerNewSetTitle(
        suggestNewTitleForSelection('courses', defaultCourseId, 'all', defaultAnalysisId, loadedAnalyses)
      );
      setPickerNewSetKelas('Semua Kelas');
      setPickerNewSetActive(true);
    }

    // Pre-select non-duplicate questions from default course
    const targetFp =
      origin === 'set' && selectedSet
        ? new Set(
            (questionsBySet[selectedSet.id] || []).map((q) =>
              normalizeQuestionFingerprint(q.questionText)
            )
          )
        : new Set<string>();
    const initialIds = new Set<string>();
    if (defaultCourse) {
      defaultCourse.topics.forEach((topic) => {
        (topic.quiz || []).forEach((q, qIdx) => {
          if (q.question && Array.isArray(q.options) && q.options.length >= 2) {
            const uid = `course:${defaultCourse.id}:${topic.id}:${qIdx}`;
            if (!targetFp.has(normalizeQuestionFingerprint(q.question))) {
              initialIds.add(uid);
            }
          }
        });
      });
    }
    setSelectedMaterialQuestionIds(initialIds);
    setIsMaterialPickerOpen(true);
  };

  const applySelectionForCurrentList = (
    candidates: MaterialCandidateQuestion[],
    targetMode: 'existing' | 'new',
    targetSetId: string
  ) => {
    const fp =
      targetMode === 'existing' && targetSetId
        ? new Set(
            (questionsBySet[targetSetId] || []).map((q) =>
              normalizeQuestionFingerprint(q.questionText)
            )
          )
        : new Set<string>();
    const next = new Set<string>();
    candidates.forEach((item) => {
      if (!fp.has(normalizeQuestionFingerprint(item.questionText))) {
        next.add(item.uid);
      }
    });
    setSelectedMaterialQuestionIds(next);
  };

  const handlePickerCourseChange = (courseId: string) => {
    setPickerCourseId(courseId);
    setPickerTopicId('all');
    const course = COURSES.find((c) => c.id === courseId);
    if (pickerTargetMode === 'new') {
      setPickerNewSetTitle(
        suggestNewTitleForSelection('courses', courseId, 'all', pickerAnalysisId, savedAnalyses)
      );
    }
    if (course) {
      const candidates: MaterialCandidateQuestion[] = [];
      course.topics.forEach((t) => {
        (t.quiz || []).forEach((q, idx) => {
          if (q.question && Array.isArray(q.options) && q.options.length >= 2) {
            candidates.push({
              uid: `course:${course.id}:${t.id}:${idx}`,
              sourceLabel: 'Materi Pembelajaran',
              courseTitle: course.title,
              topicTitle: t.title,
              questionText: q.question,
              options: toFourSoalOptions(q.options),
              correctAnswer: 0,
            });
          }
        });
      });
      applySelectionForCurrentList(candidates, pickerTargetMode, pickerTargetSetId);
    }
  };

  const handlePickerTopicChange = (topicId: string) => {
    setPickerTopicId(topicId);
    if (pickerTargetMode === 'new') {
      setPickerNewSetTitle(
        suggestNewTitleForSelection('courses', pickerCourseId, topicId, pickerAnalysisId, savedAnalyses)
      );
    }
    if (selectedPickerCourse) {
      const topics =
        topicId === 'all'
          ? selectedPickerCourse.topics
          : selectedPickerCourse.topics.filter((t) => t.id === topicId);
      const candidates: MaterialCandidateQuestion[] = [];
      topics.forEach((t) => {
        (t.quiz || []).forEach((q, idx) => {
          if (q.question && Array.isArray(q.options) && q.options.length >= 2) {
            candidates.push({
              uid: `course:${selectedPickerCourse.id}:${t.id}:${idx}`,
              sourceLabel: 'Materi Pembelajaran',
              courseTitle: selectedPickerCourse.title,
              topicTitle: t.title,
              questionText: q.question,
              options: toFourSoalOptions(q.options),
              correctAnswer: 0,
            });
          }
        });
      });
      applySelectionForCurrentList(candidates, pickerTargetMode, pickerTargetSetId);
    }
  };

  const handleImportFromMaterial = async () => {
    const pickedItems = rawMaterialCandidates.filter((item) =>
      selectedMaterialQuestionIds.has(item.uid)
    );
    if (pickedItems.length === 0) return;

    if (pickerTargetMode === 'new' && !pickerNewSetTitle.trim()) return;
    if (pickerTargetMode === 'existing' && !pickerTargetSetId) return;

    setIsImportingMaterial(true);
    const now = new Date().toISOString();

    try {
      let targetId = pickerTargetSetId;
      let targetTitle = '';
      let defaultTimer = 30;
      let nextOrder = 0;

      if (pickerTargetMode === 'new') {
        const newSetRef = doc(collection(db, 'soal_sets'));
        targetId = newSetRef.id;
        targetTitle = pickerNewSetTitle.trim();
        const newSet: SoalSet = {
          id: targetId,
          title: targetTitle,
          description:
            materialSourceTab === 'courses' && selectedPickerCourse
              ? `Diambil dari Kelola Materi: ${selectedPickerCourse.title}`
              : 'Diambil dari hasil Analisis Soal di Kelola Materi',
          kelas: pickerNewSetKelas.trim() || 'Semua Kelas',
          isActive: pickerNewSetActive,
          isFullScreen: false,
          isScoreVisible: true,
          timerMode: 'per_judul',
          titleTimerSeconds: 900,
          defaultQuestionTimerSeconds: 30,
          shuffleQuestions: false,
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(newSetRef, newSet);
      } else {
        const existingSet = soalSets.find((s) => s.id === pickerTargetSetId);
        if (!existingSet) return;
        targetTitle = existingSet.title;
        defaultTimer = existingSet.defaultQuestionTimerSeconds || 30;
        const existingList = questionsBySet[existingSet.id] || [];
        nextOrder = existingList.reduce((max, item) => Math.max(max, item.order ?? 0), 0);
      }

      for (let i = 0; i < pickedItems.length; i += 400) {
        const chunk = pickedItems.slice(i, i + 400);
        const batch = writeBatch(db);
        chunk.forEach((item) => {
          nextOrder += 1;
          const newQRef = doc(collection(db, 'soal_questions'));
          const newQ: SoalQuestion = {
            id: newQRef.id,
            setId: targetId,
            order: nextOrder,
            isActive: true,
            questionText: item.questionText,
            options: item.options,
            correctAnswer: item.correctAnswer,
            timerSeconds: defaultTimer,
            ...(item.explanation ? { explanation: item.explanation } : {}),
            createdAt: now,
            updatedAt: now,
          };
          batch.set(newQRef, newQ);
        });
        await batch.commit();
      }

      if (pickerTargetMode === 'existing') {
        await updateDoc(doc(db, 'soal_sets', targetId), { updatedAt: now });
      }

      setIsMaterialPickerOpen(false);
      setSelectedSetId(targetId);
      setQuestionSearch('');
      showToast(`${pickedItems.length} soal dari materi berhasil ditambahkan ke "${targetTitle}".`);
    } catch (err) {
      onFirestoreError?.(err, 'write', 'soal_questions');
    } finally {
      setIsImportingMaterial(false);
    }
  };

  // ========== TAMBAH SOAL DENGAN AI ==========
  const selectedAiCourse = useMemo(
    () => COURSES.find((c) => c.id === aiCourseId) || COURSES[0] || null,
    [aiCourseId]
  );

  const openAiQuestionModal = (origin: 'top' | 'set') => {
    setAiError(null);
    setAiGeneratedList([]);
    setAiContextMode('custom');
    setAiCourseId(COURSES[0]?.id || '');
    setAiTopicId('all');
    setAiCount(5);
    setAiDifficulty('Campuran');
    setAiJenjang(selectedSet?.kelas && selectedSet.kelas !== 'Semua Kelas' ? selectedSet.kelas : 'SMP Kelas VIII');
    setAiInstructions('');

    if (origin === 'set' && selectedSet) {
      setAiTargetMode('existing');
      setAiTargetSetId(selectedSet.id);
      setAiTopicPrompt(selectedSet.title);
      setAiNewSetTitle(selectedSet.title);
    } else {
      setAiTargetMode('new');
      setAiTargetSetId(soalSets[0]?.id || '');
      setAiTopicPrompt('');
      setAiNewSetTitle('');
      setAiNewSetKelas('Semua Kelas');
      setAiNewSetActive(true);
    }
    setIsAiModalOpen(true);
  };

  const buildCourseContextText = (): string => {
    if (!selectedAiCourse) return '';
    const topics =
      aiTopicId === 'all'
        ? selectedAiCourse.topics
        : selectedAiCourse.topics.filter((t) => t.id === aiTopicId);
    return topics
      .map((t) => {
        const cleanContent = (t.content || '')
          .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
          .replace(/[#*_`>]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 2600);
        return `Topik: ${t.title}\nRingkasan Materi: ${cleanContent}`;
      })
      .join('\n\n')
      .slice(0, 18000);
  };

  const handleGenerateAiQuestions = async () => {
    setAiError(null);
    const effectiveTopic =
      aiContextMode === 'course' && selectedAiCourse
        ? aiTopicId === 'all'
          ? selectedAiCourse.title
          : `${selectedAiCourse.title} - ${
              selectedAiCourse.topics.find((t) => t.id === aiTopicId)?.title || ''
            }`
        : aiTopicPrompt.trim();

    if (!effectiveTopic) {
      setAiError('Tuliskan topik atau materi soal yang ingin dibuat AI.');
      return;
    }

    const materialContext = aiContextMode === 'course' ? buildCourseContextText() : '';

    setIsGeneratingAi(true);
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: effectiveTopic,
          materialContext,
          jenjang: aiJenjang,
          difficulty: aiDifficulty,
          count: aiCount,
          instructions: aiInstructions.trim(),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 404 && !payload?.error) {
          throw new Error(
            'Endpoint pembuat soal AI belum aktif (HTTP 404). Muat ulang halaman atau pastikan folder /api ikut ter-deploy.'
          );
        }
        throw new Error(
          payload?.error || `Gagal membuat soal dengan AI (HTTP ${response.status}).`
        );
      }

      const rawQs = Array.isArray(payload?.questions) ? payload.questions : [];
      if (rawQs.length === 0) {
        throw new Error('AI tidak menghasilkan soal. Coba ubah topik atau instruksi.');
      }

      const mapped = rawQs.map((q: any, idx: number) => ({
        uid: `ai_${Date.now()}_${idx}`,
        selected: true,
        questionText: String(q.questionText || '').trim(),
        options: [
          String(q.options?.[0] || ''),
          String(q.options?.[1] || ''),
          String(q.options?.[2] || ''),
          String(q.options?.[3] || ''),
        ] as [string, string, string, string],
        correctAnswer: (Number.isInteger(q.correctAnswer) && q.correctAnswer >= 0 && q.correctAnswer <= 3
          ? q.correctAnswer
          : 0) as 0 | 1 | 2 | 3,
        explanation: String(q.explanation || '').trim(),
        cognitiveLevel: String(q.cognitiveLevel || 'C2 Memahami').trim(),
      }));

      setAiGeneratedList(mapped);
      if (aiTargetMode === 'new' && !aiNewSetTitle.trim()) {
        setAiNewSetTitle(`Latihan AI: ${effectiveTopic.slice(0, 60)}`);
      }
    } catch (err: any) {
      setAiError(err?.message || 'Terjadi kendala saat menghubungi layanan AI.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSaveAiQuestions = async () => {
    const selectedItems = aiGeneratedList.filter(
      (q) =>
        q.selected &&
        q.questionText.trim() &&
        q.options.every((opt) => opt.trim().length > 0)
    );
    if (selectedItems.length === 0) {
      setAiError('Pilih minimal 1 soal valid (pertanyaan dan 4 opsi tidak boleh kosong).');
      return;
    }
    if (aiTargetMode === 'new' && !aiNewSetTitle.trim()) {
      setAiError('Isi judul kartu soal baru terlebih dahulu.');
      return;
    }
    if (aiTargetMode === 'existing' && !aiTargetSetId) {
      setAiError('Pilih kartu soal tujuan terlebih dahulu.');
      return;
    }

    setIsSavingAi(true);
    setAiError(null);
    const now = new Date().toISOString();

    try {
      let targetId = aiTargetSetId;
      let targetTitle = '';
      let defaultTimer = 30;
      let nextOrder = 0;

      if (aiTargetMode === 'new') {
        const newSetRef = doc(collection(db, 'soal_sets'));
        targetId = newSetRef.id;
        targetTitle = aiNewSetTitle.trim();
        const newSet: SoalSet = {
          id: targetId,
          title: targetTitle,
          description:
            aiContextMode === 'course' && selectedAiCourse
              ? `Dibuat oleh AI berdasarkan materi: ${selectedAiCourse.title}`
              : `Dibuat oleh AI • Topik: ${aiTopicPrompt.trim() || targetTitle}`,
          kelas: aiNewSetKelas.trim() || 'Semua Kelas',
          isActive: aiNewSetActive,
          isFullScreen: false,
          isScoreVisible: true,
          timerMode: 'per_judul',
          titleTimerSeconds: 900,
          defaultQuestionTimerSeconds: 30,
          shuffleQuestions: false,
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(newSetRef, newSet);
      } else {
        const existingSet = soalSets.find((s) => s.id === aiTargetSetId);
        if (!existingSet) return;
        targetTitle = existingSet.title;
        defaultTimer = existingSet.defaultQuestionTimerSeconds || 30;
        const existingList = questionsBySet[existingSet.id] || [];
        nextOrder = existingList.reduce((max, item) => Math.max(max, item.order ?? 0), 0);
      }

      for (let i = 0; i < selectedItems.length; i += 400) {
        const chunk = selectedItems.slice(i, i + 400);
        const batch = writeBatch(db);
        chunk.forEach((item) => {
          nextOrder += 1;
          const newQRef = doc(collection(db, 'soal_questions'));
          const newQ: SoalQuestion = {
            id: newQRef.id,
            setId: targetId,
            order: nextOrder,
            isActive: true,
            questionText: item.questionText.trim(),
            options: item.options.map((o) => ({ text: o.trim() })) as [
              SoalOption,
              SoalOption,
              SoalOption,
              SoalOption,
            ],
            correctAnswer: item.correctAnswer,
            timerSeconds: defaultTimer,
            ...(item.explanation.trim() ? { explanation: item.explanation.trim() } : {}),
            createdAt: now,
            updatedAt: now,
          };
          batch.set(newQRef, newQ);
        });
        await batch.commit();
      }

      if (aiTargetMode === 'existing') {
        await updateDoc(doc(db, 'soal_sets', targetId), { updatedAt: now });
      }

      setIsAiModalOpen(false);
      setSelectedSetId(targetId);
      setQuestionSearch('');
      showToast(`${selectedItems.length} soal AI berhasil disimpan ke "${targetTitle}".`);
    } catch (err) {
      onFirestoreError?.(err, 'write', 'soal_questions');
    } finally {
      setIsSavingAi(false);
    }
  };

  // ========== RENDER ==========
  return (
    <div className="space-y-6">
      {/* Floating Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[140] bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle size={18} className="text-emerald-400 shrink-0" />
          <span className="text-sm font-bold">{toastMsg}</span>
        </div>
      )}

      {!selectedSet ? (
        /* ================== TOP VIEW: KARTU SOAL SESUAI JUDUL ================== */
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Bank & Kartu Soal (PG 4 Opsi)</h2>
              <p className="text-sm text-slate-600 font-medium mt-0.5">
                Buat kartu soal sesuai judul, atur soal bergambar (manual/bulk), aktifkan kartu, dan atur timer per soal atau per judul.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-slate-200/80 border border-slate-300 px-3.5 py-2 rounded-xl text-xs font-black text-slate-700 flex items-center gap-2">
                <Layers size={14} className="text-brand" />
                <span>{soalSets.length} Kartu • {soalSets.filter(s => s.isActive).length} Aktif • {soalQuestions.length} Butir Soal</span>
              </div>
              <button
                onClick={() => openAiQuestionModal('top')}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-sm shadow-lg shadow-purple-600/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <Sparkles size={18} />
                Buat Soal AI
              </button>
              <button
                onClick={() => openMaterialPicker('top')}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <GraduationCap size={18} />
                Ambil dari Materi
              </button>
              <button
                onClick={openCreateSetModal}
                className="px-4 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl font-black text-sm shadow-lg shadow-brand/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <Plus size={18} />
                Buat Kartu Soal
              </button>
            </div>
          </div>

          {/* Search Kartu Soal */}
          <div className="relative max-w-md">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kartu soal berdasarkan judul atau kelas..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-200/80 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>

          {/* Grid Kartu Soal */}
          {filteredSets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSets.map((set, idx) => {
                const theme = CARD_THEMES[idx % CARD_THEMES.length];
                const allQs = questionsBySet[set.id] || [];
                const activeQs = allQs.filter(q => q.isActive !== false);
                const isTimerPerSoal = set.timerMode === 'per_soal';
                const totalPerSoalSec = activeQs.reduce(
                  (acc, q) => acc + (q.timerSeconds > 0 ? q.timerSeconds : set.defaultQuestionTimerSeconds || 0),
                  0
                );

                return (
                  <div
                    key={set.id}
                    className={`p-6 border-2 rounded-3xl shadow-sm hover:shadow-lg transition-all flex flex-col ${theme.bg}`}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-widest ${
                              set.isActive
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-300 text-slate-700'
                            }`}
                          >
                            {set.isActive ? 'Aktif / Terbit' : 'Nonaktif / Draft'}
                          </span>
                          {set.kelas && (
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${theme.pill}`}>
                              {set.kelas}
                            </span>
                          )}
                        </div>
                        <h3 className={`font-black text-xl leading-snug ${theme.title}`}>
                          {set.title}
                        </h3>
                      </div>

                      {/* Quick Toggle Active Switch directly on Card */}
                      <button
                        onClick={() => toggleSetActive(set)}
                        title={set.isActive ? 'Nonaktifkan kartu soal ini' : 'Aktifkan kartu soal ini'}
                        className={`p-2 rounded-xl shrink-0 shadow-sm transition-all active:scale-95 ${
                          set.isActive
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {set.isActive ? <CheckCircle size={20} /> : <X size={20} />}
                      </button>
                    </div>

                    <p className="text-sm text-slate-700 font-medium line-clamp-2 mb-4">
                      {set.description || 'Paket soal pilihan ganda 4 opsi.'}
                    </p>

                    {/* Info Badges */}
                    <div className="bg-white/75 border border-slate-300/80 rounded-2xl p-3 space-y-2 text-xs font-bold text-slate-700 mb-5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <ClipboardList size={14} className="text-brand" />
                          Jumlah Soal:
                        </span>
                        <span className="font-black text-slate-900">
                          {activeQs.length} Aktif / {allQs.length} Total
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="text-amber-600" />
                          Mode Timer:
                        </span>
                        <span className="font-black text-slate-900">
                          {isTimerPerSoal
                            ? `Per Soal (${set.defaultQuestionTimerSeconds || 30}d def • ~${formatDurationShort(totalPerSoalSec)})`
                            : `Per Judul (${formatDurationShort(set.titleTimerSeconds)})`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/80">
                        <span>{set.isFullScreen ? '🔒 Wajib Fullscreen (Anti-Curang)' : '🔓 Mode Normal'}</span>
                        <span>{set.isScoreVisible !== false ? '👁️ Nilai Tampil' : '👁️‍🗨️ Nilai Tersembunyi'}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto space-y-2.5">
                      <button
                        onClick={() => {
                          setSelectedSetId(set.id);
                          setQuestionSearch('');
                        }}
                        className="w-full py-2.5 px-4 bg-slate-900 hover:bg-brand text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                        <Edit3 size={15} />
                        <span>Buka & Kelola Soal ({allQs.length})</span>
                        <ChevronRight size={15} />
                      </button>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => toggleSetActive(set)}
                          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black transition-all shadow-xs active:scale-95 ${
                            set.isActive
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {set.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button
                          onClick={() => openSettingsModal(set)}
                          className="py-2 px-2.5 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                          title="Pengaturan Timer & Ujian"
                        >
                          <Settings size={14} />
                          <span>Timer</span>
                        </button>
                        <button
                          onClick={() => openEditSetModal(set)}
                          className="py-2 px-2.5 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all"
                          title="Edit Judul Kartu"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => onPreviewSet(set)}
                          disabled={activeQs.length === 0}
                          className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:pointer-events-none"
                          title={activeQs.length === 0 ? 'Tambahkan minimal 1 soal aktif untuk pratinjau' : 'Pratinjau Ujian'}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              type: 'set',
                              id: set.id,
                              label: `${set.title} (${allQs.length} soal)`,
                            })
                          }
                          className="py-2 px-2.5 bg-white hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-all"
                          title="Hapus Kartu Soal"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 bg-slate-200/60 rounded-[2rem] border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-blue-100 text-brand rounded-full flex items-center justify-center mb-4 border border-blue-200">
                <ClipboardList size={38} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">
                {searchQuery ? 'Kartu Soal Tidak Ditemukan' : 'Belum Ada Kartu Soal'}
              </h3>
              <p className="text-sm text-slate-600 font-medium max-w-md mb-6">
                Buat kartu soal baru berdasarkan judul ulangan/latihan, lalu isi dengan soal PG 4 opsi (bisa pakai gambar & upload bulk).
              </p>
              {!searchQuery && (
                <button
                  onClick={openCreateSetModal}
                  className="px-6 py-3 bg-brand hover:bg-brand-hover text-white rounded-2xl font-black text-sm shadow-lg shadow-brand/20 flex items-center gap-2"
                >
                  <Plus size={18} />
                  Buat Kartu Soal Pertama
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        /* ================== INSIDE KARTU SOAL: KELOLA DAFTAR SOAL ================== */
        (() => {
          const allQs = questionsBySet[selectedSet.id] || [];
          const activeCount = allQs.filter(q => q.isActive !== false).length;
          return (
            <div className="space-y-6">
              {/* Top Navigation & Card Controls */}
              <div className="bg-slate-200/80 border border-slate-300 rounded-3xl p-5 md:p-6 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => setSelectedSetId(null)}
                      className="p-2.5 bg-slate-100 hover:bg-white border border-slate-300 rounded-xl text-slate-700 transition-all shrink-0 active:scale-95"
                      title="Kembali ke Daftar Kartu Soal"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-widest ${
                            selectedSet.isActive
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-400 text-white'
                          }`}
                        >
                          {selectedSet.isActive ? 'Kartu Aktif' : 'Kartu Nonaktif'}
                        </span>
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-lg bg-blue-100 text-brand border border-blue-200">
                          {selectedSet.kelas || 'Semua Kelas'}
                        </span>
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Clock size={11} />
                          {selectedSet.timerMode === 'per_soal'
                            ? `Timer Per Soal (Default ${selectedSet.defaultQuestionTimerSeconds || 30}d)`
                            : `Timer Per Judul (${formatDurationShort(selectedSet.titleTimerSeconds)})`}
                        </span>
                        {selectedSet.isFullScreen && (
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-700 border border-rose-200">
                            🔒 Anti-Curang Fullscreen
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">{selectedSet.title}</h2>
                      {selectedSet.description && (
                        <p className="text-xs md:text-sm text-slate-600 font-medium mt-0.5">{selectedSet.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Card-level quick actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => toggleSetActive(selectedSet)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs ${
                        selectedSet.isActive
                          ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {selectedSet.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      {selectedSet.isActive ? 'Nonaktifkan Kartu' : 'Aktifkan Kartu'}
                    </button>
                    <button
                      onClick={() => openSettingsModal(selectedSet)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-white border border-slate-300 text-slate-800 rounded-xl text-xs font-black transition-all flex items-center gap-1.5"
                    >
                      <Clock size={15} className="text-amber-600" />
                      Setelan Timer & Ujian
                    </button>
                    <button
                      onClick={() => onPreviewSet(selectedSet)}
                      disabled={activeCount === 0}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <Eye size={15} />
                      Pratinjau
                    </button>
                  </div>
                </div>

                {/* Toolbar Tambah Soal Manual, Bulk, & Filter */}
                <div className="pt-4 border-t border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      onClick={openAddQuestionModal}
                      className="px-4 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl font-black text-xs md:text-sm shadow-md shadow-brand/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Plus size={17} />
                      Tambah Soal Manual
                    </button>
                    <button
                      onClick={() => {
                        setBulkTab('text');
                        setIsBulkOpen(true);
                      }}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs md:text-sm shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Upload size={16} />
                      Import Bulk Soal
                    </button>
                    <button
                      onClick={() => openMaterialPicker('set')}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs md:text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <GraduationCap size={16} />
                      Ambil dari Materi
                    </button>
                    <button
                      onClick={() => openAiQuestionModal('set')}
                      className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs md:text-sm shadow-md shadow-purple-600/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Sparkles size={16} />
                      Tambah Soal AI
                    </button>
                    {allQs.length > 0 && (
                      <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-300 rounded-xl p-1">
                        <button
                          onClick={() => toggleAllQuestionsActive(true)}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          Aktifkan Semua
                        </button>
                        <button
                          onClick={() => toggleAllQuestionsActive(false)}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          Nonaktifkan Semua
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-600 whitespace-nowrap">
                      {activeCount}/{allQs.length} Soal Aktif
                    </span>
                    <div className="relative flex-1 sm:w-56">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={questionSearch}
                        onChange={(e) => setQuestionSearch(e.target.value)}
                        placeholder="Cari butir soal..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              {activeSetQuestions.length > 0 ? (
                <div className="space-y-4">
                  {activeSetQuestions.map((q, idx) => {
                    const isActiveQ = q.isActive !== false;
                    return (
                      <div
                        key={q.id}
                        className={`bg-slate-100 border-2 rounded-2xl p-5 transition-all ${
                          isActiveQ ? 'border-slate-300 shadow-xs' : 'border-slate-300/60 opacity-70 bg-slate-200/70'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-200">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-black">
                              Soal #{idx + 1}
                            </span>
                            <button
                              onClick={() => toggleQuestionActive(q)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 border ${
                                isActiveQ
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200'
                                  : 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300'
                              }`}
                            >
                              {isActiveQ ? <CheckCircle size={12} /> : <X size={12} />}
                              {isActiveQ ? 'Soal Aktif' : 'Soal Nonaktif'}
                            </button>
                            {selectedSet.timerMode === 'per_soal' && (
                              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-black flex items-center gap-1">
                                <Clock size={12} />
                                {q.timerSeconds > 0
                                  ? `${q.timerSeconds} detik`
                                  : `Default (${selectedSet.defaultQuestionTimerSeconds || 30}d)`}
                              </span>
                            )}
                            {(q.questionImage || q.options.some(o => o.image)) && (
                              <span className="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-black flex items-center gap-1">
                                <ImageIcon size={11} />
                                Bergambar
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditQuestionModal(q)}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-brand border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                            >
                              <Edit3 size={13} />
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  type: 'question',
                                  id: q.id,
                                  label: `Soal #${idx + 1}: "${(q.questionText || 'Soal Bergambar').slice(0, 50)}"`,
                                })
                              }
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                            >
                              <Trash2 size={13} />
                              Hapus
                            </button>
                          </div>
                        </div>

                        {/* Question Body */}
                        <div className="space-y-4">
                          <div className="flex flex-col md:flex-row gap-4 items-start">
                            {q.questionImage && (
                              <button
                                type="button"
                                onClick={() => setLightboxImg(q.questionImage || null)}
                                className="shrink-0 group relative rounded-xl overflow-hidden border border-slate-300 bg-white p-1 shadow-xs hover:ring-2 hover:ring-brand transition-all"
                              >
                                <img
                                  src={q.questionImage}
                                  alt="Gambar Soal"
                                  className="w-40 h-28 object-contain rounded-lg"
                                />
                                <span className="absolute bottom-1.5 right-1.5 bg-slate-900/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                  Perbesar
                                </span>
                              </button>
                            )}
                            <p className="text-slate-900 font-bold text-base leading-relaxed whitespace-pre-wrap flex-1">
                              {q.questionText || <span className="italic text-slate-400">(Soal berupa gambar)</span>}
                            </p>
                          </div>

                          {/* Opsi Jawaban */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {q.options.map((opt, optIdx) => {
                              if (!opt.text?.trim() && !opt.image?.trim()) return null;
                              const isKey = q.correctAnswer === optIdx;
                              return (
                                <div
                                  key={optIdx}
                                  className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                                    isKey
                                      ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-300'
                                      : 'bg-white border-slate-300'
                                  }`}
                                >
                                  <span
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                                      isKey
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {OPTION_LABELS[optIdx]}
                                  </span>
                                  <div className="flex-1 min-w-0 space-y-2">
                                    {opt.text && (
                                      <p className={`text-sm font-semibold break-words ${isKey ? 'text-emerald-950 font-bold' : 'text-slate-800'}`}>
                                        {opt.text}
                                      </p>
                                    )}
                                    {opt.image && (
                                      <button
                                        type="button"
                                        onClick={() => setLightboxImg(opt.image || null)}
                                        className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 p-1 hover:ring-2 hover:ring-brand transition-all block"
                                      >
                                        <img
                                          src={opt.image}
                                          alt={`Gambar Opsi ${OPTION_LABELS[optIdx]}`}
                                          className="max-h-24 w-auto object-contain rounded"
                                        />
                                      </button>
                                    )}
                                  </div>
                                  {isKey && (
                                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0">
                                      ✓ Kunci
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {q.explanation && (
                            <div className="bg-blue-50/80 border border-blue-200 rounded-xl px-4 py-2.5 text-xs text-blue-900">
                              <span className="font-black">Pembahasan: </span>
                              <span className="font-medium">{q.explanation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 bg-slate-200/50 rounded-3xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-4">
                    <ClipboardList size={32} />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-1">
                    {questionSearch ? 'Soal Tidak Ditemukan' : 'Kartu Soal Ini Masih Kosong'}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium max-w-md mb-5">
                    Tambahkan soal pilihan ganda 4 opsi satu per satu secara manual, atau impor banyak soal sekaligus dengan fitur Bulk Soal.
                  </p>
                  {!questionSearch && (
                    <div className="flex items-center gap-3 flex-wrap justify-center">
                      <button
                        onClick={openAddQuestionModal}
                        className="px-5 py-2.5 bg-brand text-white rounded-xl font-black text-xs shadow-md flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Tambah Soal Manual
                      </button>
                      <button
                        onClick={() => {
                          setBulkTab('text');
                          setIsBulkOpen(true);
                        }}
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-md flex items-center gap-2"
                      >
                        <Upload size={16} />
                        Import Bulk Soal
                      </button>
                      <button
                        onClick={() => openMaterialPicker('set')}
                        className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs shadow-md flex items-center gap-2"
                      >
                        <GraduationCap size={16} />
                        Ambil dari Materi
                      </button>
                      <button
                        onClick={() => openAiQuestionModal('set')}
                        className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-black text-xs shadow-md flex items-center gap-2"
                      >
                        <Sparkles size={16} />
                        Tambah Soal AI
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()
      )}

      {/* ================== MODAL BUAT / EDIT KARTU SOAL ================== */}
      {isSetModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-slate-100 border border-slate-300 rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 bg-slate-200 border-b border-slate-300 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">
                {editingSet ? 'Edit Kartu Soal' : 'Buat Kartu Soal Baru'}
              </h3>
              <button
                onClick={() => setIsSetModalOpen(false)}
                className="p-2 hover:bg-slate-300 rounded-xl text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveSet} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1.5">
                  Judul Kartu Soal *
                </label>
                <input
                  type="text"
                  required
                  value={setTitle}
                  onChange={(e) => setSetTitle(e.target.value)}
                  placeholder="Contoh: Ulangan Harian Bab 1 - Berpikir Komputasional"
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1.5">
                  Target Kelas / Label
                </label>
                <input
                  type="text"
                  value={setKelas}
                  onChange={(e) => setSetKelas(e.target.value)}
                  placeholder="Contoh: Semua Kelas / Kelas 7 / Kelas 8"
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1.5">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={3}
                  value={setDesc}
                  onChange={(e) => setSetDesc(e.target.value)}
                  placeholder="Petunjuk singkat pengerjaan soal untuk siswa..."
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
              </div>

              <label className="flex items-center justify-between p-3.5 bg-white border border-slate-300 rounded-xl cursor-pointer">
                <div>
                  <span className="text-sm font-black text-slate-900 block">Aktifkan Kartu Soal</span>
                  <span className="text-xs text-slate-500 font-medium">Siswa dapat melihat dan mengerjakan kartu ini</span>
                </div>
                <input
                  type="checkbox"
                  checked={setIsActive}
                  onChange={(e) => setSetIsActive(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600"
                />
              </label>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSetModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingSet}
                  className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl font-black text-sm shadow-lg shadow-brand/20 disabled:opacity-50"
                >
                  {isSavingSet ? 'Menyimpan...' : editingSet ? 'Simpan Perubahan' : 'Buat Kartu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================== MODAL SETELAN TIMER & UJIAN ================== */}
      {settingsModalSet && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-slate-100 border border-slate-300 rounded-[2rem] w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 bg-slate-200 border-b border-slate-300 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Setelan Timer & Mode Ujian</h3>
                <p className="text-xs font-bold text-slate-600 truncate max-w-md">{settingsModalSet.title}</p>
              </div>
              <button
                onClick={() => setSettingsModalSet(null)}
                className="p-2 hover:bg-slate-300 rounded-xl text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
              {/* Pilihan Mode Timer */}
              <div className="space-y-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-600 block">
                  Pengaturan Timer Soal
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCfgTimerMode('per_judul')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      cfgTimerMode === 'per_judul'
                        ? 'bg-blue-50 border-brand ring-2 ring-brand/20'
                        : 'bg-white border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-sm text-slate-900">Per Judul Soal</span>
                      {cfgTimerMode === 'per_judul' && <CheckCircle size={17} className="text-brand" />}
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      1 batas waktu total untuk menyelesaikan seluruh soal dalam kartu ini.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCfgTimerMode('per_soal')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      cfgTimerMode === 'per_soal'
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400/20'
                        : 'bg-white border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-sm text-slate-900">Per Butir Soal</span>
                      {cfgTimerMode === 'per_soal' && <CheckCircle size={17} className="text-amber-600" />}
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      Setiap soal punya hitung mundur sendiri & lanjut otomatis saat waktu habis.
                    </p>
                  </button>
                </div>
              </div>

              {cfgTimerMode === 'per_judul' ? (
                <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-black text-blue-900 uppercase tracking-wider">
                    Durasi Total Untuk Seluruh Kartu (0 = Tanpa Batas Waktu)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Menit</label>
                      <input
                        type="number"
                        min={0}
                        value={cfgTitleMinutes}
                        onChange={(e) => setCfgTitleMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-black text-slate-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Detik</label>
                      <input
                        type="number"
                        min={0}
                        max={59}
                        value={cfgTitleSeconds}
                        onChange={(e) => setCfgTitleSeconds(Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-black text-slate-900 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
                  <label className="text-xs font-black text-amber-900 uppercase tracking-wider block">
                    Timer Default Per Soal (Detik)
                  </label>
                  <input
                    type="number"
                    min={5}
                    value={cfgDefaultQuestionSec}
                    onChange={(e) => setCfgDefaultQuestionSec(Math.max(5, parseInt(e.target.value, 10) || 30))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-black text-slate-900 text-sm"
                  />
                  <p className="text-[11px] text-amber-800 font-medium">
                    Digunakan bila soal tidak memiliki timer khusus. Anda tetap bisa mengatur timer unik di setiap soal saat edit/tambah soal.
                  </p>
                </div>
              )}

              {/* Toggles */}
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 bg-white border border-slate-300 rounded-2xl cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Maximize size={18} className="text-rose-600 shrink-0" />
                    <div>
                      <span className="text-sm font-black text-slate-900 block">Wajib Fullscreen (Anti-Curang)</span>
                      <span className="text-xs text-slate-500">Pelanggaran keluar layar/pindah tab langsung masuk Monitoring Kecurangan</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={cfgFullScreen}
                    onChange={(e) => setCfgFullScreen(e.target.checked)}
                    className="w-5 h-5 accent-brand"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-white border border-slate-300 rounded-2xl cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Eye size={18} className="text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-sm font-black text-slate-900 block">Tampilkan Skor ke Siswa</span>
                      <span className="text-xs text-slate-500">Perlihatkan nilai akhir langsung setelah siswa selesai mengerjakan</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={cfgScoreVisible}
                    onChange={(e) => setCfgScoreVisible(e.target.checked)}
                    className="w-5 h-5 accent-emerald-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-white border border-slate-300 rounded-2xl cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Shuffle size={18} className="text-indigo-600 shrink-0" />
                    <div>
                      <span className="text-sm font-black text-slate-900 block">Acak Urutan Soal</span>
                      <span className="text-xs text-slate-500">Urutan soal diacak secara otomatis untuk setiap siswa</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={cfgShuffle}
                    onChange={(e) => setCfgShuffle(e.target.checked)}
                    className="w-5 h-5 accent-indigo-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-white border border-slate-300 rounded-2xl cursor-pointer">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-sm font-black text-slate-900 block">Status Kartu Aktif</span>
                      <span className="text-xs text-slate-500">Tampilkan kartu soal ini di dashboard siswa</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={cfgIsActive}
                    onChange={(e) => setCfgIsActive(e.target.checked)}
                    className="w-5 h-5 accent-emerald-600"
                  />
                </label>
              </div>
            </div>

            <div className="p-5 bg-slate-200 border-t border-slate-300 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSettingsModalSet(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-300/60"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSavingCfg}
                onClick={handleSaveSettings}
                className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl font-black text-sm shadow-lg shadow-brand/20 disabled:opacity-50"
              >
                {isSavingCfg ? 'Menyimpan...' : 'Simpan Setelan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================== MODAL TAMBAH / EDIT SOAL MANUAL (1 PER SATU) ================== */}
      {isQModalOpen && selectedSet && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-[115] flex items-center justify-center p-3 md:p-6">
          <div className="bg-slate-100 border border-slate-300 rounded-[2rem] w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="p-5 md:p-6 bg-slate-200 border-b border-slate-300 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-900">
                  {editingQuestion ? 'Edit Butir Soal PG (4 Opsi)' : 'Tambah Soal Manual (1 Per Satu)'}
                </h3>
                <p className="text-xs font-bold text-slate-600 truncate">Kartu: {selectedSet.title}</p>
              </div>
              <button
                onClick={() => setIsQModalOpen(false)}
                className="p-2 hover:bg-slate-300 rounded-xl text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 md:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              {qFormError && (
                <div className="p-3.5 bg-red-100 border border-red-300 rounded-xl text-red-800 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{qFormError}</span>
                </div>
              )}

              {/* Pertanyaan & Gambar Soal */}
              <div className="bg-white border border-slate-300 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Pertanyaan Soal
                  </label>
                  <span className="text-[11px] font-bold text-slate-500">Bisa teks, gambar, atau keduanya</span>
                </div>
                <textarea
                  rows={3}
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Tuliskan pertanyaan di sini..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30"
                />

                {/* Upload / URL Gambar Soal */}
                <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center pt-1">
                  <label className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-black cursor-pointer flex items-center justify-center gap-1.5 shrink-0 transition-all">
                    <ImageIcon size={14} />
                    <span>Upload Gambar Soal</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        handleUploadImage(e.target.files?.[0], 'question');
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    value={qImage.startsWith('data:') ? '' : qImage}
                    onChange={(e) => setQImage(e.target.value)}
                    placeholder="Atau tempel URL gambar soal (https://...)"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                  {qImage && (
                    <button
                      type="button"
                      onClick={() => setQImage('')}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold shrink-0"
                    >
                      Hapus Gambar
                    </button>
                  )}
                </div>

                {qImage && (
                  <div className="p-2 bg-slate-100 border border-slate-200 rounded-xl w-fit">
                    <img src={qImage} alt="Preview Soal" className="max-h-40 rounded-lg object-contain" />
                  </div>
                )}
              </div>

              {/* 4 Opsi Jawaban (A, B, C, D) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Pilihan Ganda (4 Opsi: A, B, C, D) &bull; Klik huruf untuk pilih Kunci Jawaban
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {qOptions.map((opt, idx) => {
                    const isKey = qCorrect === idx;
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border-2 space-y-2.5 transition-all ${
                          isKey
                            ? 'bg-emerald-50/90 border-emerald-500 shadow-sm'
                            : 'bg-white border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setQCorrect(idx as 0 | 1 | 2 | 3)}
                            className={`px-3 py-1 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all ${
                              isKey
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            <span>Opsi {OPTION_LABELS[idx]}</span>
                            {isKey && <Check size={13} />}
                          </button>
                          <span className={`text-[10px] font-black uppercase ${isKey ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {isKey ? 'Kunci Jawaban Benar' : 'Klik jadikan kunci'}
                          </span>
                        </div>

                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQOptions(prev => {
                              const next = [...prev] as [SoalOption, SoalOption, SoalOption, SoalOption];
                              next[idx] = { ...next[idx], text: val };
                              return next;
                            });
                          }}
                          placeholder={`Teks jawaban opsi ${OPTION_LABELS[idx]}...`}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30"
                        />

                        <div className="flex items-center gap-1.5">
                          <label className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-black cursor-pointer flex items-center gap-1 shrink-0">
                            <ImageIcon size={12} />
                            <span>Gambar</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                handleUploadImage(e.target.files?.[0], idx);
                                e.target.value = '';
                              }}
                            />
                          </label>
                          <input
                            type="text"
                            value={opt.image?.startsWith('data:') ? '' : opt.image || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQOptions(prev => {
                                const next = [...prev] as [SoalOption, SoalOption, SoalOption, SoalOption];
                                next[idx] = { ...next[idx], image: val };
                                return next;
                              });
                            }}
                            placeholder="Atau URL gambar opsi..."
                            className="flex-1 min-w-0 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[11px] font-medium text-slate-700"
                          />
                          {opt.image && (
                            <button
                              type="button"
                              onClick={() =>
                                setQOptions(prev => {
                                  const next = [...prev] as [SoalOption, SoalOption, SoalOption, SoalOption];
                                  next[idx] = { ...next[idx], image: '' };
                                  return next;
                                })
                              }
                              className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                              title="Hapus gambar opsi"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>

                        {opt.image && (
                          <div className="p-1.5 bg-white border border-slate-200 rounded-lg w-fit">
                            <img src={opt.image} alt={`Preview ${OPTION_LABELS[idx]}`} className="max-h-24 object-contain rounded" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timer Per Soal & Status & Pembahasan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-300 rounded-2xl p-4 space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-600" />
                    Timer Khusus Soal Ini (Detik)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={qTimer}
                    onChange={(e) => setQTimer(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-black text-slate-900"
                  />
                  <p className="text-[11px] text-slate-500 font-medium">
                    {selectedSet.timerMode === 'per_soal'
                      ? `Aktif dipakai (0 = ikut default kartu ${selectedSet.defaultQuestionTimerSeconds || 30}d).`
                      : 'Saat ini kartu pakai mode Per Judul. Nilai ini otomatis dipakai jika kartu diubah ke mode Per Soal.'}
                  </p>
                </div>

                <div className="bg-white border border-slate-300 rounded-2xl p-4 flex flex-col justify-between gap-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">Status Soal</span>
                      <span className="text-xs text-slate-500">Hanya soal aktif yang tampil ke siswa</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={qIsActive}
                      onChange={(e) => setQIsActive(e.target.checked)}
                      className="w-5 h-5 accent-emerald-600"
                    />
                  </label>
                  <input
                    type="text"
                    value={qExplanation}
                    onChange={(e) => setQExplanation(e.target.value)}
                    placeholder="Pembahasan singkat (opsional)..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-200 border-t border-slate-300 flex flex-wrap justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsQModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-300/60"
              >
                Batal
              </button>
              {!editingQuestion && (
                <button
                  type="button"
                  disabled={isSavingQ}
                  onClick={() => saveManualQuestion(true)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm shadow-md disabled:opacity-50"
                >
                  Simpan & Tambah Lagi
                </button>
              )}
              <button
                type="button"
                disabled={isSavingQ}
                onClick={() => saveManualQuestion(false)}
                className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl font-black text-sm shadow-lg shadow-brand/20 disabled:opacity-50"
              >
                {isSavingQ ? 'Menyimpan...' : editingQuestion ? 'Simpan Perubahan' : 'Simpan Soal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================== MODAL IMPORT BULK SOAL ================== */}
      {isBulkOpen && selectedSet && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-[115] flex items-center justify-center p-3 md:p-6">
          <div className="bg-slate-100 border border-slate-300 rounded-[2rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="p-5 md:p-6 bg-slate-200 border-b border-slate-300 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-900">Import Bulk Soal (Banyak Sekaligus)</h3>
                <p className="text-xs font-bold text-slate-600">Target Kartu: {selectedSet.title}</p>
              </div>
              <button
                onClick={() => setIsBulkOpen(false)}
                className="p-2 hover:bg-slate-300 rounded-xl text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 md:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              {/* Tab Selector */}
              <div className="flex bg-slate-200 p-1 rounded-2xl border border-slate-300 w-fit">
                <button
                  type="button"
                  onClick={() => setBulkTab('text')}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
                    bulkTab === 'text' ? 'bg-brand text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText size={15} />
                  Tempel Teks Soal
                </button>
                <button
                  type="button"
                  onClick={() => setBulkTab('excel')}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
                    bulkTab === 'excel' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet size={15} />
                  Upload Excel / CSV
                </button>
              </div>

              {bulkTab === 'text' ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-blue-950 space-y-1">
                      <p className="font-black">Panduan Format Tempel Teks (pisahkan antar soal dengan 1 baris kosong):</p>
                      <p className="font-medium text-blue-800">
                        Tulis pertanyaan, lalu <code className="bg-white px-1 rounded">A. ... B. ... C. ... D. ...</code>, dan{' '}
                        <code className="bg-white px-1 rounded">Kunci: B</code>. Opsional:{' '}
                        <code className="bg-white px-1 rounded">Gambar: URL</code>,{' '}
                        <code className="bg-white px-1 rounded">Gambar A: URL</code>,{' '}
                        <code className="bg-white px-1 rounded">Timer: 30</code>.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBulkText(SAMPLE_BULK_TEXT)}
                      className="px-3.5 py-2 bg-white hover:bg-blue-100 text-brand border border-blue-300 rounded-xl text-xs font-black shrink-0 flex items-center gap-1.5"
                    >
                      <Sparkles size={14} />
                      Isi Contoh
                    </button>
                  </div>

                  <textarea
                    rows={8}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder="Tempel daftar soal pilihan ganda 4 opsi di sini..."
                    className="w-full p-4 bg-white border border-slate-300 rounded-2xl text-xs md:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-emerald-950 space-y-1">
                      <p className="font-black">Import dari Microsoft Excel (.xlsx) atau CSV</p>
                      <p className="font-medium text-emerald-800">
                        Gunakan kolom: Pertanyaan, Gambar Soal, Opsi A..D, Gambar A..D, Kunci (A/B/C/D), Timer, Pembahasan.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="px-3.5 py-2 bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-black shrink-0 flex items-center gap-1.5"
                    >
                      <Download size={14} />
                      Download Template
                    </button>
                  </div>

                  <div
                    onClick={() => excelInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white rounded-2xl p-8 text-center cursor-pointer transition-all"
                  >
                    <Upload size={28} className="mx-auto text-emerald-600 mb-2" />
                    <p className="text-sm font-black text-slate-800">
                      {bulkExcelFilename ? `File dipilih: ${bulkExcelFilename}` : 'Klik untuk pilih file .xlsx atau .csv'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Data soal akan dipratinjau terlebih dahulu sebelum disimpan</p>
                    <input
                      ref={excelInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleExcelUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* Live Preview of Parsed Questions */}
              {(() => {
                const items = bulkTab === 'text' ? parsedTextItems : bulkExcelItems;
                const validCount = items.filter(i => !i.error).length;
                if (items.length === 0) return null;
                return (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                        Pratinjau Hasil Baca ({validCount} Siap Simpan / {items.length} Total)
                      </h4>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {items.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border text-xs ${
                            item.error
                              ? 'bg-red-50 border-red-300 text-red-900'
                              : 'bg-white border-emerald-300 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-black">#{idx + 1}: {item.questionText || '(Tanpa teks)'}</span>
                            {item.error ? (
                              <span className="px-2 py-0.5 bg-red-600 text-white rounded font-black text-[10px] shrink-0">
                                {item.error}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-600 text-white rounded font-black text-[10px] shrink-0">
                                Valid • Kunci {OPTION_LABELS[item.correctAnswer]} • {item.timerSeconds}d
                              </span>
                            )}
                          </div>
                          {!item.error && (
                            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                              {item.options.map((o, oIdx) => (
                                <span key={oIdx} className={item.correctAnswer === oIdx ? 'font-black text-emerald-700' : ''}>
                                  {OPTION_LABELS[oIdx]}. {o.text || (o.image ? '[Gambar]' : '-')}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="p-5 bg-slate-200 border-t border-slate-300 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsBulkOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-300/60"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={
                  isSavingBulk ||
                  (bulkTab === 'text' ? parsedTextItems : bulkExcelItems).filter(i => !i.error).length === 0
                }
                onClick={handleSaveBulk}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm shadow-lg disabled:opacity-40"
              >
                {isSavingBulk
                  ? 'Mengimpor...'
                  : `Simpan ${(bulkTab === 'text' ? parsedTextItems : bulkExcelItems).filter(i => !i.error).length} Soal`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================== MODAL KONFIRMASI HAPUS ================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-[125] flex items-center justify-center p-4">
          <div className="bg-slate-100 border border-slate-300 rounded-[2rem] w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {deleteConfirm.type === 'set' ? 'Hapus Kartu Soal?' : 'Hapus Butir Soal?'}
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Anda yakin ingin menghapus <span className="font-black text-slate-900">{deleteConfirm.label}</span>? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs shadow-md disabled:opacity-50"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================== MODAL AMBIL SOAL DARI KELOLA MATERI ================== */}
      {isMaterialPickerOpen && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-[120] flex items-center justify-center p-3 md:p-6">
          <div className="bg-slate-100 border border-slate-300 rounded-[2rem] w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-5 md:p-6 bg-slate-200 border-b border-slate-300 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <GraduationCap size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-black text-slate-900 truncate">
                    Ambil Soal dari Kelola Materi
                  </h3>
                  <p className="text-xs font-bold text-slate-600 truncate">
                    Pilih soal kuis yang sudah ada di materi pembelajaran atau hasil Analisis Soal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMaterialPickerOpen(false)}
                className="p-2 hover:bg-slate-300 rounded-xl text-slate-600 shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 md:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              {/* Target Kartu Soal */}
              <div className="bg-white border border-slate-300 rounded-2xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Tujuan Penyimpanan Kartu Soal
                  </span>
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setPickerTargetMode('new')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                        pickerTargetMode === 'new'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      + Buat Kartu Baru
                    </button>
                    <button
                      type="button"
                      disabled={soalSets.length === 0}
                      onClick={() => {
                        setPickerTargetMode('existing');
                        if (!pickerTargetSetId && soalSets[0]) {
                          setPickerTargetSetId(soalSets[0].id);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all disabled:opacity-40 ${
                        pickerTargetMode === 'existing'
                          ? 'bg-brand text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Ke Kartu yang Ada ({soalSets.length})
                    </button>
                  </div>
                </div>

                {pickerTargetMode === 'new' ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
                    <div className="md:col-span-6">
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Judul Kartu Soal Baru *
                      </label>
                      <input
                        type="text"
                        value={pickerNewSetTitle}
                        onChange={(e) => setPickerNewSetTitle(e.target.value)}
                        placeholder="Contoh: Latihan Soal Berpikir Komputasi..."
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs md:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Target Kelas
                      </label>
                      <input
                        type="text"
                        value={pickerNewSetKelas}
                        onChange={(e) => setPickerNewSetKelas(e.target.value)}
                        placeholder="Semua Kelas"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs md:text-sm font-semibold text-slate-800"
                      />
                    </div>
                    <div className="md:col-span-3 flex items-end">
                      <label className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl cursor-pointer">
                        <span className="text-xs font-black text-slate-800">Langsung Aktif</span>
                        <input
                          type="checkbox"
                          checked={pickerNewSetActive}
                          onChange={(e) => setPickerNewSetActive(e.target.checked)}
                          className="w-4 h-4 accent-emerald-600"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="pt-1">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Pilih Kartu Soal Tujuan
                    </label>
                    <select
                      value={pickerTargetSetId}
                      onChange={(e) => setPickerTargetSetId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs md:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30"
                    >
                      {soalSets.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title} ({(questionsBySet[s.id] || []).length} soal • {s.kelas || 'Semua Kelas'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Sumber Soal Tabs & Filter */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex bg-slate-200 p-1 rounded-2xl border border-slate-300 w-fit">
                    <button
                      type="button"
                      onClick={() => {
                        setMaterialSourceTab('courses');
                        if (pickerTargetMode === 'new') {
                          setPickerNewSetTitle(
                            suggestNewTitleForSelection('courses', pickerCourseId, pickerTopicId, pickerAnalysisId, savedAnalyses)
                          );
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
                        materialSourceTab === 'courses'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <BookOpen size={15} />
                      Materi Pembelajaran ({COURSES.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMaterialSourceTab('analisis');
                        if (pickerTargetMode === 'new') {
                          setPickerNewSetTitle(
                            suggestNewTitleForSelection('analisis', pickerCourseId, pickerTopicId, pickerAnalysisId, savedAnalyses)
                          );
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
                        materialSourceTab === 'analisis'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Sparkles size={15} />
                      Latihan Analisis Soal ({analysisSetsWithPractice.length})
                    </button>
                  </div>

                  <div className="relative flex-1 min-w-[220px] max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      placeholder="Cari teks pertanyaan / topik..."
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                {materialSourceTab === 'courses' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                        Pilih Materi di Kelola Materi
                      </label>
                      <select
                        value={pickerCourseId}
                        onChange={(e) => handlePickerCourseChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs md:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      >
                        {COURSES.map((c) => {
                          const totalQ = c.topics.reduce((acc, t) => acc + (t.quiz?.length || 0), 0);
                          const isActiveMat = materialConfigs?.[c.id]?.isActive ?? true;
                          return (
                            <option key={c.id} value={c.id}>
                              {c.title} ({totalQ} soal • {isActiveMat ? 'Terbit' : 'Draft'})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                        Filter Topik / Sub-Bab
                      </label>
                      <select
                        value={pickerTopicId}
                        onChange={(e) => handlePickerTopicChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs md:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      >
                        <option value="all">
                          Semua Topik ({selectedPickerCourse?.topics.reduce((a, t) => a + (t.quiz?.length || 0), 0) || 0} soal)
                        </option>
                        {selectedPickerCourse?.topics.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title} ({t.quiz?.length || 0} soal)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                      Pilih Riwayat Analisis Soal (Kelola Materi &rarr; Analisis Soal)
                    </label>
                    {analysisSetsWithPractice.length > 0 ? (
                      <select
                        value={pickerAnalysisId || analysisSetsWithPractice[0]?.id || ''}
                        onChange={(e) => {
                          setPickerAnalysisId(e.target.value);
                          if (pickerTargetMode === 'new') {
                            setPickerNewSetTitle(
                              suggestNewTitleForSelection('analisis', pickerCourseId, pickerTopicId, e.target.value, savedAnalyses)
                            );
                          }
                        }}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs md:text-sm font-bold text-slate-900"
                      >
                        {analysisSetsWithPractice.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.title} ({a.latihanSoalMirip?.length || 0} latihan soal)
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-4 bg-white border border-dashed border-slate-300 rounded-xl text-xs text-slate-600 font-medium">
                        Belum ada latihan soal tersimpan dari menu <strong>Kelola Materi &rarr; Analisis Soal</strong>. Gunakan tab <strong>Materi Pembelajaran</strong> untuk mengambil soal dari materi yang sudah ada.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action bar Pilih Semua + Counter */}
              {filteredMaterialCandidates.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-200/80 px-4 py-2.5 rounded-xl border border-slate-300">
                  <span className="text-xs font-black text-slate-800">
                    Menampilkan {filteredMaterialCandidates.length} soal •{' '}
                    <span className="text-emerald-700">
                      {rawMaterialCandidates.filter((i) => selectedMaterialQuestionIds.has(i.uid)).length} dipilih untuk diambil
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const next = new Set(selectedMaterialQuestionIds);
                        filteredMaterialCandidates.forEach((item) => next.add(item.uid));
                        setSelectedMaterialQuestionIds(next);
                      }}
                      className="px-3 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-black transition-colors"
                    >
                      Pilih Semua ({filteredMaterialCandidates.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = new Set(selectedMaterialQuestionIds);
                        filteredMaterialCandidates.forEach((item) => next.delete(item.uid));
                        setSelectedMaterialQuestionIds(next);
                      }}
                      className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded-lg text-xs font-bold transition-colors"
                    >
                      Kosongkan Pilihan
                    </button>
                  </div>
                </div>
              )}

              {/* Daftar Soal Kandidat */}
              {filteredMaterialCandidates.length > 0 ? (
                <div className="space-y-3">
                  {filteredMaterialCandidates.map((item, idx) => {
                    const isChecked = selectedMaterialQuestionIds.has(item.uid);
                    const isDuplicate = existingTargetFingerprints.has(
                      normalizeQuestionFingerprint(item.questionText)
                    );
                    return (
                      <div
                        key={item.uid}
                        onClick={() => {
                          setSelectedMaterialQuestionIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(item.uid)) next.delete(item.uid);
                            else next.add(item.uid);
                            return next;
                          });
                        }}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/15 shadow-xs'
                            : 'bg-slate-50 border-slate-300 hover:border-slate-400 opacity-85'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`mt-0.5 shrink-0 ${isChecked ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {isChecked ? <CheckSquare size={20} /> : <Square size={20} />}
                          </span>
                          <div className="flex-1 min-w-0 space-y-2.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-white text-[10px] font-black">
                                #{idx + 1}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">
                                {item.topicTitle}
                              </span>
                              {isDuplicate && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-black">
                                  Sudah ada di kartu tujuan
                                </span>
                              )}
                            </div>

                            <p className="text-sm font-bold text-slate-900 leading-relaxed whitespace-pre-wrap">
                              {item.questionText}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                              {item.options.map((opt, oIdx) => {
                                if (!opt.text?.trim()) return null;
                                const isKey = item.correctAnswer === oIdx;
                                return (
                                  <div
                                    key={oIdx}
                                    className={`px-2.5 py-1.5 rounded-lg border flex items-start gap-2 ${
                                      isKey
                                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                                        : 'bg-slate-50 border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <span className="font-black shrink-0">{OPTION_LABELS[oIdx]}.</span>
                                    <span className="flex-1">{opt.text}</span>
                                  </div>
                                );
                              })}
                            </div>

                            {item.explanation && (
                              <p className="text-[11px] text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                                <strong className="text-slate-800">Pembahasan: </strong>
                                {item.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs font-semibold">
                  Tidak ada soal yang cocok pada sumber / kata kunci tersebut.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 bg-slate-200 border-t border-slate-300 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <span className="text-xs font-bold text-slate-600">
                {(() => {
                  const count = rawMaterialCandidates.filter((i) =>
                    selectedMaterialQuestionIds.has(i.uid)
                  ).length;
                  return count > 0
                    ? `${count} soal siap diambil ke ${pickerTargetMode === 'new' ? 'kartu soal baru' : 'kartu soal tujuan'}`
                    : 'Centang minimal 1 soal untuk diambil';
                })()}
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMaterialPickerOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-300/60"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={
                    isImportingMaterial ||
                    rawMaterialCandidates.filter((i) => selectedMaterialQuestionIds.has(i.uid))
                      .length === 0 ||
                    (pickerTargetMode === 'new' && !pickerNewSetTitle.trim()) ||
                    (pickerTargetMode === 'existing' && !pickerTargetSetId)
                  }
                  onClick={handleImportFromMaterial}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-40 flex items-center gap-2"
                >
                  <GraduationCap size={17} />
                  {isImportingMaterial
                    ? 'Mengambil Soal...'
                    : `Ambil ${
                        rawMaterialCandidates.filter((i) => selectedMaterialQuestionIds.has(i.uid))
                          .length
                      } Soal`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================== MODAL TAMBAH SOAL AI ================== */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-[122] flex items-center justify-center p-3 md:p-6">
          <div className="bg-slate-100 border border-slate-300 rounded-[2rem] w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-5 md:p-6 bg-slate-200 border-b border-slate-300 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Wand2 size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-black text-slate-900 truncate">
                    Tambah Soal Otomatis dengan AI
                  </h3>
                  <p className="text-xs font-bold text-slate-600 truncate">
                    Buat soal PG 4 opsi + kunci + pembahasan otomatis dari topik atau materi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="p-2 hover:bg-slate-300 rounded-xl text-slate-600 shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 md:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              {/* Tujuan Penyimpanan */}
              <div className="bg-white border border-slate-300 rounded-2xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Tujuan Penyimpanan Soal AI
                  </span>
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setAiTargetMode('new')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                        aiTargetMode === 'new'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      + Buat Kartu Baru
                    </button>
                    <button
                      type="button"
                      disabled={soalSets.length === 0}
                      onClick={() => {
                        setAiTargetMode('existing');
                        if (!aiTargetSetId && soalSets[0]) {
                          setAiTargetSetId(soalSets[0].id);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all disabled:opacity-40 ${
                        aiTargetMode === 'existing'
                          ? 'bg-brand text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Ke Kartu yang Ada ({soalSets.length})
                    </button>
                  </div>
                </div>

                {aiTargetMode === 'new' ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
                    <div className="md:col-span-6">
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Judul Kartu Soal Baru *
                      </label>
                      <input
                        type="text"
                        value={aiNewSetTitle}
                        onChange={(e) => setAiNewSetTitle(e.target.value)}
                        placeholder="Contoh: Kuis AI - Algoritma & Pemrograman"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs md:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Target Kelas
                      </label>
                      <input
                        type="text"
                        value={aiNewSetKelas}
                        onChange={(e) => setAiNewSetKelas(e.target.value)}
                        placeholder="Semua Kelas"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs md:text-sm font-semibold text-slate-800"
                      />
                    </div>
                    <div className="md:col-span-3 flex items-end">
                      <label className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl cursor-pointer">
                        <span className="text-xs font-black text-slate-800">Langsung Aktif</span>
                        <input
                          type="checkbox"
                          checked={aiNewSetActive}
                          onChange={(e) => setAiNewSetActive(e.target.checked)}
                          className="w-4 h-4 accent-purple-600"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="pt-1">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Pilih Kartu Soal Tujuan
                    </label>
                    <select
                      value={aiTargetSetId}
                      onChange={(e) => setAiTargetSetId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs md:text-sm font-bold text-slate-900"
                    >
                      {soalSets.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title} ({(questionsBySet[s.id] || []).length} soal • {s.kelas || 'Semua Kelas'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Pengaturan Prompt / Materi AI */}
              <div className="bg-white border border-slate-300 rounded-2xl p-4 md:p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Sumber Topik Pembuatan Soal
                  </span>
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setAiContextMode('custom')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                        aiContextMode === 'custom'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Tulis Topik Bebas
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiContextMode('course')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                        aiContextMode === 'course'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Dari Materi Kelola Materi
                    </button>
                  </div>
                </div>

                {aiContextMode === 'custom' ? (
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block mb-1.5">
                      Topik / Materi Soal *
                    </label>
                    <input
                      type="text"
                      value={aiTopicPrompt}
                      onChange={(e) => setAiTopicPrompt(e.target.value)}
                      placeholder="Contoh: Berpikir Komputasional, Sistem Bilangan Biner, atau Jaringan Komputer & Internet"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                        Materi Acuan (Kelola Materi)
                      </label>
                      <select
                        value={aiCourseId}
                        onChange={(e) => {
                          setAiCourseId(e.target.value);
                          setAiTopicId('all');
                        }}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs md:text-sm font-bold text-slate-900"
                      >
                        {COURSES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title} ({c.topics.length} topik)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                        Sub-Topik Materi
                      </label>
                      <select
                        value={aiTopicId}
                        onChange={(e) => setAiTopicId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs md:text-sm font-bold text-slate-900"
                      >
                        <option value="all">Semua Topik dalam Materi Ini</option>
                        {selectedAiCourse?.topics.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                      Jumlah Soal (1–20)
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[5, 10, 15, 20].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setAiCount(preset)}
                          className={`px-2.5 py-2 rounded-xl text-xs font-black border transition-all ${
                            aiCount === preset
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={aiCount}
                        onChange={(e) =>
                          setAiCount(Math.min(20, Math.max(1, parseInt(e.target.value, 10) || 1)))
                        }
                        className="w-16 px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-slate-900 text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                      Jenjang / Kelas
                    </label>
                    <select
                      value={aiJenjang}
                      onChange={(e) => setAiJenjang(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    >
                      <option value="SMP Kelas VII">SMP Kelas VII</option>
                      <option value="SMP Kelas VIII">SMP Kelas VIII</option>
                      <option value="SMP Kelas IX">SMP Kelas IX</option>
                      <option value="SMP Fase D (Umum)">SMP Fase D (Umum)</option>
                      <option value="SMA / SMK">SMA / SMK</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                      Tingkat Kesulitan
                    </label>
                    <select
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    >
                      <option value="Campuran">Campuran (Mudah–Sukar)</option>
                      <option value="Mudah">Mudah (C1–C2)</option>
                      <option value="Sedang">Sedang (C3)</option>
                      <option value="Sukar">Sukar / HOTS (C4–C5)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                  <div className="flex-1">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                      Instruksi Tambahan (Opsional)
                    </label>
                    <input
                      type="text"
                      value={aiInstructions}
                      onChange={(e) => setAiInstructions(e.target.value)}
                      placeholder="Misal: Sertakan soal cerita sehari-hari, hindari soal hafalan definisi..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isGeneratingAi}
                    onClick={handleGenerateAiQuestions}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs md:text-sm shadow-md shadow-purple-600/20 disabled:opacity-60 flex items-center justify-center gap-2 shrink-0"
                  >
                    {isGeneratingAi ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        AI Sedang Membuat {aiCount} Soal...
                      </>
                    ) : aiGeneratedList.length > 0 ? (
                      <>
                        <RefreshCw size={16} />
                        Generate Ulang ({aiCount} Soal)
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Generate Soal dengan AI
                      </>
                    )}
                  </button>
                </div>

                {aiError && (
                  <div className="p-3.5 bg-red-50 border border-red-300 rounded-xl text-red-800 text-xs font-bold flex items-start gap-2">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-600" />
                    <span>{aiError}</span>
                  </div>
                )}
              </div>

              {/* Pratinjau & Edit Soal Hasil AI */}
              {aiGeneratedList.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-purple-50 border border-purple-200 px-4 py-2.5 rounded-xl">
                    <span className="text-xs font-black text-purple-950">
                      Hasil AI: {aiGeneratedList.length} Soal •{' '}
                      <span className="text-emerald-700">
                        {aiGeneratedList.filter((q) => q.selected).length} dipilih untuk disimpan
                      </span>{' '}
                      <span className="text-slate-500 font-semibold">(bisa diedit langsung di bawah)</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setAiGeneratedList((prev) => prev.map((q) => ({ ...q, selected: true })))
                        }
                        className="px-3 py-1 bg-white hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-black"
                      >
                        Pilih Semua
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setAiGeneratedList((prev) => prev.map((q) => ({ ...q, selected: false })))
                        }
                        className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded-lg text-xs font-bold"
                      >
                        Kosongkan
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {aiGeneratedList.map((item, idx) => (
                      <div
                        key={item.uid}
                        className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
                          item.selected
                            ? 'bg-white border-purple-400 shadow-xs'
                            : 'bg-slate-50 border-slate-300 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setAiGeneratedList((prev) =>
                                  prev.map((q) =>
                                    q.uid === item.uid ? { ...q, selected: !q.selected } : q
                                  )
                                )
                              }
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black ${
                                item.selected
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {item.selected ? <CheckSquare size={14} /> : <Square size={14} />}
                              Soal #{idx + 1}
                            </button>
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-black">
                              {item.cognitiveLevel}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-500">
                            Kunci saat ini: <strong className="text-emerald-700">{OPTION_LABELS[item.correctAnswer]}</strong>
                          </span>
                        </div>

                        <textarea
                          rows={2}
                          value={item.questionText}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAiGeneratedList((prev) =>
                              prev.map((q) =>
                                q.uid === item.uid ? { ...q, questionText: val } : q
                              )
                            );
                          }}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.options.map((optText, oIdx) => {
                            const isKey = item.correctAnswer === oIdx;
                            return (
                              <div
                                key={oIdx}
                                className={`flex items-center gap-2 p-2 rounded-xl border ${
                                  isKey
                                    ? 'bg-emerald-50 border-emerald-400'
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                <button
                                  type="button"
                                  title="Klik untuk jadikan kunci jawaban"
                                  onClick={() =>
                                    setAiGeneratedList((prev) =>
                                      prev.map((q) =>
                                        q.uid === item.uid
                                          ? { ...q, correctAnswer: oIdx as 0 | 1 | 2 | 3 }
                                          : q
                                      )
                                    )
                                  }
                                  className={`w-7 h-7 rounded-lg text-xs font-black shrink-0 flex items-center justify-center transition-all ${
                                    isKey
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-200 text-slate-700 hover:bg-emerald-100'
                                  }`}
                                >
                                  {OPTION_LABELS[oIdx]}
                                </button>
                                <input
                                  type="text"
                                  value={optText}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setAiGeneratedList((prev) =>
                                      prev.map((q) => {
                                        if (q.uid !== item.uid) return q;
                                        const nextOpts = [...q.options] as [
                                          string,
                                          string,
                                          string,
                                          string,
                                        ];
                                        nextOpts[oIdx] = val;
                                        return { ...q, options: nextOpts };
                                      })
                                    );
                                  }}
                                  className="flex-1 min-w-0 bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                                />
                              </div>
                            );
                          })}
                        </div>

                        <input
                          type="text"
                          value={item.explanation}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAiGeneratedList((prev) =>
                              prev.map((q) =>
                                q.uid === item.uid ? { ...q, explanation: val } : q
                              )
                            );
                          }}
                          placeholder="Pembahasan singkat..."
                          className="w-full px-3 py-1.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs font-medium text-blue-950 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 bg-slate-200 border-t border-slate-300 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <span className="text-xs font-bold text-slate-600">
                {aiGeneratedList.length > 0
                  ? `${aiGeneratedList.filter((q) => q.selected).length} soal dipilih siap disimpan`
                  : 'Atur parameter di atas lalu klik Generate Soal dengan AI'}
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-300/60"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={
                    isSavingAi ||
                    isGeneratingAi ||
                    aiGeneratedList.filter((q) => q.selected).length === 0 ||
                    (aiTargetMode === 'new' && !aiNewSetTitle.trim()) ||
                    (aiTargetMode === 'existing' && !aiTargetSetId)
                  }
                  onClick={handleSaveAiQuestions}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-sm shadow-lg shadow-purple-600/20 disabled:opacity-40 flex items-center gap-2"
                >
                  <Sparkles size={17} />
                  {isSavingAi
                    ? 'Menyimpan...'
                    : `Simpan ${aiGeneratedList.filter((q) => q.selected).length} Soal AI`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================== LIGHTBOX IMAGE PREVIEW ================== */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-[140] flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute -top-3 -right-3 w-9 h-9 bg-white text-slate-900 rounded-full shadow-lg flex items-center justify-center font-black hover:bg-slate-200"
            >
              <X size={18} />
            </button>
            <img
              src={lightboxImg}
              alt="Pratinjau Gambar"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain bg-white p-2 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
