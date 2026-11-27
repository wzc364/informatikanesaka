import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Award,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Info,
  Plus,
  Save,
  Sparkles,
  X,
} from 'lucide-react';
import { addDoc, collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  AgendaHarianItem,
  DEFAULT_SEMESTER,
  DEFAULT_TAHUN_PELAJARAN,
  NilaiAsesmenHarianItem,
  NilaiSubTab,
  NilaiSumatifItem,
  ScopedStudent,
  SemesterType,
  TujuanPembelajaranItem,
  getHariFromDate,
  getTodayIsoDate,
  slugifyTermPart,
} from '../administrasiTypes';

export interface ImportAssessmentToNilaiModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceType: 'materi' | 'soal';
  sourceTitle: string;
  kelas: string;
  activeTahunPelajaran: string;
  activeSemester: SemesterType;
  classStudents: ScopedStudent[];
  assessmentEntries: any[];
  onSuccess?: (message: string, targetSubTab: NilaiSubTab, targetKelas: string) => void;
  onNavigateToNilai?: (targetSubTab: NilaiSubTab, targetKelas: string) => void;
  onFirestoreError?: (
    error: unknown,
    op: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write',
    path: string
  ) => void;
}

type DestinationKind = 'sumatif' | 'asesmen_harian' | 'sumatif_akhir';

function doesTpMatchClass(tpKelas: string, targetClass: string): boolean {
  const tpK = (tpKelas || '').trim().toUpperCase();
  const cls = (targetClass || '').trim().toUpperCase();
  if (!cls) return true;
  if (!tpK || tpK === 'SEMUA' || tpK === 'ALL') return true;
  if (tpK === cls) return true;
  if (
    (tpK === 'VII' || tpK === '7' || tpK === 'KELAS VII' || tpK === 'KELAS 7') &&
    (cls.startsWith('7') || cls.startsWith('VII'))
  ) {
    return true;
  }
  if (
    (tpK === 'VIII' || tpK === '8' || tpK === 'KELAS VIII' || tpK === 'KELAS 8') &&
    (cls.startsWith('8') || cls.startsWith('VIII'))
  ) {
    return true;
  }
  if (
    (tpK === 'IX' || tpK === '9' || tpK === 'KELAS IX' || tpK === 'KELAS 9') &&
    (cls.startsWith('9') || cls.startsWith('IX'))
  ) {
    return true;
  }
  return false;
}

function isSumatifAkhirItem(s: NilaiSumatifItem): boolean {
  return s.jenis === 'Sumatif Akhir Semester' || s.jenis === 'Sumatif Tengah Semester';
}

export default function ImportAssessmentToNilaiModal({
  isOpen,
  onClose,
  sourceType,
  sourceTitle,
  kelas,
  activeTahunPelajaran,
  activeSemester,
  classStudents,
  assessmentEntries,
  onSuccess,
  onNavigateToNilai,
  onFirestoreError,
}: ImportAssessmentToNilaiModalProps) {
  const [isLoadingTargets, setIsLoadingTargets] = useState(false);
  const [tpList, setTpList] = useState<TujuanPembelajaranItem[]>([]);
  const [sumatifDocs, setSumatifDocs] = useState<NilaiSumatifItem[]>([]);
  const [agendaDocs, setAgendaDocs] = useState<AgendaHarianItem[]>([]);
  const [asesmenHarianDocs, setAsesmenHarianDocs] = useState<NilaiAsesmenHarianItem[]>([]);

  // Destination choices
  const [destKind, setDestKind] = useState<DestinationKind>('sumatif');
  const [targetMode, setTargetMode] = useState<'existing' | 'new'>('new');
  const [selectedExistingId, setSelectedExistingId] = useState<string>('');

  // New target fields
  const [newTitle, setNewTitle] = useState(sourceTitle);
  const [newSumatifJenis, setNewSumatifJenis] =
    useState<NilaiSumatifItem['jenis']>('Sumatif Lingkup Materi');
  const [newSumatifAkhirJenis, setNewSumatifAkhirJenis] =
    useState<'Sumatif Akhir Semester' | 'Sumatif Tengah Semester'>('Sumatif Akhir Semester');
  const [newTpId, setNewTpId] = useState<string>('');
  const [newTanggal, setNewTanggal] = useState<string>(getTodayIsoDate());
  const [newBobot, setNewBobot] = useState<number>(1);

  // Aggregation & overwrite options
  const [scorePickMode, setScorePickMode] = useState<'highest' | 'latest'>('highest');
  const [overwriteMode, setOverwriteMode] = useState<'overwrite' | 'fill_empty'>('overwrite');
  const [draftScores, setDraftScores] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load current targets from Firestore when modal opens
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setErrorMsg(null);
    setNewTitle(sourceTitle);
    setNewTanggal(getTodayIsoDate());
    setNewBobot(1);
    setNewSumatifJenis('Sumatif Lingkup Materi');
    setNewSumatifAkhirJenis('Sumatif Akhir Semester');
    setIsLoadingTargets(true);

    Promise.all([
      getDocs(collection(db, 'tujuan_pembelajaran')),
      getDocs(collection(db, 'nilai_sumatif')),
      getDocs(collection(db, 'agenda_harian')),
      getDocs(collection(db, 'nilai_asesmen_harian')),
    ])
      .then(([tpSnap, sumSnap, agSnap, ahSnap]) => {
        if (cancelled) return;
        const tps = tpSnap.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) } as TujuanPembelajaranItem))
          .filter(
            (t) => (t.tahunPelajaran || DEFAULT_TAHUN_PELAJARAN) === activeTahunPelajaran
          )
          .sort((a, b) => (a.kodeTp || '').localeCompare(b.kodeTp || ''));

        const sums = sumSnap.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) } as NilaiSumatifItem))
          .filter(
            (s) =>
              (s.tahunPelajaran || DEFAULT_TAHUN_PELAJARAN) === activeTahunPelajaran &&
              (s.semester || DEFAULT_SEMESTER) === activeSemester &&
              s.kelas === kelas
          );

        const ags = agSnap.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) } as AgendaHarianItem))
          .filter(
            (a) =>
              (a.tahunPelajaran || DEFAULT_TAHUN_PELAJARAN) === activeTahunPelajaran &&
              (a.semester || DEFAULT_SEMESTER) === activeSemester &&
              a.kelas === kelas &&
              (a.jenisKegiatan || '').trim().toLowerCase() === 'kbm dan asesmen harian'
          )
          .sort((a, b) => (a.tanggal || '').localeCompare(b.tanggal || ''));

        const ahs = ahSnap.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) } as NilaiAsesmenHarianItem))
          .filter(
            (a) =>
              (a.tahunPelajaran || DEFAULT_TAHUN_PELAJARAN) === activeTahunPelajaran &&
              (a.semester || DEFAULT_SEMESTER) === activeSemester &&
              a.kelas === kelas
          );

        setTpList(tps);
        setSumatifDocs(sums);
        setAgendaDocs(ags);
        setAsesmenHarianDocs(ahs);

        const matchingTp = tps.find(
          (t) =>
            doesTpMatchClass(t.kelas, kelas) &&
            (t.deskripsi.toLowerCase().includes(sourceTitle.toLowerCase()) ||
              sourceTitle.toLowerCase().includes(t.kodeTp.toLowerCase()))
        );
        setNewTpId(matchingTp?.id || tps.find((t) => doesTpMatchClass(t.kelas, kelas))?.id || '');
      })
      .catch((err) => {
        if (cancelled) return;
        onFirestoreError?.(err, 'list', 'nilai_sumatif');
        setErrorMsg('Gagal memuat daftar tujuan penilaian dari database.');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingTargets(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, sourceTitle, kelas, activeTahunPelajaran, activeSemester]);

  // Build available columns for "sumatif" (including auto-columns from TP flags)
  const existingSumatifOptions = useMemo(() => {
    const saved = sumatifDocs.filter((s) => !isSumatifAkhirItem(s));
    const savedIdSet = new Set(saved.map((s) => s.id));
    const autoGenerated: NilaiSumatifItem[] = [];

    tpList
      .filter((tp) => doesTpMatchClass(tp.kelas, kelas))
      .forEach((tp) => {
        if (tp.isSumatif) {
          const autoId = `auto_sumatif__${slugifyTermPart(activeTahunPelajaran)}__${activeSemester}__${slugifyTermPart(kelas)}__${slugifyTermPart(tp.id)}`;
          const exists =
            savedIdSet.has(autoId) ||
            saved.some(
              (s) =>
                s.jenis !== 'Praktik' &&
                ((s.tpId && s.tpId === tp.id) ||
                  (s.tpKode && s.tpKode.trim().toUpperCase() === tp.kodeTp.trim().toUpperCase()))
            );
          if (!exists) {
            autoGenerated.push({
              id: autoId,
              tahunPelajaran: activeTahunPelajaran,
              semester: activeSemester,
              kelas,
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
          const autoId = `auto_praktik__${slugifyTermPart(activeTahunPelajaran)}__${activeSemester}__${slugifyTermPart(kelas)}__${slugifyTermPart(tp.id)}`;
          const exists =
            savedIdSet.has(autoId) ||
            saved.some(
              (s) =>
                s.jenis === 'Praktik' &&
                ((s.tpId && s.tpId === tp.id) ||
                  (s.tpKode && s.tpKode.trim().toUpperCase() === tp.kodeTp.trim().toUpperCase()))
            );
          if (!exists) {
            autoGenerated.push({
              id: autoId,
              tahunPelajaran: activeTahunPelajaran,
              semester: activeSemester,
              kelas,
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

    return [...saved, ...autoGenerated].sort((a, b) =>
      (a.tpKode || a.judul || '').localeCompare(b.tpKode || b.judul || '')
    );
  }, [sumatifDocs, tpList, kelas, activeTahunPelajaran, activeSemester]);

  const existingSumatifAkhirOptions = useMemo(() => {
    const saved = sumatifDocs.filter((s) => isSumatifAkhirItem(s));
    if (saved.length > 0) return saved;
    const defaultId = `auto_sumatif_akhir__${slugifyTermPart(activeTahunPelajaran)}__${activeSemester}__${slugifyTermPart(kelas)}`;
    return [
      {
        id: defaultId,
        tahunPelajaran: activeTahunPelajaran,
        semester: activeSemester,
        kelas,
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
  }, [sumatifDocs, kelas, activeTahunPelajaran, activeSemester]);

  const currentExistingList = useMemo(() => {
    if (destKind === 'sumatif') return existingSumatifOptions;
    if (destKind === 'sumatif_akhir') return existingSumatifAkhirOptions;
    return agendaDocs;
  }, [destKind, existingSumatifOptions, existingSumatifAkhirOptions, agendaDocs]);

  // Keep selectedExistingId & targetMode synced when destKind changes
  useEffect(() => {
    if (!isOpen) return;
    if (currentExistingList.length > 0) {
      setSelectedExistingId(currentExistingList[0].id);
      if (destKind === 'sumatif_akhir') {
        setTargetMode('existing');
      }
    } else {
      setSelectedExistingId('');
      setTargetMode('new');
    }
  }, [destKind, isOpen, currentExistingList.length]);

  // Aggregate source assessment scores per student
  const studentSourceScores = useMemo(() => {
    const byStudent: Record<string, { score: number; completedAt?: string; count: number }> = {};

    const matchStudent = (entry: any): ScopedStudent | undefined => {
      if (entry.studentId) {
        const byId = classStudents.find((s) => s.id === entry.studentId);
        if (byId) return byId;
      }
      if (entry.studentNis) {
        const byNis = classStudents.find((s) => s.nis === entry.studentNis);
        if (byNis) return byNis;
      }
      if (entry.studentName) {
        const cleanName = String(entry.studentName).trim().toLowerCase();
        return classStudents.find((s) => s.nama.trim().toLowerCase() === cleanName);
      }
      return undefined;
    };

    assessmentEntries.forEach((entry) => {
      const stu = matchStudent(entry);
      if (!stu) return;
      const numericScore = Math.round(Math.max(0, Math.min(100, Number(entry.score) || 0)));
      const prev = byStudent[stu.id];
      if (!prev) {
        byStudent[stu.id] = {
          score: numericScore,
          completedAt: entry.completedAt,
          count: 1,
        };
      } else {
        const prevTime = prev.completedAt ? new Date(prev.completedAt).getTime() : 0;
        const currTime = entry.completedAt ? new Date(entry.completedAt).getTime() : 0;
        if (scorePickMode === 'highest') {
          byStudent[stu.id] = {
            score: Math.max(prev.score, numericScore),
            completedAt: currTime > prevTime ? entry.completedAt : prev.completedAt,
            count: prev.count + 1,
          };
        } else {
          byStudent[stu.id] = {
            score: currTime >= prevTime ? numericScore : prev.score,
            completedAt: currTime >= prevTime ? entry.completedAt : prev.completedAt,
            count: prev.count + 1,
          };
        }
      }
    });

    return byStudent;
  }, [assessmentEntries, classStudents, scorePickMode]);

  // Existing scores in the selected target
  const existingTargetScores = useMemo((): Record<string, number> => {
    if (targetMode !== 'existing' || !selectedExistingId) return {};
    if (destKind === 'sumatif') {
      const item = existingSumatifOptions.find((s) => s.id === selectedExistingId);
      return item?.scores || {};
    }
    if (destKind === 'sumatif_akhir') {
      const item = existingSumatifAkhirOptions.find((s) => s.id === selectedExistingId);
      return item?.scores || {};
    }
    const savedAh = asesmenHarianDocs.find(
      (a) => a.agendaId === selectedExistingId || a.id === selectedExistingId
    );
    return savedAh?.scores || {};
  }, [
    targetMode,
    selectedExistingId,
    destKind,
    existingSumatifOptions,
    existingSumatifAkhirOptions,
    asesmenHarianDocs,
  ]);

  // Sync draftScores whenever source scores, existing target scores, or overwriteMode change
  useEffect(() => {
    if (!isOpen) return;
    const next: Record<string, string> = {};
    classStudents.forEach((stu) => {
      const incoming = studentSourceScores[stu.id]?.score;
      const current = existingTargetScores[stu.id];
      if (overwriteMode === 'fill_empty') {
        if (current !== undefined && current !== null) {
          next[stu.id] = String(current);
        } else if (incoming !== undefined) {
          next[stu.id] = String(incoming);
        } else {
          next[stu.id] = '';
        }
      } else {
        if (incoming !== undefined) {
          next[stu.id] = String(incoming);
        } else if (current !== undefined && current !== null) {
          next[stu.id] = String(current);
        } else {
          next[stu.id] = '';
        }
      }
    });
    setDraftScores(next);
  }, [isOpen, classStudents, studentSourceScores, existingTargetScores, overwriteMode]);

  const matchedCount = useMemo(
    () => classStudents.filter((s) => studentSourceScores[s.id] !== undefined).length,
    [classStudents, studentSourceScores]
  );

  const handleConfirmImport = async () => {
    if (!kelas) return;
    if (targetMode === 'new' && !newTitle.trim()) {
      setErrorMsg('Judul penilaian baru wajib diisi.');
      return;
    }
    if (targetMode === 'existing' && !selectedExistingId) {
      setErrorMsg('Pilih penilaian tujuan terlebih dahulu.');
      return;
    }

    const cleanScores: Record<string, number> = {};
    classStudents.forEach((stu) => {
      const raw = (draftScores[stu.id] || '').trim();
      if (raw !== '' && !Number.isNaN(Number(raw))) {
        cleanScores[stu.id] = Math.round(Math.max(0, Math.min(100, Number(raw))));
      }
    });

    if (Object.keys(cleanScores).length === 0) {
      setErrorMsg('Tidak ada nilai siswa yang siap disimpan.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    const nowIso = new Date().toISOString();
    const linkedTp = tpList.find((t) => t.id === newTpId);

    try {
      if (destKind === 'sumatif' || destKind === 'sumatif_akhir') {
        if (targetMode === 'existing') {
          const existingItem =
            destKind === 'sumatif'
              ? existingSumatifOptions.find((s) => s.id === selectedExistingId)
              : existingSumatifAkhirOptions.find((s) => s.id === selectedExistingId);
          if (!existingItem) throw new Error('Kolom penilaian tujuan tidak ditemukan.');

          await setDoc(
            doc(db, 'nilai_sumatif', existingItem.id),
            {
              tahunPelajaran: existingItem.tahunPelajaran || activeTahunPelajaran,
              semester: existingItem.semester || activeSemester,
              kelas,
              judul: existingItem.judul,
              jenis: existingItem.jenis,
              tanggal: existingItem.tanggal || getTodayIsoDate(),
              tpId: existingItem.tpId || '',
              tpKode: existingItem.tpKode || '',
              bobot: Number(existingItem.bobot) || 1,
              scores: { ...(existingItem.scores || {}), ...cleanScores },
              notes: existingItem.notes || {},
              createdAt: existingItem.createdAt || nowIso,
              updatedAt: nowIso,
            },
            { merge: true }
          );

          const label =
            destKind === 'sumatif'
              ? `Nilai berhasil dimasukkan ke Nilai Sumatif (${existingItem.judul}) Kelas ${kelas}.`
              : `Nilai berhasil dimasukkan ke Sumatif Akhir (${existingItem.judul}) Kelas ${kelas}.`;
          onSuccess?.(label, destKind, kelas);
          onClose();
        } else {
          const jenis =
            destKind === 'sumatif' ? newSumatifJenis : newSumatifAkhirJenis;
          await addDoc(collection(db, 'nilai_sumatif'), {
            tahunPelajaran: activeTahunPelajaran,
            semester: activeSemester,
            kelas,
            judul: newTitle.trim(),
            jenis,
            tanggal: newTanggal || getTodayIsoDate(),
            tpId: destKind === 'sumatif' ? linkedTp?.id || '' : '',
            tpKode: destKind === 'sumatif' ? linkedTp?.kodeTp || '' : '',
            bobot: Math.max(1, Number(newBobot) || 1),
            scores: cleanScores,
            notes: {},
            createdAt: nowIso,
            updatedAt: nowIso,
          });

          const label =
            destKind === 'sumatif'
              ? `Kolom baru "${newTitle.trim()}" dibuat & nilai dimasukkan ke Nilai Sumatif Kelas ${kelas}.`
              : `Kolom baru "${newTitle.trim()}" dibuat & nilai dimasukkan ke Sumatif Akhir Kelas ${kelas}.`;
          onSuccess?.(label, destKind, kelas);
          onClose();
        }
      } else {
        // ASESMEN HARIAN
        if (targetMode === 'existing') {
          const ag = agendaDocs.find((a) => a.id === selectedExistingId);
          if (!ag) throw new Error('Agenda Asesmen Harian tidak ditemukan.');
          const savedAh = asesmenHarianDocs.find(
            (a) => a.agendaId === ag.id || a.id === ag.id
          );
          const docId = savedAh?.id || ag.id;
          await setDoc(
            doc(db, 'nilai_asesmen_harian', docId),
            {
              agendaId: ag.id,
              tahunPelajaran: activeTahunPelajaran,
              semester: activeSemester,
              kelas,
              tanggal: ag.tanggal,
              materi: ag.materi,
              tpId: ag.tpId || '',
              tpKode: ag.tpKode || '',
              scores: { ...(savedAh?.scores || {}), ...cleanScores },
              notes: savedAh?.notes || {},
              createdAt: savedAh?.createdAt || nowIso,
              updatedAt: nowIso,
            },
            { merge: true }
          );

          onSuccess?.(
            `Nilai berhasil dimasukkan ke Asesmen Harian ("${ag.materi}") Kelas ${kelas}.`,
            'asesmen_harian',
            kelas
          );
          onClose();
        } else {
          // Buat agenda "KBM dan Asesmen Harian" baru + nilai_asesmen_harian
          const agRef = await addDoc(collection(db, 'agenda_harian'), {
            tahunPelajaran: activeTahunPelajaran,
            semester: activeSemester,
            tanggal: newTanggal || getTodayIsoDate(),
            kelas,
            pertemuanKe: '-',
            hari: getHariFromDate(newTanggal || getTodayIsoDate()),
            jamKe: '1',
            mataPelajaran: 'Informatika',
            jenisKegiatan: 'KBM dan Asesmen Harian',
            attendanceMode: 'all_present',
            tpId: linkedTp?.id || '',
            tpKode: linkedTp?.kodeTp || '',
            materi: newTitle.trim(),
            kegiatan: `Import nilai dari ${sourceType === 'soal' ? 'Hasil Nilai Soal / Ujian' : 'Hasil Nilai Materi'}: ${sourceTitle}`,
            hadirCount: classStudents.length,
            sakitCount: 0,
            izinCount: 0,
            alpaCount: 0,
            createdAt: nowIso,
            updatedAt: nowIso,
          });

          await setDoc(doc(db, 'nilai_asesmen_harian', agRef.id), {
            agendaId: agRef.id,
            tahunPelajaran: activeTahunPelajaran,
            semester: activeSemester,
            kelas,
            tanggal: newTanggal || getTodayIsoDate(),
            materi: newTitle.trim(),
            tpId: linkedTp?.id || '',
            tpKode: linkedTp?.kodeTp || '',
            scores: cleanScores,
            notes: {},
            createdAt: nowIso,
            updatedAt: nowIso,
          });

          onSuccess?.(
            `Agenda & nilai Asesmen Harian "${newTitle.trim()}" berhasil disimpan untuk Kelas ${kelas}.`,
            'asesmen_harian',
            kelas
          );
          onClose();
        }
      }
    } catch (err: any) {
      onFirestoreError?.(err, 'write', destKind === 'asesmen_harian' ? 'nilai_asesmen_harian' : 'nilai_sumatif');
      setErrorMsg(err?.message || 'Gagal menyimpan nilai ke Kelola Administrasi.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[230] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-brand to-blue-700 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg bg-white/20 text-[10px] font-black uppercase tracking-wider">
                {sourceType === 'soal' ? 'Hasil Nilai Soal / Ujian' : 'Hasil Nilai Materi'}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-white/20 text-[10px] font-black uppercase tracking-wider">
                Kelas {kelas}
              </span>
              <span className="text-[11px] font-bold text-blue-100 tabular-nums">
                TA {activeTahunPelajaran} · Sem {activeSemester}
              </span>
            </div>
            <h3 className="text-base md:text-lg font-black truncate mt-1">
              Masukkan Nilai "{sourceTitle}" ke Kelola Administrasi
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <Info size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step 1: Pilih ke Halaman Nilai Mana */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
              1. Pilih Tujuan di Halaman Nilai (Kelola Administrasi)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setDestKind('sumatif')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  destKind === 'sumatif'
                    ? 'bg-blue-50 dark:bg-blue-950/50 border-brand ring-2 ring-brand/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-brand/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <ClipboardCheck
                    size={18}
                    className={destKind === 'sumatif' ? 'text-brand' : 'text-slate-400'}
                  />
                  {destKind === 'sumatif' && (
                    <span className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center">
                      <Check size={12} />
                    </span>
                  )}
                </div>
                <p className="text-xs font-black text-slate-900 dark:text-white">
                  Nilai Sumatif / Praktikum
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Masuk ke tab Nilai Sumatif &amp; otomatis dihitung di Nilai Rapor.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDestKind('asesmen_harian')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  destKind === 'asesmen_harian'
                    ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 ring-2 ring-amber-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-amber-400/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <BookOpenCheck
                    size={18}
                    className={destKind === 'asesmen_harian' ? 'text-amber-600' : 'text-slate-400'}
                  />
                  {destKind === 'asesmen_harian' && (
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center">
                      <Check size={12} />
                    </span>
                  )}
                </div>
                <p className="text-xs font-black text-slate-900 dark:text-white">
                  Asesmen Harian
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Masuk ke tab Asesmen Harian (terkait Agenda Harian kelas).
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDestKind('sumatif_akhir')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  destKind === 'sumatif_akhir'
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-600 ring-2 ring-indigo-600/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-400/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Award
                    size={18}
                    className={destKind === 'sumatif_akhir' ? 'text-indigo-600' : 'text-slate-400'}
                  />
                  {destKind === 'sumatif_akhir' && (
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check size={12} />
                    </span>
                  )}
                </div>
                <p className="text-xs font-black text-slate-900 dark:text-white">
                  Sumatif Akhir (STS / SAS)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Masuk ke tab Sumatif Akhir &amp; bobot Sumatif Akhir Rapor.
                </p>
              </button>
            </div>
          </div>

          {/* Step 2: Pilih Kolom yang Ada atau Buat Baru */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                2. Target Penilaian di {destKind === 'sumatif' ? 'Nilai Sumatif' : destKind === 'asesmen_harian' ? 'Asesmen Harian' : 'Sumatif Akhir'}
              </label>
              <div className="inline-flex p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 gap-1">
                <button
                  type="button"
                  disabled={currentExistingList.length === 0}
                  onClick={() => setTargetMode('existing')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all disabled:opacity-40 cursor-pointer ${
                    targetMode === 'existing'
                      ? 'bg-brand text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Pilih Kolom yang Ada ({currentExistingList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTargetMode('new')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                    targetMode === 'new'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Plus size={12} />
                  Buat Kolom Baru
                </button>
              </div>
            </div>

            {isLoadingTargets ? (
              <p className="text-xs text-slate-500 font-semibold py-2">
                Memuat daftar penilaian kelas {kelas}...
              </p>
            ) : targetMode === 'existing' ? (
              <div className="space-y-2">
                <select
                  value={selectedExistingId}
                  onChange={(e) => setSelectedExistingId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                >
                  {destKind === 'asesmen_harian'
                    ? agendaDocs.map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          {ag.materi}
                          {ag.tpKode ? ` (${ag.tpKode})` : ''} · {ag.tanggal}
                        </option>
                      ))
                    : (destKind === 'sumatif'
                        ? existingSumatifOptions
                        : existingSumatifAkhirOptions
                      ).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.judul} — {s.jenis}
                          {s.tpKode ? ` (${s.tpKode})` : ''} · {Object.keys(s.scores || {}).length} nilai terisi
                        </option>
                      ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Judul / Nama Penilaian
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Contoh: Sumatif 1 Sistem Komputer"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>

                {destKind === 'sumatif' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Jenis Penilaian
                    </label>
                    <select
                      value={newSumatifJenis}
                      onChange={(e) =>
                        setNewSumatifJenis(e.target.value as NilaiSumatifItem['jenis'])
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                    >
                      <option value="Sumatif Lingkup Materi">Sumatif Lingkup Materi</option>
                      <option value="Praktik">Praktikum / Kinerja</option>
                    </select>
                  </div>
                )}

                {destKind === 'sumatif_akhir' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Jenis Sumatif Akhir
                    </label>
                    <select
                      value={newSumatifAkhirJenis}
                      onChange={(e) =>
                        setNewSumatifAkhirJenis(
                          e.target.value as 'Sumatif Akhir Semester' | 'Sumatif Tengah Semester'
                        )
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                    >
                      <option value="Sumatif Akhir Semester">Sumatif Akhir Semester (SAS)</option>
                      <option value="Sumatif Tengah Semester">Sumatif Tengah Semester (STS)</option>
                    </select>
                  </div>
                )}

                {destKind !== 'sumatif_akhir' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Tautkan ke Tujuan Pembelajaran (Opsional)
                    </label>
                    <select
                      value={newTpId}
                      onChange={(e) => setNewTpId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                    >
                      <option value="">-- Tanpa TP --</option>
                      {tpList.map((tp) => (
                        <option key={tp.id} value={tp.id}>
                          {tp.kodeTp} ({tp.kelas}) — {tp.deskripsi.slice(0, 55)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={newTanggal}
                    onChange={(e) => setNewTanggal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>

                {destKind !== 'asesmen_harian' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Bobot
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={newBobot}
                      onChange={(e) => setNewBobot(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Options for duplicates & overwrites */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Jika Siswa Mengerjakan Lebih dari 1x
                </label>
                <select
                  value={scorePickMode}
                  onChange={(e) => setScorePickMode(e.target.value as 'highest' | 'latest')}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                >
                  <option value="highest">Ambil Nilai Tertinggi</option>
                  <option value="latest">Ambil Nilai Terbaru</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Jika Nilai di Target Sudah Terisi
                </label>
                <select
                  value={overwriteMode}
                  onChange={(e) => setOverwriteMode(e.target.value as 'overwrite' | 'fill_empty')}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                >
                  <option value="overwrite">Timpa nilai yang ada &amp; isi yang kosong</option>
                  <option value="fill_empty">Hanya isi siswa yang nilainya masih kosong</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 3: Preview Table */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                3. Pratinjau Nilai Siswa Kelas {kelas} ({matchedCount}/{classStudents.length} siswa punya nilai sumber)
              </label>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Anda dapat mengedit angka secara langsung sebelum disimpan.
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="p-2.5 w-10">No</th>
                      <th className="p-2.5">Nama Siswa</th>
                      <th className="p-2.5 text-center">Nilai Sumber</th>
                      {targetMode === 'existing' && (
                        <th className="p-2.5 text-center">Nilai Lama</th>
                      )}
                      <th className="p-2.5 text-center w-28">Nilai Masuk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {classStudents.map((stu, idx) => {
                      const src = studentSourceScores[stu.id];
                      const oldVal = existingTargetScores[stu.id];
                      return (
                        <tr
                          key={stu.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        >
                          <td className="p-2.5 font-bold text-slate-400 tabular-nums">
                            {idx + 1}
                          </td>
                          <td className="p-2.5">
                            <p className="font-bold text-slate-900 dark:text-white">{stu.nama}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{stu.nis}</p>
                          </td>
                          <td className="p-2.5 text-center">
                            {src !== undefined ? (
                              <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-brand dark:text-blue-300 font-black tabular-nums">
                                {src.score}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Belum ada</span>
                            )}
                          </td>
                          {targetMode === 'existing' && (
                            <td className="p-2.5 text-center font-bold text-slate-500 tabular-nums">
                              {oldVal !== undefined && oldVal !== null ? oldVal : '-'}
                            </td>
                          )}
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={draftScores[stu.id] ?? ''}
                              onChange={(e) =>
                                setDraftScores((prev) => ({
                                  ...prev,
                                  [stu.id]: e.target.value,
                                }))
                              }
                              placeholder="-"
                              className="w-20 px-2 py-1 text-center rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 font-black text-slate-900 dark:text-white tabular-nums"
                            />
                          </td>
                        </tr>
                      );
                    })}
                    {classStudents.length === 0 && (
                      <tr>
                        <td
                          colSpan={targetMode === 'existing' ? 5 : 4}
                          className="p-6 text-center text-slate-400 font-semibold"
                        >
                          Tidak ada siswa terdaftar di kelas {kelas}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span>
              {
                classStudents.filter((s) => {
                  const v = (draftScores[s.id] || '').trim();
                  return v !== '' && !Number.isNaN(Number(v));
                }).length
              }{' '}
              nilai siswa siap disimpan
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onNavigateToNilai && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToNilai(destKind, kelas);
                }}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                Buka Halaman Nilai
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isSaving || isLoadingTargets}
              onClick={handleConfirmImport}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Save size={14} />
              {isSaving ? 'Menyimpan...' : 'Simpan & Masukkan Nilai'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
