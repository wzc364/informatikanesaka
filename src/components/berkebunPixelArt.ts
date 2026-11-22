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
import type { BagItemId, CropId, NpcId, Season } from './berkebunWorldData';

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
  };

  return CACHED_ATLAS;
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
