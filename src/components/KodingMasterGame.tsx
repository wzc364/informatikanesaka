/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Star,
  ArrowRight,
  RotateCw,
  Lightbulb,
  Volume2,
  VolumeX,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  StepForward,
  Repeat,
  Layers,
  Terminal,
  BookOpen,
  X,
  Compass,
  Zap
} from 'lucide-react';
import { cn } from '../utils';
import { doc, setDoc, getDocs, query, collection, where } from 'firebase/firestore';
import { db } from '../firebase';
import kodingMenuHeroImg from '../assets/images/koding_menu_hero_1795346189658.jpg';
import kodingRobotPortraitImg from '../assets/images/koding_robot_portrait_1795346190591.jpg';

export type Direction = 0 | 1 | 2 | 3; // 0: East, 1: South, 2: West, 3: North

export type CmdType = 'MOVE' | 'RIGHT' | 'LEFT' | 'LOOP' | 'CALL_F1';

export interface CmdBlock {
  id: string;
  type: CmdType;
  count?: number; // for LOOP (2..6)
  children?: CmdBlock[]; // for LOOP
}

export interface KodingStage {
  id: number;
  chapter: number; // 1..6
  title: string;
  subtitle: string;
  concept: string;
  parBlocks: number; // optimal block count for 3 stars
  hint: string;
  allowLoop: boolean;
  allowF1: boolean;
  startDir: Direction;
  map: string[]; // '#'=wall, '.'=floor, 'S'=start, 'G'=goal, 'D'=gem, 'A'=portal A, 'B'=portal B, 'K'=switch, 'L'=laser gate, 'I'=ice slide, '~'=pit
}

export interface StageProgress {
  stars: number; // 1..3
  bestBlocks: number;
  score: number;
}

const CHAPTERS = [
  {
    id: 1,
    name: 'Bab 1: Sekuens Dasar',
    shortName: 'Kota Sekuens',
    desc: 'Urutan langkah & arah belok',
    emoji: '🤖',
    range: [1, 6],
    activeBg: 'bg-sky-500/20 border-sky-400 text-white shadow-sky-500/15',
    badgeColor: 'text-sky-300',
    barColor: 'bg-sky-400',
  },
  {
    id: 2,
    name: 'Bab 2: Koleksi & Portal',
    shortName: 'Dimensi Portal',
    desc: 'Permata data & teleportasi',
    emoji: '🌀',
    range: [7, 12],
    activeBg: 'bg-violet-500/20 border-violet-400 text-white shadow-violet-500/15',
    badgeColor: 'text-violet-300',
    barColor: 'bg-violet-400',
  },
  {
    id: 3,
    name: 'Bab 3: Kuasa Perulangan',
    shortName: 'Lembah Loop',
    desc: 'Efisiensi kode dengan LOOP',
    emoji: '🔁',
    range: [13, 18],
    activeBg: 'bg-emerald-500/20 border-emerald-400 text-white shadow-emerald-500/15',
    badgeColor: 'text-emerald-300',
    barColor: 'bg-emerald-400',
  },
  {
    id: 4,
    name: 'Bab 4: Gerbang & Es Licin',
    shortName: 'Benteng Es',
    desc: 'Sakelar laser & lintasan es',
    emoji: '❄️',
    range: [19, 24],
    activeBg: 'bg-cyan-500/20 border-cyan-400 text-white shadow-cyan-500/15',
    badgeColor: 'text-cyan-300',
    barColor: 'bg-cyan-400',
  },
  {
    id: 5,
    name: 'Bab 5: Fungsi & Modular',
    shortName: 'Lab Fungsi F1',
    desc: 'Subrutin F1 & pola berulang',
    emoji: '🧩',
    range: [25, 30],
    activeBg: 'bg-rose-500/20 border-rose-400 text-white shadow-rose-500/15',
    badgeColor: 'text-rose-300',
    barColor: 'bg-rose-400',
  },
  {
    id: 6,
    name: 'Bab 6: Grandmaster Kode',
    shortName: 'Arena Juara',
    desc: 'Ujian algoritma terpadu',
    emoji: '👑',
    range: [31, 36],
    activeBg: 'bg-amber-500/20 border-amber-400 text-white shadow-amber-500/15',
    badgeColor: 'text-amber-300',
    barColor: 'bg-amber-400',
  },
] as const;

function getCodingRank(stars: number): { label: string; colorClass: string } {
  if (stars >= 96) return { label: 'Grandmaster Koding', colorClass: 'text-amber-300' };
  if (stars >= 65) return { label: 'Arsitek Fungsi', colorClass: 'text-rose-300' };
  if (stars >= 36) return { label: 'Master Perulangan', colorClass: 'text-emerald-300' };
  if (stars >= 15) return { label: 'Penjelajah Logika', colorClass: 'text-violet-300' };
  if (stars >= 3) return { label: 'Petualang Kode', colorClass: 'text-sky-300' };
  return { label: 'Kadet Robot Baru', colorClass: 'text-cyan-300' };
}

function RobotPortraitThumb({
  className,
  variant = 'normal',
}: {
  className?: string;
  variant?: 'normal' | 'win' | 'fail';
}) {
  const ringCls =
    variant === 'win'
      ? 'border-emerald-400 shadow-emerald-500/25'
      : variant === 'fail'
      ? 'border-rose-400 shadow-rose-500/25'
      : 'border-sky-400/60 shadow-sky-500/20';

  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden border-2 bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 shadow-lg shrink-0',
        ringCls,
        className
      )}
    >
      <img
        src={kodingRobotPortraitImg}
        alt="Maskot Robot Byte Koding Master"
        referrerPolicy="no-referrer"
        className={cn(
          'w-full h-full object-cover',
          variant === 'fail' && 'saturate-75 brightness-90'
        )}
      />
    </div>
  );
}

function MiniStagePreview({ map }: { map: string[] }) {
  const rows = map.length;
  const cols = map[0]?.length || 6;
  return (
    <div
      className="bg-slate-950 p-1.5 rounded-xl border border-slate-700/80 shrink-0 shadow-inner"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: '1.5px',
        width: `${Math.min(76, Math.max(54, cols * 8))}px`,
      }}
      aria-hidden="true"
    >
      {map.flatMap((row, y) =>
        row.split('').map((ch, x) => {
          let cls = 'bg-slate-200'; // '.' walkable bright road!
          if (ch === '#') cls = 'bg-slate-800'; // solid dark wall
          else if (ch === '~') cls = 'bg-rose-950 ring-1 ring-inset ring-rose-500/70';
          else if (ch === 'L') cls = 'bg-rose-500';
          else if (ch === 'I') cls = 'bg-sky-300';
          else if (ch === 'S') cls = 'bg-emerald-500';
          else if (ch === 'G') cls = 'bg-amber-400';
          else if (ch === 'D') cls = 'bg-cyan-500';
          else if (ch === 'K') cls = 'bg-amber-500';
          else if (ch === 'A' || ch === 'B') cls = 'bg-fuchsia-500';
          return <span key={`${x}-${y}`} className={cn('aspect-square rounded-[1.5px]', cls)} />;
        })
      )}
    </div>
  );
}


export const KODING_STAGES: KodingStage[] = [
  // ================= BAB 1: SEKUENS DASAR (1 - 6) =================
  {
    id: 1,
    chapter: 1,
    title: 'Langkah Pertama',
    subtitle: 'Gerakkan robot lurus menuju bintang target.',
    concept: 'Sekuens Lurus',
    parBlocks: 4,
    hint: 'Gunakan 4 blok MAJU untuk mencapai bintang di ujung kanan.',
    allowLoop: false,
    allowF1: false,
    startDir: 0,
    map: [
      '#######',
      '#.....#',
      '#S...G#',
      '#.....#',
      '#######',
    ],
  },
  {
    id: 2,
    chapter: 1,
    title: 'Tikungan Pertama',
    subtitle: 'Belajar berbelok ke kanan menghindari tembok.',
    concept: 'Belok Kanan',
    parBlocks: 6,
    hint: 'Maju 3 langkah, Belok Kanan, lalu Maju 2 langkah.',
    allowLoop: false,
    allowF1: false,
    startDir: 0,
    map: [
      '######',
      '#S...#',
      '####.#',
      '####G#',
      '######',
    ],
  },
  {
    id: 3,
    chapter: 1,
    title: 'Sudut Kiri',
    subtitle: 'Navigasi naik menuju sudut kiri atas.',
    concept: 'Belok Kiri',
    parBlocks: 7,
    hint: 'Maju 3 langkah sampai ujung, Belok Kiri untuk menghadap ke atas, lalu Maju 3 langkah.',
    allowLoop: false,
    allowF1: false,
    startDir: 0,
    map: [
      '######',
      '####G#',
      '####.#',
      '####.#',
      '#S...#',
      '######',
    ],
  },
  {
    id: 4,
    chapter: 1,
    title: 'Lintasan Huruf Z',
    subtitle: 'Kombinasikan belok kanan dan kiri melewati koridor sempit.',
    concept: 'Sekuens Ganda',
    parBlocks: 9,
    hint: 'Maju 2, Kanan, Maju 2, Kiri, lalu Maju 2.',
    allowLoop: false,
    allowF1: false,
    startDir: 0,
    map: [
      '#######',
      '#S..###',
      '###.###',
      '###..G#',
      '#######',
    ],
  },
  {
    id: 5,
    chapter: 1,
    title: 'Putaran Labirin',
    subtitle: 'Ikuti lorong memutar di dalam ruang labirin.',
    concept: 'Orientasi Arah',
    parBlocks: 12,
    hint: 'Maju 4, Kanan, Maju 2, Kanan, Maju 3 menuju bintang.',
    allowLoop: false,
    allowF1: false,
    startDir: 0,
    map: [
      '#######',
      '#S....#',
      '#####.#',
      '#G....#',
      '#######',
    ],
  },
  {
    id: 6,
    chapter: 1,
    title: 'Ujian Ruang Lab',
    subtitle: 'Lewati pilar tengah untuk mencapai titik keluar.',
    concept: 'Evaluasi Sekuens',
    parBlocks: 11,
    hint: 'Maju 2, Kanan, Maju 2, Kiri, Maju 2, Kiri, Maju 2... atau pilih rute terpendek di bawah!',
    allowLoop: false,
    allowF1: false,
    startDir: 0,
    map: [
      '#######',
      '#S..#G#',
      '#.#.#.#',
      '#.....#',
      '#######',
    ],
  },

  // ================= BAB 2: KOLEKSI & PORTAL (7 - 12) =================
  {
    id: 7,
    chapter: 2,
    title: 'Berburu Permata',
    subtitle: 'Ambil semua permata data sebelum menuju bintang.',
    concept: 'Koleksi Data',
    parBlocks: 8,
    hint: 'Ambil permata di atas terlebih dahulu atau di jalur membelok sebelum ke bintang.',
    allowLoop: false,
    allowF1: false,
    startDir: 0,
    map: [
      '#######',
      '#S.D..#',
      '###.###',
      '###D.G#',
      '#######',
    ],
  },
  {
    id: 8,
    chapter: 2,
    title: 'Portal Kuantum',
    subtitle: 'Masuki portal biru untuk berpindah ke sisi seberang.',
    concept: 'Teleportasi A',
    parBlocks: 5,
    hint: 'Masuk ke portal A, maka robot langsung berpindah ke portal A lainnya!',
    allowLoop: false,
    allowF1: false,
    startDir: 0,
    map: [
      '########',
      '#S.A#..#',
      '####~..#',
      '#..#A.G#',
      '########',
    ],
  },
  {
    id: 9,
    chapter: 2,
    title: 'Dua Permata Terpisah',
    subtitle: 'Rencanakan urutan pengambilan permata agar langkah efisien.',
    concept: 'Rute Optimal',
    parBlocks: 17,
    hint: 'Ambil permata kanan atas dengan belok ke kiri dari tengah, putar balik, lalu ke bawah.',
    allowLoop: false,
    allowF1: false,
    startDir: 0,
    map: [
      '#######',
      '#...D.#',
      '#S###.#',
      '#...D.#',
      '#####G#',
      '#######',
    ],
  },
  {
    id: 10,
    chapter: 2,
    title: 'Lompatan Portal Ganda',
    subtitle: 'Gunakan portal A lalu portal B untuk melintasi jurang siber.',
    concept: 'Rantai Portal',
    parBlocks: 8,
    hint: 'Maju ke portal A, lanjutkan maju ke portal B setelah berbelok, lalu ambil permata & bintang.',
    allowLoop: false,
    allowF1: false,
    startDir: 0,
    map: [
      '########',
      '#S.A~B.#',
      '####~#D#',
      '#A.B~#G#',
      '########',
    ],
  },
  {
    id: 11,
    chapter: 2,
    title: 'Spiral Permata',
    subtitle: 'Kumpulkan seluruh permata di sepanjang jalur berputar.',
    concept: 'Sekuens Panjang',
    parBlocks: 19,
    hint: 'Jalan memutar searah jarum jam: ambil semua permata sebelum masuk ke pusat bintang.',
    allowLoop: false,
    allowF1: false,
    startDir: 0,
    map: [
      '#######',
      '#S..D.#',
      '#####.#',
      '#..G#.#',
      '#.#.#.#',
      '#.D...#',
      '#######',
    ],
  },
  {
    id: 12,
    chapter: 2,
    title: 'Jembatan Siber',
    subtitle: 'Hindari jurang dan ambil permata lewat portal tengah.',
    concept: 'Presisi Portal',
    parBlocks: 9,
    hint: 'Masuk ke portal A di sebelah kiri, keluar di sisi kanan, lalu belok ke bintang.',
    allowLoop: false,
    allowF1: false,
    startDir: 0,
    map: [
      '########',
      '#S.A~DG#',
      '#..~#..#',
      '#..A...#',
      '########',
    ],
  },

  // ================= BAB 3: KUASA PERULANGAN (13 - 18) =================
  {
    id: 13,
    chapter: 3,
    title: 'Koridor Panjang',
    subtitle: 'Gunakan blok ULANGI agar kode super ringkas!',
    concept: 'Loop Dasar',
    parBlocks: 2,
    hint: 'Pasang blok ULANGI 6x dan masukkan 1 blok MAJU di dalamnya.',
    allowLoop: true,
    allowF1: false,
    startDir: 0,
    map: [
      '#########',
      '#S.....G#',
      '#########',
    ],
  },
  {
    id: 14,
    chapter: 3,
    title: 'Tangga Algoritma',
    subtitle: 'Kenali pola tangga berulang dan bungkus ke dalam Loop.',
    concept: 'Pola Tangga',
    parBlocks: 5,
    hint: 'Pola berulang 3x: (Maju, Kanan, Maju, Kiri).',
    allowLoop: true,
    allowF1: false,
    startDir: 0,
    map: [
      '#######',
      '#S.####',
      '##..###',
      '###..##',
      '####.G#',
      '#######',
    ],
  },
  {
    id: 15,
    chapter: 3,
    title: 'Putaran Persegi',
    subtitle: 'Kelilingi pulau tengah untuk memanen semua permata.',
    concept: 'Loop Keliling',
    parBlocks: 4,
    hint: 'Pola sama untuk setiap sisi: ULANGI 4x -> (Maju, Maju, Maju, Kanan), lalu geser ke G.',
    allowLoop: true,
    allowF1: false,
    startDir: 0,
    map: [
      '#######',
      '#S.D..#',
      '#.###.#',
      '#.###D#',
      '#G.D..#',
      '#######',
    ],
  },
  {
    id: 16,
    chapter: 3,
    title: 'Zig-Zag Cepat',
    subtitle: 'Lintasi jalur bergelombang dengan satu blok Loop.',
    concept: 'Efisiensi Loop',
    parBlocks: 5,
    hint: 'Gunakan ULANGI 3x berisi (Maju, Kiri, Maju, Kanan) dimulai dengan menghadap ke kanan.',
    allowLoop: true,
    allowF1: false,
    startDir: 0,
    map: [
      '########',
      '#S..####',
      '###..###',
      '####..##',
      '#####..#',
      '######G#',
      '########',
    ],
  },
  {
    id: 17,
    chapter: 3,
    title: 'Lorong Permata Ganda',
    subtitle: 'Kombinasikan dua blok Loop terpisah dengan rapi.',
    concept: 'Multi Loop',
    parBlocks: 6,
    hint: 'Loop 1 untuk berjalan ke kanan (4x), belok kanan, lalu Loop 2 untuk turun (4x).',
    allowLoop: true,
    allowF1: false,
    startDir: 0,
    map: [
      '########',
      '#S.D.D.#',
      '######.#',
      '######D#',
      '######.#',
      '######G#',
      '########',
    ],
  },
  {
    id: 18,
    chapter: 3,
    title: 'Benteng Terakhir Bab 3',
    subtitle: 'Loop bersarang atau rangkaian Loop efisien untuk spiral besar.',
    concept: 'Master Loop',
    parBlocks: 8,
    hint: 'Gunakan Loop untuk setiap koridor lurus: 5x Maju, belok, 4x Maju, belok...',
    allowLoop: true,
    allowF1: false,
    startDir: 0,
    map: [
      '########',
      '#S.D..D#',
      '######.#',
      '#G.D.#.#',
      '#..#.D.#',
      '#......#',
      '########',
    ],
  },

  // ================= BAB 4: GERBANG LASER & ES LICIN (19 - 24) =================
  {
    id: 19,
    chapter: 4,
    title: 'Sakelar Keamanan',
    subtitle: 'Injak tombol sakelar (K) untuk mematikan gerbang laser (L)!',
    concept: 'Sakelar & Gerbang',
    parBlocks: 9,
    hint: 'Pergi ke tombol K terlebih dahulu agar gerbang laser L terbuka, lalu lewat ke G.',
    allowLoop: true,
    allowF1: false,
    startDir: 0,
    map: [
      '#######',
      '#K.#..#',
      '#..L.G#',
      '#S.#..#',
      '#######',
    ],
  },
  {
    id: 20,
    chapter: 4,
    title: 'Lintasan Es Licin',
    subtitle: 'Di lantai es biru (I), robot otomatis meluncur 1 langkah lagi!',
    concept: 'Fisika Es',
    parBlocks: 4,
    hint: 'Cukup Maju sekali ke lantai es I, robot akan meluncur melewatinya secara otomatis!',
    allowLoop: true,
    allowF1: false,
    startDir: 0,
    map: [
      '########',
      '#S.IIIG#',
      '########',
    ],
  },
  {
    id: 21,
    chapter: 4,
    title: 'Es & Tikungan',
    subtitle: 'Hitung jarak luncur es sebelum berbelok menuju permata.',
    concept: 'Kontrol Luncuran',
    parBlocks: 8,
    hint: 'Saat menginjak petak I, robot meluncur 1 petak ke depan selama petak depan bukan tembok.',
    allowLoop: true,
    allowF1: false,
    startDir: 0,
    map: [
      '#######',
      '#S.II.#',
      '#####.#',
      '#G.DI.#',
      '#######',
    ],
  },
  {
    id: 22,
    chapter: 4,
    title: 'Operasi Laser Ganda',
    subtitle: 'Buka gerbang laser dengan mengambil rute memutar ke sakelar.',
    concept: 'Logika Kondisi',
    parBlocks: 14,
    hint: 'Ambil sakelar K di sudut kiri bawah lewat koridor aman, baru lintasi laser L di atas.',
    allowLoop: true,
    allowF1: false,
    startDir: 0,
    map: [
      '########',
      '#S..L.G#',
      '#.#~####',
      '#K.D...#',
      '#..~...#',
      '########',
    ],
  },
  {
    id: 23,
    chapter: 4,
    title: 'Portal di Ruang Es',
    subtitle: 'Meluncur menuju portal dan kumpulkan permata yang tersembunyi.',
    concept: 'Es + Portal',
    parBlocks: 12,
    hint: 'Masuki portal A setelah meluncur di es, lalu buka sakelar untuk jalan pulang.',
    allowLoop: true,
    allowF1: false,
    startDir: 0,
    map: [
      '########',
      '#S.IA~.#',
      '#####~~#',
      '#A.D.L.#',
      '#K...#G#',
      '########',
    ],
  },
  {
    id: 24,
    chapter: 4,
    title: 'Gudang Beku',
    subtitle: 'Padukan Loop, Sakelar, dan lantai es licin dalam 1 misi.',
    concept: 'Logika Terpadu',
    parBlocks: 15,
    hint: 'Meluncur lewat es hingga depan gerbang L, turun ambil D dan injak sakelar K, lalu naik kembali menembus L menuju G!',
    allowLoop: true,
    allowF1: false,
    startDir: 0,
    map: [
      '########',
      '#S.I.LG#',
      '####.###',
      '#K..D..#',
      '########',
    ],
  },

  // ================= BAB 5: FUNGSI F1 & MODULAR (25 - 30) =================
  {
    id: 25,
    chapter: 5,
    title: 'Kenalan Dengan Fungsi F1',
    subtitle: 'Buat sub-program di tab Fungsi F1 dan panggil berulang kali!',
    concept: 'Subrutin F1',
    parBlocks: 5,
    hint: 'Isi Fungsi F1 dengan pola langkah ke kanan (Maju 2x, Kanan), lalu panggil F1 di program utama!',
    allowLoop: true,
    allowF1: true,
    startDir: 0,
    map: [
      '#######',
      '#S.D..#',
      '#####.#',
      '#G.D..#',
      '#######',
    ],
  },
  {
    id: 26,
    chapter: 5,
    title: 'Pola Modular Tangga',
    subtitle: 'Panggil F1 beberapa kali untuk menaiki anak tangga panjang.',
    concept: 'Reusability F1',
    parBlocks: 6,
    hint: 'Buat F1 = (Maju, Kanan, Maju, Kiri), lalu panggil F1 lewat Loop 3x!',
    allowLoop: true,
    allowF1: true,
    startDir: 0,
    map: [
      '########',
      '#S.#####',
      '##..####',
      '###..###',
      '####..##',
      '#####.G#',
      '########',
    ],
  },
  {
    id: 27,
    chapter: 5,
    title: 'Pencarian Pulau Kembar',
    subtitle: 'Dua pulau identik dihubungkan portal. Gunakan fungsi yang sama!',
    concept: 'Pola Simetris',
    parBlocks: 7,
    hint: 'Pola mengambil permata di pulau 1 sama dengan pulau 2 setelah keluar dari portal A.',
    allowLoop: true,
    allowF1: true,
    startDir: 0,
    map: [
      '#########',
      '#S.D#A.D#',
      '#.#.#.#.#',
      '#..A#.G.#',
      '#########',
    ],
  },
  {
    id: 28,
    chapter: 5,
    title: 'Labirin Berlubang',
    subtitle: 'Hindari jurang siber yang menganga di kanan kiri jalur.',
    concept: 'Dekomposisi Jalur',
    parBlocks: 8,
    hint: 'Pecah jalur menjadi potongan langkah kecil menggunakan F1 untuk melewati tiap jembatan.',
    allowLoop: true,
    allowF1: true,
    startDir: 0,
    map: [
      '#########',
      '#S..~...#',
      '###...D.#',
      '#K..~.L.#',
      '#.~~~..G#',
      '#########',
    ],
  },
  {
    id: 29,
    chapter: 5,
    title: 'Empat Sudut Energi',
    subtitle: 'Ambil semua permata di keempat penjuru dengan efisien.',
    concept: 'F1 + Loop',
    parBlocks: 7,
    hint: 'F1 bisa berisi jalur menuju sudut dan kembali, atau jalankan Loop mengelilingi sisi.',
    allowLoop: true,
    allowF1: true,
    startDir: 0,
    map: [
      '########',
      '#D....D#',
      '#.####.#',
      '#.#SG#.#',
      '#.#..#.#',
      '#D....D#',
      '########',
    ],
  },
  {
    id: 30,
    chapter: 5,
    title: 'Kunci Pusat AI',
    subtitle: 'Aktifkan sakelar dan lewati portal es dalam satu algoritma modular.',
    concept: 'Evaluasi Modular',
    parBlocks: 9,
    hint: 'Turun dulu tekan K, ambil permata lewat es, baru masuk portal ke tujuan.',
    allowLoop: true,
    allowF1: true,
    startDir: 0,
    map: [
      '########',
      '#S.IA.G#',
      '#.#~~#L#',
      '#K.D.A.#',
      '########',
    ],
  },

  // ================= BAB 6: GRANDMASTER KODE (31 - 36) =================
  {
    id: 31,
    chapter: 6,
    title: 'Jaringan Teleporter',
    subtitle: 'Gunakan portal A dan portal B dengan urutan yang tepat.',
    concept: 'Rantai Portal Lanjut',
    parBlocks: 9,
    hint: 'Masuk portal A terlebih dulu untuk mengaktifkan sakelar K, lalu cari portal B.',
    allowLoop: true,
    allowF1: true,
    startDir: 0,
    map: [
      '#########',
      '#S.A~B.G#',
      '####~#L##',
      '#KBA~..D#',
      '#########',
    ],
  },
  {
    id: 32,
    chapter: 6,
    title: 'Seluncur Kuantum',
    subtitle: 'Manfaatkan lantai es berurutan untuk menghemat banyak blok!',
    concept: 'Optimasi Ruang',
    parBlocks: 7,
    hint: 'Lantai es menghemat langkah lurus. Fokuskan belokan tepat di lantai biasa.',
    allowLoop: true,
    allowF1: true,
    startDir: 0,
    map: [
      '#########',
      '#S.II.D.#',
      '#######.#',
      '#G.L.IK.#',
      '#########',
    ],
  },
  {
    id: 33,
    chapter: 6,
    title: 'Tiga Kunci Permata',
    subtitle: 'Ambil semua permata di lorong bercabang tanpa mengulang langkah sia-sia.',
    concept: 'Efisiensi Traversal',
    parBlocks: 10,
    hint: 'Gunakan F1 untuk masuk ke lorong cabang dan mundur/berputar ke koridor utama.',
    allowLoop: true,
    allowF1: true,
    startDir: 0,
    map: [
      '#########',
      '#D.#.D#G#',
      '#..#..#L#',
      '#S....K.#',
      '#########',
    ],
  },
  {
    id: 34,
    chapter: 6,
    title: 'Labirin Keamanan Berlapis',
    subtitle: 'Buka laser, hindari jurang, dan manfaatkan portal secara presisi.',
    concept: 'Arsitektur Logika',
    parBlocks: 10,
    hint: 'Ke bawah ambil K dan permata D, masuk portal A ke sisi kanan atas.',
    allowLoop: true,
    allowF1: true,
    startDir: 0,
    map: [
      '#########',
      '#S..~A.G#',
      '#.#.~#L##',
      '#K..A.D.#',
      '#########',
    ],
  },
  {
    id: 35,
    chapter: 6,
    title: 'Spiral Es & Laser',
    subtitle: 'Lintasi arena es melingkar untuk membuka gerbang akhir.',
    concept: 'Kombinasi Total',
    parBlocks: 10,
    hint: 'Ikuti pinggiran luar searah jarum jam untuk mengambil D dan K sebelum masuk tengah.',
    allowLoop: true,
    allowF1: true,
    startDir: 0,
    map: [
      '#########',
      '#S.II.D.#',
      '#.#####.#',
      '#.#G.L#.#',
      '#.#.###.#',
      '#.K..II.#',
      '#########',
    ],
  },
  {
    id: 36,
    chapter: 6,
    title: 'Inti Grandmaster (Final)',
    subtitle: 'Tantangan puncak! Gabungkan Loop, F1, Portal, Es, dan Sakelar Laser!',
    concept: 'Grandmaster Informatika',
    parBlocks: 12,
    hint: 'Ambil permata kiri bawah lewat es, injak sakelar K, masuk portal A, dan capai G!',
    allowLoop: true,
    allowF1: true,
    startDir: 0,
    map: [
      '##########',
      '#S.II.~B.#',
      '#.##..~#.#',
      '#K.D.A~#G#',
      '####.#~#L#',
      '#A...B...#',
      '##########',
    ],
  },
];

// Lightweight Web Audio Sound Engine
function playCodingSound(type: 'click' | 'move' | 'turn' | 'gem' | 'portal' | 'switch' | 'crash' | 'win', muted: boolean) {
  if (muted || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.05);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'move') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.07);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'turn') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.06);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.start(now);
      osc.stop(now + 0.07);
    } else if (type === 'gem') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.setValueAtTime(880, now + 0.07);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'portal') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(920, now + 0.16);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'switch') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(660, now + 0.06);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.14);
    } else if (type === 'crash') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.22);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.start(now);
      osc.stop(now + 0.24);
    } else if (type === 'win') {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, now + i * 0.09);
        g.gain.setValueAtTime(0.08, now + i * 0.09);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.22);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now + i * 0.09);
        o.stop(now + i * 0.09 + 0.24);
      });
      return;
    }

    setTimeout(() => {
      try {
        void ctx.close();
      } catch {
        // ignore close errors
      }
    }, 450);
  } catch {
    // ignore audio errors
  }
}

interface ExecStep {
  action: 'MOVE' | 'RIGHT' | 'LEFT';
  sourceBlockId: string;
  loopIterInfo?: string;
}

function flattenBlocks(
  blocks: CmdBlock[],
  f1Blocks: CmdBlock[],
  depth = 0,
  loopBadge?: string
): ExecStep[] {
  if (depth > 8) return [];
  const out: ExecStep[] = [];
  for (const b of blocks) {
    if (out.length > 260) break;
    if (b.type === 'MOVE' || b.type === 'RIGHT' || b.type === 'LEFT') {
      out.push({ action: b.type, sourceBlockId: b.id, loopIterInfo: loopBadge });
    } else if (b.type === 'LOOP') {
      const n = Math.max(1, Math.min(8, b.count || 2));
      for (let i = 0; i < n; i++) {
        out.push(...flattenBlocks(b.children || [], f1Blocks, depth + 1, `${i + 1}/${n}`));
        if (out.length > 260) break;
      }
    } else if (b.type === 'CALL_F1') {
      out.push(...flattenBlocks(f1Blocks, f1Blocks, depth + 1, 'F1'));
    }
  }
  return out;
}

function countAllBlocks(blocks: CmdBlock[], f1Blocks: CmdBlock[]): number {
  const countArr = (arr: CmdBlock[]): number =>
    arr.reduce((acc, b) => acc + 1 + (b.children ? countArr(b.children) : 0), 0);
  return countArr(blocks) + countArr(f1Blocks);
}

function generatePseudocode(blocks: CmdBlock[], f1Blocks: CmdBlock[]): string[] {
  const lines: string[] = [];
  if (f1Blocks.length > 0) {
    lines.push('def fungsi_F1():');
    const renderBlockList = (arr: CmdBlock[], indent: string) => {
      arr.forEach((b) => {
        if (b.type === 'MOVE') lines.push(`${indent}maju()`);
        else if (b.type === 'RIGHT') lines.push(`${indent}belok_kanan()`);
        else if (b.type === 'LEFT') lines.push(`${indent}belok_kiri()`);
        else if (b.type === 'CALL_F1') lines.push(`${indent}fungsi_F1()`);
        else if (b.type === 'LOOP') {
          lines.push(`${indent}for i in range(${b.count || 2}):`);
          if (!b.children || b.children.length === 0) lines.push(`${indent}  pass`);
          else renderBlockList(b.children, indent + '  ');
        }
      });
    };
    renderBlockList(f1Blocks, '  ');
    lines.push('');
  }
  lines.push('# Program Utama');
  const renderMain = (arr: CmdBlock[], indent: string) => {
    if (arr.length === 0) {
      lines.push(`${indent}# Tambahkan blok perintah`);
      return;
    }
    arr.forEach((b) => {
      if (b.type === 'MOVE') lines.push(`${indent}maju()`);
      else if (b.type === 'RIGHT') lines.push(`${indent}belok_kanan()`);
      else if (b.type === 'LEFT') lines.push(`${indent}belok_kiri()`);
      else if (b.type === 'CALL_F1') lines.push(`${indent}fungsi_F1()`);
      else if (b.type === 'LOOP') {
        lines.push(`${indent}for i in range(${b.count || 2}):`);
        if (!b.children || b.children.length === 0) lines.push(`${indent}  pass`);
        else renderMain(b.children, indent + '  ');
      }
    });
  };
  renderMain(blocks, '');
  return lines;
}

function parseStageGrid(stage: KodingStage) {
  let start = { x: 1, y: 1 };
  let goal = { x: 1, y: 1 };
  const gems: Array<{ x: number; y: number }> = [];
  const portalsA: Array<{ x: number; y: number }> = [];
  const portalsB: Array<{ x: number; y: number }> = [];

  stage.map.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === 'S') start = { x, y };
      else if (ch === 'G') goal = { x, y };
      else if (ch === 'D') gems.push({ x, y });
      else if (ch === 'A') portalsA.push({ x, y });
      else if (ch === 'B') portalsB.push({ x, y });
    }
  });

  return {
    start,
    goal,
    gems,
    portalsA,
    portalsB,
    rows: stage.map.length,
    cols: stage.map[0]?.length || 6,
  };
}

export default function KodingMasterGame({
  isAdmin,
  currentStudent,
  onClose,
}: {
  isAdmin: boolean;
  currentStudent: any;
  onClose: () => void;
}) {
  const storageKey = `koding_master_progress_${currentStudent?.id || (isAdmin ? 'admin' : 'guest')}`;

  const [progressMap, setProgressMap] = useState<Record<number, StageProgress>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [viewMode, setViewMode] = useState<'menu' | 'play' | 'admin_stages'>('menu');
  const [selectedChapter, setSelectedChapter] = useState<number>(0); // 0 = all
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [stageId, setStageId] = useState<number>(() => {
    const completedIds = Object.keys(progressMap).map(Number);
    const maxDone = completedIds.length > 0 ? Math.max(...completedIds) : 0;
    return Math.min(KODING_STAGES.length, maxDone + 1);
  });

  const [workspace, setWorkspace] = useState<CmdBlock[]>([]);
  const [f1Workspace, setF1Workspace] = useState<CmdBlock[]>([]);
  const [activeTab, setActiveTab] = useState<'main' | 'f1'>('main');
  const [activeLoopId, setActiveLoopId] = useState<string | null>(null);
  const [showPseudocode, setShowPseudocode] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [execSpeed, setExecSpeed] = useState<1 | 2 | 4>(1);

  // Simulation states
  const currentStage = useMemo(
    () => KODING_STAGES.find((s) => s.id === stageId) || KODING_STAGES[0],
    [stageId]
  );
  const parsedGrid = useMemo(() => parseStageGrid(currentStage), [currentStage]);

  const [simState, setSimState] = useState<{
    x: number;
    y: number;
    dir: Direction;
    collectedGems: string[];
    gateOpen: boolean;
    trail: Array<{ x: number; y: number }>;
    status: 'idle' | 'running' | 'paused' | 'won' | 'failed';
    message: string;
    activeBlockId: string | null;
    activeLoopBadge: string | null;
    stepCursor: number;
    crashShake: number;
  }>(() => ({
    x: parsedGrid.start.x,
    y: parsedGrid.start.y,
    dir: currentStage.startDir,
    collectedGems: [],
    gateOpen: false,
    trail: [{ x: parsedGrid.start.x, y: parsedGrid.start.y }],
    status: 'idle',
    message: 'Susun blok perintah lalu klik Jalankan atau tekan Spasi!',
    activeBlockId: null,
    activeLoopBadge: null,
    stepCursor: 0,
    crashShake: 0,
  }));

  const [lastClearStars, setLastClearStars] = useState<number>(0);
  const [lastClearScore, setLastClearScore] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runTimerRef = useRef<number | null>(null);
  const simRef = useRef(simState);
  simRef.current = simState;

  // Derived totals
  const totalStars = useMemo(
    () => Object.values(progressMap).reduce((sum, p) => sum + (p.stars || 0), 0),
    [progressMap]
  );
  const totalGameScore = useMemo(
    () => Object.values(progressMap).reduce((sum, p) => sum + (p.score || 0), 0),
    [progressMap]
  );
  const completedCount = Object.keys(progressMap).length;
  const hasProgress = completedCount > 0;
  const highestUnlockedStage = useMemo(() => {
    const ids = Object.keys(progressMap).map(Number);
    const maxDone = ids.length > 0 ? Math.max(...ids) : 0;
    return Math.min(KODING_STAGES.length, maxDone + 1);
  }, [progressMap]);

  // Persist progress to localStorage & Firestore
  const saveProgressToCloud = useCallback(
    async (updatedMap: Record<number, StageProgress>) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedMap));
      } catch {
        // ignore quota errors
      }
      if (!currentStudent && !isAdmin) return;
      const totalPts = Object.values(updatedMap).reduce((sum, p) => sum + (p.score || 0), 0);
      if (totalPts <= 0) return;

      const studentId = currentStudent?.id || 'admin-preview';
      try {
        const existingSnap = await getDocs(
          query(
            collection(db, 'game_scores'),
            where('studentId', '==', studentId),
            where('gameId', '==', 'scratch-blocks')
          )
        );
        let prevBest = 0;
        existingSnap.docs.forEach((d) => {
          const val = Number(d.data()?.score || 0);
          if (val > prevBest) prevBest = val;
        });
        if (totalPts >= prevBest) {
          const nowIso = new Date().toISOString();
          const studentKelas = currentStudent?.kelas || 'Admin';
          await setDoc(doc(db, 'game_scores', `${studentId}__scratch-blocks`), {
            gameId: 'scratch-blocks',
            gameTitle: 'Koding Master SMP (36 Stage)',
            studentId,
            studentName: currentStudent?.nama || 'Admin Pratinjau',
            studentNis: currentStudent?.nis || '-',
            studentKelas,
            kelas: studentKelas,
            score: totalPts,
            stagesCleared: Object.keys(updatedMap).length,
            totalStars: Object.values(updatedMap).reduce((s, p) => s + (p.stars || 0), 0),
            playedAt: nowIso,
            timestamp: nowIso,
          });
        }
      } catch (e) {
        console.error('Failed saving coding score:', e);
      }
    },
    [storageKey, currentStudent, isAdmin]
  );

  // Sync Firestore high score on mount if student already has progress
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setProgressMap(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, [storageKey]);

  const stopTimer = useCallback(() => {
    if (runTimerRef.current !== null) {
      window.clearTimeout(runTimerRef.current);
      runTimerRef.current = null;
    }
  }, []);

  const resetRobotOnly = useCallback(
    (keepMessage?: string) => {
      stopTimer();
      setSimState({
        x: parsedGrid.start.x,
        y: parsedGrid.start.y,
        dir: currentStage.startDir,
        collectedGems: [],
        gateOpen: false,
        trail: [{ x: parsedGrid.start.x, y: parsedGrid.start.y }],
        status: 'idle',
        message: keepMessage || `Stage ${currentStage.id}: ${currentStage.subtitle}`,
        activeBlockId: null,
        activeLoopBadge: null,
        stepCursor: 0,
        crashShake: 0,
      });
    },
    [stopTimer, parsedGrid.start.x, parsedGrid.start.y, currentStage]
  );

  const loadStage = useCallback(
    (targetId: number) => {
      stopTimer();
      const targetStage = KODING_STAGES.find((s) => s.id === targetId) || KODING_STAGES[0];
      const grid = parseStageGrid(targetStage);
      setStageId(targetStage.id);
      setWorkspace([]);
      setF1Workspace([]);
      setActiveTab('main');
      setActiveLoopId(null);
      setShowHint(false);
      setLastClearStars(0);
      setSimState({
        x: grid.start.x,
        y: grid.start.y,
        dir: targetStage.startDir,
        collectedGems: [],
        gateOpen: false,
        trail: [{ x: grid.start.x, y: grid.start.y }],
        status: 'idle',
        message: `Stage ${targetStage.id}: ${targetStage.subtitle}`,
        activeBlockId: null,
        activeLoopBadge: null,
        stepCursor: 0,
        crashShake: 0,
      });
      setViewMode('play');
    },
    [stopTimer]
  );

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  // Execute one flattened simulation step cleanly
  const executeSingleStep = useCallback(
    (step: ExecStep, current: typeof simRef.current): { next: typeof simRef.current; outcome: 'continue' | 'won' | 'failed' } => {
      let nx = current.x;
      let ny = current.y;
      let ndir = current.dir;
      let gems = [...current.collectedGems];
      let gateOpen = current.gateOpen;
      const trail = [...current.trail];

      if (step.action === 'RIGHT') {
        ndir = ((ndir + 1) % 4) as Direction;
        playCodingSound('turn', soundMuted);
      } else if (step.action === 'LEFT') {
        ndir = ((ndir + 3) % 4) as Direction;
        playCodingSound('turn', soundMuted);
      } else if (step.action === 'MOVE') {
        const dx = ndir === 0 ? 1 : ndir === 2 ? -1 : 0;
        const dy = ndir === 1 ? 1 : ndir === 3 ? -1 : 0;
        const tx = nx + dx;
        const ty = ny + dy;

        if (ty < 0 || ty >= parsedGrid.rows || tx < 0 || tx >= parsedGrid.cols) {
          playCodingSound('crash', soundMuted);
          return {
            next: { ...current, status: 'failed', message: '💥 Robot keluar batas arena!', activeBlockId: step.sourceBlockId, crashShake: 1 },
            outcome: 'failed',
          };
        }

        const tile = currentStage.map[ty][tx];
        if (tile === '#') {
          playCodingSound('crash', soundMuted);
          return {
            next: { ...current, status: 'failed', message: '💥 Robot menabrak tembok! Cek arah belok.', activeBlockId: step.sourceBlockId, crashShake: 1 },
            outcome: 'failed',
          };
        }
        if (tile === '~') {
          playCodingSound('crash', soundMuted);
          return {
            next: { ...current, x: tx, y: ty, status: 'failed', message: '🌊 Robot jatuh ke jurang siber!', activeBlockId: step.sourceBlockId, crashShake: 1 },
            outcome: 'failed',
          };
        }
        if (tile === 'L' && !gateOpen) {
          playCodingSound('crash', soundMuted);
          return {
            next: { ...current, status: 'failed', message: '🔒 Terhalang gerbang laser! Injak sakelar (K) dulu.', activeBlockId: step.sourceBlockId, crashShake: 1 },
            outcome: 'failed',
          };
        }

        nx = tx;
        ny = ty;
        trail.push({ x: nx, y: ny });
        playCodingSound('move', soundMuted);

        const processTileEffects = (cx: number, cy: number) => {
          const ch = currentStage.map[cy][cx];
          const key = `${cx},${cy}`;
          if (ch === 'D' && !gems.includes(key)) {
            gems.push(key);
            playCodingSound('gem', soundMuted);
          }
          if (ch === 'K' && !gateOpen) {
            gateOpen = true;
            playCodingSound('switch', soundMuted);
          }
        };

        processTileEffects(nx, ny);

        // Ice sliding mechanic ('I') — slides 1 extra tile forward if safe, or chains across adjacent ice!
        let safety = 0;
        while (currentStage.map[ny]?.[nx] === 'I' && safety < 10) {
          safety++;
          const sx = nx + dx;
          const sy = ny + dy;
          if (sy < 0 || sy >= parsedGrid.rows || sx < 0 || sx >= parsedGrid.cols) break;
          const nextTile = currentStage.map[sy][sx];
          if (nextTile === '#' || (nextTile === 'L' && !gateOpen)) break;
          if (nextTile === '~') {
            playCodingSound('crash', soundMuted);
            return {
              next: { ...current, x: sx, y: sy, trail, status: 'failed', message: '🌊 Terpeleset di es ke jurang siber!', activeBlockId: step.sourceBlockId, crashShake: 1 },
              outcome: 'failed',
            };
          }
          nx = sx;
          ny = sy;
          trail.push({ x: nx, y: ny });
          processTileEffects(nx, ny);
        }

        // Portal Teleportation ('A' <-> 'A', 'B' <-> 'B')
        const landedTile = currentStage.map[ny][nx];
        if (landedTile === 'A' && parsedGrid.portalsA.length === 2) {
          const other = parsedGrid.portalsA.find((p) => p.x !== nx || p.y !== ny);
          if (other) {
            nx = other.x;
            ny = other.y;
            trail.push({ x: nx, y: ny });
            playCodingSound('portal', soundMuted);
          }
        } else if (landedTile === 'B' && parsedGrid.portalsB.length === 2) {
          const other = parsedGrid.portalsB.find((p) => p.x !== nx || p.y !== ny);
          if (other) {
            nx = other.x;
            ny = other.y;
            trail.push({ x: nx, y: ny });
            playCodingSound('portal', soundMuted);
          }
        }

        // Check Goal on landing
        if (currentStage.map[ny][nx] === 'G') {
          if (gems.length < parsedGrid.gems.length) {
            return {
              next: {
                ...current,
                x: nx,
                y: ny,
                dir: ndir,
                collectedGems: gems,
                gateOpen,
                trail,
                status: 'failed',
                message: `💎 Masih ada ${parsedGrid.gems.length - gems.length} permata yang belum diambil!`,
                activeBlockId: step.sourceBlockId,
              },
              outcome: 'failed',
            };
          }
          playCodingSound('win', soundMuted);
          return {
            next: {
              ...current,
              x: nx,
              y: ny,
              dir: ndir,
              collectedGems: gems,
              gateOpen,
              trail,
              status: 'won',
              message: '🎉 Misi Berhasil! Robot mencapai bintang target!',
              activeBlockId: step.sourceBlockId,
            },
            outcome: 'won',
          };
        }
      }

      return {
        next: {
          ...current,
          x: nx,
          y: ny,
          dir: ndir,
          collectedGems: gems,
          gateOpen,
          trail,
          activeBlockId: step.sourceBlockId,
          activeLoopBadge: step.loopIterInfo || null,
        },
        outcome: 'continue',
      };
    },
    [currentStage, parsedGrid, soundMuted]
  );

  const handleStageVictory = useCallback(() => {
    const usedBlocks = countAllBlocks(workspace, f1Workspace);
    const stars = usedBlocks <= currentStage.parBlocks ? 3 : usedBlocks <= currentStage.parBlocks + 3 ? 2 : 1;
    const stageScore = stars * 100 + Math.max(0, 50 - Math.max(0, usedBlocks - currentStage.parBlocks) * 10);
    setLastClearStars(stars);
    setLastClearScore(stageScore);

    setProgressMap((prev) => {
      const existing = prev[currentStage.id];
      const nextEntry: StageProgress = {
        stars: Math.max(existing?.stars || 0, stars),
        bestBlocks: existing ? Math.min(existing.bestBlocks, usedBlocks) : usedBlocks,
        score: Math.max(existing?.score || 0, stageScore),
      };
      const updated = { ...prev, [currentStage.id]: nextEntry };
      void saveProgressToCloud(updated);
      return updated;
    });
  }, [workspace, f1Workspace, currentStage, saveProgressToCloud]);

  // Run Full Program Loop
  const handleRunProgram = useCallback(() => {
    const steps = flattenBlocks(workspace, f1Workspace);
    if (steps.length === 0) {
      setSimState((s) => ({ ...s, message: '⚠️ Tambahkan minimal 1 blok perintah terlebih dahulu!' }));
      return;
    }

    stopTimer();
    const initial: typeof simState = {
      x: parsedGrid.start.x,
      y: parsedGrid.start.y,
      dir: currentStage.startDir,
      collectedGems: [],
      gateOpen: false,
      trail: [{ x: parsedGrid.start.x, y: parsedGrid.start.y }],
      status: 'running',
      message: '🚀 Robot sedang mengeksekusi algoritma...',
      activeBlockId: steps[0].sourceBlockId,
      activeLoopBadge: steps[0].loopIterInfo || null,
      stepCursor: 0,
      crashShake: 0,
    };
    setSimState(initial);
    simRef.current = initial;

    const stepDelay = execSpeed === 4 ? 110 : execSpeed === 2 ? 220 : 400;

    const tick = (idx: number, stateSnapshot: typeof simState) => {
      if (idx >= steps.length) {
        setSimState((s) => ({
          ...s,
          status: 'failed',
          activeBlockId: null,
          activeLoopBadge: null,
          message: '🤔 Program selesai, tapi robot belum sampai di bintang tujuan.',
        }));
        return;
      }

      const { next, outcome } = executeSingleStep(steps[idx], stateSnapshot);
      const updated = { ...next, stepCursor: idx + 1 };
      setSimState(updated);
      simRef.current = updated;

      if (outcome === 'won') {
        handleStageVictory();
        return;
      }
      if (outcome === 'failed') {
        return;
      }

      runTimerRef.current = window.setTimeout(() => {
        tick(idx + 1, updated);
      }, stepDelay);
    };

    runTimerRef.current = window.setTimeout(() => {
      tick(0, initial);
    }, 150);
  }, [workspace, f1Workspace, stopTimer, parsedGrid.start, currentStage.startDir, execSpeed, executeSingleStep, handleStageVictory]);

  // Step-by-Step Debugger
  const handleStepForward = useCallback(() => {
    const steps = flattenBlocks(workspace, f1Workspace);
    if (steps.length === 0) {
      setSimState((s) => ({ ...s, message: '⚠️ Tambahkan blok terlebih dahulu untuk Step Debug!' }));
      return;
    }
    stopTimer();

    let base = simRef.current;
    if (base.status === 'won' || base.status === 'failed') {
      base = {
        x: parsedGrid.start.x,
        y: parsedGrid.start.y,
        dir: currentStage.startDir,
        collectedGems: [],
        gateOpen: false,
        trail: [{ x: parsedGrid.start.x, y: parsedGrid.start.y }],
        status: 'paused',
        message: '🔍 Mode Step Debugger aktif.',
        activeBlockId: null,
        activeLoopBadge: null,
        stepCursor: 0,
        crashShake: 0,
      };
    }

    if (base.stepCursor >= steps.length) {
      setSimState({
        ...base,
        status: 'failed',
        activeBlockId: null,
        message: '🤔 Langkah habis sebelum mencapai bintang.',
      });
      return;
    }

    const step = steps[base.stepCursor];
    const { next, outcome } = executeSingleStep(step, { ...base, status: 'paused' });
    const updated = {
      ...next,
      status: outcome === 'continue' ? ('paused' as const) : outcome,
      stepCursor: base.stepCursor + 1,
      message: outcome === 'continue' ? `🔍 Step ${base.stepCursor + 1}/${steps.length}: ${step.action}` : next.message,
    };
    setSimState(updated);
    simRef.current = updated;

    if (outcome === 'won') handleStageVictory();
  }, [workspace, f1Workspace, stopTimer, parsedGrid.start, currentStage.startDir, executeSingleStep, handleStageVictory]);

  // Workspace mutation helpers (support inserting into active LOOP or F1)
  const makeBlock = (type: CmdType, count = 3): CmdBlock => ({
    id: `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    ...(type === 'LOOP' ? { count, children: [] } : {}),
  });

  const addBlock = useCallback(
    (type: CmdType) => {
      if (simRef.current.status === 'running') return;
      playCodingSound('click', soundMuted);
      const newBlock = makeBlock(type);

      if (activeTab === 'f1' && type !== 'CALL_F1') {
        if (activeLoopId) {
          setF1Workspace((prev) =>
            prev.map((b) =>
              b.id === activeLoopId && b.type === 'LOOP'
                ? { ...b, children: [...(b.children || []), newBlock] }
                : b
            )
          );
        } else {
          setF1Workspace((prev) => [...prev, newBlock]);
          if (type === 'LOOP') setActiveLoopId(newBlock.id);
        }
      } else {
        if (activeLoopId && type !== 'LOOP') {
          setWorkspace((prev) =>
            prev.map((b) =>
              b.id === activeLoopId && b.type === 'LOOP'
                ? { ...b, children: [...(b.children || []), newBlock] }
                : b
            )
          );
        } else {
          setWorkspace((prev) => [...prev, newBlock]);
          if (type === 'LOOP') setActiveLoopId(newBlock.id);
        }
      }
    },
    [activeTab, activeLoopId, soundMuted]
  );

  const removeLastBlock = useCallback(() => {
    if (simRef.current.status === 'running') return;
    playCodingSound('click', soundMuted);
    const updater = (prev: CmdBlock[]) => {
      if (activeLoopId) {
        const target = prev.find((b) => b.id === activeLoopId);
        if (target && target.children && target.children.length > 0) {
          return prev.map((b) =>
            b.id === activeLoopId ? { ...b, children: b.children!.slice(0, -1) } : b
          );
        }
      }
      return prev.slice(0, -1);
    };
    if (activeTab === 'f1') setF1Workspace(updater);
    else setWorkspace(updater);
  }, [activeTab, activeLoopId, soundMuted]);

  const removeBlockById = (id: string, isF1: boolean, parentLoopId?: string) => {
    if (simState.status === 'running') return;
    playCodingSound('click', soundMuted);
    const setter = isF1 ? setF1Workspace : setWorkspace;
    if (parentLoopId) {
      setter((prev) =>
        prev.map((b) =>
          b.id === parentLoopId
            ? { ...b, children: (b.children || []).filter((c) => c.id !== id) }
            : b
        )
      );
    } else {
      setter((prev) => prev.filter((b) => b.id !== id));
      if (activeLoopId === id) setActiveLoopId(null);
    }
  };

  const moveBlockOrder = (idx: number, delta: -1 | 1, isF1: boolean, parentLoopId?: string) => {
    if (simState.status === 'running') return;
    const setter = isF1 ? setF1Workspace : setWorkspace;
    const swap = (arr: CmdBlock[]) => {
      const target = idx + delta;
      if (target < 0 || target >= arr.length) return arr;
      const copy = [...arr];
      [copy[idx], copy[target]] = [copy[target], copy[idx]];
      return copy;
    };
    if (parentLoopId) {
      setter((prev) =>
        prev.map((b) => (b.id === parentLoopId ? { ...b, children: swap(b.children || []) } : b))
      );
    } else {
      setter(swap);
    }
  };

  const updateLoopCount = (loopId: string, nextCount: number, isF1: boolean) => {
    const clamped = Math.max(2, Math.min(8, nextCount));
    const setter = isF1 ? setF1Workspace : setWorkspace;
    setter((prev) => prev.map((b) => (b.id === loopId ? { ...b, count: clamped } : b)));
  };

  // Keyboard shortcuts during Play View
  useEffect(() => {
    if (viewMode !== 'play') return;
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        addBlock('MOVE');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        addBlock('RIGHT');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        addBlock('LEFT');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        removeLastBlock();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (simRef.current.status === 'running') {
          resetRobotOnly('⏸ Simulasi dihentikan.');
        } else {
          handleRunProgram();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetRobotOnly();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [viewMode, addBlock, removeLastBlock, handleRunProgram, resetRobotOnly]);

  // High-Detail Canvas Renderer with Smooth Animation
  useEffect(() => {
    if (viewMode !== 'play') return;
    let rafId: number;

    const renderLoop = (now: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) {
        rafId = requestAnimationFrame(renderLoop);
        return;
      }

      const W = canvas.width;
      const H = canvas.height;
      const rows = parsedGrid.rows;
      const cols = parsedGrid.cols;
      const pad = 18;
      const cellSize = Math.min((W - pad * 2) / cols, (H - pad * 2) / rows);
      const offsetX = (W - cols * cellSize) / 2;
      const offsetY = (H - rows * cellSize) / 2;

      ctx.clearRect(0, 0, W, H);

      // Subtle Deep Arena Frame Backdrop
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#090e1a');
      bgGrad.addColorStop(1, '#050811');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      const t = now * 0.004;
      const shakeX = simState.status === 'failed' && simState.crashShake ? Math.sin(t * 25) * 3 : 0;

      ctx.save();
      ctx.translate(shakeX, 0);

      // Draw Tiles with Unmistakable Walkable (Bright Road) vs Impassable (Dark 3D Walls & Hazard Pits) Contrast
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const ch = currentStage.map[y][x];
          const cx = offsetX + x * cellSize;
          const cy = offsetY + y * cellSize;

          if (ch === '#') {
            // IMPASSABLE: Solid Dark Obsidian 3D Raised Brick Fortress Block
            ctx.fillStyle = '#020617';
            ctx.beginPath();
            ctx.roundRect(cx + 1, cy + 1, cellSize - 2, cellSize - 2, 6);
            ctx.fill();

            const wGrad = ctx.createLinearGradient(cx, cy, cx, cy + cellSize);
            wGrad.addColorStop(0, '#334155');
            wGrad.addColorStop(1, '#1e293b');
            ctx.fillStyle = wGrad;
            ctx.beginPath();
            ctx.roundRect(cx + 2, cy + 2, cellSize - 4, cellSize - 7, 5);
            ctx.fill();

            // Subtle brick joint & corner rivets
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx + 4, cy + cellSize * 0.45);
            ctx.lineTo(cx + cellSize - 4, cy + cellSize * 0.45);
            ctx.moveTo(cx + cellSize * 0.5, cy + 3);
            ctx.lineTo(cx + cellSize * 0.5, cy + cellSize * 0.45);
            ctx.stroke();

            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            ctx.fillRect(cx + 4, cy + 3, cellSize - 8, 3);
          } else if (ch === '~') {
            // IMPASSABLE HAZARD: Deep Abyss Pit with Glowing Crimson Warning Rim
            ctx.fillStyle = '#02040a';
            ctx.beginPath();
            ctx.roundRect(cx + 1.5, cy + 1.5, cellSize - 3, cellSize - 3, 5);
            ctx.fill();

            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 3]);
            ctx.strokeRect(cx + 4, cy + 4, cellSize - 8, cellSize - 8);
            ctx.setLineDash([]);

            ctx.fillStyle = 'rgba(248, 113, 113, 0.7)';
            ctx.font = `bold ${Math.floor(cellSize * 0.34)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚠', cx + cellSize / 2, cy + cellSize / 2 + 1);
          } else {
            // WALKABLE ROAD: High-Contrast Bright Clean Floor vs Dark Walls
            const isIce = ch === 'I';
            if (isIce) {
              const iceGrad = ctx.createLinearGradient(cx, cy, cx + cellSize, cy + cellSize);
              iceGrad.addColorStop(0, '#bae6fd');
              iceGrad.addColorStop(1, '#7dd3fc');
              ctx.fillStyle = iceGrad;
            } else {
              ctx.fillStyle = (x + y) % 2 === 0 ? '#f1f5f9' : '#e2e8f0';
            }
            ctx.beginPath();
            ctx.roundRect(cx + 1.5, cy + 1.5, cellSize - 3, cellSize - 3, 6);
            ctx.fill();

            ctx.strokeStyle = isIce ? '#0284c7' : '#cbd5e1';
            ctx.lineWidth = isIce ? 2 : 1.2;
            ctx.stroke();

            if (isIce) {
              // Glossy White Ice Stripes + Slide Indicator
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
              ctx.lineWidth = 2.2;
              ctx.beginPath();
              ctx.moveTo(cx + cellSize * 0.22, cy + cellSize * 0.32);
              ctx.lineTo(cx + cellSize * 0.45, cy + cellSize * 0.18);
              ctx.moveTo(cx + cellSize * 0.52, cy + cellSize * 0.78);
              ctx.lineTo(cx + cellSize * 0.78, cy + cellSize * 0.62);
              ctx.stroke();

              ctx.fillStyle = 'rgba(3, 105, 161, 0.55)';
              ctx.font = `bold ${Math.floor(cellSize * 0.26)}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('❄️', cx + cellSize / 2, cy + cellSize / 2);
            } else if (ch === '.') {
              // Subtle walkable circuit dot in center
              ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
              ctx.beginPath();
              ctx.arc(cx + cellSize / 2, cy + cellSize / 2, Math.max(2.5, cellSize * 0.065), 0, Math.PI * 2);
              ctx.fill();
            }

            if (ch === 'S') {
              ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
              ctx.beginPath();
              ctx.roundRect(cx + 4, cy + 4, cellSize - 8, cellSize - 8, 5);
              ctx.fill();
              ctx.strokeStyle = '#10b981';
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }
          }
        }
      }

      // Draw Robot Path Breadcrumb Trail
      if (simState.trail.length > 1) {
        ctx.strokeStyle = 'rgba(2, 132, 199, 0.65)';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        simState.trail.forEach((pt, idx) => {
          const px = offsetX + pt.x * cellSize + cellSize / 2;
          const py = offsetY + pt.y * cellSize + cellSize / 2;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw Special Interactive Items (Portals, Switches, Laser Gates, Gems, Goal Star)
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const ch = currentStage.map[y][x];
          const midX = offsetX + x * cellSize + cellSize / 2;
          const midY = offsetY + y * cellSize + cellSize / 2;

          if (ch === 'A' || ch === 'B') {
            const pCol = ch === 'A' ? '#7c3aed' : '#db2777';
            ctx.fillStyle = ch === 'A' ? 'rgba(124, 58, 237, 0.22)' : 'rgba(219, 39, 119, 0.22)';
            ctx.beginPath();
            ctx.arc(midX, midY, cellSize * 0.34, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = pCol;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(midX, midY, cellSize * 0.29 + Math.sin(t * 2) * 1.8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = pCol;
            ctx.beginPath();
            ctx.arc(midX, midY, cellSize * 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.floor(cellSize * 0.27)}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(ch, midX, midY + 1);
          } else if (ch === 'K') {
            ctx.fillStyle = simState.gateOpen ? '#10b981' : '#f59e0b';
            ctx.beginPath();
            ctx.arc(midX, midY, cellSize * 0.28, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#0f172a';
            ctx.font = `bold ${Math.floor(cellSize * 0.24)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(simState.gateOpen ? 'ON' : 'K', midX, midY + 0.5);
          } else if (ch === 'L') {
            if (!simState.gateOpen) {
              // Locked Laser Gate — Crimson barrier clearly impassable
              ctx.fillStyle = '#450a0a';
              ctx.beginPath();
              ctx.roundRect(offsetX + x * cellSize + 2, offsetY + y * cellSize + 2, cellSize - 4, cellSize - 4, 6);
              ctx.fill();
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 2;
              ctx.stroke();
              for (let b = -1; b <= 1; b++) {
                ctx.beginPath();
                ctx.moveTo(offsetX + x * cellSize + 5, midY + b * (cellSize * 0.22));
                ctx.lineTo(offsetX + (x + 1) * cellSize - 5, midY + b * (cellSize * 0.22));
                ctx.stroke();
              }
              ctx.font = `${Math.floor(cellSize * 0.28)}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('🔒', midX, midY);
            } else {
              // Opened Gate — Walkable Mint Floor
              ctx.fillStyle = '#bbf7d0';
              ctx.beginPath();
              ctx.roundRect(offsetX + x * cellSize + 2, offsetY + y * cellSize + 2, cellSize - 4, cellSize - 4, 6);
              ctx.fill();
              ctx.strokeStyle = '#10b981';
              ctx.lineWidth = 2;
              ctx.stroke();
              ctx.fillStyle = '#047857';
              ctx.font = `bold ${Math.floor(cellSize * 0.34)}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('✓', midX, midY);
            }
          } else if (ch === 'D' && !simState.collectedGems.includes(`${x},${y}`)) {
            const bob = Math.sin(t * 2 + x) * 2.5;
            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.moveTo(midX, midY - cellSize * 0.28 + bob);
            ctx.lineTo(midX + cellSize * 0.24, midY + bob);
            ctx.lineTo(midX, midY + cellSize * 0.28 + bob);
            ctx.lineTo(midX - cellSize * 0.24, midY + bob);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#0369a1';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#7dd3fc';
            ctx.beginPath();
            ctx.moveTo(midX, midY - cellSize * 0.22 + bob);
            ctx.lineTo(midX + cellSize * 0.12, midY - cellSize * 0.02 + bob);
            ctx.lineTo(midX, midY + cellSize * 0.05 + bob);
            ctx.closePath();
            ctx.fill();
          } else if (ch === 'G') {
            const pulse = 1 + Math.sin(t * 2.2) * 0.08;
            ctx.save();
            ctx.translate(midX, midY);
            ctx.scale(pulse, pulse);
            ctx.fillStyle = 'rgba(245, 158, 11, 0.28)';
            ctx.beginPath();
            ctx.arc(0, 0, cellSize * 0.36, 0, Math.PI * 2);
            ctx.fill();
            ctx.font = `${Math.floor(cellSize * 0.5)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⭐', 0, 1);
            ctx.restore();
          }
        }
      }

      // Draw Crisp Custom Vector Robot with Directional Visor & Forward Indicator
      const rx = offsetX + simState.x * cellSize + cellSize / 2;
      const ry = offsetY + simState.y * cellSize + cellSize / 2;
      const rRad = cellSize * 0.34;

      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate((simState.dir * 90 * Math.PI) / 180);

      // Soft drop shadow on bright floor
      ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
      ctx.beginPath();
      ctx.arc(1.5, 2.5, rRad * 1.05, 0, Math.PI * 2);
      ctx.fill();

      // Chassis body (facing RIGHT/East at rot=0)
      const roboGrad = ctx.createLinearGradient(-rRad, -rRad, rRad, rRad);
      roboGrad.addColorStop(0, '#0ea5e9');
      roboGrad.addColorStop(1, '#0369a1');
      ctx.fillStyle = roboGrad;
      ctx.beginPath();
      ctx.roundRect(-rRad, -rRad * 0.85, rRad * 2, rRad * 1.7, rRad * 0.42);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Front Visor & Glowing Direction Eyes (on +X face)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(rRad * 0.12, -rRad * 0.56, rRad * 0.68, rRad * 1.12, 4);
      ctx.fill();
      ctx.fillStyle = simState.status === 'failed' ? '#ef4444' : '#4ade80';
      ctx.beginPath();
      ctx.arc(rRad * 0.48, -rRad * 0.24, rRad * 0.14, 0, Math.PI * 2);
      ctx.arc(rRad * 0.48, rRad * 0.24, rRad * 0.14, 0, Math.PI * 2);
      ctx.fill();

      // Bold High-Contrast Forward Arrow Nose
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(rRad * 1.24, 0);
      ctx.lineTo(rRad * 0.84, -rRad * 0.28);
      ctx.lineTo(rRad * 0.84, rRad * 0.28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
      ctx.restore();

      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(rafId);
  }, [viewMode, currentStage, parsedGrid, simState]);

  const usedBlockCount = useMemo(() => countAllBlocks(workspace, f1Workspace), [workspace, f1Workspace]);
  const pseudocodeLines = useMemo(() => generatePseudocode(workspace, f1Workspace), [workspace, f1Workspace]);

  const renderBlockItem = (
    b: CmdBlock,
    idx: number,
    arrLen: number,
    isF1: boolean,
    parentLoopId?: string
  ) => {
    const isRunningThis = simState.activeBlockId === b.id;

    if (b.type === 'LOOP') {
      const isTargetLoop = activeLoopId === b.id;
      return (
        <div
          key={b.id}
          className={cn(
            'rounded-xl border-2 p-2 transition-all space-y-1.5',
            isTargetLoop
              ? 'border-emerald-400 bg-emerald-950/50 shadow-sm'
              : 'border-emerald-700/60 bg-emerald-950/25'
          )}
        >
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveLoopId(isTargetLoop ? null : b.id)}
              className="flex items-center gap-1.5 text-left text-xs font-extrabold text-emerald-300"
            >
              <Repeat size={13} />
              <span>ULANGI</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-200 font-mono tabular-nums">
                {b.count || 2}x
              </span>
              {isTargetLoop && (
                <span className="text-[10px] font-bold text-emerald-300 underline ml-1">
                  [Target Aktif]
                </span>
              )}
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => updateLoopCount(b.id, (b.count || 2) - 1, isF1)}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-black flex items-center justify-center"
                title="Kurangi Ulangan"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => updateLoopCount(b.id, (b.count || 2) + 1, isF1)}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-black flex items-center justify-center"
                title="Tambah Ulangan"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => moveBlockOrder(idx, -1, isF1)}
                disabled={idx === 0}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30"
                title="Pindah Naik"
              >
                <ArrowUp size={12} />
              </button>
              <button
                type="button"
                onClick={() => moveBlockOrder(idx, 1, isF1)}
                disabled={idx === arrLen - 1}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30"
                title="Pindah Turun"
              >
                <ArrowDown size={12} />
              </button>
              <button
                type="button"
                onClick={() => removeBlockById(b.id, isF1)}
                className="p-1 rounded bg-rose-950/70 hover:bg-rose-800 text-rose-300"
                title="Hapus Loop"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          <div className="pl-3 border-l-2 border-emerald-500/40 space-y-1">
            {b.children && b.children.length > 0 ? (
              b.children.map((child, cIdx) =>
                renderBlockItem(child, cIdx, b.children!.length, isF1, b.id)
              )
            ) : (
              <button
                type="button"
                onClick={() => setActiveLoopId(b.id)}
                className="w-full py-1.5 text-[11px] font-semibold text-emerald-300/70 border border-dashed border-emerald-700/60 rounded-lg hover:bg-emerald-900/20"
              >
                + Klik di sini lalu tekan blok untuk mengisi Loop
              </button>
            )}
          </div>
        </div>
      );
    }

    const labelMap: Record<CmdType, { text: string; bg: string }> = {
      MOVE: { text: 'MAJU 1 LANGKAH', bg: 'bg-sky-600/90 border-sky-400/50 text-white' },
      RIGHT: { text: 'BELOK KANAN ↻', bg: 'bg-amber-600/90 border-amber-400/50 text-white' },
      LEFT: { text: 'BELOK KIRI ↺', bg: 'bg-orange-600/90 border-orange-400/50 text-white' },
      CALL_F1: { text: 'PANGGIL FUNGSI F1', bg: 'bg-rose-600/90 border-rose-400/50 text-white' },
      LOOP: { text: 'ULANGI', bg: 'bg-emerald-600 text-white' },
    };

    const meta = labelMap[b.type];

    return (
      <div
        key={b.id}
        className={cn(
          'px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-between gap-2 transition-all',
          meta.bg,
          isRunningThis && 'ring-2 ring-yellow-300 scale-[1.02] shadow-md'
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[10px] opacity-80 tabular-nums">{idx + 1}.</span>
          <span className="truncate">{meta.text}</span>
          {isRunningThis && simState.activeLoopBadge && (
            <span className="px-1.5 py-0.5 rounded bg-yellow-300 text-slate-950 font-mono text-[10px] font-black">
              {simState.activeLoopBadge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => moveBlockOrder(idx, -1, isF1, parentLoopId)}
            disabled={idx === 0}
            className="p-1 rounded hover:bg-black/25 disabled:opacity-30"
            title="Naik"
          >
            <ArrowUp size={12} />
          </button>
          <button
            type="button"
            onClick={() => moveBlockOrder(idx, 1, isF1, parentLoopId)}
            disabled={idx === arrLen - 1}
            className="p-1 rounded hover:bg-black/25 disabled:opacity-30"
            title="Turun"
          >
            <ArrowDown size={12} />
          </button>
          <button
            type="button"
            onClick={() => removeBlockById(b.id, isF1, parentLoopId)}
            className="p-1 rounded hover:bg-black/30"
            title="Hapus"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    );
  };

  const handleRestartFromScratch = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore storage errors
    }
    setProgressMap({});
    setConfirmResetOpen(false);
    loadStage(1);
  };

  // ================= VIEW 1: TITLE MENU AWAL (AI ARTWORK + PROGRESSIVE START) =================
  if (viewMode === 'menu') {
    const rank = getCodingRank(totalStars);
    const starPct = Math.round((totalStars / 108) * 100);
    const studentFirstName = currentStudent?.nama ? String(currentStudent.nama).split(' ')[0] : 'Sobat Koding';

    return (
      <div className="w-full h-full flex items-center justify-center max-w-6xl mx-auto text-slate-100 overflow-y-auto custom-scrollbar p-1 sm:p-2">
        <div className="w-full bg-slate-900/95 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Hero AI Artwork Showcase (7 cols) */}
          <div className="lg:col-span-7 relative min-h-[260px] sm:min-h-[340px] lg:min-h-[460px] bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 overflow-hidden flex flex-col justify-end p-5 sm:p-7">
            <img
              src={kodingMenuHeroImg}
              alt="Ilustrasi Dunia Petualangan Koding Master SMP"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 to-slate-950/15" />

            <div className="relative z-10 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-300 flex-wrap">
                <span>Koding Master SMP</span>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span>36 Misi Algoritma</span>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span className={rank.colorClass}>{rank.label}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight drop-shadow">
                Petualangan Robot Byte
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed">
                Susun blok algoritma cerdas untuk membantu Robot Byte melintasi labirin, gerbang laser, lantai es, hingga portal kuantum!
              </p>

              {hasProgress && (
                <div className="pt-2 space-y-1.5 max-w-md">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200 tabular-nums">
                    <span>Progres: Stage {completedCount}/36</span>
                    <span className="text-amber-300">★ {totalStars}/108 · {totalGameScore} Poin</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-950/85 rounded-full overflow-hidden border border-slate-700/80">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, starPct)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Interactive Menu Controls (5 cols) */}
          <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between gap-5 bg-slate-900">
            <div className="flex items-center gap-3.5">
              <RobotPortraitThumb className="w-16 h-16 sm:w-20 sm:h-20" />
              <div className="min-w-0 space-y-0.5">
                <p className="text-xs font-bold text-sky-400">
                  Halo, {studentFirstName}!
                </p>
                <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                  Menu Utama Permainan
                </h3>
                <p className="text-xs text-slate-400">
                  {hasProgress
                    ? `Terakhir terbuka: Stage ${highestUnlockedStage}`
                    : 'Mulai petualanganmu dari Stage 1!'}
                </p>
              </div>
            </div>

            {/* Action Menu Stack */}
            <div className="space-y-3">
              {hasProgress ? (
                <>
                  <button
                    type="button"
                    onClick={() => loadStage(highestUnlockedStage)}
                    className="w-full min-h-[52px] px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-sm sm:text-base flex items-center justify-between shadow-lg shadow-emerald-500/20 transition-transform active:scale-[0.98]"
                  >
                    <span className="flex items-center gap-2.5">
                      <Play size={18} className="fill-slate-950" />
                      Lanjutkan
                    </span>
                    <span className="text-xs font-extrabold bg-slate-950/15 px-2.5 py-1 rounded-lg tabular-nums">
                      Stage {highestUnlockedStage}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmResetOpen(true)}
                    className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-extrabold text-sm flex items-center justify-between transition-colors active:scale-[0.98]"
                  >
                    <span className="flex items-center gap-2.5">
                      <RotateCcw size={17} className="text-amber-400" />
                      Ulang dari Awal
                    </span>
                    <span className="text-xs font-semibold text-slate-400">Reset ke Stage 1</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => loadStage(1)}
                  className="w-full min-h-[54px] px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-base flex items-center justify-between shadow-lg shadow-emerald-500/20 transition-transform active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2.5">
                    <Play size={20} className="fill-slate-950" />
                    Mulai Permainan
                  </span>
                  <span className="text-xs font-extrabold bg-slate-950/15 px-2.5 py-1 rounded-lg">
                    Stage 1 →
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowGuideModal(true)}
                className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 border border-sky-400/40 font-extrabold text-sm flex items-center justify-between transition-colors active:scale-[0.98]"
              >
                <span className="flex items-center gap-2.5">
                  <BookOpen size={17} className="text-sky-400" />
                  Tutorial
                </span>
                <span className="text-xs font-semibold text-sky-300/80">Cara Bermain</span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setViewMode('admin_stages')}
                  className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-400/45 font-extrabold text-sm flex items-center justify-between transition-colors active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2.5">
                    <Compass size={17} className="text-amber-400" />
                    Lihat Semua Stage
                  </span>
                  <span className="text-xs font-bold text-amber-300 tabular-nums">Admin · 36 Stage</span>
                </button>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>{isAdmin ? 'Mode Pratinjau Admin Aktif' : 'Selesaikan tiap stage untuk membuka misi baru'}</span>
              <span className="tabular-nums font-bold text-slate-300">Bab 1–6</span>
            </div>
          </div>
        </div>

        {/* Confirm Reset Progress Modal */}
        {confirmResetOpen && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-5 sm:p-6 space-y-4 text-center shadow-2xl">
              <div className="flex justify-center">
                <RobotPortraitThumb variant="fail" className="w-20 h-20" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-black text-lg text-white">Ulang dari Awal?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Progres stage, bintang, dan poin yang tersimpan untuk sesi permainan ini akan direset dan kamu akan memulai kembali dari <strong>Stage 1</strong>.
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmResetOpen(false)}
                  className="flex-1 min-h-[42px] py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleRestartFromScratch}
                  className="flex-1 min-h-[42px] py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg"
                >
                  Ya, Mulai Stage 1
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Tutorial Modal */}
        {showGuideModal && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-4 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <RobotPortraitThumb className="w-12 h-12" />
                  <div>
                    <h3 className="font-black text-lg text-white">Tutorial Bermain Koding Master</h3>
                    <p className="text-xs text-slate-400">Pelajari blok, rintangan labirin, dan kontrol sebelum memulai!</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-1.5">
                  <p className="font-extrabold text-emerald-300">1. Tujuan & Jalan Aman vs Terhalang</p>
                  <p className="text-slate-300 leading-relaxed">
                    Arahkan robot ke <strong>Bintang ⭐</strong> lewat <strong>petak terang</strong> (Jalan Aman) dan <strong>Es Biru</strong>. Jangan menabrak <strong>Tembok gelap</strong>, jatuh ke <strong>Jurang merah</strong>, atau menyentuh <strong>Laser 🔒</strong> sebelum menginjak sakelar!
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-1.5">
                  <p className="font-extrabold text-sky-300">2. Susun Blok & Kontrol Keyboard</p>
                  <p className="text-slate-300 leading-relaxed">
                    Klik tombol perintah atau pakai keyboard: <strong>W / ↑</strong> (Maju), <strong>D / →</strong> (Kanan), <strong>A / ←</strong> (Kiri), <strong>Spasi</strong> (Jalankan), <strong>Backspace</strong> (Hapus), <strong>R</strong> (Reset).
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-1.5">
                  <p className="font-extrabold text-violet-300">3. Permata, Sakelar, Portal & Es</p>
                  <p className="text-slate-300 leading-relaxed">
                    Ambil semua <strong>Permata 💎</strong> sebelum finis. Injak <strong>Sakelar (K)</strong> untuk mematikan laser. Masuk <strong>Portal A/B</strong> untuk berteleportasi, dan perhitungkan luncuran otomatis di petak <strong>Es ❄️</strong>.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-1.5">
                  <p className="font-extrabold text-amber-300">4. Raih 3 Bintang dengan Loop & F1</p>
                  <p className="text-slate-300 leading-relaxed">
                    Di bab lanjutan, pakai blok <strong>ULANGI (Loop)</strong> dan tab <strong>Definisi F1</strong> agar jumlah blok sehemat mungkin. Gunakan tombol <strong>Langkah</strong> untuk mengecek program satu per satu!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-full py-3 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black rounded-2xl text-sm shadow-lg"
              >
                Mengerti, Tutup Tutorial
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================= VIEW 1B: ADMIN ALL-STAGE EXPLORER (ONLY FOR ADMIN) =================
  if (viewMode === 'admin_stages' && isAdmin) {
    const visibleStages =
      selectedChapter === 0
        ? KODING_STAGES
        : KODING_STAGES.filter((s) => s.chapter === selectedChapter);

    return (
      <div className="w-full h-full flex flex-col gap-3.5 max-w-6xl mx-auto text-slate-100 overflow-hidden">
        {/* Admin Explorer Header */}
        <div className="bg-slate-900/95 border border-amber-400/35 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <RobotPortraitThumb className="w-12 h-12" />
            <div className="min-w-0">
              <div className="text-xs font-bold text-amber-300">
                Mode Admin · Uji Coba Semua Stage (1–36)
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white truncate">
                Daftar Lengkap 36 Stage & 6 Bab Algoritma
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setViewMode('menu')}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-100 flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <ChevronLeft size={15} /> Kembali ke Menu Awal
          </button>
        </div>

        {/* Chapter Filter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 shrink-0">
          {CHAPTERS.map((ch) => {
            const stagesInCh = KODING_STAGES.filter((s) => s.chapter === ch.id);
            const doneInCh = stagesInCh.filter((s) => Boolean(progressMap[s.id])).length;
            const starsInCh = stagesInCh.reduce((sum, s) => sum + (progressMap[s.id]?.stars || 0), 0);
            const isSelected = selectedChapter === ch.id;

            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => setSelectedChapter(isSelected ? 0 : ch.id)}
                className={cn(
                  'text-left p-2.5 rounded-2xl border transition-all flex flex-col justify-between gap-1.5',
                  isSelected
                    ? ch.activeBg
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-600 text-slate-200'
                )}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span className="text-base leading-none">{ch.emoji}</span>
                  <span className="text-[11px] font-bold text-amber-300 tabular-nums">★ {starsInCh}/18</span>
                </div>
                <div className={cn('text-[11px] font-extrabold truncate', isSelected ? 'text-white' : ch.badgeColor)}>
                  Bab {ch.id} · {ch.shortName}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold tabular-nums">
                  {doneInCh}/6 selesai
                </div>
              </button>
            );
          })}
        </div>

        {/* All 36 Stage Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-4">
            {visibleStages.map((st) => {
              const prog = progressMap[st.id];
              const chMeta = CHAPTERS.find((c) => c.id === st.chapter);
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => loadStage(st.id)}
                  className="text-left p-3.5 rounded-2xl border bg-slate-900/95 border-slate-800 hover:border-sky-400/70 hover:bg-slate-800/90 transition-all flex items-center gap-3.5 group cursor-pointer"
                >
                  <MiniStagePreview map={st.map} />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                      <span className={cn('truncate', chMeta?.badgeColor || 'text-sky-400')}>
                        Stage {String(st.id).padStart(2, '0')} · {st.concept}
                      </span>
                      {prog && (
                        <span className="flex items-center gap-0.5 shrink-0">
                          {[1, 2, 3].map((n) => (
                            <Star
                              key={n}
                              size={12}
                              className={n <= prog.stars ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}
                            />
                          ))}
                        </span>
                      )}
                    </div>
                    <h4 className="font-extrabold text-sm text-white group-hover:text-sky-300 truncate">
                      {st.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">{st.subtitle}</p>
                    <div className="flex items-center justify-between pt-1 text-[11px] font-semibold text-slate-400 tabular-nums">
                      <span>Target ≤ {st.parBlocks} blok</span>
                      <span className="font-extrabold text-sky-400">Uji Stage →</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ================= VIEW 2: ACTIVE STAGE PLAYGROUND & WORKSPACE =================
  const isOptimalBlocks = usedBlockCount > 0 && usedBlockCount <= currentStage.parBlocks;

  return (
    <div className="w-full h-full flex flex-col gap-3 max-w-7xl mx-auto text-slate-100 overflow-hidden">
      {/* Top Interactive Stage Toolbar */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2 flex-wrap shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => {
              stopTimer();
              setViewMode('menu');
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 border border-slate-700 shrink-0"
          >
            <ChevronLeft size={14} /> Menu Awal
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                stopTimer();
                setViewMode('admin_stages');
              }}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold border border-amber-400/40 shrink-0 hidden sm:inline-flex items-center gap-1"
            >
              <Compass size={13} /> Semua Stage
            </button>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-bold text-sky-400 truncate">
              <span>Stage {currentStage.id}/36</span>
              <span aria-hidden="true">·</span>
              <span>{currentStage.concept}</span>
              <span aria-hidden="true">·</span>
              <span className={cn('tabular-nums', isOptimalBlocks ? 'text-emerald-400' : 'text-amber-300')}>
                Blok: {usedBlockCount} (Target ≤ {currentStage.parBlocks})
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white truncate">
              {currentStage.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Speed Selector */}
          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 text-[11px] font-bold">
            {([1, 2, 4] as const).map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => setExecSpeed(sp)}
                className={cn(
                  'px-2 py-1 rounded-lg transition-colors tabular-nums',
                  execSpeed === sp ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:text-white'
                )}
                title={`Kecepatan ${sp}x`}
              >
                {sp}x
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowHint((h) => !h)}
            className={cn(
              'px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-colors',
              showHint
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
            )}
            title="Lihat Petunjuk Stage"
          >
            <Lightbulb size={14} /> <span className="hidden sm:inline">Petunjuk</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPseudocode((v) => !v)}
            className={cn(
              'px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-colors',
              showPseudocode
                ? 'bg-indigo-500 text-white border-indigo-400'
                : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-slate-700'
            )}
            title="Lihat Terjemahan Kode Python"
          >
            <Terminal size={14} /> <span className="hidden sm:inline">Kode Python</span>
          </button>

          <button
            type="button"
            onClick={() => setSoundMuted((m) => !m)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title={soundMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
          >
            {soundMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

          {/* Prev/Next Stage Quick Switch */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={stageId <= 1}
              onClick={() => loadStage(stageId - 1)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-35"
              title="Stage Sebelumnya"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              disabled={stageId >= KODING_STAGES.length || (!isAdmin && stageId + 1 > highestUnlockedStage)}
              onClick={() => loadStage(stageId + 1)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-35"
              title="Stage Berikutnya"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Playground: Left Coding Deck & Right Simulation Arena */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-y-auto lg:overflow-hidden custom-scrollbar">
        {/* LEFT / TOP ZONE: Palette + Workspace Builder */}
        <div className="lg:col-span-5 bg-slate-900/95 border border-slate-800 rounded-2xl p-3 flex flex-col gap-3 min-h-[340px] lg:min-h-0 lg:overflow-hidden">
          {/* Command Palette */}
          <div className="space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Tambahkan Blok Perintah</span>
              {activeLoopId && (
                <button
                  type="button"
                  onClick={() => setActiveLoopId(null)}
                  className="text-[11px] text-emerald-400 hover:underline font-bold"
                >
                  Sedang mengisi Loop · Klik untuk kembali ke Utama
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => addBlock('MOVE')}
                disabled={simState.status === 'running'}
                className="min-h-[44px] px-2.5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <ArrowRight size={15} /> Maju
              </button>
              <button
                type="button"
                onClick={() => addBlock('RIGHT')}
                disabled={simState.status === 'running'}
                className="min-h-[44px] px-2.5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <RotateCw size={15} /> Kanan
              </button>
              <button
                type="button"
                onClick={() => addBlock('LEFT')}
                disabled={simState.status === 'running'}
                className="min-h-[44px] px-2.5 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <RotateCcw size={15} /> Kiri
              </button>
            </div>

            {(currentStage.allowLoop || currentStage.allowF1) && (
              <div className="grid grid-cols-2 gap-2">
                {currentStage.allowLoop && (
                  <button
                    type="button"
                    onClick={() => addBlock('LOOP')}
                    disabled={simState.status === 'running' || Boolean(activeLoopId)}
                    className="min-h-[40px] px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-45 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Repeat size={14} /> Blok ULANGI (Loop)
                  </button>
                )}
                {currentStage.allowF1 && (
                  <button
                    type="button"
                    onClick={() => addBlock('CALL_F1')}
                    disabled={simState.status === 'running' || activeTab === 'f1'}
                    className="min-h-[40px] px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-45 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Layers size={14} /> Panggil F1
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Workspace Header Tabs (Utama vs Fungsi F1) */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800 shrink-0">
            <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('main');
                  setActiveLoopId(null);
                }}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-extrabold transition-colors',
                  activeTab === 'main' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                )}
              >
                Program Utama ({workspace.length})
              </button>
              {currentStage.allowF1 && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('f1');
                    setActiveLoopId(null);
                  }}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-extrabold transition-colors',
                    activeTab === 'f1' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  )}
                >
                  Definisi F1 ({f1Workspace.length})
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (simState.status === 'running') return;
                if (activeTab === 'f1') setF1Workspace([]);
                else setWorkspace([]);
                setActiveLoopId(null);
                resetRobotOnly();
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/70 text-slate-300 hover:text-rose-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
              title="Bersihkan Blok"
            >
              <Trash2 size={12} /> Bersihkan
            </button>
          </div>

          {/* Block Sequence Workspace (or Python Live View) */}
          <div className="flex-1 min-h-[140px] bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 overflow-y-auto space-y-1.5 custom-scrollbar">
            {showPseudocode ? (
              <pre className="font-mono text-xs text-emerald-300 leading-relaxed whitespace-pre-wrap p-2">
                {pseudocodeLines.join('\n')}
              </pre>
            ) : (activeTab === 'main' ? workspace : f1Workspace).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 text-xs space-y-1">
                <Plus size={20} className="opacity-60" />
                <p className="font-semibold">
                  {activeTab === 'f1'
                    ? 'Susun langkah reusable untuk Fungsi F1 di sini.'
                    : 'Klik tombol Maju / Kanan / Kiri di atas (atau gunakan tombol panah keyboard).'}
                </p>
              </div>
            ) : (
              (activeTab === 'main' ? workspace : f1Workspace).map((b, i, arr) =>
                renderBlockItem(b, i, arr.length, activeTab === 'f1')
              )
            )}
          </div>

          {/* Playback & Debug Controls */}
          <div className="grid grid-cols-4 gap-2 shrink-0">
            <button
              type="button"
              onClick={() => resetRobotOnly()}
              className="min-h-[44px] py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1 border border-slate-700 active:scale-95 transition-all"
              title="Reset Posisi Robot (Tombol R)"
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button
              type="button"
              onClick={handleStepForward}
              disabled={simState.status === 'running'}
              className="min-h-[44px] py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-45 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all"
              title="Eksekusi 1 Langkah (Step Debugger)"
            >
              <StepForward size={14} /> Langkah
            </button>
            {simState.status === 'running' ? (
              <button
                type="button"
                onClick={() => resetRobotOnly('⏸ Simulasi dihentikan.')}
                className="col-span-2 min-h-[44px] py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
              >
                <Pause size={16} /> Hentikan
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRunProgram}
                className="col-span-2 min-h-[44px] py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
              >
                <Play size={16} /> JALANKAN
              </button>
            )}
          </div>
        </div>

        {/* RIGHT ZONE: Interactive Arena Canvas + Status Feedback + Victory Overlay */}
        <div className="lg:col-span-7 bg-slate-900/95 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col justify-between gap-2.5 min-h-[320px] lg:min-h-0 relative overflow-hidden">
          {/* Status / Mission Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap shrink-0">
            <div
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border flex-1 min-w-[200px]',
                simState.status === 'won'
                  ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                  : simState.status === 'failed'
                  ? 'bg-rose-950/70 border-rose-500/60 text-rose-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-200'
              )}
            >
              <Zap size={14} className="shrink-0" />
              <span className="truncate">{simState.message}</span>
            </div>

            {parsedGrid.gems.length > 0 && (
              <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-extrabold text-sky-300 tabular-nums shrink-0">
                💎 {simState.collectedGems.length}/{parsedGrid.gems.length}
              </div>
            )}
          </div>

          {showHint && (
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/50 text-xs font-semibold text-amber-200 flex items-start gap-2 shrink-0">
              <Lightbulb size={15} className="text-amber-400 shrink-0 mt-0.5" />
              <span>{currentStage.hint}</span>
            </div>
          )}

          {/* Arena Canvas */}
          <div className="flex-1 min-h-0 flex items-center justify-center bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative">
            <canvas
              ref={canvasRef}
              width={540}
              height={360}
              className="w-full h-full object-contain"
            />

            {/* Engaging Failure Overlay */}
            {simState.status === 'failed' && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-20 animate-in zoom-in-95">
                <div className="bg-gradient-to-b from-rose-950/95 via-slate-900/95 to-slate-950/95 border-2 border-rose-400/70 rounded-3xl p-5 sm:p-6 max-w-sm w-full text-center space-y-3.5 shadow-2xl">
                  <div className="flex justify-center">
                    <RobotPortraitThumb variant="fail" className="w-16 h-16 sm:w-20 sm:h-20" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xl sm:text-2xl font-black text-rose-300 tracking-tight">
                      Gagal! Ayo Coba Lagi!
                    </h4>
                    <p className="text-xs sm:text-sm font-bold text-white">
                      {simState.message}
                    </p>
                    <p className="text-[11px] text-slate-300 leading-relaxed pt-0.5">
                      Periksa kembali arah belok atau gunakan tombol <strong>Langkah</strong> untuk mengecek tiap perintah.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2.5 flex-wrap pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowHint(true);
                        resetRobotOnly();
                      }}
                      className="min-h-[42px] px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-extrabold border border-amber-500/40 flex items-center gap-1.5 transition-colors"
                    >
                      <Lightbulb size={14} /> Lihat Petunjuk
                    </button>
                    <button
                      type="button"
                      onClick={() => resetRobotOnly()}
                      className="min-h-[42px] px-5 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white text-xs sm:text-sm font-black shadow-lg shadow-rose-500/25 flex items-center gap-1.5 transition-transform active:scale-95"
                    >
                      <RotateCcw size={15} /> Ayo Coba Lagi
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Engaging Victory Overlay */}
            {simState.status === 'won' && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-20 animate-in zoom-in-95">
                <div className="bg-gradient-to-b from-emerald-950/95 via-slate-900/95 to-slate-950/95 border-2 border-emerald-400/75 rounded-3xl p-5 sm:p-6 max-w-md w-full text-center space-y-3.5 shadow-2xl">
                  <div className="flex items-center justify-center gap-3">
                    <RobotPortraitThumb variant="win" className="w-16 h-16 sm:w-20 sm:h-20" />
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3].map((n) => (
                        <Star
                          key={n}
                          size={34}
                          className={cn(
                            'transition-transform',
                            n <= lastClearStars
                              ? 'fill-amber-400 text-amber-400 scale-110 drop-shadow-md'
                              : 'text-slate-700'
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xl sm:text-2xl font-black text-emerald-300 tracking-tight">
                      {stageId === KODING_STAGES.length
                        ? 'Anda Berhasil Menamatkan 36 Stage!!'
                        : 'Anda Berhasil!!'}
                    </h4>
                    <p className="text-xs sm:text-sm font-bold text-white">
                      {stageId === KODING_STAGES.length
                        ? 'Hebat! Kamu resmi menjadi Grandmaster Koding SMP!'
                        : `Stage ${stageId} (${currentStage.title}) tuntas dengan gemilang!`}
                    </p>
                    <p className="text-xs text-slate-300 font-semibold tabular-nums pt-0.5">
                      Blok digunakan: <strong>{usedBlockCount}</strong> (Target 3★: ≤ {currentStage.parBlocks}) · Skor: <strong className="text-emerald-400">+{lastClearScore}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap justify-center pt-1">
                    <button
                      type="button"
                      onClick={() => resetRobotOnly()}
                      className="min-h-[42px] px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold border border-slate-700"
                    >
                      Ulangi / Optimalkan
                    </button>
                    {stageId < KODING_STAGES.length ? (
                      <button
                        type="button"
                        onClick={() => loadStage(stageId + 1)}
                        className="min-h-[42px] px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-transform active:scale-95"
                      >
                        Ke Stage Berikutnya <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setViewMode('menu')}
                        className="min-h-[42px] px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-amber-950 text-xs sm:text-sm font-black shadow-lg flex items-center gap-1.5 transition-transform active:scale-95"
                      >
                        <Trophy size={16} /> Kembali ke Peta Utama
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Explicit Walkable vs Blocked Visual Legend Strip */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between gap-3 text-[11px] font-semibold flex-wrap shrink-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-emerald-400 font-extrabold">Bisa Dilewati:</span>
              <span className="inline-flex items-center gap-1.5 text-slate-200">
                <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-300 inline-block shrink-0" />
                Jalan Aman
              </span>
              <span className="inline-flex items-center gap-1.5 text-sky-300">
                <span className="w-3.5 h-3.5 rounded bg-sky-300 border border-sky-500 inline-block shrink-0" />
                Es Licin (Meluncur)
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                <span>⭐ Tujuan · 💎 Permata · 🔘 Sakelar · 🌀 Portal</span>
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-rose-400 font-extrabold">Tidak Bisa Lewat:</span>
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                <span className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-600 inline-block shrink-0" />
                Tembok
              </span>
              <span className="inline-flex items-center gap-1.5 text-rose-300">
                <span className="w-3.5 h-3.5 rounded bg-slate-950 border border-rose-500 inline-block shrink-0" />
                Jurang
              </span>
              <span className="inline-flex items-center gap-1.5 text-rose-300">
                <span className="w-3.5 h-3.5 rounded bg-rose-950 border border-red-500 inline-block shrink-0" />
                Laser Terkunci
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
