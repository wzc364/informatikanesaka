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
  Sword,
  Save,
  Flame,
  HeartPulse,
  ShieldAlert,
  Bomb,
} from 'lucide-react';
import { cn } from '../utils';
import { doc, getDoc, setDoc, getDocs, query, collection, where } from 'firebase/firestore';
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
  INTERIORS,
  TOOL_UPGRADE_TIERS,
  TOOL_UPGRADE_NAMES,
  MINE_COLS,
  MINE_ROWS,
  createInitialIslandGrid,
  createInitialTrees,
  getNpcExclusiveLocation,
  generateUndergroundFloor,
  type Season,
  type Weather,
  type CropId,
  type BagItemId,
  type NpcId,
  type InteriorId,
  type FurnitureItem,
  type FarmTile,
  type WorldTree,
  type UpgradeableToolId,
  type UndergroundCell,
  type UndergroundMonster,
} from './berkebunWorldData';
import {
  loadAllStardewSprites,
  getStardewPixelAtlas,
  getPixelCropDataUrl,
  getPixelToolDataUrl,
  getPixelBagItemDataUrl,
  getPixelGoldSprinklerDataUrl,
  getAiFarmerPoseSprite,
  getAiNpcPoseSprite,
  renderPixelWorldMapCanvas,
  type StardewSprites,
  type PixelAtlas,
  type StardewToolId,
  type FarmerPose,
  type FarmerDir,
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

const WATER_CAPS = [20, 32, 48, 70];

interface FarmSaveState {
  version: number;
  day: number;
  seasonIdx: number;
  weather: Weather;
  gold: number;
  totalEarnedGold: number;
  stamina: number;
  hp: number;
  maxHp: number;
  waterLevel: number;
  sprinklerCount: number;
  goldSprinklerCount: number;
  fertilizerCount: number;
  useGoldSprinklerMode?: boolean;
  storyChapter: number; // 1..5, 6 = Finale completed!
  islandHealed: boolean;
  coopEggsReady: number;
  toolLevels: Record<UpgradeableToolId, number>;
  seeds: Record<CropId, number>;
  harvestBasket: Record<string, { cropId: CropId; quality: 'normal' | 'gold'; qty: number }>;
  bagItems: Partial<Record<BagItemId, number>>;
  chestItems: Partial<Record<BagItemId, number>>;
  dailyFlags: {
    fireWarmedDay?: number;
    tableEatenDay?: number;
    woodTakenDay?: number;
    blessedDay?: number;
    coopFedDay?: number;
  };
  savedPlayerPos?: { x: number; y: number };
  savedMinuteOfDay?: number;
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
    treesChopped: number;
    monstersSlain: number;
  };
  claimedQuests: string[];
  tiles: FarmTile[];
  trees: WorldTree[];
}

function createInitialSave(): FarmSaveState {
  const initialTiles = createInitialIslandGrid();
  return {
    version: 4,
    day: 1,
    seasonIdx: 0,
    weather: 'Cerah',
    gold: 250,
    totalEarnedGold: 0,
    stamina: 100,
    hp: 100,
    maxHp: 100,
    waterLevel: 20,
    sprinklerCount: 0,
    goldSprinklerCount: 0,
    fertilizerCount: 4,
    storyChapter: 1,
    islandHealed: false,
    coopEggsReady: 1,
    toolLevels: {
      hoe: 1,
      water: 1,
      axe: 1,
      pick: 1,
      sword: 1,
      rod: 1,
    },
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
      wood_res: 4,
      stone_res: 3,
      torch_item: 2,
      hp_potion: 2,
      mine_bomb: 1,
    },
    chestItems: {},
    dailyFlags: {},
    savedPlayerPos: { x: 22.5, y: 21.2 },
    savedMinuteOfDay: 360,
    npcHearts: {
      raka: 1,
      sari: 1,
      jaka: 0,
      maya: 0,
      bima: 0,
      lira: 0,
      kiran: 0,
      tara: 0,
      dewi: 0,
      bagas: 0,
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
      treesChopped: 0,
      monstersSlain: 0,
    },
    claimedQuests: [],
    tiles: initialTiles,
    trees: createInitialTrees(initialTiles),
  };
}

function normalizeSaveState(raw: Partial<FarmSaveState>): FarmSaveState {
  const fresh = createInitialSave();
  const hasValidTiles =
    raw.version === 4 && Array.isArray(raw.tiles) && raw.tiles.length === WORLD_COLS * WORLD_ROWS;
  const tiles = hasValidTiles ? raw.tiles! : fresh.tiles;
  const trees =
    hasValidTiles && Array.isArray(raw.trees) && raw.trees.length > 0 ? raw.trees : fresh.trees;
  return {
    ...fresh,
    ...raw,
    version: 4,
    hp: typeof raw.hp === 'number' ? raw.hp : fresh.hp,
    maxHp: typeof raw.maxHp === 'number' ? raw.maxHp : fresh.maxHp,
    toolLevels: { ...fresh.toolLevels, ...(raw.toolLevels || {}) },
    seeds: { ...fresh.seeds, ...(raw.seeds || {}) },
    bagItems: { ...fresh.bagItems, ...(raw.bagItems || {}) },
    chestItems: { ...(raw.chestItems || {}) },
    dailyFlags: { ...(raw.dailyFlags || {}) },
    npcHearts: { ...fresh.npcHearts, ...(raw.npcHearts || {}) },
    stats: { ...fresh.stats, ...(raw.stats || {}) },
    tiles,
    trees,
  };
}

function playFarmSound(
  type:
    | 'hoe'
    | 'water'
    | 'plant'
    | 'harvest'
    | 'coin'
    | 'sleep'
    | 'clear'
    | 'error'
    | 'story'
    | 'fish'
    | 'chop'
    | 'sword'
    | 'bomb'
    | 'hit',
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
    } else if (type === 'clear' || type === 'chop') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(type === 'chop' ? 185 : 210, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'sword') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      osc.start(now);
      osc.stop(now + 0.11);
    } else if (type === 'bomb') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.28);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'hit') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      osc.start(now);
      osc.stop(now + 0.13);
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
  const storageKey = `berkebun_pulau_tik_v4_${currentStudent?.id || (isAdmin ? 'admin' : 'guest')}`;
  const v3Key = `berkebun_pulau_tik_v3_${currentStudent?.id || (isAdmin ? 'admin' : 'guest')}`;
  const legacyKey = `berkebun_swarnadwipa_v2_${currentStudent?.id || (isAdmin ? 'admin' : 'guest')}`;

  const [saveState, setSaveState] = useState<FarmSaveState>(() => {
    try {
      const rawV4 = localStorage.getItem(storageKey);
      if (rawV4) {
        const parsed = JSON.parse(rawV4) as Partial<FarmSaveState>;
        if (parsed && Array.isArray(parsed.tiles) && parsed.tiles.length === WORLD_COLS * WORLD_ROWS) {
          return normalizeSaveState(parsed);
        }
      }
      // Migrate from v3 (54x38 -> 78x52) or v2 safely keeping player stats, gold, crops, hearts
      for (const oldKey of [v3Key, legacyKey]) {
        const oldRaw = localStorage.getItem(oldKey);
        if (oldRaw) {
          const old = JSON.parse(oldRaw) as Partial<FarmSaveState>;
          if (old && (old.version === 3 || old.version === 2)) {
            return normalizeSaveState({ ...old, tiles: undefined, trees: undefined, savedPlayerPos: { x: 22.5, y: 21.2 } });
          }
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
    saveState.stats.treesChopped > 0 ||
    saveState.storyChapter > 1 ||
    saveState.totalEarnedGold > 0;

  const [viewMode, setViewMode] = useState<'menu' | 'play'>('menu');
  const [showTutorial, setShowTutorial] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showBasket, setShowBasket] = useState(false);
  const [showCraft, setShowCraft] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showChest, setShowChest] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showWorldMap, setShowWorldMap] = useState(false);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [currentInterior, setCurrentInterior] = useState<InteriorId | null>(null);
  const [undergroundFloor, setUndergroundFloor] = useState<number | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

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
    'Selamat datang di Kepulauan Pulau TIK! Tebang pohon dengan Kapak [3], upgrade alat di Bengkel Kiran, & simpan progres kapan saja.'
  );
  // 0..1439 internal minute (360 = 06:00 Siang, 1080 = 06:00 Malam). 20 min real = 12 game hours (720 mins) -> 0.6 game min/real sec
  const [minuteOfDay, setMinuteOfDay] = useState<number>(() => saveState.savedMinuteOfDay ?? 360);
  const floatMinuteRef = useRef<number>(saveState.savedMinuteOfDay ?? 360);

  // MC Active Buffs (timestamps in ms)
  const speedUntilRef = useRef<number>(0);
  const torchUntilRef = useRef<number>(0);
  const baitUntilRef = useRef<number>(0);
  const invulnUntilRef = useRef<number>(0);

  // Player & Smooth Camera Refs + Full Action Pose State
  const startPos = saveState.savedPlayerPos || { x: 22.5, y: 21.2 };
  const playerRef = useRef({
    x: startPos.x,
    y: startPos.y, // Right outside Farmhouse front porch!
    dir: 1 as FarmerDir,
    moving: false,
    swingTimer: 0,
    actionPose: 'idle' as FarmerPose,
    actionTimer: 0,
  });
  const interiorPosRef = useRef({
    x: 6.5,
    y: 7.2,
    dir: 3 as FarmerDir,
    moving: false,
    actionPose: 'idle' as FarmerPose,
    actionTimer: 0,
  });
  const cameraRef = useRef({
    x: Math.max(0, startPos.x * TILE_SIZE - VIEW_W / 2),
    y: Math.max(0, startPos.y * TILE_SIZE - VIEW_H / 2),
  });

  // Underground Mine Runtime Refs
  const mineCellsRef = useRef<UndergroundCell[]>([]);
  const mineMonstersRef = useRef<UndergroundMonster[]>([]);
  const mineDropsRef = useRef<{ id: number; x: number; y: number; bagId: BagItemId; qty: number }[]>([]);
  const mineBombsRef = useRef<{ id: number; x: number; y: number; timer: number }[]>([]);
  const minePosRef = useRef({ x: 8.5, y: 2.8, dir: 1 as FarmerDir, moving: false, actionPose: 'idle' as FarmerPose, actionTimer: 0 });
  const returnMineSpotRef = useRef<{ x: number; y: number }>({ x: 54.5, y: 8.6 });
  const undergroundFloorRef = useRef<number | null>(null);
  undergroundFloorRef.current = undergroundFloor;
  const minuteOfDayRef = useRef<number>(minuteOfDay);
  minuteOfDayRef.current = minuteOfDay;

  // Living roaming NPCs (all 10 villagers) & Farm Chickens
  const npcRuntimeRef = useRef<
    Record<NpcId, { x: number; y: number; dir: FarmerDir; targetX: number; targetY: number; pauseTimer: number }>
  >({
    raka: { x: NPCS.raka.baseX, y: NPCS.raka.baseY, dir: 1, targetX: NPCS.raka.baseX, targetY: NPCS.raka.baseY, pauseTimer: 60 },
    sari: { x: NPCS.sari.baseX, y: NPCS.sari.baseY, dir: 1, targetX: NPCS.sari.baseX, targetY: NPCS.sari.baseY, pauseTimer: 90 },
    jaka: { x: NPCS.jaka.baseX, y: NPCS.jaka.baseY, dir: 1, targetX: NPCS.jaka.baseX, targetY: NPCS.jaka.baseY, pauseTimer: 80 },
    maya: { x: NPCS.maya.baseX, y: NPCS.maya.baseY, dir: 1, targetX: NPCS.maya.baseX, targetY: NPCS.maya.baseY, pauseTimer: 70 },
    bima: { x: NPCS.bima.baseX, y: NPCS.bima.baseY, dir: 1, targetX: NPCS.bima.baseX, targetY: NPCS.bima.baseY, pauseTimer: 85 },
    lira: { x: NPCS.lira.baseX, y: NPCS.lira.baseY, dir: 1, targetX: NPCS.lira.baseX, targetY: NPCS.lira.baseY, pauseTimer: 65 },
    kiran: { x: NPCS.kiran.baseX, y: NPCS.kiran.baseY, dir: 1, targetX: NPCS.kiran.baseX, targetY: NPCS.kiran.baseY, pauseTimer: 75 },
    tara: { x: NPCS.tara.baseX, y: NPCS.tara.baseY, dir: 1, targetX: NPCS.tara.baseX, targetY: NPCS.tara.baseY, pauseTimer: 80 },
    dewi: { x: NPCS.dewi.baseX, y: NPCS.dewi.baseY, dir: 1, targetX: NPCS.dewi.baseX, targetY: NPCS.dewi.baseY, pauseTimer: 70 },
    bagas: { x: NPCS.bagas.baseX, y: NPCS.bagas.baseY, dir: 1, targetX: NPCS.bagas.baseX, targetY: NPCS.bagas.baseY, pauseTimer: 60 },
  });

  const chickensRef = useRef([
    { x: 27.5, y: 20.8, dir: 1, variant: 'white' as const, timer: 40 },
    { x: 28.8, y: 21.1, dir: -1, variant: 'brown' as const, timer: 70 },
    { x: 29.7, y: 20.6, dir: 1, variant: 'white' as const, timer: 95 },
  ]);

  const keysPressedRef = useRef<Record<string, boolean>>({});
  const particlesRef = useRef<Particle[]>([]);
  const particleIdRef = useRef(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const minimapRef = useRef<HTMLCanvasElement | null>(null);
  const worldMapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentInteriorRef = useRef<InteriorId | null>(null);
  currentInteriorRef.current = currentInterior;
  const spritesRef = useRef<StardewSprites>({
    farmer: null,
    farmerPoses: {},
    farmhouse: null,
    shop: null,
    bin: null,
    tree: null,
    palmTree: null,
    coop: null,
    sacredTree: null,
    lighthouse: null,
    npcs: { raka: null, sari: null, jaka: null, maya: null, bima: null, lira: null, kiran: null, tara: null, dewi: null, bagas: null },
    npcPoses: { raka: {}, sari: {}, jaka: {}, maya: {}, bima: {}, lira: {}, kiran: {}, tara: {}, dewi: {}, bagas: {} },
    npcPortraits: { raka: '', sari: '', jaka: '', maya: '', bima: '', lira: '', kiran: '', tara: '', dewi: '', bagas: '' },
    monsters: { slime: [], bat: [], golem: [] },
    mineEntrance: null,
    mineLadder: null,
    mineTorch: null,
    mineBomb: null,
    mineBoulder: null,
    forgeEmblem: null,
    bagItemAiSprites: {},
    furniture: {},
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

  const [spritesLoaded, setSpritesLoaded] = useState(false);

  // Preload AI pixel-art sprites & build atlas
  useEffect(() => {
    atlasRef.current = getStardewPixelAtlas();
    let mounted = true;
    void loadAllStardewSprites().then((loaded) => {
      if (mounted) {
        spritesRef.current = loaded;
        setSpritesLoaded(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Load cloud save if player had newer saved state in Firestore
  useEffect(() => {
    if (!currentStudent && !isAdmin) return;
    const studentId = currentStudent?.id || 'admin-preview';
    let mounted = true;
    void getDoc(doc(db, 'berkebun_saves', studentId))
      .then((snap) => {
        if (!mounted || !snap.exists()) return;
        const data = snap.data() as { payload?: string };
        if (data?.payload) {
          const parsed = JSON.parse(data.payload) as Partial<FarmSaveState>;
          const normalized = normalizeSaveState(parsed);
          setSaveState((local) => {
            // Keep whichever has more progress (day or earned gold)
            const localScore = local.day * 500 + local.totalEarnedGold + local.stats.harvested * 20;
            const cloudScore = normalized.day * 500 + normalized.totalEarnedGold + normalized.stats.harvested * 20;
            if (cloudScore > localScore) {
              if (normalized.savedPlayerPos) {
                playerRef.current.x = normalized.savedPlayerPos.x;
                playerRef.current.y = normalized.savedPlayerPos.y;
              }
              if (typeof normalized.savedMinuteOfDay === 'number') {
                floatMinuteRef.current = normalized.savedMinuteOfDay;
                setMinuteOfDay(normalized.savedMinuteOfDay);
              }
              return normalized;
            }
            return local;
          });
        }
      })
      .catch(() => {
        // Offline / rules ignored gracefully
      });
    return () => {
      mounted = false;
    };
  }, [currentStudent, isAdmin]);

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
      (st.stats.treesChopped || 0) * 15 +
      (st.stats.monstersSlain || 0) * 35 +
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

  const handleManualSave = useCallback(async () => {
    const snapshot: FarmSaveState = {
      ...saveStateRef.current,
      savedPlayerPos: {
        x: Number(playerRef.current.x.toFixed(2)),
        y: Number(playerRef.current.y.toFixed(2)),
      },
      savedMinuteOfDay: Math.floor(floatMinuteRef.current),
    };
    setSaveState(snapshot);
    try {
      localStorage.setItem(storageKey, JSON.stringify(snapshot));
    } catch {
      // ignore
    }
    if (currentStudent || isAdmin) {
      const studentId = currentStudent?.id || 'admin-preview';
      try {
        await setDoc(doc(db, 'berkebun_saves', studentId), {
          studentId,
          updatedAt: new Date().toISOString(),
          payload: JSON.stringify(snapshot),
        });
      } catch {
        // local save already succeeded
      }
      void syncScoreToCloud(snapshot);
    }
    playFarmSound('coin', soundMuted);
    setSaveFeedback('✓ Tersimpan!');
    setToastMsg('Progres permainan, posisi, alat, peti, dan pohon berhasil disimpan!');
    window.setTimeout(() => setSaveFeedback(null), 2400);
  }, [currentStudent, isAdmin, soundMuted, storageKey, syncScoreToCloud]);

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

  // Advance Day/Night Cycle: 12 game hours (720 game mins) = 20 real mins (1200 real secs) => 0.6 game min/sec!
  const advanceToMorningRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (
      viewMode !== 'play' ||
      showShop ||
      showBasket ||
      showCraft ||
      showUpgradeModal ||
      showChest ||
      showJournal ||
      showWorldMap ||
      showSleepModal ||
      showTutorial ||
      Boolean(activeNpcId) ||
      Boolean(storyEventModal) ||
      Boolean(daySummary)
    ) {
      return;
    }
    let lastTs = performance.now();
    const id = window.setInterval(() => {
      const nowTs = performance.now();
      const dtSec = Math.min(2, (nowTs - lastTs) / 1000);
      lastTs = nowTs;
      const prevF = floatMinuteRef.current;
      let nextF = prevF + dtSec * 0.6; // 720 game mins / 1200 real secs = 0.6 game min/sec
      if (prevF < 360 && nextF >= 360) {
        // Completed full 20-min night -> roll over to next morning!
        floatMinuteRef.current = 360;
        setMinuteOfDay(360);
        advanceToMorningRef.current();
        return;
      }
      if (nextF >= 1440) nextF -= 1440;
      floatMinuteRef.current = nextF;
      const rounded = Math.floor(nextF);
      setMinuteOfDay((curr) => (curr === rounded ? curr : rounded));
    }, 500);
    return () => window.clearInterval(id);
  }, [
    viewMode,
    showShop,
    showBasket,
    showCraft,
    showUpgradeModal,
    showChest,
    showJournal,
    showWorldMap,
    showSleepModal,
    showTutorial,
    activeNpcId,
    storyEventModal,
    daySummary,
  ]);

  // Fishing Bite Timer (faster with higher Rod level or Umpan Ikan)
  useEffect(() => {
    if (!fishingState || fishingState.status !== 'waiting') return;
    const rodLvl = saveStateRef.current.toolLevels.rod || 1;
    const baitFactor = baitUntilRef.current > Date.now() ? 0.62 : 1;
    const delay = Math.max(450, (1300 - (rodLvl - 1) * 200) * baitFactor + Math.random() * 1000);
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

    const st = saveStateRef.current;
    const rodLvl = st.toolLevels.rod || 1;
    const bonusLuck = (rodLvl - 1) * 0.05 + (baitUntilRef.current > Date.now() ? 0.08 : 0);
    const roll = Math.random();
    let caught: BagItemId = 'fish_carp';
    if (fs.zone === 'ocean') {
      caught =
        roll < 0.14 + bonusLuck
          ? 'fish_goldkoi'
          : roll < 0.44 + bonusLuck
            ? 'fish_lobster'
            : 'fish_snapper';
    } else {
      caught =
        roll < 0.1 + bonusLuck
          ? 'fish_goldkoi'
          : roll < 0.36 + bonusLuck
            ? 'fish_snapper'
            : 'fish_carp';
    }

    const doubleCatch = rodLvl >= 4 && Math.random() < 0.35 ? 2 : 1;
    playFarmSound('harvest', soundMuted);
    spawnParticles(fs.wx, fs.wy, '#38bdf8', 10, `+${doubleCatch} ${BAG_ITEMS[caught].name}!`);
    setFishingState(null);

    setSaveState((prev) => {
      const updated: FarmSaveState = {
        ...prev,
        stamina: Math.max(0, prev.stamina - 3),
        bagItems: { ...prev.bagItems, [caught]: (prev.bagItems[caught] || 0) + doubleCatch },
        stats: { ...prev.stats, fished: prev.stats.fished + doubleCatch },
      };
      void syncScoreToCloud(updated);
      return updated;
    });
    setToastMsg(`Berhasil memancing ${doubleCatch}× ${BAG_ITEMS[caught].name} (${BAG_ITEMS[caught].sellPrice}G)!`);
  }, [soundMuted, spawnParticles, syncScoreToCloud]);

  // Sleep & Advance Next Day (grows crops, regrows trees, spawns forage/ores, lays coop eggs, auto-ships basket!)
  const handleSleepNextDay = useCallback(() => {
    playFarmSound('sleep', soundMuted);
    setFishingState(null);
    setUndergroundFloor(null);
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

        // Respawn natural forage & mining ores across expanded 78x52 islands
        let nextDebris = t.debris;
        if (!nextDebris && !t.crop && !t.tilled) {
          const r = Math.random();
          if (t.kind === 'forest_floor' && r < 0.05) {
            nextDebris = r < 0.025 ? 'forage_mushroom' : 'forage_berry';
          } else if (t.kind === 'sand' && r < 0.025) {
            nextDebris = 'forage_shell';
          } else if (
            t.kind === 'plaza' &&
            ((t.x >= 47 && t.x <= 59 && t.y >= 3 && t.y <= 15 && t.y !== 8) || (t.x >= 62 && t.y <= 22)) &&
            r < 0.08
          ) {
            nextDebris = r < 0.018 ? 'ore_star' : r < 0.044 ? 'ore_silver' : 'ore_copper';
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

      // Tree regrowth: stumps completely chopped regrow after 3 days
      const newTrees = prev.trees.map((tree) => {
        if (tree.hp === 0 && tree.stumpDaysLeft > 0) {
          const left = tree.stumpDaysLeft - 1;
          if (left <= 0) {
            return { ...tree, hp: tree.maxHp, stumpDaysLeft: 0 };
          }
          return { ...tree, stumpDaysLeft: left };
        }
        return tree;
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
        hp: prev.maxHp,
        coopEggsReady: Math.min(6, prev.coopEggsReady + eggsLaid),
        harvestBasket: {},
        npcTalkedToday: {},
        npcGiftedToday: {},
        tiles: newTiles,
        trees: newTrees,
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
    setShowSleepModal(false);
    floatMinuteRef.current = 360;
    setMinuteOfDay(360);
    setToastMsg('Selamat pagi di Kepulauan Pulau TIK! Energi & HP pulih 100%.');
  }, [soundMuted, syncScoreToCloud]);

  advanceToMorningRef.current = handleSleepNextDay;

  const fastForwardTime = useCallback(
    (mode: 'night' | 'plus3h') => {
      playFarmSound('sleep', soundMuted);
      setShowSleepModal(false);
      if (mode === 'night') {
        floatMinuteRef.current = 1080; // 06:00 Malam
        setMinuteOfDay(1080);
        setSaveState((prev) => ({
          ...prev,
          stamina: Math.min(100, prev.stamina + 35),
          hp: Math.min(prev.maxHp, prev.hp + 25),
        }));
        setToastMsg('Waktu dipercepat ke Malam Hari (06:00 Malam) · Energi +35 & HP +25!');
      } else {
        const cur = floatMinuteRef.current;
        let next = cur + 180;
        if (cur < 360 && next >= 360) {
          handleSleepNextDay();
          return;
        }
        if (next >= 1440) next -= 1440;
        floatMinuteRef.current = next;
        setMinuteOfDay(Math.floor(next));
        setSaveState((prev) => ({
          ...prev,
          stamina: Math.min(100, prev.stamina + 20),
          hp: Math.min(prev.maxHp, prev.hp + 15),
        }));
        setToastMsg('Beristirahat sebentar (+3 Jam) · Energi +20 & HP +15!');
      }
    },
    [handleSleepNextDay, soundMuted]
  );

  // Underground Mine Floor Management, Monster Drops & Bombs
  const goMineFloor = useCallback(
    (floor: number, returnSpot?: { x: number; y: number }) => {
      if (returnSpot) {
        returnMineSpotRef.current = returnSpot;
      }
      const { cells, monsters } = generateUndergroundFloor(floor);
      mineCellsRef.current = cells;
      mineMonstersRef.current = monsters;
      mineDropsRef.current = [];
      mineBombsRef.current = [];
      const upLadder = cells.find((c) => c.kind === 'up_ladder');
      minePosRef.current = {
        x: upLadder ? upLadder.x + 0.5 : 8.5,
        y: upLadder ? upLadder.y + 0.85 : 2.85,
        dir: 1,
        moving: false,
        actionPose: 'idle',
        actionTimer: 0,
      };
      setFishingState(null);
      setCurrentInterior(null);
      setUndergroundFloor(floor);
      playFarmSound('story', soundMuted);
      setToastMsg(
        `Memasuki Gua Bawah Tanah Lantai ${floor}! Waspadai Slime, Kelelawar & Golem. Gunakan Pedang [5] & Beliung [4]!`
      );
    },
    [soundMuted]
  );

  const exitMine = useCallback(() => {
    setUndergroundFloor(null);
    mineCellsRef.current = [];
    mineMonstersRef.current = [];
    mineDropsRef.current = [];
    mineBombsRef.current = [];
    playerRef.current.x = returnMineSpotRef.current.x;
    playerRef.current.y = returnMineSpotRef.current.y;
    playerRef.current.dir = 1;
    playerRef.current.moving = false;
    setToastMsg('Keluar dari Gua Bawah Tanah ke Pulau TIK.');
  }, []);

  const spawnMonsterDrops = useCallback((m: UndergroundMonster) => {
    const pushDrop = (bagId: BagItemId, qty = 1) => {
      mineDropsRef.current.push({
        id: particleIdRef.current++,
        x: m.x + (Math.random() - 0.5) * 0.4,
        y: m.y + (Math.random() - 0.5) * 0.4,
        bagId,
        qty,
      });
    };
    if (m.kind === 'slime') {
      pushDrop('slime_gel', 1 + (Math.random() < 0.35 ? 1 : 0));
      if (Math.random() < 0.28) pushDrop('hp_potion', 1);
      if (Math.random() < 0.3) pushDrop('ore_copper', 1);
    } else if (m.kind === 'bat') {
      pushDrop('bat_wing', 1);
      if (Math.random() < 0.35) pushDrop('ore_silver', 1);
      if (Math.random() < 0.25) pushDrop('torch_item', 1);
    } else {
      pushDrop('monster_core', 1);
      pushDrop(Math.random() < 0.45 ? 'ore_star' : 'ore_silver', 1);
      if (Math.random() < 0.5) pushDrop('hp_potion', 1);
    }
  }, []);

  const explodeMineBombAt = useCallback(
    (bx: number, by: number) => {
      playFarmSound('bomb', soundMuted);
      const gained: Partial<Record<BagItemId, number>> = {};
      let minedCount = 0;

      if (undergroundFloorRef.current !== null) {
        const nextCells = mineCellsRef.current.map((c) => {
          if (c.rock && Math.abs(c.x - bx) <= 1 && Math.abs(c.y - by) <= 1) {
            minedCount++;
            const drop: BagItemId = c.rock === 'rock' ? 'stone_res' : (c.rock as BagItemId);
            gained[drop] = (gained[drop] || 0) + 1;
            return { ...c, rock: null };
          }
          return c;
        });
        mineCellsRef.current = nextCells;

        const survivors: UndergroundMonster[] = [];
        let slainNow = 0;
        mineMonstersRef.current.forEach((m) => {
          if (Math.hypot(m.x - (bx + 0.5), m.y - (by + 0.5)) <= 2.4) {
            const newHp = m.hp - 55;
            if (newHp <= 0) {
              slainNow++;
              spawnMonsterDrops(m);
            } else {
              survivors.push({ ...m, hp: newHp, hitFlash: 14 });
            }
          } else {
            survivors.push(m);
          }
        });
        mineMonstersRef.current = survivors;
        if (minedCount > 0 || slainNow > 0) {
          setSaveState((prev) => {
            const nextBag = { ...prev.bagItems };
            (Object.keys(gained) as BagItemId[]).forEach((bid) => {
              nextBag[bid] = (nextBag[bid] || 0) + (gained[bid] || 0);
            });
            return {
              ...prev,
              bagItems: nextBag,
              stats: {
                ...prev.stats,
                oresMined: prev.stats.oresMined + minedCount,
                monstersSlain: (prev.stats.monstersSlain || 0) + slainNow,
              },
            };
          });
        }
        spawnParticles(bx, by, '#fb923c', 16, 'BOOM!');
        setToastMsg(`Bom meledak! ${minedCount} batu/bijih hancur & ${slainNow} monster tumbang!`);
      }
    },
    [soundMuted, spawnMonsterDrops, spawnParticles]
  );

  // Use MC Item (Potions, Food, Bomb, Torch, Home Totem, Fish Bait)
  const useMcItem = useCallback(
    (itemId: BagItemId) => {
      const def = BAG_ITEMS[itemId];
      const st = saveStateRef.current;
      if ((st.bagItems[itemId] || 0) <= 0) {
        setToastMsg(`${def.name} kosong di tas!`);
        return;
      }

      if (def.usableEffect === 'bomb') {
        if (undergroundFloorRef.current !== null) {
          const mp = minePosRef.current;
          mineBombsRef.current.push({
            id: particleIdRef.current++,
            x: Math.floor(mp.x),
            y: Math.floor(mp.y),
            timer: 85,
          });
          setSaveState((prev) => ({
            ...prev,
            bagItems: { ...prev.bagItems, [itemId]: Math.max(0, (prev.bagItems[itemId] || 1) - 1) },
          }));
          setToastMsg('Bom Mini dipasang! Menjauh dalam 1.4 detik...');
          return;
        }
        // Outdoor bomb clears debris in 3x3 around player
        const px = Math.floor(playerRef.current.x);
        const py = Math.floor(playerRef.current.y);
        let cleared = 0;
        const gained: Partial<Record<BagItemId, number>> = {};
        const nextTiles = st.tiles.map((t) => {
          if (t.debris && Math.abs(t.x - px) <= 1 && Math.abs(t.y - py) <= 1) {
            cleared++;
            if (t.debris === 'stone') gained.stone_res = (gained.stone_res || 0) + 1;
            else if (t.debris === 'wood') gained.wood_res = (gained.wood_res || 0) + 1;
            else if (t.debris.startsWith('ore_') || t.debris.startsWith('forage_')) {
              const bid = t.debris as BagItemId;
              gained[bid] = (gained[bid] || 0) + 1;
            }
            return { ...t, debris: null };
          }
          return t;
        });
        playFarmSound('bomb', soundMuted);
        spawnParticles(px, py, '#fb923c', 16, 'BOOM!');
        setSaveState((prev) => {
          const nextBag = { ...prev.bagItems, [itemId]: Math.max(0, (prev.bagItems[itemId] || 1) - 1) };
          (Object.keys(gained) as BagItemId[]).forEach((bid) => {
            nextBag[bid] = (nextBag[bid] || 0) + (gained[bid] || 0);
          });
          return { ...prev, bagItems: nextBag, tiles: nextTiles };
        });
        setToastMsg(`Bom Mini meledak dan membersihkan ${cleared} rintangan!`);
        return;
      }

      if (def.usableEffect === 'torch') {
        torchUntilRef.current = Date.now() + 90_000;
        playFarmSound('story', soundMuted);
        setSaveState((prev) => ({
          ...prev,
          bagItems: { ...prev.bagItems, [itemId]: Math.max(0, (prev.bagItems[itemId] || 1) - 1) },
        }));
        setToastMsg('Obor Lentera menyala terang selama 90 detik!');
        return;
      }

      if (def.usableEffect === 'totem') {
        setUndergroundFloor(null);
        setCurrentInterior(null);
        setShowCraft(false);
        setShowBasket(false);
        playerRef.current.x = 22.5;
        playerRef.current.y = 21.2;
        playerRef.current.dir = 1;
        playFarmSound('story', soundMuted);
        spawnParticles(22.5, 21.2, '#38bdf8', 14, 'Pulang Kilat!');
        setSaveState((prev) => ({
          ...prev,
          bagItems: { ...prev.bagItems, [itemId]: Math.max(0, (prev.bagItems[itemId] || 1) - 1) },
        }));
        setToastMsg('Jimat Pulang Kilat membawamu langsung ke depan Rumah Kebun!');
        return;
      }

      if (def.usableEffect === 'bait') {
        baitUntilRef.current = Date.now() + 120_000;
        playFarmSound('water', soundMuted);
        setSaveState((prev) => ({
          ...prev,
          bagItems: { ...prev.bagItems, [itemId]: Math.max(0, (prev.bagItems[itemId] || 1) - 1) },
        }));
        setToastMsg('Umpan Ikan aktif 2 menit! Ikan menyambar lebih cepat & peluang langka naik!');
        return;
      }

      const isSpeedCoffee = itemId === 'artisan_coffee';
      if (isSpeedCoffee) {
        speedUntilRef.current = Date.now() + 45_000;
      }

      const eAdd = def.energyRestore || 0;
      const hpAdd = def.hpRestore || 0;
      if (eAdd > 0 || hpAdd > 0 || isSpeedCoffee) {
        playFarmSound('harvest', soundMuted);
        setSaveState((prev) => ({
          ...prev,
          stamina: Math.min(100, prev.stamina + eAdd),
          hp: Math.min(prev.maxHp, prev.hp + hpAdd),
          bagItems: { ...prev.bagItems, [itemId]: Math.max(0, (prev.bagItems[itemId] || 1) - 1) },
        }));
        setToastMsg(
          `Menggunakan ${def.name}${eAdd ? ` (+${eAdd} Energi)` : ''}${hpAdd ? ` (+${hpAdd} HP)` : ''}${isSpeedCoffee ? ' · Lari Cepat 45 detik!' : ''}!`
        );
      }
    },
    [soundMuted, spawnParticles]
  );

  // Tool Upgrade Action (Lv.1 -> Lv.4 at Kiran's Forge / Jaka / Bagas)
  const handleUpgradeTool = useCallback(
    (toolId: UpgradeableToolId) => {
      const st = saveStateRef.current;
      const curLvl = st.toolLevels[toolId] || 1;
      if (curLvl >= 4) {
        setToastMsg(`${TOOL_UPGRADE_NAMES[toolId]} sudah mencapai level maksimal (Lv.4)!`);
        return;
      }
      const tier = TOOL_UPGRADE_TIERS.find((t) => t.level === curLvl + 1);
      if (!tier) return;
      const woodHave = st.bagItems.wood_res || 0;
      const oreHave = st.bagItems[tier.oreId] || 0;
      if (st.gold < tier.goldCost || woodHave < tier.woodCost || oreHave < tier.oreQty) {
        playFarmSound('error', soundMuted);
        setToastMsg('Gold, Kayu, atau Bijih belum cukup untuk upgrade ini!');
        return;
      }
      playFarmSound('story', soundMuted);
      setSaveState((prev) => ({
        ...prev,
        gold: prev.gold - tier.goldCost,
        toolLevels: { ...prev.toolLevels, [toolId]: curLvl + 1 },
        waterLevel: toolId === 'water' ? WATER_CAPS[curLvl] : prev.waterLevel,
        bagItems: {
          ...prev.bagItems,
          wood_res: woodHave - tier.woodCost,
          [tier.oreId]: oreHave - tier.oreQty,
        },
      }));
      setToastMsg(`${TOOL_UPGRADE_NAMES[toolId]} berhasil ditempa menjadi ${tier.tierName}!`);
    },
    [soundMuted]
  );

  // Chest Deposit / Withdraw
  const handleChestTransfer = useCallback(
    (itemId: BagItemId, mode: 'deposit' | 'withdraw') => {
      playFarmSound('plant', soundMuted);
      setSaveState((prev) => {
        if (mode === 'deposit') {
          const have = prev.bagItems[itemId] || 0;
          if (have <= 0) return prev;
          return {
            ...prev,
            bagItems: { ...prev.bagItems, [itemId]: have - 1 },
            chestItems: { ...prev.chestItems, [itemId]: (prev.chestItems[itemId] || 0) + 1 },
          };
        }
        const inChest = prev.chestItems[itemId] || 0;
        if (inChest <= 0) return prev;
        return {
          ...prev,
          chestItems: { ...prev.chestItems, [itemId]: inChest - 1 },
          bagItems: { ...prev.bagItems, [itemId]: (prev.bagItems[itemId] || 0) + 1 },
        };
      });
    },
    [soundMuted]
  );

  const enterBuilding = useCallback((interiorId: InteriorId) => {
    const def = INTERIORS[interiorId];
    setFishingState(null);
    setCurrentInterior(interiorId);
    interiorPosRef.current = {
      x: def.exitTile.x + 0.5,
      y: def.exitTile.y - 0.75,
      dir: 3,
      moving: false,
      actionPose: 'idle',
      actionTimer: 0,
    };
    setToastMsg(`Masuk ke ${def.title} (${def.themeLabel}). Berjalan ke pintu bawah untuk keluar.`);
  }, []);

  const exitBuilding = useCallback(() => {
    const intId = currentInteriorRef.current;
    if (!intId) return;
    const def = INTERIORS[intId];
    setCurrentInterior(null);
    playerRef.current.x = def.outdoorExit.x;
    playerRef.current.y = def.outdoorExit.y;
    playerRef.current.dir = 1;
    playerRef.current.moving = false;
    setToastMsg('Keluar kembali ke Kepulauan Pulau TIK.');
  }, []);

  const interactInteriorFurniture = useCallback(
    (item: FurnitureItem) => {
      const st = saveStateRef.current;
      if (item.interactAction === 'sleep') {
        setShowSleepModal(true);
      } else if (item.interactAction === 'shop') {
        const sariLoc = getNpcExclusiveLocation('sari', minuteOfDayRef.current, st.weather);
        if (sariLoc !== 'shop') {
          setToastMsg('Mbak Sari sedang istirahat malam. Kembali lagi pukul 06:00 Siang!');
          return;
        }
        setShowShop(true);
      } else if (item.interactAction === 'craft') {
        setShowCraft(true);
      } else if (item.interactAction === 'upgrade') {
        setShowUpgradeModal(true);
      } else if (item.interactAction === 'chest') {
        setShowChest(true);
      } else if (item.interactAction === 'journal') {
        setShowJournal(true);
      } else if (item.interactAction === 'map') {
        setShowWorldMap(true);
      } else if (item.interactAction === 'tv_weather') {
        const nextSeason = SEASONS[Math.floor(st.day / 10) % SEASONS.length];
        setToastMsg(
          `Prakiraan TV Desa: Hari ke-${st.day}, cuaca saat ini ${st.weather}, musim ${SEASONS[st.seasonIdx % 4]} (berikutnya ${nextSeason}).`
        );
      } else if (item.interactAction === 'warm_fire') {
        if (st.dailyFlags.fireWarmedDay === st.day) {
          setToastMsg('Perapian hangat berderak nyaman. Bonus kehangatan hari ini sudah diambil.');
          return;
        }
        playFarmSound('story', soundMuted);
        setSaveState((prev) => ({
          ...prev,
          stamina: Math.min(100, prev.stamina + 25),
          hp: Math.min(prev.maxHp, prev.hp + 15),
          dailyFlags: { ...prev.dailyFlags, fireWarmedDay: prev.day },
        }));
        setToastMsg('Menghangatkan diri di Perapian! Energi +25 & HP +15.');
      } else if (item.interactAction === 'eat_table') {
        if (st.dailyFlags.tableEatenDay === st.day) {
          setToastMsg('Meja makan sudah dibersihkan. Camilan harian tersedia lagi besok pagi.');
          return;
        }
        playFarmSound('harvest', soundMuted);
        setSaveState((prev) => ({
          ...prev,
          stamina: Math.min(100, prev.stamina + 35),
          hp: Math.min(prev.maxHp, prev.hp + 25),
          dailyFlags: { ...prev.dailyFlags, tableEatenDay: prev.day },
        }));
        setToastMsg('Menyantap hidangan hangat di Meja Makan! Energi +35 & HP +25.');
      } else if (item.interactAction === 'water_plant') {
        playFarmSound('water', soundMuted);
        setToastMsg('Tanaman hias dalam ruangan disiram segar! Rumah terasa lebih hidup.');
      } else if (item.interactAction === 'wood_pile') {
        if (st.dailyFlags.woodTakenDay === st.day) {
          setToastMsg('Tumpukan kayu bengkel sudah diambil jatahnya hari ini.');
          return;
        }
        playFarmSound('chop', soundMuted);
        setSaveState((prev) => ({
          ...prev,
          bagItems: { ...prev.bagItems, wood_res: (prev.bagItems.wood_res || 0) + 3 },
          dailyFlags: { ...prev.dailyFlags, woodTakenDay: prev.day },
        }));
        setToastMsg('Pak Jaka berbagi +3 Kayu Keras dari Tumpukan Kayu!');
      } else if (item.interactAction === 'blessing') {
        if (st.dailyFlags.blessedDay === st.day) {
          setToastMsg('Aura hijau kuali ramuan masih melindungimu hari ini.');
          return;
        }
        playFarmSound('story', soundMuted);
        setSaveState((prev) => ({
          ...prev,
          stamina: Math.min(100, prev.stamina + 25),
          hp: Math.min(prev.maxHp, prev.hp + 30),
          dailyFlags: { ...prev.dailyFlags, blessedDay: prev.day },
        }));
        setToastMsg('Berkah Kuali Ramuan Nenek Maya! Energi +25 & HP +30.');
      } else if (item.interactAction === 'beacon') {
        torchUntilRef.current = Date.now() + 90_000;
        playFarmSound('story', soundMuted);
        setToastMsg('Lentera Mercusuar menyalurkan cahaya terang (buff Obor 90 detik)!');
      } else if (item.interactAction === 'feed_coop') {
        if (st.dailyFlags.coopFedDay === st.day) {
          setToastMsg('Ayam-ayam sudah kenyang diberi makan hari ini!');
          return;
        }
        playFarmSound('harvest', soundMuted);
        setSaveState((prev) => ({
          ...prev,
          coopEggsReady: Math.min(6, prev.coopEggsReady + 1),
          dailyFlags: { ...prev.dailyFlags, coopFedDay: prev.day },
        }));
        setToastMsg('Memberi pakan ayam kandang! +1 Telur segar siap diambil di Kotak Sarang!');
      } else if (item.interactAction === 'hay_rest') {
        playFarmSound('sleep', soundMuted);
        setSaveState((prev) => ({ ...prev, stamina: Math.min(100, prev.stamina + 15) }));
        setToastMsg('Duduk santai di Tumpukan Jerami... Energi +15!');
      } else if (item.interactAction === 'telescope') {
        setToastMsg(
          `Teleskop Mercusuar: Cuaca ${st.weather}, Musim ${SEASONS[st.seasonIdx % SEASONS.length]}. Ada 5 pulau & 2 pintu Gua Tambang!`
        );
      } else if (item.interactAction === 'eggs') {
        if (st.coopEggsReady <= 0) {
          setToastMsg('Sarang jerami masih kosong. Beri pakan ayam atau cek besok pagi!');
          return;
        }
        const qty = st.coopEggsReady;
        const isGoldEgg = st.storyChapter >= 3 && Math.random() < 0.45;
        const eggKey: BagItemId = isGoldEgg ? 'egg_gold' : 'egg_normal';
        playFarmSound('harvest', soundMuted);
        setSaveState((prev) => ({
          ...prev,
          coopEggsReady: 0,
          bagItems: { ...prev.bagItems, [eggKey]: (prev.bagItems[eggKey] || 0) + qty },
        }));
        setToastMsg(`Mengambil ${qty} ${BAG_ITEMS[eggKey].name} dari Kotak Sarang!`);
      } else if (item.infoText) {
        setToastMsg(item.infoText);
      } else {
        setToastMsg(`${item.name} tertata rapi.`);
      }
    },
    [soundMuted]
  );

  // Helper: get tile offsets based on tool upgrade level (Lv1: 1, Lv2: 2 ahead, Lv3: 3 line, Lv4: 3x3)
  const getToolTargetTiles = useCallback((tx: number, ty: number, lvl: number, dir: FarmerDir) => {
    const out: { x: number; y: number }[] = [{ x: tx, y: ty }];
    if (lvl === 2) {
      const dx = dir === 0 ? 1 : dir === 2 ? -1 : 0;
      const dy = dir === 1 ? 1 : dir === 3 ? -1 : 0;
      out.push({ x: tx + dx, y: ty + dy });
    } else if (lvl === 3) {
      if (dir === 0 || dir === 2) {
        out.push({ x: tx, y: ty - 1 }, { x: tx, y: ty + 1 });
      } else {
        out.push({ x: tx - 1, y: ty }, { x: tx + 1, y: ty });
      }
    } else if (lvl >= 4) {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx !== 0 || dy !== 0) out.push({ x: tx + dx, y: ty + dy });
        }
      }
    }
    return out;
  }, []);

  // Interact at grid coordinate (Mine Combat/Mining, Interior, NPC, Trees, Buildings, Crops, Mining, Foraging, Fishing)
  const interactAtTile = useCallback(
    (tx: number, ty: number) => {
      const st = saveStateRef.current;

      // BRANCH 1: UNDERGROUND MINE INTERACTION
      const mFloor = undergroundFloorRef.current;
      if (mFloor !== null) {
        const mp = minePosRef.current;
        const swordLvl = st.toolLevels.sword || 1;
        const pickLvl = st.toolLevels.pick || 1;

        // Sword Slash / Attack Monster if using sword OR clicking directly near a monster!
        const swordRange = swordLvl >= 4 ? 2.9 : swordLvl >= 3 ? 2.4 : 2.0;
        const hitTarget = mineMonstersRef.current.find(
          (m) =>
            Math.hypot(m.x - (tx + 0.5), m.y - (ty + 0.5)) < 1.55 &&
            Math.hypot(m.x - mp.x, m.y - mp.y) <= swordRange
        );
        if (activeTool === 'sword' || hitTarget) {
          mp.actionPose = 'swing_up';
          mp.actionTimer = 15;
          playFarmSound('sword', soundMuted);
          const dmg = 16 + (swordLvl - 1) * 14;
          const nextMonsters: UndergroundMonster[] = [];
          let hitCount = 0;
          let slainCount = 0;
          mineMonstersRef.current.forEach((m) => {
            const dPlayer = Math.hypot(m.x - mp.x, m.y - mp.y);
            const dClick = Math.hypot(m.x - (tx + 0.5), m.y - (ty + 0.5));
            if (dPlayer <= swordRange && (dClick < 1.9 || activeTool === 'sword')) {
              hitCount++;
              const nhp = m.hp - dmg;
              const kAng = Math.atan2(m.y - mp.y, m.x - mp.x);
              if (nhp <= 0) {
                slainCount++;
                spawnMonsterDrops(m);
                spawnParticles(m.x, m.y, '#f43f5e', 10, `${m.kind.toUpperCase()} Kalah!`);
              } else {
                nextMonsters.push({
                  ...m,
                  hp: nhp,
                  hitFlash: 12,
                  x: Math.max(1.4, Math.min(MINE_COLS - 1.4, m.x + Math.cos(kAng) * 0.45)),
                  y: Math.max(1.4, Math.min(MINE_ROWS - 1.4, m.y + Math.sin(kAng) * 0.45)),
                });
                spawnParticles(m.x, m.y, '#fbbf24', 5, `-${dmg}`);
              }
            } else {
              nextMonsters.push(m);
            }
          });
          mineMonstersRef.current = nextMonsters;
          if (slainCount > 0) {
            setSaveState((prev) => ({
              ...prev,
              stats: { ...prev.stats, monstersSlain: (prev.stats.monstersSlain || 0) + slainCount },
            }));
          }
          if (hitCount > 0) {
            setToastMsg(
              slainCount > 0
                ? `${slainCount} monster dikalahkan! Ambil item drop di tanah!`
                : `Menyerang monster (-${dmg} HP)!`
            );
          }
          return;
        }

        const cellIdx = ty * MINE_COLS + tx;
        const cell = mineCellsRef.current[cellIdx];
        if (!cell) return;
        if (Math.hypot(tx + 0.5 - mp.x, ty + 0.5 - mp.y) > 2.8) {
          setToastMsg('Dekati tangga atau batu gua terlebih dulu!');
          return;
        }
        if (cell.kind === 'up_ladder') {
          if (mFloor <= 1) exitMine();
          else goMineFloor(mFloor - 1);
          return;
        }
        if (cell.kind === 'down_ladder') {
          goMineFloor(mFloor + 1);
          return;
        }
        if (cell.rock) {
          if (st.stamina < 2) {
            setToastMsg('Energi terlalu rendah! Minum Ramuan atau makan camilan di Tas.');
            playFarmSound('error', soundMuted);
            return;
          }
          mp.actionPose = 'swing_up';
          mp.actionTimer = 16;
          playFarmSound('clear', soundMuted);
          const itemDrop: BagItemId = cell.rock === 'rock' ? 'stone_res' : (cell.rock as BagItemId);
          const qty = pickLvl >= 3 && Math.random() < 0.45 ? 2 : 1;
          mineCellsRef.current[cellIdx] = { ...cell, rock: null };
          spawnParticles(tx, ty, '#c084fc', 8, `+${qty} ${BAG_ITEMS[itemDrop].name}`);
          setSaveState((prev) => ({
            ...prev,
            stamina: Math.max(0, prev.stamina - 2),
            bagItems: { ...prev.bagItems, [itemDrop]: (prev.bagItems[itemDrop] || 0) + qty },
            stats: { ...prev.stats, oresMined: prev.stats.oresMined + 1 },
          }));
          setToastMsg(`Menambang ${qty}× ${BAG_ITEMS[itemDrop].name} di Lantai ${mFloor}!`);
        }
        return;
      }

      // BRANCH 2: BUILDING INTERIOR INTERACTION (Checks all NPCs exclusively inside right now!)
      const intId = currentInteriorRef.current;
      if (intId) {
        const def = INTERIORS[intId];
        if (tx === def.exitTile.x && ty === def.exitTile.y) {
          exitBuilding();
          return;
        }
        const ip = interiorPosRef.current;
        const indoorNpcs = (Object.keys(NPCS) as NpcId[]).filter(
          (nid) => getNpcExclusiveLocation(nid, minuteOfDayRef.current, st.weather) === intId
        );
        for (const nid of indoorNpcs) {
          const base = def.residentPos || { x: Math.floor(def.cols / 2), y: 3 };
          const nPos =
            nid === def.residentNpc ? base : { x: Math.min(def.cols - 2, base.x + 2.2), y: base.y + 0.5 };
          const distNpc = Math.hypot(nPos.x - (tx + 0.5), nPos.y - (ty + 0.5));
          const distP = Math.hypot(nPos.x - ip.x, nPos.y - ip.y);
          if (distNpc < 1.35 && distP < 3.0) {
            openNpcDialogue(nid);
            return;
          }
        }
        const clickedFurn = def.furniture.find(
          (f) => !f.walkable && tx >= f.x && tx < f.x + f.w && ty >= f.y && ty < f.y + f.h
        );
        if (clickedFurn) {
          const fcx = clickedFurn.x + clickedFurn.w / 2;
          const fcy = clickedFurn.y + clickedFurn.h / 2;
          if (Math.hypot(fcx - ip.x, fcy - ip.y) > 3.2) {
            setToastMsg(`Dekati ${clickedFurn.name} terlebih dulu!`);
            return;
          }
          interactInteriorFurniture(clickedFurn);
          return;
        }
        return;
      }

      if (fishingRef.current) {
        reelFishingRod();
        return;
      }
      if (tx < 0 || tx >= WORLD_COLS || ty < 0 || ty >= WORLD_ROWS) return;

      // 1. Check nearby OUTDOOR NPC near clicked tile first!
      const p = playerRef.current;
      for (const npcId of Object.keys(NPCS) as NpcId[]) {
        if (getNpcExclusiveLocation(npcId, minuteOfDayRef.current, st.weather) !== 'outdoor') continue;
        const npcPos = npcRuntimeRef.current[npcId];
        const distToClick = Math.hypot(npcPos.x - (tx + 0.5), npcPos.y - (ty + 0.5));
        const distToPlayer = Math.hypot(npcPos.x - p.x, npcPos.y - p.y);
        if (distToClick < 1.35 && distToPlayer < 3.4) {
          openNpcDialogue(npcId);
          return;
        }
      }

      const idx = ty * WORLD_COLS + tx;
      const tile = st.tiles[idx];
      if (!tile) return;

      const dist = Math.hypot(tx + 0.5 - p.x, ty + 0.5 - p.y);
      if (dist > 3.4) {
        setToastMsg('Terlalu jauh! Dekati objek tersebut terlebih dulu.');
        playFarmSound('error', soundMuted);
        return;
      }

      // 2. Landmark Interactions (Enter Buildings & Mine Entrances!)
      if (tile.kind === 'house') { enterBuilding('house'); return; }
      if (tile.kind === 'shop') { enterBuilding('shop'); return; }
      if (tile.kind === 'elder_hall') { enterBuilding('elder_hall'); return; }
      if (tile.kind === 'jaka_cabin') { enterBuilding('jaka_cabin'); return; }
      if (tile.kind === 'maya_hut') { enterBuilding('maya_hut'); return; }
      if (tile.kind === 'lighthouse') { enterBuilding('lighthouse'); return; }
      if (tile.kind === 'coop') { enterBuilding('coop'); return; }
      if (tile.kind === 'forge') { enterBuilding('forge'); return; }
      if (tile.kind === 'dewi_hut') { enterBuilding('dewi_hut'); return; }
      if (tile.kind === 'explorer_post') { enterBuilding('explorer_post'); return; }
      if (tile.kind === 'mine_entrance') {
        goMineFloor(1, { x: tx + 0.5, y: ty + 1.5 });
        return;
      }
      if (tile.kind === 'bin') { setShowBasket(true); return; }
      if (tile.kind === 'workbench') { setShowCraft(true); return; }
      if (tile.kind === 'ship') {
        if (getNpcExclusiveLocation('bima', minuteOfDayRef.current, st.weather) === 'outdoor') {
          openNpcDialogue('bima');
        } else {
          setToastMsg('Kapal Kargo Kapten Bima bersandar rapi. Temui Bima di Mercusuar saat malam/hujan!');
        }
        return;
      }
      if (tile.kind === 'altar') {
        if (getNpcExclusiveLocation('lira', minuteOfDayRef.current, st.weather) === 'outdoor') {
          openNpcDialogue('lira');
        } else {
          setToastMsg('Altar Mustika Suci bersinar tenang. Temui Lira di Balai Tetua saat malam/hujan.');
        }
        return;
      }
      if (tile.kind === 'sacred_tree') {
        if (st.storyChapter === 5) {
          advanceStoryChapter(st);
        } else if (st.islandHealed) {
          playFarmSound('story', soundMuted);
          spawnParticles(tx, ty, '#f472b6', 14, 'Cahaya Abadi!');
          setToastMsg('Pohon Cahaya Abadi bersinar penuh berkat keempat Mustika Pulau TIK!');
        } else {
          setToastMsg(`Pohon Cahaya Abadi menunggu 4 Mustika (Saat ini: Bab ${st.storyChapter}/5).`);
        }
        return;
      }

      // 3. Water / Fishing Interactions
      const maxWater = WATER_CAPS[Math.min(3, (st.toolLevels.water || 1) - 1)];
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
        setSaveState((prev) => ({ ...prev, waterLevel: maxWater }));
        playFarmSound('water', soundMuted);
        spawnParticles(tx, ty, '#38bdf8', 8, `Air ${maxWater}/${maxWater}!`);
        setToastMsg(`Penyiram diisi ulang penuh (${maxWater}/${maxWater})!`);
        return;
      }

      // Trigger explicit tool/action poses on valid outdoor action!
      const triggerPose = (pose: FarmerPose, ticks = 18) => {
        p.actionPose = pose;
        p.actionTimer = ticks;
        p.swingTimer = ticks;
      };

      // 3.5 CHOPPABLE STANDING TREES & STUMPS (Slot 3: Kapak)
      const hitTreeIdx = st.trees.findIndex(
        (tr) => tr.x === tx && tr.y === ty && (tr.hp > 0 || tr.stumpDaysLeft === 0)
      );
      if (hitTreeIdx !== -1) {
        const tree = st.trees[hitTreeIdx];
        if (activeTool !== 'axe') {
          setToastMsg('Gunakan Kapak (Slot [3]) untuk menebang pohon atau tunggul ini menjadi Kayu!');
          playFarmSound('error', soundMuted);
          return;
        }
        if (st.stamina < 2) {
          setToastMsg('Energi habis untuk menebang pohon!');
          playFarmSound('error', soundMuted);
          return;
        }
        triggerPose('swing_up', 18);
        playFarmSound('chop', soundMuted);
        const axeLvl = st.toolLevels.axe || 1;
        const dmg = axeLvl >= 4 ? 4 : axeLvl;
        if (tree.hp > 0) {
          const nextHp = Math.max(0, tree.hp - dmg);
          if (nextHp === 0) {
            const woodDrop = 4 + (axeLvl >= 3 ? 2 : 0) + Math.floor(Math.random() * 2);
            const bonusBerry = Math.random() < 0.4 ? 1 : 0;
            spawnParticles(tx, ty, '#a16207', 12, `+${woodDrop} Kayu Keras!`);
            setSaveState((prev) => {
              const nextTrees = [...prev.trees];
              nextTrees[hitTreeIdx] = { ...tree, hp: 0, stumpDaysLeft: 0 };
              return {
                ...prev,
                stamina: Math.max(0, prev.stamina - 3),
                bagItems: {
                  ...prev.bagItems,
                  wood_res: (prev.bagItems.wood_res || 0) + woodDrop,
                  ...(bonusBerry > 0 ? { forage_berry: (prev.bagItems.forage_berry || 0) + 1 } : {}),
                },
                stats: { ...prev.stats, treesChopped: (prev.stats.treesChopped || 0) + 1 },
                trees: nextTrees,
              };
            });
            setToastMsg(`Pohon tumbang! +${woodDrop} Kayu Keras${bonusBerry ? ' & +1 Beri Liar' : ''}! Tebang tunggul untuk ekstra kayu.`);
          } else {
            spawnParticles(tx, ty, '#d97706', 5, `Tebang (${nextHp}/${tree.maxHp})`);
            setSaveState((prev) => {
              const nextTrees = [...prev.trees];
              nextTrees[hitTreeIdx] = { ...tree, hp: nextHp };
              return { ...prev, stamina: Math.max(0, prev.stamina - 2), trees: nextTrees };
            });
            setToastMsg(`Menebang pohon... Sisa ketahanan ${nextHp}/${tree.maxHp}.`);
          }
        } else {
          // Chop remaining Stump -> +2 wood_res, regrows in 3 days!
          spawnParticles(tx, ty, '#92400e', 8, '+2 Kayu Tunggul!');
          setSaveState((prev) => {
            const nextTrees = [...prev.trees];
            nextTrees[hitTreeIdx] = { ...tree, hp: 0, stumpDaysLeft: 3 };
            return {
              ...prev,
              stamina: Math.max(0, prev.stamina - 2),
              bagItems: { ...prev.bagItems, wood_res: (prev.bagItems.wood_res || 0) + 2 },
              trees: nextTrees,
            };
          });
          setToastMsg('Tunggul dibersihkan! +2 Kayu Keras (tunas baru tumbuh dalam 3 hari).');
        }
        return;
      }

      // 4. Foraging Wild Items (instant pickup regardless of tool!)
      if (
        tile.debris === 'forage_mushroom' ||
        tile.debris === 'forage_berry' ||
        tile.debris === 'forage_shell'
      ) {
        triggerPose('harvest', 16);
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
        triggerPose('harvest', 18);
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

      // 6. Pickaxe Clearing & Mining Ores (with Tool Level scaling!)
      if (activeTool === 'pick') {
        if (st.stamina < 2) {
          setToastMsg('Energi habis! Tidur di Rumah atau gunakan Jamu/Makanan di Tas.');
          playFarmSound('error', soundMuted);
          return;
        }
        triggerPose('swing_up', 18);
        const pickLvl = st.toolLevels.pick || 1;
        if (tile.debris === 'ore_copper' || tile.debris === 'ore_silver' || tile.debris === 'ore_star') {
          const oreId = tile.debris as BagItemId;
          const qty = pickLvl >= 3 && Math.random() < 0.45 ? 2 : 1;
          playFarmSound('clear', soundMuted);
          spawnParticles(tx, ty, '#c084fc', 9, `+${qty} ${BAG_ITEMS[oreId].name}`);
          setSaveState((prev) => {
            const newTiles = [...prev.tiles];
            newTiles[idx] = { ...tile, debris: null };
            const updated: FarmSaveState = {
              ...prev,
              stamina: Math.max(0, prev.stamina - 3),
              bagItems: { ...prev.bagItems, [oreId]: (prev.bagItems[oreId] || 0) + qty },
              stats: { ...prev.stats, oresMined: prev.stats.oresMined + 1 },
              tiles: newTiles,
            };
            void syncScoreToCloud(updated);
            return updated;
          });
          setToastMsg(`Menambang ${qty}× ${BAG_ITEMS[oreId].name}!`);
          return;
        }
        if (tile.debris === 'stone' || tile.debris === 'wood' || tile.debris === 'weed') {
          const bagGain: BagItemId | null =
            tile.debris === 'stone' ? 'stone_res' : tile.debris === 'wood' ? 'wood_res' : null;
          const qty = bagGain && pickLvl >= 3 ? 2 : 1;
          const bonusGold = tile.debris === 'weed' ? 6 : 4;
          playFarmSound('clear', soundMuted);
          spawnParticles(
            tx,
            ty,
            '#fbbf24',
            7,
            bagGain ? `+${qty} ${BAG_ITEMS[bagGain].name}` : `+${bonusGold}G`
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
                ? { ...prev.bagItems, [bagGain]: (prev.bagItems[bagGain] || 0) + qty }
                : prev.bagItems,
              tiles: newTiles,
            };
          });
          setToastMsg(bagGain ? `Mendapat ${qty}× ${BAG_ITEMS[bagGain].name} + ${bonusGold}G!` : 'Gulma dibersihkan!');
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

      // 7. Soil Farming (with Hoe & Water multi-tile upgrade area!)
      if (tile.kind !== 'grass') {
        setToastMsg('Lahan ini tidak bisa dicangkul! Berkebunlah di padang rumput hijau.');
        return;
      }
      if (st.stamina < 2 && (activeTool === 'hoe' || activeTool === 'water')) {
        setToastMsg('Energi habis! Tidur di Rumah atau konsumsi Jamu/Buah di Tas.');
        playFarmSound('error', soundMuted);
        return;
      }

      if (activeTool === 'hoe') {
        if (tile.debris) {
          setToastMsg('Bersihkan rintangan dulu dengan Beliung (Slot [4])!');
          playFarmSound('error', soundMuted);
          return;
        }
        const hoeLvl = st.toolLevels.hoe || 1;
        const targets = getToolTargetTiles(tx, ty, hoeLvl, p.dir);
        let tilledCount = 0;
        const newTiles = [...st.tiles];
        targets.forEach((pt) => {
          if (pt.x < 0 || pt.x >= WORLD_COLS || pt.y < 0 || pt.y >= WORLD_ROWS) return;
          const i2 = pt.y * WORLD_COLS + pt.x;
          const t2 = newTiles[i2];
          if (t2 && t2.kind === 'grass' && !t2.debris && !t2.tilled && !st.trees.some((tr) => tr.x === pt.x && tr.y === pt.y && tr.stumpDaysLeft === 0)) {
            newTiles[i2] = { ...t2, tilled: true, watered: st.weather === 'Hujan' };
            tilledCount++;
            spawnParticles(pt.x, pt.y, '#92400e', 5);
          }
        });
        if (tilledCount === 0) {
          setToastMsg('Tanah sudah siap ditanami! Pilih Benih (Slot [7]).');
          return;
        }
        triggerPose('swing_up', 18);
        playFarmSound('hoe', soundMuted);
        setSaveState((prev) => ({
          ...prev,
          stamina: Math.max(0, prev.stamina - 2),
          tiles: newTiles,
        }));
        setToastMsg(`${tilledCount} petak tanah digemburkan!`);
        return;
      }

      if (activeTool === 'water') {
        if (st.waterLevel <= 0) {
          setToastMsg('Air habis! Isi ulang di Kolam, Sumur Desa, atau Sungai.');
          playFarmSound('error', soundMuted);
          return;
        }
        const waterLvl = st.toolLevels.water || 1;
        const targets = getToolTargetTiles(tx, ty, waterLvl, p.dir);
        let wateredCount = 0;
        const newTiles = [...st.tiles];
        targets.forEach((pt) => {
          if (pt.x < 0 || pt.x >= WORLD_COLS || pt.y < 0 || pt.y >= WORLD_ROWS) return;
          const i2 = pt.y * WORLD_COLS + pt.x;
          const t2 = newTiles[i2];
          if (t2 && t2.tilled && !t2.watered) {
            newTiles[i2] = { ...t2, watered: true };
            wateredCount++;
            spawnParticles(pt.x, pt.y, '#38bdf8', 6);
          }
        });
        if (wateredCount === 0) {
          if (!tile.tilled) setToastMsg('Cangkul tanah dulu sebelum menyiram.');
          else setToastMsg('Petak ini sudah basah disiram.');
          return;
        }
        triggerPose('water', 16);
        playFarmSound('water', soundMuted);
        setSaveState((prev) => ({
          ...prev,
          stamina: Math.max(0, prev.stamina - 2),
          waterLevel: Math.max(0, prev.waterLevel - 1),
          tiles: newTiles,
        }));
        return;
      }

      if (activeTool === 'seed') {
        const cDef = CROPS[selectedSeed];
        if ((st.seeds[selectedSeed] || 0) <= 0) {
          setToastMsg(`Benih ${cDef.name} habis! Beli di Toko Benih Desa Purnama.`);
          playFarmSound('error', soundMuted);
          return;
        }
        if (!tile.tilled || tile.crop || tile.hasSprinkler || tile.hasGoldSprinkler) {
          setToastMsg('Tanam di tanah cangkul yang masih kosong!');
          playFarmSound('error', soundMuted);
          return;
        }
        triggerPose('plant', 18);
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
        triggerPose('plant', 16);
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
        triggerPose('plant', 16);
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
      enterBuilding,
      exitBuilding,
      exitMine,
      goMineFloor,
      getToolTargetTiles,
      interactInteriorFurniture,
      openNpcDialogue,
      advanceStoryChapter,
      reelFishingRod,
      spawnMonsterDrops,
      spawnParticles,
      syncScoreToCloud,
    ]
  );

  const triggerFacingAction = useCallback(() => {
    if (undergroundFloorRef.current !== null) {
      const mp = minePosRef.current;
      const fx = Math.floor(mp.x + (mp.dir === 0 ? 0.9 : mp.dir === 2 ? -0.9 : 0));
      const fy = Math.floor(mp.y + (mp.dir === 1 ? 0.9 : mp.dir === 3 ? -0.9 : 0));
      interactAtTile(fx, fy);
      return;
    }
    const intId = currentInteriorRef.current;
    if (intId) {
      const ip = interiorPosRef.current;
      const fx = Math.floor(ip.x + (ip.dir === 0 ? 0.85 : ip.dir === 2 ? -0.85 : 0));
      const fy = Math.floor(ip.y + (ip.dir === 1 ? 0.85 : ip.dir === 3 ? -0.85 : 0));
      interactAtTile(fx, fy);
      return;
    }
    if (fishingRef.current) {
      reelFishingRod();
      return;
    }
    const p = playerRef.current;
    const st = saveStateRef.current;
    // Check nearby OUTDOOR NPC directly in front first
    for (const npcId of Object.keys(NPCS) as NpcId[]) {
      if (getNpcExclusiveLocation(npcId, minuteOfDayRef.current, st.weather) !== 'outdoor') continue;
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

  // Keyboard Listeners (WASD/Arrows + Space/E + 1..0 + C/J/M)
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
        setShowUpgradeModal(false);
        setShowChest(false);
        setShowJournal(false);
        setShowWorldMap(false);
        setShowSleepModal(false);
        setActiveNpcId(null);
        return;
      }

      if (k === ' ' || k === 'e') {
        e.preventDefault();
        if (
          !showShop &&
          !showBasket &&
          !showCraft &&
          !showUpgradeModal &&
          !showChest &&
          !showJournal &&
          !showWorldMap &&
          !showSleepModal &&
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
      else if (k === '3') setActiveTool('axe');
      else if (k === '4') setActiveTool('pick');
      else if (k === '5') setActiveTool('sword');
      else if (k === '6') setActiveTool('harvest');
      else if (k === '7') setActiveTool('seed');
      else if (k === '8') setActiveTool('fertilizer');
      else if (k === '9') setActiveTool('sprinkler');
      else if (k === '0') setActiveTool('rod');
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
    showUpgradeModal,
    showChest,
    showJournal,
    showWorldMap,
    showSleepModal,
    showTutorial,
    activeNpcId,
    storyEventModal,
    daySummary,
    triggerFacingAction,
  ]);

  // Main 60fps Big-Island + Underground Mine + Interior Camera-Following Stardew Renderer
  useEffect(() => {
    if (viewMode !== 'play') return;
    let rafId: number;
    if (!atlasRef.current) atlasRef.current = getStardewPixelAtlas();

    const loop = (now: number) => {
      const st = saveStateRef.current;
      const atlas = atlasRef.current;
      const sprites = spritesRef.current;
      const intId = currentInteriorRef.current;
      const mFloor = undergroundFloorRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const curSeason = SEASONS[st.seasonIdx % SEASONS.length];
      const walkCycle: FarmerPose[] = ['walk1', 'idle', 'walk2', 'idle'];
      const walkPoseNow = walkCycle[Math.floor(now / 135) % 4];
      const speedMult = speedUntilRef.current > Date.now() ? 1.42 : 1;

      // ---------------- BRANCH A: BUILDING INTERIOR SCENE ----------------
      if (intId) {
        const def = INTERIORS[intId];
        const ip = interiorPosRef.current;
        const keys = keysPressedRef.current;
        let vx = 0;
        let vy = 0;
        if (!activeNpcRef.current && !showSleepModal && !showShop && !showCraft && !showUpgradeModal && !showChest) {
          if (keys['w'] || keys['arrowup']) vy -= 1;
          if (keys['s'] || keys['arrowdown']) vy += 1;
          if (keys['a'] || keys['arrowleft']) vx -= 1;
          if (keys['d'] || keys['arrowright']) vx += 1;
        }

        const canWalkInterior = (cx: number, cy: number) => {
          const tx = Math.floor(cx);
          const ty = Math.floor(cy);
          if (tx < 1 || tx > def.cols - 2) return false;
          if (ty === def.exitTile.y && tx === def.exitTile.x) return true;
          if (ty < 1 || ty > def.rows - 2) return false;
          for (const f of def.furniture) {
            if (!f.walkable && cx >= f.x + 0.12 && cx <= f.x + f.w - 0.12 && cy >= f.y + 0.12 && cy <= f.y + f.h - 0.12) {
              return false;
            }
          }
          return true;
        };

        if (vx !== 0 || vy !== 0) {
          const len = Math.hypot(vx, vy);
          const speed = 0.085 * speedMult;
          const nx = ip.x + (vx / len) * speed;
          const ny = ip.y + (vy / len) * speed;
          if (canWalkInterior(nx, ip.y)) ip.x = nx;
          if (canWalkInterior(ip.x, ny)) ip.y = ny;
          if (Math.abs(vx) >= Math.abs(vy)) ip.dir = vx > 0 ? 0 : 2;
          else ip.dir = vy > 0 ? 1 : 3;
          ip.moving = true;
        } else {
          ip.moving = false;
        }
        if (ip.actionTimer > 0) {
          ip.actionTimer--;
          if (ip.actionTimer === 0) ip.actionPose = 'idle';
        }

        // Auto-exit when walking onto the doorway mat!
        if (Math.floor(ip.x) === def.exitTile.x && Math.floor(ip.y) === def.exitTile.y && vy > 0) {
          exitBuilding();
        }

        if (canvas && ctx && atlas) {
          ctx.imageSmoothingEnabled = false;
          ctx.fillStyle = '#120a05';
          ctx.fillRect(0, 0, VIEW_W, VIEW_H);

          const ox = Math.floor((VIEW_W - def.cols * TILE_SIZE) / 2);
          const oy = Math.floor((VIEW_H - def.rows * TILE_SIZE) / 2);

          ctx.save();
          ctx.translate(ox, oy);

          const isNightWindow = minuteOfDay >= 1080 || minuteOfDay < 360;
          const isSunsetWindow = minuteOfDay >= 990 && minuteOfDay < 1080;

          for (let y = 0; y < def.rows; y++) {
            for (let x = 0; x < def.cols; x++) {
              const px = x * TILE_SIZE;
              const py = y * TILE_SIZE;

              if (y === 0) {
                ctx.fillStyle = def.wallColor;
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = def.wallAccent;
                ctx.fillRect(px, py + TILE_SIZE - 8, TILE_SIZE, 5);
                ctx.fillStyle = '#291408';
                ctx.fillRect(px, py + TILE_SIZE - 3, TILE_SIZE, 3);
                if (x === 3 || x === 9) {
                  ctx.fillStyle = '#3b1d0c';
                  ctx.fillRect(px + 8, py + 7, 32, 26);
                  ctx.fillStyle = isNightWindow ? '#0f172a' : isSunsetWindow ? '#fb923c' : '#7dd3fc';
                  ctx.fillRect(px + 11, py + 10, 26, 20);
                  if (isNightWindow) {
                    ctx.fillStyle = '#fef08a';
                    ctx.fillRect(px + 15, py + 13, 3, 3);
                    ctx.fillRect(px + 28, py + 16, 2, 2);
                  }
                  ctx.fillStyle = '#78350f';
                  ctx.fillRect(px + 23, py + 10, 2, 20);
                  ctx.fillRect(px + 11, py + 19, 26, 2);
                }
              } else if (x === 0 || x === def.cols - 1 || y === def.rows - 1) {
                if (x === def.exitTile.x && y === def.exitTile.y) {
                  ctx.fillStyle = '#7c2d12';
                  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                  ctx.fillStyle = '#f59e0b';
                  ctx.fillRect(px + 6, py + 8, TILE_SIZE - 12, TILE_SIZE - 16);
                  ctx.fillStyle = '#fffbeb';
                  ctx.font = 'bold 9px monospace';
                  ctx.textAlign = 'center';
                  ctx.fillText('KELUAR', px + 24, py + 27);
                } else {
                  ctx.fillStyle = '#2a1306';
                  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                  ctx.fillStyle = def.wallColor;
                  ctx.fillRect(px + 3, py + 3, TILE_SIZE - 6, TILE_SIZE - 6);
                }
              } else {
                if (def.floorStyle === 'wood') {
                  ctx.fillStyle = (x + y) % 2 === 0 ? '#c88346' : '#bd783d';
                  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                  ctx.fillStyle = '#9a5a26';
                  ctx.fillRect(px, py + 15, TILE_SIZE, 2);
                  ctx.fillRect(px, py + 31, TILE_SIZE, 2);
                  ctx.fillRect(px + ((y % 2) * 24), py, 2, TILE_SIZE);
                } else if (def.floorStyle === 'stone' || def.floorStyle === 'cobble') {
                  ctx.fillStyle = (x + y) % 2 === 0 ? '#94a3b8' : '#7c8ba1';
                  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                  ctx.fillStyle = '#475569';
                  ctx.fillRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
                  ctx.fillStyle = (x + y) % 2 === 0 ? '#cbd5e1' : '#94a3b8';
                  ctx.fillRect(px + 3, py + 3, TILE_SIZE - 6, TILE_SIZE - 6);
                } else if (def.floorStyle === 'mystic') {
                  ctx.fillStyle = (x + y) % 2 === 0 ? '#4c1d95' : '#3b1775';
                  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                  ctx.fillStyle = '#6d28d9';
                  ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                } else {
                  ctx.fillStyle = (x + y) % 2 === 0 ? '#d9a441' : '#c79030';
                  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                  ctx.fillStyle = '#fde047';
                  if ((x * 5 + y * 3) % 3 === 0) ctx.fillRect(px + 10, py + 16, 12, 3);
                }
              }
            }
          }

          // Walkable rugs first
          def.furniture
            .filter((f) => f.walkable)
            .forEach((f) => {
              const sp = sprites.furniture[f.kind] || (f.kind !== 'rug' ? atlas.furniture[f.kind] : undefined);
              if (sp) ctx.drawImage(sp, f.x * TILE_SIZE, f.y * TILE_SIZE, f.w * TILE_SIZE, f.h * TILE_SIZE);
            });

          const intQueue: Array<{ sortY: number; render: () => void }> = [];

          def.furniture
            .filter((f) => !f.walkable)
            .forEach((f) => {
              intQueue.push({
                sortY: (f.y + f.h) * TILE_SIZE,
                render: () => {
                  const fx = f.x * TILE_SIZE;
                  const fy = f.y * TILE_SIZE;
                  const fw = f.w * TILE_SIZE;
                  const fh = f.h * TILE_SIZE;
                  ctx.fillStyle = 'rgba(0,0,0,0.22)';
                  ctx.fillRect(fx + 4, fy + fh - 6, fw - 8, 8);
                  const aiSp = sprites.furniture[f.kind];
                  const fallbackSp = f.kind !== 'rug' ? atlas.furniture[f.kind] : undefined;
                  const sp = aiSp || fallbackSp;
                  if (sp) {
                    if (aiSp) {
                      const scale = Math.min((fw - 2) / aiSp.width, (fh + 10) / aiSp.height);
                      const drawW = Math.round(aiSp.width * scale);
                      const drawH = Math.round(aiSp.height * scale);
                      const drawX = Math.round(fx + (fw - drawW) / 2);
                      const drawY = Math.round(fy + fh - drawH - 2);
                      ctx.drawImage(aiSp, drawX, drawY, drawW, drawH);
                    } else {
                      ctx.drawImage(sp, fx + 2, fy + 2, fw - 4, fh - 4);
                    }
                  }
                  if (f.kind === 'fireplace') {
                    const flicker = Math.sin(now * 0.018) * 3;
                    ctx.fillStyle = 'rgba(251, 146, 60, 0.35)';
                    ctx.beginPath();
                    ctx.arc(fx + fw / 2, fy + fh * 0.65, 22 + flicker, 0, Math.PI * 2);
                    ctx.fill();
                  } else if (f.kind === 'cauldron') {
                    const bub = Math.sin(now * 0.012) * 3;
                    ctx.fillStyle = '#4ade80';
                    ctx.fillRect(fx + fw / 2 - 4, fy + 6 + bub, 4, 4);
                    ctx.fillRect(fx + fw / 2 + 4, fy + 4 - bub, 3, 3);
                  } else if (f.kind === 'beacon_lamp') {
                    const glow = 0.28 + Math.sin(now * 0.008) * 0.1;
                    ctx.fillStyle = `rgba(254, 240, 138, ${glow.toFixed(2)})`;
                    ctx.beginPath();
                    ctx.arc(fx + fw / 2, fy + fh / 2, 46, 0, Math.PI * 2);
                    ctx.fill();
                  }
                },
              });
            });

          if (intId === 'coop') {
            [
              { x: 4.5, y: 5.5, variant: 'white' as const, dir: 1 },
              { x: 6.5, y: 4.8, variant: 'brown' as const, dir: -1 },
              { x: 8.5, y: 6.0, variant: 'white' as const, dir: 1 },
            ].forEach((ch, idx) => {
              intQueue.push({
                sortY: ch.y * TILE_SIZE,
                render: () => {
                  const sp = ch.variant === 'white' ? atlas.chickenWhite : atlas.chickenBrown;
                  const hop = Math.abs(Math.sin(now * 0.008 + idx)) * 3;
                  ctx.save();
                  ctx.translate(ch.x * TILE_SIZE, ch.y * TILE_SIZE - hop);
                  ctx.scale(ch.dir, 1);
                  ctx.drawImage(sp, -14, -24, 28, 28);
                  ctx.restore();
                },
              });
            });
          }

          // Exclusive NPCs currently inside this building!
          const indoorNpcs = (Object.keys(NPCS) as NpcId[]).filter(
            (nid) => getNpcExclusiveLocation(nid, minuteOfDay, st.weather) === intId
          );
          indoorNpcs.forEach((npcId) => {
            const base = def.residentPos || { x: Math.floor(def.cols / 2), y: 3 };
            const rPos =
              npcId === def.residentNpc ? base : { x: Math.min(def.cols - 2, base.x + 2.2), y: base.y + 0.5 };
            const sp = getAiNpcPoseSprite(sprites, npcId, 1, false, now);
            intQueue.push({
              sortY: rPos.y * TILE_SIZE + 8,
              render: () => {
                const nx = Math.round(rPos.x * TILE_SIZE);
                const ny = Math.round(rPos.y * TILE_SIZE);
                ctx.fillStyle = 'rgba(0,0,0,0.28)';
                ctx.beginPath();
                ctx.ellipse(nx, ny + 10, 12, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                if (sp) {
                  const drawH = 54;
                  const drawW = Math.round(drawH * (sp.width / sp.height));
                  ctx.drawImage(sp, Math.round(nx - drawW / 2), Math.round(ny - drawH + 14), drawW, drawH);
                }
                ctx.fillStyle = 'rgba(59, 26, 7, 0.85)';
                ctx.fillRect(nx - 28, ny + 13, 56, 12);
                ctx.fillStyle = '#fef3c7';
                ctx.font = 'bold 8px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(NPCS[npcId].name.split(' ')[0], nx, ny + 22);
              },
            });
          });

          // Farmer inside Interior with 4-step walking animation
          intQueue.push({
            sortY: ip.y * TILE_SIZE + 8,
            render: () => {
              const cx = Math.round(ip.x * TILE_SIZE);
              const cy = Math.round(ip.y * TILE_SIZE);
              const pose: FarmerPose = ip.actionTimer > 0 ? ip.actionPose : ip.moving ? walkPoseNow : 'idle';
              const poseSp = getAiFarmerPoseSprite(sprites, pose, ip.dir);
              const stride = ip.moving ? Math.abs(Math.sin(now * 0.017)) * 2.5 : 0;
              const drawH = 54;
              const drawW = Math.round(drawH * (poseSp.width / poseSp.height));

              ctx.fillStyle = 'rgba(0,0,0,0.32)';
              ctx.beginPath();
              ctx.ellipse(cx, cy + 12, 13, 5, 0, 0, Math.PI * 2);
              ctx.fill();

              ctx.drawImage(poseSp, Math.round(cx - drawW / 2), Math.round(cy - drawH + 14 - stride), drawW, drawH);
            },
          });

          intQueue.sort((a, b) => a.sortY - b.sortY);
          for (const item of intQueue) item.render();

          const fx = Math.floor(ip.x + (ip.dir === 0 ? 0.85 : ip.dir === 2 ? -0.85 : 0));
          const fy = Math.floor(ip.y + (ip.dir === 1 ? 0.85 : ip.dir === 3 ? -0.85 : 0));
          const nearFurn = def.furniture.find(
            (f) => !f.walkable && fx >= f.x && fx < f.x + f.w && fy >= f.y && fy < f.y + f.h
          );
          if (fx >= 0 && fx < def.cols && fy >= 0 && fy < def.rows) {
            const rx = fx * TILE_SIZE;
            const ry = fy * TILE_SIZE;
            ctx.fillStyle = nearFurn ? '#facc15' : '#dc2626';
            ctx.fillRect(rx + 2, ry + 2, 10, 3);
            ctx.fillRect(rx + 2, ry + 2, 3, 10);
            ctx.fillRect(rx + TILE_SIZE - 12, ry + 2, 10, 3);
            ctx.fillRect(rx + TILE_SIZE - 5, ry + 2, 3, 10);
            ctx.fillRect(rx + 2, ry + TILE_SIZE - 5, 10, 3);
            ctx.fillRect(rx + 2, ry + TILE_SIZE - 12, 3, 10);
            ctx.fillRect(rx + TILE_SIZE - 12, ry + TILE_SIZE - 5, 10, 3);
            ctx.fillRect(rx + TILE_SIZE - 5, ry + TILE_SIZE - 12, 3, 10);
          }

          ctx.restore();

          ctx.fillStyle = 'rgba(59, 26, 7, 0.9)';
          ctx.fillRect(14, 10, 310, 26);
          ctx.strokeStyle = '#d98a42';
          ctx.lineWidth = 2;
          ctx.strokeRect(14, 10, 310, 26);
          ctx.fillStyle = '#fef3c7';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`${def.title}`, 24, 27);

          if (nearFurn) {
            const hint =
              nearFurn.interactAction === 'sleep'
                ? `[Spasi/Klik] Tidur / Percepat Waktu`
                : `[Spasi/Klik] ${nearFurn.name}`;
            const hw = hint.length * 7 + 20;
            ctx.fillStyle = 'rgba(20, 83, 45, 0.92)';
            ctx.fillRect(VIEW_W / 2 - hw / 2, VIEW_H - 36, hw, 24);
            ctx.strokeStyle = '#86efac';
            ctx.strokeRect(VIEW_W / 2 - hw / 2, VIEW_H - 36, hw, 24);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(hint, VIEW_W / 2, VIEW_H - 20);
          }

          if (isNightWindow) {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
          }
        }

        rafId = requestAnimationFrame(loop);
        return;
      }

      // ---------------- BRANCH C: UNDERGROUND CAVE & MONSTERS ----------------
      if (mFloor !== null) {
        const mp = minePosRef.current;
        const keys = keysPressedRef.current;
        let vx = 0;
        let vy = 0;
        if (!activeNpcRef.current && !showCraft && !showChest && !showUpgradeModal) {
          if (keys['w'] || keys['arrowup']) vy -= 1;
          if (keys['s'] || keys['arrowdown']) vy += 1;
          if (keys['a'] || keys['arrowleft']) vx -= 1;
          if (keys['d'] || keys['arrowright']) vx += 1;
        }

        const canWalkMine = (cx: number, cy: number) => {
          const tx = Math.floor(cx);
          const ty = Math.floor(cy);
          if (tx < 1 || tx >= MINE_COLS - 1 || ty < 1 || ty >= MINE_ROWS - 1) return false;
          const cell = mineCellsRef.current[ty * MINE_COLS + tx];
          if (!cell || cell.kind === 'wall' || cell.rock) return false;
          return true;
        };

        if (vx !== 0 || vy !== 0) {
          const len = Math.hypot(vx, vy);
          const spd = 0.095 * speedMult;
          const nx = mp.x + (vx / len) * spd;
          const ny = mp.y + (vy / len) * spd;
          if (canWalkMine(nx, mp.y)) mp.x = nx;
          if (canWalkMine(mp.x, ny)) mp.y = ny;
          if (Math.abs(vx) >= Math.abs(vy)) mp.dir = vx > 0 ? 0 : 2;
          else mp.dir = vy > 0 ? 1 : 3;
          mp.moving = true;
        } else {
          mp.moving = false;
        }
        if (mp.actionTimer > 0) {
          mp.actionTimer--;
          if (mp.actionTimer === 0) mp.actionPose = 'idle';
        }

        // Update Active Bombs
        const nextBombs: typeof mineBombsRef.current = [];
        mineBombsRef.current.forEach((b) => {
          const rem = b.timer - 1;
          if (rem <= 0) {
            explodeMineBombAt(b.x, b.y);
          } else {
            nextBombs.push({ ...b, timer: rem });
          }
        });
        mineBombsRef.current = nextBombs;

        // Pickup Drops
        const remainingDrops: typeof mineDropsRef.current = [];
        const pickedUp: Partial<Record<BagItemId, number>> = {};
        mineDropsRef.current.forEach((dr) => {
          if (Math.hypot(dr.x - mp.x, dr.y - mp.y) < 1.05) {
            pickedUp[dr.bagId] = (pickedUp[dr.bagId] || 0) + dr.qty;
          } else {
            remainingDrops.push(dr);
          }
        });
        if (Object.keys(pickedUp).length > 0) {
          mineDropsRef.current = remainingDrops;
          playFarmSound('plant', soundMuted);
          setSaveState((prev) => {
            const nb = { ...prev.bagItems };
            (Object.keys(pickedUp) as BagItemId[]).forEach((bid) => {
              nb[bid] = (nb[bid] || 0) + (pickedUp[bid] || 0);
            });
            return { ...prev, bagItems: nb };
          });
        }

        // Update Monster AI & Contact Damage
        mineMonstersRef.current.forEach((m) => {
          if (m.hitFlash > 0) m.hitFlash--;
          const dist = Math.hypot(mp.x - m.x, mp.y - m.y);
          if (dist < 6.5 && dist > 0.35) {
            const dx = (mp.x - m.x) / dist;
            const dy = (mp.y - m.y) / dist;
            const nx = m.x + dx * m.speed;
            const ny = m.y + dy * m.speed;
            if (canWalkMine(nx, m.y)) m.x = nx;
            if (canWalkMine(m.x, ny)) m.y = ny;
          }
          if (dist < 0.72 && Date.now() > invulnUntilRef.current) {
            invulnUntilRef.current = Date.now() + 950;
            playFarmSound('hit', soundMuted);
            spawnParticles(mp.x, mp.y, '#ef4444', 7, `-${m.damage} HP`);
            const nextHp = Math.max(0, st.hp - m.damage);
            if (nextHp <= 0) {
              setUndergroundFloor(null);
              playerRef.current.x = 22.5;
              playerRef.current.y = 21.2;
              setSaveState((prev) => ({
                ...prev,
                hp: Math.round(prev.maxHp * 0.6),
                stamina: Math.max(20, prev.stamina - 20),
              }));
              setToastMsg('Pingsan di dalam Gua! Penduduk membawamu pulang dengan selamat.');
            } else {
              setSaveState((prev) => ({ ...prev, hp: nextHp }));
            }
          }
        });

        const mCamY = Math.max(0, Math.min(MINE_ROWS * TILE_SIZE - VIEW_H, mp.y * TILE_SIZE - VIEW_H / 2));

        if (canvas && ctx && atlas) {
          ctx.imageSmoothingEnabled = false;
          ctx.fillStyle = '#090910';
          ctx.fillRect(0, 0, VIEW_W, VIEW_H);

          ctx.save();
          ctx.translate(0, -Math.round(mCamY));

          for (const cell of mineCellsRef.current) {
            const px = cell.x * TILE_SIZE;
            const py = cell.y * TILE_SIZE;
            if (cell.kind === 'wall') {
              ctx.fillStyle = '#1e1b2e';
              ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = '#332e4d';
              ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 10);
              ctx.fillStyle = '#0f0d1a';
              ctx.fillRect(px, py + TILE_SIZE - 8, TILE_SIZE, 8);
            } else {
              ctx.fillStyle = (cell.x + cell.y) % 2 === 0 ? '#2b283a' : '#262334';
              ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = '#38344b';
              if ((cell.x * 3 + cell.y) % 4 === 0) ctx.fillRect(px + 10, py + 12, 8, 5);
            }

            if (cell.kind === 'up_ladder' || cell.kind === 'down_ladder') {
              if (sprites.mineLadder) {
                ctx.drawImage(sprites.mineLadder, px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
              } else {
                ctx.fillStyle = cell.kind === 'up_ladder' ? '#f59e0b' : '#38bdf8';
                ctx.fillRect(px + 10, py + 6, TILE_SIZE - 20, TILE_SIZE - 12);
              }
              ctx.fillStyle = cell.kind === 'up_ladder' ? '#fde047' : '#7dd3fc';
              ctx.font = 'bold 9px monospace';
              ctx.textAlign = 'center';
              ctx.fillText(cell.kind === 'up_ladder' ? 'NAIK' : 'TURUN', px + 24, py + 45);
            } else if (cell.kind === 'torch') {
              if (sprites.mineTorch) {
                ctx.drawImage(sprites.mineTorch, px + 8, py + 6, 32, 36);
              } else {
                ctx.fillStyle = '#fb923c';
                ctx.fillRect(px + 20, py + 14, 8, 18);
              }
            }

            if (cell.rock) {
              if (cell.rock === 'rock') {
                const sp = sprites.mineBoulder || atlas.stone;
                ctx.drawImage(sp, px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
              } else {
                const sp = atlas[cell.rock];
                if (sp) ctx.drawImage(sp, px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
              }
            }
          }

          // Active Bombs
          mineBombsRef.current.forEach((b) => {
            const bx = b.x * TILE_SIZE;
            const by = b.y * TILE_SIZE;
            const pulse = 1 + Math.sin(now * 0.04) * 0.12;
            ctx.save();
            ctx.translate(bx + 24, by + 24);
            ctx.scale(pulse, pulse);
            if (sprites.mineBomb) ctx.drawImage(sprites.mineBomb, -16, -16, 32, 32);
            else {
              ctx.fillStyle = '#ef4444';
              ctx.beginPath();
              ctx.arc(0, 0, 12, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          });

          // Monster Drops on cave floor
          mineDropsRef.current.forEach((dr) => {
            const bob = Math.sin(now * 0.008 + dr.id) * 2.5;
            const dx = dr.x * TILE_SIZE;
            const dy = dr.y * TILE_SIZE + bob;
            ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
            ctx.beginPath();
            ctx.arc(dx, dy, 12, 0, Math.PI * 2);
            ctx.fill();
            const sp = sprites.bagItemAiSprites[dr.bagId] || atlas.bagItems[dr.bagId];
            if (sp) ctx.drawImage(sp, dx - 11, dy - 11, 22, 22);
          });

          // Monsters
          mineMonstersRef.current.forEach((m) => {
            const mx = Math.round(m.x * TILE_SIZE);
            const my = Math.round(m.y * TILE_SIZE);
            const mFrames = sprites.monsters[m.kind] || [];
            const sp = mFrames.length > 0 ? mFrames[Math.floor(now / 260) % mFrames.length] : undefined;
            const hop = m.kind === 'bat' ? Math.sin(now * 0.018 + m.id) * 5 : Math.abs(Math.sin(now * 0.01 + m.id)) * 3;

            ctx.fillStyle = 'rgba(0,0,0,0.45)';
            ctx.beginPath();
            ctx.ellipse(mx, my + 12, 14, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            if (m.hitFlash > 0) ctx.filter = 'brightness(2)';
            if (sp) {
              const dh = m.kind === 'golem' ? 50 : 40;
              const dw = Math.round(dh * (sp.width / Math.max(1, sp.height)));
              ctx.drawImage(sp, mx - dw / 2, my - dh + 14 - hop, dw, dh);
            } else {
              ctx.fillStyle = m.kind === 'slime' ? '#22c55e' : m.kind === 'bat' ? '#a855f7' : '#64748b';
              ctx.beginPath();
              ctx.arc(mx, my - 6 - hop, 14, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.filter = 'none';

            // Monster HP bar
            const hpPct = Math.max(0, m.hp / m.maxHp);
            ctx.fillStyle = '#18181b';
            ctx.fillRect(mx - 16, my - 34, 32, 5);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(mx - 15, my - 33, Math.round(30 * hpPct), 3);
          });

          // Farmer in Cave
          {
            const cx = Math.round(mp.x * TILE_SIZE);
            const cy = Math.round(mp.y * TILE_SIZE);
            const pose: FarmerPose = mp.actionTimer > 0 ? mp.actionPose : mp.moving ? walkPoseNow : 'idle';
            const poseSp = getAiFarmerPoseSprite(sprites, pose, mp.dir);
            const stride = mp.moving ? Math.abs(Math.sin(now * 0.017)) * 2.5 : 0;
            const drawH = 54;
            const drawW = Math.round(drawH * (poseSp.width / poseSp.height));
            if (Date.now() < invulnUntilRef.current && Math.floor(now / 80) % 2 === 0) {
              ctx.globalAlpha = 0.5;
            }
            ctx.drawImage(poseSp, Math.round(cx - drawW / 2), Math.round(cy - drawH + 14 - stride), drawW, drawH);
            ctx.globalAlpha = 1;
          }

          // Particles in cave
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
              ctx.fillStyle = pt.color;
              ctx.textAlign = 'center';
              ctx.fillText(pt.label, pt.x, pt.y);
            } else {
              ctx.fillStyle = pt.color;
              ctx.fillRect(Math.round(pt.x - 2), Math.round(pt.y - 2), 4, 4);
            }
            ctx.globalAlpha = 1;
            return true;
          });

          ctx.restore();

          // Warm Torch + Player Lantern Glow Overlay
          const hasTorchBuff = torchUntilRef.current > Date.now();
          ctx.fillStyle = hasTorchBuff ? 'rgba(8, 8, 18, 0.14)' : 'rgba(6, 6, 16, 0.34)';
          ctx.fillRect(0, 0, VIEW_W, VIEW_H);
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          const pRadius = hasTorchBuff ? 195 : 115;
          const psx = mp.x * TILE_SIZE;
          const psy = mp.y * TILE_SIZE - Math.round(mCamY);
          const pGrad = ctx.createRadialGradient(psx, psy, 8, psx, psy, pRadius);
          pGrad.addColorStop(0, 'rgba(253, 224, 71, 0.25)');
          pGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.arc(psx, psy, pRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Cave HUD Banner
          ctx.fillStyle = 'rgba(24, 24, 27, 0.9)';
          ctx.fillRect(14, 10, 340, 26);
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 2;
          ctx.strokeRect(14, 10, 340, 26);
          ctx.fillStyle = '#e9d5ff';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`GUA BAWAH TANAH · LANTAI ${mFloor} · MONSTER: ${mineMonstersRef.current.length}`, 24, 27);
        }

        const mm = minimapRef.current;
        const mCtx = mm?.getContext('2d');
        if (mm && mCtx) {
          mCtx.fillStyle = '#18181b';
          mCtx.fillRect(0, 0, mm.width, mm.height);
          mCtx.fillStyle = '#c084fc';
          mCtx.font = 'bold 10px monospace';
          mCtx.textAlign = 'center';
          mCtx.fillText(`GUA LT.${mFloor}`, mm.width / 2, mm.height / 2);
        }

        rafId = requestAnimationFrame(loop);
        return;
      }

      // ---------------- BRANCH B: OUTDOOR PULAU TIK WORLD ----------------
      const tileAt = (cx: number, cy: number): FarmTile | undefined => {
        const tx = Math.floor(cx);
        const ty = Math.floor(cy);
        if (tx < 0 || tx >= WORLD_COLS || ty < 0 || ty >= WORLD_ROWS) return undefined;
        return st.tiles[ty * WORLD_COLS + tx];
      };

      const treeBlocksTile = (tx: number, ty: number) =>
        st.trees.some((tr) => tr.x === tx && tr.y === ty && tr.stumpDaysLeft === 0);

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
          t.kind === 'forge' ||
          t.kind === 'dewi_hut' ||
          t.kind === 'explorer_post' ||
          t.kind === 'mine_entrance' ||
          t.kind === 'ship' ||
          t.kind === 'sacred_tree' ||
          t.kind === 'windmill' ||
          t.kind === 'well' ||
          t.kind === 'altar'
        ) {
          return false;
        }
        // Story-gated map barriers
        if (t.kind === 'bridge' && t.x >= 41 && t.x <= 43 && t.y >= 28 && t.y <= 31 && st.storyChapter < 2) {
          return false;
        }
        if (t.kind === 'cliff_pass' && st.storyChapter < 3) return false;
        if (
          t.debris === 'stone' ||
          t.debris === 'wood' ||
          t.debris === 'ore_copper' ||
          t.debris === 'ore_silver' ||
          t.debris === 'ore_star'
        ) {
          return false;
        }
        if (treeBlocksTile(t.x, t.y)) return false;
        return true;
      };

      // Update Player Movement (pause while talking or fishing)
      const p = playerRef.current;
      const keys = keysPressedRef.current;
      let vx = 0;
      let vy = 0;
      if (!activeNpcRef.current && !fishingRef.current && !showSleepModal && !showCraft && !showBasket && !showJournal) {
        if (keys['w'] || keys['arrowup']) vy -= 1;
        if (keys['s'] || keys['arrowdown']) vy += 1;
        if (keys['a'] || keys['arrowleft']) vx -= 1;
        if (keys['d'] || keys['arrowright']) vx += 1;
      }

      if (vx !== 0 || vy !== 0) {
        const len = Math.hypot(vx, vy);
        const speed = 0.095 * speedMult;
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
      if (p.actionTimer > 0) {
        p.actionTimer--;
        if (p.actionTimer === 0) p.actionPose = 'idle';
      }

      // Smooth Camera Follow clamped to Island World Bounds
      const cam = cameraRef.current;
      const targetCamX = Math.max(0, Math.min(WORLD_COLS * TILE_SIZE - VIEW_W, p.x * TILE_SIZE - VIEW_W / 2));
      const targetCamY = Math.max(0, Math.min(WORLD_ROWS * TILE_SIZE - VIEW_H, p.y * TILE_SIZE - VIEW_H / 2));
      cam.x += (targetCamX - cam.x) * 0.16;
      cam.y += (targetCamY - cam.y) * 0.16;

      // Update Roaming OUTDOOR NPCs & Farm Chickens
      for (const npcId of Object.keys(NPCS) as NpcId[]) {
        if (getNpcExclusiveLocation(npcId, minuteOfDay, st.weather) !== 'outdoor') continue;
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
        if (nx >= 26.8 && nx <= 30.2) ch.x = nx;
        else ch.dir *= -1;
      });

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

        const grassSet = atlas.grass[curSeason];
        const isLandTile = (gx: number, gy: number) => {
          const t = tileAt(gx + 0.5, gy + 0.5);
          return Boolean(t && t.kind !== 'ocean' && t.kind !== 'pier');
        };

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

              const lT = isLandTile(x, y - 1);
              const lB = isLandTile(x, y + 1);
              const lL = isLandTile(x - 1, y);
              const lR = isLandTile(x + 1, y);
              if (lT || lB || lL || lR) {
                ctx.fillStyle = 'rgba(56, 189, 248, 0.32)';
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                const foamOffset = Math.floor(Math.sin(now * 0.004 + x * 0.6 + y * 0.4) * 3);
                ctx.fillStyle = 'rgba(240, 249, 255, 0.85)';
                if (lT) ctx.fillRect(px + 2, py + 2 + foamOffset, TILE_SIZE - 4, 5);
                if (lB) ctx.fillRect(px + 2, py + TILE_SIZE - 7 - foamOffset, TILE_SIZE - 4, 5);
                if (lL) ctx.fillRect(px + 2 + foamOffset, py + 2, 5, TILE_SIZE - 4);
                if (lR) ctx.fillRect(px + TILE_SIZE - 7 - foamOffset, py + 2, 5, TILE_SIZE - 4);
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
            } else if (tile.kind === 'plaza' || tile.kind === 'cliff_pass' || tile.kind === 'mine_entrance') {
              ctx.drawImage(atlas.plaza[(x + y) % 2], px, py, TILE_SIZE, TILE_SIZE);
            } else {
              const gVar = (x * 7 + y * 13) % grassSet.length;
              ctx.drawImage(grassSet[gVar], px, py, TILE_SIZE, TILE_SIZE);
            }

            if (tile.kind === 'path') {
              ctx.drawImage(atlas.path[(x + y) % 2], px, py, TILE_SIZE, TILE_SIZE);
            } else if (tile.kind === 'bridge' || tile.kind === 'pier') {
              ctx.drawImage(tile.kind === 'pier' ? atlas.oceanWater : atlas.pondWater, px, py, TILE_SIZE, TILE_SIZE);
              const isBroken = tile.kind === 'bridge' && x >= 41 && x <= 43 && y >= 28 && y <= 31 && st.storyChapter < 2;
              if (isBroken) {
                ctx.fillStyle = '#4a220c';
                ctx.fillRect(px + 2, py + 4, 14, TILE_SIZE - 8);
                ctx.fillRect(px + TILE_SIZE - 16, py + 4, 14, TILE_SIZE - 8);
                ctx.fillStyle = '#dc2626';
                ctx.fillRect(px + 8, py + 18, TILE_SIZE - 16, 8);
                ctx.fillStyle = '#fef08a';
                ctx.fillRect(px + 12, py + 20, 6, 4);
                ctx.fillRect(px + 30, py + 20, 6, 4);
              } else {
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

            if (tile.kind === 'cliff_pass' && st.storyChapter < 3) {
              ctx.drawImage(atlas.stone, px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
              ctx.fillStyle = '#dc2626';
              ctx.fillRect(px + 10, py + 32, TILE_SIZE - 20, 6);
            }

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

            // Mystic Waterfall Spray on Pond at (20..22, 5)
            if (tile.kind === 'pond' && y === 5 && x >= 20 && x <= 22) {
              const spray = Math.floor(Math.sin(now * 0.012 + x) * 3);
              ctx.fillStyle = '#e0f2fe';
              ctx.fillRect(px + 6, py, TILE_SIZE - 12, 24 + spray);
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(px + 12, py + 8 + spray, 8, 10);
            }
          }
        }

        // 2. Y-Sorted 2.5D Render Queue
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

        // Enterable Buildings & Homestead Landmarks (78x52 layout)
        addSpriteLandmark(22.5, 20, 146, sprites.farmhouse, 'RUMAH (MASUK)', (cx, by) => {
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
        addSpriteLandmark(25.5, 19.8, 56, sprites.bin, 'PETI JUAL');
        addSpriteLandmark(
          28.5,
          20,
          134,
          sprites.coop,
          st.coopEggsReady > 0 ? `KANDANG (${st.coopEggsReady} TELUR · MASUK)` : 'KANDANG (MASUK)'
        );

        // Workbench (x: 31, y: 18..19)
        if (isVisibleX(31.5) && isVisibleY(19.5)) {
          queue.push({
            sortY: 19.8 * TILE_SIZE,
            render: () => {
              const wx = 31 * TILE_SIZE;
              const wy = 18.7 * TILE_SIZE;
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

        // Village Town Buildings
        addSpriteLandmark(40.5, 20, 146, sprites.shop, 'TOKO BENIH (MASUK)');
        addSpriteLandmark(45.5, 20, 142, sprites.farmhouse, 'BALAI TETUA (MASUK)');
        addSpriteLandmark(50.5, 20, 136, sprites.coop, 'BENGKEL TEMPA (MASUK)', (cx, by) => {
          if (sprites.forgeEmblem) ctx.drawImage(sprites.forgeEmblem, cx - 16, by - 122, 32, 32);
        });
        addSpriteLandmark(54.5, 20, 136, sprites.farmhouse, 'POS PETUALANG (MASUK)');

        if (isVisibleX(43.5) && isVisibleY(22)) {
          queue.push({
            sortY: 22 * TILE_SIZE,
            render: () => {
              ctx.drawImage(atlas.well, 43 * TILE_SIZE + 2, 21 * TILE_SIZE + 2, 44, 44);
            },
          });
        }

        // Forest & West Island Buildings
        addSpriteLandmark(24.5, 11, 128, sprites.farmhouse, 'PONDOK MAYA (MASUK)');
        addSpriteLandmark(30.5, 8, 134, sprites.coop, 'BENGKEL JAKA (MASUK)');
        addSpriteLandmark(8.5, 22, 132, sprites.farmhouse, 'SAUNG DEWI (MASUK)');

        // Mine Entrances (North & East Quarry)
        addSpriteLandmark(55, 8, 108, sprites.mineEntrance || sprites.coop, 'GUA TAMBANG (MASUK)');
        addSpriteLandmark(68, 14, 108, sprites.mineEntrance || sprites.coop, 'GUA TIMUR (MASUK)');

        // Sacred Tree & 4 Mustika Pedestals
        addSpriteLandmark(
          40.5,
          8,
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
          { x: 37, y: 9, chNeeded: 2, color: '#84cc16', label: 'TANAH' },
          { x: 38, y: 10, chNeeded: 3, color: '#38bdf8', label: 'TIRTA' },
          { x: 42, y: 10, chNeeded: 4, color: '#a855f7', label: 'ANGIN' },
          { x: 43, y: 9, chNeeded: 5, color: '#facc15', label: 'MENTARI' },
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

        // Spinning Windmill (x: 49..51, y: 5..7)
        if (isVisibleX(50.5) && isVisibleY(8)) {
          queue.push({
            sortY: 8 * TILE_SIZE,
            render: () => {
              const wx = 50.5 * TILE_SIZE;
              const wy = 8 * TILE_SIZE;
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
        addSpriteLandmark(53.5, 36, 165, sprites.lighthouse, 'MERCUSUAR (MASUK)');
        if (isVisibleX(47) && isVisibleY(40.5)) {
          queue.push({
            sortY: 40.5 * TILE_SIZE,
            render: () => {
              const sx = 47 * TILE_SIZE;
              const sy = 40.2 * TILE_SIZE + Math.sin(now * 0.003) * 3;
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

        // Dynamic Choppable Trees & Stumps across all 5 islands!
        st.trees.forEach((tr, i) => {
          if (tr.stumpDaysLeft > 0) return; // Chopped & regrowing
          if (!isVisibleX(tr.x + 0.5) || !isVisibleY(tr.y + 1)) return;
          if (tr.hp === 0) {
            queue.push({
              sortY: (tr.y + 0.9) * TILE_SIZE,
              render: () => {
                ctx.drawImage(atlas.stump, tr.x * TILE_SIZE + 4, tr.y * TILE_SIZE + 4, TILE_SIZE - 8, TILE_SIZE - 8);
              },
            });
          } else {
            const sp = tr.kind === 'palm' ? sprites.palmTree : sprites.tree;
            const hPx = tr.kind === 'palm' ? 100 : 92;
            addSpriteLandmark(
              tr.x + 0.5 + Math.sin(now * 0.0015 + i) * 0.012,
              tr.y + 1,
              hPx,
              sp,
              undefined,
              tr.hp < tr.maxHp
                ? (cx, by) => {
                    ctx.fillStyle = '#18181b';
                    ctx.fillRect(cx - 14, by - 12, 28, 5);
                    ctx.fillStyle = '#f59e0b';
                    ctx.fillRect(cx - 13, by - 11, Math.round((26 * tr.hp) / tr.maxHp), 3);
                  }
                : undefined
            );
          }
        });

        // Scarecrow in Homestead
        if (isVisibleX(20.5) && isVisibleY(23)) {
          queue.push({
            sortY: 23 * TILE_SIZE,
            render: () => {
              ctx.drawImage(atlas.scarecrow, 20 * TILE_SIZE + 4, 22 * TILE_SIZE - 8, 40, 50);
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

        // Roaming EXCLUSIVE OUTDOOR NPCs with AI Directional Walk Poses & Quest Markers (!)
        const activeStoryCh = STORY_CHAPTERS.find((c) => c.chapter === st.storyChapter);
        const chapterReady = isChapterConditionMet(st);
        (Object.keys(NPCS) as NpcId[]).forEach((npcId) => {
          if (getNpcExclusiveLocation(npcId, minuteOfDay, st.weather) !== 'outdoor') return;
          const rt = npcRuntimeRef.current[npcId];
          if (!isVisibleX(rt.x) || !isVisibleY(rt.y)) return;
          const isWalking = rt.pauseTimer === 0;
          const sp = getAiNpcPoseSprite(sprites, npcId, rt.dir, isWalking, now);
          const hasAiDir = Boolean(sprites.npcPoses[npcId]?.left_walk);
          const isQuestNpc = activeStoryCh?.speakerNpc === npcId;

          queue.push({
            sortY: rt.y * TILE_SIZE + 8,
            render: () => {
              const nx = Math.round(rt.x * TILE_SIZE);
              const ny = Math.round(rt.y * TILE_SIZE);
              const bob = isWalking ? Math.abs(Math.sin(now * 0.014)) * 2.5 : 0;

              ctx.fillStyle = 'rgba(15, 25, 10, 0.32)';
              ctx.beginPath();
              ctx.ellipse(nx, ny + 10, 12, 5, 0, 0, Math.PI * 2);
              ctx.fill();

              ctx.save();
              ctx.translate(nx, ny - bob);
              if (sp) {
                const drawH = 54;
                const drawW = Math.round(drawH * (sp.width / sp.height));
                if (!hasAiDir && rt.dir === 2) ctx.scale(-1, 1);
                ctx.drawImage(sp, Math.round(-drawW / 2), Math.round(-drawH + 14), drawW, drawH);
              } else {
                ctx.fillStyle = NPCS[npcId].color;
                ctx.fillRect(-9, -24, 18, 28);
              }
              ctx.restore();

              ctx.fillStyle = 'rgba(59, 26, 7, 0.85)';
              ctx.fillRect(nx - 26, ny + 13, 52, 12);
              ctx.fillStyle = '#fef3c7';
              ctx.font = 'bold 8px monospace';
              ctx.textAlign = 'center';
              ctx.fillText(NPCS[npcId].name.split(' ')[0], nx, ny + 22);

              if (isQuestNpc) {
                const markerY = ny - 48 + Math.sin(now * 0.008) * 3;
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

        // Player Farmer Character with Full AI 4-Directional & Improved 4-Step Walking Stride!
        queue.push({
          sortY: p.y * TILE_SIZE + 8,
          render: () => {
            const cx = Math.round(p.x * TILE_SIZE);
            const cy = Math.round(p.y * TILE_SIZE);
            const fs = fishingRef.current;

            let pose: FarmerPose = 'idle';
            if (fs) {
              pose = fs.status === 'bite' ? 'fish_pull' : 'fish_cast';
            } else if (p.actionTimer > 0) {
              pose = p.actionPose === 'swing_up' && p.actionTimer <= 9 ? 'swing_down' : p.actionPose;
            } else if (p.moving) {
              pose = walkPoseNow;
            }

            const stride = p.moving && !fs && p.actionTimer === 0 ? Math.abs(Math.sin(now * 0.017)) * 2.5 : 0;
            const poseSp = getAiFarmerPoseSprite(sprites, pose, p.dir);
            const hasAiPose = Boolean(sprites.farmerPoses[`${pose}_${p.dir}`] || sprites.farmerPoses[`idle_${p.dir}`]);
            const drawH = 56;
            const drawW = Math.round(drawH * (poseSp.width / poseSp.height));

            ctx.fillStyle = 'rgba(15, 25, 8, 0.35)';
            ctx.beginPath();
            ctx.ellipse(cx, cy + 12, 13, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.drawImage(poseSp, Math.round(cx - drawW / 2), Math.round(cy - drawH + 14 - stride), drawW, drawH);

            if (!hasAiPose && fs) {
              const rodTipX = fs.status === 'bite' ? cx + (p.dir === 2 ? -22 : 22) : cx + (p.dir === 2 ? -26 : 26);
              const rodTipY = fs.status === 'bite' ? cy - 28 : cy - 18;
              ctx.strokeStyle = '#92400e';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(cx + (p.dir === 2 ? -6 : 6), cy - 8);
              ctx.lineTo(rodTipX, rodTipY);
              ctx.stroke();
            }

            if (!hasAiPose && p.swingTimer > 0 && (p.actionPose === 'swing_up' || p.actionPose === 'swing_down')) {
              const toolSp = atlas.tools[activeToolRef.current];
              const prog = 1 - p.swingTimer / 18;
              const angle = (prog - 0.5) * 1.6;
              const dirSign = p.dir === 2 ? -1 : 1;
              const offX = p.dir === 0 ? 18 : p.dir === 2 ? -18 : 10;
              const offY = p.dir === 3 ? -18 : p.dir === 1 ? 6 : -4;
              ctx.save();
              ctx.translate(cx + offX, cy + offY);
              ctx.scale(dirSign, 1);
              ctx.rotate(angle);
              ctx.drawImage(toolSp, -12, -22, 24, 24);
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
          const tipX = p.x * TILE_SIZE + (fs.status === 'bite' ? (p.dir === 2 ? -24 : 24) : p.dir === 2 ? -26 : 26);
          const tipY = p.y * TILE_SIZE - (fs.status === 'bite' ? 32 : 24);
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(tipX, tipY);
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

        // 5. Ambient Butterflies / Fireflies
        const isNight = minuteOfDay >= 1080 || minuteOfDay < 360;
        const fireflyCount = isNight || st.islandHealed ? 24 : 8;
        for (let b = 0; b < fireflyCount; b++) {
          const bx = camX + ((b * 137 + Math.sin(now * 0.001 + b) * 70 + now * 0.018) % VIEW_W);
          const by = camY + ((b * 93 + Math.cos(now * 0.0014 + b * 2) * 50) % VIEW_H);
          ctx.fillStyle = st.islandHealed || isNight ? '#fde047' : '#f472b6';
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

        // 7. Rain, Sunset & Night Warm Lantern Halos
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

        if (minuteOfDay >= 990 && minuteOfDay < 1080) {
          const f = ((minuteOfDay - 990) / 90) * 0.22;
          ctx.fillStyle = `rgba(217, 119, 6, ${f.toFixed(2)})`;
          ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        } else if (isNight) {
          let nightAlpha = 0.44;
          if (minuteOfDay >= 1080 && minuteOfDay < 1140) {
            nightAlpha = 0.22 + ((minuteOfDay - 1080) / 60) * 0.22;
          } else if (minuteOfDay >= 300 && minuteOfDay < 360) {
            nightAlpha = 0.44 * (1 - (minuteOfDay - 300) / 60);
          }
          ctx.fillStyle = `rgba(10, 18, 44, ${nightAlpha.toFixed(2)})`;
          ctx.fillRect(0, 0, VIEW_W, VIEW_H);

          const hasTorch = torchUntilRef.current > Date.now();
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          const lanterns = [
            { wx: 22.5, wy: 19, r: 78, col: 'rgba(251, 191, 36, 0.25)' },
            { wx: 40.5, wy: 19, r: 76, col: 'rgba(251, 191, 36, 0.24)' },
            { wx: 45.5, wy: 19, r: 74, col: 'rgba(251, 191, 36, 0.22)' },
            { wx: 50.5, wy: 19, r: 76, col: 'rgba(251, 146, 60, 0.26)' },
            { wx: 24.5, wy: 10, r: 68, col: 'rgba(192, 132, 252, 0.24)' },
            { wx: 30.5, wy: 7, r: 68, col: 'rgba(251, 146, 60, 0.24)' },
            { wx: 8.5, wy: 21, r: 68, col: 'rgba(134, 239, 172, 0.24)' },
            { wx: 40.5, wy: 6.5, r: 105, col: 'rgba(244, 114, 182, 0.26)' },
            { wx: 53.5, wy: 33.5, r: 118, col: 'rgba(254, 240, 138, 0.34)' },
            { wx: p.x, wy: p.y - 0.3, r: hasTorch ? 155 : 78, col: hasTorch ? 'rgba(253, 224, 71, 0.28)' : 'rgba(253, 224, 71, 0.16)' },
          ];
          lanterns.forEach((lt) => {
            const sx = lt.wx * TILE_SIZE - camX;
            const sy = lt.wy * TILE_SIZE - camY;
            if (sx < -lt.r || sx > VIEW_W + lt.r || sy < -lt.r || sy > VIEW_H + lt.r) return;
            const grad = ctx.createRadialGradient(sx, sy, 4, sx, sy, lt.r);
            grad.addColorStop(0, lt.col);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(sx, sy, lt.r, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.restore();
        }
      }

      // Update Live Corner Minimap (78x52)
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
                : tk === 'plaza' || tk === 'mine_entrance'
                ? '#9ca3af'
                : tk === 'path' || tk === 'bridge' || tk === 'pier'
                ? '#d9a464'
                : '#72b83e';
            mCtx.fillRect(Math.floor(x * sx), Math.floor(y * sy), Math.ceil(sx), Math.ceil(sy));
          }
        }

        mCtx.strokeStyle = 'rgba(255,255,255,0.7)';
        mCtx.lineWidth = 1;
        mCtx.strokeRect(
          (cam.x / TILE_SIZE) * sx,
          (cam.y / TILE_SIZE) * sy,
          (VIEW_W / TILE_SIZE) * sx,
          (VIEW_H / TILE_SIZE) * sy
        );

        (Object.keys(NPCS) as NpcId[]).forEach((nid) => {
          if (getNpcExclusiveLocation(nid, minuteOfDay, st.weather) !== 'outdoor') return;
          const rt = npcRuntimeRef.current[nid];
          mCtx.fillStyle = NPCS[nid].color;
          mCtx.fillRect(rt.x * sx - 1.5, rt.y * sy - 1.5, 3, 3);
        });

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
  }, [
    viewMode,
    minuteOfDay,
    showSleepModal,
    showShop,
    showCraft,
    showBasket,
    showJournal,
    showUpgradeModal,
    showChest,
    exitBuilding,
    explodeMineBombAt,
    isChapterConditionMet,
    soundMuted,
    spawnParticles,
  ]);

  // Draw crisp Pixel-Art World Map whenever World Map modal [M] opens
  useEffect(() => {
    if (!showWorldMap || !worldMapCanvasRef.current) return;
    renderPixelWorldMapCanvas(
      worldMapCanvasRef.current,
      saveState.tiles,
      currentSeason,
      saveState.storyChapter,
      saveState.islandHealed,
      saveState.trees
    );
  }, [showWorldMap, saveState.tiles, saveState.trees, currentSeason, saveState.storyChapter, saveState.islandHealed]);

  // Canvas Click -> translate to Interior Grid OR Underground Mine Grid OR Outdoor World Grid!
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const viewX = (e.clientX - rect.left) * scaleX;
    const viewY = (e.clientY - rect.top) * scaleY;

    const intId = currentInteriorRef.current;
    if (intId) {
      const def = INTERIORS[intId];
      const ox = Math.floor((VIEW_W - def.cols * TILE_SIZE) / 2);
      const oy = Math.floor((VIEW_H - def.rows * TILE_SIZE) / 2);
      const gx = Math.floor((viewX - ox) / TILE_SIZE);
      const gy = Math.floor((viewY - oy) / TILE_SIZE);
      if (gx < 0 || gx >= def.cols || gy < 0 || gy >= def.rows) return;
      const ip = interiorPosRef.current;
      const dx = gx + 0.5 - ip.x;
      const dy = gy + 0.5 - ip.y;
      if (Math.abs(dx) >= Math.abs(dy)) ip.dir = dx >= 0 ? 0 : 2;
      else ip.dir = dy >= 0 ? 1 : 3;
      interactAtTile(gx, gy);
      return;
    }

    if (undergroundFloorRef.current !== null) {
      const mp = minePosRef.current;
      const mCamY = Math.max(0, Math.min(MINE_ROWS * TILE_SIZE - VIEW_H, mp.y * TILE_SIZE - VIEW_H / 2));
      const gx = Math.floor(viewX / TILE_SIZE);
      const gy = Math.floor((viewY + Math.round(mCamY)) / TILE_SIZE);
      const dx = gx + 0.5 - mp.x;
      const dy = gy + 0.5 - mp.y;
      if (Math.abs(dx) >= Math.abs(dy)) mp.dir = dx >= 0 ? 0 : 2;
      else mp.dir = dy >= 0 ? 1 : 3;
      interactAtTile(gx, gy);
      return;
    }

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

  const h24 = Math.floor(minuteOfDay / 60) % 24;
  const isDaytimePhase = minuteOfDay >= 360 && minuteOfDay < 1080;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const formattedClock = `${String(h12).padStart(2, '0')}:${String(minuteOfDay % 60).padStart(
    2,
    '0'
  )} ${isDaytimePhase ? 'Siang' : 'Malam'}`;

  const activeStoryChapter = STORY_CHAPTERS.find((c) => c.chapter === saveState.storyChapter);
  const canAdvanceCurrentStory = isChapterConditionMet(saveState);

  const resetFarmCompletely = () => {
    const fresh = createInitialSave();
    setSaveState(fresh);
    setConfirmReset(false);
    setCurrentInterior(null);
    setUndergroundFloor(null);
    playerRef.current = { x: 22.5, y: 21.2, dir: 1, moving: false, swingTimer: 0, actionPose: 'idle', actionTimer: 0 };
    cameraRef.current = {
      x: Math.max(0, 22.5 * TILE_SIZE - VIEW_W / 2),
      y: Math.max(0, 21.2 * TILE_SIZE - VIEW_H / 2),
    };
    floatMinuteRef.current = 360;
    setMinuteOfDay(360);
    setViewMode('play');
    setToastMsg('Petualangan Kepulauan Pulau TIK dimulai dari Hari ke-1!');
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
              alt="Ilustrasi Pulau TIK Berkebun"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 to-transparent" />

            <div className="relative z-10 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 flex-wrap">
                <span>5 Pulau Kepulauan</span>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span>10 Gedung & 10 Warga</span>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span>Gua Tambang & Monster</span>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span>Upgrade Alat Lv.1–4</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight drop-shadow">
                Berkebun: Pulau TIK
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed">
                Jelajahi 5 pulau luas di Kepulauan Pulau TIK! Tebang pohon dengan Kapak untuk kayu, tempa alat Lv.1–4 di Bengkel Pandai Besi, jelajahi Gua Bawah Tanah & kalahkan monster demi drop langka, serta simpan progres kapan saja!
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
                <h3 className="text-lg sm:text-xl font-black text-white">Pulau TIK</h3>
                <p className="text-xs text-slate-400">
                  {hasExistingProgress
                    ? `Progres: Hari ${saveState.day} · Bab ${Math.min(5, saveState.storyChapter)}/5`
                    : 'Kisah baru di kebun warisan menantimu'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {!spritesLoaded ? (
                <div className="w-full min-h-[54px] px-5 py-3.5 rounded-2xl bg-amber-950/80 border-2 border-amber-500/60 text-amber-200 font-black text-sm flex items-center justify-center gap-3 shadow-lg">
                  <div className="w-5 h-5 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span>Memuat Aset & Sprite Pulau TIK...</span>
                </div>
              ) : hasExistingProgress ? (
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
                  <Sprout className="text-emerald-700" size={20} /> Panduan Pulau TIK
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
                  <p className="font-black text-emerald-800">1. Masuk Gedung, Toko & Peti Rumah</p>
                  <p className="text-[#5c2c0e] leading-relaxed">
                    Belanja benih langsung di dalam <strong>Toko Desa Mbak Sari</strong> (siang hari). Di rumahmu ada <strong>Peti Penyimpanan, TV Cuaca, Perapian, & Ranjang</strong> yang semuanya bisa digunakan!
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#ffecc7] border-2 border-[#b97336] space-y-1">
                  <p className="font-black text-amber-800">2. Tebang Pohon [3] & Upgrade Alat</p>
                  <p className="text-[#5c2c0e] leading-relaxed">
                    Gunakan <strong>Kapak [3]</strong> untuk menebang pohon & tunggul menjadi <strong>Kayu Keras</strong>. Tempa semua alat ke <strong>Lv.2–Lv.4</strong> di Bengkel Kiran atau Pos Bagas!
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#ffecc7] border-2 border-[#b97336] space-y-1">
                  <p className="font-black text-sky-800">3. Gua Bawah Tanah, Pedang [5] & Monster</p>
                  <p className="text-[#5c2c0e] leading-relaxed">
                    Masuk lewat <strong>2 Pintu Gua Tambang</strong>. Tebas Slime, Kelelawar & Golem pakai <strong>Pedang [5]</strong> untuk drop <strong>Ramuan, Obor, Inti Monster & Bijih</strong>.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#ffecc7] border-2 border-[#b97336] space-y-1">
                  <p className="font-black text-rose-800">4. Item MC, Kerajinan [C] & Simpan</p>
                  <p className="text-[#5c2c0e] leading-relaxed">
                    Pakai <strong>Bom Mini, Obor, Jimat Pulang, Umpan Ikan, & Kopi Cepat</strong> dari bar cepat atau Tas [C]. Jangan lupa tekan <strong>Simpan</strong> di atas untuk menyimpan progres!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTutorial(false)}
                className="w-full py-3 bg-[#16a34a] hover:bg-[#15803d] text-white font-black rounded-2xl text-sm border-2 border-[#14532d]"
              >
                Mulai Jelajahi Pulau TIK!
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
        <div className="flex items-center gap-1.5 flex-wrap">
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
            ) : isDaytimePhase ? (
              <Sun size={14} className="text-amber-600" />
            ) : (
              <Moon size={14} className="text-indigo-700" />
            )}
            <span>Hari {saveState.day} · {currentSeason}</span>
            <span aria-hidden="true" className="text-[#b97336]">|</span>
            <span className="font-mono text-[#6f3615]">{formattedClock}</span>
          </div>

          <span className="px-2 py-1 rounded-xl bg-[#ffdf8e] border-2 border-[#b7791f] text-[#744210] font-black text-xs flex items-center gap-1 tabular-nums">
            <Coins size={13} className="text-amber-700" /> {saveState.gold}G
          </span>
          <span className="px-2 py-1 rounded-xl bg-[#ffe4e6] border-2 border-[#be123c] text-[#881337] font-black text-xs flex items-center gap-1 tabular-nums">
            <HeartPulse size={12} /> {saveState.hp}/{saveState.maxHp}
          </span>
          <span className="px-2 py-1 rounded-xl bg-[#dcfce7] border-2 border-[#2f855a] text-[#14532d] font-black text-xs flex items-center gap-1 tabular-nums">
            <Zap size={12} /> {saveState.stamina}
          </span>
          <span className="px-2 py-1 rounded-xl bg-[#e0f2fe] border-2 border-[#0369a1] text-[#0c4a6e] font-black text-xs flex items-center gap-1 tabular-nums">
            <Droplets size={12} /> {saveState.waterLevel}/{WATER_CAPS[Math.min(3, (saveState.toolLevels.water || 1) - 1)]}
          </span>
          {torchUntilRef.current > Date.now() && (
            <span className="px-2 py-1 rounded-xl bg-amber-100 border border-amber-500 text-amber-800 font-black text-[10px] flex items-center gap-1">
              <Flame size={11} className="text-orange-600" /> Obor
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap text-xs font-black tabular-nums">
          {undergroundFloor !== null && (
            <button
              type="button"
              onClick={exitMine}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border-2 border-amber-500 flex items-center gap-1 shadow-sm"
              title="Keluar dari Gua Bawah Tanah ke permukaan"
            >
              <ShieldAlert size={13} /> Gua Lt.{undergroundFloor} · Keluar
            </button>
          )}

          {currentInterior && (
            <button
              type="button"
              onClick={exitBuilding}
              className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white border-2 border-rose-900 flex items-center gap-1 shadow-sm"
            >
              Keluar Gedung
            </button>
          )}

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
            title="Peta Kepulauan Pulau TIK [M]"
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
            onClick={() => setShowBasket(true)}
            className="px-2.5 py-1.5 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white border-2 border-[#312e81] flex items-center gap-1 shadow-sm"
          >
            <Package size={13} /> Panen ({basketTotalCount})
          </button>

          <button
            type="button"
            onClick={handleManualSave}
            className={cn(
              'px-2.5 py-1.5 rounded-xl border-2 flex items-center gap-1 shadow-sm transition-colors',
              saveFeedback
                ? 'bg-emerald-500 text-slate-950 border-emerald-800'
                : 'bg-[#0f766e] hover:bg-[#0d9488] text-white border-[#134e4a]'
            )}
            title="Simpan progres permainan ke perangkat & cloud"
          >
            <Save size={13} /> {saveFeedback || 'Simpan'}
          </button>

          <button
            type="button"
            onClick={() => setShowSleepModal(true)}
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

          {/* Bottom 10-Slot Stardew Wooden Hotbar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 shrink-0 custom-scrollbar bg-[#8c4a1c] p-1.5 rounded-xl border-2 border-[#421c07]">
            {(
              [
                { id: 'hoe', keyNum: '1', label: `Cangkul L${saveState.toolLevels.hoe}` },
                { id: 'water', keyNum: '2', label: `Siram L${saveState.toolLevels.water}` },
                { id: 'axe', keyNum: '3', label: `Kapak L${saveState.toolLevels.axe}` },
                { id: 'pick', keyNum: '4', label: `Beliung L${saveState.toolLevels.pick}` },
                { id: 'sword', keyNum: '5', label: `Pedang L${saveState.toolLevels.sword}` },
                { id: 'harvest', keyNum: '6', label: 'Panen' },
                {
                  id: 'seed',
                  keyNum: '7',
                  label: `Benih (${saveState.seeds[selectedSeed] || 0})`,
                  cropId: selectedSeed,
                },
                { id: 'fertilizer', keyNum: '8', label: `Pupuk (${saveState.fertilizerCount})` },
                {
                  id: 'sprinkler',
                  keyNum: '9',
                  label: saveState.useGoldSprinklerMode
                    ? `Emas (${saveState.goldSprinklerCount})`
                    : `Sprink (${saveState.sprinklerCount})`,
                  isGoldSp: Boolean(saveState.useGoldSprinklerMode && saveState.goldSprinklerCount > 0),
                },
                { id: 'rod', keyNum: '0', label: `Pancing L${saveState.toolLevels.rod}` },
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
                  'px-2 py-1 rounded-lg border-2 text-[11px] font-black flex items-center gap-1 whitespace-nowrap shrink-0 transition-all',
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

          {/* Slim Quick-Use MC Items Strip */}
          {(['hp_potion', 'mine_bomb', 'torch_item', 'home_totem', 'fish_bait', 'artisan_coffee', 'artisan_tonic', 'artisan_jam', 'forage_berry', 'forage_mushroom', 'egg_normal', 'egg_gold'] as BagItemId[]).some(
            (bid) => (saveState.bagItems[bid] || 0) > 0
          ) && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 shrink-0 custom-scrollbar bg-[#5c2c0e] px-2 py-1 rounded-xl border border-[#3b1a07]">
              <span className="text-[10px] font-black text-[#ffecc7] whitespace-nowrap flex items-center gap-1">
                <Bomb size={11} className="text-amber-300" /> Item MC:
              </span>
              {(
                [
                  'hp_potion',
                  'mine_bomb',
                  'torch_item',
                  'home_totem',
                  'fish_bait',
                  'artisan_coffee',
                  'artisan_tonic',
                  'artisan_jam',
                  'forage_berry',
                  'forage_mushroom',
                  'egg_normal',
                  'egg_gold',
                ] as BagItemId[]
              )
                .filter((bid) => (saveState.bagItems[bid] || 0) > 0)
                .map((bid) => (
                  <button
                    key={bid}
                    type="button"
                    onClick={() => useMcItem(bid)}
                    title={BAG_ITEMS[bid].desc}
                    className="px-2 py-0.5 rounded-lg bg-[#ffecc7] hover:bg-[#fef08a] border border-[#b97336] text-[10px] font-black text-[#3b1a07] flex items-center gap-1 whitespace-nowrap shrink-0"
                  >
                    <img
                      src={getPixelBagItemDataUrl(bid)}
                      alt={BAG_ITEMS[bid].name}
                      style={{ imageRendering: 'pixelated' }}
                      className="w-3.5 h-3.5 object-contain"
                    />
                    <span>{BAG_ITEMS[bid].name.split(' ')[0]}</span>
                    <span className="text-[#92400e]">x{saveState.bagItems[bid]}</span>
                  </button>
                ))}
            </div>
          )}
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
                : 'Pulau TIK telah pulih sepenuhnya! Terus kembangkan kebun dan persahabatan.'}
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
              <span className="text-[10px] text-[#92400e] font-bold">
                Beli di Toko Desa (Siang)
              </span>
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

                  {activeNpcId === 'sari' && currentInterior === 'shop' && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveNpcId(null);
                        setShowShop(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#d97706] text-white border-2 border-[#78350f] text-xs font-black flex items-center gap-1"
                    >
                      <ShoppingBag size={13} /> Buka Toko Benih
                    </button>
                  )}
                  {((activeNpcId === 'kiran' && currentInterior === 'forge') ||
                    (activeNpcId === 'jaka' && currentInterior === 'jaka_cabin') ||
                    (activeNpcId === 'bagas' && currentInterior === 'explorer_post')) && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveNpcId(null);
                        setShowUpgradeModal(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white border-2 border-[#7f1d1d] text-xs font-black flex items-center gap-1"
                    >
                      <Sword size={13} /> Upgrade Alat (Lv.1–4)
                    </button>
                  )}
                  {(activeNpcId === 'jaka' || activeNpcId === 'maya' || activeNpcId === 'bagas') && (
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
                <BookOpen className="text-purple-800" size={20} /> Jurnal Legenda Pulau TIK & Warga
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
              <h4 className="font-black text-sm text-[#5c2c0e]">Daftar Karakter Warga Kepulauan (10 Karakter)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.keys(NPCS) as NpcId[]).map((nid) => {
                  const npc = NPCS[nid];
                  const hearts = saveState.npcHearts[nid] || 0;
                  const excLoc = getNpcExclusiveLocation(nid, minuteOfDay, saveState.weather);
                  const locText =
                    excLoc === 'outdoor'
                      ? 'Di Luar Pulau'
                      : `Di ${INTERIORS[excLoc]?.title || 'Dalam Gedung'}`;
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
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-black text-[#3b1a07] truncate">{npc.name}</p>
                          <span
                            className={cn(
                              'text-[9px] font-black px-1.5 py-0.5 rounded shrink-0',
                              excLoc === 'outdoor'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-400'
                                : 'bg-amber-100 text-amber-900 border border-amber-400'
                            )}
                          >
                            {excLoc === 'outdoor' ? 'Di Luar' : 'Di Gedung'}
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-[#7a3f1a] truncate">{locText}</p>
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

      {/* ================= FULL PIXEL-ART ISLAND WORLD MAP MODAL [M] ================= */}
      {showWorldMap && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5d59c] border-4 border-[#6f3615] ring-2 ring-[#d98a42] rounded-3xl max-w-3xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar text-[#3b1a07]">
            <div className="flex items-center justify-between border-b-2 border-[#c88d4f] pb-3">
              <div>
                <h3 className="font-black text-lg flex items-center gap-2">
                  <MapIcon className="text-sky-700" size={20} /> Peta Pixel Kepulauan Pulau TIK (78 × 52)
                </h3>
                <p className="text-[11px] font-bold text-[#7a3f1a]">
                  Musim {currentSeason} · {formattedClock} · 5 Pulau, 10 Gedung, & 2 Pintu Gua Tambang
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWorldMap(false)}
                className="p-1.5 rounded-xl bg-[#8c4a1c] text-[#fff3d6]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative w-full aspect-[78/52] bg-[#1d6fa5] rounded-2xl border-4 border-[#4a220c] overflow-hidden shadow-inner">
              <canvas
                ref={worldMapCanvasRef}
                width={624}
                height={416}
                style={{ imageRendering: 'pixelated' }}
                className="w-full h-full block"
              />

              {/* Subtle Pixel-Map Region Callouts */}
              {ISLAND_REGIONS.map((reg) => (
                <div
                  key={reg.id}
                  style={{
                    left: `${((reg.x + reg.w / 2) / WORLD_COLS) * 100}%`,
                    top: `${((reg.y + 1.1) / WORLD_ROWS) * 100}%`,
                  }}
                  className="absolute -translate-x-1/2 pointer-events-none"
                >
                  <span className="text-[9px] sm:text-[10px] font-black text-white bg-slate-950/65 px-1.5 py-0.5 rounded border border-amber-300/40 whitespace-nowrap shadow">
                    {reg.name}
                  </span>
                </div>
              ))}

              {/* Outdoor-Exclusive NPC Pins */}
              {(Object.keys(NPCS) as NpcId[])
                .filter((nid) => getNpcExclusiveLocation(nid, minuteOfDay, saveState.weather) === 'outdoor')
                .map((nid) => {
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
                  {undergroundFloor !== null ? `GUA LT.${undergroundFloor}` : currentInterior ? 'DI DALAM' : 'KAMU'}
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

      {/* ================= SLEEP & FAST-FORWARD TIME MODAL ================= */}
      {showSleepModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5d59c] border-4 border-[#6f3615] ring-2 ring-[#d98a42] rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl text-[#3b1a07]">
            <div className="flex items-center justify-between border-b-2 border-[#c88d4f] pb-3">
              <h3 className="font-black text-lg flex items-center gap-2">
                <Moon className="text-indigo-800" size={20} /> Istirahat & Percepat Waktu
              </h3>
              <button
                type="button"
                onClick={() => setShowSleepModal(false)}
                className="p-1.5 rounded-xl bg-[#8c4a1c] text-[#fff3d6]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-[#ffecc7] border-2 border-[#b97336] text-xs space-y-1">
              <p className="font-black text-[#4a220c]">
                Waktu Sekarang: {formattedClock} (Hari {saveState.day})
              </p>
              <p className="text-[#5c2c0e]">
                Siang (06:00–05:59) dan Malam (06:00–05:59) masing-masing berlangsung 20 menit waktu nyata. Tidurlah untuk mempercepat waktu!
              </p>
            </div>

            <div className="space-y-2.5 text-xs font-black">
              <button
                type="button"
                onClick={handleSleepNextDay}
                className="w-full py-3 px-4 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] text-white border-2 border-[#14532d] flex items-center justify-between shadow"
              >
                <span>Tidur Sampai Pagi (Hari {saveState.day + 1})</span>
                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-lg">06:00 Siang · 100% E</span>
              </button>

              {isDaytimePhase && (
                <button
                  type="button"
                  onClick={() => fastForwardTime('night')}
                  className="w-full py-3 px-4 rounded-2xl bg-indigo-700 hover:bg-indigo-600 text-white border-2 border-indigo-950 flex items-center justify-between shadow"
                >
                  <span>Istirahat Hingga Malam Hari</span>
                  <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-lg">06:00 Malam · +35 E</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => fastForwardTime('plus3h')}
                className="w-full py-3 px-4 rounded-2xl bg-[#d97706] hover:bg-[#b45309] text-white border-2 border-[#78350f] flex items-center justify-between shadow"
              >
                <span>Tidur Siang Sebentar (+3 Jam)</span>
                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-lg">+20 Energi</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSleepModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#ffecc7] hover:bg-[#ffdf8e] border-2 border-[#b97336] text-[#4a220c]"
              >
                Batal
              </button>
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
                          {(def.energyRestore || def.hpRestore || def.usableEffect) && (
                            <button
                              type="button"
                              onClick={() => useMcItem(bid)}
                              className="px-2 py-1 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white font-black text-[10px]"
                            >
                              {def.usableEffect === 'bomb'
                                ? 'Pasang Bom'
                                : def.usableEffect === 'torch'
                                ? 'Nyalakan'
                                : def.usableEffect === 'totem'
                                ? 'Teleport'
                                : def.usableEffect === 'bait'
                                ? 'Pasang Umpan'
                                : def.hpRestore
                                ? `+${def.hpRestore} HP`
                                : `+${def.energyRestore} E`}
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
                    Tas kosong! Coba memancing [0], menebang pohon [3], menambang [4], atau kalahkan monster gua [5].
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
                alt="Laporan Pagi Pulau TIK"
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
      {/* ================= TOOL UPGRADE BLACKSMITH MODAL (EXCLUSIVE TO FORGE / WORKSHOPS) ================= */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5d59c] border-4 border-[#6f3615] ring-2 ring-[#d98a42] rounded-3xl max-w-3xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar text-[#3b1a07]">
            <div className="flex items-center justify-between border-b-2 border-[#c88d4f] pb-3">
              <div>
                <h3 className="font-black text-lg flex items-center gap-2">
                  <Trophy className="text-[#dc2626]" size={20} /> Bengkel Tempa & Upgrade Peralatan
                </h3>
                <p className="text-xs font-bold text-[#7a3f1a] tabular-nums">
                  Gold: {saveState.gold}G · Kayu Keras: {saveState.bagItems.wood_res || 0} · Tembaga: {saveState.bagItems.ore_copper || 0} · Perak: {saveState.bagItems.ore_silver || 0} · Kristal: {saveState.bagItems.ore_star || 0}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="p-1.5 rounded-xl bg-[#8c4a1c] text-[#fff3d6]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {(Object.keys(TOOL_UPGRADE_NAMES) as UpgradeableToolId[]).map((toolId) => {
                const curLvl = saveState.toolLevels[toolId] || 1;
                const nextTier = TOOL_UPGRADE_TIERS.find((t) => t.level === curLvl + 1);
                const canAfford =
                  nextTier &&
                  saveState.gold >= nextTier.goldCost &&
                  (saveState.bagItems.wood_res || 0) >= nextTier.woodCost &&
                  (saveState.bagItems[nextTier.oreId] || 0) >= nextTier.oreQty;
                return (
                  <div
                    key={toolId}
                    className="p-3.5 rounded-2xl bg-[#ffecc7] border-2 border-[#b97336] flex flex-col justify-between gap-2.5"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm flex items-center gap-2">
                          <img
                            src={getPixelToolDataUrl(toolId)}
                            alt={TOOL_UPGRADE_NAMES[toolId]}
                            style={{ imageRendering: 'pixelated' }}
                            className="w-6 h-6 object-contain"
                          />
                          {TOOL_UPGRADE_NAMES[toolId]}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-[#8c4a1c] text-[#fff3d6] font-black text-[10px]">
                          Lv.{curLvl} / 4
                        </span>
                      </div>

                      {nextTier ? (
                        <>
                          <p className="font-black text-emerald-800">
                            Berikutnya: {nextTier.tierName}
                          </p>
                          <p className="text-[11px] text-[#5c2c0e] leading-snug">{nextTier.bonusDesc}</p>
                          <div className="flex flex-wrap gap-1 pt-1 text-[10px] font-black">
                            <span className="px-2 py-0.5 rounded bg-[#ffdf8e] border border-[#b7791f]">
                              {nextTier.goldCost}G
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#f5d59c] border border-[#8c4a1c]">
                              Kayu x{nextTier.woodCost}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#f5d59c] border border-[#8c4a1c]">
                              {BAG_ITEMS[nextTier.oreId].name} x{nextTier.oreQty}
                            </span>
                          </div>
                        </>
                      ) : (
                        <p className="font-black text-amber-700 py-2">
                          ★ Sudah mencapai level maksimal (Bintang Kristal)!
                        </p>
                      )}
                    </div>

                    {nextTier && (
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => handleUpgradeTool(toolId)}
                        className="w-full py-2 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-45 text-white border border-[#7f1d1d] font-black"
                      >
                        Tempa ke {nextTier.tierName}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= HOUSE STORAGE CHEST MODAL ================= */}
      {showChest && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5d59c] border-4 border-[#6f3615] ring-2 ring-[#d98a42] rounded-3xl max-w-3xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar text-[#3b1a07]">
            <div className="flex items-center justify-between border-b-2 border-[#c88d4f] pb-3">
              <h3 className="font-black text-lg flex items-center gap-2">
                <Package className="text-[#92400e]" size={20} /> Peti Penyimpanan Rumah
              </h3>
              <button
                type="button"
                onClick={() => setShowChest(false)}
                className="p-1.5 rounded-xl bg-[#8c4a1c] text-[#fff3d6]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Tas Ransel -> Deposit */}
              <div className="p-3 rounded-2xl bg-[#ffecc7] border-2 border-[#b97336] space-y-2">
                <p className="font-black text-sm text-[#4a220c]">Tas Ransel (Klik untuk Simpan)</p>
                <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                  {(Object.keys(BAG_ITEMS) as BagItemId[])
                    .filter((bid) => (saveState.bagItems[bid] || 0) > 0)
                    .map((bid) => (
                      <div
                        key={bid}
                        className="p-2 rounded-xl bg-[#fff5e1] border border-[#c88d4f] flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={getPixelBagItemDataUrl(bid)}
                            alt={BAG_ITEMS[bid].name}
                            style={{ imageRendering: 'pixelated' }}
                            className="w-5 h-5 object-contain shrink-0"
                          />
                          <span className="font-black truncate">
                            {BAG_ITEMS[bid].name} (x{saveState.bagItems[bid]})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleChestTransfer(bid, 'deposit')}
                          className="px-2 py-1 rounded-lg bg-[#d97706] hover:bg-[#b45309] text-white font-black text-[10px] shrink-0"
                        >
                          Simpan 1 →
                        </button>
                      </div>
                    ))}
                  {(Object.keys(BAG_ITEMS) as BagItemId[]).every((bid) => (saveState.bagItems[bid] || 0) === 0) && (
                    <p className="text-center text-[#7a3f1a] py-6 font-bold">Tas kosong.</p>
                  )}
                </div>
              </div>

              {/* Isi Peti -> Withdraw */}
              <div className="p-3 rounded-2xl bg-[#ffecc7] border-2 border-[#b97336] space-y-2">
                <p className="font-black text-sm text-[#4a220c]">Isi Peti Rumah (Klik untuk Ambil)</p>
                <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                  {(Object.keys(BAG_ITEMS) as BagItemId[])
                    .filter((bid) => (saveState.chestItems[bid] || 0) > 0)
                    .map((bid) => (
                      <div
                        key={bid}
                        className="p-2 rounded-xl bg-[#fff5e1] border border-[#c88d4f] flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={getPixelBagItemDataUrl(bid)}
                            alt={BAG_ITEMS[bid].name}
                            style={{ imageRendering: 'pixelated' }}
                            className="w-5 h-5 object-contain shrink-0"
                          />
                          <span className="font-black truncate">
                            {BAG_ITEMS[bid].name} (x{saveState.chestItems[bid]})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleChestTransfer(bid, 'withdraw')}
                          className="px-2 py-1 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white font-black text-[10px] shrink-0"
                        >
                          ← Ambil 1
                        </button>
                      </div>
                    ))}
                  {(Object.keys(BAG_ITEMS) as BagItemId[]).every((bid) => (saveState.chestItems[bid] || 0) === 0) && (
                    <p className="text-center text-[#7a3f1a] py-6 font-bold">Peti penyimpanan masih kosong.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
