import { SemesterType } from './administrasiTypes';
import { SoalSetType } from './types';

export interface SoalSetTpLink {
  tpId?: string;
  tpKode?: string;
  tpDeskripsi?: string;
  tahunPelajaran?: string;
  soalType?: SoalSetType;
  updatedAt?: string;
}

export interface AsesmenHarianSoalLink {
  agendaId: string;
  kelas: string;
  setId: string;
  setTitle: string;
  isActive: boolean;
  tahunPelajaran?: string;
  semester?: SemesterType;
  updatedAt?: string;
}

function normalizeClassToken(raw: string): string {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/^KELAS\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractGradePrefix(token: string): '7' | '8' | '9' | null {
  const compact = token.replace(/[\s\-_.]/g, '');
  if (!compact) return null;
  if (compact === '7' || compact === 'VII') return '7';
  if (compact === '8' || compact === 'VIII') return '8';
  if (compact === '9' || compact === 'IX') return '9';
  return null;
}

function getStudentGrade(studentToken: string): '7' | '8' | '9' | null {
  const compact = studentToken.replace(/[\s\-_.]/g, '');
  if (!compact) return null;
  if (compact.startsWith('VII') && !compact.startsWith('VIII')) return '7';
  if (compact.startsWith('VIII')) return '8';
  if (compact.startsWith('IX')) return '9';
  if (compact.startsWith('7')) return '7';
  if (compact.startsWith('8')) return '8';
  if (compact.startsWith('9')) return '9';
  return null;
}

/**
 * Checks whether a SoalSet's target `kelas` string matches a student's `kelas`.
 * Supports:
 * - empty / "Semua Kelas" / "Semua" / "All" / "Umum" -> matches all students
 * - comma/semicolon-separated classes (e.g., "7A, 7B")
 * - exact class match (e.g., "7A" or "Kelas 7A")
 * - grade-level match (e.g., "Kelas 7" / "7" / "VII" matches "7A", "7B", "VII-A")
 */
export function doesSoalSetMatchStudentClass(
  setKelas?: string,
  studentKelas?: string
): boolean {
  const rawSet = String(setKelas || '').trim();
  const normStu = normalizeClassToken(studentKelas || '');
  if (!rawSet) return true;

  const upperSet = rawSet.toUpperCase();
  if (
    upperSet === 'SEMUA KELAS' ||
    upperSet === 'SEMUA' ||
    upperSet === 'ALL' ||
    upperSet === 'UMUM'
  ) {
    return true;
  }

  if (!normStu) return false;

  const stuCompact = normStu.replace(/[\s\-_.]/g, '');
  const stuGrade = getStudentGrade(normStu);

  const tokens = rawSet
    .split(/[,;]+/)
    .map((t) => normalizeClassToken(t))
    .filter(Boolean);

  if (tokens.length === 0) return true;

  return tokens.some((tok) => {
    if (
      tok === 'SEMUA' ||
      tok === 'SEMUA KELAS' ||
      tok === 'ALL' ||
      tok === 'UMUM'
    ) {
      return true;
    }
    const tokCompact = tok.replace(/[\s\-_.]/g, '');
    if (tokCompact === stuCompact) return true;

    const tokGradeOnly = extractGradePrefix(tok);
    if (tokGradeOnly && stuGrade && tokGradeOnly === stuGrade) {
      return true;
    }
    return false;
  });
}
