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
    desc: 'Cepat panen dalam 2 hari. Cocok untuk modal awal kebun.',
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
    desc: 'Bibit khas pantai Swarnadwipa. Terbuka mulai Bab 2!',
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
    desc: 'Buah legendaris berkilau dari Pohon Cahaya Abadi.',
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
    desc: 'Ikan pesisir favorit Kapten Bima di Pelabuhan Karang.',
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
    desc: 'Ikan mistis bercahaya keemasan di sekitar air terjun & laut dalam.',
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
    desc: 'Kerang berkilau di pasir Pantai Selatan.',
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
    desc: 'Batu kristal kuno penyimpan energi cahaya Swarnadwipa.',
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
    desc: 'Olah hasil hutan & batu menjadi 3 Pupuk Emas.',
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
      'Kakek Dharma mewariskan kebun tua ini di Pulau Swarnadwipa. Sejak Kabut Layu melanda, jembatan menuju Pantai Selatan terputus dan tanah lembah tertidur. Bangkitkan Mustika Tanah dengan memanen hasil kebun pertama dan berbicara pada Tetua Raka di Alun-Alun Desa!',
    objectiveText: 'Panen minimal 4 tanaman kebun lalu temui Tetua Raka di Balai Desa.',
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
    mustikaName: 'Cahaya Swarnadwipa',
    speakerNpc: 'raka',
    summary:
      'Keempat Mustika telah bersinar! Pergilah ke puncak utara menuju Pohon Cahaya Abadi di tengah Altar Batu dan sentuh batangnya untuk memulihkan Pulau Swarnadwipa selamanya!',
    objectiveText: 'Sentuh/Klik Pohon Cahaya Abadi di Altar Utara (x:27, y:6) untuk menyatukan 4 Mustika!',
    unlockHint: 'Membuka: Festival Cahaya Abadi, Benih Legendaris Buah Purnama & Gelar Penjaga Pulau!',
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
    patrolRadius: 2.2,
    favoriteCategory: 'Kopi / Labu',
    color: '#22c55e',
    greetingsByChapter: {
      1: 'Selamat datang kembali, cucu Kakek Dharma! Lembah ini merindukan tangan terampilmu. Cangkul tanah dan panenlah 4 tanaman pertamamu!',
      2: 'Mustika Tanah telah menyala! Kini Nenek Maya di Hutan Rimba Barat Laut membutuhkan bantuanmu untuk menenangkan Air Terjun.',
      3: 'Pelabuhan Karang akhirnya tersambung lagi! Kapten Bima pasti sangat senang melihat kapal dagangnya bisa berlayar kembali.',
      4: 'Lira melihat kilau cahaya dari Tebing Tambang Timur Laut. Temui dia di Altar Utara setelah kau menyiapkan bijih kristal.',
      5: 'Keempat Mustika telah berkumpul! Pergilah ke Pohon Cahaya Abadi di utara Altar dan pulihkan pulau kita selamanya!',
    },
    chitChatLines: [
      'Dulu Kakek Dharma sering minum kopi di bawah Pohon Cahaya setiap sore sambil menghitung kunang-kunang.',
      'Jangan lupa beristirahat di Rumah Kayu bila energi tinggal sedikit. Hujan pagi akan menyiram kebunmu otomatis!',
      'Setiap warga di Pulau Swarnadwipa punya kesukaan masing-masing. Memberi hadiah hasil panen akan mempererat persahabatan!',
    ],
    secretLore:
      'Rahasia Tetua: Dahulu keempat Mustika ditempa bersama oleh para petani, pelaut, penambang, dan peramu obat agar pulau ini selalu makmur.',
  },
  sari: {
    id: 'sari',
    name: 'Mbak Sari',
    role: 'Pemilik Toko Benih Desa',
    homeRegion: 'Toko Benih Desa',
    baseX: 26.5,
    baseY: 16.3,
    patrolRadius: 1.5,
    favoriteCategory: 'Stroberi / Bunga Matahari',
    color: '#ec4899',
    greetingsByChapter: {
      1: 'Halo petani baru! Aku Mbak Sari. Di tokoku tersedia berbagai bibit unggul, pupuk emas, hingga sprinkler!',
      2: 'Kabar baik! Setelah jembatan diperbaiki, aku menerima kiriman bibit Nanas Tropis yang segar!',
      3: 'Kudengar Kincir Angin akan berputar lagi! Aku baru saja menambah stok bibit Kopi Gunung di rak toko.',
      4: 'Kebunmu tampak semakin makmur setiap hari! Cobalah olah Stroberi menjadi Selai di Meja Kerajinan [C].',
      5: 'Wah, Pohon Cahaya bersinar terang! Bibit legendaris Buah Purnama kini tersedia khusus untukmu di Tokoku!',
    },
    chitChatLines: [
      'Stroberi dan Jagung bisa dipanen berkali-kali tanpa menanam ulang. Hemat tenaga dan sangat menguntungkan!',
      'Pupuk Subur memperbesar peluang panen Kualitas Emas yang harganya 1,5 kali lipat lebih mahal.',
      'Jika kamu sibuk menjelajah pulau, pasang Sprinkler di tengah bedengan supaya tanaman tetap tersiram tiap pagi.',
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
    patrolRadius: 2.0,
    favoriteCategory: 'Kentang / Kayu / Olahan',
    color: '#f97316',
    greetingsByChapter: {
      1: 'Salam hangat! Aku sedang menyiapkan balok kayu jati untuk memperbaiki Jembatan Selatan begitu kau membuktikan tekadmu di kebun.',
      2: 'Jembatan Selatan sudah kokoh kembali! Sekarang bantu Nenek Maya di barat hutan membersihkan bebatuan sungai.',
      3: 'Dengan kayu dari hutan dan bijih dari tambang, kau bisa merakit Sprinkler Emas di Meja Kerajinan sebelah kandang!',
      4: 'Tebing Tambang Timur Laut penuh bijih tembaga, perak, dan kristal bintang. Gunakan Beliung [3] untuk menambangnya!',
      5: 'Karya tanganmu membangun kembali seluruh pulau ini, kawan muda. Aku bangga menjadi sahabatmu!',
    },
    chitChatLines: [
      'Kandang Ayam di sebelah timur rumahmu siap menghasilkan telur segar tiap pagi—jangan lupa periksa dan kumpulkan!',
      'Batu dan kayu kering yang dibersihkan dengan Beliung [3] langsung masuk ke tas sebagai bahan kerajinan.',
      'Jika batu tambang terlihat berkilau biru atau ungu, itu tanda Bijih Perak atau Kristal Bintang langka!',
    ],
    secretLore:
      'Rahasia Pak Jaka: Aku yang membantu Kakek Dharma membangun Dermaga Kolam dan Kandang Ayam 20 tahun lalu!',
  },
  maya: {
    id: 'maya',
    name: 'Nenek Maya',
    role: 'Ahli Herbal & Penjaga Air Terjun',
    homeRegion: 'Pondok Air Terjun Hutan',
    baseX: 8.5,
    baseY: 10.2,
    patrolRadius: 1.6,
    favoriteCategory: 'Jamur / Beri / Jamu',
    color: '#a855f7',
    greetingsByChapter: {
      1: 'Hutan Rimba menyimpan banyak jamur merah dan beri biru. Kumpulkan saja bila melihatnya di bawah pohon apel!',
      2: 'Ah, kau datang tepat waktu! Kumpulkan 6 Kayu/Batu serta 2 Jamur/Beri Hutan agar kita bisa membuka aliran Air Terjun & Jalur Tambang!',
      3: 'Air Terjun kembali bernyanyi jernih! Mustika Tirta kini menjaga kesegaran seluruh sungai Pulau Swarnadwipa.',
      4: 'Campurkan Jamur Hutan dan Beri Liar di Meja Kerajinan untuk meracik Jamu Cahaya Herbal (+90 Energi)!',
      5: 'Kabut Layu telah sirna berkat ketulusan hatimu merawat tanah, air, dan warga desa.',
    },
    chitChatLines: [
      'Memakan buah liar atau jamur bisa langsung memulihkan stamina di tengah hari tanpa perlu tidur cepat.',
      'Sungai yang mengalir dari Air Terjun ini menyimpan Ikan Mas dan bahkan Koi Cahaya Suci yang pemalu.',
      'Setiap tanaman punya iramanya sendiri. Jangan terburu-buru; nikmati suara daun dan aliran air.',
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
    patrolRadius: 2.3,
    favoriteCategory: 'Ikan / Kerang / Nanas',
    color: '#0284c7',
    greetingsByChapter: {
      1: 'Ahoy! Jembatan Selatan masih terputus, tapi sebentar lagi kapal kita bisa bertemu!',
      2: 'Selamat datang di Pantai Pasir Putih, sobat darat! Cobalah memancing di Dermaga Kayu ini dengan tombol [8]!',
      3: 'Lautan butuh angin kencang! Tangkap 2 Ikan dengan pancingan [8] dan panen 10 kali untuk membangkitkan Mustika Angin & membuka Kopi Gunung!',
      4: 'Angin laut bertiup kencang memutar Kincir Angin! Banyak kapal dagang kini mencari Selai Stroberi dan Kopi Nusantara!',
      5: 'Dari mercusuar selatan sampai altar utara, kisahmu kini dinyanyikan para pelaut di seluruh samudra!',
    },
    chitChatLines: [
      'Lempar kail [8] ke arah air biru dan tunggu tanda "!" muncul sebelum menariknya dengan Spasi atau klik!',
      'Di pasir pantai selatan sering terdampar Kerang Mutiara berkilau setiap pagi.',
      'Kabarnya di ujung dermaga laut selatan, Udang Karang Emas sering muncul saat cuaca hujan.',
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
    patrolRadius: 2.5,
    favoriteCategory: 'Kristal Bintang / Bunga Matahari',
    color: '#eab308',
    greetingsByChapter: {
      1: 'Wah, halo! Aku Lira. Aku sedang meneliti prasasti kuno tentang 4 Mustika di sekitar Pohon Cahaya ini.',
      2: 'Prasasti ini mencatat bahwa setiap Mustika terhubung dengan alam: Tanah kebun, Air hutan, Angin pantai, dan Mentari tambang!',
      3: 'Coba lihat Kincir Angin di bukit timur—aliran anginnya langsung menyentuh cabang Pohon Cahaya di sini!',
      4: 'Kita hampir berhasil! Tambang 3 Bijih/Kristal di Tebing Timur Laut dan buat 1 karya di Meja Kerajinan [C], lalu temui aku untuk membangunkan Mustika Mentari!',
      5: 'Semua 4 Mustika menyala sempurna! Sekarang sentuh Pohon Cahaya Abadi di belakangku untuk melihat keajaiban Swarnadwipa!',
    },
    chitChatLines: [
      'Kakek Dharma meninggalkan catatan botani yang luar biasa rapi tentang cara mengolah pupuk organik.',
      'Sprinkler Emas hasil gabungan Perak dan Kristal Bintang mampu mengairi 8 petak sekaligus!',
      'Perhatikan Altar batu—setiap Mustika yang bangkit akan menyalakan obor kristalnya secara nyata!',
    ],
    secretLore:
      'Catatan Penelitian Lira: Buah Purnama hanya bisa tumbuh ketika energi keempat Mustika kembali mengalir ke dalam tanah pulau.',
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
    x: 4,
    y: 12,
    w: 17,
    h: 13,
    color: '#84cc16',
    desc: 'Rumah Kayu, Lahan Kebun Luas, Peti Jual, Kandang Ayam, Meja Kerajinan & Kolam.',
  },
  {
    id: 'village',
    name: 'Desa Purnama',
    x: 23,
    y: 12,
    w: 26,
    h: 13,
    color: '#f59e0b',
    desc: 'Alun-Alun Desa, Toko Benih Mbak Sari & Balai Tetua Raka.',
  },
  {
    id: 'forest',
    name: 'Hutan Rimba & Air Terjun',
    x: 3,
    y: 2,
    w: 17,
    h: 10,
    color: '#10b981',
    desc: 'Pondok Pak Jaka, Pondok Nenek Maya, Air Terjun Kristal & Foraging.',
  },
  {
    id: 'altar',
    name: 'Altar Pohon Cahaya',
    x: 21,
    y: 2,
    w: 13,
    h: 10,
    color: '#ec4899',
    desc: 'Situs Suci 4 Mustika & Pohon Cahaya Abadi bersama Peneliti Lira.',
  },
  {
    id: 'mine',
    name: 'Tambang Kristal & Kincir',
    x: 35,
    y: 2,
    w: 15,
    h: 10,
    color: '#8b5cf6',
    desc: 'Kincir Angin & Tambang Bijih Tembaga, Perak serta Kristal Bintang.',
  },
  {
    id: 'beach',
    name: 'Pantai & Pelabuhan Karang',
    x: 3,
    y: 28,
    w: 47,
    h: 8,
    color: '#06b6d4',
    desc: 'Pasir Putih, Pohon Kelapa, Mercusuar, Dermaga Mancing & Kapten Bima.',
  },
];

// Deterministic Big Fictional Island Map Generator (54 x 38)
export function createInitialIslandGrid(): FarmTile[] {
  const tiles: FarmTile[] = [];

  for (let y = 0; y < WORLD_ROWS; y++) {
    for (let x = 0; x < WORLD_COLS; x++) {
      let kind: TileKind = 'grass';
      let debris: DebrisKind = null;
      let tilled = false;

      // 1. Ocean Perimeter surrounding the island
      const isOuterOcean =
        x <= 1 || x >= WORLD_COLS - 2 || y <= 0 || y >= WORLD_ROWS - 3;
      if (isOuterOcean) {
        kind = 'ocean';
      } else if (y >= 29 && y <= 34) {
        // Southern Sandy Beach & Coastline
        kind = 'sand';
      } else if (y === 26 || y === 27) {
        // Wide Island River separating Mainland & Southern Coast
        kind = 'river';
      } else if (x >= 21 && x <= 22 && y >= 10 && y <= 25) {
        // Vertical Tributary Stream between Homestead & Village (with stone bridges!)
        kind = 'river';
      } else if (y >= 2 && y <= 11 && x >= 3 && x <= 20) {
        // North-West Misty Forest
        kind = 'forest_floor';
      } else if (y >= 2 && y <= 11 && x >= 35 && x <= 50) {
        // North-East Highland Quarry & Windmill Plateau
        kind = 'plaza';
      } else if (y >= 2 && y <= 11 && x >= 21 && x <= 34) {
        // Sacred Altar Courtyard
        kind = x >= 24 && x <= 30 && y >= 5 && y <= 9 ? 'plaza' : 'grass';
      } else if (x >= 25 && x <= 36 && y >= 15 && y <= 21) {
        // Village Square Cobble Plaza
        kind = 'plaza';
      }

      // 2. Bridges & Docks & Main Cobblestone Roads
      // Bridge between Homestead (West) & Village (East)
      if ((x === 21 || x === 22) && (y === 18 || y === 19)) kind = 'bridge';
      // Bridge from Homestead to Forest North-West
      if (x >= 11 && x <= 12 && y === 11) kind = 'path';
      // Southern Harbor Bridge (Blocked initially in Chapter 1 -> Unlocked in Chapter 2!)
      if (x >= 27 && x <= 29 && (y === 26 || y === 27)) kind = 'bridge';
      // Eastern Quarry Mountain Pass (x: 34, y: 7..8 -> cliff_pass until Chapter 2!)
      if (x === 34 && (y === 7 || y === 8)) kind = 'cliff_pass';

      // Harbor Wooden Pier jutting into Southern Ocean (x: 27..29, y: 33..36)
      if (x >= 27 && x <= 29 && y >= 33 && y <= 36) kind = 'pier';

      // Main Dirt/Cobble Roads connecting everything cleanly
      if (kind !== 'ocean' && kind !== 'river' && kind !== 'bridge' && kind !== 'pier' && kind !== 'cliff_pass') {
        if (y === 18 && x >= 7 && x <= 44) kind = 'path'; // Grand East-West Road
        if (x === 11 && y >= 8 && y <= 24) kind = 'path'; // Homestead -> Forest Path
        if (x === 28 && y >= 10 && y <= 32) kind = 'path'; // Sacred Altar -> Village -> Harbor Pier Road
        if (y === 8 && x >= 12 && x <= 43) kind = 'path'; // Northern Forest -> Altar -> Quarry Road
      }

      // 3. Landmarks (Buildings & Interactive Stations)
      // HOMESTEAD (x: 5..20, y: 12..25)
      if (x >= 6 && x <= 8 && y >= 13 && y <= 15) kind = 'house';
      else if (x === 10 && (y === 14 || y === 15)) kind = 'bin';
      else if (x >= 13 && x <= 15 && y >= 13 && y <= 15) kind = 'coop';
      else if (x === 17 && (y === 14 || y === 15)) kind = 'workbench';
      else if (x >= 5 && x <= 7 && y >= 21 && y <= 23) kind = 'pond';

      // VILLAGE (x: 24..48, y: 12..25)
      else if (x >= 25 && x <= 27 && y >= 13 && y <= 15) kind = 'shop';
      else if (x >= 31 && x <= 33 && y >= 13 && y <= 15) kind = 'elder_hall';
      else if (x === 29 && y === 17) kind = 'well';

      // FOREST & WATERFALL (x: 3..20, y: 2..11)
      else if (x >= 5 && x <= 7 && y >= 3 && y <= 5) kind = 'pond'; // Mystic Waterfall Pool!
      else if (x >= 7 && x <= 9 && y >= 7 && y <= 9) kind = 'maya_hut';
      else if (x >= 14 && x <= 16 && y >= 4 && y <= 6) kind = 'jaka_cabin';

      // SACRED ALTAR (x: 22..33, y: 2..10)
      else if (x >= 26 && x <= 28 && y >= 4 && y <= 6) kind = 'sacred_tree';
      else if (
        (x === 24 && y === 8) ||
        (x === 25 && y === 9) ||
        (x === 29 && y === 9) ||
        (x === 30 && y === 8)
      )
        kind = 'altar';

      // QUARRY & WINDMILL (x: 35..49, y: 2..11)
      else if (x >= 38 && x <= 40 && y >= 4 && y <= 6) kind = 'windmill';

      // COAST & HARBOR (x: 3..49, y: 28..36)
      else if (x >= 42 && x <= 44 && y >= 29 && y <= 31) kind = 'lighthouse';
      else if (x >= 31 && x <= 34 && y >= 34 && y <= 36) kind = 'ship';

      // 4. Starter Tilled Garden Plot (right below Farmhouse: x: 9..13, y: 19..22)
      if (kind === 'grass' && x >= 9 && x <= 13 && y >= 19 && y <= 22) {
        tilled = true;
      }

      // 5. Natural Debris, Mining Ores & Foraging
      const hash = (x * 41 + y * 67 + x * y * 13) % 37;
      if (kind === 'grass' && !tilled && x >= 5 && x <= 20 && y >= 13 && y <= 25) {
        if (hash === 3 || hash === 19) debris = 'stone';
        else if (hash === 7 || hash === 24) debris = 'wood';
        else if (hash === 11 || hash === 29) debris = 'weed';
      } else if (kind === 'forest_floor') {
        if (hash === 2 || hash === 15) debris = 'forage_mushroom';
        else if (hash === 6 || hash === 21) debris = 'forage_berry';
        else if (hash === 10 || hash === 27) debris = 'wood';
        else if (hash === 14) debris = 'stone';
      } else if (kind === 'plaza' && x >= 36 && x <= 49 && y >= 3 && y <= 11 && y !== 8) {
        // Crystal Quarry Mining Nodes!
        if (hash === 1 || hash === 12 || hash === 25) debris = 'ore_copper';
        else if (hash === 5 || hash === 18) debris = 'ore_silver';
        else if (hash === 9 || hash === 31) debris = 'ore_star';
        else if (hash === 14 || hash === 22) debris = 'stone';
      } else if (kind === 'sand' && (y === 31 || y === 32) && x >= 6 && x <= 40 && x !== 28) {
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
