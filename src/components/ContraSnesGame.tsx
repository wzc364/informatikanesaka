import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  RotateCcw,
  Maximize,
  Minimize,
  X,
  Volume2,
  VolumeX,
  Shield,
  AlertTriangle,
  Heart,
} from 'lucide-react';
import { cn } from '../utils';
import { COURSES } from '../constants';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const MAX_HP = 6;

type WeaponType = 'N' | 'S' | 'L' | 'F' | 'M';

interface QuizQuestionItem {
  id: number;
  topicTitle: string;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

interface ContraSnesGameProps {
  isAdmin: boolean;
  currentStudent?: { id: string; nama: string; kelas: string; nis: string } | null;
  studentStageHighScores?: Record<number, number>;
  onClose: () => void;
}

const WEAPON_INFO: Record<WeaponType, { code: string; name: string; color: string; badgeBg: string; desc: string }> = {
  N: { code: 'N', name: 'Rifle Standar', color: '#facc15', badgeBg: 'bg-slate-700 text-amber-300 border-slate-500', desc: 'Tembakan standar cepat' },
  S: { code: 'S', name: 'Spread Gun (5-Arah)', color: '#ef4444', badgeBg: 'bg-red-600 text-white border-red-300', desc: '5 peluru menyebar luas ala Contra!' },
  L: { code: 'L', name: 'Cyber Laser Beam', color: '#38bdf8', badgeBg: 'bg-sky-600 text-white border-sky-300', desc: 'Sinar laser cepat berdaya tembus tinggi' },
  F: { code: 'F', name: 'Fireball Wave', color: '#f97316', badgeBg: 'bg-orange-600 text-white border-orange-300', desc: 'Bola api berputar penghancur baja' },
  M: { code: 'M', name: 'Heavy Machine Gun', color: '#a855f7', badgeBg: 'bg-purple-600 text-white border-purple-300', desc: 'Tembakan super cepat beruntun' },
};

const FALLBACK_INFORMATIKA_QUIZ: QuizQuestionItem[] = [
  {
    id: 1,
    topicTitle: 'Informatika Dasar',
    question: 'Komponen utama komputer yang bertugas memproses instruksi program disebut?',
    options: ['RAM', 'CPU (Processor)', 'Harddisk', 'Monitor'],
    correctIdx: 1,
    explanation: 'CPU (Central Processing Unit) adalah otak komputer yang memproses instruksi.',
  },
  {
    id: 2,
    topicTitle: 'Berpikir Komputasional',
    question: 'Memecah masalah kompleks menjadi bagian-bagian kecil yang lebih mudah dikelola disebut?',
    options: ['Abstraksi', 'Dekomposisi', 'Pengenalan Pola', 'Algoritma'],
    correctIdx: 1,
    explanation: 'Dekomposisi membagi masalah besar menjadi sub-masalah kecil.',
  },
  {
    id: 3,
    topicTitle: 'Algoritma',
    question: 'Urutan langkah-langkah logis yang sistematis untuk menyelesaikan suatu masalah disebut?',
    options: ['Algoritma', 'Hardware', 'Browser', 'Spreadsheet'],
    correctIdx: 0,
    explanation: 'Algoritma adalah rangkaian langkah logis dan terurut untuk menyelesaikan masalah.',
  },
  {
    id: 4,
    topicTitle: 'Sistem Komputer',
    question: 'Manakah yang termasuk perangkat lunak (software) sistem operasi?',
    options: ['Printer', 'Keyboard', 'Linux / Windows', 'Flashdisk'],
    correctIdx: 2,
    explanation: 'Windows dan Linux merupakan sistem operasi (perangkat lunak sistem).',
  },
  {
    id: 5,
    topicTitle: 'Jaringan & Keamanan',
    question: 'Bilangan biner dalam sistem komputer hanya terdiri dari dua angka, yaitu?',
    options: ['1 dan 2', '0 dan 1', '0 dan 9', '1 dan 10'],
    correctIdx: 1,
    explanation: 'Sistem biner menggunakan basis 2, yaitu digit 0 dan 1.',
  },
];

function collectInformatikaQuizzes(materiId: string): QuizQuestionItem[] {
  const list: QuizQuestionItem[] = [];
  let counter = 1;
  const targetCourses = materiId === 'all' ? COURSES : COURSES.filter(c => c.id === materiId);
  const sources = targetCourses.length > 0 ? targetCourses : COURSES;

  sources.forEach(course => {
    course.topics.forEach(topic => {
      if (Array.isArray(topic.quiz)) {
        topic.quiz.forEach(q => {
          if (q.question && Array.isArray(q.options) && q.options.length >= 2) {
            list.push({
              id: counter++,
              topicTitle: `${course.title} • ${topic.title}`,
              question: q.question,
              options: q.options.slice(0, 4),
              correctIdx: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
              explanation: q.explanation || 'Benar! Pengetahuan Informatika kamu mantap.',
            });
          }
        });
      }
    });
  });

  return list.length > 0 ? list : FALLBACK_INFORMATIKA_QUIZ;
}

// Retro 16-bit SNES WebAudio Synthesizer + Action BGM Sequencer (zero external assets)
class SnesAudioSynth {
  private ctx: AudioContext | null = null;
  private bgmTimer: number | null = null;
  private bgmGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private bgmStep = 0;
  private bgmBossMode = false;
  private bgmStage: 1 | 2 | 3 = 1;
  private bgmDucked = false;
  public muted = false;

  private ensureCtx() {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.ctx && !this.bgmGain) {
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = this.bgmDucked ? 0.2 : 0.75;
      this.bgmGain.connect(this.ctx.destination);
    }
    if (this.ctx && !this.noiseBuffer) {
      const len = Math.floor(this.ctx.sampleRate * 0.12);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buf;
    }
    return this.ctx;
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
    if (mute) {
      this.stopBgm();
    }
  }

  public setBgmDucked(ducked: boolean) {
    this.bgmDucked = ducked;
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setTargetAtTime(ducked ? 0.18 : 0.75, this.ctx.currentTime, 0.05);
    }
  }

  public setBgmMode(stage: 1 | 2 | 3, bossMode: boolean) {
    this.bgmStage = stage;
    this.bgmBossMode = bossMode;
  }

  private playBgmVoice(freq: number, dur: number, type: OscillatorType, vol: number) {
    if (!this.ctx || !this.bgmGain || this.muted || freq <= 0) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(vol, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0008, now + dur);
    osc.connect(g);
    g.connect(this.bgmGain);
    osc.start(now);
    osc.stop(now + dur + 0.01);
  }

  private playDrum(kind: 'kick' | 'snare' | 'hat') {
    if (!this.ctx || !this.bgmGain || this.muted) return;
    const now = this.ctx.currentTime;
    if (kind === 'kick') {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(145, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.09);
      g.gain.setValueAtTime(0.075, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(g);
      g.connect(this.bgmGain);
      osc.start(now);
      osc.stop(now + 0.11);
      return;
    }

    if (!this.noiseBuffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = kind === 'snare' ? 1100 : 4500;
    const g = this.ctx.createGain();
    const dur = kind === 'snare' ? 0.085 : 0.03;
    g.gain.setValueAtTime(kind === 'snare' ? 0.042 : 0.018, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.bgmGain);
    src.start(now);
    src.stop(now + dur + 0.01);
  }

  public startBgm(stage: 1 | 2 | 3 = 1) {
    this.bgmStage = stage;
    this.bgmBossMode = false;
    this.stopBgm();
    if (this.muted || typeof window === 'undefined') return;
    const ctx = this.ensureCtx();
    if (!ctx) return;

    // Heroic 16-bit SNES Action Riff (64 steps, 16th-note pulse)
    // Frequencies in Hz (0 = rest)
    const stage1Lead = [
      329.63, 0, 392.0, 440.0, 493.88, 0, 440.0, 392.0, 329.63, 0, 293.66, 329.63, 392.0, 0, 329.63, 0,
      261.63, 0, 329.63, 392.0, 440.0, 0, 392.0, 329.63, 293.66, 0, 329.63, 392.0, 440.0, 0, 493.88, 0,
      523.25, 0, 493.88, 440.0, 392.0, 0, 440.0, 493.88, 659.25, 0, 587.33, 523.25, 493.88, 0, 440.0, 0,
      392.0, 440.0, 493.88, 0, 587.33, 0, 493.88, 440.0, 392.0, 0, 329.63, 293.66, 329.63, 0, 246.94, 0,
    ];
    const stage2Lead = [
      369.99, 0, 440.0, 493.88, 554.37, 0, 493.88, 440.0, 369.99, 0, 329.63, 369.99, 440.0, 0, 369.99, 0,
      293.66, 0, 369.99, 440.0, 493.88, 0, 440.0, 369.99, 329.63, 0, 369.99, 440.0, 493.88, 0, 554.37, 0,
      587.33, 0, 554.37, 493.88, 440.0, 0, 493.88, 554.37, 739.99, 0, 659.25, 587.33, 554.37, 0, 493.88, 0,
      440.0, 493.88, 554.37, 0, 659.25, 0, 554.37, 493.88, 440.0, 0, 369.99, 329.63, 369.99, 0, 277.18, 0,
    ];
    const bossLead = [
      329.63, 349.23, 392.0, 0, 329.63, 349.23, 440.0, 0, 493.88, 440.0, 392.0, 349.23, 329.63, 0, 293.66, 0,
      329.63, 349.23, 392.0, 0, 523.25, 493.88, 440.0, 0, 587.33, 523.25, 493.88, 440.0, 659.25, 0, 493.88, 0,
    ];

    const stage1Bass = [
      82.41, 164.81, 82.41, 164.81, 82.41, 164.81, 82.41, 164.81,
      82.41, 164.81, 82.41, 164.81, 98.0, 196.0, 82.41, 164.81,
      65.41, 130.81, 65.41, 130.81, 65.41, 130.81, 65.41, 130.81,
      73.42, 146.83, 73.42, 146.83, 98.0, 196.0, 110.0, 220.0,
      65.41, 130.81, 65.41, 130.81, 98.0, 196.0, 98.0, 196.0,
      110.0, 220.0, 110.0, 220.0, 98.0, 196.0, 110.0, 220.0,
      98.0, 196.0, 98.0, 196.0, 110.0, 220.0, 110.0, 220.0,
      123.47, 246.94, 123.47, 246.94, 82.41, 164.81, 123.47, 82.41,
    ];

    this.bgmStep = 0;
    this.bgmTimer = window.setInterval(() => {
      if (this.muted) return;
      const c = this.ensureCtx();
      if (!c) return;

      const step = this.bgmStep;
      const leadArr = this.bgmBossMode
        ? bossLead
        : this.bgmStage === 2
        ? stage2Lead
        : stage1Lead;
      const leadFreq = leadArr[step % leadArr.length];
      const bassRaw = stage1Bass[step % stage1Bass.length];
      const bassFreq = this.bgmStage === 2 ? bassRaw * 1.122 : this.bgmStage === 3 ? bassRaw * 0.943 : bassRaw;

      // Driving Bassline
      this.playBgmVoice(bassFreq, 0.11, 'sawtooth', 0.028);

      // Lead Synth Melody
      if (leadFreq > 0) {
        const finalLead = this.bgmStage === 3 && !this.bgmBossMode ? leadFreq * 0.943 : leadFreq;
        this.playBgmVoice(finalLead, 0.16, 'square', 0.024);
      }

      // 16-bit Percussion Pattern
      const beatStep = step % 16;
      if (beatStep === 0 || beatStep === 6 || beatStep === 8 || (this.bgmBossMode && beatStep === 14)) {
        this.playDrum('kick');
      }
      if (beatStep === 4 || beatStep === 12) {
        this.playDrum('snare');
      }
      if (step % 2 === 1) {
        this.playDrum('hat');
      }

      this.bgmStep = (this.bgmStep + 1) % 64;
    }, 115);
  }

  public stopBgm() {
    if (this.bgmTimer !== null) {
      window.clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  playTone(freq: number, endFreq: number, duration: number, type: OscillatorType = 'square', gainVal = 0.06) {
    try {
      const ctx = this.ensureCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (endFreq !== freq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), ctx.currentTime + duration);
      }
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }

  shoot(weapon: WeaponType) {
    if (weapon === 'L') this.playTone(980, 260, 0.09, 'sawtooth', 0.05);
    else if (weapon === 'S') this.playTone(540, 160, 0.08, 'square', 0.055);
    else if (weapon === 'F') this.playTone(420, 120, 0.1, 'triangle', 0.07);
    else this.playTone(680, 200, 0.06, 'square', 0.045);
  }

  jump() {
    this.playTone(220, 520, 0.11, 'square', 0.05);
  }

  explosion() {
    this.playTone(150, 42, 0.22, 'sawtooth', 0.08);
  }

  powerupPrompt() {
    this.playTone(523, 784, 0.12, 'triangle', 0.07);
  }

  unlockWeapon() {
    this.playTone(523, 523, 0.08, 'square', 0.06);
    setTimeout(() => this.playTone(659, 659, 0.08, 'square', 0.06), 70);
    setTimeout(() => this.playTone(784, 1046, 0.16, 'square', 0.07), 140);
  }

  wrongQuiz() {
    this.playTone(240, 110, 0.25, 'sawtooth', 0.06);
  }

  playerHit() {
    this.playTone(300, 75, 0.25, 'sawtooth', 0.08);
  }

  healHp() {
    this.playTone(440, 660, 0.09, 'triangle', 0.07);
    setTimeout(() => this.playTone(660, 880, 0.14, 'triangle', 0.07), 80);
  }

  victory() {
    this.stopBgm();
    const notes = [523, 659, 784, 1046];
    notes.forEach((n, idx) => {
      setTimeout(() => this.playTone(n, n, 0.14, 'square', 0.06), idx * 110);
    });
  }
}

interface StageTheme {
  name: string;
  subtitle: string;
  skyTop: string;
  skyBottom: string;
  mountainFar: string;
  mountainNear: string;
  groundTop: string;
  groundFill: string;
  platformColor: string;
  accentGlow: string;
  worldWidth: number;
}

const STAGE_THEMES: Record<1 | 2 | 3, StageTheme> = {
  1: {
    name: 'Cyber Jungle Bridge',
    subtitle: 'Jembatan Hutan Malam & Pos Depan',
    skyTop: '#070b1e',
    skyBottom: '#162544',
    mountainFar: '#0f1c38',
    mountainNear: '#122c34',
    groundTop: '#22c55e',
    groundFill: '#3b2416',
    platformColor: '#94a3b8',
    accentGlow: '#38bdf8',
    worldWidth: 4200,
  },
  2: {
    name: 'Neo-Waterfall Base',
    subtitle: 'Air Terjun Listrik & Tebing Baja',
    skyTop: '#0b1026',
    skyBottom: '#1e1b4b',
    mountainFar: '#1e293b',
    mountainNear: '#0e3a5c',
    groundTop: '#38bdf8',
    groundFill: '#1e293b',
    platformColor: '#cbd5e1',
    accentGlow: '#f59e0b',
    worldWidth: 4600,
  },
  3: {
    name: 'Alien Reactor Fortress',
    subtitle: 'Benteng Reaktor Dalam & Inti Cyber',
    skyTop: '#160512',
    skyBottom: '#3b0722',
    mountainFar: '#2c0a1d',
    mountainNear: '#450a20',
    groundTop: '#f43f5e',
    groundFill: '#27272a',
    platformColor: '#a1a1aa',
    accentGlow: '#f43f5e',
    worldWidth: 5000,
  },
};

export default function ContraSnesGame({
  isAdmin,
  currentStudent,
  studentStageHighScores = {},
  onClose,
}: ContraSnesGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<SnesAudioSynth>(new SnesAudioSynth());

  const [materiId, setMateriId] = useState<string>('all');
  const [gameState, setGameState] = useState<'start' | 'playing' | 'win' | 'gameover'>('start');
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(1);
  const [completedStages, setCompletedStages] = useState<number[]>([]);

  // HUD state synced for crisp React overlays
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(4);
  const [weapon, setWeapon] = useState<WeaponType>('N');
  const [ammoBag, setAmmoBag] = useState<Record<WeaponType, number>>({ N: 999, S: 0, L: 0, F: 0, M: 0 });
  const [shieldFrames, setShieldFrames] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const [bossBanner, setBossBanner] = useState(false);
  const [bossHpInfo, setBossHpInfo] = useState<{ hp: number; maxHp: number } | null>(null);
  const [muted, setMuted] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [scanlinesEnabled, setScanlinesEnabled] = useState(false);

  // Special Weapon Informatika Quiz Challenge State
  const [pendingWeaponQuiz, setPendingWeaponQuiz] = useState<{
    suggestedWeapon: WeaponType;
    quiz: QuizQuestionItem;
    capsuleId: number;
  } | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{
    isCorrect: boolean;
    msg: string;
    awaitingItemPick?: boolean;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const usedQuizIdsRef = useRef<Set<number>>(new Set());

  // Load config from Firestore game_configs/contra-snes
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'game_configs', 'contra-snes'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as any;
          if (data.materiId) setMateriId(data.materiId);
        }
      },
      (err) => console.error('contra-snes config error:', err)
    );
    return () => unsub();
  }, []);

  // Load completed stages for student
  useEffect(() => {
    if (!currentStudent) return;
    const unsub = onSnapshot(
      doc(db, 'student_progress', currentStudent.id),
      (snap) => {
        if (snap.exists()) {
          setCompletedStages(snap.data().contraCompletedStages || []);
        }
      },
      (err) => console.error('contra-snes progress error:', err)
    );
    return () => unsub();
  }, [currentStudent]);

  useEffect(() => {
    const checkTouch = () => {
      const coarse = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : false;
      const hasTouch = typeof window !== 'undefined' && ('ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0);
      setIsTouchDevice(coarse || hasTouch);
    };
    checkTouch();
    const onFirstTouch = () => setIsTouchDevice(true);
    const onFullscreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    window.addEventListener('touchstart', onFirstTouch, { passive: true, once: true });
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      window.removeEventListener('touchstart', onFirstTouch);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  const quizPool = useMemo(() => collectInformatikaQuizzes(materiId), [materiId]);

  const pickNextInformatikaQuiz = (): QuizQuestionItem => {
    const unused = quizPool.filter(q => !usedQuizIdsRef.current.has(q.id));
    const pool = unused.length > 0 ? unused : quizPool;
    if (unused.length === 0) usedQuizIdsRef.current.clear();
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    usedQuizIdsRef.current.add(chosen.id);
    return chosen;
  };

  // Input ref (Keyboard + Touch)
  const keysRef = useRef({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    shoot: false,
  });
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

  const setControlState = (control: 'left' | 'right' | 'up' | 'down' | 'jump' | 'shoot', active: boolean) => {
    const prev = keysRef.current[control];
    keysRef.current[control] = active;
    if (control === 'left') {
      if (active && !prev) inputMetaRef.current.lastHoriz = 'left';
      else if (!active && inputMetaRef.current.lastHoriz === 'left') {
        inputMetaRef.current.lastHoriz = keysRef.current.right ? 'right' : null;
      }
    } else if (control === 'right') {
      if (active && !prev) inputMetaRef.current.lastHoriz = 'right';
      else if (!active && inputMetaRef.current.lastHoriz === 'right') {
        inputMetaRef.current.lastHoriz = keysRef.current.left ? 'left' : null;
      }
    } else if (control === 'jump') {
      if (active && !prev) inputMetaRef.current.jumpBufferFrames = 10;
    } else if (control === 'shoot') {
      if (active && !prev) inputMetaRef.current.shootBufferFrames = 7;
    }
  };

  const resetAllInputs = () => {
    keysRef.current = { left: false, right: false, up: false, down: false, jump: false, shoot: false };
    inputMetaRef.current = { lastHoriz: null, jumpBufferFrames: 0, shootBufferFrames: 0, coyoteFrames: 0 };
  };

  // Mutable Engine Ref
  const engineRef = useRef<any>(null);

  const createStageData = (stageNum: 1 | 2 | 3) => {
    const theme = STAGE_THEMES[stageNum];
    const wWidth = theme.worldWidth;

    // Ground segments + bridge gaps + elevated steel platforms (authentic Contra level flow!)
    const platforms: Array<{ x: number; y: number; w: number; h: number; kind: 'ground' | 'bridge' | 'steel' | 'water' }> = [];

    // Generate continuous scenic chunks with bridges, pits/water, and 2-tier ledges
    let cursor = 0;
    const bossArenaX = wWidth - 820;

    platforms.push({ x: 0, y: 380, w: 620, h: 80, kind: 'ground' });
    cursor = 620;

    let chunkIdx = 0;
    while (cursor < bossArenaX - 240) {
      chunkIdx++;
      if (chunkIdx % 3 === 1) {
        // Suspension Bridge over water hazard!
        platforms.push({ x: cursor, y: 392, w: 320, h: 68, kind: 'water' });
        platforms.push({ x: cursor + 15, y: 350, w: 290, h: 16, kind: 'bridge' });
        platforms.push({ x: cursor + 90, y: 245, w: 140, h: 14, kind: 'steel' });
        cursor += 320;
      } else if (chunkIdx % 3 === 2) {
        // Multi-tier catwalk + ground
        platforms.push({ x: cursor, y: 380, w: 460, h: 80, kind: 'ground' });
        platforms.push({ x: cursor + 70, y: 285, w: 150, h: 14, kind: 'steel' });
        platforms.push({ x: cursor + 240, y: 210, w: 160, h: 14, kind: 'steel' });
        cursor += 460;
      } else {
        // Pit with stepping platforms
        platforms.push({ x: cursor, y: 380, w: 140, h: 80, kind: 'ground' });
        platforms.push({ x: cursor + 140, y: 405, w: 140, h: 55, kind: 'water' });
        platforms.push({ x: cursor + 155, y: 300, w: 110, h: 14, kind: 'steel' });
        platforms.push({ x: cursor + 280, y: 380, w: 240, h: 80, kind: 'ground' });
        platforms.push({ x: cursor + 330, y: 260, w: 130, h: 14, kind: 'steel' });
        cursor += 520;
      }
    }

    // Solid boss arena floor + flanking tactical ledges
    platforms.push({ x: cursor, y: 380, w: wWidth - cursor, h: 80, kind: 'ground' });
    platforms.push({ x: wWidth - 650, y: 275, w: 130, h: 14, kind: 'steel' });
    platforms.push({ x: wWidth - 490, y: 215, w: 110, h: 14, kind: 'steel' });

    // Enemies
    const enemies: Array<{
      id: number;
      type: 'trooper' | 'turret' | 'drone';
      x: number;
      y: number;
      w: number;
      h: number;
      vx: number;
      vy: number;
      hp: number;
      shootCd: number;
      baseY: number;
      phase: number;
    }> = [];

    let eid = 1;
    for (let x = 520; x < wWidth - 950; x += 260 - stageNum * 25) {
      const roll = eid % 3;
      if (roll === 0) {
        // Wall/Floor Turret
        enemies.push({
          id: eid++,
          type: 'turret',
          x,
          y: 344,
          w: 34,
          h: 36,
          vx: 0,
          vy: 0,
          hp: 2 + stageNum,
          shootCd: 65 + (eid % 40),
          baseY: 344,
          phase: 0,
        });
      } else if (roll === 1) {
        // Flying Cyber Attack Helicopter
        const yPos = 140 + ((eid * 37) % 120);
        enemies.push({
          id: eid++,
          type: 'drone',
          x,
          y: yPos,
          w: 50,
          h: 28,
          vx: -(1.4 + stageNum * 0.25),
          vy: 0,
          hp: 1 + Math.floor(stageNum / 2),
          shootCd: 75 + (eid % 35),
          baseY: yPos,
          phase: eid * 0.8,
        });
      } else {
        // Trooper Soldier
        enemies.push({
          id: eid++,
          type: 'trooper',
          x,
          y: 330,
          w: 28,
          h: 48,
          vx: -(1.5 + stageNum * 0.2),
          vy: 0,
          hp: 1,
          shootCd: 85 + (eid % 45),
          baseY: 330,
          phase: 0,
        });
      }
    }

    // Sky-drop crate triggers along the stage (Kotak Peluru Spesial & +HP jatuh dari langit!)
    const weaponSequence: WeaponType[] = ['S', 'L', 'F', 'M', 'S', 'L'];
    const skyDropTriggers: Array<{
      id: number;
      triggerX: number;
      spawned: boolean;
      kind: 'weapon' | 'hp';
      reward: WeaponType;
    }> = [];

    for (let i = 0; i < 8; i++) {
      const tx = 210 + i * Math.floor((wWidth - 1100) / 8);
      const isHpCrate = i === 2 || i === 5 || i === 7;
      skyDropTriggers.push({
        id: i + 1,
        triggerX: tx,
        spawned: false,
        kind: isHpCrate ? 'hp' : 'weapon',
        reward: weaponSequence[i % weaponSequence.length],
      });
    }

    const bossMaxHp = 28 + stageNum * 12;

    return {
      theme,
      worldWidth: wWidth,
      bossArenaX,
      platforms,
      enemies,
      skyDropTriggers,
      droppedCapsules: [] as Array<{
        id: number;
        kind: 'weapon' | 'hp';
        x: number;
        baseX: number;
        y: number;
        vy: number;
        onParachute: boolean;
        landed: boolean;
        reward: WeaponType;
        ttl: number;
        swayPhase: number;
      }>,
      player: {
        x: 90,
        y: 300,
        w: 32,
        h: 52,
        vx: 0,
        vy: 0,
        isGrounded: false,
        isProne: false,
        facing: 1 as 1 | -1,
        aimX: 1,
        aimY: 0,
        weapon: 'N' as WeaponType,
        ammoBag: { N: 999, S: 0, L: 0, F: 0, M: 0 } as Record<WeaponType, number>,
        invulFrames: 90,
        shieldFrames: 0,
        shootCd: 0,
        muzzleTick: 0,
        animTick: 0,
      },
      playerBullets: [] as Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        type: WeaponType;
        dmg: number;
        life: number;
        wavePhase: number;
      }>,
      enemyBullets: [] as Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        r: number;
      }>,
      explosions: [] as Array<{ x: number; y: number; r: number; maxR: number; life: number; maxLife: number; color: string }>,
      particles: [] as Array<{ x: number; y: number; vx: number; vy: number; size: number; life: number; maxLife: number; color: string }>,
      floatingTexts: [] as Array<{ x: number; y: number; text: string; color: string; life: number }>,
      boss: {
        active: false,
        defeated: false,
        x: wWidth - 165,
        y: 110,
        w: 155,
        h: 270,
        hp: bossMaxHp,
        maxHp: bossMaxHp,
        turretTopHp: 8 + stageNum * 3,
        turretTopMaxHp: 8 + stageNum * 3,
        turretBotHp: 8 + stageNum * 3,
        turretBotMaxHp: 8 + stageNum * 3,
        attackTick: 0,
        hurtFlash: 0,
        podDropTick: 0,
      },
      cameraX: 0,
      shakeFrames: 0,
      frame: 0,
      score: 0,
      lives: 4,
      nextCapsuleId: 100,
    };
  };

  const saveScoreToFirebase = async (finalScore: number, stageWon: number) => {
    if (finalScore <= 0) return;
    try {
      const durationSec = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));
      const studentId = isAdmin ? 'admin-preview' : (currentStudent?.id || 'guest');
      const stageLabel = `Informatika War - Stage ${stageWon}`;
      const docId = `${studentId}__contra-snes__stage-${stageWon}`;

      // Keep highest score only
      const existingHigh = studentStageHighScores?.[stageWon] || 0;
      if (isAdmin || finalScore >= existingHigh) {
        await setDoc(doc(db, 'game_scores', docId), {
          gameId: 'contra-snes',
          gameTitle: stageLabel,
          studentId,
          studentName: isAdmin ? 'Admin (Pratinjau)' : (currentStudent?.nama || 'Siswa'),
          studentKelas: isAdmin ? 'Admin' : (currentStudent?.kelas || '-'),
          studentNis: isAdmin ? '-' : (currentStudent?.nis || '-'),
          score: Math.max(finalScore, existingHigh),
          durationSec,
          playedAt: new Date().toISOString(),
        });
      }

      if (!isAdmin && currentStudent) {
        const nextCompleted = Array.from(new Set([...completedStages, stageWon]));
        await setDoc(
          doc(db, 'student_progress', currentStudent.id),
          { contraCompletedStages: nextCompleted },
          { merge: true }
        );
      }
    } catch (err) {
      console.error('Failed saving contra score:', err);
    }
  };

  // Cleanup BGM on unmount
  useEffect(() => {
    const synth = audioRef.current;
    return () => {
      synth.stopBgm();
    };
  }, []);

  // Sync BGM playback & quiz ducking with game state
  useEffect(() => {
    const synth = audioRef.current;
    if (gameState === 'playing') {
      synth.setBgmDucked(!!pendingWeaponQuiz);
    } else {
      synth.stopBgm();
    }
  }, [gameState, pendingWeaponQuiz]);

  const startStage = (stageNum: 1 | 2 | 3) => {
    setCurrentStage(stageNum);
    const engine = createStageData(stageNum);
    engineRef.current = engine;
    startTimeRef.current = Date.now();
    usedQuizIdsRef.current.clear();

    setScore(0);
    setLives(4);
    setWeapon('N');
    setAmmoBag({ N: 999, S: 0, L: 0, F: 0, M: 0 });
    setShieldFrames(0);
    setProgressPct(0);
    setBossBanner(false);
    setBossHpInfo(null);
    setPendingWeaponQuiz(null);
    setQuizFeedback(null);
    setGameState('playing');
    audioRef.current.setBgmDucked(false);
    audioRef.current.startBgm(stageNum);
  };

  const selectActiveWeapon = (wType: WeaponType) => {
    const eng = engineRef.current;
    if (!eng) return;
    if (wType !== 'N' && (eng.player.ammoBag[wType] || 0) <= 0) return;
    eng.player.weapon = wType;
    setWeapon(wType);
  };

  // Keyboard bindings (Tombol loncat Panah Atas / ArrowUp, angka 1-5 pilih senjata)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (pendingWeaponQuiz || gameState !== 'playing') return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) return;
      const code = e.code;
      const key = e.key;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(code) || ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(key)) {
        e.preventDefault();
        if (document.activeElement instanceof HTMLButtonElement) {
          document.activeElement.blur();
        }
      }
      if (code === 'ArrowLeft' || code === 'KeyA' || key === 'ArrowLeft' || key === 'a' || key === 'A') setControlState('left', true);
      if (code === 'ArrowRight' || code === 'KeyD' || key === 'ArrowRight' || key === 'd' || key === 'D') setControlState('right', true);
      if (code === 'KeyW' || key === 'w' || key === 'W') setControlState('up', true);
      if (code === 'ArrowDown' || code === 'KeyS' || key === 'ArrowDown' || key === 's' || key === 'S') setControlState('down', true);
      if ((code === 'ArrowUp' || key === 'ArrowUp') && !e.repeat) setControlState('jump', true);
      else if (code === 'ArrowUp' || key === 'ArrowUp') keysRef.current.jump = true;
      if (code === 'KeyJ' || code === 'KeyZ' || code === 'Enter' || key === 'j' || key === 'J' || key === 'z' || key === 'Z') setControlState('shoot', true);
      if (code === 'Digit1') selectActiveWeapon('N');
      if (code === 'Digit2') selectActiveWeapon('S');
      if (code === 'Digit3') selectActiveWeapon('L');
      if (code === 'Digit4') selectActiveWeapon('F');
      if (code === 'Digit5') selectActiveWeapon('M');
    };

    const up = (e: KeyboardEvent) => {
      const code = e.code;
      const key = e.key;
      if (code === 'ArrowLeft' || code === 'KeyA' || key === 'ArrowLeft' || key === 'a' || key === 'A') setControlState('left', false);
      if (code === 'ArrowRight' || code === 'KeyD' || key === 'ArrowRight' || key === 'd' || key === 'D') setControlState('right', false);
      if (code === 'KeyW' || key === 'w' || key === 'W') setControlState('up', false);
      if (code === 'ArrowDown' || code === 'KeyS' || key === 'ArrowDown' || key === 's' || key === 'S') setControlState('down', false);
      if (code === 'ArrowUp' || key === 'ArrowUp') setControlState('jump', false);
      if (code === 'KeyJ' || code === 'KeyZ' || code === 'Enter' || key === 'j' || key === 'J' || key === 'z' || key === 'Z') setControlState('shoot', false);
    };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', resetAllInputs);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', resetAllInputs);
    };
  }, [gameState, pendingWeaponQuiz]);

  // Quiz answer handler -> unlocks Item Picker when answered correctly!
  const handleAnswerWeaponQuiz = (selectedIdx: number) => {
    if (!pendingWeaponQuiz || quizFeedback) return;
    const isCorrect = selectedIdx === pendingWeaponQuiz.quiz.correctIdx;

    if (isCorrect) {
      audioRef.current.unlockWeapon();
      const eng = engineRef.current;
      if (eng) {
        eng.score += 150;
        setScore(eng.score);
      }
      setQuizFeedback({
        isCorrect: true,
        msg: '✅ BENAR! (+150 Poin) — Silakan PILIH ITEM hadiah yang ingin kamu pakai:',
        awaitingItemPick: true,
      });
    } else {
      audioRef.current.wrongQuiz();
      setQuizFeedback({
        isCorrect: false,
        msg: `❌ Salah! Jawaban benar: ${String.fromCharCode(65 + pendingWeaponQuiz.quiz.correctIdx)}. ${pendingWeaponQuiz.quiz.explanation}`,
        awaitingItemPick: false,
      });
    }
  };

  const handlePickRewardItem = (choice: WeaponType | 'HP' | 'SHIELD') => {
    const eng = engineRef.current;
    if (eng) {
      if (choice === 'HP') {
        audioRef.current.healHp();
        if (eng.lives < MAX_HP) {
          eng.lives += 1;
          setLives(eng.lives);
        } else {
          eng.score += 100;
          setScore(eng.score);
        }
      } else if (choice === 'SHIELD') {
        audioRef.current.unlockWeapon();
        eng.player.shieldFrames = 480; // 8 sec barrier
        setShieldFrames(480);
      } else {
        audioRef.current.unlockWeapon();
        const addAmmo = choice === 'M' ? 75 : 45;
        eng.player.ammoBag[choice] = (eng.player.ammoBag[choice] || 0) + addAmmo;
        eng.player.weapon = choice;
        setAmmoBag({ ...eng.player.ammoBag });
        setWeapon(choice);
      }
      eng.player.invulFrames = Math.max(eng.player.invulFrames, 85);
    }
    setPendingWeaponQuiz(null);
    setQuizFeedback(null);
    keysRef.current = { left: false, right: false, up: false, down: false, jump: false, shoot: false };
  };

  const resumeAfterQuiz = () => {
    setPendingWeaponQuiz(null);
    setQuizFeedback(null);
    keysRef.current = { left: false, right: false, up: false, down: false, jump: false, shoot: false };
    if (engineRef.current) {
      engineRef.current.player.invulFrames = Math.max(engineRef.current.player.invulFrames, 75);
    }
  };

  // Main SNES 60FPS Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;

    const spawnExplosion = (eng: any, x: number, y: number, maxR = 26, color = '#fb923c') => {
      eng.explosions.push({ x, y, r: 4, maxR, life: 20, maxLife: 20, color });
      const sparkCount = maxR > 30 ? 14 : 8;
      for (let s = 0; s < sparkCount; s++) {
        const ang = (Math.PI * 2 * s) / sparkCount + (Math.random() - 0.5) * 0.4;
        const spd = 1.6 + Math.random() * 3.6;
        eng.particles.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 0.8,
          size: 2 + Math.random() * 2.5,
          life: 16 + Math.floor(Math.random() * 10),
          maxLife: 26,
          color: s % 2 === 0 ? '#fef08a' : color,
        });
      }
    };

    const spawnFloatingText = (eng: any, x: number, y: number, text: string, color = '#fde047') => {
      eng.floatingTexts.push({ x, y, text, color, life: 42 });
    };

    const damagePlayer = (eng: any) => {
      const p = eng.player;
      if (p.invulFrames > 0 || p.shieldFrames > 0) return;
      audioRef.current.playerHit();
      eng.shakeFrames = 14;
      spawnExplosion(eng, p.x + p.w / 2, p.y + p.h / 2, 32, '#ef4444');
      eng.lives -= 1;
      setLives(eng.lives);
      // Switch back to Rifle Standar if hit (unlocked ammo stays safely in ammoBag so player can re-choose!)
      p.weapon = 'N';
      setWeapon('N');

      if (eng.lives <= 0) {
        setGameState('gameover');
        saveScoreToFirebase(eng.score, currentStage);
        return;
      }

      // Safe respawn on nearest ground behind camera/player
      p.invulFrames = 140;
      p.vy = -6;
      if (p.y > 410) {
        const safePlat = eng.platforms.find((pl: any) => pl.kind === 'ground' && pl.x + pl.w > eng.cameraX + 40);
        p.x = Math.max(eng.cameraX + 60, safePlat ? safePlat.x + 40 : eng.cameraX + 80);
        p.y = 260;
      }
    };

    const firePlayerWeapon = (eng: any) => {
      const p = eng.player;
      const wType: WeaponType = p.weapon;
      audioRef.current.shoot(wType);
      p.muzzleTick = 5;

      // Compute 8-way unit aim direction
      let ax = p.aimX;
      let ay = p.aimY;
      const len = Math.hypot(ax, ay) || 1;
      ax /= len;
      ay /= len;

      const gunX = p.x + p.w / 2 + ax * 18;
      const gunY = (p.isProne ? p.y + 34 : p.y + 18) + ay * 14;

      if (wType === 'S') {
        // 5-way Spread Gun!
        const baseAngle = Math.atan2(ay, ax);
        const offsets = [-0.34, -0.17, 0, 0.17, 0.34];
        offsets.forEach(off => {
          const ang = baseAngle + off;
          eng.playerBullets.push({
            x: gunX,
            y: gunY,
            vx: Math.cos(ang) * 11,
            vy: Math.sin(ang) * 11,
            type: 'S',
            dmg: 1,
            life: 72,
            wavePhase: 0,
          });
        });
        p.shootCd = 16;
      } else if (wType === 'L') {
        // High-speed Piercing Laser!
        eng.playerBullets.push({
          x: gunX,
          y: gunY,
          vx: ax * 16,
          vy: ay * 16,
          type: 'L',
          dmg: 3,
          life: 65,
          wavePhase: 0,
        });
        p.shootCd = 13;
      } else if (wType === 'F') {
        // Spinning Fireball Wave!
        eng.playerBullets.push({
          x: gunX,
          y: gunY,
          vx: ax * 8.5,
          vy: ay * 8.5,
          type: 'F',
          dmg: 2,
          life: 85,
          wavePhase: eng.frame * 0.2,
        });
        p.shootCd = 15;
      } else if (wType === 'M') {
        // Rapid Machine Gun!
        eng.playerBullets.push({
          x: gunX,
          y: gunY,
          vx: ax * 13,
          vy: ay * 13,
          type: 'M',
          dmg: 1.5,
          life: 70,
          wavePhase: 0,
        });
        p.shootCd = 6;
      } else {
        // Standard Rifle
        eng.playerBullets.push({
          x: gunX,
          y: gunY,
          vx: ax * 11,
          vy: ay * 11,
          type: 'N',
          dmg: 1,
          life: 68,
          wavePhase: 0,
        });
        p.shootCd = 11;
      }

      if (wType !== 'N') {
        p.ammoBag[wType] = Math.max(0, (p.ammoBag[wType] || 0) - 1);
        setAmmoBag({ ...p.ammoBag });
        if (p.ammoBag[wType] <= 0) {
          p.weapon = 'N';
          setWeapon('N');
        }
      }
    };

    const drawPixelPlayer = (p: any, frame: number) => {
      if (p.invulFrames > 0 && Math.floor(frame / 3) % 2 === 0) return;

      const px = Math.round(p.x);
      const py = Math.round(p.y);
      const gunGlowColor = WEAPON_INFO[p.weapon as WeaponType].color;

      ctx.save();
      // Ground shadow when grounded
      if (p.isGrounded) {
        ctx.fillStyle = 'rgba(0,0,0,0.48)';
        ctx.beginPath();
        ctx.ellipse(px + p.w / 2, py + p.h + 1, p.isProne ? 23 : 15, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Subtle 8-way glowing laser sight line for clear aiming feedback
      if (p.isGrounded || p.aimY !== 0) {
        const lenAim = Math.hypot(p.aimX, p.aimY) || 1;
        const uax = p.aimX / lenAim;
        const uay = p.aimY / lenAim;
        const muzzleStartX = px + p.w / 2 + uax * 22;
        const muzzleStartY = (p.isProne ? py + 37 : py + 19) + uay * 16;
        const sightGrad = ctx.createLinearGradient(
          muzzleStartX,
          muzzleStartY,
          muzzleStartX + uax * 72,
          muzzleStartY + uay * 72
        );
        sightGrad.addColorStop(0, `${gunGlowColor}88`);
        sightGrad.addColorStop(1, `${gunGlowColor}00`);
        ctx.strokeStyle = sightGrad;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(muzzleStartX, muzzleStartY);
        ctx.lineTo(muzzleStartX + uax * 72, muzzleStartY + uay * 72);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Rotating Hex Barrier aura if shield active
      if (p.shieldFrames > 0) {
        const pulseR = 34 + Math.sin(frame * 0.25) * 2.5;
        ctx.strokeStyle = frame % 8 < 4 ? '#38bdf8' : '#fde047';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(px + p.w / 2, py + p.h / 2, pulseR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
        ctx.fill();
        for (let orb = 0; orb < 3; orb++) {
          const oa = frame * 0.12 + (orb * Math.PI * 2) / 3;
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(px + p.w / 2 + Math.cos(oa) * pulseR, py + p.h / 2 + Math.sin(oa) * pulseR, 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (p.isProne && p.isGrounded) {
        // Prone (Tiarap) Remastered Commando pose with armor plates, bandolier & scope
        const flip = p.facing === -1;
        ctx.translate(px + p.w / 2, py + p.h);
        if (flip) ctx.scale(-1, 1);

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#020617';

        // Legs, Knee Pads & Tactical Boots
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(-25, -13, 25, 10);
        ctx.strokeRect(-25, -13, 25, 10);
        ctx.fillStyle = '#475569';
        ctx.fillRect(-15, -13, 5, 5);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-30, -12, 9, 9);
        ctx.strokeRect(-30, -12, 9, 9);

        // Armored Torso + Shoulder Pauldron
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(-2, -16, 18, 13);
        ctx.strokeRect(-2, -16, 18, 13);
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(2, -15, 11, 5);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(4, -16, 3, 12);

        // Head + Double Red Headband Ribbon
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(11, -25, 13, 12);
        ctx.strokeRect(11, -25, 13, 12);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(20, -20, 3, 3);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(10, -26, 15, 5);
        ctx.strokeRect(10, -26, 15, 5);
        const tailW = Math.sin(frame * 0.3) * 2;
        ctx.fillRect(1, -25 + tailW * 0.3, 9, 2.5);
        ctx.fillRect(3, -22 - tailW * 0.25, 7, 2);

        // Heavy Vented Pulse Rifle + Scope + Glow Cell
        ctx.fillStyle = '#334155';
        ctx.fillRect(12, -14, 19, 6);
        ctx.strokeRect(12, -14, 19, 6);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(17, -17, 8, 3);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(25, -13, 12, 3);
        ctx.fillStyle = gunGlowColor;
        ctx.fillRect(16, -12, 7, 2);

        if (p.muzzleTick > 0) {
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(39, -11.5, 6.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return;
      }

      if (!p.isGrounded) {
        // Classic Contra Mid-Air Somersault Spin with crisp double motion arc
        ctx.translate(px + p.w / 2, py + p.h / 2);
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 1.35);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 26, Math.PI * 0.3, Math.PI * 1.1);
        ctx.stroke();

        ctx.rotate((frame * 0.36) * p.facing);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#020617';
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(-10, -11, 20, 20);
        ctx.strokeRect(-10, -11, 20, 20);
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(-6, -9, 12, 8);
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(-7, -19, 14, 10);
        ctx.strokeRect(-7, -19, 14, 10);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-8, -19, 16, 4);
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(-11, 5, 9, 12);
        ctx.fillRect(2, 5, 9, 12);
        ctx.restore();
        return;
      }

      // Standing / Running Remastered SNES Commando
      ctx.translate(px + p.w / 2, py + p.h);
      if (p.facing === -1) ctx.scale(-1, 1);

      const legSwing = Math.abs(p.vx) > 0.2 ? Math.sin(p.animTick * 0.48) * 9 : 0;
      const bodyBob = Math.abs(p.vx) > 0.2 ? Math.abs(Math.cos(p.animTick * 0.48)) * 2 : 0;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#020617';

      // Back Leg, Knee Pad & Boot
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(-9 + legSwing, -21, 8, 14);
      ctx.strokeRect(-9 + legSwing, -21, 8, 14);
      ctx.fillStyle = '#475569';
      ctx.fillRect(-7 + legSwing, -16, 6, 4);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-10 + legSwing, -8, 11, 8);
      ctx.strokeRect(-10 + legSwing, -8, 11, 8);

      // Front Leg, Knee Pad & Boot
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(1 - legSwing, -21, 8, 14);
      ctx.strokeRect(1 - legSwing, -21, 8, 14);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(3 - legSwing, -16, 6, 4);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0 - legSwing, -8, 11, 8);
      ctx.strokeRect(0 - legSwing, -8, 11, 8);

      // Tactical Utility Belt & Cyber Armor Torso
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-10, -24 - bodyBob, 20, 4);
      ctx.strokeRect(-10, -24 - bodyBob, 20, 4);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(1, -24 - bodyBob, 5, 4);

      ctx.fillStyle = '#2563eb';
      ctx.fillRect(-11, -41 - bodyBob, 22, 18);
      ctx.strokeRect(-11, -41 - bodyBob, 22, 18);
      // Chest armor plate highlight
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(-7, -39 - bodyBob, 14, 9);
      ctx.fillStyle = '#93c5fd';
      ctx.fillRect(-5, -38 - bodyBob, 9, 4);
      // Diagonal Gold Ammo Bandolier Strap
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-9, -40 - bodyBob);
      ctx.lineTo(8, -25 - bodyBob);
      ctx.stroke();
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 1.5;
      // Shoulder Pauldron
      ctx.fillStyle = '#1e40af';
      ctx.fillRect(-13, -42 - bodyBob, 7, 8);
      ctx.strokeRect(-13, -42 - bodyBob, 7, 8);

      // Muscular Arm + Detailed Scoped Aiming Rifle
      ctx.save();
      ctx.translate(2, -34 - bodyBob);
      const localAimAngle = Math.atan2(p.aimY, Math.abs(p.aimX));
      ctx.rotate(localAimAngle);
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(-3, -3, 10, 6);
      ctx.strokeRect(-3, -3, 10, 6);
      // Rifle chassis & optical scope
      ctx.fillStyle = '#334155';
      ctx.fillRect(5, -4.5, 20, 7);
      ctx.strokeRect(5, -4.5, 20, 7);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(10, -7.5, 9, 3);
      ctx.strokeRect(10, -7.5, 9, 3);
      // Barrel & Weapon Energy Core
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(23, -3, 11, 3.5);
      ctx.fillStyle = gunGlowColor;
      ctx.fillRect(10, -2, 9, 2.5);
      if (p.muzzleTick > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(36, -1.5, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = gunGlowColor;
        ctx.beginPath();
        ctx.arc(37, -1.5, 3.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Head + Iconic Double-Tail Red Headband
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(-7, -53 - bodyBob, 14, 12);
      ctx.strokeRect(-7, -53 - bodyBob, 14, 12);
      // Determined eye + brow
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(2, -49 - bodyBob, 3.5, 3.5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2, -49 - bodyBob, 1.5, 1.5);
      // Red headband + twin flowing tails
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-8, -54 - bodyBob, 16, 4.5);
      ctx.strokeRect(-8, -54 - bodyBob, 16, 4.5);
      const tailWave = Math.sin(frame * 0.32) * 3;
      ctx.fillRect(-17, -53 - bodyBob + tailWave * 0.35, 9, 3);
      ctx.fillRect(-21, -51 - bodyBob + tailWave * 0.65, 6, 2.5);
      ctx.fillRect(-15, -49 - bodyBob - tailWave * 0.3, 8, 2);

      ctx.restore();
    };

    const drawStageBackground = (eng: any) => {
      const theme: StageTheme = eng.theme;
      const camX = eng.cameraX;

      // Sky gradient with rich atmospheric horizon
      const grad = ctx.createLinearGradient(0, 0, 0, 450);
      grad.addColorStop(0, theme.skyTop);
      grad.addColorStop(0.68, theme.skyBottom);
      grad.addColorStop(1, currentStage === 3 ? '#500724' : '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 450);

      // Twinkling Pixel Stars
      for (let i = 0; i < 54; i++) {
        const sx = ((i * 97) - camX * 0.06) % 800;
        const fx = sx < 0 ? sx + 800 : sx;
        const sy = (i * 47) % 210;
        const twinkle = 0.45 + 0.55 * Math.abs(Math.sin(eng.frame * 0.04 + i));
        ctx.fillStyle = `rgba(255,255,255,${twinkle.toFixed(2)})`;
        const sz = i % 4 === 0 ? 2.5 : 1.5;
        ctx.fillRect(Math.floor(fx), sy, sz, sz);
      }

      // Occasional Shooting Star streaking across night sky
      const meteorCycle = eng.frame % 360;
      if (meteorCycle < 28) {
        const mx = 520 - meteorCycle * 11;
        const my = 24 + meteorCycle * 4.2;
        const mGrad = ctx.createLinearGradient(mx, my, mx + 36, my - 14);
        mGrad.addColorStop(0, 'rgba(255,255,255,0.95)');
        mGrad.addColorStop(1, 'rgba(56,189,248,0)');
        ctx.strokeStyle = mGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(mx + 36, my - 14);
        ctx.stroke();
      }

      // Giant Luminous Ringed Cyber Moon / Planet with Halo & Craters
      const moonX = 635 - (camX * 0.03) % 180;
      const haloGrad = ctx.createRadialGradient(moonX, 90, 18, moonX, 90, 98);
      haloGrad.addColorStop(0, currentStage === 3 ? 'rgba(244,63,94,0.45)' : 'rgba(56,189,248,0.35)');
      haloGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(moonX, 90, 98, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = currentStage === 3 ? '#fb7185' : '#bae6fd';
      ctx.beginPath();
      ctx.arc(moonX, 90, 39, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = currentStage === 3 ? 'rgba(136,19,55,0.28)' : 'rgba(14,116,144,0.22)';
      ctx.beginPath();
      ctx.arc(moonX - 12, 82, 9, 0, Math.PI * 2);
      ctx.arc(moonX + 14, 100, 7, 0, Math.PI * 2);
      ctx.arc(moonX + 4, 70, 5, 0, Math.PI * 2);
      ctx.fill();
      // Planetary Ring
      ctx.save();
      ctx.translate(moonX, 90);
      ctx.rotate(-0.24);
      ctx.strokeStyle = currentStage === 3 ? 'rgba(253, 164, 175, 0.45)' : 'rgba(125, 211, 252, 0.42)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, 62, 11, 0, -0.2, Math.PI + 0.2);
      ctx.stroke();
      ctx.restore();

      // Drifting Layered Twilight Clouds
      for (let c = 0; c < 4; c++) {
        const cx = (((c * 240) - camX * 0.08 - eng.frame * 0.18) % 960 + 960) % 960 - 120;
        const cy = 62 + (c % 2) * 38;
        ctx.fillStyle = currentStage === 3 ? 'rgba(244, 63, 94, 0.12)' : 'rgba(148, 163, 184, 0.13)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 62, 12, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 28, cy - 6, 40, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sweeping Searchlight Beams (Stage 1 & 2 military base atmosphere)
      if (currentStage !== 3) {
        const sweep = Math.sin(eng.frame * 0.025) * 0.35;
        ctx.save();
        ctx.translate(220 - ((camX * 0.15) % 400), 380);
        ctx.rotate(sweep);
        ctx.fillStyle = 'rgba(186, 230, 253, 0.065)';
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(-92, -390);
        ctx.lineTo(92, -390);
        ctx.lineTo(10, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Parallax Mountains (Far Ridge + Secondary Rim-Lit Ridge)
      ctx.fillStyle = theme.mountainFar;
      for (let x = -((camX * 0.16) % 240); x < 860; x += 240) {
        ctx.beginPath();
        ctx.moveTo(x, 385);
        ctx.lineTo(x + 85, 182);
        ctx.lineTo(x + 155, 250);
        ctx.lineTo(x + 205, 206);
        ctx.lineTo(x + 250, 385);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = currentStage === 3 ? '#3b0a22' : '#0f2338';
      for (let x = -((camX * 0.25) % 210); x < 860; x += 210) {
        ctx.beginPath();
        ctx.moveTo(x, 385);
        ctx.lineTo(x + 65, 240);
        ctx.lineTo(x + 130, 285);
        ctx.lineTo(x + 185, 248);
        ctx.lineTo(x + 225, 385);
        ctx.closePath();
        ctx.fill();
      }

      // Midground Stage-Specific Architecture / Scenery
      for (let x = -((camX * 0.42) % 220); x < 860; x += 220) {
        if (currentStage === 1) {
          // Stage 1: Cyber Jungle Palm Canopy, Ancient Ruins & Rotating Radar Watchtower
          ctx.fillStyle = '#0d292a';
          ctx.fillRect(x + 26, 225, 32, 165);
          ctx.fillStyle = '#113a36';
          ctx.beginPath();
          ctx.arc(x + 42, 218, 36, 0, Math.PI * 2);
          ctx.arc(x + 16, 236, 24, 0, Math.PI * 2);
          ctx.arc(x + 68, 236, 24, 0, Math.PI * 2);
          ctx.fill();
          // Distant Steel Bunker Tower + Rotating Radar Dish + Blinking Beacon
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x + 135, 255, 42, 135);
          ctx.fillStyle = '#334155';
          ctx.fillRect(x + 132, 255, 48, 8);
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2;
          const dishTilt = Math.sin(eng.frame * 0.04) * 5;
          ctx.beginPath();
          ctx.arc(x + 156, 244, 10, Math.PI + dishTilt * 0.05, Math.PI * 2 + dishTilt * 0.05);
          ctx.stroke();
          ctx.fillStyle = eng.frame % 32 < 16 ? '#38bdf8' : '#ef4444';
          ctx.fillRect(x + 153, 242, 5, 5);
          // Glowing Jungle Fireflies
          const fy = 260 + Math.sin(eng.frame * 0.07 + x) * 20;
          ctx.fillStyle = 'rgba(163, 230, 53, 0.7)';
          ctx.fillRect(x + 92 + Math.cos(eng.frame * 0.05) * 8, fy, 3, 3);
        } else if (currentStage === 2) {
          // Stage 2: Metallic Dam Cliffs, Riveted Conduits & Animated Roaring Waterfalls
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x + 12, 195, 58, 195);
          ctx.fillStyle = '#334155';
          ctx.fillRect(x + 16, 200, 50, 6);
          ctx.fillRect(x + 18, 260, 46, 5);
          ctx.fillStyle = eng.frame % 26 < 13 ? '#f59e0b' : '#38bdf8';
          ctx.fillRect(x + 36, 215, 10, 6);
          // Roaring Waterfall
          ctx.fillStyle = 'rgba(14, 165, 233, 0.36)';
          ctx.fillRect(x + 115, 160, 60, 230);
          ctx.fillStyle = 'rgba(224, 242, 254, 0.58)';
          const offset = (eng.frame * 6) % 40;
          for (let y = 160 + offset; y < 380; y += 40) {
            ctx.fillRect(x + 122, y, 12, 20);
            ctx.fillRect(x + 144, y - 14, 10, 18);
            ctx.fillRect(x + 162, y - 6, 8, 16);
          }
          // Foam mist & splash droplets at base
          ctx.fillStyle = 'rgba(224, 242, 254, 0.48)';
          ctx.beginPath();
          ctx.ellipse(x + 145, 382, 36, 8 + Math.sin(eng.frame * 0.25) * 2.5, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Stage 3: Biomechanical Alien Reactor Pipes, Plasma Valves & Rising Embers
          ctx.fillStyle = '#271222';
          ctx.fillRect(x + 20, 185, 44, 205);
          ctx.fillRect(x + 135, 225, 36, 165);
          ctx.fillStyle = '#4c0519';
          ctx.fillRect(x + 24, 205, 36, 12);
          ctx.fillRect(x + 24, 265, 36, 12);
          ctx.fillStyle = eng.frame % 20 < 10 ? '#f43f5e' : '#fb923c';
          ctx.fillRect(x + 34, 234, 16, 10);
          ctx.fillRect(x + 145, 252, 16, 6);
          const emberY = 380 - ((eng.frame * 2.5 + x) % 210);
          ctx.fillStyle = 'rgba(251, 146, 60, 0.72)';
          ctx.fillRect(x + 95, emberY, 4, 4);
          ctx.fillRect(x + 115, (emberY + 75) % 380, 3, 3);
        }
      }
    };

    const drawPlatforms = (eng: any) => {
      const theme: StageTheme = eng.theme;
      eng.platforms.forEach((pl: any) => {
        if (pl.x + pl.w < eng.cameraX - 40 || pl.x > eng.cameraX + 840) return;

        if (pl.kind === 'water') {
          const waterGrad = ctx.createLinearGradient(0, pl.y, 0, pl.y + pl.h);
          waterGrad.addColorStop(0, currentStage === 3 ? '#dc2626' : '#0284c7');
          waterGrad.addColorStop(1, currentStage === 3 ? '#450a0a' : '#082f49');
          ctx.fillStyle = waterGrad;
          ctx.fillRect(pl.x, pl.y, pl.w, pl.h);

          // Animated dual wave foam crests
          ctx.fillStyle = currentStage === 3 ? '#fca5a5' : '#bae6fd';
          const waveShift = (eng.frame * 2) % 28;
          for (let wx = pl.x + waveShift; wx < pl.x + pl.w - 14; wx += 28) {
            ctx.fillRect(wx, pl.y + 3, 16, 4);
            ctx.fillRect(wx + 8, pl.y + 11, 10, 2);
          }
        } else if (pl.kind === 'bridge') {
          // Remastered Contra SNES Suspension Bridge with catenary cables, hanger ropes & steel towers!
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(pl.x, pl.y + 6, pl.w, 12);
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2;
          for (let bx = pl.x; bx < pl.x + pl.w - 16; bx += 24) {
            ctx.beginPath();
            ctx.moveTo(bx, pl.y + 6);
            ctx.lineTo(bx + 12, pl.y + 18);
            ctx.lineTo(bx + 24, pl.y + 6);
            ctx.stroke();
          }
          // Overhead curved catenary suspension cable + vertical hanger ropes
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(pl.x, pl.y - 34);
          ctx.quadraticCurveTo(pl.x + pl.w / 2, pl.y - 4, pl.x + pl.w, pl.y - 34);
          ctx.stroke();
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
          ctx.lineWidth = 1.2;
          for (let rx = pl.x + 24; rx < pl.x + pl.w - 16; rx += 28) {
            const t = (rx - pl.x) / pl.w;
            const cableY = (1 - t) * (1 - t) * (pl.y - 34) + 2 * (1 - t) * t * (pl.y - 4) + t * t * (pl.y - 34);
            ctx.beginPath();
            ctx.moveTo(rx, cableY);
            ctx.lineTo(rx, pl.y);
            ctx.stroke();
          }

          // Tall steel anchor towers + warning beacons
          ctx.fillStyle = '#475569';
          ctx.fillRect(pl.x - 5, pl.y - 38, 10, 56);
          ctx.fillRect(pl.x + pl.w - 5, pl.y - 38, 10, 56);
          ctx.fillStyle = eng.frame % 24 < 12 ? '#ef4444' : '#fde047';
          ctx.fillRect(pl.x - 2, pl.y - 42, 4, 4);
          ctx.fillRect(pl.x + pl.w - 2, pl.y - 42, 4, 4);

          // Riveted Deck Planks
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(pl.x, pl.y, pl.w, 7);
          ctx.fillStyle = '#fde68a';
          ctx.fillRect(pl.x, pl.y, pl.w, 2);
          ctx.fillStyle = '#78350f';
          for (let px = pl.x + 18; px < pl.x + pl.w; px += 22) {
            ctx.fillRect(px, pl.y, 2, 7);
          }
          ctx.strokeStyle = '#020617';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(pl.x, pl.y, pl.w, 7);
        } else if (pl.kind === 'steel') {
          // Crisp Industrial Steel Catwalk with I-Beam, truss bracing & glowing trim
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.2;
          for (let sx = pl.x + 6; sx < pl.x + pl.w - 14; sx += 22) {
            ctx.beginPath();
            ctx.moveTo(sx, pl.y + 4);
            ctx.lineTo(sx + 10, pl.y + pl.h - 2);
            ctx.stroke();
          }
          ctx.fillStyle = theme.platformColor;
          ctx.fillRect(pl.x, pl.y, pl.w, 5);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(pl.x, pl.y, pl.w, 1.5);
          ctx.fillStyle = theme.accentGlow;
          for (let sx = pl.x + 10; sx < pl.x + pl.w - 10; sx += 28) {
            ctx.fillRect(sx, pl.y + 7, 10, 4);
          }
          ctx.strokeStyle = '#020617';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(pl.x, pl.y, pl.w, pl.h);
        } else {
          // Solid Ground Strata with crisp top trim, grass/moss tufts & masonry
          ctx.fillStyle = theme.groundFill;
          ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
          ctx.fillStyle = theme.groundTop;
          ctx.fillRect(pl.x, pl.y, pl.w, 11);
          ctx.fillStyle = 'rgba(255,255,255,0.34)';
          ctx.fillRect(pl.x, pl.y, pl.w, 2.5);
          // Surface detail tufts / rivets
          ctx.fillStyle = theme.groundTop;
          for (let tx = pl.x + 12; tx < pl.x + pl.w - 12; tx += 36) {
            ctx.fillRect(tx, pl.y - 3, 5, 3);
            ctx.fillRect(tx + 7, pl.y - 2, 3, 2);
          }
          ctx.fillStyle = 'rgba(0,0,0,0.32)';
          for (let gx = pl.x; gx < pl.x + pl.w; gx += 32) {
            ctx.fillRect(gx, pl.y + 12, 2, pl.h - 12);
            ctx.fillRect(gx, pl.y + 28, 30, 2);
            ctx.fillRect(gx + 16, pl.y + 44, 2, pl.h - 44);
          }
          ctx.strokeStyle = '#020617';
          ctx.lineWidth = 2;
          ctx.strokeRect(pl.x, pl.y, pl.w, pl.h);
        }
      });
    };

    const STEP_MS = 1000 / 60;
    let lastTime = performance.now();
    let accumulator = 0;

    const stepPhysics = (eng: any) => {
      eng.frame += 1;
      const p = eng.player;
      const k = keysRef.current;
      const meta = inputMetaRef.current;

      if (meta.jumpBufferFrames > 0) meta.jumpBufferFrames -= 1;
      if (meta.shootBufferFrames > 0) meta.shootBufferFrames -= 1;
      if (p.isGrounded) meta.coyoteFrames = 7;
      else if (meta.coyoteFrames > 0) meta.coyoteFrames -= 1;

      // Movement & 8-way Aim (supports key-rollover)
      let moveDir = 0;
      if (k.left && k.right) {
        moveDir = meta.lastHoriz === 'left' ? -1 : 1;
      } else if (k.right) {
        moveDir = 1;
      } else if (k.left) {
        moveDir = -1;
      }
      p.vx = moveDir * 3.8;
      if (moveDir !== 0) {
        p.facing = moveDir as 1 | -1;
        p.animTick += 1;
      }

      p.isProne = p.isGrounded && k.down && moveDir === 0;

      // 8-direction aiming logic (Contra style!)
      if (k.up && moveDir !== 0) {
        p.aimX = moveDir;
        p.aimY = -1;
      } else if (k.up && moveDir === 0) {
        p.aimX = 0;
        p.aimY = -1;
      } else if (k.down && !p.isGrounded && moveDir !== 0) {
        p.aimX = moveDir;
        p.aimY = 1;
      } else if (k.down && !p.isGrounded && moveDir === 0) {
        p.aimX = 0;
        p.aimY = 1;
      } else {
        p.aimX = p.facing;
        p.aimY = 0;
      }

      // Jump with input buffer & coyote time (or drop down from elevated steel platform with down+jump)
      if ((k.jump || meta.jumpBufferFrames > 0) && (p.isGrounded || meta.coyoteFrames > 0)) {
        meta.jumpBufferFrames = 0;
        meta.coyoteFrames = 0;
        if (k.down && p.y < 320 && p.isGrounded) {
          p.y += 18;
          p.isGrounded = false;
        } else {
          p.vy = -11.4;
          p.isGrounded = false;
          audioRef.current.jump();
        }
      }

      // Gravity & Position
      p.vy = Math.min(11, p.vy + 0.52);
        const prevBottom = p.y + p.h;
        p.x += p.vx;
        p.y += p.vy;

        // Clamp horizontal bounds inside camera / world
        const minX = eng.boss.active ? eng.bossArenaX + 10 : eng.cameraX + 10;
        const maxX = eng.boss.active ? eng.worldWidth - 210 : eng.worldWidth - p.w - 10;
        p.x = Math.max(minX, Math.min(maxX, p.x));

        // Platform Landing Collision
        p.isGrounded = false;
        if (p.vy >= 0) {
          for (const pl of eng.platforms) {
            if (pl.kind === 'water') continue;
            const overlapsX = p.x + p.w - 6 > pl.x && p.x + 6 < pl.x + pl.w;
            if (overlapsX && prevBottom <= pl.y + 12 && p.y + p.h >= pl.y) {
              p.y = pl.y - p.h;
              p.vy = 0;
              p.isGrounded = true;
              break;
            }
          }
        }

        // Water/Pit Death Check
        if (p.y > 418) {
          damagePlayer(eng);
        }

        // Invulnerability & Shield Timers
        if (p.invulFrames > 0) p.invulFrames -= 1;
        if (p.shieldFrames > 0) {
          p.shieldFrames -= 1;
          if (eng.frame % 15 === 0 || p.shieldFrames === 0) setShieldFrames(p.shieldFrames);
        }

        // Shooting & Muzzle Flash (with tap buffer so quick shots never drop)
        if (p.muzzleTick > 0) p.muzzleTick -= 1;
        if (p.shootCd > 0) p.shootCd -= 1;
        if ((k.shoot || meta.shootBufferFrames > 0) && p.shootCd <= 0) {
          meta.shootBufferFrames = 0;
          firePlayerWeapon(eng);
        }

        // Camera forward scroll (locks at Boss Arena)
        if (!eng.boss.active) {
          const targetCam = Math.max(eng.cameraX, p.x - 320);
          eng.cameraX = Math.min(eng.bossArenaX, targetCam);
          if (eng.cameraX >= eng.bossArenaX - 20) {
            eng.boss.active = true;
            audioRef.current.setBgmMode(currentStage, true);
            setBossBanner(true);
            setBossHpInfo({ hp: eng.boss.hp, maxHp: eng.boss.maxHp });
            setTimeout(() => setBossBanner(false), 2400);
          }
        }

        if (eng.frame % 12 === 0) {
          setProgressPct(Math.min(100, Math.round((p.x / (eng.worldWidth - 220)) * 100)));
        }

        // Helper: find safe X coordinate above non-water platform for sky supply drops
        const pickSafeSkyDropX = (preferredX: number) => {
          const minBound = Math.max(eng.cameraX + 85, eng.boss.active ? eng.bossArenaX + 60 : eng.cameraX + 85);
          const maxBound = Math.min(eng.worldWidth - 230, eng.cameraX + 700);
          const candidates = eng.platforms.filter(
            (pl: any) =>
              pl.kind !== 'water' &&
              pl.w >= 48 &&
              pl.x + pl.w - 24 >= minBound &&
              pl.x + 24 <= maxBound
          );
          if (candidates.length === 0) return Math.max(minBound, Math.min(maxBound, preferredX));

          let bestX = Math.max(minBound, Math.min(maxBound, preferredX));
          let bestDist = Infinity;
          candidates.forEach((pl: any) => {
            const clamped = Math.max(
              Math.max(minBound, pl.x + 26),
              Math.min(Math.min(maxBound, pl.x + pl.w - 26), preferredX)
            );
            const d = Math.abs(clamped - preferredX);
            if (d < bestDist) {
              bestDist = d;
              bestX = clamped;
            }
          });
          return bestX;
        };

        // Running dust particles when sprinting on ground
        if (p.isGrounded && Math.abs(p.vx) > 0.2 && eng.frame % 9 === 0) {
          eng.particles.push({
            x: p.x + (p.facing === 1 ? 6 : p.w - 6),
            y: p.y + p.h - 2,
            vx: -p.facing * (0.8 + Math.random() * 0.8),
            vy: -(0.4 + Math.random() * 0.7),
            size: 3,
            life: 12,
            maxLife: 12,
            color: 'rgba(203, 213, 225, 0.7)',
          });
        }

        // Trigger Sky Parachute Supply Crates ahead of player! (Semua kotak jatuh dari langit)
        eng.skyDropTriggers.forEach((trig: any) => {
          if (!trig.spawned && p.x >= trig.triggerX) {
            trig.spawned = true;
            const dropX = pickSafeSkyDropX(p.x + 230);
            eng.droppedCapsules.push({
              id: eng.nextCapsuleId++,
              kind: trig.kind,
              x: dropX,
              baseX: dropX,
              y: -32,
              vy: 1.45,
              onParachute: true,
              landed: false,
              reward: trig.reward,
              ttl: 780,
              swayPhase: eng.frame * 0.05 + trig.id,
            });
            spawnFloatingText(
              eng,
              dropX,
              54,
              trig.kind === 'hp' ? '🪂 MEDKIT +1 HP!' : '🪂 KOTAK PELURU!',
              trig.kind === 'hp' ? '#4ade80' : '#fde047'
            );
          }
        });

        // During boss fight, drop parachute supply crates from sky every ~8s (alternating weapon & +HP medkit)
        if (eng.boss.active && !eng.boss.defeated) {
          eng.boss.podDropTick += 1;
          if (eng.boss.podDropTick >= 480) {
            eng.boss.podDropTick = 0;
            const pool: WeaponType[] = ['S', 'L', 'F', 'M'];
            const chosenW = pool[Math.floor(Math.random() * pool.length)];
            const dropHp = eng.lives < MAX_HP && eng.nextCapsuleId % 2 === 0;
            const bossDropX = pickSafeSkyDropX(eng.bossArenaX + 120 + Math.random() * 340);
            eng.droppedCapsules.push({
              id: eng.nextCapsuleId++,
              kind: dropHp ? 'hp' : 'weapon',
              x: bossDropX,
              baseX: bossDropX,
              y: -32,
              vy: 1.45,
              onParachute: true,
              landed: false,
              reward: chosenW,
              ttl: 780,
              swayPhase: eng.frame * 0.05,
            });
            spawnFloatingText(
              eng,
              bossDropX,
              54,
              dropHp ? '🪂 BANTUAN +1 HP!' : '🪂 BANTUAN PELURU!',
              dropHp ? '#4ade80' : '#fde047'
            );
          }
        }

        // Player Bullets update & hit detection
        for (let i = eng.playerBullets.length - 1; i >= 0; i--) {
          const b = eng.playerBullets[i];
          b.x += b.vx;
          if (b.type === 'F') {
            b.y += b.vy + Math.sin(eng.frame * 0.4 + b.wavePhase) * 3.5;
          } else {
            b.y += b.vy;
          }
          b.life -= 1;

          if (b.life <= 0 || b.x < eng.cameraX - 30 || b.x > eng.cameraX + 840 || b.y < -30 || b.y > 470) {
            eng.playerBullets.splice(i, 1);
            continue;
          }

          let bulletConsumed = false;

          // Hit Enemies
          for (let j = eng.enemies.length - 1; j >= 0; j--) {
            const en = eng.enemies[j];
            if (b.x > en.x - 4 && b.x < en.x + en.w + 4 && b.y > en.y - 4 && b.y < en.y + en.h + 4) {
              en.hp -= b.dmg;
              if (en.hp <= 0) {
                audioRef.current.explosion();
                spawnExplosion(eng, en.x + en.w / 2, en.y + en.h / 2, 24, '#fb923c');
                eng.enemies.splice(j, 1);
                const pts = en.type === 'turret' ? 120 : 80;
                eng.score += pts;
                spawnFloatingText(eng, en.x + en.w / 2, en.y - 6, `+${pts}`, '#fde047');
                setScore(eng.score);
              }
              if (b.type !== 'L') {
                bulletConsumed = true;
                break;
              }
            }
          }
          if (bulletConsumed) {
            eng.playerBullets.splice(i, 1);
            continue;
          }

          // Hit Boss
          if (eng.boss.active && !eng.boss.defeated) {
            const boss = eng.boss;
            if (b.x > boss.x && b.x < boss.x + boss.w && b.y > boss.y && b.y < boss.y + boss.h) {
              // Top Turret hitbox
              if (boss.turretTopHp > 0 && b.y < boss.y + 80) {
                boss.turretTopHp -= b.dmg;
                if (boss.turretTopHp <= 0) {
                  audioRef.current.explosion();
                  eng.shakeFrames = 12;
                  spawnExplosion(eng, boss.x + 25, boss.y + 42, 34, '#f97316');
                  eng.score += 200;
                  spawnFloatingText(eng, boss.x + 20, boss.y + 20, '+200 TURRET!', '#38bdf8');
                }
              } else if (boss.turretBotHp > 0 && b.y > boss.y + 190) {
                boss.turretBotHp -= b.dmg;
                if (boss.turretBotHp <= 0) {
                  audioRef.current.explosion();
                  eng.shakeFrames = 12;
                  spawnExplosion(eng, boss.x + 25, boss.y + 225, 34, '#f97316');
                  eng.score += 200;
                  spawnFloatingText(eng, boss.x + 20, boss.y + 200, '+200 TURRET!', '#38bdf8');
                }
              } else {
                // Central Alien Core!
                boss.hp -= b.dmg;
                boss.hurtFlash = 5;
                eng.score += 20;
              }
              setScore(eng.score);
              setBossHpInfo({ hp: Math.max(0, Math.ceil(boss.hp)), maxHp: boss.maxHp });

              if (boss.hp <= 0 && !boss.defeated) {
                boss.defeated = true;
                eng.shakeFrames = 30;
                audioRef.current.victory();
                for (let kExp = 0; kExp < 10; kExp++) {
                  spawnExplosion(
                    eng,
                    boss.x + 25 + Math.random() * 100,
                    boss.y + 30 + Math.random() * 200,
                    44,
                    kExp % 2 === 0 ? '#facc15' : '#ef4444'
                  );
                }
                const stageBonus = 500 + currentStage * 200;
                eng.score += stageBonus;
                spawnFloatingText(eng, boss.x + 40, boss.y + 110, `+${stageBonus} BOSS CLEAR!`, '#4ade80');
                setScore(eng.score);
                saveScoreToFirebase(eng.score, currentStage);
                setTimeout(() => {
                  setGameState('win');
                }, 900);
              }

              eng.playerBullets.splice(i, 1);
            }
          }
        }

        // Update Enemies AI
        for (let j = eng.enemies.length - 1; j >= 0; j--) {
          const en = eng.enemies[j];
          if (en.x > eng.cameraX + 860) continue;
          if (en.x + en.w < eng.cameraX - 80) {
            eng.enemies.splice(j, 1);
            continue;
          }

          if (en.type === 'drone') {
            en.x += en.vx;
            en.y = en.baseY + Math.sin(eng.frame * 0.08 + en.phase) * 28;
          } else if (en.type === 'trooper') {
            en.x += en.vx;
          }

          // Enemy Shooting aimed at player
          en.shootCd -= 1;
          if (en.shootCd <= 0 && en.x < eng.cameraX + 780) {
            en.shootCd = en.type === 'turret' ? 95 - currentStage * 10 : 120 - currentStage * 10;
            const dx = (p.x + p.w / 2) - (en.x + en.w / 2);
            const dy = (p.y + p.h / 2) - (en.y + en.h / 2);
            const dist = Math.hypot(dx, dy) || 1;
            const spd = 3.6 + currentStage * 0.45;
            eng.enemyBullets.push({
              x: en.x + en.w / 2,
              y: en.y + en.h / 2,
              vx: (dx / dist) * spd,
              vy: (dy / dist) * spd,
              r: 5,
            });
          }

          // Contact Damage with Player
          const pHitY = p.isProne ? p.y + 26 : p.y + 6;
          const pHitH = p.isProne ? 26 : p.h - 8;
          if (
            p.x + 6 < en.x + en.w &&
            p.x + p.w - 6 > en.x &&
            pHitY < en.y + en.h &&
            pHitY + pHitH > en.y
          ) {
            damagePlayer(eng);
          }
        }

        // Update Boss AI
        if (eng.boss.active && !eng.boss.defeated) {
          const boss = eng.boss;
          if (boss.hurtFlash > 0) boss.hurtFlash -= 1;
          boss.attackTick += 1;

          // Turrets shoot every 75 frames
          if (boss.attackTick % (75 - currentStage * 8) === 0) {
            if (boss.turretTopHp > 0) {
              const dx = p.x - boss.x;
              const dy = (p.y + 20) - (boss.y + 42);
              const dist = Math.hypot(dx, dy) || 1;
              eng.enemyBullets.push({ x: boss.x, y: boss.y + 42, vx: (dx / dist) * 4.5, vy: (dy / dist) * 4.5, r: 6 });
            }
            if (boss.turretBotHp > 0) {
              const dx = p.x - boss.x;
              const dy = (p.y + 20) - (boss.y + 225);
              const dist = Math.hypot(dx, dy) || 1;
              eng.enemyBullets.push({ x: boss.x, y: boss.y + 225, vx: (dx / dist) * 4.5, vy: (dy / dist) * 4.5, r: 6 });
            }
          }

          // Central Reactor Core 3-way Spread Blast every 115 frames!
          if (boss.attackTick % (115 - currentStage * 10) === 0) {
            const angles = [-0.26, 0, 0.26];
            angles.forEach(a => {
              eng.enemyBullets.push({
                x: boss.x + 12,
                y: boss.y + 135,
                vx: -Math.cos(a) * (4.2 + currentStage * 0.4),
                vy: Math.sin(a) * 4.2,
                r: 7,
              });
            });
          }
        }

        // Update Enemy Bullets
        const pHitY = p.isProne ? p.y + 28 : p.y + 6;
        const pHitH = p.isProne ? 24 : p.h - 10;
        for (let i = eng.enemyBullets.length - 1; i >= 0; i--) {
          const eb = eng.enemyBullets[i];
          eb.x += eb.vx;
          eb.y += eb.vy;
          if (eb.x < eng.cameraX - 40 || eb.x > eng.cameraX + 860 || eb.y < -20 || eb.y > 470) {
            eng.enemyBullets.splice(i, 1);
            continue;
          }
          if (
            eb.x + eb.r > p.x + 6 &&
            eb.x - eb.r < p.x + p.w - 6 &&
            eb.y + eb.r > pHitY &&
            eb.y - eb.r < pHitY + pHitH
          ) {
            eng.enemyBullets.splice(i, 1);
            damagePlayer(eng);
          }
        }

        // Update Sky-Dropped Parachute Crates (+HP Medkit & Special Weapon Quiz Crate!)
        for (let i = eng.droppedCapsules.length - 1; i >= 0; i--) {
          const cap = eng.droppedCapsules[i];
          const prevCapBot = cap.y + 16;

          if (cap.onParachute) {
            cap.vy = 1.45;
            cap.x = cap.baseX + Math.sin(eng.frame * 0.055 + cap.swayPhase) * 14;
            cap.y += cap.vy;
          } else {
            cap.ttl -= 1;
          }

          // Land gently on non-water platform
          if (cap.onParachute) {
            for (const pl of eng.platforms) {
              if (pl.kind === 'water') continue;
              if (cap.x + 14 > pl.x && cap.x - 14 < pl.x + pl.w && prevCapBot <= pl.y + 12 && cap.y + 16 >= pl.y) {
                cap.y = pl.y - 16;
                cap.vy = 0;
                cap.onParachute = false;
                cap.landed = true;
                break;
              }
            }
          }

          if (cap.ttl <= 0 || cap.y > 465) {
            eng.droppedCapsules.splice(i, 1);
            continue;
          }

          // Pickup Collision with Player!
          if (
            Math.abs(cap.x - (p.x + p.w / 2)) < 30 &&
            Math.abs(cap.y - (p.y + p.h / 2)) < 36
          ) {
            eng.droppedCapsules.splice(i, 1);
            if (cap.kind === 'hp') {
              audioRef.current.healHp();
              if (eng.lives < MAX_HP) {
                eng.lives += 1;
                setLives(eng.lives);
                spawnFloatingText(eng, cap.x, cap.y - 16, '❤️ +1 HP!', '#4ade80');
              } else {
                eng.score += 100;
                setScore(eng.score);
                spawnFloatingText(eng, cap.x, cap.y - 16, '+100 HP PENUH!', '#4ade80');
              }
            } else {
              audioRef.current.powerupPrompt();
              const q = pickNextInformatikaQuiz();
              keysRef.current = { left: false, right: false, up: false, down: false, jump: false, shoot: false };
              setQuizFeedback(null);
              setPendingWeaponQuiz({
                suggestedWeapon: cap.reward,
                quiz: q,
                capsuleId: cap.id,
              });
              break;
            }
          }
        }

        // Update Explosions, Particles, Floating Texts & Shake
        if (eng.shakeFrames > 0) eng.shakeFrames -= 1;
        for (let i = eng.explosions.length - 1; i >= 0; i--) {
          const ex = eng.explosions[i];
          ex.r += (ex.maxR - ex.r) * 0.25;
          ex.life -= 1;
          if (ex.life <= 0) eng.explosions.splice(i, 1);
        }
        for (let i = eng.particles.length - 1; i >= 0; i--) {
          const pt = eng.particles[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.vy += 0.14;
          pt.life -= 1;
          if (pt.life <= 0) eng.particles.splice(i, 1);
        }
        for (let i = eng.floatingTexts.length - 1; i >= 0; i--) {
          const ft = eng.floatingTexts[i];
          ft.y -= 0.7;
          ft.life -= 1;
          if (ft.life <= 0) eng.floatingTexts.splice(i, 1);
        }
    };

    const tick = (now: number) => {
      const eng = engineRef.current;
      if (!eng) return;

      const dt = Math.min(50, Math.max(0, now - lastTime));
      lastTime = now;

      // Freeze physics while Informatika Weapon Quiz is open!
      if (!pendingWeaponQuiz) {
        accumulator += dt;
        let subSteps = 0;
        while (accumulator >= STEP_MS && subSteps < 3) {
          stepPhysics(eng);
          accumulator -= STEP_MS;
          subSteps += 1;
        }
        if (subSteps >= 3) accumulator = 0;
      }

      // ================= RENDER HIGH-CLARITY 2X DPR SCENE =================
      const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
      const targetW = Math.round(800 * dpr);
      const targetH = Math.round(450 * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;

      drawStageBackground(eng);

      ctx.save();
      const shakeX = eng.shakeFrames > 0 ? (Math.random() - 0.5) * 7 : 0;
      const shakeY = eng.shakeFrames > 0 ? (Math.random() - 0.5) * 5 : 0;
      ctx.translate(-Math.round(eng.cameraX) + shakeX, shakeY);

      drawPlatforms(eng);

      // Draw Detailed Boss Fortress Core with Piston Vents, Turret HP & Electric Overload Arcs
      if (eng.boss.active || eng.cameraX + 820 > eng.boss.x) {
        const b = eng.boss;
        // Main Armored Bulkhead
        ctx.fillStyle = b.hurtFlash > 0 ? '#fecaca' : '#334155';
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(b.x + 12, b.y + 12, b.w - 24, b.h - 24);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.strokeRect(b.x, b.y, b.w, b.h);

        // Animated Hydraulic Cooling Pistons & Vent Grilles
        const pistonShift = Math.sin(eng.frame * 0.16) * 4;
        ctx.fillStyle = '#475569';
        ctx.fillRect(b.x + 96, b.y + 72 + pistonShift, 22, 16);
        ctx.fillRect(b.x + 96, b.y + 182 - pistonShift, 22, 16);
        ctx.fillStyle = '#1e293b';
        for (let vy = b.y + 100; vy < b.y + 170; vy += 10) {
          ctx.fillRect(b.x + 98, vy, 22, 5);
        }

        // Industrial Hazard Stripes & Power Cables
        ctx.fillStyle = '#eab308';
        for (let hy = b.y + 84; hy < b.y + 185; hy += 18) {
          ctx.fillRect(b.x + 3, hy, 7, 9);
        }
        ctx.strokeStyle = eng.frame % 14 < 7 ? '#ef4444' : '#f97316';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(b.x + 42, b.y + 100);
        ctx.lineTo(b.x + 85, b.y + 50);
        ctx.moveTo(b.x + 42, b.y + 170);
        ctx.lineTo(b.x + 85, b.y + 220);
        ctx.stroke();

        // Top Turret + Mini HP bar
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#020617';
        ctx.fillStyle = b.turretTopHp > 0 ? '#dc2626' : '#1e293b';
        ctx.fillRect(b.x - 16, b.y + 26, 40, 30);
        ctx.strokeRect(b.x - 16, b.y + 26, 40, 30);
        if (b.turretTopHp > 0) {
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(b.x - 28, b.y + 37, 15, 8);
          ctx.strokeRect(b.x - 28, b.y + 37, 15, 8);
          ctx.fillStyle = '#facc15';
          ctx.fillRect(b.x + 4, b.y + 34, 8, 8);
          // Mini HP Bar
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(b.x - 14, b.y + 19, 36, 4);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(b.x - 14, b.y + 19, 36 * Math.max(0, b.turretTopHp / b.turretTopMaxHp), 4);
        }

        // Bottom Turret + Mini HP bar
        ctx.fillStyle = b.turretBotHp > 0 ? '#dc2626' : '#1e293b';
        ctx.fillRect(b.x - 16, b.y + 210, 40, 30);
        ctx.strokeRect(b.x - 16, b.y + 210, 40, 30);
        if (b.turretBotHp > 0) {
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(b.x - 28, b.y + 221, 15, 8);
          ctx.strokeRect(b.x - 28, b.y + 221, 15, 8);
          ctx.fillStyle = '#facc15';
          ctx.fillRect(b.x + 4, b.y + 218, 8, 8);
          // Mini HP Bar
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(b.x - 14, b.y + 203, 36, 4);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(b.x - 14, b.y + 203, 36 * Math.max(0, b.turretBotHp / b.turretBotMaxHp), 4);
        }

        // Central Pulsing Alien/Cyber Reactor Eye with Outer Energy Ring
        const pulse = Math.sin(eng.frame * 0.2) * 4;
        if (!b.defeated) {
          const coreGlow = ctx.createRadialGradient(b.x + 44, b.y + 135, 8, b.x + 44, b.y + 135, 62);
          coreGlow.addColorStop(0, 'rgba(239,68,68,0.68)');
          coreGlow.addColorStop(1, 'rgba(239,68,68,0)');
          ctx.fillStyle = coreGlow;
          ctx.beginPath();
          ctx.arc(b.x + 44, b.y + 135, 62, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = b.defeated ? '#0f172a' : (b.hurtFlash > 0 ? '#ffffff' : '#dc2626');
        ctx.beginPath();
        ctx.arc(b.x + 44, b.y + 135, 32 + pulse * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fca5a5';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        if (!b.defeated) {
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(b.x + 38, b.y + 135, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(b.x + 34, b.y + 131, 5, 0, Math.PI * 2);
          ctx.fill();

          // Crackling Electric Overload Arcs when Boss HP < 50%
          if (b.hp < b.maxHp * 0.5 && eng.frame % 6 < 4) {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(b.x + 22, b.y + 110);
            ctx.lineTo(b.x + 44 + (Math.random() - 0.5) * 26, b.y + 135);
            ctx.lineTo(b.x + 68, b.y + 160 + (Math.random() - 0.5) * 18);
            ctx.stroke();
          }
        }
      }

      // Draw Sky-Falling Parachute Supply Crates (+HP Medkit & Special Bullet Quiz Crate!)
      eng.droppedCapsules.forEach((cap: any) => {
        if (cap.landed && cap.ttl < 120 && Math.floor(eng.frame / 4) % 2 === 0) return;
        ctx.save();
        const isHp = cap.kind === 'hp';
        const crateColor = isHp ? '#22c55e' : '#f59e0b';

        // Billowing 5-Panel Parachute + 4 Cords while descending
        if (cap.onParachute) {
          const chuteY = cap.y - 36;
          // Shroud Cords
          ctx.strokeStyle = 'rgba(226, 232, 240, 0.85)';
          ctx.lineWidth = 1.2;
          [-20, -7, 7, 20].forEach(cxOff => {
            ctx.beginPath();
            ctx.moveTo(cap.x + cxOff, chuteY + 2);
            ctx.lineTo(cap.x + (cxOff > 0 ? 11 : -11), cap.y - 12);
            ctx.stroke();
          });

          // Parachute Dome Canopy
          ctx.fillStyle = isHp ? '#16a34a' : '#dc2626';
          ctx.beginPath();
          ctx.arc(cap.x, chuteY + 2, 23, Math.PI, 0);
          ctx.closePath();
          ctx.fill();
          // Bright center canopy panel
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.moveTo(cap.x, chuteY - 21);
          ctx.arc(cap.x, chuteY + 2, 23, -Math.PI * 0.65, -Math.PI * 0.35);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#020617';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(cap.x, chuteY + 2, 23, Math.PI, 0);
          ctx.closePath();
          ctx.stroke();
        }

        // Pulsing Crate Glow Aura
        ctx.fillStyle = isHp ? 'rgba(74, 222, 128, 0.25)' : 'rgba(250, 204, 21, 0.28)';
        ctx.beginPath();
        ctx.arc(cap.x, cap.y, 22 + Math.sin(eng.frame * 0.2) * 3, 0, Math.PI * 2);
        ctx.fill();

        // Armored Crate or Medical Medkit Box
        ctx.fillStyle = isHp ? '#f8fafc' : '#7f1d1d';
        ctx.fillRect(cap.x - 16, cap.y - 12, 32, 24);
        ctx.strokeStyle = eng.frame % 12 < 6 ? crateColor : '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(cap.x - 16, cap.y - 12, 32, 24);

        if (isHp) {
          // Crisp Red/Emerald Medkit Cross
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(cap.x - 3, cap.y - 8, 6, 16);
          ctx.fillRect(cap.x - 8, cap.y - 3, 16, 6);
        } else {
          // Chamfered Metal Corner Plates & Question Emblem
          ctx.fillStyle = '#facc15';
          ctx.fillRect(cap.x - 14, cap.y - 10, 4, 4);
          ctx.fillRect(cap.x + 10, cap.y - 10, 4, 4);
          ctx.fillRect(cap.x - 14, cap.y + 6, 4, 4);
          ctx.fillRect(cap.x + 10, cap.y + 6, 4, 4);
          ctx.fillStyle = '#fde047';
          ctx.font = '900 15px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('★', cap.x, cap.y + 5.5);
        }

        // Crisp Label Pill above crate
        const pillY = cap.onParachute ? cap.y - 74 : cap.y - 32;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(cap.x - 27, pillY, 54, 15);
        ctx.strokeStyle = isHp ? '#4ade80' : '#fde047';
        ctx.lineWidth = 1;
        ctx.strokeRect(cap.x - 27, pillY, 54, 15);
        ctx.fillStyle = isHp ? '#4ade80' : '#fde047';
        ctx.font = '800 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(isHp ? '❤️ +1 HP' : '❓ PILIH', cap.x, pillY + 10.5);
        ctx.restore();
      });

      // Draw Detailed Enemies with Crisp Outlines, Laser Glints & Hover Rotors
      eng.enemies.forEach((en: any) => {
        if (en.x + en.w < eng.cameraX - 40 || en.x > eng.cameraX + 840) return;
        ctx.save();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#020617';

        if (en.type === 'trooper') {
          const stride = Math.sin(eng.frame * 0.25 + en.id) * 5;
          // Tactical Backpack
          ctx.fillStyle = '#475569';
          ctx.fillRect(en.x + 22, en.y + 15, 6, 15);
          ctx.strokeRect(en.x + 22, en.y + 15, 6, 15);
          // Legs
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(en.x + 5 + stride, en.y + 34, 7, 14);
          ctx.strokeRect(en.x + 5 + stride, en.y + 34, 7, 14);
          ctx.fillRect(en.x + 16 - stride, en.y + 34, 7, 14);
          ctx.strokeRect(en.x + 16 - stride, en.y + 34, 7, 14);
          // Red tactical armor torso
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(en.x + 4, en.y + 13, 20, 22);
          ctx.strokeRect(en.x + 4, en.y + 13, 20, 22);
          ctx.fillStyle = '#f87171';
          ctx.fillRect(en.x + 7, en.y + 15, 13, 7);
          // Helmet + Glowing Visor
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(en.x + 6, en.y + 1, 16, 12);
          ctx.strokeRect(en.x + 6, en.y + 1, 16, 12);
          ctx.fillStyle = '#fde047';
          ctx.fillRect(en.x + 6, en.y + 6, 7, 4);
          // Rifle
          ctx.fillStyle = '#334155';
          ctx.fillRect(en.x - 10, en.y + 17, 16, 5);
          ctx.strokeRect(en.x - 10, en.y + 17, 16, 5);
        } else if (en.type === 'turret') {
          // Bolted Metal Bunker Base
          ctx.fillStyle = '#334155';
          ctx.fillRect(en.x, en.y + 14, en.w, 22);
          ctx.strokeRect(en.x, en.y + 14, en.w, 22);
          ctx.fillStyle = '#eab308';
          ctx.fillRect(en.x + 4, en.y + 30, en.w - 8, 4);
          // Armored Cannon Dome
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.arc(en.x + en.w / 2, en.y + 15, 14, Math.PI, 0);
          ctx.fill();
          ctx.stroke();
          // Cannon Barrel + Sensor Eye
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(en.x - 12, en.y + 7, 18, 7);
          ctx.strokeRect(en.x - 12, en.y + 7, 18, 7);
          ctx.fillStyle = eng.frame % 16 < 8 ? '#ef4444' : '#fde047';
          ctx.beginPath();
          ctx.arc(en.x + en.w / 2, en.y + 10, 4, 0, Math.PI * 2);
          ctx.fill();
          // Brief Laser Warning Glint right before shooting
          if (en.shootCd < 22) {
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(en.x - 12, en.y + 10);
            ctx.lineTo(en.x - 68, en.y + 10);
            ctx.stroke();
          }
          // Turret Mini HP Bar
          const tMax = 2 + currentStage;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(en.x + 2, en.y - 6, en.w - 4, 4);
          ctx.fillStyle = '#fb923c';
          ctx.fillRect(en.x + 2, en.y - 6, (en.w - 4) * Math.max(0, en.hp / tMax), 4);
        } else {
          // Proportionally Accurate 16-bit SNES Attack Helicopter (Facing Left)
          const cx = en.x + en.w / 2 - 3;
          const cy = en.y + en.h / 2 + 1;
          const bladeSweep = Math.cos(eng.frame * 0.85 + en.id) * 26;
          const tailSpin = eng.frame * 0.9 + en.id;

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(-0.07); // Natural forward nose-down flight pitch
          ctx.lineWidth = 1.4;
          ctx.strokeStyle = '#020617';

          // 1. Landing Skids & Struts (bottom)
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(-10, 7);
          ctx.lineTo(-12, 13);
          ctx.moveTo(5, 7);
          ctx.lineTo(7, 13);
          // Curved horizontal skid rail
          ctx.moveTo(-17, 11);
          ctx.lineTo(-14, 13);
          ctx.lineTo(11, 13);
          ctx.lineTo(13, 12);
          ctx.stroke();

          ctx.lineWidth = 1.4;
          ctx.strokeStyle = '#020617';

          // 2. Tapered Tail Boom & Vertical Stabilizer Fin (right rear)
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.moveTo(8, -5);
          ctx.lineTo(31, -7);
          ctx.lineTo(31, -4);
          ctx.lineTo(9, 1);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Horizontal tail winglet
          ctx.fillStyle = '#475569';
          ctx.fillRect(22, -6, 6, 2.5);

          // Vertical tail fin (swept back)
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.moveTo(27, -5);
          ctx.lineTo(30, -16);
          ctx.lineTo(34, -16);
          ctx.lineTo(32, -4);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Spinning Tail Rotor (cross blades + blur ring)
          ctx.save();
          ctx.translate(31, -11);
          ctx.fillStyle = 'rgba(226, 232, 240, 0.25)';
          ctx.beginPath();
          ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.rotate(tailSpin);
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(-5, 0);
          ctx.lineTo(5, 0);
          ctx.moveTo(0, -5);
          ctx.lineTo(0, 5);
          ctx.stroke();
          ctx.restore();

          // 3. Main Armored Fuselage (tapered gunship profile)
          ctx.fillStyle = '#3b4963';
          ctx.beginPath();
          ctx.moveTo(-22, 3);    // Nose tip
          ctx.lineTo(-15, -4);   // Nose upper slope
          ctx.lineTo(-5, -9);    // Cockpit top
          ctx.lineTo(9, -9);     // Engine deck rear
          ctx.lineTo(13, -3);    // Rear bulkhead
          ctx.lineTo(9, 6);      // Belly rear
          ctx.lineTo(-13, 7);    // Belly front
          ctx.lineTo(-21, 5);    // Chin under-nose
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Upper Turbine Engine Cowling + Glowing Jet Exhaust
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-5, -12, 14, 4);
          ctx.strokeRect(-5, -12, 14, 4);
          ctx.fillStyle = eng.frame % 6 < 3 ? '#fb923c' : '#fde047';
          ctx.fillRect(9, -11, 4, 2.5);

          // Red/Amber Tactical Fuselage Stripe
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-10, 1, 18, 2.5);

          // 4. Armored Glass Cockpit Canopy (front-left)
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(-16, -2);
          ctx.lineTo(-11, -7.5);
          ctx.lineTo(-3, -7.5);
          ctx.lineTo(-3, -1);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // Cockpit divider bar & glass specular highlight
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-9.5, -7.5, 1.5, 6.5);
          ctx.fillStyle = '#e0f2fe';
          ctx.fillRect(-13.5, -5.5, 3, 1.8);

          // 5. Stub Wing & Twin Rocket Pod + Chin Autocannon
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-3, 2, 10, 5);
          ctx.strokeRect(-3, 2, 10, 5);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-4, 3, 2, 3);
          // Chin autocannon pointing toward player
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(-25, 4.5, 6, 2.5);
          ctx.strokeRect(-25, 4.5, 6, 2.5);

          // 6. Main Rotor Mast, Hub & High-Speed Spinning Rotor Blades
          ctx.fillStyle = '#64748b';
          ctx.fillRect(0, -16, 4, 5);
          ctx.strokeRect(0, -16, 4, 5);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(-1, -17.5, 6, 2.5);
          // Motion-blur rotor disc
          ctx.fillStyle = 'rgba(226, 232, 240, 0.22)';
          ctx.beginPath();
          ctx.ellipse(2, -16.5, 27, 2.6, 0, 0, Math.PI * 2);
          ctx.fill();
          // Sweeping main blades
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(2 - Math.abs(bladeSweep), -17.3, Math.max(4, Math.abs(bladeSweep) * 2), 1.8);

          ctx.restore();
        }
        ctx.restore();
      });

      // Draw Player
      drawPixelPlayer(eng.player, eng.frame);

      // Draw High-Contrast Player Bullets with Glow Trails
      eng.playerBullets.forEach((b: any) => {
        ctx.save();
        if (b.type === 'L') {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.fillRect(b.x - 18, b.y - 5, 36, 10);
          ctx.fillStyle = '#0ea5e9';
          ctx.fillRect(b.x - 14, b.y - 3, 28, 6);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(b.x - 11, b.y - 1.5, 22, 3);
        } else if (b.type === 'S') {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.38)';
          ctx.beginPath();
          ctx.arc(b.x, b.y, 9.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(b.x, b.y, 3.2, 0, Math.PI * 2);
          ctx.fill();
        } else if (b.type === 'F') {
          ctx.fillStyle = 'rgba(249, 115, 22, 0.35)';
          ctx.beginPath();
          ctx.arc(b.x, b.y, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(b.x, b.y, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(b.x, b.y, 3.8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const coreCol = b.type === 'M' ? '#c084fc' : '#facc15';
          ctx.fillStyle = b.type === 'M' ? 'rgba(192,132,252,0.35)' : 'rgba(250,204,21,0.35)';
          ctx.beginPath();
          ctx.arc(b.x, b.y, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = coreCol;
          ctx.beginPath();
          ctx.arc(b.x, b.y, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(b.x, b.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Draw Enemy Bullets (Super-Clear Pulsing Plasma Orbs)
      eng.enemyBullets.forEach((eb: any) => {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.32)';
        ctx.beginPath();
        ctx.arc(eb.x, eb.y, eb.r + 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = eng.frame % 6 < 3 ? '#ef4444' : '#f97316';
        ctx.beginPath();
        ctx.arc(eb.x, eb.y, eb.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eb.x, eb.y, eb.r * 0.45, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Multi-Layer Explosions & Spark Particles
      eng.explosions.forEach((ex: any) => {
        const alpha = Math.max(0, ex.life / (ex.maxLife || 20));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = ex.color;
        ctx.beginPath();
        ctx.arc(ex.x, ex.y, ex.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(ex.x, ex.y, ex.r * 0.58, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      eng.particles.forEach((pt: any) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
        ctx.restore();
      });

      // Draw Floating Score Popups
      eng.floatingTexts.forEach((ft: any) => {
        ctx.save();
        ctx.globalAlpha = Math.min(1, ft.life / 18);
        ctx.font = '900 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#020617';
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      ctx.restore();

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [gameState, pendingWeaponQuiz, currentStage]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullScreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullScreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'space-y-3 font-sans w-full flex flex-col',
        isFullScreen ? 'fixed inset-0 z-[9999] bg-slate-950 p-2 md:p-4 w-full h-full overflow-hidden' : 'mx-auto max-w-6xl'
      )}
    >
      {/* SNES Retro Arcade HUD Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900 text-white p-3 md:p-3.5 rounded-2xl border-2 border-red-500/40 shadow-lg gap-2.5 shrink-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="px-3 py-1 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl text-xs font-black tracking-wider uppercase shadow-sm">
            🕹️ INFORMATIKA WAR • STAGE {currentStage}
          </div>

          {/* HP Hearts Indicator */}
          <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-xl" title={`HP: ${lives} / ${MAX_HP}`}>
            {Array.from({ length: MAX_HP }).map((_, i) => (
              <Heart
                key={i}
                size={14}
                className={cn(
                  'transition-all',
                  i < lives ? 'text-rose-500 fill-rose-500 scale-100' : 'text-slate-700 fill-slate-800 scale-90'
                )}
              />
            ))}
            <span className="ml-1 text-[10px] font-black text-rose-300 font-mono">
              {lives}/{MAX_HP}
            </span>
          </div>

          {/* Clickable Weapon Selector Pills ([1]-[5]) */}
          <div className="flex items-center gap-1 flex-wrap">
            {(['N', 'S', 'L', 'F', 'M'] as WeaponType[]).map((wKey, idx) => {
              const count = ammoBag[wKey] || 0;
              const unlocked = wKey === 'N' || count > 0;
              const isActive = weapon === wKey;
              return (
                <button
                  key={wKey}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => selectActiveWeapon(wKey)}
                  title={`${WEAPON_INFO[wKey].name} (Tombol ${idx + 1})`}
                  className={cn(
                    'px-2 py-1 rounded-xl border text-[10px] font-black flex items-center gap-1 transition-all',
                    isActive
                      ? `${WEAPON_INFO[wKey].badgeBg} ring-2 ring-amber-300 scale-105 shadow`
                      : unlocked
                      ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-500'
                      : 'bg-slate-950/60 border-slate-800/60 text-slate-600 opacity-50 cursor-not-allowed'
                  )}
                >
                  <span className="opacity-70">{idx + 1}:</span>
                  <span>{wKey}</span>
                  <span className="font-mono bg-black/30 px-1 rounded">
                    {wKey === 'N' ? '∞' : count}
                  </span>
                </button>
              );
            })}
          </div>

          {shieldFrames > 0 && (
            <div className="px-2.5 py-1 bg-sky-500 text-slate-950 rounded-xl text-[10px] font-black animate-pulse flex items-center gap-1">
              <Shield size={12} /> PERISAI ({Math.ceil(shieldFrames / 60)}s)
            </div>
          )}

          <div className="text-xs font-bold text-slate-300">
            Progres: <span className="text-amber-400 font-mono font-black">{progressPct}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto sm:ml-0 flex-wrap">
          {bossHpInfo && gameState === 'playing' && (
            <div className="px-3 py-1 bg-rose-950 border border-rose-500/60 rounded-xl flex items-center gap-2">
              <span className="text-[10px] font-black text-rose-300 uppercase">BOSS HP</span>
              <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-amber-400 transition-all"
                  style={{ width: `${Math.round((bossHpInfo.hp / bossHpInfo.maxHp) * 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="px-3.5 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black rounded-xl font-mono">
            SKOR: {score}
          </div>

          <button
            onClick={() => setScanlinesEnabled(s => !s)}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-[10px] font-black"
            title="Toggle Efek CRT SNES Scanline"
          >
            {scanlinesEnabled ? '📺 CRT ON' : '📺 CRT OFF'}
          </button>

          <button
            onClick={() => {
              const next = !muted;
              setMuted(next);
              audioRef.current.setMuted(next);
              if (!next && gameState === 'playing') {
                audioRef.current.startBgm(currentStage);
                audioRef.current.setBgmMode(currentStage, !!engineRef.current?.boss?.active);
              }
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl"
            title={muted ? 'Nyalakan Musik & Suara' : 'Matikan Musik & Suara'}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <button
            onClick={toggleFullScreen}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl"
            title="Layar Penuh"
          >
            {isFullScreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>

          <button
            onClick={() => {
              audioRef.current.stopBgm();
              onClose();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
            title="Tutup Game"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main SNES Game Viewport */}
      <div className="relative rounded-3xl overflow-hidden border-4 border-slate-800 bg-slate-950 shadow-2xl w-full flex-1 min-h-0 max-h-[76vh] aspect-[16/9] mx-auto flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="w-full h-full object-contain bg-slate-950"
        />

        {/* Subtle SNES CRT Scanlines Overlay */}
        {scanlinesEnabled && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20 z-10"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.45) 0px, rgba(0,0,0,0.45) 1px, transparent 1px, transparent 3px)',
            }}
          />
        )}

        {/* Boss Incoming Warning Banner */}
        {bossBanner && gameState === 'playing' && (
          <div className="absolute top-6 inset-x-0 flex justify-center pointer-events-none z-20 animate-bounce">
            <div className="px-6 py-2 bg-red-600/95 border-2 border-amber-300 text-white font-black text-sm md:text-lg tracking-widest uppercase rounded-xl shadow-2xl">
              ⚠️ PERINGATAN! BOSS REAKTOR CYBER DI DEPAN! ⚠️
            </div>
          </div>
        )}

        {/* Semi-Transparent In-Game Touch Controls Overlay (Inside Game Canvas Area!) */}
        {isTouchDevice && gameState === 'playing' && !pendingWeaponQuiz && (
          <div className="absolute inset-x-0 bottom-2.5 sm:bottom-4 px-3 sm:px-5 flex items-end justify-between gap-4 pointer-events-none z-30 touch-none select-none">
            {/* Left SNES D-Pad */}
            <div className="grid grid-cols-3 gap-1 w-32 sm:w-36 pointer-events-auto">
              <div />
              <button
                type="button"
                onContextMenu={e => e.preventDefault()}
                onPointerDown={e => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); setControlState('up', true); }}
                onPointerUp={e => { e.preventDefault(); setControlState('up', false); }}
                onPointerCancel={() => setControlState('up', false)}
                onLostPointerCapture={() => setControlState('up', false)}
                className="h-10 bg-slate-900/50 active:bg-brand/75 text-white font-black text-sm rounded-xl border border-white/25 backdrop-blur-[2px] flex items-center justify-center select-none touch-none"
              >
                ▲
              </button>
              <div />
              <button
                type="button"
                onContextMenu={e => e.preventDefault()}
                onPointerDown={e => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); setControlState('left', true); }}
                onPointerUp={e => { e.preventDefault(); setControlState('left', false); }}
                onPointerCancel={() => setControlState('left', false)}
                onLostPointerCapture={() => setControlState('left', false)}
                className="h-10 bg-slate-900/50 active:bg-brand/75 text-white font-black text-sm rounded-xl border border-white/25 backdrop-blur-[2px] flex items-center justify-center select-none touch-none"
              >
                ◀
              </button>
              <button
                type="button"
                onContextMenu={e => e.preventDefault()}
                onPointerDown={e => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); setControlState('down', true); }}
                onPointerUp={e => { e.preventDefault(); setControlState('down', false); }}
                onPointerCancel={() => setControlState('down', false)}
                onLostPointerCapture={() => setControlState('down', false)}
                className="h-10 bg-slate-900/50 active:bg-brand/75 text-white font-black text-sm rounded-xl border border-white/25 backdrop-blur-[2px] flex items-center justify-center select-none touch-none"
                title="Tiarap"
              >
                ▼
              </button>
              <button
                type="button"
                onContextMenu={e => e.preventDefault()}
                onPointerDown={e => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); setControlState('right', true); }}
                onPointerUp={e => { e.preventDefault(); setControlState('right', false); }}
                onPointerCancel={() => setControlState('right', false)}
                onLostPointerCapture={() => setControlState('right', false)}
                className="h-10 bg-slate-900/50 active:bg-brand/75 text-white font-black text-sm rounded-xl border border-white/25 backdrop-blur-[2px] flex items-center justify-center select-none touch-none"
              >
                ▶
              </button>
            </div>

            {/* Right Action Buttons: TEMBAK & PANAH ATAS (LONCAT) */}
            <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
              <button
                type="button"
                onContextMenu={e => e.preventDefault()}
                onPointerDown={e => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); setControlState('shoot', true); }}
                onPointerUp={e => { e.preventDefault(); setControlState('shoot', false); }}
                onPointerCancel={() => setControlState('shoot', false)}
                onLostPointerCapture={() => setControlState('shoot', false)}
                className="w-20 sm:w-24 h-12 sm:h-14 bg-red-600/55 active:bg-red-500/85 text-white font-black text-xs rounded-2xl border border-red-300/50 backdrop-blur-[2px] flex items-center justify-center shadow-lg select-none touch-none"
              >
                TEMBAK 🔥
              </button>
              <button
                type="button"
                aria-label="Loncat (Panah Atas)"
                title="Loncat (Panah Atas)"
                onContextMenu={e => e.preventDefault()}
                onPointerDown={e => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); setControlState('jump', true); }}
                onPointerUp={e => { e.preventDefault(); setControlState('jump', false); }}
                onPointerCancel={() => setControlState('jump', false)}
                onLostPointerCapture={() => setControlState('jump', false)}
                className="w-16 sm:w-20 h-12 sm:h-14 bg-emerald-600/60 active:bg-emerald-500/85 text-white font-black text-2xl rounded-2xl border border-emerald-300/60 backdrop-blur-[2px] flex items-center justify-center shadow-lg select-none touch-none"
              >
                ⬆️
              </button>
            </div>
          </div>
        )}

        {/* START OVERLAY */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center text-center p-5 md:p-8 text-white space-y-4 z-40 overflow-y-auto">
            <div className="px-4 py-1 bg-red-600 text-white font-black text-[10px] tracking-[0.25em] uppercase rounded-full border border-amber-300 shadow-lg">
              16-BIT SNES ACTION • INFORMATIKA EDITION
            </div>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-sky-400">
              INFORMATIKA WAR
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-lg font-medium leading-relaxed">
              Tangkap <strong className="text-amber-300">Kotak Suplai Terjun Payung</strong> dari langit! Ambil{' '}
              <strong className="text-emerald-300">Medkit ❤️ +1 HP</strong> langsung, atau jawab kuis Informatika saat mengambil kotak{' '}
              <strong className="text-amber-300">❓ PILIH</strong> untuk bebas memilih Peluru Spesial (S / L / F / M), +1 HP, atau Perisai!
            </p>

            {/* Stage Selector */}
            <div className="flex items-center gap-2.5 flex-wrap justify-center">
              {([1, 2, 3] as const).map(st => {
                const locked = !isAdmin && st > 1 && !completedStages.includes(st - 1);
                const hi = studentStageHighScores?.[st] || 0;
                return (
                  <button
                    key={st}
                    disabled={locked}
                    onClick={() => startStage(st)}
                    className={cn(
                      'px-4 py-2.5 rounded-2xl border-2 text-xs font-black transition-all flex items-center gap-2',
                      currentStage === st
                        ? 'bg-red-600 border-amber-300 text-white shadow-lg scale-105'
                        : 'bg-slate-800/90 border-slate-700 text-slate-200 hover:border-slate-500',
                      locked && 'opacity-45 cursor-not-allowed'
                    )}
                  >
                    <span>{locked ? '🔒' : st === 1 ? '🌴' : st === 2 ? '🌊' : '🔥'} Stage {st}: {STAGE_THEMES[st].name}</span>
                    {hi > 0 && (
                      <span className="px-1.5 py-0.5 bg-amber-400 text-amber-950 rounded text-[10px]">🏆 {hi}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => startStage(currentStage)}
              className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-base rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Play size={20} />
              <span>MULAI MISI STAGE {currentStage}</span>
            </button>
          </div>
        )}

        {/* INFORMATIKA QUIZ GATE & 6-ITEM REWARD PICKER */}
        {pendingWeaponQuiz && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-6 text-white z-50 overflow-y-auto">
            <div className="w-full max-w-xl bg-slate-900 border-2 border-amber-400 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl border-2 border-amber-300 bg-amber-500/20 flex items-center justify-center font-black text-2xl shadow-md">
                    🪂
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                      🔐 Kotak Suplai & Kuis Informatika
                    </span>
                    <h3 className="text-sm md:text-base font-black text-white">
                      Jawab benar untuk memilih Item Hadiah!
                    </h3>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-sky-300 hidden sm:inline">
                  {pendingWeaponQuiz.quiz.topicTitle}
                </span>
              </div>

              <p className="text-sm md:text-base font-black text-white leading-snug text-left">
                {pendingWeaponQuiz.quiz.question}
              </p>

              {quizFeedback ? (
                quizFeedback.awaitingItemPick ? (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl border-2 bg-emerald-950/90 border-emerald-500 text-emerald-200 text-xs md:text-sm font-bold text-left">
                      {quizFeedback.msg}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      <button
                        onClick={() => handlePickRewardItem('S')}
                        className="p-3 bg-red-950/80 hover:bg-red-700 border-2 border-red-400/70 rounded-2xl text-left transition-all active:scale-95"
                      >
                        <div className="text-xs font-black text-red-300">[S] Spread Gun</div>
                        <div className="text-[10px] text-slate-300 font-semibold mt-0.5">+45 Peluru 5-Arah</div>
                      </button>
                      <button
                        onClick={() => handlePickRewardItem('L')}
                        className="p-3 bg-sky-950/80 hover:bg-sky-700 border-2 border-sky-400/70 rounded-2xl text-left transition-all active:scale-95"
                      >
                        <div className="text-xs font-black text-sky-300">[L] Cyber Laser</div>
                        <div className="text-[10px] text-slate-300 font-semibold mt-0.5">+45 Laser Tembus</div>
                      </button>
                      <button
                        onClick={() => handlePickRewardItem('F')}
                        className="p-3 bg-orange-950/80 hover:bg-orange-700 border-2 border-orange-400/70 rounded-2xl text-left transition-all active:scale-95"
                      >
                        <div className="text-xs font-black text-orange-300">[F] Fireball Wave</div>
                        <div className="text-[10px] text-slate-300 font-semibold mt-0.5">+45 Bola Api</div>
                      </button>
                      <button
                        onClick={() => handlePickRewardItem('M')}
                        className="p-3 bg-purple-950/80 hover:bg-purple-700 border-2 border-purple-400/70 rounded-2xl text-left transition-all active:scale-95"
                      >
                        <div className="text-xs font-black text-purple-300">[M] Machine Gun</div>
                        <div className="text-[10px] text-slate-300 font-semibold mt-0.5">+75 Peluru Cepat</div>
                      </button>
                      <button
                        onClick={() => handlePickRewardItem('HP')}
                        className="p-3 bg-emerald-950/80 hover:bg-emerald-700 border-2 border-emerald-400/70 rounded-2xl text-left transition-all active:scale-95"
                      >
                        <div className="text-xs font-black text-emerald-300">❤️ +1 HP Medkit</div>
                        <div className="text-[10px] text-slate-300 font-semibold mt-0.5">
                          {lives >= MAX_HP ? 'HP Penuh (+100 Skor)' : `Tambah Nyawa (${lives}/${MAX_HP})`}
                        </div>
                      </button>
                      <button
                        onClick={() => handlePickRewardItem('SHIELD')}
                        className="p-3 bg-cyan-950/80 hover:bg-cyan-700 border-2 border-cyan-400/70 rounded-2xl text-left transition-all active:scale-95"
                      >
                        <div className="text-xs font-black text-cyan-300">🛡️ Perisai Energi</div>
                        <div className="text-[10px] text-slate-300 font-semibold mt-0.5">Kebal Selama 8 Detik</div>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl border-2 bg-rose-950/90 border-rose-500 text-rose-200 text-xs md:text-sm font-bold text-left">
                      {quizFeedback.msg}
                    </div>
                    <button
                      onClick={resumeAfterQuiz}
                      className="w-full py-3 bg-brand hover:bg-brand-hover text-white rounded-xl font-black text-sm shadow-lg active:scale-95 transition-all"
                    >
                      Lanjutkan Pertempuran ▶
                    </button>
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {pendingWeaponQuiz.quiz.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerWeaponQuiz(idx)}
                      className="p-3 bg-slate-800 hover:bg-brand border border-slate-700 hover:border-amber-300 rounded-xl text-left text-xs font-bold text-white transition-all flex items-center gap-2.5 active:scale-95"
                    >
                      <span className="w-6 h-6 rounded-lg bg-slate-950 text-amber-400 font-mono font-black flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VICTORY OVERLAY */}
        {gameState === 'win' && (
          <div className="absolute inset-0 bg-emerald-950/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 text-white space-y-4 z-40">
            <div className="w-16 h-16 bg-amber-400 text-amber-950 rounded-2xl flex items-center justify-center text-3xl shadow-xl animate-bounce">
              🏆
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-amber-300">
              MISI STAGE {currentStage} SELESAI!
            </h2>
            <p className="text-xs md:text-sm text-emerald-200 font-bold max-w-md">
              Reaktor Cyber Boss di {STAGE_THEMES[currentStage].name} berhasil dihancurkan!
            </p>
            <div className="bg-emerald-900/80 border border-emerald-700 px-8 py-4 rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 block">Skor Akhir Stage {currentStage}</span>
              <span className="text-4xl font-black text-amber-400 font-mono">{score}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {currentStage < 3 ? (
                <button
                  onClick={() => startStage((currentStage + 1) as 1 | 2 | 3)}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black rounded-xl text-sm shadow-lg"
                >
                  Lanjut Stage {currentStage + 1} ➔
                </button>
              ) : (
                <button
                  onClick={() => startStage(1)}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black rounded-xl text-sm shadow-lg"
                >
                  Main Lagi Dari Stage 1 🔄
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* GAME OVER OVERLAY */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 text-white space-y-4 z-40">
            <AlertTriangle size={48} className="text-rose-500" />
            <h2 className="text-2xl md:text-3xl font-black text-rose-400">GAME OVER — NYAWA HABIS!</h2>
            <p className="text-xs text-slate-300 max-w-sm">
              Kalahkan musuh & jawab kuis Informatika saat mengambil kapsul peluru spesial untuk membuka Spread Gun & Laser!
            </p>
            <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl">
              <span className="text-xs text-slate-400 block">Skor Terkumpul</span>
              <span className="text-3xl font-black text-amber-400 font-mono">{score}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => startStage(currentStage)}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-sm flex items-center gap-2 shadow-lg"
              >
                <RotateCcw size={16} /> Coba Lagi Stage {currentStage}
              </button>
              <button
                onClick={onClose}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Controls Guide */}
      {!isTouchDevice && (
        <div className="bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-800 flex items-center justify-center gap-4 flex-wrap shrink-0 text-xs text-slate-300 font-semibold">
          <span>🕹️ Kontrol Informatika War:</span>
          <span className="text-amber-300">
            [←/→] atau [A/D] Lari • [↑ Panah Atas] Loncat • [W] Bidik Atas/Diagonal • [↓/S] Tiarap • [Z/J/Enter] Tembak • [1-5] Pilih Senjata
          </span>
        </div>
      )}
    </div>
  );
}
