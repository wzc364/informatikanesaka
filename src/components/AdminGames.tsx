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
  Minimize
} from 'lucide-react';
import { cn } from '../utils';
import { doc, setDoc, collection, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface GameItem {
  id: string;
  title: string;
  category: string;
  description: string;
  iconName: 'Calculator' | 'Code' | 'Puzzle' | 'Gamepad2';
  difficulty: 'Mudah' | 'Sedang' | 'Tantangan';
  defaultTimerSec: number;
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
  const [gameConfigs, setGameConfigs] = useState<Record<string, { isActive: boolean; timerSec?: number }>>({});
  const [gameScores, setGameScores] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('all');
  const [filterGame, setFilterGame] = useState('all');

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
                ? "Aktifkan game untuk siswa, atur mode permainan, dan pantau papan skor tertinggi kelas."
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GAMES_LIST.map((game) => {
            const isGameActive = gameConfigs[game.id]?.isActive ?? true;
            const gameHighScore = gameScores
              .filter(s => s.gameId === game.id)
              .reduce((max, s) => Math.max(max, s.score || 0), 0);

            return (
              <div 
                key={game.id}
                className={cn(
                  "p-6 md:p-8 rounded-[2rem] border-2 transition-all flex flex-col justify-between relative overflow-hidden bg-slate-100 shadow-sm hover:shadow-md",
                  isGameActive ? "border-slate-300" : "border-slate-200 opacity-80"
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-md",
                        game.id === 'pattern-master' ? "bg-indigo-600" :
                        game.id === 'scratch-blocks' ? "bg-amber-500" :
                        game.id === 'dekomposisi-puzzle' ? "bg-emerald-600" : "bg-rose-500"
                      )}>
                        {game.iconName === 'Calculator' && <Calculator size={24} />}
                        {game.iconName === 'Code' && <Code size={24} />}
                        {game.iconName === 'Puzzle' && <Puzzle size={24} />}
                        {game.iconName === 'Gamepad2' && <Gamepad2 size={24} />}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                          {game.category}
                        </span>
                        <h3 className="text-xl font-black text-slate-900 leading-tight">
                          {game.title}
                        </h3>
                      </div>
                    </div>

                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0",
                      isGameActive 
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                        : "bg-slate-200 text-slate-500 border-slate-300"
                    )}>
                      {isGameActive ? '✓ Terbit' : '✕ Nonaktif'}
                    </div>
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
                    <div className="bg-slate-200/70 p-3 rounded-xl border border-slate-300/80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Skor Tertinggi</span>
                      <span className="text-xs font-black text-emerald-700 flex items-center gap-1">
                        <Trophy size={12} className="text-amber-500" /> {gameHighScore} Poin
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-300/80 flex-wrap">
                  {isAdmin && (
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
                          <X size={14} /> Nonaktifkan untuk Siswa
                        </>
                      ) : (
                        <>
                          <Check size={14} /> Aktifkan untuk Siswa
                        </>
                      )}
                    </button>
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
   Game 5: Petualangan Ke Sekolah (2D Platformer - Mario Style)
   ------------------------------------------------------------------------- */
function PetualanganSMPGame({ isAdmin, currentStudent, onClose }: { isAdmin: boolean; currentStudent: any; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'start' | 'playing' | 'win' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [distanceRemaining, setDistanceRemaining] = useState(100);
  const [superPowerActive, setSuperPowerActive] = useState(false);

  // Mystery Box Quiz State
  const [activeQuiz, setActiveQuiz] = useState<{
    id: number;
    question: string;
    options: string[];
    correctIdx: number;
    explanation: string;
  } | null>(null);

  const [quizFeedback, setQuizFeedback] = useState<{ msg: string; isCorrect: boolean } | null>(null);

  const keysRef = useRef<{ left: boolean; right: boolean; jump: boolean }>({ left: false, right: false, jump: false });

  const QUIZZES = [
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

  const engineRef = useRef({
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
    worldWidth: 3400,
    platforms: [
      { x: 0, y: 380, w: 600, h: 100, type: 'ground' },
      { x: 680, y: 380, w: 500, h: 100, type: 'ground' },
      { x: 800, y: 280, w: 120, h: 20, type: 'platform' },
      { x: 980, y: 220, w: 120, h: 20, type: 'platform' },
      { x: 1240, y: 380, w: 700, h: 100, type: 'ground' },
      { x: 1400, y: 270, w: 140, h: 20, type: 'platform' },
      { x: 1600, y: 200, w: 140, h: 20, type: 'platform' },
      { x: 2000, y: 380, w: 1300, h: 100, type: 'ground' },
      { x: 2200, y: 280, w: 160, h: 20, type: 'platform' },
      { x: 2450, y: 240, w: 160, h: 20, type: 'platform' }
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
    ],
    obstacles: [
      { id: 1, x: 450, y: 365, w: 60, h: 15, type: 'puddle', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 2, x: 750, y: 344, w: 38, h: 36, type: 'computer_evil', vx: 1.6, minX: 700, maxX: 1100, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 3, x: 1350, y: 350, w: 25, h: 30, type: 'cone', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 4, x: 1500, y: 344, w: 38, h: 36, type: 'computer_evil', vx: -1.8, minX: 1300, maxX: 1750, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 5, x: 1800, y: 200, w: 30, h: 30, type: 'homework', vx: 0, minX: 0, maxX: 0, vy: 2, minY: 150, maxY: 330, yDir: 1, destroyed: false },
      { id: 6, x: 2150, y: 365, w: 70, h: 15, type: 'puddle', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      { id: 7, x: 2350, y: 344, w: 38, h: 36, type: 'computer_evil', vx: 2, minX: 2100, maxX: 2600, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
    ],
    schoolGateX: 3200,
  });

  const resetEngine = () => {
    engineRef.current = {
      player: {
        x: 100,
        y: 300,
        width: 32,
        height: 48,
        vx: 0,
        vy: 0,
        isGrounded: false,
        direction: 'right',
        invulnerableFrames: 0,
        superPowerFrames: 0,
        animFrame: 0,
      },
      cameraX: 0,
      worldWidth: 3400,
      platforms: [
        { x: 0, y: 380, w: 600, h: 100, type: 'ground' },
        { x: 680, y: 380, w: 500, h: 100, type: 'ground' },
        { x: 800, y: 280, w: 120, h: 20, type: 'platform' },
        { x: 980, y: 220, w: 120, h: 20, type: 'platform' },
        { x: 1240, y: 380, w: 700, h: 100, type: 'ground' },
        { x: 1400, y: 270, w: 140, h: 20, type: 'platform' },
        { x: 1600, y: 200, w: 140, h: 20, type: 'platform' },
        { x: 2000, y: 380, w: 1300, h: 100, type: 'ground' },
        { x: 2200, y: 280, w: 160, h: 20, type: 'platform' },
        { x: 2450, y: 240, w: 160, h: 20, type: 'platform' }
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
      ],
      obstacles: [
        { id: 1, x: 450, y: 365, w: 60, h: 15, type: 'puddle', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 2, x: 750, y: 344, w: 38, h: 36, type: 'computer_evil', vx: 1.6, minX: 700, maxX: 1100, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 3, x: 1350, y: 350, w: 25, h: 30, type: 'cone', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 4, x: 1500, y: 344, w: 38, h: 36, type: 'computer_evil', vx: -1.8, minX: 1300, maxX: 1750, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 5, x: 1800, y: 200, w: 30, h: 30, type: 'homework', vx: 0, minX: 0, maxX: 0, vy: 2, minY: 150, maxY: 330, yDir: 1, destroyed: false },
        { id: 6, x: 2150, y: 365, w: 70, h: 15, type: 'puddle', vx: 0, minX: 0, maxX: 0, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
        { id: 7, x: 2350, y: 344, w: 38, h: 36, type: 'computer_evil', vx: 2, minX: 2100, maxX: 2600, vy: 0, minY: 0, maxY: 0, yDir: 1, destroyed: false },
      ],
      schoolGateX: 3200,
    };
  };

  const startGame = () => {
    resetEngine();
    setScore(0);
    setLives(3);
    setDistanceRemaining(100);
    setActiveQuiz(null);
    setQuizFeedback(null);
    setSuperPowerActive(false);
    setGameState('playing');
  };

  const saveFinalScore = async (finalScore: number) => {
    if (!currentStudent && !isAdmin) return;
    try {
      await setDoc(doc(collection(db, 'game_scores')), {
        gameId: 'petualangan-smp',
        gameTitle: 'Petualangan Ke Sekolah',
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
      setQuizFeedback({
        msg: "⚡ JAWABAN BENAR! Karakter mendapatkan Super Power Kuat (Invincible & Hancurkan Komputer Jahat)! +150 Poin 🎉",
        isCorrect: true
      });
      setScore(s => s + 150);
      engineRef.current.player.superPowerFrames = 400; // ~6.5 seconds of super power
      setSuperPowerActive(true);
    } else {
      setQuizFeedback({
        msg: "❌ Jawaban kurang tepat! Tidak mendapatkan kekuatan super.",
        isCorrect: false
      });
    }

    setTimeout(() => {
      setActiveQuiz(null);
      setQuizFeedback(null);
    }, 2200);
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
              const qObj = QUIZZES[qIdx % QUIZZES.length];
              setActiveQuiz(qObj);
            }
          }
        }
      }

      // Obstacle Collisions
      for (const obs of engine.obstacles) {
        if (obs.destroyed) continue;

        if (obs.type === 'computer_evil') {
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

      // Sky
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGradient.addColorStop(0, '#38bdf8');
      skyGradient.addColorStop(0.7, '#bae6fd');
      skyGradient.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Hills
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const hillX = i * 400 - camX * 0.2;
        ctx.arc(hillX + 200, 360, 200, Math.PI, 0, false);
      }
      ctx.fill();

      // Background Houses
      for (let i = 0; i < 8; i++) {
        const houseX = i * 500 + 100 - camX * 0.5;
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(houseX, 290, 80, 70);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(houseX - 10, 290);
        ctx.lineTo(houseX + 40, 250);
        ctx.lineTo(houseX + 90, 290);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#b45309';
        ctx.fillRect(houseX + 30, 320, 20, 40);
      }

      // Starting House
      const startHouseX = 50 - camX;
      ctx.fillStyle = '#fb923c';
      ctx.fillRect(startHouseX, 260, 110, 100);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(startHouseX - 15, 260);
      ctx.lineTo(startHouseX + 55, 200);
      ctx.lineTo(startHouseX + 125, 260);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('RUMAH', startHouseX + 30, 240);

      // Draw Platforms
      for (const plat of engine.platforms) {
        const px = plat.x - camX;
        if (px + plat.w < -50 || px > canvas.width + 50) continue;

        if (plat.type === 'ground') {
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(px, plat.y, plat.w, 15);
          ctx.fillStyle = '#b45309';
          ctx.fillRect(px, plat.y + 15, plat.w, plat.h - 15);
          ctx.fillStyle = '#16a34a';
          for (let gx = 0; gx < plat.w; gx += 20) {
            ctx.fillRect(px + gx, plat.y + 12, 10, 5);
          }
        } else {
          ctx.fillStyle = '#eab308';
          ctx.fillRect(px, plat.y, plat.w, plat.h);
          ctx.strokeStyle = '#a16207';
          ctx.lineWidth = 3;
          ctx.strokeRect(px, plat.y, plat.w, plat.h);
          ctx.strokeStyle = '#ca8a04';
          ctx.beginPath();
          ctx.moveTo(px + plat.w / 2, plat.y);
          ctx.lineTo(px + plat.w / 2, plat.y + plat.h);
          ctx.stroke();
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
          ctx.fillRect(ix, floatY, 24, 15); // Screen
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(ix + 2, floatY + 2, 20, 11); // Display
          ctx.fillStyle = '#0284c7';
          ctx.font = 'bold 8px sans-serif';
          ctx.fillText('💻', ix + 5, floatY + 11);

          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(ix - 3, floatY + 15, 30, 5); // Keyboard base
        } else if (item.type === 'ram') {
          // RAM Chip Icon (+100 Poin)
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(ix, floatY, 26, 18); // PCB Board
          ctx.fillStyle = '#15803d';
          ctx.strokeRect(ix, floatY, 26, 18);

          // Black RAM Chips
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(ix + 3, floatY + 3, 5, 8);
          ctx.fillRect(ix + 10, floatY + 3, 5, 8);
          ctx.fillRect(ix + 17, floatY + 3, 5, 8);

          // Gold Pins
          ctx.fillStyle = '#eab308';
          ctx.fillRect(ix + 2, floatY + 15, 22, 3);
        } else if (item.type === 'mystery_box') {
          // Kotak Emas Informatika (Interactive Quiz Box)
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(ix, floatY, 28, 28);
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 2;
          ctx.strokeRect(ix, floatY, 28, 28);

          // Inner Golden Glow & Question Mark
          ctx.fillStyle = '#fef08a';
          ctx.font = 'black 16px sans-serif';
          ctx.fillText('❓', ix + 5, floatY + 20);
        }
      }

      // Draw Obstacles (Komputer Jahat, Puddle, Cone, Homework)
      for (const obs of engine.obstacles) {
        if (obs.destroyed) continue;
        const ox = obs.x - camX;
        if (ox + obs.w < -50 || ox > canvas.width + 50) continue;

        if (obs.type === 'computer_evil') {
          // Komputer Jahat (Evil Monitor Enemy)
          // Monitor Body
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(ox, obs.y, 34, 26);
          ctx.fillStyle = '#0f172a';
          ctx.strokeRect(ox, obs.y, 34, 26);

          // Red Virus Screen
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(ox + 3, obs.y + 3, 28, 20);

          // Angry Eyes & Teeth (Komputer Jahat)
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText('👿', ox + 8, obs.y + 17);

          // Monitor Stand & Base
          ctx.fillStyle = '#475569';
          ctx.fillRect(ox + 12, obs.y + 26, 10, 5);
          ctx.fillRect(ox + 6, obs.y + 31, 22, 4);

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
          ctx.closePath();
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

      // School Gate & Flag
      const gateX = engine.schoolGateX - camX;
      if (gateX > -200 && gateX < canvas.width + 200) {
        ctx.fillStyle = '#334155';
        ctx.fillRect(gateX, 180, 30, 200);
        ctx.fillRect(gateX + 220, 180, 30, 200);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(gateX - 10, 160, 270, 35);
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('SMPN 1 KAWALI', gateX + 50, 183);

        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(gateX + 235, 80, 6, 100);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(gateX + 241, 80, 45, 18);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(gateX + 241, 98, 45, 18);
        ctx.strokeStyle = '#e2e8f0';
        ctx.strokeRect(gateX + 241, 80, 45, 36);

        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(gateX + 30, 220, 160, 160);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(gateX + 70, 300, 80, 80);
      }

      // Draw Player (Anak SMP)
      const px = p.x - camX;
      const py = p.y;

      if (p.invulnerableFrames % 6 < 3) {
        ctx.save();

        // Super Power Glowing Aura Effect
        if (p.superPowerFrames > 0) {
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 20;
          ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
          ctx.beginPath();
          ctx.arc(px + p.width / 2, py + p.height / 2, 35, 0, Math.PI * 2);
          ctx.fill();
        }

        // Bag (Tas Sekolah)
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(p.direction === 'right' ? px - 6 : px + p.width - 2, py + 12, 10, 20);

        // White Shirt (Baju Putih SMP)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + 4, py + 12, p.width - 8, 18);

        // Tie (Dasi Merah SMP)
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(px + p.width / 2 - 2, py + 14, 4, 10);

        // Blue Pants (Celana Biru SMP)
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(px + 4, py + 30, p.width - 8, 10);

        // Head (Kepala)
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(px + p.width / 2, py + 8, 10, 0, Math.PI * 2);
        ctx.fill();

        // Hair (Rambut Hitam Rapi)
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(px + p.width / 2, py + 5, 10, Math.PI, Math.PI * 2);
        ctx.fill();

        // Eye (Mata)
        ctx.fillStyle = '#0f172a';
        const eyeOffsetX = p.direction === 'right' ? 3 : -3;
        ctx.fillRect(px + p.width / 2 + eyeOffsetX, py + 7, 3, 3);

        // Legs (Kaki Berjalan)
        ctx.fillStyle = '#1e3a8a';
        const legSwing = Math.sin(p.animFrame * 2) * 6;
        ctx.fillRect(px + 6 + legSwing, py + 40, 6, 8);
        ctx.fillRect(px + p.width - 12 - legSwing, py + 40, 6, 8);

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, activeQuiz]);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* HUD Header */}
      <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 font-black text-rose-500 text-lg">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={cn("transition-all", i < lives ? "opacity-100 scale-100" : "opacity-20 scale-75")}>
                ❤️
              </span>
            ))}
          </div>
          <div className="h-6 w-px bg-slate-700" />
          <div className="text-xs font-bold text-slate-300">
            Jarak: <span className="text-amber-400 font-mono font-black text-sm">{distanceRemaining}m</span> ke SMPN 1 Kawali
          </div>
          {superPowerActive && (
            <div className="px-2.5 py-1 bg-amber-400 text-amber-950 text-[10px] font-black rounded-lg animate-pulse flex items-center gap-1">
              ⚡ SUPER KUAT (INVINCIBLE)
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-brand/20 border border-brand/40 text-brand text-xs font-black rounded-xl">
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

        {/* Start Overlay */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 text-white space-y-4">
            <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center shadow-lg text-3xl animate-bounce">
              🎒
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Petualangan Ke Sekolah</h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-md font-medium leading-relaxed">
              Bantu <span className="text-amber-400 font-bold">Anak SMP (Seragam Putih-Biru)</span> berangkat dari rumah menuju <span className="text-emerald-400 font-bold">SMPN 1 Kawali</span>!
            </p>
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 text-xs text-left max-w-md space-y-1.5 text-slate-300">
              <p className="font-black text-amber-400 uppercase tracking-wider text-[11px]">🎯 Target & Item Game:</p>
              <ul className="space-y-1 text-[11px] font-semibold">
                <li>• 🟩 <strong>RAM:</strong> Poin +100</li>
                <li>• 💻 <strong>Laptop:</strong> Poin +50</li>
                <li>• ❓ <strong>Kotak Emas Informatika:</strong> Jawab kuis untuk dapatkan <strong className="text-amber-300">Super Power Kuat (Invincible)</strong>!</li>
                <li>• 👿 <strong>Komputer Jahat & Lumpur:</strong> Hindari atau tabrak dengan Super Power!</li>
              </ul>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Play size={20} /> Mulai Bermain!
            </button>
          </div>
        )}

        {/* Interactive Mystery Box Informatika Quiz Popup */}
        {activeQuiz && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 text-white space-y-4 z-50 animate-in zoom-in-95">
            <div className="w-14 h-14 bg-amber-400 text-amber-950 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg animate-bounce">
              ❓
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full">
              Kuis Kotak Emas Informatika
            </span>
            <h3 className="text-lg md:text-xl font-black max-w-md text-white leading-snug">
              {activeQuiz.question}
            </h3>

            {quizFeedback ? (
              <div className={cn(
                "p-4 rounded-2xl border text-xs md:text-sm font-bold max-w-md animate-in fade-in",
                quizFeedback.isCorrect ? "bg-emerald-950/90 border-emerald-500 text-emerald-200" : "bg-rose-950/90 border-rose-500 text-rose-200"
              )}>
                {quizFeedback.msg}
              </div>
            ) : (
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
            )}
          </div>
        )}

        {/* Victory Screen */}
        {gameState === 'win' && (
          <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 text-white space-y-4 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center text-amber-950 text-4xl shadow-2xl animate-bounce">
              🏫
            </div>
            <h2 className="text-3xl font-black text-amber-300">Selamat! Sampai Di Sekolah! 🎉</h2>
            <p className="text-sm text-emerald-200 font-bold max-w-md">
              Kamu berhasil mengantarkan siswa tiba tepat waktu di SMPN 1 Kawali!
            </p>
            <div className="bg-emerald-900/80 border border-emerald-700 p-4 rounded-2xl">
              <span className="text-xs text-emerald-300 uppercase font-black tracking-widest block">Total Skor Kamu:</span>
              <span className="text-5xl font-black text-amber-400">{score}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-amber-400 text-amber-950 font-black rounded-xl text-sm hover:bg-amber-300 transition-all"
              >
                Main Lagi 🔄
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl text-sm hover:bg-slate-700 transition-all"
              >
                Tutup
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
            <h2 className="text-2xl font-black text-rose-400">Terlambat / Kehabisan Nyawa!</h2>
            <p className="text-xs text-slate-300 font-medium max-w-xs">
              Jangan menyerah! Coba lagi, kumpulkan RAM & Laptop, serta jawab Kuis Kotak Emas untuk menjadi Super Kuat!
            </p>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-bold block">Skor Terkumpul:</span>
              <span className="text-3xl font-black text-white">{score}</span>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3.5 bg-brand text-white font-black rounded-xl text-sm shadow-lg hover:scale-105 transition-all"
            >
              Coba Lagi 🔄
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
