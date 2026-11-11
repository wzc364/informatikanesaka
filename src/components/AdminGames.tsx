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
  MoveDown
} from 'lucide-react';
import { cn } from '../utils';
import { doc, setDoc, collection, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { COURSES } from '../constants';

export interface GameItem {
  id: string;
  title: string;
  category: string;
  description: string;
  iconName: 'Calculator' | 'Code' | 'Puzzle' | 'Gamepad2';
  difficulty: 'Mudah' | 'Sedang' | 'Tantangan';
  defaultTimerSec: number;
}

function GameCardBanner({ gameId }: { gameId: string }) {
  if (gameId === 'petualangan-smp') {
    return (
      <div className="h-32 w-full rounded-2xl overflow-hidden bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-950 relative p-4 flex items-center justify-between text-white shadow-inner mb-4">
        <div className="space-y-1.5 z-10 max-w-[70%]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-300 shadow-xs">
              🏃 2D Platformer SMP
            </span>
            <span className="text-[10px] font-bold text-sky-200 bg-white/10 px-2 py-0.5 rounded-full border border-white/20">
              3 Stage Petualangan
            </span>
          </div>
          <h4 className="text-lg font-black tracking-tight drop-shadow-sm">Petualangan Ke Sekolah & Wisata</h4>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-sky-100 flex-wrap">
            <span className="bg-sky-950/80 border border-sky-400/40 px-2 py-0.5 rounded-md">🏠 Rumah</span>
            <span>➔</span>
            <span className="bg-blue-950/80 border border-blue-400/40 px-2 py-0.5 rounded-md">🏫 SMPN 1</span>
            <span>➔</span>
            <span className="bg-emerald-950/80 border border-emerald-400/40 px-2 py-0.5 rounded-md">🏕️ Kemah</span>
            <span>➔</span>
            <span className="bg-purple-950/80 border border-purple-400/40 px-2 py-0.5 rounded-md">🏛️ Wisata</span>
          </div>
        </div>
        <div className="relative w-28 h-20 shrink-0 flex items-center justify-center">
          <div className="absolute left-0 top-1 text-2xl animate-bounce">🎒</div>
          <div className="absolute right-1 top-2 text-2xl">🏛️</div>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] bg-slate-900/90 px-2 py-0.5 rounded-md text-amber-300 font-mono font-bold whitespace-nowrap border border-amber-400/30">
            3 Rute Edukasi
          </div>
        </div>
      </div>
    );
  }

  if (gameId === 'pattern-master') {
    return (
      <div className="h-32 w-full rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-slate-900 relative p-4 flex items-center justify-between text-white shadow-inner mb-4">
        <div className="space-y-1.5 z-10">
          <span className="text-[10px] font-black uppercase tracking-widest bg-purple-400 text-purple-950 px-2.5 py-0.5 rounded-full border border-purple-300 shadow-xs">
            🔍 Detektif Pola
          </span>
          <h4 className="text-lg font-black tracking-tight drop-shadow-sm">Detektif Pola Bilangan</h4>
          <div className="flex items-center gap-1.5 text-xs font-mono font-black text-amber-300">
            <span className="bg-white/10 px-2 py-1 rounded-lg">3</span> ➔
            <span className="bg-white/10 px-2 py-1 rounded-lg">7</span> ➔
            <span className="bg-white/10 px-2 py-1 rounded-lg">11</span> ➔
            <span className="bg-amber-400 text-amber-950 px-2 py-1 rounded-lg animate-pulse">?</span>
          </div>
        </div>
        <div className="text-5xl opacity-80 shrink-0">🔎</div>
      </div>
    );
  }

  if (gameId === 'scratch-blocks') {
    return (
      <div className="h-32 w-full rounded-2xl overflow-hidden bg-gradient-to-r from-amber-500 via-orange-600 to-slate-900 relative p-4 flex items-center justify-between text-white shadow-inner mb-4">
        <div className="space-y-1.5 z-10">
          <span className="text-[10px] font-black uppercase tracking-widest bg-amber-300 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-200 shadow-xs">
            🧩 Algoritma Visual
          </span>
          <h4 className="text-lg font-black tracking-tight drop-shadow-sm">Scratch Block Builder</h4>
          <div className="space-y-1 text-[10px] font-mono font-bold">
            <div className="bg-amber-400 text-amber-950 px-2 py-0.5 rounded w-fit">when 🚩 clicked</div>
            <div className="bg-blue-500 text-white px-2 py-0.5 rounded w-fit">move 10 steps</div>
          </div>
        </div>
        <div className="text-5xl opacity-80 shrink-0">🐱</div>
      </div>
    );
  }

  if (gameId === 'dekomposisi-puzzle') {
    return (
      <div className="h-32 w-full rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 relative p-4 flex items-center justify-between text-white shadow-inner mb-4">
        <div className="space-y-1.5 z-10">
          <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-300 text-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-xs">
            🧩 Modular System
          </span>
          <h4 className="text-lg font-black tracking-tight drop-shadow-sm">Dekomposisi Master</h4>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-100">
            <span className="bg-emerald-900/80 border border-emerald-400/40 px-2 py-0.5 rounded">Stok</span>
            <span>➔</span>
            <span className="bg-emerald-900/80 border border-emerald-400/40 px-2 py-0.5 rounded">Transaksi</span>
            <span>➔</span>
            <span className="bg-emerald-900/80 border border-emerald-400/40 px-2 py-0.5 rounded">Laporan</span>
          </div>
        </div>
        <div className="text-5xl opacity-80 shrink-0">🧩</div>
      </div>
    );
  }

  // star-catcher
  return (
    <div className="h-32 w-full rounded-2xl overflow-hidden bg-gradient-to-r from-violet-600 via-fuchsia-700 to-slate-900 relative p-4 flex items-center justify-between text-white shadow-inner mb-4">
      <div className="space-y-1.5 z-10">
        <span className="text-[10px] font-black uppercase tracking-widest bg-fuchsia-300 text-fuchsia-950 px-2.5 py-0.5 rounded-full border border-fuchsia-200 shadow-xs">
          ⭐ Game Arcade
        </span>
        <h4 className="text-lg font-black tracking-tight drop-shadow-sm">Star Catcher Arcade</h4>
        <div className="flex items-center gap-1 text-amber-300 text-sm animate-pulse">
          ⭐⭐⭐⭐⭐
        </div>
      </div>
      <div className="text-5xl opacity-80 shrink-0">🚀</div>
    </div>
  );
}

export const GAMES_LIST: GameItem[] = [
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
    title: 'Scratch Block Builder',
    category: 'Informatika / Scratch',
    description: 'Susun balok algoritma visual untuk mengarahkan Kucing Scratch meraih Bintang Emas!',
    iconName: 'Code',
    difficulty: 'Mudah',
    defaultTimerSec: 60
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
  },
  {
    id: 'petualangan-smp',
    title: 'Petualangan Ke Sekolah',
    category: 'Permainan 2D Platformer',
    description: 'Bantu anak SMP (seragam putih-biru) berangkat dari rumah ke SMPN 1 Kawali! Hindari lumpur, kerucut jalan & anjing galak.',
    iconName: 'Gamepad2',
    difficulty: 'Tantangan',
    defaultTimerSec: 90
  }
];

interface AdminGamesProps {
  isAdmin: boolean;
  currentStudent?: { id: string; nama: string; kelas: string; nis: string } | null;
  studentsList?: { id: string; nis: string; nama: string; kelas: string }[];
}

export default function AdminGames({ isAdmin, currentStudent, studentsList = [] }: AdminGamesProps) {
  const [activeTab, setActiveTab] = useState<'manage' | 'leaderboard' | 'play'>('manage');
  const [selectedGameId, setSelectedGameId] = useState<string>(GAMES_LIST[0].id);
  const [gameConfigs, setGameConfigs] = useState<Record<string, { isActive: boolean; timerSec?: number; stage1MateriId?: string; stage2MateriId?: string; stage3MateriId?: string }>>({});
  const [gameScores, setGameScores] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('all');
  const [filterGame, setFilterGame] = useState('all');

  // Drag and Drop state for game cards
  const [orderedGames, setOrderedGames] = useState<GameItem[]>(() => {
    try {
      const saved = localStorage.getItem('ruang_info_games_order');
      if (saved) {
        const parsedIds: string[] = JSON.parse(saved);
        const list = parsedIds
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
        localStorage.setItem('ruang_info_games_order', JSON.stringify(updated.map(g => g.id)));
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
      localStorage.setItem('ruang_info_games_order', JSON.stringify(updated.map(g => g.id)));
    } catch (err) {}
  };

  // Preview Modal / Active Game State
  const [activePlayGameId, setActivePlayGameId] = useState<string | null>(null);

  // Firestore Subscriptions
  useEffect(() => {
    const unsubConfigs = onSnapshot(collection(db, 'game_configs'), (snapshot) => {
      const configs: any = {};
      snapshot.docs.forEach(doc => {
        configs[doc.id] = doc.data();
      });
      setGameConfigs(configs);
    });

    const unsubScores = onSnapshot(collection(db, 'game_scores'), (snapshot) => {
      const scores = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setGameScores(scores);
    });

    return () => {
      unsubConfigs();
      unsubScores();
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

  // Filtered leaderboard
  const filteredScores = gameScores.filter(score => {
    const matchSearch = score.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        score.studentNis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        score.gameTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKelas = filterKelas === 'all' || score.studentKelas === filterKelas;
    const matchGame = filterGame === 'all' || score.gameId === filterGame;
    return matchSearch && matchKelas && matchGame;
  }).sort((a, b) => (b.score || 0) - (a.score || 0));

  // Extract unique classes
  const uniqueClasses = Array.from(new Set(studentsList.map(s => s.kelas).concat(gameScores.map(s => s.studentKelas)))).filter(Boolean).sort();

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-100 p-6 md:p-8 rounded-[2.5rem] border border-slate-300 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-brand text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20 shrink-0">
            <Gamepad2 size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand bg-brand/10 border border-brand/20 px-2.5 py-0.5 rounded-full">
                Permainan Edukatif
              </span>
              <span className="text-xs text-slate-500 font-bold">• 5 Game Interaktif</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {isAdmin ? "Kelola Permainan & Game Edukasi" : "Game Edukasi Informatika"}
            </h1>
            <p className="text-xs md:text-sm text-slate-600 font-medium mt-0.5">
              {isAdmin 
                ? "Aktifkan game, ubah urutan posisi kartu (Drag & Drop), dan pantau papan skor."
                : "Asah kemampuan logika, berpikir komputasi, dan matematika melalui permainan seru!"}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300 shrink-0">
          <button
            onClick={() => setActiveTab('manage')}
            className={cn(
              "px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2",
              activeTab === 'manage' 
                ? "bg-white text-slate-900 shadow-md" 
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Settings size={14} />
            Daftar Game
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={cn(
              "px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2",
              activeTab === 'leaderboard' 
                ? "bg-white text-slate-900 shadow-md" 
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Trophy size={14} className="text-amber-500" />
            Papan Skor ({gameScores.length})
          </button>
        </div>
      </div>

      {/* Main Tab 1: Manage / List Games */}
      {activeTab === 'manage' && (
        <div className="space-y-4">
          {isAdmin && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-semibold text-amber-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <GripVertical size={18} className="text-amber-600 shrink-0" />
                <span><strong>Petunjuk Admin:</strong> Klik dan seret (Drag & Drop) ikon <strong className="text-amber-950 font-black">⠿</strong> pada kartu game untuk mengatur ulang posisinya.</span>
              </div>
              <span className="text-[10px] bg-amber-200 text-amber-950 font-black px-2 py-0.5 rounded-full shrink-0">
                Auto-Saved
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                return (
                  <div 
                    key={game.id}
                    draggable={isAdmin}
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "p-6 md:p-8 rounded-[2rem] border-2 transition-all flex flex-col justify-between relative overflow-hidden bg-slate-100 shadow-sm hover:shadow-md",
                      isGameActive ? "border-slate-300" : "border-slate-200 opacity-80",
                      isDragging && "opacity-40 scale-95 border-dashed border-amber-500",
                      isDragOver && "ring-4 ring-brand/40 border-brand scale-[1.01]"
                    )}
                  >
                    <div>
                      {/* Visual Card Illustration Banner */}
                      <GameCardBanner gameId={game.id} />

                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          {isAdmin && (
                            <div 
                              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-xl cursor-grab active:cursor-grabbing transition-colors"
                              title="Seret untuk mengubah urutan"
                            >
                              <GripVertical size={20} />
                            </div>
                          )}
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md shrink-0",
                            game.id === 'pattern-master' ? "bg-indigo-600" :
                            game.id === 'scratch-blocks' ? "bg-amber-500" :
                            game.id === 'dekomposisi-puzzle' ? "bg-emerald-600" : "bg-blue-600"
                          )}>
                            {game.iconName === 'Calculator' && <Calculator size={20} />}
                            {game.iconName === 'Code' && <Code size={20} />}
                            {game.iconName === 'Puzzle' && <Puzzle size={20} />}
                            {game.iconName === 'Gamepad2' && <Gamepad2 size={20} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                                #{idx + 1}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                                {game.category}
                              </span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 leading-tight mt-0.5">
                              {game.title}
                            </h3>
                          </div>
                        </div>

                        {isAdmin && (
                          <div className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0",
                            isGameActive 
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                              : "bg-slate-200 text-slate-500 border-slate-300"
                          )}>
                            {isGameActive ? '✓ Terbit' : '✕ Nonaktif'}
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium">
                        {game.description}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-slate-200/70 p-3 rounded-xl border border-slate-300/80">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Tingkat Kesulitan</span>
                          <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                            <Flame size={12} className="text-amber-500" /> {game.difficulty}
                          </span>
                        </div>
                        {isAdmin ? (
                          <div className="bg-slate-200/70 p-3 rounded-xl border border-slate-300/80">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Skor Tertinggi Top</span>
                            <span className="text-xs font-black text-emerald-700 flex items-center gap-1">
                              <Trophy size={12} className="text-amber-500" /> {gameHighScore} Poin
                            </span>
                          </div>
                        ) : (
                          <div className="bg-emerald-100/90 p-3 rounded-xl border border-emerald-300 shadow-xs">
                            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block mb-0.5">Skor Tertinggi Saya</span>
                            <span className="text-xs font-black text-emerald-950 flex items-center gap-1">
                              <Trophy size={13} className="text-amber-500 fill-amber-400" /> {myStudentHighScore > 0 ? `${myStudentHighScore} Poin` : 'Belum Ada Skor'}
                            </span>
                          </div>
                        )}
                      </div>

                    {/* Admin Stage Materi Configurator */}
                    {isAdmin && game.id === 'petualangan-smp' && (
                      <div className="mt-4 p-4 bg-slate-200/90 rounded-2xl border border-slate-300 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            ⚙️ Pengaturan Materi Kuis Kotak Emas Per-Stage
                          </span>
                          <span className="text-[10px] font-bold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-full">
                            3 Stage Game
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5 text-xs font-medium text-slate-700">
                          {/* Stage 1 Config */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-slate-300">
                            <div>
                              <span className="font-bold text-slate-900 block text-xs">Stage 1: Berangkat ke Sekolah (175m)</span>
                              <span className="text-[10px] text-slate-500 font-semibold">Musuh: Komputer Jahat</span>
                            </div>
                            <select
                              value={gameConfigs['petualangan-smp']?.stage1MateriId ?? 'bk-dekomposisi'}
                              onChange={(e) => updateStageMateri('stage1MateriId', e.target.value)}
                              className="bg-slate-100 border border-slate-300 text-xs font-bold rounded-lg p-1.5 text-slate-800 cursor-pointer"
                            >
                              {COURSES.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                              ))}
                            </select>
                          </div>

                          {/* Stage 2 Config */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-slate-300">
                            <div>
                              <span className="font-bold text-amber-900 block text-xs">Stage 2: Kegiatan Pramuka (190m)</span>
                              <span className="text-[10px] text-slate-500 font-semibold">Musuh: Telepon Jahat Bergigi & Kaki</span>
                            </div>
                            <select
                              value={gameConfigs['petualangan-smp']?.stage2MateriId ?? 'bk-pengenalan-pola'}
                              onChange={(e) => updateStageMateri('stage2MateriId', e.target.value)}
                              className="bg-slate-100 border border-slate-300 text-xs font-bold rounded-lg p-1.5 text-slate-800 cursor-pointer"
                            >
                              {COURSES.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                              ))}
                            </select>
                          </div>

                          {/* Stage 3 Config */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-slate-300">
                            <div>
                              <span className="font-bold text-indigo-900 block text-xs">Stage 3: Study Tour Edukasi (200m)</span>
                              <span className="text-[10px] text-slate-500 font-semibold">Musuh: Keyboard Terbakar Bergigi & Tangan</span>
                            </div>
                            <select
                              value={gameConfigs['petualangan-smp']?.stage3MateriId ?? 'scratch'}
                              onChange={(e) => updateStageMateri('stage3MateriId', e.target.value)}
                              className="bg-slate-100 border border-slate-300 text-xs font-bold rounded-lg p-1.5 text-slate-800 cursor-pointer"
                            >
                              {COURSES.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-300/80 flex-wrap">
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleGameStatus(game.id)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95",
                            isGameActive
                              ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                          )}
                        >
                          {isGameActive ? (
                            <>
                              <X size={14} /> Nonaktifkan
                            </>
                          ) : (
                            <>
                              <Check size={14} /> Aktifkan
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1 bg-slate-200 rounded-xl p-1 border border-slate-300">
                          <button
                            onClick={() => moveGame(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 hover:bg-white rounded-lg text-slate-700 disabled:opacity-30"
                            title="Naikkan Urutan"
                          >
                            <MoveUp size={14} />
                          </button>
                          <button
                            onClick={() => moveGame(idx, 'down')}
                            disabled={idx === orderedGames.length - 1}
                            className="p-1 hover:bg-white rounded-lg text-slate-700 disabled:opacity-30"
                            title="Turunkan Urutan"
                          >
                            <MoveDown size={14} />
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setActivePlayGameId(game.id)}
                      className="px-5 py-2 bg-brand text-white rounded-xl text-xs font-black hover:bg-brand/90 transition-all shadow-md active:scale-95 flex items-center gap-2 ml-auto"
                    >
                      <Play size={14} /> {isAdmin ? "Pratinjau & Mainkan" : "Mulai Bermain"}
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
        <div className="bg-slate-100 rounded-[2.5rem] border border-slate-300 shadow-sm p-6 md:p-8 space-y-6">
          {/* Controls Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-300 pb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Trophy className="text-amber-500" size={24} /> Papan Skor & Peringkat Siswa
              </h2>
              <p className="text-xs text-slate-500 font-bold mt-0.5">
                Daftar nilai dan capaian skor tertinggi siswa dalam permainan edukatif.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
              {/* Search input */}
              <div className="relative flex-1 md:w-60">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari siswa / kelas..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-200 border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              {/* Class Filter */}
              <select
                value={filterKelas}
                onChange={e => setFilterKelas(e.target.value)}
                className="bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl p-2 cursor-pointer"
              >
                <option value="all">Semua Kelas</option>
                {uniqueClasses.map(k => (
                  <option key={k} value={k}>Kelas {k}</option>
                ))}
              </select>

              {/* Game Filter */}
              <select
                value={filterGame}
                onChange={e => setFilterGame(e.target.value)}
                className="bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl p-2 cursor-pointer"
              >
                <option value="all">Semua Game</option>
                {GAMES_LIST.map(g => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Scores Table */}
          {filteredScores.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-300 bg-white">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-slate-200/80 border-b border-slate-300 text-[11px] font-black uppercase tracking-wider text-slate-700">
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
                <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                  {filteredScores.map((score, idx) => {
                    const isTop1 = idx === 0;
                    const isTop2 = idx === 1;
                    const isTop3 = idx === 2;

                    return (
                      <tr key={score.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-center font-black">
                          {isTop1 ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black shadow-sm">1</span> :
                           isTop2 ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-black shadow-sm">2</span> :
                           isTop3 ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-black shadow-sm">3</span> :
                           idx + 1}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {score.studentName || 'Siswa'}
                          {score.studentNis && <span className="block text-[10px] font-normal text-slate-500">NISN: {score.studentNis}</span>}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-700">
                          {score.studentKelas || '-'}
                        </td>
                        <td className="px-4 py-3 font-bold text-brand">
                          {score.gameTitle || 'Game'}
                        </td>
                        <td className="px-4 py-3 text-center font-black text-emerald-700 text-base">
                          {score.score || 0}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-slate-600">
                          {score.durationSec ? `${score.durationSec}s` : '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {score.playedAt ? new Date(score.playedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleClearScore(score.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-300 rounded-3xl">
              <Gamepad2 size={40} className="mx-auto text-slate-400 mb-3" />
              <h3 className="font-bold text-slate-700 text-base mb-1">Belum Ada Catatan Skor Permainan</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
          onClose={() => setActivePlayGameId(null)}
        />
      )}
    </div>
  );
}

/* =========================================================================
   Interactive Play Modal containing the 4 Playable Educational Games
   ========================================================================= */

interface InteractiveGameModalProps {
  gameId: string;
  isAdmin: boolean;
  currentStudent?: { id: string; nama: string; kelas: string; nis: string } | null;
  onClose: () => void;
}

function InteractiveGameModal({ gameId, isAdmin, currentStudent, onClose }: InteractiveGameModalProps) {
  const currentGame = GAMES_LIST.find(g => g.id === gameId) || GAMES_LIST[0];
  const [isFullscreen, setIsFullscreen] = useState(true);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      if (modalContainerRef.current?.requestFullscreen) {
        modalContainerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    // Attempt auto-fullscreen on mount if gesture allows
    if (modalContainerRef.current && !document.fullscreenElement) {
      modalContainerRef.current.requestFullscreen().catch(() => {});
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  return (
    <div 
      ref={modalContainerRef}
      className="fixed inset-0 bg-slate-950 z-[9999] flex flex-col w-screen h-screen overflow-hidden select-none"
    >
      {/* Modal Fullscreen Header */}
      <div className="bg-slate-900/90 backdrop-blur-md text-white px-6 py-3 flex items-center justify-between border-b border-slate-800 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white font-bold shadow-md shadow-brand/20">
            <Gamepad2 size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
              {isAdmin ? "Mode Pratinjau Fullscreen" : "Game Edukasi Layar Penuh"}
            </span>
            <h3 className="text-base font-black text-white leading-tight">
              {currentGame.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleBrowserFullscreen}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors shadow-xs"
            title={isFullscreen ? "Keluar Layar Penuh" : "Masuk Layar Penuh"}
          >
            {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
            <span>{isFullscreen ? "Kecilkan" : "Layar Penuh"}</span>
          </button>
          
          <button
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              }
              onClose();
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <X size={15} />
            <span>Tutup Game</span>
          </button>
        </div>
      </div>

      {/* Modal Body: Full Viewport Game Area */}
      <div className="flex-1 w-full h-full p-2 md:p-6 overflow-y-auto bg-slate-950 flex flex-col justify-center items-center custom-scrollbar">
        <div className="w-full max-w-5xl h-full flex flex-col justify-center my-auto">
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
            <PetualanganSMPGame isAdmin={isAdmin} currentStudent={currentStudent} onClose={onClose} />
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
    if (!currentStudent && !isAdmin) return;
    try {
      await setDoc(doc(collection(db, 'game_scores')), {
        gameId: 'pattern-master',
        gameTitle: 'Detektif Pola Bilangan',
        studentId: currentStudent?.id || 'admin-preview',
        studentName: currentStudent?.nama || 'Admin Pratinjau',
        studentNis: currentStudent?.nis || '-',
        studentKelas: currentStudent?.kelas || 'Admin',
        score: finalScore,
        playedAt: new Date().toISOString()
      });
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
  const availableBlocks = [
    { id: 'flag', text: 'when green flag clicked', color: 'bg-amber-500 text-white' },
    { id: 'move', text: 'move 10 steps', color: 'bg-blue-600 text-white' },
    { id: 'turn', text: 'turn right 90 degrees', color: 'bg-blue-500 text-white' },
    { id: 'repeat', text: 'repeat 4 times', color: 'bg-amber-600 text-white' },
    { id: 'sound', text: 'start sound [Magic]', color: 'bg-purple-600 text-white' }
  ];

  const [workspace, setWorkspace] = useState<typeof availableBlocks>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [stepMsg, setStepMsg] = useState('Susun balok algoritma di atas untuk memulainya!');

  const handleAdd = (block: typeof availableBlocks[0]) => {
    setWorkspace(prev => [...prev, block]);
  };

  const handleClear = () => {
    setWorkspace([]);
    setIsRunning(false);
    setStepMsg('Workspace dibersihkan.');
  };

  const handleRun = () => {
    if (workspace.length === 0) {
      setStepMsg('Tambahkan balok terlebih dahulu!');
      return;
    }
    setIsRunning(true);
    setStepMsg('🚀 Menjalankan skrip Scratch...');

    setTimeout(() => {
      setStepMsg('✅ Kucing Scratch berhasil bergerak dan meraih Bintang Emas! Skor +100 🎉');
      setIsRunning(false);
      saveScore(100);
    }, 2000);
  };

  const saveScore = async (finalScore: number) => {
    if (!currentStudent && !isAdmin) return;
    try {
      await setDoc(doc(collection(db, 'game_scores')), {
        gameId: 'scratch-blocks',
        gameTitle: 'Scratch Block Builder',
        studentId: currentStudent?.id || 'admin-preview',
        studentName: currentStudent?.nama || 'Admin Pratinjau',
        studentNis: currentStudent?.nis || '-',
        studentKelas: currentStudent?.kelas || 'Admin',
        score: finalScore,
        playedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Failed saving score", e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Block Palette */}
        <div className="bg-slate-200/80 p-5 rounded-2xl border border-slate-300 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Code size={16} /> Palette Balok Scratch
          </h4>
          <p className="text-[11px] font-semibold text-slate-500">Klik balok untuk meletakkannya di area kerja:</p>
          <div className="space-y-2">
            {availableBlocks.map(b => (
              <button
                key={b.id}
                onClick={() => handleAdd(b)}
                className={cn("w-full p-3 rounded-xl font-mono text-xs font-bold text-left transition-transform active:scale-95 shadow-sm hover:brightness-110", b.color)}
              >
                {b.text}
              </button>
            ))}
          </div>
        </div>

        {/* Workspace */}
        <div className="bg-white p-5 rounded-2xl border border-slate-300 flex flex-col justify-between space-y-4 shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Area Kerja Kode (*Workspace*)</h4>
              <button onClick={handleClear} className="text-[11px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1">
                <Trash2 size={12} /> Hapus Semua
              </button>
            </div>

            <div className="min-h-[160px] bg-slate-100 p-3 rounded-xl border border-dashed border-slate-300 space-y-2">
              {workspace.length > 0 ? (
                workspace.map((b, idx) => (
                  <div key={idx} className={cn("p-2.5 rounded-lg font-mono text-xs font-bold shadow-xs", b.color)}>
                    {idx + 1}. {b.text}
                  </div>
                ))
              ) : (
                <div className="h-32 flex items-center justify-center text-xs text-slate-400 font-bold italic text-center">
                  Belum ada balok terpasang.<br/>Klik balok dari sebelah kiri.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-slate-800 text-center">
              {stepMsg}
            </div>

            <button
              onClick={handleRun}
              disabled={isRunning}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-sm shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
            >
              <Play size={16} /> Jalankan Skrip Kode
            </button>
          </div>
        </div>
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
    if (!currentStudent && !isAdmin) return;
    try {
      await setDoc(doc(collection(db, 'game_scores')), {
        gameId: 'dekomposisi-puzzle',
        gameTitle: 'Dekomposisi Master',
        studentId: currentStudent?.id || 'admin-preview',
        studentName: currentStudent?.nama || 'Admin Pratinjau',
        studentNis: currentStudent?.nis || '-',
        studentKelas: currentStudent?.kelas || 'Admin',
        score: finalScore,
        playedAt: new Date().toISOString()
      });
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
  const [catX, setCatX] = useState(50); // percentage 0-100

  const handleCatch = () => {
    if (!isPlaying) return;
    setScore(s => s + 10);
    // Move cat slightly randomly to simulate active catching
    setCatX(Math.floor(Math.random() * 80) + 10);
  };

  const startGame = () => {
    setScore(0);
    setLives(3);
    setIsPlaying(true);
    setIsGameOver(false);
    setCatX(50);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      // Chance of losing life if not caught
      if (Math.random() > 0.6) {
        setLives(l => {
          if (l <= 1) {
            setIsPlaying(false);
            setIsGameOver(true);
            return 0;
          }
          return l - 1;
        });
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (isGameOver) {
      saveScore(score);
    }
  }, [isGameOver]);

  const saveScore = async (finalScore: number) => {
    if (!currentStudent && !isAdmin) return;
    try {
      await setDoc(doc(collection(db, 'game_scores')), {
        gameId: 'star-catcher',
        gameTitle: 'Star Catcher Arcade',
        studentId: currentStudent?.id || 'admin-preview',
        studentName: currentStudent?.nama || 'Admin Pratinjau',
        studentNis: currentStudent?.nis || '-',
        studentKelas: currentStudent?.kelas || 'Admin',
        score: finalScore,
        playedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Failed saving score", e);
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl">
        <div className="flex items-center gap-2 text-xs font-bold">
          <span>Nyawa:</span>
          {Array.from({ length: lives }).map((_, i) => (
            <span key={i} className="text-red-500">❤️</span>
          ))}
        </div>
        <div className="text-sm font-black text-amber-400">
          Skor: {score}
        </div>
      </div>

      {!isPlaying && !isGameOver ? (
        <div className="p-8 bg-slate-200/80 rounded-3xl border border-slate-300 space-y-4">
          <Gamepad2 size={48} className="mx-auto text-brand" />
          <h4 className="font-black text-xl text-slate-900">Star Catcher Arcade</h4>
          <p className="text-xs text-slate-600 font-bold max-w-sm mx-auto">
            Klik tombol Tangkap Bintang secepat mungkin untuk mengumpulkan skor sebelum nyawa habis!
          </p>
          <button
            onClick={startGame}
            className="px-8 py-3.5 bg-brand text-white font-black text-sm rounded-xl shadow-lg shadow-brand/20 hover:scale-105 transition-all"
          >
            Mulai Permainan 🎮
          </button>
        </div>
      ) : isPlaying ? (
        <div className="p-8 bg-slate-900 text-white rounded-3xl border border-slate-800 space-y-8 relative overflow-hidden">
          <div className="flex justify-around items-center min-h-[140px]">
            <div 
              className="text-4xl transition-all duration-300"
              style={{ transform: `translateX(${catX - 50}px)` }}
            >
              🐱
            </div>
            <div className="text-4xl animate-bounce">⭐</div>
          </div>

          <button
            onClick={handleCatch}
            className="w-full py-5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-lg rounded-2xl shadow-xl active:scale-95 transition-transform"
          >
            ⭐ TANGKAP BINTANG (+10)
          </button>
        </div>
      ) : (
        <div className="p-8 bg-white rounded-3xl border border-slate-300 space-y-4">
          <Trophy size={48} className="mx-auto text-amber-500 animate-bounce" />
          <h4 className="font-black text-2xl text-slate-900">Game Over!</h4>
          <p className="text-sm font-bold text-slate-600">Skor Akhir Kamu:</p>
          <div className="text-5xl font-black text-brand">{score}</div>
          <button
            onClick={startGame}
            className="px-6 py-3 bg-slate-900 text-white font-bold text-sm rounded-xl shadow-md"
          >
            Main Lagi 🔄
          </button>
        </div>
      )}
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
    // Stage 2: Kegiatan Pramuka (190m)
    return {
      player: {
        x: 100,
        y: 300,
        width: 32,
        height: 48,
        vx: 0,
        vy: 0,
        isGrounded: false,
        direction: 'right' as 'left' | 'right',
        invulnerableFrames: 0,
        superPowerFrames: 0,
        animFrame: 0,
      },
      cameraX: 0,
      worldWidth: 6100,
      platforms: [
        { x: 0, y: 380, w: 600, h: 100, type: 'ground' },
        { x: 680, y: 380, w: 550, h: 100, type: 'ground' },
        { x: 820, y: 280, w: 130, h: 20, type: 'platform' },
        { x: 1000, y: 220, w: 130, h: 20, type: 'platform' },
        { x: 1280, y: 380, w: 750, h: 100, type: 'ground' },
        { x: 1450, y: 270, w: 150, h: 20, type: 'platform' },
        { x: 1650, y: 200, w: 150, h: 20, type: 'platform' },
        { x: 2100, y: 380, w: 800, h: 100, type: 'ground' },
        { x: 2300, y: 280, w: 160, h: 20, type: 'platform' },
        { x: 2550, y: 230, w: 160, h: 20, type: 'platform' },
        { x: 2950, y: 380, w: 850, h: 100, type: 'ground' },
        { x: 3100, y: 270, w: 150, h: 20, type: 'platform' },
        { x: 3350, y: 210, w: 150, h: 20, type: 'platform' },
        { x: 3900, y: 380, w: 850, h: 100, type: 'ground' },
        { x: 4050, y: 280, w: 160, h: 20, type: 'platform' },
        { x: 4300, y: 230, w: 160, h: 20, type: 'platform' },
        { x: 4850, y: 380, w: 1200, h: 100, type: 'ground' }
      ],
      items: [
        { id: 1, x: 250, y: 330, w: 26, h: 24, type: 'laptop', collected: false },
        { id: 2, x: 400, y: 330, w: 28, h: 22, type: 'ram', collected: false },
        { id: 3, x: 860, y: 235, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 0 },
        { id: 4, x: 1050, y: 180, w: 26, h: 24, type: 'laptop', collected: false },
        { id: 5, x: 1500, y: 225, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 1 },
        { id: 6, x: 1700, y: 160, w: 28, h: 22, type: 'ram', collected: false },
        { id: 7, x: 2350, y: 235, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 2 },
        { id: 8, x: 2600, y: 185, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 3 },
        { id: 9, x: 3150, y: 230, w: 28, h: 22, type: 'ram', collected: false },
        { id: 10, x: 3400, y: 170, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 0 },
        { id: 11, x: 4100, y: 240, w: 26, h: 24, type: 'laptop', collected: false },
        { id: 12, x: 4350, y: 190, w: 28, h: 22, type: 'ram', collected: false },
        { id: 13, x: 5000, y: 330, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 1 },
      ],
      obstacles: [
        { id: 1, x: 450, y: 365, w: 60, h: 15, type: 'puddle', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 2, x: 750, y: 342, w: 38, h: 38, type: 'phone_evil', vx: 1.8, minX: 700, maxX: 1150, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 3, x: 1380, y: 350, w: 25, h: 30, type: 'cone', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 4, x: 1550, y: 342, w: 38, h: 38, type: 'phone_evil', vx: -2, minX: 1350, maxX: 1800, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 5, x: 1850, y: 200, w: 30, h: 30, type: 'homework', vx: 0, minX: 0, maxX: 0, vy: 2, minY: 150, maxY: 330, yDir: 1, destroyed: false },
        { id: 6, x: 2250, y: 365, w: 70, h: 15, type: 'puddle', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 7, x: 2450, y: 342, w: 38, h: 38, type: 'phone_evil', vx: 2.2, minX: 2200, maxX: 2750, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 8, x: 3050, y: 350, w: 25, h: 30, type: 'cone', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 9, x: 3250, y: 342, w: 38, h: 38, type: 'phone_evil', vx: -1.9, minX: 3000, maxX: 3550, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 10, x: 3650, y: 200, w: 30, h: 30, type: 'homework', vx: 0, minX: 0, maxX: 0, vy: 2, minY: 150, maxY: 330, yDir: 1, destroyed: false },
        { id: 11, x: 4000, y: 365, w: 70, h: 15, type: 'puddle', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 12, x: 4200, y: 342, w: 38, h: 38, type: 'phone_evil', vx: 2.3, minX: 3950, maxX: 4500, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 13, x: 5050, y: 342, w: 38, h: 38, type: 'phone_evil', vx: -2.5, minX: 4900, maxX: 5450, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      ],
      schoolGateX: 5800,
    };
  }

  if (stageNum === 3) {
    // Stage 3: Study Tour Edukasi (200m)
    return {
      player: {
        x: 100,
        y: 300,
        width: 32,
        height: 48,
        vx: 0,
        vy: 0,
        isGrounded: false,
        direction: 'right' as 'left' | 'right',
        invulnerableFrames: 0,
        superPowerFrames: 0,
        animFrame: 0,
      },
      cameraX: 0,
      worldWidth: 6400,
      platforms: [
        { x: 0, y: 380, w: 600, h: 100, type: 'ground' },
        { x: 680, y: 380, w: 600, h: 100, type: 'ground' },
        { x: 840, y: 280, w: 130, h: 20, type: 'platform' },
        { x: 1020, y: 220, w: 130, h: 20, type: 'platform' },
        { x: 1330, y: 380, w: 800, h: 100, type: 'ground' },
        { x: 1500, y: 270, w: 150, h: 20, type: 'platform' },
        { x: 1720, y: 200, w: 150, h: 20, type: 'platform' },
        { x: 2200, y: 380, w: 850, h: 100, type: 'ground' },
        { x: 2400, y: 280, w: 160, h: 20, type: 'platform' },
        { x: 2650, y: 230, w: 160, h: 20, type: 'platform' },
        { x: 3120, y: 380, w: 900, h: 100, type: 'ground' },
        { x: 3280, y: 270, w: 150, h: 20, type: 'platform' },
        { x: 3520, y: 210, w: 150, h: 20, type: 'platform' },
        { x: 4100, y: 380, w: 900, h: 100, type: 'ground' },
        { x: 4280, y: 280, w: 160, h: 20, type: 'platform' },
        { x: 4520, y: 230, w: 160, h: 20, type: 'platform' },
        { x: 5100, y: 380, w: 1300, h: 100, type: 'ground' }
      ],
      items: [
        { id: 1, x: 250, y: 330, w: 26, h: 24, type: 'laptop', collected: false },
        { id: 2, x: 400, y: 330, w: 28, h: 22, type: 'ram', collected: false },
        { id: 3, x: 880, y: 235, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 0 },
        { id: 4, x: 1070, y: 180, w: 26, h: 24, type: 'laptop', collected: false },
        { id: 5, x: 1550, y: 225, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 1 },
        { id: 6, x: 1770, y: 160, w: 28, h: 22, type: 'ram', collected: false },
        { id: 7, x: 2450, y: 235, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 2 },
        { id: 8, x: 2700, y: 185, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 3 },
        { id: 9, x: 3330, y: 230, w: 28, h: 22, type: 'ram', collected: false },
        { id: 10, x: 3570, y: 170, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 0 },
        { id: 11, x: 4330, y: 240, w: 26, h: 24, type: 'laptop', collected: false },
        { id: 12, x: 4570, y: 190, w: 28, h: 22, type: 'ram', collected: false },
        { id: 13, x: 5300, y: 330, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 1 },
      ],
      obstacles: [
        { id: 1, x: 450, y: 365, w: 60, h: 15, type: 'puddle', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 2, x: 750, y: 342, w: 44, h: 36, type: 'keyboard_evil', vx: 2, minX: 700, maxX: 1200, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 3, x: 1400, y: 350, w: 25, h: 30, type: 'cone', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 4, x: 1600, y: 342, w: 44, h: 36, type: 'keyboard_evil', vx: -2.2, minX: 1400, maxX: 1850, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 5, x: 1900, y: 200, w: 30, h: 30, type: 'homework', vx: 0, minX: 0, maxX: 0, vy: 2, minY: 150, maxY: 330, yDir: 1, destroyed: false },
        { id: 6, x: 2350, y: 365, w: 70, h: 15, type: 'puddle', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 7, x: 2550, y: 342, w: 44, h: 36, type: 'keyboard_evil', vx: 2.4, minX: 2300, maxX: 2900, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 8, x: 3200, y: 350, w: 25, h: 30, type: 'cone', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 9, x: 3400, y: 342, w: 44, h: 36, type: 'keyboard_evil', vx: -2, minX: 3150, maxX: 3700, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 10, x: 3800, y: 200, w: 30, h: 30, type: 'homework', vx: 0, minX: 0, maxX: 0, vy: 2, minY: 150, maxY: 330, yDir: 1, destroyed: false },
        { id: 11, x: 4200, y: 365, w: 70, h: 15, type: 'puddle', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 12, x: 4400, y: 342, w: 44, h: 36, type: 'keyboard_evil', vx: 2.5, minX: 4150, maxX: 4750, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 13, x: 5300, y: 342, w: 44, h: 36, type: 'keyboard_evil', vx: -2.8, minX: 5100, maxX: 5700, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      ],
      schoolGateX: 6100,
    };
  }

  // Default Stage 1: Berangkat ke Sekolah (175m)
  return {
    player: {
      x: 100,
      y: 300,
      width: 32,
      height: 48,
      vx: 0,
      vy: 0,
      isGrounded: false,
      direction: 'right' as 'left' | 'right',
      invulnerableFrames: 0,
      superPowerFrames: 0,
      animFrame: 0,
    },
    cameraX: 0,
    worldWidth: 5600,
    platforms: [
      { x: 0, y: 380, w: 600, h: 100, type: 'ground' },
      { x: 680, y: 380, w: 500, h: 100, type: 'ground' },
      { x: 800, y: 280, w: 120, h: 20, type: 'platform' },
      { x: 980, y: 220, w: 120, h: 20, type: 'platform' },
      { x: 1240, y: 380, w: 700, h: 100, type: 'ground' },
      { x: 1400, y: 270, w: 140, h: 20, type: 'platform' },
      { x: 1600, y: 200, w: 140, h: 20, type: 'platform' },
      { x: 2000, y: 380, w: 700, h: 100, type: 'ground' },
      { x: 2200, y: 280, w: 160, h: 20, type: 'platform' },
      { x: 2450, y: 240, w: 160, h: 20, type: 'platform' },
      { x: 2800, y: 380, w: 800, h: 100, type: 'ground' },
      { x: 2950, y: 270, w: 150, h: 20, type: 'platform' },
      { x: 3200, y: 210, w: 150, h: 20, type: 'platform' },
      { x: 3700, y: 380, w: 800, h: 100, type: 'ground' },
      { x: 3850, y: 280, w: 160, h: 20, type: 'platform' },
      { x: 4100, y: 230, w: 160, h: 20, type: 'platform' },
      { x: 4600, y: 380, w: 1000, h: 100, type: 'ground' }
    ],
    items: [
      { id: 1, x: 250, y: 330, w: 26, h: 24, type: 'laptop', collected: false },
      { id: 2, x: 400, y: 330, w: 28, h: 22, type: 'ram', collected: false },
      { id: 3, x: 840, y: 235, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 0 },
      { id: 4, x: 1020, y: 180, w: 26, h: 24, type: 'laptop', collected: false },
      { id: 5, x: 1450, y: 225, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 1 },
      { id: 6, x: 1650, y: 160, w: 28, h: 22, type: 'ram', collected: false },
      { id: 7, x: 2250, y: 235, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 2 },
      { id: 8, x: 2500, y: 195, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 3 },
      { id: 9, x: 3000, y: 230, w: 28, h: 22, type: 'ram', collected: false },
      { id: 10, x: 3250, y: 170, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 0 },
      { id: 11, x: 3900, y: 240, w: 26, h: 24, type: 'laptop', collected: false },
      { id: 12, x: 4150, y: 190, w: 28, h: 22, type: 'ram', collected: false },
      { id: 13, x: 4700, y: 330, w: 30, h: 30, type: 'mystery_box', collected: false, quizIdx: 1 },
    ],
    obstacles: [
      { id: 1, x: 450, y: 365, w: 60, h: 15, type: 'puddle', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 2, x: 750, y: 344, w: 38, h: 36, type: 'computer_evil', vx: 1.6, minX: 700, maxX: 1100, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 3, x: 1350, y: 350, w: 25, h: 30, type: 'cone', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 4, x: 1500, y: 344, w: 38, h: 36, type: 'computer_evil', vx: -1.8, minX: 1300, maxX: 1750, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 5, x: 1800, y: 200, w: 30, h: 30, type: 'homework', vx: 0, minX: 0, maxX: 0, vy: 2, minY: 150, maxY: 330, yDir: 1, destroyed: false },
      { id: 6, x: 2150, y: 365, w: 70, h: 15, type: 'puddle', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 7, x: 2350, y: 344, w: 38, h: 36, type: 'computer_evil', vx: 2, minX: 2100, maxX: 2600, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 8, x: 2900, y: 350, w: 25, h: 30, type: 'cone', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 9, x: 3100, y: 344, w: 38, h: 36, type: 'computer_evil', vx: 1.8, minX: 2850, maxX: 3400, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 10, x: 3500, y: 200, w: 30, h: 30, type: 'homework', vx: 0, minX: 0, maxX: 0, vy: 2, minY: 150, maxY: 330, yDir: 1, destroyed: false },
      { id: 11, x: 3800, y: 365, w: 70, h: 15, type: 'puddle', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 12, x: 4000, y: 344, w: 38, h: 36, type: 'computer_evil', vx: -2, minX: 3750, maxX: 4300, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 13, x: 4800, y: 344, w: 38, h: 36, type: 'computer_evil', vx: 2.2, minX: 4650, maxX: 5200, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
    ],
    schoolGateX: 5350,
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

function PetualanganSMPGame({ isAdmin, currentStudent, onClose }: { isAdmin: boolean; currentStudent: any; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(1);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'win' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [distanceRemaining, setDistanceRemaining] = useState(175);
  const [superPowerActive, setSuperPowerActive] = useState(false);

  // Firestore Config for Stage Materi
  const [stageConfigs, setStageConfigs] = useState<{ stage1MateriId?: string; stage2MateriId?: string; stage3MateriId?: string }>({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'game_configs', 'petualangan-smp'), (snapshot) => {
      if (snapshot.exists()) {
        setStageConfigs(snapshot.data() as any);
      }
    });
    return () => unsub();
  }, []);

  const getActiveMateriIdForStage = (stageNum: number) => {
    if (stageNum === 1) return stageConfigs.stage1MateriId || 'bk-dekomposisi';
    if (stageNum === 2) return stageConfigs.stage2MateriId || 'bk-pengenalan-pola';
    return stageConfigs.stage3MateriId || 'scratch';
  };

  const currentMateriId = getActiveMateriIdForStage(currentStage);
  const activeCourseObj = COURSES.find(c => c.id === currentMateriId);
  const stageQuizzes = getQuizForMateri(currentMateriId);

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

  const keysRef = useRef<{ left: boolean; right: boolean; jump: boolean }>({ left: false, right: false, jump: false });

  const engineRef = useRef(generateStageEngine(currentStage));

  const resetEngineForStage = (stageNum: number) => {
    engineRef.current = generateStageEngine(stageNum);
  };

  const startGame = (stageNum: number = currentStage) => {
    setCurrentStage(stageNum as any);
    resetEngineForStage(stageNum);
    setScore(s => (gameState === 'win' ? s : 0)); // accumulate score across stages or start fresh
    setLives(3);
    const initialDist = stageNum === 1 ? 175 : stageNum === 2 ? 190 : 200;
    setDistanceRemaining(initialDist);
    setActiveQuiz(null);
    setQuizFeedback(null);
    setShowRewardPicker(false);
    setSelectedRewardMsg(null);
    setSuperPowerActive(false);
    setGameState('playing');
  };

  const saveFinalScore = async (finalScore: number) => {
    if (!currentStudent && !isAdmin) return;
    try {
      await setDoc(doc(collection(db, 'game_scores')), {
        gameId: 'petualangan-smp',
        gameTitle: `Petualangan Ke Sekolah (Stage ${currentStage})`,
        studentId: currentStudent?.id || 'admin-preview',
        studentName: currentStudent?.nama || 'Admin Pratinjau',
        studentNis: currentStudent?.nis || '-',
        studentKelas: currentStudent?.kelas || 'Admin',
        score: finalScore,
        playedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Failed saving score", e);
    }
  };

  const handleQuizAnswer = (selectedIdx: number) => {
    if (!activeQuiz) return;
    const isCorrect = selectedIdx === activeQuiz.correctIdx;

    if (isCorrect) {
      setScore(s => s + 100);
      setQuizFeedback({
        msg: "🎉 JAWABAN BENAR! Silakan pilih 1 Hadiah Spesial untuk membantu petualanganmu!",
        isCorrect: true
      });
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
  };

  const handlePickReward = (rewardType: 'heart' | 'power' | 'score') => {
    if (rewardType === 'heart') {
      setLives(l => Math.min(5, l + 1));
      setSelectedRewardMsg("💖 Hati bertambah! (+1 Nyawa Berhasil Didapatkan)");
    } else if (rewardType === 'power') {
      engineRef.current.player.superPowerFrames = 450; // ~7.5 seconds of super power
      setSuperPowerActive(true);
      setSelectedRewardMsg("⚡ Super Kuat Diaktifkan! Kebal rintangan & musuh selama 7.5 detik!");
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
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = true;
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        if (!keysRef.current.jump) {
          keysRef.current.jump = true;
        }
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = false;
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) keysRef.current.jump = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const engine = engineRef.current;

    const gameLoop = () => {
      // If quiz is open, freeze physics but keep rendering
      if (activeQuiz !== null) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      const p = engine.player;
      p.animFrame += 0.2;

      // Update super power state
      if (p.superPowerFrames > 0) {
        p.superPowerFrames--;
        if (p.superPowerFrames === 0) {
          setSuperPowerActive(false);
        }
      }

      const moveSpeed = p.superPowerFrames > 0 ? 6.5 : 4.5;

      if (keysRef.current.left) {
        p.vx = -moveSpeed;
        p.direction = 'left';
      } else if (keysRef.current.right) {
        p.vx = moveSpeed;
        p.direction = 'right';
      } else {
        p.vx *= 0.8;
      }

      if (keysRef.current.jump && p.isGrounded) {
        p.vy = p.superPowerFrames > 0 ? -14 : -12.5;
        p.isGrounded = false;
      }

      p.vy += 0.65;
      if (p.vy > 12) p.vy = 12;

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = 0;
      if (p.x > engine.worldWidth - p.width) p.x = engine.worldWidth - p.width;

      if (p.invulnerableFrames > 0) p.invulnerableFrames--;

      p.isGrounded = false;
      for (const plat of engine.platforms) {
        if (
          p.x + p.width > plat.x &&
          p.x < plat.x + plat.w &&
          p.y + p.height >= plat.y &&
          p.y + p.height <= plat.y + 20 &&
          p.vy >= 0
        ) {
          p.y = plat.y - p.height;
          p.vy = 0;
          p.isGrounded = true;
        }
      }

      if (p.y > 480) {
        setLives(l => {
          const next = l - 1;
          if (next <= 0) {
            setGameState('gameover');
            saveFinalScore(score);
          } else {
            p.x = Math.max(100, p.x - 200);
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
            } else if (item.type === 'laptop') {
              setScore(s => s + 50);
            } else if (item.type === 'mystery_box') {
              const qIdx = item.quizIdx ?? 0;
              const qObj = stageQuizzes[qIdx % stageQuizzes.length];
              setActiveQuiz(qObj);
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
          p.x + p.width - 6 > obs.x &&
          p.x + 6 < obs.x + obs.w &&
          p.y + p.height > obs.y &&
          p.y + 6 < obs.y + obs.h
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
      setDistanceRemaining(remainingMeters);

      if (p.x >= engine.schoolGateX - 50) {
        const bonusTimeScore = lives * 150 + 250;
        const total = score + bonusTimeScore;
        setScore(total);
        setGameState('win');
        saveFinalScore(total);
        return;
      }

      const targetCamX = p.x - 300;
      engine.cameraX += (targetCamX - engine.cameraX) * 0.1;
      if (engine.cameraX < 0) engine.cameraX = 0;
      if (engine.cameraX > engine.worldWidth - canvas.width) {
        engine.cameraX = engine.worldWidth - canvas.width;
      }

      const camX = engine.cameraX;

      // Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render Backdrop per Stage
      if (currentStage === 2) {
        // Stage 2: Sunset Forest & Bumi Perkemahan
        const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGradient.addColorStop(0, '#431407');
        skyGradient.addColorStop(0.35, '#7c2d12');
        skyGradient.addColorStop(0.7, '#ea580c');
        skyGradient.addColorStop(1, '#fde047');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Crescent Moon & Stars
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(680, 70, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#7c2d12';
        ctx.beginPath();
        ctx.arc(674, 66, 15, 0, Math.PI * 2);
        ctx.fill();

        // Twinkling Twilight Stars
        ctx.fillStyle = '#ffffff';
        const stars = [[120, 40], [240, 65], [380, 35], [520, 80], [750, 45], [820, 90]];
        for (const [sx, sy] of stars) {
          const starGlow = (Math.sin(p.animFrame * 2 + sx) + 1) * 0.8 + 1;
          ctx.beginPath();
          ctx.arc(sx, sy, starGlow, 0, Math.PI * 2);
          ctx.fill();
        }

        // Mountain Silhouettes in distance
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        for (let m = 0; m < 6; m++) {
          const mx = m * 300 - camX * 0.15;
          ctx.moveTo(mx - 80, 360);
          ctx.lineTo(mx + 70, 210);
          ctx.lineTo(mx + 220, 360);
        }
        ctx.fill();

        // Layered Pine Forest in background
        ctx.fillStyle = '#064e3b';
        for (let i = 0; i < 18; i++) {
          const treeX = i * 260 - camX * 0.35;
          ctx.beginPath();
          ctx.moveTo(treeX + 35, 190);
          ctx.lineTo(treeX, 360);
          ctx.lineTo(treeX + 70, 360);
          ctx.fill();
        }
        ctx.fillStyle = '#065f46';
        for (let i = 0; i < 14; i++) {
          const treeX = i * 320 + 80 - camX * 0.45;
          ctx.beginPath();
          ctx.moveTo(treeX + 30, 220);
          ctx.lineTo(treeX, 360);
          ctx.lineTo(treeX + 60, 360);
          ctx.fill();
        }

        // Distant Camping Tents & Small Campfires
        for (let i = 0; i < 6; i++) {
          const tentX = i * 650 + 120 - camX * 0.55;
          // Distant Tent
          ctx.fillStyle = '#047857';
          ctx.beginPath();
          ctx.moveTo(tentX + 25, 305);
          ctx.lineTo(tentX, 360);
          ctx.lineTo(tentX + 50, 360);
          ctx.fill();
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.moveTo(tentX + 25, 305);
          ctx.lineTo(tentX + 12, 360);
          ctx.lineTo(tentX + 25, 360);
          ctx.fill();

          // Small Campfire with smoke
          const fireX = tentX + 75;
          ctx.fillStyle = '#78350f';
          ctx.fillRect(fireX - 6, 354, 12, 4);
          const flicker = Math.sin(p.animFrame * 5 + i) * 3;
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.arc(fireX, 348 + flicker, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(fireX, 349 + flicker, 3, 0, Math.PI * 2);
          ctx.fill();
        }

      } else if (currentStage === 3) {
        // Stage 3: Museum Wisata Edukasi Cyber Night Sky
        const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGradient.addColorStop(0, '#09090b');
        skyGradient.addColorStop(0.4, '#1e1b4b');
        skyGradient.addColorStop(0.8, '#1e3a8a');
        skyGradient.addColorStop(1, '#0284c7');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Twinkling Space Stars
        ctx.fillStyle = '#ffffff';
        const sciStars = [[80, 30], [200, 50], [350, 25], [480, 60], [620, 35], [780, 55], [880, 20]];
        for (const [sx, sy] of sciStars) {
          const sRad = (Math.sin(p.animFrame * 3 + sx) + 1) * 0.7 + 1;
          ctx.beginPath();
          ctx.arc(sx, sy, sRad, 0, Math.PI * 2);
          ctx.fill();
        }

        // Futuristic Modern City Skyline Silhouettes
        for (let i = 0; i < 9; i++) {
          const bldgX = i * 420 + 30 - camX * 0.35;
          const bldgH = 130 + (i % 3) * 35;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(bldgX, 360 - bldgH, 95, bldgH);

          // Glowing Cyber Windows & Neon Lines
          ctx.fillStyle = '#0284c7';
          for (let wy = 360 - bldgH + 15; wy < 340; wy += 22) {
            for (let wx = 0; wx < 3; wx++) {
              ctx.fillRect(bldgX + 12 + wx * 26, wy, 16, 10);
            }
          }
          // Spire Antenna with blinking beacon
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(bldgX + 45, 360 - bldgH - 25, 4, 25);
          if (Math.sin(p.animFrame * 4 + i) > 0) {
            ctx.fillStyle = '#ec4899';
            ctx.beginPath();
            ctx.arc(bldgX + 47, 360 - bldgH - 26, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }

      } else {
        // Stage 1: Home to School Bright Morning Sky
        const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGradient.addColorStop(0, '#0284c7');
        skyGradient.addColorStop(0.35, '#38bdf8');
        skyGradient.addColorStop(0.75, '#bae6fd');
        skyGradient.addColorStop(1, '#f0fdf4');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Morning Sun with Warm Glow
        ctx.fillStyle = 'rgba(254, 240, 138, 0.3)';
        ctx.beginPath();
        ctx.arc(710, 80, 48, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(710, 80, 26, 0, Math.PI * 2);
        ctx.fill();

        // Fluffy Clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        for (let c = 0; c < 5; c++) {
          const cx = c * 450 + 100 - camX * 0.15;
          const cy = 60 + (c % 2) * 30;
          ctx.beginPath();
          ctx.arc(cx, cy, 22, 0, Math.PI * 2);
          ctx.arc(cx + 20, cy - 8, 26, 0, Math.PI * 2);
          ctx.arc(cx + 42, cy, 20, 0, Math.PI * 2);
          ctx.fill();
        }

        // Layered Green Rolling Hills
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
          const hillX = i * 420 + 80 - camX * 0.3;
          ctx.arc(hillX + 180, 390, 160, Math.PI, 0, false);
        }
        ctx.fill();

        // Background Neighborhood Houses
        for (let i = 0; i < 8; i++) {
          const houseX = i * 480 + 120 - camX * 0.45;
          // House body
          ctx.fillStyle = i % 2 === 0 ? '#fef08a' : '#fed7aa';
          ctx.fillRect(houseX, 295, 75, 65);
          // Roof
          ctx.fillStyle = i % 2 === 0 ? '#dc2626' : '#b45309';
          ctx.beginPath();
          ctx.moveTo(houseX - 8, 295);
          ctx.lineTo(houseX + 37.5, 260);
          ctx.lineTo(houseX + 83, 295);
          ctx.closePath();
          ctx.fill();
          // Door & Window
          ctx.fillStyle = '#78350f';
          ctx.fillRect(houseX + 12, 325, 18, 35);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(houseX + 42, 312, 22, 20);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(houseX + 42, 312, 22, 20);
          // Garden tree beside house
          ctx.fillStyle = '#78350f';
          ctx.fillRect(houseX + 86, 310, 8, 50);
          ctx.fillStyle = '#16a34a';
          ctx.beginPath();
          ctx.arc(houseX + 90, 305, 18, 0, Math.PI * 2);
          ctx.fill();
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
        } else {
          // Stage 3 Start: SMPN 1 KAWALI (Titik Kumpul Keberangkatan Study Tour)
          drawSekolah(ctx, startX, 380, p.animFrame, true, 'KEBERANGKATAN STUDY TOUR');
        }
      }

      // Draw Platforms
      for (const plat of engine.platforms) {
        const px = plat.x - camX;
        if (px + plat.w < -50 || px > canvas.width + 50) continue;

        if (plat.type === 'ground') {
          ctx.fillStyle = currentStage === 2 ? '#15803d' : currentStage === 3 ? '#0284c7' : '#22c55e';
          ctx.fillRect(px, plat.y, plat.w, 15);
          ctx.fillStyle = currentStage === 2 ? '#451a03' : currentStage === 3 ? '#334155' : '#b45309';
          ctx.fillRect(px, plat.y + 15, plat.w, plat.h - 15);
          ctx.fillStyle = currentStage === 3 ? '#38bdf8' : '#16a34a';
          for (let gx = 0; gx < plat.w; gx += 20) {
            ctx.fillRect(px + gx, plat.y + 12, 10, 5);
          }
        } else {
          ctx.fillStyle = '#eab308';
          ctx.fillRect(px, plat.y, plat.w, plat.h);
          ctx.strokeStyle = '#a16207';
          ctx.lineWidth = 3;
          ctx.strokeRect(px, plat.y, plat.w, plat.h);
        }
      }

      // Draw Items (RAM, Laptop, Kotak Emas Quiz)
      for (const item of engine.items) {
        if (item.collected) continue;
        const ix = item.x - camX;
        if (ix + item.w < -30 || ix > canvas.width + 30) continue;

        const floatY = item.y + Math.sin(p.animFrame * 1.5) * 3;

        if (item.type === 'laptop') {
          // Laptop Icon (+50 Poin)
          ctx.fillStyle = '#334155';
          ctx.fillRect(ix, floatY, 24, 15);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(ix + 2, floatY + 2, 20, 11);
          ctx.fillStyle = '#0284c7';
          ctx.font = 'bold 8px sans-serif';
          ctx.fillText('💻', ix + 5, floatY + 11);
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(ix - 3, floatY + 15, 30, 5);
        } else if (item.type === 'ram') {
          // RAM Chip Icon (+100 Poin)
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(ix, floatY, 26, 18);
          ctx.fillStyle = '#15803d';
          ctx.strokeRect(ix, floatY, 26, 18);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(ix + 3, floatY + 3, 5, 8);
          ctx.fillRect(ix + 10, floatY + 3, 5, 8);
          ctx.fillRect(ix + 17, floatY + 3, 5, 8);
          ctx.fillStyle = '#eab308';
          ctx.fillRect(ix + 2, floatY + 15, 22, 3);
        } else if (item.type === 'mystery_box') {
          // Kotak Emas Informatika (Interactive Quiz Box)
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(ix, floatY, 28, 28);
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 2;
          ctx.strokeRect(ix, floatY, 28, 28);
          ctx.fillStyle = '#fef08a';
          ctx.font = 'black 16px sans-serif';
          ctx.fillText('❓', ix + 5, floatY + 20);
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
          // Stage 1: Komputer Jahat
          ctx.fillStyle = '#334155';
          ctx.fillRect(ox - 8, obs.y + 10 + animOffset, 9, 4);
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.moveTo(ox - 8, obs.y + 8 + animOffset);
          ctx.lineTo(ox - 13, obs.y + 12 + animOffset);
          ctx.lineTo(ox - 8, obs.y + 16 + animOffset);
          ctx.fill();

          ctx.fillStyle = '#334155';
          ctx.fillRect(ox + 33, obs.y + 10 - animOffset, 9, 4);
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.moveTo(ox + 42, obs.y + 8 - animOffset);
          ctx.lineTo(ox + 47, obs.y + 12 - animOffset);
          ctx.lineTo(ox + 42, obs.y + 16 - animOffset);
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.fillRect(ox - 1, obs.y - 1, 36, 28);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(ox, obs.y, 34, 26);
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(ox + 3, obs.y + 3, 28, 20);

          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.moveTo(ox + 6, obs.y + 5);
          ctx.lineTo(ox + 13, obs.y + 9);
          ctx.lineTo(ox + 6, obs.y + 11);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(ox + 28, obs.y + 5);
          ctx.lineTo(ox + 21, obs.y + 9);
          ctx.lineTo(ox + 28, obs.y + 11);
          ctx.fill();

          ctx.fillStyle = '#000000';
          ctx.fillRect(ox + 5, obs.y + 12, 24, 9);
          ctx.fillStyle = '#ffffff';
          for (let tx = 0; tx < 4; tx++) {
            ctx.beginPath();
            ctx.moveTo(ox + 6 + tx * 5.5, obs.y + 12);
            ctx.lineTo(ox + 8.5 + tx * 5.5, obs.y + 16);
            ctx.lineTo(ox + 11 + tx * 5.5, obs.y + 12);
            ctx.fill();
          }

          ctx.fillStyle = '#334155';
          ctx.fillRect(ox + 6 + legStep, obs.y + 26, 5, 8);
          ctx.fillRect(ox + 22 - legStep, obs.y + 26, 5, 8);

        } else if (obs.type === 'phone_evil') {
          // Stage 2: Telepon Jahat (Vintage/Rotary Phone dengan Gigi & Kaki)
          // Body Telepon
          ctx.fillStyle = '#7f1d1d';
          ctx.fillRect(ox + 2, obs.y + 10, 32, 20);
          ctx.fillStyle = '#4c0519';
          ctx.fillRect(ox + 5, obs.y + 6, 26, 6);

          // Ganggang Telepon (Handset) di Atas
          ctx.fillStyle = '#991b1b';
          ctx.beginPath();
          ctx.arc(ox + 8, obs.y + 2, 6, 0, Math.PI * 2);
          ctx.arc(ox + 28, obs.y + 2, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(ox + 8, obs.y - 1, 20, 5);

          // Coiled Wire
          ctx.strokeStyle = '#450a0a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ox + 6, obs.y + 12);
          ctx.lineTo(ox + 2, obs.y + 6);
          ctx.stroke();

          // Rotary Dial Wheel & Angry Eyes
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(ox + 18, obs.y + 18, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(ox + 16, obs.y + 16, 4, 4);

          // Mouth with Sharp Fangs
          ctx.fillStyle = '#000000';
          ctx.fillRect(ox + 6, obs.y + 22, 24, 7);
          ctx.fillStyle = '#ffffff';
          for (let tx = 0; tx < 4; tx++) {
            ctx.beginPath();
            ctx.moveTo(ox + 7 + tx * 5.5, obs.y + 22);
            ctx.lineTo(ox + 9.5 + tx * 5.5, obs.y + 26);
            ctx.lineTo(ox + 12 + tx * 5.5, obs.y + 22);
            ctx.fill();
          }

          // Walking Legs
          ctx.fillStyle = '#450a0a';
          ctx.fillRect(ox + 6 + legStep, obs.y + 30, 5, 8);
          ctx.fillRect(ox + 22 - legStep, obs.y + 30, 5, 8);

        } else if (obs.type === 'keyboard_evil') {
          // Stage 3: Keyboard Terbakar (Keyboard Jahat dengan Api, Gigi, Tangan & Kaki)
          // Fire Flames Particle Effect Rising from Keyboard
          for (let f = 0; f < 5; f++) {
            const fireOffsetX = f * 8 + 4;
            const flickerY = Math.sin(p.animFrame * 6 + f) * 5;
            ctx.fillStyle = f % 2 === 0 ? '#ef4444' : '#f59e0b';
            ctx.beginPath();
            ctx.arc(ox + fireOffsetX, obs.y - 4 + flickerY, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.arc(ox + fireOffsetX, obs.y - 2 + flickerY, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Keyboard Board
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(ox - 2, obs.y + 4, 42, 24);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(ox, obs.y + 6, 38, 20);

          // Hot Backlit Key Grid
          ctx.fillStyle = '#dc2626';
          for (let ky = 0; ky < 2; ky++) {
            for (let kx = 0; kx < 6; kx++) {
              ctx.fillRect(ox + 3 + kx * 6, obs.y + 8 + ky * 5, 4, 3);
            }
          }

          // Open Jaw with Sharp Fangs along bottom spacebar
          ctx.fillStyle = '#000000';
          ctx.fillRect(ox + 4, obs.y + 18, 30, 7);
          ctx.fillStyle = '#ffffff';
          for (let tx = 0; tx < 5; tx++) {
            ctx.beginPath();
            ctx.moveTo(ox + 5 + tx * 5.5, obs.y + 18);
            ctx.lineTo(ox + 7.5 + tx * 5.5, obs.y + 22);
            ctx.lineTo(ox + 10 + tx * 5.5, obs.y + 18);
            ctx.fill();
          }

          // Fiery Robot Arms (Left & Right)
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(ox - 7, obs.y + 12 + animOffset, 7, 3);
          ctx.fillRect(ox + 38, obs.y + 12 - animOffset, 7, 3);

          // Walking Legs
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(ox + 8 + legStep, obs.y + 26, 5, 8);
          ctx.fillRect(ox + 25 - legStep, obs.y + 26, 5, 8);

        } else if (obs.type === 'puddle') {
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.ellipse(ox + obs.w / 2, obs.y + 8, obs.w / 2, obs.h / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#92400e';
          ctx.font = '10px sans-serif';
          ctx.fillText('💧 Lumpur', ox + 5, obs.y + 6);
        } else if (obs.type === 'cone') {
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.moveTo(ox + obs.w / 2, obs.y);
          ctx.lineTo(ox, obs.y + obs.h);
          ctx.lineTo(ox + obs.w, obs.y + obs.h);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(ox + 5, obs.y + 14, obs.w - 10, 5);
        } else if (obs.type === 'homework') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(ox, obs.y, 26, 30);
          ctx.strokeStyle = '#e2e8f0';
          ctx.strokeRect(ox, obs.y, 26, 30);
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('PR', ox + 4, obs.y + 18);
        }
      }

      // Final Destination Building per Stage
      // Stage 1: SMPN 1 KAWALI (Sekolah)
      // Stage 2: BUMI PERKEMAHAN PRAMUKA (Tempat Kemah)
      // Stage 3: MUSEUM WISATA SAINS & TEKNOLOGI (Tempat Wisata)
      const gateX = engine.schoolGateX - camX;
      if (gateX > -400 && gateX < canvas.width + 400) {
        if (currentStage === 1) {
          drawSekolah(ctx, gateX - 25, 380, p.animFrame, false, 'GERBANG KEDATANGAN UTAMA');
        } else if (currentStage === 2) {
          drawTempatKemah(ctx, gateX - 45, 380, p.animFrame);
        } else {
          drawTempatWisata(ctx, gateX - 55, 380, p.animFrame);
        }
      }

      // Draw Player Outfit per Stage
      const px = p.x - camX;
      const py = p.y;

      if (p.invulnerableFrames % 6 < 3) {
        ctx.save();

        if (p.superPowerFrames > 0) {
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 20;
          ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
          ctx.beginPath();
          ctx.arc(px + p.width / 2, py + p.height / 2, 35, 0, Math.PI * 2);
          ctx.fill();
        }

        if (currentStage === 2) {
          // Outfit Stage 2: Seragam Pramuka Cokelat
          // Ransel Pramuka Cokelat
          ctx.fillStyle = '#78350f';
          ctx.fillRect(p.direction === 'right' ? px - 6 : px + p.width - 2, py + 12, 10, 20);

          // Baju Cokelat Muda Pramuka
          ctx.fillStyle = '#d97706';
          ctx.fillRect(px + 4, py + 12, p.width - 8, 18);

          // Kacu / Setangan Leher Merah Putih
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(px + p.width / 2 - 3, py + 13, 6, 12);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px + p.width / 2 - 1, py + 14, 2, 10);

          // Celana Cokelat Tua
          ctx.fillStyle = '#451a03';
          ctx.fillRect(px + 4, py + 30, p.width - 8, 10);

          // Kepala
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(px + p.width / 2, py + 8, 10, 0, Math.PI * 2);
          ctx.fill();

          // Baret / Topi Pramuka Cokelat
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.arc(px + p.width / 2, py + 4, 11, Math.PI, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f59e0b'; // Lencana Baret
          ctx.fillRect(px + p.width / 2 - 2, py + 2, 4, 4);

        } else if (currentStage === 3) {
          // Outfit Stage 3: Study Tour Almamater Navy Jacket
          ctx.fillStyle = '#0369a1';
          ctx.fillRect(p.direction === 'right' ? px - 6 : px + p.width - 2, py + 12, 10, 20);

          // Jaket Almamater Navy
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(px + 4, py + 12, p.width - 8, 18);

          // ID Card Badge Kuning di Leher
          ctx.fillStyle = '#facc15';
          ctx.fillRect(px + p.width / 2 - 3, py + 16, 6, 8);

          // Celana Slate
          ctx.fillStyle = '#334155';
          ctx.fillRect(px + 4, py + 30, p.width - 8, 10);

          // Kepala
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(px + p.width / 2, py + 8, 10, 0, Math.PI * 2);
          ctx.fill();

          // Rambut Hitam Rapi
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(px + p.width / 2, py + 5, 10, Math.PI, Math.PI * 2);
          ctx.fill();

        } else {
          // Outfit Stage 1: Putih-Biru SMP
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(p.direction === 'right' ? px - 6 : px + p.width - 2, py + 12, 10, 20);

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px + 4, py + 12, p.width - 8, 18);

          ctx.fillStyle = '#dc2626';
          ctx.fillRect(px + p.width / 2 - 2, py + 14, 4, 10);

          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(px + 4, py + 30, p.width - 8, 10);

          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(px + p.width / 2, py + 8, 10, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(px + p.width / 2, py + 5, 10, Math.PI, Math.PI * 2);
          ctx.fill();
        }

        // Eyes
        ctx.fillStyle = '#0f172a';
        const eyeOffsetX = p.direction === 'right' ? 3 : -3;
        ctx.fillRect(px + p.width / 2 + eyeOffsetX, py + 7, 3, 3);

        // Legs
        ctx.fillStyle = currentStage === 2 ? '#451a03' : currentStage === 3 ? '#334155' : '#1e3a8a';
        const legSwing = Math.sin(p.animFrame * 2) * 6;
        ctx.fillRect(px + 6 + legSwing, py + 40, 6, 8);
        ctx.fillRect(px + p.width - 12 - legSwing, py + 40, 6, 8);

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, activeQuiz, currentStage]);

  return (
    <div className="space-y-4 max-w-4xl mx-auto font-sans">
      {/* HUD Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Stage Badge */}
          <div className="px-3 py-1 bg-brand text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm">
            <span>Stage {currentStage}:</span>
            <span>{currentStage === 1 ? 'Berangkat Sekolah' : currentStage === 2 ? 'Kegiatan Pramuka' : 'Study Tour Edukasi'}</span>
          </div>

          <div className="flex items-center gap-1 font-black text-rose-500 text-base">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={cn("transition-all", i < lives ? "opacity-100 scale-100" : "opacity-20 scale-75")}>
                ❤️
              </span>
            ))}
          </div>

          <div className="text-xs font-bold text-slate-300">
            Jarak: <span className="text-amber-400 font-mono font-black text-sm">{distanceRemaining}m</span> ke {currentStage === 1 ? 'SMPN 1 Kawali' : currentStage === 2 ? 'Bumi Perkemahan' : 'Museum Wisata'}
          </div>

          {superPowerActive && (
            <div className="px-2.5 py-1 bg-amber-400 text-amber-950 text-[10px] font-black rounded-lg animate-pulse flex items-center gap-1">
              ⚡ SUPER KUAT (INVINCIBLE)
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <div className="px-3.5 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black rounded-xl">
            Skor: {score}
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative rounded-3xl overflow-hidden border-4 border-slate-900 bg-sky-200 shadow-2xl flex flex-col items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={420}
          className="w-full h-[360px] md:h-[420px] object-cover bg-sky-200"
        />

        {/* Start Overlay & Stage Selector */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 text-white space-y-4">
            <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center shadow-lg text-3xl animate-bounce">
              🎒
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Petualangan Ke Sekolah & Wisata Edukasi</h2>
            <p className="text-xs text-slate-300 max-w-md font-medium leading-relaxed">
              Pilih Stage petualangan kamu! Kumpulkan RAM & Laptop, serta jawab Kuis Kotak Emas dari materi <strong className="text-amber-300">{activeCourseObj?.title || 'Informatika'}</strong>!
            </p>

            {/* Stage Selector Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-800/90 border border-slate-700 rounded-2xl max-w-lg w-full justify-center flex-wrap">
              <button
                onClick={() => startGame(1)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5",
                  currentStage === 1 ? "bg-brand text-white shadow-md" : "bg-slate-700/80 text-slate-300 hover:bg-slate-700"
                )}
              >
                <span>🎒 Stage 1</span>
                <span className="text-[10px] opacity-80">(175m)</span>
              </button>
              <button
                onClick={() => startGame(2)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5",
                  currentStage === 2 ? "bg-amber-600 text-white shadow-md" : "bg-slate-700/80 text-slate-300 hover:bg-slate-700"
                )}
              >
                <span>🏕️ Stage 2</span>
                <span className="text-[10px] opacity-80">(190m)</span>
              </button>
              <button
                onClick={() => startGame(3)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5",
                  currentStage === 3 ? "bg-indigo-600 text-white shadow-md" : "bg-slate-700/80 text-slate-300 hover:bg-slate-700"
                )}
              >
                <span>🏛️ Stage 3</span>
                <span className="text-[10px] opacity-80">(200m)</span>
              </button>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 text-xs text-left max-w-md space-y-1 text-slate-300">
              <p className="font-black text-amber-400 uppercase tracking-wider text-[11px]">🎯 Informasi Stage {currentStage}:</p>
              <p className="text-[11px] font-semibold">
                • <strong>Kuis Materi:</strong> {activeCourseObj?.title || 'Informatika'}<br/>
                • <strong>Seragam:</strong> {currentStage === 1 ? 'Baju Putih Celana Biru SMP' : currentStage === 2 ? 'Seragam Pramuka Cokelat Kacu' : 'Jaket Study Tour Almamater'}<br/>
                • <strong>Monster:</strong> {currentStage === 1 ? 'Komputer Jahat' : currentStage === 2 ? 'Telepon Jahat Bergigi & Kaki' : 'Keyboard Terbakar Bergigi & Tangan'}
              </p>
            </div>

            <button
              onClick={() => startGame(currentStage)}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Play size={20} /> Mulai Mainkan Stage {currentStage}!
            </button>
          </div>
        )}

        {/* Interactive Mystery Box Informatika Quiz Popup & Reward Choice */}
        {activeQuiz && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 text-white space-y-4 z-50 animate-in zoom-in-95">
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
                      🎁 PILIH 1 HADIAH SPESIAL KAMU:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* Reward Item 1: Tambah 1 Hati */}
                      <button
                        onClick={() => handlePickReward('heart')}
                        className="p-3 bg-gradient-to-b from-slate-800 to-rose-950/80 hover:to-rose-900 border-2 border-rose-500/50 hover:border-rose-400 rounded-2xl flex flex-col items-center text-center space-y-1.5 transition-all hover:scale-105 active:scale-95 shadow-md group"
                      >
                        <div className="w-10 h-10 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                          ❤️
                        </div>
                        <span className="font-black text-xs text-white">+1 Hati</span>
                        <span className="text-[10px] text-slate-300 font-medium leading-tight">Tambah nyawa karakter</span>
                      </button>

                      {/* Reward Item 2: Super Kuat */}
                      <button
                        onClick={() => handlePickReward('power')}
                        className="p-3 bg-gradient-to-b from-slate-800 to-amber-950/80 hover:to-amber-900 border-2 border-amber-500/50 hover:border-amber-400 rounded-2xl flex flex-col items-center text-center space-y-1.5 transition-all hover:scale-105 active:scale-95 shadow-md group"
                      >
                        <div className="w-10 h-10 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                          ⚡
                        </div>
                        <span className="font-black text-xs text-white">Super Kuat</span>
                        <span className="text-[10px] text-slate-300 font-medium leading-tight">Kebal rintangan 7.5 dtk</span>
                      </button>

                      {/* Reward Item 3: Bonus Poin */}
                      <button
                        onClick={() => handlePickReward('score')}
                        className="p-3 bg-gradient-to-b from-slate-800 to-emerald-950/80 hover:to-emerald-900 border-2 border-emerald-500/50 hover:border-emerald-400 rounded-2xl flex flex-col items-center text-center space-y-1.5 transition-all hover:scale-105 active:scale-95 shadow-md group"
                      >
                        <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                          ⭐
                        </div>
                        <span className="font-black text-xs text-white">+250 Poin</span>
                        <span className="text-[10px] text-slate-300 font-medium leading-tight">Bonus poin ekstra</span>
                      </button>
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
                      className="p-3 bg-slate-800 hover:bg-brand text-white border border-slate-700 hover:border-brand rounded-xl font-bold text-xs text-left transition-all active:scale-95 shadow-sm"
                    >
                      <span className="font-mono text-amber-400 font-black mr-2">{String.fromCharCode(65 + idx)}.</span>
                      {opt}
                    </button>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* Victory Screen */}
        {gameState === 'win' && (
          <div className="absolute inset-0 bg-emerald-950/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 text-white space-y-4 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center text-amber-950 text-4xl shadow-2xl animate-bounce">
              🏆
            </div>
            <h2 className="text-3xl font-black text-amber-300">
              {currentStage === 3 ? "JUARA PETUALANGAN EDUTAINMENT! 🎉" : `Selamat! Selesai Stage ${currentStage}! 🎉`}
            </h2>
            <p className="text-sm text-emerald-200 font-bold max-w-md">
              {currentStage === 1
                ? "Kamu berhasil tiba di SMPN 1 Kawali! Lanjut ke kegiatan Pramuka?"
                : currentStage === 2
                ? "Kamu berhasil mencapai Bumi Perkemahan Pramuka! Lanjut ke Study Tour Edukasi?"
                : "Selamat! Kamu telah menuntaskan seluruh 3 Stage Petualangan Edukasi Informatika!"}
            </p>

            <div className="bg-emerald-900/80 border border-emerald-700 p-4 rounded-2xl">
              <span className="text-xs text-emerald-300 uppercase font-black tracking-widest block">Total Skor Terkumpul:</span>
              <span className="text-5xl font-black text-amber-400">{score}</span>
            </div>

            <div className="flex gap-3 flex-wrap justify-center pt-2">
              {currentStage < 3 ? (
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
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 text-white space-y-4 animate-in zoom-in-95">
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

      {/* Touch & On-Screen Controls */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onMouseDown={() => (keysRef.current.left = true)}
            onMouseUp={() => (keysRef.current.left = false)}
            onTouchStart={() => (keysRef.current.left = true)}
            onTouchEnd={() => (keysRef.current.left = false)}
            className="w-16 h-14 bg-slate-800 hover:bg-slate-700 active:bg-brand text-white font-black text-xl rounded-2xl border border-slate-700 flex items-center justify-center shadow-lg active:scale-95 transition-transform select-none"
          >
            ◀
          </button>
          <button
            onMouseDown={() => (keysRef.current.right = true)}
            onMouseUp={() => (keysRef.current.right = false)}
            onTouchStart={() => (keysRef.current.right = true)}
            onTouchEnd={() => (keysRef.current.right = false)}
            className="w-16 h-14 bg-slate-800 hover:bg-slate-700 active:bg-brand text-white font-black text-xl rounded-2xl border border-slate-700 flex items-center justify-center shadow-lg active:scale-95 transition-transform select-none"
          >
            ▶
          </button>
        </div>

        <div className="text-center hidden sm:block">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Status Kontrol</span>
          <span className="text-xs font-semibold text-emerald-400">Panah Kanan / Kiri + Panah Atas</span>
        </div>

        <div>
          <button
            onMouseDown={() => (keysRef.current.jump = true)}
            onMouseUp={() => (keysRef.current.jump = false)}
            onTouchStart={() => (keysRef.current.jump = true)}
            onTouchEnd={() => (keysRef.current.jump = false)}
            className="w-24 h-14 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400 text-white font-black text-sm rounded-2xl border border-emerald-500 flex items-center justify-center gap-1 shadow-lg active:scale-95 transition-transform select-none"
          >
            LOMPAT ▲
          </button>
        </div>
      </div>
    </div>
  );
}
