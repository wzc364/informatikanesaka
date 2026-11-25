/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
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
  ELEMEN_INFORMATIKA_LIST,
  getHariFromDate,
  getPredikatFromScore,
  getTodayIsoDate,
  HARI_LIST,
  JadwalPelajaranItem,
  JadwalScheduleSettings,
  NilaiRaporEntry,
  NilaiSubTab,
  NilaiSumatifItem,
  normalizeJadwalScheduleSettings,
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

  const getSlotCardTheme = (slotNum: number) => {
    switch ((slotNum - 1) % 6) {
      case 0:
        return 'bg-gradient-to-br from-[#ef0a4f] via-[#e11d48] to-[#b91c4a] shadow-lg shadow-rose-950/25 ring-1 ring-white/15';
      case 1:
        return 'bg-gradient-to-br from-[#ea580c] via-[#d9480f] to-[#9a3412] shadow-lg shadow-orange-950/25 ring-1 ring-white/15';
      case 2:
        return 'bg-gradient-to-br from-[#059669] via-[#047857] to-[#064e3b] shadow-lg shadow-emerald-950/25 ring-1 ring-white/15';
      case 3:
        return 'bg-gradient-to-br from-[#c026d3] via-[#a21caf] to-[#6b21a8] shadow-lg shadow-purple-950/25 ring-1 ring-white/15';
      case 4:
        return 'bg-gradient-to-br from-[#2563eb] via-[#1d4ed8] to-[#1e3a8a] shadow-lg shadow-blue-950/25 ring-1 ring-white/15';
      default:
        return 'bg-gradient-to-br from-[#0891b2] via-[#0e7490] to-[#164e63] shadow-lg shadow-cyan-950/25 ring-1 ring-white/15';
    }
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
  }>({
    kodeTp: 'INF-7.1',
    kelas: 'VII',
    elemen: ELEMEN_INFORMATIKA_LIST[0],
    materiId: COURSES[0]?.id || '',
    deskripsi: '',
    indikator: '',
    kkm: 75,
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
    presetKelas?: string
  ) => {
    const today = presetDate || getTodayIsoDate();
    const dayName = getHariFromDate(today);

    let matchedJadwal: JadwalPelajaranItem | undefined = presetJadwal;
    if (!matchedJadwal) {
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

    const defaultKelas = presetKelas || matchedJadwal?.kelas || classOptions[0] || '';
    const classExistingCount = agendaList.filter((a) => a.kelas === defaultKelas).length;
    const totalClass = defaultKelas ? (studentsByClass[defaultKelas]?.length || 0) : 0;
    const att = defaultKelas ? findAttendanceCounts(defaultKelas, today, matchedJadwal?.id) : null;

    setEditingAgendaId(null);
    setAgendaForm({
      tanggal: today,
      jadwalId: matchedJadwal?.id || '',
      hari: matchedJadwal?.hari || dayName,
      kelas: defaultKelas,
      jamKe: matchedJadwal?.jamKe || '1',
      waktuMulai: matchedJadwal?.waktuMulai || '07:30',
      waktuSelesai: matchedJadwal?.waktuSelesai || '08:50',
      mataPelajaran: matchedJadwal?.mataPelajaran || 'Informatika',
      pertemuanKe: String(classExistingCount + 1),
      tpId: tpList[0]?.id || '',
      materi: '',
      kegiatan: '',
      catatan: '',
      hadirCount: att ? att.H : totalClass,
      sakitCount: att ? att.S : 0,
      izinCount: att ? att.I : 0,
      alpaCount: att ? att.A : 0,
    });
    setIsAgendaModalOpen(true);
  };

  const openEditAgendaModal = (item: AgendaHarianItem) => {
    setEditingAgendaId(item.id);
    setAgendaForm({
      tanggal: item.tanggal,
      jadwalId: item.jadwalId || '',
      hari: item.hari || getHariFromDate(item.tanggal),
      kelas: item.kelas,
      jamKe: item.jamKe || '',
      waktuMulai: item.waktuMulai || '',
      waktuSelesai: item.waktuSelesai || '',
      mataPelajaran: item.mataPelajaran || 'Informatika',
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
    if (!agendaForm.kelas.trim() || !agendaForm.tanggal || !agendaForm.materi.trim()) {
      showNotice('error', 'Tanggal, Kelas, dan Materi pokok wajib diisi.');
      return;
    }
    const linkedTp = tpList.find((t) => t.id === agendaForm.tpId);
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
      tpId: linkedTp?.id || '',
      tpKode: linkedTp?.kodeTp || '',
      materi: agendaForm.materi.trim(),
      kegiatan: agendaForm.kegiatan.trim(),
      catatan: agendaForm.catatan.trim(),
      hadirCount: Number(agendaForm.hadirCount) || 0,
      sakitCount: Number(agendaForm.sakitCount) || 0,
      izinCount: Number(agendaForm.izinCount) || 0,
      alpaCount: Number(agendaForm.alpaCount) || 0,
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
        // Set active in absensi so teacher can immediately take attendance if needed
        setSelectedAgendaId(newDocRef.id);
        setAbsensiClass(payload.kelas);
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

  // ============================================================================
  // 4. ABSENSI SISWA STATE (Tergantung pada Agenda Harian yang Dicatat)
  // ============================================================================
  const [absensiClass, setAbsensiClass] = useState<string>('');
  const [selectedAgendaId, setSelectedAgendaId] = useState<string>('');
  const [absensiMode, setAbsensiMode] = useState<'input' | 'rekap'>('input');
  const [absensiDraft, setAbsensiDraft] = useState<Record<string, AbsensiStudentEntry>>({});
  const [isSavingAbsensi, setIsSavingAbsensi] = useState(false);

  // Sync selected class when classOptions change
  useEffect(() => {
    if (classOptions.length === 0) {
      setAbsensiClass('');
    } else if (!absensiClass || !classOptions.includes(absensiClass)) {
      setAbsensiClass(classOptions[0]);
    }
  }, [classOptions, absensiClass]);

  // All recorded agendas for the currently selected class
  const classAgendas = useMemo(
    () =>
      agendaList
        .filter((a) => a.kelas === absensiClass)
        .sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || '')),
    [agendaList, absensiClass]
  );

  // Sync selectedAgendaId when classAgendas change
  useEffect(() => {
    if (classAgendas.length === 0) {
      setSelectedAgendaId('');
    } else if (!selectedAgendaId || !classAgendas.some((a) => a.id === selectedAgendaId)) {
      // Pick the newest or first agenda of this class
      setSelectedAgendaId(classAgendas[0].id);
    }
  }, [classAgendas, selectedAgendaId]);

  const selectedAgenda = useMemo(
    () => classAgendas.find((a) => a.id === selectedAgendaId) || null,
    [classAgendas, selectedAgendaId]
  );

  const absensiClassStudents = useMemo(
    () => (absensiClass ? studentsByClass[absensiClass] || [] : []),
    [absensiClass, studentsByClass]
  );

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

  const classSumatifList = useMemo(
    () => sumatifList.filter((s) => !nilaiClass || s.kelas === nilaiClass),
    [sumatifList, nilaiClass]
  );

  const [selectedSumatifId, setSelectedSumatifId] = useState<string>('');
  useEffect(() => {
    if (classSumatifList.length === 0) {
      setSelectedSumatifId('');
    } else if (!selectedSumatifId || !classSumatifList.some((s) => s.id === selectedSumatifId)) {
      setSelectedSumatifId(classSumatifList[0].id);
    }
  }, [classSumatifList, selectedSumatifId]);

  const activeSumatif = useMemo(
    () => classSumatifList.find((s) => s.id === selectedSumatifId) || null,
    [classSumatifList, selectedSumatifId]
  );

  const [sumatifScoresDraft, setSumatifScoresDraft] = useState<Record<string, string>>({});
  const [sumatifNotesDraft, setSumatifNotesDraft] = useState<Record<string, string>>({});
  const [isSavingSumatifScores, setIsSavingSumatifScores] = useState(false);

  useEffect(() => {
    if (!activeSumatif) {
      setSumatifScoresDraft({});
      setSumatifNotesDraft({});
      return;
    }
    const nextScores: Record<string, string> = {};
    const nextNotes: Record<string, string> = {};
    nilaiClassStudents.forEach((s) => {
      const val = activeSumatif.scores?.[s.id];
      nextScores[s.id] = val !== undefined && val !== null ? String(val) : '';
      nextNotes[s.id] = activeSumatif.notes?.[s.id] || '';
    });
    setSumatifScoresDraft(nextScores);
    setSumatifNotesDraft(nextNotes);
  }, [activeSumatif, nilaiClassStudents]);

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

  const openNewSumatifModal = () => {
    setSumatifForm({
      judul: `Sumatif ${classSumatifList.length + 1}`,
      jenis: 'Sumatif Lingkup Materi',
      kelas: nilaiClass || classOptions[0] || '',
      tanggal: getTodayIsoDate(),
      tpId: tpList[0]?.id || '',
      bobot: 1,
    });
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
      const ref = await addDoc(collection(db, 'nilai_sumatif'), {
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
      setSelectedSumatifId(ref.id);
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
      showNotice('success', 'Penilaian sumatif dihapus.');
    } catch (err) {
      onFirestoreError?.(err, 'delete', `nilai_sumatif/${id}`);
    }
  };

  const handleImportAssessmentsToSumatif = () => {
    if (!activeSumatif) return;
    let filled = 0;
    const next = { ...sumatifScoresDraft };
    nilaiClassStudents.forEach((s) => {
      const stat = studentAssessmentAvg[s.id];
      if (stat && stat.count > 0) {
        next[s.id] = String(stat.avg);
        filled++;
      }
    });
    setSumatifScoresDraft(next);
    showNotice(
      filled > 0 ? 'success' : 'info',
      filled > 0
        ? `Mengisi ${filled} nilai siswa dari rata-rata Materi & Soal semester ini. Klik Simpan untuk menerapkan.`
        : 'Belum ada skor Materi/Soal siswa di kelas ini pada semester aktif.'
    );
  };

  const handleSaveSumatifScores = async () => {
    if (!activeSumatif) return;
    setIsSavingSumatifScores(true);
    const cleanScores: Record<string, number> = {};
    const cleanNotes: Record<string, string> = {};
    nilaiClassStudents.forEach((s) => {
      const raw = (sumatifScoresDraft[s.id] || '').trim();
      if (raw !== '') {
        const num = Math.max(0, Math.min(100, Number(raw)));
        if (!Number.isNaN(num)) {
          cleanScores[s.id] = Math.round(num);
        }
      }
      const note = (sumatifNotesDraft[s.id] || '').trim();
      if (note) cleanNotes[s.id] = note;
    });

    try {
      await updateDoc(doc(db, 'nilai_sumatif', activeSumatif.id), {
        scores: cleanScores,
        notes: cleanNotes,
        updatedAt: new Date().toISOString(),
      });
      showNotice('success', `Nilai "${activeSumatif.judul}" berhasil disimpan.`);
    } catch (err) {
      onFirestoreError?.(err, 'update', `nilai_sumatif/${activeSumatif.id}`);
      showNotice('error', 'Gagal menyimpan nilai sumatif.');
    } finally {
      setIsSavingSumatifScores(false);
    }
  };

  // ============================================================================
  // 5B. NILAI RAPOR STATE
  // ============================================================================
  type RaporDraftRow = {
    nilaiFormatif: number;
    nilaiSumatif: number;
    nilaiProyek: number;
    nilaiAkhir: number;
    capaianKompetensi: string;
    catatanGuru: string;
    isFinalized: boolean;
  };

  const [raporDraft, setRaporDraft] = useState<Record<string, RaporDraftRow>>({});
  const [isSavingRapor, setIsSavingRapor] = useState(false);

  const buildSuggestedCapaian = (studentName: string, score: number, kelas: string) => {
    const classTps = tpList.filter(
      (t) =>
        t.kelas === 'Semua' ||
        kelas.toUpperCase().startsWith(t.kelas.toUpperCase()) ||
        (t.kelas === 'VII' && kelas.startsWith('7')) ||
        (t.kelas === 'VIII' && kelas.startsWith('8')) ||
        (t.kelas === 'IX' && kelas.startsWith('9'))
    );
    const sampleTp = (classTps[0] || tpList[0])?.deskripsi || 'konsep dasar Informatika dan berpikir komputasional';
    if (score >= 90) {
      return `Sangat baik dalam memahami dan menerapkan ${sampleTp.toLowerCase()}`;
    }
    if (score >= 80) {
      return `Baik dalam menguasai ${sampleTp.toLowerCase()}`;
    }
    if (score >= 70) {
      return `Cukup memahami ${sampleTp.toLowerCase()}, perlu pendalaman latihan mandiri.`;
    }
    return `${studentName} memerlukan bimbingan lanjutan pada ${sampleTp.toLowerCase()}`;
  };

  useEffect(() => {
    const next: Record<string, RaporDraftRow> = {};
    nilaiClassStudents.forEach((s) => {
      const saved = raporList.find((r) => r.studentId === s.id);
      if (saved) {
        next[s.id] = {
          nilaiFormatif: Number(saved.nilaiFormatif || 0),
          nilaiSumatif: Number(saved.nilaiSumatif || 0),
          nilaiProyek: Number(saved.nilaiProyek || 0),
          nilaiAkhir: Number(saved.nilaiAkhir || 0),
          capaianKompetensi: saved.capaianKompetensi || '',
          catatanGuru: saved.catatanGuru || '',
          isFinalized: Boolean(saved.isFinalized),
        };
      } else {
        const formatifAuto = studentAssessmentAvg[s.id]?.avg || 0;
        const sumatifAuto = studentSumatifStats[s.id]?.avg || 0;
        const proyekAuto = formatifAuto || sumatifAuto ? Math.round((formatifAuto + sumatifAuto) / (formatifAuto && sumatifAuto ? 2 : 1)) : 0;
        const akhir = Math.round(formatifAuto * 0.3 + sumatifAuto * 0.5 + proyekAuto * 0.2);
        next[s.id] = {
          nilaiFormatif: formatifAuto,
          nilaiSumatif: sumatifAuto,
          nilaiProyek: proyekAuto,
          nilaiAkhir: akhir,
          capaianKompetensi: akhir > 0 ? buildSuggestedCapaian(s.nama, akhir, s.kelas) : '',
          catatanGuru: '',
          isFinalized: false,
        };
      }
    });
    setRaporDraft(next);
  }, [nilaiClassStudents, raporList, studentAssessmentAvg, studentSumatifStats, tpList]);

  const updateRaporField = (
    studentId: string,
    field: keyof RaporDraftRow,
    value: string | number | boolean
  ) => {
    setRaporDraft((prev) => {
      const cur = prev[studentId] || {
        nilaiFormatif: 0,
        nilaiSumatif: 0,
        nilaiProyek: 0,
        nilaiAkhir: 0,
        capaianKompetensi: '',
        catatanGuru: '',
        isFinalized: false,
      };
      const updated = { ...cur, [field]: value };
      if (field === 'nilaiFormatif' || field === 'nilaiSumatif' || field === 'nilaiProyek') {
        const f = Math.max(0, Math.min(100, Number(updated.nilaiFormatif) || 0));
        const su = Math.max(0, Math.min(100, Number(updated.nilaiSumatif) || 0));
        const p = Math.max(0, Math.min(100, Number(updated.nilaiProyek) || 0));
        updated.nilaiAkhir = Math.round(f * 0.3 + su * 0.5 + p * 0.2);
      }
      return { ...prev, [studentId]: updated };
    });
  };

  const syncAllRaporFromSources = () => {
    const next: Record<string, RaporDraftRow> = {};
    nilaiClassStudents.forEach((s) => {
      const f = studentAssessmentAvg[s.id]?.avg || 0;
      const su = studentSumatifStats[s.id]?.avg || 0;
      const prevProyek = raporDraft[s.id]?.nilaiProyek;
      const p = prevProyek && prevProyek > 0 ? prevProyek : (f || su ? Math.round((f + su) / (f && su ? 2 : 1)) : 0);
      const akhir = Math.round(f * 0.3 + su * 0.5 + p * 0.2);
      next[s.id] = {
        nilaiFormatif: f,
        nilaiSumatif: su,
        nilaiProyek: p,
        nilaiAkhir: akhir,
        capaianKompetensi:
          raporDraft[s.id]?.capaianKompetensi ||
          (akhir > 0 ? buildSuggestedCapaian(s.nama, akhir, s.kelas) : ''),
        catatanGuru: raporDraft[s.id]?.catatanGuru || '',
        isFinalized: raporDraft[s.id]?.isFinalized || false,
      };
    });
    setRaporDraft(next);
    showNotice('success', 'Nilai Rapor disinkronkan dari Nilai Sumatif, Materi/Soal, dan Tujuan Pembelajaran.');
  };

  const handleSaveAllRapor = async () => {
    if (!nilaiClass || nilaiClassStudents.length === 0) return;
    setIsSavingRapor(true);
    try {
      const now = new Date().toISOString();
      await Promise.all(
        nilaiClassStudents.map((s) => {
          const row = raporDraft[s.id];
          if (!row) return Promise.resolve();
          const docId = `${slugifyTermPart(activeTahunPelajaran)}__${activeSemester}__${slugifyTermPart(s.id)}`;
          const nilaiAkhir = Math.max(0, Math.min(100, Math.round(Number(row.nilaiAkhir) || 0)));
          return setDoc(doc(db, 'nilai_rapor', docId), {
            tahunPelajaran: activeTahunPelajaran,
            semester: activeSemester,
            studentId: s.id,
            studentNis: s.nis,
            studentName: s.nama,
            kelas: s.kelas,
            nilaiFormatif: Math.round(Number(row.nilaiFormatif) || 0),
            nilaiSumatif: Math.round(Number(row.nilaiSumatif) || 0),
            nilaiProyek: Math.round(Number(row.nilaiProyek) || 0),
            nilaiAkhir,
            predikat: getPredikatFromScore(nilaiAkhir),
            capaianKompetensi: row.capaianKompetensi || '',
            catatanGuru: row.catatanGuru || '',
            isFinalized: Boolean(row.isFinalized),
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
      'Nilai Formatif',
      'Nilai Sumatif',
      'Nilai Proyek',
      'Nilai Akhir Rapor',
      'Predikat',
      'Capaian Kompetensi',
      'Catatan Guru',
    ];
    const rows = nilaiClassStudents.map((s, idx) => {
      const row = raporDraft[s.id];
      const att = studentAttendanceRecap[s.id] || { H: 0, S: 0, I: 0, A: 0 };
      const akhir = row?.nilaiAkhir ?? 0;
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
        row?.nilaiFormatif ?? 0,
        row?.nilaiSumatif ?? 0,
        row?.nilaiProyek ?? 0,
        akhir,
        getPredikatFromScore(akhir),
        row?.capaianKompetensi || '',
        row?.catatanGuru || '',
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
                    (max, item) => Math.max(max, parseSlotNumber(item.jamKe)),
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
                      .filter((l) => parseSlotNumber(l.jamKe) === slotNum)
                      .sort((a, b) => (a.waktuMulai || '').localeCompare(b.waktuMulai || ''));
                    const computedSlot = computedSchedule.slots[slotNum];
                    const slotTime = slotItems[0]?.waktuMulai || computedSlot?.mulai || dayCfg.startTime;

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
                            const coveringItem = lessons.find((l) => {
                              const r = parseSlotRange(l.jamKe);
                              return r.from < slotNum && slotNum <= r.to;
                            });

                            if (coveringItem) {
                              return (
                                <div
                                  key={slotKey}
                                  onClick={() => openEditJadwalModal(coveringItem)}
                                  className="rounded-2xl border border-dashed border-slate-300/80 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/35 py-3 px-3.5 flex items-center justify-between gap-2 cursor-pointer hover:border-brand/60 dark:hover:border-blue-400/60 transition-colors shadow-2xs group"
                                  title={`Slot ini termasuk dalam jadwal Jam ${coveringItem.jamKe} (Kelas ${coveringItem.kelas}) - Klik untuk edit`}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand dark:bg-blue-400 shrink-0" />
                                    <span className="text-[10px] font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase truncate">
                                      JAM {slotNum} · Lanjutan KELAS {coveringItem.kelas}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tabular-nums shrink-0 font-mono">
                                    {defTimes.mulai} - {defTimes.selesai}
                                  </span>
                                </div>
                              );
                            }

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
                              {items.map((item) => (
                                <div
                                  key={item.id}
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
                                  className={`rounded-2xl p-4 text-white relative group cursor-grab active:cursor-grabbing transition-all duration-200 hover:-translate-y-0.5 ${getSlotCardTheme(
                                    slotNum
                                  )} ${
                                    isDragTarget && draggedJadwalId !== item.id
                                      ? 'ring-2 ring-white scale-[1.01]'
                                      : ''
                                  } ${draggedJadwalId === item.id ? 'opacity-60' : ''}`}
                                  title="Seret untuk pindah/tukar slot atau klik untuk edit"
                                >
                                  {/* Top Row: Grip + JAM badge + Quick Actions */}
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <GripVertical
                                        size={14}
                                        className="text-white/65 shrink-0"
                                      />
                                      <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-black tracking-wider uppercase text-white">
                                        JAM {item.jamKe || slotNum}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-85 md:opacity-0 group-hover:opacity-100 transition-opacity">
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
                                      {item.waktuMulai} - {item.waktuSelesai}
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
                              ))}
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
                    {linkedCourse && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <GraduationCap size={13} className="text-brand dark:text-blue-400" />
                        <span>Materi Terkait: {linkedCourse.title}</span>
                      </div>
                    )}
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
      {/* TAB 3: AGENDA HARIAN                                                  */}
      {/* ===================================================================== */}
      {subTab === 'agenda' && (
        <div className="space-y-5">
          <div className="admin-glass-card rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
            </div>
            <button
              type="button"
              onClick={() => openNewAgendaModal()}
              className="px-4 py-2.5 rounded-xl bg-brand hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer w-fit"
            >
              <Plus size={15} />
              Catat Agenda Harian
            </button>
          </div>

          <div className="admin-glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[820px]">
                <thead>
                  <tr className="bg-white/30 dark:bg-white/5 border-b border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 text-[10px] uppercase font-extrabold tracking-widest">
                    <th className="p-4">Tanggal & Pertemuan</th>
                    <th className="p-4">Kelas</th>
                    <th className="p-4">TP & Materi Pokok</th>
                    <th className="p-4">Kegiatan & Catatan</th>
                    <th className="p-4 text-center">Kehadiran (H/S/I/A)</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAgenda.length > 0 ? (
                    filteredAgenda.map((ag) => (
                      <tr key={ag.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors align-top">
                        <td className="p-4 text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums whitespace-nowrap">
                          <div>{ag.tanggal}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            Pertemuan ke-{ag.pertemuanKe}
                          </div>
                          <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-brand dark:text-blue-400">
                            <Clock size={11} />
                            {ag.hari || getHariFromDate(ag.tanggal)} {ag.jamKe ? `· Jam ${ag.jamKe}` : ''}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-800 dark:text-slate-200">
                            {ag.kelas}
                          </span>
                        </td>
                        <td className="p-4 max-w-xs">
                          <div className="flex flex-wrap items-center gap-1 mb-1">
                            {ag.tpKode && (
                              <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-black font-mono">
                                {ag.tpKode}
                              </span>
                            )}
                            {ag.mataPelajaran && (
                              <span className="inline-block px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                {ag.mataPelajaran}
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {ag.materi}
                          </div>
                        </td>
                        <td className="p-4 max-w-sm text-xs text-slate-700 dark:text-slate-300 space-y-1">
                          <p>{ag.kegiatan || '-'}</p>
                          {ag.catatan && (
                            <p className="text-[11px] text-amber-700 dark:text-amber-300 italic">
                              Catatan: {ag.catatan}
                            </p>
                          )}
                        </td>
                        <td className="p-4 text-center whitespace-nowrap">
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
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openEditAgendaModal(ag)}
                            className="p-2 rounded-lg text-slate-500 hover:text-brand hover:bg-brand/10 mr-1"
                            title="Edit Agenda"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAgenda(ag.id)}
                            className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                            title="Hapus Agenda"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400 dark:text-slate-500 text-sm font-semibold">
                        Belum ada agenda harian pada TA {activeTahunPelajaran} Semester {activeSemester}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: ABSENSI SISWA                                                  */}
      {/* ===================================================================== */}
      {subTab === 'absensi' && (
        <div className="space-y-5">
          <div className="admin-glass-card rounded-2xl p-4 md:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Pilih Kelas
                </label>
                <select
                  value={absensiClass}
                  onChange={(e) => setAbsensiClass(e.target.value)}
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

              {absensiMode === 'input' && classAgendas.length > 0 && (
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Pilih Agenda Harian (Pertemuan Mengajar)
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedAgendaId}
                      onChange={(e) => setSelectedAgendaId(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-800 dark:text-slate-100"
                    >
                      {classAgendas.map((ag) => {
                        const attended = isAgendaAttended(ag.id, ag.kelas, ag.tanggal);
                        return (
                          <option key={ag.id} value={ag.id}>
                            {attended ? '✅' : '⚠️'} Pertemuan ke-{ag.pertemuanKe} ({ag.tanggal}) · Jam {ag.jamKe || '-'} · {ag.materi.slice(0, 45)}
                          </option>
                        );
                      })}
                    </select>
                    <button
                      type="button"
                      onClick={() => openNewAgendaModal(undefined, undefined, absensiClass)}
                      className="px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand/10 hover:text-brand border border-slate-200 dark:border-slate-700 text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                      title="Catat Agenda Harian baru untuk kelas ini"
                    >
                      <Plus size={14} />
                      <span className="hidden sm:inline">Agenda Baru</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setAbsensiMode('input')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
                    absensiMode === 'input'
                      ? 'bg-brand text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Input Per Agenda
                </button>
                <button
                  type="button"
                  onClick={() => setAbsensiMode('rekap')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
                    absensiMode === 'rekap'
                      ? 'bg-brand text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Rekap Semester
                </button>
              </div>

              {absensiMode === 'input' && selectedAgenda && absensiClassStudents.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={setAllPresent}
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-extrabold hover:bg-emerald-100 cursor-pointer"
                  >
                    Semua Hadir
                  </button>
                  <button
                    type="button"
                    disabled={isSavingAbsensi}
                    onClick={handleSaveAbsensi}
                    className="px-4 py-2 rounded-xl bg-brand hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <Save size={14} />
                    {isSavingAbsensi ? 'Menyimpan...' : 'Simpan Absensi'}
                  </button>
                </>
              )}
            </div>
          </div>

          {absensiMode === 'input' ? (
            classAgendas.length === 0 ? (
              <div className="admin-glass-card rounded-2xl p-8 md:p-10 text-center max-w-xl mx-auto space-y-4 my-4">
                <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                  <CalendarClock size={32} />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Belum Ada Agenda Harian untuk Kelas {absensiClass || '-'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Sesuai alur administrasi guru, pencatatan absensi siswa dilakukan berdasarkan Agenda Harian (pertemuan tatap muka pembelajaran). Silakan catat agenda mengajar terlebih dahulu agar absensi terhubung dengan materi pokok dan jadwal pelajaran.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openNewAgendaModal(undefined, undefined, absensiClass)}
                  className="px-5 py-2.5 rounded-xl bg-brand hover:bg-blue-700 text-white text-xs font-extrabold inline-flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Plus size={15} />
                  Catat Agenda Harian Kelas {absensiClass}
                </button>
              </div>
            ) : selectedAgenda ? (
              <div className="space-y-4">
                {/* Agenda Context Card */}
                <div className="admin-glass-card rounded-2xl p-4 md:p-5 border-l-4 border-l-brand space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-xl bg-brand text-white text-xs font-black">
                        PERTEMUAN KE-{selectedAgenda.pertemuanKe}
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        {selectedAgenda.hari || getHariFromDate(selectedAgenda.tanggal)}, {selectedAgenda.tanggal}
                      </span>
                      {selectedAgenda.jamKe && (
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                          <Clock size={13} className="text-slate-400" />
                          Jam {selectedAgenda.jamKe} ({selectedAgenda.waktuMulai} - {selectedAgenda.waktuSelesai})
                        </span>
                      )}
                      {selectedAgenda.mataPelajaran && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          {selectedAgenda.mataPelajaran}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                          absensiDocExists
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {absensiDocExists ? '● Absensi Tersimpan' : '○ Belum Diabsen (Draft)'}
                      </span>
                      <button
                        type="button"
                        onClick={() => openEditAgendaModal(selectedAgenda)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand hover:bg-brand/10 transition-colors cursor-pointer"
                        title="Edit Rincian Agenda Ini"
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="block text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500">
                        Materi Pokok
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {selectedAgenda.materi}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500">
                        Tujuan Pembelajaran (TP)
                      </span>
                      <span className="font-bold text-indigo-700 dark:text-indigo-300">
                        {selectedAgenda.tpKode
                          ? `${selectedAgenda.tpKode} - ${tpList.find((t) => t.id === selectedAgenda.tpId)?.deskripsi || ''}`
                          : 'Belum dihubungkan ke TP spesifik'}
                      </span>
                    </div>
                    {selectedAgenda.kegiatan && (
                      <div className="md:col-span-2 text-slate-600 dark:text-slate-300">
                        <span className="block text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500">
                          Ringkasan Kegiatan
                        </span>
                        <p className="mt-0.5 text-xs">{selectedAgenda.kegiatan}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Attendance Table */}
                <div className="admin-glass-card rounded-2xl overflow-hidden">
                  {absensiClassStudents.length > 0 ? (
                    <>
                      <div className="px-5 py-3 bg-white/30 dark:bg-white/5 border-b border-white/40 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-800 dark:text-slate-100">
                            Presensi Siswa Kelas {absensiClass} · {absensiClassStudents.length} Siswa
                          </span>
                        </div>
                        <div className="flex items-center gap-2 tabular-nums">
                          <span className="text-emerald-700 dark:text-emerald-300">Hadir: {absensiDraftCounts.H}</span>
                          <span className="text-amber-700 dark:text-amber-300">Sakit: {absensiDraftCounts.S}</span>
                          <span className="text-blue-700 dark:text-blue-300">Izin: {absensiDraftCounts.I}</span>
                          <span className="text-rose-700 dark:text-rose-300">Alpa: {absensiDraftCounts.A}</span>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[680px]">
                          <thead>
                            <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/70 dark:border-slate-700 text-[10px] uppercase font-extrabold tracking-widest text-slate-500 dark:text-slate-400">
                              <th className="p-3.5 w-12">No</th>
                              <th className="p-3.5">NISN</th>
                              <th className="p-3.5">Nama Siswa</th>
                              <th className="p-3.5">Status Kehadiran</th>
                              <th className="p-3.5">Keterangan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {absensiClassStudents.map((s, idx) => {
                              const cur = absensiDraft[s.id]?.status || 'H';
                              return (
                                <tr key={s.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50">
                                  <td className="p-3.5 text-xs font-mono text-slate-400 tabular-nums">{idx + 1}</td>
                                  <td className="p-3.5 text-xs font-mono text-slate-600 dark:text-slate-400">{s.nis}</td>
                                  <td className="p-3.5">
                                    <button
                                      type="button"
                                      onClick={() => onOpenStudentDetail?.(s)}
                                      className="text-left text-sm font-extrabold text-slate-900 dark:text-white hover:text-brand dark:hover:text-blue-400 cursor-pointer"
                                    >
                                      {s.nama}
                                    </button>
                                  </td>
                                  <td className="p-3.5">
                                    <div className="inline-flex items-center gap-1.5">
                                      {(
                                        [
                                          { code: 'H', label: 'Hadir', cls: 'bg-emerald-600 text-white border-emerald-600' },
                                          { code: 'S', label: 'Sakit', cls: 'bg-amber-500 text-white border-amber-500' },
                                          { code: 'I', label: 'Izin', cls: 'bg-blue-600 text-white border-blue-600' },
                                          { code: 'A', label: 'Alpa', cls: 'bg-rose-600 text-white border-rose-600' },
                                        ] as const
                                      ).map((opt) => (
                                        <button
                                          key={opt.code}
                                          type="button"
                                          onClick={() => setStudentAttendance(s.id, opt.code)}
                                          className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                                            cur === opt.code
                                              ? opt.cls
                                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                                          }`}
                                          title={opt.label}
                                        >
                                          {opt.code}
                                        </button>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="p-3.5">
                                    <input
                                      type="text"
                                      value={absensiDraft[s.id]?.catatan || ''}
                                      onChange={(e) =>
                                        setAbsensiDraft((prev) => ({
                                          ...prev,
                                          [s.id]: { ...prev[s.id], status: cur, catatan: e.target.value },
                                        }))
                                      }
                                      placeholder="Catatan opsional..."
                                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-sm font-semibold">
                      Tidak ada siswa di kelas yang dipilih untuk Tahun Pelajaran {activeTahunPelajaran}.
                    </div>
                  )}
                </div>
              </div>
            ) : null
          ) : (
            <div className="admin-glass-card rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/40 dark:border-white/10 flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Rekap Absensi Kelas {absensiClass || '-'} · Semester {activeSemester} ({activeTahunPelajaran})
                </h4>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                  {absensiList.filter((a) => a.kelas === absensiClass).length} Pertemuan Tercatat
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[660px]">
                  <thead>
                    <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/70 dark:border-slate-700 text-[10px] uppercase font-extrabold tracking-widest text-slate-500 dark:text-slate-400">
                      <th className="p-3.5 w-12">No</th>
                      <th className="p-3.5">NISN</th>
                      <th className="p-3.5">Nama Siswa</th>
                      <th className="p-3.5 text-center">Hadir</th>
                      <th className="p-3.5 text-center">Sakit</th>
                      <th className="p-3.5 text-center">Izin</th>
                      <th className="p-3.5 text-center">Alpa</th>
                      <th className="p-3.5 text-center">% Kehadiran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {absensiClassStudents.length > 0 ? (
                      absensiClassStudents.map((s, idx) => {
                        const r = studentAttendanceRecap[s.id] || { H: 0, S: 0, I: 0, A: 0, total: 0 };
                        const pct = r.total > 0 ? Math.round((r.H / r.total) * 100) : 0;
                        return (
                          <tr key={s.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50">
                            <td className="p-3.5 text-xs font-mono text-slate-400 tabular-nums">{idx + 1}</td>
                            <td className="p-3.5 text-xs font-mono text-slate-500">{s.nis}</td>
                            <td className="p-3.5 text-sm font-extrabold text-slate-900 dark:text-white">
                              {s.nama}
                            </td>
                            <td className="p-3.5 text-center font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{r.H}</td>
                            <td className="p-3.5 text-center font-bold text-amber-700 dark:text-amber-400 tabular-nums">{r.S}</td>
                            <td className="p-3.5 text-center font-bold text-blue-700 dark:text-blue-400 tabular-nums">{r.I}</td>
                            <td className="p-3.5 text-center font-bold text-rose-700 dark:text-rose-400 tabular-nums">{r.A}</td>
                            <td className="p-3.5 text-center">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-800 dark:text-slate-100 tabular-nums">
                                {r.total > 0 ? `${pct}%` : '-'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-10 text-center text-slate-400 text-sm font-semibold">
                          Belum ada siswa pada kelas ini.
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
      {/* TAB 5: INPUT NILAI (NILAI SUMATIF & NILAI RAPOR)                      */}
      {/* ===================================================================== */}
      {subTab === 'nilai' && (
        <div className="space-y-5">
          {/* Inner switcher + Class Filter */}
          <div className="admin-glass-card rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="inline-flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
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

          {/* 5A. NILAI SUMATIF */}
          {nilaiSubTab === 'sumatif' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {classSumatifList.map((sum) => (
                    <div
                      key={sum.id}
                      className={`inline-flex items-center rounded-xl border text-xs font-extrabold transition-all ${
                        selectedSumatifId === sum.id
                          ? 'bg-brand text-white border-brand shadow-sm'
                          : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedSumatifId(sum.id)}
                        className="px-3.5 py-2 cursor-pointer"
                      >
                        {sum.judul}
                        {sum.tpKode ? ` (${sum.tpKode})` : ''}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSumatif(sum.id)}
                        className={`pr-2.5 pl-1 py-2 opacity-70 hover:opacity-100 cursor-pointer ${
                          selectedSumatifId === sum.id ? 'text-white' : 'text-rose-500'
                        }`}
                        title="Hapus Penilaian Sumatif"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={openNewSumatifModal}
                  className="px-4 py-2 rounded-xl bg-brand hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus size={14} />
                  Buat Penilaian Sumatif
                </button>
              </div>

              {activeSumatif ? (
                <div className="admin-glass-card rounded-2xl overflow-hidden">
                  <div className="p-4 md:p-5 border-b border-white/40 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {activeSumatif.judul} — Kelas {activeSumatif.kelas}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                          {activeSumatif.jenis}
                        </span>
                        {activeSumatif.tpKode && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-mono font-bold">
                            TP: {activeSumatif.tpKode}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                        Tanggal: {activeSumatif.tanggal} · Bobot: {activeSumatif.bobot}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleImportAssessmentsToSumatif}
                        className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-extrabold flex items-center gap-1.5 hover:bg-indigo-100 cursor-pointer"
                      >
                        <Sparkles size={13} />
                        Ambil Skor Materi/Soal
                      </button>
                      <button
                        type="button"
                        disabled={isSavingSumatifScores}
                        onClick={handleSaveSumatifScores}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        <Save size={14} />
                        {isSavingSumatifScores ? 'Menyimpan...' : 'Simpan Nilai'}
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[760px]">
                      <thead>
                        <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/70 dark:border-slate-700 text-[10px] uppercase font-extrabold tracking-widest text-slate-500 dark:text-slate-400">
                          <th className="p-3.5 w-12">No</th>
                          <th className="p-3.5">NISN</th>
                          <th className="p-3.5">Nama Siswa</th>
                          <th className="p-3.5 text-center">Ref. Materi/Soal</th>
                          <th className="p-3.5 w-32 text-center">Nilai (0–100)</th>
                          <th className="p-3.5 text-center">Predikat</th>
                          <th className="p-3.5">Catatan / Tindak Lanjut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {nilaiClassStudents.length > 0 ? (
                          nilaiClassStudents.map((s, idx) => {
                            const raw = sumatifScoresDraft[s.id] ?? '';
                            const numVal = raw === '' ? null : Number(raw);
                            const pred =
                              numVal !== null && !Number.isNaN(numVal)
                                ? getPredikatFromScore(numVal)
                                : '-';
                            const refStat = studentAssessmentAvg[s.id];
                            return (
                              <tr key={s.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50">
                                <td className="p-3.5 text-xs font-mono text-slate-400 tabular-nums">{idx + 1}</td>
                                <td className="p-3.5 text-xs font-mono text-slate-500">{s.nis}</td>
                                <td className="p-3.5">
                                  <button
                                    type="button"
                                    onClick={() => onOpenStudentDetail?.(s)}
                                    className="text-left text-sm font-extrabold text-slate-900 dark:text-white hover:text-brand dark:hover:text-blue-400 cursor-pointer"
                                  >
                                    {s.nama}
                                  </button>
                                </td>
                                <td className="p-3.5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                                  {refStat ? `${refStat.avg} (${refStat.count}x)` : '-'}
                                </td>
                                <td className="p-3.5 text-center">
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={raw}
                                    onChange={(e) =>
                                      setSumatifScoresDraft((prev) => ({
                                        ...prev,
                                        [s.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="0-100"
                                    className="w-24 text-center px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-extrabold text-slate-900 dark:text-white tabular-nums"
                                  />
                                </td>
                                <td className="p-3.5 text-center">
                                  <span
                                    className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                                      pred === 'A'
                                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                        : pred === 'B'
                                        ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                                        : pred === 'C'
                                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                        : pred === 'D'
                                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                    }`}
                                  >
                                    {pred}
                                  </span>
                                </td>
                                <td className="p-3.5">
                                  <input
                                    type="text"
                                    value={sumatifNotesDraft[s.id] || ''}
                                    onChange={(e) =>
                                      setSumatifNotesDraft((prev) => ({
                                        ...prev,
                                        [s.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Tuntas / Remidi..."
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                                  />
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={7} className="p-10 text-center text-slate-400 text-sm font-semibold">
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
                    Belum ada daftar penilaian sumatif untuk {nilaiClass ? `Kelas ${nilaiClass}` : 'kelas ini'} pada Semester {activeSemester}.
                  </p>
                  {nilaiClass && (
                    <button
                      type="button"
                      onClick={openNewSumatifModal}
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

          {/* 5B. NILAI RAPOR */}
          {nilaiSubTab === 'rapor' && (
            <div className="admin-glass-card rounded-2xl overflow-hidden">
              <div className="p-4 md:p-5 border-b border-white/40 dark:border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Input Nilai Rapor — Kelas {nilaiClass || '-'} (TA {activeTahunPelajaran} · Sem {activeSemester})
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Formula bobot otomatis: Formatif (30%) + Sumatif (50%) + Proyek/Praktik (20%). Terhubung ke Absensi & Tujuan Pembelajaran.
                  </p>
                </div>

                {nilaiClassStudents.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={syncAllRaporFromSources}
                      className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-extrabold flex items-center gap-1.5 hover:bg-indigo-100 cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      Sinkron Sumatif & Materi
                    </button>
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
                      disabled={isSavingRapor}
                      onClick={handleSaveAllRapor}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      <Save size={14} />
                      {isSavingRapor ? 'Menyimpan...' : 'Simpan Nilai Rapor'}
                    </button>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1050px]">
                  <thead>
                    <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/70 dark:border-slate-700 text-[10px] uppercase font-extrabold tracking-widest text-slate-500 dark:text-slate-400">
                      <th className="p-3 w-10">No</th>
                      <th className="p-3 min-w-[170px]">Siswa</th>
                      <th className="p-3 text-center">Absensi (H/S/I/A)</th>
                      <th className="p-3 text-center w-24">Formatif</th>
                      <th className="p-3 text-center w-24">Sumatif</th>
                      <th className="p-3 text-center w-24">Proyek</th>
                      <th className="p-3 text-center">Nilai Akhir</th>
                      <th className="p-3 text-center">Predikat</th>
                      <th className="p-3 min-w-[260px]">Capaian Kompetensi</th>
                      <th className="p-3 text-center">Final</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {nilaiClassStudents.length > 0 ? (
                      nilaiClassStudents.map((s, idx) => {
                        const row = raporDraft[s.id] || {
                          nilaiFormatif: 0,
                          nilaiSumatif: 0,
                          nilaiProyek: 0,
                          nilaiAkhir: 0,
                          capaianKompetensi: '',
                          catatanGuru: '',
                          isFinalized: false,
                        };
                        const att = studentAttendanceRecap[s.id] || { H: 0, S: 0, I: 0, A: 0, total: 0 };
                        const pred = getPredikatFromScore(row.nilaiAkhir);
                        return (
                          <tr key={s.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 align-top">
                            <td className="p-3 text-xs font-mono text-slate-400 tabular-nums">{idx + 1}</td>
                            <td className="p-3">
                              <button
                                type="button"
                                onClick={() => onOpenStudentDetail?.(s)}
                                className="text-left text-sm font-extrabold text-slate-900 dark:text-white hover:text-brand dark:hover:text-blue-400 cursor-pointer block"
                              >
                                {s.nama}
                              </button>
                              <span className="text-[11px] font-mono text-slate-400">NISN {s.nis}</span>
                            </td>
                            <td className="p-3 text-center whitespace-nowrap">
                              <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 tabular-nums">
                                {att.H}/{att.S}/{att.I}/{att.A}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={row.nilaiFormatif}
                                onChange={(e) =>
                                  updateRaporField(s.id, 'nilaiFormatif', Number(e.target.value))
                                }
                                className="w-18 text-center px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold tabular-nums"
                              />
                            </td>
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={row.nilaiSumatif}
                                onChange={(e) =>
                                  updateRaporField(s.id, 'nilaiSumatif', Number(e.target.value))
                                }
                                className="w-18 text-center px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold tabular-nums"
                              />
                            </td>
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={row.nilaiProyek}
                                onChange={(e) =>
                                  updateRaporField(s.id, 'nilaiProyek', Number(e.target.value))
                                }
                                className="w-18 text-center px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold tabular-nums"
                              />
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-2.5 py-1 rounded-lg bg-brand/10 dark:bg-blue-950/60 text-brand dark:text-blue-300 text-sm font-black tabular-nums">
                                {row.nilaiAkhir}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                                  pred === 'A'
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                    : pred === 'B'
                                    ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                                    : pred === 'C'
                                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                                }`}
                              >
                                {pred}
                              </span>
                            </td>
                            <td className="p-3">
                              <textarea
                                rows={2}
                                value={row.capaianKompetensi}
                                onChange={(e) =>
                                  updateRaporField(s.id, 'capaianKompetensi', e.target.value)
                                }
                                placeholder="Deskripsi capaian TP..."
                                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 resize-y"
                              />
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  updateRaporField(s.id, 'isFinalized', !row.isFinalized)
                                }
                                className={`w-8 h-8 rounded-lg inline-flex items-center justify-center border cursor-pointer transition-colors ${
                                  row.isFinalized
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                                }`}
                                title={row.isFinalized ? 'Sudah Final' : 'Tandai Final'}
                              >
                                <Check size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={10} className="p-10 text-center text-slate-400 text-sm font-semibold">
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
      {/* MODALS: JADWAL, TP, AGENDA, SUMATIF                                   */}
      {/* ===================================================================== */}
      {isJadwalModalOpen && (() => {
        const modalDayCfg = effectiveJadwalSettings.days[jadwalForm.hari] || effectiveJadwalSettings.days.Senin;
        const modalMaxSlots = Math.max(modalDayCfg.totalSlots, jadwalForm.sampaiJamKe, 12);
        const slotOptions = Array.from({ length: modalMaxSlots }, (_, i) => i + 1);

        return (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
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
      })()}

      {isTpModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
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
        </div>
      )}

      {isAgendaModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
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

                      const att = agendaForm.kelas
                        ? findAttendanceCounts(agendaForm.kelas, nextDate, matching?.id)
                        : null;

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
                        ...(att
                          ? { hadirCount: att.H, sakitCount: att.S, izinCount: att.I, alpaCount: att.A }
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
                      const totalStudents = studentsByClass[found.kelas]?.length || 0;
                      const att = findAttendanceCounts(found.kelas, agendaForm.tanggal, found.id);
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
                        hadirCount: att ? att.H : totalStudents,
                        sakitCount: 0,
                        izinCount: 0,
                        alpaCount: 0,
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

              {/* Kelas, Jam Ke, & Waktu */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Kelas
                  </label>
                  {classOptions.length > 0 ? (
                    <select
                      value={agendaForm.kelas}
                      onChange={(e) => {
                        const nextKelas = e.target.value;
                        const att = findAttendanceCounts(nextKelas, agendaForm.tanggal);
                        const total = studentsByClass[nextKelas]?.length || 0;
                        setAgendaForm((prev) => ({
                          ...prev,
                          kelas: nextKelas,
                          hadirCount: att ? att.H : total,
                          sakitCount: att ? att.S : 0,
                          izinCount: att ? att.I : 0,
                          alpaCount: att ? att.A : 0,
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
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
                      value={agendaForm.kelas}
                      onChange={(e) => setAgendaForm({ ...agendaForm, kelas: e.target.value })}
                      placeholder="9H"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Jam Ke-
                  </label>
                  <input
                    type="text"
                    value={agendaForm.jamKe}
                    onChange={(e) => setAgendaForm({ ...agendaForm, jamKe: e.target.value })}
                    placeholder="Contoh: 1-2"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Waktu Jam
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={agendaForm.waktuMulai}
                      onChange={(e) => setAgendaForm({ ...agendaForm, waktuMulai: e.target.value })}
                      placeholder="08:00"
                      className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-center"
                    />
                    <span className="text-slate-400 font-bold">-</span>
                    <input
                      type="text"
                      value={agendaForm.waktuSelesai}
                      onChange={(e) => setAgendaForm({ ...agendaForm, waktuSelesai: e.target.value })}
                      placeholder="09:20"
                      className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-center"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Tujuan Pembelajaran Terkait</label>
                <select
                  value={agendaForm.tpId}
                  onChange={(e) => setAgendaForm({ ...agendaForm, tpId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <option value="">-- Pilih TP (Opsional) --</option>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Ringkasan Kehadiran Siswa</label>
                  {agendaForm.kelas && agendaForm.tanggal && (
                    <button
                      type="button"
                      onClick={() => {
                        const att = findAttendanceCounts(agendaForm.kelas, agendaForm.tanggal);
                        if (att) {
                          setAgendaForm((prev) => ({
                            ...prev,
                            hadirCount: att.H,
                            sakitCount: att.S,
                            izinCount: att.I,
                            alpaCount: att.A,
                          }));
                        } else {
                          showNotice('info', 'Belum ada data absensi tersimpan untuk kelas & tanggal tersebut.');
                        }
                      }}
                      className="text-[11px] font-bold text-brand dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Ambil dari Absensi Tanggal Ini
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'hadirCount', label: 'Hadir' },
                    { key: 'sakitCount', label: 'Sakit' },
                    { key: 'izinCount', label: 'Izin' },
                    { key: 'alpaCount', label: 'Alpa' },
                  ].map((f) => (
                    <div key={f.key}>
                      <span className="block text-[10px] font-bold text-slate-500 mb-0.5">{f.label}</span>
                      <input
                        type="number"
                        min={0}
                        value={(agendaForm as any)[f.key]}
                        onChange={(e) =>
                          setAgendaForm({ ...agendaForm, [f.key]: Number(e.target.value) })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                      />
                    </div>
                  ))}
                </div>
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
        </div>
      )}

      {isSumatifModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
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
        </div>
      )}
    </div>
  );
}
