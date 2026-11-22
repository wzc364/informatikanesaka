/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import farmerSpriteUrl from '../assets/images/berkebun_farmer_pixel_1795346951033.jpg';
import farmhouseSpriteUrl from '../assets/images/berkebun_farmhouse_pixel_1795346951463.jpg';
import shopSpriteUrl from '../assets/images/berkebun_shop_pixel_1795346951275.jpg';
import binSpriteUrl from '../assets/images/berkebun_bin_pixel_1795346952182.jpg';
import treeSpriteUrl from '../assets/images/berkebun_tree_pixel_1795346951395.jpg';
import npcSheetUrl from '../assets/images/berkebun_npc_sheet_1795348518239.jpg';
import palmTreeUrl from '../assets/images/berkebun_palm_tree_pixel_1795348518032.jpg';
import coopSpriteUrl from '../assets/images/berkebun_coop_pixel_1795348518625.jpg';
import sacredTreeUrl from '../assets/images/berkebun_sacred_tree_pixel_1795348518161.jpg';
import lighthouseUrl from '../assets/images/berkebun_lighthouse_pixel_1795348518004.jpg';
import {
  WORLD_COLS,
  WORLD_ROWS,
  type BagItemId,
  type CropId,
  type FarmTile,
  type FurnitureKind,
  type NpcId,
  type Season,
} from './berkebunWorldData';

export type StardewToolId =
  | 'hoe'
  | 'water'
  | 'pick'
  | 'harvest'
  | 'seed'
  | 'fertilizer'
  | 'sprinkler'
  | 'rod';

export interface StardewSprites {
  farmer: HTMLCanvasElement | null;
  farmhouse: HTMLCanvasElement | null;
  shop: HTMLCanvasElement | null;
  bin: HTMLCanvasElement | null;
  tree: HTMLCanvasElement | null;
  palmTree: HTMLCanvasElement | null;
  coop: HTMLCanvasElement | null;
  sacredTree: HTMLCanvasElement | null;
  lighthouse: HTMLCanvasElement | null;
  npcs: Record<NpcId, HTMLCanvasElement | null>;
  npcPortraits: Record<NpcId, string>;
}

const PROCESSED_CACHE = new Map<string, HTMLCanvasElement>();
const PROMISE_CACHE = new Map<string, Promise<HTMLCanvasElement | null>>();

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
    return minC > 234 && maxC - minC < 20;
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

let NPC_CACHE: {
  npcs: Record<NpcId, HTMLCanvasElement | null>;
  npcPortraits: Record<NpcId, string>;
} | null = null;

async function loadSlicedNpcs() {
  if (NPC_CACHE) return NPC_CACHE;

  const defaultResult = {
    npcs: {
      raka: null,
      sari: null,
      jaka: null,
      maya: null,
      bima: null,
      lira: null,
    } as Record<NpcId, HTMLCanvasElement | null>,
    npcPortraits: {
      raka: '',
      sari: '',
      jaka: '',
      maya: '',
      bima: '',
      lira: '',
    } as Record<NpcId, string>,
  };

  const sheet = await loadImageElement(npcSheetUrl);
  if (!sheet) return defaultResult;

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
      // Portrait snapshot zoomed cleanly toward head + shoulders inside a warm square
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
        defaultResult.npcPortraits[item.id] = pCanvas.toDataURL('image/png');
      }
    }
  }

  NPC_CACHE = defaultResult;
  return defaultResult;
}

export async function loadAllStardewSprites(): Promise<StardewSprites> {
  const [farmer, farmhouse, shop, bin, tree, palmTree, coop, sacredTree, lighthouse, npcPack] =
    await Promise.all([
      loadTransparentSprite(farmerSpriteUrl, 128),
      loadTransparentSprite(farmhouseSpriteUrl, 240),
      loadTransparentSprite(shopSpriteUrl, 240),
      loadTransparentSprite(binSpriteUrl, 120),
      loadTransparentSprite(treeSpriteUrl, 200),
      loadTransparentSprite(palmTreeUrl, 200),
      loadTransparentSprite(coopSpriteUrl, 220),
      loadTransparentSprite(sacredTreeUrl, 280),
      loadTransparentSprite(lighthouseUrl, 260),
      loadSlicedNpcs(),
    ]);

  return {
    farmer,
    farmhouse,
    shop,
    bin,
    tree,
    palmTree,
    coop,
    sacredTree,
    lighthouse,
    npcs: npcPack.npcs,
    npcPortraits: npcPack.npcPortraits,
  };
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

  // 5. Tools (8 slots)
  const tools: Record<StardewToolId, HTMLCanvasElement> = {
    hoe: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '........oooooo..',
          '.......oSSSSSSo.',
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
        { o: '#261409', S: '#cbd5e1', D: '#64748b', W: '#c07a3e', B: '#78350f' },
        1,
        2
      );
    }),
    water: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '....oooooo......',
          '...oSSSSSSo.....',
          '..oSoooooSSo....',
          '..oSoBBBBBoSo...',
          '.oSSoBBWBBooSSo.',
          '.oBBoBBBBBoBBo..',
          '..ooBBBBBBBo....',
          '....oBBBBBo.....',
          '....oDDDDDo.....',
          '.....ooooo......',
        ],
        { o: '#16283d', S: '#93c5fd', B: '#38bdf8', W: '#e0f2fe', D: '#0284c7' },
        0,
        3
      );
    }),
    pick: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '....oooooooo....',
          '..ooSSSSSSSSoo..',
          '.oSSDDWWWWDDSSo.',
          '..oo..oWWo..oo..',
          '......oWWo......',
          '......oWWo......',
          '......oWWo......',
          '......oWWo......',
          '......oWWo......',
          '......oBBo......',
          '.......oo.......',
        ],
        { o: '#261409', S: '#cbd5e1', D: '#64748b', W: '#c07a3e', B: '#78350f' },
        0,
        2
      );
    }),
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
    rod: makePixelCanvas(16, 16, (px) => {
      drawMatrix(
        px,
        [
          '...........ooo..',
          '..........oWWo..',
          '.........oWWo.L.',
          '........oWWo..L.',
          '.......oWWo...L.',
          '......oWWo...oBo',
          '.....oWWo....oDo',
          '....oWWo......o.',
          '...oWBo.........',
          '..oBBo..........',
          '..ooo...........',
        ],
        { o: '#291408', W: '#c07a3e', B: '#78350f', L: '#e2e8f0', D: '#38bdf8' },
        0,
        2
      );
    }),
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
    '..oooSSSSSSSSooo..',
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
    '..oooSSSSSSSSooo..',
    '....oSKSSSSKSo....',
    '....oSSSSSSSSo....',
    '...ooRRRRRRRRoo...',
    '..oSSoRBBBBBRo....',
    '..ooooBGBBBGBoSSo.',
    '.....oBBBBBBBoSSo.',
    '.....oBBBBBBBoSSo.',
    '.....oBBooBBBoooo.',
    '.....oWWo.oBBo....',
    '.....oooo.oWWo....',
    '..........oooo....',
  ],
  down_walk2: [
    '.....oooooooo.....',
    '....oYYYYYYYYo....',
    '..ooHHHHHHHHHHoo..',
    '.oYYYYYYYYYYYYYYo.',
    '..oooSSSSSSSSooo..',
    '....oSKSSSSKSo....',
    '....oSSSSSSSSo....',
    '...ooRRRRRRRRoo...',
    '....oRBBBBBRoSSo..',
    '..oSSoBGBBBGBoooo.',
    '..oSSoBBBBBBBo....',
    '..oSSoBBBBBBBo....',
    '..ooooBBooBBBo....',
    '.....oBBo.oWWo....',
    '.....oWWo.oooo....',
    '.....oooo.........',
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

// ---------- Detailed Pixel-Art World Map Renderer for Pulau TIK ----------

export function renderPixelWorldMapCanvas(
  canvas: HTMLCanvasElement,
  tiles: FarmTile[],
  season: Season,
  storyChapter: number,
  islandHealed: boolean
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;

  const scale = 10; // 54*10 = 540 x 38*10 = 380 crisp pixels!
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
          ctx.fillRect(px + 2, py + 4, 4, 2);
        }
      } else if (tile.kind === 'river' || tile.kind === 'pond') {
        ctx.fillStyle = '#328bc4';
        ctx.fillRect(px, py, scale, scale);
        ctx.fillStyle = '#7dd3fc';
        ctx.fillRect(px + 2, py + 3, 5, 2);
      } else if (tile.kind === 'sand') {
        ctx.fillStyle = '#edd08f';
        ctx.fillRect(px, py, scale, scale);
        if ((x + y) % 3 === 0) {
          ctx.fillStyle = '#d7ad62';
          ctx.fillRect(px + 2, py + 6, 3, 2);
        }
      } else if (tile.kind === 'forest_floor') {
        ctx.fillStyle = '#3c732b';
        ctx.fillRect(px, py, scale, scale);
        if ((x * 3 + y * 5) % 4 === 0) {
          ctx.fillStyle = '#245218';
          ctx.fillRect(px + 1, py + 1, 7, 7);
          ctx.fillStyle = '#4f9438';
          ctx.fillRect(px + 2, py + 2, 4, 4);
        }
      } else if (tile.kind === 'plaza' || tile.kind === 'cliff_pass') {
        ctx.fillStyle = x >= 35 ? '#78716c' : '#a8a29e';
        ctx.fillRect(px, py, scale, scale);
        ctx.fillStyle = x >= 35 ? '#57534e' : '#d6d3d1';
        ctx.fillRect(px + 1, py + 1, scale - 2, scale - 2);
        if (tile.kind === 'cliff_pass' && storyChapter < 3) {
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(px + 1, py + 1, scale - 2, scale - 2);
        }
      } else if (tile.kind === 'path') {
        ctx.fillStyle = '#dfb577';
        ctx.fillRect(px, py, scale, scale);
        ctx.fillStyle = '#c79554';
        ctx.fillRect(px + 2, py + 2, 3, 3);
      } else if (tile.kind === 'bridge' || tile.kind === 'pier') {
        const broken = tile.kind === 'bridge' && y >= 25 && storyChapter < 2;
        ctx.fillStyle = broken ? '#dc2626' : '#9a5223';
        ctx.fillRect(px, py, scale, scale);
        ctx.fillStyle = broken ? '#fef08a' : '#dfb577';
        ctx.fillRect(px + 1, py + 2, scale - 2, scale - 4);
      } else {
        ctx.fillStyle = tile.tilled ? '#7c3f16' : pal.base;
        ctx.fillRect(px, py, scale, scale);
        if (!tile.tilled && (x * 7 + y * 11) % 6 === 0) {
          ctx.fillStyle = pal.flowerA;
          ctx.fillRect(px + 3, py + 3, 2, 2);
        }
        if (tile.crop) {
          ctx.fillStyle = tile.crop.ready ? '#fde047' : '#4ade80';
          ctx.fillRect(px + 2, py + 2, 5, 5);
        }
      }

      // Tiny mining ore / forage sparkle dots on map
      if (tile.debris === 'ore_star') {
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(px + 3, py + 3, 4, 4);
      } else if (tile.debris === 'ore_silver') {
        ctx.fillStyle = '#7dd3fc';
        ctx.fillRect(px + 3, py + 3, 4, 4);
      } else if (tile.debris === 'ore_copper') {
        ctx.fillStyle = '#fb923c';
        ctx.fillRect(px + 3, py + 3, 4, 4);
      }
    }
  }

  // Pixel-art miniature building blocks on the map!
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
    ctx.fillRect(rx + 2, ry + 2, rw - 4, rh - 6);
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(rx + Math.floor(rw / 2) - 3, ry + rh - 5, 6, 5);
  };

  drawMiniRoof(6, 13, 3, 3, '#b91c1c', '#f59e0b'); // Rumah Kebun
  drawMiniRoof(13, 13, 3, 3, '#d97706', '#fef08a'); // Kandang Ayam
  drawMiniRoof(25, 13, 3, 3, '#ec4899', '#f8fafc'); // Toko Benih
  drawMiniRoof(31, 13, 3, 3, '#4f46e5', '#facc15'); // Balai Tetua
  drawMiniRoof(7, 7, 3, 3, '#9333ea', '#e9d5ff'); // Pondok Maya
  drawMiniRoof(14, 4, 3, 3, '#c2410c', '#fed7aa'); // Bengkel Jaka
  drawMiniRoof(38, 4, 3, 3, '#b45309', '#fef3c7'); // Kincir Angin
  drawMiniRoof(42, 29, 3, 3, '#0284c7', '#f8fafc'); // Mercusuar
  drawMiniRoof(31, 34, 4, 3, '#78350f', '#fffbeb'); // Kapal Bima

  // Sacred Pohon Cahaya Abadi + 4 Mustika Gems
  ctx.fillStyle = islandHealed ? '#f472b6' : '#ec4899';
  ctx.fillRect(26 * scale - 2, 4 * scale - 2, 3 * scale + 4, 3 * scale + 4);
  ctx.fillStyle = '#fbcfe8';
  ctx.fillRect(26 * scale + 4, 4 * scale + 4, 3 * scale - 8, 3 * scale - 8);
  const gemCoords = [
    { x: 24, y: 8, lit: storyChapter >= 2, c: '#84cc16' },
    { x: 25, y: 9, lit: storyChapter >= 3, c: '#38bdf8' },
    { x: 29, y: 9, lit: storyChapter >= 4, c: '#a855f7' },
    { x: 30, y: 8, lit: storyChapter >= 5, c: '#facc15' },
  ];
  gemCoords.forEach((g) => {
    ctx.fillStyle = g.lit || islandHealed ? g.c : '#475569';
    ctx.fillRect(g.x * scale + 2, g.y * scale + 2, 6, 6);
  });

  // Pixel-art Compass Rose in Top-Left Ocean Corner
  const cx = 28;
  const cy = 28;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
  ctx.fillRect(cx - 18, cy - 18, 36, 36);
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - 18, cy - 18, 36, 36);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(cx - 1, cy - 12, 2, 24);
  ctx.fillRect(cx - 12, cy - 1, 24, 2);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(cx - 2, cy - 14, 4, 8);
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('U', cx, cy - 18 + 9);
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

export function getPixelToolDataUrl(toolId: StardewToolId): string {
  const key = `tool_${toolId}`;
  const existing = DATA_URL_CACHE.get(key);
  if (existing) return existing;
  const url = getStardewPixelAtlas().tools[toolId].toDataURL('image/png');
  DATA_URL_CACHE.set(key, url);
  return url;
}

export function getPixelBagItemDataUrl(itemId: BagItemId): string {
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
