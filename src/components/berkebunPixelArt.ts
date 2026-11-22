/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import farmerSpriteUrl from '../assets/images/berkebun_farmer_pixel_1795346951033.jpg';
import farmhouseSpriteUrl from '../assets/images/berkebun_farmhouse_pixel_1795346951463.jpg';
import shopSpriteUrl from '../assets/images/berkebun_shop_pixel_1795346951275.jpg';
import binSpriteUrl from '../assets/images/berkebun_bin_pixel_1795346952182.jpg';
import treeSpriteUrl from '../assets/images/berkebun_tree_pixel_1795346951395.jpg';

export type StardewSeason = 'Semi' | 'Panas' | 'Gugur' | 'Dingin';
export type StardewCropId = 'turnip' | 'potato' | 'strawberry' | 'corn' | 'sunflower' | 'pumpkin';
export type StardewToolId = 'hoe' | 'water' | 'pick' | 'harvest' | 'seed' | 'fertilizer' | 'sprinkler';

export interface StardewSprites {
  farmer: HTMLCanvasElement | null;
  farmhouse: HTMLCanvasElement | null;
  shop: HTMLCanvasElement | null;
  bin: HTMLCanvasElement | null;
  tree: HTMLCanvasElement | null;
}

const PROCESSED_CACHE = new Map<string, HTMLCanvasElement>();
const PROMISE_CACHE = new Map<string, Promise<HTMLCanvasElement | null>>();

function loadTransparentSprite(src: string, maxDim = 260): Promise<HTMLCanvasElement | null> {
  const key = `${src}@${maxDim}`;
  const cached = PROCESSED_CACHE.get(key);
  if (cached) return Promise.resolve(cached);
  const inflight = PROMISE_CACHE.get(key);
  if (inflight) return inflight;

  const promise = new Promise<HTMLCanvasElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';

    const process = async () => {
      try {
        if (typeof img.decode === 'function') {
          await img.decode().catch(() => {});
        }
        const natW = img.naturalWidth || 256;
        const natH = img.naturalHeight || 256;
        const scale = Math.max(natW, natH) > maxDim ? maxDim / Math.max(natW, natH) : 1;
        const w = Math.max(1, Math.round(natW * scale));
        const h = Math.max(1, Math.round(natH * scale));

        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        const total = w * h;
        const visited = new Uint8Array(total);
        const queue = new Int32Array(total);
        let head = 0;
        let tail = 0;

        // Pure solid white exterior check (preserves light grey chimney smoke!)
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

        // Feather 1px bright fringe bordering background
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
              if (
                visited[idx - 1] ||
                visited[idx + 1] ||
                visited[idx - w] ||
                visited[idx + w]
              ) {
                data[p + 3] = Math.round(data[p + 3] * 0.25);
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);

        // Trim transparent edges
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

        let finalCanvas = c;
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
            finalCanvas = trimmed;
          }
        }

        PROCESSED_CACHE.set(key, finalCanvas);
        resolve(finalCanvas);
      } catch {
        resolve(null);
      }
    };

    img.onload = () => void process();
    img.onerror = () => resolve(null);
    img.src = src;
    if (img.complete && img.naturalWidth > 0) {
      void process();
    }
  });

  PROMISE_CACHE.set(key, promise);
  return promise;
}

export async function loadAllStardewSprites(): Promise<StardewSprites> {
  const [farmer, farmhouse, shop, bin, tree] = await Promise.all([
    loadTransparentSprite(farmerSpriteUrl, 128),
    loadTransparentSprite(farmhouseSpriteUrl, 240),
    loadTransparentSprite(shopSpriteUrl, 240),
    loadTransparentSprite(binSpriteUrl, 120),
    loadTransparentSprite(treeSpriteUrl, 200),
  ]);
  return { farmer, farmhouse, shop, bin, tree };
}

// ---------- 16x16 / 16x20 Crisp Pixel-Art Generator ----------

function makePixelCanvas(w: number, h: number, drawFn: (px: (x: number, y: number, color: string, pw?: number, ph?: number) => void) => void): HTMLCanvasElement {
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

const SEASON_PALETTES: Record<
  StardewSeason,
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
  grass: Record<StardewSeason, HTMLCanvasElement[]>;
  path: HTMLCanvasElement[];
  pondWater: HTMLCanvasElement;
  stone: HTMLCanvasElement;
  wood: HTMLCanvasElement;
  weed: HTMLCanvasElement;
  sprinkler: HTMLCanvasElement;
  scarecrow: HTMLCanvasElement;
  crops: Record<StardewCropId, HTMLCanvasElement[]>; // [seeds, sprout, mid, ripe]
  tools: Record<StardewToolId, HTMLCanvasElement>;
}

let CACHED_ATLAS: PixelAtlas | null = null;

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

export function getStardewPixelAtlas(): PixelAtlas {
  if (CACHED_ATLAS) return CACHED_ATLAS;

  // 1. Seasonal Grass Variants (4 deterministic variants per season)
  const grass: Record<StardewSeason, HTMLCanvasElement[]> = {
    Semi: [],
    Panas: [],
    Gugur: [],
    Dingin: [],
  };

  (Object.keys(SEASON_PALETTES) as StardewSeason[]).forEach((season) => {
    const pal = SEASON_PALETTES[season];
    for (let v = 0; v < 4; v++) {
      grass[season].push(
        makePixelCanvas(16, 16, (px) => {
          px(0, 0, pal.base, 16, 16);
          // Soft mottled Stardew pixel dither patches
          for (let y = 0; y < 16; y += 2) {
            for (let x = 0; x < 16; x += 2) {
              const h = (x * 13 + y * 29 + v * 7) % 11;
              if (h === 0 || h === 5) px(x, y, pal.alt, 2, 1);
              else if (h === 2) px(x + 1, y, pal.light, 1, 1);
            }
          }
          // Grass blades
          if (v === 0 || v === 2) {
            px(3, 5, pal.dark);
            px(4, 4, pal.light);
            px(5, 5, pal.dark);
            px(11, 11, pal.dark);
            px(12, 10, pal.light);
            px(13, 11, pal.dark);
          }
          if (v === 1) {
            px(9, 4, pal.dark);
            px(10, 3, pal.light);
            px(11, 4, pal.dark);
            px(2, 12, pal.dark);
            px(3, 11, pal.light);
          }
          // Occasional tiny wildflowers / autumn leaves / snowflakes
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

  // 2. Cobble / Sandy Dirt Path (2 variants)
  const path = [0, 1].map((v) =>
    makePixelCanvas(16, 16, (px) => {
      px(0, 0, '#dfb577', 16, 16);
      // Warm sandy texture speckles
      px(2, 2, '#cfa060', 3, 2);
      px(10, 4, '#ebd09a', 3, 2);
      px(5, 9, '#c79554', 4, 3);
      px(11, 12, '#cfa060', 3, 2);
      px(1, 13, '#ebd09a', 2, 2);
      // Stepping pebble highlights
      if (v === 0) {
        px(3, 4, '#b88346', 2, 1);
        px(4, 3, '#f3dfb3', 2, 1);
        px(10, 9, '#b88346', 3, 2);
        px(10, 9, '#e7c589', 2, 1);
      } else {
        px(7, 3, '#b88346', 3, 2);
        px(7, 3, '#f3dfb3', 2, 1);
        px(2, 10, '#b88346', 2, 2);
        px(12, 6, '#e7c589', 2, 1);
      }
    })
  );

  // 3. Water Tile Base
  const pondWater = makePixelCanvas(16, 16, (px) => {
    px(0, 0, '#328bc4', 16, 16);
    px(1, 2, '#3d9ad4', 4, 1);
    px(9, 6, '#48a8e3', 5, 1);
    px(3, 11, '#2b7bb0', 6, 1);
    px(11, 13, '#3d9ad4', 3, 1);
  });

  // 4. Stardew Debris (Stone, Hardwood Log, Weed) & Sprinkler & Scarecrow
  const stone = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '................',
        '................',
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
        '................',
      ],
      { o: '#1f2937', L: '#cbd5e1', M: '#94a3b8', D: '#475569' },
      0,
      2
    );
  });

  const wood = makePixelCanvas(16, 16, (px) => {
    drawMatrix(
      px,
      [
        '................',
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
      {
        o: '#291408',
        Y: '#eab308',
        T: '#d99b52',
        R: '#c9382c',
        B: '#2563eb',
        W: '#7c451c',
      },
      0,
      1
    );
  });

  // 5. Shared Early Crop Stages (Seeds & Sprout)
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

  // 6. Ripe Pixel-Art Crops (16x16 or 16x20 for tall stalks)
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
      {
        o: '#22120b',
        L: '#93e950',
        G: '#44a423',
        P: '#c084fc',
        W: '#f8fafc',
      },
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
      {
        o: '#241409',
        L: '#90e34c',
        G: '#43a022',
        D: '#256c12',
        B: '#c9883b',
      },
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
      {
        o: '#1a2e08',
        L: '#8be04b',
        G: '#37941d',
        R: '#ef4444',
        Y: '#fde047',
      },
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
      {
        o: '#1c2b07',
        L: '#9be853',
        G: '#47a624',
        D: '#246c12',
        Y: '#fde047',
        O: '#eab308',
      },
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
      {
        o: '#291306',
        G: '#45a824',
        D: '#c2410c',
        O: '#f97316',
        L: '#fdba74',
        R: '#ea580c',
      },
      0,
      3
    );
  });

  const crops: Record<StardewCropId, HTMLCanvasElement[]> = {
    turnip: [stageSeeds, stageSprout, midBush, turnipRipe],
    potato: [stageSeeds, stageSprout, midBush, potatoRipe],
    strawberry: [stageSeeds, stageSprout, midBush, strawberryRipe],
    corn: [stageSeeds, stageSprout, midTall, cornRipe],
    sunflower: [stageSeeds, stageSprout, midTall, sunflowerRipe],
    pumpkin: [stageSeeds, stageSprout, midBush, pumpkinRipe],
  };

  // 7. Pixel-Art Tool Icons (16x16)
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
  };

  CACHED_ATLAS = {
    grass,
    path,
    pondWater,
    stone,
    wood,
    weed,
    sprinkler,
    scarecrow,
    crops,
    tools,
  };

  return CACHED_ATLAS;
}

const DATA_URL_CACHE = new Map<string, string>();

export function getPixelCropDataUrl(cropId: StardewCropId): string {
  const key = `crop_${cropId}`;
  const existing = DATA_URL_CACHE.get(key);
  if (existing) return existing;
  const atlas = getStardewPixelAtlas();
  const canvas = atlas.crops[cropId][3];
  const url = canvas.toDataURL('image/png');
  DATA_URL_CACHE.set(key, url);
  return url;
}

export function getPixelToolDataUrl(toolId: StardewToolId): string {
  const key = `tool_${toolId}`;
  const existing = DATA_URL_CACHE.get(key);
  if (existing) return existing;
  const atlas = getStardewPixelAtlas();
  const canvas = atlas.tools[toolId];
  const url = canvas.toDataURL('image/png');
  DATA_URL_CACHE.set(key, url);
  return url;
}
