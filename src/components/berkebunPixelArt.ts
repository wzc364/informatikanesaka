/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import farmerSpriteUrl from '../assets/images/berkebun_farmer_pixel_1795346951033.jpg';
import farmerWalkSheetUrl from '../assets/images/farmer_walk_sheet_v3_1795359286105.jpg';
import farmerActionsSheetUrl from '../assets/images/berkebun_farmer_actions_sheet_1795352733967.jpg';
import farmerIdleSwordUrl from '../assets/images/farmer_idle_sword_1795479164111.jpg';
import farmerIdleHoeUrl from '../assets/images/farmer_idle_hoe_v2_1795479223886.jpg';
import farmerIdleWaterUrl from '../assets/images/farmer_idle_water_1795479164611.jpg';
import farmerIdlePickUrl from '../assets/images/farmer_idle_pick_1795479165696.jpg';
import farmerActionSwordUrl from '../assets/images/farmer_action_sword_1795482162880.jpg';
import farmerActionHoeUrl from '../assets/images/farmer_action_hoe_1795482165290.jpg';
import farmerActionWaterUrl from '../assets/images/farmer_action_water_1795482164100.jpg';
import farmerActionPickUrl from '../assets/images/farmer_action_pick_v2_1795482182499.jpg';
import farmerActionAxeUrl from '../assets/images/farmer_action_pick_v2_1795482182499.jpg';
import farmerActionSeedUrl from '../assets/images/berkebun_farmer_actions_sheet_1795352733967.jpg';
import farmerActionFertilizerUrl from '../assets/images/berkebun_farmer_actions_sheet_1795352733967.jpg';
import skyscraperSpriteUrl from '../assets/images/pulau_biner_skyscraper_1795482749036.jpg';
import ferrySpriteUrl from '../assets/images/pulau_biner_ferry_1795482748148.jpg';
import farmhouseSpriteUrl from '../assets/images/berkebun_farmhouse_pixel_1795346951463.jpg';
import shopSpriteUrl from '../assets/images/berkebun_shop_pixel_1795346951275.jpg';
import binSpriteUrl from '../assets/images/berkebun_bin_pixel_1795346952182.jpg';
import treeSpriteUrl from '../assets/images/berkebun_tree_pixel_1795346951395.jpg';
import npcSheetUrl from '../assets/images/berkebun_npc_sheet_1795348518239.jpg';
import npcWalkSheetAUrl from '../assets/images/berkebun_npc_walk_a_1795352732562.jpg';
import npcWalkSheetBUrl from '../assets/images/berkebun_npc_walk_b_1795352733523.jpg';
import npcWalkSheetCUrl from '../assets/images/npc_walk_sheet_c_1795354737384.jpg';
import npcBagasMonstersUrl from '../assets/images/npc_bagas_monsters_1795354738600.jpg';
import mineItemsDropsUrl from '../assets/images/mine_items_drops_sheet_1795354735984.jpg';
import furnitureSheetAUrl from '../assets/images/berkebun_furniture_sheet_a_1795352711751.jpg';
import furnitureSheetBUrl from '../assets/images/berkebun_furniture_sheet_b_1795352709801.jpg';
import furnitureSheetCUrl from '../assets/images/berkebun_furniture_sheet_c_1795352710884.jpg';
import palmTreeUrl from '../assets/images/berkebun_palm_tree_pixel_1795348518032.jpg';
import coopSpriteUrl from '../assets/images/berkebun_coop_pixel_1795348518625.jpg';
import sacredTreeUrl from '../assets/images/berkebun_sacred_tree_pixel_1795348518161.jpg';
import lighthouseUrl from '../assets/images/berkebun_lighthouse_pixel_1795348518004.jpg';
import binerNpcSheet1Url from '../assets/images/biner_npc_sheet_1_1795488593968.jpg';
import binerNpcSheet2Url from '../assets/images/biner_npc_sheet_2_1795488594499.jpg';
import binerNpcSheet3Url from '../assets/images/biner_npc_sheet_3_1795488595349.jpg';
import binerNpcSheet4Url from '../assets/images/biner_npc_sheet_4_1795488596098.jpg';
import binerNpcSheet5Url from '../assets/images/biner_npc_sheet_5_1795488597348.jpg';
import binerFurnitureSheetUrl from '../assets/images/biner_furniture_sheet_1795488597402.jpg';
import jaringanWoodsSheetUrl from '../assets/images/jaringan_woods_sheet_1795499300451.jpg';
import jaringanGemsSheetUrl from '../assets/images/jaringan_gems_sheet_1795499301944.jpg';
import jaringanFishSheetUrl from '../assets/images/jaringan_fish_sheet_clean_1795499371044.jpg';
import jaringanTreesSheetUrl from '../assets/images/jaringan_trees_sheet_1795499305706.jpg';
import jaringanHousesSheetUrl from '../assets/images/jaringan_houses_sheet_1795499306490.jpg';
import jaringanFurnitureSheetUrl from '../assets/images/jaringan_furniture_sheet_1795499308563.jpg';
import jaringanNpcSheet1Url from '../assets/images/jaringan_npc_sheet_1_1795499307681.jpg';
import jaringanNpcSheet2Url from '../assets/images/jaringan_npc_sheet_2_1795499371759.jpg';
import {
  WORLD_COLS,
  WORLD_ROWS,
  type BagItemId,
  type BinerNpcId,
  type CropId,
  type FarmTile,
  type FurnitureKind,
  type JaringanGemId,
  type JaringanWoodId,
  type NpcId,
  type Season,
  type UpgradeableToolId,
  type WorldTree,
} from './berkebunWorldData';
import {
  BINER_COLS,
  BINER_ROWS,
  BINER_NPC_STYLES,
  type BinerNpcAppearance,
} from './pulauBinerData';
import {
  JARINGAN_COLS,
  JARINGAN_FISH_IDS,
  JARINGAN_GEM_IDS,
  JARINGAN_ROWS,
  JARINGAN_WOOD_IDS,
} from './pulauJaringanData';

export type StardewToolId =
  | 'hoe'
  | 'water'
  | 'axe'
  | 'pick'
  | 'sword'
  | 'harvest'
  | 'seed'
  | 'fertilizer'
  | 'sprinkler'
  | 'rod';

export interface StardewSprites {
  farmer: HTMLCanvasElement | null;
  farmerPoses: Partial<Record<string, HTMLCanvasElement>>;
  farmhouse: HTMLCanvasElement | null;
  shop: HTMLCanvasElement | null;
  bin: HTMLCanvasElement | null;
  tree: HTMLCanvasElement | null;
  palmTree: HTMLCanvasElement | null;
  coop: HTMLCanvasElement | null;
  sacredTree: HTMLCanvasElement | null;
  lighthouse: HTMLCanvasElement | null;
  skyscraper: HTMLCanvasElement | null;
  ferry: HTMLCanvasElement | null;
  npcs: Record<NpcId, HTMLCanvasElement | null>;
  npcPoses: Record<NpcId, Partial<Record<string, HTMLCanvasElement>>>;
  npcPortraits: Record<NpcId, string>;
  furniture: Partial<Record<FurnitureKind, HTMLCanvasElement>>;
  monsters: {
    slime: HTMLCanvasElement[];
    bat: HTMLCanvasElement[];
    golem: HTMLCanvasElement[];
  };
  mineEntrance: HTMLCanvasElement | null;
  mineLadder: HTMLCanvasElement | null;
  mineTorch: HTMLCanvasElement | null;
  mineBomb: HTMLCanvasElement | null;
  mineBoulder: HTMLCanvasElement | null;
  forgeEmblem: HTMLCanvasElement | null;
  bagItemAiSprites: Partial<Record<BagItemId, HTMLCanvasElement>>;
  jaringanTrees: Partial<Record<JaringanWoodId, HTMLCanvasElement>>;
  gemIcons: Partial<Record<JaringanGemId, HTMLCanvasElement>>;
  berryBush: HTMLCanvasElement | null;
  groundTorch: HTMLCanvasElement | null;
  jaringanHouses: {
    t1: HTMLCanvasElement | null;
    t2: HTMLCanvasElement | null;
    t3: HTMLCanvasElement | null;
  };
  jaringanBuilderHut: HTMLCanvasElement | null;
  jaringanHall: HTMLCanvasElement | null;
  jaringanVolcano: HTMLCanvasElement | null;
}

const PROCESSED_CACHE = new Map<string, HTMLCanvasElement>();
const PROMISE_CACHE = new Map<string, Promise<HTMLCanvasElement | null>>();

function flipCanvasHorizontal(source: HTMLCanvasElement): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = source.width;
  c.height = source.height;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = false;
    ctx.translate(source.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(source, 0, 0);
  }
  return c;
}

function stripExteriorWhiteAndTrim(
  source: HTMLImageElement | HTMLCanvasElement,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  maxDim: number
): HTMLCanvasElement | null {
  const scale = Math.max(sw, sh) > maxDim ? maxDim / Math.max(sw, sh) : 1;
  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));

  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, w, h);

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const total = w * h;
  const visited = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const isExteriorWhite = (idx: number) => {
    const p = idx * 4;
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    return minC > 232 && maxC - minC < 22;
  };

  const enqueue = (x: number, y: number) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const idx = y * w + x;
    if (visited[idx] || !isExteriorWhite(idx)) return;
    visited[idx] = 1;
    queue[tail++] = idx;
  };

  for (let x = 0; x < w; x++) {
    enqueue(x, 0);
    enqueue(x, h - 1);
  }
  for (let y = 1; y < h - 1; y++) {
    enqueue(0, y);
    enqueue(w - 1, y);
  }

  while (head < tail) {
    const idx = queue[head++];
    data[idx * 4 + 3] = 0;
    const x = idx % w;
    const y = (idx - x) / w;
    enqueue(x - 1, y);
    enqueue(x + 1, y);
    enqueue(x, y - 1);
    enqueue(x, y + 1);
  }

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      if (visited[idx]) continue;
      const p = idx * 4;
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      const minC = Math.min(r, g, b);
      const maxC = Math.max(r, g, b);
      if (minC > 205 && maxC - minC < 24) {
        if (visited[idx - 1] || visited[idx + 1] || visited[idx - w] || visited[idx + w]) {
          data[p + 3] = Math.round(data[p + 3] * 0.25);
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX > minX && maxY > minY) {
    const cw = maxX - minX + 1;
    const ch = maxY - minY + 1;
    const trimmed = document.createElement('canvas');
    trimmed.width = cw;
    trimmed.height = ch;
    const tCtx = trimmed.getContext('2d');
    if (tCtx) {
      tCtx.imageSmoothingEnabled = false;
      tCtx.drawImage(c, minX, minY, cw, ch, 0, 0, cw, ch);
      return trimmed;
    }
  }
  return c;
}

function loadImageElement(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = async () => {
      try {
        if (typeof img.decode === 'function') await img.decode().catch(() => {});
      } catch {
        // ignore decode error
      }
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = src;
    if (img.complete && img.naturalWidth > 0) {
      resolve(img);
    }
  });
}

function loadTransparentSprite(src: string, maxDim = 260): Promise<HTMLCanvasElement | null> {
  const key = `${src}@${maxDim}`;
  const cached = PROCESSED_CACHE.get(key);
  if (cached) return Promise.resolve(cached);
  const inflight = PROMISE_CACHE.get(key);
  if (inflight) return inflight;

  const promise = loadImageElement(src).then((img) => {
    if (!img) return null;
    const res = stripExteriorWhiteAndTrim(
      img,
      0,
      0,
      img.naturalWidth || 256,
      img.naturalHeight || 256,
      maxDim
    );
    if (res) PROCESSED_CACHE.set(key, res);
    return res;
  });

  PROMISE_CACHE.set(key, promise);
  return promise;
}

function sliceGridSheet(
  img: HTMLImageElement | null,
  cols: number,
  rows: number,
  maxDim: number
): Array<HTMLCanvasElement | null> {
  if (!img) return Array(cols * rows).fill(null);
  const natW = img.naturalWidth || cols * 256;
  const natH = img.naturalHeight || rows * 256;
  const cellW = natW / cols;
  const cellH = natH / rows;
  const out: Array<HTMLCanvasElement | null> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out.push(
        stripExteriorWhiteAndTrim(
          img,
          Math.floor(c * cellW),
          Math.floor(r * cellH),
          Math.floor(cellW),
          Math.floor(cellH),
          maxDim
        )
      );
    }
  }
  return out;
}

function sliceRowSpritesByWhitespace(
  img: HTMLImageElement | null,
  expectedRows: number,
  maxDim: number
): HTMLCanvasElement[][] {
  if (!img) return Array.from({ length: expectedRows }, () => []);
  const natW = img.naturalWidth || 1024;
  const natH = img.naturalHeight || 1024;
  const c = document.createElement('canvas');
  c.width = natW;
  c.height = natH;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) return Array.from({ length: expectedRows }, () => []);
  ctx.drawImage(img, 0, 0, natW, natH);
  const { data } = ctx.getImageData(0, 0, natW, natH);

  const rowH = Math.floor(natH / expectedRows);
  const rowsOut: HTMLCanvasElement[][] = [];

  for (let r = 0; r < expectedRows; r++) {
    const y0 = Math.floor(r * (natH / expectedRows));
    const y1 = r === expectedRows - 1 ? natH : Math.floor((r + 1) * (natH / expectedRows));
    const colHasInk = new Uint8Array(natW);

    for (let x = 0; x < natW; x++) {
      for (let y = y0; y < y1; y++) {
        const p = (y * natW + x) * 4;
        const minC = Math.min(data[p], data[p + 1], data[p + 2]);
        if (minC <= 228) {
          colHasInk[x] = 1;
          break;
        }
      }
    }

    // Group contiguous inked columns, tolerating small <= 4px interior white gaps
    const spans: Array<[number, number]> = [];
    let start = -1;
    let gap = 0;
    for (let x = 0; x < natW; x++) {
      if (colHasInk[x]) {
        if (start === -1) start = x;
        gap = 0;
      } else if (start !== -1) {
        gap++;
        if (gap > 5) {
          spans.push([Math.max(0, start - 2), Math.min(natW - 1, x - gap + 2)]);
          start = -1;
          gap = 0;
        }
      }
    }
    if (start !== -1) {
      spans.push([Math.max(0, start - 2), natW - 1]);
    }

    const rowSprites: HTMLCanvasElement[] = [];
    for (const [sx, ex] of spans) {
      const sw = ex - sx + 1;
      if (sw < 16) continue; // skip stray noise speck
      const sp = stripExteriorWhiteAndTrim(img, sx, y0, sw, Math.max(1, Math.min(y1 - y0, rowH + 6)), maxDim);
      if (sp) rowSprites.push(sp);
    }
    rowsOut.push(rowSprites);
  }

  return rowsOut;
}

function makeNpcPortraitFromSprite(sprite: HTMLCanvasElement): string {
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 96;
  pCanvas.height = 96;
  const pCtx = pCanvas.getContext('2d');
  if (pCtx) {
    pCtx.imageSmoothingEnabled = false;
    const srcH = Math.round(sprite.height * 0.72);
    const srcW = Math.min(sprite.width, srcH);
    const sx = Math.max(0, Math.round((sprite.width - srcW) / 2));
    pCtx.drawImage(sprite, sx, 0, srcW, srcH, 4, 4, 88, 88);
    return pCanvas.toDataURL('image/png');
  }
  return '';
}

function generateCorporateNpcSprites(style: BinerNpcAppearance): {
  down_idle: HTMLCanvasElement;
  down_walk: HTMLCanvasElement;
  right_walk: HTMLCanvasElement;
  left_walk: HTMLCanvasElement;
  up_walk: HTMLCanvasElement;
} {
  const pal: Record<string, string> = {
    o: '#0f172a',
    H: style.hair,
    S: style.skin,
    U: style.suit,
    W: style.shirt,
    T: style.tie,
    P: style.pants,
    K: '#1e293b',
    G: '#38bdf8',
    Y: '#facc15',
  };
  const renderScaled = (rows: string[], acc?: BinerNpcAppearance['accessory']) => {
    const base = makePixelCanvas(16, 22, (px) => {
      drawMatrix(px, rows, pal, 0, 2);
      if (acc === 'glasses') {
        px(5, 7, '#0f172a', 2, 1);
        px(9, 7, '#0f172a', 2, 1);
        px(7, 7, '#64748b', 2, 1);
      } else if (acc === 'hardhat') {
        px(4, 1, '#facc15', 8, 2);
        px(3, 3, '#eab308', 10, 1);
      } else if (acc === 'cap') {
        px(4, 1, '#0284c7', 8, 2);
        px(4, 3, '#38bdf8', 9, 1);
      } else if (acc === 'headset') {
        px(3, 6, '#38bdf8', 1, 3);
        px(12, 6, '#38bdf8', 1, 3);
        px(4, 9, '#0284c7', 3, 1);
      } else if (acc === 'apron') {
        px(5, 13, '#fef3c7', 6, 5);
      }
    });
    const out = document.createElement('canvas');
    out.width = 64;
    out.height = 88;
    const ctx = out.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(base, 0, 0, 64, 88);
    }
    return out;
  };

  const downIdle = renderScaled(
    [
      '....oooooooo....',
      '...oHHHHHHHHo...',
      '..oHHHHHHHHHHo..',
      '..oHHSSSSSSHHo..',
      '...oSKSSSSKSo...',
      '...oSSSSSSSSo...',
      '..ooUUUUUUUUoo..',
      '.oSSoUWWTTWUoSSo',
      '.oSSoUUUTTUUoSSo',
      '.ooooUUUUUUUoooo',
      '....oPPPPPPPo...',
      '....oPPPoPPPo...',
      '....oPPo.oPPo...',
      '....oKKo.oKKo...',
      '....ooo...ooo...',
    ],
    style.accessory
  );

  const downWalk = renderScaled(
    [
      '....oooooooo....',
      '...oHHHHHHHHo...',
      '..oHHHHHHHHHHo..',
      '..oHHSSSSSSHHo..',
      '...oSKSSSSKSo...',
      '...oSSSSSSSSo...',
      '..ooUUUUUUUUoo..',
      '.oSSoUWWTTWUoSSo',
      '....oUUUTTUUo...',
      '....oUUUUUUUo...',
      '....oPPPPPPPo...',
      '....oPPPoPPPoo..',
      '....oKKo...oPPo.',
      '....ooo....oooo.',
      '................',
    ],
    style.accessory
  );

  const rightWalk = renderScaled(
    [
      '....oooooooo....',
      '...oHHHHHHHHo...',
      '...oHHHHHHHSSo..',
      '....oHHHHSSSKo..',
      '....oHHHSSSSSo..',
      '...ooUUUUUUoo...',
      '...oUUWWUSSUo...',
      '..oSSoUUTUUSSo..',
      '..ooooUUUUooo...',
      '....oPPPPPPo....',
      '....oPPooPPo....',
      '...oPPo..oPPo...',
      '..oKKo....oKKo..',
      '..ooo......ooo..',
      '................',
    ],
    style.accessory
  );

  const upWalk = renderScaled(
    [
      '....oooooooo....',
      '...oHHHHHHHHo...',
      '..oHHHHHHHHHHo..',
      '..oHHHHHHHHHHo..',
      '...oHHHHHHHHo...',
      '..ooUUUUUUUUoo..',
      '.oSSoUUUUUUUoSSo',
      '.ooooUUUUUUUoooo',
      '....oUUUUUUUo...',
      '....oPPPPPPPo...',
      '....oPPPoPPPo...',
      '....oPPo.oKKo...',
      '....oKKo..ooo...',
      '....ooo.........',
      '................',
    ],
    style.accessory
  );

  return {
    down_idle: downIdle,
    down_walk: downWalk,
    right_walk: rightWalk,
    left_walk: flipCanvasHorizontal(rightWalk),
    up_walk: upWalk,
  };
}

let NPC_CACHE: {
  npcs: Record<NpcId, HTMLCanvasElement | null>;
  npcPoses: Record<NpcId, Partial<Record<string, HTMLCanvasElement>>>;
  npcPortraits: Record<NpcId, string>;
} | null = null;

async function loadSlicedNpcs() {
  if (NPC_CACHE) return NPC_CACHE;

  const binerIds = Object.keys(BINER_NPC_STYLES) as BinerNpcId[];
  const initialNpcs: Record<string, HTMLCanvasElement | null> = {
    raka: null,
    sari: null,
    jaka: null,
    maya: null,
    bima: null,
    lira: null,
    kiran: null,
    tara: null,
    dewi: null,
    bagas: null,
  };
  const initialPoses: Record<string, Partial<Record<string, HTMLCanvasElement>>> = {
    raka: {},
    sari: {},
    jaka: {},
    maya: {},
    bima: {},
    lira: {},
    kiran: {},
    tara: {},
    dewi: {},
    bagas: {},
  };
  const initialPortraits: Record<string, string> = {
    raka: '',
    sari: '',
    jaka: '',
    maya: '',
    bima: '',
    lira: '',
    kiran: '',
    tara: '',
    dewi: '',
    bagas: '',
  };

  binerIds.forEach((bid) => {
    const gen = generateCorporateNpcSprites(BINER_NPC_STYLES[bid]);
    initialNpcs[bid] = gen.down_idle;
    initialPoses[bid] = gen;
    initialPortraits[bid] = makeNpcPortraitFromSprite(gen.down_idle);
  });

  const defaultResult = {
    npcs: initialNpcs as Record<NpcId, HTMLCanvasElement | null>,
    npcPoses: initialPoses as Record<NpcId, Partial<Record<string, HTMLCanvasElement>>>,
    npcPortraits: initialPortraits as Record<NpcId, string>,
  };

  const [
    sheet,
    walkA,
    walkB,
    walkC,
    bagasMonsters,
    binerSheet1,
    binerSheet2,
    binerSheet3,
    binerSheet4,
    binerSheet5,
    jaringanSheet1,
    jaringanSheet2,
  ] = await Promise.all([
    loadImageElement(npcSheetUrl),
    loadImageElement(npcWalkSheetAUrl),
    loadImageElement(npcWalkSheetBUrl),
    loadImageElement(npcWalkSheetCUrl),
    loadImageElement(npcBagasMonstersUrl),
    loadImageElement(binerNpcSheet1Url),
    loadImageElement(binerNpcSheet2Url),
    loadImageElement(binerNpcSheet3Url),
    loadImageElement(binerNpcSheet4Url),
    loadImageElement(binerNpcSheet5Url),
    loadImageElement(jaringanNpcSheet1Url),
    loadImageElement(jaringanNpcSheet2Url),
  ]);

  if (sheet) {
    const natW = sheet.naturalWidth || 1200;
    const natH = sheet.naturalHeight || 800;
    const cellW = Math.floor(natW / 3);
    const cellH = Math.floor(natH / 2);

    const layout: Array<{ id: NpcId; col: number; row: number }> = [
      { id: 'raka', col: 0, row: 0 },
      { id: 'sari', col: 1, row: 0 },
      { id: 'jaka', col: 2, row: 0 },
      { id: 'maya', col: 0, row: 1 },
      { id: 'bima', col: 1, row: 1 },
      { id: 'lira', col: 2, row: 1 },
    ];

    for (const item of layout) {
      const sprite = stripExteriorWhiteAndTrim(
        sheet,
        item.col * cellW,
        item.row * cellH,
        cellW,
        cellH,
        140
      );
      defaultResult.npcs[item.id] = sprite;
      if (sprite) {
        defaultResult.npcPortraits[item.id] = makeNpcPortraitFromSprite(sprite);
      }
    }
  }

  // Slice 4x3 directional walk poses for all 10 Pulau TIK NPCs!
  const assignNpcWalkRow = (cells: Array<HTMLCanvasElement | null>, rowIdx: number, npcId: NpcId) => {
    const base = rowIdx * 4;
    const dIdle = cells[base];
    const dWalk = cells[base + 1];
    const rWalk = cells[base + 2];
    const uWalk = cells[base + 3];
    const map: Partial<Record<string, HTMLCanvasElement>> = {};
    if (dIdle) map.down_idle = dIdle;
    if (dWalk) map.down_walk = dWalk;
    if (rWalk) {
      map.right_walk = rWalk;
      map.left_walk = flipCanvasHorizontal(rWalk);
    }
    if (uWalk) map.up_walk = uWalk;
    defaultResult.npcPoses[npcId] = map;
    if (!defaultResult.npcs[npcId] && dIdle) {
      defaultResult.npcs[npcId] = dIdle;
    }
    if (!defaultResult.npcPortraits[npcId] && dIdle) {
      defaultResult.npcPortraits[npcId] = makeNpcPortraitFromSprite(dIdle);
    }
  };

  if (walkA) {
    const cellsA = sliceGridSheet(walkA, 4, 3, 140);
    assignNpcWalkRow(cellsA, 0, 'raka');
    assignNpcWalkRow(cellsA, 1, 'sari');
    assignNpcWalkRow(cellsA, 2, 'jaka');
  }
  if (walkB) {
    const cellsB = sliceGridSheet(walkB, 4, 3, 140);
    assignNpcWalkRow(cellsB, 0, 'maya');
    assignNpcWalkRow(cellsB, 1, 'bima');
    assignNpcWalkRow(cellsB, 2, 'lira');
  }
  if (walkC) {
    const cellsC = sliceGridSheet(walkC, 4, 3, 140);
    assignNpcWalkRow(cellsC, 0, 'kiran');
    assignNpcWalkRow(cellsC, 1, 'tara');
    assignNpcWalkRow(cellsC, 2, 'dewi');
  }
  if (bagasMonsters) {
    const cellsD = sliceGridSheet(bagasMonsters, 4, 3, 140);
    assignNpcWalkRow(cellsD, 0, 'bagas');
  }

  // Assign AI-generated sprite poses & portraits for ALL 20 Pulau Biner Corporate NPCs!
  const assignBinerAiSheet = (sheetImg: HTMLImageElement | null, ids: BinerNpcId[]) => {
    if (!sheetImg) return;
    const rows = sliceRowSpritesByWhitespace(sheetImg, ids.length, 150);
    ids.forEach((npcId, rowIdx) => {
      const rowSprites = rows[rowIdx] || [];
      if (rowSprites.length < 4) return;
      const dIdle = rowSprites[0];
      const dWalk = rowSprites[1];
      const rWalk = rowSprites[rowSprites.length - 2];
      const uWalk = rowSprites[rowSprites.length - 1];
      const map: Partial<Record<string, HTMLCanvasElement>> = {
        down_idle: dIdle,
        down_walk: dWalk,
        right_walk: rWalk,
        left_walk: flipCanvasHorizontal(rWalk),
        up_walk: uWalk,
      };
      defaultResult.npcPoses[npcId] = map;
      defaultResult.npcs[npcId] = dIdle;
      defaultResult.npcPortraits[npcId] = makeNpcPortraitFromSprite(dIdle);
    });
  };

  assignBinerAiSheet(binerSheet1, ['b_hendra', 'b_clara', 'b_reno', 'b_nadia']);
  assignBinerAiSheet(binerSheet2, ['b_rizal', 'b_siska', 'b_aldi', 'b_viona']);
  assignBinerAiSheet(binerSheet3, ['b_kevin', 'b_fajar', 'b_bella', 'b_dimas']);
  assignBinerAiSheet(binerSheet4, ['b_celine', 'b_agus', 'b_tania', 'b_oki']);
  assignBinerAiSheet(binerSheet5, ['b_gita', 'b_budi', 'b_rara', 'b_yuda']);

  // Slice 6 Pulau Jaringan NPCs!
  if (jaringanSheet1) {
    const cellsJ1 = sliceGridSheet(jaringanSheet1, 4, 3, 145);
    assignNpcWalkRow(cellsJ1, 0, 'j_pandu');
    assignNpcWalkRow(cellsJ1, 1, 'j_laras');
    assignNpcWalkRow(cellsJ1, 2, 'j_rimba');
  }
  if (jaringanSheet2) {
    // 6-pose row layout: [down_idle, down_walk, right_walk_1, right_walk_2, up_idle, up_walk]
    const rowsJ2 = sliceRowSpritesByWhitespace(jaringanSheet2, 3, 150);
    (['j_samudra', 'j_kaelen', 'j_nusa'] as const).forEach((npcId, rowIdx) => {
      const rowSprites = rowsJ2[rowIdx] || [];
      if (rowSprites.length < 4) return;
      const dIdle = rowSprites[0];
      const dWalk = rowSprites[1];
      const rWalk = rowSprites[2];
      const uWalk = rowSprites[rowSprites.length - 1];
      const map: Partial<Record<string, HTMLCanvasElement>> = {
        down_idle: dIdle,
        down_walk: dWalk,
        right_walk: rWalk,
        left_walk: flipCanvasHorizontal(rWalk),
        up_walk: uWalk,
      };
      defaultResult.npcPoses[npcId] = map;
      defaultResult.npcs[npcId] = dIdle;
      defaultResult.npcPortraits[npcId] = makeNpcPortraitFromSprite(dIdle);
    });
  }

  NPC_CACHE = defaultResult;
  return defaultResult;
}

let FARMER_AI_CACHE: Partial<Record<string, HTMLCanvasElement>> | null = null;
async function loadAiFarmerPoses(): Promise<Partial<Record<string, HTMLCanvasElement>>> {
  if (FARMER_AI_CACHE) return FARMER_AI_CACHE;
  const [
    img1,
    img2,
    img3,
    img4,
    img5,
    img6,
    img7,
    img8,
    img9,
    idleSword,
    idleHoe,
    idleWater,
    idlePick,
    actSword,
    actHoe,
    actWater,
    actPick,
    actAxe,
    actSeed,
    actFertilizer,
    actImg,
  ] = await Promise.all([
    loadTransparentSprite('/assets/aistudio/1_fe19e256.png', 160),
    loadTransparentSprite('/assets/aistudio/2_d7e5517f.png', 160),
    loadTransparentSprite('/assets/aistudio/3_eee24ec5.png', 160),
    loadTransparentSprite('/assets/aistudio/4_2e34e8c5.png', 160),
    loadTransparentSprite('/assets/aistudio/5_ff64c56f.png', 160),
    loadTransparentSprite('/assets/aistudio/6_7ddc66a8.png', 160),
    loadTransparentSprite('/assets/aistudio/7_defac37b.png', 160),
    loadTransparentSprite('/assets/aistudio/8_9241f189.png', 160),
    loadTransparentSprite('/assets/aistudio/9_82e708c1.png', 160),
    loadTransparentSprite(farmerIdleSwordUrl, 160),
    loadTransparentSprite(farmerIdleHoeUrl, 160),
    loadTransparentSprite(farmerIdleWaterUrl, 160),
    loadTransparentSprite(farmerIdlePickUrl, 160),
    loadTransparentSprite(farmerActionSwordUrl, 175),
    loadTransparentSprite(farmerActionHoeUrl, 175),
    loadTransparentSprite(farmerActionWaterUrl, 175),
    loadTransparentSprite(farmerActionPickUrl, 175),
    loadTransparentSprite(farmerActionAxeUrl, 175),
    loadTransparentSprite(farmerActionSeedUrl, 175),
    loadTransparentSprite(farmerActionFertilizerUrl, 175),
    loadImageElement(farmerActionsSheetUrl),
  ]);

  const poses: Partial<Record<string, HTMLCanvasElement>> = {};

  if (img1) poses.idle_1 = img1;
  if (img2) poses.walk1_1 = img2;
  if (img3) poses.walk2_1 = img3;

  if (img4) poses.idle_0 = img4;
  if (img5) poses.walk1_0 = img5;
  if (img6) poses.walk2_0 = img6;

  if (img4) poses.idle_2 = flipCanvasHorizontal(img4);
  if (img5) poses.walk1_2 = flipCanvasHorizontal(img5);
  if (img6) poses.walk2_2 = flipCanvasHorizontal(img6);

  if (img7) poses.idle_3 = img7;
  if (img8) poses.walk1_3 = img8;
  if (img9) poses.walk2_3 = img9;

  if (idleSword) poses.idle_sword_1 = idleSword;
  if (idleHoe) poses.idle_hoe_1 = idleHoe;
  if (idleWater) poses.idle_water_1 = idleWater;
  if (idlePick) poses.idle_pick_1 = idlePick;

  const assignDirectionalAction = (key: string, sp: HTMLCanvasElement | null) => {
    if (!sp) return;
    poses[`${key}_0`] = sp;
    poses[`${key}_1`] = sp;
    poses[`${key}_3`] = sp;
    poses[`${key}_2`] = flipCanvasHorizontal(sp);
  };
  assignDirectionalAction('action_sword', actSword);
  assignDirectionalAction('action_hoe', actHoe);
  assignDirectionalAction('action_water', actWater);
  assignDirectionalAction('water', actWater);
  assignDirectionalAction('action_pick', actPick);
  assignDirectionalAction('action_axe', actAxe);
  assignDirectionalAction('action_seed', actSeed);
  assignDirectionalAction('plant', actSeed);
  assignDirectionalAction('action_fertilizer', actFertilizer);

  if (actImg) {
    const aCells = sliceGridSheet(actImg, 4, 2, 165);
    const actOrder: FarmerPose[] = [
      'swing_up',
      'swing_down',
      'plant',
      'water',
      'harvest',
      'fish_cast',
      'fish_pull',
      'sleep',
    ];
    actOrder.forEach((poseName, idx) => {
      if (poseName === 'water' && actWater) return;
      const sp = aCells[idx];
      if (!sp) return;
      poses[`${poseName}_0`] = sp;
      poses[`${poseName}_1`] = sp;
      poses[`${poseName}_3`] = sp;
      poses[`${poseName}_2`] = flipCanvasHorizontal(sp);
    });
  }

  FARMER_AI_CACHE = poses;
  return poses;
}

let FURNITURE_AI_CACHE: Partial<Record<FurnitureKind, HTMLCanvasElement>> | null = null;
async function loadAiFurnitureSprites(): Promise<Partial<Record<FurnitureKind, HTMLCanvasElement>>> {
  if (FURNITURE_AI_CACHE) return FURNITURE_AI_CACHE;
  const [imgA, imgB, imgC, imgBinerFurn, imgJaringanFurn] = await Promise.all([
    loadImageElement(furnitureSheetAUrl),
    loadImageElement(furnitureSheetBUrl),
    loadImageElement(furnitureSheetCUrl),
    loadImageElement(binerFurnitureSheetUrl),
    loadImageElement(jaringanFurnitureSheetUrl),
  ]);
  const map: Partial<Record<FurnitureKind, HTMLCanvasElement>> = {};

  if (imgA) {
    const cells = sliceGridSheet(imgA, 3, 3, 180);
    const keys: FurnitureKind[] = [
      'bed',
      'fireplace',
      'bookshelf',
      'tv',
      'table_food',
      'plant',
      'chest',
      'rug',
      'elder_throne',
    ];
    keys.forEach((k, i) => {
      if (cells[i]) map[k] = cells[i]!;
    });
  }
  if (imgB) {
    const cells = sliceGridSheet(imgB, 3, 3, 180);
    const keys: FurnitureKind[] = [
      'counter',
      'seed_rack',
      'crate',
      'nest_box',
      'feed_trough',
      'hay_bale',
      'carpenter_bench',
      'anvil',
      'tool_rack',
    ];
    keys.forEach((k, i) => {
      if (cells[i]) map[k] = cells[i]!;
    });
  }
  if (imgC) {
    const cells = sliceGridSheet(imgC, 3, 3, 180);
    const keys: FurnitureKind[] = [
      'cauldron',
      'potion_shelf',
      'herb_table',
      'map_table',
      'nav_table',
      'telescope',
      'beacon_lamp',
      'wood_stack',
      'altar_lamp',
    ];
    keys.forEach((k, i) => {
      if (cells[i]) map[k] = cells[i]!;
    });
  }
  if (imgBinerFurn) {
    const cells = sliceGridSheet(imgBinerFurn, 4, 3, 200);
    const keys: FurnitureKind[] = [
      'elevator_up',
      'elevator_down',
      'reception_desk',
      'server_rack',
      'exec_desk',
      'conference_table',
      'coffee_machine',
      'vending_machine',
      'cyber_terminal',
      'sofa_lounge',
      'helipad_pad',
    ];
    keys.forEach((k, i) => {
      if (cells[i]) map[k] = cells[i]!;
    });
  }
  if (imgJaringanFurn) {
    const cells = sliceGridSheet(imgJaringanFurn, 3, 2, 190);
    const keys: FurnitureKind[] = [
      'jaringan_bed',
      'gem_display',
      'blueprint_table',
      'stone_anvil',
      'volcano_hearth',
      'rattan_sofa',
    ];
    keys.forEach((k, i) => {
      if (cells[i]) map[k] = cells[i]!;
    });
  }

  FURNITURE_AI_CACHE = map;
  return map;
}

const AI_BAG_DATA_URLS = new Map<BagItemId, string>();

interface MineAssetsPack {
  monsters: { slime: HTMLCanvasElement[]; bat: HTMLCanvasElement[]; golem: HTMLCanvasElement[] };
  mineEntrance: HTMLCanvasElement | null;
  mineLadder: HTMLCanvasElement | null;
  mineTorch: HTMLCanvasElement | null;
  mineBomb: HTMLCanvasElement | null;
  mineBoulder: HTMLCanvasElement | null;
  forgeEmblem: HTMLCanvasElement | null;
  bagItemAiSprites: Partial<Record<BagItemId, HTMLCanvasElement>>;
}

let MINE_PACK_CACHE: MineAssetsPack | null = null;

async function loadMineAndMonsterSprites(): Promise<MineAssetsPack> {
  if (MINE_PACK_CACHE) return MINE_PACK_CACHE;

  const [sheetMonsters, sheetDrops] = await Promise.all([
    loadImageElement(npcBagasMonstersUrl),
    loadImageElement(mineItemsDropsUrl),
  ]);

  const pack: MineAssetsPack = {
    monsters: { slime: [], bat: [], golem: [] },
    mineEntrance: null,
    mineLadder: null,
    mineTorch: null,
    mineBomb: null,
    mineBoulder: null,
    forgeEmblem: null,
    bagItemAiSprites: {},
  };

  if (sheetMonsters) {
    const cells = sliceGridSheet(sheetMonsters, 4, 3, 160);
    if (cells[4]) pack.monsters.slime.push(cells[4]);
    if (cells[5]) pack.monsters.slime.push(cells[5]);
    if (cells[6]) pack.monsters.bat.push(cells[6]);
    if (cells[7]) pack.monsters.bat.push(cells[7]);
    if (cells[8]) pack.monsters.golem.push(cells[8]);
    if (cells[9]) pack.monsters.golem.push(cells[9]);
    if (cells[10]) pack.mineEntrance = cells[10];
    if (cells[11]) pack.mineLadder = cells[11];
  }

  if (sheetDrops) {
    const drops = sliceGridSheet(sheetDrops, 3, 3, 128);
    const assignDrop = (idx: number, bagId?: BagItemId) => {
      const sp = drops[idx];
      if (!sp) return;
      if (bagId) {
        pack.bagItemAiSprites[bagId] = sp;
        try {
          AI_BAG_DATA_URLS.set(bagId, sp.toDataURL('image/png'));
        } catch {
          // ignore
        }
      }
    };
    assignDrop(0, 'torch_item');
    if (drops[0]) pack.mineTorch = drops[0];
    assignDrop(1, 'mine_bomb');
    if (drops[1]) pack.mineBomb = drops[1];
    assignDrop(2, 'hp_potion');
    assignDrop(3, 'slime_gel');
    assignDrop(4, 'bat_wing');
    assignDrop(5, 'monster_core');
    assignDrop(6, 'home_totem');
    if (drops[7]) pack.mineBoulder = drops[7];
    if (drops[8]) pack.forgeEmblem = drops[8];
  }

  MINE_PACK_CACHE = pack;
  return pack;
}

interface JaringanAssetsPack {
  jaringanTrees: Partial<Record<JaringanWoodId, HTMLCanvasElement>>;
  gemIcons: Partial<Record<JaringanGemId, HTMLCanvasElement>>;
  berryBush: HTMLCanvasElement | null;
  groundTorch: HTMLCanvasElement | null;
  jaringanHouses: {
    t1: HTMLCanvasElement | null;
    t2: HTMLCanvasElement | null;
    t3: HTMLCanvasElement | null;
  };
  jaringanBuilderHut: HTMLCanvasElement | null;
  jaringanHall: HTMLCanvasElement | null;
  jaringanVolcano: HTMLCanvasElement | null;
  bagItemAiSprites: Partial<Record<BagItemId, HTMLCanvasElement>>;
}

let JARINGAN_PACK_CACHE: JaringanAssetsPack | null = null;

async function loadJaringanAssets(): Promise<JaringanAssetsPack> {
  if (JARINGAN_PACK_CACHE) return JARINGAN_PACK_CACHE;

  const [woodsImg, gemsImg, fishImg, treesImg, housesImg] = await Promise.all([
    loadImageElement(jaringanWoodsSheetUrl),
    loadImageElement(jaringanGemsSheetUrl),
    loadImageElement(jaringanFishSheetUrl),
    loadImageElement(jaringanTreesSheetUrl),
    loadImageElement(jaringanHousesSheetUrl),
  ]);

  const pack: JaringanAssetsPack = {
    jaringanTrees: {},
    gemIcons: {},
    berryBush: null,
    groundTorch: null,
    jaringanHouses: { t1: null, t2: null, t3: null },
    jaringanBuilderHut: null,
    jaringanHall: null,
    jaringanVolcano: null,
    bagItemAiSprites: {},
  };

  const registerBagSprite = (bagId: BagItemId, sp: HTMLCanvasElement | null) => {
    if (!sp) return;
    pack.bagItemAiSprites[bagId] = sp;
    try {
      AI_BAG_DATA_URLS.set(bagId, sp.toDataURL('image/png'));
    } catch {
      // ignore
    }
  };

  if (woodsImg) {
    const cells = sliceGridSheet(woodsImg, 4, 3, 128);
    JARINGAN_WOOD_IDS.forEach((wid, i) => registerBagSprite(wid, cells[i]));
    registerBagSprite('item_palu', cells[10]);
    if (cells[11]) pack.berryBush = cells[11];
  }

  if (gemsImg) {
    const cells = sliceGridSheet(gemsImg, 4, 3, 128);
    JARINGAN_GEM_IDS.forEach((gid, i) => {
      const sp = cells[i];
      if (sp) {
        pack.gemIcons[gid] = sp;
        registerBagSprite(gid, sp);
      }
    });
    if (!pack.berryBush && cells[10]) pack.berryBush = cells[10];
    if (cells[11]) pack.groundTorch = cells[11];
  }

  if (fishImg) {
    const cells = sliceGridSheet(fishImg, 4, 3, 128);
    JARINGAN_FISH_IDS.forEach((fid, i) => registerBagSprite(fid, cells[i]));
  }

  if (treesImg) {
    const cells = sliceGridSheet(treesImg, 4, 3, 210);
    JARINGAN_WOOD_IDS.forEach((wid, i) => {
      if (cells[i]) pack.jaringanTrees[wid] = cells[i]!;
    });
  }

  if (housesImg) {
    const cells = sliceGridSheet(housesImg, 3, 2, 260);
    pack.jaringanHouses = {
      t1: cells[0] || null,
      t2: cells[1] || null,
      t3: cells[2] || null,
    };
    pack.jaringanBuilderHut = cells[3] || null;
    pack.jaringanHall = cells[4] || null;
    pack.jaringanVolcano = cells[5] || null;
  }

  JARINGAN_PACK_CACHE = pack;
  return pack;
}

export async function loadAllStardewSprites(): Promise<StardewSprites> {
  const [
    farmer,
    farmerPoses,
    farmhouse,
    shop,
    bin,
    tree,
    palmTree,
    coop,
    sacredTree,
    lighthouse,
    skyscraper,
    ferry,
    npcPack,
    furniture,
    minePack,
    jaringanPack,
  ] = await Promise.all([
    loadTransparentSprite(farmerSpriteUrl, 128),
    loadAiFarmerPoses(),
    loadTransparentSprite(farmhouseSpriteUrl, 240),
    loadTransparentSprite(shopSpriteUrl, 240),
    loadTransparentSprite(binSpriteUrl, 120),
    loadTransparentSprite(treeSpriteUrl, 200),
    loadTransparentSprite(palmTreeUrl, 200),
    loadTransparentSprite(coopSpriteUrl, 220),
    loadTransparentSprite(sacredTreeUrl, 280),
    loadTransparentSprite(lighthouseUrl, 260),
    loadTransparentSprite(skyscraperSpriteUrl, 340),
    loadTransparentSprite(ferrySpriteUrl, 240),
    loadSlicedNpcs(),
    loadAiFurnitureSprites(),
    loadMineAndMonsterSprites(),
    loadJaringanAssets(),
  ]);

  return {
    farmer,
    farmerPoses,
    farmhouse,
    shop,
    bin,
    tree,
    palmTree,
    coop,
    sacredTree,
    lighthouse,
    skyscraper,
    ferry,
    npcs: npcPack.npcs,
    npcPoses: npcPack.npcPoses,
    npcPortraits: npcPack.npcPortraits,
    furniture,
    monsters: minePack.monsters,
    mineEntrance: minePack.mineEntrance,
    mineLadder: minePack.mineLadder,
    mineTorch: minePack.mineTorch,
    mineBomb: minePack.mineBomb,
    mineBoulder: minePack.mineBoulder,
    forgeEmblem: minePack.forgeEmblem,
    bagItemAiSprites: {
      ...minePack.bagItemAiSprites,
      ...jaringanPack.bagItemAiSprites,
    },
    jaringanTrees: jaringanPack.jaringanTrees,
    gemIcons: jaringanPack.gemIcons,
    berryBush: jaringanPack.berryBush,
    groundTorch: jaringanPack.groundTorch,
    jaringanHouses: jaringanPack.jaringanHouses,
    jaringanBuilderHut: jaringanPack.jaringanBuilderHut,
    jaringanHall: jaringanPack.jaringanHall,
    jaringanVolcano: jaringanPack.jaringanVolcano,
  };
}

export function getAiFarmerPoseSprite(
  sprites: StardewSprites,
  pose: FarmerPose,
  dir: FarmerDir,
  activeTool?: StardewToolId
): HTMLCanvasElement {
  if (pose === 'idle' && dir === 1 && activeTool) {
    const toolPose = sprites.farmerPoses[`idle_${activeTool}_1`];
    if (toolPose) return toolPose;
  }
  if (
    (pose === 'action_axe' || pose === 'action_seed' || pose === 'action_fertilizer') &&
    sprites.farmerPoses[`${pose}_${dir}`]
  ) {
    return sprites.farmerPoses[`${pose}_${dir}`]!;
  }
  if ((pose === 'swing_up' || pose === 'swing_down') && activeTool) {
    const toolAction = sprites.farmerPoses[`action_${activeTool}_${dir}`];
    if (toolAction) return toolAction;
  }
  if (pose === 'water') {
    const waterAction = sprites.farmerPoses[`action_water_${dir}`];
    if (waterAction) return waterAction;
  }
  return (
    sprites.farmerPoses[`${pose}_${dir}`] ||
    sprites.farmerPoses[`idle_${dir}`] ||
    getFarmerPoseSprite(pose, dir)
  );
}

export function getAiNpcPoseSprite(
  sprites: StardewSprites,
  npcId: NpcId,
  dir: FarmerDir,
  isWalking: boolean,
  nowMs: number
): HTMLCanvasElement | null {
  const pack = sprites.npcPoses?.[npcId];
  if (pack) {
    if (dir === 3 && pack.up_walk) return pack.up_walk;
    if (dir === 0 && pack.right_walk) return pack.right_walk;
    if (dir === 2 && pack.left_walk) return pack.left_walk;
    if (isWalking && Math.floor(nowMs / 170) % 2 === 1 && pack.down_walk) {
      return pack.down_walk;
    }
    if (pack.down_idle) return pack.down_idle;
  }
  return sprites.npcs[npcId];
}

// ---------- 16x16 / 16x20 Crisp Pixel-Art Generator ----------

function makePixelCanvas(
  w: number,
  h: number,
  drawFn: (px: (x: number, y: number, color: string, pw?: number, ph?: number) => void) => void
): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = false;
    const px = (x: number, y: number, color: string, pw = 1, ph = 1) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, pw, ph);
    };
    drawFn(px);
  }
  return c;
}

function drawMatrix(
  px: (x: number, y: number, color: string, pw?: number, ph?: number) => void,
  rows: string[],
  palette: Record<string, string>,
  offsetX = 0,
  offsetY = 0
) {
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch !== '.' && palette[ch]) {
        px(x + offsetX, y + offsetY, palette[ch]);
      }
    }
  }
}

const SEASON_PALETTES: Record<
  Season,
  { base: string; alt: string; dark: string; light: string; flowerA: string; flowerB: string }
> = {
  Semi: {
    base: '#72b83e',
    alt: '#67ab35',
    dark: '#4c8824',
    light: '#8fd254',
    flowerA: '#fff59d',
    flowerB: '#f48fb1',
  },
  Panas: {
    base: '#5ea834',
    alt: '#549b2c',
    dark: '#3b771b',
    light: '#7ac447',
    flowerA: '#ffd54f',
    flowerB: '#ff8a65',
  },
  Gugur: {
    base: '#c98836',
    alt: '#b97a2d',
    dark: '#8d571d',
    light: '#dfa04a',
    flowerA: '#e65100',
    flowerB: '#ffd54f',
  },
  Dingin: {
    base: '#cbe6f5',
    alt: '#bdddf0',
    dark: '#8cb6d1',
    light: '#ebf7fd',
    flowerA: '#ffffff',
    flowerB: '#90caf9',
  },
};

export interface PixelAtlas {
  grass: Record<Season, HTMLCanvasElement[]>;
  forestFloor: HTMLCanvasElement[];
  plaza: HTMLCanvasElement[];
  sand: HTMLCanvasElement[];
  path: HTMLCanvasElement[];
  pondWater: HTMLCanvasElement;
  oceanWater: HTMLCanvasElement;
  stone: HTMLCanvasElement;
  wood: HTMLCanvasElement;
  stump: HTMLCanvasElement;
  weed: HTMLCanvasElement;
  ore_copper: HTMLCanvasElement;
  ore_silver: HTMLCanvasElement;
  ore_star: HTMLCanvasElement;
  forage_mushroom: HTMLCanvasElement;
  forage_berry: HTMLCanvasElement;
  forage_shell: HTMLCanvasElement;
  sprinkler: HTMLCanvasElement;
  goldSprinkler: HTMLCanvasElement;
  scarecrow: HTMLCanvasElement;
  workbench: HTMLCanvasElement;
  well: HTMLCanvasElement;
  chickenWhite: HTMLCanvasElement;
  chickenBrown: HTMLCanvasElement;
  crops: Record<CropId, HTMLCanvasElement[]>;
  tools: Record<StardewToolId, HTMLCanvasElement>;
  toolsByLevel: Record<UpgradeableToolId, HTMLCanvasElement[]>;
  bagItems: Record<BagItemId, HTMLCanvasElement>;
  furniture: Record<Exclude<FurnitureKind, 'rug'>, HTMLCanvasElement>;
}

let CACHED_ATLAS: PixelAtlas | null = null;

export function getStardewPixelAtlas(): PixelAtlas {
  if (CACHED_ATLAS) return CACHED_ATLAS;

  // 1. Seasonal Grass Variants
  const grass: Record<Season, HTMLCanvasElement[]> = {
    Semi: [],
    Panas: [],
    Gugur: [],
    Dingin: [],
  };
  (Object.keys(SEASON_PALETTES) as Season[]).forEach((season) => {
    const pal = SEASON_PALETTES[season];
    for (let v = 0; v < 4; v++) {
      grass[season].push(
        makePixelCanvas(16, 16, (px) => {
          px(0, 0, pal.base, 16, 16);
          for (let y = 0; y < 16; y += 2) {
            for (let x = 0; x < 16; x += 2) {
              const h = (x * 13 + y * 29 + v * 7) % 11;
              if (h === 0 || h === 5) px(x, y, pal.alt, 2, 1);
              else if (h === 2) px(x + 1, y, pal.light, 1, 1);
            }
          }
          if (v === 0 || v === 2) {
            px(3, 5, pal.dark);
            px(4, 4, pal.light);
            px(5, 5, pal.dark);
            px(11, 11, pal.dark);
            px(12, 10, pal.light);
          }
          if (v === 1) {
            px(9, 4, pal.dark);
            px(10, 3, pal.light);
            px(2, 12, pal.dark);
            px(3, 11, pal.light);
          }
          if (v === 3) {
            px(5, 6, pal.dark);
            px(4, 5, pal.flowerA);
            px(6, 5, pal.flowerA);
            px(5, 4, pal.flowerA);
            px(5, 5, season === 'Dingin' ? '#e3f2fd' : '#ff8f00');
            px(12, 12, pal.dark);
            px(11, 11, pal.flowerB);
            px(13, 11, pal.flowerB);
            px(12, 10, pal.flowerB);
            px(12, 11, '#fffde7');
          }
        })
      );
    }
  });

  // 2. Forest Floor, Plaza Cobble, Beach Sand, Path, Water
  const forestFloor = [0, 1].map((v) =>
    makePixelCanvas(16, 16, (px) => {
      px(0, 0, '#447e32', 16, 16);
      px(2, 3, '#376a28', 3, 2);
      px(9, 7, '#51933c', 3, 2);
      px(4, 12, '#376a28', 4, 2);
      if (v === 1) {
        px(12, 3, '#a7f3d0', 1, 1);
        px(6, 6, '#335d23', 2, 2);
      } else {
        px(11, 11, '#86efac', 1, 1);
      }
    })
  );

  const plaza = [0, 1].map((v) =>
    makePixelCanvas(16, 16, (px) => {
      px(0, 0, '#a8a29e', 16, 16);
      px(0, 0, '#78716c', 16, 1);
      px(0, 8, '#78716c', 16, 1);
      px(0, 0, '#78716c', 1, 8);
      px(8, 8, '#78716c', 1, 8);
      px(2, 2, '#d6d3d1', 5, 4);
      px(10, 10, '#d6d3d1', 5, 4);
      px(2, 10, '#9ca3af', 5, 4);
      if (v === 1) px(11, 3, '#e7e5e4', 3, 2);
    })
  );

  const sand = [0, 1].map((v) =>
    makePixelCanvas(16, 16, (px) => {
      px(0, 0, '#edd08f', 16, 16);
      px(2, 4, '#e0bc74', 3, 1);
      px(10, 9, '#f6dfb0', 3, 1);
      px(4, 13, '#d7ad62', 2, 1);
      if (v === 1) {
        px(12, 3, '#d7ad62', 2, 1);
        px(7, 8, '#f6dfb0', 2, 2);
      }
    })
  );

  const path = [0, 1].map((v) =>
    makePixelCanvas(16, 16, (px) => {
      px(0, 0, '#dfb577', 16, 16);
      px(2, 2, '#cfa060', 3, 2);
      px(10, 4, '#ebd09a', 3, 2);
      px(5, 9, '#c79554', 4, 3);
      px(11, 12, '#cfa060', 3, 2);
      if (v === 0) {
        px(3, 4, '#b88346', 2, 1);
        px(4, 3, '#f3dfb3', 2, 1);
        px(10, 9, '#b88346', 3, 2);
      } else {
        px(7, 3, '#b88346', 3, 2);
        px(2, 10, '#b88346', 2, 2);
      }
    })
  );

  const pondWater = makePixelCanvas(16, 16, (px) => {
    px(0, 0, '#328bc4', 16, 16);
    px(1, 2, '#3d9ad4', 4, 1);
    px(9, 6, '#48a8e3', 5, 1);
    px(3, 11, '#2b7bb0', 6, 1);
  });

  const oceanWater = makePixelCanvas(16, 16, (px) => {
    px(0, 0, '#1d6fa5', 16, 16);
    px(2, 3, '#2b86bf', 5, 1);
    px(8, 10, '#3699d4', 5, 1);
    px(1, 14, '#175a87', 6, 1);
  });

  // 3. Debris, Ores, Forage, Machines & Chickens
  const stone = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '.....oooooo.....',
        '...ooLLLLLLoo...',
        '..oLLMMMMMMLLo..',
        '.oLMMLLLLLLMMMo.',
        '.oLMMLMMMMMMMDo.',
        '.oLMMMMMMMMMDDo.',
        '.oMMMMMMMMDDDDo.',
        '..oMMMMDDDDDDo..',
        '...ooDDDDDDoo...',
        '....oooooooo....',
      ],
      { o: '#1f2937', L: '#cbd5e1', M: '#94a3b8', D: '#475569' },
      0,
      3
    );
  });

  const wood = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '.........oooo...',
        '.......ooBBBBoo.',
        '.....ooBBRRRRBBo',
        '...ooBBBBRRRRBBo',
        '..oBBBBBBBBBBBB.',
        '.oBBDDDDDDDDDBo.',
        '.oBDDDDDDDDDDo..',
        '.oBBBBDDDDDBo...',
        '..oooBBBBooo....',
        '.....oooo.......',
      ],
      { o: '#2d1407', B: '#9a5223', D: '#6b3413', R: '#e7ba84' },
      0,
      3
    );
  });

  const stump = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '....oooooooo....',
        '..ooRRRRRRRRoo..',
        '.oRRRBBBBBBBRRo.',
        '..ooBBBBBBBBoo..',
        '...oBBDDDDDBo...',
        '...oBBDDDDDBo...',
        '..ooBBDDDDDBoo..',
        '.oBBBBDDDDDBBBo.',
        '..ooooDDDDoooo..',
        '......oooo......',
      ],
      { o: '#241206', R: '#eab875', B: '#9a5223', D: '#5c2c0e' },
      0,
      4
    );
  });

  const weed = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '.......oo.......',
        '......oLLo......',
        '..oo..oLGo..oo..',
        '.oLLo.oGGo.oLLo.',
        '.oLGo.oGGo.oGGo.',
        '..oGooGDGooGGo..',
        '..oGGDDDDDGGo...',
        '...oDDDDDDDo....',
        '....oDDDDDo.....',
        '.....ooooo......',
      ],
      { o: '#14380c', L: '#8be04b', G: '#49a628', D: '#296e14' },
      0,
      4
    );
  });

  const ore_copper = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '.....oooooo.....',
        '...ooMMMMMMoo...',
        '..oMMCCCMMMMMo..',
        '.oMMCCLLCMMMMMo.',
        '.oMMMCCCMMMCCCo.',
        '.oMMMMMMMDCCLLCo',
        '.oMMDMMMMDDCCCDo',
        '..oMDDDDDDDDDDo.',
        '...ooDDDDDDoo...',
        '....oooooooo....',
      ],
      { o: '#1f2937', M: '#94a3b8', D: '#475569', C: '#ea580c', L: '#fdba74' },
      0,
      3
    );
  });

  const ore_silver = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '.....oooooo.....',
        '...ooMMMMMMoo...',
        '..oMMSSSMMMMMo..',
        '.oMMSSWWSMMMMMo.',
        '.oMMMSSSMMMSSSo.',
        '.oMMMMMMMDSWWSSo',
        '.oMMDMMMMDDSSSD.',
        '..oMDDDDDDDDDDo.',
        '...ooDDDDDDoo...',
        '....oooooooo....',
      ],
      { o: '#1e293b', M: '#64748b', D: '#334155', S: '#7dd3fc', W: '#f0f9ff' },
      0,
      3
    );
  });

  const ore_star = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '......oooo......',
        '.....oPPPPo.....',
        '...ooPPWWPPoo...',
        '..oPPPPWWPPPPo..',
        '.oPPPLLWWLLLPPo.',
        '.oPPLDDDDDDLPPo.',
        '..oPPDDDDDDPPo..',
        '...ooPPPPPPoo...',
        '....oooooooo....',
      ],
      { o: '#2e1065', P: '#a855f7', L: '#e9d5ff', W: '#fef08a', D: '#6b21a8' },
      0,
      3
    );
  });

  const forage_mushroom = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '....oooooooo....',
        '..ooRRRRRRRRoo..',
        '.oRRWWRRRRWWWRo.',
        '.oRRRRWWRRRRRRo.',
        '.oooooooooooooo.',
        '....oWWWWWWo....',
        '....oWWTTWWo....',
        '....oWWTTWWo....',
        '....oooooooo....',
      ],
      { o: '#271308', R: '#ef4444', W: '#fef2f2', T: '#e5d0b5' },
      0,
      4
    );
  });

  const forage_berry = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '....oooooooo....',
        '..ooGGGGGGGGoo..',
        '.oGGBBGGGGGBBGo.',
        '.oGLBGGGGGGGBLo.',
        '.oGGGGBBGGGGGGGo',
        '..oGGLBBGGGGGo..',
        '...ooDDDDDDoo...',
        '....oooooooo....',
      ],
      { o: '#14380c', G: '#22c55e', D: '#15803d', B: '#4f46e5', L: '#93c5fd' },
      0,
      5
    );
  });

  const forage_shell = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '.....oooooo.....',
        '...ooPPPPPPoo...',
        '..oPPLWWWWLPPo..',
        '.oPPWWWWWWWWPPo.',
        '.oPPLPPWWPPLPPo.',
        '..ooPPPPPPPPoo..',
        '....ooPPPPoo....',
        '.....oooooo.....',
      ],
      { o: '#4a1d32', P: '#f472b6', L: '#fbcfe8', W: '#fff1f2' },
      0,
      5
    );
  });

  const sprinkler = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '......oooo......',
        '.....oBBBBoo....',
        '....oBBWWBBBo...',
        '..oooBWWWWBooo..',
        '.oCCoBWCCWBoCCo.',
        '.oCCoCCCCCCoCCo.',
        '..oooCCCCCCooo..',
        '....oCCCCCCo....',
        '....oCDDDDCoo...',
        '.....oDDDDo.....',
        '......oooo......',
      ],
      { o: '#182232', B: '#38bdf8', W: '#e0f2fe', C: '#94a3b8', D: '#475569' },
      0,
      3
    );
  });

  const goldSprinkler = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '......oooo......',
        '.....oYYYYoo....',
        '....oYYWWYYYo...',
        '..oooYWWWWYooo..',
        '.oGGooWPPWooGGo.',
        '.oGGoYYYYYYoGGo.',
        '..oooYYYYYYooo..',
        '....oYYYYYYo....',
        '....oYDDDDYoo...',
        '.....oDDDDo.....',
        '......oooo......',
      ],
      { o: '#2d1605', Y: '#facc15', G: '#eab308', W: '#fef9c3', P: '#a855f7', D: '#b45309' },
      0,
      3
    );
  });

  const scarecrow = makePixelCanvas(16, 20, (px) => {
    drawMatrix(
      px,
      [
        '.....oooooo.....',
        '....oYYYYYYo....',
        '..ooYYYYYYYYoo..',
        '.oYYYYYYYYYYYYo.',
        '..oooTTTTTTToo..',
        '....oTTTTTTTo...',
        '....oTToToTTo...',
        '....oTTTTTTTo...',
        '..oooRRRRRRRooo.',
        '.oWWoRRRRRRRoWWo',
        '..oooRRBBBRRooo.',
        '....oRBBBBBRo...',
        '....oRBBBBBRo...',
        '.....ooWWWoo....',
        '.......oWo......',
        '.......oWo......',
        '.......oWo......',
        '......ooooo.....',
      ],
      { o: '#291408', Y: '#eab308', T: '#d99b52', R: '#c9382c', B: '#2563eb', W: '#7c451c' },
      0,
      1
    );
  });

  const workbench = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '..oooooooooooo..',
        '.oBBBBBBBBBBBBo.',
        '.oBBRRRRBBBBSSo.',
        '.oBBBBBBBBBBBBoo',
        '.oooooooooooooo.',
        '..oWWo....oWWo..',
        '..oWWoSSSSoWWo..',
        '..oWWo....oWWo..',
        '..oooo....oooo..',
      ],
      { o: '#2a1306', B: '#c67d38', W: '#7c3f16', R: '#dc2626', S: '#cbd5e1' },
      0,
      4
    );
  });

  const well = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '...oooooooooo...',
        '..oRRRRRRRRRRo..',
        '.oRRRRRRRRRRRRo.',
        '..oooWWooWWooo..',
        '....oWWooWWo....',
        '...ooSSSSSSoo...',
        '..oSSBBBBBBSSo..',
        '..oSSBBBBBBSSo..',
        '..oSSDDDDDDSSo..',
        '...oooooooooo...',
      ],
      { o: '#1f2937', R: '#b91c1c', W: '#8c4a1c', S: '#94a3b8', D: '#475569', B: '#38bdf8' },
      0,
      3
    );
  });

  const chickenWhite = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '......ooo.......',
        '.....oRRRo......',
        '....oWWWWoo.....',
        '...oWWoWWYYo....',
        '...oWWWWWWo.....',
        '..ooWWWWWWWWoo..',
        '.oWWWWLLLLWWWWo.',
        '.oWWWWWWWWWWWWo.',
        '..ooWWWWWWWWoo..',
        '....oYo..oYo....',
        '....ooo..ooo....',
      ],
      { o: '#261409', R: '#ef4444', W: '#ffffff', L: '#e2e8f0', Y: '#f59e0b' },
      1,
      3
    );
  });

  const chickenBrown = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '......ooo.......',
        '.....oRRRo......',
        '....oBBBBo......',
        '...oBBoBBYYo....',
        '...oBBBBBBoo....',
        '..ooBBBBBBBBoo..',
        '.oBBBBLLLLBBBBo.',
        '.oBBBBBBBBBBBBo.',
        '..ooBBBBBBBBoo..',
        '....oYo..oYo....',
        '....ooo..ooo....',
      ],
      { o: '#261409', R: '#ef4444', B: '#c27b3a', L: '#eab875', Y: '#f59e0b' },
      1,
      3
    );
  });

  // 4. Crops (9 crops x 4 stages)
  const stageSeeds = makePixelCanvas(16, 16, (px) => {
    px(4, 9, '#3e210e', 2, 2);
    px(4, 9, '#f3d9a4', 1, 1);
    px(10, 7, '#3e210e', 2, 2);
    px(10, 7, '#f3d9a4', 1, 1);
    px(8, 12, '#3e210e', 2, 2);
    px(8, 12, '#f3d9a4', 1, 1);
  });

  const stageSprout = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '..ooo....ooo..',
        '.oLLLo..oLLLo.',
        '.oLGGo..oGGGo.',
        '..oooGGGGooo..',
        '.....oGGo.....',
        '.....oDDo.....',
        '......oo......',
      ],
      { o: '#163d0b', L: '#9be853', G: '#52b82a', D: '#2c7715' },
      1,
      6
    );
  });

  const midBush = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '....oo..oo....',
        '..ooLLooLLoo..',
        '.oLLGLLLLGLLo.',
        '.oLGGGGGGGGLo.',
        '.oGGDDDDDDGGo.',
        '..ooDDDDDDoo..',
        '....oooooo....',
      ],
      { o: '#14380a', L: '#8ae246', G: '#45a824', D: '#236812' },
      1,
      6
    );
  });

  const midTall = makePixelCanvas(16, 20, (px) => {
    drawMatrix(
      px,
      [
        '......oo......',
        '.....oLLo.....',
        '..oo.oGGo.oo..',
        '.oLLooGGoLLo..',
        '..ooGGGGGGoo..',
        '....oGGGGoo...',
        '...oLLGGoo....',
        '....ooGGoo....',
        '.....oDDo.....',
        '.....oDDo.....',
        '......oo......',
      ],
      { o: '#14380a', L: '#95e952', G: '#46a825', D: '#236b12' },
      1,
      7
    );
  });

  const turnipRipe = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '...ooo....ooo...',
        '..oLLLo..oLLLo..',
        '..oLGGo..oGGGo..',
        '...ooGGGGGGoo...',
        '....ooPPPPoo....',
        '...oPPLLLPPPo...',
        '..oPPLWWWWLPPo..',
        '..oWWWWWWWWWWo..',
        '..oWWWWWWWWWWo..',
        '...oWWWWWWWWo...',
        '....ooWWWWoo....',
        '......oWWo......',
        '.......oo.......',
      ],
      { o: '#22120b', L: '#93e950', G: '#44a423', P: '#c084fc', W: '#f8fafc' },
      0,
      2
    );
  });

  const potatoRipe = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '....oo..oo......',
        '..ooLLooLLoo....',
        '.oLGGGGGGGGLo...',
        '.oGGDDDDDDGGo...',
        '..ooDDDDDDoo....',
        '..ooBBBBooBBoo..',
        '.oBBLLLLBBLLLLo.',
        '.oBBLBBBBBLBBBo.',
        '..oBBBBBoBBBBBo.',
        '...ooooo..oooo..',
      ],
      { o: '#241409', L: '#90e34c', G: '#43a022', D: '#256c12', B: '#c9883b' },
      0,
      4
    );
  });

  const strawberryRipe = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '...ooo....ooo...',
        '..oLLLo..oLLLo..',
        '.oGGGGGGGGGGGGo.',
        '.oGGRRoGGoRRGGo.',
        '.oGRYYRoRRYRRGo.',
        '..oRRRRoRRRRRo..',
        '..oGRRGoGRRGRo..',
        '...oGGo..oGGoo..',
        '..oRRRo..oRRRo..',
        '..oRYRo..oRYRo..',
        '...ooo....ooo...',
      ],
      { o: '#1a2e08', L: '#8be04b', G: '#37941d', R: '#ef4444', Y: '#fde047' },
      0,
      3
    );
  });

  const cornRipe = makePixelCanvas(16, 20, (px) => {
    drawMatrix(
      px,
      [
        '......oooo......',
        '.....oYYYYo.....',
        '....oGGoGGoo....',
        '...oLLGGGGLLo...',
        '..ooGGGGGGGGoo..',
        '..oGGYYYoYYGGo..',
        '..oGYOOYoYOYGo..',
        '...oGYYYoYYGo...',
        '...oLGGGGGGGLo..',
        '..oLLGGYYYGGLo..',
        '...ooGYOOYGGoo..',
        '.....oGYYGo.....',
        '.....oGGGGoo....',
        '......oDDo......',
        '......oDDo......',
        '.......oo.......',
      ],
      { o: '#1c2b07', L: '#9be853', G: '#47a624', D: '#246c12', Y: '#fde047', O: '#eab308' },
      0,
      2
    );
  });

  const sunflowerRipe = makePixelCanvas(16, 20, (px) => {
    drawMatrix(
      px,
      [
        '....oooooooo....',
        '..ooYYYYYYYYoo..',
        '.oYYOOOOOOOOYYo.',
        '.oYOOBBBBBBOOYo.',
        '.oYOBBBCCBBBOYo.',
        '.oYOBBCCCCBBOYo.',
        '.oYOOBBBBBBOOYo.',
        '.oYYOOOOOOOOYYo.',
        '..ooYYYYYYYYoo..',
        '....oooGGooo....',
        '..ooo..GG..ooo..',
        '.oLLLo.GG.oLLLo.',
        '..oooGGGGGGooo..',
        '......oGGo......',
        '......oDDo......',
        '.......oo.......',
      ],
      {
        o: '#241408',
        Y: '#fef08a',
        O: '#f59e0b',
        B: '#78350f',
        C: '#451a03',
        L: '#8ce247',
        G: '#3f9d20',
        D: '#226911',
      },
      0,
      2
    );
  });

  const pumpkinRipe = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '......oooo......',
        '.....oGGGGo.....',
        '...oooGGGoooo...',
        '..oOOoDDDDooOOo.',
        '.oOLLOOOOOOLLOOo',
        '.oOLOOORROOOLOOo',
        '.oOLOOORROOOLOOo',
        '.oOOOOORROOOOOOo',
        '.oODDOORROODDOOo',
        '..oDDDDDDDDDDo..',
        '...oooooooooo...',
      ],
      { o: '#291306', G: '#45a824', D: '#c2410c', O: '#f97316', L: '#fdba74', R: '#ea580c' },
      0,
      3
    );
  });

  const pineappleRipe = makePixelCanvas(16, 20, (px) => {
    drawMatrix(
      px,
      [
        '....oo..oo..oo..',
        '...oLLooLLooLLo.',
        '....ooGGGGGGoo..',
        '.....ooGGGGoo...',
        '....ooYYYYYYoo..',
        '...oYYOOYYOOYYo.',
        '...oOOYYOOYYOOo.',
        '...oYYOOYYOOYYo.',
        '...oOOYYOOYYOOo.',
        '....ooYYYYYYoo..',
        '.....oooooooo...',
      ],
      { o: '#1f2e08', L: '#8be04b', G: '#22c55e', Y: '#facc15', O: '#d97706' },
      0,
      5
    );
  });

  const coffeeRipe = makePixelCanvas(16, 20, (px) => {
    drawMatrix(
      px,
      [
        '....oooooooo....',
        '..ooGGGGGGGGoo..',
        '.oGGRRGGGGGRRGo.',
        '.oGRRGGDDGGRRGo.',
        '.oGGGGGRRGGGGGo.',
        '..oGGRRGGGRRGo..',
        '...ooDDDDDDoo...',
        '......oBBo......',
        '......oBBo......',
        '.......oo.......',
      ],
      { o: '#1c2b07', G: '#22c55e', D: '#15803d', R: '#dc2626', B: '#78350f' },
      0,
      6
    );
  });

  const moonfruitRipe = makePixelCanvas(16, 20, (px) => {
    drawMatrix(
      px,
      [
        '......oooo......',
        '.....oYYYYo.....',
        '...oooCCCCooo...',
        '..oCCWWWWWWCCo..',
        '.oCCWWYYYYWWCCo.',
        '.oCCWYYYYYYWCCo.',
        '..oCCWWYYWWCCo..',
        '...ooCCCCCCoo...',
        '.....oGGGGoo....',
        '......oDDo......',
        '.......oo.......',
      ],
      { o: '#1e1b4b', Y: '#fde047', C: '#38bdf8', W: '#e0f2fe', G: '#4ade80', D: '#15803d' },
      0,
      5
    );
  });

  const crops: Record<CropId, HTMLCanvasElement[]> = {
    turnip: [stageSeeds, stageSprout, midBush, turnipRipe],
    potato: [stageSeeds, stageSprout, midBush, potatoRipe],
    strawberry: [stageSeeds, stageSprout, midBush, strawberryRipe],
    corn: [stageSeeds, stageSprout, midTall, cornRipe],
    sunflower: [stageSeeds, stageSprout, midTall, sunflowerRipe],
    pumpkin: [stageSeeds, stageSprout, midBush, pumpkinRipe],
    pineapple: [stageSeeds, stageSprout, midTall, pineappleRipe],
    coffee: [stageSeeds, stageSprout, midTall, coffeeRipe],
    moonfruit: [stageSeeds, stageSprout, midTall, moonfruitRipe],
  };

  // 5. Tools (10 slots) + Tiered Lv.1-4 Upgraded Tool Icons
  const makeTieredTool = (toolId: UpgradeableToolId, tier: number): HTMLCanvasElement => {
    // Tier 1: Besi, Tier 2: Tembaga, Tier 3: Perak Safir, Tier 4: Kristal Bintang Emas
    const palettes = [
      { o: '#261409', L: '#f1f5f9', S: '#cbd5e1', D: '#64748b', W: '#c07a3e', B: '#78350f', G: '#facc15', gl: '' },
      { o: '#2b1206', L: '#fed7aa', S: '#fb923c', D: '#c2410c', W: '#a16207', B: '#713f12', G: '#fde047', gl: '#ffedd5' },
      { o: '#0f172a', L: '#f0f9ff', S: '#7dd3fc', D: '#0284c7', W: '#475569', B: '#1e293b', G: '#38bdf8', gl: '#e0f2fe' },
      { o: '#2e1065', L: '#fef9c3', S: '#facc15', D: '#a855f7', W: '#7e22ce', B: '#3b0764', G: '#38bdf8', gl: '#ffffff' },
    ];
    const p = palettes[Math.max(0, Math.min(3, tier - 1))];
    return makePixelCanvas(16, 16, (px) => {
      if (toolId === 'hoe') {
        drawMatrix(
          px,
          [
            '........oooooo..',
            '.......oLLSSSSo.',
            '......oSSDDDDSo.',
            '.......ooWWooo..',
            '........oWWo....',
            '.......oWWo.....',
            '......oWWo......',
            '.....oWWo.......',
            '....oWWo........',
            '...oWWo.........',
            '..oBBo..........',
            '..ooo...........',
          ],
          p,
          1,
          2
        );
      } else if (toolId === 'water') {
        drawMatrix(
          px,
          [
            '....oooooo......',
            '...oLLSSSSo.....',
            '..oSoooooSSo....',
            '..oSoSSSSSoSo...',
            '.oSSoSSWSSooSSo.',
            '.oSSoSSSSSoSSo..',
            '..ooSSSSSSSo....',
            '....oSSSSSo.....',
            '....oDDDDDo.....',
            '.....ooooo......',
          ],
          { ...p, W: p.L },
          0,
          3
        );
      } else if (toolId === 'axe') {
        drawMatrix(
          px,
          [
            '.......ooooo....',
            '......oLLLLSo...',
            '.....oLLSSSSSo..',
            '.....oSSDDSSSo..',
            '......oooWWoo...',
            '.......oWWo.....',
            '......oWWo......',
            '.....oWWo.......',
            '....oWWo........',
            '...oWWo.........',
            '..oBBo..........',
            '..ooo...........',
          ],
          p,
          1,
          2
        );
      } else if (toolId === 'pick') {
        drawMatrix(
          px,
          [
            '....oooooooo....',
            '..ooLLSSSSLLoo..',
            '.oSSDDLLLLDDSSo.',
            '..oo..oWWo..oo..',
            '......oWWo......',
            '......oWWo......',
            '......oWWo......',
            '......oWWo......',
            '......oWWo......',
            '......oBBo......',
            '.......oo.......',
          ],
          p,
          0,
          2
        );
      } else if (toolId === 'sword') {
        drawMatrix(
          px,
          [
            '...........ooo..',
            '..........oLLSo.',
            '.........oLLSo..',
            '........oLSSo...',
            '.......oLSSo....',
            '......oLSSo.....',
            '...oooLSSo......',
            '..oGGGGoo.......',
            '...oBBo.........',
            '..oBBo..........',
            '..oGGo..........',
            '...oo...........',
          ],
          p,
          1,
          2
        );
      } else {
        drawMatrix(
          px,
          [
            '...........ooo..',
            '..........oSSo..',
            '.........oWWo.L.',
            '........oWWo..L.',
            '.......oWWo...L.',
            '......oWWo...oGo',
            '.....oWWo....oDo',
            '....oWWo......o.',
            '...oWBo.........',
            '..oBBo..........',
            '..ooo...........',
          ],
          p,
          0,
          2
        );
      }
      // Tier Badges & Pixel Glints for Upgraded Tools
      if (tier >= 2) {
        px(13, 1, p.gl);
        px(14, 2, p.S);
      }
      if (tier >= 3) {
        px(2, 2, p.gl);
        px(3, 1, p.S);
        px(12, 12, p.G);
        px(13, 12, p.gl);
      }
      if (tier >= 4) {
        px(1, 1, '#fef08a', 2, 2);
        px(13, 13, '#38bdf8', 2, 2);
        px(2, 13, '#e879f9', 2, 1);
      }
    });
  };

  const toolsByLevel: Record<UpgradeableToolId, HTMLCanvasElement[]> = {
    hoe: [1, 2, 3, 4].map((t) => makeTieredTool('hoe', t)),
    water: [1, 2, 3, 4].map((t) => makeTieredTool('water', t)),
    axe: [1, 2, 3, 4].map((t) => makeTieredTool('axe', t)),
    pick: [1, 2, 3, 4].map((t) => makeTieredTool('pick', t)),
    sword: [1, 2, 3, 4].map((t) => makeTieredTool('sword', t)),
    rod: [1, 2, 3, 4].map((t) => makeTieredTool('rod', t)),
  };

  const tools: Record<StardewToolId, HTMLCanvasElement> = {
    hoe: toolsByLevel.hoe[0],
    water: toolsByLevel.water[0],
    axe: toolsByLevel.axe[0],
    pick: toolsByLevel.pick[0],
    sword: toolsByLevel.sword[0],
    harvest: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '......oooo......',
          '....ooWWWWoo....',
          '...oWWooooWWo...',
          '..oWWo....oWWo..',
          '.oooooGGGGooooo.',
          '.oBBBBBBBBBBBBo.',
          '.oBDDDDDDDDDDBo.',
          '..oBBBBBBBBBBoo.',
          '..oBDDDDDDDDBo..',
          '...oooooooooo...',
        ],
        { o: '#2b160a', W: '#e5a858', B: '#c67d38', D: '#8c4c1b', G: '#4ade80' },
        0,
        3
      );
    }),
    seed: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '....ooooooo.....',
          '...oPPPPPPPo....',
          '...oPYYYYYPo....',
          '...oPYGGGYPo....',
          '...oPYGLGYPo....',
          '...oPYYYYYPo....',
          '...oPPPPPPPo....',
          '...oDDDDDDDo....',
          '....ooooooo.....',
        ],
        { o: '#2d1a0b', P: '#f5e2ba', D: '#cfb17a', Y: '#fef08a', G: '#3ea324', L: '#8ce247' },
        1,
        3
      );
    }),
    fertilizer: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '....ooooooo.....',
          '...oBBBBBBBo....',
          '....ooBBBoo.....',
          '...oGGGGGGGo....',
          '..oGGYYYYYGGo...',
          '..oGYYGGGYGGo...',
          '..oGGGGGGGGGo...',
          '..oDDDDDDDDDo...',
          '...ooooooooo....',
        ],
        { o: '#1f2b0d', B: '#d99a52', G: '#49a82b', D: '#2a6f15', Y: '#fde047' },
        1,
        3
      );
    }),
    sprinkler,
    rod: toolsByLevel.rod[0],
  };

  // 6. Bag Item Pixel Icons (Fish, Eggs, Artisan, Ores, Forage)
  const makeFish = (body: string, light: string, fin: string) =>
    makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '......oooo......',
          '....ooLLLLoo....',
          '..ooBBBBBBBBo...',
          '.oFFBBBBBoBBo...',
          '.oFBBBBBBBBBo...',
          '.oFFBBDDDDDDo...',
          '..ooDDDDDDDoo...',
          '....oooooooo....',
        ],
        { o: '#142238', B: body, L: light, F: fin, D: fin },
        1,
        4
      );
    });

  const makeEgg = (shell: string, hi: string) =>
    makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '.....oooo.....',
          '....oSSSSo....',
          '...oSSHHSSo...',
          '..oSSSHHSSSo..',
          '..oSSSSSSSSo..',
          '..oSSSSSSSSo..',
          '...oSSSSSSo...',
          '....oooooo....',
        ],
        { o: '#3a2210', S: shell, H: hi },
        1,
        4
      );
    });

  const bagItems: Record<BagItemId, HTMLCanvasElement> = {
    fish_carp: makeFish('#f97316', '#fdba74', '#c2410c'),
    fish_snapper: makeFish('#38bdf8', '#bae6fd', '#0284c7'),
    fish_lobster: makeFish('#ef4444', '#fca5a5', '#b91c1c'),
    fish_goldkoi: makeFish('#facc15', '#fef9c3', '#d97706'),
    forage_mushroom,
    forage_berry,
    forage_shell,
    ore_copper,
    ore_silver,
    ore_star,
    egg_normal: makeEgg('#fef3c7', '#ffffff'),
    egg_gold: makeEgg('#facc15', '#fef9c3'),
    wood_res: wood,
    stone_res: stone,
    slime_gel: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '.....oooooo.....',
          '...ooLLLLLLoo...',
          '..oLLGGGGGGLLo..',
          '.oLGWWGGGGGGGGo.',
          '.oGGGGGGGGDDDGo.',
          '..oGGGGDDDDDDo..',
          '...oooooooooo...',
        ],
        { o: '#14532d', L: '#86efac', G: '#22c55e', D: '#15803d', W: '#ffffff' },
        0,
        5
      );
    }),
    bat_wing: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '..oooo....oooo..',
          '.oPPPPooooPPPoo.',
          '.oPPDDDDDDPPPo..',
          '..oPDDDDDDDPo...',
          '...oPPoPPoPo....',
          '....oo.oo.o.....',
        ],
        { o: '#1e1b4b', P: '#9333ea', D: '#4c1d95' },
        0,
        5
      );
    }),
    monster_core: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '......oooo......',
          '....ooCCCCoo....',
          '...oCCWWWWCCo...',
          '..oCCWYYYYWCCo..',
          '...oCCWWWWCCo...',
          '....ooCCCCoo....',
          '......oooo......',
        ],
        { o: '#1e1b4b', C: '#38bdf8', W: '#e0f2fe', Y: '#fef08a' },
        0,
        4
      );
    }),
    artisan_jam: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '....oooooo....',
          '...oWWWWWWo...',
          '...oooooooo...',
          '..oRRRRRRRRo..',
          '..oRRLLRRRRo..',
          '..oRRRRRRRRo..',
          '..oRRDDDDDRo..',
          '...oooooooo...',
        ],
        { o: '#2d1408', W: '#f1f5f9', R: '#ef4444', L: '#fca5a5', D: '#b91c1c' },
        1,
        4
      );
    }),
    artisan_coffee: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '.....o...o....',
          '....o.....o...',
          '...oooooooo...',
          '..oWWWWWWWWo..',
          '..oWBBBBBBWooo',
          '..oWBBBBBBWoWo',
          '..oWWWWWWWWoo.',
          '...oooooooo...',
        ],
        { o: '#2b160a', W: '#f8fafc', B: '#78350f' },
        1,
        4
      );
    }),
    artisan_tonic: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '.....oooo.....',
          '.....oWBo.....',
          '....ooGGoo....',
          '..ooGGGGGGoo..',
          '.oGGLLGGGGGGoo',
          '.oGGGGGGGGGGGo',
          '..ooDDDDDDoo..',
          '....oooooo....',
        ],
        { o: '#14380c', W: '#d99a52', B: '#9a5223', G: '#22c55e', L: '#bbf7d0', D: '#15803d' },
        1,
        4
      );
    }),
    hp_potion: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '.....oooo.....',
          '.....oWBo.....',
          '....ooRRoo....',
          '..ooRRRRRRoo..',
          '.oRRLLRRRRRRo.',
          '.oRRRRRRRRRRo.',
          '..ooDDDDDDoo..',
          '....oooooo....',
        ],
        { o: '#450a0a', W: '#fef2f2', B: '#9a5223', R: '#ef4444', L: '#fca5a5', D: '#991b1b' },
        1,
        4
      );
    }),
    mine_bomb: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '.......oYoo...',
          '......oW..O...',
          '....oooooo....',
          '..ooSSSSSSoo..',
          '.oSSLLSSSSSSo.',
          '.oSSSSSSSSSSo.',
          '..ooDDDDDDoo..',
          '....oooooo....',
        ],
        { o: '#0f172a', S: '#334155', L: '#94a3b8', D: '#1e293b', W: '#d99a52', Y: '#fde047', O: '#f97316' },
        1,
        4
      );
    }),
    torch_item: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '.....oooo.....',
          '....oYYYYo....',
          '....oOYYOo....',
          '.....oOOr.....',
          '.....oBBo.....',
          '.....oBBo.....',
          '.....oDDo.....',
          '......oo......',
        ],
        { o: '#261307', Y: '#fef08a', O: '#f97316', r: '#dc2626', B: '#b45309', D: '#78350f' },
        1,
        4
      );
    }),
    home_totem: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '....oooooo....',
          '...oYYYYYYo...',
          '..oYYCCCCYYo..',
          '..oYCCWWCCYo..',
          '...oYYYYYYo...',
          '...oBYYYYBo...',
          '...oBDDDDDo...',
          '....oooooo....',
        ],
        { o: '#451a03', Y: '#facc15', C: '#38bdf8', W: '#ffffff', B: '#b45309', D: '#78350f' },
        1,
        4
      );
    }),
    fish_bait: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '....oooooo....',
          '...oPPWWPPo...',
          '..oPPPRRRPPo..',
          '..oPRRRRRRPo..',
          '...ooPPPoo....',
          '.....oooo.....',
        ],
        { o: '#4a1d32', P: '#f472b6', R: '#ec4899', W: '#fdf2f8' },
        1,
        5
      );
    }),
    biner_espresso: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '....o....o....',
          '...oooooooo...',
          '..oCCCCCCCCo..',
          '..oCBBBBBBCooo',
          '..oCBBBBBBCoCo',
          '..oCCCCCCCCoo.',
          '...oooooooo...',
        ],
        { o: '#0f172a', C: '#06b6d4', B: '#451a03' },
        1,
        4
      );
    }),
    biner_energy_bar: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '..oooooooooo..',
          '.oYYYYBBBBYYo.',
          '.oYBBYYYYBBYo.',
          '.oBBBBBBBBBBoo',
          '..ooooooooooo.',
        ],
        { o: '#271206', Y: '#facc15', B: '#78350f' },
        1,
        5
      );
    }),
    biner_cooling_gel: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '.....oooo.....',
          '....oSSSSo....',
          '...ooCCCCoo...',
          '..oCCWWWWCCo..',
          '..oCCCCCCCCo..',
          '...ooCCCCoo...',
          '....oooooo....',
        ],
        { o: '#0c4a6e', S: '#cbd5e1', C: '#38bdf8', W: '#e0f2fe' },
        1,
        4
      );
    }),
    biner_silicon_chip: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '...o.o..o.o...',
          '..oooooooooo..',
          '.oGGGGGGGGGGoo',
          '.oGYYBBBBYYGGo',
          '.oGYBCCCCBYGGo',
          '.oGYYBBBBYYGGo',
          '..ooooooooooo.',
          '...o.o..o.o...',
        ],
        { o: '#0f172a', G: '#16a34a', Y: '#facc15', B: '#1e293b', C: '#38bdf8' },
        1,
        4
      );
    }),
    biner_quantum_battery: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '.....oooo.....',
          '...ooSSSSoo...',
          '..oPPPPPPPoo..',
          '..oPPCCCCPPo..',
          '..oPPCWWCPPoo.',
          '..oPPPPPPPPo..',
          '...oooooooo...',
        ],
        { o: '#1e1b4b', S: '#facc15', P: '#7c3aed', C: '#38bdf8', W: '#ffffff' },
        1,
        4
      );
    }),
    biner_drone_part: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '.ooo......ooo.',
          '..oSSooooSSo..',
          '...ooCCCCoo...',
          '....oCCWWCo...',
          '...ooCCCCoo...',
          '..oSSooooSSo..',
          '.ooo......ooo.',
        ],
        { o: '#0f172a', S: '#94a3b8', C: '#0ea5e9', W: '#fef08a' },
        1,
        4
      );
    }),
    biner_hydro_pod: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '....oooooo....',
          '...oCCCCCCo...',
          '..oCCGGGGCCo..',
          '..oCGGLLGGCo..',
          '..oSSSSSSSSo..',
          '...oooooooo...',
        ],
        { o: '#0f172a', C: '#bae6fd', G: '#22c55e', L: '#86efac', S: '#64748b' },
        1,
        4
      );
    }),
    biner_ferry_ticket: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '.oooooooooooo.',
          '.oCCCCWWCCCCo.',
          '.oCWYYYYYYWCo.',
          '.oCCCCWWCCCCo.',
          '.oooooooooooo.',
        ],
        { o: '#0c4a6e', C: '#0284c7', W: '#f8fafc', Y: '#facc15' },
        1,
        5
      );
    }),
    biner_vip_card: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '.oooooooooooo.',
          '.oYYYYYYYYYYo.',
          '.oYPPWWWWPPYo.',
          '.oYYYYYYYYYYo.',
          '.oooooooooooo.',
        ],
        { o: '#451a03', Y: '#facc15', P: '#9333ea', W: '#ffffff' },
        1,
        5
      );
    }),
    biner_server_core: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '....oooooo....',
          '..ooPPPPPPoo..',
          '.oPPCCCCCCPPo.',
          '.oPCCWWWWCCPo.',
          '.oPPCCCCCCPPo.',
          '..ooPPPPPPoo..',
          '....oooooo....',
        ],
        { o: '#1e1b4b', P: '#6366f1', C: '#38bdf8', W: '#fef08a' },
        1,
        4
      );
    }),
    // Fallback procedural pixel icons for Pulau Jaringan (overridden by AI sprites in AI_BAG_DATA_URLS)
    ...Object.fromEntries(
      [
        ['wood_mahoni', '#9a3412'],
        ['wood_merbau', '#7c2d12'],
        ['wood_sonokeling', '#4a1d1f'],
        ['wood_cendana', '#d97706'],
        ['wood_ulin', '#57321a'],
        ['wood_ebony', '#1e293b'],
        ['wood_sungkai', '#d6a664'],
        ['wood_trembesi', '#854d0e'],
        ['wood_meranti', '#c26d48'],
        ['wood_bengkirai', '#ca8a04'],
      ].map(([id, col]) => [
        id,
        makePixelCanvas(16, 16, (px) => {
          px(2, 5, '#2b1407', 12, 6);
          px(3, 6, col, 10, 4);
          px(11, 6, '#fde68a', 2, 4);
        }),
      ])
    ) as Record<JaringanWoodId, HTMLCanvasElement>,
    ...Object.fromEntries(
      [
        ['gem_akik', '#ea580c'],
        ['gem_giok', '#10b981'],
        ['gem_safir', '#2563eb'],
        ['gem_ruby', '#dc2626'],
        ['gem_zamrud', '#16a34a'],
        ['gem_kecubung', '#9333ea'],
        ['gem_opal', '#38bdf8'],
        ['gem_oniks', '#334155'],
        ['gem_topaz', '#eab308'],
        ['gem_berlian', '#e0f2fe'],
      ].map(([id, col]) => [
        id,
        makePixelCanvas(16, 16, (px) => {
          px(5, 3, '#0f172a', 6, 10);
          px(4, 5, '#0f172a', 8, 6);
          px(5, 5, col, 6, 6);
          px(6, 4, '#ffffff', 2, 2);
        }),
      ])
    ) as Record<JaringanGemId, HTMLCanvasElement>,
    ...Object.fromEntries(
      JARINGAN_FISH_IDS.map((id, idx) => [
        id,
        makePixelCanvas(16, 16, (px) => {
          const cols = ['#0284c7', '#1d4ed8', '#38bdf8', '#0ea5e9', '#ef4444', '#a16207', '#eab308', '#ca8a04', '#94a3b8', '#2563eb'];
          px(3, 6, '#0f172a', 10, 4);
          px(4, 7, cols[idx % cols.length], 8, 2);
          px(12, 5, cols[idx % cols.length], 2, 6);
        }),
      ])
    ) as Record<(typeof JARINGAN_FISH_IDS)[number], HTMLCanvasElement>,
    item_palu: makePixelCanvas(16, 16, (px) => {
      px(3, 3, '#475569', 9, 5);
      px(4, 4, '#cbd5e1', 7, 3);
      px(7, 8, '#78350f', 2, 6);
    }),
  };

  // 7. Interior Themed Pixel-Art Furniture (16x16 / 24x16)
  const furniture: Record<Exclude<FurnitureKind, 'rug'>, HTMLCanvasElement> = {
    bed: makePixelCanvas(24, 24, (px) => {
      drawMatrix(
        px,
        [
          '.oooooooooooooooooooooo.',
          '.oBBBBBBBBBBBBBBBBBBBBo.',
          '.oBWWWWWWooWWWWWWWWWBo..',
          '.oBWWWWWWooGGGGGGGGGGBo.',
          '.oBSSSSSSooGGGGGGGGGGGo.',
          '.oBGGGGGGGGGGLLLLGGGGBo.',
          '.oBGGGGGGGGGGLLLLGGGGBo.',
          '.oBGGGGGGGGGGGGGGGGGGBo.',
          '.oBDDDDDDDDDDDDDDDDDDBo.',
          '.oBBBBBBBBBBBBBBBBBBBBo.',
          '.oBBoo............ooBBo.',
          '.oooo..............oooo.',
        ],
        {
          o: '#241206',
          B: '#9a5223',
          W: '#f8fafc',
          S: '#cbd5e1',
          G: '#22c55e',
          L: '#86efac',
          D: '#15803d',
        },
        0,
        5
      );
    }),
    fireplace: makePixelCanvas(24, 24, (px) => {
      drawMatrix(
        px,
        [
          '..oooooooooooooooooooo..',
          '..oSSSSSSSSSSSSSSSSSSo..',
          '..oSDDDSSSDDDSSSDDDSSo..',
          '..oSSSSSSSSSSSSSSSSSSo..',
          '..oSSSooooooooooooSSSo..',
          '..oSSSooooooooooooSSSo..',
          '..oSSSoooOOOOOOoooSSSo..',
          '..oSSSooOOYYYYOOooSSSo..',
          '..oSSSoORROYYOORRoSSSo..',
          '..oSSSooooooooooooSSSo..',
          '.oooooooooooooooooooooo.',
        ],
        {
          o: '#1e293b',
          S: '#94a3b8',
          D: '#64748b',
          O: '#f97316',
          Y: '#fde047',
          R: '#dc2626',
        },
        0,
        6
      );
    }),
    bookshelf: makePixelCanvas(24, 20, (px) => {
      drawMatrix(
        px,
        [
          '.oooooooooooooooooooooo.',
          '.oBBBBBBBBBBBBBBBBBBBBo.',
          '.oBRRBBGGYYBBPPBBRRBBBo.',
          '.oBRRBBGGYYBBPPBBRRBBBo.',
          '.oBDDDDDDDDDDDDDDDDDDBo.',
          '.oBPPYYBBRRGGBBYYBBPPBo.',
          '.oBPPYYBBRRGGBBYYBBPPBo.',
          '.oBDDDDDDDDDDDDDDDDDDBo.',
          '.oBBBBBBBBBBBBBBBBBBBBo.',
          '.oooooooooooooooooooooo.',
        ],
        {
          o: '#261307',
          B: '#b45309',
          D: '#78350f',
          R: '#ef4444',
          G: '#22c55e',
          Y: '#facc15',
          P: '#6366f1',
        },
        0,
        4
      );
    }),
    tv: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '...o......o...',
          '....o....o....',
          '..oooooooooo..',
          '.oBBBBBBBBBBoo',
          '.oBCCCCCCCCBBo',
          '.oBCWWCCCCCBBo',
          '.oBCCCCCCCCBBo',
          '.oBBBBBBBRRBBo',
          '..ooooooooooo.',
          '...oo....oo...',
        ],
        { o: '#1e1b4b', B: '#78350f', C: '#38bdf8', W: '#e0f2fe', R: '#facc15' },
        1,
        3
      );
    }),
    table_food: makePixelCanvas(24, 20, (px) => {
      drawMatrix(
        px,
        [
          '.oooooooooooooooooooooo.',
          '.oBBBBBBBBBBBBBBBBBBBBo.',
          '.oBBYYBBWWBBBRRBBBBBBBo.',
          '.oBYYOOBWWBBBRRBBBBBBBo.',
          '.oBBBBBBBBBBBBBBBBBBBBo.',
          '.oDDDDDDDDDDDDDDDDDDDDo.',
          '..oBBo............oBBo..',
          '..oBBo............oBBo..',
          '..oooo............oooo..',
        ],
        { o: '#261307', B: '#d98a42', D: '#8c4a1c', Y: '#facc15', O: '#b45309', W: '#f8fafc', R: '#ef4444' },
        0,
        5
      );
    }),
    plant: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '.....oo..oo.....',
          '...ooLLooLLoo...',
          '..oLLGGLLGGLLo..',
          '..oGGDDDDDDGGo..',
          '...ooDDDDDDoo...',
          '....oBBBBBBoo...',
          '....oBRRRRBBo...',
          '.....oBBBBo.....',
          '.....oooooo.....',
        ],
        { o: '#1b2b0a', L: '#86efac', G: '#22c55e', D: '#15803d', B: '#b45309', R: '#9a3412' },
        0,
        4
      );
    }),
    chest: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '..oooooooooooo..',
          '.oBBBBBBBBBBBBo.',
          '.oBBBBYYYYBBBBo.',
          '.oBDDDDYYDDDDBo.',
          '.oBBBBBBBBBBBBo.',
          '.oBDDDDDDDDDDBo.',
          '..oooooooooooo..',
        ],
        { o: '#261307', B: '#b45309', D: '#78350f', Y: '#facc15' },
        0,
        5
      );
    }),
    counter: makePixelCanvas(32, 16, (px) => {
      drawMatrix(
        px,
        [
          '.oooooooooooooooooooooooooooooo.',
          '.oLLLLLLLLLLLLLLLLLLLLLLLLLLLLo.',
          '.oLBBBBBBBBBBYYBBBBBBBBBBBBBBLo.',
          '.oDDDDDDDDDDDDDDDDDDDDDDDDDDDDo.',
          '.oBBBBBBBBBBBBBBBBBBBBBBBBBBBBo.',
          '.oBDDDDDDDDDDDDDDDDDDDDDDDDDDBo.',
          '.oooooooooooooooooooooooooooooo.',
        ],
        { o: '#261307', L: '#f5d59c', B: '#b45309', D: '#78350f', Y: '#facc15' },
        0,
        4
      );
    }),
    seed_rack: makePixelCanvas(24, 16, (px) => {
      drawMatrix(
        px,
        [
          '.oooooooooooooooooooooo.',
          '.oBBBBBBBBBBBBBBBBBBBBo.',
          '.oBGGGBBYYYBBRRRBBOOOBo.',
          '.oBGGGBBYYYBBRRRBBOOOBo.',
          '.oBDDDDDDDDDDDDDDDDDDBo.',
          '.oBPPPBBCCCBBRRRBBGGGBo.',
          '.oBBBBBBBBBBBBBBBBBBBBo.',
          '.oooooooooooooooooooooo.',
        ],
        { o: '#261307', B: '#9a5223', D: '#5c2c0e', G: '#4ade80', Y: '#facc15', R: '#f87171', O: '#fb923c', P: '#c084fc', C: '#38bdf8' },
        0,
        4
      );
    }),
    crate: makePixelCanvas(20, 20, (px) => {
      drawMatrix(
        px,
        [
          '..oooooooooooooooo..',
          '.oBRRBBYYBBGGBBBBBo.',
          '.oBBBBBBBBBBBBBBBBo.',
          '.oDDDDDDDDDDDDDDDDo.',
          '.oBBBBBBBBBBBBBBBBo.',
          '.oBDDDDDDDDDDDDDDBo.',
          '..oooooooooooooooo..',
        ],
        { o: '#261307', B: '#c27d38', D: '#78350f', R: '#ef4444', Y: '#fde047', G: '#22c55e' },
        0,
        6
      );
    }),
    map_table: makePixelCanvas(24, 20, (px) => {
      drawMatrix(
        px,
        [
          '.oooooooooooooooooooooo.',
          '.oBBBBBBBBBBBBBBBBBBBBo.',
          '.oBCCCCCCCCCCCCCCCCCCBo.',
          '.oBCCGGGGGGGGGGGGGGCCBo.',
          '.oBCCGGYYGGGGGGGGGGCCBo.',
          '.oBCCCCCCCCCCCCCCCCCCBo.',
          '.oBDDDDDDDDDDDDDDDDDDBo.',
          '..oBBo............oBBo..',
          '..oooo............oooo..',
        ],
        { o: '#261307', B: '#9a5223', D: '#5c2c0e', C: '#38bdf8', G: '#4ade80', Y: '#facc15' },
        0,
        4
      );
    }),
    elder_throne: makePixelCanvas(20, 20, (px) => {
      drawMatrix(
        px,
        [
          '....oooooooooooo....',
          '...oYYYYYYYYYYYYo...',
          '...oYRRRRRRRRRRYo...',
          '...oYRRRRYYRRRRYo...',
          '..ooBBBBBBBBBBBBoo..',
          '.oBBYYYYYYYYYYYYBBo.',
          '.oBDDDDDDDDDDDDDDBo.',
          '..oooo........oooo..',
        ],
        { o: '#261307', Y: '#facc15', R: '#b91c1c', B: '#9a5223', D: '#5c2c0e' },
        0,
        5
      );
    }),
    altar_lamp: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '.....oooooo.....',
          '....oCCCCCCo....',
          '...oCCWWWWCCo...',
          '....oCCCCCCo....',
          '....oSSSSSSo....',
          '....oSDDDSSo....',
          '...ooSSSSSSoo...',
          '...oooooooooo...',
        ],
        { o: '#1e293b', C: '#38bdf8', W: '#fef08a', S: '#94a3b8', D: '#475569' },
        0,
        4
      );
    }),
    cauldron: makePixelCanvas(20, 20, (px) => {
      drawMatrix(
        px,
        [
          '....oooooooooooo....',
          '...oGGGGGGGGGGGGo...',
          '..oDDDDDDDDDDDDDDo..',
          '..oDDMMMMMMMMMMmDo..',
          '..oDDDDDDDDDDDDDDo..',
          '...ooDDDDDDDDDDoo...',
          '..oRRoOOOOOOOOoRRo..',
          '...oooooooooooooooo.',
        ],
        { o: '#0f172a', D: '#334155', M: '#64748b', m: '#94a3b8', G: '#a855f7', R: '#dc2626', O: '#f97316' },
        0,
        6
      );
    }),
    potion_shelf: makePixelCanvas(24, 16, (px) => {
      drawMatrix(
        px,
        [
          '.oooooooooooooooooooooo.',
          '.oBBBBBBBBBBBBBBBBBBBBo.',
          '.oBPPBBCCBBGGBBRRBBYYBo.',
          '.oBPPBBCCBBGGBBRRBBYYBo.',
          '.oBDDDDDDDDDDDDDDDDDDBo.',
          '.oooooooooooooooooooooo.',
        ],
        { o: '#1e1b4b', B: '#7c3aed', D: '#4c1d95', P: '#e879f9', C: '#38bdf8', G: '#4ade80', R: '#f87171', Y: '#facc15' },
        0,
        4
      );
    }),
    herb_table: makePixelCanvas(24, 16, (px) => {
      drawMatrix(
        px,
        [
          '.oooooooooooooooooooooo.',
          '.oBBBBBBBBBBBBBBBBBBBBo.',
          '.oBRRWWBBGGBBCCCBBGGGBo.',
          '.oBDDDDDDDDDDDDDDDDDDBo.',
          '..oBBo............oBBo..',
          '..oooo............oooo..',
        ],
        { o: '#261307', B: '#9a5223', D: '#5c2c0e', R: '#ef4444', W: '#fef2f2', G: '#22c55e', C: '#3b82f6' },
        0,
        4
      );
    }),
    carpenter_bench: workbench,
    anvil: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '.oooooooooooooo.',
          'oSSSSSSSSSSSSSSo',
          '.oooDDDDDDDDooo.',
          '....oDDDDDDo....',
          '...ooDDDDDDoo...',
          '..oBBBBBBBBBBo..',
          '..oooooooooooo..',
        ],
        { o: '#1e293b', S: '#cbd5e1', D: '#64748b', B: '#78350f' },
        0,
        5
      );
    }),
    wood_stack: wood,
    tool_rack: makePixelCanvas(24, 16, (px) => {
      drawMatrix(
        px,
        [
          '.oooooooooooooooooooooo.',
          '.oBBBBBBBBBBBBBBBBBBBBo.',
          '.oBSSBBSSBBYYBBSSBBBBBo.',
          '.oBWWBBWWBBWWBBWWBBBBBo.',
          '.oBDDDDDDDDDDDDDDDDDDBo.',
          '.oooooooooooooooooooooo.',
        ],
        { o: '#261307', B: '#9a5223', D: '#5c2c0e', S: '#cbd5e1', W: '#78350f', Y: '#facc15' },
        0,
        4
      );
    }),
    nav_table: makePixelCanvas(24, 20, (px) => {
      drawMatrix(
        px,
        [
          '.oooooooooooooooooooooo.',
          '.oBBBBBBBBBBBBBBBBBBBBo.',
          '.oBCCCCYYCCCCCCCCCCCCBo.',
          '.oBCCYYWWYYCCGGGGCCCCBo.',
          '.oBCCCCYYCCCCCCCCCCCCBo.',
          '.oBDDDDDDDDDDDDDDDDDDBo.',
          '..oBBo............oBBo..',
          '..oooo............oooo..',
        ],
        { o: '#172554', B: '#9a5223', D: '#5c2c0e', C: '#38bdf8', Y: '#facc15', W: '#ffffff', G: '#4ade80' },
        0,
        4
      );
    }),
    telescope: makePixelCanvas(16, 20, (px) => {
      drawMatrix(
        px,
        [
          '.........oooo...',
          '......oooYYYYo..',
          '...oooYYYYDDYo..',
          '..oCCYYYYoooo...',
          '...oooooo.......',
          '.....oBBo.......',
          '....oBo.oBo.....',
          '...oBo...oBo....',
          '..ooo.....ooo...',
        ],
        { o: '#1e293b', Y: '#facc15', D: '#b45309', C: '#7dd3fc', B: '#78350f' },
        0,
        4
      );
    }),
    beacon_lamp: makePixelCanvas(20, 20, (px) => {
      drawMatrix(
        px,
        [
          '....oooooooooooo....',
          '...oYYYYWWWWYYYYo...',
          '..oYYWWWWWWWWWWYYo..',
          '...oYYYYWWWWYYYYo...',
          '....ooSSSSSSSSoo....',
          '.....oDDDDDDDDo.....',
          '....ooSSSSSSSSoo....',
          '....oooooooooooo....',
        ],
        { o: '#1e293b', Y: '#facc15', W: '#fef9c3', S: '#94a3b8', D: '#475569' },
        0,
        4
      );
    }),
    nest_box: makePixelCanvas(24, 16, (px) => {
      drawMatrix(
        px,
        [
          '.oooooooooooooooooooooo.',
          '.oBBBBBBBBBBBBBBBBBBBBo.',
          '.oBYYYYYYBYYYYYYBYYYYBo.',
          '.oBYWWYYWBYYWWYYBYWWYBo.',
          '.oBDDDDDDDDDDDDDDDDDDBo.',
          '.oooooooooooooooooooooo.',
        ],
        { o: '#291408', B: '#b45309', D: '#78350f', Y: '#facc15', W: '#fef9c3' },
        0,
        4
      );
    }),
    feed_trough: makePixelCanvas(24, 16, (px) => {
      drawMatrix(
        px,
        [
          '.oooooooooooooooooooooo.',
          '.oBBBBBBBBBBBBBBBBBBBBo.',
          '.oBYYYYYYYYYYYYYYYYYYBo.',
          '.oBOOOOOOOOOOOOOOOOOOBo.',
          '.oBDDDDDDDDDDDDDDDDDDBo.',
          '.oooooooooooooooooooooo.',
        ],
        { o: '#291408', B: '#9a5223', D: '#5c2c0e', Y: '#fde047', O: '#eab308' },
        0,
        4
      );
    }),
    hay_bale: makePixelCanvas(20, 16, (px) => {
      drawMatrix(
        px,
        [
          '..oooooooooooooooo..',
          '.oYYYYYYYYYYYYYYYYo.',
          '.oYOOOOYYYYOOOOYYYo.',
          '.oYYYYYYYYYYYYYYYYo.',
          '.oOOOOOYYYYOOOOOOYo.',
          '..oooooooooooooooo..',
        ],
        { o: '#451a03', Y: '#fde047', O: '#ca8a04' },
        0,
        5
      );
    }),
    elevator_up: makePixelCanvas(24, 20, (px) => {
      drawMatrix(
        px,
        [
          '..oooooooooooooooooooo..',
          '..oSSSSSSSSSSSSSSSSSSo..',
          '..oSSCCCCooooooCCCCSSo..',
          '..oSSCCSSGGGGGGSSCCSSo..',
          '..oSSCCSSGGGGGGSSCCSSo..',
          '..oSSCCSSGGGGGGSSCCSSo..',
          '..oSSCCSSGGGGGGSSCCSSo..',
          '..oDDDDDDDDDDDDDDDDDDo..',
        ],
        { o: '#0f172a', S: '#94a3b8', C: '#38bdf8', G: '#22c55e', D: '#475569' },
        0,
        5
      );
    }),
    elevator_down: makePixelCanvas(24, 20, (px) => {
      drawMatrix(
        px,
        [
          '..oooooooooooooooooooo..',
          '..oSSSSSSSSSSSSSSSSSSo..',
          '..oSSCCCCooooooCCCCSSo..',
          '..oSSCCSSOOOOOOSSCCSSo..',
          '..oSSCCSSOOOOOOSSCCSSo..',
          '..oSSCCSSOOOOOOSSCCSSo..',
          '..oSSCCSSOOOOOOSSCCSSo..',
          '..oDDDDDDDDDDDDDDDDDDo..',
        ],
        { o: '#0f172a', S: '#94a3b8', C: '#38bdf8', O: '#f97316', D: '#475569' },
        0,
        5
      );
    }),
    reception_desk: makePixelCanvas(32, 16, (px) => {
      drawMatrix(
        px,
        [
          '.oooooooooooooooooooooooooooooo.',
          '.oWWWWWWWWWWWWWWWWWWWWWWWWWWWWo.',
          '.oWCCCCCCCCCCWWCCCCCCCCCCCCCCWo.',
          '.oDDDDDDDDDDDDDDDDDDDDDDDDDDDDo.',
          '.oSSSSSSSSSSSSSSSSSSSSSSSSSSSSo.',
          '.oooooooooooooooooooooooooooooo.',
        ],
        { o: '#0f172a', W: '#f8fafc', C: '#06b6d4', D: '#334155', S: '#64748b' },
        0,
        4
      );
    }),
    server_rack: makePixelCanvas(24, 24, (px) => {
      drawMatrix(
        px,
        [
          '...oooooooooooooooooo...',
          '...oBBBBBBBBBBBBBBBBo...',
          '...oBGGCCBBBBBBGGCCBo...',
          '...oBBBBBBBBBBBBBBBBo...',
          '...oBRRCCBBBBBBGGCCBo...',
          '...oBBBBBBBBBBBBBBBBo...',
          '...oBGGCCBBBBBBYYCCBo...',
          '...oBBBBBBBBBBBBBBBBo...',
          '...oooooooooooooooooo...',
        ],
        { o: '#020617', B: '#1e293b', G: '#22c55e', C: '#38bdf8', R: '#ef4444', Y: '#facc15' },
        0,
        5
      );
    }),
    exec_desk: makePixelCanvas(24, 16, (px) => {
      drawMatrix(
        px,
        [
          '.oooooooooooooooooooooo.',
          '.oBBBBBBBBBBBBBBBBBBBBo.',
          '.oBYYBBCCCCCCCCCCBBYYBo.',
          '.oDDDDDDDDDDDDDDDDDDDDo.',
          '..oBBo............oBBo..',
          '..oooo............oooo..',
        ],
        { o: '#1e1b4b', B: '#78350f', D: '#451a03', Y: '#facc15', C: '#38bdf8' },
        0,
        5
      );
    }),
    conference_table: makePixelCanvas(32, 20, (px) => {
      drawMatrix(
        px,
        [
          '..oooooooooooooooooooooooooooo..',
          '.oWWWWWWWWWWWWWWWWWWWWWWWWWWWWo.',
          '.oWCCCCCCWWWWCCCCCCWWWWCCCCCCWo.',
          '.oWDDDDDDWWWWDDDDDDWWWWDDDDDDWo.',
          '..oooooooooooooooooooooooooooo..',
          '...oSSo..................oSSo...',
        ],
        { o: '#0f172a', W: '#e2e8f0', C: '#38bdf8', D: '#64748b', S: '#475569' },
        0,
        5
      );
    }),
    coffee_machine: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '..oooooooooooo..',
          '.oSSSSSSSSSSSSo.',
          '.oSCCSSSSSSCCSo.',
          '.oSSoBBBBBBooSo.',
          '.oSSoWWWWWWooSo.',
          '.oDDDDDDDDDDDDo.',
          '..oooooooooooo..',
        ],
        { o: '#0f172a', S: '#475569', C: '#06b6d4', B: '#451a03', W: '#f8fafc', D: '#1e293b' },
        0,
        4
      );
    }),
    vending_machine: makePixelCanvas(20, 20, (px) => {
      drawMatrix(
        px,
        [
          '...oooooooooooooo...',
          '..oCCCCCCCCCCCCCCo..',
          '..oCRRYBBCCGGYYCCo..',
          '..oCBBBBCCCCCCBBCo..',
          '..oCYYYYCCCCCCYYCo..',
          '..oCCooooooooooCCo..',
          '..oCCoDDDDDDDDoCCo..',
          '...oooooooooooooo...',
        ],
        { o: '#0f172a', C: '#0284c7', R: '#ef4444', Y: '#facc15', B: '#38bdf8', G: '#22c55e', D: '#1e293b' },
        0,
        4
      );
    }),
    cyber_terminal: makePixelCanvas(24, 16, (px) => {
      drawMatrix(
        px,
        [
          '..oooooooooooooooooooo..',
          '.oSSSSSSSSSSSSSSSSSSSSo.',
          '.oSCCCCCCSSPPPPSSCCCCSo.',
          '.oSCWWWWCSPPPPPPWCCCCSo.',
          '.oDDDDDDDDDDDDDDDDDDDDo.',
          '..oSSo............oSSo..',
        ],
        { o: '#020617', S: '#334155', C: '#38bdf8', P: '#a855f7', W: '#ffffff', D: '#1e293b' },
        0,
        5
      );
    }),
    sofa_lounge: makePixelCanvas(24, 16, (px) => {
      drawMatrix(
        px,
        [
          '.oooooooooooooooooooooo.',
          '.oPPPPPPPPPPPPPPPPPPPPo.',
          '.oPLLLLLLLLLLLLLLLLLLPo.',
          '.oPPPPPPPPPPPPPPPPPPPPo.',
          '.oDDDDDDDDDDDDDDDDDDDDo.',
          '..oSSo............oSSo..',
        ],
        { o: '#1e1b4b', P: '#6366f1', L: '#a5b4fc', D: '#312e81', S: '#94a3b8' },
        0,
        5
      );
    }),
    helipad_pad: makePixelCanvas(32, 24, (px) => {
      drawMatrix(
        px,
        [
          '..oooooooooooooooooooooooooooo..',
          '.oSSSSSSSSSSSSSSSSSSSSSSSSSSSSo.',
          '.oSSYYYYYYSSSSSSSSSSSSYYYYYYSSo.',
          '.oSSYYooYYSSYYooooYYSSYYooYYSSo.',
          '.oSSYYooYYSSYYYYYYYYSSYYooYYSSo.',
          '.oSSYYooYYSSYYooooYYSSYYooYYSSo.',
          '.oSSYYYYYYSSSSSSSSSSSSYYYYYYSSo.',
          '.oSSSSSSSSSSSSSSSSSSSSSSSSSSSSo.',
          '..oooooooooooooooooooooooooooo..',
        ],
        { o: '#0f172a', S: '#475569', Y: '#facc15' },
        0,
        4
      );
    }),
    jaringan_bed: makePixelCanvas(24, 24, (px) => {
      px(2, 4, '#451a03', 20, 16);
      px(4, 6, '#fef3c7', 16, 4);
      px(4, 10, '#10b981', 16, 8);
    }),
    gem_display: makePixelCanvas(24, 16, (px) => {
      px(2, 3, '#78350f', 20, 10);
      px(5, 5, '#ef4444', 3, 4);
      px(10, 5, '#38bdf8', 3, 4);
      px(15, 5, '#22c55e', 3, 4);
    }),
    blueprint_table: makePixelCanvas(24, 16, (px) => {
      px(2, 3, '#78350f', 20, 10);
      px(4, 4, '#1d4ed8', 16, 7);
      px(6, 6, '#e0f2fe', 12, 3);
    }),
    stone_anvil: makePixelCanvas(16, 16, (px) => {
      px(2, 5, '#334155', 12, 4);
      px(5, 9, '#475569', 6, 4);
    }),
    volcano_hearth: makePixelCanvas(24, 24, (px) => {
      px(3, 3, '#334155', 18, 18);
      px(7, 10, '#ef4444', 10, 9);
      px(9, 12, '#fde047', 6, 6);
    }),
    rattan_sofa: makePixelCanvas(24, 16, (px) => {
      px(2, 4, '#9a5223', 20, 10);
      px(4, 6, '#fde68a', 16, 6);
    }),
  };

  CACHED_ATLAS = {
    grass,
    forestFloor,
    plaza,
    sand,
    path,
    pondWater,
    oceanWater,
    stone,
    wood,
    stump,
    weed,
    ore_copper,
    ore_silver,
    ore_star,
    forage_mushroom,
    forage_berry,
    forage_shell,
    sprinkler,
    goldSprinkler,
    scarecrow,
    workbench,
    well,
    chickenWhite,
    chickenBrown,
    crops,
    tools,
    toolsByLevel,
    bagItems,
    furniture,
  };

  return CACHED_ATLAS;
}

// ---------- Complete 4-Direction + Multi-Action Pixel-Art Farmer Poses ----------

export type FarmerPose =
  | 'idle'
  | 'walk1'
  | 'walk2'
  | 'swing_up'
  | 'swing_down'
  | 'action_sword'
  | 'action_hoe'
  | 'action_water'
  | 'action_pick'
  | 'action_axe'
  | 'action_seed'
  | 'action_fertilizer'
  | 'plant'
  | 'water'
  | 'harvest'
  | 'fish_cast'
  | 'fish_pull'
  | 'sleep';

export type FarmerDir = 0 | 1 | 2 | 3; // 0: right, 1: down, 2: left, 3: up

const FARMER_PAL: Record<string, string> = {
  o: '#1c0e06', // Dark outline
  Y: '#facc15', // Straw hat bright
  H: '#ca8a04', // Straw hat band/brim
  R: '#dc2626', // Red shirt / bandana
  r: '#991b1b', // Red shadow
  S: '#f3c49b', // Skin tone
  s: '#d69e74', // Skin shadow
  K: '#3b1d0c', // Hair / eyes
  B: '#2563eb', // Blue overalls
  b: '#1d4ed8', // Overalls shadow
  G: '#fde047', // Brass button
  W: '#78350f', // Boots
  w: '#451a03', // Dark boot sole
  C: '#38bdf8', // Watering can / fish glint
  L: '#fef3c7', // Seed / light
};

const FARMER_MATRICES: Record<string, string[]> = {
  // DOWN (Facing Camera)
  down_idle: [
    '.....oooooooo.....',
    '....oYYYYYYYYo....',
    '..ooHHHHHHHHHHoo..',
    '.oYYYYYYYYYYYYYYo.',
    '....oSSSSSSSSo....',
    '....oSKSSSSKSo....',
    '....oSSSSSSSSo....',
    '...ooRRRRRRRRoo...',
    '..oSSoRBBBBBRoSSo.',
    '..oSSoBGBBBGBoSSo.',
    '..ooooBBBBBBBoooo.',
    '.....oBBBBBBBo....',
    '.....oBBooBBBo....',
    '.....oBBo.oBBo....',
    '.....oWWo.oWWo....',
    '.....oooo.oooo....',
  ],
  down_walk1: [
    '.....oooooooo.....',
    '....oYYYYYYYYo....',
    '..ooHHHHHHHHHHoo..',
    '.oYYYYYYYYYYYYYYo.',
    '....oSSSSSSSSo....',
    '....oSKSSSSKSo....',
    '....oSSSSSSSSo....',
    '...ooRRRRRRRRoo...',
    '..oSSoRBBBBBRoSSo.',
    '..oSSoBGBBBGBoSSo.',
    '.....oBBBBBBBo....',
    '.....oBBBBBBBo....',
    '.....oBBooBBBoo...',
    '.....oWWo...oBBo..',
    '.....oooo...oooo..',
    '..................',
  ],
  down_walk2: [
    '.....oooooooo.....',
    '....oYYYYYYYYo....',
    '..ooHHHHHHHHHHoo..',
    '.oYYYYYYYYYYYYYYo.',
    '....oSSSSSSSSo....',
    '....oSKSSSSKSo....',
    '....oSSSSSSSSo....',
    '...ooRRRRRRRRoo...',
    '..oSSoRBBBBBRoSSo.',
    '..oSSoBGBBBGBoSSo.',
    '.....oBBBBBBBo....',
    '.....oBBBBBBBo....',
    '...ooBBBooBBBo....',
    '..oBBo...oWWo.....',
    '..oooo...oooo.....',
    '..................',
  ],
  // UP (Facing North - Back View with Straw Hat + Overalls + Backpack)
  up_idle: [
    '.....oooooooo.....',
    '....oYYYYYYYYo....',
    '..ooHHHHHHHHHHoo..',
    '.oYYYYYYYYYYYYYYo.',
    '..oooKKKKKKKKooo..',
    '....oKKKKKKKKo....',
    '....oKKKKKKKRo....',
    '...ooRRRRRRRRoo...',
    '..oSSoBBBBBBBoSSo.',
    '..oSSoBWWWWWWoSSo.',
    '..ooooBWWWWWWoooo.',
    '.....oBBBBBBBo....',
    '.....oBBooBBBo....',
    '.....oBBo.oBBo....',
    '.....oWWo.oWWo....',
    '.....oooo.oooo....',
  ],
  up_walk1: [
    '.....oooooooo.....',
    '....oYYYYYYYYo....',
    '..ooHHHHHHHHHHoo..',
    '.oYYYYYYYYYYYYYYo.',
    '..oooKKKKKKKKooo..',
    '....oKKKKKKKKo....',
    '....oKKKKKKKRo....',
    '...ooRRRRRRRRoo...',
    '..oSSoBBBBBBBo....',
    '..ooooBWWWWWWoSSo.',
    '.....oBWWWWWWoSSo.',
    '.....oBBBBBBBoSSo.',
    '.....oBBooBBBoooo.',
    '.....oWwo.oBBo....',
    '.....oooo.oWWo....',
    '..........oooo....',
  ],
  up_walk2: [
    '.....oooooooo.....',
    '....oYYYYYYYYo....',
    '..ooHHHHHHHHHHoo..',
    '.oYYYYYYYYYYYYYYo.',
    '..oooKKKKKKKKooo..',
    '....oKKKKKKKKo....',
    '....oKKKKKKKRo....',
    '...ooRRRRRRRRoo...',
    '....oBBBBBBBoSSo..',
    '..oSSoBWWWWWWoooo.',
    '..oSSoBWWWWWWo....',
    '..oSSoBBBBBBBo....',
    '..ooooBBooBBBo....',
    '.....oBBo.oWwo....',
    '.....oWWo.oooo....',
    '.....oooo.........',
  ],
  // RIGHT (Side Profile - Left flips horizontally!)
  right_idle: [
    '.....oooooooo.....',
    '....oYYYYYYYYo....',
    '..ooHHHHHHHHHHoo..',
    '.oYYYYYYYYYYYYYYo.',
    '....ooKKKKSSSo....',
    '.....oKKKKSSKo....',
    '.....oKKSSSSSo....',
    '....ooRRRRRRoo....',
    '....oRRBBSSBRo....',
    '....oBBBBSSGBo....',
    '....oBBBBoooo.....',
    '.....oBBBBBo......',
    '.....oBBooBBo.....',
    '.....oBBo.oBBo....',
    '.....oWWo.oWWo....',
    '.....oooo.oooo....',
  ],
  right_walk1: [
    '.....oooooooo.....',
    '....oYYYYYYYYo....',
    '..ooHHHHHHHHHHoo..',
    '.oYYYYYYYYYYYYYYo.',
    '....ooKKKKSSSo....',
    '.....oKKKKSSKo....',
    '.....oKKSSSSSo....',
    '....ooRRRRRRoo....',
    '....oRRBBBBSSo....',
    '...oSSoBBBGGSo....',
    '...oSSoBBBBoo.....',
    '...ooooBBBBo......',
    '....oBBo.oBBo.....',
    '...oBBo...oBBo....',
    '..oWWo.....oWWo...',
    '..oooo.....oooo...',
  ],
  right_walk2: [
    '.....oooooooo.....',
    '....oYYYYYYYYo....',
    '..ooHHHHHHHHHHoo..',
    '.oYYYYYYYYYYYYYYo.',
    '....ooKKKKSSSo....',
    '.....oKKKKSSKo....',
    '.....oKKSSSSSo....',
    '....ooRRRRRRoo....',
    '....oRRBBBBBRo....',
    '....oBBBSSBBBo....',
    '....oBBBSSBBBo....',
    '.....oooBBBBo.....',
    '.....oBBooBBo.....',
    '.....oBBo.oBBo....',
    '.....oWWo.oWWo....',
    '.....oooo.oooo....',
  ],
  // ACTION POSES!
  swing_up: [
    '....oSSo....oSSo..',
    '....oSSo....oSSo..',
    '....oYYooooooYYo..',
    '...ooHHHHHHHHHHoo.',
    '..oYYYYYYYYYYYYYYo',
    '....ooSSSSSSSoo...',
    '.....oSKSSSSKo....',
    '....ooRRRRRRRoo...',
    '....oRRBBBBBRRo...',
    '.....oBGBBBBGo....',
    '.....oBBBBBBBo....',
    '.....oBBooBBBo....',
    '.....oBBo.oBBo....',
    '.....oWWo.oWWo....',
    '.....oooo.oooo....',
  ],
  swing_down: [
    '.....oooooooo.....',
    '....oYYYYYYYYo....',
    '..ooHHHHHHHHHHoo..',
    '.oYYYYYYYYYYYYYYo.',
    '....ooKKKKSSSo....',
    '.....oKKKKSSKo....',
    '....ooRRRRRRoo....',
    '....oRRBBBBSSSo...',
    '....oBBBBBBSSSo...',
    '.....oBBBBBBooo...',
    '.....oBBooBBBo....',
    '....oBBo...oBBo...',
    '....oWWo...oWWo...',
    '....oooo...oooo...',
  ],
  plant: [
    '..................',
    '..................',
    '.....oooooooo.....',
    '....oYYYYYYYYo....',
    '..ooHHHHHHHHHHoo..',
    '.oYYYYYYYYYYYYYYo.',
    '....ooKKKKSSSo....',
    '.....oKKKKSSKo....',
    '....ooRRRRRRoo....',
    '....oRRBBBBBBRo...',
    '....oBBBBBBBBSSo..',
    '...oBBoBBBBooSSLo.',
    '...oWWooWWo..ooo..',
    '...ooooooo........',
  ],
  water: [
    '.....oooooooo.....',
    '....oYYYYYYYYo....',
    '..ooHHHHHHHHHHoo..',
    '.oYYYYYYYYYYYYYYo.',
    '....ooKKKKSSSo....',
    '.....oKKKKSSKo....',
    '....ooRRRRRRoo....',
    '....oRRBBSSSo.....',
    '....oBBBBSSCCCo...',
    '....oBBBBBCCCCCo..',
    '.....oBBooBBoo.C..',
    '.....oBBo.oBBo.C..',
    '.....oWWo.oWWo....',
    '.....oooo.oooo....',
  ],
  harvest: [
    '.....oooooooo.....',
    '....oYYYYYYYYo....',
    '..ooHHHHHHHHHHoo..',
    '.oYYYYYYYYYYYYYYo.',
    '....ooSSSSSSSo....',
    '....oSKSSSSKSo....',
    '..oooRRRRRRRRooo..',
    '.oSSoRBBBBBBBoSSo.',
    '.oSSoBBGGGGGBoSSo.',
    '..oooBBBBBBBBoooo.',
    '.....oBBooBBBo....',
    '.....oWWo.oWWo....',
    '.....oooo.oooo....',
  ],
  fish_cast: [
    '.....oooooooo.....',
    '....oYYYYYYYYo....',
    '..ooHHHHHHHHHHoo..',
    '.oYYYYYYYYYYYYYYo.',
    '....ooKKKKSSSo....',
    '.....oKKKKSSKo....',
    '....ooRRRRRRoo....',
    '....oRRBBBBSSSo...',
    '....oBBBBBBSSWwo..',
    '.....oBBBBBBooo...',
    '.....oBBooBBo.....',
    '.....oBBo.oBBo....',
    '.....oWWo.oWWo....',
    '.....oooo.oooo....',
  ],
  fish_pull: [
    '....oooooooo......',
    '...oYYYYYYYYo.....',
    '.ooHHHHHHHHHHoo...',
    'oYYYYYYYYYYYYYYo..',
    '...ooKKKKSSSo.....',
    '....oKKKKSSKo.....',
    '...ooRRRRRRoo.....',
    '..oSSRRBBBBBRo....',
    '.oWWSSBBBBBBBo....',
    '..oooBBBBBBBoo....',
    '.....oBBooBBo.....',
    '....oBBo..oBBo....',
    '....oWWo..oWWo....',
    '....oooo..oooo....',
  ],
  sleep: [
    '..................',
    '..................',
    '..................',
    '....oooooo........',
    '...oKKKKKSo.......',
    '...oKKSSKSooooo...',
    '...oSSSSRBBBBBRo..',
    '...ooooooooooooo..',
  ],
};

const FARMER_POSE_CACHE = new Map<string, HTMLCanvasElement>();

export function getFarmerPoseSprite(pose: FarmerPose, dir: FarmerDir): HTMLCanvasElement {
  const key = `${pose}_${dir}`;
  const cached = FARMER_POSE_CACHE.get(key);
  if (cached) return cached;

  let matrixKey = 'down_idle';
  if (pose === 'idle' || pose === 'walk1' || pose === 'walk2') {
    if (dir === 1) matrixKey = `down_${pose}`;
    else if (dir === 3) matrixKey = `up_${pose}`;
    else matrixKey = `right_${pose}`;
  } else {
    matrixKey = pose;
  }

  const rows = FARMER_MATRICES[matrixKey] || FARMER_MATRICES.down_idle;
  const sprite = makePixelCanvas(18, 18, (px) => {
    drawMatrix(px, rows, FARMER_PAL, 0, 1);
  });

  if (dir === 2) {
    const flipped = document.createElement('canvas');
    flipped.width = sprite.width;
    flipped.height = sprite.height;
    const fCtx = flipped.getContext('2d');
    if (fCtx) {
      fCtx.imageSmoothingEnabled = false;
      fCtx.translate(sprite.width, 0);
      fCtx.scale(-1, 1);
      fCtx.drawImage(sprite, 0, 0);
    }
    FARMER_POSE_CACHE.set(key, flipped);
    return flipped;
  }

  FARMER_POSE_CACHE.set(key, sprite);
  return sprite;
}

// ---------- Detailed Pixel-Art World Map Renderer for 5-Island Pulau TIK ----------

export function renderPixelWorldMapCanvas(
  canvas: HTMLCanvasElement,
  tiles: FarmTile[],
  season: Season,
  storyChapter: number,
  islandHealed: boolean,
  trees?: WorldTree[]
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;

  const scale = 8; // 78*8 = 624 x 52*8 = 416 crisp pixels!
  if (canvas.width !== WORLD_COLS * scale) canvas.width = WORLD_COLS * scale;
  if (canvas.height !== WORLD_ROWS * scale) canvas.height = WORLD_ROWS * scale;

  const pal = SEASON_PALETTES[season];

  for (let y = 0; y < WORLD_ROWS; y++) {
    for (let x = 0; x < WORLD_COLS; x++) {
      const tile = tiles[y * WORLD_COLS + x];
      if (!tile) continue;
      const px = x * scale;
      const py = y * scale;

      if (tile.kind === 'ocean') {
        const edgeDist =
          (tiles[y * WORLD_COLS + Math.max(0, x - 1)]?.kind !== 'ocean' ? 1 : 0) +
          (tiles[y * WORLD_COLS + Math.min(WORLD_COLS - 1, x + 1)]?.kind !== 'ocean' ? 1 : 0) +
          (tiles[Math.max(0, y - 1) * WORLD_COLS + x]?.kind !== 'ocean' ? 1 : 0) +
          (tiles[Math.min(WORLD_ROWS - 1, y + 1) * WORLD_COLS + x]?.kind !== 'ocean' ? 1 : 0);
        ctx.fillStyle = edgeDist > 0 ? '#2b86bf' : (x + y) % 5 === 0 ? '#185e8c' : '#1d6fa5';
        ctx.fillRect(px, py, scale, scale);
        if (edgeDist > 0) {
          ctx.fillStyle = '#bae6fd';
          ctx.fillRect(px + 1, py + 1, scale - 2, 2);
        } else if ((x * 7 + y * 13) % 9 === 0) {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(px + 2, py + 3, 3, 2);
        }
      } else if (tile.kind === 'river' || tile.kind === 'pond') {
        ctx.fillStyle = '#328bc4';
        ctx.fillRect(px, py, scale, scale);
        ctx.fillStyle = '#7dd3fc';
        ctx.fillRect(px + 1, py + 2, 4, 2);
      } else if (tile.kind === 'sand') {
        ctx.fillStyle = '#edd08f';
        ctx.fillRect(px, py, scale, scale);
        if ((x + y) % 3 === 0) {
          ctx.fillStyle = '#d7ad62';
          ctx.fillRect(px + 2, py + 5, 2, 2);
        }
      } else if (tile.kind === 'forest_floor') {
        ctx.fillStyle = '#3c732b';
        ctx.fillRect(px, py, scale, scale);
        if ((x * 3 + y * 5) % 4 === 0) {
          ctx.fillStyle = '#245218';
          ctx.fillRect(px + 1, py + 1, 5, 5);
          ctx.fillStyle = '#4f9438';
          ctx.fillRect(px + 2, py + 2, 3, 3);
        }
      } else if (tile.kind === 'plaza' || tile.kind === 'cliff_pass') {
        ctx.fillStyle = x >= 47 ? '#64748b' : '#a8a29e';
        ctx.fillRect(px, py, scale, scale);
        ctx.fillStyle = x >= 47 ? '#475569' : '#d6d3d1';
        ctx.fillRect(px + 1, py + 1, scale - 2, scale - 2);
        if (tile.kind === 'cliff_pass' && storyChapter < 3) {
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(px + 1, py + 1, scale - 2, scale - 2);
        }
      } else if (tile.kind === 'path') {
        ctx.fillStyle = '#dfb577';
        ctx.fillRect(px, py, scale, scale);
        ctx.fillStyle = '#c79554';
        ctx.fillRect(px + 2, py + 2, 2, 2);
      } else if (tile.kind === 'bridge' || tile.kind === 'pier') {
        const broken = tile.kind === 'bridge' && x >= 41 && x <= 43 && y >= 28 && y <= 31 && storyChapter < 2;
        ctx.fillStyle = broken ? '#dc2626' : '#9a5223';
        ctx.fillRect(px, py, scale, scale);
        ctx.fillStyle = broken ? '#fef08a' : '#dfb577';
        ctx.fillRect(px + 1, py + 1, scale - 2, scale - 2);
      } else {
        ctx.fillStyle = tile.tilled ? '#7c3f16' : pal.base;
        ctx.fillRect(px, py, scale, scale);
        if (!tile.tilled && (x * 7 + y * 11) % 6 === 0) {
          ctx.fillStyle = pal.flowerA;
          ctx.fillRect(px + 2, py + 2, 2, 2);
        }
        if (tile.crop) {
          ctx.fillStyle = tile.crop.ready ? '#fde047' : '#4ade80';
          ctx.fillRect(px + 2, py + 2, 4, 4);
        }
      }

      if (tile.debris === 'ore_star') {
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(px + 2, py + 2, 4, 4);
      } else if (tile.debris === 'ore_silver') {
        ctx.fillStyle = '#7dd3fc';
        ctx.fillRect(px + 2, py + 2, 4, 4);
      } else if (tile.debris === 'ore_copper') {
        ctx.fillStyle = '#fb923c';
        ctx.fillRect(px + 2, py + 2, 4, 4);
      }
    }
  }

  // Standing Choppable Trees overlay
  if (trees) {
    trees.forEach((tr) => {
      if (tr.hp <= 0) return;
      ctx.fillStyle = tr.kind === 'palm' ? '#16a34a' : '#14532d';
      ctx.fillRect(tr.x * scale + 1, tr.y * scale + 1, scale - 2, scale - 2);
      ctx.fillStyle = tr.kind === 'palm' ? '#4ade80' : '#22c55e';
      ctx.fillRect(tr.x * scale + 2, tr.y * scale + 2, scale - 4, scale - 4);
    });
  }

  // Pixel-art miniature building blocks on the 78x52 map!
  const drawMiniRoof = (tx: number, ty: number, tw: number, th: number, roof: string, trim: string) => {
    const rx = tx * scale;
    const ry = ty * scale;
    const rw = tw * scale;
    const rh = th * scale;
    ctx.fillStyle = '#241206';
    ctx.fillRect(rx - 2, ry - 2, rw + 4, rh + 4);
    ctx.fillStyle = trim;
    ctx.fillRect(rx, ry, rw, rh);
    ctx.fillStyle = roof;
    ctx.fillRect(rx + 2, ry + 2, rw - 4, rh - 4);
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(rx + Math.floor(rw / 2) - 2, ry + rh - 4, 4, 4);
  };

  drawMiniRoof(21, 17, 3, 3, '#b91c1c', '#f59e0b'); // Rumah Kebun
  drawMiniRoof(27, 17, 3, 3, '#d97706', '#fef08a'); // Kandang Ayam
  drawMiniRoof(39, 17, 3, 3, '#ec4899', '#f8fafc'); // Toko Benih
  drawMiniRoof(44, 17, 3, 3, '#4f46e5', '#facc15'); // Balai Tetua
  drawMiniRoof(49, 17, 3, 3, '#dc2626', '#cbd5e1'); // Bengkel Kiran
  drawMiniRoof(53, 17, 3, 3, '#ea580c', '#fed7aa'); // Pos Bagas
  drawMiniRoof(23, 8, 3, 3, '#9333ea', '#e9d5ff'); // Pondok Maya
  drawMiniRoof(29, 5, 3, 3, '#c2410c', '#fed7aa'); // Bengkel Jaka
  drawMiniRoof(49, 5, 3, 3, '#b45309', '#fef3c7'); // Kincir Angin
  drawMiniRoof(52, 33, 3, 3, '#0284c7', '#f8fafc'); // Mercusuar
  drawMiniRoof(45, 38, 4, 3, '#78350f', '#fffbeb'); // Kapal Bima
  drawMiniRoof(7, 19, 3, 3, '#10b981', '#bbf7d0'); // Pondok Dewi

  // Both Underground Mine Entrances
  drawMiniRoof(54, 6, 2, 2, '#1e293b', '#f97316');
  drawMiniRoof(67, 12, 2, 2, '#1e293b', '#f97316');

  // Sacred Pohon Cahaya Abadi + 4 Mustika Gems
  ctx.fillStyle = islandHealed ? '#f472b6' : '#ec4899';
  ctx.fillRect(39 * scale - 2, 5 * scale - 2, 3 * scale + 4, 3 * scale + 4);
  ctx.fillStyle = '#fbcfe8';
  ctx.fillRect(39 * scale + 3, 5 * scale + 3, 3 * scale - 6, 3 * scale - 6);
  const gemCoords = [
    { x: 37, y: 9, lit: storyChapter >= 2, c: '#84cc16' },
    { x: 38, y: 10, lit: storyChapter >= 3, c: '#38bdf8' },
    { x: 42, y: 10, lit: storyChapter >= 4, c: '#a855f7' },
    { x: 43, y: 9, lit: storyChapter >= 5, c: '#facc15' },
  ];
  gemCoords.forEach((g) => {
    ctx.fillStyle = g.lit || islandHealed ? g.c : '#475569';
    ctx.fillRect(g.x * scale + 1, g.y * scale + 1, 6, 6);
  });

  // Pixel-art Compass Rose in Top-Left Ocean Corner
  const cx = 24;
  const cy = 24;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
  ctx.fillRect(cx - 16, cy - 16, 32, 32);
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - 16, cy - 16, 32, 32);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(cx - 1, cy - 10, 2, 20);
  ctx.fillRect(cx - 10, cy - 1, 20, 2);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(cx - 2, cy - 12, 4, 7);
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('U', cx, cy - 16 + 8);
}

export function renderBinerWorldMapCanvas(
  canvas: HTMLCanvasElement,
  tiles: FarmTile[],
  binerMissionChapter: number,
  trees?: WorldTree[]
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;

  const scale = 8; // 84*8 = 672 x 56*8 = 448 crisp pixels
  if (canvas.width !== BINER_COLS * scale) canvas.width = BINER_COLS * scale;
  if (canvas.height !== BINER_ROWS * scale) canvas.height = BINER_ROWS * scale;

  for (let y = 0; y < BINER_ROWS; y++) {
    for (let x = 0; x < BINER_COLS; x++) {
      const tile = tiles[y * BINER_COLS + x];
      if (!tile) continue;
      const px = x * scale;
      const py = y * scale;

      if (tile.kind === 'ocean') {
        ctx.fillStyle = (x + y) % 5 === 0 ? '#0369a1' : '#0284c7';
        ctx.fillRect(px, py, scale, scale);
      } else if (tile.kind === 'sand') {
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(px, py, scale, scale);
      } else if (tile.kind === 'asphalt' || tile.kind === 'crosswalk') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px, py, scale, scale);
        if (tile.kind === 'crosswalk') {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(px + 2, py + 1, scale - 4, scale - 2);
        } else if (x % 2 === 0 || y % 2 === 0) {
          ctx.fillStyle = '#facc15';
          ctx.fillRect(px + 3, py + 3, 2, 2);
        }
      } else if (tile.kind === 'sidewalk') {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(px, py, scale, scale);
      } else if (tile.kind === 'plaza') {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(px, py, scale, scale);
      } else if (tile.kind === 'fountain') {
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(px, py, scale, scale);
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(px + 2, py + 2, 4, 4);
      } else if (tile.kind === 'helipad_tile') {
        ctx.fillStyle = '#334155';
        ctx.fillRect(px, py, scale, scale);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(px + 2, py + 2, 4, 4);
      } else if (tile.kind === 'solar_panel') {
        ctx.fillStyle = '#1d4ed8';
        ctx.fillRect(px + 1, py + 1, scale - 2, scale - 2);
      } else if (tile.kind === 'pier' || tile.kind === 'biner_ferry') {
        ctx.fillStyle = tile.kind === 'biner_ferry' ? '#f8fafc' : '#9a5223';
        ctx.fillRect(px, py, scale, scale);
      } else {
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(px, py, scale, scale);
      }
    }
  }

  if (trees) {
    trees.forEach((tr) => {
      if (tr.hp <= 0) return;
      ctx.fillStyle = '#15803d';
      ctx.fillRect(tr.x * scale + 1, tr.y * scale + 1, scale - 2, scale - 2);
    });
  }

  const drawCorpBlock = (tx: number, ty: number, tw: number, th: number, top: string, border: string) => {
    ctx.fillStyle = '#020617';
    ctx.fillRect(tx * scale - 2, ty * scale - 2, tw * scale + 4, th * scale + 4);
    ctx.fillStyle = border;
    ctx.fillRect(tx * scale, ty * scale, tw * scale, th * scale);
    ctx.fillStyle = top;
    ctx.fillRect(tx * scale + 3, ty * scale + 3, tw * scale - 6, th * scale - 6);
  };

  drawCorpBlock(38, 17, 6, 6, '#06b6d4', '#f8fafc'); // Menara Biner Corp (4 Lt)
  drawCorpBlock(56, 17, 5, 6, '#6366f1', '#c7d2fe'); // Menara Kuantum Data (3 Lt)
  drawCorpBlock(20, 27, 5, 5, '#ec4899', '#fce7f3'); // Mal & Kafe Siber (2 Lt)
  drawCorpBlock(57, 27, 5, 5, '#f59e0b', '#fef3c7'); // Hotel Eksekutif (2 Lt)
  drawCorpBlock(43, 46, 5, 3, '#0ea5e9', '#ffffff'); // Ferri Pulau Biner

  // Mission Chapter Badge in Top-Left
  ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
  ctx.fillRect(8, 8, 96, 22);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, 96, 22);
  ctx.fillStyle = '#e0f2fe';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`BINER CH.${Math.min(5, binerMissionChapter)}`, 14, 22);
}

export function renderJaringanWorldMapCanvas(
  canvas: HTMLCanvasElement,
  tiles: FarmTile[],
  trees?: WorldTree[],
  isVolcanicAsh?: boolean
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;

  const scale = 6; // 110*6 = 660 x 76*6 = 456 crisp pixels
  if (canvas.width !== JARINGAN_COLS * scale) canvas.width = JARINGAN_COLS * scale;
  if (canvas.height !== JARINGAN_ROWS * scale) canvas.height = JARINGAN_ROWS * scale;

  for (let y = 0; y < JARINGAN_ROWS; y++) {
    for (let x = 0; x < JARINGAN_COLS; x++) {
      const tile = tiles[y * JARINGAN_COLS + x];
      if (!tile) continue;
      const px = x * scale;
      const py = y * scale;

      if (tile.kind === 'ocean') {
        ctx.fillStyle = (x + y) % 5 === 0 ? '#0369a1' : '#0c4a6e';
        ctx.fillRect(px, py, scale, scale);
      } else if (tile.kind === 'sand') {
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(px, py, scale, scale);
      } else if (tile.kind === 'forest_floor') {
        ctx.fillStyle = '#14532d';
        ctx.fillRect(px, py, scale, scale);
      } else if (tile.kind === 'plaza') {
        ctx.fillStyle = '#57534e';
        ctx.fillRect(px, py, scale, scale);
      } else if (tile.kind === 'volcano_rock') {
        ctx.fillStyle = '#292524';
        ctx.fillRect(px, py, scale, scale);
      } else if (tile.kind === 'volcano_lava') {
        ctx.fillStyle = '#f97316';
        ctx.fillRect(px, py, scale, scale);
      } else if (tile.kind === 'bridge' || tile.kind === 'pier') {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(px, py, scale, scale);
      } else if (tile.kind === 'house_plot') {
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(px, py, scale, scale);
      } else if (
        tile.kind === 'jaringan_house_t1' ||
        tile.kind === 'jaringan_house_t2' ||
        tile.kind === 'jaringan_house_t3'
      ) {
        ctx.fillStyle = tile.kind === 'jaringan_house_t3' ? '#38bdf8' : tile.kind === 'jaringan_house_t2' ? '#10b981' : '#f59e0b';
        ctx.fillRect(px, py, scale, scale);
      } else if (tile.kind === 'jaringan_hall') {
        ctx.fillStyle = '#7c3aed';
        ctx.fillRect(px, py, scale, scale);
      } else if (tile.kind === 'jaringan_builder_hut') {
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(px, py, scale, scale);
      } else if (tile.kind === 'jaringan_ferry') {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(px, py, scale, scale);
      } else {
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(px, py, scale, scale);
      }

      if (tile.debris && tile.debris.startsWith('gem_')) {
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(px + 1, py + 1, scale - 2, scale - 2);
      }
    }
  }

  if (trees) {
    trees.forEach((tr) => {
      if (tr.hp <= 0) return;
      ctx.fillStyle = '#166534';
      ctx.fillRect(tr.x * scale + 1, tr.y * scale + 1, scale - 2, scale - 2);
    });
  }

  if (isVolcanicAsh) {
    ctx.fillStyle = 'rgba(15, 15, 20, 0.35)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

const DATA_URL_CACHE = new Map<string, string>();

export function getPixelCropDataUrl(cropId: CropId): string {
  const key = `crop_${cropId}`;
  const existing = DATA_URL_CACHE.get(key);
  if (existing) return existing;
  const url = getStardewPixelAtlas().crops[cropId][3].toDataURL('image/png');
  DATA_URL_CACHE.set(key, url);
  return url;
}

export function getPixelToolDataUrl(toolId: StardewToolId, level = 1): string {
  const safeLv = Math.max(1, Math.min(4, Math.floor(level)));
  const upgradeable: UpgradeableToolId[] = ['hoe', 'water', 'axe', 'pick', 'sword', 'rod'];
  const isUp = (upgradeable as string[]).includes(toolId);
  const key = isUp ? `tool_${toolId}_lv${safeLv}` : `tool_${toolId}`;
  const existing = DATA_URL_CACHE.get(key);
  if (existing) return existing;
  const atlas = getStardewPixelAtlas();
  const canvas = isUp
    ? atlas.toolsByLevel[toolId as UpgradeableToolId][safeLv - 1]
    : atlas.tools[toolId];
  const url = canvas.toDataURL('image/png');
  DATA_URL_CACHE.set(key, url);
  return url;
}

export function getPixelBagItemDataUrl(itemId: BagItemId): string {
  const aiUrl = AI_BAG_DATA_URLS.get(itemId);
  if (aiUrl) return aiUrl;
  const key = `bag_${itemId}`;
  const existing = DATA_URL_CACHE.get(key);
  if (existing) return existing;
  const url = getStardewPixelAtlas().bagItems[itemId].toDataURL('image/png');
  DATA_URL_CACHE.set(key, url);
  return url;
}

export function getPixelGoldSprinklerDataUrl(): string {
  const key = 'gold_sprinkler';
  const existing = DATA_URL_CACHE.get(key);
  if (existing) return existing;
  const url = getStardewPixelAtlas().goldSprinkler.toDataURL('image/png');
  DATA_URL_CACHE.set(key, url);
  return url;
}
