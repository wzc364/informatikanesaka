export interface QuestionAnalysisSectionSelection {
  kisiKisi: boolean;
  materiDariSoal: boolean;
  penyelesaianRinci: boolean;
  latihanSoal: boolean;
}

export interface QuestionKisiKisiItem {
  noSoal: string;
  kompetensiDasar: string;
  materiPokok: string;
  indikatorSoal: string;
  levelKognitif: string;
  bentukSoal: string;
  tingkatKesulitan: string;
}

export interface QuestionMaterialItem {
  judulTopik: string;
  konsepUtama: string;
  penjelasanSingkat: string;
  rumusAtauAturanKunci: string[];
  tipsMemahami: string;
}

export interface QuestionSolutionItem {
  nomorSoal: string;
  teksSoalRingkas: string;
  diketahui: string[];
  ditanyakan: string;
  langkahPenyelesaian: string[];
  jawabanBenar: string;
  penjelasanMengapaBenar: string;
}

export interface SimilarPracticeQuestionItem {
  nomor: number;
  konteksAtauTopik: string;
  pertanyaan: string;
  pilihanGanda: string[];
  kunciJawaban: string;
  pembahasanSingkat: string;
}

export interface QuestionAnalysisSummary {
  mataPelajaran: string;
  jenjang: string;
  jumlahSoalTerdeteksi: number;
  tingkatKesulitanDominan: string;
  ringkasan: string;
}

export interface QuestionAnalysisResult {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  analyzedAt: string;
  requestedSections: QuestionAnalysisSectionSelection;
  ringkasanUmum: QuestionAnalysisSummary;
  kisiKisi?: QuestionKisiKisiItem[];
  materiDariSoal?: QuestionMaterialItem[];
  penyelesaianRinci?: QuestionSolutionItem[];
  latihanSoalMirip?: SimilarPracticeQuestionItem[];
}
