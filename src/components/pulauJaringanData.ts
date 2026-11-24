/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  BagItemDef,
  FarmTile,
  InteriorDef,
  IslandRegionLabel,
  JaringanBagItemId,
  JaringanFishId,
  JaringanGemId,
  JaringanInteriorId,
  JaringanNpcId,
  JaringanWoodId,
  NpcConfig,
  TileKind,
  Weather,
  WorldTree,
} from './berkebunWorldData';

export const JARINGAN_COLS = 110;
export const JARINGAN_ROWS = 76;
export const JARINGAN_FERRY_COST = 250;

export const JARINGAN_WOOD_IDS: JaringanWoodId[] = [
  'wood_mahoni',
  'wood_merbau',
  'wood_sonokeling',
  'wood_cendana',
  'wood_ulin',
  'wood_ebony',
  'wood_sungkai',
  'wood_trembesi',
  'wood_meranti',
  'wood_bengkirai',
];

export const JARINGAN_GEM_IDS: JaringanGemId[] = [
  'gem_akik',
  'gem_giok',
  'gem_safir',
  'gem_ruby',
  'gem_zamrud',
  'gem_kecubung',
  'gem_opal',
  'gem_oniks',
  'gem_topaz',
  'gem_berlian',
];

export const JARINGAN_FISH_IDS: JaringanFishId[] = [
  'fish_tuna',
  'fish_tongkol',
  'fish_cakalang',
  'fish_tenggiri',
  'fish_kakap',
  'fish_kerapu',
  'fish_kuwe',
  'fish_baronang',
  'fish_bawal',
  'fish_marlin',
];

export const JARINGAN_BAG_ITEMS: Record<JaringanBagItemId, BagItemDef> = {
  // 10 Kayu Eksotis Unik
  wood_mahoni: {
    id: 'wood_mahoni',
    name: 'Kayu Mahoni',
    sellPrice: 48,
    category: 'Kayu Eksotis',
    desc: 'Kayu merah keemasan bertekstur halus dari rimba Pulau Jaringan. Bahan Palu & Rumah.',
  },
  wood_merbau: {
    id: 'wood_merbau',
    name: 'Kayu Merbau',
    sellPrice: 65,
    category: 'Kayu Eksotis',
    desc: 'Kayu keras tropis tahan air laut berwarna cokelat kemerahan.',
  },
  wood_sonokeling: {
    id: 'wood_sonokeling',
    name: 'Kayu Sonokeling',
    sellPrice: 82,
    category: 'Kayu Eksotis',
    desc: 'Kayu indah bercorak ungu gelap alami, sangat dicari arsitek Nusantara.',
  },
  wood_cendana: {
    id: 'wood_cendana',
    name: 'Kayu Cendana',
    sellPrice: 110,
    category: 'Kayu Eksotis',
    desc: 'Kayu wangi harum legendaris untuk bangunan bangsawan & ukiran suci.',
  },
  wood_ulin: {
    id: 'wood_ulin',
    name: 'Kayu Ulin',
    sellPrice: 95,
    category: 'Kayu Eksotis',
    desc: 'Kayu besi Kalimantan yang sangat kokoh untuk tiang rumah & palu kuat.',
  },
  wood_ebony: {
    id: 'wood_ebony',
    name: 'Kayu Ebony',
    sellPrice: 135,
    category: 'Kayu Eksotis',
    desc: 'Kayu hitam pekat berkilau mewah—komponen inti Palu Konstruksi & Istana Tier 3.',
  },
  wood_sungkai: {
    id: 'wood_sungkai',
    name: 'Kayu Sungkai',
    sellPrice: 42,
    category: 'Kayu Eksotis',
    desc: 'Kayu terang berpola serat cerah untuk dinding & lantai rumah panggung.',
  },
  wood_trembesi: {
    id: 'wood_trembesi',
    name: 'Kayu Trembesi',
    sellPrice: 58,
    category: 'Kayu Eksotis',
    desc: 'Papan kayu lebar berurat kontras dari pohon raksasa Pulau Jaringan.',
  },
  wood_meranti: {
    id: 'wood_meranti',
    name: 'Kayu Meranti',
    sellPrice: 38,
    category: 'Kayu Eksotis',
    desc: 'Kayu merah muda ringan nan kuat, material dasar konstruksi atap rumah.',
  },
  wood_bengkirai: {
    id: 'wood_bengkirai',
    name: 'Kayu Bengkirai',
    sellPrice: 54,
    category: 'Kayu Eksotis',
    desc: 'Kayu kuning padat tahan panas matahari untuk dek dan balkon laut.',
  },

  // 10 Batu Mulia Unik
  gem_akik: {
    id: 'gem_akik',
    name: 'Batu Akik',
    sellPrice: 90,
    category: 'Batu Mulia',
    desc: 'Batu akik lapis jingga-merah dari dataran vulkanik Pulau Jaringan.',
  },
  gem_giok: {
    id: 'gem_giok',
    name: 'Batu Giok',
    sellPrice: 130,
    category: 'Batu Mulia',
    desc: 'Batu hijau menenangkan pembawa keberuntungan; bahan penting Palu Konstruksi.',
  },
  gem_safir: {
    id: 'gem_safir',
    name: 'Batu Safir',
    sellPrice: 210,
    category: 'Batu Mulia',
    desc: 'Permata biru samudra berkilau tajam dari tebing utara Gunung Agung.',
  },
  gem_ruby: {
    id: 'gem_ruby',
    name: 'Batu Ruby',
    sellPrice: 245,
    category: 'Batu Mulia',
    desc: 'Permata merah membara yang ditempa oleh panas magma vulkanik.',
  },
  gem_zamrud: {
    id: 'gem_zamrud',
    name: 'Batu Zamrud',
    sellPrice: 260,
    category: 'Batu Mulia',
    desc: 'Permata hijau zamrud bening bernilai tinggi untuk Vila Tier 2.',
  },
  gem_kecubung: {
    id: 'gem_kecubung',
    name: 'Batu Kecubung',
    sellPrice: 175,
    category: 'Batu Mulia',
    desc: 'Kristal ungu lembayung yang berpendar indah di bawah cahaya obor.',
  },
  gem_opal: {
    id: 'gem_opal',
    name: 'Batu Opal',
    sellPrice: 290,
    category: 'Batu Mulia',
    desc: 'Batu pelangi mistis dengan kilau spektrum warna-warni.',
  },
  gem_oniks: {
    id: 'gem_oniks',
    name: 'Batu Oniks',
    sellPrice: 220,
    category: 'Batu Mulia',
    desc: 'Batu hitam legam bergaris putih elegan untuk fondasi Istana Tier 3.',
  },
  gem_topaz: {
    id: 'gem_topaz',
    name: 'Batu Topaz',
    sellPrice: 275,
    category: 'Batu Mulia',
    desc: 'Permata kuning keemasan secerah mentari pagi kepulauan.',
  },
  gem_berlian: {
    id: 'gem_berlian',
    name: 'Batu Berlian',
    sellPrice: 520,
    category: 'Batu Mulia',
    desc: 'Permata paling langka dan keras di puncak Gunung Agung Jaringan!',
  },

  // 10 Ikan Laut Pulau Jaringan
  fish_tuna: {
    id: 'fish_tuna',
    name: 'Ikan Tuna',
    sellPrice: 195,
    category: 'Ikan Laut',
    desc: 'Ikan perenang cepat laut dalam bernilai ekspor tinggi.',
  },
  fish_tongkol: {
    id: 'fish_tongkol',
    name: 'Ikan Tongkol',
    sellPrice: 85,
    category: 'Ikan Laut',
    desc: 'Ikan laut favorit nelayan dermaga kepulauan Pulau Jaringan.',
  },
  fish_cakalang: {
    id: 'fish_cakalang',
    name: 'Ikan Cakalang',
    sellPrice: 105,
    category: 'Ikan Laut',
    desc: 'Ikan bergaris perak di perutnya yang lincah menyambar umpan.',
  },
  fish_tenggiri: {
    id: 'fish_tenggiri',
    name: 'Ikan Tenggiri',
    sellPrice: 145,
    category: 'Ikan Laut',
    desc: 'Ikan memanjang berdaging gurih dari selat antar-pulau.',
  },
  fish_kakap: {
    id: 'fish_kakap',
    name: 'Ikan Kakap',
    sellPrice: 135,
    category: 'Ikan Laut',
    desc: 'Kakap merah karang kebanggaan Kapten Samudra.',
  },
  fish_kerapu: {
    id: 'fish_kerapu',
    name: 'Ikan Kerapu',
    sellPrice: 175,
    category: 'Ikan Laut',
    desc: 'Ikan karang berbintik eksotis berharga mahal di restoran kota.',
  },
  fish_kuwe: {
    id: 'fish_kuwe',
    name: 'Ikan Kuwe',
    sellPrice: 155,
    category: 'Ikan Laut',
    desc: 'Ikan sirip kuning gagah yang gemar berburu di dekat dermaga.',
  },
  fish_baronang: {
    id: 'fish_baronang',
    name: 'Ikan Baronang',
    sellPrice: 95,
    category: 'Ikan Laut',
    desc: 'Ikan terumbu karang bercorak batik kuning keemasan.',
  },
  fish_bawal: {
    id: 'fish_bawal',
    name: 'Ikan Bawal Laut',
    sellPrice: 165,
    category: 'Ikan Laut',
    desc: 'Ikan perak pipih lebar tangkapan terbaik selat selatan.',
  },
  fish_marlin: {
    id: 'fish_marlin',
    name: 'Ikan Marlin',
    sellPrice: 440,
    category: 'Ikan Laut',
    desc: 'Raja samudra berparuh pedang biru! Ikan trofi terlangka di Pulau Jaringan.',
  },

  // Item Palu Konstruksi
  item_palu: {
    id: 'item_palu',
    name: 'Palu Konstruksi Nusantara',
    sellPrice: 450,
    usableEffect: 'hammer',
    category: 'Konstruksi',
    desc: 'Alat wajib buatan Master Pandu untuk membangun & meng-upgrade Rumah Tier 1–3 di Pulau Jaringan!',
  },
};

export const HAMMER_RECIPE = {
  goldCost: 300,
  title: 'Resep Palu Konstruksi Nusantara',
  desc: 'Beli & tempa Palu Konstruksi dari Master Pandu agar karakter bisa membangun Rumah di Pulau Jaringan.',
  ingredients: [
    { id: 'wood_mahoni' as JaringanBagItemId, label: 'Kayu Mahoni', qty: 2 },
    { id: 'wood_ulin' as JaringanBagItemId, label: 'Kayu Ulin', qty: 2 },
    { id: 'wood_ebony' as JaringanBagItemId, label: 'Kayu Ebony', qty: 1 },
    { id: 'gem_akik' as JaringanBagItemId, label: 'Batu Akik', qty: 2 },
    { id: 'gem_giok' as JaringanBagItemId, label: 'Batu Giok', qty: 1 },
  ],
};

export interface HouseTierDef {
  tier: 1 | 2 | 3;
  name: string;
  subtitle: string;
  tileKind: 'jaringan_house_t1' | 'jaringan_house_t2' | 'jaringan_house_t3';
  interiorId: 'jaringan_house_t1' | 'jaringan_house_t2' | 'jaringan_house_t3';
  goldCost: number;
  desc: string;
  ingredients: Array<{ id: JaringanBagItemId; label: string; qty: number }>;
}

export const HOUSE_TIERS: HouseTierDef[] = [
  {
    tier: 1,
    name: 'Tier 1: Rumah Panggung Nusantara',
    subtitle: 'Hunian Kayu Eksotis Hangat',
    tileKind: 'jaringan_house_t1',
    interiorId: 'jaringan_house_t1',
    goldCost: 500,
    desc: 'Rumah panggung nyaman lengkap dengan ranjang tidur, tungku, dan meja cetak biru.',
    ingredients: [
      { id: 'wood_mahoni', label: 'Kayu Mahoni', qty: 3 },
      { id: 'wood_meranti', label: 'Kayu Meranti', qty: 3 },
      { id: 'wood_sungkai', label: 'Kayu Sungkai', qty: 2 },
      { id: 'wood_bengkirai', label: 'Kayu Bengkirai', qty: 2 },
      { id: 'gem_akik', label: 'Batu Akik', qty: 2 },
      { id: 'gem_giok', label: 'Batu Giok', qty: 1 },
    ],
  },
  {
    tier: 2,
    name: 'Tier 2: Vila Mahoni & Permata',
    subtitle: 'Vila 2 Lantai Berhias Giok & Safir',
    tileKind: 'jaringan_house_t2',
    interiorId: 'jaringan_house_t2',
    goldCost: 1200,
    desc: 'Vila megah beratap kayu ukir harum dengan etalase batu mulia & sofa rotan mewah.',
    ingredients: [
      { id: 'wood_merbau', label: 'Kayu Merbau', qty: 4 },
      { id: 'wood_sonokeling', label: 'Kayu Sonokeling', qty: 4 },
      { id: 'wood_cendana', label: 'Kayu Cendana', qty: 3 },
      { id: 'wood_trembesi', label: 'Kayu Trembesi', qty: 3 },
      { id: 'gem_safir', label: 'Batu Safir', qty: 2 },
      { id: 'gem_ruby', label: 'Batu Ruby', qty: 2 },
      { id: 'gem_zamrud', label: 'Batu Zamrud', qty: 2 },
      { id: 'gem_kecubung', label: 'Batu Kecubung', qty: 2 },
    ],
  },
  {
    tier: 3,
    name: 'Tier 3: Istana Eboni & Berlian',
    subtitle: 'Kediaman Agung Puncak Kepulauan',
    tileKind: 'jaringan_house_t3',
    interiorId: 'jaringan_house_t3',
    goldCost: 2600,
    desc: 'Istana mahakarya dari Kayu Ebony, Ulin, dan Batu Berlian berkilau menembus abu vulkanik!',
    ingredients: [
      { id: 'wood_ulin', label: 'Kayu Ulin', qty: 5 },
      { id: 'wood_ebony', label: 'Kayu Ebony', qty: 5 },
      { id: 'wood_cendana', label: 'Kayu Cendana', qty: 4 },
      { id: 'wood_merbau', label: 'Kayu Merbau', qty: 4 },
      { id: 'gem_opal', label: 'Batu Opal', qty: 2 },
      { id: 'gem_oniks', label: 'Batu Oniks', qty: 2 },
      { id: 'gem_topaz', label: 'Batu Topaz', qty: 2 },
      { id: 'gem_berlian', label: 'Batu Berlian', qty: 3 },
    ],
  },
];

export interface JaringanHousePlot {
  id: string;
  label: string;
  x: number; // top-left 4x4 tile coordinate
  y: number;
  doorX: number;
  doorY: number;
}

export const JARINGAN_HOUSE_PLOTS: JaringanHousePlot[] = [
  { id: 'plot_east_1', label: 'Lahan Vila Teluk Timur I', x: 76, y: 44, doorX: 78.0, doorY: 48.6 },
  { id: 'plot_east_2', label: 'Lahan Vila Teluk Timur II', x: 87, y: 44, doorX: 89.0, doorY: 48.6 },
  { id: 'plot_east_3', label: 'Lahan Vila Tanjung Selatan', x: 81, y: 53, doorX: 83.0, doorY: 57.6 },
  { id: 'plot_west_1', label: 'Lahan Hutan Rimba Barat', x: 18, y: 46, doorX: 20.0, doorY: 50.6 },
];

export const JARINGAN_REGIONS: IslandRegionLabel[] = [
  {
    id: 'j_harbor',
    name: 'Kampung Tukang & Dermaga Nusantara',
    desc: 'Bengkel Palu Master Pandu & Balai Dewan',
    x: 42,
    y: 52,
    w: 22,
    h: 15,
    color: '#f59e0b',
  },
  {
    id: 'j_west_forest',
    name: 'Kepulauan Rimba Barat',
    desc: 'Hutan Mahoni, Ulin, Sonokeling & Beri Liar',
    x: 8,
    y: 36,
    w: 27,
    h: 26,
    color: '#22c55e',
  },
  {
    id: 'j_east_estate',
    name: 'Kepulauan Permukiman & Rimba Timur',
    desc: 'Lahan Bangun Rumah Tier 1–3 & Hutan Ebony',
    x: 70,
    y: 34,
    w: 31,
    h: 28,
    color: '#10b981',
  },
  {
    id: 'j_volcano',
    name: 'Gunung Agung & Lembah Batu Mulia',
    desc: '10 Tambang Permata & Puncak Erupsi Vulkanik',
    x: 30,
    y: 6,
    w: 48,
    h: 26,
    color: '#ef4444',
  },
  {
    id: 'j_fishing',
    name: 'Selat Pancing Samudra',
    desc: 'Habitat Tuna, Marlin, Kakap & Kerapu',
    x: 10,
    y: 63,
    w: 88,
    h: 10,
    color: '#0ea5e9',
  },
];

export const JARINGAN_NPCS: Record<JaringanNpcId, NpcConfig> = {
  j_pandu: {
    id: 'j_pandu',
    name: 'Master Pandu Arsitek',
    role: 'Empu Palu & Pembangun Rumah',
    homeRegion: 'Bengkel Konstruksi Jaringan',
    homeInterior: 'jaringan_builder_hut',
    baseX: 57.5,
    baseY: 58.6,
    patrolRadius: 2.0,
    favoriteCategory: 'Kayu Ulin / Batu Giok',
    color: '#ea580c',
    greetingsByChapter: {
      1: 'Selamat datang di Kepulauan Jaringan! Ingin membangun Rumah sendiri? Kumpulkan 10 jenis kayu eksotis & 10 batu mulia lalu tempa Palu Konstruksi bersamaku!',
      2: 'Palu Konstruksi sudah di tangan? Pilih Lahan Vila atau klik tombol Bangun Rumah untuk mendirikan Rumah Tier 1 hingga Istana Tier 3!',
      3: 'Rumah panggung Mahoni maupun Vila Giok sangat tahan menghadapi angin laut kepulauan.',
      4: 'Hati-hati bila Gunung Agung meletus—abu vulkanik hitam akan menyelimuti langit 1/4 hari! Selalu siapkan Obor!',
      5: 'Karya arsitekturmu di Pulau Jaringan kini menjadi legenda antarpulau bersama Pulau TIK dan Biner!',
    },
    chitChatLines: [
      'Resep Palu Konstruksi butuh 2 Mahoni, 2 Ulin, 1 Ebony, 2 Akik, 1 Giok + 300G.',
      'Setiap pohon di pulau ini menghasilkan jenis kayu berbeda dan akan tumbuh kembali setelah 3 hari!',
      'Ada 4 lahan bangun rumah di Kepulauan Timur & Barat. Kamu bisa upgrade dari Tier 1 → Tier 2 → Tier 3!',
    ],
    secretLore: 'Rahasia Master Pandu: Istana Eboni & Berlian Tier 3 memancarkan cahaya hangat yang melindungi halaman rumah dari abu vulkanik.',
  },
  j_laras: {
    id: 'j_laras',
    name: 'Laras Gemilang',
    role: 'Ahli Batu Mulia & Permata',
    homeRegion: 'Lembah Permata Utara',
    homeInterior: 'jaringan_hall',
    baseX: 46.5,
    baseY: 25.5,
    patrolRadius: 2.6,
    favoriteCategory: 'Batu Safir / Berlian',
    color: '#10b981',
    greetingsByChapter: {
      1: 'Lihat kilau tanah utara ini! Ada 10 jenis batu mulia unik: Akik, Giok, Safir, Ruby, Zamrud, Kecubung, Opal, Oniks, Topaz, hingga Berlian!',
      2: 'Gunakan Beliung [4] untuk menambang urat permata di sekitar lereng Gunung Agung!',
      3: 'Batu Akik dan Giok penting untuk Palu Konstruksi, sedangkan Berlian dan Opal adalah mahkota Istana Tier 3!',
      4: 'Saat abu vulkanik turun, permata di tanah tetap berkilau pelan—bawa Obor agar lebih mudah dilihat!',
      5: 'Koleksi 10 batu mulia Pulau Jaringanmu sungguh menakjubkan!',
    },
    chitChatLines: [
      'Batu Ruby dan Topaz terbentuk dekat aliran lava kuno di sisi timur gunung.',
      'Batu Berlian paling sering muncul di dataran tinggi vulkanik utara.',
      'Permata yang tak terpakai membangun rumah bisa dijual dengan harga tinggi!',
    ],
    secretLore: 'Rahasia Laras: Suara gemuruh gunung menandakan urat batu mulia baru saja terdorong ke permukaan.',
  },
  j_rimba: {
    id: 'j_rimba',
    name: 'Rimba Kusuma',
    role: 'Penjaga Hutan 10 Kayu Eksotis',
    homeRegion: 'Kepulauan Rimba Barat',
    homeInterior: 'jaringan_hall',
    baseX: 25.5,
    baseY: 49.5,
    patrolRadius: 3.0,
    favoriteCategory: 'Beri Liar / Kayu Cendana',
    color: '#16a34a',
    greetingsByChapter: {
      1: 'Selamat datang di Rimba Kepulauan Jaringan! Di sini tumbuh 10 spesies pohon langka—dari Mahoni, Merbau, Cendana hingga Ebony hitam!',
      2: 'Jangan khawatir menebang pohon! Tunggulnya akan tumbuh kembali menjadi pohon dewasa dalam 3 hari.',
      3: 'Lihat semak beri liar berbuah lebat di sela pepohonan—petik saja untuk memulihkan energimu!',
      4: 'Kayu Ebony dan Ulin tumbuh terutama di hutan timur dan lereng utara.',
      5: 'Hutan kita lestari berkat keseimbangan antara panen kayu dan penanaman ulang!',
    },
    chitChatLines: [
      'Coba perhatikan bentuk daun dan warna batang tiap pohon—masing-masing menghasilkan kayu spesifik!',
      'Kayu Cendana baunya harum sekali saat ditebang dengan Kapak [3].',
      'Semak Beri Liar tumbuh segar sepanjang waktu untuk bekal menebang dan menambang.',
    ],
    secretLore: 'Rahasia Rimba: Pohon Trembesi tertua di pulau ini konon berumur lima ratus tahun.',
  },
  j_samudra: {
    id: 'j_samudra',
    name: 'Kapten Samudra',
    role: 'Nakhoda Ferri & Master Pemancing',
    homeRegion: 'Dermaga Pancing Samudra',
    homeInterior: 'jaringan_hall',
    baseX: 50.0,
    baseY: 65.5,
    patrolRadius: 2.2,
    favoriteCategory: 'Ikan Marlin / Tuna',
    color: '#0284c7',
    greetingsByChapter: {
      1: 'Ahoy, Penjelajah! Laut Kepulauan Jaringan kaya akan 10 ikan samudra: Tuna, Tongkol, Cakalang, Tenggiri, Kakap, Kerapu, Kuwe, Baronang, Bawal Laut, sampai Marlin!',
      2: 'Klik kapal Ferri di dermaga selatan jika ingin berlayar kembali ke Pulau TIK atau Pulau Biner!',
      3: 'Dermaga barat dan timur juga merupakan titik pancing terbaik untuk memburu Ikan Marlin!',
      4: 'Pakai Umpan Ikan Harum untuk memperbesar peluang menarik Tuna dan Marlin raksasa.',
      5: 'Semua kapten pelabuhan tiga pulau kini saling terhubung dalam satu jaringan pelayaran!',
    },
    chitChatLines: [
      'Ikan Bawal Laut dan Kuwe sering berenang di selat antara pulau tengah dan timur.',
      'Ikan Marlin bernilai 440G per ekor di Kotak Jual!',
      'Kalau punya Kartu VIP Biner, semua pelayaran Ferri antarpulau pun gratis selamanya.',
    ],
    secretLore: 'Rahasia Kapten Samudra: Bima di Pulau TIK, Budi di Biner, dan diriku dulu bertiga melintasi badai samudra bersama.',
  },
  j_kaelen: {
    id: 'j_kaelen',
    name: 'Kaelen Vulkan',
    role: 'Vulkanolog Gunung Agung',
    homeRegion: 'Kaki Gunung Agung Utara',
    homeInterior: 'jaringan_builder_hut',
    baseX: 55.5,
    baseY: 22.5,
    patrolRadius: 2.4,
    favoriteCategory: 'Obor Lentera / Batu Ruby',
    color: '#dc2626',
    greetingsByChapter: {
      1: 'Waspadalah di dekat Gunung Agung Jaringan! Sewaktu-waktu gunung ini meletuskan abu vulkanik hitam selama 1/4 hari!',
      2: 'Ketika abu vulkanik turun, jarak pandang menjadi gelap gulita. Letakkan Obor Lentera di tanah agar jalanmu tetap terang!',
      3: 'Obor yang kamu taruh di tanah akan terus menyala menembus malam maupun hujan abu vulkanik.',
      4: 'Letusan berlangsung tepat seperempat hari (6 jam dalam game) sebelum angin laut membersihkannya.',
      5: 'Sensor vulkanik kita kini membantu warga menyiapkan lentera sebelum hujan abu turun!',
    },
    chitChatLines: [
      'Pilih Obor Lentera di Tas lalu tekan Gunakan untuk menancapkannya langsung ke tanah!',
      'Jika ingin memindahkan obor yang sudah terpasang di tanah, ketuk dengan Beliung [4].',
      'Puncak Gunung Agung menyemburkan bara panas—jangan melangkah ke kolam lava!',
    ],
    secretLore: 'Rahasia Kaelen: Abu vulkanik justru menyuburkan akar sepuluh pohon kayu eksotis Pulau Jaringan.',
  },
  j_nusa: {
    id: 'j_nusa',
    name: 'Ibu Nusa Pertiwi',
    role: 'Ketua Dewan Kepulauan Jaringan',
    homeRegion: 'Balai Nusantara Jaringan',
    homeInterior: 'jaringan_hall',
    baseX: 45.2,
    baseY: 58.6,
    patrolRadius: 1.8,
    favoriteCategory: 'Kopi / Permata Opal',
    color: '#7c3aed',
    greetingsByChapter: {
      1: 'Salam Nusantara! Kepulauan Jaringan terdiri dari pulau rimba, pulau permukiman teluk, dan pulau gunung berapi.',
      2: 'Bangunlah rumahmu sendiri di Pulau Jaringan agar tempat ini benar-benar terasa seperti rumah kedua!',
      3: 'Masuklah ke Balai Nusantara atau Bengkel Master Pandu kapan saja untuk melihat rencana arsitektur pulau.',
      4: 'Kekayaan kayu, batu permata, dan hasil laut Pulau Jaringan melengkapi pertanian Pulau TIK dan teknologi Pulau Biner.',
      5: 'Tiga pulau besar—TIK, Biner, dan Jaringan—kini bersatu makmur di bawah bimbinganmu!',
    },
    chitChatLines: [
      'Kamu bisa tidur di rumah buatanmu sendiri di Pulau Jaringan untuk berganti hari.',
      'Semua hasil hutan, permata, dan ikan Pulau Jaringan bisa dijual di Kotak Jual mana pun.',
      'Jelajahi keempat pulau kecil melalui jembatan kayu panjang yang menghubungkan seluruh kepulauan.',
    ],
    secretLore: 'Rahasia Ibu Nusa: Nama Pulau Jaringan diambil dari jaringan jembatan kayu dan alur laut yang menyatukan pulau-pulau ini.',
  },
};

export function getJaringanNpcExclusiveLocation(
  npcId: JaringanNpcId,
  minuteOfDay: number,
  weather: Weather
): 'outdoor' | JaringanInteriorId {
  const isLateNight = minuteOfDay >= 1290 || minuteOfDay < 330;
  if (weather === 'Hujan' || isLateNight) {
    return JARINGAN_NPCS[npcId].homeInterior as JaringanInteriorId;
  }
  return 'outdoor';
}

export const JARINGAN_INTERIORS: Record<JaringanInteriorId, InteriorDef> = {
  jaringan_hall: {
    id: 'jaringan_hall',
    title: 'Balai Dewan Kepulauan Jaringan',
    themeLabel: 'Pusat Adat & Pameran Permata Nusantara',
    cols: 14,
    rows: 10,
    floorStyle: 'exec_wood',
    wallColor: '#451a03',
    wallAccent: '#f59e0b',
    exitTile: { x: 7, y: 9 },
    outdoorExit: { x: 45.5, y: 58.2 },
    residentNpc: 'j_nusa',
    residentPos: { x: 4.5, y: 3.3 },
    island: 'jaringan',
    buildingName: 'Balai Nusantara',
    furniture: [
      { id: 'jh_rug', kind: 'rug', name: 'Permadani Ukir Nusantara', x: 5, y: 5, w: 4, h: 3, walkable: true },
      { id: 'jh_gem', kind: 'gem_display', name: 'Etalase 10 Batu Mulia', x: 2, y: 2, w: 3, h: 1, interactAction: 'info', infoText: 'Koleksi 10 permata Pulau Jaringan: Akik, Giok, Safir, Ruby, Zamrud, Kecubung, Opal, Oniks, Topaz, dan Berlian!' },
      { id: 'jh_bp', kind: 'blueprint_table', name: 'Meja Arsitek Rumah Tier 1–3', x: 6, y: 2, w: 3, h: 1, interactAction: 'house_build' },
      { id: 'jh_sofa', kind: 'rattan_sofa', name: 'Sofa Rotan Dewan', x: 10, y: 4, w: 3, h: 2, interactAction: 'hay_rest' },
      { id: 'jh_hearth', kind: 'volcano_hearth', name: 'Perapian Batu Vulkanik', x: 1, y: 5, w: 2, h: 2, interactAction: 'warm_fire' },
    ],
  },
  jaringan_builder_hut: {
    id: 'jaringan_builder_hut',
    title: 'Bengkel Palu Konstruksi Master Pandu',
    themeLabel: 'Bengkel Tempa Palu & Desain Rumah',
    cols: 13,
    rows: 10,
    floorStyle: 'wood',
    wallColor: '#7c2d12',
    wallAccent: '#fb923c',
    exitTile: { x: 6, y: 9 },
    outdoorExit: { x: 57.5, y: 58.2 },
    residentNpc: 'j_pandu',
    residentPos: { x: 4.2, y: 3.5 },
    island: 'jaringan',
    buildingName: 'Bengkel Konstruksi Pandu',
    furniture: [
      { id: 'jb_anvil', kind: 'stone_anvil', name: 'Paron Batu Tempa Palu', x: 2, y: 2, w: 2, h: 1, interactAction: 'builder_hammer' },
      { id: 'jb_bp', kind: 'blueprint_table', name: 'Meja Cetak Biru Rumah Tier 1–3', x: 5, y: 2, w: 3, h: 1, interactAction: 'house_build' },
      { id: 'jb_gem', kind: 'gem_display', name: 'Rak Bahan Kayu & Batu', x: 9, y: 2, w: 3, h: 1, interactAction: 'builder_hammer' },
      { id: 'jb_hearth', kind: 'volcano_hearth', name: 'Tungku Api Vulkanik', x: 1, y: 5, w: 2, h: 2, interactAction: 'warm_fire' },
      { id: 'jb_sofa', kind: 'rattan_sofa', name: 'Bangku Istirahat Tukang', x: 9, y: 5, w: 3, h: 2, interactAction: 'hay_rest' },
    ],
  },
  jaringan_house_t1: {
    id: 'jaringan_house_t1',
    title: 'Rumah Panggung Nusantara (Tier 1)',
    themeLabel: 'Hunian Kayu Mahoni & Meranti Milikmu',
    cols: 12,
    rows: 9,
    floorStyle: 'wood',
    wallColor: '#78350f',
    wallAccent: '#facc15',
    exitTile: { x: 6, y: 8 },
    outdoorExit: { x: 78.0, y: 48.6 },
    island: 'jaringan',
    buildingName: 'Rumah Tier 1',
    furniture: [
      { id: 'jt1_bed', kind: 'jaringan_bed', name: 'Ranjang Kayu Ukir (Tidur / Besok)', x: 2, y: 2, w: 2, h: 2, interactAction: 'sleep' },
      { id: 'jt1_hearth', kind: 'volcano_hearth', name: 'Tungku Hangat Nusantara', x: 5, y: 1, w: 2, h: 1, interactAction: 'warm_fire' },
      { id: 'jt1_bp', kind: 'blueprint_table', name: 'Meja Upgrade Rumah Tier 2', x: 8, y: 2, w: 3, h: 1, interactAction: 'house_build' },
      { id: 'jt1_sofa', kind: 'rattan_sofa', name: 'Sofa Rotan Santai', x: 8, y: 5, w: 3, h: 2, interactAction: 'hay_rest' },
      { id: 'jt1_chest', kind: 'chest', name: 'Peti Penyimpanan Kebun', x: 1, y: 6, w: 2, h: 1, interactAction: 'chest' },
    ],
  },
  jaringan_house_t2: {
    id: 'jaringan_house_t2',
    title: 'Vila Mahoni & Permata (Tier 2)',
    themeLabel: 'Vila Berhias Giok, Safir & Cendana',
    cols: 14,
    rows: 10,
    floorStyle: 'exec_wood',
    wallColor: '#064e3b',
    wallAccent: '#34d399',
    exitTile: { x: 7, y: 9 },
    outdoorExit: { x: 78.0, y: 48.6 },
    island: 'jaringan',
    buildingName: 'Vila Tier 2',
    furniture: [
      { id: 'jt2_bed', kind: 'jaringan_bed', name: 'Ranjang Vila Cendana (Tidur)', x: 2, y: 2, w: 2, h: 2, interactAction: 'sleep' },
      { id: 'jt2_gem', kind: 'gem_display', name: 'Etalase Permata Safir & Zamrud', x: 5, y: 2, w: 3, h: 1, interactAction: 'info', infoText: 'Vila Tier 2 memamerkan batu Safir, Ruby, Zamrud, dan Kecubung hasil tambangmu!' },
      { id: 'jt2_bp', kind: 'blueprint_table', name: 'Meja Upgrade ke Istana Tier 3', x: 9, y: 2, w: 3, h: 1, interactAction: 'house_build' },
      { id: 'jt2_hearth', kind: 'volcano_hearth', name: 'Perapian Magma Hangat', x: 1, y: 6, w: 2, h: 2, interactAction: 'warm_fire' },
      { id: 'jt2_sofa', kind: 'rattan_sofa', name: 'Sofa Rotan Vila Mewah', x: 9, y: 5, w: 3, h: 2, interactAction: 'hotel_rest' },
      { id: 'jt2_rug', kind: 'rug', name: 'Karpet Permadani Hijau', x: 5, y: 5, w: 3, h: 3, walkable: true },
    ],
  },
  jaringan_house_t3: {
    id: 'jaringan_house_t3',
    title: 'Istana Eboni & Berlian Agung (Tier 3)',
    themeLabel: 'Mahakarya Arsitektur Tertinggi Pulau Jaringan',
    cols: 15,
    rows: 11,
    floorStyle: 'marble',
    wallColor: '#1e1b4b',
    wallAccent: '#fbbf24',
    exitTile: { x: 7, y: 10 },
    outdoorExit: { x: 78.0, y: 48.6 },
    island: 'jaringan',
    buildingName: 'Istana Tier 3',
    furniture: [
      { id: 'jt3_bed', kind: 'jaringan_bed', name: 'Peraduan Agung Berlian (Tidur)', x: 2, y: 2, w: 2, h: 2, interactAction: 'sleep' },
      { id: 'jt3_gem', kind: 'gem_display', name: 'Galeri Berlian, Opal & Topaz', x: 5, y: 2, w: 3, h: 1, interactAction: 'info', infoText: 'Istana Tier 3 memancarkan aura permata agung dan memulihkan energi penuh setiap istirahat!' },
      { id: 'jt3_anvil', kind: 'stone_anvil', name: 'Meja Kerajinan Agung', x: 9, y: 2, w: 2, h: 1, interactAction: 'craft' },
      { id: 'jt3_bp', kind: 'blueprint_table', name: 'Meja Arsitektur Istana', x: 11, y: 2, w: 3, h: 1, interactAction: 'house_build' },
      { id: 'jt3_hearth', kind: 'volcano_hearth', name: 'Perapian Emas Gunung Agung', x: 1, y: 6, w: 2, h: 2, interactAction: 'warm_fire' },
      { id: 'jt3_sofa', kind: 'rattan_sofa', name: 'Sofa Istana Pemulih 100%', x: 10, y: 6, w: 3, h: 2, interactAction: 'hotel_rest' },
      { id: 'jt3_rug', kind: 'rug', name: 'Karpet Agung Berlian', x: 5, y: 5, w: 4, h: 3, walkable: true },
    ],
  },
};

export function createInitialJaringanGrid(): FarmTile[] {
  const tiles: FarmTile[] = [];
  const land: boolean[][] = Array.from({ length: JARINGAN_ROWS }, () => Array(JARINGAN_COLS).fill(false));

  const fillEllipse = (cx: number, cy: number, rx: number, ry: number, seedOffset: number) => {
    for (let y = Math.max(2, Math.floor(cy - ry - 2)); y <= Math.min(JARINGAN_ROWS - 3, Math.ceil(cy + ry + 2)); y++) {
      for (let x = Math.max(2, Math.floor(cx - rx - 2)); x <= Math.min(JARINGAN_COLS - 3, Math.ceil(cx + rx + 2)); x++) {
        const wob = Math.sin(x * 0.35 + seedOffset) * 0.08 + Math.cos(y * 0.4 - seedOffset) * 0.06;
        if (Math.hypot((x - cx) / rx, (y - cy) / ry) + wob <= 1.0) {
          land[y][x] = true;
        }
      }
    }
  };

  // Multi-island archipelago!
  // 1. Pulau Dermaga & Kampung Tukang (South-Center)
  fillEllipse(52, 59, 14, 9, 1.1);
  // 2. Pulau Rimba Barat
  fillEllipse(21, 49, 13, 12, 2.3);
  // 3. Pulau Permukiman & Rimba Timur
  fillEllipse(85, 48, 15, 13, 3.7);
  // 4. Pulau Gunung Agung & Lembah Permata (North)
  fillEllipse(53, 19, 23, 12, 4.9);
  // 5. Pulau-pulau kecil berbatu & selat pancing
  fillEllipse(15, 62, 6, 5, 5.2);
  fillEllipse(93, 62, 6, 5, 6.4);

  const isNearWater = (x: number, y: number) => {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= JARINGAN_COLS || ny < 0 || ny >= JARINGAN_ROWS || !land[ny][nx]) {
          return true;
        }
      }
    }
    return false;
  };

  for (let y = 0; y < JARINGAN_ROWS; y++) {
    for (let x = 0; x < JARINGAN_COLS; x++) {
      let kind: TileKind = 'ocean';
      let debris: FarmTile['debris'] = null;

      if (land[y][x]) {
        const isNorthVolcanoIsland = y <= 33 && x >= 27 && x <= 80;
        const isWestForestIsland = x <= 36 && y >= 34 && y <= 63;
        const isEastSettlementIsland = x >= 68 && y >= 33 && y <= 64;

        if (isNearWater(x, y)) {
          kind = 'sand';
        } else if (isNorthVolcanoIsland) {
          // Gemstone rocky slopes near volcano
          kind = x >= 40 && x <= 68 && y >= 8 && y <= 28 ? 'plaza' : 'forest_floor';
        } else if (isWestForestIsland) {
          kind = x >= 15 && x <= 23 && y >= 45 && y <= 51 ? 'grass' : 'forest_floor';
        } else if (isEastSettlementIsland) {
          kind = x >= 73 && x <= 93 && y >= 41 && y <= 59 ? 'grass' : 'forest_floor';
        } else {
          kind = 'grass';
        }
      }

      // Inter-island wooden bridges & long fishing piers
      if ((y === 55 || y === 56) && x >= 31 && x <= 41) kind = 'bridge'; // Center <-> West
      if ((y === 55 || y === 56) && x >= 63 && x <= 73) kind = 'bridge'; // Center <-> East
      if ((x === 51 || x === 52) && y >= 29 && y <= 52) kind = 'bridge'; // Center <-> North Volcano
      if ((x === 16 || x === 17) && y >= 57 && y <= 62) kind = 'bridge'; // West <-> SW Fishing Islet
      if ((x === 91 || x === 92) && y >= 56 && y <= 62) kind = 'bridge'; // East <-> SE Fishing Islet

      // Main South Ferry Pier & Fishing Piers
      if (x >= 50 && x <= 52 && y >= 65 && y <= 71) kind = 'pier';
      if (x >= 14 && x <= 16 && y >= 64 && y <= 70) kind = 'pier';
      if (x >= 92 && x <= 94 && y >= 64 && y <= 70) kind = 'pier';
      if (x >= 53 && x <= 57 && y >= 68 && y <= 70) kind = 'jaringan_ferry';

      // Paths inside Pulau Dermaga
      if (x >= 42 && x <= 62 && y === 58) kind = 'path';
      if (x >= 50 && x <= 52 && y >= 52 && y <= 65) kind = 'path';

      // Key Landmarks on Pulau Dermaga
      if (x >= 44 && x <= 47 && y >= 54 && y <= 57) kind = 'jaringan_hall';
      else if (x >= 56 && x <= 59 && y >= 54 && y <= 57) kind = 'jaringan_builder_hut';

      // Giant Erupting Volcano Mountain Peak (North Island x: 48..58, y: 8..16)
      if (x >= 49 && x <= 57 && y >= 9 && y <= 15) {
        kind = 'volcano_rock';
        if (x >= 52 && x <= 54 && y >= 11 && y <= 12) {
          kind = 'volcano_lava';
        }
      } else if ((x === 46 || x === 47 || x === 59 || x === 60) && y >= 12 && y <= 15) {
        kind = 'volcano_lava';
      }

      // 4 House Construction Plots (4x4 highlighted pads)
      for (const plot of JARINGAN_HOUSE_PLOTS) {
        if (x >= plot.x && x < plot.x + 4 && y >= plot.y && y < plot.y + 4) {
          kind = 'house_plot';
        }
      }

      // Abundant Gems, Wild Fruiting Berry Bushes, Mushrooms, Shells
      const hash = (x * 47 + y * 73 + x * y * 17) % 43;
      const inClearCenter = x >= 42 && x <= 62 && y >= 53 && y <= 63;

      if (!inClearCenter && kind === 'plaza') {
        // Gemstones across the northern volcanic plateau!
        const isSafeBridgeEntrance = x >= 49 && x <= 54 && y >= 26 && y <= 31;
        if (!isSafeBridgeEntrance) {
          if (hash === 1 || hash === 14) debris = 'gem_akik';
          else if (hash === 3 || hash === 19) debris = 'gem_giok';
          else if (hash === 6 || hash === 24) debris = 'gem_safir';
          else if (hash === 9 || hash === 29) debris = 'gem_ruby';
          else if (hash === 11 || hash === 33) debris = 'gem_zamrud';
          else if (hash === 16 || hash === 37) debris = 'gem_kecubung';
          else if (hash === 21) debris = 'gem_opal';
          else if (hash === 26 || hash === 40) debris = 'gem_oniks';
          else if (hash === 31) debris = 'gem_topaz';
          else if (hash === 39 && y <= 21) debris = 'gem_berlian';
          else if (hash === 41 && y <= 19) debris = 'gem_berlian';
          else if (hash === 4 || hash === 22) debris = 'stone';
        }
      } else if (kind === 'forest_floor') {
        if (hash === 2 || hash === 12 || hash === 24 || hash === 35) debris = 'forage_berry';
        else if (hash === 7 || hash === 28) debris = 'forage_mushroom';
        else if (hash === 15) debris = 'wood';
        else if (hash === 31 && x <= 38) debris = 'gem_akik';
        else if (hash === 38 && x >= 70) debris = 'gem_giok';
      } else if (!inClearCenter && kind === 'grass') {
        if (hash === 5 || hash === 23) debris = 'forage_berry';
        else if (hash === 18) debris = 'weed';
      } else if (kind === 'sand') {
        if (hash === 8 || hash === 27) debris = 'forage_shell';
      }

      tiles.push({
        x,
        y,
        kind,
        tilled: false,
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

export function createInitialJaringanTrees(tiles: FarmTile[]): WorldTree[] {
  const trees: WorldTree[] = [];
  const occupied = new Set<string>();
  let idSeq = 1;

  for (let y = 5; y < JARINGAN_ROWS - 5; y++) {
    for (let x = 5; x < JARINGAN_COLS - 5; x++) {
      const t = tiles[y * JARINGAN_COLS + x];
      if (!t) continue;
      if (t.kind !== 'forest_floor' && t.kind !== 'grass' && t.kind !== 'sand') continue;
      if (t.debris) continue;

      // Keep clear of Dermaga center hub, bridges, buildings & house plots
      if (x >= 42 && x <= 62 && y >= 52 && y <= 65) continue;
      if (x >= 49 && x <= 54 && y >= 27 && y <= 34) continue;

      let nearStructure = false;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nt = tiles[(y + dy) * JARINGAN_COLS + (x + dx)];
          if (
            !nt ||
            nt.kind === 'bridge' ||
            nt.kind === 'pier' ||
            nt.kind === 'path' ||
            nt.kind === 'house_plot' ||
            nt.kind === 'jaringan_hall' ||
            nt.kind === 'jaringan_builder_hut' ||
            nt.kind === 'volcano_rock' ||
            nt.kind === 'volcano_lava'
          ) {
            nearStructure = true;
          }
        }
      }
      if (nearStructure) continue;

      let nearTree = false;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (occupied.has(`${x + dx},${y + dy}`)) nearTree = true;
        }
      }
      if (nearTree) continue;

      const h = (x * 61 + y * 83 + x * y * 11) % 100;
      const shouldPlace =
        t.kind === 'forest_floor' ? h < 26 : t.kind === 'grass' ? h < 14 : h < 12;

      if (!shouldPlace) continue;

      // Distribute all 10 exotic wood species naturally across the islands!
      let pool: JaringanWoodId[];
      if (y <= 32) {
        // Northern Volcano Island: Cendana, Ebony, Ulin, Sonokeling, Bengkirai
        pool = ['wood_cendana', 'wood_ebony', 'wood_ulin', 'wood_sonokeling', 'wood_bengkirai'];
      } else if (x <= 36) {
        // Western Rimba Island: Mahoni, Merbau, Sonokeling, Ulin, Sungkai
        pool = ['wood_mahoni', 'wood_merbau', 'wood_sonokeling', 'wood_ulin', 'wood_sungkai'];
      } else {
        // Eastern Island & others: Ebony, Trembesi, Meranti, Bengkirai, Cendana, Mahoni
        pool = ['wood_ebony', 'wood_trembesi', 'wood_meranti', 'wood_bengkirai', 'wood_cendana', 'wood_mahoni'];
      }

      const speciesIdx = Math.abs(x * 7 + y * 13 + idSeq) % pool.length;
      const treeSpecies = pool[speciesIdx];

      occupied.add(`${x},${y}`);
      trees.push({
        id: `jtree_${idSeq++}`,
        kind: t.kind === 'sand' ? 'palm' : 'oak',
        treeSpecies,
        x,
        y,
        hp: 3,
        maxHp: 3,
        stumpDaysLeft: 0,
      });
    }
  }

  return trees;
}
