/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar,
  Target,
  BookOpenCheck,
  UserCheck,
  Award,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Search,
  Download,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  ClipboardCheck,
  GraduationCap,
  X,
  Check,
  Info,
  ArrowRight,
  Layers,
  GripVertical,
  MapPin,
  Coffee,
  LayoutGrid,
  List,
  SlidersHorizontal,
  CalendarClock,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { db } from '../firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { COURSES } from '../constants';
import {
  AbsensiRecord,
  AbsensiStudentEntry,
  AdministrasiSubTab,
  AgendaHarianItem,
  AttendanceStatus,
  computeDayScheduleSlots,
  DEFAULT_RAPOR_WEIGHTS,
  ELEMEN_INFORMATIKA_LIST,
  getHariFromDate,
  getPredikatFromScore,
  getTodayIsoDate,
  HARI_LIST,
  JadwalPelajaranItem,
  JadwalScheduleSettings,
  JENIS_KEGIATAN_LIST,
  NilaiRaporEntry,
  NilaiSubTab,
  NilaiSumatifItem,
  normalizeJadwalScheduleSettings,
  RaporWeightConfig,
  ScopedStudent,
  SemesterType,
  slugifyTermPart,
  TujuanPembelajaranItem,
} from '../administrasiTypes';

interface AdminAdministrasiProps {
  activeTahunPelajaran: string;
  activeSemester: SemesterType;
  students: ScopedStudent[];
  assessments: any[];
  jadwalSettings?: JadwalScheduleSettings;
  onNavigateTab?: (tab: 'student_management' | 'settings' | 'materials') => void;
  onOpenStudentDetail?: (student: ScopedStudent) => void;
  onFirestoreError?: (
    error: unknown,
    op: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write',
    path: string
  ) => void;
}

type FeedbackNotice = {
  type: 'success' | 'error' | 'info';
  message: string;
} | null;

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (val: string | number) => {
    const str = String(val ?? '');
    if (/[",\n;]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csv = [
    headers.map(escape).join(','),
    ...rows.map((r) => r.map(escape).join(',')),
  ].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminAdministrasi({
  activeTahunPelajaran,
  activeSemester,
  students,
  assessments,
  jadwalSettings,
  onNavigateTab,
  onOpenStudentDetail,
  onFirestoreError,
}: AdminAdministrasiProps) {
  const effectiveJadwalSettings = useMemo(
    () => normalizeJadwalScheduleSettings(jadwalSettings),
    [jadwalSettings]
  );
  const [subTab, setSubTab] = useState<AdministrasiSubTab>('jadwal');
  const [nilaiSubTab, setNilaiSubTab] = useState<NilaiSubTab>('sumatif');
  const [notice, setNotice] = useState<FeedbackNotice>(null);

  // Scoped Firestore collections
  const [allJadwal, setAllJadwal] = useState<JadwalPelajaranItem[]>([]);
  const [allTp, setAllTp] = useState<TujuanPembelajaranItem[]>([]);
  const [allAgenda, setAllAgenda] = useState<AgendaHarianItem[]>([]);
  const [allAbsensi, setAllAbsensi] = useState<AbsensiRecord[]>([]);
  const [allSumatif, setAllSumatif] = useState<NilaiSumatifItem[]>([]);
  const [allRapor, setAllRapor] = useState<NilaiRaporEntry[]>([]);

  useEffect(() => {
    const unsubs: (() => void)[] = [];

    unsubs.push(
      onSnapshot(
        collection(db, 'jadwal_pelajaran'),
        (snap) => {
          setAllJadwal(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        },
        (err) => onFirestoreError?.(err, 'list', 'jadwal_pelajaran')
      )
    );

    unsubs.push(
      onSnapshot(
        collection(db, 'tujuan_pembelajaran'),
        (snap) => {
          setAllTp(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        },
        (err) => onFirestoreError?.(err, 'list', 'tujuan_pembelajaran')
      )
    );

    unsubs.push(
      onSnapshot(
        collection(db, 'agenda_harian'),
        (snap) => {
          setAllAgenda(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        },
        (err) => onFirestoreError?.(err, 'list', 'agenda_harian')
      )
    );

    unsubs.push(
      onSnapshot(
        collection(db, 'absensi_siswa'),
        (snap) => {
          setAllAbsensi(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        },
        (err) => onFirestoreError?.(err, 'list', 'absensi_siswa')
      )
    );

    unsubs.push(
      onSnapshot(
        collection(db, 'nilai_sumatif'),
        (snap) => {
          setAllSumatif(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        },
        (err) => onFirestoreError?.(err, 'list', 'nilai_sumatif')
      )
    );

    unsubs.push(
      onSnapshot(
        collection(db, 'nilai_rapor'),
        (snap) => {
          setAllRapor(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        },
        (err) => onFirestoreError?.(err, 'list', 'nilai_rapor')
      )
    );

    unsubs.push(
      onSnapshot(
        doc(db, 'app_settings', 'rapor_weights'),
        (snap) => {
          if (snap.exists()) {
            const d = snap.data() as Partial<RaporWeightConfig>;
            setRaporWeights({
              pctSumatifTp: Number(d.pctSumatifTp ?? DEFAULT_RAPOR_WEIGHTS.pctSumatifTp),
              pctPraktikumTp: Number(d.pctPraktikumTp ?? DEFAULT_RAPOR_WEIGHTS.pctPraktikumTp),
              pctSumatifAkhir: Number(d.pctSumatifAkhir ?? DEFAULT_RAPOR_WEIGHTS.pctSumatifAkhir),
            });
          }
        },
        (err) => onFirestoreError?.(err, 'get', 'app_settings/rapor_weights')
      )
    );

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [onFirestoreError]);

  const showNotice = (type: 'success' | 'error' | 'info', message: string) => {
    setNotice({ type, message });
  };

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(t);
  }, [notice]);

  // Term-scoped data views
  // Note: Tujuan Pembelajaran is scoped ONLY by activeTahunPelajaran (persists across Semester switch!)
  const tpList = useMemo(
    () =>
      allTp
        .filter((tp) => tp.tahunPelajaran === activeTahunPelajaran)
        .sort((a, b) => (a.kodeTp || '').localeCompare(b.kodeTp || '')),
    [allTp, activeTahunPelajaran]
  );

  // Semester + Year scoped views
  const jadwalList = useMemo(
    () =>
      allJadwal.filter(
        (j) => j.tahunPelajaran === activeTahunPelajaran && j.semester === activeSemester
      ),
    [allJadwal, activeTahunPelajaran, activeSemester]
  );

  const agendaList = useMemo(
    () =>
      allAgenda
        .filter(
          (a) => a.tahunPelajaran === activeTahunPelajaran && a.semester === activeSemester
        )
        .sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || '')),
    [allAgenda, activeTahunPelajaran, activeSemester]
  );

  const absensiList = useMemo(
    () =>
      allAbsensi.filter(
        (a) => a.tahunPelajaran === activeTahunPelajaran && a.semester === activeSemester
      ),
    [allAbsensi, activeTahunPelajaran, activeSemester]
  );

  const sumatifList = useMemo(
    () =>
      allSumatif
        .filter(
          (s) => s.tahunPelajaran === activeTahunPelajaran && s.semester === activeSemester
        )
        .sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || '')),
    [allSumatif, activeTahunPelajaran, activeSemester]
  );

  const raporList = useMemo(
    () =>
      allRapor.filter(
        (r) => r.tahunPelajaran === activeTahunPelajaran && r.semester === activeSemester
      ),
    [allRapor, activeTahunPelajaran, activeSemester]
  );

  // Active classes derived dynamically from active-year students (plus any class already used in schedule/agenda)
  const classOptions = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.kelas?.trim()) set.add(s.kelas.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [students]);

  const studentsByClass = useMemo(() => {
    const map: Record<string, ScopedStudent[]> = {};
    students.forEach((s) => {
      const k = (s.kelas || '').trim();
      if (!k) return;
      if (!map[k]) map[k] = [];
      map[k].push(s);
    });
    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => a.nama.localeCompare(b.nama));
    });
    return map;
  }, [students]);

  // Student cross-reference maps: Absensi Recap, Materi/Soal Average, Sumatif Average
  const studentAttendanceRecap = useMemo(() => {
    const recap: Record<string, { H: number; S: number; I: number; A: number; total: number }> = {};
    students.forEach((s) => {
      recap[s.id] = { H: 0, S: 0, I: 0, A: 0, total: 0 };
    });
    absensiList.forEach((rec) => {
      const entries = rec.entries || {};
      Object.entries(entries).forEach(([studentId, entry]) => {
        if (!recap[studentId]) {
          recap[studentId] = { H: 0, S: 0, I: 0, A: 0, total: 0 };
        }
        const st = entry?.status;
        if (st === 'H' || st === 'S' || st === 'I' || st === 'A') {
          recap[studentId][st] += 1;
          recap[studentId].total += 1;
        }
      });
    });
    return recap;
  }, [absensiList, students]);

  const studentAssessmentAvg = useMemo(() => {
    const grouped: Record<string, number[]> = {};
    assessments.forEach((a) => {
      if (!a.studentId) return;
      const sc = Number(a.score);
      if (Number.isNaN(sc)) return;
      if (!grouped[a.studentId]) grouped[a.studentId] = [];
      grouped[a.studentId].push(sc);
    });
    const avg: Record<string, { avg: number; count: number }> = {};
    Object.entries(grouped).forEach(([sid, list]) => {
      avg[sid] = {
        avg: Math.round(list.reduce((x, y) => x + y, 0) / list.length),
        count: list.length,
      };
    });
    return avg;
  }, [assessments]);

  const studentSumatifStats = useMemo(() => {
    const grouped: Record<string, { weightedSum: number; totalWeight: number; count: number }> = {};
    sumatifList.forEach((item) => {
      const weight = Number(item.bobot || 1) || 1;
      const scores = item.scores || {};
      Object.entries(scores).forEach(([sid, val]) => {
        const num = Number(val);
        if (Number.isNaN(num)) return;
        if (!grouped[sid]) grouped[sid] = { weightedSum: 0, totalWeight: 0, count: 0 };
        grouped[sid].weightedSum += num * weight;
        grouped[sid].totalWeight += weight;
        grouped[sid].count += 1;
      });
    });
    const out: Record<string, { avg: number; count: number }> = {};
    Object.entries(grouped).forEach(([sid, st]) => {
      out[sid] = {
        avg: st.totalWeight > 0 ? Math.round(st.weightedSum / st.totalWeight) : 0,
        count: st.count,
      };
    });
    return out;
  }, [sumatifList]);

  // ============================================================================
  // 1. JADWAL PELAJARAN STATE
  // ============================================================================
  const [jadwalClassFilter, setJadwalClassFilter] = useState<string>('all');
  const [jadwalHariFilter, setJadwalHariFilter] = useState<string>('all');
  const [jadwalViewMode, setJadwalViewMode] = useState<'board' | 'table'>('board');
  const [draggedJadwalId, setDraggedJadwalId] = useState<string | null>(null);
  const [dragOverSlotKey, setDragOverSlotKey] = useState<string | null>(null);
  const [isJadwalModalOpen, setIsJadwalModalOpen] = useState(false);
  const [editingJadwalId, setEditingJadwalId] = useState<string | null>(null);
  const [jadwalForm, setJadwalForm] = useState<{
    kelas: string;
    hari: JadwalPelajaranItem['hari'];
    dariJamKe: number;
    sampaiJamKe: number;
    jamKe: string;
    waktuMulai: string;
    waktuSelesai: string;
    mataPelajaran: string;
    isBreak: boolean;
  }>({
    kelas: '',
    hari: 'Senin',
    dariJamKe: 1,
    sampaiJamKe: 1,
    jamKe: '1',
    waktuMulai: '08:00',
    waktuSelesai: '08:40',
    mataPelajaran: 'INFORMATIKA',
    isBreak: false,
  });

  const parseSlotRange = (jamKe?: string): { from: number; to: number } => {
    const matches = String(jamKe || '').match(/\d+/g);
    if (!matches || matches.length === 0) return { from: 1, to: 1 };
    const from = Math.max(1, Number(matches[0]) || 1);
    const to = matches.length > 1 ? Math.max(from, Number(matches[1]) || from) : from;
    return { from, to };
  };

  const parseSlotNumber = (jamKe?: string): number => {
    return parseSlotRange(jamKe).from;
  };

  const getDefaultSlotTimes = (
    hari: JadwalPelajaranItem['hari'],
    slotNum: number
  ): { mulai: string; selesai: string } => {
    const dayCfg = effectiveJadwalSettings.days[hari] || effectiveJadwalSettings.days.Senin;
    const computed = computeDayScheduleSlots(
      dayCfg,
      effectiveJadwalSettings.lessonDurationMinutes,
      effectiveJadwalSettings.breakDurationMinutes,
      slotNum
    );
    return computed.slots[slotNum] || { mulai: dayCfg.startTime, selesai: dayCfg.startTime };
  };

  const getSlotRangeTimes = (
    hari: JadwalPelajaranItem['hari'],
    fromSlot: number,
    toSlot: number
  ): { mulai: string; selesai: string } => {
    const dayCfg = effectiveJadwalSettings.days[hari] || effectiveJadwalSettings.days.Senin;
    const maxS = Math.max(fromSlot, toSlot, dayCfg.totalSlots);
    const computed = computeDayScheduleSlots(
      dayCfg,
      effectiveJadwalSettings.lessonDurationMinutes,
      effectiveJadwalSettings.breakDurationMinutes,
      maxS
    );
    const startSlot = computed.slots[fromSlot] || { mulai: dayCfg.startTime, selesai: dayCfg.startTime };
    const endSlot = computed.slots[toSlot] || startSlot;
    return { mulai: startSlot.mulai, selesai: endSlot.selesai };
  };

  const CLASS_CARD_PALETTE = [
    'bg-gradient-to-br from-[#2563eb] via-[#1d4ed8] to-[#1e3a8a] shadow-lg shadow-blue-950/30 ring-1 ring-white/15',     // Royal Blue
    'bg-gradient-to-br from-[#9333ea] via-[#7e22ce] to-[#581c87] shadow-lg shadow-purple-950/30 ring-1 ring-white/15',   // Purple
    'bg-gradient-to-br from-[#059669] via-[#047857] to-[#064e3b] shadow-lg shadow-emerald-950/30 ring-1 ring-white/15',  // Emerald
    'bg-gradient-to-br from-[#ea580c] via-[#c2410c] to-[#9a3412] shadow-lg shadow-orange-950/30 ring-1 ring-white/15',   // Orange
    'bg-gradient-to-br from-[#e11d48] via-[#be123c] to-[#881337] shadow-lg shadow-rose-950/30 ring-1 ring-white/15',     // Crimson
    'bg-gradient-to-br from-[#0891b2] via-[#0e7490] to-[#155e75] shadow-lg shadow-cyan-950/30 ring-1 ring-white/15',     // Cyan
    'bg-gradient-to-br from-[#4f46e5] via-[#4338ca] to-[#312e81] shadow-lg shadow-indigo-950/30 ring-1 ring-white/15',   // Indigo
    'bg-gradient-to-br from-[#c026d3] via-[#a21caf] to-[#701a75] shadow-lg shadow-fuchsia-950/30 ring-1 ring-white/15',  // Fuchsia
    'bg-gradient-to-br from-[#65a30d] via-[#4d7c0f] to-[#365314] shadow-lg shadow-lime-950/30 ring-1 ring-white/15',     // Olive Lime
    'bg-gradient-to-br from-[#0d9488] via-[#0f766e] to-[#134e4a] shadow-lg shadow-teal-950/30 ring-1 ring-white/15',     // Teal
    'bg-gradient-to-br from-[#d97706] via-[#b45309] to-[#78350f] shadow-lg shadow-amber-950/30 ring-1 ring-white/15',    // Amber
    'bg-gradient-to-br from-[#db2777] via-[#be185d] to-[#831843] shadow-lg shadow-pink-950/30 ring-1 ring-white/15',     // Pink
    'bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#0c4a6e] shadow-lg shadow-sky-950/30 ring-1 ring-white/15',      // Sky
    'bg-gradient-to-br from-[#dc2626] via-[#b91c1c] to-[#7f1d1d] shadow-lg shadow-red-950/30 ring-1 ring-white/15',      // Red
    'bg-gradient-to-br from-[#475569] via-[#334155] to-[#1e293b] shadow-lg shadow-slate-950/30 ring-1 ring-white/15',    // Slate
  ];

  const classColorMap = useMemo(() => {
    const allClassNames = new Set<string>();
    classOptions.forEach((c) => {
      if (c?.trim()) allClassNames.add(c.trim().toUpperCase());
    });
    jadwalList.forEach((j) => {
      if (!j.isBreak && j.kelas?.trim()) allClassNames.add(j.kelas.trim().toUpperCase());
    });
    agendaList.forEach((a) => {
      if (a.kelas?.trim()) allClassNames.add(a.kelas.trim().toUpperCase());
    });
    const sorted = Array.from(allClassNames).sort((a, b) => a.localeCompare(b));
    const map: Record<string, string> = {};
    sorted.forEach((cls, idx) => {
      map[cls] = CLASS_CARD_PALETTE[idx % CLASS_CARD_PALETTE.length];
    });
    return map;
  }, [classOptions, jadwalList, agendaList]);

  const getClassCardTheme = (kelas?: string) => {
    const key = (kelas || '').trim().toUpperCase();
    if (key && classColorMap[key]) return classColorMap[key];
    return CLASS_CARD_PALETTE[0];
  };

  const openNewJadwalModal = (preset?: {
    hari?: JadwalPelajaranItem['hari'];
    jamKe?: string;
    waktuMulai?: string;
    waktuSelesai?: string;
    isBreak?: boolean;
  }) => {
    setEditingJadwalId(null);
    const targetHari = preset?.hari || (jadwalHariFilter !== 'all' ? (jadwalHariFilter as JadwalPelajaranItem['hari']) : 'Senin');
    const isBreak = Boolean(preset?.isBreak);
    const range = parseSlotRange(preset?.jamKe || '1');
    const dayCfg = effectiveJadwalSettings.days[targetHari] || effectiveJadwalSettings.days.Senin;
    const computed = computeDayScheduleSlots(
      dayCfg,
      effectiveJadwalSettings.lessonDurationMinutes,
      effectiveJadwalSettings.breakDurationMinutes,
      Math.max(range.to, dayCfg.totalSlots)
    );
    const defaultTimes = getSlotRangeTimes(targetHari, range.from, range.to);
    const defaultBreak = computed.breaks[0];
    const jamKeStr = range.from === range.to ? String(range.from) : `${range.from}-${range.to}`;
    setJadwalForm({
      kelas: isBreak
        ? 'ISTIRAHAT'
        : jadwalClassFilter !== 'all'
        ? jadwalClassFilter
        : classOptions[0] || '',
      hari: targetHari,
      dariJamKe: range.from,
      sampaiJamKe: range.to,
      jamKe: isBreak ? 'Istirahat' : jamKeStr,
      waktuMulai:
        preset?.waktuMulai ||
        (isBreak ? defaultBreak?.mulai || '10:00' : defaultTimes.mulai),
      waktuSelesai:
        preset?.waktuSelesai ||
        (isBreak ? defaultBreak?.selesai || '10:20' : defaultTimes.selesai),
      mataPelajaran: isBreak ? 'JAM ISTIRAHAT' : 'INFORMATIKA',
      isBreak,
    });
    setIsJadwalModalOpen(true);
  };

  const openEditJadwalModal = (item: JadwalPelajaranItem) => {
    setEditingJadwalId(item.id);
    const isBreak = Boolean(item.isBreak || item.mataPelajaran?.toUpperCase().includes('ISTIRAHAT'));
    const range = parseSlotRange(item.jamKe);
    setJadwalForm({
      kelas: item.kelas,
      hari: item.hari,
      dariJamKe: range.from,
      sampaiJamKe: range.to,
      jamKe: item.jamKe,
      waktuMulai: item.waktuMulai,
      waktuSelesai: item.waktuSelesai,
      mataPelajaran: item.mataPelajaran,
      isBreak,
    });
    setIsJadwalModalOpen(true);
  };

  const handleSaveJadwal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jadwalForm.isBreak && (!jadwalForm.kelas.trim() || !jadwalForm.mataPelajaran.trim())) {
      showNotice('error', 'Kelas dan Mata Pelajaran wajib diisi.');
      return;
    }
    const jamKeStr = jadwalForm.isBreak
      ? 'Istirahat'
      : jadwalForm.dariJamKe === jadwalForm.sampaiJamKe
      ? String(jadwalForm.dariJamKe)
      : `${jadwalForm.dariJamKe}-${jadwalForm.sampaiJamKe}`;

    const payload = {
      tahunPelajaran: activeTahunPelajaran,
      semester: activeSemester,
      kelas: jadwalForm.isBreak ? (jadwalForm.kelas.trim() || 'ISTIRAHAT') : jadwalForm.kelas.trim(),
      hari: jadwalForm.hari,
      jamKe: jamKeStr,
      waktuMulai: jadwalForm.waktuMulai,
      waktuSelesai: jadwalForm.waktuSelesai,
      mataPelajaran: jadwalForm.isBreak
        ? (jadwalForm.mataPelajaran.trim() || 'JAM ISTIRAHAT')
        : jadwalForm.mataPelajaran.trim(),
      isBreak: jadwalForm.isBreak,
      updatedAt: new Date().toISOString(),
    };
    try {
      if (editingJadwalId) {
        await updateDoc(doc(db, 'jadwal_pelajaran', editingJadwalId), payload);
        showNotice('success', jadwalForm.isBreak ? 'Jam istirahat diperbarui.' : 'Jadwal pelajaran berhasil diperbarui.');
      } else {
        await addDoc(collection(db, 'jadwal_pelajaran'), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
        showNotice('success', jadwalForm.isBreak ? 'Jam istirahat berhasil ditambahkan.' : 'Jadwal pelajaran baru berhasil ditambahkan.');
      }
      setIsJadwalModalOpen(false);
    } catch (err) {
      onFirestoreError?.(err, 'write', 'jadwal_pelajaran');
      showNotice('error', 'Gagal menyimpan jadwal pelajaran.');
    }
  };

  const handleDeleteJadwal = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'jadwal_pelajaran', id));
      showNotice('success', 'Jadwal pelajaran dihapus.');
    } catch (err) {
      onFirestoreError?.(err, 'delete', `jadwal_pelajaran/${id}`);
    }
  };

  const handleDropJadwalOnSlot = async (
    targetHari: JadwalPelajaranItem['hari'],
    targetSlotNum: number,
    existingTargetItem?: JadwalPelajaranItem
  ) => {
    setDragOverSlotKey(null);
    if (!draggedJadwalId) return;
    const sourceItem = jadwalList.find((j) => j.id === draggedJadwalId);
    setDraggedJadwalId(null);
    if (!sourceItem) return;
    if (existingTargetItem && existingTargetItem.id === sourceItem.id) return;

    const now = new Date().toISOString();
    try {
      if (existingTargetItem) {
        await Promise.all([
          updateDoc(doc(db, 'jadwal_pelajaran', sourceItem.id), {
            hari: existingTargetItem.hari,
            jamKe: existingTargetItem.jamKe,
            waktuMulai: existingTargetItem.waktuMulai,
            waktuSelesai: existingTargetItem.waktuSelesai,
            updatedAt: now,
          }),
          updateDoc(doc(db, 'jadwal_pelajaran', existingTargetItem.id), {
            hari: sourceItem.hari,
            jamKe: sourceItem.jamKe,
            waktuMulai: sourceItem.waktuMulai,
            waktuSelesai: sourceItem.waktuSelesai,
            updatedAt: now,
          }),
        ]);
        showNotice('success', `Jadwal Kelas ${sourceItem.kelas} ditukar dengan Kelas ${existingTargetItem.kelas}.`);
      } else {
        const range = parseSlotRange(sourceItem.jamKe);
        const span = Math.max(0, range.to - range.from);
        const newFrom = targetSlotNum;
        const newTo = targetSlotNum + span;
        const times = getSlotRangeTimes(targetHari, newFrom, newTo);
        const newJamKe = newFrom === newTo ? String(newFrom) : `${newFrom}-${newTo}`;
        await updateDoc(doc(db, 'jadwal_pelajaran', sourceItem.id), {
          hari: targetHari,
          jamKe: newJamKe,
          waktuMulai: times.mulai,
          waktuSelesai: times.selesai,
          updatedAt: now,
        });
        showNotice('success', `Jadwal Kelas ${sourceItem.kelas} dipindahkan ke ${targetHari} Jam ${newJamKe}.`);
      }
    } catch (err) {
      onFirestoreError?.(err, 'update', 'jadwal_pelajaran');
      showNotice('error', 'Gagal memindahkan jadwal.');
    }
  };

  const filteredJadwal = useMemo(() => {
    const dayOrder: Record<string, number> = {
      Senin: 1,
      Selasa: 2,
      Rabu: 3,
      Kamis: 4,
      Jumat: 5,
      Sabtu: 6,
    };
    return jadwalList
      .filter((j) => {
        const isBreak = Boolean(j.isBreak || j.mataPelajaran?.toUpperCase().includes('ISTIRAHAT'));
        if (isBreak) return true;
        return jadwalClassFilter === 'all' ? true : j.kelas === jadwalClassFilter;
      })
      .filter((j) => (jadwalHariFilter === 'all' ? true : j.hari === jadwalHariFilter))
      .sort(
        (a, b) =>
          (dayOrder[a.hari] || 99) - (dayOrder[b.hari] || 99) ||
          (a.waktuMulai || '').localeCompare(b.waktuMulai || '')
      );
  }, [jadwalList, jadwalClassFilter, jadwalHariFilter]);

  const boardDays = useMemo<JadwalPelajaranItem['hari'][]>(() => {
    if (jadwalHariFilter !== 'all') {
      return [jadwalHariFilter as JadwalPelajaranItem['hari']];
    }
    const base: JadwalPelajaranItem['hari'][] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    const hasSabtu = jadwalList.some((j) => j.hari === 'Sabtu');
    return hasSabtu ? [...base, 'Sabtu'] : base;
  }, [jadwalHariFilter, jadwalList]);

  // ============================================================================
  // 2. TUJUAN PEMBELAJARAN STATE (Tahun Pelajaran scoped ONLY!)
  // ============================================================================
  const [tpSearch, setTpSearch] = useState('');
  const [tpKelasFilter, setTpKelasFilter] = useState('all');
  const [isTpModalOpen, setIsTpModalOpen] = useState(false);
  const [editingTpId, setEditingTpId] = useState<string | null>(null);
  const [tpForm, setTpForm] = useState<{
    kodeTp: string;
    kelas: string;
    elemen: string;
    materiId: string;
    deskripsi: string;
    indikator: string;
    kkm: number;
    isSumatif: boolean;
    isPraktikum: boolean;
  }>({
    kodeTp: 'INF-7.1',
    kelas: 'VII',
    elemen: ELEMEN_INFORMATIKA_LIST[0],
    materiId: COURSES[0]?.id || '',
    deskripsi: '',
    indikator: '',
    kkm: 75,
    isSumatif: false,
    isPraktikum: false,
  });

  const openNewTpModal = () => {
    setEditingTpId(null);
    setTpForm({
      kodeTp: `INF-${tpList.length + 1}`,
      kelas: 'VII',
      elemen: ELEMEN_INFORMATIKA_LIST[0],
      materiId: COURSES[0]?.id || '',
      deskripsi: '',
      indikator: '',
      kkm: 75,
      isSumatif: false,
      isPraktikum: false,
    });
    setIsTpModalOpen(true);
  };

  const openEditTpModal = (tp: TujuanPembelajaranItem) => {
    setEditingTpId(tp.id);
    setTpForm({
      kodeTp: tp.kodeTp,
      kelas: tp.kelas,
      elemen: tp.elemen,
      materiId: tp.materiId || '',
      deskripsi: tp.deskripsi,
      indikator: tp.indikator || '',
      kkm: tp.kkm ?? 75,
      isSumatif: Boolean(tp.isSumatif),
      isPraktikum: Boolean(tp.isPraktikum),
    });
    setIsTpModalOpen(true);
  };

  const handleSaveTp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tpForm.kodeTp.trim() || !tpForm.deskripsi.trim()) {
      showNotice('error', 'Kode TP dan Deskripsi Tujuan Pembelajaran wajib diisi.');
      return;
    }
    const payload = {
      tahunPelajaran: activeTahunPelajaran,
      kodeTp: tpForm.kodeTp.trim().toUpperCase(),
      kelas: tpForm.kelas.trim() || 'Semua',
      elemen: tpForm.elemen.trim(),
      materiId: tpForm.materiId || '',
      deskripsi: tpForm.deskripsi.trim(),
      indikator: tpForm.indikator.trim(),
      kkm: Number(tpForm.kkm) || 75,
      isSumatif: Boolean(tpForm.isSumatif),
      isPraktikum: Boolean(tpForm.isPraktikum),
      updatedAt: new Date().toISOString(),
    };
    try {
      if (editingTpId) {
        await updateDoc(doc(db, 'tujuan_pembelajaran', editingTpId), payload);
        showNotice('success', 'Tujuan Pembelajaran berhasil diperbarui.');
      } else {
        await addDoc(collection(db, 'tujuan_pembelajaran'), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
        showNotice('success', 'Tujuan Pembelajaran baru berhasil ditambahkan.');
      }
      setIsTpModalOpen(false);
    } catch (err) {
      onFirestoreError?.(err, 'write', 'tujuan_pembelajaran');
      showNotice('error', 'Gagal menyimpan Tujuan Pembelajaran.');
    }
  };

  const handleToggleTpFlag = async (
    tp: TujuanPembelajaranItem,
    field: 'isSumatif' | 'isPraktikum'
  ) => {
    const nextVal = !Boolean(tp[field]);
    try {
      await updateDoc(doc(db, 'tujuan_pembelajaran', tp.id), {
        [field]: nextVal,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      onFirestoreError?.(err, 'update', `tujuan_pembelajaran/${tp.id}`);
      showNotice('error', 'Gagal mengubah status penilaian TP.');
    }
  };

  const handleDeleteTp = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tujuan_pembelajaran', id));
      showNotice('success', 'Tujuan Pembelajaran dihapus.');
    } catch (err) {
      onFirestoreError?.(err, 'delete', `tujuan_pembelajaran/${id}`);
    }
  };

  const handleSeedStarterTp = async () => {
    const starterItems = [
      {
        kodeTp: 'BK-01',
        kelas: 'VII',
        elemen: ELEMEN_INFORMATIKA_LIST[0],
        materiId: 'bk-dekomposisi',
        deskripsi:
          'Peserta didik mampu menerapkan pemecahan masalah kompleks melalui dekomposisi, pengenalan pola, abstraksi, dan algoritma sederhana.',
        indikator: 'Memecah studi kasus sehari-hari menjadi sub-masalah terstruktur.',
        kkm: 75,
      },
      {
        kodeTp: 'TIK-01',
        kelas: 'VII',
        elemen: ELEMEN_INFORMATIKA_LIST[1],
        materiId: 'tik',
        deskripsi:
          'Peserta didik mampu mengintegrasikan aplikasi perkantoran (pengolah kata, angka, presentasi) serta mengelola konten blog/vlog edukatif.',
        indikator: 'Menghasilkan dokumen terstruktur dan konten digital santun.',
        kkm: 75,
      },
      {
        kodeTp: 'AP-01',
        kelas: 'VIII',
        elemen: ELEMEN_INFORMATIKA_LIST[5],
        materiId: 'scratch',
        deskripsi:
          'Peserta didik mampu merancang program visual interaktif berbasis blok (Scratch) menggunakan koordinat, percabangan, dan perulangan.',
        indikator: 'Membuat proyek game/animasi sederhana dengan logika if-else dan loop.',
        kkm: 75,
      },
      {
        kodeTp: 'AP-02',
        kelas: 'IX',
        elemen: ELEMEN_INFORMATIKA_LIST[5],
        materiId: 'algoritma-smp',
        deskripsi:
          'Peserta didik mampu merepresentasikan algoritma dalam bentuk diagram alir (flowchart) dan pseudocode serta mengimplementasikannya pada web dasar.',
        indikator: 'Menyusun flowchart & halaman HTML/PHP dasar dengan benar.',
        kkm: 75,
      },
    ];
    try {
      const existingCodes = new Set(tpList.map((t) => t.kodeTp));
      let added = 0;
      for (const item of starterItems) {
        if (existingCodes.has(item.kodeTp)) continue;
        await addDoc(collection(db, 'tujuan_pembelajaran'), {
          ...item,
          tahunPelajaran: activeTahunPelajaran,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        added++;
      }
      if (added > 0) {
        showNotice('success', `${added} Tujuan Pembelajaran Informatika berhasil ditambahkan untuk TA ${activeTahunPelajaran}.`);
      } else {
        showNotice('info', 'Semua template Tujuan Pembelajaran sudah ada pada tahun pelajaran ini.');
      }
    } catch (err) {
      onFirestoreError?.(err, 'create', 'tujuan_pembelajaran');
    }
  };

  const filteredTp = useMemo(() => {
    const q = tpSearch.trim().toLowerCase();
    return tpList
      .filter((t) => (tpKelasFilter === 'all' ? true : t.kelas === tpKelasFilter))
      .filter(
        (t) =>
          !q ||
          t.kodeTp.toLowerCase().includes(q) ||
          t.deskripsi.toLowerCase().includes(q) ||
          t.elemen.toLowerCase().includes(q)
      );
  }, [tpList, tpSearch, tpKelasFilter]);

  // ============================================================================
  // 3. AGENDA HARIAN STATE (Tergantung pada Jadwal Pelajaran)
  // ============================================================================
  const [agendaSubView, setAgendaSubView] = useState<'harian' | 'rekap'>('harian');
  const [rekapAgendaMonth, setRekapAgendaMonth] = useState<string>('all');
  const [rekapAgendaClass, setRekapAgendaClass] = useState<string>('all');
  const [rekapAgendaJenis, setRekapAgendaJenis] = useState<string>('all');
  const [rekapAgendaSearch, setRekapAgendaSearch] = useState<string>('');
  const [agendaSelectedDate, setAgendaSelectedDate] = useState<string>(getTodayIsoDate());
  const [agendaClassFilter, setAgendaClassFilter] = useState('all');
  const [agendaSearch, setAgendaSearch] = useState('');
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [editingAgendaId, setEditingAgendaId] = useState<string | null>(null);
  const [agendaForm, setAgendaForm] = useState<{
    tanggal: string;
    jadwalId: string;
    hari: string;
    kelas: string;
    jamKe: string;
    waktuMulai: string;
    waktuSelesai: string;
    mataPelajaran: string;
    jenisKegiatan: string;
    pertemuanKe: string;
    tpId: string;
    materi: string;
    kegiatan: string;
    catatan: string;
    hadirCount: number;
    sakitCount: number;
    izinCount: number;
    alpaCount: number;
  }>({
    tanggal: getTodayIsoDate(),
    jadwalId: '',
    hari: getHariFromDate(getTodayIsoDate()),
    kelas: '',
    jamKe: '1',
    waktuMulai: '07:30',
    waktuSelesai: '08:50',
    mataPelajaran: 'Informatika',
    jenisKegiatan: 'KBM',
    pertemuanKe: '1',
    tpId: '',
    materi: '',
    kegiatan: '',
    catatan: '',
    hadirCount: 0,
    sakitCount: 0,
    izinCount: 0,
    alpaCount: 0,
  });

  const agendaSelectedHari = useMemo(
    () => getHariFromDate(agendaSelectedDate),
    [agendaSelectedDate]
  );

  const todaySchedules = useMemo(() => {
    return jadwalList
      .filter((j) => !j.isBreak && j.hari === agendaSelectedHari)
      .slice()
      .sort((a, b) => parseSlotNumber(a.jamKe) - parseSlotNumber(b.jamKe));
  }, [jadwalList, agendaSelectedHari]);

  const findRecordedAgendaForSchedule = (
    jadwal: JadwalPelajaranItem,
    dateStr: string
  ): AgendaHarianItem | undefined => {
    return agendaList.find(
      (ag) =>
        ag.tanggal === dateStr &&
        (ag.jadwalId === jadwal.id ||
          (!ag.jadwalId &&
            ag.kelas === jadwal.kelas &&
            (ag.jamKe === jadwal.jamKe || ag.waktuMulai === jadwal.waktuMulai)))
    );
  };

  const todayScheduleSummary = useMemo(() => {
    const total = todaySchedules.length;
    const recorded = todaySchedules.filter((j) =>
      Boolean(findRecordedAgendaForSchedule(j, agendaSelectedDate))
    ).length;
    return {
      total,
      recorded,
      unfilled: Math.max(0, total - recorded),
    };
  }, [todaySchedules, agendaList, agendaSelectedDate]);

  const findAttendanceCounts = (kelas: string, tanggal: string, agendaId?: string) => {
    const rec = agendaId
      ? absensiList.find((a) => a.agendaId === agendaId) ||
        absensiList.find((a) => a.kelas === kelas && a.tanggal === tanggal)
      : absensiList.find((a) => a.kelas === kelas && a.tanggal === tanggal);
    if (!rec || !rec.entries) return null;
    let H = 0, S = 0, I = 0, A = 0;
    Object.values(rec.entries).forEach((e) => {
      if (e.status === 'H') H++;
      else if (e.status === 'S') S++;
      else if (e.status === 'I') I++;
      else if (e.status === 'A') A++;
    });
    return { H, S, I, A };
  };

  const isAgendaAttended = (agendaId: string, kelas: string, tanggal: string) => {
    return absensiList.some(
      (a) =>
        a.agendaId === agendaId ||
        (!a.agendaId && a.kelas === kelas && a.tanggal === tanggal)
    );
  };

  const openNewAgendaModal = (
    presetJadwal?: JadwalPelajaranItem,
    presetDate?: string,
    presetKelas?: string,
    isExtraZeroSlot?: boolean
  ) => {
    const today = presetDate || agendaSelectedDate || getTodayIsoDate();
    const dayName = getHariFromDate(today);

    let matchedJadwal: JadwalPelajaranItem | undefined = presetJadwal;
    if (!matchedJadwal && !isExtraZeroSlot) {
      if (presetKelas) {
        matchedJadwal =
          jadwalList.find(
            (j) => !j.isBreak && j.kelas === presetKelas && j.hari === dayName
          ) || jadwalList.find((j) => !j.isBreak && j.kelas === presetKelas);
      } else {
        matchedJadwal =
          jadwalList.find((j) => !j.isBreak && j.hari === dayName) ||
          jadwalList.find((j) => !j.isBreak);
      }
    }

    // Agenda tambahan default tanpa kelas kecuali presetKelas diberikan
    const defaultKelas = isExtraZeroSlot
      ? presetKelas || ''
      : presetKelas || matchedJadwal?.kelas || classOptions[0] || '';
    const classExistingCount = defaultKelas
      ? agendaList.filter((a) => a.kelas === defaultKelas).length
      : agendaList.filter((a) => !a.kelas).length;

    setEditingAgendaId(null);
    setAgendaForm({
      tanggal: today,
      jadwalId: isExtraZeroSlot ? '' : matchedJadwal?.id || '',
      hari: matchedJadwal?.hari || dayName,
      kelas: defaultKelas,
      jamKe: isExtraZeroSlot ? '0' : matchedJadwal?.jamKe || '1',
      waktuMulai: isExtraZeroSlot ? '06:30' : matchedJadwal?.waktuMulai || '07:30',
      waktuSelesai: isExtraZeroSlot ? '07:15' : matchedJadwal?.waktuSelesai || '08:50',
      mataPelajaran: matchedJadwal?.mataPelajaran || 'Informatika',
      jenisKegiatan: 'KBM',
      pertemuanKe: String(classExistingCount + 1),
      tpId: '',
      materi: '',
      kegiatan: '',
      catatan: '',
      hadirCount: 0,
      sakitCount: 0,
      izinCount: 0,
      alpaCount: 0,
    });
    setIsAgendaModalOpen(true);
  };

  const openEditAgendaModal = (item: AgendaHarianItem) => {
    setEditingAgendaId(item.id);
    setAgendaForm({
      tanggal: item.tanggal,
      jadwalId: item.jadwalId || '',
      hari: item.hari || getHariFromDate(item.tanggal),
      kelas: item.kelas || '',
      jamKe: item.jamKe || '',
      waktuMulai: item.waktuMulai || '',
      waktuSelesai: item.waktuSelesai || '',
      mataPelajaran: item.mataPelajaran || 'Informatika',
      jenisKegiatan: item.jenisKegiatan || 'KBM',
      pertemuanKe: item.pertemuanKe || '1',
      tpId: item.tpId || '',
      materi: item.materi,
      kegiatan: item.kegiatan || '',
      catatan: item.catatan || '',
      hadirCount: item.hadirCount ?? 0,
      sakitCount: item.sakitCount ?? 0,
      izinCount: item.izinCount ?? 0,
      alpaCount: item.alpaCount ?? 0,
    });
    setIsAgendaModalOpen(true);
  };

  const handleSaveAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agendaForm.tanggal || !agendaForm.materi.trim()) {
      showNotice('error', 'Tanggal dan Materi pokok wajib diisi.');
      return;
    }
    const linkedTp = tpList.find((t) => t.id === agendaForm.tpId);
    const existingItem = editingAgendaId
      ? agendaList.find((a) => a.id === editingAgendaId)
      : null;
    const payload = {
      tahunPelajaran: activeTahunPelajaran,
      semester: activeSemester,
      tanggal: agendaForm.tanggal,
      kelas: agendaForm.kelas.trim(),
      pertemuanKe: agendaForm.pertemuanKe.trim() || '1',
      jadwalId: agendaForm.jadwalId || '',
      hari: agendaForm.hari || getHariFromDate(agendaForm.tanggal),
      jamKe: agendaForm.jamKe || '',
      waktuMulai: agendaForm.waktuMulai || '',
      waktuSelesai: agendaForm.waktuSelesai || '',
      mataPelajaran: agendaForm.mataPelajaran || 'Informatika',
      jenisKegiatan: agendaForm.jenisKegiatan || 'KBM',
      tpId: linkedTp?.id || '',
      tpKode: linkedTp?.kodeTp || '',
      materi: agendaForm.materi.trim(),
      kegiatan: agendaForm.kegiatan.trim(),
      catatan: agendaForm.catatan.trim(),
      hadirCount: existingItem ? existingItem.hadirCount ?? 0 : 0,
      sakitCount: existingItem ? existingItem.sakitCount ?? 0 : 0,
      izinCount: existingItem ? existingItem.izinCount ?? 0 : 0,
      alpaCount: existingItem ? existingItem.alpaCount ?? 0 : 0,
      updatedAt: new Date().toISOString(),
    };
    try {
      if (editingAgendaId) {
        await updateDoc(doc(db, 'agenda_harian', editingAgendaId), payload);
        showNotice('success', 'Agenda harian berhasil diperbarui.');
      } else {
        const newDocRef = await addDoc(collection(db, 'agenda_harian'), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
        showNotice('success', 'Agenda harian berhasil dicatat berdasarkan jadwal pelajaran.');
        if (payload.kelas) {
          setSelectedAgendaId(newDocRef.id);
          setAbsensiClass(payload.kelas);
        }
      }
      setIsAgendaModalOpen(false);
    } catch (err) {
      onFirestoreError?.(err, 'write', 'agenda_harian');
      showNotice('error', 'Gagal menyimpan agenda harian.');
    }
  };

  const handleDeleteAgenda = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'agenda_harian', id));
      showNotice('success', 'Agenda harian dihapus.');
    } catch (err) {
      onFirestoreError?.(err, 'delete', `agenda_harian/${id}`);
    }
  };

  const filteredAgenda = useMemo(() => {
    const q = agendaSearch.trim().toLowerCase();
    return agendaList
      .filter((a) => (agendaClassFilter === 'all' ? true : a.kelas === agendaClassFilter))
      .filter(
        (a) =>
          !q ||
          a.materi.toLowerCase().includes(q) ||
          (a.kegiatan || '').toLowerCase().includes(q) ||
          (a.tpKode || '').toLowerCase().includes(q) ||
          (a.jamKe || '').toLowerCase().includes(q)
      );
  }, [agendaList, agendaClassFilter, agendaSearch]);

  const rekapAgendaMonths = useMemo(() => {
    const set = new Set<string>();
    agendaList.forEach((a) => {
      if (a.tanggal && a.tanggal.length >= 7) {
        set.add(a.tanggal.slice(0, 7));
      }
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [agendaList]);

  const rekapFilteredAgendas = useMemo(() => {
    const q = rekapAgendaSearch.trim().toLowerCase();
    return agendaList
      .filter((a) => (rekapAgendaMonth === 'all' ? true : (a.tanggal || '').startsWith(rekapAgendaMonth)))
      .filter((a) => {
        if (rekapAgendaClass === 'all') return true;
        if (rekapAgendaClass === 'non_kelas') return !a.kelas?.trim();
        return a.kelas === rekapAgendaClass;
      })
      .filter((a) => (rekapAgendaJenis === 'all' ? true : (a.jenisKegiatan || 'KBM') === rekapAgendaJenis))
      .filter(
        (a) =>
          !q ||
          a.materi.toLowerCase().includes(q) ||
          (a.kegiatan || '').toLowerCase().includes(q) ||
          (a.tpKode || '').toLowerCase().includes(q) ||
          (a.catatan || '').toLowerCase().includes(q) ||
          (a.kelas || '').toLowerCase().includes(q)
      )
      .slice()
      .sort((a, b) => {
        const d = (b.tanggal || '').localeCompare(a.tanggal || '');
        if (d !== 0) return d;
        return parseSlotNumber(a.jamKe) - parseSlotNumber(b.jamKe);
      });
  }, [agendaList, rekapAgendaMonth, rekapAgendaClass, rekapAgendaJenis, rekapAgendaSearch]);

  const rekapAgendaStats = useMemo(() => {
    const byJenis: Record<string, number> = {};
    const uniqueDates = new Set<string>();
    const uniqueTps = new Set<string>();
    let kbmCount = 0;
    let extraCount = 0;

    rekapFilteredAgendas.forEach((a) => {
      const jk = a.jenisKegiatan || 'KBM';
      byJenis[jk] = (byJenis[jk] || 0) + 1;
      if (a.tanggal) uniqueDates.add(a.tanggal);
      if (a.tpKode) uniqueTps.add(a.tpKode);
      if (a.kelas?.trim()) kbmCount++;
      else extraCount++;
    });

    return {
      total: rekapFilteredAgendas.length,
      kbmCount,
      extraCount,
      activeDays: uniqueDates.size,
      tpCount: uniqueTps.size,
      byJenis: Object.entries(byJenis).sort((a, b) => b[1] - a[1]),
    };
  }, [rekapFilteredAgendas]);

  // ============================================================================
  // 4. ABSENSI SISWA STATE (Tergantung pada Agenda Harian yang Dicatat)
  // ============================================================================
  const [absensiClass, setAbsensiClass] = useState<string>('');
  const [selectedAgendaId, setSelectedAgendaId] = useState<string>('');
  const [absensiMode, setAbsensiMode] = useState<'input' | 'rekap'>('input');
  const [absensiDraft, setAbsensiDraft] = useState<Record<string, AbsensiStudentEntry>>({});
  const [absensiSubView, setAbsensiSubView] = useState<'agenda_hari_ini' | 'tanggungan' | 'rekap'>('agenda_hari_ini');
  const [selectedRekapKelas, setSelectedRekapKelas] = useState<string>('');

  // Agenda yang tercatat pada tanggal terpilih & memiliki kelas
  const absensiDateAgendas = useMemo(() => {
    return agendaList.filter((a) => a.tanggal === agendaSelectedDate && Boolean(a.kelas?.trim()));
  }, [agendaList, agendaSelectedDate]);

  // Daftar kelas unik yang tercatat di agenda tanggal terpilih (untuk Absensi Hari Ini per kelas)
  const absensiDateClasses = useMemo(() => {
    const set = new Set<string>();
    absensiDateAgendas.forEach((a) => {
      if (a.kelas?.trim()) set.add(a.kelas.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [absensiDateAgendas]);

  // Tanggungan absensi: hanya agenda yang memiliki kelas & belum diisi absensinya
  const tanggunganAgendas = useMemo(() => {
    return agendaList
      .filter((a) => Boolean(a.kelas?.trim()) && !isAgendaAttended(a.id, a.kelas, a.tanggal))
      .sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));
  }, [agendaList, absensiList]);

  const tanggunganClassesList = useMemo(() => {
    return Array.from(new Set(tanggunganAgendas.map((a) => a.kelas.trim())))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [tanggunganAgendas]);

  const [isSavingAbsensi, setIsSavingAbsensi] = useState(false);

  // Sync selected class when classOptions change
  useEffect(() => {
    if (classOptions.length === 0) {
      setAbsensiClass('');
    } else if (!absensiClass || !classOptions.includes(absensiClass)) {
      setAbsensiClass(classOptions[0]);
    }
  }, [classOptions, absensiClass]);

  const selectedAgenda = useMemo(
    () => agendaList.find((a) => a.id === selectedAgendaId) || null,
    [agendaList, selectedAgendaId]
  );

  // All recorded agendas for the currently selected agenda's class (for quick session switching)
  const classAgendas = useMemo(() => {
    const cls = selectedAgenda?.kelas || absensiClass;
    if (!cls) return [];
    return agendaList
      .filter((a) => a.kelas === cls)
      .sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));
  }, [agendaList, selectedAgenda, absensiClass]);

  const absensiClassStudents = useMemo(() => {
    const cls = selectedAgenda?.kelas || absensiClass;
    return cls ? studentsByClass[cls] || [] : [];
  }, [selectedAgenda, absensiClass, studentsByClass]);

  // Find attendance record matching the active agenda
  const existingAbsensiForSelectedAgenda = useMemo(() => {
    if (!selectedAgenda) return null;
    return (
      absensiList.find((a) => a.agendaId === selectedAgenda.id) ||
      absensiList.find(
        (a) =>
          !a.agendaId &&
          a.kelas === selectedAgenda.kelas &&
          a.tanggal === selectedAgenda.tanggal
      ) ||
      null
    );
  }, [selectedAgenda, absensiList]);

  // Hydrate draft from stored Firestore record or default Hadir
  useEffect(() => {
    if (!absensiClass || !selectedAgenda) {
      setAbsensiDraft({});
      return;
    }
    const nextDraft: Record<string, AbsensiStudentEntry> = {};
    absensiClassStudents.forEach((s) => {
      const saved = existingAbsensiForSelectedAgenda?.entries?.[s.id];
      nextDraft[s.id] = saved
        ? { status: saved.status, catatan: saved.catatan || '' }
        : { status: 'H', catatan: '' };
    });
    setAbsensiDraft(nextDraft);
  }, [absensiClass, selectedAgenda, existingAbsensiForSelectedAgenda, absensiClassStudents]);

  const absensiDocExists = Boolean(existingAbsensiForSelectedAgenda);

  const setStudentAttendance = (studentId: string, status: AttendanceStatus) => {
    setAbsensiDraft((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const setAllPresent = () => {
    const next: Record<string, AbsensiStudentEntry> = {};
    absensiClassStudents.forEach((s) => {
      next[s.id] = { status: 'H', catatan: absensiDraft[s.id]?.catatan || '' };
    });
    setAbsensiDraft(next);
  };

  const handleSaveAbsensi = async () => {
    if (!absensiClass || absensiClassStudents.length === 0) {
      showNotice('error', 'Pilih kelas yang memiliki siswa terdaftar.');
      return;
    }
    if (!selectedAgenda) {
      showNotice('error', 'Pilih Agenda Harian terlebih dahulu sebagai acuan absensi.');
      return;
    }
    setIsSavingAbsensi(true);
    const docId =
      existingAbsensiForSelectedAgenda?.id ||
      `${slugifyTermPart(activeTahunPelajaran)}__${activeSemester}__agenda_${selectedAgenda.id}`;

    const cleanEntries: Record<string, AbsensiStudentEntry> = {};
    let H = 0, S = 0, I = 0, A = 0;
    absensiClassStudents.forEach((s) => {
      const entry = absensiDraft[s.id] || { status: 'H', catatan: '' };
      cleanEntries[s.id] = {
        status: entry.status,
        catatan: (entry.catatan || '').trim(),
      };
      if (entry.status === 'H') H++;
      else if (entry.status === 'S') S++;
      else if (entry.status === 'I') I++;
      else if (entry.status === 'A') A++;
    });

    try {
      // 1. Save attendance record linked to agendaId
      await setDoc(doc(db, 'absensi_siswa', docId), {
        id: docId,
        agendaId: selectedAgenda.id,
        tahunPelajaran: activeTahunPelajaran,
        semester: activeSemester,
        tanggal: selectedAgenda.tanggal,
        kelas: absensiClass,
        pertemuanKe: selectedAgenda.pertemuanKe || '1',
        jamKe: selectedAgenda.jamKe || '',
        materi: selectedAgenda.materi || '',
        entries: cleanEntries,
        updatedAt: new Date().toISOString(),
      });

      // 2. Synchronize counts directly into the linked agenda_harian document!
      await updateDoc(doc(db, 'agenda_harian', selectedAgenda.id), {
        hadirCount: H,
        sakitCount: S,
        izinCount: I,
        alpaCount: A,
        updatedAt: new Date().toISOString(),
      });

      showNotice(
        'success',
        `Absensi Pertemuan ke-${selectedAgenda.pertemuanKe} Kelas ${absensiClass} (${H} Hadir, ${S} Sakit, ${I} Izin, ${A} Alpa) berhasil disimpan dan disinkronkan ke Agenda Harian!`
      );
    } catch (err) {
      onFirestoreError?.(err, 'write', `absensi_siswa/${docId}`);
      showNotice('error', 'Gagal menyimpan absensi siswa.');
    } finally {
      setIsSavingAbsensi(false);
    }
  };

  const absensiDraftCounts = useMemo(() => {
    let H = 0, S = 0, I = 0, A = 0;
    absensiClassStudents.forEach((s) => {
      const st = absensiDraft[s.id]?.status || 'H';
      if (st === 'H') H++;
      else if (st === 'S') S++;
      else if (st === 'I') I++;
      else if (st === 'A') A++;
    });
    return { H, S, I, A };
  }, [absensiClassStudents, absensiDraft]);

  // ============================================================================
  // 5A. NILAI SUMATIF STATE
  // ============================================================================
  const [nilaiClass, setNilaiClass] = useState<string>('');
  useEffect(() => {
    if (classOptions.length === 0) {
      setNilaiClass('');
    } else if (!nilaiClass || !classOptions.includes(nilaiClass)) {
      setNilaiClass(classOptions[0]);
    }
  }, [classOptions, nilaiClass]);

  const nilaiClassStudents = useMemo(
    () => (nilaiClass ? studentsByClass[nilaiClass] || [] : []),
    [nilaiClass, studentsByClass]
  );

  const doesTpMatchClass = (tpKelas: string, targetClass: string): boolean => {
    const tpK = (tpKelas || '').trim().toUpperCase();
    const cls = (targetClass || '').trim().toUpperCase();
    if (!cls) return true;
    if (!tpK || tpK === 'SEMUA' || tpK === 'ALL') return true;
    if (tpK === cls) return true;
    if ((tpK === 'VII' || tpK === '7' || tpK === 'KELAS VII' || tpK === 'KELAS 7') && (cls.startsWith('7') || cls.startsWith('VII'))) {
      return true;
    }
    if ((tpK === 'VIII' || tpK === '8' || tpK === 'KELAS VIII' || tpK === 'KELAS 8') && (cls.startsWith('8') || cls.startsWith('VIII'))) {
      return true;
    }
    if ((tpK === 'IX' || tpK === '9' || tpK === 'KELAS IX' || tpK === 'KELAS 9') && (cls.startsWith('9') || cls.startsWith('IX'))) {
      return true;
    }
    return false;
  };

  const isSumatifAkhirItem = (s: NilaiSumatifItem) =>
    s.jenis === 'Sumatif Akhir Semester' || s.jenis === 'Sumatif Tengah Semester';

  const classSumatifList = useMemo(() => {
    const saved = sumatifList.filter(
      (s) => (!nilaiClass || s.kelas === nilaiClass) && !isSumatifAkhirItem(s)
    );
    if (!nilaiClass) return saved;

    const savedIdSet = new Set(saved.map((s) => s.id));
    const autoGenerated: NilaiSumatifItem[] = [];

    tpList
      .filter((tp) => doesTpMatchClass(tp.kelas, nilaiClass))
      .forEach((tp) => {
        if (tp.isSumatif) {
          const autoId = `auto_sumatif__${slugifyTermPart(activeTahunPelajaran)}__${activeSemester}__${slugifyTermPart(nilaiClass)}__${slugifyTermPart(tp.id)}`;
          const alreadyExists =
            savedIdSet.has(autoId) ||
            saved.some(
              (s) =>
                s.jenis !== 'Praktik' &&
                ((s.tpId && s.tpId === tp.id) ||
                  (s.tpKode && s.tpKode.trim().toUpperCase() === tp.kodeTp.trim().toUpperCase()))
            );
          if (!alreadyExists) {
            autoGenerated.push({
              id: autoId,
              tahunPelajaran: activeTahunPelajaran,
              semester: activeSemester,
              kelas: nilaiClass,
              judul: tp.kodeTp,
              jenis: 'Sumatif Lingkup Materi',
              tanggal: getTodayIsoDate(),
              tpId: tp.id,
              tpKode: tp.kodeTp,
              bobot: 1,
              scores: {},
              notes: {},
            });
          }
        }
        if (tp.isPraktikum) {
          const autoId = `auto_praktik__${slugifyTermPart(activeTahunPelajaran)}__${activeSemester}__${slugifyTermPart(nilaiClass)}__${slugifyTermPart(tp.id)}`;
          const alreadyExists =
            savedIdSet.has(autoId) ||
            saved.some(
              (s) =>
                s.jenis === 'Praktik' &&
                ((s.tpId && s.tpId === tp.id) ||
                  (s.tpKode && s.tpKode.trim().toUpperCase() === tp.kodeTp.trim().toUpperCase()))
            );
          if (!alreadyExists) {
            autoGenerated.push({
              id: autoId,
              tahunPelajaran: activeTahunPelajaran,
              semester: activeSemester,
              kelas: nilaiClass,
              judul: tp.kodeTp,
              jenis: 'Praktik',
              tanggal: getTodayIsoDate(),
              tpId: tp.id,
              tpKode: tp.kodeTp,
              bobot: 1,
              scores: {},
              notes: {},
            });
          }
        }
      });

    return [...saved, ...autoGenerated].sort((a, b) => {
      const codeA = (a.tpKode || a.judul || '').toUpperCase();
      const codeB = (b.tpKode || b.judul || '').toUpperCase();
      if (codeA !== codeB) return codeA.localeCompare(codeB);
      const rankA = a.jenis === 'Praktik' ? 1 : 0;
      const rankB = b.jenis === 'Praktik' ? 1 : 0;
      return rankA - rankB;
    });
  }, [sumatifList, nilaiClass, tpList, activeTahunPelajaran, activeSemester]);

  const classSumatifAkhirList = useMemo(() => {
    const saved = sumatifList.filter(
      (s) => (!nilaiClass || s.kelas === nilaiClass) && isSumatifAkhirItem(s)
    );
    if (!nilaiClass) return saved;
    if (saved.length > 0) return saved;
    const defaultId = `auto_sumatif_akhir__${slugifyTermPart(activeTahunPelajaran)}__${activeSemester}__${slugifyTermPart(nilaiClass)}`;
    return [
      {
        id: defaultId,
        tahunPelajaran: activeTahunPelajaran,
        semester: activeSemester,
        kelas: nilaiClass,
        judul: 'Sumatif Akhir',
        jenis: 'Sumatif Akhir Semester' as const,
        tanggal: getTodayIsoDate(),
        tpId: '',
        tpKode: '',
        bobot: 1,
        scores: {},
        notes: {},
      },
    ];
  }, [sumatifList, nilaiClass, activeTahunPelajaran, activeSemester]);

  const [sumatifMatrixDraft, setSumatifMatrixDraft] = useState<
    Record<string, Record<string, string>>
  >({});
  const [isSavingSumatifScores, setIsSavingSumatifScores] = useState(false);

  useEffect(() => {
    const next: Record<string, Record<string, string>> = {};
    [...classSumatifList, ...classSumatifAkhirList].forEach((sum) => {
      const colDraft: Record<string, string> = {};
      nilaiClassStudents.forEach((s) => {
        const val = sum.scores?.[s.id];
        colDraft[s.id] = val !== undefined && val !== null ? String(val) : '';
      });
      next[sum.id] = colDraft;
    });
    setSumatifMatrixDraft(next);
  }, [classSumatifList, classSumatifAkhirList, nilaiClassStudents]);

  const [isSumatifModalOpen, setIsSumatifModalOpen] = useState(false);
  const [sumatifForm, setSumatifForm] = useState<{
    judul: string;
    jenis: NilaiSumatifItem['jenis'];
    kelas: string;
    tanggal: string;
    tpId: string;
    bobot: number;
  }>({
    judul: 'Sumatif 1',
    jenis: 'Sumatif Lingkup Materi',
    kelas: '',
    tanggal: getTodayIsoDate(),
    tpId: '',
    bobot: 1,
  });

  const openNewSumatifModal = (mode: 'sumatif' | 'sumatif_akhir' = 'sumatif') => {
    if (mode === 'sumatif_akhir') {
      const savedCount = sumatifList.filter(
        (s) => (!nilaiClass || s.kelas === nilaiClass) && isSumatifAkhirItem(s)
      ).length;
      setSumatifForm({
        judul: savedCount === 0 ? 'Sumatif Akhir' : `Sumatif Akhir ${savedCount + 1}`,
        jenis: 'Sumatif Akhir Semester',
        kelas: nilaiClass || classOptions[0] || '',
        tanggal: getTodayIsoDate(),
        tpId: '',
        bobot: 1,
      });
    } else {
      setSumatifForm({
        judul: `Sumatif ${classSumatifList.length + 1}`,
        jenis: 'Sumatif Lingkup Materi',
        kelas: nilaiClass || classOptions[0] || '',
        tanggal: getTodayIsoDate(),
        tpId: tpList[0]?.id || '',
        bobot: 1,
      });
    }
    setIsSumatifModalOpen(true);
  };

  const handleCreateSumatif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sumatifForm.judul.trim() || !sumatifForm.kelas.trim()) {
      showNotice('error', 'Judul penilaian dan Kelas wajib diisi.');
      return;
    }
    const linkedTp = tpList.find((t) => t.id === sumatifForm.tpId);
    try {
      await addDoc(collection(db, 'nilai_sumatif'), {
        tahunPelajaran: activeTahunPelajaran,
        semester: activeSemester,
        kelas: sumatifForm.kelas.trim(),
        judul: sumatifForm.judul.trim(),
        jenis: sumatifForm.jenis,
        tanggal: sumatifForm.tanggal,
        tpId: linkedTp?.id || '',
        tpKode: linkedTp?.kodeTp || '',
        bobot: Number(sumatifForm.bobot) || 1,
        scores: {},
        notes: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setNilaiClass(sumatifForm.kelas.trim());
      setIsSumatifModalOpen(false);
      showNotice('success', `Penilaian "${sumatifForm.judul.trim()}" berhasil dibuat.`);
    } catch (err) {
      onFirestoreError?.(err, 'create', 'nilai_sumatif');
      showNotice('error', 'Gagal membuat penilaian sumatif.');
    }
  };

  const handleDeleteSumatif = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'nilai_sumatif', id));
      showNotice('success', 'Penilaian dihapus.');
    } catch (err) {
      onFirestoreError?.(err, 'delete', `nilai_sumatif/${id}`);
    }
  };

  const handleSaveSumatifBatch = async (
    targetItems: NilaiSumatifItem[],
    successLabel: string
  ) => {
    if (targetItems.length === 0) return;
    setIsSavingSumatifScores(true);
    const savedIdSet = new Set(sumatifList.map((s) => s.id));
    const nowIso = new Date().toISOString();

    try {
      const writes: Promise<void>[] = [];
      targetItems.forEach((sum) => {
        const colDraft = sumatifMatrixDraft[sum.id] || {};
        const cleanScores: Record<string, number> = {};
        nilaiClassStudents.forEach((s) => {
          const raw = (colDraft[s.id] || '').trim();
          if (raw !== '') {
            const num = Math.max(0, Math.min(100, Number(raw)));
            if (!Number.isNaN(num)) {
              cleanScores[s.id] = Math.round(num);
            }
          }
        });

        const isAlreadySaved = savedIdSet.has(sum.id);
        if (!isAlreadySaved && Object.keys(cleanScores).length === 0) {
          return;
        }

        writes.push(
          setDoc(
            doc(db, 'nilai_sumatif', sum.id),
            {
              tahunPelajaran: sum.tahunPelajaran || activeTahunPelajaran,
              semester: sum.semester || activeSemester,
              kelas: sum.kelas,
              judul: sum.judul,
              jenis: sum.jenis,
              tanggal: sum.tanggal || getTodayIsoDate(),
              tpId: sum.tpId || '',
              tpKode: sum.tpKode || '',
              bobot: Number(sum.bobot) || 1,
              scores: cleanScores,
              notes: sum.notes || {},
              createdAt: sum.createdAt || nowIso,
              updatedAt: nowIso,
            },
            { merge: true }
          )
        );
      });

      if (writes.length === 0) {
        showNotice('info', 'Belum ada nilai yang diisi untuk disimpan.');
        setIsSavingSumatifScores(false);
        return;
      }

      await Promise.all(writes);
      showNotice('success', successLabel);
    } catch (err) {
      onFirestoreError?.(err, 'update', 'nilai_sumatif');
      showNotice('error', 'Gagal menyimpan nilai.');
    } finally {
      setIsSavingSumatifScores(false);
    }
  };

  const handleSaveAllSumatifScores = () =>
    handleSaveSumatifBatch(
      classSumatifList,
      `Semua nilai sumatif & praktikum Kelas ${nilaiClass} berhasil disimpan.`
    );

  const handleSaveAllSumatifAkhirScores = () =>
    handleSaveSumatifBatch(
      classSumatifAkhirList,
      `Nilai Sumatif Akhir Kelas ${nilaiClass} berhasil disimpan.`
    );

  const handleExportSumatifCsv = () => {
    if (!nilaiClass || classSumatifList.length === 0) return;
    const headers = [
      'No',
      'NISN',
      'Nama Siswa',
      ...classSumatifList.map(
        (sum) => `${sum.judul} (${sum.jenis === 'Praktik' ? 'Praktikum' : 'Sumatif'})`
      ),
      'Rata-rata',
    ];
    const rows = nilaiClassStudents.map((s, idx) => {
      let weightedSum = 0;
      let totalWeight = 0;
      const vals = classSumatifList.map((sum) => {
        const raw = (sumatifMatrixDraft[sum.id]?.[s.id] || '').trim();
        if (raw !== '' && !Number.isNaN(Number(raw))) {
          const num = Math.round(Math.max(0, Math.min(100, Number(raw))));
          const w = Number(sum.bobot || 1) || 1;
          weightedSum += num * w;
          totalWeight += w;
          return num;
        }
        return '';
      });
      const avg = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : '';
      return [idx + 1, s.nis, s.nama, ...vals, avg];
    });
    downloadCsv(
      `Nilai_Sumatif_Praktikum_${nilaiClass}_${slugifyTermPart(activeTahunPelajaran)}_${activeSemester}.csv`,
      headers,
      rows
    );
  };

  const handleExportSumatifAkhirCsv = () => {
    if (!nilaiClass || classSumatifAkhirList.length === 0) return;
    const headers = [
      'No',
      'NISN',
      'Nama Siswa',
      ...classSumatifAkhirList.map((sum) => sum.judul),
      'Rata-rata',
    ];
    const rows = nilaiClassStudents.map((s, idx) => {
      let weightedSum = 0;
      let totalWeight = 0;
      const vals = classSumatifAkhirList.map((sum) => {
        const raw = (sumatifMatrixDraft[sum.id]?.[s.id] || '').trim();
        if (raw !== '' && !Number.isNaN(Number(raw))) {
          const num = Math.round(Math.max(0, Math.min(100, Number(raw))));
          const w = Number(sum.bobot || 1) || 1;
          weightedSum += num * w;
          totalWeight += w;
          return num;
        }
        return '';
      });
      const avg = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : '';
      return [idx + 1, s.nis, s.nama, ...vals, avg];
    });
    downloadCsv(
      `Nilai_Sumatif_Akhir_${nilaiClass}_${slugifyTermPart(activeTahunPelajaran)}_${activeSemester}.csv`,
      headers,
      rows
    );
  };

  // ============================================================================
  // 5B. NILAI RAPOR STATE & BOBOT %
  // ============================================================================
  const [raporWeights, setRaporWeights] = useState<RaporWeightConfig>(DEFAULT_RAPOR_WEIGHTS);

  const raporWeightTotal =
    (Number(raporWeights.pctSumatifTp) || 0) +
    (Number(raporWeights.pctPraktikumTp) || 0) +
    (Number(raporWeights.pctSumatifAkhir) || 0);
  const isRaporWeightValid = raporWeightTotal === 100;

  const handleUpdateRaporWeight = (field: keyof RaporWeightConfig, rawValue: number) => {
    const cleanVal = Math.max(0, Math.min(100, Math.round(Number(rawValue) || 0)));
    const nextWeights: RaporWeightConfig = {
      ...raporWeights,
      [field]: cleanVal,
    };
    setRaporWeights(nextWeights);
    const nextTotal =
      nextWeights.pctSumatifTp + nextWeights.pctPraktikumTp + nextWeights.pctSumatifAkhir;
    if (nextTotal === 100) {
      setDoc(
        doc(db, 'app_settings', 'rapor_weights'),
        {
          ...nextWeights,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch((err) => onFirestoreError?.(err, 'write', 'app_settings/rapor_weights'));
    }
  };

  const sumatifTpCols = useMemo(
    () => classSumatifList.filter((s) => s.jenis !== 'Praktik'),
    [classSumatifList]
  );
  const praktikumTpCols = useMemo(
    () => classSumatifList.filter((s) => s.jenis === 'Praktik'),
    [classSumatifList]
  );
  const sumatifAkhirCols = classSumatifAkhirList;

  const calcCategoryAvg = (cols: NilaiSumatifItem[], studentId: string): number => {
    let weightedSum = 0;
    let totalWeight = 0;
    cols.forEach((col) => {
      const val = col.scores?.[studentId];
      if (val !== undefined && val !== null && !Number.isNaN(Number(val))) {
        const w = Number(col.bobot || 1) || 1;
        weightedSum += Number(val) * w;
        totalWeight += w;
      }
    });
    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  };

  const computeStudentRaporBreakdown = (studentId: string) => {
    const avgSumatifTp = calcCategoryAvg(sumatifTpCols, studentId);
    const avgPraktikumTp = calcCategoryAvg(praktikumTpCols, studentId);
    const avgSumatifAkhir = calcCategoryAvg(sumatifAkhirCols, studentId);
    const nilaiAkhir = Math.round(
      (avgSumatifTp * (Number(raporWeights.pctSumatifTp) || 0) +
        avgPraktikumTp * (Number(raporWeights.pctPraktikumTp) || 0) +
        avgSumatifAkhir * (Number(raporWeights.pctSumatifAkhir) || 0)) /
        100
    );
    return {
      avgSumatifTp,
      avgPraktikumTp,
      avgSumatifAkhir,
      nilaiAkhir,
    };
  };

  type RaporDraftRow = {
    isFinalized: boolean;
  };

  const [raporDraft, setRaporDraft] = useState<Record<string, RaporDraftRow>>({});
  const [isSavingRapor, setIsSavingRapor] = useState(false);

  useEffect(() => {
    const next: Record<string, RaporDraftRow> = {};
    nilaiClassStudents.forEach((s) => {
      const saved = raporList.find((r) => r.studentId === s.id);
      next[s.id] = {
        isFinalized: Boolean(saved?.isFinalized),
      };
    });
    setRaporDraft(next);
  }, [nilaiClassStudents, raporList]);

  const updateRaporField = (
    studentId: string,
    field: keyof RaporDraftRow,
    value: boolean
  ) => {
    setRaporDraft((prev) => {
      const cur = prev[studentId] || {
        isFinalized: false,
      };
      return { ...prev, [studentId]: { ...cur, [field]: value } };
    });
  };

  const handleSaveAllRapor = async () => {
    if (!nilaiClass || nilaiClassStudents.length === 0) return;
    if (!isRaporWeightValid) {
      showNotice(
        'error',
        `Jumlah persentase bobot saat ini ${raporWeightTotal}%. Harap atur agar total tepat 100% sebelum menyimpan.`
      );
      return;
    }
    setIsSavingRapor(true);
    try {
      const now = new Date().toISOString();
      await Promise.all(
        nilaiClassStudents.map((s) => {
          const row = raporDraft[s.id];
          const saved = raporList.find((r) => r.studentId === s.id);
          const { avgSumatifTp, avgPraktikumTp, avgSumatifAkhir, nilaiAkhir } =
            computeStudentRaporBreakdown(s.id);
          const docId = `${slugifyTermPart(activeTahunPelajaran)}__${activeSemester}__${slugifyTermPart(s.id)}`;
          const cleanAkhir = Math.max(0, Math.min(100, Math.round(nilaiAkhir)));
          return setDoc(doc(db, 'nilai_rapor', docId), {
            tahunPelajaran: activeTahunPelajaran,
            semester: activeSemester,
            studentId: s.id,
            studentNis: s.nis,
            studentName: s.nama,
            kelas: s.kelas,
            nilaiFormatif: avgSumatifTp,
            nilaiSumatif: avgSumatifTp,
            nilaiProyek: avgPraktikumTp,
            nilaiSumatifTp: avgSumatifTp,
            nilaiPraktikumTp: avgPraktikumTp,
            nilaiSumatifAkhir: avgSumatifAkhir,
            nilaiAkhir: cleanAkhir,
            predikat: getPredikatFromScore(cleanAkhir),
            capaianKompetensi: saved?.capaianKompetensi || '',
            catatanGuru: saved?.catatanGuru || '',
            isFinalized: Boolean(row?.isFinalized),
            updatedAt: now,
          });
        })
      );
      showNotice('success', `Nilai Rapor Kelas ${nilaiClass} berhasil disimpan untuk ${nilaiClassStudents.length} siswa.`);
    } catch (err) {
      onFirestoreError?.(err, 'write', 'nilai_rapor');
      showNotice('error', 'Gagal menyimpan Nilai Rapor.');
    } finally {
      setIsSavingRapor(false);
    }
  };

  const exportRaporCsv = () => {
    if (!nilaiClass || nilaiClassStudents.length === 0) return;
    const headers = [
      'No',
      'NISN',
      'Nama Siswa',
      'Kelas',
      'Tahun Pelajaran',
      'Semester',
      'Hadir',
      'Sakit',
      'Izin',
      'Alpa',
      ...sumatifTpCols.map((c) => `${c.judul} (Sumatif TP)`),
      ...praktikumTpCols.map((c) => `${c.judul} (Praktikum TP)`),
      ...sumatifAkhirCols.map((c) => `${c.judul} (Sumatif Akhir)`),
      `Rata Sumatif TP (${raporWeights.pctSumatifTp}%)`,
      `Rata Praktikum TP (${raporWeights.pctPraktikumTp}%)`,
      `Rata Sumatif Akhir (${raporWeights.pctSumatifAkhir}%)`,
      'Nilai Akhir Rapor',
    ];
    const rows = nilaiClassStudents.map((s, idx) => {
      const att = studentAttendanceRecap[s.id] || { H: 0, S: 0, I: 0, A: 0 };
      const { avgSumatifTp, avgPraktikumTp, avgSumatifAkhir, nilaiAkhir } =
        computeStudentRaporBreakdown(s.id);
      return [
        idx + 1,
        s.nis,
        s.nama,
        s.kelas,
        activeTahunPelajaran,
        activeSemester,
        att.H,
        att.S,
        att.I,
        att.A,
        ...sumatifTpCols.map((c) => c.scores?.[s.id] ?? ''),
        ...praktikumTpCols.map((c) => c.scores?.[s.id] ?? ''),
        ...sumatifAkhirCols.map((c) => c.scores?.[s.id] ?? ''),
        avgSumatifTp,
        avgPraktikumTp,
        avgSumatifAkhir,
        nilaiAkhir,
      ];
    });
    downloadCsv(
      `Nilai_Rapor_${nilaiClass}_${slugifyTermPart(activeTahunPelajaran)}_${activeSemester}.csv`,
      headers,
      rows
    );
  };

  const navTabs: { id: AdministrasiSubTab; label: string; icon: any; count?: number; desc: string }[] = [
    {
      id: 'jadwal',
      label: 'Jadwal Pelajaran',
      icon: Calendar,
      count: jadwalList.length,
      desc: `Semester ${activeSemester}`,
    },
    {
      id: 'tp',
      label: 'Tujuan Pembelajaran',
      icon: Target,
      count: tpList.length,
      desc: `TA ${activeTahunPelajaran} (Tetap saat ganti semester)`,
    },
    {
      id: 'agenda',
      label: 'Agenda Harian',
      icon: BookOpenCheck,
      count: agendaList.length,
      desc: `Semester ${activeSemester}`,
    },
    {
      id: 'absensi',
      label: 'Absensi Siswa',
      icon: UserCheck,
      count: absensiList.length,
      desc: `${students.length} Siswa`,
    },
    {
      id: 'nilai',
      label: 'Input Nilai',
      icon: Award,
      count: sumatifList.length,
      desc: 'Sumatif & Rapor',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Term Banner & Overview */}
      <div className="admin-glass-card rounded-2xl p-4 md:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-brand/10 dark:bg-blue-950/60 text-brand dark:text-blue-300 border border-brand/20 dark:border-blue-800/60">
              TA {activeTahunPelajaran}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              Semester {activeSemester}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 tabular-nums">
              {students.length} Siswa · {classOptions.length} Kelas
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Kelola Administrasi Pembelajaran
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Seluruh jadwal, agenda, absensi, dan nilai mengacu langsung pada daftar siswa di Tahun Pelajaran aktif.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigateTab && (
            <>
              <button
                type="button"
                onClick={() => onNavigateTab('student_management')}
                className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Users size={14} className="text-brand dark:text-blue-400" />
                Siswa & Kelas
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('settings')}
                className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw size={14} className="text-emerald-600 dark:text-emerald-400" />
                Ganti Tahun / Semester
              </button>
            </>
          )}
        </div>
      </div>

      {/* Empty Students Notice when new Tahun Pelajaran has no students yet */}
      {students.length === 0 && (
        <div className="rounded-2xl border border-amber-300/80 dark:border-amber-800/70 bg-amber-50/90 dark:bg-amber-950/40 p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Info size={20} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-amber-950 dark:text-amber-200">
                Belum Ada Data Siswa pada Tahun Pelajaran {activeTahunPelajaran}
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                Data siswa tahun pelajaran sebelumnya tetap tersimpan aman. Tambahkan atau impor data siswa di menu <strong>Siswa & Kelas</strong> untuk mengisi Absensi, Agenda, dan Input Nilai.
              </p>
            </div>
          </div>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('student_management')}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0 self-start sm:self-center cursor-pointer transition-colors"
            >
              Isi Siswa & Kelas
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}

      {/* Feedback Banner */}
      {notice && (
        <div
          className={`rounded-xl px-4 py-3 border text-xs md:text-sm font-bold flex items-center justify-between gap-3 ${
            notice.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : notice.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              : 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle2 size={16} className="shrink-0" />
            ) : (
              <AlertCircle size={16} className="shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
          <button type="button" onClick={() => setNotice(null)} className="p-1 opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Sub-Navigation Pills (5 Pages inside Kelola Administrasi) */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white/35 dark:bg-white/5 rounded-2xl border border-white/50 dark:border-white/12">
        {navTabs.map((t) => {
          const Icon = t.icon;
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                active
                  ? 'bg-gradient-to-r from-brand to-blue-600 text-white shadow-md shadow-brand/20'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-800/80'
              }`}
            >
              <Icon size={15} />
              <span>{t.label}</span>
              {typeof t.count === 'number' && (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-black tabular-nums ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: JADWAL PELAJARAN                                               */}
      {/* ===================================================================== */}
      {subTab === 'jadwal' && (
        <div className="space-y-5">
          {/* Toolbar */}
          <div className="admin-glass-card rounded-2xl p-4 md:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={jadwalClassFilter}
                onChange={(e) => setJadwalClassFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
              >
                <option value="all">Semua Kelas</option>
                {classOptions.map((c) => (
                  <option key={c} value={c}>
                    Kelas {c}
                  </option>
                ))}
              </select>
              <select
                value={jadwalHariFilter}
                onChange={(e) => setJadwalHariFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
              >
                <option value="all">Semua Hari (Senin–Jumat)</option>
                {HARI_LIST.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setJadwalViewMode('board')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    jadwalViewMode === 'board'
                      ? 'bg-white dark:bg-slate-900 text-brand dark:text-blue-300 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <LayoutGrid size={13} />
                  Papan
                </button>
                <button
                  type="button"
                  onClick={() => setJadwalViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    jadwalViewMode === 'table'
                      ? 'bg-white dark:bg-slate-900 text-brand dark:text-blue-300 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <List size={13} />
                  Daftar
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('settings')}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Atur durasi jam pelajaran, waktu istirahat, dan jumlah jam per hari di Pengaturan"
                >
                  <SlidersHorizontal size={14} className="text-brand dark:text-blue-400" />
                  Pengaturan Jam
                </button>
              )}
              <button
                type="button"
                onClick={() => openNewJadwalModal({ isBreak: true })}
                className="px-3.5 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Coffee size={14} />
                + Jam Istirahat
              </button>
              <button
                type="button"
                onClick={() => openNewJadwalModal()}
                className="px-4 py-2.5 rounded-xl bg-brand hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus size={15} />
                Tambah Jadwal
              </button>
            </div>
          </div>

          {jadwalViewMode === 'board' ? (
            /* WEEKLY VISUAL BOARD */
            <div className="rounded-3xl bg-slate-100/90 dark:bg-[#0b101d] border border-slate-200/90 dark:border-slate-800/80 p-3.5 md:p-5 shadow-inner overflow-x-auto">
              <div
                className={`grid gap-4 min-w-[280px] ${
                  boardDays.length === 1
                    ? 'grid-cols-1 max-w-md'
                    : boardDays.length === 6
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'
                }`}
              >
                {boardDays.map((hari) => {
                  const dayItems = filteredJadwal.filter((j) => j.hari === hari);
                  const lessons = dayItems.filter(
                    (j) => !(j.isBreak || j.mataPelajaran?.toUpperCase().includes('ISTIRAHAT'))
                  );
                  const manualBreaks = dayItems
                    .filter((j) => Boolean(j.isBreak || j.mataPelajaran?.toUpperCase().includes('ISTIRAHAT')))
                    .sort((a, b) => (a.waktuMulai || '').localeCompare(b.waktuMulai || ''));

                  const dayCfg = effectiveJadwalSettings.days[hari] || effectiveJadwalSettings.days.Senin;
                  const maxLessonSlot = lessons.reduce(
                    (max, item) => Math.max(max, parseSlotRange(item.jamKe).to),
                    0
                  );
                  const totalSlotsForDay = Math.max(dayCfg.totalSlots, maxLessonSlot);
                  const computedSchedule = computeDayScheduleSlots(
                    dayCfg,
                    effectiveJadwalSettings.lessonDurationMinutes,
                    effectiveJadwalSettings.breakDurationMinutes,
                    totalSlotsForDay
                  );
                  const slotNumbers = Array.from({ length: totalSlotsForDay }, (_, idx) => idx + 1);

                  type TimelineEntry =
                    | { kind: 'slot'; slotNum: number; items: JadwalPelajaranItem[]; sortTime: string }
                    | { kind: 'auto_break'; breakIndex: 1 | 2; label: string; mulai: string; selesai: string; afterSlot: number }
                    | { kind: 'manual_break'; item: JadwalPelajaranItem; sortTime: string };

                  const timeline: TimelineEntry[] = [];
                  const usedManualBreaks = new Set<string>();

                  slotNumbers.forEach((slotNum) => {
                    const slotItems = lessons
                      .filter((l) => {
                        const r = parseSlotRange(l.jamKe);
                        return slotNum >= r.from && slotNum <= r.to;
                      })
                      .sort((a, b) => (a.waktuMulai || '').localeCompare(b.waktuMulai || ''));
                    const computedSlot = computedSchedule.slots[slotNum];
                    const slotTime = computedSlot?.mulai || slotItems[0]?.waktuMulai || dayCfg.startTime;

                    // Manual breaks that occur before this slot
                    manualBreaks.forEach((brk) => {
                      if (usedManualBreaks.has(brk.id)) return;
                      if ((brk.waktuMulai || '') <= slotTime) {
                        usedManualBreaks.add(brk.id);
                        timeline.push({ kind: 'manual_break', item: brk, sortTime: brk.waktuMulai || '' });
                      }
                    });

                    timeline.push({
                      kind: 'slot',
                      slotNum,
                      items: slotItems,
                      sortTime: slotTime,
                    });

                    // Auto breaks configured in Pengaturan right after this slot (skip if a manual break already exists at same start time)
                    computedSchedule.breaks
                      .filter((b) => b.afterSlot === slotNum)
                      .forEach((b) => {
                        const hasManualSameTime = manualBreaks.some((mb) => mb.waktuMulai === b.mulai);
                        if (!hasManualSameTime) {
                          timeline.push({
                            kind: 'auto_break',
                            breakIndex: b.breakIndex,
                            label: b.label,
                            mulai: b.mulai,
                            selesai: b.selesai,
                            afterSlot: b.afterSlot,
                          });
                        }
                      });
                  });

                  manualBreaks.forEach((brk) => {
                    if (!usedManualBreaks.has(brk.id)) {
                      usedManualBreaks.add(brk.id);
                      timeline.push({ kind: 'manual_break', item: brk, sortTime: brk.waktuMulai || '' });
                    }
                  });

                  return (
                    <div key={hari} className="flex flex-col gap-3 min-w-0">
                      {/* Day Header Pill */}
                      <div className="rounded-xl bg-slate-200/90 dark:bg-[#141c2f] border border-slate-300/70 dark:border-slate-700/50 py-2.5 px-3 text-center shadow-sm">
                        <span className="text-[11px] md:text-xs font-black tracking-[0.22em] text-slate-700 dark:text-slate-200 uppercase">
                          {hari}
                        </span>
                      </div>

                      {/* Timeline Cards */}
                      <div className="flex flex-col gap-3">
                        {timeline.map((entry) => {
                          if (entry.kind === 'auto_break') {
                            return (
                              <div
                                key={`${hari}__autobreak_${entry.breakIndex}_${entry.afterSlot}`}
                                onClick={() => onNavigateTab?.('settings')}
                                className="rounded-2xl border border-emerald-400/60 dark:border-emerald-500/35 bg-emerald-50/90 dark:bg-[#071e1b]/85 px-3.5 py-3 flex items-center justify-between gap-2.5 cursor-pointer group hover:border-emerald-500 dark:hover:border-emerald-400/60 transition-all shadow-sm"
                                title="Diatur dari Pengaturan Jam Jadwal Pelajaran — klik untuk ubah di Pengaturan"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <Coffee
                                    size={18}
                                    className="text-emerald-600 dark:text-emerald-400 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <div className="text-xs font-black tracking-wide text-emerald-700 dark:text-emerald-300 uppercase truncate">
                                      ☕ {entry.label}
                                    </div>
                                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                                      <Clock size={11} className="shrink-0" />
                                      <span>
                                        {entry.mulai} - {entry.selesai}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-200/70 dark:bg-emerald-900/50 text-[9px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase shrink-0">
                                  Auto
                                </span>
                              </div>
                            );
                          }

                          if (entry.kind === 'manual_break') {
                            const brk = entry.item;
                            return (
                              <div
                                key={brk.id}
                                onClick={() => openEditJadwalModal(brk)}
                                className="rounded-2xl border border-emerald-400/60 dark:border-emerald-500/35 bg-emerald-50/90 dark:bg-[#071e1b]/85 px-3.5 py-3 flex items-center justify-between gap-2.5 cursor-pointer group hover:border-emerald-500 dark:hover:border-emerald-400/60 transition-all shadow-sm"
                                title="Klik untuk edit Jam Istirahat"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <Coffee
                                    size={18}
                                    className="text-emerald-600 dark:text-emerald-400 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <div className="text-xs font-black tracking-wide text-emerald-700 dark:text-emerald-300 uppercase truncate">
                                      ☕ {brk.mataPelajaran || 'JAM ISTIRAHAT'}
                                    </div>
                                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                                      <Clock size={11} className="shrink-0" />
                                      <span>
                                        {brk.waktuMulai} - {brk.waktuSelesai}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteJadwal(brk.id);
                                  }}
                                  className="w-7 h-7 rounded-full bg-emerald-200/70 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                                  title="Hapus Jam Istirahat"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            );
                          }

                          const { slotNum, items } = entry;
                          const slotKey = `${hari}__${slotNum}`;
                          const isDragTarget = dragOverSlotKey === slotKey;
                          const defTimes = computedSchedule.slots[slotNum] || getDefaultSlotTimes(hari, slotNum);

                          if (items.length === 0) {
                            return (
                              <button
                                key={slotKey}
                                type="button"
                                onClick={() =>
                                  openNewJadwalModal({
                                    hari,
                                    jamKe: String(slotNum),
                                    waktuMulai: defTimes.mulai,
                                    waktuSelesai: defTimes.selesai,
                                  })
                                }
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  setDragOverSlotKey(slotKey);
                                }}
                                onDragLeave={() => {
                                  if (dragOverSlotKey === slotKey) setDragOverSlotKey(null);
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  handleDropJadwalOnSlot(hari, slotNum);
                                }}
                                className={`rounded-2xl border border-dashed py-7 px-4 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group ${
                                  isDragTarget
                                    ? 'border-brand bg-blue-50/80 dark:border-blue-400 dark:bg-blue-950/40 scale-[1.01]'
                                    : 'border-slate-300 dark:border-slate-700/60 bg-white/60 dark:bg-[#0f1628]/70 hover:border-brand/70 dark:hover:border-blue-500/60 hover:bg-blue-50/40 dark:hover:bg-[#131d35]'
                                }`}
                                title={`Klik untuk menambah jadwal ${hari} Jam ${slotNum} (${defTimes.mulai} - ${defTimes.selesai})`}
                              >
                                <span className="text-[11px] font-extrabold tracking-widest text-slate-400 dark:text-slate-500 uppercase group-hover:text-brand dark:group-hover:text-blue-400">
                                  JAM {slotNum}
                                </span>
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-600 tabular-nums">
                                  <Clock size={11} />
                                  {defTimes.mulai}
                                </span>
                              </button>
                            );
                          }

                          return (
                            <div key={slotKey} className="flex flex-col gap-2.5">
                              {items.map((item) => {
                                const range = parseSlotRange(item.jamKe);
                                const isMultiSlot = range.to > range.from;
                                const cardMulai = isMultiSlot
                                  ? defTimes.mulai
                                  : item.waktuMulai || defTimes.mulai;
                                const cardSelesai = isMultiSlot
                                  ? defTimes.selesai
                                  : item.waktuSelesai || defTimes.selesai;

                                return (
                                  <div
                                    key={`${item.id}__slot_${slotNum}`}
                                    draggable
                                    onDragStart={() => setDraggedJadwalId(item.id)}
                                    onDragEnd={() => {
                                      setDraggedJadwalId(null);
                                      setDragOverSlotKey(null);
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      setDragOverSlotKey(slotKey);
                                    }}
                                    onDragLeave={() => {
                                      if (dragOverSlotKey === slotKey) setDragOverSlotKey(null);
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      handleDropJadwalOnSlot(hari, slotNum, item);
                                    }}
                                    onClick={() => openEditJadwalModal(item)}
                                    className={`rounded-2xl p-4 text-white relative group cursor-grab active:cursor-grabbing transition-all duration-200 hover:-translate-y-0.5 ${getClassCardTheme(
                                      item.kelas
                                    )} ${
                                      isDragTarget && draggedJadwalId !== item.id
                                        ? 'ring-2 ring-white scale-[1.01]'
                                        : ''
                                    } ${draggedJadwalId === item.id ? 'opacity-60' : ''}`}
                                    title="Seret untuk pindah/tukar slot atau klik untuk edit"
                                  >
                                    {/* Top Row: Grip + JAM badge + Quick Actions */}
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                      <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                                        <GripVertical
                                          size={14}
                                          className="text-white/65 shrink-0"
                                        />
                                        <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-black tracking-wider uppercase text-white">
                                          JAM {slotNum}
                                        </span>
                                        {isMultiSlot && (
                                          <span className="px-2 py-0.5 rounded-full bg-white/15 text-[9px] font-extrabold tracking-wide uppercase text-white/90">
                                            Sesi {item.jamKe}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1 opacity-85 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openEditJadwalModal(item);
                                          }}
                                          className="w-6 h-6 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
                                          title="Edit"
                                        >
                                          <Edit2 size={11} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteJadwal(item.id);
                                          }}
                                          className="w-6 h-6 rounded-full bg-white/15 hover:bg-rose-950/70 flex items-center justify-center transition-colors cursor-pointer"
                                          title="Hapus"
                                        >
                                          <Trash2 size={11} />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Time Row */}
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-white/90 tabular-nums mb-2">
                                      <Clock size={12} className="text-white/80 shrink-0" />
                                      <span>
                                        {cardMulai} - {cardSelesai}
                                      </span>
                                    </div>

                                    {/* Class Title Row */}
                                    <div className="flex items-center gap-1.5 text-base md:text-[17px] font-black tracking-tight uppercase leading-tight text-white">
                                      <MapPin size={15} className="text-white/90 shrink-0" />
                                      <span className="truncate">KELAS {item.kelas}</span>
                                    </div>

                                    {/* Subject Row & Catat Agenda */}
                                    <div className="flex items-center justify-between gap-2 mt-1">
                                      <div className="text-[11px] font-extrabold tracking-wider uppercase text-white/95 truncate">
                                        {item.mataPelajaran}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openNewAgendaModal(item);
                                        }}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/20 hover:bg-white/35 text-[10px] font-black text-white shrink-0 transition-colors cursor-pointer"
                                        title="Catat Agenda Harian dari jadwal ini"
                                      >
                                        <BookOpenCheck size={11} />
                                        Catat Agenda
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}

                        {/* Quick add extra slot beyond configured totalSlots */}
                        <button
                          type="button"
                          onClick={() =>
                            openNewJadwalModal({
                              hari,
                              jamKe: String(totalSlotsForDay + 1),
                              waktuMulai: getDefaultSlotTimes(hari, totalSlotsForDay + 1).mulai,
                              waktuSelesai: getDefaultSlotTimes(hari, totalSlotsForDay + 1).selesai,
                            })
                          }
                          className="rounded-xl border border-dashed border-slate-300/70 dark:border-slate-800 py-2 px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 hover:text-brand dark:hover:text-blue-400 hover:border-brand/50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus size={12} />
                          Slot Jam {totalSlotsForDay + 1}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* TABLE LIST VIEW */
            <div className="admin-glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[640px]">
                  <thead>
                    <tr className="bg-white/30 dark:bg-white/5 border-b border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 text-[10px] uppercase font-extrabold tracking-widest">
                      <th className="p-4">Hari</th>
                      <th className="p-4">Jam / Waktu</th>
                      <th className="p-4">Kelas</th>
                      <th className="p-4">Mata Pelajaran</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredJadwal.length > 0 ? (
                      filteredJadwal.map((j) => {
                        const isBreak = Boolean(
                          j.isBreak || j.mataPelajaran?.toUpperCase().includes('ISTIRAHAT')
                        );
                        return (
                          <tr
                            key={j.id}
                            className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-lg bg-brand/10 dark:bg-blue-950/60 text-brand dark:text-blue-300 text-xs font-extrabold">
                                {j.hari}
                              </span>
                            </td>
                            <td className="p-4 text-xs font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                              <div>{isBreak ? 'Istirahat' : `Jam ke-${j.jamKe}`}</div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                {j.waktuMulai} – {j.waktuSelesai}
                              </div>
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-lg border text-xs font-extrabold ${
                                  isBreak
                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {j.kelas}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                                {isBreak ? `☕ ${j.mataPelajaran}` : j.mataPelajaran}
                              </div>
                            </td>
                            <td className="p-4 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => openEditJadwalModal(j)}
                                className="p-2 rounded-lg text-slate-500 hover:text-brand hover:bg-brand/10 transition-colors mr-1"
                                title="Edit Jadwal"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteJadwal(j.id)}
                                className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                                title="Hapus Jadwal"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-12 text-center text-slate-400 dark:text-slate-500 text-sm font-semibold"
                        >
                          Belum ada jadwal pelajaran untuk TA {activeTahunPelajaran} Semester{' '}
                          {activeSemester}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: TUJUAN PEMBELAJARAN (Tahun Pelajaran scoped ONLY)              */}
      {/* ===================================================================== */}
      {subTab === 'tp' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-800/70 bg-indigo-50/80 dark:bg-indigo-950/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Target size={18} />
              </div>
              <div>
                <h4 className="text-xs md:text-sm font-extrabold text-indigo-950 dark:text-indigo-200">
                  Tujuan Pembelajaran Berlaku 1 Tahun Pelajaran ({activeTahunPelajaran})
                </h4>
                <p className="text-xs text-indigo-800 dark:text-indigo-300 mt-0.5">
                  Data Tujuan Pembelajaran tetap terjaga saat Anda berpindah antara Semester Ganjil dan Genap di tahun yang sama, dan baru kosong ketika Tahun Pelajaran diganti.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSeedStarterTp}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Sparkles size={14} />
              Isi Template TP Informatika
            </button>
          </div>

          <div className="admin-glass-card rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={tpSearch}
                  onChange={(e) => setTpSearch(e.target.value)}
                  placeholder="Cari kode TP, elemen, deskripsi..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100"
                />
              </div>
              <select
                value={tpKelasFilter}
                onChange={(e) => setTpKelasFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
              >
                <option value="all">Semua Jenjang/Kelas</option>
                <option value="VII">Kelas VII</option>
                <option value="VIII">Kelas VIII</option>
                <option value="IX">Kelas IX</option>
                <option value="Semua">Semua Tingkat</option>
                {classOptions.map((c) => (
                  <option key={c} value={c}>
                    Kelas {c}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={openNewTpModal}
              className="px-4 py-2.5 rounded-xl bg-brand hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer w-fit"
            >
              <Plus size={15} />
              Tambah Tujuan Pembelajaran
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTp.length > 0 ? (
              filteredTp.map((tp) => {
                const linkedCourse = COURSES.find((c) => c.id === tp.materiId);
                return (
                  <div
                    key={tp.id}
                    className="admin-glass-card rounded-2xl p-5 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-lg bg-brand text-white text-xs font-black font-mono">
                            {tp.kodeTp}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                            Kelas {tp.kelas}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-bold">
                            KKM {tp.kkm ?? 75}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditTpModal(tp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand hover:bg-brand/10"
                            title="Edit TP"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTp(tp.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                            title="Hapus TP"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {tp.elemen}
                      </p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                        {tp.deskripsi}
                      </p>
                      {tp.indikator && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700/70">
                          <span className="font-bold">Indikator:</span> {tp.indikator}
                        </p>
                      )}
                    </div>
                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-700 dark:text-slate-200 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={Boolean(tp.isSumatif)}
                            onChange={() => handleToggleTpFlag(tp, 'isSumatif')}
                            className="w-4 h-4 rounded accent-brand cursor-pointer"
                          />
                          <span className={tp.isSumatif ? 'text-brand dark:text-blue-400' : ''}>
                            Sumatif
                          </span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-700 dark:text-slate-200 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={Boolean(tp.isPraktikum)}
                            onChange={() => handleToggleTpFlag(tp, 'isPraktikum')}
                            className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                          />
                          <span className={tp.isPraktikum ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                            Praktikum
                          </span>
                        </label>
                      </div>
                      {linkedCourse && (
                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <GraduationCap size={13} className="text-brand dark:text-blue-400" />
                          <span>{linkedCourse.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="md:col-span-2 admin-glass-card rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500 text-sm font-semibold">
                Belum ada Tujuan Pembelajaran untuk Tahun Pelajaran {activeTahunPelajaran}. Klik "Tambah Tujuan Pembelajaran" atau "Isi Template TP Informatika".
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: AGENDA HARIAN (Per Kartu Sesuai Jadwal Hari Ini & Rekap Agenda)*/}
      {/* ===================================================================== */}
      {subTab === 'agenda' && (
        <div className="space-y-6">
          {/* Sub-Tab Switcher: Agenda Harian vs Rekap Agenda */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/10 dark:bg-slate-800/60 border border-white/20 dark:border-white/10 w-fit">
              <button
                type="button"
                onClick={() => setAgendaSubView('harian')}
                className={`px-4 py-2 rounded-xl text-xs font-black tracking-wide uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  agendaSubView === 'harian'
                    ? 'bg-gradient-to-r from-brand to-blue-600 text-white shadow-md shadow-brand/25'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpenCheck size={14} />
                <span>CATAT AGENDA HARIAN</span>
              </button>
              <button
                type="button"
                onClick={() => setAgendaSubView('rekap')}
                className={`px-4 py-2 rounded-xl text-xs font-black tracking-wide uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  agendaSubView === 'rekap'
                    ? 'bg-gradient-to-r from-brand to-blue-600 text-white shadow-md shadow-brand/25'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileSpreadsheet size={14} />
                <span>REKAP AGENDA</span>
                <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold tabular-nums">
                  {agendaList.length}
                </span>
              </button>
            </div>
          </div>

          {agendaSubView === 'harian' ? (
            <div className="space-y-6">
          {/* Top Blue Summary Banner */}
          <div className="rounded-2xl md:rounded-3xl bg-gradient-to-r from-[#2563eb] via-[#2b5cf6] to-[#3b82f6] p-3.5 md:p-5 shadow-xl shadow-blue-950/25 border border-white/20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              <div className="rounded-xl bg-white/15 backdrop-blur-xs border border-white/20 px-4 py-3 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0">
                  <Clock size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-100">
                    JADWAL MENGAJAR
                  </p>
                  <p className="text-base md:text-lg font-black text-white tabular-nums">
                    {todayScheduleSummary.total} Sesi Kelas
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-white/15 backdrop-blur-xs border border-white/20 px-4 py-3 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-100">
                    SUDAH TERCATAT
                  </p>
                  <p className="text-base md:text-lg font-black text-white tabular-nums">
                    {todayScheduleSummary.recorded} Agenda
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-white/15 backdrop-blur-xs border border-white/20 px-4 py-3 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0">
                  <AlertCircle size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-100">
                    BELUM TERISI
                  </p>
                  <p className="text-base md:text-lg font-black text-white tabular-nums">
                    {todayScheduleSummary.unfilled} Sesi
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section Header: JADWAL MENGAJAR ANDA (HARI) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                <Clock size={17} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  JADWAL MENGAJAR ANDA ({agendaSelectedHari.toUpperCase()})
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Pilih sesi kelas di bawah untuk langsung mencatat jurnal KBM
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                <Calendar size={14} className="text-brand dark:text-blue-400 shrink-0" />
                <input
                  type="date"
                  value={agendaSelectedDate}
                  onChange={(e) => {
                    if (e.target.value) setAgendaSelectedDate(e.target.value);
                  }}
                  aria-label="Pilih tanggal jadwal"
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none tabular-nums"
                />
                {agendaSelectedDate !== getTodayIsoDate() && (
                  <button
                    type="button"
                    onClick={() => setAgendaSelectedDate(getTodayIsoDate())}
                    className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-brand dark:text-blue-300 text-[10px] font-extrabold hover:bg-blue-100 cursor-pointer"
                  >
                    Hari Ini
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => openNewAgendaModal(undefined, agendaSelectedDate, undefined, true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-extrabold uppercase tracking-wide flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer active:scale-95"
              >
                <Plus size={15} />
                AGENDA TAMBAHAN (JAM 0)
              </button>
            </div>
          </div>

          {/* Grid of Today's Schedule Cards */}
          {todaySchedules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todaySchedules.map((sched) => {
                const recordedAgenda = findRecordedAgendaForSchedule(sched, agendaSelectedDate);
                const cardTheme = getClassCardTheme(sched.kelas);
                const timeRange =
                  sched.waktuMulai && sched.waktuSelesai
                    ? `${sched.waktuMulai}–${sched.waktuSelesai}`
                    : `${sched.waktuMulai || ''}`;

                return (
                  <div
                    key={sched.id}
                    onClick={() =>
                      recordedAgenda
                        ? openEditAgendaModal(recordedAgenda)
                        : openNewAgendaModal(sched, agendaSelectedDate)
                    }
                    className={`${cardTheme} rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden flex flex-col justify-between gap-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl`}
                  >
                    {/* Top Row: Jam pill, Waktu pill, Status badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[10px] font-black uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                          JAM {sched.jamKe}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-xs text-[10px] font-bold font-mono tabular-nums">
                          <Clock size={10} className="shrink-0" />
                          {timeRange}
                        </span>
                      </div>

                      {recordedAgenda ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-400/30 border border-emerald-200/40 text-[10px] font-black uppercase tracking-wider shrink-0">
                          <Check size={10} />
                          TERCATAT
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider shrink-0">
                          BELUM
                        </span>
                      )}
                    </div>

                    {/* Middle Row: Class & Subject Badge */}
                    <div className="flex items-center justify-between gap-3 py-0.5">
                      <h4 className="text-2xl font-black uppercase tracking-tight leading-none truncate">
                        KELAS {sched.kelas}
                      </h4>
                      <span className="px-3 py-1 rounded-full bg-white/15 border border-white/25 text-[10px] font-black uppercase tracking-wider shrink-0">
                        {sched.mataPelajaran || 'INFORMATIKA'}
                      </span>
                    </div>

                    {/* Bottom Divider + Status Text + Action Pill */}
                    <div className="border-t border-white/15 pt-3 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {recordedAgenda ? (
                          <p
                            className="text-[11px] font-bold text-white/95 truncate"
                            title={recordedAgenda.materi}
                          >
                            {recordedAgenda.materi}
                          </p>
                        ) : (
                          <p className="text-[11px] font-medium italic text-white/80">
                            Siap diisi
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {recordedAgenda && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAbsensiClass(recordedAgenda.kelas);
                              setSelectedAgendaId(recordedAgenda.id);
                              setSubTab('absensi');
                              setAbsensiMode('input');
                            }}
                            className="px-2.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-[10px] font-black uppercase tracking-wide flex items-center gap-1 transition-colors cursor-pointer"
                            title="Isi atau ubah absensi kelas untuk agenda ini"
                          >
                            <ClipboardCheck size={11} />
                            ABSENSI
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (recordedAgenda) {
                              openEditAgendaModal(recordedAgenda);
                            } else {
                              openNewAgendaModal(sched, agendaSelectedDate);
                            }
                          }}
                          className="bg-white text-slate-900 hover:bg-white/90 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wide inline-flex items-center gap-1 shadow-sm cursor-pointer transition-transform active:scale-95"
                        >
                          {recordedAgenda ? 'EDIT' : 'CATAT'}
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="admin-glass-card rounded-2xl p-8 md:p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-brand dark:text-blue-400 mx-auto">
                <CalendarClock size={22} />
              </div>
              <div>
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  Tidak ada jadwal mengajar rutin pada hari {agendaSelectedHari} ({agendaSelectedDate})
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Pilih tanggal hari efektif belajar lain, catat Agenda Tambahan (Jam 0), atau atur jadwal di tab Jadwal Pelajaran.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => openNewAgendaModal(undefined, agendaSelectedDate, undefined, true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  Agenda Tambahan (Jam 0)
                </button>
                <button
                  type="button"
                  onClick={() => setSubTab('jadwal')}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar size={14} />
                  Buka Jadwal Pelajaran
                </button>
              </div>
            </div>
          )}

          {/* Recorded Agendas Section */}
          <div className="border-t border-slate-200/80 dark:border-white/10 pt-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800/60 flex items-center justify-center text-brand dark:text-blue-400">
                  <BookOpenCheck size={16} />
                </div>
                <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  DAFTAR AGENDA TERINPUT ({filteredAgenda.length})
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px] sm:w-64">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={agendaSearch}
                    onChange={(e) => setAgendaSearch(e.target.value)}
                    placeholder="Cari materi, kegiatan, kode TP..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>
                <select
                  value={agendaClassFilter}
                  onChange={(e) => setAgendaClassFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                >
                  <option value="all">Semua Kelas</option>
                  {classOptions.map((c) => (
                    <option key={c} value={c}>
                      Kelas {c}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => openNewAgendaModal(undefined, agendaSelectedDate)}
                  className="px-3.5 py-2 rounded-xl bg-brand hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus size={14} />
                  Catat Manual
                </button>
              </div>
            </div>

            <div className="admin-glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[820px]">
                  <thead>
                    <tr className="bg-white/30 dark:bg-white/5 border-b border-white/40 dark:border-white/10 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-extrabold tracking-widest">
                      <th className="p-4">Urutan Jam</th>
                      <th className="p-4">Rombel / Mapel</th>
                      <th className="p-4">Topik &amp; Kegiatan</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredAgenda.length > 0 ? (
                      filteredAgenda.map((ag) => (
                        <tr key={ag.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors align-top">
                          <td className="p-4 text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-brand dark:text-blue-300 text-[11px] font-black">
                              <Clock size={11} />
                              {ag.jamKe ? `Jam ${ag.jamKe}` : 'Jam -'}
                              {ag.waktuMulai ? ` (${ag.waktuMulai}${ag.waktuSelesai ? `–${ag.waktuSelesai}` : ''})` : ''}
                            </div>
                            <div className="mt-1.5 text-slate-700 dark:text-slate-300 font-bold">
                              {ag.hari || getHariFromDate(ag.tanggal)}, {ag.tanggal}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                              Pertemuan ke-{ag.pertemuanKe}
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-800 dark:text-slate-100">
                              {ag.kelas ? `KELAS ${ag.kelas}` : 'TANPA KELAS (UMUM)'}
                            </span>
                            <div className="mt-1.5 flex flex-wrap items-center gap-1">
                              {ag.jenisKegiatan && (
                                <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-brand dark:text-blue-300 text-[10px] font-extrabold uppercase">
                                  {ag.jenisKegiatan}
                                </span>
                              )}
                              {ag.mataPelajaran && (
                                <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-300">
                                  {ag.mataPelajaran}
                                </span>
                              )}
                              {ag.tpKode && (
                                <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-black font-mono">
                                  {ag.tpKode}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 max-w-md">
                            <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                              {ag.materi}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                              {ag.kegiatan || '-'}
                            </p>
                            {ag.catatan && (
                              <p className="text-[11px] text-amber-700 dark:text-amber-300 italic mt-1">
                                Catatan: {ag.catatan}
                              </p>
                            )}
                          </td>
                          <td className="p-4 text-center whitespace-nowrap">
                            {ag.kelas ? (
                              <>
                                <div className="inline-flex items-center gap-1 text-[11px] font-extrabold tabular-nums">
                                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                    H:{ag.hadirCount}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                                    S:{ag.sakitCount}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                                    I:{ag.izinCount}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                                    A:{ag.alpaCount}
                                  </span>
                                </div>
                                <div className="mt-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAbsensiClass(ag.kelas);
                                      setSelectedAgendaId(ag.id);
                                      setSubTab('absensi');
                                      setAbsensiMode('input');
                                    }}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wide transition-all cursor-pointer ${
                                      isAgendaAttended(ag.id, ag.kelas, ag.tanggal)
                                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                                    }`}
                                    title="Buka absensi untuk pertemuan agenda ini"
                                  >
                                    <ClipboardCheck size={11} />
                                    {isAgendaAttended(ag.id, ag.kelas, ag.tanggal) ? 'Ubah Absensi' : 'Isi Absensi'}
                                  </button>
                                </div>
                              </>
                            ) : (
                              <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                Agenda Non-Kelas
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => openEditAgendaModal(ag)}
                              className="p-2 rounded-lg text-slate-500 hover:text-brand hover:bg-brand/10 mr-1 cursor-pointer"
                              title="Edit Agenda"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAgenda(ag.id)}
                              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                              title="Hapus Agenda"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-10 text-center text-slate-400 dark:text-slate-500 text-sm font-semibold">
                          Belum ada agenda harian terinput pada TA {activeTahunPelajaran} Semester {activeSemester}. Pilih kartu jadwal di atas untuk mulai mencatat.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
            </div>
          ) : (
            /* =============================================================== */
            /* HALAMAN REKAP AGENDA                                            */
            /* =============================================================== */
            <div className="space-y-6">
              {/* Top Summary Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="admin-glass-card rounded-2xl p-4 border-l-4 border-l-brand">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Total Agenda Tercatat
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
                    {rekapAgendaStats.total}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    Semester {activeSemester} · {activeTahunPelajaran}
                  </p>
                </div>

                <div className="admin-glass-card rounded-2xl p-4 border-l-4 border-l-emerald-500">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Agenda Kelas vs Umum
                  </p>
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 tabular-nums">
                    {rekapAgendaStats.kbmCount} <span className="text-xs font-bold text-slate-400">/ {rekapAgendaStats.extraCount} Umum</span>
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    Pembelajaran per rombel &amp; non-kelas
                  </p>
                </div>

                <div className="admin-glass-card rounded-2xl p-4 border-l-4 border-l-indigo-500">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Hari Efektif Tercatat
                  </p>
                  <p className="text-2xl font-black text-indigo-700 dark:text-indigo-400 mt-1 tabular-nums">
                    {rekapAgendaStats.activeDays} Hari
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    Hari aktif pengisian jurnal
                  </p>
                </div>

                <div className="admin-glass-card rounded-2xl p-4 border-l-4 border-l-amber-500">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Cakupan Tujuan Pembelajaran
                  </p>
                  <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1 tabular-nums">
                    {rekapAgendaStats.tpCount} TP
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    Kode TP unik terealisasi
                  </p>
                </div>
              </div>

              {/* Activity Type Distribution Chips */}
              {rekapAgendaStats.byJenis.length > 0 && (
                <div className="admin-glass-card rounded-2xl p-4 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mr-1">
                    Distribusi Jenis Kegiatan:
                  </span>
                  {rekapAgendaStats.byJenis.map(([jenis, count]) => (
                    <button
                      key={jenis}
                      type="button"
                      onClick={() => setRekapAgendaJenis(rekapAgendaJenis === jenis ? 'all' : jenis)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer tabular-nums ${
                        rekapAgendaJenis === jenis
                          ? 'bg-brand text-white border-brand shadow-xs'
                          : 'bg-white/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-brand/50'
                      }`}
                    >
                      {jenis}: {count}
                    </button>
                  ))}
                </div>
              )}

              {/* Filter Toolbar & Export CSV */}
              <div className="admin-glass-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <div className="relative min-w-[200px] sm:w-64">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={rekapAgendaSearch}
                      onChange={(e) => setRekapAgendaSearch(e.target.value)}
                      placeholder="Cari materi, kegiatan, TP, catatan..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <select
                    value={rekapAgendaMonth}
                    onChange={(e) => setRekapAgendaMonth(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                  >
                    <option value="all">Semua Bulan</option>
                    {rekapAgendaMonths.map((ym) => {
                      const [y, m] = ym.split('-');
                      const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('id-ID', {
                        month: 'long',
                        year: 'numeric',
                      });
                      return (
                        <option key={ym} value={ym}>
                          {label}
                        </option>
                      );
                    })}
                  </select>

                  <select
                    value={rekapAgendaClass}
                    onChange={(e) => setRekapAgendaClass(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                  >
                    <option value="all">Semua Kelas Tercatat</option>
                    {agendaList.some((a) => !a.kelas?.trim()) && (
                      <option value="non_kelas">Tanpa Kelas (Umum)</option>
                    )}
                    {Array.from(
                      new Set(agendaList.map((a) => a.kelas?.trim()).filter(Boolean) as string[])
                    )
                      .sort((a, b) => a.localeCompare(b))
                      .map((c) => (
                        <option key={c} value={c}>
                          Kelas {c}
                        </option>
                      ))}
                  </select>

                  <select
                    value={rekapAgendaJenis}
                    onChange={(e) => setRekapAgendaJenis(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                  >
                    <option value="all">Semua Jenis Kegiatan</option>
                    {JENIS_KEGIATAN_LIST.map((jk) => (
                      <option key={jk} value={jk}>
                        {jk}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const headers = [
                      'No',
                      'Tanggal',
                      'Hari',
                      'Jam Ke',
                      'Waktu',
                      'Kelas',
                      'Mata Pelajaran',
                      'Jenis Kegiatan',
                      'Pertemuan Ke',
                      'Kode TP',
                      'Materi Pokok',
                      'Ringkasan Kegiatan',
                      'Catatan',
                      'Hadir',
                      'Sakit',
                      'Izin',
                      'Alpa',
                    ];
                    const rows = rekapFilteredAgendas.map((ag, i) => [
                      i + 1,
                      ag.tanggal,
                      ag.hari || getHariFromDate(ag.tanggal),
                      ag.jamKe || '-',
                      ag.waktuMulai ? `${ag.waktuMulai}-${ag.waktuSelesai || ''}` : '-',
                      ag.kelas || 'Umum (Tanpa Kelas)',
                      ag.mataPelajaran || 'Informatika',
                      ag.jenisKegiatan || 'KBM',
                      ag.pertemuanKe || '1',
                      ag.tpKode || '-',
                      ag.materi,
                      ag.kegiatan || '-',
                      ag.catatan || '-',
                      ag.kelas ? ag.hadirCount ?? 0 : 0,
                      ag.kelas ? ag.sakitCount ?? 0 : 0,
                      ag.kelas ? ag.izinCount ?? 0 : 0,
                      ag.kelas ? ag.alpaCount ?? 0 : 0,
                    ]);
                    downloadCsv(
                      `Rekap_Agenda_Harian_${slugifyTermPart(activeTahunPelajaran)}_${activeSemester}.csv`,
                      headers,
                      rows
                    );
                  }}
                  disabled={rekapFilteredAgendas.length === 0}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download size={14} />
                  Export Rekap Agenda (CSV)
                </button>
              </div>

              {/* Full Chronological Rekap Table */}
              <div className="admin-glass-card rounded-2xl overflow-hidden">
                <div className="px-5 py-3.5 bg-white/30 dark:bg-white/5 border-b border-white/40 dark:border-white/10 flex items-center justify-between">
                  <h4 className="text-xs md:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Daftar Rekap Agenda Harian ({rekapFilteredAgendas.length} Catatan)
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[980px]">
                    <thead>
                      <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase font-extrabold tracking-widest text-slate-500 dark:text-slate-400">
                        <th className="p-3.5 w-12 text-center">No</th>
                        <th className="p-3.5">Tanggal &amp; Jam</th>
                        <th className="p-3.5">Kelas &amp; Kegiatan</th>
                        <th className="p-3.5">Tujuan Pembelajaran (TP)</th>
                        <th className="p-3.5">Materi &amp; Kegiatan</th>
                        <th className="p-3.5 text-center">Kehadiran</th>
                        <th className="p-3.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {rekapFilteredAgendas.length > 0 ? (
                        rekapFilteredAgendas.map((ag, idx) => {
                          const linkedTp = ag.tpId
                            ? tpList.find((t) => t.id === ag.tpId)
                            : ag.tpKode
                            ? tpList.find((t) => t.kodeTp === ag.tpKode)
                            : undefined;
                          return (
                            <tr key={ag.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 align-top transition-colors">
                              <td className="p-3.5 text-center text-xs font-bold text-slate-500 tabular-nums">
                                {idx + 1}
                              </td>
                              <td className="p-3.5 whitespace-nowrap">
                                <div className="text-xs font-extrabold text-slate-900 dark:text-white tabular-nums">
                                  {ag.hari || getHariFromDate(ag.tanggal)}, {ag.tanggal}
                                </div>
                                <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-brand dark:text-blue-300 text-[10px] font-black tabular-nums">
                                  <Clock size={10} />
                                  {ag.jamKe ? `Jam ${ag.jamKe}` : 'Jam -'}
                                  {ag.waktuMulai ? ` (${ag.waktuMulai}${ag.waktuSelesai ? `–${ag.waktuSelesai}` : ''})` : ''}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                  Pertemuan ke-{ag.pertemuanKe || '1'}
                                </div>
                              </td>
                              <td className="p-3.5 whitespace-nowrap">
                                <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-800 dark:text-slate-100">
                                  {ag.kelas ? `KELAS ${ag.kelas}` : 'UMUM (NON-KELAS)'}
                                </span>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase">
                                    {ag.jenisKegiatan || 'KBM'}
                                  </span>
                                  {ag.mataPelajaran && (
                                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase">
                                      {ag.mataPelajaran}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3.5 max-w-[220px]">
                                {ag.tpKode ? (
                                  <div className="space-y-1">
                                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-black">
                                      {ag.tpKode}
                                    </span>
                                    {linkedTp?.deskripsi && (
                                      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2" title={linkedTp.deskripsi}>
                                        {linkedTp.deskripsi}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 dark:text-slate-500">-</span>
                                )}
                              </td>
                              <td className="p-3.5 max-w-md">
                                <div className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
                                  {ag.materi}
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300">
                                  {ag.kegiatan || '-'}
                                </p>
                                {ag.catatan && (
                                  <p className="text-[11px] text-amber-700 dark:text-amber-300 italic mt-1">
                                    Catatan: {ag.catatan}
                                  </p>
                                )}
                              </td>
                              <td className="p-3.5 text-center whitespace-nowrap">
                                {ag.kelas ? (
                                  <div className="space-y-1">
                                    <div className="inline-flex items-center gap-1 text-[10px] font-extrabold tabular-nums">
                                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                        H:{ag.hadirCount}
                                      </span>
                                      <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                                        S:{ag.sakitCount}
                                      </span>
                                      <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                                        I:{ag.izinCount}
                                      </span>
                                      <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                                        A:{ag.alpaCount}
                                      </span>
                                    </div>
                                    <div className="text-[10px] font-bold">
                                      {isAgendaAttended(ag.id, ag.kelas, ag.tanggal) ? (
                                        <span className="text-emerald-600 dark:text-emerald-400">● Sudah Diabsen</span>
                                      ) : (
                                        <span className="text-amber-600 dark:text-amber-400">○ Belum Diabsen</span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400">-</span>
                                )}
                              </td>
                              <td className="p-3.5 text-right whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => openEditAgendaModal(ag)}
                                  className="p-2 rounded-lg text-slate-500 hover:text-brand hover:bg-brand/10 mr-1 cursor-pointer"
                                  title="Edit Agenda"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAgenda(ag.id)}
                                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                                  title="Hapus Agenda"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-10 text-center text-slate-400 text-xs font-semibold">
                            Tidak ada data agenda yang cocok dengan filter Rekap Agenda saat ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: ABSENSI SISWA (Sesuai Desain Lampiran image_5f708ce4.png)        */}
      {/* ===================================================================== */}
      {subTab === 'absensi' && (
          <div className="space-y-6">
            {/* Top Sub-Tab Navigation Bar */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/10 dark:bg-slate-800/60 border border-white/20 dark:border-white/10 w-fit">
              <button
                type="button"
                onClick={() => {
                  setAbsensiSubView('agenda_hari_ini');
                  setSelectedAgendaId('');
                  setSelectedRekapKelas('');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black tracking-wide uppercase transition-all cursor-pointer ${
                  absensiSubView === 'agenda_hari_ini'
                    ? 'bg-gradient-to-r from-brand to-blue-600 text-white shadow-md shadow-brand/25'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ABSENSI HARI INI
              </button>
              <button
                type="button"
                onClick={() => {
                  setAbsensiSubView('tanggungan');
                  setSelectedAgendaId('');
                  setSelectedRekapKelas('');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black tracking-wide uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  absensiSubView === 'tanggungan'
                    ? 'bg-gradient-to-r from-brand to-blue-600 text-white shadow-md shadow-brand/25'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>TANGGUNGAN ABSENSI</span>
                {tanggunganClassesList.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-extrabold tabular-nums">
                    {tanggunganClassesList.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAbsensiSubView('rekap');
                  setSelectedAgendaId('');
                  setSelectedRekapKelas('');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black tracking-wide uppercase transition-all cursor-pointer ${
                  absensiSubView === 'rekap'
                    ? 'bg-gradient-to-r from-brand to-blue-600 text-white shadow-md shadow-brand/25'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                REKAPITULASI ABSENSI
              </button>
            </div>

            {/* If an agenda is selected for input checklist, show checklist view with back button */}
            {selectedAgenda ? (() => {
              const activeStudents = studentsByClass[selectedAgenda.kelas] || [];
              const maleCount = activeStudents.filter((s) =>
                (s.jenisKelamin || '').toUpperCase().startsWith('L')
              ).length;
              const femaleCount = activeStudents.length - maleCount;
              const sameContextAgendas =
                absensiSubView === 'agenda_hari_ini'
                  ? absensiDateAgendas.filter((a) => a.kelas === selectedAgenda.kelas)
                  : absensiSubView === 'tanggungan'
                  ? tanggunganAgendas.filter((a) => a.kelas === selectedAgenda.kelas)
                  : classAgendas;

              return (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white/40 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-white/40 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setSelectedAgendaId('')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      ← Kembali ke Kartu Kelas
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={setAllPresent}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-extrabold hover:bg-emerald-100 cursor-pointer"
                      >
                        Semua Hadir
                      </button>
                      <button
                        type="button"
                        disabled={isSavingAbsensi}
                        onClick={handleSaveAbsensi}
                        className="px-4 py-1.5 rounded-xl bg-brand hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        <Save size={14} />
                        {isSavingAbsensi ? 'Menyimpan...' : 'Simpan Absensi'}
                      </button>
                    </div>
                  </div>

                  {/* Session switcher if this class has multiple recorded agendas in the current view */}
                  {sameContextAgendas.length > 1 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Sesi Agenda Kelas {selectedAgenda.kelas}:
                      </span>
                      {sameContextAgendas.map((ag) => {
                        const isAtt = isAgendaAttended(ag.id, ag.kelas, ag.tanggal);
                        const active = ag.id === selectedAgenda.id;
                        return (
                          <button
                            key={ag.id}
                            type="button"
                            onClick={() => {
                              setAbsensiClass(ag.kelas);
                              setSelectedAgendaId(ag.id);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                              active
                                ? 'bg-brand text-white border-brand shadow-sm'
                                : 'bg-white/60 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-brand/50'
                            }`}
                          >
                            <span>{ag.tanggal} · Jam {ag.jamKe || '1'}</span>
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isAtt ? 'bg-emerald-400' : 'bg-amber-400'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Agenda Context Card */}
                  <div className="admin-glass-card rounded-2xl p-4 md:p-5 border-l-4 border-l-brand space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-xl bg-brand text-white text-xs font-black uppercase">
                          KELAS {selectedAgenda.kelas} · PERTEMUAN KE-{selectedAgenda.pertemuanKe}
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          {selectedAgenda.hari || getHariFromDate(selectedAgenda.tanggal)}, {selectedAgenda.tanggal}
                        </span>
                        {selectedAgenda.jamKe && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-bold">
                            Jam {selectedAgenda.jamKe}
                          </span>
                        )}
                        {selectedAgenda.jenisKegiatan && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-black uppercase">
                            {selectedAgenda.jenisKegiatan}
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                          absensiDocExists
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {absensiDocExists ? '● Absensi Tersimpan' : '○ Belum Diabsen'}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <span className="block text-[10px] font-extrabold uppercase text-slate-400">Materi / Topik</span>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white">{selectedAgenda.materi}</p>
                      {selectedAgenda.kegiatan && <p className="text-xs text-slate-600 dark:text-slate-300">{selectedAgenda.kegiatan}</p>}
                    </div>
                  </div>

                  {/* Checklist Table with Distinct Male/Female Colors */}
                  <div className="admin-glass-card rounded-2xl overflow-hidden">
                    <div className="px-5 py-3 bg-white/30 dark:bg-white/5 border-b border-white/40 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span>Presensi Siswa Kelas {selectedAgenda.kelas} · {activeStudents.length} Siswa</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 text-[11px] font-black">
                          Laki-laki: {maleCount}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 text-[11px] font-black">
                          Perempuan: {femaleCount}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 tabular-nums">
                        <span className="text-emerald-700 dark:text-emerald-300">H:{absensiDraftCounts.H}</span>
                        <span className="text-amber-700 dark:text-amber-300">S:{absensiDraftCounts.S}</span>
                        <span className="text-blue-700 dark:text-blue-300">I:{absensiDraftCounts.I}</span>
                        <span className="text-rose-700 dark:text-rose-300">A:{absensiDraftCounts.A}</span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                          <tr className="bg-white/20 dark:bg-white/5 border-b border-white/30 dark:border-white/10 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-extrabold tracking-widest">
                            <th className="p-3 w-14 text-center">No</th>
                            <th className="p-3">Nama Siswa &amp; Jenis Kelamin</th>
                            <th className="p-3 text-center w-56">Status Kehadiran</th>
                            <th className="p-3">Catatan / Keterangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {activeStudents.length > 0 ? (
                            activeStudents.map((st, idx) => {
                              const entry = absensiDraft[st.id] || { status: 'H', catatan: '' };
                              const isMale = (st.jenisKelamin || '').toUpperCase().startsWith('L');
                              return (
                                <tr
                                  key={st.id}
                                  className={`transition-colors border-l-4 ${
                                    isMale
                                      ? 'border-l-blue-500 bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-100/50 dark:hover:bg-blue-950/35'
                                      : 'border-l-rose-500 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-100/50 dark:hover:bg-rose-950/35'
                                  }`}
                                >
                                  <td className="p-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                                    {idx + 1}
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span
                                        className={`text-xs font-extrabold ${
                                          isMale
                                            ? 'text-blue-900 dark:text-blue-200'
                                            : 'text-rose-800 dark:text-rose-200'
                                        }`}
                                      >
                                        {st.nama}
                                      </span>
                                      <span
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${
                                          isMale
                                            ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/70 dark:text-blue-300 dark:border-blue-700/60'
                                            : 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/70 dark:text-rose-300 dark:border-rose-700/60'
                                        }`}
                                      >
                                        {isMale ? 'L · Laki-laki' : 'P · Perempuan'}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                      NIS: {st.nis || '-'}
                                    </div>
                                  </td>
                                  <td className="p-3 text-center">
                                    <div className="inline-flex p-0.5 rounded-xl bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                      {(['H', 'S', 'I', 'A'] as AttendanceStatus[]).map((stKey) => (
                                        <button
                                          key={stKey}
                                          type="button"
                                          onClick={() => setStudentAttendance(st.id, stKey)}
                                          className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                            entry.status === stKey
                                              ? stKey === 'H' ? 'bg-emerald-600 text-white shadow-xs'
                                                : stKey === 'S' ? 'bg-amber-600 text-white shadow-xs'
                                                : stKey === 'I' ? 'bg-blue-600 text-white shadow-xs'
                                                : 'bg-rose-600 text-white shadow-xs'
                                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                          }`}
                                        >
                                          {stKey}
                                        </button>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <input
                                      type="text"
                                      value={entry.catatan || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setAbsensiDraft((prev) => ({
                                          ...prev,
                                          [st.id]: { ...prev[st.id], catatan: val },
                                        }));
                                      }}
                                      placeholder="Catatan khusus..."
                                      className="w-full px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                                    />
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-slate-400 text-xs font-semibold">
                                Tidak ada data siswa terdaftar di Kelas {selectedAgenda.kelas}. Silakan tambahkan siswa di menu Siswa &amp; Kelas.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })() : absensiSubView === 'agenda_hari_ini' ? (
              <div className="space-y-5">
                {/* Header: Absensi Hari Ini + Date Picker */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                      Absensi Hari Ini
                    </h3>
                    <p className="text-xs font-bold text-brand dark:text-blue-400 uppercase tracking-wide mt-0.5">
                      {agendaSelectedHari.toUpperCase()}, {new Date(agendaSelectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} · Hanya kelas yang sudah tercatat di agenda tanggal ini
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <Calendar size={14} className="text-brand dark:text-blue-400 shrink-0" />
                      <input
                        type="date"
                        value={agendaSelectedDate}
                        onChange={(e) => {
                          if (e.target.value) setAgendaSelectedDate(e.target.value);
                        }}
                        aria-label="Pilih tanggal absensi hari ini"
                        className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none tabular-nums"
                      />
                    </div>
                    {agendaSelectedDate !== getTodayIsoDate() && (
                      <button
                        type="button"
                        onClick={() => setAgendaSelectedDate(getTodayIsoDate())}
                        className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-brand dark:text-blue-300 text-xs font-extrabold hover:bg-blue-100 cursor-pointer"
                      >
                        Hari Ini
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid of Class Cards (1 card per class recorded in today's agenda) */}
                {absensiDateClasses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {absensiDateClasses.map((cls) => {
                      const classDayAgendas = absensiDateAgendas.filter((a) => a.kelas === cls);
                      const pendingAgenda = classDayAgendas.find(
                        (ag) => !isAgendaAttended(ag.id, ag.kelas, ag.tanggal)
                      );
                      const primaryAgenda = pendingAgenda || classDayAgendas[0];
                      const allDone = !pendingAgenda;
                      const cardTheme = getClassCardTheme(cls);
                      const studentCount = studentsByClass[cls]?.length || 0;

                      return (
                        <div
                          key={cls}
                          onClick={() => {
                            if (primaryAgenda) {
                              setAbsensiClass(cls);
                              setSelectedAgendaId(primaryAgenda.id);
                            }
                          }}
                          className={`${cardTheme} rounded-2xl p-5 text-white relative overflow-hidden flex flex-col justify-between gap-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-3.5 py-1.5 rounded-xl bg-white/20 backdrop-blur-xs text-xl font-black uppercase tracking-tight">
                              {cls}
                            </span>
                            {allDone ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-400/30 border border-emerald-200/40 text-[10px] font-black uppercase tracking-wider">
                                <Check size={11} /> SELESAI
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-400/30 border border-amber-200/40 text-[10px] font-black uppercase tracking-wider">
                                BELUM ABSEN
                              </span>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-black text-white/90">
                              <span className="px-2 py-0.5 rounded bg-white/20">
                                JAM {primaryAgenda?.jamKe || '1'}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-white/20 uppercase">
                                {primaryAgenda?.jenisKegiatan || 'KBM'}
                              </span>
                              {classDayAgendas.length > 1 && (
                                <span className="px-2 py-0.5 rounded bg-white/25">
                                  {classDayAgendas.length} SESI
                                </span>
                              )}
                            </div>
                            <h4 className="text-base font-extrabold text-white leading-snug line-clamp-2">
                              {primaryAgenda?.materi || `Kelas ${cls}`}
                            </h4>
                          </div>

                          <div className="border-t border-white/15 pt-3 flex items-center justify-between text-xs font-black uppercase tracking-wide">
                            <span className="text-white/90 inline-flex items-center gap-1.5">
                              {allDone ? 'UBAH / LIHAT ABSENSI' : 'ISI ABSENSI'}
                              <ArrowRight size={14} />
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white/85">
                              <Users size={13} />
                              {studentCount}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="admin-glass-card rounded-2xl p-10 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-brand dark:text-blue-400 mx-auto">
                      <CalendarClock size={26} />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        Belum Ada Kelas Tercatat di Agenda Tanggal {agendaSelectedDate}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Catat agenda harian kelas terlebih dahulu atau pilih tanggal lain yang sudah memiliki agenda.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSubTab('agenda');
                        setAgendaSelectedDate(agendaSelectedDate);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-brand hover:bg-blue-700 text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} />
                      Buka Kelola Agenda Harian
                    </button>
                  </div>
                )}
              </div>
            ) : absensiSubView === 'tanggungan' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Kartu Kelas Tanggungan Absensi ({tanggunganClassesList.length} Kelas)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Kelas yang sudah tercatat di agenda namun absensi siswanya belum diisi. Klik kartu kelas untuk menyelesaikan absensi.
                    </p>
                  </div>
                </div>

                {tanggunganClassesList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tanggunganClassesList.map((cls) => {
                      const classTanggungan = tanggunganAgendas.filter((a) => a.kelas === cls);
                      const cardTheme = getClassCardTheme(cls);
                      const studentCount = studentsByClass[cls]?.length || 0;
                      return (
                        <div
                          key={cls}
                          onClick={() => {
                            if (classTanggungan.length > 0) {
                              setAbsensiClass(cls);
                              setSelectedAgendaId(classTanggungan[0].id);
                            }
                          }}
                          className={`${cardTheme} rounded-2xl p-5 text-white relative overflow-hidden flex flex-col justify-between gap-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-3.5 py-1.5 rounded-xl bg-white/20 backdrop-blur-xs text-xl font-black uppercase tracking-tight">
                              KELAS {cls}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                              {classTanggungan.length} TANGGUNGAN
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-white/90">
                              <span className="px-2 py-0.5 rounded bg-white/20">
                                {classTanggungan[0]?.tanggal}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-white/20">
                                Jam {classTanggungan[0]?.jamKe || '1'}
                              </span>
                            </div>
                            <h4 className="text-base font-extrabold text-white leading-snug line-clamp-2">
                              {classTanggungan[0]?.materi || 'Pertemuan Pembelajaran'}
                            </h4>
                          </div>

                          <div className="border-t border-white/15 pt-3 flex items-center justify-between text-xs font-black uppercase tracking-wide">
                            <span className="text-white/95 inline-flex items-center gap-1.5">
                              SELESAIKAN ABSENSI
                              <ArrowRight size={14} />
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white/85">
                              <Users size={13} />
                              {studentCount}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="admin-glass-card rounded-2xl p-12 text-center text-slate-400 text-sm font-semibold">
                    Luar biasa! Tidak ada tanggungan absensi. Semua agenda kelas telah terisi presensinya.
                  </div>
                )}
              </div>
            ) : (
              /* REKAPITULASI ABSENSI */
              <div className="space-y-5">
                {!selectedRekapKelas ? (
                  <>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                          Rekapitulasi Absensi Semua Kelas (Semester {activeSemester})
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Pilih kartu kelas untuk melihat daftar rekap semua absensi yang telah diisi guru.
                        </p>
                      </div>
                    </div>

                    {classOptions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classOptions.map((cls) => {
                          const cardTheme = getClassCardTheme(cls);
                          const count = studentsByClass[cls]?.length || 0;
                          const classFilledRecords = absensiList.filter((a) => a.kelas === cls);

                          return (
                            <div
                              key={cls}
                              onClick={() => setSelectedRekapKelas(cls)}
                              className={`${cardTheme} rounded-2xl p-5 text-white relative overflow-hidden flex flex-col justify-between gap-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="px-3.5 py-1.5 rounded-xl bg-white/25 backdrop-blur-xs text-xl font-black uppercase tracking-tight">
                                  KELAS {cls}
                                </span>
                                <span className="px-2.5 py-1 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
                                  {count} SISWA
                                </span>
                              </div>

                              <div className="space-y-1">
                                <div className="text-sm font-black text-white">
                                  {classFilledRecords.length} Pertemuan Terisi
                                </div>
                                <div className="text-xs font-medium text-white/85">
                                  Klik untuk melihat daftar rekap absen lengkap
                                </div>
                              </div>

                              <div className="border-t border-white/15 pt-3 flex items-center justify-between text-xs font-black uppercase tracking-wide">
                                <span className="text-white/95">BUKA REKAP ABSEN</span>
                                <ChevronRight size={15} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="admin-glass-card rounded-2xl p-12 text-center text-slate-400 text-sm font-semibold">
                        Belum ada kelas terdaftar.
                      </div>
                    )}
                  </>
                ) : (() => {
                  const rekapStudents = studentsByClass[selectedRekapKelas] || [];
                  const classFilledAbsensi = absensiList
                    .filter((a) => a.kelas === selectedRekapKelas)
                    .slice()
                    .sort((a, b) => (a.tanggal || '').localeCompare(b.tanggal || ''));

                  const handleExportKelasRekapCsv = () => {
                    const headers = [
                      'No',
                      'NIS',
                      'Nama Siswa',
                      'L/P',
                      ...classFilledAbsensi.map(
                        (rec, i) => `P${rec.pertemuanKe || i + 1} (${rec.tanggal})`
                      ),
                      'Hadir (H)',
                      'Sakit (S)',
                      'Izin (I)',
                      'Alpa (A)',
                      '% Hadir',
                    ];
                    const rows = rekapStudents.map((s, idx) => {
                      let H = 0, S = 0, I = 0, A = 0;
                      const sessionStatuses = classFilledAbsensi.map((rec) => {
                        const st = rec.entries?.[s.id]?.status || '-';
                        if (st === 'H') H++;
                        else if (st === 'S') S++;
                        else if (st === 'I') I++;
                        else if (st === 'A') A++;
                        return st;
                      });
                      const total = H + S + I + A;
                      const pct = total > 0 ? `${Math.round((H / total) * 100)}%` : '-';
                      const isMale = (s.jenisKelamin || '').toUpperCase().startsWith('L');
                      return [
                        idx + 1,
                        s.nis || '-',
                        s.nama,
                        isMale ? 'L' : 'P',
                        ...sessionStatuses,
                        H,
                        S,
                        I,
                        A,
                        pct,
                      ];
                    });
                    downloadCsv(
                      `Rekap_Absensi_Kelas_${selectedRekapKelas}_${slugifyTermPart(activeTahunPelajaran)}_${activeSemester}.csv`,
                      headers,
                      rows
                    );
                  };

                  return (
                    <div className="space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/40 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-white/40 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => setSelectedRekapKelas('')}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          ← Kembali ke Semua Kartu Kelas
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-xl bg-brand/10 dark:bg-blue-950/60 text-brand dark:text-blue-300 text-xs font-black uppercase">
                            Kelas {selectedRekapKelas} · {classFilledAbsensi.length} Pertemuan Terisi
                          </span>
                          {rekapStudents.length > 0 && (
                            <button
                              type="button"
                              onClick={handleExportKelasRekapCsv}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Download size={13} />
                              Export CSV
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Riwayat Pertemuan yang Sudah Diabsen Guru */}
                      <div className="admin-glass-card rounded-2xl overflow-hidden">
                        <div className="px-5 py-3.5 bg-white/30 dark:bg-white/5 border-b border-white/40 dark:border-white/10 flex items-center justify-between">
                          <h4 className="text-xs md:text-sm font-black uppercase tracking-wide text-slate-900 dark:text-white">
                            Daftar Pertemuan Absensi yang Telah Diisi Guru ({classFilledAbsensi.length})
                          </h4>
                        </div>
                        {classFilledAbsensi.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[680px]">
                              <thead>
                                <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase font-extrabold tracking-widest text-slate-500 dark:text-slate-400">
                                  <th className="p-3 w-12 text-center">No</th>
                                  <th className="p-3">Tanggal &amp; Jam</th>
                                  <th className="p-3">Pertemuan &amp; Materi</th>
                                  <th className="p-3 text-center">Rekap (H / S / I / A)</th>
                                  <th className="p-3 text-right">Aksi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {classFilledAbsensi.map((rec, idx) => {
                                  let H = 0, S = 0, I = 0, A = 0;
                                  Object.values(rec.entries || {}).forEach((ent) => {
                                    if (ent?.status === 'H') H++;
                                    else if (ent?.status === 'S') S++;
                                    else if (ent?.status === 'I') I++;
                                    else if (ent?.status === 'A') A++;
                                  });
                                  return (
                                    <tr key={rec.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40">
                                      <td className="p-3 text-center text-xs font-bold text-slate-500 tabular-nums">{idx + 1}</td>
                                      <td className="p-3 text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap tabular-nums">
                                        {rec.tanggal} {rec.jamKe ? `· Jam ${rec.jamKe}` : ''}
                                      </td>
                                      <td className="p-3">
                                        <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                                          Pertemuan ke-{rec.pertemuanKe || idx + 1}
                                        </div>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                          {rec.materi || '-'}
                                        </div>
                                      </td>
                                      <td className="p-3 text-center whitespace-nowrap">
                                        <div className="inline-flex items-center gap-1 text-[11px] font-extrabold tabular-nums">
                                          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">H:{H}</span>
                                          <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">S:{S}</span>
                                          <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">I:{I}</span>
                                          <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">A:{A}</span>
                                        </div>
                                      </td>
                                      <td className="p-3 text-right whitespace-nowrap">
                                        {rec.agendaId && agendaList.some((ag) => ag.id === rec.agendaId) ? (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setAbsensiClass(selectedRekapKelas);
                                              setSelectedAgendaId(rec.agendaId!);
                                            }}
                                            className="px-2.5 py-1 rounded-lg bg-brand/10 dark:bg-blue-950/60 text-brand dark:text-blue-300 text-[11px] font-extrabold hover:bg-brand/20 cursor-pointer"
                                          >
                                            Detail / Ubah
                                          </button>
                                        ) : (
                                          <span className="text-[11px] text-slate-400">Tersimpan</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                            Belum ada absensi yang diisi guru untuk Kelas {selectedRekapKelas} pada Semester {activeSemester}.
                          </div>
                        )}
                      </div>

                      {/* Matriks Rekap Kehadiran Seluruh Siswa Kelas Terpilih */}
                      <div className="admin-glass-card rounded-2xl overflow-hidden">
                        <div className="px-5 py-4 bg-white/30 dark:bg-white/5 border-b border-white/40 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-xs md:text-sm font-black uppercase tracking-wide text-slate-900 dark:text-white">
                            Rekapitulasi Kehadiran Per Siswa · Kelas {selectedRekapKelas}
                          </h4>
                          <span className="text-xs font-bold text-slate-500">
                            {rekapStudents.length} Siswa
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-[760px]">
                            <thead>
                              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase font-extrabold tracking-widest text-slate-500 dark:text-slate-400">
                                <th className="p-3 w-12 text-center">No</th>
                                <th className="p-3">NIS</th>
                                <th className="p-3">Nama Siswa &amp; JK</th>
                                {classFilledAbsensi.map((rec, i) => (
                                  <th
                                    key={rec.id}
                                    className="p-2 text-center whitespace-nowrap"
                                    title={`${rec.tanggal} - ${rec.materi || ''}`}
                                  >
                                    <div>P{rec.pertemuanKe || i + 1}</div>
                                    <div className="text-[9px] font-normal text-slate-400">{rec.tanggal.slice(5)}</div>
                                  </th>
                                ))}
                                <th className="p-3 text-center">H</th>
                                <th className="p-3 text-center">S</th>
                                <th className="p-3 text-center">I</th>
                                <th className="p-3 text-center">A</th>
                                <th className="p-3 text-center">% Hadir</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {rekapStudents.length > 0 ? (
                                rekapStudents.map((s, idx) => {
                                  let H = 0, S = 0, I = 0, A = 0;
                                  classFilledAbsensi.forEach((rec) => {
                                    const st = rec.entries?.[s.id]?.status;
                                    if (st === 'H') H++;
                                    else if (st === 'S') S++;
                                    else if (st === 'I') I++;
                                    else if (st === 'A') A++;
                                  });
                                  const total = H + S + I + A;
                                  const pct = total > 0 ? Math.round((H / total) * 100) : 0;
                                  const isMale = (s.jenisKelamin || '').toUpperCase().startsWith('L');

                                  return (
                                    <tr
                                      key={s.id}
                                      className={`border-l-4 transition-colors ${
                                        isMale
                                          ? 'border-l-blue-500 bg-blue-50/35 dark:bg-blue-950/15 hover:bg-blue-100/40 dark:hover:bg-blue-950/30'
                                          : 'border-l-rose-500 bg-rose-50/35 dark:bg-rose-950/15 hover:bg-rose-100/40 dark:hover:bg-rose-950/30'
                                      }`}
                                    >
                                      <td className="p-3 text-center text-xs font-bold text-slate-500 tabular-nums">{idx + 1}</td>
                                      <td className="p-3 text-xs font-mono text-slate-500">{s.nis || '-'}</td>
                                      <td className="p-3">
                                        <div className="flex items-center gap-2">
                                          <span
                                            className={`text-sm font-extrabold ${
                                              isMale
                                                ? 'text-blue-900 dark:text-blue-200'
                                                : 'text-rose-800 dark:text-rose-200'
                                            }`}
                                          >
                                            {s.nama}
                                          </span>
                                          <span
                                            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                              isMale
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                            }`}
                                          >
                                            {isMale ? 'L' : 'P'}
                                          </span>
                                        </div>
                                      </td>
                                      {classFilledAbsensi.map((rec) => {
                                        const st = rec.entries?.[s.id]?.status;
                                        return (
                                          <td key={rec.id} className="p-2 text-center text-[11px] font-black tabular-nums">
                                            {st ? (
                                              <span
                                                className={`inline-block w-6 py-0.5 rounded ${
                                                  st === 'H'
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                    : st === 'S'
                                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                                    : st === 'I'
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                                }`}
                                              >
                                                {st}
                                              </span>
                                            ) : (
                                              <span className="text-slate-300 dark:text-slate-600">-</span>
                                            )}
                                          </td>
                                        );
                                      })}
                                      <td className="p-3 text-center font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{H}</td>
                                      <td className="p-3 text-center font-bold text-amber-700 dark:text-amber-400 tabular-nums">{S}</td>
                                      <td className="p-3 text-center font-bold text-blue-700 dark:text-blue-400 tabular-nums">{I}</td>
                                      <td className="p-3 text-center font-bold text-rose-700 dark:text-rose-400 tabular-nums">{A}</td>
                                      <td className="p-3 text-center">
                                        <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800 text-xs font-black text-slate-800 dark:text-slate-100 tabular-nums border border-slate-200 dark:border-slate-700">
                                          {total > 0 ? `${pct}%` : '-'}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td
                                    colSpan={8 + classFilledAbsensi.length}
                                    className="p-8 text-center text-slate-400 text-xs font-semibold"
                                  >
                                    Tidak ada siswa di kelas {selectedRekapKelas}.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
      )}


      {/* ===================================================================== */}
      {/* TAB 5: INPUT NILAI (SUMATIF, SUMATIF AKHIR, NILAI RAPOR)              */}
      {/* ===================================================================== */}
      {subTab === 'nilai' && (
        <div className="space-y-5">
          {/* Inner switcher + Class Filter */}
          <div className="admin-glass-card rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="inline-flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
              <button
                type="button"
                onClick={() => setNilaiSubTab('sumatif')}
                className={`px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                  nilaiSubTab === 'sumatif'
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ClipboardCheck size={14} />
                Nilai Sumatif
              </button>
              <button
                type="button"
                onClick={() => setNilaiSubTab('sumatif_akhir')}
                className={`px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                  nilaiSubTab === 'sumatif_akhir'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Award size={14} />
                Sumatif Akhir
              </button>
              <button
                type="button"
                onClick={() => setNilaiSubTab('rapor')}
                className={`px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                  nilaiSubTab === 'rapor'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileSpreadsheet size={14} />
                Nilai Rapor
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Kelas:</label>
              <select
                value={nilaiClass}
                onChange={(e) => setNilaiClass(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-800 dark:text-slate-100"
              >
                {classOptions.length === 0 ? (
                  <option value="">Tidak ada kelas</option>
                ) : (
                  classOptions.map((c) => (
                    <option key={c} value={c}>
                      Kelas {c} ({studentsByClass[c]?.length || 0} siswa)
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* 5A. NILAI SUMATIF & PRAKTIKUM (1 TABEL GABUNGAN) */}
          {nilaiSubTab === 'sumatif' && (
            <div className="space-y-4">
              {classSumatifList.length > 0 ? (
                <div className="admin-glass-card rounded-2xl overflow-hidden">
                  <div className="p-4 md:p-5 border-b border-white/40 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                        Nilai Sumatif &amp; Praktikum — Kelas {nilaiClass}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                        {classSumatifList.length} kolom penilaian · Semester {activeSemester} ({activeTahunPelajaran})
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openNewSumatifModal('sumatif')}
                        className="px-3.5 py-2 rounded-xl bg-brand hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Plus size={14} />
                        Buat Penilaian Sumatif
                      </button>
                      <button
                        type="button"
                        onClick={handleExportSumatifCsv}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        <Download size={14} />
                        Export CSV
                      </button>
                      <button
                        type="button"
                        disabled={isSavingSumatifScores}
                        onClick={handleSaveAllSumatifScores}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        <Save size={14} />
                        {isSavingSumatifScores ? 'Menyimpan...' : 'Simpan Semua Nilai'}
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/70 dark:border-slate-700 text-[10px] uppercase font-extrabold tracking-widest text-slate-500 dark:text-slate-400">
                          <th className="p-3.5 w-12">No</th>
                          <th className="p-3.5 whitespace-nowrap">NISN</th>
                          <th className="p-3.5 min-w-[200px]">Nama Siswa</th>
                          {classSumatifList.map((sum) => {
                            const isSavedDoc = sumatifList.some((s) => s.id === sum.id);
                            const sameAsTpKode =
                              sum.tpKode &&
                              sum.judul.trim().toUpperCase() === sum.tpKode.trim().toUpperCase();
                            const isPraktik = sum.jenis === 'Praktik';
                            return (
                              <th
                                key={sum.id}
                                className="p-3 text-center min-w-[120px] border-l border-slate-200/60 dark:border-slate-700/60"
                              >
                                <div className="flex flex-col items-center gap-1">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 normal-case tracking-normal">
                                      {sum.judul}
                                    </span>
                                    {!sameAsTpKode && sum.tpKode ? (
                                      <span className="text-[10px] font-mono text-slate-500 normal-case">
                                        ({sum.tpKode})
                                      </span>
                                    ) : null}
                                    {isSavedDoc && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteSumatif(sum.id)}
                                        className="p-0.5 rounded text-slate-400 hover:text-rose-500 cursor-pointer"
                                        title={`Hapus ${sum.judul}`}
                                      >
                                        <X size={12} />
                                      </button>
                                    )}
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                      isPraktik
                                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                                        : 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300'
                                    }`}
                                  >
                                    {isPraktik ? 'Praktikum' : 'Sumatif'}
                                  </span>
                                </div>
                              </th>
                            );
                          })}
                          <th className="p-3.5 text-center w-24 border-l border-slate-200/60 dark:border-slate-700/60">
                            Rata-rata
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {nilaiClassStudents.length > 0 ? (
                          nilaiClassStudents.map((s, idx) => {
                            let weightedSum = 0;
                            let totalWeight = 0;
                            classSumatifList.forEach((sum) => {
                              const raw = (sumatifMatrixDraft[sum.id]?.[s.id] || '').trim();
                              if (raw !== '' && !Number.isNaN(Number(raw))) {
                                const num = Math.max(0, Math.min(100, Number(raw)));
                                const w = Number(sum.bobot || 1) || 1;
                                weightedSum += num * w;
                                totalWeight += w;
                              }
                            });
                            const avg =
                              totalWeight > 0 ? Math.round(weightedSum / totalWeight) : null;

                            return (
                              <tr key={s.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50">
                                <td className="p-3.5 text-xs font-mono text-slate-400 tabular-nums">{idx + 1}</td>
                                <td className="p-3.5 text-xs font-mono text-slate-500 whitespace-nowrap">{s.nis}</td>
                                <td className="p-3.5">
                                  <button
                                    type="button"
                                    onClick={() => onOpenStudentDetail?.(s)}
                                    className="text-left text-sm font-extrabold text-slate-900 dark:text-white hover:text-brand dark:hover:text-blue-400 cursor-pointer"
                                  >
                                    {s.nama}
                                  </button>
                                </td>
                                {classSumatifList.map((sum) => {
                                  const rawVal = sumatifMatrixDraft[sum.id]?.[s.id] ?? '';
                                  return (
                                    <td
                                      key={sum.id}
                                      className="p-2.5 text-center border-l border-slate-100 dark:border-slate-800"
                                    >
                                      <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={rawVal}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setSumatifMatrixDraft((prev) => ({
                                            ...prev,
                                            [sum.id]: {
                                              ...(prev[sum.id] || {}),
                                              [s.id]: val,
                                            },
                                          }));
                                        }}
                                        placeholder="0-100"
                                        className="w-20 text-center px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-extrabold text-slate-900 dark:text-white tabular-nums focus:outline-none focus:ring-2 focus:ring-brand/40"
                                      />
                                    </td>
                                  );
                                })}
                                <td className="p-3.5 text-center border-l border-slate-100 dark:border-slate-800">
                                  <span
                                    className={`px-2.5 py-1 rounded-lg text-xs font-black tabular-nums ${
                                      avg === null
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                        : avg >= 75
                                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                    }`}
                                  >
                                    {avg !== null ? avg : '-'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={4 + classSumatifList.length}
                              className="p-10 text-center text-slate-400 text-sm font-semibold"
                            >
                              Belum ada siswa di kelas ini.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="admin-glass-card rounded-2xl p-12 text-center space-y-3">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Belum ada daftar penilaian sumatif atau praktikum untuk {nilaiClass ? `Kelas ${nilaiClass}` : 'kelas ini'} pada Semester {activeSemester}. Centang Sumatif/Praktikum pada Tujuan Pembelajaran atau buat penilaian baru.
                  </p>
                  {nilaiClass && (
                    <button
                      type="button"
                      onClick={() => openNewSumatifModal('sumatif')}
                      className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} />
                      Buat Penilaian Sumatif Pertama
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 5B. SUMATIF AKHIR */}
          {nilaiSubTab === 'sumatif_akhir' && (
            <div className="space-y-4">
              {classSumatifAkhirList.length > 0 ? (
                <div className="admin-glass-card rounded-2xl overflow-hidden">
                  <div className="p-4 md:p-5 border-b border-white/40 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                        Sumatif Akhir — Kelas {nilaiClass}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                        {classSumatifAkhirList.length} kolom Sumatif Akhir · Semester {activeSemester} ({activeTahunPelajaran})
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openNewSumatifModal('sumatif_akhir')}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Plus size={14} />
                        Tambah Sumatif Akhir
                      </button>
                      <button
                        type="button"
                        onClick={handleExportSumatifAkhirCsv}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        <Download size={14} />
                        Export CSV
                      </button>
                      <button
                        type="button"
                        disabled={isSavingSumatifScores}
                        onClick={handleSaveAllSumatifAkhirScores}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        <Save size={14} />
                        {isSavingSumatifScores ? 'Menyimpan...' : 'Simpan Sumatif Akhir'}
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/70 dark:border-slate-700 text-[10px] uppercase font-extrabold tracking-widest text-slate-500 dark:text-slate-400">
                          <th className="p-3.5 w-12">No</th>
                          <th className="p-3.5 whitespace-nowrap">NISN</th>
                          <th className="p-3.5 min-w-[200px]">Nama Siswa</th>
                          {classSumatifAkhirList.map((sum) => {
                            const isSavedDoc = sumatifList.some((s) => s.id === sum.id);
                            return (
                              <th
                                key={sum.id}
                                className="p-3 text-center min-w-[140px] border-l border-slate-200/60 dark:border-slate-700/60"
                              >
                                <div className="flex flex-col items-center gap-1">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 normal-case tracking-normal">
                                      {sum.judul}
                                    </span>
                                    {isSavedDoc && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteSumatif(sum.id)}
                                        className="p-0.5 rounded text-slate-400 hover:text-rose-500 cursor-pointer"
                                        title={`Hapus ${sum.judul}`}
                                      >
                                        <X size={12} />
                                      </button>
                                    )}
                                  </div>
                                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                                    {sum.jenis === 'Sumatif Tengah Semester' ? 'STS' : 'Sumatif Akhir'}
                                  </span>
                                </div>
                              </th>
                            );
                          })}
                          <th className="p-3.5 text-center w-24 border-l border-slate-200/60 dark:border-slate-700/60">
                            Rata-rata
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {nilaiClassStudents.length > 0 ? (
                          nilaiClassStudents.map((s, idx) => {
                            let weightedSum = 0;
                            let totalWeight = 0;
                            classSumatifAkhirList.forEach((sum) => {
                              const raw = (sumatifMatrixDraft[sum.id]?.[s.id] || '').trim();
                              if (raw !== '' && !Number.isNaN(Number(raw))) {
                                const num = Math.max(0, Math.min(100, Number(raw)));
                                const w = Number(sum.bobot || 1) || 1;
                                weightedSum += num * w;
                                totalWeight += w;
                              }
                            });
                            const avg =
                              totalWeight > 0 ? Math.round(weightedSum / totalWeight) : null;

                            return (
                              <tr key={s.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50">
                                <td className="p-3.5 text-xs font-mono text-slate-400 tabular-nums">{idx + 1}</td>
                                <td className="p-3.5 text-xs font-mono text-slate-500 whitespace-nowrap">{s.nis}</td>
                                <td className="p-3.5">
                                  <button
                                    type="button"
                                    onClick={() => onOpenStudentDetail?.(s)}
                                    className="text-left text-sm font-extrabold text-slate-900 dark:text-white hover:text-brand dark:hover:text-blue-400 cursor-pointer"
                                  >
                                    {s.nama}
                                  </button>
                                </td>
                                {classSumatifAkhirList.map((sum) => {
                                  const rawVal = sumatifMatrixDraft[sum.id]?.[s.id] ?? '';
                                  return (
                                    <td
                                      key={sum.id}
                                      className="p-2.5 text-center border-l border-slate-100 dark:border-slate-800"
                                    >
                                      <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={rawVal}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setSumatifMatrixDraft((prev) => ({
                                            ...prev,
                                            [sum.id]: {
                                              ...(prev[sum.id] || {}),
                                              [s.id]: val,
                                            },
                                          }));
                                        }}
                                        placeholder="0-100"
                                        className="w-24 text-center px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-extrabold text-slate-900 dark:text-white tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                      />
                                    </td>
                                  );
                                })}
                                <td className="p-3.5 text-center border-l border-slate-100 dark:border-slate-800">
                                  <span
                                    className={`px-2.5 py-1 rounded-lg text-xs font-black tabular-nums ${
                                      avg === null
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                        : avg >= 75
                                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                    }`}
                                  >
                                    {avg !== null ? avg : '-'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={4 + classSumatifAkhirList.length}
                              className="p-10 text-center text-slate-400 text-sm font-semibold"
                            >
                              Belum ada siswa di kelas ini.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="admin-glass-card rounded-2xl p-12 text-center space-y-3">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Pilih kelas terlebih dahulu untuk mengisi Nilai Sumatif Akhir.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 5C. NILAI RAPOR */}
          {nilaiSubTab === 'rapor' && (
            <div className="admin-glass-card rounded-2xl overflow-hidden">
              <div className="p-4 md:p-5 border-b border-white/40 dark:border-white/10 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Input Nilai Rapor — Kelas {nilaiClass || '-'} (TA {activeTahunPelajaran} · Sem {activeSemester})
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Nilai Akhir = ({raporWeights.pctSumatifTp}% Sumatif TP) + ({raporWeights.pctPraktikumTp}% Praktikum TP) + ({raporWeights.pctSumatifAkhir}% Sumatif Akhir).
                    </p>
                  </div>

                  {nilaiClassStudents.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={exportRaporCsv}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-extrabold flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
                      >
                        <Download size={13} />
                        Ekspor CSV
                      </button>
                      <button
                        type="button"
                        disabled={isSavingRapor || !isRaporWeightValid}
                        onClick={handleSaveAllRapor}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        <Save size={14} />
                        {isSavingRapor ? 'Menyimpan...' : 'Simpan Nilai Rapor'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Setingan Persentase Nilai Akhir (%) */}
                <div
                  className={`rounded-2xl p-3.5 border flex flex-col lg:flex-row lg:items-center justify-between gap-3 ${
                    isRaporWeightValid
                      ? 'bg-slate-50/90 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80'
                      : 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={16} className={isRaporWeightValid ? 'text-brand dark:text-blue-400' : 'text-rose-600'} />
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                        Pengaturan Persentase Nilai Akhir (%)
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Jumlah persentase Sumatif TP, Praktikum TP, dan Sumatif Akhir harus tepat 100%.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-xs font-bold">
                      <span className="text-blue-700 dark:text-blue-300">Sumatif TP</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={raporWeights.pctSumatifTp}
                        onChange={(e) => handleUpdateRaporWeight('pctSumatifTp', Number(e.target.value))}
                        className="w-14 text-center px-1.5 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black tabular-nums"
                      />
                      <span className="text-slate-400">%</span>
                    </label>
                    <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                      <span className="text-emerald-700 dark:text-emerald-300">Praktikum TP</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={raporWeights.pctPraktikumTp}
                        onChange={(e) => handleUpdateRaporWeight('pctPraktikumTp', Number(e.target.value))}
                        className="w-14 text-center px-1.5 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black tabular-nums"
                      />
                      <span className="text-slate-400">%</span>
                    </label>
                    <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs font-bold">
                      <span className="text-indigo-700 dark:text-indigo-300">Sumatif Akhir</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={raporWeights.pctSumatifAkhir}
                        onChange={(e) => handleUpdateRaporWeight('pctSumatifAkhir', Number(e.target.value))}
                        className="w-14 text-center px-1.5 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black tabular-nums"
                      />
                      <span className="text-slate-400">%</span>
                    </label>
                    <span
                      className={`px-3 py-1.5 rounded-xl text-xs font-black tabular-nums ${
                        isRaporWeightValid
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      Total: {raporWeightTotal}% {isRaporWeightValid ? '✓' : '(Harus 100%)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full">
                <table className="w-full table-fixed text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/70 dark:border-slate-700 text-[9px] sm:text-[10px] uppercase font-extrabold tracking-tight text-slate-500 dark:text-slate-400">
                      <th className="px-1.5 py-2.5 w-7 sm:w-8 text-center">No</th>
                      <th className="px-1.5 sm:px-2 py-2.5 w-28 sm:w-36 lg:w-44">Siswa</th>
                      <th className="px-1 py-2.5 w-14 sm:w-[68px] text-center">Absensi</th>
                      {sumatifTpCols.map((col) => (
                        <th
                          key={col.id}
                          className="px-1 py-2 text-center border-l border-slate-200/60 dark:border-slate-700/60"
                        >
                          <div className="flex flex-col items-center gap-0.5 min-w-0">
                            <span
                              title={col.judul}
                              className="w-full text-[10px] font-black text-slate-800 dark:text-slate-100 normal-case tracking-normal leading-tight break-words"
                            >
                              {col.judul}
                            </span>
                            <span className="px-1 py-0.5 rounded text-[8px] font-black bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
                              Sumatif
                            </span>
                          </div>
                        </th>
                      ))}
                      {praktikumTpCols.map((col) => (
                        <th
                          key={col.id}
                          className="px-1 py-2 text-center border-l border-slate-200/60 dark:border-slate-700/60"
                        >
                          <div className="flex flex-col items-center gap-0.5 min-w-0">
                            <span
                              title={col.judul}
                              className="w-full text-[10px] font-black text-slate-800 dark:text-slate-100 normal-case tracking-normal leading-tight break-words"
                            >
                              {col.judul}
                            </span>
                            <span className="px-1 py-0.5 rounded text-[8px] font-black bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                              Praktikum
                            </span>
                          </div>
                        </th>
                      ))}
                      {sumatifAkhirCols.map((col) => (
                        <th
                          key={col.id}
                          className="px-1 py-2 text-center border-l border-slate-200/60 dark:border-slate-700/60"
                        >
                          <div className="flex flex-col items-center gap-0.5 min-w-0">
                            <span
                              title={col.judul}
                              className="w-full text-[10px] font-black text-slate-800 dark:text-slate-100 normal-case tracking-normal leading-tight break-words"
                            >
                              {col.judul}
                            </span>
                            <span className="px-1 py-0.5 rounded text-[8px] font-black bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                              S. Akhir
                            </span>
                          </div>
                        </th>
                      ))}
                      <th className="px-1 py-2 w-12 sm:w-14 lg:w-16 text-center leading-tight border-l border-slate-200/80 dark:border-slate-700 bg-blue-50/40 dark:bg-blue-950/20">
                        Rata S.<br />({raporWeights.pctSumatifTp}%)
                      </th>
                      <th className="px-1 py-2 w-12 sm:w-14 lg:w-16 text-center leading-tight border-l border-slate-200/60 dark:border-slate-700/60 bg-emerald-50/40 dark:bg-emerald-950/20">
                        Rata P.<br />({raporWeights.pctPraktikumTp}%)
                      </th>
                      <th className="px-1 py-2 w-12 sm:w-14 lg:w-16 text-center leading-tight border-l border-slate-200/60 dark:border-slate-700/60 bg-indigo-50/40 dark:bg-indigo-950/20">
                        Rata SA<br />({raporWeights.pctSumatifAkhir}%)
                      </th>
                      <th className="px-1 py-2 w-12 sm:w-14 text-center leading-tight border-l border-slate-200/80 dark:border-slate-700">
                        Nilai Akhir
                      </th>
                      <th className="px-1 py-2 w-9 sm:w-11 text-center">Final</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {nilaiClassStudents.length > 0 ? (
                      nilaiClassStudents.map((s, idx) => {
                        const row = raporDraft[s.id] || {
                          isFinalized: false,
                        };
                        const att = studentAttendanceRecap[s.id] || { H: 0, S: 0, I: 0, A: 0, total: 0 };
                        const { avgSumatifTp, avgPraktikumTp, avgSumatifAkhir, nilaiAkhir } =
                          computeStudentRaporBreakdown(s.id);
                        return (
                          <tr key={s.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 align-middle">
                            <td className="px-1.5 py-2 text-center text-[11px] font-mono text-slate-400 tabular-nums">
                              {idx + 1}
                            </td>
                            <td className="px-1.5 sm:px-2 py-2 min-w-0">
                              <button
                                type="button"
                                onClick={() => onOpenStudentDetail?.(s)}
                                title={s.nama}
                                className="w-full truncate text-left text-xs sm:text-[13px] font-extrabold text-slate-900 dark:text-white hover:text-brand dark:hover:text-blue-400 cursor-pointer block"
                              >
                                {s.nama}
                              </button>
                              <span className="block truncate text-[10px] font-mono text-slate-400">
                                {s.nis}
                              </span>
                            </td>
                            <td className="px-1 py-2 text-center">
                              <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 tabular-nums">
                                {att.H}/{att.S}/{att.I}/{att.A}
                              </span>
                            </td>
                            {sumatifTpCols.map((col) => {
                              const val = col.scores?.[s.id];
                              return (
                                <td
                                  key={col.id}
                                  className="px-1 py-2 text-center text-xs font-extrabold text-slate-800 dark:text-slate-100 tabular-nums border-l border-slate-100 dark:border-slate-800"
                                >
                                  {val !== undefined && val !== null ? val : <span className="text-slate-300 dark:text-slate-600">-</span>}
                                </td>
                              );
                            })}
                            {praktikumTpCols.map((col) => {
                              const val = col.scores?.[s.id];
                              return (
                                <td
                                  key={col.id}
                                  className="px-1 py-2 text-center text-xs font-extrabold text-slate-800 dark:text-slate-100 tabular-nums border-l border-slate-100 dark:border-slate-800"
                                >
                                  {val !== undefined && val !== null ? val : <span className="text-slate-300 dark:text-slate-600">-</span>}
                                </td>
                              );
                            })}
                            {sumatifAkhirCols.map((col) => {
                              const val = col.scores?.[s.id];
                              return (
                                <td
                                  key={col.id}
                                  className="px-1 py-2 text-center text-xs font-extrabold text-slate-800 dark:text-slate-100 tabular-nums border-l border-slate-100 dark:border-slate-800"
                                >
                                  {val !== undefined && val !== null ? val : <span className="text-slate-300 dark:text-slate-600">-</span>}
                                </td>
                              );
                            })}
                            <td className="px-1 py-2 text-center text-xs font-black text-blue-700 dark:text-blue-300 tabular-nums border-l border-slate-200/70 dark:border-slate-700 bg-blue-50/20 dark:bg-blue-950/10">
                              {avgSumatifTp}
                            </td>
                            <td className="px-1 py-2 text-center text-xs font-black text-emerald-700 dark:text-emerald-300 tabular-nums border-l border-slate-100 dark:border-slate-800 bg-emerald-50/20 dark:bg-emerald-950/10">
                              {avgPraktikumTp}
                            </td>
                            <td className="px-1 py-2 text-center text-xs font-black text-indigo-700 dark:text-indigo-300 tabular-nums border-l border-slate-100 dark:border-slate-800 bg-indigo-50/20 dark:bg-indigo-950/10">
                              {avgSumatifAkhir}
                            </td>
                            <td className="px-1 py-2 text-center border-l border-slate-200/70 dark:border-slate-700">
                              <span className="inline-block px-2 py-0.5 rounded-lg bg-brand/10 dark:bg-blue-950/60 text-brand dark:text-blue-300 text-xs sm:text-sm font-black tabular-nums">
                                {nilaiAkhir}
                              </span>
                            </td>
                            <td className="px-1 py-2 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  updateRaporField(s.id, 'isFinalized', !row.isFinalized)
                                }
                                className={`w-7 h-7 rounded-lg inline-flex items-center justify-center border cursor-pointer transition-colors ${
                                  row.isFinalized
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                                }`}
                                title={row.isFinalized ? 'Sudah Final' : 'Tandai Final'}
                              >
                                <Check size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={8 + sumatifTpCols.length + praktikumTpCols.length + sumatifAkhirCols.length}
                          className="p-10 text-center text-slate-400 text-sm font-semibold"
                        >
                          Belum ada siswa pada kelas ini untuk Tahun Pelajaran {activeTahunPelajaran}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODALS: JADWAL, TP, AGENDA, SUMATIF (Portaled above sidebar/header)   */}
      {/* ===================================================================== */}
      {typeof document !== 'undefined' && isJadwalModalOpen && createPortal((() => {
        const modalDayCfg = effectiveJadwalSettings.days[jadwalForm.hari] || effectiveJadwalSettings.days.Senin;
        const modalMaxSlots = Math.max(modalDayCfg.totalSlots, jadwalForm.sampaiJamKe, 12);
        const slotOptions = Array.from({ length: modalMaxSlots }, (_, i) => i + 1);

        return (
        <div className="fixed inset-0 z-[200] bg-slate-900/65 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {editingJadwalId
                  ? jadwalForm.isBreak
                    ? 'Edit Jam Istirahat'
                    : 'Edit Jadwal Pelajaran'
                  : jadwalForm.isBreak
                  ? 'Tambah Jam Istirahat'
                  : 'Tambah Jadwal Pelajaran'}
              </h3>
              <button type="button" onClick={() => setIsJadwalModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveJadwal} className="space-y-3">
              {/* Jenis Slot Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() =>
                    setJadwalForm((prev) => {
                      const times = getSlotRangeTimes(prev.hari, prev.dariJamKe, prev.sampaiJamKe);
                      const jamKeStr = prev.dariJamKe === prev.sampaiJamKe ? String(prev.dariJamKe) : `${prev.dariJamKe}-${prev.sampaiJamKe}`;
                      return {
                        ...prev,
                        isBreak: false,
                        kelas: prev.kelas === 'ISTIRAHAT' ? classOptions[0] || '' : prev.kelas,
                        mataPelajaran:
                          prev.mataPelajaran === 'JAM ISTIRAHAT' ? 'INFORMATIKA' : prev.mataPelajaran,
                        jamKe: jamKeStr,
                        waktuMulai: times.mulai,
                        waktuSelesai: times.selesai,
                      };
                    })
                  }
                  className={`py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    !jadwalForm.isBreak
                      ? 'bg-white dark:bg-slate-900 text-brand dark:text-blue-300 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Jam Pelajaran
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setJadwalForm((prev) => {
                      const dayCfg = effectiveJadwalSettings.days[prev.hari] || effectiveJadwalSettings.days.Senin;
                      const comp = computeDayScheduleSlots(
                        dayCfg,
                        effectiveJadwalSettings.lessonDurationMinutes,
                        effectiveJadwalSettings.breakDurationMinutes
                      );
                      const brk = comp.breaks[0];
                      return {
                        ...prev,
                        isBreak: true,
                        kelas: 'ISTIRAHAT',
                        mataPelajaran: 'JAM ISTIRAHAT',
                        jamKe: 'Istirahat',
                        waktuMulai: brk?.mulai || '10:00',
                        waktuSelesai: brk?.selesai || '10:20',
                      };
                    })
                  }
                  className={`py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    jadwalForm.isBreak
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Coffee size={13} />
                  Jam Istirahat
                </button>
              </div>

              <div className={`grid ${jadwalForm.isBreak ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                {!jadwalForm.isBreak && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Kelas</label>
                    {classOptions.length > 0 ? (
                      <select
                        value={jadwalForm.kelas}
                        onChange={(e) => setJadwalForm({ ...jadwalForm, kelas: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                        required
                      >
                        <option value="">Pilih Kelas</option>
                        {classOptions.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={jadwalForm.kelas}
                        onChange={(e) => setJadwalForm({ ...jadwalForm, kelas: e.target.value })}
                        placeholder="Misal: 9H"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                        required
                      />
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Hari</label>
                  <select
                    value={jadwalForm.hari}
                    onChange={(e) => {
                      const nextHari = e.target.value as JadwalPelajaranItem['hari'];
                      if (!editingJadwalId) {
                        if (jadwalForm.isBreak) {
                          const dayCfg = effectiveJadwalSettings.days[nextHari] || effectiveJadwalSettings.days.Senin;
                          const comp = computeDayScheduleSlots(
                            dayCfg,
                            effectiveJadwalSettings.lessonDurationMinutes,
                            effectiveJadwalSettings.breakDurationMinutes
                          );
                          const brk = comp.breaks[0];
                          setJadwalForm({
                            ...jadwalForm,
                            hari: nextHari,
                            waktuMulai: brk?.mulai || jadwalForm.waktuMulai,
                            waktuSelesai: brk?.selesai || jadwalForm.waktuSelesai,
                          });
                        } else {
                          const times = getSlotRangeTimes(nextHari, jadwalForm.dariJamKe, jadwalForm.sampaiJamKe);
                          setJadwalForm({
                            ...jadwalForm,
                            hari: nextHari,
                            waktuMulai: times.mulai,
                            waktuSelesai: times.selesai,
                          });
                        }
                      } else {
                        setJadwalForm({ ...jadwalForm, hari: nextHari });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                  >
                    {HARI_LIST.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dari Jam Ke ... Sampai Jam Ke ... & Waktu */}
              {!jadwalForm.isBreak ? (
                <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1">
                        Dari Jam Ke-
                      </label>
                      <select
                        value={jadwalForm.dariJamKe}
                        onChange={(e) => {
                          const newFrom = Math.max(1, Number(e.target.value) || 1);
                          const newTo = Math.max(newFrom, jadwalForm.sampaiJamKe);
                          const times = getSlotRangeTimes(jadwalForm.hari, newFrom, newTo);
                          const jamKeStr = newFrom === newTo ? String(newFrom) : `${newFrom}-${newTo}`;
                          setJadwalForm({
                            ...jadwalForm,
                            dariJamKe: newFrom,
                            sampaiJamKe: newTo,
                            jamKe: jamKeStr,
                            waktuMulai: times.mulai,
                            waktuSelesai: times.selesai,
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-extrabold tabular-nums text-slate-900 dark:text-slate-100"
                      >
                        {slotOptions.map((n) => (
                          <option key={n} value={n}>
                            Jam ke-{n}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1">
                        Sampai Jam Ke-
                      </label>
                      <select
                        value={jadwalForm.sampaiJamKe}
                        onChange={(e) => {
                          const newTo = Math.max(1, Number(e.target.value) || 1);
                          const newFrom = Math.min(jadwalForm.dariJamKe, newTo);
                          const times = getSlotRangeTimes(jadwalForm.hari, newFrom, newTo);
                          const jamKeStr = newFrom === newTo ? String(newFrom) : `${newFrom}-${newTo}`;
                          setJadwalForm({
                            ...jadwalForm,
                            dariJamKe: newFrom,
                            sampaiJamKe: newTo,
                            jamKe: jamKeStr,
                            waktuMulai: times.mulai,
                            waktuSelesai: times.selesai,
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-extrabold tabular-nums text-slate-900 dark:text-slate-100"
                      >
                        {slotOptions.map((n) => (
                          <option key={n} value={n} disabled={n < jadwalForm.dariJamKe}>
                            Jam ke-{n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Waktu Mulai
                      </label>
                      <input
                        type="time"
                        value={jadwalForm.waktuMulai}
                        onChange={(e) => setJadwalForm({ ...jadwalForm, waktuMulai: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Waktu Selesai
                      </label>
                      <input
                        type="time"
                        value={jadwalForm.waktuSelesai}
                        onChange={(e) => setJadwalForm({ ...jadwalForm, waktuSelesai: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="text-[11px] font-bold text-brand dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/50 px-3 py-1.5 rounded-lg flex items-center justify-between">
                    <span>
                      Rentang: Jam ke-{jadwalForm.dariJamKe === jadwalForm.sampaiJamKe ? jadwalForm.dariJamKe : `${jadwalForm.dariJamKe} s/d ${jadwalForm.sampaiJamKe}`}
                    </span>
                    <span className="font-mono tabular-nums">
                      {jadwalForm.waktuMulai} – {jadwalForm.waktuSelesai}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Mulai</label>
                    <input
                      type="time"
                      value={jadwalForm.waktuMulai}
                      onChange={(e) => setJadwalForm({ ...jadwalForm, waktuMulai: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Selesai</label>
                    <input
                      type="time"
                      value={jadwalForm.waktuSelesai}
                      onChange={(e) => setJadwalForm({ ...jadwalForm, waktuSelesai: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold tabular-nums"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {jadwalForm.isBreak ? 'Label Istirahat' : 'Mata Pelajaran'}
                </label>
                <input
                  type="text"
                  value={jadwalForm.mataPelajaran}
                  onChange={(e) => setJadwalForm({ ...jadwalForm, mataPelajaran: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsJadwalModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-white text-xs font-extrabold cursor-pointer ${
                    jadwalForm.isBreak ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-brand hover:bg-blue-700'
                  }`}
                >
                  {jadwalForm.isBreak ? 'Simpan Istirahat' : 'Simpan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
        );
      })(), document.body)}

      {typeof document !== 'undefined' && isTpModalOpen && createPortal(
        <div className="fixed inset-0 z-[200] bg-slate-900/65 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {editingTpId ? 'Edit Tujuan Pembelajaran' : 'Tambah Tujuan Pembelajaran'}
              </h3>
              <button type="button" onClick={() => setIsTpModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveTp} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Kode TP</label>
                  <input
                    type="text"
                    value={tpForm.kodeTp}
                    onChange={(e) => setTpForm({ ...tpForm, kodeTp: e.target.value })}
                    placeholder="INF-7.1"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Kelas/Jenjang</label>
                  <input
                    type="text"
                    value={tpForm.kelas}
                    onChange={(e) => setTpForm({ ...tpForm, kelas: e.target.value })}
                    placeholder="VII / 7A"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">KKM / KKTP</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={tpForm.kkm}
                    onChange={(e) => setTpForm({ ...tpForm, kkm: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Elemen</label>
                <select
                  value={tpForm.elemen}
                  onChange={(e) => setTpForm({ ...tpForm, elemen: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                >
                  {ELEMEN_INFORMATIKA_LIST.map((el) => (
                    <option key={el} value={el}>{el}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Tautkan ke Modul Materi</label>
                <select
                  value={tpForm.materiId}
                  onChange={(e) => setTpForm({ ...tpForm, materiId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                >
                  <option value="">-- Opsional --</option>
                  {COURSES.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Deskripsi Tujuan Pembelajaran</label>
                <textarea
                  rows={3}
                  value={tpForm.deskripsi}
                  onChange={(e) => setTpForm({ ...tpForm, deskripsi: e.target.value })}
                  placeholder="Peserta didik mampu..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Indikator Ketercapaian</label>
                <input
                  type="text"
                  value={tpForm.indikator}
                  onChange={(e) => setTpForm({ ...tpForm, indikator: e.target.value })}
                  placeholder="Siswa mampu menyelesaikan studi kasus..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                  Penilaian pada Input Nilai Sumatif
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tpForm.isSumatif}
                      onChange={(e) => setTpForm({ ...tpForm, isSumatif: e.target.checked })}
                      className="w-4 h-4 rounded accent-brand cursor-pointer"
                    />
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                      Sumatif
                    </span>
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tpForm.isPraktikum}
                      onChange={(e) => setTpForm({ ...tpForm, isPraktikum: e.target.checked })}
                      className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                    />
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                      Praktikum
                    </span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsTpModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-brand text-white text-xs font-extrabold">
                  Simpan TP
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {typeof document !== 'undefined' && isAgendaModalOpen && createPortal(
        <div className="fixed inset-0 z-[200] bg-slate-900/65 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {editingAgendaId ? 'Edit Agenda Harian' : 'Catat Agenda Harian'}
              </h3>
              <button type="button" onClick={() => setIsAgendaModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveAgenda} className="space-y-3.5">
              {/* Jenis Kegiatan */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Jenis Kegiatan
                </label>
                <select
                  value={agendaForm.jenisKegiatan}
                  onChange={(e) => setAgendaForm({ ...agendaForm, jenisKegiatan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                >
                  {JENIS_KEGIATAN_LIST.map((jk) => (
                    <option key={jk} value={jk}>{jk}</option>
                  ))}
                </select>
              </div>

              {/* Tanggal & Hari */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Tanggal Pelaksanaan
                    </label>
                    <span className="text-[11px] font-extrabold text-brand dark:text-blue-400">
                      Hari: {getHariFromDate(agendaForm.tanggal)}
                    </span>
                  </div>
                  <input
                    type="date"
                    value={agendaForm.tanggal}
                    onChange={(e) => {
                      const nextDate = e.target.value;
                      const nextHari = getHariFromDate(nextDate);
                      // Suggest schedule if currently none or for matching day
                      const matching =
                        jadwalList.find(
                          (j) => !j.isBreak && j.hari === nextHari && (!agendaForm.kelas || j.kelas === agendaForm.kelas)
                        ) ||
                        jadwalList.find((j) => !j.isBreak && j.hari === nextHari);

                      setAgendaForm((prev) => ({
                        ...prev,
                        tanggal: nextDate,
                        hari: nextHari,
                        ...(matching
                          ? {
                              jadwalId: matching.id,
                              kelas: matching.kelas,
                              jamKe: matching.jamKe,
                              waktuMulai: matching.waktuMulai,
                              waktuSelesai: matching.waktuSelesai,
                              mataPelajaran: matching.mataPelajaran || 'Informatika',
                            }
                          : {}),
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Pertemuan Ke-
                  </label>
                  <input
                    type="text"
                    value={agendaForm.pertemuanKe}
                    onChange={(e) => setAgendaForm({ ...agendaForm, pertemuanKe: e.target.value })}
                    placeholder="1"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>
              </div>

              {/* Acuan Jadwal Pelajaran */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                    <BookOpenCheck size={14} className="text-brand dark:text-blue-400" />
                    Acuan Jadwal Pelajaran
                  </label>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {jadwalList.filter((j) => !j.isBreak).length} Jadwal Tersedia
                  </span>
                </div>
                <select
                  value={agendaForm.jadwalId}
                  onChange={(e) => {
                    const jId = e.target.value;
                    if (jId === 'custom' || !jId) {
                      setAgendaForm((prev) => ({
                        ...prev,
                        jadwalId: '',
                      }));
                      return;
                    }
                    const found = jadwalList.find((j) => j.id === jId);
                    if (found) {
                      const classCount = agendaList.filter((a) => a.kelas === found.kelas).length;
                      setAgendaForm((prev) => ({
                        ...prev,
                        jadwalId: found.id,
                        hari: found.hari,
                        kelas: found.kelas,
                        jamKe: found.jamKe,
                        waktuMulai: found.waktuMulai,
                        waktuSelesai: found.waktuSelesai,
                        mataPelajaran: found.mataPelajaran || 'Informatika',
                        pertemuanKe: String(classCount + 1),
                      }));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700/80 text-xs font-bold text-slate-800 dark:text-slate-100"
                >
                  <option value="">-- Pilih dari Jadwal Pelajaran --</option>
                  <optgroup label={`Jadwal Hari ${getHariFromDate(agendaForm.tanggal)} (Sesuai Tanggal)`}>
                    {jadwalList
                      .filter((j) => !j.isBreak && j.hari === getHariFromDate(agendaForm.tanggal))
                      .map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.hari} · Jam {j.jamKe} ({j.waktuMulai}-{j.waktuSelesai}) · KELAS {j.kelas} · {j.mataPelajaran}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Jadwal Hari Lainnya">
                    {jadwalList
                      .filter((j) => !j.isBreak && j.hari !== getHariFromDate(agendaForm.tanggal))
                      .map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.hari} · Jam {j.jamKe} ({j.waktuMulai}-{j.waktuSelesai}) · KELAS {j.kelas} · {j.mataPelajaran}
                        </option>
                      ))}
                  </optgroup>
                  <option value="custom">✏️ Jadwal Tambahan / Bebas (Tanpa Jadwal Rutin)</option>
                </select>

                {agendaForm.jadwalId && (
                  <div className="pt-1 flex items-center justify-between text-[11px] font-bold text-brand dark:text-blue-300">
                    <span className="flex items-center gap-1 truncate">
                      <Sparkles size={12} className="shrink-0" />
                      Terkoneksi: Hari {agendaForm.hari} · Jam {agendaForm.jamKe} ({agendaForm.waktuMulai} - {agendaForm.waktuSelesai})
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] uppercase font-black shrink-0">
                      Kelas {agendaForm.kelas}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Kelas (Opsional untuk Agenda Tambahan)
                </label>
                {classOptions.length > 0 ? (
                  <select
                    value={agendaForm.kelas}
                    onChange={(e) => {
                      const nextKelas = e.target.value;
                      setAgendaForm((prev) => ({
                        ...prev,
                        kelas: nextKelas,
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                  >
                    <option value="">-- Tanpa Kelas (Agenda Umum) --</option>
                    {classOptions.map((c) => (
                      <option key={c} value={c}>Kelas {c}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={agendaForm.kelas}
                    onChange={(e) => setAgendaForm({ ...agendaForm, kelas: e.target.value })}
                    placeholder="Kosongkan jika tanpa kelas..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Jam Ke- / Jam Pukul
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={agendaForm.jamKe}
                    onChange={(e) => {
                      const nextJam = e.target.value;
                      const range = parseSlotRange(nextJam);
                      const hasDigits = /\d/.test(nextJam) && range.from > 0;
                      const dayName = getHariFromDate(agendaForm.tanggal);
                      const times = hasDigits && nextJam.trim() !== '0'
                        ? getSlotRangeTimes(dayName, range.from, range.to)
                        : null;
                      setAgendaForm((prev) => ({
                        ...prev,
                        jamKe: nextJam,
                        ...(times ? { waktuMulai: times.mulai, waktuSelesai: times.selesai } : {}),
                      }));
                    }}
                    placeholder="0 atau 1-2"
                    className="w-24 px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-center"
                    title="Isi Jam ke- (contoh: 0, 1, 1-2) atau langsung atur jam pukul di kanan"
                  />
                  <input
                    type="time"
                    value={agendaForm.waktuMulai}
                    onChange={(e) => setAgendaForm({ ...agendaForm, waktuMulai: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-center"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="time"
                    value={agendaForm.waktuSelesai}
                    onChange={(e) => setAgendaForm({ ...agendaForm, waktuSelesai: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Tujuan Pembelajaran Terkait</label>
                <select
                  value={agendaForm.tpId}
                  onChange={(e) => setAgendaForm({ ...agendaForm, tpId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <option value="">-- Pilih TP (Kosong) --</option>
                  {tpList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.kodeTp} - {t.deskripsi.slice(0, 70)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Materi Pokok</label>
                <input
                  type="text"
                  value={agendaForm.materi}
                  onChange={(e) => setAgendaForm({ ...agendaForm, materi: e.target.value })}
                  placeholder="Topik yang diajarkan hari ini..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Ringkasan Kegiatan Pembelajaran</label>
                <textarea
                  rows={3}
                  value={agendaForm.kegiatan}
                  onChange={(e) => setAgendaForm({ ...agendaForm, kegiatan: e.target.value })}
                  placeholder="Pendahuluan, praktik lab, diskusi, penutup..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Catatan Refleksi / Tindak Lanjut</label>
                <input
                  type="text"
                  value={agendaForm.catatan}
                  onChange={(e) => setAgendaForm({ ...agendaForm, catatan: e.target.value })}
                  placeholder="Opsional..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsAgendaModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-brand text-white text-xs font-extrabold">
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {typeof document !== 'undefined' && isSumatifModalOpen && createPortal(
        <div className="fixed inset-0 z-[200] bg-slate-900/65 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Buat Penilaian Sumatif Baru
              </h3>
              <button type="button" onClick={() => setIsSumatifModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateSumatif} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Judul Penilaian</label>
                <input
                  type="text"
                  value={sumatifForm.judul}
                  onChange={(e) => setSumatifForm({ ...sumatifForm, judul: e.target.value })}
                  placeholder="Misal: Sumatif 1 / STS / SAS"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Kelas</label>
                  <select
                    value={sumatifForm.kelas}
                    onChange={(e) => setSumatifForm({ ...sumatifForm, kelas: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                    required
                  >
                    <option value="">Pilih Kelas</option>
                    {classOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Jenis</label>
                  <select
                    value={sumatifForm.jenis}
                    onChange={(e) => setSumatifForm({ ...sumatifForm, jenis: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  >
                    <option value="Sumatif Lingkup Materi">Sumatif Lingkup Materi</option>
                    <option value="Sumatif Tengah Semester">Sumatif Tengah Semester</option>
                    <option value="Sumatif Akhir Semester">Sumatif Akhir Semester</option>
                    <option value="Praktik">Praktik</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={sumatifForm.tanggal}
                    onChange={(e) => setSumatifForm({ ...sumatifForm, tanggal: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Bobot</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={sumatifForm.bobot}
                    onChange={(e) => setSumatifForm({ ...sumatifForm, bobot: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Tujuan Pembelajaran Terkait</label>
                <select
                  value={sumatifForm.tpId}
                  onChange={(e) => setSumatifForm({ ...sumatifForm, tpId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <option value="">-- Pilih TP (Opsional) --</option>
                  {tpList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.kodeTp} - {t.deskripsi.slice(0, 60)}...
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsSumatifModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-brand text-white text-xs font-extrabold">
                  Buat Penilaian
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
