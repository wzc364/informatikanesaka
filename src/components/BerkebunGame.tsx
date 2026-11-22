/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Play,
  RotateCcw,
  BookOpen,
  Coins,
  Droplets,
  Zap,
  Sun,
  CloudRain,
  Moon,
  ShoppingBag,
  Package,
  Trophy,
  Sparkles,
  X,
  Volume2,
  VolumeX,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sprout,
} from 'lucide-react';
import { cn } from '../utils';
import { doc, setDoc, getDocs, query, collection, where } from 'firebase/firestore';
import { db } from '../firebase';
import gameBerkebunBg from '../assets/images/game_berkebun_bg_1795346504800.jpg';
import berkebunPortraitImg from '../assets/images/berkebun_portrait_1795346503232.jpg';
import {
  loadAllStardewSprites,
  getStardewPixelAtlas,
  getPixelCropDataUrl,
  getPixelToolDataUrl,
  type StardewSprites,
  type PixelAtlas,
} from './berkebunPixelArt';

const GRID_COLS = 16;
const GRID_ROWS = 11;
const TILE_SIZE = 48; // 16*48 = 768, 11*48 = 528 (crisp 3x scale of 16px Stardew tiles)

export type Season = 'Semi' | 'Panas' | 'Gugur' | 'Dingin';
export type Weather = 'Cerah' | 'Hujan';

export type CropId = 'turnip' | 'potato' | 'strawberry' | 'corn' | 'sunflower' | 'pumpkin';

export interface CropDef {
  id: CropId;
  name: string;
  seedCost: number;
  sellPrice: number;
  daysToGrow: number;
  regrowDays?: number;
  seasons: Season[];
  color: string;
  accent: string;
  emoji: string;
  desc: string;
}

export const CROPS: Record<CropId, CropDef> = {
  turnip: {
    id: 'turnip',
    name: 'Lobak Segar',
    seedCost: 20,
    sellPrice: 45,
    daysToGrow: 2,
    seasons: ['Semi', 'Gugur'],
    color: '#f8fafc',
    accent: '#4ade80',
    emoji: '🌱',
    desc: 'Cepat panen dalam 2 hari. Cocok untuk modal awal kebun.',
  },
  potato: {
    id: 'potato',
    name: 'Kentang Emas',
    seedCost: 40,
    sellPrice: 80,
    daysToGrow: 3,
    seasons: ['Semi', 'Panas', 'Dingin'],
    color: '#d97706',
    accent: '#fbbf24',
    emoji: '🥔',
    desc: 'Berpeluang menghasilkan 2 kentang sekaligus saat dipanen.',
  },
  strawberry: {
    id: 'strawberry',
    name: 'Stroberi Manis',
    seedCost: 75,
    sellPrice: 120,
    daysToGrow: 4,
    regrowDays: 2,
    seasons: ['Semi', 'Panas'],
    color: '#ef4444',
    accent: '#fca5a5',
    emoji: '🍓',
    desc: 'Sekali tanam dapat dipanen berulang setiap 2 hari!',
  },
  corn: {
    id: 'corn',
    name: 'Jagung Manis',
    seedCost: 90,
    sellPrice: 95,
    daysToGrow: 4,
    regrowDays: 2,
    seasons: ['Panas', 'Gugur'],
    color: '#eab308',
    accent: '#fef08a',
    emoji: '🌽',
    desc: 'Tumbuh subur sepanjang Panas & Gugur dengan panen berulang.',
  },
  sunflower: {
    id: 'sunflower',
    name: 'Bunga Matahari',
    seedCost: 60,
    sellPrice: 145,
    daysToGrow: 3,
    seasons: ['Panas', 'Gugur'],
    color: '#f59e0b',
    accent: '#78350f',
    emoji: '🌻',
    desc: 'Bunga berharga tinggi dan sering memberi 1 benih gratis saat panen.',
  },
  pumpkin: {
    id: 'pumpkin',
    name: 'Labu Raksasa',
    seedCost: 110,
    sellPrice: 310,
    daysToGrow: 5,
    seasons: ['Gugur', 'Dingin'],
    color: '#ea580c',
    accent: '#fed7aa',
    emoji: '🎃',
    desc: 'Tanaman bernilai jual tertinggi untuk menjadi Juragan Kebun!',
  },
};

export type TileKind = 'grass' | 'house' | 'pond' | 'bin' | 'shop' | 'path';
export type DebrisKind = 'stone' | 'wood' | 'weed' | null;

export interface FarmTile {
  x: number;
  y: number;
  kind: TileKind;
  tilled: boolean;
  watered: boolean;
  fertilized: boolean;
  hasSprinkler: boolean;
  debris: DebrisKind;
  crop: {
    id: CropId;
    age: number;
    ready: boolean;
  } | null;
}

export type ToolMode = 'hoe' | 'water' | 'pick' | 'harvest' | 'seed' | 'fertilizer' | 'sprinkler';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  label?: string;
}

interface QuestDef {
  id: string;
  title: string;
  rewardGold: number;
  rewardScore: number;
  target: number;
  type: 'harvest_total' | 'gold_earned' | 'plant_total' | 'sprinkler_placed' | 'gold_quality';
}

const QUESTS: QuestDef[] = [
  { id: 'q1', title: 'Tanam 4 Benih Pertama', rewardGold: 60, rewardScore: 100, target: 4, type: 'plant_total' },
  { id: 'q2', title: 'Panen 5 Hasil Kebun', rewardGold: 120, rewardScore: 180, target: 5, type: 'harvest_total' },
  { id: 'q3', title: 'Panen Kualitas Emas (★)', rewardGold: 180, rewardScore: 250, target: 1, type: 'gold_quality' },
  { id: 'q4', title: 'Pasang 1 Sprinkler Otomatis', rewardGold: 220, rewardScore: 300, target: 1, type: 'sprinkler_placed' },
  { id: 'q5', title: 'Kumpulkan Total 1.000G Penjualan', rewardGold: 350, rewardScore: 500, target: 1000, type: 'gold_earned' },
];

function playFarmSound(
  type: 'hoe' | 'water' | 'plant' | 'harvest' | 'coin' | 'sleep' | 'clear' | 'error',
  muted: boolean
) {
  if (muted || typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'hoe') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'water') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.12);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      osc.start(now);
      osc.stop(now + 0.13);
    } else if (type === 'plant') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.setValueAtTime(460, now + 0.05);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      osc.start(now);
      osc.stop(now + 0.11);
    } else if (type === 'harvest') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.06);
      osc.frequency.setValueAtTime(783.99, now + 0.12);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'coin') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.07);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'clear') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(210, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.setValueAtTime(140, now + 0.08);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'sleep') {
      const notes = [392, 493.88, 587.33, 783.99];
      notes.forEach((f, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(f, now + idx * 0.1);
        g.gain.setValueAtTime(0.06, now + idx * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.25);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now + idx * 0.1);
        o.stop(now + idx * 0.1 + 0.26);
      });
      return;
    }

    setTimeout(() => {
      try {
        void ctx.close();
      } catch {
        // ignore
      }
    }, 450);
  } catch {
    // ignore audio errors
  }
}

function createInitialGrid(): FarmTile[] {
  const tiles: FarmTile[] = [];
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      let kind: TileKind = 'grass';
      let debris: DebrisKind = null;
      let tilled = false;

      // Farmhouse top-left (x: 1..3, y: 0..2)
      if (x >= 1 && x <= 3 && y >= 0 && y <= 2) kind = 'house';
      // Shipping bin next to house (x: 5, y: 1..2)
      else if (x === 5 && (y === 1 || y === 2)) kind = 'bin';
      // Village Seed Shop stand top-right (x: 12..14, y: 0..2)
      else if (x >= 12 && x <= 14 && y >= 0 && y <= 2) kind = 'shop';
      // Irrigation Pond bottom-left (x: 1..3, y: 7..9)
      else if (x >= 1 && x <= 3 && y >= 7 && y <= 9) kind = 'pond';
      // Cobblestone / dirt footpath connecting house, shop & garden
      else if (y === 3 && x >= 2 && x <= 13) kind = 'path';
      else if (x === 4 && y >= 3 && y <= 7) kind = 'path';
      else {
        // Pre-tilled starter garden plot (x: 6..9, y: 5..7)
        if (x >= 6 && x <= 9 && y >= 5 && y <= 7) {
          tilled = true;
        } else {
          // Scattered natural debris outside starter plot
          const hash = (x * 37 + y * 53) % 19;
          if (hash === 2 || hash === 11) debris = 'stone';
          else if (hash === 5 || hash === 14) debris = 'wood';
          else if (hash === 8 || hash === 17) debris = 'weed';
        }
      }

      tiles.push({
        x,
        y,
        kind,
        tilled,
        watered: false,
        fertilized: false,
        hasSprinkler: false,
        debris,
        crop: null,
      });
    }
  }
  return tiles;
}

interface FarmSaveState {
  day: number;
  seasonIdx: number;
  weather: Weather;
  gold: number;
  totalEarnedGold: number;
  stamina: number;
  waterLevel: number;
  sprinklerCount: number;
  fertilizerCount: number;
  seeds: Record<CropId, number>;
  harvestBasket: Record<string, { cropId: CropId; quality: 'normal' | 'gold'; qty: number }>;
  stats: {
    planted: number;
    harvested: number;
    goldQuality: number;
    sprinklersPlaced: number;
  };
  claimedQuests: string[];
  tiles: FarmTile[];
}

function createInitialSave(): FarmSaveState {
  return {
    day: 1,
    seasonIdx: 0,
    weather: 'Cerah',
    gold: 160,
    totalEarnedGold: 0,
    stamina: 100,
    waterLevel: 20,
    sprinklerCount: 0,
    fertilizerCount: 4,
    seeds: {
      turnip: 6,
      potato: 2,
      strawberry: 0,
      corn: 0,
      sunflower: 0,
      pumpkin: 0,
    },
    harvestBasket: {},
    stats: {
      planted: 0,
      harvested: 0,
      goldQuality: 0,
      sprinklersPlaced: 0,
    },
    claimedQuests: [],
    tiles: createInitialGrid(),
  };
}

const SEASONS: Season[] = ['Semi', 'Panas', 'Gugur', 'Dingin'];

export default function BerkebunGame({
  isAdmin,
  currentStudent,
  onClose: _onClose,
}: {
  isAdmin: boolean;
  currentStudent: any;
  onClose: () => void;
}) {
  const storageKey = `berkebun_stardew_save_${currentStudent?.id || (isAdmin ? 'admin' : 'guest')}`;

  const [saveState, setSaveState] = useState<FarmSaveState>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as FarmSaveState;
        if (parsed && Array.isArray(parsed.tiles) && parsed.tiles.length === GRID_COLS * GRID_ROWS) {
          return parsed;
        }
      }
    } catch {
      // ignore invalid JSON
    }
    return createInitialSave();
  });

  const hasExistingProgress =
    saveState.day > 1 ||
    saveState.stats.planted > 0 ||
    saveState.stats.harvested > 0 ||
    saveState.totalEarnedGold > 0;

  const [viewMode, setViewMode] = useState<'menu' | 'play'>('menu');
  const [showTutorial, setShowTutorial] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showBasket, setShowBasket] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [daySummary, setDaySummary] = useState<{
    newDay: number;
    newSeason: Season;
    weather: Weather;
    shippedGold: number;
    shippedItems: number;
  } | null>(null);

  const [activeTool, setActiveTool] = useState<ToolMode>('hoe');
  const [selectedSeed, setSelectedSeed] = useState<CropId>('turnip');
  const [toastMsg, setToastMsg] = useState<string>('Gunakan Cangkul, Siram air, dan tanam benihmu!');
  const [minuteOfDay, setMinuteOfDay] = useState<number>(360); // starts 06:00 (360 min)

  // Player real-time position & facing
  const playerRef = useRef({
    x: 4.5,
    y: 4.5,
    dir: 1 as 0 | 1 | 2 | 3, // 0: right, 1: down, 2: left, 3: up
    moving: false,
    swingTimer: 0,
  });
  const keysPressedRef = useRef<Record<string, boolean>>({});
  const particlesRef = useRef<Particle[]>([]);
  const particleIdRef = useRef(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spritesRef = useRef<StardewSprites>({
    farmer: null,
    farmhouse: null,
    shop: null,
    bin: null,
    tree: null,
  });
  const atlasRef = useRef<PixelAtlas | null>(null);
  const activeToolRef = useRef<ToolMode>(activeTool);
  activeToolRef.current = activeTool;
  const basketCountRef = useRef<number>(0);
  basketCountRef.current = Object.values(saveState.harvestBasket).reduce((s, x) => s + x.qty, 0);

  const currentSeason = SEASONS[saveState.seasonIdx % SEASONS.length];

  // Preload AI pixel-art sprites & build 16x16 Stardew pixel atlas once
  useEffect(() => {
    atlasRef.current = getStardewPixelAtlas();
    let mounted = true;
    void loadAllStardewSprites().then((loaded) => {
      if (mounted) spritesRef.current = loaded;
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(saveState));
    } catch {
      // ignore storage quota errors
    }
  }, [saveState, storageKey]);

  const computeTotalScore = useCallback((st: FarmSaveState) => {
    const questBonus = st.claimedQuests.reduce((sum, qid) => {
      const q = QUESTS.find((x) => x.id === qid);
      return sum + (q?.rewardScore || 0);
    }, 0);
    return st.totalEarnedGold + st.stats.harvested * 25 + questBonus;
  }, []);

  const syncScoreToCloud = useCallback(
    async (st: FarmSaveState) => {
      if (!currentStudent && !isAdmin) return;
      const finalScore = computeTotalScore(st);
      if (finalScore <= 0) return;
      const studentId = currentStudent?.id || 'admin-preview';
      try {
        const existingSnap = await getDocs(
          query(
            collection(db, 'game_scores'),
            where('studentId', '==', studentId),
            where('gameId', '==', 'berkebun')
          )
        );
        let prevBest = 0;
        existingSnap.docs.forEach((d) => {
          const val = Number(d.data()?.score || 0);
          if (val > prevBest) prevBest = val;
        });
        if (finalScore >= prevBest) {
          const nowIso = new Date().toISOString();
          const studentKelas = currentStudent?.kelas || 'Admin';
          await setDoc(doc(db, 'game_scores', `${studentId}__berkebun`), {
            gameId: 'berkebun',
            gameTitle: 'Berkebun',
            studentId,
            studentName: currentStudent?.nama || 'Admin Pratinjau',
            studentNis: currentStudent?.nis || '-',
            studentKelas,
            kelas: studentKelas,
            score: finalScore,
            dayReached: st.day,
            totalHarvested: st.stats.harvested,
            playedAt: nowIso,
            timestamp: nowIso,
          });
        }
      } catch (e) {
        console.error('Failed saving Berkebun score:', e);
      }
    },
    [computeTotalScore, currentStudent, isAdmin]
  );

  // Spawn floating particle feedback
  const spawnParticles = useCallback(
    (gx: number, gy: number, color: string, count = 6, label?: string) => {
      const px = gx * TILE_SIZE + TILE_SIZE / 2;
      const py = gy * TILE_SIZE + TILE_SIZE / 2;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        particlesRef.current.push({
          id: particleIdRef.current++,
          x: px,
          y: py,
          vx: Math.cos(angle) * (0.8 + Math.random() * 1.4),
          vy: -1.2 - Math.random() * 1.5,
          color,
          life: 0,
          maxLife: 28 + Math.floor(Math.random() * 12),
          label: i === 0 ? label : undefined,
        });
      }
    },
    []
  );

  // Advance in-game clock gently while playing
  useEffect(() => {
    if (viewMode !== 'play' || showShop || showBasket || showTutorial || daySummary) return;
    const id = window.setInterval(() => {
      setMinuteOfDay((m) => (m >= 1320 ? 1320 : m + 5)); // caps at 22:00
    }, 2500);
    return () => window.clearInterval(id);
  }, [viewMode, showShop, showBasket, showTutorial, daySummary]);

  // Sleep & advance to next day (processes crop growth, shipping bin, rain, sprinklers!)
  const handleSleepNextDay = useCallback(() => {
    playFarmSound('sleep', soundMuted);
    setSaveState((prev) => {
      const nextDay = prev.day + 1;
      const nextSeasonIdx = Math.floor((nextDay - 1) / 10) % SEASONS.length;
      const nextSeason = SEASONS[nextSeasonIdx];
      const nextWeather: Weather = Math.random() < 0.28 ? 'Hujan' : 'Cerah';

      // Auto-ship items currently inside basket at end of day
      let shippedGold = 0;
      let shippedItems = 0;
      Object.values(prev.harvestBasket).forEach((entry) => {
        const base = CROPS[entry.cropId].sellPrice;
        const unit = entry.quality === 'gold' ? Math.round(base * 1.5) : base;
        shippedGold += unit * entry.qty;
        shippedItems += entry.qty;
      });

      const sprinklerSet = new Set<string>();
      prev.tiles.forEach((t) => {
        if (t.hasSprinkler) {
          sprinklerSet.add(`${t.x + 1},${t.y}`);
          sprinklerSet.add(`${t.x - 1},${t.y}`);
          sprinklerSet.add(`${t.x},${t.y + 1}`);
          sprinklerSet.add(`${t.x},${t.y - 1}`);
        }
      });

      const newTiles = prev.tiles.map((t) => {
        let updatedCrop = t.crop ? { ...t.crop } : null;
        if (updatedCrop) {
          const cDef = CROPS[updatedCrop.id];
          // Check season compatibility (allow all crops if greenhouse spirit? Wait: keep friendly in Semi/Panas/Gugur, warn in Dingin or grow if watered!)
          if (t.watered && !updatedCrop.ready) {
            updatedCrop.age += 1;
            if (updatedCrop.age >= cDef.daysToGrow) {
              updatedCrop.ready = true;
            }
          }
        }
        const autoWatered = nextWeather === 'Hujan' || sprinklerSet.has(`${t.x},${t.y}`);
        return {
          ...t,
          crop: updatedCrop,
          watered: t.tilled ? autoWatered : false,
        };
      });

      const updated: FarmSaveState = {
        ...prev,
        day: nextDay,
        seasonIdx: nextSeasonIdx,
        weather: nextWeather,
        gold: prev.gold + shippedGold,
        totalEarnedGold: prev.totalEarnedGold + shippedGold,
        stamina: 100,
        harvestBasket: {},
        tiles: newTiles,
      };

      setDaySummary({
        newDay: nextDay,
        newSeason: nextSeason,
        weather: nextWeather,
        shippedGold,
        shippedItems,
      });
      void syncScoreToCloud(updated);
      return updated;
    });
    setMinuteOfDay(360);
    setToastMsg('Selamat pagi! Energi kembali 100%.');
  }, [soundMuted, syncScoreToCloud]);

  // Perform tool / interaction at target grid coordinate
  const interactAtTile = useCallback(
    (tx: number, ty: number) => {
      if (tx < 0 || tx >= GRID_COLS || ty < 0 || ty >= GRID_ROWS) return;
      const idx = ty * GRID_COLS + tx;
      const tile = saveState.tiles[idx];
      if (!tile) return;

      // Distance check (within ~2.8 tiles so clicking nearby or facing tile works smoothly)
      const dx = tx + 0.5 - playerRef.current.x;
      const dy = ty + 0.5 - playerRef.current.y;
      if (Math.hypot(dx, dy) > 3.1) {
        setToastMsg('Terlalu jauh! Dekati petak kebun terlebih dulu.');
        playFarmSound('error', soundMuted);
        return;
      }

      playerRef.current.swingTimer = 12;

      // Landmark interactions
      if (tile.kind === 'house') {
        handleSleepNextDay();
        return;
      }
      if (tile.kind === 'shop') {
        setShowShop(true);
        return;
      }
      if (tile.kind === 'bin') {
        setShowBasket(true);
        return;
      }
      if (tile.kind === 'pond') {
        setSaveState((prev) => ({ ...prev, waterLevel: 20 }));
        playFarmSound('water', soundMuted);
        spawnParticles(tx, ty, '#38bdf8', 8, 'Air Penuh!');
        setToastMsg('Penyiram diisi ulang penuh (20/20)!');
        return;
      }

      // Check ready harvest first regardless of tool if clicking with harvest or bare hand
      if (tile.crop?.ready && (activeTool === 'harvest' || activeTool === 'hoe' || activeTool === 'water')) {
        const cDef = CROPS[tile.crop.id];
        const goldChance = tile.fertilized ? 0.55 : 0.18;
        const isGold = Math.random() < goldChance;
        const quality: 'normal' | 'gold' = isGold ? 'gold' : 'normal';
        let qty = 1;
        if (tile.crop.id === 'potato' && Math.random() < 0.35) qty = 2;
        const bonusSeed = tile.crop.id === 'sunflower' && Math.random() < 0.45 ? 1 : 0;

        playFarmSound('harvest', soundMuted);
        spawnParticles(tx, ty, isGold ? '#facc15' : '#4ade80', 10, `+${qty} ${cDef.emoji}`);

        setSaveState((prev) => {
          const newTiles = [...prev.tiles];
          if (cDef.regrowDays) {
            newTiles[idx] = {
              ...tile,
              crop: {
                id: tile.crop!.id,
                age: cDef.daysToGrow - cDef.regrowDays,
                ready: false,
              },
            };
          } else {
            newTiles[idx] = { ...tile, crop: null, fertilized: false };
          }

          const bKey = `${tile.crop!.id}_${quality}`;
          const prevEntry = prev.harvestBasket[bKey];
          const nextBasket = {
            ...prev.harvestBasket,
            [bKey]: {
              cropId: tile.crop!.id,
              quality,
              qty: (prevEntry?.qty || 0) + qty,
            },
          };

          const nextSeeds = { ...prev.seeds };
          if (bonusSeed > 0) {
            nextSeeds[tile.crop!.id] = (nextSeeds[tile.crop!.id] || 0) + bonusSeed;
          }

          const updated: FarmSaveState = {
            ...prev,
            tiles: newTiles,
            seeds: nextSeeds,
            harvestBasket: nextBasket,
            stats: {
              ...prev.stats,
              harvested: prev.stats.harvested + qty,
              goldQuality: prev.stats.goldQuality + (isGold ? 1 : 0),
            },
          };
          void syncScoreToCloud(updated);
          return updated;
        });

        setToastMsg(
          `Panen ${qty} ${cDef.name}${isGold ? ' ★Kualitas Emas!' : ''}! Simpan di Keranjang / jual ke Peti Kirim.`
        );
        return;
      }

      if (tile.kind !== 'grass') {
        setToastMsg('Tidak bisa mencangkul jalan setapak!');
        return;
      }

      // Stamina guard for physical tools
      if (
        (activeTool === 'hoe' || activeTool === 'water' || activeTool === 'pick') &&
        saveState.stamina < 2
      ) {
        setToastMsg('Energi habis! Tidur di Rumah Kayu untuk memulihkan stamina.');
        playFarmSound('error', soundMuted);
        return;
      }

      if (activeTool === 'pick') {
        if (tile.debris) {
          const bonusGold = tile.debris === 'stone' ? 8 : tile.debris === 'wood' ? 6 : 4;
          playFarmSound('clear', soundMuted);
          spawnParticles(tx, ty, '#fbbf24', 7, `+${bonusGold}G`);
          setSaveState((prev) => {
            const newTiles = [...prev.tiles];
            newTiles[idx] = { ...tile, debris: null };
            return {
              ...prev,
              stamina: Math.max(0, prev.stamina - 2),
              gold: prev.gold + bonusGold,
              totalEarnedGold: prev.totalEarnedGold + bonusGold,
              tiles: newTiles,
            };
          });
          setToastMsg(`Lahan dibersihkan! Dapat +${bonusGold}G.`);
        } else if (tile.hasSprinkler) {
          setSaveState((prev) => {
            const newTiles = [...prev.tiles];
            newTiles[idx] = { ...tile, hasSprinkler: false };
            return { ...prev, sprinklerCount: prev.sprinklerCount + 1, tiles: newTiles };
          });
          setToastMsg('Sprinkler diambil kembali ke tas.');
        } else {
          setToastMsg('Tidak ada batu atau ranting di petak ini.');
        }
        return;
      }

      if (activeTool === 'hoe') {
        if (tile.debris) {
          setToastMsg('Bersihkan batu/ranting dulu dengan Beliung (Slot 3)!');
          playFarmSound('error', soundMuted);
          return;
        }
        if (tile.tilled) {
          setToastMsg('Tanah ini sudah dicangkul! Pilih benih (Slot 5) untuk menanam.');
          return;
        }
        playFarmSound('hoe', soundMuted);
        spawnParticles(tx, ty, '#92400e', 6);
        setSaveState((prev) => {
          const newTiles = [...prev.tiles];
          newTiles[idx] = { ...tile, tilled: true, watered: prev.weather === 'Hujan' };
          return { ...prev, stamina: Math.max(0, prev.stamina - 2), tiles: newTiles };
        });
        setToastMsg('Tanah siap ditanami!');
        return;
      }

      if (activeTool === 'water') {
        if (!tile.tilled) {
          setToastMsg('Cangkul tanah dulu sebelum menyiram.');
          return;
        }
        if (saveState.waterLevel <= 0) {
          setToastMsg('Air habis! Pergi ke Kolam Air untuk mengisi ulang.');
          playFarmSound('error', soundMuted);
          return;
        }
        playFarmSound('water', soundMuted);
        spawnParticles(tx, ty, '#38bdf8', 8);
        setSaveState((prev) => {
          const newTiles = [...prev.tiles];
          newTiles[idx] = { ...tile, watered: true };
          return {
            ...prev,
            stamina: Math.max(0, prev.stamina - 2),
            waterLevel: Math.max(0, prev.waterLevel - 1),
            tiles: newTiles,
          };
        });
        return;
      }

      if (activeTool === 'seed') {
        const cDef = CROPS[selectedSeed];
        if ((saveState.seeds[selectedSeed] || 0) <= 0) {
          setToastMsg(`Benih ${cDef.name} habis! Beli lagi di Toko Desa.`);
          playFarmSound('error', soundMuted);
          return;
        }
        if (!tile.tilled || tile.crop || tile.hasSprinkler) {
          setToastMsg('Harus ditanam di tanah yang sudah dicangkul dan kosong!');
          playFarmSound('error', soundMuted);
          return;
        }
        playFarmSound('plant', soundMuted);
        spawnParticles(tx, ty, '#4ade80', 6, cDef.emoji);
        setSaveState((prev) => {
          const newTiles = [...prev.tiles];
          newTiles[idx] = {
            ...tile,
            crop: { id: selectedSeed, age: 0, ready: false },
          };
          return {
            ...prev,
            seeds: { ...prev.seeds, [selectedSeed]: (prev.seeds[selectedSeed] || 1) - 1 },
            stats: { ...prev.stats, planted: prev.stats.planted + 1 },
            tiles: newTiles,
          };
        });
        setToastMsg(`Menanam ${cDef.name}! Jangan lupa disiram tiap hari.`);
        return;
      }

      if (activeTool === 'fertilizer') {
        if (saveState.fertilizerCount <= 0) {
          setToastMsg('Pupuk Subur habis! Beli di Toko Desa.');
          return;
        }
        if (!tile.tilled || tile.fertilized) {
          setToastMsg('Pupuk hanya bisa ditebar di petak tanah cangkul yang belum dipupuk.');
          return;
        }
        playFarmSound('plant', soundMuted);
        spawnParticles(tx, ty, '#fde047', 8, '✨');
        setSaveState((prev) => {
          const newTiles = [...prev.tiles];
          newTiles[idx] = { ...tile, fertilized: true };
          return {
            ...prev,
            fertilizerCount: prev.fertilizerCount - 1,
            tiles: newTiles,
          };
        });
        setToastMsg('Pupuk Subur ditaburkan! Peluang panen Kualitas Emas meningkat!');
        return;
      }

      if (activeTool === 'sprinkler') {
        if (saveState.sprinklerCount <= 0) {
          setToastMsg('Kamu belum punya Sprinkler! Beli di Toko Desa (350G).');
          return;
        }
        if (tile.debris || tile.crop || tile.hasSprinkler) {
          setToastMsg('Pasang Sprinkler di petak kosong yang bersih.');
          return;
        }
        playFarmSound('water', soundMuted);
        spawnParticles(tx, ty, '#38bdf8', 10, '💦');
        setSaveState((prev) => {
          const newTiles = [...prev.tiles];
          newTiles[idx] = { ...tile, hasSprinkler: true, tilled: false, watered: false };
          return {
            ...prev,
            sprinklerCount: prev.sprinklerCount - 1,
            stats: { ...prev.stats, sprinklersPlaced: prev.stats.sprinklersPlaced + 1 },
            tiles: newTiles,
          };
        });
        setToastMsg('Sprinkler terpasang! 4 petak di sekitarnya tersiram otomatis setiap pagi.');
      }
    },
    [
      saveState.tiles,
      saveState.stamina,
      saveState.waterLevel,
      saveState.seeds,
      saveState.fertilizerCount,
      saveState.sprinklerCount,
      activeTool,
      selectedSeed,
      soundMuted,
      handleSleepNextDay,
      spawnParticles,
      syncScoreToCloud,
    ]
  );

  // Trigger action on tile directly in front of farmer
  const triggerFacingAction = useCallback(() => {
    const p = playerRef.current;
    const fx = Math.floor(p.x + (p.dir === 0 ? 0.85 : p.dir === 2 ? -0.85 : 0));
    const fy = Math.floor(p.y + (p.dir === 1 ? 0.85 : p.dir === 3 ? -0.85 : 0));
    interactAtTile(fx, fy);
  }, [interactAtTile]);

  // Keyboard Listeners (WASD / Arrows + Space/E interact + 1..7 hotbar)
  useEffect(() => {
    if (viewMode !== 'play') return;
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const k = e.key.toLowerCase();
      keysPressedRef.current[k] = true;

      if (k === ' ' || k === 'e') {
        e.preventDefault();
        if (!showShop && !showBasket && !showTutorial && !daySummary) {
          triggerFacingAction();
        }
      } else if (k === '1') setActiveTool('hoe');
      else if (k === '2') setActiveTool('water');
      else if (k === '3') setActiveTool('pick');
      else if (k === '4') setActiveTool('harvest');
      else if (k === '5') setActiveTool('seed');
      else if (k === '6') setActiveTool('fertilizer');
      else if (k === '7') setActiveTool('sprinkler');
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [viewMode, showShop, showBasket, showTutorial, daySummary, triggerFacingAction]);

  // Main 60fps 16-bit Stardew Valley Canvas Farm Renderer + Movement Loop
  useEffect(() => {
    if (viewMode !== 'play') return;
    let rafId: number;
    if (!atlasRef.current) {
      atlasRef.current = getStardewPixelAtlas();
    }

    const tileMap = new Map<string, FarmTile>();
    for (const t of saveState.tiles) {
      tileMap.set(`${t.x},${t.y}`, t);
    }

    const loop = (now: number) => {
      const keys = keysPressedRef.current;
      let vx = 0;
      let vy = 0;
      if (keys['w'] || keys['arrowup']) vy -= 1;
      if (keys['s'] || keys['arrowdown']) vy += 1;
      if (keys['a'] || keys['arrowleft']) vx -= 1;
      if (keys['d'] || keys['arrowright']) vx += 1;

      const p = playerRef.current;
      if (vx !== 0 || vy !== 0) {
        const len = Math.hypot(vx, vy);
        const speed = 0.085;
        const nx = Math.max(0.5, Math.min(GRID_COLS - 0.5, p.x + (vx / len) * speed));
        const ny = Math.max(0.5, Math.min(GRID_ROWS - 0.5, p.y + (vy / len) * speed));

        const tileAt = (cx: number, cy: number) => {
          const tx = Math.floor(cx);
          const ty = Math.floor(cy);
          return saveState.tiles[ty * GRID_COLS + tx];
        };

        const canWalk = (t?: FarmTile) => {
          if (!t) return false;
          if (t.kind === 'house' || t.kind === 'pond' || t.kind === 'shop' || t.kind === 'bin') return false;
          if (t.debris === 'stone' || t.debris === 'wood') return false;
          return true;
        };

        if (canWalk(tileAt(nx, p.y))) p.x = nx;
        if (canWalk(tileAt(p.x, ny))) p.y = ny;

        if (Math.abs(vx) >= Math.abs(vy)) p.dir = vx > 0 ? 0 : 2;
        else p.dir = vy > 0 ? 1 : 3;
        p.moving = true;
      } else {
        p.moving = false;
      }

      if (p.swingTimer > 0) p.swingTimer--;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const atlas = atlasRef.current;
      const sprites = spritesRef.current;

      if (canvas && ctx && atlas) {
        const W = canvas.width;
        const H = canvas.height;
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, W, H);

        // 1. Ground Layer (Seasonal Pixel Grass, Auto-tiled Dirt Path, Pond & Dock, Connected Tilled Soil)
        const grassSet = atlas.grass[currentSeason];
        for (const tile of saveState.tiles) {
          const px = tile.x * TILE_SIZE;
          const py = tile.y * TILE_SIZE;

          // Always draw seasonal grass base underneath so rounded transitions & buildings blend cleanly
          const gVariant = (tile.x * 7 + tile.y * 13) % grassSet.length;
          ctx.drawImage(grassSet[gVariant], px, py, TILE_SIZE, TILE_SIZE);

          if (tile.kind === 'path') {
            const pVariant = (tile.x + tile.y) % atlas.path.length;
            ctx.drawImage(atlas.path[pVariant], px, py, TILE_SIZE, TILE_SIZE);

            // Soft darker earth border where path touches grass
            const nTop = tileMap.get(`${tile.x},${tile.y - 1}`);
            const nBot = tileMap.get(`${tile.x},${tile.y + 1}`);
            const nLeft = tileMap.get(`${tile.x - 1},${tile.y}`);
            const nRight = tileMap.get(`${tile.x + 1},${tile.y}`);
            ctx.fillStyle = '#9c6835';
            if (!nTop || nTop.kind !== 'path') ctx.fillRect(px, py, TILE_SIZE, 3);
            if (!nBot || nBot.kind !== 'path') ctx.fillRect(px, py + TILE_SIZE - 3, TILE_SIZE, 3);
            if (!nLeft || nLeft.kind !== 'path') ctx.fillRect(px, py, 3, TILE_SIZE);
            if (!nRight || nRight.kind !== 'path') ctx.fillRect(px + TILE_SIZE - 3, py, 3, TILE_SIZE);
          } else if (tile.kind === 'pond') {
            // Sandy bank edge framing pond (x:1..3, y:7..9)
            const isTop = tile.y === 7;
            const isBot = tile.y === 9;
            const isLeft = tile.x === 1;
            const isRight = tile.x === 3;

            ctx.drawImage(atlas.pondWater, px, py, TILE_SIZE, TILE_SIZE);

            // Shoreline sand & dark water rim
            ctx.fillStyle = '#c89d63';
            if (isTop) ctx.fillRect(px, py, TILE_SIZE, 6);
            if (isBot) ctx.fillRect(px, py + TILE_SIZE - 5, TILE_SIZE, 5);
            if (isLeft) ctx.fillRect(px, py, 6, TILE_SIZE);
            if (isRight) ctx.fillRect(px + TILE_SIZE - 6, py, 6, TILE_SIZE);

            ctx.fillStyle = '#7cd4f8';
            if (isTop) ctx.fillRect(px + (isLeft ? 6 : 0), py + 6, TILE_SIZE - (isLeft ? 6 : 0) - (isRight ? 6 : 0), 3);

            // Animated water shimmer ripples
            const waveShift = Math.floor(Math.sin(now * 0.0035 + tile.x * 1.4 + tile.y) * 4);
            ctx.fillStyle = 'rgba(224, 247, 255, 0.72)';
            ctx.fillRect(px + 12 + waveShift, py + 18, 12, 3);
            ctx.fillRect(px + 22 - waveShift, py + 34, 9, 3);

            // Lilypads + Lotus on pond corners
            if (tile.x === 1 && tile.y === 8) {
              ctx.fillStyle = '#1b5e20';
              ctx.fillRect(px + 14, py + 16, 18, 12);
              ctx.fillStyle = '#4caf50';
              ctx.fillRect(px + 17, py + 18, 12, 8);
              ctx.fillStyle = '#f48fb1';
              ctx.fillRect(px + 20, py + 15, 6, 6);
            }
            if (tile.x === 2 && tile.y === 7) {
              // Wooden cattail reeds at top edge
              ctx.fillStyle = '#2e7d32';
              ctx.fillRect(px + 10, py + 4, 3, 12);
              ctx.fillRect(px + 16, py + 6, 3, 10);
              ctx.fillStyle = '#5d4037';
              ctx.fillRect(px + 9, py + 1, 5, 5);
            }
            if (tile.x === 3 && tile.y === 8) {
              // Rustic wooden plank dock facing the footpath!
              ctx.fillStyle = '#4a230d';
              ctx.fillRect(px + 20, py + 10, TILE_SIZE - 16, 28);
              ctx.fillStyle = '#b46931';
              ctx.fillRect(px + 22, py + 12, TILE_SIZE - 20, 7);
              ctx.fillRect(px + 22, py + 21, TILE_SIZE - 20, 7);
              ctx.fillRect(px + 22, py + 30, TILE_SIZE - 20, 6);
              ctx.fillStyle = '#6f3615';
              ctx.fillRect(px + 22, py + 12, 4, 24);
            }
          }

          // Auto-tiled Stardew Tilled Soil + Furrow Ridges
          if (tile.tilled) {
            const nT = tileMap.get(`${tile.x},${tile.y - 1}`)?.tilled;
            const nB = tileMap.get(`${tile.x},${tile.y + 1}`)?.tilled;
            const nL = tileMap.get(`${tile.x - 1},${tile.y}`)?.tilled;
            const nR = tileMap.get(`${tile.x + 1},${tile.y}`)?.tilled;

            const padT = nT ? 0 : 4;
            const padB = nB ? 0 : 4;
            const padL = nL ? 0 : 4;
            const padR = nR ? 0 : 4;

            const sx = px + padL;
            const sy = py + padT;
            const sw = TILE_SIZE - padL - padR;
            const sh = TILE_SIZE - padT - padB;

            // Dark crisp Stardew soil rim
            ctx.fillStyle = tile.watered ? '#2d1408' : '#572d14';
            ctx.fillRect(sx, sy, sw, sh);

            // Inner soil fill
            ctx.fillStyle = tile.watered ? '#4e2712' : '#a86538';
            ctx.fillRect(
              sx + (nL ? 0 : 3),
              sy + (nT ? 0 : 3),
              sw - (nL ? 0 : 3) - (nR ? 0 : 3),
              sh - (nT ? 0 : 3) - (nB ? 0 : 3)
            );

            // Horizontal/textured Stardew furrow ridges
            ctx.fillStyle = tile.watered ? '#3b1c0b' : '#854922';
            ctx.fillRect(px + 9, py + 12, TILE_SIZE - 18, 3);
            ctx.fillRect(px + 9, py + 23, TILE_SIZE - 18, 3);
            ctx.fillRect(px + 9, py + 34, TILE_SIZE - 18, 3);
            ctx.fillStyle = tile.watered ? '#68361a' : '#c07a49';
            ctx.fillRect(px + 10, py + 15, TILE_SIZE - 20, 2);
            ctx.fillRect(px + 10, py + 26, TILE_SIZE - 20, 2);

            if (tile.fertilized) {
              // Sparkling golden-green fertilizer pellets
              ctx.fillStyle = '#fde047';
              ctx.fillRect(px + 10, py + 9, 4, 4);
              ctx.fillRect(px + 33, py + 19, 4, 4);
              ctx.fillStyle = '#86efac';
              ctx.fillRect(px + 15, py + 33, 4, 4);
              ctx.fillRect(px + 30, py + 31, 3, 3);
            }
          }
        }

        // 2. Rustic Stardew Wooden Fences Framing Top & Bottom Edges
        const drawFenceSegment = (fxPx: number, fyPx: number) => {
          ctx.fillStyle = '#381908';
          ctx.fillRect(fxPx + 18, fyPx + 4, 12, 26);
          ctx.fillRect(fxPx, fyPx + 12, TILE_SIZE, 7);
          ctx.fillRect(fxPx, fyPx + 22, TILE_SIZE, 6);
          ctx.fillStyle = '#9c5624';
          ctx.fillRect(fxPx + 20, fyPx + 6, 8, 22);
          ctx.fillRect(fxPx, fyPx + 14, TILE_SIZE, 3);
          ctx.fillRect(fxPx, fyPx + 24, TILE_SIZE, 2);
          ctx.fillStyle = '#c4793c';
          ctx.fillRect(fxPx + 20, fyPx + 6, 8, 3);
        };
        for (let x = 6; x <= 11; x++) {
          drawFenceSegment(x * TILE_SIZE, 0);
        }

        // 3. Y-Sorted 2.5D Render Queue (Buildings, Trees, Crops, Scarecrow, Farmer)
        type DrawItem = { sortY: number; render: () => void };
        const queue: DrawItem[] = [];

        // Decorative Meadow Apple Trees framing orchard corners
        const treeSpots = [
          { gx: 0.45, gy: 5.5, scale: 88 },
          { gx: 15.55, gy: 5.5, scale: 88 },
          { gx: 7.4, gy: 2.35, scale: 82 },
          { gx: 10.1, gy: 2.35, scale: 82 },
        ];
        treeSpots.forEach((tr, i) => {
          const tx = tr.gx * TILE_SIZE;
          const ty = tr.gy * TILE_SIZE;
          queue.push({
            sortY: ty,
            render: () => {
              // Ground shadow
              ctx.fillStyle = 'rgba(20, 35, 12, 0.34)';
              ctx.beginPath();
              ctx.ellipse(tx, ty - 4, tr.scale * 0.36, 11, 0, 0, Math.PI * 2);
              ctx.fill();
              if (sprites.tree) {
                const sway = Math.sin(now * 0.0018 + i) * 1.2;
                const ratio = sprites.tree.width / sprites.tree.height;
                const drawH = tr.scale;
                const drawW = drawH * ratio;
                ctx.drawImage(sprites.tree, tx - drawW / 2 + sway, ty - drawH + 4, drawW, drawH);
              }
            },
          });
        });

        // Farmhouse Landmark (x:1..3, y:0..2 -> base y = 3 * TILE_SIZE)
        queue.push({
          sortY: 3 * TILE_SIZE - 2,
          render: () => {
            const hx = 1 * TILE_SIZE - 4;
            const hy = -6;
            const hw = 3 * TILE_SIZE + 8;
            const hh = 3 * TILE_SIZE + 8;
            ctx.fillStyle = 'rgba(20, 35, 12, 0.32)';
            ctx.fillRect(hx + 8, 3 * TILE_SIZE - 8, hw - 16, 10);

            if (sprites.farmhouse) {
              const ratio = sprites.farmhouse.width / sprites.farmhouse.height;
              const drawH = hh + 6;
              const drawW = drawH * ratio;
              ctx.drawImage(
                sprites.farmhouse,
                1 * TILE_SIZE + (3 * TILE_SIZE - drawW) / 2,
                3 * TILE_SIZE - drawH + 2,
                drawW,
                drawH
              );
            } else {
              ctx.fillStyle = '#92400e';
              ctx.fillRect(hx + 6, hy + 40, hw - 12, hh - 40);
            }

            // Animated Stardew pixel chimney smoke puffs
            for (let s = 0; s < 3; s++) {
              const t = ((now * 0.0005 + s * 0.33) % 1);
              const puffX = 2.95 * TILE_SIZE + Math.sin(t * 6 + s) * 6 + t * 8;
              const puffY = 18 - t * 26;
              const sz = 6 + t * 7;
              ctx.fillStyle = `rgba(255, 252, 245, ${(1 - t) * 0.6})`;
              ctx.fillRect(Math.round(puffX), Math.round(puffY), Math.round(sz), Math.round(sz * 0.8));
            }

            // Wooden Sign Plaque
            ctx.fillStyle = '#4a220c';
            ctx.fillRect(2.5 * TILE_SIZE - 34, 3 * TILE_SIZE - 10, 68, 15);
            ctx.fillStyle = '#f5d59c';
            ctx.fillRect(2.5 * TILE_SIZE - 32, 3 * TILE_SIZE - 8, 64, 11);
            ctx.fillStyle = '#3e1b08';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('RUMAH (TIDUR)', 2.5 * TILE_SIZE, 3 * TILE_SIZE + 0.5);
          },
        });

        // Shipping Bin Landmark (x:5, y:1..2)
        queue.push({
          sortY: 2.95 * TILE_SIZE,
          render: () => {
            const bx = 5.5 * TILE_SIZE;
            const by = 2.85 * TILE_SIZE;
            const bounce = basketCountRef.current > 0 ? Math.abs(Math.sin(now * 0.005)) * 2.5 : 0;
            ctx.fillStyle = 'rgba(20, 35, 12, 0.32)';
            ctx.beginPath();
            ctx.ellipse(bx, by, 22, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            if (sprites.bin) {
              const ratio = sprites.bin.width / sprites.bin.height;
              const drawH = 54;
              const drawW = drawH * ratio;
              ctx.drawImage(sprites.bin, bx - drawW / 2, by - drawH + 4 - bounce, drawW, drawH);
            }
            ctx.fillStyle = '#4a220c';
            ctx.fillRect(bx - 21, by - 4, 42, 13);
            ctx.fillStyle = '#f5d59c';
            ctx.fillRect(bx - 19, by - 2, 38, 9);
            ctx.fillStyle = '#3e1b08';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('PETI JUAL', bx, by + 5);
          },
        });

        // Village Seed Shop Landmark (x:12..14, y:0..2)
        queue.push({
          sortY: 3 * TILE_SIZE - 2,
          render: () => {
            const cx = 13.5 * TILE_SIZE;
            const by = 3 * TILE_SIZE;
            ctx.fillStyle = 'rgba(20, 35, 12, 0.32)';
            ctx.fillRect(12 * TILE_SIZE + 6, by - 8, 3 * TILE_SIZE - 12, 10);
            if (sprites.shop) {
              const ratio = sprites.shop.width / sprites.shop.height;
              const drawH = 3 * TILE_SIZE + 8;
              const drawW = drawH * ratio;
              ctx.drawImage(sprites.shop, cx - drawW / 2, by - drawH + 4, drawW, drawH);
            }
            ctx.fillStyle = '#4a220c';
            ctx.fillRect(cx - 32, by - 10, 64, 15);
            ctx.fillStyle = '#f5d59c';
            ctx.fillRect(cx - 30, by - 8, 60, 11);
            ctx.fillStyle = '#3e1b08';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('TOKO BENIH', cx, by + 0.5);
          },
        });

        // Stardew Scarecrow next to starter garden (x:5.5, y:4.6)
        queue.push({
          sortY: 4.8 * TILE_SIZE,
          render: () => {
            const scX = 5 * TILE_SIZE;
            const scY = 4 * TILE_SIZE - 10;
            ctx.fillStyle = 'rgba(20, 35, 12, 0.28)';
            ctx.beginPath();
            ctx.ellipse(scX + TILE_SIZE / 2, 4.9 * TILE_SIZE, 13, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.drawImage(atlas.scarecrow, scX + 4, scY, 40, 50);
          },
        });

        // Tile Props (Debris, Sprinklers, Pixel Crops)
        for (const tile of saveState.tiles) {
          const px = tile.x * TILE_SIZE;
          const py = tile.y * TILE_SIZE;

          if (tile.debris) {
            queue.push({
              sortY: py + TILE_SIZE - 4,
              render: () => {
                const sp =
                  tile.debris === 'stone'
                    ? atlas.stone
                    : tile.debris === 'wood'
                    ? atlas.wood
                    : atlas.weed;
                ctx.drawImage(sp, px + 3, py + 3, TILE_SIZE - 6, TILE_SIZE - 6);
              },
            });
          }

          if (tile.hasSprinkler) {
            queue.push({
              sortY: py + TILE_SIZE - 4,
              render: () => {
                ctx.drawImage(atlas.sprinkler, px + 6, py + 6, TILE_SIZE - 12, TILE_SIZE - 12);
                const pulse = Math.sin(now * 0.008 + tile.x + tile.y);
                if (pulse > 0.2) {
                  ctx.fillStyle = '#bae6fd';
                  ctx.fillRect(px + 22, py + 8, 3, 3);
                  ctx.fillRect(px + 22, py + 36, 3, 3);
                  ctx.fillRect(px + 8, py + 22, 3, 3);
                  ctx.fillRect(px + 36, py + 22, 3, 3);
                }
              },
            });
          }

          if (tile.crop) {
            const crop = tile.crop;
            const cDef = CROPS[crop.id];
            const progress = Math.min(1, crop.age / cDef.daysToGrow);
            const stageIdx = crop.ready ? 3 : progress < 0.3 ? 0 : progress < 0.65 ? 1 : 2;
            const sprite = atlas.crops[crop.id][stageIdx];
            const isTall = sprite.height > 16;

            queue.push({
              sortY: py + TILE_SIZE - 2,
              render: () => {
                const sway = crop.ready ? Math.sin(now * 0.005 + tile.x * 0.9) * 1.6 : 0;
                const bob = crop.ready ? Math.abs(Math.sin(now * 0.004 + tile.y)) * 1.5 : 0;
                const drawW = TILE_SIZE - 6;
                const drawH = isTall ? Math.round(drawW * (sprite.height / sprite.width)) : drawW;
                const drawX = Math.round(px + 3 + sway);
                const drawY = Math.round(py + TILE_SIZE - drawH - 3 - bob);

                if (crop.ready) {
                  // Subtle golden harvest aura beneath ripe Stardew crop
                  ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
                  ctx.beginPath();
                  ctx.ellipse(px + TILE_SIZE / 2, py + TILE_SIZE - 9, 15, 6, 0, 0, Math.PI * 2);
                  ctx.fill();
                }

                ctx.drawImage(sprite, drawX, drawY, drawW, drawH);

                // Sparkle glint pixel when ready to harvest
                if (crop.ready && Math.sin(now * 0.007 + tile.x * 3 + tile.y) > 0.4) {
                  ctx.fillStyle = '#fef08a';
                  ctx.fillRect(px + TILE_SIZE - 13, drawY + 2, 4, 4);
                  ctx.fillStyle = '#ffffff';
                  ctx.fillRect(px + TILE_SIZE - 12, drawY + 3, 2, 2);
                }
              },
            });
          }
        }

        // Farmer Character (AI Pixel Art Sprite + Walk Bob + Tool Swing)
        queue.push({
          sortY: p.y * TILE_SIZE + 8,
          render: () => {
            const cx = Math.round(p.x * TILE_SIZE);
            const cy = Math.round(p.y * TILE_SIZE);
            const stride = p.moving ? Math.abs(Math.sin(now * 0.016)) * 4 : 0;
            const tilt = p.moving ? Math.sin(now * 0.016) * 0.07 : 0;

            // Shadow
            ctx.fillStyle = 'rgba(15, 25, 8, 0.35)';
            ctx.beginPath();
            ctx.ellipse(cx, cy + 12, 13, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.save();
            ctx.translate(cx, cy - stride);
            ctx.rotate(tilt);

            if (sprites.farmer) {
              const drawH = 52;
              const drawW = Math.round(drawH * (sprites.farmer.width / sprites.farmer.height));
              if (p.dir === 2) {
                ctx.scale(-1, 1);
              }
              ctx.drawImage(sprites.farmer, -drawW / 2, -drawH + 14, drawW, drawH);
            } else {
              // Compact fallback until image decodes
              ctx.fillStyle = '#1d4ed8';
              ctx.fillRect(-9, -6, 18, 16);
              ctx.fillStyle = '#eab308';
              ctx.fillRect(-13, -18, 26, 7);
            }
            ctx.restore();

            // Active Tool Swing Animation
            if (p.swingTimer > 0) {
              const toolSprite = atlas.tools[activeToolRef.current];
              const prog = 1 - p.swingTimer / 12;
              const angle = (prog - 0.5) * 1.4;
              const dirSign = p.dir === 2 ? -1 : 1;
              const offX = p.dir === 0 ? 18 : p.dir === 2 ? -18 : 10;
              const offY = p.dir === 3 ? -16 : p.dir === 1 ? 6 : -4;
              ctx.save();
              ctx.translate(cx + offX, cy + offY);
              ctx.scale(dirSign, 1);
              ctx.rotate(angle);
              ctx.drawImage(toolSprite, -12, -20, 24, 24);
              ctx.restore();
            }
          },
        });

        queue.sort((a, b) => a.sortY - b.sortY);
        for (const item of queue) {
          item.render();
        }

        // 4. Stardew Red/Gold Target Selection Brackets on Tile in Front
        {
          const fx = Math.floor(p.x + (p.dir === 0 ? 0.85 : p.dir === 2 ? -0.85 : 0));
          const fy = Math.floor(p.y + (p.dir === 1 ? 0.85 : p.dir === 3 ? -0.85 : 0));
          if (fx >= 0 && fx < GRID_COLS && fy >= 0 && fy < GRID_ROWS) {
            const rx = fx * TILE_SIZE;
            const ry = fy * TILE_SIZE;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.fillRect(rx + 2, ry + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.fillStyle = '#dc2626';
            const b = 10;
            const t = 3;
            // Top-left bracket
            ctx.fillRect(rx + 2, ry + 2, b, t);
            ctx.fillRect(rx + 2, ry + 2, t, b);
            // Top-right bracket
            ctx.fillRect(rx + TILE_SIZE - 2 - b, ry + 2, b, t);
            ctx.fillRect(rx + TILE_SIZE - 2 - t, ry + 2, t, b);
            // Bottom-left bracket
            ctx.fillRect(rx + 2, ry + TILE_SIZE - 2 - t, b, t);
            ctx.fillRect(rx + 2, ry + TILE_SIZE - 2 - b, t, b);
            // Bottom-right bracket
            ctx.fillRect(rx + TILE_SIZE - 2 - b, ry + TILE_SIZE - 2 - t, b, t);
            ctx.fillRect(rx + TILE_SIZE - 2 - t, ry + TILE_SIZE - 2 - b, t, b);
          }
        }

        // 5. Pixel Particles
        particlesRef.current = particlesRef.current.filter((pt) => {
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.vy += 0.05;
          pt.life++;
          const alpha = 1 - pt.life / pt.maxLife;
          if (alpha <= 0) return false;
          ctx.globalAlpha = alpha;
          if (pt.label) {
            ctx.font = 'bold 13px monospace';
            ctx.fillStyle = '#241004';
            ctx.textAlign = 'center';
            ctx.fillText(pt.label, pt.x + 1, pt.y + 1);
            ctx.fillStyle = pt.color;
            ctx.fillText(pt.label, pt.x, pt.y);
          } else {
            ctx.fillStyle = pt.color;
            ctx.fillRect(Math.round(pt.x - 2), Math.round(pt.y - 2), 4, 4);
          }
          ctx.globalAlpha = 1;
          return true;
        });

        // 6. Pixel Rain Overlay
        if (saveState.weather === 'Hujan') {
          ctx.fillStyle = 'rgba(20, 42, 72, 0.14)';
          ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = 'rgba(186, 230, 253, 0.65)';
          for (let r = 0; r < 55; r++) {
            const rx = Math.round(((r * 97 + now * 0.2) % (W + 40)) - 20);
            const ry = Math.round((r * 61 + now * 0.48) % H);
            ctx.fillRect(rx, ry, 2, 10);
          }
        }

        // 7. Stardew Golden Hour & Twilight Lighting Tint + Lantern Glow
        if (minuteOfDay >= 960 && minuteOfDay < 1140) {
          // Warm sunset amber (16:00 - 19:00)
          const f = ((minuteOfDay - 960) / 180) * 0.18;
          ctx.fillStyle = `rgba(217, 119, 6, ${f.toFixed(2)})`;
          ctx.fillRect(0, 0, W, H);
        } else if (minuteOfDay >= 1140) {
          // Cozy evening twilight blue (19:00+)
          const f = Math.min(0.36, 0.16 + ((minuteOfDay - 1140) / 180) * 0.2);
          ctx.fillStyle = `rgba(15, 23, 52, ${f.toFixed(2)})`;
          ctx.fillRect(0, 0, W, H);
          // Warm lantern glow around house & shop
          const g1 = ctx.createRadialGradient(2.5 * TILE_SIZE, 2.3 * TILE_SIZE, 8, 2.5 * TILE_SIZE, 2.3 * TILE_SIZE, 95);
          g1.addColorStop(0, 'rgba(253, 224, 71, 0.35)');
          g1.addColorStop(1, 'rgba(253, 224, 71, 0)');
          ctx.fillStyle = g1;
          ctx.fillRect(0, 0, 5 * TILE_SIZE, 5 * TILE_SIZE);
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [viewMode, saveState.tiles, saveState.weather, currentSeason, minuteOfDay]);

  // Canvas click handler -> interact with clicked grid tile
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const gx = Math.floor(((e.clientX - rect.left) * scaleX) / TILE_SIZE);
    const gy = Math.floor(((e.clientY - rect.top) * scaleY) / TILE_SIZE);

    // Orient farmer toward clicked tile
    const dx = gx + 0.5 - playerRef.current.x;
    const dy = gy + 0.5 - playerRef.current.y;
    if (Math.abs(dx) >= Math.abs(dy)) playerRef.current.dir = dx >= 0 ? 0 : 2;
    else playerRef.current.dir = dy >= 0 ? 1 : 3;

    interactAtTile(gx, gy);
  };

  // Buy seed or farm upgrade from Shop
  const buyItem = (kind: 'seed' | 'fertilizer' | 'sprinkler', cropId?: CropId) => {
    const cost =
      kind === 'fertilizer'
        ? 25
        : kind === 'sprinkler'
        ? 350
        : cropId
        ? CROPS[cropId].seedCost
        : 0;
    if (saveState.gold < cost) {
      playFarmSound('error', soundMuted);
      setToastMsg('Koin tidak cukup! Panen dan jual hasil kebun terlebih dahulu.');
      return;
    }
    playFarmSound('coin', soundMuted);
    setSaveState((prev) => {
      if (kind === 'fertilizer') {
        return { ...prev, gold: prev.gold - cost, fertilizerCount: prev.fertilizerCount + 1 };
      }
      if (kind === 'sprinkler') {
        return { ...prev, gold: prev.gold - cost, sprinklerCount: prev.sprinklerCount + 1 };
      }
      if (cropId) {
        return {
          ...prev,
          gold: prev.gold - cost,
          seeds: { ...prev.seeds, [cropId]: (prev.seeds[cropId] || 0) + 1 },
        };
      }
      return prev;
    });
  };

  // Sell all items in basket immediately at Shipping Bin
  const shipAllBasket = () => {
    const entries = Object.values(saveState.harvestBasket);
    if (entries.length === 0) return;
    let gained = 0;
    entries.forEach((e) => {
      const base = CROPS[e.cropId].sellPrice;
      const unit = e.quality === 'gold' ? Math.round(base * 1.5) : base;
      gained += unit * e.qty;
    });
    playFarmSound('coin', soundMuted);
    setSaveState((prev) => {
      const updated: FarmSaveState = {
        ...prev,
        gold: prev.gold + gained,
        totalEarnedGold: prev.totalEarnedGold + gained,
        harvestBasket: {},
      };
      void syncScoreToCloud(updated);
      return updated;
    });
    setToastMsg(`Semua panen terjual! +${gained}G masuk ke dompet kebun.`);
    setShowBasket(false);
  };

  // Claim quest reward
  const claimQuest = (q: QuestDef) => {
    if (saveState.claimedQuests.includes(q.id)) return;
    playFarmSound('harvest', soundMuted);
    setSaveState((prev) => {
      const updated: FarmSaveState = {
        ...prev,
        gold: prev.gold + q.rewardGold,
        totalEarnedGold: prev.totalEarnedGold + q.rewardGold,
        claimedQuests: [...prev.claimedQuests, q.id],
      };
      void syncScoreToCloud(updated);
      return updated;
    });
    setToastMsg(`Misi "${q.title}" selesai! Hadiah +${q.rewardGold}G!`);
  };

  const getQuestProgress = (q: QuestDef) => {
    if (q.type === 'plant_total') return saveState.stats.planted;
    if (q.type === 'harvest_total') return saveState.stats.harvested;
    if (q.type === 'gold_quality') return saveState.stats.goldQuality;
    if (q.type === 'sprinkler_placed') return saveState.stats.sprinklersPlaced;
    return saveState.totalEarnedGold;
  };

  const basketTotalCount = useMemo(
    () => Object.values(saveState.harvestBasket).reduce((s, x) => s + x.qty, 0),
    [saveState.harvestBasket]
  );

  const formattedClock = `${String(Math.floor(minuteOfDay / 60)).padStart(2, '0')}:${String(
    minuteOfDay % 60
  ).padStart(2, '0')}`;

  const resetFarmCompletely = () => {
    const fresh = createInitialSave();
    setSaveState(fresh);
    setConfirmReset(false);
    playerRef.current = { x: 4.5, y: 4.5, dir: 1, moving: false, swingTimer: 0 };
    setMinuteOfDay(360);
    setViewMode('play');
    setToastMsg('Kebun baru dimulai! Selamat berkebun di Hari ke-1.');
  };

  // ================= VIEW 1: COZY TITLE MENU AWAL =================
  if (viewMode === 'menu') {
    const studentFirstName = currentStudent?.nama ? String(currentStudent.nama).split(' ')[0] : 'Petani Muda';
    return (
      <div className="w-full h-full flex items-center justify-center max-w-6xl mx-auto text-slate-100 overflow-y-auto custom-scrollbar p-1 sm:p-2">
        <div className="w-full bg-slate-900/95 border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Hero Artwork (7 cols) */}
          <div className="lg:col-span-7 relative min-h-[260px] sm:min-h-[340px] lg:min-h-[460px] bg-gradient-to-br from-amber-950 via-emerald-950 to-slate-950 overflow-hidden flex flex-col justify-end p-5 sm:p-7">
            <img
              src={gameBerkebunBg}
              alt="Ilustrasi Kebun Stardew Valley Berkebun"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 to-transparent" />

            <div className="relative z-10 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 flex-wrap">
                <span>Simulasi Pertanian & Ekonomi</span>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span>4 Musim</span>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span>Toko Desa & Sprinkler</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight drop-shadow">
                Berkebun
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed">
                Bangun kebun impianmu! Cangkul tanah subur, tanam bibit musiman, siram setiap hari, pasang sprinkler otomatis, dan raih keuntungan tertinggi!
              </p>

              {hasExistingProgress && (
                <div className="flex items-center gap-4 pt-1 text-xs font-bold text-amber-200 tabular-nums flex-wrap">
                  <span>Hari {saveState.day} ({currentSeason})</span>
                  <span aria-hidden="true" className="text-slate-500">·</span>
                  <span className="text-emerald-300">{saveState.gold}G Tersedia</span>
                  <span aria-hidden="true" className="text-slate-500">·</span>
                  <span className="text-sky-300">{saveState.stats.harvested} Total Panen</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Controls (5 cols) */}
          <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between gap-5 bg-slate-900">
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-400/70 shrink-0 shadow-lg bg-amber-950">
                <img
                  src={berkebunPortraitImg}
                  alt="Karakter Petani Kebun"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="text-xs font-bold text-amber-400">Halo, {studentFirstName}!</p>
                <h3 className="text-lg sm:text-xl font-black text-white">Menu Utama Kebun</h3>
                <p className="text-xs text-slate-400">
                  {hasExistingProgress ? `Kebun aktif di Hari ${saveState.day}` : 'Siap membuka lahan pertamamu?'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {hasExistingProgress ? (
                <>
                  <button
                    type="button"
                    onClick={() => setViewMode('play')}
                    className="w-full min-h-[52px] px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-lime-400 hover:from-emerald-300 hover:to-lime-300 text-slate-950 font-black text-sm sm:text-base flex items-center justify-between shadow-lg shadow-emerald-500/20 transition-transform active:scale-[0.98]"
                  >
                    <span className="flex items-center gap-2.5">
                      <Play size={18} className="fill-slate-950" />
                      Lanjutkan Berkebun
                    </span>
                    <span className="text-xs font-extrabold bg-slate-950/15 px-2.5 py-1 rounded-lg tabular-nums">
                      Hari {saveState.day}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-extrabold text-sm flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <RotateCcw size={17} className="text-amber-400" />
                      Mulai Kebun Baru
                    </span>
                    <span className="text-xs font-semibold text-slate-400">Reset Hari 1</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setViewMode('play')}
                  className="w-full min-h-[54px] px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-lime-400 hover:from-emerald-300 hover:to-lime-300 text-slate-950 font-black text-base flex items-center justify-between shadow-lg shadow-emerald-500/20 transition-transform active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2.5">
                    <Play size={20} className="fill-slate-950" />
                    Mulai Berkebun
                  </span>
                  <span className="text-xs font-extrabold bg-slate-950/15 px-2.5 py-1 rounded-lg">
                    Hari 1 →
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowTutorial(true)}
                className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-400/40 font-extrabold text-sm flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <BookOpen size={17} className="text-amber-400" />
                  Tutorial Berkebun
                </span>
                <span className="text-xs font-semibold text-amber-300/80">Cara Bermain</span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>WASD / Panah · Klik petak untuk aksi</span>
              <span className="font-bold text-amber-300 tabular-nums">Skor: {computeTotalScore(saveState)}</span>
            </div>
          </div>
        </div>

        {/* Confirm Reset Farm Modal */}
        {confirmReset && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
              <h3 className="font-black text-lg text-white">Mulai Kebun Baru?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Lahan kebun saat ini, koin, dan hasil panen yang belum dijual akan direset kembali ke Hari ke-1.
              </p>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={resetFarmCompletely}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs"
                >
                  Ya, Mulai Baru
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tutorial Modal */}
        {showTutorial && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-black text-lg text-white flex items-center gap-2">
                  <Sprout className="text-emerald-400" size={20} /> Panduan Bermain Berkebun
                </h3>
                <button
                  type="button"
                  onClick={() => setShowTutorial(false)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-300"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-1">
                  <p className="font-extrabold text-emerald-300">1. Bergerak & Berinteraksi</p>
                  <p className="text-slate-300 leading-relaxed">
                    Gunakan tombol <strong>W A S D</strong> atau <strong>Panah</strong> untuk berjalan. Tekan <strong>Spasi / E</strong> atau langsung <strong>klik petak tanah</strong> di sekitar karakter untuk beraksi!
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-1">
                  <p className="font-extrabold text-amber-300">2. Urutan Bertani</p>
                  <p className="text-slate-300 leading-relaxed">
                    Bersihkan batu/kayu dengan <strong>Beliung (3)</strong>, gemburkan tanah dengan <strong>Cangkul (1)</strong>, tanam <strong>Benih (5)</strong>, lalu siram pakai <strong>Penyiram (2)</strong>.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-1">
                  <p className="font-extrabold text-sky-300">3. Kolam, Rumah & Toko Desa</p>
                  <p className="text-slate-300 leading-relaxed">
                    Isi ulang air di <strong>Kolam Biru</strong>, belanja bibit & Sprinkler di <strong>Toko Benih</strong>, jual panen di <strong>Peti Jual</strong>, lalu tidur di <strong>Rumah Kayu</strong> untuk lanjut ke hari berikutnya!
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-1">
                  <p className="font-extrabold text-rose-300">4. Sprinkler & Pupuk Emas</p>
                  <p className="text-slate-300 leading-relaxed">
                    <strong>Pupuk (6)</strong> meningkatkan peluang panen Kualitas Emas (+50% harga). <strong>Sprinkler (7)</strong> menyiram 4 petak sekitarnya otomatis setiap pagi!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTutorial(false)}
                className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black rounded-2xl text-sm"
              >
                Mengerti, Mulai Berkebun!
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================= VIEW 2: ACTIVE STARDEW VALLEY FARM WORLD =================
  const totalScore = computeTotalScore(saveState);

  return (
    <div className="w-full h-full flex flex-col gap-2 max-w-7xl mx-auto text-[#3b1a07] overflow-hidden select-none">
      {/* Top Stardew Wooden HUD Bar */}
      <div className="bg-[#f5d59c] border-[3px] border-[#6f3615] ring-2 ring-[#d98a42] rounded-2xl px-3 py-1.5 flex items-center justify-between gap-2 flex-wrap shrink-0 shadow-lg">
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setViewMode('menu')}
            className="px-3 py-1.5 rounded-xl bg-[#8c4a1c] hover:bg-[#a45722] text-[#fff3d6] text-xs font-black border-2 border-[#4a220c] shadow-sm transition-colors"
          >
            Menu Awal
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#ffecc7] border-2 border-[#b97336] text-xs font-black text-[#4a220c] tabular-nums">
            {saveState.weather === 'Hujan' ? (
              <CloudRain size={15} className="text-sky-600" />
            ) : (
              <Sun size={15} className="text-amber-600" />
            )}
            <span>Hari {saveState.day} · {currentSeason}</span>
            <span aria-hidden="true" className="text-[#b97336]">|</span>
            <span className="font-mono text-[#6f3615]">{formattedClock}</span>
          </div>

          <span className="px-3 py-1 rounded-xl bg-[#ffdf8e] border-2 border-[#b7791f] text-[#744210] font-black text-xs flex items-center gap-1 tabular-nums shadow-inner">
            <Coins size={14} className="text-amber-700" /> {saveState.gold} G
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap text-xs font-black tabular-nums">
          <span className="px-2.5 py-1 rounded-xl bg-[#dcfce7] border-2 border-[#2f855a] text-[#14532d] flex items-center gap-1">
            <Zap size={13} className="text-emerald-700" /> {saveState.stamina}/100
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-[#e0f2fe] border-2 border-[#0369a1] text-[#0c4a6e] flex items-center gap-1">
            <Droplets size={13} className="text-sky-700" /> {saveState.waterLevel}/20
          </span>
          <span className="hidden sm:inline-flex px-2.5 py-1 rounded-xl bg-[#ffecc7] border-2 border-[#b97336] text-[#5c2c0e] items-center gap-1">
            <Trophy size={13} className="text-amber-700" /> {totalScore}
          </span>

          <button
            type="button"
            onClick={() => setShowShop(true)}
            className="px-3 py-1.5 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white border-2 border-[#78350f] font-black flex items-center gap-1 shadow-sm"
          >
            <ShoppingBag size={13} /> Toko
          </button>

          <button
            type="button"
            onClick={() => setShowBasket(true)}
            className="px-3 py-1.5 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white border-2 border-[#312e81] font-black flex items-center gap-1 shadow-sm"
          >
            <Package size={13} /> Panen ({basketTotalCount})
          </button>

          <button
            type="button"
            onClick={handleSleepNextDay}
            className="px-3 py-1.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white border-2 border-[#14532d] font-black flex items-center gap-1 shadow-sm"
            title="Tidur & Lanjut Hari Berikutnya"
          >
            <Moon size={13} /> Tidur
          </button>

          <button
            type="button"
            onClick={() => setSoundMuted((m) => !m)}
            className="p-1.5 rounded-xl bg-[#8c4a1c] hover:bg-[#a45722] text-[#fff3d6] border-2 border-[#4a220c]"
            title={soundMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
          >
            {soundMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      </div>

      {/* Main Split Area: Left Stardew Farm Canvas + Right Bulletin & Seed Bag */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 overflow-y-auto lg:overflow-hidden custom-scrollbar">
        {/* Farm Canvas Area (8 cols) */}
        <div className="lg:col-span-8 bg-[#6f3615] border-[3px] border-[#421c07] ring-2 ring-[#c87c38] rounded-2xl p-2 flex flex-col gap-2 min-h-[300px] lg:min-h-0 relative overflow-hidden shadow-xl">
          <div className="px-3 py-1 rounded-xl bg-[#f5d59c] border-2 border-[#8c4a1c] text-xs font-extrabold text-[#3b1a07] flex items-center justify-between gap-2 shrink-0">
            <span className="truncate">{toastMsg}</span>
            <span className="text-[11px] text-[#7a3f1a] hidden sm:inline shrink-0 font-bold">
              Klik petak atau Spasi untuk aksi
            </span>
          </div>

          <div className="flex-1 min-h-0 flex items-center justify-center bg-[#28421b] rounded-xl border-2 border-[#421c07] overflow-hidden relative shadow-inner">
            <canvas
              ref={canvasRef}
              width={GRID_COLS * TILE_SIZE}
              height={GRID_ROWS * TILE_SIZE}
              onClick={handleCanvasClick}
              style={{ imageRendering: 'pixelated' }}
              className="w-full h-full object-contain cursor-pointer"
            />

            {/* Mobile Touch D-Pad + Action Button */}
            <div className="lg:hidden absolute bottom-2 left-2 flex items-center gap-1 bg-[#4a220c]/85 backdrop-blur-sm p-1.5 rounded-2xl border-2 border-[#d98a42]">
              <div className="grid grid-cols-3 gap-1 w-24">
                <span />
                <button
                  type="button"
                  onPointerDown={() => (keysPressedRef.current['w'] = true)}
                  onPointerUp={() => (keysPressedRef.current['w'] = false)}
                  onPointerLeave={() => (keysPressedRef.current['w'] = false)}
                  className="h-7 rounded bg-[#f5d59c] text-[#3b1a07] flex items-center justify-center border border-[#8c4a1c]"
                >
                  <ChevronUp size={14} />
                </button>
                <span />
                <button
                  type="button"
                  onPointerDown={() => (keysPressedRef.current['a'] = true)}
                  onPointerUp={() => (keysPressedRef.current['a'] = false)}
                  onPointerLeave={() => (keysPressedRef.current['a'] = false)}
                  className="h-7 rounded bg-[#f5d59c] text-[#3b1a07] flex items-center justify-center border border-[#8c4a1c]"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onPointerDown={() => (keysPressedRef.current['s'] = true)}
                  onPointerUp={() => (keysPressedRef.current['s'] = false)}
                  onPointerLeave={() => (keysPressedRef.current['s'] = false)}
                  className="h-7 rounded bg-[#f5d59c] text-[#3b1a07] flex items-center justify-center border border-[#8c4a1c]"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  type="button"
                  onPointerDown={() => (keysPressedRef.current['d'] = true)}
                  onPointerUp={() => (keysPressedRef.current['d'] = false)}
                  onPointerLeave={() => (keysPressedRef.current['d'] = false)}
                  className="h-7 rounded bg-[#f5d59c] text-[#3b1a07] flex items-center justify-center border border-[#8c4a1c]"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
              <button
                type="button"
                onClick={triggerFacingAction}
                className="px-3 py-3 rounded-xl bg-emerald-500 text-white border-2 border-emerald-800 font-black text-xs"
              >
                Aksi
              </button>
            </div>
          </div>

          {/* Bottom Stardew Wooden Tool Hotbar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 shrink-0 custom-scrollbar bg-[#8c4a1c] p-1.5 rounded-xl border-2 border-[#421c07]">
            {(
              [
                { id: 'hoe', keyNum: '1', label: 'Cangkul' },
                { id: 'water', keyNum: '2', label: `Siram (${saveState.waterLevel})` },
                { id: 'pick', keyNum: '3', label: 'Beliung' },
                { id: 'harvest', keyNum: '4', label: 'Panen' },
                {
                  id: 'seed',
                  keyNum: '5',
                  label: `Benih (${saveState.seeds[selectedSeed] || 0})`,
                  cropId: selectedSeed,
                },
                { id: 'fertilizer', keyNum: '6', label: `Pupuk (${saveState.fertilizerCount})` },
                { id: 'sprinkler', keyNum: '7', label: `Sprinkler (${saveState.sprinklerCount})` },
              ] as Array<{ id: ToolMode; keyNum: string; label: string; cropId?: CropId }>
            ).map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => setActiveTool(tool.id)}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg border-2 text-xs font-black flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all',
                  activeTool === tool.id
                    ? 'bg-[#ffeaa7] text-[#3b1a07] border-[#dc2626] ring-2 ring-[#facc15] shadow-md -translate-y-0.5'
                    : 'bg-[#f1cb8f] text-[#4a220c] border-[#5c2c0e] hover:bg-[#ffe1b0]'
                )}
              >
                <span className="font-mono text-[10px] text-[#7a3f1a]">[{tool.keyNum}]</span>
                <img
                  src={tool.cropId ? getPixelCropDataUrl(tool.cropId) : getPixelToolDataUrl(tool.id)}
                  alt={tool.label}
                  style={{ imageRendering: 'pixelated' }}
                  className="w-5 h-5 object-contain shrink-0"
                />
                <span>{tool.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel: Stardew Seed Pouch & Community Bulletin Board (4 cols) */}
        <div className="lg:col-span-4 bg-[#f5d59c] border-[3px] border-[#6f3615] ring-2 ring-[#d98a42] rounded-2xl p-3 flex flex-col gap-3 min-h-[260px] lg:min-h-0 overflow-hidden shadow-xl">
          {/* Active Seed Picker */}
          <div className="space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs font-black text-[#4a220c]">
              <span>Tas Benih Musiman</span>
              <button
                type="button"
                onClick={() => setShowShop(true)}
                className="text-[#b45309] hover:underline font-black"
              >
                + Beli Benih
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(CROPS) as CropId[]).map((cid) => {
                const c = CROPS[cid];
                const qty = saveState.seeds[cid] || 0;
                const isSel = selectedSeed === cid && activeTool === 'seed';
                return (
                  <button
                    key={cid}
                    type="button"
                    onClick={() => {
                      setSelectedSeed(cid);
                      setActiveTool('seed');
                    }}
                    className={cn(
                      'p-2 rounded-xl border-2 text-left text-xs transition-all flex items-center justify-between gap-1.5',
                      isSel
                        ? 'bg-[#dcfce7] border-[#15803d] text-[#14532d] ring-2 ring-[#4ade80]'
                        : 'bg-[#ffecc7] border-[#b97336] text-[#4a220c] hover:bg-[#fff4dc]'
                    )}
                  >
                    <span className="truncate font-black flex items-center gap-1.5">
                      <img
                        src={getPixelCropDataUrl(cid)}
                        alt={c.name}
                        style={{ imageRendering: 'pixelated' }}
                        className="w-5 h-5 object-contain shrink-0"
                      />
                      {c.name.split(' ')[0]}
                    </span>
                    <span className="font-mono font-black text-[#92400e] tabular-nums shrink-0">
                      x{qty}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Community Quests Board */}
          <div className="flex-1 min-h-0 flex flex-col gap-2 pt-2 border-t-2 border-[#c88d4f] overflow-hidden">
            <div className="flex items-center justify-between text-xs font-black text-[#4a220c] shrink-0">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#b45309]" /> Misi Papan Desa
              </span>
              <span className="text-[11px] text-[#7a3f1a] font-bold tabular-nums">
                {saveState.claimedQuests.length}/{QUESTS.length} Selesai
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {QUESTS.map((q) => {
                const claimed = saveState.claimedQuests.includes(q.id);
                const prog = Math.min(q.target, getQuestProgress(q));
                const ready = prog >= q.target && !claimed;

                return (
                  <div
                    key={q.id}
                    className={cn(
                      'p-2.5 rounded-xl border-2 text-xs space-y-1.5',
                      claimed
                        ? 'bg-[#dcfce7]/80 border-[#4ade80] opacity-75'
                        : ready
                        ? 'bg-[#fef08a] border-[#ca8a04] shadow-sm'
                        : 'bg-[#ffecc7] border-[#c88d4f]'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-[#3b1a07] truncate">{q.title}</span>
                      <span className="text-[11px] font-mono font-black text-[#92400e] shrink-0 tabular-nums">
                        {prog}/{q.target}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#5c2c0e] font-bold">
                      <span>+{q.rewardGold}G · +{q.rewardScore} Skor</span>
                      {claimed ? (
                        <span className="text-emerald-700 font-black flex items-center gap-1">
                          <CheckCircle2 size={12} /> Diklaim
                        </span>
                      ) : ready ? (
                        <button
                          type="button"
                          onClick={() => claimQuest(q)}
                          className="px-2.5 py-1 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white font-black border border-[#14532d]"
                        >
                          Klaim!
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Village Seed Shop Modal (Pierre's Store Style) */}
      {showShop && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5d59c] border-4 border-[#6f3615] ring-2 ring-[#d98a42] rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar text-[#3b1a07]">
            <div className="flex items-center justify-between border-b-2 border-[#c88d4f] pb-3">
              <div>
                <h3 className="font-black text-lg text-[#3b1a07] flex items-center gap-2">
                  <ShoppingBag className="text-[#b45309]" size={20} /> Toko Benih & Alat Desa
                </h3>
                <p className="text-xs text-[#7a3f1a] font-black tabular-nums">
                  Koin Kamu: {saveState.gold} G · Musim Sekarang: {currentSeason}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowShop(false)}
                className="p-2 rounded-xl bg-[#8c4a1c] text-[#fff3d6] border border-[#4a220c]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {(Object.keys(CROPS) as CropId[]).map((cid) => {
                const c = CROPS[cid];
                return (
                  <div
                    key={cid}
                    className="p-3 rounded-2xl bg-[#ffecc7] border-2 border-[#b97336] flex flex-col justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-[#3b1a07] flex items-center gap-1.5">
                          <img
                            src={getPixelCropDataUrl(cid)}
                            alt={c.name}
                            style={{ imageRendering: 'pixelated' }}
                            className="w-6 h-6 object-contain"
                          />
                          {c.name}
                        </span>
                        <span className="text-[#92400e] font-black tabular-nums">
                          {c.seedCost} G
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5c2c0e] font-medium">{c.desc}</p>
                      <p className="text-[11px] text-emerald-800 font-bold tabular-nums">
                        Tumbuh {c.daysToGrow} hari · Jual {c.sellPrice} G
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={saveState.gold < c.seedCost}
                      onClick={() => buyItem('seed', cid)}
                      className="w-full py-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-40 text-white border border-[#14532d] font-black"
                    >
                      Beli 1 Benih (Dimiliki: {saveState.seeds[cid] || 0})
                    </button>
                  </div>
                );
              })}

              <div className="p-3 rounded-2xl bg-[#ffecc7] border-2 border-[#ca8a04] flex flex-col justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-[#3b1a07] flex items-center gap-1.5">
                      <img
                        src={getPixelToolDataUrl('fertilizer')}
                        alt="Pupuk Subur"
                        style={{ imageRendering: 'pixelated' }}
                        className="w-6 h-6 object-contain"
                      />
                      Pupuk Subur
                    </span>
                    <span className="text-[#92400e] font-black">25 G</span>
                  </div>
                  <p className="text-[11px] text-[#5c2c0e] font-medium">
                    Meningkatkan peluang hasil panen menjadi Kualitas Emas (+50% harga jual).
                  </p>
                </div>
                <button
                  type="button"
                  disabled={saveState.gold < 25}
                  onClick={() => buyItem('fertilizer')}
                  className="w-full py-2 rounded-xl bg-[#d97706] hover:bg-[#b45309] disabled:opacity-40 text-white border border-[#78350f] font-black"
                >
                  Beli Pupuk (Dimiliki: {saveState.fertilizerCount})
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-[#ffecc7] border-2 border-[#0284c7] flex flex-col justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-[#3b1a07] flex items-center gap-1.5">
                      <img
                        src={getPixelToolDataUrl('sprinkler')}
                        alt="Sprinkler Otomatis"
                        style={{ imageRendering: 'pixelated' }}
                        className="w-6 h-6 object-contain"
                      />
                      Sprinkler Otomatis
                    </span>
                    <span className="text-[#92400e] font-black">350 G</span>
                  </div>
                  <p className="text-[11px] text-[#5c2c0e] font-medium">
                    Menyiram 4 petak di atas, bawah, kiri, dan kanan secara otomatis tiap pagi!
                  </p>
                </div>
                <button
                  type="button"
                  disabled={saveState.gold < 350}
                  onClick={() => buyItem('sprinkler')}
                  className="w-full py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-40 text-white border border-[#075985] font-black"
                >
                  Beli Sprinkler (Dimiliki: {saveState.sprinklerCount})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Bin / Harvest Basket Modal */}
      {showBasket && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5d59c] border-4 border-[#6f3615] ring-2 ring-[#d98a42] rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl text-[#3b1a07]">
            <div className="flex items-center justify-between border-b-2 border-[#c88d4f] pb-3">
              <h3 className="font-black text-lg text-[#3b1a07] flex items-center gap-2">
                <Package className="text-[#4f46e5]" size={20} /> Keranjang & Peti Jual
              </h3>
              <button
                type="button"
                onClick={() => setShowBasket(false)}
                className="p-1.5 rounded-xl bg-[#8c4a1c] text-[#fff3d6] border border-[#4a220c]"
              >
                <X size={16} />
              </button>
            </div>

            {basketTotalCount === 0 ? (
              <p className="text-xs text-[#5c2c0e] font-bold text-center py-6">
                Keranjang panen masih kosong. Panen tanaman yang sudah matang di kebun!
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {Object.entries(saveState.harvestBasket).map(([key, item]) => {
                  const cDef = CROPS[item.cropId];
                  const unitPrice =
                    item.quality === 'gold' ? Math.round(cDef.sellPrice * 1.5) : cDef.sellPrice;
                  return (
                    <div
                      key={key}
                      className="p-3 rounded-xl bg-[#ffecc7] border-2 border-[#b97336] flex items-center justify-between text-xs"
                    >
                      <div className="font-black text-[#3b1a07] flex items-center gap-2">
                        <img
                          src={getPixelCropDataUrl(item.cropId)}
                          alt={cDef.name}
                          style={{ imageRendering: 'pixelated' }}
                          className="w-6 h-6 object-contain"
                        />
                        <span>
                          {cDef.name}{' '}
                          {item.quality === 'gold' && <span className="text-[#b45309]">★ Emas</span>}
                          <span className="text-[#7a3f1a] ml-1">x{item.qty}</span>
                        </span>
                      </div>
                      <span className="font-black text-emerald-800 tabular-nums">
                        +{unitPrice * item.qty} G
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              disabled={basketTotalCount === 0}
              onClick={shipAllBasket}
              className="w-full py-3 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-40 text-white border-2 border-[#14532d] font-black text-sm shadow-lg"
            >
              Jual Semua Hasil Panen Sekarang
            </button>
          </div>
        </div>
      )}

      {/* End-of-Day Summary Modal (Stardew Style Morning Report) */}
      {daySummary && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5d59c] border-4 border-[#6f3615] ring-2 ring-[#d98a42] rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl text-[#3b1a07]">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#6f3615] mx-auto shadow-lg">
              <img
                src={berkebunPortraitImg}
                alt="Laporan Pagi Berkebun"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-[#5c2c0e]">
                Selamat Pagi · Hari {daySummary.newDay}!
              </h3>
              <p className="text-xs font-bold text-[#7a3f1a]">
                Musim {daySummary.newSeason} · Cuaca:{' '}
                {daySummary.weather === 'Hujan'
                  ? 'Hujan (Semua tanaman tersiram otomatis!)'
                  : 'Cerah Berawan'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#ffecc7] border-2 border-[#b97336] text-xs space-y-1 tabular-nums">
              <p className="text-[#5c2c0e] font-bold">
                Hasil Panen Terkirim: <strong>{daySummary.shippedItems} item</strong>
              </p>
              <p className="text-emerald-800 font-black text-base">
                Pendapatan Semalam: +{daySummary.shippedGold} G
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDaySummary(null)}
              className="w-full py-3 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] text-white border-2 border-[#14532d] font-black text-sm shadow-md"
            >
              Mulai Aktivitas Pagi →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
