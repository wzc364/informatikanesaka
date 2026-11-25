/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SemesterType = 'Ganjil' | 'Genap';

export const DEFAULT_TAHUN_PELAJARAN = '2025/2026';
export const DEFAULT_SEMESTER: SemesterType = 'Ganjil';
export const DEFAULT_TAHUN_PELAJARAN_LIST: string[] = [
  '2024/2025',
  '2025/2026',
  '2026/2027',
  '2027/2028',
];

export type AdministrasiSubTab =
  | 'jadwal'
  | 'tp'
  | 'agenda'
  | 'absensi'
  | 'nilai';

export type NilaiSubTab = 'sumatif' | 'rapor';

export type AttendanceStatus = 'H' | 'S' | 'I' | 'A';

export interface ScopedStudent {
  id: string;
  nis: string;
  nama: string;
  jenisKelamin: string;
  kelas: string;
  tahunPelajaran?: string;
}

export interface JadwalDayConfig {
  startTime: string; // HH:MM for Jam 1
  totalSlots: number; // number of lesson periods
  break1AfterSlot: number; // 0 = disabled, else after jam ke-N
  break2AfterSlot: number; // 0 = disabled, else after jam ke-N
}

export interface JadwalScheduleSettings {
  lessonDurationMinutes: number;
  breakDurationMinutes: number;
  days: Record<JadwalPelajaranItem['hari'], JadwalDayConfig>;
}

export const DEFAULT_JADWAL_SCHEDULE_SETTINGS: JadwalScheduleSettings = {
  lessonDurationMinutes: 40,
  breakDurationMinutes: 20,
  days: {
    Senin: { startTime: '08:00', totalSlots: 8, break1AfterSlot: 3, break2AfterSlot: 5 },
    Selasa: { startTime: '07:30', totalSlots: 10, break1AfterSlot: 4, break2AfterSlot: 6 },
    Rabu: { startTime: '07:30', totalSlots: 9, break1AfterSlot: 4, break2AfterSlot: 6 },
    Kamis: { startTime: '07:30', totalSlots: 10, break1AfterSlot: 4, break2AfterSlot: 6 },
    Jumat: { startTime: '08:10', totalSlots: 4, break1AfterSlot: 2, break2AfterSlot: 4 },
    Sabtu: { startTime: '07:30', totalSlots: 6, break1AfterSlot: 3, break2AfterSlot: 0 },
  },
};

export function normalizeJadwalScheduleSettings(
  raw?: Partial<JadwalScheduleSettings> | null
): JadwalScheduleSettings {
  const lessonDurationMinutes = Math.max(
    10,
    Math.min(180, Number(raw?.lessonDurationMinutes) || DEFAULT_JADWAL_SCHEDULE_SETTINGS.lessonDurationMinutes)
  );
  const breakDurationMinutes = Math.max(
    5,
    Math.min(120, Number(raw?.breakDurationMinutes) || DEFAULT_JADWAL_SCHEDULE_SETTINGS.breakDurationMinutes)
  );
  const days = { ...DEFAULT_JADWAL_SCHEDULE_SETTINGS.days };
  (Object.keys(DEFAULT_JADWAL_SCHEDULE_SETTINGS.days) as JadwalPelajaranItem['hari'][]).forEach((day) => {
    const def = DEFAULT_JADWAL_SCHEDULE_SETTINGS.days[day];
    const incoming = raw?.days?.[day];
    if (incoming) {
      days[day] = {
        startTime: /^\d{2}:\d{2}$/.test(incoming.startTime || '') ? incoming.startTime : def.startTime,
        totalSlots: Math.max(1, Math.min(14, Number(incoming.totalSlots) || def.totalSlots)),
        break1AfterSlot: Math.max(
          0,
          Math.min(14, incoming.break1AfterSlot !== undefined ? Number(incoming.break1AfterSlot) : def.break1AfterSlot)
        ),
        break2AfterSlot: Math.max(
          0,
          Math.min(14, incoming.break2AfterSlot !== undefined ? Number(incoming.break2AfterSlot) : def.break2AfterSlot)
        ),
      };
    } else {
      days[day] = { ...def };
    }
  });
  return { lessonDurationMinutes, breakDurationMinutes, days };
}

function parseMinutesFromHHMM(hhmm: string): number {
  const match = String(hhmm || '').match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return 7 * 60 + 30;
  return Number(match[1]) * 60 + Number(match[2]);
}

function formatMinutesToHHMM(totalMinutes: number): string {
  const wrapped = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export interface ComputedSlotTime {
  slotNum: number;
  mulai: string;
  selesai: string;
}

export interface ComputedBreakTime {
  breakIndex: 1 | 2;
  afterSlot: number;
  label: string;
  mulai: string;
  selesai: string;
}

export function computeDayScheduleSlots(
  dayConfig: JadwalDayConfig,
  lessonDurationMinutes: number,
  breakDurationMinutes: number,
  extraSlotsUpTo = 0
): {
  slots: Record<number, ComputedSlotTime>;
  breaks: ComputedBreakTime[];
} {
  const total = Math.max(1, dayConfig.totalSlots, extraSlotsUpTo);
  const slots: Record<number, ComputedSlotTime> = {};
  const breaks: ComputedBreakTime[] = [];

  let cursor = parseMinutesFromHHMM(dayConfig.startTime);

  for (let slotNum = 1; slotNum <= total; slotNum++) {
    const mulai = formatMinutesToHHMM(cursor);
    cursor += lessonDurationMinutes;
    const selesai = formatMinutesToHHMM(cursor);
    slots[slotNum] = { slotNum, mulai, selesai };

    if (dayConfig.break1AfterSlot === slotNum) {
      const bStart = formatMinutesToHHMM(cursor);
      cursor += breakDurationMinutes;
      const bEnd = formatMinutesToHHMM(cursor);
      breaks.push({
        breakIndex: 1,
        afterSlot: slotNum,
        label: 'JAM ISTIRAHAT 1',
        mulai: bStart,
        selesai: bEnd,
      });
    }
    if (dayConfig.break2AfterSlot === slotNum && dayConfig.break2AfterSlot !== dayConfig.break1AfterSlot) {
      const bStart = formatMinutesToHHMM(cursor);
      cursor += breakDurationMinutes;
      const bEnd = formatMinutesToHHMM(cursor);
      breaks.push({
        breakIndex: 2,
        afterSlot: slotNum,
        label: 'JAM ISTIRAHAT 2',
        mulai: bStart,
        selesai: bEnd,
      });
    }
  }

  return { slots, breaks };
}

export interface JadwalPelajaranItem {
  id: string;
  tahunPelajaran: string;
  semester: SemesterType;
  kelas: string;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  jamKe: string;
  waktuMulai: string;
  waktuSelesai: string;
  mataPelajaran: string;
  topik?: string;
  guru?: string;
  ruang?: string;
  isBreak?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TujuanPembelajaranItem {
  id: string;
  tahunPelajaran: string;
  kodeTp: string;
  kelas: string;
  elemen: string;
  materiId?: string;
  deskripsi: string;
  indikator?: string;
  kkm: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgendaHarianItem {
  id: string;
  tahunPelajaran: string;
  semester: SemesterType;
  tanggal: string; // YYYY-MM-DD
  kelas: string;
  pertemuanKe: string;
  jadwalId?: string; // Reference to JadwalPelajaranItem.id
  hari?: JadwalPelajaranItem['hari'] | string;
  jamKe?: string;
  waktuMulai?: string;
  waktuSelesai?: string;
  mataPelajaran?: string;
  tpId?: string;
  tpKode?: string;
  materi: string;
  kegiatan: string;
  catatan?: string;
  hadirCount: number;
  sakitCount: number;
  izinCount: number;
  alpaCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AbsensiStudentEntry {
  status: AttendanceStatus;
  catatan?: string;
}

export interface AbsensiRecord {
  id: string;
  tahunPelajaran: string;
  semester: SemesterType;
  tanggal: string; // YYYY-MM-DD
  kelas: string;
  agendaId?: string; // Reference to AgendaHarianItem.id
  pertemuanKe?: string;
  jamKe?: string;
  materi?: string;
  entries: Record<string, AbsensiStudentEntry>; // key: studentId
  updatedAt?: string;
}

export function getHariFromDate(dateStr: string): JadwalPelajaranItem['hari'] {
  if (!dateStr) return 'Senin';
  // Use T12:00:00 to avoid timezone shifting issues
  const date = new Date(`${dateStr}T12:00:00`);
  const dayIndex = date.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  const mapping: Record<number, JadwalPelajaranItem['hari']> = {
    1: 'Senin',
    2: 'Selasa',
    3: 'Rabu',
    4: 'Kamis',
    5: 'Jumat',
    6: 'Sabtu',
    0: 'Senin', // fallback Sunday to Senin
  };
  return mapping[dayIndex] || 'Senin';
}

export interface NilaiSumatifItem {
  id: string;
  tahunPelajaran: string;
  semester: SemesterType;
  kelas: string;
  judul: string;
  jenis: 'Sumatif Lingkup Materi' | 'Sumatif Tengah Semester' | 'Sumatif Akhir Semester' | 'Praktik';
  tanggal: string; // YYYY-MM-DD
  tpId?: string;
  tpKode?: string;
  bobot: number;
  scores: Record<string, number>; // key: studentId
  notes?: Record<string, string>; // key: studentId
  createdAt?: string;
  updatedAt?: string;
}

export interface NilaiRaporEntry {
  id: string;
  tahunPelajaran: string;
  semester: SemesterType;
  studentId: string;
  studentNis: string;
  studentName: string;
  kelas: string;
  nilaiFormatif: number;
  nilaiSumatif: number;
  nilaiProyek: number;
  nilaiAkhir: number;
  predikat: 'A' | 'B' | 'C' | 'D';
  capaianKompetensi: string;
  catatanGuru?: string;
  isFinalized?: boolean;
  updatedAt?: string;
}

export function slugifyTermPart(value: string): string {
  return String(value || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-');
}

export function buildScopedMaterialDocId(
  courseId: string,
  tahunPelajaran: string,
  semester: SemesterType
): string {
  return `${slugifyTermPart(courseId)}__${slugifyTermPart(tahunPelajaran)}__${semester}`;
}

export function buildScopedAssessmentDocId(
  studentId: string,
  courseId: string,
  tahunPelajaran: string,
  semester: SemesterType
): string {
  return `${slugifyTermPart(studentId)}_${slugifyTermPart(courseId)}__${slugifyTermPart(tahunPelajaran)}__${semester}`;
}

export function getPredikatFromScore(score: number): 'A' | 'B' | 'C' | 'D' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  return 'D';
}

export function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const HARI_LIST: JadwalPelajaranItem['hari'][] = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export const ELEMEN_INFORMATIKA_LIST = [
  'BK - Berpikir Komputasional',
  'TIK - Teknologi Informasi & Komunikasi',
  'SK - Sistem Komputer',
  'JKI - Jaringan Komputer & Internet',
  'AD - Analisis Data',
  'AP - Algoritma & Pemrograman',
  'DSI - Dampak Sosial Informatika',
  'PLB - Praktik Lintas Bidang',
];
