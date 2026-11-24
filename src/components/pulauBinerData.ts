/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BAG_ITEMS,
  INTERIORS,
  NPCS,
  type BagItemDef,
  type BagItemId,
  type BinerBagItemId,
  type BinerInteriorId,
  type BinerNpcId,
  type CraftRecipe,
  type FarmTile,
  type InteriorDef,
  type InteriorId,
  type IslandRegionLabel,
  type NpcConfig,
  type NpcId,
  type TileKind,
  type Weather,
  type WorldTree,
} from './berkebunWorldData';
import {
  JARINGAN_BAG_ITEMS,
  JARINGAN_INTERIORS,
  JARINGAN_NPCS,
} from './pulauJaringanData';
import type { VehicleKind } from './berkebunPixelArt';

export const BINER_COLS = 84;
export const BINER_ROWS = 56;
export const FERRY_TICKET_COST = 150;

export interface VehicleDef {
  id: VehicleKind;
  name: string;
  cost: number;
  speedMult: number;
  desc: string;
}

export const BINER_VEHICLES: Record<VehicleKind, VehicleDef> = {
  scooter: {
    id: 'scooter',
    name: 'Skuter Listrik Biner',
    cost: 0,
    speedMult: 1.58,
    desc: 'Skuter listrik lincah gratis untuk seluruh tamu Pulau Biner! Bisa dipakai di semua pulau.',
  },
  taxi: {
    id: 'taxi',
    name: 'Taksi Kota Biner',
    cost: 450,
    speedMult: 1.76,
    desc: 'Taksi kuning modern berkecepatan tinggi dengan lampu sorot malam yang terang.',
  },
  suv: {
    id: 'suv',
    name: 'SUV Eksekutif Biner',
    cost: 850,
    speedMult: 1.92,
    desc: 'SUV tangguh elegan rancangan Biner Motors, mantap melaju di jalan raya maupun pantai.',
  },
  sedan: {
    id: 'sedan',
    name: 'Sedan Sport Kuantum',
    cost: 1250,
    speedMult: 2.1,
    desc: 'Mobil listrik sport tercepat di kepulauan! Menghemat waktu perjalanan antar dermaga.',
  },
};

export interface TrafficCircuitDef {
  id: string;
  kind: VehicleKind;
  speed: number;
  waypoints: Array<{ x: number; y: number }>;
  startSeg: number;
  startT: number;
}

// Closed-loop right-hand lane circuits strictly on [18..65] x [14..36]
export const BINER_TRAFFIC_CIRCUITS: TrafficCircuitDef[] = [
  {
    id: 'car_outer_cw',
    kind: 'sedan',
    speed: 0.058,
    waypoints: [
      { x: 19.5, y: 15.5 },
      { x: 64.5, y: 15.5 },
      { x: 64.5, y: 35.5 },
      { x: 19.5, y: 35.5 },
    ],
    startSeg: 0,
    startT: 0.25,
  },
  {
    id: 'car_plaza_ccw',
    kind: 'taxi',
    speed: 0.052,
    waypoints: [
      { x: 28.5, y: 24.5 },
      { x: 28.5, y: 36.5 },
      { x: 53.5, y: 36.5 },
      { x: 53.5, y: 24.5 },
    ],
    startSeg: 1,
    startT: 0.35,
  },
  {
    id: 'car_north_cw',
    kind: 'suv',
    speed: 0.054,
    waypoints: [
      { x: 29.5, y: 15.5 },
      { x: 64.5, y: 15.5 },
      { x: 64.5, y: 24.5 },
      { x: 29.5, y: 24.5 },
    ],
    startSeg: 2,
    startT: 0.45,
  },
  {
    id: 'car_west_ccw',
    kind: 'scooter',
    speed: 0.048,
    waypoints: [
      { x: 18.5, y: 14.5 },
      { x: 18.5, y: 36.5 },
      { x: 29.5, y: 36.5 },
      { x: 29.5, y: 14.5 },
    ],
    startSeg: 0,
    startT: 0.5,
  },
  {
    id: 'car_east_cw',
    kind: 'taxi',
    speed: 0.05,
    waypoints: [
      { x: 53.5, y: 15.5 },
      { x: 64.5, y: 15.5 },
      { x: 64.5, y: 35.5 },
      { x: 53.5, y: 35.5 },
    ],
    startSeg: 1,
    startT: 0.7,
  },
  {
    id: 'car_mid_ccw',
    kind: 'sedan',
    speed: 0.056,
    waypoints: [
      { x: 18.5, y: 24.5 },
      { x: 18.5, y: 36.5 },
      { x: 65.5, y: 36.5 },
      { x: 65.5, y: 24.5 },
    ],
    startSeg: 1,
    startT: 0.82,
  },
];

export const BINER_BAG_ITEMS: Record<BinerBagItemId, BagItemDef> = {
  biner_espresso: {
    id: 'biner_espresso',
    name: 'Espresso Korporat Biner',
    sellPrice: 120,
    energyRestore: 70,
    hpRestore: 25,
    usableEffect: 'eat',
    category: 'Korporat Biner',
    desc: 'Racikan kopi khas Kafe Siber Biner: +70 Energi, +25 HP & Lari Cepat!',
  },
  biner_energy_bar: {
    id: 'biner_energy_bar',
    name: 'Bar Nutrisi Eksekutif',
    sellPrice: 85,
    energyRestore: 55,
    hpRestore: 40,
    usableEffect: 'eat',
    category: 'Korporat Biner',
    desc: 'Camilan berenergi tinggi karyawan Menara Biner (+55 Energi, +40 HP).',
  },
  biner_cooling_gel: {
    id: 'biner_cooling_gel',
    name: 'Pendingin Cair Kuantum',
    sellPrice: 195,
    category: 'Teknologi Biner',
    desc: 'Gel pendingin suhu server superkomputer di Menara Biner & Menara Kuantum.',
  },
  biner_silicon_chip: {
    id: 'biner_silicon_chip',
    name: 'Chip Silikon Murni',
    sellPrice: 260,
    category: 'Teknologi Biner',
    desc: 'Prosesor mikro presisi tinggi buatan Lab R&D Pulau Biner.',
  },
  biner_quantum_battery: {
    id: 'biner_quantum_battery',
    name: 'Baterai Kuantum',
    sellPrice: 340,
    energyRestore: 100,
    hpRestore: 50,
    usableEffect: 'eat',
    category: 'Teknologi Biner',
    desc: 'Sumber energi padat! Bisa dipakai untuk isi ulang penuh Energi & +50 HP atau dijual.',
  },
  biner_drone_part: {
    id: 'biner_drone_part',
    name: 'Modul Drone Otonom',
    sellPrice: 410,
    category: 'Teknologi Biner',
    desc: 'Komponen baling-baling dan sensor AI untuk armada drone logistik.',
  },
  biner_hydro_pod: {
    id: 'biner_hydro_pod',
    name: 'Pod Hidroponik Pintar',
    sellPrice: 490,
    category: 'Teknologi Biner',
    desc: 'Kapsul tanam modern hasil kolaborasi Pulau TIK dan Pulau Biner.',
  },
  biner_ferry_ticket: {
    id: 'biner_ferry_ticket',
    name: 'Tiket Ferri Ekspres',
    sellPrice: 110,
    category: 'Korporat Biner',
    desc: 'Tiket pelayaran resmi sekali pakai untuk naik Perahu antara Pulau TIK & Pulau Biner.',
  },
  biner_vip_card: {
    id: 'biner_vip_card',
    name: 'Kartu Akses VIP Biner',
    sellPrice: 900,
    category: 'Korporat Biner',
    desc: 'Kartu keanggotaan eksekutif! Membebaskan biaya Perahu Ferri selamanya.',
  },
  biner_server_core: {
    id: 'biner_server_core',
    name: 'Inti Server Kuantum',
    sellPrice: 1400,
    category: 'Teknologi Biner',
    desc: 'Artefak teknologi tertinggi Pulau Biner hadiah KTT Masa Depan.',
  },
};

export const ALL_BAG_ITEMS: Record<BagItemId, BagItemDef> = {
  ...BAG_ITEMS,
  ...BINER_BAG_ITEMS,
  ...JARINGAN_BAG_ITEMS,
};

export interface BinerShopEntry {
  id: BinerBagItemId;
  buyCost: number;
  unlockMission?: number;
}

export const BINER_SHOP_CATALOG: BinerShopEntry[] = [
  { id: 'biner_espresso', buyCost: 95 },
  { id: 'biner_energy_bar', buyCost: 65 },
  { id: 'biner_ferry_ticket', buyCost: 120 },
  { id: 'biner_cooling_gel', buyCost: 140 },
  { id: 'biner_silicon_chip', buyCost: 210 },
  { id: 'biner_drone_part', buyCost: 310, unlockMission: 2 },
  { id: 'biner_quantum_battery', buyCost: 280, unlockMission: 2 },
  { id: 'biner_hydro_pod', buyCost: 390, unlockMission: 3 },
];

export const BINER_CRAFT_RECIPES: CraftRecipe[] = [
  {
    id: 'b_craft_cooling',
    title: 'Pendingin Cair Kuantum',
    desc: 'Rakit pendingin server dari hasil tambang & alam Pulau TIK.',
    ingredients: [
      { kind: 'bag', id: 'ore_copper', label: 'Bijih Tembaga', qty: 1 },
      { kind: 'bag', id: 'stone_res', label: 'Batu Granit', qty: 2 },
    ],
    resultType: 'bag',
    resultBagId: 'biner_cooling_gel',
    resultQty: 1,
  },
  {
    id: 'b_craft_chip',
    title: 'Chip Silikon Murni',
    desc: 'Komponen prosesor utama untuk misi R&D & rakitan berteknologi tinggi.',
    ingredients: [
      { kind: 'bag', id: 'ore_copper', label: 'Bijih Tembaga', qty: 1 },
      { kind: 'bag', id: 'ore_silver', label: 'Bijih Perak', qty: 1 },
    ],
    resultType: 'bag',
    resultBagId: 'biner_silicon_chip',
    resultQty: 1,
  },
  {
    id: 'b_craft_drone',
    title: 'Modul Drone Otonom',
    desc: 'Rakit komponen drone logistik untuk armada Dimas di Pulau Biner.',
    ingredients: [
      { kind: 'bag', id: 'biner_silicon_chip', label: 'Chip Silikon', qty: 1 },
      { kind: 'bag', id: 'ore_copper', label: 'Bijih Tembaga', qty: 1 },
    ],
    resultType: 'bag',
    resultBagId: 'biner_drone_part',
    resultQty: 1,
  },
  {
    id: 'b_craft_battery',
    title: 'Baterai Kuantum',
    desc: 'Baterai berkapasitas tinggi: pulihkan energi penuh atau jual mahal!',
    ingredients: [
      { kind: 'bag', id: 'biner_silicon_chip', label: 'Chip Silikon', qty: 1 },
      { kind: 'bag', id: 'ore_silver', label: 'Bijih Perak', qty: 1 },
    ],
    resultType: 'bag',
    resultBagId: 'biner_quantum_battery',
    resultQty: 1,
  },
  {
    id: 'b_craft_hydro',
    title: 'Pod Hidroponik Pintar',
    desc: 'Kapsul tanam pintar kolaborasi Pulau TIK & Taman Surya Biner.',
    ingredients: [
      { kind: 'bag', id: 'biner_silicon_chip', label: 'Chip Silikon', qty: 1 },
      { kind: 'bag', id: 'wood_res', label: 'Kayu Keras', qty: 3 },
    ],
    resultType: 'bag',
    resultBagId: 'biner_hydro_pod',
    resultQty: 1,
  },
];

export interface BinerMissionDef {
  chapter: number;
  title: string;
  speakerNpc: BinerNpcId;
  summary: string;
  objectiveText: string;
  unlockHint: string;
  rewardGold: number;
  rewardScore: number;
  rewardItem?: BinerBagItemId;
  rewardQty?: number;
}

export const BINER_MISSIONS: BinerMissionDef[] = [
  {
    chapter: 1,
    title: 'Misi Biner 1: Selamat Datang di Metropolis',
    speakerNpc: 'b_nadia',
    summary:
      'Kamu baru tiba di Pulau Biner dengan Perahu Ferri! Masuklah ke Menara Biner Corp di pusat kota, sapa resepsionis Nadia Putri di Lantai 1, dan mulai misi korporat pertamamu.',
    objectiveText: 'Masuk ke Lobi Menara Biner Corp (Lt. 1) lalu bicara dengan Nadia Putri.',
    unlockHint: 'Hadiah: 200G & 2× Espresso Korporat Biner + Akses Misi Lab R&D!',
    rewardGold: 200,
    rewardScore: 500,
    rewardItem: 'biner_espresso',
    rewardQty: 2,
  },
  {
    chapter: 2,
    title: 'Misi Biner 2: Krisis Pendingin Server',
    speakerNpc: 'b_reno',
    summary:
      'Server R&D di Menara Biner Lantai 2 kepanasan! Belilah di Kafe Siber atau rakit di Terminal Tech: minimal 2 Pendingin Cair Kuantum (atau bawa 2 Bijih Perak), lalu temui Dr. Reno Kusuma di Menara Biner Lt. 2.',
    objectiveText: 'Miliki 2 Pendingin Cair Kuantum (atau 2 Bijih Perak) lalu temui Dr. Reno di Lt. 2.',
    unlockHint: 'Membuka stok Drone & Baterai Kuantum di Toko Kafe Siber + 2× Chip Silikon!',
    rewardGold: 380,
    rewardScore: 800,
    rewardItem: 'biner_silicon_chip',
    rewardQty: 2,
  },
  {
    chapter: 3,
    title: 'Misi Biner 3: Audit Keamanan & Drone',
    speakerNpc: 'b_clara',
    summary:
      'VP Clara Tan membutuhkan verifikasi sistem keamanan Menara Kuantum dan armada drone logistik. Siapkan 1 Chip Silikon Murni dan 1 Modul Drone Otonom, lalu lapor ke Bu Clara di Menara Biner Lantai 3!',
    objectiveText: 'Miliki 1 Chip Silikon & 1 Modul Drone Otonom lalu temui VP Clara di Menara Biner Lt. 3.',
    unlockHint: 'Membuka Pod Hidroponik Pintar + Hadiah Baterai Kuantum!',
    rewardGold: 580,
    rewardScore: 1100,
    rewardItem: 'biner_quantum_battery',
    rewardQty: 1,
  },
  {
    chapter: 4,
    title: 'Misi Biner 4: Sinergi Pangan & Energi Surya',
    speakerNpc: 'b_tania',
    summary:
      'Pulau Biner ingin menggabungkan agroteknologi dengan kebun alami Pulau TIK! Miliki minimal 10 total panen kebun dan 1 Pod Hidroponik Pintar, lalu temui Tania Lestari di Taman Surya Timur.',
    objectiveText: 'Miliki total 10 Panen Kebun & 1 Pod Hidroponik Pintar, lalu temui Tania Lestari.',
    unlockHint: 'Membuka KTT Eksekutif Rooftop Lantai 4 bersama CEO Hendra Wijaya!',
    rewardGold: 850,
    rewardScore: 1500,
    rewardItem: 'biner_energy_bar',
    rewardQty: 3,
  },
  {
    chapter: 5,
    title: 'Misi Biner 5: KTT Aliansi Pulau TIK–Biner',
    speakerNpc: 'b_hendra',
    summary:
      'Naiklah menggunakan Lift ke Lantai 4 (Rooftop Helipad) Menara Biner Corp untuk bertemu CEO Hendra Wijaya dan menandatangani Aliansi Masa Depan kedua pulau!',
    objectiveText: 'Naik ke Rooftop Menara Biner (Lt. 4) dan bicara dengan CEO Hendra Wijaya!',
    unlockHint: 'Hadiah Utama: 2.500G, Kartu VIP Perahu Gratis Selamanya & Inti Server Kuantum!',
    rewardGold: 2500,
    rewardScore: 3000,
    rewardItem: 'biner_vip_card',
    rewardQty: 1,
  },
];

export const BINER_REGIONS: IslandRegionLabel[] = [
  {
    id: 'b_harbor',
    name: 'Dermaga Ferri Biner',
    x: 34,
    y: 41,
    w: 16,
    h: 11,
    color: '#0284c7',
    desc: 'Pelabuhan modern tempat Ferri dari Pulau TIK bersandar bersama Nakhoda Budi.',
  },
  {
    id: 'b_tower_district',
    name: 'Distrik Menara Biner Corp',
    x: 35,
    y: 15,
    w: 14,
    h: 11,
    color: '#06b6d4',
    desc: 'Gedung pencakar langit 4 lantai: Lobi, Lab R&D, Direksi & Rooftop Helipad.',
  },
  {
    id: 'b_quantum_district',
    name: 'Menara Kuantum Data',
    x: 53,
    y: 15,
    w: 12,
    h: 11,
    color: '#6366f1',
    desc: 'Menara 3 lantai Pusat Data, Divisi AI & Dek Observasi Satelit.',
  },
  {
    id: 'b_mall_district',
    name: 'Mal & Kafe Siber Biner',
    x: 17,
    y: 25,
    w: 12,
    h: 9,
    color: '#ec4899',
    desc: 'Pusat perbelanjaan item teknologi modern & Co-Working Hub 2 lantai.',
  },
  {
    id: 'b_hotel_district',
    name: 'Hotel Eksekutif Biner',
    x: 54,
    y: 25,
    w: 12,
    h: 9,
    color: '#f59e0b',
    desc: 'Apartemen & Hotel mewah 2 lantai untuk beristirahat & memulihkan tenaga.',
  },
  {
    id: 'b_drone_park',
    name: 'Taman Drone & Logistik Barat',
    x: 9,
    y: 14,
    w: 14,
    h: 10,
    color: '#10b981',
    desc: 'Landasan helipad drone otonom yang dikelola Pilot Dimas.',
  },
  {
    id: 'b_solar_park',
    name: 'Taman Energi Surya & Hidroponik',
    x: 65,
    y: 14,
    w: 13,
    h: 15,
    color: '#22c55e',
    desc: 'Kebun panel surya & riset hidroponik modern pimpinan Tania Lestari.',
  },
  {
    id: 'b_plaza',
    name: 'Alun-Alun Air Mancur Neon',
    x: 34,
    y: 26,
    w: 15,
    h: 10,
    color: '#a855f7',
    desc: 'Pusat keramaian kota tempat para pekerja, jurnalis & HRD berkumpul.',
  },
];

export interface BinerNpcAppearance {
  hair: string;
  skin: string;
  suit: string;
  shirt: string;
  tie: string;
  pants: string;
  accessory?: 'glasses' | 'headset' | 'hardhat' | 'apron' | 'cap';
}

export const BINER_NPC_STYLES: Record<BinerNpcId, BinerNpcAppearance> = {
  b_hendra: { hair: '#334155', skin: '#f3c49b', suit: '#0f172a', shirt: '#f8fafc', tie: '#facc15', pants: '#0f172a', accessory: 'glasses' },
  b_clara: { hair: '#451a03', skin: '#fde2c4', suit: '#1e3a8a', shirt: '#ffffff', tie: '#ec4899', pants: '#1e293b', accessory: 'glasses' },
  b_reno: { hair: '#78350f', skin: '#f3c49b', suit: '#f8fafc', shirt: '#38bdf8', tie: '#0284c7', pants: '#334155', accessory: 'glasses' },
  b_nadia: { hair: '#1e1b4b', skin: '#fde2c4', suit: '#0284c7', shirt: '#ffffff', tie: '#f472b6', pants: '#0f172a', accessory: 'headset' },
  b_rizal: { hair: '#0f172a', skin: '#e8b489', suit: '#1e293b', shirt: '#22c55e', tie: '#16a34a', pants: '#0f172a', accessory: 'headset' },
  b_siska: { hair: '#7c2d12', skin: '#fde2c4', suit: '#4338ca', shirt: '#e0f2fe', tie: '#38bdf8', pants: '#1e1b4b' },
  b_aldi: { hair: '#292524', skin: '#f3c49b', suit: '#334155', shirt: '#a855f7', tie: '#c084fc', pants: '#1e293b', accessory: 'glasses' },
  b_viona: { hair: '#db2777', skin: '#fde2c4', suit: '#be185d', shirt: '#fdf2f8', tie: '#facc15', pants: '#312e81' },
  b_kevin: { hair: '#451a03', skin: '#f3c49b', suit: '#78350f', shirt: '#f8fafc', tie: '#b45309', pants: '#1c1917', accessory: 'apron' },
  b_fajar: { hair: '#1c1917', skin: '#e8b489', suit: '#ea580c', shirt: '#fef08a', tie: '#f97316', pants: '#334155', accessory: 'hardhat' },
  b_bella: { hair: '#92400e', skin: '#fde2c4', suit: '#0d9488', shirt: '#ffffff', tie: '#2dd4bf', pants: '#1e293b' },
  b_dimas: { hair: '#0f172a', skin: '#f3c49b', suit: '#059669', shirt: '#ecfdf5', tie: '#facc15', pants: '#1e293b', accessory: 'cap' },
  b_celine: { hair: '#b45309', skin: '#fde2c4', suit: '#7c3aed', shirt: '#ffffff', tie: '#facc15', pants: '#312e81', accessory: 'glasses' },
  b_agus: { hair: '#475569', skin: '#e8b489', suit: '#1e3a8a', shirt: '#38bdf8', tie: '#0f172a', pants: '#0f172a', accessory: 'cap' },
  b_tania: { hair: '#14532d', skin: '#fde2c4', suit: '#16a34a', shirt: '#f0fdf4', tie: '#84cc16', pants: '#1e293b' },
  b_oki: { hair: '#27272a', skin: '#f3c49b', suit: '#d97706', shirt: '#fef3c7', tie: '#78350f', pants: '#334155', accessory: 'hardhat' },
  b_gita: { hair: '#701a75', skin: '#fde2c4', suit: '#0891b2', shirt: '#ffffff', tie: '#f43f5e', pants: '#1e293b' },
  b_budi: { hair: '#334155', skin: '#e8b489', suit: '#1d4ed8', shirt: '#f8fafc', tie: '#facc15', pants: '#0f172a', accessory: 'cap' },
  b_rara: { hair: '#9a3412', skin: '#fde2c4', suit: '#b45309', shirt: '#fffbeb', tie: '#facc15', pants: '#451a03' },
  b_yuda: { hair: '#e2e8f0', skin: '#f3c49b', suit: '#312e81', shirt: '#f8fafc', tie: '#38bdf8', pants: '#1e1b4b', accessory: 'glasses' },
};

export const BINER_NPCS: Record<BinerNpcId, NpcConfig> = {
  b_hendra: {
    id: 'b_hendra',
    name: 'CEO Hendra Wijaya',
    role: 'CEO & Pendiri Biner Corp',
    homeRegion: 'Menara Biner Corp Lt. 4 Rooftop',
    homeInterior: 'biner_tower_f4',
    baseX: 40,
    baseY: 23,
    patrolRadius: 1.5,
    favoriteCategory: 'Espresso / Inti Server',
    color: '#facc15',
    greetingsByChapter: {
      1: 'Selamat datang di Menara Biner Corp, mitra muda dari Pulau TIK! Terus bantu tim kami dari Lantai 1 hingga Lantai 4!',
      2: 'Kudengar Dr. Reno butuh pendingin server di Lantai 2. Efisiensi data adalah jantung Pulau Biner.',
      3: 'Kerja bagus dengan VP Clara! Teknologi dan ketekunan petani ternyata sangat serasi.',
      4: 'Proyek hidroponik Tania hampir rampung. Temui aku lagi saat siap untuk KTT Aliansi di Rooftop ini!',
      5: 'Aliansi Pulau TIK dan Pulau Biner resmi terjalin! Gunakan Kartu VIP untuk pelayaran bebas biaya selamanya!',
    },
    chitChatLines: [
      'Menara ini berdiri setinggi 4 lantai—dari Lobi sampai Helipad di puncak!',
      'Kami mencari mitra pangan sehat dari Pulau TIK untuk ratusan karyawan di sini.',
      'Masa depan terbaik adalah teknologi modern yang tetap menjaga alam hijau.',
    ],
    secretLore: 'Rahasia CEO Hendra: Dulu aku memulai karier di desa kecil sebelum membangun Menara Biner.',
  },
  b_clara: {
    id: 'b_clara',
    name: 'VP Clara Tan',
    role: 'VP Operasional Menara Biner',
    homeRegion: 'Menara Biner Corp Lt. 3 Direksi',
    homeInterior: 'biner_tower_f3',
    baseX: 42,
    baseY: 23,
    patrolRadius: 1.4,
    favoriteCategory: 'Kopi / Pod Hidroponik',
    color: '#ec4899',
    greetingsByChapter: {
      1: 'Halo! Lantai 3 ini adalah Ruang Direksi. Selesaikan tugas di Lobi dan Lab R&D dulu ya.',
      2: 'Pastikan pendingin server Dr. Reno di Lantai 2 beres sebelum audit dimulai.',
      3: 'Bagus sekali! Dengan 1 Chip Silikon & 1 Modul Drone Otonom, rantai pasok Biner kembali stabil!',
      4: 'Lanjut bantu Tania di Taman Surya Timur agar proyek pangan hijau kita lolos uji!',
      5: 'Laporan audit sempurna! CEO Hendra menunggumu di Lantai 4 Rooftop!',
    },
    chitChatLines: [
      'Meja rapat panjang di ruang ini dipakai tiap pagi untuk rapat direksi.',
      'Naik ke Lantai 4 pakai Lift di kanan ruangan kalau ingin menikmati angin laut dari Helipad!',
      'Kami membayar mahal hasil panen berkualitas emas maupun komponen teknologi.',
    ],
    secretLore: 'Rahasia VP Clara: Kopi dari Pulau TIK jauh lebih harum daripada mesin kopi kantor manapun.',
  },
  b_reno: {
    id: 'b_reno',
    name: 'Dr. Reno Kusuma',
    role: 'Kepala Riset AI & Kuantum',
    homeRegion: 'Menara Biner Corp Lt. 2 Lab R&D',
    homeInterior: 'biner_tower_f2',
    baseX: 39,
    baseY: 23,
    patrolRadius: 1.5,
    favoriteCategory: 'Pendingin / Chip Silikon',
    color: '#38bdf8',
    greetingsByChapter: {
      1: 'Salam ilmiah! Aku memimpin Lab R&D di Lantai 2 Menara Biner.',
      2: 'Tolong! Server Lab R&D terlalu panas! Bawakan 2 Pendingin Cair Kuantum (atau 2 Bijih Perak) secepatnya!',
      3: 'Suhu server stabil di 22°C! Gunakan Terminal Tech di lab ini untuk merakit Chip & Drone!',
      4: 'Chip silikonmu bekerja mulus pada sistem kontrol drone dan hidroponik!',
      5: 'Penelitian gabungan Pulau TIK dan Pulau Biner tercatat dalam sejarah sains!',
    },
    chitChatLines: [
      'Terminal Komputer Tech di sebelahku bisa dipakai merakit komponen canggih dari bijih tambang!',
      'Jika butuh Pendingin Cair Kuantum cepat, beli di Kafe Siber atau rakit di Terminal Lab.',
      'Bijih Perak dan Kristal Bintang dari gua Pulau TIK ternyata konduktor kuantum alami!',
    ],
    secretLore: 'Rahasia Dr. Reno: Aku diam-diam kagum pada kincir angin tradisional Pulau TIK.',
  },
  b_nadia: {
    id: 'b_nadia',
    name: 'Nadia Putri',
    role: 'Resepsionis Utama Menara Biner',
    homeRegion: 'Menara Biner Corp Lt. 1 Lobi',
    homeInterior: 'biner_tower_f1',
    baseX: 41,
    baseY: 23,
    patrolRadius: 1.2,
    favoriteCategory: 'Espresso / Bunga Matahari',
    color: '#0284c7',
    greetingsByChapter: {
      1: 'Selamat datang di Lobi Menara Biner Corp! Kartu akses pengunjung sudah aktif—silakan naik Lift ke Lantai 2, 3, hingga 4!',
      2: 'Dr. Reno di Lantai 2 sedang mencari bantuan pendingin server. Naik saja lewat Lift di ujung lobi!',
      3: 'VP Clara di Lantai 3 memuji ketangkasanmu!',
      4: 'Banyak karyawan kini memesan paket sayur dan kopi dari kebunmu lho!',
      5: 'Selamat menjadi Mitra Kehormatan VIP Menara Biner Corp!',
    },
    chitChatLines: [
      'Menara Biner memiliki 4 lantai yang bisa dijelajahi bebas lewat Lift!',
      'Di sebelah barat lobi ada jalan raya menuju Mal & Kafe Siber Biner.',
      'Jangan lupa cicipi Espresso Korporat di Kafe Siber kalau energi mulai menipis.',
    ],
    secretLore: 'Tip Nadia: Kartu VIP Biner dari CEO Hendra membuatmu naik ferri Pulau TIK <-> Biner gratis selamanya!',
  },
  b_rizal: {
    id: 'b_rizal',
    name: 'Rizal Pratama',
    role: 'Kepala Keamanan Siber',
    homeRegion: 'Menara Kuantum Data Lt. 1',
    homeInterior: 'biner_quantum_f1',
    baseX: 58,
    baseY: 23,
    patrolRadius: 1.4,
    favoriteCategory: 'Baterai Kuantum / Kopi',
    color: '#22c55e',
    greetingsByChapter: {
      1: 'Selamat datang di Menara Kuantum Data! Aku memantau firewall seluruh Pulau Biner.',
      2: 'Setelah server Lt. 2 Menara Biner dingin, kami siap sinkronisasi jaringan dengan Menara Kuantum.',
      3: 'Semua node keamanan terenkripsi! Cek Divisi AI di Lantai 2 atau lapor ke VP Clara.',
      4: 'Sensor satelit di Lantai 3 mendeteksi sinyal energi hijau yang sangat bersih dari Pulau TIK.',
      5: 'Keamanan siber dua pulau kini tak tertembus!',
    },
    chitChatLines: [
      'Menara Kuantum punya 3 lantai penuh rak server dan dek satelit!',
      'Jangan sembarangan colok USB asing ke terminal server ya!',
      'Kamu juga bisa merakit komponen tech di Terminal Siber lantai ini.',
    ],
    secretLore: 'Rahasia Rizal: Password cadangan server utama disimpan di loker fisik anti-EMP.',
  },
  b_siska: {
    id: 'b_siska',
    name: 'Siska Maharani',
    role: 'Arsitek Cloud & Infrastruktur',
    homeRegion: 'Depan Menara Kuantum',
    homeInterior: 'biner_quantum_f1',
    baseX: 58.5,
    baseY: 23.4,
    patrolRadius: 2.0,
    favoriteCategory: 'Espresso / Chip Silikon',
    color: '#6366f1',
    greetingsByChapter: {
      1: 'Hai! Aku Siska. Sedang memeriksa jalur serat optik bawah laut menuju Pulau TIK!',
      2: 'Kabel pendingin Menara Kuantum sudah tersambung rapi ke Menara Biner.',
      3: 'Kalau butuh Chip Silikon, rakit di Terminal Lab atau beli di Kafe Siber!',
      4: 'Cloud kita sekarang disuplai 100% dari panel surya Taman Timur!',
      5: 'Latensi jaringan antara Pulau TIK dan Pulau Biner sekarang di bawah 2 milidetik!',
    },
    chitChatLines: [
      'Menara Kuantum di belakangku punya 3 lantai—coba naik Lift ke Dek Satelit di Lantai 3!',
      'Arsitektur cloud modern mirip seperti sistem irigasi kebun: harus merata dan tanpa bottleneck.',
      'Jalan raya aspal di Pulau Biner rapi sekali dengan zebra cross di setiap persimpangan.',
    ],
    secretLore: 'Rahasia Siska: Kabel serat optik utama melewati dasar karang di sebelah Pulau Bintang.',
  },
  b_aldi: {
    id: 'b_aldi',
    name: 'Aldi Gunawan',
    role: 'Analis Big Data Senior',
    homeRegion: 'Menara Kuantum Data Lt. 2',
    homeInterior: 'biner_quantum_f2',
    baseX: 59,
    baseY: 23,
    patrolRadius: 1.2,
    favoriteCategory: 'Bar Nutrisi / Baterai Kuantum',
    color: '#a855f7',
    greetingsByChapter: {
      1: 'Yo! Di Lantai 2 Divisi AI ini aku menganalisis tren harga pangan dan teknologi.',
      2: 'Data menunjukkan permintaan kopi dan stroberi dari Pulau TIK melonjak 300%!',
      3: 'Algoritma rute drone Dimas sudah kuoptimalkan memakai Chip Silikon!',
      4: 'Model prediksi cuaca AI kami cocok 99% dengan teleskop Tara di Pulau TIK!',
      5: 'Semua grafik pertumbuhan Pulau Biner hari ini berwarna hijau cerah!',
    },
    chitChatLines: [
      'Naik satu lantai lagi dari sini ada Prof. Yuda di Dek Satelit Lantai 3!',
      'Big Data tanpa akal sehat seperti kebun tanpa air.',
      'Espresso Korporat adalah bahan bakar utama tim analis kami saat lembur.',
    ],
    secretLore: 'Rahasia Aldi: Aku pakai algoritma penjadwalan panen untuk mengatur waktu makan siang timku.',
  },
  b_viona: {
    id: 'b_viona',
    name: 'Viona Laras',
    role: 'UI/UX Lead Designer',
    homeRegion: 'Co-Working Hub Mal Lt. 2',
    homeInterior: 'biner_mall_f2',
    baseX: 22,
    baseY: 32,
    patrolRadius: 1.4,
    favoriteCategory: 'Espresso / Bunga Matahari',
    color: '#ec4899',
    greetingsByChapter: {
      1: 'Halo! Selamat datang di Co-Working Hub Lantai 2 Mal Biner!',
      2: 'Aku lagi mendesain antarmuka dashboard monitoring drone dan kebun pintar.',
      3: 'Warna cyan dan krem hangat ternyata paling nyaman dilihat pekerja kantor.',
      4: 'UI untuk Pod Hidroponik Tania sudah siap rilis ke produksi!',
      5: 'Keren banget bisa berkolaborasi langsung dengan petani top dari Pulau TIK!',
    },
    chitChatLines: [
      'Di lantai bawah (Lt. 1) ada Kafe Siber Kevin tempat beli item khusus Pulau Biner!',
      'Desain yang baik itu langsung dipahami pengguna dalam 3 detik.',
      'Sofa lounge di Co-Working Hub ini empuk sekali buat istirahat sejenak.',
    ],
    secretLore: 'Rahasia Viona: Ikon alat yang makin bersinar tiap di-upgrade itu hasil inspirasi game retro favoritku.',
  },
  b_kevin: {
    id: 'b_kevin',
    name: 'Kevin Hartono',
    role: 'Barista & Pemilik Tech Store',
    homeRegion: 'Mal & Kafe Siber Lt. 1',
    homeInterior: 'biner_mall_f1',
    baseX: 22.5,
    baseY: 32,
    patrolRadius: 1.2,
    favoriteCategory: 'Kopi Gunung / Espresso',
    color: '#b45309',
    greetingsByChapter: {
      1: 'Selamat datang di Kafe Siber & Tech Store Pulau Biner! Klik meja kasir untuk belanja item korporat atau jual hasil panen!',
      2: 'Butuh Pendingin Cair Kuantum buat Dr. Reno? Aku sedia stok di etalase toko!',
      3: 'Stok Modul Drone & Baterai Kuantum baru saja mendarat di toko!',
      4: 'Pod Hidroponik Pintar sekarang juga tersedia di Kafe Siber ini!',
      5: 'Pelanggan VIP! Semua kopi spesial Pulau TIK selalu laku keras di kafe ini!',
    },
    chitChatLines: [
      'Selain beli Espresso dan Bar Nutrisi, kamu juga bisa menjual hasil panen & tambangmu di sini!',
      'Naik ke Lantai 2 Mal kalau mau bertemu para desainer dan investor startup!',
      'Tiket Ferri Ekspres di tokoku lebih hemat dibanding bayar tunai di dermaga!',
    ],
    secretLore: 'Rahasia Kevin: Biji kopi terbaikku kupesan langsung dari kebun Kopi Gunung Pulau TIK.',
  },
  b_fajar: {
    id: 'b_fajar',
    name: 'Fajar Nugroho',
    role: 'Teknisi Jaringan & Fiber',
    homeRegion: 'Boulevard Timur Pulau Biner',
    homeInterior: 'biner_quantum_f1',
    baseX: 54.6,
    baseY: 23.4,
    patrolRadius: 2.0,
    favoriteCategory: 'Bar Nutrisi / Bijih Tembaga',
    color: '#f97316',
    greetingsByChapter: {
      1: 'Halo! Aku Fajar, teknisi kabel fiber di sepanjang boulevard Pulau Biner.',
      2: 'Semua lampu jalan neon di kota ini otomatis menyala terang saat jam 18:00 malam!',
      3: 'Kalau butuh tembaga dan perak untuk rakit chip, tambang saja di Gua Pulau TIK lalu bawa kemari!',
      4: 'Jaringan listrik surya kita sekarang tersambung ke seluruh empat gedung utama.',
      5: 'Tidak ada lagi gangguan sinyal di seluruh Pulau Biner!',
    },
    chitChatLines: [
      'Gunakan zebra cross saat menyeberang jalan raya biar tertib!',
      'Di timur sana ada Taman Surya tempat Tania menanam hidroponik modern.',
      'Helm pengaman ini wajib dipakai setiap cek kotak fiber.',
    ],
    secretLore: 'Rahasia Fajar: Aku sering nongkrong di Kafe Siber Kevin sepulang kerja jam 6 sore.',
  },
  b_bella: {
    id: 'b_bella',
    name: 'Bella Safitri',
    role: 'Manajer HRD Biner Corp',
    homeRegion: 'Alun-Alun Air Mancur Neon',
    homeInterior: 'biner_tower_f1',
    baseX: 36.5,
    baseY: 29.5,
    patrolRadius: 2.4,
    favoriteCategory: 'Selai Stroberi / Espresso',
    color: '#14b8a6',
    greetingsByChapter: {
      1: 'Hai! Aku Bella dari HRD Biner Corp. Senang akhirnya ada tamu berbakat dari Pulau TIK!',
      2: 'Karyawan yang minum Espresso Korporat atau tidur di Hotel Eksekutif selalu lebih produktif.',
      3: 'VP Clara bilang kinerjamu setara manajer proyek senior!',
      4: 'Program pertukaran talenta Pulau TIK <-> Pulau Biner bakal segera dibuka!',
      5: 'Selamat atas posisi Mitra Strategis Eksekutif Pulau Biner!',
    },
    chitChatLines: [
      'Air mancur neon di tengah alun-alun ini spot foto favorit karyawan.',
      'Hotel Eksekutif di sebelah timur plaza punya suite VIP di Lantai 2 kalau kamu perlu tidur memulihkan stamina!',
      'Di Pulau Biner ada 20 staf & profesional yang siap membantumu.',
    ],
    secretLore: 'Rahasia Bella: CEO Hendra paling menghargai orang yang menyelesaikan tugas tepat waktu.',
  },
  b_dimas: {
    id: 'b_dimas',
    name: 'Dimas Saputra',
    role: 'Pilot Drone Pengantar Biner',
    homeRegion: 'Taman Drone & Helipad Barat',
    homeInterior: 'biner_mall_f1',
    baseX: 16.0,
    baseY: 20.5,
    patrolRadius: 2.4,
    favoriteCategory: 'Modul Drone / Kopi',
    color: '#10b981',
    greetingsByChapter: {
      1: 'Siap terbang! Ini landasan Drone Logistik Pulau Biner.',
      2: 'Armada drone kami mengirim paket antar-gedung tanpa macet!',
      3: 'Modul Drone Otonom darimu bikin jarak jelajah drone naik dua kali lipat!',
      4: 'Nantinya drone ini bakal bantu antar hasil panen Pulau TIK langsung ke pasar Biner!',
      5: 'Langit Pulau Biner dan Pulau TIK kini terbuka penuh untuk logistik ramah lingkungan!',
    },
    chitChatLines: [
      'Helipad di sini terhubung langsung dengan Helipad Rooftop di Lantai 4 Menara Biner!',
      'Baling-baling drone butuh sensor Chip Silikon agar tetap stabil saat hujan.',
      'Kalau capek jalan keliling pulau yang luas ini, minum Espresso Biner biar larinya ngebut!',
    ],
    secretLore: 'Rahasia Dimas: Aku pernah melihat Pohon Cahaya Pulau TIK bersinar dari ketinggian 500 meter!',
  },
  b_celine: {
    id: 'b_celine',
    name: 'Celine Wijoyo',
    role: 'Investor & Analis Startup',
    homeRegion: 'Co-Working Hub Mal Lt. 2',
    homeInterior: 'biner_mall_f2',
    baseX: 24,
    baseY: 32,
    patrolRadius: 1.5,
    favoriteCategory: 'Inti Server / Kopi Sangrai',
    color: '#8b5cf6',
    greetingsByChapter: {
      1: 'Halo! Aku Celine. Aku berinvestasi di startup agroteknologi & AI di Pulau Biner.',
      2: 'Nilai saham Biner Corp naik tajam sejak ada pasokan bahan baku dari Pulau TIK!',
      3: 'Kombinasi Chip Silikon dan hasil panen emas itu peluang pasar miliaran gold!',
      4: 'Pod Hidroponik Pintar bakal jadi produk ekspor nomor satu pulau ini!',
      5: 'Dengan Kartu VIP di tanganmu, seluruh jaringan bisnis Pulau Biner terbuka lebar untukmu!',
    },
    chitChatLines: [
      'Startup terbaik lahir dari masalah nyata di lapangan—seperti pengairan sawah otomatis.',
      'Kalau punya Inti Server Kuantum atau Kristal Bintang, harganya luar biasa tinggi!',
      'Co-Working Hub ini selalu penuh ide brilian.',
    ],
    secretLore: 'Rahasia Celine: Aku siap mendanai jembatan udara kalau ferri suatu hari nanti terlalu penuh.',
  },
  b_agus: {
    id: 'b_agus',
    name: 'Pak Agus Santoso',
    role: 'Kepala Sekuriti Menara Biner',
    homeRegion: 'Gerbang Menara Biner Corp',
    homeInterior: 'biner_tower_f1',
    baseX: 41.0,
    baseY: 23.4,
    patrolRadius: 1.6,
    favoriteCategory: 'Bar Nutrisi / Telur Ayam',
    color: '#1e3a8a',
    greetingsByChapter: {
      1: 'Hormat! Pintu Menara Biner Corp ada tepat di belakang saya. Silakan masuk, ada 4 lantai yang bisa dikunjungi!',
      2: 'Pastikan selalu perhatikan indikator Lantai di dalam gedung ya!',
      3: 'Tamu dari Pulau TIK selalu saya catat sebagai tamu prioritas aman.',
      4: 'Menara Kuantum di timur sana juga sudah membuka akses 3 lantainya untukmu!',
      5: 'Pengamanan KTT Rooftop aman terkendali 100%, Bos!',
    },
    chitChatLines: [
      'Masuk Menara Biner lewat pintu kaca putar di depan ini!',
      'Di dalam gedung ada Lift Naik & Lift Turun—kamu juga bisa pakai tombol pilih lantai di layar!',
      'Malam hari lampu-lampu kota Pulau Biner terlihat megah sekali.',
    ],
    secretLore: 'Rahasia Pak Agus: Sebenarnya aku juga hobi menanam lobak di pot balkon rumahku.',
  },
  b_tania: {
    id: 'b_tania',
    name: 'Tania Lestari',
    role: 'Ahli Energi Surya & Hidroponik',
    homeRegion: 'Taman Energi Surya Timur',
    homeInterior: 'biner_hotel_f1',
    baseX: 69.5,
    baseY: 20.5,
    patrolRadius: 2.8,
    favoriteCategory: 'Pod Hidroponik / Buah / Pupuk',
    color: '#22c55e',
    greetingsByChapter: {
      1: 'Halo! Panel surya di taman timur ini menyuplai listrik bersih untuk seluruh gedung tinggi Pulau Biner!',
      2: 'Aku sedang meneliti cara menanam sayur tropis dengan sistem hidroponik tenaga surya.',
      3: 'Sebentar lagi riset Pod Hidroponik Pintar akan siap diuji coba bersama Pulau TIK!',
      4: 'Pas sekali! Dengan 10 hasil panen pengalamanmu & 1 Pod Hidroponik Pintar, integrasi energi hijau & kebun resmi berhasil!',
      5: 'Berkatmu, Pulau Biner yang modern kini tetap hijau dan ramah lingkungan!',
    },
    chitChatLines: [
      'Lihat barisan panel surya di sebelahku—mereka menghasilkan energi tanpa asap!',
      'Pohon-pohon hias di taman kota membantu menjaga udara Pulau Biner tetap sejuk.',
      'Pupuk Subur dari Pulau TIK ternyata cocok juga untuk nutrisi hidroponik!',
    ],
    secretLore: 'Rahasia Tania: Aku dan Dewi di Pulau Bambu dulu pernah kuliah botani bersama!',
  },
  b_oki: {
    id: 'b_oki',
    name: 'Oki Ramadhan',
    role: 'Teknisi Lift & Gedung Modern',
    homeRegion: 'Hotel Eksekutif Biner Lt. 1',
    homeInterior: 'biner_hotel_f1',
    baseX: 59,
    baseY: 32,
    patrolRadius: 1.4,
    favoriteCategory: 'Espresso / Kayu Keras',
    color: '#d97706',
    greetingsByChapter: {
      1: 'Halo! Saya Oki yang merawat semua sistem Lift berkecepatan tinggi di Pulau Biner.',
      2: 'Semua Lift di Menara Biner, Menara Kuantum, Mal, dan Hotel dijamin mulus dan aman!',
      3: 'Kalau lelah berkeliling kota, naik saja ke Lantai 2 Hotel ini untuk istirahat di Suite VIP.',
      4: 'Mesin Lift sekarang ditenagai listrik tenaga surya dari Taman Timur!',
      5: 'Siap melayani naik-turun Rooftop kapan saja!',
    },
    chitChatLines: [
      'Tekan Spasi atau klik gambar Lift/Tangga di dalam gedung untuk pindah lantai dengan cepat.',
      'Kamu juga bisa langsung klik tombol Lantai 1 / 2 / 3 / 4 di panel atas saat berada di dalam gedung!',
      'Panel kontrol Hotel Eksekutif ini terawat berkala setiap pagi.',
    ],
    secretLore: 'Rahasia Oki: Lift Menara Biner bisa melaju dari Lantai 1 ke Rooftop Lantai 4 dalam sekejap!',
  },
  b_gita: {
    id: 'b_gita',
    name: 'Gita Permata',
    role: 'Jurnalis Teknologi Harian Biner',
    homeRegion: 'Alun-Alun Air Mancur Neon',
    homeInterior: 'biner_mall_f1',
    baseX: 44.5,
    baseY: 30.2,
    patrolRadius: 2.6,
    favoriteCategory: 'Espresso / Stroberi',
    color: '#06b6d4',
    greetingsByChapter: {
      1: 'Permisi, wawancara singkat! Kamu petani terkenal dari Pulau TIK yang baru berlabuh ya?',
      2: 'Berita hangat: Krisis panas server Lab R&D menarik perhatian seluruh warga kota!',
      3: 'Headline hari ini: Petani Pulau TIK sukses bantu audit Menara Kuantum & Drone!',
      4: 'Kolom lingkungan besok bakal bahas taman hidroponik surya milikmu dan Tania!',
      5: 'Berita utama halaman depan: Aliansi Sejarah Pulau TIK dan Pulau Biner Resmi Dideklarasikan!',
    },
    chitChatLines: [
      'Saya menulis liputan harian tentang inovasi di Pulau Biner.',
      'Setiap kali kamu menyelesaikan misi Pulau Biner, beritanya langsung viral di seluruh kota!',
      'Jangan lupa mampir ke keempat gedung utama Pulau Biner ya!',
    ],
    secretLore: 'Rahasia Gita: Artikel paling banyak dibaca bulan ini adalah tentang Buah Purnama dari Pulau TIK.',
  },
  b_budi: {
    id: 'b_budi',
    name: 'Nakhoda Budi Hermawan',
    role: 'Kapten Ferri Eksekutif Biner',
    homeRegion: 'Dermaga Ferri Pulau Biner',
    homeInterior: 'biner_hotel_f1',
    baseX: 41.0,
    baseY: 44.2,
    patrolRadius: 1.8,
    favoriteCategory: 'Ikan / Tiket Ferri',
    color: '#1d4ed8',
    greetingsByChapter: {
      1: 'Selamat berlabuh di Pulau Biner! Klik kapal Ferri di dermaga atau bicara denganku kalau ingin berlayar pulang ke Pulau TIK!',
      2: 'Ferri siap berlayar pulang-pergi kapan saja selama punya tarif 150G, Tiket Ferri, atau Kartu VIP.',
      3: 'Gelombang laut hari ini tenang sekali—cocok untuk pelayaran cepat antarpulau.',
      4: 'Banyak warga Pulau Biner juga ingin berwisata ke air terjun Pulau TIK lho!',
      5: 'Dengan Kartu VIP Biner, kapal Ferri ini selalu terbuka gratis untukmu, Kapten Muda!',
    },
    chitChatLines: [
      'Punya Jimat Pulang Kilat juga bisa membawamu kembali ke kebun Pulau TIK dalam sekejap!',
      'Dermaga selatan Pulau Biner ini tersambung lurus dengan Boulevard Menara Biner.',
      'Jangan lupa memancing di perairan biru sekitar dermaga ini juga!',
    ],
    secretLore: 'Rahasia Nakhoda Budi: Aku dan Kapten Bima di Pulau TIK adalah sahabat lama sejak akademi pelayaran.',
  },
  b_rara: {
    id: 'b_rara',
    name: 'Rara Kirana',
    role: 'Manajer Hotel & Suite VIP',
    homeRegion: 'Hotel Eksekutif Biner Lt. 2',
    homeInterior: 'biner_hotel_f2',
    baseX: 59,
    baseY: 32,
    patrolRadius: 1.3,
    favoriteCategory: 'Bunga Matahari / Selai',
    color: '#f59e0b',
    greetingsByChapter: {
      1: 'Selamat datang di Suite VIP Hotel Biner! Klik ranjang hotel kalau butuh tidur dan memulihkan energi 100%!',
      2: 'Kamar VIP di Lantai 2 ini tenang dan jauh dari bising jalan raya.',
      3: 'Tidur di sini juga tetap menyiram kebun otomatis besok kalau cuaca hujan atau pakai Sprinkler di Pulau TIK!',
      4: 'Pelayanan terbaik selalu siap untuk tamu terhormat.',
      5: 'Status VIP Biner membuatmu disambut bak keluarga di Suite Hotel ini!',
    },
    chitChatLines: [
      'Ranjang hotel ini berfungsi seperti tempat tidur di Rumah Kebun—bisa memulihkan stamina & HP dan berganti hari!',
      'Di lantai 1 bawah ada ruang tunggu dan meja concierge bersama Oki.',
      'Minum Bar Nutrisi sebelum menjelajahi semua lantai menara.',
    ],
    secretLore: 'Rahasia Rara: Bantal hotel ini diisi serat alami yang diimpor dari desa Pulau TIK.',
  },
  b_yuda: {
    id: 'b_yuda',
    name: 'Prof. Yuda Pratama',
    role: 'Penasihat Etika AI & Satelit',
    homeRegion: 'Menara Kuantum Data Lt. 3',
    homeInterior: 'biner_quantum_f3',
    baseX: 58,
    baseY: 23,
    patrolRadius: 1.2,
    favoriteCategory: 'Kristal Bintang / Kopi',
    color: '#4338ca',
    greetingsByChapter: {
      1: 'Selamat datang di Dek Observasi Satelit Lantai 3 Menara Kuantum!',
      2: 'Dari lantai puncak menara ini kita memantau iklim seluruh kepulauan.',
      3: 'Etika teknologi memastikan AI membantu manusia bekerja lebih baik, bukan menggantikan kepedulian.',
      4: 'Sinergi antara alam Pulau TIK dan ilmu pengetahuan Pulau Biner sungguh mengagumkan!',
      5: 'Langit satelit cerah! Kini saatnya menuju Rooftop Menara Biner menemui CEO Hendra!',
    },
    chitChatLines: [
      'Teleskop satelit kami terhubung dengan catatan astronomi Tara di Mercusuar Pulau TIK!',
      'Seluruh 3 lantai Menara Kuantum bekerja harmonis 24 jam sehari.',
      'Gunakan Lift turun untuk kembali ke Divisi AI atau Lobi Pusat Data.',
    ],
    secretLore: 'Rahasia Prof. Yuda: Sinyal paling indah yang pernah ditangkap antena kami berasal dari nyanyian angin Pohon Cahaya.',
  },
};

export const ALL_NPCS: Record<NpcId, NpcConfig> = {
  ...NPCS,
  ...BINER_NPCS,
  ...JARINGAN_NPCS,
};

export function getBinerNpcExclusiveLocation(
  npcId: BinerNpcId,
  minuteOfDay: number,
  weather: Weather
): 'outdoor' | BinerInteriorId {
  // Always keep interior tower/mall/hotel specialists inside their respective skyscraper floors
  const alwaysIndoor: Partial<Record<BinerNpcId, BinerInteriorId>> = {
    b_hendra: 'biner_tower_f4',
    b_clara: 'biner_tower_f3',
    b_reno: 'biner_tower_f2',
    b_nadia: 'biner_tower_f1',
    b_rizal: 'biner_quantum_f1',
    b_aldi: 'biner_quantum_f2',
    b_yuda: 'biner_quantum_f3',
    b_kevin: 'biner_mall_f1',
    b_viona: 'biner_mall_f2',
    b_celine: 'biner_mall_f2',
    b_oki: 'biner_hotel_f1',
    b_rara: 'biner_hotel_f2',
  };
  if (alwaysIndoor[npcId]) return alwaysIndoor[npcId]!;

  // Outdoor city/park/harbor NPCs shelter inside lobbies during rain or late night (21:00+)
  const isLateNight = minuteOfDay >= 1260 || minuteOfDay < 330;
  if (weather === 'Hujan' || isLateNight) {
    return BINER_NPCS[npcId].homeInterior as BinerInteriorId;
  }
  return 'outdoor';
}

const TOWER_FLOORS: InteriorId[] = ['biner_tower_f1', 'biner_tower_f2', 'biner_tower_f3', 'biner_tower_f4'];
const QUANTUM_FLOORS: InteriorId[] = ['biner_quantum_f1', 'biner_quantum_f2', 'biner_quantum_f3'];
const MALL_FLOORS: InteriorId[] = ['biner_mall_f1', 'biner_mall_f2'];
const HOTEL_FLOORS: InteriorId[] = ['biner_hotel_f1', 'biner_hotel_f2'];

export const BINER_INTERIORS: Record<BinerInteriorId, InteriorDef> = {
  biner_tower_f1: {
    id: 'biner_tower_f1',
    title: 'Menara Biner Corp · Lt. 1 (Lobi Utama)',
    themeLabel: 'Lobi Marmer & Resepsionis Korporat',
    cols: 14,
    rows: 10,
    floorStyle: 'marble',
    wallColor: '#0f172a',
    wallAccent: '#06b6d4',
    exitTile: { x: 7, y: 9 },
    outdoorExit: { x: 41.0, y: 23.4 },
    residentNpc: 'b_nadia',
    residentPos: { x: 4.5, y: 3.3 },
    island: 'biner',
    buildingName: 'Menara Biner Corp',
    floorNumber: 1,
    totalFloors: 4,
    upFloor: 'biner_tower_f2',
    floorSiblings: TOWER_FLOORS,
    furniture: [
      { id: 'bt1_rug', kind: 'rug', name: 'Karpet Lobi Biner', x: 5, y: 5, w: 4, h: 3, walkable: true },
      { id: 'bt1_rec', kind: 'reception_desk', name: 'Meja Resepsionis Utama', x: 3, y: 2, w: 4, h: 1, interactAction: 'info', infoText: 'Resepsionis Menara Biner Corp: Gunakan Lift di sebelah kanan (x:11) untuk naik ke Lantai 2 (R&D), Lantai 3 (Direksi), dan Lantai 4 (Rooftop)!' },
      { id: 'bt1_sofa', kind: 'sofa_lounge', name: 'Sofa Ruang Tunggu VIP', x: 1, y: 5, w: 3, h: 2, interactAction: 'hay_rest' },
      { id: 'bt1_vend', kind: 'vending_machine', name: 'Mesin Minuman Otomatis', x: 9, y: 1, w: 2, h: 1, interactAction: 'biner_shop' },
      { id: 'bt1_up', kind: 'elevator_up', name: 'Lift Naik ke Lt. 2 (Lab R&D)', x: 11, y: 2, w: 2, h: 1, interactAction: 'elevator_up' },
      { id: 'bt1_p1', kind: 'plant', name: 'Tanaman Lobi', x: 1, y: 1, w: 1, h: 1, interactAction: 'water_plant' },
      { id: 'bt1_p2', kind: 'plant', name: 'Tanaman Lobi', x: 12, y: 6, w: 1, h: 1, interactAction: 'water_plant' },
    ],
  },
  biner_tower_f2: {
    id: 'biner_tower_f2',
    title: 'Menara Biner Corp · Lt. 2 (Lab R&D & Server)',
    themeLabel: 'Laboratorium Riset AI & Hardware',
    cols: 14,
    rows: 10,
    floorStyle: 'tech_lab',
    wallColor: '#1e1b4b',
    wallAccent: '#38bdf8',
    exitTile: { x: 7, y: 9 },
    outdoorExit: { x: 41.0, y: 23.4 },
    residentNpc: 'b_reno',
    residentPos: { x: 5.5, y: 4.5 },
    island: 'biner',
    buildingName: 'Menara Biner Corp',
    floorNumber: 2,
    totalFloors: 4,
    upFloor: 'biner_tower_f3',
    downFloor: 'biner_tower_f1',
    floorSiblings: TOWER_FLOORS,
    furniture: [
      { id: 'bt2_srv1', kind: 'server_rack', name: 'Rak Server Kuantum A', x: 1, y: 1, w: 2, h: 2, interactAction: 'info', infoText: 'Rak Server Lab R&D — memproses simulasi AI dan data iklim.' },
      { id: 'bt2_srv2', kind: 'server_rack', name: 'Rak Server Kuantum B', x: 4, y: 1, w: 2, h: 2, interactAction: 'info', infoText: 'Sistem pendingin cair aktif menjaga suhu prosesor tetap stabil.' },
      { id: 'bt2_term', kind: 'cyber_terminal', name: 'Terminal Rakit Teknologi Biner', x: 3, y: 5, w: 3, h: 1, interactAction: 'biner_craft' },
      { id: 'bt2_dn', kind: 'elevator_down', name: 'Lift Turun ke Lt. 1 (Lobi)', x: 9, y: 2, w: 2, h: 1, interactAction: 'elevator_down' },
      { id: 'bt2_up', kind: 'elevator_up', name: 'Lift Naik ke Lt. 3 (Direksi)', x: 11, y: 2, w: 2, h: 1, interactAction: 'elevator_up' },
      { id: 'bt2_cof', kind: 'coffee_machine', name: 'Mesin Kopi Lab R&D', x: 10, y: 6, w: 2, h: 1, interactAction: 'biner_shop' },
    ],
  },
  biner_tower_f3: {
    id: 'biner_tower_f3',
    title: 'Menara Biner Corp · Lt. 3 (Kantor Direksi)',
    themeLabel: 'Ruang Rapat Eksekutif & VP',
    cols: 14,
    rows: 10,
    floorStyle: 'exec_wood',
    wallColor: '#312e81',
    wallAccent: '#facc15',
    exitTile: { x: 7, y: 9 },
    outdoorExit: { x: 41.0, y: 23.4 },
    residentNpc: 'b_clara',
    residentPos: { x: 4.5, y: 3.2 },
    island: 'biner',
    buildingName: 'Menara Biner Corp',
    floorNumber: 3,
    totalFloors: 4,
    upFloor: 'biner_tower_f4',
    downFloor: 'biner_tower_f2',
    floorSiblings: TOWER_FLOORS,
    furniture: [
      { id: 'bt3_rug', kind: 'rug', name: 'Karpet Direksi', x: 3, y: 4, w: 6, h: 3, walkable: true },
      { id: 'bt3_desk', kind: 'exec_desk', name: 'Meja Kerja VP Clara', x: 2, y: 2, w: 3, h: 1, interactAction: 'journal' },
      { id: 'bt3_conf', kind: 'conference_table', name: 'Meja Rapat Dewan Direksi', x: 4, y: 5, w: 4, h: 2, interactAction: 'info', infoText: 'Ruang Rapat Direksi Biner Corp tempat aliansi Pulau TIK–Biner dirancang.' },
      { id: 'bt3_dn', kind: 'elevator_down', name: 'Lift Turun ke Lt. 2', x: 9, y: 2, w: 2, h: 1, interactAction: 'elevator_down' },
      { id: 'bt3_up', kind: 'elevator_up', name: 'Lift Naik ke Lt. 4 (Rooftop)', x: 11, y: 2, w: 2, h: 1, interactAction: 'elevator_up' },
      { id: 'bt3_p1', kind: 'plant', name: 'Tanaman Eksekutif', x: 1, y: 6, w: 1, h: 1, interactAction: 'water_plant' },
    ],
  },
  biner_tower_f4: {
    id: 'biner_tower_f4',
    title: 'Menara Biner Corp · Lt. 4 (Rooftop Helipad)',
    themeLabel: 'Puncak Gedung & Lounge CEO',
    cols: 14,
    rows: 10,
    floorStyle: 'rooftop',
    wallColor: '#0f172a',
    wallAccent: '#38bdf8',
    exitTile: { x: 7, y: 9 },
    outdoorExit: { x: 41.0, y: 23.4 },
    residentNpc: 'b_hendra',
    residentPos: { x: 5.5, y: 3.2 },
    island: 'biner',
    buildingName: 'Menara Biner Corp',
    floorNumber: 4,
    totalFloors: 4,
    downFloor: 'biner_tower_f3',
    floorSiblings: TOWER_FLOORS,
    furniture: [
      { id: 'bt4_heli', kind: 'helipad_pad', name: 'Helipad Puncak Menara Biner', x: 3, y: 4, w: 4, h: 3, walkable: true },
      { id: 'bt4_scope', kind: 'telescope', name: 'Teleskop Panorama Kota Biner', x: 1, y: 2, w: 2, h: 2, interactAction: 'telescope' },
      { id: 'bt4_sofa', kind: 'sofa_lounge', name: 'Lounge Rooftop CEO', x: 9, y: 5, w: 3, h: 2, interactAction: 'hay_rest' },
      { id: 'bt4_dn', kind: 'elevator_down', name: 'Lift Turun ke Lt. 3 (Direksi)', x: 11, y: 2, w: 2, h: 1, interactAction: 'elevator_down' },
      { id: 'bt4_lamp', kind: 'beacon_lamp', name: 'Lampu Suar Puncak Menara', x: 6, y: 1, w: 2, h: 1, interactAction: 'beacon' },
    ],
  },
  biner_quantum_f1: {
    id: 'biner_quantum_f1',
    title: 'Menara Kuantum Data · Lt. 1 (Pusat Data)',
    themeLabel: 'Pusat Keamanan & Server Utama',
    cols: 14,
    rows: 10,
    floorStyle: 'tech_lab',
    wallColor: '#1e293b',
    wallAccent: '#22c55e',
    exitTile: { x: 7, y: 9 },
    outdoorExit: { x: 58.5, y: 23.4 },
    residentNpc: 'b_rizal',
    residentPos: { x: 4.5, y: 3.4 },
    island: 'biner',
    buildingName: 'Menara Kuantum Data',
    floorNumber: 1,
    totalFloors: 3,
    upFloor: 'biner_quantum_f2',
    floorSiblings: QUANTUM_FLOORS,
    furniture: [
      { id: 'bq1_srv1', kind: 'server_rack', name: 'Rak Keamanan Siber A', x: 1, y: 1, w: 2, h: 2, interactAction: 'info', infoText: 'Firewall Kuantum aktif menjaga lalu lintas data Pulau Biner.' },
      { id: 'bq1_term', kind: 'cyber_terminal', name: 'Terminal Rakit Teknologi', x: 3, y: 5, w: 3, h: 1, interactAction: 'biner_craft' },
      { id: 'bq1_rec', kind: 'reception_desk', name: 'Meja Kontrol Keamanan', x: 5, y: 2, w: 3, h: 1, interactAction: 'info', infoText: 'Gunakan Lift untuk naik ke Divisi AI (Lt. 2) & Dek Satelit (Lt. 3).' },
      { id: 'bq1_up', kind: 'elevator_up', name: 'Lift Naik ke Lt. 2 (Divisi AI)', x: 11, y: 2, w: 2, h: 1, interactAction: 'elevator_up' },
      { id: 'bq1_vend', kind: 'vending_machine', name: 'Mesin Energi Teknisi', x: 10, y: 6, w: 2, h: 1, interactAction: 'biner_shop' },
    ],
  },
  biner_quantum_f2: {
    id: 'biner_quantum_f2',
    title: 'Menara Kuantum Data · Lt. 2 (Divisi AI)',
    themeLabel: 'Analitik Big Data & Kecerdasan Buatan',
    cols: 14,
    rows: 10,
    floorStyle: 'tech_lab',
    wallColor: '#312e81',
    wallAccent: '#a855f7',
    exitTile: { x: 7, y: 9 },
    outdoorExit: { x: 58.5, y: 23.4 },
    residentNpc: 'b_aldi',
    residentPos: { x: 5.5, y: 3.5 },
    island: 'biner',
    buildingName: 'Menara Kuantum Data',
    floorNumber: 2,
    totalFloors: 3,
    upFloor: 'biner_quantum_f3',
    downFloor: 'biner_quantum_f1',
    floorSiblings: QUANTUM_FLOORS,
    furniture: [
      { id: 'bq2_term1', kind: 'cyber_terminal', name: 'Konsol Analitik Big Data', x: 2, y: 2, w: 3, h: 1, interactAction: 'biner_craft' },
      { id: 'bq2_srv', kind: 'server_rack', name: 'Cluster Neural Network', x: 1, y: 5, w: 2, h: 2, interactAction: 'info', infoText: 'Cluster AI menganalisis pola panen & cuaca kedua pulau.' },
      { id: 'bq2_conf', kind: 'conference_table', name: 'Meja Riset Algoritma', x: 5, y: 5, w: 4, h: 2, interactAction: 'journal' },
      { id: 'bq2_dn', kind: 'elevator_down', name: 'Lift Turun ke Lt. 1', x: 9, y: 2, w: 2, h: 1, interactAction: 'elevator_down' },
      { id: 'bq2_up', kind: 'elevator_up', name: 'Lift Naik ke Lt. 3 (Dek Satelit)', x: 11, y: 2, w: 2, h: 1, interactAction: 'elevator_up' },
    ],
  },
  biner_quantum_f3: {
    id: 'biner_quantum_f3',
    title: 'Menara Kuantum Data · Lt. 3 (Dek Satelit)',
    themeLabel: 'Observatorium Antariksa & Etika AI',
    cols: 14,
    rows: 10,
    floorStyle: 'rooftop',
    wallColor: '#1e1b4b',
    wallAccent: '#facc15',
    exitTile: { x: 7, y: 9 },
    outdoorExit: { x: 58.5, y: 23.4 },
    residentNpc: 'b_yuda',
    residentPos: { x: 5.0, y: 3.5 },
    island: 'biner',
    buildingName: 'Menara Kuantum Data',
    floorNumber: 3,
    totalFloors: 3,
    downFloor: 'biner_quantum_f2',
    floorSiblings: QUANTUM_FLOORS,
    furniture: [
      { id: 'bq3_scope', kind: 'telescope', name: 'Teleskop Satelit Iklim', x: 2, y: 2, w: 2, h: 2, interactAction: 'telescope' },
      { id: 'bq3_lamp', kind: 'beacon_lamp', name: 'Pemancar Sinyal Kuantum', x: 6, y: 1, w: 2, h: 1, interactAction: 'beacon' },
      { id: 'bq3_map', kind: 'nav_table', name: 'Peta Jaringan Satelit', x: 5, y: 5, w: 3, h: 2, interactAction: 'map' },
      { id: 'bq3_dn', kind: 'elevator_down', name: 'Lift Turun ke Lt. 2', x: 11, y: 2, w: 2, h: 1, interactAction: 'elevator_down' },
    ],
  },
  biner_mall_f1: {
    id: 'biner_mall_f1',
    title: 'Mal & Kafe Siber · Lt. 1 (Toko Modern)',
    themeLabel: 'Kafe Espresso & Toko Teknologi Biner',
    cols: 14,
    rows: 10,
    floorStyle: 'marble',
    wallColor: '#831843',
    wallAccent: '#f472b6',
    exitTile: { x: 7, y: 9 },
    outdoorExit: { x: 22.5, y: 32.4 },
    residentNpc: 'b_kevin',
    residentPos: { x: 4.5, y: 3.3 },
    island: 'biner',
    buildingName: 'Mal & Kafe Siber',
    floorNumber: 1,
    totalFloors: 2,
    upFloor: 'biner_mall_f2',
    floorSiblings: MALL_FLOORS,
    furniture: [
      { id: 'bm1_cnt', kind: 'counter', name: 'Kasir Kafe Siber & Tech Store', x: 2, y: 2, w: 4, h: 1, interactAction: 'biner_shop' },
      { id: 'bm1_cof', kind: 'coffee_machine', name: 'Mesin Espresso Barista', x: 7, y: 1, w: 2, h: 1, interactAction: 'biner_shop' },
      { id: 'bm1_vend', kind: 'vending_machine', name: 'Etalase Gadget & Chip', x: 1, y: 5, w: 2, h: 1, interactAction: 'biner_shop' },
      { id: 'bm1_sofa', kind: 'sofa_lounge', name: 'Meja Santai Kafe', x: 9, y: 5, w: 3, h: 2, interactAction: 'eat_table' },
      { id: 'bm1_up', kind: 'elevator_up', name: 'Eskalator Naik ke Lt. 2 (Co-Working)', x: 11, y: 2, w: 2, h: 1, interactAction: 'elevator_up' },
    ],
  },
  biner_mall_f2: {
    id: 'biner_mall_f2',
    title: 'Mal & Kafe Siber · Lt. 2 (Co-Working Hub)',
    themeLabel: 'Pusat Startup & Inovasi Kreatif',
    cols: 14,
    rows: 10,
    floorStyle: 'exec_wood',
    wallColor: '#4c1d95',
    wallAccent: '#ec4899',
    exitTile: { x: 7, y: 9 },
    outdoorExit: { x: 22.5, y: 32.4 },
    residentNpc: 'b_viona',
    residentPos: { x: 4.5, y: 3.5 },
    island: 'biner',
    buildingName: 'Mal & Kafe Siber',
    floorNumber: 2,
    totalFloors: 2,
    downFloor: 'biner_mall_f1',
    floorSiblings: MALL_FLOORS,
    furniture: [
      { id: 'bm2_term', kind: 'cyber_terminal', name: 'Meja Rakit Startup & Tech', x: 2, y: 2, w: 3, h: 1, interactAction: 'biner_craft' },
      { id: 'bm2_conf', kind: 'conference_table', name: 'Meja Pitching Investor', x: 5, y: 5, w: 4, h: 2, interactAction: 'info', infoText: 'Para pendiri startup berdiskusi mengembangkan teknologi hijau bersama Celine & Viona.' },
      { id: 'bm2_sofa', kind: 'sofa_lounge', name: 'Area Lounge Kreatif', x: 1, y: 5, w: 3, h: 2, interactAction: 'hay_rest' },
      { id: 'bm2_dn', kind: 'elevator_down', name: 'Eskalator Turun ke Lt. 1 (Kafe)', x: 11, y: 2, w: 2, h: 1, interactAction: 'elevator_down' },
    ],
  },
  biner_hotel_f1: {
    id: 'biner_hotel_f1',
    title: 'Hotel Eksekutif Biner · Lt. 1 (Lobi Hotel)',
    themeLabel: 'Resepsionis & Lounge Tamu Eksekutif',
    cols: 14,
    rows: 10,
    floorStyle: 'marble',
    wallColor: '#78350f',
    wallAccent: '#facc15',
    exitTile: { x: 7, y: 9 },
    outdoorExit: { x: 59.5, y: 32.4 },
    residentNpc: 'b_oki',
    residentPos: { x: 4.5, y: 3.3 },
    island: 'biner',
    buildingName: 'Hotel Eksekutif Biner',
    floorNumber: 1,
    totalFloors: 2,
    upFloor: 'biner_hotel_f2',
    floorSiblings: HOTEL_FLOORS,
    furniture: [
      { id: 'bh1_rug', kind: 'rug', name: 'Karpet Emas Hotel', x: 4, y: 4, w: 5, h: 3, walkable: true },
      { id: 'bh1_rec', kind: 'reception_desk', name: 'Meja Concierge Hotel', x: 3, y: 2, w: 4, h: 1, interactAction: 'info', infoText: 'Naik ke Lantai 2 untuk beristirahat di Suite VIP dan memulihkan tenaga 100%!' },
      { id: 'bh1_sofa', kind: 'sofa_lounge', name: 'Sofa Lobi Hotel', x: 9, y: 5, w: 3, h: 2, interactAction: 'hay_rest' },
      { id: 'bh1_up', kind: 'elevator_up', name: 'Lift Naik ke Lt. 2 (Suite VIP)', x: 11, y: 2, w: 2, h: 1, interactAction: 'elevator_up' },
    ],
  },
  biner_hotel_f2: {
    id: 'biner_hotel_f2',
    title: 'Hotel Eksekutif Biner · Lt. 2 (Suite VIP)',
    themeLabel: 'Kamar Istirahat & Pemulihan Energi',
    cols: 14,
    rows: 10,
    floorStyle: 'exec_wood',
    wallColor: '#451a03',
    wallAccent: '#fbbf24',
    exitTile: { x: 7, y: 9 },
    outdoorExit: { x: 59.5, y: 32.4 },
    residentNpc: 'b_rara',
    residentPos: { x: 8.5, y: 3.3 },
    island: 'biner',
    buildingName: 'Hotel Eksekutif Biner',
    floorNumber: 2,
    totalFloors: 2,
    downFloor: 'biner_hotel_f1',
    floorSiblings: HOTEL_FLOORS,
    furniture: [
      { id: 'bh2_bed', kind: 'bed', name: 'Ranjang Suite VIP (Tidur / Besok)', x: 2, y: 2, w: 2, h: 2, interactAction: 'sleep' },
      { id: 'bh2_sofa', kind: 'sofa_lounge', name: 'Sofa Pemulihan Energi VIP', x: 9, y: 5, w: 3, h: 2, interactAction: 'hotel_rest' },
      { id: 'bh2_tv', kind: 'tv', name: 'Smart TV Berita Biner', x: 6, y: 1, w: 2, h: 1, interactAction: 'tv_weather' },
      { id: 'bh2_dn', kind: 'elevator_down', name: 'Lift Turun ke Lt. 1 (Lobi)', x: 11, y: 2, w: 2, h: 1, interactAction: 'elevator_down' },
    ],
  },
};

export const ALL_INTERIORS: Record<InteriorId, InteriorDef> = {
  ...INTERIORS,
  ...BINER_INTERIORS,
  ...JARINGAN_INTERIORS,
};

export function createInitialBinerGrid(): FarmTile[] {
  const tiles: FarmTile[] = [];
  const land: boolean[][] = Array.from({ length: BINER_ROWS }, () => Array(BINER_COLS).fill(false));

  // Large organic-modern corporate metropolis island (x: 4..79, y: 4..45)
  for (let y = 3; y < BINER_ROWS - 3; y++) {
    for (let x = 3; x < BINER_COLS - 3; x++) {
      const wobble = Math.sin(x * 0.25 + y * 0.2) * 0.08 + Math.cos(y * 0.35) * 0.05;
      const dx = (x - 41.5) / 36.5;
      const dy = (y - 24.5) / 20.5;
      const inHarborNotch = y >= 43 && x >= 35 && x <= 49;
      if (!inHarborNotch && Math.hypot(dx, dy) + wobble <= 1.0) {
        land[y][x] = true;
      }
    }
  }

  // Ensure crisp rectangular foundation pads for all city blocks
  for (let y = 10; y <= 41; y++) {
    for (let x = 9; x <= 75; x++) {
      land[y][x] = true;
    }
  }

  const isNearOcean = (x: number, y: number) => {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= BINER_COLS || ny < 0 || ny >= BINER_ROWS || !land[ny][nx]) return true;
      }
    }
    return false;
  };

  for (let y = 0; y < BINER_ROWS; y++) {
    for (let x = 0; x < BINER_COLS; x++) {
      let kind: TileKind = 'ocean';

      if (land[y][x]) {
        kind = isNearOcean(x, y) || y >= 41 ? 'sand' : 'corp_lawn';

        // City Sidewalk Core Districts
        if (x >= 13 && x <= 71 && y >= 13 && y <= 38) {
          kind = 'sidewalk';
        }

        // Green Corporate Parks & Median Gardens
        if ((x >= 66 && x <= 74 && y >= 15 && y <= 24) || (x >= 10 && x <= 17 && y >= 26 && y <= 35)) {
          kind = 'corp_lawn';
        }
        if (x >= 35 && x <= 47 && y >= 27 && y <= 33) {
          kind = 'plaza';
        }

        // Multi-lane Modern Asphalt Avenues (Closed Rectangular City Grid strictly inside [18..65] x [14..36])
        const isHorizontalRoad =
          x >= 18 &&
          x <= 65 &&
          (y === 14 || y === 15 || y === 24 || y === 25 || y === 35 || y === 36);
        const isVerticalRoad =
          y >= 14 &&
          y <= 36 &&
          (x === 18 || x === 19 || x === 28 || x === 29 || x === 52 || x === 53 || x === 64 || x === 65);
        if (isHorizontalRoad || isVerticalRoad) {
          kind = 'asphalt';
        }
        if ((x === 40 || x === 41 || x === 42) && y >= 37 && y <= 44) {
          kind = 'sidewalk';
        }

        // Zebra Crosswalks at key intersections & pedestrian walkways
        if (
          ((x === 40 || x === 41 || x === 42) && (y === 24 || y === 25 || y === 35 || y === 36)) ||
          ((x === 22 || x === 23) && (y === 24 || y === 25 || y === 35 || y === 36)) ||
          ((x === 58 || x === 59) && (y === 24 || y === 25 || y === 35 || y === 36)) ||
          ((x === 18 || x === 19 || x === 28 || x === 29 || x === 52 || x === 53) && (y === 29 || y === 30)) ||
          ((x === 18 || x === 19) && (y === 19 || y === 20))
        ) {
          kind = 'crosswalk';
        }
      }

      // Harbor Ferry Pier & Docked Ferry Boat
      if (x >= 40 && x <= 42 && y >= 43 && y <= 49) kind = 'pier';
      if (x >= 43 && x <= 47 && y >= 46 && y <= 48) kind = 'biner_ferry';

      // Enterable Modern Multi-Floor Buildings & City Landmarks
      if (x >= 38 && x <= 43 && y >= 17 && y <= 22) kind = 'biner_tower';
      else if (x >= 56 && x <= 60 && y >= 17 && y <= 22) kind = 'biner_quantum';
      else if (x >= 20 && x <= 24 && y >= 27 && y <= 31) kind = 'biner_mall';
      else if (x >= 57 && x <= 61 && y >= 27 && y <= 31) kind = 'biner_hotel';
      else if (x >= 40 && x <= 42 && y >= 29 && y <= 31) kind = 'fountain';
      else if (x >= 13 && x <= 17 && y >= 17 && y <= 21) kind = 'helipad_tile';
      else if (
        x >= 67 &&
        x <= 73 &&
        (y === 17 || y === 19 || y === 21) &&
        x % 2 === 1
      ) {
        kind = 'solar_panel';
      } else if (
        ((x === 33 || x === 49 || x === 63) && (y === 23 || y === 34)) ||
        ((x === 39 || x === 43) && y === 42)
      ) {
        kind = 'street_lamp';
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
        debris: null,
        crop: null,
      });
    }
  }

  return tiles;
}

export function createInitialBinerTrees(tiles: FarmTile[]): WorldTree[] {
  const trees: WorldTree[] = [];
  let seq = 1;
  for (let y = 5; y < BINER_ROWS - 6; y++) {
    for (let x = 5; x < BINER_COLS - 5; x++) {
      const t = tiles[y * BINER_COLS + x];
      if (!t) continue;
      if (t.kind !== 'corp_lawn' && t.kind !== 'sand') continue;
      // Avoid solar panels & roads
      let blocked = false;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nt = tiles[(y + dy) * BINER_COLS + (x + dx)];
          if (!nt || (nt.kind !== 'corp_lawn' && nt.kind !== 'sand' && nt.kind !== 'ocean')) {
            blocked = true;
          }
        }
      }
      if (blocked) continue;
      if ((x * 53 + y * 89) % 100 < 9) {
        trees.push({
          id: `btree_${seq++}`,
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
