import React, { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Printer,
  X,
  FileText,
  Download,
  CheckCircle2,
  BookOpen,
  ListChecks,
  KeyRound,
  SplitSquareVertical,
  GraduationCap,
} from 'lucide-react';
import { Topic } from '../types';
import { resolveCourseImageUrl, getPublicFallbackImageUrl } from '../courseImageMap';

export interface PrintableCourse {
  id: string;
  title: string;
  description: string;
  level?: string;
  topics: Topic[];
}

interface AdminMaterialPrintModalProps {
  course: PrintableCourse;
  schoolName?: string;
  logoUrl?: string;
  onClose: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

export const AdminMaterialPrintModal: React.FC<AdminMaterialPrintModalProps> = ({
  course,
  schoolName = 'SMPN 1 Kawali',
  logoUrl = '/images/labkom_nesaka_logo.jpg',
  onClose,
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('ALL');
  const [includeToc, setIncludeToc] = useState<boolean>(true);
  const [includeQuiz, setIncludeQuiz] = useState<boolean>(true);
  const [includeAnswers, setIncludeAnswers] = useState<boolean>(false);
  const [pageBreakPerTopic, setPageBreakPerTopic] = useState<boolean>(true);

  const [isPreparingPrint, setIsPreparingPrint] = useState<boolean>(false);
  const [isExportingHtml, setIsExportingHtml] = useState<boolean>(false);

  const previewDocRef = useRef<HTMLDivElement | null>(null);
  const portalDocRef = useRef<HTMLDivElement | null>(null);

  const visibleTopics = useMemo(() => {
    if (selectedTopicId === 'ALL') return course.topics;
    return course.topics.filter((t) => t.id === selectedTopicId);
  }, [course.topics, selectedTopicId]);

  const totalQuizCount = useMemo(
    () => visibleTopics.reduce((sum, t) => sum + (t.quiz?.length || 0), 0),
    [visibleTopics]
  );

  const printedDate = useMemo(
    () =>
      new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    []
  );

  const waitForContainerImages = async (container: HTMLElement | null) => {
    if (!container) return;
    const imgs = Array.from(container.querySelectorAll('img'));
    await Promise.race([
      Promise.all(
        imgs.map(async (img) => {
          if (!img.complete) {
            await new Promise<void>((resolve) => {
              const onDone = () => {
                img.removeEventListener('load', onDone);
                img.removeEventListener('error', onDone);
                resolve();
              };
              img.addEventListener('load', onDone);
              img.addEventListener('error', onDone);
            });
          }
          if (typeof img.decode === 'function') {
            try {
              await img.decode();
            } catch {
              // ignore decode rejection for errored images
            }
          }
        })
      ),
      new Promise<void>((resolve) => setTimeout(resolve, 2500)),
    ]);
  };

  const handlePrint = async () => {
    setIsPreparingPrint(true);
    try {
      await Promise.all([
        waitForContainerImages(portalDocRef.current),
        waitForContainerImages(previewDocRef.current),
      ]);
      window.print();
    } catch (err) {
      console.error('Gagal membuka dialog cetak:', err);
    } finally {
      setIsPreparingPrint(false);
    }
  };

  const toDataUrl = async (imgSrc: string): Promise<string> => {
    if (!imgSrc || imgSrc.startsWith('data:')) return imgSrc;
    try {
      const response = await fetch(imgSrc);
      if (!response.ok) return imgSrc;
      const blob = await response.blob();
      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () =>
          resolve(typeof reader.result === 'string' ? reader.result : imgSrc);
        reader.onerror = () => resolve(imgSrc);
        reader.readAsDataURL(blob);
      });
    } catch {
      return imgSrc;
    }
  };

  const handleDownloadHtml = async () => {
    if (!previewDocRef.current || typeof document === 'undefined') return;
    setIsExportingHtml(true);

    try {
      await waitForContainerImages(previewDocRef.current);

      const clone = previewDocRef.current.cloneNode(true) as HTMLDivElement;
      const clonedImages = Array.from(clone.querySelectorAll('img'));
      await Promise.all(
        clonedImages.map(async (img) => {
          const currentSrc = img.getAttribute('src') || img.src;
          if (!currentSrc) return;
          const inlined = await toDataUrl(currentSrc);
          img.setAttribute('src', inlined);
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

      const safeTitle = `${course.title}${
        selectedTopicId !== 'ALL' && visibleTopics[0] ? ` - ${visibleTopics[0].title}` : ''
      }`;

      const htmlPayload = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <base href="${window.location.origin}/" />
  <title>${safeTitle} — ${schoolName}</title>
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
    <span><strong>${safeTitle}</strong> &bull; Dokumen Siap Cetak A4</span>
    <button onclick="window.print()" style="background:#2563eb;color:#fff;border:none;padding:7px 14px;border-radius:8px;font-weight:700;cursor:pointer;">Cetak / Simpan PDF</button>
  </div>
  <div class="export-sheet">
    ${clone.innerHTML}
  </div>
</body>
</html>`;

      const blob = new Blob([htmlPayload], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `materi-${course.id}${selectedTopicId !== 'ALL' ? `-${selectedTopicId}` : ''}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setIsExportingHtml(false);
    }
  };

  const renderDocumentBody = (isPortalCopy = false) => (
    <div
      ref={isPortalCopy ? undefined : previewDocRef}
      className="text-slate-900 font-sans leading-relaxed"
    >
      {/* Header / Kop Modul Resmi */}
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
                if (img.dataset.fallbackApplied !== '1' && fallback && img.getAttribute('src') !== fallback) {
                  img.dataset.fallbackApplied = '1';
                  img.src = fallback;
                }
              }}
              className="w-11 h-11 rounded-lg object-cover border border-slate-300 shrink-0"
            />
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-700">
                Modul Pembelajaran Informatika
              </p>
              <p className="text-xs font-bold text-slate-700">
                {schoolName} &bull; Labkom Nesaka
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            {course.level && (
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-800 mb-1">
                {course.level}
              </span>
            )}
            <p className="text-[11px] text-slate-500 font-medium">
              Dicetak: {printedDate}
            </p>
          </div>
        </div>

        <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight leading-snug">
          {course.title}
        </h1>
        <p className="text-[13px] text-slate-600 leading-relaxed mt-1.5 max-w-3xl">
          {course.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-200 text-[11px] font-semibold text-slate-600">
          <span>
            Cakupan:{' '}
            <strong className="text-slate-900">
              {selectedTopicId === 'ALL'
                ? `Seluruh Modul (${visibleTopics.length} Bab)`
                : visibleTopics[0]?.title || '1 Bab'}
            </strong>
          </span>
          {includeQuiz && totalQuizCount > 0 && (
            <span>
              Latihan Pemahaman:{' '}
              <strong className="text-slate-900">{totalQuizCount} Butir Soal</strong>
            </span>
          )}
          {includeQuiz && includeAnswers && totalQuizCount > 0 && (
            <span className="text-emerald-700 font-bold">
              Mode Guru (Dengan Kunci &amp; Pembahasan)
            </span>
          )}
        </div>
      </header>

      {/* Daftar Isi */}
      {includeToc && visibleTopics.length > 1 && (
        <section className="mb-7 p-4 rounded-xl border border-slate-300 bg-slate-50/70 print-avoid-break">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-700 mb-3 flex items-center gap-2">
            <BookOpen size={14} className="text-blue-700" />
            Daftar Isi Materi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
            {visibleTopics.map((topic, idx) => (
              <div
                key={topic.id}
                className="flex items-baseline justify-between gap-2 text-[12px] py-1 border-b border-dashed border-slate-200 last:border-b-0"
              >
                <span className="font-semibold text-slate-800">
                  <span className="text-blue-700 font-extrabold mr-1.5 tabular-nums">
                    {String(idx + 1).padStart(2, '0')}.
                  </span>
                  {topic.title}
                </span>
                {includeQuiz && topic.quiz?.length > 0 && (
                  <span className="text-[10px] font-bold text-slate-500 shrink-0 tabular-nums">
                    {topic.quiz.length} soal
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Konten Setiap Topik */}
      <div className="space-y-8">
        {visibleTopics.map((topic, topicIdx) => (
          <article
            key={topic.id}
            className={
              topicIdx > 0 && pageBreakPerTopic ? 'print-break-before pt-1' : 'pt-1'
            }
          >
            {/* Header Bab */}
            <div className="flex items-center justify-between gap-3 pb-2.5 mb-4 border-b-2 border-slate-200 print-keep-with-next">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-slate-900 text-white text-[10px] font-extrabold uppercase tracking-wider tabular-nums shrink-0">
                  Bab {String(topicIdx + 1).padStart(2, '0')}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                  {topic.title}
                </h2>
              </div>
            </div>

            {/* Isi Markdown Rapi untuk Kertas Putih */}
            <div className="print-markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h3 className="text-[17px] font-extrabold text-slate-900 mt-4 mb-2.5 pl-3 border-l-4 border-blue-700 tracking-tight print-keep-with-next">
                      {children}
                    </h3>
                  ),
                  h2: ({ children }) => (
                    <h4 className="text-[15px] font-extrabold text-slate-900 mt-5 mb-2 pb-1 border-b border-slate-200 tracking-tight print-keep-with-next">
                      {children}
                    </h4>
                  ),
                  h3: ({ children }) => (
                    <h5 className="text-[13.5px] font-bold text-blue-900 mt-4 mb-1.5 tracking-tight print-keep-with-next">
                      {children}
                    </h5>
                  ),
                  p: ({ node, children }: any) => {
                    const hasBlockChild = node?.children?.some(
                      (c: any) =>
                        c.tagName === 'img' ||
                        (c.type === 'element' &&
                          (c.tagName === 'img' || c.tagName === 'figure' || c.tagName === 'div'))
                    );
                    if (hasBlockChild) {
                      return (
                        <div className="text-[13px] leading-[1.72] text-slate-800 mb-3">
                          {children}
                        </div>
                      );
                    }
                    return (
                      <p className="text-[13px] leading-[1.72] text-slate-800 mb-3">
                        {children}
                      </p>
                    );
                  },
                  strong: ({ children }) => (
                    <strong className="font-bold text-slate-950">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-slate-800">{children}</em>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 space-y-1.5 mb-3.5 text-[13px] leading-[1.68] text-slate-800 [&_ul]:mt-1.5 [&_ul]:mb-1 [&_ol]:mt-1.5 [&_ol]:mb-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-5 space-y-1.5 mb-3.5 text-[13px] leading-[1.68] text-slate-800 [&_ul]:mt-1.5 [&_ul]:mb-1 [&_ol]:mt-1.5 [&_ol]:mb-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="pl-1 leading-[1.68] [&>p]:mb-1">{children}</li>
                  ),
                  img: ({ src, alt, ...props }: any) => {
                    const resolvedSrc = resolveCourseImageUrl(src);
                    const fallbackSrc = getPublicFallbackImageUrl(src);
                    return (
                      <figure className="my-4 w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50/50 text-center print-avoid-break">
                        <img
                          src={resolvedSrc}
                          alt={alt || 'Ilustrasi Materi'}
                          referrerPolicy="no-referrer"
                          loading="eager"
                          decoding="sync"
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (img.dataset.fallbackApplied !== '1' && fallbackSrc && img.getAttribute('src') !== fallbackSrc) {
                              img.dataset.fallbackApplied = '1';
                              img.src = fallbackSrc;
                            }
                          }}
                          className="max-h-[240px] w-auto max-w-full mx-auto object-contain rounded"
                          {...props}
                        />
                        {alt && (
                          <figcaption className="mt-2 text-[11px] text-slate-600 italic font-medium">
                            Gambar: {alt}
                          </figcaption>
                        )}
                      </figure>
                    );
                  },
                  table: ({ children }: any) => (
                    <div className="my-4 overflow-x-auto rounded-lg border border-slate-300 print-avoid-break">
                      <table className="w-full border-collapse text-left text-[12px] text-slate-800">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }: any) => (
                    <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                      {children}
                    </thead>
                  ),
                  th: ({ children }: any) => (
                    <th className="px-3 py-2 font-bold border border-slate-300 text-slate-900">
                      {children}
                    </th>
                  ),
                  td: ({ children }: any) => (
                    <td className="px-3 py-2 border border-slate-300 align-top">
                      {children}
                    </td>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="my-3.5 pl-3.5 pr-3 py-2.5 border-l-4 border-blue-700 bg-blue-50/50 rounded-r-lg text-[12.5px] leading-relaxed text-slate-700 print-avoid-break [&>p]:mb-0">
                      {children}
                    </blockquote>
                  ),
                  hr: () => <hr className="my-4 border-slate-200" />,
                  code({ inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const lang = match ? match[1] : '';
                    const isScratch = lang === 'scratch';
                    return !inline && match ? (
                      <div className="my-3.5 rounded-lg border border-slate-300 overflow-hidden bg-slate-50 print-avoid-break">
                        <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-300 flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600">
                          <span>{isScratch ? 'Balok Logika Scratch' : `Kode ${lang}`}</span>
                          <span>Contoh Program</span>
                        </div>
                        <SyntaxHighlighter
                          style={oneLight}
                          language={isScratch ? 'javascript' : lang}
                          PreTag="div"
                          wrapLongLines={true}
                          customStyle={{
                            margin: 0,
                            padding: '0.75rem 0.95rem',
                            fontSize: '11.5px',
                            lineHeight: '1.55',
                            background: '#f8fafc',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code
                        className="font-mono text-[11.5px] bg-slate-100 text-slate-900 border border-slate-200 px-1 py-0.5 rounded"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {topic.content}
              </ReactMarkdown>
            </div>

            {/* Latihan Soal per Bab (Opsional) */}
            {includeQuiz && topic.quiz && topic.quiz.length > 0 && (
              <section className="mt-6 pt-4 border-t border-slate-300">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-800 mb-3 flex items-center gap-2 print-keep-with-next">
                  <ListChecks size={14} className="text-blue-700" />
                  Latihan Pemahaman &mdash; {topic.title}
                </h3>
                <div className="space-y-3">
                  {topic.quiz.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-3.5 rounded-lg border border-slate-300 bg-white print-avoid-break"
                    >
                      <p className="text-[12.5px] font-bold text-slate-900 leading-snug mb-2">
                        <span className="text-blue-700 mr-1.5">{qIdx + 1}.</span>
                        {q.question}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-1.5 text-[12px]">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = optIdx === q.correctAnswer;
                          return (
                            <div
                              key={optIdx}
                              className={
                                includeAnswers && isCorrect
                                  ? 'px-2.5 py-1.5 rounded border border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold flex items-start gap-1.5'
                                  : 'px-2.5 py-1.5 rounded border border-slate-200 bg-slate-50/50 text-slate-800 flex items-start gap-1.5'
                              }
                            >
                              <span className="font-extrabold shrink-0">
                                {OPTION_LETTERS[optIdx] || optIdx + 1}.
                              </span>
                              <span className="flex-1">{opt}</span>
                              {includeAnswers && isCorrect && (
                                <CheckCircle2
                                  size={13}
                                  className="text-emerald-600 shrink-0 mt-0.5"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {includeAnswers && q.explanation && (
                        <div className="mt-2 pt-2 border-t border-dashed border-slate-200 text-[11.5px] text-slate-700 leading-relaxed">
                          <span className="font-bold text-emerald-700">Pembahasan: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </article>
        ))}
      </div>

      {/* Footer Dokumen */}
      <footer className="mt-8 pt-3 border-t border-slate-300 flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-slate-500">
        <span>
          {schoolName} &bull; Portal Pembelajaran Informatika
        </span>
        <span>
          {course.title} &bull; {visibleTopics.length} Topik
        </span>
      </footer>
    </div>
  );

  return (
    <>
      {/* Modal Pratinjau Cetak Interaktif (Tersembunyi saat print) */}
      <div className="fixed inset-0 z-[130] bg-slate-900/75 backdrop-blur-sm flex flex-col print:hidden">
        {/* Toolbar Kontrol Cetak */}
        <div className="bg-slate-950 text-white border-b border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
                Pratinjau Cetak Materi: {course.title}
              </h3>
              <p className="text-[11px] text-slate-400">
                Format dokumen A4 rapi siap cetak atau simpan sebagai PDF
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Pilih Semua / Per Bab */}
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              aria-label="Pilih topik yang akan dicetak"
              className="bg-slate-900 border border-slate-700 text-slate-100 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-blue-500 max-w-[220px]"
            >
              <option value="ALL">Semua Topik ({course.topics.length} Bab)</option>
              {course.topics.map((t, idx) => (
                <option key={t.id} value={t.id}>
                  Bab {idx + 1}: {t.title}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setIncludeToc((v) => !v)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                includeToc
                  ? 'bg-blue-600/20 border-blue-500/60 text-blue-200'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap size={14} />
              Daftar Isi
            </button>

            <button
              type="button"
              onClick={() => setIncludeQuiz((v) => !v)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                includeQuiz
                  ? 'bg-blue-600/20 border-blue-500/60 text-blue-200'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListChecks size={14} />
              Latihan Soal
            </button>

            {includeQuiz && (
              <button
                type="button"
                onClick={() => setIncludeAnswers((v) => !v)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  includeAnswers
                    ? 'bg-emerald-600/25 border-emerald-500/60 text-emerald-200'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <KeyRound size={14} />
                Kunci Jawaban
              </button>
            )}

            {selectedTopicId === 'ALL' && course.topics.length > 1 && (
              <button
                type="button"
                onClick={() => setPageBreakPerTopic((v) => !v)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  pageBreakPerTopic
                    ? 'bg-blue-600/20 border-blue-500/60 text-blue-200'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <SplitSquareVertical size={14} />
                Pisah Halaman/Bab
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadHtml}
              disabled={isExportingHtml}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-60"
              title="Unduh file HTML siap cetak"
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

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-all"
              aria-label="Tutup pratinjau cetak"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Area Kertas Pratinjau A4 */}
        <div className="flex-1 overflow-y-auto bg-slate-700/80 p-4 sm:p-8 custom-scrollbar">
          <div className="max-w-[210mm] mx-auto bg-white rounded-xl shadow-2xl border border-slate-300 px-6 py-8 sm:px-12 sm:py-10">
            {renderDocumentBody(false)}
          </div>
        </div>
      </div>

      {/* Portal Cetak A4 Bersih di Root Body (Dirender off-screen agar gambar siap didekode sebelum print) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={portalDocRef}
            id="printable-material-portal"
            aria-hidden="true"
            className="fixed -left-[99999px] top-0 w-[210mm] opacity-0 pointer-events-none print:static print:left-auto print:w-full print:opacity-100 print:pointer-events-auto print:block bg-white text-slate-900"
          >
            {renderDocumentBody(true)}
          </div>,
          document.body
        )}
    </>
  );
};
