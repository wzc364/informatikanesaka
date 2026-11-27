import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import {
  AgendaHarianItem,
  DEFAULT_SEMESTER,
  DEFAULT_TAHUN_PELAJARAN,
  NilaiAsesmenHarianItem,
  NilaiSumatifItem,
  SemesterType,
  getHariFromDate,
  getTodayIsoDate,
  slugifyTermPart,
} from './administrasiTypes';

export type SoalExportTarget = 'none' | 'sumatif_tp' | 'praktikum_tp' | 'asesmen_harian';

export interface SoalSetTpLink {
  tpId: string;
  tpKode: string;
  tpDeskripsi?: string;
  tahunPelajaran?: string;
  exportTarget?: SoalExportTarget;
  selectedAgendaClass?: string; // Selected class for Asesmen Harian
  selectedAgendaId?: string; // Selected specific Asesmen Harian agenda ID
  updatedAt?: string;
}

export interface StudentExportScore {
  studentId: string;
  kelas: string;
  score: number;
}

export interface ExportSoalResult {
  exportedStudents: number;
  exportedClasses: string[];
  target: 'sumatif_tp' | 'praktikum_tp' | 'asesmen_harian';
  tpKode: string;
}

export async function exportSoalScoresToAdministrasi(params: {
  setId: string;
  setTitle: string;
  link: SoalSetTpLink;
  tahunPelajaran: string;
  semester: SemesterType;
  studentScores: StudentExportScore[];
  onFirestoreError?: (
    error: unknown,
    op: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write',
    path: string
  ) => void;
}): Promise<ExportSoalResult> {
  const {
    setTitle,
    link,
    tahunPelajaran,
    semester,
    studentScores,
    onFirestoreError,
  } = params;

  const target = link.exportTarget;
  if (!link.tpId || (target !== 'sumatif_tp' && target !== 'praktikum_tp' && target !== 'asesmen_harian')) {
    return {
      exportedStudents: 0,
      exportedClasses: [],
      target: target === 'praktikum_tp' ? 'praktikum_tp' : target === 'asesmen_harian' ? 'asesmen_harian' : 'sumatif_tp',
      tpKode: link.tpKode || '',
    };
  }

  // Group scores by student's kelas (keep highest score if duplicate entries exist for a student)
  const scoresByClass: Record<string, Record<string, number>> = {};
  studentScores.forEach((entry) => {
    const kelas = String(entry.kelas || '').trim();
    const sid = String(entry.studentId || '').trim();
    if (!kelas || !sid) return;
    const numeric = Math.round(Math.max(0, Math.min(100, Number(entry.score) || 0)));
    if (!scoresByClass[kelas]) scoresByClass[kelas] = {};
    const prev = scoresByClass[kelas][sid];
    scoresByClass[kelas][sid] = prev === undefined ? numeric : Math.max(prev, numeric);
  });

  const kelasKeys = Object.keys(scoresByClass);
  if (kelasKeys.length === 0) {
    return {
      exportedStudents: 0,
      exportedClasses: [],
      target,
      tpKode: link.tpKode || '',
    };
  }

  const nowIso = new Date().toISOString();
  const todayIso = getTodayIsoDate();
  const cleanTpKode = (link.tpKode || '').trim();
  const normTpKode = cleanTpKode.toUpperCase();
  let exportedStudents = 0;

  for (const kelas of kelasKeys) {
    // If exporting to Asesmen Harian and user selected a specific class, skip other classes
    if (target === 'asesmen_harian' && link.selectedAgendaClass && link.selectedAgendaClass !== 'all' && link.selectedAgendaClass !== kelas) {
      continue;
    }

    const classScores = scoresByClass[kelas];
    if (!classScores || Object.keys(classScores).length === 0) continue;
    exportedStudents += Object.keys(classScores).length;

    if (target === 'sumatif_tp' || target === 'praktikum_tp') {
      try {
        const isPraktik = target === 'praktikum_tp';
        const qSum = query(collection(db, 'nilai_sumatif'), where('kelas', '==', kelas));
        const snap = await getDocs(qSum);
        const existingList = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) } as NilaiSumatifItem))
          .filter(
            (s) =>
              (s.tahunPelajaran || DEFAULT_TAHUN_PELAJARAN) === tahunPelajaran &&
              (s.semester || DEFAULT_SEMESTER) === semester &&
              s.kelas === kelas &&
              (isPraktik ? s.jenis === 'Praktik' : s.jenis !== 'Praktik') &&
              s.jenis !== 'Sumatif Akhir Semester' &&
              s.jenis !== 'Sumatif Tengah Semester'
          );

        const matched = existingList.find(
          (s) =>
            (s.tpId && s.tpId === link.tpId) ||
            (normTpKode && (s.tpKode || '').trim().toUpperCase() === normTpKode)
        );

        const targetDocId =
          matched?.id ||
          `${isPraktik ? 'auto_praktik' : 'auto_sumatif'}__${slugifyTermPart(tahunPelajaran)}__${semester}__${slugifyTermPart(kelas)}__${slugifyTermPart(link.tpId)}`;

        const payload: Record<string, any> = {
          tahunPelajaran,
          semester,
          kelas,
          judul: matched?.judul || cleanTpKode || setTitle || (isPraktik ? 'Praktik TP' : 'Sumatif TP'),
          jenis: isPraktik ? 'Praktik' : 'Sumatif Lingkup Materi',
          tanggal: matched?.tanggal || todayIso,
          tpId: matched?.tpId || link.tpId,
          tpKode: matched?.tpKode || cleanTpKode,
          bobot: Number(matched?.bobot) || 1,
          scores: classScores,
          updatedAt: nowIso,
        };
        if (!matched) {
          payload.notes = {};
          payload.createdAt = nowIso;
        }

        await setDoc(doc(db, 'nilai_sumatif', targetDocId), payload, { merge: true });
      } catch (err) {
        onFirestoreError?.(err, 'write', 'nilai_sumatif');
        throw err;
      }
    } else {
      // ASESMEN HARIAN
      try {
        let matchedAg: AgendaHarianItem | undefined = undefined;

        if (link.selectedAgendaId) {
          const agSnap = await getDocs(query(collection(db, 'agenda_harian'), where('kelas', '==', kelas)));
          matchedAg = agSnap.docs
            .map((d) => ({ id: d.id, ...(d.data() as any) } as AgendaHarianItem))
            .find((a) => a.id === link.selectedAgendaId);
        }

        if (!matchedAg) {
          const qAg = query(collection(db, 'agenda_harian'), where('kelas', '==', kelas));
          const agSnap = await getDocs(qAg);
          const matchingAgendas = agSnap.docs
            .map((d) => ({ id: d.id, ...(d.data() as any) } as AgendaHarianItem))
            .filter(
              (a) =>
                (a.tahunPelajaran || DEFAULT_TAHUN_PELAJARAN) === tahunPelajaran &&
                (a.semester || DEFAULT_SEMESTER) === semester &&
                a.kelas === kelas &&
                (a.jenisKegiatan || '').trim().toLowerCase() === 'kbm dan asesmen harian' &&
                ((a.tpId && a.tpId === link.tpId) ||
                  (normTpKode && (a.tpKode || '').trim().toUpperCase() === normTpKode))
            )
            .sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));
          matchedAg = matchingAgendas[0];
        }

        const targetAgendaId =
          matchedAg?.id ||
          `auto_ag_ah__${slugifyTermPart(tahunPelajaran)}__${semester}__${slugifyTermPart(kelas)}__${slugifyTermPart(link.tpId)}`;
        const agendaTanggal = matchedAg?.tanggal || todayIso;
        const agendaMateri =
          matchedAg?.materi || setTitle || cleanTpKode || 'Asesmen Harian Soal';

        if (!matchedAg) {
          await setDoc(
            doc(db, 'agenda_harian', targetAgendaId),
            {
              tahunPelajaran,
              semester,
              tanggal: agendaTanggal,
              kelas,
              pertemuanKe: '-',
              hari: getHariFromDate(agendaTanggal),
              jamKe: '1',
              mataPelajaran: 'Informatika',
              jenisKegiatan: 'KBM dan Asesmen Harian',
              attendanceMode: 'all_present',
              tpId: link.tpId,
              tpKode: cleanTpKode,
              materi: agendaMateri,
              kegiatan: `Asesmen Harian Otomatis dari Kartu Soal: ${setTitle}`,
              hadirCount: Object.keys(classScores).length,
              sakitCount: 0,
              izinCount: 0,
              alpaCount: 0,
              createdAt: nowIso,
              updatedAt: nowIso,
            },
            { merge: true }
          );
        }

        const qAh = query(collection(db, 'nilai_asesmen_harian'), where('kelas', '==', kelas));
        const ahSnap = await getDocs(qAh);
        const existingAh = ahSnap.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) } as NilaiAsesmenHarianItem))
          .find(
            (a) =>
              (a.tahunPelajaran || DEFAULT_TAHUN_PELAJARAN) === tahunPelajaran &&
              (a.semester || DEFAULT_SEMESTER) === semester &&
              (a.agendaId === targetAgendaId || a.id === targetAgendaId)
          );

        const targetAhId = existingAh?.id || targetAgendaId;
        const ahPayload: Record<string, any> = {
          agendaId: targetAgendaId,
          tahunPelajaran,
          semester,
          kelas,
          tanggal: agendaTanggal,
          materi: agendaMateri,
          tpId: link.tpId,
          tpKode: cleanTpKode,
          scores: classScores,
          updatedAt: nowIso,
        };
        if (!existingAh) {
          ahPayload.notes = {};
          ahPayload.createdAt = nowIso;
        }

        await setDoc(doc(db, 'nilai_asesmen_harian', targetAhId), ahPayload, { merge: true });
      } catch (err) {
        onFirestoreError?.(err, 'write', 'nilai_asesmen_harian');
        throw err;
      }
    }
  }

  return {
    exportedStudents,
    exportedClasses: kelasKeys,
    target,
    tpKode: cleanTpKode,
  };
}
