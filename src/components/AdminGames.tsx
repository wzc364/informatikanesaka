/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2, 
  Trophy, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  X, 
  Sparkles, 
  Award, 
  Zap, 
  Flame, 
  Puzzle, 
  Calculator, 
  Code, 
  Eye, 
  Settings, 
  Users, 
  Search,
  BookOpen,
  ArrowRight,
  Clock,
  Trash2,
  Check,
  Maximize,
  Minimize,
  GripVertical,
  MoveUp,
  MoveDown,
  ChevronDown,
  MoveLeft,
  MoveRight
} from 'lucide-react';
import { cn } from '../utils';
import { dedupeHighestGameScores, formatScoreTimestamp } from '../scoreUtils';
import { doc, setDoc, collection, onSnapshot, deleteDoc, arrayUnion, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { COURSES } from '../constants';
import ContraSnesGame from './ContraSnesGame';
import FightingGame from './FightingGame';
import infokombatBg from '../assets/images/game_infokombat_bg_1795243068344.jpg';
import contraSnesBg from '../assets/images/game_infowar_bg_1795243067848.jpg';
import petualanganSmpBg from '../assets/images/game_petualangan_bg_1795243067941.jpg';
import patternMasterBg from '../assets/images/game_pattern_bg_1795243068059.jpg';
import scratchBlocksBg from '../assets/images/game_koding_bg_1795243068875.jpg';
import dekomposisiBg from '../assets/images/game_dekomposisi_bg_1795243068709.jpg';
import starCatcherBg from '../assets/images/game_starcatcher_bg_1795243067534.jpg';

const GAME_ART_MAP: Record<string, { image: string; fallbackGradient: string; accentClass: string; badgeText: string }> = {
  'infokombat': {
    image: infokombatBg,
    fallbackGradient: 'from-rose-900 via-red-900 to-slate-950',
    accentClass: 'bg-rose-600',
    badgeText: '16-Bit Fighting'
  },
  'contra-snes': {
    image: contraSnesBg,
    fallbackGradient: 'from-orange-900 via-rose-900 to-slate-950',
    accentClass: 'bg-orange-600',
    badgeText: 'SNES Run & Gun'
  },
  'petualangan-smp': {
    image: petualanganSmpBg,
    fallbackGradient: 'from-blue-800 via-indigo-900 to-slate-950',
    accentClass: 'bg-blue-600',
    badgeText: 'Platformer 4 Stage'
  },
  'pattern-master': {
    image: patternMasterBg,
    fallbackGradient: 'from-indigo-900 via-violet-900 to-slate-950',
    accentClass: 'bg-indigo-600',
    badgeText: 'Logika Bilangan'
  },
  'scratch-blocks': {
    image: scratchBlocksBg,
    fallbackGradient: 'from-amber-800 via-orange-900 to-slate-950',
    accentClass: 'bg-amber-600',
    badgeText: 'Algoritma Labirin'
  },
  'dekomposisi-puzzle': {
    image: dekomposisiBg,
    fallbackGradient: 'from-emerald-900 via-teal-900 to-slate-950',
    accentClass: 'bg-emerald-600',
    badgeText: 'Modular System'
  },
  'star-catcher': {
    image: starCatcherBg,
    fallbackGradient: 'from-violet-900 via-fuchsia-900 to-slate-950',
    accentClass: 'bg-violet-600',
    badgeText: 'Arcade Visual'
  }
};

export interface GameItem {
  id: string;
  title: string;
  category: string;
  description: string;
  iconName: 'Calculator' | 'Code' | 'Puzzle' | 'Gamepad2';
  difficulty: 'Mudah' | 'Sedang' | 'Tantangan';
  defaultTimerSec: number;
}

function detectMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '');
  const coarsePointer = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
  const hasTouch = 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0;
  const smallSide = Math.min(window.innerWidth, window.innerHeight) <= 900;
  return uaMobile || coarsePointer || (hasTouch && smallSide);
}

async function lockMobileLandscape(targetEl?: HTMLElement | null) {
  if (!detectMobileDevice()) return;
  try {
    const el = targetEl || document.documentElement;
    if (el?.requestFullscreen && !document.fullscreenElement) {
      await el.requestFullscreen();
    }
  } catch {
    // Fullscreen may be disallowed in certain browsers/iframes
  }
  try {
    const orientation = screen.orientation as ScreenOrientation & { lock?: (mode: string) => Promise<void> };
    if (orientation?.lock) {
      await orientation.lock('landscape');
    }
  } catch {
    // Fallback CSS landscape rotation in InteractiveGameModal handles iOS/Safari & restricted iframes
  }
}

function unlockMobileOrientation() {
  try {
    const orientation = screen.orientation as ScreenOrientation & { unlock?: () => void };
    if (orientation?.unlock) {
      orientation.unlock();
    }
  } catch {
    // Ignore unlock errors
  }
}

function GameCardBanner({ gameId, title, category }: { gameId: string; title?: string; category?: string }) {
  const art = GAME_ART_MAP[gameId] || {
    image: starCatcherBg,
    fallbackGradient: 'from-slate-800 to-slate-950',
    accentClass: 'bg-brand',
    badgeText: 'Game Edukasi'
  };

  return (
    <div className={cn("h-32 w-full rounded-xl overflow-hidden relative bg-gradient-to-br flex flex-col justify-end p-4 text-white mb-4 group/banner", art.fallbackGradient)}>
      <img
        src={art.image}
        alt={title ? `Ilustrasi ${title}` : 'Ilustrasi Game Edukasi'}
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover/banner:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-900/20" />
      <div className="relative z-10 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[11px] font-semibold text-white/85 tracking-wide block truncate">
            {art.badgeText}{category ? ` · ${category}` : ''}
          </span>
          {title && (
            <h4 className="text-base font-extrabold tracking-tight text-white leading-snug truncate mt-0.5">
              {title}
            </h4>
          )}
        </div>
      </div>
    </div>
  );
}

export const GAMES_LIST: GameItem[] = [
  {
    id: 'infokombat',
    title: 'Informatika Kombat',
    category: '16-Bit Fighting Action • Mortal Kombat Style',
    description: 'Game pertempuran aksi 16-bit bergaya Mortal Kombat! Pilih pejuang logika & kode, gunakan serangan Punch, Kick, Block, dan jurus Fatality spesial!',
    iconName: 'Gamepad2',
    difficulty: 'Tantangan',
    defaultTimerSec: 120
  },
  {
    id: 'contra-snes',
    title: 'Informatika War',
    category: 'SNES Run & Gun • Kuis Informatika',
    description: 'Game aksi klasik bergaya CONTRA SNES! Tembak kapsul terbang untuk menjatuhkan peluru spesial (S/L/F/M), dan jawab pertanyaan Informatika untuk membukanya!',
    iconName: 'Gamepad2',
    difficulty: 'Tantangan',
    defaultTimerSec: 120
  },
  {
    id: 'petualangan-smp',
    title: 'Petualangan Ke Sekolah',
    category: 'Permainan 2D Platformer Edukatif',
    description: 'Petualangan seru siswa SMP menuju sekolah, bumi perkemahan, museum sains, hingga Alun-Alun Ciamis lengkap dengan aksi Bos Battle!',
    iconName: 'Gamepad2',
    difficulty: 'Tantangan',
    defaultTimerSec: 90
  },
  {
    id: 'pattern-master',
    title: 'Detektif Pola Bilangan',
    category: 'Matematika / Pola Bilangan',
    description: 'Tebak suku hilang pada barisan aritmetika & geometri dengan cepat! Dapatkan combo skor tertinggi.',
    iconName: 'Calculator',
    difficulty: 'Sedang',
    defaultTimerSec: 30
  },
  {
    id: 'scratch-blocks',
    title: 'Koding Master SMP',
    category: 'Algoritma & Pemrograman',
    description: 'Bantu Robot mencapai Bintang Target! Susun balok perintah logika seefisien mungkin untuk menyelesaikan teka-teki labirin.',
    iconName: 'Code',
    difficulty: 'Sedang',
    defaultTimerSec: 120
  },
  {
    id: 'dekomposisi-puzzle',
    title: 'Dekomposisi Master',
    category: 'Berpikir Komputasional',
    description: 'Urai masalah besar menjadi sub-modul yang tepat. Kelompokkan setiap tugas ke dalam kategorinya!',
    iconName: 'Puzzle',
    difficulty: 'Sedang',
    defaultTimerSec: 45
  },
  {
    id: 'star-catcher',
    title: 'Star Catcher Arcade',
    category: 'Visual Game / Scratch',
    description: 'Kendalikan Kucing Penangkap Bintang! Tangkap bintang jatuh sebanyak mungkin sebelum nyawa habis.',
    iconName: 'Gamepad2',
    difficulty: 'Tantangan',
    defaultTimerSec: 60
  }
];

const PLAYER_POSE_PATHS = [
  '/assets/aistudio/1_1c6e6898.png',     // 0: pose depan
  '/assets/aistudio/2_c5278813.png',     // 1: berlari 1
  '/assets/aistudio/2_3_8597f138.png',   // 2: berlari 2 (baru)
  '/assets/aistudio/3_0765a0d2.png',     // 3: berlari 3
  '/assets/aistudio/4_57a699e0.png',     // 4: loncat 1
  '/assets/aistudio/5_ca307ebd.png',     // 5: loncat 2
  '/assets/aistudio/6_0e9e4f2c.png',     // 6: loncat 3
  '/assets/aistudio/7_d58d30cc.png',     // 7: pose menembak
];

const BOSS1_POSE_PATHS = [
  '/assets/aistudio/1a.png',   // 0: Idle 1a
  '/assets/aistudio/2a.png',   // 1: Idle 2a
  '/assets/aistudio/3a.png',   // 2: Move 3a
  '/assets/aistudio/4a.png',   // 3: Move 4a
  '/assets/aistudio/5a.png',   // 4: Move 5a
  '/assets/aistudio/6a.png',   // 5: Move 6a
  '/assets/aistudio/7a.png',   // 6: Shoot 7a
  '/assets/aistudio/8a.png',   // 7: Shoot 8a
  '/assets/aistudio/9a.png',   // 8: Pose tertembak 9a
  '/assets/aistudio/10a.png',  // 9: Pose bos mati 10a
  '/assets/aistudio/10.png',   // 10: Pose bos mati tak bergerak 10.png
];

const BOSS2_POSE_PATHS = [
  '/assets/aistudio/boss2_1.png',   // 0: idle 1
  '/assets/aistudio/boss2_2.png',   // 1: idle 2
  '/assets/aistudio/boss2_3.png',   // 2: jalan 1
  '/assets/aistudio/boss2_4.png',   // 3: jalan 2
  '/assets/aistudio/boss2_5.png',   // 4: jalan 3
  '/assets/aistudio/boss2_6.png',   // 5: saat akan menembak
  '/assets/aistudio/boss2_7.png',   // 6: saat menembak
  '/assets/aistudio/boss2_8.png',   // 7: pose tertembak / kalah (pusing & baterai lemah)
  '/assets/aistudio/boss2_9.png',   // 8: saat akan meloncat (jongkok)
  '/assets/aistudio/boss2_10.png',  // 9: saat meloncat (di udara)
  '/assets/aistudio/boss2_11.png',  // 10: saat mendarat (debu pendaratan)
];

type ProcessedSprite = HTMLCanvasElement | HTMLImageElement;
const PROCESSED_SPRITE_CACHE = new Map<string, ProcessedSprite>();
const SPRITE_LOAD_PROMISES = new Map<string, Promise<ProcessedSprite | null>>();

const IS_LITTLE_ENDIAN = (() => {
  if (typeof Uint32Array === 'undefined') return true;
  const buf = new ArrayBuffer(4);
  new Uint32Array(buf)[0] = 0x0a0b0c0d;
  return new Uint8Array(buf)[0] === 0x0d;
})();

function loadProcessedSprite(
  path: string,
  maxHeight: number,
  highPriority = false
): Promise<ProcessedSprite | null> {
  const cached = PROCESSED_SPRITE_CACHE.get(path);
  if (cached) return Promise.resolve(cached);

  const existingPromise = SPRITE_LOAD_PROMISES.get(path);
  if (existingPromise) return existingPromise;

  const promise = new Promise<ProcessedSprite | null>((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    if (highPriority && 'fetchPriority' in img) {
      (img as any).fetchPriority = 'high';
    }
    img.crossOrigin = 'anonymous';

    const finalize = async () => {
      try {
        if (typeof img.decode === 'function') {
          await img.decode().catch(() => {});
        }
        const natW = img.naturalWidth || 400;
        const natH = img.naturalHeight || 400;
        const scale = natH > maxHeight ? maxHeight / natH : 1;
        const targetW = Math.max(1, Math.round(natW * scale));
        const targetH = Math.max(1, Math.round(natH * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, targetW, targetH);
          const imgData = ctx.getImageData(0, 0, targetW, targetH);

          if (IS_LITTLE_ENDIAN && typeof Uint32Array !== 'undefined') {
            const buf32 = new Uint32Array(imgData.data.buffer);
            for (let i = 0; i < buf32.length; i++) {
              const px = buf32[i];
              if ((px & 0xff) > 220 && ((px >> 8) & 0xff) > 220 && ((px >> 16) & 0xff) > 220) {
                buf32[i] = 0;
              }
            }
          } else {
            const data = imgData.data;
            for (let i = 0; i < data.length; i += 4) {
              if (data[i] > 220 && data[i + 1] > 220 && data[i + 2] > 220) {
                data[i + 3] = 0;
              }
            }
          }

          ctx.putImageData(imgData, 0, 0);
          PROCESSED_SPRITE_CACHE.set(path, canvas);
          resolve(canvas);
        } else {
          PROCESSED_SPRITE_CACHE.set(path, img);
          resolve(img);
        }
      } catch {
        PROCESSED_SPRITE_CACHE.set(path, img);
        resolve(img);
      } finally {
        SPRITE_LOAD_PROMISES.delete(path);
      }
    };

    img.onload = () => {
      void finalize();
    };
    img.onerror = () => {
      SPRITE_LOAD_PROMISES.delete(path);
      resolve(null);
    };
    img.src = path;
  });

  SPRITE_LOAD_PROMISES.set(path, promise);
  return promise;
}

interface AdminGamesProps {
  isAdmin: boolean;
  currentStudent?: { id: string; nama: string; kelas: string; nis: string } | null;
  studentsList?: { id: string; nis: string; nama: string; kelas: string }[];
}

export default function AdminGames({ isAdmin, currentStudent, studentsList = [] }: AdminGamesProps) {
  const [activeTab, setActiveTab] = useState<'manage' | 'leaderboard' | 'play'>('manage');
  const [selectedGameId, setSelectedGameId] = useState<string>(GAMES_LIST[0].id);
  const [gameConfigs, setGameConfigs] = useState<Record<string, { isActive: boolean; timerSec?: number; materiId?: string; stage1MateriId?: string; stage2MateriId?: string; stage3MateriId?: string; stage4MateriId?: string }>>({});
  const [gameScores, setGameScores] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('all');
  const [filterGame, setFilterGame] = useState('all');
  const [filterStage, setFilterStage] = useState('all');

  // Drag and Drop state for game cards
  const [orderedGames, setOrderedGames] = useState<GameItem[]>(() => {
    try {
      const saved = localStorage.getItem('ruang_info_games_order_v5');
      if (saved) {
        const parsedIds: string[] = JSON.parse(saved);
        let list = parsedIds
          .map(id => GAMES_LIST.find(g => g.id === id))
          .filter((g): g is GameItem => Boolean(g));
        GAMES_LIST.forEach(g => {
          if (!list.find(o => o.id === g.id)) list.push(g);
        });
        return list;
      }
    } catch (e) {
      console.error(e);
    }
    return GAMES_LIST;
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isAdmin) return;
    e.dataTransfer.setData('text/plain', index.toString());
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!isAdmin) return;
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!isAdmin) return;
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(fromIndex) && fromIndex !== dropIndex) {
      const updated = [...orderedGames];
      const [movedItem] = updated.splice(fromIndex, 1);
      updated.splice(dropIndex, 0, movedItem);
      setOrderedGames(updated);
      try {
        localStorage.setItem('ruang_info_games_order_v5', JSON.stringify(updated.map(g => g.id)));
      } catch (err) {}
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveGame = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= orderedGames.length) return;
    const updated = [...orderedGames];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setOrderedGames(updated);
    try {
      localStorage.setItem('ruang_info_games_order_v5', JSON.stringify(updated.map(g => g.id)));
    } catch (err) {}
  };

  // Preview Modal / Active Game State
  const [activePlayGameId, setActivePlayGameId] = useState<string | null>(null);

  const handleLaunchGame = (gameId: string) => {
    if (detectMobileDevice()) {
      void lockMobileLandscape(document.documentElement);
    }
    setActivePlayGameId(gameId);
  };

  // Firestore Subscriptions
  useEffect(() => {
    const unsubConfigs = onSnapshot(collection(db, 'game_configs'), (snapshot) => {
      const configs: any = {};
      snapshot.docs.forEach(doc => {
        configs[doc.id] = doc.data();
      });
      setGameConfigs(configs);
    }, (error) => {
      console.error('Failed subscribing to game_configs:', error);
    });

    const unsubScores = onSnapshot(collection(db, 'game_scores'), (snapshot) => {
      const scores = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setGameScores(scores);
    }, (error) => {
      console.error('Failed subscribing to game_scores:', error);
    });

    return () => {
      unsubConfigs();
      unsubScores();
    };
  }, []);

  // Preload & process 8 main character poses in background idle time so game starts instantly
  useEffect(() => {
    let cancelled = false;
    const warmUpPlayerSprites = () => {
      if (cancelled) return;
      PLAYER_POSE_PATHS.forEach((path) => {
        if (!PROCESSED_SPRITE_CACHE.has(path)) {
          void loadProcessedSprite(path, 200, false);
        }
      });
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const idleId = (window as any).requestIdleCallback(warmUpPlayerSprites, { timeout: 1200 });
      return () => {
        cancelled = true;
        (window as any).cancelIdleCallback?.(idleId);
      };
    }

    const timer = setTimeout(warmUpPlayerSprites, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const updateStageMateri = async (stageKey: string, materiId: string) => {
    try {
      await setDoc(doc(db, 'game_configs', 'petualangan-smp'), {
        [stageKey]: materiId,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error("Failed updating stage materi config", e);
    }
  };

  const updateContraMateri = async (materiId: string) => {
    try {
      await setDoc(doc(db, 'game_configs', 'contra-snes'), {
        materiId,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error("Failed updating contra materi config", e);
    }
  };

  const toggleGameStatus = async (gameId: string) => {
    const currentActive = gameConfigs[gameId]?.isActive ?? true;
    try {
      await setDoc(doc(db, 'game_configs', gameId), {
        isActive: !currentActive,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error("Failed to toggle game status", e);
    }
  };

  const handleClearScore = async (scoreId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus catatan skor ini?")) {
      try {
        await deleteDoc(doc(db, 'game_scores', scoreId));
      } catch (e) {
        console.error("Failed to delete score", e);
      }
    }
  };

  // Deduplicate so each student has ONLY their highest score per unique game/stage
  const bestScoresAll = dedupeHighestGameScores(gameScores, !isAdmin);

  // Filtered leaderboard - only show the best score per student per unique game/stage
  const filteredScores = bestScoresAll.filter(score => {
    const scoreKelas = score.studentKelas || score.kelas || '';
    const matchSearch = score.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        score.studentNis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        score.gameTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKelas = filterKelas === 'all' || scoreKelas === filterKelas;
    const matchGame = filterGame === 'all' || score.gameId === filterGame;

    // Stage Filter for Petualangan SMP & Cyber Contra SNES
    let matchStage = true;
    if ((filterGame === 'petualangan-smp' || filterGame === 'contra-snes') && filterStage !== 'all') {
      matchStage = new RegExp(`Stage\\s*${filterStage}\\b`, 'i').test(score.gameTitle || '');
    }

    return matchSearch && matchKelas && matchGame && matchStage;
  });

  // Highest score per stage (1-4) for current student on Petualangan SMP
  const currentStudentStageHighScores: Record<number, number> = (() => {
    const map: Record<number, number> = {};
    if (!currentStudent) return map;
    bestScoresAll.forEach(s => {
      if (s.gameId !== 'petualangan-smp') return;
      const isMe = (s.studentId && s.studentId === currentStudent.id) ||
                   (!s.studentId && s.studentName === currentStudent.nama);
      if (!isMe) return;
      const m = typeof s.gameTitle === 'string' ? s.gameTitle.match(/Stage\s*(\d+)/i) : null;
      if (m) {
        const st = Number(m[1]);
        map[st] = Math.max(map[st] || 0, s.score || 0);
      }
    });
    return map;
  })();

  // Highest score per stage (1-3) for current student on Cyber Contra SNES
  const currentStudentContraHighScores: Record<number, number> = (() => {
    const map: Record<number, number> = {};
    if (!currentStudent) return map;
    bestScoresAll.forEach(s => {
      if (s.gameId !== 'contra-snes') return;
      const isMe = (s.studentId && s.studentId === currentStudent.id) ||
                   (!s.studentId && s.studentName === currentStudent.nama);
      if (!isMe) return;
      const m = typeof s.gameTitle === 'string' ? s.gameTitle.match(/Stage\s*(\d+)/i) : null;
      if (m) {
        const st = Number(m[1]);
        map[st] = Math.max(map[st] || 0, s.score || 0);
      }
    });
    return map;
  })();

  // Extract unique classes
  const uniqueClasses = Array.from(new Set(studentsList.map(s => s.kelas).concat(gameScores.map(s => s.studentKelas || s.kelas)))).filter(Boolean).sort();

  return (
    <div className={cn("font-sans", isAdmin ? "space-y-4" : "space-y-6")}>
      {/* Top Header */}
      {isAdmin ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-brand text-white rounded-lg flex items-center justify-center shrink-0">
              <Gamepad2 size={17} />
            </div>
            <div className="flex items-baseline gap-2 min-w-0">
              <h2 className="text-sm md:text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                Daftar Game Edukasi
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold whitespace-nowrap tabular-nums">
                · {GAMES_LIST.length} Game
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl border border-slate-300/80 dark:border-slate-700 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('manage')}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap",
                activeTab === 'manage'
                  ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <Settings size={13} />
              Daftar Game
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap tabular-nums",
                activeTab === 'leaderboard'
                  ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <Trophy size={13} className="text-amber-500" />
              Papan Skor ({bestScoresAll.length})
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0">
              <Gamepad2 size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Permainan Edukatif</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{orderedGames.filter(g => gameConfigs[g.id]?.isActive ?? true).length} Game Tersedia</span>
              </div>
              <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                Arena Game Informatika
              </h2>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('manage')}
              className={cn(
                "px-3.5 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                activeTab === 'manage' 
                  ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <Gamepad2 size={14} />
              Daftar Game
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={cn(
                "px-3.5 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap tabular-nums cursor-pointer",
                activeTab === 'leaderboard' 
                  ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <Trophy size={14} className="text-amber-500" />
              Papan Skor ({bestScoresAll.length})
            </button>
          </div>
        </div>
      )}

      {/* Main Tab 1: Manage / List Games */}
      {activeTab === 'manage' && (
        <div className="space-y-3">
          {isAdmin && (
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 px-1">
              <GripVertical size={13} className="text-slate-400 shrink-0" />
              <span>Seret kartu atau gunakan tombol panah untuk mengatur urutan tampil ke siswa (tersimpan otomatis).</span>
            </p>
          )}

          <div className={cn(
            "grid gap-4",
            isAdmin ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          )}>
            {orderedGames
              .filter(game => isAdmin || (gameConfigs[game.id]?.isActive ?? true))
              .map((game, idx) => {
                const isGameActive = gameConfigs[game.id]?.isActive ?? true;
                const gameHighScore = gameScores
                  .filter(s => s.gameId === game.id)
                  .reduce((max, s) => Math.max(max, s.score || 0), 0);

                const myStudentHighScore = currentStudent
                  ? gameScores
                      .filter(s => s.gameId === game.id && (s.studentId === currentStudent.id || s.studentName === currentStudent.nama))
                      .reduce((max, s) => Math.max(max, s.score || 0), 0)
                  : 0;

                const isDragging = draggedIndex === idx;
                const isDragOver = dragOverIndex === idx;
                const art = GAME_ART_MAP[game.id] || {
                  image: starCatcherBg,
                  fallbackGradient: 'from-slate-800 to-slate-950',
                  accentClass: 'bg-brand',
                  badgeText: 'Game Edukasi'
                };

                if (isAdmin) {
                  return (
                    <div
                      key={game.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "group relative overflow-hidden p-4 rounded-2xl transition-all duration-200 flex flex-col justify-between gap-3 text-white shadow-sm hover:shadow-md border border-slate-800/40 bg-gradient-to-br",
                        art.fallbackGradient,
                        !isGameActive && "opacity-90",
                        isDragging && "opacity-40 scale-95 border-dashed border-amber-300",
                        isDragOver && "ring-3 ring-amber-300 scale-[1.01]"
                      )}
                    >
                      {/* Thematic AI Background Artwork */}
                      <img
                        src={art.image}
                        alt={`Tema latar ${game.title}`}
                        referrerPolicy="no-referrer"
                        className={cn(
                          "absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
                          !isGameActive && "grayscale opacity-55"
                        )}
                      />
                      {/* Measured Dark Scrim for WCAG AA Contrast */}
                      <div
                        className={cn(
                          "absolute inset-0 transition-opacity",
                          isGameActive
                            ? "bg-gradient-to-t from-slate-950/92 via-slate-950/75 to-slate-900/55"
                            : "bg-slate-950/80"
                        )}
                      />

                      <div className="relative z-10 space-y-2.5">
                        {/* Baris Judul Bersih */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="p-1 text-white/75 hover:text-white hover:bg-white/15 rounded-md cursor-grab active:cursor-grabbing shrink-0 transition-colors"
                              title="Seret untuk ubah urutan"
                            >
                              <GripVertical size={15} />
                            </div>
                            <div className={cn("w-9 h-9 rounded-xl border border-white/25 flex items-center justify-center text-white shrink-0 shadow-xs", art.accentClass)}>
                              {game.iconName === 'Calculator' && <Calculator size={17} />}
                              {game.iconName === 'Code' && <Code size={17} />}
                              {game.iconName === 'Puzzle' && <Puzzle size={17} />}
                              {game.iconName === 'Gamepad2' && <Gamepad2 size={17} />}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-extrabold text-white leading-tight truncate drop-shadow-2xs">
                                {game.title}
                              </h3>
                              <p className="text-[11px] font-medium text-white/85 truncate tabular-nums mt-0.5">
                                #{idx + 1} · {game.category} · Skor {gameHighScore} pts
                              </p>
                            </div>
                          </div>

                          <span
                            className={cn(
                              "text-[10px] font-bold shrink-0 px-2 py-0.5 rounded-md flex items-center gap-1 whitespace-nowrap backdrop-blur-xs",
                              isGameActive
                                ? "bg-emerald-500/85 text-white border border-emerald-300/40"
                                : "bg-slate-800/85 text-slate-200 border border-white/20"
                            )}
                          >
                            {isGameActive ? <Check size={10} /> : <X size={10} />}
                            {isGameActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>

                        <p className="text-xs text-white/90 line-clamp-1 leading-snug drop-shadow-2xs">
                          {game.description}
                        </p>

                        {game.id === 'contra-snes' && (
                          <details className="group/det bg-slate-950/65 backdrop-blur-xs rounded-xl border border-white/20 overflow-hidden">
                            <summary className="cursor-pointer list-none px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-white select-none">
                              <span>Sumber Kuis Peluru Spesial</span>
                              <ChevronDown size={13} className="text-white/80 group-open/det:rotate-180 transition-transform" />
                            </summary>
                            <div className="p-2 pt-1.5 border-t border-white/15">
                              <select
                                value={gameConfigs['contra-snes']?.materiId ?? 'all'}
                                onChange={(e) => updateContraMateri(e.target.value)}
                                className="bg-white border border-slate-200 text-[11px] font-semibold rounded-lg p-1.5 text-slate-900 cursor-pointer w-full"
                              >
                                <option value="all">Semua Materi Informatika (Campuran)</option>
                                {COURSES.map(c => (
                                  <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                              </select>
                            </div>
                          </details>
                        )}

                        {game.id === 'petualangan-smp' && (
                          <details className="group/det bg-slate-950/65 backdrop-blur-xs rounded-xl border border-white/20 overflow-hidden">
                            <summary className="cursor-pointer list-none px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-white select-none">
                              <span>Atur Materi 4 Stage</span>
                              <ChevronDown size={13} className="text-white/80 group-open/det:rotate-180 transition-transform" />
                            </summary>
                            <div className="p-2 pt-1.5 border-t border-white/15 grid grid-cols-2 gap-1.5 text-[10px]">
                              <div>
                                <span className="font-bold text-white/90 block mb-0.5">Stage 1: Sekolah</span>
                                <select
                                  value={gameConfigs['petualangan-smp']?.stage1MateriId ?? 'bk-dekomposisi'}
                                  onChange={(e) => updateStageMateri('stage1MateriId', e.target.value)}
                                  className="bg-white border border-slate-200 text-[10px] font-semibold rounded-md p-1 text-slate-900 w-full"
                                >
                                  {COURSES.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <span className="font-bold text-white/90 block mb-0.5">Stage 2: Pramuka</span>
                                <select
                                  value={gameConfigs['petualangan-smp']?.stage2MateriId ?? 'bk-pengenalan-pola'}
                                  onChange={(e) => updateStageMateri('stage2MateriId', e.target.value)}
                                  className="bg-white border border-slate-200 text-[10px] font-semibold rounded-md p-1 text-slate-900 w-full"
                                >
                                  {COURSES.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <span className="font-bold text-white/90 block mb-0.5">Stage 3: Study Tour</span>
                                <select
                                  value={gameConfigs['petualangan-smp']?.stage3MateriId ?? 'scratch'}
                                  onChange={(e) => updateStageMateri('stage3MateriId', e.target.value)}
                                  className="bg-white border border-slate-200 text-[10px] font-semibold rounded-md p-1 text-slate-900 w-full"
                                >
                                  {COURSES.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <span className="font-bold text-white/90 block mb-0.5">Stage 4: Ciamis</span>
                                <select
                                  value={gameConfigs['petualangan-smp']?.stage4MateriId ?? 'bk-algoritma'}
                                  onChange={(e) => updateStageMateri('stage4MateriId', e.target.value)}
                                  className="bg-white border border-slate-200 text-[10px] font-semibold rounded-md p-1 text-slate-900 w-full"
                                >
                                  {COURSES.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </details>
                        )}
                      </div>

                      {/* Bottom Actions */}
                      <div className="relative z-10 flex items-center justify-between gap-1.5 pt-2.5 border-t border-white/20">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleGameStatus(game.id)}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer",
                              isGameActive
                                ? "bg-slate-950/65 hover:bg-slate-950/85 text-white border border-white/25"
                                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-2xs"
                            )}
                          >
                            {isGameActive ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>

                          <div className="flex items-center gap-0.5 bg-slate-950/65 rounded-lg p-0.5 border border-white/20">
                            <button
                              onClick={() => moveGame(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 hover:bg-white/20 rounded text-white disabled:opacity-35 transition-colors cursor-pointer"
                              title="Naikkan Urutan"
                            >
                              <MoveUp size={12} />
                            </button>
                            <button
                              onClick={() => moveGame(idx, 'down')}
                              disabled={idx === orderedGames.length - 1}
                              className="p-1 hover:bg-white/20 rounded text-white disabled:opacity-35 transition-colors cursor-pointer"
                              title="Turunkan Urutan"
                            >
                              <MoveDown size={12} />
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => handleLaunchGame(game.id)}
                          className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-[11px] font-extrabold transition-colors flex items-center gap-1 whitespace-nowrap shadow-xs active:scale-95 cursor-pointer"
                        >
                          <Play size={12} /> Pratinjau
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div 
                    key={game.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <GameCardBanner gameId={game.id} title={game.title} category={game.category} />

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3.5 line-clamp-2">
                        {game.description}
                      </p>

                      {/* Clean unboxed metadata row */}
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3 tabular-nums">
                        <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
                          <Flame size={13} className="text-amber-500" />
                          {game.difficulty}
                        </span>
                        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                        <span className={cn("inline-flex items-center gap-1 font-bold", myStudentHighScore > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400")}>
                          <Trophy size={13} className={myStudentHighScore > 0 ? "text-amber-500" : "text-slate-400 dark:text-slate-500"} />
                          {myStudentHighScore > 0 ? `Skor Terbaik: ${myStudentHighScore}` : 'Belum Ada Skor'}
                        </span>
                        {game.id === 'petualangan-smp' && (
                          <>
                            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                            <span className="text-blue-700 dark:text-blue-400">4 Stage</span>
                          </>
                        )}
                        {game.id === 'contra-snes' && (
                          <>
                            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                            <span className="text-orange-700 dark:text-orange-400">3 Stage</span>
                          </>
                        )}
                      </div>

                      {game.id === 'contra-snes' && Object.keys(currentStudentContraHighScores).length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-3 tabular-nums">
                          {[1, 2, 3].map(st => {
                            const stScore = currentStudentContraHighScores[st];
                            if (!stScore) return null;
                            return (
                              <span key={st} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-700 dark:text-slate-200">
                                Stage {st}: {stScore}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {game.id === 'petualangan-smp' && Object.keys(currentStudentStageHighScores).length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-3 tabular-nums">
                          {[1, 2, 3, 4].map(st => {
                            const stScore = currentStudentStageHighScores[st];
                            if (!stScore) return null;
                            return (
                              <span key={st} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-700 dark:text-slate-200">
                                Stage {st}: {stScore}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 tabular-nums">
                        Rekor Tertinggi: {gameHighScore > 0 ? `${gameHighScore} pts` : '-'}
                      </span>
                      <button
                        onClick={() => handleLaunchGame(game.id)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
                      >
                        <Play size={13} /> Mainkan
                      </button>
                    </div>
                  </div>
                );
            })}
          </div>
        </div>
      )}

      {/* Main Tab 2: Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="admin-glass-card rounded-2xl p-5 md:p-6 space-y-5">
          {/* Controls Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Trophy className="text-amber-500" size={20} /> Papan Skor & Peringkat Siswa
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Menampilkan 1 skor tertinggi setiap siswa per stage permainan.
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
              {/* Search input */}
              <div className="relative flex-1 md:w-56 min-w-[160px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari siswa / kelas..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />
              </div>

              {/* Class Filter */}
              <select
                value={filterKelas}
                onChange={e => setFilterKelas(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-xl px-3 py-2 cursor-pointer"
              >
                <option value="all">Semua Kelas</option>
                {uniqueClasses.map(k => (
                  <option key={k} value={k}>Kelas {k}</option>
                ))}
              </select>

              {/* Game Filter */}
              <select
                value={filterGame}
                onChange={e => {
                  setFilterGame(e.target.value);
                  setFilterStage('all');
                }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-xl px-3 py-2 cursor-pointer"
              >
                <option value="all">Semua Game</option>
                {GAMES_LIST.map(g => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>

              {/* Stage Filter (Dynamic) */}
              {(filterGame === 'petualangan-smp' || filterGame === 'contra-snes') && (
                <select
                  value={filterStage}
                  onChange={e => setFilterStage(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-xl px-3 py-2 cursor-pointer"
                >
                  <option value="all">Semua Stage</option>
                  <option value="1">Stage 1</option>
                  <option value="2">Stage 2</option>
                  <option value="3">Stage 3</option>
                  {filterGame === 'petualangan-smp' && <option value="4">Stage 4</option>}
                </select>
              )}
            </div>
          </div>

          {/* Scores Table */}
          {filteredScores.length > 0 ? (
            <div className="overflow-x-auto rounded-xl admin-glass-card">
              <table className="w-full text-left border-collapse text-xs md:text-sm tabular-nums">
                <thead>
                  <tr className="bg-white/25 dark:bg-white/5 border-b border-white/40 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <th className="px-4 py-3 text-center w-12">#</th>
                    <th className="px-4 py-3">Siswa</th>
                    <th className="px-4 py-3">Kelas</th>
                    <th className="px-4 py-3">Nama Permainan</th>
                    <th className="px-4 py-3 text-center">Skor</th>
                    <th className="px-4 py-3 text-center">Waktu Main</th>
                    <th className="px-4 py-3">Tanggal</th>
                    {isAdmin && <th className="px-4 py-3 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                  {filteredScores.map((score, idx) => {
                    const isTop1 = idx === 0;
                    const isTop2 = idx === 1;
                    const isTop3 = idx === 2;

                    return (
                      <tr key={score.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 text-center font-black">
                          {isTop1 ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black">1</span> :
                           isTop2 ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-black">2</span> :
                           isTop3 ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-black">3</span> :
                           idx + 1}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                          {score.studentName || 'Siswa'}
                          {score.studentNis && <span className="block text-[11px] font-mono font-normal text-slate-500 dark:text-slate-400">NISN: {score.studentNis}</span>}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                          {score.studentKelas || score.kelas || '-'}
                        </td>
                        <td className="px-4 py-3 font-semibold text-indigo-700 dark:text-indigo-400">
                          {score.gameTitle || 'Game'}
                        </td>
                        <td className="px-4 py-3 text-center font-extrabold text-emerald-700 dark:text-emerald-400 text-base font-mono">
                          {score.score || 0}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-slate-600 dark:text-slate-400">
                          {score.durationSec ? `${score.durationSec}s` : '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                          {formatScoreTimestamp(score)}
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleClearScore(score.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg transition-colors"
                              title="Hapus Skor"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center admin-glass-card border-dashed rounded-2xl">
              <Gamepad2 size={36} className="mx-auto text-slate-400 dark:text-slate-500 mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1">Belum Ada Catatan Skor Permainan</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Siswa yang menyelesaikan tantangan game edukasi akan muncul di papan skor ini secara otomatis.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Interactive Game Play Modal */}
      {activePlayGameId && (
        <InteractiveGameModal 
          gameId={activePlayGameId}
          isAdmin={isAdmin}
          currentStudent={currentStudent}
          studentStageHighScores={currentStudentStageHighScores}
          contraStageHighScores={currentStudentContraHighScores}
          onClose={() => setActivePlayGameId(null)}
        />
      )}
    </div>
  );
}

/* =========================================================================
   Interactive Play Modal containing the Playable Educational Games
   ========================================================================= */

interface InteractiveGameModalProps {
  gameId: string;
  isAdmin: boolean;
  currentStudent?: { id: string; nama: string; kelas: string; nis: string } | null;
  studentStageHighScores?: Record<number, number>;
  contraStageHighScores?: Record<number, number>;
  onClose: () => void;
}

function InteractiveGameModal({ gameId, isAdmin, currentStudent, studentStageHighScores, contraStageHighScores, onClose }: InteractiveGameModalProps) {
  const currentGame = GAMES_LIST.find(g => g.id === gameId) || GAMES_LIST[0];
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [isMobile] = useState<boolean>(() => detectMobileDevice());
  const [viewport, setViewport] = useState<{ width: number; height: number }>(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  }));
  const modalContainerRef = useRef<HTMLDivElement | null>(null);

  const isPortrait = viewport.height > viewport.width;
  const isCssLandscape = isMobile && isPortrait;

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      const target = modalContainerRef.current || document.documentElement;
      if (target?.requestFullscreen) {
        target.requestFullscreen().then(() => {
          if (isMobile) {
            void lockMobileLandscape(target);
          }
        }).catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      unlockMobileOrientation();
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const syncViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    syncViewport();
    window.addEventListener('resize', syncViewport);
    window.addEventListener('orientationchange', syncViewport);

    // Attempt auto-fullscreen & landscape lock on mount for mobile
    if (isMobile) {
      void lockMobileLandscape(modalContainerRef.current || document.documentElement);
    } else if (modalContainerRef.current && !document.fullscreenElement) {
      modalContainerRef.current.requestFullscreen().catch(() => {});
    }

    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (active && isMobile) {
        const orientation = screen.orientation as ScreenOrientation & { lock?: (mode: string) => Promise<void> };
        orientation?.lock?.('landscape').catch(() => {});
      }
      syncViewport();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('resize', syncViewport);
      window.removeEventListener('orientationchange', syncViewport);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      unlockMobileOrientation();
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [isMobile]);

  const handleCloseModal = () => {
    unlockMobileOrientation();
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    onClose();
  };

  return (
    <div 
      ref={modalContainerRef}
      style={
        isCssLandscape
          ? {
              position: 'fixed',
              top: 0,
              left: `${viewport.width}px`,
              width: `${viewport.height}px`,
              height: `${viewport.width}px`,
              transform: 'rotate(90deg)',
              transformOrigin: 'top left',
            }
          : undefined
      }
      className={cn(
        "fixed bg-slate-950 z-[9999] flex flex-col overflow-hidden select-none",
        !isCssLandscape && "inset-0 w-screen h-[100dvh]"
      )}
    >
      {/* Modal Fullscreen Header */}
      <div
        className={cn(
          "bg-slate-900/95 backdrop-blur-md text-white flex items-center justify-between border-b border-slate-800 shrink-0 shadow-lg",
          isMobile || gameId === 'infokombat' ? "px-3 md:px-5 py-1.5" : "px-6 py-2.5"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn(
            "rounded-xl bg-brand flex items-center justify-center text-white font-bold shadow-md shadow-brand/20 shrink-0",
            isMobile ? "w-7 h-7" : "w-8 h-8"
          )}>
            <Gamepad2 size={isMobile ? 15 : 18} />
          </div>
          <div className="min-w-0">
            {!isMobile && (
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                {isAdmin ? "Mode Pratinjau Fullscreen" : "Game Edukasi Layar Penuh"}
              </span>
            )}
            <h3 className={cn("font-black text-white leading-tight truncate", isMobile ? "text-xs sm:text-sm" : "text-sm md:text-base")}>
              {currentGame.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isMobile && (
            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md inline-block">
              Landscape
            </span>
          )}
          <button
            onClick={toggleBrowserFullscreen}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors shadow-xs"
            title={isFullscreen ? "Keluar Layar Penuh" : "Masuk Layar Penuh"}
          >
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            <span className="hidden sm:inline">{isFullscreen ? "Kecilkan" : "Layar Penuh"}</span>
          </button>
          
          <button
            onClick={handleCloseModal}
            className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <X size={14} />
            <span className="hidden sm:inline">Tutup Game</span>
          </button>
        </div>
      </div>

      {/* Modal Body: Full Viewport Game Area */}
      <div
        className={cn(
          "flex-1 w-full min-h-0 bg-slate-950 flex flex-col",
          gameId === 'infokombat'
            ? "p-0 overflow-hidden"
            : gameId === 'contra-snes' || gameId === 'petualangan-smp' || gameId === 'star-catcher'
            ? "p-1.5 sm:p-3 overflow-hidden items-center"
            : isMobile
            ? "p-2 overflow-y-auto items-center custom-scrollbar"
            : "p-2 md:p-6 overflow-y-auto items-center custom-scrollbar"
        )}
      >
        <div className={cn("w-full h-full min-h-0 flex flex-col", gameId === 'infokombat' ? "" : "my-auto")}>
          {gameId === 'pattern-master' && (
            <PatternMasterGame isAdmin={isAdmin} currentStudent={currentStudent} onClose={onClose} />
          )}
          {gameId === 'scratch-blocks' && (
            <ScratchBlocksGame isAdmin={isAdmin} currentStudent={currentStudent} onClose={onClose} />
          )}
          {gameId === 'dekomposisi-puzzle' && (
            <DekomposisiPuzzleGame isAdmin={isAdmin} currentStudent={currentStudent} onClose={onClose} />
          )}
          {gameId === 'star-catcher' && (
            <StarCatcherArcadeGame isAdmin={isAdmin} currentStudent={currentStudent} onClose={onClose} />
          )}
          {gameId === 'petualangan-smp' && (
            <PetualanganSMPGame isAdmin={isAdmin} currentStudent={currentStudent} studentStageHighScores={studentStageHighScores} onClose={onClose} />
          )}
          {gameId === 'contra-snes' && (
            <ContraSnesGame isAdmin={isAdmin} currentStudent={currentStudent} studentStageHighScores={contraStageHighScores} onClose={onClose} />
          )}
          {gameId === 'infokombat' && (
            <FightingGame isAdmin={isAdmin} currentStudent={currentStudent} onExit={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Game 1: Detektif Pola Bilangan (Pattern Master)
   ------------------------------------------------------------------------- */
function PatternMasterGame({ isAdmin, currentStudent, onClose }: { isAdmin: boolean; currentStudent: any; onClose: () => void }) {
  const questions = [
    {
      seq: [3, 7, 11, '?', 19],
      options: ['13', '15', '16', '14'],
      correctIdx: 1,
      explanation: 'Pola Aritmetika bertambah +4 secara tetap: 11 + 4 = 15.'
    },
    {
      seq: [2, 6, 18, '?', 162],
      options: ['36', '48', '54', '72'],
      correctIdx: 2,
      explanation: 'Pola Geometri dikali 3 (rasio r = 3): 18 × 3 = 54.'
    },
    {
      seq: [5, 10, 20, 40, '?'],
      options: ['60', '80', '100', '75'],
      correctIdx: 1,
      explanation: 'Pola Geometri dikali 2 (rasio r = 2): 40 × 2 = 80.'
    },
    {
      seq: [7, 12, 17, 22, '?'],
      options: ['27', '29', '25', '32'],
      correctIdx: 0,
      explanation: 'Pola Aritmetika bertambah +5 secara tetap: 22 + 5 = 27.'
    }
  ];

  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const q = questions[currentQIdx];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
    setIsAnswered(true);
    if (idx === q.correctIdx) {
      setScore(s => s + 25);
    }
  };

  const handleNext = () => {
    if (currentQIdx < questions.length - 1) {
      setCurrentQIdx(c => c + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      setIsGameOver(true);
      saveScore(score);
    }
  };

  const saveScore = async (finalScore: number) => {
    if ((!currentStudent && !isAdmin) || finalScore <= 0) return;
    const studentId = currentStudent?.id || 'admin-preview';
    try {
      const existingSnap = await getDocs(
        query(
          collection(db, 'game_scores'),
          where('studentId', '==', studentId),
          where('gameId', '==', 'pattern-master')
        )
      );
      let prevBest = 0;
      existingSnap.docs.forEach(d => {
        const val = Number(d.data()?.score || 0);
        if (val > prevBest) prevBest = val;
      });
      if (finalScore > prevBest) {
        const nowIso = new Date().toISOString();
        const studentKelas = currentStudent?.kelas || 'Admin';
        await setDoc(doc(db, 'game_scores', `${studentId}__pattern-master`), {
          gameId: 'pattern-master',
          gameTitle: 'Detektif Pola Bilangan',
          studentId,
          studentName: currentStudent?.nama || 'Admin Pratinjau',
          studentNis: currentStudent?.nis || '-',
          studentKelas,
          kelas: studentKelas,
          score: finalScore,
          playedAt: nowIso,
          timestamp: nowIso
        });
      }
    } catch (e) {
      console.error("Failed saving score", e);
    }
  };

  return (
    <div className="space-y-6 text-center">
      {!isGameOver ? (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between bg-slate-200 p-4 rounded-2xl border border-slate-300">
            <span className="text-xs font-bold text-slate-600">Soal {currentQIdx + 1} dari {questions.length}</span>
            <span className="text-sm font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-xl">
              Skor: {score}
            </span>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Tebak Angka Berkelanjutan</span>
            <div className="flex items-center justify-center gap-3 text-xl md:text-3xl font-black font-mono">
              {q.seq.map((item, i) => (
                <span key={i} className={cn("px-3 py-2 rounded-xl", item === '?' ? "bg-amber-400 text-amber-950 animate-bounce" : "bg-white/10 text-white")}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {q.options.map((opt, idx) => {
              const isSelected = selectedOpt === idx;
              const isCorrect = idx === q.correctIdx;

              let btnStyle = "bg-white text-slate-900 border-slate-300 hover:bg-slate-200";
              if (isAnswered) {
                if (isCorrect) btnStyle = "bg-emerald-600 text-white border-emerald-700";
                else if (isSelected) btnStyle = "bg-red-600 text-white border-red-700";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={cn("p-4 md:p-6 rounded-2xl border-2 font-black text-xl transition-all shadow-sm active:scale-95", btnStyle)}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-left text-xs font-semibold text-slate-700">
                💡 <span className="font-bold text-slate-900">Penjelasan:</span> {q.explanation}
              </div>
              <button
                onClick={handleNext}
                className="w-full py-4 bg-brand text-white rounded-2xl font-black text-base shadow-lg shadow-brand/20 hover:scale-[1.01] active:scale-95 transition-all"
              >
                {currentQIdx < questions.length - 1 ? "Soal Berikutnya ➔" : "Lihat Hasil Akhir 🎉"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-md mx-auto p-8 bg-white rounded-[2rem] border border-slate-300 text-center space-y-4 shadow-xl">
          <Trophy size={56} className="mx-auto text-amber-500 animate-bounce" />
          <h3 className="text-2xl font-black text-slate-900">Permainan Selesai!</h3>
          <p className="text-sm font-bold text-slate-600">Skor Akhir Kamu:</p>
          <div className="text-5xl font-black text-emerald-600">{score} / 100</div>
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md"
          >
            Tutup Permainan
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
   Game 2: Scratch Block Builder
   ------------------------------------------------------------------------- */
function ScratchBlocksGame({ isAdmin, currentStudent, onClose }: { isAdmin: boolean; currentStudent: any; onClose: () => void }) {
  const [level, setLevel] = useState(1);
  const [workspace, setWorkspace] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [robotPos, setRobotPos] = useState({ x: 0, y: 0, dir: 0 }); // dir: 0=E, 1=S, 2=W, 3=N
  const [msg, setStepMsg] = useState('Pindahkan Robot ke Bintang dengan susunan balok!');
  const [isWon, setIsWon] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const levels = [
    { grid: [[0, 0, 0], [1, 1, 0], [2, 0, 0]], start: { x: 0, y: 0 }, goal: { x: 0, y: 2 } }, // 0=path, 1=wall, 2=goal
    { grid: [[0, 0, 1], [1, 0, 0], [1, 1, 2]], start: { x: 0, y: 0 }, goal: { x: 2, y: 2 } },
    { grid: [[0, 1, 2], [0, 1, 0], [0, 0, 0]], start: { x: 0, y: 2 }, goal: { x: 2, y: 0 } },
    { grid: [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 2, 0], [0, 0, 0, 0]], start: { x: 0, y: 0 }, goal: { x: 2, y: 2 } },
    { grid: [[0, 0, 0, 0, 0], [1, 1, 1, 1, 0], [2, 0, 0, 0, 0], [0, 1, 1, 1, 1], [0, 0, 0, 0, 0]], start: { x: 0, y: 0 }, goal: { x: 0, y: 2 } },
  ];

  const currentLevelData = levels[level - 1] || levels[0];

  useEffect(() => {
    setRobotPos({ x: currentLevelData.start.x, y: currentLevelData.start.y, dir: 0 });
    setIsWon(false);
    setWorkspace([]);
    setStepMsg(`Level ${level}: ${level === 1 ? 'Maju terus pantang mundur!' : 'Hati-hati tembok penghalang!'}`);
  }, [level]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const gridW = currentLevelData.grid[0].length;
      const gridH = currentLevelData.grid.length;
      const cellSize = Math.min(300 / gridW, 300 / gridH);
      
      ctx.clearRect(0, 0, 300, 300);
      
      // Draw Grid
      currentLevelData.grid.forEach((row, y) => {
        row.forEach((cell, x) => {
          ctx.strokeStyle = '#e2e8f0';
          ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
          if (cell === 1) {
            ctx.fillStyle = '#475569';
            ctx.fillRect(x * cellSize + 5, y * cellSize + 5, cellSize - 10, cellSize - 10);
          } else if (cell === 2) {
            ctx.font = `${cellSize * 0.4}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⭐', x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
          }
        });
      });

      // Draw Robot
      ctx.save();
      ctx.translate(robotPos.x * cellSize + cellSize / 2, robotPos.y * cellSize + cellSize / 2);
      ctx.rotate((robotPos.dir * 90 * Math.PI) / 180);
      ctx.font = `${cellSize * 0.5}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🤖', 0, 0);
      ctx.restore();
    };

    draw();
  }, [robotPos, level]);

  const runCode = async () => {
    if (workspace.length === 0) return;
    setIsRunning(true);
    let cur = { ...robotPos, x: currentLevelData.start.x, y: currentLevelData.start.y, dir: 0 };
    setRobotPos(cur);

    for (const cmd of workspace) {
      await new Promise(r => setTimeout(r, 600));
      if (cmd === 'MOVE') {
        const nx = cur.x + (cur.dir === 0 ? 1 : cur.dir === 2 ? -1 : 0);
        const ny = cur.y + (cur.dir === 1 ? 1 : cur.dir === 3 ? -1 : 0);
        const gridH = currentLevelData.grid.length;
        const gridW = currentLevelData.grid[0].length;
        if (nx >= 0 && nx < gridW && ny >= 0 && ny < gridH && currentLevelData.grid[ny][nx] !== 1) {
          cur.x = nx;
          cur.y = ny;
        } else {
          setStepMsg('💥 Robot menabrak tembok!');
          setIsRunning(false);
          return;
        }
      } else if (cmd === 'RIGHT') {
        cur.dir = (cur.dir + 1) % 4;
      } else if (cmd === 'LEFT') {
        cur.dir = (cur.dir + 3) % 4;
      }
      setRobotPos({ ...cur });
    }

    if (cur.x === currentLevelData.goal.x && cur.y === currentLevelData.goal.y) {
      setStepMsg('🎉 Level Selesai! Kamu Hebat!');
      setIsWon(true);
      if (level === levels.length) {
        saveScore(100);
      }
    } else {
      setStepMsg('🤔 Robot belum sampai ke tujuan. Coba lagi!');
    }
    setIsRunning(false);
  };

  const saveScore = async (finalScore: number) => {
    if ((!currentStudent && !isAdmin) || finalScore <= 0) return;
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
      existingSnap.docs.forEach(d => {
        const val = Number(d.data()?.score || 0);
        if (val > prevBest) prevBest = val;
      });
      if (finalScore > prevBest) {
        const nowIso = new Date().toISOString();
        const studentKelas = currentStudent?.kelas || 'Admin';
        await setDoc(doc(db, 'game_scores', `${studentId}__scratch-blocks`), {
          gameId: 'scratch-blocks',
          gameTitle: 'Koding Master SMP',
          studentId,
          studentName: currentStudent?.nama || 'Admin Pratinjau',
          studentNis: currentStudent?.nis || '-',
          studentKelas,
          kelas: studentKelas,
          score: finalScore,
          playedAt: nowIso,
          timestamp: nowIso
        });
      }
    } catch (e) {
      console.error("Failed saving score", e);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full p-2">
      {/* Toolbox */}
      <div className="flex-1 bg-slate-100 p-4 rounded-2xl border border-slate-300 space-y-4">
        <h4 className="font-black text-sm uppercase text-slate-700">Balok Perintah</h4>
        <div className="grid grid-cols-1 gap-2">
          <button onClick={() => setWorkspace([...workspace, 'MOVE'])} className="p-3 bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-blue-700 transition-all">
            <ArrowRight size={14} /> Maju 1 Langkah
          </button>
          <button onClick={() => setWorkspace([...workspace, 'RIGHT'])} className="p-3 bg-amber-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-amber-600 transition-all">
            <RotateCcw size={14} className="rotate-180" /> Belok Kanan
          </button>
          <button onClick={() => setWorkspace([...workspace, 'LEFT'])} className="p-3 bg-amber-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-amber-600 transition-all">
            <RotateCcw size={14} /> Belok Kiri
          </button>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <h4 className="font-black text-xs uppercase text-slate-500 mb-2">Workspace</h4>
          <div className="min-h-[150px] bg-white rounded-xl border-2 border-dashed border-slate-300 p-2 space-y-1">
            {workspace.map((w, i) => (
              <div key={i} className="px-3 py-1.5 bg-slate-200 rounded-lg text-[10px] font-black flex justify-between items-center group">
                <span>{i + 1}. {w === 'MOVE' ? 'MAJU' : w === 'RIGHT' ? 'KANAN' : 'KIRI'}</span>
                <button onClick={() => setWorkspace(workspace.filter((_, idx) => idx !== i))} className="text-red-500 opacity-0 group-hover:opacity-100">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setWorkspace([])} className="flex-1 py-3 bg-slate-300 text-slate-700 rounded-xl font-black text-xs">Reset</button>
          <button onClick={runCode} disabled={isRunning} className="flex-[2] py-3 bg-emerald-600 text-white rounded-xl font-black text-xs shadow-md shadow-emerald-600/20">JALANKAN</button>
        </div>
      </div>

      {/* Stage */}
      <div className="flex-[1.5] bg-white rounded-3xl border-4 border-slate-900 shadow-xl overflow-hidden flex flex-col items-center justify-center p-4 space-y-4">
        <div className="text-center">
          <span className="text-[10px] font-black bg-brand/10 text-brand px-2 py-0.5 rounded-full uppercase tracking-tighter">Level {level}</span>
          <p className="text-xs font-bold text-slate-600 mt-1">{msg}</p>
        </div>
        
        <canvas ref={canvasRef} width={300} height={300} className="bg-slate-50 rounded-xl border border-slate-200 shadow-inner" />

        {isWon && (
          <div className="w-full">
            {level < levels.length ? (
              <button onClick={() => setLevel(level + 1)} className="w-full py-4 bg-amber-400 text-amber-950 font-black rounded-2xl animate-bounce shadow-xl">
                LANJUT LEVEL {level + 1} ➔
              </button>
            ) : (
              <div className="p-4 bg-emerald-100 border-2 border-emerald-500 rounded-2xl text-center">
                <Trophy size={32} className="mx-auto text-amber-500" />
                <h5 className="font-black text-emerald-900 mt-2">Coding Master Tamat!</h5>
                <p className="text-[10px] font-bold text-emerald-700">Kamu telah menguasai dasar algoritma.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Game 3: Dekomposisi Master Puzzle
   ------------------------------------------------------------------------- */
function DekomposisiPuzzleGame({ isAdmin, currentStudent, onClose }: { isAdmin: boolean; currentStudent: any; onClose: () => void }) {
  const items = [
    { id: '1', text: 'Cetak Struk Belanja', target: 'Transaksi' },
    { id: '2', text: 'Input Stok Masuk', target: 'Stok' },
    { id: '3', text: 'Hitung Total Pendapatan', target: 'Laporan' },
    { id: '4', text: 'Pindai Barcode Produk', target: 'Transaksi' }
  ];

  const buckets = ['Stok', 'Transaksi', 'Laporan'];

  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleAssign = (bucket: string) => {
    if (!selectedItemId) return;
    setAssignments(prev => ({ ...prev, [selectedItemId]: bucket }));
    setSelectedItemId(null);
  };

  const handleCheck = () => {
    let allCorrect = true;
    items.forEach(i => {
      if (assignments[i.id] !== i.target) allCorrect = false;
    });

    if (allCorrect && Object.keys(assignments).length === items.length) {
      setIsCompleted(true);
      saveScore(100);
    } else {
      alert("Masih ada penempatan sub-tugas yang kurang tepat. Periksa kembali!");
    }
  };

  const saveScore = async (finalScore: number) => {
    if ((!currentStudent && !isAdmin) || finalScore <= 0) return;
    const studentId = currentStudent?.id || 'admin-preview';
    try {
      const existingSnap = await getDocs(
        query(
          collection(db, 'game_scores'),
          where('studentId', '==', studentId),
          where('gameId', '==', 'dekomposisi-puzzle')
        )
      );
      let prevBest = 0;
      existingSnap.docs.forEach(d => {
        const val = Number(d.data()?.score || 0);
        if (val > prevBest) prevBest = val;
      });
      if (finalScore > prevBest) {
        const nowIso = new Date().toISOString();
        const studentKelas = currentStudent?.kelas || 'Admin';
        await setDoc(doc(db, 'game_scores', `${studentId}__dekomposisi-puzzle`), {
          gameId: 'dekomposisi-puzzle',
          gameTitle: 'Dekomposisi Master',
          studentId,
          studentName: currentStudent?.nama || 'Admin Pratinjau',
          studentNis: currentStudent?.nis || '-',
          studentKelas,
          kelas: studentKelas,
          score: finalScore,
          playedAt: nowIso,
          timestamp: nowIso
        });
      }
    } catch (e) {
      console.error("Failed saving score", e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-2xl text-center space-y-1">
        <h4 className="font-black text-lg">Misi: Dekomposisi Sistem Kasir Toko</h4>
        <p className="text-xs text-slate-400">Pilih sub-tugas di bawah, lalu klik Modul Kategori yang sesuai!</p>
      </div>

      {/* Items list */}
      <div className="flex flex-wrap gap-3 justify-center">
        {items.map(item => {
          const currentBucket = assignments[item.id];
          const isSelected = selectedItemId === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setSelectedItemId(item.id)}
              className={cn(
                "px-4 py-2.5 rounded-xl font-bold text-xs border-2 transition-all shadow-xs",
                isSelected 
                  ? "bg-amber-400 text-amber-950 border-amber-500 scale-105" 
                  : currentBucket
                    ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                    : "bg-white text-slate-800 border-slate-300 hover:bg-slate-100"
              )}
            >
              {item.text} {currentBucket && <span className="ml-1 font-black text-emerald-700">[{currentBucket}]</span>}
            </button>
          );
        })}
      </div>

      {/* Buckets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {buckets.map(b => (
          <button
            key={b}
            onClick={() => handleAssign(b)}
            className="p-6 bg-slate-200/80 hover:bg-slate-200 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-2 transition-all active:scale-98"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Modul Sub-Sistem</span>
            <h5 className="font-black text-slate-900 text-base">Modul {b}</h5>
            <p className="text-[11px] text-slate-600 font-bold">Klik di sini untuk menempatkan item terpilih</p>
          </button>
        ))}
      </div>

      {isCompleted ? (
        <div className="p-6 bg-emerald-100 border border-emerald-300 rounded-2xl text-center space-y-2">
          <Trophy size={36} className="mx-auto text-amber-500" />
          <h4 className="font-black text-emerald-900 text-lg">Hebat! Dekomposisi Sempurna 🎉</h4>
          <p className="text-xs text-emerald-800 font-bold">Skor Kamu: 100 Poin</p>
        </div>
      ) : (
        <button
          onClick={handleCheck}
          className="w-full py-3.5 bg-brand text-white rounded-xl font-black text-sm shadow-md hover:bg-brand/90 transition-all"
        >
          Periksa Jawaban Dekomposisi
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
   Game 4: Star Catcher Arcade
   ------------------------------------------------------------------------- */
function StarCatcherArcadeGame({ isAdmin, currentStudent, onClose }: { isAdmin: boolean; currentStudent: any; onClose: () => void }) {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Game states in refs for high-perf loop
  const gameStateRef = useRef({
    catX: 400,
    stars: [] as Array<{ x: number; y: number; speed: number; id: number }>,
    keys: { left: false, right: false },
    lastStarTime: 0,
    score: 0,
    lives: 3
  });

  const startGame = () => {
    setScore(0);
    setLives(3);
    setIsPlaying(true);
    setIsGameOver(false);
    gameStateRef.current = {
      catX: 400,
      stars: [],
      keys: { left: false, right: false },
      lastStarTime: 0,
      score: 0,
      lives: 3
    };
  };

  useEffect(() => {
    if (!isPlaying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') gameStateRef.current.keys.left = true;
      if (e.key === 'ArrowRight') gameStateRef.current.keys.right = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') gameStateRef.current.keys.left = false;
      if (e.key === 'ArrowRight') gameStateRef.current.keys.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animFrame: number;
    const ctx = canvasRef.current?.getContext('2d');

    const loop = (time: number) => {
      if (!ctx || !canvasRef.current) return;
      const state = gameStateRef.current;

      // Update internal resolution using pre-transform layout box (safe in CSS landscape rotation)
      const cWidth = canvasRef.current.clientWidth || 800;
      const cHeight = canvasRef.current.clientHeight || 450;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.max(800, Math.floor(cWidth * dpr));
      const targetH = Math.max(450, Math.floor(cHeight * dpr));
      if (canvasRef.current.width !== targetW || canvasRef.current.height !== targetH) {
        canvasRef.current.width = targetW;
        canvasRef.current.height = targetH;
      }

      // Update Physics
      if (state.keys.left) state.catX -= 7.5;
      if (state.keys.right) state.catX += 7.5;
      if (state.catX < 40) state.catX = 40;
      if (state.catX > 760) state.catX = 760;

      // Spawn stars
      if (time - state.lastStarTime > Math.max(350, 950 - state.score * 1.5)) {
        state.stars.push({
          x: Math.random() * 720 + 40,
          y: -30,
          speed: 3.5 + Math.random() * 4 + (state.score / 120),
          id: Date.now()
        });
        state.lastStarTime = time;
      }

      // Update stars
      for (let i = state.stars.length - 1; i >= 0; i--) {
        const star = state.stars[i];
        star.y += star.speed;

        // Collision check (Cat is at y=360)
        const dx = star.x - state.catX;
        const dy = star.y - 360;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 45) {
          state.score += 10;
          setScore(state.score);
          state.stars.splice(i, 1);
          continue;
        }

        if (star.y > 440) {
          state.lives--;
          setLives(state.lives);
          state.stars.splice(i, 1);
          if (state.lives <= 0) {
            setIsPlaying(false);
            setIsGameOver(true);
            saveScore(state.score);
            return;
          }
        }
      }

      // Render
      ctx.save();
      ctx.scale(canvasRef.current.width / 800, canvasRef.current.height / 450);
      ctx.clearRect(0, 0, 800, 450);
      
      // Draw Grass/Floor
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 395, 800, 25);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 395, 800, 2);

      // Draw Cat
      ctx.font = '55px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🐱', state.catX, 365);

      // Draw Stars
      ctx.font = '35px sans-serif';
      state.stars.forEach(s => {
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.fillText('⭐', s.x, s.y);
        ctx.shadowBlur = 0;
      });

      ctx.restore();
      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animFrame);
    };
  }, [isPlaying]);

  const saveScore = async (finalScore: number) => {
    if ((!currentStudent && !isAdmin) || finalScore <= 0) return;
    const studentId = currentStudent?.id || 'admin-preview';
    try {
      const existingSnap = await getDocs(
        query(
          collection(db, 'game_scores'),
          where('studentId', '==', studentId),
          where('gameId', '==', 'star-catcher')
        )
      );
      let prevBest = 0;
      existingSnap.docs.forEach(d => {
        const val = Number(d.data()?.score || 0);
        if (val > prevBest) prevBest = val;
      });
      if (finalScore > prevBest) {
        const nowIso = new Date().toISOString();
        const studentKelas = currentStudent?.kelas || 'Admin';
        await setDoc(doc(db, 'game_scores', `${studentId}__star-catcher`), {
          gameId: 'star-catcher',
          gameTitle: 'Star Catcher Arcade',
          studentId,
          studentName: currentStudent?.nama || 'Admin Pratinjau',
          studentNis: currentStudent?.nis || '-',
          studentKelas,
          kelas: studentKelas,
          score: finalScore,
          playedAt: nowIso,
          timestamp: nowIso
        });
      }
    } catch (e) {
      console.error("Failed saving score", e);
    }
  };

  return (
    <div className="space-y-4 w-full h-full mx-auto flex flex-col items-center">
      <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl w-full border border-slate-800 shadow-lg shrink-0">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
          <span className="text-slate-400">NYAWA:</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={cn("transition-all text-base", i < lives ? "opacity-100 scale-100" : "opacity-20 scale-75")}>❤️</span>
          ))}
        </div>
        <div className="text-lg font-black text-amber-400 flex items-center gap-2">
          <Trophy size={20} className="text-amber-500" />
          SKOR: {score}
        </div>
      </div>

      <div className="relative w-full max-w-4xl flex-1 min-h-0 bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 border-slate-800 shadow-2xl">
        {!isPlaying && !isGameOver ? (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-4 sm:p-6 space-y-4 sm:space-y-6 z-10">
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-brand rounded-2xl flex items-center justify-center text-3xl sm:text-5xl shadow-lg animate-bounce">
              🐱
            </div>
            <div className="space-y-1.5">
              <h4 className="font-black text-xl sm:text-3xl text-white tracking-tight">Star Catcher Arcade</h4>
              <p className="text-xs sm:text-sm text-slate-300 font-bold max-w-sm">
                Gunakan <strong className="text-amber-400">Panah Kiri & Kanan</strong> untuk menggerakkan Kucing dan tangkap Bintang yang jatuh!
              </p>
            </div>
            <button
              onClick={startGame}
              className="px-7 py-3 sm:px-10 sm:py-4 bg-brand text-white font-black text-sm sm:text-lg rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Play size={20} /> Mulai Mainkan!
            </button>
          </div>
        ) : isGameOver ? (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center text-center p-4 sm:p-8 space-y-4 sm:space-y-6 z-10">
            <div className="text-4xl sm:text-6xl animate-pulse">🙀</div>
            <div className="space-y-1">
              <h4 className="font-black text-2xl sm:text-3xl text-rose-500">Game Over!</h4>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] sm:text-xs">Bintang Terlewat Terlalu Banyak</p>
            </div>
            <div className="bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-800 w-full max-w-xs">
              <span className="text-xs text-slate-500 font-black uppercase tracking-tighter block mb-1">Skor Akhir Kamu:</span>
              <div className="text-4xl sm:text-6xl font-black text-amber-400 drop-shadow-lg">{score}</div>
            </div>
            <button
              onClick={startGame}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-slate-950 font-black text-sm sm:text-lg rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <RotateCcw size={20} /> Main Lagi
            </button>
          </div>
        ) : null}

        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="w-full h-full object-contain"
        />

        {/* On-Screen Mobile Controls (kept visible in mobile landscape too) */}
        {isPlaying && (detectMobileDevice() || typeof window !== 'undefined' && window.innerWidth < 1024) && (
          <div className="absolute bottom-3 sm:bottom-5 left-0 right-0 flex justify-between px-4 sm:px-8 pointer-events-none">
            <button
              onMouseDown={() => gameStateRef.current.keys.left = true}
              onMouseUp={() => gameStateRef.current.keys.left = false}
              onTouchStart={(e) => { e.preventDefault(); gameStateRef.current.keys.left = true; }}
              onTouchEnd={() => gameStateRef.current.keys.left = false}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center text-white pointer-events-auto active:bg-white/35 transition-colors border border-white/20"
            >
              <MoveLeft size={28} />
            </button>
            <button
              onMouseDown={() => gameStateRef.current.keys.right = true}
              onMouseUp={() => gameStateRef.current.keys.right = false}
              onTouchStart={(e) => { e.preventDefault(); gameStateRef.current.keys.right = true; }}
              onTouchEnd={() => gameStateRef.current.keys.right = false}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center text-white pointer-events-auto active:bg-white/35 transition-colors border border-white/20"
            >
              <MoveRight size={28} />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
        <span>Gunakan Keyboard:</span>
        <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">←</span>
        <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">→</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Game 5: Petualangan Ke Sekolah (2D Platformer - Multi-Stage Edutainment)
   ------------------------------------------------------------------------- */
const DEFAULT_STAGE_QUIZZES = [
  {
    id: 1,
    question: "Apa fungsi utama dari RAM dalam komponen komputer?",
    options: [
      "Menyimpan data sementara saat program berjalan",
      "Menyimpan data permanen selamanya",
      "Menampilkan gambar ke layar monitor",
      "Menyuplai daya listrik ke motherboard"
    ],
    correctIdx: 0,
    explanation: "RAM (Random Access Memory) berfungsi sebagai memori penyimpanan data sementara berkecepatan tinggi."
  },
  {
    id: 2,
    question: "Teknik memecah masalah kompleks menjadi bagian-bagian lebih kecil disebut...",
    options: [
      "Dekomposisi",
      "Pengenalan Pola",
      "Abstraksi",
      "Algoritma"
    ],
    correctIdx: 0,
    explanation: "Dekomposisi adalah landasan berpikir komputasional untuk membagi masalah besar menjadi modul-modul sederhana."
  },
  {
    id: 3,
    question: "Perangkat keras (Hardware) yang berfungsi sebagai otak utama komputer adalah...",
    options: [
      "CPU (Processor)",
      "Harddisk / SSD",
      "Keyboard",
      "Power Supply"
    ],
    correctIdx: 0,
    explanation: "CPU (Central Processing Unit) memproses seluruh instruksi dan perhitungan matematika pada komputer."
  },
  {
    id: 4,
    question: "Urutan langkah-langkah logis dan sistematis untuk menyelesaikan masalah dinamakan...",
    options: [
      "Algoritma",
      "Pseudocode",
      "Flowchart",
      "Debugging"
    ],
    correctIdx: 0,
    explanation: "Algoritma adalah susunan langkah terstruktur yang pasti untuk mencapai solusi."
  }
];

function getQuizForMateri(materiId: string): Array<{ id: number; question: string; options: string[]; correctIdx: number; explanation: string }> {
  const course = COURSES.find(c => c.id === materiId);
  if (!course) return DEFAULT_STAGE_QUIZZES;

  const collected: Array<{ id: number; question: string; options: string[]; correctIdx: number; explanation: string }> = [];
  let counter = 1;
  course.topics.forEach(t => {
    if (t.quiz && Array.isArray(t.quiz)) {
      t.quiz.forEach(q => {
        if (q.question && q.options && q.options.length >= 2) {
          collected.push({
            id: counter++,
            question: q.question,
            options: q.options,
            correctIdx: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
            explanation: q.explanation || 'Jawaban benar berdasarkan materi pembelajaran.'
          });
        }
      });
    }
  });

  return collected.length > 0 ? collected : DEFAULT_STAGE_QUIZZES;
}

function generateStageEngine(stageNum: number) {
  if (stageNum === 2) {
    // Stage 2: Kegiatan Pramuka (Bumi Perkemahan - Hutan & Treetops)
    return {
      player: {
        x: 100,
        y: 300,
        width: 45,
        height: 65,
        vx: 0,
        vy: 0,
        isGrounded: false,
        direction: 'right' as 'left' | 'right',
        invulnerableFrames: 0,
        superPowerFrames: 0,
        keyboardGunFrames: 0,
        bulletsLeft: 0,
        shootCooldown: 0,
        animFrame: 0,
      },
      bullets: [] as Array<{ x: number; y: number; vx: number; w: number; h: number }>,
      cameraX: 0,
      worldWidth: 6100,
      platforms: [
        { x: 0, y: 380, w: 500, h: 100, type: 'ground' },
        { x: 550, y: 310, w: 120, h: 20, type: 'platform' },
        { x: 720, y: 220, w: 160, h: 20, type: 'platform' },
        { x: 920, y: 380, w: 600, h: 100, type: 'ground' },
        { x: 1100, y: 280, w: 140, h: 20, type: 'platform' },
        { x: 1300, y: 200, w: 140, h: 20, type: 'platform' },
        { x: 1500, y: 150, w: 140, h: 20, type: 'platform' },
        { x: 1680, y: 380, w: 700, h: 100, type: 'ground' },
        { x: 2450, y: 300, w: 180, h: 20, type: 'platform' },
        { x: 2700, y: 240, w: 180, h: 20, type: 'platform' },
        { x: 2950, y: 380, w: 650, h: 100, type: 'ground' },
        { x: 3150, y: 260, w: 150, h: 20, type: 'platform' },
        { x: 3350, y: 180, w: 150, h: 20, type: 'platform' },
        { x: 3550, y: 250, w: 150, h: 20, type: 'platform' },
        { x: 3750, y: 380, w: 750, h: 100, type: 'ground' },
        { x: 4000, y: 290, w: 130, h: 20, type: 'platform' },
        { x: 4500, y: 210, w: 140, h: 20, type: 'platform' },
        { x: 4400, y: 270, w: 130, h: 20, type: 'platform' },
        { x: 4650, y: 380, w: 1550, h: 100, type: 'ground' }
      ],
      items: [
        { id: 1, x: 200, y: 330, w: 26, h: 24, type: 'laptop', collected: false },
        { id: 2, x: 380, y: 330, w: 28, h: 22, type: 'ram', collected: false },
        { id: 101, x: 580, y: 265, w: 30, h: 26, type: 'ammo', collected: false },
        { id: 3, x: 760, y: 175, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 0 },
        { id: 4, x: 1340, y: 155, w: 26, h: 24, type: 'laptop', collected: false },
        { id: 102, x: 1150, y: 235, w: 30, h: 26, type: 'ammo', collected: false },
        { id: 5, x: 1540, y: 105, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 1 },
        { id: 6, x: 1850, y: 330, w: 28, h: 22, type: 'ram', collected: false },
        { id: 7, x: 2500, y: 255, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 2 },
        { id: 103, x: 2250, y: 330, w: 30, h: 26, type: 'ammo', collected: false },
        { id: 8, x: 2750, y: 195, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 3 },
        { id: 9, x: 3200, y: 215, w: 28, h: 22, type: 'ram', collected: false },
        { id: 10, x: 3400, y: 135, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 0 },
        { id: 104, x: 3600, y: 205, w: 30, h: 26, type: 'ammo', collected: false },
        { id: 11, x: 4050, y: 245, w: 26, h: 24, type: 'laptop', collected: false },
        { id: 12, x: 4250, y: 165, w: 28, h: 22, type: 'ram', collected: false },
        { id: 105, x: 4540, y: 165, w: 30, h: 26, type: 'ammo', collected: false },
        { id: 13, x: 4750, y: 330, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 1 },
      ],
      obstacles: [
        { id: 1, x: 350, y: 360, w: 75, h: 20, type: 'fire', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 2, x: 1050, y: 328, w: 52, h: 52, type: 'phone_evil', vx: 1.8, minX: 950, maxX: 1450, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 3, x: 1200, y: 340, w: 34, h: 40, type: 'cone', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 4, x: 1850, y: 328, w: 52, h: 52, type: 'phone_evil', vx: -2, minX: 1720, maxX: 2250, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 5, x: 2500, y: 180, w: 38, h: 42, type: 'homework', vx: 0, minX: 0, maxX: 0, vy: 2, minY: 120, maxY: 280, yDir: 1, destroyed: false },
        { id: 6, x: 3100, y: 360, w: 80, h: 20, type: 'fire', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 7, x: 3300, y: 328, w: 52, h: 52, type: 'phone_evil', vx: 2.2, minX: 3000, maxX: 3500, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 8, x: 3850, y: 340, w: 34, h: 40, type: 'cone', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 9, x: 4150, y: 328, w: 52, h: 52, type: 'phone_evil', vx: -1.9, minX: 3800, maxX: 4400, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 10, x: 4450, y: 180, w: 38, h: 42, type: 'homework', vx: 0, minX: 0, maxX: 0, vy: 2, minY: 120, maxY: 280, yDir: 1, destroyed: false },
        { id: 11, x: 4680, y: 360, w: 80, h: 20, type: 'fire', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      ],
      schoolGateX: 5900,
      boss: {
        x: 5600,
        y: 380 - 160,
        w: 115,
        h: 140,
        hp: 10,
        maxHp: 10,
        vx: 2,
        vy: 0,
        minX: 4900,
        maxX: 5750,
        shootTimer: 0,
        state: 'idle' as 'idle' | 'moving' | 'shooting' | 'jumping' | 'dying' | 'dead',
        jumpPhase: 'none' as 'none' | 'prep' | 'air' | 'land',
        stateTimer: 0,
        lasers: [] as Array<{ x: number; y: number; vx: number; vy?: number; w: number; h: number; type?: string }>,
        fightStarted: false,
        countdown: 0,
        pattern: [1, 4, 2, 3, 4, 2, 1, 4, 3, 4, 2],
        patternIndex: 0,
        direction: 'left' as 'left' | 'right',
        targetX: 0,
        bossRetries: 3,
        invulnerableFrames: 0,
        itemDropTimer: 0,
        hpDropTimer: 0
      }
    };
  }

  if (stageNum === 3) {
    // Stage 3: Study Tour Edukasi (Museum Wisata Cyber & Science Skywalk)
    return {
      player: {
        x: 100,
        y: 300,
        width: 45,
        height: 65,
        vx: 0,
        vy: 0,
        isGrounded: false,
        direction: 'right' as 'left' | 'right',
        invulnerableFrames: 0,
        superPowerFrames: 0,
        keyboardGunFrames: 0,
        bulletsLeft: 0,
        shootCooldown: 0,
        animFrame: 0,
      },
      bullets: [] as Array<{ x: number; y: number; vx: number; w: number; h: number }>,
      cameraX: 0,
      worldWidth: 6400,
      platforms: [
        { x: 0, y: 380, w: 450, h: 100, type: 'ground' },
        { x: 500, y: 300, w: 110, h: 20, type: 'platform' },
        { x: 650, y: 230, w: 110, h: 20, type: 'platform' },
        { x: 800, y: 170, w: 110, h: 20, type: 'platform' },
        { x: 960, y: 380, w: 600, h: 100, type: 'ground' },
        { x: 1150, y: 260, w: 160, h: 20, type: 'platform' },
        { x: 1350, y: 190, w: 160, h: 20, type: 'platform' },
        { x: 1580, y: 240, w: 160, h: 20, type: 'platform' },
        { x: 1800, y: 380, w: 650, h: 100, type: 'ground' },
        { x: 2500, y: 320, w: 140, h: 20, type: 'platform' },
        { x: 2700, y: 250, w: 140, h: 20, type: 'platform' },
        { x: 2900, y: 190, w: 140, h: 20, type: 'platform' },
        { x: 3100, y: 270, w: 140, h: 20, type: 'platform' },
        { x: 3300, y: 380, w: 700, h: 100, type: 'ground' },
        { x: 3500, y: 250, w: 150, h: 20, type: 'platform' },
        { x: 3720, y: 180, w: 150, h: 20, type: 'platform' },
        { x: 3950, y: 230, w: 150, h: 20, type: 'platform' },
        { x: 4150, y: 380, w: 700, h: 100, type: 'ground' },
        { x: 4350, y: 290, w: 130, h: 20, type: 'platform' },
        { x: 4550, y: 210, w: 130, h: 20, type: 'platform' },
        { x: 4750, y: 160, w: 130, h: 20, type: 'platform' },
        { x: 4950, y: 240, w: 130, h: 20, type: 'platform' },
        { x: 5150, y: 380, w: 1250, h: 100, type: 'ground' }
      ],
      items: [
        { id: 1, x: 220, y: 330, w: 26, h: 24, type: 'laptop', collected: false },
        { id: 2, x: 540, y: 255, w: 28, h: 22, type: 'ram', collected: false },
        { id: 101, x: 690, y: 185, w: 30, h: 26, type: 'ammo', collected: false },
        { id: 3, x: 830, y: 125, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 0 },
        { id: 4, x: 1200, y: 215, w: 26, h: 24, type: 'laptop', collected: false },
        { id: 5, x: 1400, y: 145, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 1 },
        { id: 6, x: 1630, y: 195, w: 28, h: 22, type: 'ram', collected: false },
        { id: 102, x: 2540, y: 275, w: 30, h: 26, type: 'ammo', collected: false },
        { id: 7, x: 2740, y: 205, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 2 },
        { id: 8, x: 2940, y: 145, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 3 },
        { id: 9, x: 3550, y: 205, w: 28, h: 22, type: 'ram', collected: false },
        { id: 10, x: 3770, y: 135, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 0 },
        { id: 103, x: 4000, y: 185, w: 30, h: 26, type: 'ammo', collected: false },
        { id: 11, x: 4400, y: 245, w: 26, h: 24, type: 'laptop', collected: false },
        { id: 12, x: 4600, y: 165, w: 28, h: 22, type: 'ram', collected: false },
        { id: 104, x: 4800, y: 115, w: 30, h: 26, type: 'ammo', collected: false },
        { id: 13, x: 5350, y: 330, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 1 },
      ],
      obstacles: [
        { id: 1, x: 320, y: 360, w: 75, h: 20, type: 'fire', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 2, x: 1100, y: 332, w: 60, h: 48, type: 'keyboard_evil', vx: 2.2, minX: 1000, maxX: 1500, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 3, x: 1350, y: 340, w: 34, h: 40, type: 'cone', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 4, x: 2000, y: 332, w: 60, h: 48, type: 'keyboard_evil', vx: -2.4, minX: 1850, maxX: 2380, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 5, x: 2800, y: 170, w: 38, h: 42, type: 'homework', vx: 0, minX: 0, maxX: 0, vy: 2, minY: 110, maxY: 270, yDir: 1, destroyed: false },
        { id: 6, x: 3450, y: 360, w: 80, h: 20, type: 'fire', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 7, x: 3650, y: 332, w: 60, h: 48, type: 'keyboard_evil', vx: 2.5, minX: 3350, maxX: 3950, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 8, x: 4300, y: 340, w: 34, h: 40, type: 'cone', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 9, x: 4500, y: 332, w: 60, h: 48, type: 'keyboard_evil', vx: -2.3, minX: 4500, maxX: 4800, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 10, x: 4650, y: 160, w: 38, h: 42, type: 'homework', vx: 0, minX: 0, maxX: 0, vy: 2, minY: 100, maxY: 260, yDir: 1, destroyed: false },
        { id: 11, x: 5300, y: 360, w: 80, h: 20, type: 'fire', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 12, x: 5500, y: 332, w: 60, h: 48, type: 'keyboard_evil', vx: 2.6, minX: 5200, maxX: 5800, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 13, x: 5850, y: 332, w: 60, h: 48, type: 'keyboard_evil', vx: -2.8, minX: 5600, maxX: 6050, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      ],
      schoolGateX: 6100,
    };
  }

  if (stageNum === 4) {
    // Stage 4: Menuju Kota Ciamis (Alun-Alun & Monumen Bunga Rafflesia - 220m)
    return {
      player: {
        x: 100,
        y: 300,
        width: 45,
        height: 65,
        vx: 0,
        vy: 0,
        isGrounded: false,
        direction: 'right' as 'left' | 'right',
        invulnerableFrames: 0,
        superPowerFrames: 0,
        keyboardGunFrames: 0,
        bulletsLeft: 0,
        shootCooldown: 0,
        animFrame: 0,
      },
      bullets: [] as Array<{ x: number; y: number; vx: number; w: number; h: number }>,
      cameraX: 0,
      worldWidth: 7200,
      platforms: [
        { x: 0, y: 380, w: 500, h: 100, type: 'ground' },
        { x: 550, y: 300, w: 120, h: 20, type: 'platform' },
        { x: 720, y: 220, w: 140, h: 20, type: 'platform' },
        { x: 900, y: 160, w: 140, h: 20, type: 'platform' },
        { x: 1100, y: 380, w: 620, h: 100, type: 'ground' },
        { x: 1300, y: 270, w: 150, h: 20, type: 'platform' },
        { x: 1520, y: 200, w: 150, h: 20, type: 'platform' },
        { x: 1840, y: 380, w: 660, h: 100, type: 'ground' },
        { x: 2000, y: 280, w: 160, h: 20, type: 'platform' },
        { x: 2250, y: 210, w: 160, h: 20, type: 'platform' },
        { x: 2550, y: 150, w: 160, h: 20, type: 'platform' },
        { x: 2800, y: 380, w: 740, h: 100, type: 'ground' },
        { x: 3000, y: 280, w: 140, h: 20, type: 'platform' },
        { x: 3200, y: 210, w: 140, h: 20, type: 'platform' },
        { x: 3400, y: 270, w: 140, h: 20, type: 'platform' },
        { x: 3660, y: 380, w: 690, h: 100, type: 'ground' },
        { x: 3850, y: 260, w: 150, h: 20, type: 'platform' },
        { x: 4100, y: 190, w: 150, h: 20, type: 'platform' },
        { x: 4350, y: 250, w: 150, h: 20, type: 'platform' },
        { x: 4600, y: 380, w: 750, h: 100, type: 'ground' },
        { x: 4800, y: 280, w: 140, h: 20, type: 'platform' },
        { x: 5020, y: 200, w: 140, h: 20, type: 'platform' },
        { x: 5250, y: 150, w: 140, h: 20, type: 'platform' },
        { x: 5500, y: 380, w: 1700, h: 100, type: 'ground' }
      ],
      items: [
        { id: 1, x: 220, y: 330, w: 26, h: 24, type: 'laptop', collected: false },
        { id: 2, x: 580, y: 255, w: 28, h: 22, type: 'ram', collected: false },
        { id: 101, x: 760, y: 175, w: 30, h: 26, type: 'ammo', collected: false },
        { id: 3, x: 930, y: 115, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 0 },
        { id: 4, x: 1350, y: 225, w: 26, h: 24, type: 'laptop', collected: false },
        { id: 5, x: 1560, y: 155, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 1 },
        { id: 6, x: 2050, y: 235, w: 28, h: 22, type: 'ram', collected: false },
        { id: 102, x: 2150, y: 330, w: 30, h: 26, type: 'ammo', collected: false },
        { id: 7, x: 2300, y: 165, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 2 },
        { id: 8, x: 2590, y: 105, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 3 },
        { id: 9, x: 3050, y: 235, w: 28, h: 22, type: 'ram', collected: false },
        { id: 10, x: 3250, y: 165, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 0 },
        { id: 103, x: 3440, y: 225, w: 30, h: 26, type: 'ammo', collected: false },
        { id: 11, x: 3900, y: 215, w: 26, h: 24, type: 'laptop', collected: false },
        { id: 12, x: 4150, y: 145, w: 28, h: 22, type: 'ram', collected: false },
        { id: 104, x: 4400, y: 205, w: 30, h: 26, type: 'ammo', collected: false },
        { id: 13, x: 4850, y: 235, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 1 },
        { id: 105, x: 5290, y: 105, w: 30, h: 26, type: 'ammo', collected: false },
        { id: 14, x: 5700, y: 330, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 2 },
      ],
      obstacles: [
        { id: 1, x: 350, y: 360, w: 75, h: 20, type: 'fire', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 2, x: 1250, y: 330, w: 52, h: 50, type: 'computer_evil', vx: 2, minX: 1150, maxX: 1650, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 3, x: 1450, y: 340, w: 34, h: 40, type: 'cone', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 4, x: 1950, y: 328, w: 52, h: 52, type: 'phone_evil', vx: -2.3, minX: 1870, maxX: 2380, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 5, x: 2600, y: 160, w: 38, h: 42, type: 'homework', vx: 0, minX: 0, maxX: 0, vy: 2, minY: 100, maxY: 260, yDir: 1, destroyed: false },
        { id: 6, x: 3100, y: 360, w: 80, h: 20, type: 'fire', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 7, x: 3350, y: 332, w: 60, h: 48, type: 'keyboard_evil', vx: 2.5, minX: 2950, maxX: 3500, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 8, x: 3800, y: 340, w: 34, h: 40, type: 'cone', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 9, x: 4050, y: 328, w: 52, h: 52, type: 'phone_evil', vx: -2.4, minX: 3880, maxX: 4320, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 10, x: 4400, y: 160, w: 38, h: 42, type: 'homework', vx: 0, minX: 0, maxX: 0, vy: 2, minY: 100, maxY: 260, yDir: 1, destroyed: false },
        { id: 11, x: 4900, y: 360, w: 80, h: 20, type: 'fire', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 12, x: 5150, y: 332, w: 60, h: 48, type: 'keyboard_evil', vx: 2.8, minX: 4750, maxX: 5300, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 13, x: 5800, y: 330, w: 52, h: 50, type: 'computer_evil', vx: -3, minX: 5550, maxX: 6300, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      ],
      schoolGateX: 6800,
    };
  }

  // Default Stage 1: Berangkat ke Sekolah (175m)
  return {
    player: {
      x: 100,
      y: 300,
      width: 45,
      height: 65,
      vx: 0,
      vy: 0,
      isGrounded: false,
      direction: 'right' as 'left' | 'right',
      invulnerableFrames: 0,
      superPowerFrames: 0,
      keyboardGunFrames: 0,
      bulletsLeft: 0,
      shootCooldown: 0,
      animFrame: 0,
    },
    bullets: [] as Array<{ x: number; y: number; vx: number; w: number; h: number }>,
    cameraX: 0,
    worldWidth: 6500,
    platforms: [
      { x: 0, y: 380, w: 580, h: 100, type: 'ground' },
      { x: 700, y: 380, w: 480, h: 100, type: 'ground' },
      { x: 800, y: 280, w: 120, h: 20, type: 'platform' },
      { x: 980, y: 220, w: 120, h: 20, type: 'platform' },
      { x: 1300, y: 380, w: 640, h: 100, type: 'ground' },
      { x: 1400, y: 270, w: 140, h: 20, type: 'platform' },
      { x: 1600, y: 200, w: 140, h: 20, type: 'platform' },
      { x: 2060, y: 380, w: 640, h: 100, type: 'ground' },
      { x: 2200, y: 280, w: 160, h: 20, type: 'platform' },
      { x: 2450, y: 240, w: 160, h: 20, type: 'platform' },
      { x: 2820, y: 380, w: 780, h: 100, type: 'ground' },
      { x: 2950, y: 270, w: 150, h: 20, type: 'platform' },
      { x: 3200, y: 210, w: 150, h: 20, type: 'platform' },
      { x: 3720, y: 380, w: 780, h: 100, type: 'ground' },
      { x: 3850, y: 280, w: 160, h: 20, type: 'platform' },
      { x: 4100, y: 230, w: 160, h: 20, type: 'platform' },
      { x: 4620, y: 380, w: 1880, h: 100, type: 'ground' }
    ],
    items: [
      { id: 1, x: 250, y: 330, w: 26, h: 24, type: 'laptop', collected: false },
      { id: 2, x: 400, y: 330, w: 28, h: 22, type: 'ram', collected: false },
      { id: 101, x: 500, y: 330, w: 30, h: 26, type: 'ammo', collected: false },
      { id: 3, x: 840, y: 235, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 0 },
      { id: 4, x: 1020, y: 180, w: 26, h: 24, type: 'laptop', collected: false },
      { id: 102, x: 1640, y: 330, w: 30, h: 26, type: 'ammo', collected: false },
      { id: 5, x: 1450, y: 225, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 1 },
      { id: 6, x: 1650, y: 160, w: 28, h: 22, type: 'ram', collected: false },
      { id: 7, x: 2250, y: 235, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 2 },
      { id: 8, x: 2500, y: 195, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 3 },
      { id: 103, x: 2880, y: 330, w: 30, h: 26, type: 'ammo', collected: false },
      { id: 9, x: 3000, y: 230, w: 28, h: 22, type: 'ram', collected: false },
      { id: 10, x: 3250, y: 170, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 0 },
      { id: 11, x: 3900, y: 240, w: 26, h: 24, type: 'laptop', collected: false },
      { id: 12, x: 4150, y: 190, w: 28, h: 22, type: 'ram', collected: false },
      { id: 104, x: 4320, y: 330, w: 30, h: 26, type: 'ammo', collected: false },
      { id: 13, x: 4700, y: 330, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 1 },
    ],
    obstacles: [
      { id: 1, x: 450, y: 360, w: 75, h: 20, type: 'fire', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 2, x: 780, y: 330, w: 52, h: 50, type: 'computer_evil', vx: 1.6, minX: 720, maxX: 1120, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 3, x: 1360, y: 340, w: 34, h: 40, type: 'cone', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 4, x: 1520, y: 330, w: 52, h: 50, type: 'computer_evil', vx: -1.8, minX: 1340, maxX: 1800, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 5, x: 1800, y: 200, w: 38, h: 42, type: 'homework', vx: 0, minX: 0, maxX: 0, vy: 2, minY: 150, maxY: 330, yDir: 1, destroyed: false },
      { id: 6, x: 2150, y: 360, w: 80, h: 20, type: 'fire', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 7, x: 2350, y: 330, w: 52, h: 50, type: 'computer_evil', vx: 2, minX: 2100, maxX: 2620, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 8, x: 2900, y: 340, w: 34, h: 40, type: 'cone', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 9, x: 3100, y: 330, w: 52, h: 50, type: 'computer_evil', vx: 1.8, minX: 2860, maxX: 3420, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 10, x: 3500, y: 200, w: 38, h: 42, type: 'homework', vx: 0, minX: 0, maxX: 0, vy: 2, minY: 150, maxY: 330, yDir: 1, destroyed: false },
      { id: 11, x: 3800, y: 360, w: 80, h: 20, type: 'fire', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 12, x: 4000, y: 330, w: 52, h: 50, type: 'computer_evil', vx: -2, minX: 3760, maxX: 4320, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 13, x: 4850, y: 330, w: 52, h: 50, type: 'computer_evil', vx: 2.2, minX: 4660, maxX: 5250, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
    ],
    schoolGateX: 6250,
    boss: {
      x: 6200,
      y: 380 - 160,
      w: 110,
      h: 140,
      hp: 10,
      maxHp: 10,
      vx: 2,
      vy: 0,
      minX: 5400,
      maxX: 6150,
      shootTimer: 0,
      state: 'idle' as 'idle' | 'moving' | 'shooting' | 'jumping' | 'dying' | 'dead',
      jumpPhase: 'none' as 'none' | 'prep' | 'air' | 'land',
      stateTimer: 0,
      lasers: [] as Array<{ x: number; y: number; vx: number; vy?: number; w: number; h: number; type?: string }>,
      fightStarted: false,
      countdown: 0,
      pattern: [1, 2, 3, 1, 3, 3, 2, 2, 1, 3, 1, 2, 1, 1],
      patternIndex: 0,
      direction: 'left' as 'left' | 'right',
      targetX: 0,
      bossRetries: 3,
      invulnerableFrames: 0,
      itemDropTimer: 0,
      hpDropTimer: 0
    }
  };
}

// ==========================================
// DETAILED GRAPHICAL SCENERY & LOCATION ILLUSTRATIONS
// ==========================================

// 1. RUMAH SISWA (Cozy Indonesian Home)
function drawRumah(ctx: CanvasRenderingContext2D, x: number, groundY: number, animFrame: number) {
  if (x < -320 || x > 950) return;
  ctx.save();

  // Lawn & Stone Walkway
  ctx.fillStyle = '#65a30d';
  ctx.fillRect(x - 30, groundY - 8, 250, 8);
  ctx.fillStyle = '#94a3b8';
  for (let s = 0; s < 5; s++) {
    ctx.beginPath();
    ctx.ellipse(x + 75 + s * 12, groundY - 3, 7, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // White Picket Fence
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  for (let f = 0; f < 7; f++) {
    const fx = x - 25 + f * 16;
    ctx.beginPath();
    ctx.moveTo(fx, groundY);
    ctx.lineTo(fx, groundY - 22);
    ctx.lineTo(fx + 5, groundY - 28);
    ctx.lineTo(fx + 10, groundY - 22);
    ctx.lineTo(fx + 10, groundY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillRect(x - 28, groundY - 16, 110, 4);

  // Fruit Tree beside house
  const treeX = x - 15;
  ctx.fillStyle = '#78350f';
  ctx.fillRect(treeX, groundY - 85, 14, 85);
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.arc(treeX - 8, groundY - 90, 24, 0, Math.PI * 2);
  ctx.arc(treeX + 20, groundY - 95, 26, 0, Math.PI * 2);
  ctx.arc(treeX + 6, groundY - 118, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(treeX + 4, groundY - 105, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ef4444';
  const fruits = [[-10, -85], [4, -110], [18, -90], [14, -120], [-2, -75]];
  for (const [fx, fy] of fruits) {
    ctx.beginPath();
    ctx.arc(treeX + fx, groundY + fy, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Main House Body (Cream / Warm Peach wall)
  const bldgX = x + 35;
  const bldgW = 145;
  const bldgH = 95;
  const bldgY = groundY - bldgH;
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(bldgX, bldgY, bldgW, bldgH);
  ctx.fillStyle = '#fde047';
  ctx.fillRect(bldgX, groundY - 10, bldgW, 10);
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.25)';
  ctx.lineWidth = 1;
  for (let ly = bldgY + 14; ly < groundY - 10; ly += 12) {
    ctx.beginPath();
    ctx.moveTo(bldgX, ly);
    ctx.lineTo(bldgX + bldgW, ly);
    ctx.stroke();
  }

  // Large Living Room Window
  const winX = bldgX + 15;
  const winY = bldgY + 25;
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(winX, winY, 44, 38);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(winX, winY, 44, 38);
  ctx.beginPath();
  ctx.moveTo(winX + 22, winY);
  ctx.lineTo(winX + 22, winY + 38);
  ctx.moveTo(winX, winY + 19);
  ctx.lineTo(winX + 44, winY + 19);
  ctx.stroke();
  // Glass glare
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.moveTo(winX + 4, winY + 33);
  ctx.lineTo(winX + 18, winY + 5);
  ctx.lineTo(winX + 24, winY + 5);
  ctx.lineTo(winX + 10, winY + 33);
  ctx.fill();
  // Window sill & flowerpot
  ctx.fillStyle = '#b45309';
  ctx.fillRect(winX - 3, winY + 38, 50, 4);
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(winX + 16, winY + 32, 12, 8);
  ctx.fillStyle = '#ec4899';
  ctx.beginPath();
  ctx.arc(winX + 19, winY + 30, 3, 0, Math.PI * 2);
  ctx.arc(winX + 25, winY + 30, 3, 0, Math.PI * 2);
  ctx.fill();

  // Front Porch & Entrance Door
  const doorX = bldgX + 78;
  const doorY = groundY - 60;
  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.moveTo(doorX - 10, doorY - 10);
  ctx.lineTo(doorX + 55, doorY - 10);
  ctx.lineTo(doorX + 50, doorY - 2);
  ctx.lineTo(doorX - 15, doorY - 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#78350f';
  ctx.fillRect(doorX - 6, doorY - 2, 4, 60);
  ctx.fillRect(doorX + 48, doorY - 2, 4, 60);
  // Teak Door
  ctx.fillStyle = '#92400e';
  ctx.fillRect(doorX, doorY, 38, 58);
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(doorX, doorY, 38, 58);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(doorX + 5, doorY + 6, 28, 20);
  ctx.fillRect(doorX + 5, doorY + 30, 28, 22);
  // Knob & doormat
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(doorX + 8, doorY + 32, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#065f46';
  ctx.fillRect(doorX + 2, groundY - 3, 34, 3);
  // House Number Plaque
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(doorX + 10, doorY - 8, 20, 7);
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 5px sans-serif';
  ctx.fillText('NO. 01', doorX + 11, doorY - 3);

  // Porch lantern
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(doorX + 42, doorY + 10, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
  ctx.beginPath();
  ctx.arc(doorX + 42, doorY + 10, 9, 0, Math.PI * 2);
  ctx.fill();

  // Terracotta Indonesian Roof (Genteng Merah)
  const roofY = bldgY;
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(bldgX - 18, roofY + 4);
  ctx.lineTo(bldgX + 70, roofY - 55);
  ctx.lineTo(bldgX + bldgW + 18, roofY + 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#991b1b';
  ctx.lineWidth = 2;
  for (let r = 1; r < 5; r++) {
    const ry = roofY + 4 - r * 11;
    const inset = r * 14;
    ctx.beginPath();
    ctx.moveTo(bldgX - 18 + inset, ry);
    ctx.lineTo(bldgX + bldgW + 18 - inset, ry);
    ctx.stroke();
  }
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(bldgX + 62, roofY - 58, 16, 5);

  // Chimney with animated smoke puffs
  const chimX = bldgX + 105;
  ctx.fillStyle = '#b45309';
  ctx.fillRect(chimX, roofY - 45, 14, 25);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(chimX - 2, roofY - 48, 18, 4);
  for (let sm = 0; sm < 3; sm++) {
    const smokeOffset = ((animFrame * 0.8 + sm * 1.5) % 4);
    const smokeY = roofY - 52 - smokeOffset * 10;
    const smokeX = chimX + 6 + Math.sin(smokeOffset * 2) * 5;
    const smokeR = 4 + smokeOffset * 2;
    ctx.fillStyle = `rgba(226, 232, 240, ${Math.max(0, 0.7 - smokeOffset * 0.18)})`;
    ctx.beginPath();
    ctx.arc(smokeX, smokeY, smokeR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Attic round window
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(bldgX + 70, roofY - 22, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Signboard: "🏠 RUMAH SISWA"
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x + 50, groundY - 120, 84, 18);
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 50, groundY - 120, 84, 18);
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText('🏠 RUMAH SISWA', x + 55, groundY - 108);

  ctx.restore();
}

// 2. SEKOLAH (SMPN 1 KAWALI)
function drawSekolah(ctx: CanvasRenderingContext2D, x: number, groundY: number, animFrame: number, isDeparture: boolean, subTitle: string) {
  if (x < -400 || x > 950) return;
  ctx.save();

  // Main School Building in Background (2 floors, white & signature SMP blue)
  const bldgX = x + 35;
  const bldgW = 260;
  const bldgH = 150;
  const bldgY = groundY - bldgH;

  // Base shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.fillRect(bldgX - 10, groundY - 3, bldgW + 20, 5);

  // Building Walls
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(bldgX, bldgY, bldgW, bldgH);

  // Blue Accent Bands
  ctx.fillStyle = '#1e40af';
  ctx.fillRect(bldgX, bldgY + 68, bldgW, 10);
  ctx.fillRect(bldgX, groundY - 16, bldgW, 16);

  // Classroom Windows (2 floors, 5 columns)
  for (let fl = 0; fl < 2; fl++) {
    const wy = fl === 0 ? bldgY + 20 : bldgY + 86;
    for (let c = 0; c < 5; c++) {
      if (fl === 1 && c === 2) continue; // Entrance on ground floor center
      const wx = bldgX + 16 + c * 48;
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(wx - 3, wy - 6, 38, 5);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(wx, wy, 32, 26);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(wx, wy, 32, 26);
      ctx.beginPath();
      ctx.moveTo(wx + 16, wy);
      ctx.lineTo(wx + 16, wy + 26);
      ctx.moveTo(wx, wy + 13);
      ctx.lineTo(wx + 32, wy + 13);
      ctx.stroke();
    }
  }

  // Central Entrance & Glass Double Doors
  const entX = bldgX + 16 + 2 * 48;
  const entY = bldgY + 86;
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(entX - 2, entY, 36, 48);
  ctx.fillStyle = '#bae6fd';
  ctx.fillRect(entX + 2, entY + 8, 13, 38);
  ctx.fillRect(entX + 17, entY + 8, 13, 38);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(entX + 2, entY + 8, 13, 38);
  ctx.strokeRect(entX + 17, entY + 8, 13, 38);

  // Central Clock Tower with Pediment
  const towerX = bldgX + bldgW / 2 - 30;
  const towerY = bldgY - 45;
  ctx.fillStyle = '#1e40af';
  ctx.fillRect(towerX, towerY, 60, 45);
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(towerX - 6, towerY);
  ctx.lineTo(towerX + 30, towerY - 26);
  ctx.lineTo(towerX + 66, towerY);
  ctx.closePath();
  ctx.fill();

  // Working / Ticking Clock Face
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(towerX + 30, towerY + 22, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.stroke();
  const clockAngle = (animFrame * 0.1);
  ctx.beginPath();
  ctx.moveTo(towerX + 30, towerY + 22);
  ctx.lineTo(towerX + 30 + Math.cos(clockAngle) * 8, towerY + 22 + Math.sin(clockAngle) * 8);
  ctx.moveTo(towerX + 30, towerY + 22);
  ctx.lineTo(towerX + 30, towerY + 14);
  ctx.stroke();
  // Golden School Bell under pediment
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(towerX + 30, towerY - 8, 6, 0, Math.PI);
  ctx.lineTo(towerX + 34, towerY - 2);
  ctx.lineTo(towerX + 26, towerY - 2);
  ctx.closePath();
  ctx.fill();

  // Main Indonesian Red-and-White Flag on Tall Silver Mast
  const flagMastX = x + 15;
  const mastY = groundY - 140;
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(flagMastX, mastY, 5, 140);
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(flagMastX + 2.5, mastY - 2, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Animated Waving Indonesian Flag
  const flagW = 46;
  const flagH = 14;
  for (let fx = 0; fx < flagW; fx += 2) {
    const wave = Math.sin(animFrame * 3 + fx * 0.15) * 3;
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(flagMastX + 5 + fx, mastY + 4 + wave, 2.5, flagH);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(flagMastX + 5 + fx, mastY + 4 + flagH + wave, 2.5, flagH);
  }

  // Grand School Entrance Gate & Pillars
  const gateL = x + 65;
  const gateR = x + 245;
  ctx.fillStyle = '#334155';
  ctx.fillRect(gateL, groundY - 95, 24, 95);
  ctx.fillRect(gateR, groundY - 95, 24, 95);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(gateL - 3, groundY - 100, 30, 8);
  ctx.fillRect(gateR - 3, groundY - 100, 30, 8);

  // Grand Overhead Arch Signboard
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(gateL - 8, groundY - 128, 220, 32);
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(gateL - 8, groundY - 128, 220, 32);

  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('🏫 SMPN 1 KAWALI', gateL + 30, groundY - 110);
  ctx.fillStyle = '#93c5fd';
  ctx.font = 'bold 8px sans-serif';
  ctx.fillText(subTitle || 'UNGGUL DALAM PRESTASI & TEKNOLOGI', gateL + 18, groundY - 100);

  // Flowerbeds & Shrubs
  ctx.fillStyle = '#15803d';
  for (let sh = 0; sh < 4; sh++) {
    ctx.beginPath();
    ctx.arc(gateL - 25 + sh * 12, groundY - 8, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = sh % 2 === 0 ? '#f43f5e' : '#fbbf24';
    ctx.beginPath();
    ctx.arc(gateL - 25 + sh * 12, groundY - 11, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#15803d';
  }

  // If Departure, draw parked school tour bus
  if (isDeparture) {
    const busX = x + 275;
    const busY = groundY - 65;
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(busX, busY, 80, 48);
    ctx.beginPath();
    ctx.arc(busX + 80, busY + 24, 24, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    ctx.fillStyle = '#0284c7';
    for (let bw = 0; bw < 4; bw++) {
      ctx.fillRect(busX + 8 + bw * 17, busY + 8, 13, 16);
    }
    ctx.fillRect(busX + 78, busY + 8, 15, 16);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(busX + 22, groundY - 6, 11, 0, Math.PI * 2);
    ctx.arc(busX + 74, groundY - 6, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(busX + 22, groundY - 6, 5, 0, Math.PI * 2);
    ctx.arc(busX + 74, groundY - 6, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 7px sans-serif';
    ctx.fillText('BUS SMPN 1', busX + 14, busY + 36);
  }

  ctx.restore();
}

// 3. TEMPAT KEMAH (Bumi Perkemahan Pramuka)
function drawTempatKemah(ctx: CanvasRenderingContext2D, x: number, groundY: number, animFrame: number) {
  if (x < -400 || x > 950) return;
  ctx.save();

  // Grand Bamboo Pioneering Gateway
  const gateX = x + 70;
  const gateW = 160;

  const drawBambooPole = (bx: number, by: number, bw: number, bh: number) => {
    ctx.fillStyle = '#eab308';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#a16207';
    for (let ny = by + 15; ny < by + bh; ny += 20) {
      ctx.fillRect(bx - 1, ny, bw + 2, 3);
    }
  };

  const drawRopeLashing = (rx: number, ry: number) => {
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(rx, ry, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rx - 4, ry - 4);
    ctx.lineTo(rx + 4, ry + 4);
    ctx.moveTo(rx + 4, ry - 4);
    ctx.lineTo(rx - 4, ry + 4);
    ctx.stroke();
  };

  // Main Vertical Bamboo Towers
  drawBambooPole(gateX, groundY - 140, 10, 140);
  drawBambooPole(gateX + 18, groundY - 140, 10, 140);
  drawBambooPole(gateX + gateW - 28, groundY - 140, 10, 140);
  drawBambooPole(gateX + gateW - 10, groundY - 140, 10, 140);

  // Horizontal Cross Bamboos
  drawBambooPole(gateX - 10, groundY - 130, gateW + 20, 10);
  drawBambooPole(gateX - 10, groundY - 95, gateW + 20, 10);
  drawBambooPole(gateX - 5, groundY - 60, gateW + 10, 8);

  // Diagonal Bracing
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(gateX + 5, groundY - 130);
  ctx.lineTo(gateX + 23, groundY - 95);
  ctx.moveTo(gateX + gateW - 23, groundY - 130);
  ctx.lineTo(gateX + gateW - 5, groundY - 95);
  ctx.stroke();

  // Rope Lashings on joints
  drawRopeLashing(gateX + 5, groundY - 130);
  drawRopeLashing(gateX + 23, groundY - 130);
  drawRopeLashing(gateX + gateW - 23, groundY - 130);
  drawRopeLashing(gateX + gateW - 5, groundY - 130);
  drawRopeLashing(gateX + 5, groundY - 95);
  drawRopeLashing(gateX + gateW - 5, groundY - 95);

  // Carved Wooden Signboard: "🏕️ BUMI PERKEMAHAN PRAMUKA"
  ctx.fillStyle = '#78350f';
  ctx.fillRect(gateX + 12, groundY - 125, gateW - 24, 26);
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 2;
  ctx.strokeRect(gateX + 12, groundY - 125, gateW - 24, 26);
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 9.5px sans-serif';
  ctx.fillText('🏕️ BUMI PERKEMAHAN', gateX + 20, groundY - 113);
  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 7.5px sans-serif';
  ctx.fillText('KWARAN GERAKAN PRAMUKA', gateX + 22, groundY - 103);

  // Dual Flagpoles on Bamboo Towers
  const flagL = gateX + 5;
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(flagL, groundY - 180, 3, 45);
  const wave1 = Math.sin(animFrame * 3) * 2;
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(flagL + 3, groundY - 180 + wave1, 24, 7);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(flagL + 3, groundY - 173 + wave1, 24, 7);

  const flagR = gateX + gateW - 8;
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(flagR, groundY - 180, 3, 45);
  const wave2 = Math.sin(animFrame * 3 + 1) * 2;
  ctx.fillStyle = '#581c87';
  ctx.fillRect(flagR + 3, groundY - 180 + wave2, 25, 14);
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(flagR + 15, groundY - 173 + wave2, 4, 0, Math.PI * 2);
  ctx.fill();

  // Left Army Green Scout Tent
  const tent1X = x - 30;
  const tent1Y = groundY - 65;
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.moveTo(tent1X + 40, tent1Y);
  ctx.lineTo(tent1X, groundY);
  ctx.lineTo(tent1X + 80, groundY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ca8a04';
  ctx.beginPath();
  ctx.moveTo(tent1X + 40, tent1Y);
  ctx.lineTo(tent1X + 20, groundY);
  ctx.lineTo(tent1X + 40, groundY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#14532d';
  ctx.beginPath();
  ctx.moveTo(tent1X + 40, tent1Y);
  ctx.lineTo(tent1X + 40, groundY);
  ctx.lineTo(tent1X + 60, groundY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(tent1X + 40, tent1Y);
  ctx.lineTo(tent1X - 12, groundY);
  ctx.moveTo(tent1X + 40, tent1Y);
  ctx.lineTo(tent1X + 92, groundY);
  ctx.stroke();

  // Right Khaki Scout Tent
  const tent2X = x + 245;
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.moveTo(tent2X + 40, tent1Y + 5);
  ctx.lineTo(tent2X, groundY);
  ctx.lineTo(tent2X + 80, groundY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.moveTo(tent2X + 40, tent1Y + 5);
  ctx.lineTo(tent2X + 22, groundY);
  ctx.lineTo(tent2X + 40, groundY);
  ctx.closePath();
  ctx.fill();

  // Realistic Campfire with Animated Multi-layer Flame (Api Unggun)
  const fireX = x + 150;
  const fireY = groundY - 12;
  ctx.fillStyle = '#64748b';
  for (let s = 0; s < 7; s++) {
    ctx.beginPath();
    ctx.arc(fireX - 22 + s * 7, groundY - 3, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.moveTo(fireX - 18, fireY);
  ctx.lineTo(fireX + 16, fireY + 8);
  ctx.lineTo(fireX + 14, fireY + 12);
  ctx.lineTo(fireX - 20, fireY + 4);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(fireX + 18, fireY);
  ctx.lineTo(fireX - 16, fireY + 8);
  ctx.lineTo(fireX - 14, fireY + 12);
  ctx.lineTo(fireX + 20, fireY + 4);
  ctx.fill();

  // Dancing Flames: Outer Red, Middle Orange, Core Yellow
  const fFlicker1 = Math.sin(animFrame * 5) * 4;
  const fFlicker2 = Math.cos(animFrame * 6) * 3;
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(fireX - 16, fireY + 4);
  ctx.quadraticCurveTo(fireX - 14, fireY - 18 + fFlicker1, fireX, fireY - 36 + fFlicker1);
  ctx.quadraticCurveTo(fireX + 14, fireY - 18 + fFlicker2, fireX + 16, fireY + 4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.moveTo(fireX - 11, fireY + 4);
  ctx.quadraticCurveTo(fireX - 8, fireY - 14 + fFlicker2, fireX, fireY - 26 + fFlicker2);
  ctx.quadraticCurveTo(fireX + 8, fireY - 14 + fFlicker1, fireX + 11, fireY + 4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.moveTo(fireX - 6, fireY + 4);
  ctx.quadraticCurveTo(fireX - 4, fireY - 8 + fFlicker1, fireX, fireY - 16 + fFlicker1);
  ctx.quadraticCurveTo(fireX + 4, fireY - 8 + fFlicker2, fireX + 6, fireY + 4);
  ctx.closePath();
  ctx.fill();

  // Floating Fire Embers
  for (let sp = 0; sp < 4; sp++) {
    const spY = (fireY - 10 - ((animFrame * 1.5 + sp * 8) % 35));
    const spX = fireX + Math.sin(animFrame * 2 + sp) * 8;
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(spX, spY, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cooking Tripod with Hanging Kettle
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(fireX - 16, groundY);
  ctx.lineTo(fireX, fireY - 38);
  ctx.lineTo(fireX + 16, groundY);
  ctx.stroke();
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.arc(fireX, fireY - 18, 5, 0, Math.PI * 2);
  ctx.fill();

  // Hurricane lantern on wooden pole
  const lantX = gateX - 22;
  ctx.fillStyle = '#78350f';
  ctx.fillRect(lantX, groundY - 50, 4, 50);
  ctx.fillRect(lantX, groundY - 50, 14, 3);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(lantX + 10, groundY - 45, 8, 12);
  ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
  ctx.beginPath();
  ctx.arc(lantX + 14, groundY - 39, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 4. TEMPAT WISATA (Museum Wisata Pengetahuan & Sains Edukasi)
function drawTempatWisata(ctx: CanvasRenderingContext2D, x: number, groundY: number, animFrame: number) {
  if (x < -450 || x > 950) return;
  ctx.save();

  // Museum Complex Base & Cyan Cyber Pavers
  const bldgX = x + 30;
  const bldgW = 310;
  const bldgH = 160;
  const bldgY = groundY - bldgH;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(bldgX - 15, groundY - 12, bldgW + 30, 12);
  ctx.fillStyle = '#38bdf8';
  for (let pv = 0; pv < 10; pv++) {
    ctx.fillRect(bldgX - 10 + pv * 32, groundY - 4, 18, 3);
  }

  // Deep Navy Tech Facade
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(bldgX, bldgY + 30, bldgW, bldgH - 30);
  ctx.fillStyle = '#312e81';
  ctx.fillRect(bldgX + 10, bldgY + 40, bldgW - 20, bldgH - 50);

  // Large Panoramic Glass Curtain Walls with Interior Exhibits
  for (let gw = 0; gw < 4; gw++) {
    const gx = bldgX + 22 + gw * 70;
    const gy = bldgY + 50;
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(gx, gy, 56, 50);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(gx, gy, 56, 50);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gx + 28, gy);
    ctx.lineTo(gx + 28, gy + 50);
    ctx.moveTo(gx, gy + 25);
    ctx.lineTo(gx + 56, gy + 25);
    ctx.stroke();

    // Exhibits
    if (gw === 0) {
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(gx + 28, gy + 25, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (gw === 1) {
      ctx.fillStyle = '#fde047';
      ctx.fillRect(gx + 22, gy + 15, 12, 18);
    } else if (gw === 2) {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(gx + 28, gy + 25, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = '#10b981';
      ctx.fillRect(gx + 20, gy + 18, 16, 16);
    }
  }

  // Giant Planetarium Observatory Dome on Left
  const domeX = bldgX + 55;
  const domeY = bldgY + 30;
  const domeR = 50;
  const domeGrad = ctx.createRadialGradient(domeX - 15, domeY - 20, 10, domeX, domeY, domeR);
  domeGrad.addColorStop(0, '#e0f2fe');
  domeGrad.addColorStop(0.5, '#0284c7');
  domeGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = domeGrad;
  ctx.beginPath();
  ctx.arc(domeX, domeY, domeR, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(domeX, domeY, domeR, Math.PI, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(domeX, domeY, domeR * 0.65, Math.PI, 0);
  ctx.stroke();

  // Space Telescope Slot
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(domeX - 8, domeY - 50, 16, 35);
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(domeX, domeY - 50, 5, 0, Math.PI * 2);
  ctx.fill();

  // Rotating Satellite Dish Antenna on Right Roof
  const dishX = bldgX + bldgW - 45;
  const dishY = bldgY + 20;
  ctx.fillStyle = '#64748b';
  ctx.fillRect(dishX - 3, dishY, 6, 12);
  const dishAngle = Math.sin(animFrame * 0.5) * 0.3;
  ctx.save();
  ctx.translate(dishX, dishY);
  ctx.rotate(dishAngle);
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.arc(0, 0, 16, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -18);
  ctx.stroke();
  ctx.restore();

  // Grand Illuminated Cyber Arch & Neon Signboard
  const archX = bldgX + 110;
  const archW = 140;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(archX - 10, bldgY - 20, archW + 20, 36);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.strokeRect(archX - 10, bldgY - 20, archW + 20, 36);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('🏛️ MUSEUM WISATA SAINS', archX + 4, bldgY - 4);
  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 8px sans-serif';
  ctx.fillText('EDUKASI TEKNOLOGI & INFORMATIKA', archX + 1, bldgY + 9);

  // Automatic Glass Sliding Doors at Entrance
  const doorX = archX + archW / 2 - 25;
  const doorY = groundY - 55;
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(doorX, doorY, 50, 43);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(doorX + 3, doorY + 3, 20, 37);
  ctx.fillRect(doorX + 27, doorY + 3, 20, 37);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(doorX + 3, doorY + 3, 20, 37);
  ctx.strokeRect(doorX + 27, doorY + 3, 20, 37);

  // Iconic Science Lawn Monument: Animated Golden Atom Model Statue
  const atomX = x - 25;
  const atomY = groundY - 50;
  ctx.fillStyle = '#334155';
  ctx.fillRect(atomX - 15, groundY - 18, 30, 18);
  ctx.fillStyle = '#475569';
  ctx.fillRect(atomX - 12, groundY - 32, 24, 14);

  // Atom Nucleus
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(atomX, atomY, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
  ctx.beginPath();
  ctx.arc(atomX, atomY, 13, 0, Math.PI * 2);
  ctx.fill();

  // 3 Animated Rotating Electron Orbital Rings
  const orbitAngle = animFrame * 1.5;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  for (let o = 0; o < 3; o++) {
    ctx.save();
    ctx.translate(atomX, atomY);
    ctx.rotate((o * Math.PI) / 3 + orbitAngle * 0.3);
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 9, 0, 0, Math.PI * 2);
    ctx.stroke();
    const ePos = orbitAngle + o * 2;
    const ex = Math.cos(ePos) * 24;
    const ey = Math.sin(ePos) * 9;
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Futuristic Solar Lamp Post
  const lampX = bldgX + bldgW + 10;
  ctx.fillStyle = '#64748b';
  ctx.fillRect(lampX, groundY - 70, 5, 70);
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(lampX + 2.5, groundY - 72, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.beginPath();
  ctx.arc(lampX + 2.5, groundY - 72, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 5. ALUN-ALUN KOTA CIAMIS (Monumen Bunga Rafflesia & Taman Kota Ciamis)
function drawAlunAlunCiamis(ctx: CanvasRenderingContext2D, x: number, groundY: number, animFrame: number) {
  if (x < -500 || x > 950) return;
  ctx.save();

  // Alun-Alun Plaza Base & Patterned Stone Tiles
  const plazaX = x + 20;
  const plazaW = 340;
  ctx.fillStyle = '#334155';
  ctx.fillRect(plazaX - 20, groundY - 14, plazaW + 40, 14);
  ctx.fillStyle = '#0f172a';
  for (let tile = 0; tile < 12; tile++) {
    ctx.fillRect(plazaX - 15 + tile * 30, groundY - 5, 16, 4);
  }

  // Dual Grand Entrance Pillars with Priangan Batik Motif
  const pillarL = plazaX + 10;
  const pillarR = plazaX + plazaW - 40;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(pillarL, groundY - 120, 30, 120);
  ctx.fillRect(pillarR, groundY - 120, 30, 120);

  // Pillar Gold Tops & Base
  ctx.fillStyle = '#facc15';
  ctx.fillRect(pillarL - 4, groundY - 128, 38, 8);
  ctx.fillRect(pillarR - 4, groundY - 128, 38, 8);
  ctx.fillRect(pillarL - 2, groundY - 8, 34, 8);
  ctx.fillRect(pillarR - 2, groundY - 8, 34, 8);

  // Batik Gold Pattern Accent on Pillars
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 1.5;
  for (let py = groundY - 110; py < groundY - 20; py += 18) {
    ctx.strokeRect(pillarL + 6, py, 18, 12);
    ctx.strokeRect(pillarR + 6, py, 18, 12);
  }

  // Overhead Arch Signboard: "ALUN-ALUN KOTA CIAMIS"
  const archX = pillarL + 15;
  const archW = pillarR - pillarL;
  ctx.fillStyle = '#065f46';
  ctx.fillRect(archX - 10, groundY - 148, archW, 30);
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(archX - 10, groundY - 148, archW, 30);

  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('🏛️ ALUN-ALUN KOTA CIAMIS', archX + 18, groundY - 132);
  ctx.fillStyle = '#6ee7b7';
  ctx.font = 'bold 8px sans-serif';
  ctx.fillText('MONUMEN RAFFLESIA & TAMAN EDUTAINMENT CIAMIS', archX + 12, groundY - 121);

  // Animated Water Fountains on Left & Right Lawn
  const fountainL = plazaX + 55;
  const fountainR = plazaX + plazaW - 85;
  [fountainL, fountainR].forEach((fx, idx) => {
    // Basin
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.ellipse(fx, groundY - 8, 26, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Water Jets
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 2;
    for (let j = -2; j <= 2; j++) {
      const sprayH = 22 + Math.sin(animFrame * 4 + j + idx) * 5;
      ctx.beginPath();
      ctx.moveTo(fx, groundY - 8);
      ctx.quadraticCurveTo(fx + j * 6, groundY - 8 - sprayH, fx + j * 10, groundY - 8);
      ctx.stroke();
    }
  });

  // Centerpiece Monument: Giant Rafflesia Arnoldii Flower Statue
  const monX = plazaX + plazaW / 2;
  const monY = groundY - 24;

  // Octagonal Pedestal Base
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.moveTo(monX - 45, groundY);
  ctx.lineTo(monX - 35, monY);
  ctx.lineTo(monX + 35, monY);
  ctx.lineTo(monX + 45, groundY);
  ctx.closePath();
  ctx.fill();

  // Pedestal Plaque
  ctx.fillStyle = '#b45309';
  ctx.fillRect(monX - 30, monY + 6, 60, 12);
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 1;
  ctx.strokeRect(monX - 30, monY + 6, 60, 12);
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 6.5px sans-serif';
  ctx.fillText('BUNGA RAFFLESIA', monX - 26, monY + 14);

  // GIANT RAFFLESIA FLOWER STATUE
  const flowerY = monY - 35;

  // 5 Large Mottled Red Petals
  ctx.save();
  ctx.translate(monX, flowerY);
  const petalColor = '#be123c';
  const spotColor = '#fecdd3';

  for (let p = 0; p < 5; p++) {
    const angle = (p * Math.PI * 2) / 5 - Math.PI / 2;
    ctx.save();
    ctx.rotate(angle);

    // Petal Body
    ctx.fillStyle = petalColor;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-22, -32, 0, -42);
    ctx.quadraticCurveTo(22, -32, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#881337';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // White/Pink Mottled Spots on Petal
    ctx.fillStyle = spotColor;
    ctx.beginPath();
    ctx.arc(0, -26, 4, 0, Math.PI * 2);
    ctx.arc(-8, -18, 3, 0, Math.PI * 2);
    ctx.arc(7, -18, 3.5, 0, Math.PI * 2);
    ctx.arc(-4, -34, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Central Cup / Disc
  ctx.fillStyle = '#9f1239';
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fda4af';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Central Opening Deep Well
  ctx.fillStyle = '#4c0519';
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();

  // Golden Spikes / Stamens inside Cup
  ctx.fillStyle = '#facc15';
  for (let s = 0; s < 6; s++) {
    const sAngle = (s * Math.PI * 2) / 6;
    ctx.beginPath();
    ctx.arc(Math.cos(sAngle) * 6, Math.sin(sAngle) * 6, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Garden Shrubs around Monument
  ctx.fillStyle = '#15803d';
  for (let sh = 0; sh < 6; sh++) {
    ctx.beginPath();
    ctx.arc(monX - 40 + sh * 16, groundY - 4, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function PetualanganSMPGame({ isAdmin, currentStudent, studentStageHighScores, onClose }: { isAdmin: boolean; currentStudent: any; studentStageHighScores?: Record<number, number>; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const poseImagesRef = useRef<(ProcessedSprite | null)[]>(
    PLAYER_POSE_PATHS.map((p) => PROCESSED_SPRITE_CACHE.get(p) ?? null)
  );
  const bossImagesRef = useRef<(ProcessedSprite | null)[]>(
    BOSS1_POSE_PATHS.map((p) => PROCESSED_SPRITE_CACHE.get(p) ?? null)
  );
  const boss2ImagesRef = useRef<(ProcessedSprite | null)[]>(
    BOSS2_POSE_PATHS.map((p) => PROCESSED_SPRITE_CACHE.get(p) ?? null)
  );

  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | 4>(1);
  const [posesLoadedCount, setPosesLoadedCount] = useState<number>(() =>
    PLAYER_POSE_PATHS.filter((p) => PROCESSED_SPRITE_CACHE.has(p)).length
  );

  // Load 8 main character poses immediately with high priority (or restore instantly from cache)
  useEffect(() => {
    let cancelled = false;
    let readyCount = 0;

    PLAYER_POSE_PATHS.forEach((path, idx) => {
      const cached = PROCESSED_SPRITE_CACHE.get(path);
      if (cached) {
        poseImagesRef.current[idx] = cached;
        readyCount += 1;
        return;
      }
      void loadProcessedSprite(path, 200, true).then((sprite) => {
        if (cancelled) return;
        poseImagesRef.current[idx] = sprite;
        setPosesLoadedCount(
          PLAYER_POSE_PATHS.filter((_, i) => poseImagesRef.current[i] !== null).length
        );
      });
    });

    if (readyCount > 0) {
      setPosesLoadedCount(readyCount);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  // Lazy-load boss sprites only for the active stage (Stage 1 or Stage 2)
  useEffect(() => {
    let cancelled = false;
    if (currentStage === 1) {
      BOSS1_POSE_PATHS.forEach((path, idx) => {
        const cached = PROCESSED_SPRITE_CACHE.get(path);
        if (cached) {
          bossImagesRef.current[idx] = cached;
          return;
        }
        void loadProcessedSprite(path, 280, false).then((sprite) => {
          if (!cancelled) bossImagesRef.current[idx] = sprite;
        });
      });
    } else if (currentStage === 2) {
      BOSS2_POSE_PATHS.forEach((path, idx) => {
        const cached = PROCESSED_SPRITE_CACHE.get(path);
        if (cached) {
          boss2ImagesRef.current[idx] = cached;
          return;
        }
        void loadProcessedSprite(path, 280, false).then((sprite) => {
          if (!cancelled) boss2ImagesRef.current[idx] = sprite;
        });
      });
    }

    return () => {
      cancelled = true;
    };
  }, [currentStage]);

  const [gameState, setGameState] = useState<'start' | 'playing' | 'win' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const livesRef = useRef(lives);
  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);
  const [distanceRemaining, setDistanceRemaining] = useState(175);
  const [superPowerActive, setSuperPowerActive] = useState(false);
  const [bossBulletsCount, setBossBulletsCount] = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      const coarse = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : false;
      const hasTouch = typeof window !== 'undefined' && ('ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0);
      setIsTouchDevice(coarse || hasTouch);
    };
    checkTouch();

    const onFirstTouch = () => setIsTouchDevice(true);
    window.addEventListener('touchstart', onFirstTouch, { passive: true, once: true });

    const mediaQuery = window.matchMedia ? window.matchMedia('(pointer: coarse)') : null;
    if (mediaQuery && mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', checkTouch);
    }

    return () => {
      window.removeEventListener('touchstart', onFirstTouch);
      if (mediaQuery && mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', checkTouch);
      }
    };
  }, []);

  const gameContainerRef = useRef<HTMLDivElement | null>(null);
  const usedQuizQuestionIndicesRef = useRef<Set<number>>(new Set());

  // Firestore Config for Stage Materi
  const [stageConfigs, setStageConfigs] = useState<{ stage1MateriId?: string; stage2MateriId?: string; stage3MateriId?: string; stage4MateriId?: string }>({});
  const [completedStages, setCompletedStages] = useState<number[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'game_configs', 'petualangan-smp'), (snapshot) => {
      if (snapshot.exists()) {
        setStageConfigs(snapshot.data() as any);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentStudent) return;
    const unsub = onSnapshot(doc(db, 'student_progress', currentStudent.id), (snapshot) => {
      if (snapshot.exists()) {
        setCompletedStages(snapshot.data().completedStages || []);
      }
    });
    return () => unsub();
  }, [currentStudent]);

  const getActiveMateriIdForStage = (stageNum: number) => {
    if (stageNum === 1) return stageConfigs.stage1MateriId || 'bk-dekomposisi';
    if (stageNum === 2) return stageConfigs.stage2MateriId || 'bk-pengenalan-pola';
    if (stageNum === 3) return stageConfigs.stage3MateriId || 'scratch';
    return stageConfigs.stage4MateriId || 'bk-algoritma';
  };

  const currentMateriId = getActiveMateriIdForStage(currentStage);
  const activeCourseObj = COURSES.find(c => c.id === currentMateriId);
  const stageQuizzes = getQuizForMateri(currentMateriId);

  // Master Reward Pool Definitions
  const MASTER_REWARDS = [
    {
      type: 'heart' as const,
      title: '+1 Nyawa',
      desc: 'Tambah 1 hati',
      icon: '💖',
      bg: 'from-slate-800 to-rose-950/80 hover:to-rose-900 border-rose-500/50 hover:border-rose-400',
      iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/40'
    },
    {
      type: 'keyboard_gun' as const,
      title: 'Pistol Keyboard',
      desc: 'Tembak (15 dtk)',
      icon: '⌨️',
      bg: 'from-slate-800 to-sky-950/80 hover:to-sky-900 border-sky-500/50 hover:border-sky-400',
      iconBg: 'bg-sky-500/20 text-sky-400 border-sky-500/40'
    },
    {
      type: 'power' as const,
      title: 'Super Kuat',
      desc: 'Kebal 7.5 dtk',
      icon: '⚡',
      bg: 'from-slate-800 to-amber-950/80 hover:to-amber-900 border-amber-500/50 hover:border-amber-400',
      iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40'
    },
    {
      type: 'score' as const,
      title: '+250 Poin',
      desc: 'Bonus poin',
      icon: '⭐',
      bg: 'from-slate-800 to-emerald-950/80 hover:to-emerald-900 border-emerald-500/50 hover:border-emerald-400',
      iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
    }
  ];

  // Dynamic reward items offered to player (1, 2, or 3 items)
  const [availableRewards, setAvailableRewards] = useState<typeof MASTER_REWARDS>([]);

  // Mystery Box Quiz State
  const [activeQuiz, setActiveQuiz] = useState<{
    id: number;
    question: string;
    options: string[];
    correctIdx: number;
    explanation: string;
  } | null>(null);

  const [quizFeedback, setQuizFeedback] = useState<{ msg: string; isCorrect: boolean } | null>(null);
  const [showRewardPicker, setShowRewardPicker] = useState(false);
  const [selectedRewardMsg, setSelectedRewardMsg] = useState<string | null>(null);
  const [keyboardGunActive, setKeyboardGunActive] = useState(false);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(0);

  const handlePickReward = React.useCallback((rewardType: 'heart' | 'power' | 'score' | 'keyboard_gun') => {
    if (rewardType === 'heart') {
      setLives(l => l + 1);
      setSelectedRewardMsg("💖 Hati bertambah! (+1 Nyawa Berhasil Didapatkan)");
    } else if (rewardType === 'power') {
      if (engineRef.current?.player) {
        engineRef.current.player.superPowerFrames = 450; // ~7.5 seconds of super power
      }
      setSuperPowerActive(true);
      setSelectedRewardMsg("⚡ Super Kuat Diaktifkan! Kebal rintangan & musuh selama 7.5 detik!");
    } else if (rewardType === 'keyboard_gun') {
      if (engineRef.current?.player) {
        engineRef.current.player.keyboardGunFrames = (engineRef.current.player.keyboardGunFrames || 0) + 900; // Stack +15 seconds
      }
      setKeyboardGunActive(true);
      setSelectedRewardMsg("⌨️ Pistol Keyboard Diaktifkan & Di-Stack (+15 Detik)! Tekan [Z] atau tombol Tembak!");
    } else if (rewardType === 'score') {
      setScore(s => s + 250);
      setSelectedRewardMsg("⭐ Bonus +250 Poin Ekstra Berhasil Ditambahkan!");
    }

    setTimeout(() => {
      setActiveQuiz(null);
      setQuizFeedback(null);
      setShowRewardPicker(false);
      setSelectedRewardMsg(null);
    }, 1800);
  }, []);

  const handleQuizAnswer = React.useCallback((selectedIdx: number) => {
    if (!activeQuiz) return;
    const isCorrect = selectedIdx === activeQuiz.correctIdx;

    if (isCorrect) {
      setScore(s => s + 100);
      setQuizFeedback({
        msg: "🎉 JAWABAN BENAR! Silakan pilih Hadiah Spesial untuk membantu petualanganmu!",
        isCorrect: true
      });

      // Sample 1, 2, or 3 random rewards from MASTER_REWARDS
      const rewardCount = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3 items
      const shuffled = [...MASTER_REWARDS].sort(() => Math.random() - 0.5);
      const chosenRewards = shuffled.slice(0, rewardCount);
      setAvailableRewards(chosenRewards);

      setShowRewardPicker(true);
    } else {
      setQuizFeedback({
        msg: "❌ Jawaban kurang tepat! Tetap semangat, coba temukan Kotak Emas berikutnya!",
        isCorrect: false
      });
      setTimeout(() => {
        setActiveQuiz(null);
        setQuizFeedback(null);
        setShowRewardPicker(false);
        setSelectedRewardMsg(null);
      }, 2200);
    }
  }, [activeQuiz, MASTER_REWARDS]);

  // Keyboard navigation for active quiz
  useEffect(() => {
    if (!activeQuiz || quizFeedback) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedOptionIdx(prev => (prev > 0 ? prev - 1 : activeQuiz.options.length - 1));
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedOptionIdx(prev => (prev < activeQuiz.options.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleQuizAnswer(selectedOptionIdx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeQuiz, quizFeedback, selectedOptionIdx, handleQuizAnswer]);

  useEffect(() => {
    if (activeQuiz) {
      setSelectedOptionIdx(0);
    }
  }, [activeQuiz]);

  const keysRef = useRef<{ left: boolean; right: boolean; jump: boolean; shoot: boolean }>({ left: false, right: false, jump: false, shoot: false });
  const inputMetaRef = useRef<{
    lastHoriz: 'left' | 'right' | null;
    jumpBufferFrames: number;
    shootBufferFrames: number;
    coyoteFrames: number;
  }>({
    lastHoriz: null,
    jumpBufferFrames: 0,
    shootBufferFrames: 0,
    coyoteFrames: 0,
  });
  const lastDistanceRef = useRef<number>(-1);
  const canvasSizeRef = useRef<{ width: number; height: number }>({ width: 800, height: 450 });

  const engineRef = useRef(generateStageEngine(currentStage));
  const fxParticlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; size: number; color: string; life: number; maxLife: number }>>([]);
  const fxPopupsRef = useRef<Array<{ x: number; y: number; text: string; color: string; life: number }>>([]);

  const resetEngineForStage = (stageNum: number) => {
    engineRef.current = generateStageEngine(stageNum);
    fxParticlesRef.current = [];
    fxPopupsRef.current = [];
    lastDistanceRef.current = -1;
  };

  const toggleFullScreen = () => {
    if (!gameContainerRef.current) return;
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().then(() => {
        setIsFullScreen(true);
      }).catch(err => {
        console.error("Fullscreen request failed", err);
        setIsFullScreen(prev => !prev);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullScreen(false);
      }).catch(err => {
        setIsFullScreen(false);
      });
    }
  };

  const resetKeys = () => {
    keysRef.current = { left: false, right: false, jump: false, shoot: false };
    inputMetaRef.current = { lastHoriz: null, jumpBufferFrames: 0, shootBufferFrames: 0, coyoteFrames: 0 };
  };

  const setControlState = (control: 'left' | 'right' | 'jump' | 'shoot', active: boolean) => {
    const prev = keysRef.current[control];
    keysRef.current[control] = active;
    if (control === 'left') {
      if (active && !prev) {
        inputMetaRef.current.lastHoriz = 'left';
      } else if (!active && inputMetaRef.current.lastHoriz === 'left') {
        inputMetaRef.current.lastHoriz = keysRef.current.right ? 'right' : null;
      }
    } else if (control === 'right') {
      if (active && !prev) {
        inputMetaRef.current.lastHoriz = 'right';
      } else if (!active && inputMetaRef.current.lastHoriz === 'right') {
        inputMetaRef.current.lastHoriz = keysRef.current.left ? 'left' : null;
      }
    } else if (control === 'jump') {
      if (active && !prev) {
        inputMetaRef.current.jumpBufferFrames = 10;
      }
    } else if (control === 'shoot') {
      if (active && !prev) {
        inputMetaRef.current.shootBufferFrames = 8;
      }
    }
  };

  const startGame = (stageNum: number = currentStage) => {
    resetKeys();
    setCurrentStage(stageNum as any);
    resetEngineForStage(stageNum);
    setScore(s => (gameState === 'win' ? s : 0)); // accumulate score across stages or start fresh
    setLives(3);
    const initialDist = stageNum === 1 ? 175 : stageNum === 2 ? 190 : stageNum === 3 ? 200 : 220;
    lastDistanceRef.current = initialDist;
    setDistanceRemaining(initialDist);
    setActiveQuiz(null);
    setQuizFeedback(null);
    setShowRewardPicker(false);
    setSelectedRewardMsg(null);
    setSuperPowerActive(false);
    setKeyboardGunActive(false);
    setBossBulletsCount(0);
    setGameState('playing');
  };

  const startBossFightStage1 = () => {
    resetKeys();
    setCurrentStage(1);
    resetEngineForStage(1);
    setScore(0);
    setLives(3);
    setDistanceRemaining(30);
    setActiveQuiz(null);
    setQuizFeedback(null);
    setShowRewardPicker(false);
    setSelectedRewardMsg(null);
    setSuperPowerActive(false);
    setKeyboardGunActive(false);
    setBossBulletsCount(0);
    
    // Position player just before boss area
    engineRef.current.player.x = 5350;
    engineRef.current.cameraX = 5350 - 300;
    
    setGameState('playing');
  };

  const startBossFightStage2 = () => {
    resetKeys();
    setCurrentStage(2);
    resetEngineForStage(2);
    setScore(0);
    setLives(3);
    setDistanceRemaining(30);
    setActiveQuiz(null);
    setQuizFeedback(null);
    setShowRewardPicker(false);
    setSelectedRewardMsg(null);
    setSuperPowerActive(false);
    setKeyboardGunActive(false);
    setBossBulletsCount(0);
    
    // Position player just before boss area (4900)
    engineRef.current.player.x = 4850;
    engineRef.current.cameraX = 4850 - 300;
    
    setGameState('playing');
  };

  const saveFinalScore = async (finalScore: number, didWin: boolean = false) => {
    if (!currentStudent && !isAdmin) return;
    const studentId = currentStudent?.id || 'admin-preview';
    const stageTitle = `Petualangan Ke Sekolah (Stage ${currentStage})`;
    try {
      if (finalScore > 0) {
        const existingSnap = await getDocs(
          query(
            collection(db, 'game_scores'),
            where('studentId', '==', studentId),
            where('gameId', '==', 'petualangan-smp')
          )
        );
        let prevBest = 0;
        existingSnap.docs.forEach(d => {
          const data = d.data();
          if (data.gameTitle === stageTitle && (data.score || 0) > prevBest) {
            prevBest = data.score || 0;
          }
        });

        if (finalScore > prevBest) {
          const docId = `${studentId}_petualangan-smp_stage-${currentStage}`;
          const nowIso = new Date().toISOString();
          const studentKelas = currentStudent?.kelas || 'Admin';
          await setDoc(doc(db, 'game_scores', docId), {
            gameId: 'petualangan-smp',
            gameTitle: stageTitle,
            stage: currentStage,
            studentId,
            studentName: currentStudent?.nama || 'Admin Pratinjau',
            studentNis: currentStudent?.nis || '-',
            studentKelas,
            kelas: studentKelas,
            score: finalScore,
            playedAt: nowIso,
            timestamp: nowIso
          });
        }
      }

      if (didWin && currentStudent) {
        await setDoc(doc(db, 'student_progress', currentStudent.id), {
          completedStages: arrayUnion(currentStage)
        }, { merge: true });
      }
    } catch (e) {
      console.error("Failed saving score", e);
    }
  };

  // Helper function to trigger non-repeating quiz selection
  const triggerMysteryBoxQuiz = () => {
    if (stageQuizzes.length === 0) return;

    // Filter available indices not used yet
    let availableIndices = stageQuizzes
      .map((_, idx) => idx)
      .filter(idx => !usedQuizQuestionIndicesRef.current.has(idx));

    // If all questions were used, clear the tracking set to refresh pool
    if (availableIndices.length === 0) {
      usedQuizQuestionIndicesRef.current.clear();
      availableIndices = stageQuizzes.map((_, idx) => idx);
    }

    const randomChosenIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    usedQuizQuestionIndicesRef.current.add(randomChosenIndex);
    setActiveQuiz(stageQuizzes[randomChosenIndex]);
  };



  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }

      const code = e.code;
      const key = e.key;
      const isLeft = code === 'ArrowLeft' || code === 'KeyA' || key === 'ArrowLeft' || key === 'a' || key === 'A';
      const isRight = code === 'ArrowRight' || code === 'KeyD' || key === 'ArrowRight' || key === 'd' || key === 'D';
      const isJump = code === 'ArrowUp' || code === 'KeyW' || code === 'Space' || key === 'ArrowUp' || key === 'w' || key === 'W' || key === ' ';
      const isShoot = code === 'KeyZ' || code === 'KeyJ' || code === 'KeyX' || key === 'z' || key === 'Z' || key === 'j' || key === 'J' || key === 'x' || key === 'X';

      if (isLeft || isRight || isJump || isShoot || code === 'ArrowDown' || key === 'ArrowDown') {
        e.preventDefault();
        if (document.activeElement instanceof HTMLButtonElement) {
          document.activeElement.blur();
        }
      }

      if (isLeft) setControlState('left', true);
      if (isRight) setControlState('right', true);
      if (isJump && !e.repeat) setControlState('jump', true);
      if (isShoot) setControlState('shoot', true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      const key = e.key;
      if (code === 'ArrowLeft' || code === 'KeyA' || key === 'ArrowLeft' || key === 'a' || key === 'A') {
        setControlState('left', false);
      }
      if (code === 'ArrowRight' || code === 'KeyD' || key === 'ArrowRight' || key === 'd' || key === 'D') {
        setControlState('right', false);
      }
      if (code === 'ArrowUp' || code === 'KeyW' || code === 'Space' || key === 'ArrowUp' || key === 'w' || key === 'W' || key === ' ') {
        setControlState('jump', false);
      }
      if (code === 'KeyZ' || code === 'KeyJ' || code === 'KeyX' || key === 'z' || key === 'Z' || key === 'j' || key === 'J' || key === 'x' || key === 'X') {
        setControlState('shoot', false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) resetKeys();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', resetKeys);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', resetKeys);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (gameState !== 'playing' || activeQuiz !== null) {
      resetKeys();
    }
  }, [gameState, activeQuiz]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const syncSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(800, Math.floor((canvas.clientWidth || 800) * dpr));
      const h = Math.max(450, Math.floor((canvas.clientHeight || 450) * dpr));
      canvasSizeRef.current = { width: w, height: h };
    };
    syncSize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncSize) : null;
    ro?.observe(canvas);
    window.addEventListener('resize', syncSize);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', syncSize);
    };
  }, [isFullScreen, gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const engine = engineRef.current;
    const STEP_MS = 1000 / 60;
    let lastTime = performance.now();
    let accumulator = 0;

    const isSpriteReady = (img: HTMLCanvasElement | HTMLImageElement | null | undefined): img is HTMLCanvasElement | HTMLImageElement => {
      if (!img) return false;
      if (img instanceof HTMLCanvasElement) return true;
      return img.complete && (img.naturalWidth || img.width) > 0;
    };

    const stepPhysics = (): boolean => {
      const p = engine.player;
      const meta = inputMetaRef.current;
      p.animFrame += 0.08;
      if (meta.jumpBufferFrames > 0) meta.jumpBufferFrames--;
      if (meta.shootBufferFrames > 0) meta.shootBufferFrames--;
      if (p.isGrounded) {
        meta.coyoteFrames = 8;
      } else if (meta.coyoteFrames > 0) {
        meta.coyoteFrames--;
      }

      // Update super power state
      if (p.superPowerFrames > 0) {
        p.superPowerFrames--;
        if (p.superPowerFrames === 0) {
          setSuperPowerActive(false);
        }
      }

      // Update keyboard gun timer state (15 sec = 900 frames)
      if (p.keyboardGunFrames > 0) {
        p.keyboardGunFrames--;
        if (p.keyboardGunFrames === 0) {
          setKeyboardGunActive(false);
        }
      }

      const spawnFxSparks = (x: number, y: number, color: string, count = 8, speed = 3.2) => {
        for (let s = 0; s < count; s++) {
          const ang = (Math.PI * 2 * s) / count + (Math.random() - 0.5) * 0.5;
          const spd = 1.2 + Math.random() * speed;
          fxParticlesRef.current.push({
            x,
            y,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd - 0.9,
            size: 2.2 + Math.random() * 2.5,
            color: s % 2 === 0 ? '#fef08a' : color,
            life: 18 + Math.floor(Math.random() * 10),
            maxLife: 28,
          });
        }
      };

      const spawnFxPopup = (x: number, y: number, text: string, color = '#fde047') => {
        fxPopupsRef.current.push({ x, y, text, color, life: 40 });
      };

      const isFrozen = (currentStage === 1 || currentStage === 2) && engine.boss && engine.boss.countdown > 0;
      // Fire keyboard gun bullet when shoot key, tap buffer, or button is active
      if ((keysRef.current.shoot || meta.shootBufferFrames > 0) && (p.keyboardGunFrames > 0 || (p.bulletsLeft && p.bulletsLeft > 0)) && !isFrozen) {
        if (!p.shootCooldown || p.shootCooldown <= 0) {
          meta.shootBufferFrames = 0;
          p.shootCooldown = 12; // Throttle rate of fire (~0.2s)
          const bulletVx = p.direction === 'right' ? 14 : -14;
          const bulletX = p.direction === 'right' ? p.x + p.width - 8 : p.x - 18;
          const bulletY = p.y + 28; // Aligned to enlarged character's weapon/chest height (hits monsters & boss cleanly)
          engine.bullets.push({
            x: bulletX,
            y: bulletY,
            vx: bulletVx,
            w: 26,
            h: 18
          });
          spawnFxSparks(p.direction === 'right' ? bulletX + 18 : bulletX + 4, bulletY + 9, '#38bdf8', 5, 2.2);
          if (p.keyboardGunFrames <= 0 && p.bulletsLeft && p.bulletsLeft > 0) {
            p.bulletsLeft--;
            setBossBulletsCount(p.bulletsLeft);
          }
        }
      }

      if (p.shootCooldown && p.shootCooldown > 0) {
        p.shootCooldown--;
      }

      // Update bullets and handle collision with monsters
      for (let bIdx = engine.bullets.length - 1; bIdx >= 0; bIdx--) {
        const b = engine.bullets[bIdx];
        b.x += b.vx;

        // Despawn offscreen bullets
        if (b.x < engine.cameraX - 100 || b.x > engine.cameraX + 900) {
          engine.bullets.splice(bIdx, 1);
          continue;
        }

        let bulletRemoved = false;

        // Bullet vs Boss Laser / Projectile (Counter Attack)
        if ((currentStage === 1 || currentStage === 2) && engine.boss && engine.boss.state !== 'dead') {
           const boss = engine.boss;
           for (let lIdx = boss.lasers.length - 1; lIdx >= 0; lIdx--) {
              const l = boss.lasers[lIdx];
              if (
                b.x < l.x + l.w &&
                b.x + b.w > l.x &&
                b.y < l.y + l.h &&
                b.y + b.h > l.y
              ) {
                spawnFxSparks(l.x + l.w / 2, l.y + l.h / 2, '#60a5fa', 10, 3.5);
                boss.lasers.splice(lIdx, 1);
                engine.bullets.splice(bIdx, 1);
                bulletRemoved = true;
                break;
              }
           }
        }

        if (bulletRemoved) continue;

        // Bullet vs Boss hit
        if ((currentStage === 1 || currentStage === 2) && engine.boss && engine.boss.state !== 'dead' && engine.boss.state !== 'dying' && (!engine.boss.countdown || engine.boss.countdown <= 0)) {
           const boss = engine.boss;
           const bossTopY = boss.y - 45;
           if (
             b.x < boss.x + boss.w &&
             b.x + b.w > boss.x &&
             b.y < boss.y + boss.h &&
             b.y + b.h > bossTopY
           ) {
              boss.hp = Math.max(0, boss.hp - 1);
              boss.invulnerableFrames = 15;
              spawnFxSparks(b.x + b.w / 2, b.y + b.h / 2, '#f97316', 12, 4);
              spawnFxPopup(boss.x + boss.w / 2, boss.y - 24, '💥 HIT!', '#fb923c');
              engine.bullets.splice(bIdx, 1);
              if (boss.hp <= 0) {
                boss.state = 'dying';
                boss.stateTimer = 90;
                setScore(s => s + 2000);
                spawnFxPopup(boss.x + boss.w / 2, boss.y - 50, '+2000 BOSS!', '#4ade80');
              }
              continue;
           }
        }

        // Bullet vs Obstacle / Monster Collision
        for (const obs of engine.obstacles) {
          if (obs.destroyed) continue;
          if (
            b.x + b.w > obs.x &&
            b.x < obs.x + obs.w &&
            b.y + b.h > obs.y &&
            b.y < obs.y + obs.h
          ) {
            obs.destroyed = true;
            setScore(s => s + 150);
            spawnFxSparks(obs.x + obs.w / 2, obs.y + obs.h / 2, '#ef4444', 12, 3.8);
            spawnFxPopup(obs.x + obs.w / 2, obs.y - 10, '+150', '#fde047');
            engine.bullets.splice(bIdx, 1);
            break;
          }
        }
      }

      const moveSpeed = p.superPowerFrames > 0 ? 6.5 : 4.5;

      if (!isFrozen) {
        let desiredDir: 'left' | 'right' | null = null;
        if (keysRef.current.left && keysRef.current.right) {
          desiredDir = meta.lastHoriz || 'right';
        } else if (keysRef.current.left) {
          desiredDir = 'left';
        } else if (keysRef.current.right) {
          desiredDir = 'right';
        }

        if (desiredDir === 'left') {
          p.vx = -moveSpeed;
          p.direction = 'left';
        } else if (desiredDir === 'right') {
          p.vx = moveSpeed;
          p.direction = 'right';
        } else {
          p.vx *= p.isGrounded ? 0.55 : 0.85;
          if (Math.abs(p.vx) < 0.2) p.vx = 0;
        }

        if ((keysRef.current.jump || meta.jumpBufferFrames > 0) && (p.isGrounded || meta.coyoteFrames > 0)) {
          p.vy = p.superPowerFrames > 0 ? -14 : -12.5;
          p.isGrounded = false;
          meta.coyoteFrames = 0;
          meta.jumpBufferFrames = 0;
          spawnFxSparks(p.x + p.width / 2, p.y + p.height, '#cbd5e1', 6, 1.8);
        }

        // Responsive short-hop control when releasing jump key early while ascending
        if (!keysRef.current.jump && p.vy < -5.5) {
          p.vy *= 0.86;
        }
      } else {
        p.vx = 0;
      }

      p.vy += 0.65;
      if (p.vy > 12) p.vy = 12;

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = 0;
      if (p.x > engine.worldWidth - p.width) p.x = engine.worldWidth - p.width;

      if (p.invulnerableFrames > 0) p.invulnerableFrames--;

      p.isGrounded = false;
      const footLeft = p.x + 8;
      const footRight = p.x + p.width - 8;
      const prevBottom = p.y + p.height - p.vy;
      for (const plat of engine.platforms) {
        if (
          footRight > plat.x &&
          footLeft < plat.x + plat.w &&
          p.y + p.height >= plat.y &&
          prevBottom <= plat.y + 8 &&
          p.y + p.height <= plat.y + Math.max(12, p.vy + 4) &&
          p.vy >= 0
        ) {
          p.y = plat.y - p.height;
          p.vy = 0;
          p.isGrounded = true;
        }
      }

      // Running footstep dust puffs on ground
      if (p.isGrounded && Math.abs(p.vx) > 1.8 && Math.floor(p.animFrame * 12) % 6 === 0 && fxParticlesRef.current.length < 120) {
        fxParticlesRef.current.push({
          x: p.x + (p.direction === 'right' ? 8 : p.width - 8),
          y: p.y + p.height - 2,
          vx: (p.direction === 'right' ? -1 : 1) * (0.7 + Math.random() * 0.8),
          vy: -(0.3 + Math.random() * 0.7),
          size: 3,
          color: 'rgba(226, 232, 240, 0.7)',
          life: 14,
          maxLife: 14,
        });
      }

      if (p.y > 480) {
        setLives(l => {
          const next = l - 1;
          if (next <= 0) {
            setGameState('gameover');
            saveFinalScore(score);
          } else {
            const safeGround = [...engine.platforms]
              .reverse()
              .find((pl) => pl.type === 'ground' && pl.x <= p.x);
            if (safeGround) {
              p.x = Math.max(safeGround.x + 20, Math.min(p.x - 160, safeGround.x + safeGround.w - p.width - 20));
            } else {
              p.x = 100;
            }
            p.y = 200;
            p.vy = 0;
            p.invulnerableFrames = 60;
          }
          return next;
        });
      }

      // Item Collisions
      for (const item of engine.items) {
        if (!item.collected) {
          if (
            p.x + p.width > item.x &&
            p.x < item.x + item.w &&
            p.y + p.height > item.y &&
            p.y < item.y + item.h
          ) {
            item.collected = true;
            if (item.type === 'ram') {
              setScore(s => s + 100);
              spawnFxSparks(item.x + item.w / 2, item.y + item.h / 2, '#4ade80', 10, 2.8);
              spawnFxPopup(item.x + item.w / 2, item.y - 8, '+100 RAM', '#4ade80');
            } else if (item.type === 'laptop') {
              setScore(s => s + 50);
              spawnFxSparks(item.x + item.w / 2, item.y + item.h / 2, '#38bdf8', 8, 2.5);
              spawnFxPopup(item.x + item.w / 2, item.y - 8, '+50 💻', '#38bdf8');
            } else if (item.type === 'mystery_box') {
              spawnFxSparks(item.x + item.w / 2, item.y + item.h / 2, '#facc15', 14, 3.4);
              triggerMysteryBoxQuiz();
            } else if ((item as any).type === 'boss_keyboard' || (item as any).type === 'ammo') {
              const ammoGain = (item as any).amount ?? [3, 4, 5][Math.floor(Math.random() * 3)];
              p.bulletsLeft = (p.bulletsLeft || 0) + ammoGain;
              setBossBulletsCount(p.bulletsLeft);
              spawnFxSparks(item.x + item.w / 2, item.y + item.h / 2, '#38bdf8', 10, 2.8);
              spawnFxPopup(item.x + item.w / 2, item.y - 10, `+${ammoGain} PELURU ⌨️`, '#38bdf8');
            } else if ((item as any).type === 'boss_hp') {
              const hpGain = (item as any).amount ?? [1, 2, 3, 4][Math.floor(Math.random() * 4)];
              setLives(l => {
                const updated = Math.min(8, l + hpGain);
                livesRef.current = updated;
                return updated;
              });
              spawnFxSparks(item.x + item.w / 2, item.y + item.h / 2, '#fb7185', 12, 3);
              spawnFxPopup(item.x + item.w / 2, item.y - 10, `❤️ +${hpGain} HP!`, '#fb7185');
            }
          }
        }
      }

      // Obstacle Collisions
      for (const obs of engine.obstacles) {
        if (obs.destroyed) continue;

        if (['computer_evil', 'phone_evil', 'keyboard_evil'].includes(obs.type)) {
          obs.x += obs.vx;
          if (obs.x <= obs.minX || obs.x + obs.w >= obs.maxX) {
            obs.vx = -obs.vx;
          }
        } else if (obs.type === 'homework') {
          obs.y += (obs.vy || 2) * (obs.yDir || 1);
          if (obs.y <= (obs.minY || 150) || obs.y + obs.h >= (obs.maxY || 330)) {
            obs.yDir = -(obs.yDir || 1);
          }
        }

        if (
          p.x + p.width - 8 > obs.x + 4 &&
          p.x + 8 < obs.x + obs.w - 4 &&
          p.y + p.height > obs.y + 4 &&
          p.y + 8 < obs.y + obs.h
        ) {
          // If player has Super Power (Kuat)
          if (p.superPowerFrames > 0) {
            obs.destroyed = true;
            setScore(s => s + 100);
          } else if (p.invulnerableFrames === 0) {
            p.invulnerableFrames = 60;
            p.vy = -6;
            p.vx = p.direction === 'right' ? -5 : 5;
            setLives(l => {
              const next = l - 1;
              if (next <= 0) {
                setGameState('gameover');
                saveFinalScore(score);
              }
              return next;
            });
          }
        }
      }

      const remainingMeters = Math.max(0, Math.floor((engine.schoolGateX - p.x) / 30));
      if (remainingMeters !== lastDistanceRef.current) {
        lastDistanceRef.current = remainingMeters;
        setDistanceRemaining(remainingMeters);
      }

      // Boss Logic (Stage 1 & Stage 2)
      if ((currentStage === 1 || currentStage === 2) && engine.boss) {
        const boss = engine.boss;
        if (boss.invulnerableFrames > 0) boss.invulnerableFrames--;
        const bossAreaX = currentStage === 2 ? 4900 : 5400;

        // Activation and Forced Position logic: move player left, boss right
        if (p.x > bossAreaX && !boss.fightStarted && boss.state !== 'dead') {
           p.x = bossAreaX + 60;
           p.y = 380 - p.height;
           p.vx = 0;
           p.vy = 0;
           p.isGrounded = true;
           p.direction = 'right';
           boss.x = bossAreaX + 680;
           boss.y = 280;
           boss.vy = 0;
           boss.fightStarted = true;
           boss.countdown = 300; // 5 seconds (60fps)
           boss.state = 'idle';
           boss.jumpPhase = 'none';
           boss.itemDropTimer = [180, 240, 300, 360][Math.floor(Math.random() * 4)];
           (boss as any).hpDropTimer = [180, 240, 300, 360][Math.floor(Math.random() * 4)];
        }

        // Camera Lock logic: Lock camera when player enters boss area
        if (p.x > bossAreaX && boss.state !== 'dead') {
          engine.cameraX = bossAreaX;
          // Constrain player within the boss fight screen
          if (p.x < bossAreaX + 10) p.x = bossAreaX + 10;
          if (p.x > bossAreaX + 790 - p.width) p.x = bossAreaX + 790 - p.width;
        }

        // Boss always faces player
        boss.direction = boss.x > p.x ? 'left' : 'right';

        // Separate Independent Boss Stage Drops:
        // 1) Item Tembak Peluru (+3 / +4 / +5 random, stackable)
        // 2) Item +HP (+1 / +2 / +3 / +4 random)
        // Each uses random 3s / 4s / 5s / 6s timers so sometimes 1 drops, sometimes BOTH drop together!
        const bossDropIntervals = [180, 240, 300, 360];
        if (p.x > bossAreaX && boss.fightStarted && boss.countdown <= 0 && boss.state !== 'dead' && boss.state !== 'dying') {
          let ammoDropX = -1;
          if ((boss.itemDropTimer ?? 0) <= 0) {
            ammoDropX = bossAreaX + 80 + Math.random() * 620;
            const ammoAmount = [3, 4, 5][Math.floor(Math.random() * 3)];
            engine.items.push({
              id: Date.now() + Math.random(),
              x: ammoDropX,
              y: -60,
              w: 36,
              h: 32,
              type: 'boss_keyboard',
              amount: ammoAmount,
              collected: false,
              vy: 3.5,
              groundTimer: 300, // Hilang setelah 5 detik di tanah
            } as any);
            boss.itemDropTimer = bossDropIntervals[Math.floor(Math.random() * bossDropIntervals.length)];
          } else {
            boss.itemDropTimer = (boss.itemDropTimer ?? 180) - 1;
          }

          if (((boss as any).hpDropTimer ?? 0) <= 0) {
            let hpDropX = bossAreaX + 80 + Math.random() * 620;
            if (ammoDropX >= 0 && Math.abs(hpDropX - ammoDropX) < 110) {
              hpDropX = ammoDropX > bossAreaX + 390 ? ammoDropX - 130 : ammoDropX + 130;
            }
            const hpAmount = [1, 2, 3, 4][Math.floor(Math.random() * 4)];
            engine.items.push({
              id: Date.now() + Math.random() + 0.5,
              x: hpDropX,
              y: -60,
              w: 36,
              h: 32,
              type: 'boss_hp',
              amount: hpAmount,
              collected: false,
              vy: 3.5,
              groundTimer: 300, // Hilang setelah 5 detik di tanah
            } as any);
            (boss as any).hpDropTimer = bossDropIntervals[Math.floor(Math.random() * bossDropIntervals.length)];
          } else {
            (boss as any).hpDropTimer = ((boss as any).hpDropTimer ?? 240) - 1;
          }
        }

        // Update falling boss drop items & 5-second ground disappearance timer
        for (let iIdx = engine.items.length - 1; iIdx >= 0; iIdx--) {
          const it = engine.items[iIdx] as any;
          if (it.type === 'boss_keyboard' || it.type === 'boss_hp') {
            if (it.collected) {
              engine.items.splice(iIdx, 1);
              continue;
            }
            const groundTop = 380 - it.h;
            if (it.y < groundTop) {
              it.y = Math.min(groundTop, it.y + (it.vy || 3.5));
            } else {
              it.groundTimer = (it.groundTimer ?? 300) - 1;
              if (it.groundTimer <= 0) {
                it.collected = true;
                engine.items.splice(iIdx, 1);
              }
            }
          }
        }

        // Boss state machine
        if (boss.state !== 'dead' && boss.state !== 'dying') {
          if (!boss.fightStarted) {
             boss.state = 'idle';
          } else if (boss.countdown > 0) {
             boss.countdown--;
             boss.state = 'idle';
             p.vx = 0; // Freeze player during countdown
          } else {
             boss.stateTimer--;
             if (boss.stateTimer <= 0 && boss.state !== 'jumping') { // Finish previous state action
                const action = boss.pattern[boss.patternIndex];
                // 1: Move toward player
                // 2: Shoot laser / Cyber App Icons
                // 3: Move away from player
                // 4: Jump (Prep -> Air -> Land)
                if (action === 1) {
                   boss.state = 'moving';
                   boss.stateTimer = 80;
                   const dir = boss.x > p.x ? -1 : 1;
                   boss.vx = dir * 0.85;
                } else if (action === 2) {
                   boss.state = 'shooting';
                   boss.stateTimer = 110;
                   boss.shootTimer = 45; // Charging pose then fire
                } else if (action === 3) {
                   boss.state = 'moving';
                   boss.stateTimer = 80;
                   const dir = boss.x > p.x ? 1 : -1;
                   boss.vx = dir * 0.85;
                } else if (action === 4) {
                   // Jump Action (Stage 2)
                   boss.state = 'jumping';
                   boss.jumpPhase = 'prep';
                   boss.stateTimer = 22; // Squat prep (boss2_8.png)
                   boss.vx = 0;
                }
                boss.patternIndex = (boss.patternIndex + 1) % boss.pattern.length;
             }

             if (boss.state === 'moving') {
               boss.x += boss.vx;
               if (boss.x < bossAreaX + 80) { boss.x = bossAreaX + 80; boss.stateTimer = 0; }
               if (boss.x > bossAreaX + 700) { boss.x = bossAreaX + 700; boss.stateTimer = 0; }
             }

             if (boss.state === 'jumping') {
               if (boss.jumpPhase === 'prep') {
                 boss.vx = 0;
                 if (boss.stateTimer <= 0) {
                   boss.jumpPhase = 'air';
                   boss.vy = -13; // Jump velocity
                   const jumpDir = boss.x > p.x ? -1 : 1;
                   const dist = Math.abs(boss.x - p.x);
                   boss.vx = jumpDir * (dist < 180 ? 4.5 : 3.2);
                 }
               } else if (boss.jumpPhase === 'air') {
                 boss.x += boss.vx;
                 boss.y += boss.vy;
                 boss.vy += 0.55; // Gravity
                 if (boss.x < bossAreaX + 60) { boss.x = bossAreaX + 60; boss.vx = 0; }
                 if (boss.x > bossAreaX + 720) { boss.x = bossAreaX + 720; boss.vx = 0; }

                 // Ground level check (y: 280 on 380 ground)
                 if (boss.y >= 280) {
                   boss.y = 280;
                   boss.vy = 0;
                   boss.vx = 0;
                   boss.jumpPhase = 'land';
                   boss.stateTimer = 22; // Landing recovery (boss2_10.png)
                 }
               } else if (boss.jumpPhase === 'land') {
                 boss.vx = 0;
                 if (boss.stateTimer <= 0) {
                   boss.state = 'idle';
                   boss.jumpPhase = 'none';
                   boss.stateTimer = 15;
                 }
               }
             }

             if (boss.state === 'shooting' && boss.shootTimer > 0) {
               boss.shootTimer--;
               if (boss.shootTimer === 0) {
                 if (currentStage === 2) {
                   // Stage 2: Shoot Cyber App Icons (Phone, Mail, Wifi, Chat)
                   const laserVx = boss.direction === 'left' ? -9 : 9;
                   const laserX = boss.direction === 'left' ? boss.x - 12 : boss.x + boss.w;
                   boss.lasers.push({
                     x: laserX,
                     y: boss.y + 48,
                     vx: laserVx,
                     w: 36,
                     h: 36,
                     type: ['chat', 'wifi', 'phone', 'mail'][Math.floor(Math.random() * 4)]
                   });
                 } else {
                   // Stage 1: Blue laser bar
                   const laserVx = boss.direction === 'left' ? -10 : 10;
                   const laserX = boss.direction === 'left' ? boss.x - 10 : boss.x + boss.w;
                   boss.lasers.push({
                     x: laserX,
                     y: boss.y + 56,
                     vx: laserVx,
                     w: 55,
                     h: 14
                   });
                 }
               }
             }
          }

          // Boss body collision with player
          if (
            p.x < boss.x + boss.w &&
            p.x + p.width > boss.x &&
            p.y < boss.y + boss.h &&
            p.y + p.height > boss.y &&
            boss.countdown <= 0
          ) {
            if (p.invulnerableFrames === 0 && p.superPowerFrames === 0) {
              p.invulnerableFrames = 60;
              p.vy = -6;
              p.vx = boss.direction === 'left' ? -6 : 6;
              setLives(currentLives => {
                 const next = currentLives - 1;
                 if (next <= 0) {
                    if (boss.bossRetries > 0) {
                       boss.bossRetries--;
                       boss.countdown = 180;
                       boss.hp = boss.maxHp;
                       boss.patternIndex = 0;
                       boss.lasers = [];
                       boss.y = 280;
                       boss.vy = 0;
                       boss.state = 'idle';
                       boss.jumpPhase = 'none';
                       boss.itemDropTimer = [180, 240, 300, 360][Math.floor(Math.random() * 4)];
                       (boss as any).hpDropTimer = [180, 240, 300, 360][Math.floor(Math.random() * 4)];
                       engine.items = engine.items.filter(it => (it as any).type !== 'boss_keyboard' && (it as any).type !== 'boss_hp');
                       p.x = bossAreaX + 60;
                       p.y = 380 - p.height;
                       p.vx = 0;
                       p.vy = 0;
                       p.isGrounded = true;
                       p.direction = 'right';
                       resetKeys();
                       livesRef.current = 3;
                       return 3;
                    } else {
                       setGameState('gameover');
                       saveFinalScore(score);
                    }
                 }
                 return next;
              });
            }
          }

          // Update Lasers & collision with player
          for (let lIdx = boss.lasers.length - 1; lIdx >= 0; lIdx--) {
            const l = boss.lasers[lIdx];
            l.x += l.vx;
            if (l.x < bossAreaX - 100 || l.x > bossAreaX + 900) {
              boss.lasers.splice(lIdx, 1);
              continue;
            }

            if (
              l.x < p.x + p.width &&
              l.x + l.w > p.x &&
              l.y < p.y + p.height &&
              l.y + l.h > p.y
            ) {
              if (p.invulnerableFrames === 0 && p.superPowerFrames === 0) {
                p.invulnerableFrames = 60;
                setLives(currentLives => {
                   const next = currentLives - 1;
                   if (next <= 0) {
                      // Check for Boss Retries
                      if (boss.bossRetries > 0) {
                         boss.bossRetries--;
                         boss.countdown = 180; // 3s reset
                         boss.hp = boss.maxHp;
                         boss.patternIndex = 0;
                         boss.lasers = [];
                         boss.y = 280;
                         boss.vy = 0;
                         boss.state = 'idle';
                         boss.jumpPhase = 'none';
                         boss.itemDropTimer = [180, 240, 300, 360][Math.floor(Math.random() * 4)];
                         (boss as any).hpDropTimer = [180, 240, 300, 360][Math.floor(Math.random() * 4)];
                         engine.items = engine.items.filter(it => (it as any).type !== 'boss_keyboard' && (it as any).type !== 'boss_hp');
                         p.x = bossAreaX + 60;
                         p.y = 380 - p.height;
                         p.vx = 0;
                         p.vy = 0;
                         p.isGrounded = true;
                         p.direction = 'right';
                         resetKeys();
                         livesRef.current = 3;
                         return 3; // Reset to 3 lives
                      } else {
                         setGameState('gameover');
                         saveFinalScore(score);
                      }
                   }
                   return next;
                });
              }
              boss.lasers.splice(lIdx, 1);
            }
          }
        } else if (boss.state === 'dying') {
          boss.stateTimer--;
          if (boss.stateTimer % 8 === 0) {
            spawnFxSparks(
              boss.x + Math.random() * boss.w,
              boss.y - 20 + Math.random() * boss.h,
              boss.stateTimer % 16 === 0 ? '#facc15' : '#ef4444',
              12,
              4.2
            );
          }
          if (boss.stateTimer <= 0) boss.state = 'dead';
        }
      }

      if (p.x >= engine.schoolGateX - 50) {
        const bonusTimeScore = lives * 150 + 250;
        const total = score + bonusTimeScore;
        setScore(total);
        setGameState('win');
        saveFinalScore(total, true);
        return true;
      }

      const activeBossAreaX = currentStage === 2 ? 4900 : 5400;
      const isBossArenaLocked = (currentStage === 1 || currentStage === 2) && engine.boss && p.x > activeBossAreaX && engine.boss.state !== 'dead';
      if (isBossArenaLocked) {
        engine.cameraX = activeBossAreaX;
      } else {
        const targetCamX = p.x - 300;
        engine.cameraX += (targetCamX - engine.cameraX) * 0.12;
        if (engine.cameraX < 0) engine.cameraX = 0;
        if (engine.cameraX > engine.worldWidth - 800) {
          engine.cameraX = engine.worldWidth - 800;
        }
      }

      // Advance FX Particles & Floating Score Popups in fixed 60Hz steps
      for (let i = fxParticlesRef.current.length - 1; i >= 0; i--) {
        const pt = fxParticlesRef.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.12;
        pt.life -= 1;
        if (pt.life <= 0) {
          fxParticlesRef.current.splice(i, 1);
        }
      }
      for (let i = fxPopupsRef.current.length - 1; i >= 0; i--) {
        const fp = fxPopupsRef.current[i];
        fp.y -= 0.7;
        fp.life -= 1;
        if (fp.life <= 0) {
          fxPopupsRef.current.splice(i, 1);
        }
      }

      return false;
    };

    const gameLoop = (now: number) => {
      const dt = Math.min(50, Math.max(0, now - lastTime));
      lastTime = now;

      if (activeQuiz === null) {
        accumulator += dt;
        let subSteps = 0;
        while (accumulator >= STEP_MS && subSteps < 3) {
          const ended = stepPhysics();
          accumulator -= STEP_MS;
          subSteps++;
          if (ended) return;
        }
        if (subSteps >= 3) accumulator = 0;
      }

      const p = engine.player;

      // Apply cached internal canvas pixel resolution (avoids per-frame forced layout reflow)
      const { width: targetW, height: targetH } = canvasSizeRef.current;
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      const camX = engine.cameraX;

      // Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(canvas.width / 800, canvas.height / 450);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Render Backdrop per Stage (High-Detail Multi-Layer Parallax & Atmospheric Effects)
      if (currentStage === 2) {
        // Stage 2: Sunset Forest & Bumi Perkemahan
        const skyGradient = ctx.createLinearGradient(0, 0, 0, 450);
        skyGradient.addColorStop(0, '#2e0f04');
        skyGradient.addColorStop(0.35, '#7c2d12');
        skyGradient.addColorStop(0.72, '#ea580c');
        skyGradient.addColorStop(1, '#fde047');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, 800, 450);

        // Luminous Crescent Moon Halo & Stars
        const moonHalo = ctx.createRadialGradient(680, 70, 8, 680, 70, 60);
        moonHalo.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
        moonHalo.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = moonHalo;
        ctx.beginPath();
        ctx.arc(680, 70, 60, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(680, 70, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#5c1f0b';
        ctx.beginPath();
        ctx.arc(674, 66, 15, 0, Math.PI * 2);
        ctx.fill();

        // Twinkling Twilight Stars
        ctx.fillStyle = '#ffffff';
        const stars = [[70, 32], [120, 40], [190, 24], [240, 65], [310, 48], [380, 35], [460, 28], [520, 80], [590, 42], [750, 45], [785, 82]];
        for (const [sx, sy] of stars) {
          const starGlow = (Math.sin(p.animFrame * 2 + sx) + 1) * 0.75 + 0.9;
          ctx.beginPath();
          ctx.arc(sx, sy, starGlow, 0, Math.PI * 2);
          ctx.fill();
        }

        // Far Mountain Silhouettes + Warm Rim Highlight
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        for (let m = 0; m < 6; m++) {
          const mx = m * 300 - (camX * 0.14) % 300;
          ctx.moveTo(mx - 80, 365);
          ctx.lineTo(mx + 70, 200);
          ctx.lineTo(mx + 220, 365);
        }
        ctx.fill();

        // Layered Tiered Pine Trees in Background (3 depth tiers)
        const drawPine = (tx: number, baseH: number, col: string) => {
          ctx.fillStyle = col;
          for (let tier = 0; tier < 3; tier++) {
            const topY = 365 - baseH + tier * (baseH * 0.22);
            const botY = 365 - baseH * (0.48 - tier * 0.24);
            const halfW = 18 + tier * 9;
            ctx.beginPath();
            ctx.moveTo(tx, topY);
            ctx.lineTo(tx - halfW, botY);
            ctx.lineTo(tx + halfW, botY);
            ctx.closePath();
            ctx.fill();
          }
        };
        for (let i = -1; i < 16; i++) {
          drawPine(i * 170 - (camX * 0.3) % 170, 165 + (i % 3) * 18, '#064e3b');
        }
        for (let i = -1; i < 14; i++) {
          drawPine(i * 210 + 75 - (camX * 0.42) % 210, 135 + (i % 2) * 20, '#065f46');
        }

        // Evening Forest Mist Band
        const mistGrad = ctx.createLinearGradient(0, 315, 0, 380);
        mistGrad.addColorStop(0, 'rgba(254, 215, 170, 0)');
        mistGrad.addColorStop(1, 'rgba(254, 215, 170, 0.16)');
        ctx.fillStyle = mistGrad;
        ctx.fillRect(0, 315, 800, 65);

        // Distant Camping Tents, Lanterns, Campfires & Glowing Fireflies
        for (let i = 0; i < 7; i++) {
          const tentX = i * 540 + 110 - camX * 0.52;
          if (tentX > -120 && tentX < 920) {
            ctx.fillStyle = '#047857';
            ctx.beginPath();
            ctx.moveTo(tentX + 26, 304);
            ctx.lineTo(tentX, 362);
            ctx.lineTo(tentX + 52, 362);
            ctx.fill();
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.moveTo(tentX + 26, 304);
            ctx.lineTo(tentX + 13, 362);
            ctx.lineTo(tentX + 26, 362);
            ctx.fill();

            // Small Campfire with glow
            const fireX = tentX + 76;
            const fireGlow = ctx.createRadialGradient(fireX, 348, 2, fireX, 348, 24);
            fireGlow.addColorStop(0, 'rgba(251, 146, 60, 0.42)');
            fireGlow.addColorStop(1, 'rgba(251, 146, 60, 0)');
            ctx.fillStyle = fireGlow;
            ctx.beginPath();
            ctx.arc(fireX, 348, 24, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#78350f';
            ctx.fillRect(fireX - 6, 356, 12, 4);
            const flicker = Math.sin(p.animFrame * 5 + i) * 3;
            ctx.fillStyle = '#ea580c';
            ctx.beginPath();
            ctx.arc(fireX, 349 + flicker, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.arc(fireX, 350 + flicker, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Bobbing Golden Forest Fireflies (Kunang-kunang)
        for (let ff = 0; ff < 14; ff++) {
          const fx = ((ff * 83 - camX * 0.5 + Math.sin(p.animFrame * 1.4 + ff) * 18) % 820 + 820) % 820 - 10;
          const fy = 265 + ((ff * 37) % 95) + Math.cos(p.animFrame * 2.2 + ff) * 10;
          const alpha = 0.4 + 0.6 * Math.abs(Math.sin(p.animFrame * 3 + ff));
          ctx.fillStyle = `rgba(253, 224, 71, ${alpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(fx, fy, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

      } else if (currentStage === 3) {
        // Stage 3: Museum Wisata Edukasi Cyber Night Sky
        const skyGradient = ctx.createLinearGradient(0, 0, 0, 450);
        skyGradient.addColorStop(0, '#09090b');
        skyGradient.addColorStop(0.4, '#1e1b4b');
        skyGradient.addColorStop(0.78, '#1e3a8a');
        skyGradient.addColorStop(1, '#0284c7');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, 800, 450);

        // Cosmic Nebula Glow Band
        const nebGrad = ctx.createRadialGradient(420, 130, 20, 420, 130, 280);
        nebGrad.addColorStop(0, 'rgba(56, 189, 248, 0.18)');
        nebGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.1)');
        nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = nebGrad;
        ctx.fillRect(0, 0, 800, 340);

        // Twinkling Space Stars + Occasional Shooting Star
        ctx.fillStyle = '#ffffff';
        const sciStars = [[55, 38], [130, 62], [200, 45], [275, 24], [350, 52], [430, 32], [510, 68], [620, 35], [710, 58], [780, 28]];
        for (const [sx, sy] of sciStars) {
          const sRad = (Math.sin(p.animFrame * 3 + sx) + 1) * 0.7 + 0.9;
          ctx.beginPath();
          ctx.arc(sx, sy, sRad, 0, Math.PI * 2);
          ctx.fill();
        }

        // Elevated Cyber Monorail Track & Gliding Train in Distance
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 250, 800, 5);
        for (let px = -((camX * 0.25) % 160); px < 840; px += 160) {
          ctx.fillRect(px, 255, 8, 125);
        }
        const trainX = ((p.animFrame * 90) % 1100) - 200;
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(trainX, 240, 110, 10);
        ctx.fillStyle = '#e0f2fe';
        for (let tw = 0; tw < 5; tw++) {
          ctx.fillRect(trainX + 10 + tw * 20, 242, 12, 5);
        }

        // Futuristic Modern City Skyline Silhouettes
        for (let i = 0; i < 12; i++) {
          const bldgX = i * 360 + 25 - camX * 0.35;
          if (bldgX < -130 || bldgX > 900) continue;
          const bldgH = 125 + (i % 3) * 38;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(bldgX, 365 - bldgH, 98, bldgH);
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bldgX, 365 - bldgH, 98, bldgH);

          // Glowing Cyber Windows & Neon Trim Lines
          ctx.fillStyle = i % 2 === 0 ? '#0284c7' : '#38bdf8';
          for (let wy = 365 - bldgH + 16; wy < 342; wy += 20) {
            for (let wx = 0; wx < 3; wx++) {
              ctx.fillRect(bldgX + 12 + wx * 26, wy, 16, 9);
            }
          }
          // Spire Antenna with blinking beacon
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(bldgX + 46, 365 - bldgH - 26, 4, 26);
          if (Math.sin(p.animFrame * 4 + i) > 0) {
            ctx.fillStyle = '#ec4899';
            ctx.beginPath();
            ctx.arc(bldgX + 48, 365 - bldgH - 28, 4.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

      } else if (currentStage === 4) {
        // Stage 4: Sunset Sky & Mount Sawal Priangan over Alun-Alun Ciamis
        const skyGradient = ctx.createLinearGradient(0, 0, 0, 450);
        skyGradient.addColorStop(0, '#2e1065');
        skyGradient.addColorStop(0.35, '#701a75');
        skyGradient.addColorStop(0.7, '#d946ef');
        skyGradient.addColorStop(1, '#fef08a');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, 800, 450);

        // Radiant Golden Dusk Sun Glow
        const duskSun = ctx.createRadialGradient(640, 170, 12, 640, 170, 120);
        duskSun.addColorStop(0, 'rgba(254, 240, 138, 0.55)');
        duskSun.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = duskSun;
        ctx.beginPath();
        ctx.arc(640, 170, 120, 0, Math.PI * 2);
        ctx.fill();

        // Evening Stars
        ctx.fillStyle = '#ffffff';
        const stars = [[80, 28], [160, 48], [250, 32], [360, 56], [450, 25], [560, 44], [690, 38], [775, 58]];
        for (const [sx, sy] of stars) {
          const starGlow = (Math.sin(p.animFrame * 2 + sx) + 1) * 0.75 + 0.9;
          ctx.beginPath();
          ctx.arc(sx, sy, starGlow, 0, Math.PI * 2);
          ctx.fill();
        }

        // Mount Sawal Twin-Peak Silhouette in Background
        ctx.fillStyle = '#4c1d95';
        ctx.beginPath();
        for (let m = 0; m < 6; m++) {
          const mx = m * 340 - (camX * 0.14) % 340;
          ctx.moveTo(mx - 100, 365);
          ctx.lineTo(mx + 65, 188);
          ctx.lineTo(mx + 125, 232);
          ctx.lineTo(mx + 175, 198);
          ctx.lineTo(mx + 275, 365);
        }
        ctx.fill();

        // Priangan Town Silhouette with Lit Golden Windows & Mosque Dome
        for (let i = 0; i < 14; i++) {
          const bX = i * 250 + 40 - camX * 0.36;
          if (bX < -100 || bX > 900) continue;
          const bH = 95 + (i % 4) * 24;
          ctx.fillStyle = '#581c87';
          ctx.fillRect(bX, 365 - bH, 74, bH);
          if (i % 3 === 0) {
            // Traditional dome accent
            ctx.beginPath();
            ctx.arc(bX + 37, 365 - bH, 20, Math.PI, 0);
            ctx.fill();
          }
          ctx.fillStyle = '#fde047';
          for (let wy = 365 - bH + 14; wy < 345; wy += 18) {
            ctx.fillRect(bX + 12, wy, 10, 8);
            ctx.fillRect(bX + 32, wy, 10, 8);
            ctx.fillRect(bX + 52, wy, 10, 8);
          }
        }

      } else {
        // Stage 1: Home to School Bright Morning Sky (Multi-Depth Hills, Birds, Electric Poles & Houses)
        const skyGradient = ctx.createLinearGradient(0, 0, 0, 450);
        skyGradient.addColorStop(0, '#0284c7');
        skyGradient.addColorStop(0.38, '#38bdf8');
        skyGradient.addColorStop(0.76, '#bae6fd');
        skyGradient.addColorStop(1, '#f0fdf4');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, 800, 450);

        // Morning Sun with Soft Radial Glow & Warm Rays
        const sunGrad = ctx.createRadialGradient(705, 78, 18, 705, 78, 86);
        sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.65)');
        sunGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.22)');
        sunGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(705, 78, 86, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(705, 78, 27, 0, Math.PI * 2);
        ctx.fill();

        // Gliding Morning Birds
        ctx.strokeStyle = '#0369a1';
        ctx.lineWidth = 1.6;
        for (let b = 0; b < 4; b++) {
          const bx = ((b * 185 - camX * 0.1 + p.animFrame * 24) % 860 + 860) % 860 - 30;
          const by = 70 + (b % 2) * 32 + Math.sin(p.animFrame * 2 + b) * 4;
          const wing = Math.sin(p.animFrame * 6 + b) * 4;
          ctx.beginPath();
          ctx.moveTo(bx - 7, by + wing);
          ctx.quadraticCurveTo(bx - 3, by - 4, bx, by);
          ctx.quadraticCurveTo(bx + 3, by - 4, bx + 7, by + wing);
          ctx.stroke();
        }

        // Fluffy Two-Tone Clouds
        for (let c = 0; c < 6; c++) {
          const cx = (((c * 340 + 80 - camX * 0.14 - p.animFrame * 8) % 1040) + 1040) % 1040 - 120;
          const cy = 58 + (c % 2) * 34;
          ctx.fillStyle = 'rgba(224, 242, 254, 0.9)';
          ctx.beginPath();
          ctx.arc(cx, cy + 4, 22, 0, Math.PI * 2);
          ctx.arc(cx + 22, cy - 2, 26, 0, Math.PI * 2);
          ctx.arc(cx + 46, cy + 4, 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
          ctx.beginPath();
          ctx.arc(cx, cy, 21, 0, Math.PI * 2);
          ctx.arc(cx + 22, cy - 8, 25, 0, Math.PI * 2);
          ctx.arc(cx + 44, cy, 19, 0, Math.PI * 2);
          ctx.fill();
        }

        // Layered Green Rolling Hills with Soft Sunlit Rim
        ctx.fillStyle = '#86efac';
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
          const hillX = i * 360 - camX * 0.2;
          ctx.arc(hillX + 180, 380, 180, Math.PI, 0, false);
        }
        ctx.fill();

        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const hillX = i * 450 + 80 - camX * 0.3;
          ctx.arc(hillX + 180, 390, 160, Math.PI, 0, false);
        }
        ctx.fill();

        // Utility Poles & Power Wires in Midground
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.45)';
        ctx.lineWidth = 1.2;
        for (let pIdx = -1; pIdx < 6; pIdx++) {
          const poleX = pIdx * 240 - (camX * 0.4) % 240;
          ctx.fillStyle = '#64748b';
          ctx.fillRect(poleX, 245, 5, 130);
          ctx.fillRect(poleX - 8, 254, 21, 3);
          ctx.beginPath();
          ctx.moveTo(poleX + 2, 255);
          ctx.quadraticCurveTo(poleX + 120, 272, poleX + 242, 255);
          ctx.stroke();
        }

        // Background Neighborhood Houses & School-Zone Signs
        for (let i = 0; i < 10; i++) {
          const houseX = i * 480 + 120 - camX * 0.45;
          if (houseX < -120 || houseX > 920) continue;
          // House body + trim
          ctx.fillStyle = i % 2 === 0 ? '#fef08a' : '#fed7aa';
          ctx.fillRect(houseX, 295, 78, 68);
          ctx.fillStyle = 'rgba(0,0,0,0.08)';
          ctx.fillRect(houseX, 295, 78, 6);
          // Roof with eaves
          ctx.fillStyle = i % 2 === 0 ? '#dc2626' : '#b45309';
          ctx.beginPath();
          ctx.moveTo(houseX - 9, 297);
          ctx.lineTo(houseX + 39, 259);
          ctx.lineTo(houseX + 87, 297);
          ctx.closePath();
          ctx.fill();
          // Door & Window
          ctx.fillStyle = '#78350f';
          ctx.fillRect(houseX + 12, 324, 18, 39);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(houseX + 42, 312, 24, 21);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(houseX + 42, 312, 24, 21);
          // Garden tree beside house
          ctx.fillStyle = '#78350f';
          ctx.fillRect(houseX + 90, 310, 9, 53);
          ctx.fillStyle = '#15803d';
          ctx.beginPath();
          ctx.arc(houseX + 94, 305, 19, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(houseX + 91, 299, 13, 0, Math.PI * 2);
          ctx.fill();

          // Roadside School Zone Signpost every 2 houses
          if (i % 2 === 1) {
            const signX = houseX + 130;
            ctx.fillStyle = '#475569';
            ctx.fillRect(signX, 326, 4, 37);
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.moveTo(signX + 2, 308);
            ctx.lineTo(signX + 14, 328);
            ctx.lineTo(signX - 10, 328);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }

      // ==========================================
      // DETAILED STARTING LOCATION / BUILDING PER STAGE
      // ==========================================
      const startX = 40 - camX;
      if (startX > -400 && startX < canvas.width + 400) {
        if (currentStage === 1) {
          // Stage 1 Start: RUMAH TINGGAL SISWA SMP
          drawRumah(ctx, startX, 380, p.animFrame);
        } else if (currentStage === 2) {
          // Stage 2 Start: SMPN 1 KAWALI (Titik Kumpul Keberangkatan Pramuka)
          drawSekolah(ctx, startX, 380, p.animFrame, true, 'KEBERANGKATAN PRAMUKA');
        } else if (currentStage === 3) {
          // Stage 3 Start: SMPN 1 KAWALI (Titik Kumpul Keberangkatan Study Tour)
          drawSekolah(ctx, startX, 380, p.animFrame, true, 'KEBERANGKATAN STUDY TOUR');
        } else {
          // Stage 4 Start: SMPN 1 KAWALI (Menuju Alun-Alun Ciamis)
          drawSekolah(ctx, startX, 380, p.animFrame, true, 'MENUJU ALUN-ALUN CIAMIS');
        }
      }

      // Draw Detailed Beveled Ground Strata & Steel/Wood Floating Platforms
      for (const plat of engine.platforms) {
        const px = plat.x - camX;
        if (px + plat.w < -50 || px > canvas.width + 50) continue;

        if (plat.type === 'ground') {
          const soilDark = currentStage === 2 ? '#3b1605' : currentStage === 3 ? '#1e293b' : currentStage === 4 ? '#3f1d2b' : '#92400e';
          const soilLight = currentStage === 2 ? '#52220c' : currentStage === 3 ? '#334155' : currentStage === 4 ? '#581c87' : '#b45309';
          const turfTop = currentStage === 2 ? '#15803d' : currentStage === 3 ? '#0284c7' : currentStage === 4 ? '#16a34a' : '#22c55e';
          const turfHighlight = currentStage === 2 ? '#4ade80' : currentStage === 3 ? '#7dd3fc' : '#86efac';

          // Underground Soil / Concrete Strata
          ctx.fillStyle = soilLight;
          ctx.fillRect(px, plat.y + 14, plat.w, plat.h - 14);
          ctx.fillStyle = soilDark;
          ctx.fillRect(px, plat.y + 34, plat.w, plat.h - 34);

          // Embedded Stones / Cyber Circuit Seams
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          for (let sx = 8; sx < plat.w - 16; sx += 36) {
            ctx.fillRect(px + sx, plat.y + 24, 14, 6);
            ctx.fillRect(px + sx + 16, plat.y + 44, 10, 5);
          }

          // Top Turf / Cyber Tile Layer + Overhang Contact Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.fillRect(px, plat.y + 14, plat.w, 4);
          ctx.fillStyle = turfTop;
          ctx.fillRect(px, plat.y, plat.w, 14);
          ctx.fillStyle = turfHighlight;
          ctx.fillRect(px, plat.y, plat.w, 3);

          // Grass Tufts / Scalloped Turf Border
          ctx.fillStyle = currentStage === 3 ? '#38bdf8' : turfTop;
          for (let gx = 0; gx < plat.w - 10; gx += 20) {
            ctx.fillRect(px + gx, plat.y + 11, 10, 5);
            if (currentStage !== 3 && gx % 40 === 0) {
              ctx.fillRect(px + gx + 4, plat.y - 3, 4, 3);
            }
          }
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px, plat.y, plat.w, plat.h);
        } else {
          // Elevated Beveled Ledge Platform with Drop Shadow & Riveted Metal Brackets
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.fillRect(px + 3, plat.y + 4, plat.w, plat.h);

          const ledgeFill = currentStage === 3 ? '#0284c7' : '#d97706';
          const ledgeDark = currentStage === 3 ? '#0f172a' : '#92400e';
          ctx.fillStyle = ledgeFill;
          ctx.fillRect(px, plat.y, plat.w, plat.h);
          ctx.fillStyle = currentStage === 3 ? '#7dd3fc' : '#fde047';
          ctx.fillRect(px, plat.y, plat.w, 4);
          ctx.fillStyle = ledgeDark;
          ctx.fillRect(px, plat.y + plat.h - 4, plat.w, 4);
          // Plank / Brick Vertical Seams & End Brackets
          for (let sx = 24; sx < plat.w - 8; sx += 24) {
            ctx.fillRect(px + sx, plat.y + 4, 2, plat.h - 8);
          }
          ctx.fillStyle = '#334155';
          ctx.fillRect(px, plat.y, 7, plat.h);
          ctx.fillRect(px + plat.w - 7, plat.y, 7, plat.h);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.strokeRect(px, plat.y, plat.w, plat.h);
        }
      }

      // Draw Detailed Items (Laptop, RAM, Kotak Emas Quiz, Boss Drops)
      for (const item of engine.items) {
        if (item.collected) continue;
        const ix = item.x - camX;
        if (ix + item.w < -30 || ix > canvas.width + 30) continue;

        const floatY = item.y + Math.sin(p.animFrame * 1.5) * 3;

        if (item.type === 'laptop') {
          // Detailed Silver Laptop (+50 Poin) with Glowing Screen
          ctx.save();
          ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.beginPath();
          ctx.arc(ix + 12, floatY + 9, 17, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#334155';
          ctx.fillRect(ix, floatY, 24, 15);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(ix, floatY, 24, 15);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(ix + 2, floatY + 2, 20, 11);
          // Mini code bars on screen
          ctx.fillStyle = '#e0f2fe';
          ctx.fillRect(ix + 4, floatY + 4, 11, 2);
          ctx.fillRect(ix + 4, floatY + 8, 15, 2);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(ix - 3, floatY + 15, 30, 5);
          ctx.strokeRect(ix - 3, floatY + 15, 30, 5);
          ctx.restore();
        } else if (item.type === 'ram') {
          // Detailed Green PCB RAM Stick (+100 Poin) with Gold Pins & Shine
          ctx.save();
          ctx.fillStyle = 'rgba(74, 222, 128, 0.24)';
          ctx.beginPath();
          ctx.arc(ix + 13, floatY + 9, 17, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(ix, floatY, 26, 18);
          ctx.strokeStyle = '#052e16';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(ix, floatY, 26, 18);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(ix + 3, floatY + 3, 5, 8);
          ctx.fillRect(ix + 10, floatY + 3, 5, 8);
          ctx.fillRect(ix + 17, floatY + 3, 5, 8);
          ctx.fillStyle = '#eab308';
          for (let pin = 2; pin < 24; pin += 4) {
            ctx.fillRect(ix + pin, floatY + 15, 2.5, 3.5);
          }
          ctx.restore();
        } else if (item.type === 'mystery_box') {
          // Beveled Golden Kotak Emas Informatika (Interactive Quiz Box)
          ctx.save();
          ctx.fillStyle = 'rgba(250, 204, 21, 0.32)';
          ctx.beginPath();
          ctx.arc(ix + 14, floatY + 14, 21 + Math.sin(p.animFrame * 3) * 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(ix, floatY, 28, 28);
          ctx.fillStyle = '#fde047';
          ctx.fillRect(ix + 2, floatY + 2, 24, 4);
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2;
          ctx.strokeRect(ix, floatY, 28, 28);
          // Corner rivets
          ctx.fillStyle = '#78350f';
          ctx.fillRect(ix + 2, floatY + 2, 3, 3);
          ctx.fillRect(ix + 23, floatY + 2, 3, 3);
          ctx.fillRect(ix + 2, floatY + 23, 3, 3);
          ctx.fillRect(ix + 23, floatY + 23, 3, 3);
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 17px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 3;
          ctx.strokeText('?', ix + 14, floatY + 15);
          ctx.fillText('?', ix + 14, floatY + 15);
          ctx.restore();
        } else if ((item as any).type === 'ammo') {
          // Stage Collectible Bullet Stack Item (Random +3 / +4 / +5 bullets)
          ctx.save();
          ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
          ctx.beginPath();
          ctx.arc(ix + item.w / 2, floatY + item.h / 2, 19 + Math.sin(p.animFrame * 3) * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(ix, floatY, item.w, item.h);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.strokeRect(ix, floatY, item.w, item.h);
          ctx.font = '13px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⌨️', ix + item.w / 2, floatY + item.h / 2 - 4);
          ctx.fillStyle = '#7dd3fc';
          ctx.font = 'bold 8px sans-serif';
          ctx.fillText('+PELURU', ix + item.w / 2, floatY + item.h - 4);
          ctx.restore();
        } else if ((item as any).type === 'boss_keyboard' || (item as any).type === 'boss_hp') {
          const bossItem = item as any;
          const groundTop = 380 - item.h;
          const isOnGround = item.y >= groundTop - 1;
          const gTimer = bossItem.groundTimer ?? 300;
          const isExpiring = isOnGround && gTimer <= 90;

          ctx.save();
          if (isExpiring && Math.floor(gTimer / 6) % 2 === 0) {
            ctx.globalAlpha = 0.35;
          }

          if (bossItem.type === 'boss_hp') {
            // Item +HP Drop (+1 / +2 / +3 / +4 HP)
            const hpAmt = bossItem.amount ?? 1;
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = 12;
            ctx.fillStyle = '#4c0519';
            ctx.fillRect(ix, item.y, item.w, item.h);
            ctx.strokeStyle = '#fb7185';
            ctx.lineWidth = 2;
            ctx.strokeRect(ix, item.y, item.w, item.h);
            ctx.font = '13px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('❤️', ix + item.w / 2, item.y + item.h / 2 - 5);
            ctx.fillStyle = '#fecdd3';
            ctx.font = '900 8px sans-serif';
            ctx.fillText(`+${hpAmt} HP`, ix + item.w / 2, item.y + item.h - 5);
          } else {
            // Special Falling Keyboard Bullet Drop (+3 / +4 / +5 Peluru)
            const ammoAmt = bossItem.amount ?? 3;
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(ix, item.y, item.w, item.h);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.strokeRect(ix, item.y, item.w, item.h);
            ctx.font = '13px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⌨️', ix + item.w / 2, item.y + item.h / 2 - 5);
            ctx.fillStyle = '#7dd3fc';
            ctx.font = '900 8px sans-serif';
            ctx.fillText(`+${ammoAmt} 🔫`, ix + item.w / 2, item.y + item.h - 5);
          }

          // 5-second ground timer bar above landed drop
          if (isOnGround) {
            const pct = Math.max(0, Math.min(1, gTimer / 300));
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(ix, item.y - 7, item.w, 4);
            ctx.fillStyle = pct > 0.35 ? (bossItem.type === 'boss_hp' ? '#fb7185' : '#38bdf8') : '#f59e0b';
            ctx.fillRect(ix, item.y - 7, item.w * pct, 4);
          }
          ctx.restore();
        }
      }

      // Render Boss (Stage 1 & Stage 2) & Projectiles
      if ((currentStage === 1 || currentStage === 2) && engine.boss) {
        const boss = engine.boss;
        const bx = boss.x - camX;
        const by = boss.y;

        let bossImg: HTMLCanvasElement | HTMLImageElement | null = null;
        if (currentStage === 2) {
          // Stage 2 Boss Pose Mappings
          if (boss.state === 'dead' || boss.state === 'dying') {
            bossImg = boss2ImagesRef.current[7] || boss2ImagesRef.current[0];
          } else if (boss.invulnerableFrames > 0) {
            bossImg = boss2ImagesRef.current[7] || boss2ImagesRef.current[0];
          } else if (boss.state === 'jumping') {
            if (boss.jumpPhase === 'prep') {
              bossImg = boss2ImagesRef.current[8] || boss2ImagesRef.current[0];
            } else if (boss.jumpPhase === 'air') {
              bossImg = boss2ImagesRef.current[9] || boss2ImagesRef.current[0];
            } else {
              bossImg = boss2ImagesRef.current[10] || boss2ImagesRef.current[0];
            }
          } else if (boss.state === 'shooting') {
            if (boss.shootTimer > 0) {
              bossImg = boss2ImagesRef.current[5] || boss2ImagesRef.current[0];
            } else {
              bossImg = boss2ImagesRef.current[6] || boss2ImagesRef.current[0];
            }
          } else if (boss.state === 'moving') {
            const frameIdx = Math.floor(p.animFrame * 2) % 3 + 2;
            bossImg = boss2ImagesRef.current[frameIdx] || boss2ImagesRef.current[2] || boss2ImagesRef.current[0];
          } else {
            const frameIdx = Math.floor(p.animFrame * 1.5) % 2;
            bossImg = boss2ImagesRef.current[frameIdx] || boss2ImagesRef.current[0];
          }
        } else {
          // Stage 1 Boss Pose Mappings
          if (boss.state === 'dead') {
            bossImg = bossImagesRef.current[10] || bossImagesRef.current[9] || bossImagesRef.current[0];
          } else if (boss.state === 'dying') {
            bossImg = bossImagesRef.current[9] || bossImagesRef.current[0];
          } else if (boss.invulnerableFrames > 0) {
            bossImg = bossImagesRef.current[8] || bossImagesRef.current[0];
          } else if (boss.state === 'shooting') {
            const frameIdx = Math.floor(p.animFrame * 2) % 2 + 6;
            bossImg = bossImagesRef.current[frameIdx] || bossImagesRef.current[6] || bossImagesRef.current[0];
          } else if (boss.state === 'moving') {
            const frameIdx = Math.floor(p.animFrame * 2) % 4 + 2;
            bossImg = bossImagesRef.current[frameIdx] || bossImagesRef.current[2] || bossImagesRef.current[0];
          } else {
            const frameIdx = Math.floor(p.animFrame * 1) % 2;
            bossImg = bossImagesRef.current[frameIdx] || bossImagesRef.current[0];
          }
        }

        if (!isSpriteReady(bossImg)) {
          const fallbackArr = currentStage === 2 ? boss2ImagesRef.current : bossImagesRef.current;
          bossImg = fallbackArr.find(isSpriteReady) || null;
        }

        if (bossImg && isSpriteReady(bossImg)) {
           const imgW = (bossImg as HTMLCanvasElement).width || (bossImg as HTMLImageElement).naturalWidth || 400;
           const imgH = (bossImg as HTMLCanvasElement).height || (bossImg as HTMLImageElement).naturalHeight || 400;
           const bAspect = imgW / imgH;
           const drawBH = 150;
           const drawBW = drawBH * bAspect;
           const drawX = bx + (boss.w - drawBW)/2;
           const drawY = by + boss.h - drawBH - 35; // Increased upward offset to 35px so feet land on platform

           // Boss Ground Shadow + Charging Aura
           if (boss.state !== 'dead') {
             const airRatio = Math.max(0.45, Math.min(1, 1 - (280 - boss.y) / 240));
             ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
             ctx.beginPath();
             ctx.ellipse(bx + boss.w / 2, 380, 42 * airRatio, 7 * airRatio, 0, 0, Math.PI * 2);
             ctx.fill();
           }
           if (boss.state === 'shooting' && boss.shootTimer > 0 && boss.shootTimer < 22) {
             ctx.fillStyle = currentStage === 2 ? 'rgba(168, 85, 247, 0.25)' : 'rgba(59, 130, 246, 0.25)';
             ctx.beginPath();
             ctx.arc(bx + boss.w / 2, by + boss.h / 2 - 20, 62 + Math.sin(p.animFrame * 8) * 6, 0, Math.PI * 2);
             ctx.fill();
           }

           ctx.save();
           if (boss.invulnerableFrames > 0 && Math.floor(boss.invulnerableFrames / 3) % 2 === 0) {
              ctx.globalAlpha = 0.5; // Smooth flicker-free hit blink without filter state invalidation
           }
           // Default pose is facing left, so flip if facing right
           if (boss.direction === 'right') {
              ctx.translate(drawX + drawBW, drawY);
              ctx.scale(-1, 1);
              ctx.drawImage(bossImg, 0, 0, drawBW, drawBH);
           } else {
              ctx.drawImage(bossImg, drawX, drawY, drawBW, drawBH);
           }
           ctx.restore();

           // Draw Boss HP as Hearts (mirrors main character's opacity-100/scale-100 vs opacity-20/scale-75)
           if (boss.state !== 'dead') {
             const heartCount = boss.maxHp || 10;
             const heartSpacing = 16;
             const heartSize = 14;
             const activeHearts = Math.max(0, Math.min(heartCount, boss.hp));
             const startX = drawX + (drawBW - (heartCount * heartSpacing)) / 2;
             const startY = drawY - 14;

             ctx.save();
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             for (let i = 0; i < heartCount; i++) {
               const isAlive = i < activeHearts;
               const hx = startX + i * heartSpacing + heartSpacing / 2;
               const hy = startY;
               ctx.save();
               ctx.translate(hx, hy);
               if (!isAlive) {
                 ctx.globalAlpha = 0.2;
                 ctx.scale(0.75, 0.75);
               } else {
                 ctx.globalAlpha = 1;
               }
               ctx.font = `${heartSize}px sans-serif`;
               ctx.fillText('❤️', 0, 0);
               ctx.restore();
             }
             ctx.restore();
           }
        }

        // Boss Countdown Overlay
        if (boss.countdown > 0) {
            const num = Math.ceil(boss.countdown / 60);
            ctx.save();
            // Modern deep blur background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(0, 0, 800, 450);
            
            // Extremely Large Animated Number with Modern Look
            const pulse = Math.sin(boss.countdown * 0.15);
            const scale = 1.3 + pulse * 0.15; // Even larger scale
            ctx.translate(400, 185);
            ctx.scale(scale, scale);
            
            // Ultra Glow
            const glowColor = currentStage === 2 ? '#a855f7' : '#3b82f6';
            const strokeColor = currentStage === 2 ? '#c084fc' : '#60a5fa';
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 80;
            ctx.fillStyle = '#ffffff';
            ctx.font = 'black 450px "Inter", "Arial Black", sans-serif'; // Enormous
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(num.toString(), 0, 0);
            
            // Vibrant Stroke Glow
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 6;
            ctx.globalAlpha = 0.5 + pulse * 0.3;
            ctx.strokeText(num.toString(), 0, 0);
            ctx.restore();

            ctx.save();
            ctx.textAlign = 'center';
            ctx.fillStyle = strokeColor;
            ctx.font = 'black 36px "Inter", sans-serif';
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 15;
            ctx.fillText(currentStage === 2 ? 'PERSIAPAN BERTARUNG! (STAGE 2 BOS)' : 'PERSIAPAN BERTARUNG!', 400, 340);
            
            // Modern stylized progress indicator
            const lineW = 400;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(400 - lineW/2, 365, lineW, 4);
            ctx.fillStyle = strokeColor;
            ctx.shadowColor = strokeColor;
            ctx.shadowBlur = 10;
            ctx.fillRect(400 - lineW/2, 365, lineW * (boss.countdown / 300), 4);
            ctx.restore();
         }

        // Boss Lasers / Projectiles
        if (boss.state !== 'dead') {
          boss.lasers.forEach(l => {
             const lx = l.x - camX;
             ctx.save();
             if (currentStage === 2) {
               // Stage 2: Cyber App Icon (Phone, Mail, Wifi, Chat)
               const iconType = l.type || 'chat';
               const bgCol = iconType === 'phone' ? '#22c55e' : iconType === 'mail' ? '#3b82f6' : iconType === 'wifi' ? '#0ea5e9' : '#a855f7';
               ctx.shadowColor = bgCol;
               ctx.shadowBlur = 14;
               ctx.fillStyle = bgCol;
               ctx.beginPath();
               ctx.roundRect(lx, l.y, l.w, l.h, 8);
               ctx.fill();
               ctx.strokeStyle = '#ffffff';
               ctx.lineWidth = 2;
               ctx.stroke();

               ctx.fillStyle = '#ffffff';
               ctx.font = 'bold 16px sans-serif';
               ctx.textAlign = 'center';
               ctx.textBaseline = 'middle';
               const symbol = iconType === 'phone' ? '📞' : iconType === 'mail' ? '✉️' : iconType === 'wifi' ? '📶' : '💬';
               ctx.fillText(symbol, lx + l.w / 2, l.y + l.h / 2);
             } else {
               // Stage 1: Laser Bar
               ctx.shadowColor = '#3b82f6';
               ctx.shadowBlur = 15;
               ctx.fillStyle = '#60a5fa';
               ctx.fillRect(lx, l.y, l.w, l.h);
               ctx.fillStyle = '#ffffff';
               ctx.fillRect(lx, l.y + l.h/3, l.w, l.h/3);
             }
             ctx.restore();
          });
        }

        // Boss HP Bar & Label
        if (boss.countdown <= 0 && boss.state !== 'dead') {
          const barW = 300; // Wider
          const barH = 16;  // Taller
          const barX = 400 - barW / 2; // Center screen top
          const barY = 40;
          
          /*
          // Container
          ctx.save();
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.shadowColor = '#000';
          ctx.shadowBlur = 15;
          ctx.roundRect(barX - 4, barY - 4, barW + 8, barH + 8, 8);
          ctx.fill();
          
          // Empty Bar
          ctx.fillStyle = '#1e293b';
          ctx.roundRect(barX, barY, barW, barH, 4);
          ctx.fill();
          
          // HP Fill with gradient
          const hpGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
          if (currentStage === 2) {
            hpGrad.addColorStop(0, '#c084fc');
            hpGrad.addColorStop(1, '#9333ea');
          } else {
            hpGrad.addColorStop(0, '#f43f5e');
            hpGrad.addColorStop(1, '#e11d48');
          }
          ctx.fillStyle = hpGrad;
          ctx.roundRect(barX, barY, barW * (boss.hp / boss.maxHp), barH, 4);
          ctx.fill();
          
          // Text (Removed)
          
          if (boss.bossRetries > 0) {
             ctx.fillStyle = '#fbbf24';
             ctx.font = 'bold 10px sans-serif';
             ctx.fillText(`Percobaan Tersisa: ${boss.bossRetries}`, 400, barY + barH + 18);
          }
          ctx.restore();
          */
        }
      }

      // Draw Obstacles (Komputer Jahat, Telepon Jahat, Keyboard Terbakar, Puddle, Cone)
      for (const obs of engine.obstacles) {
        if (obs.destroyed) continue;
        const ox = obs.x - camX;
        if (ox + obs.w < -50 || ox > canvas.width + 50) continue;

        const animOffset = Math.sin(p.animFrame * 3) * 3;
        const legStep = Math.sin(p.animFrame * 4) * 4;

        if (obs.type === 'computer_evil') {
          // Stage 1: Komputer Jahat (Scaled cleanly to obs.w x obs.h)
          ctx.save();
          ctx.translate(ox, obs.y);
          ctx.scale(obs.w / 34, obs.h / 34);

          ctx.fillStyle = '#334155';
          ctx.fillRect(-8, 10 + animOffset, 9, 4);
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.moveTo(-8, 8 + animOffset);
          ctx.lineTo(-13, 12 + animOffset);
          ctx.lineTo(-8, 16 + animOffset);
          ctx.fill();

          ctx.fillStyle = '#334155';
          ctx.fillRect(33, 10 - animOffset, 9, 4);
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.moveTo(42, 8 - animOffset);
          ctx.lineTo(47, 12 - animOffset);
          ctx.lineTo(42, 16 - animOffset);
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-1, -1, 36, 28);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, 0, 34, 26);
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(3, 3, 28, 20);

          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.moveTo(6, 5);
          ctx.lineTo(13, 9);
          ctx.lineTo(6, 11);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(28, 5);
          ctx.lineTo(21, 9);
          ctx.lineTo(28, 11);
          ctx.fill();

          ctx.fillStyle = '#000000';
          ctx.fillRect(5, 12, 24, 9);
          ctx.fillStyle = '#ffffff';
          for (let tx = 0; tx < 4; tx++) {
            ctx.beginPath();
            ctx.moveTo(6 + tx * 5.5, 12);
            ctx.lineTo(8.5 + tx * 5.5, 16);
            ctx.lineTo(11 + tx * 5.5, 12);
            ctx.fill();
          }

          ctx.fillStyle = '#334155';
          ctx.fillRect(6 + legStep, 26, 5, 8);
          ctx.fillRect(22 - legStep, 26, 5, 8);
          ctx.restore();

        } else if (obs.type === 'phone_evil') {
          // Stage 2: Telepon Jahat (Scaled cleanly to obs.w x obs.h)
          ctx.save();
          ctx.translate(ox, obs.y);
          ctx.scale(obs.w / 36, obs.h / 38);

          ctx.fillStyle = '#7f1d1d';
          ctx.fillRect(2, 10, 32, 20);
          ctx.fillStyle = '#4c0519';
          ctx.fillRect(5, 6, 26, 6);

          ctx.fillStyle = '#991b1b';
          ctx.beginPath();
          ctx.arc(8, 2, 6, 0, Math.PI * 2);
          ctx.arc(28, 2, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(8, -1, 20, 5);

          ctx.strokeStyle = '#450a0a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(6, 12);
          ctx.lineTo(2, 6);
          ctx.stroke();

          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(18, 18, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(16, 16, 4, 4);

          ctx.fillStyle = '#000000';
          ctx.fillRect(6, 22, 24, 7);
          ctx.fillStyle = '#ffffff';
          for (let tx = 0; tx < 4; tx++) {
            ctx.beginPath();
            ctx.moveTo(7 + tx * 5.5, 22);
            ctx.lineTo(9.5 + tx * 5.5, 26);
            ctx.lineTo(12 + tx * 5.5, 22);
            ctx.fill();
          }

          ctx.fillStyle = '#450a0a';
          ctx.fillRect(6 + legStep, 30, 5, 8);
          ctx.fillRect(22 - legStep, 30, 5, 8);
          ctx.restore();

        } else if (obs.type === 'keyboard_evil') {
          // Stage 3: Keyboard Terbakar (Scaled cleanly to obs.w x obs.h)
          ctx.save();
          ctx.translate(ox, obs.y);
          ctx.scale(obs.w / 38, obs.h / 34);

          for (let f = 0; f < 5; f++) {
            const fireOffsetX = f * 8 + 4;
            const flickerY = Math.sin(p.animFrame * 6 + f) * 5;
            ctx.fillStyle = f % 2 === 0 ? '#ef4444' : '#f59e0b';
            ctx.beginPath();
            ctx.arc(fireOffsetX, -4 + flickerY, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.arc(fireOffsetX, -2 + flickerY, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-2, 4, 42, 24);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, 6, 38, 20);

          ctx.fillStyle = '#dc2626';
          for (let ky = 0; ky < 2; ky++) {
            for (let kx = 0; kx < 6; kx++) {
              ctx.fillRect(3 + kx * 6, 8 + ky * 5, 4, 3);
            }
          }

          ctx.fillStyle = '#000000';
          ctx.fillRect(4, 18, 30, 7);
          ctx.fillStyle = '#ffffff';
          for (let tx = 0; tx < 5; tx++) {
            ctx.beginPath();
            ctx.moveTo(5 + tx * 5.5, 18);
            ctx.lineTo(7.5 + tx * 5.5, 22);
            ctx.lineTo(10 + tx * 5.5, 18);
            ctx.fill();
          }

          ctx.fillStyle = '#ea580c';
          ctx.fillRect(-7, 12 + animOffset, 7, 3);
          ctx.fillRect(38, 12 - animOffset, 7, 3);

          ctx.fillStyle = '#0284c7';
          ctx.fillRect(8 + legStep, 26, 5, 8);
          ctx.fillRect(25 - legStep, 26, 5, 8);
          ctx.restore();

        } else if (obs.type === 'fire') {
          // Stage: Api (Rintangan Api) - Improved Visuals & Slower Speed
          const flickerSpeed = 4; // Much slower than 22
          const flicker = Math.sin(p.animFrame * flickerSpeed) * 3;
          const flickerLarge = Math.sin(p.animFrame * (flickerSpeed * 0.8)) * 6;
          
          // 1. Dark Red/Smoke Glow (Outer Base)
          ctx.shadowColor = '#991b1b';
          ctx.shadowBlur = 15;
          ctx.fillStyle = '#7f1d1d';
          ctx.beginPath();
          ctx.moveTo(ox - 5, obs.y + obs.h);
          ctx.quadraticCurveTo(ox + obs.w / 2, obs.y - 15 + flickerLarge, ox + obs.w + 5, obs.y + obs.h);
          ctx.fill();
          ctx.shadowBlur = 0;

          // 2. Main Red Body
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(ox, obs.y + obs.h);
          ctx.lineTo(ox + obs.w / 2, obs.y - 5 + flicker);
          ctx.lineTo(ox + obs.w, obs.y + obs.h);
          ctx.fill();

          // 3. Amber Mid-Layer
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.moveTo(ox + 6, obs.y + obs.h);
          ctx.lineTo(ox + obs.w / 2, obs.y + 5 + flickerLarge * 0.7);
          ctx.lineTo(ox + obs.w - 6, obs.y + obs.h);
          ctx.fill();

          // 4. Yellow Core
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.moveTo(ox + 12, obs.y + obs.h);
          ctx.lineTo(ox + obs.w / 2, obs.y + 12 + flicker * 0.5);
          ctx.lineTo(ox + obs.w - 12, obs.y + obs.h);
          ctx.fill();

          // 5. White Hot Center
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(ox + 18, obs.y + obs.h);
          ctx.lineTo(ox + obs.w / 2, obs.y + 18 + flickerLarge * 0.3);
          ctx.lineTo(ox + obs.w - 18, obs.y + obs.h);
          ctx.fill();

          // 6. Floating Ember Particles
          const particleCount = 3;
          for (let pi = 0; particleCount > pi; pi++) {
            const px = ox + (obs.w / 2) + Math.sin(p.animFrame * (2 + pi)) * 15;
            const py = obs.y + 10 - ((p.animFrame * 50 + pi * 100) % 60);
            if (py < obs.y + 15) {
              ctx.fillStyle = '#facc15';
              ctx.beginPath();
              ctx.arc(px, py, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        } else if (obs.type === 'cone') {
          // Upgraded Safety Traffic Cone with Heavy Base & Reflective Bands
          ctx.save();
          ctx.fillStyle = 'rgba(0,0,0,0.22)';
          ctx.beginPath();
          ctx.ellipse(ox + obs.w / 2, obs.y + obs.h, obs.w * 0.55, 4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(ox - 2, obs.y + obs.h - 5, obs.w + 4, 5);
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.moveTo(ox + obs.w / 2 - 3, obs.y);
          ctx.lineTo(ox + obs.w / 2 + 3, obs.y);
          ctx.lineTo(ox + obs.w - 2, obs.y + obs.h - 5);
          ctx.lineTo(ox + 2, obs.y + obs.h - 5);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#7c2d12';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(ox + 7, obs.y + 12, obs.w - 14, 5);
          ctx.fillRect(ox + 5, obs.y + 23, obs.w - 10, 4);
          ctx.restore();
        } else if (obs.type === 'homework') {
          // Upgraded Flying PR Paper with Animated Wings & Notebook Lines
          ctx.save();
          ctx.translate(ox, obs.y);
          ctx.scale(obs.w / 26, obs.h / 30);
          const wingFlap = Math.sin(p.animFrame * 6) * 5;
          // Little flying wings
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.moveTo(0, 12);
          ctx.lineTo(-10, 6 + wingFlap);
          ctx.lineTo(-7, 17);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(26, 12);
          ctx.lineTo(36, 6 + wingFlap);
          ctx.lineTo(33, 17);
          ctx.closePath();
          ctx.fill();
          // Notebook page
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 26, 30);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(0, 0, 26, 30);
          ctx.strokeStyle = '#bae6fd';
          ctx.lineWidth = 0.8;
          for (let ly = 7; ly < 27; ly += 5) {
            ctx.beginPath();
            ctx.moveTo(2, ly);
            ctx.lineTo(24, ly);
            ctx.stroke();
          }
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('PR', 4, 19);
          ctx.restore();
        }
      }

      // Final Destination Building per Stage
      // Stage 1: SMPN 1 KAWALI (Sekolah)
      // Stage 2: BUMI PERKEMAHAN PRAMUKA (Tempat Kemah)
      // Stage 3: MUSEUM WISATA SAINS & TEKNOLOGI (Tempat Wisata)
      // Stage 4: ALUN-ALUN KOTA CIAMIS (Monumen Bunga Rafflesia)
      const gateX = engine.schoolGateX - camX;
      if (gateX > -500 && gateX < canvas.width + 500) {
        if (currentStage === 1) {
          drawSekolah(ctx, gateX - 25, 380, p.animFrame, false, 'GERBANG KEDATANGAN UTAMA');
        } else if (currentStage === 2) {
          drawTempatKemah(ctx, gateX - 45, 380, p.animFrame);
        } else if (currentStage === 3) {
          drawTempatWisata(ctx, gateX - 55, 380, p.animFrame);
        } else {
          drawAlunAlunCiamis(ctx, gateX - 65, 380, p.animFrame);
        }
      }

      // Render Keyboard Gun Bullets with Cyber Speed Trail
      for (const b of engine.bullets) {
        const bx = b.x - camX;
        if (bx < -40 || bx > canvas.width + 40) continue;
        ctx.save();
        const trailX = b.vx > 0 ? bx - 18 : bx + b.w;
        const trailGrad = ctx.createLinearGradient(trailX, b.y, trailX + 18, b.y);
        trailGrad.addColorStop(0, b.vx > 0 ? 'rgba(56, 189, 248, 0)' : 'rgba(56, 189, 248, 0.5)');
        trailGrad.addColorStop(1, b.vx > 0 ? 'rgba(56, 189, 248, 0.5)' : 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = trailGrad;
        ctx.fillRect(trailX, b.y + 4, 18, b.h - 8);

        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(bx, b.y, b.w, b.h);
        ctx.strokeStyle = '#7dd3fc';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, b.y, b.w, b.h);
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 12px sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText('⌨️', bx + 4, b.y + b.h / 2 + 1);
        ctx.restore();
      }

      // Draw Character from Attached Image Asset Sprite Sheet
      const px = p.x - camX;
      const py = p.y;

      // Ground Contact Shadow directly beneath character
      const shadowScale = p.isGrounded ? 1 : Math.max(0.4, 1 - (380 - (py + p.height)) / 240);
      if (shadowScale > 0.35 && py + p.height <= 390) {
        ctx.fillStyle = `rgba(0, 0, 0, ${(0.28 * shadowScale).toFixed(2)})`;
        ctx.beginPath();
        ctx.ellipse(px + p.width / 2, Math.min(380, p.isGrounded ? py + p.height : 380), 18 * shadowScale, 4.5 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Mini Keyboard Icon Indicator behind Character when Keyboard Gun or Boss Ammo is Active
      if (p.keyboardGunFrames > 0 || (p.bulletsLeft && p.bulletsLeft > 0)) {
        ctx.save();
        const iconX = p.direction === 'right' ? px - 18 : px + p.width + 4;
        const iconY = py + 10 + Math.sin(p.animFrame * 3) * 3;
        const label = p.keyboardGunFrames > 0
          ? `${Math.ceil(p.keyboardGunFrames / 60)}s`
          : `${p.bulletsLeft}x`;

        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(iconX - 2, iconY - 2, 22, 18);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(iconX - 2, iconY - 2, 22, 18);

        ctx.font = '10px sans-serif';
        ctx.fillText('⌨️', iconX + 1, iconY + 11);

        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(label, iconX + 2, iconY - 4);
        ctx.restore();
      }

      {
        ctx.save();
        if (p.invulnerableFrames > 0 && Math.floor(p.invulnerableFrames / 3) % 2 === 0) {
          ctx.globalAlpha = 0.45; // Keep pose visible while blinking during hit invulnerability
        }

        if (p.superPowerFrames > 0) {
          ctx.save();
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 25;
          ctx.fillStyle = 'rgba(250, 204, 21, 0.45)';
          ctx.beginPath();
          ctx.arc(px + p.width / 2, py + p.height / 2, 40, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        const isFrozen = (currentStage === 1 || currentStage === 2) && engine.boss && engine.boss.countdown > 0;
        const isMoving = !isFrozen && Math.abs(p.vx) > 0.5;
        const isJumping = !p.isGrounded;
        const hasGunAmmo = p.keyboardGunFrames > 0 || (p.bulletsLeft !== undefined && p.bulletsLeft > 0);
        const isShootingWithKeyboard = !isFrozen && ((hasGunAmmo && keysRef.current.shoot) || (p.shootCooldown !== undefined && p.shootCooldown > 0));

        let activeImg: HTMLCanvasElement | HTMLImageElement | null = null;

        if (isShootingWithKeyboard && isSpriteReady(poseImagesRef.current[7])) {
          activeImg = poseImagesRef.current[7]; // Pose menembak (index 7)
        } else if (isJumping) {
          // Loncat 3 pose: index 4, 5, 6
          const jumpPoseIdx = p.vy < 0 ? 4 : p.vy > 2 ? 6 : 5;
          activeImg = [poseImagesRef.current[jumpPoseIdx], poseImagesRef.current[4], poseImagesRef.current[0]].find(isSpriteReady) || null;
        } else if (isMoving) {
          // Berlari 3 pose: index 1, 2, 3
          const runPoseIdx = Math.floor(p.animFrame * 3) % 3 + 1;
          activeImg = [poseImagesRef.current[runPoseIdx], poseImagesRef.current[1], poseImagesRef.current[0]].find(isSpriteReady) || null;
        } else {
          // Pose depan: index 0
          activeImg = poseImagesRef.current.find(isSpriteReady) || null;
        }

        if (activeImg && isSpriteReady(activeImg)) {
          const naturalW = (activeImg as HTMLCanvasElement).width || (activeImg as HTMLImageElement).naturalWidth || 400;
          const naturalH = (activeImg as HTMLCanvasElement).height || (activeImg as HTMLImageElement).naturalHeight || 400;
          const aspect = naturalW / naturalH;
          const drawH = 80;
          const drawW = drawH * aspect;
          const drawX = px + (p.width - drawW) / 2;
          const drawY = py + p.height - drawH + 2; // Align feet exactly to platform top

          ctx.save();
          if (p.direction === 'left') {
            ctx.scale(-1, 1);
            ctx.drawImage(activeImg, 0, 0, naturalW, naturalH, -(drawX + drawW), drawY, drawW, drawH);
          } else {
            ctx.drawImage(activeImg, 0, 0, naturalW, naturalH, drawX, drawY, drawW, drawH);
          }
          ctx.restore();
        } else {
          // Fallback
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(px, py, p.width, p.height);
        }

        ctx.restore();
      }

      // Draw Visual FX Particles + Floating Score Popups
      for (let i = 0; i < fxParticlesRef.current.length; i++) {
        const pt = fxParticlesRef.current[i];
        const fxX = pt.x - camX;
        if (fxX < -20 || fxX > 820) continue;
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.fillRect(fxX - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
        ctx.restore();
      }

      for (let i = 0; i < fxPopupsRef.current.length; i++) {
        const fp = fxPopupsRef.current[i];
        const fxX = fp.x - camX;
        ctx.save();
        ctx.globalAlpha = Math.min(1, fp.life / 16);
        ctx.font = '900 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#0f172a';
        ctx.strokeText(fp.text, fxX, fp.y);
        ctx.fillStyle = fp.color;
        ctx.fillText(fp.text, fxX, fp.y);
        ctx.restore();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, activeQuiz, currentStage]);

  return (
    <div ref={gameContainerRef} className={cn(
      "space-y-3 font-sans transition-all duration-300 w-full h-full flex flex-col",
      isFullScreen ? "fixed inset-0 z-[9999] bg-slate-950 p-2 md:p-4 w-full h-full overflow-hidden" : "mx-auto max-w-6xl"
    )}>
      {/* HUD Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900 text-white p-3 md:p-4 rounded-2xl border border-slate-800 shadow-md gap-3 shrink-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Stage Badge */}
          <div className="px-3 py-1 bg-brand text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm">
            <span>Stage {currentStage}:</span>
            <span>{currentStage === 1 ? 'Berangkat Sekolah' : currentStage === 2 ? 'Kegiatan Pramuka' : currentStage === 3 ? 'Study Tour Edukasi' : 'Menuju Kota Ciamis'}</span>
          </div>

          <div className="flex items-center gap-1 font-black text-rose-500 text-base">
            {Array.from({ length: Math.max(3, lives) }).map((_, i) => (
              <span key={i} className={cn("transition-all", i < lives ? "opacity-100 scale-100" : "opacity-20 scale-75")}>
                ❤️
              </span>
            ))}
          </div>

          <div className="text-xs font-bold text-slate-300">
            Jarak: <span className="text-amber-400 font-mono font-black text-sm">{distanceRemaining}m</span> ke {currentStage === 1 ? 'SMPN 1 Kawali' : currentStage === 2 ? 'Bumi Perkemahan' : currentStage === 3 ? 'Museum Wisata' : 'Alun-Alun Ciamis'}
          </div>

          {superPowerActive && (
            <div className="px-2.5 py-1 bg-amber-400 text-amber-950 text-[10px] font-black rounded-lg animate-pulse flex items-center gap-1">
              ⚡ SUPER KUAT (INVINCIBLE)
            </div>
          )}

          {keyboardGunActive && (
            <div className="px-2.5 py-1 bg-sky-500 text-slate-950 text-[10px] font-black rounded-lg animate-pulse flex items-center gap-1 shadow-sm">
              ⌨️ PISTOL KEYBOARD ({Math.ceil((engineRef.current?.player?.keyboardGunFrames || 0) / 60)}s) [Z]
            </div>
          )}

          {bossBulletsCount > 0 && (
            <div className="px-2.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-lg animate-pulse flex items-center gap-1 shadow-sm">
              ⌨️ PELURU: {bossBulletsCount} [Z]
            </div>
          )}

          {/* BOSS HP Removed from HUD as requested */}
        </div>

        <div className="flex items-center gap-2 ml-auto sm:ml-0 flex-wrap">
          {isAdmin && (
            <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-purple-500/40">
              <span className="text-[10px] font-black text-amber-400 px-1 uppercase tracking-wider hidden sm:inline">⚡ Admin:</span>
              <button
                onClick={() => startBossFightStage1()}
                className="px-2 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[10px] font-black rounded-lg transition-all shadow-xs flex items-center gap-1 active:scale-95"
                title="Langsung Uji Coba Bos Stage 1"
              >
                🔥 Bos 1
              </button>
              <button
                onClick={() => startBossFightStage2()}
                className="px-2 py-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-[10px] font-black rounded-lg transition-all shadow-xs flex items-center gap-1 active:scale-95"
                title="Langsung Uji Coba Bos Stage 2 (Loncat & Cyber App Icons)"
              >
                🔥 Bos 2
              </button>
              <button
                onClick={() => {
                  if (engineRef.current?.player) {
                    const nextBullets = (engineRef.current.player.bulletsLeft || 0) + 30;
                    engineRef.current.player.bulletsLeft = nextBullets;
                    setBossBulletsCount(nextBullets);
                    setKeyboardGunActive(true);
                  }
                }}
                className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black rounded-lg transition-all shadow-xs flex items-center gap-1 active:scale-95"
                title="Tambah 30 Peluru Pistol Keyboard"
              >
                ⌨️ +30 Peluru
              </button>
            </div>
          )}

          <div className="px-3.5 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black rounded-xl">
            Skor: {score}
          </div>

          {/* Layar Penuh Toggle Button */}
          <button
            onClick={toggleFullScreen}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl transition-all active:scale-95 flex items-center gap-1 text-xs font-black"
            title={isFullScreen ? "Keluar Layar Penuh" : "Mode Layar Penuh (Fullscreen)"}
          >
            {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
            <span className="hidden md:inline">{isFullScreen ? "Kecilkan" : "Layar Penuh"}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport - Fully Responsive Aspect Ratio Container */}
      <div className={cn(
        "relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 border-slate-900 bg-slate-950 shadow-2xl flex flex-col items-center justify-center transition-all",
        isFullScreen ? "fixed inset-0 w-full h-full z-[9999] rounded-none border-0" : "w-full flex-1 min-h-0"
      )}>
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="w-full h-full object-contain bg-slate-950"
        />

        {/* Semi-Transparent In-Game Touch Controls Overlay (Shown on Touchscreen while playing) */}
        {isTouchDevice && gameState === 'playing' && !activeQuiz && (
          <div className="absolute inset-x-0 bottom-2.5 sm:bottom-4 px-3 sm:px-5 flex items-end justify-between gap-4 pointer-events-none z-30 touch-none select-none">
            <div className="flex items-center gap-2.5 sm:gap-3 pointer-events-auto">
              <button
                type="button"
                onContextMenu={(e) => e.preventDefault()}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.currentTarget.setPointerCapture?.(e.pointerId);
                  setControlState('left', true);
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  setControlState('left', false);
                }}
                onPointerCancel={() => setControlState('left', false)}
                onLostPointerCapture={() => setControlState('left', false)}
                className="w-14 h-12 sm:w-16 sm:h-14 bg-slate-900/45 hover:bg-slate-800/60 active:bg-brand/75 text-white/90 font-black text-xl rounded-2xl border border-white/25 backdrop-blur-[2px] flex items-center justify-center shadow-lg active:scale-95 transition-transform select-none touch-none"
              >
                ◀
              </button>
              <button
                type="button"
                onContextMenu={(e) => e.preventDefault()}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.currentTarget.setPointerCapture?.(e.pointerId);
                  setControlState('right', true);
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  setControlState('right', false);
                }}
                onPointerCancel={() => setControlState('right', false)}
                onLostPointerCapture={() => setControlState('right', false)}
                className="w-14 h-12 sm:w-16 sm:h-14 bg-slate-900/45 hover:bg-slate-800/60 active:bg-brand/75 text-white/90 font-black text-xl rounded-2xl border border-white/25 backdrop-blur-[2px] flex items-center justify-center shadow-lg active:scale-95 transition-transform select-none touch-none"
              >
                ▶
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
              {(keyboardGunActive || bossBulletsCount > 0) && (
                <button
                  type="button"
                  onContextMenu={(e) => e.preventDefault()}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.currentTarget.setPointerCapture?.(e.pointerId);
                    setControlState('shoot', true);
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault();
                    setControlState('shoot', false);
                  }}
                  onPointerCancel={() => setControlState('shoot', false)}
                  onLostPointerCapture={() => setControlState('shoot', false)}
                  className="w-20 sm:w-24 h-12 sm:h-14 bg-sky-500/50 hover:bg-sky-500/65 active:bg-sky-400/80 text-white/95 font-black text-xs rounded-2xl border border-sky-300/45 backdrop-blur-[2px] flex items-center justify-center gap-1 shadow-lg active:scale-95 transition-transform select-none touch-none"
                >
                  TEMBAK ⌨️
                </button>
              )}

              <button
                type="button"
                onContextMenu={(e) => e.preventDefault()}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.currentTarget.setPointerCapture?.(e.pointerId);
                  setControlState('jump', true);
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  setControlState('jump', false);
                }}
                onPointerCancel={() => setControlState('jump', false)}
                onLostPointerCapture={() => setControlState('jump', false)}
                className="w-20 sm:w-24 h-12 sm:h-14 bg-emerald-500/50 hover:bg-emerald-500/65 active:bg-emerald-400/80 text-white/95 font-black text-xs sm:text-sm rounded-2xl border border-emerald-300/45 backdrop-blur-[2px] flex items-center justify-center gap-1 shadow-lg active:scale-95 transition-transform select-none touch-none"
              >
                LOMPAT ▲
              </button>
            </div>
          </div>
        )}

        {/* Start Overlay & Stage Selector */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 text-white space-y-4 z-40 overflow-y-auto">
            <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center shadow-lg text-3xl animate-bounce">
              🎒
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Petualangan Ke Sekolah & Kota Ciamis</h2>
            <p className="text-xs text-slate-300 max-w-md font-medium leading-relaxed">
              Pilih Stage petualangan kamu! Kumpulkan RAM & Laptop, serta jawab Kuis Kotak Emas dari materi <strong className="text-amber-300">{activeCourseObj?.title || 'Informatika'}</strong>!
            </p>

            {/* Stage Selector Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-800/90 border border-slate-700 rounded-2xl max-w-2xl w-full justify-center flex-wrap">
              <button
                onClick={() => startGame(1)}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5",
                  currentStage === 1 ? "bg-brand text-white shadow-md" : "bg-slate-700/80 text-slate-300 hover:bg-slate-700"
                )}
              >
                <span>🎒 Stage 1</span>
                <span className="text-[10px] opacity-80">(175m)</span>
                {(studentStageHighScores?.[1] || 0) > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-amber-950 text-[9px] font-black">
                    🏆 {studentStageHighScores?.[1]}
                  </span>
                )}
              </button>
              <button
                onClick={() => startGame(2)}
                disabled={!isAdmin && !completedStages.includes(1)}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5",
                  currentStage === 2 ? "bg-amber-600 text-white shadow-md" : "bg-slate-700/80 text-slate-300 hover:bg-slate-700",
                  !isAdmin && !completedStages.includes(1) && "opacity-50 cursor-not-allowed"
                )}
              >
                <span>{!isAdmin && !completedStages.includes(1) ? '🔒' : '🏕️'} Stage 2</span>
                <span className="text-[10px] opacity-80">(190m)</span>
                {(studentStageHighScores?.[2] || 0) > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-amber-950 text-[9px] font-black">
                    🏆 {studentStageHighScores?.[2]}
                  </span>
                )}
              </button>
              <button
                onClick={() => startGame(3)}
                disabled={!isAdmin && !completedStages.includes(2)}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5",
                  currentStage === 3 ? "bg-indigo-600 text-white shadow-md" : "bg-slate-700/80 text-slate-300 hover:bg-slate-700",
                  !isAdmin && !completedStages.includes(2) && "opacity-50 cursor-not-allowed"
                )}
              >
                <span>{!isAdmin && !completedStages.includes(2) ? '🔒' : '🏛️'} Stage 3</span>
                <span className="text-[10px] opacity-80">(200m)</span>
                {(studentStageHighScores?.[3] || 0) > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-amber-950 text-[9px] font-black">
                    🏆 {studentStageHighScores?.[3]}
                  </span>
                )}
              </button>
              <button
                onClick={() => startGame(4)}
                disabled={!isAdmin && !completedStages.includes(3)}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5",
                  currentStage === 4 ? "bg-emerald-600 text-white shadow-md" : "bg-slate-700/80 text-slate-300 hover:bg-slate-700",
                  !isAdmin && !completedStages.includes(3) && "opacity-50 cursor-not-allowed"
                )}
              >
                <span>{!isAdmin && !completedStages.includes(3) ? '🔒' : '🌺'} Stage 4</span>
                <span className="text-[10px] opacity-80">(220m)</span>
                {(studentStageHighScores?.[4] || 0) > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-amber-950 text-[9px] font-black">
                    🏆 {studentStageHighScores?.[4]}
                  </span>
                )}
              </button>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 text-xs text-left max-w-md space-y-1 text-slate-300">
              <p className="font-black text-amber-400 uppercase tracking-wider text-[11px]">🎯 Informasi Stage {currentStage}:</p>
              <p className="text-[11px] font-semibold">
                • <strong>Kuis Materi:</strong> {activeCourseObj?.title || 'Informatika'}<br/>
                • <strong>Destinasi:</strong> {currentStage === 1 ? 'SMPN 1 Kawali' : currentStage === 2 ? 'Bumi Perkemahan Pramuka' : currentStage === 3 ? 'Museum Wisata Sains' : 'Alun-Alun Kota Ciamis (Monumen Rafflesia)'}<br/>
                • <strong>Monster:</strong> {currentStage === 1 ? 'Komputer Jahat & Boss Core Virus' : currentStage === 2 ? 'Telepon Jahat (Lompat) & Boss Cyber Bot (Senjata Aplikasi)' : currentStage === 3 ? 'Keyboard Terbakar Bergigi' : 'Kombinasi Monster Cyber'}
              </p>
            </div>

            {posesLoadedCount < PLAYER_POSE_PATHS.length && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-[11px] font-bold text-sky-300">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span>Menyiapkan gambar pose karakter ({posesLoadedCount}/{PLAYER_POSE_PATHS.length})...</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 flex-wrap justify-center">
              <button
                onClick={() => startGame(currentStage)}
                className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base md:text-lg rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Play size={20} /> Mulai Mainkan Stage {currentStage}!
              </button>

              {isAdmin && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => startBossFightStage1()}
                    className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs md:text-sm rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                    title="Uji coba pertarungan Bos Stage 1"
                  >
                    🔥 Coba Bos Stage 1
                  </button>

                  <button
                    onClick={() => startBossFightStage2()}
                    className="px-4 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs md:text-sm rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                    title="Uji coba pertarungan Bos Stage 2 (Tembak Aplikasi & Action Loncat)"
                  >
                    🔥 Coba Bos Stage 2 (Admin)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interactive Mystery Box Informatika Quiz Popup & Randomized Reward Choice */}
        {activeQuiz && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 text-white space-y-4 z-50 animate-in zoom-in-95 overflow-y-auto">
            <div className="w-14 h-14 bg-amber-400 text-amber-950 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg animate-bounce">
              {showRewardPicker ? '🎁' : '❓'}
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full">
                Kuis Kotak Emas • {activeCourseObj?.title || 'Informatika'}
              </span>
              <h3 className="text-base md:text-lg font-black max-w-md text-white leading-snug pt-1">
                {activeQuiz.question}
              </h3>
            </div>

            {quizFeedback && (
              <div className={cn(
                "p-3 rounded-2xl border text-xs font-bold max-w-md animate-in fade-in",
                quizFeedback.isCorrect ? "bg-emerald-950/90 border-emerald-500 text-emerald-200" : "bg-rose-950/90 border-rose-500 text-rose-200"
              )}>
                {quizFeedback.msg}
              </div>
            )}

            {showRewardPicker ? (
              <div className="w-full max-w-lg space-y-3 pt-2">
                {selectedRewardMsg ? (
                  <div className="p-4 bg-emerald-500/20 border-2 border-emerald-400 rounded-2xl text-emerald-300 font-black text-sm animate-pulse shadow-lg">
                    {selectedRewardMsg}
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-black text-amber-300 tracking-wide uppercase">
                      🎁 PILIH HADIAH SPESIAL KAMU ({availableRewards.length} PILIHAN AVAILABLE):
                    </p>
                    <div className={cn(
                      "grid gap-2.5 max-w-md mx-auto",
                      availableRewards.length === 1 ? "grid-cols-1" : availableRewards.length === 2 ? "grid-cols-2" : "grid-cols-3"
                    )}>
                      {availableRewards.map((reward) => (
                        <button
                          key={reward.type}
                          onClick={() => handlePickReward(reward.type)}
                          className={cn(
                            "p-3 bg-gradient-to-b border-2 rounded-2xl flex flex-col items-center text-center space-y-1.5 transition-all hover:scale-105 active:scale-95 shadow-md group cursor-pointer",
                            reward.bg
                          )}
                        >
                          <div className={cn("w-10 h-10 border rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform", reward.iconBg)}>
                            {reward.icon}
                          </div>
                          <span className="font-black text-xs text-white">{reward.title}</span>
                          <span className="text-[10px] text-slate-300 font-medium leading-tight">{reward.desc}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              !quizFeedback && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg pt-2">
                  {activeQuiz.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuizAnswer(idx)}
                      onMouseEnter={() => setSelectedOptionIdx(idx)}
                      className={cn(
                        "p-3 text-white border rounded-xl font-bold text-xs text-left transition-all active:scale-95 shadow-sm flex items-center gap-2",
                        selectedOptionIdx === idx 
                          ? "bg-brand border-brand ring-2 ring-brand/50 scale-[1.02]" 
                          : "bg-slate-800 border-slate-700 hover:border-slate-500"
                      )}
                    >
                      <span className={cn(
                        "font-mono font-black w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                        selectedOptionIdx === idx ? "bg-white text-brand" : "bg-slate-700 text-amber-400"
                      )}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* Victory Screen */}
        {gameState === 'win' && (
          <div className="absolute inset-0 bg-emerald-950/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 text-white space-y-4 animate-in zoom-in-95 z-40 overflow-y-auto">
            <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center text-amber-950 text-4xl shadow-2xl animate-bounce">
              🏆
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-amber-300">
              {currentStage === 4 ? "JUARA PETUALANGAN KOTA CIAMIS! 🎉" : `Selamat! Selesai Stage ${currentStage}! 🎉`}
            </h2>
            <p className="text-xs md:text-sm text-emerald-200 font-bold max-w-md">
              {currentStage === 1
                ? "Kamu berhasil tiba di SMPN 1 Kawali! Lanjut ke kegiatan Pramuka?"
                : currentStage === 2
                ? "Kamu berhasil mencapai Bumi Perkemahan Pramuka! Lanjut ke Study Tour Edukasi?"
                : currentStage === 3
                ? "Kamu berhasil mencapai Museum Wisata Sains! Lanjut ke Petualangan Kota Ciamis?"
                : "Selamat! Kamu telah menuntaskan seluruh 4 Stage Petualangan Edukasi Informatika!"}
            </p>

            <div className="bg-emerald-900/80 border border-emerald-700 p-4 rounded-2xl">
              <span className="text-xs text-emerald-300 uppercase font-black tracking-widest block">Total Skor Terkumpul:</span>
              <span className="text-4xl md:text-5xl font-black text-amber-400">{score}</span>
            </div>

            <div className="flex gap-3 flex-wrap justify-center pt-2">
              {currentStage < 4 ? (
                <button
                  onClick={() => startGame(currentStage + 1 as any)}
                  className="px-8 py-3.5 bg-amber-400 text-amber-950 font-black rounded-2xl text-sm hover:bg-amber-300 transition-all shadow-xl animate-pulse"
                >
                  Lanjut ke Stage {currentStage + 1} ➔
                </button>
              ) : (
                <button
                  onClick={() => startGame(1)}
                  className="px-6 py-3 bg-amber-400 text-amber-950 font-black rounded-xl text-sm hover:bg-amber-300 transition-all"
                >
                  Main Lagi Dari Stage 1 🔄
                </button>
              )}

              <button
                onClick={onClose}
                className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl text-sm hover:bg-slate-700 transition-all"
              >
                Tutup Permainan
              </button>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 text-white space-y-4 animate-in zoom-in-95 z-40">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-500 border border-rose-500/40 rounded-full flex items-center justify-center text-3xl">
              ⚠️
            </div>
            <h2 className="text-2xl font-black text-rose-400">Game Over - Kehabisan Nyawa!</h2>
            <p className="text-xs text-slate-300 font-medium max-w-xs">
              Coba lagi Stage {currentStage}! Kumpulkan RAM & Laptop, serta jawab Kuis Kotak Emas untuk mendapatkan Super Power Kuat!
            </p>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-bold block">Skor Terkumpul:</span>
              <span className="text-3xl font-black text-white">{score}</span>
            </div>
            <button
              onClick={() => startGame(currentStage)}
              className="px-8 py-3.5 bg-brand text-white font-black rounded-xl text-sm shadow-lg hover:scale-105 transition-all"
            >
              Coba Lagi Stage {currentStage} 🔄
            </button>
          </div>
        )}
      </div>

      {/* Desktop Keyboard Guide (Only shown on non-touchscreen devices) */}
      {!isTouchDevice && (
        <div className="bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-800 flex items-center justify-center gap-4 shrink-0 text-xs text-slate-300 font-semibold">
          <span>⌨️ Kontrol Keyboard:</span>
          <span className="text-emerald-400">
            {(keyboardGunActive || bossBulletsCount > 0)
              ? "Panah Kiri/Kanan (Gerak) • Panah Atas / Spasi (Lompat) • [Z] (Tembak)"
              : "Panah Kiri/Kanan atau A/D (Gerak) • Panah Atas / Spasi (Lompat)"}
          </span>
        </div>
      )}
    </div>
  );
}
