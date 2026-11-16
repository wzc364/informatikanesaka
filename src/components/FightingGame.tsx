/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shield, Zap, RotateCcw, ArrowLeft, Trophy, Flame, Award, Heart } from 'lucide-react';
import { cn } from '../utils';
import { db } from '../firebase';
import { collection, setDoc, doc, serverTimestamp } from 'firebase/firestore';

interface FightingGameProps {
  currentStudent?: any;
  isAdmin?: boolean;
  onExit: () => void;
  onFirestoreError?: (err: unknown, op: string, path: string) => void;
}

export default function FightingGame({ currentStudent, isAdmin, onExit, onFirestoreError }: FightingGameProps) {
  // Game states
  const [gameState, setGameState] = useState<'title' | 'charsel' | 'fighting' | 'gameover' | 'victory'>('title');
  const [playerChar, setPlayerChar] = useState<'byte' | 'algorithm' | 'cyber'>('byte');
  const [enemyChar, setEnemyChar] = useState<'bug' | 'malware' | 'trojan'>('bug');
  
  // Combat stats
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [playerEnergy, setPlayerEnergy] = useState(0);
  const [playerWins, setPlayerWins] = useState(0);
  const [enemyWins, setEnemyWins] = useState(0);
  const [round, setRound] = useState(1);
  const [combatLog, setCombatLog] = useState<string>("ROUND 1 • FIGHT!");
  const [isBlocking, setIsBlocking] = useState(false);
  const [isEnemyBlocking, setIsEnemyBlocking] = useState(false);
  const [playerAnim, setPlayerAnim] = useState<'idle' | 'punch' | 'kick' | 'special' | 'hit' | 'block'>('idle');
  const [enemyAnim, setEnemyAnim] = useState<'idle' | 'punch' | 'kick' | 'special' | 'hit' | 'block'>('idle');
  const [score, setScore] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const characters = [
    { id: 'byte', name: 'Byte Master', title: 'The Code Warrior', icon: '⚡', hp: 100, attack: 15, color: 'from-blue-600 to-indigo-700' },
    { id: 'algorithm', name: 'Logic Knight', title: 'Master of Boolean', icon: '🛡️', hp: 110, attack: 13, color: 'from-emerald-600 to-teal-700' },
    { id: 'cyber', name: 'Cyber Ninja', title: 'Speed & Encryption', icon: '⚔️', hp: 90, attack: 18, color: 'from-purple-600 to-pink-700' },
  ];

  const enemies = [
    { id: 'bug', name: 'Syntax Bug', title: 'The Destroyer of Code', icon: '🐛', hp: 90, attack: 12 },
    { id: 'malware', name: 'Red Malware', title: 'Corruptor of Data', icon: '🦠', hp: 100, attack: 15 },
    { id: 'trojan', name: 'Dark Trojan', title: 'Lord of Exploits', icon: '👾', hp: 120, attack: 17 },
  ];

  // AI loop during combat
  useEffect(() => {
    if (gameState !== 'fighting') return;

    const aiInterval = setInterval(() => {
      if (playerHp <= 0 || enemyHp <= 0) return;

      const rand = Math.random();
      if (rand < 0.4) {
        // AI Attack
        const dmg = Math.floor(Math.random() * 8) + 8;
        if (isBlocking) {
          setCombatLog("Player blocked enemy attack! Minimal damage.");
          setPlayerHp(prev => Math.max(0, prev - Math.floor(dmg / 3)));
          setPlayerAnim('block');
        } else {
          setEnemyAnim('punch');
          setPlayerHp(prev => Math.max(0, prev - dmg));
          setPlayerAnim('hit');
          setCombatLog(`Enemy hit player for ${dmg} DMG!`);
        }
        setTimeout(() => {
          setEnemyAnim('idle');
          setPlayerAnim('idle');
        }, 400);
      } else if (rand < 0.6) {
        // AI Block
        setIsEnemyBlocking(true);
        setEnemyAnim('block');
        setTimeout(() => {
          setIsEnemyBlocking(false);
          setEnemyAnim('idle');
        }, 800);
      }
    }, 1800);

    return () => clearInterval(aiInterval);
  }, [gameState, playerHp, enemyHp, isBlocking]);

  // Check round end
  useEffect(() => {
    if (gameState !== 'fighting') return;

    if (enemyHp <= 0) {
      setCombatLog("ROUND WON! Flawless Victory!");
      const newWins = playerWins + 1;
      setPlayerWins(newWins);
      const earnedScore = 500 + playerHp * 5;
      setScore(prev => prev + earnedScore);

      if (newWins >= 2 || round >= 2) {
        setGameState('victory');
        saveGameScore(score + earnedScore);
      } else {
        setTimeout(() => {
          setRound(2);
          setPlayerHp(100);
          setEnemyHp(100);
          setCombatLog("ROUND 2 • FIGHT!");
        }, 2000);
      }
    } else if (playerHp <= 0) {
      setCombatLog("DEFEAT... Try again!");
      setGameState('gameover');
    }
  }, [playerHp, enemyHp]);

  const saveGameScore = async (finalScore: number) => {
    if (!currentStudent || isAdmin || isSaving) return;
    setIsSaving(true);
    try {
      const scoreId = `${currentStudent.id}_infokombat_${Date.now()}`;
      await setDoc(doc(db, 'game_scores', scoreId), {
        studentId: currentStudent.id,
        studentName: currentStudent.nama,
        kelas: currentStudent.kelas,
        gameId: 'infokombat',
        gameTitle: 'Informatika Kombat',
        score: finalScore,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error('Error saving fighting score:', err);
      onFirestoreError?.(err, 'write', 'game_scores');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlayerAttack = (type: 'punch' | 'kick' | 'special') => {
    if (playerHp <= 0 || enemyHp <= 0) return;

    let dmg = 12;
    let energyGain = 15;
    if (type === 'kick') { dmg = 18; energyGain = 20; setPlayerAnim('kick'); }
    else if (type === 'punch') { dmg = 12; energyGain = 15; setPlayerAnim('punch'); }
    else if (type === 'special') {
      if (playerEnergy < 100) {
        setCombatLog("Energy not full! (Need 100%)");
        return;
      }
      dmg = 35;
      energyGain = -100;
      setPlayerAnim('special');
      setCombatLog("FATALITY SPECIAL MOVE RELEASED!");
    }

    if (isEnemyBlocking) {
      dmg = Math.floor(dmg / 2);
      setCombatLog("Enemy blocked your attack!");
    } else {
      setCombatLog(`You landed a ${type.toUpperCase()} for ${dmg} DMG!`);
      setEnemyAnim('hit');
    }

    setEnemyHp(prev => Math.max(0, prev - dmg));
    setPlayerEnergy(prev => Math.min(100, Math.max(0, prev + energyGain)));

    setTimeout(() => {
      setPlayerAnim('idle');
      setEnemyAnim('idle');
    }, 450);
  };

  const handleBlockToggle = (active: boolean) => {
    setIsBlocking(active);
    if (active) setPlayerAnim('block');
    else setPlayerAnim('idle');
  };

  const startMatch = (charId: 'byte' | 'algorithm' | 'cyber') => {
    setPlayerChar(charId);
    const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
    setEnemyChar(randomEnemy.id as any);
    setPlayerHp(100);
    setEnemyHp(randomEnemy.hp);
    setPlayerEnergy(0);
    setPlayerWins(0);
    setEnemyWins(0);
    setRound(1);
    setScore(0);
    setGameState('fighting');
    setCombatLog("ROUND 1 • FIGHT!");
  };

  const selectedCharData = characters.find(c => c.id === playerChar) || characters[0];
  const selectedEnemyData = enemies.find(e => e.id === enemyChar) || enemies[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col select-none overflow-hidden relative">
      {/* Background Neon Grid & FX */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

      {/* Top Bar */}
      <div className="relative z-20 flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <button 
          onClick={onExit}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-extrabold transition-all duration-300 active:scale-95"
        >
          <ArrowLeft size={16} /> Keluar Arena
        </button>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
            <Flame size={14} /> FANTASY COMBAT 16-BIT
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-black text-amber-400 tabular-nums">
          <Trophy size={16} /> Skor: {score}
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 max-w-5xl mx-auto w-full">
        {gameState === 'title' && (
          <div className="text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 rounded-3xl blur-xl opacity-50 animate-pulse" />
              <div className="relative bg-slate-900 border-2 border-red-500/50 p-8 md:p-12 rounded-3xl shadow-2xl">
                <span className="text-xs font-black uppercase tracking-widest bg-amber-400 text-amber-950 px-3 py-1 rounded-full">
                  MORTAL KOMBAT INFORMATIKA
                </span>
                <h1 className="text-4xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-orange-500 tracking-tighter mt-4 drop-shadow-md uppercase">
                  INFORMATIKA KOMBAT
                </h1>
                <p className="text-slate-400 font-semibold text-sm md:text-base max-w-md mx-auto mt-3">
                  Pertarungan epik antar pejuang logika & kode! Pilih petarungmu, keluarkan combo combo maut dan kalahkan virus serta malware!
                </p>
                <div className="mt-8 flex justify-center gap-4">
                  <button 
                    onClick={() => setGameState('charsel')}
                    className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Zap size={20} className="text-amber-300" /> MULAI PERTARUNGAN
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {gameState === 'charsel' && (
          <div className="w-full space-y-6 animate-in fade-in duration-300 text-center">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-amber-400 drop-shadow-md">
              Pilih Pejuang Informatika
            </h2>
            <p className="text-slate-400 text-xs md:text-sm font-semibold">Setiap petarung memiliki keahlian khusus dan kekuatan serangan berbeda.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {characters.map(c => (
                <div 
                  key={c.id}
                  onClick={() => startMatch(c.id as any)}
                  className="bg-slate-900/90 border-2 border-slate-800 hover:border-brand p-6 rounded-3xl cursor-pointer group hover:shadow-2xl hover:shadow-brand/20 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
                >
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-25 transition-opacity", c.color)} />
                  <div className="w-24 h-24 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-5xl mb-4 group-hover:scale-110 transition-transform shadow-inner">
                    {c.icon}
                  </div>
                  <h3 className="text-xl font-extrabold text-white mb-1 group-hover:text-amber-400 transition-colors">{c.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{c.title}</p>
                  
                  <div className="w-full space-y-2 mt-auto text-xs font-bold text-slate-300">
                    <div className="flex justify-between bg-slate-800/80 px-3 py-1.5 rounded-xl">
                      <span>HP Dasar</span>
                      <span className="text-emerald-400">{c.hp}</span>
                    </div>
                    <div className="flex justify-between bg-slate-800/80 px-3 py-1.5 rounded-xl">
                      <span>Kekuatan Serangan</span>
                      <span className="text-amber-400">{c.attack} DMG</span>
                    </div>
                  </div>

                  <button className="w-full mt-5 py-3 bg-gradient-to-r from-brand to-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md group-hover:from-blue-600 group-hover:to-indigo-600 transition-all">
                    Pilih Pejuang Ini
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {gameState === 'fighting' && (
          <div className="w-full space-y-6 animate-in fade-in duration-300">
            {/* Top HUD: Health Bars & Round */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 md:p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Player HP */}
              <div className="w-full md:w-5/12 space-y-2">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider">
                  <span className="text-blue-400">{selectedCharData.name} (Player)</span>
                  <span className="text-emerald-400 tabular-nums">{playerHp} / 100 HP</span>
                </div>
                <div className="w-full h-5 bg-slate-950 rounded-full overflow-hidden p-1 border border-slate-800 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 shadow-lg shadow-emerald-500/50" 
                    style={{ width: `${Math.max(0, playerHp)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Energy Special</span>
                  <span className="text-[10px] font-black text-amber-400 tabular-nums">{playerEnergy}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
                    style={{ width: `${playerEnergy}%` }}
                  />
                </div>
              </div>

              {/* Round & Log Center */}
              <div className="flex flex-col items-center text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-600/30 mb-2">
                  R{round}
                </div>
                <span className="text-xs font-extrabold text-amber-300 uppercase tracking-widest animate-pulse max-w-xs">
                  {combatLog}
                </span>
              </div>

              {/* Enemy HP */}
              <div className="w-full md:w-5/12 space-y-2">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider">
                  <span className="text-rose-400">{selectedEnemyData.name} (Enemy)</span>
                  <span className="text-rose-400 tabular-nums">{enemyHp} / {selectedEnemyData.hp} HP</span>
                </div>
                <div className="w-full h-5 bg-slate-950 rounded-full overflow-hidden p-1 border border-slate-800 shadow-inner flex justify-end">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-red-600 rounded-full transition-all duration-300 shadow-lg shadow-rose-500/50" 
                    style={{ width: `${Math.max(0, (enemyHp / selectedEnemyData.hp) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Boss Threat Level: High</span>
                </div>
              </div>
            </div>

            {/* Arena Battle Stage Animation Box */}
            <div className="relative h-64 md:h-80 w-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex items-end justify-between px-12 md:px-24 pb-8">
              {/* Stage Background Lights */}
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-600 via-amber-500 to-blue-600 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center opacity-10 text-[10rem] font-black font-mono select-none pointer-events-none">
                KOMBAT
              </div>

              {/* Player Character Sprite Box */}
              <div className={cn(
                "flex flex-col items-center transition-transform duration-200",
                playerAnim === 'punch' && "translate-x-10 scale-105",
                playerAnim === 'kick' && "translate-x-12 -translate-y-4 scale-105",
                playerAnim === 'special' && "translate-x-16 scale-110",
                playerAnim === 'hit' && "-translate-x-8 scale-95 opacity-80",
                playerAnim === 'block' && "translate-x-2"
              )}>
                <div className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2 bg-slate-900/80 px-3 py-1 rounded-full border border-blue-500/30">
                  {selectedCharData.name} {isBlocking && '🛡️ [BLOCK]'} {playerAnim === 'special' && '⚡ [FATALITY]'}
                </div>
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-slate-800 border-2 border-blue-500/50 flex items-center justify-center text-6xl md:text-7xl shadow-2xl shadow-blue-500/30 relative">
                  {selectedCharData.icon}
                  {playerAnim === 'special' && (
                    <div className="absolute inset-0 bg-amber-400/30 rounded-3xl animate-ping" />
                  )}
                </div>
              </div>

              {/* VS Badge */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl md:text-4xl font-black text-slate-700 italic tracking-tighter">
                VS
              </div>

              {/* Enemy Character Sprite Box */}
              <div className={cn(
                "flex flex-col items-center transition-transform duration-200",
                enemyAnim === 'punch' && "-translate-x-10 scale-105",
                enemyAnim === 'hit' && "translate-x-8 scale-95 opacity-80",
                enemyAnim === 'block' && "-translate-x-2"
              )}>
                <div className="text-xs font-black text-rose-400 uppercase tracking-widest mb-2 bg-slate-900/80 px-3 py-1 rounded-full border border-rose-500/30">
                  {selectedEnemyData.name} {enemyAnim === 'block' && '🛡️ [BLOCK]'}
                </div>
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-slate-800 border-2 border-rose-500/50 flex items-center justify-center text-6xl md:text-7xl shadow-2xl shadow-rose-500/30">
                  {selectedEnemyData.icon}
                </div>
              </div>
            </div>

            {/* Combat Control Deck */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => handlePlayerAttack('punch')}
                className="py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-blue-600/30 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
              >
                <span className="text-lg">👊 PUNCH</span>
                <span className="text-[10px] text-blue-200 font-bold uppercase">Serangan Cepat (12 DMG)</span>
              </button>

              <button 
                onClick={() => handlePlayerAttack('kick')}
                className="py-5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black rounded-2xl shadow-lg shadow-amber-600/30 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
              >
                <span className="text-lg">🦵 KICK</span>
                <span className="text-[10px] text-amber-200 font-bold uppercase">Tendangan Keras (18 DMG)</span>
              </button>

              <button 
                onMouseDown={() => handleBlockToggle(true)}
                onMouseUp={() => handleBlockToggle(false)}
                onTouchStart={() => handleBlockToggle(true)}
                onTouchEnd={() => handleBlockToggle(false)}
                className={cn(
                  "py-5 font-black rounded-2xl shadow-lg flex flex-col items-center justify-center gap-1 active:scale-95 transition-all",
                  isBlocking ? "bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400" : "bg-slate-800 hover:bg-slate-700 text-slate-200 shadow-slate-900"
                )}
              >
                <span className="text-lg">🛡️ BLOCK</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Tahan untuk Bertahan</span>
              </button>

              <button 
                onClick={() => handlePlayerAttack('special')}
                disabled={playerEnergy < 100}
                className={cn(
                  "py-5 font-black rounded-2xl shadow-lg flex flex-col items-center justify-center gap-1 transition-all",
                  playerEnergy >= 100 
                    ? "bg-gradient-to-r from-red-600 via-purple-600 to-pink-600 text-white shadow-red-600/50 hover:scale-105 animate-pulse cursor-pointer" 
                    : "bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed"
                )}
              >
                <span className="text-lg">⚡ FATALITY</span>
                <span className="text-[10px] font-bold uppercase">{playerEnergy >= 100 ? 'Siap Dikeluarkan!' : `Energy ${playerEnergy}%`}</span>
              </button>
            </div>
          </div>
        )}

        {gameState === 'victory' && (
          <div className="text-center space-y-6 animate-in zoom-in-95 duration-500 bg-slate-900/90 p-10 rounded-3xl border border-amber-500/50 shadow-2xl max-w-lg w-full">
            <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-amber-500/40">
              <Trophy size={40} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-amber-400 tracking-tight">VICTORY! FLAWLESS!</h2>
            <p className="text-slate-300 text-sm font-semibold">Kamu berhasil menaklukkan seluruh musuh dan menjadi Juara Informatika Kombat!</p>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase">Total Skor Diperoleh</p>
              <p className="text-4xl font-black text-amber-400 tabular-nums">{score} Poin</p>
            </div>
            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setGameState('title')}
                className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 font-bold rounded-2xl transition-all"
              >
                Menu Utama
              </button>
              <button 
                onClick={() => setGameState('charsel')}
                className="flex-1 py-4 bg-gradient-to-r from-brand to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-2xl shadow-lg transition-all"
              >
                Main Lagi
              </button>
            </div>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="text-center space-y-6 animate-in zoom-in-95 duration-500 bg-slate-900/90 p-10 rounded-3xl border border-rose-500/50 shadow-2xl max-w-lg w-full">
            <div className="w-20 h-20 bg-rose-500/20 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-rose-500/40">
              <RotateCcw size={40} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-rose-500 tracking-tight">GAME OVER</h2>
            <p className="text-slate-300 text-sm font-semibold">Pertarungan yang hebat, namun musuh lebih kuat kali ini. Coba susun strategi logika lagi!</p>
            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setGameState('title')}
                className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 font-bold rounded-2xl transition-all"
              >
                Menu Utama
              </button>
              <button 
                onClick={() => setGameState('charsel')}
                className="flex-1 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-black rounded-2xl shadow-lg transition-all"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
