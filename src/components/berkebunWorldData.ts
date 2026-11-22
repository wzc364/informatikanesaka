/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const WORLD_COLS = 78;
export const WORLD_ROWS = 52;
export const TILE_SIZE = 48; // 16px logical pixel tiles at 3x scale

export const VIEW_COLS = 16;
export const VIEW_ROWS = 11;
export const VIEW_W = VIEW_COLS * TILE_SIZE; // 768
export const VIEW_H = VIEW_ROWS * TILE_SIZE; // 528

export type Season = 'Semi' | 'Panas' | 'Gugur' | 'Dingin';
export type Weather = 'Cerah' | 'Hujan';

export type CropId =
  | 'turnip'
  | 'potato'
  | 'strawberry'
  | 'corn'
  | 'sunflower'
  | 'pumpkin'
  | 'pineapple'
  | 'coffee'
  | 'moonfruit';

export type BagItemId =
  | 'fish_carp'
  | 'fish_snapper'
  | 'fish_lobster'
  | 'fish_goldkoi'
  | 'forage_mushroom'
  | 'forage_berry'
  | 'forage_shell'
  | 'ore_copper'
  | 'ore_silver'
  | 'ore_star'
  | 'egg_normal'
  | 'egg_gold'
  | 'wood_res'
  | 'stone_res'
  | 'slime_gel'
  | 'bat_wing'
  | 'monster_core'
  | 'artisan_jam'
  | 'artisan_coffee'
  | 'artisan_tonic'
  | 'hp_potion'
  | 'mine_bomb'
  | 'torch_item'
  | 'home_totem'
  | 'fish_bait';

export type NpcId =
  | 'raka'
  | 'sari'
  | 'jaka'
  | 'maya'
  | 'bima'
  | 'lira'
  | 'kiran'
  | 'tara'
  | 'dewi'
  | 'bagas';

export type InteriorId =
  | 'house'
  | 'shop'
  | 'elder_hall'
  | 'maya_hut'
  | 'jaka_cabin'
  | 'lighthouse'
  | 'coop'
  | 'forge'
  | 'dewi_hut'
  | 'explorer_post';

export type UpgradeableToolId = 'hoe' | 'water' | 'axe' | 'pick' | 'sword' | 'rod';

export type FurnitureKind =
  | 'bed'
  | 'fireplace'
  | 'bookshelf'
  | 'tv'
  | 'table_food'
  | 'rug'
  | 'plant'
  | 'chest'
  | 'counter'
  | 'seed_rack'
  | 'crate'
  | 'map_table'
  | 'elder_throne'
  | 'altar_lamp'
  | 'cauldron'
  | 'potion_shelf'
  | 'herb_table'
  | 'carpenter_bench'
  | 'anvil'
  | 'wood_stack'
  | 'tool_rack'
  | 'nav_table'
  | 'telescope'
  | 'beacon_lamp'
  | 'nest_box'
  | 'feed_trough'
  | 'hay_bale';

export interface FurnitureItem {
  id: string;
  kind: FurnitureKind;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  walkable?: boolean;
  interactAction?:
    | 'sleep'
    | 'shop'
    | 'craft'
    | 'upgrade'
    | 'journal'
    | 'map'
    | 'telescope'
    | 'eggs'
    | 'feed_coop'
    | 'hay_rest'
    | 'chest'
    | 'eat_table'
    | 'warm_fire'
    | 'tv_weather'
    | 'water_plant'
    | 'wood_pile'
    | 'blessing'
    | 'beacon'
    | 'info';
  infoText?: string;
}

export interface InteriorDef {
  id: InteriorId;
  title: string;
  themeLabel: string;
  cols: number;
  rows: number;
  floorStyle: 'wood' | 'stone' | 'cobble' | 'straw' | 'mystic';
  wallColor: string;
  wallAccent: string;
  exitTile: { x: number; y: number };
  outdoorExit: { x: number; y: number };
  residentNpc?: NpcId;
  residentPos?: { x: number; y: number };
  furniture: FurnitureItem[];
}

export type TileKind =
  | 'grass'
  | 'forest_floor'
  | 'plaza'
  | 'path'
  | 'sand'
  | 'river'
  | 'ocean'
  | 'pond'
  | 'bridge'
  | 'pier'
  | 'cliff_pass'
  | 'house'
  | 'coop'
  | 'workbench'
  | 'shop'
  | 'bin'
  | 'elder_hall'
  | 'jaka_cabin'
  | 'maya_hut'
  | 'lighthouse'
  | 'forge'
  | 'dewi_hut'
  | 'explorer_post'
  | 'mine_entrance'
  | 'ship'
  | 'altar'
  | 'sacred_tree'
  | 'windmill'
  | 'well';

export type DebrisKind =
  | 'stone'
  | 'wood'
  | 'weed'
  | 'ore_copper'
  | 'ore_silver'
  | 'ore_star'
  | 'forage_mushroom'
  | 'forage_berry'
  | 'forage_shell'
  | null;

export interface FarmTile {
  x: number;
  y: number;
  kind: TileKind;
  tilled: boolean;
  watered: boolean;
  fertilized: boolean;
  hasSprinkler: boolean;
  hasGoldSprinkler?: boolean;
  debris: DebrisKind;
  crop: {
    id: CropId;
    age: number;
    ready: boolean;
  } | null;
}

export interface WorldTree {
  id: string;
  kind: 'oak' | 'palm';
  x: number; // grid tile col (integer)
  y: number; // grid tile row (integer)
  hp: number; // 3 = standing, 0 = stump
  maxHp: number;
  stumpDaysLeft: number; // > 0 if completely chopped and regrowing
}

export interface UndergroundCell {
  x: number;
  y: number;
  kind: 'wall' | 'floor' | 'up_ladder' | 'down_ladder' | 'torch';
  rock: 'rock' | 'ore_copper' | 'ore_silver' | 'ore_star' | null;
}

export interface UndergroundMonster {
  id: number;
  kind: 'slime' | 'bat' | 'golem';
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  hitFlash: number;
  vx: number;
  vy: number;
}

export interface CropDef {
  id: CropId;
  name: string;
  seedCost: number;
  sellPrice: number;
  daysToGrow: number;
  regrowDays?: number;
  unlockChapter: number;
  desc: string;
}

export const CROPS: Record<CropId, CropDef> = {
  turnip: {
    id: 'turnip',
    name: 'Lobak Segar',
    seedCost: 20,
    sellPrice: 45,
    daysToGrow: 2,
    unlockChapter: 1,
    desc: 'Cepat panen dalam 2 hari. Cocok untuk modal awal kebun Pulau TIK.',
  },
  potato: {
    id: 'potato',
    name: 'Kentang Emas',
    seedCost: 40,
    sellPrice: 80,
    daysToGrow: 3,
    unlockChapter: 1,
    desc: 'Berpeluang menghasilkan 2 umbi kentang sekaligus saat dipanen.',
  },
  strawberry: {
    id: 'strawberry',
    name: 'Stroberi Manis',
    seedCost: 75,
    sellPrice: 120,
    daysToGrow: 4,
    regrowDays: 2,
    unlockChapter: 1,
    desc: 'Sekali tanam dapat dipanen berulang setiap 2 hari!',
  },
  corn: {
    id: 'corn',
    name: 'Jagung Manis',
    seedCost: 90,
    sellPrice: 95,
    daysToGrow: 4,
    regrowDays: 2,
    unlockChapter: 1,
    desc: 'Tumbuh tinggi menjulang dan berbuah kembali setiap 2 hari.',
  },
  sunflower: {
    id: 'sunflower',
    name: 'Bunga Matahari',
    seedCost: 60,
    sellPrice: 145,
    daysToGrow: 3,
    unlockChapter: 1,
    desc: 'Sering menjatuhkan benih tambahan saat dipanen.',
  },
  pumpkin: {
    id: 'pumpkin',
    name: 'Labu Raksasa',
    seedCost: 110,
    sellPrice: 270,
    daysToGrow: 5,
    unlockChapter: 1,
    desc: 'Komoditas kebun bernilai jual sangat tinggi!',
  },
  pineapple: {
    id: 'pineapple',
    name: 'Nanas Tropis',
    seedCost: 140,
    sellPrice: 320,
    daysToGrow: 4,
    regrowDays: 3,
    unlockChapter: 2,
    desc: 'Bibit khas pantai Pulau TIK. Terbuka mulai Bab 2!',
  },
  coffee: {
    id: 'coffee',
    name: 'Kopi Gunung',
    seedCost: 160,
    sellPrice: 185,
    daysToGrow: 4,
    regrowDays: 2,
    unlockChapter: 3,
    desc: 'Biji kopi harum dataran tinggi. Dapat disangrai jadi Kopi Spesial!',
  },
  moonfruit: {
    id: 'moonfruit',
    name: 'Buah Purnama',
    seedCost: 240,
    sellPrice: 560,
    daysToGrow: 5,
    unlockChapter: 5,
    desc: 'Buah legendaris berkilau dari Pohon Cahaya Pulau TIK.',
  },
};

export interface BagItemDef {
  id: BagItemId;
  name: string;
  sellPrice: number;
  energyRestore?: number;
  hpRestore?: number;
  usableEffect?: 'eat' | 'bomb' | 'torch' | 'totem' | 'bait';
  category: 'Ikan' | 'Hutan & Pantai' | 'Tambang' | 'Ternak' | 'Olahan' | 'Monster' | 'Perlengkapan MC';
  desc: string;
}

export const BAG_ITEMS: Record<BagItemId, BagItemDef> = {
  fish_carp: {
    id: 'fish_carp',
    name: 'Ikan Mas Sungai',
    sellPrice: 55,
    category: 'Ikan',
    desc: 'Ikan air tawar lincah dari kolam atau sungai lembah.',
  },
  fish_snapper: {
    id: 'fish_snapper',
    name: 'Kakap Biru Karang',
    sellPrice: 115,
    category: 'Ikan',
    desc: 'Ikan pesisir favorit Kapten Bima di Pelabuhan Pulau TIK.',
  },
  fish_lobster: {
    id: 'fish_lobster',
    name: 'Udang Karang Emas',
    sellPrice: 165,
    category: 'Ikan',
    desc: 'Hidangan laut langka yang bernilai tinggi.',
  },
  fish_goldkoi: {
    id: 'fish_goldkoi',
    name: 'Koi Cahaya Suci',
    sellPrice: 280,
    category: 'Ikan',
    desc: 'Ikan mistis bercahaya keemasan di sekitar air terjun & kepulauan luar.',
  },
  forage_mushroom: {
    id: 'forage_mushroom',
    name: 'Jamur Hutan Merah',
    sellPrice: 40,
    energyRestore: 22,
    hpRestore: 10,
    usableEffect: 'eat',
    category: 'Hutan & Pantai',
    desc: 'Tumbuh alami di Hutan Rimba. Bisa dimakan (+22 Energi, +10 HP).',
  },
  forage_berry: {
    id: 'forage_berry',
    name: 'Beri Liar Biru',
    sellPrice: 35,
    energyRestore: 18,
    hpRestore: 8,
    usableEffect: 'eat',
    category: 'Hutan & Pantai',
    desc: 'Buah hutan manis menyegarkan (+18 Energi, +8 HP).',
  },
  forage_shell: {
    id: 'forage_shell',
    name: 'Kerang Mutiara',
    sellPrice: 65,
    category: 'Hutan & Pantai',
    desc: 'Kerang berkilau di pasir pantai kepulauan Pulau TIK.',
  },
  ore_copper: {
    id: 'ore_copper',
    name: 'Bijih Tembaga',
    sellPrice: 45,
    category: 'Tambang',
    desc: 'Ditambang di Tebing & Gua Tambang. Bahan upgrade Lv.2 & Sprinkler!',
  },
  ore_silver: {
    id: 'ore_silver',
    name: 'Bijih Perak',
    sellPrice: 85,
    category: 'Tambang',
    desc: 'Logam murni berkilau untuk upgrade alat Lv.3 & Sprinkler Emas.',
  },
  ore_star: {
    id: 'ore_star',
    name: 'Kristal Bintang',
    sellPrice: 190,
    category: 'Tambang',
    desc: 'Kristal kuno untuk upgrade alat Lv.4 (Bintang) & Jimat Teleport!',
  },
  egg_normal: {
    id: 'egg_normal',
    name: 'Telur Ayam Segar',
    sellPrice: 60,
    energyRestore: 25,
    hpRestore: 12,
    usableEffect: 'eat',
    category: 'Ternak',
    desc: 'Telur segar dari Kandang Ayam setiap pagi (+25 E, +12 HP).',
  },
  egg_gold: {
    id: 'egg_gold',
    name: 'Telur Emas Berkah',
    sellPrice: 175,
    energyRestore: 60,
    hpRestore: 30,
    usableEffect: 'eat',
    category: 'Ternak',
    desc: 'Telur istimewa berkilau dari ayam yang diberi pakan jagung!',
  },
  wood_res: {
    id: 'wood_res',
    name: 'Kayu Keras',
    sellPrice: 12,
    category: 'Tambang',
    desc: 'Didapat dari menebang pohon dengan Kapak [3] atau memungut dahan.',
  },
  stone_res: {
    id: 'stone_res',
    name: 'Batu Granit',
    sellPrice: 14,
    category: 'Tambang',
    desc: 'Didapat dari memecah batu dengan Beliung [4] di kebun dan gua.',
  },
  slime_gel: {
    id: 'slime_gel',
    name: 'Lendir Slime Hijau',
    sellPrice: 38,
    category: 'Monster',
    desc: 'Drop dari Slime Gua! Bahan Bom Tambang, Obor & Umpan Ikan.',
  },
  bat_wing: {
    id: 'bat_wing',
    name: 'Sayap Kelelawar Gua',
    sellPrice: 58,
    category: 'Monster',
    desc: 'Drop dari Kelelawar Bayangan! Bahan Ramuan Penyembuh & Jamu.',
  },
  monster_core: {
    id: 'monster_core',
    name: 'Inti Kristal Monster',
    sellPrice: 160,
    category: 'Monster',
    desc: 'Drop langka Golem Kristal! Bahan Jimat Pulang & Bom Tambang.',
  },
  artisan_jam: {
    id: 'artisan_jam',
    name: 'Selai Stroberi Emas',
    sellPrice: 310,
    energyRestore: 45,
    hpRestore: 25,
    usableEffect: 'eat',
    category: 'Olahan',
    desc: 'Olahan kebun bernilai tinggi! +45 Energi & +25 HP atau jual 310G.',
  },
  artisan_coffee: {
    id: 'artisan_coffee',
    name: 'Kopi Sangrai Nusantara',
    sellPrice: 420,
    energyRestore: 55,
    hpRestore: 15,
    usableEffect: 'eat',
    category: 'Olahan',
    desc: 'Memulihkan +55 Energi & beri Efek Lari Cepat selama 45 detik!',
  },
  artisan_tonic: {
    id: 'artisan_tonic',
    name: 'Jamu Cahaya Herbal',
    sellPrice: 180,
    energyRestore: 90,
    hpRestore: 45,
    usableEffect: 'eat',
    category: 'Olahan',
    desc: 'Ramuan Nenek Maya memulihkan +90 Energi & +45 HP seketika!',
  },
  hp_potion: {
    id: 'hp_potion',
    name: 'Ramuan Kesehatan Merah',
    sellPrice: 110,
    energyRestore: 30,
    hpRestore: 75,
    usableEffect: 'eat',
    category: 'Perlengkapan MC',
    desc: 'Gunakan di Gua Tambang untuk memulihkan +75 HP & +30 Energi seketika!',
  },
  mine_bomb: {
    id: 'mine_bomb',
    name: 'Bom Mini Tambang',
    sellPrice: 95,
    usableEffect: 'bomb',
    category: 'Perlengkapan MC',
    desc: 'Meledakkan batu, bijih, dan melukai monster di radius 3×3 seketika!',
  },
  torch_item: {
    id: 'torch_item',
    name: 'Obor Lentera Terang',
    sellPrice: 45,
    usableEffect: 'torch',
    category: 'Perlengkapan MC',
    desc: 'Menyalakan cahaya terang benderang di Gua Bawah Tanah & Malam selama 90 detik!',
  },
  home_totem: {
    id: 'home_totem',
    name: 'Jimat Pulang Kilat',
    sellPrice: 220,
    usableEffect: 'totem',
    category: 'Perlengkapan MC',
    desc: 'Teleportasi karakter utama langsung kembali ke halaman Rumah Kebun dari mana saja!',
  },
  fish_bait: {
    id: 'fish_bait',
    name: 'Umpan Ikan Harum',
    sellPrice: 40,
    usableEffect: 'bait',
    category: 'Perlengkapan MC',
    desc: 'Mempercepat ikan menggigit kail & meningkatkan peluang ikan langka selama 2 menit!',
  },
};

export interface CraftRecipe {
  id: string;
  title: string;
  desc: string;
  ingredients: Array<{ kind: 'bag' | 'crop'; id: string; label: string; qty: number }>;
  resultType: 'sprinkler' | 'gold_sprinkler' | 'fertilizer' | 'bag';
  resultBagId?: BagItemId;
  resultQty: number;
}

export const CRAFT_RECIPES: CraftRecipe[] = [
  {
    id: 'craft_hp_potion',
    title: 'Ramuan Kesehatan Merah (x2)',
    desc: 'Pulihkan +75 HP & +30 Energi saat bertarung di Gua Bawah Tanah.',
    ingredients: [
      { kind: 'bag', id: 'forage_berry', label: 'Beri Liar Biru', qty: 1 },
      { kind: 'bag', id: 'bat_wing', label: 'Sayap Kelelawar', qty: 1 },
    ],
    resultType: 'bag',
    resultBagId: 'hp_potion',
    resultQty: 2,
  },
  {
    id: 'craft_mine_bomb',
    title: 'Bom Mini Tambang (x2)',
    desc: 'Ledakkan area batu & monster 3×3 di Gua Bawah Tanah atau Tambang!',
    ingredients: [
      { kind: 'bag', id: 'ore_copper', label: 'Bijih Tembaga', qty: 1 },
      { kind: 'bag', id: 'slime_gel', label: 'Lendir Slime', qty: 2 },
      { kind: 'bag', id: 'stone_res', label: 'Batu Granit', qty: 3 },
    ],
    resultType: 'bag',
    resultBagId: 'mine_bomb',
    resultQty: 2,
  },
  {
    id: 'craft_torch',
    title: 'Obor Lentera Terang (x2)',
    desc: 'Menerangi seluruh area gelap di Gua Tambang & malam hari selama 90 detik.',
    ingredients: [
      { kind: 'bag', id: 'wood_res', label: 'Kayu Keras', qty: 2 },
      { kind: 'bag', id: 'slime_gel', label: 'Lendir Slime', qty: 1 },
    ],
    resultType: 'bag',
    resultBagId: 'torch_item',
    resultQty: 2,
  },
  {
    id: 'craft_home_totem',
    title: 'Jimat Pulang Kilat',
    desc: 'Teleport instan ke Rumah Kebun dari pulau mana pun atau lantai gua terdalam!',
    ingredients: [
      { kind: 'bag', id: 'wood_res', label: 'Kayu Keras', qty: 4 },
      { kind: 'bag', id: 'monster_core', label: 'Inti Monster', qty: 1 },
    ],
    resultType: 'bag',
    resultBagId: 'home_totem',
    resultQty: 1,
  },
  {
    id: 'craft_fish_bait',
    title: 'Umpan Ikan Harum (x3)',
    desc: 'Pancingan cepat disambar & ikan langka lebih sering muncul.',
    ingredients: [
      { kind: 'bag', id: 'slime_gel', label: 'Lendir Slime', qty: 1 },
      { kind: 'bag', id: 'forage_berry', label: 'Beri Liar Biru', qty: 1 },
    ],
    resultType: 'bag',
    resultBagId: 'fish_bait',
    resultQty: 3,
  },
  {
    id: 'craft_sprinkler',
    title: 'Sprinkler Otomatis (4 Arah)',
    desc: 'Menyiram 4 petak di sekelilingnya otomatis tiap pagi.',
    ingredients: [
      { kind: 'bag', id: 'ore_copper', label: 'Bijih Tembaga', qty: 2 },
      { kind: 'bag', id: 'stone_res', label: 'Batu Granit', qty: 4 },
    ],
    resultType: 'sprinkler',
    resultQty: 1,
  },
  {
    id: 'craft_gold_sprinkler',
    title: 'Sprinkler Emas (3x3 Luas)',
    desc: 'Menyiram 8 petak di sekelilingnya sekaligus setiap pagi!',
    ingredients: [
      { kind: 'bag', id: 'ore_silver', label: 'Bijih Perak', qty: 2 },
      { kind: 'bag', id: 'ore_star', label: 'Kristal Bintang', qty: 1 },
    ],
    resultType: 'gold_sprinkler',
    resultQty: 1,
  },
  {
    id: 'craft_tonic',
    title: 'Jamu Cahaya Herbal',
    desc: 'Pulihkan +90 Energi & +45 HP langsung saat kelelahan.',
    ingredients: [
      { kind: 'bag', id: 'forage_mushroom', label: 'Jamur Hutan', qty: 1 },
      { kind: 'bag', id: 'forage_berry', label: 'Beri Liar', qty: 2 },
    ],
    resultType: 'bag',
    resultBagId: 'artisan_tonic',
    resultQty: 1,
  },
  {
    id: 'craft_jam',
    title: 'Selai Stroberi Emas',
    desc: 'Olah Stroberi panen menjadi Selai bernilai 310G!',
    ingredients: [{ kind: 'crop', id: 'strawberry', label: 'Stroberi Panen', qty: 2 }],
    resultType: 'bag',
    resultBagId: 'artisan_jam',
    resultQty: 1,
  },
  {
    id: 'craft_coffee',
    title: 'Kopi Sangrai Nusantara',
    desc: 'Olah Kopi Gunung jadi minuman Lari Cepat bernilai 420G!',
    ingredients: [{ kind: 'crop', id: 'coffee', label: 'Kopi Gunung Panen', qty: 2 }],
    resultType: 'bag',
    resultBagId: 'artisan_coffee',
    resultQty: 1,
  },
  {
    id: 'craft_fertilizer',
    title: 'Pupuk Subur Alami (x3)',
    desc: 'Olah hasil hutan & kerang menjadi 3 Pupuk Emas.',
    ingredients: [
      { kind: 'bag', id: 'wood_res', label: 'Kayu Keras', qty: 3 },
      { kind: 'bag', id: 'forage_shell', label: 'Kerang Mutiara', qty: 1 },
    ],
    resultType: 'fertilizer',
    resultQty: 3,
  },
];

export interface ToolUpgradeTier {
  level: number;
  tierName: string;
  goldCost: number;
  woodCost: number;
  oreId: BagItemId;
  oreQty: number;
  bonusDesc: string;
}

export const TOOL_UPGRADE_TIERS: ToolUpgradeTier[] = [
  {
    level: 2,
    tierName: 'Lv.2 Tembaga',
    goldCost: 180,
    woodCost: 5,
    oreId: 'ore_copper',
    oreQty: 4,
    bonusDesc: 'Jangkauan 2 petak / Tebang & tambang 2× lebih cepat / Damage +10',
  },
  {
    level: 3,
    tierName: 'Lv.3 Perak',
    goldCost: 420,
    woodCost: 8,
    oreId: 'ore_silver',
    oreQty: 4,
    bonusDesc: 'Jangkauan 3 petak / Tebang 1 hit + ekstra kayu / Damage +24',
  },
  {
    level: 4,
    tierName: 'Lv.4 Bintang Kristal',
    goldCost: 850,
    woodCost: 12,
    oreId: 'ore_star',
    oreQty: 3,
    bonusDesc: 'Area 3×3 luas / Drop ganda / Damage +45 & serang monster jauh!',
  },
];

export const TOOL_UPGRADE_NAMES: Record<UpgradeableToolId, string> = {
  hoe: 'Cangkul',
  water: 'Penyiram Air',
  axe: 'Kapak Penebang',
  pick: 'Beliung Tambang',
  sword: 'Pedang Petualang',
  rod: 'Pancingan Bambu',
};

export interface StoryChapter {
  chapter: number;
  title: string;
  mustikaName: string;
  speakerNpc: NpcId;
  summary: string;
  objectiveText: string;
  unlockHint: string;
  rewardGold: number;
  rewardScore: number;
}

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    chapter: 1,
    title: 'Bab 1: Warisan Lembah Asri',
    mustikaName: 'Mustika Tanah',
    speakerNpc: 'raka',
    summary:
      'Kakek Dharma mewariskan kebun tua ini di Kepulauan Pulau TIK. Tebanglah pepohonan untuk mengumpulkan Kayu, panen hasil kebun pertamamu, lalu temui Tetua Raka!',
    objectiveText: 'Panen minimal 4 tanaman kebun lalu temui Tetua Raka.',
    unlockHint: 'Membuka: Jembatan Pelabuhan Selatan, Pantai Karang, Dewi di Pulau Bambu & Kapten Bima!',
    rewardGold: 220,
    rewardScore: 450,
  },
  {
    chapter: 2,
    title: 'Bab 2: Panggilan Hutan & Air Terjun',
    mustikaName: 'Mustika Tirta',
    speakerNpc: 'maya',
    summary:
      'Nenek Maya menemukan mata air suci di Hutan Rimba Barat Laut mulai melemah. Tebang pohon dengan Kapak [3] atau kumpulkan batu/jamur/beri hutan, lalu temui Nenek Maya!',
    objectiveText: 'Kumpulkan minimal 6 Kayu/Batu & 2 Jamur/Beri Hutan, lalu bicara ke Nenek Maya.',
    unlockHint: 'Membuka: Jalur Tambang Kristal Timur Laut, Gua Bawah Tanah & Benih Nanas Tropis!',
    rewardGold: 320,
    rewardScore: 650,
  },
  {
    chapter: 3,
    title: 'Bab 3: Layar Pelabuhan & Kincir Angin',
    mustikaName: 'Mustika Angin',
    speakerNpc: 'bima',
    summary:
      'Jalur Pelabuhan Karang telah terbuka! Gunakan Pancingan [0] di Dermaga/Kepulauan untuk menangkap ikan dan temui Kapten Bima.',
    objectiveText: 'Tangkap minimal 2 Ikan dengan Pancingan [0] dan miliki total 10 Panen, lalu temui Kapten Bima.',
    unlockHint: 'Membuka: Kincir Angin Berputar, Benih Kopi Gunung & Berkah Kandang Ayam!',
    rewardGold: 450,
    rewardScore: 850,
  },
  {
    chapter: 4,
    title: 'Bab 4: Bara Tambang & Gua Bawah Tanah',
    mustikaName: 'Mustika Mentari',
    speakerNpc: 'lira',
    summary:
      'Masuklah ke Gua Tambang Bawah Tanah, kalahkan monster dengan Pedang [5] untuk mendapat drop langka, tambang bijih kristal, dan temui Lira di Altar Utara!',
    objectiveText: 'Tambang 3 Bijih/Kristal & buat 1 Kerajinan [C], lalu temui Lira.',
    unlockHint: 'Membuka: Penyatuan 4 Mustika di Pohon Cahaya Abadi!',
    rewardGold: 600,
    rewardScore: 1100,
  },
  {
    chapter: 5,
    title: 'Bab 5: Kebangkitan Pohon Cahaya Abadi',
    mustikaName: 'Cahaya Pulau TIK',
    speakerNpc: 'raka',
    summary:
      'Keempat Mustika telah bersinar! Pergilah ke Pohon Cahaya Abadi di Altar Utara (x:40, y:6) dan sentuh batangnya untuk memulihkan seluruh Kepulauan Pulau TIK!',
    objectiveText: 'Sentuh/Klik Pohon Cahaya Abadi di Altar Utara untuk menyatukan 4 Mustika!',
    unlockHint: 'Membuka: Festival Cahaya Abadi, Benih Legendaris Buah Purnama & Gelar Penjaga Pulau TIK!',
    rewardGold: 1000,
    rewardScore: 2000,
  },
];

export interface NpcConfig {
  id: NpcId;
  name: string;
  role: string;
  homeRegion: string;
  homeInterior: InteriorId;
  baseX: number;
  baseY: number;
  patrolRadius: number;
  favoriteCategory: string;
  color: string;
  greetingsByChapter: Record<number, string>;
  chitChatLines: string[];
  secretLore: string;
}

/**
 * Exclusive NPC Location Schedule:
 * Returns either 'outdoor' OR an exact InteriorId.
 * Guarantees NO NPC ever appears outdoors and indoors at the same time!
 */
export function getNpcExclusiveLocation(
  npcId: NpcId,
  minuteOfDay: number,
  weather: Weather
): 'outdoor' | InteriorId {
  // Shopkeepers & specialists stay inside their exclusive buildings during day business hours!
  if (npcId === 'sari') {
    // Mbak Sari keeps Toko Benih exclusive all daytime + evening (06:00 Siang - 08:59 Malam)
    return minuteOfDay >= 360 && minuteOfDay < 1260 ? 'shop' : 'outdoor';
  }
  if (npcId === 'kiran') {
    // Kiran runs Bengkel Pandai Besi & Upgrade Alat all day (06:00 Siang - 08:59 Malam)
    return minuteOfDay >= 360 && minuteOfDay < 1260 ? 'forge' : 'outdoor';
  }
  if (npcId === 'tara') {
    // Tara operates Lighthouse Telescope & Star Charts during day; stargazes outside at night unless raining
    if (weather === 'Hujan') return 'lighthouse';
    return minuteOfDay >= 360 && minuteOfDay < 1080 ? 'lighthouse' : 'outdoor';
  }
  // All other villagers go indoors during Rain or Night (18:00 - 05:59) or midday break, and walk outside otherwise!
  const isNight = minuteOfDay >= 1080 || minuteOfDay < 360;
  if (weather === 'Hujan' || isNight) {
    return NPCS[npcId].homeInterior;
  }
  if (npcId === 'maya' && minuteOfDay >= 780 && minuteOfDay < 1020) return 'maya_hut';
  if (npcId === 'jaka' && minuteOfDay >= 720 && minuteOfDay < 960) return 'jaka_cabin';
  if (npcId === 'dewi' && minuteOfDay >= 840 && minuteOfDay < 1020) return 'dewi_hut';
  if (npcId === 'bagas' && minuteOfDay >= 900 && minuteOfDay < 1080) return 'explorer_post';
  if (npcId === 'raka' && minuteOfDay >= 840 && minuteOfDay < 1050) return 'elder_hall';
  return 'outdoor';
}

export const NPCS: Record<NpcId, NpcConfig> = {
  raka: {
    id: 'raka',
    name: 'Tetua Raka',
    role: 'Tetua & Penjaga Sejarah Desa',
    homeRegion: 'Desa Purnama & Balai Tetua',
    homeInterior: 'elder_hall',
    baseX: 43.5,
    baseY: 22.5,
    patrolRadius: 2.2,
    favoriteCategory: 'Kopi / Labu',
    color: '#22c55e',
    greetingsByChapter: {
      1: 'Selamat datang di Kepulauan Pulau TIK! Cobalah menebang pohon dengan Kapak [3] untuk Kayu, lalu panen 4 tanaman pertamamu!',
      2: 'Mustika Tanah telah menyala! Kini temui Nenek Maya di Hutan Rimba atau kunjungi Dewi di Pulau Bambu Barat!',
      3: 'Pelabuhan Karang tersambung lagi! Jelajahi pula Pulau Karang Barat Daya dan Pulau Bintang Tenggara!',
      4: 'Lira menunggumu di Altar Utara. Berhati-hatilah terhadap Slime, Kelelawar, dan Golem di Gua Bawah Tanah!',
      5: 'Keempat Mustika telah berkumpul! Sentuh Pohon Cahaya Abadi di utara Altar dan pulihkan Pulau TIK selamanya!',
    },
    chitChatLines: [
      'Sekarang ada 5 pulau terhubung jembatan di Kepulauan Pulau TIK! Tekan [M] untuk melihat Peta Pixel lengkapnya.',
      'Setiap warga kini punya jadwal eksklusif—kalau tidak ada di luar, berarti mereka sedang berada di dalam gedung masing-masing!',
      'Simpan progresmu kapan saja dengan tombol Simpan di bilah atas agar petualanganmu aman.',
    ],
    secretLore:
      'Rahasia Tetua: Di bawah Tebing Timur terdapat jaringan Gua Bawah Tanah kuno penjaga Kristal Bintang Pulau TIK.',
  },
  sari: {
    id: 'sari',
    name: 'Mbak Sari',
    role: 'Pemilik Eksklusif Toko Benih',
    homeRegion: 'Toko Benih Desa Purnama',
    homeInterior: 'shop',
    baseX: 40.5,
    baseY: 21.5,
    patrolRadius: 1.4,
    favoriteCategory: 'Stroberi / Bunga Matahari',
    color: '#ec4899',
    greetingsByChapter: {
      1: 'Selamat datang di Toko Benih eksklusifku! Di sini kamu bisa membeli semua bibit, pupuk, dan perlengkapan kebun.',
      2: 'Stok baru! Bibit Nanas Tropis sudah tersedia di rak Toko Benih!',
      3: 'Kopi Gunung harum kini bisa kamu beli dan sangrai di Meja Kerajinan!',
      4: 'Kabarnya Kiran di Bengkel Tempa bisa meningkatkan level Cangkul dan Penyiram Air sampai Lv.4!',
      5: 'Bibit Buah Purnama legendaris kini resmi kubuka khusus untuk Penjaga Pulau TIK!',
    },
    chitChatLines: [
      'Tokoku hanya bisa diakses dari dalam gedung Toko Benih saat aku bertugas, supaya terasa seperti desa nyata!',
      'Stroberi, Jagung, Nanas, dan Kopi bisa dipanen berkali-kali tanpa tanam ulang.',
      'Cobalah bawa Jimat Pulang Kilat kalau berpetualang jauh ke pulau lain atau gua terdalam!',
    ],
    secretLore:
      'Tip Rahasia Mbak Sari: Bunga Matahari sering menjatuhkan benih gratis saat dipanen!',
  },
  jaka: {
    id: 'jaka',
    name: 'Pak Jaka',
    role: 'Tukang Kayu & Pengrajin Hutan',
    homeRegion: 'Hutan Rimba & Bengkel Kayu',
    homeInterior: 'jaka_cabin',
    baseX: 30.5,
    baseY: 10.2,
    patrolRadius: 1.8,
    favoriteCategory: 'Kentang / Kayu / Olahan',
    color: '#f97316',
    greetingsByChapter: {
      1: 'Salam! Gunakan Kapak [3] untuk menebang pohon di hutan dan kebun—setiap pohon memberi banyak Kayu Keras!',
      2: 'Jembatan Selatan dan Pulau Barat sudah kokoh! Bantu Nenek Maya membersihkan air terjun ya.',
      3: 'Masuklah ke Bengkel Kayuku atau Bengkel Tempa Kiran untuk merakit barang dan upgrade alat!',
      4: 'Pintu Gua Tambang di Timur Laut dan Pulau Vulkanik Timur menyimpan bijih perak dan kristal berlimpah.',
      5: 'Karya tanganmu membuat semua pulau di Pulau TIK kembali makmur!',
    },
    chitChatLines: [
      'Tunggul pohon yang ditebang habis akan tumbuh menjadi pohon baru setelah beberapa hari—jadi jangan khawatir kehabisan kayu!',
      'Upgrade Kapak ke Lv.2 atau Lv.3 di Bengkel Kiran supaya sekali tebas langsung menghasilkan lebih banyak kayu!',
      'Setiap perabotan di rumah dan bengkel kini bisa diklik untuk fungsi nyata, termasuk tumpukan kayuku!',
    ],
    secretLore:
      'Rahasia Pak Jaka: Aku dan Kiran dulu menempuh jalan jembatan batu hingga Pulau Vulkanik Timur demi mencari kayu besi.',
  },
  maya: {
    id: 'maya',
    name: 'Nenek Maya',
    role: 'Ahli Herbal & Penjaga Air Terjun',
    homeRegion: 'Pondok Air Terjun Hutan',
    homeInterior: 'maya_hut',
    baseX: 24.5,
    baseY: 12.2,
    patrolRadius: 1.4,
    favoriteCategory: 'Jamur / Beri / Jamu',
    color: '#a855f7',
    greetingsByChapter: {
      1: 'Hutan Rimba Utara kini penuh pepohonan rindang, jamur merah, dan beri biru.',
      2: 'Bantu kumpulkan 6 Kayu/Batu serta 2 Jamur/Beri Hutan agar aliran Air Terjun kembali jernih!',
      3: 'Mustika Tirta telah bangkit! Kuali ramuan di pondokku siap meracik Jamu & Ramuan HP!',
      4: 'Jika terluka melawan monster gua, minumlah Ramuan Kesehatan Merah dari Beri dan Sayap Kelelawar.',
      5: 'Kabut Layu telah lenyap dari seluruh lima pulau Pulau TIK!',
    },
    chitChatLines: [
      'Di dalam pondokku, Kuali Ramuan dan Meja Pengering bisa digunakan untuk meracik berbagai ramuan.',
      'Kopi Sangrai Nusantara tidak hanya memulihkan energi, tapi juga membuatmu berlari secepat angin!',
      'Obor Lentera sangat berguna untuk menerangi lorong gelap Gua Tambang Bawah Tanah.',
    ],
    secretLore:
      'Rahasia Nenek Maya: Sayap kelelawar gua jika dicampur beri biru menghasilkan penyembuh luka paling ampuh.',
  },
  bima: {
    id: 'bima',
    name: 'Kapten Bima',
    role: 'Nakhoda Pelabuhan Karang',
    homeRegion: 'Pelabuhan Pantai Selatan',
    homeInterior: 'lighthouse',
    baseX: 43.0,
    baseY: 36.2,
    patrolRadius: 2.0,
    favoriteCategory: 'Ikan / Kerang / Nanas',
    color: '#0284c7',
    greetingsByChapter: {
      1: 'Ahoy! Selesaikan Bab 1 agar Jembatan Pelabuhan bisa kita lalui ke selatan!',
      2: 'Dermaga sudah terbuka! Jangan lupa seberangi juga jembatan ke Pulau Karang Barat Daya & Pulau Bintang!',
      3: 'Tangkap 2 Ikan dengan Pancingan [0] dan kumpulkan 10 panen untuk membangkitkan Mustika Angin!',
      4: 'Pakai Umpan Ikan Harum dari Tas sebelum memancing supaya ikan langsung menyambar kailmu!',
      5: 'Lima pulau bersatu di bawah cahaya Pulau TIK! Para pelaut bersorak untukmu!',
    },
    chitChatLines: [
      'Pulau Bintang di tenggara penuh kerang mutiara dan ikan laut dalam langka.',
      'Saat hujan atau malam, mampirlah ke Menara Mercusuar tempat Tara bertugas!',
      'Upgrade Pancinganmu di Bengkel Kiran supaya peluang dapat Koi Cahaya dan Udang Emas makin besar!',
    ],
    secretLore:
      'Rahasia Kapten Bima: Di bawah dermaga tenggara sering terlihat pantulan cahaya bintang dari Gua Timur.',
  },
  lira: {
    id: 'lira',
    name: 'Lira',
    role: 'Peneliti Botani & Prasasti Kuno',
    homeRegion: 'Altar Pohon Cahaya Utara',
    homeInterior: 'elder_hall',
    baseX: 39.5,
    baseY: 11.2,
    patrolRadius: 1.8,
    favoriteCategory: 'Kristal Bintang / Bunga Matahari',
    color: '#eab308',
    greetingsByChapter: {
      1: 'Halo! Aku meneliti keterhubungan 5 pulau di sekitar Pohon Cahaya Pulau TIK.',
      2: 'Energi alam hutan, laut, dan tambang bawah tanah semuanya bermuara di Altar ini.',
      3: 'Kincir Angin kembali memutar aliran energi udara menuju Pohon Cahaya!',
      4: 'Tambang 3 Bijih/Kristal di Tambang atau Gua Bawah Tanah lalu buat 1 kerajinan untuk Mustika Mentari!',
      5: 'Semua 4 Mustika telah sempurna! Sentuh Pohon Cahaya Abadi untuk menyelesaikan legenda!',
    },
    chitChatLines: [
      'Setiap peralatan bisa ditingkatkan hingga Lv.4 (Bintang Kristal) di Bengkel Tempa Kiran!',
      'Bom Mini Tambang bisa menghancurkan 9 batu tambang sekaligus dalam satu ledakan!',
      'Siang dan malam masing-masing 12 jam (20 menit waktu nyata), dan kamu bisa mempercepat waktu lewat tempat tidur.',
    ],
    secretLore:
      'Catatan Penelitian Lira: Inti Kristal Monster dari Golem Bawah Tanah memancarkan frekuensi yang sama dengan Pohon Cahaya.',
  },
  kiran: {
    id: 'kiran',
    name: 'Kiran',
    role: 'Pandai Besi & Ahli Upgrade Alat',
    homeRegion: 'Bengkel Tempa Desa Purnama',
    homeInterior: 'forge',
    baseX: 50.5,
    baseY: 21.5,
    patrolRadius: 1.5,
    favoriteCategory: 'Bijih Tembaga / Perak / Inti Monster',
    color: '#dc2626',
    greetingsByChapter: {
      1: 'Yo! Aku Kiran, pandai besi Pulau TIK! Kumpulkan Kayu & Bijih lalu tempa peralatanmu di Bengkelku hingga Lv.4!',
      2: 'Sekarang Gua Bawah Tanah sudah terbuka—bawa pulang banyak Bijih Tembaga dan Perak untuk kutempa!',
      3: 'Cangkul & Penyiram Lv.3 bisa menggarap 3 petak sekali ayun! Hemat tenaga dan waktu!',
      4: 'Kalau punya Kristal Bintang dari Golem atau Gua Dalam, aku bisa menempa Alat Level Bintang (3×3 Area)!',
      5: 'Tak ada pandai besi mana pun yang punya pelanggan sehebat kamu di Pulau TIK!',
    },
    chitChatLines: [
      'Paron besiku di dalam Bengkel Tempa bisa langsung dipakai untuk Upgrade Cangkul, Penyiram, Kapak, Beliung, Pedang, & Pancingan!',
      'Kapak yang di-upgrade ke Lv.2 sudah bisa menebang pohon besar hanya dalam 2 ayunan.',
      'Pedang Petualang [5] wajib kamu bawa sebelum turun ke Gua Tambang Bawah Tanah!',
    ],
    secretLore:
      'Rahasia Kiran: Tempaan Kristal Bintang tidak pernah tumpul dan memancarkan kilau biru di kegelapan.',
  },
  tara: {
    id: 'tara',
    name: 'Tara',
    role: 'Penjaga Mercusuar & Astronom',
    homeRegion: 'Menara Mercusuar & Pulau Bintang',
    homeInterior: 'lighthouse',
    baseX: 66.5,
    baseY: 36.5,
    patrolRadius: 2.0,
    favoriteCategory: 'Kerang Mutiara / Koi Cahaya',
    color: '#6366f1',
    greetingsByChapter: {
      1: 'Halo penjelajah bintang! Aku Tara, penjaga Menara Mercusuar TIK.',
      2: 'Lewati jembatan di timur mercusuar untuk menemukan Pulau Bintang Tenggara yang tenang!',
      3: 'Dari teleskop mercusuar, aku bisa melihat seluruh formasi lima pulau dan cuaca besok!',
      4: 'Saat malam hari aku suka mengamati bintang jatuh di Pulau Bintang Tenggara.',
      5: 'Lampu suar mercusuar dan Pohon Cahaya kini bersinar serasi menuntun para pelaut!',
    },
    chitChatLines: [
      'Coba pakai Teleskop Samudra dan Lentera Suar di dalam Menara Mercusuar untuk berkah keberuntungan memancing!',
      'Kerang Mutiara banyak terdampar di pasir Pulau Bintang dan Pulau Karang Barat Daya.',
      'Jika malam tiba setelah 06:00 Malam, ikan-ikan langka bercahaya lebih aktif berenang.',
    ],
    secretLore:
      'Rahasia Tara: Bintang paling terang di langit selatan selalu tepat berada di atas Gua Tambang Pulau Timur.',
  },
  dewi: {
    id: 'dewi',
    name: 'Dewi',
    role: 'Pengurus Kebun Pulau Bambu',
    homeRegion: 'Pulau Bambu Barat',
    homeInterior: 'dewi_hut',
    baseX: 9.5,
    baseY: 23.0,
    patrolRadius: 2.2,
    favoriteCategory: 'Beri / Jamur / Jagung',
    color: '#10b981',
    greetingsByChapter: {
      1: 'Selamat datang di Pulau Bambu Barat! Di sini ada banyak pohon kayu keras dan beri liar untukmu!',
      2: 'Tanah di Pulau Bambu juga subur lho—kamu bisa menanam kebun tambahan di sekitar pondokku!',
      3: 'Aku suka melihat kincir angin berputar dari kejauhan di pulau utama.',
      4: 'Jangan lupa bawa Jimat Pulang Kilat kalau mau kembali cepat ke Rumah Kebun setelah berkebun di sini.',
      5: 'Berkatmu, kebun di Pulau Bambu dan Pulau Utama sama-sama panen raya!',
    },
    chitChatLines: [
      'Pondok Bambuku di barat punya kasur jerami kalau kamu kemalaman saat menebang pohon di sini.',
      'Kolam Teratai di selatan pulau ini tenang sekali untuk latihan memancing ikan air tawar!',
      'Tebang pohon yang sudah tua, karena tunas barunya akan tumbuh kembali lebih rimbun.',
    ],
    secretLore:
      'Rahasia Dewi: Buah beri yang tumbuh di Pulau Bambu punya rasa paling manis karena embun kolam teratai.',
  },
  bagas: {
    id: 'bagas',
    name: 'Bagas',
    role: 'Pemburu Monster & Penjelajah Gua',
    homeRegion: 'Pos Gua Tambang Timur',
    homeInterior: 'explorer_post',
    baseX: 54.0,
    baseY: 11.0,
    patrolRadius: 2.0,
    favoriteCategory: 'Inti Monster / Jamu / Bom',
    color: '#b45309',
    greetingsByChapter: {
      1: 'Waspada, kawan! Di timur laut ada Gua Bawah Tanah penuh Slime, Kelelawar, dan Golem Kristal!',
      2: 'Gunakan Pedang [5] untuk menebas monster gua dan kumpulkan Lendir Slime, Sayap Kelelawar, serta Inti Monster!',
      3: 'Mampirlah ke Pos Penjelajahku di timur Desa Purnama untuk meracik Bom Mini, Obor, dan Ramuan HP!',
      4: 'Semakin dalam lantai gua yang kau jelajahi (Lantai 1–5+), semakin banyak Bijih Perak dan Kristal Bintang!',
      5: 'Kamu bukan cuma petani hebat, tapi juga penakluk Gua Tambang sejati!',
    },
    chitChatLines: [
      'Setiap kali monster dikalahkan, mereka menjatuhkan material berharga untuk Bom, Obor, dan Jimat Pulang.',
      'Di Pulau Vulkanik Timur (seberangi Jembatan Batu Timur!) ada pintu masuk gua kedua dengan tantangan lebih seru!',
      'Kalau HP menipis di gua, segera minum Ramuan Kesehatan Merah dari bilah Item Cepat!',
    ],
    secretLore:
      'Rahasia Bagas: Pecahkan batu-batu di dalam gua karena sering menyembunyikan Tangga Turun ke lantai kaya kristal!',
  },
};

export interface IslandRegionLabel {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  desc: string;
}

export const ISLAND_REGIONS: IslandRegionLabel[] = [
  {
    id: 'west_bamboo',
    name: 'Pulau Bambu Barat',
    x: 3,
    y: 16,
    w: 12,
    h: 15,
    color: '#10b981',
    desc: 'Terhubung Jembatan Barat. Pondok Dewi, Hutan Pohon Kayu melimpah & Kolam Teratai.',
  },
  {
    id: 'farm',
    name: 'Lembah Kebun Warisan',
    x: 19,
    y: 17,
    w: 15,
    h: 12,
    color: '#84cc16',
    desc: 'Rumah Kayu (kasur, peti simpan, meja makan, TV, perapian), Kandang Ayam & Lahan Kebun.',
  },
  {
    id: 'village',
    name: 'Desa Purnama',
    x: 37,
    y: 17,
    w: 20,
    h: 12,
    color: '#f59e0b',
    desc: 'Toko Benih Eksklusif Mbak Sari, Balai Tetua, Bengkel Upgrade Kiran & Pos Bagas.',
  },
  {
    id: 'forest',
    name: 'Hutan Rimba & Air Terjun',
    x: 19,
    y: 4,
    w: 15,
    h: 12,
    color: '#059669',
    desc: 'Pondok Nenek Maya, Bengkel Pak Jaka, puluhan pohon tebang & jamur/beri liar.',
  },
  {
    id: 'altar',
    name: 'Altar Pohon Cahaya',
    x: 35,
    y: 4,
    w: 12,
    h: 12,
    color: '#ec4899',
    desc: 'Situs Suci 4 Mustika & Pohon Cahaya Abadi bersama Peneliti Lira.',
  },
  {
    id: 'mine',
    name: 'Tambang & Gua Bawah Tanah',
    x: 47,
    y: 4,
    w: 12,
    h: 12,
    color: '#8b5cf6',
    desc: 'Kincir Angin, Tambang Kristal & Pintu Masuk Gua Bawah Tanah ber-monster!',
  },
  {
    id: 'east_volcanic',
    name: 'Pulau Vulkanik Timur',
    x: 62,
    y: 9,
    w: 13,
    h: 17,
    color: '#f97316',
    desc: 'Terhubung Jembatan Batu Timur. Kaya Bijih Perak, Kristal Bintang & Gua Kedua.',
  },
  {
    id: 'beach',
    name: 'Pantai & Pelabuhan TIK',
    x: 20,
    y: 31,
    w: 38,
    h: 9,
    color: '#06b6d4',
    desc: 'Pelabuhan Kapten Bima, Menara Mercusuar Tara, Dermaga & Pohon Kelapa.',
  },
  {
    id: 'sw_reef',
    name: 'Pulau Karang Barat Daya',
    x: 4,
    y: 36,
    w: 12,
    h: 11,
    color: '#14b8a6',
    desc: 'Pulau tropis penuh Kerang Mutiara, Kelapa & spot mancing tenang.',
  },
  {
    id: 'se_star',
    name: 'Pulau Bintang Tenggara',
    x: 61,
    y: 31,
    w: 13,
    h: 15,
    color: '#6366f1',
    desc: 'Pulau observatorium Tara dengan pantai pasir putih & ikan malam langka!',
  },
];

// Enterable Building Interiors (All 10 Exclusive Buildings with Functional Furniture!)
export const INTERIORS: Record<InteriorId, InteriorDef> = {
  house: {
    id: 'house',
    title: 'Rumah Kebun Kakek',
    themeLabel: 'Pondok Petani Hangat',
    cols: 13,
    rows: 9,
    floorStyle: 'wood',
    wallColor: '#6f3615',
    wallAccent: '#b45309',
    exitTile: { x: 6, y: 8 },
    outdoorExit: { x: 22.5, y: 20.4 },
    furniture: [
      { id: 'h_rug', kind: 'rug', name: 'Karpet Anyaman', x: 4, y: 4, w: 5, h: 3, walkable: true },
      {
        id: 'h_bed',
        kind: 'bed',
        name: 'Tempat Tidur Kayu',
        x: 1,
        y: 2,
        w: 2,
        h: 2,
        interactAction: 'sleep',
      },
      {
        id: 'h_fire',
        kind: 'fireplace',
        name: 'Perapian Hangat',
        x: 5,
        y: 1,
        w: 2,
        h: 1,
        interactAction: 'warm_fire',
      },
      {
        id: 'h_books',
        kind: 'bookshelf',
        name: 'Rak Buku Warisan',
        x: 8,
        y: 1,
        w: 2,
        h: 1,
        interactAction: 'journal',
      },
      {
        id: 'h_tv',
        kind: 'tv',
        name: 'Radio & TV Pulau TIK',
        x: 11,
        y: 1,
        w: 1,
        h: 1,
        interactAction: 'tv_weather',
      },
      {
        id: 'h_table',
        kind: 'table_food',
        name: 'Meja Makan Kayu',
        x: 5,
        y: 4,
        w: 2,
        h: 2,
        interactAction: 'eat_table',
      },
      {
        id: 'h_plant',
        kind: 'plant',
        name: 'Pot Tanaman Hias',
        x: 1,
        y: 6,
        w: 1,
        h: 1,
        interactAction: 'water_plant',
      },
      {
        id: 'h_chest',
        kind: 'chest',
        name: 'Peti Penyimpanan Barang',
        x: 10,
        y: 5,
        w: 2,
        h: 1,
        interactAction: 'chest',
      },
    ],
  },
  shop: {
    id: 'shop',
    title: 'Toko Benih Eksklusif Mbak Sari',
    themeLabel: 'Toko Pertanian & Benih Desa',
    cols: 13,
    rows: 9,
    floorStyle: 'wood',
    wallColor: '#7c2d12',
    wallAccent: '#ec4899',
    exitTile: { x: 6, y: 8 },
    outdoorExit: { x: 40.5, y: 20.4 },
    residentNpc: 'sari',
    residentPos: { x: 3.5, y: 2.3 },
    furniture: [
      { id: 's_rug', kind: 'rug', name: 'Karpet Toko', x: 4, y: 5, w: 5, h: 2, walkable: true },
      {
        id: 's_counter',
        kind: 'counter',
        name: 'Meja Kasir Toko Benih',
        x: 2,
        y: 3,
        w: 4,
        h: 1,
        interactAction: 'shop',
      },
      {
        id: 's_rack1',
        kind: 'seed_rack',
        name: 'Rak Bibit Musiman',
        x: 8,
        y: 1,
        w: 3,
        h: 1,
        interactAction: 'shop',
      },
      {
        id: 's_rack2',
        kind: 'seed_rack',
        name: 'Rak Pupuk & Sprinkler',
        x: 1,
        y: 5,
        w: 2,
        h: 1,
        interactAction: 'shop',
      },
      {
        id: 's_crate',
        kind: 'crate',
        name: 'Peti Sayur & Jual Panen',
        x: 9,
        y: 4,
        w: 2,
        h: 2,
        interactAction: 'shop',
      },
      {
        id: 's_plant',
        kind: 'plant',
        name: 'Bunga Toko',
        x: 1,
        y: 1,
        w: 1,
        h: 1,
        interactAction: 'water_plant',
      },
    ],
  },
  elder_hall: {
    id: 'elder_hall',
    title: 'Balai Tetua Pulau TIK',
    themeLabel: 'Balai Adat & Arsip Sejarah',
    cols: 13,
    rows: 9,
    floorStyle: 'stone',
    wallColor: '#3f3f46',
    wallAccent: '#eab308',
    exitTile: { x: 6, y: 8 },
    outdoorExit: { x: 45.5, y: 20.4 },
    residentNpc: 'raka',
    residentPos: { x: 6.2, y: 2.6 },
    furniture: [
      { id: 'e_rug', kind: 'rug', name: 'Karpet Adat Emas', x: 4, y: 3, w: 5, h: 4, walkable: true },
      {
        id: 'e_throne',
        kind: 'elder_throne',
        name: 'Kursi Adat Tetua',
        x: 5,
        y: 1,
        w: 2,
        h: 1,
        interactAction: 'journal',
      },
      {
        id: 'e_map',
        kind: 'map_table',
        name: 'Meja Peta 5 Pulau TIK',
        x: 5,
        y: 4,
        w: 3,
        h: 2,
        interactAction: 'map',
      },
      {
        id: 'e_books',
        kind: 'bookshelf',
        name: 'Arsip Gulungan Pulau TIK',
        x: 1,
        y: 1,
        w: 2,
        h: 1,
        interactAction: 'journal',
      },
      {
        id: 'e_lamp',
        kind: 'altar_lamp',
        name: 'Lentera Adat Mustika',
        x: 9,
        y: 1,
        w: 2,
        h: 1,
        interactAction: 'blessing',
      },
      {
        id: 'e_plant',
        kind: 'plant',
        name: 'Tanaman Adat',
        x: 1,
        y: 6,
        w: 1,
        h: 1,
        interactAction: 'water_plant',
      },
      {
        id: 'e_plant2',
        kind: 'plant',
        name: 'Tanaman Adat',
        x: 11,
        y: 6,
        w: 1,
        h: 1,
        interactAction: 'water_plant',
      },
    ],
  },
  maya_hut: {
    id: 'maya_hut',
    title: 'Pondok Ramuan Nenek Maya',
    themeLabel: 'Rumah Herbalis & Jamu Hutan',
    cols: 13,
    rows: 9,
    floorStyle: 'mystic',
    wallColor: '#4c1d95',
    wallAccent: '#a855f7',
    exitTile: { x: 6, y: 8 },
    outdoorExit: { x: 24.5, y: 11.4 },
    residentNpc: 'maya',
    residentPos: { x: 4.0, y: 4.5 },
    furniture: [
      { id: 'm_rug', kind: 'rug', name: 'Karpet Mistik', x: 4, y: 3, w: 5, h: 4, walkable: true },
      {
        id: 'm_cauldron',
        kind: 'cauldron',
        name: 'Kuali Ramuan Herbal',
        x: 5,
        y: 3,
        w: 2,
        h: 2,
        interactAction: 'craft',
      },
      {
        id: 'm_potions',
        kind: 'potion_shelf',
        name: 'Rak Botol Jamu & Ramuan',
        x: 2,
        y: 1,
        w: 3,
        h: 1,
        interactAction: 'craft',
      },
      {
        id: 'm_herbs',
        kind: 'herb_table',
        name: 'Meja Pengering Jamur & Beri',
        x: 8,
        y: 1,
        w: 3,
        h: 1,
        interactAction: 'warm_fire',
      },
      {
        id: 'm_bed',
        kind: 'bed',
        name: 'Ranjang Nenek Maya',
        x: 1,
        y: 5,
        w: 2,
        h: 2,
        interactAction: 'sleep',
      },
      {
        id: 'm_plant',
        kind: 'plant',
        name: 'Daun Herbal',
        x: 10,
        y: 5,
        w: 1,
        h: 1,
        interactAction: 'water_plant',
      },
    ],
  },
  jaka_cabin: {
    id: 'jaka_cabin',
    title: 'Bengkel Kayu Pak Jaka',
    themeLabel: 'Bengkel Tukang & Perkakas',
    cols: 13,
    rows: 9,
    floorStyle: 'wood',
    wallColor: '#78350f',
    wallAccent: '#f97316',
    exitTile: { x: 6, y: 8 },
    outdoorExit: { x: 30.5, y: 8.4 },
    residentNpc: 'jaka',
    residentPos: { x: 6.0, y: 3.8 },
    furniture: [
      {
        id: 'j_bench',
        kind: 'carpenter_bench',
        name: 'Meja Tukang Kayu',
        x: 2,
        y: 2,
        w: 3,
        h: 1,
        interactAction: 'craft',
      },
      {
        id: 'j_tools',
        kind: 'tool_rack',
        name: 'Rak Perkakas Dinding',
        x: 6,
        y: 1,
        w: 3,
        h: 1,
        interactAction: 'upgrade',
      },
      {
        id: 'j_anvil',
        kind: 'anvil',
        name: 'Paron Besi & Palu',
        x: 8,
        y: 3,
        w: 2,
        h: 2,
        interactAction: 'upgrade',
      },
      {
        id: 'j_wood',
        kind: 'wood_stack',
        name: 'Tumpukan Balok Jati',
        x: 1,
        y: 5,
        w: 2,
        h: 2,
        interactAction: 'wood_pile',
      },
      {
        id: 'j_bed',
        kind: 'bed',
        name: 'Ranjang Pak Jaka',
        x: 9,
        y: 5,
        w: 2,
        h: 2,
        interactAction: 'sleep',
      },
    ],
  },
  forge: {
    id: 'forge',
    title: 'Bengkel Tempa & Upgrade Kiran',
    themeLabel: 'Pandai Besi Eksklusif Desa',
    cols: 13,
    rows: 9,
    floorStyle: 'stone',
    wallColor: '#451a03',
    wallAccent: '#ef4444',
    exitTile: { x: 6, y: 8 },
    outdoorExit: { x: 50.5, y: 20.4 },
    residentNpc: 'kiran',
    residentPos: { x: 4.5, y: 2.5 },
    furniture: [
      { id: 'f_rug', kind: 'rug', name: 'Karpet Kulit Tempa', x: 4, y: 4, w: 5, h: 3, walkable: true },
      {
        id: 'f_anvil',
        kind: 'anvil',
        name: 'Paron Tempa Level Alat (Lv.1–4)',
        x: 5,
        y: 3,
        w: 2,
        h: 2,
        interactAction: 'upgrade',
      },
      {
        id: 'f_fire',
        kind: 'fireplace',
        name: 'Tungku Api Pandai Besi',
        x: 2,
        y: 1,
        w: 2,
        h: 1,
        interactAction: 'warm_fire',
      },
      {
        id: 'f_tools',
        kind: 'tool_rack',
        name: 'Rak Senjata & Peralatan',
        x: 7,
        y: 1,
        w: 3,
        h: 1,
        interactAction: 'upgrade',
      },
      {
        id: 'f_bench',
        kind: 'carpenter_bench',
        name: 'Meja Rakit Bom & Peralatan',
        x: 9,
        y: 4,
        w: 3,
        h: 1,
        interactAction: 'craft',
      },
      {
        id: 'f_chest',
        kind: 'chest',
        name: 'Peti Stok Bijih Tambang',
        x: 1,
        y: 5,
        w: 2,
        h: 1,
        interactAction: 'chest',
      },
    ],
  },
  lighthouse: {
    id: 'lighthouse',
    title: 'Menara Mercusuar TIK',
    themeLabel: 'Stasiun Navigasi & Penjaga Laut',
    cols: 13,
    rows: 9,
    floorStyle: 'cobble',
    wallColor: '#1e3a8a',
    wallAccent: '#38bdf8',
    exitTile: { x: 6, y: 8 },
    outdoorExit: { x: 53.5, y: 36.4 },
    residentNpc: 'tara',
    residentPos: { x: 4.0, y: 3.0 },
    furniture: [
      { id: 'l_rug', kind: 'rug', name: 'Karpet Bahari', x: 4, y: 3, w: 5, h: 4, walkable: true },
      {
        id: 'l_beacon',
        kind: 'beacon_lamp',
        name: 'Lentera Suar Mercusuar',
        x: 5,
        y: 1,
        w: 2,
        h: 1,
        interactAction: 'beacon',
      },
      {
        id: 'l_nav',
        kind: 'nav_table',
        name: 'Meja Kompas & Peta Laut',
        x: 5,
        y: 3,
        w: 2,
        h: 2,
        interactAction: 'map',
      },
      {
        id: 'l_scope',
        kind: 'telescope',
        name: 'Teleskop Samudra',
        x: 9,
        y: 2,
        w: 2,
        h: 2,
        interactAction: 'telescope',
      },
      {
        id: 'l_books',
        kind: 'bookshelf',
        name: 'Lemari Log Pelayaran',
        x: 1,
        y: 1,
        w: 2,
        h: 1,
        interactAction: 'journal',
      },
      {
        id: 'l_bed',
        kind: 'bed',
        name: 'Ranjang Penjaga Suar',
        x: 1,
        y: 5,
        w: 2,
        h: 2,
        interactAction: 'sleep',
      },
    ],
  },
  coop: {
    id: 'coop',
    title: 'Kandang Ayam Kebun',
    themeLabel: 'Kandang Ternak Jerami Hangat',
    cols: 13,
    rows: 9,
    floorStyle: 'straw',
    wallColor: '#92400e',
    wallAccent: '#facc15',
    exitTile: { x: 6, y: 8 },
    outdoorExit: { x: 28.5, y: 20.4 },
    furniture: [
      {
        id: 'c_nest',
        kind: 'nest_box',
        name: 'Kotak Sarang Telur',
        x: 2,
        y: 2,
        w: 3,
        h: 1,
        interactAction: 'eggs',
      },
      {
        id: 'c_feed',
        kind: 'feed_trough',
        name: 'Bak Pakan Jagung',
        x: 7,
        y: 2,
        w: 3,
        h: 1,
        interactAction: 'feed_coop',
      },
      {
        id: 'c_hay1',
        kind: 'hay_bale',
        name: 'Tumpukan Jerami Emas',
        x: 1,
        y: 5,
        w: 2,
        h: 2,
        interactAction: 'hay_rest',
      },
      {
        id: 'c_hay2',
        kind: 'hay_bale',
        name: 'Jerami Hangat',
        x: 10,
        y: 5,
        w: 2,
        h: 2,
        interactAction: 'hay_rest',
      },
    ],
  },
  dewi_hut: {
    id: 'dewi_hut',
    title: 'Pondok Bambu Dewi',
    themeLabel: 'Rumah Kebun Pulau Barat',
    cols: 13,
    rows: 9,
    floorStyle: 'wood',
    wallColor: '#14532d',
    wallAccent: '#4ade80',
    exitTile: { x: 6, y: 8 },
    outdoorExit: { x: 8.5, y: 22.4 },
    residentNpc: 'dewi',
    residentPos: { x: 5.5, y: 2.5 },
    furniture: [
      { id: 'd_rug', kind: 'rug', name: 'Tikar Bambu Hijau', x: 4, y: 4, w: 5, h: 3, walkable: true },
      {
        id: 'd_bed',
        kind: 'bed',
        name: 'Tempat Tidur Bambu',
        x: 1,
        y: 2,
        w: 2,
        h: 2,
        interactAction: 'sleep',
      },
      {
        id: 'd_table',
        kind: 'table_food',
        name: 'Meja Teh Hijau Pulau Barat',
        x: 5,
        y: 4,
        w: 2,
        h: 2,
        interactAction: 'eat_table',
      },
      {
        id: 'd_herb',
        kind: 'herb_table',
        name: 'Meja Bibit & Buah Bambu',
        x: 8,
        y: 1,
        w: 3,
        h: 1,
        interactAction: 'craft',
      },
      {
        id: 'd_plant',
        kind: 'plant',
        name: 'Bambu Hias',
        x: 10,
        y: 5,
        w: 1,
        h: 1,
        interactAction: 'water_plant',
      },
    ],
  },
  explorer_post: {
    id: 'explorer_post',
    title: 'Pos Penjelajah Gua Bagas',
    themeLabel: 'Markas Pemburu Monster',
    cols: 13,
    rows: 9,
    floorStyle: 'cobble',
    wallColor: '#334155',
    wallAccent: '#f97316',
    exitTile: { x: 6, y: 8 },
    outdoorExit: { x: 54.5, y: 20.4 },
    residentNpc: 'bagas',
    residentPos: { x: 4.5, y: 2.6 },
    furniture: [
      { id: 'p_rug', kind: 'rug', name: 'Karpet Ekspedisi', x: 4, y: 4, w: 5, h: 3, walkable: true },
      {
        id: 'p_map',
        kind: 'map_table',
        name: 'Peta Gua Bawah Tanah',
        x: 5,
        y: 4,
        w: 3,
        h: 2,
        interactAction: 'map',
      },
      {
        id: 'p_potion',
        kind: 'potion_shelf',
        name: 'Rak Ramuan & Bom Gua',
        x: 2,
        y: 1,
        w: 3,
        h: 1,
        interactAction: 'craft',
      },
      {
        id: 'p_tools',
        kind: 'tool_rack',
        name: 'Rak Pedang & Obor',
        x: 8,
        y: 1,
        w: 3,
        h: 1,
        interactAction: 'upgrade',
      },
      {
        id: 'p_bed',
        kind: 'bed',
        name: 'Ranjang Ekspedisi',
        x: 1,
        y: 5,
        w: 2,
        h: 2,
        interactAction: 'sleep',
      },
      {
        id: 'p_crate',
        kind: 'crate',
        name: 'Peti Rampasan Monster',
        x: 10,
        y: 5,
        w: 2,
        h: 2,
        interactAction: 'chest',
      },
    ],
  },
};

// Multi-Island Organic Archipelago Generator (78 x 52 -> 5 Distinct Organic Islands!)
export function isOrganicPulauTikLand(x: number, y: number): boolean {
  if (x <= 1 || x >= WORLD_COLS - 2 || y <= 1 || y >= WORLD_ROWS - 2) return false;

  const wobble = Math.sin(x * 0.36 + y * 0.24) * 0.1 + Math.cos(y * 0.48 - x * 0.21) * 0.07;

  // 1. Central Main Island (Pulau TIK Utama: Homestead, Desa, Forest, Altar, Quarry, Southern Harbor)
  const dCenterMain = Math.hypot((x - 38.5) / 18.8, (y - 21.5) / 14.5) + wobble;
  const dCenterNorth = Math.hypot((x - 38.5) / 18.2, (y - 9.2) / 6.2) + wobble * 0.7;
  const dCenterSouthW = Math.hypot((x - 28.0) / 9.2, (y - 34.0) / 4.8) + wobble * 0.65;
  const dCenterSouthE = Math.hypot((x - 49.5) / 9.0, (y - 34.2) / 4.8) + wobble * 0.65;
  const inHarborBay = y >= 37 && x >= 37 && x <= 49;

  if (
    !inHarborBay &&
    (dCenterMain <= 1.0 || dCenterNorth <= 1.0 || dCenterSouthW <= 1.0 || dCenterSouthE <= 1.0)
  ) {
    return true;
  }

  // 2. Western Bamboo Island (Pulau Bambu Barat: x 3..15, y 16..31)
  const dWestBamboo = Math.hypot((x - 9.0) / 6.2, (y - 23.5) / 7.8) + wobble * 0.75;
  if (dWestBamboo <= 1.0) return true;

  // 3. Eastern Volcanic Crystal Island (Pulau Vulkanik Timur: x 62..74, y 9..26)
  const dEastVolcanic = Math.hypot((x - 68.0) / 6.2, (y - 17.5) / 8.5) + wobble * 0.75;
  if (dEastVolcanic <= 1.0) return true;

  // 4. South-East Star Island (Pulau Bintang Tenggara: x 61..74, y 32..46)
  const dSouthEastStar = Math.hypot((x - 67.5) / 6.4, (y - 39.0) / 7.2) + wobble * 0.75;
  if (dSouthEastStar <= 1.0) return true;

  // 5. South-West Reef Island (Pulau Karang Barat Daya: x 4..16, y 36..47)
  const dSouthWestReef = Math.hypot((x - 10.0) / 6.0, (y - 41.5) / 5.5) + wobble * 0.75;
  if (dSouthWestReef <= 1.0) return true;

  return false;
}

export function createInitialIslandGrid(): FarmTile[] {
  const tiles: FarmTile[] = [];

  const landGrid: boolean[][] = Array.from({ length: WORLD_ROWS }, (_, y) =>
    Array.from({ length: WORLD_COLS }, (_, x) => isOrganicPulauTikLand(x, y))
  );

  const ensureLandRect = (x0: number, y0: number, x1: number, y1: number) => {
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (y > 1 && y < WORLD_ROWS - 2 && x > 1 && x < WORLD_COLS - 2) {
          landGrid[y][x] = true;
        }
      }
    }
  };

  // Guarantee core building & path pads across all 5 islands
  ensureLandRect(19, 17, 33, 28); // Farm Valley
  ensureLandRect(37, 17, 56, 28); // Desa Purnama
  ensureLandRect(19, 4, 33, 15); // Hutan Rimba
  ensureLandRect(35, 4, 46, 15); // Altar Pohon Cahaya
  ensureLandRect(47, 4, 57, 16); // Quarry & Mine Entrance
  ensureLandRect(20, 31, 56, 36); // Southern Beach Strip
  ensureLandRect(5, 18, 14, 29); // Pulau Bambu Barat
  ensureLandRect(63, 11, 72, 24); // Pulau Vulkanik Timur
  ensureLandRect(63, 33, 72, 44); // Pulau Bintang Tenggara
  ensureLandRect(6, 37, 14, 45); // Pulau Karang Barat Daya

  const isNearOcean = (x: number, y: number): boolean => {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= WORLD_COLS || ny < 0 || ny >= WORLD_ROWS || !landGrid[ny][nx]) {
          return true;
        }
      }
    }
    return false;
  };

  for (let y = 0; y < WORLD_ROWS; y++) {
    for (let x = 0; x < WORLD_COLS; x++) {
      let kind: TileKind = 'grass';
      let debris: DebrisKind = null;
      let tilled = false;

      if (!landGrid[y][x]) {
        kind = 'ocean';
      } else {
        const isMain = x >= 18 && x <= 58;
        const isWestBamboo = x <= 16 && y <= 33;
        const isEastVolcanic = x >= 61 && y <= 28;
        const isSEStar = x >= 60 && y >= 30;
        const isSWReef = x <= 17 && y >= 34;

        const coastSand =
          (isMain && y >= 33) ||
          isSEStar ||
          isSWReef ||
          (isNearOcean(x, y) && !isEastVolcanic && !(isMain && x >= 47 && y <= 15));

        if (isEastVolcanic) {
          kind = isNearOcean(x, y) ? 'plaza' : 'plaza';
        } else if (isSEStar || isSWReef) {
          kind = isNearOcean(x, y) || y >= 40 ? 'sand' : 'grass';
        } else if (isWestBamboo) {
          kind = isNearOcean(x, y) ? 'sand' : 'forest_floor';
        } else if (coastSand) {
          kind = 'sand';
        } else if (y >= 4 && y <= 15 && x >= 19 && x <= 33) {
          kind = 'forest_floor';
        } else if (y >= 4 && y <= 16 && x >= 47 && x <= 58) {
          kind = 'plaza';
        } else if (y >= 4 && y <= 15 && x >= 35 && x <= 46) {
          kind = x >= 37 && x <= 43 && y >= 7 && y <= 11 ? 'plaza' : 'grass';
        } else if (x >= 38 && x <= 55 && y >= 18 && y <= 25) {
          kind = 'plaza';
        }

        // Rivers on Pulau Utama
        const southRiverY = 29 + Math.round(Math.sin(x * 0.25) * 0.6);
        if (isMain && (y === southRiverY || y === southRiverY + 1) && y >= 28 && y <= 31) {
          kind = 'river';
        }
        const streamX = 35 + Math.round(Math.sin(y * 0.35) * 0.5);
        if ((x === streamX || x === streamX + 1) && y >= 13 && y <= 29) {
          kind = 'river';
        }
      }

      // Bridges Connecting All 5 Islands & Rivers!
      if (x >= 34 && x <= 37 && (y === 22 || y === 23)) kind = 'bridge'; // Farm <-> Desa
      if (x >= 15 && x <= 19 && (y === 22 || y === 23)) kind = 'bridge'; // Farm <-> Pulau Bambu Barat
      if (x >= 57 && x <= 62 && (y === 22 || y === 23)) kind = 'bridge'; // Desa <-> Pulau Vulkanik Timur
      if (x >= 56 && x <= 62 && (y === 35 || y === 36)) kind = 'bridge'; // Pantai <-> Pulau Bintang Tenggara
      if (x >= 15 && x <= 21 && (y === 36 || y === 37)) kind = 'bridge'; // Pantai <-> Pulau Karang Barat Daya
      if (x >= 41 && x <= 43 && y >= 28 && y <= 31) kind = 'bridge'; // Desa <-> Pantai Selatan (Broken Bab 1!)
      if (x === 46 && (y === 11 || y === 12)) kind = 'cliff_pass'; // Altar <-> Tambang Timur Laut (Blocked Bab 1-2!)
      if (x >= 41 && x <= 43 && y >= 37 && y <= 41) kind = 'pier'; // Harbor Pier

      // Connecting Dirt/Cobble Roads
      if (
        kind !== 'ocean' &&
        kind !== 'river' &&
        kind !== 'bridge' &&
        kind !== 'pier' &&
        kind !== 'cliff_pass'
      ) {
        if (y === 22 && x >= 7 && x <= 68) kind = 'path';
        if (y === 12 && x >= 24 && x <= 54) kind = 'path';
        if (x === 24 && y >= 11 && y <= 27) kind = 'path';
        if (x === 42 && y >= 12 && y <= 36) kind = 'path';
        if (x === 54 && y >= 8 && y <= 22) kind = 'path';
        if (y === 36 && x >= 9 && x <= 67) kind = 'path';
        if (x === 8 && y >= 22 && y <= 27) kind = 'path';
        if (x === 67 && y >= 14 && y <= 22) kind = 'path';
      }

      // Landmarks & Enterable Buildings
      if (x >= 21 && x <= 23 && y >= 17 && y <= 19) kind = 'house';
      else if (x === 25 && (y === 18 || y === 19)) kind = 'bin';
      else if (x >= 27 && x <= 29 && y >= 17 && y <= 19) kind = 'coop';
      else if (x === 31 && (y === 18 || y === 19)) kind = 'workbench';
      else if (x >= 20 && x <= 22 && y >= 25 && y <= 27) kind = 'pond';
      else if (x >= 39 && x <= 41 && y >= 17 && y <= 19) kind = 'shop';
      else if (x >= 44 && x <= 46 && y >= 17 && y <= 19) kind = 'elder_hall';
      else if (x === 43 && y === 21) kind = 'well';
      else if (x >= 49 && x <= 51 && y >= 17 && y <= 19) kind = 'forge';
      else if (x >= 53 && x <= 55 && y >= 17 && y <= 19) kind = 'explorer_post';
      else if (x >= 20 && x <= 22 && y >= 5 && y <= 7) kind = 'pond'; // Waterfall Pond
      else if (x >= 23 && x <= 25 && y >= 8 && y <= 10) kind = 'maya_hut';
      else if (x >= 29 && x <= 31 && y >= 5 && y <= 7) kind = 'jaka_cabin';
      else if (x >= 39 && x <= 41 && y >= 5 && y <= 7) kind = 'sacred_tree';
      else if (
        (x === 37 && y === 9) ||
        (x === 38 && y === 10) ||
        (x === 42 && y === 10) ||
        (x === 43 && y === 9)
      )
        kind = 'altar';
      else if (x >= 49 && x <= 51 && y >= 5 && y <= 7) kind = 'windmill';
      else if ((x === 54 || x === 55) && (y === 6 || y === 7)) kind = 'mine_entrance';
      else if (x >= 52 && x <= 54 && y >= 33 && y <= 35) kind = 'lighthouse';
      else if (x >= 45 && x <= 48 && y >= 38 && y <= 40) kind = 'ship';
      else if (x >= 7 && x <= 9 && y >= 19 && y <= 21) kind = 'dewi_hut';
      else if (x >= 10 && x <= 12 && y >= 25 && y <= 27) kind = 'pond';
      else if ((x === 67 || x === 68) && (y === 12 || y === 13)) kind = 'mine_entrance';
      else if (x >= 68 && x <= 70 && y >= 38 && y <= 40) kind = 'pond';

      // Starter Tilled Garden Plot
      if (kind === 'grass' && x >= 23 && x <= 27 && y >= 22 && y <= 24) {
        if (y !== 22) tilled = true;
      }

      // Abundant Natural Debris, Mining Ores & Foraging across all 5 islands!
      const hash = (x * 41 + y * 67 + x * y * 13) % 31;
      if (kind === 'grass' && !tilled && y >= 18 && y <= 27 && x >= 19 && x <= 33) {
        if (hash === 3 || hash === 17) debris = 'stone';
        else if (hash === 7 || hash === 22) debris = 'wood';
        else if (hash === 11 || hash === 26) debris = 'weed';
      } else if (kind === 'forest_floor') {
        if (hash === 2 || hash === 15) debris = 'forage_mushroom';
        else if (hash === 6 || hash === 20) debris = 'forage_berry';
        else if (hash === 10 || hash === 24 || hash === 29) debris = 'wood';
        else if (hash === 13) debris = 'stone';
      } else if (kind === 'plaza' && ((x >= 48 && x <= 57 && y >= 5 && y <= 15) || x >= 62)) {
        if (hash === 1 || hash === 12 || hash === 23) debris = 'ore_copper';
        else if (hash === 5 || hash === 18) debris = 'ore_silver';
        else if (hash === 9 || hash === 28) debris = 'ore_star';
        else if (hash === 14 || hash === 21) debris = 'stone';
      } else if (kind === 'sand') {
        if (hash === 4 || hash === 16 || hash === 27) debris = 'forage_shell';
        else if (hash === 8) debris = 'wood';
      }

      tiles.push({
        x,
        y,
        kind,
        tilled,
        watered: false,
        fertilized: false,
        hasSprinkler: false,
        hasGoldSprinkler: false,
        debris,
        crop: null,
      });
    }
  }

  return tiles;
}

// Spawn ~55 Choppable Trees across all 5 Islands!
export function createInitialTrees(tiles: FarmTile[]): WorldTree[] {
  const trees: WorldTree[] = [];
  const occupied = new Set<string>();

  // Keep player spawn & key exits clear
  const isClearArea = (x: number, y: number) => {
    const t = tiles[y * WORLD_COLS + x];
    if (!t) return false;
    if (
      t.kind !== 'grass' &&
      t.kind !== 'forest_floor' &&
      t.kind !== 'sand' &&
      t.kind !== 'plaza'
    ) {
      return false;
    }
    if (t.tilled || t.debris) return false;
    // Keep away from buildings, crops, and bridges
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nt = tiles[(y + dy) * WORLD_COLS + (x + dx)];
        if (!nt) return false;
        if (
          nt.kind === 'house' ||
          nt.kind === 'shop' ||
          nt.kind === 'coop' ||
          nt.kind === 'elder_hall' ||
          nt.kind === 'jaka_cabin' ||
          nt.kind === 'maya_hut' ||
          nt.kind === 'forge' ||
          nt.kind === 'explorer_post' ||
          nt.kind === 'dewi_hut' ||
          nt.kind === 'lighthouse' ||
          nt.kind === 'mine_entrance' ||
          nt.kind === 'sacred_tree' ||
          nt.kind === 'windmill' ||
          nt.kind === 'bridge' ||
          nt.kind === 'path'
        ) {
          return false;
        }
      }
    }
    if (x >= 21 && x <= 28 && y >= 19 && y <= 25) return false;
    return true;
  };

  let idSeq = 1;
  for (let y = 4; y < WORLD_ROWS - 4; y++) {
    for (let x = 4; x < WORLD_COLS - 4; x++) {
      const t = tiles[y * WORLD_COLS + x];
      if (!isClearArea(x, y)) continue;
      // Avoid crowding adjacent trees
      let nearTree = false;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (occupied.has(`${x + dx},${y + dy}`)) nearTree = true;
        }
      }
      if (nearTree) continue;

      const h = (x * 73 + y * 97 + x * y * 19) % 100;
      const shouldPlace =
        t.kind === 'forest_floor'
          ? h < 24
          : t.kind === 'sand'
          ? h < 14
          : t.kind === 'grass'
          ? h < 11
          : false;

      if (shouldPlace) {
        occupied.add(`${x},${y}`);
        trees.push({
          id: `tree_${idSeq++}`,
          kind: t.kind === 'sand' ? 'palm' : 'oak',
          x,
          y,
          hp: 3,
          maxHp: 3,
          stumpDaysLeft: 0,
        });
      }
    }
  }

  return trees;
}

export const MINE_COLS = 16;
export const MINE_ROWS = 13;

export function generateUndergroundFloor(floor: number): {
  cells: UndergroundCell[];
  monsters: UndergroundMonster[];
  spawnPos: { x: number; y: number };
} {
  const cells: UndergroundCell[] = [];
  const monsters: UndergroundMonster[] = [];
  const ladderSpot = { x: MINE_COLS - 3, y: MINE_ROWS - 3 };

  for (let y = 0; y < MINE_ROWS; y++) {
    for (let x = 0; x < MINE_COLS; x++) {
      const isBorder = x === 0 || y === 0 || x === MINE_COLS - 1 || y === MINE_ROWS - 1;
      const isPillar =
        !isBorder &&
        ((x === 5 && y === 4) ||
          (x === 10 && y === 4) ||
          (x === 5 && y === 8) ||
          (x === 10 && y === 8));
      let kind: UndergroundCell['kind'] = isBorder || isPillar ? 'wall' : 'floor';
      let rock: UndergroundCell['rock'] = null;

      if (x === 2 && y === 2) kind = 'up_ladder';
      else if (x === ladderSpot.x && y === ladderSpot.y) kind = 'down_ladder';
      else if ((x === 3 && y === 1) || (x === 12 && y === 1)) kind = 'torch';

      const nearStart = Math.hypot(x - 2.5, y - 2.5) < 2.2;
      const nearLadder = x === ladderSpot.x && y === ladderSpot.y;
      if (kind === 'floor' && !nearStart && !nearLadder) {
        const r = Math.random();
        const oreBoost = Math.min(0.18, floor * 0.03);
        if (r < 0.28) {
          const oreRoll = Math.random();
          if (oreRoll < 0.08 + oreBoost * 0.5 && floor >= 2) rock = 'ore_star';
          else if (oreRoll < 0.25 + oreBoost) rock = 'ore_silver';
          else if (oreRoll < 0.55) rock = 'ore_copper';
          else rock = 'rock';
        }
      }

      cells.push({ x, y, kind, rock });
    }
  }

  // Spawn Floor Monsters!
  const monsterSpots = [
    { x: 7.5, y: 3.5 },
    { x: 11.5, y: 6.5 },
    { x: 7.5, y: 9.5 },
    { x: 12.5, y: 9.5 },
    { x: 4.5, y: 10.2 },
  ];
  const count = Math.min(monsterSpots.length, 2 + floor);
  for (let i = 0; i < count; i++) {
    const sp = monsterSpots[i];
    let kind: UndergroundMonster['kind'] = 'slime';
    if (floor >= 3 && i % 3 === 2) kind = 'golem';
    else if (floor >= 2 && i % 2 === 1) kind = 'bat';
    else if (i === 1) kind = 'bat';

    const maxHp = kind === 'golem' ? 68 + floor * 12 : kind === 'bat' ? 32 + floor * 6 : 28 + floor * 5;
    monsters.push({
      id: i + 1,
      kind,
      x: sp.x,
      y: sp.y,
      hp: maxHp,
      maxHp,
      speed: kind === 'bat' ? 0.045 : kind === 'golem' ? 0.025 : 0.032,
      damage: kind === 'golem' ? 16 : kind === 'bat' ? 11 : 8,
      hitFlash: 0,
      vx: 0,
      vy: 0,
    });
  }

  return { cells, monsters, spawnPos: { x: 2.5, y: 3.2 } };
}
