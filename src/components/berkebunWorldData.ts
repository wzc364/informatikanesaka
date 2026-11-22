/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const WORLD_COLS = 54;
export const WORLD_ROWS = 38;
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
  | 'artisan_jam'
  | 'artisan_coffee'
  | 'artisan_tonic';

export type NpcId = 'raka' | 'sari' | 'jaka' | 'maya' | 'bima' | 'lira';

export type InteriorId =
  | 'house'
  | 'shop'
  | 'elder_hall'
  | 'maya_hut'
  | 'jaka_cabin'
  | 'lighthouse'
  | 'coop';

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
  interactAction?: 'sleep' | 'shop' | 'craft' | 'journal' | 'telescope' | 'eggs' | 'info';
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
  category: 'Ikan' | 'Hutan & Pantai' | 'Tambang' | 'Ternak' | 'Olahan';
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
    desc: 'Ikan mistis bercahaya keemasan di sekitar air terjun & laut malam.',
  },
  forage_mushroom: {
    id: 'forage_mushroom',
    name: 'Jamur Hutan Merah',
    sellPrice: 40,
    energyRestore: 22,
    category: 'Hutan & Pantai',
    desc: 'Tumbuh alami di Hutan Rimba. Bisa dimakan untuk +22 Energi.',
  },
  forage_berry: {
    id: 'forage_berry',
    name: 'Beri Liar Biru',
    sellPrice: 35,
    energyRestore: 18,
    category: 'Hutan & Pantai',
    desc: 'Buah hutan manis menyegarkan (+18 Energi).',
  },
  forage_shell: {
    id: 'forage_shell',
    name: 'Kerang Mutiara',
    sellPrice: 65,
    category: 'Hutan & Pantai',
    desc: 'Kerang berkilau di pasir Pantai Selatan Pulau TIK.',
  },
  ore_copper: {
    id: 'ore_copper',
    name: 'Bijih Tembaga',
    sellPrice: 45,
    category: 'Tambang',
    desc: 'Ditambang di Tebing Timur. Bahan dasar Sprinkler!',
  },
  ore_silver: {
    id: 'ore_silver',
    name: 'Bijih Perak',
    sellPrice: 85,
    category: 'Tambang',
    desc: 'Logam murni berkilau untuk peralatan kebun canggih.',
  },
  ore_star: {
    id: 'ore_star',
    name: 'Kristal Bintang',
    sellPrice: 190,
    category: 'Tambang',
    desc: 'Batu kristal kuno penyimpan energi cahaya Pulau TIK.',
  },
  egg_normal: {
    id: 'egg_normal',
    name: 'Telur Ayam Segar',
    sellPrice: 60,
    energyRestore: 25,
    category: 'Ternak',
    desc: 'Telur segar dari Kandang Ayam setiap pagi.',
  },
  egg_gold: {
    id: 'egg_gold',
    name: 'Telur Emas Berkah',
    sellPrice: 175,
    energyRestore: 60,
    category: 'Ternak',
    desc: 'Telur istimewa berkilau dari ayam yang dirawat penuh kasih.',
  },
  wood_res: {
    id: 'wood_res',
    name: 'Kayu Keras',
    sellPrice: 12,
    category: 'Tambang',
    desc: 'Didapat dari menebang/membersihkan ranting kebun dan hutan.',
  },
  stone_res: {
    id: 'stone_res',
    name: 'Batu Granit',
    sellPrice: 14,
    category: 'Tambang',
    desc: 'Didapat dari memecah batu di kebun dan tambang.',
  },
  artisan_jam: {
    id: 'artisan_jam',
    name: 'Selai Stroberi Emas',
    sellPrice: 310,
    energyRestore: 45,
    category: 'Olahan',
    desc: 'Olahan kebun bernilai tinggi! +45 Energi atau jual 310G.',
  },
  artisan_coffee: {
    id: 'artisan_coffee',
    name: 'Kopi Sangrai Nusantara',
    sellPrice: 420,
    energyRestore: 55,
    category: 'Olahan',
    desc: 'Seduhan hangat pengisi stamina (+55 Energi) favorit warga!',
  },
  artisan_tonic: {
    id: 'artisan_tonic',
    name: 'Jamu Cahaya Herbal',
    sellPrice: 180,
    energyRestore: 90,
    category: 'Olahan',
    desc: 'Ramuan Nenek Maya memulihkan +90 Energi seketika!',
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
    desc: 'Pulihkan +90 Energi langsung saat kelelahan di kebun.',
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
    desc: 'Olah Kopi Gunung panen menjadi minuman spesial 420G!',
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
      'Kakek Dharma mewariskan kebun tua ini di Pulau TIK. Sejak Kabut Layu melanda, jembatan menuju Pantai Selatan terputus dan tanah lembah tertidur. Bangkitkan Mustika Tanah dengan memanen hasil kebun pertama dan berbicara pada Tetua Raka di Alun-Alun / Balai Desa!',
    objectiveText: 'Panen minimal 4 tanaman kebun lalu temui Tetua Raka di Desa Purnama.',
    unlockHint: 'Membuka: Jembatan Pelabuhan Selatan, Pantai Karang & Kapten Bima!',
    rewardGold: 220,
    rewardScore: 450,
  },
  {
    chapter: 2,
    title: 'Bab 2: Panggilan Hutan & Air Terjun',
    mustikaName: 'Mustika Tirta',
    speakerNpc: 'maya',
    summary:
      'Nenek Maya menemukan mata air suci di Hutan Rimba Barat Laut mulai melemah karena bebatuan longsor. Kumpulkan kekuatan alam hutan dengan memanen & membersihkan batu/kayu, lalu temui Nenek Maya di Pondok Ramuan dekat Air Terjun.',
    objectiveText: 'Kumpulkan minimal 6 Kayu/Batu & 2 Jamur/Beri Hutan, lalu bicara ke Nenek Maya.',
    unlockHint: 'Membuka: Jalur Tambang Kristal Timur Laut & Benih Nanas Tropis!',
    rewardGold: 320,
    rewardScore: 650,
  },
  {
    chapter: 3,
    title: 'Bab 3: Layar Pelabuhan & Kincir Angin',
    mustikaName: 'Mustika Angin',
    speakerNpc: 'bima',
    summary:
      'Jalur Pelabuhan Karang telah terbuka! Namun Kincir Angin Tebing Timur terhenti dan kapal dagang Kapten Bima kekurangan bahan pangan laut. Gunakan Pancingan [8] di Dermaga/Sungai untuk menangkap ikan dan temui Kapten Bima di Pelabuhan Selatan.',
    objectiveText: 'Tangkap minimal 2 Ikan dengan Pancingan [8] dan miliki total 10 Panen, lalu temui Kapten Bima.',
    unlockHint: 'Membuka: Kincir Angin Berputar, Benih Kopi Gunung & Berkah Kandang Ayam!',
    rewardGold: 450,
    rewardScore: 850,
  },
  {
    chapter: 4,
    title: 'Bab 4: Bara Tambang & Ilmuwan Altar',
    mustikaName: 'Mustika Mentari',
    speakerNpc: 'lira',
    summary:
      'Lira sang peneliti meneliti Prasasti Altar Utara dan menemukan bahwa Mustika Mentari membutuhkan resonansi Kristal Bintang dan peralatan kebun modern. Tambang bijih di Tebing Timur Laut dan buat 1 karya di Meja Kerajinan [C]!',
    objectiveText: 'Tambang 3 Bijih/Kristal di Tambang Timur Laut & buat 1 Kerajinan [C], lalu temui Lira di Altar Utara.',
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
      'Keempat Mustika telah bersinar! Pergilah ke puncak utara menuju Pohon Cahaya Abadi di tengah Altar Batu dan sentuh batangnya untuk memulihkan Pulau TIK selamanya!',
    objectiveText: 'Sentuh/Klik Pohon Cahaya Abadi di Altar Utara (x:27, y:6) untuk menyatukan 4 Mustika!',
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
  baseX: number;
  baseY: number;
  patrolRadius: number;
  favoriteCategory: string;
  color: string;
  greetingsByChapter: Record<number, string>;
  chitChatLines: string[];
  secretLore: string;
}

export const NPCS: Record<NpcId, NpcConfig> = {
  raka: {
    id: 'raka',
    name: 'Tetua Raka',
    role: 'Tetua & Penjaga Sejarah Desa',
    homeRegion: 'Alun-Alun Desa Purnama',
    baseX: 31.5,
    baseY: 17.5,
    patrolRadius: 2.0,
    favoriteCategory: 'Kopi / Labu',
    color: '#22c55e',
    greetingsByChapter: {
      1: 'Selamat datang kembali di Pulau TIK, cucu Kakek Dharma! Lembah ini merindukan tangan terampilmu. Cangkul tanah dan panenlah 4 tanaman pertamamu!',
      2: 'Mustika Tanah telah menyala! Kini Nenek Maya di Hutan Rimba Barat Laut membutuhkan bantuanmu untuk menenangkan Air Terjun.',
      3: 'Pelabuhan Karang akhirnya tersambung lagi! Kapten Bima pasti sangat senang melihat kapal dagangnya bisa berlayar kembali.',
      4: 'Lira melihat kilau cahaya dari Tebing Tambang Timur Laut. Temui dia di Altar Utara setelah kau menyiapkan bijih kristal.',
      5: 'Keempat Mustika telah berkumpul! Pergilah ke Pohon Cahaya Abadi di utara Altar dan pulihkan Pulau TIK selamanya!',
    },
    chitChatLines: [
      'Dulu Kakek Dharma sering minum kopi di bawah Pohon Cahaya setiap sore sambil menghitung kunang-kunang.',
      'Masuklah ke dalam Rumah Kayu dan tidur di kasur bila lelah atau ingin mempercepat waktu ke pagi maupun malam!',
      'Setiap gedung di Pulau TIK kini bisa kamu masuki—coba kunjungi Toko Benih, Balai Tetua, sampai Menara Mercusuar!',
    ],
    secretLore:
      'Rahasia Tetua: Dahulu keempat Mustika ditempa bersama oleh para petani, pelaut, penambang, dan peramu obat agar Pulau TIK selalu makmur.',
  },
  sari: {
    id: 'sari',
    name: 'Mbak Sari',
    role: 'Pemilik Toko Benih Desa',
    homeRegion: 'Toko Benih Desa',
    baseX: 26.5,
    baseY: 16.4,
    patrolRadius: 1.4,
    favoriteCategory: 'Stroberi / Bunga Matahari',
    color: '#ec4899',
    greetingsByChapter: {
      1: 'Halo petani baru! Aku Mbak Sari. Kamu bisa masuk ke dalam Toko Benih untuk berbelanja atau bicara langsung denganku di sini!',
      2: 'Kabar baik! Setelah jembatan diperbaiki, aku menerima kiriman bibit Nanas Tropis khas Pulau TIK!',
      3: 'Kudengar Kincir Angin akan berputar lagi! Aku baru saja menambah stok bibit Kopi Gunung di rak toko.',
      4: 'Kebunmu tampak semakin makmur setiap hari! Cobalah olah Stroberi menjadi Selai di Meja Kerajinan [C].',
      5: 'Wah, Pohon Cahaya bersinar terang! Bibit legendaris Buah Purnama kini tersedia khusus untukmu di Tokoku!',
    },
    chitChatLines: [
      'Stroberi dan Jagung bisa dipanen berkali-kali tanpa menanam ulang. Hemat tenaga dan sangat menguntungkan!',
      'Pupuk Subur memperbesar peluang panen Kualitas Emas yang harganya 1,5 kali lipat lebih mahal.',
      'Di dalam Tokoku ada rak bibit dan meja kasir. Datanglah kapan saja saat siang maupun malam!',
    ],
    secretLore:
      'Tip Rahasia Mbak Sari: Bunga Matahari sering menjatuhkan benih gratis saat dipanen — cocok untuk menambah stok tanpa biaya!',
  },
  jaka: {
    id: 'jaka',
    name: 'Pak Jaka',
    role: 'Tukang Kayu & Pengrajin Hutan',
    homeRegion: 'Hutan Rimba Utara',
    baseX: 15.5,
    baseY: 7.5,
    patrolRadius: 1.8,
    favoriteCategory: 'Kentang / Kayu / Olahan',
    color: '#f97316',
    greetingsByChapter: {
      1: 'Salam hangat! Aku sedang menyiapkan balok kayu jati untuk memperbaiki Jembatan Selatan begitu kau membuktikan tekadmu di kebun.',
      2: 'Jembatan Selatan sudah kokoh kembali! Sekarang bantu Nenek Maya di barat hutan membersihkan bebatuan sungai.',
      3: 'Masuklah ke Bengkel Kayuku kalau mau melihat paron besi dan merakit Sprinkler Emas!',
      4: 'Tebing Tambang Timur Laut penuh bijih tembaga, perak, dan kristal bintang. Gunakan Beliung [3] untuk menambangnya!',
      5: 'Karya tanganmu membangun kembali seluruh Pulau TIK, kawan muda. Aku bangga menjadi sahabatmu!',
    },
    chitChatLines: [
      'Kandang Ayam di sebelah timur rumahmu bisa dimasuki! Periksa kotak sarang jerami untuk mengambil telur segar.',
      'Batu dan kayu kering yang dibersihkan dengan Beliung [3] langsung masuk ke tas sebagai bahan kerajinan.',
      'Jika batu tambang terlihat berkilau biru atau ungu, itu tanda Bijih Perak atau Kristal Bintang langka!',
    ],
    secretLore:
      'Rahasia Pak Jaka: Aku yang membantu Kakek Dharma membangun Dermaga Kolam dan Rumah Kebun 20 tahun lalu!',
  },
  maya: {
    id: 'maya',
    name: 'Nenek Maya',
    role: 'Ahli Herbal & Penjaga Air Terjun',
    homeRegion: 'Pondok Air Terjun Hutan',
    baseX: 8.5,
    baseY: 10.2,
    patrolRadius: 1.4,
    favoriteCategory: 'Jamur / Beri / Jamu',
    color: '#a855f7',
    greetingsByChapter: {
      1: 'Hutan Rimba Pulau TIK menyimpan banyak jamur merah dan beri biru. Kumpulkan saja bila melihatnya di bawah pohon!',
      2: 'Ah, kau datang tepat waktu! Kumpulkan 6 Kayu/Batu serta 2 Jamur/Beri Hutan agar kita bisa membuka aliran Air Terjun & Jalur Tambang!',
      3: 'Air Terjun kembali bernyanyi jernih! Mustika Tirta kini menjaga kesegaran seluruh sungai Pulau TIK.',
      4: 'Masuklah ke Pondok Ramuanku bila ingin meracik Jamu Cahaya Herbal di Kuali Ramuan mendidih!',
      5: 'Kabut Layu telah sirna berkat ketulusan hatimu merawat tanah, air, dan warga Pulau TIK.',
    },
    chitChatLines: [
      'Memakan buah liar atau jamur bisa langsung memulihkan stamina di tengah hari tanpa perlu tidur cepat.',
      'Saat malam tiba setelah pukul 06:00 Malam, kunang-kunang bercahaya dan Koi Cahaya Suci lebih sering muncul di air!',
      'Setiap tanaman punya iramanya sendiri. Jangan terburu-buru; nikmati siang dan malam di Pulau TIK.',
    ],
    secretLore:
      'Rahasia Nenek Maya: Air mata Pohon Cahaya hanya muncul bila keempat penjaga desa kembali saling menyapa dengan tulus.',
  },
  bima: {
    id: 'bima',
    name: 'Kapten Bima',
    role: 'Nakhoda Pelabuhan Karang',
    homeRegion: 'Pelabuhan Pantai Selatan',
    baseX: 28.5,
    baseY: 31.8,
    patrolRadius: 2.0,
    favoriteCategory: 'Ikan / Kerang / Nanas',
    color: '#0284c7',
    greetingsByChapter: {
      1: 'Ahoy! Jembatan Selatan masih terputus, tapi sebentar lagi kapal kita bisa bertemu di Pantai Pulau TIK!',
      2: 'Selamat datang di Pantai Pasir Putih Pulau TIK! Cobalah memancing di Dermaga Kayu ini dengan tombol [8]!',
      3: 'Lautan butuh angin kencang! Tangkap 2 Ikan dengan pancingan [8] dan panen 10 kali untuk membangkitkan Mustika Angin & membuka Kopi Gunung!',
      4: 'Angin laut bertiup kencang memutar Kincir Angin! Banyak kapal dagang kini mencari Selai Stroberi dan Kopi Nusantara!',
      5: 'Dari mercusuar selatan sampai altar utara, kisahmu di Pulau TIK kini dinyanyikan para pelaut di seluruh samudra!',
    },
    chitChatLines: [
      'Lempar kail [8] ke arah air biru dan tunggu tanda "!" muncul sebelum menariknya dengan Spasi atau klik!',
      'Coba masuk ke Menara Mercusuar di tenggara pantai—di dalamnya ada teleskop samudra dan meja navigasi!',
      'Kabarnya di ujung dermaga laut selatan, Udang Karang Emas dan Koi Cahaya muncul saat malam atau hujan.',
    ],
    secretLore:
      'Rahasia Kapten Bima: Mercusuar Pelabuhan dulu dipandu langsung oleh cahaya biru dari puncak Pohon Cahaya Abadi di utara.',
  },
  lira: {
    id: 'lira',
    name: 'Lira',
    role: 'Peneliti Botani & Prasasti Kuno',
    homeRegion: 'Altar Pohon Cahaya Utara',
    baseX: 24.5,
    baseY: 9.2,
    patrolRadius: 2.1,
    favoriteCategory: 'Kristal Bintang / Bunga Matahari',
    color: '#eab308',
    greetingsByChapter: {
      1: 'Wah, halo! Aku Lira. Aku sedang meneliti prasasti kuno tentang 4 Mustika di sekitar Pohon Cahaya Pulau TIK.',
      2: 'Prasasti ini mencatat bahwa setiap Mustika terhubung dengan alam: Tanah kebun, Air hutan, Angin pantai, dan Mentari tambang!',
      3: 'Coba lihat Kincir Angin di bukit timur—aliran anginnya langsung menyentuh cabang Pohon Cahaya di sini!',
      4: 'Kita hampir berhasil! Tambang 3 Bijih/Kristal di Tebing Timur Laut dan buat 1 karya di Meja Kerajinan [C], lalu temui aku untuk membangunkan Mustika Mentari!',
      5: 'Semua 4 Mustika menyala sempurna! Sekarang sentuh Pohon Cahaya Abadi di belakangku untuk melihat keajaiban Pulau TIK!',
    },
    chitChatLines: [
      'Satu siklus siang di Pulau TIK berjalan 12 jam penuh (20 menit waktu nyata), diikuti 12 jam malam yang tenang!',
      'Sprinkler Emas hasil gabungan Perak dan Kristal Bintang mampu mengairi 8 petak sekaligus!',
      'Perhatikan Altar batu—setiap Mustika yang bangkit akan menyalakan obor kristalnya secara nyata saat malam!',
    ],
    secretLore:
      'Catatan Penelitian Lira: Buah Purnama hanya bisa tumbuh ketika energi keempat Mustika kembali mengalir ke dalam tanah Pulau TIK.',
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
    id: 'farm',
    name: 'Lembah Kebun Warisan',
    x: 5,
    y: 12,
    w: 15,
    h: 13,
    color: '#84cc16',
    desc: 'Rumah Kayu (bisa dimasuki & ada tempat tidur), Lahan Kebun, Kandang Ayam, Meja Kerajinan & Kolam.',
  },
  {
    id: 'village',
    name: 'Desa Purnama',
    x: 23,
    y: 12,
    w: 24,
    h: 12,
    color: '#f59e0b',
    desc: 'Alun-Alun Desa, Toko Benih Mbak Sari & Balai Tetua Raka (semua gedung bisa dimasuki).',
  },
  {
    id: 'forest',
    name: 'Hutan Rimba & Air Terjun',
    x: 4,
    y: 2,
    w: 16,
    h: 10,
    color: '#10b981',
    desc: 'Bengkel Pak Jaka, Pondok Ramuan Nenek Maya, Air Terjun Kristal & Foraging.',
  },
  {
    id: 'altar',
    name: 'Altar Pohon Cahaya',
    x: 21,
    y: 2,
    w: 13,
    h: 10,
    color: '#ec4899',
    desc: 'Situs Suci 4 Mustika & Pohon Cahaya Abadi Pulau TIK bersama Peneliti Lira.',
  },
  {
    id: 'mine',
    name: 'Tambang Kristal & Kincir',
    x: 35,
    y: 2,
    w: 14,
    h: 10,
    color: '#8b5cf6',
    desc: 'Kincir Angin & Tambang Bijih Tembaga, Perak serta Kristal Bintang.',
  },
  {
    id: 'beach',
    name: 'Pantai & Pelabuhan TIK',
    x: 4,
    y: 28,
    w: 45,
    h: 8,
    color: '#06b6d4',
    desc: 'Pantai Teluk Karang, Pohon Kelapa, Menara Mercusuar, Dermaga Mancing & Kapal Kapten Bima.',
  },
];

// Enterable Building Interiors with Themed Furniture!
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
    outdoorExit: { x: 7.5, y: 16.4 },
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
        interactAction: 'info',
        infoText: 'Api perapian berkobar hangat menerangi malam di Pulau TIK.',
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
        interactAction: 'info',
        infoText: 'Siaran Pulau TIK: "Siang dan malam masing-masing 12 jam! Gunakan tempat tidur untuk mempercepat waktu."',
      },
      {
        id: 'h_table',
        kind: 'table_food',
        name: 'Meja Makan Kayu',
        x: 5,
        y: 4,
        w: 2,
        h: 2,
        interactAction: 'info',
        infoText: 'Tersedia roti hangat dan teh melati di meja makan keluarga.',
      },
      {
        id: 'h_plant',
        kind: 'plant',
        name: 'Pot Tanaman Hias',
        x: 1,
        y: 6,
        w: 1,
        h: 1,
      },
      {
        id: 'h_chest',
        kind: 'chest',
        name: 'Peti Kenangan Kakek',
        x: 10,
        y: 5,
        w: 2,
        h: 1,
        interactAction: 'info',
        infoText: 'Catatan Kakek Dharma: "Rawat 4 Mustika Pulau TIK agar Pohon Cahaya kembali mekar!"',
      },
    ],
  },
  shop: {
    id: 'shop',
    title: 'Toko Benih Mbak Sari',
    themeLabel: 'Toko Pertanian & Benih Desa',
    cols: 13,
    rows: 9,
    floorStyle: 'wood',
    wallColor: '#7c2d12',
    wallAccent: '#ec4899',
    exitTile: { x: 6, y: 8 },
    outdoorExit: { x: 26.5, y: 16.4 },
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
        name: 'Peti Sayur Segar',
        x: 9,
        y: 4,
        w: 2,
        h: 2,
        interactAction: 'shop',
      },
      { id: 's_plant', kind: 'plant', name: 'Bunga Toko', x: 1, y: 1, w: 1, h: 1 },
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
    outdoorExit: { x: 32.5, y: 16.4 },
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
        name: 'Meja Peta Pulau TIK',
        x: 5,
        y: 4,
        w: 3,
        h: 2,
        interactAction: 'journal',
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
      },
      { id: 'e_plant', kind: 'plant', name: 'Tanaman Adat', x: 1, y: 6, w: 1, h: 1 },
      { id: 'e_plant2', kind: 'plant', name: 'Tanaman Adat', x: 11, y: 6, w: 1, h: 1 },
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
    outdoorExit: { x: 8.5, y: 10.4 },
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
        name: 'Rak Botol Jamu',
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
        interactAction: 'info',
        infoText: 'Aroma wangi jamur merah, beri biru, dan rempah hutan Pulau TIK memenuhi ruangan.',
      },
      { id: 'm_bed', kind: 'bed', name: 'Ranjang Nenek Maya', x: 1, y: 5, w: 2, h: 2 },
      { id: 'm_plant', kind: 'plant', name: 'Daun Herbal', x: 10, y: 5, w: 1, h: 1 },
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
    outdoorExit: { x: 15.5, y: 7.4 },
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
      },
      {
        id: 'j_anvil',
        kind: 'anvil',
        name: 'Paron Besi & Palu',
        x: 8,
        y: 3,
        w: 2,
        h: 2,
        interactAction: 'craft',
      },
      { id: 'j_wood', kind: 'wood_stack', name: 'Tumpukan Balok Jati', x: 1, y: 5, w: 2, h: 2 },
      { id: 'j_bed', kind: 'bed', name: 'Ranjang Pak Jaka', x: 9, y: 5, w: 2, h: 2 },
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
    outdoorExit: { x: 43.5, y: 32.3 },
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
        interactAction: 'info',
        infoText: 'Lampu suar raksasa memandu kapal Kapten Bima menembus kabut malam Pulau TIK!',
      },
      {
        id: 'l_nav',
        kind: 'nav_table',
        name: 'Meja Kompas & Peta Laut',
        x: 5,
        y: 3,
        w: 2,
        h: 2,
        interactAction: 'telescope',
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
      { id: 'l_books', kind: 'bookshelf', name: 'Lemari Log Pelayaran', x: 1, y: 1, w: 2, h: 1 },
      { id: 'l_bed', kind: 'bed', name: 'Ranjang Penjaga Suar', x: 1, y: 5, w: 2, h: 2 },
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
    outdoorExit: { x: 14.5, y: 16.4 },
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
        interactAction: 'info',
        infoText: 'Pakan jagung penuh membuat ayam-ayam menghasilkan telur segar tiap pagi!',
      },
      { id: 'c_hay1', kind: 'hay_bale', name: 'Jerami Emas', x: 1, y: 5, w: 2, h: 2 },
      { id: 'c_hay2', kind: 'hay_bale', name: 'Jerami Emas', x: 10, y: 5, w: 2, h: 2 },
    ],
  },
};

// Organic island terrain helper — natural non-boxy coastline with coves, capes, and offshore reef islet!
export function isOrganicPulauTikLand(x: number, y: number): boolean {
  // Keep outer frame ocean so waves surround the whole island
  if (x <= 1 || x >= WORLD_COLS - 2 || y <= 0 || y >= WORLD_ROWS - 2) return false;

  // Keep Harbor Pier & Captain's Ship cove accessible in the southern bay
  if (x >= 27 && x <= 29 && y >= 33 && y <= 36) return true; // Pier sits over water, handled separately

  // Tiny scenic offshore islet ("Pulau Karang Kecil") in South-West corner
  const dIslet = Math.hypot((x - 6.5) / 2.6, (y - 35.0) / 1.4);
  if (dIslet <= 1.0) return true;

  // Core organic mainland lobes (combined smooth radial blobs + coastal wobble)
  const wobble = Math.sin(x * 0.42 + y * 0.25) * 0.11 + Math.cos(y * 0.55 - x * 0.18) * 0.08;

  // Main central landmass (Lembah Kebun + Desa Purnama)
  const dMain = Math.hypot((x - 26.5) / 22.8, (y - 19.5) / 12.6) + wobble;
  // North-West Forest Cape
  const dForest = Math.hypot((x - 11.5) / 9.2, (y - 7.5) / 6.2) + wobble * 0.7;
  // North-Central Sacred Peak
  const dAltar = Math.hypot((x - 27.5) / 7.8, (y - 6.8) / 5.5) + wobble * 0.6;
  // North-East Quarry Peninsula
  const dQuarry = Math.hypot((x - 42.5) / 8.8, (y - 7.2) / 5.8) + wobble * 0.7;
  // Southern Crescent Beach & Lighthouse Cape
  const dBeachW = Math.hypot((x - 15.0) / 10.5, (y - 29.8) / 4.2) + wobble * 0.65;
  const dBeachE = Math.hypot((x - 39.5) / 10.8, (y - 30.0) / 4.3) + wobble * 0.65;

  // Carve dramatic natural bays on West Coast (y: 12..14 or 24..26) & East Coast (y: 23..26)
  const inWestBay = x <= 4 && y >= 15 && y <= 24;
  const inSouthHarborBay = y >= 33 && x >= 21 && x <= 35;

  if (inWestBay || inSouthHarborBay) return false;

  return (
    dMain <= 1.0 ||
    dForest <= 1.0 ||
    dAltar <= 1.0 ||
    dQuarry <= 1.0 ||
    dBeachW <= 1.0 ||
    dBeachE <= 1.0
  );
}

// Deterministic Organic Fictional Island Generator for Pulau TIK (54 x 38)
export function createInitialIslandGrid(): FarmTile[] {
  const tiles: FarmTile[] = [];

  // First pass: organic land vs ocean + biomes
  const landGrid: boolean[][] = Array.from({ length: WORLD_ROWS }, (_, y) =>
    Array.from({ length: WORLD_COLS }, (_, x) => isOrganicPulauTikLand(x, y))
  );

  // Guarantee core walkable pads around key story coordinates remain land
  const ensureLandRect = (x0: number, y0: number, x1: number, y1: number) => {
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (y > 0 && y < WORLD_ROWS - 2 && x > 1 && x < WORLD_COLS - 2) {
          landGrid[y][x] = true;
        }
      }
    }
  };
  ensureLandRect(5, 13, 19, 24); // Homestead Farm Valley
  ensureLandRect(24, 13, 45, 23); // Desa Purnama
  ensureLandRect(5, 3, 18, 11); // Hutan Rimba & Waterfall
  ensureLandRect(23, 3, 32, 10); // Altar Pohon Cahaya
  ensureLandRect(36, 3, 47, 11); // Quarry & Windmill
  ensureLandRect(6, 28, 46, 32); // Southern Beach Strip

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
        // Organic Beach Sand wherever land meets ocean in south/west/east, or southern coast y >= 29
        const coastSand =
          y >= 29 ||
          (isNearOcean(x, y) && !(x >= 35 && y <= 11) && !(x >= 18 && x <= 34 && y <= 3));

        if (coastSand) {
          kind = 'sand';
        } else if (y >= 2 && y <= 11 && x >= 3 && x <= 20) {
          kind = 'forest_floor';
        } else if (y >= 2 && y <= 11 && x >= 35 && x <= 50) {
          kind = 'plaza';
        } else if (y >= 2 && y <= 11 && x >= 21 && x <= 34) {
          kind = x >= 24 && x <= 30 && y >= 5 && y <= 9 ? 'plaza' : 'grass';
        } else if (x >= 25 && x <= 36 && y >= 15 && y <= 21) {
          kind = 'plaza';
        }

        // Natural Winding Island River
        // 1) Southern meandering channel separating mainland & beach (y ~ 25..27 with gentle curve)
        const riverCenterY = 26 + Math.round(Math.sin(x * 0.28) * 0.7);
        if (y === riverCenterY || y === riverCenterY + 1) {
          if (y >= 25 && y <= 27) kind = 'river';
        }
        // 2) Tributary stream curving slightly between Homestead (West) & Village (East)
        const streamCenterX = 21 + Math.round(Math.sin(y * 0.35) * 0.6);
        if ((x === streamCenterX || x === streamCenterX + 1) && y >= 10 && y <= 25) {
          kind = 'river';
        }
      }

      // Bridges, Passes & Harbor Pier
      if ((x === 20 || x === 21 || x === 22) && (y === 18 || y === 19)) kind = 'bridge';
      if (x >= 11 && x <= 12 && y === 11) kind = 'path';
      // Southern Harbor Bridge (Broken in Bab 1 -> Unlocked in Bab 2!)
      if (x >= 27 && x <= 29 && y >= 25 && y <= 27) kind = 'bridge';
      // Eastern Quarry Cliff Pass (Blocked in Bab 1-2 -> Unlocked in Bab 3!)
      if (x === 34 && (y === 7 || y === 8)) kind = 'cliff_pass';
      // Harbor Wooden Pier jutting into Southern Bay
      if (x >= 27 && x <= 29 && y >= 33 && y <= 36) kind = 'pier';

      // Main Cobble/Dirt Roads
      if (
        kind !== 'ocean' &&
        kind !== 'river' &&
        kind !== 'bridge' &&
        kind !== 'pier' &&
        kind !== 'cliff_pass'
      ) {
        if (y === 18 && x >= 7 && x <= 43) kind = 'path';
        if (x === 11 && y >= 8 && y <= 24) kind = 'path';
        if (x === 28 && y >= 10 && y <= 32) kind = 'path';
        if (y === 8 && x >= 12 && x <= 43) kind = 'path';
      }

      // Landmarks (Buildings & Interactive Stations)
      if (x >= 6 && x <= 8 && y >= 13 && y <= 15) kind = 'house';
      else if (x === 10 && (y === 14 || y === 15)) kind = 'bin';
      else if (x >= 13 && x <= 15 && y >= 13 && y <= 15) kind = 'coop';
      else if (x === 17 && (y === 14 || y === 15)) kind = 'workbench';
      else if (x >= 5 && x <= 7 && y >= 21 && y <= 23) kind = 'pond';
      else if (x >= 25 && x <= 27 && y >= 13 && y <= 15) kind = 'shop';
      else if (x >= 31 && x <= 33 && y >= 13 && y <= 15) kind = 'elder_hall';
      else if (x === 29 && y === 17) kind = 'well';
      else if (x >= 5 && x <= 7 && y >= 3 && y <= 5) kind = 'pond';
      else if (x >= 7 && x <= 9 && y >= 7 && y <= 9) kind = 'maya_hut';
      else if (x >= 14 && x <= 16 && y >= 4 && y <= 6) kind = 'jaka_cabin';
      else if (x >= 26 && x <= 28 && y >= 4 && y <= 6) kind = 'sacred_tree';
      else if (
        (x === 24 && y === 8) ||
        (x === 25 && y === 9) ||
        (x === 29 && y === 9) ||
        (x === 30 && y === 8)
      )
        kind = 'altar';
      else if (x >= 38 && x <= 40 && y >= 4 && y <= 6) kind = 'windmill';
      else if (x >= 42 && x <= 44 && y >= 29 && y <= 31) kind = 'lighthouse';
      else if (x >= 31 && x <= 34 && y >= 34 && y <= 36) kind = 'ship';

      // Starter Tilled Garden Plot
      if (kind === 'grass' && x >= 9 && x <= 13 && y >= 19 && y <= 22) {
        tilled = true;
      }

      // Natural Debris, Mining Ores & Foraging
      const hash = (x * 41 + y * 67 + x * y * 13) % 37;
      if (kind === 'grass' && !tilled && x >= 5 && x <= 19 && y >= 13 && y <= 24) {
        if (hash === 3 || hash === 19) debris = 'stone';
        else if (hash === 7 || hash === 24) debris = 'wood';
        else if (hash === 11 || hash === 29) debris = 'weed';
      } else if (kind === 'forest_floor') {
        if (hash === 2 || hash === 15) debris = 'forage_mushroom';
        else if (hash === 6 || hash === 21) debris = 'forage_berry';
        else if (hash === 10 || hash === 27) debris = 'wood';
        else if (hash === 14) debris = 'stone';
      } else if (kind === 'plaza' && x >= 36 && x <= 48 && y >= 3 && y <= 11 && y !== 8) {
        if (hash === 1 || hash === 12 || hash === 25) debris = 'ore_copper';
        else if (hash === 5 || hash === 18) debris = 'ore_silver';
        else if (hash === 9 || hash === 31) debris = 'ore_star';
        else if (hash === 14 || hash === 22) debris = 'stone';
      } else if (kind === 'sand' && (y === 30 || y === 31) && x >= 7 && x <= 40 && x !== 28) {
        if (hash === 4 || hash === 16 || hash === 28) debris = 'forage_shell';
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
