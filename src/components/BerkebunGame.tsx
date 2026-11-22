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
  Map as MapIcon,
  Hammer,
  Heart,
  MessageCircle,
  Compass,
  Gift,
  Fish,
} from 'lucide-react';
import { cn } from '../utils';
import { doc, setDoc, getDocs, query, collection, where } from 'firebase/firestore';
import { db } from '../firebase';
import gameBerkebunBg from '../assets/images/game_berkebun_bg_1795346504800.jpg';
import berkebunPortraitImg from '../assets/images/berkebun_portrait_1795346503232.jpg';
import {
  WORLD_COLS,
  WORLD_ROWS,
  TILE_SIZE,
  VIEW_W,
  VIEW_H,
  CROPS,
  BAG_ITEMS,
  CRAFT_RECIPES,
  STORY_CHAPTERS,
  NPCS,
  ISLAND_REGIONS,
  createInitialIslandGrid,
  type Season,
  type Weather,
  type CropId,
  type BagItemId,
  type NpcId,
  type FarmTile,
} from './berkebunWorldData';
import {
  loadAllStardewSprites,
  getStardewPixelAtlas,
  getPixelCropDataUrl,
  getPixelToolDataUrl,
  getPixelBagItemDataUrl,
  getPixelGoldSprinklerDataUrl,
  type StardewSprites,
  type PixelAtlas,
  type StardewToolId,
} from './berkebunPixelArt';

type ToolMode = StardewToolId;

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
  target: number;
  rewardGold: number;
  rewardScore: number;
  type: 'plant_total' | 'harvest_total' | 'gold_quality' | 'fished' | 'earned_gold';
}

const SIDE_QUESTS: QuestDef[] = [
  {
    id: 'q_plant_6',
    title: 'Tanam 6 Benih di Lembah',
    target: 6,
    rewardGold: 80,
    rewardScore: 150,
    type: 'plant_total',
  },
  {
    id: 'q_harvest_12',
    title: 'Panen 12 Hasil Kebun',
    target: 12,
    rewardGold: 180,
    rewardScore: 300,
    type: 'harvest_total',
  },
  {
    id: 'q_fish_5',
    title: 'Tangkap 5 Ikan Pulau',
    target: 5,
    rewardGold: 150,
    rewardScore: 280,
    type: 'fished',
  },
  {
    id: 'q_gold_3',
    title: 'Raih 3 Panen Kualitas Emas',
    target: 3,
    rewardGold: 220,
    rewardScore: 400,
    type: 'gold_quality',
  },
  {
    id: 'q_rich_1500',
    title: 'Kumpulkan Total 1500G',
    target: 1500,
    rewardGold: 350,
    rewardScore: 600,
    type: 'earned_gold',
  },
];

const SEASONS: Season[] = ['Semi', 'Panas', 'Gugur', 'Dingin'];

interface FarmSaveState {
  version: number;
  day: number;
  seasonIdx: number;
  weather: Weather;
  gold: number;
  totalEarnedGold: number;
  stamina: number;
  waterLevel: number;
  sprinklerCount: number;
  goldSprinklerCount: number;
  fertilizerCount: number;
  useGoldSprinklerMode?: boolean;
  storyChapter: number; // 1..5, 6 = Finale completed!
  islandHealed: boolean;
  coopEggsReady: number;
  seeds: Record<CropId, number>;
  harvestBasket: Record<string, { cropId: CropId; quality: 'normal' | 'gold'; qty: number }>;
  bagItems: Partial<Record<BagItemId, number>>;
  npcHearts: Record<NpcId, number>;
  npcTalkedToday: Partial<Record<NpcId, boolean>>;
  npcGiftedToday: Partial<Record<NpcId, boolean>>;
  stats: {
    planted: number;
    harvested: number;
    goldQuality: number;
    sprinklersPlaced: number;
    fished: number;
    oresMined: number;
    crafted: number;
  };
  claimedQuests: string[];
  tiles: FarmTile[];
}

function createInitialSave(): FarmSaveState {
  return {
    version: 2,
    day: 1,
    seasonIdx: 0,
    weather: 'Cerah',
    gold: 200,
    totalEarnedGold: 0,
    stamina: 100,
    waterLevel: 20,
    sprinklerCount: 0,
    goldSprinklerCount: 0,
    fertilizerCount: 4,
    storyChapter: 1,
    islandHealed: false,
    coopEggsReady: 1,
    seeds: {
      turnip: 6,
      potato: 3,
      strawberry: 0,
      corn: 0,
      sunflower: 0,
      pumpkin: 0,
      pineapple: 0,
      coffee: 0,
      moonfruit: 0,
    },
    harvestBasket: {},
    bagItems: {
      wood_res: 2,
      stone_res: 2,
    },
    npcHearts: {
      raka: 1,
      sari: 1,
      jaka: 0,
      maya: 0,
      bima: 0,
      lira: 0,
    },
    npcTalkedToday: {},
    npcGiftedToday: {},
    stats: {
      planted: 0,
      harvested: 0,
      goldQuality: 0,
      sprinklersPlaced: 0,
      fished: 0,
      oresMined: 0,
      crafted: 0,
    },
    claimedQuests: [],
    tiles: createInitialIslandGrid(),
  };
}

function playFarmSound(
  type: 'hoe' | 'water' | 'plant' | 'harvest' | 'coin' | 'sleep' | 'clear' | 'error' | 'story' | 'fish',
  muted: boolean
) {
  if (muted) return;
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
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'water' || type === 'fish') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'fish' ? 540 : 480, now);
      osc.frequency.exponentialRampToValueAtTime(type === 'fish' ? 880 : 720, now + 0.14);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'plant') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'harvest' || type === 'story') {
      const notes = type === 'story' ? [523, 659, 784, 1046] : [523, 659, 784];
      notes.forEach((f, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(f, now + idx * 0.08);
        g.gain.setValueAtTime(0.08, now + idx * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.22);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now + idx * 0.08);
        o.stop(now + idx * 0.08 + 0.24);
      });
      return;
    } else if (type === 'coin') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1174, now + 0.07);
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
      [392, 493.88, 587.33, 783.99].forEach((f, idx) => {
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

export default function BerkebunGame({
  isAdmin,
  currentStudent,
  onClose: _onClose,
}: {
  isAdmin: boolean;
  currentStudent: any;
  onClose: () => void;
}) {
  const storageKey = `berkebun_swarnadwipa_v2_${currentStudent?.id || (isAdmin ? 'admin' : 'guest')}`;

  const [saveState, setSaveState] = useState<FarmSaveState>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as FarmSaveState;
        if (parsed && parsed.version === 2 && Array.isArray(parsed.tiles) && parsed.tiles.length === WORLD_COLS * WORLD_ROWS) {
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
    saveState.storyChapter > 1 ||
    saveState.totalEarnedGold > 0;

  const [viewMode, setViewMode] = useState<'menu' | 'play'>('menu');
  const [showTutorial, setShowTutorial] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showBasket, setShowBasket] = useState(false);
  const [showCraft, setShowCraft] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showWorldMap, setShowWorldMap] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  // Interactive NPC Dialogue state
  const [activeNpcId, setActiveNpcId] = useState<NpcId | null>(null);
  const [dialogueText, setDialogueText] = useState<string>('');
  const [showGiftPicker, setShowGiftPicker] = useState(false);

  // Story Celebration Banner
  const [storyEventModal, setStoryEventModal] = useState<{
    title: string;
    mustika: string;
    desc: string;
    unlocked: string;
  } | null>(null);

  // Fishing Cast & Bite State
  const [fishingState, setFishingState] = useState<{
    status: 'waiting' | 'bite';
    wx: number;
    wy: number;
    zone: 'ocean' | 'fresh';
  } | null>(null);

  const [daySummary, setDaySummary] = useState<{
    newDay: number;
    newSeason: Season;
    weather: Weather;
    shippedGold: number;
    shippedItems: number;
    eggsLaid: number;
  } | null>(null);

  const [activeTool, setActiveTool] = useState<ToolMode>('hoe');
  const [selectedSeed, setSelectedSeed] = useState<CropId>('turnip');
  const [toastMsg, setToastMsg] = useState<string>(
    'Jelajahi Pulau Swarnadwipa! Cangkul, tanam, bicara dengan Tetua Raka di Desa Timur.'
  );
  const [minuteOfDay, setMinuteOfDay] = useState<number>(360);

  // Player & Smooth Camera Refs
  const playerRef = useRef({
    x: 9.5,
    y: 17.5, // Right outside Farmhouse front porch!
    dir: 1 as 0 | 1 | 2 | 3,
    moving: false,
    swingTimer: 0,
  });
  const cameraRef = useRef({
    x: Math.max(0, 9.5 * TILE_SIZE - VIEW_W / 2),
    y: Math.max(0, 17.5 * TILE_SIZE - VIEW_H / 2),
  });

  // Living roaming NPCs & Farm Chickens
  const npcRuntimeRef = useRef<
    Record<NpcId, { x: number; y: number; dir: 0 | 1 | 2 | 3; targetX: number; targetY: number; pauseTimer: number }>
  >({
    raka: { x: NPCS.raka.baseX, y: NPCS.raka.baseY, dir: 1, targetX: NPCS.raka.baseX, targetY: NPCS.raka.baseY, pauseTimer: 60 },
    sari: { x: NPCS.sari.baseX, y: NPCS.sari.baseY, dir: 1, targetX: NPCS.sari.baseX, targetY: NPCS.sari.baseY, pauseTimer: 90 },
    jaka: { x: NPCS.jaka.baseX, y: NPCS.jaka.baseY, dir: 1, targetX: NPCS.jaka.baseX, targetY: NPCS.jaka.baseY, pauseTimer: 80 },
    maya: { x: NPCS.maya.baseX, y: NPCS.maya.baseY, dir: 1, targetX: NPCS.maya.baseX, targetY: NPCS.maya.baseY, pauseTimer: 70 },
    bima: { x: NPCS.bima.baseX, y: NPCS.bima.baseY, dir: 1, targetX: NPCS.bima.baseX, targetY: NPCS.bima.baseY, pauseTimer: 85 },
    lira: { x: NPCS.lira.baseX, y: NPCS.lira.baseY, dir: 1, targetX: NPCS.lira.baseX, targetY: NPCS.lira.baseY, pauseTimer: 65 },
  });

  const chickensRef = useRef([
    { x: 13.4, y: 16.4, dir: 1, variant: 'white' as const, timer: 40 },
    { x: 14.8, y: 16.8, dir: -1, variant: 'brown' as const, timer: 70 },
    { x: 15.6, y: 16.2, dir: 1, variant: 'white' as const, timer: 95 },
  ]);

  const keysPressedRef = useRef<Record<string, boolean>>({});
  const particlesRef = useRef<Particle[]>([]);
  const particleIdRef = useRef(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const minimapRef = useRef<HTMLCanvasElement | null>(null);
  const spritesRef = useRef<StardewSprites>({
    farmer: null,
    farmhouse: null,
    shop: null,
    bin: null,
    tree: null,
    palmTree: null,
    coop: null,
    sacredTree: null,
    lighthouse: null,
    npcs: { raka: null, sari: null, jaka: null, maya: null, bima: null, lira: null },
    npcPortraits: { raka: '', sari: '', jaka: '', maya: '', bima: '', lira: '' },
  });
  const atlasRef = useRef<PixelAtlas | null>(null);

  const activeToolRef = useRef<ToolMode>(activeTool);
  activeToolRef.current = activeTool;
  const saveStateRef = useRef<FarmSaveState>(saveState);
  saveStateRef.current = saveState;
  const activeNpcRef = useRef<NpcId | null>(activeNpcId);
  activeNpcRef.current = activeNpcId;
  const fishingRef = useRef(fishingState);
  fishingRef.current = fishingState;

  const currentSeason = SEASONS[saveState.seasonIdx % SEASONS.length];

  // Preload AI pixel-art sprites & build atlas
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
      // ignore storage errors
    }
  }, [saveState, storageKey]);

  const computeTotalScore = useCallback((st: FarmSaveState) => {
    const questBonus = st.claimedQuests.reduce((sum, qid) => {
      const q = SIDE_QUESTS.find((x) => x.id === qid);
      return sum + (q?.rewardScore || 0);
    }, 0);
    const storyBonus = (st.storyChapter - 1) * 400 + (st.islandHealed ? 1500 : 0);
    const heartBonus = Object.values(st.npcHearts).reduce((s, h) => s + h * 40, 0);
    return (
      st.totalEarnedGold +
      st.stats.harvested * 25 +
      st.stats.fished * 35 +
      st.stats.crafted * 50 +
      questBonus +
      storyBonus +
      heartBonus
    );
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
            storyChapter: st.storyChapter,
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
          vy: -1.3 - Math.random() * 1.6,
          color,
          life: 0,
          maxLife: 32 + Math.floor(Math.random() * 14),
          label: i === 0 ? label : undefined,
        });
      }
    },
    []
  );

  // Check if active Story Chapter condition is met!
  const isChapterConditionMet = useCallback((st: FarmSaveState): boolean => {
    if (st.storyChapter === 1) {
      return st.stats.harvested >= 4;
    }
    if (st.storyChapter === 2) {
      const mat = (st.bagItems.wood_res || 0) + (st.bagItems.stone_res || 0);
      const forestForage = (st.bagItems.forage_mushroom || 0) + (st.bagItems.forage_berry || 0);
      return mat >= 6 && forestForage >= 2;
    }
    if (st.storyChapter === 3) {
      return st.stats.fished >= 2 && st.stats.harvested >= 10;
    }
    if (st.storyChapter === 4) {
      return st.stats.oresMined >= 3 && st.stats.crafted >= 1;
    }
    return false;
  }, []);

  // Advance story chapter when speaking to target NPC or Sacred Tree
  const advanceStoryChapter = useCallback(
    (st: FarmSaveState) => {
      const chDef = STORY_CHAPTERS.find((c) => c.chapter === st.storyChapter);
      if (!chDef) return;
      playFarmSound('story', soundMuted);
      const nextChapter = st.storyChapter + 1;
      const healed = st.storyChapter === 5 ? true : st.islandHealed;
      const updated: FarmSaveState = {
        ...st,
        storyChapter: nextChapter,
        islandHealed: healed,
        gold: st.gold + chDef.rewardGold,
        totalEarnedGold: st.totalEarnedGold + chDef.rewardGold,
        seeds: {
          ...st.seeds,
          ...(st.storyChapter === 1 ? { pineapple: (st.seeds.pineapple || 0) + 2 } : {}),
          ...(st.storyChapter === 2 ? { coffee: (st.seeds.coffee || 0) + 2 } : {}),
          ...(st.storyChapter === 5 ? { moonfruit: (st.seeds.moonfruit || 0) + 3 } : {}),
        },
      };
      setSaveState(updated);
      void syncScoreToCloud(updated);
      setStoryEventModal({
        title: `${chDef.title} Selesai!`,
        mustika: chDef.mustikaName,
        desc: `Hadiah +${chDef.rewardGold}G & +${chDef.rewardScore} Skor!`,
        unlocked: chDef.unlockHint,
      });
    },
    [soundMuted, syncScoreToCloud]
  );

  // Open Interactive NPC Dialogue
  const openNpcDialogue = useCallback(
    (npcId: NpcId) => {
      const npc = NPCS[npcId];
      const st = saveStateRef.current;
      const ch = Math.min(5, st.storyChapter);

      // First talk of the day increases friendship points gently!
      if (!st.npcTalkedToday[npcId]) {
        setSaveState((prev) => ({
          ...prev,
          npcTalkedToday: { ...prev.npcTalkedToday, [npcId]: true },
          npcHearts: {
            ...prev.npcHearts,
            [npcId]: Math.min(5, (prev.npcHearts[npcId] || 0) + (prev.day % 2 === 1 ? 1 : 0)),
          },
        }));
      }

      setActiveNpcId(npcId);
      setShowGiftPicker(false);
      setDialogueText(npc.greetingsByChapter[ch] || npc.greetingsByChapter[1]);
    },
    []
  );

  // Advance clock while exploring
  useEffect(() => {
    if (
      viewMode !== 'play' ||
      showShop ||
      showBasket ||
      showCraft ||
      showJournal ||
      showWorldMap ||
      showTutorial ||
      Boolean(activeNpcId) ||
      Boolean(storyEventModal) ||
      Boolean(daySummary)
    ) {
      return;
    }
    const id = window.setInterval(() => {
      setMinuteOfDay((m) => (m >= 1320 ? 1320 : m + 4));
    }, 2600);
    return () => window.clearInterval(id);
  }, [
    viewMode,
    showShop,
    showBasket,
    showCraft,
    showJournal,
    showWorldMap,
    showTutorial,
    activeNpcId,
    storyEventModal,
    daySummary,
  ]);

  // Fishing Bite Timer
  useEffect(() => {
    if (!fishingState || fishingState.status !== 'waiting') return;
    const delay = 1300 + Math.random() * 1400;
    const id = window.setTimeout(() => {
      playFarmSound('water', soundMuted);
      setFishingState((prev) => (prev ? { ...prev, status: 'bite' } : null));
    }, delay);
    return () => window.clearTimeout(id);
  }, [fishingState, soundMuted]);

  const reelFishingRod = useCallback(() => {
    const fs = fishingRef.current;
    if (!fs) return;
    if (fs.status === 'waiting') {
      setFishingState(null);
      setToastMsg('Ditarik terlalu cepat! Tunggu tanda "! TARIK!" muncul.');
      return;
    }

    // Bite! Catch regional fish!
    const roll = Math.random();
    let caught: BagItemId = 'fish_carp';
    if (fs.zone === 'ocean') {
      caught = roll < 0.14 ? 'fish_goldkoi' : roll < 0.42 ? 'fish_lobster' : 'fish_snapper';
    } else {
      caught = roll < 0.1 ? 'fish_goldkoi' : roll < 0.35 ? 'fish_snapper' : 'fish_carp';
    }

    playFarmSound('harvest', soundMuted);
    spawnParticles(fs.wx, fs.wy, '#38bdf8', 10, `+1 ${BAG_ITEMS[caught].name}!`);
    setFishingState(null);

    setSaveState((prev) => {
      const updated: FarmSaveState = {
        ...prev,
        stamina: Math.max(0, prev.stamina - 3),
        bagItems: { ...prev.bagItems, [caught]: (prev.bagItems[caught] || 0) + 1 },
        stats: { ...prev.stats, fished: prev.stats.fished + 1 },
      };
      void syncScoreToCloud(updated);
      return updated;
    });
    setToastMsg(`Berhasil memancing ${BAG_ITEMS[caught].name} (${BAG_ITEMS[caught].sellPrice}G)!`);
  }, [soundMuted, spawnParticles, syncScoreToCloud]);

  // Sleep & Advance Next Day (grows crops, spawns forage/ores, lays coop eggs, auto-ships basket!)
  const handleSleepNextDay = useCallback(() => {
    playFarmSound('sleep', soundMuted);
    setFishingState(null);
    setSaveState((prev) => {
      const nextDay = prev.day + 1;
      const nextSeasonIdx = Math.floor((nextDay - 1) / 10) % SEASONS.length;
      const nextSeason = SEASONS[nextSeasonIdx];
      const nextWeather: Weather = Math.random() < 0.28 ? 'Hujan' : 'Cerah';

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
        if (t.hasGoldSprinkler) {
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              if (dx !== 0 || dy !== 0) sprinklerSet.add(`${t.x + dx},${t.y + dy}`);
            }
          }
        }
      });

      const newTiles = prev.tiles.map((t) => {
        let updatedCrop = t.crop ? { ...t.crop } : null;
        if (updatedCrop) {
          const cDef = CROPS[updatedCrop.id];
          if (t.watered && !updatedCrop.ready) {
            updatedCrop.age += 1;
            if (updatedCrop.age >= cDef.daysToGrow) {
              updatedCrop.ready = true;
            }
          }
        }

        // Respawn some natural forage & mining ores gently each morning
        let nextDebris = t.debris;
        if (!nextDebris && !t.crop && !t.tilled) {
          const r = Math.random();
          if (t.kind === 'forest_floor' && r < 0.055) {
            nextDebris = r < 0.028 ? 'forage_mushroom' : 'forage_berry';
          } else if (t.kind === 'sand' && (t.y === 31 || t.y === 32) && t.x !== 28 && r < 0.04) {
            nextDebris = 'forage_shell';
          } else if (t.kind === 'plaza' && t.x >= 36 && t.x <= 49 && t.y >= 3 && t.y <= 11 && t.y !== 8 && r < 0.07) {
            nextDebris = r < 0.015 ? 'ore_star' : r < 0.038 ? 'ore_silver' : 'ore_copper';
          }
        }

        const autoWatered = nextWeather === 'Hujan' || sprinklerSet.has(`${t.x},${t.y}`);
        return {
          ...t,
          crop: updatedCrop,
          debris: nextDebris,
          watered: t.tilled ? autoWatered : false,
        };
      });

      const eggsLaid = prev.storyChapter >= 3 ? 2 : 1;
      const updated: FarmSaveState = {
        ...prev,
        day: nextDay,
        seasonIdx: nextSeasonIdx,
        weather: nextWeather,
        gold: prev.gold + shippedGold,
        totalEarnedGold: prev.totalEarnedGold + shippedGold,
        stamina: 100,
        coopEggsReady: Math.min(4, prev.coopEggsReady + eggsLaid),
        harvestBasket: {},
        npcTalkedToday: {},
        npcGiftedToday: {},
        tiles: newTiles,
      };

      setDaySummary({
        newDay: nextDay,
        newSeason: nextSeason,
        weather: nextWeather,
        shippedGold,
        shippedItems,
        eggsLaid,
      });
      void syncScoreToCloud(updated);
      return updated;
    });
    setMinuteOfDay(360);
    setToastMsg('Selamat pagi di Pulau Swarnadwipa! Energi pulih 100%.');
  }, [soundMuted, syncScoreToCloud]);

  // Interact at grid coordinate (NPC, Buildings, Crops, Mining, Foraging, Fishing)
  const interactAtTile = useCallback(
    (tx: number, ty: number) => {
      if (fishingRef.current) {
        reelFishingRod();
        return;
      }
      if (tx < 0 || tx >= WORLD_COLS || ty < 0 || ty >= WORLD_ROWS) return;

      // 1. Check nearby NPC near clicked tile first!
      const p = playerRef.current;
      for (const npcId of Object.keys(NPCS) as NpcId[]) {
        const npcPos = npcRuntimeRef.current[npcId];
        const distToClick = Math.hypot(npcPos.x - (tx + 0.5), npcPos.y - (ty + 0.5));
        const distToPlayer = Math.hypot(npcPos.x - p.x, npcPos.y - p.y);
        if (distToClick < 1.35 && distToPlayer < 3.4) {
          openNpcDialogue(npcId);
          return;
        }
      }

      const st = saveStateRef.current;
      const idx = ty * WORLD_COLS + tx;
      const tile = st.tiles[idx];
      if (!tile) return;

      const dist = Math.hypot(tx + 0.5 - p.x, ty + 0.5 - p.y);
      if (dist > 3.2) {
        setToastMsg('Terlalu jauh! Dekati objek tersebut terlebih dulu.');
        playFarmSound('error', soundMuted);
        return;
      }

      p.swingTimer = 12;

      // 2. Landmark Interactions
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
      if (tile.kind === 'workbench') {
        setShowCraft(true);
        return;
      }
      if (tile.kind === 'elder_hall') {
        openNpcDialogue('raka');
        return;
      }
      if (tile.kind === 'jaka_cabin') {
        openNpcDialogue('jaka');
        return;
      }
      if (tile.kind === 'maya_hut') {
        openNpcDialogue('maya');
        return;
      }
      if (tile.kind === 'ship' || tile.kind === 'lighthouse') {
        openNpcDialogue('bima');
        return;
      }
      if (tile.kind === 'altar') {
        openNpcDialogue('lira');
        return;
      }
      if (tile.kind === 'sacred_tree') {
        if (st.storyChapter === 5) {
          advanceStoryChapter(st);
        } else if (st.islandHealed) {
          playFarmSound('story', soundMuted);
          spawnParticles(tx, ty, '#f472b6', 14, 'Cahaya Abadi!');
          setToastMsg('Pohon Cahaya Abadi bersinar penuh berkat keempat Mustika!');
        } else {
          setToastMsg(`Pohon Cahaya Abadi menunggu 4 Mustika (Saat ini: Bab ${st.storyChapter}/5).`);
        }
        return;
      }
      if (tile.kind === 'coop') {
        if (st.coopEggsReady <= 0) {
          setToastMsg('Belum ada telur baru di Kandang Ayam. Cek lagi besok pagi!');
          return;
        }
        const qty = st.coopEggsReady;
        const isGoldEgg = st.storyChapter >= 3 && Math.random() < 0.45;
        const eggKey: BagItemId = isGoldEgg ? 'egg_gold' : 'egg_normal';
        playFarmSound('harvest', soundMuted);
        spawnParticles(tx, ty, '#facc15', 8, `+${qty} ${BAG_ITEMS[eggKey].name}!`);
        setSaveState((prev) => ({
          ...prev,
          coopEggsReady: 0,
          bagItems: { ...prev.bagItems, [eggKey]: (prev.bagItems[eggKey] || 0) + qty },
        }));
        setToastMsg(`Mengambil ${qty} ${BAG_ITEMS[eggKey].name} dari Kandang Ayam!`);
        return;
      }

      // 3. Water / Fishing Interactions
      if (tile.kind === 'pond' || tile.kind === 'river' || tile.kind === 'ocean' || tile.kind === 'well') {
        if (activeTool === 'rod' && tile.kind !== 'well') {
          if (st.stamina < 3) {
            setToastMsg('Energi terlalu rendah untuk memancing! Istirahat atau makan camilan.');
            return;
          }
          playFarmSound('water', soundMuted);
          setFishingState({
            status: 'waiting',
            wx: tx,
            wy: ty,
            zone: tile.kind === 'ocean' ? 'ocean' : 'fresh',
          });
          setToastMsg('Kail dilempar! Tunggu tanda "! TARIK!" lalu tekan Spasi atau klik air...');
          return;
        }
        setSaveState((prev) => ({ ...prev, waterLevel: 20 }));
        playFarmSound('water', soundMuted);
        spawnParticles(tx, ty, '#38bdf8', 8, 'Air Penuh!');
        setToastMsg('Penyiram diisi ulang penuh (20/20)!');
        return;
      }

      // 4. Foraging Wild Items (instant pickup regardless of tool!)
      if (
        tile.debris === 'forage_mushroom' ||
        tile.debris === 'forage_berry' ||
        tile.debris === 'forage_shell'
      ) {
        const bId = tile.debris as BagItemId;
        playFarmSound('plant', soundMuted);
        spawnParticles(tx, ty, '#4ade80', 7, `+1 ${BAG_ITEMS[bId].name}`);
        setSaveState((prev) => {
          const newTiles = [...prev.tiles];
          newTiles[idx] = { ...tile, debris: null };
          return {
            ...prev,
            bagItems: { ...prev.bagItems, [bId]: (prev.bagItems[bId] || 0) + 1 },
            tiles: newTiles,
          };
        });
        setToastMsg(`Mengumpulkan ${BAG_ITEMS[bId].name} ke dalam Tas!`);
        return;
      }

      // 5. Ready Crop Harvest
      if (tile.crop?.ready && (activeTool === 'harvest' || activeTool === 'hoe' || activeTool === 'water')) {
        const cDef = CROPS[tile.crop.id];
        const goldChance = tile.fertilized ? 0.55 : 0.2;
        const isGold = Math.random() < goldChance;
        const quality: 'normal' | 'gold' = isGold ? 'gold' : 'normal';
        let qty = 1;
        if (tile.crop.id === 'potato' && Math.random() < 0.35) qty = 2;
        const bonusSeed = tile.crop.id === 'sunflower' && Math.random() < 0.45 ? 1 : 0;

        playFarmSound('harvest', soundMuted);
        spawnParticles(tx, ty, isGold ? '#facc15' : '#4ade80', 10, `+${qty} ${cDef.name}`);

        setSaveState((prev) => {
          const newTiles = [...prev.tiles];
          if (cDef.regrowDays) {
            newTiles[idx] = {
              ...tile,
              crop: { id: tile.crop!.id, age: cDef.daysToGrow - cDef.regrowDays, ready: false },
            };
          } else {
            newTiles[idx] = { ...tile, crop: null, fertilized: false };
          }

          const bKey = `${tile.crop!.id}_${quality}`;
          const prevEntry = prev.harvestBasket[bKey];
          const nextBasket = {
            ...prev.harvestBasket,
            [bKey]: { cropId: tile.crop!.id, quality, qty: (prevEntry?.qty || 0) + qty },
          };

          const nextSeeds = { ...prev.seeds };
          if (bonusSeed > 0) nextSeeds[tile.crop!.id] = (nextSeeds[tile.crop!.id] || 0) + bonusSeed;

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

        setToastMsg(`Panen ${qty} ${cDef.name}${isGold ? ' ★ Emas' : ''}! Simpan di Keranjang.`);
        return;
      }

      // 6. Pickaxe Clearing & Mining Ores
      if (activeTool === 'pick') {
        if (st.stamina < 2) {
          setToastMsg('Energi habis! Tidur di Rumah atau makan hasil hutan/olahan.');
          playFarmSound('error', soundMuted);
          return;
        }
        if (tile.debris === 'ore_copper' || tile.debris === 'ore_silver' || tile.debris === 'ore_star') {
          const oreId = tile.debris as BagItemId;
          playFarmSound('clear', soundMuted);
          spawnParticles(tx, ty, '#c084fc', 9, `+1 ${BAG_ITEMS[oreId].name}`);
          setSaveState((prev) => {
            const newTiles = [...prev.tiles];
            newTiles[idx] = { ...tile, debris: null };
            const updated: FarmSaveState = {
              ...prev,
              stamina: Math.max(0, prev.stamina - 3),
              bagItems: { ...prev.bagItems, [oreId]: (prev.bagItems[oreId] || 0) + 1 },
              stats: { ...prev.stats, oresMined: prev.stats.oresMined + 1 },
              tiles: newTiles,
            };
            void syncScoreToCloud(updated);
            return updated;
          });
          setToastMsg(`Menambang ${BAG_ITEMS[oreId].name}!`);
          return;
        }
        if (tile.debris === 'stone' || tile.debris === 'wood' || tile.debris === 'weed') {
          const bagGain: BagItemId | null =
            tile.debris === 'stone' ? 'stone_res' : tile.debris === 'wood' ? 'wood_res' : null;
          const bonusGold = tile.debris === 'weed' ? 6 : 4;
          playFarmSound('clear', soundMuted);
          spawnParticles(
            tx,
            ty,
            '#fbbf24',
            7,
            bagGain ? `+1 ${BAG_ITEMS[bagGain].name}` : `+${bonusGold}G`
          );
          setSaveState((prev) => {
            const newTiles = [...prev.tiles];
            newTiles[idx] = { ...tile, debris: null };
            return {
              ...prev,
              stamina: Math.max(0, prev.stamina - 2),
              gold: prev.gold + bonusGold,
              totalEarnedGold: prev.totalEarnedGold + bonusGold,
              bagItems: bagGain
                ? { ...prev.bagItems, [bagGain]: (prev.bagItems[bagGain] || 0) + 1 }
                : prev.bagItems,
              tiles: newTiles,
            };
          });
          setToastMsg(bagGain ? `Mendapat ${BAG_ITEMS[bagGain].name} + ${bonusGold}G!` : 'Gulma dibersihkan!');
          return;
        }
        if (tile.hasSprinkler || tile.hasGoldSprinkler) {
          const wasGold = Boolean(tile.hasGoldSprinkler);
          setSaveState((prev) => {
            const newTiles = [...prev.tiles];
            newTiles[idx] = { ...tile, hasSprinkler: false, hasGoldSprinkler: false };
            return {
              ...prev,
              sprinklerCount: prev.sprinklerCount + (wasGold ? 0 : 1),
              goldSprinklerCount: prev.goldSprinklerCount + (wasGold ? 1 : 0),
              tiles: newTiles,
            };
          });
          setToastMsg('Sprinkler diambil kembali ke tas.');
          return;
        }
        setToastMsg('Tidak ada batu, kayu, atau bijih di petak ini.');
        return;
      }

      // 7. Soil Farming (Allowed only on grass inside Homestead / grass meadows without obstacles)
      if (tile.kind !== 'grass') {
        setToastMsg('Lahan ini tidak bisa dicangkul! Berkebunlah di padang rumput hijau.');
        return;
      }
      if (st.stamina < 2 && (activeTool === 'hoe' || activeTool === 'water')) {
        setToastMsg('Energi habis! Tidur di Rumah atau konsumsi Jamu/Buah di Tas [C].');
        playFarmSound('error', soundMuted);
        return;
      }

      if (activeTool === 'hoe') {
        if (tile.debris) {
          setToastMsg('Bersihkan rintangan dulu dengan Beliung (Slot 3)!');
          playFarmSound('error', soundMuted);
          return;
        }
        if (tile.tilled) {
          setToastMsg('Tanah sudah siap ditanami! Pilih Benih (Slot 5).');
          return;
        }
        playFarmSound('hoe', soundMuted);
        spawnParticles(tx, ty, '#92400e', 6);
        setSaveState((prev) => {
          const newTiles = [...prev.tiles];
          newTiles[idx] = { ...tile, tilled: true, watered: prev.weather === 'Hujan' };
          return { ...prev, stamina: Math.max(0, prev.stamina - 2), tiles: newTiles };
        });
        setToastMsg('Tanah digemburkan!');
        return;
      }

      if (activeTool === 'water') {
        if (!tile.tilled) {
          setToastMsg('Cangkul tanah dulu sebelum menyiram.');
          return;
        }
        if (st.waterLevel <= 0) {
          setToastMsg('Air habis! Isi ulang di Kolam, Sumur Desa, atau Sungai.');
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
        if ((st.seeds[selectedSeed] || 0) <= 0) {
          setToastMsg(`Benih ${cDef.name} habis! Beli lagi di Toko Mbak Sari.`);
          playFarmSound('error', soundMuted);
          return;
        }
        if (!tile.tilled || tile.crop || tile.hasSprinkler || tile.hasGoldSprinkler) {
          setToastMsg('Tanam di tanah cangkul yang masih kosong!');
          playFarmSound('error', soundMuted);
          return;
        }
        playFarmSound('plant', soundMuted);
        spawnParticles(tx, ty, '#4ade80', 6);
        setSaveState((prev) => {
          const newTiles = [...prev.tiles];
          newTiles[idx] = { ...tile, crop: { id: selectedSeed, age: 0, ready: false } };
          return {
            ...prev,
            seeds: { ...prev.seeds, [selectedSeed]: (prev.seeds[selectedSeed] || 1) - 1 },
            stats: { ...prev.stats, planted: prev.stats.planted + 1 },
            tiles: newTiles,
          };
        });
        setToastMsg(`Menanam ${cDef.name}! Siram tiap hari agar tumbuh subur.`);
        return;
      }

      if (activeTool === 'fertilizer') {
        if (st.fertilizerCount <= 0) {
          setToastMsg('Pupuk Subur habis! Beli di Toko atau buat di Meja Kerajinan.');
          return;
        }
        if (!tile.tilled || tile.fertilized) {
          setToastMsg('Gunakan Pupuk pada tanah cangkul yang belum dipupuk.');
          return;
        }
        playFarmSound('plant', soundMuted);
        spawnParticles(tx, ty, '#fde047', 8, 'Pupuk Emas!');
        setSaveState((prev) => {
          const newTiles = [...prev.tiles];
          newTiles[idx] = { ...tile, fertilized: true };
          return { ...prev, fertilizerCount: prev.fertilizerCount - 1, tiles: newTiles };
        });
        setToastMsg('Pupuk ditaburkan! Peluang Kualitas Emas meningkat!');
        return;
      }

      if (activeTool === 'sprinkler') {
        const useGold = st.useGoldSprinklerMode && st.goldSprinklerCount > 0;
        const avail = useGold ? st.goldSprinklerCount : st.sprinklerCount;
        if (avail <= 0) {
          setToastMsg('Sprinkler habis! Beli di Toko atau rakit di Meja Kerajinan [C].');
          return;
        }
        if (tile.debris || tile.crop || tile.hasSprinkler || tile.hasGoldSprinkler) {
          setToastMsg('Pasang Sprinkler di petak rumput kosong.');
          return;
        }
        playFarmSound('water', soundMuted);
        spawnParticles(tx, ty, useGold ? '#facc15' : '#38bdf8', 10);
        setSaveState((prev) => {
          const newTiles = [...prev.tiles];
          newTiles[idx] = {
            ...tile,
            hasSprinkler: !useGold,
            hasGoldSprinkler: useGold,
            tilled: false,
            watered: false,
          };
          return {
            ...prev,
            sprinklerCount: prev.sprinklerCount - (useGold ? 0 : 1),
            goldSprinklerCount: prev.goldSprinklerCount - (useGold ? 1 : 0),
            stats: { ...prev.stats, sprinklersPlaced: prev.stats.sprinklersPlaced + 1 },
            tiles: newTiles,
          };
        });
        setToastMsg(
          useGold
            ? 'Sprinkler Emas terpasang! Menyiram 8 petak di sekelilingnya tiap pagi.'
            : 'Sprinkler terpasang! Menyiram 4 petak di sekitarnya tiap pagi.'
        );
      }
    },
    [
      activeTool,
      selectedSeed,
      soundMuted,
      handleSleepNextDay,
      openNpcDialogue,
      advanceStoryChapter,
      reelFishingRod,
      spawnParticles,
      syncScoreToCloud,
    ]
  );

  const triggerFacingAction = useCallback(() => {
    if (fishingRef.current) {
      reelFishingRod();
      return;
    }
    const p = playerRef.current;
    // Check nearby NPC directly in front first
    for (const npcId of Object.keys(NPCS) as NpcId[]) {
      const np = npcRuntimeRef.current[npcId];
      if (Math.hypot(np.x - p.x, np.y - p.y) < 1.9) {
        openNpcDialogue(npcId);
        return;
      }
    }
    const fx = Math.floor(p.x + (p.dir === 0 ? 0.85 : p.dir === 2 ? -0.85 : 0));
    const fy = Math.floor(p.y + (p.dir === 1 ? 0.85 : p.dir === 3 ? -0.85 : 0));
    interactAtTile(fx, fy);
  }, [interactAtTile, openNpcDialogue, reelFishingRod]);

  // Keyboard Listeners (WASD/Arrows + Space/E + 1..8 + C/J/M)
  useEffect(() => {
    if (viewMode !== 'play') return;
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const k = e.key.toLowerCase();
      keysPressedRef.current[k] = true;

      if (k === 'escape') {
        setShowShop(false);
        setShowBasket(false);
        setShowCraft(false);
        setShowJournal(false);
        setShowWorldMap(false);
        setActiveNpcId(null);
        return;
      }

      if (k === ' ' || k === 'e') {
        e.preventDefault();
        if (
          !showShop &&
          !showBasket &&
          !showCraft &&
          !showJournal &&
          !showWorldMap &&
          !showTutorial &&
          !activeNpcId &&
          !storyEventModal &&
          !daySummary
        ) {
          triggerFacingAction();
        }
      } else if (k === 'c') {
        setShowCraft((v) => !v);
      } else if (k === 'j') {
        setShowJournal((v) => !v);
      } else if (k === 'm') {
        setShowWorldMap((v) => !v);
      } else if (k === '1') setActiveTool('hoe');
      else if (k === '2') setActiveTool('water');
      else if (k === '3') setActiveTool('pick');
      else if (k === '4') setActiveTool('harvest');
      else if (k === '5') setActiveTool('seed');
      else if (k === '6') setActiveTool('fertilizer');
      else if (k === '7') setActiveTool('sprinkler');
      else if (k === '8') setActiveTool('rod');
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
  }, [
    viewMode,
    showShop,
    showBasket,
    showCraft,
    showJournal,
    showWorldMap,
    showTutorial,
    activeNpcId,
    storyEventModal,
    daySummary,
    triggerFacingAction,
  ]);

  // Main 60fps Big-Island Camera-Following Stardew Renderer
  useEffect(() => {
    if (viewMode !== 'play') return;
    let rafId: number;
    if (!atlasRef.current) atlasRef.current = getStardewPixelAtlas();

    const loop = (now: number) => {
      const st = saveStateRef.current;
      const atlas = atlasRef.current;
      const sprites = spritesRef.current;

      const tileAt = (cx: number, cy: number): FarmTile | undefined => {
        const tx = Math.floor(cx);
        const ty = Math.floor(cy);
        if (tx < 0 || tx >= WORLD_COLS || ty < 0 || ty >= WORLD_ROWS) return undefined;
        return st.tiles[ty * WORLD_COLS + tx];
      };

      const canWalk = (t?: FarmTile) => {
        if (!t) return false;
        if (t.kind === 'ocean' || t.kind === 'river' || t.kind === 'pond') return false;
        if (
          t.kind === 'house' ||
          t.kind === 'coop' ||
          t.kind === 'workbench' ||
          t.kind === 'shop' ||
          t.kind === 'bin' ||
          t.kind === 'elder_hall' ||
          t.kind === 'jaka_cabin' ||
          t.kind === 'maya_hut' ||
          t.kind === 'lighthouse' ||
          t.kind === 'ship' ||
          t.kind === 'sacred_tree' ||
          t.kind === 'windmill' ||
          t.kind === 'well' ||
          t.kind === 'altar'
        ) {
          return false;
        }
        // Story-gated map barriers!
        if (t.kind === 'bridge' && t.y >= 26 && st.storyChapter < 2) return false; // Southern Bridge broken in Bab 1
        if (t.kind === 'cliff_pass' && st.storyChapter < 3) return false; // Eastern Quarry pass blocked until Bab 3 (completed Bab 2)
        if (
          t.debris === 'stone' ||
          t.debris === 'wood' ||
          t.debris === 'ore_copper' ||
          t.debris === 'ore_silver' ||
          t.debris === 'ore_star'
        ) {
          return false;
        }
        return true;
      };

      // Update Player Movement (pause while talking or fishing)
      const p = playerRef.current;
      const keys = keysPressedRef.current;
      let vx = 0;
      let vy = 0;
      if (!activeNpcRef.current && !fishingRef.current) {
        if (keys['w'] || keys['arrowup']) vy -= 1;
        if (keys['s'] || keys['arrowdown']) vy += 1;
        if (keys['a'] || keys['arrowleft']) vx -= 1;
        if (keys['d'] || keys['arrowright']) vx += 1;
      }

      if (vx !== 0 || vy !== 0) {
        const len = Math.hypot(vx, vy);
        const speed = 0.095;
        const nx = Math.max(0.6, Math.min(WORLD_COLS - 0.6, p.x + (vx / len) * speed));
        const ny = Math.max(0.6, Math.min(WORLD_ROWS - 0.6, p.y + (vy / len) * speed));
        if (canWalk(tileAt(nx, p.y))) p.x = nx;
        if (canWalk(tileAt(p.x, ny))) p.y = ny;

        if (Math.abs(vx) >= Math.abs(vy)) p.dir = vx > 0 ? 0 : 2;
        else p.dir = vy > 0 ? 1 : 3;
        p.moving = true;
      } else {
        p.moving = false;
      }
      if (p.swingTimer > 0) p.swingTimer--;

      // Smooth Camera Follow clamped to Island World Bounds
      const cam = cameraRef.current;
      const targetCamX = Math.max(0, Math.min(WORLD_COLS * TILE_SIZE - VIEW_W, p.x * TILE_SIZE - VIEW_W / 2));
      const targetCamY = Math.max(0, Math.min(WORLD_ROWS * TILE_SIZE - VIEW_H, p.y * TILE_SIZE - VIEW_H / 2));
      cam.x += (targetCamX - cam.x) * 0.16;
      cam.y += (targetCamY - cam.y) * 0.16;

      // Update Roaming NPCs & Farm Chickens
      for (const npcId of Object.keys(NPCS) as NpcId[]) {
        const cfg = NPCS[npcId];
        const rt = npcRuntimeRef.current[npcId];
        if (activeNpcRef.current === npcId) continue;
        if (rt.pauseTimer > 0) {
          rt.pauseTimer--;
          if (rt.pauseTimer === 0) {
            const ang = Math.random() * Math.PI * 2;
            const rad = 0.6 + Math.random() * cfg.patrolRadius;
            const candX = cfg.baseX + Math.cos(ang) * rad;
            const candY = cfg.baseY + Math.sin(ang) * rad;
            if (canWalk(tileAt(candX, candY))) {
              rt.targetX = candX;
              rt.targetY = candY;
            } else {
              rt.pauseTimer = 60;
            }
          }
        } else {
          const dx = rt.targetX - rt.x;
          const dy = rt.targetY - rt.y;
          const d = Math.hypot(dx, dy);
          if (d < 0.08) {
            rt.pauseTimer = 90 + Math.floor(Math.random() * 110);
          } else {
            const nx = rt.x + (dx / d) * 0.022;
            const ny = rt.y + (dy / d) * 0.022;
            if (canWalk(tileAt(nx, ny))) {
              rt.x = nx;
              rt.y = ny;
              rt.dir = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 0 : 2) : dy > 0 ? 1 : 3;
            } else {
              rt.pauseTimer = 70;
            }
          }
        }
      }

      chickensRef.current.forEach((ch) => {
        ch.timer--;
        if (ch.timer <= 0) {
          ch.dir = Math.random() < 0.5 ? 1 : -1;
          ch.timer = 55 + Math.floor(Math.random() * 60);
        }
        const nx = ch.x + ch.dir * 0.012;
        if (nx >= 12.6 && nx <= 16.4) ch.x = nx;
        else ch.dir *= -1;
      });

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const curSeason = SEASONS[st.seasonIdx % SEASONS.length];

      if (canvas && ctx && atlas) {
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, VIEW_W, VIEW_H);

        const camX = Math.round(cam.x);
        const camY = Math.round(cam.y);

        const startCol = Math.max(0, Math.floor(camX / TILE_SIZE) - 1);
        const endCol = Math.min(WORLD_COLS - 1, Math.ceil((camX + VIEW_W) / TILE_SIZE) + 1);
        const startRow = Math.max(0, Math.floor(camY / TILE_SIZE) - 1);
        const endRow = Math.min(WORLD_ROWS - 1, Math.ceil((camY + VIEW_H) / TILE_SIZE) + 1);

        ctx.save();
        ctx.translate(-camX, -camY);

        // 1. Visible Terrain Pass (Viewport Culled!)
        const grassSet = atlas.grass[curSeason];
        for (let y = startRow; y <= endRow; y++) {
          for (let x = startCol; x <= endCol; x++) {
            const tile = st.tiles[y * WORLD_COLS + x];
            const px = x * TILE_SIZE;
            const py = y * TILE_SIZE;

            if (tile.kind === 'ocean') {
              ctx.drawImage(atlas.oceanWater, px, py, TILE_SIZE, TILE_SIZE);
              const wave = Math.floor(Math.sin(now * 0.003 + x * 0.7 + y) * 3);
              ctx.fillStyle = 'rgba(224, 247, 255, 0.35)';
              if ((x + y) % 2 === 0) ctx.fillRect(px + 10 + wave, py + 20, 14, 3);
              // Surf foam where ocean meets sand (y === 35)
              if (y === 35 && x >= 2 && x <= WORLD_COLS - 3) {
                const foamOffset = Math.floor(Math.sin(now * 0.004 + x * 0.5) * 3);
                ctx.fillStyle = 'rgba(240, 249, 255, 0.8)';
                ctx.fillRect(px, py + 2 + foamOffset, TILE_SIZE, 5);
              }
            } else if (tile.kind === 'river' || tile.kind === 'pond') {
              ctx.drawImage(atlas.pondWater, px, py, TILE_SIZE, TILE_SIZE);
              const flow = Math.floor((now * 0.03 + y * 14 + x * 9) % TILE_SIZE);
              ctx.fillStyle = 'rgba(224, 247, 255, 0.48)';
              ctx.fillRect(px + (flow % 26) + 6, py + 15, 10, 3);
              ctx.fillRect(px + ((flow + 18) % 28) + 4, py + 34, 8, 3);
            } else if (tile.kind === 'sand') {
              ctx.drawImage(atlas.sand[(x + y) % 2], px, py, TILE_SIZE, TILE_SIZE);
            } else if (tile.kind === 'forest_floor') {
              ctx.drawImage(atlas.forestFloor[(x + y) % 2], px, py, TILE_SIZE, TILE_SIZE);
            } else if (tile.kind === 'plaza' || tile.kind === 'cliff_pass') {
              ctx.drawImage(atlas.plaza[(x + y) % 2], px, py, TILE_SIZE, TILE_SIZE);
            } else {
              const gVar = (x * 7 + y * 13) % grassSet.length;
              ctx.drawImage(grassSet[gVar], px, py, TILE_SIZE, TILE_SIZE);
            }

            if (tile.kind === 'path') {
              ctx.drawImage(atlas.path[(x + y) % 2], px, py, TILE_SIZE, TILE_SIZE);
            } else if (tile.kind === 'bridge' || tile.kind === 'pier') {
              ctx.drawImage(tile.kind === 'pier' ? atlas.oceanWater : atlas.pondWater, px, py, TILE_SIZE, TILE_SIZE);
              const isBroken = tile.kind === 'bridge' && y >= 26 && st.storyChapter < 2;
              if (isBroken) {
                // Broken planks barrier!
                ctx.fillStyle = '#4a220c';
                ctx.fillRect(px + 2, py + 4, 14, TILE_SIZE - 8);
                ctx.fillRect(px + TILE_SIZE - 16, py + 4, 14, TILE_SIZE - 8);
                ctx.fillStyle = '#dc2626';
                ctx.fillRect(px + 8, py + 18, TILE_SIZE - 16, 8);
                ctx.fillStyle = '#fef08a';
                ctx.fillRect(px + 12, py + 20, 6, 4);
                ctx.fillRect(px + 30, py + 20, 6, 4);
              } else {
                // Intact Wooden Bridge / Harbor Pier
                ctx.fillStyle = '#4a220c';
                ctx.fillRect(px, py + 2, TILE_SIZE, TILE_SIZE - 4);
                ctx.fillStyle = '#b66b32';
                for (let k = 0; k < 4; k++) {
                  ctx.fillRect(px + k * 12 + 1, py + 4, 10, TILE_SIZE - 8);
                }
                ctx.fillStyle = '#78350f';
                ctx.fillRect(px, py + 4, TILE_SIZE, 4);
                ctx.fillRect(px, py + TILE_SIZE - 8, TILE_SIZE, 4);
              }
            }

            // Story-gated Cliff Pass Boulders before Chapter 3
            if (tile.kind === 'cliff_pass' && st.storyChapter < 3) {
              ctx.drawImage(atlas.stone, px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
              ctx.fillStyle = '#dc2626';
              ctx.fillRect(px + 10, py + 32, TILE_SIZE - 20, 6);
            }

            // Auto-tiled Tilled Soil & Watered Soil
            if (tile.tilled) {
              const nT = tileAt(x + 0.5, y - 0.5)?.tilled;
              const nB = tileAt(x + 0.5, y + 1.5)?.tilled;
              const nL = tileAt(x - 0.5, y + 0.5)?.tilled;
              const nR = tileAt(x + 1.5, y + 0.5)?.tilled;
              const padT = nT ? 0 : 4;
              const padB = nB ? 0 : 4;
              const padL = nL ? 0 : 4;
              const padR = nR ? 0 : 4;

              ctx.fillStyle = tile.watered ? '#2d1408' : '#572d14';
              ctx.fillRect(px + padL, py + padT, TILE_SIZE - padL - padR, TILE_SIZE - padT - padB);
              ctx.fillStyle = tile.watered ? '#4e2712' : '#a86538';
              ctx.fillRect(
                px + (nL ? 0 : 7),
                py + (nT ? 0 : 7),
                TILE_SIZE - (nL ? 0 : 7) - (nR ? 0 : 7),
                TILE_SIZE - (nT ? 0 : 7) - (nB ? 0 : 7)
              );
              ctx.fillStyle = tile.watered ? '#3b1c0b' : '#854922';
              ctx.fillRect(px + 9, py + 12, TILE_SIZE - 18, 3);
              ctx.fillRect(px + 9, py + 23, TILE_SIZE - 18, 3);
              ctx.fillRect(px + 9, py + 34, TILE_SIZE - 18, 3);

              if (tile.fertilized) {
                ctx.fillStyle = '#fde047';
                ctx.fillRect(px + 10, py + 9, 4, 4);
                ctx.fillRect(px + 33, py + 19, 4, 4);
                ctx.fillStyle = '#86efac';
                ctx.fillRect(px + 15, py + 33, 4, 4);
              }
            }

            // Mystic Waterfall Spray on Pond at (5..7, 3)
            if (tile.kind === 'pond' && y === 3 && x >= 5 && x <= 7) {
              const spray = Math.floor(Math.sin(now * 0.012 + x) * 3);
              ctx.fillStyle = '#e0f2fe';
              ctx.fillRect(px + 6, py, TILE_SIZE - 12, 24 + spray);
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(px + 12, py + 8 + spray, 8, 10);
            }
          }
        }

        // 2. Y-Sorted 2.5D Render Queue (Visible Landmarks, Trees, Crops, Chickens, NPCs, Farmer)
        type DrawItem = { sortY: number; render: () => void };
        const queue: DrawItem[] = [];

        const isVisibleY = (wy: number, pad = 220) =>
          wy * TILE_SIZE >= camY - pad && wy * TILE_SIZE <= camY + VIEW_H + pad;
        const isVisibleX = (wx: number, pad = 220) =>
          wx * TILE_SIZE >= camX - pad && wx * TILE_SIZE <= camX + VIEW_W + pad;

        const addSpriteLandmark = (
          gx: number,
          gy: number,
          hPx: number,
          sprite: HTMLCanvasElement | null,
          label?: string,
          extras?: (cx: number, by: number) => void
        ) => {
          if (!isVisibleX(gx) || !isVisibleY(gy)) return;
          const cx = gx * TILE_SIZE;
          const by = gy * TILE_SIZE;
          queue.push({
            sortY: by,
            render: () => {
              ctx.fillStyle = 'rgba(15, 25, 10, 0.3)';
              ctx.beginPath();
              ctx.ellipse(cx, by - 4, hPx * 0.34, 9, 0, 0, Math.PI * 2);
              ctx.fill();
              if (sprite) {
                const ratio = sprite.width / sprite.height;
                const drawW = hPx * ratio;
                ctx.drawImage(sprite, cx - drawW / 2, by - hPx + 4, drawW, hPx);
              }
              if (extras) extras(cx, by);
              if (label) {
                ctx.fillStyle = '#4a220c';
                const bw = label.length * 6 + 12;
                ctx.fillRect(cx - bw / 2, by - 9, bw, 14);
                ctx.fillStyle = '#f5d59c';
                ctx.fillRect(cx - bw / 2 + 2, by - 7, bw - 4, 10);
                ctx.fillStyle = '#3b1a07';
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(label, cx, by + 1);
              }
            },
          });
        };

        // Homestead Landmarks
        addSpriteLandmark(7.5, 16, 146, sprites.farmhouse, 'RUMAH (TIDUR)', (cx, by) => {
          for (let s = 0; s < 3; s++) {
            const t = (now * 0.0005 + s * 0.33) % 1;
            ctx.fillStyle = `rgba(255, 252, 245, ${(1 - t) * 0.55})`;
            ctx.fillRect(
              Math.round(cx + 20 + Math.sin(t * 6 + s) * 5),
              Math.round(by - 135 - t * 24),
              Math.round(6 + t * 5),
              Math.round(5 + t * 5)
            );
          }
        });
        addSpriteLandmark(10.5, 15.8, 56, sprites.bin, 'PETI JUAL');
        addSpriteLandmark(14.5, 16, 134, sprites.coop, st.coopEggsReady > 0 ? `KANDANG (${st.coopEggsReady} TELUR!)` : 'KANDANG AYAM');

        // Workbench (x: 17, y: 14..15)
        if (isVisibleX(17.5) && isVisibleY(15.5)) {
          queue.push({
            sortY: 15.8 * TILE_SIZE,
            render: () => {
              const wx = 17 * TILE_SIZE;
              const wy = 14.7 * TILE_SIZE;
              ctx.drawImage(atlas.workbench, wx, wy, 48, 48);
              ctx.fillStyle = '#4a220c';
              ctx.fillRect(wx - 10, wy + 44, 68, 13);
              ctx.fillStyle = '#f5d59c';
              ctx.fillRect(wx - 8, wy + 46, 64, 9);
              ctx.fillStyle = '#3b1a07';
              ctx.font = 'bold 8px monospace';
              ctx.textAlign = 'center';
              ctx.fillText('KERAJINAN [C]', wx + 24, wy + 53);
            },
          });
        }

        // Village Landmarks
        addSpriteLandmark(26.5, 16, 146, sprites.shop, 'TOKO BENIH');
        addSpriteLandmark(32.5, 16, 142, sprites.farmhouse, 'BALAI TETUA');
        if (isVisibleX(29.5) && isVisibleY(18)) {
          queue.push({
            sortY: 18 * TILE_SIZE,
            render: () => {
              ctx.drawImage(atlas.well, 29 * TILE_SIZE + 2, 17 * TILE_SIZE + 2, 44, 44);
            },
          });
        }

        // Forest Landmarks
        addSpriteLandmark(8.5, 10, 128, sprites.farmhouse, 'PONDOK MAYA');
        addSpriteLandmark(15.5, 7, 134, sprites.coop, 'PONDOK JAKA');

        // Sacred Tree & 4 Mustika Pedestals!
        addSpriteLandmark(
          27.5,
          7,
          178,
          sprites.sacredTree,
          st.islandHealed ? 'POHON CAHAYA ABADI' : 'POHON CAHAYA',
          (cx, by) => {
            if (st.storyChapter === 5 || st.islandHealed) {
              const glow = 0.25 + Math.sin(now * 0.005) * 0.1;
              ctx.fillStyle = `rgba(250, 204, 21, ${glow.toFixed(2)})`;
              ctx.beginPath();
              ctx.arc(cx, by - 75, 58, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        );

        const altarCoords = [
          { x: 24, y: 8, chNeeded: 2, color: '#84cc16', label: 'TANAH' },
          { x: 25, y: 9, chNeeded: 3, color: '#38bdf8', label: 'TIRTA' },
          { x: 29, y: 9, chNeeded: 4, color: '#a855f7', label: 'ANGIN' },
          { x: 30, y: 8, chNeeded: 5, color: '#facc15', label: 'MENTARI' },
        ];
        altarCoords.forEach((al) => {
          if (!isVisibleX(al.x) || !isVisibleY(al.y)) return;
          const lit = st.storyChapter >= al.chNeeded || st.islandHealed;
          queue.push({
            sortY: (al.y + 0.9) * TILE_SIZE,
            render: () => {
              const ax = al.x * TILE_SIZE;
              const ay = al.y * TILE_SIZE;
              ctx.fillStyle = '#334155';
              ctx.fillRect(ax + 10, ay + 16, 28, 28);
              ctx.fillStyle = '#64748b';
              ctx.fillRect(ax + 12, ay + 12, 24, 16);
              if (lit) {
                const pulse = Math.sin(now * 0.007 + al.x) * 3;
                ctx.fillStyle = al.color;
                ctx.beginPath();
                ctx.arc(ax + 24, ay + 12 - pulse * 0.3, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(ax + 22, ay + 9, 4, 4);
              }
            },
          });
        });

        // Spinning Windmill (x: 38..40, y: 4..6)
        if (isVisibleX(39.5) && isVisibleY(7)) {
          queue.push({
            sortY: 7 * TILE_SIZE,
            render: () => {
              const wx = 39.5 * TILE_SIZE;
              const wy = 7 * TILE_SIZE;
              ctx.fillStyle = '#572d14';
              ctx.fillRect(wx - 24, wy - 76, 48, 74);
              ctx.fillStyle = '#d97706';
              ctx.fillRect(wx - 20, wy - 72, 40, 66);
              ctx.fillStyle = '#991b1b';
              ctx.beginPath();
              ctx.moveTo(wx - 30, wy - 72);
              ctx.lineTo(wx, wy - 106);
              ctx.lineTo(wx + 30, wy - 72);
              ctx.closePath();
              ctx.fill();
              // Spinning Blades!
              const speed = st.storyChapter >= 4 ? 0.003 : 0.0008;
              const rot = now * speed;
              ctx.save();
              ctx.translate(wx, wy - 64);
              ctx.rotate(rot);
              ctx.fillStyle = '#fef3c7';
              ctx.strokeStyle = '#4a220c';
              ctx.lineWidth = 2;
              for (let b = 0; b < 4; b++) {
                ctx.rotate(Math.PI / 2);
                ctx.fillRect(-5, 4, 10, 40);
                ctx.strokeRect(-5, 4, 10, 40);
              }
              ctx.restore();
            },
          });
        }

        // Harbor Lighthouse & Captain's Sailing Ship
        addSpriteLandmark(43.5, 32, 165, sprites.lighthouse, 'MERCUSUAR');
        if (isVisibleX(32.5) && isVisibleY(36)) {
          queue.push({
            sortY: 36.2 * TILE_SIZE,
            render: () => {
              const sx = 32.5 * TILE_SIZE;
              const sy = 35.8 * TILE_SIZE + Math.sin(now * 0.003) * 3;
              // Wooden Hull
              ctx.fillStyle = '#4a220c';
              ctx.beginPath();
              ctx.moveTo(sx - 54, sy - 22);
              ctx.lineTo(sx + 54, sy - 22);
              ctx.lineTo(sx + 38, sy + 6);
              ctx.lineTo(sx - 38, sy + 6);
              ctx.closePath();
              ctx.fill();
              ctx.fillStyle = '#b45309';
              ctx.fillRect(sx - 44, sy - 20, 88, 12);
              // Mast & Sail
              ctx.fillStyle = '#78350f';
              ctx.fillRect(sx - 3, sy - 92, 6, 72);
              ctx.fillStyle = '#fffbeb';
              ctx.beginPath();
              ctx.moveTo(sx + 3, sy - 88);
              ctx.lineTo(sx + 44, sy - 50);
              ctx.lineTo(sx + 3, sy - 30);
              ctx.closePath();
              ctx.fill();
              ctx.fillStyle = '#dc2626';
              ctx.fillRect(sx - 2, sy - 96, 18, 8);
            },
          });
        }

        // Apple & Coconut Palm Trees framing the island
        const orchardTrees = [
          { gx: 4.5, gy: 15 },
          { gx: 4.5, gy: 24.5 },
          { gx: 19.5, gy: 14 },
          { gx: 4.5, gy: 10 },
          { gx: 12.5, gy: 4.5 },
          { gx: 18.5, gy: 9 },
          { gx: 23.5, gy: 4.5 },
          { gx: 31.5, gy: 4.5 },
          { gx: 37.5, gy: 21 },
          { gx: 43.5, gy: 16 },
        ];
        orchardTrees.forEach((tr, i) => {
          if (!isVisibleX(tr.gx) || !isVisibleY(tr.gy)) return;
          addSpriteLandmark(tr.gx + Math.sin(now * 0.0015 + i) * 0.015, tr.gy, 92, sprites.tree);
        });

        const palmSpots = [
          { gx: 6.5, gy: 30.5 },
          { gx: 14.5, gy: 30 },
          { gx: 22.5, gy: 30.5 },
          { gx: 36.5, gy: 30.5 },
          { gx: 47.5, gy: 30.5 },
        ];
        palmSpots.forEach((pm, i) => {
          if (!isVisibleX(pm.gx) || !isVisibleY(pm.gy)) return;
          addSpriteLandmark(pm.gx + Math.sin(now * 0.002 + i) * 0.02, pm.gy, 102, sprites.palmTree);
        });

        // Scarecrow in Homestead
        if (isVisibleX(8.5) && isVisibleY(19)) {
          queue.push({
            sortY: 19 * TILE_SIZE,
            render: () => {
              ctx.drawImage(atlas.scarecrow, 8 * TILE_SIZE + 4, 18 * TILE_SIZE - 8, 40, 50);
            },
          });
        }

        // Animated Farm Chickens near Coop
        chickensRef.current.forEach((ch) => {
          if (!isVisibleX(ch.x) || !isVisibleY(ch.y)) return;
          queue.push({
            sortY: ch.y * TILE_SIZE,
            render: () => {
              const sp = ch.variant === 'white' ? atlas.chickenWhite : atlas.chickenBrown;
              const hop = Math.abs(Math.sin(now * 0.01 + ch.x)) * 2;
              ctx.save();
              ctx.translate(ch.x * TILE_SIZE, ch.y * TILE_SIZE - hop);
              ctx.scale(ch.dir, 1);
              ctx.drawImage(sp, -14, -24, 28, 28);
              ctx.restore();
            },
          });
        });

        // Visible Tile Crops, Debris, Ores, Forage & Sprinklers
        for (let y = startRow; y <= endRow; y++) {
          for (let x = startCol; x <= endCol; x++) {
            const tile = st.tiles[y * WORLD_COLS + x];
            const px = x * TILE_SIZE;
            const py = y * TILE_SIZE;

            if (tile.debris) {
              queue.push({
                sortY: py + TILE_SIZE - 4,
                render: () => {
                  const sp = atlas[tile.debris!];
                  if (sp) ctx.drawImage(sp, px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                },
              });
            }

            if (tile.hasSprinkler || tile.hasGoldSprinkler) {
              queue.push({
                sortY: py + TILE_SIZE - 4,
                render: () => {
                  ctx.drawImage(
                    tile.hasGoldSprinkler ? atlas.goldSprinkler : atlas.sprinkler,
                    px + 6,
                    py + 6,
                    TILE_SIZE - 12,
                    TILE_SIZE - 12
                  );
                },
              });
            }

            if (tile.crop) {
              const crop = tile.crop;
              const cDef = CROPS[crop.id];
              const prog = Math.min(1, crop.age / cDef.daysToGrow);
              const stageIdx = crop.ready ? 3 : prog < 0.3 ? 0 : prog < 0.65 ? 1 : 2;
              const sprite = atlas.crops[crop.id][stageIdx];
              const isTall = sprite.height > 16;

              queue.push({
                sortY: py + TILE_SIZE - 2,
                render: () => {
                  const sway = crop.ready ? Math.sin(now * 0.005 + x) * 1.4 : 0;
                  const drawW = TILE_SIZE - 6;
                  const drawH = isTall ? Math.round(drawW * (sprite.height / sprite.width)) : drawW;
                  const drawX = Math.round(px + 3 + sway);
                  const drawY = Math.round(py + TILE_SIZE - drawH - 3);
                  if (crop.ready) {
                    ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
                    ctx.beginPath();
                    ctx.ellipse(px + 24, py + TILE_SIZE - 8, 15, 5, 0, 0, Math.PI * 2);
                    ctx.fill();
                  }
                  ctx.drawImage(sprite, drawX, drawY, drawW, drawH);
                },
              });
            }
          }
        }

        // Roaming NPCs with Quest Markers (!)
        const activeStoryCh = STORY_CHAPTERS.find((c) => c.chapter === st.storyChapter);
        const chapterReady = isChapterConditionMet(st);
        (Object.keys(NPCS) as NpcId[]).forEach((npcId) => {
          const rt = npcRuntimeRef.current[npcId];
          if (!isVisibleX(rt.x) || !isVisibleY(rt.y)) return;
          const sp = sprites.npcs[npcId];
          const isQuestNpc = activeStoryCh?.speakerNpc === npcId;

          queue.push({
            sortY: rt.y * TILE_SIZE + 8,
            render: () => {
              const nx = Math.round(rt.x * TILE_SIZE);
              const ny = Math.round(rt.y * TILE_SIZE);
              const bob = rt.pauseTimer === 0 ? Math.abs(Math.sin(now * 0.014)) * 3 : 0;

              ctx.fillStyle = 'rgba(15, 25, 8, 0.32)';
              ctx.beginPath();
              ctx.ellipse(nx, ny + 10, 12, 5, 0, 0, Math.PI * 2);
              ctx.fill();

              ctx.save();
              ctx.translate(nx, ny - bob);
              if (sp) {
                const drawH = 50;
                const drawW = Math.round(drawH * (sp.width / sp.height));
                if (rt.dir === 2) ctx.scale(-1, 1);
                ctx.drawImage(sp, -drawW / 2, -drawH + 12, drawW, drawH);
              } else {
                ctx.fillStyle = NPCS[npcId].color;
                ctx.fillRect(-9, -24, 18, 28);
              }
              ctx.restore();

              // Name Tag & Story ! Marker
              ctx.fillStyle = 'rgba(59, 26, 7, 0.85)';
              ctx.fillRect(nx - 26, ny + 13, 52, 12);
              ctx.fillStyle = '#fef3c7';
              ctx.font = 'bold 8px monospace';
              ctx.textAlign = 'center';
              ctx.fillText(NPCS[npcId].name.split(' ')[0], nx, ny + 22);

              if (isQuestNpc) {
                const markerY = ny - 46 + Math.sin(now * 0.008) * 3;
                ctx.fillStyle = chapterReady ? '#facc15' : '#ffffff';
                ctx.strokeStyle = '#4a220c';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(nx, markerY, 9, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = chapterReady ? '#b91c1c' : '#4a220c';
                ctx.font = 'bold 12px monospace';
                ctx.fillText(chapterReady ? '!' : '?', nx, markerY + 4);
              }
            },
          });
        });

        // Player Farmer Character
        queue.push({
          sortY: p.y * TILE_SIZE + 8,
          render: () => {
            const cx = Math.round(p.x * TILE_SIZE);
            const cy = Math.round(p.y * TILE_SIZE);
            const stride = p.moving ? Math.abs(Math.sin(now * 0.016)) * 4 : 0;
            const tilt = p.moving ? Math.sin(now * 0.016) * 0.07 : 0;

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
              if (p.dir === 2) ctx.scale(-1, 1);
              ctx.drawImage(sprites.farmer, -drawW / 2, -drawH + 14, drawW, drawH);
            }
            ctx.restore();

            if (p.swingTimer > 0) {
              const toolSp = atlas.tools[activeToolRef.current];
              const prog = 1 - p.swingTimer / 12;
              const angle = (prog - 0.5) * 1.4;
              const dirSign = p.dir === 2 ? -1 : 1;
              const offX = p.dir === 0 ? 18 : p.dir === 2 ? -18 : 10;
              const offY = p.dir === 3 ? -16 : p.dir === 1 ? 6 : -4;
              ctx.save();
              ctx.translate(cx + offX, cy + offY);
              ctx.scale(dirSign, 1);
              ctx.rotate(angle);
              ctx.drawImage(toolSp, -12, -20, 24, 24);
              ctx.restore();
            }
          },
        });

        queue.sort((a, b) => a.sortY - b.sortY);
        for (const item of queue) item.render();

        // 3. Fishing Line & Bobber
        const fs = fishingRef.current;
        if (fs) {
          const bx = fs.wx * TILE_SIZE + 24;
          const by = fs.wy * TILE_SIZE + 24 + Math.sin(now * 0.012) * (fs.status === 'bite' ? 4 : 1.5);
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x * TILE_SIZE, p.y * TILE_SIZE - 12);
          ctx.lineTo(bx, by);
          ctx.stroke();

          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(bx, by, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bx - 3, by, 6, 3);

          if (fs.status === 'bite') {
            ctx.fillStyle = '#facc15';
            ctx.fillRect(bx - 36, by - 30, 72, 18);
            ctx.strokeStyle = '#78350f';
            ctx.strokeRect(bx - 36, by - 30, 72, 18);
            ctx.fillStyle = '#b91c1c';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('! TARIK !', bx, by - 17);
          }
        }

        // 4. Target Tile Corner Brackets
        {
          const fx = Math.floor(p.x + (p.dir === 0 ? 0.85 : p.dir === 2 ? -0.85 : 0));
          const fy = Math.floor(p.y + (p.dir === 1 ? 0.85 : p.dir === 3 ? -0.85 : 0));
          if (fx >= 0 && fx < WORLD_COLS && fy >= 0 && fy < WORLD_ROWS) {
            const rx = fx * TILE_SIZE;
            const ry = fy * TILE_SIZE;
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(rx + 2, ry + 2, 10, 3);
            ctx.fillRect(rx + 2, ry + 2, 3, 10);
            ctx.fillRect(rx + TILE_SIZE - 12, ry + 2, 10, 3);
            ctx.fillRect(rx + TILE_SIZE - 5, ry + 2, 3, 10);
            ctx.fillRect(rx + 2, ry + TILE_SIZE - 5, 10, 3);
            ctx.fillRect(rx + 2, ry + TILE_SIZE - 12, 3, 10);
            ctx.fillRect(rx + TILE_SIZE - 12, ry + TILE_SIZE - 5, 10, 3);
            ctx.fillRect(rx + TILE_SIZE - 5, ry + TILE_SIZE - 12, 3, 10);
          }
        }

        // 5. Ambient Butterflies / Fireflies (especially vibrant once Island Heals!)
        const fireflyCount = st.islandHealed ? 24 : 8;
        for (let b = 0; b < fireflyCount; b++) {
          const bx = camX + ((b * 137 + Math.sin(now * 0.001 + b) * 70 + now * 0.018) % VIEW_W);
          const by = camY + ((b * 93 + Math.cos(now * 0.0014 + b * 2) * 50) % VIEW_H);
          ctx.fillStyle = st.islandHealed || minuteOfDay >= 1020 ? '#fde047' : '#f472b6';
          ctx.fillRect(Math.round(bx), Math.round(by), 3, 3);
        }

        // 6. Floating Particles
        particlesRef.current = particlesRef.current.filter((pt) => {
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.vy += 0.04;
          pt.life++;
          const alpha = 1 - pt.life / pt.maxLife;
          if (alpha <= 0) return false;
          ctx.globalAlpha = alpha;
          if (pt.label) {
            ctx.font = 'bold 12px monospace';
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

        ctx.restore();

        // 7. Screen-Space Rain & Dusk Lighting
        if (st.weather === 'Hujan') {
          ctx.fillStyle = 'rgba(20, 42, 72, 0.14)';
          ctx.fillRect(0, 0, VIEW_W, VIEW_H);
          ctx.fillStyle = 'rgba(186, 230, 253, 0.65)';
          for (let r = 0; r < 55; r++) {
            const rx = Math.round(((r * 97 + now * 0.2) % (VIEW_W + 40)) - 20);
            const ry = Math.round((r * 61 + now * 0.48) % VIEW_H);
            ctx.fillRect(rx, ry, 2, 10);
          }
        }
        if (minuteOfDay >= 960 && minuteOfDay < 1140) {
          const f = ((minuteOfDay - 960) / 180) * 0.16;
          ctx.fillStyle = `rgba(217, 119, 6, ${f.toFixed(2)})`;
          ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        } else if (minuteOfDay >= 1140) {
          const f = Math.min(0.32, 0.14 + ((minuteOfDay - 1140) / 180) * 0.18);
          ctx.fillStyle = `rgba(15, 23, 52, ${f.toFixed(2)})`;
          ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        }
      }

      // Update Live Corner Minimap
      const mm = minimapRef.current;
      const mCtx = mm?.getContext('2d');
      if (mm && mCtx) {
        const mw = mm.width;
        const mh = mm.height;
        const sx = mw / WORLD_COLS;
        const sy = mh / WORLD_ROWS;
        mCtx.clearRect(0, 0, mw, mh);

        for (let y = 0; y < WORLD_ROWS; y++) {
          for (let x = 0; x < WORLD_COLS; x++) {
            const tk = st.tiles[y * WORLD_COLS + x].kind;
            mCtx.fillStyle =
              tk === 'ocean'
                ? '#1d6fa5'
                : tk === 'river' || tk === 'pond'
                ? '#38bdf8'
                : tk === 'sand'
                ? '#edd08f'
                : tk === 'forest_floor'
                ? '#3f782d'
                : tk === 'plaza'
                ? '#9ca3af'
                : tk === 'path' || tk === 'bridge' || tk === 'pier'
                ? '#d9a464'
                : '#72b83e';
            mCtx.fillRect(Math.floor(x * sx), Math.floor(y * sy), Math.ceil(sx), Math.ceil(sy));
          }
        }

        // Camera Viewport Box
        mCtx.strokeStyle = 'rgba(255,255,255,0.7)';
        mCtx.lineWidth = 1;
        mCtx.strokeRect(
          (cam.x / TILE_SIZE) * sx,
          (cam.y / TILE_SIZE) * sy,
          (VIEW_W / TILE_SIZE) * sx,
          (VIEW_H / TILE_SIZE) * sy
        );

        // NPC Dots
        (Object.keys(NPCS) as NpcId[]).forEach((nid) => {
          const rt = npcRuntimeRef.current[nid];
          mCtx.fillStyle = NPCS[nid].color;
          mCtx.fillRect(rt.x * sx - 1.5, rt.y * sy - 1.5, 3, 3);
        });

        // Player Blinking Dot
        if (Math.floor(now / 260) % 2 === 0) {
          mCtx.fillStyle = '#ffffff';
          mCtx.fillRect(p.x * sx - 2.5, p.y * sy - 2.5, 5, 5);
          mCtx.strokeStyle = '#dc2626';
          mCtx.strokeRect(p.x * sx - 2.5, p.y * sy - 2.5, 5, 5);
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [viewMode, minuteOfDay, isChapterConditionMet]);

  // Canvas Click -> translate via Camera Offset to World Grid Tile!
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const viewX = (e.clientX - rect.left) * scaleX;
    const viewY = (e.clientY - rect.top) * scaleY;
    const worldX = viewX + cameraRef.current.x;
    const worldY = viewY + cameraRef.current.y;
    const gx = Math.floor(worldX / TILE_SIZE);
    const gy = Math.floor(worldY / TILE_SIZE);

    const dx = gx + 0.5 - playerRef.current.x;
    const dy = gy + 0.5 - playerRef.current.y;
    if (Math.abs(dx) >= Math.abs(dy)) playerRef.current.dir = dx >= 0 ? 0 : 2;
    else playerRef.current.dir = dy >= 0 ? 1 : 3;

    interactAtTile(gx, gy);
  };

  const buyItem = (kind: 'seed' | 'fertilizer' | 'sprinkler', cropId?: CropId) => {
    const cost =
      kind === 'fertilizer' ? 25 : kind === 'sprinkler' ? 350 : cropId ? CROPS[cropId].seedCost : 0;
    if (saveState.gold < cost) {
      playFarmSound('error', soundMuted);
      setToastMsg('Koin tidak cukup! Panen & jual hasil kebun terlebih dahulu.');
      return;
    }
    playFarmSound('coin', soundMuted);
    setSaveState((prev) => {
      if (kind === 'fertilizer') return { ...prev, gold: prev.gold - cost, fertilizerCount: prev.fertilizerCount + 1 };
      if (kind === 'sprinkler') return { ...prev, gold: prev.gold - cost, sprinklerCount: prev.sprinklerCount + 1 };
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

  const sellBagItem = (itemId: BagItemId) => {
    const qty = saveState.bagItems[itemId] || 0;
    if (qty <= 0) return;
    const price = BAG_ITEMS[itemId].sellPrice;
    playFarmSound('coin', soundMuted);
    setSaveState((prev) => {
      const updated: FarmSaveState = {
        ...prev,
        gold: prev.gold + price,
        totalEarnedGold: prev.totalEarnedGold + price,
        bagItems: { ...prev.bagItems, [itemId]: qty - 1 },
      };
      void syncScoreToCloud(updated);
      return updated;
    });
    setToastMsg(`Menjual 1 ${BAG_ITEMS[itemId].name} (+${price}G)!`);
  };

  const eatBagItem = (itemId: BagItemId) => {
    const def = BAG_ITEMS[itemId];
    const qty = saveState.bagItems[itemId] || 0;
    if (qty <= 0 || !def.energyRestore) return;
    playFarmSound('plant', soundMuted);
    setSaveState((prev) => ({
      ...prev,
      stamina: Math.min(100, prev.stamina + def.energyRestore!),
      bagItems: { ...prev.bagItems, [itemId]: qty - 1 },
    }));
    setToastMsg(`Memakan ${def.name}! Energi pulih +${def.energyRestore}.`);
  };

  const craftItem = (recipeId: string) => {
    const rec = CRAFT_RECIPES.find((r) => r.id === recipeId);
    if (!rec) return;

    // Verify ingredients
    for (const ing of rec.ingredients) {
      if (ing.kind === 'bag') {
        if ((saveState.bagItems[ing.id as BagItemId] || 0) < ing.qty) {
          playFarmSound('error', soundMuted);
          setToastMsg(`Bahan ${ing.label} kurang!`);
          return;
        }
      } else {
        const normalKey = `${ing.id}_normal`;
        const goldKey = `${ing.id}_gold`;
        const avail = (saveState.harvestBasket[normalKey]?.qty || 0) + (saveState.harvestBasket[goldKey]?.qty || 0);
        if (avail < ing.qty) {
          playFarmSound('error', soundMuted);
          setToastMsg(`Panen ${ing.label} di keranjang kurang!`);
          return;
        }
      }
    }

    playFarmSound('harvest', soundMuted);
    setSaveState((prev) => {
      const nextBag = { ...prev.bagItems };
      const nextBasket = { ...prev.harvestBasket };

      for (const ing of rec.ingredients) {
        if (ing.kind === 'bag') {
          const bid = ing.id as BagItemId;
          nextBag[bid] = Math.max(0, (nextBag[bid] || 0) - ing.qty);
        } else {
          let rem = ing.qty;
          const nKey = `${ing.id}_normal`;
          const gKey = `${ing.id}_gold`;
          if (nextBasket[nKey] && rem > 0) {
            const take = Math.min(rem, nextBasket[nKey].qty);
            nextBasket[nKey] = { ...nextBasket[nKey], qty: nextBasket[nKey].qty - take };
            if (nextBasket[nKey].qty <= 0) delete nextBasket[nKey];
            rem -= take;
          }
          if (nextBasket[gKey] && rem > 0) {
            const take = Math.min(rem, nextBasket[gKey].qty);
            nextBasket[gKey] = { ...nextBasket[gKey], qty: nextBasket[gKey].qty - take };
            if (nextBasket[gKey].qty <= 0) delete nextBasket[gKey];
          }
        }
      }

      if (rec.resultType === 'bag' && rec.resultBagId) {
        nextBag[rec.resultBagId] = (nextBag[rec.resultBagId] || 0) + rec.resultQty;
      }

      const updated: FarmSaveState = {
        ...prev,
        bagItems: nextBag,
        harvestBasket: nextBasket,
        sprinklerCount: prev.sprinklerCount + (rec.resultType === 'sprinkler' ? rec.resultQty : 0),
        goldSprinklerCount: prev.goldSprinklerCount + (rec.resultType === 'gold_sprinkler' ? rec.resultQty : 0),
        fertilizerCount: prev.fertilizerCount + (rec.resultType === 'fertilizer' ? rec.resultQty : 0),
        stats: { ...prev.stats, crafted: prev.stats.crafted + 1 },
      };
      void syncScoreToCloud(updated);
      return updated;
    });
    setToastMsg(`Berhasil membuat ${rec.title}!`);
  };

  const giveGiftToNpc = (npcId: NpcId, itemId: BagItemId) => {
    if (saveState.npcGiftedToday[npcId]) {
      setDialogueText('Terima kasih banyak! Aku sudah menerima hadiah darimu hari ini.');
      return;
    }
    const qty = saveState.bagItems[itemId] || 0;
    if (qty <= 0) return;

    playFarmSound('coin', soundMuted);
    setSaveState((prev) => {
      const updated: FarmSaveState = {
        ...prev,
        bagItems: { ...prev.bagItems, [itemId]: qty - 1 },
        npcGiftedToday: { ...prev.npcGiftedToday, [npcId]: true },
        npcHearts: { ...prev.npcHearts, [npcId]: Math.min(5, (prev.npcHearts[npcId] || 0) + 1) },
      };
      void syncScoreToCloud(updated);
      return updated;
    });
    setShowGiftPicker(false);
    setDialogueText(
      `Wah, ${BAG_ITEMS[itemId].name}! Terima kasih banyak ya! Persahabatan kita makin erat!`
    );
  };

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
    setToastMsg(`Misi "${q.title}" selesai! +${q.rewardGold}G`);
  };

  const getQuestProgress = (q: QuestDef) => {
    if (q.type === 'plant_total') return saveState.stats.planted;
    if (q.type === 'harvest_total') return saveState.stats.harvested;
    if (q.type === 'gold_quality') return saveState.stats.goldQuality;
    if (q.type === 'fished') return saveState.stats.fished;
    return saveState.totalEarnedGold;
  };

  const basketTotalCount = useMemo(
    () => Object.values(saveState.harvestBasket).reduce((s, x) => s + x.qty, 0),
    [saveState.harvestBasket]
  );

  const formattedClock = `${String(Math.floor(minuteOfDay / 60)).padStart(2, '0')}:${String(
    minuteOfDay % 60
  ).padStart(2, '0')}`;

  const activeStoryChapter = STORY_CHAPTERS.find((c) => c.chapter === saveState.storyChapter);
  const canAdvanceCurrentStory = isChapterConditionMet(saveState);

  const resetFarmCompletely = () => {
    const fresh = createInitialSave();
    setSaveState(fresh);
    setConfirmReset(false);
    playerRef.current = { x: 9.5, y: 17.5, dir: 1, moving: false, swingTimer: 0 };
    cameraRef.current = {
      x: Math.max(0, 9.5 * TILE_SIZE - VIEW_W / 2),
      y: Math.max(0, 17.5 * TILE_SIZE - VIEW_H / 2),
    };
    setMinuteOfDay(360);
    setViewMode('play');
    setToastMsg('Petualangan Pulau Swarnadwipa dimulai dari Hari ke-1!');
  };

  // ================= VIEW 1: COZY TITLE MENU AWAL =================
  if (viewMode === 'menu') {
    const studentFirstName = currentStudent?.nama ? String(currentStudent.nama).split(' ')[0] : 'Petani Muda';
    return (
      <div className="w-full h-full flex items-center justify-center max-w-6xl mx-auto text-slate-100 overflow-y-auto custom-scrollbar p-1 sm:p-2">
        <div className="w-full bg-slate-900/95 border-2 border-[#c87c38] rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Hero Artwork (7 cols) */}
          <div className="lg:col-span-7 relative min-h-[260px] sm:min-h-[340px] lg:min-h-[470px] bg-gradient-to-br from-amber-950 via-emerald-950 to-slate-950 overflow-hidden flex flex-col justify-end p-5 sm:p-7">
            <img
              src={gameBerkebunBg}
              alt="Ilustrasi Pulau Swarnadwipa Berkebun"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 to-transparent" />

            <div className="relative z-10 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 flex-wrap">
                <span>Petualangan Kebun & Pulau Fiksi</span>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span>5 Bab Cerita</span>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span>6 Karakter Warga</span>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span>Peta Luas 6 Wilayah</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight drop-shadow">
                Berkebun: Legenda Swarnadwipa
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed">
                Jelajahi Pulau Swarnadwipa yang luas! Rawat kebun warisan kakek, memancing di pelabuhan, menambang kristal, berinteraksi dengan 6 warga pulau, dan satukan 4 Mustika untuk membangkitkan Pohon Cahaya Abadi.
              </p>

              {hasExistingProgress && (
                <div className="flex items-center gap-4 pt-1 text-xs font-bold text-amber-200 tabular-nums flex-wrap">
                  <span>Hari {saveState.day} ({currentSeason})</span>
                  <span aria-hidden="true" className="text-slate-500">·</span>
                  <span className="text-emerald-300">Bab Cerita {Math.min(5, saveState.storyChapter)}/5</span>
                  <span aria-hidden="true" className="text-slate-500">·</span>
                  <span className="text-sky-300">{saveState.gold}G</span>
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
                <h3 className="text-lg sm:text-xl font-black text-white">Pulau Swarnadwipa</h3>
                <p className="text-xs text-slate-400">
                  {hasExistingProgress
                    ? `Progres: Hari ${saveState.day} · Bab ${Math.min(5, saveState.storyChapter)}/5`
                    : 'Kisah baru di kebun warisan menantimu'}
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
                      Lanjutkan Petualangan
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
                    Mulai Petualangan
                  </span>
                  <span className="text-xs font-extrabold bg-slate-950/15 px-2.5 py-1 rounded-lg">
                    Bab 1 →
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
                  Panduan & Kisah Pulau
                </span>
                <span className="text-xs font-semibold text-amber-300/80">Cara Bermain</span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>WASD / Panah · [J] Jurnal · [M] Peta · [C] Tas</span>
              <span className="font-bold text-amber-300 tabular-nums">Skor: {computeTotalScore(saveState)}</span>
            </div>
          </div>
        </div>

        {/* Confirm Reset Modal */}
        {confirmReset && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
              <h3 className="font-black text-lg text-white">Mulai Kebun Baru?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Seluruh progres cerita, koin, kebun, dan persahabatan warga akan direset ke Bab 1 Hari ke-1.
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
            <div className="bg-[#f5d59c] border-4 border-[#6f3615] ring-2 ring-[#d98a42] rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar text-[#3b1a07]">
              <div className="flex items-center justify-between border-b-2 border-[#c88d4f] pb-3">
                <h3 className="font-black text-lg flex items-center gap-2">
                  <Sprout className="text-emerald-700" size={20} /> Panduan Pulau Swarnadwipa
                </h3>
                <button
                  type="button"
                  onClick={() => setShowTutorial(false)}
                  className="p-1.5 rounded-xl bg-[#8c4a1c] text-[#fff3d6]"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#ffecc7] border-2 border-[#b97336] space-y-1">
                  <p className="font-black text-emerald-800">1. Kamera & Dunia Pulau Besar</p>
                  <p className="text-[#5c2c0e] leading-relaxed">
                    Berjalan dengan <strong>W A S D / Panah</strong> melintasi 6 wilayah: Lembah Kebun, Desa Purnama, Hutan Air Terjun, Altar Utara, Tambang Kristal & Pelabuhan! Tekan <strong>[M]</strong> untuk Peta Pulau.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#ffecc7] border-2 border-[#b97336] space-y-1">
                  <p className="font-black text-amber-800">2. Cerita 5 Bab & 6 Warga Pulau</p>
                  <p className="text-[#5c2c0e] leading-relaxed">
                    Bicara dengan <strong>Tetua Raka, Mbak Sari, Pak Jaka, Nenek Maya, Kapten Bima, & Lira</strong> (dekat & tekan <strong>Spasi/Klik</strong>) untuk membuka Jembatan Selatan, Tambang Timur, dan Pohon Cahaya!
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#ffecc7] border-2 border-[#b97336] space-y-1">
                  <p className="font-black text-sky-800">3. Memancing, Tambang & Ternak</p>
                  <p className="text-[#5c2c0e] leading-relaxed">
                    Pakai <strong>Pancing [8]</strong> di kolam/sungai/dermaga, pakai <strong>Beliung [3]</strong> di Tambang Timur untuk bijih tembaga/perak/kristal, dan ambil telur di <strong>Kandang Ayam</strong> setiap pagi!
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#ffecc7] border-2 border-[#b97336] space-y-1">
                  <p className="font-black text-rose-800">4. Meja Kerajinan [C] & Hadiah</p>
                  <p className="text-[#5c2c0e] leading-relaxed">
                    Tekan <strong>[C]</strong> untuk merakit <strong>Sprinkler Emas 3x3</strong>, <strong>Selai</strong>, <strong>Kopi</strong>, & <strong>Jamu Energi</strong>. Beri hasil kebun sebagai hadiah ke warga untuk menambah Hati!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTutorial(false)}
                className="w-full py-3 bg-[#16a34a] hover:bg-[#15803d] text-white font-black rounded-2xl text-sm border-2 border-[#14532d]"
              >
                Mulai Jelajahi Pulau Swarnadwipa!
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================= VIEW 2: ACTIVE BIG-ISLAND STARDEW WORLD =================
  const totalScore = computeTotalScore(saveState);

  return (
    <div className="w-full h-full flex flex-col gap-2 max-w-7xl mx-auto text-[#3b1a07] overflow-hidden select-none">
      {/* Top Stardew Wooden HUD Bar */}
      <div className="bg-[#f5d59c] border-[3px] border-[#6f3615] ring-2 ring-[#d98a42] rounded-2xl px-3 py-1.5 flex items-center justify-between gap-2 flex-wrap shrink-0 shadow-lg">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setViewMode('menu')}
            className="px-2.5 py-1 rounded-xl bg-[#8c4a1c] hover:bg-[#a45722] text-[#fff3d6] text-xs font-black border-2 border-[#4a220c]"
          >
            Menu
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#ffecc7] border-2 border-[#b97336] text-xs font-black text-[#4a220c] tabular-nums">
            {saveState.weather === 'Hujan' ? (
              <CloudRain size={14} className="text-sky-600" />
            ) : (
              <Sun size={14} className="text-amber-600" />
            )}
            <span>Hari {saveState.day} · {currentSeason}</span>
            <span aria-hidden="true" className="text-[#b97336]">|</span>
            <span className="font-mono text-[#6f3615]">{formattedClock}</span>
          </div>

          <span className="px-2.5 py-1 rounded-xl bg-[#ffdf8e] border-2 border-[#b7791f] text-[#744210] font-black text-xs flex items-center gap-1 tabular-nums">
            <Coins size={13} className="text-amber-700" /> {saveState.gold}G
          </span>
          <span className="px-2 py-1 rounded-xl bg-[#dcfce7] border-2 border-[#2f855a] text-[#14532d] font-black text-xs flex items-center gap-1 tabular-nums">
            <Zap size={12} /> {saveState.stamina}
          </span>
          <span className="px-2 py-1 rounded-xl bg-[#e0f2fe] border-2 border-[#0369a1] text-[#0c4a6e] font-black text-xs flex items-center gap-1 tabular-nums">
            <Droplets size={12} /> {saveState.waterLevel}/20
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap text-xs font-black tabular-nums">
          <button
            type="button"
            onClick={() => setShowJournal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-[#9333ea] hover:bg-[#7e22ce] text-white border-2 border-[#581c87] flex items-center gap-1 shadow-sm"
            title="Jurnal Cerita & Sahabat [J]"
          >
            <BookOpen size={13} /> Jurnal [J]
          </button>

          <button
            type="button"
            onClick={() => setShowWorldMap(true)}
            className="px-2.5 py-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white border-2 border-[#075985] flex items-center gap-1 shadow-sm"
            title="Peta Pulau Swarnadwipa [M]"
          >
            <MapIcon size={13} /> Peta [M]
          </button>

          <button
            type="button"
            onClick={() => setShowCraft(true)}
            className="px-2.5 py-1.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white border-2 border-[#451a03] flex items-center gap-1 shadow-sm"
            title="Tas Ransel & Kerajinan [C]"
          >
            <Hammer size={13} /> Tas [C]
          </button>

          <button
            type="button"
            onClick={() => setShowShop(true)}
            className="px-2.5 py-1.5 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white border-2 border-[#78350f] flex items-center gap-1 shadow-sm"
          >
            <ShoppingBag size={13} /> Toko
          </button>

          <button
            type="button"
            onClick={() => setShowBasket(true)}
            className="px-2.5 py-1.5 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white border-2 border-[#312e81] flex items-center gap-1 shadow-sm"
          >
            <Package size={13} /> Panen ({basketTotalCount})
          </button>

          <button
            type="button"
            onClick={handleSleepNextDay}
            className="px-2.5 py-1.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white border-2 border-[#14532d] flex items-center gap-1 shadow-sm"
          >
            <Moon size={13} /> Tidur
          </button>

          <button
            type="button"
            onClick={() => setSoundMuted((m) => !m)}
            className="p-1.5 rounded-xl bg-[#8c4a1c] hover:bg-[#a45722] text-[#fff3d6] border-2 border-[#4a220c]"
          >
            {soundMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
        </div>
      </div>

      {/* Main Split Area */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 overflow-y-auto lg:overflow-hidden custom-scrollbar">
        {/* Big-Island Viewport Canvas + Camera + Minimap (8 cols) */}
        <div className="lg:col-span-8 bg-[#6f3615] border-[3px] border-[#421c07] ring-2 ring-[#c87c38] rounded-2xl p-2 flex flex-col gap-2 min-h-[320px] lg:min-h-0 relative overflow-hidden shadow-xl">
          {/* Active Story Banner + Feedback Toast */}
          <div className="px-3 py-1 rounded-xl bg-[#f5d59c] border-2 border-[#8c4a1c] text-xs font-extrabold text-[#3b1a07] flex items-center justify-between gap-2 shrink-0">
            <span className="truncate">{toastMsg}</span>
            <span className="text-[11px] font-black text-[#7a3f1a] hidden sm:inline shrink-0">
              Skor: {totalScore}
            </span>
          </div>

          <div className="flex-1 min-h-0 flex items-center justify-center bg-[#184f78] rounded-xl border-2 border-[#421c07] overflow-hidden relative shadow-inner">
            <canvas
              ref={canvasRef}
              width={VIEW_W}
              height={VIEW_H}
              onClick={handleCanvasClick}
              style={{ imageRendering: 'pixelated' }}
              className="w-full h-full object-contain cursor-pointer"
            />

            {/* Live Top-Right Island Minimap Overlay */}
            <button
              type="button"
              onClick={() => setShowWorldMap(true)}
              title="Klik untuk membuka Peta Pulau Lengkap [M]"
              className="absolute top-2 right-2 bg-[#4a220c]/90 p-1 rounded-xl border-2 border-[#d98a42] shadow-lg hover:scale-105 transition-transform"
            >
              <canvas
                ref={minimapRef}
                width={135}
                height={95}
                style={{ imageRendering: 'pixelated' }}
                className="block rounded-lg"
              />
              <span className="block text-[9px] font-black text-[#ffecc7] text-center mt-0.5">
                PETA PULAU [M]
              </span>
            </button>

            {/* Fishing Interactive Action Prompt */}
            {fishingState && (
              <div className="absolute bottom-3 right-3 bg-[#f5d59c] border-2 border-[#6f3615] rounded-2xl px-3.5 py-2 shadow-xl flex items-center gap-2.5 animate-bounce">
                <Fish className={fishingState.status === 'bite' ? 'text-rose-600' : 'text-sky-700'} size={18} />
                <div className="text-xs font-black">
                  {fishingState.status === 'bite' ? 'Ikan Menggigit!' : 'Menunggu Ikan...'}
                </div>
                <button
                  type="button"
                  onClick={reelFishingRod}
                  className={cn(
                    'px-3 py-1 rounded-xl font-black text-xs text-white border',
                    fishingState.status === 'bite'
                      ? 'bg-rose-600 border-rose-900'
                      : 'bg-slate-600 border-slate-900'
                  )}
                >
                  Tarik!
                </button>
              </div>
            )}

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

          {/* Bottom 8-Slot Stardew Wooden Hotbar */}
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
                {
                  id: 'sprinkler',
                  keyNum: '7',
                  label: saveState.useGoldSprinklerMode
                    ? `Emas (${saveState.goldSprinklerCount})`
                    : `Sprinkler (${saveState.sprinklerCount})`,
                  isGoldSp: Boolean(saveState.useGoldSprinklerMode && saveState.goldSprinklerCount > 0),
                },
                { id: 'rod', keyNum: '8', label: 'Pancing' },
              ] as Array<{
                id: ToolMode;
                keyNum: string;
                label: string;
                cropId?: CropId;
                isGoldSp?: boolean;
              }>
            ).map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  if (tool.id === 'sprinkler' && activeTool === 'sprinkler' && saveState.goldSprinklerCount > 0) {
                    setSaveState((p) => ({ ...p, useGoldSprinklerMode: !p.useGoldSprinklerMode }));
                  } else {
                    setActiveTool(tool.id);
                  }
                }}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg border-2 text-xs font-black flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all',
                  activeTool === tool.id
                    ? 'bg-[#ffeaa7] text-[#3b1a07] border-[#dc2626] ring-2 ring-[#facc15] shadow-md -translate-y-0.5'
                    : 'bg-[#f1cb8f] text-[#4a220c] border-[#5c2c0e] hover:bg-[#ffe1b0]'
                )}
              >
                <span className="font-mono text-[10px] text-[#7a3f1a]">[{tool.keyNum}]</span>
                <img
                  src={
                    tool.cropId
                      ? getPixelCropDataUrl(tool.cropId)
                      : tool.isGoldSp
                      ? getPixelGoldSprinklerDataUrl()
                      : getPixelToolDataUrl(tool.id)
                  }
                  alt={tool.label}
                  style={{ imageRendering: 'pixelated' }}
                  className="w-5 h-5 object-contain shrink-0"
                />
                <span>{tool.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel: Active Story Tracker + Seed Pouch + Village Quests (4 cols) */}
        <div className="lg:col-span-4 bg-[#f5d59c] border-[3px] border-[#6f3615] ring-2 ring-[#d98a42] rounded-2xl p-3 flex flex-col gap-2.5 min-h-[260px] lg:min-h-0 overflow-hidden shadow-xl">
          {/* Active Story Chapter Card */}
          <div className="p-2.5 rounded-xl bg-[#ffecc7] border-2 border-[#b45309] space-y-1 shrink-0 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black text-[#92400e] flex items-center gap-1">
                <Compass size={13} />
                {activeStoryChapter ? activeStoryChapter.title : 'Kisah Selesai · Cahaya Abadi'}
              </span>
              <button
                type="button"
                onClick={() => setShowJournal(true)}
                className="text-[10px] font-black text-[#7c2d12] underline"
              >
                Baca Jurnal
              </button>
            </div>
            <p className="text-[11px] font-bold text-[#3b1a07] leading-snug">
              {activeStoryChapter
                ? activeStoryChapter.objectiveText
                : 'Pulau Swarnadwipa telah pulih sepenuhnya! Terus kembangkan kebun dan persahabatan.'}
            </p>
            {activeStoryChapter && (
              <div className="text-[10px] font-black text-emerald-800 flex items-center justify-between">
                <span>Target: {NPCS[activeStoryChapter.speakerNpc].name}</span>
                {canAdvanceCurrentStory && (
                  <span className="text-rose-700 animate-pulse">★ Siap Dilaporkan!</span>
                )}
              </div>
            )}
          </div>

          {/* Seasonal Seed Selector */}
          <div className="space-y-1.5 shrink-0">
            <div className="flex items-center justify-between text-xs font-black text-[#4a220c]">
              <span>Tas Benih Pulau</span>
              <button
                type="button"
                onClick={() => setShowShop(true)}
                className="text-[#b45309] hover:underline font-black"
              >
                + Toko Benih
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(CROPS) as CropId[]).map((cid) => {
                const c = CROPS[cid];
                const locked = saveState.storyChapter < c.unlockChapter;
                const qty = saveState.seeds[cid] || 0;
                const isSel = selectedSeed === cid && activeTool === 'seed';
                return (
                  <button
                    key={cid}
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      setSelectedSeed(cid);
                      setActiveTool('seed');
                    }}
                    className={cn(
                      'p-1.5 rounded-xl border-2 text-left text-[11px] transition-all flex items-center justify-between gap-1',
                      locked
                        ? 'bg-[#e6c387]/50 border-[#b97336]/40 opacity-50 cursor-not-allowed'
                        : isSel
                        ? 'bg-[#dcfce7] border-[#15803d] text-[#14532d] ring-2 ring-[#4ade80]'
                        : 'bg-[#ffecc7] border-[#b97336] text-[#4a220c] hover:bg-[#fff4dc]'
                    )}
                    title={locked ? `Terbuka di Bab ${c.unlockChapter}` : c.name}
                  >
                    <span className="truncate font-black flex items-center gap-1">
                      <img
                        src={getPixelCropDataUrl(cid)}
                        alt={c.name}
                        style={{ imageRendering: 'pixelated' }}
                        className="w-4 h-4 object-contain shrink-0"
                      />
                      {c.name.split(' ')[0]}
                    </span>
                    <span className="font-mono font-black text-[#92400e] tabular-nums shrink-0">
                      {locked ? '🔒' : `x${qty}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Community Quests Board */}
          <div className="flex-1 min-h-0 flex flex-col gap-1.5 pt-2 border-t-2 border-[#c88d4f] overflow-hidden">
            <div className="flex items-center justify-between text-xs font-black text-[#4a220c] shrink-0">
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#b45309]" /> Misi Papan Desa
              </span>
              <span className="text-[11px] text-[#7a3f1a] font-bold tabular-nums">
                {saveState.claimedQuests.length}/{SIDE_QUESTS.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {SIDE_QUESTS.map((q) => {
                const claimed = saveState.claimedQuests.includes(q.id);
                const prog = Math.min(q.target, getQuestProgress(q));
                const ready = prog >= q.target && !claimed;

                return (
                  <div
                    key={q.id}
                    className={cn(
                      'p-2 rounded-xl border-2 text-xs space-y-1',
                      claimed
                        ? 'bg-[#dcfce7]/80 border-[#4ade80] opacity-75'
                        : ready
                        ? 'bg-[#fef08a] border-[#ca8a04]'
                        : 'bg-[#ffecc7] border-[#c88d4f]'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-[#3b1a07] truncate">{q.title}</span>
                      <span className="text-[11px] font-mono font-black text-[#92400e] tabular-nums">
                        {prog}/{q.target}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#5c2c0e] font-bold">
                      <span>+{q.rewardGold}G · +{q.rewardScore} Skor</span>
                      {claimed ? (
                        <span className="text-emerald-700 font-black flex items-center gap-1">
                          <CheckCircle2 size={11} /> Selesai
                        </span>
                      ) : ready ? (
                        <button
                          type="button"
                          onClick={() => claimQuest(q)}
                          className="px-2 py-0.5 rounded-lg bg-[#16a34a] text-white font-black border border-[#14532d]"
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

      {/* ================= INTERACTIVE NPC DIALOGUE MODAL ================= */}
      {activeNpcId && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
          <div className="bg-[#f5d59c] border-4 border-[#6f3615] ring-2 ring-[#d98a42] rounded-3xl max-w-2xl w-full p-4 sm:p-5 space-y-3 shadow-2xl text-[#3b1a07]">
            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
              {/* NPC AI Pixel Portrait + Heart Meter */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-[#ffecc7] border-[3px] border-[#6f3615] overflow-hidden flex items-center justify-center shadow-inner">
                  {spritesRef.current.npcPortraits[activeNpcId] ? (
                    <img
                      src={spritesRef.current.npcPortraits[activeNpcId]}
                      alt={NPCS[activeNpcId].name}
                      style={{ imageRendering: 'pixelated' }}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <MessageCircle size={36} className="text-[#8c4a1c]" />
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  {[0, 1, 2, 3, 4].map((idx) => (
                    <Heart
                      key={idx}
                      size={13}
                      className={
                        idx < (saveState.npcHearts[activeNpcId] || 0)
                          ? 'fill-rose-500 text-rose-700'
                          : 'text-[#b97336]'
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Speech Content */}
              <div className="flex-1 min-w-0 space-y-2 w-full">
                <div className="flex items-start justify-between gap-2 border-b-2 border-[#c88d4f] pb-1.5">
                  <div>
                    <h3 className="font-black text-base sm:text-lg text-[#3b1a07]">
                      {NPCS[activeNpcId].name}
                    </h3>
                    <p className="text-[11px] font-bold text-[#7a3f1a]">
                      {NPCS[activeNpcId].role} · Favorit: {NPCS[activeNpcId].favoriteCategory}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveNpcId(null)}
                    className="p-1.5 rounded-xl bg-[#8c4a1c] text-[#fff3d6] border border-[#4a220c]"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-[#fff5e1] border-2 border-[#c88d4f] text-xs sm:text-sm font-bold leading-relaxed text-[#3b1a07] min-h-[72px]">
                  “{dialogueText}”
                </div>

                {/* Gift Picker Sub-drawer */}
                {showGiftPicker && (
                  <div className="p-2.5 rounded-xl bg-[#ffecc7] border-2 border-[#b97336] space-y-1.5">
                    <p className="text-[11px] font-black text-[#6f3615]">Pilih barang dari Tas untuk dihadiahkan:</p>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto custom-scrollbar">
                      {(Object.keys(saveState.bagItems) as BagItemId[])
                        .filter((bid) => (saveState.bagItems[bid] || 0) > 0)
                        .map((bid) => (
                          <button
                            key={bid}
                            type="button"
                            onClick={() => giveGiftToNpc(activeNpcId, bid)}
                            className="px-2 py-1 rounded-lg bg-[#fff5e1] hover:bg-[#fef08a] border border-[#8c4a1c] text-[11px] font-black flex items-center gap-1"
                          >
                            <img
                              src={getPixelBagItemDataUrl(bid)}
                              alt={BAG_ITEMS[bid].name}
                              style={{ imageRendering: 'pixelated' }}
                              className="w-4 h-4 object-contain"
                            />
                            {BAG_ITEMS[bid].name} ({saveState.bagItems[bid]})
                          </button>
                        ))}
                      {(Object.keys(saveState.bagItems) as BagItemId[]).every(
                        (bid) => (saveState.bagItems[bid] || 0) === 0
                      ) && (
                        <span className="text-[11px] text-[#7a3f1a]">
                          Tas masih kosong. Kumpulkan jamur, ikan, batu, atau telur dulu!
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Interactive Branching Choices */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {activeStoryChapter &&
                    activeStoryChapter.speakerNpc === activeNpcId &&
                    canAdvanceCurrentStory && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveNpcId(null);
                          advanceStoryChapter(saveState);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white border-2 border-[#14532d] text-xs font-black animate-pulse"
                      >
                        ★ Selesaikan {activeStoryChapter.title}!
                      </button>
                    )}

                  <button
                    type="button"
                    onClick={() => {
                      const lines = NPCS[activeNpcId].chitChatLines;
                      const next = lines[Math.floor(Math.random() * lines.length)];
                      setDialogueText(next);
                      setShowGiftPicker(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#ffecc7] hover:bg-[#ffdf8e] border-2 border-[#8c4a1c] text-xs font-black flex items-center gap-1"
                  >
                    <MessageCircle size={13} /> Ajak Ngobrol
                  </button>

                  {(saveState.npcHearts[activeNpcId] || 0) >= 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        setDialogueText(NPCS[activeNpcId].secretLore);
                        setShowGiftPicker(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#fef08a] hover:bg-[#fde047] border-2 border-[#ca8a04] text-xs font-black"
                    >
                      Tanya Rahasia Pulau
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowGiftPicker((v) => !v)}
                    className="px-3 py-1.5 rounded-xl bg-[#fce7f3] hover:bg-[#fbcfe8] border-2 border-[#be185d] text-[#831843] text-xs font-black flex items-center gap-1"
                  >
                    <Gift size={13} /> Beri Hadiah
                  </button>

                  {activeNpcId === 'sari' && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveNpcId(null);
                        setShowShop(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#d97706] text-white border-2 border-[#78350f] text-xs font-black"
                    >
                      Buka Toko Benih
                    </button>
                  )}
                  {(activeNpcId === 'jaka' || activeNpcId === 'maya') && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveNpcId(null);
                        setShowCraft(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#b45309] text-white border-2 border-[#451a03] text-xs font-black"
                    >
                      Buka Kerajinan
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STORY CHAPTER CELEBRATION BANNER ================= */}
      {storyEventModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5d59c] border-4 border-[#6f3615] ring-4 ring-[#facc15] rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl text-[#3b1a07]">
            <div className="w-16 h-16 rounded-full bg-amber-300 border-4 border-[#6f3615] mx-auto flex items-center justify-center shadow-lg">
              <Sparkles size={30} className="text-[#92400e]" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-800">
                {storyEventModal.mustika} Bangkit!
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-[#3b1a07]">{storyEventModal.title}</h3>
              <p className="text-xs font-bold text-[#7a3f1a]">{storyEventModal.desc}</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#dcfce7] border-2 border-[#16a34a] text-xs font-black text-[#14532d]">
              {storyEventModal.unlocked}
            </div>
            <button
              type="button"
              onClick={() => setStoryEventModal(null)}
              className="w-full py-3 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] text-white border-2 border-[#14532d] font-black text-sm shadow-md"
            >
              Lanjutkan Petualangan →
            </button>
          </div>
        </div>
      )}

      {/* ================= STORY JOURNAL & RELATIONSHIPS MODAL [J] ================= */}
      {showJournal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5d59c] border-4 border-[#6f3615] ring-2 ring-[#d98a42] rounded-3xl max-w-3xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar text-[#3b1a07]">
            <div className="flex items-center justify-between border-b-2 border-[#c88d4f] pb-3">
              <h3 className="font-black text-lg flex items-center gap-2">
                <BookOpen className="text-purple-800" size={20} /> Jurnal Legenda Swarnadwipa & Warga
              </h3>
              <button
                type="button"
                onClick={() => setShowJournal(false)}
                className="p-1.5 rounded-xl bg-[#8c4a1c] text-[#fff3d6]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="font-black text-sm text-[#5c2c0e]">Alur 5 Bab & 4 Mustika Suci</h4>
              <div className="space-y-2">
                {STORY_CHAPTERS.map((ch) => {
                  const done = saveState.storyChapter > ch.chapter;
                  const active = saveState.storyChapter === ch.chapter;
                  const locked = saveState.storyChapter < ch.chapter;
                  return (
                    <div
                      key={ch.chapter}
                      className={cn(
                        'p-3 rounded-2xl border-2 text-xs space-y-1',
                        done
                          ? 'bg-[#dcfce7] border-[#16a34a]'
                          : active
                          ? 'bg-[#fef08a] border-[#ca8a04]'
                          : 'bg-[#ffecc7]/60 border-[#c88d4f] opacity-60'
                      )}
                    >
                      <div className="flex items-center justify-between font-black">
                        <span>{ch.title} ({ch.mustikaName})</span>
                        <span>{done ? '✓ Selesai' : active ? '★ Aktif' : '🔒 Terkunci'}</span>
                      </div>
                      <p className="text-[#5c2c0e] leading-relaxed">
                        {locked ? 'Selesaikan bab sebelumnya untuk membuka kisah ini.' : ch.summary}
                      </p>
                      {!locked && (
                        <p className="text-[11px] font-black text-emerald-800">
                          Tujuan: {ch.objectiveText}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t-2 border-[#c88d4f]">
              <h4 className="font-black text-sm text-[#5c2c0e]">Daftar Karakter Warga Pulau</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.keys(NPCS) as NpcId[]).map((nid) => {
                  const npc = NPCS[nid];
                  const hearts = saveState.npcHearts[nid] || 0;
                  return (
                    <div
                      key={nid}
                      className="p-2.5 rounded-2xl bg-[#ffecc7] border-2 border-[#b97336] flex items-center gap-3 text-xs"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#fff5e1] border border-[#8c4a1c] overflow-hidden shrink-0 flex items-center justify-center">
                        {spritesRef.current.npcPortraits[nid] && (
                          <img
                            src={spritesRef.current.npcPortraits[nid]}
                            alt={npc.name}
                            style={{ imageRendering: 'pixelated' }}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-[#3b1a07] truncate">{npc.name}</p>
                        <p className="text-[10px] font-bold text-[#7a3f1a] truncate">{npc.homeRegion}</p>
                        <div className="flex items-center gap-0.5 mt-1">
                          {[0, 1, 2, 3, 4].map((idx) => (
                            <Heart
                              key={idx}
                              size={11}
                              className={idx < hearts ? 'fill-rose-500 text-rose-700' : 'text-[#b97336]'}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= FULL ISLAND WORLD MAP MODAL [M] ================= */}
      {showWorldMap && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5d59c] border-4 border-[#6f3615] ring-2 ring-[#d98a42] rounded-3xl max-w-3xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar text-[#3b1a07]">
            <div className="flex items-center justify-between border-b-2 border-[#c88d4f] pb-3">
              <h3 className="font-black text-lg flex items-center gap-2">
                <MapIcon className="text-sky-700" size={20} /> Peta Pulau Swarnadwipa (54 × 38)
              </h3>
              <button
                type="button"
                onClick={() => setShowWorldMap(false)}
                className="p-1.5 rounded-xl bg-[#8c4a1c] text-[#fff3d6]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative w-full aspect-[54/38] bg-[#1d6fa5] rounded-2xl border-4 border-[#4a220c] overflow-hidden shadow-inner">
              {ISLAND_REGIONS.map((reg) => (
                <div
                  key={reg.id}
                  style={{
                    left: `${(reg.x / WORLD_COLS) * 100}%`,
                    top: `${(reg.y / WORLD_ROWS) * 100}%`,
                    width: `${(reg.w / WORLD_COLS) * 100}%`,
                    height: `${(reg.h / WORLD_ROWS) * 100}%`,
                    backgroundColor: `${reg.color}55`,
                    borderColor: reg.color,
                  }}
                  className="absolute border-2 rounded-lg flex items-center justify-center p-1 text-center"
                >
                  <span className="text-[10px] sm:text-xs font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] leading-tight">
                    {reg.name}
                  </span>
                </div>
              ))}

              {/* NPC Pins */}
              {(Object.keys(NPCS) as NpcId[]).map((nid) => {
                const rt = npcRuntimeRef.current[nid];
                return (
                  <div
                    key={nid}
                    style={{
                      left: `${(rt.x / WORLD_COLS) * 100}%`,
                      top: `${(rt.y / WORLD_ROWS) * 100}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
                  >
                    <span
                      style={{ backgroundColor: NPCS[nid].color }}
                      className="w-3 h-3 rounded-full border-2 border-white shadow"
                    />
                    <span className="text-[8px] font-black text-white bg-slate-950/75 px-1 rounded mt-0.5">
                      {NPCS[nid].name.split(' ')[0]}
                    </span>
                  </div>
                );
              })}

              {/* Player Pin */}
              <div
                style={{
                  left: `${(playerRef.current.x / WORLD_COLS) * 100}%`,
                  top: `${(playerRef.current.y / WORLD_ROWS) * 100}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10"
              >
                <span className="w-4 h-4 rounded-full bg-rose-500 border-2 border-yellow-300 animate-ping absolute" />
                <span className="w-4 h-4 rounded-full bg-rose-600 border-2 border-white relative shadow" />
                <span className="text-[9px] font-black text-yellow-200 bg-rose-900/90 px-1.5 rounded mt-0.5">
                  KAMU
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {ISLAND_REGIONS.map((reg) => (
                <div key={reg.id} className="p-2.5 rounded-xl bg-[#ffecc7] border-2 border-[#b97336]">
                  <p className="font-black text-[#3b1a07]">{reg.name}</p>
                  <p className="text-[11px] text-[#5c2c0e]">{reg.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= BACKPACK & CRAFTING WORKBENCH MODAL [C] ================= */}
      {showCraft && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5d59c] border-4 border-[#6f3615] ring-2 ring-[#d98a42] rounded-3xl max-w-3xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar text-[#3b1a07]">
            <div className="flex items-center justify-between border-b-2 border-[#c88d4f] pb-3">
              <h3 className="font-black text-lg flex items-center gap-2">
                <Hammer className="text-[#92400e]" size={20} /> Tas Ransel & Meja Kerajinan Pulau
              </h3>
              <button
                type="button"
                onClick={() => setShowCraft(false)}
                className="p-1.5 rounded-xl bg-[#8c4a1c] text-[#fff3d6]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Backpack Items (Eat for Energy or Sell!) */}
            <div className="space-y-2">
              <h4 className="font-black text-sm text-[#5c2c0e]">Isi Tas (Ikan, Tambang, Hutan, Ternak & Olahan)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                {(Object.keys(BAG_ITEMS) as BagItemId[])
                  .filter((bid) => (saveState.bagItems[bid] || 0) > 0)
                  .map((bid) => {
                    const def = BAG_ITEMS[bid];
                    const qty = saveState.bagItems[bid] || 0;
                    return (
                      <div
                        key={bid}
                        className="p-2.5 rounded-xl bg-[#ffecc7] border-2 border-[#b97336] flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={getPixelBagItemDataUrl(bid)}
                            alt={def.name}
                            style={{ imageRendering: 'pixelated' }}
                            className="w-7 h-7 object-contain shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-black truncate">
                              {def.name} <span className="text-[#92400e]">x{qty}</span>
                            </p>
                            <p className="text-[10px] text-[#5c2c0e]">Jual {def.sellPrice}G</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {def.energyRestore && (
                            <button
                              type="button"
                              onClick={() => eatBagItem(bid)}
                              className="px-2 py-1 rounded-lg bg-[#16a34a] text-white font-black text-[10px]"
                            >
                              +{def.energyRestore} E
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => sellBagItem(bid)}
                            className="px-2 py-1 rounded-lg bg-[#d97706] text-white font-black text-[10px]"
                          >
                            Jual
                          </button>
                        </div>
                      </div>
                    );
                  })}
                {(Object.keys(BAG_ITEMS) as BagItemId[]).every(
                  (bid) => (saveState.bagItems[bid] || 0) === 0
                ) && (
                  <p className="text-xs text-[#7a3f1a] col-span-full py-3 text-center font-bold">
                    Tas kosong! Coba memancing [8], menambang [3], atau memungut buah hutan & kerang pantai.
                  </p>
                )}
              </div>
            </div>

            {/* Crafting Recipes */}
            <div className="space-y-2 pt-2 border-t-2 border-[#c88d4f]">
              <h4 className="font-black text-sm text-[#5c2c0e]">Resep Kerajinan & Olahan</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {CRAFT_RECIPES.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-2xl bg-[#ffecc7] border-2 border-[#b97336] flex flex-col justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <p className="font-black text-sm">{rec.title}</p>
                      <p className="text-[11px] text-[#5c2c0e]">{rec.desc}</p>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {rec.ingredients.map((ing) => (
                          <span
                            key={ing.id}
                            className="px-2 py-0.5 rounded-md bg-[#f5d59c] border border-[#8c4a1c] text-[10px] font-black"
                          >
                            {ing.label} x{ing.qty}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => craftItem(rec.id)}
                      className="w-full py-2 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-black border border-[#451a03]"
                    >
                      Rakit Sekarang
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= VILLAGE SEED SHOP MODAL ================= */}
      {showShop && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5d59c] border-4 border-[#6f3615] ring-2 ring-[#d98a42] rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar text-[#3b1a07]">
            <div className="flex items-center justify-between border-b-2 border-[#c88d4f] pb-3">
              <div>
                <h3 className="font-black text-lg flex items-center gap-2">
                  <ShoppingBag className="text-[#b45309]" size={20} /> Toko Benih Mbak Sari
                </h3>
                <p className="text-xs text-[#7a3f1a] font-black tabular-nums">
                  Koin Kamu: {saveState.gold} G · Bab Cerita {Math.min(5, saveState.storyChapter)}/5
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowShop(false)}
                className="p-2 rounded-xl bg-[#8c4a1c] text-[#fff3d6]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {(Object.keys(CROPS) as CropId[]).map((cid) => {
                const c = CROPS[cid];
                const locked = saveState.storyChapter < c.unlockChapter;
                return (
                  <div
                    key={cid}
                    className={cn(
                      'p-3 rounded-2xl border-2 flex flex-col justify-between gap-2',
                      locked
                        ? 'bg-[#e6c387]/50 border-[#b97336]/50 opacity-65'
                        : 'bg-[#ffecc7] border-[#b97336]'
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm flex items-center gap-1.5">
                          <img
                            src={getPixelCropDataUrl(cid)}
                            alt={c.name}
                            style={{ imageRendering: 'pixelated' }}
                            className="w-6 h-6 object-contain"
                          />
                          {c.name}
                        </span>
                        <span className="text-[#92400e] font-black tabular-nums">{c.seedCost} G</span>
                      </div>
                      <p className="text-[11px] text-[#5c2c0e] font-medium">{c.desc}</p>
                      <p className="text-[11px] text-emerald-800 font-bold tabular-nums">
                        Tumbuh {c.daysToGrow} hari · Jual {c.sellPrice} G
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={locked || saveState.gold < c.seedCost}
                      onClick={() => buyItem('seed', cid)}
                      className="w-full py-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-40 text-white border border-[#14532d] font-black"
                    >
                      {locked
                        ? `Terbuka di Bab ${c.unlockChapter}`
                        : `Beli 1 Benih (Dimiliki: ${saveState.seeds[cid] || 0})`}
                    </button>
                  </div>
                );
              })}

              <div className="p-3 rounded-2xl bg-[#ffecc7] border-2 border-[#ca8a04] flex flex-col justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm flex items-center gap-1.5">
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
                  <p className="text-[11px] text-[#5c2c0e]">
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
                    <span className="font-black text-sm flex items-center gap-1.5">
                      <img
                        src={getPixelToolDataUrl('sprinkler')}
                        alt="Sprinkler"
                        style={{ imageRendering: 'pixelated' }}
                        className="w-6 h-6 object-contain"
                      />
                      Sprinkler Otomatis
                    </span>
                    <span className="text-[#92400e] font-black">350 G</span>
                  </div>
                  <p className="text-[11px] text-[#5c2c0e]">
                    Menyiram 4 petak di sekitarnya otomatis tiap pagi!
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

      {/* ================= HARVEST BASKET / SHIPPING BIN MODAL ================= */}
      {showBasket && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5d59c] border-4 border-[#6f3615] ring-2 ring-[#d98a42] rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl text-[#3b1a07]">
            <div className="flex items-center justify-between border-b-2 border-[#c88d4f] pb-3">
              <h3 className="font-black text-lg flex items-center gap-2">
                <Package className="text-[#4f46e5]" size={20} /> Keranjang & Peti Jual
              </h3>
              <button
                type="button"
                onClick={() => setShowBasket(false)}
                className="p-1.5 rounded-xl bg-[#8c4a1c] text-[#fff3d6]"
              >
                <X size={16} />
              </button>
            </div>

            {basketTotalCount === 0 ? (
              <p className="text-xs text-[#5c2c0e] font-bold text-center py-6">
                Keranjang panen masih kosong. Panen tanaman di kebun!
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
                      <div className="font-black flex items-center gap-2">
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

      {/* ================= MORNING REPORT MODAL ================= */}
      {daySummary && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5d59c] border-4 border-[#6f3615] ring-2 ring-[#d98a42] rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl text-[#3b1a07]">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#6f3615] mx-auto shadow-lg">
              <img
                src={berkebunPortraitImg}
                alt="Laporan Pagi Swarnadwipa"
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
              <p className="font-bold">
                Hasil Panen Terkirim: <strong>{daySummary.shippedItems} item</strong>
              </p>
              <p className="text-emerald-800 font-black text-base">
                Pendapatan Semalam: +{daySummary.shippedGold} G
              </p>
              <p className="text-[#92400e] font-bold">
                Telur Ayam Pagi Ini: +{daySummary.eggsLaid} di Kandang Ayam!
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
