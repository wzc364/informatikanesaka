import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FileUp,
  Sparkles,
  Printer,
  Download,
  CheckSquare,
  Square,
  FileText,
  BookOpen,
  ListChecks,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  RefreshCw,
  Table2,
  KeyRound,
  History,
  X,
  Upload,
} from 'lucide-react';
import {
  QuestionAnalysisResult,
  QuestionAnalysisSectionSelection,
} from '../questionAnalysisTypes';
import { resolveCourseImageUrl, getPublicFallbackImageUrl } from '../courseImageMap';

interface AdminQuestionAnalysisProps {
  schoolName?: string;
  logoUrl?: string;
  suppressPrintPortal?: boolean;
  onHasPrintableResultChange?: (hasResult: boolean) => void;
}

const STORAGE_KEY = 'ruang_informatika_question_analyses_v1';
const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB

const SECTION_OPTIONS: Array<{
  key: keyof QuestionAnalysisSectionSelection;
  label: string;
  desc: string;
}> = [
  {
    key: 'kisiKisi',
    label: 'Kisi-kisi soal',
    desc: 'Tabel kompetensi, materi pokok, indikator, level kognitif & kesulitan',
  },
  {
    key: 'materiDariSoal',
    label: 'Materi dari soal',
    desc: 'Ringkasan konsep utama, rumus/aturan kunci & tips memahami',
  },
  {
    key: 'penyelesaianRinci',
    label: 'Penyelesaian soal secara rinci',
    desc: 'Diketahui, ditanyakan, langkah runtut hingga jawaban benar',
  },
  {
    key: 'latihanSoal',
    label: 'Latihan soal',
    desc: 'Paket soal latihan baru yang mirip beserta pilihan & pembahasan',
  },
];

function stripOptionPrefix(opt: string): string {
  return opt.replace(/^[A-Ea-e][).:\]]\s+/, '').trim();
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const commaIdx = result.indexOf(',');
      resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
    };
    reader.onerror = () => reject(new Error('Gagal membaca file dokumen dari perangkat.'));
    reader.readAsDataURL(file);
  });
}

export const AdminQuestionAnalysis: React.FC<AdminQuestionAnalysisProps> = ({
  schoolName = 'SMPN 1 Kawali',
  logoUrl = '/images/labkom_nesaka_logo.jpg',
  suppressPrintPortal = false,
  onHasPrintableResultChange,
}) => {
  const [title, setTitle] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [sections, setSections] = useState<QuestionAnalysisSectionSelection>({
    kisiKisi: true,
    materiDariSoal: true,
    penyelesaianRinci: true,
    latihanSoal: true,
  });

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPracticeAnswers, setShowPracticeAnswers] = useState<boolean>(true);
  const [isPreparingPrint, setIsPreparingPrint] = useState<boolean>(false);
  const [isExportingHtml, setIsExportingHtml] = useState<boolean>(false);

  const [savedHistory, setSavedHistory] = useState<QuestionAnalysisResult[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [activeResult, setActiveResult] = useState<QuestionAnalysisResult | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
    } catch {
      return null;
    }
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewSheetRef = useRef<HTMLDivElement | null>(null);
  const portalSheetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    onHasPrintableResultChange?.(Boolean(activeResult));
  }, [activeResult, onHasPrintableResultChange]);

  useEffect(() => {
    return () => {
      onHasPrintableResultChange?.(false);
    };
  }, [onHasPrintableResultChange]);

  const persistHistory = (items: QuestionAnalysisResult[]) => {
    setSavedHistory(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 8)));
    } catch {
      // ignore storage quota errors
    }
  };

  const handleFileChosen = (file: File | null | undefined) => {
    if (!file) return;
    setErrorMsg(null);
    if (file.size > MAX_UPLOAD_BYTES) {
      setErrorMsg(
        `Ukuran file (${formatBytes(file.size)}) melebihi batas 15 MB. Silakan perkecil atau kompres dokumen terlebih dahulu.`
      );
      return;
    }
    setSelectedFile(file);
    if (!title.trim()) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
      setTitle(baseName);
    }
  };

  const toggleSection = (key: keyof QuestionAnalysisSectionSelection) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedCount = useMemo(
    () => Object.values(sections).filter(Boolean).length,
    [sections]
  );

  const missingRequestedSections = useMemo(() => {
    if (!activeResult) return [];
    const missing: string[] = [];
    if (sections.kisiKisi && !activeResult.kisiKisi) missing.push('Kisi-kisi soal');
    if (sections.materiDariSoal && !activeResult.materiDariSoal) missing.push('Materi dari soal');
    if (sections.penyelesaianRinci && !activeResult.penyelesaianRinci) {
      missing.push('Penyelesaian soal secara rinci');
    }
    if (sections.latihanSoal && !activeResult.latihanSoalMirip) missing.push('Latihan soal');
    return missing;
  }, [activeResult, sections]);

  const runAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (!selectedFile) {
      setErrorMsg('Silakan unggah file dokumen soal terlebih dahulu (PDF, DOC, DOCX, atau lainnya).');
      return;
    }
    if (selectedCount === 0) {
      setErrorMsg('Centang minimal satu bagian hasil analisis sebelum memproses.');
      return;
    }

    const finalTitle =
      title.trim() ||
      selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim() ||
      'Analisis Dokumen Soal';

    setIsAnalyzing(true);
    try {
      const fileBase64 = await fileToBase64(selectedFile);
      const response = await fetch('/api/analyze-question-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finalTitle,
          fileName: selectedFile.name,
          mimeType: selectedFile.type,
          fileBase64,
          sections,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 413) {
          throw new Error(
            'Ukuran file terlalu besar untuk dikirim ke server (HTTP 413). Kompres/perkecil dokumen hingga di bawah 3 MB atau pecah menjadi beberapa bagian.'
          );
        }
        if (response.status === 504 && !payload?.error) {
          throw new Error(
            'Waktu pemrosesan server habis (HTTP 504). Coba kurangi jumlah halaman/soal atau centang sebagian komponen terlebih dahulu.'
          );
        }
        if (response.status === 404 && !payload?.error) {
          const isSharedPreview =
            typeof window !== 'undefined' &&
            window.location.hostname.startsWith('ais-pre-');
          throw new Error(
            isSharedPreview
              ? 'Fitur Analisis Soal membutuhkan server backend aktif, sedangkan URL pratinjau bersama (ais-pre) hanya menyajikan file statis. Silakan buka dari Pratinjau Editor (ais-dev) atau deploy aplikasi agar server aktif.'
              : 'Endpoint analisis server belum aktif (HTTP 404). Pastikan folder /api ikut ter-deploy atau muat ulang halaman.'
          );
        }
        if (response.status === 500 && !payload?.error) {
          throw new Error(
            'Terjadi gangguan pada fungsi server (HTTP 500). Pastikan GEMINI_API_KEY sudah ditambahkan di Vercel Environment Variables lalu lakukan Redeploy.'
          );
        }
        throw new Error(
          payload?.error || `Gagal menganalisis dokumen (HTTP ${response.status}).`
        );
      }

      const result = payload as QuestionAnalysisResult;
      setActiveResult(result);
      const nextHistory = [result, ...savedHistory.filter((item) => item.id !== result.id)].slice(
        0,
        8
      );
      persistHistory(nextHistory);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kendala saat menganalisis file soal.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectHistory = (item: QuestionAnalysisResult) => {
    setActiveResult(item);
    setTitle(item.title);
    setSections({
      kisiKisi: Boolean(item.kisiKisi),
      materiDariSoal: Boolean(item.materiDariSoal),
      penyelesaianRinci: Boolean(item.penyelesaianRinci),
      latihanSoal: Boolean(item.latihanSoalMirip),
    });
    setErrorMsg(null);
  };

  const handleDeleteHistory = (id: string) => {
    const updated = savedHistory.filter((item) => item.id !== id);
    persistHistory(updated);
    if (activeResult?.id === id) {
      setActiveResult(updated[0] || null);
    }
  };

  const waitForImages = async (container: HTMLElement | null) => {
    if (!container) return;
    const imgs = Array.from(container.querySelectorAll('img'));
    await Promise.race([
      Promise.all(
        imgs.map(async (img) => {
          if (!img.complete) {
            await new Promise<void>((resolve) => {
              const done = () => {
                img.removeEventListener('load', done);
                img.removeEventListener('error', done);
                resolve();
              };
              img.addEventListener('load', done);
              img.addEventListener('error', done);
            });
          }
          if (typeof img.decode === 'function') {
            try {
              await img.decode();
            } catch {
              // ignore decode errors
            }
          }
        })
      ),
      new Promise<void>((resolve) => setTimeout(resolve, 2000)),
    ]);
  };

  const handlePrint = async () => {
    if (!activeResult) return;
    setIsPreparingPrint(true);
    try {
      await Promise.all([
        waitForImages(portalSheetRef.current),
        waitForImages(previewSheetRef.current),
      ]);
      window.print();
    } finally {
      setIsPreparingPrint(false);
    }
  };

  const toDataUrl = async (src: string): Promise<string> => {
    if (!src || src.startsWith('data:')) return src;
    try {
      const res = await fetch(src);
      if (!res.ok) return src;
      const blob = await res.blob();
      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () =>
          resolve(typeof reader.result === 'string' ? reader.result : src);
        reader.onerror = () => resolve(src);
        reader.readAsDataURL(blob);
      });
    } catch {
      return src;
    }
  };

  const handleDownloadHtml = async () => {
    if (!previewSheetRef.current || !activeResult || typeof document === 'undefined') return;
    setIsExportingHtml(true);
    try {
      await waitForImages(previewSheetRef.current);
      const clone = previewSheetRef.current.cloneNode(true) as HTMLDivElement;
      const imgs = Array.from(clone.querySelectorAll('img'));
      await Promise.all(
        imgs.map(async (img) => {
          const src = img.getAttribute('src') || img.src;
          if (!src) return;
          img.setAttribute('src', await toDataUrl(src));
        })
      );

      const headStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((el) => {
          if (el.tagName.toLowerCase() === 'link') {
            const href = (el as HTMLLinkElement).href;
            return href ? `<link rel="stylesheet" href="${href}" />` : '';
          }
          return `<style>${el.innerHTML}</style>`;
        })
        .join('\n');

      const safeTitle = activeResult.title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const slug = activeResult.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'analisis-soal';

      const htmlPayload = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <base href="${window.location.origin}/" />
  <title>Analisis Soal: ${safeTitle} — ${schoolName}</title>
  ${headStyles}
  <style>
    @page { size: A4 portrait; margin: 15mm 14mm 16mm 14mm; }
    body { background: #f1f5f9 !important; color: #0f172a !important; padding: 24px 16px; margin: 0; }
    .export-sheet { max-width: 210mm; margin: 0 auto; background: #ffffff; padding: 18mm 16mm; border-radius: 12px; box-shadow: 0 10px 30px rgba(15,23,42,0.08); }
    @media print {
      body { background: #ffffff !important; padding: 0 !important; }
      .export-sheet { max-width: none !important; padding: 0 !important; box-shadow: none !important; border-radius: 0 !important; }
      .no-print-banner { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print-banner" style="max-width:210mm;margin:0 auto 14px auto;display:flex;justify-content:space-between;align-items:center;gap:12px;background:#0f172a;color:#fff;padding:10px 16px;border-radius:10px;font-family:sans-serif;font-size:13px;">
    <span><strong>${safeTitle}</strong> &bull; Dokumen Analisis Soal A4</span>
    <button onclick="window.print()" style="background:#2563eb;color:#fff;border:none;padding:7px 14px;border-radius:8px;font-weight:700;cursor:pointer;">Cetak / Simpan PDF</button>
  </div>
  <div class="export-sheet">
    ${clone.innerHTML}
  </div>
</body>
</html>`;

      const blob = new Blob([htmlPayload], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analisis-soal-${slug}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setIsExportingHtml(false);
    }
  };

  const renderAnalysisDocument = (isPortalCopy = false) => {
    if (!activeResult) return null;

    const analyzedDate = new Date(activeResult.analyzedAt).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const showKisiKisi = sections.kisiKisi && Array.isArray(activeResult.kisiKisi);
    const showMateri = sections.materiDariSoal && Array.isArray(activeResult.materiDariSoal);
    const showPenyelesaian =
      sections.penyelesaianRinci && Array.isArray(activeResult.penyelesaianRinci);
    const showLatihan =
      sections.latihanSoal && Array.isArray(activeResult.latihanSoalMirip);

    let sectionCounter = 0;

    return (
      <div
        ref={isPortalCopy ? undefined : previewSheetRef}
        className="text-slate-900 font-sans leading-relaxed"
      >
        {/* Kop Dokumen Analisis Soal */}
        <header className="border-t-4 border-blue-700 border-b-2 border-slate-900 pt-4 pb-5 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <img
                src={resolveCourseImageUrl(logoUrl)}
                alt="Logo Sekolah"
                referrerPolicy="no-referrer"
                loading="eager"
                decoding="sync"
                onError={(e) => {
                  const img = e.currentTarget;
                  const fallback = getPublicFallbackImageUrl(logoUrl);
                  if (
                    img.dataset.fallbackApplied !== '1' &&
                    fallback &&
                    img.getAttribute('src') !== fallback
                  ) {
                    img.dataset.fallbackApplied = '1';
                    img.src = fallback;
                  }
                }}
                className="w-11 h-11 rounded-lg object-cover border border-slate-300 shrink-0"
              />
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-700">
                  Lembar Analisis Soal &amp; Pembahasan
                </p>
                <p className="text-xs font-bold text-slate-700">
                  {schoolName} &bull; Labkom Nesaka
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-800 mb-1">
                {activeResult.ringkasanUmum.mataPelajaran} &bull;{' '}
                {activeResult.ringkasanUmum.jenjang}
              </span>
              <p className="text-[11px] text-slate-500 font-medium">
                Dianalisis: {analyzedDate}
              </p>
            </div>
          </div>

          <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight leading-snug">
            {activeResult.title}
          </h1>
          <p className="text-[13px] text-slate-600 leading-relaxed mt-1.5">
            {activeResult.ringkasanUmum.ringkasan}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3.5 pt-3 border-t border-slate-200 text-[11px] font-semibold text-slate-600">
            <span>
              Dokumen Sumber:{' '}
              <strong className="text-slate-900">{activeResult.fileName}</strong>
            </span>
            <span>
              Soal Terdeteksi:{' '}
              <strong className="text-slate-900">
                {activeResult.ringkasanUmum.jumlahSoalTerdeteksi} Butir
              </strong>
            </span>
            <span>
              Tingkat Kesulitan:{' '}
              <strong className="text-slate-900">
                {activeResult.ringkasanUmum.tingkatKesulitanDominan}
              </strong>
            </span>
          </div>
        </header>

        {/* Bagian 1: Kisi-kisi Soal */}
        {showKisiKisi && activeResult.kisiKisi!.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between gap-2 pb-2 mb-3.5 border-b-2 border-slate-200 print-keep-with-next">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-700 text-white text-xs font-extrabold tabular-nums shrink-0">
                  {++sectionCounter}
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Kisi-Kisi Soal
                </h2>
              </div>
              <span className="text-[10.5px] font-bold text-slate-500">
                {activeResult.kisiKisi!.length} Nomor Soal
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-300">
              <table className="w-full border-collapse text-left text-[11.5px] text-slate-800">
                <thead className="bg-slate-100 text-slate-900 font-extrabold border-b border-slate-300">
                  <tr>
                    <th className="px-2.5 py-2 border border-slate-300 text-center w-11">No</th>
                    <th className="px-3 py-2 border border-slate-300">Kompetensi / Capaian</th>
                    <th className="px-3 py-2 border border-slate-300">Materi Pokok</th>
                    <th className="px-3 py-2 border border-slate-300">Indikator Soal</th>
                    <th className="px-2.5 py-2 border border-slate-300 text-center">Level</th>
                    <th className="px-2.5 py-2 border border-slate-300 text-center">Bentuk</th>
                    <th className="px-2.5 py-2 border border-slate-300 text-center">Kesulitan</th>
                  </tr>
                </thead>
                <tbody>
                  {activeResult.kisiKisi!.map((row, idx) => (
                    <tr
                      key={idx}
                      className={
                        idx % 2 === 0
                          ? 'bg-white print-avoid-break'
                          : 'bg-slate-50/70 print-avoid-break'
                      }
                    >
                      <td className="px-2.5 py-2 border border-slate-300 text-center font-extrabold text-blue-800 tabular-nums align-top">
                        {row.noSoal}
                      </td>
                      <td className="px-3 py-2 border border-slate-300 font-semibold text-slate-900 align-top">
                        {row.kompetensiDasar}
                      </td>
                      <td className="px-3 py-2 border border-slate-300 align-top">
                        {row.materiPokok}
                      </td>
                      <td className="px-3 py-2 border border-slate-300 align-top leading-relaxed">
                        {row.indikatorSoal}
                      </td>
                      <td className="px-2.5 py-2 border border-slate-300 text-center font-bold align-top">
                        {row.levelKognitif}
                      </td>
                      <td className="px-2.5 py-2 border border-slate-300 text-center align-top">
                        {row.bentukSoal}
                      </td>
                      <td className="px-2.5 py-2 border border-slate-300 text-center font-bold align-top">
                        {row.tingkatKesulitan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Bagian 2: Materi dari Soal */}
        {showMateri && activeResult.materiDariSoal!.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between gap-2 pb-2 mb-3.5 border-b-2 border-slate-200 print-keep-with-next">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-700 text-white text-xs font-extrabold tabular-nums shrink-0">
                  {++sectionCounter}
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Materi Pembelajaran dari Soal
                </h2>
              </div>
              <span className="text-[10.5px] font-bold text-slate-500">
                {activeResult.materiDariSoal!.length} Topik Materi
              </span>
            </div>

            <div className="space-y-4">
              {activeResult.materiDariSoal!.map((materi, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-xl border border-slate-300 bg-white space-y-3"
                >
                  <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-200">
                    <h3 className="text-[14.5px] font-extrabold text-slate-900 leading-snug">
                      {idx + 1}. {materi.judulTopik}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 shrink-0">
                      {materi.konsepUtama}
                    </span>
                  </div>

                  <div className="text-[12.5px] text-slate-800 leading-relaxed whitespace-pre-line">
                    {materi.penjelasanSingkat}
                  </div>

                  {materi.rumusAtauAturanKunci && materi.rumusAtauAturanKunci.length > 0 && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 print-avoid-break">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800 mb-1.5">
                        Rumus &amp; Aturan Kunci:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-[12px] font-semibold text-slate-800">
                        {materi.rumusAtauAturanKunci.map((r, rIdx) => (
                          <li key={rIdx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {materi.contohPenerapan && (
                    <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-[12px] text-slate-800 whitespace-pre-line print-avoid-break">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-900 mb-1">
                        Contoh Penerapan:
                      </p>
                      {materi.contohPenerapan}
                    </div>
                  )}

                  {materi.tipsMemahami && (
                    <div className="text-[12px] text-slate-700 bg-amber-50/70 border-l-4 border-amber-500 px-3 py-2 rounded-r-lg print-avoid-break">
                      <strong className="text-amber-900">Tips Cepat &amp; Catatan Penting: </strong>
                      {materi.tipsMemahami}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bagian 3: Penyelesaian Soal Secara Rinci */}
        {showPenyelesaian && activeResult.penyelesaianRinci!.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between gap-2 pb-2 mb-3.5 border-b-2 border-slate-200 print-keep-with-next">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-900 text-white text-xs font-extrabold tabular-nums shrink-0">
                  {++sectionCounter}
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Penyelesaian Soal Secara Rinci
                </h2>
              </div>
              <span className="text-[10.5px] font-bold text-slate-500">
                {activeResult.penyelesaianRinci!.length} Soal Dibahas
              </span>
            </div>

            <div className="space-y-4">
              {activeResult.penyelesaianRinci!.map((sol, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-300 bg-white print-avoid-break"
                >
                  <div className="flex items-start gap-2.5 mb-2.5 pb-2 border-b border-slate-200">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white text-[11px] font-extrabold shrink-0">
                      Soal {sol.nomorSoal}
                    </span>
                    <p className="text-[12.5px] font-bold text-slate-900 leading-snug">
                      {sol.teksSoalRingkas}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-3 mb-3 text-[12px]">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                        Diketahui:
                      </p>
                      {sol.diketahui && sol.diketahui.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-800">
                          {sol.diketahui.map((d, dIdx) => (
                            <li key={dIdx}>{d}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-600 italic">Berdasarkan informasi soal</p>
                      )}
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                        Ditanyakan:
                      </p>
                      <p className="text-slate-800 font-medium">{sol.ditanyakan}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800 mb-1.5">
                      Langkah Penyelesaian:
                    </p>
                    <ol className="list-decimal pl-5 space-y-1 text-[12.5px] text-slate-800 leading-relaxed">
                      {sol.langkahPenyelesaian.map((step, sIdx) => (
                        <li key={sIdx} className="pl-1">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-[12px]">
                    <p className="font-extrabold text-emerald-900">
                      Jawaban Benar: {sol.jawabanBenar}
                    </p>
                    {sol.penjelasanMengapaBenar && (
                      <p className="text-emerald-950/90 mt-1 leading-relaxed">
                        {sol.penjelasanMengapaBenar}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bagian 4: Latihan Soal yang Mirip */}
        {showLatihan && activeResult.latihanSoalMirip!.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between gap-2 pb-2 mb-3.5 border-b-2 border-slate-200 print-keep-with-next">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-purple-700 text-white text-xs font-extrabold tabular-nums shrink-0">
                  {++sectionCounter}
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Latihan Soal yang Mirip
                </h2>
              </div>
              <span className="text-[10.5px] font-bold text-slate-500">
                {showPracticeAnswers ? 'Dengan Kunci & Pembahasan' : 'Lembar Latihan Siswa'}
              </span>
            </div>

            <div className="space-y-3.5">
              {activeResult.latihanSoalMirip!.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="p-3.5 rounded-xl border border-slate-300 bg-white print-avoid-break"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                      {q.konteksAtauTopik}
                    </span>
                  </div>

                  <p className="text-[12.5px] font-bold text-slate-900 leading-snug mb-2.5">
                    <span className="text-blue-700 mr-1.5">{q.nomor || qIdx + 1}.</span>
                    {q.pertanyaan}
                  </p>

                  {q.pilihanGanda && q.pilihanGanda.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-1.5 text-[12px]">
                      {q.pilihanGanda.map((opt, optIdx) => {
                        const letter = OPTION_LETTERS[optIdx] || String(optIdx + 1);
                        const cleanOpt = stripOptionPrefix(opt);
                        const isMatch =
                          showPracticeAnswers &&
                          q.kunciJawaban &&
                          (q.kunciJawaban.trim().toUpperCase().startsWith(letter) ||
                            q.kunciJawaban.trim().toLowerCase() === cleanOpt.toLowerCase());
                        return (
                          <div
                            key={optIdx}
                            className={
                              isMatch
                                ? 'px-2.5 py-1.5 rounded border border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold flex items-start gap-1.5'
                                : 'px-2.5 py-1.5 rounded border border-slate-200 bg-slate-50/50 text-slate-800 flex items-start gap-1.5'
                            }
                          >
                            <span className="font-extrabold shrink-0">{letter}.</span>
                            <span className="flex-1">{cleanOpt}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {showPracticeAnswers && (
                    <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200 text-[11.5px] text-slate-700 leading-relaxed">
                      <span className="font-bold text-emerald-700">
                        Kunci: {q.kunciJawaban}{' '}
                      </span>
                      {q.pembahasanSingkat && (
                        <span>&mdash; {q.pembahasanSingkat}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer Dokumen */}
        <footer className="mt-8 pt-3 border-t border-slate-300 flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-slate-500">
          <span>
            {schoolName} &bull; Portal Pembelajaran Informatika
          </span>
          <span>
            {activeResult.title} &bull; Dicetak {analyzedDate}
          </span>
        </footer>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Panel Input & Konfigurasi Analisis */}
      <form
        onSubmit={runAnalysis}
        className="bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-xs space-y-5"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles size={18} className="text-brand dark:text-blue-400" />
              Analisis Dokumen Soal Otomatis
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Unggah berkas soal (PDF, DOC, DOCX, TXT, Excel, atau foto soal) untuk disusun menjadi kisi-kisi, ringkasan materi, pembahasan rinci, dan latihan soal serupa.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Kiri: Judul & Upload File */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <label
                htmlFor="analysis-title-input"
                className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Judul Dokumen Analisis
              </label>
              <input
                id="analysis-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Analisis Soal Sumatif Berpikir Komputasional Kelas VIII"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Upload File Dokumen Soal
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md,.csv,.rtf,.html,.htm,.xlsx,.xls,.xml,.json,.png,.jpg,.jpeg,.webp"
                onChange={(e) => handleFileChosen(e.target.files?.[0])}
                className="hidden"
              />
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFileChosen(e.dataTransfer.files?.[0]);
                }}
                className={`rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-brand bg-blue-50/80 dark:bg-blue-950/50'
                    : selectedFile
                      ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/30 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/50'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-brand hover:bg-blue-50/30 dark:hover:bg-slate-800'
                }`}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {formatBytes(selectedFile.size)} &bull; Siap dianalisis
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 shrink-0"
                    >
                      Ganti File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-brand dark:text-blue-400 mx-auto flex items-center justify-center">
                      <FileUp size={22} />
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Klik atau seret file dokumen ke sini
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Mendukung PDF, DOC, DOCX, TXT, RTF, CSV, Excel (.xls/.xlsx), HTML, dan foto soal (maks. 15 MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Kanan: 4 Pilihan Centang */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Pilih Bagian yang Ditampilkan &amp; Dianalisis
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSections({
                      kisiKisi: true,
                      materiDariSoal: true,
                      penyelesaianRinci: true,
                      latihanSoal: true,
                    })
                  }
                  className="text-[11px] font-bold text-brand dark:text-blue-400 hover:underline"
                >
                  Centang Semua
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SECTION_OPTIONS.map((opt) => {
                  const checked = sections[opt.key];
                  return (
                    <label
                      key={opt.key}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all select-none ${
                        checked
                          ? 'bg-blue-50/70 dark:bg-blue-950/50 border-blue-400 dark:border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSection(opt.key)}
                        className="sr-only"
                      />
                      <span
                        className={`mt-0.5 shrink-0 ${
                          checked ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {checked ? <CheckSquare size={18} /> : <Square size={18} />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-extrabold text-slate-900 dark:text-white">
                          {opt.label}
                        </span>
                        <span className="block text-[10.5px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                          {opt.desc}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {selectedCount} dari 4 komponen dipilih
              </span>
              <button
                type="submit"
                disabled={isAnalyzing || !selectedFile || selectedCount === 0}
                className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-extrabold shadow-md shadow-brand/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sedang Menganalisis Dokumen...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Analisis Soal Sekarang
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}
      </form>

      {/* Riwayat Analisis Tersimpan */}
      {savedHistory.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <History size={14} className="text-brand dark:text-blue-400" />
              Riwayat Analisis Tersimpan ({savedHistory.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedHistory.map((item) => {
              const isCurrent = activeResult?.id === item.id;
              return (
                <div
                  key={item.id}
                  className={`inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectHistory(item)}
                    className="truncate max-w-[220px] text-left"
                    title={`${item.title} (${item.fileName})`}
                  >
                    {item.title}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteHistory(item.id)}
                    className={`p-1 rounded-lg transition-colors ${
                      isCurrent
                        ? 'hover:bg-blue-500 text-blue-100 hover:text-white'
                        : 'hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
                    }`}
                    aria-label="Hapus riwayat analisis"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Peringatan jika ada bagian yang baru dicentang setelah analisis */}
      {activeResult && missingRequestedSections.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-semibold flex flex-wrap items-center justify-between gap-3">
          <span>
            Bagian <strong>{missingRequestedSections.join(', ')}</strong> belum dibuat pada hasil analisis ini.
          </span>
          {selectedFile ? (
            <button
              type="button"
              onClick={() => runAnalysis()}
              disabled={isAnalyzing}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              Analisis Ulang Lengkap
            </button>
          ) : (
            <span className="text-[11px] text-amber-700 dark:text-amber-300">
              Unggah ulang file lalu klik Analisis Soal untuk melengkapinya.
            </span>
          )}
        </div>
      )}

      {/* Area Dokumen Hasil Analisis & Tombol Cetak */}
      {activeResult ? (
        <div className="space-y-3">
          <div className="bg-slate-900 text-white rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md border border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold text-slate-300 mr-1 flex items-center gap-1.5">
                <Table2 size={14} className="text-blue-400" />
                Tampilan &amp; Cetak:
              </span>
              {SECTION_OPTIONS.map((opt) => {
                const checked = sections[opt.key];
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => toggleSection(opt.key)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1.5 ${
                      checked
                        ? 'bg-blue-600/30 border-blue-400/70 text-blue-100'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {checked ? <CheckCircle2 size={12} /> : <Square size={12} />}
                    {opt.label}
                  </button>
                );
              })}

              {sections.latihanSoal && activeResult.latihanSoalMirip && (
                <button
                  type="button"
                  onClick={() => setShowPracticeAnswers((v) => !v)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1.5 ${
                    showPracticeAnswers
                      ? 'bg-emerald-600/30 border-emerald-400/70 text-emerald-100'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <KeyRound size={12} />
                  Kunci Latihan
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadHtml}
                disabled={isExportingHtml}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-60"
              >
                <Download size={14} />
                {isExportingHtml ? 'Menyiapkan...' : 'Unduh (.html)'}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                disabled={isPreparingPrint}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-60"
              >
                <Printer size={15} />
                {isPreparingPrint ? 'Menyiapkan...' : 'Cetak / Simpan PDF'}
              </button>
            </div>
          </div>

          {/* Pratinjau Lembar A4 Rapi (Kertas tetap putih) */}
          <div className="bg-slate-200/80 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-2xl p-4 sm:p-6 overflow-x-auto">
            <div className="max-w-[210mm] mx-auto bg-white text-slate-900 rounded-xl shadow-xl border border-slate-300 px-6 py-8 sm:px-11 sm:py-10">
              {renderAnalysisDocument(false)}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-900/70 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 text-center text-slate-500 dark:text-slate-400 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mx-auto flex items-center justify-center text-slate-400 dark:text-slate-500">
            <BookOpen size={22} />
          </div>
          <p className="text-sm font-extrabold text-slate-700 dark:text-slate-200">
            Belum Ada Dokumen yang Dianalisis
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Isi judul, unggah dokumen soal di atas, centang komponen yang diinginkan, lalu klik <strong>Analisis Soal Sekarang</strong>. Hasilnya akan tersusun rapi dan siap dicetak.
          </p>
        </div>
      )}

      {/* Portal Cetak A4 Bersih di Root Body */}
      {!suppressPrintPortal &&
        activeResult &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={portalSheetRef}
            id="printable-material-portal"
            aria-hidden="true"
            className="fixed -left-[99999px] top-0 w-[210mm] opacity-0 pointer-events-none print:static print:left-auto print:w-full print:opacity-100 print:pointer-events-auto print:block bg-white text-slate-900"
          >
            {renderAnalysisDocument(true)}
          </div>,
          document.body
        )}
    </div>
  );
};
